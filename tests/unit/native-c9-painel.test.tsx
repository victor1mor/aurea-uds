// C9 (06/10/2026) · o conteúdo do `Tabs` começava 21 pontos para dentro — medido pelo app em
// 17/09/2026: 301 de largura num espaço de 343, os cartões de dentro mais estreitos que os de fora.
// Na `0.14.0` o app passou ao `variant="secondary"` e o recuo NÃO sumiu: conferido no código, o
// painel era um `Card variant="inset"` nas DUAS variantes (recheio `cardPad`, 20, + borda, 1).
// É o mesmo pedido da MNT-05 na web.
//
// Na referência o painel não é caixa: no nativo o conteúdo da aba não tem estilo nenhum; na web,
// o painel é só um recheio de 8. Agora `panel="plain"` tira a caixa; o padrão continua o cartão.
// Provado contra o defeito: com o painel sempre `Card` (o código de antes), os testes do `plain`
// reprovam — sobra o recheio de 20 e o fundo `surfaceInset`.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Tabs, Text, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const estilo = (p: Record<string, unknown>) => (StyleSheet.flatten(p.style) ?? {}) as Record<string, unknown>;
const ABAS = [
  {id: "r", label: "Resumo", content: <Text>corpo do resumo</Text>},
  {id: "h", label: "Histórico", content: <Text>corpo do histórico</Text>},
];
// O painel é a caixa que leva o nome da aba aberta (o `accessibilityLabel`), nos dois jeitos.
const painel = () => estilo(__instancias("View").filter((p) => p.accessibilityLabel === "Resumo").at(-1)!);

describe("C9 · o painel do `Tabs`", () => {
  it("o padrão continua o cartão `inset`: recheio e fundo de cartão", () => {
    render(<Envolve><Tabs tabs={ABAS} value="r" /></Envolve>);
    expect(painel().padding).toBe(t.size.cardPad);
    expect(painel().backgroundColor).toBe(t.color.surfaceInset);
  });

  it.each(["primary", "secondary"] as const)(
    "`panel=\"plain\"` (variante %s): sem recheio, sem fundo, sem borda — só o espaço de cima", (variant) => {
      render(<Envolve><Tabs tabs={ABAS} value="r" variant={variant} panel="plain" /></Envolve>);
      const e = painel();
      expect([e.padding, e.paddingHorizontal, e.paddingLeft]).toEqual([undefined, undefined, undefined]);
      expect([e.backgroundColor, e.borderWidth]).toEqual([undefined, undefined]);
      expect(e.marginTop).toBe(t.size.space3);
    });

  it("sem caixa, o conteúdo continua lá, e só o da aba aberta", () => {
    render(<Envolve><Tabs tabs={ABAS} value="r" panel="plain" /></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("corpo do resumo");
    expect(textos).not.toContain("corpo do histórico");
  });

  it("e não ganha papel: `tabpanel` derruba a tela no Android (o `check 41`)", () => {
    render(<Envolve><Tabs tabs={ABAS} value="r" panel="plain" /></Envolve>);
    expect(__instancias("View").some((p) => p.accessibilityRole === "tabpanel")).toBe(false);
  });
});
