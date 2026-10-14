// A LEGENDA DO MAPA EM DUAS PARTES — 12/10/2026, passo 10 (0.32.0).
//
// O Victor, olhando a bancada: "mostra 10G deve ser fibra, o que é cobre?". A legenda misturava o TIPO da
// ligação (cobre, fibra) e o ESTADO dela (ativo, caído) numa lista só — a linha de fibra virou "Ativo".
// Escolha dele, depois da pesquisa nas referências de mapa que ele mesmo indicou: a legenda tem duas
// partes. Nenhuma das referências de mapa junta as duas coisas: uma legenda só o tipo (pelo desenho);
// as outras pintam o estado (pela cor).
//
// Na linha, o estado entra como o selo do nó: `status: {label, tone}`. O tom pinta o traço; a palavra
// entra na parte "Estado". O `legend` continua sendo o tipo, e a amostra dele é SEM cor.
// Cada amostra mostra o que TODAS as linhas do grupo têm em comum. A marca de cada parte é a SUA: o
// `mark` da linha é do tipo (o cadeado da VPN); o `status.mark` é do estado (o × do "Caído"). A primeira
// versão adivinhava pela lista — e com uma linha só não dá: o cadeado de uma VPN "Ativo" sumia (este
// teste pegou).
import {render} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import {AureaProvider, ptBR, defaultStrings} from "../../packages/react/src/index";
import {DependencyGraph, type GraphEdgeItem, type GraphNodeItem} from "../../packages/react/src/graph";

const NOS: GraphNodeItem[] = ["fw", "core", "srv", "a1", "lldp", "cam"].map((id, i) => ({id, label: id, x: i * 200, y: 0}));
const COM_ESTADO: GraphEdgeItem[] = [
  {id: "fw-core", from: "fw", to: "core", pattern: "double", weight: "thick", label: "10G", legend: "Fibra", status: {label: "Ativo", tone: "success"}},
  {id: "core-srv", from: "core", to: "srv", pattern: "double", legend: "Fibra", status: {label: "Ativo", tone: "success"}},
  {id: "core-a1", from: "core", to: "a1", legend: "Cobre"},
  {id: "core-lldp", from: "core", to: "lldp", pattern: "dashed", legend: "Estimado", status: {label: "Atenção", tone: "warning"}},
  {id: "a1-cam", from: "a1", to: "cam", legend: "Cobre", status: {label: "Caído", tone: "danger", mark: "cross"}},
];

const montar = (edges: GraphEdgeItem[], strings = ptBR) =>
  render(<AureaProvider strings={strings}><DependencyGraph nodes={NOS} edges={edges} legend /></AureaProvider>).container;
const partes = (c: HTMLElement) => [...c.querySelectorAll<HTMLUListElement>(".graph-legend ul")];
const nomes = (ul: HTMLUListElement) => [...ul.querySelectorAll("li")].map((li) => li.textContent);
const amostra = (c: HTMLElement, nome: string) => {
  const li = [...c.querySelectorAll(".graph-legend li")].find((x) => x.textContent === nome)!;
  return {traco: li.querySelector(".graph-legend-sample .graph-edge")!.getAttribute("class")!, marca: li.querySelector(".graph-edge-mark")?.className ?? null};
};

