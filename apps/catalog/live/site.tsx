// A BUSCA DO SITE — 13/10/2026 (ADR-0067; o Victor: "faltou o buscar").
//
// A `CommandPalette` da Aurea, viva, em TODA página: o botão "Search" do topo e o atalho Ctrl+K (⌘K no
// Mac) abrem; os resultados vêm em grupos — Pages, Components, Hooks, Patterns, Blocks, Recipes —, com o
// título de cada grupo e a linha das teclas embaixo, como na referência. Escolher leva à página.
//
// O índice é o `window.AUREA_SEARCH` que o gerador escreve em `assets/search-index.js`, dos mesmos
// dados das páginas. Sem JavaScript, o botão continua sendo um link para o catálogo.
//
// Pacote PRÓPRIO (`assets/search.js`, IIFE) nas páginas SEM caixa viva: juntar com o `live.js` faria toda página
// baixar os exemplos de todos os componentes. A página de componente carrega só o `live.js` (21/10/2026), que monta
// estas peças E as caixas vivas, sob o mesmo provedor (`vivo.tsx`).
//
// Este arquivo MONTA as peças vivas do site; quem entra é o `busca.tsx` (o `search.js`, das páginas todas) ou o
// `inicio.tsx` (o `home.js`, só do Início, que leva também a vitrine — 15/10/2026). Os dois sob o MESMO provedor.
import {flushSync} from "react-dom";
import {createRoot} from "react-dom/client";
import {createElement as h, type ReactNode, useEffect, useMemo, useState} from "react";
import {Badge, Button, CommandPalette, Icon, SegmentedControl, Toggle, ToggleGroup} from "../../../packages/react/dist/index.js";
// O botão "Theme" (14/10/2026) é a outra peça viva do topo: vai no mesmo pacote, que toda página já carrega, e
// sob o MESMO provedor (ver `tema.tsx`).
import {ChavesDeTema, ProvedorDoSite, SetinhaDoTopo, TemaDoTopo} from "./tema";
// A setinha do "Copy Markdown" (SITE-06, 18/10/2026), sob o mesmo provedor.
import {AcoesDaPagina} from "./acoes";

type Entrada = {label: string; href: string; group: string; description?: string; icon?: string; native?: string};
declare global {interface Window {AUREA_SEARCH?: Entrada[]}}

