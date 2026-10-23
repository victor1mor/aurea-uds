// O Image do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. As fotos são SVG em
// data URI, como as da web (`_starters.mjs`). O estado quebrado fica de fora, como lá: um endereço que não existe vira
// erro no console da página.
import {createElement as h} from "react";
import {Image} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

// 3:2 de propósito, para as caixas de 16/9 e 1/1 terem o que cortar.
const FOTO = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">'
  + '<rect width="300" height="200" fill="#3f3f46"/>'
  + '<circle cx="150" cy="100" r="54" fill="#eab308"/></svg>');
// A "captura" de uma tela de app para a moldura de celular, em pé, uma clara e uma escura.
const tela = (fundo, cartao, linha) => "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="390">'
  + `<rect width="180" height="390" fill="${fundo}"/>`
  + `<rect x="14" y="40" width="96" height="14" rx="7" fill="${linha}"/>`
  + `<rect x="14" y="70" width="152" height="70" rx="14" fill="${cartao}"/>`
  + `<rect x="14" y="152" width="152" height="150" rx="14" fill="${cartao}"/>`
  + `<rect x="14" y="316" width="152" height="24" rx="12" fill="#eab308"/></svg>`);
const TELA_CLARA = tela("#f5f5f5", "#ffffff", "#242424");
const TELA_ESCURA = tela("#1f1f1f", "#292929", "#ffffff");

const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(12rem, 1fr))", gap: "var(--space-3)", width: "min(30rem, 100%)", alignItems: "start"};

export default {
  install: 'import {Image} from "@aurea-uds/native";',
  api: {
    source: "A URL or a require() of a local asset — the two forms of React Native's Image.",
    alt: "REQUIRED. The accessible name; it survives the fallback, which is still the image for the screen reader. alt=\"\" marks a decorative picture, and it leaves the tree.",
    ratio: "The reserved box: a number (16 / 9) or text, \"16/9\" or \"16:9\". Without it, the image takes the height the style gives.",
    fallback: "What shows in the reserved box when the bitmap never arrives. Without it, the image glyph.",
    fallbackIcon: "The glyph of the fallback, image by default. Register it, or pass false.",
    render: "Draws another image component with our skin — expo-image, for its disk cache. It receives source, style, onError and the accessible name; fit is not translated for it, so write its own prop (contentFit).",
    onError: "Called when the bitmap fails, as the fallback takes its place. A new source gets a new try.",
    sourceDark: "The capture for the dark theme: in the dark theme this one shows, in the light one, source.",
    style: "Style of the box — of the frame, with frame=\"phone\".",
    testID: "Test id of the image (of the frame, with frame).",
  },
  examples: [
    {
      title: "Usage",
      description: "The box is reserved and painted before the bytes arrive, so nothing jumps when the picture lands.",
      code: `<Image source="https://…/front.jpg" alt="The product, from the front" ratio="16/9" />`,
      render: () => h("div", {style: {width: "min(24rem, 100%)"}},
        h(Image, {source: FOTO, alt: "The product, from the front", ratio: "16/9"})),
    },
    cada({titulo: "Fit", descricao: "cover fills the box and crops; contain shows the whole picture inside it and drops the background.",
      valores: ["cover", "contain"], estilo: grade,
      codigo: v => `<Image source={photo} alt="The product (${v})" ratio="1/1" fit="${v}" />`,
      peca: v => h(Image, {source: FOTO, alt: `The product (${v})`, ratio: "1/1", fit: v})}),
    {
      title: "Ratio",
      description: "The web writes the ratio as text; React Native wants a number. Both work here.",
      code: `<Image source={photo} alt="Wide" ratio="21:9" />
<Image source={photo} alt="Portrait" ratio={4 / 5} />`,
      render: () => h("div", {style: grade},
        h(Image, {source: FOTO, alt: "Wide", ratio: "21:9"}),
        h(Image, {source: FOTO, alt: "Portrait", ratio: 4 / 5})),
    },
    {
      title: "In a phone frame",
      description: "frame=\"phone\" puts the capture in a generic phone frame — no island, notch or buttons. sourceDark swaps the capture in the dark theme: switch the site's theme to see it.",
      code: `<Image source={homeLight} sourceDark={homeDark} alt="The app's home screen"
  frame="phone" style={{width: 160}} />`,
      render: () => h(Image, {source: TELA_CLARA, sourceDark: TELA_ESCURA, alt: "The app's home screen",
        frame: "phone", style: {width: 160}}),
    },
  ],
};
