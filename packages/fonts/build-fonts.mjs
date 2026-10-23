// Aurea — generate dist/fonts.css (web) and dist/fonts.native.js (React Native) from the
// committed font binaries. The files/ and files-native/ binaries are the source of truth.
//
// DOIS ALVOS, UMA LISTA. O alvo web sai de `files/*.woff2`; o nativo, de `files-native/*.ttf`,
// que entrou no Lote 0 do NATIVE.md (§5.2.1) porque o React Native NÃO LÊ woff2 — sem .ttf o
// IBM Plex simplesmente não aparece no aparelho e o app cai na fonte de sistema, que é a
// identidade que o CLAUDE.md declara intocável.
//
// ~~ADR-0053 (01/10/2026): a fonte é a Atkinson Hyperlegible Next (texto) e a Atkinson Hyperlegible
// Mono (código)~~ — trocada pela ADR-0077 (22/10/2026): Inter, Sora e IBM Plex Mono, a web na 0.39.0 e o
// nativo na 0.40.1 (as listas WEB e NATIVO, abaixo). O resto deste parágrafo é a história da Atkinson,
// as duas sob a SIL OFL 1.1. A IBM Plex saiu, a Serif junto. Os arquivos foram
// gerados das fontes variáveis do Google Fonts (`ofl/atkinsonhyperlegiblenext` e
// `ofl/atkinsonhyperlegiblemono`), um peso fixo por arquivo: o `.ttf` completo para o aparelho,
// e o `.woff2` só com o alfabeto latino (o mesmo intervalo do subset `latin` do fontsource, que
// era o que a web servia da Plex).
//
// O nome de cada fonte no alvo nativo é MEDIDO, não escrito à mão: o iOS registra a fonte pelo
// nome PostScript, que mora na tabela `name` do próprio arquivo. Escrever "IBMPlexSans-SemiBold"
// numa constante seria uma segunda verdade sobre um byte que já existe no binário.
import {readFileSync, writeFileSync, existsSync, mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(dir, "dist"), {recursive: true});

// ── ADR-0077 (22/10/2026): A FONTE DA WEB É A INTER, A SORA E A IBM PLEX MONO ─────────────────
// Texto em Inter, título em Sora, número e código em IBM Plex Mono — as três sob a SIL OFL 1.1. A
// Inter e a Sora são VARIÁVEIS (um arquivo cobre todos os pesos; a Inter, também o tamanho óptico),
// cortadas do arquivo oficial para o mesmo recorte latino de antes por `cortar-fontes.py`. A IBM Plex
// Mono é a da própria IBM, SEM mudança nenhuma (a licença dela reserva o nome "Plex"): os recortes
// `Latin1` de `@ibm/plex-mono` 2.5.0, um peso por arquivo.
// O `weight` de um arquivo variável é a FAIXA que ele cobre ("100 900"): o navegador escolhe o peso
// dentro dela, e o tamanho óptico da Inter acompanha o tamanho da letra sozinho
// (`font-optical-sizing:auto`, o padrão do navegador).
const INTER = "Inter", SORA = "Sora", PLEX_MONO = "IBM Plex Mono";
const WEB = [
  {file: "inter-variable-normal.woff2",    family: INTER,     weight: "100 900", style: "normal"},
  {file: "inter-variable-italic.woff2",    family: INTER,     weight: "100 900", style: "italic"},
  {file: "sora-variable-normal.woff2",     family: SORA,      weight: "100 800", style: "normal"},
  {file: "ibm-plex-mono-400-normal.woff2", family: PLEX_MONO, weight: 400,       style: "normal"},
  {file: "ibm-plex-mono-500-normal.woff2", family: PLEX_MONO, weight: 500,       style: "normal"},
  {file: "ibm-plex-mono-600-normal.woff2", family: PLEX_MONO, weight: 600,       style: "normal"},
];

