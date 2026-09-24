// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// Os quatro alinhamentos do adorno são LÓGICOS (`inline-*`/`block-*`), não físicos: em árabe ou
// hebraico o "start" vira a direita sozinho. O eixo em BLOCO entrou no `G-AXIS-01` — e a quebra
// de linha do grupo é CONDICIONAL (`:has()`), senão todo grupo que hoje transborda passaria a
// quebrar.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const largo = {width: "min(420px,100%)"};

export default [
  {
    variant: "Inline",
    name: "A unit that belongs to the value",
    description: "The suffix is not a label and not a hint: it is part of reading the number. Putting \"ms\" inside the group keeps it welded to the field at every width, where a paragraph beside it would wrap away on a phone.",
    uses: ["InputGroup", "InputGroupAddon", "Input"],
    code: `<InputGroup>
  <Input aria-label="Timeout" defaultValue="30000" inputMode="numeric" />
  <InputGroupAddon side="end" layout="inline">ms</InputGroupAddon>
</InputGroup>`,
    render: () => h("div", {style: largo}, h(A.InputGroup, null,
      h(A.Input, {"aria-label": "Timeout", defaultValue: "30000", inputMode: "numeric"}),
      h(A.InputGroupAddon, {side: "end", layout: "inline"}, "ms"))),
  },
  {
    variant: "Inline",
    name: "A prefix that cannot be typed away",
    description: "The scheme and host are fixed; only the path is the user's. Showing them as an addon instead of pre-filling the field means the reader can never delete them by holding backspace, and the value you read back is only ever the part you asked for.",
    uses: ["InputGroup", "InputGroupAddon", "Input"],
    code: `<InputGroup>
  <InputGroupAddon side="start" layout="inline">aureauds.dev/</InputGroupAddon>
  <Input aria-label="Path" defaultValue="components/button" />
</InputGroup>`,
    render: () => h("div", {style: largo}, h(A.InputGroup, null,
      h(A.InputGroupAddon, {side: "start", layout: "inline"}, "aureauds.dev/"),
      h(A.Input, {"aria-label": "Path", defaultValue: "components/button"}))),
  },
  {
    variant: "Inline",
    name: "Both ends at once",
    description: "A currency on one side and a unit on the other, with the field between them. Two addons is the ceiling: a third leaves less room for the value than for the frame around it.",
    uses: ["InputGroup", "InputGroupAddon", "Input"],
    code: `<InputGroup>
  <InputGroupAddon side="start" layout="inline">€</InputGroupAddon>
  <Input aria-label="Budget" defaultValue="1240.00" inputMode="decimal" />
  <InputGroupAddon side="end" layout="inline">/ month</InputGroupAddon>
</InputGroup>`,
    render: () => h("div", {style: largo}, h(A.InputGroup, null,
      h(A.InputGroupAddon, {side: "start", layout: "inline"}, "€"),
      h(A.Input, {"aria-label": "Budget", defaultValue: "1240.00", inputMode: "decimal"}),
      h(A.InputGroupAddon, {side: "end", layout: "inline"}, "/ month"))),
  },
  {
    variant: "Block",
    name: "A toolbar over the field",
    description: "`block-start` takes the whole line above the control, which is the only place a row of actions fits without stealing width from the value. This is the shape a composer wants: the field is the work, the bar is what you do to it.",
    uses: ["InputGroup", "InputGroupAddon", "Textarea", "IconButton"],
    code: `<InputGroup>
  <InputGroupAddon side="start" layout="block">
    <IconButton icon="text--bold" label="Bold" size="sm" />
    <IconButton icon="text--italic" label="Italic" size="sm" />
    <IconButton icon="link" label="Link" size="sm" />
  </InputGroupAddon>
  <Textarea aria-label="Notes" rows={3} defaultValue="" />
</InputGroup>`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(A.InputGroup, null,
      h(A.InputGroupAddon, {side: "start", layout: "block"},
        h(A.IconButton, {icon: "text--bold", label: "Bold", size: "sm"}),
        h(A.IconButton, {icon: "text--italic", label: "Italic", size: "sm"}),
        h(A.IconButton, {icon: "link", label: "Link", size: "sm"})),
      h(A.Textarea, {"aria-label": "Notes", rows: 3}))),
  },
  {
    variant: "Block",
    name: "A counter under the field",
    description: "`block-end` for what the reader consults while typing, not before. The count belongs to the control, so it travels with it — unlike a hint on the Field, which describes the input before anyone has touched it.",
    uses: ["InputGroup", "InputGroupAddon", "Textarea"],
    code: `<InputGroup>
  <Textarea aria-label="Summary" rows={3} value={text} onChange={e => setText(e.target.value)} />
  <InputGroupAddon side="end" layout="block">{text.length} / 280</InputGroupAddon>
</InputGroup>`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(A.InputGroup, null,
      h(A.Textarea, {"aria-label": "Summary", rows: 3,
        defaultValue: "A design system is the agreement, not the components."}),
      h(A.InputGroupAddon, {side: "end", layout: "block"}, "54 / 280"))),
  },
];
