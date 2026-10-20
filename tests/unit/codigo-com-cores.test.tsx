// Lote V (20/10/2026) · as caixas de código com cores e número de linha. O Victor, comparando com a referência: as
// nossas "não são como dos outros, com numero de linhas laterais e cores". A ficha do `CodeBlock` já prometia cores e
// o código desenhava texto puro.
//   - `highlightCode` (`@aurea-uds/react/code-highlight`) colore com o motor do `CodeEditor` (o Lezer), pelas classes
//     `tok-*`; língua desconhecida devolve `null`;
//   - o trecho de JSX solto (várias linhas, uma embaixo da outra) sai certo em toda linha, e não só na primeira;
//   - o `CodeBlock` com `lineNumbers`/`highlight` desenha uma `.code-line` por linha, e o TEXTO continua igual ao código;
//   - sem as duas props, a marcação é a de antes, byte a byte.
// O contraste das cores e o número fora do texto copiado se medem no navegador (`tests/visual/codigo-com-cores.spec.ts`).
// Provado contra o defeito (20/10/2026): sem o embrulho do fragmento, o do JSX solto reprova (medido). No `main` de antes
// o módulo `code-highlight` não existe, e o arquivo nem carrega.
import {render} from "@testing-library/react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";
import {CodeBlock} from "../../packages/react/src/index";
import {highlightCode, highlightLanguages} from "../../packages/react/src/code-highlight";

/** As linhas como texto, com a classe de cada pedaço colorido entre colchetes. */
const marcado = (code: string, lingua: string) =>
  highlightCode(code, lingua)?.map((l) => l.map((p) => (p.className ? `[${p.className}:${p.text}]` : p.text)).join("")) ?? null;

describe("highlightCode", () => {
  test("colore as línguas da Aurea pelas classes tok-*", () => {
    expect(marcado('import {A} from "x"; // c', "tsx")).toEqual(['[tok-keyword:import] {A} [tok-keyword:from] [tok-string:"x"]; [tok-comment:// c]']);
    expect(marcado(".x { padding: 16px; }", "css")).toEqual([".[tok-keyword:x] { [tok-property:padding]: [tok-number:16px]; }"]);
    expect(marcado('<div class="a">oi</div>', "html")).toEqual(['<[tok-keyword:div] [tok-property:class]=[tok-string:"a"]>oi</[tok-keyword:div]>']);
    expect(marcado('{"a": 1}', "json")).toEqual(['{[tok-property:"a"]: [tok-number:1]}']);
    expect(marcado("# instalar\npnpm add x", "bash")).toEqual(["[tok-comment:# instalar]", "pnpm add x"]);
  });
  test("língua desconhecida devolve null, e a lista diz quais existem", () => {
    expect(highlightCode("fn main(){}", "rust")).toBeNull();
    expect(highlightLanguages).toEqual(expect.arrayContaining(["tsx", "ts", "jsx", "js", "css", "html", "json", "bash"]));
  });
  test("o trecho de JSX solto sai certo em TODA linha", () => {
    // Sem o embrulho, o `<` da segunda linha vira "menor que": o `<Button` dali perde a cor e o `</Button>` troca.
    expect(marcado('<Button variant="primary">A</Button>\n<Button variant="ghost">B</Button>', "tsx")).toEqual([
      '<[tok-keyword:Button] [tok-property:variant]=[tok-string:"primary"]>A</[tok-keyword:Button]>',
      '<[tok-keyword:Button] [tok-property:variant]=[tok-string:"ghost"]>B</[tok-keyword:Button]>',
    ]);
  });
  test("o texto devolvido é o código, inteiro e na ordem", () => {
    const code = 'export function B(){\n  return <A x={1}/>;\n}\n';
    const linhas = highlightCode(code, "tsx")!;
    expect(linhas.map((l) => l.map((p) => p.text).join("")).join("\n")).toBe(code);
  });
});

describe("CodeBlock lineNumbers e highlight", () => {
  const code = 'const a = 1;\nconst b = "x";\n';
  test("uma .code-line por linha; o texto do bloco continua igual ao código", () => {
    const {container} = render(<CodeBlock language="ts" lineNumbers highlight={highlightCode}>{code}</CodeBlock>);
    const pre = container.querySelector("pre")!;
    expect(pre.classList.contains("code-block-numbered")).toBe(true);
    expect(pre.classList.contains("code-block-highlighted")).toBe(true);
    expect(pre.querySelectorAll(".code-line")).toHaveLength(2);
    expect(pre.textContent).toBe(code);
    expect(pre.style.getPropertyValue("--code-line-digits")).toBe("1");
    expect(pre.querySelector(".tok-string")?.textContent).toBe('"x"');
  });
  test("só o número, sem cor: as linhas, sem a classe de colorido", () => {
    const {container} = render(<CodeBlock lineNumbers>{"a\nb\nc"}</CodeBlock>);
    const pre = container.querySelector("pre")!;
    expect(pre.querySelectorAll(".code-line")).toHaveLength(3);
    expect(pre.classList.contains("code-block-highlighted")).toBe(false);
    expect(pre.textContent).toBe("a\nb\nc");
  });
  test("a coluna do número cresce com os algarismos (100 linhas → 3)", () => {
    const cem = Array.from({length: 100}, (_, i) => `linha ${i}`).join("\n");
    const {container} = render(<CodeBlock lineNumbers>{cem}</CodeBlock>);
    expect(container.querySelector("pre")!.style.getPropertyValue("--code-line-digits")).toBe("3");
  });
  test("sem as props, a marcação é a de antes, byte a byte", () => {
    expect(renderToStaticMarkup(<CodeBlock language="tsx">{code}</CodeBlock>))
      .toBe(`<pre class="code-block" data-language="tsx" tabindex="0"><code>${code.replace(/"/g, "&quot;")}</code></pre>`);
  });
});
