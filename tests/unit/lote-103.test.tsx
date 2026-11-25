// O LOTE 103 (0.81.1) — o UDS-A1: as contradições entre o que a Aurea promete em público e o que ela prova (o relatório
// "a Aurea como UDS completo", 24/11/2026; decidido pelo Victor, "Sim, os 5", e o texto aprovado em 25/11/2026, "Pode,
// como recomendado"). Nada muda na tela das peças.
//   1. o arquivo de tokens não lista mais o princípio `no-gradients` (o degradê é permitido, ADR-0091);
//   2. o contrato publicado é em inglês (tudo que é público é em inglês, 07/11/2026), e as descrições dos pacotes também;
//   3. o contrato diz a meta de acessibilidade (WCAG 2.2 AA) E o que a varredura confere hoje — e a frase acompanha a
//      varredura: quando ela passar a rodar as regras da 2.2, este teste cobra que o contrato diga;
//   4. a página AGENTS.md do site vigia o arquivo que ela descreve (o `aurea-agents.md` sai da skill), e o AGENTS.md da
//      raiz manda quem USA a Aurea para as regras públicas;
//   5. o Roadmap não diz mais que o degradê é recusado nem que faltam paletas, e o site não leva ao histórico em português.
// Provado contra o defeito: com os arquivos da 0.81.0, cada `it` abaixo reprova.
import {readFileSync, readdirSync} from "node:fs";
import {describe, expect, it} from "vitest";

const ler = (p: string) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const json = (p: string) => JSON.parse(ler(p));

// textos de um JSON, com o caminho, para dizer ONDE está o português
function textos(o: unknown, caminho = ""): [string, string][] {
  if (typeof o === "string") return [[caminho, o]];
  if (Array.isArray(o)) return o.flatMap((v, i) => textos(v, `${caminho}[${i}]`));
  if (o && typeof o === "object") return Object.entries(o).flatMap(([k, v]) => textos(v, `${caminho}.${k}`));
  return [];
}
// acento do português ou palavra que só o português tem (o inglês do contrato não tem nenhuma das duas)
const PORTUGUES = /[ãõçáéíóúâêôà]|\b(não|nao|importar|embutir|usar|somente|são|uma|para|quando|tela)\b/i;

describe("1 · o degradê é permitido (ADR-0091)", () => {
  it("o arquivo de tokens não lista o princípio no-gradients", () => {
    const principios = json("packages/tokens/src/aurea.tokens.json").$extensions["ui.aurea"].principles as string[];
    expect(principios.length).toBeGreaterThan(0);
    expect(principios).not.toContain("no-gradients");
  });
});

describe("2 · o que é público é em inglês", () => {
  const contrato = json("packages/contracts/aurea.contract.json");
  it("o contrato se declara em inglês", () => {
    expect(contrato.language).toBe("en");
  });
  it("nenhuma frase do contrato em português", () => {
    const pt = textos(contrato).filter(([, s]) => PORTUGUES.test(s));
    expect(pt.map(([c, s]) => `${c}: ${s.slice(0, 60)}`)).toEqual([]);
  });
  it("a descrição de cada pacote publicado (a da página do npm) em inglês", () => {
    const pacotes = readdirSync("packages").map((d) => `packages/${d}/package.json`)
      .filter((p) => { try { return json(p).publishConfig?.access === "public"; } catch { return false; } });
    expect(pacotes.length).toBe(7);
    for (const p of pacotes) {
      const d = json(p).description as string;
      expect(d, p).toBeTruthy();
      expect(PORTUGUES.test(d), `${p}: ${d}`).toBe(false);
    }
  });
});

describe("3 · a promessa de acessibilidade diz o que se mede", () => {
  const contrato = json("packages/contracts/aurea.contract.json");
  // as regras que a varredura do catálogo roda hoje (o `runOnly` do axe)
  const varredura = ler("tests/visual/catalog-sweep.spec.ts");
  const regras = varredura.match(/runOnly:\s*\[([^\]]*)\]/)![1];
  const mede22 = /wcag22a/.test(regras);
  const a11y = contrato.universalCapabilities.accessibility;
  const gate = (contrato.hardRules as string[]).find((r) => r.includes("WCAG"))!;

  it("a meta continua sendo a WCAG 2.2 AA (decisão do Victor, UDS-A3)", () => {
    expect(a11y.target).toBe("WCAG 2.2 AA");
    expect(gate).toMatch(/target is WCAG 2\.2 AA/);
  });
  it("o contrato diz o que a varredura confere hoje, e não promete a 2.2 como medida antes de ela rodar", () => {
    expect(regras).toMatch(/wcag21aa/);
    if (mede22) {
      expect(a11y.measuredToday).toMatch(/2\.2/);
    } else {
      expect(a11y.measuredToday).toMatch(/WCAG 2\.0 and 2\.1/);
      expect(gate).toMatch(/checks the WCAG 2\.0 and 2\.1/);
      expect(gate).not.toMatch(/^WCAG 2\.2 AA,.*release gates/);
    }
    expect(a11y.knownGaps).toBe("https://aureauds.dev/docs-accessibility.html");
  });
});

describe("4 · os arquivos para assistentes de IA", () => {
  it("a página AGENTS.md do site vigia o arquivo de onde o aurea-agents.md é feito", () => {
    const montagem = ler("scripts/build-catalog.mjs");
    const fonte = montagem.match(/\["aurea-agents\.md", readFileSync\(join\(root, "([^"]+)"\)/)![1];
    const pagina = ler("apps/catalog/content/docs/agents-md.md");
    expect(pagina).toMatch(new RegExp(`^sources: file:${fonte.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}$`, "m"));
  });
  it("o AGENTS.md da raiz está em inglês e manda quem usa a Aurea às regras públicas", () => {
    const raiz = ler("AGENTS.md");
    expect(raiz).toContain("https://aureauds.dev/aurea-agents.md");
    expect(raiz).toContain("CLAUDE.md");
    expect(PORTUGUES.test(raiz)).toBe(false);
  });
});

describe("5 · o site não diz o que deixou de ser verdade", () => {
  const roadmap = ler("apps/catalog/content/docs/roadmap.md");
  it("o Roadmap não recusa o degradê nem diz que faltam paletas", () => {
    const recusas = roadmap.split("## Decided not to build")[1].split("\n## ")[0];
    expect(recusas).not.toMatch(/gradient/i);
    expect(roadmap).not.toMatch(/Two more ready-made palettes/);
    expect(roadmap).toMatch(/Thirteen brands/);
  });
  it("nenhuma página da documentação leva ao histórico em português do GitHub", () => {
    for (const f of readdirSync("apps/catalog/content/docs").filter((f) => f.endsWith(".md"))) {
      expect(ler(`apps/catalog/content/docs/${f}`), f).not.toContain("blob/main/CHANGELOG.md");
    }
  });
});
