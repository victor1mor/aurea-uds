// BottomNav mais baixo (30/09/2026, pedido do Victor, aprovado pela imagem). A barra era alta por
// causa da folga entre o ícone e o rótulo: o ícone de 24 dentro de uma moldura de 32, mais o vão
// de 4 — 9 medidos entre um e outro. Fora dos indicadores redondos a moldura fica da altura do
// ícone e o vão do item é `space05`; nos redondos a moldura de 32 fica, porque ela vira o
// círculo. A entrada exercita os dois lados. O mesmo conserto está na web (`aurea.css`).
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, BottomNav, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({home: Glifo as never, wallet: Glifo as never});
const ITENS = [{id: "a", label: "Início", icon: "home"}, {id: "b", label: "Gastos", icon: "wallet", badge: 3}] as never;
const estilos = () => __instancias("View").map((p) => StyleSheet.flatten(p.style) ?? {});
// A moldura é a única caixa de largura 32 da barra.
const molduras = () => estilos().filter((e) => e.width === 32);
const abas = () => __instancias("Pressable").map((p) => StyleSheet.flatten(
  typeof p.style === "function" ? p.style({pressed: false}) : p.style) ?? {});

describe("BottomNav · a barra mais baixa", () => {
  it.each(["none", "subtle", "pill"] as const)("%s: a moldura tem a altura do ícone", (indicator) => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator={indicator} /></AureaProvider>);
    const m = molduras();
    expect(m).toHaveLength(2);
    for (const x of m) expect(x.height).toBe(t.size.iconLg);
  });
  it.each(["circle", "circle-raised", "circle-outline", "circle-bold"] as const)("%s: a moldura continua 32, é ela que vira o círculo", (indicator) => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator={indicator} /></AureaProvider>);
    for (const x of molduras()) expect(x.height).toBe(32);
  });
  it("o vão entre o ícone e o rótulo é space05", () => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" /></AureaProvider>);
    for (const a of abas()) expect(a.gap).toBe(t.size.space05);
  });
  it("a área de toque não encolhe: a aba continua com controlHLg de altura mínima", () => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" /></AureaProvider>);
    for (const a of abas()) expect(a.minHeight).toBe(t.size.controlHLg);
  });
});
