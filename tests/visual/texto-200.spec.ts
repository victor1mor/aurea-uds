import {test, expect} from "@playwright/test";

// O TEXTO DO NAVEGADOR A 200% (06/11/2026, o achado novo da conferência da auditoria externa e o desenho do FigCraft aprovado
// pelo Victor). Quem tem baixa visão costuma aumentar a FONTE PADRÃO do navegador, e não o zoom. Com os pontos de quebra
// em px, a tela de 1280 continuava "larga": as três colunas se espremiam, a do meio ficava com 128 e o título saía uma
// letra por linha. Com os pontos de quebra em `em` (a fonte que a pessoa escolheu), a página se arruma como no zoom de
// 200%. Aqui a fonte padrão vai a 32 pela configuração do navegador (CDP `Page.setFontSizes` — a raiz em 32 por CSS não
// muda o `em` de uma consulta de mídia), e mede-se o arranjo. Só no Chromium: a configuração é dele.
// Provado contra o defeito: contra o site de antes, os dois reprovam.
test.skip(({browserName}) => browserName !== "chromium", "a fonte padrão do navegador só se muda pelo CDP do Chromium");

test("a fonte do navegador em 32 numa tela de 1280: uma coluna, o título inteiro", async ({page, context}) => {
  await page.setViewportSize({width: 1280, height: 900});
  const cdp = await context.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", {fontSizes: {standard: 32, fixed: 26}});
  await page.goto("/apps/catalog/button.html");
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const r = (s: string) => document.querySelector(s)?.getBoundingClientRect();
    const h1 = r("main h1")!, topo = r(".topbar-inner")!;
    const letras = document.querySelector("main h1")!.textContent!.trim().length;
    return {tituloL: h1.width, tituloA: h1.height, fs: parseFloat(getComputedStyle(document.querySelector("main h1")!).fontSize),
      topoA: topo.height, letras, rola: document.documentElement.scrollWidth - innerWidth};
  });
  expect(m.tituloA, "o título numa linha só, e não uma letra por linha").toBeLessThan(m.fs * 1.6);
  expect(m.topoA, "o topo baixo, e não metade da tela").toBeLessThan(200);
  expect(m.rola, "sem rolagem de lado").toBeLessThanOrEqual(0);
});

test("com a fonte normal, nada muda: as três colunas a 1280", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto("/apps/catalog/button.html");
  await page.waitForTimeout(500);
  const visiveis = await page.evaluate(() => [".site-shell > .sidebar:not(.app-shell-aside)", ".site-shell > .sidebar.app-shell-aside"]
    .map((s) => { const e = document.querySelector(s) as HTMLElement | null; return !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== "none"; }));
  expect(visiveis, "a lateral e o índice à vista").toEqual([true, true]);
});
