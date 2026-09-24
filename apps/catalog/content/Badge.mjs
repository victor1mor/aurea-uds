import {createElement as h} from "react";
import {Badge, Avatar, Icon} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};
// O botão do sino é marcação crua de propósito: o que se mostra aqui é o BADGE, e um IconButton
// de verdade traria o foco e o hover dele para a foto. A classe é a mesma que o core já publica.
const sino = (rotulo) => h("button", {className: "btn btn-icon btn-secondary", "aria-label": rotulo},
  h(Icon, {name: "notification"}));

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
      title: "Sizes, and what goes inside",
      description: "A status dot, a round picture, or a glyph before and after the text.",
      code: `<Badge size="sm" dot variant="success">Online</Badge>
<Badge size="md" image="/ana.jpg" imageAlt="">Ana</Badge>
<Badge size="lg" trailing={<Icon name="arrow--right" />}>Next</Badge>`,
      render: () => h("div", {style: row},
        h(Badge, {size: "sm", dot: true, variant: "success"}, "Online"),
        h(Badge, {size: "md"}, "Default"),
        h(Badge, {size: "lg"}, "Large"),
        h(Badge, {dot: true, variant: "danger"}, "Failed"),
        h(Badge, {trailing: h(Icon, {name: "arrow--right"})}, "Next")),
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
  <IconButton icon="notification" label="Notifications, 8 unread" />
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
  <Avatar name="Ana Prado" />
</Badge>`,
      render: () => h("div", {style: row},
        h(Badge, {anchor: "bottom-end", anchorShape: "circle", dot: true, emphasis: "solid",
          variant: "success"}, h(Avatar, {name: "Ana Prado"})),
        h(Badge, {anchor: "top-end", anchorShape: "circle", count: 3, emphasis: "solid",
          variant: "danger"}, h(Avatar, {name: "Beto Lima"})),
        h(Badge, {anchor: "top-end", count: 3, emphasis: "solid", variant: "danger"},
          sino("Messages, 3 unread"))),
    },
  ],
};
