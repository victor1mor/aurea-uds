import {readFileSync} from "node:fs";
import {base} from "../../packages/tokens/dist/aurea.tokens.native.js";

// ADR-0050 (24/09/2026). Ordem do Victor: "quero como da heroUI todos os tamanhos 100% de todo
// projeto". A escala é a do Tailwind, que o HeroUI usa sem mexer — lida no pacote
// `@heroui/styles` 3.2.6 e no `heroui-native` 1.0.10. Este teste trava os NÚMEROS e o DEGRAU que
// cada alvo usa para a peça, que são as duas coisas que a ADR decide.

const css = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
const valor = (nome: string) => css.match(new RegExp(`--${nome}:([^;]+);`))?.[1];

describe("ADR-0050 · a escala de letras é a do HeroUI", () => {
  test("os números são 12 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48", () => {
    expect([
      valor("text-xs"), valor("text-sm"), valor("text-base"), valor("text-lg"), valor("text-xl"),
      valor("text-2xl"), valor("text-3xl"), valor("text-4xl"), valor("text-5xl"),
    ]).toEqual(["0.75rem", "0.875rem", "1rem", "1.125rem", "1.25rem", "1.5rem", "1.875rem", "2.25rem", "3rem"]);
    // `md` não existe no Tailwind; aqui ele é o corpo das peças da web, e por isso é 14.
    expect(valor("text-md")).toBe("0.875rem");
  });

  test("web: a peça é 14 e o apoio 12; o botão pequeno NÃO desce para 12 (no HeroUI ele é 14)", () => {
    const core = readFileSync("packages/core/src/aurea.css", "utf8");
    expect(core).toMatch(/\.btn \{[^}]*font-size:var\(--step-fs,var\(--text-sm\)\)/);
    expect(core).toMatch(/\.btn-sm \{[^}]*--step-fs:var\(--text-sm\)/);
    expect(core).toMatch(/\.badge \{[^}]*font-size:var\(--text-xs\)/);
  });

  test("web: no telefone o texto digitado sobe para 16 (o Safari amplia a página abaixo disso)", () => {
    const core = readFileSync("packages/core/src/aurea.css", "utf8");
    expect(core).toMatch(/@media \(max-width:639\.98px\) \{ \.input,\.textarea,[^}]*font-size:var\(--text-base\)/);
  });

  test("nativo: a peça é 16 e o apoio 14 — um degrau acima da web, como o HeroUI Native", () => {
    expect(base.textBase).toBe(16);
    expect(base.textSm).toBe(14);
    // o mapa do nativo mora no text.tsx; lê-lo aqui trava o DEGRAU, não só o número
    const fonte = readFileSync("packages/native/src/text.tsx", "utf8");
    expect(fonte).toMatch(/xs: "textSm", sm: "textBase", md: "textBase", base: "textBase", lg: "textLg"/);
  });
});