// ── O ALVO NATIVO (ADR-0077, 0.40.1) ────────────────────────────────────────────────────────────────
// As MESMAS três famílias da web, em .ttf estático, um peso por arquivo — o React Native não lê woff2 nem
// fonte variável no Android. Saem de `fontes-nativas.py`: a Inter e a IBM Plex Mono são os .ttf dos autores
// sem mudança; a Sora, a variável da web instanciada por peso. `role` é o token de tipografia que a fonte
// serve (`ui`, `heading`, `code`), para o nativo indexar por papel e não por nome de família.
// ⚠ O papel `editorial` NÃO tem arquivo desde a ADR-0053 (a serifada saiu): é APELIDO do `ui`, sem itálico,
// para não quebrar quem o usa — o `--font-editorial` do core e o `font.editorial` do nativo. Sai na 1.0.
// Até a 0.40.0 o nativo era a Atkinson Hyperlegible Next e Mono (ADR-0053), e o título usava a fonte do texto.
const NATIVO = [
  {arquivo: "inter-400-normal.ttf",         role: "ui",      weight: 400, style: "normal"},
  {arquivo: "inter-400-italic.ttf",         role: "ui",      weight: 400, style: "italic"},
  {arquivo: "inter-500-normal.ttf",         role: "ui",      weight: 500, style: "normal"},
  {arquivo: "inter-600-normal.ttf",         role: "ui",      weight: 600, style: "normal"},
  {arquivo: "inter-700-normal.ttf",         role: "ui",      weight: 700, style: "normal"},
  {arquivo: "inter-800-normal.ttf",         role: "ui",      weight: 800, style: "normal"},
  {arquivo: "sora-400-normal.ttf",          role: "heading", weight: 400, style: "normal"},
  {arquivo: "sora-500-normal.ttf",          role: "heading", weight: 500, style: "normal"},
  {arquivo: "sora-600-normal.ttf",          role: "heading", weight: 600, style: "normal"},
  {arquivo: "sora-700-normal.ttf",          role: "heading", weight: 700, style: "normal"},
  {arquivo: "sora-800-normal.ttf",          role: "heading", weight: 800, style: "normal"},
  {arquivo: "ibm-plex-mono-400-normal.ttf", role: "code",    weight: 400, style: "normal"},
  {arquivo: "ibm-plex-mono-500-normal.ttf", role: "code",    weight: 500, style: "normal"},
  {arquivo: "ibm-plex-mono-600-normal.ttf", role: "code",    weight: 600, style: "normal"},
];

// ── alvo WEB ───────────────────────────────────────────────────────────────
let css = "/* Aurea fonts — Inter, Sora e IBM Plex Mono (SIL OFL 1.1). Generated from files/. Do not edit. */\n";
for (const f of WEB) {
  if (!existsSync(join(dir, "files", f.file))) throw new Error("missing font file: " + f.file);
  css += `@font-face{font-family:"${f.family}";font-style:${f.style};font-weight:${f.weight};`
       + `font-display:swap;src:url("../files/${f.file}") format("woff2");}\n`;
}

writeFileSync(join(dir, "dist", "fonts.css"), css);
// Mesma razão do `aurea.css.d.ts` do core, e o mesmo defeito: sem a condição `types` no mapa
// `exports`, `import "@aurea-uds/fonts/css"` reprova com TS2882 no consumidor TypeScript.
writeFileSync(join(dir, "dist", "fonts.css.d.ts"),
  "// Gerado por packages/fonts/build-fonts.mjs. A folha não exporta nada — este arquivo\n"
  + "// existe para a condição `types` do subpath ./css do mapa `exports`.\n"
  + "export {};\n");

