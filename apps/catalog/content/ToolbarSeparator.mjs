import {createElement as h} from "react";
import {Toolbar, ToolbarButton, ToolbarSeparator} from "../../../packages/react/dist/index.js";

export default {
  description:
    "ToolbarSeparator draws the divide between sets of actions in a Toolbar. It is one hairline and " +
    "nothing else: no tab stop, no action, no name to announce. The meaning of the division belongs " +
    "to ToolbarGroup; the line only makes it visible.",

  install: 'import {Toolbar, ToolbarSeparator} from "@aurea-uds/react";',

  features: [
    "Reads the toolbar's orientation: a vertical line between columns, a horizontal one between rows.",
    "Never focusable — arrow keys skip it, so it costs the keyboard nothing.",
    "One hairline of --border, the same the surfaces use; no shadow, no double rule.",
    "Use with ToolbarGroup: the group says what the sets are, the separator shows where they split.",
  ],

  examples: [
    {
      title: "Between groups",
      description: "Horizontal bar: the line stretches to the height of the buttons, not of the surface.",
      code: [
        '<Toolbar label="Formatting">',
        '  <ToolbarButton>Bold</ToolbarButton>',
        '  <ToolbarSeparator />',
        '  <ToolbarButton>Left</ToolbarButton>',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "Formatting"},
        h(ToolbarButton, {pressed: true}, "Bold"), h(ToolbarButton, null, "Italic"),
        h(ToolbarSeparator),
        h(ToolbarButton, null, "Left"), h(ToolbarButton, null, "Center")),
    },
    {
      title: "Turned by the axis",
      description: "The same component in a vertical toolbar: it becomes a horizontal rule, without a prop.",
      code: [
        '<Toolbar orientation="vertical" label="Tools">',
        '  <ToolbarButton>Select</ToolbarButton>',
        '  <ToolbarSeparator />',
        '  <ToolbarButton>Erase</ToolbarButton>',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {orientation: "vertical", label: "Tools"},
        h(ToolbarButton, null, "Select"), h(ToolbarButton, null, "Draw"),
        h(ToolbarSeparator),
        h(ToolbarButton, null, "Erase")),
    },
  ],
};
