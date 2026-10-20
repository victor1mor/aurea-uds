// MODELO DE PÁGINA DO CATÁLOGO — como DADO (ADR-0001, Fase 7, achado I2).
//
// Antes disto o modelo era código imperativo em quatro funções do gerador, e divergir era o
// caminho de menor resistência: a auditoria de 26/07/2026 mediu quatro modelos de página sem
// relação entre si nas 169 páginas — as 23 receitas sem preview e sem código, os componentes com
// duas seções, e o modelo declarado no `AUREA.md` existindo em nenhum deles.
//
// Uma fonte, dois consumidores:
//   - `scripts/build-catalog.mjs` monta as páginas a partir daqui;
//   - `tests/visual/catalog-sweep.spec.ts` cobra o conjunto nas 169 páginas.
// Sem o segundo isto é decoração — foi o que a auditoria inteira mostrou sobre regra sem gate.

// Núcleo obrigatório em TODO tipo de item. É a decisão da ADR-0001 — o consumidor tem de poder
// copiar algo de qualquer página, e saber o que ela consome — na ORDEM e com os NOMES da documentação
// da referência desde a ADR-0067 (13/10/2026): sem trilha (a página dela não tem), sem "Installation"
// por página (mora uma vez no Getting Started); o import e o exemplo moram no "Usage"; a proveniência
// ("Uses") virou os cartões de "Related Components" — OPCIONAL, porque a peça que não compõe nenhuma
// outra não tem o que listar (a "Uses" dizia isso numa frase; a referência simplesmente não mostra).
export const CORE = ["title", "usage", "preview", "code", "prevnext"];

// Extras DECLARADOS por tipo, e só estes.
//   required — sempre presente (a página não existe sem eles);
//   optional — presente quando o conteúdo existe: página pobre é conteúdo faltando, não estrutura
//     diferente. (Dizia "é o achado M8, que segue aberto". O M8 FECHOU na Parte E — `props` está
//     em todas as fichas; o que continua faltando é `features`/`examples` nos starters.) O gate
//     cobra o required e PROÍBE seção fora da união — é assim que o quinto modelo não nasce.
export const EXTRAS = {
  // A "Reference" virou "Styling Reference" e a "API", "API Reference" (ADR-0067); a "Features" deixou de
  // ser seção — os pontos entram como texto do Usage.
  component: {required: ["styling"], optional: ["api", "examples", "related"]},
  pattern: {required: [], optional: ["related"]},
  block: {required: [], optional: ["related"]},
  recipe: {required: ["composition", "capabilities", "invariants", "states"], optional: ["related"]},
};

// Como cada seção é verificável numa página EMITIDA. Mora aqui junto do modelo porque um gate
// que declara seus próprios seletores é um segundo modelo escondido.
// `preview` e `code` são os dois painéis do mesmo bloco de demo — um bloco, duas abas.
export const SELECTOR = {
  title: ".page-head h1",
  usage: "#usage",
  preview: '#preview .demo-panel[data-panel="preview"]',
  code: '#preview .demo-panel[data-panel="code"]',
  related: "#related",
  prevnext: ".prevnext",
  styling: "#styling",
  api: "#api",
  examples: "#examples",
  composition: "#composition",
  capabilities: "#capabilities",
  invariants: "#invariants",
  states: "#states",
};

// A mesma checagem, do lado do GERADOR: um pedaço de markup que a seção obriga a existir no
// HTML emitido. O gerador não tem DOM (é string), o gate tem — então cada um usa a forma que
// sabe ler, e as duas saem desta mesma tabela. O gate faz o que o gerador não consegue: cobrar
// que NÃO exista seção fora do modelo.
export const MARKER = {
  title: "<h1>",
  usage: 'id="usage"',
  preview: 'id="preview"',
  code: 'data-panel="code"',
  related: 'id="related"',
  prevnext: 'class="prevnext"',
  styling: 'id="styling"',
  api: 'id="api"',
  examples: 'id="examples"',
  composition: 'id="composition"',
  capabilities: 'id="capabilities"',
  invariants: 'id="invariants"',
  states: 'id="states"',
};

export const TYPES = Object.keys(EXTRAS);
export const required = type => [...CORE, ...EXTRAS[type].required];
export const allowed = type => [...required(type), ...EXTRAS[type].optional];

// Tipo pelo nome do arquivo emitido. O gate varre um diretório de .html e precisa saber o que
// cada página é; o gerador já sabe. Índice de área (`index`, `patterns`, `blocks`, `recipes`,
// `tokens`) não é item — é índice, e a ADR o deixa fora do modelo de propósito.
// ADR-0067: o `index.html` passou a ser o Início, e o catálogo de componentes e o Getting Started são
// índices também.
export const AREA_PAGES = ["index.html", "components.html", "getting-started.html", "releases.html", "patterns.html", "blocks.html", "recipes.html", "tokens.html",
  // `hooks.html` (16/08/2026) entra como ÍNDICE e não como item, pela mesma razão do `tokens.html`:
  // o núcleo do modelo é preview + código, e hook não tem prévia estática. `useToast` só existe
  // depois de um clique — a página traz assinatura, exemplo e limites, que é o que dá para ler.
  "hooks.html"];
// As páginas da área Getting Started (lote U, SITE-03): texto, como as da documentação da referência — não são item
// (não têm preview e código obrigatórios). A primeira é o `getting-started.html`, que já está na lista acima.
// E as notas de versão da área Releases (lote U, 19/10/2026), uma página por versão: texto também, com o mesmo leitor.
export const DOC_PREFIXES = ["docs-", "release-"];
export function pageType(file) {
  if (AREA_PAGES.includes(file) || DOC_PREFIXES.some(p => file.startsWith(p))) return null;
  // embeds/*.html são o preview de um componente de PÁGINA (AppShell) num documento próprio.
  // São páginas de verdade — passam pelos mesmos gates de a11y — e não são itens do catálogo.
  if (file.includes("/")) return null;
  if (file.startsWith("pattern-")) return "pattern";
  if (file.startsWith("block-")) return "block";
  if (file.startsWith("recipe-")) return "recipe";
  return "component";
}
