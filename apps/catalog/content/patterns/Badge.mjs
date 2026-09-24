import {createElement as h} from "react";
import {Badge, Status} from "../../../../packages/react/dist/index.js";

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
];
