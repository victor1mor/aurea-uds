// Inventário do §9 — `untitleduico/react` (Untitled UI React).
//
// Quarta das nove. O `BUILDING.md` §1 a aponta como a referência de "escala de tamanhos,
// proporção, estados que a gente não lembrou", e é isso que se extrai aqui com prioridade: a
// **escala por componente**. Foi dela que saiu o `G-FORM-01` (campo com tamanho), e o padrão se
// repete — ela é a que mais tem a dizer sobre proporção.
//
// A FONTE DE VERDADE AQUI É A PROP, NÃO UM ARQUIVO DE DECLARAÇÃO.
// Cada referência declara de um jeito, e a diferença é o achado do §184 que já rendeu três vezes:
//
//   base-ui       148 enums `*DataAttributes.ts`, JSDoc por membro
//   radix         inline no JSX, `data-state={open ? 'open' : 'closed'}`
//   mui           118 `<nome>Classes.ts`, e o JSDoc diz de que TIPO é cada membro
//   untitled-ui   união literal na prop (`size?: "sm" | "md" | "lg"`) + objeto `sortCx` com a
//                 receita de cada degrau
//
// A união literal é o contrato; o `sortCx` é a implementação. Extrair os dois responde a pergunta
// que interessa: quantos degraus, e o que muda em cada um.
//
// E há um dado de arquitetura que só aparece aqui: ela roda sobre **react-aria-components**, da
// Adobe — um QUARTO motor no quadro, ao lado de Base UI (que a Aurea usa), Radix e o próprio da
// MUI. Qual primitive cada componente envolve fica registrado.
//
// Rodar:  node audit/activity-2/inventory-untitled.mjs
// Escreve: audit/activity-2/INVENTORY-UNTITLED.json

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/react-main/react-main");
const COMP = path.join(BASE, "components");

if (!fs.existsSync(COMP)) {
  console.error("Referencia/react-main ausente. Ver audit/activity-2/02-FONTES.md.");
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";
const unico = (a) => [...new Set(a)].sort();
const ler = (f) => fs.readFileSync(f, "utf8");
const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* fica INCONCLUSIVO, que é o que o §9 manda escrever */ }

