// Lote L (09/10/2026, ADR-0060) · o NATIVO, com os mesmos nomes da web:
//   GAR-07: `Badge tone="blue"`… pinta com os tokens `category-*` (o acento) e `category-*-bg`;
//   GAR-09: `KPI direction` põe a seta (o glifo do app) e a cor do tom na tendência, e monta o nome
//           que o leitor de tela ouve — a seta é desenho e não tem texto para ele juntar;
//   MNT-04: `KPI variant="plain"` não é um `Card`;
//   e o número em `3xl` (30), o da web desde a 0.24.1.
// O dublê só registra o estilo; o desenho foi visto na bancada do `react-native-web`.
// Provado contra o defeito: na 0.25.0 o `tone` de categoria cai no neutro, o número sai em `2xl`
// (24) e o `KPI` não tem seta nem nome montado — os testes abaixo reprovam.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Badge, KPI, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("light", "comfortable");
type Estilo = Record<string, unknown>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;
const chamadas: Array<{nome: string; color?: string}> = [];
const glifo = (nome: string) => (p: {color?: string}) => { chamadas.push({nome, color: p.color}); return null; };
const ICONES = criarRegistroDeIcones({"trend-up": glifo("trend-up"), "trend-down": glifo("trend-down"), "minus": glifo("minus")});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider theme="light" icons={ICONES}>{children}</AureaProvider>;

const CATEGORIAS = [["red", "categoryRed"], ["orange", "categoryOrange"], ["green", "categoryGreen"],
  ["teal", "categoryTeal"], ["cyan", "categoryCyan"], ["blue", "categoryBlue"],
  ["violet", "categoryViolet"], ["pink", "categoryPink"]] as const;

const textoDe = (conteudo: string) =>
  __instancias("Text").map((p) => ({...p, s: plano(p.style)})).find((p) => p.children === conteudo);

describe("GAR-07 · o selo com cor de categoria, no nativo", () => {
  it.each(CATEGORIAS)("tone=%s usa o acento e o fundo da categoria", (tom, chave) => {
    render(<Envolve><Badge tone={tom}>Grupo</Badge></Envolve>);
    const pele = __instancias("View").map((p) => plano(p.style)).find((e) => e.backgroundColor === t.color[`${chave}Bg`]);
    expect(t.color[chave], "o token existe no tema").toBeTruthy();
    expect(pele, "o fundo suave da categoria").toBeDefined();
    expect(pele!.borderColor).toBe(t.color[chave]);
    expect(textoDe("Grupo")!.s.color).toBe(t.color[chave]);
  });
  it("as oito são oito cores diferentes, e nenhuma é a do neutro", () => {
    const cores = CATEGORIAS.map(([, chave]) => t.color[chave]);
    expect(new Set(cores).size).toBe(8);
    expect(cores).not.toContain(t.color.secondaryForeground);
  });
  it("solid enche com o acento da categoria e escreve com a cor do fundo", () => {
    render(<Envolve><Badge tone="violet" emphasis="solid">Design</Badge></Envolve>);
    expect(__instancias("View").map((p) => plano(p.style)).some((e) => e.backgroundColor === t.color.categoryViolet)).toBe(true);
    expect(textoDe("Design")!.s.color).toBe(t.color.background);
  });
});

describe("GAR-09 · o KPI com direção, no nativo", () => {
  it("o número sai em 3xl (30), o mesmo da web", () => {
    render(<Envolve><KPI label="Receita" value="R$ 12.400" /></Envolve>);
    expect(textoDe("R$ 12.400")!.s.fontSize).toBe(t.size.text3xl);
  });
  it("up: a seta trend-up e a tendência na cor de sucesso", () => {
    chamadas.length = 0;
    render(<Envolve><KPI label="Receita" value="R$ 1" trend="+8%" direction="up" /></Envolve>);
    expect(chamadas.at(-1)).toEqual({nome: "trend-up", color: t.color.success400 ?? t.color.success});
    expect(textoDe("+8%")!.s.color).toBe(t.color.success400 ?? t.color.success);
  });
  it("down com tone=success: a seta de baixa na cor de sucesso (subir seria ruim)", () => {
    chamadas.length = 0;
    render(<Envolve><KPI label="Latência" value="1,8 s" trend="−4%" direction="down" tone="success" /></Envolve>);
    expect(chamadas.at(-1)).toEqual({nome: "trend-down", color: t.color.success400 ?? t.color.success});
  });
  it("flat: o traço, na cor de texto apagado", () => {
    chamadas.length = 0;
    render(<Envolve><KPI label="Assinantes" value="148" trend="igual" direction="flat" /></Envolve>);
    expect(chamadas.at(-1)).toEqual({nome: "minus", color: t.color.mutedForeground});
  });
  it("o leitor de tela ouve rótulo, número, a palavra e a tendência", () => {
    render(<Envolve><KPI testID="k" label="Receita" value="R$ 1" trend="+8%" direction="up" directionLabel="Alta" /></Envolve>);
    const raiz = __instancias("View").find((p) => p.testID === "k")!;
    expect(raiz.accessible).toBe(true);
    expect(raiz.accessibilityLabel).toBe("Receita, R$ 1, Alta, +8%");
  });
  it("sem direction, nada de seta nem de nome montado (o de antes)", () => {
    chamadas.length = 0;
    render(<Envolve><KPI testID="k" label="Receita" value="R$ 1" trend="+8%" tone="danger" /></Envolve>);
    expect(chamadas).toHaveLength(0);
    expect(__instancias("View").find((p) => p.testID === "k")!.accessibilityLabel).toBeUndefined();
    expect(textoDe("+8%")!.s.color).toBe(t.color.mutedForeground);
  });
});

describe("MNT-04 · o KPI sem a caixa, no nativo", () => {
  it("variant=plain não tem a pele do cartão; o padrão tem", () => {
    render(<Envolve><KPI testID="liso" variant="plain" label="a" value="1" /><KPI testID="caixa" label="b" value="2" /></Envolve>);
    const liso = plano(__instancias("View").find((p) => p.testID === "liso")!.style);
    const caixa = plano(__instancias("View").find((p) => p.testID === "caixa")!.style);
    expect(caixa.backgroundColor).toBe(t.color.card);
    expect(liso.backgroundColor).toBeUndefined();
    expect(liso.borderWidth).toBeUndefined();
    expect(liso.gap).toBe(t.size.space1);
  });
});
