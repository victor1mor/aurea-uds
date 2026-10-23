import {createElement as h} from "react";
import {Toolbar, ToolbarButton, ToolbarSeparator} from "../../../packages/react/dist/index.js";

export default {
  description:
    "ToolbarButton is the Button that belongs to a Toolbar. Same API, same skin — what changes is " +
    "that it joins the roving tabindex of the bar instead of owning a tab stop of its own. Outside " +
    "a Toolbar it has nothing to roam, so use Button there.",

  install: 'import {Toolbar, ToolbarButton} from "@aurea-uds/react";',

  features: [
    "Accepts every Button prop: variant, size, icons, loading, pressed, disabled.",
    "Ghost by default — inside a toolbar the surface already frames the action.",
    "Reachable by arrow keys, not by Tab: the bar owns the single tab stop.",
    "pressed makes it a toggle (bold, italic) with aria-pressed, the same state as Button.",
    "Disabled buttons stay in the arrow order so the row does not renumber under the user.",
  ],

  examples: [
    {
      title: "Toggles",
      description: "The formatting trio: state lives in aria-pressed, and the selected look is the same one used everywhere.",
      code: [
        '<Toolbar label="Style">',
        '  <ToolbarButton pressed>Bold</ToolbarButton>',
        '  <ToolbarButton>Italic</ToolbarButton>',
        '  <ToolbarButton>Underline</ToolbarButton>',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "Style"},
        h(ToolbarButton, {pressed: true}, "Bold"),
        h(ToolbarButton, null, "Italic"),
        h(ToolbarButton, null, "Underline")),
    },
    {
      title: "With icons",
      description: "Glyph plus word: in a dense bar the icon speeds the scan and the label keeps the meaning.",
      code: [
        '<ToolbarButton leadingIcon="arrow-counter-clockwise">Undo</ToolbarButton>',
        '<ToolbarButton leadingIcon="arrow-clockwise">Redo</ToolbarButton>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "History"},
        h(ToolbarButton, {leadingIcon: "arrow-counter-clockwise"}, "Undo"),
        h(ToolbarButton, {leadingIcon: "arrow-clockwise"}, "Redo")),
    },
    {
      title: "A destructive action in the bar",
      description: "Even here the tone carries weight: ghost destructive reads as available, not as the main move.",
      code: [
        '<ToolbarButton>Duplicate</ToolbarButton>',
        '<ToolbarSeparator />',
        '<ToolbarButton variant="danger-ghost" leadingIcon="trash">Delete</ToolbarButton>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "Row"},
        h(ToolbarButton, null, "Duplicate"),
        h(ToolbarSeparator),
        h(ToolbarButton, {variant: "danger-ghost", leadingIcon: "trash"}, "Delete")),
    },
      {
        title: "Appearances",
        description: "ghost is the default inside a toolbar, where the bar already frames the action.",
        code: [
          '<Toolbar label="Appearances">',
          ...["solid", "soft", "outline", "ghost", "link", "nav"].map(v => `  <ToolbarButton appearance="${v}">${v}</ToolbarButton>`),
          '</Toolbar>',
        ].join("\n"),
        render: () => h(Toolbar, {label: "Appearances"},
          ...["solid", "soft", "outline", "ghost", "link", "nav"].map(v => h(ToolbarButton, {key: v, appearance: v}, v))),
      },
      {
        title: "Tones",
        description: "What the colour means, with the solid appearance.",
        code: [
          '<Toolbar label="Tones">',
          ...["neutral", "brand", "info", "success", "warning", "danger"].map(v => `  <ToolbarButton tone="${v}" appearance="solid">${v}</ToolbarButton>`),
          '</Toolbar>',
        ].join("\n"),
        render: () => h(Toolbar, {label: "Tones"},
          ...["neutral", "brand", "info", "success", "warning", "danger"].map(v => h(ToolbarButton, {key: v, tone: v, appearance: "solid"}, v))),
      },
      {
        title: "Every shortcut",
        description: "The same variant shortcuts as Button.",
        code: [
          '<Toolbar label="Every shortcut">',
          ...["primary", "secondary", "tertiary", "outline", "ghost", "link", "nav", "primary-outline", "primary-ghost", "link-primary", "danger", "danger-soft", "danger-outline", "danger-ghost", "link-danger"].map(v => `  <ToolbarButton variant="${v}">${v}</ToolbarButton>`),
          '</Toolbar>',
        ].join("\n"),
        render: () => h(Toolbar, {label: "Every shortcut"},
          ...["primary", "secondary", "tertiary", "outline", "ghost", "link", "nav", "primary-outline", "primary-ghost", "link-primary", "danger", "danger-soft", "danger-outline", "danger-ghost", "link-danger"].map(v => h(ToolbarButton, {key: v, variant: v}, v))),
      },
      {
        title: "Every size",
        description: "The size step shared with Button.",
        code: [
          '<Toolbar label="Every size">',
          ...["xs", "sm", "md", "lg", "xl"].map(v => `  <ToolbarButton size="${v}">${v}</ToolbarButton>`),
          '</Toolbar>',
        ].join("\n"),
        render: () => h(Toolbar, {label: "Every size"},
          ...["xs", "sm", "md", "lg", "xl"].map(v => h(ToolbarButton, {key: v, size: v}, v))),
      },
  ],
};
