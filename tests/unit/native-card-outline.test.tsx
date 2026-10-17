// 0.32.0 · `Card variant="outline"` no NATIVO, com o mesmo nome da web: o cartão da cor de onde ele está,
// só com a linha em volta. O dublê só registra; o desenho se vê na bancada do `react-native-web`.
// Provado contra o defeito: sem o `card_outline` na folha, o cartão sai com o fundo do `cardBase`.
import {render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Card, Text, comOpacidade, resolverTokens} from "../../packages/native/src/index.js";

type Estilo = Record<string, unknown>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;
const viewCom = (id: string) => plano(__instancias("View").findLast((p) => p.testID === id)?.style);

describe("Card outline: sem fundo, com a ÚNICA linha que fica — clara (ADR-0072)", () => {
  for (const tema of ["light", "dark"] as const) {
    it(`no ${tema === "light" ? "claro" : "escuro"}, o fundo é transparente, e a linha é o texto a 10%`, () => {
      const t = resolverTokens(tema, "comfortable");
      render(<AureaProvider theme={tema}><Card variant="outline" testID="c"><Text>Oi</Text></Card></AureaProvider>);
      const s = viewCom("c");
      expect(s.backgroundColor).toBe("transparent");
      expect(s.borderColor).toBe(comOpacidade(t.color.foreground, 0.1));
      expect(s.borderWidth).toBe(t.size.borderWidth);
    });
  }
  it("o padrão continua com o fundo do cartão", () => {
    const t = resolverTokens("light", "comfortable");
    render(<AureaProvider theme="light"><Card testID="c"><Text>Oi</Text></Card></AureaProvider>);
    expect(viewCom("c").backgroundColor).toBe(t.color.card);
  });
});
