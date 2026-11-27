// O LOTE 109 (aprovado pelo Victor na bancada viva em 26/11/2026, *"Aprovo as quatro"*).
//   1 e 2 · o vão entre a fila de abas e o painel é o da referência, 8 (`--space-2`): no cartão (era 0), no painel sem
//           caixa (era 12), em pé (era 16) e no celular (era 12). A medida de verdade é a de navegador
//           (`tests/visual/abas-vao.spec.ts`); aqui se cobra a regra e o estilo do nativo.
//   3 · a data de um campo, no site, é o `DatePicker` da Aurea: nenhum exemplo do site usa mais o calendário do navegador
//       (`type="date"`).
//   4 · o campo de hora só se digita: o botão do relógio do navegador não aparece.
//   E o que a troca achou: a montagem do site apagava só as páginas velhas, e o `.md` delas ficava.
// Provado contra o defeito (26/11/2026): com o CSS, o nativo e os exemplos de antes, cada teste abaixo reprova.
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Tabs, Text, resolverTokens} from "../../packages/native/src/index.js";

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const regra = (seletor: string) => {
  const i = css.indexOf(`${seletor} {`);
  expect(i, `regra ${seletor}`).toBeGreaterThan(-1);
  return css.slice(i, css.indexOf("}", i));
};

describe("o vão das abas, na web", () => {
  it("deitada, o cartão (o painel padrão) fica a `--space-2` da fila", () => {
    expect(regra(".tabs-root:not([data-orientation=\"vertical\"])>.card")).toContain("margin-block-start:var(--space-2)");
  });
  it("deitada, o painel sem caixa começa a `--space-2`", () => {
    expect(regra(".tabs-root:not([data-orientation=\"vertical\"])>.tabs-panel")).toContain("padding-block-start:var(--space-2)");
  });
  it("em pé, a coluna de abas e o painel ficam a `--space-2`", () => {
    expect(regra(".tabs-root[data-orientation=\"vertical\"]")).toContain("gap:var(--space-2)");
  });
  it("e a regra vale para todas as marcas: nenhuma exclusão da Ember", () => {
    expect(css).not.toMatch(/tabs-root[^{]*data-brand/);
  });
});

describe("o vão das abas, no celular", () => {
  const t = resolverTokens("dark", "comfortable");
  const ABAS = [{id: "r", label: "Resumo", content: <Text>corpo</Text>}, {id: "h", label: "Histórico", content: <Text>outro</Text>}];
  const painel = () => (StyleSheet.flatten(__instancias("View").filter((p) => p.accessibilityLabel === "Resumo").at(-1)!.style) ?? {}) as Record<string, unknown>;
  it.each(["card", "plain"] as const)("o painel `%s` fica a `space2` da fila, igual à web", (panel) => {
    render(<AureaProvider><Tabs tabs={ABAS} value="r" panel={panel} /></AureaProvider>);
    expect(painel().marginTop).toBe(t.size.space2);
  });
});

describe("a data e a hora no site", () => {
  // Todo arquivo de exemplo do site (os componentes da web, os padrões e os blocos); o nativo fica de fora: no aparelho o
  // `DatePicker` do nativo abre o seletor do próprio aparelho, e no navegador o do navegador, de propósito (o E16).
  const pastas = ["apps/catalog/content", "apps/catalog/content/patterns", "apps/catalog/content/blocks"];
  const arquivos = pastas.flatMap((d) => readdirSync(d).filter((f) => f.endsWith(".mjs")).map((f) => join(d, f)));
  it("nenhum exemplo abre o calendário do navegador (`type=\"date\"`): a data é o `DatePicker`", () => {
    const comData = arquivos.filter((f) => /type[:=]\s*\\?["'`]date\\?["'`]|type=\\?"date\\?"/.test(readFileSync(f, "utf8")));
    expect(comData).toEqual([]);
  });
  it("e nenhum texto manda preferir o calendário do navegador", () => {
    const mandam = arquivos.filter((f) => /prefer <Input type|native (date )?(input|picker) (still )?wins/i.test(readFileSync(f, "utf8")));
    expect(mandam).toEqual([]);
  });
  it("o site não guarda o texto de uma página que não existe mais (o `.md` órfão)", () => {
    // Os dois padrões renomeados deixavam o `.md` antigo, que ainda mandava preferir o calendário do navegador; e havia um
    // da 0.52.1, que nunca teve página. Só o texto para assistentes não tem página ao lado.
    const orfaos = readdirSync("apps/catalog").filter((f) => f.endsWith(".md") && f !== "aurea-agents.md")
      .filter((f) => !readdirSync("apps/catalog").includes(f.replace(/\.md$/, ".html")));
    expect(orfaos).toEqual([]);
  });
  it("o campo de hora não mostra o relógio do navegador", () => {
    expect(regra(".input[type=\"time\"]::-webkit-calendar-picker-indicator")).toContain("display:none");
  });
});
