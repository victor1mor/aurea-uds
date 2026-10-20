import {test, expect, type Page} from "@playwright/test";

// O ARRANJO DE DOCUMENTAÇÃO NO CELULAR E NO TABLET (lote U, 19/10/2026 — o Victor: "tudo como ela"), medido na página da
// documentação da referência a 375, 768 e 1100 e repetido aqui como número: o topo do celular em duas linhas, com os botões
// só de ícone e o da gaveta no fim; a gaveta pela direita, com a chave claro/escuro no alto; a barra do índice abaixo do
// topo até 1279, com a seção em vista; a lateral como coluna desde 768. E o "Copy Prompt" só nas páginas de começar.
// Provado contra o defeito (19/10/2026): contra o site do `main` de antes (`BASE_SITE=http://127.0.0.1:8128`), reprovam.
const base = process.env.BASE_SITE ?? "";
const abrir = async (page: Page, w: number, pagina = "button.html") => {
  await page.setViewportSize({width: w, height: 760});
  await page.goto(`${base}/apps/catalog/${pagina}`);
};
const caixa = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => {
  const b = e.getBoundingClientRect();
  return {x: b.left, y: b.top, w: b.width, h: b.height, direita: b.right, baixo: b.bottom};
});
const perto = (a: number, b: number, nome: string) => expect(Math.abs(a - b), `${nome}: ${a} (esperado ${b})`).toBeLessThanOrEqual(1);

test("375: o topo em duas linhas, a lupa no lugar da busca larga e o botão da gaveta por último, à direita", async ({page}) => {
  await abrir(page, 375);
  perto((await caixa(page, ".topbar")).h, 100, "o topo: a linha dos botões e a das áreas");
  await expect(page.locator(".site-search")).toBeHidden();
  await expect(page.getByRole("link", {name: "Search"})).toBeVisible();
  await expect(page.locator(".topbar .site-theme-switch")).toBeHidden();
  const gaveta = await caixa(page, ".topbar .nav-toggle");
  perto(gaveta.direita, 375 - 16, "o botão da gaveta na ponta direita");
  // Os botões numa linha só, da mesma altura.
  const linha = await page.locator(".topbar-inner > :not(.topbar-tabs) :is(a.btn, button.btn), .topbar-inner > :is(a.btn, button.btn)").evaluateAll((l) =>
    l.filter((e) => e.getClientRects().length).map((e) => [Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().height)]));
  expect(linha.length).toBe(4);
  for (const [y, h] of linha) { expect(y).toBe(linha[0][0]); expect(h).toBe(linha[0][1]); }
  const pagina = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(pagina[0], "a página não rola de lado").toBeLessThanOrEqual(pagina[1]);
});

// Com o DEDO (ponteiro grosso), os botões sobem para os 44 de toque da Aurea e continuam numa linha, sem rolar de lado. Só
// no Chromium: é o único dos três que o Playwright faz se passar por celular com toque.
test("375 com toque: os botões com 44, numa linha, e a página não rola de lado", async ({browser, browserName}) => {
  test.skip(browserName !== "chromium", "só o Chromium simula o toque");
  const ctx = await browser.newContext({viewport: {width: 375, height: 760}, isMobile: true, hasTouch: true});
  const page = await ctx.newPage();
  await page.goto(`${base}/apps/catalog/button.html`);
  const linha = await page.locator(".topbar-inner > :not(.topbar-tabs) :is(a.btn, button.btn), .topbar-inner > :is(a.btn, button.btn)").evaluateAll((l) =>
    l.filter((e) => e.getClientRects().length).map((e) => [Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().height)]));
  expect(linha.length).toBe(4);
  for (const [y, h] of linha) { expect(y).toBe(linha[0][0]); expect(h).toBe(44); }
  const pagina = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(pagina[0]).toBeLessThanOrEqual(pagina[1]);
  await ctx.close();
});

test("375: a gaveta abre pela direita, com fundo, e a chave claro/escuro no alto dela", async ({page}) => {
  await abrir(page, 375);
  await page.getByRole("button", {name: "Navigation"}).click();
  const gaveta = page.locator(".app-shell > .sidebar:not(.app-shell-aside)");
  await expect(gaveta).toBeVisible();
  perto((await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside)")).direita, 375 - 16, "encostada à direita");
  expect(await gaveta.evaluate((e) => getComputedStyle(e).backgroundColor), "a gaveta tem fundo").not.toBe("rgba(0, 0, 0, 0)");
  const chave = await caixa(page, ".app-shell > .sidebar .site-gaveta-topo");
  const primeiro = await caixa(page, ".app-shell > .sidebar .sidebar-nav");
  expect(chave.baixo, "a chave fica acima da lista").toBeLessThanOrEqual(primeiro.y);
});

test("abaixo de 1280, a barra do índice mostra a seção em vista e desce a lista", async ({page}) => {
  for (const w of [375, 768, 1100]) {
    await abrir(page, w);
    const barra = await caixa(page, ".docs-toc-bar");
    perto(barra.y, 100, `${w}: logo abaixo do topo`);
    perto(barra.h, 40, `${w}: com 40`);
    await expect(page.locator("[data-toc-current]")).toHaveText("Usage");
    await page.locator(".docs-toc-toggle").click();
    const indice = page.locator(".app-shell-aside");
    await expect(indice).toBeVisible();
    perto((await caixa(page, ".app-shell-aside")).y, 140, `${w}: a lista desce da barra`);
    // Escolher uma seção leva a ela e fecha a lista.
    await indice.getByRole("link", {name: "Disabled", exact: true}).click();
    await expect(indice).toBeHidden();
    await expect(page.locator("[data-toc-current]")).toHaveText("Disabled");
  }
});

test("de 768 a 1279 a lateral é coluna, sem o botão da gaveta; de 1280 para cima, a barra sai e o índice é coluna", async ({page}) => {
  for (const w of [768, 1100]) {
    await abrir(page, w);
    const lateral = await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside)");
    perto(lateral.x, 0, `${w}: a lateral no começo`);
    perto(lateral.w, 220, `${w}: com 220`);
    await expect(page.locator(".topbar .nav-toggle")).toBeHidden();
  }
  await abrir(page, 1280);
  await expect(page.locator(".docs-toc-bar")).toBeHidden();
  perto((await caixa(page, ".app-shell-aside")).w, 240, "o índice com 240");
});

test("o Copy Prompt só nas páginas de começar, como na referência", async ({page}) => {
  for (const [pagina, tem] of [["getting-started.html", 1], ["docs-quick-start.html", 1], ["docs-theming.html", 0], ["button.html", 0], ["releases.html", 0]] as const) {
    await abrir(page, 1280, pagina);
    await expect(page.getByRole("button", {name: "Copy Prompt"}), pagina).toHaveCount(tem);
    await expect(page.getByRole("button", {name: "Copy Markdown"}), pagina).toHaveCount(1);
  }
});
