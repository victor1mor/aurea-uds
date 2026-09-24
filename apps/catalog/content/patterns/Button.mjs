// PADRÃO do arquivo de PATTERN (molde de referência — 24/07/2026).
//
// Pattern ≠ componente. O componente é a peça com API; o pattern é UMA composição
// resolvida dela: Componente → Variante → Composição (modelo Kibo, vocabulário travado
// no AUREA.md §4). Quem consome um pattern copia e cola; quem consome um componente
// configura.
//
// Um arquivo por componente, em apps/catalog/content/patterns/<Componente>.mjs.
// Cada entrada gera UMA página, com o mesmo modelo de página dos componentes.
//   variant     — a variante do componente que o pattern usa (2º nível do breadcrumb)
//   name        — o nome da composição (3º nível, e título da página)
//   description — uma frase: o que resolve e quando usar
//   uses        — componentes Aurea reais que aparecem (viram chips com link)
//   code        — o que o consumidor escreve
//   render      — o elemento de verdade (Preview dogfooded)
import {createElement as h} from "react";
import {Avatar, Button, ButtonGroup, Checkbox, IconButton, Badge, Kbd, Switch} from "../../../../packages/react/dist/index.js";

// A moldura das provas de eixo responsivo: contêineres de largura FIXA, lado a lado, na mesma
// viewport. É o que separa os dois mecanismos aos olhos — se as três colunas medissem igual,
// o que existiria seria uma media query com outro nome.
const caixa = (w) => ({inlineSize: w, border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)",
  padding: "var(--space-3)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"});
