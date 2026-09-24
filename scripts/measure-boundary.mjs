// A medição que decide o item O1 do PLANO-1.0 — "quem é cliente só por nossa causa".
//
// Existe porque o item manda MEDIR primeiro e só depois decidir, e porque ele pode terminar em
// "não vale" — que também é resultado, e resultado precisa de comando atrás (o precedente é o
// F11). Número escrito à mão neste projeto já foi achado errado nove vezes.
//
//   node scripts/measure-boundary.mjs
//
// O que ela responde, por componente exportado do pacote React:
//   • ele precisa de cliente por si (chama hook, prende manipulador, importa motor de terceiro)?
//   • ou é cliente por CONTÁGIO — porque usa alguém que precisa?
//   • ou não precisa de nada e está num módulo com a diretiva só por vizinhança?
//
// COMO A FATIA É TIRADA: do `export` de um componente até o PRÓXIMO `export`. É a mesma régua do
// check 22 do validador, e pela mesma razão — a implementação de vários componentes daqui
// continua num auxiliar não exportado logo abaixo. Régua diferente daria número diferente do
// gate, e dois números para a mesma coisa é o defeito que este repositório mais pagou.
import {readFileSync, readdirSync} from "node:fs";

const DIR = new URL("../packages/react/src/", import.meta.url);
const MODULOS = readdirSync(DIR).filter(f => f.endsWith(".tsx")).sort();

