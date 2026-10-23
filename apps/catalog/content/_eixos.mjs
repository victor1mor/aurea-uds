// OS EIXOS — um exemplo que mostra TODO valor de uma variação (bloco 1, o catálogo fiel — 23/10/2026).
//
// O Victor: "todos os componentes sem exceção ... estão mostrando e funcionando no site, um catálogo 100% fiel".
// Medido na 0.42.0: das 839 variações das fichas, 473 não apareciam em exemplo nenhum. A trava
// (`scripts/catalogo-fiel.mjs`) lê o CÓDIGO dos exemplos; este ajudante escreve o código e a peça viva a partir
// da MESMA lista, para os dois nunca dizerem coisas diferentes — o defeito que um exemplo escrito à mão tem
// quando o código mostra três valores e o desenho mostra sete.
//
// Uso: `eixo({titulo, descricao, Comp, nome, prop, valores, base, filho})`. `base` são as props fixas (texto,
// número ou booleano; elas vão para o código também); `baseCodigo`, o texto delas quando alguma é um elemento;
// `filho(valor)` devolve o texto de dentro, ou `{codigo, elemento}` quando o de dentro é uma peça (sem `filho`, a peça
// sai sem filhos); `coluna: true` empilha; `estilo`, o arranjo em volta quando nenhum dos dois serve.
import {createElement as h, Fragment} from "react";

const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};
const coluna = {display: "grid", gap: "var(--space-3)", justifyItems: "start"};

// Uma prop no texto do código, como o consumidor a escreveria.
export const jsxProp = (k, v) =>
  v === true ? k : typeof v === "string" ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`;

const abre = (nome, props) => {
  const resto = props.filter(Boolean).join(" ");
  return resto ? `<${nome} ${resto}` : `<${nome}`;
};

// A forma geral, quando o valor muda mais de uma prop (o nome do botão que abre, o título): `codigo(valor)` e
// `peca(valor)` recebem o mesmo valor, da mesma lista.
export const cada = ({titulo, descricao, valores, codigo, peca, coluna: emColuna, estilo}) => ({
  title: titulo,
  description: descricao,
  code: valores.map(codigo).join("\n"),
  render: () => h("div", {style: estilo ?? (emColuna ? coluna : linha)},
    ...valores.map((v) => h(Fragment, {key: String(v)}, peca(v)))),
});

const dentro = (filho, v) => {
  const f = filho ? filho(v) : null;
  return f != null && typeof f === "object" ? f : {codigo: f, elemento: f ?? undefined};
};

export function eixo({titulo, descricao, Comp, nome, prop, valores, base = {}, baseCodigo, filho, coluna: emColuna, estilo}) {
  const fixas = baseCodigo ?? Object.entries(base).map(([k, v]) => jsxProp(k, v)).join(" ");
  const code = valores.map((v) => {
    const {codigo} = dentro(filho, v);
    const tag = abre(nome, [fixas, jsxProp(prop, v)]);
    return codigo == null ? `${tag} />` : `${tag}>${codigo}</${nome}>`;
  }).join("\n");
  return {
    title: titulo,
    description: descricao,
    code,
    render: () => h("div", {style: estilo ?? (emColuna ? coluna : linha)},
      ...valores.map((v) => h(Comp, {key: String(v), ...base, [prop]: v}, dentro(filho, v).elemento))),
  };
}
