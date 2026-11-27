// O LOTE 117 (27/11/2026), a parte do nativo — três itens que o Victor aprovou vendo a imagem:
//   · E15, "O disco alarga": o disco do `BottomNav` `circle-bold` deixa de ter 56 fixos e cresce até caber o nome
//     (no mínimo 56, `space2` de cada lado, sem passar da aba);
//   · "A folha sobe": a `BottomSheet` sobe com o teclado (o `KeyboardAvoiding` da Aurea por fora da folha);
//   · UDS-A2b, "Sim, antes da 1.0": o `AureaProvider` aceita só as frases que mudam, e as outras vêm do padrão.
// Provado contra o defeito: com o `width: 56` de volta, sem o `KeyboardAvoiding` na folha ou com o `strings ?? padrão`
// de antes, este arquivo reprova.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {
  AureaProvider, BottomNav, BottomSheet, Text, defaultStrings, ptBR, resolverTokens, useAureaStrings,
} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const estilos = (nome: string) => __instancias(nome).map((p) => (StyleSheet.flatten(p.style) ?? {}) as Record<string, unknown>);

describe("E15 · o disco do `circle-bold` alarga com o nome", () => {
  it("o disco tem no mínimo 56, sem largura fixa, e `space2` de cada lado", () => {
    render(<AureaProvider><BottomNav label="Menu" indicator="circle-bold" current="b" items={[
      {id: "a", label: "Início", icon: "house"}, {id: "b", label: "Relatórios", icon: "car"},
    ]} /></AureaProvider>);
    // O disco é a caixa redonda com o recheio de cima e de baixo `space05`, uma por aba.
    const discos = estilos("View").filter((e) => e.minWidth === 56);
    expect(discos).toHaveLength(2);
    for (const d of discos) {
      expect(d.width).toBeUndefined();
      expect(d.maxWidth).toBe("100%");
      expect(d.paddingHorizontal).toBe(t.size.space2);
    }
  });
});

describe("a folha de baixo sobe com o teclado", () => {
  it("a `BottomSheet` aberta fica dentro do `KeyboardAvoiding`", () => {
    render(<AureaProvider><BottomSheet open title="Novo veículo" onClose={() => {}}><Text>campo</Text></BottomSheet></AureaProvider>);
    const casca = __instancias("KeyboardAvoidingView");
    expect(casca).toHaveLength(1);
    // O fundo escuro É a casca: a folha encosta embaixo dela e sobe quando ela encolhe.
    expect(StyleSheet.flatten(casca[0].style)).toMatchObject({flex: 1, backgroundColor: t.color.overlay});
  });
});

describe("UDS-A2b · as frases do nativo podem vir pela metade", () => {
  it("só a frase passada muda; as outras vêm do padrão", () => {
    const visto: Array<ReturnType<typeof useAureaStrings>> = [];
    const Sonda = () => { visto.push(useAureaStrings()); return null; };
    render(<AureaProvider strings={{dataEmpty: "Nada aqui"}}><Sonda /></AureaProvider>);
    const s = visto.at(-1)!;
    expect(s.dataEmpty).toBe("Nada aqui");
    expect(s.bottomNavLabel).toBe(defaultStrings.bottomNavLabel);
    expect(s.universalState).toEqual(defaultStrings.universalState);
  });

  it("a tabela inteira continua valendo", () => {
    const visto: string[] = [];
    const Sonda = () => { visto.push(useAureaStrings().dataEmpty); return null; };
    render(<AureaProvider strings={ptBR}><Sonda /></AureaProvider>);
    expect(visto.at(-1)).toBe(ptBR.dataEmpty);
  });
});