describe("a legenda do mapa em duas partes: o tipo da ligação e o estado", () => {
  test("com estado, duas partes com título: o tipo primeiro, o estado depois", () => {
    const c = montar(COM_ESTADO);
    const [tipo, estado] = partes(c);
    expect(partes(c)).toHaveLength(2);
    expect(nomes(tipo)).toEqual(["Fibra", "Cobre", "Estimado"]);
    expect(nomes(estado)).toEqual(["Ativo", "Atenção", "Caído"]);
    // O título visível nomeia cada lista para o leitor de tela.
    expect(document.getElementById(tipo.getAttribute("aria-labelledby")!)!.textContent).toBe(ptBR.graphLegendKind);
    expect(document.getElementById(estado.getAttribute("aria-labelledby")!)!.textContent).toBe(ptBR.graphLegendStatus);
    expect(c.querySelector(".graph-legend")!.getAttribute("aria-label")).toBe(ptBR.graphLegend);
  });

  test("a amostra do tipo é SEM cor e com o desenho comum; a do estado é a cor, sem o desenho do cabo", () => {
    const c = montar(COM_ESTADO);
    // "Fibra": dupla nas duas linhas, mas grossa só numa — o comum é a dupla, na espessura de sempre.
    expect(amostra(c, "Fibra").traco).toMatch(/graph-edge-double/);
    expect(amostra(c, "Fibra").traco).not.toMatch(/graph-edge-thick|graph-edge-tone-/);
    // "Estimado": as linhas dele são de atenção, e mesmo assim a amostra do tipo não leva a cor.
    expect(amostra(c, "Estimado").traco).toMatch(/graph-edge-dashed/);
    expect(amostra(c, "Estimado").traco).not.toMatch(/graph-edge-tone-/);
    // O estado: a cor, e nada do cabo (as linhas "Ativo" são duplas, a amostra não).
    expect(amostra(c, "Ativo").traco).toMatch(/graph-edge-tone-success/);
    expect(amostra(c, "Ativo").traco).not.toMatch(/graph-edge-double|graph-edge-thick/);
    expect(amostra(c, "Caído").traco).toMatch(/graph-edge-tone-danger/);
  });

  test("cada parte tem a sua marca: o × do estado no \"Caído\", o cadeado do tipo na \"VPN\"", () => {
    const c = montar(COM_ESTADO);
    expect(amostra(c, "Caído").marca).toMatch(/graph-edge-mark-cross/);
    expect(amostra(c, "Cobre").marca).toBeNull();
    // UMA linha só, de VPN e caída: o cadeado é do tipo e o × é do estado — cada um na sua parte.
    const vpn = montar([{id: "v", from: "fw", to: "core", mark: "lock", legend: "VPN", status: {label: "Caído", tone: "danger", mark: "cross"}}]);
    expect(amostra(vpn, "VPN").marca).toMatch(/graph-edge-mark-lock/);
    expect(amostra(vpn, "Caído").marca).toMatch(/graph-edge-mark-cross/);
  });

  test("quem usava `mark` com um `legend` de estado (como até a 0.31.0) continua vendo a mesma legenda", () => {
    const c = montar([{id: "a", from: "a1", to: "cam", mark: "cross", legend: "Caído"}, {id: "b", from: "core", to: "a1", legend: "Cobre"}]);
    expect(partes(c)).toHaveLength(1);
    expect(nomes(partes(c)[0])).toEqual(["Caído", "Cobre"]);
    expect(amostra(c, "Caído").marca).toMatch(/graph-edge-mark-cross/);
  });

  test("o tom do estado pinta o traço da linha no mapa", () => {
    const c = montar(COM_ESTADO);
    const traco = (id: string) => c.querySelector(`.react-flow__edge[data-id="${id}"] path.react-flow__edge-path`)?.getAttribute("class") ?? "";
    expect(traco("a1-cam")).toMatch(/graph-edge-tone-danger/);
    expect(traco("core-a1")).not.toMatch(/graph-edge-tone-/);
  });

  test("só com tipos, a legenda é uma lista, sem título — como era", () => {
    const c = montar(COM_ESTADO.map(({status: _s, ...e}) => e));
    expect(partes(c)).toHaveLength(1);
    expect(c.querySelector(".graph-legend-title")).toBeNull();
    expect(nomes(partes(c)[0])).toEqual(["Fibra", "Cobre", "Estimado"]);
  });

  test("só com estados, também uma lista, sem título", () => {
    const c = montar(COM_ESTADO.map(({legend: _l, ...e}) => e));
    expect(partes(c)).toHaveLength(1);
    expect(nomes(partes(c)[0])).toEqual(["Ativo", "Atenção", "Caído"]);
  });

  test("as duas frases novas existem nos dois idiomas", () => {
    expect(defaultStrings.graphLegendKind).toBe("Link type");
    expect(defaultStrings.graphLegendStatus).toBe("Status");
    expect(ptBR.graphLegendKind).toBe("Tipo de ligação");
    expect(ptBR.graphLegendStatus).toBe("Estado");
    const c = montar(COM_ESTADO, defaultStrings);
    expect(c.querySelector(".graph-legend-title")!.textContent).toBe("Link type");
  });
});
