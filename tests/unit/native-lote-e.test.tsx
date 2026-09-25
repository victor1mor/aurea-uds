// Lote E — os achados do app de 25/09/2026, no nativo. Cada teste escolhe a entrada que reprova
// no código de antes.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, BottomSheet, Button, Checkbox, Combobox, Radio, Select, SegmentedControl, Tabs, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const estiloDo = (primitivo: string, filtro: (p: Record<string, unknown>) => boolean = () => true) =>
  StyleSheet.flatten((__instancias(primitivo).filter(filtro).at(-1) ?? {}).style);

// E1 · a perna das letras. O IBM Plex sobe 1,025 em e desce 0,275 em: precisa de 1,3 em de linha
// para caber inteiro, e no Android o React Native corta o que passa. Com entrelinha 1,0 o "g" do
// "Lançar um gasto" perdia a perna.
describe("E1 · Button: a entrelinha do rótulo cabe a letra inteira", () => {
  it.each(["xs", "sm", "md", "lg", "xl"] as const)("%s: linha ≥ 1,3 × a letra, e cabe no botão", (size) => {
    render(<Envolve><Button size={size}>Lançar um gasto</Button></Envolve>);
    const txt = estiloDo("Text");
    expect(txt.lineHeight).toBeGreaterThanOrEqual(txt.fontSize * 1.3);
    const alturas = {xs: "controlHXs", sm: "controlHSm", md: "controlHMd", lg: "controlHLg", xl: "controlHXl"} as const;
    expect(txt.lineHeight).toBeLessThanOrEqual(t.size[alturas[size]]);
  });
});

// E3 · a fila do SegmentedControl e das Tabs não centralizava: o rolador ocupa a largura toda, e o
// conteúdo ficava colado à esquerda lá dentro (medido pelo app: 335 de rolador, 281 de fileira).
// O dublê não calcula layout; o que se prova aqui é o pedido ao motor — o recipiente do conteúdo
// cresce até a largura do rolador e posiciona a cápsula. A prova de aparelho é o bloco E3 do
// `apps/native-smoke`.
const ITENS = [{value: "s", label: "Semana"}, {value: "m", label: "Mês"}, {value: "a", label: "Ano"}];
const rolador = () => StyleSheet.flatten(__instancias("ScrollView").at(-1)?.contentContainerStyle);
describe("E3 · SegmentedControl e Tabs: justify quando cabem", () => {
  it("padrão: como sempre, o conteúdo não cresce (start)", () => {
    render(<Envolve><SegmentedControl items={ITENS} value="s" /></Envolve>);
    expect(rolador()).toEqual({flexGrow: 0});
  });
  it.each([["center", "center"], ["end", "flex-end"]] as const)("SegmentedControl justify=%s", (justify, css) => {
    render(<Envolve><SegmentedControl items={ITENS} value="s" justify={justify} /></Envolve>);
    expect(rolador()).toEqual({flexGrow: 1, justifyContent: css});
  });
  it("Tabs aceita o mesmo justify — a causa era a mesma fila", () => {
    render(<Envolve><Tabs tabs={[{id: "a", label: "A", content: null}]} value="a" justify="center" /></Envolve>);
    expect(rolador()).toEqual({flexGrow: 1, justifyContent: "center"});
  });
});

