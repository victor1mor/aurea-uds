// O catálogo fiel (bloco 1, 23/10/2026) · a trava `scripts/catalogo-fiel.mjs`, a página `saude.html` e o script das
// rodadas da saúde (`scripts/saude-rodadas.mjs`).
//
// Provado contra o defeito (23/10/2026): na 0.42.0, antes dos exemplos novos, a trava media 450 valores sem exemplo e
// reprovava; o teste "num catálogo de mentira" monta uma árvore mínima com UM valor sem exemplo e cobra que a trava o
// nomeie — e que pare de reclamar quando o exemplo chega. Os casos do `aparece` cobrem as formas que o código dos
// exemplos usa (`prop="v"`, `prop={v}`, `prop: "v"`) e as que não podem contar (o valor solto, a prop de outro nome).
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {afterAll, describe, expect, test} from "vitest";
import {APELIDOS, aparece, ehConstante, exportadosDoNativo, medirCatalogo, medirNativo, MODELO_DA_RODADA} from "../../scripts/catalogo-fiel.mjs";
import {emBrasilia, palavra, preencher} from "../../scripts/saude-rodadas.mjs";

const raiz = join(__dirname, "../..");

describe("aparece — o valor está no código como o consumidor o escreve", () => {
  test("as formas que contam", () => {
    expect(aparece('<Badge tone="red">', "tone", "red")).toBe(true);
    expect(aparece("<Heading level={2}>", "level", "2")).toBe(true);
    expect(aparece('<Dialog size={"lg"}>', "size", "lg")).toBe(true);
    expect(aparece('{tone: "red"}', "tone", "red")).toBe(true);
    expect(aparece("<Button fullWidth>", "fullWidth", true)).toBe(true);
  });
  test("as que não contam", () => {
    expect(aparece("<Badge>red</Badge>", "tone", "red")).toBe(false);
    expect(aparece('<Badge variant="redder">', "variant", "red")).toBe(false);
    expect(aparece('<Badge atone="red">', "tone", "red")).toBe(false);
    expect(aparece('<Badge tone="red">', "tone", "blue")).toBe(false);
  });
});

describe("a trava no catálogo de verdade", () => {
  // lê o catálogo inteiro (as fichas, os exemplos e o pacote montado): com a máquina ocupada, passa de um minuto
  test("todo nome exportado tem página e todo valor de variação tem exemplo", async () => {
    const r = await medirCatalogo(raiz);
    expect(r.erros).toEqual([]);
    expect(r.web.semPagina).toEqual([]);
    expect(r.web.faltam).toEqual({});
    expect(r.web.valores).toBeGreaterThan(800);
    expect(r.web.naPagina + r.web.porPadrao + r.web.emPadrao).toBe(r.web.valores);
  }, 240_000);
  test("os apelidos continuam dizendo, na ficha, de quem são", () => {
    for (const [apelido, dono] of Object.entries(APELIDOS)) {
      const ficha = JSON.parse(readFileSync(join(raiz, `packages/contracts/registry/${apelido}.json`), "utf8"));
      expect(ficha.summary, apelido).toMatch(new RegExp(`\\b${dono}\\b`));
    }
  });
  test("a página de saúde mostra os números e deixa a linha-modelo para a publicação", () => {
    const html = readFileSync(join(raiz, "apps/catalog/saude.html"), "utf8");
    expect(html).toContain("The catalogue is complete");
    expect(html).toContain("The last 30 checks");
    expect(html).toContain('data-modelo=""');
    expect(html).toContain(MODELO_DA_RODADA.data);
    expect(html).not.toContain("FAILED");
  });
});

