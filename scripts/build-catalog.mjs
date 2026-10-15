// Aurea — catálogo DOGFOODED (Fase 3). Uma PÁGINA POR COMPONENTE (modelo da referência), gerada
// do registry + arquivos de conteúdo, renderizada com os próprios componentes Aurea.
//
// Organização = a da referência (página por item, sidebar hierárquica, Preview/Code, Installation,
// Features, Examples, prev/next). Aparência = Aurea (decisão do Victor, 24/07/2026).
// Dados curtos vêm do registry; conteúdo rico vem de apps/catalog/content/<Name>.mjs (opcional
// — sem ele a página usa o registry mais o starter de content/_starters.mjs). O modelo de
// página é dado, e mora em scripts/page-model.mjs (ADR-0001).
//
// Assets compartilhados (assets/catalog.css|js) via <link>/<script> relativos: standalone
// não pode inlinar as fontes (300KB) em 63 páginas = 19MB. O sprite fica inline (external
// <use> via file:// esbarra em CORS). Tudo abre via file:// com duplo-clique.
import React, {createElement as h, Fragment} from "react";
import {renderToStaticMarkup, renderToString} from "react-dom/server";
import {readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, unlinkSync} from "node:fs";
import {fileURLToPath, pathToFileURL} from "node:url";
import {dirname, join} from "node:path";
import * as A from "../packages/react/dist/index.js";
import {MARKER, required, pageType} from "./page-model.mjs";
import {serialize} from "./token-value.mjs";
import {linearSrgbParaHex, oklchParaLinearSrgb} from "./cor-oklch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// write() em vez de writeFileSync direto: no Windows o antivírus/indexador ainda segura o
// arquivo que o build anterior acabou de escrever, e a próxima geração morre com
// UNKNOWN/errno -4094 (auditoria 26/07/2026, A7 — reproduzido aqui em build consecutivo).
// Cinco tentativas com espera curta cobrem a janela do scanner; se persistir, é erro real e
// sobe. Nada disso é necessário no Linux do CI, e também não custa nada lá.
// Slug é URL e URL é contrato: duas páginas com o mesmo nome de arquivo fariam a segunda calar
// a primeira EM SILÊNCIO — e a contagem de páginas do STATE.md seguiria dizendo que as duas
// existem. Este é o gate de unicidade que o achado M11 pede, e ele mora aqui porque só o
// gerador conhece o conjunto inteiro (componente, pattern, block, recipe e índice de área
// dividem um diretório só).
const escritos = new Set();

function write(file, data) {
  if (escritos.has(file)) throw new Error(`slug repetido: ${file} seria escrito duas vezes nesta geração`);
  escritos.add(file);
  for (let tentativa = 1; ; tentativa++) {
    try { return writeFileSync(file, data); }
    catch (e) {
      const travado = ["UNKNOWN", "EBUSY", "EPERM", "EACCES"].includes(e.code);
      if (!travado || tentativa === 5) throw e;
      const ate = Date.now() + 120 * tentativa;
      while (Date.now() < ate) { /* espera bloqueante: o gerador é síncrono de ponta a ponta */ }
    }
  }
}

const outDir = join(root, "apps/catalog");
// O sprite é medido depois de todas as páginas existirem, então cada página sai com um lugar
// reservado para ele e o texto entra no fim.
const SPRITE_SLOT = "<!--aurea-sprite-->";
const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};
const muted = {margin: "var(--space-1) 0 0", color: "var(--muted-foreground)", fontSize: "var(--text-sm)"};
// Nome de componente é alfanumérico, mas categoria ("Data Display") e título de exemplo
// ("Without Tag") viram id/âncora — sem isto sairia id com espaço, que é HTML inválido.
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const INSTALL_CMD = "pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts";
// A ordem importa: as fontes ANTES do core (o core não embute fonte nenhuma).
const IMPORT_CSS = 'import "@aurea-uds/fonts/css";\nimport "@aurea-uds/core/css";';

// ── registry + conteúdo ───────────────────────────────────────────────────────
const regDir = join(root, "packages/contracts/registry");
const fichas = readdirSync(regDir).filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(readFileSync(join(regDir, f), "utf8")))
  .sort((a, b) => a.name.localeCompare(b.name));

// A ORDEM DOS GRUPOS (ADR-0070, 14/10/2026): os 15 da referência, em ordem alfabética, como na página "All
// Components" dela; depois os 3 da Aurea que ela não tem. Dentro do grupo, a ordem alfabética das fichas.
const CAT_ORDER = ["Buttons", "Collections", "Colors", "Controls", "Data Display", "Date and Time", "Feedback", "Forms", "Layout", "Media", "Navigation", "Overlays", "Pickers", "Typography", "Utilities", "AI & Agents", "Code", "Communication"];
const byCat = {};
for (const f of fichas) (byCat[f.category] ??= []).push(f);
// Esta lista era a ÚNICA fonte das páginas de componente, e uma categoria que não estivesse
// nela sumia em silêncio: nem página, nem navegação, nem contagem. Foi o que aconteceu com
// "AI & Agents" — a ADR-0017 acrescentou a categoria à taxonomia do `validate.py` em
// 09/08/2026 e não aqui, e os 10 componentes da Parte H entregues naquele dia ficaram sem
// página. O `build-catalog` seguiu imprimindo "76 components" com 86 fichas no repositório,
// e nenhum gate viu: o check 17 cobra item de catálogo sem preview, e item que não existe
// não é item. Agora a lista ainda decide a ORDEM, mas não decide mais quem entra.
const foraDaOrdem = Object.keys(byCat).filter(c => !CAT_ORDER.includes(c));
if (foraDaOrdem.length) {
  throw new Error(`build-catalog: categoria sem lugar em CAT_ORDER — ${foraDaOrdem.join(", ")}. `
    + "As fichas dela não teriam página nem entrada na navegação, e a contagem sairia menor "
    + "sem ninguém reclamar. Acrescente a categoria à CAT_ORDER, na posição da taxonomia.");
}
const cats = CAT_ORDER.filter(c => byCat[c]);
// ordem linear (prev/next) = categoria na ordem da taxonomia, alfabético dentro
const ordered = cats.flatMap(c => byCat[c]);

const MAT = {Stable: "success", Universal: "primary", Ready: "info", Draft: "warning", Deprecated: "danger"};

// ── O SITE NO MOLDE DA DOCUMENTAÇÃO DA REFERÊNCIA (ADR-0067, 13/10/2026) ──────────
// A versão no topo, o endereço do código-fonte nas pílulas, e os selos do menu — tudo dos DADOS.
const VERSAO = JSON.parse(readFileSync(join(root, "packages/react/package.json"), "utf8")).version;
const REPO = "https://github.com/victor1mor/aurea-uds";
// O LOGO DO GITHUB (o Victor, 15/10/2026: "A, pode baixar o oficial do GitHub") — só no SITE, nunca na biblioteca
// (CLAUDE.md §5). Os arquivos são os oficiais, sem alteração (`apps/catalog/marcas/github/`, do brand.github.com). A
// regra do GitHub, lida em 15/10/2026: o logo pode ser o botão que leva ao projeto; não se modifica, e só sai em preto
// ou branco. O desenho é lido do arquivo; a cor é o preto ou o branco oficial, conforme o tema (`.site-github-ink`).
const DESENHO_GITHUB = readFileSync(join(root, "apps/catalog/marcas/github/GitHub_Invertocat_Black.svg"), "utf8").match(/ d="([^"]+)"/)[1];
const GitHub = props => h("svg", {...props, viewBox: "0 0 98 96", fill: "none"}, h("path", {d: DESENHO_GITHUB, className: "site-github-ink"}));
// "New": o componente que não está na superfície PUBLICADA (o marco da última versão no npm).
const publicados = new Set(JSON.parse(readFileSync(join(root, "scripts/released-surface.json"), "utf8")).components);
// "Updated": o que a seção da versão EM CONSTRUÇÃO do CHANGELOG cita, entre crases, como mudado — a
// nota já é cobrada pelo check 31, então o selo não se escreve à mão e não envelhece sozinho.
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
const secaoAtual = (() => {
  const ini = changelog.search(/^## \[\d+\.\d+\.\d+\] — em construção/m);
  if (ini < 0) return "";
  const fim = changelog.slice(ini + 1).search(/^## \[/m);
  return fim < 0 ? changelog.slice(ini) : changelog.slice(ini, ini + 1 + fim);
})();
const citados = new Set([...secaoAtual.matchAll(/`([A-Z][A-Za-z]+)[` .]/g)].map(m => m[1]));
const seloDe = nome => !publicados.has(nome) ? "New" : citados.has(nome) ? "Updated" : null;

// conteúdo rico: apps/catalog/content/<Name>.mjs (default export).
// `_` no começo = arquivo de conteúdo que NÃO é de um componente (_starters, _recipes).
const contentDir = join(outDir, "content");
const content = {};
for (const file of existsSync(contentDir) ? readdirSync(contentDir).filter(f => f.endsWith(".mjs") && !f.startsWith("_")) : []) {
  const mod = await import(pathToFileURL(join(contentDir, file)).href);
  content[file.replace(".mjs", "")] = mod.default;
}

// STARTERS: o par preview+código mínimo de quem ainda não tem arquivo próprio (ADR-0001 —
// preview e código são núcleo, não luxo). Morava aqui dentro como o objeto `fallback`, sem
// código nenhum e com 9 entradas mortas; virou conteúdo, que é o que é.
const {default: starters} = await import(pathToFileURL(join(contentDir, "_starters.mjs")).href);
const {default: recipeContent} = await import(pathToFileURL(join(contentDir, "_recipes.mjs")).href);
// HOOKS (16/08/2026): a metade da API pública que não tem ficha — ficha é de componente. Sem esta
// página eles não existem em lugar nenhum que se leia, e foi assim que EU mesmo concluí que a
// Aurea não tinha toast. Mesma trava do starter, e pela mesma razão: chave que o gerador não lê é
// documentação que não sai, e ninguém percebe.
const {default: hooks} = await import(pathToFileURL(join(contentDir, "_hooks.mjs")).href);
const CHAVES_HOOK = new Set(["name", "source", "lede", "signature", "example", "notes"]);
for (const g of hooks) {
  const desconhecidas = Object.keys(g).filter(k => !CHAVES_HOOK.has(k));
  if (desconhecidas.length) {
    throw new Error(`_hooks.mjs: "${g.name}" declara chave que este gerador não lê — `
      + `${desconhecidas.join(", ")}. Ou o gerador passa a ler, ou a chave sai.`);
  }
  for (const k of CHAVES_HOOK) if (!g[k]) throw new Error(`_hooks.mjs: "${g.name}" sem ${k}`);
  if (!existsSync(join(root, g.source))) throw new Error(`_hooks.mjs: "${g.name}" aponta para ${g.source}, que não existe`);
  if (!readFileSync(join(root, g.source), "utf8").includes(`export function ${g.name}`)
      && !readFileSync(join(root, g.source), "utf8").includes(`export const ${g.name}`)) {
    throw new Error(`_hooks.mjs: ${g.source} não declara "${g.name}" — é o check 28 na mão, `
      + `porque hook não tem ficha onde o source viva`);
  }
}
// Um componente tem UMA fonte de conteúdo. Ter as duas foi como as 9 entradas mortas
// sobreviveram: ninguém as exercitava, ninguém as via.
// O vocabulário de uma entrada de starter. Chave fora daqui não é enfeite inofensivo: ela é
// LIDA POR NINGUÉM, e o starter passa a existir sem produzir nada. Foi exatamente o que
// aconteceu com os 13 componentes de "AI & Agents" (grupos H.a a H.e, 09/08/2026): as entradas
// declaravam `preview:` — chave que este gerador nunca leu, porque quem desenha é `render` —, e
// as treze páginas saíram com "Interactive — see the code." no lugar do componente. O check 17
// não viu porque ele cobra que a ENTRADA exista, não que ela desenhe: é o mesmo "gate de nome
// não é gate de efeito" que o Lote 3 já tinha encontrado no preview vazio do Chart.
const CHAVES_STARTER = new Set(["install", "code", "render", "note", "embed", "prerender", "description",
  // "layoutProprio"/"tituloProprio": o conteúdo declara que monta os PRÓPRIOS landmarks e o
  // próprio h1. Sem elas o gerador acrescenta `<main>` e `<h1>` na moldura — e o AppShell, que
  // já tem os dois, saía com "2 h1 na página" na varredura (18/08/2026).
  "layoutProprio", "tituloProprio"]);
for (const name of Object.keys(starters)) {
  if (content[name]) throw new Error(`${name}: tem arquivo de conteúdo próprio E entrada em _starters.mjs — remova o starter`);
  if (!fichas.some(f => f.name === name)) throw new Error(`_starters.mjs: "${name}" não é o name de nenhuma ficha`);
  const desconhecidas = Object.keys(starters[name]).filter(k => !CHAVES_STARTER.has(k));
  if (desconhecidas.length) {
    throw new Error(`_starters.mjs: "${name}" declara chave que este gerador não lê — `
      + `${desconhecidas.join(", ")}. Vocabulário: ${[...CHAVES_STARTER].join(", ")}. `
      + "Quem desenha o preview é `render`, uma FUNÇÃO. Chave desconhecida não desenha nada e "
      + "a página sai com o texto de fallback, sem ninguém reclamar.");
  }
}
const semPreview = fichas.filter(f => !content[f.name] && !starters[f.name]).map(f => f.name);
if (semPreview.length) throw new Error(`sem preview nem starter (o modelo exige): ${semPreview.join(", ")}`);

// BLOCKS: apps/catalog/content/blocks/*.mjs (default = lista). Seção/tela inteira montada
// com componentes reais — maior que pattern, menor que uma tela de produto.
// Carregado AQUI, e não depois das receitas como antes: o PRERENDER logo abaixo precisa da
// lista, porque bloco também pré-renderiza desde o item I4 (10/08/2026).
const blocksDir = join(contentDir, "blocks");
const blocks = [];
for (const file of existsSync(blocksDir) ? readdirSync(blocksDir).filter(f => f.endsWith(".mjs")).sort() : []) {
  const mod = await import(pathToFileURL(join(blocksDir, file)).href);
  for (const b of mod.default) blocks.push({...b, slug: `block-${slug(b.name)}`});
}
const blocksByCategory = {};
for (const b of blocks) (blocksByCategory[b.category] ??= []).push(b);
// PATTERNS granulares: apps/catalog/content/patterns/<Componente>.mjs (default = lista).
// Pattern = Componente → Variante → Composição (vocabulário do AUREA.md §4). Cada entrada
// vira UMA página; a variante é só o 2º nível do caminho, não um campo do registry.
//
// SLUG (achado M11, Fase 7): a URL é `pattern-<slug da ficha>-<slug do nome>`, e o nome do
// arquivo tem de SER um nome de ficha — é o "um esquema só" que o achado pede. A variante saiu
// da URL de propósito: era ela que produzia os dois esquemas aparentes. Button + variante
// "Group" gerava `pattern-button-group-segmented-range`, indistinguível de um pattern do
// ButtonGroup (`pattern-buttongroup-…`) — dois componentes onde há um.
// A causa raiz que o achado escreveu ("o slug vem de dois lugares, nome do arquivo vs nome
// declarado") está ERRADA: os dois sempre vieram do nome do arquivo. Medido em 30/07/2026.
const patternsDir = join(contentDir, "patterns");
const patterns = [];
for (const file of existsSync(patternsDir) ? readdirSync(patternsDir).filter(f => f.endsWith(".mjs")).sort() : []) {
  const mod = await import(pathToFileURL(join(patternsDir, file)).href);
  const component = file.replace(".mjs", "");
  if (!fichas.some(x => x.name === component))
    throw new Error(`content/patterns/${file}: "${component}" não é o name de nenhuma ficha do registry`);
  for (const p of mod.default) patterns.push({...p, component, slug: `pattern-${slug(component)}-${slug(p.name)}`});
}
const patternsByComponent = {};
for (const p of patterns) (patternsByComponent[p.component] ??= []).push(p);

// ── PRERENDER: o preview de quem só existe depois de MONTAR ────────────────────────────────
// Lote 3 (01/08/2026). Todo preview daqui é `renderToStaticMarkup`, que não roda efeito. O
// Recharts 3 passou a montar o gráfico por efeito: MEDIDO em 01/08/2026, `renderToStaticMarkup`
// de um LineChart 600×220 devolve 127 bytes — a <div> embrulho, sem <svg> nenhum. É regressão
// conhecida do 3.0 (recharts#5997) e não tem correção publicada no 3.10.1.
//
// A saída é montar de verdade num DOM e ler o HTML — o jsdom já é dependência de teste do
// repositório, então não entra nada novo. É a MESMA escada do `embed`: quando o preview não
// cabe no caminho comum, ele ganha um caminho declarado na entrada de conteúdo, não uma
// exceção escondida no gerador.
//
// O ResizeObserver é stub: o jsdom não tem, e sem ele o ResponsiveContainer mede 0×0 e o motor
// não desenha (medido: 153 bytes). O tamanho fixado aqui é o do painel de demo do catálogo.
const preRenderizado = {};
// TRÊS filas na MESMA lista, e cada linhagem acrescentou uma. Sem starter, o preview do
// componente sai vazio; sem BLOCO (item I4), a composição com gráfico dentro sai caixa vazia;
// sem PATTERN, um pattern do ChartLegend não ensina nada — vazio é o que
// `renderToStaticMarkup` devolve para o Recharts. Ficar com uma fila só reabre o defeito que a
// outra existia para tapar.
// As chaves não colidem: starter é nome de ficha, bloco começa em `block-`, pattern em `pattern-`.
const paraPreRender = [
  ...Object.entries(starters).filter(([, v]) => v.prerender),
  ...blocks.filter(b => b.prerender).map(b => [b.slug, b]),
  ...patterns.filter(p => p.prerender).map(p => [p.slug, p]),
];
if (paraPreRender.length) {
  const {JSDOM} = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body><div id=root></div></body></html>", {pretendToBeVisual: true});
  for (const k of ["window", "document", "HTMLElement", "SVGElement", "Element", "Node",
    "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "MutationObserver"]) {
    if (dom.window[k] !== undefined) globalThis[k] = dom.window[k];
  }
  globalThis.ResizeObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{contentRect: {width: 640, height: 220}, target: el}], this); }
    unobserve() {} disconnect() {}
  };
  // Sem `act` e sem IS_REACT_ACT_ENVIRONMENT de propósito: isto não é um teste, é uma
  // montagem real. Ligar o modo de teste faria o React avisar "update was not wrapped in
  // act(...)" a cada quadro da animação de entrada do motor — 27 avisos num build de 3
  // gráficos, medido. Montar e esperar o quadro seguinte já roda os efeitos no React 19.
  const {createRoot} = await import("react-dom/client");
  for (const [nome, entrada] of paraPreRender) {
    const alvo = dom.window.document.getElementById("root");
    const raiz = createRoot(alvo);
    raiz.render(h(A.AureaProvider, {spriteUrl: ""}, entrada.render()));
    // ESPERA A PROVA, NÃO O RELÓGIO. Aqui havia `setTimeout(r, 120)` — uma aposta de que o
    // motor teria medido e desenhado em 120 ms dentro do jsdom. Aposta de tempo não é gate: ela
    // não falha quando o código quebra, falha quando a máquina está lenta — e passa por sorte no
    // caso contrário. Em 09/08/2026 ela venceu de forma DETERMINÍSTICA nesta máquina: o `Chart`
    // reprovou em cinco execuções seguidas, e com 1000 ms passava. A margem foi corroída em
    // silêncio à medida que o catálogo cresceu — cada componente que pré-renderiza divide o
    // mesmo jsdom, e a Parte H acrescentou o `DependencyGraph`.
    //
    // Agora o laço espera até a prova aparecer, com teto. O TETO NÃO É O GATE: quem reprova
    // continua sendo o `if` abaixo, então componente que nunca desenha segue quebrando o build —
    // só que por não desenhar, e não por ter desenhado devagar. Provado contra o defeito em
    // 09/08/2026: com uma prova impossível, o build morre depois da espera.
    const prova = typeof entrada.prerender === "string" ? entrada.prerender : "<svg";
    for (let i = 0; i < 150 && !alvo.innerHTML.includes(prova); i++)
      await new Promise(r => setTimeout(r, 20));
    // O motor congela a largura MEDIDA no style do embrulho (`width: 640px`). Num HTML estático
    // isso vira uma foto rígida: medido no navegador a 375px de viewport, a caixa dava 245px e o
    // desenho de 640px saía cortado. Soltar as duas caixas de medição devolve a fluidez — o
    // <svg> tem viewBox e é ele que escala.
    // São DUAS e não uma: entre o container e o embrulho o motor põe um calço de 0×0 com
    // `overflow:visible` (é assim que ele mede o pai sem influenciá-lo). Soltar só o embrulho
    // fazia `width:100%` resolver 100% de zero — medido, e o desenho sumia.
    const container = alvo.querySelector(".recharts-responsive-container");
    for (const caixa of [container?.firstElementChild, ...alvo.querySelectorAll(".recharts-wrapper")]) {
      if (caixa) { caixa.style.width = "100%"; caixa.style.height = "100%"; }
    }
    const html = alvo.innerHTML;
    // O guarda EXIGE a prova de que o desenho saiu — e ele já mentiu uma vez. Em 09/08/2026
    // o `DependencyGraph` passou aqui com `<svg` e a página saiu QUEBRADA: o `<Background/>`
    // do React Flow emite um `<svg>` de fundo pontilhado, então o guarda aprovou o fundo
    // achando que era o grafo. No navegador os cinco nós saíam entre x=314 e x=1394 numa caixa
    // de 667px, com ZERO aresta. É o "gate de nome não é gate de efeito" do Lote 3 outra vez.
    // Agora `prerender` aceita um TRECHO: quem sabe o que o seu desenho produz declara isso, e
    // `true` continua valendo `<svg` para quem já estava aqui. (A `prova` é declarada ANTES da
    // espera, logo acima — é ela que a espera aguarda.)
    if (!html.includes(prova)) {
      throw new Error(`prerender de ${nome}: montou e não produziu ${JSON.stringify(prova)}. `
        + "Se o componente mede o DOM para se posicionar, ele NÃO cabe em página estática — "
        + "use `note`, como o Dialog e o Drawer, em vez de uma prévia que mente.");
    }
    preRenderizado[nome] = html;
    raiz.unmount();
  }
}

