// As contas e a pintura da família de cor (0.32.0, ADR-0069). É o ÚNICO arquivo do pacote onde `gradient(` pode
// aparecer — o check 4 do `validate.py` reprova em qualquer outro. A exceção é estreita: pintar as cores que se
// escolhem (a área e a trilha de cor), nada mais.
//
// Sem dependência: as conversões são as fórmulas padrão de hex, rgb, hsl e hsb. Sem estado e sem navegador — é
// marcação pura no sentido da ADR-0026, então não leva `"use client"`.
import type {AureaStrings} from "./pure.js";

/** Os três canais de 0 a 255. */
export interface Rgb { r: number; g: number; b: number }
/** Matiz de 0 a 360; saturação e brilho de 0 a 1 (o HSV). */
export interface Hsb { h: number; s: number; b: number }
/** Matiz de 0 a 360; saturação e luminosidade de 0 a 1. */
export interface Hsl { h: number; s: number; l: number }

const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// Texto de cor é entrada do usuário: o tamanho se corta ANTES da expressão, para nenhum texto enorme custar caro
// (o defeito de uma biblioteca de cor do mercado, alerta de 08/09/2026, era exatamente esse).
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** `#rgb` ou `#rrggbb` (com ou sem `#`, maiúscula ou minúscula) → os canais; qualquer outra coisa → `null`. */
export function parseHex(texto: string): Rgb | null {
  if (texto.length > 16) return null;
  const m = HEX.exec(texto.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return {r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16)};
}

/** Os canais → `#rrggbb`, em minúscula, como o `<input type="color">` do navegador devolve. */
export function toHex({r, g, b}: Rgb): string {
  const dois = (n: number) => Math.round(limitar(n, 0, 255)).toString(16).padStart(2, "0");
  return `#${dois(r)}${dois(g)}${dois(b)}`;
}

/** Normaliza o texto hex para `#rrggbb`; texto inválido → `null`. */
export const normalizeHex = (texto: string): string | null => {
  const rgb = parseHex(texto);
  return rgb ? toHex(rgb) : null;
};

// O matiz pela fórmula de seis setores (a mesma do HSV e do HSL).
function matiz(r: number, g: number, b: number, max: number, d: number): number {
  if (d === 0) return 0;
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return h * 60;
}

export function rgbToHsb({r, g, b}: Rgb): Hsb {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B), d = max - Math.min(R, G, B);
  return {h: matiz(R, G, B, max, d), s: max === 0 ? 0 : d / max, b: max};
}

export function hsbToRgb({h, s, b}: Hsb): Rgb {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return 255 * (b - b * s * Math.max(0, Math.min(k, 4 - k, 1)));
  };
  return {r: f(5), g: f(3), b: f(1)};
}

export function rgbToHsl({r, g, b}: Rgb): Hsl {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min, l = (max + min) / 2;
  return {h: matiz(R, G, B, max, d), s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l};
}

export function hslToRgb({h, s, l}: Hsl): Rgb {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return {r: f(0), g: f(8), b: f(4)};
}

