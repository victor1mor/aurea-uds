// Inventário do §9 — `shark-ui` (`Referencia/shark-ui-main`).
//
// Oitava das nove. Duas coisas só aparecem aqui, e é por isso que ela está no quadro:
//
// 1. Um QUINTO MOTOR headless — `@ark-ui/react`. O quadro agora tem Base UI (a aposta da Aurea),
//    Radix, react-aria, o próprio da MUI e o Ark. Cinco.
// 2. Cada componente declara os PRÓPRIOS TOKENS e as PRÓPRIAS KEYFRAMES, em `cssVars` e `css`
//    do manifesto. Nenhuma das outras sete faz isso — e é exatamente a pergunta que a Aurea tem
//    de responder toda vez que um componente precisa de um valor novo: de quem é o token?
//
// O formato é o OITAVO do quadro (§184): módulo TypeScript por componente, exportando um objeto
// `RegistryItemType`. Não é JSON (como o shadcn), não é `package.json` (como o kibo), não é prosa
// (como o reui) — é código tipado, o que significa que o manifesto é conferido pelo compilador.
//
// Rodar:  node audit/activity-2/inventory-shark.mjs
// Escreve: audit/activity-2/INVENTORY-SHARK.json

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {atributosData} from "./data-attrs.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/shark-ui-main/shark-ui-main");
const MAN = path.join(BASE, "registry/manifest");
const REACT = path.join(BASE, "registry/react");

if (!fs.existsSync(MAN)) {
  console.error("Referencia/shark-ui-main ausente. Ver audit/activity-2/02-FONTES.md.");
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";
const unico = (a) => [...new Set(a)].sort();
const ler = (f) => fs.readFileSync(f, "utf8");
const arquivos = (p, ext) => fs.existsSync(p)
  ? fs.readdirSync(p).filter((f) => f.endsWith(ext)).sort() : [];

let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* INCONCLUSIVO, como o §9 manda */ }

/** Objeto literal que começa na `{` de `pos`, por chaves equilibradas. Mesma função que o
 *  extrator do shadcn precisou: regex não fecha objeto aninhado, e aqui há `css` com keyframes
 *  aninhadas duas vezes. */
function objeto(texto, pos) {
  let n = 0;
  for (let k = pos; k < texto.length; k++) {
    if (texto[k] === "{") n++;
    else if (texto[k] === "}" && --n === 0) return texto.slice(pos, k + 1);
  }
  return "";
}
function blocoDe(texto, nome) {
  const m = texto.match(new RegExp(`const ${nome}\\s*=\\s*`));
  if (!m) return "";
  const i = texto.indexOf("{", m.index);
  return i < 0 ? "" : objeto(texto, i);
}

const componentes = [];
for (const f of arquivos(MAN, ".ts")) {
  const nome = f.slice(0, -3);
  const man = ler(path.join(MAN, f));
  const src = path.join(REACT, "components", `${nome}.tsx`);
  const t = fs.existsSync(src) ? ler(src) : "";
  const exemplo = path.join(REACT, "examples", nome);

  const deps = unico([...(blocoDe(man, "dependencies") || man.match(/dependencies\s*=\s*\[([^\]]*)\]/)?.[1] || "")
    .matchAll(/"([^"]+)"/g)].map((m) => m[1]));
  const vars = blocoDe(man, "cssVars");
  const css = blocoDe(man, "css");
  componentes.push({
    nome,
    tipo: man.match(/type:\s*"([^"]+)"/)?.[1] ?? NA,
    dependencias: deps,
    // A pergunta que só esta fonte responde: o componente traz token PRÓPRIO?
    tokensProprios: unico([...vars.matchAll(/"(--[\w-]+)"/g)].map((m) => m[1])),
    keyframes: unico([...css.matchAll(/"@keyframes ([\w-]+)"/g)].map((m) => m[1])),
    temCssProprio: css.length > 0,
    // anatomia, do fonte
    temFonte: t.length > 0,
    temExemplo: fs.existsSync(exemplo),
    composicoes: fs.existsSync(exemplo)
      ? fs.readdirSync(exemplo).filter((f) => f.endsWith(".tsx")).length : 0,
    exporta: unico([...t.matchAll(/^export (?:const|function) ([A-Z]\w+)/gm)].map((m) => m[1])),
    primitivesArk: unico([...t.matchAll(/from "@ark-ui\/react\/?([\w-]*)"/g)].map((m) => m[1] || "raiz")),
    // Os três campos saem do MESMO extrator, compartilhado pelas cinco fontes medidas —
    // ver o cabeçalho de `data-attrs.mjs`. `estadosData` continua sendo a UNIÃO.
    estadosData: atributosData(t).todos,
    estadosEmitidos: atributosData(t).emitidos,
    estadosReagidos: atributosData(t).reagidos,
    ariaEmitidos: unico([...t.matchAll(/\baria-([a-z]+)[=:]/g)].map((m) => m[1])),
    linhas: t ? t.split("\n").length : 0,
  });
}

const saida = {
  fonte: "shark-ui", caminho: "Referencia/shark-ui-main", commit,
  medidoEm: new Date().toISOString().slice(0, 10),
  metodo: "módulo TypeScript por componente em registry/manifest + fonte em registry/react",
  totais: {
    manifestos: componentes.length,
    comFonte: componentes.filter((c) => c.temFonte).length,
    comExemplo: componentes.filter((c) => c.temExemplo).length,
    composicoes: componentes.reduce((a, c) => a + c.composicoes, 0),
    sobreArk: componentes.filter((c) => c.primitivesArk.length).length,
    // o dado exclusivo desta fonte
    comTokenProprio: componentes.filter((c) => c.tokensProprios.length).length,
    tokensProprios: unico(componentes.flatMap((c) => c.tokensProprios)).length,
    comKeyframes: componentes.filter((c) => c.keyframes.length).length,
    keyframesDistintas: unico(componentes.flatMap((c) => c.keyframes)).length,
    estadosDistintos: unico(componentes.flatMap((c) => c.estadosData)).length,
    blocos: arquivos(path.join(REACT, "blocks"), ".tsx").length
      + fs.readdirSync(path.join(REACT, "blocks"), {withFileTypes: true}).filter((d) => d.isDirectory()).length,
    templates: fs.existsSync(path.join(REACT, "templates"))
      ? fs.readdirSync(path.join(REACT, "templates")).length : 0,
  },
  tokensPorComponente: componentes.filter((c) => c.tokensProprios.length)
    .map((c) => ({nome: c.nome, tokens: c.tokensProprios})),
  componentes,
};
fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-SHARK.json"), JSON.stringify(saida, null, 2) + "\n");
console.log(`inventory-shark: ${saida.totais.manifestos} manifestos, ${saida.totais.comFonte} com fonte, `
  + `${saida.totais.sobreArk} sobre Ark UI, ${saida.totais.tokensProprios} tokens declarados por componente, `
  + `${saida.totais.keyframesDistintas} keyframes, ${saida.totais.composicoes} composições`);
