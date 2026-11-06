// S-04 e S-05 (05/11/2026) · a Aurea deixa de ser estática na web.
//
// S-04: o escolhido do `SegmentedControl` e do `Tabs` PULAVA (o fundo é pintado no próprio item); os menus, o `Select`,
// o `Combobox` e a `CommandPalette` apareciam de uma vez. S-05: o arrasto do `SortableList` e do `BlockEditor` ia de casa
// em casa, sem a linha seguir o ponteiro e sem os vizinhos deslizarem. Aprovado pelo Victor na bancada
// (`apps/keyboard-probe/movimento.html`, *"Pode, Ember também"*).
//
// O jsdom não desenha nem anima: o teste faz o papel do navegador — dá as caixas (`getBoundingClientRect`, `offsetTop`),
// os tokens de tempo (uma folha com `--duration-*` e `--ease-*`) e a animação (`Element.animate`, que ele grava). O que
// reprova o código de antes: não havia peça de passagem nem chamada de animação, e a linha arrastada não andava.
import {act, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {AureaProvider, SegmentedControl, SortableList, Tabs} from "../../packages/react/src/index";

type Gravada = {el: Element; quadros: Keyframe[]; opcoes: KeyframeAnimationOptions};
let gravadas: Gravada[] = [];
let reduzir = false;
const folha = document.createElement("style");
folha.textContent = ".segmented,.tabs,.sortable-list{--duration-slow:280ms;--duration-base:180ms;--ease-emphasized:cubic-bezier(0.2,0.8,0.2,1)}";

const posicao = (el: Element) => [...(el.parentElement?.children ?? [])].filter((c) => !c.classList.contains("selection-indicator") && c.tagName !== "INPUT").indexOf(el);

beforeEach(() => {
  gravadas = [];
  reduzir = false;
  document.head.append(folha);
  vi.stubGlobal("matchMedia", (m: string) => ({matches: m.includes("reduced-motion") && reduzir, media: m, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}}));
  // Os itens de uma fila em linha têm 80 de largura, a 83 um do outro; as linhas de uma lista, 44 de altura a 50.
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const i = posicao(this);
    if (this.matches(".segmented :is(button,a), .tab")) return new DOMRect(4 + i * 83, 4, 80, 32);
    if (this.matches(".sortable-item")) return new DOMRect(0, i * 50, 300, 44);
    return new DOMRect(0, 0, 400, 40);
  });
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".sortable-item") ? posicao(this) * 50 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".sortable-item") ? 44 : 0;
  });
  (HTMLElement.prototype as unknown as {animate: unknown}).animate = function (this: Element, quadros: Keyframe[], opcoes: KeyframeAnimationOptions) {
    gravadas.push({el: this, quadros, opcoes});
    return {id: opcoes.id, cancel() {}, finish() {}, onfinish: null, oncancel: null} as unknown as Animation;
  };
  (HTMLElement.prototype as unknown as {getAnimations: unknown}).getAnimations = () => [];
  (HTMLElement.prototype as unknown as {setPointerCapture: unknown}).setPointerCapture = () => {};
});
afterEach(() => {
  folha.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as unknown as {animate?: unknown}).animate;
  delete (HTMLElement.prototype as unknown as {getAnimations?: unknown}).getAnimations;
});

const ITENS = [{value: "dia", label: "Day"}, {value: "semana", label: "Week"}, {value: "mes", label: "Month"}];
function Segmentos() {
  const [v, setV] = React.useState("semana");
  return <AureaProvider><SegmentedControl label="Period" items={ITENS} value={v} onChange={setV} /></AureaProvider>;
}

