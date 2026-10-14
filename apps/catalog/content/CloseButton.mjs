import {createElement as h} from "react";
import {CloseButton, Card, Text} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};

export default {
  description:
    "CloseButton is the small round button that closes a notice, a panel or a dialog: a 24 circle " +
    "on the neutral fill with a 16 X in the Bold stroke. It names itself — \"Close\", or \"Fechar\" " +
    "with the Portuguese strings — so a bare `<CloseButton />` is never a mute control.",

  install: 'import {CloseButton} from "@aurea-uds/react";',

  features: [
    "The accessible name comes by itself; pass `label` to say what closes when a screen has more than one.",
    "A 24 circle with a 16 glyph, so it sits in a title row without making it taller.",
    "On touch the circle stays 24 and the target grows to 44 around it, invisibly.",
    "Darkens on hover and shrinks a little when pressed, like every Aurea button.",
    "`children` replaces the X when a closing action needs another glyph.",
  ],

  examples: [
    {
      title: "Default",
      description: "The X on the neutral fill. The name is \"Close\" without passing anything.",
      code: "<CloseButton onClick={close} />",
      render: () => h("div", {style: row}, h(CloseButton, null)),
    },
    {
      title: "In a title row",
      description: "At the end of a card's title row. The `label` says what closes.",
      code: [
        "<Card>",
        '  <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>',
        "    <strong>Backup finished</strong>",
        '    <CloseButton label="Close notice" onClick={close} />',
        "  </div>",
        "  <Text color=\"muted\">Photos were saved at 22:40.</Text>",
        "</Card>",
      ].join("\n"),
      render: () => h(Card, {style: {maxWidth: "22rem"}},
        h("div", {style: {display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)"}},
          h("strong", null, "Backup finished"),
          h(CloseButton, {label: "Close notice"})),
        h(Text, {color: "muted"}, "Photos were saved at 22:40.")),
    },
    {
      title: "Disabled",
      description: "When closing is not possible yet — while a save is still running, for example.",
      code: "<CloseButton disabled />",
      render: () => h("div", {style: row}, h(CloseButton, {disabled: true})),
    },
  ],
};
