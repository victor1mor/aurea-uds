// AS IMAGENS DAS RECEITAS (S-11, 05/11/2026): desenhos em SVG dentro da própria página, como a `FOTO` do `_starters.mjs` —
// o site é montado e commitado, e uma imagem que viesse da rede não sobreviveria a uma máquina sem rede nem à trava
// "dist desatualizado" da CI. Cada uma com uma forma e uma cor, para as miniaturas de uma galeria se distinguirem.
// O `_` no começo: não é uma receita.
const FORMAS = [
  c => `<circle cx="150" cy="100" r="56" fill="${c}"/>`,
  c => `<rect x="94" y="44" width="112" height="112" rx="22" fill="${c}"/>`,
  c => `<path d="M150 40 L214 156 H86 Z" fill="${c}"/>`,
  c => `<rect x="60" y="80" width="180" height="40" rx="20" fill="${c}"/><circle cx="150" cy="100" r="28" fill="${c}"/>`,
];
export const arte = (cor, n = 0, fundo = "#3f3f46") => "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="${fundo}"/>${FORMAS[n % FORMAS.length](cor)}</svg>`);

// Um som curto e mudo (0,5 s de silêncio, WAV de 8 kHz): o player da receita toca de verdade, sem buscar nada na rede.
const silencio = () => {
  const n = 4000, b = new Uint8Array(44 + n), v = new DataView(b.buffer);
  const txt = (o, s) => [...s].forEach((ch, i) => b[o + i] = ch.charCodeAt(0));
  txt(0, "RIFF"); v.setUint32(4, 36 + n, true); txt(8, "WAVE"); txt(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  txt(36, "data"); v.setUint32(40, n, true); b.fill(128, 44);
  let s = ""; b.forEach(x => s += String.fromCharCode(x));
  return "data:audio/wav;base64," + (typeof btoa === "function" ? btoa(s) : Buffer.from(s, "binary").toString("base64"));
};
export const SOM = silencio();
