// 0.32.0, passo 12 · as amostras para escolher — a "C" do Victor, VARIAÇÃO do `ColorSwatch` (ADR-0069). Com
// `options`, a amostra vira um grupo de botões de opção nativos: a escolha única e as setas são do navegador.
import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {vi} from "vitest";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {AureaProvider, ColorSwatch} from "../../packages/react/src/index";

const PALETA = [{color: "#0485f7", label: "Ocean"}, {color: "#f0c200", label: "Aurea yellow"}, "#000080"];
const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

describe("ColorSwatch options (as amostras para escolher)", () => {
  test("um grupo com nome, e cada cor um botão de opção com o nome dela (ou o código)", () => {
    wrap(<ColorSwatch options={PALETA} name="accent" label="Accent colour" defaultValue="#f0c200" />);
    expect(screen.getByRole("radiogroup", {name: "Accent colour"})).toBeInTheDocument();
    const opcoes = screen.getAllByRole("radio");
    expect(opcoes.map((o) => o.getAttribute("aria-label"))).toEqual(["Ocean", "Aurea yellow", "#000080"]);
    expect(opcoes.every((o) => (o as HTMLInputElement).name === "accent")).toBe(true);
    expect(screen.getByRole("radio", {name: "Aurea yellow"})).toBeChecked();
  });

  test("escolher avisa pelo evento do navegador, com a cor em event.target.value", () => {
    const onChange = vi.fn((e: React.ChangeEvent<HTMLInputElement>) => e.target.value);
    wrap(<ColorSwatch options={PALETA} name="accent" label="Accent colour" defaultValue="#f0c200" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", {name: "Ocean"}));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.results[0].value).toBe("#0485f7");
    expect(screen.getByRole("radio", {name: "Ocean"})).toBeChecked();
    expect(screen.getByRole("radio", {name: "Aurea yellow"})).not.toBeChecked();
  });

  // O "visto" na tinta que contrasta MAIS (a conta da WCAG): no amarelo da Aurea, preto; no azul-marinho, branco.
  test("o visto sai na tinta que contrasta com a cor", () => {
    const {container} = wrap(<ColorSwatch options={PALETA} name="accent" label="Accent colour" />);
    const tinta = [...container.querySelectorAll(".color-swatch-option")].map((o) => o.classList.contains("color-swatch-option-dark") ? "dark" : "light");
    expect(tinta).toEqual(["dark", "dark", "light"]);
  });

  // Marcação pura: sai inteira do servidor, sem JavaScript — o botão de opção nativo já funciona sem hidratar.
  test("sai inteira do servidor (marcação pura), já com a escolhida marcada", () => {
    const html = renderToStaticMarkup(<ColorSwatch options={PALETA} name="accent" label="Accent colour" defaultValue="#000080" />);
    expect(html).toContain('role="radiogroup"');
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    const marcada = html.match(/<input[^>]*checked=""[^>]*>/g) ?? [];
    expect(marcada).toHaveLength(1);
    expect(marcada[0]).toContain('value="#000080"');
  });

  test("a amostra comum não muda: imagem com nome", async () => {
    const {container} = wrap(<><ColorSwatch color="#f0c200" label="Yellow" /><ColorSwatch options={PALETA} name="a" label="Accent" /></>);
    expect(screen.getByRole("img", {name: "Yellow"})).toHaveClass("color-swatch");
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
  });
});
