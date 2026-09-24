import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AureaProvider, Field, Select} from "../../packages/react/src/index";

// A-02 e B-08 (24/09/2026). O `Select` era o <select> nativo, e a lista que ele abria era a do
// sistema operacional. Sem outra escolha fechada com a pele da casa, um app pôs listas de cinco
// itens atrás do Combobox, que é sempre um campo de busca. O Victor decidiu: o `Select` passa a ser
// o padrão Aurea. Cada `expect` que cobra a lista da casa REPROVAVA com o <select> nativo.

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
// userEvent e não fireEvent: o motor escolhe o item pelo gesto inteiro do ponteiro, não só pelo `click`.
const user = () => userEvent.setup();
const abrir = async (nome: string, u = user()) => {
  await u.click(screen.getByRole("combobox", {name: nome}));
  return screen.findByRole("listbox");
};
const RESOLUCOES = <>
  <option value="1080">1080p / Blu-ray</option>
  <option value="720">720p HD</option>
  <option value="4k">4K Ultra HD</option>
</>;

describe("A-02 · o Select abre a lista da Aurea, não a do sistema", () => {
  test("o nó não é mais <select>: é o gatilho do motor, com a pele .select", () => {
    const {container} = wrap(<Select aria-label="Resolução">{RESOLUCOES}</Select>);
    expect(container.querySelector("select")).toBeNull();
    const gatilho = screen.getByRole("combobox", {name: "Resolução"});
    expect(gatilho.tagName).toBe("BUTTON");
    expect(gatilho).toHaveClass("select");
  });

  test("a lista usa a pele da casa: painel .menu, item com a coluna do check", async () => {
    wrap(<Select aria-label="Resolução">{RESOLUCOES}</Select>);
    const lista = await abrir("Resolução");
    expect(lista.closest(".menu")).not.toBeNull();
    const opcoes = within(lista).getAllByRole("option");
    expect(opcoes.map(o => o.textContent)).toEqual(["1080p / Blu-ray", "720p HD", "4K Ultra HD"]);
    for (const o of opcoes) {
      expect(o).toHaveClass("menu-item", "combobox-item");
      expect(o.children[0]).toHaveClass("combobox-check");
    }
  });

  test("não há campo de busca: nada para digitar numa lista fechada (B-08)", async () => {
    wrap(<Select aria-label="Resolução">{RESOLUCOES}</Select>);
    const lista = await abrir("Resolução");
    // o único <input> é o do formulário (`name`): escondido, fora do Tab e fora da leitura de tela
    expect(document.querySelector('input:not([aria-hidden="true"])')).toBeNull();
    expect(lista).toBeInTheDocument();
  });
});

describe("A-02 · a forma de escrever de antes continua valendo", () => {
  test("sem value, o primeiro item vem escolhido — como o <select> nativo fazia", () => {
    wrap(<Select aria-label="Resolução">{RESOLUCOES}</Select>);
    expect(screen.getByRole("combobox", {name: "Resolução"})).toHaveTextContent("1080p / Blu-ray");
  });

  test("defaultValue escolhe; onChange entrega e.target.value", async () => {
    const aoMudar = vi.fn();
    wrap(<Select aria-label="Resolução" name="res" defaultValue="720" onChange={aoMudar}>{RESOLUCOES}</Select>);
    expect(screen.getByRole("combobox", {name: "Resolução"})).toHaveTextContent("720p HD");
    const u = user();
    const lista = await abrir("Resolução", u);
    await u.click(within(lista).getByRole("option", {name: "4K Ultra HD"}));
    expect(aoMudar).toHaveBeenCalledWith(expect.objectContaining({target: {value: "4k", name: "res"}}));
    expect(screen.getByRole("combobox", {name: "Resolução"})).toHaveTextContent("4K Ultra HD");
  });

  test("controlado: value manda, onValueChange avisa", async () => {
    const aoMudar = vi.fn();
    wrap(<Select aria-label="Resolução" value="1080" onValueChange={aoMudar}>{RESOLUCOES}</Select>);
    const u = user();
    const lista = await abrir("Resolução", u);
    await u.click(within(lista).getByRole("option", {name: "720p HD"}));
    expect(aoMudar).toHaveBeenCalledWith("720");
  });

  test("<optgroup> vira grupo com título; placeholder aparece sem valor escolhido", async () => {
    wrap(<Select aria-label="Ordem" placeholder="Escolha">
      <optgroup label="Data"><option value="novos">Mais novos</option></optgroup>
      <optgroup label="Nome"><option value="az">Título (A-Z)</option></optgroup>
    </Select>);
    expect(screen.getByRole("combobox", {name: "Ordem"})).toHaveTextContent("Escolha");
    const lista = await abrir("Ordem");
    expect(within(lista).getByText("Data")).toHaveClass("combobox-group-label");
    expect(within(lista).getAllByRole("option")).toHaveLength(2);
  });

  test("items é a forma de montar a lista a partir de dados", async () => {
    wrap(<Select aria-label="Ordem" items={[{value: "a", label: "Mais Recentes"}, {value: "b", label: "Maior Nota"}]} />);
    const lista = await abrir("Ordem");
    expect(within(lista).getAllByRole("option").map(o => o.textContent)).toEqual(["Mais Recentes", "Maior Nota"]);
  });

  test("o Field continua dando o nome ao controle", () => {
    wrap(<Field label="Resolução"><Select>{RESOLUCOES}</Select></Field>);
    expect(screen.getByRole("combobox", {name: /Resolução/})).toBeInTheDocument();
  });
});
