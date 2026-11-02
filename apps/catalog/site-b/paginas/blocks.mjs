// "BLOCKS" NO SITE B (o desenho `blocks-*`, 02/11/2026): o palco com o caminho Component → Pattern → Block e as peças que
// flutuam; a busca; os blocos em grupos, cada um num cartão com a miniatura (o PRÓPRIO bloco, parado e reduzido), o
// nome, o texto e dois botões — "Preview", que abre o bloco no lugar, numa linha inteira (o bloco de verdade, vivo, com o
// que ele usa, o import e "Open the block page"), e "Block page". O atalho "Need something smaller?" fecha o primeiro grupo.
import {abertura, achar, buscaDaLista, vazioDaBusca, pecasQueFlutuam, caminho, dois} from "./_grupo-1.mjs";

// Os grupos: a área com três blocos ou mais é um grupo só dela; as outras, um bloco cada, juntas.
const MINIMO_DO_GRUPO = 3;
// A miniatura é o mesmo HTML do bloco, sem os nomes que ligam uma parte a outra (id, for, aria-*): ela é desenho, parada
// e escondida do leitor de tela, e o mesmo id duas vezes na página quebraria o bloco aberto.
const semIds = html => html.replace(/\s(id|for|aria-labelledby|aria-describedby|aria-controls|aria-activedescendant|name|list|form)="[^"]*"/g, "");

