import {test, expect} from "@playwright/test";
import {readdirSync} from "node:fs";
import {join} from "node:path";
// O MESMO dado que o gerador consome (ADR-0001, Fase 7). Um gate que declarasse suas próprias
// seções seria um segundo modelo escondido — e é a divergência que o achado I2 mediu.
import {allowed, required, SELECTOR, pageType} from "../../scripts/page-model.mjs";
import {esperarTransicoes} from "./esperar-transicoes";
import {abrir} from "./abrir-pagina";

// VARREDURA de TODAS as páginas do catálogo. O gate de screenshot cobre uma página por TIPO; a
// auditoria de 26/07/2026 provou que isso não basta — rolagem lateral em 320px, violação de
// axe, salto de heading e 404 de sprite existiam em páginas não amostradas, com os 60 testes
// visuais passando. Aqui não há baseline: são propriedades que TODA página tem de cumprir.
//
// Um teste varre TODAS as páginas e falha com a lista inteira. O contrário (um teste por
// página) daria 1.183 testes e um relatório ilegível — o que interessa é "quais páginas".
const DIR = join(process.cwd(), "apps/catalog");
// Os previews que moram em documento próprio (embeds/, hoje só o AppShell) são páginas de
// verdade e passam pelos MESMOS gates — não ser item do catálogo não é desculpa para não ser
// varrido. O que eles não têm é modelo de página: `pageType` devolve null para eles.
const PAGES = [...readdirSync(DIR).filter(f => f.endsWith(".html")).sort(),
  ...readdirSync(join(DIR, "embeds")).filter(f => f.endsWith(".html")).sort().map(f => `embeds/${f}`)];
const url = (f: string) => `/apps/catalog/${f}`;
// A queda do WebKit que `abrir` repete fica escrita no relatório e no log — para se medir.
const avisar = (texto: string) => {
  test.info().annotations.push({type: "queda-do-webkit", description: texto});
  console.log(`::warning::${texto}`);
};

// A escala de pontos de quebra travada pelo gate do projeto, mais os dois extremos reais de celular.
const WIDTHS = [320, 375, 640, 768, 1024, 1280, 1536];
const AXE = join(process.cwd(), "node_modules/.pnpm/axe-core@4.10.2/node_modules/axe-core/axe.min.js");

