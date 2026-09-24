// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {MediaPlayer} from "../../../../packages/react/dist/media.js";

export default [
  {
    variant: "Video",
    name: "A clip with its title on the frame",
    description: "Title and subtitle ride on the player instead of above it, so the frame is self-contained wherever it is embedded. Every control is reachable by keyboard and announced from the string dictionary, which is what makes the player translatable.",
    uses: ["MediaPlayer"],
    code: `<MediaPlayer
  kind="video"
  title="Aurea in ninety seconds"
  subtitle="Product tour · 1:30"
  poster="/poster.jpg"
  src="/tour.mp4"
/>`,
    render: () => h("div", {style: {width: "min(520px,100%)", "--media-h": "280px"}}, h(MediaPlayer, {
      kind: "video", title: "Aurea in ninety seconds", subtitle: "Product tour · 1:30"})),
  },
  {
    variant: "Audio",
    name: "An episode, without the video frame",
    description: "The same player with kind=\"audio\": no picture area, the controls carry the whole component. Reaching for a second component here would double the keyboard surface for no gain.",
    uses: ["MediaPlayer"],
    code: `<MediaPlayer kind="audio" title="Episode 12 · Design tokens" subtitle="42:10" src="/ep12.mp3" />`,
    render: () => h("div", {style: {width: "min(520px,100%)", "--media-h": "280px"}}, h(MediaPlayer, {
      kind: "audio", title: "Episode 12 · Design tokens", subtitle: "42:10"})),
  },
];
