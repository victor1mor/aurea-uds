// A SHOWCASE NO DESENHO B (aprovado em 26/10/2026): a abertura no palco; "Built only with Aurea" com o inspetor — esta
// página em miniatura, em que cada parte (o topo, a lateral, o código, o botão, o índice) é a ÁREA de ligar (`Toggle area
// variant="ghost"`, o D-3) e o painel ao lado diz que peça a desenha; as seções prontas, os padrões e receitas, e "o seu
// projeto aqui". O comportamento (a parte escolhida, o tema) está em `site-b/js/showcase.js`.
import {ferramentas} from "./_getting-started/comum.mjs";

// As partes da miniatura: [chave, o nome da parte, a peça, a frase, a página da peça].
const PARTES = [
  ["header", "The header", "Header", "The bar with the brand, the eight areas as tabs and the global actions.", "./header.html"],
  ["side", "The side navigation", "Sidebar", "The sections of the area you are in, with the current page marked.", "./sidebar.html"],
  ["code", "A code block", "CodeBlock", "Every snippet on the site, with its copy button.", "./codeblock.html"],
  ["button", "A button", "Button", "Every action on the page, from Copy to Open.", "./button.html"],
  ["toc", "The index of the page", "TableOfContents", "An index that follows the reading and marks the section in view.", "./tableofcontents.html"],
];
const SECOES_PRONTAS = ["Sign-in panel", "Settings form", "Members table", "Stats row", "Pricing row", "Activity panel", "Analytics workbench", "Media library", "and more"];

