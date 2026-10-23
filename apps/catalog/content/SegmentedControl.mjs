import {createElement as h} from "react";
import {SegmentedControl} from "../../../packages/react/dist/index.js";
import {ComValor} from "./_estado.mjs";

const stack = {display: "grid", gap: "var(--space-4)", justifyItems: "center"};

export default {
  description:
    "SegmentedControl is one-of-many, always visible: two to five options in a track, the chosen one " +
    "raised. It carries one value and one tab stop. Past five options this becomes a Select — a track " +
    "that wraps to a second line stops being a segmented control.",

  install: 'import {SegmentedControl} from "@aurea-uds/react";',

  features: [
    "One value, controlled by design: one-of-many always has an owner.",
    "Two to five options. More than that is a Select; many-of-many is a ButtonGroup of toggles.",
    "The selected option shows the system's selected language — raised capsule, brand label, yellow bar.",
    "The track keeps the pill; the options never fuse into a single bar.",
    "Switches the VIEW of the same data, never its meaning — that would be a filter.",
  ],

  examples: [
    {
      title: "View switch",
      description: "Two ways to look at one list. The label names the set, not the options.",
      code: [
        '<SegmentedControl label="View" value={view} onChange={setView}',
        '  items={[{value: "list", label: "List"}, {value: "board", label: "Board"}]} />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(ComValor, {componente: SegmentedControl, label: "View", value: "board", 
          items: [{value: "list", label: "List"}, {value: "board", label: "Board"}]})),
    },
    {
      title: "Time range",
      description: "Three spans over the same chart — the classic dashboard header.",
      code: [
        '<SegmentedControl label="Range" value="7d" onChange={setRange}',
        '  items={[{value: "24h", label: "24h"}, {value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]} />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(ComValor, {componente: SegmentedControl, label: "Range", value: "7d", 
          items: [{value: "24h", label: "24h"}, {value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]})),
    },
    {
      title: "The ceiling",
      description: "Five is the limit. At this width it already asks to become a Select — which is the signal to switch.",
      code: '// five options: still a track. six: use Select.',
      render: () => h("div", {style: stack},
        h(ComValor, {componente: SegmentedControl, label: "Density", value: "comfortable", 
          items: [{value: "xs", label: "XS"}, {value: "compact", label: "Compact"},
            {value: "comfortable", label: "Comfortable"}, {value: "spacious", label: "Spacious"},
            {value: "xl", label: "XL"}]})),
    },
    {
      title: "Sizes",
      description: "sm is the low capsule — the switch at the end of this site's areas row; md, the default, is the control height.",
      code: `<SegmentedControl size="sm" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl size="md" label="View" value={view} onChange={setView} items={views} />`,
      render: () => h("div", {style: {display: "grid", gap: "var(--space-3)", justifyItems: "start"}},
        ...["sm", "md"].map(s => h(ComValor, {key: s, componente: SegmentedControl, valor: "value", aviso: "onChange", size: s,
          label: `View, ${s}`, value: "list", items: [{value: "list", label: "List"}, {value: "grid", label: "Grid"}]}))),
    },
    {
      title: "As navigation",
      description: "With href on every item it is a <nav> of links: going to another page is navigation, and the current "
        + "one is marked with aria-current=\"page\" — the Web | Native switch at the top of this site.",
      code: `<SegmentedControl size="sm" label="Platform" value="web" items={[
  {value: "web", label: "Web", href: "/button.html"},
  {value: "native", label: "Native", href: "/native-button.html"},
]} />`,
      render: () => h(SegmentedControl, {size: "sm", label: "Platform, example", value: "web",
        items: [{value: "web", label: "Web", href: "#web"}, {value: "native", label: "Native", href: "#native"}]}),
    },
  ],
};
