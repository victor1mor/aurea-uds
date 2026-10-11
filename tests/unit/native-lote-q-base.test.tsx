// 0.32.0, passo 1 (a base), no nativo · o `CloseButton` e a escala de toque (ADR-0066).
// O dublê não calcula layout; prova-se o pedido ao motor. A prova de aparelho é o bloco 0.32 do
// `apps/native-smoke`.
// Provado contra o defeito: sem o `CloseButton` não há o que importar; sem o `touchControlHSm`, o
// círculo sai com `undefined` de lado; sem o peso `bold`, o registro entrega o `x` regular.
import {render} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, CloseButton, criarRegistroDeIcones, ptBR, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"x": Glifo, "x-bold": Glifo});
const Envolve = ({children, strings}: {children: React.ReactNode; strings?: typeof ptBR}) =>
  <AureaProvider icons={ICONES} strings={strings}>{children}</AureaProvider>;
const botao = () => __instancias("Pressable").at(-1)!;
const estilo = () => StyleSheet.flatten(botao().style);

describe("a escala de toque do nativo (ADR-0066)", () => {
  it("confortável: 40 · 48 · 56, como o pacote nativo da referência", () => {
    expect([t.size.touchControlHSm, t.size.touchControlHMd, t.size.touchControlHLg]).toEqual([40, 48, 56]);
  });
  it("compacto e espaçoso andam 4, como na web", () => {
    const c = resolverTokens("dark", "compact"), e = resolverTokens("dark", "spacious");
    expect([c.size.touchControlHSm, c.size.touchControlHMd, c.size.touchControlHLg]).toEqual([36, 44, 52]);
    expect([e.size.touchControlHSm, e.size.touchControlHMd, e.size.touchControlHLg]).toEqual([44, 52, 60]);
  });
  it("a escala da web continua a dela: o md é 36", () => {
    expect(t.size.controlHMd).toBe(36);
  });
});

describe("CloseButton (nativo)", () => {
  it("é um botão que se chama \"Close\" sozinho, e \"Fechar\" em ptBR", () => {
    render(<Envolve><CloseButton /></Envolve>);
    expect(botao().accessibilityRole).toBe("button");
    expect(botao().accessibilityLabel).toBe("Close");
    render(<Envolve strings={ptBR}><CloseButton /></Envolve>);
    expect(botao().accessibilityLabel).toBe("Fechar");
  });
  it("um círculo de 40 no fundo neutro, com a área de toque estendida em 12", () => {
    render(<Envolve><CloseButton /></Envolve>);
    const e = estilo();
    expect([e.width, e.height]).toEqual([40, 40]);
    expect(e.borderRadius).toBe(t.size.radiusFull);
    expect(e.backgroundColor).toBe(t.color.secondary);
    expect(botao().hitSlop).toBe(12);
  });
  it("desenha o X do traço Bold, quando o app o registrou (e não o regular)", () => {
    const bold = vi.fn(), regular = vi.fn();
    const B = () => { bold(); return null; }, R = () => { regular(); return null; };
    render(<AureaProvider icons={criarRegistroDeIcones({"x": R, "x-bold": B})}><CloseButton /></AureaProvider>);
    expect(bold).toHaveBeenCalled();
    expect(regular).not.toHaveBeenCalled();
  });
  it("sem o `x-bold` no registro, cai no `x`", () => {
    const usados = vi.fn();
    const SoRegular = () => { usados(); return null; };
    render(<AureaProvider icons={criarRegistroDeIcones({"x": SoRegular})}><CloseButton /></AureaProvider>);
    expect(usados).toHaveBeenCalled();
  });
  it("`label` diz o que fecha, e desligado o leitor de tela sabe", () => {
    render(<Envolve><CloseButton label="Fechar aviso" disabled /></Envolve>);
    expect(botao().accessibilityLabel).toBe("Fechar aviso");
    expect(botao().accessibilityState).toMatchObject({disabled: true});
  });
});
