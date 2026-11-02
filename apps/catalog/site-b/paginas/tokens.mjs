// A PÁGINA "TOKENS" NO DESENHO B (aprovado em 26/10/2026; o mapa em `bancada-site-b/mapa/grupo-2.md`, "tokens").
// O palco; a barra das ferramentas (achar um token, e os valores do escuro ou do claro); e dez partes — os papéis de cor, as
// escalas de estado, as marcas, os raios, o espaço, as letras, as alturas por densidade, o movimento, as sombras e os
// números. Cada amostra é um botão que copia o `var(--nome)`. O VALOR de cada token é lido do CSS na hora (o `tokens.js`),
// e não escrito aqui: assim ele é sempre o que a página está usando, no tema escolhido em "Values for".
const COR = ["background", "foreground", "card", "secondary", "muted-foreground", "primary", "primary-foreground", "link",
  "destructive", "destructive-foreground", "border", "brand-yellow-ink"];
const ESCALAS = [["Success", "success", [400, 500, 700]], ["Warning", "warning", [400, 500, 800]], ["Danger", "danger", [400, 500, 800]],
  ["Info", "info", [400, 500, 800]]];
const RAIOS = ["xs", "sm", "md", "lg", "card", "sheet", "control"];
const ESPACO = ["05", "1", "2", "3", "4", "5", "6", "7", "8", "10", "12", "16", "20", "24"];
const LETRAS = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"];
const FONTES = ["ui", "heading", "editorial", "code"];
const ALTURAS = ["control-h-xs", "control-h-sm", "control-h-md", "control-h-lg", "control-h-xl"];
const TOQUE = ["touch-control-h-sm", "touch-control-h-md", "touch-control-h-lg", "row-h", "card-pad", "section-gap"];
const TEMPOS = ["duration-fast", "duration-base", "duration-slow"];
const CURVAS = ["ease-standard", "ease-emphasized"];
const SOMBRAS = ["shadow-sm", "shadow-md", "shadow-lg"];
const CAMADAS = ["z-base", "z-sticky", "z-dropdown", "z-drawer", "z-modal", "z-toast"];
const PESOS = [["regular", 400], ["medium", 500], ["semibold", 600], ["bold", 700], ["extrabold", 800]];
const LINHAS = ["leading-tight", "leading-normal", "leading-relaxed", "opacity-disabled"];

// Conta as folhas do arquivo de tokens (cada uma tem `$value`).
const contar = no => Object.entries(no).reduce((n, [k, v]) => k.startsWith("$") || !v || typeof v !== "object" ? n : n + ("$value" in v ? 1 : contar(v)), 0);

