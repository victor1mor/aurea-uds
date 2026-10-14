// 0.32.0, passo 12 · o `ColorPicker` (ADR-0069; o Victor: "ColorPicker componente", "cor A com C como variação",
// "sempre com campo do código e teclado"). O gatilho é a amostra com o nome; a janela traz a área, a trilha do
// matiz e o campo do código; `swatches` acrescenta as amostras; `variant="swatches"` é a paleta fechada (a "C").
import {act, fireEvent, render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {vi} from "vitest";
import React from "react";
import {AureaProvider, ColorPicker, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode, strings?: typeof ptBR) => render(<AureaProvider strings={strings}><main>{ui}</main></AureaProvider>);
const abrir = async (nome: RegExp | string) => {
  await userEvent.click(screen.getByRole("button", {name: nome}));
  return screen.getByRole("dialog");
};
const codigo = (janela: HTMLElement) => within(janela).getByRole("textbox") as HTMLInputElement;

describe("ColorPicker", () => {
  test("o gatilho diz o nome e a cor; a janela traz a área, a trilha e o código", async () => {
    wrap(<ColorPicker label="Brand colour" defaultValue="#0485f7" />);
    const janela = await abrir("Brand colour, vivid blue");
    expect(janela).toHaveAccessibleName("Brand colour");
    expect(within(janela).getByRole("group", {name: "Brand colour, Color picker"})).toBeInTheDocument();
    expect(within(janela).getByRole("slider", {name: "Hue"})).toHaveAttribute("aria-valuetext", "Hue 208°, vivid blue");
    expect(codigo(janela)).toHaveAccessibleName("Hex");
    expect(codigo(janela).value).toBe("#0485f7");
  });

  test("o código vale ao confirmar; texto que não é cor volta ao valor de antes", async () => {
    const onValueCommitted = vi.fn();
    wrap(<ColorPicker label="Brand colour" defaultValue="#0485f7" onValueCommitted={onValueCommitted} />);
    const janela = await abrir(/Brand colour/);
    const campo = codigo(janela);
    await userEvent.clear(campo);
    await userEvent.type(campo, "F0C200{Enter}");
    expect(onValueCommitted).toHaveBeenLastCalledWith("#f0c200");
    expect(campo.value).toBe("#f0c200");
    expect(screen.getByRole("button", {name: "Brand colour, vivid yellow"})).toBeInTheDocument();
    await userEvent.clear(campo);
    await userEvent.type(campo, "nada");
    fireEvent.blur(campo);
    expect(campo.value).toBe("#f0c200");
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
  });

  // O defeito que a área por dentro em HSB evita, agora na composição: no cinza, a trilha do matiz muda o matiz
  // que a área MOSTRA, mesmo sem o hex mudar.
  test("no cinza, mexer no matiz troca o fundo da área (o hex não muda, o matiz sim)", async () => {
    function Controlado() {
      const [cor, setCor] = React.useState("#0485f7");
      return <ColorPicker label="Brand colour" value={cor} onValueChange={setCor} />;
    }
    wrap(<Controlado />);
    const janela = await abrir(/Brand colour/);
    const area = janela.querySelector<HTMLElement>(".color-area")!;
    const [x] = within(janela).getAllByRole("slider", {hidden: true}).filter((e) => e.closest(".color-area"));
    for (let i = 0; i < 10; i++) fireEvent.keyDown(x, {key: "Home"});
    expect(codigo(janela).value).toBe("#f7f7f7");
    const antes = area.style.getPropertyValue("--color-area-fill");
    const matiz = within(janela).getByRole("slider", {name: "Hue"});
    act(() => matiz.focus());
    fireEvent.keyDown(matiz, {key: "PageUp"});
    expect(codigo(janela).value).toBe("#f7f7f7");
    expect(area.style.getPropertyValue("--color-area-fill")).not.toBe(antes);
  });

  test("as amostras: o grupo e o nome de cada cor na língua do app; escolher muda a cor", async () => {
    const onValueChange = vi.fn();
    wrap(<ColorPicker label="Cor" defaultValue="#ffffff" swatches={["#ff0000", {color: "#0485f7", label: "Oceano"}]} onValueChange={onValueChange} />, ptBR);
    const janela = await abrir(/Cor/);
    const grupo = within(janela).getByRole("radiogroup", {name: "Amostras"});
    expect(within(grupo).getAllByRole("radio").map((r) => r.getAttribute("aria-label"))).toEqual(["vermelho vivo", "Oceano"]);
    await userEvent.click(within(grupo).getByRole("radio", {name: "Oceano"}));
    expect(onValueChange).toHaveBeenLastCalledWith("#0485f7");
    expect(within(grupo).getByRole("radio", {name: "Oceano"})).toBeChecked();
    expect(codigo(janela)).toHaveAccessibleName("Código hex");
  });

  test("variant=\"swatches\" (a paleta fechada): só as amostras e o código, sem a área e sem a trilha", async () => {
    wrap(<ColorPicker label="Accent" variant="swatches" swatches={["#ff0000", "#00ff00"]} defaultValue="#00ff00" />);
    const janela = await abrir(/Accent/);
    expect(janela.querySelector(".color-area")).toBeNull();
    expect(within(janela).queryByRole("slider", {name: "Hue"})).toBeNull();
    expect(within(janela).getByRole("radio", {name: "vivid green"})).toBeChecked();
    expect(codigo(janela).value).toBe("#00ff00");
  });

  test("o formulário recebe o hex; e sem violação de acessibilidade, fechado e aberto", async () => {
    const {container} = wrap(<ColorPicker label="Brand colour" defaultValue="#ABC" name="cor" swatches={["#ff0000"]} />);
    expect(container.querySelector<HTMLInputElement>('input[name="cor"]')!.value).toBe("#aabbcc");
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
    await abrir(/Brand colour/);
    expect((await axe(document.body)).violations.map((v) => v.id)).toEqual([]);
  });
});