export default function blocks(site) {
  const {h, A, slug, fichas, blocks: todos} = site;
  const porArea = [];
  for (const b of todos) {
    let g = porArea.find(x => x.area === b.category);
    if (!g) porArea.push(g = {area: b.category, itens: []});
    g.itens.push(b);
  }
  const soltos = porArea.filter(g => g.itens.length < MINIMO_DO_GRUPO);
  const grupos = [
    ...(soltos.length ? [{titulo: "Everyday sections", frase: `One block for each of ${soltos.length} areas — the sections almost every product has.`,
      itens: soltos.flatMap(g => g.itens), atalho: true}] : []),
    ...porArea.filter(g => g.itens.length >= MINIMO_DO_GRUPO).map(g => ({titulo: g.area, frase: null, itens: g.itens}))];
  // O desenho de cada bloco, lido da página de hoje (o mesmo HTML da caixa dela, pré-desenhado quando é o caso), e a chave
  // da parte viva. O bloco com motor pesado fica parado aqui (a página carregaria os motores só por ele).
  const desenhos = new Map(todos.map((b, i) => {
    const painel = achar(site.blockPage(b, i).node, e => e.props?.["data-panel"] === "preview" && e.props?.dangerouslySetInnerHTML);
    return [b.slug, {html: painel?.props.dangerouslySetInnerHTML.__html || "", vivo: painel?.props["data-vivo-motor"] === undefined ? painel?.props["data-vivo"] : null}];
  }));
  let numero = 0;
  const amostra = todos.find(b => /sign/i.test(b.name));
  const cabeca = abertura(site, {
    trilha: ["Blocks", "Overview"], titulo: "Blocks", ponteiro: true,
    lede: `${todos.length} ready sections across ${porArea.length} areas. A block is bigger than a pattern and smaller than a screen: the piece you drop whole into a page. Every one of them is built with the components in this catalog.`,
    extra: caminho(site, ["Component", "Pattern", "Block"]),
    lado: pecasQueFlutuam(site, [
      h("span", {className: "g1-numerao"}, h("b", null, todos.length), "blocks"),
      h("span", {className: "g1-capsula"}, `${porArea.length} areas`),
      amostra ? h(A.Card, {className: "blk-mini"}, h("span", {className: "blk-mini-peca", inert: true,
        dangerouslySetInnerHTML: {__html: semIds(desenhos.get(amostra.slug).html)}})) : null].filter(Boolean)),
  });
  const cartao = (b, idx) => {
    const n = dois(++numero);
    const d = desenhos.get(b.slug);
    const usa = [...new Set(b.uses || [])];
    const painelId = `blk-${b.slug}-aberto`;
    const proximo = todos[(idx + 1) % todos.length];
    return [
      h(A.Card, {key: b.slug, variant: "interactive", lift: true, render: h("div"), className: "blk-cartao", "data-g1-item": "", "data-blk": b.slug,
        "data-busca": `${b.category} ${b.name} ${b.description} ${usa.join(" ")}`.toLowerCase()},
        h("span", {className: "blk-miniatura", "aria-hidden": "true"},
          h("span", {className: "blk-miniatura-peca", inert: true, dangerouslySetInnerHTML: {__html: semIds(d.html)}})),
        h("p", {className: "blk-olho"}, `${b.category} · ${n}`),
        h("h3", null, b.name),
        h("p", {className: "blk-texto"}, b.description),
        h("div", {className: "blk-botoes"},
          h(A.Button, {variant: "secondary", size: "sm", type: "button", "aria-expanded": "false", "aria-controls": painelId, "data-blk-abrir": ""}, "Preview"),
          h(A.Button, {variant: "ghost", size: "sm", href: `./${b.slug}.html`, trailingIcon: "arrow-up-right", "aria-label": `${b.name} — block page`}, "Block page"))),
      // O BLOCO ABERTO NO LUGAR: a linha inteira, o palco à esquerda (7/12) e as informações à direita (5/12).
      h("section", {key: `${b.slug}-aberto`, className: "blk-aberto", id: painelId, hidden: true, "data-blk-painel": b.slug, "aria-label": `${b.name} preview`},
        h("div", {className: "blk-palco"},
          h(A.Badge, {tone: "success", dot: true, size: "lg", className: "g1-selo-mono blk-ao-vivo"}, d.vivo ? "Live — try it" : "Preview"),
          h("div", {className: "blk-palco-peca", ...(d.vivo ? {"data-vivo": d.vivo} : {}), dangerouslySetInnerHTML: {__html: d.html}})),
        h("div", {className: "blk-info"},
          h("div", {className: "blk-info-topo"},
            h("div", null, h("p", {className: "blk-olho"}, `${b.category} · ${n}`), h("h3", null, b.name)),
            h(A.IconButton, {icon: "x", label: "Close the preview", variant: "tertiary", "data-blk-fechar": ""})),
          h("p", {className: "blk-texto"}, b.description),
          usa.length ? h("div", {className: "blk-usa"}, h("p", {className: "comp-rotulo"}, "Built with"),
            h("div", {className: "blk-usa-lista"}, ...usa.map(u => fichas.some(f => f.name === u)
              ? h("a", {key: u, className: "blk-chip", href: `./${slug(u)}.html`}, u) : h("span", {key: u, className: "blk-chip"}, u)))) : null,
          h("div", {className: "blk-usa"}, h("p", {className: "comp-rotulo"}, "Import"),
            h(A.CodeBlock, {language: "tsx", copyable: true}, `import {${usa.filter(u => fichas.some(f => f.name === u)).join(", ")}} from "@aurea-uds/react";`)),
          h("div", {className: "blk-botoes"},
            h(A.Button, {variant: "primary", href: `./${b.slug}.html`, trailingIcon: "arrow-right"}, "Open the block page"),
            h(A.Button, {variant: "secondary", type: "button", "data-blk-proximo": proximo.slug}, "Next block"))))];
  };
  const node = h("div", {className: "g1-b g1-largo blk-b", "data-g1-lista": "", "data-g1-frase": "No block mentions"},
    cabeca,
    buscaDaLista(site, {rotulo: "Find a block", dica: "Find a block — try “table”, “receipt” or a component, like “KPI”", total: todos.length, chave: "g1"}),
    ...grupos.map((g, n) => h("section", {key: g.titulo, className: "g1-grupo blk-grupo", id: `blk-${slug(g.titulo)}`, "data-g1-grupo": "",
      "aria-labelledby": `blk-${slug(g.titulo)}-h`},
      h("div", {className: "g1-grupo-topo"},
        h("span", {className: "g1-grupo-num", "aria-hidden": "true"}, dois(n + 1)),
        h("h2", {id: `blk-${slug(g.titulo)}-h`}, g.titulo),
        h("span", {className: "g1-grupo-conta"}, `${g.itens.length} block${g.itens.length > 1 ? "s" : ""}`)),
      g.frase ? h("p", {className: "blk-frase"}, g.frase) : null,
      h("div", {className: "blk-cartoes"}, ...g.itens.flatMap(b => cartao(b, todos.indexOf(b))),
        g.atalho ? h(A.Card, {key: "atalho", className: "blk-atalho"},
          h("h3", null, "Need something smaller?"),
          h("p", null, `A pattern is one component assembled one way. ${site.patterns.length} of them, one click from here.`),
          h(A.Button, {variant: "secondary", size: "sm", href: "./patterns.html", trailingIcon: "arrow-right"}, "Browse patterns"),
          h("p", null, "Need a whole screen? Recipes put blocks together."),
          h(A.Button, {variant: "ghost", size: "sm", href: "./recipes.html", trailingIcon: "arrow-right"}, "Browse recipes")) : null))),
    vazioDaBusca(site, {chave: "g1", titulo: "No block found", texto: "Try an area, a component name or a shorter word."}));
  return {node, toc: []};
}
