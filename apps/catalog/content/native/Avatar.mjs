// O Avatar do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
import {createElement as h} from "react";
import {Avatar, Icon} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

// A "foto" é um desenho em data URI, como as do site: a página não busca imagem na rede.
const FOTO = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">'
  + '<rect width="96" height="96" fill="#3f3f46"/>'
  + '<circle cx="48" cy="38" r="18" fill="#eab308"/>'
  + '<rect x="18" y="62" width="60" height="40" rx="30" fill="#eab308"/></svg>');

const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};

export default {
  install: 'import {Avatar} from "@aurea-uds/native";',
  api: {
    source: "The picture: a URL or a require() of a local asset, the two forms of the React Native Image. If it fails to load, the fallback shows, and it tries again when source changes.",
    alt: "What the screen reader says. Empty by default, which makes the avatar decorative — right when the name is already beside it.",
    size: "sm is 40, md 48 and lg 64 — the touch scale of the native package.",
    style: "Added after the Aurea skin.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Avatar source={photo} alt="Ana Souza" />
<Avatar fallback="AS" />`,
      render: () => h("div", {style: linha}, h(Avatar, {source: FOTO, alt: "Ana Souza"}), h(Avatar, {fallback: "AS"})),
    },
    cada({titulo: "Sizes", descricao: "40, 48 and 64: the same steps on the picture and on the initials.",
      valores: ["sm", "md", "lg"],
      codigo: v => `<Avatar size="${v}" source={photo} alt="Ana Souza" />\n<Avatar size="${v}" fallback="AS" />`,
      peca: v => h("div", {style: linha}, h(Avatar, {size: v, source: FOTO, alt: `Ana Souza (${v})`}), h(Avatar, {size: v, fallback: "AS"}))}),
    {
      title: "Fallback",
      description: "What shows with no picture, or when it fails: initials as text, or any element — here an icon.",
      code: `<Avatar fallback="AS" alt="Ana Souza" />
<Avatar fallback={<Icon name="user" />} alt="Guest" />`,
      render: () => h("div", {style: linha},
        h(Avatar, {fallback: "AS", alt: "Ana Souza"}), h(Avatar, {fallback: h(Icon, {name: "user"}), alt: "Guest"})),
    },
  ],
};
