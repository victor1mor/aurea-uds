// 15/10/2026 · a chave de tema de TRÊS posições do topo da referência (o Victor: "A, B, C, pode"): o `ThemeToggle` com
// `mode="light-dark-system"` e o `AureaProvider` com a preferência `"system"` — seguir o claro/escuro do sistema e mudar
// junto com ele. O documento recebe sempre o tema RESOLVIDO (o CSS só conhece `dark` e `light`).
// Provado contra o defeito: até a 0.32.0 não havia `"system"` nem a chave; o `ThemeToggle` era só o botão que alterna.
import {act, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import {AureaProvider, ThemeToggle} from "../../packages/react/src/index";

// O `matchMedia` do jsdom não existe: um dublê com o esquema do sistema que o teste muda.
let escuro = true;
const ouvintes = new Set<() => void>();
beforeEach(() => {
  escuro = true; ouvintes.clear();
  vi.stubGlobal("matchMedia", (q: string) => ({
    get matches() { return q.includes("dark") ? escuro : false; }, media: q,
    addEventListener: (_: string, f: () => void) => ouvintes.add(f), removeEventListener: (_: string, f: () => void) => ouvintes.delete(f),
  }));
  delete document.documentElement.dataset.theme;
});
afterEach(() => vi.unstubAllGlobals());
const mudaSistema = (eEscuro: boolean) => act(() => { escuro = eEscuro; ouvintes.forEach((f) => f()); });

describe("ThemeToggle de três posições", () => {
  test("é um grupo de opções com nome, Claro / Escuro / Sistema, e a escolhida marcada", () => {
    render(<AureaProvider defaultTheme="dark"><ThemeToggle mode="light-dark-system" /></AureaProvider>);
    const grupo = screen.getByRole("radiogroup", {name: "Theme"});
    expect([...grupo.querySelectorAll("input")].map((i) => i.getAttribute("aria-label"))).toEqual(["Light", "Dark", "System"]);
    expect(screen.getByRole("radio", {name: "Dark"})).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  test("Sistema segue o esquema do computador e muda junto; o aviso diz o que foi escolhido", () => {
    const escolheu = vi.fn(), tela = vi.fn();
    render(<AureaProvider defaultTheme="light" onThemePreferenceChange={escolheu} onThemeChange={tela}><ThemeToggle mode="light-dark-system" /></AureaProvider>);
    expect(document.documentElement.dataset.theme).toBe("light");
    fireEvent.click(screen.getByRole("radio", {name: "System"}));
    expect(escolheu).toHaveBeenLastCalledWith("system");
    expect(tela).toHaveBeenLastCalledWith("dark");
    expect(screen.getByRole("radio", {name: "System"})).toBeChecked();
    expect(document.documentElement.dataset.theme, "o sistema está no escuro").toBe("dark");
    mudaSistema(false);
    expect(document.documentElement.dataset.theme, "o sistema mudou para o claro").toBe("light");
    fireEvent.click(screen.getByRole("radio", {name: "Dark"}));
    mudaSistema(false);
    expect(document.documentElement.dataset.theme, "escolhido Escuro, o sistema não manda mais").toBe("dark");
  });

  test("sem `mode`, o botão de sempre (o que alterna)", async () => {
    render(<AureaProvider defaultTheme="dark"><ThemeToggle /></AureaProvider>);
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(await screen.findByRole("button", {name: "Switch to light theme"})).toBeInTheDocument();
  });
});
