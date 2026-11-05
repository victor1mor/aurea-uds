// A MONTAGEM da tabela do site como `DataGrid` (S-02, 05/11/2026), com `fit` (*"Pode, com fit"*) e a linha entre as
// fileiras, `dividers` (*"Com a linha"*, depois da ordem do Victor de que o sem linha não é 100%). Ver `grade.mjs`. A página sai com a grade desenhada
// (o estático é o piso, como em toda caixa do site) e com os dados num atributo; a parte viva (`live/site.tsx`) acende a
// grade por cima — ordenar, o teclado da grade —, sob o provedor único do site.
import {createElement as h, Fragment} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
import {colunasDaGrade} from "./grade.mjs";

const ENTIDADES = {"&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#x27;": "'", "&#39;": "'", "&nbsp;": " ", "&amp;": "&"};
const texto = (html) => html.replace(/<[^>]+>/g, "").replace(/&(?:lt|gt|quot|#x27|#39|nbsp|amp);/g, (e) => ENTIDADES[e]);
// Uma célula: um nó, uma lista de nós, ou {no, classe}.
const comClasse = (x) => x && typeof x === "object" && !Array.isArray(x) && "no" in x ? x : {no: x};
const celula = (x) => {
  const {no, classe} = comClasse(x);
  const html = renderToStaticMarkup(h(Fragment, null, ...(Array.isArray(no) ? no : [no])));
  return classe ? {t: texto(html), h: html, c: classe} : {t: texto(html), h: html};
};
const cabeca = (x) => typeof x === "string" ? {t: x} : {t: x.texto, ...(x.classe ? {c: x.classe} : {}), ...(x.ordenar === false ? {o: false} : {})};

/**
 * A tabela do site: `label` é o nome (o que era o `caption` — não aparece; o leitor de tela ouve), `cabecalho` os nomes
 * das colunas (texto, ou {texto, classe, ordenar}), `linhas` as células (nó, lista de nós, ou {no, classe}).
 */
export function gradeDoSite({label, cabecalho, linhas, key, className}) {
  const dados = {label, cabecalho: cabecalho.map(cabeca), linhas: linhas.map((l) => l.map(celula))};
  return h("div", {key, className: ["grade-do-site", className].filter(Boolean).join(" "), "data-vivo-grade": JSON.stringify(dados)},
    h(DataGrid, {label, fit: true, dividers: true, data: dados.linhas, columns: colunasDaGrade(dados.cabecalho)}));
}
