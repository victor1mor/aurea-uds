// Inventário do §9 — `reui` (`Referencia/reui-main`).
//
// Sétima das nove. E a primeira do quadro cujo inventário começa com uma SUBTRAÇÃO: 62 dos 62
// arquivos de `registry/bases/base/ui` são **byte a byte idênticos** aos do `shadcn-ui`. É
// cópia vendorizada, não trabalho próprio, e contar os dois separadamente inflaria o quadro do
// §13 com o mesmo código duas vezes. Medido, não suposto — sha256 arquivo a arquivo.
//
// O que é DELA são os 22 componentes documentados em `content/docs/(components)/`, e o formato
// em que ela os declara é o sétimo do quadro (§184) — e o único que responde QUANDO USAR:
//
//   base-ui       148 enums `*DataAttributes.ts`, JSDoc por membro
//   radix         inline no JSX, `data-state={open ? 'open' : 'closed'}`
//   mui           118 `<nome>Classes.ts`, e o JSDoc diz de que TIPO é cada membro
//   untitled-ui   união literal na prop + objeto `sortCx`
//   shadcn-ui     `registry.json` legível por máquina, com o grafo entre itens
//   kibo-ui       um `package.json` por componente — declara o CUSTO em dependência
//   reui          MDX com frontmatter + PROSA de intenção, e um pacote por componente
//
// O §11 diz que documentação traz o que o código não mostra. Aqui isso é literal: a prosa do
// `cascader` explica que a diferença para um combobox plano é a NAVEGAÇÃO POR NÍVEL — que o
// ramo abre em vez de commitar, que o popup fica aberto, que a trilha diz onde se está. Nada
// disso está no tipo. É a única fonte do quadro de onde dá para extrair razão, e não só forma.
//
// Rodar:  node audit/activity-2/inventory-reui.mjs
// Escreve: audit/activity-2/INVENTORY-REUI.json

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";
import {atributosData} from "./data-attrs.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/reui-main/reui-main");
const SHADCN_UI = path.join(ROOT, "Referencia/ui-main/ui-main/apps/v4/registry/bases/base/ui");
const DOCS = path.join(BASE, "content/docs/(components)");
const PKGS = path.join(BASE, "packages/registry/bases");

if (!fs.existsSync(DOCS)) {
  console.error("Referencia/reui-main ausente. Ver audit/activity-2/02-FONTES.md.");
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";
const unico = (a) => [...new Set(a)].sort();
const ler = (f) => fs.readFileSync(f, "utf8");
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* INCONCLUSIVO, como o §9 manda */ }

// ── a subtração, medida ────────────────────────────────────────────────────
const copiado = {medido: false, arquivos: 0, identicos: 0};
const REUI_UI = path.join(BASE, "registry/bases/base/ui");
if (fs.existsSync(REUI_UI) && fs.existsSync(SHADCN_UI)) {
  const meus = fs.readdirSync(REUI_UI).filter((f) => f.endsWith(".tsx"));
  copiado.medido = true;
  copiado.arquivos = meus.length;
  copiado.identicos = meus.filter((f) => {
    const o = path.join(SHADCN_UI, f);
    return fs.existsSync(o) && sha(path.join(REUI_UI, f)) === sha(o);
  }).length;
}

