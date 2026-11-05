// S-04 NO NATIVO (05/11/2026) · o escolhido do `SegmentedControl` e do `Tabs` DESLIZA, em vez de pular.
//
// O Victor viu o escolhido pular na web, e a regra do §8 leva o conserto ao nativo. A peça que anda é o
// `IndicadorQueDesliza` (`deslize.tsx`): mora dentro da fila, recebe a pintura do escolhido e vai do item de antes ao
// novo pelo relógio da tela, com o tempo e a curva dos tokens. O dublê não desenha nem mede, então o teste faz o papel do
// aparelho: entrega o `onLayout` de cada item e do indicador, e anda o relógio.
//
// O que reprova o código de antes: não havia indicador (a fila só tinha os itens), e o escolhido se pintava sempre — a
// troca era de uma vez.
import {act, render} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __definirReduceMotion} from "./native-stubs/react-native";
import {AureaProvider, SegmentedControl, Tabs} from "../../packages/native/src/index.js";

const ITENS = [{value: "dia", label: "Day"}, {value: "semana", label: "Week"}, {value: "mes", label: "Month"}];
// Cada item com 80 de largura e 3 de vão, a partir de 4 (a borda e o recheio da fila).
const CAIXA = (i: number) => ({x: 4 + i * 83, y: 4, width: 80, height: 28});
const ORIGEM = {x: 1, y: 1};

const estilo = (p: Record<string, unknown>) => StyleSheet.flatten(p.style as never) as Record<string, unknown>;
const indicadores = () => __instancias("View").filter((p) => p.importantForAccessibility === "no-hide-descendants" && estilo(p).position === "absolute");
const ultimo = <T,>(l: T[]) => l[l.length - 1];
const deslocamento = (p: Record<string, unknown>) => {
  const t = (estilo(p).transform ?? []) as Array<Record<string, number>>;
  return {x: t.find((x) => "translateX" in x)?.translateX, largura: estilo(p).width as number};
};
const layout = (l: {x: number; y: number; width?: number; height?: number}) =>
  ({nativeEvent: {layout: {width: 0, height: 0, ...l}}});

// Entrega as medidas que o aparelho daria: a de cada item da fila e a da origem do indicador.
function medir(n: number, itens: () => Array<Record<string, unknown>>) {
  act(() => {
    itens().slice(-n).forEach((p, i) => (p.onLayout as (e: unknown) => void)(layout(CAIXA(i))));
    (ultimo(indicadores()).onLayout as (e: unknown) => void)(layout(ORIGEM));
  });
}

beforeEach(() => {
  vi.useFakeTimers({toFake: ["requestAnimationFrame", "cancelAnimationFrame", "Date", "setTimeout"]});
});
afterEach(() => { vi.useRealTimers(); });

describe("S-04 · SegmentedControl nativo · o escolhido desliza", () => {
  function montar(valor: string) {
    return <AureaProvider><SegmentedControl label="Period" items={ITENS} value={valor} /></AureaProvider>;
  }
  const radios = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "radio");

  it("existe UMA peça que anda, escondida do leitor de tela e do toque", () => {
    render(montar("semana"));
    const ind = ultimo(indicadores());
    expect(ind, "a fila tem o indicador").toBeDefined();
    expect(ind.pointerEvents).toBe("none");
    expect(ind.accessible).toBe(false);
    expect(ind.collapsable, "caixa redonda pintada depois de montada: Android").toBe(false);
  });

  it("depois de medido, o indicador pinta o escolhido no lugar dele, e o item deixa de se pintar", async () => {
    const {rerender} = render(montar("semana"));
    await act(async () => { await Promise.resolve(); });
    medir(3, radios);
    rerender(montar("semana"));
    const ind = ultimo(indicadores());
    expect(deslocamento(ind)).toEqual({x: CAIXA(1).x - ORIGEM.x, largura: 80});
    expect(estilo(ind).backgroundColor, "a cápsula amarela de sempre").toBeTruthy();
    const ativo = radios().slice(-3)[1];
    expect(estilo(ativo).backgroundColor, "o item escolhido não pinta por baixo").toBeUndefined();
  });

  it("na troca, o indicador ANDA do item de antes ao novo — não pula", async () => {
    const {rerender} = render(montar("semana"));
    await act(async () => { await Promise.resolve(); });
    medir(3, radios);
    rerender(montar("dia"));
    act(() => { vi.advanceTimersByTime(80); });
    const meio = deslocamento(ultimo(indicadores())).x!;
    const de = CAIXA(1).x - ORIGEM.x, para = CAIXA(0).x - ORIGEM.x;
    expect(meio, "no meio do caminho, entre o item de antes e o novo").toBeLessThan(de);
    expect(meio).toBeGreaterThan(para);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(deslocamento(ultimo(indicadores())).x, "e chega").toBe(para);
  });

  it("quem pediu menos movimento vê a troca de uma vez", async () => {
    __definirReduceMotion(true);
    const {rerender} = render(montar("semana"));
    await act(async () => { await Promise.resolve(); });
    medir(3, radios);
    rerender(montar("dia"));
    expect(deslocamento(ultimo(indicadores())).x).toBe(CAIXA(0).x - ORIGEM.x);
  });
});

describe("S-04 · Tabs nativo · a aba escolhida desliza", () => {
  const ABAS = [{id: "a", label: "One", content: null}, {id: "b", label: "Two", content: null}, {id: "c", label: "Three", content: null}];
  const abas = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "tab");

  it("a cápsula anda na primária", async () => {
    const montar = (v: string) => <AureaProvider><Tabs tabs={ABAS} value={v} /></AureaProvider>;
    const {rerender} = render(montar("a"));
    await act(async () => { await Promise.resolve(); });
    medir(3, abas);
    rerender(montar("c"));
    act(() => { vi.advanceTimersByTime(80); });
    const x = deslocamento(ultimo(indicadores())).x!;
    expect(x).toBeGreaterThan(CAIXA(0).x - ORIGEM.x);
    expect(x).toBeLessThan(CAIXA(2).x - ORIGEM.x);
  });

  it("na secundária quem anda é o fio de baixo, e a aba não desenha o dela por cima", async () => {
    const montar = (v: string) => <AureaProvider><Tabs tabs={ABAS} value={v} variant="secondary" /></AureaProvider>;
    const {rerender} = render(montar("a"));
    await act(async () => { await Promise.resolve(); });
    medir(3, abas);
    rerender(montar("a"));
    const ind = ultimo(indicadores());
    expect(estilo(ind).backgroundColor, "a peça da secundária é transparente").toBeUndefined();
    // O fio é filho do indicador, e não de uma aba.
    const filho = ind.children as React.ReactElement<{style: unknown}>;
    expect(filho, "o indicador leva o fio").toBeTruthy();
    expect((StyleSheet.flatten(filho.props.style as never) as Record<string, unknown>).height).toBe(2);
    expect(deslocamento(ind).x).toBe(CAIXA(0).x - ORIGEM.x);
  });
});
