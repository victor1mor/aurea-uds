// Aurea — gera icons/<nome>.js a partir dos SVGs 32px do @carbon/icons, para o alvo NATIVO.
//
// ADR-0038. Irmão do `packages/icons/build-icons.mjs`, que consome ESTA MESMA FONTE para montar
// o sprite da web: uma fonte, dois alvos — o mesmo desenho que a Etapa 2 usou para os tokens.
//
// POR QUE UM ARQUIVO POR ÍCONE, e não o sprite. Na web o `Icon` desenha `<use href="…#id">`
// contra um arquivo de 1,2 MB. No React Native esse caminho não existe: o `react-native-svg`
// resolve `<Use>` dentro da mesma árvore, nunca contra um arquivo externo por URL.
//
// POR QUE `./icons/*` É A FORMA DOCUMENTADA. O tree-shaking do Metro é experimental — três
// flags, só em produção, e a própria Expo o descreve como *"very experimental"*. Um barril com
// 2571 ícones seria aposta na configuração do bundler do CONSUMIDOR. Caminho profundo não
// depende de poda nenhuma: módulo não importado não entra no grafo. O barril existe para quem
// tem a poda ligada, e a documentação diz qual é qual.
//
// POR QUE `createElement` e não JSX. O arquivo gerado não passa por compilador nosso — ele é
// publicado como está e o Metro do consumidor o lê. JSX exigiria que o preset dele transformasse
// arquivos dentro de `node_modules`, que é justamente o tipo de dependência de configuração
// alheia que a cláusula 1 da ADR existe para não ter.
//
// A TRAVA QUE IMPORTA: qualquer elemento ou atributo fora do conjunto MEDIDO faz este build
// MORRER. Sem isso, uma versão nova do Carbon introduziria um recurso que o react-native-svg não
// desenha e o ícone sairia errado — ou vazio — sem nada acusar. É a mesma regra que o gerador de
// tokens aprendeu na Etapa 2: emitir `undefined` em silêncio é pior do que não emitir.
import {readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync} from "node:fs";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {escreverNomesDeIcone} from "../../scripts/icon-names.mjs";

const require = createRequire(import.meta.url);
const carbonDir = dirname(require.resolve("@carbon/icons/package.json"));
const svgDir = join(carbonDir, "svg", "32");
const raiz = dirname(fileURLToPath(import.meta.url));
const saidaDir = join(raiz, "icons");

// ── o que o react-native-svg desenha, medido contra os 2571 arquivos ───────
// elemento SVG -> componente do react-native-svg.
const ELEMENTOS = {path: "Path", circle: "Circle", rect: "Rect", g: "G"};
// atributo SVG -> prop. `null` = medido e DESCARTADO de propósito.
const ATRIBUTOS = {
  d: "d", cx: "cx", cy: "cy", r: "r", x: "x", y: "y",
  width: "width", height: "height", rx: "rx", opacity: "opacity",
  transform: "transform", fill: "fill",
  "stroke-width": "strokeWidth", "fill-rule": "fillRule",
  // Metadado do Carbon para marcar o contorno interno de um glifo "filled". Não tem efeito de
  // desenho, e o `react-native-svg` não tem onde pôr um `data-*`.
  "data-icon-path": null,
};

const arquivos = readdirSync(svgDir).filter((f) => f.endsWith(".svg")).sort();

/** `checkmark--filled` -> `CheckmarkFilled`. `4K` -> `Icon4K`: identificador não abre com dígito. */
function pascal(nome) {
  const p = nome.split(/[^A-Za-z0-9]+/).filter(Boolean)
    .map((x) => x[0].toUpperCase() + x.slice(1)).join("");
  return /^[0-9]/.test(p) ? "Icon" + p : p;
}

/** Lê os atributos de uma tag, traduzindo nomes e morrendo no que não foi medido. */
function lerAtributos(tag, arquivo) {
  const attrs = {};
  for (const m of tag.matchAll(/([A-Za-z-]+)\s*=\s*"([^"]*)"/g)) {
    const [, nome, valor] = m;
    if (nome === "xmlns" || nome === "viewBox") continue;
    if (!(nome in ATRIBUTOS)) {
      throw new Error(`${arquivo}: atributo '${nome}' não está no conjunto medido. Se o Carbon `
        + `passou a emitir isto, confira se o react-native-svg desenha e acrescente ao mapa `
        + `ATRIBUTOS — não deixe passar em silêncio.`);
    }
    const prop = ATRIBUTOS[nome];
    if (prop !== null) attrs[prop] = valor;
  }
  return attrs;
}

