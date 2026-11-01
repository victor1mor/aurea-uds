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

// O SITE B (31/10/2026, ADR-0088): o topo do celular é a cápsula de 64, numa linha só — a lupa, a paleta e o botão da
// gaveta, como no desenho (o GitHub e a chave claro/escuro descem para a gaveta). ~~As duas linhas de 100 e os quatro
// botões do lote U~~ saíram com ele.
test("375: o topo numa linha só, a lupa no lugar da busca larga e o botão da gaveta por último, à direita", async ({page}) => {
  await abrir(page, 375);
  perto((await caixa(page, ".topbar-inner")).h, 64, "o topo: a cápsula de 64");
  await expect(page.locator(".site-search")).toBeHidden();
  await expect(page.getByRole("link", {name: "Search"})).toBeVisible();
  await expect(page.locator(".topbar .site-theme-switch")).toBeHidden();
  const gaveta = await caixa(page, ".topbar .nav-toggle");
  perto(gaveta.direita, 375 - 16 - 10, "o botão da gaveta na ponta da cápsula");
  // Os botões numa linha só, da mesma altura.
  const linha = await page.locator(".topbar-inner > :not(.site-areas) :is(a.btn, button.btn), .topbar-inner > :is(a.btn, button.btn)").evaluateAll((l) =>
    l.filter((e) => e.getClientRects().length).map((e) => [Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().height)]));
  expect(linha.length).toBe(3);
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
  const linha = await page.locator(".topbar-inner > :not(.site-areas) :is(a.btn, button.btn), .topbar-inner > :is(a.btn, button.btn)").evaluateAll((l) =>
    l.filter((e) => e.getClientRects().length).map((e) => [Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().height)]));
  expect(linha.length).toBe(3);
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

// ~~Abaixo de 1280, a barra do índice mostrava a seção em vista e descia a lista (lote U).~~ No site B o índice sai abaixo de
// 1280, e a barra dele também (decisão do Victor, 31/10/2026: *"vamos deixar como você fez mesmo"* — a referência, a 1271,
// também tira o índice). De 768 a 1279 a lateral é coluna, com 268, sem o botão da gaveta; de 1280 para cima, o índice é
// coluna, com 236.
test("abaixo de 1280 o índice sai, e a barra dele também", async ({page}) => {
  for (const w of [375, 768, 1100, 1279]) {
    await abrir(page, w);
    await expect(page.locator(".docs-toc-bar"), `${w}: sem a barra do índice`).toBeHidden();
    await expect(page.locator(".app-shell-aside"), `${w}: sem o índice`).toBeHidden();
  }
});

test("de 768 a 1279 a lateral é coluna, sem o botão da gaveta; de 1280 para cima, o índice é coluna", async ({page}) => {
  // A 768, 268 (a do desenho); de 1024 a 1279, 248 — a folha do site aperta a coluna (o índice + 8) para o texto caber.
  for (const [w, largura] of [[768, 268], [1100, 248]]) {
    await abrir(page, w);
    const lateral = await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside)");
    perto(lateral.w, largura, `${w}: a lateral com ${largura}`);
    await expect(page.locator(".topbar .nav-toggle")).toBeHidden();
  }
  await abrir(page, 1280);
  await expect(page.locator(".docs-toc-bar")).toBeHidden();
  perto((await caixa(page, ".app-shell-aside")).w, 236, "o índice com 236");
});

test("o Copy Prompt só nas páginas de começar, como na referência", async ({page}) => {
  for (const [pagina, tem] of [["getting-started.html", 1], ["docs-quick-start.html", 1], ["docs-theming.html", 0], ["button.html", 0], ["releases.html", 0]] as const) {
    await abrir(page, 1280, pagina);
    await expect(page.getByRole("button", {name: "Copy Prompt"}), pagina).toHaveCount(tem);
    await expect(page.getByRole("button", {name: "Copy Markdown"}), pagina).toHaveCount(1);
  }
});
