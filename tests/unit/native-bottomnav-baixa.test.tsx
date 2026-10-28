// BottomNav mais baixo (30/09/2026, pedido do Victor, aprovado pela imagem). A barra era alta por
// causa da folga entre o ícone e o rótulo: o ícone de 24 dentro de uma moldura de 32, mais o vão
// de 4 — 9 medidos entre um e outro. Fora dos indicadores redondos a moldura fica da altura do
// ícone e o vão do item é `space05` (zero desde 03/10/2026); nos redondos a moldura de 32 fica, porque ela vira o
// círculo. A entrada exercita os dois lados. O mesmo conserto está na web (`aurea.css`).
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, BottomNav, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"house": Glifo as never, wallet: Glifo as never});
const ITENS = [{id: "a", label: "Início", icon: "house"}, {id: "b", label: "Gastos", icon: "wallet", badge: 3}] as never;
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
  // ~~a moldura continua 32~~ → 28, passando 2 por fora da caixa (27/10/2026, a barra na mesma altura em todos os
  // formatos — ADR-0084: *"B: o círculo e a cápsula com 28"*). O item fica com a altura do ícone, como nos outros.
  it.each(["circle", "circle-raised", "circle-outline"] as const)("%s: o círculo tem 28 e passa 2 por fora da caixa", (indicator) => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator={indicator} /></AureaProvider>);
    const circulos = estilos().filter((e) => e.width === t.size.iconLg + t.size.space1 && e.height === t.size.iconLg + t.size.space1);
    expect(circulos).toHaveLength(2);
    for (const c of circulos) expect(c.marginVertical).toBe(-t.size.space05);
    expect(molduras(), "nenhuma moldura de 32 sobra nos redondos").toHaveLength(0);
  });
  it("capsule: 56 × 28, passando 2 por fora da caixa; e o disco do circle-bold sem a altura mínima", () => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator="capsule" /></AureaProvider>);
    const capsulas = estilos().filter((e) => e.width === 56 && e.height === t.size.iconLg + t.size.space1);
    expect(capsulas).toHaveLength(2);
    for (const c of capsulas) expect(c.marginVertical).toBe(-t.size.space05);
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator="circle-bold" /></AureaProvider>);
    const discos = estilos().filter((e) => e.width === 56 && e.paddingVertical !== undefined);
    expect(discos.length).toBeGreaterThan(0);
    for (const d of discos) { expect(d.minHeight).toBeUndefined(); expect(d.paddingVertical).toBe(t.size.space05); }
  });
  // ~~O `circle-bold` estava na lista acima~~ — desde 03/10/2026 o círculo dele é o DISCO em volta
  // do ícone e do nome, e a moldura fica da altura do ícone, para o nome encostar nele.
  it("circle-bold: a moldura tem a altura do ícone (quem é o círculo é o disco)", () => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator="circle-bold" /></AureaProvider>);
    const m = molduras();
    expect(m).toHaveLength(2);
    for (const x of m) expect(x.height).toBe(t.size.iconLg);
  });
  // ~~`space05`~~ (30/09/2026) → ZERO em 03/10/2026, pedido do Victor: *"o texto pode ficar mais
  // próximo do ícone"*. Como no aplicativo de mensagens de referência, o nome começa onde a caixa do ícone acaba.
  it("o vão entre o ícone e o rótulo é zero", () => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" /></AureaProvider>);
    for (const a of abas()) expect(a.gap).toBe(0);
  });
  it("a área de toque não encolhe: a aba continua com controlHLg de altura mínima", () => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" /></AureaProvider>);
    for (const a of abas()) expect(a.minHeight).toBe(t.size.controlHLg);
  });
});
