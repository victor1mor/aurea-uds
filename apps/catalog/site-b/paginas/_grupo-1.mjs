// AS FERRAMENTAS COMUNS DO GRUPO 1 do site B (02/11/2026): a página de componente, Releases, Patterns e Blocks.
// Sem `export default`: o gerador carrega todo `.mjs` desta pasta como página, e um módulo sem função padrão fica de fora
// (`pagina()` só chama a chave que tem função). As páginas importam daqui o que repetem.
import {readdirSync} from "node:fs";
import {fileURLToPath, pathToFileURL} from "node:url";
import {join} from "node:path";
import {renderToStaticMarkup} from "react-dom/server";

// O CONTEÚDO DO CATÁLOGO (os exemplos de cada peça), lido uma vez: o palco de testes e as prévias dos cartões desenham a
// peça de verdade a partir do mesmo exemplo que a página mostra. Os módulos são os MESMOS que o gerador já carregou (o
// mesmo endereço), então a peça é a mesma instância.
const pastaDoConteudo = fileURLToPath(new URL("../../content/", import.meta.url));
export const conteudo = {};
for (const f of readdirSync(pastaDoConteudo).filter(f => f.endsWith(".mjs") && !f.startsWith("_")))
  conteudo[f.replace(/\.mjs$/, "")] = (await import(pathToFileURL(join(pastaDoConteudo, f)).href)).default;
const {default: leves} = await import(pathToFileURL(join(pastaDoConteudo, "_starters.mjs")).href);
const {default: motores} = await import(pathToFileURL(join(pastaDoConteudo, "_starters-motores.mjs")).href);
export const deMotor = new Set(Object.keys(motores));
const dePartida = {...leves, ...motores};
// O exemplo principal de uma peça, pelo mesmo caminho do gerador: o primeiro do arquivo próprio, ou o de partida.
export const exemploPrincipal = nome => conteudo[nome]?.examples?.[0] ?? dePartida[nome] ?? null;
export const descricaoDe = nome => conteudo[nome]?.description ?? null;
export const importDe = nome => conteudo[nome]?.install ?? dePartida[nome]?.install ?? null;

// ── a árvore do React, lida por dentro (para reaproveitar o que as funções de hoje já montam) ──
export const filhos = el => {
  const c = el?.props?.children;
  return c == null ? [] : (Array.isArray(c) ? c.flat(Infinity) : [c]).filter(x => x != null && x !== false && x !== "");
};
export function achar(el, teste) {
  if (el == null || typeof el !== "object") return null;
  if (Array.isArray(el)) { for (const x of el) { const r = achar(x, teste); if (r) return r; } return null; }
  if (teste(el)) return el;
  return achar(filhos(el), teste);
}
export function todos(el, teste, saida = []) {
  if (el == null || typeof el !== "object") return saida;
  if (Array.isArray(el)) { for (const x of el) todos(x, teste, saida); return saida; }
  if (teste(el)) saida.push(el);
  for (const x of filhos(el)) todos(x, teste, saida);
  return saida;
}
export const texto = el => el == null || el === false ? "" : typeof el === "string" || typeof el === "number" ? String(el)
  : Array.isArray(el) ? el.map(texto).join("") : texto(el.props?.children);

// Desenha uma peça parada, sob o provedor, com o prefixo próprio nos ids (cada desenho recomeça o contador do `useId`).
export const desenhar = (site, elemento, prefixo) => renderToStaticMarkup(
  site.h(site.A.AureaProvider, {spriteUrl: ""}, elemento), {identifierPrefix: prefixo});

// O número por extenso do título ("Fourteen ways to use it."), como no desenho.
const EXTENSO = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];
export const porExtenso = n => EXTENSO[n] ?? String(n);
export const dois = n => String(n).padStart(2, "0");

