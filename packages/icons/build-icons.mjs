// Gera dist/aurea-icons.svg a partir do @phosphor-icons/core (ADR-0053, 01/10/2026).
// Um <symbol id="i-<nome>"> por ícone; o React <Icon name> referencia por <use href>.
// Determinístico (ordem alfabética) para o build ser reprodutível (gate git-clean da CI).
//
// DUAS FORMAS POR ÍCONE: o peso Regular (`i-house`) e o cheio (`i-house-fill`). O cheio é o do
// item escolhido (aba ativa, item atual do menu) — decisão do Victor, ADR-0053. Os nomes são os
// dos arquivos do Phosphor, sem tradução: `assets/regular/house.svg` e `assets/fill/house-fill.svg`.
//
// SEM LOGOTIPOS: os 79 arquivos do Phosphor com `-logo` no nome (`apple-logo`,
// `gitlab-logo-simple`…) são marcas de terceiros, e o CLAUDE.md §5 não deixa marca registrada de
// terceiro entrar numa biblioteca Apache-2.0. Ficam fora do sprite, do tipo e do nativo. O filtro
// é `-logo` em qualquer ponto do nome: `gitlab-logo-simple` não termina em `-logo` e escapou da
// primeira versão — quem pegou foi o teste `nenhum logotipo de marca entra`.
//
// A TRAVA: o Phosphor 2.1.1 só usa `<path d>`, medido nos 3.024 arquivos de Regular e Fill. Se
// uma versão nova trouxer outro elemento ou atributo, este build morre em vez de sair errado.
import {readFileSync, writeFileSync, readdirSync} from "node:fs";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {escreverNomesDeIcone} from "../../scripts/icon-names.mjs";

const require = createRequire(import.meta.url);
const phosphor = join(dirname(dirname(require.resolve("@phosphor-icons/core"))), "assets");
const outFile = join(dirname(fileURLToPath(import.meta.url)), "dist", "aurea-icons.svg");

/** Os nomes que a Aurea desenha: os do Regular, menos os logotipos de marca. */
export function nomesDoPhosphor(dir) {
  return readdirSync(join(dir, "regular")).filter((f) => f.endsWith(".svg"))
    .map((f) => f.replace(/\.svg$/, "")).filter((n) => !/-logo(-|$)/.test(n)).sort();
}

/** O miolo do SVG, conferido contra o que foi medido. */
export function mioloDoPhosphor(arquivo) {
  const svg = readFileSync(arquivo, "utf8");
  if (!/viewBox="0 0 256 256"/.test(svg)) throw new Error(`${arquivo}: viewBox fora de 0 0 256 256`);
  const miolo = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  for (const tag of miolo.matchAll(/<([A-Za-z]+)([^>]*)>/g)) {
    if (tag[1] !== "path") throw new Error(`${arquivo}: elemento <${tag[1]}> fora do medido (só <path>)`);
    const attrs = [...tag[2].matchAll(/([A-Za-z-]+)\s*=/g)].map((m) => m[1]);
    if (attrs.some((a) => a !== "d")) throw new Error(`${arquivo}: atributo fora do medido (só d): ${attrs}`);
  }
  return miolo;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const nomes = nomesDoPhosphor(phosphor);
  const symbols = [];
  for (const n of nomes) {
    symbols.push(`<symbol id="i-${n}" viewBox="0 0 256 256">${mioloDoPhosphor(join(phosphor, "regular", n + ".svg"))}</symbol>`);
    symbols.push(`<symbol id="i-${n}-fill" viewBox="0 0 256 256">${mioloDoPhosphor(join(phosphor, "fill", n + "-fill.svg"))}</symbol>`);
  }
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${symbols.join("")}</svg>`;
  writeFileSync(outFile, sprite);
  // A-04: a mesma lista, como tipo, para o `<Icon name>` recusar nome que não existe no sprite.
  escreverNomesDeIcone(nomes, join(dirname(fileURLToPath(import.meta.url)), "..", "react", "src", "icon-names.ts"));
  console.log(`build-icons: wrote ${nomes.length} icons x 2 weights -> ${outFile}`);
}
