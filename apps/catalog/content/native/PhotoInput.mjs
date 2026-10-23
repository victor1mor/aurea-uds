// O PhotoInput do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// No aparelho, o toque pede a câmera ou a galeria ao sistema (expo-image-picker); no navegador, a biblioteca abre o
// seletor de arquivos do navegador (no celular, com a câmera). Cada exemplo guarda as próprias fotos.
import {createElement as h, useState} from "react";
import {Field, Text} from "../../../../packages/native/dist/index.js";
import {PhotoInput} from "../../../../packages/native/dist/sistema.js";
import {cada} from "../_eixos.mjs";

// As "fotos" são desenhos em data URI, como as do site: a página não busca imagem na rede.
const foto = (fundo, sol) => ({uri: "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">'
  + `<rect width="300" height="200" fill="${fundo}"/><circle cx="150" cy="100" r="54" fill="${sol}"/></svg>`),
  width: 300, height: 200});
const FOTOS = [foto("#3f3f46", "#eab308"), foto("#27272a", "#a1a1aa")];
const coluna = {display: "grid", gap: "var(--space-4)", justifyItems: "start"};

// O anexo com as fotos guardadas aqui: `props` vão para o PhotoInput, `rotulo` para o Field.
function Campo({rotulo, inicio = [], props}) {
  const [fotos, setFotos] = useState(inicio);
  return h(Field, {label: rotulo}, h(PhotoInput, {value: fotos, onChange: setFotos, ...props}));
}

// Com `exif`, a data em que a foto foi tirada chega em `takenAt`.
function ComData() {
  const [fotos, setFotos] = useState([]);
  const datas = fotos.map((f) => f.takenAt ? f.takenAt.toLocaleString("en-GB") : "no date in the file");
  return h("div", {style: coluna},
    h(Field, {label: "Site photos"}, h(PhotoInput, {value: fotos, onChange: setFotos, source: "library", max: 3, exif: true})),
    fotos.length > 0 && h(Text, {size: "xs", tone: "muted"}, `Taken: ${datas.join(" · ")}`));
}

export default {
  install: 'import {PhotoInput} from "@aurea-uds/native/system";',
  description: "The photo attachment: a button that asks the phone for the camera or the gallery, and square thumbnails that open the photo large and have an X to remove it. It lives in @aurea-uds/native/system, with expo-image-picker as an optional peer.",
  api: {
    value: "The photos, controlled: an array of {uri, width?, height?, takenAt?}.",
    onChange: "Called with the whole new array, after adding or removing.",
    max: "How many photos fit. 1 by default. The add button goes away at the limit, instead of staying lit and doing nothing.",
    source: "camera (the default) or library, the gallery. From the gallery several photos come at once when more than one fits. For both, draw two PhotoInputs.",
    disabled: "Nothing is added or removed; a photo still opens, because looking changes nothing.",
    offerSettings: "When the camera was denied for good, the warning offers a button to the app's settings. On by default. The browser always grants, so it never shows here.",
    onPermissionDenied: "Called when the camera permission is denied — to tell a story of your own.",
    exif: "Reads from the EXIF the date the photo was taken and hands it in takenAt. Off by default: reading it costs. The browser version of the picker has no EXIF, so takenAt stays empty here.",
    addIcon: "The glyph of the add button, camera by default; false removes it.",
    removeIcon: "The glyph of the X on each thumbnail, x by default.",
    style: "Added to the outer box.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [photos, setPhotos] = useState([]);
<Field label="Receipt">
  <PhotoInput value={photos} onChange={setPhotos} />
</Field>`,
      render: () => h(Campo, {rotulo: "Receipt"}),
    },
    cada({titulo: "Sources", descricao: "camera asks for the camera; library opens the gallery. In the browser both open the file picker — on a phone, camera opens the camera.",
      valores: ["camera", "library"], estilo: coluna,
      codigo: v => `<Field label="source ${v}">\n  <PhotoInput source="${v}" value={photos} onChange={setPhotos} max={3} />\n</Field>`,
      peca: v => h(Campo, {rotulo: `source ${v}`, props: {source: v, max: 3}})}),
    {
      title: "Several photos",
      description: "With max above one, the thumbnails line up. A tap on a thumbnail opens the photo large; the X removes it.",
      code: `<Field label="Damage">
  <PhotoInput value={photos} onChange={setPhotos} max={3} />
</Field>`,
      render: () => h(Campo, {rotulo: "Damage", inicio: FOTOS, props: {max: 3}}),
    },
    {
      title: "When it was taken",
      description: "exif hands the date the photo was taken in takenAt. On a phone it comes from the file; the browser picker reads no EXIF, so here the date stays empty.",
      code: `<Field label="Site photos">
  <PhotoInput value={photos} onChange={setPhotos} source="library" max={3} exif />
</Field>
{photos.map((p) => p.takenAt?.toLocaleString())}`,
      render: () => h(ComData),
    },
    {
      title: "Disabled",
      description: "The add button and the X do not respond; the photo still opens.",
      code: `<Field label="Receipt (disabled)">
  <PhotoInput value={photos} max={2} disabled />
</Field>`,
      render: () => h(Campo, {rotulo: "Receipt (disabled)", inicio: FOTOS.slice(0, 1), props: {max: 2, disabled: true}}),
    },
  ],
};
