// O Separator do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo.
import {createElement as h} from "react";
import {View} from "react-native";
import {Button, Separator, Stack, Text} from "../../../../packages/native/dist/index.js";

const largo = {width: "min(24rem, 100%)"};

export default {
  install: 'import {Separator} from "@aurea-uds/native";',
  api: {
    orientation: "horizontal is a full-width hairline; vertical is a 1-wide column that stretches to the tallest sibling, at least 20 high.",
    label: "A text in the middle of the line — \"or continue with\" on a sign-in screen. Native only; with a label the line is always horizontal.",
  },
  description: "A rule between things, in the border colour. It has no accessibility role: React Native has no separator role, and a decorative line stays silent.",
  examples: [
    {
      title: "Usage",
      code: `<Stack>
  <Text>Profile</Text>
  <Separator />
  <Text>Security</Text>
</Stack>`,
      render: () => h("div", {style: largo}, h(Stack, null, h(Text, null, "Profile"), h(Separator), h(Text, null, "Security"))),
    },
    {
      title: "Orientation",
      description: "horizontal between blocks of a column; vertical between groups of a row.",
      code: `<Separator orientation="horizontal" />

<View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
  <Text>Draft</Text>
  <Separator orientation="vertical" />
  <Text>Edited 2 min ago</Text>
</View>`,
      render: () => h("div", {style: {...largo, display: "grid", gap: "var(--space-4)"}},
        h(Separator, {orientation: "horizontal"}),
        h(View, {style: {flexDirection: "row", alignItems: "center", gap: 12}},
          h(Text, null, "Draft"), h(Separator, {orientation: "vertical"}), h(Text, null, "Edited 2 min ago"))),
    },
    {
      title: "With a label",
      description: "The text sits in the middle and the two halves stretch.",
      code: `<Stack>
  <Button tone="brand">Sign in</Button>
  <Separator label="or continue with" />
  <Button appearance="outline">Email link</Button>
</Stack>`,
      render: () => h("div", {style: largo}, h(Stack, null,
        h(Button, {tone: "brand"}, "Sign in"), h(Separator, {label: "or continue with"}),
        h(Button, {appearance: "outline"}, "Email link"))),
    },
  ],
};
