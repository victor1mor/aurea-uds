import {test, expect} from "@playwright/test";

// A ÁREA GETTING STARTED (lote U, SITE-03, 18/10/2026): as páginas de documentação da referência, com a cara da Aurea.
// O texto de cada página mora em `apps/catalog/content/docs/*.md` (o leitor é o `scripts/docs-markdown.mjs`, coberto no
// `tests/unit/docs-markdown.test.tsx`); aqui se cobra o que só o navegador vê.
// Provado contra o defeito (18/10/2026): contra o site do `main` de antes (`BASE_SITE=http://127.0.0.1:8128`), três
// reprovam — lá não há páginas `docs-*` nem ícone na lateral. O do Início passa lá (o nome era "Docs") e reprova aqui sem
// a troca do nome no topo do Início. As caixas de exemplo de Theming e Density rolavam por dentro (324 e 356 de 300) até
// o arranjo delas mudar.
const base = process.env.BASE_SITE ?? "";
const PAGINAS = ["getting-started", "docs-quick-start", "docs-design-principles", "docs-frameworks", "docs-showcase",
  "docs-roadmap", "docs-colors", "docs-theming", "docs-dark-mode", "docs-styling", "docs-animation", "docs-composition",
  "docs-density", "docs-icons", "docs-rtl", "docs-accessibility"];

test("cada item da lateral da área tem o seu ícone, como os da referência", async ({page}) => {
  await page.goto(`${base}/apps/catalog/docs-quick-start.html`);
  await expect(page.locator(".topbar-tab[aria-current]")).toHaveText("Getting Started");
  const itens = page.locator(".app-shell > .sidebar:not(.app-shell-aside) .sidebar-item");
  await expect(itens).toHaveCount(PAGINAS.length);
  for (const item of await itens.all()) await expect(item.locator("svg"), await item.innerText()).toHaveCount(1);
});

test("no Início a área se chama Docs, como no Início da referência, e o topo fica numa linha de 768 a 1023", async ({page}) => {
  for (const w of [776, 800, 1023]) {
    await page.setViewportSize({width: w, height: 663});
    await page.goto(`${base}/apps/catalog/index.html`);
    await expect(page.locator("header nav a", {hasText: "Docs"}).first()).toBeVisible();
    const h = await page.locator("header").first().evaluate((e) => e.getBoundingClientRect().height);
    expect(h, `${w}: a barra de cima`).toBe(56);
  }
});

test("nenhuma caixa de exemplo das páginas rola por dentro (ADR-0002)", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 663});
  for (const p of PAGINAS) {
    await page.goto(`${base}/apps/catalog/${p}.html`);
    await expect(page.locator(".prose").first(), p).toBeVisible();
    const caixas = await page.locator('.prose .demo-panel[data-panel="preview"]').evaluateAll((ps) =>
      ps.map((e) => [e.clientHeight, e.scrollHeight, e.clientWidth, e.scrollWidth]));
    for (const [ch, sh, cw, sw] of caixas) {
      expect(sh, `${p}: altura`).toBeLessThanOrEqual(ch);
      expect(sw, `${p}: largura`).toBeLessThanOrEqual(cw);
    }
  }
});

test("o Copy Markdown leva o texto da página, com o título e a descrição, e sem a marca do exemplo", async ({page}) => {
  await page.goto(`${base}/apps/catalog/docs-quick-start.html`);
  const md = JSON.parse(await page.locator("#page-markdown").textContent() ?? "null") as string;
  expect(md.startsWith("# Quick Start\n\n")).toBe(true);
  expect(md).toContain('<Button variant="primary">Save</Button>');
  expect(md).not.toContain(":::");
});
