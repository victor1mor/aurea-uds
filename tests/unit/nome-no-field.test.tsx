// 0.68.0: o `Field` dá o NOME e a FRASE DE ERRO ao campo do `NumberField`, do `OTPField`, do `InputGroup` e do `FileInput`.
// Medido em 13/11/2026 na árvore de acessibilidade do Chromium, com o foco no campo: o `NumberField` e o `InputGroup` dentro
// de um `Field` ficavam sem nome; o `OTPField` dizia só "Digit 1" e o `FileInput` só o texto da área; e nenhum dos quatro
// lia a frase de erro — o `Field` virava grupo e punha o rótulo e a frase no GRUPO. Na referência, o rótulo nomeia o campo
// sozinho. Aqui o nome e a descrição saem do cálculo da biblioteca de testes (o mesmo algoritmo do navegador); o
// navegador de verdade é o `tests/visual/nome-no-field.spec.ts`.
// Provado contra o defeito: no código de antes (a 0.67.0) os 9 reprovam (medido em 13/11/2026) — até os que guardam o
// nome próprio, porque a frase de erro não chegava ao campo. O do nativo (`native-nome-no-field.test.tsx`) passa nos dois:
// lá as quatro já recebiam.
import {render, within} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {AureaProvider, Field, FileInput, Input, InputGroup, InputGroupAddon, NumberField, OTPField} from "../../packages/react/src/index";

const montar = (no: React.ReactNode) => render(<AureaProvider>{no}</AureaProvider>).container;
/** O texto de uma lista de ids (o `aria-labelledby`/`aria-describedby`), como o leitor de tela junta. */
const textoDosIds = (raiz: HTMLElement, ids: string | null) =>
  (ids ?? "").split(/\s+/).filter(Boolean).map((id) => raiz.ownerDocument.getElementById(id)?.textContent?.trim() ?? "").join(" ");

describe("o Field dá o nome e a frase de erro ao campo das quatro peças (0.68.0)", () => {
  it("NumberField: o campo se chama pelo rótulo e lê a frase de erro", () => {
    const raiz = montar(<Field label="Seats" error="Check this field"><NumberField defaultValue={0} /></Field>);
    within(raiz).getByRole("textbox", {name: "Seats", description: "Check this field"});
  });

  it("InputGroup: o campo do meio se chama pelo rótulo e lê a frase de erro", () => {
    const raiz = montar(<Field label="Website" error="Check this field">
      <InputGroup><InputGroupAddon>https://</InputGroupAddon><Input defaultValue="example" /></InputGroup></Field>);
    within(raiz).getByRole("textbox", {name: "Website", description: "Check this field"});
  });

  it("OTPField: cada casa SOMA o rótulo ao próprio nome e lê a frase de erro", () => {
    const raiz = montar(<Field label="Verification code" error="Check this field"><OTPField length={3} /></Field>);
    for (const n of [1, 2, 3]) within(raiz).getByRole("textbox", {name: `Verification code Digit ${n}`, description: "Check this field"});
  });

  it("FileInput: o rótulo vem antes do texto da área, e a frase de erro é lida", () => {
    const raiz = montar(<Field label="Proof of address" error="Check this field"><FileInput /></Field>);
    const campo = raiz.querySelector<HTMLInputElement>("input[type=file]")!;
    expect(textoDosIds(raiz, campo.getAttribute("aria-labelledby"))).toBe("Proof of address Drag files here or click to select");
    expect(textoDosIds(raiz, campo.getAttribute("aria-describedby"))).toBe("Check this field");
  });

  it("a dica também chega ao campo, antes da frase de erro", () => {
    const raiz = montar(<Field label="Seats" hint="1 to 9" error="Check this field"><NumberField defaultValue={0} /></Field>);
    within(raiz).getByRole("textbox", {name: "Seats", description: "1 to 9 Check this field"});
  });

  it("o Field que nomeia o campo deixa de ser grupo (senão o leitor de tela diria o rótulo e a frase duas vezes)", () => {
    for (const peca of [<NumberField defaultValue={0} />, <OTPField length={2} />, <FileInput />,
      <InputGroup><Input defaultValue="x" /></InputGroup>]) {
      const raiz = montar(<Field label="Rótulo" error="Erro">{peca}</Field>);
      const campo = raiz.querySelector(".field")!;
      expect(campo.getAttribute("role")).toBeNull();
      expect(campo.getAttribute("aria-describedby")).toBeNull();
    }
  });

  it("a peça que já tem nome guarda o dela; o Field continua grupo e a frase vai para o campo", () => {
    const raiz = montar(<Field label="Seats" error="Check this field"><NumberField label="Own name" defaultValue={0} /></Field>);
    within(raiz).getByRole("textbox", {name: "Own name", description: "Check this field"});
    expect(raiz.querySelector(".field")!.getAttribute("role")).toBe("group");
  });

  it("InputGroup: o campo que diz o próprio nome guarda o dele, e a frase soma à que ele já tinha", () => {
    const raiz = montar(<>
      <span id="minha">Mine</span>
      <Field label="Website" error="Check this field">
        <InputGroup><Input aria-label="Own name" aria-describedby="minha" defaultValue="x" /></InputGroup></Field></>);
    within(raiz).getByRole("textbox", {name: "Own name", description: "Mine Check this field"});
  });

  it("fora de um Field, a ligação passada direto chega ao campo", () => {
    const raiz = montar(<><span id="r">Quantity</span><span id="d">Too many</span>
      <NumberField aria-labelledby="r" aria-describedby="d" defaultValue={0} /></>);
    within(raiz).getByRole("textbox", {name: "Quantity", description: "Too many"});
  });
});
