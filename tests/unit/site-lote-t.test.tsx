// Lote T (17/10/2026) · o arranjo de documentação da referência, como VARIAÇÕES de peças que já existem (regra do Victor:
// componente não se exclui; peça nova entra como variação).
//   SITE-04: o `Header` ganhou `tabs`, `currentTab` e `tabsLabel` — a segunda linha, com as áreas do site e o ícone.
//   SITE-01 e SITE-02: o `AppShell` ganhou `layout="docs"` (o bloco centralizado, a lateral sem caixa) e passa as áreas
//            ao `Header` (`topbarTabs`, `topbarCurrentTab`, `topbarTabsLabel`); o `Container` ganhou `size="docs"`.
// O que o React emite; o efeito no navegador (as medidas, iguais às da página da referência) é medido no
// `tests/visual/site-docs-arranjo.spec.ts`.
// Provado contra o defeito: na 0.34.0 o `Header` ignora `tabs` (não há segunda linha) e o `AppShell` ignora `layout`.
import {render} from "@testing-library/react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";
import {AppShell, AureaProvider, Container, Header, type HeaderTab} from "../../packages/react/src/index";

const AREAS: HeaderTab[] = [
  {id: "docs", label: "Docs", href: "/docs", icon: <svg data-icone="livro" />},
  {id: "components", label: "Components", href: "/components"},
  {id: "tokens", label: "Tokens", href: "/tokens"},
];

describe("SITE-04 · o Header com a segunda linha", () => {
  test("sem `tabs`, nada muda", () => {
    const antes = renderToStaticMarkup(<Header brand="X" variant="flush" divider>filho</Header>);
    expect(antes).not.toContain("topbar-tabs");
    expect(antes).not.toContain("topbar-with-tabs");
  });

  test("as áreas saem numa navegação com nome, a atual marcada, e por último na ordem do Tab", () => {
    const {container} = render(<Header brand="Aurea" variant="flush" divider tabs={AREAS} currentTab="components"
      actions={<button type="button">ação</button>} />);
    const header = container.querySelector("header")!;
    expect(header.classList.contains("topbar-with-tabs")).toBe(true);
    const nav = header.querySelector("nav.topbar-tabs")!;
    expect(nav.getAttribute("aria-label")).toBe("Sections");
    const links = [...nav.querySelectorAll("a.topbar-tab")];
    expect(links.map((a) => a.textContent)).toEqual(["Docs", "Components", "Tokens"]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/docs", "/components", "/tokens"]);
    expect(links.map((a) => a.getAttribute("aria-current"))).toEqual([null, "page", null]);
    // O ícone é desenho: fora do nome que o leitor de tela lê.
    const icone = links[0].querySelector(".topbar-tab-icon")!;
    expect(icone.getAttribute("aria-hidden")).toBe("true");
    expect(icone.querySelector("[data-icone='livro']")).not.toBeNull();
    expect(links[1].querySelector(".topbar-tab-icon")).toBeNull();
    // A segunda linha é o ÚLTIMO do cabeçalho: o Tab passa pela marca e pelas ações antes (WCAG 2.4.3).
    const focaveis = [...header.querySelectorAll("a, button")];
    expect(focaveis.indexOf(links[0])).toBeGreaterThan(focaveis.findIndex((e) => e.textContent === "ação"));
  });

  test("o nome da segunda linha muda por `tabsLabel`", () => {
    const {container} = render(<Header brand="X" tabs={AREAS} tabsLabel="Áreas" />);
    expect(container.querySelector("nav.topbar-tabs")!.getAttribute("aria-label")).toBe("Áreas");
  });
});

describe("SITE-01 e SITE-02 · o AppShell em modo documentação", () => {
  const shell = (props: Partial<React.ComponentProps<typeof AppShell>>) => render(<AureaProvider>
    <AppShell brand="Aurea" topbarVariant="flush" navItems={[{id: "a", label: "A", href: "/a"}]} {...props}>texto</AppShell>
  </AureaProvider>);

  test("sem `layout`, o arranjo de sempre", () => {
    const {container} = shell({});
    expect(container.querySelector(".app-shell")!.classList.contains("app-shell-docs")).toBe(false);
    expect(container.querySelector(".container-docs")).toBeNull();
  });

  test("`layout=\"docs\"` marca o arranjo, e a barra de cima vai no bloco da documentação, na altura pequena", () => {
    const {container} = shell({layout: "docs", topbarDivider: true, topbarTabs: AREAS, topbarCurrentTab: "tokens"});
    expect(container.querySelector(".app-shell")!.classList.contains("app-shell-docs")).toBe(true);
    const header = container.querySelector("header.topbar")!;
    expect(header.classList.contains("topbar-sm")).toBe(true);
    expect(header.classList.contains("topbar-divider")).toBe(true);
    expect(header.querySelector(".topbar-inner")!.classList.contains("container-docs")).toBe(true);
    expect(header.querySelector(".topbar-tab[aria-current='page']")!.textContent).toBe("Tokens");
  });

  test("o Container tem a largura da documentação", () => {
    expect(renderToStaticMarkup(<Container size="docs">x</Container>)).toContain("container-docs");
  });
});