export default function showcase(site, doc) {
  const {h, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  const este = sec.por("This site"), blocos = sec.por("Blocks"), padroes = sec.por("Patterns and recipes"), seu = sec.por("Your project here");

  const abertura = g.abertura(doc, [
    g.cartao([site.blocoDeTile("check-circle", "blue", "intro-tile-sm"), h("span", {key: "t", className: "intro-mini"}, h("b", null, "Only Aurea"), h("br"), "every page of this site")]),
    g.capsula(h("span", {className: "gs-mono sc-mono"}, "<Header tabs>")),
    g.cartao([site.blocoDeTile("shield-check", "green", "intro-tile-sm"), h("span", {key: "t", className: "intro-mini"}, h("b", null, "Checked on every build"), h("br"), "nothing from outside")]),
    g.capsula(g.amarela("Your project?"))]);

  // A ÁREA em volta de cada parte da miniatura. Os desenhos de dentro são do site.
  const area = (chave, filhos, pilula = false) => {
    const [, nome] = PARTES.find(p => p[0] === chave);
    return h(A.Toggle, {area: pilula ? "pill" : true, variant: "ghost", label: nome, "aria-label": nome, className: `sc-area sc-area-${chave}`,
      defaultPressed: chave === "header"}, filhos);
  };
  const barras = (n, classe, larguras = []) => Array.from({length: n}, (_, k) => h("span", {key: k, className: k === 0 && classe ? classe : undefined,
    style: larguras[k] ? {inlineSize: larguras[k]} : undefined}));
  const miniatura = h("div", {className: "sc-mini", role: "group", "aria-label": "This page in miniature. Choose a part to see which component draws it."},
    area("header", h("span", {className: "sc-mini-topo"}, h("i"), h("span", {className: "sc-mini-abas"}, ...barras(4, "sc-on")),
      h("span", {className: "sc-mini-tema"}, ...barras(3, "sc-on")))),
    h("div", {className: "sc-mini-grade"},
      area("side", h("span", {className: "sc-mini-lateral"}, ...barras(6, "sc-on"))),
      h("div", {className: "sc-mini-meio"},
        h("span", {className: "sc-mini-h1"}), h("span", {className: "sc-mini-p"}), h("span", {className: "sc-mini-p sc-mini-p-80"}),
        area("code", h("span", {className: "sc-mini-codigo"}, ...barras(3, null, ["70%", "45%", "60%"]))),
        area("button", h("span", {className: "sc-mini-botao"}, "Copy"), true)),
      area("toc", h("span", {className: "sc-mini-indice"}, h("i"), ...barras(3, null, [null, "70%", "80%"])))));
  const [, nome0, peca0, frase0, href0] = PARTES[0];
  const inspetor = h(A.Card, {className: "sc-painel", "aria-live": "polite"},
    h("p", {className: "gs-k", "data-sc-campo": "nome"}, nome0),
    h("h3", {className: "sc-painel-peca", "data-sc-campo": "peca"}, peca0),
    h("p", {className: "sc-painel-frase", "data-sc-campo": "frase"}, frase0),
    h(A.Button, {size: "md", variant: "tertiary", href: href0, trailingIcon: "arrow-up-right", className: "sc-painel-abrir", "data-sc-campo": "href"}, "Open its page"));
  // O dado de cada parte, para o script.
  const dados = h("script", {type: "application/json", id: "sc-partes", dangerouslySetInnerHTML: {__html: JSON.stringify(PARTES).replace(/</g, "\\u003c")}});

  const [p1, p2, p3] = este.blocos.filter(b => b.tipo === "p");
  const [pSeu1, pSeu2] = seu.blocos.filter(b => b.tipo === "p");
  const link = pSeu1.texto.find(x => x.link !== undefined);
  // Como o desenho (02/11/2026): o aviso tem o título em cima ("Enforced, not just intended.") e o corpo embaixo; o texto
  // do documento (que também sai em Markdown) fica como está, e a página só o reparte.
  const PREFIXO = "This is enforced, not just intended: ";
  const [aviso0, ...avisoResto] = p2.texto;
  const comTitulo = typeof aviso0?.t === "string" && aviso0.t.startsWith(PREFIXO);
  const corpoDoAviso = comTitulo ? [{t: aviso0.t.slice(PREFIXO.length).replace(/^./, c => c.toUpperCase())}, ...avisoResto] : p2.texto;
  const node = g.pagina(doc, abertura,
    g.secao(este.id, "01 · This site", "Built only with Aurea.",
      g.p(p1.texto, "e1"),
      h("div", {className: "sc-inspetor"}, miniatura, inspetor),
      h(A.Alert, {appearance: "soft", variant: "success", className: "gs-aviso", title: comTitulo ? "Enforced, not just intended." : undefined}, ...site.pedacos(corpoDoAviso, "e2")),
      h("p", {className: "intro-p gs-p sc-tema"}, ...site.pedacos(p3.texto, "e3"), " ",
        h(A.Button, {size: "md", variant: "tertiary", type: "button", "data-sc-tema": ""}, "See it in light")),
      dados),
    g.secao(blocos.id, "02 · Blocks", "Ready sections.",
      ...g.corpo(blocos.blocos, {chave: "b"}),
      h(A.TagGroup, {label: "Ready sections", labelHidden: true, size: "lg", variant: "surface", className: "sc-prontas",
        items: SECOES_PRONTAS.map(n => ({id: n.toLowerCase().replace(/[^a-z]+/g, "-"), label: n}))})),
    g.secao(padroes.id, "03 · Patterns and recipes", "From one piece to a whole app.",
      g.linksDaLista(padroes.blocos.find(b => b.tipo === "ul"), [["puzzle-piece", "orange"], ["book-open", "pink"]])),
    g.secao(seu.id, "04 · Your project here", "Built something with Aurea?",
      h(A.Card, {variant: "inset", className: "sc-seu"},
        // Como o desenho: o pedido em lista (o nome, o link, uma frase), e não numa frase só.
        h("div", null,
          h("p", {className: "intro-p gs-p sc-seu-p"}, "Open an issue on GitHub with:"),
          h("ul", {className: "gs-lista gs-ul sc-seu-lista"}, ...["the name,", "a link,", "one sentence about it."].map(x => h("li", {key: x}, x))),
          g.p(pSeu2.texto, "s2", {className: "sc-seu-nota"})),
        h(A.Button, {size: "lg", variant: "primary", href: link.href, trailingIcon: "arrow-up-right"}, "Open an issue"))));
  const toc = [[este, "This site"], [blocos, "Blocks"], [padroes, "Patterns and recipes"], [seu, "Your project here"]].map(([s, label]) => ({id: s.id, label}));
  return {node, toc};
}
