// A BANCADA DO BLOCO 1 (ADR-0081, 24/10/2026): os nove pontos que o Victor decidiu depois de ver a bancada — "Pode seguir
// com as opções que você recomendou nos nove pontos". Este teste lê as REGRAS (o CSS do core, a regra do site, o dicionário
// do nativo, a porta `inputs`); o `bancada-bloco-1.spec.ts` mede o contraste no navegador. Provado contra o defeito: com o
// código de antes das abas de código e da bancada (a branch `claude/nat1`, `e37dffcb`), reprovam 8 de 9 — passa só o 7º
// (o `align` em bloco, que já estava no código desde o catálogo fiel).
import {readFileSync} from "node:fs";
import {describe, expect, test} from "vitest";

const CSS = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const SITE = readFileSync("scripts/build-catalog.mjs", "utf8");
const regra = (seletor: RegExp) => [...CSS.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, s, c]) => ({s: s.trim(), c})).filter(({s}) => seletor.test(s));

describe("a bancada do bloco 1", () => {
  test("1 · a caixa do exemplo cresce com ele: a altura de antes vira a mínima; a moldura própria fica fixa", () => {
    const demo = /^\.demo \{[^}]*\}/m.exec(SITE)?.[0] ?? "";
    expect(demo).toContain("min-height:var(--demo-height)");
    expect(demo).not.toMatch(/(^|[ ;{])height:var\(--demo-height\)/);
    expect(SITE).toMatch(/^\.demo:has\(\.demo-frame\) \{ height:var\(--demo-height\); \}/m);
  });

  test("2 · a letra do tone primary é a de destaque", () => {
    expect(regra(/^\.typography-tone-primary$/).map((r) => r.c.trim())).toEqual(["color:var(--primary-emphasis);"]);
  });

  test("3 · os botões da marca de contorno, fantasma e link levam a letra de destaque — sem a mistura marrom no claro", () => {
    for (const cls of ["btn-primary-outline", "btn-primary-ghost", "btn-link-primary"]) {
      expect(regra(new RegExp(`^\\.${cls}$`)).some((r) => r.c.includes("--btn-fg:var(--primary-emphasis)")), cls).toBe(true);
    }
    expect(regra(/^\.btn-tone-brand,/).some((r) => r.c.includes("--btn-fg:var(--primary-emphasis)"))).toBe(true);
    const marrom = regra(/\.(btn-primary-outline|btn-primary-ghost|btn-link-primary|btn-tone-brand)\b/)
      .filter((r) => r.c.includes("var(--primary) 45%, var(--foreground)"));
    expect(marrom.map((r) => r.s.slice(0, 80))).toEqual([]);
  });

  test("4 · o Avatar suave com tom de estado usa o fundo do selo suave", () => {
    for (const tom of ["info", "success", "warning", "danger"]) {
      expect(regra(new RegExp(`^\\.avatar\\.avatar-soft\\.avatar-tone-${tom}$`)).map((r) => r.c.trim()), tom).toEqual([`background:var(--${tom}-bg);`]);
    }
  });

  test("5 · o traço da aba escolhida nas abas de código fica", () => {
    expect(regra(/^\.code-tab\.active::after$/).length).toBe(1);
  });

  test("6 · running é info, paused é aviso, review é violeta, offline é o apagado — e nada pinta por cima", () => {
    expect(regra(/(^|,)\.badge-running(,|$)/).map((r) => r.s)).toEqual([".badge-info,.badge-running"]);
    expect(regra(/(^|,)\.badge-paused(,|$)/).map((r) => r.s)).toEqual([".badge-warning,.badge-paused"]);
    expect(regra(/(^|,)\.badge-review(,|$)/).map((r) => r.s)).toEqual([".badge-violet,.badge-review"]);
    const offline = regra(/^\.badge-offline$/);
    expect(offline.length).toBe(1);
    expect(offline[0].c).toContain("color:var(--subtle-foreground)");
    expect(offline[0].c).toContain("--badge-fill:var(--muted-foreground)");
  });

  test("7 · o align do Text e do Code vira bloco", () => {
    expect(regra(/\.typography-align-/).some((r) => /display:\s*block/.test(r.c))).toBe(true);
  });

  test("8 · a setinha do Combobox nativo tem nome no navegador: a frase comboboxOpen, a mesma da web", () => {
    const frases = readFileSync("packages/native/src/strings.ts", "utf8");
    expect(frases).toMatch(/comboboxOpen: string;/);
    expect(frases).toMatch(/comboboxOpen: "Open list",/);
    expect(frases).toMatch(/comboboxOpen: "Abrir lista",/);
    expect(readFileSync("packages/native/src/busca.tsx", "utf8")).toMatch(/accessibilityLabel=\{Platform\.OS === "web" \? strings\.comboboxOpen/);
  });

  test("9 · ColorSpace e ColorChannel saem pela porta `inputs`", () => {
    expect(readFileSync("packages/react/src/inputs.tsx", "utf8")).toMatch(/export type \{ColorSpace, ColorChannel\} from "\.\/color\.js";/);
  });
});
