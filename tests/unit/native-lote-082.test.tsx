// O lote 082 (0.71.0), no nativo — o D3 (aprovado pelo Victor em 19/10/2026, *"Aceito todas as recomendações do plano, de
// D1 a D20"*) e o 2-C b (aprovado em 04/11/2026, *"Aprovo"*):
//   • o `Button` sem `appearance` nem `tone` é o principal (o fundo amarelo), como a web e a referência; pedindo só um eixo,
//     o outro continua o de antes;
//   • o `Alert` sem `variant` nem `state` é o neutro: o título na cor do texto (era o azul de `info`);
//   • as abas `secondary` enchem a fila (cada aba cresce, e a fileira ocupa a linha).
// Provado contra o defeito: com o nativo da 0.70.0 o botão sem nada é cheio NEUTRO (nenhuma caixa amarela), o título do
// aviso sai no `info400`, e a aba secundária não tem `flexGrow`.
import {render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {Alert, AureaProvider, Button, Tabs, resolverTokens} from "../../packages/native/src/index.js";

type Estilo = Record<string, unknown>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;
const CLARO = resolverTokens("light", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider theme="light">{children}</AureaProvider>;
const temFundo = (cor: string) => __instancias("View").some((v) => plano(v.style).backgroundColor === cor);

describe("D3 · o Button do nativo sem nada pedido é o principal", () => {
  it("sem `appearance` nem `tone`: a caixa amarela", () => {
    render(<Envolve><Button>Salvar</Button></Envolve>);
    expect(temFundo(CLARO.color.primary)).toBe(true);
  });
  it("só `appearance`: o tom continua o neutro (o fantasma não vira amarelo)", () => {
    render(<Envolve><Button appearance="solid" tone="neutral">Neutro</Button></Envolve>);
    const neutro = __instancias("View").map((v) => plano(v.style).backgroundColor).filter(Boolean);
    render(<Envolve><Button appearance="solid">Só a aparência</Button></Envolve>);
    const soAparencia = __instancias("View").map((v) => plano(v.style).backgroundColor).filter(Boolean);
    expect(soAparencia.at(-1)).toBe(neutro.at(-1));
    expect(soAparencia.at(-1)).not.toBe(CLARO.color.primary);
  });
  // Achado da suíte do fim: o botão de ligar sem tom ficaria amarelo ligado e desligado — igual nos dois estados.
  it("com `pressed` e sem tom: continua o neutro, desligado e ligado", () => {
    for (const pressed of [false, true]) {
      render(<Envolve><Button pressed={pressed}>Favorito</Button></Envolve>);
      expect(temFundo(CLARO.color.primary)).toBe(false);
    }
  });
});

describe("D3 · o Alert do nativo sem tom é o neutro", () => {
  const corDoTitulo = (titulo: string) =>
    plano(__instancias("Text").findLast((p) => p.children === titulo)?.style).color;
  it("o título na cor do texto, e não no azul de `info`", () => {
    render(<Envolve><Alert title="Aviso">Corpo</Alert></Envolve>);
    expect(corDoTitulo("Aviso")).toBe(CLARO.color.foreground);
    expect(corDoTitulo("Aviso")).not.toBe(CLARO.color.info400);
  });
  it("o `info` pedido continua azul", () => {
    render(<Envolve><Alert variant="info" title="Info">Corpo</Alert></Envolve>);
    expect(corDoTitulo("Info")).toBe(CLARO.color.info400);
  });
});

describe("2-C b · as abas secundárias enchem a fila", () => {
  it("cada aba cresce, e a fila também", () => {
    render(<Envolve><Tabs variant="secondary" value="a" tabs={[{id: "a", label: "Um", content: null}, {id: "b", label: "Dois", content: null}]} /></Envolve>);
    const abas = __instancias("Pressable").filter((p) => p.accessibilityRole === "tab").map((p) => plano(p.style));
    expect(abas).toHaveLength(2);
    for (const a of abas) expect(a.flexGrow).toBe(1);
    const fila = __instancias("View").find((p) => p.accessibilityRole === "tablist");
    expect(plano(fila?.style).flexGrow).toBe(1);
  });
  it("a primária não muda", () => {
    render(<Envolve><Tabs value="a" tabs={[{id: "a", label: "Um", content: null}, {id: "b", label: "Dois", content: null}]} /></Envolve>);
    const abas = __instancias("Pressable").filter((p) => p.accessibilityRole === "tab").map((p) => plano(p.style));
    for (const a of abas.slice(-2)) expect(a.flexGrow).toBeUndefined();
  });
});
