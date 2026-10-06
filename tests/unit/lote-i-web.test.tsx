// Lote I, o lado da WEB (06/10/2026). Os pedidos vieram do nativo (A5 e C9), e a web leva as
// mesmas props com os mesmos nomes — a regra do HeroUI de um nome só nos dois alvos (DOC-11):
//   · `SegmentedControl fullWidth`: ocupa a linha; cada segmento cresce a partir do rótulo
//     (`flex:1 0 auto`) e não encolhe abaixo dele. O padrão não muda;
//   · `Tabs panel="plain"`: o painel sem caixa (a MNT-05, que já pedia isso na web). O padrão
//     continua o cartão `inset`.
// Provado contra o defeito: sem as props novas, os testes do comportamento novo reprovam.
import {readFileSync} from "node:fs";
import {render} from "@testing-library/react";
import {AureaProvider, SegmentedControl, Tabs} from "../../packages/react/src/index";

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const regra = (seletor: string) => {
  const i = css.indexOf(`${seletor} {`);
  expect(i, `regra ${seletor}`).toBeGreaterThan(-1);
  return css.slice(i, css.indexOf("}", i));
};
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const PERIODOS = ["Semana", "Mês", "Ano", "Tudo"].map((l) => ({value: l, label: l}));
const ABAS = [{id: "a", label: "Resumo", content: "corpo"}, {id: "b", label: "Histórico", content: "outro"}];

describe("A5 · `SegmentedControl fullWidth` na web", () => {
  test("o padrão não ganha classe nova", () => {
    const {container} = wrap(<SegmentedControl items={PERIODOS} value="Mês" onChange={() => {}} />);
    expect(container.querySelector(".segmented")).not.toHaveClass("segmented-full");
  });

  test("com a prop, ocupa a linha, e cada segmento cresce a partir do rótulo", () => {
    const {container} = wrap(<SegmentedControl items={PERIODOS} value="Mês" onChange={() => {}} fullWidth />);
    expect(container.querySelector(".segmented")).toHaveClass("segmented-full");
    expect(regra(".segmented-full")).toContain("display:flex");
    // `1 0 auto`, e NÃO `1` (= `1 1 0%`): base zero reparte em partes iguais e quebra o rótulo.
    expect(regra(".segmented-full button")).toContain("flex:1 0 auto");
  });
});

describe("C9 · `Tabs panel` na web (a MNT-05)", () => {
  test("o padrão continua o cartão `inset`", () => {
    const {container} = wrap(<Tabs tabs={ABAS} value="a" onChange={() => {}} />);
    const painel = container.querySelector("[role=tabpanel]");
    expect(painel).toHaveClass("card", "card-inset");
  });

  test("`plain` tira a caixa: nem `card` nem `card-inset`, e o espaço de cima vem do core", () => {
    const {container} = wrap(<Tabs tabs={ABAS} value="a" onChange={() => {}} panel="plain" />);
    const painel = container.querySelector("[role=tabpanel]");
    expect(painel).toHaveClass("tabs-panel");
    expect(painel).not.toHaveClass("card");
    expect(regra(".tabs-root:not([data-orientation=\"vertical\"])>.tabs-panel")).toContain("padding-block-start:var(--space-3)");
  });

  test("sem caixa, o painel continua alcançável pelo teclado", () => {
    const {container} = wrap(<Tabs tabs={ABAS} value="a" onChange={() => {}} panel="plain" />);
    expect(container.querySelector("[role=tabpanel]")?.getAttribute("tabindex")).toBe("0");
  });
});
