// Rodada 2 da rede (0.31.0, ADR-0065) · a geometria, que se prova sem navegador:
//   MNT-13.3: alinhar pela borda mais externa e distribuir com as pontas paradas;
//   MNT-16.7: o que um nó DOMINA — com cabo redundante, o switch de acesso não some com um núcleo;
//   MNT-16.4/16.6: o que fecha, quem fica no lugar e a linha agregada com o número;
//   MNT-12.3: a ponte só onde o deitado cruza o de pé, só na linha de cima, e nunca na dobra;
//   MNT-12.5: o rótulo que encosta some pela prioridade;
//   MNT-16.5: a nuvem cabe na caixa.
// Provado contra o defeito: na 0.30.0 nenhuma dessas funções existe (o módulo não existe).
import {describe, expect, test} from "vitest";
import {alinhar, distribuir, subarvores, recolher, remapear, simplificar, pontes, tracado, trechoCruza, rotaCruza,
  rotulosQueSomem, contornoDeNuvem, meioDoTracado, ladoDoTrecho, bordaNaDirecao, type Caixa} from "../../packages/react/src/graph-geometria";

const cx = (x: number, y: number, larg = 180, alt = 52): Caixa => ({x, y, larg, alt});

describe("MNT-13.3 · alinhar e distribuir", () => {
  const sel = new Map([["a", cx(10, 0)], ["b", cx(100, 80, 120)], ["c", cx(40, 200, 180, 70)]]);
  test("à esquerda, todos na menor borda; à direita, na maior", () => {
    expect([...alinhar(sel, "left").values()].map(p => p.x)).toEqual([10, 10, 10]);
    const d = alinhar(sel, "right");
    expect(d.get("a")!.x + 180).toBe(220);
    expect(d.get("b")!.x + 120).toBe(220);
  });
  test("no centro, o meio da caixa que envolve todos; o outro eixo não mexe", () => {
    const d = alinhar(sel, "center");
    expect(d.get("b")).toEqual({x: Math.round((10 + 220 - 120) / 2), y: 80});
  });
  test("embaixo e no meio, pela altura de cada um", () => {
    expect(alinhar(sel, "bottom").get("c")!.y + 70).toBe(270);
    expect(alinhar(sel, "bottom").get("a")!.y + 52).toBe(270);
    expect(alinhar(sel, "middle").get("a")!.y).toBe(Math.round((0 + 270 - 52) / 2));
  });
  test("distribuir deixa as pontas paradas e os vãos iguais", () => {
    const linha = new Map([["a", cx(0, 0, 100)], ["b", cx(130, 0, 60)], ["c", cx(500, 0, 100)]]);
    const d = distribuir(linha, "horizontal");
    expect(d.get("a")!.x).toBe(0);
    expect(d.get("c")!.x).toBe(500);
    const vao1 = d.get("b")!.x - 100, vao2 = 500 - (d.get("b")!.x + 60);
    expect(Math.abs(vao1 - vao2)).toBeLessThanOrEqual(1);
  });
  test("com nós sobrepostos, o passo igual vai para os centros", () => {
    const apertado = new Map([["a", cx(0, 0)], ["b", cx(30, 0)], ["c", cx(100, 0)]]);
    const d = distribuir(apertado, "horizontal");
    expect(d.get("b")!.x + 90).toBe(Math.round((90 + 190) / 2));
  });
  test("com menos de três, nada muda", () => {
    const dois = new Map([["a", cx(0, 0)], ["b", cx(300, 9)]]);
    expect(distribuir(dois, "horizontal").get("b")).toEqual({x: 300, y: 9});
  });
});

