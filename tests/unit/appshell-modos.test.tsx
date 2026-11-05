// O ALTO CONTRASTE E O TEXTO GRANDE NO APP INTEIRO (o MNT-30, bloco 3 — ADR-0090, 04/11/2026): o `AppShell` liga os dois
// modos (`highContrast`, `textSize="lg"`) na caixa dele E na raiz da página — os menus e as janelas abrem fora do shell,
// presos ao fim do documento, e sem a raiz sairiam sem o modo. Ao sair, a raiz volta ao que era. E a fonte dos tokens tem o
// texto grande (a letra 2 acima e o controle médio no alvo de toque). As cores e as medidas se medem no navegador
// (`tests/visual/acessibilidade-modos.spec.ts`).
// Provado contra o defeito: na 0.55.0 o `AppShell` não tem as duas props (caem no `<div>` como texto, sem atributo) e a
// fonte não tem o grupo `textSize` — reprovam.
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {afterEach, describe, expect, test} from "vitest";
import {AppShell} from "../../packages/react/src/index";

const fonte = JSON.parse(readFileSync("packages/tokens/src/aurea.tokens.json", "utf8"));
const raiz = document.documentElement;
afterEach(() => { raiz.removeAttribute("data-contrast"); raiz.removeAttribute("data-text"); });

describe("o AppShell liga os modos de leitura", () => {
  test("sem as props, nada: nem a caixa nem a raiz", () => {
    const {container} = render(<AppShell brand="App">conteúdo</AppShell>);
    const shell = container.querySelector(".app-shell") as HTMLElement;
    expect(shell.hasAttribute("data-contrast")).toBe(false);
    expect(shell.hasAttribute("data-text")).toBe(false);
    expect(raiz.hasAttribute("data-contrast")).toBe(false);
  });

  test("highContrast e textSize=\"lg\" marcam a caixa e a raiz, e a raiz volta ao sair", () => {
    raiz.setAttribute("data-text", "md-do-app");
    const {container, unmount} = render(<AppShell brand="App" highContrast textSize="lg">conteúdo</AppShell>);
    const shell = container.querySelector(".app-shell") as HTMLElement;
    expect(shell.getAttribute("data-contrast")).toBe("high");
    expect(shell.getAttribute("data-text")).toBe("lg");
    expect(raiz.getAttribute("data-contrast")).toBe("high");
    expect(raiz.getAttribute("data-text")).toBe("lg");
    unmount();
    expect(raiz.hasAttribute("data-contrast")).toBe(false);
    expect(raiz.getAttribute("data-text")).toBe("md-do-app");
  });

  test("textSize=\"md\" é o padrão: não marca nada", () => {
    const {container} = render(<AppShell brand="App" textSize="md">conteúdo</AppShell>);
    expect((container.querySelector(".app-shell") as HTMLElement).hasAttribute("data-text")).toBe(false);
    expect(raiz.hasAttribute("data-text")).toBe(false);
  });
});

describe("a fonte dos tokens tem o texto grande", () => {
  test("cada degrau da letra 2 acima, e o controle médio no alvo de toque", () => {
    const lg = fonte.textSize.lg;
    const rem = (n: string) => fonte.base[n].$value.value;
    for (const n of ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl"]) {
      expect(lg[n].$value.value - rem(n), n).toBeCloseTo(0.125);
    }
    expect(lg["control-h-md"].$value).toBe("{target-min}");
    expect(fonte.$extensions["ui.aurea"].selectors["textSize.lg"]).toBe('[data-text="lg"]');
  });
});
