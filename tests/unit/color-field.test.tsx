// 0.32.0, passo 12 · o `ColorField` (ADR-0069; o Victor, 14/10/2026: "Pode, componente novo"). O campo de cor da
// referência: a amostra na frente e o `Input` da Aurea; o código vale ao confirmar, o que não é cor volta, o vazio
// limpa; o modo canal é um campo numérico. Dentro do `Field`, o rótulo, a descrição e o erro são os dele.
import {fireEvent, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {vi} from "vitest";
import React from "react";
import {AureaProvider, ColorField, Field, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode, strings?: typeof ptBR) => render(<AureaProvider strings={strings}><main>{ui}</main></AureaProvider>);

describe("ColorField", () => {
  test("dentro do Field: o rótulo nomeia o campo, a amostra vem na frente, o código aparece", () => {
    const {container} = wrap(<Field label="Color"><ColorField defaultValue="#0485F7" /></Field>);
    const campo = screen.getByRole("textbox", {name: "Color"}) as HTMLInputElement;
    expect(campo.value).toBe("#0485f7");
    expect(container.querySelector(".input-group-addon .color-swatch")).not.toBeNull();
  });

  test("o código vale no Enter; o que não é cor volta; o vazio limpa", async () => {
    const onValueChange = vi.fn();
    wrap(<ColorField aria-label="Color" defaultValue="#0485f7" onValueChange={onValueChange} />);
    const campo = screen.getByRole("textbox") as HTMLInputElement;
    await userEvent.clear(campo);
    await userEvent.type(campo, "hsl(0, 100%, 50%){Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("#ff0000");
    expect(campo.value).toBe("#ff0000");
    await userEvent.clear(campo);
    await userEvent.type(campo, "azulzinho");
    fireEvent.blur(campo);
    expect(campo.value).toBe("#ff0000");
    await userEvent.clear(campo);
    fireEvent.blur(campo);
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(campo.value).toBe("");
  });

  test("sem valor de partida, começa vazio, com o placeholder", () => {
    wrap(<ColorField aria-label="Color" placeholder="#000000" />);
    const campo = screen.getByRole("textbox") as HTMLInputElement;
    expect(campo.value).toBe("");
    expect(campo).toHaveAttribute("placeholder", "#000000");
  });

  test("um canal: campo numérico na faixa do canal, as setas e Page Up mexem, e o número digitado vale", async () => {
    const onValueChange = vi.fn();
    wrap(<ColorField aria-label="Hue" channel="hue" colorSpace="hsl" defaultValue="hsl(200, 100%, 50%)" onValueChange={onValueChange} />);
    const campo = screen.getByRole("spinbutton", {name: "Hue"}) as HTMLInputElement;
    expect(campo).toHaveAttribute("aria-valuenow", "200");
    expect(campo).toHaveAttribute("aria-valuemax", "360");
    expect(campo.value).toBe("200°");
    expect(campo).toHaveAttribute("aria-valuetext", "200°, vivid blue");
    fireEvent.keyDown(campo, {key: "ArrowUp"});
    expect(campo).toHaveAttribute("aria-valuenow", "201");
    fireEvent.keyDown(campo, {key: "PageUp"});
    expect(campo).toHaveAttribute("aria-valuenow", "216");
    await userEvent.clear(campo);
    await userEvent.type(campo, "120{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("#00ff00");
  });

  test("o canal alfa aceita o por cento e devolve o hex de oito dígitos", async () => {
    const onValueChange = vi.fn();
    wrap(<ColorField aria-label="Alpha" channel="alpha" defaultValue="#ff0000" onValueChange={onValueChange} />);
    const campo = screen.getByRole("spinbutton");
    expect((campo as HTMLInputElement).value).toBe("100%");
    await userEvent.clear(campo);
    await userEvent.type(campo, "50%{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("#ff000080");
  });

  test("obrigatório e com erro pelo Field; as peles do Input (variant, size); o formulário recebe o hex", () => {
    const {container} = wrap(<Field label="Brand" required error="Pick a colour">
      <ColorField variant="secondary" size="sm" name="brand" defaultValue="#abc" />
    </Field>);
    const campo = screen.getByRole("textbox", {name: /Brand/});
    expect(campo).toBeRequired();
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(campo).toHaveClass("input-secondary");
    expect(container.querySelector<HTMLInputElement>('input[name="brand"]')!.value).toBe("#aabbcc");
  });

  test("em português; e sem violação de acessibilidade", async () => {
    const {container} = wrap(<>
      <Field label="Cor"><ColorField defaultValue="#0485f7" /></Field>
      <Field label="Matiz"><ColorField channel="hue" defaultValue="#0485f7" /></Field>
    </>, ptBR);
    expect(screen.getByRole("spinbutton", {name: "Matiz"})).toHaveAttribute("aria-valuetext", "208°, azul vivo");
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
  });
});
