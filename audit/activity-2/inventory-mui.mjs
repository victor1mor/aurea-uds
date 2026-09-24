// Inventário do §9 — `mui/material-ui`.
//
// Terceira das nove, e a que o `BUILDING.md` §1 chama de "a mais completa em cobertura e a mais
// distante em aparência". É a referência que mais tem a dizer sobre **estado** e **variante**,
// que é justamente onde o inventário da `base-ui` já rendeu correção (o `G-STATE-01`).
//
// A FONTE DE VERDADE AQUI É OUTRA, E É A MAIS RICA DAS TRÊS.
// A `base-ui` declara estado em enums de `data-*`. A `radix` escreve inline no JSX. A MUI declara
// um arquivo `<nome>Classes.ts` por componente — 118 deles —, e cada membro vem com JSDoc que diz
// **de que tipo ele é**:
//
//     /** Styles applied to the root element if `variant="text"`. */      -> VARIANTE
//     /** State class applied to the root element if `disabled={true}`. */ -> ESTADO
//     /** Styles applied to the startIcon element if supplied. */          -> ANATOMIA
//
// Ou seja: a própria fonte separa variante de estado de peça. Nenhuma das outras duas faz isso, e
// é o que permite preencher os campos do §9 sem inferência minha.
//
// Rodar:  node audit/activity-2/inventory-mui.mjs
// Escreve: audit/activity-2/INVENTORY-MUI.json

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/material-ui-master");
const SRC = path.join(BASE, "packages/mui-material/src");

if (!fs.existsSync(SRC)) {
  console.error("Referencia/material-ui-master ausente. Ver audit/activity-2/02-FONTES.md.");
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";
const unico = (a) => [...new Set(a)].sort();
const ler = (f) => fs.readFileSync(f, "utf8");

let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* fica INCONCLUSIVO, que é o que o §9 manda escrever */ }

/** Lê `<nome>Classes.ts` e classifica cada membro pelo que o JSDoc DIZ que ele é. */
function classesDe(arquivo) {
  const t = ler(arquivo);
  const corpo = /export\s+interface\s+\w+Classes\s*\{([\s\S]*?)\n\}/.exec(t)?.[1];
  if (!corpo) return null;
  const variantes = {};      // prop -> valores
  const estados = [];
  const anatomia = [];
  const outros = [];
  for (const m of corpo.matchAll(/\/\*\*\s*([\s\S]*?)\*\/\s*(\w+)\s*:/g)) {
    const doc = m[1].replace(/\s*\*\s*/g, " ").trim();
    const nome = m[2];
    // `if \`variant="text"\`` — a própria doc diz qual prop e qual valor
    const porValor = /if\s+`(\w+)="([^"]+)"`/.exec(doc);
    // `if \`disabled={true}\`` — prop booleana
    const porBool = /if\s+`(\w+)=\{true\}`/.exec(doc);
    // "State class applied to…" — a MUI marca estado explicitamente
    const ehEstado = /^State class/i.test(doc);
    // "Styles applied to the <peça> element" sem condição — é peça de anatomia
    const peca = /applied to the (\w+) element/i.exec(doc);

    if (porValor) {
      (variantes[porValor[1]] ??= []).push(porValor[2]);
    } else if (ehEstado || porBool) {
      estados.push({classe: nome, prop: porBool?.[1] ?? INC, descricao: doc});
    } else if (peca && peca[1] !== "root") {
      anatomia.push({peca: nome, descricao: doc});
    } else if (nome !== "root") {
      outros.push({classe: nome, descricao: doc});
    }
  }
  for (const k of Object.keys(variantes)) variantes[k] = unico(variantes[k]);
  return {variantes, estados, anatomia, outros};
}

/** Uniões literais das props, lidas do `.d.ts` — o contrato público. */
function propsDe(arquivo) {
  if (!fs.existsSync(arquivo)) return {props: [], unioes: {}};
  const t = ler(arquivo);
  const props = unico([...t.matchAll(/^\s*(\w+)\??\s*:/gm)].map((m) => m[1]));
  const unioes = {};
  for (const m of t.matchAll(/(\w+)\?\s*:\s*([\s\S]{0,400}?);/g)) {
    const literais = unico([...m[2].matchAll(/'([a-zA-Z][\w-]*)'/g)].map((x) => x[1]));
    if (literais.length > 1) unioes[m[1]] = literais;
  }
  return {props, unioes};
}

const registros = [];