describe("S-04 · o escolhido desliza (web)", () => {
  it("o tempo e a curva saem dos tokens da folha", () => {
    render(<Segmentos />);
    const fila = document.querySelector(".segmented")!;
    expect(getComputedStyle(fila).getPropertyValue("--duration-slow").trim()).toBe("280ms");
  });

  it("SegmentedControl: na troca, uma peça de passagem anda do escolhido de antes ao novo, com o tempo do token", () => {
    render(<Segmentos />);
    fireEvent.click(screen.getByRole("radio", {name: "Month"}));
    const fila = document.querySelector(".segmented")!;
    const passagem = fila.querySelector(".selection-indicator");
    expect(passagem, "a peça de passagem existe durante a troca").not.toBeNull();
    expect(passagem!.getAttribute("aria-hidden")).toBe("true");
    const a = gravadas.find((g) => g.el === passagem)!;
    expect(a, "a peça anda").toBeDefined();
    expect(a.opcoes.duration).toBe(280);
    expect(a.opcoes.easing).toBe("cubic-bezier(0.2,0.8,0.2,1)");
    // de "Week" (4 + 83) até "Month" (4 + 166), descontada a borda da fila (0 no jsdom).
    expect(a.quadros[0].transform).toBe("translate(87px,4px)");
    expect(a.quadros[1].transform).toBe("translate(170px,4px)");
    // e o item novo não se pinta por baixo enquanto ela passa
    const mes = screen.getByRole("radio", {name: "Month"});
    expect(mes.hasAttribute("data-sliding")).toBe(true);
    expect(mes.style.getPropertyValue("background-color")).toBe("transparent");
  });

  it("troca no meio do caminho: a peça anterior sai, e o item que ela pintava volta a se pintar, sem resto de estilo", () => {
    render(<Segmentos />);
    fireEvent.click(screen.getByRole("radio", {name: "Month"}));
    const fila = document.querySelector(".segmented")!;
    act(() => { fireEvent.click(screen.getByRole("radio", {name: "Day"})); });
    // Troca no meio do caminho: a peça anterior saiu, só existe uma.
    expect(fila.querySelectorAll(".selection-indicator").length).toBe(1);
    expect(screen.getByRole("radio", {name: "Month"}).hasAttribute("style")).toBe(false);
  });

  it("quem pediu 'reduzir movimento' vê a troca de uma vez, como antes", () => {
    reduzir = true;
    render(<Segmentos />);
    fireEvent.click(screen.getByRole("radio", {name: "Month"}));
    expect(document.querySelector(".selection-indicator")).toBeNull();
    expect(gravadas).toEqual([]);
  });

  it("Tabs: a aba escolhida também desliza", () => {
    function Abas() {
      const [v, setV] = React.useState("a");
      return <AureaProvider><Tabs label="Sections" value={v} onChange={setV} tabs={[
        {id: "a", label: "One", content: "1"}, {id: "b", label: "Two", content: "2"}, {id: "c", label: "Three", content: "3"}]} /></AureaProvider>;
    }
    render(<Abas />);
    fireEvent.click(screen.getByRole("tab", {name: "Three"}));
    const passagem = document.querySelector(".tabs .selection-indicator");
    expect(passagem).not.toBeNull();
    const a = gravadas.find((g) => g.el === passagem)!;
    expect(a.quadros[0].transform).toBe("translate(4px,4px)");
    expect(a.quadros[1].transform).toBe("translate(170px,4px)");
  });
});

