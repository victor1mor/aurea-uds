// O TEMA DO SISTEMA (o D16, aprovado pelo Victor em 19/10/2026: "o tema do sistema; claro quando ele não diz").
//
// Uma página SEM `data-theme` no `<html>` não tinha cor nenhuma: as cores só existem em `[data-theme="dark"]` e
// `[data-theme="light"]`. Agora ela segue o sistema (`prefers-color-scheme`), e o claro quando ele não diz escuro.
//
// Como: na MONTAGEM, cada regra presa a um tema ganha uma cópia para a raiz sem atributo, dentro da pergunta ao sistema.
// A fonte (`aurea.css`, `aurea.tokens.json`) continua escrita só com `data-theme` — quem escreve uma regra de tema não
// precisa lembrar da cópia.
//
//   [data-theme="dark"] .x:where(<guarda>)   →   @media (prefers-color-scheme: dark) {
//                                                   :where(:root):not([data-theme]) .x:where(:not([data-theme] *)) }
//   [data-theme="light"] .x:where(<guarda>)  →   @media not all and (prefers-color-scheme: dark) { … a mesma cópia … }
//
// • O PESO é o mesmo da original: `:where(:root)` não pesa e `:not([data-theme])` pesa um atributo, como
//   `[data-theme="dark"]`. A cópia entra logo DEPOIS da regra dela, então a ordem das regras também não muda.
// • A GUARDA de aninhamento da original (`:not([data-theme="dark"] *),[data-theme="dark"] [data-theme="light"] *`) vira
//   `:not([data-theme] *)`: dentro de uma região com tema próprio (uma `Section theme`, um `Card variant="contrast"`),
//   quem manda é a regra dela, e a cópia não alcança.
// • O tema que aparece DEPOIS do primeiro pedaço do seletor (`[data-brand="x"] [data-theme="dark"]`) é um tema
//   escrito no HTML: fica como está, sem cópia.
// • "Quando o sistema não diz": `prefers-color-scheme` só responde `light` ou `dark`, e sem preferência o navegador
//   responde `light`. Por isso o claro é o "não escuro".

const MIDIA = {
  dark: "@media (prefers-color-scheme: dark)",
  light: "@media not all and (prefers-color-scheme: dark)",
};
export const RAIZ_SEM_TEMA = ":where(:root):not([data-theme])";
const GUARDA_SEM_TEMA = ":where(:not([data-theme] *))";

// Divide no nível de fora (fora de parênteses e de colchetes).
function dividir(texto, separador) {
  const partes = [];
  let prof = 0, ini = 0, aspas = null;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) { if (c === aspas) aspas = null; continue; }
    if (c === '"' || c === "'") { aspas = c; continue; }
    if (c === "(" || c === "[") prof++;
    else if (c === ")" || c === "]") prof--;
    else if (prof === 0 && c === separador) { partes.push(texto.slice(ini, i)); ini = i + 1; }
  }
  partes.push(texto.slice(ini));
  return partes;
}

// A guarda de aninhamento das regras de tema, com qualquer espaço: `:where(:not([data-theme="O"] *),[data-theme="O"]
// [data-theme="T"] *)`.
const GUARDA = /:where\(\s*:not\(\s*\[data-theme="(dark|light)"\]\s+\*\s*\)\s*,\s*\[data-theme="(dark|light)"\]\s+\[data-theme="(dark|light)"\]\s+\*\s*\)/g;