describe("MNT-16.7 · o que um nó domina", () => {
  test("numa árvore, a subárvore inteira", () => {
    const d = subarvores(["r", "a", "b", "a1", "a2"], [{from: "r", to: "a"}, {from: "r", to: "b"}, {from: "a", to: "a1"}, {from: "a1", to: "a2"}], "r");
    expect(new Set(d.get("a"))).toEqual(new Set(["a1", "a2"]));
    expect(new Set(d.get("r"))).toEqual(new Set(["a", "b", "a1", "a2"]));
    expect(d.has("b")).toBe(false);
  });
  test("com cabo redundante, o acesso NÃO é de nenhum dos dois núcleos — só do firewall", () => {
    const e = [{from: "fw", to: "n1"}, {from: "fw", to: "n2"}, {from: "n1", to: "ac"}, {from: "n2", to: "ac"}, {from: "ac", to: "pc"}];
    const d = subarvores(["fw", "n1", "n2", "ac", "pc"], e, "fw");
    expect(d.has("n1")).toBe(false);
    expect(d.has("n2")).toBe(false);
    expect(new Set(d.get("fw"))).toEqual(new Set(["n1", "n2", "ac", "pc"]));
    expect(d.get("ac")).toEqual(["pc"]);
  });
  test("ciclo sem entrada e nó solto não travam", () => {
    const d = subarvores(["a", "b", "c", "solto"], [{from: "a", to: "b"}, {from: "b", to: "c"}, {from: "c", to: "a"}]);
    expect(d.get("solto")).toBeUndefined();
    expect(d.size).toBeGreaterThan(0);
  });
});

describe("MNT-16.4 e 16.6 · fechar e quem fica no lugar", () => {
  const ids = ["inet", "sw", "andar", "pc1", "pc2", "pc3"];
  const pais = new Map([["pc1", "andar"], ["pc2", "andar"], ["pc3", "andar"]]);
  const arestas = [{from: "inet", to: "sw"}, {from: "sw", to: "pc1"}, {from: "sw", to: "pc2"}, {from: "sw", to: "pc3"}, {from: "pc1", to: "pc2"}];
  test("o contêiner fechado guarda os três e as três linhas viram uma, com o número", () => {
    const {rep, guardados} = recolher(ids, pais, new Map(), new Set(["andar"]), new Set(["andar"]));
    expect(rep.get("pc2")).toBe("andar");
    expect(guardados.get("andar")).toBe(3);
    const r = remapear(arestas, rep);
    const agregada = r.find(x => x.para === "andar")!;
    expect(agregada.de).toBe("sw");
    expect(agregada.n).toBe(3);
    // A linha de dentro (pc1→pc2) some; a de fora fica inteira.
    expect(r.length).toBe(2);
    expect(r[0]).toMatchObject({de: "inet", para: "sw", n: 1});
  });
  test("a subárvore recolhida guarda o que o nó domina, e o recolhido de fora vence", () => {
    const dom = subarvores(ids.filter(i => i !== "andar"), arestas, "inet");
    const {rep, guardados} = recolher(ids, new Map(), dom, new Set(["sw", "inet"]), new Set());
    expect(rep.get("pc3")).toBe("inet");
    expect(rep.get("sw")).toBe("inet");
    expect(guardados.get("inet")).toBe(4);
    expect(guardados.has("sw")).toBe(false);
  });
  test("nada fechado: nada muda", () => {
    const {rep} = recolher(ids, pais, new Map(), new Set(), new Set(["andar"]));
    expect(remapear(arestas, rep).map(x => [x.de, x.para])).toEqual(arestas.map(e => [e.from, e.to]));
  });
});

describe("MNT-12.3 · as pontes", () => {
  const deitada = {id: "h", pontos: [{x: 0, y: 100}, {x: 400, y: 100}]};
  const dePe = {id: "v", pontos: [{x: 200, y: 0}, {x: 200, y: 300}]};
  test("só a linha desenhada DEPOIS salta, no ponto do cruzamento", () => {
    const p = pontes([deitada, dePe], 4, 8);
    expect(p.has("h")).toBe(false);
    expect(p.get("v")!.get(0)).toEqual([{de: 96, ate: 104}]);
  });
  test("paralelas não se cruzam; cruzamento colado na dobra não ganha ponte", () => {
    expect(pontes([deitada, {id: "h2", pontos: [{x: 0, y: 120}, {x: 400, y: 120}]}], 4, 8).size).toBe(0);
    const dobraNoCruzamento = {id: "d", pontos: [{x: 200, y: 0}, {x: 200, y: 105}, {x: 300, y: 105}]};
    expect(pontes([deitada, dobraNoCruzamento], 4, 8).size).toBe(0);
  });
  test("duas pontes que se encostam viram uma só", () => {
    const v1 = {id: "v1", pontos: [{x: 200, y: 0}, {x: 200, y: 300}]}, v2 = {id: "v2", pontos: [{x: 205, y: 0}, {x: 205, y: 300}]};
    expect(pontes([v1, v2, deitada], 4, 8).get("h")!.get(0)).toEqual([{de: 196, ate: 209}]);
  });
  test("o traçado desenha o salto como arco, por cima no deitado", () => {
    const d = tracado(deitada.pontos, 8, new Map([[0, [{de: 196, ate: 204}]]]), 4);
    expect(d).toBe("M0,100 L196,100 A4,4 0 0 1 204,100 L400,100");
    const deVolta = tracado([...deitada.pontos].reverse(), 8, new Map([[0, [{de: 196, ate: 204}]]]), 4);
    expect(deVolta).toBe("M400,100 L204,100 A4,4 0 0 0 196,100 L0,100");
  });
  test("o canto é arredondado, e nunca maior que meio trecho", () => {
    expect(tracado([{x: 0, y: 0}, {x: 0, y: 100}, {x: 100, y: 100}], 8)).toBe("M0,0 L0,92 Q0,100 8,100 L100,100");
    expect(tracado([{x: 0, y: 0}, {x: 0, y: 6}, {x: 100, y: 6}], 8)).toBe("M0,0 L0,3 Q0,6 3,6 L100,6");
  });
  test("simplificar tira o ponto do meio de um trecho reto e o repetido", () => {
    expect(simplificar([{x: 90, y: 52}, {x: 90, y: 64}, {x: 90, y: 64}, {x: 90, y: 120}, {x: 200, y: 120}]))
      .toEqual([{x: 90, y: 52}, {x: 90, y: 120}, {x: 200, y: 120}]);
  });
});

