// O LOTE 117 (27/11/2026) · o "copiado" do bloco de código fica 2 segundos — o Victor: "Aprovo 2 segundos" (3 de 4
// referências). Era 1,5 s, no `CodeBlock` do React e no `aurea.js` (o HTML puro). O "Link copiado" do `Button share` NÃO
// entrou: continua 1,5 s.
// Provado contra o defeito: com o 1500 de volta em qualquer um dos dois, o "copiado" some antes dos 2 s e este arquivo
// reprova.
import {render, fireEvent, act} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {vi} from "vitest";
import {CodeBlock} from "../../packages/react/src/index";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {value: {writeText: () => Promise.resolve()}, configurable: true});
  vi.useFakeTimers();
});
afterEach(() => { vi.useRealTimers(); });

async function clicarEEsperarACopia(botao: Element) {
  await act(async () => { fireEvent.click(botao); await Promise.resolve(); await Promise.resolve(); });
}

describe("o copiado fica 2 segundos", () => {
  test("no CodeBlock do React", async () => {
    delete (window as unknown as {Aurea?: unknown}).Aurea;
    const {container} = render(<CodeBlock copyable>pnpm add @aurea-uds/react</CodeBlock>);
    const botao = container.querySelector("[data-aurea-copy]")!;
    await clicarEEsperarACopia(botao);
    expect(botao).toHaveClass("is-done");
    await act(async () => { vi.advanceTimersByTime(1900); });
    expect(botao).toHaveClass("is-done");
    await act(async () => { vi.advanceTimersByTime(150); });
    expect(botao).not.toHaveClass("is-done");
  });

  test("no aurea.js (o HTML puro)", async () => {
    new Function(readFileSync("packages/core/src/aurea.js", "utf8"))();
    document.body.innerHTML = '<div data-aurea-copy-scope><button type="button" data-aurea-copy data-aurea-copy-done="Copied">c</button><pre><code>pnpm add</code></pre></div>';
    const botao = document.querySelector("button")!;
    await clicarEEsperarACopia(botao);
    expect(botao).toHaveClass("is-done");
    await act(async () => { vi.advanceTimersByTime(1900); });
    expect(botao).toHaveClass("is-done");
    await act(async () => { vi.advanceTimersByTime(150); });
    expect(botao).not.toHaveClass("is-done");
  });
});
