// A SETINHA DO "COPY MARKDOWN" (lote U, SITE-06, 18/10/2026) — a da documentação da referência, lida no código do site
// dela: um menu com "View as Markdown" e os assistentes que abrem a página. Decisão do Victor: sem os dois itens que
// instalam o servidor MCP ("Sem os do MCP"); eles entram quando ele existir. A frase que vai ao assistente é a dela.
//
// Só peças da Aurea: o `DropdownMenu`, com itens que são LINKS de verdade (`kind: "link"`), e o `IconButton` como
// gatilho. O gerador deixa a setinha parada dentro do `ButtonGroup` (`data-page-menu`); aqui ela sai, e o menu vivo entra
// no mesmo grupo, por último — a pele do grupo só une `.btn` filho direto, então nada de caixa em volta.
import {createPortal} from "react-dom";
import {createElement as h} from "react";
import {DropdownMenu, IconButton} from "../../../packages/react/dist/index.js";

const parada = document.querySelector<HTMLElement>("[data-page-menu]");
const grupo = parada?.parentElement ?? null;
parada?.remove();

function Menu() {
  // O `.md` da página fica ao lado dela, com o mesmo nome (o gerador escreve os dois).
  const md = location.href.split(/[?#]/)[0].replace(/\.html$/, ".md");
  const pergunta = `Read ${md}, I want to ask questions about it.`;
  return h(DropdownMenu, {
    label: "Page actions",
    trigger: h(IconButton, {variant: "tertiary", size: "sm", icon: "caret-down", label: "More page actions"}),
    items: [
      {kind: "link", label: "View as Markdown", leadingIcon: "file-text", href: md, target: "_blank", rel: "noreferrer"},
      {kind: "link", label: "Open in ChatGPT", leadingIcon: "chat-circle", target: "_blank", rel: "noreferrer",
        href: `https://chatgpt.com/?${new URLSearchParams({hints: "search", q: pergunta})}`},
      {kind: "link", label: "Open in Claude", leadingIcon: "chat-circle", target: "_blank", rel: "noreferrer",
        href: `https://claude.ai/new?${new URLSearchParams({q: pergunta})}`},
    ],
  });
}

/** O menu da página, no grupo do "Copy Markdown". Sem o grupo (página sem ações), nada. */
export function AcoesDaPagina() {
  return grupo ? createPortal(h(Menu), grupo) : null;
}