/** Uniões literais declaradas em prop — o CONTRATO do componente. */
function unioesDePropo(texto) {
  const out = {};
  for (const m of texto.matchAll(/(\w+)\?\s*:\s*((?:"[^"]+"\s*\|\s*)+"[^"]+")/g)) {
    const vals = unico([...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
    if (vals.length > 1) (out[m[1]] ??= new Set()).forEach?.(() => {});
    if (vals.length > 1) out[m[1]] = unico([...(out[m[1]] ?? []), ...vals]);
  }
  return out;
}

/** Chaves de um `sortCx({ sm: {...}, md: {...} })` — os degraus com receita própria. */
function degrausDeEstilo(texto) {
  const out = {};
  for (const m of texto.matchAll(/const\s+(\w+)\s*=\s*sortCx\(\{([\s\S]*?)\n\s*\}\);/g)) {
    const chaves = unico([...m[2].matchAll(/^\s{4,8}"?([a-zA-Z][\w-]*)"?\s*:\s*[{c]/gm)].map((x) => x[1]));
    if (chaves.length) out[m[1]] = chaves;
  }
  return out;
}

const registros = [];

for (const familia of dirs(COMP)) {
  if (familia === "internal" || familia === "shared-assets") continue;
  for (const nome of dirs(path.join(COMP, familia))) {
    const dir = path.join(COMP, familia, nome);
    const arquivos = [];
    (function anda(d) {
      for (const e of fs.readdirSync(d, {withFileTypes: true})) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) anda(full);
        else if (/\.tsx?$/.test(e.name) && !/\.(test|stories|demo)\./.test(e.name)) arquivos.push(full);
      }
    })(dir);
    if (!arquivos.length) continue;
    const texto = arquivos.map(ler).join("\n");

    const unioes = unioesDePropo(texto);
    const degraus = degrausDeEstilo(texto);
    const props = unico([...texto.matchAll(/^\s{4}(\w+)\??\s*:/gm)].map((m) => m[1]));

    // Qual primitive do motor da Adobe cada peça envolve — o dado de arquitetura desta fonte.
    const motor = unico([...texto.matchAll(/import\s*\{([^}]*)\}\s*from\s*"react-aria-components"/g)]
      .flatMap((m) => m[1].split(",").map((x) => x.trim().split(/\s+as\s+/)[0].trim()))
      .filter((x) => /^[A-Z]/.test(x)));

    registros.push({
      NOME: nome,
      CATEGORIA: familia,
      FAMILIA: "untitled ui react",
      PRIMITIVE: false,
      COMPONENTE: arquivos.length > 1 ? "composto" : "peça única",
      SUBCOMPONENTES: arquivos.length > 1
        ? arquivos.map((f) => path.basename(f).replace(/\.tsx?$/, "")) : NA,
      ANATOMIA: unico([...texto.matchAll(/export\s+const\s+([A-Z]\w*)/g)].map((m) => m[1])),
      // O que esta referência tem de melhor, e a razão de o BUILDING.md apontar para ela.
      VARIANTES: unioes.type ?? unioes.color ?? unioes.variant ?? NA,
      TAMANHOS: unioes.size ?? NA,
      DEGRAUS_COM_RECEITA_PROPRIA: Object.keys(degraus).length ? degraus : NA,
      DENSIDADES: NA,
      ORIENTACOES: unioes.orientation ?? NA,
      // Ela não declara estado num arquivo: usa os `data-*` do react-aria e as pseudo do Tailwind.
      ESTADOS: unico([
        ...[...texto.matchAll(/data-\[?([a-z-]+)/g)].map((m) => `data-${m[1]}`),
        ...[...texto.matchAll(/\b(hover|focused|pressed|disabled|selected|invalid|placeholder-shown):/g)].map((m) => m[1]),
      ]).slice(0, 40),
      PROPS_RELEVANTES: props.length ? props : NA,
      EVENTOS: props.filter((p) => /^on[A-Z]/.test(p)).length ? props.filter((p) => /^on[A-Z]/.test(p)) : NA,
      COMPOSICAO: motor.length ? "envolve primitives do react-aria-components" : "próprio",
      SLOTS: /children.*=>|RenderProps|composeRenderProps/.test(texto) ? "render props do react-aria" : NA,
      CONTROLLED_UNCONTROLLED: [["value", "defaultValue"], ["isOpen", "defaultOpen"],
        ["isSelected", "defaultSelected"]].filter(([a, b]) => props.includes(a) && props.includes(b))
        .map(([a, b]) => `${a} / ${b}`),
      TECLADO: motor.length ? `delegado ao react-aria-components (${motor.slice(0, 4).join(", ")})` : NA,
      FOCO: /focus-visible|isFocusVisible|FocusScope/.test(texto) ? "foco visível do react-aria" : NA,
      ARIA: {
        papeis: unico([...texto.matchAll(/role=["']([a-z]+)["']/g)].map((m) => m[1])),
        atributos: unico([...texto.matchAll(/(aria-[a-z]+)/g)].map((m) => m[1])),
      },
      TOUCH: /onPress|usePress|touch/.test(texto) ? "eventos de pressão do react-aria (ponteiro e toque)" : NA,
      RESPONSIVIDADE: /\b(sm|md|lg|xl):[a-z]/.test(texto) ? "classes por breakpoint" : NA,
      MOTION: /transition|animate|duration-/.test(texto) ? "transição em classe" : NA,
      RTL: /\b(ms-|me-|ps-|pe-|start-|end-)\d/.test(texto) ? "usa eixo inline (lógico)" : NA,
      I18N: /useLocale|Intl\./.test(texto) ? "usa locale do react-aria" : NA,
      THEMING: "Tailwind + tokens próprios",
      TOKENS: NA,
      EXEMPLOS: NA,
      DEMOS: 0,
      BLOCKS_RELACIONADOS: NA,
      PATTERNS_RELACIONADOS: NA,
      TEMPLATES_RELACIONADOS: NA,
      HOOKS: unico([...texto.matchAll(/export\s+(?:const|function)\s+(use[A-Z]\w*)/g)].map((m) => m[1])),
      UTILITIES: NA,
      MOTOR: motor.length ? motor : NA,
      DEPENDENCIAS: unico([...texto.matchAll(/from\s+"(@?[a-z@][^".]*[^"]*)"/g)].map((m) => m[1]))
        .filter((d) => !d.startsWith(".")).slice(0, 8),
      LICENCA: "MIT",
      PROVENIENCIA: `untitleduico/react @ ${commit}`,
      OBSERVACOES: "",
    });
  }
}

const comTamanho = registros.filter((r) => r.TAMANHOS !== NA);
const escalas = {};
for (const r of comTamanho) escalas[r.TAMANHOS.join("|")] = (escalas[r.TAMANHOS.join("|")] ?? 0) + 1;

const out = {
  _gerado: "node audit/activity-2/inventory-untitled.mjs",
  _fonte: "A união literal na prop é o CONTRATO; o objeto `sortCx` é a implementação de cada " +
    "degrau. Extrair os dois responde o que interessa nesta referência: quantos degraus, e o " +
    "que muda em cada um.",
  proveniencia: `untitleduico/react @ ${commit}`,
  licenca: "MIT",
  totais: {
    componentes: registros.length,
    porFamilia: registros.reduce((a, r) => ({...a, [r.CATEGORIA]: (a[r.CATEGORIA] ?? 0) + 1}), {}),
    comEscalaDeTamanho: comTamanho.length,
    escalasDistintas: Object.keys(escalas).length,
    sobreReactAria: registros.filter((r) => r.MOTOR !== NA).length,
  },
  escalasDeTamanho: Object.fromEntries(Object.entries(escalas).sort((a, b) => b[1] - a[1])),
  itens: registros,
};
fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-UNTITLED.json"), JSON.stringify(out, null, 2) + "\n");
const t = out.totais;
console.log(`inventory-untitled: ${t.componentes} componentes ` +
  `(${Object.entries(t.porFamilia).map(([k, v]) => `${k} ${v}`).join(", ")}) · ` +
  `${t.comEscalaDeTamanho} com escala de tamanho em ${t.escalasDistintas} escalas distintas · ` +
  `${t.sobreReactAria} sobre react-aria-components`);
