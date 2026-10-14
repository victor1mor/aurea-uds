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
/** A cor de dentro das peças: HSB com o alfa (0 = transparente, 1 = opaca). */
export interface Cor extends Hsb {
    a: number;
}
export type ColorSpace = "rgb" | "hsl" | "hsb";
export type ColorChannel = "hue" | "saturation" | "brightness" | "lightness" | "red" | "green" | "blue" | "alpha";
/** Os três canais de cada espaço, na ordem dele. */
export declare const COLOR_CHANNELS: Readonly<Record<ColorSpace, readonly [ColorChannel, ColorChannel, ColorChannel]>>;
/** `#rgb`, `#rgba`, `#rrggbb` ou `#rrggbbaa` (com ou sem `#`) → os canais e o alfa; o resto → `null`. */
export declare function parseHex(texto: string): (Rgb & {
    a: number;
}) | null;
/** Os canais → `#rrggbb` (minúscula, como o `<input type="color">`); com alfa abaixo de 1, `#rrggbbaa`. */
export declare function toHex({ r, g, b, a }: Rgb & {
    a?: number;
}): string;
/** Normaliza o texto hex; texto inválido → `null`. */
export declare const normalizeHex: (texto: string) => string | null;
/** Texto de cor → a cor de dentro: hex (3, 4, 6 ou 8 dígitos), `rgb()`, `hsl()` ou `hsb()`, com alfa. O resto →
 *  `null`. O matiz de `hsl()`/`hsb()` cinza é guardado (o hex o perderia). */
export declare function parseColor(texto: string): Cor | null;
/** A cor de dentro → hex (`#rrggbb`, ou `#rrggbbaa` com transparência). */
export declare const corToHex: (c: Cor) => string;
export declare function rgbToHsb({ r, g, b }: Rgb): Hsb;
export declare function hsbToRgb({ h, s, b }: Hsb): Rgb;
export declare function rgbToHsl({ r, g, b }: Rgb): Hsl;
export declare function hslToRgb({ h, s, l }: Hsl): Rgb;
/** A faixa de cada canal, a mesma da referência: matiz 0–360 (passo 1, salto 15); saturação, brilho e luminosidade
 *  0–100 (passo 1, salto 10); vermelho, verde e azul 0–255 (passo 1, salto 17); alfa 0–1 (passo 0,01, salto 0,1). */
export declare function channelRange(ch: ColorChannel): {
    min: number;
    max: number;
    step: number;
    page: number;
};
/** O espaço em que um canal vive: luminosidade só no HSL, brilho só no HSB, vermelho/verde/azul só no RGB; matiz,
 *  saturação e alfa no espaço pedido (sem pedido, HSB). */
export declare function spaceOf(ch: ColorChannel, pedido?: ColorSpace): ColorSpace;
/** O valor de um canal, na faixa dele. */
export declare function getChannel(c: Cor, ch: ColorChannel, space?: ColorSpace): number;
/** A cor com um canal trocado (o valor é limitado à faixa). O matiz e a saturação de antes ficam quando a cor nova
 *  vira cinza ou preta. */
export declare function setChannel(c: Cor, ch: ColorChannel, v: number, space?: ColorSpace): Cor;
/** A luminância relativa da WCAG 2 (0 = preto, 1 = branco), a conta do contraste. */
export declare function relativeLuminance({ r, g, b }: Rgb): number;
/** A tinta que contrasta MAIS sobre a cor: `"dark"` (preto) ou `"light"` (branco), pela razão de contraste da WCAG
 *  — e não por um palpite de "cor clara". O amarelo da Aurea pede preto; um azul médio também. */
export declare function contrastingInk(rgb: Rgb): "dark" | "light";
type Direcao = "to right" | "to left" | "to top";
/** A cor pura de um matiz, em hex — a cor do pino da trilha de matiz. */
export declare const pureHue: (h: number) => string;
/** O FUNDO da trilha de um canal, para o `background` do trilho do `Slider`. O gradiente vai de ponta a ponta do
 *  trilho, mas as paradas começam e terminam na FOLGA (`--slider-cap`, o recuo que o pino respeita): antes da
 *  primeira e depois da última, a cor chapada da ponta. Assim o pino no mínimo fica sobre a cor do mínimo, em
 *  qualquer canal. O alfa vai do transparente à cor opaca (o xadrez embaixo é a pele, e não gradiente). */
export declare function trackBackground(c: Cor, ch: ColorChannel, space?: ColorSpace, direcao?: Direcao): string;
/** O fundo da área de cor para um par de canais, com o terceiro fixo no valor da cor de agora. A técnica é a da
 *  biblioteca da referência (escrita aqui por nós): no RGB, uma camada por canal somadas pelo modo de mistura
 *  `screen`; no HSL e no HSB, uma camada por canal com a receita de paradas dele, e a cor pura embaixo quando o
 *  fixo é o matiz. `x` anda do começo ao fim da linha (na escrita da direita para a esquerda, o começo é a direita);
 *  `y`, de baixo para cima. */
export declare function areaBackground(c: Cor, space: ColorSpace, x: ColorChannel, y: ColorChannel, rtl?: boolean): {
    background: string;
    blend?: string;
};
export type ColorNameStrings = Pick<AureaStrings, "colorHue" | "colorTone" | "colorNameFormat">;
export type ColorHueName = keyof AureaStrings["colorHue"];
export type ColorToneName = keyof AureaStrings["colorTone"];
/** O nome da cor na língua das frases: "vivid blue", "dark red", "rosa pálido". */
export declare function colorName(rgb: Rgb, s: ColorNameStrings): string;
/** O valor de um canal escrito para o leitor de tela e a saída: "210°", "80%", "128", alfa "50%". */
export declare function formatChannel(ch: ColorChannel, v: number): string;
export {};
