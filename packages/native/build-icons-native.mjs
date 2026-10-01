// Aurea — gera icons/<nome>.js a partir do @phosphor-icons/core, para o alvo NATIVO.
//
// ADR-0038 (um arquivo por ícone) e ADR-0053 (o Phosphor no lugar do Carbon, 01/10/2026). Irmão
// do `packages/icons/build-icons.mjs`, que consome ESTA MESMA FONTE para montar o sprite da web,
// e usa as mesmas funções dele (`nomesDoPhosphor`, `mioloDoPhosphor`): uma fonte, dois alvos.
//
// DUAS FORMAS POR ÍCONE: `icons/house.js` (Regular) e `icons/house-fill.js` (o cheio, do item
// escolhido). Os logotipos de marca (`*-logo`) ficam fora, pelo CLAUDE.md §5.
//
// POR QUE UM ARQUIVO POR ÍCONE, e não o sprite. Na web o `Icon` desenha `<use href="…#id">`
// contra um arquivo externo. No React Native esse caminho não existe: o `react-native-svg`
// resolve `<Use>` dentro da mesma árvore, nunca contra um arquivo externo por URL.
//
// POR QUE `./icons/*` É A FORMA DOCUMENTADA. O tree-shaking do Metro é experimental. Um barril
// com milhares de ícones seria aposta na configuração do bundler do CONSUMIDOR. Caminho profundo
// não depende de poda nenhuma: módulo não importado não entra no grafo.
//
// POR QUE `createElement` e não JSX. O arquivo gerado é publicado como está e o Metro do
// consumidor o lê. JSX exigiria que o preset dele transformasse arquivos dentro de `node_modules`.
//
// A COR: o Phosphor põe `fill="currentColor"` na raiz do SVG e nada nos `<path>`. `currentColor`
// não existe no React Native, então cada `Path` recebe `fill: color` — a cor que o `Icon` passa.
import {writeFileSync, rmSync, mkdirSync} from "node:fs";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {escreverNomesDeIcone} from "../../scripts/icon-names.mjs";
import {nomesDoPhosphor, mioloDoPhosphor} from "../icons/build-icons.mjs";

const require = createRequire(import.meta.url);
const phosphor = join(dirname(dirname(require.resolve("@phosphor-icons/core"))), "assets");
const raiz = dirname(fileURLToPath(import.meta.url));
const saidaDir = join(raiz, "icons");

/** `house-fill` -> `HouseFill`. Identificador não abre com dígito. */
function pascal(nome) {
  const p = nome.split(/[^A-Za-z0-9]+/).filter(Boolean)
    .map((x) => x[0].toUpperCase() + x.slice(1)).join("");
  return /^[0-9]/.test(p) ? "Icon" + p : p;
}

rmSync(saidaDir, {recursive: true, force: true});
mkdirSync(saidaDir, {recursive: true});

const CABECALHO = "// GERADO por packages/native/build-icons-native.mjs. NÃO EDITAR.\n"
  + "// Glifo do @phosphor-icons/core (Phosphor Icons, MIT) — ver NOTICE. Desenho copiado sem alteração.\n";

const nomes = nomesDoPhosphor(phosphor);
const usados = new Map();
const barril = [];
for (const base of nomes) {
  for (const [nome, arquivo] of [[base, join(phosphor, "regular", base + ".svg")],
                                 [base + "-fill", join(phosphor, "fill", base + "-fill.svg")]]) {
    const comp = pascal(nome);
    if (usados.has(comp)) throw new Error(`nome de componente repetido: ${comp} (${usados.get(comp)} e ${nome})`);
    usados.set(comp, nome);
    const caminhos = [...mioloDoPhosphor(arquivo).matchAll(/<path d="([^"]+)"\s*\/?>/g)].map((m) => m[1]);
    if (!caminhos.length) throw new Error(`${arquivo}: nenhum <path> desenhável`);
    writeFileSync(join(saidaDir, `${nome}.js`),
      CABECALHO
      + `import * as React from "react";\n`
      + `import Svg, {Path} from "react-native-svg";\n\n`
      + `export default function ${comp}({size = 32, color = "#000000", ...rest}) {\n`
      + `  return React.createElement(Svg, {width: size, height: size, viewBox: "0 0 256 256", ...rest},\n`
      + caminhos.map((d) => `    React.createElement(Path, {d: ${JSON.stringify(d)}, fill: color})`).join(",\n")
      + "\n  );\n}\n");
    writeFileSync(join(saidaDir, `${nome}.d.ts`),
      CABECALHO
      + `import type * as React from "react";\n`
      + `import type {AureaIconProps} from "./props.js";\n`
      + `declare const ${comp}: (props: AureaIconProps) => React.ReactElement;\n`
      + `export default ${comp};\n`);
    barril.push({nome, comp});
  }
}

writeFileSync(join(saidaDir, "props.d.ts"),
  CABECALHO
  + `import type {SvgProps} from "react-native-svg";\n\n`
  + `export type AureaIconProps = Omit<SvgProps, "color"> & {\n`
  + `  /** Lado do quadrado, em dp. O desenho é 256x256 e escala a partir daí. */\n`
  + `  size?: number;\n`
  + `  /**\n`
  + `   * Cor do glifo. O padrão é PRETO EXPLÍCITO, não herança: \`currentColor\` não existe no\n`
  + `   * React Native. Passe a cor do tema — \`useAureaTokens().color.foreground\` — em vez de\n`
  + `   * aceitar o padrão.\n`
  + `   */\n`
  + `  color?: string;\n`
  + `};\n`);
writeFileSync(join(saidaDir, "props.js"), CABECALHO + "export {};\n");

writeFileSync(join(saidaDir, "index.js"),
  CABECALHO
  + `//\n// ⚠ ESTE BARRIL NÃO É A FORMA DOCUMENTADA. Ele traz os ${barril.length} ícones ao grafo do bundler\n`
  + "// a menos que o tree-shaking do Metro (experimental, três flags, só em produção) esteja\n"
  + "// ligado. A forma que não depende de configuração alheia é o caminho profundo:\n"
  + "//\n//     import Plus from \"@aurea-uds/native/icons/plus\";\n//\n"
  + barril.map(({nome, comp}) => `export {default as ${comp}} from "./${nome}.js";`).join("\n") + "\n");
writeFileSync(join(saidaDir, "index.d.ts"),
  CABECALHO
  + barril.map(({nome, comp}) => `export {default as ${comp}} from "./${nome}.js";`).join("\n") + "\n");

// A-04: a mesma lista, como tipo, para o `<Icon name>` do nativo recusar nome que não existe.
escreverNomesDeIcone(nomes, join(raiz, "src", "icon-names.ts"));

console.log(`build-icons-native: wrote ${nomes.length} icons x 2 weights -> ${saidaDir}`);