export default function tokens(site) {
  const {h, Fragment, A, tokensDoc, hexDoToken, textoParaCopiar} = site;
  const total = contar(tokensDoc);
  const marcas = [{id: "", nome: "Gold", cor: hexDoToken(tokensDoc.base["brand-yellow"])},
    ...Object.keys(tokensDoc.brand).filter(id => !id.startsWith("$")).map(id => ({id, nome: id.charAt(0).toUpperCase() + id.slice(1),
      cor: hexDoToken(tokensDoc.brand[id].dark.primary)}))];

  // Um token que copia: o botão (o `Card` clicável que sobe, o item 7) com a amostra, o nome e o valor (lido na hora).
  const tk = (nome, amostra, classe = "", extra = {}) => h(A.Card, {key: nome, variant: "interactive", lift: true, className: `tk ${classe}`.trim(),
    render: h("button", {type: "button"}), "data-tk": nome, "aria-label": `Copy var(--${nome})`, ...extra},
    amostra, h("code", {className: "tk-nome"}, `--${nome}`), h("span", {className: "tk-valor", "data-tk-valor": nome}));
  // Uma linha que copia: o nome, a barra (ou o texto) e o valor.
  const linha = (nome, meio, classe = "") => h("button", {key: nome, type: "button", className: `tk-linha ${classe}`.trim(), "data-tk": nome,
    "aria-label": `Copy var(--${nome})`}, h("code", {className: "tk-nome"}, `--${nome}`), meio, h("span", {className: "tk-valor", "data-tk-valor": nome}));
  const barra = (nome, prop = "inline-size") => h("span", {className: "tk-barra-trilho"}, h("span", {className: "tk-barra", style: {[prop === "inline-size" ? "inlineSize" : prop]: `var(--${nome})`}}));
  const secao = (id, num, titulo, conta, texto, ...filhos) => h("section", {key: id, className: "tk-sec", id, "data-tk-sec": ""},
    h("div", {className: "cat-familia-topo tk-cabeca"}, h("span", {className: "cat-familia-num"}, num), h("h2", null, titulo),
      h("span", {className: "cat-familia-conta"}, conta)),
    texto ? h("p", {className: "tk-texto"}, texto) : null, ...filhos);

  const palco = h("section", {className: "intro-palco cat-palco tk-palco", "aria-labelledby": "tk-h1", "data-palco": ""},
    h("div", {className: "intro-palco-texto cat-palco-texto"},
      h("span", {className: "intro-trilha"}, "Tokens ", h("span", {"aria-hidden": "true"}, "/"), " ", h("b", null, "Overview")),
      h("h1", {className: "intro-h1", id: "tk-h1"}, "Tokens"),
      h("p", {className: "intro-lede"}, `${total} tokens in DTCG format ($value / $type) — the single source of the identity. The CSS is one output of this file, not the origin: no visual value is born outside a token.`),
      h("div", {className: "intro-acoes tk-acoes"}, site.acoesDaPagina ? site.acoesDaPagina(true, "md") : null,
        h(A.Button, {variant: "secondary", href: "./docs-theming.html", leadingIcon: "palette", className: "tk-guia"}, "Theming guide"))),
    h("div", {className: "intro-pecas cat-pecas", "aria-hidden": "true"},
      h("div", {className: "intro-peca cat-peca-1", "data-fundo": "1.2"}, h("div", {className: "intro-boia"},
        h(A.Card, {className: "intro-cartao intro-cartao-capsula cat-capsula"}, h("span", {className: "tk-bolinha"}),
          h("span", null, h("code", null, "--brand-yellow"))))),
      h("div", {className: "intro-peca cat-peca-2", "data-fundo": "1.6"}, h("div", {className: "intro-boia"},
        h("span", {className: "cat-numerao"}, h("b", null, "22"), "radius"))),
      h("div", {className: "intro-peca cat-peca-3", "data-fundo": "2"}, h("div", {className: "intro-boia"},
        h(A.Card, {className: "intro-cartao"}, h("span", {className: "intro-aa"}, "Aa"),
          h("span", {className: "intro-mini"}, h("code", null, "--font-heading"), h("br"), "Sora"))))));

  // A BARRA DAS FERRAMENTAS: presa no alto, translúcida (a receita do `Header blurred`).
  const ferramentas = h("div", {className: "tk-ferramentas"},
    h(A.SearchField, {size: "lg", className: "tk-busca", "aria-label": "Find a token", placeholder: "Find a token — try “radius”, “danger” or “control”",
      autoComplete: "off", "data-tk-busca": ""}),
    h("span", {className: "tk-tema"}, h("span", {className: "tk-tema-rotulo", id: "tk-tema-rotulo"}, "Values for"),
      h("span", {className: "segmented", "data-segment-style": "neutral", role: "group", "aria-labelledby": "tk-tema-rotulo"},
        h("button", {type: "button", "data-tk-tema": "dark", className: "active", "aria-pressed": "true"}, "Dark"),
        h("button", {type: "button", "data-tk-tema": "light", "aria-pressed": "false"}, "Light"))));

  const node = h("div", {className: "tk-b", "data-tokens": ""},
    palco,
    ferramentas,
    h("p", {className: "tk-estado", role: "status", "data-tk-estado": ""}, "Press any token to copy it."),
    h("div", {className: "tk-amostras", "data-tk-escopo": ""},
      secao("color-roles", "01", "Color roles", `${COR.length} roles`, "The roles every component reads. Press a card to copy the variable.",
        h("div", {className: "tk-grade-4"}, ...COR.map(n => tk(n, h("span", {className: "tk-amostra", style: {background: `var(--${n})`}}))))),
      secao("status-scales", "02", "Status scales", `${ESCALAS.length} scales`, "The same in both themes. Fills use the middle step; text and icons use the -400 pair.",
        h("div", {className: "tk-grade-4"}, ...ESCALAS.map(([titulo, base, passos]) => h(A.Card, {key: base, className: "tk-escala"},
          h("div", {className: "tk-escala-topo"}, h("b", null, titulo), h("span", null, `${passos.length} steps`)),
          h("div", {className: "tk-escala-passos"}, ...passos.map(p => h("button", {key: p, type: "button", className: "tk-passo", "data-tk": `${base}-${p}`,
            "aria-label": `Copy var(--${base}-${p})`}, h("span", {className: "tk-passo-cor", style: {background: `var(--${base}-${p})`}}),
            h("code", null, `${base}-${p}`)))))))),
      secao("brands", "03", "Brands", `${marcas.length} brands`, "Each brand keeps Aurea's neutrals and redefines the primary color and the roles built on it. Press one to copy its data-brand.",
        h("div", {className: "tk-marcas"}, ...marcas.map(m => h(A.Card, {key: m.nome, variant: "interactive", lift: true, className: "tk tk-marca",
          render: h("button", {type: "button"}), "data-tk-copia": m.id ? `data-brand="${m.id}"` : "(no data-brand)", "aria-label": `Copy the ${m.nome} brand`},
          h(A.ColorSwatch, {color: m.cor, size: "xl", "aria-hidden": true}), h("b", null, m.nome), h("code", {className: "tk-valor"}, m.cor.toUpperCase()))))),
      secao("radius", "04", "Radius", `${RAIOS.length} radii`, "22 on cards, 32 on the bottom sheet, a capsule on controls. Nothing is square.",
        h("div", {className: "tk-raios"}, ...RAIOS.map(r => tk(`radius-${r}`, h("span", {className: "tk-raio", style: {borderRadius: `var(--radius-${r})`}}), "tk-raio-cartao")))),
      secao("space", "05", "Space", `${ESPACO.length} steps`, "",
        h(A.Card, {className: "tk-linhas"}, ...ESPACO.map(s => linha(`space-${s}`, barra(`space-${s}`))))),
      secao("type", "06", "Type", `${LETRAS.length} sizes · ${FONTES.length} families`, "",
        h(A.Card, {className: "tk-linhas"}, ...LETRAS.map(t => linha(`text-${t}`, h("span", {className: "tk-letra", style: {fontSize: `var(--text-${t})`}}, "One look"), "tk-linha-letra"))),
        h("div", {className: "tk-grade-4"}, ...FONTES.map(f => tk(`font-${f}`, h("span", {className: "tk-aa", style: {fontFamily: `var(--font-${f})`}}, "Aa"), "tk-fonte")))),
      secao("density", "07", "Controls and density", "3 densities", "Heights come from the density. On a touch screen every control floors at the touch height.",
        h("span", {className: "segmented", "data-segment-style": "neutral", role: "group", "aria-label": "Density"},
          ...["compact", "comfortable", "spacious"].map(d => h("button", {key: d, type: "button", "data-tk-densidade": d,
            className: d === "comfortable" ? "active" : undefined, "aria-pressed": d === "comfortable" ? "true" : "false"}, d[0].toUpperCase() + d.slice(1)))),
        h("div", {className: "tk-dois", "data-tk-densidade-escopo": "", "data-density": "comfortable"},
          h(A.Card, {className: "tk-linhas"}, ...ALTURAS.map(n => linha(n, barra(n)))),
          h(A.Card, {className: "tk-linhas"}, ...TOQUE.map(n => linha(n, barra(n)))))),
      secao("motion", "08", "Motion", `${TEMPOS.length} durations · ${CURVAS.length} easings`, "Press Play to see each duration and easing move the same distance.",
        h(A.Card, {className: "tk-linhas"}, ...[...TEMPOS, ...CURVAS].map(n => h("div", {key: n, className: "tk-mov"},
          h("button", {type: "button", className: "tk-mov-nome", "data-tk": n, "aria-label": `Copy var(--${n})`},
            h("code", {className: "tk-nome"}, `--${n}`), h("span", {className: "tk-valor", "data-tk-valor": n})),
          h("span", {className: "tk-trilho"}, h("span", {className: "tk-bola", "data-tk-mov": n})),
          h(A.Button, {variant: "secondary", size: "sm", type: "button", "data-tk-play": n, "aria-label": `Play ${n}`}, "Play"))))),
      secao("shadow", "09", "Shadow", `${SOMBRAS.length} shadows`, "",
        h(A.Card, {variant: "inset", className: "tk-sombras"}, ...SOMBRAS.map(n => tk(n, null, "tk-sombra", {style: {boxShadow: `var(--${n})`}})))),
      secao("numbers", "10", "Numbers", `${CAMADAS.length + PESOS.length + LINHAS.length} numbers`, "",
        h("div", {className: "tk-dois"},
          h(A.Card, {className: "tk-painel"}, h("h3", null, "Layers"),
            h("div", {className: "tk-camadas"}, ...CAMADAS.map((n, i) => h(A.Button, {key: n, variant: "secondary", size: "lg", fullWidth: true, type: "button",
              className: "tk-camada", style: {marginInlineStart: `calc(${i} * var(--space-4))`}, "data-tk": n},
              h("code", null, `--${n}`), h("span", {"data-tk-valor": n}))))),
          h(A.Card, {className: "tk-painel"}, h("h3", null, "Weights"),
            h("div", {className: "tk-pesos"}, ...PESOS.map(([n, v]) => h(A.Card, {key: n, variant: "interactive", lift: true, className: "tk tk-peso",
              render: h("button", {type: "button"}), "data-tk": `weight-${n}`, "aria-label": `Copy var(--weight-${n})`},
              h("span", {style: {fontWeight: `var(--weight-${n})`}}, "Aa"), h("span", null, v)))),
            h("h3", null, "Line height and opacity"),
            h("div", {className: "tk-camadas"}, ...LINHAS.map(n => h(A.Button, {key: n, variant: "secondary", size: "lg", fullWidth: true, type: "button",
              className: "tk-camada", "data-tk": n}, h("code", null, `--${n}`), h("span", {"data-tk-valor": n})))))))),
    h(A.Card, {className: "tk-vazio", "data-tk-vazio": "", hidden: true},
      h(A.EmptyState, {framed: true, icon: "magnifying-glass", titleAs: "h3", title: h("span", {"data-tk-vazio-titulo": ""}, "No token found"),
        description: "Try a shorter word: “space”, “text” or “radius”.",
        action: h(A.Button, {variant: "primary", type: "button", "data-tk-limpar": ""}, "Clear the search")})),
    textoParaCopiar(["# Tokens", "", `${total} tokens in DTCG format ($value / $type). The CSS is one output of this file, not the origin.`, "",
      "Color roles: " + COR.map(n => `\`--${n}\``).join(", "), "", "Radius: " + RAIOS.map(r => `\`--radius-${r}\``).join(", "), "",
      "Space: " + ESPACO.map(s => `\`--space-${s}\``).join(", "), "", "Type: " + LETRAS.map(t => `\`--text-${t}\``).join(", ")].join("\n")));
  return {node, toc: []};
}
