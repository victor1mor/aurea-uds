// M-01 (Lote 3, decisão do Victor de 25/09/2026) · `render` só onde o app precisa do roteador: o
// `Button`, o `IconButton` e os itens de navegação. O `Link` abaixo faz o papel do link de um
// roteador (Next.js, React Router): um componente que desenha `<a>` e cuida do destino sozinho.
// Entradas escolhidas para reprovar no código antigo: sem `render`, sai `<button>`.
import {fireEvent, render as montar} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {AureaProvider, BottomNav, Breadcrumb, Button, IconButton, NavList, Sidebar} from "../../packages/react/src/index.js";

const Link = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & {to: string}>(
  function Link({to, ...p}, ref) { return <a ref={ref} href={to} data-roteador="" {...p} />; });
const P = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;

describe("M-01 · Button e IconButton com render", () => {
  it("o Link do roteador vira o botão: pele, conteúdo e destino dele", () => {
    const {container} = montar(<P><Button render={<Link to="/relatorios" />} leadingIcon="add" tone="brand">Novo</Button></P>);
    const a = container.querySelector("a[data-roteador]") as HTMLAnchorElement;
    expect(a).not.toBeNull();
    expect(a.getAttribute("href")).toBe("/relatorios");
    expect(a.classList.contains("btn")).toBe(true);
    expect(a.textContent).toContain("Novo");
    expect(a.querySelector("svg.icon")).not.toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });
  it("a classe de quem usa soma à pele", () => {
    const {container} = montar(<P><Button render={<Link to="/x" className="minha" />}>x</Button></P>);
    const a = container.querySelector("a")!;
    expect(a.classList.contains("btn")).toBe(true);
    expect(a.classList.contains("minha")).toBe(true);
  });
  it("desativado: o clique é barrado também no elemento, e ele anuncia aria-disabled", () => {
    const clicou = vi.fn();
    const {container} = montar(<P><Button disabled render={<Link to="/x" onClick={clicou} />}>x</Button></P>);
    const a = container.querySelector("a")!;
    fireEvent.click(a);
    expect(clicou).not.toHaveBeenCalled();
    expect(a.getAttribute("aria-disabled")).toBe("true");
  });
  it("ativo: o clique do elemento passa", () => {
    const clicou = vi.fn();
    const {container} = montar(<P><Button render={<Link to="/x" onClick={clicou} />}>x</Button></P>);
    fireEvent.click(container.querySelector("a")!);
    expect(clicou).toHaveBeenCalledTimes(1);
  });
  it("IconButton passa o render adiante, com o nome acessível", () => {
    const {container} = montar(<P><IconButton icon="add" label="Adicionar" render={<Link to="/novo" />} /></P>);
    const a = container.querySelector("a")!;
    expect(a.classList.contains("btn-icon")).toBe(true);
    expect(a.getAttribute("aria-label")).toBe("Adicionar");
    expect(a.getAttribute("href")).toBe("/novo");
  });
});

describe("M-01 · itens de navegação com render", () => {
  it("Sidebar: o item vira o Link, com a pele e a página atual", () => {
    const {container} = montar(<P><Sidebar current="r" items={[{id: "r", label: "Relatórios", render: <Link to="/relatorios" />}]} /></P>);
    const a = container.querySelector("a[data-roteador]")!;
    expect(a.classList.contains("sidebar-item")).toBe(true);
    expect(a.getAttribute("aria-current")).toBe("page");
    expect(a.textContent).toContain("Relatórios");
  });
  it("BottomNav usa o mesmo item", () => {
    const {container} = montar(<P><BottomNav current="r" items={[{id: "r", label: "Relatórios", render: <Link to="/relatorios" />}]} /></P>);
    const a = container.querySelector("a[data-roteador]")!;
    expect(a.classList.contains("bottom-nav-item")).toBe(true);
    expect(a.getAttribute("aria-current")).toBe("page");
  });
  it("NavList: linha com render tem destino, e leva a seta", () => {
    const {container} = montar(<P><NavList items={[{id: "a", label: "Conta", render: <Link to="/conta" />}]} /></P>);
    const a = container.querySelector("a[data-roteador]")!;
    expect(a.classList.contains("nav-list-row")).toBe(true);
    expect(a.querySelector(".nav-list-chevron")).not.toBeNull();
  });
  it("Breadcrumb: o passo com render vira o Link", () => {
    const {container} = montar(<P><Breadcrumb items={[{label: "Início", render: <Link to="/" />}, {label: "Relatórios"}]} /></P>);
    expect(container.querySelector("a[data-roteador]")?.textContent).toBe("Início");
  });
});