test.describe("catálogo · varredura de todas as páginas", () => {
  test.describe.configure({timeout: 15 * 60 * 1000});

  test("nenhuma página rola de lado, em nenhuma largura", async ({page}) => {
    const falhas: string[] = [];
    for (const f of PAGES) {
      await abrir(page, url(f), avisar);
      for (const width of WIDTHS) {
        await page.setViewportSize({width, height: 900});
        const over = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (over > 0) falhas.push(`${f} @${width}px: +${over}px`);
      }
    }
    expect(falhas, `páginas com rolagem lateral:\n${falhas.join("\n")}`).toEqual([]);
  });

  // O IRMÃO VERTICAL do teste acima, e ele nasceu de um defeito que passou porque ninguém media:
  // a caixa de demonstração tem altura FIXA (ADR-0002), e a decisão lista como consequência boa
  // que *"nenhuma demo exige rolagem"*. Medido em 11/08/2026, **10 das 520** caixas rolavam — duas
  // por CSS (`.media-player` tem `aspect-ratio:16/9`, que dá 464px na largura do painel), uma por
  // grid colapsado (`.health-matrix` sem largura vira uma coluna) e sete por conteúdo alto demais.
  //
  // A regra que o gate cobra é a da ADR: quem cede é o CONTEÚDO, nunca a altura da caixa. Por isso
  // ele mede `scrollHeight > clientHeight` no `.demo-panel` — o mesmo sinal que o navegador usa
  // para decidir se põe barra —, e não a altura contra um número escrito aqui, que envelheceria
  // na primeira mudança de densidade.
  //
  // 1440×761 é a régua registrada: é onde o `clamp` da altura bate no piso, ou seja, o pior caso.
  test("nenhuma prévia do catálogo rola dentro da caixa", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 761});
    const falhas: string[] = [];
    for (const f of PAGES) {
      await abrir(page, url(f), avisar);
      const caixas = await page.evaluate(() => [...document.querySelectorAll(".demo-panel")]
        .map((el, i) => ({i, excesso: el.scrollHeight - el.clientHeight,
          conteudo: Math.round(el.firstElementChild?.getBoundingClientRect().height ?? 0)}))
        .filter(c => c.excesso > 1));
      for (const c of caixas)
        falhas.push(`${f} [caixa ${c.i}]: conteúdo ${c.conteudo}px, sobra ${c.excesso}px além da caixa`);
    }
    expect(falhas, `prévias que exigem rolagem (ADR-0002 diz que nenhuma deve):\n${falhas.join("\n")}`).toEqual([]);
  });

  // A prévia é uma AMOSTRA dentro de uma caixa, nunca um estado da página. O `CommandPaletteShell`
  // provou que a distinção não era óbvia: a `.command-overlay` é `position:fixed; inset:0;
  // z-index:var(--z-modal)`, então sem bloco contentor ela resolvia contra o VIEWPORT — o preview
  // cobria a página inteira, com scrim e blur, e como o HTML é estático não havia estado nenhum
  // para fechá-la. A página do componente ficava impossível de usar (relatado em 13/08/2026).
  //
  // O gate cobra o EFEITO, não a propriedade: `position:fixed` continua legítimo dentro de uma
  // prévia desde que alguém o contenha — e é assim que o conserto ficou. O que não pode é a
  // amostra virar a página. Por isso a régua é geométrica: nada que nasce numa prévia pode tapar
  // o viewport. Provado contra o defeito — sem o `transform` que cria o bloco contentor, este
  // teste reprova `commandpaletteshell.html`.
  test("nenhuma prévia cobre a página", async ({page}) => {
    await page.setViewportSize({width: 1280, height: 720});
    const falhas: string[] = [];
    for (const f of PAGES) {
      await abrir(page, url(f), avisar);
      const presos = await page.evaluate(() => {
        const vp = {w: innerWidth, h: innerHeight};
        const achados: {painel: number; classe: string; w: number; h: number}[] = [];
        document.querySelectorAll(".demo-panel").forEach((painel, i) => {
          painel.querySelectorAll("*").forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width >= vp.w * 0.9 && r.height >= vp.h * 0.9)
              achados.push({painel: i, classe: (el.className || el.tagName).toString(),
                w: Math.round(r.width), h: Math.round(r.height)});
          });
        });
        return achados;
      });
      for (const p of presos)
        falhas.push(`${f} [caixa ${p.painel}]: .${p.classe} mede ${p.w}×${p.h} e engole o viewport`);
    }
    expect(falhas, `prévias que deixaram de ser amostra e viraram a página:\n${falhas.join("\n")}`).toEqual([]);
  });

  // WCAG 1.4.4 (resize text): dobrar o tamanho da fonte não pode fazer a página rolar de lado.
  // A varredura de largura acima NÃO cobre isso — ela mexe no viewport, e texto a 200% aumenta
  // o CONTEÚDO com o viewport parado. Era o achado M12: +27px em toda página, porque o
  // `flex-wrap` do topo vivia dentro de um @media e nunca disparava. E a causa raiz que a
  // auditoria supôs (mistura px/rem) não era essa — foi medida em 30/07/2026.
  test("texto a 200% não faz nenhuma página rolar de lado", async ({page}) => {
    const falhas: string[] = [];
    await page.setViewportSize({width: 1280, height: 900});
    for (const f of PAGES) {
      await abrir(page, url(f), avisar);
      const over = await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px"; // 200% de 16px
        const x = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        document.documentElement.style.fontSize = "";
        return x;
      });
      if (over > 0) falhas.push(`${f}: +${over}px com texto a 200%`);
    }
    expect(falhas, "páginas que rolam de lado com texto a 200%:\n" + falhas.join("\n")).toEqual([]);
  });

  // O modelo de página, cobrado em todas. O gerador já morre se faltar seção obrigatória, mas ele
  // olha uma string: quem prova que a seção EXISTE no documento renderizado é o navegador — e só
  // aqui dá para cobrar a outra metade, que é não haver seção FORA do modelo. Sem isso a ADR-0001
  // seria decoração, e um quinto modelo de página nasceria pelo caminho de menor resistência,
  // exatamente como os quatro que a auditoria mediu.
  test("cada página tem as seções do seu tipo, e nenhuma além", async ({page}) => {
    const falhas: string[] = [];
    for (const f of PAGES) {
      const tipo = pageType(f);
      if (!tipo) continue;                     // índice de área não é item (ADR-0001)
      await abrir(page, url(f), avisar);
      for (const secao of required(tipo)) {
        if (await page.locator(SELECTOR[secao]).count() === 0) {
          falhas.push(`${f} (${tipo}): falta a seção "${secao}" (${SELECTOR[secao]})`);
        }
      }
      const emitidas = await page.evaluate(() =>
        [...document.querySelectorAll(".page-main > section[id]")].map(s => s.id));
      for (const id of emitidas) {
        if (!allowed(tipo).includes(id)) falhas.push(`${f} (${tipo}): seção fora do modelo: #${id}`);
      }
    }
    expect(falhas, `modelo de página violado:\n${falhas.join("\n")}`).toEqual([]);
  });

  // O conteúdo vem PRIMEIRO no celular. O gate de rolagem lateral passava com a lateral
  // empilhada acima do conteúdo — nada estourava, e para ler a documentação de um componente
  // era preciso rolar por 65 itens de navegação (achado A8). Isto mede o que aquele gate não
  // media: onde o objetivo da página começa. O comportamento da gaveta está em shell-nav.spec.
  test("em 375px o h1 de toda página cabe na primeira tela", async ({page}) => {
    const falhas: string[] = [];
    await page.setViewportSize({width: 375, height: 812});
    for (const f of PAGES) {
      await abrir(page, url(f), avisar);
      const y = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        return h1 ? Math.round(h1.getBoundingClientRect().top + scrollY) : null;
      });
      if (y === null) falhas.push(`${f}: sem h1`);
      else if (y >= 812) falhas.push(`${f}: o h1 começa a ${y}px — ${(y / 812).toFixed(1)} telas abaixo`);
    }
    expect(falhas, `páginas cujo conteúdo não começa na primeira tela:\n${falhas.join("\n")}`).toEqual([]);
  });

  test("hierarquia de títulos: um h1, sem salto de nível", async ({page}) => {
    const falhas: string[] = [];
    for (const f of PAGES) {
      await abrir(page, url(f), avisar);
      const problema = await page.evaluate(() => {
        const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h => +h.tagName[1]);
        const h1 = hs.filter(n => n === 1).length;
        if (h1 !== 1) return `${h1} h1 na página`;
        for (let i = 1; i < hs.length; i++) {
          if (hs[i] - hs[i - 1] > 1) return `salto h${hs[i - 1]} → h${hs[i]}`;
        }
        return null;
      });
      if (problema) falhas.push(`${f}: ${problema}`);
    }
    expect(falhas, `hierarquia inválida:\n${falhas.join("\n")}`).toEqual([]);
  });

  test("console limpo e nenhum recurso 4xx/5xx", async ({page}) => {
    const falhas: string[] = [];
    page.on("pageerror", e => falhas.push(`JS: ${e.message}`));
    // "Failed to load resource" SAI da escuta de console, e a razão é medida, não conveniência.
    // O Chromium pede `/favicon.ico` sozinho em toda sessão de navegador — a página não pede
    // nada —, o servidor devolve 404, e isso vira UM erro de console atribuído a quem passar
    // primeiro na varredura. Em 29/08/2026 era o `accessgate.html`, que é o primeiro em ordem
    // alfabética: acusação contra uma página que não tem defeito nenhum.
    // Tirar isso não abre buraco, e foi medido antes de escrever: um 404 PEDIDO PELA PÁGINA
    // (`<img src="nao-existe.png">`) dispara os DOIS eventos — o de console e o de resposta —,
    // e o de resposta é o que fica, com a URL junto. A varredura continua reprovando recurso
    // que falta; o que ela para de reprovar é o pedido que o navegador faz por conta própria.
    page.on("console", m => {
      if (m.type() !== "error") return;
      if (m.text().startsWith("Failed to load resource")) return;
      falhas.push(`console: ${m.text().slice(0, 80)}`);
    });
    page.on("response", r => { if (r.status() >= 400) falhas.push(`${r.status()}: ${r.url()}`); });
    for (const f of PAGES) {
      const antes = falhas.length;
      await abrir(page, url(f), avisar);
      await page.waitForTimeout(60);
      for (let i = antes; i < falhas.length; i++) falhas[i] = `${f} → ${falhas[i]}`;
    }
    expect([...new Set(falhas)], `erros de página:\n${[...new Set(falhas)].join("\n")}`).toEqual([]);
  });

  for (const theme of ["dark", "light"] as const) {
    test(`axe sem violação em todas as páginas · tema ${theme}`, async ({page}) => {
      const falhas: string[] = [];
      for (const f of PAGES) {
        await abrir(page, url(f), avisar);
        if (theme === "light") {
          await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
          // a transição de cor do core interpola; medir antes de ela TERMINAR lê cor
          // intermediária e inventa violação de contraste que não existe. Tempo fixo não serve:
          // na CI do pedido #23 o WebKit passou dos 250ms (ver `esperar-transicoes.ts`).
          await esperarTransicoes(page);
        }
        await page.addScriptTag({path: AXE});
        const v = await page.evaluate(async () => {
          const r = await (window as any).axe.run(document, {
            runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
          });
          return r.violations.flatMap((x: any) => x.nodes.map((n: any) => `${x.id} · ${n.html.slice(0, 60)}`));
        });
        for (const one of v) falhas.push(`${f}: ${one}`);
      }
      expect(falhas, `violações axe (${theme}):\n${falhas.join("\n")}`).toEqual([]);
    });
  }

  // UMA LINHA SÓ NO FOCO (ADR-0059, 08/10/2026). O Victor mostrou o campo focado com a borda
  // amarela por dentro e o anel amarelo por fora: a regra global afastava o anel 2px de TODA peça,
  // e a peça com borda própria ficava com borda + vão + anel. Medido no site: 39 peças. A regra
  // nova (`aurea.css`, logo abaixo do `:focus-visible` global) lista as peças com borda — e uma
  // lista esquece. Por isso este teste não confia nela: anda com Tab por toda prévia de toda página
  // de componente, espera a transição da borda TERMINAR (medir antes dela deu falso negativo no
  // primeiro levantamento) e, em quem desenha o anel — a peça focada, o irmão (`.control-mark`,
  // `.switch-track`) ou a moldura (`:focus-within`) —, reprova borda visível que não vira parte do
  // anel: afastada dele, ou encostada com outra cor.
  test("nenhuma peça focada desenha duas linhas — ADR-0059", async ({page}) => {
    const falhas = new Set<string>();
    const comBorda = new Set<string>();      // tipos de peça com borda que o teste de fato mediu
    for (const f of PAGES.filter(p => pageType(p) === "component")) {
      await abrir(page, url(f), avisar);
      const prevs = await page.locator(".demo-panel[data-panel='preview']").count();
      for (let i = 0; i < prevs; i++) {
        await page.evaluate(i => {
          const d = document.querySelectorAll<HTMLElement>(".demo-panel[data-panel='preview']")[i];
          (window as any).__prev = d;
          d.focus();
        }, i);
        for (let k = 0; k < 40; k++) {
          await page.keyboard.press("Tab");
          await esperarTransicoes(page);
          const r = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement | null;
            const prev = (window as any).__prev as HTMLElement;
            if (!el || !prev.contains(el) || el === prev) return {fora: true, defeitos: [] as string[], medidas: [] as string[]};
            const cv = document.createElement("canvas"); cv.width = cv.height = 1;
            const cx = cv.getContext("2d", {willReadFrequently: true})!;
            const rgba = (c: string) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); return [...cx.getImageData(0, 0, 1, 1).data]; };
            const dif = (a: number[], b: number[]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
            const fundo = (e: Element | null) => { while (e) { const v = rgba(getComputedStyle(e).backgroundColor); if (v[3] > 200) return v; e = e.parentElement; } return [0, 0, 0, 255]; };
            // quem desenha o anel: a peça, o irmão de depois, ou um ancestral próximo (moldura)
            const candidatos = [el, el.nextElementSibling, el.parentElement, el.parentElement?.parentElement, el.parentElement?.parentElement?.parentElement];
            const defeitos: string[] = [], medidas: string[] = [];
            for (const h of candidatos) {
              if (!(h instanceof HTMLElement)) continue;
              const s = getComputedStyle(h);
              const ow = parseFloat(s.outlineWidth) || 0;
              if (s.outlineStyle === "none" || ow === 0) continue;
              const bw = parseFloat(s.borderTopWidth) || 0;
              const bc = rgba(s.borderTopColor);
              const visivel = bw > 0 && s.borderTopStyle !== "none" && bc[3] > 40
                && dif(bc, fundo(h)) > 12 && dif(bc, fundo(h.parentElement)) > 12;
              if (!visivel) continue;
              medidas.push(h.tagName.toLowerCase() + "." + [...h.classList].slice(0, 2).join("."));
              const off = parseFloat(s.outlineOffset) || 0;
              const coberta = off <= -bw && off + ow >= 0;
              const faixa = off === 0 && dif(bc, rgba(s.outlineColor)) <= 12;
              if (!coberta && !faixa) {
                const nome = h.tagName.toLowerCase() + "." + [...h.classList].slice(0, 3).join(".");
                defeitos.push(`${nome}: borda ${bw}px ${s.borderTopColor}, anel ${ow}px a ${off}px ${s.outlineColor}`);
              }
            }
            return {fora: false, defeitos, medidas};
          });
          if (r.fora) break;
          for (const d of r.defeitos) falhas.add(`${f}: ${d}`);
          for (const m of r.medidas) comBorda.add(m);
        }
      }
    }
    // Sem isto o teste passaria sem medir nada (um seletor que deixa de casar, um Tab que não entra).
    expect(comBorda.size, `poucas peças com borda medidas: ${[...comBorda].join(" ")}`).toBeGreaterThan(15);
    expect([...falhas], `peças focadas com duas linhas (borda e anel separados):\n${[...falhas].join("\n")}`).toEqual([]);
  });

  // A ABA ESCOLHIDA SE VÊ (ADR-0059, 08/10/2026). A "cápsula elevada" do escolhido era
  // `--secondary` sobre o trilho `--muted`: no claro, a MESMA cor (1:1); no escuro, 1,02:1. O
  // Victor mostrou a aba do painel da web ao lado da aba da referência principal, onde a escolhida
  // é uma cápsula branca com sombra. Agora é `--segment` + `--shadow-sm`. Mede em toda página de
  // componente, nos dois temas e na marca `lory`, a cor da cápsula contra a do trilho atrás dela.
  // O piso de 1,08:1 é o que a marca mais clara dá (a `lory` no claro: branco sobre 0,965); a
  // versão de antes dá 1,00 e 1,02 e reprova.
  test("a cápsula da aba e do segmento escolhidos se distingue do trilho — ADR-0059", async ({page}) => {
    const falhas: string[] = [];
    let medidas = 0;
    for (const f of PAGES.filter(p => pageType(p) === "component")) {
      await abrir(page, url(f), avisar);
      for (const [tema, marca] of [["dark", ""], ["light", ""], ["dark", "lory"], ["light", "lory"]] as const) {
        await page.evaluate(([t, m]) => {
          document.documentElement.dataset.theme = t;
          if (m) document.documentElement.dataset.brand = m; else delete document.documentElement.dataset.brand;
        }, [tema, marca]);
        await esperarTransicoes(page);
        const r = await page.evaluate(() => {
          const cv = document.createElement("canvas"); cv.width = cv.height = 1;
          const cx = cv.getContext("2d", {willReadFrequently: true})!;
          const rgba = (c: string) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); return [...cx.getImageData(0, 0, 1, 1).data]; };
          const lum = ([r, g, b]: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
          const cr = (a: number[], b: number[]) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); };
          const prevs = document.querySelectorAll(".demo-panel[data-panel='preview']");
          const out: Array<{quem: string; razao: number}> = [];
          for (const pv of prevs) {
            for (const el of pv.querySelectorAll<HTMLElement>(".tabs > .tab.active, .tabs > .tab[data-active], .tabs > .tab[aria-selected='true'], .segmented > button.active")) {
              const trilho = rgba(getComputedStyle(el.parentElement!).backgroundColor);
              if (trilho[3] < 200) continue;      // trilho sem fundo (abas de linha): fora da regra
              out.push({quem: el.tagName.toLowerCase() + "." + [...el.classList].join(".") + " «" + (el.textContent ?? "").trim().slice(0, 20) + "»",
                razao: cr(rgba(getComputedStyle(el).backgroundColor), trilho)});
            }
          }
          return out;
        });
        medidas += r.length;
        for (const x of r) if (x.razao < 1.08) falhas.push(`${f} · ${tema}${marca ? " · " + marca : ""}: ${x.quem} ${x.razao.toFixed(2)}:1`);
      }
    }
    expect(medidas, "nenhuma aba ou segmento escolhido foi medido").toBeGreaterThan(8);
    expect(falhas, `escolhido da mesma cor do trilho:\n${falhas.join("\n")}`).toEqual([]);
  });
});

