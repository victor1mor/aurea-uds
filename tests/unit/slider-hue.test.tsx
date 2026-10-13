// 0.32.0, passo 12 · a trilha de cor, VARIAÇÃO do Slider (ADR-0069; o Victor: "a trilha de cor segue como variação
// do Slider"). `channel="hue"`: de 0 a 360, a trilha pintada com o círculo de cores, o pino na cor do valor, o valor
// em graus e o nome da cor para o leitor de tela. O Slider comum não muda.
import {fireEvent, render} from "@testing-library/react";
import {axe} from "jest-axe";
import {vi} from "vitest";
import React from "react";
import {AureaProvider, Slider, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode, extra: {direction?: "ltr" | "rtl"; strings?: typeof ptBR} = {}) =>
  render(<AureaProvider {...extra}><main>{ui}</main></AureaProvider>);
const variavel = (c: HTMLElement, nome: string) => (c.querySelector(".slider") as HTMLElement).style.getPropertyValue(nome);

describe("Slider channel=\"hue\" (a trilha de cor)", () => {
  test("de 0 a 360, em graus, com o nome da cor no que o leitor de tela ouve", () => {
    const {getByRole, container} = wrap(<Slider label="Hue" channel="hue" defaultValue={210} />);
    const alca = getByRole("slider", {name: "Hue"});
    // O motor usa um `input type="range"` de verdade: os limites são os `min`/`max` nativos dele.
    expect(alca).toHaveAttribute("min", "0");
    expect(alca).toHaveAttribute("max", "360");
    expect(alca).toHaveAttribute("aria-valuetext", "Hue 210°, vivid blue");
    expect(container.querySelector(".slider-output")!.textContent).toBe("210°");
    expect(container.querySelector(".slider")).toHaveClass("slider-hue");
    expect(container.querySelector(".slider-fill")).toBeNull();
  });

  test("a trilha leva o círculo de cores, e o pino acompanha o valor", () => {
    const mudou = vi.fn();
    const {getByRole, container} = wrap(<Slider label="Hue" channel="hue" defaultValue={0} onValueChange={mudou} />);
    expect(variavel(container, "--slider-track-fill")).toMatch(/^linear-gradient\(to right, #ff0000/);
    expect(variavel(container, "--slider-thumb-color")).toBe("#ff0000");
    const alca = getByRole("slider");
    alca.focus();
    fireEvent.keyDown(alca, {key: "End"});
    expect(mudou).toHaveBeenLastCalledWith(360);
    fireEvent.keyDown(alca, {key: "Home"});
    fireEvent.keyDown(alca, {key: "PageUp"});
    expect(mudou).toHaveBeenLastCalledWith(10);
    expect(variavel(container, "--slider-thumb-color")).toBe("#ff2a00"); // o matiz 10°
  });

  test("em português; e da direita para a esquerda a pintura vira", () => {
    const {getByRole} = wrap(<Slider label="Matiz" channel="hue" defaultValue={120} />, {strings: ptBR});
    expect(getByRole("slider")).toHaveAttribute("aria-valuetext", "Matiz 120°, verde vivo");
    const {container} = wrap(<Slider label="Hue" channel="hue" defaultValue={0} />, {direction: "rtl"});
    expect(variavel(container, "--slider-track-fill")).toMatch(/^linear-gradient\(to left/);
  });

  test("o Slider comum não muda: com o preenchimento, sem a pintura, sem o nome da cor", async () => {
    const {getByRole, container} = wrap(<Slider label="Volume" defaultValue={40} />);
    expect(container.querySelector(".slider")).not.toHaveClass("slider-hue");
    expect(container.querySelector(".slider-fill")).not.toBeNull();
    expect(variavel(container, "--slider-track-fill")).toBe("");
    expect(getByRole("slider")).not.toHaveAttribute("aria-valuetext", expect.stringContaining("°"));
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
  });
});
