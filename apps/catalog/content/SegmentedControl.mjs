import {createElement as h} from "react";
import {SegmentedControl} from "../../../packages/react/dist/index.js";
import {ComValor} from "./_estado.mjs";
import {cada} from "./_eixos.mjs";

const stack = {display: "grid", gap: "var(--space-4)", justifyItems: "center"};

export default {
  description:
    "SegmentedControl is one-of-many, always visible: two to five options in a track, the chosen one " +
    "raised. It carries one value and one tab stop. Past five options it usually becomes a Select; when every " +
    "option must stay in sight, wrap lets the track break onto more lines.",

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
      description: "sm (34) is the low capsule of a documentation switch; md (40), the default, is the control height; lg (44) "
        + "and xl (48) are the tall capsules — the Web | Native switch and the area switch of this site; 2xl (56) has 48 segments.",
      code: `<SegmentedControl size="sm" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl size="md" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl size="lg" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl size="xl" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl size="2xl" label="View" value={view} onChange={setView} items={views} />`,
      render: () => h("div", {style: {display: "grid", gap: "var(--space-3)", justifyItems: "start"}},
        ...["sm", "md", "lg", "xl", "2xl"].map(s => h(ComValor, {key: s, componente: SegmentedControl, valor: "value", aviso: "onChange", size: s,
          label: `View, ${s}`, value: "list", items: [{value: "list", label: "List"}, {value: "grid", label: "Grid"}]}))),
    },
    {
      title: "As navigation",
      description: "With href on every item it is a <nav> of links: going to another page is navigation, and the current "
        + "one is marked with aria-current=\"page\" — like the Web | Native switch of this site.",
      code: `<SegmentedControl size="sm" label="Platform" value="web" items={[
  {value: "web", label: "Web", href: "/button.html"},
  {value: "native", label: "Native", href: "/native-button.html"},
]} />`,
      render: () => h(SegmentedControl, {size: "sm", label: "Platform, example", value: "web",
        items: [{value: "web", label: "Web", href: "#web"}, {value: "native", label: "Native", href: "#native"}]}),
    },
    {
      title: "With icons",
      description: "An icon on each item, 8 before the label; the selected one switches to the filled form by itself. "
        + "size=\"2xl\" is one step taller: 48 segments, 20 icons, 16 letters.",
      code: `<SegmentedControl label="View" value={view} onChange={setView} items={[
  {value: "grid", label: "Grid", icon: "squares-four"},
  {value: "list", label: "List", icon: "list"},
]} />
<SegmentedControl size="2xl" label="Section" value={section} onChange={setSection} items={[
  {value: "home", label: "Home", icon: "house"},
  {value: "alerts", label: "Alerts", icon: "bell"},
  {value: "settings", label: "Settings", icon: "gear"},
]} />`,
      render: () => h("div", {style: {display: "grid", gap: "var(--space-3)", justifyItems: "start"}},
        h(ComValor, {componente: SegmentedControl, valor: "value", aviso: "onChange", label: "View, with icons", value: "grid",
          items: [{value: "grid", label: "Grid", icon: "squares-four"}, {value: "list", label: "List", icon: "list"}]}),
        h(ComValor, {componente: SegmentedControl, valor: "value", aviso: "onChange", size: "2xl", label: "Section, 2xl", value: "home",
          items: [{value: "home", label: "Home", icon: "house"}, {value: "alerts", label: "Alerts", icon: "bell"}, {value: "settings", label: "Settings", icon: "gear"}]})),
    },
    {
      title: "Wrapping and vertical",
      description: "wrap lets a long set break onto more lines, and the track takes the card radius (22). "
        + "orientation=\"vertical\" stands it up, each segment the full width.",
      code: `<SegmentedControl wrap label="Principle" value={p} onChange={setP} items={principles} />
<SegmentedControl orientation="vertical" label="Reader" value={r} onChange={setR} items={readers} />`,
      render: () => h("div", {style: {display: "grid", gap: "var(--space-4)", justifyItems: "start", maxInlineSize: "min(26rem, 100%)"}},
        h(ComValor, {componente: SegmentedControl, valor: "value", aviso: "onChange", wrap: true, label: "Principle, wrapping", value: "clear",
          items: ["Clear", "Calm", "Honest", "Fast", "Kind", "Whole"].map(n => ({value: n.toLowerCase(), label: n}))}),
        h(ComValor, {componente: SegmentedControl, valor: "value", aviso: "onChange", orientation: "vertical", label: "Reader, vertical", value: "full",
          items: [{value: "index", label: "Reads the index"}, {value: "full", label: "Reads everything"}, {value: "page", label: "Reads one page"}]})),
    },
    cada({titulo: "The colour of the selected segment", descricao: "selectedStyle (ADR-0084): current — the raised capsule with "
      + "the yellow line, the default — neutral, contrast (graphite), brand (yellow), ring (a yellow ring) and dot (a yellow dot "
      + "before the label; its place is kept in every segment, so the width does not jump) and emphasis (the raised capsule with "
      + "the emphasis letter, no line).",
      valores: ["current", "neutral", "contrast", "brand", "ring", "dot", "emphasis"], coluna: true,
      codigo: v => `<SegmentedControl selectedStyle="${v}" label="View" value={view} onChange={setView} items={views} />`,
      peca: v => h(ComValor, {componente: SegmentedControl, valor: "value", aviso: "onChange", selectedStyle: v,
        label: `View, ${v}`, value: "list", items: [{value: "list", label: "List"}, {value: "grid", label: "Grid"}, {value: "map", label: "Map"}]})}),
  ],
};
