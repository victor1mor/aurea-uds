// ADR-0059 (08/10/2026) · a aba e o segmento ESCOLHIDOS se veem no nativo também.
//
// O Victor mostrou a aba do painel da web ao lado da aba da referência principal: lá a escolhida é
// uma cápsula de cor própria sobre o trilho; aqui ela tinha a cor do trilho. No nativo era a mesma
// combinação da web — trilho `muted`, escolhido `secondary` —, e no tema claro os dois são o MESMO
// cinza (0,94). Agora o escolhido é `segment` (claro: branco; escuro: o cinza da referência) com a
// sombra pequena inteira (as três camadas de `shadowSm`).
//
// Quem mais tem esse problema? No nativo, as duas peças que desenham cápsula escolhida sobre trilho
// são o `SegmentedControl` e o `Tabs` primário. O secundário é de linha (sem trilho) e fica fora.
// Provado contra o defeito: com `secondary` de volta em `segmentoAtivo` ou `abaDeTabAtiva`, este
// arquivo reprova nos dois temas.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, SegmentedControl, Tabs, Text, resolverTokens} from "../../packages/native/src/index.js";

const estilo = (p: Record<string, unknown>) =>
  (StyleSheet.flatten(typeof p.style === "function" ? (p.style as (e: unknown) => unknown)({pressed: false}) : p.style) ?? {}) as Record<string, unknown>;

const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const lum = ([r, g, b]: number[]) => {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const razao = (a: string, b: string) => {
  const A = lum(hex(a)), B = lum(hex(b));
  return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05);
};

const PERIODOS = ["Semana", "Mês", "Ano"].map((l) => ({value: l, label: l}));
const ABAS = [{id: "a", label: "Resumo", content: <Text>a</Text>}, {id: "b", label: "Histórico", content: <Text>b</Text>}];

describe("ADR-0059 · a cápsula escolhida tem cor própria no nativo", () => {
  for (const tema of ["dark", "light"] as const) {
    const t = resolverTokens(tema, "comfortable");

    // 24/10/2026: o segmento escolhido passou a ser o AMARELO do botão primário, sem sombra (decisão do Victor, vendo as
    // formas desenhadas: "O amarelo por trás, como o botão, na barra de baixo e na aba escolhida"). Era `segment` + sombra.
    it(`tema ${tema}: o segmento escolhido é o amarelo do botão, sem sombra, e se distingue do trilho`, () => {
      __limpar();
      render(<AureaProvider theme={tema}><SegmentedControl items={PERIODOS} value="Mês" /></AureaProvider>);
      const trilho = estilo(__instancias("View").find((p) => p.accessibilityRole === "radiogroup")!);
      const escolhido = __instancias("Pressable").filter((p) => p.accessibilityRole === "radio")
        .map(estilo).find((e) => e.backgroundColor != null && e.backgroundColor !== "transparent")!;
      expect(escolhido.backgroundColor).toBe(t.color.primary);
      expect(escolhido.boxShadow).toBeUndefined();
      expect(razao(escolhido.backgroundColor as string, trilho.backgroundColor as string)).toBeGreaterThanOrEqual(1.08);
    });

    // 24/10/2026: a aba escolhida do `Tabs` também é o amarelo do botão (decisão do Victor: "as abas do Tabs deixe como a
    // aba escolhida amarelo tudo").
    it(`tema ${tema}: a aba escolhida do \`Tabs\` também é o amarelo, sem sombra`, () => {
      __limpar();
      render(<AureaProvider theme={tema}><Tabs tabs={ABAS} value="a" /></AureaProvider>);
      const abas = __instancias("Pressable").filter((p) => p.accessibilityRole === "tab");
      const escolhida = estilo(abas.find((p) => (p.accessibilityState as {selected?: boolean})?.selected)!);
      const trilho = estilo(__instancias("View").find((p) => p.accessibilityRole === "tablist")!);
      expect(escolhida.backgroundColor).toBe(t.color.primary);
      expect(escolhida.boxShadow).toBeUndefined();
      expect(razao(escolhida.backgroundColor as string, trilho.backgroundColor as string)).toBeGreaterThanOrEqual(1.08);
    });
  }

  // O alvo nativo levava só a PRIMEIRA camada de uma sombra, em silêncio. A `shadowSm` tem três.
  it("`shadowLayers` traz a sombra inteira; `shadow` continua com a primeira camada", () => {
    const t = resolverTokens("light", "comfortable");
    expect(t.shadowLayers.shadowSm).toHaveLength(3);
    expect(t.shadow.shadowSm).toEqual(t.shadowLayers.shadowSm[0]);
    expect(t.shadowLayers.shadowMd).toEqual([t.shadow.shadowMd]);
  });
});
