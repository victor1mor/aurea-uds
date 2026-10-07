// GAR-02 a GAR-05 (06/10/2026) · a página de SITE: `Container`, `Section` e `Grid.Item` com `span`.
// O que o React emite; o efeito no navegador é medido no `skin.spec.ts` ("página de site") e no
// `tema-na-secao.spec.ts`.
// Provado contra o defeito: sem as peças, nada disto existe para importar; sem o `span`, o item
// não leva classe de coluna.
import {render} from "@testing-library/react";
import {AureaProvider, Container, Grid, Section} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("GAR-02 · Container", () => {
  test("o padrão é o `xl` (1280): só a classe base", () => {
    const {container} = wrap(<Container>x</Container>);
    expect(container.querySelector(".container")!.className).toBe("container");
  });
  test.each(["sm", "md", "lg", "2xl", "full"] as const)("`size=\"%s\"` leva a classe do tamanho", (size) => {
    const {container} = wrap(<Container size={size}>x</Container>);
    expect(container.querySelector(".container")).toHaveClass(`container-${size}`);
  });
});

describe("GAR-04 e GAR-05 · Section", () => {
  test("é um <section>, com o fundo da página e o respiro de site por padrão", () => {
    const {container} = wrap(<Section aria-label="Destaques">x</Section>);
    const s = container.querySelector("section")!;
    expect(s.className).toBe("section");
    expect(s.hasAttribute("data-theme")).toBe(false);
  });
  test("`surface`, `spacing` e `theme` saem como classe e como `data-theme`", () => {
    const {container} = wrap(<Section surface="inset" spacing="sm" theme="dark">x</Section>);
    const s = container.querySelector("section")!;
    expect(s).toHaveClass("section", "section-inset", "section-spacing-sm");
    expect(s.getAttribute("data-theme")).toBe("dark");
  });
});

describe("GAR-03 · Grid.Item span", () => {
  test("valor simples: a classe da coluna", () => {
    const {container} = wrap(<Grid columns={12}><Grid.Item span="7">a</Grid.Item></Grid>);
    expect(container.querySelector(".grid-item")).toHaveClass("grid-span-7");
  });
  test("valor por tela, mobile-first: a base e a do ponto", () => {
    const {container} = wrap(<Grid columns={12}>
      <Grid.Item span={{base: "12", viewport: {md: "7"}}}>a</Grid.Item>
    </Grid>);
    const item = container.querySelector(".grid-item")!;
    expect(item).toHaveClass("grid-span-12", "vp-md:grid-span-7");
  });
  test("sem `span`, nenhuma classe de coluna: uma coluna, como qualquer filho de grade", () => {
    const {container} = wrap(<Grid columns={12}><Grid.Item>a</Grid.Item></Grid>);
    expect(container.querySelector(".grid-item")!.className).toBe("grid-item");
  });
});
