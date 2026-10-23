// O Stack do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. Cada pilha vai num
// cartão fundo, para a largura da coluna se ver.
import {createElement as h} from "react";
import {Button, Card, Stack, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))", gap: "var(--space-3)", width: "100%"};

export default {
  install: 'import {Stack} from "@aurea-uds/native";',
  api: {
    children: "The items, in a column with 16 between them. There is no spacing prop, on purpose: a layout primitive that takes any gap is how a system stops having spacing.",
    align: "The cross axis. stretch (the default) gives every child the column's width; start, center and end keep each child at its own width — a button as wide as its text.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Stack>
  <Text weight={600}>Invite people</Text>
  <Text tone="muted">They get an email with a link.</Text>
  <Button tone="brand">Send invites</Button>
</Stack>`,
      render: () => h("div", {style: {width: "min(22rem, 100%)"}}, h(Stack, null,
        h(Text, {weight: 600}, "Invite people"), h(Text, {tone: "muted"}, "They get an email with a link."),
        h(Button, {tone: "brand"}, "Send invites"))),
    },
    cada({titulo: "Align", descricao: "The Button follows its parent: here is where a column says \"as wide as the text\" (start) or \"in the middle\" (center).",
      valores: ["start", "center", "end", "stretch"], estilo: grade,
      codigo: v => `<Stack align="${v}">\n  <Button>Save</Button>\n  <Button appearance="outline">Cancel</Button>\n</Stack>`,
      peca: v => h(Card, {variant: "inset"}, h(Stack, {align: v},
        h(Button, null, "Save"), h(Button, {appearance: "outline"}, "Cancel")))}),
  ],
};
