import {createElement as h} from "react";
import {Badge, Avatar, Icon, Stack} from "../../../packages/react/dist/index.js";
import {eixo} from "./_eixos.mjs";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};
// O botão do sino é marcação crua de propósito: o que se mostra aqui é o BADGE, e um IconButton
// de verdade traria o foco e o hover dele para a foto. A classe é a mesma que o core já publica.
const sino = (rotulo) => h("button", {className: "btn btn-icon btn-secondary", "aria-label": rotulo},
  h(Icon, {name: "bell"}));

// Os 18 tons da ficha, na ordem dela: os seis de sentido, os quatro de operação e as oito cores de categoria.
const TONS = {neutral: "Neutral", primary: "Primary", info: "Info", success: "Success", warning: "Warning",
  danger: "Danger", running: "Running", paused: "Paused", offline: "Offline", review: "In review", red: "Red",
  orange: "Orange", green: "Green", teal: "Teal", cyan: "Cyan", blue: "Blue", violet: "Violet", pink: "Pink"};
// Os quatro cantos do `anchor`: o código e o desenho saem desta lista.
const CANTOS = [
  {anchor: "top-start", count: 2, rotulo: "Alerts, 2 unread"},
  {anchor: "top-end", count: 8, rotulo: "Notifications, 8 unread"},
  {anchor: "bottom-start", count: 1, rotulo: "Reminders, 1 due"},
  {anchor: "bottom-end", count: 5, rotulo: "Mentions, 5 new"},
];

