import {test, expect, type Page} from "@playwright/test";

// MNT-35 (o app de rede, 26/10/2026) · desmarcar o nó escolhido, no navegador. Com um nó escolhido, o clique na área
// vazia do desenho e o Esc dentro do mapa chamam `onSelect(null)`, nos dois modos; o arraste que anda pelo mapa NÃO
// desmarca (o motor só chama o clique do fundo sem movimento). No modo de arrumar, a escolha do motor também se apaga.
// O jsdom prova o resto (`tests/unit/rede-desmarcar.test.tsx`).
// Os bancos: `rede.html?so-escolha` (o mapa de leitura só com `onSelect`, como o app) e `rede2.html` (o modo de
// arrumar; o `onSelect` anota `selecao:<id>`).
// Provado contra o defeito (29/10/2026): com o `graph.tsx` da 0.48.0, os cinco reprovam — o 1º, o 3º, o 4º e o 5º porque
// nada desmarcava (no modo de arrumar, o motor apagava a escolha DELE, mas o app não sabia); o 2º só porque a região
// viva não existia: ele guarda o arraste, que já não desmarcava e não pode passar a desmarcar.
const REDE = process.env.AUREA_REDE ?? "/apps/keyboard-probe/out/rede.html";
const REDE2 = process.env.AUREA_REDE2 ?? "/apps/keyboard-probe/out/rede2.html";

const mapa = (p: Page) => p.locator(".dependency-graph").first();
const no = (p: Page, id: string) => mapa(p).locator(`.react-flow__node[data-id="${id}"]`);
const corpo = (p: Page, id: string) => no(p, id).locator("button.graph-node-body");
const fala = (p: Page) => mapa(p).locator(":scope > [role=status]");
const eventos = (p: Page) => p.evaluate(() => (window as unknown as {__eventos2: string[]}).__eventos2.splice(0));

/** Abre o banco e espera os nós e as linhas pararem: a arrumação e o desvio chegam depois do primeiro desenho. */
async function abrir(p: Page, url: string) {
  await p.setViewportSize({width: 1280, height: 1000});
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => {
    const w = window as unknown as {__ultimaDesmarcar?: string};
    const agora = [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((n) => n.style.transform).join("|")
      + [...document.querySelectorAll(".react-flow__edge-path")].map((e) => e.getAttribute("d")).join("|");
    const parado = agora !== "" && agora === w.__ultimaDesmarcar;
    w.__ultimaDesmarcar = agora;
    return parado;
  }, undefined, {polling: 400, timeout: 15_000});
}

/** Um ponto da tela onde o ponteiro acerta o FUNDO do desenho (nem nó, nem linha, nem painel), longe das bordas. */
async function pontoVazio(p: Page) {
  const ponto = await mapa(p).evaluate((m) => {
    const fundo = m.querySelector(".react-flow__pane")!, b = fundo.getBoundingClientRect();
    for (let y = b.top + 40; y < Math.min(b.bottom, innerHeight) - 40; y += 12)
      for (let x = b.left + 40; x < b.right - 40; x += 12)
        if (document.elementFromPoint(x, y) === fundo) return {x, y};
    return null;
  });
  expect(ponto, "há área vazia à vista no desenho").not.toBeNull();
  return ponto!;
}

test("leitura: o clique na área vazia desmarca, e a região viva diz que nada ficou escolhido", async ({page: p}) => {
  await abrir(p, `${REDE}?so-escolha`);
  await corpo(p, "core").click();
  await expect(corpo(p, "core")).toHaveAttribute("aria-pressed", "true");
  await expect(fala(p)).toHaveText("");
  const {x, y} = await pontoVazio(p);
  await p.mouse.click(x, y);
  await expect(corpo(p, "core")).toHaveAttribute("aria-pressed", "false");
  await expect(fala(p)).toHaveText("Nenhum nó escolhido");
});

test("leitura: arrastar para andar pelo mapa NÃO desmarca", async ({page: p}) => {
  await abrir(p, `${REDE}?so-escolha`);
  await corpo(p, "core").click();
  await expect(corpo(p, "core")).toHaveAttribute("aria-pressed", "true");
  const vista = () => mapa(p).locator(".react-flow__viewport").evaluate((v) => (v as HTMLElement).style.transform);
  const antes = await vista();
  const {x, y} = await pontoVazio(p);
  await p.mouse.move(x, y);
  await p.mouse.down();
  await p.mouse.move(x + 40, y + 30, {steps: 6});
  await p.mouse.move(x + 80, y + 60, {steps: 6});
  await p.mouse.up();
  // O arraste andou de verdade: sem isto, o teste passaria com um arraste que não aconteceu.
  await expect.poll(vista).not.toBe(antes);
  await expect(corpo(p, "core")).toHaveAttribute("aria-pressed", "true");
  await expect(fala(p)).toHaveText("");
});

test("leitura: o Esc desmarca, com o foco no nó ou num botão do mapa", async ({page: p}) => {
  await abrir(p, `${REDE}?so-escolha`);
  await corpo(p, "core").click();
  await expect(corpo(p, "core")).toHaveAttribute("aria-pressed", "true");
  await p.keyboard.press("Escape");
  await expect(corpo(p, "core")).toHaveAttribute("aria-pressed", "false");
  await expect(fala(p)).toHaveText("Nenhum nó escolhido");
  // De novo, com o foco num dos botões de zoom (dentro do mapa, fora do nó).
  await corpo(p, "core").click();
  await expect(fala(p)).toHaveText("");
  await mapa(p).locator(".graph-controls button").first().focus();
  await p.keyboard.press("Escape");
  await expect(corpo(p, "core")).toHaveAttribute("aria-pressed", "false");
  await expect(fala(p)).toHaveText("Nenhum nó escolhido");
});

test("arrumar: o clique na área vazia desmarca no app e no motor", async ({page: p}) => {
  await abrir(p, REDE2);
  await no(p, "core").click();
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(1);
  expect(await eventos(p)).toContain("selecao:core");
  const {x, y} = await pontoVazio(p);
  await p.mouse.click(x, y);
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(0);
  expect(await eventos(p)).toContain("selecao:null");
});

test("arrumar: o Esc desmarca todos os escolhidos, no app e no motor", async ({page: p}) => {
  await abrir(p, REDE2);
  await no(p, "core").click();
  await no(p, "pc-21").click({modifiers: ["Shift"]});
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(2);
  expect(await eventos(p)).toContain("selecao:core");
  await p.keyboard.press("Escape");
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(0);
  const ev = await eventos(p);
  expect(ev).toContain("selecao:null");
  expect(ev).toContain("escolha:");
});
