// 0.32.0, passo 12 · a trilha de cor, VARIAÇÃO do Slider (ADR-0069; o Victor: "a trilha de cor segue como variação
// do Slider", e em 14/10/2026: todos os canais, com transparência). Com `channel`, o valor é a COR (hex), como na
// referência: várias trilhas repartem a mesma. O Slider comum (número) não muda.
import {fireEvent, render} from "@testing-library/react";
import {axe} from "jest-axe";
import {vi} from "vitest";
import React from "react";
import {AureaProvider, Slider, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode, extra: {direction?: "ltr" | "rtl"; strings?: typeof ptBR} = {}) =>
  render(<AureaProvider {...extra}><main>{ui}</main></AureaProvider>);
const variavel = (c: HTMLElement, nome: string) => (c.querySelector(".slider") as HTMLElement).style.getPropertyValue(nome);

describe("Slider channel (a trilha de cor)", () => {
  test("matiz: de 0 a 360, em graus, com o nome da cor no que o leitor de tela ouve", () => {
    const {getByRole, container} = wrap(<Slider label="Hue" channel="hue" defaultValue="hsl(210, 100%, 50%)" />);
    const alca = getByRole("slider", {name: "Hue"});
    expect(alca).toHaveAttribute("min", "0");
    expect(alca).toHaveAttribute("max", "360");
    expect(alca).toHaveAttribute("aria-valuetext", "Hue 210°, vivid blue");
    expect(container.querySelector(".slider-output")!.textContent).toBe("210°");
    expect(container.querySelector(".slider")).toHaveClass("slider-color");
    expect(container.querySelector(".slider-fill")).toBeNull();
  });

  test("o valor é a cor: mexer no canal devolve o hex, e o pino acompanha", () => {
    const mudou = vi.fn();
    const {getByRole, container} = wrap(<Slider label="Hue" channel="hue" defaultValue="#ff0000" onValueChange={mudou} />);
    expect(variavel(container, "--slider-track-fill")).toMatch(/^linear-gradient\(to right, #ff0000 calc/);
    expect(variavel(container, "--slider-thumb-color")).toBe("#ff0000");
    const alca = getByRole("slider");
    alca.focus();
    fireEvent.keyDown(alca, {key: "PageUp"});
    expect(mudou).toHaveBeenLastCalledWith("#ff4000"); // matiz 15 (o salto da referência)
    expect(variavel(container, "--slider-thumb-color")).toBe("#ff4000");
  });

  test("os outros canais: saturação e luminosidade (HSL), vermelho/verde/azul (RGB), nas faixas da referência", () => {
    const cor = "hsl(0, 100%, 50%)";
    const {getAllByRole} = wrap(<>
      <Slider label="S" channel="saturation" colorSpace="hsl" defaultValue={cor} />
      <Slider label="L" channel="lightness" defaultValue={cor} />
      <Slider label="R" channel="red" defaultValue={cor} />
    </>);
    const [s, l, r] = getAllByRole("slider");
    expect([s.getAttribute("max"), l.getAttribute("max"), r.getAttribute("max")]).toEqual(["100", "100", "255"]);
    expect(s).toHaveAttribute("aria-valuetext", "Saturation 100%, vivid red");
    expect(l).toHaveAttribute("aria-valuetext", "Lightness 50%, vivid red");
    expect(r).toHaveAttribute("aria-valuetext", "Red 255, vivid red");
  });

  test("o alfa: de 0 a 1, em por cento, o xadrez por baixo, e o hex de oito dígitos", () => {
    const mudou = vi.fn();
    const {getByRole, container} = wrap(<Slider label="Alpha" channel="alpha" defaultValue="#ff000080" onValueChange={mudou} />);
    const alca = getByRole("slider");
    expect(alca).toHaveAttribute("aria-valuetext", "Alpha 50%");
    expect(container.querySelector(".slider")).toHaveClass("slider-color", "slider-alpha");
    alca.focus();
    fireEvent.keyDown(alca, {key: "End"});
    expect(mudou).toHaveBeenLastCalledWith("#ff0000");
    fireEvent.keyDown(alca, {key: "Home"});
    expect(mudou).toHaveBeenLastCalledWith("#ff000000");
  });

  test("em português; e da direita para a esquerda (e na vertical) a pintura vira", () => {
    const {getByRole} = wrap(<Slider label="Matiz" channel="hue" defaultValue="hsl(120, 100%, 50%)" />, {strings: ptBR});
    expect(getByRole("slider")).toHaveAttribute("aria-valuetext", "Matiz 120°, verde vivo");
    const rtl = wrap(<Slider label="Hue" channel="hue" defaultValue="#ff0000" />, {direction: "rtl"});
    expect(variavel(rtl.container, "--slider-track-fill")).toMatch(/^linear-gradient\(to left/);
    const vertical = wrap(<Slider label="Hue" channel="hue" orientation="vertical" defaultValue="#ff0000" />);
    expect(variavel(vertical.container, "--slider-track-fill")).toMatch(/^linear-gradient\(to top/);
  });

  test("o Slider comum não muda: com o preenchimento, sem a pintura, sem o nome da cor", async () => {
    const {getByRole, container} = wrap(<Slider label="Volume" defaultValue={40} />);
    expect(container.querySelector(".slider")).not.toHaveClass("slider-color");
    expect(container.querySelector(".slider-fill")).not.toBeNull();
    expect(variavel(container, "--slider-track-fill")).toBe("");
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "40");
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
  });
});
