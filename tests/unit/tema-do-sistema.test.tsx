// O D16 na web (0.72.0; aprovado pelo Victor em 19/10/2026, e a bancada em 16/11/2026: "Pode"): a página sem `data-theme`
// segue o sistema, e o claro quando ele não diz escuro.
//   • a MONTAGEM (`scripts/tema-implicito.mjs`): cada regra de tema ganha a cópia para a raiz sem atributo, dentro da
//     pergunta ao sistema, com o mesmo peso; a folha publicada tem as cópias dos tokens e do core;
//   • o `useAureaTheme` devolve o tema do sistema quando o `<html>` não tem atributo, e alternar parte dele;
//   • o `aurea.js` alterna a partir do sistema.
// No navegador, a página inteira é medida elemento por elemento em `tests/visual/tema-do-sistema.spec.ts`.
// Provado contra o defeito: sem o `tema-implicito.mjs` a folha não tem nenhum `prefers-color-scheme`; com o hook da 0.71.0,
// o tema sem atributo é `null`, e no escuro do sistema o primeiro clique leva ao escuro (nada muda na tela).
import {act, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {afterEach, describe, expect, test} from "vitest";
import {copiaDoMembro, temaImplicito, RAIZ_SEM_TEMA} from "../../scripts/tema-implicito.mjs";
import {AureaProvider, useAureaTheme} from "../../packages/react/src/index";

const GUARDA_CLARO = ':where(:not([data-theme="dark"] *),[data-theme="dark"] [data-theme="light"] *)';

describe("D16 · a cópia de cada regra de tema", () => {
  test("a regra do escuro ganha a cópia dentro de `prefers-color-scheme: dark`, com a guarda de região", () => {
    const saida = temaImplicito(`[data-theme="dark"] .x:where(:not([data-theme="light"] *),[data-theme="light"] [data-theme="dark"] *){color:red}`);
    expect(saida).toContain(`@media (prefers-color-scheme: dark){${RAIZ_SEM_TEMA} .x:where(:not([data-theme] *)){color:red}}`);
  });
  test("a do claro, no \"não escuro\" — o claro quando o sistema não diz", () => {
    const saida = temaImplicito(`[data-theme="light"] .x${GUARDA_CLARO}{color:blue}`);
    expect(saida).toContain(`@media not all and (prefers-color-scheme: dark){${RAIZ_SEM_TEMA} .x:where(:not([data-theme] *)){color:blue}}`);
  });
  test("o bloco do tema e o da marca com tema", () => {
    expect(copiaDoMembro('[data-theme="dark"]')).toEqual({tema: "dark", seletor: RAIZ_SEM_TEMA});
    expect(copiaDoMembro('[data-brand="sun"][data-theme="light"]')).toEqual({tema: "light", seletor: `[data-brand="sun"]${RAIZ_SEM_TEMA}`});
  });
  test("o tema escrito MAIS ADIANTE no seletor é do HTML, e fica sem cópia", () => {
    expect(copiaDoMembro('[data-brand="sun"] [data-theme="dark"]')).toBeNull();
    expect(copiaDoMembro(":root,[data-theme]")).toBeNull();
  });
  test("a cópia entra logo depois da regra dela, e dentro do @media em que a regra mora", () => {
    const saida = temaImplicito(`a{x:1}@media (min-width:1px){[data-theme="dark"]{y:2}}b{z:3}`);
    expect(saida).toBe(`a{x:1}@media (min-width:1px){[data-theme="dark"]{y:2}\n@media (prefers-color-scheme: dark){${RAIZ_SEM_TEMA}{y:2}}}b{z:3}`);
  });
  test("uma regra de tema sem a guarda de região reprova a montagem (ninguém esquece a guarda)", () => {
    expect(() => temaImplicito(`[data-theme="light"] .x{color:blue}`)).toThrow(/guarda/);
  });
  test("a folha publicada tem as cópias: os dois temas e as doze marcas nos tokens, e as regras do core", () => {
    const tokens = readFileSync(join(process.cwd(), "packages/tokens/dist/aurea.tokens.css"), "utf8");
    const core = readFileSync(join(process.cwd(), "packages/core/dist/aurea.css"), "utf8");
    expect(tokens.match(/prefers-color-scheme/g)?.length).toBe(26);
    expect(core.match(/prefers-color-scheme/g)?.length).toBeGreaterThan(26);
    expect(core).toContain(`@media (prefers-color-scheme: dark){${RAIZ_SEM_TEMA}{`);
  });
});

describe("D16 · o useAureaTheme numa página sem atributo", () => {
  const original = window.matchMedia;
  const sistema = (escuro: boolean) => {
    window.matchMedia = ((q: string) => ({matches: escuro && q.includes("dark"), media: q,
      addEventListener() {}, removeEventListener() {}})) as unknown as typeof window.matchMedia;
  };
  afterEach(() => { window.matchMedia = original; delete document.documentElement.dataset.theme; });

  function Palco() {
    const {theme, toggleTheme} = useAureaTheme();
    return <><span data-testid="tema">{theme ?? "-"}</span><button onClick={toggleTheme}>alternar</button></>;
  }

  test("o sistema escuro: o tema na tela é o escuro, e o primeiro clique leva ao claro", async () => {
    sistema(true);
    const u = userEvent.setup();
    render(<Palco />);
    expect(screen.getByTestId("tema")).toHaveTextContent("dark");
    await u.click(screen.getByRole("button", {name: "alternar"}));
    expect(document.documentElement.dataset.theme).toBe("light");
  });
  test("dentro do provedor também: no escuro do sistema, alternar leva ao claro", async () => {
    sistema(true);
    const u = userEvent.setup();
    render(<AureaProvider><Palco /></AureaProvider>);
    await act(async () => {});
    await u.click(screen.getByRole("button", {name: "alternar"}));
    expect(document.documentElement.dataset.theme).toBe("light");
  });
  test("o sistema claro: o claro, e o clique leva ao escuro", async () => {
    sistema(false);
    const u = userEvent.setup();
    render(<Palco />);
    expect(screen.getByTestId("tema")).toHaveTextContent("light");
    await u.click(screen.getByRole("button", {name: "alternar"}));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
  test("o atributo escrito manda sobre o sistema", () => {
    sistema(true);
    document.documentElement.dataset.theme = "light";
    render(<Palco />);
    expect(screen.getByTestId("tema")).toHaveTextContent("light");
  });
});

describe("D16 · o aurea.js alterna a partir do sistema", () => {
  test("sem atributo e com o sistema escuro, o toggleTheme vai ao claro; com o claro, ao escuro", () => {
    const original = window.matchMedia;
    try {
      new Function(readFileSync(join(process.cwd(), "packages/core/src/aurea.js"), "utf8"))();
      const aurea = (window as unknown as {Aurea: {toggleTheme(): void}}).Aurea;
      for (const [escuro, depois] of [[true, "light"], [false, "dark"]] as const) {
        delete document.documentElement.dataset.theme;
        window.matchMedia = ((q: string) => ({matches: escuro && q.includes("dark"), media: q,
          addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}})) as unknown as typeof window.matchMedia;
        aurea.toggleTheme();
        expect(document.documentElement.dataset.theme).toBe(depois);
      }
    } finally { window.matchMedia = original; delete document.documentElement.dataset.theme; }
  });
});
