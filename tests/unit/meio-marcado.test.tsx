// D-00 (0.64.0): o meio-marcado do Checkbox — o "selecionar todos" com só parte escolhida.
// Provado contra o defeito (10/11/2026): no `main` de antes, o `Checkbox` não tinha a prop (o campo ficava com
// `indeterminate` falso) e o CSS não tinha regra nenhuma para `:indeterminate` — os testes abaixo reprovam os dois.
// A medida no navegador (o fundo do marcado, o tracinho, a linha que não pula) está em
// `tests/visual/meio-marcado.spec.ts`; o jsdom não calcula CSS.
import {describe, it, expect} from "vitest";
import {readFileSync} from "node:fs";
import {createRef} from "react";
import {render, screen} from "@testing-library/react";
import {Checkbox} from "../../packages/react/src/index";

const css = readFileSync("packages/core/src/aurea.css", "utf8");

describe("Checkbox indeterminate", () => {
  it("liga a propriedade do campo — é ela que faz o leitor de tela dizer \"misto\"", () => {
    render(<Checkbox label="Select all" indeterminate />);
    expect((screen.getByRole("checkbox", {name: "Select all"}) as HTMLInputElement).indeterminate).toBe(true);
  });

  it("desliga quando a prop passa a falso, e não liga sem a prop", () => {
    const {rerender} = render(<Checkbox label="Select all" indeterminate />);
    const campo = screen.getByRole("checkbox", {name: "Select all"}) as HTMLInputElement;
    rerender(<Checkbox label="Select all" indeterminate={false} />);
    expect(campo.indeterminate).toBe(false);
    render(<Checkbox label="Plain" />);
    expect((screen.getByRole("checkbox", {name: "Plain"}) as HTMLInputElement).indeterminate).toBe(false);
  });

  it("o ref do app continua chegando ao campo, de objeto e de função, com e sem a prop", () => {
    const objeto = createRef<HTMLInputElement>();
    let pelaFuncao: HTMLInputElement | null = null;
    render(<><Checkbox label="A" indeterminate ref={objeto} /><Checkbox label="B" indeterminate ref={(el) => { pelaFuncao = el; }} />
      <Checkbox label="C" ref={objeto} /></>);
    expect(objeto.current).toBe(screen.getByRole("checkbox", {name: "C"}));
    expect(pelaFuncao).toBe(screen.getByRole("checkbox", {name: "B"}));
  });

  it("vale também na cápsula (variant=\"pill\")", () => {
    render(<Checkbox variant="pill" label="Mark as done" indeterminate />);
    expect((screen.getByRole("checkbox", {name: "Mark as done"}) as HTMLInputElement).indeterminate).toBe(true);
  });
});

describe("o CSS do meio-marcado", () => {
  it("pinta o fundo do marcado também no meio-marcado", () => {
    expect(css).toContain(".checkbox input:is(:checked,:indeterminate) + .control-mark { background:var(--control-selected);");
  });

  it("desenha o tracinho igual ao visto (máscara de 16, traço 2), DEPOIS da regra do visto", () => {
    const visto = css.indexOf(".checkbox input:checked + .control-mark:after {");
    const traco = css.indexOf(".checkbox input:indeterminate + .control-mark:after {");
    expect(visto).toBeGreaterThan(-1);
    expect(traco).toBeGreaterThan(visto);
    const regra = css.slice(traco, css.indexOf("\n", traco));
    expect(regra).toContain("inline-size:100%; block-size:100%;");
    expect(regra).toContain("d='M4 8h8'");
    expect(regra).toContain("stroke-width='2'");
  });

  it("no modo de cores forçadas, o tracinho tem a cor do texto, como o visto", () => {
    expect(css).toContain(".checkbox input:is(:checked,:indeterminate) + .control-mark::after { forced-color-adjust:none; background:CanvasText; }");
  });
});
