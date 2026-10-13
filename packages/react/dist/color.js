const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
// Texto de cor é entrada do usuário: o tamanho se corta ANTES da expressão, para nenhum texto enorme custar caro
// (o defeito de uma biblioteca de cor do mercado, alerta de 08/09/2026, era exatamente esse).
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** `#rgb` ou `#rrggbb` (com ou sem `#`, maiúscula ou minúscula) → os canais; qualquer outra coisa → `null`. */
export function parseHex(texto) {
    if (texto.length > 16)
        return null;
    const m = HEX.exec(texto.trim());
    if (!m)
        return null;
    const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
/** Os canais → `#rrggbb`, em minúscula, como o `<input type="color">` do navegador devolve. */
export function toHex({ r, g, b }) {
    const dois = (n) => Math.round(limitar(n, 0, 255)).toString(16).padStart(2, "0");
    return `#${dois(r)}${dois(g)}${dois(b)}`;
}
/** Normaliza o texto hex para `#rrggbb`; texto inválido → `null`. */
export const normalizeHex = (texto) => {
    const rgb = parseHex(texto);
    return rgb ? toHex(rgb) : null;
};
// O matiz pela fórmula de seis setores (a mesma do HSV e do HSL).
function matiz(r, g, b, max, d) {
    if (d === 0)
        return 0;
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return h * 60;
}
export function rgbToHsb({ r, g, b }) {
    const [R, G, B] = [r / 255, g / 255, b / 255];
    const max = Math.max(R, G, B), d = max - Math.min(R, G, B);
    return { h: matiz(R, G, B, max, d), s: max === 0 ? 0 : d / max, b: max };
}
export function hsbToRgb({ h, s, b }) {
    const f = (n) => {
        const k = (n + h / 60) % 6;
        return 255 * (b - b * s * Math.max(0, Math.min(k, 4 - k, 1)));
    };
    return { r: f(5), g: f(3), b: f(1) };
}
export function rgbToHsl({ r, g, b }) {
    const [R, G, B] = [r / 255, g / 255, b / 255];
    const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min, l = (max + min) / 2;
    return { h: matiz(R, G, B, max, d), s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l };
}
export function hslToRgb({ h, s, l }) {
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
        const k = (n + h / 30) % 12;
        return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
    };
    return { r: f(0), g: f(8), b: f(4) };
}
// ── A pintura (a exceção da ADR-0069) ────────────────────────────────────────────────────────────────────────
// A cor pura de um matiz, que é o canto de cima à direita da área.
const puro = (h) => toHex(hsbToRgb({ h, s: 1, b: 1 }));
/** O fundo da área de cor para um matiz: do começo ao fim da linha, do branco à cor pura (a saturação); de cima
 *  para baixo, do claro ao preto (o brilho). O motor da área lê o mesmo eixo: x = saturação, y = brilho. Na
 *  escrita da direita para a esquerda (`rtl`), o começo da linha é a direita. */
export function areaFill(h, rtl = false) {
    return `linear-gradient(to top, #000, transparent), linear-gradient(${rtl ? "to left" : "to right"}, #fff, ${puro(h)})`;
}
/** A cor pura de um matiz (saturação e brilho cheios), em hex — a cor do pino da trilha de matiz. */
export const pureHue = (h) => puro(h);
/** A trilha do matiz: o círculo inteiro, de 0 a 360, na direção da trilha. */
export function hueTrackFill(direcao = "to right") {
    const paradas = [0, 60, 120, 180, 240, 300, 360].map(puro).join(", ");
    return `linear-gradient(${direcao}, ${paradas})`;
}
/** O FUNDO inteiro da trilha de matiz, para o `background` do trilho do `Slider`: o gradiente anda só no miolo
 *  (`content-box`, onde o pino anda), e as pontas — a folga de cada lado — levam o vermelho, que é a cor das
 *  duas pontas do círculo (0 e 360). */
export function hueTrackBackground(direcao = "to right") {
    return `${hueTrackFill(direcao)} no-repeat content-box border-box ${puro(0)}`;
}
// A CLARIDADE ("escuro", "claro") é pelo HSL: a luminosidade dele põe o amarelo puro e o azul puro no MESMO meio
// (0,5), então as palavras dizem a mistura com branco ou preto, e não a claridade própria de cada matiz. A FORÇA
// ("vivo", "pálido", "acinzentado") é pelo HSB: no HSL um rosa pastel tem saturação 1 e sairia "vivo".
function matizPeloNome(h, l) {
    if (h >= 15 && h < 70 && l < 0.35)
        return "brown";
    if ((h >= 330 || h < 15) && l > 0.7)
        return "pink";
    if (h < 15 || h >= 345)
        return "red";
    if (h < 45)
        return "orange";
    if (h < 70)
        return "yellow";
    // O ciano é estreito (170–190): o azul-claro do CSS (`#add8e6`, 194,7°) e o azul-céu (197°) são azuis para quem vê.
    if (h < 170)
        return "green";
    if (h < 190)
        return "cyan";
    if (h < 255)
        return "blue";
    if (h < 290)
        return "purple";
    return "magenta";
}
/** O nome da cor na língua das frases: "vivid blue", "dark red", "rosa pálido". */
export function colorName(rgb, s) {
    const { h, l } = rgbToHsl(rgb);
    const { s: forca, b: brilho } = rgbToHsb(rgb);
    let hue;
    let claridade;
    let croma;
    if (l >= 0.95)
        hue = "white";
    else if (l <= 0.08)
        hue = "black";
    else if (forca < 0.12)
        hue = "gray";
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
