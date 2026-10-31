// A AUDITORIA DE SEGURANÇA de 31/10/2026 · as duas falhas baixas e o reforço da mesma causa:
//   1. o `CodeBlock`: a língua "constructor" ou "__proto__" achava a função do `Object.prototype` na tabela das línguas,
//      e o realce lançava "p.parse is not a function" no meio da renderização — a tela caía, no servidor e no cliente;
//   2. o `ColorSwatch`: o texto da cor ia cru para a variável do estilo, e no HTML do servidor um ";" abria regras
//      novas (cobrir a tela, buscar imagem de outro endereço);
//   3. a `DataGrid`: um link com `?sort=constructor` ou `f.constructor=x` derrubava o motor da tabela.
// Provado contra o defeito: com o código de antes, o realce LANÇA nas duas línguas, o HTML da amostra sai com
// `position:fixed` e `url(`, e a grade lança nos dois nomes — reprovam os três blocos.
import {render} from "@testing-library/react";
import {renderToString} from "react-dom/server";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {AureaProvider, CodeBlock, ColorSwatch, gridStateFromParams} from "../../packages/react/src/index";
import {highlightCode} from "../../packages/react/src/code-highlight";
import {DataGrid} from "../../packages/react/src/data-grid";

const NOMES_DO_PROTOTIPO = ["constructor", "__proto__", "toString", "hasOwnProperty"];

describe("1 · o CodeBlock com uma língua que é nome do Object.prototype", () => {
  it.each(NOMES_DO_PROTOTIPO)("`highlightCode(…, \"%s\")` devolve null, sem lançar", (lingua) => {
    expect(() => highlightCode("x", lingua)).not.toThrow();
    expect(highlightCode("x", lingua)).toBeNull();
  });
  it("as línguas de verdade continuam coloridas", () => {
    expect(highlightCode("const a = 1", "ts")).not.toBeNull();
    expect(highlightCode("echo oi", "bash")).not.toBeNull();
  });
  it("o `CodeBlock` com `language=\"constructor\"` mostra o texto puro, no servidor e no cliente", () => {
    const ui = <AureaProvider><CodeBlock language="constructor" highlight={highlightCode}>x = 1</CodeBlock></AureaProvider>;
    expect(() => renderToString(ui)).not.toThrow();
    const {container} = render(ui);
    expect(container.textContent).toContain("x = 1");
  });
});

const MALICIOSAS = [
  "red;position:fixed;inset:0;z-index:2147483647;background:url(http://exemplo.invalid/x.png)",
  "url(http://exemplo.invalid/x.png)",
  "red}body{display:none",
  "red/*",
  "image(\"http://exemplo.invalid/x.png\")",
  "rgb(0 0 0) url(http://exemplo.invalid/x.png)",
  "var(--x);color:red",
];
const VALIDAS = ["#f0c200", "#f0c20080", "red", "transparent", "oklch(0.795 0.184 86.047)", "rgb(0 0 0 / 50%)",
  "hsl(210 50% 40%)", "color(display-p3 1 0 0)", "var(--primary)"];

const estiloDe = (html: string) => [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1]).join(" | ");

describe("2 · o ColorSwatch só escreve cor no estilo", () => {
  it.each(MALICIOSAS)("a cor %j não entra no estilo (as duas formas)", (cor) => {
    const simples = estiloDe(renderToString(<ColorSwatch color={cor} />));
    const grupo = estiloDe(renderToString(<ColorSwatch name="c" label="Cor" options={[cor, "#0485f7"]} />));
    for (const estilo of [simples, grupo]) {
      expect(estilo).not.toMatch(/url\(|image\(|position|display|z-index|\/\*|;color/i);
    }
    // A amostra continua lá, com o nome: só a variável não se escreve.
    expect(renderToString(<ColorSwatch color={cor} />)).toContain('role="img"');
  });
  it.each(VALIDAS)("a cor %j, que a ficha promete, continua escrita", (cor) => {
    const {container} = render(<ColorSwatch color={cor} />);
    const el = container.querySelector<HTMLElement>(".color-swatch")!;
    expect(el.style.getPropertyValue("--color-swatch-current")).toBe(cor);
    const grupo = render(<ColorSwatch name="c" label="Cor" options={[cor]} />).container;
    expect(grupo.querySelector<HTMLElement>(".color-swatch-option")!.style.getPropertyValue("--color-swatch-current")).toBe(cor);
  });
});

describe("3 · a DataGrid com um nome do Object.prototype vindo do link", () => {
  const colunas = [{accessorKey: "name", header: "Nome"}];
  const dados = [{name: "b"}, {name: "a"}];
  it.each(NOMES_DO_PROTOTIPO)("o nome %j na ordem e no filtro do link não derruba a grade", (nome) => {
    for (const busca of [`sort=${nome}`, `f.${nome}=x`, `sort=-${nome},name`]) {
      const st = gridStateFromParams(new URLSearchParams(busca));
      const ui = <AureaProvider><DataGrid label="Grade" data={dados} columns={colunas as never} filterable
        sorting={st.sorting} columnFilters={st.columnFilters} /></AureaProvider>;
      expect(() => renderToString(ui), busca).not.toThrow();
    }
  });
  it("a ordem pedida por uma coluna de verdade continua valendo ao lado do nome descartado", () => {
    const st = gridStateFromParams(new URLSearchParams("sort=constructor,name"));
    const {container} = render(<AureaProvider><DataGrid label="Grade" data={dados} columns={colunas as never}
      sorting={st.sorting} /></AureaProvider>);
    const celulas = [...container.querySelectorAll("tbody td")].map((td) => td.textContent);
    expect(celulas).toEqual(["a", "b"]);
  });
  it("uma coluna que se chama mesmo `constructor` continua ordenável", () => {
    const {container} = render(<AureaProvider><DataGrid label="Grade" data={[{constructor: "b"}, {constructor: "a"}] as never}
      columns={[{accessorKey: "constructor", header: "C"}] as never} sorting={[{id: "constructor", desc: false}]} /></AureaProvider>);
    expect([...container.querySelectorAll("tbody td")].map((td) => td.textContent)).toEqual(["a", "b"]);
  });
});
