// Inventário do §9 — `kibo-ui` (`Referencia/kibo-main`).
//
// Sexta das nove. O `BUILDING.md` §1 a aponta para "anatomia de componente raro" — `dropzone`,
// `tree`, `gantt`, `kanban`, `editor`, `table` — e é a única fonte do quadro organizada como
// **um pacote npm por componente**. Isso torna mensurável uma coisa que nenhuma outra fonte dá
// de graça: o CUSTO EM DEPENDÊNCIA de cada peça rara, declarado pelo próprio autor no
// `package.json`. É a pergunta do §48, respondida sem estimativa.
//
// A FONTE DE VERDADE AQUI SÃO DUAS, e é o sexto formato do quadro (§184):
//
//   base-ui       148 enums `*DataAttributes.ts`, JSDoc por membro
//   radix         inline no JSX, `data-state={open ? 'open' : 'closed'}`
//   mui           118 `<nome>Classes.ts`, e o JSDoc diz de que TIPO é cada membro
//   untitled-ui   união literal na prop + objeto `sortCx` com a receita de cada degrau
//   shadcn-ui     `registry.json` legível por máquina, com o grafo em `registryDependencies`
//   kibo-ui       `package.json` por componente (nome, descrição, dependências reais) +
//                 `packages/patterns/<componente>/<variante>/<n>.tsx` no disco
//
// A segunda é a que interessa para o `G-COMP-01`: a taxonomia Componente → Variante →
// Composição — de onde veio o vocabulário do `AUREA.md` §4 — está materializada em ÁRVORE DE
// DIRETÓRIO. Dá para contar composição por variante sem interpretar nada.
//
// Rodar:  node audit/activity-2/inventory-kibo.mjs
// Escreve: audit/activity-2/INVENTORY-KIBO.json

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {atributosData} from "./data-attrs.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/kibo-main/kibo-main");
const PKGS = path.join(BASE, "packages");

if (!fs.existsSync(PKGS)) {
  console.error("Referencia/kibo-main ausente. Ver audit/activity-2/02-FONTES.md.");
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";
const unico = (a) => [...new Set(a)].sort();
const ler = (f) => fs.readFileSync(f, "utf8");
const subdirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* INCONCLUSIVO é o que o §9 manda escrever em vez de omitir */ }

// Infra do monorepo, não componente. Listado em vez de filtrado por heurística: "pacote que não
// parece componente" é exatamente o tipo de julgamento que o §10 proíbe fazer em silêncio.
const NAO_E_COMPONENTE = new Set(["patterns", "shadcn-ui", "typescript-config", "stories"]);

/** Todo arquivo `.tsx`/`.ts` de um pacote, concatenado — o pacote é a unidade aqui. */
function fonteDoPacote(dir) {
  const out = [];
  const anda = (p) => {
    for (const d of fs.readdirSync(p, {withFileTypes: true})) {
      const f = path.join(p, d.name);
      if (d.isDirectory() && d.name !== "node_modules") anda(f);
      else if (/\.tsx?$/.test(d.name)) out.push(ler(f));
    }
  };
  anda(dir);
  return out.join("\n");
}

