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
        '<ToolbarButton leadingIcon="undo">Undo</ToolbarButton>',
        '<ToolbarButton leadingIcon="redo">Redo</ToolbarButton>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "History"},
        h(ToolbarButton, {leadingIcon: "undo"}, "Undo"),
        h(ToolbarButton, {leadingIcon: "redo"}, "Redo")),
    },
    {
      title: "A destructive action in the bar",
      description: "Even here the tone carries weight: ghost destructive reads as available, not as the main move.",
      code: [
        '<ToolbarButton>Duplicate</ToolbarButton>',
        '<ToolbarSeparator />',
        '<ToolbarButton variant="danger-ghost" leadingIcon="trash-can">Delete</ToolbarButton>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "Row"},
        h(ToolbarButton, null, "Duplicate"),
        h(ToolbarSeparator),
        h(ToolbarButton, {variant: "danger-ghost", leadingIcon: "trash-can"}, "Delete")),
    },
  ],
};
