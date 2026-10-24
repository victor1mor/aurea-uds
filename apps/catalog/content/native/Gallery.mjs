// A Gallery do nativo no site (bloco 1, o 5-A — 23/10/2026). O tipo não tem lista fechada de valores; os exemplos mostram
// a escolha, a foto grande e a proporção. As fotos são SVG em data URI, como as da web (`_starters.mjs`): o site é gerado
// e um exemplo que busca bytes na rede não sobrevive a uma máquina sem rede.
import {createElement as h, useState} from "react";
import {Gallery} from "../../../../packages/native/dist/index.js";

const foto = (fundo, forma) => "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">'
  + `<rect width="300" height="200" fill="${fundo}"/>${forma}</svg>`);
const FOTOS = [
  {id: "front", alt: "Front", source: foto("#3f3f46", '<circle cx="150" cy="100" r="54" fill="#eab308"/>')},
  {id: "back", alt: "Back", source: foto("#57534e", '<rect x="96" y="46" width="108" height="108" rx="22" fill="#d6d3d1"/>')},
  {id: "inuse", alt: "In use", source: foto("#52525b", '<circle cx="110" cy="100" r="40" fill="#e4e4e7"/><circle cx="190" cy="100" r="40" fill="#eab308"/>')},
  {id: "packaging", alt: "Packaging", source: foto("#18181b", '<rect x="70" y="60" width="160" height="80" rx="22" fill="#71717a"/>')},
];
const COM_LEGENDA = FOTOS.map((f) => ({...f, caption: f.alt}));
const largura = {width: "min(100%, 36rem)"};

function Escolher({zoom, items = COM_LEGENDA}) {
  const [selected, setSelected] = useState("back");
  return h("div", {style: largura}, h(Gallery, {label: "Product photos", items, selected, onSelect: setSelected, zoom}));
}

export default {
  install: 'import {Gallery} from "@aurea-uds/native";',
  api: {
    items: "The pictures, as data: {id, source, alt, caption?}. source is a URL or a require(). With a caption, the tile carries the name and the picture leaves the accessibility tree, so the screen reader does not say it twice; the alt still names the enlarged picture.",
    label: "Accessible name of the grid. Without it, the provider's galleryLabel sentence.",
    onSelect: "Called with the id on a tap. Without it and without zoom, the tiles are not buttons at all.",
    zoom: "A tap also enlarges the picture in the Dialog, uncropped, with the caption (or the alt) as its title.",
    ratio: "Aspect ratio of every tile, passed to Image: a number or text like \"16/9\". 1, square, by default.",
    minTileWidth: "Minimum width of a tile, in dp: the grid fits as many columns as it can. 128 by default — the web's 8rem.",
    style: "Style of the grid.",
    testID: "Test id of the grid; each tile gets -<id>.",
  },
  examples: [
    {
      title: "Usage",
      description: "The gallery keeps no choice of its own: selected comes from the app, and onSelect asks to change it.",
      code: `const [chosen, setChosen] = useState("back");

<Gallery
  label="Product photos"
  items={photos}
  selected={chosen}
  onSelect={setChosen}
  zoom
/>`,
      render: () => h(Escolher, {zoom: true}),
    },
    {
      title: "Only to look at",
      description: "Without onSelect and without zoom the tiles are not targets: a button that does nothing lies to whoever navigates by screen reader.",
      code: `<Gallery label="Product photos" items={photos} />`,
      render: () => h("div", {style: largura}, h(Gallery, {label: "Product photos", items: COM_LEGENDA})),
    },
    {
      title: "Without captions",
      description: "With no caption, each tile is named by its alt.",
      code: `<Gallery label="Product photos" items={[
  {id: "front", source: front, alt: "Front"},
  {id: "back", source: back, alt: "Back"},
]} zoom />`,
      render: () => h("div", {style: largura}, h(Gallery, {label: "Product photos", items: FOTOS, zoom: true})),
    },
    {
      title: "Ratio and tile width",
      description: "ratio shapes every tile; minTileWidth sets how narrow a tile can get before the grid drops a column.",
      code: `<Gallery label="Product photos" items={photos} ratio="16/9" minTileWidth={200} />`,
      render: () => h("div", {style: largura}, h(Gallery, {label: "Product photos", items: COM_LEGENDA, ratio: "16/9", minTileWidth: 200})),
    },
  ],
};
