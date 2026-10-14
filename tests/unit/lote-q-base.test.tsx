// 0.32.0, passo 1 (a base) · `CloseButton`, o `Kbd` da referência e o peso `bold` do `Icon`.
// O que o React emite; a medida no navegador (24, o X de 16, a cápsula da tecla) é do `skin.spec.ts`.
// Provado contra o defeito: sem o `CloseButton` não há o que importar; sem o `kbd-single`, a tecla de
// um caractere sai em cápsula larga; sem o `bold`, o X sai no símbolo regular (`#i-x`).
import {render} from "@testing-library/react";
import {vi} from "vitest";
import {AureaProvider, CloseButton, Icon, Kbd, ptBR} from "../../packages/react/src/index";
import {NOMES_BOLD} from "../../packages/react/src/icon-names";

const wrap = (ui: React.ReactNode, strings?: typeof ptBR) =>
  render(<AureaProvider strings={strings}>{ui}</AureaProvider>);

describe("CloseButton", () => {
  test("é um <button type=button> com o nome \"Close\" sozinho", () => {
    const {getByRole} = wrap(<CloseButton />);
    const b = getByRole("button", {name: "Close"});
    expect(b.getAttribute("type")).toBe("button");
    expect(b).toHaveClass("btn", "close-button");
  });
  test("o nome segue a língua do app (ptBR: \"Fechar\")", () => {
    const {getByRole} = wrap(<CloseButton />, ptBR);
    expect(getByRole("button", {name: "Fechar"})).toBeTruthy();
  });
  test("`label` diz o que fecha", () => {
    const {getByRole} = wrap(<CloseButton label="Fechar aviso" />);
    expect(getByRole("button", {name: "Fechar aviso"})).toBeTruthy();
  });
  test("o X é o do traço Bold (`#i-x-bold`)", () => {
    const {container} = wrap(<CloseButton />);
    expect(container.querySelector("use")!.getAttribute("href")).toMatch(/#i-x-bold$/);
  });
  test("`children` troca o X", () => {
    const {container} = wrap(<CloseButton><Icon name="minus" /></CloseButton>);
    expect(container.querySelector("use")!.getAttribute("href")).toMatch(/#i-minus$/);
  });
  test("chama o `onClick`, e desligado não", () => {
    const fechar = vi.fn();
    const {getByRole, rerender} = wrap(<CloseButton onClick={fechar} />);
    getByRole("button").click();
    expect(fechar).toHaveBeenCalledTimes(1);
    rerender(<AureaProvider><CloseButton onClick={fechar} disabled /></AureaProvider>);
    getByRole("button").click();
    expect(fechar).toHaveBeenCalledTimes(1);
  });
});

describe("Icon · peso `bold`", () => {
  test("só o `x` tem o Bold, e os outros caem no regular", () => {
    expect([...NOMES_BOLD]).toEqual(["x"]);
    const {container} = wrap(<><Icon name="x" weight="bold" /><Icon name="house" weight="bold" /></>);
    const hrefs = [...container.querySelectorAll("use")].map((u) => u.getAttribute("href"));
    expect(hrefs[0]).toMatch(/#i-x-bold$/);
    expect(hrefs[1]).toMatch(/#i-house$/);
  });
});

describe("Kbd · redonda com um caractere, cápsula com palavra", () => {
  test.each([["K"], ["⌘"], ["/"], [7]])("%s → `kbd-single`", (tecla) => {
    const {container} = wrap(<Kbd>{tecla}</Kbd>);
    expect(container.querySelector("kbd")).toHaveClass("kbd", "kbd-single");
  });
  test.each([["Esc"], ["Enter"], ["⌘K"]])("%s → cápsula (sem `kbd-single`)", (tecla) => {
    const {container} = wrap(<Kbd>{tecla}</Kbd>);
    expect(container.querySelector("kbd")!.className).toBe("kbd");
  });
  test("conteúdo que não é texto fica em cápsula", () => {
    const {container} = wrap(<Kbd><Icon name="command" /></Kbd>);
    expect(container.querySelector("kbd")!.className).toBe("kbd");
  });
});
