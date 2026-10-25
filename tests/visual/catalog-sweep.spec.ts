import {test, expect} from "@playwright/test";
import {readdirSync, readFileSync} from "node:fs";
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
  // a caixa de demonstração tinha altura FIXA (ADR-0002, substituída pela ADR-0081 em 24/10/2026: agora ela CRESCE com o
  // exemplo, e este teste prova que nenhuma rola por dentro — na tela do Victor, 1280 × 663), e a decisão listava como consequência boa
  // que *"nenhuma demo exige rolagem"*. Medido em 11/08/2026, **10 das 520** caixas rolavam — duas
  // por CSS (`.media-player` tem `aspect-ratio:16/9`, que dá 464px na largura do painel), uma por
  // grid colapsado (`.health-matrix` sem largura vira uma coluna) e sete por conteúdo alto demais.
  //
  // A regra que o gate cobra é a da ADR: quem cede é o CONTEÚDO, nunca a altura da caixa. Por isso
  // ele mede `scrollHeight > clientHeight` no `.demo-panel` — o mesmo sinal que o navegador usa
  // para decidir se põe barra —, e não a altura contra um número escrito aqui, que envelheceria
  // na primeira mudança de densidade.
  //
  // 1280 × 663 é a tela do Victor (o 3-B do bloco 1): a régua é a dele.
  test("nenhuma prévia do catálogo rola dentro da caixa", async ({page}) => {
    await page.setViewportSize({width: 1280, height: 663});
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
    expect(falhas, `prévias que exigem rolagem (a caixa cresce com o exemplo, ADR-0081):\n${falhas.join("\n")}`).toEqual([]);
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
  test("em 375px o h1 de toda página cabe na primeira tela, sem quebrar no meio da palavra", async ({page}) => {
    const falhas: string[] = [];
    await page.setViewportSize({width: 375, height: 812});
    for (const f of PAGES) {
      await abrir(page, url(f), avisar);
      const m = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        if (!h1) return null;
        // E O TÍTULO NÃO QUEBRA NO MEIO DA PALAVRA (14/10/2026): o botão "Copy Markdown" ao lado, numa linha que
        // não quebrava, espremia o h1 a 81px e "Accordion" saía "Accor / dion". A maior palavra, medida na fonte do
        // próprio título, tem de caber nele — quando ela cabe na linha; palavra maior que a tela quebra mesmo.
        const cs = getComputedStyle(h1), s = document.createElement("span");
        Object.assign(s.style, {position: "absolute", visibility: "hidden", whiteSpace: "nowrap", fontStyle: cs.fontStyle,
          fontWeight: cs.fontWeight, fontSize: cs.fontSize, fontFamily: cs.fontFamily, letterSpacing: cs.letterSpacing});
        document.body.append(s);
        let maior = 0;
        for (const w of (h1.textContent ?? "").split(/\s+/).filter(Boolean)) {
          s.textContent = w;
          maior = Math.max(maior, s.getBoundingClientRect().width);
        }
        s.remove();
        const largura = h1.getBoundingClientRect().width, linha = h1.parentElement!.getBoundingClientRect().width;
        return {y: Math.round(h1.getBoundingClientRect().top + scrollY),
          // O h1 das molduras de exemplo é `.sr-only` (1px, só para o leitor de tela): não tem linha para quebrar.
          quebra: !h1.classList.contains("sr-only") && maior <= linha && largura + 0.5 < maior ? `${Math.round(largura)}px para a palavra de ${Math.round(maior)}px` : null};
      });
      if (m === null) falhas.push(`${f}: sem h1`);
      else {
        if (m.y >= 812) falhas.push(`${f}: o h1 começa a ${m.y}px — ${(m.y / 812).toFixed(1)} telas abaixo`);
        if (m.quebra) falhas.push(`${f}: o h1 quebra no meio da palavra — ${m.quebra}`);
      }
    }
    expect(falhas, `páginas cujo título não começa na primeira tela, ou quebra no meio da palavra:\n${falhas.join("\n")}`).toEqual([]);
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
          // ~~ADR-0073 (18/10/2026): no tema claro, a letra de destaque era o amarelo da marca (1,76:1), e a
          // varredura aceitava SÓ essa acusação.~~ A ADR-0076 (20/10/2026) trocou a letra de destaque do claro
          // pelo azul da marca (5,59 a 6,67:1): a exceção saiu, e toda acusação de contraste reprova, nos dois temas.
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
    const comBorda = new Set<string>();      // peças com borda visível no foco — desde a ADR-0072, nenhuma
    let paradas = 0;                          // quantas peças o Tab focou de fato
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
          paradas++;
          for (const d of r.defeitos) falhas.add(`${f}: ${d}`);
          for (const m of r.medidas) comBorda.add(`${f}: ${m}`);
        }
      }
    }
    // SEM LINHA (ADR-0072, 16/10/2026): desde que as peças não têm borda, o foco é o anel e mais nada — nenhuma peça
    // focada (nem o irmão que desenha a marca, nem a moldura) mostra borda. Sem a contagem de paradas, o teste passaria
    // sem medir nada (um seletor que deixa de casar, um Tab que não entra).
    expect(paradas, "poucas peças focadas — o Tab não entrou nas prévias").toBeGreaterThan(100);
    expect([...comBorda], `peças focadas com borda visível (sem linha, ADR-0072):\n${[...comBorda].join("\n")}`).toEqual([]);
    expect([...falhas], `peças focadas com duas linhas (borda e anel separados):\n${[...falhas].join("\n")}`).toEqual([]);
  });

  // SEM LINHA (ADR-0072, 16/10/2026). O Victor: "quero tudo sem borda, sem exceções". Toda página do catálogo (e das
  // prévias em documento próprio), nos dois temas: nenhum elemento — nem o `::before`/`::after` — desenha borda
  // visível, nem o anel fino de `box-shadow` (deslocamento 0, desfoque 0, até 2 px), que é a mesma linha por outro
  // caminho. O foco (`outline`) não conta: ele mostra onde o teclado está. Os estados que a página parada não mostra (o
  // mouse, o inválido, o arrastar) são cobrados no código, por `tests/unit/sem-linha.test.tsx`.
  test("nenhuma peça desenha linha, em nenhuma página, nos dois temas — ADR-0072", async ({page}) => {
    const falhas = new Set<string>();
    let medidos = 0;
    for (const f of PAGES) {
      await abrir(page, url(f), avisar);
      for (const tema of ["dark", "light"] as const) {
        if (tema === "light") {
          await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
          await esperarTransicoes(page);
        }
        const r = await page.evaluate(() => {
          const cv = document.createElement("canvas"); cv.width = cv.height = 1;
          const cx = cv.getContext("2d", {willReadFrequently: true})!;
          const alfa = (c: string) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "transparent"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); return cx.getImageData(0, 0, 1, 1).data[3]; };
          const camadas = (v: string) => { const out: string[] = []; let n = 0, a = ""; for (const ch of v) { if (ch === "(") n++; else if (ch === ")") n--; if (ch === "," && n === 0) { out.push(a); a = ""; } else a += ch; } out.push(a); return out.map(x => x.trim()); };
          // O recorte (o anel da cor do fundo, que separava a bolinha da `Timeline` do traço e o selo preso da peça) também
          // é linha: dentro de uma caixa de outra cor, ele aparece. A 2ª rodada desta varredura achou os dois.
          const anel = (camada: string) => {
            const cor = camada.match(/^(rgba?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|color\([^)]*\)|#[0-9a-f]+|[a-z]+)/i)?.[0] ?? "";
            const px = [...camada.replace(cor, "").matchAll(/(-?[\d.]+)px/g)].map(m => +m[1]);
            return px.length === 4 && px[0] === 0 && px[1] === 0 && px[2] === 0 && px[3] > 0 && px[3] <= 2 && alfa(cor) > 0;
          };
          const linhas = (s: CSSStyleDeclaration) => {
            const achou: string[] = [];
            for (const l of ["Top", "Right", "Bottom", "Left"] as const) {
              const w = parseFloat((s as any)[`border${l}Width`]) || 0;
              const st = (s as any)[`border${l}Style`];
              if (w > 0 && st !== "none" && st !== "hidden" && alfa((s as any)[`border${l}Color`]) > 0) achou.push(`borda ${l.toLowerCase()} ${w}px ${(s as any)[`border${l}Color`]}`);
            }
            if (s.boxShadow && s.boxShadow !== "none" && camadas(s.boxShadow).some(anel)) achou.push(`anel ${s.boxShadow.slice(0, 60)}`);
            return achou;
          };
          const nome = (e: Element) => e.tagName.toLowerCase() + [...e.classList].slice(0, 3).map(c => "." + c).join("");
          const out: string[] = [];
          let n = 0;
          for (const e of document.body.querySelectorAll("*")) {
            if (e.getClientRects().length === 0) continue;
            n++;
            // A única linha que fica (o Victor, 16/10/2026): a do cartão de contorno, a caixa da vitrine — na web pela classe,
            // no nativo pela marca que o `Card` põe só no navegador (`data-aurea-card="outline"`, bloco 1).
            if (e.classList.contains("card-outline") || (e as HTMLElement).dataset.aureaCard === "outline") continue;
            for (const x of linhas(getComputedStyle(e))) out.push(`${nome(e)}: ${x}`);
            for (const ps of ["::before", "::after"]) {
              const s = getComputedStyle(e, ps);
              if (s.content === "none" || s.content === "normal") continue;
              for (const x of linhas(s)) out.push(`${nome(e)}${ps}: ${x}`);
            }
          }
          return {out, n};
        });
        medidos += r.n;
        for (const x of r.out) falhas.add(`${f} · ${tema}: ${x}`);
      }
    }
    // Sem isto o teste passaria sem medir nada.
    expect(medidos, "poucos elementos medidos").toBeGreaterThan(100000);
    expect([...falhas].slice(0, 200), `peças com linha (${falhas.size}):\n${[...falhas].slice(0, 200).join("\n")}`).toEqual([]);
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
    await expect(page.locator('.topbar-tab[aria-current="page"]')).toHaveText("Components");
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
    // "New" é o que ainda não está na superfície publicada (`released-surface.json`). Contado, e não "pelo menos um":
    // logo depois de uma publicação NADA é novo — o registro da 0.32.0 reprovou na CI por exigir um (14/10/2026).
    const publicados = new Set(JSON.parse(readFileSync("scripts/released-surface.json", "utf8")).components);
    // Só os COMPONENTES: os hooks moram na lateral da área Hooks desde o lote T (cada área com a sua lateral).
    const novos = readdirSync("packages/contracts/registry").filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join("packages/contracts/registry", f), "utf8")) as {name: string; kind?: string; platforms?: {web?: string}})
      // A ficha só do nativo (`platforms.web: "n-a"`, bloco 1) mora na lateral do nativo, não nesta.
      .filter((f) => f.kind !== "hook" && f.platforms?.web !== "n-a" && !publicados.has(f.name));
    await expect(lateral.getByText("New", {exact: true})).toHaveCount(novos.length);
  });

  // As duas laterais SEM CAIXA, como as da referência (lote T, 17/10/2026, o Victor: "quero sidebar como da referência, que
  // não seja mais flutuante" — troca a ordem de 13/10/2026, "sidebar precisa ser o nosso flutuante"). Nenhum dos três à
  // vista, nas duas: fundo, linha, sombra. Medido a 1440, onde a coluna da direita aparece.
  test("as duas laterais não têm caixa, como as da referência", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/apps/catalog/getting-started.html");
    const caixas = await page.evaluate(() => [".app-shell > .sidebar:not(.app-shell-aside)", ".app-shell > .app-shell-aside"]
      .map((s) => { const c = getComputedStyle(document.querySelector(s)!); return {fundo: c.backgroundColor, linha: c.borderTopColor, sombra: c.boxShadow}; }));
    const sem = {fundo: "rgba(0, 0, 0, 0)", linha: "rgba(0, 0, 0, 0)", sombra: "none"};
    expect(caixas).toEqual([sem, sem]);
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
    // E no CLARO: a regra do tema claro do `.select` repinta a seta, e ela saía por cima do calendário (visto pelo
    // Victor em 13/10/2026: "tem tipo uma seta em cima do ícone do calendário").
    expect(await gatilho.evaluate((e) => {
      e.ownerDocument.documentElement.dataset.theme = "light";
      const fundo = getComputedStyle(e).backgroundImage;
      e.ownerDocument.documentElement.dataset.theme = "dark";
      return fundo;
    })).toBe("none");
    const icone = gatilho.locator(".icon");
    const [g, i] = [(await gatilho.boundingBox())!, (await icone.boundingBox())!];
    expect(g.x + g.width - (i.x + i.width)).toBeLessThan(24);
    await gatilho.click();
    const janela = moldura.getByRole("dialog", {name: "Check-in"});
    await expect(janela.getByRole("grid").first()).toBeVisible();
    await expect(janela.locator("td button:focus")).toHaveCount(1);
    // UMA superfície, como na referência: a janela com recheio 12, e o calendário de dentro sem moldura própria.
    // Visto em 13/10/2026: saía caixa dentro de caixa (as duas com borda e canto 22).
    expect(await janela.evaluate((e) => getComputedStyle(e).paddingTop)).toBe("12px");
    const calendarioDentro = await janela.locator(".calendar").evaluate((e) => {
      const cs = getComputedStyle(e);
      return {borda: cs.borderTopWidth, fundo: cs.backgroundColor, recheio: cs.paddingTop};
    });
    expect(calendarioDentro).toEqual({borda: "0px", fundo: "rgba(0, 0, 0, 0)", recheio: "0px"});
    await page.keyboard.press("Escape");
    await expect(janela).toHaveCount(0);
    await expect(gatilho).toBeFocused();
  });

  // ADR-0069 (13/10/2026): o `ColorPicker`. O foco fica PRESO na janela, como na referência — medido no navegador:
  // sem isso, o Tab depois do campo do código saía da janela e ela fechava no meio do uso. A prévia se abre como
  // PÁGINA PRÓPRIA: dentro da moldura do catálogo o Tab do navegador dá a volta sozinho, e o teste passava com o
  // defeito (provado em 13/10/2026).
  test("o ColorPicker: abre com o foco na área, o Tab dá a volta dentro da janela, e o Esc devolve o foco", async ({page}) => {
    await page.goto("/apps/catalog/embeds/colorpicker-with-swatches.html");
    const gatilho = page.locator(".color-picker-trigger");
    await expect(gatilho).toHaveAccessibleName("Brand colour, vivid blue");
    const janela = page.getByRole("dialog", {name: "Brand colour"});
    const focado = () => page.evaluate(() => {
      const a = document.activeElement!, j = document.querySelector(".color-picker-popover");
      if (!j || !j.contains(a)) return "fora";
      return a.closest(".color-area") ? "área" : a.closest(".slider") ? "trilha" : a.closest(".color-swatch-picker") ? "amostras"
        : a.closest(".input-group") ? "código" : a.className;
    });
    // O anel de foco da área é do TECLADO: aberto pelo mouse, não. E a PRIMEIRA coisa que a pessoa faz na página é o
    // clique — medido na bancada em 14/10/2026: a primeira abertura com o mouse acendia o anel (a escuta só começava
    // quando a área montava, depois do clique), e este teste, que abria pelo teclado antes, passava com o defeito.
    const anel = () => page.locator(".color-picker-popover .color-area-thumb").getAttribute("data-focus-visible");
    await gatilho.click();
    await expect(janela).toBeVisible();
    await expect.poll(focado).toBe("área");
    expect(await anel(), "a primeira abertura, pelo mouse, sem o anel").toBeNull();
    await page.keyboard.press("Escape");
    await expect(janela).toHaveCount(0);
    await gatilho.focus();
    await page.keyboard.press("Enter");
    await expect(janela).toBeVisible();
    await expect.poll(focado).toBe("área");
    await expect.poll(anel, {message: "aberto pelo teclado, com o anel"}).toBe("");
    // Uma ESPERA por passo, e não uma leitura: a volta do foco ao começo da janela é do motor e acontece um instante
    // depois do Tab — a leitura imediata reprovou 1 vez em 2 rodadas com o código certo.
    for (const onde of ["trilha", "amostras", "código", "área", "trilha"]) {
      await page.keyboard.press("Tab");
      await expect.poll(focado, {message: `o Tab leva a: ${onde}`, timeout: 2000}).toBe(onde);
    }
    // E a janela FICA aberta: sem o foco preso, o motor primeiro devolve o foco ao começo e, uns 300 ms depois,
    // fecha a janela (medido em 13/10/2026). Aqui a espera fixa é a medida: o que se testa é nada acontecer.
    await page.waitForTimeout(600);
    expect(await focado(), "o foco continua dentro da janela").toBe("trilha");
    await expect(janela).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(janela).toHaveCount(0);
    await expect(gatilho).toBeFocused();
    // E o mouse depois do teclado volta a não ter anel (medido em 13/10/2026: a janela põe o foco na área por código).
    await gatilho.click();
    await expect(janela).toBeVisible();
    await expect.poll(focado).toBe("área");
    expect(await anel(), "aberto pelo mouse depois do teclado, sem o anel").toBeNull();
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
    // O botão À VISTA: desde 19/10/2026 há dois (a busca larga e a lupa do celular), cada um na sua largura.
    const botao = page.locator("[data-site-search]:visible");
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

  // O Victor, 14/10/2026: "o buscar depois que clica nele não tem como sair, nem Esc nem clicando fora". Medido no
  // site publicado: o clique no fundo não fechava, e o foco ia para a página — dali o Esc também não chegava. A
  // paleta era uma `div` feita à mão; agora mora na janela do motor (a paleta de exemplo dele), que fecha pelos dois
  // caminhos, prende o Tab dentro e devolve o foco ao botão. Sem o conserto, o primeiro `toHaveCount(0)` reprova.
  test("a busca fecha clicando fora e com Esc, prende o Tab e devolve o foco ao botão", async ({page}) => {
    await page.goto("/apps/catalog/getting-started.html");
    await page.waitForLoadState("load");
    await expect(page.locator("#site-search-root")).toBeAttached();
    const botao = page.locator("[data-site-search]").first();
    const busca = page.getByRole("dialog", {name: "Search the site"});
    const vp = page.viewportSize()!;
    // 1. Clique fora (no fundo, longe da caixa) fecha.
    await botao.click();
    await expect(busca).toBeVisible();
    await page.mouse.click(vp.width - 8, vp.height - 8);
    await expect(busca).toHaveCount(0);
    // 2. Esc fecha, e o foco volta ao botão que abriu.
    await botao.click();
    await expect(busca).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(busca).toHaveCount(0);
    await expect(botao).toBeFocused();
    // 3. Clique DENTRO da caixa, fora do campo (a linha das teclas), e depois Esc: ainda fecha.
    await botao.click();
    await busca.locator(".command-shortcuts").click();
    await page.keyboard.press("Escape");
    await expect(busca).toHaveCount(0);
    // 4. O Tab não sai da caixa para a página de trás (com a caixa aberta e o campo focado — antes disso o Tab
    //    ainda é da página).
    await botao.click();
    await expect(busca.getByRole("combobox")).toBeFocused();
    // O Tab passa por uma guarda invisível do motor, que devolve o foco para dentro no mesmo instante — por isso a
    // espera. Com a caixa feita à mão, o foco ia de vez para a página, e a espera vencia.
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest(".command-palette")), {message: `Tab ${i + 1}`, timeout: 2000}).toBe(true);
    }
  });

  // O Victor, 14/10/2026, comparando o Início com o da referência (as medidas dela foram lidas na página, a 1440):
  //   1. os links na MESMA linha da logo, colados nela — o `Header` com `items` e `itemsJustify="start"`;
  //   4. o texto com 18 de letra em 28 de linha, colado no título, e 16 entre as outras peças;
  //   5. as abas da vitrine no canto, 8 para dentro da caixa.
  // No site de antes: o topo tinha duas linhas (99), o texto 30,6 de linha, 20 de vão, e as abas no meio.
  test("o Início: os links na linha da logo, o texto na medida da referência e as abas no canto", async ({page, browserName}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/apps/catalog/index.html");
    const m = await page.evaluate(() => {
      const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const topo = r(".site-top"), marca = r(".site-brand"), link = r(".site-top .topbar-nav .topbar-link");
      const acoes = r(".site-top .topbar-actions"), h1 = r(".home-hero .section-hero-title"), p = r(".home-hero .section-hero-description");
      const selo = r(".home-selo"), botoes = r(".home-hero .section-hero-actions");
      const em = (v: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)) * 16;
      const cs = getComputedStyle(document.querySelector(".site-top")!);
      return {altura: topo.height, alturaPadrao: em("--space-12") + em("--space-2"),
        fundo: cs.backgroundColor, desfoque: cs.backdropFilter || (cs as unknown as Record<string, string>).webkitBackdropFilter,
        vaoAcoes: parseFloat(getComputedStyle(document.querySelector(".site-top .topbar-actions")!).columnGap),
        mesmaLinha: Math.abs((link.top + link.height / 2) - (marca.top + marca.height / 2)),
        marcaAoLink: link.left - marca.right, vaoDaBarra: em("--space-4"),
        sobra: document.documentElement.clientWidth - acoes.right, marcaEsq: marca.left,
        linhaDoTexto: parseFloat(getComputedStyle(document.querySelector(".home-hero .section-hero-description")!).lineHeight),
        letraDoTexto: parseFloat(getComputedStyle(document.querySelector(".home-hero .section-hero-description")!).fontSize),
        tituloAoTexto: p.top - h1.bottom, seloAoTitulo: h1.top - selo.bottom, textoAosBotoes: botoes.top - p.bottom,
        abas: r(".home-abas").left - r(".home-painel:not([hidden])").left, espaco2: em("--space-2")};
    });
    // 15/10/2026 (A): o topo da página inicial da referência — 56, o fundo transparente que embaça (16), 6 entre as ações.
    expect(m.altura, "uma linha só, com os 56 da página inicial da referência").toBe(m.alturaPadrao);
    // O fundo que embaça respeita quem pede MENOS TRANSPARÊNCIA ao sistema (o Windows com "Efeitos de transparência"
    // desligado, medido nesta máquina em 15/10/2026): aí o fundo é cheio. O teste confere o que vale na máquina, e no
    // Chromium força as duas preferências (o Playwright 1.61 não emula essa; o protocolo do navegador emula).
    const transparente = /^(transparent|rgba\(0, 0, 0, 0\))$/;
    const menos = await page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches);
    if (menos) { expect(m.fundo).not.toMatch(transparente); expect(m.desfoque).toBe("none"); }
    else { expect(m.fundo).toMatch(transparente); expect(m.desfoque).toBe("blur(16px)"); }
    if (browserName === "chromium") {
      const cdp = await page.context().newCDPSession(page);
      const topo = () => page.locator(".site-top").evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).backdropFilter]);
      await cdp.send("Emulation.setEmulatedMedia", {features: [{name: "prefers-reduced-transparency", value: "no-preference"}]});
      const [f1, d1] = await topo();
      expect(f1).toMatch(transparente); expect(d1).toBe("blur(16px)");
      await cdp.send("Emulation.setEmulatedMedia", {features: [{name: "prefers-reduced-transparency", value: "reduce"}]});
      const [f2, d2] = await topo();
      expect(f2).not.toMatch(transparente); expect(d2).toBe("none");
      await cdp.send("Emulation.setEmulatedMedia", {features: []});
    }
    expect(m.vaoAcoes).toBe(6);
    expect(m.mesmaLinha, "o primeiro link na linha da logo").toBeLessThan(1);
    expect(m.marcaAoLink, "da logo ao 1º link, 32: o vão da barra e mais --space-4, como na referência").toBeCloseTo(m.vaoDaBarra * 2, 0);
    expect(m.sobra, "as ações na outra ponta: a mesma sobra da logo, do outro lado").toBeCloseTo(m.marcaEsq, 0);
    expect(m.letraDoTexto).toBe(18);
    expect(m.linhaDoTexto, "18 em 28, como a referência").toBeCloseTo(28, 0);
    expect(m.tituloAoTexto, "o título e o texto colados").toBeCloseTo(0, 0);
    expect(m.seloAoTitulo).toBeCloseTo(16, 0);
    expect(m.textoAosBotoes).toBeCloseTo(16, 0);
    expect(m.abas, "as abas no canto, 8 para dentro").toBeCloseTo(m.espaco2, 0);
    // O selo sem a linha em volta, como o da referência (o `Badge` `flat`).
    await expect(page.locator(".home-selo .badge")).toHaveCSS("border-top-color", /rgba\(0, 0, 0, 0\)|transparent/);
    // 15/10/2026 (o Victor: "iguale"): as letras da referência — o nome 16 em 600, sem a versão ao lado; a nota em 12, que
    // é o link para o repositório. Antes: 18 em 700 com a versão, e 14 sem link. O título era o 48/48 da referência; desde
    // 19/10/2026 é a abertura da Aurea (GAR-21 e GAR-22, decisão do Victor): 72/72 na faixa larga.
    const l = await page.evaluate(() => {
      const cs = (s: string) => getComputedStyle(document.querySelector(s)!);
      return {nome: [cs(".site-brand strong").fontSize, cs(".site-brand strong").fontWeight],
        versao: document.querySelectorAll(".site-top .site-version").length,
        titulo: [cs(".home-hero .section-hero-title").fontSize, cs(".home-hero .section-hero-title").lineHeight], nota: cs(".home-nota").fontSize,
        link: document.querySelector(".home-nota")!.getAttribute("href")};
    });
    expect(l).toEqual({nome: ["16px", "600"], versao: 0, titulo: ["72px", "72px"], nota: "12px",
      link: "https://github.com/victor1mor/aurea-uds"});
    // E no monitor grande o topo fica no centro, como o da referência (no 24" do Victor ia para os cantos): o miolo
    // tem a largura do `Container` `2xl`, com o respiro dele.
    await page.setViewportSize({width: 1902, height: 1000});
    const c = await page.evaluate(() => {
      const em = (v: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v));
      return {logo: document.querySelector(".site-brand")!.getBoundingClientRect().left,
        esperado: (document.documentElement.clientWidth - em("--breakpoint-2xl")) / 2 + em("--space-8") * 16};
    });
    expect(c.logo, "a logo no começo do miolo centrado, e não na borda").toBeCloseTo(c.esperado, 0);
  });

  // 15/10/2026 (o Victor: "analise cada milímetro"): no celular, as medidas da referência em 375 — o título (30/36 até
  // 19/10/2026; desde então o 36/40 da abertura da Aurea, GAR-22), o texto 16/24, 8 do selo ao título e dos botões à nota, as abas da vitrine escondidas (só a primeira vitrine), e a barra
  // numa linha só (o GitHub sai dela). E o logo do GitHub é o oficial, em branco no escuro e preto no claro.
  test("o Início no celular tem as medidas da referência, e o logo do GitHub é o oficial", async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto("/apps/catalog/index.html");
    const m = await page.evaluate(() => {
      const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const cs = (s: string) => getComputedStyle(document.querySelector(s)!);
      return {titulo: [cs(".home-hero .section-hero-title").fontSize, cs(".home-hero .section-hero-title").lineHeight],
        texto: [cs(".home-hero .section-hero-description").fontSize, cs(".home-hero .section-hero-description").lineHeight],
        seloAoTitulo: r(".home-hero .section-hero-title").top - r(".home-selo").bottom, botoesANota: r(".home-nota").top - r(".home-hero .section-hero-actions").bottom,
        abas: r(".home-abas").height, topo: r(".site-top").height, alturaPadrao: ["--space-12", "--space-2"].reduce((t, v) => t + parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)) * 16, 0),
        lado: document.documentElement.scrollWidth - document.documentElement.clientWidth};
    });
    // A entrelinha é 36 × 1,111111 (o --text-4xl-leading): o WebKit devolve 39,999996, os outros 40.
    expect(parseFloat(m.titulo[0])).toBe(36);
    expect(parseFloat(m.titulo[1])).toBeCloseTo(40, 1);
    expect(m.texto).toEqual(["16px", "24px"]);
    expect(m.seloAoTitulo).toBeCloseTo(8, 0);
    expect(m.botoesANota).toBeCloseTo(8, 0);
    expect(m.abas, "as abas da vitrine escondidas abaixo de 1024").toBe(0);
    expect(m.topo, "a barra numa linha só").toBe(m.alturaPadrao);
    expect(m.lado, "sem rolar de lado").toBe(0);
    // O GitHub, que sai da barra no celular, está no menu (o `menuActions` do `Header`), como na referência.
    await page.locator(".site-top .topbar-menu-toggle").click();
    await expect(page.locator(".topbar-menu-panel .topbar-menu-actions a[aria-label='GitHub']")).toBeVisible();
    await page.keyboard.press("Escape");
    // O logo: o desenho do arquivo oficial, nas cores oficiais.
    await page.setViewportSize({width: 1440, height: 900});
    // A cor vem do token (`--white`/`--black`, lote T): o navegador a devolve como `oklch()`; o canvas a passa a `rgb`.
    const tinta = () => page.locator(".topbar-actions a[aria-label='GitHub'] path").evaluate((p) => {
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.fillStyle = getComputedStyle(p).fill; ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    });
    await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
    expect(await tinta()).toBe("rgb(255, 255, 255)");
    await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
    expect(await tinta()).toBe("rgb(0, 0, 0)");
    await expect(page.locator(".topbar-actions a[aria-label='GitHub']")).toHaveAttribute("href", "https://github.com/victor1mor/aurea-uds");
    await expect(page.locator(".home-nota svg path")).toHaveCount(1);
  });

  // O Victor, 14/10/2026: "crie um botão tema como da [referência]". O botão pequeno com o balde e "Theme" abre a janelinha
  // com as amostras das MARCAS e o nome embaixo; escolher troca a marca da página, grava, e o botão mostra o nome dela.
  test("o botão Theme troca a marca: abre as amostras com nome, grava a escolha, e volta para a Aurea", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/apps/catalog/index.html");
    await page.evaluate(() => localStorage.removeItem("aurea-brand"));
    await page.reload();
    await page.waitForLoadState("load");
    const tema = page.getByRole("button", {name: "Design theme", exact: true});
    await tema.click();
    const grupo = page.getByRole("radiogroup", {name: "Design theme", exact: true});
    await expect(grupo).toBeVisible();
    await expect(grupo.locator(".color-swatch-name")).toHaveText(["Aurea", "Lory"]);
    await expect(grupo.getByRole("radio", {name: "Aurea"})).toBeChecked();
    await grupo.getByText("Lory").click();
    await expect(page.locator("html")).toHaveAttribute("data-brand", "lory");
    expect(await page.evaluate(() => localStorage.getItem("aurea-brand"))).toBe("lory");
    await page.keyboard.press("Escape");
    const tLory = page.getByRole("button", {name: "Design theme: Lory"});
    await expect(tLory).toHaveText("Lory");
    // A página nova abre com a marca gravada, e o botão já diz qual é.
    await page.reload();
    await page.waitForLoadState("load");
    await expect(page.locator("html")).toHaveAttribute("data-brand", "lory");
    await expect(page.getByRole("button", {name: "Design theme: Lory"})).toBeVisible();
    await page.getByRole("button", {name: "Design theme: Lory"}).click();
    await page.getByRole("radiogroup", {name: "Design theme", exact: true}).getByText("Aurea").click();
    await expect(page.locator("html")).not.toHaveAttribute("data-brand", /.*/);
    await page.evaluate(() => localStorage.removeItem("aurea-brand"));
    await page.keyboard.press("Escape");
    // A mesma caixa dos vizinhos (o Victor, 15/10/2026: "por que os ícones da direita estão tamanhos diferentes?"): os
    // botões do topo todos com a mesma altura e com fundo. E no celular só o balde, no botão redondo — trocando ao
    // estreitar a janela, sem recarregar.
    const temaPadrao = page.locator("#site-theme-root button");
    const caixas = await page.locator(".topbar-actions > a, .topbar-actions > button, #site-theme-root button").evaluateAll((bs) =>
      bs.map((b) => [Math.round(b.getBoundingClientRect().height), getComputedStyle(b).backgroundColor]));
    expect(new Set(caixas.map(([h]) => h)).size, `alturas: ${JSON.stringify(caixas)}`).toBe(1);
    expect(caixas.every(([, f]) => !/rgba\(0, 0, 0, 0\)|transparent/.test(String(f))), "todos com fundo").toBe(true);
    // E a letra do "Theme" é a da referência: 12, apagada (o `quiet` do `Button`).
    await expect(temaPadrao).toHaveCSS("font-size", "12px");
    const apagada = await page.evaluate(() => { const d = document.createElement("span"); d.style.color = "var(--muted-foreground)"; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
    await expect(temaPadrao).toHaveCSS("color", apagada);
    await page.setViewportSize({width: 600, height: 900});
    await expect(temaPadrao).toHaveClass(/btn-icon/);
    await expect(temaPadrao).toHaveAccessibleName("Design theme");
    await page.setViewportSize({width: 1440, height: 900});
    await expect(temaPadrao).toHaveText("Theme");
  });

  // 15/10/2026 (o Victor: "A, B, C, pode"): a chave de TRÊS posições do topo da referência — claro, escuro e sistema —, o
  // `ThemeToggle mode="light-dark-system"`. "Sistema" segue o esquema do computador e muda JUNTO, sem recarregar; a escolha
  // fica guardada. E o rodapé de uma linha (a `Section` `layout="inline"`), com os 44 da referência.
  test("a chave de tema de três posições guarda a escolha, e Sistema segue o computador", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.emulateMedia({colorScheme: "light"});
    await page.goto("/apps/catalog/index.html");
    await page.evaluate(() => localStorage.removeItem("aurea-theme"));
    await page.reload();
    await page.waitForLoadState("load");
    const chave = page.locator(".topbar-actions").getByRole("radiogroup", {name: "Theme", exact: true});
    await expect(chave.getByRole("radio")).toHaveCount(3);
    const caixa = await chave.boundingBox();
    expect(Math.round(caixa!.height), "a cápsula de 34 da referência").toBe(34);
    await chave.getByRole("radio", {name: "System"}).check();
    expect(await page.evaluate(() => localStorage.getItem("aurea-theme"))).toBe("system");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({colorScheme: "dark"});
    await expect(page.locator("html"), "o computador mudou: o site muda junto").toHaveAttribute("data-theme", "dark");
    await page.reload();
    await page.waitForLoadState("load");
    await expect(page.locator("html"), "a escolha volta ao abrir de novo").toHaveAttribute("data-theme", "dark");
    await expect(page.locator(".topbar-actions").getByRole("radio", {name: "System"})).toBeChecked();
    await page.locator(".topbar-actions").getByRole("radio", {name: "Light"}).check();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({colorScheme: "dark"});
    await expect(page.locator("html"), "escolhido Claro, o computador não manda mais").toHaveAttribute("data-theme", "light");
    // 15/10/2026 (o Victor: "some o ícone quando clica"): a escolhida desenha a forma CHEIA, e o sprite da página só
    // tinha a da lua — a página sai pronta com o escuro. Em cada uma das três, todo desenho da chave existe na página.
    for (const nome of ["Light", "Dark", "System"]) {
      await page.locator(".topbar-actions").getByRole("radio", {name: nome}).check();
      const faltando = await page.evaluate(() => [...document.querySelectorAll(".topbar-actions .theme-switch-option use")]
        .map((u) => u.getAttribute("href")!).filter((h) => !document.getElementById(h.slice(1))));
      expect(faltando, `o desenho da escolhida (${nome})`).toEqual([]);
      // PINTADA (o Victor, 15/10/2026: "o sol deve ficar amarelo… a lua quero um preto absoluto"): a escolhida é branca nos
      // dois temas, o sol no amarelo da marca, puro (a "B" dele; o de ícone do claro saiu marrom), a lua e o monitor no
      // preto absoluto.
      const pintura = await page.evaluate(() => {
        const op = [...document.querySelectorAll(".topbar-actions .theme-switch-option")].find((o) => o.querySelector(":checked"))!;
        const raiz = getComputedStyle(document.documentElement);
        const cor = (v: string) => { const t = document.createElement("i"); t.style.color = raiz.getPropertyValue(v); document.body.append(t);
          const c = getComputedStyle(t).color; t.remove(); return c; };
        return {fundo: getComputedStyle(op).backgroundColor, icone: getComputedStyle(op.querySelector(".icon")!).color,
          branco: cor("--white"), preto: cor("--black"), amarelo: cor("--brand-yellow")};
      });
      expect(pintura.fundo, `a escolhida é branca (${nome})`).toBe(pintura.branco);
      expect(pintura.icone, `o ícone da escolhida (${nome})`).toBe(nome === "Light" ? pintura.amarelo : pintura.preto);
    }
    await page.evaluate(() => localStorage.removeItem("aurea-theme"));
    // O rodapé: uma linha centrada, 44 de altura (12 + 20 + 12), a frase, os dois links e o GitHub.
    const rodape = page.locator("footer.section-footer-inline");
    await expect(rodape).toContainText("Open source under Apache-2.0.");
    await expect(rodape.getByRole("link")).toHaveText(["Changelog", "License", ""]);
    await expect(rodape.getByRole("link", {name: "GitHub"})).toHaveAttribute("href", "https://github.com/victor1mor/aurea-uds");
    expect(Math.round((await rodape.boundingBox())!.height)).toBe(44);
  });

  // 15/10/2026 — o Victor: "a caixa do tema está sendo cortada". Medido: de 768 a 949 o topo do Início quebrava em duas
  // linhas e passava da borda. Como a referência entre 768 e 1023: uma linha, a chave de tema e o GitHub dentro da
  // setinha (a janelinha cabe na tela), e o "Theme" só de ícone, do tamanho dos vizinhos. Provado contra o defeito: na
  // versão anterior, 86 de altura em 800.
  // 15/10/2026 — o Victor: "a caixa dos temas continua cortando". Medido: a borda de cima da escolha de tema ficava por
  // baixo do topo fixo (camada 20), porque a camada das janelinhas estava na caixa de dentro, estática, e não no
  // posicionador do motor. Provado contra o defeito: antes, o ponto de cima da caixa era do topo da página.
  test("a escolha de tema abre por cima do topo, com a borda de cima inteira", async ({page}) => {
    await page.setViewportSize({width: 1280, height: 800});
    await page.goto("/apps/catalog/index.html");
    await page.getByRole("button", {name: /Design theme/}).click();
    const caixa = page.locator(".popover:has(.color-swatch)");
    await expect(caixa).toBeVisible();
    const cobre = await caixa.evaluate((p) => {
      const r = p.getBoundingClientRect();
      return [0.25, 0.5, 0.75].map((f) => !!document.elementFromPoint(r.left + r.width * f, r.top + 1)?.closest(".popover"));
    });
    expect(cobre, "a borda de cima é da caixa, de ponta a ponta").toEqual([true, true, true]);
  });

  test("o topo do Início cabe numa linha de 768 a 1023, com a setinha da referência", async ({page}) => {
    await page.goto("/apps/catalog/index.html");
    for (const largura of [768, 850, 1023]) {
      await page.setViewportSize({width: largura, height: 800});
      // a troca do "Theme" para só o ícone é do vivo, no aviso de mudança de largura: espera ela (o WebKit mede antes)
      await expect.poll(() => page.locator("#site-theme-root .btn").evaluate((b) => b.getBoundingClientRect().width)).toBe(32);
      const m = await page.evaluate(() => {
        const topo = document.querySelector(".site-top")!;
        const visiveis = [...topo.querySelectorAll(".topbar-actions > *, .topbar-nav")].filter((e) => e.getBoundingClientRect().width > 0);
        const nav = topo.querySelector(".topbar-nav")!.getBoundingClientRect(), acoes = topo.querySelector(".topbar-actions")!.getBoundingClientRect();
        return {altura: topo.getBoundingClientRect().height, tela: document.documentElement.clientWidth,
          direita: Math.max(...visiveis.map((e) => e.getBoundingClientRect().right)), folga: acoes.left - nav.right,
          botoes: [...topo.querySelectorAll(".topbar-actions .btn")].filter((e) => e.getBoundingClientRect().width > 0)
            .map((e) => Math.round(e.getBoundingClientRect().height))};
      });
      expect(m.altura, `${largura}: uma linha`).toBe(56);
      expect(m.direita, `${largura}: nada passa da borda`).toBeLessThanOrEqual(m.tela);
      expect(m.folga, `${largura}: folga para a barra de rolagem do Windows`).toBeGreaterThanOrEqual(16);
      expect(new Set(m.botoes), `${largura}: os botões do mesmo tamanho`).toEqual(new Set([32]));
    }
    await page.setViewportSize({width: 850, height: 800});
    await page.getByRole("button", {name: "More"}).click();
    const janela = page.locator(".popover:has(.theme-switch)");
    await expect(janela.getByRole("radiogroup", {name: "Theme", exact: true})).toBeVisible();
    await expect(janela.getByRole("link", {name: "GitHub"})).toBeVisible();
    const caixa = (await janela.boundingBox())!;
    expect(caixa.x + caixa.width).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
  });

  // 15/10/2026 — o Victor, com a busca da Aurea ao lado do campo da referência: "de um lado é curto (correto), do outro
  // é largo". Medido: borda 13, o glifo, e o texto a 24 (28 no lg) — o campo somava o recuo dele aos 12 do adorno. A
  // referência: 12, o glifo, 12 (o campo com prefixo) e 12, a lupa, 8 (a busca); no fim, texto a 12 da borda.
  // Provado contra o defeito: na peça velha, o de dentro é 24.
  test("o campo com ícone: 12, o ícone, 12; a busca, 12, a lupa, 8; o texto do fim, 12 da borda", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    const medir = () => page.evaluate(() => [...document.querySelectorAll(".input-group")].flatMap((g) => {
      const gr = g.getBoundingClientRect();
      if (!gr.width) return [];
      const borda = parseFloat(getComputedStyle(g).borderLeftWidth);
      const inp = g.querySelector<HTMLInputElement>(":scope > .input")!;
      const cs = getComputedStyle(inp), ir = inp.getBoundingClientRect();
      const texto = ir.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
      const icone = g.querySelector(":scope > .input-group-addon-start svg")?.getBoundingClientRect();
      const fim = g.querySelector(":scope > .input-group-addon-end");
      let foraFim: number | null = null;
      if (fim && !fim.querySelector(".btn, .kbd")) {
        const rg = document.createRange(); rg.selectNodeContents(fim);
        foraFim = gr.right - borda - rg.getBoundingClientRect().right;
      }
      return [{busca: g.classList.contains("search-field"), fora: icone ? icone.left - gr.left - borda : null,
        dentro: icone ? texto - icone.right : null, foraFim}];
    }));
    await page.goto("/apps/catalog/searchfield.html");
    const buscas = (await medir()).filter((m) => m.busca && m.fora !== null);
    expect(buscas.length).toBeGreaterThan(0);
    for (const m of buscas) { expect(m.fora).toBeCloseTo(12, 0); expect(m.dentro, "a busca: a lupa a 8 do texto").toBeCloseTo(8, 0); }
    await page.goto("/apps/catalog/inputgroupaddon.html");
    const comIcone = (await medir()).filter((m) => !m.busca && m.fora !== null);
    expect(comIcone.length).toBeGreaterThan(0);
    for (const m of comIcone) { expect(m.fora).toBeCloseTo(12, 0); expect(m.dentro, "o ícone a 12 do texto").toBeCloseTo(12, 0); }
    await page.goto("/apps/catalog/inputgroup.html");
    const comFim = (await medir()).filter((m) => m.foraFim !== null);
    expect(comFim.length).toBeGreaterThan(0);
    for (const m of comFim) expect(m.foraFim, "o texto do fim a 12 da borda (era 4)").toBeCloseTo(12, 0);
  });

  // 15/10/2026 (B, aprovada): a linha entre as seções, como em todos os exemplos de seções da referência. É BORDA (fica
  // no alto contraste), de 1, 8 para dentro de cada lado. Provado contra o defeito: na 0.32.0, nenhuma linha.
  test("a ListBox com seções tem a linha entre elas, de borda, 8 para dentro", async ({page}) => {
    await page.goto("/apps/catalog/listbox.html");
    const linhas = await page.evaluate(() => [...document.querySelectorAll(".list-box-section + .list-box-section")].map((s) => {
      const b = getComputedStyle(s, "::before");
      return {estilo: b.borderTopStyle, largura: b.borderTopWidth, recuo: [b.marginLeft, b.marginRight]};
    }));
    expect(linhas.length).toBeGreaterThan(0);
    for (const l of linhas) expect(l).toEqual({estilo: "solid", largura: "1px", recuo: ["8px", "8px"]});
  });

  // 15/10/2026: o título e a descrição do `Card.Header` colados (uma regra antiga os separava em 16), e 12 até o conteúdo.
  test("o Card.Header: título e descrição colados, e 12 até o conteúdo", async ({page}) => {
    await page.goto("/apps/catalog/card.html");
    const m = await page.locator(".card:has(> .card-header .card-description)").first().evaluate((c) => {
      const r = (s: string) => c.querySelector(s)!.getBoundingClientRect();
      return {colados: r(".card-description").top - r(".card-title").bottom, ateConteudo: r(".card-content").top - r(".card-header").bottom};
    });
    expect(m.colados).toBeCloseTo(0, 0);
    expect(m.ateConteudo).toBeCloseTo(12, 0);
  });

  // 15/10/2026 (A): a chave no fim, como o "Allow notifications" da referência.
  test("o Switch com indicatorPlacement=end: o nome à esquerda, a chave à direita", async ({page}) => {
    await page.goto("/apps/catalog/switch.html");
    const m = await page.locator(".switch-end").first().evaluate((s) => ({
      texto: s.querySelector(":scope > span:not(.switch-track)")!.getBoundingClientRect().right,
      chave: s.querySelector(".switch-track")!.getBoundingClientRect().left}));
    expect(m.chave).toBeGreaterThan(m.texto);
  });

  // 15/10/2026: o "Ctrl" e o "K" separados, como a busca da referência, e o leitor ouve a combinação.
  test("a busca do topo: uma caixinha por tecla, e o atalho anunciado como Control+K", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/apps/catalog/button.html");
    const busca = page.locator(".site-search");
    await expect(busca.locator("kbd")).toHaveText(["Ctrl", "K"]);
    await expect(busca).toHaveAttribute("aria-keyshortcuts", "Control+K");
    // E na PONTA do botão (o Victor, 15/10/2026, com a seta até a borda direita): a última tecla a um recuo da borda,
    // longe do texto. Provado contra o defeito: com as teclas coladas no "Search", sobravam ~230 até a borda.
    const m = await busca.evaluate((b) => {
      const r = b.getBoundingClientRect(), k = [...b.querySelectorAll("kbd")].at(-1)!.getBoundingClientRect();
      return {sobra: r.right - k.right, recuo: parseFloat(getComputedStyle(b).paddingRight) + parseFloat(getComputedStyle(b).borderRightWidth)};
    });
    expect(m.sobra, "a última tecla encosta no recuo da borda direita").toBeCloseTo(m.recuo, 0);
  });

  // 15/10/2026 (C): a vitrine "Components" do Início, a da referência — três colunas a 32, peças a 40, campos de 256; no
  // celular uma coluna, a do meio primeiro; VIVA (a lista abre e escolhe; a aba troca).
  test("a vitrine Components: as colunas da referência, viva, e uma coluna no celular", async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/apps/catalog/index.html");
    await expect(page.locator(".home-abas [role=tab]").first()).toHaveText("Components");
    const m = await page.evaluate(() => {
      const cols = [...document.querySelectorAll(".vit-col")].map((c) => c.getBoundingClientRect());
      const a = [...document.querySelector(".vit-col-a")!.children].map((e) => e.getBoundingClientRect());
      return {vaos: [cols[1].left - cols[0].right, cols[2].left - cols[1].right],
        pecas: a.slice(1).map((r, i) => r.top - a[i].bottom),
        campos: [...document.querySelectorAll(".vit-256")].map((e) => e.getBoundingClientRect().width)};
    });
    for (const v of m.vaos) expect(v).toBeCloseTo(32, 0);
    for (const v of m.pecas) expect(v).toBeCloseTo(40, 0);
    for (const w of m.campos) expect(w).toBeCloseTo(256, 0);
    // viva: a lista de estados abre e escolhe; o período troca
    await page.locator(".vit-col-a .select-trigger").click();
    await page.getByRole("option", {name: "Texas"}).click();
    await expect(page.locator(".vit-col-a .select-trigger")).toContainText("Texas");
    await page.locator(".vit-col-a .segmented").first().getByRole("radio", {name: "7D"}).click();
    await expect(page.locator(".vit-col-a .segmented").first().getByRole("radio", {name: "7D"})).toHaveClass(/\bactive\b/);
    await page.setViewportSize({width: 375, height: 812});
    const ordem = await page.evaluate(() => [...document.querySelectorAll(".vit-col")]
      .map((c) => ({classe: [...c.classList].find((x) => /^vit-col-/.test(x)), topo: c.getBoundingClientRect().top}))
      .sort((x, y) => x.topo - y.topo).map((x) => x.classe));
    expect(ordem).toEqual(["vit-col-b", "vit-col-a", "vit-col-c"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
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
