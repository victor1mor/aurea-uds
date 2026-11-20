// O 1.0-A (lote 092, 0.76.0): os nomes marcados para sair saem de verdade. Cada teste reprova com o código da 0.75.0,
// onde todos eles ainda existiam; o do `ToolbarButton` prova que o ligado da barra continua.
import {describe, test, expect} from "vitest";
import {readFileSync} from "node:fs";
import {render, screen} from "@testing-library/react";
import {AureaProvider, Button, IconButton, Toolbar, ToolbarButton} from "../../packages/react/src/index";
import {resolverTokens} from "../../packages/native/src/index.js";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const tokensCss = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
const tokensJson = JSON.parse(readFileSync("packages/tokens/src/aurea.tokens.json", "utf8"));

describe("1.0-A · os tokens que saíram", () => {
  for (const nome of ["text-md", "font-editorial", "brand-yellow-foreground", "brand-yellow-text"]) {
    test(`--${nome} não existe no CSS nem na fonte dos tokens`, () => {
      expect(tokensCss).not.toMatch(new RegExp(`--${nome}:`));
      expect(tokensJson.base).not.toHaveProperty(nome);
    });
  }
});

describe("1.0-A · o nativo", () => {
  test("sem textMd e sem o papel editorial", () => {
    const t = resolverTokens("light", "comfortable");
    expect(t.size).not.toHaveProperty("textMd");
    expect(t.font).not.toHaveProperty("editorial");
  });
  test("o pacote de fontes não gera mais o FONT_FAMILIES.editorial", () => {
    const gerado = readFileSync("packages/fonts/dist/fonts.native.js", "utf8");
    const mapa = JSON.parse(/const FONT_FAMILIES = (\{[\s\S]*?\n\});/.exec(gerado)![1]);
    expect(Object.keys(mapa).sort()).toEqual(["code", "heading", "ui"]);
  });
});

describe("1.0-A · o pressed saiu do Button e do IconButton", () => {
  // Quem ainda passa `pressed` (de JavaScript, sem o tipo) não recebe mais o ligado: o botão é o comum.
  const velho = {pressed: true} as Record<string, unknown>;
  test("o Button não anuncia mais aria-pressed", () => {
    wrap(<Button {...velho}>Bold</Button>);
    expect(screen.getByRole("button", {name: "Bold"})).not.toHaveAttribute("aria-pressed");
  });
  test("o IconButton também não", () => {
    wrap(<IconButton icon="star" label="Star" {...velho} />);
    expect(screen.getByRole("button", {name: "Star"})).not.toHaveAttribute("aria-pressed");
  });
  test("o ToolbarButton continua ligando e desligando", () => {
    wrap(<Toolbar label="Format"><ToolbarButton pressed>Bold</ToolbarButton><ToolbarButton pressed={false}>Italic</ToolbarButton></Toolbar>);
    expect(screen.getByRole("button", {name: "Bold", pressed: true})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Italic", pressed: false})).toBeInTheDocument();
  });
});
