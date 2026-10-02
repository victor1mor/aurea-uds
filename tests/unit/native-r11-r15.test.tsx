// R-11 e R-15 (02/10/2026) · do jeito do HeroUI, que não usa nome de ícone nem tem tamanho pronto:
// o app passa o próprio desenho.
//   R-11 · toda prop de ícone aceita o NOME de um glifo ou o próprio DESENHO (`AureaIcon`). O tipo
//          é provado pela sonda `tipos-nativo/icone-componente.tsx`; aqui, que o desenho aparece.
//   R-15 · o glifo do `EmptyState` ganha uma moldura redonda (a "C" da prancha de 02/10/2026,
//          escolhida pelo Victor): 64 de moldura, o `Avatar` `lg` do HeroUI, e o glifo de 32 de antes.
// Provado contra o defeito: com o código de antes, o desenho passado direto não aparece (o `Icon`
// procurava a função no registro e não desenhava nada), e o glifo do vazio saía solto, sem
// moldura, na cor `subtleForeground`.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, View, __instancias} from "./native-stubs/react-native";
import {
  AureaProvider, BottomNav, EmptyState, Icon, IconButton, criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
// Desenhos de mentira que só anotam o que receberam: o nome sai do testID.
const desenho = (nome: string) => ({size, color}: {size?: number; color?: string}) =>
  <View testID={`desenho-${nome}`} style={{width: size, height: size, backgroundColor: color}} />;
const Logo = desenho("logo");
const vistos = (nome: string) => __instancias("View").filter((p) => p.testID === `desenho-${nome}`);
const estilo = (p: Record<string, unknown>) => StyleSheet.flatten(p.style) ?? {};

describe("R-11 · o ícone pode ser o próprio desenho do app", () => {
  it("o Icon desenha o componente direto, sem registro, no tamanho e na cor pedidos", () => {
    render(<AureaProvider><Icon name={Logo} size="xl" color="#ff0000" /></AureaProvider>);
    const e = estilo(vistos("logo").at(-1)!);
    expect(e.width).toBe(t.size.iconXl);
    expect(e.backgroundColor).toBe("#ff0000");
  });
  it("sem cor, o desenho recebe a cor do texto do tema, como o glifo do registro", () => {
    render(<AureaProvider><Icon name={Logo} /></AureaProvider>);
    expect(estilo(vistos("logo").at(-1)!).backgroundColor).toBe(t.color.foreground);
  });
  it("o desenho direto vence o registro mesmo quando há um registro em contexto", () => {
    const ICONES = criarRegistroDeIcones({plus: desenho("plus")});
    render(<AureaProvider icons={ICONES}><Icon name={Logo} /><Icon name="plus" /></AureaProvider>);
    expect(vistos("logo").length).toBeGreaterThan(0);
    expect(vistos("plus").length).toBeGreaterThan(0);
  });
  it("chega às peças: o item do BottomNav e o IconButton desenham o logotipo", () => {
    render(
      <AureaProvider>
        <BottomNav current="a" items={[{id: "a", label: "Início", icon: Logo}]} />
        <IconButton name={desenho("botao")} label="Início" />
      </AureaProvider>);
    expect(vistos("logo").length).toBeGreaterThan(0);
    expect(vistos("botao").length).toBeGreaterThan(0);
  });
});

describe("R-15 · o glifo do EmptyState numa moldura redonda", () => {
  const moldura = () => __instancias("View").map(estilo).filter((e) =>
    e.width === t.size.space16 && e.height === t.size.space16 && e.borderRadius === t.size.radiusFull);
  it("a moldura tem 64 (o `space16`), é redonda e tem o fundo `muted`", () => {
    render(<AureaProvider><EmptyState title="Nada aqui" icon={Logo} /></AureaProvider>);
    const m = moldura();
    expect(m).toHaveLength(1);
    expect(m[0].backgroundColor).toBe(t.color.muted);
  });
  it("o glifo continua com 32 (o `iconXl`) e passa à cor `mutedForeground`", () => {
    render(<AureaProvider><EmptyState title="Nada aqui" icon={Logo} /></AureaProvider>);
    const e = estilo(vistos("logo").at(-1)!);
    expect(e.width).toBe(t.size.iconXl);
    expect(e.backgroundColor).toBe(t.color.mutedForeground);
  });
  it("sem `icon`, a moldura leva o `file` de sempre", () => {
    const ICONES = criarRegistroDeIcones({file: desenho("file")});
    render(<AureaProvider icons={ICONES}><EmptyState title="Nada aqui" /></AureaProvider>);
    expect(estilo(vistos("file").at(-1)!).width).toBe(t.size.iconXl);
    expect(moldura()).toHaveLength(1);
  });
});
