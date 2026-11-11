// 0.65.0: o `DatePicker` da web recebe o inválido (aprovado pelo Victor em 14/10/2026, *"aprovaod"*). O `Field` com
// `error` já mandava `aria-invalid` ao controle, e o `DatePicker` jogava fora (não estava entre as props que ele lê):
// a mensagem aparecia e a caixa ficava cinza. Provado contra o defeito (11/11/2026): no código de antes, os três
// primeiros reprovam — o gatilho não tinha `aria-invalid`. A cor se mede no navegador (`invalido.spec.ts`).
import {render, screen} from "@testing-library/react";
import {AureaProvider, Field} from "../../packages/react/src/index";
import {DatePicker} from "../../packages/react/src/calendar";

const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

describe("DatePicker inválido (web)", () => {
  test("dentro de um Field com error, o gatilho fica inválido", () => {
    wrap(<Field label="Check-in" error="Choose a date"><DatePicker /></Field>);
    expect(screen.getByRole("button", {name: "Check-in"})).toHaveAttribute("aria-invalid", "true");
  });

  test("aceita aria-invalid direto, como booleano ou texto", () => {
    wrap(<><DatePicker aria-label="A" aria-invalid /><DatePicker aria-label="B" aria-invalid="true" /></>);
    expect(screen.getByRole("button", {name: "A"})).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", {name: "B"})).toHaveAttribute("aria-invalid", "true");
  });

  test("o intervalo também", () => {
    wrap(<Field label="Stay" error="Choose the nights"><DatePicker range /></Field>);
    expect(screen.getByRole("button", {name: "Stay"})).toHaveAttribute("aria-invalid", "true");
  });

  test("sem erro, nenhum aria-invalid (nem \"false\")", () => {
    wrap(<><Field label="Check-in"><DatePicker /></Field><DatePicker aria-label="C" aria-invalid={false} /></>);
    expect(screen.getByRole("button", {name: "Check-in"})).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("button", {name: "C"})).not.toHaveAttribute("aria-invalid");
  });
});
