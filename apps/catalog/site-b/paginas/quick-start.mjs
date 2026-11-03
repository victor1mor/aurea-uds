// A QUICK START NO DESENHO B (aprovado em 26/10/2026; as peças, em 01/11/2026): a abertura no palco; a escolha do alvo
// (`RadioGroup variant="card"`, o ITEM 1) e do gerenciador de pacotes; "Your setup" (`Stepper variant="bar"`, o D-1 —
// cada parte leva ao passo e fica verde quando ele é marcado); os passos com o "Mark as done" (`Checkbox variant="pill"
// tone="success"`, o ITEM 4) e o código com o nome do arquivo (`CodeBlock filename`, o ITEM 6). O comportamento (o alvo,
// o gerenciador, os passos feitos) está em `site-b/js/quick-start.js`.
import {ferramentas} from "./_getting-started/comum.mjs";

const PACOTES = {web: "@aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons", native: "@aurea-uds/native react-native-svg react-native-safe-area-context"};
const ADD = {pnpm: "pnpm add ", npm: "npm install ", yarn: "yarn add ", bun: "bun add "};

export default function quickStart(site, doc) {
  const {h, Fragment, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  const s = rotulo => sec.por(rotulo);
  // Os passos de cada alvo, na ordem: [id da seção, nome curto do passo].
  const web = [["install", "Install"], ["styles", "Import the styles"], ["provider", "Add the provider"], ["icons", "Set up the icons"],
    ["first", "Your first component"], ["theme", "Theme and density"]];
  const nativo = [["install", "Install"], ["setup", "Fonts and provider"], ["pickers", "The pickers"]];
  const ids = {install: s("Install").id, styles: s("Import the styles").id, provider: s("Add the provider").id, icons: s("Set up the icons").id,
    first: s("Your first component").id, theme: s("Theme and density").id, setup: s("React Native").id, pickers: "the-pickers"};

  // A ABERTURA: o comando (muda com o alvo e o gerenciador), os passos feitos, a ordem dos estilos e o provedor.
  const abertura = g.abertura(doc, [
    g.capsula([site.blocoDeTile("code", "green", "intro-tile-sm"), h("span", {key: "c", className: "gs-mono", "data-qs-comando": ""}, "pnpm add @aurea-uds/react")], "qs-peca-comando"),
    g.cartao([h("span", {key: "n", className: "gs-numerao"}, h("span", {"data-qs-feitos": ""}, "0"), "/", h("span", {"data-qs-total": ""}, web.length)),
      h("span", {key: "t", className: "intro-mini"}, h("b", null, "steps done"), h("br"), "mark them as you go")]),
    g.cartao([h("span", {key: "k", className: "intro-mini"}, "The order matters"),
      h("span", {key: "1", className: "gs-mono"}, h("b", null, "1"), " fonts/css"), h("span", {key: "2", className: "gs-mono"}, h("b", null, "2"), " core/css")], "gs-coluna"),
    g.capsula(g.amarela("<AureaProvider>"))]);

  // A ESCOLHA DO ALVO E DO GERENCIADOR, na faixa do palco.
  const alvo = (titulo, frase, icone, cor) => h("span", {className: "qs-alvo"}, site.blocoDeTile(icone, cor, "qs-alvo-tile"),
    h("span", {className: "qs-alvo-texto"}, h("b", null, titulo), h("span", null, frase)));
  const trilho = h("div", {className: "qs-trilho"},
    h(A.RadioGroup, {label: "What you are building", labelHidden: true, variant: "card", orientation: "horizontal", defaultValue: "web", name: "qs-alvo",
      className: "qs-alvos"},
      h(A.RadioGroup.Item, {value: "web", label: alvo("Web", "React, Next.js, Vite or plain HTML", "browser", "blue")}),
      h(A.RadioGroup.Item, {value: "native", label: alvo("React Native", "A different package, its own components", "device-mobile", "orange")})),
    h("div", {className: "qs-gerenciador"}, g.rotuloK("Package manager"),
      g.chave("qs-pm", "Package manager", ["pnpm", "npm", "yarn", "bun"], "pnpm")));

  // "YOUR SETUP": a barra em partes, uma para cada alvo (a do outro fica escondida).
  const barra = (lista, plataforma) => h("div", {className: "qs-setup", "data-qs-setup": plataforma, hidden: plataforma === "native" ? true : undefined},
    h(A.Stepper, {variant: "bar", label: "Setup progress", startContent: "Your setup", endContent: `0 of ${lista.length} done`,
      items: lista.map(([id, nome], n) => ({label: `Step ${n + 1}: ${nome}`, href: `#${ids[id]}`}))}));

  // O PASSO: o número, o título e o "Mark as done". `data-qs-passo`: o passo em cada alvo ("install" é dos dois).
  const passo = (id, titulo, numero) => h("div", {className: "gs-passo"},
    h("span", {className: "gs-passo-n", "aria-hidden": "true", "data-qs-n": id}, numero),
    h("h2", {className: "intro-h2"}, titulo),
    h(A.Checkbox, {variant: "pill", tone: "success", label: "Mark as done", className: "qs-feito", "data-qs-passo": id}));
  const secaoPasso = (id, titulo, numero, plataforma, ...filhos) => h("section", {key: id, className: "intro-sec gs-sec", id: ids[id], "data-gs-sec": id,
    "data-qs-plataforma": plataforma, hidden: plataforma === "native" ? true : undefined}, passo(id, titulo, numero), ...filhos);
  // Um pedaço que só aparece num dos alvos.
  const so = (plataforma, ...filhos) => h("div", {className: "qs-so", "data-qs-plataforma": plataforma, hidden: plataforma === "native" ? true : undefined}, ...filhos);

  const req = (titulo, frase, icone, cor) => h(A.Card, {key: titulo, className: "gs-cartao qs-req"}, site.blocoDeTile(icone, cor),
    h("div", null, h("b", null, titulo), h("p", null, ...site.linhaMd(frase, titulo))));

  const instalar = s("Install").blocos, rn = s("React Native").blocos;
  const [pInstalarWeb] = instalar.filter(b => b.tipo === "p");
  const [pRn1, pRn2, pRn3] = rn.filter(b => b.tipo === "p");
  const [, codigoRn] = rn.filter(b => b.tipo === "codigo");
  const icones = s("Set up the icons").blocos;
  const avisoIcones = icones.filter(b => b.tipo === "p").at(-1);
  const tema = s("Theme and density").blocos;
  const valores = (nome, lista) => h(A.Card, {className: "qs-atributo"}, h("code", null, nome),
    h("div", {className: "qs-valores"}, ...lista.map(v => h(A.Badge, {key: v, size: "lg", tone: "neutral", className: "qs-valor"}, v))));

  const comando = plataforma => `${ADD.pnpm}${PACOTES[plataforma]}`;
  const node = g.pagina(doc, abertura,
    trilho,
    barra(web, "web"), barra(nativo, "native"),
    g.secao(s("Requirements").id, "Before you start", "Requirements",
      so("web", h("div", {className: "gs-grade-2"},
        req("React 19 or newer", "With `react-dom` 19 or newer. Components take `ref` as a plain prop, which is React 19 behavior.", "atom", "blue"),
        req("A bundler that reads exports", "One that reads the `exports` map of a package and imports CSS files, such as Vite or Next.js. The packages are ESM.", "package", "green"))),
      so("native", h("div", {className: "gs-grade-2"},
        req("React 19 or newer", "The same React version as the web.", "atom", "blue"),
        req("React Native 0.76 or newer", "Do not install `@aurea-uds/react` or `@aurea-uds/core` in a React Native app.", "device-mobile", "orange")))),
    secaoPasso("install", "Install", 1, "both",
      h("div", {"data-qs-instalar": "", "data-web": PACOTES.web, "data-native": PACOTES.native}, g.codigo(comando("web"), "Terminal", "bash")),
      so("web", g.p(pInstalarWeb.texto, "iw")),
      so("native", g.p(pRn1.texto, "in"))),
    secaoPasso("styles", "Import the styles", 2, "web",
      ...g.corpo(s("Import the styles").blocos.slice(0, 1), {chave: "st"}),
      h("div", {className: "gs-grade-2 qs-ordem"},
        ...[["1", "@aurea-uds/fonts/css", "Inter, Sora and IBM Plex Mono"], ["2", "@aurea-uds/core/css", "The tokens and the components"]].map(([n, nome, frase]) =>
          h(A.Card, {key: n, className: "qs-ordem-item"}, h("span", {className: "qs-ordem-n"}, n), h("div", null, h("code", null, nome), h("p", null, frase))))),
      ...g.corpo(s("Import the styles").blocos.slice(1), {chave: "st2", arquivos: ["src/main.tsx · app/layout.tsx"]})),
    secaoPasso("provider", "Add the provider", 3, "web", ...g.corpo(s("Add the provider").blocos, {chave: "pr"})),
    secaoPasso("icons", "Set up the icons", 4, "web",
      ...g.corpo(icones.filter(b => b !== avisoIcones), {chave: "ic"}),
      g.avisoComTitulo("warning", avisoIcones.texto, "av")),
    secaoPasso("first", "Your first component", 5, "web", ...g.corpo(s("Your first component").blocos, {chave: "fc", arquivos: ["Screen.tsx"]})),
    secaoPasso("theme", "Theme and density", 6, "web",
      g.p(tema[0].texto, "t0"),
      h("div", {className: "gs-grade-2"}, valores("data-theme", ["light", "dark"]), valores("data-density", ["compact", "comfortable", "spacious"])),
      ...g.corpo(tema.slice(1), {chave: "t1"})),
    secaoPasso("setup", "Fonts and provider", 2, "native",
      g.p(pRn2.texto, "rn2"), g.codigo(codigoRn.codigo, "App.tsx", "tsx")),
    secaoPasso("pickers", "The pickers", 3, "native", g.p(pRn3.texto, "rn3")),
    g.secao(s("After you upgrade").id, "Later", "After you upgrade",
      h(A.Alert, {appearance: "soft", variant: "warning", className: "gs-aviso", icon: "arrow-clockwise"},
        ...site.pedacos(s("After you upgrade").blocos[0].texto, "up"))),
    g.secao(s("What's next").id, "Keep going", "What's next",
      g.linksDaLista(s("What's next").blocos.find(b => b.tipo === "ul"),
        [["layout", "blue"], ["squares-four", "orange"], ["palette", "green"], ["stack", "pink"]])));
  const toc = [["Requirements", "Requirements"], ["Install", "Install"], ["Import the styles", "Import the styles"], ["Add the provider", "Add the provider"],
    ["Set up the icons", "Set up the icons"], ["Your first component", "Your first component"], ["Theme and density", "Theme and density"],
    ["React Native", "Fonts and provider"]].map(([r, label]) => ({id: s(r).id, label}))
    .concat([{id: "the-pickers", label: "The pickers"}, {id: s("After you upgrade").id, label: "After you upgrade"}, {id: s("What's next").id, label: "What's next"}]);
  return {node, toc};
}
