// Lote U, SITE-06 (18/10/2026) · os arquivos para assistentes de IA que o gerador escreve ao lado das páginas: o `.md`
// de cada página, o `llms.txt`, o `llms-full.txt` e o `aurea-agents.md`; a skill `skills/aurea-uds/SKILL.md`; e o
// `_headers` do site, que dá o tipo e o `charset` a eles. Lê o que a montagem deixou em `apps/catalog` — rode o
// `build-catalog` antes. Provado contra o defeito (18/10/2026): no `main` de antes não há nenhum desses arquivos, e
// todos os casos reprovam.
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, test} from "vitest";
import {CABECALHOS} from "../../scripts/montar-site.mjs";

const raiz = join(__dirname, "../..");
const catalogo = join(raiz, "apps/catalog");
const ler = (f: string) => readFileSync(join(catalogo, f), "utf8");
const SITE = "https://aureauds.dev/";

describe("os arquivos para assistentes de IA", () => {
  test("o llms.txt lista páginas que existem, cada uma como .md ao lado do .html", () => {
    const indice = ler("llms.txt");
    const links = [...indice.matchAll(/\]\((https:\/\/aureauds\.dev\/[^)]+)\)/g)].map((m) => m[1].slice(SITE.length));
    expect(links.length).toBeGreaterThan(400);
    for (const md of links) {
      expect(existsSync(join(catalogo, md)), md).toBe(true);
      expect(existsSync(join(catalogo, md.replace(/\.md$/, ".html"))), md).toBe(true);
    }
    // Os grupos, na ordem da decisão do Victor ("Tudo").
    expect([...indice.matchAll(/^## (.+)$/gm)].map((m) => m[1]))
      .toEqual(["Getting Started", "Components", "Hooks", "Patterns", "Blocks", "Recipes", "Releases"]);
  });

  test("o .md de cada página é o texto do Copy Markdown dela", () => {
    for (const f of ["button.md", "docs-theming.md", "getting-started.md"]) {
      const html = ler(f.replace(/\.md$/, ".html"));
      const json = html.match(/<script type="application\/json" id="page-markdown">([\s\S]*?)<\/script>/)![1];
      expect(ler(f), f).toBe(JSON.parse(json));
    }
  });

  test("o llms-full.txt tem uma página para cada linha do índice", () => {
    const linhas = [...ler("llms.txt").matchAll(/^- \[/gm)].length;
    expect([...ler("llms-full.txt").matchAll(/^<page url="https:\/\/aureauds\.dev\/[^"]+\.html">$/gm)].length).toBe(linhas);
  });

  test("a skill segue o formato Agent Skills, e o aurea-agents.md é o corpo dela", () => {
    const skill = readFileSync(join(raiz, "skills/aurea-uds/SKILL.md"), "utf8");
    const cab = skill.match(/^---\n([\s\S]*?)\n---\n/)![1];
    const campo = (k: string) => cab.match(new RegExp(`^${k}: (.+)$`, "m"))?.[1];
    // name: até 64, minúsculas, números e hífen, sem hífen na ponta nem dois seguidos, igual ao nome da pasta.
    expect(campo("name")).toBe("aurea-uds");
    expect(campo("name")).toMatch(/^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/);
    const descricao = campo("description")!;
    expect(descricao.length).toBeGreaterThan(0);
    expect(descricao.length).toBeLessThanOrEqual(1024);
    expect(ler("aurea-agents.md")).toBe(skill.slice(skill.indexOf("\n---\n", 3) + 5).replace(/^\n+/, ""));
  });

  test("o site entrega .md e .txt com charset utf-8, e o montador os publica", () => {
    expect(CABECALHOS).toContain("/*.md\n  Content-Type: text/markdown; charset=utf-8\n");
    expect(CABECALHOS).toContain("/*.txt\n  Content-Type: text/plain; charset=utf-8\n");
    expect(readFileSync(join(raiz, "scripts/montar-site.mjs"), "utf8")).toContain("/\\.(html|md|txt)$/");
    expect(readdirSync(catalogo).filter((f) => f.endsWith(".txt")).sort()).toEqual(["llms-full.txt", "llms.txt"]);
  });
});
