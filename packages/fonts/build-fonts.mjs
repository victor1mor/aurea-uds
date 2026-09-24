// Aurea — generate dist/fonts.css (web) and dist/fonts.native.js (React Native) from the
// committed font binaries. The files/ and files-native/ binaries are the source of truth.
//
// DOIS ALVOS, UMA LISTA. O alvo web sai de `files/*.woff2`; o nativo, de `files-native/*.ttf`,
// que entrou no Lote 0 do NATIVE.md (§5.2.1) porque o React Native NÃO LÊ woff2 — sem .ttf o
// IBM Plex simplesmente não aparece no aparelho e o app cai na fonte de sistema, que é a
// identidade que o CLAUDE.md declara intocável.
//
// O nome de cada fonte no alvo nativo é MEDIDO, não escrito à mão: o iOS registra a fonte pelo
// nome PostScript, que mora na tabela `name` do próprio arquivo. Escrever "IBMPlexSans-SemiBold"
// numa constante seria uma segunda verdade sobre um byte que já existe no binário.
import {readFileSync, writeFileSync, existsSync, mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(dir, "dist"), {recursive: true});

// file -> @font-face metadata. IBM Plex, IBM Corp., SIL Open Font License 1.1.
// `role` é o token de tipografia que a fonte serve (--font-ui / --font-editorial / --font-code),
// e existe para o alvo nativo poder indexar por papel em vez de por nome de família.
const FONTS = [
  {file: "ibm-plex-sans-400-normal.woff2",  family: "IBM Plex Sans",  role: "ui",        weight: 400, style: "normal"},
  {file: "ibm-plex-sans-400-italic.woff2",  family: "IBM Plex Sans",  role: "ui",        weight: 400, style: "italic"},
  {file: "ibm-plex-sans-500-normal.woff2",  family: "IBM Plex Sans",  role: "ui",        weight: 500, style: "normal"},
  {file: "ibm-plex-sans-600-normal.woff2",  family: "IBM Plex Sans",  role: "ui",        weight: 600, style: "normal"},
  {file: "ibm-plex-sans-700-normal.woff2",  family: "IBM Plex Sans",  role: "ui",        weight: 700, style: "normal"},
  {file: "ibm-plex-serif-500-normal.woff2", family: "IBM Plex Serif", role: "editorial", weight: 500, style: "normal"},
  {file: "ibm-plex-serif-600-normal.woff2", family: "IBM Plex Serif", role: "editorial", weight: 600, style: "normal"},
  {file: "ibm-plex-serif-700-normal.woff2", family: "IBM Plex Serif", role: "editorial", weight: 700, style: "normal"},
  {file: "ibm-plex-mono-400-normal.woff2",  family: "IBM Plex Mono",  role: "code",      weight: 400, style: "normal"},
  {file: "ibm-plex-mono-500-normal.woff2",  family: "IBM Plex Mono",  role: "code",      weight: 500, style: "normal"},
  {file: "ibm-plex-mono-600-normal.woff2",  family: "IBM Plex Mono",  role: "code",      weight: 600, style: "normal"},
];

// ── alvo WEB ───────────────────────────────────────────────────────────────
let css = "/* Aurea fonts — IBM Plex (IBM Corp., SIL OFL 1.1). Generated from files/. Do not edit. */\n";
for (const f of FONTS) {
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

const medidos = FONTS.map((f) => {
  const arquivo = f.file.replace(/\.woff2$/, ".ttf");
  const caminho = join(dir, "files-native", arquivo);
  if (!existsSync(caminho)) throw new Error("missing native font file: " + arquivo);
  const nomes = readNameTable(caminho);
  return {...f, arquivo, ...nomes};
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

const cab = `// Aurea — alvo NATIVO das fontes. GERADO por packages/fonts/build-fonts.mjs. NÃO EDITAR.
//
// Lote 0 do NATIVE.md (§5.2.1). O React Native não lê woff2, então o alvo web não atravessa:
// estes são os MESMOS 11 estilos da web, em .ttf estático.
//
// ⚠ NÃO use \`fontWeight\` para escolher o peso. MEDIDO na tabela \`name\` de cada arquivo:
// só Regular, Italic e Bold moram na família "IBM Plex Sans" — o Medium está em "IBM Plex Sans
// Medium" e o SemiBold em "IBM Plex Sans SemiBold", cada um uma FAMÍLIA PRÓPRIA. É o formato
// RIBBI, e vale para as três famílias. Pedir \`fontFamily:"IBM Plex Sans"\` + \`fontWeight:"600"\`
// devolve o Regular sintetizado, não o SemiBold desenhado.
//
// A forma correta é uma só: \`fontFamily\` recebe o NOME POSTSCRIPT, que é a chave deste mapa.
// O \`FONT_FAMILIES\` abaixo faz essa tradução por papel de tipografia e peso.
//
//   import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
//   const [pronto] = useFonts(AUREA_FONTS);              // expo-font
//   <Text style={{fontFamily: FONT_FAMILIES.ui["600"]}}> // "IBMPlexSans-SemiBold"
//
// Glifos: estes .ttf são COMPLETOS, enquanto o alvo web serve o subset \`latin\`. Mesma origem
// de desenho (medido: o woff2 do repositório é byte a byte o \`latin\` do fontsource, e os dois
// vêm do Google Fonts), tamanhos diferentes — no nativo a fonte é asset local do bundle, não
// transferência de rede por página.
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
