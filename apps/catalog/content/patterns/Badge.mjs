import {createElement as h} from "react";
import {Badge, Status, Icon} from "../../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default [
  {
    variant: "Primary",
    name: "Version tag",
    description: "Short metadata next to a title — the release the page documents.",
    uses: ["Badge"],
    code: '<Badge variant="primary">v1.7.0</Badge>',
    render: () => h(Badge, {variant: "primary"}, "v1.7.0"),
  },
  {
    variant: "Success",
    name: "Maturity scale",
    description: "The whole maturity ladder in one row, so a reader places an item at a glance.",
    uses: ["Badge"],
    code: '<Badge variant="success">Stable</Badge>\n<Badge variant="info">Ready</Badge>\n<Badge variant="warning">Draft</Badge>\n<Badge variant="danger">Deprecated</Badge>',
    render: () => h("div", {style: row}, h(Badge, {variant: "success"}, "Stable"),
      h(Badge, {variant: "info"}, "Ready"), h(Badge, {variant: "warning"}, "Draft"),
      h(Badge, {variant: "danger"}, "Deprecated")),
  },
  {
    variant: "Neutral",
    name: "Count on a label",
    description: "A number that changes, kept quiet: neutral, so it never competes with a status.",
    uses: ["Badge"],
    code: '<span>Unread <Badge>24</Badge></span>',
    render: () => h("span", null, "Unread ", h(Badge, null, "24")),
  },
  {
    variant: "Neutral",
    name: "Badge next to Status",
    description: "Badge classifies, Status reports a condition. Together they answer what and how.",
    uses: ["Badge", "Status"],
    code: '<Badge>api</Badge>\n<Status variant="online">operational</Status>',
    render: () => h("div", {style: row}, h(Badge, null, "api"), h(Status, {variant: "online"}, "operational")),
  },
  // GAR-07 (ADR-0060, 09/10/2026): as oito cores de CATEGORIA. Marcam grupo, não estado; e a cor
  // nunca vai sozinha — o nome e o ícone dizem o grupo, a cor só ajuda a achar.
  {
    variant: "Category",
    name: "Categories, not statuses",
    description: "Eight colour names mark a group — a section, a kind of item — and say nothing about health, so they never compete with success or danger. Yellow is left out: it belongs to the brand. The word and the icon carry the meaning; the colour only helps the eye find the group again.",
    uses: ["Badge", "Icon"],
    code: `<Badge variant="blue" leading={<Icon name="code" />}>Engineering</Badge>
<Badge variant="violet" leading={<Icon name="palette" />}>Design</Badge>
<Badge variant="orange" leading={<Icon name="megaphone" />}>Marketing</Badge>
<Badge variant="green" leading={<Icon name="coins" />}>Finance</Badge>`,
    render: () => h("div", {style: row},
      ...[["blue", "code", "Engineering"], ["violet", "palette", "Design"], ["orange", "megaphone", "Marketing"],
        ["green", "coins", "Finance"], ["teal", "flask", "Research"], ["pink", "users-three", "People"],
        ["cyan", "headset", "Support"], ["red", "book-open", "Editorial"]].map(([v, i, t]) =>
        h(Badge, {key: v, variant: v, leading: h(Icon, {name: i})}, t))),
  },
  {
    variant: "Category",
    name: "One category in three emphases",
    description: "The categories take the same three emphases as every other badge: soft for a list, solid for the one that must stand out, outline when the surface is already busy.",
    uses: ["Badge"],
    code: `<Badge variant="teal">Research</Badge>
<Badge variant="teal" emphasis="solid">Research</Badge>
<Badge variant="teal" emphasis="outline">Research</Badge>`,
    render: () => h("div", {style: row},
      h(Badge, {variant: "teal"}, "Research"), h(Badge, {variant: "teal", emphasis: "solid"}, "Research"),
      h(Badge, {variant: "teal", emphasis: "outline"}, "Research")),
  },
];
