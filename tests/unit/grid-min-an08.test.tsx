// AN-08 · a largura mínima da coluna do `Grid`, por nome — 03/10/2026. A trava de um consumidor
// reprova medida escrita, e ele escreveu `min="sm"`: passou pelo tipo, e a grade virou UMA coluna,
// sem aviso — o `--grid-min: sm` é inválido e derruba o `grid-template-columns` inteiro.
//
// Os quatro nomes são números que a Aurea já usa: xs 8rem (a `.gallery`), sm 12rem (a
// `.health-matrix`), md 15rem (o padrão) e lg 20rem (o `.dialog-xs`). Cada teste reprova o código
// de antes; a medida no navegador está em `tests/visual/grid-min.spec.ts`.
import {act, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {Grid} from "../../packages/react/src/index";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Card, Grid as GridNativo, Text, resolverTokens} from "../../packages/native/src/index.js";

describe("Grid (web) · min por nome", () => {
  it.each(["xs", "sm", "lg"] as const)("%s vira a classe do degrau, e não um --grid-min inválido", (min) => {
    const {container} = render(<Grid min={min} />);
    const g = container.firstElementChild as HTMLElement;
    expect(g).toHaveClass("grid", `grid-min-${min}`);
    expect(g.style.getPropertyValue("--grid-min")).toBe("");
  });
  it("md é o padrão: nenhuma classe e nenhuma variável", () => {
    const {container} = render(<Grid min="md" />);
    const g = container.firstElementChild as HTMLElement;
    expect(g.className).toBe("grid");
    expect(g.getAttribute("style")).toBeNull();
  });
  it("medida escrita continua valendo como antes", () => {
    const {container} = render(<Grid min="10rem" />);
    const g = container.firstElementChild as HTMLElement;
    expect(g.style.getPropertyValue("--grid-min")).toBe("10rem");
    expect(g.className).toBe("grid");
  });
});

const t = resolverTokens("dark", "comfortable");
const celula = () => __instancias("View")
  .filter((p) => p.testID !== "g" && StyleSheet.flatten(p.style)?.flexBasis !== undefined)
  .map((p) => StyleSheet.flatten(p.style)).at(-1)!;

describe("Grid (nativo) · minColumnWidth por nome, os mesmos quatro da web", () => {
  it.each([["xs", 128], ["sm", 192], ["md", 240], ["lg", 320]] as const)("%s = %i dp", (nome, dp) => {
    render(<AureaProvider><GridNativo testID="g" minColumnWidth={nome}><Card><Text>a</Text></Card></GridNativo></AureaProvider>);
    expect(celula().minWidth).toBe(dp);
    expect(t.remInDp * {xs: 8, sm: 12, md: 15, lg: 20}[nome]).toBe(dp);
  });
  it("e o nome decide quantas colunas cabem: sm numa linha de 412 dá duas", () => {
    render(<AureaProvider><GridNativo testID="g" minColumnWidth="sm">{["a", "b", "c"].map((n) => <Card key={n}><Text>{n}</Text></Card>)}</GridNativo></AureaProvider>);
    const g = __instancias("View").find((p) => p.testID === "g")!;
    act(() => { (g.onLayout as (e: unknown) => void)({nativeEvent: {layout: {x: 0, y: 0, width: 412, height: 200}}}); });
    expect(celula().maxWidth).toBe((412 - t.size.space4) / 2);
  });
});
