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
    // os pontos de quebra são em `em` (ADR-0092): com a fonte padrão, 1em = 16px
    const px = (m: RegExpExecArray | null) => m && +m[1] * (m[2] === "em" ? 16 : 1);
    const min = px(/min-width:\s*([\d.]+)(px|em)/.exec(q)), max = px(/max-width:\s*([\d.]+)(px|em)/.exec(q));
    const casa = (min === null || largura >= min) && (max === null || largura <= max);
    return {matches: casa, media: q, addEventListener: () => {}, removeEventListener: () => {}};
  });
}
afterEach(() => { vi.unstubAllGlobals(); });
const shell = (props: Record<string, unknown>) =>
  render(<AureaProvider><AppShell brand={<strong data-marca="">Aurea</strong>} navItems={ITENS} {...props}>conteúdo</AppShell></AureaProvider>);
// O botão de recolher: desde o lote 106 (a troca da ADR-0056), o `Sidebar.Toggle` na barra de cima.
const BOTAO = ".topbar .sidebar-collapse-trigger";

describe("AppShell · AN-01", () => {
  it("sem `sidebarCollapsible`, o shell é o de antes: sem botão e sem classe nova", () => {
    janela(1508);
    const {container} = shell({sidebarCollapsed: true});
    expect(container.querySelector(".sidebar-collapse-trigger, .sidebar-toggle-slot")).toBeNull();
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
    const botao = container.querySelector(BOTAO)!;
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
    fireEvent.click(container.querySelector(BOTAO)!);
    expect(aviso).toHaveBeenCalledWith(true);
    expect(container.querySelector(".sidebar")).not.toHaveClass("sidebar-collapsed");
  });

  // A troca da ADR-0056 (lote 106, 26/11/2026, "Na barra de cima"): o botão saiu da junção da lateral com o conteúdo e foi
  // para a barra de cima, ANTES da marca. Provado contra o defeito: com o código de antes, o botão morava num
  // `.sidebar-toggle-slot` fora da barra, e este teste reprova.
  it("o botão de recolher fica na barra de cima, antes da marca, e a junção não tem botão", () => {
    janela(1508);
    const {container} = shell({sidebarCollapsible: true});
    const botao = container.querySelector(BOTAO)!;
    expect(botao).not.toBeNull();
    expect(container.querySelector(".sidebar-toggle-slot")).toBeNull();
    const marca = container.querySelector(".topbar [data-marca]")!;
    expect(botao.compareDocumentPosition(marca) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

// SYL-01 (lote 106, 26/11/2026, "Sem itens, sem lateral"): o app que não passa menu nenhum não ganha uma lateral vazia, nem
// o botão da gaveta, nem o de recolher. Provado contra o defeito: com o código de antes, a `.sidebar` vazia aparecia.
describe("AppShell · SYL-01", () => {
  const sem = (props: Record<string, unknown> = {}) =>
    render(<AureaProvider><AppShell brand="Aurea" {...props}>conteúdo</AppShell></AureaProvider>);
  it("sem itens, sem navegação e sem pé: nenhuma lateral, e o conteúdo com a largura", () => {
    janela(1508);
    const {container} = sem({sidebarCollapsible: true});
    expect(container.querySelector(".sidebar")).toBeNull();
    expect(container.querySelector(".nav-toggle, .sidebar-collapse-trigger")).toBeNull();
    expect(container.querySelector(".app-shell")).toHaveClass("app-shell-no-sidebar");
  });
  it("com uma lista vazia de itens, também não", () => {
    janela(1508);
    const {container} = sem({navItems: []});
    expect(container.querySelector(".sidebar")).toBeNull();
  });
  it("com navegação, com itens ou com o pé, a lateral continua", () => {
    janela(1508);
    for (const props of [{navigation: <nav>menu</nav>}, {navItems: ITENS}, {sidebarFooter: <span>pé</span>}]) {
      const {container, unmount} = sem(props);
      expect(container.querySelector(".sidebar"), Object.keys(props)[0]).not.toBeNull();
      expect(container.querySelector(".app-shell")).not.toHaveClass("app-shell-no-sidebar");
      unmount();
    }
  });
  it("no `layout=\"sidebar\"` a lateral leva a marca, e continua", () => {
    janela(1508);
    const {container} = sem({layout: "sidebar"});
    expect(container.querySelector(".sidebar")).not.toBeNull();
  });
});
