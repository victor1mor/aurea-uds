import {readFileSync} from "node:fs";
import {render, screen, act} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AureaProvider, Button, Card, Cluster, Combobox, Dialog, Grid, MultiCombobox, SearchField,
  Separator, Stack,
} from "../../packages/react/src/index";

// LOTE 2 DOS ACHADOS DOS CONSUMIDORES, primeira leva — as props de layout da web (24/09/2026).
// B-01, A-08, C-01, C-02, C-03, C-04, C-05, C-07, C-13 e B-03. Todas são ACRÉSCIMO: sem a prop
// nova, a classe e o DOM de antes. Cada `expect` do comportamento novo REPROVAVA antes dele.

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const regra = (sel: string) => {
  const i = css.indexOf(sel + " {");
  return i < 0 ? "" : css.slice(i, css.indexOf("}", i));
};
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const el = (id: string) => screen.getByTestId(id);

describe("B-01 · Stack, Cluster e Grid", () => {
  test("sem props, nenhuma classe nova", () => {
    wrap(<><Stack data-testid="s"/><Cluster data-testid="c"/><Grid data-testid="g"/></>);
    expect(el("s").className).toBe("stack");
    expect(el("c").className).toBe("cluster");
    expect(el("g").className).toBe("grid");
    expect(el("g").getAttribute("style")).toBeNull();
  });

  // ADR-0051: três degraus e nenhum outro. `normal` não emite classe, porque é o de sempre.
  test("gap tem três degraus, do --space-*", () => {
    wrap(<><Stack data-testid="s" gap="tight"/><Cluster data-testid="c" gap="loose"/><Grid data-testid="g" gap="normal"/></>);
    expect(el("s")).toHaveClass("stack-gap-tight");
    expect(el("c")).toHaveClass("cluster-gap-loose");
    expect(el("g").className).toBe("grid");
    expect(regra(".stack-gap-tight,.cluster-gap-tight,.grid-gap-tight")).toContain("gap:var(--space-2)");
    expect(regra(".stack-gap-loose,.cluster-gap-loose,.grid-gap-loose")).toContain("gap:var(--space-6)");
  });

  test("Cluster: os nomes do nativo (R-09)", () => {
    wrap(<Cluster data-testid="c" align="baseline" justify="between" wrap={false}/>);
    expect(el("c")).toHaveClass("cluster-align-baseline", "cluster-justify-between", "cluster-nowrap");
    expect(regra(".cluster-justify-between")).toContain("justify-content:space-between");
  });

  test("Stack: align start mantém cada filho na própria largura", () => {
    wrap(<Stack data-testid="s" align="start"/>);
    expect(el("s")).toHaveClass("stack-align-start");
  });

  test("Grid: min vira o --grid-min que o CSS já lia, e columns fixa as colunas", () => {
    wrap(<><Grid data-testid="a" min="155px"/><Grid data-testid="b" columns={3}/></>);
    expect(el("a").style.getPropertyValue("--grid-min")).toBe("155px");
    expect(el("b")).toHaveClass("grid-fixed");
    expect(el("b").style.getPropertyValue("--grid-cols")).toBe("3");
  });
});

describe("C-01 · aria-label no Combobox e no MultiCombobox", () => {
  test("o campo ganha o nome sem rótulo visível", () => {
    wrap(<><Combobox aria-label="Gênero" items={[{value: "a", label: "Ação"}]}/>
      <MultiCombobox aria-label="Diretores" items={[{value: "b", label: "B"}]}/></>);
    expect(screen.getByRole("combobox", {name: "Gênero"})).toBeInTheDocument();
    expect(screen.getByRole("combobox", {name: "Diretores"})).toBeInTheDocument();
    expect(document.querySelector("label.label")).toBeNull();
  });
});