// ── as partes que as páginas do grupo repetem ──
// A ABERTURA: o palco do desenho (a cor do palco, canto 22) com a trilha, o título, a descrição, as ações e os selos à
// esquerda, e o que a página põe à direita (o palco de testes, as peças que flutuam). É o `.page-head` do modelo de
// página (o `h1` sem atributo é o que o gerador cobra: o marcador "<h1>").
export function abertura(site, {trilha, titulo, lede, acoes = null, selos = null, extra = null, lado = null, classe = "", ponteiro = false}) {
  const {h} = site;
  return h("header", {className: `page-head g1-palco ${classe}`.trim(), "data-palco": ponteiro ? "" : undefined},
    h("div", {className: "g1-palco-texto"},
      h("span", {className: "intro-trilha"}, trilha[0], " ", h("span", {"aria-hidden": "true"}, "/"), " ", h("b", null, trilha[1])),
      h("h1", null, titulo),
      lede ? h("p", {className: "intro-lede"}, lede) : null,
      acoes ? h("div", {className: "g1-acoes"}, acoes) : null,
      selos ? h("div", {className: "g1-selos"}, selos) : null,
      extra),
    lado);
}
// A seção numerada do corpo (o "01 · Usage" e a frase de título), a mesma da Introduction.
export const secao = (site, id, num, olho, titulo, ...resto) => site.secaoB(id, num, olho, titulo, ...resto);

// O ANTERIOR E O PRÓXIMO do desenho: dois cartões do palco, o círculo de 48 com a seta (o próximo no amarelo). O nome em
// `strong` (é o que o teste da lateral lê), e a classe `prevnext` sozinha, que o modelo de página procura.
export function anteriorProximo(site, prev, next) {
  const {h, A} = site;
  const um = (x, lado) => x ? h("a", {className: `g1-pn g1-pn-${lado}`, href: x.href},
    lado === "ant" ? h("span", {className: "g1-pn-seta"}, h(A.Icon, {name: "arrow-left"})) : null,
    h("span", {className: "g1-pn-texto"}, h("span", {className: "g1-pn-k"}, lado === "ant" ? "Previous" : "Next"), h("strong", null, x.name)),
    lado === "prox" ? h("span", {className: "g1-pn-seta"}, h(A.Icon, {name: "arrow-right"})) : null) : h("span", {"aria-hidden": "true"});
  return prev || next ? h("nav", {className: "prevnext", "aria-label": "Previous and next"}, um(prev, "ant"), um(next, "prox")) : null;
}

// A BUSCA DA LISTA (o "Find a …" do desenho, com a contagem ao lado): o `SearchField` grande, e o número que o script da
// página atualiza. Sem script, tudo aparece.
export function buscaDaLista(site, {rotulo, dica, total, chave}) {
  const {h, A} = site;
  return h("div", {className: "g1-busca"},
    h("div", {className: "g1-busca-campo"},
      h(A.SearchField, {size: "lg", "aria-label": rotulo, placeholder: dica, autoComplete: "off", [`data-${chave}-busca`]: ""})),
    h("p", {className: "g1-conta", role: "status"}, "Showing ", h("b", {[`data-${chave}-mostrando`]: ""}, total), ` of ${total}`));
}

// A CAIXA DO VAZIO da busca: o `EmptyState` com a moldura (o item 9) e o botão de limpar.
export function vazioDaBusca(site, {chave, titulo, texto: frase}) {
  const {h, A} = site;
  return h("div", {className: "card g1-vazio", [`data-${chave}-vazio`]: "", hidden: true},
    h(A.EmptyState, {framed: true, icon: "magnifying-glass", titleAs: "h2", title: h("span", {[`data-${chave}-vazio-titulo`]: ""}, titulo),
      description: frase, action: h(A.Button, {variant: "primary", type: "button", [`data-${chave}-limpar`]: ""}, "Clear the search")}));
}

// As PÍLULAS do caminho ("Component → Variant → Composition"), a última no amarelo. Não clicam.
export function caminho(site, partes) {
  const {h, A} = site;
  return h("p", {className: "g1-caminho", "aria-label": partes.join(", then ")},
    ...partes.flatMap((p, n) => [n ? h(A.Icon, {key: `s${n}`, name: "arrow-right", size: "sm", className: "g1-caminho-seta"}) : null,
      h("span", {key: p, className: "g1-caminho-p", "data-ultima": n === partes.length - 1 ? "" : undefined}, p)]).filter(Boolean));
}

