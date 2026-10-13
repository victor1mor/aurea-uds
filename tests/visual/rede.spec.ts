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
  // Dupla, `thick` e com cor (o estado "Ativo", desde 12/10/2026): 3 × (2 × 1) × 2 — a linha com cor tem o
  // dobro (13/10/2026). A fibra SEM cor e sem `thick` fica nos 3 × 1 de sempre.
  const fibra = await traco("fw-core");
  expect(fibra.largura).toBe(12);
  expect(fibra.miolo).toBe(true);
  expect((await traco("core-srv")).largura).toBe(3);
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
  // Em duas partes (12/10/2026): o tipo da ligação e o estado, cada lista com o nome do título à vista.
  const legenda = p.getByRole("group", {name: "Legenda"});
  expect(await legenda.getByRole("list", {name: "Tipo de ligação"}).locator("li").allTextContents())
    .toEqual(["Cobre", "VPN", "Fibra", "Agregação (LAG)", "Estimado", "Sem fio", "Anotado à mão"]);
  expect(await legenda.getByRole("list", {name: "Estado"}).locator("li").allTextContents()).toEqual(["Ativo", "Atenção", "Caído"]);
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

// MNT-26 (passo 10, 12/10/2026): a COR da linha é o ESTADO dela (`status`, como o selo do nó). A cor é a
// de letra e borda sobre a tela (o par `-400`), pinta o traço E a amostra da parte "Estado" da legenda (a
// palavra ao lado diz o que é); a amostra do TIPO fica sem cor, mesmo quando as linhas dele estão em
// atenção; e a linha sem estado continua na cor de sempre. No alto contraste, a linha de cor continua de cor.
const corDoTraco = (p: Page, id: string) => p.evaluate((i) =>
  getComputedStyle(document.querySelector(`.react-flow__edge[data-id="${i}"] path.react-flow__edge-path`)!).stroke, id);
const corDaAmostra = (p: Page, nome: string) => p.evaluate((n) => {
  const li = [...document.querySelectorAll(".graph-legend li")].find((x) => x.textContent === n)!;
  return getComputedStyle(li.querySelector(".graph-legend-sample .graph-edge")!).stroke;
}, nome);
const corDoToken = (p: Page, token: string) => p.evaluate((t) => {
  const el = document.createElement("span");
  el.style.color = `var(${t})`;
  document.querySelector(".dependency-graph")!.append(el);
  const c = getComputedStyle(el).color;
  el.remove();
  return c;
}, token);

test("MNT-26 · a linha tem a cor do estado: o traço e a amostra do estado no tom; a do tipo e a linha sem estado ficam como eram", async ({page: p}) => {
  await abrir(p);
  const perigo = await corDoToken(p, "--danger-400"), atencao = await corDoToken(p, "--warning-400"), neutra = await corDoToken(p, "--muted-foreground");
  expect(perigo).not.toBe(neutra);
  expect(await corDoTraco(p, "a3-cam")).toBe(perigo);
  expect(await corDaAmostra(p, "Caído")).toBe(perigo);
  expect(await corDoTraco(p, "b-lldp")).toBe(atencao);
  expect(await corDaAmostra(p, "Atenção")).toBe(atencao);
  expect(await corDaAmostra(p, "Estimado")).toBe(neutra);
  expect(await corDoTraco(p, "a-1")).toBe(neutra);
  expect(await corDaAmostra(p, "Cobre")).toBe(neutra);
});

test("o × do estado aparece no meio da linha caída, e não na linha de cobre que funciona", async ({page: p}) => {
  await abrir(p);
  await expect(p.locator('[data-edge-label="a3-cam"] .graph-edge-mark-cross')).toBeVisible();
  // Só uma linha do mapa está caída: um × só no meio das linhas (a amostra da legenda é à parte).
  await expect(p.locator(".graph-edge-chip .graph-edge-mark-cross")).toHaveCount(1);
});

test("MNT-26 · no alto contraste, a linha de cor continua de cor e a sem tom vai à cor do texto", async ({page: p}) => {
  await abrir(p, "grande&contraste");
  expect(await corDoTraco(p, "a3-cam")).toBe(await corDoToken(p, "--danger-400"));
  expect(await corDoTraco(p, "a-1")).toBe(await corDoToken(p, "--foreground"));
});

// A LINHA COM COR É MAIS GROSSA (ordem do Victor, 13/10/2026: "pode engrossar a linha com cor"). Medido com o
// mapa no "caber na tela" (zoom 0,57): com 1 de espessura — e com 1,5 —, nenhum ponto da linha chegava à cor
// de verdade (o mais perto ficava a 43 de distância de cor) e a "WAN 1G" verde parecia cinza; com 2, a cor
// aparece exata. As três espessuras dobram JUNTAS na linha com cor (2, 4, 6), para a velocidade continuar
// legível entre as linhas com cor; o miolo da linha dupla dobra com ela.
const larguraDoTraco = (p: Page, id: string, sel = "path.react-flow__edge-path") => p.evaluate(([i, s]) =>
  parseFloat(getComputedStyle(document.querySelector(`.react-flow__edge[data-id="${i}"] ${s}`)!).strokeWidth), [id, sel] as const);
const distanciaDaCor = async (p: Page, id: string, token: string) => {
  const alvo = await corDoToken(p, token);
  const caixa = (await p.locator(`.react-flow__edge[data-id="${id}"] path.react-flow__edge-path`).boundingBox())!;
  const foto = (await p.screenshot({clip: {x: caixa.x - 6, y: caixa.y + 4, width: caixa.width + 12, height: Math.max(4, caixa.height - 8)}})).toString("base64");
  return p.evaluate(async ([f, a]) => {
    const [r0, g0, b0] = a.match(/\d+/g)!.map(Number);
    const img = new Image();
    img.src = "data:image/png;base64," + f;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext("2d")!;
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let melhor = Infinity;
    for (let i = 0; i < d.length; i += 4) melhor = Math.min(melhor, Math.hypot(d[i] - r0, d[i + 1] - g0, d[i + 2] - b0));
    return melhor;
  }, [foto, alvo] as const);
};

test("a linha com cor é o dobro da sem cor, nas três espessuras, e a cor aparece com o mapa afastado", async ({page: p}) => {
  await abrir(p);
  // Comum: o "Caído" (com cor) tem o dobro do cobre comum (sem cor).
  expect(await larguraDoTraco(p, "a3-cam")).toBe(2 * await larguraDoTraco(p, "a-1"));
  // Grossa: o miolo da fibra 10G "Ativo" (= a espessura dela) tem o dobro da agregação grossa sem cor.
  expect(await larguraDoTraco(p, "fw-core", "path.graph-edge-double-core")).toBe(2 * await larguraDoTraco(p, "lag-a"));
  // E, no "caber na tela", algum ponto da linha chega à cor de verdade.
  expect(await distanciaDaCor(p, "a3-cam", "--danger-400")).toBeLessThan(8);
});

test("no alto contraste, a linha com cor continua o dobro da sem cor", async ({page: p}) => {
  await abrir(p, "grande&contraste");
  expect(await larguraDoTraco(p, "a3-cam")).toBe(2 * await larguraDoTraco(p, "a-1"));
});