for (const nome of fs.readdirSync(SRC, {withFileTypes: true})
  .filter((d) => d.isDirectory() && /^[A-Z]/.test(d.name)).map((d) => d.name).sort()) {
  const dir = path.join(SRC, nome);
  const arquivos = fs.readdirSync(dir);

  const classesFile = arquivos.find((f) => /Classes\.ts$/.test(f));
  const c = classesFile ? classesDe(path.join(dir, classesFile)) : null;
  const {props, unioes} = propsDe(path.join(dir, `${nome}.d.ts`));

  const impl = arquivos.find((f) => f === `${nome}.js`);
  const texto = impl ? ler(path.join(dir, impl)) : "";

  registros.push({
    NOME: nome,
    CATEGORIA: c ? "componente com vocabulário de classe declarado" : "peça sem arquivo de classes",
    FAMILIA: "mui material",
    PRIMITIVE: false,
    COMPONENTE: c?.anatomia.length ? "composto" : "peça única",
    SUBCOMPONENTES: c?.anatomia.length ? c.anatomia.map((a) => a.peca) : NA,
    ANATOMIA: c?.anatomia.length ? c.anatomia : NA,
    // A MUI é a única das três que declara variante e tamanho — as outras duas são headless e
    // deixam isso para quem consome. É por isso que ela é a referência de VOCABULÁRIO.
    VARIANTES: c && Object.keys(c.variantes).length ? c.variantes : NA,
    TAMANHOS: unioes.size ?? (c?.variantes?.size ?? NA),
    DENSIDADES: props.includes("dense") || props.includes("density") ? "prop `dense`" : NA,
    ORIENTACOES: unioes.orientation ?? NA,
    ESTADOS: c?.estados.length ? c.estados : NA,
    PROPS_RELEVANTES: props.length ? props : NA,
    EVENTOS: props.filter((p) => /^on[A-Z]/.test(p)).length ? props.filter((p) => /^on[A-Z]/.test(p)) : NA,
    COMPOSICAO: c?.anatomia.length ? "peças internas com classe própria" : "peça única",
    SLOTS: props.includes("slots") || props.includes("slotProps") ? "props `slots` / `slotProps`" : NA,
    CONTROLLED_UNCONTROLLED: [["value", "defaultValue"], ["open", "defaultOpen"],
      ["checked", "defaultChecked"], ["expanded", "defaultExpanded"]]
      .filter(([a, b]) => props.includes(a) && props.includes(b)).map(([a, b]) => `${a} / ${b}`),
    TECLADO: /onKeyDown|keycode|'Escape'|'ArrowDown'/i.test(texto) ? "trata tecla no próprio fonte" : NA,
    FOCO: /focusVisible|useIsFocusVisible|\.focus\(\)/.test(texto) ? "gerencia foco" : NA,
    ARIA: {
      papeis: unico([...texto.matchAll(/role=["'{]+\s*['"]?([a-z]+)['"]?/g)].map((m) => m[1])),
      atributos: unico([...texto.matchAll(/'(aria-[a-z]+)'|(aria-[a-z]+)=/g)].map((m) => m[1] ?? m[2])),
    },
    TOUCH: /TouchRipple|onTouchStart|touchAction/.test(texto) ? "trata toque" : NA,
    RESPONSIVIDADE: /breakpoints\./.test(texto) ? "usa breakpoints do tema" : NA,
    MOTION: /transitions\.create|Transition|Grow|Fade|Slide/.test(texto) ? "transição do tema" : NA,
    RTL: /direction === 'rtl'|theme\.direction/.test(texto) ? "lê a direção do tema" : NA,
    I18N: /Intl\.|toLocaleString|locale/.test(texto) ? "usa Intl / locale" : NA,
    THEMING: /useDefaultProps|styled\(/.test(texto) ? "tema da MUI (styled + defaultProps)" : NA,
    TOKENS: /theme\.(palette|spacing|shape|typography)/.test(texto) ? "tokens do tema da MUI" : NA,
    EXEMPLOS: NA,
    DEMOS: 0,
    BLOCKS_RELACIONADOS: NA,
    PATTERNS_RELACIONADOS: NA,
    TEMPLATES_RELACIONADOS: NA,
    HOOKS: unico([...texto.matchAll(/export\s+(?:default\s+)?function\s+(use[A-Z]\w*)/g)].map((m) => m[1])),
    UTILITIES: NA,
    DEPENDENCIAS: unico([...texto.matchAll(/from\s+'(@mui\/[^']+)'/g)].map((m) => m[1])).slice(0, 8),
    LICENCA: "MIT",
    PROVENIENCIA: `mui/material-ui @ ${commit}`,
    OBSERVACOES: "",
    _unioesDeProp: Object.keys(unioes).length ? unioes : NA,
  });
}

const comClasses = registros.filter((r) => r.ESTADOS !== NA || r.VARIANTES !== NA);
const out = {
  _gerado: "node audit/activity-2/inventory-mui.mjs",
  _fonte: "Os arquivos `<nome>Classes.ts` — 118 deles — declaram cada classe com JSDoc que diz se " +
    "ela é VARIANTE (`if \\`variant=\"text\"\\``), ESTADO (`State class applied to…`) ou PEÇA " +
    "(`applied to the startIcon element`). A própria fonte faz a classificação; nenhuma das " +
    "outras duas referências inventariadas faz isso.",
  proveniencia: `mui/material-ui @ ${commit}`,
  licenca: "MIT",
  totais: {
    componentes: registros.length,
    comVocabularioDeclarado: comClasses.length,
    estadosDeclarados: registros.reduce((s, r) => s + (Array.isArray(r.ESTADOS) ? r.ESTADOS.length : 0), 0),
    pecasDeAnatomia: registros.reduce((s, r) => s + (Array.isArray(r.ANATOMIA) ? r.ANATOMIA.length : 0), 0),
    comVariante: registros.filter((r) => r.VARIANTES !== NA).length,
    comTamanho: registros.filter((r) => r.TAMANHOS !== NA).length,
    comParControlado: registros.filter((r) => r.CONTROLLED_UNCONTROLLED.length).length,
  },
  itens: registros,
};
fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-MUI.json"), JSON.stringify(out, null, 2) + "\n");
const t = out.totais;
console.log(`inventory-mui: ${t.componentes} componentes (${t.comVocabularioDeclarado} com vocabulário ` +
  `declarado) · ${t.estadosDeclarados} estados · ${t.pecasDeAnatomia} peças de anatomia · ` +
  `${t.comVariante} com variante · ${t.comTamanho} com tamanho · ${t.comParControlado} com par controlado`);
