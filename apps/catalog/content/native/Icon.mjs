// O Icon do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// Os glifos vêm do registro que o provedor do site recebe (`nativo/icones.mjs`), como num app.
import {createElement as h} from "react";
import {Icon, criarGlifo, useAureaTokens} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-4)"};

// Um desenho do próprio app, sem registro: o losango de quatro pontas.
const Brilho = criarGlifo({paths: ["M16 3 L19.5 12.5 L29 16 L19.5 19.5 L16 29 L12.5 19.5 L3 16 L12.5 12.5 Z"]});

// A cor é um valor: a do tema vem dos tokens, porque no React Native não há `currentColor`.
function Cores() {
  const t = useAureaTokens();
  return h("div", {style: linha},
    h(Icon, {name: "heart", weight: "fill", color: t.color.danger400, label: "Liked"}),
    h(Icon, {name: "star", weight: "fill", color: t.color.primary, label: "Starred"}),
    h(Icon, {name: "info", color: t.color.mutedForeground, label: "About"}));
}

export default {
  install: 'import {Icon} from "@aurea-uds/native";',
  description: "Draws a glyph from the icon registry the app gives AureaProvider — only the glyphs the app imports go into its bundle. Without a label it is decorative and leaves the accessibility tree.",
  api: {
    name: "A glyph name from the icon registry (the one AureaProvider receives), or the drawing itself (an AureaIcon component). A name not in the registry draws nothing and warns in development.",
    size: "sm (16), md (20, the default), lg (24), xl (32), or a number in dp.",
    weight: "fill draws the filled form — the key <name>-fill in the registry, the one the chosen item uses (ADR-0053). bold is the key <name>-bold; today only x has it. Without the key in the registry, the regular glyph draws.",
    color: "The colour, as a value. The default is the theme's text colour: React Native has no currentColor and no cascade.",
    icons: "A local registry, for when there is none in context — or to replace the provider's for this icon.",
    label: "What the screen reader says. Without it the icon is decorative and leaves the accessibility tree — right when a text beside it says the same.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Icon name="house" />
<Icon name="bell" label="Notifications" />`,
      render: () => h("div", {style: linha}, h(Icon, {name: "house"}), h(Icon, {name: "bell", label: "Notifications"})),
    },
    cada({titulo: "Sizes", descricao: "The glyph scale of the tokens, from 16 to 32 — or any number.",
      valores: ["sm", "md", "lg", "xl", 40], estilo: linha,
      codigo: v => typeof v === "number" ? `<Icon name="star" size={${v}} />` : `<Icon name="star" size="${v}" />`,
      peca: v => h(Icon, {name: "star", size: v})}),
    cada({titulo: "Weights", descricao: "regular is the line; fill the filled form, for the chosen item; bold the thick stroke, which today only the x has.",
      valores: ["regular", "fill", "bold"], estilo: linha,
      codigo: v => v === "bold" ? `<Icon name="x" weight="bold" />` : `<Icon name="star" weight="${v}" />`,
      peca: v => h(Icon, {name: v === "bold" ? "x" : "star", weight: v})}),
    {
      title: "Colour",
      description: "The colour is a value. Read it from the theme with useAureaTokens, so it follows light and dark.",
      code: `const t = useAureaTokens();
<Icon name="heart" weight="fill" color={t.color.danger400} label="Liked" />
<Icon name="star" weight="fill" color={t.color.primary} label="Starred" />
<Icon name="info" color={t.color.mutedForeground} label="About" />`,
      render: () => h(Cores),
    },
    {
      title: "Your own drawing",
      description: "name also takes the drawing itself — here one made with criarGlifo, with no registry at all.",
      code: `const Sparkle = criarGlifo({paths: ["M16 3 L19.5 12.5 L29 16 L19.5 19.5 L16 29 L12.5 19.5 L3 16 L12.5 12.5 Z"]});
<Icon name={Sparkle} size="lg" label="New" />`,
      render: () => h("div", {style: linha}, h(Icon, {name: Brilho, size: "lg", label: "New"})),
    },
  ],
};