/**
 * Converte o miolo de um SVG do Carbon em chamadas de `createElement`.
 *
 * `<switch>` e `<foreignObject>`: 10 dos 2571 arquivos vêm com sujeira do Adobe Illustrator —
 * `<switch><foreignObject width="1" height="1" requiredExtensions="…adobe…"/><g>DESENHO</g></switch>`.
 * O navegador pula o `foreignObject` (não suporta a extensão) e desenha o `<g>`. O que fazemos
 * aqui é exatamente isso, e nada além: descartar o `foreignObject`, desdobrar o `switch`.
 * Não é interpretação — é o comportamento definido do `<switch>` do SVG.
 */
function converter(miolo, arquivo, injetarCor) {
  const nos = [];
  // Tags de um nível, com o conteúdo quando houver. Os SVGs do Carbon são gerados e planos;
  // o único aninhamento medido é `switch > g > path`.
  const re = /<([A-Za-z]+)([^>]*?)(\/?)>/g;
  let m;
  const pilha = [nos];
  while ((m = re.exec(miolo)) !== null) {
    const [, tag, corpo, fechaSozinho] = m;
    const alvo = pilha[pilha.length - 1];
    if (tag === "foreignObject") {
      // Placeholder 1x1 do Illustrator. Se um dia vier com conteúdo, o fecha-tag abaixo o ignora
      // junto — e o `requiredExtensions` já disse que nem o navegador o desenha.
      if (!fechaSozinho) pilha.push([]);
      continue;
    }
    if (tag === "switch") { if (!fechaSozinho) pilha.push(alvo); continue; }
    if (!(tag in ELEMENTOS)) {
      throw new Error(`${arquivo}: elemento <${tag}> não está no conjunto medido. O `
        + `react-native-svg não desenha o que não conhece, e o ícone sairia vazio em silêncio.`);
    }
    const attrs = lerAtributos(corpo, arquivo);
    // A cláusula 2 da ADR-0038, com a correção que a medição obrigou: injetar a cor onde o
    // atributo FALTA, nunca por cima do que existe. `currentColor` aparece em ZERO dos arquivos
    // (na web a cor vem da AUSÊNCIA de `fill`, herdada por CSS — e no RN não há herança), mas
    // `fill="none"` aparece em 91 lugares, e é o contorno interno dos glifos "filled". Pintar
    // esse `none` encheria o miolo do ícone e cobriria o desenho.
    if (injetarCor && tag !== "g" && !("fill" in attrs)) attrs.fill = "__COR__";
    const no = {tag: ELEMENTOS[tag], attrs, filhos: []};
    alvo.push(no);
    if (!fechaSozinho) pilha.push(no.filhos);
  }
  return nos;
}

function emitir(nos, indent) {
  const pad = " ".repeat(indent);
  return nos.map((n) => {
    const props = Object.entries(n.attrs)
      .map(([k, v]) => `${k}: ${v === "__COR__" ? "color" : JSON.stringify(v)}`).join(", ");
    const filhos = n.filhos.length ? ",\n" + emitir(n.filhos, indent + 2) : "";
    return `${pad}React.createElement(${n.tag}, {${props}}${filhos ? filhos + `\n${pad}` : ""})`;
  }).join(",\n");
}

rmSync(saidaDir, {recursive: true, force: true});
mkdirSync(saidaDir, {recursive: true});

const CABECALHO = "// GERADO por packages/native/build-icons-native.mjs. NÃO EDITAR.\n"
  + "// Glifo do @carbon/icons (IBM Corp., Apache-2.0) — ver NOTICE. Desenho copiado sem alteração.\n";

