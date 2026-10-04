// A CÁPSULA QUE SAÍA QUADRADA NO ANDROID — defeito visto pelo Victor em 04/10/2026, no app e no
// `apps/native-smoke` (bloco 0.17): o `circle-bold` e o `capsule` do `BottomNav` saíam com o canto
// reto; o `pill` e o `expand`, redondos.
//
// A causa (lida no fonte do `react-native@0.86.3`, e registrada em `navigation.tsx`): caixa que só
// tem `borderRadius` e nenhuma cor ou borda não vira caixa nativa — o Fabric a achata no pai. Ela
// nasce no Android quando ganha a cor, e aí o raio não chega (react-native#52415, aberto). O `pill`
// e o `expand` escapavam porque pintam o `Pressable`, que existe sempre.
//
// A regra, que vale para qualquer peça: CAIXA REDONDA CUJA PINTURA MUDA COM A ESCOLHA TEM DE EXISTIR
// DESDE A MONTAGEM — ou já tem cor ou borda permanente, ou leva `collapsable={false}`. O dublê não
// desenha, então a prova é estrutural: renderiza a peça nos dois estados e confere cada caixa.
// O código de antes reprova nos cinco indicadores que pintam a moldura ou o disco.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, BottomNav, Checkbox, Switch, criarRegistroDeIcones} from "../../packages/native/src/index.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({house: Glifo as never, bell: Glifo as never});
const ITENS = [{id: "a", label: "Início", icon: "house"}, {id: "b", label: "Avisos", icon: "bell"}] as never;

type Caixa = {estilo: Record<string, unknown>; collapsable: unknown};
const caixas = (): Caixa[] => __instancias("View").map((p) => ({
  estilo: (StyleSheet.flatten(p.style as never) ?? {}) as Record<string, unknown>,
  collapsable: p.collapsable,
}));
const transparente = (c: unknown) => c == null || c === "transparent";
// O que faz o Fabric criar a caixa nativa por conta própria (`ViewShadowNode.cpp:70-74`): cor de
// fundo que se vê, ou borda. Sem nenhum dos dois, a caixa redonda é achatada.
const existeSozinha = (e: Record<string, unknown>) =>
  !transparente(e.backgroundColor) || (typeof e.borderWidth === "number" && e.borderWidth > 0)
  || e.boxShadow != null;
const pintura = (e: Record<string, unknown>) => JSON.stringify([e.backgroundColor, e.borderWidth, e.borderColor, e.boxShadow]);

// Renderiza nos dois estados e devolve as caixas redondas cuja pintura muda e que, em algum dos
// dois, ficariam achatadas sem `collapsable={false}`.
function emRisco(montar: (escolhido: boolean) => React.ReactElement) {
  __limpar(); render(montar(false)); const antes = caixas();
  __limpar(); render(montar(true)); const depois = caixas();
  expect(depois.length, "a estrutura não muda com a escolha").toBe(antes.length);
  return antes.flatMap((a, i) => {
    const d = depois[i];
    const redonda = a.estilo.borderRadius != null || d.estilo.borderRadius != null;
    const muda = pintura(a.estilo) !== pintura(d.estilo);
    const achatavel = !existeSozinha(a.estilo) || !existeSozinha(d.estilo);
    return redonda && muda && achatavel && (a.collapsable !== false || d.collapsable !== false) ? [i] : [];
  });
}

describe("BottomNav nativo · a caixa pintada existe desde a montagem (Android)", () => {
  const INDICADORES = ["none", "subtle", "pill", "circle", "circle-raised", "circle-outline", "circle-bold", "capsule", "expand"];
  it.each(INDICADORES)("%s: nenhuma caixa redonda nasce só quando ganha a cor", (indicator) => {
    const quebradas = emRisco((b) => <AureaProvider icons={ICONES}>
      <BottomNav items={ITENS} current={b ? "a" : "b"} indicator={indicator as never} width="content" /></AureaProvider>);
    expect(quebradas, "caixas redondas sem collapsable={false} cuja pintura muda com a escolha").toEqual([]);
  });

  it("e a regra pega o que deve pegar: no capsule e no circle-bold a caixa que fica amarela leva collapsable={false}", () => {
    for (const indicator of ["capsule", "circle-bold"]) {
      __limpar(); render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="b" indicator={indicator as never} /></AureaProvider>);
      const antes = caixas();
      __limpar(); render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator={indicator as never} /></AureaProvider>);
      const depois = caixas();
      // A caixa do item "a" que ficou amarela: redonda, sem cor antes, com cor depois.
      const amarelas = depois.filter((d, i) => d.estilo.borderRadius != null
        && transparente(antes[i].estilo.backgroundColor) && !transparente(d.estilo.backgroundColor));
      expect(amarelas.length, `${indicator}: a caixa que ganha a cor existe no teste`).toBe(1);
      expect(amarelas[0].collapsable, `${indicator}: e existe desde a montagem`).toBe(false);
    }
  });
});

describe("Quem mais tem esse problema · os controles que mudam de pintura ao marcar", () => {
  // A regra mais forte, porque a marca do ✓ e o ponto do rádio só montam quando marcados (nascem
  // já com a cor, o caminho normal): em qualquer estado, toda caixa redonda tem cor ou borda própria,
  // ou leva `collapsable={false}`.
  const semCaixaPropria = (montar: (b: boolean) => React.ReactElement) => [false, true].flatMap((b) => {
    __limpar(); render(montar(b));
    return caixas().filter((c) => c.estilo.borderRadius != null && !existeSozinha(c.estilo) && c.collapsable !== false)
      .map((c) => `${b ? "marcado" : "desmarcado"}: ${JSON.stringify(c.estilo)}`);
  });
  it("Checkbox: a marca tem borda e fundo permanentes", () => {
    expect(semCaixaPropria((b) => <AureaProvider><Checkbox label="Aceito" checked={b} onCheckedChange={() => {}} /></AureaProvider>)).toEqual([]);
  });
  it("Switch: o trilho tem borda e fundo permanentes", () => {
    expect(semCaixaPropria((b) => <AureaProvider><Switch label="Ativo" checked={b} onCheckedChange={() => {}} /></AureaProvider>)).toEqual([]);
  });
});
