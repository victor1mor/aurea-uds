// O FIXTURE do extrator de `data-*` — §1b do protocolo.
//
// "Nenhum extrator novo entra na cadeia sem um fixture/controle conhecido que prove que ele não
// está omitindo informação silenciosamente." Formato: entrada conhecida → resultado esperado
// conhecido → teste → uso no inventário real.
//
// Cada forma do fixture foi COPIADA de um fonte real das cinco referências medidas, e as
// armadilhas são as que estouraram de verdade em 27/08/2026 ao ler as células de `estados`.
import {describe, it, expect} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {atributosData} from "../../audit/activity-2/data-attrs.mjs";

// ── ENTRADA CONHECIDA ─────────────────────────────────────────────────────────
// As sete primeiras linhas EMITEM; as quatro seguintes só REAGEM; o resto é armadilha.
const FIXTURE = String.raw`
  <div data-chart={chartId} />
  <div data-mobile="true" />
  <input data-invalid />
  <tr data-row-pinned={isRowPinned || undefined} />
  <td data-interval={index % markerInterval === 0 ? undefined : ""} />
  const props = {"data-drag-target": alvo, 'data-search-match': achou};
  <li data-depth={item.depth}>

  <span className="data-[state=open]:bg-accent" />
  <span className="group-data-[nested-drawer-open]/drawer:h-4" />
  <span className="peer-data-[disabled=true]:opacity-50" />
  <span className="data-[swipe-direction]:translate-x-0" />
  <span className="data-invalid:border-destructive data-checked:bg-primary" />
  <span className="group-data-focus-visible:ring-2 peer-data-selected:not-first:ml-1" />
  .popover[data-entering=true] { animation: x }
  <span className="[&:not([data-overflow-x])]:hidden" />

  // armadilhas, cada uma medida em fonte real:
  <b aria-invalid="true" aria-data-foo="x" />        {/* aria- não é data- */}
  <b data-2bad="x" data-="y" />                      {/* nome que não começa com letra */}
  <span className="group-data-[date=open]/trigger-item:bg-accent" />  {/* typo de state, na shark */}
  {"path": "data-grid-pagination.tsx", "name":"data-grid-pagination"}  {/* NOME DE ARQUIVO, reui */}
  const rotulo = "«data-slot-icon-def-1»-" + id;                       {/* useId, heroui */}
`;

const EMITIDOS_ESPERADOS = [
  "chart", "depth", "drag-target", "interval", "invalid", "mobile", "row-pinned", "search-match",
];
const REAGIDOS_ESPERADOS = [
  "checked", "date", "disabled", "entering", "focus-visible", "invalid", "nested-drawer-open",
  "overflow-x", "selected", "state", "swipe-direction",
];

