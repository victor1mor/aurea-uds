// HER-01 (06/10/2026) · o canto contínuo do iOS. `borderCurve: "continuous"` é o canto do iPhone: a curva
// entra no lado aos poucos, em vez de começar de repente como um quarto de círculo. A
// referência (no nativo) o põe em 24 peças; a Aurea nativa, até aqui, em nenhuma (contado: 60
// raios no fonte, zero `borderCurve`). Só o iOS 13+ mostra; o Android e o navegador ignoram.
//
// Todo raio do nativo passa agora por `canto()` (ou `cantosDeCima()`), em `estilos.ts`, que entrega
// o raio E o canto contínuo juntos. O que este arquivo trava:
//   · nenhum fonte do pacote escreve `borderRadius` (nem um dos quatro cantos) à mão — é assim que
//     a próxima peça nasceria com o canto do Android no iPhone;
//   · o único canto `circular` é o anel do `Spinner`, que gira (declarado no `feedback.tsx`);
//   · e as peças montadas saem com o canto contínuo de verdade.
// Provado contra o defeito: com um `borderRadius: t.size.radiusLg` escrito à mão de volta em
// qualquer arquivo, o primeiro teste reprova nomeando o arquivo e a linha.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {
  Alert, AureaProvider, Button, Card, Input, Spinner, Switch, criarRegistroDeIcones,
} from "../../packages/native/src/index.js";

const DIR = join(__dirname, "../../packages/native/src");
const FONTES = readdirSync(DIR).filter((f) => /\.tsx?$/.test(f));
// Comentário fala de `borderRadius` à vontade; o que conta é código. Tira os dois tipos de
// comentário mantendo as quebras de linha, para o número da linha continuar certo.
const semComentario = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/\/\/[^\n]*/g, "");
const RAIO_A_MAO = /\bborder(?:Top|Bottom)?(?:Left|Right)?Radius\s*:/;
// As duas únicas linhas que podem escrever o raio: as definições de `canto` e `cantosDeCima`.
const DEFINICAO = /^\s*\(\{border(?:Radius|TopLeftRadius): raio,/;

describe("HER-01 · todo raio do nativo passa por `canto()`", () => {
  it("nenhum fonte escreve `borderRadius` à mão", () => {
    const achados: string[] = [];
    for (const f of FONTES) {
      semComentario(readFileSync(join(DIR, f), "utf8")).split("\n").forEach((linha, i) => {
        if (RAIO_A_MAO.test(linha) && !(f === "estilos.ts" && DEFINICAO.test(linha))) {
          achados.push(`${f}:${i + 1}: ${linha.trim()}`);
        }
      });
    }
    expect(achados).toEqual([]);
  });

  it("e as duas definições entregam o canto contínuo junto com o raio", () => {
    const estilos = semComentario(readFileSync(join(DIR, "estilos.ts"), "utf8"));
    expect(estilos).toMatch(/canto = \(raio: number, curva: "continuous" \| "circular" = "continuous"\)/);
    expect(estilos).toMatch(/cantosDeCima = \(raio: number\) =>\s*\(\{[^}]*borderCurve: "continuous"/);
  });

  it("o único canto `circular` é o anel do `Spinner`, que gira", () => {
    const circulares = FONTES.flatMap((f) =>
      semComentario(readFileSync(join(DIR, f), "utf8")).split("\n")
        .filter((l) => l.includes(`"circular"`) && !l.includes("curva:"))
        .map((l) => `${f}: ${l.trim()}`));
    expect(circulares).toHaveLength(1);
    expect(circulares[0]).toMatch(/^feedback\.tsx: anel:/);
  });
});

describe("HER-01 · as peças montadas saem com o canto contínuo do iOS", () => {
  const ICONES = criarRegistroDeIcones({});
  const comRaio = () => [...__instancias("View"), ...__instancias("Animated.View"),
    ...__instancias("Pressable"), ...__instancias("TextInput")]
    .map((p) => (StyleSheet.flatten(typeof p.style === "function"
      ? (p.style as (e: unknown) => unknown)({pressed: false}) : p.style) ?? {}) as Record<string, unknown>)
    .filter((e) => typeof e.borderRadius === "number" && (e.borderRadius as number) > 0);

  it.each([
    ["Button", <Button>Salvar</Button>],
    ["Card", <Card><Input /></Card>],
    ["Alert", <Alert variant="info">Aviso</Alert>],
    ["Switch", <Switch checked onChange={() => {}} accessibilityLabel="Digital" />],
  ])("%s: todo canto arredondado é contínuo", (_nome, ui) => {
    render(<AureaProvider icons={ICONES}>{ui}</AureaProvider>);
    const cantos = comRaio();
    expect(cantos.length).toBeGreaterThan(0);
    for (const e of cantos) expect(e.borderCurve).toBe("continuous");
  });

  it("o anel do `Spinner` fica circular", () => {
    render(<AureaProvider icons={ICONES}><Spinner /></AureaProvider>);
    const anel = comRaio().find((e) => e.borderWidth === 2);
    expect(anel?.borderCurve).toBe("circular");
  });
});