// ── Preview/Code — um bloco com abas (JS de catalog.js alterna) ───────────────
// `anchor` marca o bloco PRINCIPAL da página: é o par preview/code que o modelo exige, e o
// gate procura por `#preview`. Os exemplos extras não recebem âncora.
let uid = 0;
function demoBlock(render, code, anchor) {
  const id = `d${uid++}`;
  let previewHtml = null;
  // Demo que estoura DERRUBA o build. Antes era console.warn: a página saía com "Preview
  // unavailable" e ninguém lia a linha de aviso no meio de 169 páginas — falha silenciosa,
  // que é a espécie que esta auditoria mais pagou para aprender a não aceitar.
  // `identifierPrefix` porque cada demo é um render SEPARADO: o contador do `useId` recomeça do
  // zero a cada chamada, então dois exemplos na mesma página nasciam com o MESMO id — e um
  // `<label for>` que aponta para um id repetido nomeia o primeiro dos dois. Medido em 13/08/2026:
  // 34 ids duplicados em 9 páginas. O prefixo é o `id` do bloco, que já era único.
  // E o `code` no erro não é enfeite: um pattern com API inventada estoura aqui e o traço do
  // React só nomeia o componente interno. Em 21/08/2026 um `trend={{value, direction}}` (prop que
  // o KPI não tem) derrubou o build e a única pista era "Objects are not valid as a React child" —
  // 296 páginas e nenhuma delas nomeada.
  if (render) {
    try { previewHtml = renderToStaticMarkup(h(A.AureaProvider, {spriteUrl: ""}, render()), {identifierPrefix: `${id}-`}); }
    catch (e) { e.message = `demo que estourou:\n${code || "(sem código)"}\n\n${e.message}`; throw e; }
  }
  // Uma aba só não é escolha nenhuma: sem código, o bloco é o painel puro (modelo da referência).
  const tab = (panel, label, on) => h("button", {key: panel, className: on ? "active" : undefined,
    type: "button", role: "tab", id: `${id}-${panel}`, "data-panel": panel,
    "aria-selected": on ? "true" : "false", "aria-controls": `${id}-${panel}-panel`, tabIndex: on ? 0 : -1}, label);
  // data-aurea-tabpanel: é assim que o aurea.js do CORE sabe quem esconder. As abas do
  // catálogo não têm JS próprio — usam o mesmo comportamento (setas, Home/End) de todo mundo.
  // tabIndex no painel: ele é `overflow:auto` por construção, e um preview mais alto que a caixa
  // rolava só com o mouse — axe `scrollable-region-focusable`, medido em 30/07/2026 em duas
  // páginas. A regra é do PAINEL, não daquelas duas: qualquer conteúdo alto cai nela. É também o
  // que o APG pede para um tabpanel sem elemento focável dentro.
  const panelAttrs = panel => ({role: "tabpanel", id: `${id}-${panel}-panel`, "data-aurea-tabpanel": "",
    tabIndex: 0, ...(code ? {"aria-labelledby": `${id}-${panel}`} : {})});
  return h("div", {className: "demo", id: anchor, "data-demo": id},
    code ? h("div", {className: "demo-tabs"},
      h("div", {className: "segmented", role: "tablist"}, tab("preview", "Preview", true), tab("code", "Code", false))) : null,
    h("div", {className: "demo-panel", "data-panel": "preview", ...panelAttrs("preview"), ...(previewHtml ? {dangerouslySetInnerHTML: {__html: previewHtml}} : {})},
      // Componente cujo conteúdo vive num portal renderiza só o disparador; quem não renderiza
      // nada (Dialog, Drawer) mostra o disparador do próprio starter. O `note` do conteúdo
      // explica na lede da demo — nunca uma caixa vazia sem explicação.
      previewHtml ? null : h("span", {style: muted}, "Interactive — see the code.")),
    code ? h("div", {className: "demo-panel demo-code", "data-panel": "code", ...panelAttrs("code"), hidden: true},
      h(A.CodeBlock, {language: "tsx", copyable: true}, code)) : null);
}

// O rótulo vai num elemento PRÓPRIO: text-overflow:ellipsis não age sobre o texto anônimo
// de um container flex. Sem isto, a 320px o chip cortava no meio da letra e perdia a borda
// arredondada — corte, não truncamento. Com o span, o pill fica inteiro e a reticência
// aparece dentro dele. Serve chip de texto e chip-link, para os dois truncarem igual.
const chipText = label => h("span", {className: "chip-text"}, label);
function chip(label) { return h("code", {className: "chip", key: label}, chipText(label)); }
function chipLink(label, href) { return h("a", {key: label, className: "chip chip-link", href}, chipText(label)); }

// ── UMA página de item, montada a partir do MODELO ────────────────────────────
// `page-model.mjs` declara as seções; aqui elas viram markup, UMA vez (ADR-0001). A ORDEM e os nomes
// são os da documentação da referência desde a ADR-0067 (13/10/2026): o título com "Copy Markdown", a
// descrição e as pílulas de atalho; Usage (o import e a caixa Preview | Code, que é a da Aurea); os
// extras do tipo; Related Components; e os cartões de anterior e próxima. Sem trilha, e sem
// "Installation" na página — ela mora, uma vez, no Getting Started.
//
//   title     o nome
//   lede      a descrição de uma linha
//   pills     [[rótulo, ícone, href]] — os atalhos embaixo da descrição
//   demo      {render, code, description} — o par preview/code, núcleo do modelo
//   imports   a linha de import que o Usage mostra
//   points    os pontos que eram a "Features": entram como texto do Usage (nada se perde)
//   related   [[nome, href, resumo]] — a proveniência, em cartões
//   extras    [{id, label, node, toc}] na ordem que o tipo declara (page-model.EXTRAS)
//   markdown  o texto que o "Copy Markdown" copia
// Devolve o conteúdo e o índice da página — o índice vai para a coluna da direita do shell.
function itemPage({title, lede, pills = [], demo, imports, points = [], related = [], extras = [], prev, next, markdown}) {
  const secoes = extras.filter(Boolean);
  // O índice sai das seções que a página REALMENTE tem — nunca de uma lista escrita à mão.
  const toc = [{id: "usage", label: "Usage"},
    ...secoes.flatMap(s => [{id: s.id, label: s.label}, ...(s.toc || [])]),
    ...(related.length ? [{id: "related", label: "Related Components"}] : [])];
  const node = h(Fragment, null,
    h("header", {className: "page-head"},
      h("div", {className: "page-head-row"}, h("h1", null, title),
        h(A.Button, {variant: "tertiary", size: "sm", leadingIcon: "copy", "data-copy-page": "", type: "button"}, "Copy Markdown")),
      h("p", {className: "page-lede"}, lede),
      pills.length ? h("div", {className: "page-pills"}, ...pills.map(([rotulo, icone, href]) =>
        h(A.Button, {key: rotulo, variant: "tertiary", size: "sm", leadingIcon: icone, href, target: "_blank", rel: "noreferrer"}, rotulo))) : null),
    h("section", {className: "block", id: "usage"}, h("h2", null, "Usage"),
      h(A.CodeBlock, {language: "tsx", copyable: true, className: "usage-import"}, imports),
      demo.description ? h("p", {className: "demo-lede"}, demo.description) : null,
      demoBlock(demo.render, demo.code, "preview"),
      points.length ? h("ul", {className: "usage-points"}, ...points.map((t, n) => h("li", {key: n}, t))) : null),
    ...secoes.map(s => s.node),
    // A proveniência ("Uses" da ADR-0001) vira os cartões de "Related Components", como na referência.
    related.length ? h("section", {className: "block", id: "related"}, h("h2", null, "Related Components"),
      h("div", {className: "related-grid"}, ...related.map(([nome, href, resumo]) => href
        ? h("a", {key: nome, className: "related-card", href}, h("strong", null, nome), resumo ? h("span", null, resumo) : null)
        : h("div", {key: nome, className: "related-card"}, h("strong", null, nome), resumo ? h("span", null, resumo) : null)))) : null,
    // rótulo distinto do <nav> do componente Pagination: dois landmarks de navegação com
    // o MESMO nome é violação (axe landmark-unique) e o leitor de tela não distingue.
    h("nav", {className: "prevnext", "aria-label": "Previous and next"},
      prev ? h("a", {className: "pn", href: prev.href}, h("small", null, "← Previous"), h("strong", null, prev.name),
        prev.summary ? h("span", null, prev.summary) : null) : h("span"),
      next ? h("a", {className: "pn pn-next", href: next.href}, h("small", null, "Next →"), h("strong", null, next.name),
        next.summary ? h("span", null, next.summary) : null) : h("span")),
    // O texto do "Copy Markdown": vai na própria página, sem rede, e o catalog.js copia. Vai como JSON, com
    // todo "<" escrito "<": cru, o código dos exemplos ("<Link href=…>") aparecia como TAG no HTML — o
    // check 45 do validate.py leu um link de exemplo como recurso de fora, e um "</script>" fecharia o bloco.
    h("script", {type: "application/json", id: "page-markdown",
      dangerouslySetInnerHTML: {__html: JSON.stringify(markdown || `# ${title}\n\n${lede}\n`).replace(/</g, "\\u003c")}}));
  return {node, toc};
}

