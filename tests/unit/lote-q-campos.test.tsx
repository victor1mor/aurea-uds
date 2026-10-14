// 0.32.0, passo 3 (campos) · o `Field required`, o `variant="secondary"` dos campos, o `NumberField` em
// grupo, e as três peças novas da referência: `CheckboxGroup`, `ListBox` e `Slider`.
// O que o React emite e o teclado; a medida (12 dos lados, marca de 16, trilho 40 × 20, alça 28 × 20)
// é do `skin.spec.ts`.
// Provado contra o defeito: na 0.31.0 não havia `required` no `Field` nem `variant` nos campos, os
// botões do `NumberField` eram `.btn` soltos, e as três peças não existiam — tudo abaixo reprova.
import {render, fireEvent} from "@testing-library/react";
import {vi} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {AureaProvider, Checkbox, CheckboxGroup, Field, Input, ListBox, NumberField, Slider, Textarea} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("Field required", () => {
  test("o asterisco fica escondido do leitor de tela, e o controle recebe `required`", () => {
    const {container, getByRole} = wrap(<Field label="Nome" required><Input /></Field>);
    const ast = container.querySelector(".label-required")!;
    expect(ast.textContent).toBe("*");
    expect(ast.getAttribute("aria-hidden")).toBe("true");
    expect(getByRole("textbox", {name: "Nome"})).toBeRequired();
  });
  test("sem `required`, nada de asterisco", () => {
    const {container} = wrap(<Field label="Nome"><Input /></Field>);
    expect(container.querySelector(".label-required")).toBeNull();
  });
});

describe("campo `variant=\"secondary\"`", () => {
  test("o Input e o Textarea saem com a classe do fundo neutro", () => {
    const {container} = wrap(<><Input variant="secondary" aria-label="a" /><Textarea variant="secondary" aria-label="b" /><Input aria-label="c" /></>);
    expect(container.querySelector("input[aria-label=a]")).toHaveClass("input", "input-secondary");
    expect(container.querySelector("textarea")).toHaveClass("textarea", "textarea-secondary");
    expect(container.querySelector("input[aria-label=c]")!.className).toBe("input");
  });
});

describe("NumberField em grupo", () => {
  test("os botões são do grupo (e não `.btn` soltos), com os nomes de sempre", () => {
    const {container, getByRole} = wrap(<NumberField label="Quantidade" defaultValue={2} />);
    const menos = getByRole("button", {name: "Decrease"}), mais = getByRole("button", {name: "Increase"});
    expect(menos).toHaveClass("number-field-button", "number-field-decrement");
    expect(mais).toHaveClass("number-field-button", "number-field-increment");
    expect(menos).not.toHaveClass("btn");
    expect(container.querySelector(".number-field-group")!.contains(menos)).toBe(true);
  });
});

describe("CheckboxGroup", () => {
  const grupo = (extra: Record<string, unknown> = {}) => (
    <CheckboxGroup label="Interesses" description="Escolha os que quiser" {...extra}>
      <Checkbox label="Código" value="codigo" />
      <Checkbox label="Desenho" value="desenho" />
    </CheckboxGroup>);
  test("é um grupo com o nome do rótulo, e a descrição o descreve", () => {
    const {getByRole, getByText} = wrap(grupo());
    const g = getByRole("group", {name: "Interesses"});
    expect(g.getAttribute("aria-describedby")).toBe(getByText("Escolha os que quiser").id);
  });
  test("marcar e desmarcar devolve a lista", () => {
    const mudou = vi.fn();
    const {getByRole} = wrap(grupo({defaultValue: ["desenho"], onValueChange: mudou}));
    const codigo = getByRole("checkbox", {name: "Código"}), desenho = getByRole("checkbox", {name: "Desenho"});
    expect(desenho).toBeChecked();
    fireEvent.click(codigo);
    expect(mudou).toHaveBeenLastCalledWith(["desenho", "codigo"]);
    expect(codigo).toBeChecked();
    fireEvent.click(desenho);
    expect(mudou).toHaveBeenLastCalledWith(["codigo"]);
  });
  test("com erro, cada caixa fica inválida e o erro entra na descrição do grupo", () => {
    const {getByRole, getByText} = wrap(grupo({error: "Escolha ao menos um"}));
    for (const c of [getByRole("checkbox", {name: "Código"}), getByRole("checkbox", {name: "Desenho"})])
      expect(c.getAttribute("aria-invalid")).toBe("true");
    expect(getByRole("group").getAttribute("aria-describedby")).toContain(getByText("Escolha ao menos um").id);
  });
  test("`name` e `disabled` chegam a todas as caixas", () => {
    const {getAllByRole} = wrap(grupo({name: "interesses", disabled: true}));
    for (const c of getAllByRole("checkbox")) { expect(c).toHaveAttribute("name", "interesses"); expect(c).toBeDisabled(); }
  });
});

