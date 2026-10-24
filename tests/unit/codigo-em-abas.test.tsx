// O CÓDIGO EM ABAS (bloco 1, o 3-A — 23/10/2026): `CodeBlock tabs` e as quatro abas de instalar nas páginas de texto do
// site (npm, pnpm, yarn, bun — o npm primeiro, como a documentação da referência). Provado contra o defeito: na 0.42.0 o
// `CodeBlock` não lê `tabs` (desenha um bloco vazio) e o Quick Start só tem o `pnpm add`.
import {fireEvent, render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, test} from "vitest";
import {AureaProvider, CodeBlock} from "../../packages/react/src/index.js";

const ABAS = [{label: "npm", code: "npm i x"}, {label: "pnpm", code: "pnpm add x"}, {label: "yarn", code: "yarn add x"},
  {label: "bun", code: "bun add x"}];

describe("CodeBlock tabs", () => {
  test("uma fileira de abas, a primeira escolhida, e um painel por aba que o `aurea.js` sabe trocar", () => {
    const {getAllByRole, container} = render(<AureaProvider><CodeBlock language="bash" tabs={ABAS} /></AureaProvider>);
    const abas = getAllByRole("tab");
    expect(abas.map((a) => a.textContent)).toEqual(["npm", "pnpm", "yarn", "bun"]);
    expect(abas[0]).toHaveAttribute("aria-selected", "true");
    const paineis = [...container.querySelectorAll("[role=tabpanel]")];
    expect(paineis).toHaveLength(4);
    expect(paineis.every((p) => p.hasAttribute("data-aurea-tabpanel"))).toBe(true);
    expect(paineis.map((p) => (p as HTMLElement).hidden)).toEqual([false, true, true, true]);
    expect(paineis[0].textContent).toContain("npm i x");
    for (const [i, a] of abas.entries()) expect(a).toHaveAttribute("aria-controls", paineis[i].id);
  });
  test("a seta leva à próxima, o clique escolhe, e o fim volta ao começo", () => {
    const {getAllByRole, container} = render(<AureaProvider><CodeBlock language="bash" tabs={ABAS} /></AureaProvider>);
    const abas = getAllByRole("tab");
    fireEvent.keyDown(abas[0], {key: "ArrowRight"});
    expect(getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
    fireEvent.click(getAllByRole("tab")[3]);
    expect(getAllByRole("tab")[3]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(getAllByRole("tab")[3], {key: "ArrowRight"});
    expect(getAllByRole("tab")[0]).toHaveAttribute("aria-selected", "true");
    expect([...container.querySelectorAll("[role=tabpanel]")].map((p) => (p as HTMLElement).hidden)).toEqual([false, true, true, true]);
  });
});

describe("as quatro abas de instalar nas páginas de texto do site (o `build-catalog` montado)", () => {
  const pagina = (f: string) => readFileSync(join(__dirname, "../../apps/catalog", f), "utf8");
  test.each(["docs-quick-start.html", "docs-frameworks.html", "docs-dark-mode.html"])("%s: o `pnpm add` virou npm, pnpm, yarn e bun, nessa ordem", (f) => {
    const html = pagina(f);
    expect(html).toContain('class="code-tabs"');
    const ordem = ["npm i ", "pnpm add ", "yarn add ", "bun add "].map((c) => html.indexOf(c, html.indexOf('class="code-tabs"')));
    expect(ordem.every((i) => i > 0)).toBe(true);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
  });
});