// ── alvo NATIVO ────────────────────────────────────────────────────────────
// Lê os nameIDs que decidem como cada plataforma acha a fonte. A tabela `name` é a única
// fonte de verdade disso: o iOS registra pelo nome PostScript (nameID 6) e o Android pelo
// nome do arquivo, e o `expo-font` uniformiza os dois pela CHAVE que recebe no mapa.
//
// ⚠ `subarray` compartilha memória com o buffer do arquivo, e `swap16()` inverte NO LUGAR.
// Sem a cópia, um registro que reaproveita o mesmo trecho de string sai invertido — foi o que
// aconteceu na primeira medição desta tabela, e o sintoma é texto virando ideograma.
const NAME_IDS = {1: "family", 2: "subfamily", 4: "full", 6: "postscript", 16: "typoFamily", 17: "typoSubfamily"};
function readNameTable(file) {
  const b = readFileSync(file);
  const numTables = b.readUInt16BE(4);
  let nameOff = null;
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    if (b.toString("latin1", o, o + 4) === "name") nameOff = b.readUInt32BE(o + 8);
  }
  if (nameOff === null) throw new Error("TTF sem tabela `name`: " + file);
  const count = b.readUInt16BE(nameOff + 2);
  const strOff = nameOff + b.readUInt16BE(nameOff + 4);
  const out = {};
  for (let i = 0; i < count; i++) {
    const r = nameOff + 6 + i * 12;
    const platform = b.readUInt16BE(r), nameId = b.readUInt16BE(r + 6);
    const len = b.readUInt16BE(r + 8), off = b.readUInt16BE(r + 10);
    if (!(nameId in NAME_IDS)) continue;
    const raw = b.subarray(strOff + off, strOff + off + len);
    // platform 3 (Windows) é UTF-16BE e é a codificação canônica; só cai para Mac se faltar.
    const value = platform === 3 ? Buffer.from(raw).swap16().toString("utf16le") : raw.toString("latin1");
    if (platform === 3 || !(NAME_IDS[nameId] in out)) out[NAME_IDS[nameId]] = value;
  }
  if (!out.postscript) throw new Error("TTF sem nome PostScript (nameID 6): " + file);
  return out;
}

const medidos = NATIVO.map((f) => {
  const caminho = join(dir, "files-native", f.arquivo);
  if (!existsSync(caminho)) throw new Error("missing native font file: " + f.arquivo);
  return {...f, ...readNameTable(caminho)};
});

// Um nome PostScript repetido faria duas fontes disputarem a mesma chave e uma sumiria em
// silêncio — que é a classe de defeito que este pacote inteiro existe para não ter.
const vistos = new Set();
for (const m of medidos) {
  if (vistos.has(m.postscript)) throw new Error("nome PostScript repetido: " + m.postscript);
  vistos.add(m.postscript);
}

const porPapel = {};
for (const m of medidos) {
  (porPapel[m.role] ??= {})[`${m.weight}${m.style === "italic" ? "i" : ""}`] = m.postscript;
}
// `editorial` é apelido do `ui` desde a ADR-0053 (ver o comentário da lista NATIVO). Sem itálico,
// como a serifada que ele substitui não tinha.
porPapel.editorial = Object.fromEntries(Object.entries(porPapel.ui).filter(([k]) => !k.endsWith("i")));
// `heading` (GAR-16, 0.28.0) é o papel do título — o `--font-heading` da web. Desde a 0.40.1 (ADR-0077) ele
// tem arquivos próprios, a Sora; até a 0.40.0 apontava para os do texto.

