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

// Núcleo obrigatório em TODO tipo de item. É a decisão da ADR-0001: o consumidor tem de poder
// copiar algo de qualquer página, e saber onde a página está e o que ela consome.
export const CORE = ["breadcrumb", "title", "preview", "code", "installation", "uses", "prevnext"];

// Extras DECLARADOS por tipo, e só estes.
//   required — sempre presente (a página não existe sem eles);
//   optional — presente quando o conteúdo existe: página pobre é conteúdo faltando, não estrutura
//     diferente. (Dizia "é o achado M8, que segue aberto". O M8 FECHOU na Parte E — `props` está
//     em todas as fichas; o que continua faltando é `features`/`examples` nos starters.) O gate
//     cobra o required e PROÍBE seção fora da união — é assim que o quinto modelo não nasce.
export const EXTRAS = {
  component: {required: ["reference"], optional: ["api", "features", "examples"]},
  pattern: {required: [], optional: []},
  block: {required: [], optional: []},
  recipe: {required: ["composition", "capabilities", "invariants", "states"], optional: []},
};

// Como cada seção é verificável numa página EMITIDA. Mora aqui junto do modelo porque um gate
// que declara seus próprios seletores é um segundo modelo escondido.
// `preview` e `code` são os dois painéis do mesmo bloco de demo — um bloco, duas abas.
export const SELECTOR = {
  breadcrumb: ".crumb",
  title: ".page-head h1",
  preview: '#preview .demo-panel[data-panel="preview"]',
  code: '#preview .demo-panel[data-panel="code"]',
  installation: "#installation",
  uses: "#uses",
  prevnext: ".prevnext",
  reference: "#reference",
  api: "#api",
  features: "#features",
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
  breadcrumb: 'class="crumb"',
  title: "<h1>",
  preview: 'id="preview"',
  code: 'data-panel="code"',
  installation: 'id="installation"',
  uses: 'id="uses"',
  prevnext: 'class="prevnext"',
  reference: 'id="reference"',
  api: 'id="api"',
  features: 'id="features"',
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
export const AREA_PAGES = ["index.html", "patterns.html", "blocks.html", "recipes.html", "tokens.html",
  // `hooks.html` (16/08/2026) entra como ÍNDICE e não como item, pela mesma razão do `tokens.html`:
  // o núcleo do modelo é preview + código, e hook não tem prévia estática. `useToast` só existe
  // depois de um clique — a página traz assinatura, exemplo e limites, que é o que dá para ler.
  "hooks.html"];
export function pageType(file) {
  if (AREA_PAGES.includes(file)) return null;
  // embeds/*.html são o preview de um componente de PÁGINA (AppShell) num documento próprio.
  // São páginas de verdade — passam pelos mesmos gates de a11y — e não são itens do catálogo.
  if (file.includes("/")) return null;
  if (file.startsWith("pattern-")) return "pattern";
  if (file.startsWith("block-")) return "block";
  if (file.startsWith("recipe-")) return "recipe";
  return "component";
}
