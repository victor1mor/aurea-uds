import {test, expect, type Page} from "@playwright/test";

// A RODADA 2 DA REDE medida montada — ADR-0065, 10/10/2026.
//
// O que o jsdom não prova, porque não tem leiaute, ponteiro nem medida: arrumar à mão (escolher, laço,
// alinhar, setas, arrastar, fixo, reorganizar) com desfazer e o aviso para o app guardar; o contêiner e
// a subárvore que fecham; as rotas que não atravessam nó (do arrumador, do desvio e do degrau); a ponte;
// os rótulos que somem; a árvore e o círculo; o arrumador fora da tela principal; o teclado do mapa de
// leitura; a nuvem; e a exportação com contêiner, nuvem e dobras.
//
// O banco é `apps/keyboard-probe/rede2.html`, construído pelo `pnpm build`. Cada caso abre com as
// opções no endereço (ver src/rede2.tsx).
//
// Provado contra o defeito: na 0.30.0 nada disto existe — não há `editable`, `parentId`, `collapsible`,
// `shape`, rota nem ponte —, e o mapa de leitura dava DUAS paradas de Tab por nó e uma por linha, com o
// texto do motor em inglês (medido na bancada da rodada 1). E os defeitos que a bancada desta rodada
// achou estão aqui: o rótulo por baixo das linhas e do contêiner, o botão de fechar em cima da porta, o
// clique no botão que escolhia o nó, o desvio jogado fora quando a ponta caía em cima de outro nó, a
// caixa de contêiner na árvore, e a nuvem com o ícone para fora.
const APP = process.env.AUREA_REDE2 ?? "/apps/keyboard-probe/out/rede2.html";

