// Lote N (0.29.0) · na WEB (ADR-0063, pedido de um app):
//   MT-01: `Card variant="contrast"` — `data-theme="dark"` no próprio cartão (o tema escuro dentro);
//          no claro, sem linha em volta; no escuro, o contorno amarelo, pelo tema do ANCESTRAL;
//   MT-02: `Card accent` — o traço no topo, `--accent-width` (4), na cor CHEIA do tom;
//   e o conserto que o MT-01 achou: uma faixa escura (`Section theme`, `contrast`) numa página
//   `lory` saía com o escuro da Aurea, porque o seletor da marca exigia marca e tema no MESMO
//   elemento. As cores se medem no navegador (`tests/visual/marca.spec.ts`).
// Provado contra o defeito: na 0.28.0 o `Card` não tem `contrast` nem `accent` (sai a classe
// `card-contrast` sem regra e nenhum atributo), o CSS não tem as regras, o token não existe e o
// seletor da marca é só o par — os testes reprovam.
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {describe, expect, test} from "vitest";
import {Card, Section} from "../../packages/react/src/index";

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const tokens = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
/** O corpo da regra cujo seletor é EXATAMENTE este (no começo da regra, não dentro de uma lista). */
const regra = (seletor: string) => {
  const esc = seletor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : "";
};
const TONS = {brand: "--primary", success: "--success", info: "--info", warning: "--warning", danger: "--destructive"} as const;

describe("MT-01 · Card contrast", () => {
  test("o cartão traz o tema escuro no próprio elemento", () => {
    const {container} = render(<Card variant="contrast">Moto</Card>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("card")).toBe(true);
    expect(el.classList.contains("card-contrast")).toBe(true);
    expect(el.getAttribute("data-theme")).toBe("dark");
  });

  test("os outros cartões não ganham tema", () => {
    const {container} = render(<Card variant="selected">x</Card>);
    expect((container.firstElementChild as HTMLElement).hasAttribute("data-theme")).toBe(false);
  });

  test("com render, o elemento de quem chama recebe a pele e o tema", () => {
    const {container} = render(<Card variant="contrast" render={<button type="button"/>}>Moto</Card>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("data-theme")).toBe("dark");
  });

  test("no claro, sem linha em volta; no escuro, o amarelo pelo tema do ANCESTRAL, com a guarda do GAR-05", () => {
    expect(regra(".card-contrast")).toMatch(/border-color:\s*transparent/);
    const escuro = css.match(/\[data-theme="dark"\] \.card-contrast:where\(([^)]*\)[^)]*)\)\s*\{([^}]*)\}/);
    expect(escuro?.[2]).toMatch(/border-color:\s*var\(--primary\)/);
    // A guarda: fora de uma faixa clara, ou numa faixa escura dentro de uma clara.
    expect(escuro?.[1]).toContain(':not([data-theme="light"] *)');
    expect(escuro?.[1]).toContain('[data-theme="light"] [data-theme="dark"] *');
  });
});

describe("MT-02 · Card accent", () => {
  test("a medida nova: --accent-width, 4", () => {
    expect(tokens).toMatch(/--accent-width:4px;/);
  });

  for (const [tom, cor] of Object.entries(TONS)) {
    test(`${tom}: a classe e a cor CHEIA (${cor}), igual nos dois temas`, () => {
      const {container} = render(<Card accent={tom as keyof typeof TONS}>x</Card>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.classList.contains("card-accent")).toBe(true);
      expect(el.classList.contains(`card-accent-${tom}`)).toBe(true);
      expect(css).toMatch(new RegExp(`\\.card-accent-${tom}\\s*\\{\\s*--card-accent:\\s*var\\(${cor}\\);`));
    });
  }

  test("o traço é a borda de cima, e vence o escolhido, o perigo e o contorno do contrast", () => {
    // Duas classes de força, e DEPOIS das regras que mudam a borda inteira.
    expect(regra(".card.card-accent")).toMatch(/border-top:\s*var\(--accent-width\)\s+solid\s+var\(--card-accent\)/);
    const traco = css.indexOf(".card.card-accent");
    for (const antes of [".card-selected", ".card-danger", '[data-theme="dark"] .card-contrast']) {
      expect(css.indexOf(antes)).toBeGreaterThan(-1);
      expect(css.indexOf(antes)).toBeLessThan(traco);
    }
  });

  test("sem accent, nenhuma classe de traço", () => {
    const {container} = render(<Card>x</Card>);
    expect((container.firstElementChild as HTMLElement).className).not.toMatch(/card-accent/);
  });
});

describe("A faixa escura numa página de marca (achado do MT-01)", () => {
  for (const tema of ["dark", "light"]) {
    test(`a marca lory chega a um pedaço com data-theme="${tema}"`, () => {
      const par = `[data-brand="lory"][data-theme="${tema}"]`;
      const dentro = `[data-brand="lory"] [data-theme="${tema}"]`;
      expect(tokens).toContain(`${par},${dentro}{`);
    });
  }

  test("a Section theme continua pondo só o tema no elemento (a marca vem do ancestral)", () => {
    const {container} = render(<Section theme="dark">x</Section>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("data-theme")).toBe("dark");
    expect(el.hasAttribute("data-brand")).toBe(false);
  });
});
