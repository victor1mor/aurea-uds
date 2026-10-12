// 0.32.0, passo 9a — o que a integração das três frentes acertou: a gaveta do nativo com a anatomia do
// `Dialog` (a da referência, como a gaveta da web desta versão), o aviso flutuante do nativo como o da
// web (o tipo pinta o ícone e o título, não o fundo; o X é o `CloseButton`), e o `NumberField display`
// no degrau acima do `lg`. Cada `it` reprova o código de antes (anotado ao lado).
import {render, act} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, Drawer, ToastHost, criarRegistroDeIcones, resolverTokens, useToast} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"x": Glifo as never, "x-bold": Glifo as never, "check-circle-fill": Glifo as never,
  "info-fill": Glifo as never, "warning-fill": Glifo as never, "x-circle-fill": Glifo as never});
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};
type Estilo = Record<string, unknown>;
const plano = (s: unknown) => (StyleSheet.flatten(s as never) ?? {}) as Estilo;
const montar = (no: React.ReactNode) => {
  __limpar();
  return render(<AureaProvider icons={ICONES} fontFamilies={FONTES}>{no}</AureaProvider>);
};
const texto = (conteudo: string) => {
  const p = __instancias("Text").find((x) => x.children === conteudo);
  if (!p) throw new Error(`texto "${conteudo}" não desenhado`);
  return {...p, e: plano(p.style)};
};

describe("Drawer · a anatomia do Dialog", () => {
  it("recheio de 20 (era 24 cru) e título 18 em peso médio (era 600)", () => {
    montar(<Drawer open title="Filtros" onClose={() => {}}>corpo</Drawer>);
    const gaveta = __instancias("View").map((p) => plano(p.style)).find((e) => e.maxWidth === 480)
      ?? __instancias("Animated.View").map((p) => plano(p.style)).find((e) => e.maxWidth === 480);
    expect(gaveta?.padding).toBe(t.size.space5);
    const titulo = texto("Filtros");
    expect([titulo.e.fontSize, titulo.e.fontFamily]).toEqual([18, "Ui500"]);
    expect(titulo.accessibilityRole).toBe("header");
  });
  it("o X é o `CloseButton` (círculo de 40 com toque estendido), no canto a 16 cheios", () => {
    montar(<Drawer open title="Filtros" onClose={() => {}}>corpo</Drawer>);
    const x = __instancias("Pressable").find((p) => p.accessibilityLabel === "Close")!;
    expect([plano(x.style).width, x.hitSlop]).toEqual([t.size.touchControlHSm, t.size.space3]);
    const canto = __instancias("View").map((p) => plano(p.style)).find((e) => e.position === "absolute" && e.top === t.size.space4);
    expect(canto?.right).toBe(t.size.space4);
  });
});

describe("Toast · o aviso flutuante como o da web", () => {
  function Gatilho({tipo}: {tipo: "success" | "danger"}) {
    const toast = useToast();
    React.useEffect(() => { toast.add({title: "Salvo", type: tipo}); }, []);
    return null;
  }
  const abrir = (tipo: "success" | "danger") => {
    __limpar();
    render(<AureaProvider icons={ICONES} fontFamilies={FONTES}><ToastHost><Gatilho tipo={tipo} /></ToastHost></AureaProvider>);
  };
  it("o fundo é o da janela em todo tipo (era o fundo de estado), e o título tem a cor do tipo", () => {
    act(() => abrir("success"));
    const aviso = __instancias("Animated.View").map((p) => plano(p.style)).find((e) => e.borderRadius === t.size.radiusCard);
    expect(aviso?.backgroundColor).toBe(t.color.popover);
    expect(texto("Salvo").e.color).toBe(t.color.success400 ?? t.color.success);
  });
  it("o X é o `CloseButton` (era um IconButton fantasma)", () => {
    act(() => abrir("danger"));
    const x = __instancias("Pressable").find((p) => p.accessibilityLabel === "Dismiss notification")!;
    expect(x).toBeDefined();
    expect([plano(x.style).width, x.hitSlop]).toEqual([t.size.touchControlHSm, t.size.space3]);
  });
});
