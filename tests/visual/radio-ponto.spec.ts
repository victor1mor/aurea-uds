import {test, expect, type Page} from "@playwright/test";

// A BOLINHA DO RÁDIO NO CENTRO (17/10/2026 — o Victor: "a bolinha do rádio não está centralizada, é torta dentro").
// Medido NA IMAGEM: a bolinha de antes tinha 7 dentro de um miolo de 14 (metade), a folga de 3,5 virava 3 de um lado e 4
// do outro, e o centro dela ficava meio ponto acima e à esquerda do centro da caixa, em todo zoom. Agora ela tem 6 de 14,
// como a da referência, e é encolhida POR ESCALA a partir do miolo inteiro: a escala gira em torno do centro exato.
// A medida: na foto da caixa, o centro do círculo dela (o que difere da página) e o centro da bolinha (o que difere do
// preenchimento, perto do meio); a diferença, em pontos da página.
// Provado contra o defeito (17/10/2026): com a bolinha de antes, reprova a 100% e a 150% (−0,55 e −0,57).
// O FIREFOX COM ZOOM fica de fora, com o motivo medido: ele põe a forma encolhida por escala meio ponto de tela para baixo
// e para a direita acima de 100% (+0,36 a 150%, +0,55 a 200%) — também com outras duas montagens testadas. É o mesmo jeito
// de desenhar da referência; no Chrome e no Safari a bolinha fica no centro exato em todo zoom, e no Firefox, a 100%.
async function desvio(page: Page) {
  const alvo = page.locator(".demo-panel .radio input:checked + .control-mark").first();
  const png = (await alvo.screenshot()).toString("base64");
  return page.evaluate(async ([b64, k]) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const x = c.getContext("2d")!; x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const px = (i: number, j: number) => { const o = (j * c.width + i) * 4; return [d[o], d[o + 1], d[o + 2]]; };
    const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const pagina = px(0, 0);
    let s1 = 0, x1 = 0, y1 = 0;
    for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
      const w = Math.min(1, dist(px(i, j), pagina) / 60); s1 += w; x1 += w * (i + 0.5); y1 += w * (j + 0.5);
    }
    const cx = x1 / s1, cy = y1 / s1;
    const fundo = px(Math.floor(cx), Math.floor(cy - c.height * 0.33));
    let s = 0, sx = 0, sy = 0;
    for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
      const dx = i + 0.5 - cx, dy = j + 0.5 - cy;
      if (Math.hypot(dx, dy) > c.width * 0.3) continue;
      const w = dist(px(i, j), fundo); s += w; sx += w * dx; sy += w * dy;
    }
    return {dx: sx / s / k, dy: sy / s / k};
  }, [png, await page.evaluate(() => devicePixelRatio)] as const);
}

for (const escala of [1, 1.5]) {
  for (const tema of ["light", "dark"] as const) {
    test(`a bolinha do rádio marcado fica no centro da caixa — zoom ${escala * 100}% · ${tema}`, async ({browser, browserName}) => {
      test.skip(browserName === "firefox" && escala !== 1, "Firefox com zoom: a forma encolhida sai meio ponto de tela fora (medido, ver acima)");
      const ctx = await browser.newContext({deviceScaleFactor: escala, viewport: {width: 1280, height: 900}});
      const page = await ctx.newPage();
      await page.goto("/apps/catalog/radiogroup.html");
      await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, tema);
      await page.waitForTimeout(400);
      const {dx, dy} = await desvio(page);
      expect(Math.abs(dx), `para o lado: ${dx.toFixed(2)}`).toBeLessThanOrEqual(0.2);
      expect(Math.abs(dy), `para cima ou para baixo: ${dy.toFixed(2)}`).toBeLessThanOrEqual(0.2);
      await ctx.close();
    });
  }
}
