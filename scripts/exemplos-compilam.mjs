// A TRAVA 1 — O EXEMPLO COMPILA (bloco 1, o 1-B — 23/10/2026; decidida pelo Victor em 19/10/2026, item 73 do documento de
// achados: *"padrões tão rigorosos que você ou qualquer outra IA teria que seguir"*).
//
// Todo trecho de código que o site mostra como TypeScript — a aba "Code" de cada exemplo das páginas de componente, de
// padrão, de bloco e de gancho, os blocos `tsx`/`ts` das páginas da Getting Started, do README e da skill, e os exemplos
// das páginas do nativo — é compilado pelo `tsc` 7 contra o pacote MONTADO (`packages/*/dist`), como um app o usaria.
// Um exemplo que ensina uma prop que não existe, um valor fora da união, um nome de ícone errado ou uma peça que ninguém
// exporta reprova aqui, com a página e o título do exemplo.
//
// Por que um verificador nosso (a pesquisa da trava, item 76): o mercado guarda os exemplos em arquivo real (a
// referência: 835 `.tsx` no `tsc` da CI) ou extrai os blocos e roda o `tsc` (o `extractExamples` de outro sistema); as
// ferramentas prontas (o twoslash, o `typescript-docs-verifier`) não rodam com o TypeScript 7, que não traz API.
//
// O trecho de exemplo é JSX SOLTO — `<Accordion items={items} />` —, e não um arquivo. Para virar um arquivo que compila,
// cada trecho ganha, nesta ordem:
//   1. os imports que ele mesmo escreve ficam; as peças da Aurea que ele usa e não importa entram sozinhas, do pacote ou
//      da porta (`@aurea-uds/react/chart`) que as exporta; os ganchos do React (`useState`…) e as peças do motor de
//      gráfico (`AreaChart`…) também;
//   2. o JSX do fim vira o corpo de um componente (`<>…</>`); o que vem antes dele (constantes, funções) fica em cima;
//   3. as variáveis soltas em MINÚSCULA (`items`, `data`, `onSave`) viram `declare const x: any` — o exemplo as usa
//      como "o seu dado", e o tipo delas não é o que a trava confere. Peça em MAIÚSCULA que ninguém exporta NÃO é
//      declarada: é o defeito que a trava existe para pegar.
// Fica fora: o que não é TypeScript (html, css, bash) e as notas de versão (registro, não manual).
//
// Uso: node scripts/exemplos-compilam.mjs [--listar]   (depois do `pnpm build`: lê `dist/` e `apps/catalog/.nativo/ssr.mjs`)
import {readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync} from "node:fs";
import {join, dirname} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";
import {execFileSync} from "node:child_process";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = join(raiz, "apps/catalog/content");
// Onde os arquivos nascem. O do nativo mora DENTRO do pacote nativo: é de lá que o `react-native` resolve pelo mapa
// `exports` dele (o 0.87 anuncia os tipos só ali, `types_generated/index.d.ts`). Um atalho `paths` para a pasta do
// `react-native` não lê o mapa e deixa o tipo `any` — medido: `<Button tamanho="lg">` passava no nativo.
const SAIDA = {web: join(raiz, "node_modules/.cache/exemplos-compilam/web"),
  nativo: join(raiz, "packages/native/node_modules/.cache/exemplos-compilam/nativo")};
const imp = async (f) => (await import(pathToFileURL(f).href)).default;