// E5 · a marca do Radio (e do Checkbox, que é a mesma peça) ficava presa no topo do rótulo:
// `alignItems: "flex-start"` e um `marginTop: 1` fixo. O padrão agora é o do HeroUI Native —
// centralizado —, e `align="start"` põe a marca no meio da PRIMEIRA linha, pela conta dos tokens.
const linhaDoControle = () => StyleSheet.flatten(__instancias("Pressable").at(-1)?.style);
const marca = () => StyleSheet.flatten(__instancias("View").find((v) => {
  const e = StyleSheet.flatten(v.style);
  return e && e.borderWidth === t.size.borderWidth && e.width === e.height && e.width > 0;
})?.style);
describe("E5 · Radio e Checkbox: a marca na altura do texto", () => {
  it.each([["Radio", Radio], ["Checkbox", Checkbox]] as const)("%s: centralizado por padrão, sem o marginTop fixo", (_n, C) => {
    render(<Envolve><C label="Me lembre às 9h" checked={false} /></Envolve>);
    expect(linhaDoControle().alignItems).toBe("center");
    expect(marca().marginTop ?? 0).toBe(0);
  });
  it("align=\"start\": a marca no meio da primeira linha", () => {
    render(<Envolve><Radio label="Rótulo longo" description="que quebra em várias linhas" align="start" checked /></Envolve>);
    expect(linhaDoControle().alignItems).toBe("flex-start");
    const linha = t.size.textBase * t.size.leadingNormal;
    const lado = t.size.controlHMd / 2;
    expect(marca().marginTop).toBe(Math.max(0, (linha - lado) / 2));
  });
});

// E4 · a lista do Select e a do Combobox não rolavam no Android, e a folha descia atrás dos botões
// do sistema. Suspeita do app, NÃO confirmada no aparelho: um `View` em volta da lista reivindicava
// o toque, e no Android o dono do toque intercepta os movimentos seguintes. O aceite de verdade é o
// bloco E4 do `apps/native-smoke` (50 itens, rolar até o último). Aqui se cobra o que o código
// promete: ninguém em volta da lista reivindica o toque, e as três folhas de baixo recuam a borda
// de baixo com o `SafeAreaView` (a mesma peça do `Screen`).
const CINQUENTA = Array.from({length: 50}, (_, i) => ({value: `v${i}`, label: `Item ${i + 1}`}));
const reivindicam = () => [...__instancias("View"), ...__instancias("Animated.View")]
  .filter((p) => typeof p.onStartShouldSetResponder === "function");
const recuoDeBaixo = () => __instancias("SafeAreaView").filter((p) =>
  Array.isArray(p.edges) && p.edges.length === 1 && p.edges[0] === "bottom");
describe("E4 · as folhas de baixo: a lista rola e não fica atrás dos botões do sistema", () => {
  it("Select: nada em volta da lista reivindica o toque, e a folha recua a borda de baixo", () => {
    render(<Envolve><Select items={CINQUENTA} value="v0" label="Ano" /></Envolve>);
    expect(reivindicam()).toHaveLength(0);
    expect(recuoDeBaixo()).toHaveLength(1);
  });
  it("Combobox: o mesmo", () => {
    render(<Envolve><Combobox items={CINQUENTA} /></Envolve>);
    expect(reivindicam()).toHaveLength(0);
    expect(recuoDeBaixo()).toHaveLength(1);
  });
  it("BottomSheet: recua a borda de baixo também", () => {
    render(<Envolve><BottomSheet open onClose={() => {}} title="Filtros">x</BottomSheet></Envolve>);
    expect(recuoDeBaixo()).toHaveLength(1);
  });
});

// E6 · o campo de busca do Combobox não tinha como pedir o teclado de números: para digitar um ano
// abria o de letras. Agora `searchKeyboardType` chega ao `TextInput` da folha.
describe("E6 · Combobox: o teclado do campo de busca", () => {
  const busca = () => __instancias("TextInput").find((p) => p.testID === "cb-busca");
  it("searchKeyboardType chega ao campo da folha", () => {
    render(<Envolve><Combobox items={CINQUENTA} testID="cb" searchKeyboardType="number-pad" /></Envolve>);
    expect(busca()?.keyboardType).toBe("number-pad");
  });
  it("sem ele, o teclado de texto de sempre", () => {
    render(<Envolve><Combobox items={CINQUENTA} testID="cb" /></Envolve>);
    expect(busca()?.keyboardType).toBeUndefined();
  });
});
