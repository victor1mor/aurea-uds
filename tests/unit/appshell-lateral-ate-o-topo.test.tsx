// MNT-34 (23/10/2026) · o `AppShell` com a lateral até o topo (`layout="sidebar"`), o pedido do app de rede e o PV-04 de
// um segundo app, na bancada aprovada pelo Victor (*"mantenha o atual e faça também os outros 4"*; *"Aprovado o MNT-34"*).
// O que o React desenha; a medida (a lateral de 0 ao fim da janela, o conteúdo, o botão a 12 do título) é do
// `tests/visual/appshell-lateral-ate-o-topo.spec.ts`. A largura da janela é simulada pelo `matchMedia`.
// Provado contra o defeito: com o `AppShell` da 0.41.0 não havia `layout="sidebar"` (a barra de cima saía sempre, com a
// marca nela), nem `sidebarFooter`, nem `AppShell.SidebarToggle`.
import {fireEvent, render} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {AppShell, AureaProvider, Sidebar} from "../../packages/react/src/index";

const ITENS = [{id: "a", label: "Início", icon: "house", href: "#a"}, {id: "b", label: "Ajustes", icon: "gear", href: "#b"}] as never;
function janela(largura: number) {
  vi.stubGlobal("matchMedia", (q: string) => {
    const min = /min-width:\s*(\d+)px/.exec(q), max = /max-width:\s*(\d+)px/.exec(q);
    const casa = (!min || largura >= +min[1]) && (!max || largura <= +max[1]);
    return {matches: casa, media: q, addEventListener: () => {}, removeEventListener: () => {}};
  });
}
afterEach(() => { vi.unstubAllGlobals(); });
const marca = <Sidebar.Brand logo="R" name="Rede" description="Gestão da rede" />;
const pe = <span data-pe="">Ana Souza</span>;
const shell = (props: Record<string, unknown>, filhos: React.ReactNode = "conteúdo") =>
  render(<AureaProvider><AppShell brand={marca} navItems={ITENS} currentNavId="a" {...props}>{filhos}</AppShell></AureaProvider>);

describe("MNT-34 · a lateral até o topo", () => {
  it("sem `topbar`: não há barra de cima; a marca mora no topo da lateral, e o pé, no pé dela", () => {
    janela(1508);
    const {container} = shell({layout: "sidebar", sidebarFooter: pe});
    const raiz = container.querySelector(".app-shell")!;
    expect(raiz).toHaveClass("app-shell-lateral");
    expect(raiz.querySelector(".topbar")).toBeNull();
    const lateral = raiz.querySelector(":scope > .sidebar")!;
    expect(lateral.querySelector(":scope > .sidebar-header .sidebar-brand")).not.toBeNull();
    expect(lateral.querySelector(":scope > .sidebar-footer [data-pe]")).not.toBeNull();
    // A coluna do conteúdo leva o <main>; e a faixa estreita (o botão da gaveta e a marca) existe para abaixo de 1024.
    expect(raiz.querySelector(":scope > .app-shell-column > main.content")).not.toBeNull();
    const faixa = raiz.querySelector(":scope > .app-shell-column > .app-shell-narrow-bar")!;
    expect(faixa.querySelector(".nav-toggle")).not.toBeNull();
  });

  it("com `topbar`: a barra fica só sobre o conteúdo (dentro da coluna), rente e pequena, com o botão da gaveta", () => {
    janela(1508);
    const {container} = shell({layout: "sidebar", topbar: <strong>Dispositivos</strong>});
    const raiz = container.querySelector(".app-shell")!;
    expect(raiz.querySelector(":scope > .topbar")).toBeNull();
    const barra = raiz.querySelector(":scope > .app-shell-column > .topbar")!;
    expect(barra).toHaveClass("topbar-flush", "topbar-sm");
    expect(barra.textContent).toContain("Dispositivos");
    expect(barra.querySelector(".nav-toggle")).not.toBeNull();
    expect(raiz.querySelector(".app-shell-narrow-bar")).toBeNull();
  });

  it("com `sidebarCollapsible`: sai a bolinha da junção; o botão aprovado (o de ícone de lateral) entra no começo da barra", () => {
    janela(1508);
    const {container, getByRole} = shell({layout: "sidebar", sidebarCollapsible: true, topbar: <strong>Dispositivos</strong>});
    expect(container.querySelector(".sidebar-toggle-slot")).toBeNull();
    const botao = getByRole("button", {name: "Collapse sidebar"});
    expect(botao).toHaveClass("sidebar-collapse-trigger", "btn-ghost", "btn-icon");
    expect(botao.querySelector("use")!.getAttribute("href")).toMatch(/#i-sidebar-simple$/);
    expect(container.querySelector(".app-shell-column > .topbar")!.contains(botao)).toBe(true);
    expect(botao).toHaveAttribute("aria-controls", container.querySelector(".app-shell > .sidebar")!.id);
  });

  it("`AppShell.SidebarToggle` ao lado do título do app: recolhe, troca o nome e o estado; sem `sidebarCollapsible`, não aparece", () => {
    janela(1508);
    const titulo = <div><AppShell.SidebarToggle /><h1>Dispositivos</h1></div>;
    const {container, getByRole} = shell({layout: "sidebar", sidebarCollapsible: true}, titulo);
    const botao = getByRole("button", {name: "Collapse sidebar"});
    expect(botao).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(botao);
    expect(container.querySelector(".app-shell > .sidebar")).toHaveClass("sidebar-collapsed");
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(botao).toHaveAccessibleName("Expand sidebar");
    const sem = render(<AureaProvider><AppShell layout="sidebar" brand={marca} navItems={ITENS}>{titulo}</AppShell></AureaProvider>);
    expect(sem.container.querySelector(".sidebar-collapse-trigger")).toBeNull();
  });

  it("o arranjo de sempre não muda: a barra atravessa a tela com a marca, e a bolinha da junção continua", () => {
    janela(1508);
    const {container} = shell({sidebarCollapsible: true, topbar: <strong>x</strong>});
    const raiz = container.querySelector(".app-shell")!;
    expect(raiz).not.toHaveClass("app-shell-lateral");
    expect(raiz.querySelector(":scope > .topbar .brand .sidebar-brand")).not.toBeNull();
    expect(raiz.querySelector(":scope > .sidebar-toggle-slot")).not.toBeNull();
    expect(raiz.querySelector(".app-shell-column, .sidebar-collapse-trigger")).toBeNull();
  });

  it("`sidebarFooter` vale em qualquer arranjo (o pé fixo da lateral, 4-C)", () => {
    janela(1508);
    const {container} = shell({sidebarFooter: pe});
    expect(container.querySelector(".app-shell > .sidebar > .sidebar-footer [data-pe]")).not.toBeNull();
  });
});
