// GERADO por packages/native/build-icons-native.mjs. NÃO EDITAR.
// Glifo do @carbon/icons (IBM Corp., Apache-2.0) — ver NOTICE. Desenho copiado sem alteração.
import * as React from "react";
import Svg, {Circle, Path} from "react-native-svg";

export default function ListBulleted({size = 32, color = "#000000", ...rest}) {
  return React.createElement(Svg, {width: size, height: size, viewBox: "0 0 32 32", ...rest},
    React.createElement(Circle, {cx: "7", cy: "9", r: "3", fill: color}),
    React.createElement(Circle, {cx: "7", cy: "23", r: "3", fill: color}),
    React.createElement(Path, {d: "M16 22H30V24H16z", fill: color}),
    React.createElement(Path, {d: "M16 8H30V10H16z", fill: color})
  );
}
