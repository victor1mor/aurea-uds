// OS 8 DEFEITOS DAS PEÇAS DO NATIVO (bloco 1, 24/10/2026), achados ao montar as páginas do nativo no site — o Victor:
// "Pode consertar os 8 defeitos das peças do nativo agora, no bloco 1." Cada `describe` é um defeito, e cada um prova o
// CONTRATO no dublê: o que a peça pede ao React Native (estilo, props, provedor). O que o navegador faz com isso foi visto
// na página do site. Provado contra o defeito: com o código de antes (`47533577`), reprovam todos os oito (o 7, na forma
// de hoje — ver o comentário dele).
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

// O 1 também mudou no mesmo dia: a primeira versão punha o `SafeAreaProvider` da biblioteca, que no navegador mede a caixa
// contra a janela e dava folga de baixo errada a tela que não começa no topo dela; o Victor escolheu, na bancada, "a
// folga zerada, sem medir". Provado contra as duas versões de antes: a do `47533577` (nada no contexto) e a do
// `68e6274d` (o provedor que mede, que no dublê não preenche o contexto) reprovam.
describe("1 · a Screen no navegador não exige SafeAreaProvider", () => {
  const lidas: unknown[] = [];
  const LeFolga = () => { lidas.push(React.useContext(SafeAreaInsetsContext)); return null; };

  it("sem provedor acima, no navegador ela põe a folga ZERADA no contexto — sem o provedor que mede", () => {
    __definirPlataforma("web");
    lidas.length = 0;
    render(<Envolve><Screen><LeFolga /></Screen></Envolve>);
    expect(lidas.at(-1)).toEqual({top: 0, right: 0, bottom: 0, left: 0});
    expect(__instancias("SafeAreaProvider")).toHaveLength(0);
  });

  it("com provedor acima, usa o dele; no aparelho, não põe nada", () => {
    __definirPlataforma("web");
    lidas.length = 0;
    render(<SafeAreaInsetsContext.Provider value={{top: 0, right: 0, bottom: 34, left: 0}}>
      <Envolve><Screen><LeFolga /></Screen></Envolve>
    </SafeAreaInsetsContext.Provider>);
    expect(lidas.at(-1)).toEqual({top: 0, right: 0, bottom: 34, left: 0});
    __definirPlataforma("android");
    lidas.length = 0;
    render(<Envolve><Screen><LeFolga /></Screen></Envolve>);
    expect(lidas.at(-1)).toBeNull();
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

// O 7 mudou no mesmo dia (24/10/2026): a primeira versão deu à linha a altura de 44, e o Victor, vendo a bancada do
// celular com a referência ao lado, decidiu *"Fica igual à referência: o desenho de antes e o mesmo toque a mais
// invisível que ela usa (6 em volta)"*. No nativo dela, a caixa e o rádio têm `hitSlop` 6; o interruptor, nenhum.
// Provado contra os dois: o código de antes (sem folga) e o do 44 (com a altura mínima) reprovam.
describe("7 · o Checkbox e o Radio têm o toque a mais da referência; o Switch, como ela, não", () => {
  it("a caixa e o rádio: 6 de toque a mais em volta, invisível", () => {
    render(<Envolve>
      <Checkbox testID="k" label="Remember me" />
      <Radio testID="r" label="Express" />
      <Checkbox testID="k2" accessibilityLabel="Select row" />
    </Envolve>);
    for (const id of ["k", "r", "k2"]) expect(porID("Pressable", id).hitSlop, id).toBe(6);
  });

  it("o desenho e a medida da linha não mudam: nada de altura nem largura mínima", () => {
    render(<Envolve>
      <Checkbox testID="k" label="Remember me" />
      <Radio testID="r" accessibilityLabel="Pick" />
      <Switch testID="s" label="Notifications" />
    </Envolve>);
    for (const id of ["k", "r", "s"]) {
      const e = StyleSheet.flatten(porID("Pressable", id).style);
      expect(e.minHeight, id).toBeUndefined();
      expect(e.minWidth, id).toBeUndefined();
    }
  });

  it("o interruptor não ganha toque a mais (o da referência não tem)", () => {
    render(<Envolve><Switch testID="s" label="Notifications" /></Envolve>);
    expect(porID("Pressable", "s").hitSlop).toBeUndefined();
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

// O AMARELO DO BOTÃO NA BARRA DE BAIXO (24/10/2026, decisão do Victor, vendo as formas desenhadas: "O amarelo por trás,
// como o botão, na barra de baixo e na aba escolhida"): sem `indicator`, a aba escolhida ganha a cápsula amarela atrás
// do ícone — o padrão era `none`, só a cor no ícone e no nome (no claro, o azul). Provado contra o padrão de antes: reprova.
describe("a barra de baixo, por padrão, marca a aba escolhida com o amarelo por trás", () => {
  const itens = [{id: "a", label: "Home", icon: "house" as const}, {id: "b", label: "Settings", icon: "gear" as const}];
  it("sem `indicator`: há uma cápsula da cor da marca, e o nome não é o azul", () => {
    const {container} = render(<Envolve><BottomNav items={itens} current="a" /></Envolve>);
    const fundos = __instancias("View").map((v) => StyleSheet.flatten(v.style)?.backgroundColor);
    expect(fundos).toContain(claro.color.primary);
    const letras = __instancias("Text").map((v) => StyleSheet.flatten(v.style)?.color);
    expect(letras).not.toContain(claro.color.primaryEmphasis);
    expect(container.textContent).toContain("Home");
  });
  it("com `indicator=\"none\"` explícito, continua sem cápsula", () => {
    render(<Envolve><BottomNav indicator="none" items={itens} current="a" /></Envolve>);
    const fundos = __instancias("View").map((v) => StyleSheet.flatten(v.style)?.backgroundColor);
    expect(fundos).not.toContain(claro.color.primary);
  });
});
