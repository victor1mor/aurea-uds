import {createElement as h} from "react";
import {Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator} from "../../../packages/react/dist/index.js";

export default {
  description:
    "ToolbarGroup names a sub-set inside a Toolbar. Without it a bar of twelve buttons is one flat " +
    "list; with it a screen reader can say \"Align, three items\" before reading them. It changes " +
    "the announcement and the spacing — never the tab order, which belongs to the Toolbar.",

  install: 'import {Toolbar, ToolbarGroup, ToolbarButton} from "@aurea-uds/react";',

  features: [
    "Groups by intent — style, align, history — so a long bar reads as a few short lists.",
    "The label is the announcement; a group with no label is only visual spacing.",
    "Does not create a tab stop: the arrows still cross the whole toolbar in one sweep.",
    "Pairs with ToolbarSeparator: the group carries the meaning, the separator the line.",
  ],

  examples: [
    {
      title: "Two named groups",
      description: "Style and align, divided. The reader hears the group before its buttons.",
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
        '    <ToolbarButton>Right</ToolbarButton>',
        '  </ToolbarGroup>',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {label: "Formatting"},
        h(ToolbarGroup, {label: "Style"},
          h(ToolbarButton, {pressed: true}, "Bold"), h(ToolbarButton, null, "Italic")),
        h(ToolbarSeparator),
        h(ToolbarGroup, {label: "Align"},
          h(ToolbarButton, null, "Left"), h(ToolbarButton, null, "Center"), h(ToolbarButton, null, "Right"))),
    },
    {
      title: "Vertical rail",
      description: "In a vertical toolbar the groups stack and the separator turns with the axis.",
      code: [
        '<Toolbar orientation="vertical" label="Tools">',
        '  <ToolbarGroup label="Draw">…</ToolbarGroup>',
        '  <ToolbarSeparator />',
        '  <ToolbarGroup label="View">…</ToolbarGroup>',
        '</Toolbar>',
      ].join("\n"),
      render: () => h(Toolbar, {orientation: "vertical", label: "Tools"},
        h(ToolbarGroup, {label: "Draw"},
          h(ToolbarButton, null, "Pen"), h(ToolbarButton, null, "Shape")),
        h(ToolbarSeparator),
        h(ToolbarGroup, {label: "View"},
          h(ToolbarButton, null, "Zoom"), h(ToolbarButton, null, "Fit"))),
    },
  ],
};
