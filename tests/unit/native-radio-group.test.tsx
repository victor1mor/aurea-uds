// RadioGroup do nativo (01/10/2026) · o grupo de rádio da referência no nativo, com a aparência da
// Aurea. As medidas são as dela, nos tokens que dão o mesmo número: vão 12 (`space3`), marca 24
// (`space6`), ponto 10 (`space2 + space05`). O dublê não calcula layout; prova-se o pedido ao motor
// e o contrato de acessibilidade. A prova de aparelho é o bloco RG do `apps/native-smoke`.
import {act, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, RadioGroup, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const itens = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "radio");
const estilo = (p: Record<string, unknown>) => StyleSheet.flatten(
  typeof p.style === "function" ? (p.style as (e: {pressed: boolean}) => unknown)({pressed: false}) : p.style) ?? {};
const marcas = () => __instancias("View").map((p) => StyleSheet.flatten(p.style) ?? {})
  .filter((e) => e.width === t.size.space6 && e.height === t.size.space6);

function Entrega(props: {inicial?: string; disabled?: boolean; invalid?: boolean; itemDesligado?: boolean;
  onEscolha?: (v: string) => void}) {
  const [v, setV] = React.useState(props.inicial);
  return (
    <RadioGroup label="Forma de entrega" value={v} disabled={props.disabled} invalid={props.invalid}
      onValueChange={(x) => { setV(x); props.onEscolha?.(x); }}>
      <RadioGroup.Item value="normal" label="Normal" description="Em 5 a 7 dias úteis" />
      <RadioGroup.Item value="expressa" label="Expressa" description="Em 2 a 3 dias úteis" disabled={props.itemDesligado} />
      <RadioGroup.Item value="amanha" label="Amanhã" description="No próximo dia útil" />
    </RadioGroup>);
}

describe("RadioGroup · escolha", () => {
  it("o grupo se anuncia como grupo de rádio, com nome", () => {
    render(<Envolve><Entrega inicial="normal" /></Envolve>);
    const g = __instancias("View").find((p) => p.accessibilityRole === "radiogroup")!;
    expect(g.accessibilityLabel).toBe("Forma de entrega");
  });
  it("só o item do valor está marcado, e tocar em outro troca a escolha", () => {
    const vistos: string[] = [];
    render(<Envolve><Entrega inicial="normal" onEscolha={(v) => vistos.push(v)} /></Envolve>);
    expect(itens().slice(-3).map((p) => (p.accessibilityState as {checked: boolean}).checked)).toEqual([true, false, false]);
    act(() => (itens().at(-1)!.onPress as () => void)());
    expect(vistos).toEqual(["amanha"]);
    expect(itens().slice(-3).map((p) => (p.accessibilityState as {checked: boolean}).checked)).toEqual([false, false, true]);
  });
  it("tocar no item já escolhido não chama ninguém", () => {
    render(<Envolve><Entrega inicial="normal" /></Envolve>);
    expect(itens().at(-3)!.onPress).toBeUndefined();
  });
  it("item desligado não escolhe e se anuncia desligado", () => {
    render(<Envolve><Entrega inicial="normal" itemDesligado /></Envolve>);
    const x = itens().at(-2)!;
    expect(x.onPress).toBeUndefined();
    expect((x.accessibilityState as {disabled: boolean}).disabled).toBe(true);
  });
  it("grupo desligado desliga todos", () => {
    render(<Envolve><Entrega inicial="normal" disabled /></Envolve>);
    for (const x of itens().slice(-3)) expect((x.accessibilityState as {disabled: boolean}).disabled).toBe(true);
  });
  it("o rótulo e a descrição viram o nome e a dica do item", () => {
    render(<Envolve><Entrega /></Envolve>);
    const x = itens().at(-3)!;
    expect(x.accessibilityLabel).toBe("Normal");
    expect(x.accessibilityHint).toBe("Em 5 a 7 dias úteis");
  });
});

describe("RadioGroup · as medidas da referência", () => {
  it("a linha: texto à esquerda, marca à direita, vão de 12 e alvo de toque mínimo", () => {
    render(<Envolve><Entrega /></Envolve>);
    const e = estilo(itens().at(-1)!);
    expect(e.flexDirection).toBe("row");
    expect(e.justifyContent).toBe("space-between");
    expect(e.gap).toBe(t.size.space3);
    expect(e.minHeight).toBe(t.size.targetMin);
  });
  it("a marca tem 24, e o ponto do escolhido tem 10 na cor da seleção", () => {
    render(<Envolve><Entrega inicial="normal" /></Envolve>);
    expect(marcas().slice(-3)).toHaveLength(3);
    const escolhida = marcas().find((e) => e.backgroundColor === t.color.controlSelected)!;
    expect(escolhida.borderRadius).toBe(t.size.radiusFull);
    const ponto = __instancias("View").map((p) => StyleSheet.flatten(p.style) ?? {})
      .find((e) => e.width === t.size.space2 + t.size.space05)!;
    expect(ponto.backgroundColor).toBe(t.color.controlSelectedForeground);
  });
  it("o grupo põe 12 entre as linhas, em coluna", () => {
    render(<Envolve><Entrega /></Envolve>);
    const g = StyleSheet.flatten(__instancias("View").find((p) => p.accessibilityRole === "radiogroup")!.style);
    expect(g.gap).toBe(t.size.space3);
    expect(g.flexDirection).toBe("column");
  });
  it("com erro, a marca contorna na cor de perigo", () => {
    render(<Envolve><Entrega invalid /></Envolve>);
    const perigo = t.color.danger400 ?? t.color.destructive;
    for (const e of marcas().slice(-3)) expect(e.borderColor).toBe(perigo);
  });
});

describe("RadioGroup · indicatorPlacement (a marca no início ou no fim)", () => {
  const ordem = (p: Record<string, unknown>) =>
    ([p.children].flat(3) as Array<{key?: string} | false | null>).filter(Boolean).map((c) => (c as {key?: string}).key);
  it("sem nada, a marca fica no fim, como o exemplo da referência", () => {
    render(<Envolve><Entrega /></Envolve>);
    expect(ordem(itens().at(-1)!)).toEqual(["texto", "marca"]);
  });
  it("no grupo, `start` põe a marca no início de todos os itens", () => {
    render(<Envolve><RadioGroup value="a" indicatorPlacement="start">
      <RadioGroup.Item value="a" label="A" /><RadioGroup.Item value="b" label="B" /></RadioGroup></Envolve>);
    for (const x of itens().slice(-2)) expect(ordem(x)).toEqual(["marca", "texto"]);
  });
  it("o item pode trocar só o dele", () => {
    render(<Envolve><RadioGroup value="a" indicatorPlacement="start">
      <RadioGroup.Item value="a" label="A" /><RadioGroup.Item value="b" label="B" indicatorPlacement="end" /></RadioGroup></Envolve>);
    expect(itens().slice(-2).map(ordem)).toEqual([["marca", "texto"], ["texto", "marca"]]);
  });
});
