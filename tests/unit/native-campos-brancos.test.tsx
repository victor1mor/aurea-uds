// ADR-0078 no NATIVO (0.40.1) — no claro, o campo solto na tela é a cor do cartão com a sombra leve; dentro de uma
// superfície branca (o `Card`, as janelas, o `Popover`), o cinza de antes; no escuro, nada muda. E a ADR-0077 no
// nativo: o `numeric` e o número do `KPI` na fonte de código (a IBM Plex Mono), como na web.
// Provado contra o defeito: com o nativo da 0.40.0, todo caso "branco" reprova (o campo era `preenchimento(t, 2)` em
// toda parte), e o `numeric` saía na fonte do texto.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {ScrollView, StyleSheet, __instancias} from "./native-stubs/react-native";

import {
  AureaProvider, Card, Header, Input, InputGroup, KPI, NumberField, OTPField, ScrollShadow, SearchField, Select, Slider,
  Table, Text,
  comOpacidade, criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"magnifying-glass": Glifo, "caret-down": Glifo, "plus": Glifo, "minus": Glifo,
  "x": Glifo, "arrow-up-right": Glifo, "arrow-down-right": Glifo, "minus-circle": Glifo});
type Props = Record<string, unknown>;
const porID = (primitivo: string, id: string): Props =>
  __instancias(primitivo).filter((p) => p.testID === id).at(-1) ?? {};
const estiloDe = (primitivo: string, id: string) => StyleSheet.flatten(porID(primitivo, id).style as never) as Record<string, unknown>;

// Cada campo: como desenhá-lo e onde a pele dele mora (o primitivo e o testID).
const CAMPOS: [string, (id: string) => React.ReactElement, string, (id: string) => string][] = [
  ["Input", (id) => <Input testID={id} />, "TextInput", (id) => id],
  ["InputGroup", (id) => <InputGroup testID={id}><Input /></InputGroup>, "View", (id) => id],
  ["Select", (id) => <Select testID={id} placeholder="Select one" items={[{value: "a", label: "A"}]} />, "Pressable", (id) => id],
  ["SearchField", (id) => <SearchField testID={id} />, "View", (id) => id],
  ["NumberField", (id) => <NumberField testID={id} defaultValue={1} label="Qtd" />, "TextInput", (id) => `${id}-campo`],
  ["OTPField", (id) => <OTPField testID={id} length={4} label="Código" />, "View", (id) => `${id}-casa-0`],
];

const medir = (tema: "light" | "dark", embrulho: (filho: React.ReactElement) => React.ReactElement, campo: (id: string) => React.ReactElement,
  primitivo: string, alvo: string) => {
  const id = `c-${Math.random().toString(36).slice(2)}`;
  render(<AureaProvider theme={tema} icons={ICONES}>{embrulho(campo(id))}</AureaProvider>);
  return estiloDe(primitivo, alvo.replace("ID", id));
};

const claro = resolverTokens("light", "comfortable");
const escuro = resolverTokens("dark", "comfortable");
const cinza = (t: ReturnType<typeof resolverTokens>) => comOpacidade(t.color.foreground, 0.1);
const solto = (f: React.ReactElement) => f;
const noCartao = (f: React.ReactElement) => <Card>{f}</Card>;
const noContorno = (f: React.ReactElement) => <Card variant="outline">{f}</Card>;
const contornoNoCartao = (f: React.ReactElement) => <Card><Card variant="outline">{f}</Card></Card>;

describe("ADR-0078 · o campo branco no claro (nativo)", () => {
  for (const [nome, campo, primitivo, alvo] of CAMPOS) {
    const a = alvo("ID");
    it(`${nome}: solto no claro, a cor do cartão e a sombra leve`, () => {
      const s = medir("light", solto, campo, primitivo, a);
      expect(s.backgroundColor, `${nome}: branco`).toBe(claro.color.card);
      expect(s.boxShadow, `${nome}: a sombra de três camadas`).toEqual([...claro.shadowLayers.shadowSm]);
    });
    it(`${nome}: dentro do cartão, o cinza de antes e sem sombra`, () => {
      const s = medir("light", noCartao, campo, primitivo, a);
      expect(s.backgroundColor, `${nome}: cinza`).toBe(cinza(claro));
      expect(s.boxShadow, `${nome}: sem sombra`).toBeUndefined();
    });
    it(`${nome}: o cartão de contorno herda — branco na tela, cinza dentro de outro cartão`, () => {
      expect(medir("light", noContorno, campo, primitivo, a).backgroundColor, `${nome}: contorno na tela`).toBe(claro.color.card);
      expect(medir("light", contornoNoCartao, campo, primitivo, a).backgroundColor, `${nome}: contorno no cartão`).toBe(cinza(claro));
    });
    it(`${nome}: no escuro, nada muda — o cinza e sem sombra`, () => {
      const s = medir("dark", solto, campo, primitivo, a);
      expect(s.backgroundColor, `${nome}: cinza no escuro`).toBe(cinza(escuro));
      expect(s.boxShadow, `${nome}: sem sombra no escuro`).toBeUndefined();
    });
  }
});

