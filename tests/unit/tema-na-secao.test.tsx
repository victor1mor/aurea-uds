// GAR-05 (06/10/2026) · uma faixa escura dentro de uma página clara não pode herdar as regras de
// tema claro. O `aurea.css` tinha 22 seletores `[data-theme="light"] X`, e eles continuavam valendo
// dentro de `<section data-theme="dark">`: o botão de contorno saía com a tinta escurecida do claro
// sobre o fundo escuro.
//
// Toda regra assim leva a guarda de força zero
//     :where(:not([data-theme="dark"] *),[data-theme="dark"] [data-theme="light"] *)
// e este teste lê o CSS e reprova seletor de tema claro sem ela — o de hoje e o de amanhã. O
// efeito no navegador é medido em `tests/visual/tema-na-secao.spec.ts`.
// Provado contra o defeito: com o CSS de antes, reprova listando os 22.
import {readFileSync} from "node:fs";

const GUARDA = ':where(:not([data-theme="dark"] *),[data-theme="dark"] [data-theme="light"] *)';
const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// Separa uma lista de seletores pelas vírgulas de FORA dos parênteses.
const separar = (lista: string) => {
  const partes: string[] = [];
  let nivel = 0, atual = "";
  for (const c of lista) {
    if (c === "(") nivel++;
    if (c === ")") nivel--;
    if (c === "," && nivel === 0) { partes.push(atual.trim()); atual = ""; } else atual += c;
  }
  if (atual.trim()) partes.push(atual.trim());
  return partes;
};

// Os seletores de toda regra comum (não `@media`/`@container`/`@property`, que não têm `[data-theme`).
const seletores = [...css.matchAll(/([^{}]+)\{/g)].flatMap((m) => separar(m[1].replace(/^[\s\S]*;/, "")));
const deTemaClaro = seletores.filter((s) => s.startsWith('[data-theme="light"] '));

describe("GAR-05 · regra de tema claro não vaza para a faixa escura", () => {
  test("existem regras de tema claro com descendente (o teste não passa por vacuidade)", () => {
    expect(deTemaClaro.length).toBeGreaterThanOrEqual(22);
  });

  test("toda regra `[data-theme=\"light\"] X` termina com a guarda", () => {
    expect(deTemaClaro.filter((s) => !s.endsWith(GUARDA))).toEqual([]);
  });
});