// O NÚMERÃO no amarelo que flutua ("234 patterns") e a cápsula de texto: as peças do palco das listas, como as da All
// Components (`cat-numerao`, `intro-cartao-capsula`).
export function pecasQueFlutuam(site, pecas) {
  const {h} = site;
  return h("div", {className: "intro-pecas g1-pecas", "aria-hidden": "true"},
    ...pecas.map((p, n) => h("div", {key: n, className: `intro-peca g1-peca-${n + 1}`, "data-fundo": String([1.2, 1.6, 0.9][n] ?? 1)},
      h("div", {className: "intro-boia"}, p))));
}

// ── um cartão de "Related Components": a peça de verdade, parada, numa caixa da cor da página ──
export function cartaoRelacionado(site, r) {
  const {h, A, slug} = site;
  const ex = exemploPrincipal(r.name);
  let previa = null;
  try { previa = ex?.render && !ex.embed && !ex.prerender ? desenhar(site, ex.render(), `rel-${slug(r.name)}-`) : null; } catch { previa = null; }
  // O link cobre o cartão por um pseudo-elemento (como o da All Components): a peça de verdade, com botões, não pode
  // morar DENTRO de um <a>.
  return h(A.Card, {key: r.name, variant: "interactive", lift: true, className: "comp-rel", render: h("div")},
    h("span", {className: "comp-rel-previa", "aria-hidden": "true"},
      previa ? h("span", {className: "comp-rel-peca", inert: true, dangerouslySetInnerHTML: {__html: previa}})
        : h(A.Icon, {name: r.icon || "cube", size: "xl"})),
    h("a", {className: "comp-rel-nome", href: `./${slug(r.name)}.html`}, r.name),
    r.summary ? h("span", {className: "comp-rel-resumo"}, r.summary) : null);
}

// ── A PÁGINA DE UM ITEM (um padrão, um bloco): sem desenho próprio, segue a lista e a página de componente. Parte da
// página de hoje (`base`, a do `itemPage`): o import, a caixa principal (`#preview`, viva, com o Code), a frase dela e o
// texto do "Copy Markdown" são os mesmos; o resto é o arranjo do site B.
export function itemDoGrupo(site, {base, area, arquivo, trilha, titulo, lede, selos, caminho: passos, usa, tituloDoUso}) {
  const {h, Fragment} = site;
  const raiz = base.node;
  const uso = achar(raiz, e => e.type === "section" && e.props?.id === "usage");
  const [codigoDoImport, ...resto] = filhos(uso).slice(1);
  const frase = resto.find(e => e.type === "p");
  const caixa = resto.find(e => e.props?.className === "demo");
  const markdown = achar(raiz, e => e.props?.id === "page-markdown");
  const rel = [...new Set(usa)].map(nome => site.fichas.find(f => f.name === nome)).filter(Boolean);
  const secoes = [{id: "usage", label: "Usage", node: secao(site, "usage", "01", "Usage", tituloDoUso,
    h("div", {className: "comp-uso"}, codigoDoImport, frase ? h("p", {className: "comp-frase"}, texto(frase)) : null, caixa))}];
  if (rel.length) secoes.push({id: "related", label: "Related Components", node: secao(site, "related", "02", "Related Components", "Built with.",
    h("div", {className: "comp-relacionados"}, ...rel.map(r => cartaoRelacionado(site, r))))});
  const {prev, next} = site.vizinhos(area, arquivo);
  const node = h("div", {className: "g1-b item-b"},
    abertura(site, {trilha, titulo, lede, acoes: site.acoesDaPagina(false, "md"), selos: h(Fragment, null, ...selos),
      extra: passos ? caminho(site, passos) : null}),
    ...secoes.map(s => h(Fragment, {key: s.id}, s.node)),
    anteriorProximo(site, prev, next),
    markdown);
  return {node, toc: secoes.map(({id, label}) => ({id, label}))};
}
