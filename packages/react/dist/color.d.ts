import type { AureaStrings } from "./pure.js";
/** Os três canais de 0 a 255. */
export interface Rgb {
    r: number;
    g: number;
    b: number;
}
/** Matiz de 0 a 360; saturação e brilho de 0 a 1 (o HSV). */
export interface Hsb {
    h: number;
    s: number;
    b: number;
}
/** Matiz de 0 a 360; saturação e luminosidade de 0 a 1. */
export interface Hsl {
    h: number;
    s: number;
    l: number;
}
/** `#rgb` ou `#rrggbb` (com ou sem `#`, maiúscula ou minúscula) → os canais; qualquer outra coisa → `null`. */
export declare function parseHex(texto: string): Rgb | null;
/** Os canais → `#rrggbb`, em minúscula, como o `<input type="color">` do navegador devolve. */
export declare function toHex({ r, g, b }: Rgb): string;
/** Normaliza o texto hex para `#rrggbb`; texto inválido → `null`. */
export declare const normalizeHex: (texto: string) => string | null;
export declare function rgbToHsb({ r, g, b }: Rgb): Hsb;
export declare function hsbToRgb({ h, s, b }: Hsb): Rgb;
export declare function rgbToHsl({ r, g, b }: Rgb): Hsl;
export declare function hslToRgb({ h, s, l }: Hsl): Rgb;
/** O fundo da área de cor para um matiz: do começo ao fim da linha, do branco à cor pura (a saturação); de cima
 *  para baixo, do claro ao preto (o brilho). O motor da área lê o mesmo eixo: x = saturação, y = brilho. Na
 *  escrita da direita para a esquerda (`rtl`), o começo da linha é a direita. */
export declare function areaFill(h: number, rtl?: boolean): string;
/** A cor pura de um matiz (saturação e brilho cheios), em hex — a cor do pino da trilha de matiz. */
export declare const pureHue: (h: number) => string;
/** A trilha do matiz: o círculo inteiro, de 0 a 360, na direção da trilha. */
export declare function hueTrackFill(direcao?: "to right" | "to left" | "to top"): string;
/** O FUNDO inteiro da trilha de matiz, para o `background` do trilho do `Slider`: o gradiente anda só no miolo
 *  (`content-box`, onde o pino anda), e as pontas — a folga de cada lado — levam o vermelho, que é a cor das
 *  duas pontas do círculo (0 e 360). */
export declare function hueTrackBackground(direcao?: "to right" | "to left" | "to top"): string;
export type ColorNameStrings = Pick<AureaStrings, "colorHue" | "colorTone" | "colorNameFormat">;
export type ColorHueName = keyof AureaStrings["colorHue"];
export type ColorToneName = keyof AureaStrings["colorTone"];
/** O nome da cor na língua das frases: "vivid blue", "dark red", "rosa pálido". */
export declare function colorName(rgb: Rgb, s: ColorNameStrings): string;
