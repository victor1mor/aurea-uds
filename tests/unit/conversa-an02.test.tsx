// AN-02 · o `MessageList` para conversa longa — Lote H, 04/10/2026. Antes, a mensagem tinha só
// id, body, author, time, avatar e status, e toda mensagem virava página.
//
// O que o jsdom prova está aqui: os campos novos, o separador de dia, as linhas das pontas e o
// anunciador. Ele não tem leiaute, então NÃO prova a posição da rolagem — essa se mede no Chromium,
// em `tests/visual/lote-h.spec.ts`, sobre o banco `apps/keyboard-probe/conversa.html`.
//
// Cada teste reprova o código de antes, menos o último bloco ("nada muda").
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import * as React from "react";
import {act, render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {AureaProvider, MessageList, ptBR, type ChatMessage} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider strings={ptBR}>{ui}</AureaProvider>);

let observadores: Array<{cb: IntersectionObserverCallback; alvos: Element[]; vivo: boolean}> = [];
beforeEach(() => {
  observadores = [];
  vi.stubGlobal("IntersectionObserver", class {
    o: {cb: IntersectionObserverCallback; alvos: Element[]; vivo: boolean};
    constructor(cb: IntersectionObserverCallback) { this.o = {cb, alvos: [], vivo: true}; observadores.push(this.o); }
    observe(el: Element) { this.o.alvos.push(el); }
    disconnect() { this.o.vivo = false; }
    unobserve() {}
    takeRecords() { return []; }
  });
});
afterEach(() => vi.unstubAllGlobals());
// Diz ao observador vivo de um elemento que ele entrou na tela.
const entrar = (el: Element) => act(() => {
  for (const o of observadores.filter((x) => x.vivo && x.alvos.includes(el))) o.cb([{isIntersecting: true, target: el} as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
});

const CONVERSA: ChatMessage[] = [
  {id: "1", day: "Ontem", author: "Analyst", time: "18:02", body: "Mandei o relatório.", direction: "incoming", avatar: {fallback: "AN"}},
  {id: "2", day: "Hoje", body: "Recebi, obrigado.", time: "09:10", direction: "outgoing", avatar: {fallback: "EU"}},
  {id: "3", day: "Hoje", author: "Analyst", time: "09:12", body: "Segue o resumo.", direction: "incoming", edited: true,
    replyTo: {id: "2", author: "Você", body: "Recebi, obrigado."}, forwardedFrom: "Curator",
    attachments: [
      {id: "f1", kind: "image", src: "/a.jpg", alt: "Gráfico de setembro"},
      {id: "f2", kind: "video", src: "/b.jpg", alt: "Gravação da reunião", duration: 95},
      {id: "f3", kind: "file", name: "resumo.pdf", bytes: 20480, href: "/resumo.pdf"},
    ]},
];

describe("MessageList · os campos novos da mensagem", () => {
  test("direction: a minha leva .message-out e não desenha avatar; a dos outros leva .message-in", () => {
    const {container} = wrap(<MessageList messages={CONVERSA} />);
    const [m1, m2] = container.querySelectorAll(".message");
    expect(m1).toHaveClass("message-in");
    expect(m1.querySelector(".avatar")).not.toBeNull();
    expect(m2).toHaveClass("message-out");
    expect(m2.querySelector(".avatar")).toBeNull();
    expect(m2.firstElementChild).toHaveClass("message-bubble");
  });

  test("encaminhada, resposta, álbum, arquivo e 'editada' saem na bolha", () => {
    const {container} = wrap(<MessageList messages={CONVERSA} />);
    const bolha = container.querySelectorAll(".message")[2].querySelector(".message-bubble")!;
    expect(bolha.querySelector(".message-forwarded")!.textContent).toBe("Encaminhada de Curator");
    expect(bolha.querySelector(".message-quote")!.textContent).toBe("VocêRecebi, obrigado.");
    expect(bolha.querySelector(".label .hint")!.textContent).toBe("editada · 09:12");
    const album = within(bolha as HTMLElement).getAllByRole("list", {name: "Anexos"})[0];
    expect(album).toHaveClass("gallery", "message-album");
    expect(within(album).getAllByRole("button")).toHaveLength(2);
    expect(album.querySelector(".gallery-duration")!.textContent).toContain("1:35");
    const link = within(bolha as HTMLElement).getByRole("link", {name: "resumo.pdf"});
    expect(link).toHaveAttribute("href", "/resumo.pdf");
    expect(link).toHaveAttribute("download", "resumo.pdf");
    expect(link.closest(".file-item")!.querySelector(".file-size")!.textContent).toBe("20 KB");
  });

  test("o álbum amplia por padrão; com onOpenAttachment, avisa o app em vez de ampliar", async () => {
    const user = userEvent.setup();
    const abrir = vi.fn();
    const {container} = wrap(<MessageList messages={CONVERSA} onOpenAttachment={abrir} />);
    await user.click(within(container.querySelector(".message-album") as HTMLElement).getAllByRole("button")[1]);
    expect(abrir).toHaveBeenCalledWith(expect.objectContaining({id: "3"}), expect.objectContaining({id: "f2", kind: "video"}));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("o separador de dia entra quando o dia muda, e só aí", () => {
    const {container} = wrap(<MessageList messages={CONVERSA} />);
    const dias = Array.from(container.querySelectorAll(".message-day")).map((d) => d.textContent);
    expect(dias).toEqual(["Ontem", "Hoje"]);
    // E fica antes da primeira mensagem do dia.
    expect(container.querySelector(".message-day + .message")).toHaveAttribute("data-message-id", "1");
  });
});

describe("MessageList · a janela (onReachStart / onReachEnd)", () => {
  test("as linhas das pontas avisam ao entrar na tela; carregando, mostram a rodinha e não avisam", () => {
    const onReachStart = vi.fn(), onReachEnd = vi.fn();
    const {container, rerender} = wrap(<MessageList messages={CONVERSA} hasMoreBefore hasMoreAfter onReachStart={onReachStart} onReachEnd={onReachEnd} />);
    const [topo, fim] = container.querySelectorAll(".message-more");
    expect(topo.nextElementSibling).toHaveClass("message-day");
    expect(fim.previousElementSibling).toHaveAttribute("data-message-id", "3");
    entrar(topo);
    expect(onReachStart).toHaveBeenCalledTimes(1);
    entrar(fim);
    expect(onReachEnd).toHaveBeenCalledTimes(1);

    rerender(<AureaProvider strings={ptBR}><MessageList messages={CONVERSA} hasMoreBefore loadingBefore onReachStart={onReachStart} onReachEnd={onReachEnd} /></AureaProvider>);
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-busy", "true");
    const topo2 = container.querySelector(".message-more")!;
    expect(topo2.querySelector(".spinner")).not.toBeNull();
    entrar(topo2);
    expect(onReachStart).toHaveBeenCalledTimes(1);
  });

  test("com a janela, a lista não é região viva; o anunciador lê só a que chega no fim", () => {
    const base = CONVERSA.slice(0, 2);
    const {rerender} = wrap(<MessageList messages={base} hasMoreBefore onReachStart={() => {}} />);
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "off");
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");
    // Entram antigas em cima: nada é anunciado.
    rerender(<AureaProvider strings={ptBR}><MessageList messages={[{id: "0", body: "Antiga"}, ...base]} hasMoreBefore onReachStart={() => {}} /></AureaProvider>);
    expect(status).toHaveTextContent("");
    // Chega uma no fim: ela é anunciada.
    rerender(<AureaProvider strings={ptBR}><MessageList messages={[{id: "0", body: "Antiga"}, ...base, {id: "9", author: "Writer", body: "Chegou agora"}]} hasMoreBefore onReachStart={() => {}} /></AureaProvider>);
    expect(status).toHaveTextContent("WriterChegou agora");
  });

  test("axe limpo com a conversa inteira e as duas pontas carregando", async () => {
    const {container} = wrap(<MessageList messages={CONVERSA} hasMoreBefore hasMoreAfter loadingBefore loadingAfter onReachStart={() => {}} onReachEnd={() => {}} />);
    expect(container.querySelectorAll(".message-more .spinner")).toHaveLength(2);
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
  });
});

describe("MessageList · nada muda sem as props novas", () => {
  test("mensagem de antes: avatar ou vazio, bolha larga, região viva polida e nada rolado", () => {
    const {container} = wrap(<MessageList messages={[{id: "a", author: "Analyst", time: "10:00", body: "Oi", avatar: {fallback: "AN"}}, {id: "b", body: "Sem avatar"}]} />);
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).not.toHaveAttribute("aria-busy");
    const [a, b] = container.querySelectorAll(".message");
    expect(a.className).toBe("message");
    expect(a.firstElementChild).toHaveClass("avatar");
    expect(b.firstElementChild!.tagName).toBe("SPAN");
    expect(b.firstElementChild!.className).toBe("");
    expect(container.querySelector(".message-more, .message-day")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(a.querySelector(".label .hint")!.textContent).toBe("10:00");
  });
});
