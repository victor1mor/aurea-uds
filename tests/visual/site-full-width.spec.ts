import {test, expect} from "@playwright/test";

// O "FULL WIDTH" FAZ A PEÇA CRESCER (06/11/2026, o desenho do FigCraft aprovado pelo Victor). O botão alargava a CAIXA e a
// peça ficava presa no limite que o exemplo dá a ela (30rem, 480): "só aumenta a caixa e nada acontece". Agora o limite
// (`--demo-limite`) vira 100% no modo largo, e a peça ocupa a caixa menos o recheio; na largura normal, nada muda. E a
// busca do topo, abaixo de 1335 de largura, é o círculo de 44 dos vizinhos, com a lupa no centro.
// Provado contra o defeito: contra o site de antes, os dois reprovam (o Alert fica em 480; a busca, 38 × 44).
test("Full width: o Alert ocupa a caixa no modo largo e volta aos 480 na largura normal", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto("/apps/catalog/alert.html");
  const medir = () => page.evaluate(() => {
    const pn = document.querySelector('.demo .demo-panel[data-panel="preview"]') as HTMLElement;
    const cs = getComputedStyle(pn);
    return {peca: pn.querySelector(".alert")!.getBoundingClientRect().width,
      miolo: pn.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)};
  });
  const antes = await medir();
  expect(antes.peca, "na largura normal, os 30rem de sempre").toBeCloseTo(480, 0);
  await page.locator(".tela-cheia-abrir").first().click();
  await expect.poll(async () => (await medir()).peca).toBeGreaterThan(800);
  const largo = await medir();
  expect(largo.peca, "no modo largo, a caixa inteira menos o recheio").toBeCloseTo(largo.miolo, 0);
  await page.locator(".tela-cheia-abrir").first().click();
  await expect.poll(async () => Math.round((await medir()).peca)).toBe(480);
});

test("a busca do topo, só com a lupa, é um círculo de 44 com a lupa no centro", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 800});
  await page.goto("/apps/catalog/button.html");
  const m = await page.locator(".site-search").first().evaluate((e) => {
    const q = e.getBoundingClientRect(), i = e.querySelector(".icon")!.getBoundingClientRect();
    const alvo = document.createElement("div"); alvo.style.cssText = "position:absolute;inline-size:var(--target-min)"; document.body.append(alvo);
    const t = alvo.getBoundingClientRect().width; alvo.remove();
    return {w: q.width, h: q.height, esq: i.left - q.left, dir: q.right - i.right, alvo: t};
  });
  expect([m.w, m.h]).toEqual([m.alvo, m.alvo]);
  expect(m.esq, "a lupa no centro").toBeCloseTo(m.dir, 0);
});
