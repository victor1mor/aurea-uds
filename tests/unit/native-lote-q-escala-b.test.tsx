// 0.32.0, passo 9a — os campos e controles do nativo na escala de toque do pacote NATIVO da
// referência (lida no pacote publicado dela; a escala de 48 aprovada pelo Victor, ADR-0066:
// *"sim, aprovo a escala de 48 no nativo"*).
//
// O dublê não calcula layout; prova-se o pedido ao motor. Cada `it` reprova o código de antes — o
// número antigo vai anotado ao lado. A prova de aparelho é o bloco 0.32 do `apps/native-smoke`.
import {render} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {
  AureaProvider, Checkbox, Combobox, Field, Input, InputGroup, NumberField, Radio, SearchField, Select,
  Switch, Textarea, comOpacidade, criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";
import {DatePicker} from "../../packages/native/src/sistema.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
// O `check` é um dublê que registra com que tamanho e cor foi desenhado: é o indicador da escolhida.
const Check = vi.fn((_p: {size?: number; color?: string}) => null);
const ICONES = criarRegistroDeIcones({
  "caret-down": Glifo as never, "magnifying-glass": Glifo as never, "x": Glifo as never,
  "calendar": Glifo as never, "plus": Glifo as never, "minus": Glifo as never, "check": Check as never,
});
// Uma família por peso, como no aparelho: é a família que diz o peso no nativo, não o `fontWeight`.
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};
type Estilo = Record<string, unknown>;
const plano = (s: unknown) => (StyleSheet.flatten(s as never) ?? {}) as Estilo;
const montar = (no: React.ReactNode, density: "compact" | "comfortable" | "spacious" = "comfortable") => {
  __limpar();
  Check.mockClear();
  return render(<AureaProvider icons={ICONES} fontFamilies={FONTES} density={density}>{no}</AureaProvider>);
};
const campo = () => plano(__instancias("TextInput").at(-1)!.style);
const porId = (primitivo: string, id: string) =>
  plano(__instancias(primitivo).filter((p) => p.testID === id).at(-1)!.style);
const texto = (conteudo: string) => {
  const p = __instancias("Text").filter((x) => x.children === conteudo).at(-1);
  if (!p) throw new Error(`texto "${conteudo}" não desenhado`);
  return plano(p.style);
};
const views = () => __instancias("View").map((p) => plano(p.style));

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("o campo de texto: 48 de altura, 12 dos lados, letra 16 regular", () => {
  it("Input md: 48 (era 36) e 12 dos lados (era 13)", () => {
    montar(<Input />);
    const e = campo();
    expect(e.height).toBe(t.size.touchControlHMd);
    expect(e.height).toBe(48);
    expect(e.paddingHorizontal).toBe(t.size.space3);
    expect(e.fontSize).toBe(16);
    expect(e.fontFamily).toBe("Ui400");
  });
  it("sm 40 e lg 56 (eram 32 e 40); o respiro deles continua 12 e 16", () => {
    montar(<Input size="sm" />);
    expect([campo().height, campo().paddingHorizontal]).toEqual([40, t.size.space3]);
    montar(<Input size="lg" />);
    expect([campo().height, campo().paddingHorizontal]).toEqual([56, t.size.space4]);
  });
  it("anda com a densidade: o compacto é 44 (era 32)", () => {
    montar(<Input />, "compact");
    expect(campo().height).toBe(resolverTokens("dark", "compact").size.touchControlHMd);
    expect(campo().height).toBe(44);
  });
  it("o grupo (e com ele o `PasswordField`) tem a mesma caixa: 48 e 12 (era 36 e 13)", () => {
    montar(<InputGroup testID="g"><Input /></InputGroup>);
    const e = porId("View", "g");
    expect([e.height, e.paddingHorizontal]).toEqual([48, t.size.space3]);
  });
  it("SearchField: 48 e 12 (era 36 e 13)", () => {
    montar(<SearchField testID="sf" />);
    const e = porId("View", "sf");
    expect([e.height, e.paddingHorizontal]).toEqual([48, t.size.space3]);
  });
  it("NumberField: o campo tem 48 no md e 40 no sm (eram 36 e 32); o `display` sobe para o degrau acima do `lg` (64)", () => {
    montar(<NumberField testID="nf" value={1} />);
    expect(porId("TextInput", "nf-campo").height).toBe(48);
    montar(<NumberField testID="nf" value={1} size="sm" />);
    expect(porId("TextInput", "nf-campo").height).toBe(40);
    montar(<NumberField testID="nf" value={1} size="display" />);
    expect(porId("TextInput", "nf-campo").height).toBe(t.size.touchControlHLg + t.size.space2);
  });
  it("DatePicker: o gatilho é campo — 48 e 12 dos lados (era 36 e 13)", () => {
    montar(<DatePicker testID="dp" />);
    const e = porId("Pressable", "dp");
    expect([e.height, e.paddingHorizontal]).toEqual([48, t.size.space3]);
  });
});

