// AS CORES, PASSO B no nativo (ADR-0084, 27/10/2026): as peles saem dos tokens com os valores da proposta do Victor (a
// tabela em hex do item 5.4), o aro é sombra por dentro (a peça não muda de medida), o degradê leva o amarelo cheio por
// baixo, e as três peças pintam o lugar certo. O mesmo atributo da web aparece no navegador (`dataSet`).
// Provado contra o defeito (27/10/2026): com o nativo da 0.45.0, reprovam todos (as funções e as props não existem).
import {render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, BottomNav, SegmentedControl, Timeline, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";
import {aroDoEstilo, fundoDaPele, marcaDoEstilo, peleDoAtual, peleDoPonto, peleDoSegmento} from "../../packages/native/src/estilos.js";

const claro = resolverTokens("light", "comfortable");
const escuro = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({house: Glifo, bell: Glifo, user: Glifo});
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider theme="light" icons={ICONES}>{children}</AureaProvider>;
const plano = (p: Record<string, unknown> | undefined) => StyleSheet.flatten(p?.style as never) as Record<string, unknown>;

describe("as peles, com os valores da proposta (item 5.4)", () => {
  it("o segmento: A, B e C nos dois temas; D e E são o A com o amarelo; `current` é o de sempre", () => {
    expect(peleDoSegmento(claro, "neutral")).toMatchObject({fundo: "#ffffff", letra: "#09090b", sombra: true});
    expect(peleDoSegmento(escuro, "neutral")).toMatchObject({fundo: "#3f3f46", letra: "#fafafa"});
    expect(peleDoSegmento(claro, "contrast")).toMatchObject({fundo: "#09090b", letra: "#f5f5f5"});
    expect(peleDoSegmento(escuro, "contrast")).toMatchObject({fundo: "#fafafa", letra: "#09090b"});
    expect(peleDoSegmento(claro, "brand")).toMatchObject({fundo: "#f0b100", letra: "#18181b"});
    expect(peleDoSegmento(claro, "ring")).toMatchObject({fundo: "#ffffff", aro: "#f0b100"});
    expect(peleDoSegmento(claro, "dot")).toMatchObject({fundo: "#ffffff", ponto: true});
    expect(peleDoSegmento(claro, "current")).toBeNull();
    expect(peleDoSegmento(claro, undefined)).toBeNull();
  });
  it("a barra de baixo: A a E, F a H e a barra amarela (I a L, com o L em #f9dda9)", () => {
    expect(peleDoAtual(claro, "neutral")).toMatchObject({fundo: "#ebebed", letra: "#09090b"});
    expect(peleDoAtual(escuro, "neutral")).toMatchObject({fundo: "#27272a", letra: "#fafafa"});
    expect(peleDoAtual(claro, "contrast")).toMatchObject({fundo: "#09090b", letra: "#f5f5f5"});
    expect(peleDoAtual(claro, "brand")).toMatchObject({fundo: "#f0b100", letra: "#18181b"});
    expect(peleDoAtual(claro, "ring")).toMatchObject({fundo: "transparent", aro: "#f0b100", letra: "#09090b"});
    expect(peleDoAtual(claro, "plain")).toMatchObject({fundo: "transparent", negrito: true});
    expect(peleDoAtual(claro, "brand-white")).toMatchObject({fundo: "#f0b100", letra: "#ffffff"});
    expect(peleDoAtual(claro, "white-ring")).toMatchObject({fundo: "#ffffff", letra: "#18181b", aro: "#f0b100"});
    expect(peleDoAtual(claro, "brand-gradient")?.degrade).toMatch(/^#[0-9a-f]{6}$/);
    expect(peleDoAtual(claro, "bar-ink")).toMatchObject({fundo: "#18181b", letra: "#f0b100", barra: true});
    expect(peleDoAtual(claro, "bar-ring")).toMatchObject({fundo: "transparent", aro: "#18181b", barra: true});
    expect(peleDoAtual(claro, "bar-plain")).toMatchObject({negrito: true, barra: true});
    expect(peleDoAtual(claro, "bar-light")?.fundo).toBe("#f9dda9");
    expect(peleDoAtual(claro, "current")).toBeNull();
  });
  it("a linha do tempo: o aro, o halo só no último do `latest`, e a cor do `contrast`", () => {
    expect(peleDoPonto(claro, "ring", false)).toMatchObject({fundo: "transparent", aro: "#f0b100"});
    expect(peleDoPonto(claro, "latest", false)).toMatchObject({fundo: claro.color.mutedForeground, halo: null});
    expect(peleDoPonto(claro, "latest", true)?.halo).toMatch(/^#f0b100/);
    expect(peleDoPonto(escuro, "contrast", false)?.fundo).toBe("#fafafa");
    expect(peleDoPonto(claro, "default", false)).toBeNull();
  });
  it("o aro é sombra POR DENTRO (a peça não muda de medida), e o degradê leva o amarelo cheio por baixo", () => {
    expect(aroDoEstilo(claro, "#f0b100")).toEqual({offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: 1.5 * claro.size.borderWidth, color: "#f0b100", inset: true});
    const g = fundoDaPele(peleDoAtual(claro, "brand-gradient")!) as Record<string, unknown>;
    expect(g.backgroundColor).toBe("#f0b100");
    expect(g.backgroundImage).toMatch(/^linear-gradient\(135deg, #f0b100 20%, #[0-9a-f]{6}\)$/);
    expect(g.experimental_backgroundImage).toBe(g.backgroundImage);
    expect(fundoDaPele({fundo: "#ffffff"})).toEqual({backgroundColor: "#ffffff"});
  });
  it("a marca do estilo no navegador: o mesmo atributo da web, e nada sem estilo", () => {
    expect(marcaDoEstilo("currentStyle", "ring")).toEqual({dataSet: {currentStyle: "ring"}});
    expect(marcaDoEstilo("currentStyle", undefined)).toEqual({});
  });
});

describe("as peças pintam o lugar certo", () => {
  const itens = [{id: "a", label: "Home", icon: "house" as const}, {id: "b", label: "Alerts", icon: "bell" as const}];

  it("a barra amarela: a barra no amarelo, e no `capsule` a moldura do atual na tinta", () => {
    render(<Envolve><BottomNav current="a" currentStyle="bar-ink" items={itens} /></Envolve>);
    const fundos = __instancias("View").map(plano).map((s) => s.backgroundColor);
    expect(fundos).toContain(claro.color.primary);
    expect(fundos).toContain(claro.color.primaryForeground);
    expect(__instancias("View").some((p) => (p.dataSet as {currentStyle?: string} | undefined)?.currentStyle === "bar-ink")).toBe(true);
  });
  it("o aro (`ring`) no `pill` pinta o item com a sombra por dentro, sem borda", () => {
    render(<Envolve><BottomNav current="a" indicator="pill" currentStyle="ring" items={itens} /></Envolve>);
    const item = __instancias("Pressable").map(plano).find((s) => Array.isArray(s.boxShadow)
      && (s.boxShadow as Array<{inset?: boolean}>).some((c) => c.inset));
    expect(item, "o item atual com o aro").toBeDefined();
    expect(item!.borderColor ?? "transparent").toBe("transparent");
  });
  it("o segmento `contrast`: o aceso no grafite; sem estilo, a cápsula amarela de sempre", () => {
    const items = [{value: "x", label: "X"}, {value: "y", label: "Y"}];
    render(<Envolve><SegmentedControl label="A" value="x" items={items} selectedStyle="contrast" /></Envolve>);
    expect(__instancias("Pressable").map(plano).map((s) => s.backgroundColor)).toContain(claro.color.foreground);
    render(<Envolve><SegmentedControl label="B" value="x" items={items} /></Envolve>);
    expect(__instancias("Pressable").map(plano).map((s) => s.backgroundColor)).toContain(claro.color.primary);
  });
  it("a linha do tempo `time`: a hora numa coluna à esquerda, e o trilho anda junto", () => {
    render(<Envolve><Timeline variant="time" items={[{title: "A", time: "09:00"}, {title: "B", time: "10:00"}]} /></Envolve>);
    const larguras = __instancias("View").map(plano).map((s) => s.width);
    expect(larguras).toContain(claro.size.space12 + claro.size.space1);
    const trilho = __instancias("View").map(plano).find((s) => s.position === "absolute" && s.width === claro.size.borderWidth);
    expect(trilho?.left).toBe(claro.size.space12 + claro.size.space1 + claro.size.space3 + claro.size.space3 / 2);
  });
});
