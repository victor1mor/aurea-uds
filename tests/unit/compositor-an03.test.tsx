// AN-03 · o `MessageComposer` anexa, responde e edita — Lote H, 04/10/2026. Antes ele só mandava
// texto (`onSend(text)`), e o app antigo anexava arquivo, respondia a uma mensagem (com a prévia
// dela acima do campo) e editava mensagem enviada.
//
// Cada teste reprova o código de antes, menos o último bloco ("nada muda"), que é a trava de quem
// não usa as props novas.
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import * as React from "react";
import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {AureaProvider, MessageComposer, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider strings={ptBR}>{ui}</AureaProvider>);
const arquivo = (nome: string, tipo: string, bytes = 2048) => new File([new Uint8Array(bytes)], nome, {type: tipo});
const seletor = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;

// O jsdom não tem `URL.createObjectURL`; a miniatura da imagem precisa dele.
beforeEach(() => {
  vi.stubGlobal("URL", Object.assign(URL, {createObjectURL: vi.fn(() => "blob:miniatura"), revokeObjectURL: vi.fn()}));
});
afterEach(() => vi.unstubAllGlobals());

describe("MessageComposer · attach", () => {
  test("o clipe abre o seletor; o escolhido aparece acima do campo, com nome e tamanho, e sai no onSend", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const {container} = wrap(<MessageComposer onSend={onSend} attach />);
    const clipe = screen.getByRole("button", {name: "Anexar arquivo"});
    const clique = vi.spyOn(seletor(container), "click");
    await user.click(clipe);
    expect(clique).toHaveBeenCalled();
    await user.upload(seletor(container), [arquivo("nota.pdf", "application/pdf"), arquivo("foto.png", "image/png")]);

    const lista = screen.getByRole("list", {name: "Anexos"});
    const itens = within(lista).getAllByRole("listitem");
    expect(itens.map((i) => i.querySelector(".file-name")!.textContent)).toEqual(["nota.pdf", "foto.png"]);
    expect(itens[0].querySelector(".file-size")!.textContent).toBe("2.0 KB");
    expect(itens[1].querySelector("img.file-thumb")).toHaveAttribute("src", "blob:miniatura");
    expect(screen.getByRole("status")).toHaveTextContent("Arquivo adicionado: nota.pdf, foto.png");
    // A faixa fica DENTRO da moldura do campo, antes dele.
    const grupo = container.querySelector(".input-group")!;
    expect(grupo.firstElementChild).toHaveClass("input-group-addon-block", "message-composer-context");

    // Com anexo, texto vazio pode ir.
    const enviar = screen.getByRole("button", {name: "Enviar"});
    expect(enviar).toBeEnabled();
    await user.click(enviar);
    expect(onSend).toHaveBeenCalledTimes(1);
    const [texto, detalhes] = onSend.mock.calls[0];
    expect(texto).toBe("");
    expect(detalhes.files.map((f: File) => f.name)).toEqual(["nota.pdf", "foto.png"]);
    expect(screen.queryByRole("list", {name: "Anexos"})).toBeNull();
  });

  test("remover tira da lista e avisa; o filtro e o limite são os do FileInput", async () => {
    const user = userEvent.setup({applyAccept: false});
    const {container} = wrap(<MessageComposer onSend={() => {}} attach={{accept: "image/*", maxSize: 1024}} />);
    await user.upload(seletor(container), [arquivo("a.png", "image/png", 512), arquivo("b.txt", "text/plain", 10), arquivo("c.png", "image/png", 4096)]);
    expect(within(screen.getByRole("list", {name: "Anexos"})).getAllByRole("listitem")).toHaveLength(1);
    expect(container.querySelectorAll(".message-composer-context .field-error")).toHaveLength(2);
    expect(container.querySelector(".message-composer-context")!.textContent).toContain("Tipo de arquivo não aceito: b.txt");
    expect(container.querySelector(".message-composer-context")!.textContent).toContain("Arquivo maior que o limite: c.png");
    await user.click(screen.getByRole("button", {name: "Remover a.png"}));
    expect(screen.queryByRole("list", {name: "Anexos"})).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Arquivo removido: a.png");
    expect(screen.getByRole("textbox", {name: "Mensagem"})).toHaveFocus();
  });
});

