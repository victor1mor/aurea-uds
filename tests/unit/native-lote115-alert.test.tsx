// O lote 115 (27/11/2026) · a paridade web × nativo, a regra do Victor de 24/11/2026: o `Alert` do nativo ganha o que a
// web tem desde a 0.54.0 (`appearance="soft"`) e a 0.33.0 (`action`).
//   · `appearance="soft"` — o fundo da cor do estado a 14%, sem a sombra do cartão; o título em negrito, com 25% da cor do
//     texto; o corpo na cor do texto, a 16. Na Ember, o cartão de sempre (o Victor, 02/11/2026: "Ember no cartão").
//   · `action` — o botão do aviso, embaixo do texto, FORA do grupo que o leitor de tela lê como um (check 43).
// Provado contra o defeito: com o código de antes, o `soft` saía com o fundo do cartão e a sombra, e o `action` não
// aparecia (a prop caía no `...rest` da moldura).
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {Pressable, StyleSheet, Text as TextRN, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Alert, comOpacidade, resolverTokens} from "../../packages/native/src/index.js";
import {misturaNoOklab} from "../../packages/native/src/estilos.js";

const t = resolverTokens("light", "comfortable");
const estilo = (p: Record<string, unknown>) => StyleSheet.flatten(p.style) ?? {};
const moldura = () => __instancias("View").map(estilo).find((e) => e.borderRadius != null && e.padding === t.size.space3)!;
const textoCom = (s: string) => __instancias("Text").find((p) => [p.children].flat().includes(s))!;
const Palco = ({children, brand}: {children: React.ReactNode; brand?: "ember"}) =>
  <AureaProvider theme="light" brand={brand}>{children}</AureaProvider>;

describe("Alert do nativo · appearance=\"soft\"", () => {
  it("pinta o fundo com o tom a 14% e tira a sombra", () => {
    render(<Palco><Alert variant="success" appearance="soft" title="Salvo">Tudo certo.</Alert></Palco>);
    const m = moldura();
    expect(m.backgroundColor).toBe(comOpacidade(t.color.success400!, 0.14));
    expect(m.boxShadow).toEqual([]);
  });
  it("o título em negrito, com 25% da cor do texto; o corpo na cor do texto, a 16", () => {
    render(<Palco><Alert variant="success" appearance="soft" title="Salvo">Tudo certo.</Alert></Palco>);
    const titulo = estilo(textoCom("Salvo"));
    expect(titulo.color).toBe(misturaNoOklab(t.color.success400!, t.color.foreground, 0.75));
    const corpo = estilo(textoCom("Tudo certo."));
    expect(corpo.color).toBe(t.color.foreground);
    expect(corpo.fontSize).toBe(t.size.textBase);
  });
  it("sem a prop, o cartão de sempre: o fundo do cartão e a sombra", () => {
    render(<Palco><Alert variant="success" title="Salvo">Tudo certo.</Alert></Palco>);
    const m = moldura();
    expect(m.backgroundColor).toBe(t.color.card);
    expect(m.boxShadow).not.toEqual([]);
  });
  it("na Ember, o cartão de sempre (como na web)", () => {
    render(<Palco brand="ember"><Alert variant="success" appearance="soft" title="Salvo">Tudo certo.</Alert></Palco>);
    expect(moldura().boxShadow).not.toEqual([]);
  });
});

describe("Alert do nativo · action", () => {
  it("desenha o botão embaixo do texto, na coluna dele", () => {
    render(<Palco><Alert title="2 créditos" action={<Pressable testID="acao"><TextRN>Upgrade</TextRN></Pressable>}>Corpo</Alert></Palco>);
    const acao = __instancias("Pressable").find((p) => p.testID === "acao");
    expect(acao).toBeDefined();
    // A moldura quebra a linha, e o botão desce para a coluna do texto.
    expect(moldura().flexWrap).toBe("wrap");
    const coluna = __instancias("View").map(estilo).find((e) => e.width === "100%" && e.paddingLeft === t.size.iconMd + t.size.space3);
    expect(coluna).toBeDefined();
  });
  it("sem `action`, a moldura não quebra a linha", () => {
    render(<Palco><Alert title="Aviso">Corpo</Alert></Palco>);
    expect(moldura().flexWrap).toBeUndefined();
  });
});