// O markdown de uma página de item: o mesmo conteúdo, em texto que se cola num editor ou num agente.
function paraMarkdown({title, lede, imports, demo, points = [], exemplos = [], props = []}) {
  const bloco = (codigo, lang = "tsx") => `\`\`\`${lang}\n${codigo}\n\`\`\``;
  return [`# ${title}`, lede, "## Usage", bloco(imports), demo?.code ? bloco(demo.code) : null,
    ...points.map(p => `- ${p}`),
    exemplos.length ? "## Examples" : null,
    ...exemplos.flatMap(e => [`### ${e.title}`, e.description || null, e.code ? bloco(e.code) : null]),
    props.length ? "## API Reference" : null,
    props.length ? ["| Prop | Type | Default | Description |", "|---|---|---|---|",
      ...props.map(p => `| \`${p.name}\` | \`${String(p.type).replace(/\|/g, "\\|")}\` | ${p.default || "—"} | ${String(p.description || "").replace(/\|/g, "\\|").replace(/\n/g, " ")} |`)].join("\n") : null,
  ].filter(Boolean).join("\n\n") + "\n";
}

// prev/next: o vizinho na ordem linear do tipo, ou nada nas pontas — com o resumo, como os cartões da referência.
const pn = (item, href, resumo = () => null) => item ? {name: item.name ?? item, href: href(item), summary: resumo(item)} : null;

// Componente de PÁGINA (hoje só o AppShell) é dono do <main>, do <header> e do <aside> do
// documento. Renderizado dentro de outra página ele duplica os landmarks dela — medido com axe
// em 30/07/2026: main duplicado, complementary aninhado e dois <nav> com o mesmo nome. A
// hipótese de que envolver num <section> neutralizaria o <aside> foi testada no navegador e
// caiu. Então o preview dele vive num DOCUMENTO próprio e entra por <iframe>, que é o que um
// shell precisa. O código continua sendo o componente, sem iframe nenhum.
const embeds = [];
// `chave` nomeia o ARQUIVO e `rotulo` nomeia o iframe. Eram a mesma coisa até 18/08/2026, quando
// o `embed` passou a valer para qualquer exemplo e não só para o primeiro: dois embeds do mesmo
// componente escreviam o mesmo arquivo e um sobrescrevia o outro, calado.
function embedPreview(chave, render, rotulo = chave, alvo = null, layoutProprio = false, tituloProprio = false) {
  const arquivo = `embeds/${slug(chave)}.html`;
  embeds.push([arquivo, `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${rotulo} preview — Aurea UDS</title>
<link rel="stylesheet" href="../assets/catalog.css">
</head>
<body>${SPRITE_SLOT}
<!-- A MOLDURA E UM DOCUMENTO, NAO UM FRAGMENTO - e isso custou 12 reprovacoes em 18/08/2026. A
     varredura e o axe cobram page-has-heading-one e landmark-one-main de TODA pagina, e os dois
     estao certos: documento sem titulo e sem conteudo principal nao e pagina. A saida nao foi
     excluir os embeds do gate (cegaria o axe dentro deles) - e o gerador emitir a estrutura.
     O h1 e .sr-only porque a moldura mostra UM componente: titulo visivel competiria com ele.
     layoutProprio existe para quem ja monta os proprios landmarks: a lateral poe o main AO LADO
     do aside, porque aside DENTRO de main e landmark-complementary-is-top-level. -->
${tituloProprio ? "" : `<header><h1 class="sr-only">${rotulo} preview</h1></header>`}
<${layoutProprio ? "div" : "main"} id="root"${alvo ? ` data-componente="${alvo.componente}" data-indice="${alvo.indice}"` : ""}>${
  // `renderToString` e NÃO `renderToStaticMarkup` quando a moldura vai hidratar: o segundo não
  // emite os marcadores de hidratação, e o React 19 reclama de divergência e joga a árvore fora —
  // a prévia piscaria e voltaria ao estático. Sem alvo, segue estático como sempre.
  alvo ? renderToString(h(A.AureaProvider, {spriteUrl: ""}, render()))
       : renderToStaticMarkup(h(A.AureaProvider, {spriteUrl: ""}, render()))
}</${layoutProprio ? "div" : "main"}>${alvo ? `
<!-- O RUNTIME (18/08/2026). Sem ele a prévia é HTML morto: o \`Tooltip\` do trilho existe no
     código, passa no teste, e não abria porque não havia JavaScript. O estático continua sendo o
     piso — este script só ENXERTA por cima, e se falhar a marcação já está na tela. -->
<script src="../assets/live.js"></script>` : ""}
<script>
// O tema não atravessa documento, e em file:// este iframe é de outra origem — ler o pai seria
// proibido. Então ele PEDE o tema por mensagem, e o catalog.js responde (e reenvia ao trocar).
addEventListener("message", e => { if (!e.data) return; if (e.data.aureaTheme) document.documentElement.dataset.theme = e.data.aureaTheme; if (e.data.aureaBrand !== undefined) { if (e.data.aureaBrand) document.documentElement.dataset.brand = e.data.aureaBrand; else delete document.documentElement.dataset.brand; } });
parent.postMessage({aureaThemeRequest: 1}, "*");
</script></body>
</html>
`]);
  return () => h("iframe", {className: "demo-frame", src: `./${arquivo}`, title: `${rotulo} preview`, loading: "lazy"});
}

// ── página de UM componente ───────────────────────────────────────────────────
function componentPage(f, i) {
  const c = content[f.name];
  // starter e conteúdo rico entram pela MESMA porta: um exemplo com render e código. O
  // `note` do starter (portal não renderiza em página estática) vira a lede da demo.
  const bruto = c ? c.examples[0] : starters[f.name];
  const main = {...bruto, description: bruto.description || bruto.note,
    ...(bruto.embed ? {render: embedPreview(f.name, bruto.render, f.name,
      // índice 0: o exemplo principal é `c.examples[0]`
      content[f.name] ? {componente: f.name, indice: 0} : null,
      bruto.layoutProprio === true, bruto.tituloProprio === true)} : {}),
    // `width:100%` no involucro não é enfeite: o `.demo-panel` é flex, então um <div> solto
    // entra como item de largura automática, encolhe para zero e o `.chart{width:100%}` de
    // dentro resolve 100% de zero. Medido no navegador em 01/08/2026: a caixa media 0×220 e o
    // desenho vazava para fora dela.
    ...(bruto.prerender ? {render: () => h("div", {style: {width: "100%"},
      dangerouslySetInnerHTML: {__html: preRenderizado[f.name]}})} : {})};
  // Variante, tamanho e estado são EIXOS DIFERENTES (DIRECTION.md §5) — juntar os três num
  // rótulo "Variants" era mentira: `lg` não é variante e `hover` não é nem uma coisa nem outra.
  // Eixo declarado que a página não mostra é eixo que ninguém descobre. `variants` e `sizes`
  // têm campo próprio por serem os dois primeiros, não por serem os únicos: o `tone` do Button
  // e o `side` das sobreposições entram por `axes`, e aparecem na mesma linha.
  const axes = [["Variants", f.variants], ["Sizes", f.sizes],
    ...Object.entries(f.axes || {}).map(([k, v]) => [k[0].toUpperCase() + k.slice(1), v]),
    // Pela mesma razão da linha acima: fechado o eixo responsivo em 18 componentes, a ficha
    // passou a declarar QUAIS props aceitam valor por breakpoint — e uma capacidade declarada
    // que a página não mostra é uma capacidade que ninguém descobre. O sufixo diz o que o valor
    // aceita, que é a parte que o nome da prop sozinho não conta.
    ...(f.responsive?.length
      ? [["Responsive", f.responsive.map(pr => `${pr}={{base, viewport|container}}`)]] : []),
    ["States", f.states]]
    .filter(([, v]) => v?.length);
  // plataforma também é chip, com o Status DENTRO dele: o ponto diz o estado, a cápsula
  // mantém a fila alinhada com as outras linhas da Reference.
  const platforms = Object.entries(f.platforms).map(([p, s]) =>
    h("span", {key: p, className: "chip chip-status"},
      h(A.Status, {variant: s === "planned" ? "offline" : s === "n-a" ? "neutral" : "online"}, `${p}: ${s}`)));
  const usa = f.related.components || [];
  const resumoDe = nome => fichas.find(x => x.name === nome)?.summary || null;
  const exemplos = c ? c.examples.slice(1) : [];
  const fonte = f.source?.react ? f.source.react.split("#")[0] : null;
  return itemPage({
    title: f.name, lede: c?.description || f.summary,
    // As pílulas de atalho da referência, com o que a Aurea tem: o código do componente e o CSS dele.
    pills: [...(fonte ? [["Source", "code", `${REPO}/blob/main/${fonte}`]] : []),
      ["Styles source", "paint-brush", `${REPO}/blob/main/packages/core/src/aurea.css`]],
    demo: main,
    // O starter também pode declarar o import: módulos de motor opcional moram em subpath próprio
    // desde a Fase 9, e a página tem de ensinar o import que funciona, não o do barril — que para
    // eles não existe.
    imports: c?.install || bruto.install || `import {${f.name}} from "@aurea-uds/react";`,
    points: c?.features || [],
    related: usa.map(rc => [rc, fichas.some(x => x.name === rc) ? `./${slug(rc)}.html` : null, resumoDe(rc)]),
    extras: [
      exemplos.length ? {id: "examples", label: "Examples",
        toc: exemplos.map(ex => ({id: slug(ex.title), label: ex.title, sub: true})),
        node: h("section", {className: "block", id: "examples"}, h("h2", null, "Examples"),
          ...exemplos.map((ex, n) => h("div", {className: "example", key: n, id: slug(ex.title)},
            h("h3", null, ex.title), ex.description ? h("p", {className: "demo-lede"}, ex.description) : null,
            // `embed` deixou de ser privilégio do primeiro exemplo (18/08/2026): componente que
            // mede a própria altura em `100vh` — a lateral é o caso — só se enxerga numa moldura
            // com viewport PRÓPRIA. Espremido num painel de demo ele era recortado.
            demoBlock(ex.embed
              ? embedPreview(`${f.name}-${slug(ex.title)}`, ex.render, `${f.name} — ${ex.title}`,
                  // `n` é o índice DENTRO de `slice(1)`, então o índice real é `n + 1`
                  {componente: f.name, indice: n + 1}, ex.layoutProprio === true,
                  ex.tituloProprio === true)
              : ex.render, ex.code))))} : null,
      // A "Reference" da Aurea, no nome e no lugar da referência ("Styling Reference"): os eixos, a
      // acessibilidade, os tokens e as plataformas. Toda linha é uma fila de chips do MESMO tamanho.
      {id: "styling", label: "Styling Reference",
        node: h("section", {className: "block", id: "styling"}, h("h2", null, "Styling Reference"),
          h("dl", {className: "facts"},
            ...axes.map(([label, values]) => h(Fragment, {key: label},
              h("dt", null, label), h("dd", null, h("div", {style: row}, ...values.map(chip))))),
            h("dt", {key: "a"}, "A11y"), h("dd", {key: "ad"}, h("div", {style: row},
              chip(f.a11y.role ? `role="${f.a11y.role}"` : "native semantics"),
              ...(f.a11y.keyboard || []).map(chip))),
            f.tokens.length ? h(Fragment, {key: "t"}, h("dt", null, "Tokens"), h("dd", null, h("div", {style: row}, ...f.tokens.map(chip)))) : null,
            h("dt", {key: "p"}, "Platforms"), h("dd", {key: "pd"}, h("div", {style: row}, ...platforms))))},
      // A tabela é o componente Table.
      f.props?.length ? {id: "api", label: "API Reference",
        node: h("section", {className: "block", id: "api"}, h("h2", null, "API Reference"),
          h(A.Table, {caption: `${f.name} props`},
            h("thead", null, h("tr", null, h("th", null, "Prop"), h("th", null, "Type"),
              h("th", null, "Default"), h("th", null, "Description"))),
            h("tbody", null, ...f.props.map(pr => h("tr", {key: pr.name},
              h("td", null, h("code", {className: "chip"}, pr.name)),
              h("td", null, h("code", {style: {fontSize: "var(--text-xs)", color: "var(--muted-foreground)"}}, pr.type)),
              h("td", null, h("code", {style: {fontSize: "var(--text-xs)", color: "var(--subtle-foreground)"}}, pr.default || "—")),
              h("td", null, pr.description))))))} : null,
    ],
    prev: pn(ordered[i - 1], x => `./${slug(x.name)}.html`, x => x.summary),
    next: pn(ordered[i + 1], x => `./${slug(x.name)}.html`, x => x.summary),
    markdown: paraMarkdown({title: f.name, lede: c?.description || f.summary,
      imports: c?.install || bruto.install || `import {${f.name}} from "@aurea-uds/react";`,
      demo: main, points: c?.features || [], exemplos, props: f.props || []}),
  });
}

// ── "All Components" (components.html) ───────────────────────────────────────
// Como o catálogo da referência: grupos por categoria, grade de 3, o nome embaixo. O cartão mostra
// o COMPONENTE DE VERDADE, parado (elemento nosso, ADR-0067), e não uma foto: renderizado aqui, com
// `inert` (nada recebe foco nem clique) e escondido do leitor de tela — quem lê ouve o nome do link.
// O link cobre o cartão inteiro por um pseudo-elemento: botão de verdade dentro de um <a> seria HTML
// inválido, e é por isso que a prévia não mora DENTRO do link.
function previaDoCartao(f) {
  const c = content[f.name];
  const bruto = c ? c.examples[0] : starters[f.name];
  if (bruto?.prerender && preRenderizado[f.name]) return preRenderizado[f.name];
  if (!bruto?.render || bruto.embed) return null;
  return renderToStaticMarkup(h(A.AureaProvider, {spriteUrl: ""}, bruto.render()), {identifierPrefix: `card-${slug(f.name)}-`});
}
function componentsIndex() {
  const toc = cats.map(cat => ({id: `cat-${slug(cat)}`, label: cat}));
  const node = h(Fragment, null,
    h("header", {className: "page-head"},
      h("div", {className: "page-head-row"}, h("h1", null, "All Components")),
      h("p", {className: "page-lede"}, `Explore the full list of ${fichas.length} components, rendered with the Aurea components themselves.`)),
    ...cats.map(cat => h("section", {className: "block", key: cat},
      h("h2", {id: `cat-${slug(cat)}`}, cat),
      h("div", {className: "cat-grid"}, ...byCat[cat].map(f => {
        const previa = previaDoCartao(f), selo = seloDe(f.name);
        return h("div", {className: "cat-card", key: f.name},
          previa
            ? h("div", {className: "cat-card-preview", inert: true, "aria-hidden": "true", dangerouslySetInnerHTML: {__html: previa}})
            : h("div", {className: "cat-card-preview cat-card-icon", "aria-hidden": "true"}, h(A.Icon, {name: f.icon || "cube", size: "xl"})),
          h("div", {className: "cat-card-foot"},
            h("a", {className: "cat-card-name", href: `./${slug(f.name)}.html`}, f.name),
            selo ? h(A.Badge, {size: "xs", tone: selo === "New" ? "primary" : "neutral"}, selo) : null));
      })))));
  return {node, toc};
}

// ── Início (index.html) ──────────────────────────────────────────────────────
// Como o início da referência: o título centralizado em duas linhas (a segunda esmaecida), o texto,
// dois botões, e uma vitrine grande. A vitrine são os BLOCOS da própria Aurea, em abas.
const VITRINE = ["block-sign-in-panel", "block-stats-row", "block-members-table", "block-settings-form"];
function homePage() {
  const escolhidos = VITRINE.map(s => blocks.find(b => b.slug === s)).filter(Boolean);
  const aba = (b, n) => h("button", {key: b.slug, type: "button", role: "tab", id: `vit-${n}`, "data-panel": b.slug,
    className: n === 0 ? "active" : undefined, "aria-selected": n === 0 ? "true" : "false",
    "aria-controls": `vit-${n}-panel`, tabIndex: n === 0 ? 0 : -1}, b.name);
  const node = h("div", {className: "home"},
    h("section", {className: "home-hero"},
      // O selo é um LINK para o que mudou, com o foguete, sem borda e com o fundo clarinho — como o da referência
      // (15/10/2026). O `Badge` com `emphasis="soft"` e o ícone no encaixe `leading`.
      h("a", {className: "home-selo", href: `${REPO}/blob/main/CHANGELOG.md`},
        h(A.Badge, {tone: "primary", emphasis: "soft", leading: h(A.Icon, {name: "rocket"})}, `Aurea v${VERSAO} — what's new`)),
      // O título e o texto JUNTOS, sem vão entre eles, como no início da referência (o Victor, 14/10/2026).
      h("div", {className: "home-texto"},
        h("h1", null, "One design system.", h("br"), h("span", null, "Web and native, one look.")),
        h("p", null, "Aurea is a design system with two outputs: the web, in React and CSS, and mobile, in React Native. The look is one, and it does not change from one side to the other — made for people who see little.")),
      h("div", {className: "home-acoes"},
        h(A.Button, {variant: "primary", href: "./getting-started.html"}, "Get started"),
        h(A.Button, {variant: "outline", href: "./components.html"}, "View components")),
      // Como a da referência (o Victor, 15/10/2026: "mude para igual a deles"): o link para o repositório, em letra 12.
      // Sem o número de estrelas: ele muda sozinho, e a página é gerada e conferida pela CI — o número escrito nela
      // ficaria velho, e buscado na montagem faria a página mudar a cada estrela.
      // Com o logo oficial do GitHub na frente, em 16, como a da referência (15/10/2026).
      h("a", {className: "home-nota", href: REPO}, h(A.Icon, {name: GitHub, size: "sm"}), "Open source on GitHub")),
    h("section", {className: "home-vitrine", "aria-label": "Showcase"},
      // As abas só a partir de 1024, como na referência: abaixo disso ela mostra só a primeira vitrine (`hide-below-lg`).
      h("div", {className: "segmented home-abas hide-below-lg", role: "tablist", "aria-label": "Showcase"}, ...escolhidos.map(aba)),
      // A caixa é o `Card variant="outline"`: da cor da página, só com a linha em volta, como a da
      // referência (o Victor, 13/10/2026). O componente, e não uma regra do site. O conteúdo vai CENTRADO dentro dela,
      // como na referência (15/10/2026) — pelo miolo do site, sem mexer no cartão.
      ...escolhidos.map((b, n) => h(A.Card, {key: b.slug, variant: "outline", className: "home-painel", role: "tabpanel", id: `vit-${n}-panel`,
        "aria-labelledby": `vit-${n}`, "data-panel": b.slug, "data-aurea-tabpanel": "", tabIndex: 0, hidden: n !== 0 ? true : undefined},
        h("div", {className: "home-painel-miolo", dangerouslySetInnerHTML: {__html: b.prerender ? preRenderizado[b.slug]
          : renderToStaticMarkup(h(A.AureaProvider, {spriteUrl: ""}, b.render()), {identifierPrefix: `vit-${n}-`})}})))));
  return {node, toc: []};
}

