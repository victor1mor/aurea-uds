import {test, expect} from "@playwright/test";

// G-A11Y-06 / ADR-0048 — o gate ESTRUTURAL do adorno de campo.
//
// O gate anterior detectava a divergência. Este cobra a estrutura que a torna impossível:
//
//     adorno side="start"  →  ANTES do controle no DOM
//     controle
//     adorno side="end"    →  DEPOIS do controle no DOM
//
// e, havendo conteúdo interativo, `ordem do DOM == ordem de tabulação == ordem visual`.
//
// A parte que o teste unitário não alcança é a TRANSIÇÃO: `layout` muda de `block` para `inline`
// em runtime, e nada disso pode se mexer — nem o foco, nem a sequência, nem a identidade dos nós.

const APP = "/apps/keyboard-probe/out/index.html";
const RAIZ = '[data-probe="AdornoEstrutural"]';
const estreito = `${RAIZ} > div[data-largura="300"]`;
const largo = `${RAIZ} > div[data-largura="900"]`;

const larguraDo = (page: import("@playwright/test").Page, sel: string, px: number) =>
  page.$eval(sel, (el, w) => { (el as HTMLElement).style.inlineSize = `${w}px`; }, px);

/** A sequência dos filhos diretos do grupo, por papel. É a ordem do DOM, que é a de tabulação. */
const noDom = (page: import("@playwright/test").Page, sel: string) =>
  page.$$eval(`${sel} .input-group`, (gs) => gs.map((g) => [...g.children].map((c) => {
    const cls = c.className || "";
    return /input-group-addon/.test(cls) ? (/addon-start/.test(cls) ? "start" : "end") : "controle";
  })));

/** A mesma sequência, mas lida da TELA. */
const naTela = (page: import("@playwright/test").Page, sel: string) =>
  page.$$eval(`${sel} .input-group`, (gs) => gs.map((g) => [...g.children]
    .sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const mesmaLinha = Math.abs(ra.top - rb.top) <= Math.min(ra.height, rb.height) / 2;
      return mesmaLinha ? ra.left - rb.left : ra.top - rb.top;
    })
    .map((c) => {
      const cls = c.className || "";
      return /input-group-addon/.test(cls) ? (/addon-start/.test(cls) ? "start" : "end") : "controle";
    })));

test("estrutura: `start` antes, controle, `end` depois — mesmo escrito fora de ordem", async ({page}) => {
  // No banco de prova o adorno `start` é escrito DEPOIS do campo, de propósito. Se o grupo não
  // ordenasse, este teste pegaria — e a correção teria voltado a ser cosmética.
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${RAIZ} .input-group`).first()).toBeVisible();
  for (const raiz of [estreito, largo]) {
    for (const g of await noDom(page, raiz)) {
      const iControle = g.indexOf("controle");
      expect(g.slice(0, iControle).every((x) => x === "start"),
        `antes do controle só pode haver adorno start: ${g.join(",")}`).toBe(true);
      expect(g.slice(iControle + 1).every((x) => x === "end"),
        `depois do controle só pode haver adorno end: ${g.join(",")}`).toBe(true);
    }
  }
});

test("estrutura: DOM == tela, nas duas geometrias e nos dois lados", async ({page}) => {
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${RAIZ} .input-group`).first()).toBeVisible();
  for (const [nome, raiz] of [["estreito (block)", estreito], ["largo (inline)", largo]] as const) {
    expect(await naTela(page, raiz), `${nome}: a tela desenhou fora da ordem do DOM`)
      .toEqual(await noDom(page, raiz));
  }
});

test("estrutura: a tabulação segue a tela, com focável nos DOIS lados", async ({page}) => {
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${RAIZ} .input-group`).first()).toBeVisible();
  for (const [nome, raiz] of [["estreito", estreito], ["largo", largo]] as const) {
    const primeiro = page.locator(`${raiz} .input-group`).first();
    await primeiro.locator("button").first().focus();
    const visto: string[] = [];
    for (let i = 0; i < 3; i++) {
      visto.push(await page.evaluate(() => {
        const a = document.activeElement as HTMLElement;
        return a?.tagName === "INPUT" ? "controle" : (a?.textContent || "").trim();
      }));
      await page.keyboard.press("Tab");
    }
    expect(visto, `${nome}: a tabulação não seguiu antes → campo → depois`)
      .toEqual(["antes", "controle", "depois"]);
  }
});

test("transição: mudar `layout` em runtime não mexe no foco nem na estrutura", async ({page}) => {
  // O caso que o Victor especificou: o foco não pode saltar, sumir, remontar, mudar de sequência,
  // duplicar elemento nem criar tab stop fantasma.
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${RAIZ} .input-group`).first()).toBeVisible();

  await page.$eval(`${estreito} .input-group button`, (b) => { (b as any).__marca = "original"; });
  await page.locator(`${estreito} .input-group button`).first().focus();
  const antes = await page.evaluate(() => (document.activeElement as HTMLElement)?.textContent?.trim());
  const domAntes = await noDom(page, estreito);
  const quantosAntes = await page.locator(`${estreito} .input-group button`).count();

  await larguraDo(page, estreito, 900);
  await expect.poll(async () =>
    page.$eval(`${estreito} .input-group-addon`, (a) => a.className.includes("input-group-addon-inline")),
    {message: "alargar o contêiner devia levar o adorno de faixa para linha"}).toBe(true);

  expect(await page.evaluate(() => (document.activeElement as HTMLElement)?.textContent?.trim()),
    "o foco saiu de onde estava durante a transição").toBe(antes);
  expect(await page.$eval(`${estreito} .input-group button`, (b) => (b as any).__marca),
    "o nó focado foi RECRIADO — mudar geometria não pode remontar").toBe("original");
  expect(await noDom(page, estreito), "a sequência do DOM mudou junto com a geometria")
    .toEqual(domAntes);
  expect(await page.locator(`${estreito} .input-group button`).count(),
    "apareceu ou sumiu botão — nada de duplicar nó para resolver geometria").toBe(quantosAntes);
  expect(await naTela(page, estreito), "depois da transição a tela saiu da ordem do DOM")
    .toEqual(domAntes);
});