describe("ListBox", () => {
  const ITENS = [
    {id: "a", label: "Abacate"}, {id: "b", label: "Banana", disabled: true},
    {title: "Cítricos", items: [{id: "c", label: "Caju"}, {id: "l", label: "Laranja", description: "da Bahia"}]},
  ];
  test("listbox nomeado, opções, seção como grupo com o título, um ponto de Tab só", () => {
    const {getByRole, getAllByRole} = wrap(<ListBox label="Frutas" items={ITENS} />);
    expect(getByRole("listbox", {name: "Frutas"})).toBeTruthy();
    expect(getByRole("group", {name: "Cítricos"})).toBeTruthy();
    const opcoes = getAllByRole("option");
    expect(opcoes).toHaveLength(4);
    expect(opcoes.filter(o => o.tabIndex === 0)).toHaveLength(1);
    expect(opcoes[1]).toHaveAttribute("aria-disabled", "true");
  });
  test("as setas pulam o desligado; Home e End; a letra pula para o item", () => {
    const {getAllByRole} = wrap(<ListBox label="Frutas" items={ITENS} />);
    const [a, , c, l] = getAllByRole("option");
    a.focus();
    fireEvent.keyDown(a, {key: "ArrowDown"});
    expect(document.activeElement).toBe(c);
    fireEvent.keyDown(c, {key: "End"});
    expect(document.activeElement).toBe(l);
    fireEvent.keyDown(l, {key: "Home"});
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, {key: "l"});
    expect(document.activeElement).toBe(l);
  });
  test("escolha única: Enter escolhe e troca; o escolhido mostra o visto", () => {
    const mudou = vi.fn();
    const {getAllByRole, container} = wrap(<ListBox label="Frutas" items={ITENS} onValueChange={mudou} />);
    const [a, , c] = getAllByRole("option");
    fireEvent.keyDown(a, {key: "Enter"});
    expect(mudou).toHaveBeenLastCalledWith(["a"]);
    fireEvent.click(c);
    expect(mudou).toHaveBeenLastCalledWith(["c"]);
    expect(c).toHaveAttribute("aria-selected", "true");
    expect(a).toHaveAttribute("aria-selected", "false");
    expect(container.querySelectorAll(".list-box-item-indicator")).toHaveLength(1);
  });
  test("vários: Espaço liga e desliga; o desligado não escolhe", () => {
    const mudou = vi.fn();
    const {getAllByRole, getByRole} = wrap(<ListBox label="Frutas" items={ITENS} selectionMode="multiple" onValueChange={mudou} />);
    expect(getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    const [a, b, c] = getAllByRole("option");
    fireEvent.keyDown(a, {key: " "}); fireEvent.keyDown(c, {key: " "});
    expect(mudou).toHaveBeenLastCalledWith(["a", "c"]);
    fireEvent.keyDown(a, {key: " "});
    expect(mudou).toHaveBeenLastCalledWith(["c"]);
    fireEvent.click(b);
    expect(mudou).toHaveBeenCalledTimes(3);
  });
  test("sem escolha: é lista de ações, sem `aria-selected`", () => {
    const acao = vi.fn();
    const {getAllByRole} = wrap(<ListBox label="Ações" items={[{id: "x", label: "Excluir", danger: true}]} selectionMode="none" onAction={acao} />);
    const [x] = getAllByRole("option");
    expect(x).not.toHaveAttribute("aria-selected");
    expect(x).toHaveClass("list-box-item-danger");
    fireEvent.keyDown(x, {key: "Enter"});
    expect(acao).toHaveBeenCalledWith("x");
  });
});

