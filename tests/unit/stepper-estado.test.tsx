// 16/10/2026 · achado na bancada do lote S: o passo CONCLUÍDO do `Stepper` nunca ficou amarelo na web. O componente
// escreve `step-done` e `step-active`; as regras do core só liam `.step.done` e `.step.active` (a marcação à mão). Este
// arquivo liga as duas pontas: o que o React emite e o que o CSS pinta. Provado contra o defeito: com o `aurea.css` da
// 0.33.0, o segundo teste reprova (nenhuma regra pinta `.step-done .step-dot`).
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, test} from "vitest";
import {AureaProvider, Stepper} from "../../packages/react/src/index";

const css = readFileSync(join(__dirname, "../../packages/core/src/aurea.css"), "utf8");
// As regras que valem para um seletor de classe: a dele, ou um `:is(...)` que o contenha.
const pinta = (classe: string, alvo: string, prop: string) =>
  new RegExp(`(\\.${classe}|:is\\([^)]*\\.${classe}[^)]*\\))${alvo}[^{]*\\{[^}]*${prop}`).test(css);

describe("Stepper — o estado do passo chega ao CSS", () => {
  test("o React escreve `step-done`, `step-active` e `step-error`", () => {
    const {container} = render(<AureaProvider><Stepper label="Publicação" items={[
      {label: "Configurar", state: "done"}, {label: "Validar", state: "active"}, {label: "Publicar", state: "error"},
    ]} /></AureaProvider>);
    const passos = [...container.querySelectorAll(".step")];
    expect(passos.map((p) => p.className)).toEqual(["step step-done", "step step-active", "step step-error"]);
  });

  test("o core pinta exatamente essas classes: a bolinha do concluído na marca, o traço do concluído e do atual", () => {
    expect(pinta("step-done", " \\.step-dot", "background:var\\(--primary\\)")).toBe(true);
    expect(pinta("step-done", ":before", "background:var\\(--primary\\)")).toBe(true);
    expect(pinta("step-active", ":before", "background:var\\(--primary\\)")).toBe(true);
    expect(pinta("step-error", " \\.step-dot", "background:var\\(--danger-bg\\)")).toBe(true);
  });
});
