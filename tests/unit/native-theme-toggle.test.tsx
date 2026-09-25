// ThemeToggle (nativo, 25/09/2026, pedido do Victor): no claro a lua na tinta do texto, no escuro o
// sol no amarelo da marca; tocar troca o tema. Os glifos saem do registro do app — aqui, dois
// glifos de mentira que anotam a cor que recebem.
import {act, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {__instancias} from "./native-stubs/react-native";
import {AureaProvider, Card, Button, ThemeToggle, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";

const vistos: Array<[string, string | undefined]> = [];
const Lua = ({color}: {color?: string}) => { vistos.push(["moon", color]); return null; };
const Sol = ({color}: {color?: string}) => { vistos.push(["sun", color]); return null; };
const ICONES = criarRegistroDeIcones({moon: Lua as never, sun: Sol as never});
const ultimo = () => vistos.at(-1);
const botao = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "button").at(-1)!;

describe("ThemeToggle · nativo", () => {
  it("no claro: a lua, na tinta do texto, com o nome de ir ao escuro", () => {
    render(<AureaProvider theme="light" icons={ICONES}><ThemeToggle /></AureaProvider>);
    expect(ultimo()).toEqual(["moon", resolverTokens("light", "comfortable").color.foreground]);
    expect(botao().accessibilityLabel).toBe("Switch to dark theme");
  });
  it("no escuro: o sol, no amarelo da marca", () => {
    render(<AureaProvider theme="dark" icons={ICONES}><ThemeToggle /></AureaProvider>);
    expect(ultimo()).toEqual(["sun", resolverTokens("dark", "comfortable").color.primary]);
    expect(botao().accessibilityLabel).toBe("Switch to light theme");
  });
  it("tocar troca o tema: do claro, o botão vira o sol (tema não controlado)", async () => {
    render(<AureaProvider defaultTheme="light" icons={ICONES}><ThemeToggle /></AureaProvider>);
    await act(async () => { (botao().onPress as () => void)(); });
    expect(ultimo()?.[0]).toBe("sun");
  });
  it("dentro do cartão da marca, a cor própria não vale: vence a tinta", () => {
    render(<AureaProvider theme="dark" icons={ICONES}>
      <Card variant="brand" action={<Button>ok</Button>}><ThemeToggle /></Card></AureaProvider>);
    const escuro = resolverTokens("dark", "comfortable");
    expect(ultimo()?.[1]).not.toBe(escuro.color.primary);
  });
});