test("transição: e no sentido inverso, largo → estreito", async ({page}) => {
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${RAIZ} .input-group`).first()).toBeVisible();
  const domAntes = await noDom(page, largo);
  await larguraDo(page, largo, 300);
  await expect.poll(async () =>
    page.$eval(`${largo} .input-group-addon`, (a) => a.className.includes("input-group-addon-block")),
    {message: "estreitar devia levar o adorno de linha para faixa"}).toBe(true);
  expect(await noDom(page, largo)).toEqual(domAntes);
  expect(await naTela(page, largo)).toEqual(domAntes);
});

test("estrutura: em RTL o lado é LÓGICO, e a ordem continua batendo", async ({page}) => {
  // `side` é `start`/`end`, não `left`/`right`. Em árabe o `start` fica à direita, e a comparação
  // entre DOM e tela tem de continuar verdadeira sem ninguém escrever uma segunda regra.
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${RAIZ} .input-group`).first()).toBeVisible();
  await page.evaluate(() => { document.documentElement.dir = "rtl"; });

  const naTelaRtl = await page.$$eval(`${largo} .input-group`, (gs) => gs.map((g) => [...g.children]
    .sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const mesmaLinha = Math.abs(ra.top - rb.top) <= Math.min(ra.height, rb.height) / 2;
      return mesmaLinha ? rb.right - ra.right : ra.top - rb.top;   // em RTL o inline começa à direita
    })
    .map((c) => {
      const cls = c.className || "";
      return /input-group-addon/.test(cls) ? (/addon-start/.test(cls) ? "start" : "end") : "controle";
    })));
  expect(naTelaRtl, "em RTL a ordem lógica deixou de bater com o DOM").toEqual(await noDom(page, largo));
  // e o adorno `start` tem mesmo de estar à DIREITA agora — senão o teste acima passaria por o
  // desenho não ter mudado nada
  const startMaisADireita = await page.$eval(`${largo} .input-group`, (g) => {
    const s = g.querySelector(".input-group-addon-start")!.getBoundingClientRect();
    const e = g.querySelector(".input-group-addon-end")!.getBoundingClientRect();
    return s.left > e.left;
  });
  expect(startMaisADireita, "em RTL o `start` tem de ficar à direita — o lado é lógico").toBe(true);
});

test("estrutura: com adornos só em LINHA o grupo fica numa linha só", async ({page}) => {
  // A regressão que o desenho antigo temia, e que virou responsabilidade da base zero do
  // controle: ligar `flex-wrap` no grupo inteiro faria o que hoje transborda passar a quebrar.
  // Com `flex:1 1 0` o campo encolhe em vez de empurrar, e a linha continua uma só.
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${RAIZ} .input-group`).first()).toBeVisible();

  // CONTAR LINHA PELO `top` DOS FILHOS NÃO FUNCIONA: com `align-items:center`, dois filhos de
  // alturas diferentes na MESMA linha têm `top` diferente. O que separa uma linha de duas é a
  // altura do GRUPO contra a do filho mais alto.
  const linhaUnica = (sel: string) => page.$eval(sel, (g) => {
    const alturaGrupo = g.getBoundingClientRect().height;
    const maiorFilho = Math.max(...[...g.children].map((c) => c.getBoundingClientRect().height));
    return {alturaGrupo: Math.round(alturaGrupo), maiorFilho: Math.round(maiorFilho)};
  });

  const l = await linhaUnica(`${largo} .input-group`);
  expect(l.alturaGrupo, `com os dois adornos em linha o grupo não pode quebrar — ` +
    `grupo ${l.alturaGrupo}px contra o maior filho ${l.maiorFilho}px`)
    .toBeLessThanOrEqual(l.maiorFilho + 8);

  // e no estreito, onde a geometria é `block`, ele TEM de quebrar — senão o teste acima passaria
  // por o adorno em faixa nunca ter funcionado
  const e = await linhaUnica(`${estreito} .input-group`);
  expect(e.alturaGrupo, `no contêiner estreito o adorno em faixa tem de ocupar linha própria — ` +
    `grupo ${e.alturaGrupo}px contra o maior filho ${e.maiorFilho}px`)
    .toBeGreaterThan(e.maiorFilho + 8);
});
