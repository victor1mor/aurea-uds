// ADR-0078 (22/10/2026) — no claro, o campo é branco com sombra; dentro de uma superfície branca, continua cinza.
// Este arquivo roda na CI e lê o CSS MONTADO; quem mede o que a tela pinta, caso a caso, é o
// `tests/visual/campos-brancos.spec.ts` (na máquina local). Provado contra o defeito: com o CSS da 0.39.0, nenhuma das
// regras abaixo existe, e o campo pintava `--fill-2` direto.
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, test} from "vitest";

const core = readFileSync(join(process.cwd(), "packages/core/dist/aurea.css"), "utf8");
const sem = (s: string) => s.replace(/\s+/g, "");
const tem = (trecho: string) => expect(sem(core), trecho).toContain(sem(trecho));

describe("ADR-0078 · o campo branco no claro", () => {
  test("o valor de página mora em cada elemento de tema: o de antes por padrão, o branco com sombra no claro", () => {
    tem(":root,[data-theme] { --field-fill-page:var(--fill-2); --field-lift-page:none; }");
    tem('[data-theme="light"] { --field-fill-page:var(--card); --field-lift-page:var(--shadow-sm); }');
    tem(':root,[data-theme],.demo-panel[data-panel="preview"] { --field-fill:var(--field-fill-page); --field-lift:var(--field-lift-page); }');
  });
  test("a sombra é a da referência, número por número (o `--shadow-sm`)", () => {
    expect(sem(core)).toContain(sem("--shadow-sm:0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06);"));
  });
  test("as superfícies brancas devolvem o cinza; o cartão de contorno e o inset não estão entre elas", () => {
    const regra = core.match(/:is\(([^{]*)\)\s*\{\s*--field-fill:var\(--fill-2\);\s*--field-lift:none;\s*\}/);
    expect(regra, "a regra das superfícies").not.toBeNull();
    const lista = regra![1];
    for (const s of [".card:not(.card-outline):not(.card-inset)", ".content:not(.content-plain)", ".dialog", ".drawer", ".popover",
      ".menu", ".command-palette", ".section-card", ".demo",
      // 0.40.1: as que a 0.40.0 esqueceu e que recebem campo do app.
      ".topbar-floating", ".topbar-pill", ".sortable-item", ".app-shell-docs > .sidebar[popover]:popover-open",
    ]) expect(sem(lista), `superfície ${s}`).toContain(sem(s));
  });
  test("o campo pinta com as duas variáveis, e o de dentro do grupo fica sem fundo e sem sombra", () => {
    tem(".input:where(:not(.input-secondary)),.textarea:where(:not(.textarea-secondary)),.select,.input-group:where(:not(:has(>.input-secondary))),.number-field-group,.combobox-multi { background-color:var(--field-fill); box-shadow:var(--field-lift); }");
    tem(".input-group > :is(.input,.select,.textarea),.number-field-group .input,.combobox-multi .input { background-color:transparent; box-shadow:none; }");
  });
});
