import {test, expect} from "@playwright/test";

// A LOGO NO SITE (06/11/2026, a decisão do Victor depois de ver o FigCraft: a estrela 2E nos quatro lugares, o nome em
// Sora ExtraBold). No topo, a 2E pequena (a de 32, com brilho) no lugar da estrela de quatro pétalas, no tamanho da marca
// de antes (30, o `--space-7` com o `--space-05`); o nome no peso 800; e a aba do navegador com a 2E pequena sem brilho (a de até 24).
// Provado contra o defeito: contra o site de antes (a estrela de quatro pétalas, o nome em 700, sem ícone), os três reprovam.

test("o topo do site tem a estrela 2E, no tamanho da marca, e o nome em ExtraBold", async ({page}) => {
  await page.goto("/apps/catalog/button.html");
  const m = await page.evaluate(() => {
    const logo = document.querySelector(".site-brand .site-logo");
    const r = logo?.getBoundingClientRect();
    const nome = document.querySelector(".site-brand strong");
    return {
      tem: !!logo?.querySelector("svg"),
      // a 2E tem os olhos (o contorno escuro) — a de quatro pétalas era só amarela
      olhos: !!logo?.innerHTML.includes("#242424"),
      l: r?.width ?? 0, a: r?.height ?? 0,
      peso: nome ? getComputedStyle(nome).fontWeight : "",
      escondida: logo?.getAttribute("aria-hidden"),
    };
  });
  expect(m.tem, "a logo é um desenho dentro da marca").toBe(true);
  expect(m.olhos, "é a estrela 2E, e não a de quatro pétalas").toBe(true);
  expect(Math.round(m.l)).toBe(30);
  expect(Math.round(m.a)).toBe(30);
  expect(m.peso, "o nome em Sora ExtraBold").toBe("800");
  expect(m.escondida, "o desenho é enfeite: o nome já diz a marca").toBe("true");
});

test("a aba do navegador mostra a estrela 2E pequena", async ({page, request}) => {
  await page.goto("/apps/catalog/button.html");
  const href = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(href).toBe("./assets/logo/estrela-2e-pequena-ate-24.svg");
  const r = await request.get(new URL(href!, page.url()).toString());
  expect(r.status()).toBe(200);
  expect(await r.text()).toContain("<svg");
});
