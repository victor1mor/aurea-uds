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
  {pagina: "tokens.html", area: "Tokens", grupos: ["Overview"], itens: ["All Tokens"]},
  // As notas de versão (lote U, 19/10/2026): a área própria, como a da referência.
  {pagina: "release-v0-35-0.html", area: "Releases", grupos: ["Overview", "Releases"], itens: ["All Releases", "v0.35.0", "v0.1.0"]},
  {pagina: "hooks.html", area: "Hooks", grupos: ["Overview", "Hooks"], itens: ["All Hooks"]},
  {pagina: "usetoast.html", area: "Hooks", grupos: ["Overview", "Hooks"], itens: ["All Hooks", "useToast"]},
  {pagina: "button.html", area: "Components", grupos: ["Overview", "Components"], itens: ["All Components", "Button"]},
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

test("o anterior e o próximo são os vizinhos na lateral da área", async ({page}) => {
  for (const [pagina, antes, depois] of [["carousel.html", "Card", "Chart"], ["accessgate.html", "All Components", "Accordion"],
    // Na área Getting Started o vizinho atravessa o grupo, como na referência: depois do último do Overview, o primeiro do Handbook.
    ["docs-roadmap.html", "Showcase", "Colors"], ["docs-quick-start.html", "Introduction", "Design Principles"],
    // Nas notas, da mais nova para a mais velha, como na lateral.
    ["release-v0-34-0.html", "v0.35.0", "v0.33.0"]]) {
    await page.goto(`${base}/apps/catalog/${pagina}`);
    const pn = page.locator('nav[aria-label="Previous and next"] strong');
    await expect(pn, pagina).toHaveText([antes, depois]);
  }
});
