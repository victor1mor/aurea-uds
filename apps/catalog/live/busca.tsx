// A BUSCA DO SITE — 13/10/2026 (ADR-0067; o Victor: "faltou o buscar").
//
// A `CommandPalette` da Aurea, viva, em TODA página: o botão "Search" do topo e o atalho Ctrl+K (⌘K no
// Mac) abrem; os resultados vêm em grupos — Pages, Components, Hooks, Patterns, Blocks, Recipes —, com o
// título de cada grupo e a linha das teclas embaixo, como na referência. Escolher leva à página.
//
// O índice é o `window.AUREA_SEARCH` que o gerador escreve em `assets/search-index.js`, dos mesmos
// dados das páginas. Sem JavaScript, o botão continua sendo um link para o catálogo.
//
// Pacote PRÓPRIO (`assets/search.js`, IIFE): o `live.js` só roda dentro das molduras de prévia, e
// juntar os dois faria toda página baixar os exemplos de todos os componentes.
import {createRoot} from "react-dom/client";
import {createElement as h, useEffect, useMemo, useState} from "react";
import {CommandPalette} from "../../../packages/react/dist/index.js";
// O botão "Theme" (14/10/2026) é a outra peça viva do topo: vai no mesmo pacote, que toda página já carrega, e
// sob o MESMO provedor (ver `tema.tsx`).
import {ChavesDeTema, ProvedorDoSite, TemaDoTopo} from "./tema";

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

const raiz = document.createElement("div");
raiz.id = "site-search-root";
document.body.append(raiz);
// O sprite está DENTRO da página (inline), então a base dos ícones é vazia — como no gerador.
// O provedor do site guarda o tema escolhido (15/10/2026); as peças vivas do topo moram todas sob ele.
createRoot(raiz).render(h(ProvedorDoSite, null, h(Busca), h(TemaDoTopo), h(ChavesDeTema)));