const trio = (conteudo) => h("div", {style: {display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "var(--space-4)"}},
  ...[260, 520, 820].map((w) => h("div", {key: w, className: "container-scope", style: caixa(w)}, conteudo(w))));

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default [
  {
    variant: "Primary",
    name: "With leading icon",
    description: "The main action of a screen, with the glyph repeating the verb — never replacing it.",
    uses: ["Button", "Icon"],
    code: '<Button variant="primary" leadingIcon="add">New invoice</Button>',
    render: () => h(Button, {variant: "primary", leadingIcon: "add"}, "New invoice"),
  },
  {
    variant: "Primary",
    name: "Submitting",
    description: "Busy state for a form submit: spinner, aria-busy and the label kept for context.",
    uses: ["Button"],
    code: '<Button variant="primary" loading>Saving…</Button>',
    render: () => h(Button, {variant: "primary", loading: true}, "Saving…"),
  },
  {
    variant: "Primary",
    name: "Confirm and cancel",
    description: "The pair that closes a dialog: one primary, one ghost. Cancel is never a button of equal weight.",
    uses: ["Button"],
    code: '<div className="cluster">\n  <Button variant="ghost">Cancel</Button>\n  <Button variant="primary">Confirm</Button>\n</div>',
    render: () => h("div", {style: row}, h(Button, {variant: "ghost"}, "Cancel"), h(Button, {variant: "primary"}, "Confirm")),
  },
  {
    variant: "Outline",
    name: "With text",
    description: "Secondary action that still needs an edge — a neutral choice next to a primary one.",
    uses: ["Button"],
    code: '<Button variant="outline">Preview</Button>',
    render: () => h(Button, {variant: "outline"}, "Preview"),
  },
  {
    variant: "Outline",
    name: "With trailing chevron",
    description: "Opens a menu or a list. The chevron announces that something unfolds.",
    uses: ["Button", "Icon"],
    code: '<Button variant="outline" trailingIcon="chevron--down">Sort by</Button>',
    render: () => h(Button, {variant: "outline", trailingIcon: "chevron--down"}, "Sort by"),
  },
  {
    variant: "Danger",
    name: "Destructive with icon",
    description: "Irreversible action. The red plus the glyph make the consequence readable before the click.",
    uses: ["Button", "Icon"],
    code: '<Button variant="danger" leadingIcon="trash-can">Delete account</Button>',
    render: () => h(Button, {variant: "danger", leadingIcon: "trash-can"}, "Delete account"),
  },
  {
    variant: "Ghost",
    name: "Toolbar trio",
    description: "Three low-emphasis actions side by side, where the surface below must keep reading.",
    uses: ["Button"],
    code: '<Button variant="ghost">Copy</Button>\n<Button variant="ghost">Duplicate</Button>\n<Button variant="ghost">Archive</Button>',
    render: () => h("div", {style: row}, h(Button, {variant: "ghost"}, "Copy"),
      h(Button, {variant: "ghost"}, "Duplicate"), h(Button, {variant: "ghost"}, "Archive")),
  },
  {
    variant: "Ghost",
    name: "Icon only",
    description: "Square target with an accessible name — an icon without a label needs one.",
    uses: ["IconButton", "Icon"],
    code: '<IconButton icon="edit" label="Edit" />',
    render: () => h(IconButton, {icon: "edit", label: "Edit"}),
  },
  {
    variant: "Group",
    name: "Segmented range",
    description: "Coordinated set of the same control. Each button stays tabbable — that is what separates it from a Toolbar.",
    uses: ["ButtonGroup", "Button"],
    code: '<ButtonGroup label="Range">\n  <Button>Day</Button>\n  <Button>Week</Button>\n  <Button>Month</Button>\n</ButtonGroup>',
    render: () => h(ButtonGroup, {label: "Range"}, h(Button, null, "Day"), h(Button, null, "Week"), h(Button, null, "Month")),
  },
  {
    variant: "Primary",
    name: "With Kbd",
    description: "The action and the key that fires it, together — shown and announced by aria-keyshortcuts.",
    uses: ["Button", "Kbd"],
    code: '<Button variant="primary" kbd="⌘K">Command</Button>',
    render: () => h(Button, {variant: "primary", kbd: "⌘K"}, "Command"),
  },
  {
    variant: "Danger",
    name: "Destructive with Kbd",
    description: "Irreversible plus a shortcut: the key is spelled out so nobody discovers it by accident.",
    uses: ["Button", "Kbd"],
    code: '<Button variant="danger-outline" kbd="⌘⌫">Delete</Button>',
    render: () => h(Button, {variant: "danger-outline", kbd: "⌘⌫"}, "Delete"),
  },
  {
    variant: "Link",
    name: "Inline action",
    description: "Inside a sentence, where a capsule would break the line: text, underlined at rest.",
    uses: ["Button"],
    code: '<p>Storage is nearly full. <Button variant="link-primary">Upgrade plan</Button></p>',
    render: () => h("p", {style: {margin: 0, maxWidth: "42ch"}}, "Storage is nearly full. ",
      h(Button, {variant: "link-primary"}, "Upgrade plan")),
  },
  {
    variant: "Toggle",
    name: "Pinned filter",
    description: "A filter that stays on: aria-pressed keeps the state visible and audible after the click.",
    uses: ["Button"],
    code: ['<Button pressed leadingIcon="star">Starred</Button>',
      '<Button pressed={false}>Archived</Button>'].join("\n"),
    render: () => h("div", {style: row},
      h(Button, {pressed: true, leadingIcon: "star"}, "Starred"),
      h(Button, {pressed: false}, "Archived")),
  },
  {
    variant: "Primary",
    name: "Full width on a narrow screen",
    description: "Form footer on a phone: the action takes the whole width so the thumb cannot miss it.",
    uses: ["Button"],
    code: '<Button variant="primary" size="lg" fullWidth>Continue</Button>',
    render: () => h("div", {style: {width: "min(300px,100%)"}},
      h(Button, {variant: "primary", size: "lg", fullWidth: true}, "Continue")),
  },
  {
    variant: "Group",
    name: "With counter",
    description: "Action carrying a live number: the Badge rides inside the label, not beside it.",
    uses: ["Button", "Badge"],
    code: '<Button variant="secondary">Inbox <Badge variant="primary">12</Badge></Button>',
    render: () => h(Button, {variant: "secondary"}, "Inbox ", h(Badge, {variant: "primary"}, "12")),
  },
  // ── TOM: o segundo eixo (G-API-01) ─────────────────────────────────────
  // Até 21/08/2026 a `variant` era APARÊNCIA e TOM achatados num nome só, e o achatamento
  // aparecia na ordem das palavras: `danger-outline` com o tom na frente, `link-danger` com o
  // tom atrás. Os treze nomes continuam valendo — o que muda é que agora há dois eixos, e um
  // tom novo custa uma regra, não quatro nomes.
  {
    variant: "Tone",
    name: "The two axes",
    description: "Appearance is how much weight the box has; tone is what the colour means. The old names are shortcuts for pairs — variant=\"danger-outline\" and appearance/tone below render the same button.",
    uses: ["Button"],
    code: '<Button appearance="outline" tone="danger">Delete</Button>\n<Button variant="danger-outline">Delete</Button>  {/* o mesmo */}',
    render: () => h("div", {style: row},
      h(Button, {appearance: "outline", tone: "danger"}, "Delete"),
      h(Button, {variant: "danger-outline"}, "Delete")),
  },
  {
    variant: "Tone",
    name: "Confirming a safe outcome",
    description: "Success tone for an action that lands somewhere good — publishing, approving, marking done. Filled, because tone and weight are independent: choosing green does not force the button to be quieter.",
    uses: ["Button"],
    code: '<Button appearance="solid" tone="success" leadingIcon="checkmark">Approve</Button>',
    render: () => h(Button, {appearance: "solid", tone: "success", leadingIcon: "checkmark"}, "Approve"),
  },
  {
    variant: "Tone",
    name: "Warning is not the brand",
    description: "Amber, not the Aurea yellow. Until August 2026 the warning token resolved to the brand colour in dark theme — same pixels, two different meanings — so warning was not a tone at all. It has its own identity now, picked by measuring perceptual distance from both neighbours: the brand on one side, the destructive red on the other.",
    uses: ["Button"],
    code: '<Button appearance="solid" tone="warning" leadingIcon="warning">Revoke access</Button>\n<Button variant="primary">Publish</Button>  {/* a marca, ao lado */}',
    render: () => h("div", {style: row},
      h(Button, {appearance: "solid", tone: "warning", leadingIcon: "warning"}, "Revoke access"),
      h(Button, {variant: "primary"}, "Publish")),
  },
  {
    variant: "Tone",
    name: "Informational action in running text",
    description: "Info tone on the link appearance: a pointer to context that is neither a warning nor a commitment.",
    uses: ["Button"],
    code: '<Button appearance="link" tone="info">Why is this blocked?</Button>',
    render: () => h(Button, {appearance: "link", tone: "info"}, "Why is this blocked?"),
  },
  {
    variant: "Tone",
    name: "The same tone across appearances",
    description: "One tone, four weights — and every cell exists. A tone never loses its filled form: each one owns a colour and the text colour that goes on top of it, chosen per theme and verified for AA contrast, exactly as the destructive tone always had.",
    uses: ["Button"],
    code: '<Button appearance="solid" tone="success">Approve</Button>\n<Button appearance="outline" tone="success">Approve</Button>\n<Button appearance="ghost" tone="success">Approve</Button>\n<Button appearance="link" tone="success">Approve</Button>',
    render: () => h("div", {style: row},
      h(Button, {appearance: "solid", tone: "success"}, "Approve"),
      h(Button, {appearance: "outline", tone: "success"}, "Approve"),
      h(Button, {appearance: "ghost", tone: "success"}, "Approve"),
      h(Button, {appearance: "link", tone: "success"}, "Approve")),
  },
  {
    variant: "Group",
    name: "Stacked actions",
    description: "A vertical group for a menu of actions on a card or in a side panel. The buttons all measure the same width — without that the column comes out ragged, which is the one defect a vertical group cannot have. It stays role=\"group\" and announces no orientation: it does not navigate by arrow, and promising keyboard that does not exist is worse than staying quiet.",
    uses: ["ButtonGroup", "Button"],
    code: '<ButtonGroup orientation="vertical" label="Item actions">\n  <Button variant="outline">Duplicate</Button>\n  <Button variant="outline">Archive item</Button>\n  <Button variant="danger-outline">Delete</Button>\n</ButtonGroup>',
    render: () => h(ButtonGroup, {orientation: "vertical", label: "Item actions"},
      h(Button, {variant: "outline"}, "Duplicate"),
      h(Button, {variant: "outline"}, "Archive item"),
      h(Button, {variant: "danger-outline"}, "Delete")),
  },
  {
    variant: "Responsive",
    name: "The same button in three container widths",
    description: "One button, one value, one viewport \u2014 three container widths. The step comes from the space the component was placed in, not from the size of the window, so a sidebar and a main column can show the same component at different steps at the same time. This is the proof that separates the two mechanisms: if the three measured the same, what existed would be a media query under another name. The parent needs `container-scope`, which names the container \u2014 an unnamed one matches the nearest ancestor that happens to be a container, including one somebody else declared for another reason.",
    uses: ["Button"],
    code: '<div className="container-scope">\n  <Button size={{base: "xs", container: {xs: "sm", sm: "md", md: "lg"}}}>\n    Publish\n  </Button>\n</div>',
    render: () => trio((w) => h(Button, {size: {base: "xs", container: {xs: "sm", sm: "md", md: "lg"}}}, `${w}px`)),
  },
  {
    variant: "Responsive",
    name: "Reacting to the window instead",
    description: "The other mechanism, for when the decision really does belong to the application and not to the slot: the step follows the viewport. Same axis, same scale, and the prefix in the emitted class says which of the two is measuring \u2014 `md` is always 768px, and never means two things depending on where you read it. Resize the window to see it move; the example above will not move, because its containers have fixed widths.",
    uses: ["Button"],
    code: '<Button size={{base: "xs", viewport: {sm: "md", lg: "xl"}}}>Publish</Button>',
    render: () => h("div", {style: row}, h(Button, {size: {base: "xs", viewport: {sm: "md", lg: "xl"}}}, "Publish")),
  },
  {
    variant: "Responsive",
    name: "Every family follows its own scale",
    description: "The same three containers, now with one piece from each family. Control, mark and avatar come from the control height and step together; the icon inside the button comes from the glyph scale and does NOT follow the button \u2014 a large button with a huge glyph is not a larger button, it is a different drawing. The two behaviours in one picture are the point: sharing a step is measured, never assumed.",
    uses: ["Button", "Checkbox", "Switch", "Avatar"],
    code: '<div className="container-scope">\n  <Button leadingIcon="add" size={{base: "xs", container: {xs: "sm", sm: "md", md: "lg"}}}>Add</Button>\n  <Checkbox label="Include drafts" size={{base: "sm", container: {sm: "md", md: "lg"}}} />\n  <Switch label="Live" size={{base: "sm", container: {sm: "md", md: "lg"}}} />\n  <Avatar fallback="AB" size={{base: "sm", container: {sm: "md", md: "lg"}}} />\n</div>',
    render: () => trio(() => h("div", {style: row},
      h(Button, {leadingIcon: "add", size: {base: "xs", container: {xs: "sm", sm: "md", md: "lg"}}}, "Add"),
      h(Checkbox, {label: "Include drafts", size: {base: "sm", container: {sm: "md", md: "lg"}}}),
      h(Switch, {label: "Live", size: {base: "sm", container: {sm: "md", md: "lg"}}}),
      h(Avatar, {fallback: "AB", size: {base: "sm", container: {sm: "md", md: "lg"}}}))),
  },
];
