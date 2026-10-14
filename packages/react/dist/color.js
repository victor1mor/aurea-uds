/** Os três canais de cada espaço, na ordem dele. */
export const COLOR_CHANNELS = {
    hsb: ["hue", "saturation", "brightness"], hsl: ["hue", "saturation", "lightness"], rgb: ["red", "green", "blue"],
};
const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
// ── O texto ─────────────────────────────────────────────────────────────────────────────────────────────────
// Texto de cor é entrada do usuário: o tamanho se corta ANTES da expressão, para nenhum texto enorme custar caro
// (o defeito de uma biblioteca de cor do mercado, alerta de 08/09/2026, era exatamente esse).
const HEX = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
/** `#rgb`, `#rgba`, `#rrggbb` ou `#rrggbbaa` (com ou sem `#`) → os canais e o alfa; o resto → `null`. */
export function parseHex(texto) {
    if (texto.length > 16)
        return null;
    const m = HEX.exec(texto.trim());
    if (!m)
        return null;
    const h = m[1].length <= 4 ? m[1].replace(/./g, (c) => c + c) : m[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
}
/** Os canais → `#rrggbb` (minúscula, como o `<input type="color">`); com alfa abaixo de 1, `#rrggbbaa`. */
export function toHex({ r, g, b, a }) {
    const dois = (n) => Math.round(limitar(n, 0, 255)).toString(16).padStart(2, "0");
    const alfa = a === undefined || a >= 1 ? "" : dois(a * 255);
    return `#${dois(r)}${dois(g)}${dois(b)}${alfa}`;
}
/** Normaliza o texto hex; texto inválido → `null`. */
export const normalizeHex = (texto) => {
    const rgb = parseHex(texto);
    return rgb ? toHex(rgb) : null;
};
// As funções do CSS que a referência aceita na entrada: rgb/rgba, hsl/hsla, hsb/hsba — vírgula ou espaço, `%` onde
// o CSS põe, e o alfa por `,` ou `/`. Números sem expoente e sem sinal: é texto de pessoa, não de máquina.
const NUM = "(\\d{1,3}(?:\\.\\d+)?)";
const FUNCAO = new RegExp(`^(rgb|hsl|hsb)a?\\(\\s*${NUM}(deg|%)?\\s*[, ]\\s*${NUM}(%)?\\s*[, ]\\s*${NUM}(%)?\\s*(?:[,/]\\s*(\\d*(?:\\.\\d+)?)(%)?\\s*)?\\)$`, "i");
/** Texto de cor → a cor de dentro: hex (3, 4, 6 ou 8 dígitos), `rgb()`, `hsl()` ou `hsb()`, com alfa. O resto →
 *  `null`. O matiz de `hsl()`/`hsb()` cinza é guardado (o hex o perderia). */
export function parseColor(texto) {
    if (texto.length > 64)
        return null;
    const t = texto.trim();
    const hex = parseHex(t);
    if (hex)
        return { ...rgbToHsb(hex), a: hex.a };
    const m = FUNCAO.exec(t);
    if (!m)
        return null;
    const [, fn, v1, , v2, , v3, , va, pa] = m;
    const n1 = Number(v1), n2 = Number(v2), n3 = Number(v3);
    const a = va === undefined || va === "" ? 1 : limitar(pa ? Number(va) / 100 : Number(va), 0, 1);
    const tipo = fn.toLowerCase();
    if (tipo === "rgb") {
        if (n1 > 255 || n2 > 255 || n3 > 255)
            return null;
        return { ...rgbToHsb({ r: n1, g: n2, b: n3 }), a };
    }
    if (n1 > 360 || n2 > 100 || n3 > 100)
        return null;
    if (tipo === "hsb")
        return { h: n1 % 360, s: n2 / 100, b: n3 / 100, a };
    return { ...hslParaHsb(n1 % 360, n2 / 100, n3 / 100), a };
}
/** A cor de dentro → hex (`#rrggbb`, ou `#rrggbbaa` com transparência). */
export const corToHex = (c) => toHex({ ...hsbToRgb(c), a: c.a });
// ── As conversões ───────────────────────────────────────────────────────────────────────────────────────────
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
// HSB ↔ HSL direto, com o matiz passando por fora (pelo RGB ele se perderia no cinza).
function hsbParaHsl(c) {
    const l = c.b * (1 - c.s / 2);
    return { l, s: l === 0 || l === 1 ? 0 : (c.b - l) / Math.min(l, 1 - l) };
}
function hslParaHsb(h, s, l, anterior) {
    const b = l + s * Math.min(l, 1 - l);
    return { h, s: b === 0 ? (anterior?.s ?? 0) : 2 * (1 - l / b), b };
}
// ── Os canais ───────────────────────────────────────────────────────────────────────────────────────────────
/** A faixa de cada canal, a mesma da referência: matiz 0–360 (passo 1, salto 15); saturação, brilho e luminosidade
 *  0–100 (passo 1, salto 10); vermelho, verde e azul 0–255 (passo 1, salto 17); alfa 0–1 (passo 0,01, salto 0,1). */
export function channelRange(ch) {
    if (ch === "hue")
        return { min: 0, max: 360, step: 1, page: 15 };
    if (ch === "red" || ch === "green" || ch === "blue")
        return { min: 0, max: 255, step: 1, page: 17 };
    if (ch === "alpha")
        return { min: 0, max: 1, step: 0.01, page: 0.1 };
    return { min: 0, max: 100, step: 1, page: 10 };
}
/** O espaço em que um canal vive: luminosidade só no HSL, brilho só no HSB, vermelho/verde/azul só no RGB; matiz,
 *  saturação e alfa no espaço pedido (sem pedido, HSB). */
export function spaceOf(ch, pedido) {
    if (ch === "lightness")
        return "hsl";
    if (ch === "brightness")
        return "hsb";
    if (ch === "red" || ch === "green" || ch === "blue")
        return "rgb";
    return pedido === "rgb" && ch !== "alpha" ? "hsb" : pedido ?? "hsb";
}
/** O valor de um canal, na faixa dele. */
export function getChannel(c, ch, space = spaceOf(ch)) {
    if (ch === "alpha")
        return c.a;
    if (ch === "hue")
        return c.h;
    if (space === "rgb") {
        const rgb = hsbToRgb(c);
        return ch === "red" ? rgb.r : ch === "green" ? rgb.g : rgb.b;
    }
    if (space === "hsl") {
        const v = hsbParaHsl(c);
        return (ch === "lightness" ? v.l : v.s) * 100;
    }
    return (ch === "brightness" ? c.b : c.s) * 100;
}
/** A cor com um canal trocado (o valor é limitado à faixa). O matiz e a saturação de antes ficam quando a cor nova
 *  vira cinza ou preta. */
export function setChannel(c, ch, v, space = spaceOf(ch)) {
    const { min, max } = channelRange(ch);
    const n = limitar(v, min, max);
    if (ch === "alpha")
        return { ...c, a: n };
    if (ch === "hue")
        return { ...c, h: n };
    if (space === "rgb") {
        const rgb = { ...hsbToRgb(c), [ch === "red" ? "r" : ch === "green" ? "g" : "b"]: n };
        const novo = rgbToHsb(rgb);
        return { h: novo.s === 0 || novo.b === 0 ? c.h : novo.h, s: novo.b === 0 ? c.s : novo.s, b: novo.b, a: c.a };
    }
    if (space === "hsl") {
        const atual = hsbParaHsl(c);
        const s = ch === "saturation" ? n / 100 : atual.s, l = ch === "lightness" ? n / 100 : atual.l;
        return { ...hslParaHsb(c.h, s, l, c), a: c.a };
    }
    return { ...c, [ch === "brightness" ? "b" : "s"]: n / 100 };
}
// ── O contraste ─────────────────────────────────────────────────────────────────────────────────────────────
/** A luminância relativa da WCAG 2 (0 = preto, 1 = branco), a conta do contraste. */
export function relativeLuminance({ r, g, b }) {
    const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
/** A tinta que contrasta MAIS sobre a cor: `"dark"` (preto) ou `"light"` (branco), pela razão de contraste da WCAG
 *  — e não por um palpite de "cor clara". O amarelo da Aurea pede preto; um azul médio também. */
export function contrastingInk(rgb) {
    const L = relativeLuminance(rgb);
    return (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? "dark" : "light";
}
const opaca = (c) => toHex(hsbToRgb(c));
// A cor pura de um matiz (saturação e brilho cheios).
const puro = (h) => opaca({ h, s: 1, b: 1, a: 1 });
/** A cor pura de um matiz, em hex — a cor do pino da trilha de matiz. */
export const pureHue = (h) => puro(h);
/** O FUNDO da trilha de um canal, para o `background` do trilho do `Slider`. O gradiente vai de ponta a ponta do
 *  trilho, mas as paradas começam e terminam na FOLGA (`--slider-cap`, o recuo que o pino respeita): antes da
 *  primeira e depois da última, a cor chapada da ponta. Assim o pino no mínimo fica sobre a cor do mínimo, em
 *  qualquer canal. O alfa vai do transparente à cor opaca (o xadrez embaixo é a pele, e não gradiente). */
export function trackBackground(c, ch, space = spaceOf(ch), direcao = "to right") {
    const { min, max } = channelRange(ch);
    let cores;
    if (ch === "hue")
        cores = [0, 60, 120, 180, 240, 300, 360].map(puro);
    else if (ch === "alpha")
        cores = [toHex({ ...hsbToRgb(c), a: 0 }), opaca(c)];
    else if (ch === "lightness")
        cores = [min, (max - min) / 2, max].map((v) => opaca(setChannel(c, ch, v, space)));
    else
        cores = [min, max].map((v) => opaca(setChannel(c, ch, v, space)));
    const k = cores.length - 1;
    const paradas = cores.map((cor, i) => `${cor} calc(var(--slider-cap, 0px) + (100% - 2 * var(--slider-cap, 0px)) * ${i / k})`);
    return `linear-gradient(${direcao}, ${paradas.join(", ")})`;
}
/** O fundo da área de cor para um par de canais, com o terceiro fixo no valor da cor de agora. A técnica é a da
 *  biblioteca da referência (escrita aqui por nós): no RGB, uma camada por canal somadas pelo modo de mistura
 *  `screen`; no HSL e no HSB, uma camada por canal com a receita de paradas dele, e a cor pura embaixo quando o
 *  fixo é o matiz. `x` anda do começo ao fim da linha (na escrita da direita para a esquerda, o começo é a direita);
 *  `y`, de baixo para cima. */
export function areaBackground(c, space, x, y, rtl = false) {
    const fim = rtl ? "to left" : "to right";
    const z = COLOR_CHANNELS[space].find((ch) => ch !== x && ch !== y);
    const zv = getChannel(c, z, space);
    if (space === "rgb") {
        const so = (ch, v) => {
            const rgb = { r: 0, g: 0, b: 0 };
            rgb[ch === "red" ? "r" : ch === "green" ? "g" : "b"] = v;
            return toHex(rgb);
        };
        return { background: [`linear-gradient(${fim}, ${so(x, 0)}, ${so(x, 255)})`, `linear-gradient(to top, ${so(y, 0)}, ${so(y, 255)})`,
                so(z, zv)].join(", "), blend: "screen" };
    }
    const base = setChannel({ h: 0, s: 1, b: 1, a: 1 }, z, zv, space);
    const receita = (ch) => ch === "hue" ? [0, 60, 120, 180, 240, 300, 360].map((h) => opaca(setChannel(base, "hue", h, space))).join(", ")
        : ch === "saturation" ? `${opaca(setChannel(base, "saturation", 0, space))}, transparent`
            : ch === "lightness" ? "#000, transparent, #fff"
                : "#000, transparent";
    const camadas = COLOR_CHANNELS[space].filter((ch) => ch !== z)
        .map((ch) => `linear-gradient(${ch === x ? fim : "to top"}, ${receita(ch)})`).reverse();
    if (z === "hue")
        camadas.push(opaca(base));
    return { background: camadas.join(", ") };
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
/** O valor de um canal escrito para o leitor de tela e a saída: "210°", "80%", "128", alfa "50%". */
export function formatChannel(ch, v) {
    if (ch === "hue")
        return `${Math.round(v)}°`;
    if (ch === "alpha")
        return `${Math.round(v * 100)}%`;
    if (ch === "red" || ch === "green" || ch === "blue")
        return `${Math.round(v)}`;
    return `${Math.round(v)}%`;
}
