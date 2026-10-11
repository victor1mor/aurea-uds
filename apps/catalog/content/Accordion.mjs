import {createElement as h} from "react";
import {Accordion} from "../../../packages/react/dist/index.js";

const wide = {width: "100%", maxWidth: "32rem"};
const ITENS = [
  {id: "ship", title: "How do I install it?", content: "Install the packages and import the CSS once, at the root of the app."},
  {id: "theme", title: "Can I change the colours?", content: "Every visual value is a token. A brand redefines the colours and nothing else."},
  {id: "native", title: "Does it work on a phone app?", content: "Yes: the native package draws the same pieces with React Native."},
];

export default {
  description:
    "Accordion stacks questions that open to show their answer. One opens at a time, like the " +
    "reference's: opening one closes the other. It is built on the browser's own <details>, so it " +
    "opens without JavaScript.",

  install: 'import {Accordion} from "@aurea-uds/react";',

  features: [
    "No box around it: a hairline between the items, none after the last.",
    "The question has 16 on every side; the arrow at the end turns when it opens.",
    "The hover highlight is a capsule — Aurea's corner on the reference's measures.",
    "multiple lets several stay open; defaultValue opens items from the start.",
    "variant=\"surface\" puts it in a card. A disabled item is announced and skipped by Tab.",
  ],

  examples: [
    {
      title: "Default",
      description: "One open at a time.",
      code: [
        "<Accordion items={[",
        '  {id: "ship", title: "How do I install it?", content: "Install the packages…"},',
        '  {id: "theme", title: "Can I change the colours?", content: "Every visual value is a token…"},',
        "]} />",
      ].join("\n"),
      render: () => h("div", {style: wide}, h(Accordion, {items: ITENS, defaultValue: ["ship"]})),
    },
    {
      title: "Surface",
      description: "In a card, with the line at 94% and the hover on the neutral fill.",
      code: '<Accordion variant="surface" items={items} />',
      render: () => h("div", {style: wide}, h(Accordion, {variant: "surface", items: ITENS})),
    },
    {
      title: "Several open",
      description: "multiple keeps each item independent.",
      code: '<Accordion multiple defaultValue={["ship", "native"]} items={items} />',
      render: () => h("div", {style: wide}, h(Accordion, {multiple: true, defaultValue: ["ship", "native"], items: ITENS})),
    },
  ],
};
