// Inventário do §9 — `shadcn-ui` (`Referencia/ui-main`).
//
// Quinta das nove, e a primeira que é REFERÊNCIA LOCAL e FONTE EXTERNA OBRIGATÓRIA do §3 ao
// mesmo tempo. Vale por duas linhas do quadro.
//
// A FONTE DE VERDADE AQUI É UM MANIFESTO, e essa é a diferença que o §184 pede para registrar.
// As cinco declaram a própria superfície de cinco jeitos incompatíveis:
//
//   base-ui       148 enums `*DataAttributes.ts`, JSDoc por membro
//   radix         inline no JSX, `data-state={open ? 'open' : 'closed'}`
//   mui           118 `<nome>Classes.ts`, e o JSDoc diz de que TIPO é cada membro
//   untitled-ui   união literal na prop + objeto `sortCx` com a receita de cada degrau
//   shadcn-ui     `registry.json` LEGÍVEL POR MÁQUINA — 411 itens tipados, com o grafo de
//                 dependência entre eles declarado em `registryDependencies`
//
// Ser legível por máquina muda o que dá para medir: aqui não se infere a composição a partir do
// código, ela está declarada. É o que permite medir o GRAFO — quantos componentes existem para
// serem compostos, e quantas composições existem de fato.
//
// E há um dado de arquitetura que nenhuma outra referência dá: o shadcn mantém a MESMA API sobre
// TRÊS motores headless (`registry/bases/{aria,base,radix}`). Isso é um teste natural para a
// pergunta que a Aurea já fez duas vezes — "apostar na Base UI deixa buracos?" — só que medido
// por quem implementou os três.
//
// Rodar:  node audit/activity-2/inventory-shadcn.mjs
// Escreve: audit/activity-2/INVENTORY-SHADCN.json

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {atributosData} from "./data-attrs.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/ui-main/ui-main");
const V4 = path.join(BASE, "apps/v4");
const BASES = path.join(V4, "registry/bases");

if (!fs.existsSync(V4)) {
  console.error("Referencia/ui-main ausente. Ver audit/activity-2/02-FONTES.md.");
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";
const unico = (a) => [...new Set(a)].sort();
const ler = (f) => fs.readFileSync(f, "utf8");
const tsx = (p) => fs.existsSync(p)
  ? fs.readdirSync(p).filter((f) => f.endsWith(".tsx") && !f.startsWith("_")).sort()
  : [];

let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* fica INCONCLUSIVO, que é o que o §9 manda escrever em vez de omitir */ }

// ── o manifesto ────────────────────────────────────────────────────────────
const manifesto = JSON.parse(ler(path.join(V4, "registry.json")));
const porTipo = {};
for (const it of manifesto.items) (porTipo[it.type] ??= []).push(it);

// ── os três motores, componente a componente ───────────────────────────────
const MOTORES = ["aria", "base", "radix"];
const doMotor = {};
for (const m of MOTORES) doMotor[m] = new Set(tsx(path.join(BASES, m, "ui")).map((f) => f.slice(0, -4)));
const todosOsComponentes = unico(MOTORES.flatMap((m) => [...doMotor[m]]));

/** O objeto que começa em `pos` (que aponta para a `{`), delimitado por chaves equilibradas.
 *  Sem isto não dá para ler `cva`: uma regex gulosa come o `defaultVariants` junto e inventa um
 *  eixo; uma regex ancorada em indentação — que foi a primeira versão daqui — perde o `Alert`,
 *  porque cada arquivo indenta como quer. Ler chave a chave é o único jeito que não mente. */
function objeto(texto, pos) {
  let n = 0;
  for (let k = pos; k < texto.length; k++) {
    if (texto[k] === "{") n++;
    else if (texto[k] === "}" && --n === 0) return texto.slice(pos + 1, k);
  }
  return "";
}

