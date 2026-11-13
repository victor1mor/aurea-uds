// 0.67.0 (ADR-0094, "O que fica de fora"): as quatro peças da web em que o erro do `Field` não chegava ao controle. O app
// escrevia `<Field error="…"><NumberField/></Field>` e a frase aparecia embaixo, mas a peça ficava como se estivesse certa —
// sem a borda vermelha e sem o "inválido" para o leitor de tela. E passado direto, o `aria-invalid` era jogado fora (o
// `NumberField`, o `OTPField` e o `FileInput` desmontam uma lista fechada de props).
// Provado contra o defeito: no código de antes, 9 dos 14 reprovam — os dois primeiros de cada peça e o da caixa do
// `InputGroup` (medido em 12/11/2026).
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {AureaProvider, Field, FileInput, Input, InputGroup, InputGroupAddon, NumberField, OTPField} from "../../packages/react/src/index";

const montar = (no: React.ReactNode) => render(<AureaProvider>{no}</AureaProvider>).container;
const marcados = (raiz: HTMLElement, alvo: string) => [...raiz.querySelectorAll(alvo)].map((e) => e.getAttribute("aria-invalid"));

const PECAS: Array<[string, (props: {"aria-invalid"?: boolean}) => React.ReactElement, string, number]> = [
  ["NumberField", (p) => <NumberField defaultValue={0} {...p} />, ".number-field-group > input", 1],
  ["OTPField", (p) => <OTPField length={4} {...p} />, ".otp-slot", 4],
  ["InputGroup", (p) => <InputGroup {...p}><InputGroupAddon>https://</InputGroupAddon><Input defaultValue="site" /></InputGroup>, ".input-group > .input", 1],
  ["FileInput", (p) => <FileInput {...p} />, ".dropzone input[type=file]", 1],
];

describe("o erro do Field chega às quatro peças (0.67.0)", () => {
  for (const [nome, peca, alvo, quantos] of PECAS) {
    it(`${nome}: dentro de um Field com erro, o controle fica inválido`, () => {
      const raiz = montar(<Field label="Rótulo" error="Obrigatório">{peca({})}</Field>);
      expect(marcados(raiz, alvo)).toEqual(Array(quantos).fill("true"));
    });

    it(`${nome}: o aria-invalid passado direto chega ao controle`, () => {
      const raiz = montar(peca({"aria-invalid": true}));
      expect(marcados(raiz, alvo)).toEqual(Array(quantos).fill("true"));
    });

    it(`${nome}: sem erro, nada fica inválido`, () => {
      const raiz = montar(<Field label="Rótulo">{peca({})}</Field>);
      expect(raiz.querySelectorAll('[aria-invalid="true"]').length).toBe(0);
    });
  }

  it("InputGroup: a marca não fica na caixa, e o campo que diz o seu aria-invalid vence", () => {
    const raiz = montar(<InputGroup aria-invalid={true}><Input aria-invalid={false} /></InputGroup>);
    expect(raiz.querySelector(".input-group")!.hasAttribute("aria-invalid")).toBe(false);
    expect(raiz.querySelector(".input-group > .input")!.getAttribute("aria-invalid")).toBe("false");
  });

  it("o Field não pendura <label for> nessas peças", () => {
    const raiz = montar(<Field label="Quantidade" error="Obrigatório"><NumberField defaultValue={0} /></Field>);
    expect(raiz.querySelector("label[for]")).toBeNull();
    // Até a 0.67.0 o `Field` ficava grupo aqui, e o campo ficava sem nome. Desde a 0.68.0 ele LIGA o rótulo ao campo
    // (`aria-labelledby`) e deixa de ser grupo — quem cobra é o `nome-no-field.test.tsx`.
    expect(raiz.querySelector(".field")!.getAttribute("role")).toBeNull();
  });
});
