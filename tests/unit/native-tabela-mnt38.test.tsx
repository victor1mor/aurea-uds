// MNT-38 no NATIVO (05/11/2026, *"Pode, um cartão só"*): no aparelho cada fileira da `Table` já é um cartão; com `dividers`,
// as fileiras ficam juntas num cartão só, com uma faixa clara entre elas (o texto a 10%, a mesma linha da web) e nenhuma
// depois da última. Sem a prop, os cartões de sempre. Na Ember, nada muda (como na web: *"Pode, sem a Ember"*).
// Provado contra o defeito: com o nativo da 0.55.0 a prop não existe — a lista continua com os cartões separados por 8 e
// nenhuma faixa, e o caso `dividers` reprova.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Table, comOpacidade, resolverTokens} from "../../packages/native/src/index.js";

type Props = Record<string, unknown>;
const plano = (p: Props) => StyleSheet.flatten(p.style as never) as Record<string, unknown> ?? {};
const COLUNAS = [{key: "dia", header: "Date", primary: true}, {key: "valor", header: "Amount"}] as const;
const LINHAS = [{dia: "Oct 2", valor: "$62.40"}, {dia: "Oct 9", valor: "$310.00"}, {dia: "Oct 17", valor: "$18.00"}];

function desenhar(props: {dividers?: boolean; brand?: string}) {
  const id = `t-${Math.random().toString(36).slice(2)}`;
  render(<AureaProvider theme="light" {...(props.brand ? {brand: props.brand as never} : {})}>
    <Table testID={id} caption="Expenses" columns={COLUNAS} rows={LINHAS} dividers={props.dividers} />
  </AureaProvider>);
  const views = __instancias("View");
  const lista = views.filter((p) => p.testID === id).at(-1)!;
  const i = views.lastIndexOf(lista);
  // As faixas: `aria-hidden`, depois da lista, com a altura da linha.
  const faixas = views.slice(i).filter((p) => p["aria-hidden"] === true);
  const itens = views.slice(i).filter((p) => p.role === "listitem");
  return {lista: plano(lista), faixas: faixas.map(plano), itens: itens.map(plano), bruto: lista};
}

describe("MNT-38 · Table do nativo com dividers", () => {
  const t = resolverTokens("light", "comfortable");
  it("sem a prop: os cartões de sempre, separados, sem faixa", () => {
    const r = desenhar({});
    expect(r.faixas).toHaveLength(0);
    expect(r.lista.gap).toBe(t.size.space2);
    expect(r.itens.every((s) => s.backgroundColor === t.color.card), JSON.stringify([r.itens, t.color.card])).toBe(true);
  });
  it("com dividers: um cartão só, e a linha clara entre as fileiras, menos depois da última", () => {
    const r = desenhar({dividers: true});
    expect(r.lista.backgroundColor).toBe(t.color.card);
    expect(r.lista.overflow).toBe("hidden");
    expect(r.itens.every((s) => s.backgroundColor === "transparent" && s.borderRadius === 0), JSON.stringify(r.itens)).toBe(true);
    expect(r.faixas).toHaveLength(LINHAS.length - 1);
    expect(r.faixas[0]).toMatchObject({height: t.size.borderWidth, backgroundColor: comOpacidade(t.color.foreground, 0.1)});
  });
  it("na Ember: nada muda", () => {
    const r = desenhar({dividers: true, brand: "ember"});
    expect(r.faixas).toHaveLength(0);
    expect(r.lista.backgroundColor, JSON.stringify(r.lista)).toBeUndefined();
  });
});
