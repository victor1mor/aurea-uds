// OS 8 DEFEITOS DAS PEÇAS DO NATIVO (bloco 1, 24/10/2026), achados ao montar as páginas do nativo no site — o Victor:
// "Pode consertar os 8 defeitos das peças do nativo agora, no bloco 1." Cada `describe` é um defeito, e cada um prova o
// CONTRATO no dublê: o que a peça pede ao React Native (estilo, props, provedor). O que o navegador faz com isso foi visto
// na página do site. Provado contra o defeito: com o código de antes (`47533577`), reprovam todos os oito.
import {render, act} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";
import * as React from "react";
import {readFileSync} from "node:fs";
import {StyleSheet, __definirPlataforma, __instancias} from "./native-stubs/react-native";
import {SafeAreaInsetsContext} from "./native-stubs/react-native-safe-area-context";
import {
  AureaProvider, BottomNav, Checkbox, IconButton, Radio, Screen, SearchField, Switch, Text, ThemeToggle,
  criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";
import {DatePicker} from "../../packages/native/src/sistema.js";

const claro = resolverTokens("light", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"calendar": Glifo, "x": Glifo, "house": Glifo, "gear": Glifo,
  "magnifying-glass": Glifo, "moon": Glifo, "sun": Glifo, "plus": Glifo});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider theme="light" icons={ICONES}>{children}</AureaProvider>;

type Props = Record<string, unknown>;
const porID = (primitivo: string, id: string): Props =>
  __instancias(primitivo).filter((p) => p.testID === id).at(-1) ?? {};
// Como o `react-native-web` junta os estilos: a chave com `undefined` NÃO apaga a de baixo (o dublê, como o aparelho na
// montagem, apaga). É a diferença que escondia o defeito 6.
const achatarComoNaWeb = (estilo: unknown): Props => {
  const saida: Props = {};
  const visitar = (v: unknown) => {
    if (!v) return;
    if (Array.isArray(v)) { v.forEach(visitar); return; }
    if (typeof v === "object") for (const [k, x] of Object.entries(v)) if (x !== undefined) saida[k] = x;
  };
  visitar(estilo);
  return saida;
};

afterEach(() => { __definirPlataforma("android"); });

describe("1 · a Screen no navegador não exige SafeAreaProvider", () => {
  it("sem provedor acima, no navegador ela leva o próprio, com as medidas zeradas", () => {
    __definirPlataforma("web");
    render(<Envolve><Screen><Text>Painel</Text></Screen></Envolve>);
    const provedores = __instancias("SafeAreaProvider");
    expect(provedores).toHaveLength(1);
    expect((provedores[0].initialMetrics as {insets: Props}).insets).toEqual({top: 0, right: 0, bottom: 0, left: 0});
  });

  it("com provedor acima, não põe outro; no aparelho, nunca põe", () => {
    __definirPlataforma("web");
    render(<SafeAreaInsetsContext.Provider value={{top: 0, right: 0, bottom: 0, left: 0}}>
      <Envolve><Screen><Text>Painel</Text></Screen></Envolve>
    </SafeAreaInsetsContext.Provider>);
    expect(__instancias("SafeAreaProvider")).toHaveLength(0);
    __definirPlataforma("android");
    render(<Envolve><Screen><Text>Painel</Text></Screen></Envolve>);
    expect(__instancias("SafeAreaProvider")).toHaveLength(0);
  });
});

describe("2 · o DatePicker no modo hora escreve a hora e pede um horário", () => {
  it("vazio, diz \"Pick a time\" — e não \"Pick a date\"", () => {
    const {container} = render(<Envolve><DatePicker mode="time" /></Envolve>);
    expect(container.textContent).toContain("Pick a time");
    expect(container.textContent).not.toContain("Pick a date");
  });

  it("com valor e sem `format`, escreve a hora e os minutos, e não a data", () => {
    const {container} = render(<Envolve><DatePicker mode="time" value={new Date(2026, 9, 24, 14, 30)} /></Envolve>);
    expect(container.textContent).toMatch(/30/);
    expect(container.textContent).not.toContain("2026");
  });

  it("no navegador, o nome do campo vazio também é o do horário", () => {
    __definirPlataforma("web");
    const {container} = render(<Envolve><DatePicker mode="time" /></Envolve>);
    expect(container.querySelector("input")?.getAttribute("aria-label")).toBe("Pick a time");
  });

  it("o modo data continua igual", () => {
    const {container} = render(<Envolve><DatePicker /></Envolve>);
    expect(container.textContent).toContain("Pick a date");
  });
});

