// 0.32.0, passo 7 (avisos) · o Alert da referência (o `accent` e o X do CloseButton), o Spinner na escala
// dela (padrão 24), o Progress com o rótulo e o valor à mostra e a espessura, e o Skeleton que para.
// O que o React emite; a medida (fundo de cartão, 12/16, título 14/24) é do `skin.spec.ts`.
// Provado contra o defeito: na 0.31.0 o Alert não tinha `accent` e o X era um IconButton fantasma de 32;
// o Spinner nascia no `sm` (16); o Progress só nomeava a barra para o leitor de tela; o Skeleton não parava.
import {render, screen, fireEvent} from "@testing-library/react";
import {vi} from "vitest";
import {Alert, AureaProvider, Banner, Progress, Skeleton, Spinner} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("Alert", () => {
  test("`accent` existe, com o ícone de informação", () => {
    const {container} = wrap(<Alert variant="accent" title="Novidade">Agora dá para exportar.</Alert>);
    const a = container.querySelector(".alert")!;
    expect(a).toHaveClass("alert-accent");
    expect(a).toHaveAttribute("role", "status");
    expect(a.querySelector(":scope > .icon use")!.getAttribute("href")).toMatch(/info-fill$/);
  });
  test("o X de dispensar é o CloseButton, e chama `onDismiss`", () => {
    const fechar = vi.fn();
    const {container} = wrap(<Alert variant="danger" title="Falhou" onDismiss={fechar}>Tente de novo.</Alert>);
    const x = container.querySelector(".alert > .close-button")!;
    expect(x).toHaveAccessibleName("Close");
    fireEvent.click(x);
    expect(fechar).toHaveBeenCalled();
  });
  test("o Banner não ganhou o `accent` (a lista dele fica)", () => {
    // @ts-expect-error — `accent` não é variante do Banner
    const {container} = wrap(<Banner variant="accent">x</Banner>);
    expect(container.querySelector(".banner")).toBeTruthy();
  });
});

describe("Spinner", () => {
  test("o padrão do componente é o `md` (24); `sm` volta ao glifo cru de 16", () => {
    const {container} = wrap(<><Spinner /><Spinner size="sm" /><Spinner size="xl" /></>);
    const [a, b, c] = [...container.querySelectorAll(".spinner")];
    expect(a).toHaveClass("spinner-md");
    expect(b.className).toBe("spinner");
    expect(c).toHaveClass("spinner-xl");
  });
});

describe("Progress", () => {
  test("`showLabel` põe o rótulo à mostra, e o nome continua um só", () => {
    const {container} = wrap(<Progress value={60} label="Envio" showLabel showValue />);
    const rotulo = container.querySelector(".progress-label")!;
    expect(rotulo.textContent).toBe("Envio");
    expect(rotulo).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("progressbar", {name: "Envio"})).toHaveAttribute("aria-valuenow", "60");
    expect(container.querySelector(".progress-detail")!.textContent).toBe("60%");
  });
  test("sem `showLabel`, como sempre: o rótulo só no leitor de tela; com `detail`, o valor não aparece", () => {
    const {container} = wrap(<Progress value={30} label="Cópia" detail="2 min" showValue />);
    expect(container.querySelector(".progress-label")).toBeNull();
    expect([...container.querySelectorAll(".progress-detail")].map(d => d.textContent)).toEqual(["2 min"]);
  });
  test("`size` muda a espessura; o md não ganha classe", () => {
    const {container} = wrap(<><Progress value={10} label="a" size="sm" /><Progress value={10} label="b" /><Progress value={10} label="c" size="lg" /></>);
    const barras = [...container.querySelectorAll(".progress")];
    expect(barras[0]).toHaveClass("progress-sm");
    expect(barras[1].className).toBe("progress");
    expect(barras[2]).toHaveClass("progress-lg");
  });
});

describe("Skeleton", () => {
  test("pulsa por padrão; `animation=\"none\"` para", () => {
    const {container} = wrap(<><Skeleton /><Skeleton animation="none" /></>);
    const [a, b] = [...container.querySelectorAll(".skeleton")];
    expect(a.className).toBe("skeleton");
    expect(b).toHaveClass("skeleton-static");
  });
});
