// O gatilho desativado do `Collapsible` continua no Tab e não abre (lote 112, 27/11/2026).
//
// A ficha promete: "The trigger stays focusable and inert, so keyboard users still find out the section exists". Até a
// Base UI 1.6.0 o motor fazia isso sozinho (`aria-disabled="true"`, sem `disabled`). Desde a 1.9.0 — a que os apps
// recebem pelo `^` — ele põe o `disabled` nativo no botão, que sai do Tab e não recebe foco. A prova reprova com a
// 1.9.0 sem o conserto do `disclosure.tsx` (medido: o botão nascia com `disabled` e o foco não chegava).
import {fireEvent, render} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";
import {cleanup} from "@testing-library/react";
import {Collapsible} from "../../packages/react/src/index";

afterEach(cleanup);

describe("Collapsible desativado", () => {
  it("o gatilho fica no Tab, diz que está desativado e não abre", () => {
    const {container} = render(<Collapsible trigger="Detalhes" disabled>Conteúdo</Collapsible>);
    const botao = container.querySelector<HTMLButtonElement>(".collapsible-trigger")!;
    expect(botao.hasAttribute("disabled")).toBe(false);
    expect(botao.getAttribute("aria-disabled")).toBe("true");
    expect(botao.hasAttribute("data-disabled")).toBe(true);
    expect(botao.tabIndex).toBe(0);
    botao.focus();
    expect(document.activeElement).toBe(botao);
    fireEvent.click(botao);
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(botao.hasAttribute("data-panel-open")).toBe(false);
  });

  it("o gatilho ligado continua abrindo, sem aria-disabled", () => {
    const {container} = render(<Collapsible trigger="Mais">Conteúdo</Collapsible>);
    const botao = container.querySelector<HTMLButtonElement>(".collapsible-trigger")!;
    expect(botao.hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(botao);
    expect(botao.getAttribute("aria-expanded")).toBe("true");
  });
});
