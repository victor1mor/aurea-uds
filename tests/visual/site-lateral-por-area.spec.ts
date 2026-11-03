import {test, expect} from "@playwright/test";

// CADA ÁREA DO SITE COM A SUA LATERAL (lote T, 17/10/2026). Docs, Hooks e Tokens usavam o menu de Components: a página
// de Tokens mostrava "Getting Started" e a lista de componentes (o Victor viu: "adivinha?"). Na documentação da
// referência cada área do topo tem a sua árvore, e o anterior/próximo são os vizinhos NELA. Aqui se cobra as duas coisas,
// e que a área marcada no topo é a da página (a página de um hook marca "Hooks").
// Provado contra o defeito (17/10/2026): contra a 0.34.0 publicada (`BASE_SITE=http://127.0.0.1:8128`), reprova.
const base = process.env.BASE_SITE ?? "";
// No site B (31/10/2026) os grupos da Getting Started levam o número e o ladrilho do ícone: o nome é o `.site-grupo-nome`.
const grupos = (page: import("@playwright/test").Page) =>
  page.locator(".app-shell > .sidebar:not(.app-shell-aside) .sidebar-group-label").evaluateAll((l) =>
    l.map((e) => (e.querySelector(".site-grupo-nome") ?? e).textContent));

const CASOS = [
  // A área Getting Started com a árvore da referência (lote U, SITE-03 e SITE-06, 18/10/2026): Overview, Handbook e UI for Agents.
  {pagina: "getting-started.html", area: "Getting Started", grupos: ["Overview", "Handbook", "UI for Agents"], itens: ["Introduction", "Quick Start", "Colors", "Accessibility"]},
  {pagina: "docs-theming.html", area: "Getting Started", grupos: ["Overview", "Handbook", "UI for Agents"], itens: ["Introduction", "Theming"]},
  // O SITE B (02/11/2026): Tokens, Releases e Hooks com a lateral do desenho — o filtro e o "On this page" de cada área.
  {pagina: "tokens.html", area: "Tokens", grupos: ["Overview", "By $type", "On this page"], itens: ["All Tokens", "color", "Color roles"]},
  // As notas de versão (lote U, 19/10/2026): a área própria, como a da referência.
  {pagina: "release-v0-35-0.html", area: "Releases", grupos: ["Overview", "By month"], itens: ["All Releases", "Health", "10October 2026"]},
  // Hooks e Recipes no padrão de Components (o Victor, 03/11/2026: "quero mesmo sidebar dos outros, como dos componentes"):
  // "All …" sozinho no alto e um grupo numerado, com o ícone — sem o "On this page" repetido.
  {pagina: "hooks.html", area: "Hooks", grupos: ["Hooks"], itens: ["All Hooks", "useToast"]},
  {pagina: "usetoast.html", area: "Hooks", grupos: ["Hooks"], itens: ["All Hooks", "useToast"]},
  {pagina: "recipes.html", area: "Recipes", grupos: ["Recipes"], itens: ["All Recipes", "Developer tools"]},
  // O site B (01/11/2026): a lateral de Components no padrão da Getting Started — as famílias, numeradas.
  {pagina: "button.html", area: "Components", grupos: ["Buttons", "Collections", "Colors", "Controls", "Data Display", "Date and Time",
    "Feedback", "Forms", "Layout", "Media", "Navigation", "Overlays", "Pickers", "Typography", "Utilities", "AI & Agents", "Code",
    "Communication"], itens: ["All Components", "Button"]},
];

for (const c of CASOS) {
  test(`a lateral de ${c.pagina} é a da área ${c.area}`, async ({page}) => {
    await page.goto(`${base}/apps/catalog/${c.pagina}`);
    await expect(page.locator(".site-areas a[aria-current]")).toHaveText(c.area);
    expect(await grupos(page)).toEqual(c.grupos);
    const nomes = await page.locator(".app-shell > .sidebar:not(.app-shell-aside) .sidebar-label").allTextContents();
    for (const item of c.itens) expect(nomes, `"${item}" está na lateral`).toContain(item);
    // O que é de outra área não aparece: a Introduction só no Getting Started, os componentes só em Components.
    if (c.area !== "Getting Started") expect(nomes).not.toContain("Introduction");
    if (c.area !== "Components") expect(nomes).not.toContain("Button");
  });
}

// O SITE B (0.54.0): as páginas da Getting Started terminam no cartão "Next", como a Introduction do desenho — o próximo
// atravessa o grupo, como na referência: depois do último do Overview, o primeiro do Handbook.
test("na Getting Started do site B, o Next é o vizinho seguinte na lateral", async ({page}) => {
  for (const [pagina, depois] of [["docs-roadmap.html", "Colors"], ["docs-quick-start.html", "Design Principles"]]) {
    await page.goto(`${base}/apps/catalog/${pagina}`);
    await expect(page.locator("a.intro-proxima b"), pagina).toHaveText(depois);
  }
});

test("o anterior e o próximo são os vizinhos na lateral da área", async ({page}) => {
  // Em Components, a ordem das famílias (o site B, 01/11/2026): o Carousel é da Media; "All Components" vem antes do Button.
  for (const [pagina, antes, depois] of [["carousel.html", "AvatarGroup", "Gallery"], ["button.html", "All Components", "ButtonGroup"],
    // Nas notas, da mais nova para a mais velha, como na lateral.
    ["release-v0-34-0.html", "v0.35.0", "v0.33.0"]]) {
    await page.goto(`${base}/apps/catalog/${pagina}`);
    const pn = page.locator('nav[aria-label="Previous and next"] strong');
    await expect(pn, pagina).toHaveText([antes, depois]);
  }
});
