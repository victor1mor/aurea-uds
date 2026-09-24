// Extrai a API pública REAL de @aurea-uds/react da emissão do tsc.
//
// Nasceu como medição da Fase Zero da ATIVIDADE-2 e virou passo de build porque o que ela mediu
// era um gap sistêmico (G-REG-02): a ficha do registry é escrita À MÃO e nada a confrontava com
// o compilador. Foi assim que cinco fichas puderam anunciar `sizes: sm/md/lg` durante meses sem
// que existisse uma prop `size` — e que o `ToolbarButton` pôde declarar uma variante `neutral`
// que não existe em `ButtonVariant`.
//
// Agora é o contrário: o contrato de API é DERIVADO da fonte (§118 da ordem) e o check 26 do
// validador reprova a ficha que discordar dele (§119). O arquivo é gerado e commitado; a CI
// falha se a árvore ficar suja depois do `pnpm build`, que é a mesma trava do `dist == build`.
//
// Rodar:  node scripts/build-api-surface.mjs   (ou `pnpm build`)
// Escreve: packages/contracts/api-surface.json
//
// Não usa a API programática do TypeScript de propósito: ela não é estável até a 7.1
// (CLAUDE.md, Toolchain). A emissão de declaração do tsc é regular o bastante para ser lida.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "packages/react/dist");

/** Fatia de `src` a partir de `i` (que aponta para o abre) até o fecha correspondente. */
function balanced(src, i, open, close) {
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === open) depth++;
    else if (src[j] === close) {
      depth--;
      if (depth === 0) return src.slice(i, j + 1);
    }
  }
  return src.slice(i);
}

/** "a" | "b" | "c"  ->  ["a","b","c"];  qualquer coisa não-literal -> null */
function literalUnion(text) {
  const parts = text.split("|").map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return null;
  const out = [];
  for (const p of parts) {
    const m = /^"([^"]*)"$/.exec(p);
    if (!m) return null;
    out.push(m[1]);
  }
  return out;
}

/** Corpo de um objeto `{ ... }` -> lista de props, respeitando aninhamento e assinaturas. */
function parseMembers(body) {
  const inner = body.replace(/^\{/, "").replace(/\}$/, "");
  const props = [];
  let buf = "";
  let depth = 0;
  const flush = () => {
    const line = buf.trim();
    buf = "";
    if (!line || line.startsWith("//")) return;
    const m = /^(?:readonly\s+)?(\[[^\]]+\]|"[^"]+"|[A-Za-z_$][\w$]*)(\?)?\s*:\s*([\s\S]+)$/.exec(line);
    if (!m) return;
    props.push({name: m[1], optional: Boolean(m[2]), type: m[3].trim().replace(/\s+/g, " ")});
  };
  // O `>` de uma SETA não fecha nada, e contá-lo como fechamento levava a profundidade a
  // NEGATIVO — uma vez por prop de função. Medido em 29/08/2026 no `DependencyGraph`: depois de
  // dois `=>void`, a profundidade estava em -2, então o `;` de dentro de `{x:number;y:number}`
  // caía em `depth <= 0` e partia o tipo no meio. O resultado era uma prop fantasma chamada `y`
  // na superfície publicada, que a ficha então era cobrada de declarar. Comparar com o caractere
  // ANTERIOR separa a seta do fechamento de genérico, que é o outro uso de `>`.
  let anterior = "";
  for (const ch of inner) {
    if ("{([<".includes(ch)) depth++;
    else if ("})]".includes(ch)) depth--;
    else if (ch === ">" && anterior !== "=") depth--;
    anterior = ch;
    if ((ch === ";" || ch === "\n") && depth <= 0) {
      if (ch === ";") { flush(); continue; }
      if (buf.trim().endsWith(",") || buf.trim() === "") { flush(); continue; }
    }
    buf += ch;
  }
  flush();
  return props;
}

