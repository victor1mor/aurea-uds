import {readFileSync} from "node:fs";
import {render, screen} from "@testing-library/react";
import {AureaProvider, BottomNav} from "../../packages/react/src/index";

// R-08, o lado da WEB (24/09/2026). A ficha veio do app nativo — *"ficou super largo"* —, mas a web
// tinha a mesma pílula de borda a borda (`aurea.css`, `.bottom-nav` com `margin` e as abas com
// `flex:1`). O Victor decidiu a prop nas duas. Cada `expect` do comportamento novo REPROVAVA antes.

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const regra = (seletor: string) => {
  const i = css.indexOf(seletor + " {");
  if (i < 0) return "";
  return css.slice(i, css.indexOf("}", i));
};
const ITENS = [
  {id: "inicio", label: "Início", icon: "home", href: "#inicio"},
  {id: "perfil", label: "Perfil", icon: "user", href: "#perfil"},
];
const nav = () => screen.getByRole("navigation");
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("R-08 · `width=\"content\"` no `BottomNav` da web", () => {
  test("o padrão continua de borda a borda", () => {
    wrap(<BottomNav items={ITENS} current="inicio" />);
    expect(nav()).not.toHaveClass("bottom-nav-content");
  });

  test("`content` marca a barra, e o CSS a põe do tamanho das abas, no centro", () => {
    wrap(<BottomNav width="content" items={ITENS} current="inicio" />);
    expect(nav()).toHaveClass("bottom-nav", "bottom-nav-content");
    const barra = regra(".bottom-nav-content:not(.bottom-nav-edge)");
    expect(barra).toContain("inline-size:fit-content");
    expect(barra).toContain("margin-inline:auto");
    // nunca encosta na borda: a mesma margem da pílula cheia continua como limite
    expect(barra).toContain("max-inline-size:calc(100% - 2 * var(--space-4))");
    const aba = regra(".bottom-nav-content:not(.bottom-nav-edge) .bottom-nav-item");
    expect(aba).toContain("flex:0 1 auto");
    expect(aba).toContain("min-width:var(--control-h-lg)");
    expect(aba).toContain("padding-inline:var(--space-3)");
  });

  // A `edge` encosta na borda. Largura pelo conteúdo ali deixaria um pedaço de barra solto no meio.
  // E o nome LEGADO `flat` é `edge` por baixo — o teste cobra os dois caminhos até ela.
  test("na `edge`, e no legado `flat`, a largura é ignorada", () => {
    const {unmount} = wrap(<BottomNav variant="edge" width="content" items={ITENS} current="inicio" />);
    expect(nav()).not.toHaveClass("bottom-nav-content");
    unmount();
    wrap(<BottomNav variant="flat" width="content" items={ITENS} current="inicio" />);
    expect(nav()).toHaveClass("bottom-nav-edge");
    expect(nav()).not.toHaveClass("bottom-nav-content");
  });

  test("a margem da folga do sistema continua valendo com `content`", () => {
    // `margin-inline:auto` só mexe nos LADOS: o `margin-bottom` com o `env()` da `.bottom-nav`
    // não pode ser sobrescrito por esta regra.
    expect(regra(".bottom-nav-content:not(.bottom-nav-edge)")).not.toMatch(/margin(-block|-bottom)?:/);
  });
});
