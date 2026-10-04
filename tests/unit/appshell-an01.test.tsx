// AN-01 · o `AppShell` com o botão de recolher — 03/10/2026. A medida e o comportamento vivo estão
// no navegador (`tests/visual/appshell-an01.spec.ts`); aqui ficam as duas travas que o navegador
// não precisa provar, e a largura da janela é simulada pelo `matchMedia`.
import {fireEvent, render} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {AppShell, AureaProvider} from "../../packages/react/src/index";

const ITENS = [{id: "a", label: "Início", icon: "house", href: "#a"}, {id: "b", label: "Ajustes", icon: "gear", href: "#b"}] as never;
// A janela simulada: `largura` decide quais consultas casam, como o navegador faria.
function janela(largura: number) {
  vi.stubGlobal("matchMedia", (q: string) => {
    const min = /min-width:\s*(\d+)px/.exec(q), max = /max-width:\s*(\d+)px/.exec(q);
    const casa = (!min || largura >= +min[1]) && (!max || largura <= +max[1]);
    return {matches: casa, media: q, addEventListener: () => {}, removeEventListener: () => {}};
  });
}
afterEach(() => { vi.unstubAllGlobals(); });
const shell = (props: Record<string, unknown>) =>
  render(<AureaProvider><AppShell brand="Aurea" navItems={ITENS} {...props}>conteúdo</AppShell></AureaProvider>);

describe("AppShell · AN-01", () => {
  it("sem `sidebarCollapsible`, o shell é o de antes: sem botão e sem classe nova", () => {
    janela(1508);
    const {container} = shell({sidebarCollapsed: true});
    expect(container.querySelector(".sidebar-toggle, .sidebar-toggle-slot")).toBeNull();
    expect(container.querySelector(".app-shell")!.className).toBe("app-shell");
    expect(container.querySelector(".sidebar")).toHaveClass("sidebar-collapsed");
  });

  it("na gaveta (abaixo de 1024) a lateral nunca é trilha — também para quem passa `sidebarCollapsed`", () => {
    janela(800);
    const {container} = shell({sidebarCollapsed: true});
    // Recolhida dentro da gaveta, o nome de cada item virava `.sr-only`: uma gaveta de ícones mudos.
    expect(container.querySelector(".sidebar")).not.toHaveClass("sidebar-collapsed");
    expect(container.querySelector(".sidebar-label")).not.toHaveClass("sr-only");
  });

  it("o botão alterna, controla a lateral, e avisa", () => {
    janela(1508);
    const aviso = vi.fn();
    const {container} = shell({sidebarCollapsible: true, onSidebarCollapsedChange: aviso});
    const botao = container.querySelector(".sidebar-toggle")!;
    expect(botao).toHaveAttribute("aria-controls", container.querySelector(".sidebar")!.id);
    expect(botao).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(botao);
    expect(container.querySelector(".sidebar")).toHaveClass("sidebar-collapsed");
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(aviso).toHaveBeenLastCalledWith(true);
  });

  it("entre 1024 e 1279 começa como trilha, sem clique", () => {
    janela(1100);
    const {container} = shell({sidebarCollapsible: true});
    expect(container.querySelector(".sidebar")).toHaveClass("sidebar-collapsed");
  });

  it("controlado: o clique avisa e não muda nada sozinho", () => {
    janela(1508);
    const aviso = vi.fn();
    const {container} = shell({sidebarCollapsible: true, sidebarCollapsed: false, onSidebarCollapsedChange: aviso});
    fireEvent.click(container.querySelector(".sidebar-toggle")!);
    expect(aviso).toHaveBeenCalledWith(true);
    expect(container.querySelector(".sidebar")).not.toHaveClass("sidebar-collapsed");
  });
});
