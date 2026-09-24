// Cruzamento do inventário — o primeiro passo em direção à matriz do §13.
//
// ATENÇÃO AO QUE ISTO **NÃO** É. O §15 é explícito: "a Aurea possuir um componente com o mesmo
// nome NÃO fecha o gap", e o §13 exige comparação por CAPACIDADE ("Select / searchable",
// "Table / column pinning"), não por nome. Isto aqui cruza NOMES. Serve para uma coisa só:
// separar, mecanicamente e sem amostragem, o que nem sequer existe na Aurea do que existe e
// precisa ser comparado a fundo. É triagem, não veredito.
//
// Um nome presente nos dois lados NÃO vira `AUREA_EQUIVALENTE` aqui — vira `A_COMPARAR`.
//
// Rodar:  node audit/activity-2/crossref.mjs
// Escreve: audit/activity-2/CROSSREF.json e imprime o resumo

import fs from "node:fs";
import path from "node:path";

const AQUI = import.meta.dirname;
const inv = JSON.parse(fs.readFileSync(path.join(AQUI, "INVENTORY.json"), "utf8"));

// Sinônimos verificados à mão, um a um, olhando o que a peça FAZ nos dois projetos. A lista é
// curta de propósito: casar nome demais inventa paridade que não existe, e é o erro que o §15
// descreve. Cada linha aqui é uma afirmação de que os dois nomes designam a mesma coisa.
const SINONIMOS = {
  "dropdown-menu": "menu", dropdown: "menu", "menu-bar": "menubar",
  "alert-dialog": "alert-dialog", sheet: "drawer", modal: "dialog",
  "toggle-group": "toggle-group", segmented: "segmented-control", "toggle-button": "toggle",
  snackbar: "toast", toaster: "toast", sonner: "toast",
  "text-field": "input", textfield: "input", "text-area": "textarea", "input-otp": "otp-field",
  "number-input": "number-field", stepper: "stepper",
  "data-table": "data-grid", "data-grid": "data-grid", datagrid: "data-grid",
  "date-picker": "date-picker", datepicker: "date-picker", "date-range-picker": "date-range",
  "scroll-area": "scroll-area", scrollarea: "scroll-area",
  "hover-card": "hover-card", hovercard: "hover-card",
  "context-menu": "context-menu", "navigation-menu": "navigation-menu",
  "circular-progress": "progress-circle", "linear-progress": "progress",
  "progress-bar": "progress", spinner: "spinner", "circular-progress-bar": "progress-circle",
  chip: "chip", tag: "chip", pill: "chip",
  "app-bar": "topbar", appbar: "topbar", navbar: "topbar", header: "topbar",
  "bottom-navigation": "bottom-nav", "speed-dial": "speed-dial",
  "image-list": "gallery", "media-player": "media-player",
  autocomplete: "combobox", "multi-select": "multi-combobox", multiselect: "multi-combobox",
  "file-upload": "file-input", dropzone: "file-input", "file-input": "file-input",
  "tree-view": "tree", treeview: "tree", "tree-select": "tree",
  "empty-state": "empty-state", empty: "empty-state",
  "code-block": "code-block", codeblock: "code-block", "code-editor": "code-editor",
  kbd: "kbd", "keyboard-key": "kbd",
  "aspect-ratio": "aspect-ratio", "visually-hidden": "visually-hidden",
  "radio-group": "radio", "checkbox-group": "checkbox", "switch-group": "switch",
  "button-group": "button-group", "icon-button": "icon-button", fab: "fab",
  skeleton: "skeleton", "loading-skeleton": "skeleton",
  // Conferidos na fonte dos dois lados, um a um, em 21/08/2026:
  range: "slider",            // o `Range` da Aurea É o slider: <input type="range">
  "input-otp": "otp-field",   // shadcn
  "qr-code": "qr-code",
  "native-select": "select",  // o `Select` da Aurea É o <select> nativo
  // Achado pela comparação de FAMÍLIA de primitives (base-ui × radix), não por esta triagem: a
  // mesma capacidade com dois nomes dividia a evidência em duas linhas de uma referência cada, e
  // as duas caíam abaixo do corte. É o limite conhecido de casar por nome.
  "password-toggle-field": "password-toggle",
  "password-input": "password-toggle",
  "one-time-password-field": "otp-field",
  "hover-card": "hover-card", "preview-card": "hover-card",
  "dropdown-menu": "menu",
};
const canon = (k) => SINONIMOS[k] ?? k;