// ── 1. os trechos ────────────────────────────────────────────────────────────────────────────────────────────────────
export async function trechos() {
  const web = [], nativo = [];
  const soma = (lista, onde, codigo) => { if (typeof codigo === "string" && codigo.trim()) lista.push({onde, codigo}); };
  const dos = (lista, arquivo, itens) => (itens || []).forEach((e, i) => soma(lista, `${arquivo} · ${e.title || e.titulo || `#${i + 1}`}`, e.code));
  for (const f of readdirSync(C).filter((f) => f.endsWith(".mjs") && !f.startsWith("_"))) dos(web, `content/${f}`, (await imp(join(C, f)))?.examples);
  for (const s of ["_starters.mjs", "_starters-motores.mjs"]) {
    for (const [nome, v] of Object.entries(await imp(join(C, s)))) {
      soma(web, `content/${s} · ${nome}`, v.code);
      dos(web, `content/${s} · ${nome}`, v.examples);
    }
  }
  // A página de gancho guarda o exemplo em `example` (a `signature` é o resumo da API, não código para copiar).
  if (existsSync(join(C, "_hooks.mjs"))) for (const g of await imp(join(C, "_hooks.mjs"))) { soma(web, `content/_hooks.mjs · ${g.name}`, g.code ?? g.example); dos(web, `content/_hooks.mjs · ${g.name}`, g.examples); }
  for (const d of ["patterns", "blocks"]) {
    if (!existsSync(join(C, d))) continue;
    for (const f of readdirSync(join(C, d)).filter((f) => f.endsWith(".mjs"))) {
      const v = await imp(join(C, d, f));
      dos(web, `content/${d}/${f}`, Array.isArray(v) ? v : (v?.examples || [v]));
    }
  }
  const blocos = (lista, arquivo) => {
    const texto = readFileSync(join(raiz, arquivo), "utf8");
    for (const m of texto.matchAll(/^```(tsx|ts)\n([\s\S]*?)^```/gm)) {
      const linha = texto.slice(0, m.index).split("\n").length;
      soma(/@aurea-uds\/native|from "react-native"/.test(m[2]) ? nativo : lista, `${arquivo}:${linha}`, m[2]);
    }
  };
  for (const f of readdirSync(join(C, "docs"))) blocos(web, `apps/catalog/content/docs/${f}`);
  blocos(web, "README.md");
  blocos(web, "skills/aurea-uds/SKILL.md");
  const ssr = join(raiz, "apps/catalog/.nativo/ssr.mjs");
  if (!existsSync(ssr)) throw new Error("falta apps/catalog/.nativo/ssr.mjs — rode o `pnpm build` (o build:catalog monta o nativo)");
  const {conteudo} = await import(pathToFileURL(ssr).href);
  for (const [nome, v] of Object.entries(conteudo)) dos(nativo, `content/native · ${nome}`, v?.examples);
  return {web, nativo};
}

// ── 2. os nomes que cada porta exporta ───────────────────────────────────────────────────────────────────────────────
// Os nomes de um `.d.ts`, valores e tipos, pelos três jeitos de exportar: `export interface X`, `export {X, type Y}` e
// `export * from "./z.js"` (seguido até o fim).
export function nomesDoDts(dts, vistos = new Set()) {
  if (vistos.has(dts) || !existsSync(dts)) return [];
  vistos.add(dts);
  const t = readFileSync(dts, "utf8"), out = [];
  // Só o `export` no começo da linha: o de dentro de um `namespace` (`Grid.Item`, `Sidebar.Brand`) é parte da peça.
  for (const m of t.matchAll(/^export (?:declare )?(?:const|function|class|type|interface|enum) (\w+)/gm)) out.push(m[1]);
  for (const m of t.matchAll(/^export (?:type )?\{([^}]*)\}/gm)) for (const p of m[1].split(",")) {
    const n = p.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim();
    if (/^[A-Za-z_]\w*$/.test(n)) out.push(n);
  }
  for (const m of t.matchAll(/^export \* from ["'](\.[^"']+)["']/gm)) out.push(...nomesDoDts(join(dirname(dts), m[1].replace(/\.js$/, ".d.ts")), vistos));
  return out;
}
async function portas(pacote, mapa) {
  const pj = JSON.parse(readFileSync(join(raiz, "packages", pacote, "package.json"), "utf8"));
  const out = new Map();
  for (const [sub, alvo] of Object.entries(pj.exports)) {
    const js = typeof alvo === "string" ? alvo : alvo.import;
    if (!js?.endsWith(".js") || sub.includes("*") || /worker/.test(sub)) continue;
    const espec = pj.name + sub.slice(1);
    let nomes = [];
    try { nomes = Object.keys(await import(pathToFileURL(join(raiz, "packages", pacote, js)).href)); }
    catch { nomes = [...readFileSync(join(raiz, "packages", pacote, js.replace(/\.js$/, ".d.ts")), "utf8").matchAll(/export (?:declare )?(?:const|function|class) (\w+)/g)].map((m) => m[1]); }
    for (const n of nomes) if (!out.has(n) || sub === ".") out.set(n, espec);
    // E os TIPOS que a porta publica (`SidebarItem`, `ComboboxOption`): o exemplo tipado os usa como um app usaria.
    for (const n of nomesDoDts(join(raiz, "packages", pacote, js.replace(/\.js$/, ".d.ts")))) if (!out.has(n)) out.set(n, espec);
  }
  for (const [n, e] of Object.entries(mapa || {})) if (!out.has(n)) out.set(n, e);
  return out;
}

// ── 3. o trecho vira arquivo ─────────────────────────────────────────────────────────────────────────────────────────
const GANCHOS_DO_REACT = ["useState", "useEffect", "useRef", "useMemo", "useCallback", "useId", "useReducer", "useTransition", "useDeferredValue", "useContext", "useLayoutEffect"];
const TIPOS_DO_REACT = ["CSSProperties", "ReactNode", "ReactElement"];
const DECLARACAO = /^(?:async\s+)?(?:function|const|let|var|type|interface|class|enum|declare)\b/;
// Globais do navegador que um exemplo usa como VARIÁVEL dele (`open={open}`, `items={history}`): sem a declaração o nome
// existe (é o `window.open`), e o tipo do navegador vira erro falso. Usado e não declarado no trecho, vira `any`.
const GLOBAIS_DO_NAVEGADOR = ["open", "close", "name", "status", "history", "location", "event", "origin", "length", "parent",
  "top", "self", "print", "focus", "blur", "find", "stop", "scroll", "screen", "closed", "frames", "content"];
// As peças DO APP que um exemplo usa de propósito (o seu formulário, a sua tela, o seu roteador) — viram
// `(props: any) => any`. Peça em maiúscula FORA desta lista que nenhum pacote exporta é DEFEITO: o nome errado de uma
// peça da Aurea. Nome que nenhum trecho usa mais reprova (a lista não envelhece calada).
export const PECAS_DO_APP = {
  App: "o app de quem usa", Home: "uma tela do app", Tela: "uma tela do app (README em português)",
  Screen: "uma tela do app, no Quick Start (o navegador tem um `Screen` global: sem a declaração, ele não falta)",
  Reports: "uma tela do app", Space: "o conteúdo do app", Balance: "um pedaço do app que pode quebrar",
  Profile: "o conteúdo de uma aba", Notifications: "o conteúdo de uma aba", Billing: "o conteúdo de uma aba",
  Summary: "o conteúdo de uma aba", Runs: "o conteúdo de uma aba", AuditLog: "o conteúdo de uma aba", Preview: "o conteúdo de uma aba",
  RetryForm: "o formulário do app, dentro do acordeão", NetworkForm: "o formulário do app, dentro do acordeão",
  InvoiceSkeleton: "o esqueleto que o app desenha", InvoiceTable: "a tabela que o app desenha",
  RouterLink: "o link do roteador do app",
  Controls: "a peça que o exemplo de cima da página define (AureaProvider do nativo)",
};
// Módulos DE FORA que um exemplo importa de propósito: viram `declare module`. Linha que nenhum trecho usa reprova.
export const MODULOS_DE_FORA = {
  "next-themes": "a biblioteca de tema do Next.js, na página Dark Mode",
  "expo-font": "o carregador de fontes do Expo, no Quick Start do nativo",
  "./router": "o roteador do app, na página Composition",
  "@codemirror/lang-javascript": "a língua do editor, que o app instala",
};
const usadosDoApp = new Set(), usadosDeFora = new Set();
// Uma linha na coluna 0 abre um pedaço: DECLARAÇÃO (`const`, `function`…), JSX (começa com `<`, ou é texto com uma tag
// dentro: "Press <Kbd>K</Kbd>") ou COMANDO (`toast.add(…)`, `if (…) return`). Linha recuada ou em branco continua o pedaço.
// Comentário na coluna 0 vai com o pedaço que vem depois dele.
function pedacos(texto) {
  const out = [];
  let atual = null, comentarios = [], crases = 0;
  for (const l of texto.split("\n")) {
    // Dentro de um texto entre crases que atravessa linhas (`select…\nfrom runs`), a linha continua o pedaço.
    const dentroDeCrase = crases % 2 === 1;
    crases += (l.match(/(?<!\\)`/g) || []).length;
    if (dentroDeCrase && atual) { atual.linhas.push(l); continue; }
    if (/^\S/.test(l) && !/^(?:[)\]}>]|\/>|<\/)/.test(l)) {
      if (/^\/\//.test(l)) { comentarios.push(l); continue; }
      const tipo = DECLARACAO.test(l) ? "declaracao" : (/^</.test(l) || (/<[A-Za-z]/.test(l) && !/^[\w$.]+\s*[(.=]/.test(l))) ? "jsx" : "comando";
      if (!atual || atual.tipo !== tipo || tipo !== "jsx") { atual = {tipo, linhas: []}; out.push(atual); }
      atual.linhas.push(...comentarios, l);
      comentarios = [];
    } else if (atual) atual.linhas.push(...comentarios, l), comentarios = [];
    else if (l.trim()) { atual = {tipo: "comando", linhas: [...comentarios, l]}; comentarios = []; out.push(atual); }
  }
  if (comentarios.length) out.push({tipo: "comando", linhas: comentarios});
  return out;
}
export function arquivo(codigo, exportados, declarados = []) {
  const linhas = codigo.replace(/\r\n/g, "\n").split("\n");
  const imports = [], corpo = [];
  for (let i = 0; i < linhas.length; i++) {
    if (/^import\s/.test(linhas[i])) {
      let l = linhas[i];
      // O import termina na linha com o `from "…"` (ou no `import "…"` só por efeito); o comentário do fim da linha não conta.
      const acabou = (x) => /from\s+["'][^"']+["'];?\s*$|^import\s+["'][^"']+["'];?\s*$/.test(x.replace(/\s*\/\/.*$/, ""));
      while (!acabou(l) && i + 1 < linhas.length) l += "\n" + linhas[++i];
      imports.push(l);
    } else corpo.push(linhas[i]);
  }
  const ja = new Set(imports.flatMap((l) => [...l.matchAll(/\b([A-Za-z_]\w*)\b(?=\s*[,}]|\s+from)/g)].map((m) => m[1])));
  for (const l of imports) for (const m of l.matchAll(/import\s+(\w+)/g)) ja.add(m[1]);
  const texto = corpo.join("\n");
  // O nome depois de um ponto (`Sidebar.User`, `toast.add`) é parte de outra coisa, não um nome solto a importar.
  const usados = new Set([...texto.matchAll(/(?<![.\w$])([A-Za-z_]\w*)\b/g)].map((m) => m[1]));
  const porModulo = new Map();
  const pedir = (n, mod) => { if (!ja.has(n)) { ja.add(n); (porModulo.get(mod) || porModulo.set(mod, []).get(mod)).push(n); } };
  const declaradoNoTrecho = (n) => ja.has(n) || new RegExp(`(?:const|let|var|function|class)\\s+(?:${n}\\b|\\[[^\\]]*\\b${n}\\b|\\{[^}]*\\b${n}\\b)|\\(\\s*${n}\\b|\\b${n}\\s*=>|,\\s*${n}\\s*[,)]`).test(texto);
  const doApp = [], globais = [];
  for (const n of usados) {
    if (GANCHOS_DO_REACT.includes(n) || TIPOS_DO_REACT.includes(n)) pedir(n, "react");
    else if (exportados.has(n) && !new RegExp(`(?:const|let|function|class)\\s+${n}\\b`).test(texto)) pedir(n, exportados.get(n));
    else if (n in PECAS_DO_APP && !declaradoNoTrecho(n)) { doApp.push(n); usadosDoApp.add(n); }
    else if (GLOBAIS_DO_NAVEGADOR.includes(n) && !declaradoNoTrecho(n)) globais.push(n);
  }
  for (const l of imports) { const m = /from\s+["']([^"']+)["']/.exec(l); if (m && m[1] in MODULOS_DE_FORA) usadosDeFora.add(m[1]); }
  const cabeca = [...imports, ...[...porModulo].map(([m, ns]) => `import {${ns.sort().join(", ")}} from "${m}";`),
    ...doApp.map((d) => `declare const ${d}: (props: any) => any;`),
    ...[...new Set([...declarados, ...globais])].map((d) => `declare const ${d}: any;`)];
  // Um trecho com `export` na coluna 0 já é um módulo: fica como está.
  if (/^export\s/m.test(texto)) return [...cabeca, texto, "export {};"].join("\n");
  // Os outros viram um componente: as declarações e os comandos no corpo, o JSX no `return`, num fragmento.
  const ps = pedacos(texto);
  const jsx = ps.filter((p) => p.tipo === "jsx").map((p) => p.linhas.map((l) => l.replace(/^\/\/\s?(.*)$/, "{/* $1 */}")).join("\n"));
  // `declare module` (a ampliação de um tipo da Aurea) só vale no topo do arquivo.
  const doTopo = ps.filter((p) => p.tipo === "declaracao" && /^declare\b/.test(p.linhas.find((l) => !/^\/\//.test(l)) || ""));
  const resto = ps.filter((p) => p.tipo !== "jsx" && !doTopo.includes(p)).map((p) => p.linhas.join("\n"));
  return [...cabeca, ...doTopo.map((p) => p.linhas.join("\n")), "export function __Exemplo() {", ...resto,
    jsx.length ? `return (\n<>\n${jsx.join("\n")}\n</>\n);` : "return null;", "}"].join("\n");
}

// ── 4. compilar, declarar as soltas em minúscula, compilar de novo ───────────────────────────────────────────────────
function tsc(dir, config) {
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify(config, null, 2));
  try { execFileSync(process.execPath, [join(raiz, "node_modules/typescript/bin/tsc"), "-p", join(dir, "tsconfig.json"), "--pretty", "false"], {encoding: "utf8", stdio: "pipe"}); return ""; }
  catch (e) { return (e.stdout || "") + (e.stderr || ""); }
}
const erros = (saida) => [...saida.matchAll(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/gm)].map((m) => ({arq: m[1].replace(/\\/g, "/").split("/").pop(), linha: +m[2], cod: m[4], msg: m[5]}));

// O `tsc` que acha erro de ESCRITA (os TS1xxx e TS17xxx) num arquivo qualquer mostra só esses e não confere TIPO em
// nenhum — medido: com 78 erros de escrita, os trechos plantados com prop errada passavam. Por isso são duas etapas: a
// escrita de todos; os que erram saem (e ficam na lista); os tipos, nos que sobraram.
const ESCRITA = (cod) => /^TS1\d{3}$|^TS17\d{3}$/.test(cod);
async function rodada(nome, lista, exportados, config) {
  const dir = SAIDA[nome];
  rmSync(dir, {recursive: true, force: true});
  mkdirSync(dir, {recursive: true});
  const decl = lista.map(() => []);
  const arq = (i) => `t${String(i).padStart(4, "0")}.tsx`;
  const escrever = () => lista.forEach((t, i) => writeFileSync(join(dir, arq(i)), `// ${t.onde}\n` + arquivo(t.codigo, exportados, decl[i])));
  // O módulo de fora com nome vira `declare module`; o do app, com caminho relativo (`./router`), vira um arquivo ao lado
  // — o TypeScript não aceita `declare module` de caminho relativo.
  writeFileSync(join(dir, "de-fora.d.ts"), Object.keys(MODULOS_DE_FORA).filter((m) => !m.startsWith(".")).map((m) => `declare module "${m}";`).join("\n") + "\n");
  for (const m of Object.keys(MODULOS_DE_FORA).filter((m) => m.startsWith("./"))) {
    const nomes = new Set(lista.flatMap((t) => [...t.codigo.matchAll(new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*["']${m.replace(".", "\\.")}["']`, "g"))]
      .flatMap((x) => x[1].split(",").map((s) => s.trim().split(" as ")[0].trim()).filter(Boolean))));
    writeFileSync(join(dir, `${m.slice(2)}.d.ts`), [...nomes].map((n) => `export declare const ${n}: any;`).join("\n") + "\nexport {};\n");
  }
  const compilar = (idx) => erros(tsc(dir, {...config, files: ["de-fora.d.ts", ...idx.map(arq)]}));
  escrever();
  const todos = lista.map((_, i) => i);
  const daEscrita = compilar(todos).filter((e) => ESCRITA(e.cod));
  const comEscritaErrada = new Set(daEscrita.map((e) => +e.arq.slice(1, 5)));
  const sobram = todos.filter((i) => !comEscritaErrada.has(i));
  let es = compilar(sobram);
  // As soltas: "Cannot find name 'x'" (2304), o "Did you mean" (2552) e o atalho `{currency}` (18004) de um nome em
  // minúscula ou de uma constante do app, toda em maiúscula (`FONT_FAMILIES`). Peça em maiúscula NÃO entra aqui.
  let mudou = false;
  for (const e of es) {
    const m = /^(?:Cannot find name|No value exists in scope for the shorthand property) '([a-z_]\w*|[A-Z][A-Z0-9_]+)'/.exec(e.msg);
    if ((e.cod === "TS2304" || e.cod === "TS2552" || e.cod === "TS18004") && m) {
      const i = +e.arq.slice(1, 5);
      if (!decl[i].includes(m[1])) { decl[i].push(m[1]); mudou = true; }
    }
  }
  if (mudou) { escrever(); es = compilar(sobram); }
  return [...daEscrita, ...es].map((e) => ({...e, onde: lista[+e.arq.slice(1, 5)].onde}));
}

// TRAVA CONTRA A CEGUEIRA: a cada execução entram trechos PLANTADOS — os errados têm de reprovar, os certos de passar.
// Uma configuração que deixa tudo virar `any` (um caminho de pacote que não resolve, uma porta que some) não fica verde
// em silêncio: a trava reprova a si mesma.
export const PLANTADOS = {
  web: [
    {onde: "PLANTADO · prop que não existe", codigo: `<Button tamanho="lg">Save</Button>`, erra: true},
    {onde: "PLANTADO · valor fora da união", codigo: `<Button variant="nao-existe">Save</Button>`, erra: true},
    {onde: "PLANTADO · ícone com o nome do Carbon", codigo: `<Icon name="chevron--down" />`, erra: true},
    {onde: "PLANTADO · peça que ninguém exporta", codigo: `<PecaQueNaoExiste />`, erra: true},
    {onde: "PLANTADO · porta que exporta", codigo: `<Chart label="Runs"><AreaChart data={data}><Area dataKey="runs" /></AreaChart></Chart>`, erra: false},
    {onde: "PLANTADO · certo", codigo: `const [n, setN] = useState(0);
<Button variant="primary" onClick={() => setN(n + 1)}>Save {n}</Button>`, erra: false},
  ],
  nativo: [
    {onde: "PLANTADO · prop que não existe (nativo)", codigo: `<Button tamanho="lg">Save</Button>`, erra: true},
    {onde: "PLANTADO · valor fora da união (nativo)", codigo: `<Button appearance="nao-existe">Save</Button>`, erra: true},
    {onde: "PLANTADO · o react-native resolve (nativo)", codigo: `import {View} from "react-native";\n<View naoExiste={1} />`, erra: true},
    {onde: "PLANTADO · certo (nativo)", codigo: `<Button appearance="outline" onPress={() => {}}>Save</Button>`, erra: false},
  ],
};
export async function medir() {
  const lidos = await trechos();
  const web = [...lidos.web, ...PLANTADOS.web], nativo = [...lidos.nativo, ...PLANTADOS.nativo];
  const pacoteDe = (p) => join(raiz, "packages", p, "dist");
  const base = {strict: true, jsx: "react-jsx", module: "esnext", moduleResolution: "bundler", target: "es2022", noEmit: true,
    skipLibCheck: true, allowJs: false, esModuleInterop: true, noImplicitAny: false, noUncheckedSideEffectImports: false, lib: ["es2023", "dom", "dom.iterable"]};
  // Todo pacote da Aurea, por porta, pelo `exports` dele: o exemplo importa `@aurea-uds/fonts/native` como um app.
  const caminhos = {};
  for (const pj of readdirSync(join(raiz, "packages")).map((d) => join(raiz, "packages", d, "package.json")).filter(existsSync)) {
    const p = JSON.parse(readFileSync(pj, "utf8"));
    for (const [sub, alvo] of Object.entries(p.exports || {})) {
      const tipos = typeof alvo === "object" && alvo ? alvo.types : null;
      if (tipos) caminhos[p.name + sub.slice(1)] = [join(dirname(pj), tipos)];
    }
  }
  const exWeb = await portas("react", {});
  const recharts = Object.keys(await import("recharts")).filter((n) => /^[A-Z]/.test(n));
  for (const n of recharts) if (!exWeb.has(n)) exWeb.set(n, "recharts");
  const errosWeb = await rodada("web", web, exWeb, {compilerOptions: {...base, paths: caminhos}});
  const exNat = new Map();
  for (const [porta, dts] of [["@aurea-uds/native", "index.d.ts"], ["@aurea-uds/native/system", "sistema.d.ts"], ["@aurea-uds/native/system/file", "arquivo.d.ts"]]) {
    for (const n of nomesDoDts(join(pacoteDe("native"), dts))) if (!exNat.has(n)) exNat.set(n, porta);
  }
  // As peças do React Native que o exemplo do nativo usa sem importar (`View`, `ScrollView`): do `react-native` e da
  // área segura. A peça da Aurea com o mesmo nome (`Text`) ganha.
  for (const n of ["View", "ScrollView", "FlatList", "SectionList", "Pressable", "TextInput", "StyleSheet", "Platform", "Dimensions", "KeyboardAvoidingView"]) if (!exNat.has(n)) exNat.set(n, "react-native");
  for (const n of ["SafeAreaProvider", "SafeAreaView", "useSafeAreaInsets"]) if (!exNat.has(n)) exNat.set(n, "react-native-safe-area-context");
  const errosNat = await rodada("nativo", nativo, exNat, {compilerOptions: {...base, lib: ["es2023"], types: [],
    paths: {...caminhos, "react": [join(raiz, "node_modules/@types/react")]}}});
  const todos = [...errosWeb, ...errosNat];
  const sobraDoApp = Object.keys(PECAS_DO_APP).filter((n) => !usadosDoApp.has(n));
  const sobraDeFora = Object.keys(MODULOS_DE_FORA).filter((n) => !usadosDeFora.has(n));
  if (sobraDoApp.length) todos.push({onde: "PECAS_DO_APP", cod: "SOBRA", msg: `nenhum trecho usa mais: ${sobraDoApp.join(", ")} — tire da lista`});
  if (sobraDeFora.length) todos.push({onde: "MODULOS_DE_FORA", cod: "SOBRA", msg: `nenhum trecho importa mais: ${sobraDeFora.join(", ")} — tire da lista`});
  const cegueira = [...PLANTADOS.web, ...PLANTADOS.nativo].filter((p) => todos.some((e) => e.onde === p.onde) !== p.erra)
    .map((p) => p.erra ? `o trecho plantado "${p.onde}" devia reprovar e passou` : `o trecho plantado "${p.onde}" devia passar e reprovou`);
  return {web: lidos.web.length, nativo: lidos.nativo.length, cegueira, erros: todos.filter((e) => !e.onde.startsWith("PLANTADO"))};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const r = await medir();
  console.log(`exemplos-compilam: ${r.web} trechos da web e ${r.nativo} do nativo; ${r.erros.length} erro(s)`);
  for (const c of r.cegueira) console.log(`  A TRAVA ESTÁ CEGA: ${c}`);
  for (const e of r.erros) console.log(`  ${e.onde}  [${e.cod}] ${e.msg}`);
  process.exitCode = r.erros.length || r.cegueira.length ? 1 : 0;
}
