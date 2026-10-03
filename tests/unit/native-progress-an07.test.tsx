// AN-07 · o `Progress` do nativo — 03/10/2026. Um consumidor novo mediu: trabalho que ainda está
// contando os arquivos (total desconhecido) aparecia como 0%, como se estivesse parado. E faltavam
// o texto de apoio (velocidade, tempo, bytes) e a cor de pausado e de falha.
//
// Cada teste reprova o código de antes, e o ponto de cada um está no nome. O de antes, sem `value`,
// publicava `now: NaN` e pedia um preenchimento de `"NaN%"`.
import {act, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __animacoes, __configsDeAnimacao, __definirReduceMotion, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Progress, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const assentar = async () => { await act(async () => { await Promise.resolve(); }); };
// O dublê guarda TODA renderização; a que vale é a última.
const ultimo = (primitivo: string) => __instancias(primitivo).at(-1) ?? {};
const papel = () => __instancias("View").filter((p) => p.accessibilityRole === "progressbar").at(-1) ?? {};
const estilo = (p: Record<string, unknown>) => (StyleSheet.flatten(p.style as never) ?? {}) as Record<string, unknown>;
const trilho = () => __instancias("View").filter((p) => estilo(p).height === 8).at(-1)!;

describe("Progress · sem total, a barra é indeterminada", () => {
  it("não publica valor nenhum: nem `now`, nem um 0% inventado", async () => {
    render(<Envolve><Progress label="Contando arquivos" /></Envolve>);
    await assentar();
    expect(papel().accessibilityRole).toBe("progressbar");
    expect(papel().accessibilityLabel).toBe("Contando arquivos");
    expect(papel().accessibilityValue).toBeUndefined();
  });

  it("um pedaço de 2/5 corre de -100% a 350% da própria largura, em 1,5 s", async () => {
    render(<Envolve><Progress /></Envolve>);
    await assentar();
    // Antes de medir o trilho ele não sabe quanto andar, e não corre.
    expect(__animacoes()).toHaveLength(0);
    act(() => { (trilho().onLayout as (e: unknown) => void)({nativeEvent: {layout: {width: 200}}}); });
    expect(__animacoes()).toHaveLength(1);
    expect(__configsDeAnimacao().at(-1)).toMatchObject({toValue: 1, duration: 1500});
    const pedaco = estilo(ultimo("Animated.View"));
    expect(pedaco.width).toBe(80);
    const [{translateX}] = pedaco.transform as Array<{translateX: {__interpolado: number[]}}>;
    expect(translateX.__interpolado).toEqual([-80, 280]);
  });

  it("com menos movimento não corre: a barra inteira, apagada, e nunca um pedaço parado", async () => {
    __definirReduceMotion(true);
    render(<Envolve><Progress /></Envolve>);
    await assentar();
    act(() => { (trilho().onLayout as (e: unknown) => void)({nativeEvent: {layout: {width: 200}}}); });
    expect(__animacoes()).toHaveLength(0);
    const cheio = estilo(ultimo("View"));
    expect([cheio.width, cheio.opacity]).toEqual(["100%", t.size.opacityDisabled]);
  });

  it("e para de correr quando ganha o total", async () => {
    const {rerender} = render(<Envolve><Progress /></Envolve>);
    await assentar();
    act(() => { (trilho().onLayout as (e: unknown) => void)({nativeEvent: {layout: {width: 200}}}); });
    expect(__animacoes()[0].parado).toBe(false);
    rerender(<Envolve><Progress value={30} /></Envolve>);
    expect(__animacoes()[0].parado).toBe(true);
    expect(papel().accessibilityValue).toEqual({min: 0, max: 100, now: 30});
  });
});

describe("Progress · o texto de apoio", () => {
  it("aparece no alto, à direita, em algarismos de largura igual, e vai junto no valor", () => {
    render(<Envolve><Progress value={64} label="Enviando" detail="2,3 MB/s · 12 s" /></Envolve>);
    const texto = __instancias("Text").find((p) => p.children === "2,3 MB/s · 12 s")!;
    expect(texto).toBeDefined();
    const e = estilo(texto);
    expect(e.alignSelf).toBe("flex-end");
    expect(e.fontVariant).toEqual(["tabular-nums"]);
    expect(e.color).toBe(t.color.mutedForeground);
    expect(papel().accessibilityValue).toEqual({min: 0, max: 100, now: 64, text: "64%, 2,3 MB/s · 12 s"});
  });

  it("sem total, o apoio é o valor inteiro", () => {
    render(<Envolve><Progress detail="1.204 arquivos" /></Envolve>);
    expect(papel().accessibilityValue).toEqual({text: "1.204 arquivos"});
  });

  it("o vão até o trilho é o `gap-1` do HeroUI", () => {
    render(<Envolve><Progress value={10} detail="10 s" /></Envolve>);
    expect(estilo(papel()).gap).toBe(t.size.space1);
  });
});

describe("Progress · o tom", () => {
  it.each([
    ["brand", "primary"], ["neutral", "mutedForeground"], ["success", "success"],
    ["warning", "warning"], ["danger", "destructive"], ["info", "info"],
  ] as const)("%s pinta o preenchimento com %s", (tone, cor) => {
    render(<Envolve><Progress value={50} tone={tone} /></Envolve>);
    const preenchido = __instancias("View").map(estilo).filter((e) => e.width === "50%").at(-1)!;
    expect(preenchido.backgroundColor).toBe(t.color[cor]);
  });
});
