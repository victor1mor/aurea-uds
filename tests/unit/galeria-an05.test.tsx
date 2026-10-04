// AN-05 · a `Gallery` para acervo grande — Lote H, 04/10/2026. A galeria de uma conversa tem
// milhares de itens de tipos misturados, e o app antigo marcava vários para baixar em lote. Antes:
// uma seleção só (`selected: string`), item sem tipo nem duração, e tudo pronto de uma vez.
//
// Cada teste reprova o código de antes, menos o último bloco ("nada muda"), que é a trava de quem
// não usa as props novas.
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import * as React from "react";
import {act, render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {AureaProvider, Gallery, ptBR, type GalleryItem} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider strings={ptBR}>{ui}</AureaProvider>);
const FOTOS: GalleryItem[] = [
  {id: "a", src: "/a.jpg", alt: "Praia"},
  {id: "b", src: "/b.jpg", alt: "Serra", kind: "video", duration: 83},
  {id: "c", src: "/c.jpg", alt: "Rio"},
];

// O jsdom não tem `IntersectionObserver`. O dublê guarda quem foi observado e deixa o teste dizer
// quando a linha do fim "entrou na tela". Ele responde ao observar, como o navegador faz.
let observadores: Array<{cb: IntersectionObserverCallback; alvos: Element[]; vivo: boolean}> = [];
let visivel = false;
beforeEach(() => {
  observadores = []; visivel = false;
  vi.stubGlobal("IntersectionObserver", class {
    o: {cb: IntersectionObserverCallback; alvos: Element[]; vivo: boolean};
    constructor(cb: IntersectionObserverCallback) { this.o = {cb, alvos: [], vivo: true}; observadores.push(this.o); }
    observe(el: Element) { this.o.alvos.push(el); this.o.cb([{isIntersecting: visivel, target: el} as unknown as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
    disconnect() { this.o.vivo = false; }
    unobserve() {}
    takeRecords() { return []; }
  });
});
afterEach(() => vi.unstubAllGlobals());
const entrarNaTela = () => act(() => {
  visivel = true;
  for (const o of observadores.filter((x) => x.vivo)) o.cb(o.alvos.map((t) => ({isIntersecting: true, target: t}) as unknown as IntersectionObserverEntry), {} as IntersectionObserver);
});

describe("Gallery · selectionMode=\"multiple\"", () => {
  test("cada ladrilho é botão de alternar; clicar avisa a lista nova, e a marca vem de fora", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const {rerender} = wrap(<Gallery items={FOTOS} selectionMode="multiple" selectedIds={["a"]} onSelectionChange={onSelectionChange} />);
    const [a, b] = screen.getAllByRole("button");
    expect(a).toHaveAttribute("aria-pressed", "true");
    expect(a).toHaveClass("is-selected");
    expect(b).toHaveAttribute("aria-pressed", "false");
    expect(a).not.toHaveAttribute("aria-current");
    await user.click(b);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a", "b"]);
    expect(b).toHaveAttribute("aria-pressed", "false"); // a galeria não guarda escolha
    rerender(<AureaProvider strings={ptBR}><Gallery items={FOTOS} selectionMode="multiple" selectedIds={["a", "b"]} onSelectionChange={onSelectionChange} /></AureaProvider>);
    expect(b).toHaveAttribute("aria-pressed", "true");
    await user.click(a);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["b"]);
  });

  test("ao escolher em lote, clicar marca e não amplia, mesmo com zoom", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    wrap(<Gallery items={FOTOS} zoom selectionMode="multiple" selectedIds={[]} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getAllByRole("button")[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(["a"]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Gallery · kind e duration", () => {
  // O texto escondido leva os espaços: o nome acessível junta pedaços em linha SEM espaço, e sem
  // eles saía "SerraVídeo1:23" no jsdom. E ele apara as pontas de cada pedaço mesmo com eles,
  // então aqui se cobra o conteúdo; o nome exato se mede no navegador (tests/visual/lote-h.spec.ts).
  test("vídeo leva o Badge com o tempo e o nome 'Vídeo' para o leitor de tela; foto não leva", () => {
    const {container} = wrap(<Gallery items={FOTOS} onSelect={() => {}} />);
    const itens = container.querySelectorAll(".gallery-item");
    const selo = itens[1].querySelector(".gallery-media > .badge.gallery-duration");
    expect(selo).not.toBeNull();
    expect(selo!.textContent).toBe(" Vídeo, 1:23");
    expect(within(itens[1] as HTMLElement).getByRole("button")).toHaveAccessibleName(/^Serra\s*Vídeo,\s*1:23$/);
    expect(itens[0].querySelector(".gallery-duration")).toBeNull();
    expect(itens[0].querySelector(".gallery-media")).toBeNull();
  });
});

describe("Gallery · hasMore + onReachEnd + loading", () => {
  test("a linha do fim avisa quando entra na tela; carregando, mostra a rodinha, a lista fica aria-busy e não avisa de novo", () => {
    const onReachEnd = vi.fn();
    const {container, rerender} = wrap(<Gallery items={FOTOS} hasMore onReachEnd={onReachEnd} />);
    const fim = container.querySelector(".gallery-more");
    expect(fim).not.toBeNull();
    expect(onReachEnd).not.toHaveBeenCalled();
    entrarNaTela();
    expect(onReachEnd).toHaveBeenCalledTimes(1);

    rerender(<AureaProvider strings={ptBR}><Gallery items={FOTOS} hasMore loading onReachEnd={onReachEnd} /></AureaProvider>);
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
    expect(within(container.querySelector(".gallery-more") as HTMLElement).getByRole("status", {name: "Carregando"})).toBeInTheDocument();
    entrarNaTela();
    expect(onReachEnd).toHaveBeenCalledTimes(1);
  });

  test("se a parte nova não enche a tela, a linha continua à vista e avisa de novo", () => {
    const onReachEnd = vi.fn();
    const {rerender} = wrap(<Gallery items={FOTOS.slice(0, 2)} hasMore onReachEnd={onReachEnd} />);
    entrarNaTela();
    expect(onReachEnd).toHaveBeenCalledTimes(1);
    rerender(<AureaProvider strings={ptBR}><Gallery items={FOTOS} hasMore onReachEnd={onReachEnd} /></AureaProvider>);
    expect(onReachEnd).toHaveBeenCalledTimes(2);
  });

  test("axe limpo escolhendo em lote, com vídeo e carregando", async () => {
    const {container} = wrap(<Gallery items={FOTOS} selectionMode="multiple" selectedIds={["b"]} onSelectionChange={() => {}} hasMore loading />);
    expect(screen.getAllByRole("button")[1]).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".gallery-more .spinner")).not.toBeNull();
    const {violations} = await axe(container);
    expect(violations.map((v) => v.id)).toEqual([]);
  });
});

describe("Gallery · nada muda sem as props novas", () => {
  test("uma seleção só, com aria-current, e sem linha de fim nem aria-busy", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const {container} = wrap(<Gallery items={[FOTOS[0], FOTOS[2]]} selected="a" onSelect={onSelect} />);
    const [a, c] = screen.getAllByRole("button");
    expect(a).toHaveAttribute("aria-current", "true");
    expect(a).not.toHaveAttribute("aria-pressed");
    await user.click(c);
    expect(onSelect).toHaveBeenCalledWith("c");
    expect(container.querySelector(".gallery-more")).toBeNull();
    expect(screen.getByRole("list")).not.toHaveAttribute("aria-busy");
  });

  test("sem hasMore, não há linha nem aviso", () => {
    const onReachEnd = vi.fn();
    const {container} = wrap(<Gallery items={FOTOS} onReachEnd={onReachEnd} />);
    expect(container.querySelector(".gallery-more")).toBeNull();
    entrarNaTela();
    expect(onReachEnd).not.toHaveBeenCalled();
  });
});
