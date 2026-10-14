// 0.32.0, passo 5 (janelas) · o Dialog, o ConfirmDialog e o Drawer com a anatomia da referência, a dica e
// o popover com a seta e o gatilho focável, e o aviso em pilha. O que o React emite e o comportamento;
// a medida (recheio 24, título 16, círculo de 40, a dica de 12/16) é do `skin.spec.ts`.
// Provado contra o defeito: na 0.31.0 o X do Dialog era um botão fantasma DENTRO do cabeçalho, não havia
// ícone nem `placement`; o Drawer só tinha esquerda e direita (WEB-06) e nem rodapé; a dica num `<span>`
// não recebia foco (C-11) e não tinha seta nem atraso próprio; o aviso pintava o fundo pelo tipo, sem
// ícone, com um "×" de texto, e não sabia mudar de lugar.
import {useState} from "react";
import {render, screen, waitFor, act, fireEvent, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {vi} from "vitest";
import {AureaProvider, Badge, Button, CloseButton, ConfirmDialog, Dialog, Drawer, Popover, Tooltip, useToast} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode, props: Record<string, unknown> = {}) =>
  render(<AureaProvider {...props}><main>{ui}</main></AureaProvider>);

describe("Dialog — a anatomia da referência", () => {
  test("o X é o CloseButton solto no canto, e é o primeiro focável", async () => {
    wrap(<Dialog open title="Renomear" onClose={() => {}} footer={<Button>Salvar</Button>}><p>Corpo</p></Dialog>);
    const caixa = await screen.findByRole("dialog");
    const x = caixa.querySelector(".dialog-close")!;
    expect(x).toHaveClass("close-button");
    expect(x).toHaveAccessibleName("Close");
    expect(caixa.querySelector("button")).toBe(x);
    // o X não mora mais no cabeçalho
    expect(caixa.querySelector(".dialog-header .close-button")).toBeNull();
    expect(caixa.querySelector(".dialog-heading")!.tagName).toBe("H2");
    expect(caixa.querySelector(".dialog-body")!.textContent).toBe("Corpo");
    expect(caixa.querySelector(".dialog-footer")!.textContent).toBe("Salvar");
  });
  test("ícone num círculo, na cor pedida; sem `icon`, nada", async () => {
    const {rerender} = wrap(<Dialog open title="Convidar" icon="users" iconTone="brand" onClose={() => {}}>x</Dialog>);
    const caixa = await screen.findByRole("dialog");
    const ic = caixa.querySelector(".dialog-header > .dialog-icon")!;
    expect(ic).toHaveClass("dialog-icon-brand");
    expect(ic).toHaveAttribute("aria-hidden", "true");
    expect(ic.querySelector(".icon")).not.toBeNull();
    rerender(<AureaProvider><main><Dialog open title="Convidar" onClose={() => {}}>x</Dialog></main></AureaProvider>);
    expect(document.querySelector(".dialog-icon")).toBeNull();
  });
  test("`placement`: o padrão é `auto` (embaixo no celular, no meio de 640 para cima)", async () => {
    const {rerender} = wrap(<Dialog open title="T" onClose={() => {}}>x</Dialog>);
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-placement", "auto");
    rerender(<AureaProvider><main><Dialog open title="T" placement="top" onClose={() => {}}>x</Dialog></main></AureaProvider>);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-placement", "top");
  });
  test("`dismissible={false}` desliga o X, e ele continua no lugar", async () => {
    wrap(<Dialog open title="Enviando" dismissible={false} onClose={() => {}}>x</Dialog>);
    const x = (await screen.findByRole("dialog")).querySelector(".dialog-close")!;
    expect(x).toBeDisabled();
  });
});

describe("ConfirmDialog — a mesma anatomia, sem o X", () => {
  test("o ícone segue o `destructive` quando a cor não é escolhida", async () => {
    wrap(<ConfirmDialog open title="Apagar?" description="Some para todos." destructive icon="trash" onConfirm={() => {}} onCancel={() => {}} />);
    const caixa = await screen.findByRole("alertdialog");
    expect(caixa.querySelector(".dialog-icon")).toHaveClass("dialog-icon-danger");
    expect(caixa.querySelector(".close-button")).toBeNull();
    expect(caixa.querySelector(".dialog-footer")).not.toBeNull();
  });
});