describe("Slider", () => {
  test("a alça e o preenchimento saem VISÍVEIS já no HTML (o alinhamento na borda os esconderia até medir)", () => {
    const {container} = wrap(<Slider label="Volume" defaultValue={40} />);
    expect(container.querySelector<HTMLElement>(".slider-thumb")!.style.visibility).not.toBe("hidden");
    expect(container.querySelector<HTMLElement>(".slider-fill")!.style.visibility).not.toBe("hidden");
  });
  test("uma alça com o papel `slider`, nomeada pelo rótulo, e o valor ao lado", () => {
    const {getByRole, container} = wrap(<Slider label="Volume" defaultValue={40} />);
    const alca = getByRole("slider", {name: "Volume"});
    expect(alca).toHaveAttribute("aria-valuenow", "40");
    expect(container.querySelector(".slider-output")!.textContent).toBe("40");
  });
  test("dois valores: duas alças, cada uma com o próprio nome", () => {
    const {getAllByRole} = wrap(<Slider label="Preço" defaultValue={[20, 80]} thumbLabels={["Mínimo", "Máximo"]} />);
    const alcas = getAllByRole("slider");
    expect(alcas).toHaveLength(2);
    expect(alcas[0]).toHaveAccessibleName("Mínimo");
    expect(alcas[1]).toHaveAccessibleName("Máximo");
  });
  test("a seta muda o valor e avisa com o NÚMERO", () => {
    const mudou = vi.fn();
    const {getByRole} = wrap(<Slider label="Volume" defaultValue={40} onValueChange={mudou} />);
    const alca = getByRole("slider");
    alca.focus();
    fireEvent.keyDown(alca, {key: "ArrowRight"});
    expect(mudou).toHaveBeenLastCalledWith(41);
  });
  test("vertical publica a orientação; `format` escreve o valor", () => {
    const {container} = wrap(<Slider label="Desconto" orientation="vertical" defaultValue={0.25} min={0} max={1} step={0.05} format={{style: "percent"}} locale="pt-BR" />);
    expect(container.querySelector(".slider")).toHaveAttribute("data-orientation", "vertical");
    expect(container.querySelector(".slider-output")!.textContent!.replace(/\s/g, " ")).toBe("25%");
  });
});

// O catálogo é HTML parado: o motor só liga o `<input>` da alça ao rótulo DEPOIS de montar, e o axe da
// varredura acusou as cinco alças sem nome (0.32.0). O id do rótulo agora sai na marcação. E o
// desligado vai para o grupo — sem isso, a letra esmaecida contava como texto de contraste baixo.
describe("Slider na marcação do servidor", () => {
  test("a alça já sai nomeada pelo rótulo, sem montar", () => {
    const html = renderToStaticMarkup(<AureaProvider><Slider label="Volume" defaultValue={40} /></AureaProvider>);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const rotulo = doc.querySelector(".slider-label")!;
    const entrada = doc.querySelector(".slider-thumb input")!;
    expect(rotulo.id).not.toBe("");
    expect(entrada.getAttribute("aria-labelledby")).toBe(rotulo.id);
  });
  test("com nome por alça (`thumbLabels`), vale o nome dela, e não o do rótulo", () => {
    const html = renderToStaticMarkup(<AureaProvider><Slider label="Preço" defaultValue={[20, 80]} thumbLabels={["Mínimo", "Máximo"]} /></AureaProvider>);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const entradas = [...doc.querySelectorAll(".slider-thumb input")];
    expect(entradas.map(e => e.getAttribute("aria-label"))).toEqual(["Mínimo", "Máximo"]);
    expect(entradas.every(e => !e.hasAttribute("aria-labelledby"))).toBe(true);
  });
  test("desligado, o grupo inteiro diz que está desligado", () => {
    const html = renderToStaticMarkup(<AureaProvider><Slider label="Volume" defaultValue={40} disabled /></AureaProvider>);
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.querySelector(".slider")!.getAttribute("aria-disabled")).toBe("true");
    const ligado = renderToStaticMarkup(<AureaProvider><Slider label="Volume" defaultValue={40} /></AureaProvider>);
    expect(new DOMParser().parseFromString(ligado, "text/html").querySelector(".slider")!.hasAttribute("aria-disabled")).toBe(false);
  });
});
