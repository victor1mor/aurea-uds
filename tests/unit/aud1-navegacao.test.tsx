// O AUD-1, parte 4 (aprovado na bancada em 22/11/2026, "Aprovo as duas"): na navegação, a Aurea ficava com a minoria das
// referências em dois pontos. Este arquivo cobra o segundo — o ITEM INDISPONÍVEL — no que o React entrega; o primeiro (a letra
// com o mouse em cima) e a aparência do indisponível se medem no navegador (`tests/visual/aud1-navegacao.spec.ts`).
//   · `Tabs`: a aba com `disabled` leva o estado do motor (`data-disabled`, `aria-disabled="true"`) e não escolhe;
//   · `SegmentedControl` (web): o segmento com `disabled` não escolhe; com `href`, vira `<button aria-disabled>`, como a linha
//     indisponível do `NavList`;
//   · `Sidebar` (web): o item com `disabled` vira `<button aria-disabled>` e não chama o toque nem leva ao `href`;
//   · `SegmentedControl` (nativo): o segmento com `disabled` não escolhe e o leitor de tela o ouve indisponível.
// Provado contra o defeito: no código da 0.76.0 a prop não existe, e os quatro casos reprovam (a aba escolhe, o segmento
// escolhe, o item da lateral é link e chama o toque, o segmento do nativo escolhe).
import {render, fireEvent} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {Tabs, Sidebar} from "../../packages/react/src/navigation-client.js";
import {SegmentedControl} from "../../packages/react/src/inputs-client.js";

describe("AUD-1 parte 4 · o item indisponível na web", () => {
  it("Tabs: a aba com disabled leva o estado do motor e não escolhe", () => {
    const muda = vi.fn();
    const {container} = render(<Tabs value="a" onChange={muda} tabs={[
      {id: "a", label: "Visão geral", content: "a"},
      {id: "b", label: "Arquivo", content: "b", disabled: true},
    ]}/>);
    const abas = [...container.querySelectorAll<HTMLElement>("[role=tab]")];
    expect(abas[1].getAttribute("aria-disabled")).toBe("true");
    expect(abas[1].hasAttribute("data-disabled")).toBe(true);
    expect(abas[0].getAttribute("aria-disabled")).not.toBe("true");
    fireEvent.click(abas[1]);
    expect(muda).not.toHaveBeenCalled();
  });

  it("SegmentedControl: o segmento com disabled não escolhe", () => {
    const muda = vi.fn();
    const {container} = render(<SegmentedControl value="lista" onChange={muda} items={[
      {value: "lista", label: "Lista"},
      {value: "mapa", label: "Mapa", disabled: true},
    ]}/>);
    const segs = [...container.querySelectorAll<HTMLElement>("[role=radio]")];
    expect(segs[1].hasAttribute("data-disabled")).toBe(true);
    fireEvent.click(segs[1]);
    expect(muda).not.toHaveBeenCalled();
  });

  it("SegmentedControl com href: o segmento com disabled é <button aria-disabled>, sem endereço", () => {
    const {container} = render(<SegmentedControl value="web" items={[
      {value: "web", label: "Web", href: "/web"},
      {value: "nativo", label: "Native", href: "/nativo", disabled: true},
    ]}/>);
    const fora = [...container.querySelectorAll<HTMLElement>("nav > *")][1];
    expect(fora.tagName).toBe("BUTTON");
    expect(fora.getAttribute("aria-disabled")).toBe("true");
    expect(fora.hasAttribute("href")).toBe(false);
  });

  it("Sidebar: o item com disabled é <button aria-disabled>, não leva ao href nem chama o toque", () => {
    const toque = vi.fn();
    const {container} = render(<Sidebar items={[
      {id: "inicio", label: "Início", href: "/"},
      {id: "cobranca", label: "Cobrança", href: "/cobranca", onPress: toque, disabled: true},
    ]}/>);
    const fora = [...container.querySelectorAll<HTMLElement>(".sidebar-item")].find((e) => e.textContent?.includes("Cobrança"))!;
    expect(fora.tagName).toBe("BUTTON");
    expect(fora.getAttribute("aria-disabled")).toBe("true");
    expect(fora.hasAttribute("href")).toBe(false);
    fireEvent.click(fora);
    expect(toque).not.toHaveBeenCalled();
  });
});
