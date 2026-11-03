// A DESIGN PRINCIPLES NO DESENHO B (aprovado em 26/10/2026): a abertura no palco; o mapa das dez regras (cartões que levam
// à regra, o selo "Checked" nas que um teste cobra); cada regra com o número grande, o texto do `.md` e o painel ao lado,
// que fica parado ao rolar ("Try it", "Compare", "Build the line"…). O "Build the line" é a chave de segmentos que QUEBRA
// a linha (`SegmentedControl wrap`, o ITEM 3, com a escolhida no `emphasis`, a "C" de 02/11/2026). O comportamento dos painéis está em
// `site-b/js/design-principles.js`.
import {ferramentas} from "./_getting-started/comum.mjs";

const APARENCIAS = ["solid", "outline", "ghost", "link", "nav", "soft"];
const TONS = ["neutral", "brand", "danger", "success", "warning", "info"];
// O mapa: o nome curto de cada regra e se um teste a cobre (o desenho).
const MAPA = [["Low vision first", true], ["Tokens are the single source", true], ["A shape you can recognise", true], ["No lines", true],
  ["No gradients", true], ["The yellow does not change", false], ["Meaning before appearance", false], ["Behaviour from a proven engine", false],
  ["One API across web and native", false], ["Grow by variation", false]];
const NO_INDICE = ["1 · Low vision first", "2 · Tokens", "3 · A shape", "4 · No lines", "5 · No gradients", "6 · The yellow", "7 · Meaning first",
  "8 · Engine and skin", "9 · One API", "10 · Grow by variation"];

