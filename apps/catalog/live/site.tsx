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
import {CommandPalette} from "../../../packages/react/dist/index.js";
// O botão "Theme" (14/10/2026) é a outra peça viva do topo: vai no mesmo pacote, que toda página já carrega, e
// sob o MESMO provedor (ver `tema.tsx`).
import {ChavesDeTema, ProvedorDoSite, SetinhaDoTopo, TemaDoTopo} from "./tema";
// A setinha do "Copy Markdown" (SITE-06, 18/10/2026), sob o mesmo provedor.
import {AcoesDaPagina} from "./acoes";

type Entrada = {label: string; href: string; group: string};
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
  const itens = useMemo(() => (window.AUREA_SEARCH ?? []).map((e, i) => ({
    id: `${e.group}-${i}`, label: e.label, group: e.group,
    run: () => { location.href = `./${e.href}`; },
  })), []);
  return h(CommandPalette, {open: aberta, onClose: () => setAberta(false), items: itens,
    placeholder: "Search components, patterns and pages", label: "Search the site"});
}

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
