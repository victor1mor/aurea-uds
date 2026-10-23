// O `assets/live-nativo.js` — a parte viva das páginas do NATIVO (bloco 1, o 5-A — 23/10/2026).
//
// Monta as peças do topo do site (a busca, o tema, a setinha: `montarSite`, as mesmas do `live.js`) e acende cada caixa
// do nativo (`[data-vivo-nativo="Nome:índice"]`): a página chega com a peça desenhada nos dois temas pelo gerador, e aqui
// as duas dão lugar a UMA peça viva, que se toca, rola e segue o tema do site quando ele muda.
//
// Cada caixa é uma raiz própria do `react-dom` com o provedor do NATIVO (`Moldura`): o provedor da web continua um só,
// o do topo — e o do nativo não monta região de avisos, então não há duas com o mesmo nome (o `landmark-unique`).
import {createElement as h, useSyncExternalStore} from "react";
import {createRoot} from "react-dom/client";
import {Moldura} from "../nativo/moldura.mjs";
import {montarSite} from "./site";

type Exemplo = {render: () => unknown};
const modulos = import.meta.glob<{examples: Exemplo[]}>(["../content/native/*.mjs"], {import: "default", eager: true});
const exemplo = (nome: string, indice: number) => modulos[`../content/native/${nome}.mjs`]?.examples?.[indice];

// O tema do site mora no `<html data-theme>`; a caixa do nativo acompanha quando a chave do topo o troca.
const assinaTema = (avisa: () => void) => {
  const o = new MutationObserver(avisa);
  o.observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
  return () => o.disconnect();
};
const temaDoSite = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

function CaixaNativa({ex}: {ex: Exemplo}) {
  const tema = useSyncExternalStore(assinaTema, temaDoSite, () => "dark");
  return h(Moldura, {tema}, ex.render() as never);
}

montarSite();
for (const caixa of document.querySelectorAll<HTMLElement>("[data-vivo-nativo]")) {
  const [nome, indice] = (caixa.dataset.vivoNativo ?? "").split(":");
  const ex = exemplo(nome, Number(indice));
  if (!ex) continue;
  createRoot(caixa).render(h(CaixaNativa, {ex}));
}
