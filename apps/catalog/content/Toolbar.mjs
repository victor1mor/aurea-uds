import {createElement as h} from "react";
import {Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator, IconButton} from "../../../packages/react/dist/index.js";

export default {
  description:
    "Toolbar is a set of actions with ONE tab stop: Tab enters and leaves the whole set, and the " +
    "arrows move between the buttons inside it. That roving tabindex is the difference from " +
    "ButtonGroup, where every button is its own tab stop. A formatting bar with twelve actions " +
    "must not cost twelve presses of Tab to walk past.",

  install: 'import {Toolbar, ToolbarButton, ToolbarSeparator} from "@aurea-uds/react";',

  features: [
    "Roving tabindex from Base UI: Tab in and out, arrows within — the APG toolbar pattern.",
    "Horizontal or vertical; the orientation decides which arrows navigate and turns the separator.",
    "Named by aria-label: two toolbars on one page must not answer to the same name.",
    "ToolbarGroup labels a sub-set; ToolbarSeparator draws the divide without claiming a tab stop.",
    "Buttons are ghost by default — the toolbar surface already frames them.",
  ],

  examples: [
    {
      title: "Formatting bar",
      description: "The canonical case: text actions in groups, separated, all under one tab stop.",
      code: [
        '<Toolbar label="Formatting">',
        '  <ToolbarGroup label="Style">',
        '    <ToolbarButton pressed>Bold</ToolbarButton>',
        '    <ToolbarButton>Italic</ToolbarButton>',
        '  </ToolbarGroup>',
        '  <ToolbarSeparator />',
        '  <ToolbarGroup label="Align">',
        '    <ToolbarButton>Left</ToolbarButton>',
        '    <ToolbarButton>Center</ToolbarButton>',
        '  </ToolbarGroup>',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "Formatting"},
        h(ToolbarGroup, {label: "Style"},
          h(ToolbarButton, {pressed: true}, "Bold"), h(ToolbarButton, null, "Italic")),
        h(ToolbarSeparator),
        h(ToolbarGroup, {label: "Align"},
          h(ToolbarButton, null, "Left"), h(ToolbarButton, null, "Center"))),
    },
    {
      title: "Vertical",
      description: "Stacked for a side rail. Up and down navigate, and the separator turns with the axis.",
      code: [
        '<Toolbar orientation="vertical" label="Tools">',
        '  <ToolbarButton>Select</ToolbarButton>',
        '  <ToolbarButton>Draw</ToolbarButton>',
        '  <ToolbarSeparator />',
        '  <ToolbarButton>Erase</ToolbarButton>',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {orientation: "vertical", label: "Tools"},
        h(ToolbarButton, null, "Select"), h(ToolbarButton, null, "Draw"),
        h(ToolbarSeparator), h(ToolbarButton, null, "Erase")),
    },
    {
      title: "Icon only",
      description: "Glyph actions still need names: each one carries its label, the bar carries its own.",
      code: [
        '<Toolbar label="Canvas">',
        '  <ToolbarButton render={<IconButton icon="undo" label="Undo" />} />',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "Canvas"},
        h(IconButton, {icon: "undo", label: "Undo"}),
        h(IconButton, {icon: "redo", label: "Redo"}),
        h(ToolbarSeparator),
        h(IconButton, {icon: "zoom--in", label: "Zoom in"}),
        h(IconButton, {icon: "zoom--out", label: "Zoom out"})),
    },
    {
      title: "With a disabled action",
      description: "Unavailable but still counted: it keeps its place in the roving order, so the set never shifts under the arrows.",
      code: [
        '<Toolbar label="History">',
        '  <ToolbarButton disabled>Undo</ToolbarButton>',
        '  <ToolbarButton>Redo</ToolbarButton>',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "History"},
        h(ToolbarButton, {disabled: true}, "Undo"), h(ToolbarButton, null, "Redo")),
    },
  ],
};
