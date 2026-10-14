// 0.32.0, passo 8 (texto) · o `tone` do nativo no texto da web (DOC-11) e a caixa de exemplo do site no
// `CodeBlock preview` (DOC-02). A limpeza das fichas (DOC-15) é cobrada pelo check 47 do validador.
// Provado contra o defeito: na 0.31.0 o `tone` caía no DOM como atributo e não pintava, e o `CodeBlock`
// não tinha prévia — a caixa Prévia | Código só existia no CSS do site.
import {render, screen, fireEvent, act} from "@testing-library/react";
import {AureaProvider, CodeBlock, Heading, Paragraph, Text, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode, strings?: typeof ptBR) => render(<AureaProvider strings={strings}>{ui}</AureaProvider>);

describe("tone no texto (DOC-11)", () => {
  test("cada tom vira a classe dele; `muted` é o esmaecido de sempre; `default` não ganha classe", () => {
    const {container} = wrap(<>
      <Text tone="link">a</Text><Text tone="danger">b</Text><Text tone="muted">c</Text><Text tone="default">d</Text>
    </>);
    const [a, b, c, d] = [...container.querySelectorAll(".typography")];
    expect(a).toHaveClass("typography-tone-link");
    expect(b).toHaveClass("typography-tone-danger");
    expect(c).toHaveClass("typography-muted");
    expect(d.className).not.toMatch(/tone|muted/);
    expect(a).not.toHaveAttribute("tone");
  });
  test("o `tone` vence o `color`, e vale também no título e no parágrafo", () => {
    const {container} = wrap(<><Heading level={2} color="muted" tone="success">t</Heading><Paragraph tone="info">p</Paragraph></>);
    const [h, p] = [...container.querySelectorAll(".typography")];
    expect(h).toHaveClass("typography-tone-success");
    expect(h).not.toHaveClass("typography-muted");
    expect(p).toHaveClass("typography-tone-info");
  });
});

describe("CodeBlock preview (DOC-02)", () => {
  test("as abas Prévia | Código, com a prévia à mostra e o código escondido", () => {
    wrap(<CodeBlock language="tsx" preview={<button type="button">Salvar</button>}>{'<Button>Salvar</Button>'}</CodeBlock>, ptBR);
    const abas = screen.getAllByRole("tab");
    expect(abas.map(a => a.textContent)).toEqual(["Prévia", "Código"]);
    expect(abas[0]).toHaveAttribute("aria-selected", "true");
    const paineis = screen.getAllByRole("tabpanel", {hidden: true});
    expect(paineis[0]).not.toHaveAttribute("hidden");
    expect(paineis[1]).toHaveAttribute("hidden");
    expect(paineis[0]).toHaveAttribute("aria-labelledby", abas[0].id);
    expect(screen.getByRole("button", {name: "Salvar"})).toBeTruthy();
    expect(document.querySelector(".code-preview .demo-code .code-block")!.textContent).toBe("<Button>Salvar</Button>");
  });
  test("clique e setas trocam a aba; o foco anda junto", () => {
    wrap(<CodeBlock preview={<span>prévia</span>}>{"x"}</CodeBlock>);
    const [previa, codigo] = screen.getAllByRole("tab");
    fireEvent.click(codigo);
    expect(codigo).toHaveAttribute("aria-selected", "true");
    expect(codigo.tabIndex).toBe(0);
    expect(previa.tabIndex).toBe(-1);
    act(() => codigo.focus());
    fireEvent.keyDown(codigo, {key: "ArrowLeft"});
    expect(previa).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(previa);
    fireEvent.keyDown(previa, {key: "End"});
    expect(document.activeElement).toBe(codigo);
  });
  test("sem `preview`, o bloco de sempre", () => {
    const {container} = wrap(<CodeBlock>{"x"}</CodeBlock>);
    expect(container.querySelector(".code-preview")).toBeNull();
    expect(container.querySelector("pre.code-block")).toBeTruthy();
  });
});
