// A5 (06/10/2026) · o `SegmentedControl` quebrava o rótulo em duas linhas — medido pelo app no
// navegador em 17/09/2026: três opções num espaço de 343, o grupo com 244, cada segmento com 77, e
// "3.000 km" em duas linhas. O app ainda usa o controle no período de Gastos.
//
// A CAUSA era o `flex: 1` do segmento. O `react-native-web` passa `flex: 1` cru para o CSS, que é
// `1 1 0%`: a largura do texto é repartida em partes IGUAIS, e o rótulo maior não cabe na parte
// dele. No aparelho não quebrava — medido no Yoga oficial (`yoga-layout` 3.2.1, a mesma árvore do
// React Native): com ou sem `flex: 1`, o segmento fica do tamanho do texto —, mas a cápsula
// também não ocupava a linha (245 de 343). Agora:
//   · o segmento é do tamanho do rótulo, como a aba do `Tabs` e o `.segmented button` da web;
//   · `fullWidth` (o nome do HeroUI) ocupa a linha: o rolador, a cápsula e cada segmento crescem,
//     e o segmento cresce a PARTIR do rótulo (base `auto`), nunca abaixo dele.
// Provado contra o defeito: com o `flex: 1` de volta no estilo `segmento`, o primeiro teste reprova.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, SegmentedControl, Tabs, Text} from "../../packages/native/src/index.js";

const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const estilo = (p: Record<string, unknown>) =>
  (StyleSheet.flatten(typeof p.style === "function" ? (p.style as (e: unknown) => unknown)({pressed: false}) : p.style) ?? {}) as Record<string, unknown>;
const PERIODOS = ["Semana", "Mês", "Ano", "Tudo"].map((l) => ({value: l, label: l}));
const segmentos = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "radio").map(estilo);
const capsula = () => estilo(__instancias("View").find((p) => p.accessibilityRole === "radiogroup")!);
const rolador = () => __instancias("ScrollView").at(-1)!;
const conteudo = () => (StyleSheet.flatten(rolador().contentContainerStyle) ?? {}) as Record<string, unknown>;

// `flex` positivo no React Native é base ZERO — e é a base zero que o navegador reparte igual.
const temBaseZero = (e: Record<string, unknown>) =>
  (typeof e.flex === "number" && e.flex > 0) || e.flexBasis === 0 || e.flexBasis === "0%";

describe("A5 · o segmento é do tamanho do rótulo", () => {
  it("nenhum segmento tem base zero, então o navegador não reparte a largura em partes iguais", () => {
    render(<Envolve><SegmentedControl items={PERIODOS} value="Mês" /></Envolve>);
    expect(segmentos()).toHaveLength(4);
    for (const e of segmentos()) expect(temBaseZero(e) ? `base zero: ${JSON.stringify(e)}` : "ok").toBe("ok");
  });

  // Quem mais tem esse problema? A outra peça que mora na `FilaRolante` é o `Tabs`: a aba dele já
  // não tinha `flex`, e este teste trava que continue assim.
  it("a aba do `Tabs`, a outra peça da fila que rola, também não", () => {
    render(<Envolve><Tabs value="a" tabs={[
      {id: "a", label: "Resumo", content: <Text>a</Text>},
      {id: "b", label: "Histórico", content: <Text>b</Text>},
    ]} /></Envolve>);
    const abas = __instancias("Pressable").filter((p) => p.accessibilityRole === "tab").map(estilo);
    expect(abas).toHaveLength(2);
    for (const e of abas) expect(temBaseZero(e)).toBe(false);
  });

  it("sem `fullWidth`, nada cresce: o controle fica do tamanho das opções, no começo da linha", () => {
    render(<Envolve><SegmentedControl items={PERIODOS} value="Mês" /></Envolve>);
    expect(conteudo().flexGrow).toBe(0);
    expect(capsula().flexGrow).toBeUndefined();
    for (const e of segmentos()) expect(e.flexGrow).toBeUndefined();
  });
});

describe("A5 · `fullWidth` ocupa a linha sem quebrar o rótulo", () => {
  it("o rolador, a cápsula e cada segmento crescem", () => {
    render(<Envolve><SegmentedControl items={PERIODOS} value="Mês" fullWidth /></Envolve>);
    expect(conteudo().flexGrow).toBe(1);
    expect(capsula().flexGrow).toBe(1);
    for (const e of segmentos()) expect(e.flexGrow).toBe(1);
  });

  // O segmento cresce a PARTIR do rótulo: base `auto` e sem encolher. Base zero (o `flex-1` do
  // HeroUI, que no CSS tem o mínimo do texto e no Yoga não tem) repartiria igual de novo.
  it("cada segmento cresce a partir do rótulo e nunca encolhe abaixo dele", () => {
    render(<Envolve><SegmentedControl items={PERIODOS} value="Mês" fullWidth /></Envolve>);
    for (const e of segmentos()) {
      expect([e.flexBasis, e.flexShrink, e.flex]).toEqual(["auto", 0, undefined]);
    }
  });

  it("cheio, o `justify` não tem onde agir", () => {
    render(<Envolve><SegmentedControl items={PERIODOS} value="Mês" fullWidth justify="center" /></Envolve>);
    expect(conteudo().justifyContent).toBeUndefined();
    expect(conteudo().flexGrow).toBe(1);
  });

  it("e continua rolando quando não cabe", () => {
    render(<Envolve><SegmentedControl items={PERIODOS} value="Mês" fullWidth /></Envolve>);
    expect(rolador().horizontal).toBe(true);
  });
});
