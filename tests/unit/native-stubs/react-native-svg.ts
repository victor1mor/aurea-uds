// Dublê de `react-native-svg`. Mesma razão do dublê de `react-native`: ele depende do
// `react-native`, que é Flow.
//
// ⚠ **Ele mudou no Chart (09/09/2026), e a mudança importa.** Antes eram STRINGS —
// `export const Path = "Path"` —, o que bastava para os ícones: eles são `React.createElement`
// puro, e o teste olhava a árvore de objetos. **O `Chart` calcula geometria**, e o que precisa ser
// inspecionado passou a ser o VALOR das props: o `d` de um caminho, o `y` de uma barra, quantas
// linhas de grade saíram. Então os primitivos passaram a registrar como todos os outros, pelo
// MESMO registro do dublê de `react-native` — o que também faz `__limpar()` limpar os dois.
//
// O limite continua declarado e é o de sempre: **isto não desenha**. Se um `d` está certo como
// texto e errado como forma, só o aparelho conta — e é para isso que existe `apps/native-smoke/`.
import {criarPrimitivo} from "./react-native";

const Svg = criarPrimitivo("Svg");
export default Svg;
export const Path = criarPrimitivo("Path");
export const Circle = criarPrimitivo("Circle");
export const Rect = criarPrimitivo("Rect");
export const G = criarPrimitivo("G");
export const Line = criarPrimitivo("Line");
export const Text = criarPrimitivo("SvgText");
export const Polyline = criarPrimitivo("Polyline");
export type SvgProps = Record<string, unknown>;
