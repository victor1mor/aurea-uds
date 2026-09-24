// G-A11Y-11 — o `Card` interativo é operável de verdade, e a pele funde no elemento de quem usa.
//
// O gate de navegador (`tests/visual/alvo-clicavel.spec.ts`) prova que nenhuma superfície do
// catálogo promete clique sem caminho de teclado. Este arquivo prova o outro lado: que o
// mecanismo que a API oferece FUNCIONA — o elemento chega ao DOM, a pele vai junto, e o teclado
// aciona.
//
// A união discriminada que torna `<Card variant="interactive">` sem `render` um erro de
// COMPILAÇÃO não é testável em runtime: ela é provada por `tsc`, e a prova está registrada no
// commit (a forma defeituosa falha com TS2322, a correta compila).
import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Card} from "../../packages/react/src/layout.js";

describe("Card: a superfície é da Aurea, o elemento é de quem consome", () => {
  it("sem `render`, continua sendo uma <div> — a variante base não mudou", () => {
    const {container} = render(<Card>conteúdo</Card>);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("DIV");
    expect(el.className).toBe("card");
  });

  it("com `render`, o ELEMENTO é o de quem consome e a pele vai junto", () => {
    const {container} = render(
      <Card variant="interactive" render={<button type="button" />}>alvo</Card>);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("BUTTON");
    expect(el.className).toContain("card");
    expect(el.className).toContain("card-interactive");
    expect(el.textContent).toBe("alvo");
  });

  it("um cartão de NAVEGAÇÃO é um <a href> — e é por isso que o componente não adivinha", () => {
    const {container} = render(
      <Card variant="interactive" render={<a href="/planos" />}>Plano Pro</Card>);
    const el = container.firstElementChild! as HTMLAnchorElement;
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("/planos");
  });

  // O COMPORTAMENTO REAL, que é o que o cartão prometia e não entregava: teclado.
  it("Enter e Space acionam o cartão interativo", async () => {
    const clicou = vi.fn();
    render(<Card variant="interactive" render={<button type="button" onClick={clicou} />}>
      Production</Card>);
    const alvo = screen.getByRole("button", {name: /production/i});
    alvo.focus();
    expect(document.activeElement).toBe(alvo);
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(clicou).toHaveBeenCalledTimes(2);
  });

  it("o cartão interativo é alcançável por Tab", async () => {
    render(<><button type="button">antes</button>
      <Card variant="interactive" render={<button type="button" />}>alvo</Card></>);
    screen.getByRole("button", {name: "antes"}).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", {name: "alvo"}));
  });

  // A ORDEM das classes importa: a pele primeiro, o ajuste de quem usa depois — senão o
  // consumidor não consegue sobrescrever nada, e a prop `className` vira decoração.
  it("a classe de quem consome vem DEPOIS da pele, e as props dele vencem", () => {
    const {container} = render(
      <Card variant="interactive" data-teste="pele"
        render={<button type="button" className="minha" data-teste="meu" />}>x</Card>);
    const el = container.firstElementChild!;
    expect(el.className).toBe("card card-interactive minha");
    expect(el.getAttribute("data-teste")).toBe("meu");
  });

  it("as outras variantes seguem sem exigir nada", () => {
    for (const v of ["raised", "inset", "selected", "danger"] as const) {
      const {container} = render(<Card variant={v}>x</Card>);
      expect(container.firstElementChild!.className).toBe(`card card-${v}`);
    }
  });
});