const modules = {};
const aliases = {};             // nome do tipo -> união literal
const interfaces = {};          // nome da interface -> {props, extends, module}
const pseudoInterfaces = [];    // aliases que são interseção com objeto literal

const files = fs.readdirSync(DIST).filter((f) => f.endsWith(".d.ts")).sort();

// Passo 1 — aliases e interfaces de todos os módulos, porque um módulo estende o tipo do outro.
for (const file of files) {
  const src = fs.readFileSync(path.join(DIST, file), "utf8");
  const mod = file.replace(/\.d\.ts$/, "");

  // O corpo de um alias vai até o `;` de PROFUNDIDADE ZERO. Parar no primeiro `;` cru quebrava
  // todo alias com objeto dentro — `type CalendarProps = ComponentProps<typeof DayPicker> &
  // {label?: string}` virava um raw truncado no meio das chaves, e o Calendar saía do inventário
  // com zero props. O extrator erra para menos quando não entende; aqui ele passou a entender.
  for (const m of src.matchAll(/export\s+type\s+([A-Za-z_$][\w$]*)\s*=\s*/g)) {
    const inicio = m.index + m[0].length;
    let depth = 0, fim = src.length;
    for (let j = inicio; j < src.length; j++) {
      const ch = src[j];
      if ("{([<".includes(ch)) depth++;
      else if ("})]>".includes(ch)) depth--;
      else if (ch === ";" && depth <= 0) { fim = j; break; }
    }
    const corpo = src.slice(inicio, fim);
    aliases[m[1]] = {module: mod, raw: corpo.trim().replace(/\s+/g, " "), union: literalUnion(corpo)};

    // Um alias que é interseção com objeto literal também é um contrato de props. Registra como
    // pseudo-interface para o `resolveProps` alcançar, com os pais que forem interface local.
    if (corpo.includes("{")) {
      const props = [];
      for (let j = 0; j < corpo.length; j++) {
        if (corpo[j] !== "{") continue;
        const bloco = balanced(corpo, j, "{", "}");
        props.push(...parseMembers(bloco));
        j += bloco.length - 1;
      }
      const pais = [...corpo.matchAll(/(?:^|&)\s*([A-Za-z_$][\w$]*)\s*(?=&|$)/g)].map((x) => x[1]);
      pseudoInterfaces.push([m[1], {module: mod, extends: pais.join(", "), props}]);
    }
  }

  // `export` OPCIONAL: uma interface INTERNA continua fazendo parte da forma resolvida quando um
  // tipo exportado a referencia. O `Toggle` é o caso: `ToggleProps = ToggleBase & (…)`, com
  // `ToggleBase` sem `export` — o leitor não a via, então `ToggleProps` ficava sem props e o
  // check 14 acusava o componente de ter perdido a escala inteira. O tipo estava certo; o leitor
  // é que não alcançava. Achado no merge de 28/08/2026, junto com a união de aliases.
  // Ler interface interna não alarga a superfície pública: ela só entra na conta se um tipo
  // exportado apontar para ela, que é exatamente quando ela É a superfície.
  const re = /(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)([^{]*)\{/g;
  let m;
  while ((m = re.exec(src))) {
    const open = src.indexOf("{", m.index + m[0].length - 1);
    const body = balanced(src, open, "{", "}");
    interfaces[m[1]] = {
      module: mod,
      extends: m[2].replace(/^\s*extends\s*/, "").trim().replace(/\s+/g, " "),
      props: parseMembers(body),
    };
    re.lastIndex = open + body.length;
  }
}

for (const [nome, iface] of pseudoInterfaces) if (!interfaces[nome]) interfaces[nome] = iface;

/** Expande `size?: ComponentSize` para os literais, quando o alias for literal. */
function expand(type, seen = new Set()) {
  const direct = literalUnion(type);
  if (direct) return direct;
  const key = type.trim();
  if (seen.has(key)) return null;
  seen.add(key);
  const a = aliases[key];
  if (a?.union) return a.union;
  if (a) {                       // alias que aponta para outro alias: BannerVariant = AlertVariant
    const chained = expand(a.raw, seen);
    if (chained) return chained;
  }
  const ex = /^Extract<\s*([A-Za-z_$][\w$]*)\s*,\s*([\s\S]+)>$/.exec(type.trim());
  if (ex) {
    const base = expand(ex[1], seen);
    const pick = literalUnion(ex[2]);
    if (base && pick) return pick.filter((p) => base.includes(p));
  }
  // `Exclude<T, "x">` é o simétrico do `Extract` acima, e entrou com o `G-A11Y-11`: a união
  // discriminada do `Card` escreve o ramo não-interativo como `Exclude<CardVariante,
  // "interactive">`. Sem esta linha o gate 14 via `values: null` e acusava o Card de ter perdido
  // as seis variantes — o tipo estava certo, o leitor é que não conhecia a forma.
  const exc = /^Exclude<\s*([A-Za-z_$][\w$]*)\s*,\s*([\s\S]+)>$/.exec(type.trim());
  if (exc) {
    const base = expand(exc[1], seen);
    const fora = literalUnion(exc[2]);
    if (base && fora) return base.filter((p) => !fora.includes(p));
  }
  // `Responsive<T>` (G-AXIS-04) é um INVÓLUCRO: a escala continua sendo `T`, e o que mudou foi a
  // forma de escrevê-la — simples, por viewport ou por container. Sem esta linha o extrator
  // devolvia `null` para `size?: Responsive<ComponentSize>`, e o check 14 acusava três
  // componentes de terem perdido a escala inteira. O gate estava certo em reclamar (o tipo mudou
  // mesmo); errado seria concluir que a CAPACIDADE mudou. Medido em 22/08/2026.
  const resp = /^Responsive<\s*([\s\S]+)\s*>$/.exec(type.trim());
  if (resp) return expand(resp[1], seen);
  // UNIÃO CUJAS PARTES SÃO ALIASES — `A | B`, e não `"a" | "b"`. O leitor sabia expandir alias em
  // CADEIA (`Banner = AlertVariant`) e não sabia expandir alias em PARALELO, então
  // `BottomNavVariant | BottomNavVariantLegacy` saía como "não é união literal" e o check 14 não
  // tinha o que comparar: acusava a ficha de declarar seis valores que o tipo "não tem" — com o
  // tipo tendo os seis. Achado no merge de 28/08/2026, e é o mesmo defeito de classe do `Extract`
  // e do `Responsive` acima: forma legítima que o leitor não conhecia.
  // Só divide no `|` de PROFUNDIDADE ZERO: `Foo<A|B> | C` tem de partir em dois, não em três.
  if (type.includes("|")) {
    const partes = [];
    let nivel = 0, atual = "";
    for (const ch of type) {
      if (ch === "<" || ch === "(" || ch === "{" || ch === "[") nivel++;
      else if (ch === ">" || ch === ")" || ch === "}" || ch === "]") nivel--;
      if (ch === "|" && nivel === 0) { partes.push(atual); atual = ""; } else atual += ch;
    }
    partes.push(atual);
    if (partes.length > 1) {
      const todos = [];
      for (const parte of partes) {
        const vals = expand(parte.trim(), new Set(seen));
        if (!vals) return null;              // uma parte não-literal invalida a união inteira
        for (const v of vals) if (!todos.includes(v)) todos.push(v);
      }
      return todos;
    }
  }
  return null;
}

function resolveProps(name, seen = new Set()) {
  if (!name || seen.has(name)) return [];
  seen.add(name);
  const iface = interfaces[name];
  if (!iface) return [];
  const inherited = [];
  // `extends A, Omit<B,"x">, Pick<C,"y">` — vírgula dentro de <> não separa pai.
  const parents = [];
  let buf = "", depth = 0;
  for (const ch of iface.extends) {
    if (ch === "<") depth++;
    else if (ch === ">") depth--;
    if (ch === "," && depth === 0) { parents.push(buf); buf = ""; continue; }
    buf += ch;
  }
  parents.push(buf);
  for (const parent of parents.map((s) => s.trim()).filter(Boolean)) {
    const util = /^(?:Omit|Pick|Partial|Required|Readonly)<\s*([A-Za-z_$][\w$]*)/.exec(parent);
    const bare = util?.[1] ?? /^([A-Za-z_$][\w$]*)/.exec(parent)?.[1];
    if (!bare || !interfaces[bare]) continue;
    let props = resolveProps(bare, seen);
    // Omit<X,"a"|"b"> tira; Pick<X,"a"> fica só com o que foi escolhido.
    const arg = /^(?:Omit|Pick)<\s*[A-Za-z_$][\w$]*\s*,([\s\S]+)>$/.exec(parent)?.[1];
    const keys = arg ? (literalUnion(arg) ?? []) : null;
    if (keys && parent.startsWith("Omit")) props = props.filter((p) => !keys.includes(p.name));
    if (keys && parent.startsWith("Pick")) props = props.filter((p) => keys.includes(p.name));
    inherited.push(...props);
  }
  // OS RAMOS DE UMA UNIÃO DISCRIMINADA SE SOMAM, e não se substituem.
  //
  // `CardProps = Base & ({variant?: Exclude<V,"interactive">; …} | {variant: "interactive"; …})`
  // registra `variant` DUAS vezes — uma por ramo —, e a leitura ingênua ficava com a primeira.
  // O `api-surface` publicava cinco variantes de seis, e o check 14 acusava o Card de ter perdido
  // `interactive`: o tipo estava completo e o leitor é que via metade.
  //
  // Isto vai se repetir. A união discriminada é o mecanismo do `G-API-02` para exigir, no TIPO, o
  // que hoje se pede em prosa — e o próximo a usá-la é o `items | children` do Menu.
  const cru = iface.props.map((p) => ({...p, values: expand(p.type)}));
  const porNome = new Map();
  for (const p of cru) {
    const antes = porNome.get(p.name);
    if (!antes) { porNome.set(p.name, {...p}); continue; }
    // valores: a união dos ramos. Tipo: os dois, para o relatório não esconder a forma real.
    const vals = [...(antes.values ?? []), ...(p.values ?? [])];
    antes.values = vals.length ? [...new Set(vals)].sort() : null;
    if (antes.type !== p.type) antes.type = `${antes.type} | ${p.type}`;
    // opcional só onde é opcional em TODOS os ramos — num deles obrigatória, o consumidor
    // precisa fornecê-la em algum caminho.
    antes.optional = antes.optional && p.optional;
  }
  const own = [...porNome.values()];
  const names = new Set(own.map((p) => p.name));
  return [...inherited.filter((p) => !names.has(p.name)), ...own];
}

// Passo 2 — componentes exportados por módulo.
for (const file of files) {
  const src = fs.readFileSync(path.join(DIST, file), "utf8");
  const mod = file.replace(/\.d\.ts$/, "");
  const comps = [];

  // export declare const X: React.ForwardRefExoticComponent<Omit<XProps, "ref"> & ...>
  // Context não é componente, e um `const` cujo tipo é uma função é hook ou utilitário.
  for (const m of src.matchAll(/export\s+declare\s+const\s+([A-Z][\w$]*)\s*:\s*([^;]+);/g)) {
    if (/\bContext<;?/.test(m[2]) || /=>/.test(m[2])) continue;
    const propsName = /Omit<\s*([A-Za-z_$][\w$]*)\s*,/.exec(m[2])?.[1]
      ?? /ForwardRefExoticComponent<\s*([A-Za-z_$][\w$]*)/.exec(m[2])?.[1];
    comps.push({name: m[1], kind: "const", propsType: propsName ?? null, props: resolveProps(propsName)});
  }

  // export declare function X(arg: T): React.JSX.Element
  for (const m of src.matchAll(/export\s+declare\s+function\s+([A-Z][\w$]*)\s*(?:<[^(]*>)?\s*\(/g)) {
    const paren = src.indexOf("(", m.index + m[0].length - 1);
    const args = balanced(src, paren, "(", ")").slice(1, -1);
    const colon = (() => {
      let depth = 0;
      for (let j = 0; j < args.length; j++) {
        const ch = args[j];
        if ("{([<".includes(ch)) depth++;
        else if ("})]>".includes(ch)) depth--;
        else if (ch === ":" && depth === 0) return j;
      }
      return -1;
    })();
    const typeText = colon < 0 ? "" : args.slice(colon + 1).trim();
    let propsName = null;
    let props = [];
    const bare = /^([A-Za-z_$][\w$]*)(?:<|$)/.exec(typeText)?.[1];
    if (bare && interfaces[bare]) { propsName = bare; props = resolveProps(bare); }
    for (const piece of typeText.split("&")) {
      const n = /^\s*([A-Za-z_$][\w$]*)\s*$/.exec(piece)?.[1];
      if (n && interfaces[n] && n !== propsName) props.push(...resolveProps(n));
    }
    const braceAt = typeText.indexOf("{");
    if (braceAt >= 0) {
      const inline = balanced(typeText, braceAt, "{", "}");
      props.push(...parseMembers(inline).map((p) => ({...p, values: expand(p.type)})));
    }
    const seen = new Set();
    props = props.filter((p) => !seen.has(p.name) && seen.add(p.name));
    comps.push({name: m[1], kind: "function", propsType: propsName, props});
  }

  const hooks = [
    ...[...src.matchAll(/export\s+declare\s+function\s+(use[A-Z][\w$]*)\s*(?:<[^(]*>)?\s*\(/g)].map((m) => m[1]),
    ...[...src.matchAll(/export\s+declare\s+const\s+(use[A-Z][\w$]*)\s*:/g)].map((m) => m[1]),
  ];
  modules[mod] = {
    components: comps.sort((a, b) => a.name.localeCompare(b.name)),
    hooks,
    clientDirective: src.includes('"use client"'),
  };
}

const allComponents = Object.entries(modules).flatMap(([mod, m]) =>
  m.components.map((c) => ({...c, module: mod})));

const out = {
  _gerado: "node scripts/build-api-surface.mjs — lido da emissão do tsc, não do registry. " +
    "Editar à mão é o defeito que ele existe para não repetir.",
  _regra: "Quando isto e a ficha do registry discordam, isto ganha: veio do compilador. " +
    "O check 26 do validate.py reprova a divergência.",
  schemaVersion: "1.0",
  totals: {
    modulos: Object.keys(modules).length,
    componentes: allComponents.length,
    hooks: Object.values(modules).flatMap((m) => m.hooks).length,
    aliasesLiterais: Object.values(aliases).filter((a) => a.union).length,
    propsDistintas: new Set(allComponents.flatMap((c) => c.props.map((p) => p.name))).size,
  },
  aliases,
  modules,
};

// Sem data no arquivo, de propósito: um carimbo de "gerado em" mudaria o conteúdo a cada
// execução e a trava de árvore suja da CI acusaria diferença todo dia, sem defeito nenhum.
fs.writeFileSync(path.join(ROOT, "packages/contracts/api-surface.json"),
                 JSON.stringify(out, null, 2) + "\n");
console.log(`build-api-surface: ${out.totals.componentes} componentes, ${out.totals.modulos} módulos, ` +
  `${out.totals.hooks} hooks, ${out.totals.propsDistintas} nomes de prop distintos ` +
  `-> packages/contracts/api-surface.json`);
