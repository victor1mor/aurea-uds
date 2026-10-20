// Lote U, SITE-03 (18/10/2026) · o leitor das páginas da área Getting Started (`scripts/docs-markdown.mjs`).
// O vocabulário é fechado: o que o leitor não conhece tem de DERRUBAR a montagem, com o arquivo e a linha — um leitor
// que engole a marca desconhecida a publica crua na página, e ninguém vê. Cada recusa tem de nomear o arquivo.
import {describe, expect, test} from "vitest";
import {lerDoc, lerLinha, paraTexto} from "../../scripts/docs-markdown.mjs";

const doc = (corpo: string) => `---\ntitle: Theming\ndescription: How the theme works.\n---\n\n${corpo}\n`;

describe("o leitor das páginas de documentação", () => {
  test("lê o cabeçalho, os títulos com âncora, a lista, o código, a tabela e o exemplo vivo", () => {
    const d = lerDoc(doc([
      "Intro with **bold**, `code` and a [link](./tokens.html).",
      "## How it works", "Text.", "### The `data-theme` attribute",
      "- one\n- two", "1. first\n2. second",
      "```tsx\n<Button>Save</Button>\n```",
      "| Token | Use |\n|---|---|\n| `--primary` | accent |",
      "::: demo first-button",
      "## How it works",
    ].join("\n\n")), "x.md");
    expect(d.title).toBe("Theming");
    expect(d.description).toBe("How the theme works.");
    expect(d.blocos.map((b: {tipo: string}) => b.tipo)).toEqual(["p", "h2", "p", "h3", "ul", "ol", "codigo", "tabela", "demo", "h2"]);
    // Âncora sem a crase; título repetido ganha outra âncora, para o índice não levar sempre ao primeiro.
    const titulos = d.blocos.filter((b: {tipo: string}) => b.tipo === "h2" || b.tipo === "h3");
    expect(titulos.map((b: {id: string}) => b.id)).toEqual(["how-it-works", "the-data-theme-attribute", "how-it-works-2"]);
    expect(d.blocos[0].texto).toEqual([{t: "Intro with "}, {strong: "bold"}, {t: ", "}, {code: "code"}, {t: " and a "},
      {link: "link", href: "./tokens.html"}, {t: "."}]);
  });

  test.each([
    ["HTML cru", "<div>oi</div>"],
    ["citação", "> uma citação"],
    ["título de página no corpo", "# Outro título"],
    ["código sem língua", "```\ncodigo\n```"],
    ["diretiva desconhecida", "::: aviso"],
    ["lista dentro de lista", "- um\n  - dentro"],
  ])("recusa %s", (_nome, corpo) => {
    expect(() => lerDoc(doc(corpo), "x.md")).toThrow(/x\.md/);
  });

  test("recusa marca que sobrou no meio da linha", () => {
    expect(() => lerLinha("um **forte sem par", "x.md:3")).toThrow(/x\.md:3/);
    expect(() => lerLinha("um <b>negrito</b>", "x.md:3")).toThrow(/x\.md:3/);
  });

  test("recusa cabeçalho sem descrição ou com chave que o gerador não lê", () => {
    expect(() => lerDoc("---\ntitle: X\n---\n\ntexto", "x.md")).toThrow(/description/);
    expect(() => lerDoc("---\ntitle: X\ndescription: Y\nimage: capa.png\n---\n", "x.md")).toThrow(/image/);
    // O `icon` é lido: é o ícone do item na lateral.
    expect(lerDoc("---\ntitle: X\ndescription: Y\nicon: book\n---\n", "x.md").icon).toBe("book");
  });

  test("o texto para copiar tem o título e a descrição, o código do exemplo, e não tem a diretiva", () => {
    const t = paraTexto(doc("## Use\n\n::: demo first-button\n\n```tsx\n<Button>Save</Button>\n```"));
    expect(t.startsWith("# Theming\n\nHow the theme works.\n\n## Use")).toBe(true);
    expect(t).toContain("<Button>Save</Button>");
    expect(t).not.toContain(":::");
  });
});
