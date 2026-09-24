// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// O shell é NÃO-MODAL de propósito: `open` e `query` são do consumidor, e não há contenção de
// foco. Declarar `aria-modal` sem conter o foco é pior que não declarar nenhum dos dois — quem
// quer paleta modal põe esta dentro de um Dialog. Está no starter e vale para todo pattern daqui.
//
// `.menu`/`.menu-item` como filhos: a lista de resultados ainda não é componente da Aurea (é o
// mesmo achado A8 do link de navegação lateral). O código mostra o que o consumidor escreve hoje.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

// A `.command-overlay` é `position:fixed; inset:0; z-index:var(--z-modal)`. Sem um bloco
// contentor ela resolve contra o VIEWPORT: a prévia cobria a página inteira, com scrim e blur, e
// como o HTML é estático não havia estado para fechá-la — a página do padrão ficava impossível de
// usar. `transform` cria o bloco contentor (é o que a CSS Transforms §3 manda) e o `fixed` passa a
// resolver contra esta caixa. `overflow:hidden` porque o overlay tem `padding-top:var(--space-16)`
// e sem teto ele empurraria a caixa. Nada muda no componente — o que se conserta é a MOLDURA.
//
// Isto JÁ ESTAVA RESOLVIDO no starter deste mesmo componente, a dois diretórios daqui, e o merge
// das duas linhagens juntou o padrão de um lado com a solução do outro sem elas se encontrarem.
// A varredura do catálogo pegou as três prévias em 29/08/2026.
const caixa = {width: "min(680px,100%)", position: "relative", height: "17rem",
  overflow: "hidden", transform: "translateZ(0)", borderRadius: "var(--radius-card)"};
const item = (rotulo, atalho) => h("button", {key: rotulo, className: "menu-item", type: "button"},
  h("span", null, rotulo), atalho ? h(A.Kbd, null, atalho) : null);

export default [
  {
    variant: "Open",
    name: "Every command on one keystroke",
    description: "The palette is the keyboard route to anything the application can do. The field takes focus on open and the list narrows as you type, so the whole interaction is one gesture — never a menu you have to find first.",
    uses: ["CommandPaletteShell", "Kbd"],
    code: `<CommandPaletteShell open={open} query={query} onQueryChange={setQuery}>
  <div className="menu">
    <button className="menu-item" type="button">Go to Button<Kbd>G B</Kbd></button>
    <button className="menu-item" type="button">Toggle theme<Kbd>T</Kbd></button>
    <button className="menu-item" type="button">Open settings<Kbd>,</Kbd></button>
  </div>
</CommandPaletteShell>`,
    render: () => h("div", {style: caixa}, h(A.CommandPaletteShell,
      {open: true, query: "", onQueryChange: () => {}},
      h("div", {className: "menu"},
        item("Go to Button", "G B"), item("Toggle theme", "T"), item("Open settings", ",")))),
  },
  {
    variant: "Filtered",
    name: "Results narrowed by what was typed",
    description: "Filtering is the consumer's job, not the shell's: it holds `query` and decides what matches. Keeping it outside is what lets the same palette search components, files or an API — the shell never assumes the shape of what it is searching.",
    uses: ["CommandPaletteShell", "Kbd"],
    code: `const shown = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

<CommandPaletteShell open={open} query={query} onQueryChange={setQuery}>
  <div className="menu">
    {shown.map(c => (
      <button key={c.id} className="menu-item" type="button" onClick={c.run}>{c.label}</button>
    ))}
  </div>
</CommandPaletteShell>`,
    render: () => h("div", {style: caixa}, h(A.CommandPaletteShell,
      {open: true, query: "theme", onQueryChange: () => {}},
      h("div", {className: "menu"}, item("Toggle theme", "T"), item("Theme: system")))),
  },
  {
    variant: "Empty",
    name: "Nothing matched",
    description: "The one state a palette must not skip. A list that simply vanishes reads as a broken palette; EmptyState says the search ran and found nothing, which is a different fact and the one the reader needs.",
    uses: ["CommandPaletteShell", "EmptyState"],
    code: `<CommandPaletteShell open={open} query={query} onQueryChange={setQuery}>
  {shown.length
    ? <div className="menu">{shown.map(renderCommand)}</div>
    : <EmptyState icon="search" title="No command matches" description="Try a shorter word." />}
</CommandPaletteShell>`,
    render: () => h("div", {style: caixa}, h(A.CommandPaletteShell,
      {open: true, query: "zzz", onQueryChange: () => {}},
      h(A.EmptyState, {titleAs: "p", icon: "search", title: "No command matches",
        description: "Try a shorter word."}))),
  },
];