describe("S-05 · o arrasto anda (web)", () => {
  const ETAPAS = [{id: "a", label: "Backlog"}, {id: "b", label: "To do"}, {id: "c", label: "Doing"}];
  function Lista() {
    const [l, setL] = React.useState(ETAPAS);
    return <AureaProvider><SortableList label="Stages" items={l} onReorder={(de, para) => setL((x) => {
      const n = x.slice(); const [i] = n.splice(de, 1); n.splice(para, 0, i); return n;
    })} /></AureaProvider>;
  }
  const linha = (nome: string) => screen.getByText(nome).closest(".sortable-item") as HTMLElement;
  const alca = (nome: string) => linha(nome).querySelector(".sortable-handle") as HTMLElement;

  it("a linha pega SEGUE o ponteiro, e fica por cima das outras", () => {
    render(<Lista />);
    fireEvent.pointerDown(alca("Backlog"), {pointerId: 1, button: 0, clientY: 10});
    fireEvent.pointerMove(alca("Backlog"), {pointerId: 1, clientY: 20});
    expect(linha("Backlog").style.translate).toBe("0 10px");
    expect(linha("Backlog").hasAttribute("data-dragging")).toBe(true);
  });

  it("ao passar do meio da vizinha, a ordem troca, a linha continua sob o ponteiro e a vizinha DESLIZA", () => {
    render(<Lista />);
    fireEvent.pointerDown(alca("Backlog"), {pointerId: 1, button: 0, clientY: 10});
    // O meio da 2ª linha é 50 + 22 = 72: com o ponteiro em 65 ele ainda está acima dele, e o 1º meio (22) já ficou para trás.
    fireEvent.pointerMove(alca("Backlog"), {pointerId: 1, clientY: 65});
    // Backlog foi para o 2º lugar (topo 50): 65 − 10 − 50 = 5.
    expect(screen.getAllByRole("listitem").map((l) => l.textContent)).toEqual([expect.stringContaining("To do"), expect.stringContaining("Backlog"), expect.stringContaining("Doing")]);
    expect(linha("Backlog").style.translate).toBe("0 5px");
    const vizinha = gravadas.find((g) => g.el === linha("To do"));
    expect(vizinha, "a vizinha desliza do lugar de antes").toBeDefined();
    expect(vizinha!.quadros[0].transform).toBe("translateY(50px)");
    expect(vizinha!.opcoes.duration).toBe(180);
    expect(gravadas.some((g) => g.el === linha("Backlog")), "a linha pega não anima: é a mão que move").toBe(false);
  });

  it("ao soltar, a linha desliza do ponteiro até o lugar dela", () => {
    render(<Lista />);
    fireEvent.pointerDown(alca("Backlog"), {pointerId: 1, button: 0, clientY: 10});
    fireEvent.pointerMove(alca("Backlog"), {pointerId: 1, clientY: 20});
    fireEvent.pointerUp(alca("Backlog"), {pointerId: 1, clientY: 20});
    expect(linha("Backlog").style.translate).toBe("");
    const pouso = gravadas.find((g) => g.el === linha("Backlog"));
    expect(pouso!.quadros[0].transform).toBe("translateY(10px)");
  });

  it("pelo teclado, as linhas que trocam deslizam também", () => {
    render(<Lista />);
    const h = alca("Backlog");
    h.focus();
    fireEvent.keyDown(h, {key: " "});
    fireEvent.keyDown(h, {key: "ArrowDown"});
    expect(gravadas.find((g) => g.el === linha("To do"))?.quadros[0].transform).toBe("translateY(50px)");
    expect(gravadas.find((g) => g.el === linha("Backlog"))?.quadros[0].transform).toBe("translateY(-50px)");
  });

  it("com 'reduzir movimento', a ordem troca sem deslizar", () => {
    reduzir = true;
    render(<Lista />);
    const h = alca("Backlog");
    fireEvent.keyDown(h, {key: " "});
    fireEvent.keyDown(h, {key: "ArrowDown"});
    expect(gravadas).toEqual([]);
  });
});

describe("S-04 · os menus e a paleta entram e saem (CSS do core)", () => {
  const css = readFileSync(resolve(__dirname, "../../packages/core/src/aurea.css"), "utf-8");
  it("a lista `.menu` esmaece e cresce pelos estados do motor, com o tempo dos tokens", () => {
    expect(css).toMatch(/\.menu \{ transform-origin:var\(--transform-origin,center\); transition:opacity var\(--duration-base\) var\(--ease-standard\),scale var\(--duration-base\) var\(--ease-standard\); \}/);
    expect(css).toContain(".menu[data-starting-style],.menu[data-ending-style] { opacity:0; scale:.95; }");
  });
  it("a paleta entra como o Dialog: o fundo esmaece, a caixa cresce", () => {
    expect(css).toContain(".command-overlay[data-starting-style],.command-overlay[data-ending-style] { opacity:0; }");
    expect(css).toContain(".command-palette[data-starting-style],.command-palette[data-ending-style] { scale:.95; }");
  });
  it("e 'reduzir movimento' zera tudo pela regra global", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion:reduce\) \{ \*,\*:before,\*:after \{[^}]*transition-duration:\.01ms!important/);
  });
});
