// A SONDA DE TIPO do traço na `criarGlifo` — R-05, 24/09/2026. Compilada pelo `tsc` de verdade
// (`native-consumidores-lote4.test.tsx` compila esta pasta inteira). No tipo antigo o traço não
// existia, e este arquivo não compilava.
import {criarGlifo} from "../../../packages/native/src/index.js";

export const logo = criarGlifo({
  fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
  circles: [{cx: 16, cy: 16, r: 12, strokeWidth: 3}],
  paths: [{d: "M8 16h16", stroke: "#ff0000"}],
});

// @ts-expect-error — o acabamento é uma lista fechada, como no SVG
export const mau = criarGlifo({stroke: "currentColor", strokeLinecap: "redondo", paths: ["M0 0"]});
