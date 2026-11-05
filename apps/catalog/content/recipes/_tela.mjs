// A TELA DE UMA RECEITA (S-11, 05/11/2026) — a linguagem comum dos blocos redesenhados pelo Victor ("blocos v2"): um
// `Card` (canto 22) em três zonas. O CABEÇALHO tem o ícone do tipo, a trilha com o id, o título com o estado, a linha de
// propriedades com ícone e as ações no canto (a destrutiva separada, uma principal no máximo). O CORPO tem o visual
// principal e, quando há, a coluna lateral de propriedades. O RODAPÉ diz o que a tela promete, com as ações da fase.
// Só peças que a Aurea já tem: Card, Avatar, Icon, Text, Heading, Code. Sem linha e sem degradê; toda medida de token.
// O `_` no começo: não é uma receita, é a moldura que as receitas usam.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const fila = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2) var(--space-4)"};

export function Tela({icone, trilha = [], id, titulo, estado, propriedades = [], acoes, lado, rodape, rodapeAcoes, children}) {
  return h(A.Card, null, h("div", {style: {display: "grid", gap: "var(--space-5)", minInlineSize: 0}},
    h("header", {style: {display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)"}},
      h("div", {style: {display: "flex", alignItems: "flex-start", gap: "var(--space-3)", minInlineSize: 0, flex: "1 1 calc(var(--space-24) * 3)"}},
        h("span", {style: {flex: "none", display: "inline-flex"}}, h(A.Avatar, {size: "lg", tone: "brand", emphasis: "soft", fallback: h(A.Icon, {name: icone})})),
        h("div", {style: {display: "grid", gap: "var(--space-1)", minInlineSize: 0}},
          trilha.length || id ? h("div", {style: {...fila, gap: "var(--space-2)"}},
            ...trilha.flatMap((t, n) => [n ? h(A.Text, {key: `s${n}`, type: "body-xs", tone: "muted", "aria-hidden": true}, "›") : null,
              h(A.Text, {key: `t${n}`, type: "body-xs", tone: "muted"}, t)]).filter(Boolean),
            id ? h(A.Code, {key: "id"}, id) : null) : null,
          h("div", {style: {...fila, gap: "var(--space-3)"}}, h(A.Heading, {level: 3}, titulo), estado),
          propriedades.length ? h("div", {style: fila}, ...propriedades.map(([ic, texto], n) =>
            h("span", {key: n, style: {display: "inline-flex", alignItems: "center", gap: "var(--space-1)"}},
              h(A.Icon, {name: ic, size: "sm"}), h(A.Text, {type: "body-sm", tone: "muted"}, texto)))) : null)),
      acoes ? h("div", {style: {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"}}, acoes) : null),
    h("div", {style: {display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "var(--space-5)"}},
      h("div", {style: {display: "grid", gap: "var(--space-4)", flex: "999 1 calc(var(--space-24) * 3 + var(--space-16))", minInlineSize: 0}}, children),
      lado ? h("aside", {style: {display: "grid", gap: "var(--space-4)", flex: "1 1 calc(var(--space-24) * 2)", minInlineSize: 0}}, lado) : null),
    rodape || rodapeAcoes ? h("footer", {style: {display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)"}},
      rodape ? h(A.Text, {type: "body-sm", tone: "muted"}, rodape) : h("span"),
      rodapeAcoes ? h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-2)"}}, rodapeAcoes) : null) : null));
}

// As propriedades da coluna lateral: o `DataList` da Aurea, com o título pequeno em cima.
export const Propriedades = ({titulo, itens}) => h("div", {style: {display: "grid", gap: "var(--space-2)"}},
  titulo ? h(A.Text, {type: "body-xs", tone: "muted", weight: "semibold"}, titulo) : null,
  h(A.DataList, {items: itens}));
