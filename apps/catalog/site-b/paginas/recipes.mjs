// A PÁGINA "RECIPES" NO DESENHO B (aprovado em 26/10/2026; o mapa em `bancada-site-b/mapa/grupo-2.md`, "recipes").
// O palco com as três peças que flutuam; "01 Recipe builder": a receita escolhida (o que cobre e os padrões que usa), a lista
// das receitas com o filtro, e os 17 padrões que acendem — escolher um padrão marca, na lista, quem o usa; "02 Every recipe":
// as 23 receitas, cada uma levando à página dela. Os dados são os do contrato (`aurea.contract.json`) e do texto de cada
// receita (`patterns/<id>.md`). Sem JavaScript, a página mostra a receita do desenho escolhida e todas as listas; o
// comportamento (escolher, filtrar, copiar) é o `site-b/js/recipes.js`.
import {readFileSync} from "node:fs";

const PASTA = new URL("../../../../patterns/", import.meta.url);
// O texto de abertura da receita: o que vem entre o título e a primeira linha de corte (ou o primeiro subtítulo).
const aberturaDe = id => {
  const linhas = readFileSync(new URL(`${id}.md`, PASTA), "utf8").replace(/\r\n/g, "\n").replace(/^---\n[\s\S]*?\n---\n/, "").split("\n");
  const ini = linhas.findIndex(l => l.startsWith("# ")) + 1;
  const fim = linhas.findIndex((l, i) => i >= ini && (/^━/.test(l) || l.startsWith("## ")));
  return linhas.slice(ini, fim < 0 ? undefined : fim).join(" ").replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
};
// A receita que abre escolhida é a do desenho.
const ESCOLHIDA = "developer_tools";