export default {
  description:
    "Badge is short metadata in a pill — and, with `anchor`, the counter that rides on the corner "
    + "of something else. One component covers both because they are the same object: a small "
    + "mark that qualifies what is next to it.",
  install: 'import {Badge} from "@aurea-uds/react";',
  features: [
    "Three emphases — `soft` (the tinted pill), `outline`, and `solid`. All 36 combinations of "
    + "variant × emphasis × theme were measured for contrast; the lowest is 5.6:1.",
    "Three sizes. `md` is the historical one and did not move, so nothing that already used Badge "
    + "changed by a pixel.",
    "Accessories: a status `dot`, a round `image`, and `leading`/`trailing` nodes.",
    "Numbers: `count` with `max` (over it, `99+`) and `showZero` — zero hides itself, because an "
    + "empty inbox does not deserve a mark. `formatBadgeCount` is exported so your accessible name "
    + "can say the same string the eye sees.",
    "`anchor` hangs it on a corner of any child, with `anchorShape=\"circle\"` pulling it 14% back "
    + "for round parents. A cutout ring in the surface colour keeps it from melting into the icon; "
    + "override `--badge-ring` when the surface is not the page background.",
    "An anchored badge is aria-hidden ON PURPOSE: the count belongs in the accessible name of the "
    + "thing it decorates. A bell announced as \"bell 8\" tells nobody what the 8 is.",
  ],
  examples: [
    {
      title: "Tones and emphasis",
      description: "The variant says which tone; the emphasis says how loud. `soft` is the default "
        + "and is what every existing use already gets.",
      code: `<Badge variant="success">Ready</Badge>
<Badge variant="success" emphasis="outline">Ready</Badge>
<Badge variant="success" emphasis="solid">Ready</Badge>`,
      render: () => h("div", {style: row},
        ...["soft", "outline", "solid"].map(e =>
          h(Badge, {key: e, variant: "success", emphasis: e === "soft" ? undefined : e}, "Ready")),
        ...["danger", "warning", "info", "primary"].map(v =>
          h(Badge, {key: v, variant: v, emphasis: "solid"}, v))),
    },
    {
      title: "Flat",
      description: "The soft tone without the line around it — the reference's release badge at the top of this site.",
      code: `<Badge tone="primary" emphasis="flat" leading={<Icon name="rocket" />}>What's new</Badge>
<Badge tone="success" emphasis="flat">Ready</Badge>`,
      render: () => h("div", {style: row},
        h(Badge, {tone: "primary", emphasis: "flat", leading: h(Icon, {name: "rocket"})}, "What's new"),
        h(Badge, {tone: "success", emphasis: "flat"}, "Ready")),
    },
    {
      title: "Sizes, and what goes inside",
      description: "A status dot, a round picture, or a glyph before and after the text.",
      code: `<Badge size="sm" dot variant="success">Online</Badge>
<Badge size="md" image="/ana.jpg" imageAlt="">Ana</Badge>
<Badge size="lg" trailing={<Icon name="arrow-right" />}>Next</Badge>`,
      render: () => h("div", {style: row},
        h(Badge, {size: "sm", dot: true, variant: "success"}, "Online"),
        h(Badge, {size: "md"}, "Default"),
        h(Badge, {size: "lg"}, "Large"),
        h(Badge, {dot: true, variant: "danger"}, "Failed"),
        h(Badge, {trailing: h(Icon, {name: "arrow-right"})}, "Next")),
    },
    {
      title: "Counting, and the ceiling",
      description:
        "Over `max` it reads `99+`. Zero hides itself unless you ask for it — that is the same "
        + "rule the reference implementations settled on.",
      code: `<Badge count={5} emphasis="solid" variant="danger" />
<Badge count={100} emphasis="solid" variant="danger" />
<Badge count={1000} max={999} emphasis="solid" variant="danger" />`,
      render: () => h("div", {style: row},
        h(Badge, {count: 5, emphasis: "solid", variant: "danger"}),
        h(Badge, {count: 99, emphasis: "solid", variant: "danger"}),
        h(Badge, {count: 100, emphasis: "solid", variant: "danger"}),
        h(Badge, {count: 1000, max: 999, emphasis: "solid", variant: "danger"}),
        h(Badge, {count: 0, showZero: true, emphasis: "solid"})),
    },
    {
      title: "anchor — the counter on the corner",
      description:
        "Pass the thing being decorated as children. The count goes in ITS accessible name; the "
        + "badge itself is hidden from screen readers.",
      code: `<Badge anchor="top-end" count={8} emphasis="solid" variant="danger">
  <IconButton icon="bell" label="Notifications, 8 unread" />
</Badge>`,
      render: () => h("div", {style: row},
        h(Badge, {anchor: "top-end", count: 8, emphasis: "solid", variant: "danger"},
          sino("Notifications, 8 unread")),
        h(Badge, {anchor: "top-end", count: 100, emphasis: "solid", variant: "danger"},
          sino("Notifications, more than 99 unread")),
        h(Badge, {anchor: "top-end", dot: true, emphasis: "solid", variant: "danger"},
          sino("Notifications, something new"))),
    },
    {
      title: "anchorShape — square corner, or round",
      description:
        "On a circle the badge is pulled 14% back into the corner. Without that it floats off the "
        + "edge, which is the giveaway of a counter glued on by hand.",
      code: `<Badge anchor="bottom-end" anchorShape="circle" dot variant="success">
  <Avatar alt="Ana Prado" fallback="AP" />
</Badge>`,
      render: () => h("div", {style: row},
        h(Badge, {anchor: "bottom-end", anchorShape: "circle", dot: true, emphasis: "solid",
          variant: "success"}, h(Avatar, {name: "Ana Prado"})),
        h(Badge, {anchor: "top-end", anchorShape: "circle", count: 3, emphasis: "solid",
          variant: "danger"}, h(Avatar, {name: "Beto Lima"})),
        h(Badge, {anchor: "top-end", count: 3, emphasis: "solid", variant: "danger"},
          sino("Messages, 3 unread"))),
    },
    eixo({
      titulo: "Every tone",
      descricao: "Six tones that carry meaning, four for the state of a job, and eight category colours that mark a "
        + "group and say nothing about health. There is no yellow: it belongs to the brand. Pair the colour with a word.",
      Comp: Badge, nome: "Badge", prop: "tone", valores: Object.keys(TONS), filho: (v) => TONS[v],
    }),
    eixo({
      titulo: "Four sizes",
      descricao: "`xs` is 16 high and borderless: the counter that rides on an icon, the one BottomNav asks for. "
        + "`md` is the default.",
      Comp: Badge, nome: "Badge", prop: "size", valores: ["xs", "sm", "md", "lg"],
      base: {tone: "primary", emphasis: "solid"},
      filho: (v) => ({xs: "3", sm: "Small", md: "Medium", lg: "Large"})[v],
    }),
    {
      title: "anchor — all four corners",
      description: "The counter hangs off any corner of the thing it decorates. Each count lives in the accessible "
        + "name of the button; the badge stays hidden from screen readers.",
      code: CANTOS.map(({anchor, count, rotulo}) =>
        `<Badge anchor="${anchor}" count={${count}} emphasis="solid" tone="danger">\n`
        + `  <IconButton icon="bell" label="${rotulo}" />\n</Badge>`).join("\n"),
      render: () => h("div", {style: {...row, gap: "var(--space-6)"}},
        ...CANTOS.map(({anchor, count, rotulo}) =>
          h(Badge, {key: anchor, anchor, count, emphasis: "solid", tone: "danger"}, sino(rotulo)))),
    },
    {
      title: "fit — as wide as the text",
      description: "Inside a column a badge follows the column's width. `fit=\"content\"` keeps it as wide as its "
        + "text and leaves the row alone.",
      code: `<Stack>
  <Badge tone="info">Follows the column</Badge>
  <Badge tone="info" fit="content">As wide as its text</Badge>
</Stack>`,
      render: () => h("div", {style: {width: "min(18rem,100%)"}}, h(Stack, null,
        h(Badge, {tone: "info"}, "Follows the column"),
        h(Badge, {tone: "info", fit: "content"}, "As wide as its text"))),
    },
    {
      title: "ring — a finish",
      description: "A finish the app chooses: the tone at 30% around a badge that is not solid, inside the edge, so the "
        + "size never changes. data-ring=\"true\" on a container turns it on for every badge inside, and ring={false} takes one out.",
      code: `<Badge tone="primary" ring>Brand</Badge>
<Badge tone="success" ring>Paid</Badge>
<Badge tone="danger" ring>Overdue</Badge>
<Badge tone="info" emphasis="outline" ring>New</Badge>

<div data-ring="true">
  <Badge tone="warning">Review</Badge>
  <Badge tone="warning" ring={false}>Without ring</Badge>
</div>`,
      render: () => h(Stack, null,
        h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-2)"}},
          h(Badge, {tone: "primary", ring: true}, "Brand"), h(Badge, {tone: "success", ring: true}, "Paid"),
          h(Badge, {tone: "danger", ring: true}, "Overdue"), h(Badge, {tone: "info", emphasis: "outline", ring: true}, "New")),
        h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-2)"}, "data-ring": "true"},
          h(Badge, {tone: "warning"}, "Review"), h(Badge, {tone: "warning", ring: false}, "Without ring"))),
    },
  ],
};
