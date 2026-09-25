// ThemeToggle (web, 25/09/2026, pedido do Victor): o botão de claro e escuro com cor no ícone.
// Mostra o tema para onde se VAI — no claro a lua, no escuro o sol — e troca pelo `useAureaTheme`,
// com ou sem provider. A cor mora no CSS (`.theme-toggle-moon/-sun .icon`) e é medida no
// navegador pelo `skin.spec.ts`; aqui se prova o glifo, a classe, o nome e a troca.
import {act, fireEvent, render} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";
import * as React from "react";
import {AureaProvider, ThemeToggle, ptBR} from "../../packages/react/src/index.js";

afterEach(() => { delete document.documentElement.dataset.theme; });
const glifo = (b: Element) => b.querySelector("use")?.getAttribute("href") ?? "";

describe("ThemeToggle · web", () => {
  it("no claro: a lua, na classe da lua, com o nome de ir ao escuro", () => {
    document.documentElement.dataset.theme = "light";
    const {container} = render(<AureaProvider strings={ptBR}><ThemeToggle /></AureaProvider>);
    const b = container.querySelector("button")!;
    expect(glifo(b)).toContain("#i-moon");
    expect(b.classList.contains("theme-toggle-moon")).toBe(true);
    expect(b.classList.contains("btn-icon")).toBe(true);
    expect(b.getAttribute("aria-label")).toBe("Mudar para o tema escuro");
  });
  it("tocar troca o tema e o botão vira o sol amarelo, com o nome de voltar ao claro", async () => {
    document.documentElement.dataset.theme = "light";
    const {container} = render(<AureaProvider strings={ptBR} defaultTheme="light"><ThemeToggle /></AureaProvider>);
    await act(async () => { fireEvent.click(container.querySelector("button")!); });
    const b = container.querySelector("button")!;
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(glifo(b)).toContain("#i-sun");
    expect(b.classList.contains("theme-toggle-sun")).toBe(true);
    expect(b.getAttribute("aria-label")).toBe("Mudar para o tema claro");
  });
  it("sem provider também troca, pelo atributo do <html>", async () => {
    document.documentElement.dataset.theme = "dark";
    const {container} = render(<ThemeToggle />);
    expect(glifo(container.querySelector("button")!)).toContain("#i-sun");
    await act(async () => { fireEvent.click(container.querySelector("button")!); });
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
