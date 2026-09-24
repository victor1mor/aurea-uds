// Gera dist/aurea-icons.svg a partir de TODOS os ícones 32px do @carbon/icons.
// Um <symbol id="i-<nome>"> por ícone; o React <Icon name> referencia por <use href>.
// Determinístico (ordem alfabética) para o build ser reprodutível (gate git-clean da CI).
//
// Só o set svg/32 (viewBox 0 0 32 32, a mesma do sprite histórico). As pastas
// 16/20/24 do Carbon são o MESMO ícone reotimizado para tamanhos menores, não
// glifos novos — incluí-las duplicaria ids. O CSS escala o 32 via .icon.
import {readFileSync, writeFileSync, readdirSync} from "node:fs";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const require = createRequire(import.meta.url);
const carbonDir = dirname(require.resolve("@carbon/icons/package.json"));
const svgDir = join(carbonDir, "svg", "32");
const outFile = join(dirname(fileURLToPath(import.meta.url)), "dist", "aurea-icons.svg");

const files = readdirSync(svgDir).filter((f) => f.endsWith(".svg")).sort();

const symbols = files.map((file) => {
  const name = file.replace(/\.svg$/, "");
  const svg = readFileSync(join(svgDir, file), "utf8");
  // Conteúdo entre <svg …> e </svg> (preserva múltiplos paths, fill="none", etc.).
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  return `<symbol id="i-${name}" viewBox="0 0 32 32">${inner}</symbol>`;
});

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${symbols.join("")}</svg>`;
writeFileSync(outFile, sprite);
console.log(`build-icons: wrote ${files.length} icons -> ${outFile}`);
