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
import {createPortal, flushSync} from "react-dom";
import {createRoot} from "react-dom/client";
import {createElement as h, Fragment, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {Badge, Button, ColorSwatch, CommandPalette, Drawer, Icon, IconButton, NavList, SegmentedControl, Toggle, ToggleGroup,
  useAureaTheme, useToast} from "../../../packages/react/dist/index.js";
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
  // O "All" VAZIO (o Victor, 03/11/2026: "buscar virou uma lista imensa pra rolar na aba All"): sem nada escrito, o "All"
  // mostra só as sugestões — as páginas das áreas e as 5 primeiras de Getting Started, como a referência (5 sugestões) —;
  // o resto aparece ao digitar ou ao escolher a aba. A peça não diz o que se digitou, então o site escuta o campo dela.
  const [vazio, setVazio] = useState(true);
  // A escuta mora no DOCUMENTO, e não no campo: quando a lista troca, a peça pode montar o campo de novo, e a escuta presa
  // no campo velho se perdia (medido: apagar o texto não trazia as sugestões de volta).
  // E a lista troca ANTES de a primeira letra entrar (`beforeinput`, com `flushSync`): trocada depois, no `input`, o motor
  // da busca apagava a letra que acabara de entrar (medido: "time" virava "ime"). Na volta ao vazio, o `input` basta.
  useEffect(() => {
    if (!aberta) { setVazio(true); return; }
    const campoDaBusca = (e: Event) => {
      const alvo = e.target as HTMLElement | null;
      return alvo instanceof HTMLInputElement && alvo.matches(".command-palette-lg .command-input") ? alvo : null;
    };
    const antes = (e: Event) => {
      const campo = campoDaBusca(e);
      const tipo = (e as InputEvent).inputType ?? "";
      if (!campo) return;
      if (!campo.value.trim() && tipo.startsWith("insert")) flushSync(() => setVazio(false));
      // Apagar o que sobrou (a última letra, ou tudo selecionado) também troca antes: depois, o motor trazia a letra de volta.
      const tudo = campo.value.length <= 1 || (campo.selectionStart === 0 && campo.selectionEnd === campo.value.length);
      if (campo.value && tipo.startsWith("delete") && tudo) flushSync(() => setVazio(true));
    };
    const depois = (e: Event) => { const campo = campoDaBusca(e); if (campo) setVazio(!campo.value.trim()); };
    document.addEventListener("beforeinput", antes, true);
    document.addEventListener("input", depois, true);
    return () => { document.removeEventListener("beforeinput", antes, true); document.removeEventListener("input", depois, true); };
  }, [aberta]);
  const sugestoes = useMemo(() => [...todas.filter((e) => e.group === "Pages"),
    ...todas.filter((e) => e.group === "Getting Started").slice(0, 5)], [todas]);
  const visiveis = useMemo(() => filtro === "all" && vazio ? sugestoes : todas.filter((e) => filtro === "all" || e.group === filtro),
    [todas, filtro, vazio, sugestoes]);
  // O `id` vem da posição na lista INTEIRA, para o mesmo item ter o mesmo `id` nas sugestões e nos resultados.
  const itens = useMemo(() => visiveis.map((e) => { const i = todas.indexOf(e);
    const destino = plataforma === "native" && e.native ? e.native : e.href;
    return {id: `${e.group}-${i}`, label: e.label, group: e.group, description: e.description,
      icon: (e.icon ?? ICONE_DO_GRUPO[e.group] ?? "file") as never, tone: COR_DO_GRUPO[e.group] as never, href: destino,
      run: () => { location.href = `./${destino}`; }};
  }), [todas, visiveis, plataforma]);
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
      // O "Cancel" da busca do celular (só abaixo de 768): no toque não há Esc. A paleta não tem o encaixe ao lado do campo;
      // o botão mora no pé e o arranjo do site o põe ao lado do campo (`site-b/css/celular.css`).
      h(Button, {variant: "ghost", size: "lg", className: "site-busca-cancelar", onClick: () => setAberta(false)}, "Cancel"),
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

// O MENU DO CELULAR (o item 10 do site B, aprovado pela bancada em 01/11/2026): abaixo de 768 (onde o arranjo de
// documentação tinha a gaveta), a folha que sobe de baixo
// (`Drawer side="bottom"`) no lugar da gaveta do lado. Dentro: a busca (o `Button` secundário xl, que abre a mesma
// `CommandPalette`), as áreas (`NavList size="lg"`, o ícone tingido e o selo "You are here" na atual), a chave de tema com
// ícone (`SegmentedControl size="2xl"`), as marcas (`ToggleGroup` xl com o `ColorSwatch`) e os links. E, por último, o que
// a gaveta do lado tinha e o desenho não mostra: a lista da área (a chave Web | Native e o menu da lateral) — o MESMO nó
// da lateral do `AppShell`, levado para a folha enquanto ela está aberta e devolvido ao fechar (ids únicos, e o abrir e
// fechar dos grupos continua o do `aurea.js`).
type Area = {id: string; label: string; href: string; icon: string; tone: string; current?: boolean};
const lugarDoMenu = document.getElementById("site-menu-root");
const areasDoMenu: Area[] = lugarDoMenu ? JSON.parse(lugarDoMenu.dataset.areas || "[]") : [];
const LARGO = "(min-width: 768px)";
const TEMAS_DA_CHAVE = [{value: "light", label: "Light", icon: "sun"}, {value: "dark", label: "Dark", icon: "moon"},
  {value: "system", label: "System", icon: "monitor"}];

function ConteudoDaArea({nomeDaArea}: {nomeDaArea: string}) {
  const lugar = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const destino = lugar.current;
    const lateral = document.getElementById("aurea-shell-nav");
    if (!destino || !lateral) return;
    // A chave Web | Native (só em Components) e a lista da área: os nós da lateral, com o lugar de volta guardado.
    const nos = [lateral.querySelector(".site-plataforma"), lateral.querySelector("nav.sidebar-nav")]
      .filter((n): n is Element => n != null).map((n) => ({n, pai: n.parentNode!, depois: n.nextSibling}));
    for (const {n} of nos) destino.append(n);
    return () => { for (const {n, pai, depois} of nos.reverse()) pai.insertBefore(n, depois); };
  }, []);
  return h(Fragment, null, h("p", {className: "site-menu-rotulo"}, `In ${nomeDaArea}`),
    h("div", {ref: lugar, className: "site-menu-area sidebar-indicator-segment-dot"}));
}

