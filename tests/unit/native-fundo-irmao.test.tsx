// O FUNDO TOCÁVEL NÃO PODE SER ANCESTRAL DO PAINEL — 10/09/2026.
//
// 🔴 ESTE ARQUIVO EXISTE PORQUE UM CONSERTO MEU PASSOU EM TESTE E FALHOU NO VIDRO.
// Em 09/09 o defeito "tocar no corpo da caixa a fecha" foi corrigido pondo
// `onStartShouldSetResponder` no painel, com o painel ainda DENTRO do `Pressable` do fundo. Os
// testes passaram. Em 10/09 o Victor reportou o defeito intacto no aparelho: tocar entre duas
// opções da folha do `Select` fechava, igual a tocar fora.
//
// A razão é estrutural: o painel tem um `ScrollView` dentro, e o `ScrollView` PRECISA reivindicar
// o toque para rolar. A negociação do responder pergunta ao mais profundo primeiro, então quem
// decide é ele — e o manipulador do painel nunca é consultado. **Um manipulador não vence um
// componente cujo trabalho é ganhar essa disputa.**
//
// O conserto de verdade é o fundo tocável deixar de ser ancestral: irmão absoluto, desenhado
// antes. Sem ancestral não há propagação para cancelar.
//
// ⚠ E ESTE TESTE NÃO SUBSTITUI O APARELHO. Ele prova a ESTRUTURA, que é o que garante o
// comportamento — não o comportamento. Foi confiar em teste de comportamento contra o dublê que
// produziu a primeira tentativa: *o dublê é a nossa ideia do RN, e ela estava errada.*
import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {
  AureaProvider, BottomSheet, Dialog, Drawer, Select, criarRegistroDeIcones,
} from "../../packages/native/src/index.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({close: Glifo, "chevron--down": Glifo, checkmark: Glifo});
const Envolve = ({children}: {children?: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

/** Um fundo tocável: preenche tudo e fecha ao toque. É a forma, não o nome. */
const fundosQueFecham = () => __instancias("Pressable").filter((p) => {
  const e = StyleSheet.flatten(p.style) ?? {};
  return e.position === "absolute" && e.top === 0 && e.bottom === 0
    && e.left === 0 && e.right === 0 && !!p.onPress;
});

const casos: Array<[string, React.ReactElement]> = [
  ["Dialog", <Dialog open title="t" onClose={() => {}}><></></Dialog>],
  ["Drawer", <Drawer open onClose={() => {}}><></></Drawer>],
  ["BottomSheet", <BottomSheet open onClose={() => {}}><></></BottomSheet>],
  // O `Select` do Lote 4: mesma forma, e é ONDE o defeito foi visto no vidro.
  // ⚠ Não há prop para abri-lo — a primeira versão deste arquivo passou uma `defaultOpen` que
  // NÃO EXISTE, e o teste passou de qualquer jeito. A razão é que o dublê de `Modal` renderiza
  // o conteúdo independente de `visible`, o que serve para inspecionar ESTRUTURA e não serviria
  // para julgar comportamento. Prop inventada num teste que passa é a forma mais silenciosa de
  // mentir, então ela saiu e a razão ficou escrita.
  ["Select", <Select value="a" onChange={() => {}}
                     items={[{value: "a", label: "A"}, {value: "b", label: "B"}]} />],
];

describe("os quatro overlays: o fundo que fecha é IRMÃO, não pai", () => {
  for (const [nome, elemento] of casos) {
    it(`${nome} — existe um fundo que fecha, e ele NÃO tem filhos`, () => {
      __limpar();
      render(<Envolve>{elemento}</Envolve>);
      const fundos = fundosQueFecham();
      expect(fundos.length).toBeGreaterThan(0);          // o toque fora ainda fecha
      for (const f of fundos) expect(f.children).toBeUndefined(); // e nada mora dentro dele
    });
  }
});
