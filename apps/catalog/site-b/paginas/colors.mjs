// A COLORS NO DESENHO B (aprovado em 26/10/2026): a abertura no palco; o tema padrão como um explorador (escolher um papel
// mostra-o grande nos dois temas); o link do claro (o marca-texto × `data-link="underline"`); os fundos, as cores de estado,
// os campos (o `Input` de verdade) e as cores de categoria (o `Badge` de verdade), cada um nos dois temas lado a lado. As
// cores do desenho eram exemplo: aqui toda amostra é o TOKEN de hoje (`var(--x)` dentro de `data-theme`). O texto vem do
// `colors.md`. O comportamento (o papel escolhido, o jeito do link, a plataforma do código) está em `site-b/js/colors.js`.
import {ferramentas} from "./_getting-started/comum.mjs";

const TEMAS = [["light", "Light"], ["dark", "Dark"]];
// A tinta que se lê sobre uma amostra: a do texto escuro ou a branca, pela maior razão de contraste.
const tintaDe = (site, valor) => {
  if (/^#[0-9a-f]{6}$/i.test(valor)) return site.contrasteEntre(valor, "#ffffff") >= site.contrasteEntre(valor, "#09090b") ? "clara" : "escura";
  return /black/i.test(valor) ? "clara" : "escura";
};

export default function colors(site, doc) {
  const {h, Fragment, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  const s = rotulo => sec.por(rotulo);
  const tabela = (rotulo, legenda = rotulo) => g.tabelaB(s(rotulo).blocos.find(b => b.tipo === "tabela"), `t-${s(rotulo).id}`, legenda);
  const ps = rotulo => s(rotulo).blocos.filter(b => b.tipo === "p");
  const lista = rotulo => s(rotulo).blocos.find(b => b.tipo === "ul");
  const h3 = (rotulo, titulo = rotulo) => h("h3", {className: "co-h3", id: s(rotulo).id}, titulo);
  const texto = cel => cel.map(x => x.code ?? x.t ?? "").join("");

  // A ABERTURA: o amarelo e o nome dele, as quatro cores de estado, "Roles, not hues" e as oito categorias.
  const abertura = g.abertura(doc, [
    g.cartao([h("span", {key: "y", className: "intro-amarelo"}), h("span", {key: "t", className: "intro-mini"}, h("b", null, "--primary"), h("br"),
      h("span", {className: "co-mono-xs"}, "oklch(0.795 0.184 86.047)"))]),
    g.cartao([...["success", "warning", "destructive", "info"].map(t => h("span", {key: t, className: "co-ponto", style: {background: `var(--${t})`}})),
      h("span", {key: "t", className: "intro-mini intro-forte"}, "4 status")]),
    g.capsula(h("span", {className: "intro-mini intro-forte co-capsula-texto"}, "Roles, not hues")),
    g.numerao("8", "categories", "a group, not a status")]);

  // O TEMA PADRÃO: as linhas da tabela do .md viram botões (o papel, a amostra no claro e no escuro); o escolhido aparece
  // grande ao lado. A amostra é o token de hoje; o valor escrito é o do .md.
  const padrao = s("Default theme").blocos.find(b => b.tipo === "tabela");
  const papeis = padrao.linhas.map(l => ({nome: texto(l[0]), claro: texto(l[1]), escuro: texto(l[2])}));
  const escolhido = papeis.find(p => p.nome === "--primary") || papeis[0];
  const amostra = (tema, nome, valor) => h("span", {className: "co-amostra"},
    h("i", {"data-theme": tema, style: {background: `var(${nome})`}}), valor);
  const explorador = h("div", {className: "co-explorar"},
    h("div", {className: "co-papeis", role: "group", "aria-label": "Main roles"},
      h("div", {className: "co-papel co-papel-cabeca", "aria-hidden": "true"}, h("span", null, "Token"), h("span", null, "Light"), h("span", null, "Dark")),
      ...papeis.map(p => h("button", {key: p.nome, type: "button", className: "co-papel", "aria-pressed": p === escolhido ? "true" : "false",
        "data-token": p.nome, "data-claro": p.claro, "data-escuro": p.escuro, "data-tinta-claro": tintaDe(site, p.claro), "data-tinta-escuro": tintaDe(site, p.escuro)},
        h("code", null, p.nome), amostra("light", p.nome, p.claro), amostra("dark", p.nome, p.escuro)))),
    h("div", {className: "co-grande", "aria-live": "polite", "data-co-grande": ""},
      g.rotuloK("Chosen role"),
      h("h3", {"data-co-nome": ""}, escolhido.nome),
      ...TEMAS.map(([tema, rotulo]) => h("div", {key: tema, className: "co-grande-tema", "data-theme": tema, "data-co-tema": tema,
        "data-tinta": tintaDe(site, tema === "light" ? escolhido.claro : escolhido.escuro), style: {background: `var(${escolhido.nome})`}},
        h("span", null, `${rotulo} · `, h("span", {"data-co-valor": ""}, tema === "light" ? escolhido.claro : escolhido.escuro))))));

  // O LINK NOS DOIS TEMAS: no claro, o marca-texto (o padrão) ou o sublinhado (`data-link="underline"`).
  const [acc1, acc2, acc3] = ps("Accent");
  const linkEm = (tema, rotulo) => h("div", {key: tema, className: "co-superficie", "data-theme": tema, "data-co-link": tema === "light" ? "" : undefined},
    g.rotuloK(rotulo), h("p", null, "Read the ", h(A.Link, {href: "./docs-quick-start.html"}, "Quick Start"), " before you install."));

  // OS FUNDOS nos dois temas.
  const fundos = h("div", {className: "co-par"}, ...TEMAS.map(([tema, rotulo]) => h("div", {key: tema, className: "co-faixa", "data-theme": tema},
    g.rotuloK(rotulo), h("div", {className: "co-fundos"}, ...[["1", "6%"], ["2", "10%"], ["3", "20%"]].map(([n, pc]) =>
      h("span", {key: n, style: {background: `var(--fill-${n})`}}, `fill-${n} · ${pc}`))))));

  // AS CORES DE ESTADO: o fundo cheio (igual nos dois temas) e o "-400" sobre o claro e sobre o escuro.
  const ESTADOS = [["Success", "success", "success", "success"], ["Warning", "warning", "warning", "warning"],
    ["Danger", "destructive", "danger", "destructive"], ["Info", "info", "info", "info"]];
  const estados = h("div", {className: "co-estados"}, ...ESTADOS.map(([nome, cheio, p400, fg]) => h(A.Card, {key: nome, className: "co-estado"},
    h("b", null, nome),
    h("div", {className: "co-estado-cheio", style: {background: `var(--${cheio})`, color: `var(--${fg}-foreground)`}}, "Aa", h("span", null, `--${cheio}`)),
    ...TEMAS.map(([tema, rotulo]) => h("div", {key: tema, className: "co-estado-tema", "data-theme": tema, style: {color: `var(--${p400}-400)`}},
      `--${p400}-400`, h("span", null, rotulo.toLowerCase()))))));
  const listaEstados = lista("Status colors");
  const ultimoEstado = listaEstados.itens.at(-1);

  // OS CAMPOS nos dois temas: o `Input` de verdade, e o inválido com o aviso embaixo.
  const campos = h("div", {className: "co-par"}, ...TEMAS.map(([tema, rotulo]) => h("div", {key: tema, className: "co-faixa co-campos", "data-theme": tema},
    g.rotuloK(rotulo),
    h(A.Input, {"aria-label": `Email (${rotulo.toLowerCase()} theme)`, defaultValue: "you@company.com", type: "email"}),
    h(A.Input, {"aria-label": `Email, invalid (${rotulo.toLowerCase()} theme)`, defaultValue: "not-an-email", "aria-invalid": true,
      "aria-describedby": `co-invalido-${tema}`}),
    h("small", {className: "co-invalido", id: `co-invalido-${tema}`}, "Invalid"))));

  // AS CORES DE CATEGORIA nos dois temas: o `Badge` com o ponto.
  const CATEGORIAS = ["red", "orange", "green", "teal", "cyan", "blue", "violet", "pink"];
  const categorias = h("div", {className: "co-par"}, ...TEMAS.map(([tema, rotulo]) => h("div", {key: tema, className: "co-superficie co-categorias", "data-theme": tema},
    g.rotuloK(rotulo), h("div", {className: "co-selos"}, ...CATEGORIAS.map(c => h(A.Badge, {key: c, tone: c, dot: true, size: "lg"}, c))))));
  const [cat1, cat2] = ps("Category colors");

  // COMO USAR: a CSS da web ou o React Native.
  const usar = s("How to use colors").blocos;
  const [uP1, uCss, uP2, uTsx] = usar;

  const node = g.pagina(doc, abertura,
    ...g.corpo(sec.antes.slice(0, 2), {chave: "a"}),
    h(A.Alert, {variant: "info", className: "gs-aviso"}, ...site.pedacos(sec.antes[2].texto, "av")),
    ...g.corpo(sec.antes.slice(3), {chave: "a2", arquivos: ["styles.css"]}),
    g.secao(s("Default theme").id, "Side by side", "Default theme",
      g.p([{t: "The main roles, side by side. Choose a role to see it large in both themes."}], "d0"),
      explorador,
      ...g.corpo(ps("Default theme").slice(1), {chave: "d1"})),
    g.secao(s("Accent").id, "The brand yellow", "Accent",
      g.p(acc1.texto, "ac1"), g.p(acc2.texto, "ac2"),
      tabela("Accent"),
      h("h3", {className: "co-h3", id: "links-in-the-light-theme"}, "Links in the light theme"),
      g.p(acc3.texto, "ac3"),
      h("div", {className: "co-chave"}, g.chave("co-link", "Link style in the light theme", [["mark", "Highlight"], ["underline", 'data-link="underline"']], "mark")),
      h("div", {className: "co-par"}, ...TEMAS.map(([tema, rotulo]) => linkEm(tema, rotulo)))),
    g.secao(s("Neutrals").id, "The grays", "Neutrals", ...g.corpo(ps("Neutrals"), {chave: "n"}), tabela("Neutrals")),
    g.secao(s("Fills").id, "Instead of borders", "Fills", g.p(ps("Fills")[0].texto, "f0"), fundos, tabela("Fills"), g.p(ps("Fills")[1].texto, "f1")),
    g.secao(s("Status colors").id, "Never swapped", "Status colors",
      g.p(ps("Status colors")[0].texto, "s0"), estados,
      h("ul", {className: "gs-lista gs-ul"}, ...listaEstados.itens.slice(0, -1).map((it, n) => h("li", {key: n}, h("span", null, ...site.pedacos(it, `se${n}`))))),
      h(A.Alert, {variant: "warning", className: "gs-aviso"}, ...site.pedacos(ultimoEstado, "sea")),
      tabela("Status colors")),
    g.secao("text-and-surfaces", "Text, page and surfaces", "Text and surfaces",
      h3("Foreground"), tabela("Foreground"),
      h3("Background"), ...g.corpo(s("Background").blocos, {chave: "bg"}),
      h3("Surface"), g.p(ps("Surface")[0].texto, "su0"), tabela("Surface"), g.p(ps("Surface")[1].texto, "su1")),
    g.secao("fields-and-separator", "No red line", "Fields and separator",
      h("span", {className: "co-ancora", id: s("Form field").id}),
      g.p(ps("Form field")[0].texto, "ff0"), campos, ...g.corpo(ps("Form field").slice(1), {chave: "ff1"}),
      h3("Separator"), ...g.corpo(s("Separator").blocos, {chave: "sp"})),
    g.secao(s("Category colors").id, "A group, not a status", "Category colors",
      g.p(cat1.texto, "c0"), categorias,
      h("ul", {className: "gs-lista gs-ul"}, ...lista("Category colors").itens.map((it, n) => h("li", {key: n}, h("span", null, ...site.pedacos(it, `cl${n}`))))),
      g.p(cat2.texto, "c1")),
    g.secao("other-and-primitives", "The rest", "Other and primitives",
      h("span", {className: "co-ancora", id: s("Other").id}),
      tabela("Other"), h3("Primitives"), ...g.corpo(ps("Primitives"), {chave: "pr"}), tabela("Primitives")),
    g.secao(s("How to use colors").id, "In your code", "How to use colors",
      g.p(uP1.texto, "u0"),
      h("div", {className: "co-chave"}, g.chave("co-plataforma", "Platform", [["web", "Web · CSS"], ["native", "React Native"]], "web")),
      h("div", {"data-co-plataforma": "web"}, g.codigo(uCss.codigo, "notice.css", "css")),
      h("div", {"data-co-plataforma": "native", hidden: true}, g.p(uP2.texto, "u2"), g.codigo(uTsx.codigo, "Panel.tsx", "tsx"))),
    g.secao(s("Customizing colors").id, "Your palette", "Customizing colors", ...g.corpo(s("Customizing colors").blocos, {chave: "cu"})));
  const toc = [[s("Default theme").id, "Default theme"], [s("Accent").id, "Accent"], [s("Neutrals").id, "Neutrals"], [s("Fills").id, "Fills"],
    [s("Status colors").id, "Status colors"], ["text-and-surfaces", "Text and surfaces"], ["fields-and-separator", "Fields and separator"],
    [s("Category colors").id, "Category colors"], ["other-and-primitives", "Other and primitives"], [s("How to use colors").id, "How to use colors"],
    [s("Customizing colors").id, "Customizing colors"]].map(([id, label]) => ({id, label}));
  return {node, toc};
}