const componentes = [];
for (const nome of subdirs(PKGS)) {
  if (NAO_E_COMPONENTE.has(nome)) continue;
  const dir = path.join(PKGS, nome);
  const pj = path.join(dir, "package.json");
  if (!fs.existsSync(pj)) continue;
  const meta = JSON.parse(ler(pj));
  const t = fonteDoPacote(dir);
  // Dependência EXTERNA é o custo real: `@repo/*` e `workspace:*` são internas e não contam.
  const deps = Object.keys(meta.dependencies ?? {})
    .filter((d) => !d.startsWith("@repo/") && !["react", "react-dom"].includes(d)).sort();
  componentes.push({
    nome,
    descricao: meta.description ?? NA,
    // O §48 em número: quanto custa adotar esta peça.
    dependenciasExternas: deps,
    custoEmDependencia: deps.length,
    sobreShadcn: Object.keys(meta.dependencies ?? {}).includes("@repo/shadcn-ui"),
    exporta: unico([...t.matchAll(/^export (?:const|function) ([A-Z]\w+)/gm)].map((m) => m[1])),
    subcomponentes: unico([...t.matchAll(/^(?:export )?(?:const|function) ([A-Z]\w+)/gm)].map((m) => m[1])).length,
    // Os três campos saem do MESMO extrator, compartilhado pelas cinco fontes medidas —
    // ver o cabeçalho de `data-attrs.mjs`. `estadosData` continua sendo a UNIÃO.
    estadosData: atributosData(t).todos,
    estadosEmitidos: atributosData(t).emitidos,
    estadosReagidos: atributosData(t).reagidos,
    ariaEmitidos: unico([...t.matchAll(/\baria-([a-z]+)[=:]/g)].map((m) => m[1])),
    teclas: unico([...t.matchAll(/(?:key|code)\s*===?\s*["'`](\w+)["'`]/g)].map((m) => m[1])),
    primitivesRadix: unico([...t.matchAll(/from "@radix-ui\/react-([\w-]+)"/g)].map((m) => m[1])),
    linhas: t.split("\n").length,
  });
}

// ── Componente → Variante → Composição, direto da árvore de diretório ──────
const PAT = path.join(PKGS, "patterns");
const patterns = [];
for (const comp of subdirs(PAT)) {
  const variantes = subdirs(path.join(PAT, comp));
  if (!variantes.length) {
    // componente com composições soltas, sem nível de variante — registrar, não ignorar
    const n = fs.readdirSync(path.join(PAT, comp)).filter((f) => f.endsWith(".tsx")).length;
    patterns.push({componente: comp, variantes: [], composicoes: n, nivelDeVariante: false});
    continue;
  }
  const porVariante = variantes.map((v) => ({
    variante: v,
    composicoes: fs.readdirSync(path.join(PAT, comp, v)).filter((f) => f.endsWith(".tsx")).length,
  }));
  patterns.push({
    componente: comp, nivelDeVariante: true,
    variantes: porVariante,
    composicoes: porVariante.reduce((a, b) => a + b.composicoes, 0),
  });
}

const totalComposicoes = patterns.reduce((a, p) => a + p.composicoes, 0);
const saida = {
  fonte: "kibo-ui", caminho: "Referencia/kibo-main", commit,
  medidoEm: new Date().toISOString().slice(0, 10),
  metodo: "package.json por componente (custo real de dependência) + árvore packages/patterns",
  totais: {
    pacotesDeComponente: componentes.length,
    semDependenciaExterna: componentes.filter((c) => !c.custoEmDependencia).length,
    sobreShadcn: componentes.filter((c) => c.sobreShadcn).length,
    dependenciasExternasDistintas: unico(componentes.flatMap((c) => c.dependenciasExternas)).length,
    estadosDistintos: unico(componentes.flatMap((c) => c.estadosData)).length,
    // o lado da composição
    componentesComPattern: patterns.length,
    variantesDeclaradas: patterns.reduce((a, p) => a + (p.variantes.length || 0), 0),
    composicoes: totalComposicoes,
    composicoesPorComponente: +(totalComposicoes / patterns.length).toFixed(2),
  },
  dependenciasMaisUsadas: Object.entries(
    componentes.flatMap((c) => c.dependenciasExternas)
      .reduce((m, d) => ((m[d] = (m[d] ?? 0) + 1), m), {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 12).map(([dep, n]) => ({dep, componentes: n})),
  componentes,
  patterns,
};
fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-KIBO.json"), JSON.stringify(saida, null, 2) + "\n");
console.log(`inventory-kibo: ${saida.totais.pacotesDeComponente} componentes raros, `
  + `${saida.totais.composicoes} composições em ${saida.totais.componentesComPattern} componentes `
  + `(${saida.totais.composicoesPorComponente}/componente), `
  + `${saida.totais.dependenciasExternasDistintas} dependências externas distintas`);
