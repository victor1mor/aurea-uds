import {createElement as h} from "react";
import {Separator, Card, Stack, Cluster} from "../../../packages/react/dist/index.js";

const box = {width: "min(22rem,100%)"};

export default {
  description:
    "Separator is the rule between things: a full-width hairline, or a 1px column between items in "
    + "a row. It is what a sidebar puts between sections and what a row of actions puts between "
    + "groups.",
  install: 'import {Separator} from "@aurea-uds/react";',
  features: [
    "It is a native <hr> and ships NO JavaScript. The role comes from the element, not from an "
    + "attribute — an <hr> already carries role=\"separator\" implicitly, and writing it would be "
    + "redundant ARIA. The APG's own warning is that no ARIA beats bad ARIA.",
    "aria-orientation appears ONLY on the vertical one. The separator role already defaults to "
    + "horizontal, so writing it there would repeat the platform out loud for nothing.",
    "It draws with `background` on a 1px box, not with `border` — the thickness then does not "
    + "depend on which border side someone wrote, and one class serves both orientations.",
    "The vertical one stretches to the tallest sibling AND carries a floor: inside a parent with no "
    + "height of its own it would otherwise measure zero and disappear while still existing in the "
    + "DOM. There is a test for exactly that case.",
    "Inside a Toolbar use ToolbarSeparator instead — that one takes part in the roving tabindex the "
    + "engine manages. This one is for everything else.",
  ],
  examples: [
    {
      title: "Between sections",
      description: "The horizontal rule: a hairline across the panel, splitting one group of "
        + "content from the next.",
      code: `<Card>
  <Stack>
    <p>Account</p>
    <Separator />
    <p>Billing</p>
  </Stack>
</Card>`,
      render: () => h("div", {style: box}, h(Card, null, h(Stack, null,
        h("p", {style: {margin: 0}}, "Account"),
        h(Separator),
        h("p", {style: {margin: 0}}, "Billing")))),
    },
    {
      title: "Between items in a row",
      description: "The vertical rule stretches to the tallest sibling. Useful between counts, "
        + "authors, timestamps — the places a bullet would go.",
      code: `<Cluster>
  <span>12 open</span>
  <Separator orientation="vertical" />
  <span>4 closed</span>
  <Separator orientation="vertical" />
  <span>updated today</span>
</Cluster>`,
      render: () => h(Cluster, null,
        h("span", null, "12 open"),
        h(Separator, {orientation: "vertical"}),
        h("span", null, "4 closed"),
        h(Separator, {orientation: "vertical"}),
        h("span", null, "updated today")),
    },
  ],
};
