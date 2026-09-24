// Aurea — serialização de um `$value` DTCG 2025.10 para TEXTO, por `$type`.
//
// Mora aqui, e não dentro do `build-tokens.mjs`, porque tem DOIS consumidores: o alvo CSS
// (`build-tokens.mjs`) e a coluna "Value" da página de tokens do catálogo
// (`build-catalog.mjs`). Enquanto era função privada do gerador de CSS, o catálogo interpolava
// o objeto cru numa template string e imprimia `[object Object]` em 198 lugares — todo token
// composto (cor, dimensão, sombra, duração). Duas serializações do mesmo arquivo seriam duas
// verdades sobre a identidade; esta é a única.
//
// O módulo é PURO de propósito (nenhum efeito no topo), como o `page-model.mjs`: quem importa
// não paga build de token nenhum.

export const num = n => String(n); // canonical number: drops trailing/leading-zero noise
const quote = s => /\s/.test(s) ? `"${s}"` : s;

function serializeColor(v) {
  if (v.colorSpace === "srgb" && v.hex && v.alpha === undefined) return v.hex;
  if (v.colorSpace === "oklch") {
    const base = v.components.map(num).join(" ");
    return `oklch(${base}${v.alpha === undefined ? "" : ` / ${num(v.alpha)}`})`;
  }
  // srgb with alpha -> rgba() (used by shadow colors)
  const [r, g, b] = v.components.map(c => Math.round(c * 255));
  return `rgba(${r},${g},${b},${num(v.alpha ?? 1)})`;
}

const dim = d => `${num(d.value)}${d.value === 0 ? "" : d.unit}`;

function serializeShadow(v) {
  const list = Array.isArray(v) ? v : [v];
  if (list.length === 0) return "none";
  return list.map(s => {
    const spread = s.spread && s.spread.value !== 0 ? " " + dim(s.spread) : "";
    return `${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)}${spread} ${serializeColor(s.color)}`;
  }).join(", ");
}

export function serialize(type, value) {
  if (typeof value === "string" && /^\{.+\}$/.test(value)) {
    const leaf = value.slice(1, -1).split(".").pop(); // {a.b.leaf} -> leaf
    return `var(--${leaf})`;
  }
  switch (type) {
    case "color": return serializeColor(value);
    case "dimension": return dim(value);
    case "duration": return `${num(value.value)}${value.unit}`;
    case "number": return num(value);
    case "cubicBezier": return `cubic-bezier(${value.map(num).join(",")})`;
    case "fontFamily": return (Array.isArray(value) ? value : [value]).map(quote).join(",");
    case "shadow": return serializeShadow(value);
    default: throw new Error("unknown $type: " + type);
  }
}
