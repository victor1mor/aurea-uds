// A PÁGINA DE UMA RECEITA NO SITE B (05/11/2026, o S-11). Sem desenho próprio: segue a página de um bloco (`block.mjs`) —
// o palco com a trilha, os selos dos padrões e o caminho; "01 Usage" com o import e a caixa viva; e as quatro seções que o
// modelo de página exige da receita (`page-model.mjs`: composition, capabilities, invariants, states), cada uma numerada e
// desenhada, em vez do texto corrido de antes; "Built with." com a prévia de cada peça; e o anterior e o próximo.
// O texto continua vindo de `patterns/<id>.md` (a fonte que o check 9 valida contra o contrato); a caixa e o código, de
// `content/_recipes.mjs`. Parte do `site.recipePage` (a mesma caixa, o mesmo texto do "Copy Markdown").
import {readFileSync} from "node:fs";
import {abertura, achar, anteriorProximo, caminho, cartaoRelacionado, filhos, porExtenso, secao, texto} from "./_grupo-1.mjs";

const PASTA = new URL("../../../../patterns/", import.meta.url);

// O `.md` da receita em partes: a abertura e, por `## `, os parágrafos, os itens de lista e as citações (o invariante).
function partes(id) {
  const linhas = readFileSync(new URL(`${id}.md`, PASTA), "utf8").replace(/\r\n/g, "\n").replace(/^---\n[\s\S]*?\n---\n/, "").split("\n");
  const secoes = {}, intro = [];
  let atual = null, para = [];
  const fecha = () => { if (para.length) (atual ? atual.blocos : intro).push({tipo: "p", texto: para.join(" ")}); para = []; };
  for (const cru of linhas) {
    const l = cru.replace(/━+/g, "").trimEnd();
    if (!l.trim()) { fecha(); continue; }
    if (l.startsWith("# ")) continue;
    if (l.startsWith("## ")) { fecha(); const nome = l.slice(3).trim(); atual = secoes[nome.toLowerCase()] = {nome, blocos: []}; continue; }
    if (l.startsWith("- ")) { fecha(); atual?.blocos.push({tipo: "li", texto: l.slice(2).trim()}); continue; }
    if (l.startsWith("> ")) { fecha(); atual?.blocos.push({tipo: "q", texto: l.slice(2).trim().replace(/^"|"$/g, "")}); continue; }
    // A continuação de um item de lista (a linha recuada) volta para o item.
    const ultimo = atual?.blocos.at(-1);
    if (!para.length && ultimo?.tipo === "li" && /^\s/.test(cru)) { ultimo.texto += ` ${l.trim()}`; continue; }
    para.push(l.trim());
  }
  fecha();
  return {intro: intro.map(b => b.texto).join(" "), secoes};
}