export default function designPrinciples(site, doc) {
  const {h, Fragment, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  const regras = sec.lista.filter(s => s.tipo === "h3");
  const nucleo = sec.por("Core principles"), mantidos = sec.por("How the principles are kept");

  const abertura = g.abertura(doc, [
    g.numerao("10", "rules", "most of them tested"),
    g.cartao([h("span", {key: "c", className: "dp-forma-cartao"}), h("span", {key: "k", className: "dp-forma-capsula"}, "capsule"),
      h("span", {key: "o", className: "dp-forma-circulo"})]),
    g.cartao([h("span", {key: "a", className: "dp-amarelo"}), h("span", {key: "t", className: "gs-mono dp-pequeno"}, "oklch(0.795 0.184 86.047)")]),
    g.capsula(h("span", {className: "intro-mini intro-forte dp-sem-linha"}, "No lines · no gradients"))]);

  // O PAINEL ao lado de cada regra: o rótulo e o quadro no fundo da página.
  const painel = (rotulo, ...filhos) => h("div", {className: "dp-painel"}, h("p", {className: "gs-k dp-painel-k"}, rotulo), ...filhos);
  const quadro = (filhos, classe = "") => h("div", {className: `dp-quadro ${classe}`.trim()}, ...[].concat(filhos));
  const cod = s => h("code", null, s);

  // Os blocos de código de uma regra, com o nome do arquivo do desenho.
  const blocosDa = (n, opcoes = {}) => g.corpo(regras[n].blocos, {chave: `r${n}`, ...opcoes});
  const plataformaChave = () => g.chave("dp-plataforma", "Platform", [["web", "Web"], ["native", "Native"]], "web", {cheia: true});

  const paineis = [
    // 01: o anel de foco pintado no botão, a régua dos 44 e o botão que liga o anel.
    painel("Try it", quadro([h(A.Button, {size: "lg", key: "b", variant: "primary", className: "dp-salvar", "data-dp-salvar": ""}, "Save"),
      h("span", {key: "r", className: "dp-regua", "aria-hidden": "true"}, h("i"), "44 px")]),
      h(A.Toggle, {className: "dp-ligar"}, "Show the focus ring")),
    // 02: três tokens.
    painel("Three tokens", quadro([["--radius-card", "22px"], ["--space-4", "space"], ["--card", "colour"]].map(([n, v]) =>
      h("span", {key: n, className: "dp-token"}, n, h("b", null, v))), "dp-coluna")),
    // 03: as quatro formas.
    painel("The four shapes", quadro([["dp-forma-22", "22"], ["dp-forma-32", "32"], ["capsula", "999"], ["circulo", "circle"]].map(([forma, rotulo]) =>
      h("div", {key: rotulo, className: "dp-forma"},
        forma === "capsula" ? h("span", {className: "dp-forma-capsula"}, "Capsule")
          : forma === "circulo" ? h("span", {className: "dp-forma-circulo dp-forma-icone"}, h(A.Icon, {name: "plus"}))
          : h("span", {className: forma}),
        h("p", {className: "dp-forma-rotulo"}, rotulo))), "dp-formas")),
    // 04: a linha contra o fundo (a linha é desenho, um traço de SVG — nenhuma peça desenha borda) e os três fundos.
    painel("Compare", g.chave("dp-linha", "Separate with", [["old", "A line"], ["new", "A fill"]], "new", {cheia: true}),
      quadro([h("svg", {key: "o", className: "dp-caixa dp-caixa-linha", viewBox: "0 0 120 72", "aria-hidden": "true", "data-dp-linha": "old", hidden: true},
        h("rect", {x: "0.5", y: "0.5", width: "119", height: "71", rx: "22"})),
        h("span", {key: "n", className: "dp-caixa dp-caixa-fundo", "data-dp-linha": "new"})]),
      h("div", {className: "dp-fundos"}, ...[1, 2, 3].map(n => h("span", {key: n, "data-fundo": n}, `fill-${n} ${[6, 10, 20][n - 1]}%`)))),
    // 05: uma cor por superfície.
    painel("One colour per surface", quadro(h("div", {className: "dp-solidos"}, ...["primary", "card", "segment", "fill"].map(c =>
      h("i", {key: c, "data-cor": c}))))),
    // 06: as duas metades, cada uma no seu tema.
    painel("Dark and light", h("div", {className: "dp-metades"},
      ...[["dark", "dark"], ["light", "light"]].map(([tema, rotulo]) => h("div", {key: tema, "data-theme": tema}, h("span", {className: "dp-amarelo dp-amarelo-g"}), rotulo)))),
    // 07: a linha do botão, montada nas duas chaves que quebram.
    painel("Build the line",
      g.chave("dp-aparencia", "appearance", APARENCIAS, "solid", {tamanho: "", quebra: true, classe: "dp-chave-mono"}),
      g.chave("dp-tom", "tone", TONS, "brand", {tamanho: "", quebra: true, classe: "dp-chave-mono"}),
      h("p", {className: "dp-linha-saida", "aria-live": "polite"}, '<Button appearance="', h("span", {"data-dp-saida": "aparencia"}, "solid"),
        '" tone="', h("span", {"data-dp-saida": "tom"}, "brand"), '">Save</Button>')),
    // 08: as duas camadas, na web e no nativo.
    painel("Two layers", plataformaChave(),
      h("div", {className: "dp-camadas"},
        h("div", {className: "dp-camada dp-camada-pele"}, h("b", null, "Skin · Aurea"),
          h("span", {"data-dp-web": ""}, "Every pixel of the look. No engine style reaches the core stylesheet."),
          h("span", {"data-dp-native": "", hidden: true}, "A plain StyleSheet and Aurea’s own theme provider.")),
        h("div", {className: "dp-camada dp-camada-motor"},
          h("b", {"data-dp-web": ""}, "Behaviour · Base UI"), h("b", {"data-dp-native": "", hidden: true}, "Behaviour · React Native primitives"),
          h("span", {"data-dp-web": ""}, "Focus, keyboard and ARIA, from a proven engine."),
          h("span", {"data-dp-native": "", hidden: true}, "The components are built on React Native primitives.")))),
    // 09: as alturas dos controles, lidas dos tokens de cada alvo.
    painel("Control heights", plataformaChave(),
      quadro([...[["sm", "--control-h-sm", "32"], ["md", "--control-h-md", "36"], ["lg", "--control-h-lg", "40"]].map(([n, t, px]) =>
        h("div", {key: `w${n}`, "data-dp-web": ""}, h("i", {style: {blockSize: `calc(var(${t}) * 1.6)`}}), `${n} · ${px}`)),
        ...[["sm", "--touch-control-h-sm", "40"], ["md", "--touch-control-h-md", "48"], ["lg", "--touch-control-h-lg", "56"]].map(([n, t, px]) =>
          h("div", {key: `n${n}`, "data-dp-native": "", hidden: true}, h("i", {style: {blockSize: `calc(var(${t}) * 1.6)`}}), `${n} · ${px}`))], "dp-escala")),
    // 10: os dois nomes.
    painel("Both names work", h("div", {className: "dp-nomes"},
      ...[["<Header>", "works"], ["<Topbar>", "still works"]].map(([nome, selo]) => h("span", {key: nome}, nome,
        h(A.Badge, {tone: "success", dot: true, size: "sm"}, selo))))),
  ];

  // O texto de cada regra, do `.md`; a 9 tem os dois códigos (web e nativo), e o painel escolhe qual aparece.
  const textoDa = n => {
    if (n === 1) return blocosDa(1, {arquivos: ["my-panel.css"]});
    if (n === 6) return blocosDa(6, {arquivos: ["Buttons.tsx"]});
    if (n === 8) {
      const [web, nativo] = regras[8].blocos.filter(b => b.tipo === "codigo");
      const sem = b => b.codigo.split("\n").filter(l => !l.startsWith("//")).join("\n").trim();
      return regras[8].blocos.map((b, k) => b === web ? h("div", {key: k, "data-dp-web": ""}, g.codigo(sem(web), "Web", "tsx"))
        : b === nativo ? h("div", {key: k, "data-dp-native": "", hidden: true}, g.codigo(sem(nativo), "Native", "tsx"))
        : g.corpo([b], {chave: `r8-${k}`})[0]);
    }
    return blocosDa(n);
  };
  const regra = (s, n) => h("section", {key: s.id, className: "intro-sec gs-sec dp-regra-sec", id: s.id, "data-gs-sec": s.id},
    h("div", {className: "dp-regra"},
      h("div", {className: "dp-regra-texto"},
        h("div", {className: "dp-regra-topo"}, h("span", {className: "dp-regra-n", "aria-hidden": "true"}, String(n + 1).padStart(2, "0")),
          h("h2", {className: "intro-h2"}, s.rotulo.replace(/^\d+\.\s*/, ""))),
        ...textoDa(n)),
      paineis[n]));

  const [pMantidos, ...restoMantidos] = mantidos.blocos;
  const node = g.pagina(doc, abertura,
    ...g.corpo(sec.antes, {chave: "a"}),
    g.secao(nucleo.id, "Core principles", "The ten rules.",
      h("div", {className: "dp-mapa"}, ...regras.map((s, n) => h(A.Card, {key: s.id, variant: "interactive", lift: true, className: "dp-mapa-item",
        render: h("a", {href: `#${s.id}`})},
        h("span", {className: "dp-mapa-n"}, String(n + 1).padStart(2, "0")), h("b", null, MAPA[n][0]),
        MAPA[n][1] ? h(A.Badge, {tone: "success", dot: true, size: "sm", className: "dp-mapa-selo"}, "Checked") : null)))),
    ...regras.map(regra),
    g.secao(mantidos.id, "Enforced", "How the principles are kept",
      ...g.corpo([pMantidos], {chave: "m"}),
      ...restoMantidos.filter(b => b.tipo === "tabela").map((b, k) => g.tabelaB(b, `mt${k}`, "How the principles are kept")),
      ...restoMantidos.filter(b => b.tipo === "p").map((b, k) => h(A.Alert, {appearance: "soft", key: `ma${k}`, variant: "success", className: "gs-aviso"}, ...site.pedacos(b.texto, `ma${k}`)))));
  const toc = [{id: nucleo.id, label: "The ten rules"}, ...regras.map((s, n) => ({id: s.id, label: NO_INDICE[n]})), {id: mantidos.id, label: "How they are kept"}];
  return {node, toc};
}
