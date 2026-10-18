// ADR-0073 (18/10/2026) · no tema claro, a letra e o ícone de destaque são o AMARELO DA MARCA, o
// mesmo do escuro. Substitui a ADR-0054 (o ouro escurecido `#826202`). Decisão do Victor, depois da
// pesquisa nas seis referências: *"b aprovaro"* — sabendo que o amarelo mede 1,76:1 no fundo claro.
//
// Cada trava reprova o código de antes:
//   1. no claro, `primaryEmphasis`, `primaryOutline`, `link` e `linkHover` SÃO o amarelo — antes, o
//      ouro `#826202` e, no link, o `oklch(0.52 …)`;
//   2. o foco do claro é a cor do TEXTO (cinza-escuro), e não o marrom; ele se vê em todo fundo do
//      claro E em volta do botão amarelo (3:1, WCAG 1.4.11);
//   3. o controle marcado é o amarelo nos DOIS temas — antes, o marrom no claro;
//   4. sobre o amarelo, a letra é o cinza-escuro `brand-yellow-ink` nos dois temas — antes, o
//      marrom; a marca marrom fica só onde o Victor pediu (`primaryMark`), e a bolinha do rádio é
//      branca (`controlSelectedDot`).
import {readFileSync} from "node:fs";
import {render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Badge, resolverTokens} from "../../packages/native/src/index.js";
import {base as baseTokens, themes} from "../../packages/tokens/dist/aurea.tokens.native.js";

type Cor = {hex: string; oklch: string | null};
const temas = themes as unknown as Record<"dark" | "light", Record<string, Cor>>;
const claro = temas.light;
const raiz = baseTokens as unknown as Record<string, Cor>;

const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h: string) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const contraste = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const FUNDOS = ["background", "card", "popover", "surface1", "surface2", "surface3", "muted",
  "secondary", "fieldBg", "surfaceInset", "accent"].filter((k) => claro[k]).map((k) => [k, claro[k].hex] as const);

describe("ADR-0073 · a letra de destaque do claro é o amarelo da marca", () => {
  it("no claro, destaque, contorno e link são o amarelo da marca, o mesmo do escuro", () => {
    for (const nome of ["primaryEmphasis", "primaryOutline", "link", "linkHover"]) {
      expect(claro[nome].hex, nome).toBe(claro.primary.hex);
    }
    expect(temas.dark.primaryEmphasis.hex).toBe(temas.dark.primary.hex);
  });
  it("o foco do claro é a cor do texto, e se vê em todo fundo e em volta do botão amarelo", () => {
    expect(claro.focusStrong.hex).toBe(claro.foreground.hex);
    expect(FUNDOS.length).toBeGreaterThan(5);
    for (const [nome, fundo] of FUNDOS) {
      expect(contraste(claro.focusStrong.hex, fundo), nome).toBeGreaterThanOrEqual(3);
    }
    expect(contraste(claro.focusStrong.hex, claro.primary.hex)).toBeGreaterThanOrEqual(3);
  });
  it("o controle marcado é o amarelo nos dois temas", () => {
    for (const tema of ["dark", "light"] as const) {
      expect(temas[tema].controlSelected.hex, tema).toBe(temas[tema].primary.hex);
    }
  });
  it("sobre o amarelo: a letra cinza-escura, a marca marrom e a bolinha branca", () => {
    const tinta = raiz.brandYellowInk.hex;
    const marrom = raiz.brandYellowForeground.hex;
    for (const tema of ["dark", "light"] as const) {
      const t = temas[tema];
      for (const nome of ["primaryForeground", "sidebarPrimaryForeground", "controlSelectedForeground"]) {
        expect(t[nome].hex, `${tema} ${nome}`).toBe(tinta);
      }
      expect(contraste(t.primaryForeground.hex, t.primary.hex), tema).toBeGreaterThanOrEqual(4.5);
      expect(t.primaryMark.hex, tema).toBe(marrom);
      expect(contraste(t.primaryMark.hex, t.primary.hex), tema).toBeGreaterThanOrEqual(3);
      expect(lum(t.controlSelectedDot.hex), tema).toBeGreaterThan(0.9);
    }
  });
});

// O selo primário CHEIO enchia com o acento e escrevia com o fundo da página (clara). Com o acento do claro
// virando o amarelo, a letra clara mediu 1,75:1 — achado pelo axe da varredura, 18/10/2026. Agora escreve
// com a letra do botão amarelo (`primary-foreground`), nos dois alvos. Provado contra o defeito: sem a
// troca, os dois testes reprovam.
describe("ADR-0073 · o selo primário cheio escreve com a tinta, e não com o fundo", () => {
  it("web: o `.badge-primary` declara a letra do cheio", () => {
    const core = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const regra = core.match(/\.badge-primary \{([^}]*)\}/)?.[1] ?? "";
    expect(regra).toContain("--badge-on:var(--primary-foreground)");
  });
  it("nativo: no claro, a letra do selo cheio lê sobre o amarelo", () => {
    const t = resolverTokens("light", "comfortable");
    render(<AureaProvider theme="light"><Badge tone="primary" emphasis="solid">Novo</Badge></AureaProvider>);
    const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Record<string, unknown>;
    const letra = plano(__instancias("Text").find((p) => p.children === "Novo")!.style).color as string;
    expect(letra).toBe(t.color.primaryForeground);
    expect(__instancias("View").map((p) => plano(p.style)).some((e) => e.backgroundColor === t.color.primaryEmphasis)).toBe(true);
    expect(contraste(letra, t.color.primaryEmphasis)).toBeGreaterThanOrEqual(4.5);
  });
});

// O selo primário de CONTORNO escurecia a letra 20% com o texto (a "C" do lote S) e, com o amarelo, virava mostarda
// (2,36:1) só nesta peça. Decisão do Victor, 18/10/2026: "A" — a letra é o amarelo, a mesma do suave, como a referência
// principal faz. Na web, só sem `data-brand` (na `lory` do claro, sem a mistura, a letra cairia para 4,42:1).
describe("ADR-0073 · o selo primário de contorno escreve com o amarelo, sem mistura", () => {
  it("web: a regra existe, e só fora de marca", () => {
    const core = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(core).toContain(".badge-primary.badge-outline:not(:where([data-brand],[data-brand] *)) { color:var(--badge-accent); }");
  });
  it("nativo: no claro, a letra do contorno primário é o amarelo, e a dos estados continua misturada", () => {
    const t = resolverTokens("light", "comfortable");
    render(<AureaProvider theme="light"><Badge tone="primary" emphasis="outline">Marca</Badge>
      <Badge tone="success" emphasis="outline">Pago</Badge></AureaProvider>);
    const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Record<string, unknown>;
    const cor = (txt: string) => plano(__instancias("Text").find((p) => p.children === txt)!.style).color as string;
    expect(cor("Marca")).toBe(t.color.primaryEmphasis);
    expect(cor("Pago")).not.toBe(t.color.success400);
  });
});
