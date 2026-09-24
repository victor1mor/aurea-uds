// O FIXTURE do extrator de TECLADO — §1b do protocolo.
//
// Entrada conhecida → resultado conhecido. As linhas do fixture são COPIADAS dos fontes reais
// das referências, e as duas primeiras armadilhas são as que inverteram o sentido de duas
// células da matriz em 27/08/2026.
import {describe, it, expect} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {tecladoDe} from "../../audit/activity-2/teclas.mjs";

const FIXTURE = String.raw`
  // AS DUAS LINHAS REAIS DA RADIX — ela trata Enter para BLOQUEAR, como manda a WAI-ARIA:
  if (event.key === 'Enter') event.preventDefault();

  // tratamento de verdade, que muda estado:
  if (event.key === 'ArrowDown') { setOpen(true); focusFirst(); }
  if (e.key !== 'Escape') return;
  switch (key) { case 'Home': moveTo(0); break; }
  const MAPA = { key: 'End' };
  if (['PageUp', 'PageDown'].includes(event.key)) rolar(event.key);
  if (event.key === ' ') alternar();

  // PROSA E RUÍDO, que o extrator antigo contava como suporte:
  // "o componente não responde a 'Tab' porque o navegador já move o foco"
  type Direcao = 'ArrowLeft' | 'ArrowRight';
  it('should not check an item on Enter key', () => {});
`;

describe("tecladoDe: entrada conhecida → resultado conhecido", () => {
  const r = tecladoDe(FIXTURE);

  it("`tratadas` são só as que aparecem numa COMPARAÇÃO de tecla", () => {
    expect(r.tratadas).toEqual(
      ["ArrowDown", "Enter", "Escape", "Home", "End", "PageUp", "PageDown", "Space"]);
  });

  // A ARMADILHA CENTRAL, e a razão de este módulo existir. Sem esta asserção o extrator
  // continuaria reportando que falta à Aurea uma tecla que a referência proíbe de propósito.
  it("Enter num ramo que só chama preventDefault sai como SUPRIMIDA", () => {
    expect(r.suprimidas).toEqual(["Enter"]);
    expect(r.tratadas).toContain("Enter");     // tratada, sim — mas para bloquear
  });

  it("ramo que muda estado NÃO é suprimido, mesmo se chamasse preventDefault", () => {
    for (const k of ["ArrowDown", "Home", "End", "PageUp", "Space"])
      expect(r.suprimidas, `\`${k}\` não deveria contar como suprimida`).not.toContain(k);
  });

  it("prosa, união de tipo e nome de teste ficam em `citadas`, nunca em `tratadas`", () => {
    expect(r.tratadas).not.toContain("Tab");
    expect(r.tratadas).not.toContain("ArrowLeft");
    expect(r.tratadas).not.toContain("ArrowRight");
    expect(r.citadas).toEqual(["ArrowLeft", "ArrowRight", "Tab"]);
  });

  it("`Space` é achada pelo literal `' '`, que é o único caso em que literal ≠ nome", () => {
    expect(r.tratadas).toContain("Space");
    expect(tecladoDe(`if (key === 'Spacebar') x();`).tratadas).toContain("Space");
  });

  it("entrada vazia ou nula não estoura", () => {
    for (const v of ["", null, undefined])
      expect(tecladoDe(v as never)).toEqual({tratadas: [], suprimidas: [], citadas: []});
  });
});

// ── USO NO INVENTÁRIO REAL ────────────────────────────────────────────────────
describe("o inventário da radix usa este extrator", () => {
  const arq = path.join(import.meta.dirname, "..", "..", "audit", "activity-2",
    "INVENTORY-RADIX.json");
  const d = JSON.parse(fs.readFileSync(arq, "utf8"));
  const itens = (d.itens ?? []).filter((i: {TECLADO: unknown}) => Array.isArray(i.TECLADO));

  it("há itens com teclado medido", () => {
    expect(itens.length).toBeGreaterThan(0);
  });

  it("`TECLADO_SUPRIMIDO` é subconjunto de `TECLADO`", () => {
    for (const i of itens) {
      const sup = i.TECLADO_SUPRIMIDO;
      if (!Array.isArray(sup)) continue;
      for (const k of sup)
        expect(i.TECLADO, `${i.NOME}: \`${k}\` suprimida sem estar em TECLADO`).toContain(k);
    }
  });

  // O achado que motivou o módulo, cobrado contra o inventário versionado: se alguém voltar o
  // extrator para "a string aparece no arquivo", estas duas voltam a mentir.
  it("checkbox e radio-group marcam Enter como SUPRIMIDA, não como suportada", () => {
    for (const nome of ["checkbox", "radio-group"]) {
      const it = (d.itens ?? []).find((x: {NOME: string}) => x.NOME === nome);
      expect(it, `${nome} não está no inventário`).toBeTruthy();
      expect(it.TECLADO_SUPRIMIDO, `${nome}: Enter deveria estar suprimida`).toContain("Enter");
    }
  });
});