describe("Drawer — os quatro lados (WEB-06)", () => {
  for (const lado of ["left", "right", "top", "bottom"] as const) {
    test(`${lado}: a classe do lado, o X e o rodapé; a alça só em cima e embaixo`, async () => {
      wrap(<Drawer open side={lado} title="Filtros" onClose={() => {}} footer={<Button>Aplicar</Button>}><p>Corpo</p></Drawer>);
      const caixa = await screen.findByRole("dialog");
      expect(caixa).toHaveClass("drawer", `drawer-${lado}`);
      expect(caixa.querySelector(".dialog-close")).toHaveAccessibleName("Close");
      expect(caixa.querySelector(".dialog-footer")!.textContent).toBe("Aplicar");
      const alca = caixa.querySelector(".drawer-handle");
      if (lado === "top" || lado === "bottom") {
        expect(alca).toHaveAttribute("aria-hidden", "true");
        // a alça fica do lado de DENTRO: em cima da de baixo, embaixo da de cima
        const filhos = [...caixa.children];
        const i = filhos.indexOf(alca!);
        expect(lado === "bottom" ? i < filhos.indexOf(caixa.querySelector(".dialog-header")!) : i === filhos.length - 1).toBe(true);
      } else expect(alca).toBeNull();
    });
  }
  test("o padrão continua a direita", async () => {
    wrap(<Drawer open title="Filtros" onClose={() => {}}>x</Drawer>);
    expect(await screen.findByRole("dialog")).toHaveClass("drawer-right");
  });
});

describe("Tooltip — o gatilho focável (C-11), a seta e o atraso", () => {
  test("num <span> o gatilho vira focável, como botão; num botão nada muda", () => {
    wrap(<>
      <Tooltip content="Dica"><span>texto</span></Tooltip>
      <Tooltip content="Dica"><button type="button">botão</button></Tooltip>
    </>);
    const span = screen.getByText("texto");
    expect(span).toHaveAttribute("tabindex", "0");
    expect(span).toHaveAttribute("role", "button");
    const botao = screen.getByText("botão");
    expect(botao).not.toHaveAttribute("role");
    expect(botao).not.toHaveAttribute("tabindex");
  });
  test("num componente que desenha um <span> (o Badge), o nó ganha o foco depois de montado", () => {
    wrap(<Tooltip content="Dica"><Badge>Beta</Badge></Tooltip>);
    const selo = screen.getByText("Beta").closest(".badge")!;
    expect(selo).toHaveAttribute("tabindex", "0");
    expect(selo).toHaveAttribute("role", "button");
  });
  test("pelo teclado abre na hora, e com `arrow` a seta vem dentro", async () => {
    wrap(<Tooltip content="Apagar o item" arrow><button type="button">x</button></Tooltip>);
    act(() => screen.getByText("x").focus());
    const dica = await screen.findByRole("tooltip");
    expect(dica.querySelector(".overlay-arrow svg")).not.toBeNull();
  });
  test("o mouse espera 1,5 s (o tempo da referência), e não os 0,6 do motor", async () => {
    vi.useFakeTimers();
    try {
      wrap(<Tooltip content="Devagar"><button type="button">alvo</button></Tooltip>);
      const alvo = screen.getByText("alvo");
      fireEvent.pointerEnter(alvo, {pointerType: "mouse"});
      fireEvent.mouseEnter(alvo);
      fireEvent.pointerMove(alvo, {pointerType: "mouse"});
      fireEvent.mouseMove(alvo);
      await act(async () => { vi.advanceTimersByTime(1000); });
      expect(screen.queryByRole("tooltip")).toBeNull();
      await act(async () => { vi.advanceTimersByTime(600); });
      expect(screen.queryByRole("tooltip")).not.toBeNull();
    } finally { vi.useRealTimers(); }
  });
});

