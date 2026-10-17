import {test, expect, type Page} from "@playwright/test";

// MNT-28 medido montado (17/10/2026) — no modo de arrumar, o nó movido volta a ficar alinhado. O Victor, comparando
// com o draw.io: o arranjo automático punha os nós fora da grade de 16, e o nó arrastado só voltava a 528 ou 544, com
// um degrau na linha. Agora: (1) com a grade ligada, o arranjo já sai na grade; (2) ao arrastar, o nó encaixa na borda
// ou no centro do vizinho que estiver perto, e aparece a guia.
// O banco é o mesmo da rodada 2 (`apps/keyboard-probe/rede2.html`, modo de arrumar com grade).
// Provado contra o defeito (17/10/2026): com o pacote da 0.34.0, o primeiro teste acha nós fora da grade, e o segundo
// não encaixa nem desenha guia.
const APP = process.env.AUREA_REDE2 ?? "/apps/keyboard-probe/out/rede2.html";
type Posicoes = Record<string, {x: number; y: number}>;

async function parar(p: Page) {
  await p.waitForFunction(() => {
    const w = window as unknown as {__ultimaMnt28?: string};
    const agora = [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((n) => n.style.transform).join("|")
      + [...document.querySelectorAll(".react-flow__edge-path")].map((e) => e.getAttribute("d")).join("|");
    const parado = agora !== "" && agora === w.__ultimaMnt28;
    w.__ultimaMnt28 = agora;
    return parado;
  }, undefined, {polling: 400, timeout: 15_000});
}
async function abrir(p: Page) {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.setViewportSize({width: 1280, height: 1000});
  await p.goto(APP, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  await parar(p);
  return erros;
}
const posicoes = (p: Page) => p.evaluate(() =>
  (window as unknown as {__mapa2: {getLayout(): {positions: Record<string, {x: number; y: number}>}}}).__mapa2.getLayout().positions);
const no = (p: Page, id: string) => p.locator(`.dependency-graph .react-flow__node[data-id="${id}"]`).first();

test("MNT-28: com a grade ligada, o arranjo automático já sai na grade — toda posição é múltipla de 16", async ({page: p}) => {
  const erros = await abrir(p);
  const pos: Posicoes = await posicoes(p);
  expect(Object.keys(pos).length, "o mapa tem nós").toBeGreaterThan(5);
  const fora = Object.entries(pos).filter(([, q]) => q.x % 16 !== 0 || q.y % 16 !== 0).map(([id, q]) => `${id} ${q.x},${q.y}`);
  expect(fora, "nós fora da grade de 16").toEqual([]);
  expect(erros).toEqual([]);
});

test("MNT-28: ao arrastar perto do alinhamento de um vizinho, o nó encaixa, a guia aparece, e o nó fica onde ela mandou", async ({page: p}) => {
  const erros = await abrir(p);
  const c = (await no(p, "filial").boundingBox())!;
  const lerY = (t: string) => Number(/translate\([^,]+,\s*(-?[\d.]+)px/.exec(t)![1]);
  // Sobe a filial de 3 em 3 (de tela) até a primeira guia aparecer. Com a grade ligada, o arraste anda de 16 em 16, e a
  // guia é o que tira o nó da grade para encostar no alinhamento do vizinho.
  await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
  await p.mouse.down();
  let achou: {y: number; em: number; alt: number} | null = null;
  const ler = () => p.evaluate(() => {
    const n = document.querySelector<HTMLElement>('.dependency-graph .react-flow__node[data-id="filial"]')!;
    const g = document.querySelector<HTMLElement>(".dependency-graph .graph-guide-y");
    return {t: n.style.transform, alt: n.offsetHeight, g: g?.style.transform ?? null};
  });
  for (let k = 1; k <= 120 && !achou; k++) {
    await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2 - 3 * k);
    if (!(await ler()).g) continue;
    // O nó e a guia se atualizam em momentos um pouco diferentes (medido no Firefox): com o ponteiro parado, os dois
    // assentam, e é aí que se lê.
    await p.waitForTimeout(250);
    const r = await ler();
    if (r.g) achou = {y: lerY(r.t), em: lerY(r.g), alt: r.alt};
  }
  expect(achou, "uma guia apareceu durante o arraste").not.toBeNull();
  // A guia passa no topo, no meio ou na base do nó arrastado.
  expect([achou!.y, achou!.y + achou!.alt / 2, achou!.y + achou!.alt].some((v) => Math.abs(v - achou!.em) < 0.5),
    `a guia (${achou!.em}) passa no nó (${achou!.y}, altura ${achou!.alt})`).toBe(true);
  await p.mouse.up();
  await parar(p);
  const depois: Posicoes = await posicoes(p);
  expect(depois.filial.y, "ao soltar, o nó fica onde a guia mandou").toBe(achou!.y);
  await expect(p.locator(".dependency-graph .graph-guide"), "e a guia some").toHaveCount(0);
  expect(erros).toEqual([]);
});

// O caso do Victor (17/10/2026): "todos consigo alinhar de forma manual, menos esse — nunca fica reto". A linha `core-a1`
// sai da porta 1 (a um terço da base do Núcleo) e chega no meio do topo do Acesso 1º andar; nem a borda nem o centro do
// Acesso caem embaixo dela, e a grade de 16 quase nunca cai no ponto. Agora a ponta da linha também é alvo do encaixe.
// Provado contra o defeito (17/10/2026): só com as guias de caixa, a linha nunca fica reta e o teste reprova.
test("MNT-28: arrastando o Acesso de lado, ele encaixa onde a linha da porta 1 fica RETA — e fica assim ao soltar", async ({page: p}) => {
  const erros = await abrir(p);
  const centroX = (sel: string) => p.locator(sel).first().evaluate((e) => { const r = e.getBoundingClientRect(); return r.left + r.width / 2; });
  const porta = await centroX('.dependency-graph .react-flow__node[data-id="core"] .react-flow__handle[data-handleid="p1"].source');
  const alvo = await centroX('.dependency-graph .react-flow__node[data-id="acc-1"] .react-flow__handle.target:not([data-handleid])');
  const sentido = Math.sign(porta - alvo) || 1;
  // A linha está reta quando todos os pontos do traçado têm o mesmo x.
  const reta = () => p.evaluate(() => {
    const d = document.querySelector('.dependency-graph .react-flow__edge[data-id="core-a1"] .react-flow__edge-path')!.getAttribute("d")!;
    const xs = [...d.matchAll(/(-?[\d.]+)[ ,](-?[\d.]+)/g)].map((m) => Number(m[1]));
    return xs.length >= 2 && xs.every((x) => Math.abs(x - xs[0]) < 0.5);
  });
  expect(await reta(), "antes de arrastar, a linha não é reta").toBe(false);
  const c = (await no(p, "acc-1").boundingBox())!;
  await p.mouse.move(c.x + 20, c.y + c.height / 2);
  await p.mouse.down();
  let endireitou = false;
  for (let k = 1; k <= 80 && !endireitou; k++) {
    await p.mouse.move(c.x + 20 + sentido * 2 * k, c.y + c.height / 2);
    if (!(await reta())) continue;
    await p.waitForTimeout(250);
    endireitou = await reta() && await p.locator(".dependency-graph .graph-guide-x").count() > 0;
  }
  expect(endireitou, "durante o arraste, a linha ficou reta e a guia apareceu").toBe(true);
  await p.mouse.up();
  await parar(p);
  expect(await reta(), "ao soltar, a linha continua reta").toBe(true);
  expect(erros).toEqual([]);
});
