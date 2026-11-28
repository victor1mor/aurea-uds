// O LOTE 117 (27/11/2026) · o item desativado da busca de comandos — o Victor, olhando a bancada da AUD-1: "Aprovo o
// desativado". O `CommandItem` aceita `disabled`: o item fica à vista com a marca do item desativado de todo menu
// (`data-disabled` e `aria-disabled="true"`, os mesmos atributos do `Combobox`), e nem o clique nem o Enter o executam.
// Provado contra o defeito: sem o `disabled` repassado ao item do motor, o item sai sem as marcas, o clique roda o
// comando e este arquivo reprova. O teclado (a seta e o Enter) está no navegador (`tests/visual/lote117-listas.spec.ts`).
import {render, fireEvent, act} from "@testing-library/react";
import {vi} from "vitest";
import {AureaProvider, CommandPalette} from "../../packages/react/src/index";

const montar = (run: () => void, onClose = () => {}) => render(<AureaProvider><CommandPalette open onClose={onClose} items={[
  {id: "n", label: "New document", run: () => {}},
  {id: "a", label: "Delete", run, disabled: true},
]} /></AureaProvider>);

describe("CommandPalette · o item desativado", () => {
  test("o item leva as marcas do desativado; o outro, não", () => {
    montar(() => {});
    const [novo, apagar] = [...document.querySelectorAll<HTMLElement>(".command-item")];
    expect(apagar).toHaveAttribute("aria-disabled", "true");
    expect(apagar).toHaveAttribute("data-disabled");
    expect(apagar).toHaveClass("menu-item");
    expect(novo).not.toHaveAttribute("aria-disabled");
    expect(novo).not.toHaveAttribute("data-disabled");
  });

  test("o clique não executa o comando nem fecha a janela", async () => {
    const run = vi.fn(), onClose = vi.fn();
    montar(run, onClose);
    const apagar = document.querySelectorAll<HTMLElement>(".command-item")[1];
    await act(async () => { fireEvent.click(apagar); });
    expect(run).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
