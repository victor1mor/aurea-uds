// O CloseButton do nativo no site (bloco 1, o 5-A — 23/10/2026): o botão de fechar do `@aurea-uds/native` rodando pelo
// `react-native-web`. A peça não tem variação de lista fechada; os exemplos mostram o nome, o desligado e o X trocado.
import {createElement as h} from "react";
import {CloseButton, Icon} from "../../../../packages/native/dist/index.js";

const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-4)"};

export default {
  install: 'import {CloseButton} from "@aurea-uds/native";',
  description: "The round close button: a 40 circle on the neutral fill with a 20 X in the Bold stroke, already named \"Close\". Its touch area reaches 12 past the circle on every side.",
  api: {
    onPress: "Called on the touch.",
    disabled: "Dims the button; the touch does nothing and it is announced as disabled.",
    icons: "A local icon registry, for when the provider's has no X.",
    children: "Replaces the X. Keep it a 20 glyph, the size of the X.",
    testID: "Test id of the button.",
  },
  examples: [
    {
      title: "Usage",
      code: `<CloseButton onPress={close} />`,
      render: () => h(CloseButton, {onPress: () => {}}),
    },
    {
      title: "Say what it closes",
      description: "With more than one on the screen, the name says which: \"Close notice\", not three \"Close\".",
      code: `<CloseButton label="Close notice" onPress={closeNotice} />
<CloseButton label="Close filters" onPress={closeFilters} />`,
      render: () => h("div", {style: linha},
        h(CloseButton, {label: "Close notice", onPress: () => {}}),
        h(CloseButton, {label: "Close filters", onPress: () => {}})),
    },
    {
      title: "Disabled",
      code: `<CloseButton disabled />`,
      render: () => h(CloseButton, {disabled: true}),
    },
    {
      title: "Another glyph",
      description: "children replaces the X; the circle, the touch area and the name stay.",
      code: `<CloseButton label="Back" onPress={back}>
  <Icon name="arrow-left" size="md" />
</CloseButton>`,
      render: () => h(CloseButton, {label: "Back", onPress: () => {}}, h(Icon, {name: "arrow-left", size: "md"})),
    },
  ],
};
