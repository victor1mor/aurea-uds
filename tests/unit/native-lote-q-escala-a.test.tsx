// 0.32.0, passo 9a · o nativo ganha a escala de toque da referência ("sim, aprovo a escala de 48 no
// nativo"): `Button`, `IconButton` e `LinkButton` em 40 · 48 · 56; o `Spinner` em 16 · 24 · 32 com o
// `md` de padrão; o `Alert` e o `Toast` com as medidas do nativo da referência, e o `Alert` com a
// pintura da web desta versão (fundo de cartão, sem borda, sombra; o estado só no ícone e no título).
// O dublê não calcula layout; prova-se o pedido ao motor. A prova de aparelho é o bloco 0.32 do
// `apps/native-smoke`.
// Provado contra o defeito: com o código da 0.31.0 (`controlH*`, recheio 12 · 15 · 20, `Spinner` no
// `sm`, `Alert` tingido com borda e X de `IconButton`, `Toast` com 14 e seminegrito), todos reprovam.
import {act, cleanup, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {
  Alert, AureaProvider, Button, IconButton, LinkButton, Spinner, ToastHost,
  criarRegistroDeIcones, resolverTokens, useToast, type AureaButtonSize,
} from "../../packages/native/src/index.js";
import {folgaDoToque} from "../../packages/native/src/actions.js";

const t = resolverTokens("dark", "comfortable");
// Uma família por peso, como no aparelho: sem isto os pesos caem na mesma família crua, e o peso
// médio não se distinguiria do seminegrito no estilo.
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};
// O glifo anota o lado que recebeu: é assim que se lê o tamanho do ícone dentro do botão.
let lados: number[] = [];
const Glifo = ({size}: {size?: number}) => { lados.push(size ?? -1); return null; };
const ICONES = criarRegistroDeIcones({
  "plus": Glifo, "x": Glifo, "x-bold": Glifo, "info": Glifo, "info-fill": Glifo,
  "check-circle": Glifo, "check-circle-fill": Glifo, "warning": Glifo, "warning-fill": Glifo,
  "x-circle": Glifo, "x-circle-fill": Glifo,
} as never);
const Envolve = ({children, density}: {children: React.ReactNode; density?: "compact" | "comfortable" | "spacious"}) =>
  <AureaProvider icons={ICONES} fontFamilies={FONTES} density={density}>{children}</AureaProvider>;

type Estilo = Record<string, unknown>;
const plano = (p: {style?: unknown}) => (StyleSheet.flatten(p.style as never) ?? {}) as Estilo;
const textoDe = (s: string) => plano(__instancias("Text").find((p) => p.children === s)!);
// A caixa que pinta o botão: o `View` com altura e recheio dos lados.
const caixa = () => __instancias("View").map(plano).find((e) => e.paddingHorizontal !== undefined && "height" in e)!;

function botao(size?: AureaButtonSize, density?: "compact") {
  __limpar(); lados = [];
  render(<Envolve density={density}><Button size={size} leadingIcon="plus">Salvar</Button></Envolve>);
  const c = caixa(), txt = textoDe("Salvar");
  const r = {altura: c.height, recheio: c.paddingHorizontal, vao: c.gap,
    letra: txt.fontSize, familia: txt.fontFamily, icone: lados[0]};
  cleanup();
  return r;
}

describe("Button · a escala de toque da referência", () => {
  // [tamanho, altura, recheio dos lados, vão, letra, ícone]. sm/md/lg são os do pacote nativo da
  // referência; xs e xl são só da Aurea.
  const ESCALA = [
    ["xs", 32, 12, 6, 14, 16],
    ["sm", 40, 14, 6, 14, 16],
    ["md", 48, 16, 8, 16, 20],
    ["lg", 56, 20, 10, 18, 24],
    ["xl", 64, 24, 10, 18, 24],
  ] as const;
  it.each(ESCALA)("%s: altura %i, %i dos lados, vão %i, letra %i em peso médio, ícone %i",
    (size, altura, recheio, vao, letra, icone) => {
      expect(botao(size)).toEqual({altura, recheio, vao, letra, familia: "Ui500", icone});
    });

  it("as alturas saem dos tokens de toque (e o xs do `controlHSm`, o xl do lg + space2)", () => {
    expect(botao("xs").altura).toBe(t.size.controlHSm);
    expect(botao("sm").altura).toBe(t.size.touchControlHSm);
    expect(botao("md").altura).toBe(t.size.touchControlHMd);
    expect(botao("lg").altura).toBe(t.size.touchControlHLg);
    expect(botao("xl").altura).toBe(t.size.touchControlHLg + t.size.space2);
  });

  it("o padrão é o md (48)", () => {
    expect(botao().altura).toBe(48);
  });

  it("acompanha a densidade: no compacto o md tem 44", () => {
    expect(botao("md", "compact").altura).toBe(resolverTokens("dark", "compact").size.touchControlHMd);
    expect(botao("md", "compact").altura).toBe(44);
  });

  it("a área de toque continua com pelo menos 44 no sm (40)", () => {
    render(<Envolve><Button size="sm">Salvar</Button></Envolve>);
    expect(plano(__instancias("Pressable").at(-1)!).minHeight).toBe(t.size.targetMin);
  });
});

