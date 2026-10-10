import {test, expect, type Page} from "@playwright/test";

// A RODADA 1 DA REDE medida montada — ADR-0064, 10/10/2026.
//
// O que o jsdom não prova, porque não tem leiaute nem medida: a arrumação em camadas (a raiz no topo,
// as portas na ordem declarada), a linha que nasce na BORDA do nó (e o nome da porta que fica à
// vista), a espessura que de fato chega à linha, o grupo de enlaces que abre e junta, as setas que
// andam de nó em nó, o filtro que não mexe no resto, e a exportação.
//
// O banco é `apps/keyboard-probe/rede.html`, construído pelo `pnpm build`. Cada caso abre com as
// opções no endereço (ver src/rede.tsx).
//
// Provado contra o defeito: a primeira versão desta rodada tinha três, achados na bancada e
// reproduzidos aqui — a linha nascia DENTRO do nó com endereço (o nome da porta coberto), a
// espessura da fibra não passava de 1 (a regra do motor, sem camada, ganhava), e as portas saíam
// fora de ordem (a "porta 1" à esquerda ia ao vizinho da direita). Os testes abaixo reprovam nos três.
const APP = process.env.AUREA_REDE ?? "/apps/keyboard-probe/out/rede.html";

async function abrir(p: Page, opcoes = "") {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.setViewportSize({width: 1280, height: 1000});
  await p.goto(`${APP}?${opcoes}`, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  // A arrumação em camadas chega depois do primeiro desenho: espera os nós pararem de andar.
  await p.waitForFunction(() => {
    const w = window as unknown as {__ultima?: string};
    const agora = [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((n) => n.style.transform).join("|");
    const parado = agora !== "" && agora === w.__ultima;
    w.__ultima = agora;
    return parado;
  }, undefined, {polling: 300, timeout: 10_000});
  return erros;
}
const caixa = (p: Page, id: string) => p.locator(`.react-flow__node[data-id="${id}"]`).boundingBox();

test("em camadas, de cima para baixo: a Internet no topo, e cada camada abaixo da anterior", async ({page: p}) => {
  const erros = await abrir(p);
  const [internet, fw, core, acc3, cam] = await Promise.all(["internet", "fw", "core", "acc-3", "cam"].map((id) => caixa(p, id)));
  expect(internet!.y).toBeLessThan(fw!.y);
  expect(fw!.y).toBeLessThan(core!.y);
  expect(acc3!.y).toBeLessThan(cam!.y);
  expect(erros).toEqual([]);
});

test("as portas na ordem declarada: a porta 1 leva ao nó mais à esquerda (sem cruzar)", async ({page: p}) => {
  await abrir(p);
  const [a, b, srv] = await Promise.all(["dist-a", "dist-b", "srv"].map((id) => caixa(p, id)));
  expect(a!.x).toBeLessThan(b!.x);
  expect(b!.x).toBeLessThan(srv!.x);
});

test("a linha nasce na borda do nó, e o nome da porta fica à vista (nó com endereço é mais alto)", async ({page: p}) => {
  await abrir(p);
  const core = (await caixa(p, "core"))!;
  // O nome da porta embaixo do núcleo começa ABAIXO da borda de baixo dele — não dentro.
  for (const nome of ["porta 1", "porta 2", "porta 3"]) {
    const r = (await p.locator(".graph-edge-end", {hasText: nome}).boundingBox())!;
    expect(r.y, nome).toBeGreaterThanOrEqual(core.y + core.height - 1);
  }
  // E nenhum nó cobre nenhum nome de porta.
  const cobertos = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>(".graph-edge-end")].filter((e) => {
    const r = e.getBoundingClientRect();
    return [...document.querySelectorAll(".react-flow__node")].some((n) => {
      const q = n.getBoundingClientRect();
      return r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top;
    });
  }).map((e) => e.textContent));
  expect(cobertos).toEqual([]);
});

test("o desenho da linha chega à linha: a fibra é dupla e grossa, o estimado é tracejado", async ({page: p}) => {
  await abrir(p);
  const traco = (id: string) => p.evaluate((i) => {
    const caminho = document.querySelector<SVGPathElement>(`.react-flow__edge[data-id="${i}"] path.react-flow__edge-path`)!;
    const s = getComputedStyle(caminho);
    return {largura: parseFloat(s.strokeWidth), tracos: s.strokeDasharray, miolo: !!document.querySelector(`.react-flow__edge[data-id="${i}"] .graph-edge-double-core`)};
  }, id);
  const fibra = await traco("fw-core");       // dupla e `thick`: 3 × (2 × 1)
  expect(fibra.largura).toBe(6);
  expect(fibra.miolo).toBe(true);
  const cobre = await traco("b-ap");          // a de sempre: 1
  expect(cobre.largura).toBe(1);
  expect((await traco("b-lldp")).tracos).not.toBe("none");
});

