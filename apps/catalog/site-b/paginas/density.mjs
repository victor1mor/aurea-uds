// DENSITY no desenho B (aprovado em 26/10/2026). O texto é o do `density.md`; a página arruma como o desenho: "See the
// three" — a chave das três densidades e um cartão com as peças de VERDADE (o campo, o botão de ícone, a tabela, os botões)
// dentro de um `data-density`, com as medidas de agora ao lado, lidas dos tokens —; a tabela dos onze tokens com a coluna
// escolhida acesa; o botão de cada densidade no toque; e a parte com outra densidade. As alturas são as das peças (32, 36,
// 40 no médio), e não as do desenho (o mapa: o desenho pintava números que não batem). O comportamento é o
// `site-b/js/density.js`.
import {docsB} from "./docs-b/comum.mjs";
import {gradeDoSite} from "../comum/grade-montagem.mjs";

const DENSIDADES = ["compact", "comfortable", "spacious"];

export default function density(site, doc) {
  const g = docsB(site, doc, {arquivos: ["index.html", "index.html", "DensityButtons.tsx", "toolbar.css", "index.html", "App.tsx"]});
  const {h, A} = g;

  // A abertura: os três tamanhos (o selo amarelo, só desenho), o atributo de agora, o 44 do toque e "Only sizes change".
  const pecas = [
    g.cartao(["sm", "md", "lg"].map((t, n) => h(A.Badge, {key: t, variant: "primary", emphasis: "solid", size: t}, "SML"[n]))),
    g.amarela(h("span", {className: "density-atributo"}, "data-density=\"comfortable\"")),
    g.numero("44", "px on touch", "in every density"),
    g.cartao(h("span", {className: "intro-mini intro-forte"}, "Only sizes change"), true),
  ];

  // SEE THE THREE: a chave, o cartão com as peças dentro do `data-density`, e as medidas de agora.
  const exemplo = doc.blocos.find(b => b.tipo === "codigo");
  const membros = [["Messenger", "online"], ["Analyst", "busy"], ["Curator", "online"], ["Writer", "away"]];
  const medidas = ["--control-h-md", "--control-h-sm", "--row-h", "--card-pad", "--section-gap"];
  const tres = [
    h("div", {key: "chave", className: "density-chave"},
      h(A.SegmentedControl, {label: "Density", size: "lg", selectedStyle: "emphasis", wrap: true, value: "comfortable", onChange: () => {},
        items: DENSIDADES.map(d => ({value: d, label: d}))})),
    h("div", {key: "lab", className: "density-lab"},
      h("div", {className: "density-previa", "data-density": "comfortable"},
        h(A.Card, {className: "density-membros"},
          h(A.Card.Header, null, h(A.Card.Title, null, "Members")),
          h("div", {className: "density-linha"},
            h(A.SearchField, {placeholder: "Filter members…", "aria-label": "Filter members"}),
            h(A.IconButton, {icon: "plus", label: "Add member", variant: "tertiary"})),
          // ~~Como o desenho: a lista em linhas (`Table variant="rows"`), sem cabeçalho~~ → a `DataGrid` (S-02, 05/11/2026),
          // que tem sempre cabeçalho; o estado continua na ponta.
          gradeDoSite({label: "Members", className: "density-tabela", cabecalho: ["Member", "Status"], linhas: membros.map(([n, s]) => [n, s])}),
          h(A.Card.Footer, null, h(A.Button, {variant: "primary"}, "Invite"), h(A.Button, null, "Cancel"), h(A.Button, {size: "sm"}, "Small")))),
      h("div", {className: "docb-caixa density-medidas", "aria-live": "polite"},
        h("p", {className: "docb-rotulo"}, "Measured now"),
        h("dl", null, ...medidas.map(m => h("div", {key: m}, h("dt", null, m), h("dd", {"data-token": m}, "—")))))),
    g.codigo(exemplo),
  ];

  // SET THE DENSITY: o "Aurea does not save the density." é a nota do desenho.
  const st = g.secao("set-the-density");
  const naoGuarda = g.achar(st, "p", "Aurea does not save");

  // THE TOKENS: a tabela do `.md`, com a coluna da densidade escolhida acesa (o script troca o `data-coluna`).
  const tk = g.secao("the-tokens");
  const tokens = g.achar(tk, "tabela");
  const coluna = j => j === 0 ? "" : `density-col-${DENSIDADES[j - 1]}`;
  // A `DataGrid` (S-02, 05/11/2026): a classe da coluna vai no conteúdo da célula e no nome da coluna (a grade não põe
  // classe na célula), e o CSS da página acende por ela.
  const tabelaTokens = h("div", {key: "tokens", className: "docb-tabela docb-grade density-tokens", "data-coluna": "comfortable"},
    gradeDoSite({label: `${tk.rotulo} table`,
      cabecalho: tokens.cabecalho.map((c, j) => ({texto: g.textoDe(c), classe: coluna(j)})),
      linhas: tokens.linhas.map((l) => l.map((c, j) => ({no: g.pedacos(c, g.k()), classe: coluna(j)})))}));

  // TOUCH SCREENS: o botão de verdade em cada densidade; o script escreve a altura que ele tem AQUI (no toque, 44).
  const ts = g.secao("touch-screens");
  const toque = h("div", {key: "toque", className: "docb-grade-3"}, ...DENSIDADES.map(d =>
    h("div", {key: d, className: "docb-caixa density-toque", "data-density": d},
      h("p", {className: "docb-rotulo"}, d),
      h(A.Button, {variant: "primary"}, "Save"),
      h("p", {className: "density-altura"}, h("span", {"data-altura": ""}), "at least 44px on a touch screen"))));

  // A DIFFERENT DENSITY FOR ONE PART: duas colunas, cada uma com a sua densidade; as barras têm a altura do controle dela.
  const pt = g.secao("a-different-density-for-one-part");
  const primeiroPt = pt.blocos[0];
  const coluna2 = (d, rotulo, n) => h("div", {key: d, className: "docb-caixa density-parte", "data-density": d},
    h("p", {className: "docb-rotulo"}, rotulo),
    ...Array.from({length: n}, (_, i) => h(A.Skeleton, {key: i, animation: "none", className: "density-barra"})));
  const duasPartes = h("div", {key: "partes", className: "docb-grade-2", "aria-hidden": "true"},
    coluna2("comfortable", "comfortable", 3), coluna2("compact", "aside · compact", 4));

  const partes = [
    g.doDesenho("see-the-three", "See the three", "Try it", tres),
    g.doMd("set-the-density", "One attribute", g.blocos(st.blocos, {legenda: st.rotulo, troca: b => b === naoGuarda ? g.aviso(b, "info") : undefined})),
    g.doMd("the-tokens", "Eleven tokens", g.blocos(tk.blocos, {troca: b => b === tokens ? tabelaTokens : undefined})),
    g.doMd("what-follows-the-density", "Who listens"),
    g.doMd("touch-screens", "A finger's size", [...g.blocos(ts.blocos), toque]),
    g.doMd("a-different-density-for-one-part", "Any element", g.blocos(pt.blocos, {troca: b => b === primeiroPt ? [g.p(b), duasPartes] : undefined})),
    g.doMd("in-react-native", "The touch scale"),
  ];
  // Antes das seções: os três parágrafos do começo (o código do exemplo vai para "See the three").
  return g.pagina({pecas, antes: g.intro.filter(b => b.tipo === "p").map(b => g.p(b)), partes});
}
