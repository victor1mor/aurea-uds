// 0.32.0, passo 12 · o `ColorArea` (ADR-0069): a área de cor, no desenho acessível da referência — um grupo com
// dois `range` escondidos (um por eixo), anunciados como controle 2D, com o nome da cor; as teclas dela; e o
// matiz guardado quando a cor vira cinza (o hex o perderia).
import {act, fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {vi} from "vitest";
import React from "react";
import {AureaProvider, ColorArea, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode, extra: {direction?: "ltr" | "rtl"; strings?: typeof ptBR} = {}) =>
  render(<AureaProvider {...extra}><main>{ui}</main></AureaProvider>);
const eixos = () => screen.getAllByRole("slider", {hidden: true}) as HTMLInputElement[];
const fundo = (c: HTMLElement) => (c.querySelector(".color-area") as HTMLElement).style.getPropertyValue("--color-area-fill");

describe("ColorArea", () => {
  test("dois controles escondidos, anunciados como 2D, com os três canais e o nome da cor", () => {
    wrap(<ColorArea defaultValue="#ff0000" />);
    const [x, y] = eixos();
    expect(x).toHaveAttribute("aria-roledescription", "2D slider");
    expect(x).toHaveAccessibleName("Color picker");
    expect(x).toHaveAttribute("aria-valuetext", "Saturation 100%, Brightness 100%, Hue 0°, vivid red");
    expect(y).toHaveAttribute("aria-valuetext", "Brightness 100%, Saturation 100%, Hue 0°, vivid red");
    expect(x).toHaveAttribute("aria-orientation", "horizontal");
    expect(y).toHaveAttribute("aria-orientation", "vertical");
  });

  test("em português, as frases e o nome da cor vêm da língua do app", () => {
    wrap(<ColorArea defaultValue="#800000" />, {strings: ptBR});
    expect(eixos()[0]).toHaveAttribute("aria-valuetext", "Saturação 100%, Brilho 50%, Matiz 0°, vermelho escuro");
    expect(eixos()[0]).toHaveAccessibleName("Seletor de cor");
  });

  // Só um na ordem do Tab — senão o Tab passaria duas vezes pelo mesmo quadrado. O outro sai da árvore até a
  // pessoa mexer nele pelo teclado.
  test("só um dos dois fica na ordem do Tab; o outro fica fora da árvore", () => {
    wrap(<ColorArea defaultValue="#ff0000" />);
    const [x, y] = eixos();
    expect(x).not.toHaveAttribute("tabindex");
    expect(y).toHaveAttribute("tabindex", "-1");
    expect(y).toHaveAttribute("aria-hidden", "true");
  });

  test("as teclas da referência: setas, Shift, Page Up/Down no brilho, Home/End na saturação", () => {
    const onValueChange = vi.fn();
    wrap(<ColorArea defaultValue="#808080" onValueChange={onValueChange} />); // HSB: s 0, b 50%
    const [x, y] = eixos();
    act(() => x.focus());
    fireEvent.keyDown(x, {key: "ArrowRight"});
    expect(x.value).toBe("1");
    fireEvent.keyDown(x, {key: "ArrowRight", shiftKey: true});
    expect(x.value).toBe("11");
    fireEvent.keyDown(x, {key: "End"});
    expect(x.value).toBe("21");
    fireEvent.keyDown(x, {key: "Home"});
    expect(x.value).toBe("11");
    fireEvent.keyDown(x, {key: "ArrowUp"});
    expect(y.value).toBe("51");
    expect(y).toHaveFocus();
    fireEvent.keyDown(y, {key: "PageDown"});
    expect(y.value).toBe("41");
    expect(onValueChange).toHaveBeenCalledTimes(6);
    expect(onValueChange.mock.calls.at(-1)![0]).toMatch(/^#[0-9a-f]{6}$/);
  });

  test("depois de mexer pelo teclado, ouve-se só o canal que mudou, e os dois entram na árvore", () => {
    wrap(<ColorArea defaultValue="#ff0000" />);
    const [x, y] = eixos();
    fireEvent.keyDown(x, {key: "ArrowLeft"});
    expect(x).toHaveAttribute("aria-valuetext", "Saturation 99%, vivid red");
    expect(y).not.toHaveAttribute("aria-hidden");
  });

  // O defeito que a peça interna em HSB evita: com o valor em hex, a saturação 0 dá cinza, o cinza não tem
  // matiz, e o fundo da área pulava para o vermelho (matiz 0) no meio do arrasto.
  test("controlado: puxar a saturação a 0 não troca o matiz do fundo", () => {
    function Controlado() {
      const [cor, setCor] = React.useState("#0485f7");
      return <ColorArea value={cor} onValueChange={setCor} />;
    }
    const {container} = wrap(<Controlado />);
    const azul = fundo(container);
    expect(azul).toContain("#0087ff"); // a cor pura do matiz de #0485f7 (208°)
    for (let i = 0; i < 10; i++) fireEvent.keyDown(eixos()[0], {key: "Home"});
    expect(eixos()[0].value).toBe("0");
    expect(fundo(container)).toBe(azul);
  });

  test("da direita para a esquerda, a seta para a direita DIMINUI a saturação, e a pintura vira", () => {
    const {container} = wrap(<ColorArea defaultValue="#ff0000" />, {direction: "rtl"});
    fireEvent.keyDown(eixos()[0], {key: "ArrowRight"});
    expect(eixos()[0].value).toBe("99");
    expect(fundo(container)).toContain("to left");
  });

  // Visto no navegador (13/10/2026): o arrasto põe o foco no `range`, e o anel acendia com o mouse. Na referência
  // o anel é só do teclado.
  test("o anel de foco é do teclado: o ponteiro não o acende, a primeira tecla sim", () => {
    const {container} = wrap(<ColorArea defaultValue="#ff0000" />);
    const pino = container.querySelector(".color-area-thumb")!;
    fireEvent.pointerDown(container.querySelector(".color-area")!, {button: 0, pointerId: 1});
    expect(eixos()[0]).toHaveFocus();
    expect(pino).not.toHaveAttribute("data-focus-visible");
    fireEvent.keyDown(eixos()[0], {key: "ArrowLeft"});
    expect(pino).toHaveAttribute("data-focus-visible");
  });

  test("o formulário recebe o hex; e sem violação de acessibilidade", async () => {
    const {container} = wrap(<ColorArea defaultValue="#ABC" name="cor" aria-label="Fundo" />);
    expect(container.querySelector<HTMLInputElement>('input[name="cor"]')!.value).toBe("#aabbcc");
    expect(eixos()[0]).toHaveAccessibleName("Fundo, Color picker");
    expect(screen.getByRole("group")).toHaveAccessibleName("Fundo, Color picker");
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
  });
});
