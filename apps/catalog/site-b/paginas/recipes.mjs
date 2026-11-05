// A PÁGINA "RECIPES" NO SITE B (refeita em 05/11/2026, o S-11 — o Victor: "eu fico confuso com esse monte de sidebar, não
// sei usar, quero algo intuitivo"). Sai o "Recipe builder" (a lista de receitas numa coluna e a grade dos padrões que
// acendiam); fica o molde da lista de Blocks: o palco com as peças que flutuam, a busca, e as receitas em grupos, cada uma
// num cartão grande com a MINIATURA da tela de verdade (o mesmo HTML da caixa da página dela, parado e reduzido), o nome,
// o texto e os padrões que ela compõe. O nome leva à página da receita (o link cobre o cartão). A busca é a comum do site
// (`_grupo-1.js`, `data-g1-lista`). Os dados são os do contrato e do texto de cada receita (`patterns/<id>.md`).
import {readFileSync} from "node:fs";
import {abertura, achar, buscaDaLista, caminho, dois, pecasQueFlutuam, texto, vazioDaBusca} from "./_grupo-1.mjs";

const PASTA = new URL("../../../../patterns/", import.meta.url);
// O texto de abertura da receita: o que vem entre o título e a primeira linha de corte (ou o primeiro subtítulo).
const aberturaDe = id => {
  const linhas = readFileSync(new URL(`${id}.md`, PASTA), "utf8").replace(/\r\n/g, "\n").replace(/^---\n[\s\S]*?\n---\n/, "").split("\n");
  const ini = linhas.findIndex(l => l.startsWith("# ")) + 1;
  const fim = linhas.findIndex((l, i) => i >= ini && (/^━/.test(l) || l.startsWith("## ")));
  return linhas.slice(ini, fim < 0 ? undefined : fim).join(" ").replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
};
// Os grupos da lista, pelo tipo de produto. A receita que não estiver em nenhum (uma nova no contrato) vai para o último.
const GRUPOS = [
  ["Business apps", "The screens of a product that runs a business: members, numbers, deals, money, bookings and cases.",
    ["saas_admin", "dashboard_bi", "project_crm_erp", "commerce_finance", "booking_calendar", "support_service", "regulated_records"]],
  ["Operations and AI", "Work that runs on its own and needs a person at the right moment: agents, automations, devices and systems.",
    ["agent_ai", "workflow_automation", "developer_tools", "observability_ops", "iot_control", "maps_logistics", "file_cloud"]],
  ["Content and sites", "Pages people read, watch, learn from or make.",
    ["public_site", "docs_cms", "catalog_gallery", "media_streaming", "education", "creative_workspace"]],
  ["Personal and social", "Small screens for one person or a conversation.",
    ["messaging_social", "personal_productivity", "mobile_pwa"]],
];
// A miniatura é desenho, parada e escondida do leitor de tela: sem os nomes que ligam uma parte a outra (o mesmo id duas
// vezes na página quebraria a busca e os rótulos).
const semIds = html => html.replace(/\s(id|for|aria-labelledby|aria-describedby|aria-controls|aria-activedescendant|name|list|form)="[^"]*"/g, "");

