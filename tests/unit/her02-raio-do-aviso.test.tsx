// HER-02 (06/10/2026) · o `Alert` e o `Toast` tinham 16 de canto (`radius-lg`), nos dois alvos. A
// identidade da Aurea (`CLAUDE.md` §5) diz *"superfícies flutuantes; cartões, janelas e painéis com
// raio 22px"*, e o `Popover`, o `Dialog` e o `Banner` já usavam 22. Os dois eram os de fora. A
// referência, na web e no nativo, usa 24 nos dois; o 22 é o da casa.
// Provado contra o defeito: com `--radius-lg`/`radiusLg` de volta, os quatro testes reprovam.
import {render, act} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {readFileSync} from "node:fs";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {Alert, AureaProvider, ToastHost, resolverTokens, useToast} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const regra = (seletor: string) => {
  const i = css.indexOf(`${seletor} {`);
  return css.slice(i, css.indexOf("}", i));
};
const estilos = () => [...__instancias("View"), ...__instancias("Animated.View")]
  .map((p) => (StyleSheet.flatten(p.style) ?? {}) as Record<string, unknown>);

describe("HER-02 · a web", () => {
  it.each([".alert", ".toast"])("`%s` usa o raio de painel, `--radius-card`", (seletor) => {
    expect(regra(seletor)).toContain("border-radius:var(--radius-card)");
  });
});

describe("HER-02 · o nativo", () => {
  // A moldura do `Alert` é a caixa com a região viva, em todas as variantes. Até a 0.31.0 este teste
  // a achava pelo recheio de 14 e pela borda; a 0.32.0 adotou as medidas do nativo da referência
  // (12 em volta) e a pintura da web desta versão (sem borda), e a moldura passou a ser achada pelo
  // que ela É, não pela medida que muda.
  it.each(["info", "warning", "danger"] as const)("o `Alert` (%s) usa `radiusCard`", (variant) => {
    render(<AureaProvider><Alert variant={variant}>Aviso</Alert></AureaProvider>);
    const viva = __instancias("View").find((p) => p.accessibilityLiveRegion != null);
    const moldura = viva ? (StyleSheet.flatten(viva.style) ?? {}) as Record<string, unknown> : undefined;
    expect(moldura?.borderRadius).toBe(t.size.radiusCard);
  });

  it("o `Toast` usa `radiusCard`", () => {
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<AureaProvider><ToastHost><Usa /></ToastHost></AureaProvider>);
    act(() => { gerente!.add({title: "Salvo"}); });
    // A moldura do aviso é a caixa de 360 de largura máxima (a `.toast-stack` da web).
    const aviso = estilos().find((e) => e.maxWidth === 360);
    expect(aviso?.borderRadius).toBe(t.size.radiusCard);
  });
});
