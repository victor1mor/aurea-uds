// A TELA DE UMA RECEITA (S-11, 05/11/2026) — a linguagem comum dos blocos redesenhados pelo Victor ("blocos v2"): um
// `Card` (canto 22) em três zonas. O CABEÇALHO tem o ícone do tipo, a trilha com o id, o título com o estado, a linha de
// propriedades com ícone e as ações no canto (a destrutiva separada, uma principal no máximo). O CORPO tem o visual
// principal e, quando há, a coluna lateral de propriedades. O RODAPÉ diz o que a tela promete, com as ações da fase.
// Só peças que a Aurea já tem: Card, Avatar, Icon, Text, Heading, Code, Separator. Sem borda em volta; DENTRO, as partes
// têm divisão (a ordem do Victor de 05/11/2026: "componentes que têm várias coisas dentro parece que tudo está misturado,
// sem divisões") — o `Separator` entre o cabeçalho, o corpo e o rodapé, e entre o corpo e a coluna. Toda medida de token.
// O `_` no começo: não é uma receita, é a moldura que as receitas usam.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const fila = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2) var(--space-4)"};

export function Tela({icone, trilha = [], id, titulo, estado, propriedades = [], acoes, lado, rodape, rodapeAcoes, children}) {
  // A tela ocupa a caixa inteira (a caixa da receita centraliza o que tem largura própria).
  return h("div", {className: "rcp-tela", style: {inlineSize: "100%", minInlineSize: 0}}, h(A.Card, null, h("div", {style: {display: "grid", gap: "var(--space-5)", minInlineSize: 0}},
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
    h(A.Separator, {spacing: "none"}),
    // O corpo e a coluna de propriedades, com a divisão entre eles: vertical lado a lado, horizontal quando a coluna desce
    // (o arranjo mora em `site-b/css/recipe.css`, pela largura da própria tela).
    h("div", {className: "rcp-tela-corpo"},
      h("div", {className: "rcp-tela-principal"}, children),
      lado ? h("span", {className: "rcp-tela-divisao", role: "presentation"}) : null,
      // Um bloco comum, e não `<aside>`: a tela mora dentro da página, e o marco "complementary" só vale no nível de cima
      // (o axe recusa — achado na varredura de 05/11/2026).
      lado ? h("div", {className: "rcp-tela-lado"}, ...[].concat(lado).flatMap((x, n) => n ? [h(A.Separator, {key: `d${n}`, spacing: "none"}), x] : [x])) : null),
    rodape || rodapeAcoes ? h(A.Separator, {spacing: "none"}) : null,
    rodape || rodapeAcoes ? h("footer", {style: {display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)"}},
      rodape ? h(A.Text, {type: "body-sm", tone: "muted"}, rodape) : h("span"),
      rodapeAcoes ? h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-2)"}}, rodapeAcoes) : null) : null)));
}

// As propriedades da coluna lateral: o `DataList` da Aurea, com o título pequeno em cima.
export const Propriedades = ({titulo, itens}) => h("div", {style: {display: "grid", gap: "var(--space-2)"}},
  titulo ? h(A.Text, {type: "body-xs", tone: "muted", weight: "semibold"}, titulo) : null,
  h(A.DataList, {items: itens}));

// UM NÚMERO numa caixa cinza (o `KPI` sem a moldura dele, dentro do `Card variant="inset"`), como os blocos v2. O `KPI`
// normal já é um cartão, da MESMA cor do cartão da tela — dentro dela, a caixa dele some (o Victor: "pq esses componentes
// ficam soltos?", 05/11/2026).
export const Numero = props => h(A.Card, {variant: "inset"}, h(A.KPI, {variant: "plain", ...props}));
// Um grupo do corpo numa caixa cinza, com o título pequeno em cima (o "Activity", o "Tool calls"). ⚠ O botão secundário e o
// terciário têm a MESMA cor da caixa cinza (`--secondary`) e somem dentro dela: aqui dentro, o botão que não é o principal
// usa `appearance="soft" tone="brand"` (achado de 05/11/2026, o mesmo problema dos números soltos).
// `contorno`: a peça de fundo translúcido (a conversa, o registro, a caixa de envio) clareia sobre a caixa cinza e o texto
// apagado dela perde o contraste (o axe achou, 05/11/2026) — esse grupo vai no cartão de contorno, que tem o fundo do cartão.
export const Grupo = ({titulo, contorno, children}) => h(A.Card, {variant: contorno ? "outline" : "inset"}, h("div", {style: {display: "grid", gap: "var(--space-3)", minInlineSize: 0}},
  titulo ? h(A.Text, {type: "body-xs", tone: "muted", weight: "semibold"}, titulo) : null, children));