export default function recipes(site) {
  const {h, A, slug, recipeTitle, contract, textoParaCopiar} = site;
  const arquetipos = contract.applicationPatterns.archetypes;
  const ids = Object.keys(arquetipos);
  const receitas = ids.map((id, i) => {
    const pagina = site.recipePage(id, arquetipos[id], i, ids).node;
    const painel = achar(pagina, e => e.props?.["data-panel"] === "preview" && e.props?.dangerouslySetInnerHTML);
    // As peças que a receita usa (o import da página dela), para a busca achar "DataGrid", "HumanApproval"…
    const usa = ((/import \{([^}]*)\}/.exec(texto(achar(pagina, e => String(e.props?.className ?? "").includes("usage-import")))) || [])[1] || "")
      .split(",").map(x => x.trim()).filter(Boolean);
    return {id, nome: recipeTitle(id), texto: aberturaDe(id), padroes: arquetipos[id].patterns || [],
      foco: (arquetipos[id].capabilities || []).slice(0, 4), href: `./recipe-${slug(id)}.html`, html: painel?.props.dangerouslySetInnerHTML.__html || "", usa};
  });
  const nosGrupos = new Set(GRUPOS.flatMap(g => g[2]));
  const grupos = GRUPOS.map(([titulo, frase, lista]) => ({titulo, frase, itens: lista.map(id => receitas.find(r => r.id === id)).filter(Boolean)}));
  grupos.at(-1).itens.push(...receitas.filter(r => !nosGrupos.has(r.id)));
  
  const cabeca = abertura(site, {
    trilha: ["Recipes", "Overview"], titulo: "Recipes", ponteiro: true,
    lede: `${receitas.length} whole screens, one for each kind of product. A recipe is bigger than a block: it puts the specialised components together into a working screen, and says which rules the screen must keep.`,
    extra: caminho(site, ["Component", "Block", "Recipe"]),
    lado: pecasQueFlutuam(site, [
      h("span", {className: "g1-numerao"}, h("b", null, receitas.length), "recipes"),
      h("span", {className: "g1-capsula"}, `${grupos.length} kinds of product`)]),
  });

  let numero = 0;
  const cartao = (r, grupo) => {
    const n = dois(++numero);
    return h(A.Card, {key: r.id, variant: "interactive", lift: true, render: h("div"), className: "rcs-cartao", "data-g1-item": "",
      "data-busca": `${grupo} ${r.nome} ${r.texto} ${r.padroes.join(" ")} ${r.foco.join(" ")} ${r.usa.join(" ")}`.toLowerCase()},
      h("span", {className: "rcs-miniatura", "aria-hidden": "true"},
        h("span", {className: "rcs-miniatura-peca", inert: true, dangerouslySetInnerHTML: {__html: semIds(r.html)}})),
      h("div", {className: "rcs-texto"},
        h("p", {className: "rcs-olho"}, `${grupo} · ${n}`),
        h("h3", null, h("a", {className: "rcs-nome", href: r.href}, r.nome)),
        h("p", {className: "rcs-lede"}, r.texto),
        h("div", {className: "rcs-padroes", role: "list", "aria-label": `Patterns in ${r.nome}`},
          ...r.padroes.map(p => h(A.Badge, {key: p, role: "listitem", className: "g1-selo-mono"}, p))),
        h("span", {className: "rcs-abrir", "aria-hidden": "true"}, "Open the recipe", h(A.Icon, {name: "arrow-right", size: "sm"}))));
  };

  const markdown = [`# Recipes`, "", `${receitas.length} whole screens, one for each kind of product. A recipe puts the specialised components together into a working screen, and says which rules the screen must keep.`, "",
    ...grupos.flatMap(g => [`## ${g.titulo}`, "", ...g.itens.map(r => `- [${r.nome}](${r.href.replace("./", "")}): ${r.texto}`), ""])].join("\n");

  const node = h("div", {className: "g1-b g1-largo rcs-b", "data-g1-lista": "", "data-g1-frase": "No recipe mentions"},
    cabeca,
    buscaDaLista(site, {rotulo: "Find a recipe", dica: "Find a recipe — try “approval”, “members” or a component, like “DataGrid”", total: receitas.length, chave: "g1"}),
    ...grupos.map((g, k) => h("section", {key: g.titulo, className: "g1-grupo rcs-grupo", id: `rcs-${slug(g.titulo)}`, "data-g1-grupo": "",
      "aria-labelledby": `rcs-${slug(g.titulo)}-h`},
      h("div", {className: "g1-grupo-topo"},
        h("span", {className: "g1-grupo-num", "aria-hidden": "true"}, dois(k + 1)),
        h("h2", {id: `rcs-${slug(g.titulo)}-h`}, g.titulo),
        h("span", {className: "g1-grupo-conta"}, `${g.itens.length} of ${g.itens.length}`)),
      h("p", {className: "rcs-frase"}, g.frase),
      h("div", {className: "rcs-cartoes"}, ...g.itens.map(r => cartao(r, g.titulo))))),
    vazioDaBusca(site, {chave: "g1", titulo: "No recipe found", texto: "Try a kind of product, a component name or a shorter word."}),
    textoParaCopiar(markdown));
  return {node, toc: []};
}
