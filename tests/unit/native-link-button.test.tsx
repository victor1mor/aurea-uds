// E9 (0.12.1) · o botão sem fundo guardava o recuo dos lados (15 no `md`) e a borda transparente
// de 1, e o texto começava 16 para dentro dos rótulos e campos da mesma coluna. O `LinkButton` é
// o do HeroUI Native (1.0.10): `Button` ghost com `height: auto; padding: 0` e sem borda. O dublê
// não calcula layout; prova-se o pedido ao motor. A prova de aparelho é o bloco E9 do native-smoke.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Button, LinkButton, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const caixa = () => StyleSheet.flatten(__instancias("View").find((v) =>
  StyleSheet.flatten(v.style)?.borderRadius === t.size.radiusControl)?.style);
const alvo = () => StyleSheet.flatten(__instancias("Pressable").at(-1)?.style);

describe("E9 · LinkButton: o texto encosta na margem", () => {
  it.each(["xs", "sm", "md", "lg", "xl"] as const)("%s: sem recuo dos lados, sem borda e sem altura fixa", (size) => {
    render(<Envolve><LinkButton size={size}>Escolher pela marca</LinkButton></Envolve>);
    const c = caixa();
    expect(c.paddingHorizontal).toBe(0);
    expect(c.borderWidth).toBe(0);
    expect(c.height).toBeUndefined();
    expect(c.backgroundColor).toBe("transparent");
  });
  it("a área de toque continua com o alvo mínimo de 44", () => {
    render(<Envolve><LinkButton>Não encontrei. Cadastrar à mão</LinkButton></Envolve>);
    expect(alvo().minHeight).toBe(t.size.targetMin);
  });
  it("é um botão para o leitor de tela, e desligado continua anunciado", () => {
    render(<Envolve><LinkButton disabled>Escolher pela marca</LinkButton></Envolve>);
    const p = __instancias("Pressable").at(-1)!;
    expect(p.accessibilityRole).toBe("button");
    expect(p.accessibilityState).toMatchObject({disabled: true});
  });
  it("o Button sem fundo não muda: continua com o recuo dele", () => {
    render(<Envolve><Button appearance="ghost">Cancelar</Button></Envolve>);
    expect(caixa().paddingHorizontal).toBeGreaterThan(0);
    expect(caixa().height).toBe(t.size.controlHMd);
  });
});
