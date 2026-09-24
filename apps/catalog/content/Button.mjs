// PADRÃO do arquivo de conteúdo do catálogo (molde de referência — 24/07/2026).
//
// Um arquivo por componente, em apps/catalog/content/<Name>.mjs. O registry dá os DADOS
// curtos (categoria, tokens, a11y, plataformas, props); ESTE arquivo dá o conteúdo RICO que
// o modelo Kibo pede: descrição longa, instalação, features e vários exemplos.
//
// Cada exemplo traz `code` (o que o consumidor escreveria — vai no painel Code) e `render`
// (o elemento de verdade — vai no painel Preview). Os dois andam juntos: o Preview é
// dogfooded (componente Aurea real), o Code é o texto que o gera. Mantê-los em sincronia
// é do autor (padrão shadcn/Kibo). Componente interativo: `render` pode ser null (só Code).
//
// Button é o EXEMPLAR (AUREA.md, regra do exemplar): o rigor daqui é o piso dos outros —
// API na ficha, um exemplo por recurso, nada prometido na Features que não tenha exemplo.
import {createElement as h} from "react";
import {Button} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};
const loose = {...row, gap: "var(--space-5)"};

export default {
  description:
    "Buttons trigger an action or navigate. Keep one primary button per view so the main " +
    "action is unmistakable; everything else recedes to secondary, outline, ghost or link.",

  install: 'import {Button} from "@aurea-uds/react";',

  features: [
    "Eleven variants over two axes — appearance (solid, outline, ghost, link) and tone (neutral, brand, destructive).",
    "Five sizes (xs / sm / md / lg / xl) from density tokens; the pill shape is invariant.",
    "type=\"button\" by default: a Cancel button inside a <form> never fires submit by accident.",
    "Loading shows a spinner and sets aria-busy; the label stays for context.",
    "With href it renders an anchor — same skin, link semantics. Disabled becomes aria-disabled.",
    "Stretch with fullWidth, announce a shortcut with kbd. For a button that STAYS on, the component is Toggle — `pressed` here is deprecated since 0.4.0 and goes away in 1.0.",
  ],

  examples: [
    {
      title: "Variants",
      description: "One primary action; the rest step back so hierarchy reads at a glance.",
      code: [
        '<Button variant="primary">Publish</Button>',
        '<Button variant="secondary">Save draft</Button>',
        '<Button variant="outline">Preview</Button>',
        '<Button variant="ghost">Cancel</Button>',
        '<Button variant="danger">Delete</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "primary"}, "Publish"),
        h(Button, {variant: "secondary"}, "Save draft"),
        h(Button, {variant: "outline"}, "Preview"),
        h(Button, {variant: "ghost"}, "Cancel"),
        h(Button, {variant: "danger"}, "Delete")),
    },
    {
      title: "Sizes",
      description: "Five heights from density tokens. On a coarse pointer every size floors at 44px, so xs never becomes an impossible target.",
      code: [
        '<Button size="xs">Extra small</Button>',
        '<Button size="sm">Small</Button>',
        '<Button>Medium</Button>',
        '<Button size="lg">Large</Button>',
        '<Button size="xl">Extra large</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {size: "xs"}, "Extra small"),
        h(Button, {size: "sm"}, "Small"),
        h(Button, null, "Medium"),
        h(Button, {size: "lg"}, "Large"),
        h(Button, {size: "xl"}, "Extra large")),
    },
    {
      title: "Destructive hierarchy",
      description: "Deleting is not always the loudest action on the screen. Same tone, three weights.",
      code: [
        '<Button variant="danger">Delete</Button>',
        '<Button variant="danger-outline">Delete</Button>',
        '<Button variant="danger-ghost">Delete</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "danger"}, "Delete"),
        h(Button, {variant: "danger-outline"}, "Delete"),
        h(Button, {variant: "danger-ghost"}, "Delete")),
    },
    {
      title: "Link appearance",
      description: "Text with no capsule, for inline actions. The underline is there at rest — revealing it on hover would hide the affordance.",
      code: [
        '<Button variant="link">Learn more</Button>',
        '<Button variant="link-primary">Upgrade plan</Button>',
        '<Button variant="link-danger">Delete account</Button>',
      ].join("\n"),
      render: () => h("div", {style: loose},
        h(Button, {variant: "link"}, "Learn more"),
        h(Button, {variant: "link-primary"}, "Upgrade plan"),
        h(Button, {variant: "link-danger"}, "Delete account")),
    },
    {
      title: "Loading",
      description: "Busy and blocked, with the label kept: aria-busy is set and the spinner replaces nothing.",
      code: '<Button variant="primary" loading>Publishing…</Button>',
      render: () => h(Button, {variant: "primary", loading: true}, "Publishing…"),
    },
    {
      title: "Disabled",
      description: "Unavailable, not hidden — the reason has to be reachable somewhere on the screen.",
      code: [
        '<Button variant="primary" disabled>Publish</Button>',
        '<Button disabled>Save draft</Button>',
        '<Button variant="outline" disabled>Preview</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "primary", disabled: true}, "Publish"),
        h(Button, {disabled: true}, "Save draft"),
        h(Button, {variant: "outline", disabled: true}, "Preview")),
    },
    {
      title: "With icons",
      description: "Carbon glyphs on either side. The icon never replaces the label — it repeats it.",
      code: [
        '<Button leadingIcon="add">New item</Button>',
        '<Button variant="outline" trailingIcon="chevron--down">Sort by</Button>',
        '<Button variant="danger" leadingIcon="trash-can">Delete</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {leadingIcon: "add"}, "New item"),
        h(Button, {variant: "outline", trailingIcon: "chevron--down"}, "Sort by"),
        h(Button, {variant: "danger", leadingIcon: "trash-can"}, "Delete")),
    },
    {
      title: "With shortcut",
      description: "The key that fires it, shown and announced: kbd renders a Kbd inside the button and sets aria-keyshortcuts.",
      code: [
        '<Button variant="primary" kbd="⌘K">Command</Button>',
        '<Button variant="outline" kbd="/">Search</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "primary", kbd: "⌘K"}, "Command"),
        h(Button, {variant: "outline", kbd: "/"}, "Search")),
    },
    {
      title: "As a link",
      description: "With href it renders an anchor wearing the same skin: a button that navigates is a link, and the reader announces it as one.",
      code: '<Button variant="outline" href="/docs" trailingIcon="arrow--right">Read the docs</Button>',
      render: () => h(Button, {variant: "outline", href: "./index.html", trailingIcon: "chevron--down"}, "Read the docs"),
    },
    {
      title: "Full width",
      description: "Stretched to the container for a form footer or a narrow screen — only the width changes.",
      code: '<Button variant="primary" fullWidth>Continue</Button>',
      render: () => h("div", {style: {width: "min(320px,100%)"}},
        h(Button, {variant: "primary", fullWidth: true}, "Continue")),
    },
  ],
};
