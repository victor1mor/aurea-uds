// Confere, prop a prop, se o `App.js` chama os componentes da Aurea com nomes que EXISTEM.
//
//   node apps/native-smoke/conferir-props.mjs
//
// 🔴 POR QUE ISTO EXISTE, e a razão é um defeito meu de 12/09/2026. Escrevendo o modo `lote7` eu
// chamei `<NumberField onChangeValue={...} value="0">`. O nome certo é `onValueChange`, e o
// `value` é NÚMERO, não string. **Nada pegou:** o `App.js` é `.js`, o Metro não tipa, e o app
// teria subido no aparelho com o campo mudo — um botão `+` que não soma, sem erro no console.
//
// ⚠ Este app é o primeiro CONSUMIDOR da biblioteca, e o consumidor é onde o erro de API aparece.
// Os 1409 testes usam os tipos; aqui não há tipo nenhum. O gate fecha exatamente essa fresta, e
// **não** repete o que o `tsc` já faz no pacote.
//
// ⚠ **As bases do React Native entram como SUPERCONJUNTO, e isso é escolha declarada.** O
// `ViewProps` do RN 0.87 é uma composição de nove interfaces com `Omit<..., keyof ...>`
// encadeado — reconstruí-la por expressão regular seria escrever a minha IDEIA do que ela é,
// que é o erro que este repositório mais paga. Em vez disso o script colhe TODO nome de prop
// declarado nos três arquivos de base. Um superconjunto só erra para um lado: deixa passar
// prop do RN escrita errada. Nunca reprova prop legítima — e falso positivo num gate é o que
// faz o gate ser desligado.
//   Provado: `<Topbar accessibilityLabel="topo">` passa (é do RN) e `<Topbar titulo="x">`
//   reprova (não é de ninguém).
//
// ⚠ O que ele NÃO faz, e fica declarado: não confere o TIPO do valor (`value="0"` contra
// `value={0}` passa), nem prop obrigatória que falta. Ele pega nome errado e nome inventado, que
// é a classe que custou a rodada. Ampliar isso é um parser de verdade, e aí o caminho é `tsc`
// com `checkJs` — que depende de o pacote estar instalado como fonte, e não está.
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const fonte = (n) => readFileSync(join(raiz, "packages", "native", "src", n), "utf-8");

// As interfaces são lidas do FONTE, não de uma lista escrita à mão — lista à mão envelhece, e a
// primeira coisa que este repositório aprendeu é que documentação desatualizada mente com
// confiança. Herança (`extends`) é seguida.
const MODULOS = ["busca.tsx", "numero.tsx", "midia.tsx", "inputs.tsx", "layout.tsx",
                 "overlays.tsx", "data.tsx", "navigation.tsx", "display.tsx", "feedback.tsx",
                 "actions.tsx", "text.tsx", "screen.tsx", "chart.tsx"];

// 🔴 AS BASES DO REACT NATIVE, LIDAS DO PACOTE INSTALADO — não escritas aqui.
//
// Dezesseis dos componentes deste pacote herdam de `ViewProps` ou `PressableProps`, e sem
// resolvê-las o gate dizia "sem gate" para quase metade da lista — o que é o mesmo que não ter
// gate, com a agravante de parecer verde. A lista sai de `types_generated/`, que é o que o
// `moduleResolution: "bundler"` de fato resolve (medido em 09/09/2026, quando o `check 41`
// descobriu que a união `AccessibilityRole` de lá termina em `| string`).
//
// ⚠ É deliberadamente RASA: pega as props declaradas em `ViewProps` e nas suas bases diretas de
// acessibilidade, não a árvore inteira do DOM do RN. O que ela precisa cobrir é `style`,
// `testID`, `onPress`, `accessibilityLabel` e companhia — o que o `App.js` realmente escreve.
const RN = (() => {
  // ⚠ O caminho é RESOLVIDO, não montado à mão: com pnpm o `react-native` não mora em
  // `node_modules/` da raiz — ele está sob `packages/native/node_modules/`, e a primeira versão
  // deste script montou o caminho da raiz, não achou nada e mesmo assim saiu VERDE dizendo
  // "sem gate" para 14 componentes. **Gate que degrada em silêncio é o defeito que este
  // repositório documenta em três checks diferentes** — por isso o `process.exit` abaixo.
  let base;
  try {
    const req = createRequire(import.meta.url);
    base = join(dirname(req.resolve("react-native/package.json", {
      paths: [join(raiz, "packages", "native")],
    })), "types_generated", "Libraries");
  } catch { return new Set(); }
  const alvos = [
    join(base, "Components", "View", "ViewPropTypes.d.ts"),
    join(base, "Components", "View", "ViewAccessibility.d.ts"),
    join(base, "Components", "Pressable", "Pressable.d.ts"),
  ];
  const props = new Set();
  for (const a of alvos) {
    let txt;
    try { txt = readFileSync(a, "utf-8"); }
    catch { continue; }
    for (const m of txt.matchAll(/^\s{2}(?:readonly\s+)?(\w+)\??\s*[:?]/gm)) props.add(m[1]);
  }
  return props;
})();

