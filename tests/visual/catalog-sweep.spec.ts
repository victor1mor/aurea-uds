import {test, expect} from "@playwright/test";
import {readdirSync} from "node:fs";
import {join} from "node:path";
// O MESMO dado que o gerador consome (ADR-0001, Fase 7). Um gate que declarasse suas próprias
// seções seria um segundo modelo escondido — e é a divergência que o achado I2 mediu.
import {allowed, required, SELECTOR, pageType} from "../../scripts/page-model.mjs";

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

// A escala Tailwind travada pelo gate do projeto, mais os dois extremos reais de celular.
const WIDTHS = [320, 375, 640, 768, 1024, 1280, 1536];
const AXE = join(process.cwd(), "node_modules/.pnpm/axe-core@4.10.2/node_modules/axe-core/axe.min.js");

test.describe("catálogo · varredura de todas as páginas", () => {
  test.describe.configure({timeout: 15 * 60 * 1000});

  test("nenhuma página rola de lado, em nenhuma largura", async ({page}) => {
    const falhas: string[] = [];
    for (const f of PAGES) {
      await page.goto(url(f));
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
      await page.goto(url(f));
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
      await page.goto(url(f));
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
      await page.goto(url(f));
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
      await page.goto(url(f));
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
      await page.goto(url(f));
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
      await page.goto(url(f));
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
      await page.goto(url(f));
      await page.waitForTimeout(60);
      for (let i = antes; i < falhas.length; i++) falhas[i] = `${f} → ${falhas[i]}`;
    }
    expect([...new Set(falhas)], `erros de página:\n${[...new Set(falhas)].join("\n")}`).toEqual([]);
  });

  for (const theme of ["dark", "light"] as const) {
    test(`axe sem violação em todas as páginas · tema ${theme}`, async ({page}) => {
      const falhas: string[] = [];
      for (const f of PAGES) {
        await page.goto(url(f));
        if (theme === "light") {
          await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
          // a transição de cor do core interpola por ~150ms; medir antes disso lê cor
          // intermediária e inventa violação de contraste que não existe.
          await page.waitForTimeout(250);
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
});

// Contratos comportamentais do catálogo. Ficam neste spec, não em catalog.spec.ts: aquele é
// captura de pixel e roda só no Chromium; estes precisam cobrir os três motores.
test.describe("catálogo · contratos do modelo de página", () => {
  test("toda página de componente tem breadcrumb, demo, Installation e prev/next", async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    await expect(page.locator(".crumb")).toBeVisible();
    await expect(page.locator(".demo").first()).toBeVisible();
    await expect(page.locator("#installation")).toBeAttached();
    await expect(page.locator(".prevnext a").first()).toBeAttached();
  });

  test("o item ativo da lateral e a área ativa do topo se marcam com aria-current", async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    await expect(page.locator('.doc-nav a[aria-current="page"]')).toHaveText("Button");
    await expect(page.locator('.btn-nav[aria-current="page"]')).toContainText("Components");
  });

  test("cada item da lateral leva seu glifo (campo icon da ficha)", async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    const itens = page.locator(".doc-nav a");
    const glifos = page.locator(".doc-nav a svg");
    expect(await glifos.count()).toBe(await itens.count());
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
