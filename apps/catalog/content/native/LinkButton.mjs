// O LinkButton do nativo no site (bloco 1, o 5-A — 23/10/2026): o botão-texto que encosta na margem, rodando pelo
// `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {LinkButton, Stack, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const TONS = ["neutral", "brand", "info", "success", "warning", "danger"];
const TAMANHOS = ["xs", "sm", "md", "lg", "xl"];

export default {
  install: 'import {LinkButton} from "@aurea-uds/native";',
  description: "A text button with no box and no inset, lined up with the text around it. The drawing loses the padding; the touch target keeps its 44 height.",
  api: {
    children: "The label.",
    tone: "What the colour means, as on the Button. There is no appearance: it is always the bare label — for a box, use the Button.",
    size: "The touch scale, as on the Button; the target stays at least 44 tall.",
    leadingIcon: "A glyph before the label, by name or as your own drawing.",
    trailingIcon: "A glyph after the label.",
    leading: "Your own node before the label — a logo, which it does not tint.",
    trailing: "Your own node after the label.",
    icons: "A local icon registry, for when the provider's lacks a glyph.",
    pressed: "The state of a toggle, announced to the screen reader.",
    share: "What to share on the touch: {url?, title?, text?}. On a phone it opens the system share sheet.",
  },
  examples: [
    {
      title: "Usage",
      description: "Like every Button it follows its parent: in a column that stretches it goes to the middle, so against the margin it sits in a Stack with align=\"start\".",
      code: `<Stack align="start">
  <Text tone="muted">Did not find your car?</Text>
  <LinkButton tone="brand" onPress={addByHand}>Add it by hand</LinkButton>
</Stack>`,
      render: () => h(Stack, {align: "start"},
        h(Text, {tone: "muted"}, "Did not find your car?"),
        h(LinkButton, {tone: "brand", onPress: () => {}}, "Add it by hand")),
    },
    cada({titulo: "Tones", descricao: "What the colour means.",
      valores: TONS, codigo: v => `<LinkButton tone="${v}">${v}</LinkButton>`, peca: v => h(LinkButton, {tone: v}, v)}),
    cada({titulo: "Sizes", descricao: "The letter follows the step; the touch target stays at least 44 tall.",
      valores: TAMANHOS, codigo: v => `<LinkButton size="${v}">${v}</LinkButton>`, peca: v => h(LinkButton, {size: v}, v)}),
    {
      title: "With a glyph",
      code: `<LinkButton leadingIcon="arrow-left" onPress={back}>Back to the list</LinkButton>
<LinkButton tone="brand" trailingIcon="arrow-right" onPress={next}>See every plan</LinkButton>`,
      render: () => h("div", {style: {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-4)"}},
        h(LinkButton, {leadingIcon: "arrow-left", onPress: () => {}}, "Back to the list"),
        h(LinkButton, {tone: "brand", trailingIcon: "arrow-right", onPress: () => {}}, "See every plan")),
    },
  ],
};
