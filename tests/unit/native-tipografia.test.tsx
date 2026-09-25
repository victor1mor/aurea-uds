// B-02 no NATIVO · o papel (`type`) e os atalhos `Heading`, `Paragraph` e `Code`, no molde do
// `Typography` do HeroUI Native 1.0.10. As entradas foram escolhidas para reprovar se o papel não
// existir: `body-sm` tem de dar 14 (o token direto, como o HeroUI Native), e não os 16 que o
// `size="sm"` dá (o degrau a mais da ADR-0050). E o `Text` sem `type` tem de continuar igual.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Code, Heading, Paragraph, Text, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const ultimo = () => __instancias("Text").at(-1) ?? {};
const estilo = () => StyleSheet.flatten(ultimo().style);

describe("B-02 · nativo · o papel do Text", () => {
  it("h2: o 3xl, seminegrito, entrelinha curta e letras juntas", () => {
    render(<Envolve><Text type="h2">Relatórios</Text></Envolve>);
    const e = estilo();
    expect(e.fontSize).toBe(t.size.text3xl);
    expect(e.fontFamily).toBe(t.font.ui[600]);
    expect(e.lineHeight).toBe(t.size.text3xl * t.size.leadingTight);
    expect(e.letterSpacing).toBe(t.size.text3xl * t.tracking.trackingTight);
  });

  it("body-sm é 14, o token direto — não os 16 do size=\"sm\"", () => {
    render(<Envolve><Text type="body-sm">apoio</Text></Envolve>);
    expect(estilo().fontSize).toBe(t.size.textSm);
    render(<Envolve><Text size="sm">apoio</Text></Envolve>);
    expect(estilo().fontSize).toBe(t.size.textBase);
    expect(t.size.textSm).not.toBe(t.size.textBase);
  });

  it("sem type nada muda: md, peso 400, entrelinha normal", () => {
    render(<Envolve><Text>corpo</Text></Envolve>);
    const e = estilo();
    expect(e.fontSize).toBe(t.size.textBase);
    expect(e.fontFamily).toBe(t.font.ui[400]);
    expect(e.lineHeight).toBe(t.size.textBase * t.size.leadingNormal);
    expect(e.letterSpacing).toBeUndefined();
  });

  it("uma opção solta passada junto vale por cima do papel", () => {
    render(<Envolve><Text type="h1" size="lg" weight={700}>x</Text></Envolve>);
    const e = estilo();
    expect(e.fontSize).toBe(t.size.textLg);
    expect(e.fontFamily).toBe(t.font.ui[700]);
  });
});

describe("B-02 · nativo · Heading, Paragraph e Code", () => {
  it("Heading marca o papel de título para o leitor de tela e começa no h1", () => {
    render(<Envolve><Heading>Início</Heading></Envolve>);
    expect(ultimo().accessibilityRole).toBe("header");
    expect(estilo().fontSize).toBe(t.size.text4xl);
    render(<Envolve><Heading type="h4">Seção</Heading></Envolve>);
    expect(estilo().fontSize).toBe(t.size.textXl);
  });

  it("Paragraph: três tamanhos, cor apagada, alinhamento e corte", () => {
    render(<Envolve><Paragraph type="body-xs" color="muted" align="end" truncate>nota</Paragraph></Envolve>);
    const e = estilo();
    expect(e.fontSize).toBe(t.size.textXs);
    expect(e.lineHeight).toBe(t.size.textXs * t.size.leadingRelaxed);
    expect(e.color).toBe(t.color.mutedForeground);
    expect(e.textAlign).toBe("right");
    expect(ultimo().numberOfLines).toBe(1);
    expect(ultimo().accessibilityRole).toBeUndefined();
  });

  it("Code: fonte mono, fundo e canto do code da web", () => {
    render(<Envolve><Code>npm i</Code></Envolve>);
    const e = estilo();
    expect(e.fontFamily).toBe(t.font.code[400]);
    expect(e.fontSize).toBe(t.size.textSm);
    expect(e.backgroundColor).toBe(t.color.surface2);
    expect(e.borderRadius).toBe(t.size.radiusXs);
  });

  it("peso por nome: semibold é o 600", () => {
    render(<Envolve><Paragraph weight="semibold">x</Paragraph></Envolve>);
    expect(estilo().fontFamily).toBe(t.font.ui[600]);
  });
});
