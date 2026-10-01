import {createElement as h} from "react";
import {IconButton, ButtonGroup, Card, Badge, Toolbar, ToolbarSeparator} from "../../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};
const between = {...row, justifyContent: "space-between", width: "min(420px,100%)"};

export default [
  {
    variant: "Ghost",
    name: "Row actions",
    description: "The trio at the end of a table row: open, edit, delete — quiet until the row matters.",
    uses: ["ButtonGroup", "IconButton"],
    code: [
      '<ButtonGroup label="Row actions">',
      '  <IconButton icon="eye" label="Open" />',
      '  <IconButton icon="pencil-simple" label="Edit" />',
      '  <IconButton icon="trash" label="Delete" variant="danger-ghost" />',
      '</ButtonGroup>',
    ].join("\n"),
    render: () => h(ButtonGroup, {label: "Row actions"},
      h(IconButton, {icon: "eye", label: "Open"}),
      h(IconButton, {icon: "pencil-simple", label: "Edit"}),
      h(IconButton, {icon: "trash", label: "Delete", variant: "danger-ghost"})),
  },
  {
    variant: "Ghost",
    name: "Card header action",
    description: "One glyph in the corner of a surface: the title keeps the space, the action keeps the reach.",
    uses: ["Card", "IconButton", "Badge"],
    code: [
      '<Card>',
      '  <div className="cluster" style={{justifyContent: "space-between"}}>',
      '    <strong>Webhooks <Badge>3</Badge></strong>',
      '    <IconButton icon="plus" label="New webhook" />',
      '  </div>',
      '</Card>',
    ].join("\n"),
    render: () => h("div", {style: {width: "min(420px,100%)"}},
      h(Card, null, h("div", {style: between},
        h("strong", null, "Webhooks ", h(Badge, null, "3")),
        h(IconButton, {icon: "plus", label: "New webhook"})))),
  },
  {
    variant: "Toggle",
    name: "Starred row",
    description: "State that survives the click: aria-pressed keeps it visible and audible.",
    uses: ["IconButton"],
    code: '<IconButton icon="star" label="Star this row" pressed />',
    render: () => h("div", {style: row},
      h(IconButton, {icon: "star", label: "Star this row", pressed: true}),
      h(IconButton, {icon: "star", label: "Star this row", pressed: false})),
  },
  {
    variant: "Outline",
    name: "Canvas controls",
    description: "Zoom and fit in a toolbar: one tab stop for the set, a name for each glyph.",
    uses: ["Toolbar", "IconButton", "ToolbarSeparator"],
    code: [
      '<Toolbar label="Canvas">',
      '  <IconButton icon="magnifying-glass-plus" label="Zoom in" variant="outline" />',
      '  <IconButton icon="magnifying-glass-minus" label="Zoom out" variant="outline" />',
      '  <ToolbarSeparator />',
      '  <IconButton icon="arrows-in-simple" label="Fit to screen" variant="outline" />',
      '</Toolbar>',
    ].join("\n"),
    render: () => h(Toolbar, {label: "Canvas"},
      h(IconButton, {icon: "magnifying-glass-plus", label: "Zoom in", variant: "outline"}),
      h(IconButton, {icon: "magnifying-glass-minus", label: "Zoom out", variant: "outline"}),
      h(ToolbarSeparator),
      h(IconButton, {icon: "arrows-in-simple", label: "Fit to screen", variant: "outline"})),
  },
  {
    variant: "Danger",
    name: "Dismiss a banner",
    description: "The close of a notice: destructive ghost, so removing is available without being the point.",
    uses: ["IconButton"],
    code: '<IconButton icon="x" label="Dismiss" variant="ghost" size="sm" />',
    render: () => h(IconButton, {icon: "x", label: "Dismiss", variant: "ghost", size: "sm"}),
  },
];