const REFS = Object.keys(inv.fontes).filter((f) => f !== "aurea");
// `example` do shadcn é demonstração de um `ui` que já está na lista — contar as 238 como
// capacidade distinta inflaria a coluna dele em 4×.
//
// E há entradas que não são capacidade nenhuma: pastas de utilitário interno (`utils`, `lib`,
// `hooks` genéricos), tema, e o chrome que sobrou de site de documentação. Deixá-las produz
// linha de gap para "utils", que ninguém vai construir.
const RUIDO = new Set(["utils", "lib", "theme", "themes", "styles", "internal", "shared-assets",
                       "index", "types", "constants", "helpers", "frame", "item", "primitive",
                       "compose-refs", "context", "slot", "portal", "presence", "collection",
                       "direction", "id", "use-callback-ref", "use-controllable-state",
                       "use-effect-event", "use-escape-keydown", "use-is-hydrated",
                       "use-layout-effect", "use-previous", "use-rect", "use-size"]);
const CONTA = (fonte, item) =>
  !(fonte === "shadcn-ui" && item.tipo === "example") &&
  !["lib", "theme"].includes(item.tipo) &&
  !RUIDO.has(item.chave);

const aurea = new Set(inv.fontes.aurea.itens.map((i) => canon(i.chave)));
const mapa = new Map();   // chave canônica -> {refs:Set, nomes:Set, tipos:Set}

for (const fonte of REFS) {
  for (const item of inv.fontes[fonte].itens) {
    if (!CONTA(fonte, item)) continue;
    const k = canon(item.chave);
    if (!mapa.has(k)) mapa.set(k, {refs: new Set(), nomes: new Set(), tipos: new Set()});
    const e = mapa.get(k);
    e.refs.add(fonte);
    e.nomes.add(item.nome);
    e.tipos.add(item.tipo);
  }
}

const linhas = [...mapa.entries()].map(([k, e]) => ({
  capacidade: k,
  aurea: aurea.has(k),
  refs: [...e.refs].sort(),
  quantasRefs: e.refs.size,
  nomes: [...e.nomes].sort(),
  tipos: [...e.tipos].sort(),
  // O estado do §14 que isto pode legitimamente atribuir. `A_COMPARAR` não é um estado do §14
  // de propósito: é a admissão de que a triagem por nome não decide paridade.
  estado: aurea.has(k) ? "A_COMPARAR" : "AUREA_AUSENTE",
})).sort((a, b) => b.quantasRefs - a.quantasRefs || a.capacidade.localeCompare(b.capacidade));

const soNossos = [...aurea].filter((k) => !mapa.has(k)).sort();

const out = {
  _gerado: "node audit/activity-2/crossref.mjs",
  _aviso: "TRIAGEM POR NOME, não a matriz do §13. Nome igual não é capacidade igual (§15). " +
    "`A_COMPARAR` significa exatamente isso: existe dos dois lados e ainda não foi comparado.",
  totais: {
    capacidadesDistintas: linhas.length,
    ausentesNaAurea: linhas.filter((l) => !l.aurea).length,
    aCompararNaAurea: linhas.filter((l) => l.aurea).length,
    soNaAurea: soNossos.length,
  },
  soNaAurea: soNossos,
  linhas,
};
fs.writeFileSync(path.join(AQUI, "CROSSREF.json"), JSON.stringify(out, null, 2) + "\n");

console.log("crossref (TRIAGEM POR NOME — não é paridade):");
console.log(`  ${out.totais.capacidadesDistintas} nomes distintos nas nove referências`);
console.log(`  ${out.totais.ausentesNaAurea} sem nada de nome parecido na Aurea`);
console.log(`  ${out.totais.aCompararNaAurea} existem dos dois lados e faltam comparar`);
console.log(`  ${out.totais.soNaAurea} só na Aurea\n`);
console.log("Ausentes com mais lastro (quantas referências têm):");
for (const l of linhas.filter((x) => !x.aurea).slice(0, 30)) {
  console.log(`  ${String(l.quantasRefs).padStart(2)}×  ${l.capacidade.padEnd(26)} ${l.refs.join(" ")}`);
}
