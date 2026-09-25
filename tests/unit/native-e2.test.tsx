// E2 (Lote 3, decisão do Victor de 25/09/2026) · o `Button` do nativo obedece o pai, como o do
// HeroUI Native e o `.btn` da web num `.stack`. Era `alignSelf: "flex-start"`, que vencia o
// `alignItems: "center"` do pai: no `EmptyState` o botão ficava à esquerda e o resto no meio.
// O dublê não calcula layout; o que se prova é o pedido ao motor. A prova de aparelho é o bloco
// E2 do `apps/native-smoke`.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Button, EmptyState, IconButton, Stack, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const alvo = () => StyleSheet.flatten(__instancias("Pressable").at(-1)?.style);

describe("E2 · o Button obedece o pai", () => {
  it("o alvo do botão não fixa alinhamento próprio", () => {
    render(<Envolve><Button>Salvar</Button></Envolve>);
    expect(alvo().alignSelf).toBeUndefined();
  });
  it("fullWidth continua esticando", () => {
    render(<Envolve><Button fullWidth>Salvar</Button></Envolve>);
    expect(alvo().alignSelf).toBe("stretch");
  });
  it("no EmptyState, que centraliza, nada no botão vence o centro", () => {
    render(<Envolve><EmptyState title="Nada aqui" action={<Button>Lançar um gasto</Button>} /></Envolve>);
    expect(alvo().alignSelf).toBeUndefined();
  });
  it("IconButton tem largura fixa, como o só-ícone do HeroUI: nunca estica", () => {
    render(<Envolve><IconButton name="add" label="Adicionar" /></Envolve>);
    expect(alvo().alignSelf).toBeUndefined();
    expect(alvo().width).toBe(Math.max(t.size.controlHMd, t.size.targetMin));
  });
});

describe("E2 · o Stack do nativo ganha o align da web", () => {
  const coluna = () => StyleSheet.flatten(__instancias("View").find((v) => {
    const e = StyleSheet.flatten(v.style); return e && e.flexDirection === "column" && e.gap === t.size.space4;
  })?.style);
  it("sem align, como sempre: estica (nenhum alignItems próprio)", () => {
    render(<Envolve><Stack><Button>a</Button></Stack></Envolve>);
    expect(coluna().alignItems).toBeUndefined();
  });
  it.each([["start", "flex-start"], ["center", "center"], ["end", "flex-end"], ["stretch", "stretch"]] as const)(
    "align=%s", (align, css) => {
      render(<Envolve><Stack align={align}><Button>a</Button></Stack></Envolve>);
      expect(coluna().alignItems).toBe(css);
    });
});