describe("atributosData: entrada conhecida → resultado conhecido", () => {
  const r = atributosData(FIXTURE);

  it("colhe exatamente os atributos EMITIDOS, e nenhum a mais", () => {
    expect(r.emitidos).toEqual(EMITIDOS_ESPERADOS);
  });

  it("colhe exatamente os atributos REAGIDOS, e nenhum a mais", () => {
    expect(r.reagidos).toEqual(REAGIDOS_ESPERADOS);
  });

  it("`todos` é a união — o extrator nunca erra para MENOS", () => {
    expect(r.todos).toEqual([...new Set([...EMITIDOS_ESPERADOS, ...REAGIDOS_ESPERADOS])].sort());
  });

  // As três armadilhas, uma a uma. Sem estas asserções o teste passaria com um extrator que
  // confunde as duas categorias — que é exatamente o defeito que ele veio corrigir.
  it("`nested-drawer-open` NÃO é emitido: quem põe é o vaul, embaixo da shark", () => {
    expect(r.reagidos).toContain("nested-drawer-open");
    expect(r.emitidos).not.toContain("nested-drawer-open");
  });

  it("`date` (typo de `state` no fonte da shark) fica como REAGIDO, nunca como emitido", () => {
    expect(r.reagidos).toContain("date");
    expect(r.emitidos).not.toContain("date");
  });

  // A forma NUA do Tailwind 4 (`data-invalid:classe`) custou uma volta: sem ela o extrator
  // perdia `checked`, `invalid`, `selected` e `focus-visible` da shark — a direção proibida.
  it("a forma NUA do Tailwind 4 é lida como reagida, e não se confunde com a de objeto", () => {
    for (const k of ["invalid", "checked", "focus-visible", "selected"])
      expect(r.reagidos, `perdeu \`${k}\` da forma nua`).toContain(k);
    // `"data-drag-target": alvo` tem aspas antes do `:` e continua EMITIDO, não reagido
    expect(r.emitidos).toContain("drag-target");
    expect(r.reagidos).not.toContain("drag-target");
  });

  // A forma de SELETOR CSS custou a segunda volta: sem ela sumiam `entering`/`exiting` da heroui
  // e `overflow-x`/`overflow-y` da shark. As duas voltas são a mesma lição — o delta contra o
  // extrator antigo é o que revela a forma que a gente não tinha imaginado.
  it("a forma de SELETOR CSS é lida como reagida", () => {
    expect(r.reagidos).toContain("entering");     // .popover[data-entering=true] — CSS da heroui
    expect(r.reagidos).toContain("overflow-x");   // [&:not([data-overflow-x])] — shark
  });

  it("`aria-*` não entra por nenhum dos dois caminhos", () => {
    expect([...r.todos].some((x) => x.includes("foo"))).toBe(false);
    // `aria-invalid` está no fixture, e `invalid` só entra porque há um `data-invalid` de verdade
    expect(r.emitidos).toContain("invalid");
  });

  // As duas coisas que o extrator ANTIGO contava como estado e que não são atributo nenhum.
  // Medidas ao ler o delta: `grid-pagination` era o nome do arquivo `data-grid-pagination.tsx`
  // da reui, e `slot-icon-def-` saía de um template literal `«data-slot-icon-def-1»` do useId da
  // heroui. Um extrator que volte a colher prosa e caminho volta a produzir gaps que não existem.
  it("nome de arquivo e template literal não viram estado", () => {
    expect(r.todos.some((x) => x.startsWith("grid-pagination"))).toBe(false);
    expect(r.todos.some((x) => x.startsWith("slot-icon-def"))).toBe(false);
  });

  it("entrada vazia ou nula devolve listas vazias, não estoura", () => {
    for (const v of ["", null, undefined]) {
      const x = atributosData(v as never);
      expect(x).toEqual({emitidos: [], reagidos: [], todos: []});
    }
  });
});

// ── USO NO INVENTÁRIO REAL ────────────────────────────────────────────────────
// O fixture prova o extrator. Isto prova que os inventários versionados foram gerados com ELE —
// um extrator certo que ninguém ligou na cadeia passaria em tudo acima.
describe("os inventários versionados usam este extrator", () => {
  const AQUI = path.join(import.meta.dirname, "..", "..", "audit", "activity-2");
  const MEDIDAS = ["SHADCN", "KIBO", "REUI", "SHARK", "HEROUI"];

  it.each(MEDIDAS)("INVENTORY-%s.json separa emitidos de reagidos", (fonte) => {
    const arq = path.join(AQUI, `INVENTORY-${fonte}.json`);
    const d = JSON.parse(fs.readFileSync(arq, "utf8"));
    const comps = d.componentes ?? d.itens ?? [];
    expect(comps.length).toBeGreaterThan(0);
    for (const c of comps) {
      expect(Array.isArray(c.estadosEmitidos), `${fonte}/${c.nome}: sem estadosEmitidos`).toBe(true);
      expect(Array.isArray(c.estadosReagidos), `${fonte}/${c.nome}: sem estadosReagidos`).toBe(true);
      // `estadosData` continua sendo a UNIÃO: a matriz compara contra ela, e mudar isso faria o
      // extrator errar para menos.
      expect(c.estadosData).toEqual(
        [...new Set([...c.estadosEmitidos, ...c.estadosReagidos])].sort());
    }
  });
});
