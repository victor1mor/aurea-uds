// O Button do nativo no site (bloco 1, o 5-A — 23/10/2026): a mesma página da web, com a peça do `@aurea-uds/native`
// rodando pelo `react-native-web`. Os exemplos mostram todo valor das props do tipo (`api-surface-native.json`).
import {createElement as h} from "react";
import {View} from "react-native";
import {Button} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const linha = {flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12};
const emLinha = (filhos) => h(View, {style: linha}, ...filhos);

export default {
  install: 'import {Button} from "@aurea-uds/native";',
  examples: [
    {
      title: "Usage",
      code: `<Button tone="brand" onPress={save}>Save</Button>
<Button appearance="outline" onPress={edit}>Edit</Button>
<Button appearance="ghost" onPress={cancel}>Cancel</Button>`,
      render: () => emLinha([
        h(Button, {key: 1, tone: "brand"}, "Save"),
        h(Button, {key: 2, appearance: "outline"}, "Edit"),
        h(Button, {key: 3, appearance: "ghost"}, "Cancel")]),
    },
    {
      title: "Appearances",
      description: "How much weight the capsule carries: the fill, the contour, or the bare label.",
      code: ["solid", "outline", "ghost"].map(v => `<Button appearance="${v}">${v}</Button>`).join("\n"),
      render: () => emLinha(["solid", "outline", "ghost"].map(v => h(Button, {key: v, appearance: v}, v))),
    },
    {
      title: "Tones",
      description: "What the colour means; every tone works with every appearance.",
      code: ["neutral", "brand", "info", "success", "warning", "danger"].map(v => `<Button tone="${v}">${v}</Button>`).join("\n"),
      render: () => emLinha(["neutral", "brand", "info", "success", "warning", "danger"].map(v => h(Button, {key: v, tone: v}, v))),
    },
    {
      title: "Sizes",
      description: "The touch scale: every size keeps a 44 target.",
      code: ["xs", "sm", "md", "lg", "xl"].map(v => `<Button size="${v}">${v}</Button>`).join("\n"),
      render: () => emLinha(["xs", "sm", "md", "lg", "xl"].map(v => h(Button, {key: v, size: v}, v))),
    },
  ],
};
// `cada` fica para os exemplos que mudam mais de uma prop por valor.
void cada;
