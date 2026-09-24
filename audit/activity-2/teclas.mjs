// O extrator de TECLADO das referências, e por que ele precisou existir.
//
// O campo `TECLADO` do inventário da radix era, literalmente:
//
//     TECLAS.filter((k) => texto.includes(`'${k}'`))
//
// **"a string aparece em algum lugar do arquivo".** Comentário, nome de teste, união de tipo,
// ramo que SUPRIME a tecla — tudo contava como "o componente responde a esta tecla".
//
// ─────────────────────────────────────────────────────────────────────────────────────────────
// E o pior caso não é ruído: é INVERSÃO DE SENTIDO. Medido em 27/08/2026, lendo as células.
//
//   radix/checkbox.tsx:186     if (event.key === 'Enter') event.preventDefault();
//   radix/radio-group.tsx:227  if (event.key === 'Enter') event.preventDefault();
//
// A radix trata `Enter` para **BLOQUEÁ-LA** — é o que a WAI-ARIA manda para caixa de seleção e
// rádio, e o teste da própria radix se chama *"should not check an item on Enter key"*. O
// extrator lia isso como suporte, e a matriz reportava que **faltava à Aurea uma tecla que a
// referência proíbe de propósito**. A Aurea usa `<input>` nativo, que também não alterna com
// Enter. As duas fazem a mesma coisa, e a matriz dizia que uma era inferior.
//
// É a mesma armadilha do `data-[date=open]` e do `data-entering` em comentário: casamento
// sintático cujo sentido é o oposto do que o campo afirma.
// ─────────────────────────────────────────────────────────────────────────────────────────────
//
// O que este módulo faz. Devolve TRÊS listas, e nenhuma delas é veredito:
//
//   tratadas    a tecla aparece numa COMPARAÇÃO de tecla (`event.key === 'X'`, `key: 'X'`,
//               `case 'X':`, `['X', 'Y'].includes`), não em prosa solta
//   suprimidas  a comparação dela chama `preventDefault` e nada mais nas linhas seguintes
//   citadas     a tecla aparece no arquivo, mas fora de qualquer comparação — o que o campo
//               antigo media, guardado para nunca errar para menos
//
// A matriz compara contra `tratadas`, e a célula mostra `suprimidas` ao lado. Quem lê a célula
// decide; o extrator não.
//
// CONTROLE: `tests/unit/teclas.test.tsx`, fixture com entrada conhecida → resultado conhecido,
// incluindo as duas linhas reais da radix acima. §1b do protocolo.

export const TECLAS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape",
  "Home", "End", "PageUp", "PageDown", "Tab", "Backspace", "Delete", "Space"];

/** Toda forma de COMPARAR uma tecla que aparece nos fontes das referências. A `Space` mora em
 *  `' '` além do nome, e é o único caso em que o literal não é o nome da tecla. */
function literaisDe(tecla) {
  return tecla === "Space" ? ["Space", " ", "Spacebar"] : [tecla];
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** As posições em que `tecla` aparece dentro de uma COMPARAÇÃO de tecla. */
function comparacoes(fonte, tecla) {
  const fora = [];
  for (const lit of literaisDe(tecla)) {
    const L = esc(lit);
    // `event.key === 'X'` · `e.key !== 'X'` · `key === "X"`
    const cmp = new RegExp(`\\b(?:key|code)\\s*[!=]==?\\s*["'\`]${L}["'\`]`, "g");
    // `key: 'X'` num mapa de teclas · `case 'X':` · `['X', 'Y'].includes(key)`
    const mapa = new RegExp(`(?:\\bkey\\s*:\\s*|\\bcase\\s+)["'\`]${L}["'\`]`, "g");
    const lista = new RegExp(`\\[[^\\]]*["'\`]${L}["'\`][^\\]]*\\]\\s*\\.\\s*(?:includes|indexOf)`, "g");
    for (const re of [cmp, mapa, lista])
      for (const m of String(fonte ?? "").matchAll(re)) fora.push(m.index);
  }
  return fora;
}

/** `preventDefault` nos ~120 caracteres seguintes à comparação, e nada mais que mexa em estado.
 *  A janela é curta de propósito: `if (key === 'Enter') event.preventDefault();` cabe nela, e um
 *  handler de verdade — que chama `setOpen`, `focus()`, `onValueChange` — não. */
function soPrevine(fonte, pos) {
  const jan = String(fonte).slice(pos, pos + 120);
  if (!/preventDefault\s*\(/.test(jan)) return false;
  const ate = jan.slice(0, jan.search(/preventDefault\s*\(/));
  const depois = jan.slice(jan.search(/preventDefault\s*\(/) + 16, 120);
  return !/\b(set[A-Z]|focus\s*\(|on[A-Z]\w*\s*\(|dispatch|toggle|open|select)/.test(ate + depois);
}

/**
 * @param {string} fonte  o fonte do componente
 * @returns {{tratadas: string[], suprimidas: string[], citadas: string[]}}
 */
export function tecladoDe(fonte) {
  const t = String(fonte ?? "");
  const tratadas = [], suprimidas = [], citadas = [];
  for (const tecla of TECLAS) {
    const pos = comparacoes(t, tecla);
    if (pos.length) {
      tratadas.push(tecla);
      if (pos.every((p) => soPrevine(t, p))) suprimidas.push(tecla);
    } else if (literaisDe(tecla).some((l) => t.includes(`'${l}'`) || t.includes(`"${l}"`))) {
      citadas.push(tecla);
    }
  }
  return {tratadas, suprimidas, citadas};
}
