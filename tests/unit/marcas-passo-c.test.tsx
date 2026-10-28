// AS 13 MARCAS (passo C das cores, ADR-0085, 28/10/2026): a fonte dos tokens tem a Ember e as 11 da
// paleta da 1.0 com o primário da proposta do Victor; o nome antigo (`lory`) saiu de tudo, sem apelido; e o
// core não escreve mais regra para "qualquer marca" sem querer — `[data-brand]` sem nome valia só para a `ember` quando
// ela era a única, e com as 11 passou a valer para todas (o selo cheio saiu errado assim). As cores no navegador estão em
// `tests/visual/marcas-passo-c.spec.ts`.
// Provado contra o defeito (28/10/2026): com o DTCG da 0.46.0 (só `ember`), reprovam os quatro primeiros; com o selo cheio
// ainda em `[data-brand]`, reprova o último.
import {readFileSync} from "node:fs";
import {describe, expect, it} from "vitest";

const fonte = JSON.parse(readFileSync("packages/tokens/src/aurea.tokens.json", "utf8"));
const tokens = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
const core = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// O primário de cada marca, da parte 3 da proposta (o comentário de cada bloco: "Aurea Sun · #FACC15 · ...").
const PRIMARIO: Record<string, string> = {
  sun: "#facc15", honey: "#f5a524", orange: "#ff7a1a", magenta: "#e0196e", violet: "#7c3aed", indigo: "#4f46e5",
  cobalt: "#0246f1", cyan: "#06b6d4", turquoise: "#14c8a8", emerald: "#17c964", lime: "#a3e635",
};

describe("a fonte dos tokens", () => {
  it("as marcas são a Ember e as 11, nessa ordem, e a ember não existe mais como marca", () => {
    expect(Object.keys(fonte.brand).filter((k) => !k.startsWith("$"))).toEqual(["ember", ...Object.keys(PRIMARIO)]);
  });
  it("o primário de cada uma é o da proposta, nos dois temas", () => {
    for (const [marca, hex] of Object.entries(PRIMARIO)) for (const tema of ["light", "dark"]) {
      expect(fonte.brand[marca][tema].primary.$value.hex, `${marca} ${tema}`).toBe(hex);
    }
  });
  it("o nome antigo não existe mais: nem nos tokens, nem no CSS, nem no core (o Victor: \"mude 100% lory para ember\")", () => {
    expect(fonte.$extensions["ui.aurea"].brandAliases).toBeUndefined();
    expect(JSON.stringify(fonte)).not.toMatch(/lory/i);
    expect(tokens).not.toMatch(/lory/i);
    expect(core).not.toMatch(/lory/i);
    for (const tema of ["light", "dark"]) expect(tokens).toContain(`[data-brand="ember"][data-theme="${tema}"],[data-brand="ember"] [data-theme="${tema}"]{`);
  });
  it("a Orange troca o aviso pelo mel (o laranja do aviso seria a cor da marca)", () => {
    for (const tema of ["light", "dark"]) expect(fonte.brand.orange[tema].warning.$value.hex).toBe("#f5a524");
  });
});

describe("o core", () => {
  it("regra para QUALQUER marca é só a da lateral (o item atual do claro é o botão só na Gold)", () => {
    const qualquer = [...core.matchAll(/\[data-brand\](?!=)/g)].map((m) => core.slice(Math.max(0, core.lastIndexOf("}", m.index!) + 1), m.index!).trim().slice(0, 60));
    expect(qualquer.length, qualquer.join("\n")).toBe(2);
    expect(qualquer.every((s) => s.includes(".sidebar-item[aria-current]")), qualquer.join("\n")).toBe(true);
  });
});
