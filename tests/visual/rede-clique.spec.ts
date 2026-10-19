import {test, expect, type Page} from "@playwright/test";

// O CLIQUE NO NÓ FORA DO MODO DE ARRUMAR (lote U, 19/10/2026 — o pedido 16 do app de topologia). O app passa só o
// `onSelect` (sem `editable`, sem `onNodeHover`): o motor tirava o ponteiro do invólucro do nó, e o clique de mouse no corpo
// não chegava ao `onSelect` — pelo teclado chegava. O botão de recolher também não recebia o clique.
// Os bancos: `rede2.html?leitura` (só `onSelect`, `collapsible`, sem modo de arrumar — o caso do app) e
// `rede.html?so-escolha`. Provado contra o defeito (19/10/2026): sem a regra do ponteiro no `aurea.css`, os dois primeiros reprovam (o terceiro guarda a trava e passa nos dois casos).
const REDE = process.env.AUREA_REDE ?? "/apps/keyboard-probe/out/rede.html";
const REDE2 = process.env.AUREA_REDE2 ?? "/apps/keyboard-probe/out/rede2.html";

const mapa = (p: Page) => p.locator(".dependency-graph").first();
/** Abre o banco e espera os nós pararem: a arrumação chega depois do primeiro desenho, e um clique no meio dela cai num nó
 *  que ainda vai mudar de lugar (com os três navegadores juntos, o Firefox e o WebKit perdiam o clique). A mesma espera do
 *  `rede2.spec.ts`. */
async function abrir(p: Page, url: string) {
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => {
    const w = window as unknown as {__ultimaClique?: string};
    const agora = [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((n) => n.style.transform).join("|");
    const parado = agora !== "" && agora === w.__ultimaClique;
    w.__ultimaClique = agora;
    return parado;
  }, undefined, {polling: 400, timeout: 15_000});
}
const no = (p: Page, id: string) => mapa(p).locator(`.react-flow__node[data-id="${id}"]`);
// O elemento que o ponteiro acerta no meio do botão: tem de ser o botão (ou algo dentro dele), e não o fundo do mapa.
const acerta = (p: Page, sel: string) => p.locator(sel).first().evaluate((alvo) => {
  const b = alvo.getBoundingClientRect();
  const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
  return !!e && (e === alvo || alvo.contains(e));
});

test("o clique de mouse no corpo do nó chega ao onSelect, sem o modo de arrumar", async ({page}) => {
  for (const url of [`${REDE2}?leitura`, `${REDE}?so-escolha`]) {
    await abrir(page, url);
    await expect(no(page, "core")).toBeVisible();
    const corpo = `.react-flow__node[data-id="core"] button.graph-node-body`;
    expect(await acerta(page, corpo), `${url}: o ponteiro acerta o corpo do nó`).toBe(true);
    await page.locator(corpo).first().click();
    await expect(page.locator(corpo).first(), url).toHaveAttribute("aria-pressed", "true");
  }
});

test("o botão de recolher do nó recebe o clique de mouse", async ({page}) => {
  await abrir(page, `${REDE2}?leitura`);
  const botao = `.react-flow__node[data-id="andar1"] :is(.graph-group-toggle,.graph-node-toggle)`;
  await expect(page.locator(botao).first()).toBeVisible();
  expect(await acerta(page, botao), "o ponteiro acerta o botão de fechar").toBe(true);
  await page.locator(botao).first().click();
  await expect(no(page, "pc-11")).toBeHidden();
});

test("sem onSelect o corpo do nó continua sem ponteiro (a trava alvo-clicavel)", async ({page}) => {
  await abrir(page, `${REDE2}?leitura`);
  // O segundo mapa do banco ("Duas linhas que se cruzam") não tem `onSelect`: o corpo não é botão.
  const ponte = page.locator(".mapa-ponte");
  await expect(ponte.locator(".react-flow__node").first()).toBeVisible();
  await expect(ponte.locator("button.graph-node-body")).toHaveCount(0);
  expect(await ponte.locator(".react-flow__node").first().evaluate((e) => getComputedStyle(e).pointerEvents)).toBe("none");
});