describe("Popover — a seta opcional e o título em peso médio", () => {
  test("sem `arrow`, sem seta; com, a seta", async () => {
    const u = userEvent.setup();
    wrap(<>
      <Popover trigger={<button type="button">a</button>} title="Por quê?">Corpo</Popover>
      <Popover trigger={<button type="button">b</button>} arrow>Corpo</Popover>
    </>);
    await u.click(screen.getByText("a"));
    const p1 = await screen.findByText("Por quê?");
    expect(p1).toHaveClass("popover-title");
    expect(p1.closest(".popover")!.querySelector(".overlay-arrow")).toBeNull();
    await u.keyboard("{Escape}");
    await u.click(screen.getByText("b"));
    await waitFor(() => expect(document.querySelector(".popover .overlay-arrow")).not.toBeNull());
  });
});

describe("Toast — a pilha da referência", () => {
  function Gatilho({opts}: {opts: Parameters<ReturnType<typeof useToast>["add"]>[0]}) {
    const t = useToast();
    return <button type="button" onClick={() => t.add(opts)}>mostrar</button>;
  }
  async function mostrar(opts: Parameters<ReturnType<typeof useToast>["add"]>[0], props: Record<string, unknown> = {}) {
    const u = userEvent.setup();
    const r = wrap(<Gatilho opts={opts} />, props);
    await u.click(screen.getByText("mostrar"));
    await waitFor(() => expect(document.querySelector(".toast")).not.toBeNull());
    return r;
  }
  test("o tipo pinta o ícone e o título, não o fundo; cada tipo com o seu ícone", async () => {
    await mostrar({title: "Enviado", description: "Já chegou.", type: "success"});
    const t = document.querySelector(".toast")!;
    expect(t).toHaveClass("toast-success");
    expect(t.querySelector(".toast-indicator use")!.getAttribute("href")).toMatch(/check-circle$/);
    expect(t.querySelector(".toast-title")!.textContent).toBe("Enviado");
    expect(t.querySelector(".toast-description")!.textContent).toBe("Já chegou.");
  });
  test("o `error` do `promise()` do motor é o `danger` da Aurea, e o `loading` gira", async () => {
    await mostrar({title: "Falhou", type: "error"});
    expect(document.querySelector(".toast")).toHaveClass("toast-danger");
    cleanup();
    await mostrar({title: "Enviando…", type: "loading"});
    expect(document.querySelector(".toast-indicator .spinner")).not.toBeNull();
  });
  test("sem tipo, o ícone de informação na cor do texto", async () => {
    await mostrar({title: "Rascunho salvo"});
    const t = document.querySelector(".toast")!;
    expect(t.className).toBe("toast");
    expect(t.querySelector(".toast-indicator use")!.getAttribute("href")).toMatch(/info$/);
  });
  test("`actionProps` vira o botão pequeno terciário", async () => {
    await mostrar({title: "Apagada", actionProps: {children: "Desfazer"}});
    const acao = screen.getByRole("button", {name: "Desfazer"});
    expect(acao).toHaveClass("btn", "btn-tertiary", "btn-sm", "toast-action");
  });
  test("o X tem a MESMA marcação do CloseButton (ele é escrito à mão no system.tsx)", async () => {
    await mostrar({title: "Salvo"});
    const x = document.querySelector(".toast-close")!;
    const {container} = render(<AureaProvider><CloseButton /></AureaProvider>);
    const modelo = container.querySelector(".close-button")!;
    const classes = (el: Element) => [...el.classList].filter(c => c !== "toast-close").sort();
    expect(classes(x)).toEqual(classes(modelo));
    expect(x.innerHTML).toBe(modelo.innerHTML);
  });
  test("`toastPlacement` muda o lugar da pilha; o padrão é embaixo, no meio", async () => {
    await mostrar({title: "a"});
    expect(document.querySelector(".toast-stack")).toHaveClass("toast-stack-bottom");
    cleanup();
    await mostrar({title: "b"}, {toastPlacement: "top-end"});
    expect(document.querySelector(".toast-stack")).toHaveClass("toast-stack-top-end");
  });
});
