// MNT-28 (17/10/2026) · no modo de arrumar, o nó movido volta a ficar alinhado — a geometria, sem navegador:
//   1. com a grade ligada, o arranjo automático JÁ na grade (`naGrade`), e a rota em ângulo reto acompanha o nó
//      (`rotaNaGrade`): a ponta anda com ele, e o trecho da ponta continua reto;
//   2. as guias do arraste (`guiasDoArraste`): o nó encaixa na borda ou no centro do vizinho mais perto, até a
//      tolerância, e aparece UMA guia por eixo, de ponta a ponta de quem alinhou.
// O caso do Victor: o arranjo simples põe os nós em 0, 270, 540 (fora da grade de 16), e o nó arrastado só voltava a
// 528 ou 544. Provado contra o defeito: na 0.34.0 nenhuma dessas funções existe.
import {describe, expect, test} from "vitest";
import {naGrade, rotaNaGrade, guiasDoArraste, type Caixa, type PontaDoArraste} from "../../packages/react/src/graph-geometria";

describe("MNT-28 · o arranjo na grade", () => {
  test("cada coordenada vai ao ponto da grade mais perto: 270 → 272, 540 → 544, 0 fica", () => {
    expect([0, 270, 540, 76, 8, 7].map((v) => naGrade(v, 16))).toEqual([0, 272, 544, 80, 16, 0]);
  });

  test("a rota de três trechos acompanha as duas pontas e continua em ângulo reto", () => {
    const rota = [{x: 180, y: 26}, {x: 225, y: 26}, {x: 225, y: 100}, {x: 270, y: 100}];
    const r = rotaNaGrade(rota, {x: 0, y: 6}, {x: 2, y: -4});
    expect(r).toEqual([{x: 180, y: 32}, {x: 225, y: 32}, {x: 225, y: 96}, {x: 272, y: 96}]);
    for (let i = 1; i < r.length; i++) {
      expect(r[i].x === r[i - 1].x || r[i].y === r[i - 1].y, `o trecho ${i} é reto`).toBe(true);
    }
  });

  test("a rota de pé (de cima para baixo) corrige o eixo x das dobras da ponta", () => {
    const rota = [{x: 90, y: 52}, {x: 90, y: 90}, {x: 300, y: 90}, {x: 300, y: 128}];
    expect(rotaNaGrade(rota, {x: 6, y: 0}, {x: -4, y: 0}))
      .toEqual([{x: 96, y: 52}, {x: 96, y: 90}, {x: 296, y: 90}, {x: 296, y: 128}]);
  });

  test("a reta que sai do eixo vira um degrau no meio — nunca uma diagonal", () => {
    const r = rotaNaGrade([{x: 180, y: 26}, {x: 270, y: 26}], {x: 0, y: 6}, {x: 2, y: 0});
    expect(r).toEqual([{x: 180, y: 32}, {x: 226, y: 32}, {x: 226, y: 26}, {x: 272, y: 26}]);
  });

  test("a reta que continua no eixo continua reta", () => {
    expect(rotaNaGrade([{x: 180, y: 26}, {x: 270, y: 26}], {x: 0, y: 6}, {x: 2, y: 6}))
      .toEqual([{x: 180, y: 32}, {x: 272, y: 32}]);
  });
});

describe("MNT-28 · as guias do arraste", () => {
  const no = (x: number, y: number): Caixa => ({x, y, larg: 180, alt: 52});

  test("perto o bastante, o nó encaixa no vizinho, e aparece UMA guia por eixo (a do centro)", () => {
    const r = guiasDoArraste(no(300, 105), [no(0, 100)], 8);
    expect([r.x, r.y]).toEqual([300, 100]);
    expect(r.guias).toEqual([{eixo: "y", em: 126, de: 0, ate: 480}]);
  });

  test("longe demais, nada encaixa e não há guia", () => {
    const r = guiasDoArraste(no(300, 120), [no(0, 100)], 8);
    expect([r.x, r.y, r.guias.length]).toEqual([300, 120, 0]);
  });

  test("cada eixo encaixa no vizinho mais perto, e os dois eixos podem encaixar juntos", () => {
    const r = guiasDoArraste(no(273, 205), [no(0, 200), no(270, 0), no(266, 400)], 8);
    // x: 270 está a 3, 266 a 7 — vence o 270. y: 200 está a 5.
    expect([r.x, r.y]).toEqual([270, 200]);
    expect(r.guias.find((g) => g.eixo === "x")).toEqual({eixo: "x", em: 360, de: 0, ate: 252});
    expect(r.guias.find((g) => g.eixo === "y")).toEqual({eixo: "y", em: 226, de: 0, ate: 450});
  });

  test("tamanhos diferentes: sem o centro alinhado, a guia é a da borda que encaixou", () => {
    const largo: Caixa = {x: 0, y: 0, larg: 400, alt: 52};
    const r = guiasDoArraste({x: 4, y: 200, larg: 180, alt: 52}, [largo], 8);
    expect(r.x).toBe(0);
    expect(r.guias).toEqual([{eixo: "x", em: 0, de: 0, ate: 252}]);
  });
});

// O caso do Victor (17/10/2026): "todos consigo alinhar de forma manual, menos esse — nunca fica reto". A linha sai da porta
// 1, a um terço do lado de baixo do Núcleo, e chega no meio do topo do Acesso: nem a borda nem o centro do Acesso caem
// embaixo dela. A ponta da linha também é alvo do encaixe.
describe("MNT-28 · a linha reta", () => {
  const no = (x: number, y: number): Caixa => ({x, y, larg: 180, alt: 52});
  // O Acesso (arrastado) recebe no meio do topo (90, 0); a porta 1 do Núcleo está em x = 60 + 180/3 = 120, na base (y 52).
  const ponta: PontaDoArraste = {meu: {x: 90, y: 0}, outro: {x: 120, y: 52}, eixo: "x"};

  test("perto, o nó encaixa onde a linha fica reta, e a guia corre por cima da linha, de ponta a ponta", () => {
    const r = guiasDoArraste(no(35, 300), [no(60, 0)], 8, [ponta]);
    expect(r.x).toBe(30);
    expect(r.guias).toEqual([{eixo: "x", em: 120, de: 52, ate: 300}]);
  });

  test("no empate com o alinhamento de uma caixa, ganha a linha reta", () => {
    // O nó em 34: a linha reta pede x = 30 (a 4) e a borda esquerda do vizinho pede x = 38 (também a 4) — empate.
    const vizinho: Caixa = {x: 38, y: 500, larg: 100, alt: 40};
    const r = guiasDoArraste(no(34, 300), [vizinho], 8, [ponta]);
    expect(r.x).toBe(30);
    expect(r.guias[0]).toEqual({eixo: "x", em: 120, de: 52, ate: 300});
  });

  test("a linha de lado a lado endireita no eixo y", () => {
    const lado: PontaDoArraste = {meu: {x: 0, y: 26}, outro: {x: 240, y: 140}, eixo: "y"};
    const r = guiasDoArraste({x: 300, y: 110, larg: 180, alt: 52}, [], 8, [lado]);
    expect(r.y).toBe(114);
    expect(r.guias).toEqual([{eixo: "y", em: 140, de: 240, ate: 300}]);
  });

  test("longe da linha reta, nada muda por causa dela", () => {
    const r = guiasDoArraste(no(60, 300), [], 8, [ponta]);
    expect([r.x, r.guias.length]).toEqual([60, 0]);
  });
});

