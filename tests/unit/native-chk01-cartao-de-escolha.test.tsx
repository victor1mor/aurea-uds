// CHK-01 (06/10/2026) · o cartão de escolha: o cartão INTEIRO é a opção. O app monta os Planos com
// `Card variant="selected"` + `onPress`, e o leitor de tela anuncia "botão", não "opção 1 de 3": a
// escolha não existe para quem não vê. A referência não tem a peça pronta — ela a monta com um
// `RadioGroup.Item` e uma superfície dentro —, e é assim que ela entra: `RadioGroup variant="card"`.
//
// O que este arquivo trava:
//   · cada item continua sendo o RÁDIO (papel, marcado, desligado), agora com a pele do `Card`;
//   · o escolhido tem a pele do `Card variant="selected"` — a MESMA, e não uma parecida;
//   · a pele existe desde a montagem (a regra que a 0.19.1 pagou no Android);
//   · o conteúdo a mais (preço, lista) aparece dentro do cartão;
//   · sem `variant`, a lista de sempre não muda.
// Provado contra o defeito: com o `RadioGroup` de antes (sem `variant` nem `children`), os testes
// do cartão reprovam — o item sai sem fundo, sem borda e sem o conteúdo a mais.
import {render, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Card, RadioGroup, Text, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const estilo = (p: Record<string, unknown>) =>
  (StyleSheet.flatten(typeof p.style === "function" ? (p.style as (e: unknown) => unknown)({pressed: false}) : p.style) ?? {}) as Record<string, unknown>;
const radios = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "radio");

const Planos = ({value, variant = "card" as const, onValueChange = () => {}}: {value: string; variant?: "card" | "list"; onValueChange?: (v: string) => void}) => (
  <Envolve>
    <RadioGroup label="Plano" variant={variant} value={value} onValueChange={onValueChange}>
      <RadioGroup.Item value="gratis" label="Grátis" description="1 veículo" accessibilityLabel="Grátis, R$ 0" />
      <RadioGroup.Item value="pro" label="Pro" description="Até 5 veículos" accessibilityLabel="Pro, R$ 9,90 por mês">
        <Text>R$ 9,90 por mês</Text>
      </RadioGroup.Item>
      <RadioGroup.Item value="frota" label="Frota" description="Veículos sem limite" disabled />
    </RadioGroup>
  </Envolve>
);

describe("CHK-01 · o cartão inteiro é a opção", () => {
  it("cada cartão é um rádio: papel, marcado e desligado, para o leitor de tela", () => {
    render(<Planos value="pro" />);
    const r = radios();
    expect(r).toHaveLength(3);
    expect(r.map((p) => (p.accessibilityState as {checked: boolean}).checked)).toEqual([false, true, false]);
    expect((r[2].accessibilityState as {disabled: boolean}).disabled).toBe(true);
    expect(r[1].accessibilityLabel).toBe("Pro, R$ 9,90 por mês");
  });

  it("tocar no cartão escolhe", () => {
    const mudar = vi.fn();
    render(<Planos value="gratis" onValueChange={mudar} />);
    act(() => { (radios()[1].onPress as () => void)(); });
    expect(mudar).toHaveBeenCalledWith("pro");
  });

  it("todo cartão tem a pele do `Card` desde a montagem: raio 22, recheio, fundo e borda", () => {
    render(<Planos value="pro" />);
    for (const e of radios().map(estilo)) {
      expect([e.borderRadius, e.borderCurve, e.padding, e.borderWidth]).toEqual(
        [t.size.radiusCard, "continuous", t.size.cardPad, t.size.borderWidth]);
      expect(e.backgroundColor).toBeDefined();
      expect(e.borderColor).toBeDefined();
    }
  });

  it("o escolhido tem a MESMA pele do `Card variant=\"selected\"`", () => {
    render(<Envolve><Card variant="selected"><Text>a</Text></Card></Envolve>);
    const doCard = estilo(__instancias("View").find((p) => estilo(p).borderColor === t.color.primaryOutline)!);
    render(<Planos value="pro" />);
    const [gratis, pro] = radios().map(estilo);
    expect([pro.borderColor, pro.backgroundColor]).toEqual([doCard.borderColor, doCard.backgroundColor]);
    expect(gratis.borderColor).toBe(t.color.border);
  });

  it("a marca sobe para a linha do título, e o conteúdo a mais fica dentro do cartão", () => {
    render(<Planos value="pro" />);
    expect(estilo(radios()[1]).alignItems).toBe("flex-start");
    expect(__instancias("Text").some((p) => p.children === "R$ 9,90 por mês")).toBe(true);
  });
});

describe("CHK-01 · sem `variant`, nada muda", () => {
  it("a lista de sempre: sem fundo, sem borda, marca no meio da linha", () => {
    render(<Planos value="pro" variant="list" />);
    for (const e of radios().map(estilo)) {
      expect([e.backgroundColor, e.borderWidth, e.padding]).toEqual([undefined, undefined, undefined]);
      expect(e.alignItems).toBe("center");
    }
  });
});