async function abrir(p: Page, opcoes = "") {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.setViewportSize({width: 1280, height: 1000});
  await p.goto(`${APP}?${opcoes}`, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  await parar(p);
  return erros;
}
/** Espera os nós e as linhas pararem de mudar: a arrumação e o desvio chegam depois do primeiro desenho. */
async function parar(p: Page) {
  await p.waitForFunction(() => {
    const w = window as unknown as {__ultima2?: string};
    const agora = [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((n) => n.style.transform).join("|")
      + [...document.querySelectorAll(".react-flow__edge-path")].map((e) => e.getAttribute("d")).join("|");
    const parado = agora !== "" && agora === w.__ultima2;
    w.__ultima2 = agora;
    return parado;
  }, undefined, {polling: 400, timeout: 15_000});
}
const mapa = (p: Page) => p.locator(".dependency-graph").first();
const no = (p: Page, id: string) => mapa(p).locator(`.react-flow__node[data-id="${id}"]`);
const caixa = (p: Page, id: string) => no(p, id).boundingBox();
const eventos = (p: Page) => p.evaluate(() => (window as unknown as {__eventos2: string[]}).__eventos2.splice(0));
const caber = async (p: Page) => { await p.evaluate(() => (window as unknown as {__mapa2: {fitView(): void}}).__mapa2.fitView()); await parar(p); };

/** Amostra cada linha a cada 3 px e diz quais atravessam o MIOLO de um nó que não é ponta dela. */
function atravessadas(p: Page) {
  return p.evaluate(() => {
    const raiz = document.querySelector(".dependency-graph")!;
    const caixas = [...raiz.querySelectorAll<HTMLElement>(".react-flow__node")].filter((n) => n.querySelector(".graph-node"))
      .map((n) => ({id: n.dataset.id!, r: n.querySelector(".graph-node")!.getBoundingClientRect()}));
    const pontas = new Map((window as unknown as {__arestas2: {id: string; from: string; to: string}[]}).__arestas2.map((a) => [a.id, [a.from, a.to]]));
    const ruins: string[] = [];
    for (const g of raiz.querySelectorAll<SVGGElement>(".react-flow__edge")) {
      const id = g.dataset.id!, [de, para] = pontas.get(id) ?? [];
      const linha = g.querySelector<SVGPathElement>(".react-flow__edge-path")!, m = linha.getScreenCTM()!, total = linha.getTotalLength();
      fora: for (let s = 0; s <= total; s += 3) {
        const q = linha.getPointAtLength(s), x = m.a * q.x + m.c * q.y + m.e, y = m.b * q.x + m.d * q.y + m.f;
        for (const c of caixas) {
          if (c.id === de || c.id === para) continue;
          if (x > c.r.left + 2 && x < c.r.right - 2 && y > c.r.top + 2 && y < c.r.bottom - 2) { ruins.push(`${id} × ${c.id}`); break fora; }
        }
      }
    }
    return ruins;
  });
}

test("arrumar: Shift soma, alinhar, Ctrl+Z desfaz e Refazer refaz — e cada passo avisa o app", async ({page: p}) => {
  const erros = await abrir(p);
  await caber(p);
  const a0 = (await caixa(p, "pc-11"))!, b0 = (await caixa(p, "pc-21"))!;
  expect(Math.round(a0.y)).not.toBe(Math.round(b0.y));
  await no(p, "pc-11").click();
  await no(p, "pc-21").click({modifiers: ["Shift"]});
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(2);
  await eventos(p);
  await p.getByRole("button", {name: "Alinhar em cima"}).click();
  await parar(p);
  expect(Math.round((await caixa(p, "pc-21"))!.y)).toBe(Math.round(a0.y));
  expect((await eventos(p)).some((e) => e.startsWith("arrumacao:"))).toBe(true);
  // O app recebe TODAS as posições (as folhas) e os fixos: o servidor da bancada já vem fixo.
  const l = await p.evaluate(() => (window as unknown as {__arrumacao2: {positions: Record<string, unknown>; pinned: string[]}}).__arrumacao2);
  expect(Object.keys(l.positions)).toContain("pc-21");
  expect(l.pinned).toEqual(["srv"]);
  await p.keyboard.press("Control+z");
  await parar(p);
  expect(Math.round((await caixa(p, "pc-21"))!.y)).toBe(Math.round(b0.y));
  await p.getByRole("button", {name: "Refazer"}).click();
  await parar(p);
  expect(Math.round((await caixa(p, "pc-21"))!.y)).toBe(Math.round(a0.y));
  expect(erros).toEqual([]);
});

test("arrumar: a seta anda um passo da grade, o arraste encaixa, o fixo não sai do lugar, e Reorganizar volta", async ({page: p}) => {
  await abrir(p);
  await caber(p);
  const auto = (await caixa(p, "acc-2"))!;
  const antes = await p.evaluate(() => (window as unknown as {__mapa2: {getLayout(): {positions: Record<string, {x: number; y: number}>}}}).__mapa2.getLayout().positions["acc-2"]);
  await no(p, "acc-2").click();
  await p.keyboard.press("ArrowRight");
  await parar(p);
  // A seta anda até a PRÓXIMA linha da grade de 16 (`--space-4`): o nó que veio do arrumador fora da
  // grade encaixa no primeiro passo (o motor arredonda para a grade), e daí em diante anda 16.
  const passo1 = await p.evaluate(() => (window as unknown as {__arrumacao2: {positions: Record<string, {x: number; y: number}>}}).__arrumacao2.positions["acc-2"]);
  expect(passo1.x % 16).toBe(0);
  expect(passo1.x - antes.x).toBeGreaterThan(0);
  expect(passo1.x - antes.x).toBeLessThanOrEqual(16);
  // O encaixe vale nos dois eixos: a altura vai à linha da grade mais perto, sem andar.
  expect(passo1.y % 16).toBe(0);
  expect(Math.abs(passo1.y - antes.y)).toBeLessThanOrEqual(8);
  await p.keyboard.press("ArrowRight");
  await parar(p);
  const passo2 = await p.evaluate(() => (window as unknown as {__arrumacao2: {positions: Record<string, {x: number; y: number}>}}).__arrumacao2.positions["acc-2"]);
  expect(passo2.x - passo1.x).toBe(16);
  expect(passo2.y).toBe(passo1.y);
  const d0 = (await caixa(p, "acc-2"))!;
  await p.mouse.move(d0.x + d0.width / 2, d0.y + 8);
  await p.mouse.down();
  await p.mouse.move(d0.x + d0.width / 2 + 101, d0.y + 8 + 53, {steps: 8});
  await p.mouse.up();
  await parar(p);
  const pos = await p.evaluate(() => (window as unknown as {__arrumacao2: {positions: Record<string, {x: number; y: number}>}}).__arrumacao2.positions["acc-2"]);
  expect(pos.x % 16).toBe(0);
  expect(pos.y % 16).toBe(0);
  const s0 = (await caixa(p, "srv"))!;
  await p.mouse.move(s0.x + s0.width / 2, s0.y + 8);
  await p.mouse.down();
  await p.mouse.move(s0.x + s0.width / 2 + 90, s0.y + 70, {steps: 6});
  await p.mouse.up();
  await parar(p);
  const s1 = (await caixa(p, "srv"))!;
  expect([Math.round(s1.x), Math.round(s1.y)]).toEqual([Math.round(s0.x), Math.round(s0.y)]);
  await p.getByRole("button", {name: "Reorganizar"}).click();
  await parar(p);
  await caber(p);
  const volta = (await caixa(p, "acc-2"))!;
  expect([Math.round(volta.x), Math.round(volta.y)]).toEqual([Math.round(auto.x), Math.round(auto.y)]);
});

test("arrumar: o laço na área vazia escolhe o que pega, e Ctrl+A escolhe todos", async ({page: p}) => {
  await abrir(p);
  await caber(p);
  const f = (await caixa(p, "fw"))!, i = (await caixa(p, "internet"))!;
  await p.mouse.move(Math.min(f.x, i.x) - 30, i.y - 20);
  await p.mouse.down();
  await p.mouse.move(Math.max(f.x + f.width, i.x + i.width) + 30, f.y + f.height + 10, {steps: 8});
  await p.mouse.up();
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(2);
  await no(p, "fw").focus();
  await p.keyboard.press("Control+a");
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(await mapa(p).locator(".react-flow__node").count());
});

test("arrumar: arrastar o contêiner leva os filhos junto, pelo mesmo tanto", async ({page: p}) => {
  await abrir(p);
  await caber(p);
  const cabeca = mapa(p).locator(".react-flow__node[data-id=\"andar1\"] .graph-group-head");
  const h = (await cabeca.boundingBox())!, f0 = (await caixa(p, "pc-11"))!;
  await p.mouse.move(h.x + h.width - 10, h.y + h.height / 2);
  await p.mouse.down();
  await p.mouse.move(h.x + h.width - 10 - 64, h.y + h.height / 2 + 48, {steps: 8});
  await p.mouse.up();
  await parar(p);
  const f1 = (await caixa(p, "pc-11"))!, a1 = (await mapa(p).locator(".react-flow__node[data-id=\"andar1\"]").boundingBox())!;
  expect(f1.x - f0.x).toBeLessThan(-20);
  expect(f1.y - f0.y).toBeGreaterThan(20);
  // E a caixa continua em volta do filho.
  expect(a1.x).toBeLessThan(f1.x);
  expect(a1.y + a1.height).toBeGreaterThan(f1.y + f1.height);
});

test("o contêiner fecha e abre: guarda os filhos, diz quantos, e o clique no botão não escolhe o nó", async ({page: p}) => {
  await abrir(p);
  await eventos(p);
  await p.getByRole("button", {name: "Fechar Depósito"}).click();
  await parar(p);
  await expect(no(p, "acc-3")).toHaveCount(0);
  await expect(p.getByRole("button", {name: "Abrir Depósito (4 ocultos)"})).toHaveAttribute("aria-expanded", "false");
  const ev = await eventos(p);
  expect(ev).toContain("fechou:deposito");
  expect(ev.filter((e) => e.startsWith("escolha:deposito"))).toEqual([]);
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(0);
  // A linha que entrava no segmento sem LLDP agora chega no Depósito fechado.
  await expect(no(p, "deposito")).toHaveCount(1);
  await p.getByRole("button", {name: /^Abrir Depósito/}).click();
  await parar(p);
  await expect(no(p, "acc-3")).toHaveCount(1);
});

test("a subárvore recolhe só o que o nó DOMINA: o 2º andar, ligado também pelo núcleo, fica", async ({page: p}) => {
  await abrir(p);
  await p.getByRole("button", {name: "Fechar Acesso 1º andar"}).click();
  await parar(p);
  await expect(no(p, "pc-11")).toHaveCount(0);
  await expect(no(p, "pc-12")).toHaveCount(0);
  await expect(no(p, "acc-2")).toHaveCount(1);
  await expect(p.getByRole("button", {name: "Abrir Acesso 1º andar (2 ocultos)"})).toBeVisible();
  // O botão do NÓ também não escolhe o nó (no modo de arrumar, o clique subia até a caixa do motor).
  await expect(mapa(p).locator(".react-flow__node.selected")).toHaveCount(0);
});

test("rotas: arrumado pelo arrumador, nenhuma linha atravessa um nó", async ({page: p}) => {
  await abrir(p);
  await caber(p);
  expect(await atravessadas(p)).toEqual([]);
});

test("rotas: com as posições do app (sem a rota do arrumador), a linha que cruzaria um nó desvia", async ({page: p}) => {
  await abrir(p, "posicoes");
  await caber(p);
  expect(await atravessadas(p)).toEqual([]);
  // O desvio de verdade: a VPN sai por baixo do firewall e chega por cima da filial, que está MAIS ALTA —
  // o degrau simples passaria por dentro do próprio firewall. A rota tem mais de duas dobras.
  const d = await mapa(p).locator(".react-flow__edge[data-id=\"vpn\"] .react-flow__edge-path").getAttribute("d");
  expect((d!.match(/Q/g) ?? []).length).toBeGreaterThan(2);
});

test("a ponte: a segunda linha salta sobre a primeira no cruzamento, e só ela", async ({page: p}) => {
  await abrir(p);
  const ponte = p.locator(".mapa-ponte");
  const ab = await ponte.locator(".react-flow__edge[data-id=\"ab\"] .react-flow__edge-path").getAttribute("d");
  const cd = await ponte.locator(".react-flow__edge[data-id=\"cd\"] .react-flow__edge-path").getAttribute("d");
  expect(ab).not.toMatch(/ A/);
  expect(cd).toMatch(/ A6,6 0 0 1 /);
});

test("rótulos: nenhum rótulo à vista cobre outro nem um nó; o que encosta some; longe, o texto das linhas some", async ({page: p}) => {
  await abrir(p);
  await caber(p);
  const r = await p.evaluate(() => {
    const raiz = document.querySelector(".dependency-graph")!;
    const caixa = (e: Element) => e.getBoundingClientRect();
    const todos = [...raiz.querySelectorAll("[data-edge-label]")];
    const vistos = todos.filter((e) => getComputedStyle(e).visibility === "visible").map(caixa);
    const nos = [...raiz.querySelectorAll(".graph-node")].map(caixa);
    const cobre = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    let sobre = 0;
    vistos.forEach((a, i) => { vistos.forEach((b, j) => { if (i < j && cobre(a, b)) sobre++; }); nos.forEach((n) => { if (cobre(a, n)) sobre++; }); });
    // E o rótulo está POR CIMA do que passa por ali: na primeira versão, o nome da porta ficava por baixo
    // da caixa do contêiner, e o "10G" por baixo da fibra que entra nele.
    // (O nome da ponta não recebe ponteiro, e quem não recebe ponteiro o `elementFromPoint` pula: aqui,
    // só para a pergunta, todo rótulo recebe.)
    const folha = document.head.appendChild(document.createElement("style"));
    folha.textContent = "[data-edge-label],[data-edge-label] *{pointer-events:auto!important}";
    const tapados = todos.filter((e) => getComputedStyle(e).visibility === "visible").filter((e) => {
      const r = caixa(e), alvo = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !(alvo && (e === alvo || e.contains(alvo)));
    }).map((e) => e.getAttribute("data-edge-label"));
    folha.remove();
    return {sobre, tapados, somem: todos.filter((e) => e.hasAttribute("data-crowded")).length, vistos: vistos.length};
  });
  expect(r.sobre).toBe(0);
  expect(r.tapados).toEqual([]);
  expect(r.somem).toBeGreaterThan(0);
  expect(r.vistos).toBeGreaterThan(5);
  for (let k = 0; k < 4; k++) await p.evaluate(() => (window as unknown as {__mapa2: {zoomOut(): void}}).__mapa2.zoomOut());
  await expect(mapa(p)).toHaveAttribute("data-far", "");
  const fim = mapa(p).locator(".graph-edge-end").first();
  expect(await fim.evaluate((e) => getComputedStyle(e).visibility)).toBe("hidden");
});

test("árvore e círculo: sem caixa de contêiner; no círculo, a linha é reta de borda a borda", async ({page: p}) => {
  await abrir(p, "arrumacao=tree");
  await expect(mapa(p).locator(".graph-group")).toHaveCount(0);
  await expect(mapa(p).locator(".graph-node")).toHaveCount(15);
  const [internet, fw, core] = await Promise.all(["internet", "fw", "core"].map((id) => caixa(p, id)));
  expect(internet!.y).toBeLessThan(fw!.y);
  expect(fw!.y).toBeLessThan(core!.y);
  await abrir(p, "arrumacao=radial");
  await expect(mapa(p).locator(".graph-group")).toHaveCount(0);
  const ds = await mapa(p).locator(".react-flow__edge-path").evaluateAll((l) => l.map((e) => e.getAttribute("d")!));
  for (const d of ds) expect(d, d).toMatch(/^M[-\d.]+,[-\d.]+ L[-\d.]+,[-\d.]+$/);
});

test("o arrumador fora da tela principal (a receita do Vite) arruma igual ao da tela", async ({page: p}) => {
  await abrir(p);
  const na = await mapa(p).locator(".react-flow__node").evaluateAll((l) => l.map((n) => `${(n as HTMLElement).dataset.id}:${(n as HTMLElement).style.transform}`).sort());
  const erros = await abrir(p, "trabalhador");
  const fora = await mapa(p).locator(".react-flow__node").evaluateAll((l) => l.map((n) => `${(n as HTMLElement).dataset.id}:${(n as HTMLElement).style.transform}`).sort());
  expect(fora).toEqual(na);
  expect(erros).toEqual([]);
});

test("teclado do mapa de leitura: uma parada por nó, a linha só com onEdgeSelect, e nada em inglês", async ({page: p}) => {
  await abrir(p, "leitura");
  // Medido na bancada da rodada 1: a caixa do motor e o botão do nó davam DUAS paradas por nó.
  await expect(mapa(p).locator(".react-flow__node[tabindex=\"0\"]")).toHaveCount(0);
  await expect(mapa(p).locator(".react-flow__node button.graph-node-body")).toHaveCount(15);
  // Este mapa avisa a escolha de linha: aí ela é parada, com nome nosso, e o Enter escolhe.
  const linha = mapa(p).locator(".react-flow__edge[data-id=\"vpn\"]");
  await expect(linha).toHaveAttribute("tabindex", "0");
  await expect(linha).toHaveAttribute("aria-label", "Ligação: Firewall – Filial Centro (VPN)");
  await eventos(p);
  await linha.focus();
  await p.keyboard.press("Enter");
  expect(await eventos(p)).toContain("aresta:vpn");
  // O mapa da ponte não avisa linha: nenhuma linha é parada.
  await expect(p.locator(".mapa-ponte .react-flow__edge[tabindex=\"0\"]")).toHaveCount(0);
  const textos = await p.locator("[id^=\"react-flow__node-desc\"],[id^=\"react-flow__edge-desc\"]").allTextContents();
  for (const t of textos) expect(t).not.toMatch(/Press|delete|node|edge/i);
});

test("teclado do modo de arrumar: o nó é UMA parada, o anel vai no corpo dele, e a descrição é nossa", async ({page: p}) => {
  await abrir(p);
  const caixaDoMotor = no(p, "fw");
  await expect(caixaDoMotor).toHaveAttribute("tabindex", "0");
  await expect(caixaDoMotor.locator("button.graph-node-body")).toHaveCount(0);
  await caixaDoMotor.focus();
  await p.keyboard.press("Shift+Tab");
  await p.keyboard.press("Tab");
  const anel = await p.evaluate(() => {
    const ativo = document.activeElement as HTMLElement;
    const corpo = ativo.querySelector(".graph-node-body")!;
    return {caixa: getComputedStyle(ativo).outlineStyle, corpo: getComputedStyle(corpo).outlineStyle, largura: getComputedStyle(corpo).outlineWidth};
  });
  expect(anel).toEqual({caixa: "none", corpo: "solid", largura: "2px"});
  const desc = await p.locator("[id^=\"react-flow__node-desc\"]").first().textContent();
  expect(desc).toBe("Enter ou Espaço escolhe o nó. Escolhido, as setas o movem; com Shift, mais longe. Esc solta.");
});

test("a nuvem: o contorno de nuvem, e o ícone e o nome DENTRO dele", async ({page: p}) => {
  await abrir(p);
  const n = no(p, "internet");
  await expect(n.locator("svg.graph-node-cloud path")).toHaveCount(1);
  const [contorno, icone] = await Promise.all([n.locator("svg.graph-node-cloud path").boundingBox(), n.locator(".graph-node-icon").boundingBox()]);
  expect(icone!.x).toBeGreaterThan(contorno!.x + 4);
  expect(icone!.x + icone!.width).toBeLessThan(contorno!.x + contorno!.width - 4);
});

test("exporta: o .drawio leva o contêiner, a nuvem e as dobras das linhas", async ({page: p}) => {
  await abrir(p);
  const xml = await p.evaluate(() => (window as unknown as {__mapa2: {toDrawio(): string}}).__mapa2.toDrawio());
  expect(xml).toContain("container=1");
  expect(xml).toContain("shape=cloud");
  expect(xml).toMatch(/<Array as="points"><mxPoint /);
  expect(xml).toContain('parent="n-matriz"');
  expect(await p.evaluate((x) => !!new DOMParser().parseFromString(x, "application/xml").querySelector("parsererror"), xml)).toBe(false);
});

test("a ponta largada em cima de outro nó: a linha fica no desvio, e não volta ao degrau do motor", async ({page: p}) => {
  await abrir(p);
  await caber(p);
  // A filial vai para cima da câmera: não há caminho livre até ela, e o desvio nasce cruzando.
  const f = (await caixa(p, "filial"))!, c = (await caixa(p, "cam"))!;
  await p.mouse.move(f.x + f.width / 2, f.y + 8);
  await p.mouse.down();
  // O motor mede o ponto de pega quando o arraste começa: o mouse desce aos poucos até a borda de cima
  // da filial entrar na câmera.
  await p.mouse.move(c.x + c.width / 2 + 30, c.y - 20, {steps: 10});
  for (let y = c.y - 20; y < c.y + c.height + 60; y += 4) {
    await p.mouse.move(c.x + c.width / 2 + 30, y);
    const agora = (await caixa(p, "filial"))!;
    if (agora.y > c.y + 4 && agora.y < c.y + c.height - 4) break;
  }
  await p.mouse.up();
  await parar(p);
  // A alça de cima da filial (o meio da borda de cima) ficou DENTRO da câmera.
  const f1 = (await caixa(p, "filial"))!;
  expect(f1.y).toBeGreaterThan(c.y);
  expect(f1.y).toBeLessThan(c.y + c.height);
  expect(f1.x + f1.width / 2).toBeLessThan(c.x + c.width);
  // O traçado é o NOSSO (pontos separados por vírgula); o do motor separa por espaço ("M719 247L…").
  const d = await mapa(p).locator(".react-flow__edge[data-id=\"vpn\"] .react-flow__edge-path").getAttribute("d");
  expect(d).toMatch(/^M[-\d.]+,[-\d.]+ L/);
});

test("o botão de fechar fica no canto, fora da alça das portas", async ({page: p}) => {
  await abrir(p);
  await caber(p);
  const botao = (await no(p, "core").locator(".graph-node-toggle").boundingBox())!;
  // Onde cada linha que sai do núcleo nasce, em tela.
  const pontas = await p.evaluate(() => [...document.querySelectorAll<SVGGElement>(".react-flow__edge")]
    .filter((g) => ["core-a1", "core-a2", "core-srv", "core-lldp"].includes(g.dataset.id!)).map((g) => {
      const l = g.querySelector<SVGPathElement>(".react-flow__edge-path")!, m = l.getScreenCTM()!, q = l.getPointAtLength(0);
      return {x: m.a * q.x + m.c * q.y + m.e, y: m.b * q.x + m.d * q.y + m.f};
    }));
  expect(pontas.length).toBe(4);
  for (const q of pontas) expect(q.x < botao.x || q.x > botao.x + botao.width || q.y < botao.y || q.y > botao.y + botao.height, JSON.stringify(q)).toBe(true);
});
