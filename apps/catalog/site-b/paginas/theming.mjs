// A THEMING NO DESENHO B (aprovado em 26/10/2026; as marcas, em 01/11/2026 — o ITEM 1 no Theming): a abertura no palco; o
// laboratório (os três atributos, com a prévia de peças de verdade dentro de um pedaço que os recebe); os sufixos em
// cartões; as treze marcas no cartão de escolha sem a bolinha (`RadioGroup variant="card" indicatorPlacement="none"`), com
// a amostra na cor da marca de verdade — o `--primary` dela, lido do arquivo de tokens, nos dois temas; e o tema num pedaço
// da página. O texto vem do `theming.md`. O comportamento (o laboratório e as marcas, ligados) está em `site-b/js/theming.js`.
import {ferramentas} from "./_getting-started/comum.mjs";

const NOMES = {gold: "Gold", ember: "Ember", sun: "Sun", honey: "Honey", orange: "Orange", magenta: "Magenta", violet: "Violet", indigo: "Indigo",
  cobalt: "Cobalt", cyan: "Cyan", turquoise: "Turquoise", emerald: "Emerald", lime: "Lime"};

export default function theming(site, doc) {
  const {h, Fragment, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  const s = rotulo => sec.por(rotulo);
  const bl = (rotulo, tipo) => s(rotulo).blocos.filter(b => b.tipo === tipo);
  const tabela = (rotulo, legenda = rotulo) => g.tabelaB(bl(rotulo, "tabela")[0], `t-${s(rotulo).id}`, legenda);
  const ul = (it, chave) => h("ul", {key: chave, className: "gs-lista gs-ul"}, ...it.map((x, n) => h("li", {key: n}, h("span", null, ...site.pedacos(x, `${chave}${n}`)))));

  // AS TREZE MARCAS, com a cor de verdade: o `--primary` e a tinta sobre ele, em cada tema, lidos do arquivo de tokens.
  const tokens = site.tokensDoc;
  const hex = t => site.hexDoToken(t).toUpperCase();
  const corDa = (id, tema, papel) => {
    if (id === "gold") return hex(tokens.base[papel === "primary" ? "brand-yellow" : "brand-yellow-ink"]);
    return hex(tokens.brand[id][tema][papel]);
  };
  const marcas = ["gold", ...Object.keys(tokens.brand).filter(id => !id.startsWith("$"))].map(id => ({id, curto: NOMES[id] || id,
    nome: `Aurea ${NOMES[id] || id}`, attr: id === "gold" ? "none (the default)" : `data-brand="${id}"`,
    claro: corDa(id, "light", "primary"), escuro: corDa(id, "dark", "primary"),
    tintaClaro: corDa(id, "light", "primary-foreground"), tintaEscuro: corDa(id, "dark", "primary-foreground")}));
  // A cor da marca entra como variável (a do tema da página escolhe): `--th-cor` e `--th-tinta`.
  const cores = m => ({"--th-claro": m.claro, "--th-escuro": m.escuro, "--th-tinta-claro": m.tintaClaro, "--th-tinta-escuro": m.tintaEscuro});

  // A ABERTURA: três atributos, treze paletas, a camada e a linha do html (muda com o laboratório).
  const quatro = ["gold", "cobalt", "magenta", "emerald"].map(id => marcas.find(m => m.id === id));
  const abertura = g.abertura(doc, [
    g.numerao("3", "attributes", "theme · density · brand"),
    g.cartao([...quatro.map(m => h("span", {key: m.id, className: "th-ponto th-cor", style: cores(m)})), h("span", {key: "t", className: "intro-mini intro-forte"}, "13 palettes")]),
    g.capsula(h("span", {className: "gs-mono th-capsula-texto"}, "@layer aurea")),
    g.capsula(h("span", {className: "gs-amarela", "data-th-curto": ""}, 'data-theme="dark"'))]);

  // O LABORATÓRIO: as três chaves e a linha do html à esquerda; a prévia (peças de verdade) à direita.
  const linhaHtml = '<html data-theme="dark" data-density="comfortable">';
  const controles = h(A.Card, {className: "th-controles"},
    h("div", null, h("p", {className: "th-k"}, h("b", null, "data-theme"), " · every color role"),
      g.chave("th-tema", "data-theme", ["light", "dark"], "dark")),
    h("div", null, h("p", {className: "th-k"}, h("b", null, "data-density"), " · control heights, table rows, card padding"),
      g.chave("th-densidade", "data-density", ["compact", "comfortable", "spacious"], "comfortable")),
    h("div", null, h("p", {className: "th-k"}, h("b", null, "data-brand"), " · the color palette, in both themes"),
      // O `ToggleGroup detached` com o ligado em contraste: a pele dele com botões de ligar (a página não hidrata a peça).
      h("div", {className: "toggle-group toggle-group-detached th-marcas-botoes", role: "group", "aria-label": "data-brand", "data-pressed-style": "contrast"},
        ...marcas.map(m => h("button", {key: m.id, type: "button", className: "btn btn-tertiary toggle th-cor", "data-pressed-style": "contrast",
          "data-th-marca": m.id, "aria-pressed": m.id === "gold" ? "true" : "false", "data-pressed": m.id === "gold" ? "" : undefined, style: cores(m)},
          h(A.ColorSwatch, {color: "var(--th-cor)", size: "sm", "aria-hidden": "true"}), m.curto)))),
    h("div", {className: "intro-instalar th-linha"}, h("code", {"data-th-linha": ""}, linhaHtml),
      h(A.Button, {variant: "tertiary", size: "sm", type: "button", "data-copiar": linhaHtml, "data-th-copiar": "", "aria-label": "Copy the html line"}, "Copy")));
  const previa = h("div", {className: "th-previa", "data-theme": "dark", "data-density": "comfortable", "data-th-previa": "", role: "region", "aria-label": "Preview"},
    h("div", {className: "th-previa-barra"}, h("span", {"data-th-rotulo": ""}, "Aurea Gold · dark"), h("span", {"data-th-dens": ""}, "comfortable")),
    h(A.Card, {className: "th-previa-cartao"},
      h(A.Heading, {level: 4}, "Workspace"),
      h("p", null, "Changes are saved for everyone in the team."),
      h(A.Input, {"aria-label": "Team name", defaultValue: "Internal tooling"}),
      h(A.Switch, {label: "Weekly digest", defaultChecked: true}),
      h("div", {className: "th-previa-botoes"}, h(A.Button, {variant: "primary", type: "button"}, "Save"), h(A.Button, {variant: "secondary", type: "button"}, "Cancel"))),
    h("p", {className: "th-nota", "data-th-ember": "", hidden: true}, "Aurea Ember keeps its own neutrals: the page and the card change too."));

  // OS SUFIXOS, em cartões (o desenho; a lista do .md diz o mesmo).
  const sufixos = [["no suffix", "A fill", "--primary, --card, --success"], ["-foreground", "The text on that fill", "--primary-foreground, --card-foreground"],
    ["-hover · -active", "Under the pointer, and while pressed", "--primary-hover"], ["-400", "A status color used as text, icon or bar on the page", "--success-400"],
    ["-bg", "A soft status background", "--success-bg"], ["-solid", "An opaque version of a see-through fill", "--fill-2-solid"]];

  // AS MARCAS no cartão de escolha, sem a bolinha: a amostra com "Aa" e o hexa (o do tema da página), o nome e o atributo.
  const cartaoDaMarca = m => h("span", {className: "th-marca"},
    h("span", {className: "th-amostra th-cor", style: cores(m), "aria-hidden": "true"}, "Aa",
      h("span", {className: "th-hexa"}, h("span", {className: "th-so-claro"}, m.claro), h("span", {className: "th-so-escuro"}, m.escuro))),
    h("b", null, m.nome), h("code", null, m.attr));
  const brandsP = bl("Brands", "p"), brandsUl = bl("Brands", "ul");

  const [how1, how2, how3] = bl("How it works", "p");
  const howCod = bl("How it works", "codigo");
  const quick = s("Quick start").blocos;
  const parte = s("A theme for one part of the page");
  const parteP = bl("A theme for one part of the page", "p");
  const sobre = s("Overriding a token").blocos;
  const sobreP = sobre.filter(b => b.tipo === "p");
  const sobreC = sobre.filter(b => b.tipo === "codigo");

  const node = g.pagina(doc, abertura,
    ...g.corpo(sec.antes, {chave: "a"}),
    g.secao(s("How it works").id, "Three switches", "How it works",
      g.p([...how1.texto, {t: " Try them:"}], "h1"),
      h("div", {className: "th-lab"}, controles, previa),
      tabela("How it works", "The three attributes"),
      g.p(how2.texto, "h2"), g.p(how3.texto, "h3"),
      g.codigo(howCod[0].codigo, "aurea.css", "css"), g.codigo(howCod[1].codigo, "index.html", "html")),
    g.secao(s("Quick start").id, "Start", "Quick start",
      ...g.corpo(quick, {chave: "q", arquivos: ["main.tsx", "index.html"]})),
    g.secao(s("Naming pattern").id, "Read a token name", "Naming pattern",
      h("div", {className: "th-sufixos"}, ...sufixos.map(([n, t, ex]) => h(A.Card, {key: n, className: "th-sufixo"},
        h("code", null, n), h("b", null, t), h("span", null, ex)))),
      ...g.corpo(bl("Naming pattern", "p"), {chave: "n"})),
    g.secao(s("Brands").id, "A second palette", "Brands",
      g.p(brandsP[0].texto, "b0"), g.p([...brandsP[1].texto, {t: " Choose one to try it in the preview above."}], "b1"),
      h(A.RadioGroup, {label: "Brands", labelHidden: true, variant: "card", indicatorPlacement: "none", defaultValue: "gold", name: "th-marca", className: "th-marcas"},
        ...marcas.map(m => h(A.RadioGroup.Item, {key: m.id, value: m.id, label: cartaoDaMarca(m)}))),
      ul([...brandsUl[0].itens, ...brandsUl[1].itens], "bu"),
      g.p(brandsP.at(-1).texto, "b2")),
    g.secao(parte.id, "Attributes, not :root", "A theme for one part of the page",
      g.p(parteP[0].texto, "p0"),
      // A FAIXA: o claro com um pedaço escuro dentro — os atributos de verdade, e as cores, as do token.
      h("div", {className: "th-faixa", "data-theme": "light", "aria-hidden": "true"},
        h("span", {className: "th-faixa-k"}, 'html data-theme="light"'),
        h("div", {className: "th-faixa-linha"}, h("span", {style: {background: "var(--card)"}}), h("span", {style: {background: "var(--card)"}})),
        h("div", {className: "th-faixa-dentro", "data-theme": "dark"},
          h("span", {className: "th-faixa-k"}, 'section data-theme="dark"'),
          h("div", {className: "th-faixa-linha"}, h("span", {style: {background: "var(--card)"}}), h("span", {style: {background: "var(--primary)"}})))),
      ...g.corpo(parte.blocos.slice(1), {chave: "pp"})),
    g.secao(s("Overriding a token").id, "Your values", "Overriding a token",
      g.p(sobreP[0].texto, "o0"), g.p(sobreP[1].texto, "o1"), g.codigo(sobreC[0].codigo, "app.css", "css"),
      g.p(sobreP[2].texto, "o2"), g.codigo(sobreC[1].codigo, "app.css", "css"),
      h(A.Alert, {variant: "warning", className: "gs-aviso"}, ...site.pedacos(sobreP[3].texto, "oa"))),
    g.secao(s("Token formats").id, "One source, three forms", "Token formats",
      g.p(bl("Token formats", "p")[0].texto, "f0"), tabela("Token formats"), g.p(bl("Token formats", "p")[1].texto, "f1")),
    g.secao(s("In React Native").id, "No cascade", "In React Native",
      ...g.corpo(s("In React Native").blocos, {chave: "rn", arquivos: ["App.tsx"]})),
    g.secao(s("Variables reference").id, "Every value", "Variables reference",
      g.links([["Tokens", "./tokens.html", "hexagon", "orange", "Every token, with its value in each theme, brand and density."]])));
  const toc = ["How it works", "Quick start", "Naming pattern", "Brands", "A theme for one part of the page", "Overriding a token", "Token formats",
    "In React Native", "Variables reference"].map(r => ({id: s(r).id, label: r}));
  return {node, toc};
}