function MenuDoCelular() {
  const [aberto, setAberto] = useState(false);
  const [marca, setMarca] = useState(() => document.documentElement.dataset.brand || "");
  const {preference, setTheme} = useAureaTheme();
  // Na tela larga não há folha: se ela estiver aberta quando a janela alarga, fecha (a lista volta para a lateral).
  useEffect(() => {
    const m = matchMedia(LARGO);
    const muda = () => { if (m.matches) setAberto(false); };
    m.addEventListener("change", muda);
    // A gaveta do lado sai só quando este botão existe: sem JavaScript, ela continua.
    document.documentElement.dataset.siteMenu = "";
    const deFora = (e: Event) => setMarca((e as CustomEvent).detail?.brand || "");
    document.addEventListener("aurea-brand", deFora);
    return () => { m.removeEventListener("change", muda); document.removeEventListener("aurea-brand", deFora); };
  }, []);
  if (!lugarDoMenu) return null;
  const atual = areasDoMenu.find((a) => a.current);
  const total = window.AUREA_SEARCH?.length ?? 0;
  // A busca: fecha a folha e abre a paleta pelo botão de busca do topo que está à vista (o foco volta a ele ao fechar).
  const buscar = () => {
    setAberto(false);
    const botao = [...document.querySelectorAll<HTMLElement>(".topbar [data-site-search]")].find((b) => b.offsetParent != null);
    setTimeout(() => botao?.click(), 0);
  };
  const escolherMarca = (v: string[]) => {
    if (!v.length) return;
    // A padrão (a Gold) não tem nome de marca (ADR-0036): no grupo ela é "gold", no documento é vazia.
    const id = v[0] === "gold" ? "" : v[0];
    setMarca(id);
    document.dispatchEvent(new CustomEvent("aurea-brand", {detail: {brand: id}}));
  };
  return createPortal(h(Fragment, null,
    h(IconButton, {icon: "list", label: "Menu", variant: "tertiary", size: "sm", className: "site-menu-botao",
      "aria-haspopup": "dialog", "aria-expanded": aberto, onClick: () => setAberto(true)}),
    h(Drawer, {open: aberto, onClose: () => setAberto(false), side: "bottom", title: "Menu"},
      h("div", {className: "site-menu-corpo"},
        h(Button, {variant: "secondary", size: "xl", fullWidth: true, leadingIcon: "magnifying-glass", className: "site-menu-busca",
          onClick: buscar}, total ? `Search ${total} pages` : "Search"),
        h("p", {className: "site-menu-rotulo", id: "site-menu-ir"}, "Go to"),
        h(NavList, {size: "lg", currentLabel: "You are here", "aria-labelledby": "site-menu-ir",
          items: areasDoMenu.map((a) => ({id: a.id, label: a.label, href: a.href, icon: a.icon as never, tone: a.tone as never, current: a.current}))}),
        h("p", {className: "site-menu-rotulo"}, "Color theme"),
        h(SegmentedControl, {label: "Color theme", size: "2xl", fullWidth: true, selectedStyle: "neutral", value: preference ?? "dark",
          onChange: (v: string) => setTheme(v as never), items: TEMAS_DA_CHAVE as never}),
        marcasDoMenu.length > 0 && h(Fragment, null,
          h("p", {className: "site-menu-rotulo"}, "Design theme"),
          h(ToggleGroup, {label: "Design theme", detached: true, size: "xl", pressedStyle: "neutral", className: "site-menu-marcas",
            value: [marca || "gold"], onValueChange: escolherMarca},
            ...marcasDoMenu.map((m) => h(Toggle, {key: m.id || "gold", value: m.id || "gold"},
              h(ColorSwatch, {color: m.color, size: "sm", "aria-hidden": true}), m.label)))),
        h("div", {className: "site-menu-links"},
          h(Button, {variant: "secondary", size: "lg", href: lugarDoMenu.dataset.repo}, "GitHub"),
          h(Button, {variant: "secondary", size: "lg", href: lugarDoMenu.dataset.changelog}, "Changelog")),
        atual && h(ConteudoDaArea, {nomeDaArea: atual.label})))), lugarDoMenu);
}
// As marcas vêm do lugar do botão "Theme" (o gerador escreve as 13, com a cor dos tokens).
const marcasDoMenu: Array<{id: string; label: string; color: string}> =
  JSON.parse(document.getElementById("site-theme-root")?.dataset.brands || "[]");

