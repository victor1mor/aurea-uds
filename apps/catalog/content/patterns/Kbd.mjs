// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// Kbd é <kbd>: a TECLA, não o comando. Ele desenha o atalho e não o LIGA — quem quer o atalho
// anunciado usa `kbd` no próprio Button, que emite `aria-keyshortcuts` junto. Kbd solto é
// enfeite tipográfico de propósito, e é assim que ele serve documentação e menu ao mesmo tempo.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default [
  {
    variant: "Default",
    name: "A shortcut inside a sentence",
    description: "Prose is where the keyboard is taught. Marking the keys instead of quoting them means a screen reader announces them as keys, and the reader can tell `Esc` the key from \"esc\" the word.",
    uses: ["Kbd"],
    code: `<p>Press <Kbd>Esc</Kbd> to close, or <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search.</p>`,
    render: () => h("p", null, "Press ", h(A.Kbd, null, "Esc"), " to close, or ",
      h(A.Kbd, null, "⌘"), " ", h(A.Kbd, null, "K"), " to search."),
  },
  {
    variant: "Default",
    name: "One key per element in a chord",
    description: "`⌘ ⇧ P` is three elements, not one string. Split like this the keys line up with the physical keys the reader is looking for, and a chord never renders as a single wide pill that reads like one impossible key.",
    uses: ["Kbd"],
    code: `<span className="cluster">
  <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd>
</span>`,
    render: () => h("span", {style: linha},
      h(A.Kbd, null, "⌘"), h(A.Kbd, null, "⇧"), h(A.Kbd, null, "P")),
  },
  {
    variant: "Default",
    name: "The shortcut column of a menu",
    description: "A menu that lists its shortcuts teaches the keyboard without a separate page. The keys sit at the end of the row so the labels stay left-aligned and scannable — the shortcut is the second read, never the first.",
    uses: ["Card", "Kbd"],
    code: `<div className="menu">
  <button className="menu-item" type="button">New run<Kbd>N</Kbd></button>
  <button className="menu-item" type="button">Search<Kbd>/</Kbd></button>
</div>`,
    render: () => h("div", {style: {width: "min(320px,100%)"}},
      h("div", {className: "menu"},
        h("button", {className: "menu-item", type: "button"},
          h("span", null, "New run"), h(A.Kbd, null, "N")),
        h("button", {className: "menu-item", type: "button"},
          h("span", null, "Search"), h(A.Kbd, null, "/")))),
  },
  {
    variant: "Default",
    name: "On the button that performs it",
    description: "The one case where the keys must NOT be a bare Kbd: `kbd` on the Button both draws the shortcut and emits `aria-keyshortcuts`, so the shortcut is announced and not only seen. A Kbd dropped inside a button would be the decoration without the promise.",
    uses: ["Button"],
    code: `<Button variant="primary" kbd="⌘ Enter">Send</Button>`,
    render: () => h(A.Button, {variant: "primary", kbd: "⌘ Enter"}, "Send"),
  },
];
