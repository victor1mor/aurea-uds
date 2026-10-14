// 0.32.0, passo 2 (ações) · `secondary` com a letra da marca e `tertiary` como o padrão; os grupos
// colados que passam o desenho aos botões; o `Toggle` sem a classe `btn-undefined`.
// O que o React emite; a medida (fio, cantos, colado) é do `skin.spec.ts`.
// Provado contra o defeito: na 0.31.0 o `Button` sem `variant` saía `btn-secondary` (e o `secondary`
// era o neutro), o `ButtonGroup` não passava nada aos filhos, e o `Toggle` sem `size` saía com
// `btn-undefined` — os testes abaixo reprovam os três.
import {render} from "@testing-library/react";
import {AureaProvider, Button, ButtonGroup, IconButton, Toggle, ToggleGroup, buttonSkin} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("Button · secondary e tertiary (decisão A do Victor)", () => {
  test("sem `variant`, o botão é o `tertiary` — a cara de sempre", () => {
    const {getByRole} = wrap(<Button>Ok</Button>);
    expect(getByRole("button")).toHaveClass("btn", "btn-tertiary");
    expect(getByRole("button")).not.toHaveClass("btn-secondary");
  });
  test("`secondary` e `tertiary` saem com a classe própria", () => {
    expect(buttonSkin("secondary")).toBe("btn-secondary");
    expect(buttonSkin("tertiary")).toBe("btn-tertiary");
  });
  test("os eixos continuam: neutro cheio é o `tertiary`; trocar o tom do `secondary` dá a célula pedida", () => {
    expect(buttonSkin(undefined, "solid", "neutral")).toBe("btn-tertiary");
    expect(buttonSkin("secondary", undefined, "danger")).toBe("btn-danger");
    expect(buttonSkin("secondary", "outline")).toBe("btn-outline");
  });
});

describe("ButtonGroup · colado, e o desenho vem do grupo", () => {
  test("`variant`, `size` e `disabled` do grupo chegam aos botões; o do botão vence", () => {
    const {getAllByRole} = wrap(
      <ButtonGroup label="Período" variant="secondary" size="sm" disabled>
        <Button>Dia</Button><Button variant="primary">Semana</Button><IconButton icon="plus" label="Mais" />
      </ButtonGroup>);
    const [dia, semana, mais] = getAllByRole("button");
    expect(dia).toHaveClass("btn-secondary", "btn-sm");
    expect(semana).toHaveClass("btn-primary", "btn-sm");
    expect(mais).toHaveClass("btn-secondary", "btn-icon");
    for (const b of [dia, semana, mais]) expect(b).toBeDisabled();
  });
  test("solto, o `IconButton` continua fantasma", () => {
    const {getByRole} = wrap(<IconButton icon="plus" label="Mais" />);
    expect(getByRole("button")).toHaveClass("btn-ghost");
  });
  test("`detached` e `fullWidth` saem como classe", () => {
    const {getByRole} = wrap(<ButtonGroup label="G" detached fullWidth><Button>A</Button></ButtonGroup>);
    expect(getByRole("group")).toHaveClass("btn-group", "btn-group-detached", "btn-group-full");
  });
});

describe("Toggle · sem `btn-undefined`, e o desenho padrão é o de fundo neutro", () => {
  test("sem `size`, nenhuma classe `btn-undefined`", () => {
    const {getByRole} = wrap(<Toggle label="Negrito" icon="text-b" />);
    expect(getByRole("button").className).not.toMatch(/undefined|object/);
  });
  test("no `ToggleGroup`, os três botões também (o caso medido no catálogo)", () => {
    const {getAllByRole} = wrap(
      <ToggleGroup label="Estilo"><Toggle value="b">B</Toggle><Toggle value="i">I</Toggle><Toggle value="u">U</Toggle></ToggleGroup>);
    for (const b of getAllByRole("button")) expect(b.className).not.toMatch(/undefined|object/);
  });
  test("tamanho responsivo vira as classes da camada, e não `btn-[object Object]`", () => {
    const {getByRole} = wrap(<Toggle label="N" icon="text-b" size={{base: "sm", viewport: {md: "lg"}}} />);
    expect(getByRole("button").className).not.toMatch(/object/);
  });
  test("`default` tem fundo neutro (`btn-tertiary`); `ghost`, o de antes", () => {
    const {getAllByRole} = wrap(<><Toggle label="A" icon="text-b" /><Toggle label="B" icon="text-b" variant="ghost" /></>);
    const [a, b] = getAllByRole("button");
    expect(a).toHaveClass("btn-tertiary");
    expect(b).toHaveClass("btn-ghost");
  });
  test("o `size` do `ToggleGroup` chega aos botões; `detached` e `fullWidth` saem como classe", () => {
    const {getAllByRole, getByRole} = wrap(
      <ToggleGroup label="Estilo" size="sm" detached fullWidth><Toggle value="b">B</Toggle></ToggleGroup>);
    expect(getAllByRole("button")[0]).toHaveClass("btn-sm");
    expect(getByRole("group")).toHaveClass("toggle-group", "toggle-group-detached", "toggle-group-full");
  });
});
