// 0.32.0, passo 12 · o `DatePicker` da WEB (ADR-0068; o Victor, 13/10/2026: *"data B"*). O mesmo nome e as
// mesmas props do nativo; o gatilho é o campo, a janela é o `Calendar` num popover; o intervalo é `range`.
// Provado contra o defeito: na 0.31.0 não existe `DatePicker` na web (o import quebra); e as duas regras de
// fechar — a data única no clique, o intervalo no SEGUNDO clique — reprovam se o intervalo fechar no primeiro
// (o motor devolve as duas pontas já no primeiro clique) ou se a data única não fechar.
import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {vi} from "vitest";
import {AureaProvider, Field, ptBR} from "../../packages/react/src/index";
import {DatePicker} from "../../packages/react/src/calendar";
import {ptBR as linguaPtBR} from "react-day-picker/locale";

const wrap = (ui: React.ReactNode, strings?: typeof ptBR) =>
  render(<AureaProvider strings={strings}><main>{ui}</main></AureaProvider>);
const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
const dia = (n: number) => screen.getByRole("dialog").querySelector<HTMLButtonElement>(`td[data-day$="-${String(n).padStart(2, "0")}"] button`)!;

describe("DatePicker (web)", () => {
  test("vazio, o gatilho mostra a frase da língua; com valor, a data no formato pedido", () => {
    const {rerender} = wrap(<DatePicker aria-label="Data" />);
    expect(screen.getByRole("button", {name: "Data"})).toHaveTextContent("Pick a date");
    rerender(<AureaProvider strings={ptBR}><main><DatePicker aria-label="Data" /></main></AureaProvider>);
    expect(screen.getByRole("button", {name: "Data"})).toHaveTextContent("Escolher data");
    rerender(<AureaProvider><main><DatePicker aria-label="Data" value={new Date(2026, 9, 13)} format={fmt} /></main></AureaProvider>);
    expect(screen.getByRole("button", {name: "Data"})).toHaveTextContent("13/10/2026");
    expect(screen.getByRole("button", {name: "Data"})).toHaveClass("select", "select-trigger", "date-picker-trigger");
  });

  // O padrão não lê a língua do ambiente: o servidor (Node em pt-BR) e o navegador (en-US) escreviam textos
  // diferentes, e o React jogava a hidratação fora (erro 418, medido no catálogo em 13/10/2026). O dublê faz a
  // máquina "falar português" quando ninguém diz a língua — o defeito antigo reprova aqui em qualquer máquina.
  test("o formato padrão é fixo (en-US), e não a língua do ambiente", () => {
    const original = Date.prototype.toLocaleDateString;
    const dubl = vi.spyOn(Date.prototype, "toLocaleDateString").mockImplementation(function (this: Date, l, o) {
      return original.call(this, l ?? "pt-BR", o);
    });
    try {
      wrap(<DatePicker aria-label="Data" value={new Date(2026, 7, 12)} />);
      expect(screen.getByRole("button", {name: "Data"})).toHaveTextContent("Aug 12, 2026");
    } finally {
      dubl.mockRestore();
    }
  });

  // `locale` é o objeto do motor (`react-day-picker/locale`), o mesmo do `Calendar`: o campo e o calendário
  // mudam de língua JUNTOS. Provado nos dois sentidos: sem passar ao calendário, o mês sai "August"; sem usar no
  // texto, o campo sai "Aug 12, 2026".
  test("locale muda a língua do campo e do calendário juntos", async () => {
    wrap(<DatePicker aria-label="Data" locale={linguaPtBR} defaultValue={new Date(2026, 7, 12)} />);
    const gatilho = screen.getByRole("button", {name: "Data"});
    expect(gatilho).toHaveTextContent(new Date(2026, 7, 12).toLocaleDateString("pt-BR", {day: "numeric", month: "short", year: "numeric"}));
    expect(gatilho).not.toHaveTextContent("Aug");
    expect(gatilho.querySelector(".select-value")).toHaveAttribute("lang", "pt-BR");
    await userEvent.click(gatilho);
    expect(within(screen.getByRole("dialog")).getByRole("grid", {name: /agosto/i})).toBeInTheDocument();
  });

  test("o clique abre o calendário; escolher o dia avisa, mostra e FECHA", async () => {
    const onChange = vi.fn();
    wrap(<DatePicker aria-label="Data" defaultValue={new Date(2026, 9, 1)} format={fmt} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", {name: "Data"}));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(dia(15));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(fmt(onChange.mock.calls[0][0])).toBe("15/10/2026");
    expect(screen.getByRole("button", {name: "Data"})).toHaveTextContent("15/10/2026");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // O intervalo já escolhido (1 a 3) NÃO se estende: cada abertura começa um novo. Pelo motor, clicar 15 e 9
  // daria 1 a 15 — o defeito que a primeira versão tinha.
  test("range: cada abertura começa um intervalo novo; o 1º clique não fecha, o 2º fecha, em qualquer ordem", async () => {
    const onChange = vi.fn();
    wrap(<DatePicker range aria-label="Período" defaultValue={{from: new Date(2026, 9, 1), to: new Date(2026, 9, 3)}} format={fmt} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", {name: "Período"}));
    await userEvent.click(dia(15));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(dia(9));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", {name: "Período"})).toHaveTextContent("9/10/2026 – 15/10/2026");
  });

  test("o formulário recebe a data LOCAL (aaaa-mm-dd), e o intervalo da ISO 8601", () => {
    const {container} = wrap(<>
      <DatePicker name="dia" aria-label="Dia" defaultValue={new Date(2026, 9, 13, 23, 30)} />
      <DatePicker range name="periodo" aria-label="Período" defaultValue={{from: new Date(2026, 9, 5), to: new Date(2026, 9, 9)}} />
    </>);
    expect(container.querySelector<HTMLInputElement>('input[name="dia"]')!.value).toBe("2026-10-13");
    expect(container.querySelector<HTMLInputElement>('input[name="periodo"]')!.value).toBe("2026-10-05/2026-10-09");
  });

  test("minimumDate e maximumDate desligam os dias de fora", async () => {
    wrap(<DatePicker aria-label="Data" defaultValue={new Date(2026, 9, 10)} minimumDate={new Date(2026, 9, 8)} maximumDate={new Date(2026, 9, 20)} />);
    await userEvent.click(screen.getByRole("button", {name: "Data"}));
    expect(dia(7)).toBeDisabled();
    expect(dia(8)).not.toBeDisabled();
    expect(dia(21)).toBeDisabled();
  });

  // O `Field` só pendura `<label for>` nos controles da lista dele; o `DatePicker` mora fora do pacote principal
  // e se registra. Sem o registro o Field vira GRUPO e o gatilho fica com o texto da data como nome.
  test("dentro de um Field, o gatilho leva o nome do rótulo", () => {
    wrap(<Field label="Check-in"><DatePicker defaultValue={new Date(2026, 9, 13)} /></Field>);
    expect(screen.getByRole("button", {name: "Check-in"})).toHaveClass("date-picker-trigger");
  });

  // A janela APONTA para o rótulo do campo (`aria-labelledby`), como a biblioteca de acessibilidade do mercado.
  // Medido no navegador em 13/10/2026: dentro do `Field` ela saía "Pick a date" — o `<label>` do Field não
  // tinha `id`. O asterisco do obrigatório (`aria-hidden`) não entra no nome.
  test("dentro de um Field, a janela do calendário aponta para o rótulo, e o nome sai sem o asterisco", async () => {
    const {container} = wrap(<Field label="Check-in" required><DatePicker defaultValue={new Date(2026, 9, 13)} /></Field>);
    const rotulo = container.querySelector("label")!;
    expect(rotulo.id).not.toBe("");
    await userEvent.click(screen.getByRole("button", {name: "Check-in"}));
    const janela = screen.getByRole("dialog", {name: "Check-in"});
    expect(janela).toHaveAttribute("aria-labelledby", rotulo.id);
    expect(janela).not.toHaveAttribute("aria-label");
  });

  test("desligado não abre; e sem violação de acessibilidade, fechado e aberto", async () => {
    const {container, rerender} = wrap(<DatePicker aria-label="Data" disabled />);
    expect(screen.getByRole("button", {name: "Data"})).toBeDisabled();
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
    rerender(<AureaProvider><main><DatePicker aria-label="Data" /></main></AureaProvider>);
    await userEvent.click(screen.getByRole("button", {name: "Data"}));
    expect(within(screen.getByRole("dialog")).getAllByRole("grid").length).toBeGreaterThan(0);
    expect((await axe(document.body)).violations.map((v) => v.id)).toEqual([]);
  });
});