// ── Getting Started (getting-started.html) ───────────────────────────────────
// A instalação mora AQUI, uma vez — como na referência —, e não em cada página de item.
function gettingStartedPage() {
  const toc = [{id: "installation", label: "Installation"}, {id: "provider", label: "Provider"},
    {id: "first-component", label: "Your first component"}, {id: "native", label: "React Native"}];
  const node = h(Fragment, null,
    h("header", {className: "page-head"},
      h("div", {className: "page-head-row"}, h("h1", null, "Getting Started")),
      h("p", {className: "page-lede"}, "Install the packages, load the fonts before the core, and wrap the app in the provider.")),
    h("section", {className: "block", id: "installation"}, h("h2", null, "Installation"),
      h(A.CodeBlock, {language: "bash", copyable: true}, "pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons"),
      h("p", {className: "demo-lede"}, "The fonts load BEFORE the core: the core embeds no font."),
      h(A.CodeBlock, {language: "tsx", copyable: true}, IMPORT_CSS)),
    h("section", {className: "block", id: "provider"}, h("h2", null, "Provider"),
      h("p", {className: "demo-lede"}, "The provider hands out the default sentences, tells the components where the icon sprite is, and mounts what tooltips and toasts use."),
      h(A.CodeBlock, {language: "tsx", copyable: true},
        'import {AureaProvider} from "@aurea-uds/react";\n\nexport default function App() {\n  return <AureaProvider><Screen /></AureaProvider>;\n}')),
    h("section", {className: "block", id: "first-component"}, h("h2", null, "Your first component"),
      demoBlock(() => h(A.Button, {variant: "primary"}, "Save"), 'import {Button} from "@aurea-uds/react";\n\n<Button variant="primary">Save</Button>', "preview")),
    h("section", {className: "block", id: "native"}, h("h2", null, "React Native"),
      h("p", {className: "demo-lede"}, "Mobile is another package, with its own list of components and its own dependencies — not the web list with fewer items."),
      h(A.CodeBlock, {language: "bash", copyable: true}, "pnpm add @aurea-uds/native")));
  return {node, toc};
}

// ── chips e import de "Uses", comuns a pattern / block / recipe ───────────────
// "Related Components": a proveniência em cartões, com o resumo de cada ficha (ADR-0067).
const relacionados = list => [...new Set(list || [])].map(u => {
  const f = fichas.find(x => x.name === u);
  return [u, f ? `./${slug(u)}.html` : null, f?.summary || null];
});
const importLine = list => `import {${[...new Set(list || [])]
  .filter(u => fichas.some(x => x.name === u)).join(", ")}} from "@aurea-uds/react";`;

function patternPage(p, i) {
  return itemPage({
    title: p.name, lede: p.description,
    // `note` é a explicação de por que o preview mostra só o disparador (portal, ponteiro). Ela
    // existia em 14 entradas e esta função a DESCARTAVA — o pattern saía com uma caixa quase
    // vazia e nenhuma linha dizendo por quê, que é exatamente o defeito que o starter já tinha
    // resolvido. Medido em 21/08/2026.
    // `prerender` no pattern usa a MESMA escada do starter (bloco PRERENDER acima) — e o mesmo
    // embrulho `width:100%`, pela mesma razão medida: o `.demo-panel` é flex e um <div> solto
    // encolhe para zero.
    // `embed` idem: um pattern do AppShell renderizado dentro desta página duplica o <main> e
    // aninha o complementary, exatamente como o starter dele — a razão está no bloco do
    // `embedPreview`. A chave do arquivo é o slug do pattern, não o nome do componente.
    demo: {render: p.prerender
      ? () => h("div", {style: {width: "100%"},
          dangerouslySetInnerHTML: {__html: preRenderizado[p.slug]}})
      // As duas bandeiras PASSAM ADIANTE, e não passavam: os três padrões do AppShell saíam
      // com dois <main> e dois <h1>, porque a moldura montava os dela sem saber que o shell
      // já monta os do documento. O caminho dos EXEMPLOS (linha ~537) já as encaminhava; o
      // dos PADRÕES, não — e o conteúdo declarava as duas sem efeito nenhum. Medido pela
      // varredura do catálogo em 29/08/2026.
      : p.embed ? embedPreview(p.slug, p.render, p.name, null,
          p.layoutProprio === true, p.tituloProprio === true)
      : p.render, code: p.code, description: p.note},
    imports: importLine(p.uses || [p.component]),
    related: relacionados([p.component, ...(p.uses || [])]),
    prev: pn(patterns[i - 1], x => `./${x.slug}.html`, x => x.description),
    next: pn(patterns[i + 1], x => `./${x.slug}.html`, x => x.description),
    markdown: paraMarkdown({title: p.name, lede: p.description, imports: importLine(p.uses || [p.component]), demo: {code: p.code}}),
  });
}

function blockPage(b, i) {
  return itemPage({
    title: b.name, lede: b.description,
    // Mesmo desvio do `componentPage`, e pela mesma razão: quem pré-renderiza entrega HTML
    // pronto, não uma função. O `width:100%` no invólucro não é enfeite — o `.demo-panel` é
    // flex, e um <div> solto entra com largura automática, encolhe para zero, e o
    // `.chart{width:100%}` de dentro resolve 100% de zero (medido em 01/08/2026).
    demo: {code: b.code, render: b.prerender
      ? () => h("div", {style: {width: "100%"}, dangerouslySetInnerHTML: {__html: preRenderizado[b.slug]}})
      : b.render},
    imports: importLine(b.uses),
    related: relacionados(b.uses),
    prev: pn(blocks[i - 1], x => `./${x.slug}.html`, x => x.description),
    next: pn(blocks[i + 1], x => `./${x.slug}.html`, x => x.description),
    markdown: paraMarkdown({title: b.name, lede: b.description, imports: importLine(b.uses), demo: {code: b.code}}),
  });
}

function blocksIndex() {
  const catsB = Object.keys(blocksByCategory);
  return h("div", {className: "page-grid"}, h("div", {className: "page-main"},
    h("header", {className: "page-head"},
      h("h1", null, "Blocks"),
      h("p", {className: "page-lede"}, `${blocks.length} ready sections across ${catsB.length} areas. A block is bigger than a pattern and smaller than a screen: the piece you drop whole into a page. Every one of them is built with the components in this catalog.`)),
    ...catsB.map(cat => h("section", {className: "block", key: cat, id: `blk-${slug(cat)}`},
      h("h2", null, cat, h("span", {className: "count"}, ` ${blocksByCategory[cat].length}`)),
      h("div", {className: "grid"}, ...blocksByCategory[cat].map(b =>
        h("a", {className: "tile", href: `./${b.slug}.html`, key: b.slug},
          h("strong", null, b.name), h("p", null, b.description))))))),
    h(A.TableOfContents, {items: catsB.map(c => ({id: `blk-${slug(c)}`, label: c}))}));
}

function patternsIndex() {
  const comps = Object.keys(patternsByComponent);
  return h("div", {className: "page-grid"}, h("div", {className: "page-main"},
    h("header", {className: "page-head"},
      h("h1", null, "Patterns"),
      h("p", {className: "page-lede"}, `${patterns.length} compositions over ${comps.length} components. A pattern is a component already assembled one specific way — Component → Variant → Composition. You copy a pattern; you configure a component.`)),
    ...comps.map(cmp => h("section", {className: "block", key: cmp, id: `pat-${slug(cmp)}`},
      h("h2", null, cmp, h("span", {className: "count"}, ` ${patternsByComponent[cmp].length}`)),
      h("div", {className: "grid"}, ...patternsByComponent[cmp].map(p =>
        h("a", {className: "tile", href: `./${p.slug}.html`, key: p.slug},
          h("div", {style: {...row, justifyContent: "space-between"}}, h("strong", null, p.name),
            h(A.Badge, null, p.variant)),
          h("p", null, p.description))))))),
    h(A.TableOfContents, {items: comps.map(c => ({id: `pat-${slug(c)}`, label: c}))}));
}

// ── Tokens e Recipes: as outras áreas do topo ────────────────────────────────
// Nada inventado: as receitas e os patterns de ARQUITETURA saem do contrato (23 arquétipos,
// 12 patterns de aplicação, 5 operacionais) e os tokens saem do JSON DTCG. Atenção ao
// vocabulário: "Patterns" no topo são os GRANULARES (componente→variante→composição); os do
// contrato são patterns de arquitetura, e por isso moram dentro de Recipes, que é o que eles
// compõem. Um nome, um sentido.
const contract = JSON.parse(readFileSync(join(root, "packages/contracts/aurea.contract.json"), "utf8"));
const tokensDoc = JSON.parse(readFileSync(join(root, "packages/tokens/src/aurea.tokens.json"), "utf8"));

function patternCards(group) {
  return h("div", {className: "grid"}, ...Object.entries(group).map(([name, p]) =>
    h("article", {className: "tile", key: name},
      h("strong", null, name),
      p.behavior?.length ? h("p", null, p.behavior[0]) : null,
      h("div", {style: {...row, marginTop: "var(--space-2)"}}, ...(p.variants || []).slice(0, 6).map(chip)))));
}

// As 23 receitas JÁ ESTÃO ESCRITAS em patterns/*.md (validadas pelo check 9 do validate.py
// contra o contrato). A página as mostra em vez de reescrevê-las: conversor mínimo de md —
// só o que esses arquivos usam (h2, listas, **forte**, `código`, e as divisórias que somem).
function inline(text, key) {
  const parts = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0, m, n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(m[1] ? h("strong", {key: n++}, m[1]) : h("code", {className: "chip", key: n++}, m[2]));
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return h(Fragment, {key}, ...parts);
}

// Sai em SEÇÕES, uma por `## `, e não num bloco corrido: o modelo declara
// composition/capabilities/invariants/states como as seções extras do tipo receita, e seção
// declarada precisa existir como seção de verdade — com título, âncora e superfície própria,
// igual às dos outros tipos. O texto antes do primeiro `## ` é a lede da página.
function markdownSections(md) {
  const body = md.replace(/^---[\s\S]*?---\n/, "").split("\n");
  const secoes = [];
  const intro = [];
  let atual = null, para = [], list = null;
  const alvo = () => atual ? atual.nodes : null;
  const flush = () => {
    const dest = alvo();
    if (para.length) {
      if (dest) dest.push(h("p", {key: `p${dest.length}`, className: "recipe-p"}, inline(para.join(" "), "i")));
      else intro.push(para.join(" "));
      para = [];
    }
    if (list && dest) { dest.push(h("ul", {key: `u${dest.length}`, className: "features"}, ...list)); list = null; }
  };
  for (const raw of body) {
    const line = raw.replace(/━+/g, "").trimEnd();
    if (!line.trim()) { flush(); continue; }
    if (line.startsWith("# ")) continue;               // o h1 é o nome do arquétipo
    if (line.startsWith("## ")) { flush(); const t = line.slice(3).trim();
      atual = {id: slug(t), label: t, nodes: []}; secoes.push(atual); continue; }
    if (line.startsWith("- ")) { (list ??= []).push(h("li", {key: list.length}, inline(line.slice(2), "i"))); continue; }
    if (list) flush();
    // `> "invariante"`: o conversor deixava o sinal de citação vazar como texto ("> …"). O
    // invariante é a frase que a receita PROMETE — sai como afirmação, não com o marcador.
    if (line.startsWith("> ")) { flush(); const dest = alvo();
      if (dest) dest.push(h("p", {key: `q${dest.length}`, className: "recipe-p"},
        h("strong", null, inline(line.slice(2).trim().replace(/^"|"$/g, ""), "q"))));
      continue; }
    para.push(line.trim());
  }
  flush();
  return {intro: intro.join(" "), secoes};
}

