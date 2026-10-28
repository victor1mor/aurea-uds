// AS MARCAS NO NATIVO (passo C das cores, ADR-0085, 28/10/2026 — o Victor: o nativo "precisa atualizar e receber também").
// O `AureaProvider` aceita `brand`, com os mesmos nomes do `data-brand` da web; os tokens da marca saem do mesmo arquivo
// DTCG; os pares que a proposta diz que passam passam no nativo também; a marca segue para dentro do cartão de contraste;
// e a folha de estilo memoizada não devolve a cor da marca de antes.
// Provado contra o defeito (28/10/2026): sem a marca no gerador e no `resolverTokens`, reprovam todos; com a chave do
// cache só `tema:densidade`, reprova o último.
import {render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {AureaProvider, Card, criarFolha, resolverTokens, useAureaTokens, type AureaBrand} from "../../packages/native/src/index.js";

const MARCAS: AureaBrand[] = ["ember", "sun", "honey", "orange", "magenta", "violet", "indigo", "cobalt", "cyan", "turquoise", "emerald", "lime"];
const PRIMARIO: Record<string, string> = {
  sun: "#facc15", honey: "#f5a524", orange: "#ff7a1a", magenta: "#e0196e", violet: "#7c3aed", indigo: "#4f46e5",
  cobalt: "#0246f1", cyan: "#06b6d4", turquoise: "#14c8a8", emerald: "#17c964", lime: "#a3e635",
};

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const opaco = (hex: string) => hex.slice(0, 7);

describe("os tokens das marcas no nativo", () => {
  it("sem marca é a Gold, e a marca é a mesma da web", () => {
    expect(resolverTokens("light", "comfortable").brand).toBeNull();
    expect(resolverTokens("light", "comfortable").color.primary).toBe(resolverTokens("dark", "comfortable").color.primary);
    for (const [marca, hex] of Object.entries(PRIMARIO)) for (const tema of ["light", "dark"] as const) {
      const t = resolverTokens(tema, "comfortable", undefined, marca as AureaBrand);
      expect(t.brand).toBe(marca);
      expect(t.color.primary.toLowerCase(), `${marca} ${tema}`).toBe(hex);
    }
  });
  it("a Ember tem os neutros dela (a página não é a da Gold), e as 11 têm os da Aurea", () => {
    for (const tema of ["light", "dark"] as const) {
      const gold = resolverTokens(tema, "comfortable");
      expect(resolverTokens(tema, "comfortable", undefined, "ember").color.background).not.toBe(gold.color.background);
      for (const m of Object.keys(PRIMARIO)) expect(resolverTokens(tema, "comfortable", undefined, m as AureaBrand).color.background).toBe(gold.color.background);
    }
  });
  it("marca que não existe levanta, em vez de sair com a Gold em silêncio", () => {
    expect(() => resolverTokens("light", "comfortable", undefined, "lory" as AureaBrand)).toThrow(/não existe/);
  });
  it("os pares que a proposta diz que passam passam no nativo: a letra no primário, o link e o destaque na página", () => {
    const falhas: string[] = [];
    for (const marca of MARCAS) for (const tema of ["light", "dark"] as const) {
      const c = resolverTokens(tema, "comfortable", undefined, marca).color;
      const pares: [string, string, string, number][] = [
        ["letra no primário", c.primaryForeground, c.primary, 4.5],
        ["link na página", c.link, c.background, 4.5],
        ["destaque na página", c.primaryEmphasis, c.background, 4.5],
        ["destaque no cartão", c.primaryEmphasis, c.card, 4.5],
      ];
      for (const [nome, a, b, minimo] of pares) {
        const r = razao(opaco(a), opaco(b));
        // A Ember já reprovava assim, congelada (ADR-0083): a letra branca no laranja dela, no claro, 3,08:1.
        if (marca === "ember" && tema === "light" && nome === "letra no primário") continue;
        if (r < minimo) falhas.push(`${marca} ${tema} · ${nome}: ${r.toFixed(2)}:1`);
      }
    }
    expect(falhas).toEqual([]);
  });
});

describe("o provedor", () => {
  function Le({onTokens}: {onTokens: (t: ReturnType<typeof useAureaTokens>) => void}) {
    onTokens(useAureaTokens());
    return null;
  }
  it("`brand` chega aos componentes", () => {
    let lido: ReturnType<typeof useAureaTokens> | null = null;
    render(<AureaProvider theme="light" brand="cobalt"><Le onTokens={(t) => { lido = t; }} /></AureaProvider>);
    expect(lido!.brand).toBe("cobalt");
    expect(lido!.color.primary.toLowerCase()).toBe("#0246f1");
  });
  it("dentro do cartão de contraste (o tema escuro num pedaço), a marca continua", () => {
    let dentro: ReturnType<typeof useAureaTokens> | null = null;
    render(<AureaProvider theme="light" brand="magenta"><Card variant="contrast"><Le onTokens={(t) => { dentro = t; }} /></Card></AureaProvider>);
    expect(dentro!.theme).toBe("dark");
    expect(dentro!.brand).toBe("magenta");
    expect(dentro!.color.primary.toLowerCase()).toBe("#e0196e");
  });
  it("a folha de estilo memoizada não devolve a cor da marca de antes", () => {
    const folha = criarFolha((t) => ({caixa: {backgroundColor: t.color.primary}}));
    const gold = folha(resolverTokens("light", "comfortable"));
    const cobalt = folha(resolverTokens("light", "comfortable", undefined, "cobalt"));
    expect(cobalt).not.toBe(gold);
    expect(String(cobalt.caixa.backgroundColor).toLowerCase()).toBe("#0246f1");
  });
});
