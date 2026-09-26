// E11 (0.12.1) · o `Grid` do nativo não repartia a sobra entre as colunas. Com
// `minColumnWidth={150}` numa linha de 372 (tela de 412), ficavam duas colunas de 150 e 56 vazios
// — medido no Yoga. A web usa `repeat(auto-fill, minmax(min, 1fr))`, que reparte. Agora a grade
// mede a própria largura e faz a mesma conta. O dublê não calcula layout; o que se prova é o
// pedido ao motor. A prova de aparelho é o bloco E11 do `apps/native-smoke`.
import {act, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Card, Grid, Text, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const VAO = t.size.space4;
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const grade = () => __instancias("View").find((p) => p.testID === "g")!;
const celulas = () => __instancias("View")
  .filter((p) => p.testID !== "g" && StyleSheet.flatten(p.style)?.flexBasis !== undefined)
  .map((p) => StyleSheet.flatten(p.style));
const medir = (largura: number) => act(() => {
  (grade().onLayout as (e: unknown) => void)({nativeEvent: {layout: {x: 0, y: 0, width: largura, height: 200}}});
});
const QUATRO = ["Abastecimento", "Manutenção", "Seguro", "Multas"];

describe("E11 · o Grid reparte a sobra entre as colunas", () => {
  it("mínimo 150 numa linha de 372: duas colunas iguais que fecham a linha", () => {
    render(<Envolve><Grid testID="g" minColumnWidth={150}>{QUATRO.map((n) => <Card key={n}><Text>{n}</Text></Card>)}</Grid></Envolve>);
    medir(372);
    const c = celulas().slice(-4);
    const coluna = (372 - VAO) / 2;                       // 178
    for (const x of c) {
      expect(x.maxWidth).toBe(coluna);
      expect(x.flexGrow).toBe(1);
      expect(x.flexBasis).toBeLessThanOrEqual(coluna);
      expect(x.flexBasis).toBeGreaterThan(coluna - 1);
    }
    // Duas colunas no teto mais o vão fecham a linha inteira.
    expect(2 * coluna + VAO).toBe(372);
  });
  it("o mínimo continua decidindo quantas cabem: numa linha de 600, três de 150", () => {
    render(<Envolve><Grid testID="g" minColumnWidth={150}>{QUATRO.map((n) => <Card key={n}><Text>{n}</Text></Card>)}</Grid></Envolve>);
    medir(600);
    expect(celulas().at(-1)!.maxWidth).toBe((600 - 2 * VAO) / 3);
  });
  it("linha menor que o mínimo: uma coluna do tamanho da linha, como o min(…, 100%) da web", () => {
    render(<Envolve><Grid testID="g" minColumnWidth={240}><Card><Text>a</Text></Card></Grid></Envolve>);
    medir(200);
    expect(celulas().at(-1)!.maxWidth).toBe(200);
  });
  it("o recuo do style sai da conta", () => {
    render(<Envolve><Grid testID="g" minColumnWidth={150} style={{paddingHorizontal: t.size.space4}}>
      {QUATRO.map((n) => <Card key={n}><Text>{n}</Text></Card>)}</Grid></Envolve>);
    medir(404);
    expect(celulas().at(-1)!.maxWidth).toBe((404 - 2 * t.size.space4 - VAO) / 2);
  });
  it("o onLayout do app continua sendo chamado", () => {
    const vistos: number[] = [];
    render(<Envolve><Grid testID="g" minColumnWidth={150} onLayout={(e) => vistos.push(e.nativeEvent.layout.width)}>
      <Card><Text>a</Text></Card></Grid></Envolve>);
    medir(372);
    expect(vistos).toEqual([372]);
  });
  it("o filho continua esticando na altura (C14)", () => {
    render(<Envolve><Grid testID="g" minColumnWidth={150}><Card testID="k"><Text>a</Text></Card></Grid></Envolve>);
    medir(372);
    const k = __instancias("View").filter((p) => p.testID === "k").at(-1)!;
    expect(StyleSheet.flatten(k.style).flexGrow).toBe(1);
  });
});
