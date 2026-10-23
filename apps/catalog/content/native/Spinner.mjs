// O Spinner do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. A página parada
// mostra o anel quieto; ele gira quando a parte viva acende, e para se a pessoa pediu menos movimento.
import {createElement as h} from "react";
import {View} from "react-native";
import {Spinner, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

export default {
  install: 'import {Spinner} from "@aurea-uds/native";',
  api: {
    size: "16, 24 or 32 — the reference's native scale. md, 24, is the default.",
    label: "What is being waited for, announced by the screen reader. Without it, the provider's loading sentence.",
    decorative: "Hides it from the screen reader. Use it only when text beside it already says the same.",
    style: "Style of the spinner's box.",
    testID: "Test id of the spinner.",
  },
  examples: [
    {
      title: "Usage",
      description: "A wait with no known end. It turns in 700 ms, linear, and stops when the person asked for less motion — the ring stays drawn.",
      code: `<Spinner label="Loading the report" />`,
      render: () => h(Spinner, {label: "Loading the report"}),
    },
    cada({titulo: "Sizes", descricao: "Three steps: sm 16, md 24, lg 32.",
      valores: ["sm", "md", "lg"],
      codigo: v => `<Spinner size="${v}" label="Loading (${v})" />`,
      peca: v => h(Spinner, {size: v, label: `Loading (${v})`})}),
    {
      title: "Beside a text",
      description: "When the text next to it says the same, the spinner is decorative: the screen reader reads the sentence once.",
      code: `<View style={{flexDirection: "row", alignItems: "center", gap: 8}}>
  <Spinner size="sm" decorative />
  <Text>Syncing 3 files…</Text>
</View>`,
      render: () => h(View, {style: {flexDirection: "row", alignItems: "center", gap: 8}},
        h(Spinner, {size: "sm", decorative: true}), h(Text, null, "Syncing 3 files…")),
    },
  ],
};