// Um comentário não é código. O check 23 aprendeu isso do jeito caro (acusou o comentário que
// explicava por que `Avatar.size` tinha deixado de ser número), e aqui a conta erraria igual:
// quase todo componente deste repositório tem um bloco de comentário citando `useAureaStrings`.
const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const modulos = new Map();
for (const arq of MODULOS) {
  const bruto = readFileSync(new URL(arq, DIR), "utf8");
  const fonte = semComentario(bruto);
  const diretiva = /^\s*"use client"/.test(bruto);

  // Motor de terceiro: qualquer import que não seja react nem um irmão do próprio pacote.
  // O QUE IMPORTA É O IDENTIFICADOR IMPORTADO, não o nome do pacote. A primeira versão desta
  // medição adivinhava o nome a partir do caminho (`react-day-picker` → "reactdaypicker") e
  // errou: o `Calendar` saiu como "não precisa de cliente" porque o que ele usa se chama
  // `DayPicker`. Medição errada é pior que medição nenhuma — aqui ela ia justificar mover para o
  // servidor um componente que o navegador precisa montar.
  const motores = [];
  const simbolosDeMotor = new Set();
  for (const m of fonte.matchAll(/import\s+([\s\S]*?)\s+from\s+"([^"]+)"/g)) {
    const [, clausula, caminho] = m;
    if (caminho.startsWith(".") || caminho === "react" || caminho === "react-dom"
        || caminho.startsWith("react/")) continue;
    motores.push(caminho);
    // `import X`, `import {a, b as c}`, `import * as N` — o nome LOCAL é o que aparece no corpo.
    for (const t of clausula.matchAll(/(?:^|[,{*]\s*)(?:[A-Za-z0-9_$]+\s+as\s+)?([A-Za-z_$][\w$]*)/g))
      if (t[1] !== "as" && t[1] !== "type") simbolosDeMotor.add(t[1]);
  }

  const marcas = [...fonte.matchAll(/^export\s+(?:function|const)\s+([A-Z][A-Za-z0-9]*)/gm)];
  const componentes = [];
  for (let i = 0; i < marcas.length; i++) {
    const ini = marcas[i].index;
    const fim = i + 1 < marcas.length ? marcas[i + 1].index : fonte.length;
    const corpo = fonte.slice(ini, fim);
    componentes.push({
      nome: marcas[i][1],
      corpo,
      // `useRender` do Base UI e `useId` contam: é hook, e hook é cliente.
      hooks: [...new Set([...corpo.matchAll(/\b(use[A-Z][A-Za-z0-9]*)\s*\(/g)].map(m => m[1]))],
      // Manipulador PRESO EM JSX (`onClick={...}`), não a prop declarada num tipo.
      eventos: [...new Set([...corpo.matchAll(/\son([A-Z][A-Za-z]*)=\{/g)].map(m => "on" + m[1]))],
      motorDoModulo: motores,
    });
  }
  modulos.set(arq.replace(".tsx", ""), {diretiva, motores, simbolosDeMotor, componentes});
}

// ── Passo 1: quem precisa de cliente POR SI ──────────────────────────────────────────────────
const precisa = new Map();   // nome -> motivo
const todos = new Map();     // nome -> {modulo, comp}
for (const [mod, m] of modulos) {
  for (const c of m.componentes) {
    todos.set(c.nome, {modulo: mod, comp: c});
    const razoes = [];
    if (c.hooks.length) razoes.push("hook: " + c.hooks.join(", "));
    if (c.eventos.length) razoes.push("evento: " + c.eventos.join(", "));
    // Motor só conta se o componente CITA um símbolo importado dele; import no topo do módulo não
    // é prova de que este componente o usa.
    const usados = [...m.simbolosDeMotor].filter(s => new RegExp("\\b" + s + "\\b").test(c.corpo));
    if (usados.length) razoes.push(`motor: ${usados.join(", ")} (${m.motores.join(", ")})`);
    if (razoes.length) precisa.set(c.nome, razoes.join(" · "));
  }
}

// ── Passo 2: contágio. Quem USA um cliente, é cliente. Roda até estabilizar ───────────────────
const nomes = [...todos.keys()];
let mudou = true, voltas = 0;
while (mudou && voltas++ < 20) {
  mudou = false;
  for (const [nome, {comp}] of todos) {
    if (precisa.has(nome)) continue;
    const culpado = nomes.find(n => n !== nome && precisa.has(n) &&
      new RegExp("<" + n + "[\\s/>]|\\b" + n + "\\s*\\(").test(comp.corpo));
    if (culpado) { precisa.set(nome, `contágio: usa ${culpado}`); mudou = true; }
  }
}

// ── Relatório ────────────────────────────────────────────────────────────────────────────────
const linhas = [];
let totalPuros = 0, total = 0;
for (const [mod, m] of modulos) {
  if (!m.componentes.length) continue;
  const puros = m.componentes.filter(c => !precisa.has(c.nome));
  total += m.componentes.length;
  totalPuros += puros.length;
  linhas.push({mod, diretiva: m.diretiva, n: m.componentes.length, puros: puros.map(c => c.nome)});
}

console.log("## Por módulo\n");
console.log("| módulo | `use client` | exports | não precisam | quais |");
console.log("|---|:--:|---:|---:|---|");
for (const l of linhas)
  console.log(`| \`${l.mod}\` | ${l.diretiva ? "sim" : "—"} | ${l.n} | **${l.puros.length}** | ${l.puros.join(", ") || "—"} |`);

console.log(`\n**Total:** ${totalPuros} de ${total} exports não precisam de cliente por nada que façam.\n`);

console.log("## Os quatro que o item O1 acusa\n");
for (const mod of ["data-display", "layout", "chart", "qrcode"]) {
  const m = modulos.get(mod);
  if (!m) continue;
  console.log(`\n### \`${mod}\``);
  for (const c of m.componentes)
    console.log(`- **${c.nome}** — ${precisa.get(c.nome) ?? "**não precisa de cliente**"}`);
}

// ── O NÚMERO QUE DECIDE: o que o consumidor PAGA ─────────────────────────────────────────────
// Contar componente puro não decide nada sozinho. Num framework de RSC, importar UM componente de
// um módulo com a diretiva embarca o módulo INTEIRO e tudo que ele importa — então o preço de
// `Card` não é `Card`, é o fecho transitivo de `layout.js`. É esse fecho que a separação
// eliminaria, e é ele que precisa ser grande o bastante para valer a mudança.
const DIST = new URL("../packages/react/dist/", import.meta.url);
const lerDist = (m) => { try { return readFileSync(new URL(m, DIST), "utf8"); } catch { return null; } };
const importsDe = (m) => {
  const s = lerDist(m);
  if (!s) return [];
  return [...s.matchAll(/from\s+"(\.\/[^"]+)"/g)].map(x => x[1].slice(2));
};
const fecho = (inicio) => {
  const vistos = new Set(); const fila = [inicio];
  while (fila.length) {
    const m = fila.pop();
    if (vistos.has(m)) continue;
    vistos.add(m);
    for (const d of importsDe(m)) if (!vistos.has(d)) fila.push(d);
  }
  return [...vistos];
};
const kb = (m) => { const s = lerDist(m); return s ? s.length / 1024 : 0; };

console.log("\n## O preço de importar UM componente puro\n");
console.log("| se o consumidor importa… | módulos que embarcam | peso |");
console.log("|---|---:|---:|");
for (const l of linhas.filter(l => l.puros.length).sort((a, b) => b.puros.length - a.puros.length)) {
  const f = fecho(l.mod + ".js");
  const peso = f.reduce((a, m) => a + kb(m), 0);
  console.log(`| ${l.puros.join(", ")} (\`${l.mod}.js\`) | ${f.length} | **${peso.toFixed(1)} KB** |`);
}
const puroHoje = fecho("pure.js");
console.log(`| — o módulo de servidor que já existe (\`pure.js\`) | ${puroHoje.length} | ${puroHoje.reduce((a, m) => a + kb(m), 0).toFixed(1)} KB |`);
