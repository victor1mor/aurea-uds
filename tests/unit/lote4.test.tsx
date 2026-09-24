import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {AureaProvider} from "../../packages/react/src/index";
import {Calendar} from "../../packages/react/src/calendar";

// Lote 4 do BUILDING.md. O comportamento é do motor (react-day-picker) e não se testa de novo
// aqui — o que este arquivo protege são as NOSSAS costuras, que são três: o nome de classe que
// a pele do core espera encontrar, a fusão do `classNames` do consumidor com o nosso, e o grupo
// nomeado que só existe quando faz falta.
//
// Um mês fixo, sempre: `defaultMonth` em agosto de 2026 tira o relógio do teste. Sem isso ele
// passaria hoje e quebraria no dia 1º do mês que vier.
const AGOSTO = new Date(2026, 7, 1);
const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

describe("Calendar", () => {
  test("desenha a grade do mês com a semântica de grade", () => {
    const {container} = wrap(<Calendar mode="single" defaultMonth={AGOSTO} />);
    expect(screen.getByRole("grid", {name: /August 2026/})).toBeInTheDocument();
    expect(container.querySelectorAll('[role="gridcell"]').length).toBeGreaterThanOrEqual(28);
  });

  // A pele do core é escrita contra `.calendar` e contra os `data-*` do motor. Se o nome da raiz
  // sair errado, o check 18 não pega (ele olha o CSS, não o DOM) e o calendário chega cru no
  // consumidor — que é literalmente o achado A13.
  test("a raiz leva a classe que a pele do core procura", () => {
    const {container} = wrap(<Calendar mode="single" defaultMonth={AGOSTO} />);
    expect(container.querySelector(".calendar")).toBeInTheDocument();
    expect(container.querySelector(".calendar-months")).toBeInTheDocument();
    expect(container.querySelector(".calendar-caption")).toHaveTextContent("August 2026");
  });

  test("o className do consumidor SOMA à nossa raiz, não a substitui", () => {
    const {container} = wrap(<Calendar mode="single" defaultMonth={AGOSTO} className="minha" />);
    const raiz = container.querySelector(".calendar")!;
    expect(raiz).toHaveClass("minha");
  });

  test("o classNames do consumidor funde com os nossos, e não apaga a raiz", () => {
    const {container} = wrap(
      <Calendar mode="single" defaultMonth={AGOSTO} classNames={{day: "meu-dia"}} />);
    expect(container.querySelector(".calendar")).toBeInTheDocument();
    expect(container.querySelector(".meu-dia")).toBeInTheDocument();
  });

  // O motor conta com o CSS DELE para esconder o dia das pontas, e nós não importamos o CSS dele.
  // Com `showOutsideDays` (nosso default) não existe dia escondido; sem ele, existe — e a pele
  // do core tem a regra `[data-hidden]` justamente para esse caso.
  test("por padrão a grade vem cheia, sem dia escondido", () => {
    const {container} = wrap(<Calendar mode="single" defaultMonth={AGOSTO} />);
    expect(container.querySelectorAll("[data-hidden]")).toHaveLength(0);
  });

  test("desligando os dias de fora, o motor marca data-hidden — que é o que o core esconde", () => {
    const {container} = wrap(
      <Calendar mode="single" defaultMonth={AGOSTO} showOutsideDays={false} />);
    expect(container.querySelectorAll("[data-hidden]").length).toBeGreaterThan(0);
  });

  test("dia desabilitado é botão desabilitado de verdade, não só apagado", () => {
    const {container} = wrap(
      <Calendar mode="single" defaultMonth={AGOSTO} disabled={{before: new Date(2026, 7, 10)}} />);
    const b = container.querySelector('[data-day="2026-08-05"] button') as HTMLButtonElement;
    expect(b).toBeDisabled();
  });

  test("escolher um dia devolve a data — o repasse de props não quebra o motor", async () => {
    const escolhidas: Date[] = [];
    wrap(<Calendar mode="single" defaultMonth={AGOSTO} onSelect={d => d && escolhidas.push(d)} />);
    await userEvent.click(screen.getByRole("button", {name: /August 12th, 2026/}));
    expect(escolhidas).toHaveLength(1);
    expect(escolhidas[0].getDate()).toBe(12);
  });

  test("sem label não há grupo — dentro de um Popover o gatilho já diz o assunto", () => {
    wrap(<Calendar mode="single" defaultMonth={AGOSTO} />);
    expect(screen.queryByRole("group")).toBeNull();
  });

  test("com label há grupo nomeado — dois calendários lado a lado diriam os dois 'August 2026'", () => {
    wrap(<Calendar mode="single" defaultMonth={AGOSTO} label="Departure date" />);
    expect(screen.getByRole("group", {name: "Departure date"})).toBeInTheDocument();
  });

  test("sem violação de acessibilidade", async () => {
    const {container} = wrap(
      <Calendar mode="range" defaultMonth={AGOSTO} label="Stay"
        selected={{from: new Date(2026, 7, 4), to: new Date(2026, 7, 9)}} />);
    const {violations} = await axe(container);
    expect(violations.map(v => v.id)).toEqual([]);
  });
});