const usados = new Map();
const barril = [];
for (const arquivo of arquivos) {
  const nome = arquivo.replace(/\.svg$/, "");
  const comp = pascal(nome);
  if (usados.has(comp)) {
    throw new Error(`nome de componente repetido: ${comp} (${usados.get(comp)} e ${nome})`);
  }
  usados.set(comp, nome);

  const svg = readFileSync(join(svgDir, arquivo), "utf8");
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  if (viewBox !== "0 0 32 32") throw new Error(`${arquivo}: viewBox inesperado (${viewBox})`);
  const miolo = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  const nos = converter(miolo, arquivo, true);
  if (!nos.length) throw new Error(`${arquivo}: nenhum elemento desenhável`);

  const usadosAqui = new Set();
  (function varrer(lista) {
    for (const n of lista) { usadosAqui.add(n.tag); varrer(n.filhos); }
  })(nos);
  const importados = [...usadosAqui].sort().join(", ");

  writeFileSync(join(saidaDir, `${nome}.js`),
    CABECALHO
    + `import * as React from "react";\n`
    + `import Svg, {${importados}} from "react-native-svg";\n\n`
    + `export default function ${comp}({size = 32, color = "#000000", ...rest}) {\n`
    + `  return React.createElement(Svg, {width: size, height: size, viewBox: "0 0 32 32", ...rest},\n`
    + emitir(nos, 4) + "\n  );\n}\n");

  writeFileSync(join(saidaDir, `${nome}.d.ts`),
    CABECALHO
    + `import type * as React from "react";\n`
    + `import type {AureaIconProps} from "./props.js";\n`
    // `React.ReactElement` e não `JSX.Element`: o namespace JSX global depende da configuração
    // `jsx` do CONSUMIDOR, e o React 19 o move para `React.JSX`. Mesma regra do `createElement`.
    + `declare const ${comp}: (props: AureaIconProps) => React.ReactElement;\n`
    + `export default ${comp};\n`);

  barril.push({nome, comp});
}

// O tipo mora AQUI, e não em `src/`, para o subpath `./icons/*` ser autossuficiente: um `.d.ts`
// de ícone que apontasse para `../dist/` amarraria os dois alvos por um caminho relativo.
writeFileSync(join(saidaDir, "props.d.ts"),
  CABECALHO
  + `import type {SvgProps} from "react-native-svg";\n\n`
  + `export type AureaIconProps = Omit<SvgProps, "color"> & {\n`
  + `  /** Lado do quadrado, em dp. O desenho é 32x32 e escala a partir daí. */\n`
  + `  size?: number;\n`
  + `  /**\n`
  + `   * Cor do glifo. O padrão é PRETO EXPLÍCITO, não herança: \`currentColor\` não existe no\n`
  + `   * React Native, e o desenho do Carbon não traz \`fill\` nenhum. Passe a cor do tema —\n`
  + `   * \`useAureaTokens().color.foreground\` — em vez de aceitar o padrão.\n`
  + `   */\n`
  + `  color?: string;\n`
  + `};\n`);
writeFileSync(join(saidaDir, "props.js"), CABECALHO + "export {};\n");

// O barril, e o aviso que ele PRECISA carregar: importar daqui traz os 2571 ao grafo do Metro,
// a menos que o consumidor tenha o tree-shaking experimental ligado. A forma documentada é o
// caminho profundo. Não é preferência de estilo — é a diferença entre 40 ícones e 2571 no app.
writeFileSync(join(saidaDir, "index.js"),
  CABECALHO
  + "//\n// ⚠ ESTE BARRIL NÃO É A FORMA DOCUMENTADA. Ele traz os 2571 ícones ao grafo do bundler\n"
  + "// a menos que o tree-shaking do Metro (experimental, três flags, só em produção) esteja\n"
  + "// ligado. A forma que não depende de configuração alheia é o caminho profundo:\n"
  + "//\n//     import Add from \"@aurea-uds/native/icons/add\";\n//\n"
  + barril.map(({nome, comp}) => `export {default as ${comp}} from "./${nome}.js";`).join("\n") + "\n");
writeFileSync(join(saidaDir, "index.d.ts"),
  CABECALHO
  + barril.map(({nome, comp}) => `export {default as ${comp}} from "./${nome}.js";`).join("\n") + "\n");

// A-04: a mesma lista, como tipo, para o `<Icon name>` do nativo recusar nome que não existe.
escreverNomesDeIcone(barril.map(({nome}) => nome), join(raiz, "src", "icon-names.ts"));

console.log(`build-icons-native: wrote ${barril.length} icons -> ${saidaDir}`);
