import {test, expect, type Page} from "@playwright/test";

// MNT-31 medido montado (21/10/2026) — a legenda e o minimapa do mapa cobriam os nós dos cantos de baixo. O banco
// (`apps/keyboard-probe/rede5.html`) monta o mesmo mapa na largura em que o Victor lê (640, a 200%), em casos:
// "antes" (sem as props novas), a legenda que fecha (`legendCollapsible`) e o botão do minimapa junto do zoom
// (`minimapToggle`) — a L1 e a M2 da bancada, escolha do Victor.
// O caso "antes" é a prova de que a medida enxerga o defeito: lá a legenda e o minimapa COBREM nós. Nos outros,
// fechados, não cobrem nenhum — e o botão da legenda não sai do lugar ao abrir e fechar.
const APP = process.env.AUREA_REDE5 ?? "/apps/keyboard-probe/out/rede5.html";
type Ret = {x: number; y: number; w: number; h: number};

async function abrir(p: Page) {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.setViewportSize({width: 720, height: 1000});
  await p.goto(APP, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => document.querySelectorAll("[data-caso] .react-flow__node").length >= 5 * 16, undefined, {timeout: 20_000});
  await p.waitForTimeout(600);
  return erros;
}
/** Os nós que o retângulo cobre (a caixa de cada um, na tela). */
const cobertos = (p: Page, caso: string, seletor: string) => p.evaluate(([caso, seletor]) => {
  const raiz = document.querySelector(`[data-caso="${caso}"]`)!;
  const r = (el: Element) => { const b = el.getBoundingClientRect(); return {x: b.left, y: b.top, w: b.width, h: b.height}; };
  const corta = (a: Ret, b: Ret) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const tampa = [...raiz.querySelectorAll(seletor)].map(r);
  return [...raiz.querySelectorAll<HTMLElement>(".react-flow__node")].filter((n) => tampa.some((t) => corta(t, r(n)))).map((n) => n.dataset.id);
}, [caso, seletor] as const);
const rect = (p: Page, caso: string, seletor: string) => p.locator(`[data-caso="${caso}"] ${seletor}`).first().boundingBox();
/** A caixa do elemento medida a partir do canto do mapa — o clique rola a página, e a medida não pode depender disso. */
const noMapa = (p: Page, caso: string, seletor: string) => p.evaluate(([caso, seletor]) => {
  const m = document.querySelector(`[data-caso="${caso}"] .dependency-graph`)!.getBoundingClientRect();
  const b = document.querySelector(`[data-caso="${caso}"] ${seletor}`)!.getBoundingClientRect();
  return {x: b.left - m.left, y: b.top - m.top, w: b.width, h: b.height};
}, [caso, seletor] as const);

test("MNT-31: antes, a legenda e o minimapa cobrem nós — a medida enxerga o defeito", async ({page: p}) => {
  const erros = await abrir(p);
  expect(await cobertos(p, "antes", ".graph-legend"), "a legenda cobre algum nó").not.toEqual([]);
  expect(await cobertos(p, "antes", ".react-flow__minimap"), "o minimapa cobre algum nó").not.toEqual([]);
  expect(erros).toEqual([]);
});

test("MNT-31: a legenda que fecha — fechada, sobra o botão, que não cobre nó; o botão fica parado", async ({page: p}) => {
  const erros = await abrir(p);
  const b = p.locator('[data-caso="legenda"] .graph-dock button');
  await expect(b).toHaveAttribute("aria-expanded", "true");
  const aberto = await noMapa(p, "legenda", ".graph-dock button");
  await b.click();
  await expect(b).toHaveAttribute("aria-expanded", "false");
  await expect(p.locator('[data-caso="legenda"] .graph-legend')).toHaveCount(0);
  const fechado = await noMapa(p, "legenda", ".graph-dock button");
  expect(fechado, "o botão não sai do lugar ao fechar").toEqual(aberto);
  expect(await cobertos(p, "legenda", ".graph-dock"), "fechada, a legenda não cobre nó").toEqual([]);
  // pelo teclado também: Enter abre de novo
  await b.focus();
  await p.keyboard.press("Enter");
  await expect(b).toHaveAttribute("aria-expanded", "true");
  await expect(p.locator('[data-caso="legenda"] .graph-legend')).toBeVisible();
  // e o botão tem a altura dos botões de zoom: a mesma escala de controle do mapa
  expect(fechado.h).toBe((await noMapa(p, "legenda", ".graph-controls button[aria-label]")).h);
  expect(erros).toEqual([]);
});

test("MNT-31: o botão do minimapa junto do zoom — escondido, o canto de baixo fica livre", async ({page: p}) => {
  const erros = await abrir(p);
  const b = p.locator('[data-caso="minimapa"] .graph-controls button[aria-expanded]');
  await expect(b).toHaveAttribute("aria-expanded", "true");
  const zoom = await rect(p, "minimapa", ".graph-controls");
  const minimapa = await rect(p, "minimapa", ".react-flow__minimap");
  expect(zoom!.y, "o botão mora em cima, com os de zoom").toBeLessThan(minimapa!.y);
  await b.click();
  await expect(b).toHaveAttribute("aria-expanded", "false");
  await expect(p.locator('[data-caso="minimapa"] .react-flow__minimap')).toHaveCount(0);
  expect(await cobertos(p, "minimapa", ".react-flow__minimap, .react-flow__panel.bottom.right")).toEqual([]);
  await b.click();
  await expect(p.locator('[data-caso="minimapa"] .react-flow__minimap')).toBeVisible();
  expect(erros).toEqual([]);
});

test("MNT-31: os dois começando fechados — nenhum nó coberto nos cantos de baixo", async ({page: p}) => {
  const erros = await abrir(p);
  await expect(p.locator('[data-caso="fechados"] .graph-legend')).toHaveCount(0);
  await expect(p.locator('[data-caso="fechados"] .react-flow__minimap')).toHaveCount(0);
  expect(await cobertos(p, "fechados", ".graph-dock")).toEqual([]);
  expect(erros).toEqual([]);
});
