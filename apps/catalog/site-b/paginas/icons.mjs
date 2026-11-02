// ICONS no desenho B (aprovado em 26/10/2026). O texto é o do `icons.md`; a página arruma como o desenho: os dois passos de
// servir o desenho, a mesa de experimentar o `Icon` — a grade dos dez nomes (o D-6, aprovado em 01/11/2026: cada um é o
// `Toggle area` COM FUNDO, o ícone em cima e o nome embaixo), o peso, o tamanho e o código da linha —, "The filled form" com
// a chave de segmentos de ícone no tamanho a mais (o ITEM 8: `SegmentedControl size="2xl"`, a escolhida troca para o ícone
// cheio sozinha), o `x` fino e o grosso, o que compila e o que não, e o botão com o desenho do app. O comportamento é o
// `site-b/js/icons.js`.
import {docsB} from "./docs-b/comum.mjs";

const NOMES = ["house", "bell", "gear", "magnifying-glass", "star", "heart", "trash", "chart-bar", "floppy-disk", "caret-down"];

export default function icons(site, doc) {
  const g = docsB(site, doc, {arquivos: ["Terminal", "App.tsx", "Icons.tsx", "Settings.tsx", "Icons.tsx", "Router.tsx", "icons.d.ts", "index.html", "App.tsx"]});
  const {h, A} = g;

  const pecas = [
    g.numero("1,433", "glyphs", "regular and filled"),
    g.cartao([h(A.Icon, {key: "r", name: "house", size: "lg"}), h(A.Icon, {key: "f", name: "house", weight: "fill", size: "lg", className: "intro-icone-cheio"}),
      h("span", {key: "t", className: "intro-mini intro-forte"}, "regular · fill")]),
    g.mono("sm 16 · md 20 · lg 24 · xl 32"),
    g.amarela("aurea-icons.svg"),
  ];

  // SERVE THE SPRITE: os dois parágrafos são os dois passos (o número na bolinha amarela); o aviso é o terceiro.
  const sp = g.secao("serve-the-sprite");
  const paragrafos = sp.blocos.filter(b => b.tipo === "p");
  const [copiar, dizer, raiz] = paragrafos;
  const passo = (b, n) => h("div", {key: `passo${n}`, className: "icons-passo"}, h("span", {className: "docb-bolinha"}, n), g.p(b));

  // THE ICON COMPONENT: a mesa de experimentar, no lugar do exemplo do `.md`.
  const ic = g.secao("the-icon-component");
  const exemplo = ic.blocos.find(b => b.tipo === "codigo");
  const linha = "<Icon name=\"house\" size=\"md\" />";
  const mesa = h("div", {key: "mesa", className: "icons-mesa"},
    h("div", {className: "docb-caixa icons-controles"},
      h("p", {className: "docb-rotulo", id: "icons-nome"}, "name"),
      h("div", {className: "icons-grade", role: "group", "aria-labelledby": "icons-nome"}, ...NOMES.map((nome, n) =>
        h(A.Toggle, {key: nome, area: true, value: nome, defaultPressed: n === 0, className: "icons-ladrilho"},
          h("span", {className: "icons-ladrilho-dentro"}, h(A.Icon, {name: nome, size: "lg"}), h("span", null, nome))))),
      h("div", {className: "icons-escolhas"},
        h("div", null, h("p", {className: "docb-rotulo"}, "weight"),
          h(A.SegmentedControl, {label: "weight", size: "lg", selectedStyle: "neutral", value: "regular", onChange: () => {},
            items: [{value: "regular", label: "regular"}, {value: "fill", label: "fill"}]})),
        h("div", {className: "icons-tamanho"}, h("p", {className: "docb-rotulo"}, "size"),
          h(A.SegmentedControl, {label: "size", size: "lg", selectedStyle: "neutral", value: "md", onChange: () => {},
            items: ["sm", "md", "lg", "xl"].map(v => ({value: v, label: v}))}))),
      h(A.CodeBlock, {filename: "Icon.tsx", copyable: true, language: "tsx", className: "icons-linha"}, linha)),
    h("div", {className: "icons-palco", "aria-live": "polite"},
      // O desenho grande é o símbolo do sprite numa ilustração do site (o `Icon` vai até 32); o de verdade fica embaixo.
      h("svg", {className: "icons-grande", "aria-hidden": "true"}, h("use", {href: "#i-house"})),
      h("div", {className: "icons-real"}, h(A.Icon, {name: "house", size: "md"}), h("span", null, "At its real size"),
        h("code", {className: "icons-px"}, "20px"))));

  // THE FILLED FORM: a chave com ícone no tamanho a mais (o ITEM 8), e o `x` fino e o grosso.
  const ff = g.secao("the-filled-form");
  const primeiroFf = ff.blocos[0];
  const abas = h("div", {key: "abas", className: "icons-abas"},
    h(A.SegmentedControl, {label: "Tabs", size: "2xl", selectedStyle: "neutral", value: "home", onChange: () => {},
      items: [{value: "home", label: "Home", icon: "house"}, {value: "alerts", label: "Alerts", icon: "bell"}, {value: "settings", label: "Settings", icon: "gear"}]}));
  const xis = h("div", {key: "xis", className: "docb-grade-2"},
    h("div", {className: "docb-caixa icons-xis"}, h(A.Icon, {name: "x", size: "xl"}), h("code", null, "x")),
    h("div", {className: "docb-caixa icons-xis"}, h(A.Icon, {name: "x", weight: "bold", size: "xl"}), h("code", null, "x · bold")));

  // NAMES ARE CHECKED: o que compila e o que não.
  const nc = g.secao("names-are-checked");
  const primeiroNc = nc.blocos[0];
  const veredito = h("div", {key: "veredito", className: "docb-grade-2"},
    h("div", {className: "docb-caixa icons-veredito"}, h(A.Icon, {name: "caret-down", size: "lg"}), h("code", null, "caret-down"),
      h(A.Badge, {tone: "success", size: "lg", leading: h(A.Icon, {name: "check", size: "sm"})}, "compiles")),
    h("div", {className: "docb-caixa icons-veredito"}, h("code", null, "chevron-down"),
      h(A.Badge, {tone: "danger", size: "lg", leading: h(A.Icon, {name: "x", size: "sm"})}, "does not compile")));

  // YOUR OWN ICONS: o botão com o desenho do app (o mesmo do código), de verdade.
  const oi = g.secao("your-own-icons");
  const codigoRouter = oi.blocos.find(b => b.tipo === "codigo");
  const Router = props => h("svg", {viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props},
    h("rect", {x: 3, y: 13, width: 18, height: 7, rx: 2}), h("path", {d: "M7 13V8M17 13V8"}));
  const roteador = h("div", {key: "roteador", className: "icons-roteador"}, h(A.Button, {variant: "primary", leadingIcon: Router}, "Add router"));

  // WHAT IS LEFT OUT: o parágrafo é a nota do desenho.
  const lo = g.secao("what-is-left-out");

  const partes = [
    g.doMd("serve-the-sprite", "A static file", g.blocos(sp.blocos, {troca: b => b === copiar ? passo(b, 1) : b === dizer ? passo(b, 2)
      : b === raiz ? g.aviso(b, "warning") : undefined})),
    g.doMd("the-icon-component", "One glyph", g.blocos(ic.blocos, {troca: b => b === exemplo ? mesa : undefined})),
    g.doMd("the-filled-form", "weight=\"fill\"", g.blocos(ff.blocos, {troca: b => b === primeiroFf ? [g.p(b), abas] : undefined}).concat([xis])),
    g.doMd("names-are-checked", "TypeScript", g.blocos(nc.blocos, {troca: b => b === primeiroNc ? [g.p(b), veredito] : undefined})),
    g.doMd("your-own-icons", "Your logo, your glyph", g.blocos(oi.blocos, {troca: b => b === codigoRouter ? [g.codigo(b), roteador] : undefined})),
    g.doMd("plain-html", "No React"),
    g.doMd("react-native", "One module per glyph"),
    g.doMd("what-is-left-out", "On purpose", lo.blocos.map(b => b.tipo === "p" ? g.aviso(b, "info") : g.bloco(b))),
    g.doMd("next-steps", "Keep going", [g.proximos(g.secao("next-steps"), [["hexagon", "orange", "See the icon sizes."],
      ["arrows-left-right", "green", "How icons flip, or do not."], ["eye", "blue", "Labels and contrast."]])]),
  ];
  return g.pagina({pecas, partes});
}
