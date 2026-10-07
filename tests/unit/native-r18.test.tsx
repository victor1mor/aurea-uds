// R-18 (02/10/2026) · a `Timeline` do nativo, na proposta aprovada pela prancha (*"2 sim"*): a
// linha deixa de ser enfeite.
//   · `icon` — o glifo numa moldura redonda no lugar do ponto: 40 (o `Avatar` `sm` da referência
//     no nativo) com glifo de 20;
//   · `tone` — a cor da moldura, a mesma receita do `Badge`;
//   · `trailing` — o que vai à direita do título;
//   · `between` — o que aconteceu entre um item e o próximo, ao lado da linha.
// Provado contra o defeito: com o código de antes, nenhum dos quatro aparecia (o item ignorava as
// chaves que não conhecia) e o trilho ficava no centro do ponto, fora da moldura.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, View, __instancias} from "./native-stubs/react-native";
import {
  AureaProvider, Badge, Timeline, comOpacidade, resolverTokens,
} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const desenho = (nome: string) => ({size, color}: {size?: number; color?: string}) =>
  <View testID={`desenho-${nome}`} style={{width: size, height: size, backgroundColor: color}} />;
const Caixa = desenho("caixa");
const Moeda = desenho("moeda");
const vistos = (nome: string) => __instancias("View").filter((p) => p.testID === `desenho-${nome}`);
const estilo = (p: Record<string, unknown>) => StyleSheet.flatten(p.style) ?? {};
const views = () => __instancias("View").map(estilo);
const textos = () => __instancias("Text").map((p) => p.children).flat().filter((c) => typeof c === "string");
const molduras = () => views().filter((e) =>
  e.width === t.size.space10 && e.height === t.size.space10 && e.borderRadius === t.size.radiusFull
  && e.alignItems === "center");
const Palco = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;

const HISTORICO = [
  {title: "Pedido enviado", icon: Caixa, tone: "success" as const, trailing: "R$ 216,00",
   description: "28/09", between: "6 dias depois"},
  {title: "Pagamento", icon: Moeda, tone: "primary" as const, trailing: "R$ 460,00",
   description: "22/09", between: "9 dias depois"},
  {title: "Entrega", description: "13/09", between: "não aparece: é o último"},
];

describe("R-18 · a moldura no lugar do ponto", () => {
  it("o item com `icon` ganha a moldura de 40, com o glifo de 20", () => {
    render(<Palco><Timeline items={HISTORICO} /></Palco>);
    expect(molduras()).toHaveLength(2);
    expect(estilo(vistos("caixa").at(-1)!).width).toBe(t.size.iconMd);
  });
  it("o tom pinta a moldura como pinta o `Badge`: fundo suave e glifo forte", () => {
    render(<Palco><Timeline items={HISTORICO} /></Palco>);
    const [verde, amarela] = molduras();
    expect(verde.backgroundColor).toBe(t.color.successBg);
    expect(estilo(vistos("caixa").at(-1)!).backgroundColor).toBe(t.color.success400 ?? t.color.success);
    // O `primary` não tem fundo suave em token: é o do `.badge-primary` da web, o amarelo a 10%.
    expect(amarela.backgroundColor).toBe(comOpacidade(t.color.primary, 0.1));
    expect(estilo(vistos("moeda").at(-1)!).backgroundColor).toBe(t.color.primaryEmphasis);
  });
  it("sem `tone`, a moldura é `neutral`: fundo `muted`", () => {
    render(<Palco><Timeline items={[{title: "Entrega", icon: Caixa}]} /></Palco>);
    expect(molduras()[0].backgroundColor).toBe(t.color.muted);
  });
  it("por baixo da moldura vai a cor da superfície, para o trilho não aparecer através dela", () => {
    render(<Palco><Timeline items={HISTORICO} /></Palco>);
    const baixo = views().filter((e) => e.width === t.size.space10 && e.height === t.size.space10
      && e.backgroundColor === t.color.surface1);
    expect(baixo).toHaveLength(2);
  });
  it("com molduras, o trilho vai ao centro delas, e o ponto do item sem ícone também", () => {
    render(<Palco><Timeline items={HISTORICO} /></Palco>);
    const trilho = views().find((e) => e.position === "absolute" && e.width === t.size.borderWidth);
    expect(trilho?.left).toBe(t.size.space10 / 2);
    const colunaDoPonto = views().filter((e) => e.width === t.size.space10 && e.alignItems === "center"
      && e.height == null);
    expect(colunaDoPonto).toHaveLength(1);
  });
  it("sem nenhum `icon`, nada muda: ponto solto e trilho no centro dele", () => {
    render(<Palco><Timeline items={[{title: "a"}, {title: "b"}]} /></Palco>);
    expect(molduras()).toHaveLength(0);
    const trilho = views().find((e) => e.position === "absolute" && e.width === t.size.borderWidth);
    expect(trilho?.left).toBe(t.size.space3 / 2);
  });
});

describe("R-18 · o valor à direita e o que houve entre dois itens", () => {
  it("`trailing` aparece na linha do título", () => {
    render(<Palco><Timeline items={HISTORICO} /></Palco>);
    expect(textos()).toEqual(expect.arrayContaining(["R$ 216,00", "R$ 460,00"]));
    const linhas = views().filter((e) => e.flexDirection === "row" && e.justifyContent === "space-between");
    expect(linhas).toHaveLength(2);
  });
  it("`between` aparece entre um item e o próximo, e não depois do último", () => {
    render(<Palco><Timeline items={HISTORICO} /></Palco>);
    expect(textos()).toEqual(expect.arrayContaining(["6 dias depois", "9 dias depois"]));
    expect(textos()).not.toContain("não aparece: é o último");
  });
  it("o texto do `between` começa na coluna do título, depois da moldura e do vão", () => {
    render(<Palco><Timeline items={HISTORICO} /></Palco>);
    const entre = views().filter((e) => e.paddingLeft === t.size.space10 + t.size.space3);
    expect(entre).toHaveLength(2);
  });
  it("no modo virtualizado, o `between` também aparece", () => {
    render(<Palco><Timeline virtualized items={HISTORICO} /></Palco>);
    const lista = __instancias("FlatList").at(-1)!;
    const desenhar = lista.renderItem as (a: {item: unknown; index: number}) => React.ReactElement;
    render(<Palco>{desenhar({item: HISTORICO[0], index: 0})}</Palco>);
    expect(textos()).toContain("6 dias depois");
  });
});

describe("as cores do Badge não mudaram ao sair de dentro dele", () => {
  it("os quatro tons com fundo suave", () => {
    for (const [tom, fundo, acento] of [
      ["info", t.color.infoBg, t.color.info400 ?? t.color.info],
      ["success", t.color.successBg, t.color.success400 ?? t.color.success],
      ["warning", t.color.warningBg, t.color.warning400 ?? t.color.warning],
      ["danger", t.color.dangerBg, t.color.danger400 ?? t.color.destructive],
    ] as const) {
      const {unmount} = render(<Palco><Badge tone={tom}>1</Badge></Palco>);
      const selo = views().find((e) => e.borderColor === acento);
      expect(selo?.backgroundColor, tom).toBe(fundo);
      unmount();
    }
  });
});
