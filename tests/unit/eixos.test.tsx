// O FIXTURE da leitura de EIXO — §1b do protocolo.
//
// A armadilha central deste arquivo é o `else` pendurado que engolia os campos PLANOS das fontes
// ricas. Ela não era visível lendo o código, e não seria pega por um teste que só exercita o
// caminho do dicionário — que era o caminho que funcionava. Cada `it` abaixo escolhe a forma de
// entrada de propósito.
import {describe, it, expect} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {eixosDe, eixosAurea, eixoCanon} from "../../audit/activity-2/eixos.mjs";

describe("eixosDe: as duas formas em que uma fonte declara eixo", () => {
  // FORMA A — dicionário por prop. É o que a mui e a shadcn fazem, e o caminho que sempre
  // funcionou.
  it("dicionário por prop vira eixo por TIPO", () => {
    const r = eixosDe({VARIANTES: {variant: ["filled", "outlined"], color: ["error"]}}, "rico");
    expect(r.eixos).toEqual({aparencia: ["filled", "outlined"], tom: ["error"]});
    expect(r.naoMapeados).toEqual([]);
  });

  // FORMA B — campos PLANOS. É o que a untitled-ui faz, e é a que o `else` pendurado engolia:
  // com `VARIANTES: "N/A"` o dicionário é nulo, e o bloco inteiro deixava de rodar.
  it("campos planos são lidos mesmo quando VARIANTES é a string N/A", () => {
    const r = eixosDe({VARIANTES: "N/A", TAMANHOS: ["lg", "md", "sm"]}, "rico");
    expect(r.eixos, "o `else` pendurado engolia exatamente esta forma").toEqual(
      {tamanho: ["lg", "md", "sm"]});
  });

  it("campos planos com VARIANTES em ARRAY também são lidos", () => {
    const r = eixosDe({VARIANTES: ["solid", "ghost"], TAMANHOS: ["md"]}, "rico");
    expect(r.eixos).toEqual({aparencia: ["solid", "ghost"], tamanho: ["md"]});
  });

  it("dicionário e campos planos não se somam: o dicionário vence", () => {
    // Sem as chaves, o `else` rodava DENTRO do laço para cada valor não-array e misturava as
    // duas fontes. Com elas, um caminho ou o outro.
    const r = eixosDe({VARIANTES: {variant: ["a"], loadingPosition: "N/A"}, TAMANHOS: ["xl"]}, "rico");
    expect(r.eixos.aparencia).toEqual(["a"]);
    expect(r.eixos.tamanho, "TAMANHOS não deve entrar quando há dicionário").toBeUndefined();
  });

  it("esquema medido lê `eixos`, `variantes` e `tamanhos` em minúscula", () => {
    expect(eixosDe({eixos: {size: ["sm"]}}, "medido").eixos).toEqual({tamanho: ["sm"]});
    expect(eixosDe({variantes: ["x"], tamanhos: ["y"]}, "medido").eixos)
      .toEqual({aparencia: ["x"], tamanho: ["y"]});
  });

  it("ORIENTACOES entra como eixo de orientação, e só nas fontes ricas", () => {
    expect(eixosDe({VARIANTES: "N/A", ORIENTACOES: ["horizontal", "vertical"]}, "rico").eixos)
      .toEqual({orientacao: ["horizontal", "vertical"]});
    expect(eixosDe({ORIENTACOES: ["horizontal"]}, "medido").eixos).toEqual({});
  });

  it("prop que o mapa de apelidos não conhece vai para `naoMapeados`, nunca some", () => {
    const r = eixosDe({VARIANTES: {loadingPosition: ["start", "end"]}}, "rico");
    expect(r.eixos).toEqual({});
    expect(r.naoMapeados).toEqual(["loadingPosition"]);
  });

  it("item vazio não estoura e não inventa eixo", () => {
    expect(eixosDe({}, "rico")).toEqual({eixos: {}, naoMapeados: []});
    expect(eixosDe({VARIANTES: "N/A", TAMANHOS: "N/A"}, "rico")).toEqual({eixos: {}, naoMapeados: []});
  });
});

describe("eixosAurea: o lado da ficha", () => {
  it("`axes` vira eixo por tipo", () => {
    expect(eixosAurea({axes: {orientation: ["horizontal", "vertical"]}}).eixos)
      .toEqual({orientacao: ["horizontal", "vertical"]});
  });

  // O achado de 22/08: sem `variantProp`, o Separator/Toolbar/ToggleGroup entravam como eixo de
  // APARÊNCIA e a matriz reportava que lhes faltava orientação. Os três têm `orientation` no
  // TypeScript e a ficha nunca mentiu — quem estava errado era o leitor.
  it("`variantProp` diz QUAL eixo o enum de variante carrega", () => {
    expect(eixosAurea({variantProp: "orientation", variants: ["horizontal", "vertical"]}).eixos)
      .toEqual({orientacao: ["horizontal", "vertical"]});
  });

  it("`variants` não duplica quando a ficha já declara `axes.variant`", () => {
    const r = eixosAurea({axes: {variant: ["solid"]}, variants: ["solid", "ghost"]});
    expect(r.eixos.aparencia).toEqual(["solid"]);
  });

  it("`sizes` entra em tamanho, e `sizeProp` o redireciona", () => {
    expect(eixosAurea({sizes: ["sm", "md"]}).eixos).toEqual({tamanho: ["sm", "md"]});
    expect(eixosAurea({sizeProp: "density", sizes: ["compact"]}).eixos)
      .toEqual({densidade: ["compact"]});
  });
});

describe("eixoCanon: o mapa de apelidos", () => {
  it("casa por nome e por forma camelCase", () => {
    expect(eixoCanon("colorScheme")).toBe("tom");
    expect(eixoCanon("placement")).toBe("posicao");
    expect(eixoCanon("scale")).toBe("tamanho");
  });

  it("devolve null para o que não é eixo — casar demais inventa paridade", () => {
    expect(eixoCanon("loadingPosition")).toBeNull();
    expect(eixoCanon("onChange")).toBeNull();
  });
});

// ── USO NO INVENTÁRIO REAL ────────────────────────────────────────────────────
// O fixture prova a função; isto prova que a matriz VERSIONADA foi gerada com ela corrigida.
// Um `else` pendurado de volta faria estas duas passarem a falhar.
describe("a matriz versionada leu os campos planos das fontes ricas", () => {
  const AQUI = path.join(import.meta.dirname, "..", "..", "audit", "activity-2");
  const m = JSON.parse(fs.readFileSync(path.join(AQUI, "MATRIX.json"), "utf8"));
  const cel = (cap: string, eixo: string) =>
    m.linhas.find((l: {capacidade: string}) => l.capacidade === cap)?.comparacao?.[eixo];

  it("`select·tamanho` enxerga a escala da untitled-ui", () => {
    const c = cel("select", "tamanho");
    expect(c, "a célula sumiu da matriz").toBeTruthy();
    expect(c.porFonte["untitled-ui"], "a untitled declara TAMANHOS plano e a matriz tem de ver")
      .toBeTruthy();
    expect(c.veredito, "com a referência enxergada, isto não pode ser SO_AUREA")
      .not.toBe("SO_AUREA");
  });

  it("as quatro inferioridades que só aparecem com os campos planos lidos existem", () => {
    for (const cap of ["tabs", "pagination", "table", "empty-state"]) {
      const c = cel(cap, "tamanho");
      expect(c, `${cap}·tamanho não existe na matriz`).toBeTruthy();
    }
  });
});