describe("3 e 4 · o IconButton e o ThemeToggle não prometem `leading` nem `trailing`", () => {
  it("o tipo tira as duas props (o ThemeToggle herda o tipo do IconButton)", () => {
    const fonte = readFileSync("packages/native/src/actions.tsx", "utf8");
    const tipo = /export interface IconButtonProps extends Omit<ButtonProps, ([^>]*)>/.exec(fonte)?.[1] ?? "";
    expect(tipo).toContain('"leading"');
    expect(tipo).toContain('"trailing"');
    expect(fonte).toMatch(/export interface ThemeToggleProps extends Omit<IconButtonProps,/);
  });

  it("mandadas sem o tipo (JavaScript), elas não descem ao Pressable", () => {
    const sobras = {leading: <Text>a</Text>, trailing: <Text>b</Text>} as Props;
    render(<Envolve>
      <IconButton name="plus" label="Add" testID="i" {...sobras} />
      <ThemeToggle testID="t" {...sobras} />
    </Envolve>);
    for (const id of ["i", "t"]) {
      const p = porID("Pressable", id);
      expect(p.testID, id).toBe(id);
      expect("leading" in p || "trailing" in p, id).toBe(false);
    }
  });
});

describe("5 · o Switch lê o `align`", () => {
  it("`start` põe o trilho na primeira linha; `center` (o padrão) no meio", () => {
    render(<Envolve>
      <Switch testID="s" align="start" label="A long label that wraps onto a second line on a narrow phone" />
      <Switch testID="c" label="Short" />
    </Envolve>);
    expect(StyleSheet.flatten(porID("Pressable", "s").style).alignItems).toBe("flex-start");
    expect(StyleSheet.flatten(porID("Pressable", "c").style).alignItems).toBe("center");
  });
});

describe("6 · o BottomNav `edge` não leva a sombra nem a camada da flutuante, no navegador", () => {
  const itens = [{id: "a", label: "Home", icon: "house" as const}, {id: "b", label: "Settings", icon: "gear" as const}];
  const barra = () => __instancias("View").filter((v) => v.accessibilityLabel === "Main").at(-1) ?? {};

  it("edge: sem boxShadow, sem zIndex, no fluxo — mesmo juntando como o react-native-web", () => {
    render(<Envolve><BottomNav variant="edge" items={itens} current="a" /></Envolve>);
    const e = achatarComoNaWeb(barra().style);
    expect(e.boxShadow).toBeUndefined();
    expect(e.zIndex).toBeUndefined();
    expect(e.position).not.toBe("absolute");
    expect(e.bottom).toBeUndefined();
    expect(e.backgroundColor).toBe(claro.color.background);
  });

  it("floating continua flutuando, com a sombra e a camada", () => {
    render(<Envolve><BottomNav items={itens} current="a" /></Envolve>);
    const f = achatarComoNaWeb(barra().style);
    expect(f.position).toBe("absolute");
    expect(f.zIndex).toBe(claro.size.zSticky);
    expect(f.boxShadow).toBeDefined();
    expect(f.backgroundColor).toBe(claro.color.card);
  });
});

describe("7 · o Checkbox, o Radio e o Switch têm o toque de 44", () => {
  it("com rótulo, a linha tem altura mínima de 44 (o `targetMin`)", () => {
    render(<Envolve>
      <Checkbox testID="k" label="Remember me" />
      <Radio testID="r" label="Express" />
      <Switch testID="s" label="Notifications" />
    </Envolve>);
    for (const id of ["k", "r", "s"]) {
      expect(StyleSheet.flatten(porID("Pressable", id).style).minHeight, id).toBe(claro.size.targetMin);
    }
  });

  it("sem rótulo, a largura também chega a 44", () => {
    render(<Envolve>
      <Checkbox testID="k" accessibilityLabel="Select row" />
      <Radio testID="r" accessibilityLabel="Pick" />
    </Envolve>);
    for (const id of ["k", "r"]) {
      const e = StyleSheet.flatten(porID("Pressable", id).style);
      expect(e.minHeight, id).toBe(claro.size.targetMin);
      expect(e.minWidth, id).toBe(claro.size.targetMin);
    }
  });
});

describe("8 · o SearchField sem `value`: o X apaga o texto", () => {
  it("o texto interno comanda o campo, e o X o zera", () => {
    render(<Envolve><SearchField testID="b" placeholder="Search" /></Envolve>);
    act(() => { (porID("TextInput", "b-campo").onChangeText as (v: string) => void)("fuel"); });
    expect(porID("TextInput", "b-campo").value).toBe("fuel");
    act(() => { (porID("Pressable", "b-limpar").onPress as () => void)(); });
    expect(porID("TextInput", "b-campo").value).toBe("");
  });
});
