import {readFileSync} from "node:fs";
import {render} from "@testing-library/react";
import {AureaProvider, Badge} from "../../packages/react/src/index";

// R-01, o lado da WEB (24/09/2026). A ficha veio do nativo, mas a medição mostrou que a web tem o
// mesmo comportamento: numa `.stack` o selo estica (300 px numa coluna de 300). A prop é a mesma
// nos dois alvos. Os `expect` do comportamento novo REPROVAVAM antes dele.

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("R-01 · `Badge fit=\"content\"` na web", () => {
  test("o padrão não ganha classe nova", () => {
    const {container} = wrap(<Badge>Em dia</Badge>);
    expect(container.querySelector(".badge")).not.toHaveClass("badge-fit");
  });

  test("`content` marca o selo, e o CSS usa tamanho e não `align-self`", () => {
    const {container} = wrap(<Badge fit="content">Em dia</Badge>);
    expect(container.querySelector(".badge")).toHaveClass("badge-fit");
    const regra = css.slice(css.indexOf(".badge-fit {"), css.indexOf("}", css.indexOf(".badge-fit {")));
    // `align-self` tiraria o selo do meio numa fila; o tamanho definido só desliga o esticar
    expect(regra).toContain("inline-size:fit-content");
    expect(regra).not.toContain("align-self");
  });

  test("ancorado, a prop é ignorada", () => {
    const {container} = wrap(<Badge fit="content" count={3} anchor="top-end"><span>x</span></Badge>);
    expect(container.querySelector(".badge")).not.toHaveClass("badge-fit");
  });
});