describe("a trava num catálogo de mentira, com um valor sem exemplo", () => {
  // Dentro do projeto (no cache, fora do git): o executor dos testes não importa módulo da pasta temporária do sistema.
  // Uma árvore por caso: o módulo importado fica guardado, e a mesma árvore devolveria o texto do caso anterior.
  mkdirSync(join(raiz, "node_modules/.cache"), {recursive: true});
  const dirs: string[] = [];
  afterAll(() => { for (const d of dirs) rmSync(d, {recursive: true, force: true}); });
  const arvore = (exemplos: string[]) => {
    const dir = mkdtempSync(join(raiz, "node_modules/.cache/catalogo-fiel-"));
    dirs.push(dir);
    const escreve = (caminho: string, texto: string) => {
      mkdirSync(join(dir, caminho, ".."), {recursive: true});
      writeFileSync(join(dir, caminho), texto);
    };
    escreve("packages/react/dist/index.js", "export function Pill() {}\nexport function usePill() {}\n");
    escreve("packages/contracts/registry/Pill.json", JSON.stringify({name: "Pill", summary: "A pill.", platforms: {web: "stable"},
      variants: [], sizes: ["sm", "md", "lg"], props: [{name: "size", default: "md", description: ""}]}));
    escreve("packages/contracts/registry/usePill.json", JSON.stringify({name: "usePill", summary: "A hook.", kind: "hook",
      platforms: {web: "stable"}, variants: [], sizes: []}));
    escreve("apps/catalog/content/patterns/.vazio", "");
    escreve("apps/catalog/content/_starters-motores.mjs", "export default {};\n");
    escreve("apps/catalog/content/_starters.mjs",
      `export default {Pill: {code: ${JSON.stringify(exemplos[0])}, render: () => null, examples: [${exemplos.slice(1)
        .map((c) => `{title: "x", code: ${JSON.stringify(c)}, render: () => null}`).join(",")}]}};\n`);
    return dir;
  };

  test("o lg sem exemplo reprova, com o nome e o valor (o md é o padrão)", async () => {
    const r = await medirCatalogo(arvore(['<Pill size="sm" />']));
    expect(r.web.faltam).toEqual({Pill: ["size=lg"]});
    expect(r.erros.join(" ")).toContain("Pill (size=lg)");
  }, 60_000);
  test("com o exemplo do lg — num exemplo extra do starter —, passa", async () => {
    const r = await medirCatalogo(arvore(['<Pill size="sm" />', '<Pill size="lg" />']));
    expect(r.web.faltam).toEqual({});
    expect(r.erros).toEqual([]);
  }, 60_000);
});

describe("a trava do nativo (os exemplos de mentira: os de verdade só carregam pelo pacote do Vite)", () => {
  const nomes = exportadosDoNativo(raiz).filter((n) => !ehConstante(n));
  test("as portas do pacote dão as peças, e as constantes ficam de fora", () => {
    expect(nomes.length).toBeGreaterThan(70);
    expect(nomes).toContain("KPI");
    expect(nomes).not.toContain("ICONE_DA_VARIANTE");
  });
  test("peça sem página reprova, com o nome", () => {
    const r = medirNativo(raiz, {});
    expect(r.semPagina).toEqual(nomes);
    expect(r.erros.join(" ")).toContain("sem página");
  });
  test("valor sem exemplo reprova; com o exemplo, passa", () => {
    const vazio = Object.fromEntries(nomes.map((n) => [n, {examples: [{title: "x", code: ""}]}]));
    const r = medirNativo(raiz, vazio);
    expect(r.faltam.Button).toEqual(expect.arrayContaining(["size=lg", "tone=brand"]));
    const valores = r.faltam.Button.map((pv) => `<Button ${pv.replace("=", '="')}" />`).join("\n");
    const r2 = medirNativo(raiz, {...vazio, Button: {examples: [{title: "x", code: valores}]}});
    expect(r2.faltam.Button).toBeUndefined();
  });
});

describe("as rodadas da saúde", () => {
  test("o horário é o de Brasília (UTC−3)", () => {
    expect(emBrasilia("2026-10-23T17:19:04Z")).toBe("2026-10-23 14:19");
    expect(emBrasilia("2026-10-24T01:30:00Z")).toBe("2026-10-23 22:30");
  });
  test("o resultado é uma palavra", () => {
    expect(palavra({status: "completed", conclusion: "success"})).toBe("OK");
    expect(palavra({status: "completed", conclusion: "failure"})).toBe("FAILED");
    expect(palavra({status: "in_progress", conclusion: null})).toBe("RUNNING");
  });
  test("a linha-modelo vira uma linha por rodada, e o aviso de lista vazia sai", () => {
    const html = readFileSync(join(raiz, "apps/catalog/saude.html"), "utf8");
    const saida = preencher(html, [
      {data: "2026-10-23 14:19", commit: "fb969c54", resultado: "OK", trabalhos: "build OK · test OK"},
      {data: "2026-10-23 09:27", commit: "e6c9e93b", resultado: "FAILED", trabalhos: "build OK · visual FAILED"},
    ]);
    expect(saida).not.toContain("data-modelo");
    expect(saida).not.toContain("data-saude-vazia");
    expect(saida).toContain("fb969c54");
    expect(saida).toContain("visual FAILED");
    expect((saida.match(/<\/tr>/g) || []).length - (html.match(/<\/tr>/g) || []).length).toBe(1);
  });
});
