// AS TABELAS DO SITE SÃO `DataGrid` (S-02, o Victor, 05/11/2026: "tudo que existe no site de table vira datagrid").
// A `Table` mostrava o título (`caption`) dentro da moldura; a `DataGrid` não — o nome continua para o leitor de tela,
// no `label` (o nome da região e da grade).
//
// Este arquivo é o pedaço que a MONTAGEM e a PARTE VIVA dividem: as colunas da grade a partir dos dados que a montagem
// escreve na página (`data-vivo-grade`). Cada célula chega pronta, em HTML que a própria montagem desenhou (`h`), com o
// texto puro ao lado (`t`) para a grade ordenar; a classe (`c`) vai no conteúdo da célula — a `DataGrid` não põe classe
// na célula, e é por ela que uma página acende uma coluna (a dos tokens do Density). Sem `react-dom/server` aqui: a parte
// viva importa este arquivo.
import {createElement as h, memo} from "react";

// A célula pronta. `memo`: a grade redesenha a cada clique (o foco que anda pelas células), e um `span` com HTML pronto
// redesenhado perde o que o script da página escreveu nele — a bolinha do "Play" do Animation voltava ao começo. Medido no
// navegador (05/11/2026). Com o mesmo HTML, a célula não se redesenha.
const Celula = memo(function Celula({html, classe}) {
  return h("span", {className: ["grade-celula", classe].filter(Boolean).join(" "), dangerouslySetInnerHTML: {__html: html}});
});

/** As colunas da `DataGrid` do site: `cabecalho` é [{t, c?, o?}] (`o: false`, a coluna não ordena — a de um botão), cada
 *  linha é [{t, h, c?}]. */
export const colunasDaGrade = (cabecalho) => cabecalho.map((col, i) => ({
  id: `c${i}`,
  accessorFn: (linha) => linha[i].t,
  ...(col.o === false ? {enableSorting: false} : {}),
  header: col.c ? () => h("span", {className: col.c}, col.t) : col.t,
  cell: (x) => h(Celula, {html: x.row.original[i].h, classe: x.row.original[i].c}),
}));