// 0.40.1, a pergunta "quem mais pinta a cor do cartão?": o `Header` flutuante e o de pílula, e o `ScrollShadow` de
// superfície (o padrão), recebem conteúdo do app. Sem o contexto, o campo dentro deles saía branco no branco.
// O `Alert`, o `Toast` e a célula da `Table` ficam de fora: são um elemento só para o leitor de tela, e campo dentro
// deles some no iPhone (o check 43).
describe("ADR-0078 · as superfícies brancas que a 0.40.0 esqueceu (nativo)", () => {
  const [, campo, primitivo] = CAMPOS[0];
  const CASOS: [string, (f: React.ReactElement) => React.ReactElement, "cinza" | "branco"][] = [
    ["o Header flutuante (o padrão)", (f) => <Header>{f}</Header>, "cinza"],
    ["o Header de pílula", (f) => <Header variant="pill">{f}</Header>, "cinza"],
    ["o Header rente (a cor da página)", (f) => <Header variant="flush">{f}</Header>, "branco"],
    ["o ScrollShadow de superfície (o padrão)", (f) => <ScrollShadow><ScrollView>{f}</ScrollView></ScrollShadow>, "cinza"],
    ["o ScrollShadow sem caixa (plain)", (f) => <ScrollShadow variant="plain"><ScrollView>{f}</ScrollView></ScrollShadow>, "branco"],
  ];
  for (const [nome, embrulho, esperado] of CASOS) {
    it(`Input dentro d${nome.startsWith("o ") ? "" : "e "}${nome}: ${esperado}`, () => {
      const s = medir("light", embrulho, campo, primitivo, "ID");
      if (esperado === "cinza") {
        expect(s.backgroundColor, `${nome}: cinza`).toBe(cinza(claro));
        expect(s.boxShadow, `${nome}: sem sombra`).toBeUndefined();
      } else {
        expect(s.backgroundColor, `${nome}: branco`).toBe(claro.color.card);
        expect(s.boxShadow, `${nome}: com a sombra`).toEqual([...claro.shadowLayers.shadowSm]);
      }
    });
  }
});

describe("ADR-0077 · o numeric e o KPI na fonte de código (nativo)", () => {
  const MAPA = {
    ui: {400: "Inter-Regular", 500: "Inter-Medium", 600: "Inter-SemiBold", 700: "Inter-Bold"},
    code: {400: "IBMPlexMono", 500: "IBMPlexMono-Medm", 600: "IBMPlexMono-SmBld"},
  } as const;
  const ultimoTexto = () => StyleSheet.flatten(__instancias("Text").at(-1)?.style as never) as Record<string, unknown>;
  it("o numeric troca para a IBM Plex Mono; o `font` pedido continua mandando", () => {
    render(<AureaProvider fontFamilies={MAPA}><Text numeric>2026/0417</Text></AureaProvider>);
    expect(ultimoTexto().fontFamily).toBe("IBMPlexMono");
    expect(ultimoTexto().fontVariant).toEqual(["tabular-nums"]);
    render(<AureaProvider fontFamilies={MAPA}><Text numeric font="ui">2026/0417</Text></AureaProvider>);
    expect(ultimoTexto().fontFamily).toBe("Inter-Regular");
  });
  it("o número do KPI sai na IBM Plex Mono (o 700 cai no 600 desenhado, como na web)", () => {
    render(<AureaProvider fontFamilies={MAPA}><KPI label="Valor" value="R$ 704 mil" /></AureaProvider>);
    const numero = __instancias("Text").find((p) => p.children === "R$ 704 mil");
    expect(StyleSheet.flatten(numero?.style as never) as Record<string, unknown>).toMatchObject({fontFamily: "IBMPlexMono-SmBld"});
  });
  // Os outros números ficam na fonte do texto, com algarismos de mesma largura — como na web (o `.slider-output` e a
  // célula da tabela são a Inter com `tnum`). Provado contra o defeito: com o `numeric` sozinho dentro da `Table` e do
  // `Slider`, os dois saíam na IBM Plex Mono.
  it("a tabela e o valor do Slider ficam na Inter, com algarismos de mesma largura", () => {
    render(<AureaProvider fontFamilies={MAPA}>
      <Table columns={[{key: "modelo", header: "Modelo", primary: true}, {key: "preco", header: "Preço"}]}
             rows={[{modelo: "Trail 300", preco: "R$ 31.711,00"}]} />
      <Slider label="Volume" defaultValue={30} showValue />
    </AureaProvider>);
    const de = (texto: string) => StyleSheet.flatten(__instancias("Text").find((q) => q.children === texto)?.style as never) as Record<string, unknown>;
    expect(de("Trail 300"), "a célula principal").toMatchObject({fontFamily: "Inter-SemiBold", fontVariant: ["tabular-nums"]});
    expect(de("R$ 31.711,00"), "a célula").toMatchObject({fontFamily: "Inter-Regular", fontVariant: ["tabular-nums"]});
    expect(de("30"), "o valor do Slider").toMatchObject({fontFamily: "Inter-Medium", fontVariant: ["tabular-nums"]});
  });
});
