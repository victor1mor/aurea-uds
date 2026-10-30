// MNT-37 (30/10/2026) · a ponta da barra de cima do `AppShell` (`topbarActions`). O app de rede pôs a chave de tema no
// `topbar` do `layout="sidebar"` e ela ficou colada no botão de recolher, à esquerda: o shell não repassava o `actions` do
// `Header` (o encaixe da ponta direita), e a barra do conteúdo alinha tudo pelo começo (o conserto da 0.42.0). A ADR-0080
// já dizia "as ações podem ir para a direita". O que o React desenha; a medida (a ponta a 20 da borda, alinhada com o
// título) é do `tests/visual/appshell-ponta-da-barra.spec.ts`.
// Provado contra o defeito: com o `AppShell` da 0.50.0 o `topbarActions` não existia — caía nas props do `<div>` e não
// desenhava nada; reprovam os 5 primeiros.
import {render} from "@testing-library/react";
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
const tema = <button type="button" data-tema="">Tema</button>;
const shell = (props: Record<string, unknown>) =>
  render(<AureaProvider><AppShell brand={marca} navItems={ITENS} currentNavId="a" sidebarCollapsible {...props}>conteúdo</AppShell></AureaProvider>);

describe("MNT-37 · a ponta da barra de cima", () => {
  it("`layout=\"sidebar\"` com título e ponta: o botão de recolher, o título e, por último, a ponta no encaixe do `Header`", () => {
    janela(1280);
    const {container} = shell({layout: "sidebar", sidebarVariant: "flush", topbar: <strong data-titulo="">Dispositivos</strong>, topbarActions: tema});
    const barra = container.querySelector(".app-shell-column > header.topbar")!;
    const ponta = barra.querySelector(":scope > .topbar-actions")!;
    expect(ponta.querySelector("[data-tema]")).not.toBeNull();
    expect(barra.lastElementChild, "a ponta é a última da barra").toBe(ponta);
    expect(barra.querySelector(":scope > .brand .sidebar-collapse-trigger")).not.toBeNull();
    expect(barra.querySelector(":scope > [data-titulo]")).not.toBeNull();
  });

  it("`layout=\"sidebar\"` só com a ponta: a barra do conteúdo passa a existir (e a faixa estreita sai)", () => {
    janela(1280);
    const {container} = shell({layout: "sidebar", topbarActions: tema});
    const coluna = container.querySelector(".app-shell-column")!;
    expect(coluna.querySelector(":scope > header.topbar > .topbar-actions [data-tema]")).not.toBeNull();
    expect(coluna.querySelector(":scope > header.topbar .nav-toggle"), "o botão da gaveta, para abaixo de 1024").not.toBeNull();
    expect(coluna.querySelector(":scope > .app-shell-narrow-bar")).toBeNull();
  });

  it("o arranjo de sempre: a ponta no encaixe do `Header`, depois do `topbar`", () => {
    janela(1280);
    const {container} = shell({topbar: <span data-secoes="">Seções</span>, topbarActions: tema});
    const barra = container.querySelector(".app-shell > header.topbar")!;
    expect(barra.querySelector(":scope > .topbar-actions [data-tema]")).not.toBeNull();
    expect(barra.lastElementChild).toHaveClass("topbar-actions");
  });

  it("`layout=\"docs\"`: o botão da gaveta continua o ÚLTIMO, depois da ponta", () => {
    janela(1280);
    const {container} = shell({layout: "docs", topbarActions: tema});
    const ponta = container.querySelector(".app-shell > header.topbar .topbar-actions")!;
    expect(ponta.querySelector("[data-tema]")).not.toBeNull();
    expect(ponta.lastElementChild, "a gaveta depois da ponta").toHaveClass("nav-toggle");
    expect(container.querySelectorAll(".app-shell > header.topbar .nav-toggle")).toHaveLength(1);
  });

  it("a prop não vaza como atributo do `<div>` do shell", () => {
    janela(1280);
    const {container} = shell({layout: "sidebar", topbarActions: tema});
    const raiz = container.querySelector(".app-shell")!;
    expect(raiz.getAttribute("topbaractions")).toBeNull();
    expect(raiz.getAttribute("topbarActions")).toBeNull();
    expect(container.querySelectorAll("[data-tema]")).toHaveLength(1);
  });

  it("sem a ponta, nada muda: sem encaixe, a faixa estreita no `sidebar` e a gaveta solta no fim da barra do `docs`", () => {
    janela(1280);
    const lateral = shell({layout: "sidebar"}).container;
    expect(lateral.querySelector(".topbar")).toBeNull();
    expect(lateral.querySelector(".app-shell-column > .app-shell-narrow-bar")).not.toBeNull();
    const docs = shell({layout: "docs"}).container;
    // No `docs` a barra tem a largura do bloco: o miolo mora no `.topbar-inner`.
    const barra = docs.querySelector(".app-shell > header.topbar > .topbar-inner")!;
    expect(barra.querySelector(".topbar-actions")).toBeNull();
    expect(barra.lastElementChild).toHaveClass("nav-toggle");
  });
});
