// O lote 082 (0.71.0), na web — o D3 (aprovado pelo Victor em 19/10/2026, *"Aceito todas as recomendações do plano, de D1
// a D20"*): o `Alert` sem `variant` nem `state` é o neutro, o `default` da referência (o ícone e o título na cor do texto).
// O botão, a gaveta e a confirmação estão nos testes de sempre deles (`lote-q-acoes`, `lote-q-janelas`, `overlays`).
// Provado contra o defeito: com a web da 0.70.0 o aviso sem tom sai `alert-info`, e a regra `.alert-neutral` não existe.
import {render, screen} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, test} from "vitest";
import userEvent from "@testing-library/user-event";
import {Alert, AureaProvider, Button, ConfirmDialog, Dialog} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const CSS = readFileSync(join(process.cwd(), "packages/core/src/aurea.css"), "utf8");

describe("D3 · o Alert sem tom é o neutro", () => {
  test("sem `variant` nem `state`: `alert-neutral`, com o papel de status", () => {
    wrap(<Alert title="Aviso">Corpo</Alert>);
    const aviso = screen.getByRole("status");
    expect(aviso).toHaveClass("alert", "alert-neutral");
    expect(aviso).not.toHaveClass("alert-info");
  });
  test("o `state` continua escolhendo a gravidade, e o `info` pedido continua azul", () => {
    wrap(<><Alert state="waiting_user" data-t="estado" /><Alert variant="info" data-t="info">x</Alert></>);
    expect(document.querySelector("[data-t=estado]")).toHaveClass("alert-info");
    expect(document.querySelector("[data-t=info]")).toHaveClass("alert-info");
  });
  test("o CSS pinta o neutro na cor do texto", () => {
    expect(CSS).toMatch(/\.alert-neutral \{ --alert-tone:var\(--foreground\); \}/);
  });
});

// Achado da suíte do fim: o botão de ligar (`pressed`) sem tom continua o cinza — desligado amarelo seria igual ao ligado.
describe("D3 · o botão de ligar sem tom continua neutro", () => {
  test("`pressed` falso e verdadeiro: `btn-tertiary`; com `variant` pedida, a pedida", () => {
    wrap(<>
      <Button pressed={false} data-t="off">Favorito</Button>
      <Button pressed data-t="on">Favorito</Button>
      <Button pressed variant="primary" data-t="pedida">Favorito</Button>
    </>);
    expect(document.querySelector("[data-t=off]")).toHaveClass("btn-tertiary");
    expect(document.querySelector("[data-t=on]")).toHaveClass("btn-tertiary");
    expect(document.querySelector("[data-t=on]")).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector("[data-t=pedida]")).toHaveClass("btn-primary");
  });
});

// O Esc que a confirmação ignora não pode escapar para a janela de fora: dentro de um `Dialog`, as duas continuam abertas.
describe("D3 · o Esc na confirmação dentro de uma janela", () => {
  test("nem a confirmação nem a janela de fora fecham", async () => {
    const u = userEvent.setup();
    let fechouFora = false, cancelou = false;
    wrap(<Dialog open title="Projeto" onClose={() => { fechouFora = true; }}>
      <ConfirmDialog open title="Apagar?" description="Não volta." onConfirm={() => {}} onCancel={() => { cancelou = true; }} />
    </Dialog>);
    await screen.findByRole("alertdialog");
    await u.keyboard("{Escape}");
    await new Promise((r) => setTimeout(r, 300));
    expect(cancelou).toBe(false);
    expect(fechouFora).toBe(false);
  });
});
