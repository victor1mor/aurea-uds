import {test, expect} from "@playwright/test";

// CADA ÁREA DO SITE COM A SUA LATERAL (lote T, 17/10/2026). Docs, Hooks e Tokens usavam o menu de Components: a página
// de Tokens mostrava "Getting Started" e a lista de componentes (o Victor viu: "adivinha?"). Na documentação da
// referência cada área do topo tem a sua árvore, e o anterior/próximo são os vizinhos NELA. Aqui se cobra as duas coisas,
// e que a área marcada no topo é a da página (a página de um hook marca "Hooks").
// Provado contra o defeito (17/10/2026): contra a 0.34.0 publicada (`BASE_SITE=http://127.0.0.1:8128`), reprova.
const base = process.env.BASE_SITE ?? "";
const grupos = (page: import("@playwright/test").Page) =>
  page.locator(".app-shell > .sidebar:not(.app-shell-aside) .sidebar-group-label").allTextContents();

const CASOS = [
  {pagina: "getting-started.html", area: "Docs", grupos: ["Overview"], itens: ["Getting Started"]},
  {pagina: "tokens.html", area: "Tokens", grupos: ["Overview"], itens: ["All Tokens"]},
  {pagina: "hooks.html", area: "Hooks", grupos: ["Overview", "Hooks"], itens: ["All Hooks"]},
  {pagina: "usetoast.html", area: "Hooks", grupos: ["Overview", "Hooks"], itens: ["All Hooks", "useToast"]},
  {pagina: "button.html", area: "Components", grupos: ["Overview", "Components"], itens: ["All Components", "Button"]},
];

for (const c of CASOS) {
  test(`a lateral de ${c.pagina} é a da área ${c.area}`, async ({page}) => {
    await page.goto(`${base}/apps/catalog/${c.pagina}`);
    await expect(page.locator(".topbar-tab[aria-current]")).toHaveText(c.area);
    expect(await grupos(page)).toEqual(c.grupos);
    const nomes = await page.locator(".app-shell > .sidebar:not(.app-shell-aside) .sidebar-label").allTextContents();
    for (const item of c.itens) expect(nomes, `"${item}" está na lateral`).toContain(item);
    // O que é de outra área não aparece: o Getting Started só em Docs, os componentes só em Components.
    if (c.area !== "Docs") expect(nomes).not.toContain("Getting Started");
    if (c.area !== "Components") expect(nomes).not.toContain("Button");
  });
}

test("o anterior e o próximo são os vizinhos na lateral da área", async ({page}) => {
  for (const [pagina, antes, depois] of [["carousel.html", "Card", "Chart"], ["accessgate.html", "All Components", "Accordion"]]) {
    await page.goto(`${base}/apps/catalog/${pagina}`);
    const pn = page.locator('nav[aria-label="Previous and next"] strong');
    await expect(pn, pagina).toHaveText([antes, depois]);
  }
});