describe("MNT-12.1 · a rota ainda vale?", () => {
  test("atravessar o miolo conta; encostar na borda não", () => {
    expect(trechoCruza({x: 90, y: -10}, {x: 90, y: 300}, cx(0, 100))).toBe(true);
    expect(trechoCruza({x: 90, y: 0}, {x: 90, y: 100}, cx(0, 100))).toBe(false);
    expect(rotaCruza([{x: 0, y: 0}, {x: 400, y: 0}, {x: 400, y: 400}], [cx(380, 100)])).toBe(true);
  });
  test("o meio do traçado é o meio do comprimento, e o lado sai do primeiro trecho", () => {
    expect(meioDoTracado([{x: 0, y: 0}, {x: 0, y: 100}, {x: 100, y: 100}])).toEqual({x: 0, y: 100});
    expect(ladoDoTrecho({x: 0, y: 0}, {x: 0, y: 10}, true)).toBe("bottom");
    expect(ladoDoTrecho({x: 0, y: 0}, {x: 0, y: 10}, false)).toBe("top");
    expect(ladoDoTrecho({x: 0, y: 0}, {x: -10, y: 1}, true)).toBe("left");
  });
  test("a ponta flutuante sai na borda, na direção do outro centro", () => {
    expect(bordaNaDirecao(cx(0, 0, 100, 50), {x: 500, y: 25})).toEqual({x: 100, y: 25});
    expect(bordaNaDirecao(cx(0, 0, 100, 50), {x: 50, y: -400})).toEqual({x: 50, y: 0});
  });
});

describe("MNT-12.5 · o rótulo que encosta some", () => {
  test("fica o de prioridade maior; no empate, o primeiro; nunca sobre um nó", () => {
    const r = [
      {id: "a", caixa: cx(0, 0, 50, 10), prioridade: 0},
      {id: "b", caixa: cx(40, 0, 50, 10), prioridade: 5},
      {id: "c", caixa: cx(100, 0, 50, 10), prioridade: 0},
      {id: "d", caixa: cx(120, 0, 50, 10), prioridade: 0},
      {id: "e", caixa: cx(300, 0, 50, 10), prioridade: 9},
    ];
    expect(rotulosQueSomem(r, [cx(290, -5, 20, 20)])).toEqual(new Set(["a", "d", "e"]));
  });
});

describe("MNT-16.5 · a nuvem", () => {
  test("um contorno fechado de arcos, e cada ponto dentro da caixa do nó", () => {
    const d = contornoDeNuvem(180, 52);
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    const arcos = d.match(/A/g)!.length;
    expect(arcos).toBeGreaterThanOrEqual(8);
    const nums = [...d.matchAll(/ (-?[\d.]+),(-?[\d.]+)(?= A| Z|$)/g)].map(m => [Number(m[1]), Number(m[2])]);
    for (const [x, y] of nums) {
      expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(180);
      expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(52);
    }
  });
});
