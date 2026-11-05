// A PÁGINA DE UM COMPONENTE NO SITE B (o molde das ~140 páginas, o desenho `button-*`; 02/11/2026).
//
// O que a página MOSTRA é a peça de verdade (a regra do mapa): o palco de testes desenha a própria peça em cada escolha,
// e os exemplos são as caixas de hoje, vivas (`data-vivo`), com Preview | Code. Por isso esta página parte do
// `site.componentPage` — o mesmo exemplo principal, os mesmos exemplos, o mesmo texto do "Copy Markdown" — e só
// rearruma: a abertura num palco com o palco de testes ao lado; Usage; os exemplos numerados, um `Accordion` cada; a
// Styling Reference em chips que copiam; a API em cartões, com filtro; os relacionados em cartões que sobem; e o
// anterior e o próximo.
//
// Os hooks (a área Hooks) passam por aqui também (a chave "componente"); eles não têm desenho B e continuam como eram.
import {abertura, secao, anteriorProximo, achar, todos, filhos, texto, desenhar, porExtenso, dois, exemploPrincipal, cartaoRelacionado} from "./_grupo-1.mjs";

const MATURIDADE = {Stable: "success", Universal: "primary", Ready: "info", Draft: "warning", Deprecated: "danger"};
// Os estados que o palco liga e desliga, quando a ficha tem a prop (na ordem do desenho: loading, disabled, leadingIcon).
const ESTADOS = [["loading", "boolean"], ["disabled", "boolean"], ["invalid", "boolean"], ["leadingIcon", "plus"]];
// Quantas formas o palco desenha, no máximo: cada uma é um `<template>` pronto na página.
const MAX_FORMAS = 256;
const MAX_VARIACOES = 8;
// A caixa de exemplo: a classe `demo` (com ou sem o `demo-stacked` da ADR-0089).
const ehCaixa = e => String(e?.props?.className ?? "").split(" ").includes("demo");

