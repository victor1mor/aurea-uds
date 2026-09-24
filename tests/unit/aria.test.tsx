// O FIXTURE do extrator de ARIA — §1b do protocolo.
//
// Cada linha do fixture veio de um fonte real, e as armadilhas são as que a matriz mostrou:
// `label` sem prefixo em quatro fontes, `aria-components` em doze células.
import {describe, it, expect} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {ariaDe, normalizarLista, ATRIBUTOS_ARIA} from "../../audit/activity-2/aria.mjs";

const FIXTURE = String.raw`
  <button aria-label="Fechar" aria-expanded={aberto} aria-controls={idDoPainel} />
  <div role="menu" aria-orientation='vertical' />
  <li role={"listitem"} aria-current="page" />
  const props = { "aria-labelledby": id, 'aria-describedby': dica };
  <span aria-hidden="true" />
  <input aria-invalid aria-required />

  // ARMADILHAS, cada uma medida em fonte real:
  import { Button } from "react-aria-components";   // o pacote da heroui, não um atributo
  const pacote = '@react-aria/utils';
  <b data-aria-fake="x" />                           // aria- precedido de hífen não conta
  <i aria-inventado="x" />                           // forma certa, e NÃO existe na WAI-ARIA
`;

describe("ariaDe: entrada conhecida → resultado conhecido", () => {
  const r = ariaDe(FIXTURE);

  it("colhe os atributos ARIA, sempre com o prefixo", () => {
    expect(r.atributos).toEqual([
      "aria-controls", "aria-current", "aria-describedby", "aria-expanded", "aria-hidden",
      "aria-invalid", "aria-label", "aria-labelledby", "aria-orientation", "aria-required",
    ]);
  });

  it("colhe os papéis de `role=`, nas três formas", () => {
    expect(r.papeis).toEqual(["listitem", "menu"]);
  });

  // A ARMADILHA DAS 12 CÉLULAS. `react-aria-components` é o nome do pacote da heroui, e o
  // extrator dela o lia como um atributo chamado `aria-components`.
  it("`react-aria-components` NÃO vira o atributo `aria-components`", () => {
    expect(r.atributos).not.toContain("aria-components");
    expect(r.naoReconhecidos).not.toContain("aria-components");
  });

  // ARIA é vocabulário FECHADO: o que casa a forma e não está na especificação é ruído, e sai
  // separado em vez de descartado — errar em silêncio é a direção proibida.
  it("forma certa fora da especificação vai para `naoReconhecidos`, e não some", () => {
    expect(r.naoReconhecidos).toEqual(["aria-inventado"]);
    expect(r.atributos).not.toContain("aria-inventado");
  });

  it("entrada vazia ou nula não estoura", () => {
    for (const v of ["", null, undefined])
      expect(ariaDe(v as never)).toEqual({atributos: [], papeis: [], naoReconhecidos: []});
  });
});

// A NORMALIZAÇÃO é a peça que junta os dois vocabulários dos extratores antigos: quatro fontes
// gravavam `label` e três gravavam `aria-label`, e a matriz comparava as duas listas como se
// fossem coisas diferentes.
describe("normalizarLista: os dois vocabulários viram um", () => {
  it("`label` e `aria-label` chegam ao mesmo lugar", () => {
    expect(normalizarLista(["label", "invalid", "selected"]).atributos)
      .toEqual(["aria-invalid", "aria-label", "aria-selected"]);
    expect(normalizarLista(["aria-label", "aria-invalid", "aria-selected"]).atributos)
      .toEqual(["aria-invalid", "aria-label", "aria-selected"]);
  });

  it("`N/A` e vazio não viram atributo", () => {
    expect(normalizarLista(["N/A", "", null]).atributos).toEqual([]);
    expect(normalizarLista("não é lista" as never).atributos).toEqual([]);
  });

  it("o que não é ARIA sai em `naoReconhecidos`", () => {
    const r = normalizarLista(["components", "label"]);
    expect(r.atributos).toEqual(["aria-label"]);
    expect(r.naoReconhecidos).toEqual(["aria-components"]);
  });
});

describe("a lista da especificação", () => {
  it("tem os atributos que este projeto usa de fato", () => {
    for (const a of ["aria-label", "aria-labelledby", "aria-current", "aria-expanded",
      "aria-invalid", "aria-hidden", "aria-orientation", "aria-selected", "aria-sort"])
      expect(ATRIBUTOS_ARIA.has(a), `faltou ${a}`).toBe(true);
  });

  it("não tem o que não é ARIA", () => {
    for (const a of ["aria-components", "aria-props", "aria-utils"])
      expect(ATRIBUTOS_ARIA.has(a)).toBe(false);
  });
});

// ── USO NO REAL ───────────────────────────────────────────────────────────────
describe("o ARIA medido da Aurea passa pela mesma régua", () => {
  const AQUI = path.join(import.meta.dirname, "..", "..", "audit", "activity-2");
  const d = JSON.parse(fs.readFileSync(path.join(AQUI, "AUREA-ARIA.json"), "utf8"));

  it("todo atributo medido no render da Aurea é ARIA de verdade", () => {
    for (const [nome, c] of Object.entries<{aria?: string[]}>(d.componentes ?? {})) {
      const r = normalizarLista(c.aria ?? []);
      expect(r.naoReconhecidos, `${nome}: ${r.naoReconhecidos.join(", ")} não é ARIA`).toEqual([]);
    }
  });
});
