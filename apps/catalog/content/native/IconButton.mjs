// O IconButton do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo.
import {createElement as h, useState} from "react";
import {IconButton} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};

// O `pressed` só ANUNCIA o estado; quem guarda e pinta é o app.
function Favorito() {
  const [on, setOn] = useState(false);
  return h(IconButton, {name: "star", label: "Favourite", pressed: on,
    appearance: on ? "solid" : "ghost", tone: on ? "brand" : "neutral", onPress: () => setOn(v => !v)});
}

export default {
  install: 'import {IconButton} from "@aurea-uds/native";',
  api: {
    name: "The glyph: a name from the icon registry, or the drawing itself (AureaIcon).",
    appearance: "How much weight the circle carries: solid, outline, or ghost (the default).",
    size: "The touch scale: the circle is as high as the Button of the same size, and the target is never under 44.",
    leading: "Inherited from Button's type. The icon button draws only its glyph, so it does not draw this.",
    trailing: "Inherited from Button's type. The icon button draws only its glyph, so it does not draw this.",
    icons: "A local icon registry, when there is none in context — or to override the provider's.",
    pressed: "Toggle state, announced to the screen reader as checked. It paints nothing by itself: change the appearance or the tone with it.",
    share: "The button shares {url, title, text}. On a phone it opens the system share sheet; in the browser it follows the web rule — share where the browser can, otherwise copy the link and say \"Link copied\" through the ToastHost.",
    label: "REQUIRED. The name the screen reader announces: an icon alone says nothing to whoever does not see it.",
  },
  examples: [
    {
      title: "Usage",
      description: "A round button with a glyph and no text, so the label is required.",
      code: `<IconButton name="pencil-simple" label="Edit" onPress={edit} />
<IconButton name="share-network" label="Share" appearance="outline" onPress={share} />
<IconButton name="trash" label="Delete" tone="danger" onPress={remove} />`,
      render: () => h("div", {style: linha},
        h(IconButton, {name: "pencil-simple", label: "Edit"}),
        h(IconButton, {name: "share-network", label: "Share", appearance: "outline"}),
        h(IconButton, {name: "trash", label: "Delete", tone: "danger"})),
    },
    cada({titulo: "Appearances", descricao: "ghost is the default: the bare glyph. outline adds the soft fill, solid the full one.",
      valores: ["solid", "outline", "ghost"],
      codigo: v => `<IconButton appearance="${v}" name="star" label="Favourite (${v})" />`,
      peca: v => h(IconButton, {appearance: v, name: "star", label: `Favourite (${v})`})}),
    cada({titulo: "Tones", descricao: "What the colour means; every tone works with every appearance.",
      valores: ["neutral", "brand", "info", "success", "warning", "danger"],
      codigo: v => `<IconButton tone="${v}" appearance="solid" name="bell" label="Alerts (${v})" />`,
      peca: v => h(IconButton, {tone: v, appearance: "solid", name: "bell", label: `Alerts (${v})`})}),
    cada({titulo: "Sizes", descricao: "The touch scale. The target is never under 44, even where the circle is smaller.",
      valores: ["xs", "sm", "md", "lg", "xl"],
      codigo: v => `<IconButton size="${v}" appearance="outline" name="plus" label="Add (${v})" />`,
      peca: v => h(IconButton, {size: v, appearance: "outline", name: "plus", label: `Add (${v})`})}),
    {
      title: "A toggle",
      description: "pressed announces the state; the app keeps it and changes the look with it.",
      code: `const [on, setOn] = useState(false);

<IconButton
  name="star"
  label="Favourite"
  pressed={on}
  appearance={on ? "solid" : "ghost"}
  tone={on ? "brand" : "neutral"}
  onPress={() => setOn(v => !v)}
/>`,
      render: () => h(Favorito),
    },
    {
      title: "Sharing",
      description: "share turns the button into the share action. In this browser, a tap shares where the browser can, and copies the link where it cannot.",
      code: `<IconButton name="share-network" label="Share the report"
  share={{url: "https://example.com/report", title: "Weekly report"}} />`,
      render: () => h(IconButton, {name: "share-network", label: "Share the report",
        share: {url: "https://example.com/report", title: "Weekly report"}}),
    },
  ],
};
