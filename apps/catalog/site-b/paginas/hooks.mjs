// A PÁGINA "HOOKS" NO DESENHO B (aprovado em 26/10/2026; o mapa em `bancada-site-b/mapa/grupo-2.md`, "hooks").
// O palco com os atalhos para cada hook; cada hook com o caminho do arquivo, o texto, a assinatura e o exemplo (o `CodeBlock`
// com a cabeça do arquivo, o item 6), um "Try it" e as notas; e, no fim, os outros hooks, cada um levando à página dele.
// O texto é o do `content/_hooks.mjs` (lido do código-fonte). O "Try it" é o `site-b/js/hooks.js`: o aviso e o tema passam pela
// ponte do site (`site-hook`, no `live/site.tsx`), que chama o `useToast` e o `useAureaTheme` de verdade, sob o provedor do site.
import {pathToFileURL} from "node:url";
import {fileURLToPath} from "node:url";
import {join, dirname} from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const {default: HOOKS} = await import(pathToFileURL(join(AQUI, "../../content/_hooks.mjs")).href);
const COR = ["blue", "orange", "green", "pink", "teal"];

export default function hooks(site) {
  const {h, Fragment, A, slug, fichas, alfabetico, textoParaCopiar} = site;
  const nomes = HOOKS.map(g => g.name);
  const outros = alfabetico(fichas.filter(f => f.kind === "hook" && !nomes.includes(f.name)));
  const num = n => String(n + 1).padStart(2, "0");

  const palco = h("section", {className: "intro-palco cat-palco hk-palco", "aria-labelledby": "hk-h1", "data-palco": ""},
    h("div", {className: "intro-palco-texto cat-palco-texto"},
      h("span", {className: "intro-trilha"}, "Hooks ", h("span", {"aria-hidden": "true"}, "/"), " ", h("b", null, "Overview")),
      h("h1", {className: "intro-h1", id: "hk-h1"}, "Hooks"),
      h("p", {className: "intro-lede"}, `${HOOKS.length} public hooks. They are API like any component — they just have no registry card, because a card describes a component. Everything below was read from the source file named on each one.`),
      // Os atalhos (o desenho): o `Button` secundário xl com o número num ladrilho redondo da cor do hook.
      h("nav", {className: "hk-atalhos", "aria-label": "Jump to a hook"}, ...HOOKS.map((g, n) =>
        h(A.Button, {key: g.name, variant: "tertiary", size: "xl", href: `#${g.name}`, className: "hk-atalho"},
          h("span", {className: "intro-tile hk-atalho-n", "data-cor": COR[n % COR.length], "aria-hidden": "true"}, n + 1), g.name)))),
    h("div", {className: "intro-pecas cat-pecas", "aria-hidden": "true"},
      h("div", {className: "intro-peca cat-peca-1", "data-fundo": "1"}, h("div", {className: "intro-boia"},
        h("span", {className: "cat-numerao"}, h("b", null, HOOKS.length), "hooks"))),
      h("div", {className: "intro-peca cat-peca-2", "data-fundo": "1.6"}, h("div", {className: "intro-boia"},
        h(A.Card, {className: "intro-cartao intro-cartao-capsula cat-capsula"}, "every one runs below"))),
      h("div", {className: "intro-peca cat-peca-3", "data-fundo": "2"}, h("div", {className: "intro-boia"},
        h(A.Card, {className: "intro-cartao hk-aviso"}, h("span", {className: "cat-visto"}, h(A.Icon, {name: "check"})),
          h("span", null, h("b", null, "Saved"), h("br"), h("span", {className: "hk-apagado"}, "Two files uploaded.")))))));

  // O "Try it" de cada hook: o que a demonstração mostra (o `hooks.js` dá vida).
  const caixaDeTeste = (titulo, dica, ...filhos) => h(A.Card, {className: "hk-teste"},
    h("div", {className: "hk-teste-topo"}, h("span", {className: "hk-teste-nome"}, h("span", {className: "hk-ponto", "aria-hidden": "true"}), titulo),
      h("span", {className: "hk-teste-dica"}, dica)),
    ...filhos);
  const ITENS_DA_LATERAL = [{id: "overview", label: "Overview", icon: "house", href: "#useSidebar-demo"},
    {id: "projects", label: "Projects", icon: "folder", href: "#useSidebar-demo"},
    {id: "members", label: "Members", icon: "users", href: "#useSidebar-demo"},
    {id: "settings", label: "Settings", icon: "gear", href: "#useSidebar-demo"}];
  const lateral = recolhida => h("div", {className: "hk-lateral", "data-hk-lateral": recolhida ? "fechada" : "aberta", hidden: recolhida || undefined},
    // `role="region"`: a lateral é um `<aside>`, e um `<aside>` dentro do `<main>` é um marco fora do lugar (o axe cobra);
    // aqui ela é só a demonstração.
    h(A.Sidebar, {variant: "plain", collapsible: "icon", collapsed: recolhida, indicator: "segment", items: ITENS_DA_LATERAL, current: "overview",
      label: recolhida ? "Demo sidebar, collapsed" : "Demo sidebar", role: "region", "aria-label": recolhida ? "Demo sidebar, collapsed" : "Demo sidebar"}));
  const DEMOS = {
    useToast: () => caixaDeTeste("Try it", "toast.add · toast.promise",
      h("div", {className: "hk-botoes"},
        h(A.Button, {variant: "primary", size: "md", type: "button", "data-hk-aviso": "success"}, "Save"),
        ...["info", "warning", "danger"].map(t => h(A.Button, {key: t, variant: "tertiary", size: "md", type: "button", "data-hk-aviso": t}, t)),
        h(A.Button, {variant: "tertiary", size: "md", type: "button", "data-hk-aviso": "promise"}, "promise")),
      h("p", {className: "hk-vazio"}, "Press a button. Each toast leaves by itself after 4 seconds.")),
    useSidebar: () => caixaDeTeste("Try it", "setCollapsed · toggle",
      h("div", {className: "hk-lateral-demo", id: "useSidebar-demo"},
        lateral(false), lateral(true),
        h("div", {className: "hk-lateral-lado"},
          h("div", {className: "hk-botoes"},
            h(A.Button, {variant: "primary", size: "md", type: "button", "data-hk-lateral-foco": ""}, "Focus mode"),
            h(A.Button, {variant: "tertiary", size: "md", type: "button", "data-hk-lateral-alterna": ""}, h("code", null, "sidebar.toggle()"))),
          h("pre", {className: "hk-leitura", "aria-live": "polite"}, h("code", {"data-hk-lateral-estado": ""},
            "sidebar.collapsed   // false\nsidebar.collapsible // \"icon\""))))),
    useAureaTheme: () => caixaDeTeste("Try it — this changes the whole page", "",
      h("div", {className: "hk-botoes"}, h(A.Button, {variant: "primary", size: "md", type: "button", "data-hk-tema": ""}, h("code", null, "toggleTheme()"))),
      h("span", {className: "segmented segmented-lg segmented-full", "data-segment-style": "emphasis", role: "group", "aria-label": "Density"},
        ...["compact", "comfortable", "spacious"].map(d => h("button", {key: d, type: "button", "data-hk-densidade": d,
          className: d === "comfortable" ? "active" : undefined, "aria-pressed": d === "comfortable" ? "true" : "false"}, d))),
      h("pre", {className: "hk-leitura", "aria-live": "polite"}, h("code", {"data-hk-tema-estado": ""}, "theme   // \"dark\"\ndensity // \"comfortable\"")),
      h(A.Input, {"aria-label": "A field at this density", placeholder: "A field at this density"}),
      h("div", null, h(A.Button, {variant: "primary", size: "md", type: "button"}, "Save"))),
    useAureaStrings: () => caixaDeTeste("Try an override", "one line of the dictionary",
      h(A.Field, {label: h("code", null, "strings.comboboxEmpty")},
        h(A.Input, {defaultValue: "No results", "data-hk-frase": "", autoComplete: "off"})),
      h("pre", {className: "hk-leitura"}, h("code", {"data-hk-frase-codigo": ""}, "<AureaProvider strings={{comboboxEmpty: \"No results\"}}>")),
      h("div", {className: "hk-lista-vazia"},
        h(A.Input, {"aria-label": "A combobox that finds nothing", defaultValue: "zzz", readOnly: true}),
        h("div", {className: "menu hk-menu", role: "status"}, h("div", {className: "combobox-empty", "data-hk-frase-mostra": ""}, "No results")))),
    useSpriteUrl: () => caixaDeTeste("Try it", "what Icon reads",
      h("span", {className: "segmented segmented-lg", "data-segment-style": "emphasis", role: "group", "aria-label": "Sprite"},
        ...["/aurea-icons.svg", "/other-sprite.svg"].map((u, n) => h("button", {key: u, type: "button", "data-hk-sprite": u,
          className: n === 0 ? "active" : undefined, "aria-pressed": n === 0 ? "true" : "false"}, h("code", null, u)))),
      h("div", {className: "hk-sprite"}, h("span", {className: "intro-tile hk-sprite-tile", "aria-hidden": "true"}, h(A.Icon, {name: "plus"})),
        h("code", {"data-hk-sprite-uso": ""}, "<Icon name=\"plus\"/> draws\n<use href=\"/aurea-icons.svg#plus\"/>")),
      h("code", {className: "hk-apagado", "data-hk-sprite-valor": ""}, "useSpriteUrl()  // \"/aurea-icons.svg\"")),
  };

  // O código do desenho: o rótulo em mono maiúsculo e o "Copy" (o botão neutro) numa linha, e o código numa caixa mais escura
  // que o cartão, canto 16. O copiar é o do core (`data-aurea-copy`, o mesmo do `CodeBlock`).
  const blocoDeCodigo = (rotulo, nome, codigo) => h("div", {className: "hk-bloco", "data-aurea-copy-scope": ""},
    h("div", {className: "hk-bloco-cabeca"}, h("p", {className: "hk-cap"}, rotulo),
      h(A.Button, {variant: "tertiary", size: "md", type: "button", "data-aurea-copy": "", "aria-label": `Copy the ${nome} ${rotulo.toLowerCase()}`}, "Copy")),
    h("pre", {className: "hk-caixa", tabIndex: 0}, h("code", null, codigo)));
  const secao = (g, n) => h("section", {key: g.name, className: "hk-sec", id: g.name, "aria-labelledby": `${g.name}-h`},
    h("div", {className: "hk-cabeca"},
      h("span", {className: "cat-familia-num"}, num(n)),
      h("h2", {id: `${g.name}-h`, className: "hk-nome"}, g.name),
      h(A.Badge, {size: "lg", className: "hk-fonte"}, g.source),
      h(A.Button, {variant: "tertiary", size: "md", href: `./${slug(g.name)}.html`, trailingIcon: "arrow-up-right", className: "hk-pagina"}, "Hook page")),
    h("p", {className: "hk-texto"}, g.lede),
    h("div", {className: "hk-grade"},
      h(A.Card, {className: "hk-codigo"}, blocoDeCodigo("Signature", g.name, g.signature), blocoDeCodigo("Example", g.name, g.example)),
      DEMOS[g.name] ? DEMOS[g.name]() : null),
    h("div", {className: "hk-notas"}, ...g.notes.map(([t, v]) => h(A.Card, {key: t, className: "hk-nota"}, h("h3", null, t), h("p", null, v)))));

  const mais = h("section", {className: "hk-sec", id: "more", "aria-labelledby": "more-h"},
    h("div", {className: "hk-cabeca"}, h("span", {className: "cat-familia-num"}, num(HOOKS.length)),
      h("h2", {id: "more-h", className: "hk-titulo"}, `${outros.length === 5 ? "Five" : outros.length} more hooks`),
      h(A.Badge, {size: "lg"}, "each on its own page")),
    h("div", {className: "hk-notas"}, ...outros.map(f => h(A.Card, {key: f.name, variant: "interactive", lift: true, className: "hk-nota hk-mais",
      render: h("a", {href: `./${slug(f.name)}.html`})},
      h("h3", {className: "hk-nome-pequeno"}, f.name), h("p", null, f.summary || ""),
      h("span", {className: "hk-abrir"}, "Open the hook page ", h(A.Icon, {name: "arrow-right", size: "sm"}))))));

  const markdown = ["# Hooks", "", `${HOOKS.length} public hooks.`, "",
    ...HOOKS.flatMap(g => [`## ${g.name}`, "", `Source: \`${g.source}\``, "", g.lede, "", "```tsx", g.signature, "```", "", "```tsx", g.example, "```", "",
      ...g.notes.map(([t, v]) => `- **${t}** — ${v}`), ""]),
    "## More hooks", "", ...outros.map(f => `- [${f.name}](${slug(f.name)}.md): ${f.summary || ""}`)].join("\n");

  const node = h("div", {className: "hk-b", "data-hooks": ""}, palco, ...HOOKS.map(secao), mais, textoParaCopiar(markdown));
  // Sem índice à direita: o desenho põe o "On this page" na lateral, e o conteúdo usa a largura toda.
  return {node, toc: []};
}
