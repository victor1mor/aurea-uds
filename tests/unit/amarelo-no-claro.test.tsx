// ADR-0054 (02/10/2026) · no tema claro, a cor de destaque usada como LETRA ou ÍCONE é o amarelo da
// marca escurecido (`brand-yellow-text`), e não o marrom (`brand-yellow-foreground`). Pedido do
// Victor, olhando o app: *"esse marrom me incomoda muito, quero amarelo como no modo escuro"* —
// escolha "D" da prancha.
//
// Duas travas, e as duas reprovam o código de antes ou um amarelo puro:
//   1. o TOM é o do amarelo (`--primary`, matiz 86) — o marrom tinha matiz 57,7;
//   2. LÊ: 4,5:1 em todo fundo do tema claro, inclusive o selo (o véu de 10% de amarelo do
//      `.badge-primary`). O amarelo puro mede 1,9:1 no branco.
import {describe, expect, it} from "vitest";
import {themes} from "../../packages/tokens/dist/aurea.tokens.native.js";

type Cor = {hex: string; oklch: string | null};
const claro = (themes as unknown as Record<string, Record<string, Cor>>).light;
const base = themes as unknown as Record<string, Record<string, Cor>>;

const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h: string) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const contraste = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
// O véu do `.badge-primary` (`color-mix(in srgb, primary 10%, transparent)`) sobre um fundo.
const veu = (fundo: string) => {
  const [a, b] = [rgb(claro.primary.hex), rgb(fundo)];
  return "#" + a.map((v, i) => Math.round(v * 0.1 + b[i] * 0.9).toString(16).padStart(2, "0")).join("");
};
const matiz = (oklch: string | null) => Number(/oklch\([\d.]+ [\d.]+ ([\d.]+)/.exec(oklch ?? "")?.[1]);

const FUNDOS = ["background", "card", "popover", "surface1", "surface2", "surface3", "muted",
  "secondary", "fieldBg", "surfaceInset", "accent"].filter((k) => claro[k]).map((k) => [k, claro[k].hex] as const);

describe("ADR-0054 · o amarelo como letra no tema claro", () => {
  it("o tom é o do amarelo da marca (matiz 86), e não o do marrom", () => {
    for (const nome of ["primaryEmphasis", "primaryOutline"]) {
      expect(Math.abs(matiz(claro[nome].oklch) - matiz(claro.primary.oklch)), nome).toBeLessThan(1);
    }
  });
  it("lê em todo fundo do tema claro: 4,5:1, inclusive dentro do selo amarelado", () => {
    expect(FUNDOS.length).toBeGreaterThan(5);
    for (const [nome, fundo] of FUNDOS) {
      expect(contraste(claro.primaryEmphasis.hex, fundo), nome).toBeGreaterThanOrEqual(4.5);
      expect(contraste(claro.primaryEmphasis.hex, veu(fundo)), `${nome} + véu`).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("o escuro não muda: lá a letra continua o amarelo puro", () => {
    expect(base.dark.primaryEmphasis.hex).toBe(base.dark.primary.hex);
  });
  it("o foco e o controle marcado do claro continuam no marrom (precisam de borda que se veja)", () => {
    expect(claro.focusStrong.hex).toBe(claro.controlSelected.hex);
    expect(claro.focusStrong.hex).not.toBe(claro.primaryEmphasis.hex);
  });
});
