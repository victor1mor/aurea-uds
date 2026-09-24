import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {beforeAll} from "vitest";
import {LineChart, Line, XAxis} from "recharts";
import {AureaProvider} from "../../packages/react/src/index";
import {Chart, ChartTooltip, ChartLegend} from "../../packages/react/src/chart";

// Lote 3 do BUILDING.md. O que este arquivo protege é a APOSTA do desenho: as três peças são só
// pele, e para isso o Recharts precisa reconhecer um componente NOSSO como filho do gráfico.
// No Recharts 2 ele não reconhecia — era por isso que o shadcn tinha de reexportar o primitivo
// e pôr a pele no `content`, virando duas peças por peça. Medido no 3.10.1 (01/08/2026): passa
// a reconhecer. Se uma versão futura voltar atrás, o tooltip e a legenda somem sem erro nenhum,
// e é este arquivo que grita.

// O ResponsiveContainer mede o pai com ResizeObserver, que o jsdom não tem — sem isso ele fica
// 0×0 e o Recharts não desenha NADA (medido: 153 bytes, sem <svg>). O stub é de teste, não de
// produção: no navegador o ResizeObserver é nativo desde 2020.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    constructor(private cb: ResizeObserverCallback) {}
    observe(el: Element) {
      this.cb([{contentRect: {width: 640, height: 220}, target: el} as ResizeObserverEntry], this);
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const DADOS = [{m: "Jan", runs: 12, errors: 2}, {m: "Feb", runs: 30, errors: 5}];
const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

const grafico = (extra?: React.ReactNode) =>
  <LineChart data={DADOS}>
    <XAxis dataKey="m" />
    <Line dataKey="runs" name="Runs" stroke="var(--chart-2)" />
    <Line dataKey="errors" name="Errors" stroke="var(--chart-4)" />
    {extra}
  </LineChart>;

describe("Chart", () => {
  test("desenha de verdade — a caixa dá ao motor o pai com altura que ele exige", () => {
    const {container} = wrap(<Chart label="Monthly runs">{grafico()}</Chart>);
    expect(container.querySelector(".chart svg")).toBeInTheDocument();
    // duas séries, duas curvas: se o motor não recebeu tamanho, não há nenhuma.
    expect(container.querySelectorAll("path.recharts-line-curve")).toHaveLength(2);
  });

  test("o conjunto tem nome — o <svg> interno é role=application e sem nome à volta não se sabe o que se está lendo", () => {
    wrap(<Chart label="Monthly runs">{grafico()}</Chart>);
    expect(screen.getByRole("group", {name: "Monthly runs"})).toBeInTheDocument();
  });

  test("sem label, o nome vem do provider — nunca fica anônimo", () => {
    wrap(<Chart>{grafico()}</Chart>);
    expect(screen.getByRole("group", {name: "Chart"})).toBeInTheDocument();
  });

  // O <svg> do motor é role="application" com tabindex=0 e <title> VAZIO: quem chega nele pelo
  // Tab ouviria "application" e mais nada. O nome do grupo não cobre isso — é outro elemento.
  test("o desenho focável também recebe o nome, não só a caixa", () => {
    const {container} = wrap(<Chart label="Monthly runs">{grafico()}</Chart>);
    expect(container.querySelector(".chart svg title")).toHaveTextContent("Monthly runs");
  });

  test("título que o consumidor escreveu vence o nosso", () => {
    const {container} = wrap(<Chart label="Monthly runs">
      <LineChart data={DADOS} title="Runs, by month, since January">
        <Line dataKey="runs" name="Runs" />
      </LineChart>
    </Chart>);
    expect(container.querySelector(".chart svg title"))
      .toHaveTextContent("Runs, by month, since January");
  });

  // `region` é MARCO de página. Três gráficos numa tela virariam três landmarks disputando a
  // lista de marcos do leitor — o DataGrid pode ser region porque é a área rolável dele; um
  // gráfico não é. (A busca é pelo elemento, não por queryByRole: o próprio AureaProvider já
  // publica um region legítimo, a pilha de toasts.)
  test("não é marco de página: gráfico é group, não region", () => {
    const {container} = wrap(<Chart label="Monthly runs">{grafico()}</Chart>);
    expect(container.querySelector(".chart")).toHaveAttribute("role", "group");
  });
});

describe("ChartTooltip", () => {
  // `defaultIndex` fixa o ponto ativo sem simular ponteiro — é o que torna o tooltip
  // observável num teste de unidade.
  const comTooltip = () => wrap(<Chart label="Monthly runs">
    {grafico(<ChartTooltip defaultIndex={1} />)}
  </Chart>);

  test("um componente NOSSO como filho é reconhecido pelo motor", () => {
    const {container} = comTooltip();
    expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
  });

  test("mostra o rótulo do ponto e uma linha por série, com nome e valor", () => {
    const {container} = comTooltip();
    const t = container.querySelector(".chart-tooltip")!;
    expect(t.querySelector("strong")).toHaveTextContent("Feb");
    const linhas = t.querySelectorAll(".chart-key");
    expect(linhas).toHaveLength(2);
    expect(linhas[0]).toHaveTextContent("Runs");
    expect(linhas[0]).toHaveTextContent("30");
    expect(linhas[1]).toHaveTextContent("Errors");
  });

  test("a cor do quadradinho é a da SÉRIE — é dado, não decoração", () => {
    const {container} = comTooltip();
    const swatch = container.querySelector(".chart-tooltip .chart-key i") as HTMLElement;
    expect(swatch.style.background).toContain("--chart-2");
  });

  test("veste a superfície de tooltip da Aurea, não a caixa branca do motor", () => {
    const {container} = comTooltip();
    expect(container.querySelector(".chart-tooltip")).toHaveClass("tooltip");
  });
});

describe("ChartLegend", () => {
  test("uma entrada por série, com o nome legível", () => {
    const {container} = wrap(<Chart label="Monthly runs">
      {grafico(<ChartLegend />)}
    </Chart>);
    const itens = [...container.querySelectorAll(".chart-legend .chart-key")];
    expect(itens).toHaveLength(2);
    // sem ordem, de propósito: a ordem é do motor e tem teste próprio logo abaixo.
    expect(itens.map(e => e.textContent).sort()).toEqual(["Errors", "Runs"]);
  });

  // DEFEITO DO MOTOR, medido em 01/08/2026 e fixado aqui para não passar despercebido: o
  // Recharts 3.10.1 ordena o payload da legenda por `dataKey` em ORDEM ALFABÉTICA, não na
  // ordem em que as séries foram declaradas — declarar zulu, alpha, mike e declarar mike,
  // zulu, alpha dão os dois "Alpha, Mike, Zulu". Num gráfico empilhado a legenda deixa de
  // acompanhar a pilha, e o leitor casa cor com nome no olho.
  // Não dá para corrigir daqui: a legenda recebe o payload pronto e não alcança os filhos do
  // gráfico. A saída é do consumidor — `<ChartLegend payload={[…]}>` passa direto pelo spread.
  // Este teste existe para AVISAR: se o motor consertar, ele reprova e a expectativa vira a
  // ordem de declaração.
  test("a ordem da legenda é do motor, e hoje ela é alfabética por dataKey", () => {
    const {container} = wrap(<Chart label="Order">
      <LineChart data={[{zulu: 1, alpha: 2}, {zulu: 3, alpha: 4}]}>
        <Line dataKey="zulu" name="Zulu" />
        <Line dataKey="alpha" name="Alpha" />
        <ChartLegend />
      </LineChart>
    </Chart>);
    const nomes = [...container.querySelectorAll(".chart-legend .chart-key")].map(e => e.textContent);
    expect(nomes).toEqual(["Alpha", "Zulu"]);
  });

  test("sem violação de acessibilidade nas três peças juntas", async () => {
    const {container} = wrap(<Chart label="Monthly runs">
      {grafico(<><ChartTooltip defaultIndex={0} /><ChartLegend /></>)}
    </Chart>);
    const {violations} = await axe(container);
    expect(violations.map(v => v.id)).toEqual([]);
  });
});
