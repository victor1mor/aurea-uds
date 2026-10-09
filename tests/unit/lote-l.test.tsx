// Lote L (09/10/2026, ADR-0060) · o que o React da web EMITE para as três peças do site:
//   GAR-07: o `Badge` com as oito cores de categoria (`variant="blue"`…) — a classe que o CSS pinta;
//   GAR-09: o `KPI` com `direction`, `tone` e `directionLabel` — a seta, a cor e a palavra do leitor
//           de tela, e a cor que NUNCA vem sozinha;
//   MNT-04: o `KPI` com `variant="plain"` — sem a caixa.
// A cor e a seta pintadas se medem no navegador (`tests/visual/badge-categoria.spec.ts`).
// Provado contra o defeito: na 0.25.0 o `KPI` ignora as props novas (caem na `<div>` como atributos
// soltos) e o tipo do `Badge` não tem as categorias — os testes abaixo reprovam.
import {render} from "@testing-library/react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";
import {Badge, KPI} from "../../packages/react/src/index";

const CATEGORIAS = ["red", "orange", "green", "teal", "cyan", "blue", "violet", "pink"] as const;

describe("GAR-07 · o selo com cor de categoria", () => {
  test.each(CATEGORIAS)("variant=%s emite a classe da categoria", (cor) => {
    const {container} = render(<Badge variant={cor}>Grupo</Badge>);
    const selo = container.querySelector(".badge")!;
    expect(selo).toHaveClass(`badge-${cor}`);
  });
  test("a categoria combina com as ênfases que já existem", () => {
    const {container} = render(<><Badge variant="teal" emphasis="solid">a</Badge><Badge variant="teal" emphasis="outline">b</Badge></>);
    const [cheio, contorno] = container.querySelectorAll(".badge");
    expect(cheio).toHaveClass("badge-teal", "badge-solid");
    expect(contorno).toHaveClass("badge-teal", "badge-outline");
  });
});

describe("GAR-09 · o KPI sem as props novas continua igual", () => {
  // A marcação da 0.25.0, escrita aqui de propósito: quem já usa não pode ver diferença nenhuma.
  test("a marcação é a de antes, caractere por caractere", () => {
    expect(renderToStaticMarkup(<KPI label="Receita" value="R$ 1" trend="+8%" />))
      .toBe('<div class="card kpi"><span class="muted">Receita</span><strong>R$ 1</strong><small>+8%</small></div>');
    expect(renderToStaticMarkup(<KPI label="Receita" value="R$ 1" />))
      .toBe('<div class="card kpi"><span class="muted">Receita</span><strong>R$ 1</strong></div>');
  });
});

describe("GAR-09 · a direção desenha a seta, pinta e fala", () => {
  test.each([["up", "success", "Up"], ["down", "danger", "Down"], ["flat", "neutral", "No change"]] as const)(
    "direction=%s: seta, tom %s e a palavra %s", (direction, tom, palavra) => {
      const {container} = render(<KPI label="Receita" value="1" trend="x" direction={direction} />);
      const tendencia = container.querySelector(".kpi > small")!;
      expect(tendencia).toHaveClass("kpi-trend", `kpi-trend-${direction}`, `kpi-tone-${tom}`);
      const seta = tendencia.querySelector(".kpi-trend-icon")!;
      expect(seta).toHaveAttribute("aria-hidden", "true");
      expect(tendencia.querySelector(".sr-only")).toHaveTextContent(palavra);
      // A palavra vem ANTES da tendência: o leitor de tela ouve "Up x", como quem vê lê a seta e o texto.
      expect(tendencia.textContent).toBe(`${palavra}x`);
    });
  test("tone inverte a cor quando subir é ruim", () => {
    const {container} = render(<KPI label="Custo" value="1" trend="+12%" direction="up" tone="danger" />);
    expect(container.querySelector(".kpi > small")).toHaveClass("kpi-tone-danger");
    expect(container.querySelector(".kpi > small")).not.toHaveClass("kpi-tone-success");
  });
  test("directionLabel troca a palavra (a língua da página)", () => {
    const {container} = render(<KPI label="Receita" value="1" trend="+8%" direction="up" directionLabel="Alta" />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Alta");
  });
  test("sem direction, tone não pinta nada: a cor nunca vem sozinha", () => {
    const {container} = render(<KPI label="Receita" value="1" trend="+8%" tone="danger" />);
    const tendencia = container.querySelector(".kpi > small")!;
    expect(tendencia.className).toBe("");
    expect(tendencia.querySelector(".kpi-trend-icon")).toBeNull();
  });
  test("com direction e sem trend, a seta e a palavra ainda aparecem", () => {
    const {container} = render(<KPI label="Receita" value="1" direction="up" />);
    expect(container.querySelector(".kpi-trend-icon")).not.toBeNull();
    expect(container.querySelector(".sr-only")).toHaveTextContent("Up");
  });
  test("as props novas não vazam para o HTML como atributos soltos", () => {
    const html = renderToStaticMarkup(<KPI label="a" value="1" direction="up" tone="danger" directionLabel="Alta" variant="plain" />);
    expect(html).not.toMatch(/direction=|tone=|directionlabel=|variant=/i);
  });
});

describe("MNT-04 · o KPI sem a caixa", () => {
  test("variant=plain é a coluna do KPI, sem o .card", () => {
    const {container} = render(<KPI variant="plain" label="Receita" value="1" trend="+8%" />);
    const raiz = container.firstElementChild!;
    expect(raiz).toHaveClass("kpi");
    expect(raiz).not.toHaveClass("card");
  });
  test("o padrão continua sendo o cartão", () => {
    const {container} = render(<KPI label="Receita" value="1" />);
    expect(container.firstElementChild).toHaveClass("card", "kpi");
  });
});