export default function componente(site, f, i) {
  const base = site.componentPage(f, i);
  if (f.kind === "hook") return base;
  const {h, Fragment, A, slug, REPO} = site;
  const raiz = base.node;
  const porId = id => achar(raiz, e => e.props?.id === id && e.type === "section");
  const uso = porId("usage"), exemplosSec = porId("examples");
  const markdown = achar(raiz, e => e.props?.id === "page-markdown");
  // Do Usage de hoje: o bloco do import, a frase do exemplo principal, a caixa principal (`#preview`, viva) e os pontos.
  const [codigoDoImport, ...resto] = filhos(uso).slice(1);
  const frase = resto.find(e => e.type === "p");
  const caixa = resto.find(e => ehCaixa(e));
  const pontos = resto.find(e => e.type === "ul");
  const linhaDoImport = texto(codigoDoImport) || `import {${f.name}} from "@aurea-uds/react";`;
  const pacote = (linhaDoImport.match(/from\s+"([^"]+)"/) || [])[1] || "@aurea-uds/react";
  const lede = texto(achar(raiz, e => e.props?.className === "page-lede")) || f.summary;
  const exemplos = filhos(exemplosSec).filter(e => e.props?.className === "example").map(e => {
    const [titulo, ...dentro] = filhos(e);
    return {titulo: texto(titulo), descricao: texto(dentro.find(x => x.type === "p")), caixa: dentro.find(x => ehCaixa(x)), id: e.props.id};
  });

  // ── O PALCO DE TESTES ──
  const palco = palcoDeTestes(site, f, linhaDoImport);

  // ── a abertura ──
  const fonte = f.source?.react ? f.source.react.split("#")[0] : null;
  const plataformas = Object.entries(f.platforms || {}).filter(([, s]) => s && s !== "n-a")
    .map(([p, s]) => h(A.Badge, {key: p, size: "lg", className: "g1-selo-mono"}, `${p === "web" ? "Web" : p === "native" ? "Native" : p}${s === "planned" ? " · planned" : ""}`));
  const cabeca = abertura(site, {
    trilha: ["Components", f.category],
    titulo: f.name, lede, classe: "comp-palco",
    acoes: h(Fragment, null,
      fonte ? h(A.Button, {variant: "tertiary", leadingIcon: "code", href: `${REPO}/blob/main/${fonte}`, ...site.NOVA_ABA}, "Source") : null,
      h(A.Button, {variant: "tertiary", leadingIcon: "paint-brush", href: `${REPO}/blob/main/packages/core/src/aurea.css`, ...site.NOVA_ABA}, "Styles source"),
      site.acoesDaPagina(false, "md")),
    selos: h(Fragment, null,
      h(A.Badge, {size: "lg", tone: MATURIDADE[f.maturity] || "neutral", dot: true, className: "g1-selo-mono"}, f.maturity || "Stable"),
      ...plataformas,
      h(A.Badge, {size: "lg", className: "g1-selo-mono"}, pacote)),
    lado: palco,
  });

  // ── as seções, numeradas na ordem em que aparecem ──
  const secoes = [];
  const num = () => dois(secoes.length + 1);
  // 01 · Usage: o import, a frase do exemplo principal e a caixa dele (viva, com o Code), e os pontos de hoje.
  const descricaoPrincipal = texto(frase);
  // A frase de título é a primeira oração da frase do exemplo principal ("One primary action", no Button), quando ela é
  // curta e é uma frase de verdade; senão, a frase comum.
  const tituloDoUso = (() => {
    const pedaco = descricaoPrincipal.split(/[;.:—]/)[0].trim();
    return pedaco && pedaco.length <= 36 && /^[A-Z]/.test(pedaco) && !/[<>{}()[\]`=\/]/.test(pedaco) ? `${pedaco}.` : "Import it, then use it.";
  })();
  secoes.push({id: "usage", label: "Usage", node: secao(site, "usage", num(), "Usage", tituloDoUso,
    h("div", {className: "comp-uso"}, codigoDoImport, frase ? h("p", {className: "comp-frase"}, descricaoPrincipal) : null, caixa,
      pontos ? h("ul", {className: "comp-pontos"}, ...filhos(pontos)) : null))});

  // 02 · Examples: um `Accordion` por exemplo, numerado, com a frase que corta fechada e abre inteira (o B16); dentro, a
  // caixa de hoje, viva. O primeiro abre.
  if (exemplos.length) secoes.push({id: "examples", label: "Examples", node: secao(site, "examples", num(), "Examples",
    `${porExtenso(exemplos.length)} way${exemplos.length > 1 ? "s" : ""} to use it.`,
    h("div", {className: "comp-exemplos"}, ...exemplos.map((ex, n) => h(A.Accordion, {key: ex.id || n, variant: "surface", indicator: "plus",
      size: "lg", className: "comp-exemplo", id: ex.id, ...(n === 0 ? {defaultValue: [`ex${n}`]} : {}),
      items: [{id: `ex${n}`, title: h("span", {className: "comp-ex-cabeca"},
        h("span", {className: "comp-ex-num", "aria-hidden": "true"}, dois(n + 1)),
        h("span", {className: "comp-ex-texto"}, h("b", null, ex.titulo), ex.descricao ? h("span", {className: "comp-ex-frase"}, ex.descricao) : null)),
      content: h(Fragment, null, h("h3", {className: "sr-only"}, ex.titulo), ex.caixa)}]}))))});

  // 03 · Styling Reference: os nomes que a peça aceita, em chips que copiam (o `data-copiar` do site).
  secoes.push({id: "styling", label: "Styling Reference", node: secao(site, "styling", num(), "Styling Reference", "Every name it answers to.",
    h("p", {className: "comp-nota"}, "Press a chip to copy it."),
    referencia(site, f))});

  // 04 · API Reference: um cartão por prop, com o filtro.
  if (f.props?.length) secoes.push({id: "api", label: "API Reference", node: secao(site, "api", num(), "API Reference", "Props, one card each.",
    api(site, f))});

  // 05 · Related Components: os cartões que sobem, com a peça de verdade, parada.
  const rel = [...new Set(f.related?.components || [])].map(nome => site.fichas.find(x => x.name === nome)).filter(Boolean);
  if (rel.length) secoes.push({id: "related", label: "Related Components", node: secao(site, "related", num(), "Related Components", "Close relatives.",
    h("div", {className: "comp-relacionados"}, ...rel.map(r => cartaoRelacionado(site, r))))});

  const {prev, next} = site.vizinhos("components", `${slug(f.name)}.html`);
  const node = h("div", {className: "g1-b comp-b"},
    cabeca,
    ...secoes.map(s => h(Fragment, {key: s.id}, s.node)),
    anteriorProximo(site, prev, next),
    markdown);
  return {node, toc: secoes.map(({id, label}) => ({id, label}))};
}

// ── o palco de testes ───────────────────────────────────────────────────────────────────────────────────────────────
// A peça do exemplo principal, desenhada em cada combinação de VARIANT, SIZE e STATE que a ficha declara. Cada forma é um
// `<template>` pronto, com o código dela; o script da página (`componente.js`) troca a peça e o código quando a escolha
// muda. Sem script, fica a primeira forma. A peça que não tem o que escolher (ou que o exemplo não desenha sozinho)
// aparece parada, como ela é.
function palcoDeTestes(site, f, linhaDoImport) {
  const {h, A, Fragment, slug, nativos, paginaNativa} = site;
  const Peca = A[f.name];
  const ex = exemploPrincipal(f.name);
  const nomeDaProp = n => (f.props || []).find(p => p.name === n);
  let arvore = null;
  try { arvore = ex?.render && !ex.embed && !ex.prerender ? ex.render() : null; } catch { arvore = null; }
  const daPeca = Peca && arvore ? todos(arvore, e => e.type === Peca) : [];
  const escolhas = [];
  let formas = [];
  // Como o script monta a chave de uma forma: a variante e o tamanho (escolhidos, ou fixos) e os estados, nessa ordem.
  let ordem = null;
  if (daPeca.length) {
    // VARIANT: as do exemplo principal (com o rótulo de cada uma), ou as da ficha.
    const doExemplo = [...new Map(daPeca.filter(e => typeof e.props.variant === "string").map(e => [e.props.variant, e])).entries()];
    const variacoes = nomeDaProp("variant") ? (doExemplo.length > 1 ? doExemplo : (f.variants || []).map(v => [v, daPeca[0]])).slice(0, MAX_VARIACOES) : [];
    const tamanhos = nomeDaProp("size") ? (f.sizes || []) : [];
    // Só a prop do TIPO certo: o `loading` do `Image` é "lazy" | "eager", não um estado.
    let estados = ESTADOS.filter(([n, valor]) => { const t = String(nomeDaProp(n)?.type || "");
      return valor === "boolean" ? /^boolean$/.test(t.trim()) : /Icon/.test(t); });
    const conta = () => Math.max(variacoes.length, 1) * Math.max(tamanhos.length, 1) * 2 ** estados.length;
    while (conta() > MAX_FORMAS && estados.length) estados = estados.slice(0, -1);
    const padraoDoTamanho = nomeDaProp("size")?.default;
    const tamanhoInicial = tamanhos.includes(daPeca[0].props.size) ? daPeca[0].props.size : tamanhos.includes(padraoDoTamanho) ? padraoDoTamanho : tamanhos[0];
    if (variacoes.length > 1) escolhas.push({id: "variant", rotulo: "Variant", valores: variacoes.map(([v]) => v)});
    if (tamanhos.length > 1) escolhas.push({id: "size", rotulo: "Size", valores: tamanhos, inicial: tamanhoInicial});
    const listaV = variacoes.length ? variacoes : [[null, daPeca[0]]];
    const listaT = tamanhos.length ? tamanhos : [null];
    ordem = {variant: variacoes.length > 1 ? null : listaV[0][0] ?? "", size: tamanhos.length > 1 ? null : listaT[0] ?? "",
      estados: estados.map(([n]) => n)};
    // Cada combinação dos estados é um número: o bit n liga o estado n.
    try {
      for (const [v, el] of listaV) for (const t of listaT) for (let bits = 0; bits < 2 ** estados.length; bits++) {
        const props = {};
        if (v != null) props.variant = v;
        if (t != null) props.size = t;
        estados.forEach(([n, valor], k) => { if (bits & (1 << k)) props[n] = valor === "boolean" ? true : valor; });
        const elemento = site.h(el.type, {...el.props, ...props, key: undefined});
        const chave = [v ?? "", t ?? "", ...estados.map((_, k) => (bits & (1 << k)) ? 1 : 0)].join("|");
        formas.push({chave, html: desenhar(site, elemento, `palco-${slug(f.name)}-${formas.length}-`),
          codigo: `${linhaDoImport}\n\n${codigoDe(f, el, props)}`});
      }
    } catch { formas = []; }
    if (formas.length) {
      const inicial = [variacoes[0]?.[0] ?? "", tamanhoInicial ?? "", ...estados.map(() => 0)].join("|");
      formas.sort((a, b) => (b.chave === inicial) - (a.chave === inicial));
      for (const [n] of estados) escolhas.push({id: n, rotulo: n, estado: true});
    }
  }
  // Sem formas: a peça do exemplo principal, parada (o vivo dela está no Usage).
  const parada = !formas.length && arvore ? (() => { try { return desenhar(site, arvore, `palco-${slug(f.name)}-`); } catch { return null; } })() : null;
  // A peça do palco é uma CÓPIA da do Usage, e fica parada (`inert`): sem isso o leitor de tela ouviria duas vezes a mesma
  // região, o mesmo nome (o axe pegou na `Table`). A viva, com o código inteiro, está no Usage, logo abaixo. Sem formas, o
  // código é só o import (um gatilho de janela parado aqui, com o código da janela, pareceria quebrado).
  const codigoInicial = formas[0]?.codigo ?? linhaDoImport;
  const temNativo = nativos.includes(f.name);
  const chave = h(A.SegmentedControl, {label: "Playground platform", size: "lg", selectedStyle: "emphasis", value: "web",
    items: [{value: "web", label: "Web", href: `./${slug(f.name)}.html`},
      ...(temNativo ? [{value: "native", label: "Native", href: `./${paginaNativa(f.name)}`}] : [])]});
  const estados = escolhas.filter(e => e.estado);
  return h(A.Card, {className: "comp-teste", role: "region", "aria-label": "Playground", "data-comp-palco": formas.length ? "" : undefined},
    h("div", {className: "comp-teste-topo"}, h("h2", {className: "comp-rotulo"}, "Playground"), chave),
    h("div", {className: "comp-teste-peca"},
      h("div", {className: "comp-teste-boia", "data-comp-peca": "", inert: true,
        ...(formas[0] ? {dangerouslySetInnerHTML: {__html: formas[0].html}} : parada ? {dangerouslySetInnerHTML: {__html: parada}} : {})},
        formas[0] || parada ? undefined : h(A.Icon, {name: f.icon || "cube", size: "xl"}))),
    formas.length ? null : h(A.Link, {href: "#usage", className: "comp-teste-ir"}, "Try it live in Usage", h(A.Icon, {name: "arrow-down", size: "sm"})),
    ...escolhas.filter(e => !e.estado).map(e => h("div", {key: e.id, className: "comp-escolha", "data-comp-escolha": e.id, "data-g1-escolha": ""},
      h("span", {className: "comp-rotulo", "aria-hidden": "true"}, e.rotulo),
      h(A.SegmentedControl, {label: e.rotulo, size: "lg", wrap: true, selectedStyle: "emphasis", value: e.inicial ?? e.valores[0],
        items: e.valores.map(v => ({value: v, label: v}))}))),
    estados.length ? h("div", {className: "comp-escolha"},
      h("span", {className: "comp-rotulo", "aria-hidden": "true"}, "State"),
      h("div", {className: "comp-estados", role: "group", "aria-label": "State"},
        ...estados.map(e => h(A.Checkbox, {key: e.id, variant: "pill", label: e.rotulo, "data-comp-estado": e.id})))) : null,
    h(A.CodeBlock, {language: "tsx", copyable: true, filename: `${f.name}.tsx`, className: "comp-teste-codigo"}, codigoInicial),
    formas.length ? h(Fragment, null, ...formas.map(fm => h("template", {key: fm.chave, "data-comp-forma": fm.chave, "data-codigo": fm.codigo,
      dangerouslySetInnerHTML: {__html: fm.html}}))) : null,
    formas.length ? h("script", {type: "application/json", "data-comp-ordem": "",
      dangerouslySetInnerHTML: {__html: JSON.stringify(ordem).replace(/</g, "\\u003c")}}) : null);
}

// O código de uma forma, como o consumidor escreveria: as props simples do exemplo e as escolhidas; o padrão da ficha não
// se escreve (a não ser a variante, como no desenho).
function codigoDe(f, el, escolhidas) {
  const padrao = Object.fromEntries((f.props || []).map(p => [p.name, p.default]));
  const props = {...el.props, ...escolhidas};
  const attrs = Object.entries(props).filter(([k, v]) => k !== "children" && k !== "key"
    && !(k !== "variant" && padrao[k] != null && String(v) === String(padrao[k]))).map(([k, v]) =>
    typeof v === "string" ? ` ${k}="${v}"` : v === true ? ` ${k}` : typeof v === "number" ? ` ${k}={${v}}` : null).filter(Boolean).join("");
  const c = props.children;
  const dentro = c == null || c === false ? "" : typeof c === "string" || typeof c === "number" ? String(c)
    : Array.isArray(c) && c.every(x => typeof x === "string" || typeof x === "number") ? c.join("") : "…";
  return dentro ? `<${f.name}${attrs}>${dentro}</${f.name}>` : `<${f.name}${attrs} />`;
}

// ── a Styling Reference: cada grupo de nomes, em chips que copiam ──
const MAX_TOKENS = 12;
function referencia(site, f) {
  const {h, Fragment, A} = site;
  const cap = k => k[0].toUpperCase() + k.slice(1);
  const grupos = [["Variants", f.variants], ["Sizes", f.sizes],
    ...Object.entries(f.axes || {}).map(([k, v]) => [cap(k), v]),
    ...(f.responsive?.length ? [["Responsive", f.responsive.map(p => `${p}={{base, viewport|container}}`)]] : []),
    ["States", f.states],
    ["A11y", [f.a11y?.role ? `role="${f.a11y.role}"` : "native semantics", ...(f.a11y?.keyboard || [])]],
    ["Tokens", f.tokens]].filter(([, v]) => v?.length);
  const chip = (t, mais) => h("button", {key: t, type: "button", className: "comp-chip", "data-copiar": t, "aria-label": `Copy ${t}`,
    "data-mais": mais ? "" : undefined, hidden: mais || undefined}, t);
  return h("dl", {className: "comp-chips"}, ...grupos.map(([rotulo, valores]) => h(Fragment, {key: rotulo},
    h("dt", null, rotulo),
    h("dd", null, ...valores.map((v, n) => chip(v, rotulo === "Tokens" && n >= MAX_TOKENS)),
      rotulo === "Tokens" && valores.length > MAX_TOKENS ? h(A.Button, {variant: "ghost", size: "md", type: "button", className: "comp-chips-mais",
        "data-comp-tokens": "", "aria-expanded": "false", "data-rotulo": `Show all ${valores.length}`}, `Show all ${valores.length}`) : null))));
}

// ── a API: um cartão por prop, com o filtro ──
function api(site, f) {
  const {h, A} = site;
  const frase = (t, k) => { try { return site.linhaMd(t, k); } catch { return [t]; } };
  return h("div", {className: "comp-api", "data-comp-api": ""},
    h(A.SearchField, {className: "comp-api-filtro", "aria-label": "Filter props", placeholder: `Filter ${f.props.length} props`,
      autoComplete: "off", "data-comp-api-filtro": ""}),
    h("div", {className: "comp-props"}, ...f.props.map((p, n) => {
      const descricao = String(p.description || "");
      const [primeira, ...demais] = descricao.split(/(?<=\.)\s/);
      const longa = demais.length > 0;
      const tipos = String(p.type || "").split(/\s\|\s/).filter(Boolean);
      return h(A.Card, {key: p.name, className: "comp-prop", "data-comp-prop": p.name.toLowerCase()},
        h("div", {className: "comp-prop-nome"}, h("code", null, p.name),
          p.default ? h("span", {className: "comp-prop-padrao"}, `default · ${p.default}`) : null),
        h("div", {className: "comp-prop-corpo"},
          h("div", {className: "comp-prop-tipos"}, ...tipos.map((t, k) => h("code", {key: k}, t))),
          h("p", {className: "comp-prop-texto"},
            ...frase(primeira, `p${n}a`),
            longa ? h("span", {className: "comp-prop-resto", id: `prop-${p.name.replace(/[^a-z0-9]+/gi, "-")}-mais`}, " ", ...frase(demais.join(" "), `p${n}b`)) : null,
            longa ? h(A.Button, {variant: "link-primary", size: "md", type: "button", className: "comp-prop-mais", "aria-expanded": "false",
              "aria-controls": `prop-${p.name.replace(/[^a-z0-9]+/gi, "-")}-mais`, "data-comp-mais": ""}, "More") : null)));
    })),
    h("p", {className: "comp-nota", "data-comp-api-vazio": "", hidden: true}, "No prop with that name."));
}