/** A luminância relativa da WCAG 2 (0 = preto, 1 = branco), a conta do contraste. */
export function relativeLuminance({r, g, b}: Rgb): number {
  const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** A tinta que contrasta MAIS sobre a cor: `"dark"` (preto) ou `"light"` (branco), pela razão de contraste da WCAG
 *  — e não por um palpite de "cor clara". O amarelo da Aurea pede preto; um azul médio também. */
export function contrastingInk(rgb: Rgb): "dark" | "light" {
  const L = relativeLuminance(rgb);
  return (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? "dark" : "light";
}

// ── A pintura (a exceção da ADR-0069) ────────────────────────────────────────────────────────────────────────
// A cor pura de um matiz, que é o canto de cima à direita da área.
const puro = (h: number) => toHex(hsbToRgb({h, s: 1, b: 1}));

/** O fundo da área de cor para um matiz: do começo ao fim da linha, do branco à cor pura (a saturação); de cima
 *  para baixo, do claro ao preto (o brilho). O motor da área lê o mesmo eixo: x = saturação, y = brilho. Na
 *  escrita da direita para a esquerda (`rtl`), o começo da linha é a direita. */
export function areaFill(h: number, rtl = false): string {
  return `linear-gradient(to top, #000, transparent), linear-gradient(${rtl ? "to left" : "to right"}, #fff, ${puro(h)})`;
}

/** A cor pura de um matiz (saturação e brilho cheios), em hex — a cor do pino da trilha de matiz. */
export const pureHue = (h: number): string => puro(h);

/** A trilha do matiz: o círculo inteiro, de 0 a 360, na direção da trilha. */
export function hueTrackFill(direcao: "to right" | "to left" | "to top" = "to right"): string {
  const paradas = [0, 60, 120, 180, 240, 300, 360].map(puro).join(", ");
  return `linear-gradient(${direcao}, ${paradas})`;
}

/** O FUNDO inteiro da trilha de matiz, para o `background` do trilho do `Slider`: o gradiente anda só no miolo
 *  (`content-box`, onde o pino anda), e as pontas — a folga de cada lado — levam o vermelho, que é a cor das
 *  duas pontas do círculo (0 e 360). */
export function hueTrackBackground(direcao: "to right" | "to left" | "to top" = "to right"): string {
  return `${hueTrackFill(direcao)} no-repeat content-box border-box ${puro(0)}`;
}

// ── O nome da cor (para o leitor de tela) ────────────────────────────────────────────────────────────────────
// As palavras moram no `AureaStrings` (inglês e português); daqui só sai a escolha delas. `colorNameFormat` é a
// ordem das palavras na língua, com `{lightness}`, `{chroma}` e `{hue}`.
export type ColorNameStrings = Pick<AureaStrings, "colorHue" | "colorTone" | "colorNameFormat">;
export type ColorHueName = keyof AureaStrings["colorHue"];
export type ColorToneName = keyof AureaStrings["colorTone"];

// A CLARIDADE ("escuro", "claro") é pelo HSL: a luminosidade dele põe o amarelo puro e o azul puro no MESMO meio
// (0,5), então as palavras dizem a mistura com branco ou preto, e não a claridade própria de cada matiz. A FORÇA
// ("vivo", "pálido", "acinzentado") é pelo HSB: no HSL um rosa pastel tem saturação 1 e sairia "vivo".
function matizPeloNome(h: number, l: number): ColorHueName {
  if (h >= 15 && h < 70 && l < 0.35) return "brown";
  if ((h >= 330 || h < 15) && l > 0.7) return "pink";
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  // O ciano é estreito (170–190): o azul-claro do CSS (`#add8e6`, 194,7°) e o azul-céu (197°) são azuis para quem vê.
  if (h < 170) return "green";
  if (h < 190) return "cyan";
  if (h < 255) return "blue";
  if (h < 290) return "purple";
  return "magenta";
}

/** O nome da cor na língua das frases: "vivid blue", "dark red", "rosa pálido". */
export function colorName(rgb: Rgb, s: ColorNameStrings): string {
  const {h, l} = rgbToHsl(rgb);
  const {s: forca, b: brilho} = rgbToHsb(rgb);
  let hue: ColorHueName;
  let claridade: ColorToneName | undefined;
  let croma: ColorToneName | undefined;
  if (l >= 0.95) hue = "white";
  else if (l <= 0.08) hue = "black";
  else if (forca < 0.12) hue = "gray";
  else {
    hue = matizPeloNome(h, l);
    croma = forca >= 0.8 && brilho >= 0.8 ? "vivid" : forca < 0.4 ? (brilho >= 0.85 ? "pale" : "grayish") : undefined;
  }
  // "Pálido" já diz claro; o branco, o preto, o marrom e o rosa já dizem a claridade no próprio nome.
  if (croma !== "pale" && hue !== "white" && hue !== "black" && hue !== "brown" && hue !== "pink") {
    claridade = l < 0.2 ? "veryDark" : l < 0.35 ? "dark" : l > 0.85 ? "veryLight" : l > 0.7 ? "light" : undefined;
  }
  return s.colorNameFormat
    .replace("{lightness}", claridade ? s.colorTone[claridade] : "")
    .replace("{chroma}", croma ? s.colorTone[croma] : "")
    .replace("{hue}", s.colorHue[hue])
    .replace(/\s+/g, " ").trim();
}