describe("IconButton · o círculo tem a altura do botão do mesmo tamanho", () => {
  const circulo = () => __instancias("View").map(plano).find((e) => e.width !== undefined && e.width === e.height && e.paddingHorizontal === 0)!;
  it.each([["sm", 40, 16], ["md", 48, 20], ["lg", 56, 24]] as const)("%s: círculo de %i, ícone de %i", (size, lado, icone) => {
    lados = [];
    render(<Envolve><IconButton size={size} name="plus" label="Somar" /></Envolve>);
    expect([circulo().width, circulo().height]).toEqual([lado, lado]);
    expect(lados[0]).toBe(icone);
    // O alvo é o maior entre o desenho e o `targetMin`: no md já é o próprio círculo.
    expect(plano(__instancias("Pressable").at(-1)!).width).toBe(Math.max(lado, t.size.targetMin));
  });

  it("a folga do toque em volta do círculo (o `Badge` preso usa): 0 no md, 2 no sm", () => {
    expect(folgaDoToque(t, "md")).toBe(0);
    expect(folgaDoToque(t, "sm")).toBe(2);
  });
});

describe("LinkButton · a letra segue a escala, sem caixa", () => {
  it("lg: letra 18 em peso médio, sem altura e sem recheio", () => {
    render(<Envolve><LinkButton size="lg">Cadastrar à mão</LinkButton></Envolve>);
    const txt = textoDe("Cadastrar à mão");
    expect([txt.fontSize, txt.fontFamily]).toEqual([18, "Ui500"]);
    const c = __instancias("View").map(plano).find((e) => e.paddingHorizontal === 0 && e.borderWidth === 0)!;
    expect(c.height).toBeUndefined();
  });
});

describe("Spinner · 16 · 24 · 32, e o padrão é o md", () => {
  const lado = () => plano(__instancias("Animated.View").at(-1)!).width;
  it("sem `size`, 24", () => {
    render(<Envolve><Spinner /></Envolve>);
    expect(lado()).toBe(24);
  });
  it.each([["sm", 16], ["md", 24], ["lg", 32]] as const)("%s: %i", (size, px) => {
    render(<Envolve><Spinner size={size} /></Envolve>);
    expect(lado()).toBe(px);
    expect(plano(__instancias("Animated.View").at(-1)!).height).toBe(px);
  });
});

describe("Alert · as medidas do nativo da referência e a pintura da web", () => {
  const moldura = () => plano(__instancias("View").find((p) => p.accessibilityLiveRegion !== undefined)!);

  it("12 de recheio em volta e 12 entre as partes", () => {
    render(<Envolve><Alert title="Salvo">Tudo certo.</Alert></Envolve>);
    const m = moldura();
    expect(m.padding).toBe(t.size.space3);
    expect(m.padding).toBe(12);
    expect(m.paddingVertical).toBeUndefined();
    expect(m.paddingHorizontal).toBeUndefined();
    expect(m.gap).toBe(12);
  });

  it.each(["info", "success", "warning", "danger"] as const)(
    "%s: fundo de cartão, sem borda, com a sombra de superfície inteira", (variant) => {
      render(<Envolve><Alert variant={variant} title="Aviso">Corpo.</Alert></Envolve>);
      const m = moldura();
      expect(m.backgroundColor).toBe(t.color.card);
      expect(m.borderWidth ?? 0).toBe(0);
      expect(m.boxShadow).toEqual([...t.shadowLayers.shadowSm]);
      expect(m.borderRadius).toBe(t.size.radiusCard);
    });

  it.each([
    ["info", t.color.info400 ?? t.color.info],
    ["success", t.color.success400 ?? t.color.success],
    ["warning", t.color.warning400 ?? t.color.warning],
    ["danger", t.color.danger400 ?? t.color.destructive],
  ] as const)("%s: o título é 16 em peso médio, na cor do estado; a descrição, 14 esmaecida", (variant, cor) => {
    render(<Envolve><Alert variant={variant} title="Aviso">Corpo.</Alert></Envolve>);
    const titulo = textoDe("Aviso"), corpo = textoDe("Corpo.");
    expect([titulo.fontSize, titulo.fontFamily, titulo.color]).toEqual([16, "Ui500", cor]);
    expect(titulo.lineHeight).toBe(16 * t.size.leadingNormal);
    expect([corpo.fontSize, corpo.color]).toEqual([14, t.color.mutedForeground]);
  });

  it("o X de fechar é o `CloseButton`: círculo neutro de 40, toque estendido em 12", () => {
    render(<Envolve><Alert title="Aviso" onDismiss={() => {}}>Corpo.</Alert></Envolve>);
    const x = __instancias("Pressable").find((p) => p.accessibilityLabel === "Close")!;
    const e = plano(x);
    expect([e.width, e.height, e.backgroundColor]).toEqual([40, 40, t.color.secondary]);
    expect(x.hitSlop).toBe(t.size.space3);
  });
});

describe("Toast · 16 de recheio e o título em peso médio", () => {
  it("o aviso tem 16 de recheio; o título, 16 em peso médio", () => {
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost><Usa /></ToastHost></Envolve>);
    act(() => { gerente!.add({title: "Salvo"}); });
    const aviso = plano(__instancias("Animated.View").find((p) => String(p.testID ?? "").startsWith("toast-"))!);
    expect(aviso.padding).toBe(t.size.space4);
    expect(aviso.padding).toBe(16);
    const titulo = textoDe("Salvo");
    expect([titulo.fontSize, titulo.fontFamily]).toEqual([16, "Ui500"]);
  });
});
