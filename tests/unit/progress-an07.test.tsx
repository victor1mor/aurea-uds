// AN-07 · o `Progress` da web — 03/10/2026. Um consumidor novo mediu: trabalho que ainda está
// contando os arquivos (total desconhecido) aparecia como 0%, como se estivesse parado. E faltavam
// o texto de apoio (velocidade, tempo, bytes) e a cor de pausado e de falha.
//
// Cada teste reprova o código de antes. O de antes, sem `value`, publicava `aria-valuenow="NaN"` e
// pedia um preenchimento de `NaN%`; não tinha onde pôr o apoio nem o tom.
import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {AureaProvider, Progress} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);
async function semViolacao(el: Element) {
  const {violations} = await axe(el);
  if (!violations.length) return;
  throw new Error("axe: " + violations.map(v => v.id + " (" + v.nodes.length + "): " + v.help).join("; "));
}

describe("Progress · sem total, a barra é indeterminada (o `isIndeterminate` do HeroUI)", () => {
  test("não publica `aria-valuenow`, e não pede largura ao preenchimento", async () => {
    const {container} = wrap(<Progress label="Contando arquivos" />);
    const barra = screen.getByRole("progressbar", {name: "Contando arquivos"});
    expect(barra).not.toHaveAttribute("aria-valuenow");
    expect(barra).toHaveClass("progress-indeterminate");
    expect(container.querySelector(".progress > span")!.getAttribute("style")).toBeNull();
    await semViolacao(container);
  });

  test("com total, nada muda: a mesma barra de antes", () => {
    const {container} = wrap(<Progress value={64} label="Enviando" />);
    const barra = screen.getByRole("progressbar");
    expect(barra).toHaveAttribute("aria-valuenow", "64");
    expect(barra).not.toHaveClass("progress-indeterminate");
    expect(barra).not.toHaveAttribute("aria-valuetext");
    expect(container.querySelector(".progress-detail")).toBeNull();
  });
});

describe("Progress · o texto de apoio (o `ProgressBar.Output` do HeroUI)", () => {
  test("aparece acima do trilho, e o leitor de tela o ouve uma vez só, no valor", async () => {
    const {container} = wrap(<Progress value={64} label="Enviando" detail="2,3 MB/s · 12 s" />);
    const apoio = container.querySelector(".progress-detail")!;
    expect(apoio).toHaveTextContent("2,3 MB/s · 12 s");
    // Antes do trilho, na mesma caixa: é a ordem da grade do HeroUI ("output" em cima, "track" embaixo).
    expect(apoio.nextElementSibling).toHaveClass("progress");
    expect(apoio).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "64%, 2,3 MB/s · 12 s");
    await semViolacao(container);
  });

  test("sem total, o apoio é o valor inteiro", () => {
    wrap(<Progress label="Contando" detail="1.204 arquivos" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "1.204 arquivos");
  });

  test("apoio que não é texto fica onde está, para o leitor achar sozinho", () => {
    const {container} = wrap(<Progress value={10} label="Enviando" detail={<a href="#log">ver registro</a>} />);
    expect(container.querySelector(".progress-detail")).not.toHaveAttribute("aria-hidden");
    expect(screen.getByRole("link", {name: "ver registro"})).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuetext");
  });
});

describe("Progress · o tom (o `color` do HeroUI, nos nomes do `ButtonTone`)", () => {
  test.each(["neutral", "success", "warning", "danger", "info"] as const)("%s ganha a classe do tom", (tone) => {
    wrap(<Progress value={50} label="x" tone={tone} />);
    expect(screen.getByRole("progressbar")).toHaveClass(`progress-tone-${tone}`);
  });
  test("o padrão continua o amarelo, sem classe nova", () => {
    wrap(<Progress value={50} label="x" />);
    expect(screen.getByRole("progressbar").className).toBe("progress");
  });
});
