import {describe, expect, test} from "vitest";
import {readFileSync} from "node:fs";
import {cantoContinuo} from "../../scripts/canto-continuo.mjs";

// O CANTO CONTÍNUO NA WEB (HER-01, lote 106, 26/11/2026). A montagem do core dá a cada regra de canto uma cópia, logo depois
// dela, que só vale onde o navegador desenha o `corner-shape`. Provado contra o defeito: a folha publicada de antes não
// tinha `corner-shape` nenhum, e o último teste reprova.
describe("canto contínuo", () => {
  test("o canto do cartão ganha a curva e o raio 1,5 ×; a cápsula fica redonda; o zero e o @keyframes não mudam", () => {
    const saida = cantoContinuo(
      ".card{padding:1px;border-radius:var(--radius-card)}.btn{border-radius:var(--radius-control)}"
      + ".r{border-radius:50%}.z{border-radius:0}.h{border-radius:inherit}@keyframes k{from{opacity:0}}");
    expect(saida).toContain(".card{padding:1px;border-radius:var(--radius-card)}@supports (corner-shape: superellipse(2)){.card{corner-shape:superellipse(1.65);border-radius:calc(var(--radius-card) * 1.5)}}");
    expect(saida).toContain(".btn{border-radius:var(--radius-control)}@supports (corner-shape: superellipse(2)){.btn{corner-shape:round}}");
    expect(saida).toContain("@supports (corner-shape: superellipse(2)){.r{corner-shape:round}}");
    expect(saida).toContain("@supports (corner-shape: superellipse(2)){.h{corner-shape:inherit}}");
    expect(saida).toContain(".z{border-radius:0}.h");
    expect(saida).toContain("@keyframes k{from{opacity:0}}");
  });
  test("dentro de @media a cópia fica no mesmo lugar; o !important e o calc de dentro passam", () => {
    const saida = cantoContinuo("@media (max-width:10em){.x::before{border-radius:calc(var(--radius-card) - var(--space-1)) 0 !important}}");
    expect(saida).toBe("@media (max-width:10em){.x::before{border-radius:calc(var(--radius-card) - var(--space-1)) 0 !important}"
      + "@supports (corner-shape: superellipse(2)){.x::before{corner-shape:superellipse(1.65) !important;border-radius:calc(calc(var(--radius-card) - var(--space-1)) * 1.5) 0 !important}}}");
  });
  test("a folha publicada leva as cópias (o cartão contínuo, o botão redondo)", () => {
    const dist = readFileSync("packages/core/dist/aurea.css", "utf8");
    expect(dist).toMatch(/@supports \(corner-shape: superellipse\(2\)\)\{\.card\{corner-shape:superellipse\(1\.65\);border-radius:calc\(var\(--radius-card\) \* 1\.5\)\}\}/);
    expect(dist).toMatch(/@supports \(corner-shape: superellipse\(2\)\)\{\.btn\{corner-shape:round\}\}/);
  });
});
