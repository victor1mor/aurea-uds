// STYLING no desenho B (aprovado em 26/10/2026). O texto é o do `styling.md`; a página arruma como o desenho: a escada dos
// quatro jeitos, as três coisas que a prop mantém, o atributo `class` desenhado, as duas camadas com a chave "Does your app
// use layers too?", as duas regras do sistema em cartões, o `Toggle` "Autosave" que mostra o `data-pressed` e a régua da
// largura com o `Slider` e o `Button` que muda de tamanho. O comportamento é o `site-b/js/styling.js`.
import {docsB} from "./docs-b/comum.mjs";

export default function styling(site, doc) {
  const g = docsB(site, doc, {arquivos: ["Actions.tsx", "Checkout.tsx", "Summary.tsx", "app.css", "app.css", "order-summary.css",
    "app.css", "Save.tsx", "Panel.tsx", "index.html"]});
  const {h, A} = g;

  const pecas = [
    g.numero("4", "ways", "from most to least preferred"),
    g.mono("@layer aurea"),
    g.cartao([h("span", {key: "a", className: "docb-mono styling-classe-mini"}, "btn"), h("span", {key: "b", className: "docb-mono styling-classe-mini"}, "btn-primary"),
      h(A.Badge, {key: "c", variant: "primary", emphasis: "solid", size: "lg", className: "intro-razao docb-amarela"}, "yours")], true),
    g.mono("[data-pressed]"),
  ];

  // A ESCADA: os quatro jeitos, do mais ao menos preferido; cada degrau leva à seção dele. O primeiro é o amarelo cheio do
  // desenho (`Card fill="brand"`, a "B" de 02/11/2026).
  const degraus = [["start-with-props", "Props", "appearance, tone, variant, size"], ["basic-styling", "A class name", "className, added after Aurea's"],
    ["how-your-css-wins", "Your own CSS", "outside the aurea layer"], ["use-the-tokens", "The tokens", "var(--space-4) and friends"]];
  const escada = [h("ol", {key: "escada", className: "styling-escada"}, ...degraus.map(([id, nome, frase], n) =>
    h("li", {key: id, className: `styling-degrau styling-degrau-${n + 1}`},
      h(A.Card, {variant: "interactive", lift: true, ...(n === 0 ? {fill: "brand"} : {}), className: "styling-degrau-cartao", render: h("a", {href: `#${id}`})},
        h("span", {className: "styling-degrau-n"}, n + 1), h("b", null, nome), h("span", null, frase))))),
    h("div", {key: "legenda", className: "styling-escada-legenda", "aria-hidden": "true"}, h("span", null, "most preferred"), h("span", null, "least preferred"))];

  // START WITH PROPS: depois do parágrafo que as cita, as três coisas que a prop mantém (o selo de sucesso com o ponto).
  const pr = g.secao("start-with-props");
  const mantem = g.achar(pr, "p", "A prop keeps");
  const selos = h("div", {key: "mantem", className: "styling-mantem"}, ...["both themes", "the three densities", "high contrast"].map(x =>
    h(A.Badge, {key: x, tone: "success", dot: true, size: "lg"}, x)));

  // BASIC STYLING: o atributo `class` que o botão desenha — os nomes da Aurea e o seu.
  const bs = g.secao("basic-styling");
  const codigoCheckout = bs.blocos.find(b => b.tipo === "codigo");
  const classe = h("div", {key: "classe", className: "styling-classe", role: "img", "aria-label": "The rendered class attribute: btn btn-primary checkout-save"},
    h("span", {className: "styling-classe-linha", "aria-hidden": "true"}, "class=\"",
      h(A.Badge, {variant: "neutral", size: "lg", className: "styling-classe-nome"}, "btn"),
      h(A.Badge, {variant: "neutral", size: "lg", className: "styling-classe-nome"}, "btn-primary"),
      h(A.Badge, {variant: "primary", emphasis: "solid", size: "lg", className: "styling-classe-nome"}, "checkout-save"), "\""),
    h("span", {className: "styling-classe-legenda", "aria-hidden": "true"}, h("span", null, h("i", {"data-cor": "aurea"}), "Aurea"),
      h("span", null, h("i", {"data-cor": "sua"}), "yours")));

  // HOW YOUR CSS WINS: as duas camadas e a chave "Does your app use layers too?" — "No" mostra a regra solta; "Yes", a ordem.
  const cw = g.secao("how-your-css-wins");
  const [primeiroCw, codigoSolto, ordemP, codigoOrdem] = cw.blocos;
  const camadas = h("div", {key: "camadas", className: "styling-camadas"},
    h("div", {className: "styling-pilha", "aria-live": "polite"},
      // A camada que ganha é o amarelo cheio do desenho (`Card fill="brand"`); o "wins" vai no selo neutro, que se lê no amarelo.
      h(A.Card, {fill: "brand", className: "styling-camada"}, h("span", {className: "styling-voce"}, "your CSS, outside any layer"),
        h(A.Badge, {variant: "neutral", size: "sm"}, "wins")),
      h(A.Card, {className: "styling-camada"}, h("span", null, "@layer aurea"), h(A.Badge, {variant: "neutral", size: "sm"}, "loses"))),
    h("div", {className: "styling-pergunta"}, h("span", {id: "styling-pergunta"}, "Does your app use layers too?"),
      h(A.SegmentedControl, {label: "Does your app use layers too?", size: "lg", selectedStyle: "emphasis", value: "no", onChange: () => {},
        items: [{value: "no", label: "No"}, {value: "yes", label: "Yes"}]})));

  // USE THE TOKENS: as duas regras em cartões, com o X no ladrilho vermelho.
  const tk = g.secao("use-the-tokens");
  const regras = g.achar(tk, "ul");
  const cartoesRegras = h("div", {key: "regras", className: "docb-grade-2"}, ...regras.itens.map((it, n) => {
    const [titulo, ...resto] = it;
    return h("div", {key: n, className: "docb-caixa styling-regra"}, site.blocoDeTile("x", "red"),
      h("div", null, h("b", null, titulo.strong), h("p", null, ...g.pedacos(resto, `r${n}`))));
  }));

  // STATE-BASED STYLING: o `Toggle` de verdade e a marcação que ele tem agora.
  const sb = g.secao("state-based-styling");
  const primeiroSb = sb.blocos[0];
  const estado = h("div", {key: "estado", className: "docb-caixa styling-estado"},
    h(A.Toggle, {icon: "arrows-clockwise", size: "lg"}, "Autosave"),
    h("p", {className: "styling-marcacao", "aria-live": "polite"}, "<button class=\"toggle\"", h("span", {className: "styling-atributo"}), ">"));

  // RESPONSIVE DESIGN: a régua — a largura, o `Slider`, os sete degraus e o `Button` com o tamanho que o degrau dá.
  const degrausVw = [["2xs", 360], ["xs", 480], ["sm", 640], ["md", 768], ["lg", 1024], ["xl", 1280], ["2xl", 1536]];
  const rd = g.secao("responsive-design");
  const primeiroRd = rd.blocos[0];
  const regua = h("div", {key: "regua", className: "docb-caixa styling-regua"},
    h("div", {className: "styling-regua-topo"}, h("b", {className: "styling-largura"}, "1024px"),
      h("code", {className: "styling-literal"}, "size={{base: \"sm\", viewport: {md: \"lg\"}}}")),
    h(A.Slider, {label: "Window width", labelHidden: true, min: 320, max: 1600, step: 8, defaultValue: 1024, locale: "en-US"}),
    h("div", {className: "styling-degraus", "aria-hidden": "true"}, ...degrausVw.map(([nome, px]) =>
      h(A.Badge, {key: nome, variant: px <= 1024 ? "primary" : "neutral", ...(px <= 1024 ? {emphasis: "solid"} : {}), size: "lg",
        className: "styling-degrau-vw", "data-px": px}, `${nome} ${px}`))),
    h("div", {className: "styling-saida", "aria-live": "polite"},
      // O botão é a amostra do tamanho, não um controle: fica fora do Tab e do leitor de tela (a frase ao lado diz o tamanho).
      h("span", {className: "styling-salvar", "aria-hidden": "true"}, h(A.Button, {variant: "primary", size: "lg", tabIndex: -1}, "Save")),
      h("code", {className: "styling-explica"}, "md applies (768px or wider) → size \"lg\"")));

  const partes = [
    g.doDesenho("four-ways", "Four ways, in order", "Climb down only when you must", escada),
    g.doMd("start-with-props", "01 · Props", g.blocos(pr.blocos, {troca: b => b === mantem ? [g.p(b), selos] : undefined})),
    g.doMd("basic-styling", "02 · className", g.blocos(bs.blocos, {troca: b => b === codigoCheckout ? [g.codigo(b), classe] : undefined})),
    g.doMd("how-your-css-wins", "03 · Your CSS", [g.p(primeiroCw), camadas,
      h("div", {key: "nao", className: "styling-painel", "data-camadas": "no"}, g.codigo(codigoSolto)),
      h("div", {key: "sim", className: "styling-painel", "data-camadas": "yes", hidden: true}, g.p(ordemP), g.codigo(codigoOrdem))]),
    g.doMd("use-the-tokens", "04 · Tokens", g.blocos(tk.blocos, {troca: b => b === regras ? cartoesRegras : undefined})),
    g.doMd("state-based-styling", "data-* and aria-*", g.blocos(sb.blocos, {legenda: sb.rotulo, troca: b => b === primeiroSb ? [g.p(b), estado] : undefined})),
    g.doMd("responsive-design", "Viewport or container", g.blocos(rd.blocos, {legenda: rd.rotulo, troca: b => b === primeiroRd ? [g.p(b), regua] : undefined})),
    g.doMd("class-names", "Short and flat"),
    g.doMd("plain-html", "No React"),
    g.doMd("next-steps", "Keep going", [g.proximos(g.secao("next-steps"), [["play", "pink", "How components move."],
      ["palette", "green", "Change the tokens."], ["stack", "orange", "Build bigger pieces."]])]),
  ];
  return g.pagina({pecas, partes});
}
