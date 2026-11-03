// "PATTERNS" NO SITE B (o desenho `patterns-*`, 02/11/2026): o palco com o caminho Component → Variant → Composition e as
// peças que flutuam; a busca; e os padrões agrupados pelo componente — o número, a inicial, o nome e a contagem, três
// cartões até o "Show all", e os dez primeiros componentes até o "Show more".
import {abertura, buscaDaLista, vazioDaBusca, pecasQueFlutuam, caminho, dois} from "./_grupo-1.mjs";

const PRIMEIROS = 3;
const GRUPOS_DE_INICIO = 10;
// O tom do selo pelo nome da variante, quando o nome é um tom; o resto, neutro.
const TOM = {primary: "primary", danger: "danger", destructive: "danger", success: "success", info: "info", warning: "warning"};
const tomDe = v => TOM[String(v).toLowerCase()] || "neutral";
// A cor da inicial, em volta da roda dos tons do `Avatar`.
const CORES = ["info", "warning", "success", "danger"];

export default function patterns(site) {
  const {h, A, slug, fichas, patterns: todos} = site;
  const porComponente = [];
  for (const p of todos) {
    let g = porComponente.find(x => x.nome === p.component);
    if (!g) porComponente.push(g = {nome: p.component, itens: []});
    g.itens.push(p);
  }
  const exemplo = todos.find(p => /confirm/i.test(p.name)) || todos[0];
  const cabeca = abertura(site, {
    trilha: ["Patterns", "Overview"], titulo: "Patterns", ponteiro: true,
    lede: `${todos.length} compositions over ${porComponente.length} components. A pattern is a component already assembled one specific way. You copy a pattern; you configure a component.`,
    extra: caminho(site, ["Component", "Variant", "Composition"]),
    lado: pecasQueFlutuam(site, [
      h("span", {className: "g1-numerao"}, h("b", null, todos.length), "patterns"),
      h("span", {className: "g1-capsula"}, `${porComponente.length} components`),
      exemplo ? h(A.Card, {className: "pat-mini"}, h(A.Badge, {tone: tomDe(exemplo.variant)}, exemplo.variant),
        h("b", null, exemplo.name), h("span", null, exemplo.description)) : null].filter(Boolean)),
  });
  const temPagina = nome => fichas.some(f => f.name === nome);
  const node = h("div", {className: "g1-b g1-largo pat-b", "data-g1-lista": "", "data-g1-frase": "No pattern mentions"},
    cabeca,
    buscaDaLista(site, {rotulo: "Find a pattern", dica: "Find a pattern — try “empty”, “sidebar” or “confirm”", total: todos.length, chave: "g1"}),
    ...porComponente.map((g, n) => h("section", {key: g.nome, className: "g1-grupo pat-grupo", id: `pat-${slug(g.nome)}`, "data-g1-grupo": "",
      "data-g1-grupo-mais": n >= GRUPOS_DE_INICIO ? "" : undefined, "aria-labelledby": `pat-${slug(g.nome)}-h`},
      h("div", {className: "g1-grupo-topo"},
        h("span", {className: "g1-grupo-num", "aria-hidden": "true"}, dois(n + 1)),
        h("span", {"aria-hidden": "true", className: "pat-inicial"}, h(A.Avatar, {fallback: g.nome.slice(0, 1), size: "md", tone: CORES[n % CORES.length], emphasis: "soft"})),
        h("h2", {id: `pat-${slug(g.nome)}-h`}, g.nome),
        h("span", {className: "g1-grupo-conta"}, `${g.itens.length} pattern${g.itens.length > 1 ? "s" : ""}`),
        temPagina(g.nome) ? h(A.Button, {variant: "ghost", size: "md", className: "pat-pagina", trailingIcon: "arrow-up-right", href: `./${slug(g.nome)}.html`},
          `${g.nome} page`) : null),
      h("div", {className: "pat-cartoes"}, ...g.itens.map((p, k) => h(A.Card, {key: p.slug, variant: "interactive", lift: true, render: h("div"),
        className: "pat-cartao", "data-g1-item": "", "data-mais": k >= PRIMEIROS ? "" : undefined,
        "data-busca": `${p.component} ${p.variant} ${p.name} ${p.description}`.toLowerCase()},
        h(A.Badge, {tone: tomDe(p.variant)}, p.variant),
        h("h3", null, p.name),
        h("p", null, p.description),
        h("a", {className: "pat-abrir", href: `./${p.slug}.html`, "aria-label": `${p.name} — open pattern`}, "Open pattern", h(A.Icon, {name: "arrow-right", size: "sm"}))))),
      g.itens.length > PRIMEIROS ? h("div", {className: "g1-mais"},
        h(A.Button, {variant: "tertiary", size: "lg", type: "button", trailingIcon: "caret-down", "data-g1-mais": "", "aria-expanded": "false"},
          `Show all ${g.itens.length}`)) : null)),
    porComponente.length > GRUPOS_DE_INICIO ? h("div", {className: "pat-mais-grupos", "data-g1-mais-grupos-caixa": ""},
      h("p", null, `Showing ${GRUPOS_DE_INICIO} of ${porComponente.length} components.`),
      h(A.Button, {variant: "primary", type: "button", trailingIcon: "caret-down", "data-g1-mais-grupos": ""},
        `Show ${porComponente.length - GRUPOS_DE_INICIO} more components`)) : null,
    vazioDaBusca(site, {chave: "g1", titulo: "No pattern found", texto: "Try a component name, a variant or a shorter word."}));
  return {node, toc: []};
}
