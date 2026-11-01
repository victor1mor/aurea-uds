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

// O SITE B (31/10/2026, ADR-0088): o arranjo passou a ser o do desenho B aprovado, medido contra ele na bancada (a pílula, a
// lateral e o índice em blocos, tudo a 96 do alto). ~~As medidas do lote T (a barra de 100, a lateral de 220 a 116, o índice
// de 240)~~ saíram com ele. A régua (1440 × 900): a cápsula de 20 a 1420, a lateral de 20 a 288, o texto a 316, o índice de
// 1184 a 1420 — os números do desenho.
test("1440 × 900: a cápsula de 1400 no centro, e a lateral, o texto e o índice a 96, como no desenho B", async ({page}) => {
  await abrir(page, 1440, 900);
  const cw = await page.evaluate(() => document.documentElement.clientWidth);
  const capsula = await caixa(page, ".topbar-inner");
  perto(capsula.x, (cw - 1400) / 2, "a cápsula de 1400 começa no meio");
  perto(capsula.w, 1400, "e tem 1400");
  perto(capsula.y, 14, "a 14 do alto");
  perto(capsula.h, 64, "com 64");
  const lateral = await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside)");
  const indice = await caixa(page, ".app-shell-aside");
  perto(lateral.x, capsula.x, "a lateral na ponta da cápsula");
  perto(lateral.w, 268, "a lateral tem 268");
  perto(lateral.y, 96, "a lateral começa a 96 (14 + 64 + 18)");
  perto(lateral.baixo, 900 - 16, "e vai até 16 do pé da tela");
  perto(indice.y, 96, "o índice também a 96");
  perto(indice.w, 236, "o índice tem 236");
  perto(indice.direita, capsula.direita, "e termina na ponta da cápsula");
  perto((await caixa(page, ".content h1")).y, 96, "o título da página a 96");
  perto((await caixa(page, ".content h1")).x, lateral.direita + 28, "o texto a 28 da lateral");
});

test("1280 × 663: a cápsula a 16 das bordas, e a lateral e o índice nas pontas dela", async ({page}) => {
  await abrir(page, 1280, 663);
  const cw = await page.evaluate(() => document.documentElement.clientWidth);
  const capsula = await caixa(page, ".topbar-inner");
  perto(capsula.x, 16, "a cápsula a 16 da borda esquerda");
  perto(capsula.direita, cw - 16, "e a 16 da direita");
  const lateral = await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside)");
  perto(lateral.x, 16, "a lateral a 16");
  perto(lateral.baixo, 663 - 16, "e até 16 do pé da tela");
  perto((await caixa(page, ".app-shell > .sidebar:not(.app-shell-aside) .sidebar-item")).x, 16 + 12, "o item 12 dentro do bloco");
  perto((await caixa(page, ".app-shell-aside")).direita, cw - 16, "o índice termina a 16 da borda");
});

test("o índice não mostra barra de rolagem, nem a da coluna nem a dele", async ({page}) => {
  await abrir(page, 1280, 663);
  const barras = await page.evaluate(() => [".app-shell-aside", ".app-shell-aside .toc"]
    .map((s) => getComputedStyle(document.querySelector(s)!).scrollbarWidth));
  expect(barras).toEqual(["none", "none"]);
});

test("768: a marca e as ações numa linha só, dentro da cápsula", async ({page}) => {
  await abrir(page, 768, 900);
  const marca = await caixa(page, ".brand");
  const acoes = await caixa(page, ".site-actions");
  const capsula = await caixa(page, ".topbar-inner");
  expect(acoes.y, "as ações não descem para outra linha").toBeLessThan(marca.baixo);
  perto(capsula.x, 16, "a cápsula a 16 da borda");
  perto(marca.x, 16 + 20, "a marca a 20 dentro da cápsula");
  perto(capsula.h, 64, "a cápsula com 64");
});

test("375: a página não rola de lado, e o botão da gaveta é o último da cápsula", async ({page}) => {
  await abrir(page, 375, 812);
  const pagina = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(pagina[0], "a página não rola de lado").toBeLessThanOrEqual(pagina[1]);
  const capsula = await caixa(page, ".topbar-inner");
  const gaveta = await caixa(page, ".nav-toggle");
  perto(capsula.x, 16, "a cápsula a 16 da borda");
  expect(gaveta.direita, "o botão da gaveta dentro da cápsula").toBeLessThanOrEqual(capsula.direita);
  expect(capsula.direita - gaveta.direita, "e na ponta dela").toBeLessThanOrEqual(12);
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
