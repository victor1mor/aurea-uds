// Aurea — build the standalone core stylesheet.
// dist/aurea.css = generated tokens CSS + core component CSS (single file for consumers).
// dist/aurea.js  = verbatim copy of src (no transform yet).
// Run build-tokens.mjs first so the tokens CSS is current.
import {readFileSync, writeFileSync, copyFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensCss = readFileSync(join(root, "packages/tokens/dist/aurea.tokens.css"), "utf8");
const coreSrc = readFileSync(join(root, "packages/core/src/aurea.css"), "utf8");

// @layer aurea (Fase 6, achado M16): sem camada, o CSS do consumidor briga por
// especificidade com a biblioteca e perde para qualquer seletor nosso mais específico. Regra
// em camada nomeada perde de propósito para regra sem camada, então o app sobrepõe a Aurea
// escrevendo CSS normal — sem !important, sem caçar especificidade.
//
// Os TOKENS entram na camada JUNTO com o core, e isso não é detalhe. Primeira tentativa foi
// deixá-los fora, no raciocínio de que custom property não disputa cascata por camada. É
// falso: a DECLARAÇÃO de uma custom property compete como qualquer outra. Com os tokens fora,
// o `:root{--sidebar-width:216px}` que o core declara dentro de um @media passou a perder
// para o valor base, a lateral saltou de 200px para 248px e os baselines acusaram na hora.
// Dentro da mesma camada, a cascata interna é a de sempre — e o consumidor que escreve um
// :root sem camada continua vencendo os dois, que é o objetivo.
// A camada é aplicada no dist e não na fonte: `src` continua legível e diffável linha a linha.
writeFileSync(join(root, "packages/core/dist/aurea.css"),
  "@layer aurea{\n" + tokensCss + coreSrc + "}\n");
copyFileSync(join(root, "packages/core/src/aurea.js"), join(root, "packages/core/dist/aurea.js"));

// A declaração do subpath `./css`. Achado pela aplicação de prova do item A3 (06/08/2026): sem
// ela, `import "@aurea-uds/core/css"` reprova com **TS2882** em QUALQUER consumidor TypeScript —
// medido nos dois empacotadores, Next 16 e Vite 8, com TS 7 e `moduleResolution: "bundler"`. Não
// é aviso: é erro de compilação, e quebra no consumidor. A folha não exporta nada, então o
// arquivo é só o alvo da condição `types` do mapa `exports`.
writeFileSync(join(root, "packages/core/dist/aurea.css.d.ts"),
  "// Gerado por scripts/build-core.mjs. A folha de estilo não exporta nada — este arquivo\n"
  + "// existe para a condição `types` do subpath ./css do mapa `exports`.\n"
  + "export {};\n");
console.log("build-core: wrote packages/core/dist/aurea.css (+aurea.js, +aurea.css.d.ts)");