function recipeTitle(id) {
  const md = readFileSync(join(root, `patterns/${id}.md`), "utf8");
  return (md.match(/^# (.+)$/m) || [, id.replace(/_/g, " ")])[1].trim();
}

function recipePage(id, archetype, i, ids) {
  const md = readFileSync(join(root, `patterns/${id}.md`), "utf8");
  const {intro, secoes} = markdownSections(md);
  // Preview e código de receita: o achado I2 media exatamente a falta deles ("de uma receita o
  // consumidor não consegue copiar nada"). O conteúdo mora em content/_recipes.mjs.
  const c = recipeContent[id];
  if (!c) throw new Error(`recipe ${id}: sem preview em content/_recipes.mjs — o modelo exige preview e código`);
  return itemPage({
    title: recipeTitle(id),
    lede: intro || (archetype.capabilities || []).join(" · "),
    demo: {render: c.render, code: c.code, description: c.description},
    imports: importLine(c.uses),
    related: relacionados(c.uses),
    markdown: paraMarkdown({title: recipeTitle(id), lede: intro || (archetype.capabilities || []).join(" · "),
      imports: importLine(c.uses), demo: {code: c.code}}),
    extras: secoes.map(s => ({id: s.id, label: s.label,
      node: h("section", {className: "block", key: s.id, id: s.id}, h("h2", null, s.label), ...s.nodes)})),
    prev: ids[i - 1] ? {name: recipeTitle(ids[i - 1]), href: `./recipe-${slug(ids[i - 1])}.html`} : null,
    next: ids[i + 1] ? {name: recipeTitle(ids[i + 1]), href: `./recipe-${slug(ids[i + 1])}.html`} : null,
  });
}

function recipesIndex() {
  const app = contract.applicationPatterns, op = contract.operationalPatterns;
  const toc = [{id: "archetypes", label: "Archetypes"}, {id: "application", label: "Application patterns"},
    {id: "operational", label: "Operational patterns"}];
  return h("div", {className: "page-grid"}, h("div", {className: "page-main"},
    h("header", {className: "page-head"},
      h("h1", null, "Recipes"),
      h("p", {className: "page-lede"}, `${Object.keys(app.archetypes).length} product archetypes: how to assemble a whole kind of application by composing the architecture patterns below. A recipe is not a component family — it says which patterns to use and which invariants to hold.`)),
    h("section", {className: "block", id: "archetypes"}, h("h2", null, "Archetypes",
      h("span", {className: "count"}, ` ${Object.keys(app.archetypes).length}`)),
      h("div", {className: "grid"}, ...Object.entries(app.archetypes).map(([id, a]) =>
        h("a", {className: "tile", href: `./recipe-${slug(id)}.html`, key: id},
          h("strong", null, recipeTitle(id)),
          h("p", null, (a.capabilities || []).slice(0, 4).join(" · ")),
          h("div", {style: {...row, marginTop: "var(--space-2)"}}, ...a.patterns.slice(0, 4).map(chip)))))),
    h("section", {className: "block", id: "application"}, h("h2", null, "Application patterns",
      h("span", {className: "count"}, ` ${Object.keys(app.patterns).length}`)),
      patternCards(app.patterns)),
    h("section", {className: "block", id: "operational"}, h("h2", null, "Operational patterns",
      h("span", {className: "count"}, ` ${Object.keys(op.patterns).length}`)),
      patternCards(op.patterns))),
    h(A.TableOfContents, {items: toc}));
}

// DTCG: cada folha tem $value/$type. Achatar em "grupo.nome" mantém a leitura do JSON.
// O `$value` de um token COMPOSTO é objeto — cor, dimensão, sombra, duração. `String(v.$value)`
// imprimia `[object Object]` em 198 das 261 linhas desta página; quem serializa é o mesmo
// `serialize()` que emite o CSS, para não haver duas verdades sobre o mesmo arquivo.
// `name` É O CAMINHO, e não o nome da variável — a distinção custou a página inteira. Medido em
// 15/08/2026: os 261 chips mostravam `--base-brand-yellow`, `--theme-dark-chart-1` e afins, e
// NENHUM desses 261 existe no CSS. O `build-tokens.mjs` emite a FOLHA (`--brand-yellow`) sob o
// seletor do grupo; o caminho nunca foi nome de nada. Consequência medida no navegador: as **153**
// amostras de cor computavam `rgba(0,0,0,0)` — caixas vazias — e as **84** réguas caíam todas em
// `auto`, medindo o mesmo. Uma página de referência de token inteira mostrando o valor errado, e
// gate nenhum via, porque o check 17 pergunta se existe conteúdo, não se ele diz a verdade.
//
// Por isso saem TRÊS campos agora: `path` (para a chave da linha), `varName` (o nome REAL) e
// `scope` (o grupo). Os três existem porque a folha sozinha NÃO identifica a linha: medido, 70 dos
// 175 nomes aparecem em mais de um grupo — `chart-1` é dark E light, `control-h-md` é base E as
// três densidades. Isso não é ambiguidade a esconder: é como o CSS funciona, e a página passa a
// dizer sob qual seletor cada valor vale.
function flattenTokens(node, path = []) {
  const out = [];
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$")) continue;
    if (v && typeof v === "object" && "$value" in v) {
      out.push({path: [...path, k].join("-"), varName: k, scope: path.join("."),
                value: serialize(v.$type, v.$value), type: v.$type});
    } else if (v && typeof v === "object") out.push(...flattenTokens(v, [...path, k]));
  }
  return out;
}

// O seletor de cada grupo sai do PRÓPRIO arquivo de tokens (`$extensions.ui.aurea.selectors`), que
// é a mesma fonte que o `build-tokens.mjs` usa para emitir o CSS. Escrever um segundo mapa aqui
// seria a segunda verdade que este arquivo acabou de aprender a não ter.
const SELETORES = tokensDoc.$extensions["ui.aurea"].selectors;
// `[data-theme="dark"]` → `{"data-theme": "dark"}`. O atributo vai na PRÓPRIA amostra, e é o que
// faz `var(--chart-1)` resolver no valor que aquela linha documenta em vez de no tema da página.
// É a cascata funcionando como foi desenhada, em vez de contornada.
// UM OU MAIS ATRIBUTOS. Era um só até 20/08/2026, quando a marca `lory` entrou e trouxe
// `[data-brand="lory"][data-theme="dark"]` — duas condições, porque marca e tema são eixos
// independentes. Casar um par de cada vez faz a amostra carregar os DOIS atributos, e é isso que
// a linha precisa para resolver o valor que ela documenta em vez do tema da página.
function atributosDoEscopo(scope) {
  const sel = SELETORES[scope];
  if (!sel || sel === ":root") return {};
  const pares = [...sel.matchAll(/\[([a-z-]+)="([^"]+)"\]/g)];
  if (!pares.length || pares.reduce((n, m) => n + m[0].length, 0) !== sel.length) {
    throw new Error(`seletor de grupo em forma inesperada: ${scope} → ${sel}`);
  }
  return Object.fromEntries(pares.map(m => [m[1], m[2]]));
}

function tokensPage() {
  const all = flattenTokens(tokensDoc);
  const groups = [...new Set(all.map(t => t.type || "other"))].sort();
  const toc = groups.map(g => ({id: `type-${slug(g)}`, label: g}));
  return h("div", {className: "page-grid"}, h("div", {className: "page-main"},
    h("header", {className: "page-head"},
      h("h1", null, "Tokens"),
      h("p", {className: "page-lede"}, `${all.length} tokens in DTCG format ($value / $type) — the single source of the identity. The CSS is one output of this file, not the origin: no visual value is born outside a token.`)),
    ...groups.map(g => {
      const list = all.filter(t => (t.type || "other") === g);
      return h("section", {className: "block", key: g, id: `type-${slug(g)}`},
        h("h2", null, g, h("span", {className: "count"}, ` ${list.length}`)),
        h(A.Table, {caption: `${g} tokens`},
          h("thead", null, h("tr", null, h("th", null, "Token"), h("th", null, "Applies under"),
            h("th", null, "Value"), h("th", null, "Preview"))),
          h("tbody", null, ...list.map(t => h("tr", {key: t.path},
            h("td", null, h("code", {className: "chip"}, `--${t.varName}`)),
            // A coluna existe porque o nome sozinho NÃO identifica a linha: 70 dos 175 nomes valem
            // em mais de um grupo. Mostrar o seletor é a resposta honesta a "quando este valor
            // vale" — e é literalmente o que está no CSS gerado.
            h("td", null, h("code", {style: {fontSize: "var(--text-xs)", color: "var(--muted-foreground)"}},
              SELETORES[t.scope] || ":root")),
            h("td", null, h("code", {style: {fontSize: "var(--text-xs)", color: "var(--muted-foreground)"}}, t.value)),
            // O atributo de escopo vai na PRÓPRIA amostra. Sem ele, a linha de `theme.light` era
            // pintada com o valor de `dark` numa página escura — mentira mais discreta que a caixa
            // vazia, e por isso pior.
            h("td", null, g === "color"
              ? h("span", {className: "swatch", ...atributosDoEscopo(t.scope), style: {background: `var(--${t.varName})`}})
              : g === "dimension"
              ? h("span", {className: "ruler", ...atributosDoEscopo(t.scope), style: {inlineSize: `var(--${t.varName})`}})
              : h("span", {style: {color: "var(--subtle-foreground)"}}, "—")))))));
    })),
    h(A.TableOfContents, {items: toc}));
}

// A página dos hooks. Não é item do modelo (ADR-0001) e é índice de área, como Tokens: o par
// preview+código do modelo não cabe aqui, porque hook não tem prévia estática — `useToast` só
// existe quando alguém clica, e uma caixa vazia com legenda seria o defeito do Chart de novo.
// O que ele tem é assinatura, exemplo e o que NÃO fazer, que é onde hook machuca.
function hooksPage() {
  const toc = hooks.map(g => ({id: slug(g.name), label: g.name}));
  return h("div", {className: "page-grid"}, h("div", {className: "page-main"},
    h("header", {className: "page-head"},
      h("h1", null, "Hooks"),
      h("p", {className: "page-lede"}, `${hooks.length} public hooks. They are API like any component `
        + `— they just have no registry card, because a card describes a component. Everything below `
        + `was read from the source file named on each one.`)),
    ...hooks.map(g => h("section", {className: "block", key: g.name, id: slug(g.name)},
      h("h2", null, g.name),
      // O caminho fica FORA do título e fora do `.chip`. Medido a 320px: dentro do chip ele
      // estourava o `<h2>`, e não adianta `overflow-wrap` — `.chip` é `inline-flex` com
      // `line-height:1`, uma caixa que não quebra por definição. Caminho de arquivo é conteúdo,
      // não etiqueta; num `<code>` de parágrafo ele quebra sozinho.
      h("p", {style: {...muted, marginTop: 0}},
        h("code", {style: {fontSize: "var(--text-xs)", overflowWrap: "anywhere"}}, g.source)),
      h("p", {style: muted}, g.lede),
      h("h3", null, "Signature"),
      h(A.CodeBlock, {language: "tsx", copyable: true}, g.signature),
      h("h3", null, "Example"),
      h(A.CodeBlock, {language: "tsx", copyable: true}, g.example),
      h("h3", null, "Notes"),
      h(A.DataList, {items: g.notes.map(([term, value]) => ({term, value}))})))),
    h(A.TableOfContents, {items: toc}));
}

// ── shell dogfooded (comum a todas as páginas) ────────────────────────────────
// O molde da documentação da referência (ADR-0067): o topo em duas linhas — a logo da Aurea, o nome e
// a versão; embaixo, as áreas do site —, o menu à esquerda e o "On this page" à direita. Tudo é peça da
// Aurea: o `AppShell` (com a coluna da direita, feita para isto no passo 4), a `Sidebar` pelos
// `navItems` e o `TableOfContents`. As áreas não levam mais contagem (era ruído; o número vai para o
// título de cada página).
const AREAS = [["Getting Started", "getting-started.html", "start"], ["Components", "components.html", "components"],
  ["Patterns", "patterns.html", "patterns"], ["Blocks", "blocks.html", "blocks"], ["Recipes", "recipes.html", "recipes"],
  ["Hooks", "hooks.html", "hooks"], ["Tokens", "tokens.html", "tokens"]];

// O MENU de cada área, como itens da `Sidebar` (grupos com título; o id do item é o arquivo dele).
// Componentes: "Overview" e a lista em ordem ALFABÉTICA, como a da referência, com os selos
// "New"/"Updated" tirados dos dados. Os hooks ficam num grupo próprio no fim.
const seloBadge = nome => { const s = seloDe(nome); return s ? h(A.Badge, {size: "xs", tone: s === "New" ? "primary" : "neutral"}, s) : undefined; };
const item = (label, href, badge) => ({id: href, label, href: `./${href}`, ...(badge ? {badge} : {})});
const alfabetico = list => [...list].sort((a, b) => a.name.localeCompare(b.name));
const menuComponentes = () => [
  {id: "overview", label: "Overview", items: [item("Getting Started", "getting-started.html"), item("All Components", "components.html")]},
  {id: "components", label: "Components", items: alfabetico(fichas.filter(f => f.kind !== "hook"))
    .map(f => item(f.name, `${slug(f.name)}.html`, seloBadge(f.name)))},
  {id: "hooks", label: "Hooks", items: alfabetico(fichas.filter(f => f.kind === "hook"))
    .map(f => item(f.name, `${slug(f.name)}.html`, seloBadge(f.name)))},
].filter(g => g.items.length);
const menuPatterns = () => [{id: "overview", label: "Overview", items: [item("All Patterns", "patterns.html")]},
  ...Object.entries(patternsByComponent).map(([cmp, list]) => ({id: `p-${slug(cmp)}`, label: cmp,
    items: list.map(p => item(p.name, `${p.slug}.html`))}))];
const menuBlocks = () => [{id: "overview", label: "Overview", items: [item("All Blocks", "blocks.html")]},
  ...Object.entries(blocksByCategory).map(([cat, list]) => ({id: `b-${slug(cat)}`, label: cat,
    items: list.map(b => item(b.name, `${b.slug}.html`))}))];
const archetypeIds = Object.keys(contract.applicationPatterns.archetypes);
const menuRecipes = () => [{id: "overview", label: "Overview", items: [item("All Recipes", "recipes.html")]},
  {id: "archetypes", label: "Archetypes", items: archetypeIds.map(id => item(recipeTitle(id), `recipe-${slug(id)}.html`))}];
const MENUS = {start: menuComponentes, components: menuComponentes, hooks: menuComponentes, tokens: menuComponentes,
  patterns: menuPatterns, blocks: menuBlocks, recipes: menuRecipes};

const D = "M510 80 A420 420 0 0 1 920 490 C770 475 645 405 585 315 C535 240 510 150 510 80 Z";
// A LOGO da Aurea, as quatro pétalas amarelas (ordem do Victor, 13/10/2026: "não a perca").
const mark = h("svg", {width: 26, height: 26, viewBox: "0 0 1000 1000", "aria-hidden": "true", style: {flex: "none"}},
  [0, 90, 180, 270].map(r => h("path", {key: r, d: D, fill: "var(--primary)", transform: `rotate(${r} 500 500)`})));

// O BOTÃO "THEME" (o Victor, 14/10/2026: "crie um botão tema como da [referência]"): a escolha de tema da referência — o
// botão pequeno com o balde de tinta e "Theme", que abre a janelinha com as amostras redondas e o nome embaixo. Na
// Aurea os "temas" são as MARCAS (ADR-0036). Ele é vivo (a `Popover` da Aurea): quem monta é o `search.js`, sobre
// este lugar; aqui sai o botão parado, igual ao vivo, para a barra não pular. As cores vêm dos TOKENS — a da marca
// em hex, que é o que a `ColorSwatch` lê para pôr o "visto" claro ou escuro.
const hexDoToken = t => linearSrgbParaHex(oklchParaLinearSrgb(t.$value.components));
const MARCAS = [{id: "", label: "Aurea", color: hexDoToken(tokensDoc.base["brand-yellow"])},
  {id: "lory", label: "Lory", color: hexDoToken(tokensDoc.brand.lory.dark.primary)}];
// A MESMA CAIXA DOS VIZINHOS (o Victor, 15/10/2026: "por que os ícones da direita estão tamanhos diferentes?"): o `sm`
// (32), como os outros botões do topo — na referência são todos de 32 a 34, com fundo. A letra fica a do `sm` (14): a
// referência põe 12 nesse botão com um ajuste só dela, e na Aurea isso é mudança de peça (a lista da "Pergunta 7").
const botaoTema = () => h("span", {id: "site-theme-root", className: "site-theme", "data-brands": JSON.stringify(MARCAS)},
  h(A.Button, {size: "sm", variant: "tertiary", leadingIcon: "paint-bucket", "aria-label": "Theme"}, "Theme"));

// O GITHUB no topo, por último, como o da referência (o Victor, 15/10/2026: "adicione também o ícone lá em cima do
// github"): o botão redondo da busca, com o logo oficial — o `IconButton` aceita o desenho do app desde 15/10/2026.
// Sem o número de estrelas, pelo mesmo motivo da nota do Início.
// No celular ele sai da barra (a `hide-below-md` do core): com os botões de 44 da Aurea a barra quebrava em duas
// linhas (medido em 375). A referência o põe dentro do menu do celular; o menu do `Header` só leva os links do site.
const botaoGitHub = () => h(A.IconButton, {icon: GitHub, label: "GitHub", variant: "tertiary", size: "sm", href: REPO, className: "hide-below-md"});

function topoDoSite(section) {
  // SEM a versão ao lado da logo (o Victor, 15/10/2026: "do topo retire a versão"), como na referência; ela continua
  // no selo da abertura do Início. O nome, com 16 em peso 600, como o dela.
  const brand = h("a", {href: "./index.html", className: "site-brand"}, mark, h("strong", null, "Aurea"));
  // O TOPO DO INÍCIO é o da página inicial da referência (o Victor, 14/10/2026: "as opções na página inicial devem
  // ficar com a logo, e não na linha de baixo"): o `Header` com `items` — os links na MESMA linha, colados na marca
  // (`itemsJustify="start"`) — e as ações na outra ponta. No celular os links vão para o menu do próprio `Header`.
  if (section === "home") {
    return {brand, home: {
      items: AREAS.map(([label, href, id]) => ({id, label, href: `./${href}`})),
      actions: h(Fragment, null,
        h(A.IconButton, {icon: "magnifying-glass", label: "Search", variant: "tertiary", size: "sm",
          href: "./components.html", "data-site-search": "", "aria-keyshortcuts": "Control+K"}),
        botaoTema(),
        h(A.Button, {variant: "tertiary", size: "sm", className: "btn-icon", id: "theme-toggle", "aria-label": "Toggle light / dark theme"},
          h(A.Icon, {name: "sun", weight: "fill", className: "t-sun"}),
          h(A.Icon, {name: "moon", weight: "fill", className: "t-moon"})),
        botaoGitHub())}};
  }
  const topbar = h(Fragment, null,
    // A BUSCA (ADR-0067; o Victor, 13/10/2026: "faltou o buscar"): o botão da referência, com o atalho
    // à mostra. Quem abre é o `search.js` (a `CommandPalette` da Aurea, viva), com Ctrl+K ou o clique;
    // sem JavaScript o botão leva ao catálogo, onde está a lista inteira. No Início, como no da
    // referência, a busca é SÓ o ícone, junto das outras chaves (o Victor, 13/10/2026).
    h(A.Button, {variant: "tertiary", leadingIcon: "magnifying-glass", kbd: "Ctrl K",
      className: "site-search", href: "./components.html", "data-site-search": ""}, "Search"),
    h("span", {className: "site-actions"},
      // A MARCA (20/08/2026, ADR-0036) ao lado do tema, porque são o mesmo tipo de chave — desde 14/10/2026 no botão
      // "Theme" da referência, e não mais numa caixa de seleção.
      botaoTema(),
      // toggle de tema: dois ícones, o CSS mostra o oposto do tema atual; catalog.js alterna.
      h(A.Button, {variant: "tertiary", size: "sm", className: "btn-icon", id: "theme-toggle", "aria-label": "Toggle light / dark theme"},
        h(A.Icon, {name: "sun", weight: "fill", className: "t-sun"}),
        h(A.Icon, {name: "moon", weight: "fill", className: "t-moon"})),
      botaoGitHub()),
    // AS ÁREAS POR ÚLTIMO NO CÓDIGO, porque aparecem na segunda linha. Vinham primeiro e desciam por `order:3`:
    // o Tab ia da marca para a linha de baixo e voltava para a busca, em cima (WCAG 2.4.3; a trava
    // `ordem-de-foco.spec.ts` pegou nas 410 páginas, 14/10/2026).
    h("nav", {"aria-label": "Sections", className: "site-areas"},
      ...AREAS.map(([label, href, id]) => h("a", {key: id, className: "site-area", href: `./${href}`,
        ...(id === section ? {"aria-current": "page"} : {})}, label))));
  return {brand, topbar};
}

// O índice da página vai para a coluna da direita. As páginas de ÁREA ainda montam o próprio
// `page-grid` com o `TableOfContents` dentro: aqui ele é separado, sem reescrever as cinco.
function separarToc(inner) {
  if (inner && !React.isValidElement(inner) && inner.node) return inner;
  const filhos = React.Children.toArray(inner?.props?.children);
  if (inner?.props?.className === "page-grid" && filhos.length === 2 && filhos[1].props?.items) {
    return {node: filhos[0].props.children, toc: filhos[1].props.items};
  }
  return {node: inner, toc: []};
}

function shell(activeHref, inner, section = "components") {
  const {node, toc} = separarToc(inner);
  const {brand, topbar, home} = topoDoSite(section);
  // O sprite é INLINE nesta página (external <use> via file:// esbarra em CORS), então a base é vazia.
  if (section === "home") {
    // O Início da referência não tem menu: o topo e o conteúdo, sem o AppShell (que sempre desenha a lateral).
    return renderToStaticMarkup(h(A.AureaProvider, {spriteUrl: ""}, h("div", {className: "site-home"},
      h("a", {className: "skip-link", href: "#main"}, "Skip to content"),
      // `maxWidth="2xl"` (o Victor, 15/10/2026: no monitor de 24" o topo ia para os cantos, e o da referência fica no
      // centro, com 1400 de largura). A escala do `Container` não tem 1400; o `2xl` (1536) fica mais perto nas duas
      // telas medidas: a logo a 32 da borda em 1440 (a dela, 36) e a 215 em 1902 (a dela, 276) — o `xl` daria 104 e 343.
      h(A.Header, {variant: "flush", brand, className: "site-top", items: home.items, actions: home.actions,
        itemsJustify: "start", maxWidth: "2xl", navLabel: "Sections"}),
      h("main", {id: "main", tabIndex: -1}, node))));
  }
  const menu = (MENUS[section] || menuComponentes)();
  return renderToStaticMarkup(h(A.AureaProvider, {spriteUrl: ""},
    // A lateral da esquerda é a superfície FLUTUANTE da Aurea (o Victor, 13/10/2026: "sidebar precisa ser o
    // nosso flutuante"), com a barra de rolagem clara que só aparece com o ponteiro em cima (o padrão da
    // `Sidebar` desde a 0.32.0); a da direita, o "On this page", é a variante SEM CAIXA (`asideVariant:
    // "plain"`) — variante do componente, e não regra do site (o Victor, 13/10/2026: "não edite componente
    // nosso, deve sempre criar novas variações").
    h(A.AppShell, {brand, topbar, topbarVariant: "flush", contentVariant: "plain",
      navItems: menu, currentNavId: activeHref || undefined, navLabel: "Contents", className: "site-shell",
      ...(toc.length ? {aside: h(A.TableOfContents, {items: toc}), asideLabel: "On this page", asideVariant: "plain"} : {})},
      node)));
}

// ── assets: catalog.css (fontes+core+chrome) e catalog.js (abas+tema) ─────────
const fontsCss = readFileSync(join(root, "packages/fonts/dist/fonts.css"), "utf8")
  .replace(/url\("\.\.\/files\/([^"]+)"\)/g, (_, file) =>
    `url("data:font/woff2;base64,${readFileSync(join(root, "packages/fonts/files", file)).toString("base64")}")`);
const coreCss = readFileSync(join(root, "packages/core/dist/aurea.css"), "utf8");
// A folha ESTRUTURAL do motor de grafo, exatamente como o `install` do DependencyGraph manda o
// consumidor fazer — e o catálogo É um consumidor. Só o `base.css`: o `style.css` é a identidade
// deles (raio 3px, #1a192b, sombras) e nunca entra. Sem isto, `.react-flow__node` não é
// `position:absolute` e os cinco nós descem em cascata pela página, cada um 67px abaixo do
// anterior — medido no navegador em 09/08/2026, e foi o que sobrou depois de o SSR já estar
// certo. Ela entra ANTES da camada `aurea` para que o nosso token continue mandando na cor.
const grafoCss = readFileSync(join(root, "node_modules/@xyflow/react/dist/base.css"), "utf8");
const sprite = readFileSync(join(root, "packages/icons/dist/aurea-icons.svg"), "utf8");
// O sprite embutido leva os glifos que as páginas REALMENTE usam — e agora isso é MEDIDO no
// HTML emitido (`#i-<nome>`), não uma lista escrita à mão. A lista à mão desatualizava sozinha:
// um exemplo novo com ícone fora dela renderizava um <use> para um símbolo inexistente, ou
// seja um ícone invisível — e nenhum gate pega isso, porque o sprite é inline e não há 404.
function spriteFor(htmls) {
  const usados = [...new Set(htmls.flatMap(x => [...x.matchAll(/#i-([a-z0-9-]+)/g)].map(m => m[1])))].sort();
  const faltando = usados.filter(id => !sprite.includes(`<symbol id="i-${id}"`));
  if (faltando.length) throw new Error(`sprite: glifo(s) inexistente(s) no pacote de ícones: ${faltando.join(", ")}`);
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${
    usados.map(id => sprite.match(new RegExp(`<symbol id="i-${id}"[\\s\\S]*?</symbol>`))[0]).join("")}</svg>`;
}

const chrome = `
/* Catálogo — chrome próprio mínimo; o resto é componente Aurea. Espaçamento tokenizado. */
/* A lateral NÃO encolhe abaixo de 1366px como a dos docs: os rótulos aqui são nomes de
   componente (o maior, CommandPaletteShell, pede 167px) e cortar nome de componente num
   catálogo de componentes é inaceitável. 264px = o valor padrão do token. */
/* ADR-0067: o menu da esquerda e o "On this page" com a largura da referência (220, medida a 1440). */
.app-shell.site-shell { --sidebar-width:13.75rem; }
.page-head { display:grid; gap:var(--space-3); margin-bottom:var(--space-6); }
/* A linha QUEBRA: sem isso o botão "Copy Markdown" espremia o título a 81px no celular, e ele quebrava no meio da
   palavra (14/10/2026). Agora o botão desce quando não cabe ao lado. */
.page-head-row { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:var(--space-4); }
.page-pills { display:flex; flex-wrap:wrap; gap:var(--space-2); }
/* overflow-wrap:anywhere — nome de componente é uma palavra só e pode ser longa
   ("CommandPaletteShell" mede 315px no display serif): a 320px ela empurrava a página e
   fazia a única rolagem lateral que sobrou na varredura. Palavra quebrada é melhor que
   layout quebrado, e a regra do projeto é nunca rolar de lado. */
.page-head h1 { margin:0; font-family:var(--font-heading); font-size:var(--text-3xl); line-height:var(--text-3xl-leading); font-weight:var(--weight-semibold); overflow-wrap:anywhere; }
.page-lede { max-width:70ch; margin:0; color:var(--muted-foreground); font-size:var(--text-base); line-height:var(--leading-relaxed); }
.block { margin-bottom:var(--space-8); }
/* Toda seção mostra o conteúdo numa SUPERFÍCIE, com o mesmo raio do demo — é a identidade
   da Aurea (CLAUDE.md) e o que tira a sensação de peças soltas: antes o demo tinha card de
   22px, o código uma caixa de 16px e Reference/Features nada, só um fio embaixo do título.
   O fio saiu: quem separa as seções agora é o espaço e a borda da própria caixa. */
.block { display:grid; gap:var(--space-3); }
.block > h2 { margin:0; font-family:var(--font-heading); font-size:var(--text-2xl); line-height:var(--text-2xl-leading); font-weight:var(--weight-semibold); }
.usage-points { margin:0; padding-inline-start:calc(var(--space-6) + var(--space-5)); display:grid; gap:var(--space-2); color:var(--muted-foreground); line-height:var(--leading-relaxed); }
.block > pre, .block > .code-block-wrap .code-block { margin:0; padding:var(--space-6); border-radius:var(--radius-card); }
.block > dl, .block > ul { margin:0; padding:var(--space-6); border:1px solid var(--border); border-radius:var(--radius-card); background:var(--card); }
/* chip que embrulha um Status: o texto do Status já traz a cor certa, o chip só dá a
   cápsula para a linha ficar alinhada com as outras da Reference. */
.chip-status .status { font:inherit; line-height:1; min-width:0; }
/* o chip-status embrulha um Status, então quem trunca é o rótulo DELE — mesma razão do
   .chip-text: sem isto, a 320px o pill de "native: planned" perdia a borda direita. */
.chip-status .status-label { min-width:0; overflow:hidden; text-overflow:ellipsis; }
/* O índice da página acompanha a rolagem à direita, e só a partir de xl — abaixo disso a
   coluna roubaria largura do conteúdo (a referência esconde no mesmo ponto). */
.page-grid { display:grid; grid-template-columns:minmax(0,1fr); gap:var(--space-6); }
.page-grid > .toc { display:none; }
@media (min-width:1280px) { .page-grid { grid-template-columns:minmax(0,1fr) 180px; } .page-grid > .toc { display:grid; } }
.block > h2 .count { color:var(--subtle-foreground); font-family:var(--font-code); font-size:var(--text-sm); }
/* ALTURA IGUAL para todo demo, e sempre dentro da primeira tela (pedido do Victor: nada
   de rolar pra ver o demo, nem no monitor de 14"). O teto é o 32rem da referência; abaixo
   disso a caixa cede à janela — 19rem cobre topo + cabeçalho da página + respiro (o
   cabeçalho mais alto medido, o do Status, empurra o demo pra 277px). Numa mesma tela
   todos os demos continuam do mesmo tamanho, que é o ponto.
   O padding zerado é obrigatório: a .demo do core carrega --card-pad, e essa moldura de 20px
   é o que fazia o painel flutuar dentro do card em vez de preencher. */
.demo { --demo-height:clamp(14rem, calc(100dvh - 19rem), 32rem); height:var(--demo-height); display:flex; flex-direction:column; padding:0; border:1px solid var(--border); border-radius:var(--radius-card); background:var(--card); overflow:hidden; }
/* A barra de abas ocupa a largura do card e as abas dividem 50/50 — é o que a referência faz
   (medido: barra w-full, 3px de padding, dois tabs flex:1). A peça é a .segmented da
   Aurea, esticada: pele pill nossa, comportamento de segmented control. */
.demo-tabs { display:flex; padding:var(--space-2); border-bottom:1px solid var(--border); }
.demo-tabs .segmented { flex:1; display:flex; }
.demo-tabs .segmented button { flex:1; }
/* A aba ativa é a cápsula elevada da própria .segmented — SEM pintar o texto de amarelo:
   #F0B100 sobre a trilha clara do tema light dá 1.6:1 (axe), longe dos 4.5:1 do AA. */
.demo-lede { margin:0 0 var(--space-3); }
/* O painel toma o que sobra da altura fixa e rola por dentro — quem rola é ele, nunca o
   card. min-height:0 destrava o encolher do flex, senão o conteúdo empurra a caixa. */
.demo-panel { flex:1; min-height:0; overflow:auto; padding:var(--space-6); }
/* --surface-inset de novo: o token do tema claro deixou de ser alias de --secondary (era a
   causa do botão secondary desaparecer dentro do painel), então já afunda sem colidir. */
.demo-panel[data-panel="preview"] { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:var(--space-4); background:var(--surface-inset); }
/* O painel de código é o CodeBlock copiável do core, sem moldura própria: o card já é a
   moldura. Copiar, rolagem interna e o check de confirmação vêm do componente. */
.demo-code { display:flex; padding:0; overflow:hidden; }
.demo-code .code-block-wrap { flex:1; }
.demo-code .code-block { padding:var(--space-6); border:0; border-radius:0; }
/* preview em documento próprio (só o AppShell hoje): o iframe ocupa o painel inteiro e o painel
   larga o padding — a moldura já é o card, e o shell lá dentro tem a margem dele. */
.demo-panel:has(> .demo-frame) { padding:0; }
.demo-frame { flex:1; align-self:stretch; width:100%; min-height:0; border:0; border-radius:var(--radius-card); }
.example { display:grid; gap:var(--space-3); margin-top:var(--space-5); }
.example h3 { margin:0; font-family:var(--font-heading); font-size:var(--text-xl); line-height:var(--text-xl-leading); font-weight:var(--weight-semibold); }
.facts { display:grid; grid-template-columns:auto minmax(0,1fr); gap:var(--space-3) var(--space-5); margin:0; }
.facts dt { color:var(--subtle-foreground); font-weight:500; }
.facts dd { margin:0; }
/* Altura ÚNICA para todo chip: antes o .chip era inline-block com line-height 1.6 e o
   .chip-status era flex com o Status dentro — 25,19px contra 25,59px na mesma fila
   (auditoria 26/07, A4). A moldura já era igual; o que faltava era travar a caixa. */
/* white-space:nowrap fecha a outra metade do A4 de 26/07: o line-height 1 acima resolveu
   a herança, mas o rótulo longo ("value / defaultValue") ainda embrulhava em duas linhas e
   o chip media 26px numa fila de 24px. Altura de componente não depende do texto.
   (Sem backtick neste comentário: ele vive DENTRO de um template literal.) */
.chip { display:inline-flex; align-items:center; min-height:var(--space-6); padding:0 var(--space-2); border:1px solid var(--border); border-radius:var(--radius-control); background:var(--secondary); color:var(--secondary-foreground); font:var(--text-xs)/1 var(--font-code); white-space:nowrap; max-width:100%; text-decoration:none; }
.chip-text { min-width:0; overflow:hidden; text-overflow:ellipsis; }
a.chip-link:hover { color:var(--primary); border-color:var(--primary-outline); }
/* a bala da lista entra na caixa: o recuo dela soma ao padding da superfície. */
.features { display:grid; gap:var(--space-2); padding-inline-start:calc(var(--space-6) + var(--space-5)); color:var(--muted-foreground); line-height:1.6; }
/* .grid saiu daqui na Fase 11 (achado A13) e passou a vir do CORE. Esta redefinicao era o
   motivo de o componente Grid parecer pronto em toda pagina deste catalogo e chegar sem nada
   no consumidor: funcionava na nossa documentacao e em lugar nenhum. O teste real da regra do
   core e' esta pagina continuar identica ao pixel — 15rem == 240px. */
.tile { display:block; padding:var(--space-4); border:1px solid var(--border); border-radius:var(--radius-card); background:var(--card); color:inherit; text-decoration:none; }
.tile:hover { border-color:var(--primary-outline); }
.tile p { margin:var(--space-2) 0 0; color:var(--muted-foreground); font-size:var(--text-sm); }
/* amostra de token: cor num quadrado de raio de controle, dimensão numa régua da largura
   do próprio valor — a prova visual vem do token, não de um número copiado à mão. */
.swatch { display:block; inline-size:var(--space-10); block-size:var(--space-6); border:1px solid var(--border); border-radius:var(--radius-sm); }
.ruler { display:block; block-size:var(--space-2); max-inline-size:100%; border-radius:var(--radius-full); background:var(--primary); }
.prevnext { display:flex; justify-content:space-between; gap:var(--space-4); margin-top:var(--space-8); }
.pn { display:flex; flex-direction:column; gap:var(--space-05); padding:var(--space-4); border:1px solid var(--border); border-radius:var(--radius-card); background:var(--card); color:inherit; text-decoration:none; min-width:0; }
.pn-next { text-align:end; margin-inline-start:auto; }
.pn small { color:var(--muted-foreground); }
.pn > span { color:var(--muted-foreground); font-size:var(--text-sm); }
/* Nome de componente é UMA palavra longa ("CommandPalette", "ConfirmDialog") e não quebra
   sozinho: a 320px, com a escala de letra da 0.8.8, os dois cartões somavam mais que a coluna
   e a PÁGINA rolava de lado 4–11px. Quando os dois não cabem lado a lado, o de "Next" desce
   para a linha de baixo — quebrar o nome no meio ("Breadc/rumb") foi tentado e fica pior. O
   o break-word é só a rede para um nome maior que a coluna inteira: ele não muda a largura
   mínima do cartão, então não impede a descida. No desktop nada muda: lá os dois cabem. */
.prevnext { flex-wrap:wrap; }
.pn strong { overflow-wrap:break-word; }
.pn:hover { border-color:var(--primary-outline); }
/* toggle de tema: mostra o ícone do tema PRA ONDE VAI (no dark, a lua… não — o sol, "ir pro claro"). */
/* ── O MOLDE NOVO (ADR-0067) ─────────────────────────────────────────────────────────────────
   O topo em duas linhas: em cima, a logo, o nome e a versão, a BUSCA no meio (como a da referência, 400 de
   largura) e as ações; embaixo, as áreas do site. */
.site-shell > .topbar, .site-top { flex-wrap:wrap; row-gap:0; }
.site-brand { display:flex; align-items:center; gap:var(--space-2); color:inherit; text-decoration:none; }
.site-brand strong { font-size:var(--text-base); font-weight:var(--weight-semibold); }
.site-actions { display:flex; align-items:center; gap:var(--space-2); }
.site-areas { flex-basis:100%; display:flex; flex-wrap:wrap; gap:var(--space-5); padding-block:var(--space-2); }
.site-search { inline-size:min(100%, 25rem); margin-inline:auto; justify-content:flex-start; }
.site-search .kbd { margin-inline-start:auto; }
.site-area { padding-block:var(--space-1); border-bottom:var(--focus-width) solid transparent; color:var(--muted-foreground); font-size:var(--text-sm); font-weight:var(--weight-medium); text-decoration:none; }
.site-area:hover { color:var(--foreground); }
.site-area[aria-current="page"] { color:var(--foreground); border-bottom-color:var(--primary); }
/* O conteúdo com a largura da referência (912, 816 úteis com o respiro de 48). */
.site-shell > .content { max-width:57rem; padding:var(--space-8) var(--space-12) var(--space-4); }
/* "Related Components" em cartões, e o "All Components" em grade de 3, como a referência. */
.related-grid, .cat-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 15rem), 1fr)); gap:var(--space-4); }
.cat-grid { gap:var(--space-10) var(--space-4); }
.related-card { display:grid; gap:var(--space-1); padding:var(--space-4); border:var(--border-width) solid var(--border); border-radius:var(--radius-card); background:var(--card); color:inherit; text-decoration:none; }
a.related-card:hover { border-color:var(--primary-outline); }
.related-card span { color:var(--muted-foreground); font-size:var(--text-sm); }
.cat-card { position:relative; display:grid; gap:var(--space-2); }
/* O componente de verdade, parado (elemento nosso): inerte, recortado na caixa e um pouco menor. */
.cat-card-preview { display:flex; align-items:center; justify-content:center; aspect-ratio:4 / 3; padding:var(--space-4); overflow:hidden; border:var(--border-width) solid var(--border); border-radius:var(--radius-card); background:var(--surface-inset); zoom:.8; }
.cat-card-icon { color:var(--muted-foreground); }
.cat-card-foot { display:flex; align-items:center; gap:var(--space-2); }
.cat-card-name { color:var(--foreground); font-weight:var(--weight-medium); text-decoration:none; }
/* O link cobre o cartão inteiro: a prévia não mora DENTRO dele (botão dentro de <a> é HTML inválido). */
.cat-card-name::after { content:""; position:absolute; inset:0; border-radius:var(--radius-card); }
.cat-card:hover .cat-card-preview { border-color:var(--primary-outline); }
.cat-card-name:focus-visible { outline:none; }
.cat-card-name:focus-visible::after { outline:var(--focus-width) solid var(--focus); outline-offset:var(--focus-offset); }
/* O Início: o título centralizado em duas linhas (a segunda esmaecida), o texto, dois botões e a vitrine. */
.site-home main { display:grid; justify-items:center; padding:var(--space-12) var(--space-4); }
/* A vitrine com os 1200 da referência (15/10/2026): o 1280 da escala menos o --space-20. */
.home { display:grid; gap:var(--space-12); width:min(100%, calc(var(--breakpoint-xl) - var(--space-20))); }
/* As medidas do início da referência (lidas na página dela, 14/10/2026, a 1440): 16 entre as peças, o título e o texto
   colados, e o texto com 18 de letra em 28 de linha (o Victor: "as linhas estão distantes, deixe como a referência"). */
/* Os vãos e as letras da referência, nas três larguras dela (lidos no código e medidos, 15/10/2026): o selo e o título
   a 8 (16 a partir de 1024); o texto colado no título; os botões a 16; a nota a 8 (16 a partir de 1024). O título 30/36
   no celular, 36/40 a partir de 640 e 48/48 a partir de 1024; o texto 16/24, e 18/28 a partir de 768, em 672 de largura
   (o 640 da escala mais o --space-8). A segunda linha do título fica no cinza da Aurea (7,3:1): a da referência apaga
   até ~4,4:1, e a Aurea é de baixa visão. As letras do título, juntas pelo --tracking-tight da Aurea. */
.home-hero { display:grid; justify-items:center; text-align:center; }
.home-texto { display:grid; justify-items:center; margin-block-start:var(--space-2); }
.home-hero h1 { margin:0; font-family:var(--font-heading); font-size:var(--text-3xl); line-height:var(--text-3xl-leading); font-weight:var(--weight-bold); letter-spacing:var(--tracking-tight); text-wrap:balance; }
.home-hero h1 span { color:var(--muted-foreground); }
.home-texto > p { max-width:calc(var(--breakpoint-sm) + var(--space-8)); margin:0; color:var(--muted-foreground); font-size:var(--text-base); line-height:var(--leading-normal); text-wrap:balance; }
.home-acoes { margin-block-start:var(--space-4); }
.home-hero > .home-nota { display:inline-flex; align-items:center; gap:var(--space-2); margin-block-start:var(--space-2); color:var(--muted-foreground); font-size:var(--text-xs); line-height:var(--space-4); text-decoration:none; }
.home-hero > .home-nota:hover { color:var(--foreground); }
@media (min-width:640px) { .home-hero h1 { font-size:var(--text-4xl); line-height:var(--text-4xl-leading); } }
@media (min-width:768px) { .home-texto > p { font-size:var(--text-lg); line-height:var(--text-lg-leading); } }
@media (min-width:1024px) { .home-texto, .home-hero > .home-nota { margin-block-start:var(--space-4); } .home-hero h1 { font-size:var(--text-5xl); line-height:var(--leading-none); } }
.home-selo { display:inline-flex; border-radius:var(--radius-control); text-decoration:none; }
/* O conteúdo da vitrine centrado na caixa, com os 32 de respiro da referência em cima e embaixo (16 do cartão + 16). */
.home-painel-miolo { display:flex; justify-content:center; padding-block:var(--space-4); }
/* O logo do GitHub só em preto ou branco, os oficiais (a regra do GitHub): branco no escuro, preto no claro. */
.site-github-ink { fill:#fff; }
[data-theme="light"] .site-github-ink { fill:#000; }
.home-acoes { display:flex; flex-wrap:wrap; justify-content:center; gap:var(--space-3); }
.home-vitrine { display:grid; gap:var(--space-4); }
/* As abas no CANTO, como na referência: começam na borda da caixa de baixo, 8 para dentro (o Victor, 14/10/2026). */
.home-abas { justify-self:start; margin-inline-start:var(--space-2); }
[data-theme="dark"] #theme-toggle .t-moon { display:none; }
[data-theme="light"] #theme-toggle .t-sun { display:none; }
`;

// O catálogo NÃO tem comportamento próprio: abas (setas/Home/End), copiar e o índice que
// se marca sozinho vêm do aurea.js do core, o mesmo que qualquer consumidor carrega. O que
// sobra aqui é a cola do tema, e ela chama window.Aurea.toggleTheme().
const coreJs = readFileSync(join(root, "packages/core/dist/aurea.js"), "utf8");
const catalogJs = `${coreJs}
// O preview que mora em documento próprio (iframe) não herda o tema: cada documento tem o seu
// data-theme. Ele pede o tema ao carregar, e recebe de novo a cada troca.
const espelhaTema = alvo => (alvo ? [alvo] : [...document.querySelectorAll("iframe.demo-frame")]
  .map(f => f.contentWindow)).forEach(w => w && w.postMessage({aureaTheme: document.documentElement.dataset.theme,
    aureaBrand: document.documentElement.dataset.brand || ""}, "*"));
addEventListener("message", e => { if (e.data && e.data.aureaThemeRequest) espelhaTema(e.source); });
// Quem GRAVA é o catálogo; quem aplica no primeiro quadro é o script inline do <head>. O core só
// troca o atributo — ver o comentário em TEMA_SALVO.
document.addEventListener("click", e => {
  if (e.target.closest("#theme-toggle")) {
    window.Aurea.toggleTheme();
    espelhaTema();
    try { localStorage.setItem("aurea-theme", document.documentElement.dataset.theme); } catch (err) {}
  }
});
// -- "Copy Markdown" (ADR-0067) -------------------------------------------------------------
// Copia o texto da pagina, que mora nela mesma num script type="application/json" (sem rede). A
// confirmacao fica no proprio botao por dois segundos, como o "copiar" do bloco de codigo.
document.addEventListener("click", e => {
  const botao = e.target.closest("[data-copy-page]");
  if (!botao) return;
  const fonte = document.getElementById("page-markdown");
  if (!fonte || !navigator.clipboard) return;
  let texto;
  try { texto = JSON.parse(fonte.textContent); } catch (err) { return; }
  navigator.clipboard.writeText(texto).then(() => {
    const alvo = [...botao.querySelectorAll("span")].filter(s => !s.querySelector("svg") && s.textContent.trim()).pop() || botao;
    const antes = alvo.textContent;
    alvo.textContent = "Copied";
    setTimeout(() => { alvo.textContent = antes; }, 2000);
  }, () => {});
});
// A MARCA troca pelo mesmo caminho do tema: atributo no <html>, gravado, espelhado nos iframes.
// Quem escolhe é o botão "Theme" (14/10/2026), vivo no search.js: ele avisa com o evento 'aurea-brand', e a
// cola é daqui, num lugar só. Valor vazio = SEM marca, e é assim que a Aurea volta a ser a Aurea: 'delete' do
// atributo, não 'data-brand="aurea"'. Marca padrão não tem nome porque não é marca — é o padrão (ADR-0036).
document.addEventListener("aurea-brand", e => {
  const marca = (e.detail && e.detail.brand) || "";
  if (marca) document.documentElement.dataset.brand = marca;
  else delete document.documentElement.dataset.brand;
  espelhaTema();
  try { localStorage.setItem("aurea-brand", marca); } catch (err) {}
});

// -- a lateral abre onde voce parou ------------------------------------------------------
// Cada pagina e um documento novo, entao a lateral remontava rolada no topo: escolher um
// componente do fim da lista e ter de descer de novo para pegar o proximo (relatado em
// 13/08/2026, junto com o tema).
//
// Enquadrar o item ATUAL, e nao restaurar o scrollTop guardado. Os dois resolvem o incomodo, e
// este tem menos peca: nao precisa de storage (logo nao depende de file://), e nao tem o modo de
// falha do outro -- chegar por busca, pelo indice ou por link direto deixaria uma posicao
// guardada que nao corresponde ao item aberto.
//
// Aritmetica em vez de scrollIntoView: scrollIntoView rola TODOS os ancestrais roláveis, e o
// documento junto -- a pagina saltaria. Aqui so o scrollTop da lateral se mexe.
//
// O aria-current e escopado a lateral porque a nav de secoes do topo tambem marca o dela.
const enquadrarLateral = () => {
  const lateral = document.querySelector(".sidebar");
  // Abaixo de 768px a lateral vira estatica (nao rola sozinha) e este guarda a desliga: sem ele,
  // mexer no scrollTop de quem nao rola e no-op, mas o calculo ja teria lido rects a toa.
  if (!lateral || lateral.scrollHeight <= lateral.clientHeight) return;
  const atual = lateral.querySelector('[aria-current="page"]');
  if (!atual) return;
  const a = atual.getBoundingClientRect(), l = lateral.getBoundingClientRect();
  // Ja visivel inteiro: nao mexer. Rolar um item que a pessoa ja esta vendo e movimento gratuito.
  if (a.top >= l.top && a.bottom <= l.bottom) return;
  // Centralizado, e nao "o mais perto possivel": o que ele faz em seguida e escolher o VIZINHO,
  // entao precisa ver o que vem antes e depois, nao o item colado na borda.
  lateral.scrollTop += a.top - l.top - (l.height - a.height) / 2;
};
enquadrarLateral();

// -- enquadrar o grafo -------------------------------------------------------------------
// O DependencyGraph renderiza inteiro no servidor (no, aresta e um fitView calculado sobre a
// EXTENSAO do layout), mas o servidor nao sabe a largura do painel de demo -- que muda com a
// janela. Sem isto o grafo sai com os primeiros nos dentro e o resto cortado pelo
// overflow:hidden: medido no catalogo, 2 de 5 visiveis numa caixa de 635px.
//
// O enquadramento e uma transformacao de viewport, e e aritmetica -- nao precisa do motor. Isto
// e chrome do CATALOGO, no mesmo lugar onde ja moram as abas e o tema; em aplicacao de verdade
// quem resolve e o fitView do proprio motor, que roda no navegador.
const enquadrarGrafos = () => {
  for (const tela of document.querySelectorAll(".dependency-graph")) {
    const viewport = tela.querySelector(".react-flow__viewport");
    const nos = [...tela.querySelectorAll(".react-flow__node")];
    if (!viewport || !nos.length) continue;
    // A posicao do no esta no transform dele, em coordenada de GRAFO -- ler dali evita medir a
    // tela ja transformada, que devolveria a conta que estamos tentando fazer.
    // DOMMatrix e nao expressao regular, e isto e cicatriz: este bloco e emitido de dentro de
    // um TEMPLATE LITERAL, e la a barra invertida de um \d desaparece antes de virar codigo.
    // A primeira versao usava regex, saiu no catalog.js como [d.] e nao casava com nada -- o
    // enquadramento simplesmente nao rodava, sem erro nenhum no console.
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const no of nos) {
      if (!no.style.transform) continue;
      const m = new DOMMatrix(no.style.transform);
      const x = m.m41, y = m.m42;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y);
      x1 = Math.max(x1, x + no.offsetWidth); y1 = Math.max(y1, y + no.offsetHeight);
    }
    if (!isFinite(x0)) continue;
    const folga = 24, larg = tela.clientWidth - folga * 2, alt = tela.clientHeight - folga * 2;
    // Nunca AMPLIA: um grafo de dois nos esticado ate encher a caixa vira caricatura.
    const escala = Math.min(larg / (x1 - x0), alt / (y1 - y0), 1);
    const dx = folga + (larg - (x1 - x0) * escala) / 2 - x0 * escala;
    const dy = folga + (alt - (y1 - y0) * escala) / 2 - y0 * escala;
    viewport.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + escala + ")";
  }
};
enquadrarGrafos();
addEventListener("resize", enquadrarGrafos);`;

// ── emitir ────────────────────────────────────────────────────────────────────
mkdirSync(join(outDir, "assets"), {recursive: true});
// O gerador escrevia por cima e nunca limpava: renomear um slug deixava a página velha no
// diretório para sempre — órfã, linkada por ninguém, e contada pelo check 13 como página do
// catálogo. Apareceu ao trocar o esquema de slug dos patterns (M11). Só .html, e só aqui:
// assets/ é escrito logo abaixo.
for (const f of readdirSync(outDir).filter(f => f.endsWith(".html"))) unlinkSync(join(outDir, f));
// O chrome entra DENTRO de @layer aurea, junto com o core: camada nomeada perde para CSS sem
// camada independente de especificidade, então um seletor fraco do chrome passaria por cima de
// um seletor específico do core. Este chrome ESPECIALIZA o core, não o consome de fora — na
// mesma camada a cascata é a de sempre. A camada existe para o consumidor EXTERNO sobrepor a
// biblioteca sem !important (Fase 6, achado M16).
// A ORDEM DE CAMADA nao e detalhe: o core mora em `@layer aurea`, e no CSS quem esta FORA de
// camada vence quem esta DENTRO — especificidade nem entra na conta. Solto, o `base.css` do
// motor sobrepunha o nosso core: o link de atribuicao ficava com o `color:#999` cravado dele e
// reprovava contraste no axe, mesmo com a nossa regra sendo MAIS especifica. Declarar `motor`
// antes de `aurea` poe o motor abaixo, que e onde ele deve estar. Vale para todo consumidor, e
// por isso esta escrito na ficha do DependencyGraph.
write(join(outDir, "assets/catalog.css"),
  `@layer motor,aurea;
${fontsCss}@layer motor{
${grafoCss}}
${coreCss}@layer aurea{
${chrome}}
`);
write(join(outDir, "assets/catalog.js"), catalogJs);
// O ÍNDICE DA BUSCA (ADR-0067): o que a `CommandPalette` do topo procura, em grupos, saído dos MESMOS dados
// das páginas — nada escrito à mão. Vai como script clássico (`window.AUREA_SEARCH`), e não como JSON
// buscado por rede, porque o site abre direto do disco e `file://` bloqueia o `fetch`.
const indiceDaBusca = [
  ...[["Getting Started", "getting-started.html"], ["All Components", "components.html"], ["Patterns", "patterns.html"],
    ["Blocks", "blocks.html"], ["Recipes", "recipes.html"], ["Hooks", "hooks.html"], ["Tokens", "tokens.html"]]
    .map(([label, href]) => ({label, href, group: "Pages"})),
  ...alfabetico(fichas.filter(f => f.kind !== "hook")).map(f => ({label: f.name, href: `${slug(f.name)}.html`, group: "Components"})),
  ...alfabetico(fichas.filter(f => f.kind === "hook")).map(f => ({label: f.name, href: `${slug(f.name)}.html`, group: "Hooks"})),
  ...patterns.map(p => ({label: `${p.component} · ${p.name}`, href: `${p.slug}.html`, group: "Patterns"})),
  ...blocks.map(b => ({label: b.name, href: `${b.slug}.html`, group: "Blocks"})),
  ...archetypeIds.map(id => ({label: recipeTitle(id), href: `recipe-${slug(id)}.html`, group: "Recipes"})),
];
write(join(outDir, "assets/search-index.js"), `window.AUREA_SEARCH = ${JSON.stringify(indiceDaBusca)};\n`);

// O tema escolhido tem de valer na PRÓXIMA página, e o catálogo são 206 documentos: cada link é
// um documento novo, que nascia sempre no `data-theme="dark"` do template. O Victor tinha de
// clicar no sol a cada componente que abria (13/08/2026).
//
// Aqui, e não no `aurea.js` do core, de propósito: gravar a preferência do usuário é decisão da
// APLICAÇÃO. Uma biblioteca que escreve no `localStorage` do consumidor sem ele pedir é uma
// biblioteca que decide por ele. O core continua só trocando o atributo; quem lembra é o catálogo.
//
// E é INLINE no <head>, antes do <body>: um script no fim da página aplicaria o tema depois do
// primeiro quadro, e a página piscaria clara antes de escurecer (ou o contrário). Por isso ele
// não vive no catalog.js.
//
// `try` porque `localStorage` LANÇA em situações reais — e a principal aqui é o modo como o
// Victor navega: `file:///C:/dev/aurea-uds/...`. Falhar em silêncio devolve o comportamento
// antigo (tema do template); estourar deixaria a página sem estilo nenhum.
const TEMA_SALVO = `<script>
try{var t=localStorage.getItem("aurea-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t;var b=localStorage.getItem("aurea-brand");if(b)document.documentElement.dataset.brand=b}catch(e){}
</script>
`;

function pageHtml(title, activeHref, inner, section = "components") {
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Aurea UDS</title>
<link rel="stylesheet" href="./assets/catalog.css">
${TEMA_SALVO}</head>
<body>${SPRITE_SLOT}${shell(activeHref, inner, section)}<script src="./assets/catalog.js"></script>
<script src="./assets/search-index.js" defer></script><script src="./assets/search.js" defer></script></body>
</html>
`;
}

// As páginas são montadas ANTES de escrever, porque o sprite é medido no HTML de todas elas.
// ADR-0067: o `index.html` é o Início; o catálogo de componentes mora em `components.html`; a
// instalação, uma vez, em `getting-started.html`.
const paginas = [
  ["index.html", pageHtml("Aurea Universal Design System", null, homePage(), "home")],
  ["getting-started.html", pageHtml("Getting Started", "getting-started.html", gettingStartedPage(), "start")],
  ["components.html", pageHtml("All Components", "components.html", componentsIndex())],
  ["patterns.html", pageHtml("Patterns", "patterns.html", patternsIndex(), "patterns")],
  ["blocks.html", pageHtml("Blocks", "blocks.html", blocksIndex(), "blocks")],
  ["recipes.html", pageHtml("Recipes", "recipes.html", recipesIndex(), "recipes")],
  ["hooks.html", pageHtml("Hooks", null, hooksPage(), "hooks")],
  ["tokens.html", pageHtml("Tokens", null, tokensPage(), "tokens")],
  ...patterns.map((p, i) => [`${p.slug}.html`, pageHtml(p.name, `${p.slug}.html`, patternPage(p, i), "patterns")]),
  ...blocks.map((b, i) => [`${b.slug}.html`, pageHtml(b.name, `${b.slug}.html`, blockPage(b, i), "blocks")]),
  ...archetypeIds.map((id, i) => [`recipe-${slug(id)}.html`,
    pageHtml(recipeTitle(id), `recipe-${slug(id)}.html`, recipePage(id, contract.applicationPatterns.archetypes[id], i, archetypeIds), "recipes")]),
  ...ordered.map((f, i) => [`${slug(f.name)}.html`, pageHtml(f.name, `${slug(f.name)}.html`, componentPage(f, i))]),
];

// O MODELO cobra o gerador aqui, na hora, antes de escrever: se uma seção obrigatória do tipo
// não saiu no HTML, o build morre. O gate de navegador (catalog-sweep) faz a outra metade — a
// que uma string não sabe fazer: cobrar que não exista seção FORA do modelo.
for (const [file, html] of paginas) {
  const tipo = pageType(file);
  if (!tipo) continue;                       // índice de área não é item (ADR-0001)
  const falta = required(tipo).filter(s => !html.includes(MARKER[s]));
  if (falta.length) throw new Error(`${file} (${tipo}): seção obrigatória ausente — ${falta.join(", ")}`);
}

// Os embeds entram na conta do sprite (usam os mesmos glifos) e são escritos junto, mas não são
// páginas do catálogo: não têm modelo, não entram na contagem e não aparecem na navegação.
mkdirSync(join(outDir, "embeds"), {recursive: true});
for (const f of readdirSync(join(outDir, "embeds")).filter(f => f.endsWith(".html"))) {
  unlinkSync(join(outDir, "embeds", f));
}
const spriteInline = spriteFor([...paginas, ...embeds].map(([, html]) => html));
for (const [file, html] of [...paginas, ...embeds]) write(join(outDir, file), html.replace(SPRITE_SLOT, spriteInline));

const rich = Object.keys(content).length;
console.log(`build-catalog: ${paginas.length} pages — ${ordered.length} components `
  + `(${rich} rich, ${Object.keys(starters).length} starters), ${patterns.length} patterns, `
  // "tokens + 4 indexes" era contagem à mão, e venceu no dia em que a área de hooks entrou.
  + `${blocks.length} blocks, ${archetypeIds.length} recipes, ${AREAS.length} areas`);