// C-02 NÃO entrou, e a razão foi medida em 24/09/2026: o `.select` já tem `width:100%` no CSS
// (a mesma regra do `.input`), e o gatilho ocupa a largura toda em bloco, em coluna e numa fila —
// 380 de 380 nos três. Uma prop `fullWidth` não mudaria nada, e prop sem efeito é superfície
// pública para manter de graça. O teste abaixo guarda o fato que a matou.
describe("C-02 · o Select já ocupa a largura", () => {
  test("a regra de 100% está no CSS, junto com a do campo", () => {
    expect(css).toMatch(/\.input,\.textarea,\.select \{ width:100%;/);
  });
});

describe("C-03 e C-13 · Button", () => {
  test("grow divide a fila; o CSS deixa o rótulo encolher", () => {
    wrap(<Button grow>Ok</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-grow");
    expect(regra(".btn-grow")).toContain("min-width:0");
  });

  test("com href, target, rel e download chegam ao <a>", () => {
    wrap(<Button href="https://exemplo.dev" target="_blank" rel="noreferrer" download>Abrir</Button>);
    const a = screen.getByRole("link", {name: "Abrir"});
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noreferrer");
    expect(a).toHaveAttribute("download");
  });

  test("sem href, os atributos de link não vão para o <button>", () => {
    wrap(<Button target="_blank" rel="noreferrer">Ok</Button>);
    const b = screen.getByRole("button");
    expect(b).not.toHaveAttribute("target");
    expect(b).not.toHaveAttribute("rel");
  });
});

describe("C-04 · Separator spacing", () => {
  test("sem spacing, nenhuma folga; com ela, os três degraus da ADR-0051", () => {
    const {container} = wrap(<><Separator/><Separator spacing="normal"/><Separator orientation="vertical" spacing="tight"/></>);
    const [a, b, c] = [...container.querySelectorAll("hr")];
    expect(a.className).toBe("separator");
    expect(b).toHaveClass("separator-space-normal");
    expect(c).toHaveClass("separator-vertical", "separator-space-tight");
    expect(regra(".separator-vertical.separator-space-tight")).toContain("margin-inline:var(--space-2)");
  });
});

describe("C-05 · Card padding none", () => {
  test("tira o respiro e recorta a mídia no raio", () => {
    wrap(<Card data-testid="c" padding="none"/>);
    expect(el("c")).toHaveClass("card", "card-flush");
    expect(regra(".card-flush")).toContain("overflow:hidden");
  });
});

describe("B-03 e C-07 · Dialog", () => {
  test("size: o padrão não ganha classe; os degraus são os do Victor", () => {
    wrap(<Dialog open title="Relatório" size="xl" onClose={() => {}}>x</Dialog>);
    expect(screen.getByRole("dialog")).toHaveClass("dialog", "dialog-xl");
    expect(regra(".dialog-xl")).toContain("var(--breakpoint-lg)");
    // as quatro do HeroUI: 20, 24, 28 (o padrão, na própria .dialog) e 32rem
    expect(regra(".dialog-xs")).toContain("min(20rem,");
    expect(regra(".dialog-sm")).toContain("min(24rem,");
    expect(regra(".dialog-lg")).toContain("min(32rem,");
  });

  // ⚠ A mudança que não é acréscimo: o padrão era 560 e passou a 448, por decisão do Victor.
  test("o padrão é o md do HeroUI, 448 — e o ConfirmDialog continua mais estreito", () => {
    expect(css).toMatch(/\.dialog \{ position:fixed;[^}]*width:min\(28rem,/);
    expect(regra(".dialog-confirm")).toContain("min(420px,");
  });

  test("dismissible={false}: Esc não fecha e o X fica desativado", async () => {
    const fechar = vi.fn();
    wrap(<Dialog open title="Apagando" dismissible={false} onClose={fechar}>x</Dialog>);
    await userEvent.keyboard("{Escape}");
    await act(async () => {});
    expect(fechar).not.toHaveBeenCalled();
    expect(screen.getByRole("button", {name: /close|fechar/i})).toBeDisabled();
  });

  test("sem a prop, Esc fecha como sempre", async () => {
    const fechar = vi.fn();
    wrap(<Dialog open title="Normal" onClose={fechar}>x</Dialog>);
    await userEvent.keyboard("{Escape}");
    expect(fechar).toHaveBeenCalled();
  });
});

describe("A-08 · SearchField width", () => {
  test("sem width, 100% como sempre; com width, a medida e sem crescer na fila", () => {
    const {container} = wrap(<><SearchField aria-label="a"/><SearchField aria-label="b" width="20rem"/></>);
    const [a, b] = [...container.querySelectorAll(".input-group")] as HTMLElement[];
    expect(a.getAttribute("style")).toBeNull();
    expect(b.style.inlineSize).toBe("20rem");
    expect(b.style.flex).toMatch(/^none|0 0 auto$/);
  });
});
