// A FRAMEWORKS NO DESENHO B (aprovado em 26/10/2026; o cartão de escolha, em 01/11/2026): a abertura no palco; as duas
// provas; «Choose a framework» com o `RadioGroup variant="card"` (o ITEM 1, a opção B), que troca tudo o que vem embaixo;
// o gerenciador de pacotes; os passos numerados com o código de cada arquivo (`CodeBlock filename`, o ITEM 6). O texto
// é o do `frameworks.md`, seção por seção. O comportamento está em `site-b/js/frameworks.js`.
import {ferramentas} from "./_getting-started/comum.mjs";

const ADD = "pnpm add ";
// [chave, nome, frase, ícone, cor, o arquivo da peça que flutua]
const FW = [
  ["next", "Next.js", "App Router, with Server Components", "stack", "blue", "app/layout.tsx"],
  ["vite", "Vite", "Client rendering only", "lightning", "orange", "src/main.tsx"],
  ["html", "Plain HTML", "The CSS and the fonts, no React", "code", "green", "index.html"],
  ["rn", "React Native", "Its own package, with Expo", "device-mobile", "pink", "@aurea-uds/native"],
];

export default function frameworks(site, doc) {
  const {h, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  // As seções de um framework: o h2 dele e os h3 que vêm depois, até o próximo h2.
  const do_ = rotulo => {
    const i = sec.lista.findIndex(x => x.tipo === "h2" && x.rotulo === rotulo);
    const fim = sec.lista.findIndex((x, j) => j > i && x.tipo === "h2");
    return {topo: sec.lista[i], filhos: sec.lista.slice(i + 1, fim < 0 ? undefined : fim)};
  };
  const next = do_("Next.js"), vite = do_("Vite"), html = do_("Plain HTML").topo, rn = do_("React Native").topo;
  const sem = rotulo => rotulo.replace(/^\d+\.\s*/, "");
  const tipos = (blocos, tipo) => blocos.filter(b => b.tipo === tipo);

  // O bloco de instalar: o comando muda com o gerenciador (o `frameworks.js` lê os pacotes daqui).
  const instalar = codigo => {
    const pacotes = codigo.replace(/^pnpm add /, "");
    return h("div", {"data-fw-instalar": pacotes}, g.codigo(ADD + pacotes, "Terminal", "bash"));
  };
  // O PASSO: o círculo de 44 com o número e o título (a `step-h` da Quick Start sem o "Mark as done").
  const passo = (id, n, titulo, ...filhos) => h("section", {key: id, className: "intro-sec gs-sec fw-passo", id, "data-gs-sec": id},
    h("div", {className: "gs-passo gs-passo-sm"}, h("span", {className: "gs-passo-n", "aria-hidden": "true"}, n), h("h2", {className: "intro-h2"}, titulo)),
    ...filhos);
  // O pedaço de um framework; só o escolhido aparece.
  const painel = (chave, id, ...filhos) => h("div", {key: chave, className: "fw-painel", id, "data-fw-painel": chave,
    role: "region", "aria-label": FW.find(f => f[0] === chave)[1], hidden: chave !== "next" ? true : undefined}, ...filhos);
  // Os blocos de uma seção do .md, com o "pnpm add" no bloco de instalar.
  const blocos = (lista, arquivos = [], chave = "b") => {
    let k = 0;
    return lista.map((b, n) => b.tipo === "codigo" && /^pnpm add /.test(b.codigo) ? h("div", {key: `${chave}${n}`}, instalar(b.codigo))
      : b.tipo === "codigo" ? g.codigo(b.codigo, arquivos[k++] ?? undefined, b.lingua)
      : g.corpo([b], {chave: `${chave}${n}`})[0]);
  };

  // A ABERTURA
  const abertura = g.abertura(doc, [
    g.numerao("4", "ways in", "one look"),
    g.capsula([h("span", {key: "u", className: "gs-mono"}, "\"use client\""), h("span", {key: "n", className: "gs-amarela fw-nao"}, "not needed")], "fw-peca-uso"),
    g.cartao([h("span", {key: "k", className: "intro-mini"}, "Built on every check"),
      h("span", {key: "1", className: "intro-mini intro-forte"}, "Next.js · Server Components"),
      h("span", {key: "2", className: "intro-mini intro-forte"}, "Vite · client only")], "gs-coluna"),
    g.capsula(h("span", {className: "gs-mono", "data-fw-arquivo": ""}, FW[0][5]), "fw-peca-arquivo")]);

  const prova = (titulo, frase, icone, cor) => h(A.Card, {key: titulo, className: "fw-prova"}, site.blocoDeTile(icone, cor),
    h("div", {className: "fw-prova-texto"}, h("b", null, titulo), h("span", null, frase)),
    h(A.Badge, {tone: "success", dot: true, className: "fw-prova-selo"}, "built on every check"));

  // «CHOOSE A FRAMEWORK»: o cartão de escolha da Aurea, com o ladrilho, o nome, a frase e o selo "Showing" do escolhido.
  const opcao = ([, nome, frase, icone, cor]) => h("span", {className: "fw-opcao"}, site.blocoDeTile(icone, cor),
    h("b", null, nome), h("span", {className: "fw-opcao-frase"}, frase), h("span", {className: "fw-mostrando", "aria-hidden": "true"}, "Showing"));
  const escolha = g.secao("pick", "Step 0", "Choose a framework",
    h(A.RadioGroup, {label: "Framework", labelHidden: true, variant: "card", orientation: "horizontal", defaultValue: "next", name: "fw-qual", className: "fw-escolha"},
      ...FW.map(f => h(A.RadioGroup.Item, {key: f[0], value: f[0], label: opcao(f)}))),
    h("div", {className: "fw-gerenciador"}, g.rotuloK("Package manager"), g.chave("fw-pm", "Package manager", ["pnpm", "npm", "yarn", "bun"], "pnpm")));

  // NEXT.JS
  const [n1, n2, n3, nOnde] = next.filhos;
  const listaOnde = tipos(nOnde.blocos, "ul")[0].itens;
  const ladoOnde = (selo, tom, titulo, itens, chave) => h(A.Card, {key: chave, className: "fw-lado"},
    h("div", {className: "fw-lado-topo"}, h(A.Badge, {tone: tom, className: "fw-tag"}, selo), h("b", null, titulo)),
    h("ul", {className: "gs-lista gs-ul"}, ...itens.map((it, j) => h("li", {key: j}, h("span", null, ...site.pedacos(it, `${chave}${j}`))))));
  const [pOnde] = tipos(nOnde.blocos, "p");
  const painelNext = painel("next", next.topo.id,
    ...g.corpo(next.topo.blocos, {chave: "nx"}),
    passo("next-js-1", "1", sem(n1.rotulo), ...blocos(n1.blocos, [], "n1")),
    passo("next-js-2", "2", sem(n2.rotulo), ...blocos(n2.blocos, ["app/layout.tsx"], "n2")),
    passo("next-js-3", "3", sem(n3.rotulo), ...blocos(n3.blocos, ["app/page.tsx"], "n3")),
    g.secao("next-js-where", "Server and client", nOnde.rotulo,
      h("div", {className: "gs-grade-2"},
        ladoOnde("server", "info", "Works in a Server Component", [listaOnde[0], listaOnde[2], listaOnde[3]], "sv"),
        h(A.Card, {key: "cl", className: "fw-lado"},
          h("div", {className: "fw-lado-topo"}, h(A.Badge, {tone: "primary", className: "fw-tag"}, "\"use client\""), h("b", null, "Already client")),
          h("ul", {className: "gs-lista gs-ul"}, h("li", null, h("span", null, ...site.pedacos(listaOnde[1], "cl1"))),
            h("li", null, h("span", null, ...site.pedacos(pOnde.texto, "cl2")))))),
      g.codigo(tipos(nOnde.blocos, "codigo")[0].codigo, "app/save-toggle.tsx", "tsx")));

  // VITE: os dois passos; os dois últimos parágrafos viram as "Two notes".
  const [v1, v2] = vite.filhos;
  const notas = tipos(v2.blocos, "p").slice(-2);
  const painelVite = painel("vite", vite.topo.id,
    passo("vite-1", "1", sem(v1.rotulo), ...blocos(v1.blocos, [], "v1")),
    passo("vite-2", "2", sem(v2.rotulo), ...blocos(v2.blocos.filter(b => !notas.includes(b)), ["src/main.tsx", "index.html"], "v2")),
    g.secao("vite-notes", "Good to know", "Two notes",
      ...notas.map((b, n) => h(A.Alert, {appearance: "soft", key: n, variant: "info", className: "gs-aviso"}, ...site.pedacos(b.texto, `vn${n}`)))));

  // PLAIN HTML: p, código · p, código, p · p, código.
  const hb = html.blocos;
  const painelHtml = painel("html", html.id,
    passo("plain-html-1", "1", "Install the CSS and the fonts", ...blocos(hb.slice(0, 2), [], "h1")),
    passo("plain-html-2", "2", "Load the fonts before the core", ...blocos(hb.slice(2, 5), ["index.html"], "h2")),
    passo("plain-html-3", "3", "Add the behavior file", ...blocos(hb.slice(5), ["index.html"], "h3")));

  // REACT NATIVE: p, código · p (o link da Quick Start, com o endereço do nativo).
  const painelRn = painel("rn", rn.id,
    passo("react-native-1", "1", "Install the native package", ...blocos(rn.blocos.slice(0, 2), [], "r1")),
    passo("react-native-2", "2", "Fonts and provider", ...blocos(rn.blocos.slice(2), [], "r2")));

  // NEXT STEPS: os quatro links do .md, com a frase do desenho.
  const frases = {"Quick Start": ["rocket", "green", "Install, styles, provider and icons."], Components: ["squares-four", "orange", "Every component, with its props table."],
    "Dark Mode": ["moon", "pink", "The two themes, and how to switch."], Styling: ["paint-brush", "teal", "Change the look without breaking it."]};
  const passos = sec.por("Next steps");
  const seguir = g.secao(passos.id, "Keep going", "Next steps", g.links(tipos(passos.blocos, "ul")[0].itens.map(it => {
    const link = it.find(x => x.link !== undefined);
    const [icone, cor, frase] = frases[link.link] || ["arrow-right", "blue", ""];
    return [link.link, link.href, icone, cor, frase];
  })));

  const node = g.pagina(doc, abertura,
    ...g.corpo(sec.antes, {chave: "a"}),
    h("div", {className: "gs-grade-2"}, prova("Next.js proof app", "Server Components", "stack", "blue"), prova("Vite proof app", "Client rendering only", "lightning", "orange")),
    escolha,
    h("div", {className: "fw-paineis", "data-fw-paineis": ""}, painelNext, painelVite, painelHtml, painelRn),
    seguir);
  const toc = [{id: "pick", label: "Choose a framework"},
    {id: "next-js-1", label: "1. Install"}, {id: "next-js-2", label: "2. Root layout"}, {id: "next-js-3", label: "3. First component"}, {id: "next-js-where", label: "What runs where"},
    {id: "vite-1", label: "1. Install"}, {id: "vite-2", label: "2. Entry file"}, {id: "vite-notes", label: "Two notes"},
    {id: "plain-html-1", label: "1. Install"}, {id: "plain-html-2", label: "2. Fonts before core"}, {id: "plain-html-3", label: "3. Behavior file"},
    {id: "react-native-1", label: "1. Install"}, {id: "react-native-2", label: "2. Fonts and provider"},
    {id: passos.id, label: "Next steps"}];
  return {node, toc};
}