describe("MessageComposer · replyTo", () => {
  test("mostra de quem e o começo da mensagem; X e Esc cancelam; o envio leva o id", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn(), onCancelReply = vi.fn();
    const {container} = wrap(<MessageComposer onSend={onSend} replyTo={{id: "m7", author: "Analyst", body: "Mandei o arquivo ontem"}} onCancelReply={onCancelReply} />);
    const faixa = container.querySelector(".message-composer-context .message-quote")!;
    expect(faixa.textContent).toContain("Respondendo a Analyst");
    expect(faixa.textContent).toContain("Mandei o arquivo ontem");
    const campo = screen.getByRole("textbox", {name: "Mensagem"});
    expect(campo).toHaveFocus();
    await user.click(screen.getByRole("button", {name: "Cancelar resposta"}));
    expect(onCancelReply).toHaveBeenCalledTimes(1);
    campo.focus();
    await user.keyboard("{Escape}");
    expect(onCancelReply).toHaveBeenCalledTimes(2);
    await user.type(campo, "Recebi{Enter}");
    expect(onSend).toHaveBeenCalledWith("Recebi", {files: [], replyToId: "m7", editingId: undefined});
  });
});

describe("MessageComposer · editing", () => {
  test("o texto antigo entra no campo, o enviar vira salvar, e o envio leva o id; sem clipe", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn(), onCancelEdit = vi.fn();
    const {rerender} = wrap(<MessageComposer onSend={onSend} attach editing={{id: "m3", body: "Bom dia"}} onCancelEdit={onCancelEdit} />);
    const campo = screen.getByRole("textbox", {name: "Mensagem"});
    expect(campo).toHaveValue("Bom dia");
    expect(campo).toHaveFocus();
    expect(screen.getByRole("button", {name: "Salvar"})).toBeEnabled();
    expect(screen.queryByRole("button", {name: "Enviar"})).toBeNull();
    expect(screen.queryByRole("button", {name: "Anexar arquivo"})).toBeNull();
    await user.keyboard("{Escape}");
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
    await user.clear(campo);
    await user.type(campo, "Bom dia a todos{Enter}");
    expect(onSend).toHaveBeenCalledWith("Bom dia a todos", {files: [], replyToId: undefined, editingId: "m3"});

    // A edição acabou: o texto antigo não fica como rascunho de mensagem nova.
    await user.type(campo, "rascunho");
    rerender(<AureaProvider strings={ptBR}><MessageComposer onSend={onSend} attach editing={null} onCancelEdit={onCancelEdit} /></AureaProvider>);
    expect(campo).toHaveValue("");
    expect(screen.getByRole("button", {name: "Enviar"})).toBeDisabled();
  });

  test("axe limpo editando, e respondendo com anexo", async () => {
    const r1 = wrap(<MessageComposer onSend={() => {}} editing={{id: "m3", body: "Bom dia"}} onCancelEdit={() => {}} />);
    expect(screen.getByRole("button", {name: "Salvar"})).toBeInTheDocument();
    expect((await axe(r1.container)).violations.map((v) => v.id)).toEqual([]);
    r1.unmount();
    const user = userEvent.setup();
    const r2 = wrap(<MessageComposer onSend={() => {}} attach replyTo={{id: "m1", author: "Writer", body: "Oi"}} onCancelReply={() => {}} />);
    await user.upload(seletor(r2.container), [arquivo("a.png", "image/png")]);
    expect(screen.getByRole("list", {name: "Anexos"})).toBeInTheDocument();
    expect((await axe(r2.container)).violations.map((v) => v.id)).toEqual([]);
  });
});

describe("MessageComposer · nada muda sem as props novas", () => {
  test("sem attach, replyTo e editing: sem clipe, sem faixa, e onSend(texto) com um argumento só", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const {container} = wrap(<MessageComposer onSend={onSend} />);
    expect(screen.queryByRole("button", {name: "Anexar arquivo"})).toBeNull();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(container.querySelector(".message-composer-context")).toBeNull();
    await user.type(screen.getByRole("textbox", {name: "Mensagem"}), "oi{Enter}");
    expect(onSend.mock.calls).toEqual([["oi"]]);
  });
});
