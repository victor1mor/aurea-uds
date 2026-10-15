// A conta de cor do oklch para o sRGB, num lugar só (14/10/2026). Era do `build-tokens.mjs` (o hex dos tokens do
// nativo); o gerador do site passou a precisar dela para as amostras do botão "Theme" — a `ColorSwatch` lê hex, e é
// pelo hex que ela escolhe o "visto" claro ou escuro. Os dois importam daqui: a conta não se copia.
export const oklabParaLinearSrgb = (L, a, b) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
};
export const gama = c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
export const corta = c => Math.min(1, Math.max(0, c));
/** O sRGB linear da cor `oklch(L C H)` (H em graus). */
export function oklchParaLinearSrgb([L, C, H]) {
  const rad = H * Math.PI / 180;
  return oklabParaLinearSrgb(L, C * Math.cos(rad), C * Math.sin(rad));
}
/** O hex (`#rrggbb`) de uma cor sRGB linear, cortada ao gamute. */
export const linearSrgbParaHex = lin => "#" + lin.map(x => Math.round(gama(corta(x)) * 255).toString(16).padStart(2, "0")).join("");