// "**Nome** — o resto" e "`nome` — o resto": o nome e o texto, separados no travessão.
const cabecaEResto = s => {
  const m = /^(\*\*([^*]+)\*\*|`([^`]+)`)\s*—\s*([\s\S]*)$/.exec(s);
  return m ? {nome: m[2] ?? m[3], resto: m[4]} : {nome: null, resto: s};
};

export default function recipe(site, id, arquetipo, i, ids) {
  const {h, A, Fragment, linhaMd, slug, contract, fichas} = site;
  const base = site.recipePage(id, arquetipo, i, ids);
  const raiz = base.node;
  const uso = achar(raiz, e => e.type === "section" && e.props?.id === "usage");
  const [codigoDoImport, ...resto] = filhos(uso).slice(1);
  const frase = resto.find(e => e.type === "p");
  const caixa = resto.find(e => String(e.props?.className ?? "").split(" ").includes("demo"));
  const markdown = achar(raiz, e => e.props?.id === "page-markdown");
  const {intro, secoes} = partes(id);
  const nome = site.recipeTitle(id);
  const padroes = arquetipo.patterns || [];
  const regras = {...contract.applicationPatterns.patterns, ...contract.operationalPatterns.patterns};
  const md = (t, k) => linhaMd(t, k);

  // 02 COMPOSITION: um cartão por padrão de arquitetura — o nome, o que ele monta (o parágrafo da receita) e a regra de
  // comportamento dele no contrato.
  const comp = (secoes.composition?.blocos || []).filter(b => b.tipo === "p").map(b => cabecaEResto(b.texto));
  const composicao = h("div", {className: "rcp-padroes"}, ...comp.map(({nome: n, resto: r}, k) => h(A.Card, {key: n || k, className: "rcp-padrao"},
    h("div", {className: "rcp-padrao-topo"},
      h("span", {className: "rcp-num", "aria-hidden": "true"}, String(k + 1).padStart(2, "0")),
      n ? h("h3", {className: "rcp-padrao-nome"}, n) : null),
    h("p", {className: "rcp-padrao-texto"}, md(r, `c${k}`)),
    n && regras[n]?.behavior?.[0] ? h("p", {className: "rcp-padrao-regra"}, h(A.Icon, {name: "check-circle", size: "sm"}), h("span", null, regras[n].behavior[0])) : null)));

  // 03 CAPABILITIES: a grade do que a tela cobre — o nome em código e a frase.
  const cap = (secoes.capabilities?.blocos || []).filter(b => b.tipo === "li").map(b => cabecaEResto(b.texto));
  const capacidades = h("ul", {className: "rcp-caps"}, ...cap.map(({nome: n, resto: r}, k) => h("li", {key: n || k, className: "rcp-cap"},
    n ? h("span", {className: "rcp-cap-nome"}, n) : null, h("span", {className: "rcp-cap-texto"}, md(r, `k${k}`)))));

  // 04 INVARIANTS: cada promessa num cartão grande — a frase entre aspas e, embaixo, o que ela obriga.
  const inv = [];
  for (const b of secoes.invariants?.blocos || []) {
    if (b.tipo === "q") inv.push({frase: b.texto, texto: []});
    else if (inv.length) inv.at(-1).texto.push(b.texto);
  }
  const invariantes = h("div", {className: "rcp-invs"}, ...inv.map((v, k) => h(A.Card, {key: k, className: "rcp-inv"},
    h("span", {className: "rcp-inv-marca", "aria-hidden": "true"}, h(A.Icon, {name: "shield-check"})),
    h("div", {className: "rcp-inv-corpo"},
      h("p", {className: "rcp-inv-frase"}, `“${v.frase}”`),
      ...v.texto.map((t, n) => h("p", {key: n, className: "rcp-inv-texto"}, md(t, `i${k}${n}`)))))));

  // 05 STATES: cada estado numa linha — o nome em selo e o que a tela faz nele.
  const est = (secoes.states?.blocos || []).filter(b => b.tipo === "li").map(b => cabecaEResto(b.texto));
  const estados = h(A.Card, {className: "rcp-estados", render: h("ul")}, ...est.map(({nome: n, resto: r}, k) => h("li", {key: n || k, className: "rcp-estado"},
    n ? h(A.Badge, {size: "lg", className: "rcp-estado-nome"}, n) : null, h("span", {className: "rcp-estado-texto"}, md(r, `s${k}`)))));

  // As peças que a receita usa: as do import (o `importLine` do gerador já deixa só as que têm ficha).
  const usa = ((/import \{([^}]*)\}/.exec(codigoDoImport ? texto(codigoDoImport) : "") || [])[1] || "")
    .split(",").map(s => s.trim()).filter(n => fichas.some(f => f.name === n));
  const rel = (achar(raiz, e => e.type === "section" && e.props?.id === "related") ? usa : [])
    .map(n => fichas.find(f => f.name === n)).filter(Boolean);

  const lista = [
    {id: "usage", label: "Usage", olho: "Usage", titulo: "Start from this screen.",
      corpo: h("div", {className: "comp-uso"}, codigoDoImport, frase ? h("p", {className: "comp-frase"}, texto(frase)) : null, caixa)},
    {id: "composition", label: "Composition", olho: "Composition", titulo: `${porExtenso(comp.length)} pattern${comp.length === 1 ? "" : "s"}, one screen.`, corpo: composicao},
    {id: "capabilities", label: "Capabilities", olho: "Capabilities", titulo: "What it covers.", corpo: capacidades},
    {id: "invariants", label: "Invariants", olho: "Invariants", titulo: "What never breaks.", corpo: invariantes},
    {id: "states", label: "States", olho: "States", titulo: "Every state it can be in.", corpo: estados},
    ...(rel.length ? [{id: "related", label: "Related Components", olho: "Related Components", titulo: "Built with.",
      corpo: h("div", {className: "comp-relacionados"}, ...rel.map(r => cartaoRelacionado(site, r)))}] : []),
  ];
  const secoesB = lista.map((s, n) => ({id: s.id, label: s.label, node: secao(site, s.id, String(n + 1).padStart(2, "0"), s.olho, s.titulo, s.corpo)}));

  const {prev, next} = site.vizinhos("recipes", `recipe-${slug(id)}.html`);
  const node = h("div", {className: "g1-b item-b rcp-b"},
    abertura(site, {trilha: ["Recipes", nome], titulo: nome, lede: intro || (arquetipo.capabilities || []).join(" · "),
      acoes: site.acoesDaPagina(false, "md"),
      selos: h(Fragment, null,
        ...padroes.map(p => h(A.Badge, {key: p, size: "lg", className: "g1-selo-mono"}, p)),
        h(A.Badge, {key: "n", size: "lg", tone: "primary", emphasis: "solid", className: "g1-selo-mono"}, `${usa.length} component${usa.length === 1 ? "" : "s"}`)),
      extra: caminho(site, ["Archetype", "Patterns", "Invariants"])}),
    ...secoesB.map(s => h(Fragment, {key: s.id}, s.node)),
    anteriorProximo(site, prev, next),
    markdown);
  return {node, toc: secoesB.map(({id: x, label}) => ({id: x, label}))};
}
