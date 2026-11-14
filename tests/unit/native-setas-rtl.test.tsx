// As setas do nativo na escrita da direita para a esquerda (13/11/2026): a `NavList` e o submenu do `DropdownMenu`
// desenhavam a seta sempre para a direita. Agora o `AureaProvider` do nativo tem `direction` (o nome da web) e, sem ele,
// vale o aparelho (`I18nManager.isRTL`), como na referência do celular; a seta padrão se ESPELHA (scaleX -1) e aponta
// para onde se lê. O desenho que o app passa em `chevron` fica como veio, e da esquerda para a direita nada muda.
// Provado contra o defeito: no código de antes (a 0.68.0) os testes de "vira" reprovam (nenhum espelho); os de "fica
// como era" passam nos dois — são a guarda.
import {act, render} from "@testing-library/react";
import * as React from "react";
import {afterEach, describe, expect, it} from "vitest";
import {I18nManager, StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, Button, NavList, criarRegistroDeIcones} from "../../packages/native/src/index.js";
import {DropdownMenu} from "../../packages/native/src/menu.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"caret-right": Glifo as never, "arrow-right": Glifo as never, gear: Glifo as never});
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};
type Props = Record<string, unknown>;
const transformacoes = (p: Props) => ((StyleSheet.flatten(p.style as never) ?? {}) as {transform?: Array<Record<string, unknown>>}).transform ?? [];
/** Quantas caixas (de um tipo) estão espelhadas. */
const espelhadas = (tipo: string) => __instancias(tipo).filter((p) => transformacoes(p).some((t) => t.scaleX === -1)).length;
const montar = (no: React.ReactNode, direction?: "ltr" | "rtl") => {
  __limpar();
  return render(<AureaProvider icons={ICONES} fontFamilies={FONTES} direction={direction}>{no}</AureaProvider>);
};
const ITENS = [{id: "a", label: "Account", onPress: () => {}}, {id: "b", label: "Team", onPress: () => {}}];
afterEach(() => { I18nManager.isRTL = false; });

describe("NavList: a seta aponta para onde se lê", () => {
  it("direction=\"rtl\": a seta de cada linha se espelha", () => {
    montar(<NavList items={ITENS} />, "rtl");
    expect(espelhadas("View")).toBe(2);
  });
  it("sem direction, o aparelho em RTL também espelha", () => {
    I18nManager.isRTL = true;
    montar(<NavList items={ITENS} />);
    expect(espelhadas("View")).toBe(2);
  });
  it("da esquerda para a direita, nada se espelha", () => {
    montar(<NavList items={ITENS} />, "ltr");
    expect(espelhadas("View")).toBe(0);
  });
  it("o desenho que o app passa em chevron fica como veio", () => {
    montar(<NavList items={ITENS} chevron="arrow-right" />, "rtl");
    expect(espelhadas("View")).toBe(0);
  });
});

// O submenu: abre o menu como o aparelho (mede o gatilho, toca) e lê a seta do item que abre outro menu.
async function abrirMenu(direction: "ltr" | "rtl") {
  montar(<DropdownMenu testID="m" label="Actions" trigger={<Button testID="gatilho">Open</Button>}
    items={[{label: "Rename"}, {kind: "submenu", label: "Export", items: [{label: "PDF"}]}]} />, direction);
  await act(async () => {});
  await act(async () => {
    const g = __instancias("Pressable").findLast((p) => p.testID === "gatilho")!;
    (g.ref as (n: unknown) => void)({measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(120, 200, 120, 48)});
    (g.onPress as (e: unknown) => void)({nativeEvent: {pageX: 33, pageY: 44}});
  });
  await act(async () => {
    const painel = __instancias("Animated.View").findLast((p) => p.testID === "m-painel")!;
    (painel.onLayout as (e: unknown) => void)({nativeEvent: {layout: {x: 0, y: 0, width: 200, height: 160}}});
  });
}

describe("submenu do DropdownMenu: a seta aponta para onde se lê", () => {
  it("direction=\"rtl\": a seta do item que abre outro menu se espelha", async () => {
    await abrirMenu("rtl");
    // o dublê guarda cada desenho da peça (o menu se redesenha ao abrir): conta-se se há seta espelhada, não quantas
    expect(espelhadas("Animated.View")).toBeGreaterThan(0);
  });
  it("da esquerda para a direita, nada se espelha", async () => {
    await abrirMenu("ltr");
    expect(espelhadas("Animated.View")).toBe(0);
  });
});