// ── o que é dela: a documentação ───────────────────────────────────────────
const MOTORES = fs.existsSync(DOCS)
  ? fs.readdirSync(DOCS, {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

/** Frontmatter YAML raso — chave: valor por linha. Sem dependência nova para ler três campos. */
function frontmatter(texto) {
  const m = texto.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const linha of m[1].split("\n")) {
    const i = linha.indexOf(":");
    if (i > 0) out[linha.slice(0, i).trim()] = linha.slice(i + 1).trim();
  }
  return out;
}

const vistos = new Map();
for (const motor of MOTORES) {
  const dir = path.join(DOCS, motor);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".mdx"))) {
    const nome = f.slice(0, -4);
    const t = ler(path.join(dir, f));
    const fm = frontmatter(t);
    const corpo = t.replace(/^---[\s\S]*?---/, "");
    // A PROSA de intenção: os parágrafos antes da primeira seção `##`. É o que nenhuma outra
    // fonte do quadro dá, e o motivo de esta referência existir no inventário.
    const intencao = corpo.split(/\n##\s/)[0].split("\n")
      .filter((l) => l.trim() && !l.startsWith("<") && !l.startsWith("/>") && !/^\s{2,}\w+=/.test(l))
      .join(" ").replace(/\s+/g, " ").trim();
    const antes = vistos.get(nome);
    if (antes) { antes.motores.push(motor); continue; }
    const pkg = path.join(PKGS, motor, "components", nome, "package.json");
    const implDir = path.join(BASE, "registry-reui/bases", motor, "reui", nome);
    const implFile = `${implDir}.tsx`;
    const impl = fs.existsSync(implDir) ? implDir : (fs.existsSync(implFile) ? implFile : implDir);
    const comps = path.join(BASE, "registry-reui/bases", motor, "components", nome);
    let fonte = "";
    if (fs.existsSync(impl)) {
      if (fs.statSync(impl).isFile()) fonte = ler(impl);
      else {
      const anda = (p) => {
        for (const d of fs.readdirSync(p, {withFileTypes: true})) {
          const q = path.join(p, d.name);
          if (d.isDirectory()) anda(q); else if (/\.tsx?$/.test(d.name)) fonte += "\n" + ler(q);
        }
      };
      anda(impl);
      }
    }
    const composicoes = fs.existsSync(comps)
      ? fs.readdirSync(comps).filter((f) => /^c-.*\.tsx$/.test(f)).length : 0;
    const meta = fs.existsSync(pkg) ? JSON.parse(ler(pkg)) : null;
    const deps = Object.keys(meta?.dependencies ?? {})
      .filter((d) => !d.startsWith("@reui/") && !["react", "react-dom"].includes(d)).sort();
    vistos.set(nome, {
      nome, motores: [motor],
      titulo: fm.title ?? NA,
      descricao: fm.description ?? NA,
      // A prosa cortada em 600 para caber no JSON sem virar o arquivo inteiro; o campo
      // `intencaoCompleta` diz quanto foi cortado, para ninguém confundir corte com ausência.
      intencao: intencao.slice(0, 600),
      intencaoCompleta: intencao.length,
      temFonte: fonte.length > 0,
      composicoes,
      dependenciasExternas: deps,
      custoEmDependencia: deps.length,
      exporta: unico([...fonte.matchAll(/^export (?:const|function) ([A-Z]\w+)/gm)].map((m) => m[1])),
      // Os três campos saem do MESMO extrator, compartilhado pelas cinco fontes medidas —
      // ver o cabeçalho de `data-attrs.mjs`. `estadosData` continua sendo a UNIÃO.
      estadosData: atributosData(fonte).todos,
      estadosEmitidos: atributosData(fonte).emitidos,
      estadosReagidos: atributosData(fonte).reagidos,
      teclas: unico([...fonte.matchAll(/(?:key|code)\s*===?\s*["'`]([\w ]+)["'`]/g)].map((m) => m[1])),
      linhas: fonte ? fonte.split("\n").length : 0,
    });
  }
}
const componentes = [...vistos.values()].sort((a, b) => a.nome.localeCompare(b.nome));

const saida = {
  fonte: "reui", caminho: "Referencia/reui-main", commit,
  medidoEm: new Date().toISOString().slice(0, 10),
  metodo: "MDX de documentação (frontmatter + prosa de intenção) + pacote por componente",
  copiaDoShadcn: copiado,
  totais: {
    documentados: componentes.length,
    comFonte: componentes.filter((c) => c.temFonte).length,
    semDependenciaExterna: componentes.filter((c) => !c.custoEmDependencia).length,
    comIntencaoEscrita: componentes.filter((c) => c.intencaoCompleta > 200).length,
    composicoes: componentes.reduce((a, c) => a + c.composicoes, 0),
    linhasDeImplementacao: componentes.reduce((a, c) => a + c.linhas, 0),
    caracteresDeIntencao: componentes.reduce((a, c) => a + c.intencaoCompleta, 0),
    motores: MOTORES,
  },
  componentes,
};
fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-REUI.json"), JSON.stringify(saida, null, 2) + "\n");
console.log(`inventory-reui: ${saida.totais.documentados} componentes documentados, `
  + `${copiado.identicos}/${copiado.arquivos} arquivos idênticos ao shadcn (cópia vendorizada), `
  + `${saida.totais.composicoes} composições, ${saida.totais.linhasDeImplementacao} linhas de implementação`);