describe("Textarea: a caixa alta da referência", () => {
  it("128 de altura mínima (era 104), 8 em cima e embaixo (era 12), 12 dos lados (era 13)", () => {
    montar(<Textarea />);
    const e = campo();
    expect(e.minHeight).toBe(t.size.space24 + t.size.space8);
    expect(e.minHeight).toBe(128);
    expect(e.paddingVertical).toBe(t.size.space2);
    expect(e.paddingHorizontal).toBe(t.size.space3);
    expect(e.height).toBeUndefined();
  });
});

describe("Field: o rótulo em peso médio", () => {
  it("rótulo 16 em peso MÉDIO (era 600); dica e erro continuam em 14", () => {
    montar(<Field label="E-mail" hint="O do trabalho"><Input /></Field>);
    expect(texto("E-mail").fontSize).toBe(16);
    expect(texto("E-mail").fontFamily).toBe("Ui500");
    expect(texto("O do trabalho").fontSize).toBe(14);
    montar(<Field label="E-mail" error="Obrigatório"><Input /></Field>);
    expect(texto("Obrigatório").fontSize).toBe(14);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
const marca = () => views().find((e) => e.borderWidth === t.size.borderWidth && e.width === e.height
  && typeof e.width === "number" && e.width > 0)!;
describe("Checkbox e Radio: a marca de 24 e o vão de 12", () => {
  it("Checkbox: caixa 24 × 24 (era 18), canto 6 do `radiusXs` (era 5), 12 até o texto (era 9)", () => {
    montar(<Checkbox label="Aceito" checked />);
    const m = marca();
    expect([m.width, m.height]).toEqual([24, 24]);
    expect(m.borderRadius).toBe(t.size.radiusXs);
    expect(plano(__instancias("Pressable").at(-1)!.style).gap).toBe(t.size.space3);
  });
  it("Radio: círculo 24 (era 18), ponto 10 (era 8), 12 até o texto (era 9)", () => {
    montar(<Radio label="Diário" checked />);
    const m = marca();
    expect([m.width, m.height]).toEqual([24, 24]);
    expect(m.borderRadius).toBe(t.size.radiusFull);
    const ponto = views().find((e) => e.backgroundColor === t.color.controlSelectedForeground);
    expect([ponto?.width, ponto?.height]).toEqual([10, 10]);
    expect(plano(__instancias("Pressable").at(-1)!.style).gap).toBe(t.size.space3);
  });
});

describe("Switch: o interruptor da referência", () => {
  it("trilho 48 × 24 (era 42 × 24)", () => {
    montar(<Switch label="Lembrar" />);
    // Sem linha (ADR-0072): o trilho desligado é a cor do texto a 20%.
    const trilho = views().find((e) => e.backgroundColor === comOpacidade(t.color.foreground, 0.2) && e.borderRadius === t.size.radiusFull);
    expect([trilho?.width, trilho?.height]).toEqual([48, 24]);
  });
  it("bolinha em CÁPSULA de 28 × 20 (era redonda de 18), a 2 da borda de fora", () => {
    montar(<Switch label="Lembrar" />);
    const b = plano(__instancias("Animated.View").at(-1)!.style);
    expect([b.width, b.height]).toEqual([28, 20]);
    expect(b.borderRadius).toBe(t.size.radiusFull);
    // `left` conta de dentro da borda do trilho: 1 + a borda de 1 = 2 da borda de fora (era 3).
    expect(b.left).toBe(t.size.space05 - t.size.borderWidth);
  });
  it("ligada, anda 16 até a outra ponta, deixando os mesmos 2 (era 18)", () => {
    montar(<Switch label="Lembrar" checked />);
    const b = plano(__instancias("Animated.View").at(-1)!.style);
    const desloca = (b.transform as Array<{translateX: {__interpolado: number[]}}>)[0].translateX.__interpolado;
    expect(desloca).toEqual([0, 16]);
  });
  it("12 até o texto (era 10)", () => {
    montar(<Switch label="Lembrar" testID="sw" />);
    expect(porId("Pressable", "sw").gap).toBe(t.size.space3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
const ITENS = [{value: "a", label: "Alfa"}, {value: "b", label: "Beta"}];
const opcoes = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "menuitem");
const indicadores = () => views().filter((e) => e.width === t.size.iconMd && e.height === t.size.iconMd);

describe("Select: o gatilho e a opção da referência", () => {
  it("gatilho: 48 de altura (era 36), 16 dos lados (era 13), 12 entre o valor e a seta (era nada)", () => {
    montar(<Select testID="s" items={ITENS} value="a" />);
    const e = porId("Pressable", "s");
    expect([e.height, e.paddingHorizontal, e.gap]).toEqual([48, t.size.space4, t.size.space3]);
    expect(texto("Alfa").fontSize).toBe(16);
  });
  it("opção: 12 em cima e embaixo, 8 dos lados, 8 de vão, 48 de toque (era controlHLg 40 e 16 dos lados)", () => {
    montar(<Select items={ITENS} value="a" />);
    const e = plano(opcoes()[0].style);
    expect([e.paddingVertical, e.paddingHorizontal, e.gap]).toEqual([t.size.space3, t.size.space2, t.size.space2]);
    expect(e.minHeight).toBe(t.size.touchControlHMd);
    expect(e.flexDirection).toBe("row");
  });
  it("rótulo da opção 16 em peso médio em todas (a escolhida era 600, as outras 400)", () => {
    montar(<Select items={ITENS} value="a" />);
    const rotulos = __instancias("Text").filter((p) => p.children === "Alfa" || p.children === "Beta")
      .map((p) => plano(p.style)).slice(-2);
    for (const r of rotulos) expect([r.fontSize, r.fontFamily]).toEqual([16, "Ui500"]);
  });
  it("só a escolhida leva o indicador: a caixa de 20 com o `check` de 16 no destaque (era nada)", () => {
    montar(<Select items={ITENS} value="a" />);
    expect(indicadores()).toHaveLength(1);
    expect(Check).toHaveBeenCalled();
    expect(Check.mock.calls.at(-1)![0]).toMatchObject({size: t.size.iconSm, color: t.color.primaryEmphasis});
  });
});

describe("Combobox: o gatilho e a folha iguais aos do Select", () => {
  // A moldura do gatilho: a caixa de borda em linha, com altura — a da folha é a que tem `margin`.
  const caixa = () => views().find((e) => e.flexDirection === "row" && e.borderWidth === t.size.borderWidth
    && typeof e.height === "number" && e.margin == null)!;
  it("gatilho: 48 (era 36), 16 dos lados (era 13), 12 entre o texto e as ações (era nada)", () => {
    montar(<Combobox items={ITENS} value={ITENS[0]} />);
    const e = caixa();
    expect([e.height, e.paddingHorizontal, e.gap]).toEqual([48, t.size.space4, t.size.space3]);
  });
  it("o campo de busca da folha também tem 48 (era 36)", () => {
    montar(<Combobox items={ITENS} />);
    expect(views().find((e) => e.margin === t.size.space3)?.height).toBe(48);
  });
  it("opção: a mesma do Select, com o rótulo em peso médio e o indicador só na escolhida", () => {
    montar(<Combobox items={ITENS} value={ITENS[1]} />);
    const e = plano(opcoes()[0].style);
    expect([e.paddingVertical, e.paddingHorizontal, e.gap]).toEqual([t.size.space3, t.size.space2, t.size.space2]);
    expect(e.minHeight).toBe(t.size.touchControlHMd);
    expect(texto("Alfa").fontFamily).toBe("Ui500");
    expect(indicadores()).toHaveLength(1);
    expect(Check.mock.calls.at(-1)![0]).toMatchObject({size: t.size.iconSm, color: t.color.primaryEmphasis});
  });
});
