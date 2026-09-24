// UM extrator de `data-*` para as cinco fontes MEDIDAS — e a razão de ele existir.
//
// Cada uma das cinco tinha o seu, e as cinco eram regex diferentes para o campo `estadosData`:
//
//   shadcn   /data-\[([\w-]+)[\]=]/       exige o `[` — só pega VARIANTE Tailwind
//   kibo     /data-\[([\w-]+)[\]=]/       idem
//   reui     /data-\[?([\w-]+)[\]=]/      pega os dois
//   shark    /data-\[?([\w-]+)[\]=\s]/    pega os dois
//   heroui   /data-\[?([a-z][a-z-]*)\]?/  pega os dois, e mais o que não é atributo
//
// Duas delas mediam o OPOSTO das outras três, e a matriz comparava os cinco resultados como se
// fossem um vocabulário só. É a armadilha do §15 acontecendo DENTRO do instrumento: mesmo nome
// de campo, medida diferente.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────
// E há uma distinção real embaixo disso, que nenhuma das cinco fazia:
//
//   EMITIDO   o componente PÕE o atributo no DOM:  data-active={aberto}   "data-folder": true
//   REAGIDO   as classes dele REAGEM a um atributo que outro põe:  data-[state=open]:bg-x
//
// As duas são evidência, e por isso as duas ficam — jogar `reagidos` fora faria o extrator errar
// para MENOS, que é o erro que este projeto já pagou. Mas elas não são a mesma afirmação:
//
//   `data-nested` do dialog da shark aparece SÓ como variante. A shark não emite nada: quem
//   emite é o `vaul`, a biblioteca de drawer embaixo. Contado como estado que "a shark tem e a
//   Aurea não", vira um gap que não existe.
//
//   `group-data-[date=open]` no menu da shark é **erro de digitação de `state`** no fonte dela.
//   O seletor não casa com nada. Saía do extrator como o estado `date`, e a matriz reportava
//   que faltava à Aurea um estado chamado `date`.
//
// Separando os dois campos, a leitura de célula consegue decidir qual é qual sem reabrir o
// fonte da referência — que é o serviço que esta auditoria promete entregar.
// ─────────────────────────────────────────────────────────────────────────────────────────────
//
// O CONTROLE: `tests/unit/data-attrs.test.tsx` roda este extrator contra um fixture com as
// respostas conhecidas, incluindo cada forma achada nos fontes reais e cada armadilha acima.
// É o §1b do protocolo — "nenhum extrator novo entra na cadeia sem um fixture/controle conhecido
// que prove que ele não está omitindo informação silenciosamente".

/** `data-x={...}` · `data-x="v"` · `data-x` solto em JSX. O `[^-[\w]` antes evita casar o
 *  miolo de `group-data-[…]` e de `aria-data-…`. */
const EMITIDO_JSX = /(?:^|[^-[\w])data-([a-z][\w-]*)\s*(?:=|\/?>|\s)/g;
/** `"data-x": valor` — a forma de objeto de props, que a reui usa em todo o data-grid. */
const EMITIDO_OBJ = /["']data-([a-z][\w-]*)["']\s*:/g;
/** `data-[x=v]:classe` · `group-data-[x]/nome:classe` · `peer-data-[x=v]:classe` — a forma
 *  ARBITRÁRIA do Tailwind, entre colchetes. */
const REAGIDO_TW = /data-\[([a-z][\w-]*)[\]=]/g;
/** `data-invalid:border-destructive` — a forma NUA, que o Tailwind 4 acrescentou para atributo
 *  booleano. Ela custou uma volta: sem ela o extrator PERDIA `checked`, `invalid`, `selected` e
 *  `focus-visible` da shark, que é a direção proibida — o extrator não pode errar para menos.
 *  Achado ao medir o delta em 27/08/2026, porque três nomes que importavam sumiram.
 *  O `[\w-]` imediatamente antes do `:` é o que separa esta forma de `"data-x": valor`, a forma
 *  de OBJETO, que tem aspas ali e é EMITIDA. */
const REAGIDO_TW_NU = /data-([a-z][\w-]*):/g;
/** `[data-entering=true]` · `[&:not([data-overflow-x])]:hidden` — a forma de SELETOR CSS, que
 *  aparece tanto em CSS de verdade (heroui) quanto dentro de variante arbitrária do Tailwind
 *  (shark). Achada medindo o delta: sem ela sumiam `entering`/`exiting` da heroui e
 *  `overflow-x`/`overflow-y` da shark, que são reações reais. */
const REAGIDO_CSS = /\[data-([a-z][\w-]*)[\]=]/g;

const colher = (texto, re) => [...String(texto ?? "").matchAll(re)].map((m) => m[1]);
const unico = (a) => [...new Set(a)].sort();

/**
 * @param {string} fonte  o fonte do componente, como está no disco
 * @returns {{emitidos: string[], reagidos: string[], todos: string[]}}
 *   `emitidos`  o componente põe no DOM
 *   `reagidos`  as classes dele reagem, mas quem põe pode ser o motor embaixo
 *   `todos`     a união — o que o campo `estadosData` sempre quis dizer, e o que a matriz compara
 */
export function atributosData(fonte) {
  const emitidos = unico(colher(fonte, EMITIDO_JSX).concat(colher(fonte, EMITIDO_OBJ)));
  const reagidos = unico(colher(fonte, REAGIDO_TW)
    .concat(colher(fonte, REAGIDO_TW_NU), colher(fonte, REAGIDO_CSS)));
  return {emitidos, reagidos, todos: unico([...emitidos, ...reagidos])};
}
