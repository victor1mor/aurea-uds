import {createElement as h} from "react";
import {ButtonGroup, Button, SegmentedControl} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default {
  description:
    "ButtonGroup binds buttons of the same kind into one coordinated set. It groups visually " +
    "and semantically — every button stays tabbable, which is exactly what separates it from a " +
    "Toolbar. Pick by the keyboard behaviour you want, never by how it looks.",

  install: 'import {ButtonGroup, Button} from "@aurea-uds/react";',

  features: [
    "role=\"group\" with an accessible name: a set with no name is a pile of buttons to a screen reader.",
    "Every button keeps its own tab stop. For arrow-key navigation with a single tab stop use Toolbar.",
    "Each button keeps the pill shape — grouping never fuses the radii into one bar.",
    "Selection: one-of-many is SegmentedControl; many-of-many is this group with pressed buttons.",
    "Disabling one item does not disable the set, and the disabled item keeps its place.",
  ],

  examples: [
    {
      title: "Range",
      description: "Three views of the same data. The label names the set, not each button.",
      code: [
        '<ButtonGroup label="Range">',
        '  <Button>Day</Button>',
        '  <Button>Week</Button>',
        '  <Button>Month</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Range"},
        h(Button, null, "Day"), h(Button, null, "Week"), h(Button, null, "Month")),
    },
    {
      title: "With leading icons",
      description: "The glyph repeats the verb of each button; the group still reads as one unit.",
      code: [
        '<ButtonGroup label="Export">',
        '  <Button leadingIcon="download">Download</Button>',
        '  <Button leadingIcon="share">Share</Button>',
        '  <Button leadingIcon="copy--link">Copy link</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Export"},
        h(Button, {leadingIcon: "download"}, "Download"),
        h(Button, {leadingIcon: "share"}, "Share"),
        h(Button, {leadingIcon: "copy--link"}, "Copy link")),
    },
    {
      title: "Multiple selection",
      description: "Many-of-many: each button is a toggle with aria-pressed. One-of-many belongs to SegmentedControl.",
      code: [
        '<ButtonGroup label="Filters">',
        '  <Button pressed>Starred</Button>',
        '  <Button pressed={false}>Archived</Button>',
        '  <Button pressed>Shared</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Filters"},
        h(Button, {pressed: true}, "Starred"),
        h(Button, {pressed: false}, "Archived"),
        h(Button, {pressed: true}, "Shared")),
    },
    {
      title: "Single selection",
      description: "The same job with the right component: SegmentedControl carries one value and one tab stop.",
      code: [
        '<SegmentedControl label="View" value="board" onChange={setView}',
        '  items={[{value: "list", label: "List"}, {value: "board", label: "Board"}]} />',
      ].join("\n"),
      render: () => h(SegmentedControl, {label: "View", value: "board", onChange: () => {},
        items: [{value: "list", label: "List"}, {value: "board", label: "Board"}]}),
    },
    {
      title: "Disabled item",
      description: "One unavailable option does not disable the set, and it keeps its place so the row never shifts.",
      code: [
        '<ButtonGroup label="Plan">',
        '  <Button>Monthly</Button>',
        '  <Button>Yearly</Button>',
        '  <Button disabled>Lifetime</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Plan"},
        h(Button, null, "Monthly"), h(Button, null, "Yearly"), h(Button, {disabled: true}, "Lifetime")),
    },
  ],
};
