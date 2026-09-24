import {createElement as h} from "react";
import {Card, Badge, Button, KPI, Avatar, Status, DataList, Timeline} from "../../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};
const between = {...row, justifyContent: "space-between"};
const grid3 = {display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "var(--space-3)", width: "min(620px,100%)"};

export default [
  {
    variant: "Base",
    name: "Titled surface",
    description: "The plain floating surface: title, one line of context, radius 22.",
    uses: ["Card"],
    code: '<Card>\n  <strong>Billing</strong>\n  <p className="muted">Invoices and payment method.</p>\n</Card>',
    render: () => h("div", {style: {width: "min(420px,100%)"}},
      h(Card, null, h("strong", null, "Billing"), h("p", {className: "muted"}, "Invoices and payment method."))),
  },
  {
    variant: "Base",
    name: "Header with action",
    description: "Title on the left, the action on the right, on the same baseline. The card owns its own header.",
    uses: ["Card", "Button", "Badge"],
    code: '<Card>\n  <div className="cluster" style={{justifyContent:"space-between"}}>\n    <strong>API keys <Badge>2</Badge></strong>\n    <Button variant="outline">New key</Button>\n  </div>\n</Card>',
    render: () => h("div", {style: {width: "min(460px,100%)"}},
      h(Card, null, h("div", {style: between},
        h("strong", null, "API keys ", h(Badge, null, "2")),
        h(Button, {variant: "outline"}, "New key")))),
  },
  {
    variant: "Interactive",
    name: "Selectable tile",
    description: "A card that is a target. The interactive variant carries the hover and the focus ring — and it requires `render`, because only the caller knows whether the tile is an action (<button>) or a link (<a href>).",
    uses: ["Card", "Status"],
    code: '<Card variant="interactive" render={<button type="button" />}>\n  <strong>Production</strong>\n  <Status variant="online">healthy</Status>\n</Card>',
    render: () => h("div", {style: {width: "min(300px,100%)"}},
      h(Card, {variant: "interactive", render: h("button", {type: "button"})},
        h("strong", null, "Production"),
        h("div", {style: {marginTop: "var(--space-2)"}}, h(Status, {variant: "online"}, "healthy")))),
  },
  {
    variant: "Metrics",
    name: "KPI row",
    description: "Three numbers of the same weight. One line, equal columns, trend beside the value.",
    uses: ["KPI"],
    code: '<KPI label="Revenue" value="$48.2k" trend="+12%" />\n<KPI label="Churn" value="1.8%" trend="-0.3%" />\n<KPI label="Seats" value="312" trend="+18" />',
    render: () => h("div", {style: grid3},
      h(KPI, {label: "Revenue", value: "$48.2k", trend: "+12%"}),
      h(KPI, {label: "Churn", value: "1.8%", trend: "-0.3%"}),
      h(KPI, {label: "Seats", value: "312", trend: "+18"})),
  },
  {
    variant: "Identity",
    name: "Member row",
    description: "Avatar, name and role — the identity line that repeats in every list of people.",
    uses: ["Card", "Avatar", "Badge"],
    code: '<Card>\n  <div className="cluster">\n    <Avatar fallback="AM" />\n    <div><strong>Analyst</strong><p className="muted">analyst@acme.dev</p></div>\n    <Badge>admin</Badge>\n  </div>\n</Card>',
    render: () => h("div", {style: {width: "min(420px,100%)"}},
      h(Card, null, h("div", {style: row},
        h(Avatar, {fallback: "AM"}),
        h("div", {style: {flex: 1, minWidth: 0}}, h("strong", null, "Analyst"),
          h("p", {className: "muted", style: {margin: 0, fontSize: "var(--text-sm)"}}, "analyst@acme.dev")),
        h(Badge, null, "admin")))),
  },
  {
    variant: "Detail",
    name: "Facts list",
    description: "Term and value in two columns — for a record's attributes, not for tabular data.",
    uses: ["Card", "DataList"],
    code: '<Card>\n  <DataList items={[{term:"Plan",value:"Pro"},{term:"Seats",value:"12"}]} />\n</Card>',
    render: () => h("div", {style: {width: "min(420px,100%)"}},
      h(Card, null, h(DataList, {items: [{term: "Plan", value: "Pro"},
        {term: "Seats", value: "12"}, {term: "Renews", value: "Aug 12"}]}))),
  },
  {
    variant: "Detail",
    name: "Activity timeline",
    description: "What happened, in order, with the time on the side. History, not a feed of live events.",
    uses: ["Card", "Timeline"],
    code: '<Card>\n  <Timeline items={[{title:"Created",time:"09:00"},{title:"Shipped",time:"14:20"}]} />\n</Card>',
    render: () => h("div", {style: {width: "min(420px,100%)"}},
      h(Card, null, h(Timeline, {items: [{title: "Created", time: "09:00", description: "by Curator"},
        {title: "Reviewed", time: "11:40"}, {title: "Shipped", time: "14:20"}]}))),
  },
];
