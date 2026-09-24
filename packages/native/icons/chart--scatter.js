// GERADO por packages/native/build-icons-native.mjs. NÃO EDITAR.
// Glifo do @carbon/icons (IBM Corp., Apache-2.0) — ver NOTICE. Desenho copiado sem alteração.
import * as React from "react";
import Svg, {Circle, Path} from "react-native-svg";

export default function ChartScatter({size = 32, color = "#000000", ...rest}) {
  return React.createElement(Svg, {width: size, height: size, viewBox: "0 0 32 32", ...rest},
    React.createElement(Path, {d: "M30,30H4a2,2,0,0,1-2-2V2H4V28H30Z", fill: color}),
    React.createElement(Circle, {cx: "10", cy: "22", r: "2", fill: color}),
    React.createElement(Circle, {cx: "14", cy: "15", r: "2", fill: color}),
    React.createElement(Circle, {cx: "22", cy: "15", r: "2", fill: color}),
    React.createElement(Circle, {cx: "26", cy: "6", r: "2", fill: color}),
    React.createElement(Circle, {cx: "14", cy: "8", r: "2", fill: color})
  );
}
