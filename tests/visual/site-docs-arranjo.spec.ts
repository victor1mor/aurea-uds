import {test, expect, type Page} from "@playwright/test";

// O ARRANJO DE DOCUMENTAÇÃO (lote T, 17/10/2026): o site no molde da documentação da referência, medido na PÁGINA dela
// e repetido aqui como número — o Victor comparou as duas lado a lado, foto a foto, e cada distância voltou para ser
// igualada (SITE-01, 02, 04, 05, 08, 09 e os pedidos da tarde: o topo da lateral, o fim da página, os lados, a barra do
// índice). As peças: `AppShell layout="docs"` e `Header tabs` (o que o React emite está no `site-lote-t.test.tsx`).
// Provado contra o defeito (17/10/2026): contra a 0.34.0 publicada (`BASE_SITE=http://127.0.0.1:8128`), reprova.
const base = process.env.BASE_SITE ?? "";
const abrir = async (page: Page, w: number, h: number, pagina = "button.html") => {
  await page.setViewportSize({width: w, height: h});
  await page.goto(`${base}/apps/catalog/${pagina}`);
};
const caixa = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => {
  const b = e.getBoundingClientRect();
  return {x: b.left, y: b.top, w: b.width, h: b.height, direita: b.right, baixo: b.bottom};
});
const perto = (a: number, b: number, nome: string) => expect(Math.abs(a - b), `${nome}: ${a} (esperado ${b})`).toBeLessThanOrEqual(1);

test("1440 × 900: o bloco de 1400 no centro, e as distâncias de cima e de baixo da referência", async ({page}) => {
  await abrir(page, 1440, 900);
  const cw = await page.evaluate(() => document.documentElement.clientWidth);
  const topo = await caixa(page, ".topbar");
  perto(topo.h, 100, "a barra de cima tem 100 (a linha fica pendurada embaixo)");
  const lateral = await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside)");
  const indice = await caixa(page, ".app-shell-aside");
  perto(lateral.x, (cw - 1400) / 2, "o bloco de 1400 começa no meio");
  perto(lateral.w, 220, "a lateral tem 220");
  perto(lateral.y, 116, "a lateral começa 16 abaixo da barra");
  perto(lateral.baixo, 900 - 32, "e para 32 acima da borda de baixo");
  perto(indice.y, 116, "o índice também");
  perto(indice.x, (cw - 1400) / 2 + 220 + 912, "o índice começa depois do texto de 912");
  perto(indice.w, 240, "o índice tem 240");
  // O primeiro grupo da lateral (com ela no começo) e o título do índice ficam a 24 da barra; o título da página, a 32.
  await page.locator(".app-shell > .sidebar:not(.app-shell-aside)").evaluate((e) => { e.scrollTop = 0; });
  perto((await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside) .sidebar-group-label")).y, 124, "o primeiro grupo");
  perto((await caixa(page, ".app-shell-aside .toc-label")).y, 124, "o título do índice");
  perto((await caixa(page, ".content h1")).y, 132, "o título da página");
});

test("1280 × 663: os lados — a cápsula a 16, o texto a 24, o índice alinhado", async ({page}) => {
  await abrir(page, 1280, 663);
  const cw = await page.evaluate(() => document.documentElement.clientWidth);
  const item = await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside) .sidebar-item");
  perto(item.x, 16, "a cápsula do item começa a 16");
  const recheio = await page.locator(".app-shell > .sidebar:not(.app-shell-aside) .sidebar-item").first()
    .evaluate((e) => parseFloat(getComputedStyle(e).paddingInlineStart));
  perto(item.x + recheio, 24, "o texto do item começa a 24");
  perto((await caixa(page, ".brand")).x, 24, "a marca também a 24");
  const toc = await caixa(page, ".app-shell-aside .toc");
  perto(toc.x, cw - 268 + 16, "o índice começa 16 dentro da coluna de 268");
  perto(toc.w, 240 - 32, "e ocupa os 240 menos os 16 de cada lado");
});

test("o índice não mostra barra de rolagem, nem a da coluna nem a dele", async ({page}) => {
  await abrir(page, 1280, 663);
  const barras = await page.evaluate(() => [".app-shell-aside", ".app-shell-aside .toc"]
    .map((s) => getComputedStyle(document.querySelector(s)!).scrollbarWidth));
  expect(barras).toEqual(["none", "none"]);
});

test("768: a marca, a busca e as ações numa linha só", async ({page}) => {
  await abrir(page, 768, 900);
  const marca = await caixa(page, ".brand");
  const acoes = await caixa(page, ".site-actions");
  expect(acoes.y, "as ações não descem para outra linha").toBeLessThan(marca.baixo);
  perto(marca.x, 24, "a barra tem 24 de recheio de 768 para cima");
  perto((await caixa(page, ".content h1")).x, 24, "e o texto, 24 da borda");
});

test("375: a linha das áreas rola de lado, e a página não", async ({page}) => {
  await abrir(page, 375, 812);
  const pagina = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(pagina[0], "a página não rola de lado").toBeLessThanOrEqual(pagina[1]);
  const linha = await page.locator(".topbar-tabs").evaluate((e) => [e.scrollWidth, e.clientWidth, getComputedStyle(e).overflowX]);
  expect(linha[2]).toBe("auto");
  expect(linha[0], "as áreas que não cabem ficam na linha que rola").toBeGreaterThan(linha[1]);
});

test("o anterior e o próximo ficam lado a lado, e o texto longo termina em reticências", async ({page}) => {
  await abrir(page, 1440, 900, "carousel.html");
  const [ant, prox] = await page.locator(".pn").evaluateAll((l) => l.map((e) => e.getBoundingClientRect().top));
  perto(ant, prox, "os dois na mesma linha");
  const corte = await page.locator(".pn-next > :last-child").evaluate((e) => {
    const c = getComputedStyle(e);
    return [c.whiteSpace, c.textOverflow, c.overflow];
  });
  expect(corte).toEqual(["nowrap", "ellipsis", "hidden"]);
});
