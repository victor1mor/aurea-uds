// O Timeline do nativo no site (bloco 1, o grupo 1 — 23/10/2026): a sequência do que aconteceu. Os itens são dados.
import {createElement as h} from "react";
import {Badge, Timeline} from "../../../../packages/native/dist/index.js";

const largura = {width: "min(28rem, 100%)"};
const TONS = ["neutral", "primary", "info", "success", "warning", "danger"];

export default {
  install: 'import {Timeline} from "@aurea-uds/native";',
  api: {
    items: "The events, in order: {title, description?, time?, icon?, tone?, trailing?, between?}. On native it is a list for the screen reader, with no \"1 of 40\" on each event: the time of each one is what tells the order.",
    style: "Added to the list's box.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Timeline items={[
  {title: "Order placed", description: "Paid by card", time: "Mon, 09:12"},
  {title: "Shipped", description: "Left the warehouse", time: "Tue, 14:20"},
  {title: "Delivered", time: "Thu, 10:05"},
]} />`,
      render: () => h("div", {style: largura}, h(Timeline, {items: [
        {title: "Order placed", description: "Paid by card", time: "Mon, 09:12"},
        {title: "Shipped", description: "Left the warehouse", time: "Tue, 14:20"},
        {title: "Delivered", time: "Thu, 10:05"},
      ]})),
    },
    {
      title: "Icons, value and the time between",
      description: "icon puts a glyph in a round frame in place of the dot; trailing goes to the right of the title; between is written beside the line, up to the next event.",
      code: `<Timeline items={[
  {title: "Report sent", icon: "upload-simple", time: "Oct 1", trailing: "$1,240", between: "6 days later"},
  {title: "Approved", icon: "check-circle", tone: "success", time: "Oct 7", trailing: <Badge tone="success">Paid</Badge>},
]} />`,
      render: () => h("div", {style: largura}, h(Timeline, {items: [
        {title: "Report sent", icon: "upload-simple", time: "Oct 1", trailing: "$1,240", between: "6 days later"},
        {title: "Approved", icon: "check-circle", tone: "success", time: "Oct 7", trailing: h(Badge, {tone: "success"}, "Paid")},
      ]})),
    },
    {
      title: "Tones",
      description: "The colour of the icon's frame, with the Badge's words. Without an icon, tone does nothing.",
      code: `<Timeline items={[
${TONS.map((v) => `  {title: "tone ${v}", icon: "info", tone: "${v}"},`).join("\n")}
]} />`,
      render: () => h("div", {style: largura}, h(Timeline, {items: TONS.map((v) => ({title: `tone ${v}`, icon: "info", tone: v}))})),
    },
  ],
};