/** Chaves de PRIMEIRO nível de um corpo de objeto, com o valor de cada uma. */
function chaves(corpo) {
  const out = [];
  let n = 0, i = 0, nome = null, ini = 0;
  for (let k = 0; k < corpo.length; k++) {
    const ch = corpo[k];
    if (ch === "{" || ch === "[" || ch === "(") { if (n++ === 0 && nome) ini = k; continue; }
    if (ch === "}" || ch === "]" || ch === ")") { 
      if (--n === 0 && nome) { out.push([nome, corpo.slice(ini, k + 1)]); nome = null; }
      continue;
    }
    if (n !== 0) continue;
    if (ch === ":") {
      const antes = corpo.slice(i, k).trim().replace(/^["']|["']$/g, "");
      if (/^[\w-]+$/.test(antes)) nome = antes;
      // valor simples (string numa linha), fecha aqui mesmo
      const resto = corpo.slice(k + 1);
      const m = resto.match(/^\s*(["'`])/);
      if (m && nome) {
        const fim = k + 1 + resto.indexOf(m[1], m.index + m[0].length - 1) + 1;
        out.push([nome, corpo.slice(k + 1, fim)]); nome = null; i = fim; continue;
      }
    }
    if (ch === ",") i = k + 1;
  }
  return out;
}

/** `cva({variants: {...}})` — o contrato de eixos, que no shadcn é sempre um objeto cva. */
function eixosCva(texto) {
  const i = texto.indexOf("variants:");
  if (i < 0) return {};
  const abre = texto.indexOf("{", i);
  if (abre < 0) return {};
  const out = {};
  for (const [eixo, valor] of chaves(objeto(texto, abre))) {
    if (!valor.trimStart().startsWith("{")) continue;   // eixo é objeto de degraus
    const degraus = chaves(objeto(valor, valor.indexOf("{"))).map(([d]) => d);
    if (degraus.length) out[eixo] = unico(degraus);
  }
  return out;
}

const componentes = [];
for (const nome of todosOsComponentes) {
  const emQuais = MOTORES.filter((m) => doMotor[m].has(nome));
  // O corpo medido é o da base `base` quando existe — é o motor que a Aurea usa, e comparar
  // maçã com maçã é o que torna o achado utilizável. Sem ela, o primeiro que houver, e o campo
  // `medidoEm` diz qual foi: o §9 proíbe lacuna silenciosa.
  const medidoEm = emQuais.includes("base") ? "base" : (emQuais[0] ?? INC);
  const arq = medidoEm === INC ? null : path.join(BASES, medidoEm, "ui", `${nome}.tsx`);
  const t = arq && fs.existsSync(arq) ? ler(arq) : "";
  const ficha = manifesto.items.find((x) => x.name === nome && x.type === "registry:ui");
  const eixos = eixosCva(t);
  componentes.push({
    nome,
    motores: emQuais,
    exclusivoDe: emQuais.length === 1 ? emQuais[0] : NA,
    medidoEm,
    titulo: ficha?.title ?? NA,
    descricao: ficha?.description ?? NA,
    noManifesto: !!ficha,
    dependencias: ficha?.dependencies ?? [],
    dependeDeOutrosItens: ficha?.registryDependencies ?? [],
    arquivos: ficha?.files?.length ?? 0,
    primitivesDoMotor: unico([...t.matchAll(/from "@(?:base-ui\/react|radix-ui|react-aria-components)([^"]*)"/g)]
      .map((m) => m[1].replace(/^\//, "") || "raiz")),
    subcomponentes: unico([...t.matchAll(/^function ([A-Z]\w+)/gm)].map((m) => m[1])),
    slots: unico([...t.matchAll(/data-slot="([\w-]+)"/g)].map((m) => m[1])),
    eixos,
    variantes: eixos.variant ?? [],
    tamanhos: eixos.size ?? [],
    outrosEixos: Object.keys(eixos).filter((k) => k !== "variant" && k !== "size"),
    // Os três campos saem do MESMO extrator, compartilhado pelas cinco fontes medidas —
    // ver o cabeçalho de `data-attrs.mjs`. `estadosData` continua sendo a UNIÃO.
    estadosData: atributosData(t).todos,
    estadosEmitidos: atributosData(t).emitidos,
    estadosReagidos: atributosData(t).reagidos,
    ariaEmitidos: unico([...t.matchAll(/\baria-([a-z]+)=/g)].map((m) => m[1])),
    usaCva: t.includes("cva("),
    linhas: t ? t.split("\n").length : 0,
  });
}

const blocos = (porTipo["registry:block"] ?? []).map((b) => ({
  nome: b.name, titulo: b.title ?? NA, descricao: b.description ?? NA,
  arquivos: b.files?.length ?? 0, compoe: b.registryDependencies ?? [],
}));

const saida = {
  fonte: "shadcn-ui", caminho: "Referencia/ui-main", commit, medidoEm: new Date().toISOString().slice(0, 10),
  metodo: "registry.json (manifesto declarado) + leitura dos fontes das três bases",
  totais: {
    itensNoManifesto: manifesto.items.length,
    porTipo: Object.fromEntries(Object.entries(porTipo).map(([k, v]) => [k, v.length])),
    componentesDistintos: todosOsComponentes.length,
    porMotor: Object.fromEntries(MOTORES.map((m) => [m, doMotor[m].size])),
    nosTresMotores: todosOsComponentes.filter((c) => MOTORES.every((m) => doMotor[m].has(c))).length,
    comCva: componentes.filter((c) => c.usaCva).length,
    comTamanho: componentes.filter((c) => c.tamanhos.length).length,
    slotsDistintos: unico(componentes.flatMap((c) => c.slots)).length,
    estadosDistintos: unico(componentes.flatMap((c) => c.estadosData)).length,
  },
  motores: {
    ordem: MOTORES,
    assimetricos: todosOsComponentes
      .filter((c) => !MOTORES.every((m) => doMotor[m].has(c)))
      .map((c) => ({nome: c, presenteEm: MOTORES.filter((m) => doMotor[m].has(c))})),
  },
  componentes,
  blocos,
};
fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-SHADCN.json"), JSON.stringify(saida, null, 2) + "\n");
console.log(`inventory-shadcn: ${saida.totais.itensNoManifesto} itens no manifesto, `
  + `${saida.totais.componentesDistintos} componentes, ${saida.totais.porTipo["registry:block"]} blocos, `
  + `${saida.totais.estadosDistintos} estados, ${saida.totais.slotsDistintos} slots`);