export default function recipes(site) {
  const {h, A, slug, recipeTitle, contract, textoParaCopiar} = site;
  const app = contract.applicationPatterns, op = contract.operationalPatterns;
  const receitas = Object.entries(app.archetypes).map(([id, a]) => ({id, nome: recipeTitle(id), texto: aberturaDe(id),
    foco: (a.capabilities || []).slice(0, 4), padroes: a.patterns, href: `./recipe-${slug(id)}.html`}));
  const padroes = [...Object.entries(app.patterns).map(([nome, p]) => ({nome, tipo: "app", p})),
    ...Object.entries(op.patterns).map(([nome, p]) => ({nome, tipo: "op", p}))]
    .map(({nome, tipo, p}) => ({nome, tipo, regra: (p.behavior || [])[0] || "", tipos: (p.variants || []).slice(0, 6).join(" · ")}));
  const usam = nome => receitas.filter(r => r.padroes.includes(nome));
  const atual = receitas.find(r => r.id === ESCOLHIDA) || receitas[0];
  const nApp = padroes.filter(p => p.tipo === "app"), nOp = padroes.filter(p => p.tipo === "op");
  const doGrupo = lista => atual.padroes.filter(x => lista.some(p => p.nome === x)).length;

  // O PALCO: o número grande, a cápsula dos padrões e o cartão de uma receita (o "Agents · AI" do desenho), que flutuam.
  const agentes = receitas.find(r => r.id === "agent_ai") || receitas[0];
  const palco = h("section", {className: "intro-palco cat-palco rec-palco", "aria-labelledby": "rec-h1", "data-palco": ""},
    h("div", {className: "intro-palco-texto cat-palco-texto"},
      h("span", {className: "intro-trilha"}, "Recipes ", h("span", {"aria-hidden": "true"}, "/"), " ", h("b", null, "Overview")),
      h("h1", {className: "intro-h1", id: "rec-h1"}, "Recipes"),
      h("p", {className: "intro-lede"}, `${receitas.length} product archetypes: how to assemble a whole kind of application by composing the architecture patterns below. A recipe is not a component family — it says which patterns to use and which invariants to hold.`),
      h("div", {className: "rec-fluxo", role: "img", "aria-label": "Archetype, then patterns, then invariants"},
        h(A.Badge, {size: "lg", className: "rec-fluxo-passo"}, "Archetype"), h("span", {"aria-hidden": "true"}, "→"),
        h(A.Badge, {size: "lg", className: "rec-fluxo-passo"}, "Patterns"), h("span", {"aria-hidden": "true"}, "→"),
        h(A.Badge, {size: "lg", tone: "primary", emphasis: "solid"}, "Invariants"))),
    h("div", {className: "intro-pecas cat-pecas", "aria-hidden": "true"},
      h("div", {className: "intro-peca cat-peca-1", "data-fundo": "1"}, h("div", {className: "intro-boia"},
        h("span", {className: "cat-numerao"}, h("b", null, receitas.length), "recipes"))),
      h("div", {className: "intro-peca cat-peca-2", "data-fundo": "1.6"}, h("div", {className: "intro-boia"},
        h(A.Card, {className: "intro-cartao intro-cartao-capsula cat-capsula"}, `${padroes.length} patterns`))),
      h("div", {className: "intro-peca cat-peca-3 rec-peca-3", "data-fundo": "2"}, h("div", {className: "intro-boia"},
        h(A.Card, {className: "intro-cartao rec-mini"}, h(A.Badge, {tone: "primary"}, agentes.nome),
          h("b", null, `${agentes.padroes.length} patterns`), h("span", null, agentes.padroes.join(", ")))))));

  const cabeca = (id, num, titulo, conta, texto) => h("div", {className: "cat-familia-topo rec-cabeca", id},
    h("span", {className: "cat-familia-num"}, num), h("h2", null, titulo), h("span", {className: "cat-familia-conta"}, conta),
    h("p", {className: "rec-cabeca-texto"}, texto));

  // A RECEITA ESCOLHIDA: o nome, o texto e o que cobre; ao lado, os padrões que ela compõe e as duas ações.
  const escolhida = h(A.Card, {className: "rec-escolhida", "aria-labelledby": "rec-nome", "data-rec-escolhida": "", render: h("section")},
    h("div", null,
      h("p", {className: "rec-sobre", "data-rec-pos": ""}, `Recipe ${receitas.indexOf(atual) + 1} of ${receitas.length}`),
      h("h2", {className: "rec-nome", id: "rec-nome", "data-rec-nome": ""}, atual.nome),
      h("p", {className: "rec-texto", "data-rec-texto": ""}, atual.texto),
      h("div", {className: "rec-cobre", role: "list", "aria-label": "What it covers", "data-rec-foco": ""},
        ...atual.foco.map(f => h(A.Badge, {key: f, size: "lg", role: "listitem"}, f)))),
    h(A.Card, {variant: "inset", className: "rec-usa"},
      h("div", {className: "rec-usa-n"}, h("b", {"data-rec-conta": ""}, atual.padroes.length),
        h("span", {"data-rec-conta-palavra": ""}, atual.padroes.length === 1 ? "pattern to compose" : "patterns to compose")),
      h("div", {className: "rec-usa-lista", role: "list", "aria-label": "Patterns it composes", "data-rec-usa": ""},
        ...atual.padroes.map(p => h(A.Badge, {key: p, size: "lg", tone: "primary", emphasis: "solid", role: "listitem", className: "rec-codigo"}, p))),
      h("div", {className: "rec-acoes"},
        h(A.Button, {size: "lg", variant: "primary", trailingIcon: "arrow-right", href: atual.href, "data-rec-abrir": ""}, "Open the recipe"),
        h(A.Button, {size: "lg", variant: "tertiary", type: "button", "data-rec-copiar": ""}, "Copy the list"))));

  // A LISTA DAS RECEITAS (coluna presa): o filtro e um botão por receita, a escolhida com o ponto amarelo.
  const lista = h(A.Card, {variant: "inset", className: "rec-lista", role: "group", "aria-label": "Recipes"},
    h(A.SearchField, {size: "lg", className: "rec-filtro", "aria-label": "Filter recipes", placeholder: `Filter ${receitas.length} recipes`,
      autoComplete: "off", "data-rec-filtro": ""}),
    ...receitas.map(r => h("button", {key: r.id, type: "button", className: "rec-item", "aria-pressed": r.id === atual.id ? "true" : "false",
      "data-rec-item": r.id},
      h("span", {className: "rec-item-nome"}, r.nome),
      h(A.Badge, {size: "sm", className: "rec-item-conta"}, r.padroes.length),
      h(A.Badge, {size: "sm", tone: "primary", emphasis: "solid", className: "rec-item-usa", hidden: true}, "uses it"))),
    h("p", {className: "rec-nada", "data-rec-nada": "", hidden: true}, "No recipe matches."));

  // OS PADRÕES: um cartão por padrão, que liga o filtro "quem usa este padrão" (aria-pressed).
  const ladrilho = p => {
    const usado = atual.padroes.includes(p.nome), n = usam(p.nome).length;
    // O cartão clicável que sobe (`lift`, o item 7); o padrão que a receita usa leva o fundo do `Card variant="selected"`
    // (a classe dele, que o comportamento liga e desliga ao trocar de receita).
    return h(A.Card, {key: p.nome, variant: "interactive", lift: true, className: usado ? "rec-padrao card-selected" : "rec-padrao",
      render: h("button", {type: "button"}), "aria-pressed": "false", "data-rec-padrao": p.nome, "data-rec-n": n,
      title: `Show the ${n} recipes that use it`},
      h("span", {className: "rec-padrao-topo"}, h("span", {className: "rec-padrao-nome"}, p.nome),
        h(A.Badge, {size: "sm", tone: "primary", emphasis: "solid", className: "rec-padrao-usado", hidden: !usado}, "In this recipe"),
        h(A.Badge, {size: "sm", emphasis: "solid", className: "rec-padrao-filtro", hidden: true}, "Filter on")),
      h("span", {className: "rec-padrao-regra"}, p.regra),
      h("span", {className: "rec-padrao-tipos"}, p.tipos));
  };
  const grade = (rotulo, lista, chave) => h(Fragmento, null,
    h("div", {className: "rec-grade-cabeca"}, h("p", null, `${rotulo} · ${lista.length}`),
      h("p", {"data-rec-no-grupo": chave}, `${doGrupo(lista)} in this recipe`)),
    h("div", {className: "rec-padroes"}, ...lista.map(ladrilho)));
  const Fragmento = site.Fragment;

  const montador = h("div", {className: "rec-colunas"},
    lista,
    h("div", {className: "rec-quadro"},
      h("div", {className: "rec-faixa", role: "status", "data-rec-faixa": "", hidden: true},
        h("span", {"data-rec-faixa-texto": ""}),
        h(A.Button, {variant: "tertiary", size: "md", type: "button", "data-rec-limpar": ""}, "Show all recipes")),
      grade("Application patterns", nApp, "app"),
      grade("Operational patterns", nOp, "op")));

  const todas = h("div", {className: "rec-todas"}, ...receitas.map(r => h(A.Card, {key: r.id, variant: "interactive", lift: true,
    className: "rec-cartao", render: h("a", {href: r.href})},
    h("h3", null, r.nome), h("p", null, r.foco.join(" · ")),
    h("span", {className: "rec-cartao-padroes"}, ...r.padroes.map(p => h(A.Badge, {key: p, className: "rec-codigo"}, p))))));

  // Os dados que o comportamento lê (o `site-b/js/recipes.js`).
  const dados = h("script", {type: "application/json", id: "rec-dados",
    dangerouslySetInnerHTML: {__html: JSON.stringify({receitas: receitas.map(({id, nome, texto, foco, padroes, href}) => ({id, nome, texto, foco, padroes, href})),
      app: nApp.map(p => p.nome), op: nOp.map(p => p.nome)}).replace(/</g, "\\u003c")}});

  const markdown = [`# Recipes`, "", `${receitas.length} product archetypes: how to assemble a whole kind of application by composing the architecture patterns. A recipe says which patterns to use and which invariants to hold.`, "",
    ...receitas.map(r => `- [${r.nome}](${r.href.replace("./", "")}): ${r.padroes.join(", ")}`)].join("\n");

  const node = h("div", {className: "rec-b", "data-receitas": ""},
    palco,
    cabeca("builder", "01", "Recipe builder", "pick one · see what it takes",
      "Choose a kind of application and its patterns light up. Choose a pattern to see every recipe that needs it."),
    h("p", {className: "sr-only", role: "status", "data-rec-anuncio": ""}),
    escolhida,
    montador,
    cabeca("every", "02", "Every recipe", String(receitas.length), "Each one has its own page with the code to start from."),
    todas,
    dados,
    textoParaCopiar(markdown));
  return {node, toc: []};
}
