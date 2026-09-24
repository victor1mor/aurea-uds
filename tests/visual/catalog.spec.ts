import {test, expect} from "@playwright/test";

// Gate visual do CATÁLOGO. Até aqui as 147 páginas não tinham baseline nenhuma: regressão de
// pixel só era pega no olho do Victor, e o catálogo é a superfície que ele revisa. Cobre UMA
// página de cada TIPO (índice, componente exemplar, pattern, block, recipe, tokens) nos DOIS
// temas — não as 147, porque o que se prova aqui é o CHROME e o modelo de página, que são
// gerados pelo mesmo código para todas. Página nova de um tipo já coberto não pede baseline.
//
// Recorte por seletor, não a página inteira: baseline de página inteira quebra a cada linha de
// conteúdo novo e ninguém olha o diff depois da terceira vez.
const PAGES = [
  {name: "index", url: "/apps/catalog/index.html", clip: ".app-shell"},
  {name: "componente", url: "/apps/catalog/button.html", clip: ".page-main > .block:nth-of-type(1)"},
  {name: "pattern", url: "/apps/catalog/pattern-button-with-kbd.html", clip: ".page-main"},
  {name: "block", url: "/apps/catalog/block-stats-row.html", clip: ".page-main > .block:nth-of-type(1)"},
  {name: "recipe", url: "/apps/catalog/recipe-saas-admin.html", clip: ".page-head"},
  {name: "tokens", url: "/apps/catalog/tokens.html", clip: ".page-main > .block:nth-of-type(1)"},
  {name: "lateral", url: "/apps/catalog/button.html", clip: ".sidebar"},
  {name: "topo", url: "/apps/catalog/button.html", clip: ".topbar"},
];

for (const theme of ["dark", "light"] as const) {
  test.describe(`catálogo · tema ${theme}`, () => {
    for (const page of PAGES) {
      test(page.name, async ({page: p}) => {
        await p.setViewportSize({width: 1440, height: 1000});
        await p.goto(page.url);
        // o tema vem no markup como dark; trocar exige esperar a transição de cor terminar,
        // senão a captura pega valores interpolados e a baseline fica instável.
        if (theme === "light") {
          await p.evaluate(() => { document.documentElement.dataset.theme = "light"; });
          await p.waitForTimeout(600);
        }
        // O topo é sticky: quando o Playwright rola o recorte para dentro da tela, a barra passa
        // POR CIMA da primeira faixa dele e a captura muda conforme a posição de rolagem — 26px
        // de diferença que não vêm de mudança nenhuma. Mascarar a barra torna a captura
        // determinística. No teste da própria barra, mascarar seria apagar o objeto do teste.
        const mask = page.name === "topo" ? [] : [p.locator(".topbar")];
        await expect(p.locator(page.clip).first()).toHaveScreenshot(`${theme}-catalogo-${page.name}.png`, {mask});
      });
    }
  });
}
