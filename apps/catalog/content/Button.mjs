// PADRÃO do arquivo de conteúdo do catálogo (molde de referência — 24/07/2026).
//
// Um arquivo por componente, em apps/catalog/content/<Name>.mjs. O registry dá os DADOS
// curtos (categoria, tokens, a11y, plataformas, props); ESTE arquivo dá o conteúdo RICO que
// o modelo de referência pede: descrição longa, instalação, features e vários exemplos.
//
// Cada exemplo traz `code` (o que o consumidor escreveria — vai no painel Code) e `render`
// (o elemento de verdade — vai no painel Preview). Os dois andam juntos: o Preview é
// dogfooded (componente Aurea real), o Code é o texto que o gera. Mantê-los em sincronia
// é do autor (padrão das referências). Componente interativo: `render` pode ser null (só Code).
//
// Button é o EXEMPLAR (AUREA.md, regra do exemplar): o rigor daqui é o piso dos outros —
// API na ficha, um exemplo por recurso, nada prometido na Features que não tenha exemplo.
import {createElement as h} from "react";
import {Button, IconButton} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};
const loose = {...row, gap: "var(--space-5)"};

export default {
  description:
    "Buttons trigger an action or navigate. Keep one primary button per view so the main " +
    "action is unmistakable; everything else recedes to secondary, outline, ghost or link.",

  install: 'import {Button} from "@aurea-uds/react";',

  features: [
    "Variants over two axes — appearance (solid, outline, ghost, link) and tone (neutral, brand, destructive) — plus secondary, the neutral fill with the brand-coloured label.",
    "Five sizes (xs / sm / md / lg / xl) from density tokens; the pill shape is invariant.",
    "type=\"button\" by default: a Cancel button inside a <form> never fires submit by accident.",
    "Loading shows a spinner and sets aria-busy; the label stays for context.",
    "With href it renders an anchor — same skin, link semantics. Disabled becomes aria-disabled.",
    "share opens the device's share sheet when the browser has one; otherwise it copies the link and says \"Link copied\" under the button, at the button's own size, and to the screen reader.",
    "Stretch with fullWidth, announce a shortcut with kbd. For a button that STAYS on, the component is Toggle — `pressed` here is deprecated since 0.4.0 and goes away in 1.0.",
  ],

  examples: [
    {
      title: "Variants",
      description: "One primary action; the rest step back so hierarchy reads at a glance. Save is primary, edit is secondary, cancel is tertiary — the tertiary is also what a Button with no variant draws.",
      code: [
        '<Button variant="primary">Publish</Button>',
        '<Button variant="secondary">Edit</Button>',
        '<Button variant="tertiary">Cancel</Button>',
        '<Button variant="outline">Preview</Button>',
        '<Button variant="ghost">Skip</Button>',
        '<Button variant="danger">Delete</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "primary"}, "Publish"),
        h(Button, {variant: "secondary"}, "Edit"),
        h(Button, {variant: "tertiary"}, "Cancel"),
        h(Button, {variant: "outline"}, "Preview"),
        h(Button, {variant: "ghost"}, "Skip"),
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
      title: "Soft",
      description: "The pale fill of the tone with the tone's letter — the reference's soft button. danger-soft is the "
        + "shortcut for the destructive one that should not shout.",
      code: [
        '<Button appearance="soft" tone="brand">Upgrade</Button>',
        '<Button appearance="soft" tone="success">Approve</Button>',
        '<Button variant="danger-soft">Remove</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {appearance: "soft", tone: "brand"}, "Upgrade"),
        h(Button, {appearance: "soft", tone: "success"}, "Approve"),
        h(Button, {variant: "danger-soft"}, "Remove")),
    },
    {
      title: "Quiet",
      description: "The muted letter, one step smaller: a secondary control that sits beside the main ones without "
        + "competing, like the Theme button at the top of this site.",
      code: '<Button size="sm" quiet leadingIcon="paint-bucket">Theme</Button>',
      render: () => h("div", {style: row}, h(Button, {size: "sm", quiet: true, leadingIcon: "paint-bucket"}, "Theme")),
    },
    {
      title: "Finishes",
      description: "Two finishes the app chooses — nothing changes unless asked. glow puts a soft glow in the button's own "
        + "colour under the primary button; ring draws the tone at 30% around a soft-filled button (soft and outline). "
        + "Focus is still the ring of every button.",
      code: [
        '<Button variant="primary" glow>Get started</Button>',
        '<Button appearance="soft" tone="brand" ring>Upgrade</Button>',
        '<Button appearance="soft" tone="success" ring>Approve</Button>',
        '<Button variant="danger-outline" ring>Remove</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "primary", glow: true}, "Get started"),
        h(Button, {appearance: "soft", tone: "brand", ring: true}, "Upgrade"),
        h(Button, {appearance: "soft", tone: "success", ring: true}, "Approve"),
        h(Button, {variant: "danger-outline", ring: true}, "Remove")),
    },
    {
      title: "Finishes for a whole area",
      description: "The same attributes on a container — or on <html> — turn a finish on for every button inside; "
        + "the button with its own prop wins, so glow={false} or ring={false} takes one out.",
      code: [
        '<div data-glow="true" data-ring="true">',
        '  <Button variant="primary">Save</Button>',
        '  <Button appearance="soft" tone="brand">With ring</Button>',
        '  <Button appearance="soft" tone="brand" ring={false}>Without ring</Button>',
        '  <Button variant="primary" glow={false}>Without glow</Button>',
        '</div>',
      ].join("\n"),
      render: () => h("div", {style: row, "data-glow": "true", "data-ring": "true"},
        h(Button, {variant: "primary"}, "Save"),
        h(Button, {appearance: "soft", tone: "brand"}, "With ring"),
        h(Button, {appearance: "soft", tone: "brand", ring: false}, "Without ring"),
        h(Button, {variant: "primary", glow: false}, "Without glow")),
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
      description: "Glyphs on either side. The icon never replaces the label — it repeats it.",
      code: [
        '<Button leadingIcon="plus">New item</Button>',
        '<Button variant="outline" trailingIcon="caret-down">Sort by</Button>',
        '<Button variant="danger" leadingIcon="trash">Delete</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {leadingIcon: "plus"}, "New item"),
        h(Button, {variant: "outline", trailingIcon: "caret-down"}, "Sort by"),
        h(Button, {variant: "danger", leadingIcon: "trash"}, "Delete")),
    },
    {
      title: "With shortcut",
      description: "The key that fires it, shown and announced: kbd renders a Kbd inside the button and sets "
        + "aria-keyshortcuts. Pass a list for a combination: one cap per key, and the reader hears Control+K.",
      code: [
        '<Button variant="primary" kbd="⌘K">Command</Button>',
        '<Button variant="outline" kbd="/">Search</Button>',
        '<Button leadingIcon="magnifying-glass" kbd={["Ctrl", "K"]}>Search</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "primary", kbd: "⌘K"}, "Command"),
        h(Button, {variant: "outline", kbd: "/"}, "Search"),
        h(Button, {leadingIcon: "magnifying-glass", kbd: ["Ctrl", "K"]}, "Search")),
    },
    {
      title: "As a link",
      description: "With href it renders an anchor wearing the same skin: a button that navigates is a link, and the reader announces it as one.",
      code: '<Button variant="outline" href="/docs" trailingIcon="arrow-right">Read the docs</Button>',
      render: () => h(Button, {variant: "outline", href: "./index.html", trailingIcon: "caret-down"}, "Read the docs"),
    },
    {
      title: "Share",
      description: "share asks the browser whether it can share this link — feature detection, not device guessing. "
        + "On a phone (and in Chrome, Edge or Safari on a computer) the device's share sheet opens, and closing it is not an error. "
        + "Where the browser cannot share, the link is copied and \"Link copied\" appears under the button, at the button's own size. "
        + "If copying fails, the link is shown selected for Ctrl+C.",
      code: [
        '<Button share={{url: "https://example.com/report", title: "Weekly report"}} leadingIcon="share-network">Share</Button>',
        '<IconButton icon="share-network" label="Share link" variant="secondary" share={{url: "https://example.com/report"}} />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {share: {url: "https://example.com/report", title: "Weekly report"}, leadingIcon: "share-network"}, "Share"),
        h(IconButton, {icon: "share-network", label: "Share link", variant: "secondary", share: {url: "https://example.com/report"}})),
    },
    {
      title: "Full width",
      description: "Stretched to the container for a form footer or a narrow screen — only the width changes.",
      code: '<Button variant="primary" fullWidth>Continue</Button>',
      render: () => h("div", {style: {width: "min(320px,100%)"}},
        h(Button, {variant: "primary", fullWidth: true}, "Continue")),
    },
    {
      title: "Brand hierarchy",
      description: "The brand tone in three weights, like the destructive one: the fill for the main action, the "
        + "outline and the ghost for brand actions that should not compete with it.",
      code: [
        '<Button variant="primary">Upgrade</Button>',
        '<Button variant="primary-outline">Compare plans</Button>',
        '<Button variant="primary-ghost">See pricing</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "primary"}, "Upgrade"),
        h(Button, {variant: "primary-outline"}, "Compare plans"),
        h(Button, {variant: "primary-ghost"}, "See pricing")),
    },
    {
      title: "Navigation item",
      description: "nav is an appearance of its own, not a tone: a navigation item, muted at rest. variant=\"nav\" "
        + "is the shortcut for appearance=\"nav\" with the neutral tone, so the two below draw the same.",
      code: [
        '<Button variant="nav">Overview</Button>',
        '<Button appearance="nav">Reports</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Button, {variant: "nav"}, "Overview"),
        h(Button, {appearance: "nav"}, "Reports")),
    },
  ],
};