function Busca() {
  const [aberta, setAberta] = useState(false);
  useEffect(() => {
    const clique = (e: MouseEvent) => {
      const alvo = (e.target as Element | null)?.closest?.("[data-site-search]");
      if (!alvo) return;
      e.preventDefault();
      // No Safari o clique não dá foco a um link, e a janela da busca devolve o foco a quem o tinha ao abrir —
      // sem isto, fechar deixava o foco solto na página (medido no WebKit, 14/10/2026). Chrome e Firefox já
      // focam sozinhos.
      (alvo as HTMLElement).focus({preventScroll: true});
      setAberta(true);
    };
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberta((a) => !a);
      }
    };
    document.addEventListener("click", clique);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("click", clique);
      document.removeEventListener("keydown", tecla);
    };
  }, []);
  // O SITE B (0.54.0, a busca aprovada pela bancada em 01/11/2026, o item 2): a `CommandPalette` grande — os filtros por
  // grupo com a contagem, o círculo do ícone na cor do grupo, a descrição, a prévia do item ativo, as sugestões e, no pé, a
  // chave "Components for" Web | Native (no Native, o componente leva à página do nativo, quando ela existe).
  const [filtro, setFiltro] = useState("all");
  const [plataforma, setPlataforma] = useState("web");
  const todas = window.AUREA_SEARCH ?? [];
  const grupos = useMemo(() => [...new Set(todas.map((e) => e.group))], [todas]);
  const itens = useMemo(() => todas.filter((e) => filtro === "all" || e.group === filtro).map((e, i) => {
    const destino = plataforma === "native" && e.native ? e.native : e.href;
    return {id: `${e.group}-${i}`, label: e.label, group: e.group, description: e.description,
      icon: (e.icon ?? ICONE_DO_GRUPO[e.group] ?? "file") as never, tone: COR_DO_GRUPO[e.group] as never, href: destino,
      run: () => { location.href = `./${destino}`; }};
  }), [todas, filtro, plataforma]);
  const sugerir = (texto: string) => {
    const campo = document.querySelector<HTMLInputElement>(".command-palette-lg .command-input");
    if (!campo) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(campo, texto);
    campo.dispatchEvent(new Event("input", {bubbles: true}));
    campo.focus();
  };
  return h(CommandPalette, {open: aberta, onClose: () => setAberta(false), items: itens, size: "lg",
    placeholder: `Search ${todas.length} pages — components, patterns, blocks, recipes…`, label: "Search the site",
    filters: h(ToggleGroup, {label: "Filter", detached: true, pressedStyle: "contrast", className: "site-busca-filtros",
      value: [filtro], onValueChange: (v: string[]) => setFiltro(v[0] ?? "all")},
      h(Toggle, {value: "all", size: "lg"}, "All", h(Badge, {size: "sm"}, String(todas.length))),
      ...grupos.map((g) => h(Toggle, {key: g, value: g, size: "lg"}, g, h(Badge, {size: "sm"}, String(todas.filter((e) => e.group === g).length))))),
    preview: (item: {label: string; group?: string; description?: string; icon?: string; tone?: string; href?: string}) =>
      h("div", {className: "site-busca-previa"},
        h(Badge, {className: "site-busca-area"}, h("span", {className: "command-item-tile site-busca-tile", "data-tone": item.tone},
          h(Icon, {name: (item.icon ?? "file") as never})), item.group),
        h("h2", {className: "site-busca-titulo"}, item.label),
        item.description ? h("p", {className: "site-busca-texto"}, item.description) : null,
        h("code", {className: "site-busca-end"}, `aureauds.dev/${item.href ?? ""}`),
        h(Button, {variant: "primary", size: "lg", className: "site-busca-abrir", trailingIcon: "arrow-right",
          href: `./${item.href ?? ""}`}, "Open the page")),
    footer: h("div", {className: "site-busca-pe"},
      h("div", {className: "site-busca-sugestoes", role: "group", "aria-label": "Suggestions"},
        ...SUGESTOES.map((s) => h(Button, {key: s, variant: "secondary", className: "site-busca-sug", onClick: () => sugerir(s)}, s))),
      h("span", {className: "site-busca-dir"}, h("span", {id: "site-busca-plataforma"}, "Components for"),
        h(SegmentedControl, {label: "Components for", value: plataforma, onChange: setPlataforma, selectedStyle: "neutral",
          items: [{value: "web", label: "Web"}, {value: "native", label: "Native"}]}))),
  });
}
// A cor e o ícone de cada grupo na busca: os do desenho aprovado (Getting Started verde, Components azul, Releases rosa,
// Patterns laranja…), das oito cores de categoria da Aurea.
const COR_DO_GRUPO: Record<string, string> = {"Pages": "blue", "Getting Started": "green", "Components": "blue", "Hooks": "green",
  "Patterns": "orange", "Blocks": "green", "Recipes": "pink", "Releases": "pink"};
const ICONE_DO_GRUPO: Record<string, string> = {"Pages": "compass", "Getting Started": "book-open", "Hooks": "function",
  "Patterns": "puzzle-piece", "Blocks": "stack", "Recipes": "cooking-pot", "Releases": "rocket-launch"};
const SUGESTOES = ["Button", "sidebar", "empty", "useToast", "receipt"];

// O sprite está DENTRO da página (inline), então a base dos ícones é vazia — como no gerador.
// O provedor do site guarda o tema escolhido (15/10/2026); as peças vivas moram todas sob ele.
export function montarSite(...extras: ReactNode[]) {
  const raiz = document.createElement("div");
  raiz.id = "site-search-root";
  document.body.append(raiz);
  // SÍNCRONO (21/10/2026): o primeiro desenho acontece aqui, dentro do script, e não num quadro depois. As caixas vivas
  // que já estão na tela (`vivo.tsx`) trocam o desenho pronto pelo vivo antes de a página terminar de carregar.
  const r = createRoot(raiz);
  flushSync(() => r.render(h(ProvedorDoSite, null, h(Busca), h(TemaDoTopo), h(ChavesDeTema), h(SetinhaDoTopo), h(AcoesDaPagina), ...extras)));
}