// Um membro da lista de seletores → a cópia dele para a raiz sem tema, ou null se ele não for de um tema.
export function copiaDoMembro(membro) {
  const m = membro.trim();
  const ocorr = [...m.matchAll(/\[data-theme="(dark|light)"\]/g)];
  if (ocorr.length === 0) return null;
  // O primeiro pedaço do seletor: até o primeiro combinador do nível de fora.
  let prof = 0, fim = m.length;
  for (let i = 0; i < m.length; i++) {
    const c = m[i];
    if (c === "(" || c === "[") prof++;
    else if (c === ")" || c === "]") prof--;
    else if (prof === 0 && (c === " " || c === ">" || c === "+" || c === "~")) { fim = i; break; }
  }
  const primeiro = m.slice(0, fim);
  const temas = [...primeiro.matchAll(/\[data-theme="(dark|light)"\]/g)];
  if (temas.length === 0) return null;          // o tema está mais adiante: tema escrito no HTML, fica como está
  if (temas.length > 1) throw new Error(`tema-implicito: dois temas no mesmo pedaço: ${m}`);
  const tema = temas[0][1];
  let resto = m.slice(fim);
  const guardas = [...resto.matchAll(GUARDA)];
  if (resto.trim() !== "") {
    if (guardas.length !== 1) throw new Error(`tema-implicito: regra de tema sem a guarda de aninhamento (ou com mais de uma): ${m}`);
    const [, fora, fora2, dentro] = guardas[0];
    if (dentro !== tema || fora !== fora2 || fora === tema) throw new Error(`tema-implicito: guarda que não é a do tema ${tema}: ${m}`);
    resto = resto.replace(GUARDA, GUARDA_SEM_TEMA);
  }
  return {tema, seletor: primeiro.replace(temas[0][0], RAIZ_SEM_TEMA) + resto};
}

// Percorre a folha e acrescenta as cópias. Entra nos blocos de @media, @supports, @layer e @container; não entra em
// @keyframes nem @font-face. Comentários ficam onde estão.
export function temaImplicito(css) {
  let saida = "", i = 0;
  const n = css.length;
  while (i < n) {
    // comentário
    if (css.startsWith("/*", i)) { const f = css.indexOf("*/", i + 2); const fim = f < 0 ? n : f + 2; saida += css.slice(i, fim); i = fim; continue; }
    if (css[i] === "}" ) { saida += "}"; i++; continue; }
    // o prelúdio: até `{`, `;` ou `}` no nível de fora
    let j = i, aspas = null, prof = 0;
    while (j < n) {
      const c = css[j];
      if (aspas) { if (c === aspas) aspas = null; j++; continue; }
      if (c === '"' || c === "'") { aspas = c; j++; continue; }
      if (css.startsWith("/*", j)) { const f = css.indexOf("*/", j + 2); j = f < 0 ? n : f + 2; continue; }
      if (c === "(" || c === "[") prof++;
      else if (c === ")" || c === "]") prof--;
      else if (prof === 0 && (c === "{" || c === ";" || c === "}")) break;
      j++;
    }
    if (j >= n || css[j] !== "{") { saida += css.slice(i, j + (css[j] === ";" ? 1 : 0)); i = j + (css[j] === ";" ? 1 : 0); continue; }
    const preludio = css.slice(i, j);
    const fechar = acharFecho(css, j);
    const corpo = css.slice(j + 1, fechar);
    const semComentario = preludio.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (semComentario.startsWith("@")) {
      const entra = /^@(media|supports|layer|container)\b/.test(semComentario);
      saida += preludio + "{" + (entra ? temaImplicito(corpo) : corpo) + "}";
    } else {
      saida += preludio + "{" + corpo + "}";
      const porTema = {dark: [], light: []};
      for (const membro of dividir(semComentario, ",")) {
        const c = copiaDoMembro(membro);
        if (c) porTema[c.tema].push(c.seletor);
      }
      for (const tema of ["dark", "light"]) {
        if (porTema[tema].length) saida += `\n${MIDIA[tema]}{${porTema[tema].join(",")}{${corpo}}}`;
      }
    }
    i = fechar + 1;
  }
  return saida;
}

function acharFecho(css, abre) {
  let prof = 0, aspas = null;
  for (let k = abre; k < css.length; k++) {
    const c = css[k];
    if (aspas) { if (c === aspas && css[k - 1] !== "\\") aspas = null; continue; }
    if (c === '"' || c === "'") { aspas = c; continue; }
    if (css.startsWith("/*", k)) { const f = css.indexOf("*/", k + 2); k = f < 0 ? css.length : f + 1; continue; }
    if (c === "{") prof++;
    else if (c === "}") { prof--; if (prof === 0) return k; }
  }
  throw new Error("tema-implicito: bloco sem fecho");
}
