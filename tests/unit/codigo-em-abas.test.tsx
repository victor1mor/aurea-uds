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

// O SITE B (02/11/2026): nas páginas de texto, a escolha do gerenciador é a CHAVE do desenho aprovado (pnpm, npm, yarn e
// bun, nessa ordem), na Quick Start e na Frameworks; a caixa de quatro abas de antes saiu delas com o desenho. A Dark Mode,
// como o desenho, mostra só o `pnpm add`.
describe("a chave do gerenciador nas páginas de texto do site (o `build-catalog` montado)", () => {
  const pagina = (f: string) => readFileSync(join(__dirname, "../../apps/catalog", f), "utf8");
  test.each([["docs-quick-start.html", "qs-pm"], ["docs-frameworks.html", "fw-pm"]])("%s: a chave %s com pnpm, npm, yarn e bun, nessa ordem", (f, chave) => {
    const html = pagina(f);
    const i = html.indexOf(`data-gs-chave="${chave}"`);
    expect(i).toBeGreaterThan(0);
    const valores = [...html.slice(i, i + 3000).matchAll(/data-valor="(pnpm|npm|yarn|bun)"/g)].map((m) => m[1]).slice(0, 4);
    expect(valores).toEqual(["pnpm", "npm", "yarn", "bun"]);
    expect(html).toContain("pnpm add ");
  });
});
