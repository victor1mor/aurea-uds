import {createElement as h} from "react";
import {IconButton, Tooltip, ButtonGroup} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default {
  description:
    "IconButton is a Button whose whole label is a glyph. The `label` prop is required and " +
    "becomes the accessible name — an icon carries no text, so without it the control is mute " +
    "to a screen reader. That requirement is the reason this component exists instead of a " +
    "Button you happen to fill with an Icon.",

  install: 'import {IconButton} from "@aurea-uds/react";',

  features: [
    "label is required, not optional: the API refuses to let you ship a nameless control.",
    "Square target — the width follows the same density token as the height, at every size.",
    "Softly squared, not pill: a round-ended square would read as a dot next to a text button.",
    "Every Button variant and state applies, including loading, href and pressed.",
    "Pair it with Tooltip when the glyph alone is not obvious; the tooltip repeats the label.",
  ],

  examples: [
    {
      title: "Variants",
      description: "Ghost by default so a row of them stays quiet; the loud ones are for a single action.",
      code: [
        '<IconButton icon="edit" label="Edit" />',
        '<IconButton icon="copy" label="Duplicate" variant="outline" />',
        '<IconButton icon="settings" label="Settings" variant="secondary" />',
        '<IconButton icon="trash-can" label="Delete" variant="danger-ghost" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(IconButton, {icon: "edit", label: "Edit"}),
        h(IconButton, {icon: "copy", label: "Duplicate", variant: "outline"}),
        h(IconButton, {icon: "settings", label: "Settings", variant: "secondary"}),
        h(IconButton, {icon: "trash-can", label: "Delete", variant: "danger-ghost"})),
    },
    {
      title: "Sizes",
      description: "Five square targets. The glyph keeps its own scale; the box grows with the density token.",
      code: [
        '<IconButton icon="add" label="Add" size="xs" />',
        '<IconButton icon="add" label="Add" size="sm" />',
        '<IconButton icon="add" label="Add" />',
        '<IconButton icon="add" label="Add" size="lg" />',
        '<IconButton icon="add" label="Add" size="xl" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(IconButton, {icon: "add", label: "Add extra small", size: "xs", variant: "secondary"}),
        h(IconButton, {icon: "add", label: "Add small", size: "sm", variant: "secondary"}),
        h(IconButton, {icon: "add", label: "Add medium", variant: "secondary"}),
        h(IconButton, {icon: "add", label: "Add large", size: "lg", variant: "secondary"}),
        h(IconButton, {icon: "add", label: "Add extra large", size: "xl", variant: "secondary"})),
    },
    {
      title: "With tooltip",
      description: "When the glyph is not self-evident, the tooltip says the same words as the label — never different ones. The preview shows the trigger: the balloon lives in a portal and only appears on hover, in a real app.",
      code: [
        '<Tooltip content="Duplicate">',
        '  <IconButton icon="copy" label="Duplicate" />',
        '</Tooltip>',
      ].join("\n"),
      // O balão não sai em HTML estático (portal + hover), mas o DISPARADOR sai — e é ele que a
      // página precisa mostrar. `render: null` deixava a caixa vazia, que é a mesma falha que o
      // Combobox e o FileInput tinham: preview ausente lido como "componente quebrado".
      render: () => h("div", {style: row},
        h(Tooltip, {content: "Duplicate"}, h(IconButton, {icon: "copy", label: "Duplicate"}))),
    },
    {
      title: "Toggle",
      description: "aria-pressed works here too: a pinned view, a muted channel, a starred row.",
      code: [
        '<IconButton icon="star" label="Star" pressed />',
        '<IconButton icon="pin" label="Pin" pressed={false} />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(IconButton, {icon: "star", label: "Star", pressed: true}),
        h(IconButton, {icon: "pin", label: "Pin", pressed: false})),
    },
    {
      title: "Loading and disabled",
      description: "Busy replaces the glyph with the spinner and sets aria-busy; disabled keeps the target in place.",
      code: [
        '<IconButton icon="save" label="Save" loading />',
        '<IconButton icon="save" label="Save" disabled />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(IconButton, {icon: "save", label: "Saving", loading: true, variant: "secondary"}),
        h(IconButton, {icon: "save", label: "Save", disabled: true, variant: "secondary"})),
    },
    {
      title: "Row of actions",
      description: "Grouped, they get one accessible name for the set — the classic end of a table row.",
      code: [
        '<ButtonGroup label="Row actions">',
        '  <IconButton icon="view" label="Open" />',
        '  <IconButton icon="edit" label="Edit" />',
        '  <IconButton icon="trash-can" label="Delete" variant="danger-ghost" />',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Row actions"},
        h(IconButton, {icon: "view", label: "Open"}),
        h(IconButton, {icon: "edit", label: "Edit"}),
        h(IconButton, {icon: "trash-can", label: "Delete", variant: "danger-ghost"})),
    },
  ],
};
