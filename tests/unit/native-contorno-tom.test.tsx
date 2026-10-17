// SEM LINHA (ADR-0072, 16/10/2026) · o botão de CONTORNO com tom de estado, no nativo, sem a linha: o fundo é o tom a
// 16%, e no tema claro a letra vai 20% para a cor do texto — a "C" da bancada, escolhida pelo Victor. Com o tom a 16%
// e a letra de sempre, o azul do claro caía abaixo de 4,5:1 (na web, 4,02).
//
// O par da web é o `tone-contrast.spec.ts` (a matriz e o mouse). Aqui a conta é a mesma: o fundo translúcido pintado por
// cima da página, a letra contra esse fundo, e o fundo contra a página.
// Provado contra o defeito (16/10/2026): com `corDaLetra` devolvendo a letra de sempre, o azul do claro reprova a 4,02:1.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, Badge, Button, comOpacidade, resolverTokens} from "../../packages/native/src/index.js";

const canais = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const lum = ([r, g, b]: number[]) => {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const razao = (a: number[], b: number[]) => {
  const A = lum(a), B = lum(b);
  return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05);
};
// `#rrggbbaa` pintado sobre `#rrggbb`.
const sobre = (cor: string, fundo: string) => {
  const a = cor.length === 9 ? parseInt(cor.slice(7, 9), 16) / 255 : 1;
  const [f, b] = [canais(cor), canais(fundo)];
  return f.map((v, i) => Math.round(v * a + b[i] * (1 - a)));
};

const TONS = ["info", "success", "warning", "danger"] as const;
const PISO_DO_FUNDO = 1.05;

describe("contorno com tom, sem linha, no nativo: o fundo aparece e a letra passa de 4,5:1", () => {
  for (const tema of ["dark", "light"] as const) {
    const t = resolverTokens(tema, "comfortable");
    for (const tom of TONS) {
      it(`tema ${tema} · ${tom}`, () => {
        __limpar();
        render(<AureaProvider theme={tema}><Button appearance="outline" tone={tom}>Ação</Button></AureaProvider>);
        const cheio = tom === "danger" ? t.color.destructive : t.color[tom];
        const capsula = __instancias("View").map((v) => StyleSheet.flatten(v.style) ?? {})
          .find((e) => e.backgroundColor === comOpacidade(cheio, 0.16));
        expect(capsula, `o fundo do ${tom} é o tom a 16%`).toBeDefined();
        const letra = StyleSheet.flatten((__instancias("Text").at(-1) ?? {}).style).color as string;
        const fundo = sobre(capsula!.backgroundColor as string, t.color.background);
        const pagina = canais(t.color.background);
        expect(razao(fundo, pagina), `${tema} ${tom}: o fundo a ${razao(fundo, pagina).toFixed(2)}:1 da página`)
          .toBeGreaterThanOrEqual(PISO_DO_FUNDO);
        expect(razao(canais(letra), fundo), `${tema} ${tom}: a letra a ${razao(canais(letra), fundo).toFixed(2)}:1`)
          .toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

// O selo de CONTORNO, sem a linha: o acento a 16% e a letra 20% para a cor do texto, nos DOIS temas — com a letra de
// sempre, o `success` do escuro e o verde do claro caíam abaixo de 4,5:1 (medido na web, 16/10/2026).
// Provado contra o defeito (16/10/2026): com a letra de sempre (`corDoTexto` = acento), reprova.
const SELOS = ["info", "success", "warning", "danger", "red", "orange", "green", "teal", "cyan", "blue", "violet", "pink"] as const;

describe("selo de contorno, sem linha, no nativo: o fundo aparece e a letra passa de 4,5:1", () => {
  for (const tema of ["dark", "light"] as const) {
    const t = resolverTokens(tema, "comfortable");
    for (const tom of SELOS) {
      it(`tema ${tema} · ${tom}`, () => {
        __limpar();
        render(<AureaProvider theme={tema}><Badge tone={tom as never} emphasis="outline">Pronto</Badge></AureaProvider>);
        const capsula = __instancias("View").map((v) => StyleSheet.flatten(v.style) ?? {})
          .find((e) => typeof e.backgroundColor === "string" && /^#[0-9a-f]{6}29$/i.test(e.backgroundColor));
        expect(capsula, `o fundo do ${tom} é o acento a 16%`).toBeDefined();
        const letra = StyleSheet.flatten((__instancias("Text").at(-1) ?? {}).style).color as string;
        const fundo = sobre(capsula!.backgroundColor as string, t.color.background);
        const pagina = canais(t.color.background);
        expect(razao(fundo, pagina), `${tema} ${tom}: o fundo a ${razao(fundo, pagina).toFixed(2)}:1 da página`)
          .toBeGreaterThanOrEqual(PISO_DO_FUNDO);
        expect(razao(canais(letra), fundo), `${tema} ${tom}: a letra a ${razao(canais(letra), fundo).toFixed(2)}:1`)
          .toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
