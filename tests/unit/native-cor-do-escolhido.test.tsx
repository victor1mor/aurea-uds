// A COR DO ESCOLHIDO NO NATIVO É A DA WEB (bloco 1, 23/10/2026). O Victor viu a aba "Mês" azul no app: *"pq você mudou a
// cor desses componentes no nativo? ... mas pq ficou azul se na web não é azul?"*, e *"Sim, ponha o conserto da aba e a
// varredura do nativo logo depois da 0.42.0, com a bancada antes"*. A varredura dos 11 usos do `primaryEmphasis` mediu, no
// navegador, a cor que a web pinta em cada peça; cinco discordavam (os outros seis já eram iguais: o `Badge` e o
// `TagGroup` primários, o `BottomNav`, a `Timeline`).
//
// Provado contra o defeito (23/10/2026): com o nativo de antes, os casos do claro reprovam — o azul `#0246f1` no lugar da
// mistura, do amarelo e da cor do texto.
import {describe, expect, it} from "vitest";
import {corDoEscolhido, misturaNoOklab} from "../../packages/native/src/estilos.js";
import {resolverTokens} from "../../packages/native/src/index.js";
import {readFileSync} from "node:fs";
import {join} from "node:path";

const claro = resolverTokens("light", "comfortable");
const escuro = resolverTokens("dark", "comfortable");
const fonte = (arq: string) => readFileSync(join(__dirname, "../../packages/native/src", arq), "utf8");

describe("a mistura no oklab (a do `color-mix(in oklab, …)` da web)", () => {
  it("preto e branco a 50% dão o cinza do meio do oklab, e não o do meio dos canais", () => {
    expect(misturaNoOklab("#000000", "#ffffff", 0.5)).toBe("#636363");
    expect(misturaNoOklab("#ffffff", "#000000", 1)).toBe("#ffffff");
  });
  // ADR-0083 (26/10/2026): no claro, o escolhido é o GRAFITE do texto — era a marca a 45% sobre o texto (o "marrom").
  // Com o nativo da 0.44.0, reprova (a mistura no lugar do grafite).
  it("no claro, a cor do escolhido é o grafite do texto; no escuro, o destaque", () => {
    expect(corDoEscolhido(claro)).toBe(claro.color.foreground);
    expect(corDoEscolhido(claro)).not.toBe(misturaNoOklab(claro.color.primary, claro.color.foreground, 0.45));
    expect(corDoEscolhido(escuro)).toBe(escuro.color.primaryEmphasis);
  });
});

describe("as cinco peças que discordavam da web, pelo código", () => {
  // 24/10/2026: a aba escolhida virou o amarelo do botão, e o nome vai na tinta dele (decisão do Victor) — era a mistura.
  it("a aba escolhida do SegmentedControl leva o nome na tinta do botão, sobre o amarelo", () => {
    // Desde o passo B (ADR-0084), a letra vem da pele do `selectedStyle` quando há uma; sem ela (o padrão), continua a
    // tinta do botão — o `native-passo-b.test.tsx` prova rodando que o padrão não muda.
    expect(fonte("inputs.tsx")).toMatch(/color: ativo \? \(pele\?\.letra \?\? t\.color\.primaryForeground\) : t\.color\.mutedForeground/);
    expect(fonte("inputs.tsx")).toMatch(/segmentoAtivo: \{backgroundColor: t\.color\.primary\}/);
  });
  it("o visto da opção escolhida (Select, Combobox) é a marca, como o `.combobox-check` da web", () => {
    expect(fonte("inputs.tsx")).toMatch(/<Icon name="check" size="sm" color=\{t\.color\.primary\} \/>/);
  });
  it("o ponto e o visto do menu são a cor do texto da linha, como o `currentColor` da web", () => {
    expect(fonte("menu.tsx")).toMatch(/backgroundColor: t\.color\.foreground,/);
    expect(fonte("menu.tsx")).toMatch(/color=\{ctx\.tf\.color\.foreground\}/);
  });
  it("o passo atual do Stepper é a cor do texto, como o `.step-active` da web", () => {
    expect(fonte("navigation.tsx")).toMatch(/st === "active" \? t\.color\.foreground/);
  });
});
