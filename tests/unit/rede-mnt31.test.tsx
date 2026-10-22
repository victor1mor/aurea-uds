// MNT-31 (21/10/2026) — a legenda e o minimapa do mapa cobriam os nós dos cantos de baixo, e não havia como
// recolher nem esconder. A escolha do Victor na bancada (a L1 e a M2): a legenda ganha o botão "Legenda",
// parado no canto, e a lista sobe acima dele (`legendCollapsible`, `defaultLegendOpen`); o minimapa ganha o
// botão junto dos de zoom (`minimapToggle`, `defaultMinimapOpen`). Sem as props novas, nada muda.
// Provado contra o defeito: no pacote da 0.37.0 não há botão nenhum, e os testes do botão reprovam.
import {render, fireEvent, within} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import {AureaProvider, ptBR} from "../../packages/react/src/index";
import {DependencyGraph, type DependencyGraphProps, type GraphEdgeItem, type GraphNodeItem} from "../../packages/react/src/graph";

const NOS: GraphNodeItem[] = ["fw", "core", "srv"].map((id, i) => ({id, label: id, x: i * 200, y: 0}));
const ARESTAS: GraphEdgeItem[] = [
  {id: "fw-core", from: "fw", to: "core", pattern: "double", legend: "Fibra"},
  {id: "core-srv", from: "core", to: "srv", legend: "Cobre", status: {label: "Caído", tone: "danger", mark: "cross"}},
];
const montar = (props: Partial<DependencyGraphProps>) =>
  render(<AureaProvider strings={ptBR}><DependencyGraph nodes={NOS} edges={ARESTAS} {...props}/></AureaProvider>).container;
const botao = (c: HTMLElement, nome: string) =>
  [...c.querySelectorAll<HTMLButtonElement>("button")].find((b) => (b.getAttribute("aria-label") ?? b.textContent?.trim()) === nome) ?? null;
const alvo = (c: HTMLElement, b: HTMLButtonElement) => {
  const id = b.getAttribute("aria-controls");
  return id ? c.ownerDocument.getElementById(id) : null;
};

describe("MNT-31: a legenda que fecha", () => {
  test("sem `legendCollapsible`, a legenda é a de antes: aberta, sem botão", () => {
    const c = montar({legend: true});
    expect(c.querySelector(".graph-legend")).not.toBeNull();
    expect(botao(c, ptBR.graphLegend)).toBeNull();
  });

  test("com `legendCollapsible`, o botão diz que está aberta e aponta para a lista; o clique fecha", () => {
    const c = montar({legend: true, legendCollapsible: true});
    const b = botao(c, ptBR.graphLegend)!;
    expect(b, "o botão “Legenda” existe").not.toBeNull();
    expect(b.getAttribute("aria-expanded")).toBe("true");
    const lista = alvo(c, b);
    expect(lista, "o `aria-controls` aponta para algo que existe").not.toBeNull();
    expect(lista!.classList.contains("graph-legend")).toBe(true);
    expect(within(lista!).getByText("Fibra")).toBeTruthy();
    // a lista vem ANTES do botão na doca: ela sobe acima dele, e o botão fica parado no canto
    expect(lista!.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(b);
    expect(c.querySelector(".graph-legend")).toBeNull();
    expect(b.getAttribute("aria-expanded")).toBe("false");
    expect(b.hasAttribute("aria-controls"), "fechada, não aponta para o que não existe").toBe(false);
    fireEvent.click(b);
    expect(c.querySelector(".graph-legend")).not.toBeNull();
  });

  test("`defaultLegendOpen={false}` começa fechada: sobra só o botão", () => {
    const c = montar({legend: true, legendCollapsible: true, defaultLegendOpen: false});
    expect(c.querySelector(".graph-legend")).toBeNull();
    expect(botao(c, ptBR.graphLegend)!.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("MNT-31: o botão do minimapa, junto dos de zoom", () => {
  test("sem `minimapToggle`, o minimapa é o de antes, e os botões de zoom não ganham botão", () => {
    const c = montar({minimap: true, controls: true});
    expect(c.querySelector(".graph-minimap")).not.toBeNull();
    expect(botao(c, ptBR.graphOverview)).toBeNull();
  });

  test("com `minimapToggle`, o botão mora com os de zoom, diz que está aberto e esconde o minimapa", () => {
    const c = montar({minimap: true, controls: true, minimapToggle: true});
    const b = botao(c, ptBR.graphOverview)!;
    expect(b, "o botão “Visão geral” existe").not.toBeNull();
    expect(b.closest(".graph-controls"), "junto dos de zoom").not.toBeNull();
    expect(within(b.closest<HTMLElement>(".graph-controls")!).queryByLabelText(ptBR.graphZoomIn)).not.toBeNull();
    expect(b.getAttribute("aria-expanded")).toBe("true");
    expect(alvo(c, b)?.querySelector(".graph-minimap"), "o `aria-controls` aponta para o minimapa").not.toBeNull();
    fireEvent.click(b);
    expect(c.querySelector(".graph-minimap")).toBeNull();
    expect(b.getAttribute("aria-expanded")).toBe("false");
    expect(b.hasAttribute("aria-controls")).toBe(false);
  });

  test("sem `controls`, o botão do minimapa aparece sozinho no canto de cima", () => {
    const c = montar({minimap: true, minimapToggle: true});
    const grupo = botao(c, ptBR.graphOverview)!.closest<HTMLElement>(".graph-controls")!;
    expect(grupo.querySelectorAll("button")).toHaveLength(1);
  });

  test("`defaultMinimapOpen={false}` começa escondido", () => {
    const c = montar({minimap: true, minimapToggle: true, defaultMinimapOpen: false});
    expect(c.querySelector(".graph-minimap")).toBeNull();
    expect(botao(c, ptBR.graphOverview)!.getAttribute("aria-expanded")).toBe("false");
  });
});
