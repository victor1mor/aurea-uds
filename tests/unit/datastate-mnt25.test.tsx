import {describe, test, expect, vi} from "vitest";
import {useState} from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {DataState, AureaProvider, ptBR} from "../../packages/react/src/index";

// MNT-25 (passo 10, 0.32.0) — a barreira de erro, como VARIAÇÃO do `DataState` (escolha do Victor,
// 12/10/2026: "Escrever na Aurea" e "Variação do DataState"). O app de rede ficou com a tela inteira em
// branco por um erro de desenho; com `catchErrors`, o que quebra dentro do `DataState` vira a cara de erro
// dele, com "Tentar de novo", e o app recebe o erro em `onCatch` para registrar.
function Quebra({quebrar}: {quebrar: boolean}): never | React.ReactElement {
  if (quebrar) throw new Error("o painel leu uma lista nula");
  return <p>Painel de evidência</p>;
}

describe("DataState catchErrors · a barreira de erro", () => {
  test("o que quebra dentro vira a cara de erro, e o resto da tela fica", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    const onCatch = vi.fn();
    render(<AureaProvider strings={ptBR}>
      <h1>Mapa</h1>
      <DataState catchErrors onCatch={onCatch}><Quebra quebrar /></DataState>
    </AureaProvider>);
    expect(screen.getByRole("heading", {name: "Mapa"})).toBeTruthy();
    expect(screen.getByText(ptBR.dataCrashed)).toBeTruthy();
    expect(screen.getByRole("button", {name: ptBR.dataRetry})).toBeTruthy();
    expect(onCatch).toHaveBeenCalledTimes(1);
    expect((onCatch.mock.calls[0][0] as Error).message).toBe("o painel leu uma lista nula");
    silencio.mockRestore();
  });

  test("\"Tentar de novo\" desenha de novo: se o motivo passou, o conteúdo volta", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    function Tela() {
      const [quebrar, setQuebrar] = useState(true);
      return <>
        <button type="button" onClick={() => setQuebrar(false)}>consertar os dados</button>
        <DataState catchErrors><Quebra quebrar={quebrar} /></DataState>
      </>;
    }
    render(<AureaProvider strings={ptBR}><Tela /></AureaProvider>);
    fireEvent.click(screen.getByRole("button", {name: "consertar os dados"}));
    fireEvent.click(screen.getByRole("button", {name: ptBR.dataRetry}));
    expect(screen.getByText("Painel de evidência")).toBeTruthy();
    expect(screen.queryByText(ptBR.dataCrashed)).toBeNull();
    silencio.mockRestore();
  });

  test("a mensagem do app vale também para a quebra; sem catchErrors, o erro sobe como antes", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AureaProvider strings={ptBR}><DataState catchErrors message="Não deu para abrir a evidência."><Quebra quebrar /></DataState></AureaProvider>);
    expect(screen.getByText("Não deu para abrir a evidência.")).toBeTruthy();
    expect(() => render(<AureaProvider strings={ptBR}><DataState><Quebra quebrar /></DataState></AureaProvider>)).toThrow("o painel leu uma lista nula");
    silencio.mockRestore();
  });
});