// Contratos comportamentais do catálogo. Ficam neste spec, não em catalog.spec.ts: aquele é
// captura de pixel e roda só no Chromium; estes precisam cobrir os três motores.
test.describe("catálogo · contratos do modelo de página", () => {
  // ADR-0067 (13/10/2026): a página segue a documentação da referência — o título com "Copy Markdown",
  // o Usage com o exemplo, e os cartões de anterior e próxima; SEM trilha e SEM "Installation" na página.
  test("toda página de componente tem o título com Copy Markdown, o Usage com o exemplo e prev/next", async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    await expect(page.locator(".page-head h1")).toHaveText("Button");
    await expect(page.locator(".page-head [data-copy-page]")).toBeVisible();
    await expect(page.locator("#usage .demo").first()).toBeVisible();
    await expect(page.locator(".prevnext a").first()).toBeAttached();
    await expect(page.locator(".crumb")).toHaveCount(0);
    await expect(page.locator("#installation")).toHaveCount(0);
  });

  test("o Copy Markdown copia o texto da própria página", async ({page, browserName, context}) => {
    test.skip(browserName !== "chromium", "ler a área de transferência num teste só é permitido no Chromium");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/apps/catalog/button.html");
    await page.locator(".page-head [data-copy-page]").click();
    await expect(page.locator(".page-head [data-copy-page]")).toContainText("Copied");
    // O Windows troca a quebra de linha na área de transferência; o texto é o mesmo.
    const copiado = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n");
    expect(copiado.startsWith("# Button\n")).toBe(true);
    expect(copiado).toContain("## Usage");
    expect(copiado).toContain("## API Reference");
    // A tabela continua tabela: a barra do tipo ("primary | secondary") sai escapada, e a linha tem
    // só os 5 separadores. A primeira versão escrevia "\|" num texto JS — que vira só "|" —, e a
    // linha do `variant` saía com 16 colunas.
    const linha = copiado.split("\n").find((l) => l.startsWith("| `variant`"))!;
    expect(linha.replace(/\\\|/g, "").split("|").length - 1).toBe(5);
  });

  test("o item ativo da lateral e a área ativa do topo se marcam com aria-current", async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    await expect(page.locator('.app-shell > .sidebar a[aria-current="page"]')).toContainText("Button");
    await expect(page.locator('.site-area[aria-current="page"]')).toHaveText("Components");
  });

  // ADR-0067: o menu é o da referência — ordem alfabética, sem glifo em cada item, com os selos de novidade.
  test("o menu de componentes é alfabético, sem glifo nos itens, e leva os selos New e Updated", async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    const lateral = page.locator(".app-shell > .sidebar");
    const nomes = await lateral.locator('[aria-labelledby] a, .sidebar-group a').allTextContents();
    expect(await lateral.locator("a svg").count()).toBe(0);
    const grupo = await page.evaluate(() => {
      const t = [...document.querySelectorAll(".app-shell > .sidebar .sidebar-group-label")].find((e) => e.textContent === "Components");
      const lista = t?.parentElement?.querySelectorAll("a .sidebar-label");
      return lista ? [...lista].map((s) => (s.textContent ?? "").trim()) : [];
    });
    expect(grupo.length).toBeGreaterThan(50);
    expect(grupo).toEqual([...grupo].sort((a, b) => a.localeCompare(b)));
    expect(nomes.length).toBeGreaterThan(0);
    await expect(lateral.getByText("New", {exact: true}).first()).toBeAttached();
  });

  // O Victor, 13/10/2026: "sidebar precisa ser o nosso flutuante" e, do "On this page", que os itens saiam
  // de dentro da caixa, como na referência. A da esquerda tem o canto de cartão e o fundo da lateral; a da
  // direita (`asideVariant="plain"`), nenhum dos três à vista: fundo, linha, sombra. A borda de 1 continua
  // lá, transparente — a variante guarda a geometria da flutuante. Medido a 1440, onde a coluna aparece.
  test("a lateral da esquerda é a flutuante da Aurea, e o sumário da direita não tem caixa", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/apps/catalog/getting-started.html");
    const caixas = await page.evaluate(() => {
      const cs = (s: string) => getComputedStyle(document.querySelector(s)!);
      const raio = getComputedStyle(document.documentElement).getPropertyValue("--radius-card").trim();
      const esq = cs(".app-shell > .sidebar:not(.app-shell-aside)"), dir = cs(".app-shell > .app-shell-aside");
      return {raio, esq: {raio: esq.borderTopLeftRadius, fundo: esq.backgroundColor},
        dir: {fundo: dir.backgroundColor, linha: dir.borderTopColor, sombra: dir.boxShadow}};
    });
    expect(caixas.esq.raio).toBe(caixas.raio);
    expect(caixas.esq.fundo).not.toBe("rgba(0, 0, 0, 0)");
    expect(caixas.dir).toEqual({fundo: "rgba(0, 0, 0, 0)", linha: "rgba(0, 0, 0, 0)", sombra: "none"});
  });

  // O Victor, 13/10/2026, comparando com o Início da referência: a busca do Início é SÓ o ícone, e a caixa
  // da vitrine é "na mesma cor do site, só tem uma linha ao redor" — o `Card variant="outline"`.
  test("o Início: a busca é só o ícone, e a vitrine é o cartão sem fundo, com a linha", async ({page}) => {
    await page.goto("/apps/catalog/index.html");
    const busca = page.locator("[data-site-search]");
    await expect(busca).toHaveCount(1);
    await expect(busca).toHaveClass(/\bbtn-icon\b/);
    await expect(busca).toHaveAccessibleName("Search");
    await expect(busca).toHaveAttribute("href", "./components.html");
    const caixa = page.locator(".home-painel:not([hidden])");
    await expect(caixa).toHaveClass(/\bcard-outline\b/);
    const pintura = await caixa.evaluate((e) => {
      const cs = getComputedStyle(e);
      return {fundo: cs.backgroundColor, borda: cs.borderTopWidth, cor: cs.borderTopColor};
    });
    expect(pintura.fundo).toBe("rgba(0, 0, 0, 0)");
    expect(pintura.borda).toBe("1px");
    expect(pintura.cor).not.toBe("rgba(0, 0, 0, 0)");
    await busca.click();
    await expect(page.getByRole("dialog", {name: "Search the site"})).toBeVisible();
  });

  // ADR-0068 (13/10/2026): o `DatePicker` da web. A pele (`.date-picker-trigger`) tira a seta do campo do Select
  // e põe o calendário no fim; o clique abre o calendário com o foco num dia, e o Esc fecha devolvendo o foco.
  // A prévia é VIVA (`embed`): o componente mora na moldura, então tudo se procura dentro dela.
  test("o DatePicker: o gatilho sem a seta, o calendário abre com foco e o Esc devolve o foco", async ({page}) => {
    await page.goto("/apps/catalog/datepicker.html");
    const moldura = page.frameLocator(".demo-panel > iframe.demo-frame").first();
    const gatilho = moldura.locator(".date-picker-trigger").first();
    await expect(gatilho).toHaveAccessibleName("Check-in");
    expect(await gatilho.evaluate((e) => getComputedStyle(e).backgroundImage)).toBe("none");
    const icone = gatilho.locator(".icon");
    const [g, i] = [(await gatilho.boundingBox())!, (await icone.boundingBox())!];
    expect(g.x + g.width - (i.x + i.width)).toBeLessThan(24);
    await gatilho.click();
    const janela = moldura.getByRole("dialog", {name: "Check-in"});
    await expect(janela.getByRole("grid").first()).toBeVisible();
    await expect(janela.locator("td button:focus")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(janela).toHaveCount(0);
    await expect(gatilho).toBeFocused();
  });

  // O Victor, 13/10/2026: a barra de rolagem da lateral "só aparece se o mouse fica em cima" e é clarinha.
  // Medido pela cor da barra (o caminho padrão); o WebKit sem `scrollbar-color` usa o caminho do webkit,
  // que o teste de unidade cobra no texto do CSS.
  test("a barra de rolagem da lateral aparece só com o ponteiro em cima", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/apps/catalog/button.html");
    test.skip(!(await page.evaluate(() => CSS.supports("scrollbar-color", "auto"))), "este navegador não tem scrollbar-color");
    const lateral = page.locator(".app-shell > .sidebar:not(.app-shell-aside)");
    const cor = () => lateral.evaluate((e) => getComputedStyle(e).scrollbarColor);
    await page.mouse.move(720, 450);
    expect(await cor()).toMatch(/^(transparent|rgba\(0, 0, 0, 0\)) (transparent|rgba\(0, 0, 0, 0\))$/);
    await lateral.hover();
    expect(await cor()).not.toMatch(/^(transparent|rgba\(0, 0, 0, 0\)) /);
  });

  // O Victor, 13/10/2026: "faltou o buscar". A busca é a CommandPalette: o botão do topo e o Ctrl+K abrem,
  // os resultados vêm em grupos, e o Enter leva à página. Sem JavaScript, o botão é um link para o catálogo.
  test("a busca abre pelo botão e pelo Ctrl+K, agrupa os resultados e o Enter leva à página", async ({page}) => {
    await page.goto("/apps/catalog/getting-started.html");
    const botao = page.locator("[data-site-search]");
    await expect(botao).toHaveAttribute("href", "./components.html");
    await botao.click();
    const busca = page.getByRole("dialog", {name: "Search the site"});
    await expect(busca).toBeVisible();
    await page.getByRole("combobox", {name: /Search components/}).fill("timeline");
    await expect(busca.getByRole("option", {name: "Timeline", exact: true})).toBeVisible();
    await expect(busca.getByText("Components", {exact: true})).toBeVisible();
    await expect(busca.getByText("Patterns", {exact: true})).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/timeline\.html$/);
    await expect(page.getByRole("dialog", {name: "Search the site"})).toHaveCount(0);
    // A página nova carrega a busca de novo (`search.js`, adiado): o atalho só existe depois de ela montar.
    // Na varredura cheia o Firefox apertou antes disso (13/10/2026) — sozinho, o teste passava.
    await page.waitForLoadState("load");
    await expect(page.locator("#site-search-root")).toBeAttached();
    await expect(async () => {
      await page.keyboard.press("Control+k");
      await expect(page.getByRole("dialog", {name: "Search the site"})).toBeVisible({timeout: 1000});
    }).toPass({timeout: 10000});
  });

  test("as abas do demo alternam pelo comportamento do CORE, sem JS do app", async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    // .demo-panel no seletor: aba e painel compartilham data-panel, e sem isso o locator
    // pega os dois.
    const preview = page.locator(".demo").first().locator('.demo-panel[data-panel="preview"]');
    const code = page.locator(".demo").first().locator('.demo-panel[data-panel="code"]');
    await expect(preview).toBeVisible();
    await page.locator('.demo').first().locator('[role="tab"][data-panel="code"]').click();
    await expect(preview).toBeHidden();
    await expect(code).toBeVisible();
  });
});