test("os enlaces repetidos viram um, e o número abre e junta", async ({page: p}) => {
  await abrir(p);
  const grupo = p.getByRole("button", {name: "Mostrar 10 conexões"});
  await expect(grupo).toHaveAttribute("aria-expanded", "false");
  const antes = await p.locator(".react-flow__edge").count();
  await grupo.click();
  await expect(p.getByRole("button", {name: "Juntar 10 conexões"})).toHaveAttribute("aria-expanded", "true");
  expect(await p.locator(".react-flow__edge").count()).toBe(antes + 9);
  await p.getByRole("button", {name: "Juntar 10 conexões"}).click();
  expect(await p.locator(".react-flow__edge").count()).toBe(antes);
});

test("as setas andam de nó em nó, para o mais perto na direção", async ({page: p}) => {
  await abrir(p, "escolhido=core");
  const botao = (id: string) => p.locator(`.react-flow__node[data-id="${id}"] button.graph-node-body`);
  await botao("core").focus();
  await p.keyboard.press("ArrowUp");
  await expect(botao("fw")).toBeFocused();
  await p.keyboard.press("ArrowUp");
  await expect(botao("internet")).toBeFocused();
  await p.keyboard.press("ArrowDown");
  await expect(botao("fw")).toBeFocused();
});

test("esconder nós não refaz a arrumação: o resto fica onde estava", async ({page: p}) => {
  // A posição NO MAPA (o `translate` do nó), e não na tela: o "caber na tela" reenquadra quando há
  // menos nós à vista, e isso não é a arrumação mudando.
  const posicao = () => p.locator('.react-flow__node[data-id="cam"]').evaluate((n) => (n as HTMLElement).style.transform);
  await abrir(p);
  const antes = await posicao();
  await abrir(p, "ocultar");
  expect(await posicao()).toBe(antes);
  await expect(p.locator('.react-flow__node[data-id="acc-1"]')).toBeHidden();
});

test("o caminho acende e o resto apaga", async ({page: p}) => {
  await abrir(p, "caminho");
  await expect(p.locator('.react-flow__node[data-id="cam"] .graph-node')).not.toHaveAttribute("data-dimmed");
  await expect(p.locator('.react-flow__node[data-id="srv"] .graph-node')).toHaveAttribute("data-dimmed", "true");
});

test("visão geral, botões de zoom e legenda montada pelas linhas", async ({page: p}) => {
  await abrir(p);
  await expect(p.getByRole("button", {name: "Aproximar"})).toBeVisible();
  await expect(p.getByRole("button", {name: "Caber na tela"})).toBeVisible();
  await expect(p.locator(".graph-minimap")).toBeVisible();
  const legenda = await p.getByRole("list", {name: "Legenda"}).locator("li").allTextContents();
  expect(legenda).toEqual(["Cobre", "VPN", "Fibra", "Agregação (LAG)", "Estimado", "Sem fio", "Caído", "Anotado à mão"]);
});

test("texto grande e alto contraste: a caixa cresce, e a linha engrossa", async ({page: p}) => {
  await abrir(p, "grande&contraste");
  const no = (await caixa(p, "core"))!;
  const zoom = await p.evaluate(() => {
    const t = document.querySelector<HTMLElement>(".react-flow__viewport")!.style.transform;
    return parseFloat(/scale\(([\d.]+)\)/.exec(t)![1]);
  });
  expect(Math.round(no.width / zoom)).toBe(206);   // 180 × 16/14
  const largura = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.react-flow__edge[data-id="b-ap"] path.react-flow__edge-path')!).strokeWidth));
  expect(largura).toBe(2);
});

test("exporta: o .drawio é XML válido com todos os nós, e a foto é PNG", async ({page: p}) => {
  await abrir(p);
  const arquivo = await p.evaluate(() => window.__mapa!.toDrawio());
  const leitura = await p.evaluate((x) => {
    const doc = new DOMParser().parseFromString(x, "application/xml");
    return {erro: !!doc.querySelector("parsererror"), nos: doc.querySelectorAll('mxCell[vertex="1"]:not([connectable="0"])').length,
      arestas: doc.querySelectorAll('mxCell[edge="1"]').length};
  }, arquivo);
  expect(leitura.erro).toBe(false);
  expect(leitura.nos).toBe(16);
  expect(leitura.arestas).toBe(15);   // os 10 enlaces repetidos saem como um, como estão na tela
  const foto = await p.evaluate(() => window.__mapa!.toPng());
  expect(foto.startsWith("data:image/png;base64,")).toBe(true);
});
