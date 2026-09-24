// O extrator de ARIA — o quarto campo que sete fontes mediam com sete réguas.
//
// Depois de `data-attrs.mjs` (estado) e `teclas.mjs` (teclado), este é o mesmo defeito pela
// terceira vez, e agora com um sintoma que ele deixa óbvio: a matriz reportava que a Aurea não
// emite `label`, `invalid`, `selected`, `hidden` e `current`. Nenhum desses é atributo ARIA. São
// `aria-label`, `aria-invalid`, `aria-selected`, `aria-hidden` e `aria-current` **com o prefixo
// comido pelo extrator**.
//
//   base-ui       /'(aria-[a-z]+)'/        guarda COM prefixo
//   heroui        /"(aria-[a-z]+)"/        idem
//   radix         /(aria-[a-z]+)=/         idem
//   kibo          /\baria-([a-z]+)[=:]/    guarda SEM prefixo
//   shadcn        /\baria-([a-z]+)=/       idem
//   shark         /\baria-([a-z]+)[=:]/    idem
//   media-chrome  /aria-([a-z]+)/          idem, e sem delimitador nenhum — casa prosa e nome
//                                          de pacote (`react-aria-components` vira
//                                          `aria-components`, que apareceu em 12 células)
//
// Quatro fontes gravavam `label` e três gravavam `aria-label`, e a matriz comparava as duas
// listas como se fossem vocabulários diferentes. Mesmo campo, medidas diferentes — o §15
// acontecendo dentro do instrumento pela terceira vez.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────
// O QUE ESTE MÓDULO FAZ, e por que ele pode ser mais estrito que os outros dois:
//
// **ARIA é um vocabulário FECHADO.** Ao contrário de `data-*`, que qualquer um inventa, os
// atributos e papéis ARIA são a lista da especificação WAI-ARIA 1.2. Então aqui dá para validar
// contra a lista de verdade em vez de adivinhar por forma — e o que não está nela não é
// "atributo desconhecido", é ruído do extrator. Ele sai em `naoReconhecidos`, nunca some.
// ─────────────────────────────────────────────────────────────────────────────────────────────
//
// CONTROLE: `tests/unit/aria.test.tsx`, fixture com entrada conhecida → resultado conhecido,
// incluindo `react-aria-components` e o prefixo comido. §1b do protocolo.

/** WAI-ARIA 1.2, os atributos de estado e propriedade. Lista fechada, da especificação. */
export const ATRIBUTOS_ARIA = new Set([
  "aria-activedescendant", "aria-atomic", "aria-autocomplete", "aria-braillelabel",
  "aria-brailleroledescription", "aria-busy", "aria-checked", "aria-colcount", "aria-colindex",
  "aria-colindextext", "aria-colspan", "aria-controls", "aria-current", "aria-describedby",
  "aria-description", "aria-details", "aria-disabled", "aria-errormessage", "aria-expanded",
  "aria-flowto", "aria-haspopup", "aria-hidden", "aria-invalid", "aria-keyshortcuts",
  "aria-label", "aria-labelledby", "aria-level", "aria-live", "aria-modal", "aria-multiline",
  "aria-multiselectable", "aria-orientation", "aria-owns", "aria-placeholder", "aria-posinset",
  "aria-pressed", "aria-readonly", "aria-relevant", "aria-required", "aria-roledescription",
  "aria-rowcount", "aria-rowindex", "aria-rowindextext", "aria-rowspan", "aria-selected",
  "aria-setsize", "aria-sort", "aria-valuemax", "aria-valuemin", "aria-valuenow",
  "aria-valuetext",
]);

/** Aceita `aria-label` e `label`, e devolve sempre a forma com prefixo. */
const normalizar = (bruto) => {
  const s = String(bruto).trim().toLowerCase();
  return s.startsWith("aria-") ? s : `aria-${s}`;
};

/** `aria-x="v"` · `aria-x={v}` · `'aria-x'` · `"aria-x"` · `aria-x:` (objeto de props).
 *
 *  O olhar-para-trás `(?<![-\w])` é o que separa um atributo de verdade do MIOLO de um nome
 *  composto — em `react-aria-components` o caractere anterior é um hífen, e o pacote da heroui
 *  entrava como um atributo inexistente em 12 células.
 *
 *  E ele é LOOKBEHIND, não `[^-\w]` consumido, porque consumir o delimitador quebra atributos
 *  ADJACENTES: em `<input aria-invalid aria-required />` o espaço entre os dois é o terminador
 *  do primeiro e o delimitador do segundo. Com `[^-\w]`, `aria-required` sumia. Medido no
 *  próprio fixture em 27/08/2026 — e é a razão de o fixture ter dois atributos colados. */
const OCORRENCIA = /(?<![-\w])aria-([a-z]+)\s*(?=[=:'"`\s/>])/g;
/** `role="menu"` · `role: "menu"` · `role={"menu"}` */
const PAPEL = /\brole\s*[=:]\s*[{]?\s*["'`]([a-z]+)["'`]/g;

const unico = (a) => [...new Set(a)].sort();

/**
 * @param {string} fonte
 * @returns {{atributos: string[], papeis: string[], naoReconhecidos: string[]}}
 *   `atributos`       sempre na forma `aria-*`, e só os que existem na WAI-ARIA
 *   `papeis`          os valores de `role=`
 *   `naoReconhecidos` o que casou a forma e NÃO está na especificação — ruído do extrator,
 *                     guardado em vez de descartado, para nunca errar em silêncio
 */
export function ariaDe(fonte) {
  const t = String(fonte ?? "");
  const achados = [...t.matchAll(OCORRENCIA)].map((m) => normalizar(m[1]));
  return {
    atributos: unico(achados.filter((a) => ATRIBUTOS_ARIA.has(a))),
    papeis: unico([...t.matchAll(PAPEL)].map((m) => m[1])),
    naoReconhecidos: unico(achados.filter((a) => !ATRIBUTOS_ARIA.has(a))),
  };
}

/** Normaliza uma lista JÁ COLHIDA por um extrator antigo — usada para reler os inventários
 *  versionados sem regerá-los, e para a matriz comparar maçã com maçã.
 *
 *  Ela também separa os PAPÉIS, porque o lado medido da Aurea (`AUREA-ARIA.json`) guarda os dois
 *  na mesma lista, com o papel prefixado: `["aria-label", "role:menu"]`. Sem isto, `role:menu`
 *  virava o "atributo" `aria-role:menu` — medido em 27/08/2026, em 34 componentes. */
export function normalizarLista(lista) {
  const bruto = (Array.isArray(lista) ? lista : []).map(String).filter((x) => x && x !== "N/A");
  const papeis = bruto.filter((x) => x.startsWith("role:")).map((x) => x.slice(5));
  const n = bruto.filter((x) => !x.startsWith("role:")).map(normalizar);
  return {
    atributos: unico(n.filter((a) => ATRIBUTOS_ARIA.has(a))),
    papeis: unico(papeis),
    naoReconhecidos: unico(n.filter((a) => !ATRIBUTOS_ARIA.has(a))),
  };
}