// A PONTE DA PÁGINA DOS HOOKS (o site B): o "Try it" da página `hooks.html` chama os hooks DE VERDADE — o `useToast` e o
// `useAureaTheme` do provedor do site — pelo evento `site-hook` (o `site-b/js/hooks.js`, script comum, não tem React). Só
// existe na página que tem a área dos hooks.
function PonteDosHooks() {
  const toast = useToast();
  const tema = useAureaTheme();
  useEffect(() => {
    const ouve = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {};
      if (d.toast) toast.add(d.toast);
      if (d.promise) toast.promise(new Promise((ok) => setTimeout(ok, 1600)), d.promise);
      if (d.toggleTheme) tema.toggleTheme();
      if (d.density) tema.setDensity(d.density);
    };
    document.addEventListener("site-hook", ouve);
    return () => document.removeEventListener("site-hook", ouve);
  }, [toast, tema]);
  return null;
}
const temHooks = document.querySelector("[data-hooks]") != null;

// O sprite está DENTRO da página (inline), então a base dos ícones é vazia — como no gerador.
// O provedor do site guarda o tema escolhido (15/10/2026); as peças vivas moram todas sob ele.
export function montarSite(...extras: ReactNode[]) {
  const raiz = document.createElement("div");
  raiz.id = "site-search-root";
  document.body.append(raiz);
  // SÍNCRONO (21/10/2026): o primeiro desenho acontece aqui, dentro do script, e não num quadro depois. As caixas vivas
  // que já estão na tela (`vivo.tsx`) trocam o desenho pronto pelo vivo antes de a página terminar de carregar.
  const r = createRoot(raiz);
  flushSync(() => r.render(h(ProvedorDoSite, null, h(Busca), h(MenuDoCelular), h(TemaDoTopo), h(ChavesDeTema), h(SetinhaDoTopo), h(AcoesDaPagina), temHooks ? h(PonteDosHooks) : null, ...extras)));
}