const cab = `// Aurea — alvo NATIVO das fontes. GERADO por packages/fonts/build-fonts.mjs. NÃO EDITAR.
//
// Lote 0 do NATIVE.md (§5.2.1). O React Native não lê woff2, então o alvo web não atravessa:
// estes são os MESMOS estilos da web, em .ttf estático.
//
// ⚠ NÃO use \`fontWeight\` para escolher o peso. Os arquivos estão no formato RIBBI: só Regular,
// Italic e Bold moram na família principal ("Inter", "Sora", "IBM Plex Mono"); o Medium e o SemiBold
// são FAMÍLIAS PRÓPRIAS ("Inter Medium", "Sora SemiBold"…). Pedir a família + \`fontWeight:"600"\`
// devolve o Regular sintetizado, não o SemiBold desenhado. (Era assim também na Atkinson e na IBM Plex.)
//
// A forma correta é uma só: \`fontFamily\` recebe o NOME POSTSCRIPT, que é a chave deste mapa.
// O \`FONT_FAMILIES\` abaixo faz essa tradução por papel de tipografia e peso.
//
//   import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
//   const [pronto] = useFonts(AUREA_FONTS);              // expo-font
//   <Text style={{fontFamily: FONT_FAMILIES.ui["600"]}}> // "Inter-SemiBold"
//
// Texto em Inter, título em Sora, código e valores em IBM Plex Mono (ADR-0077). Glifos: estes .ttf
// são COMPLETOS, enquanto o alvo web serve o recorte latino — no nativo a fonte é asset local do
// bundle, não transferência de rede por página.
`;

let njs = cab + "\n";
njs += "// nome PostScript -> asset. É o formato que o `useFonts` do expo-font recebe.\n";
njs += "const AUREA_FONTS = {\n";
for (const m of medidos) njs += `  ${JSON.stringify(m.postscript)}: require("../files-native/${m.arquivo}"),\n`;
njs += "};\n\n";
njs += "// papel de tipografia -> peso -> nome PostScript. O sufixo `i` é o itálico.\n";
njs += `const FONT_FAMILIES = ${JSON.stringify(porPapel, null, 2)};\n\n`;
njs += "// O que foi medido em cada arquivo, para quem precisa do resto (o Android acha a fonte\n";
njs += "// pelo nome do arquivo, e algumas ferramentas de build pedem a família tipográfica).\n";
njs += `const AUREA_FONT_FILES = ${JSON.stringify(
  medidos.map((m) => ({
    file: m.arquivo, postScriptName: m.postscript, family: m.family,
    typographicFamily: m.typoFamily ?? m.family, role: m.role, weight: m.weight, style: m.style,
  })), null, 2)};\n\n`;
njs += "module.exports = {AUREA_FONTS, FONT_FAMILIES, AUREA_FONT_FILES};\n";
writeFileSync(join(dir, "dist", "fonts.native.js"), njs);

const pesos = (papel) => Object.keys(porPapel[papel]).map((k) => JSON.stringify(k)).join(" | ");
writeFileSync(join(dir, "dist", "fonts.native.d.ts"),
  "// Gerado por packages/fonts/build-fonts.mjs. NÃO EDITAR.\n"
  + "export type AureaFontRole = " + Object.keys(porPapel).map((r) => JSON.stringify(r)).join(" | ") + ";\n"
  + "export type AureaFontFile = {\n"
  + "  file: string; postScriptName: string; family: string; typographicFamily: string;\n"
  + "  role: AureaFontRole; weight: number; style: \"normal\" | \"italic\";\n"
  + "};\n"
  + "/** nome PostScript -> asset, no formato que o `useFonts` do expo-font recebe. */\n"
  + "export declare const AUREA_FONTS: Record<string, number>;\n"
  + "/** papel -> peso -> nome PostScript, que é o que vai em `fontFamily`. */\n"
  + "export declare const FONT_FAMILIES: {\n"
  + Object.keys(porPapel).map((r) => `  ${r}: Record<${pesos(r)}, string>;`).join("\n") + "\n"
  + "};\n"
  + "export declare const AUREA_FONT_FILES: readonly AureaFontFile[];\n");

console.log("build-fonts: wrote packages/fonts/dist/fonts.css (+fonts.css.d.ts)");
console.log(`build-fonts: wrote packages/fonts/dist/fonts.native.js — ${medidos.length} .ttf, `
  + `nomes PostScript medidos na tabela \`name\` (+fonts.native.d.ts)`);
