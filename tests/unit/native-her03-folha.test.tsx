// HER-03 (06/10/2026, ADR-0058) · a folha que sobe de baixo tem 32 de canto, e não o 22 de painel.
// Decisão do Victor olhando as duas na bancada (*"folha com 32"*): ela acompanha o canto da tela do
// telefone. É o `rounded-4xl` do bottom-sheet do HeroUI Native 1.0.10, que usa a MESMA folha no
// `Select` e no `Menu` quando eles abrem por baixo.
//
// Quem mais tem esse problema? No nativo da Aurea, três peças sobem de baixo: a `BottomSheet`, a
// lista do `Select` e a folha do `Combobox`. As três levam o token novo `radiusSheet`.
// Provado contra o defeito: com `radiusCard` de volta em qualquer uma das três, este arquivo reprova.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, BottomSheet, Text, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const DIR = join(__dirname, "../../packages/native/src");

describe("HER-03 · a folha de baixo com 32", () => {
  it("o token `radiusSheet` vale 32, nas três densidades", () => {
    for (const d of ["compact", "comfortable", "spacious"] as const) {
      expect(resolverTokens("dark", d).size.radiusSheet).toBe(32);
    }
  });

  it("a `BottomSheet` aberta tem os dois cantos de cima com 32, contínuos", () => {
    render(<AureaProvider><BottomSheet open title="Opções do veículo" onClose={() => {}}><Text>a</Text></BottomSheet></AureaProvider>);
    const folha = __instancias("View").concat(__instancias("Animated.View"))
      .map((p) => (StyleSheet.flatten(p.style) ?? {}) as Record<string, unknown>)
      .find((e) => e.borderTopLeftRadius != null);
    expect([folha?.borderTopLeftRadius, folha?.borderTopRightRadius, folha?.borderCurve])
      .toEqual([t.size.radiusSheet, t.size.radiusSheet, "continuous"]);
  });

  // As três folhas do pacote usam `cantosDeCima`, e só elas. Ler o fonte é o jeito de pegar a
  // QUARTA, a que ainda não existe, no dia em que ela nascer com o 22.
  it("toda folha que sobe de baixo usa `radiusSheet`", () => {
    const chamadas = readdirSync(DIR).filter((f) => /\.tsx?$/.test(f) && f !== "estilos.ts")
      .flatMap((f) => [...readFileSync(join(DIR, f), "utf8").matchAll(/cantosDeCima\(([^)]*)\)/g)]
        .map((m) => `${f}: ${m[1]}`))
      .sort();
    expect(chamadas).toEqual([
      "busca.tsx: t.size.radiusSheet",
      "inputs.tsx: t.size.radiusSheet",
      "overlays.tsx: t.size.radiusSheet",
    ]);
  });
});