// Sem as bases do RN o gate cobriria menos da metade e sairia verde. Parar é a única resposta
// honesta: 14 componentes "sem gate" numa saída verde foi exatamente o que aconteceu na
// primeira versão deste arquivo.
if (RN.size < 40) {
  console.error(`props: REPROVADO — as bases do react-native nao foram lidas (${RN.size} props). `
    + "O caminho de `types_generated/` mudou, e sem elas o gate nao cobre quem herda de ViewProps.");
  process.exit(1);
}

const interfaces = new Map();
const alias = new Map();
for (const m of MODULOS) {
  const txt = fonte(m);
  // Sem `export`: `ControleProps` e `Virtualizavel` são internas e MANDAM em `Checkbox`, `Radio`
  // e `Table`. Ler só o exportado deixaria três componentes sem gate — e sem ninguém saber.
  const re = /(?:export\s+)?interface\s+(\w+)(?:<[^>]*>)?(?:\s+extends\s+([^{]+?))?\s*\{/g;
  let mt;
  while ((mt = re.exec(txt))) {
    let i = re.lastIndex, nivel = 1;
    while (i < txt.length && nivel > 0) {
      if (txt[i] === "{") nivel++;
      else if (txt[i] === "}") nivel--;
      i++;
    }
    const corpo = txt.slice(re.lastIndex, i - 1);
    const props = new Set();
    for (const p of corpo.matchAll(/^\s{2}(?:readonly\s+)?(\w+)\??\s*:/gm)) props.add(p[1]);
    interfaces.set(mt[1], {props, herda: (mt[2] ?? "").trim()});
  }
  // `export type CheckboxProps = ControleProps;` — alias puro, e o `Checkbox` inteiro depende dele.
  for (const a of txt.matchAll(/export type (\w+)\s*=\s*(\w+)\s*;/g)) alias.set(a[1], a[2]);
  // `type Virtualizavel = { ... }` — objeto literal, não interface. O `Timeline` e a `Table`
  // herdam DELE, e lê-lo só como interface deixava os dois sem gate.
  const rt = /(?:export\s+)?type\s+(\w+)(?:<[^>]*>)?\s*=\s*\{/g;
  let ta;
  while ((ta = rt.exec(txt))) {
    let i = rt.lastIndex, nivel = 1;
    while (i < txt.length && nivel > 0) {
      if (txt[i] === "{") nivel++;
      else if (txt[i] === "}") nivel--;
      i++;
    }
    const props = new Set();
    for (const q of txt.slice(rt.lastIndex, i - 1).matchAll(/^\s{2}(?:readonly\s+)?(\w+)\??\s*:/gm)) props.add(q[1]);
    if (!interfaces.has(ta[1])) interfaces.set(ta[1], {props, herda: ""});
  }
}

// Devolve `{props, aberta}`. `aberta` é o caso honesto: a interface herda de algo que não mora
// neste repositório (`PressableProps` do RN, por exemplo), então não dá para saber o conjunto
// completo — e fingir que dá reprovaria prop legítima. O gate DECLARA isso em vez de calar.
const propsDe = (nome, vistos = new Set()) => {
  if (vistos.has(nome)) return {props: new Set(), aberta: false};
  vistos.add(nome);
  if (alias.has(nome)) return propsDe(alias.get(nome), vistos);
  const it = interfaces.get(nome);
  if (!it) return null;
  const saida = new Set(it.props);
  let aberta = false;
  for (const trecho of partirHeranca(it.herda)) {
    const om = /^Omit<\s*(\w+)\s*,([\s\S]*)>$/.exec(trecho);
    const base = om ? om[1] : trecho.replace(/<.*/, "");
    // `ViewProps`/`PressableProps` e as bases de acessibilidade do RN entram pela lista lida do
    // pacote instalado; qualquer outra coisa de fora deixa a interface ABERTA, e isso é dito.
    if (!interfaces.has(base) && !alias.has(base)) {
      if (RN.size > 0 && /Props$/.test(base)) { for (const p of RN) saida.add(p); continue; }
      aberta = true; continue;
    }
    const herdado = propsDe(base, vistos);
    if (!herdado) { aberta = true; continue; }
    const tirar = om ? new Set([...om[2].matchAll(/"([^"]+)"/g)].map((x) => x[1])) : new Set();
    for (const p of herdado.props) if (!tirar.has(p)) saida.add(p);
    if (herdado.aberta) aberta = true;
  }
  return {props: saida, aberta};
};

// `extends A, Omit<B, "x" | "y">` — a vírgula de dentro do `<>` NÃO separa bases.
function partirHeranca(txt) {
  const saida = [];
  let nivel = 0, atual = "";
  for (const c of txt ?? "") {
    if (c === "<") nivel++;
    else if (c === ">") nivel--;
    if (c === "," && nivel === 0) { if (atual.trim()) saida.push(atual.trim()); atual = ""; continue; }
    atual += c;
  }
  if (atual.trim()) saida.push(atual.trim());
  return saida;
}

// A tabela de quem é quem no `App.js`. O `Image` entra renomeado, porque o `App.js` já tem o
// `Image` do próprio React Native no escopo.
const TAGS = {
  Combobox: "ComboboxProps", SearchField: "SearchFieldProps", NumberField: "NumberFieldProps",
  AureaImage: "ImageProps", Gallery: "GalleryProps", Field: "FieldProps", Input: "InputProps",
  Select: "SelectProps", Switch: "SwitchProps", Checkbox: "CheckboxProps", Radio: "RadioProps",
  SegmentedControl: "SegmentedControlProps", Screen: "ScreenProps", Dialog: "DialogProps",
  ConfirmDialog: "ConfirmDialogProps", Drawer: "DrawerProps", BottomSheet: "BottomSheetProps",
  Table: "TableProps", Timeline: "TimelineProps", DataList: "DataListProps",
  BottomNav: "BottomNavProps", Topbar: "TopbarProps", NavList: "NavListProps",
  Stepper: "StepperProps", Chart: "ChartProps", KPI: "KPIProps", Alert: "AlertProps",
  Badge: "BadgeProps", Status: "StatusProps", Progress: "ProgressProps", Avatar: "AvatarProps",
  EmptyState: "EmptyStateProps", DataState: "DataStateProps", Spinner: "SpinnerProps",
  Skeleton: "SkeletonProps", Button: "ButtonProps", IconButton: "IconButtonProps",
};

// `children` e `key` não moram nas interfaces — são do React, e valem em todo elemento.
const DO_REACT = new Set(["key", "ref", "children"]);

const app = readFileSync(join(raiz, "apps", "native-smoke", "App.js"), "utf-8");
const erros = [];
const abertas = [];

for (const [tag, iface] of Object.entries(TAGS)) {
  const achado = propsDe(iface);
  if (!achado) { erros.push(`interface ${iface} nao encontrada no fonte (tag <${tag}>)`); continue; }
  if (achado.aberta) { abertas.push(`${tag} (${iface} herda de fora do repositorio)`); continue; }
  const conhecidas = achado.props;
  const abre = new RegExp(`<${tag}(?=[\\s/>])`, "g");
  let m;
  while ((m = abre.exec(app))) {
    // Anda ate o `>` que fecha a ABERTURA, ignorando tudo dentro de `{}` e de string.
    let i = m.index + m[0].length, chave = 0, aspas = null, fim = -1;
    while (i < app.length) {
      const c = app[i];
      if (aspas) { if (c === aspas) aspas = null; }
      else if (c === '"' || c === "'" || c === "`") aspas = c;
      else if (c === "{") chave++;
      else if (c === "}") chave--;
      else if (c === ">" && chave === 0) { fim = i; break; }
      i++;
    }
    if (fim < 0) { erros.push(`<${tag}> sem fechamento de abertura`); continue; }
    const atributos = app.slice(m.index + m[0].length, fim);
    // Só os nomes no nível ZERO de chaves — `onPress={() => setAba("x")}` não pode doar `setAba`.
    let nivel = 0, palavra = "", str = null;
    const usadas = [];
    for (let k = 0; k < atributos.length; k++) {
      const c = atributos[k];
      if (str) { if (c === str) str = null; continue; }
      if (c === '"' || c === "'" || c === "`") { str = c; continue; }
      if (c === "{") { nivel++; continue; }
      if (c === "}") { nivel--; continue; }
      if (nivel > 0) continue;
      if (/[\w]/.test(c)) { palavra += c; continue; }
      if (palavra && (c === "=" || /\s/.test(c))) usadas.push(palavra);
      palavra = "";
    }
    if (palavra) usadas.push(palavra);
    const linha = app.slice(0, m.index).split("\n").length;
    for (const u of usadas) {
      if (DO_REACT.has(u) || conhecidas.has(u)) continue;
      erros.push(`App.js:${linha}  <${tag} ${u}=...>  — ${iface} nao tem "${u}"`);
    }
  }
}

if (erros.length) {
  console.error("props: REPROVADO\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
const conferidos = Object.keys(TAGS).length - abertas.length;
console.log(`props: OK — ${conferidos} componentes conferidos contra o fonte`);
// Declarado, nunca calado: componente com herança de fora fica SEM gate, e quem lê tem de saber
// quais são para não achar que a saída verde cobre os 36.
if (abertas.length) {
  console.log(`  sem gate (${abertas.length}): ` + abertas.join(", "));
}
