// Lote E — os achados do app de 25/09/2026, no nativo. Cada teste escolhe a entrada que reprova
// no código de antes.
import {act, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __avisarTeclado, __instancias} from "./native-stubs/react-native";
import {SafeAreaInsetsContext, __definirMetricasIniciais} from "./native-stubs/react-native-safe-area-context";
import {AureaProvider, Badge, BottomSheet, Button, Card, Checkbox, Combobox, Radio, Select, SegmentedControl, Tabs, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const estiloDo = (primitivo: string, filtro: (p: Record<string, unknown>) => boolean = () => true) =>
  StyleSheet.flatten((__instancias(primitivo).filter(filtro).at(-1) ?? {}).style);

// E1 · a perna das letras. O IBM Plex sobe 1,025 em e desce 0,275 em: precisa de 1,3 em de linha
// para caber inteiro, e no Android o React Native corta o que passa. Com entrelinha 1,0 o "g" do
// "Lançar um gasto" perdia a perna.
describe("E1 · Button: a entrelinha do rótulo cabe a letra inteira", () => {
  it.each(["xs", "sm", "md", "lg", "xl"] as const)("%s: linha ≥ 1,3 × a letra, e cabe no botão", (size) => {
    render(<Envolve><Button size={size}>Lançar um gasto</Button></Envolve>);
    const txt = estiloDo("Text");
    expect(txt.lineHeight).toBeGreaterThanOrEqual(txt.fontSize * 1.3);
    const alturas = {xs: "controlHXs", sm: "controlHSm", md: "controlHMd", lg: "controlHLg", xl: "controlHXl"} as const;
    expect(txt.lineHeight).toBeLessThanOrEqual(t.size[alturas[size]]);
  });
});

// E3 · a fila do SegmentedControl e das Tabs não centralizava: o rolador ocupa a largura toda, e o
// conteúdo ficava colado à esquerda lá dentro (medido pelo app: 335 de rolador, 281 de fileira).
// O dublê não calcula layout; o que se prova aqui é o pedido ao motor — o recipiente do conteúdo
// cresce até a largura do rolador e posiciona a cápsula. A prova de aparelho é o bloco E3 do
// `apps/native-smoke`.
const ITENS = [{value: "s", label: "Semana"}, {value: "m", label: "Mês"}, {value: "a", label: "Ano"}];
const rolador = () => StyleSheet.flatten(__instancias("ScrollView").at(-1)?.contentContainerStyle);
describe("E3 · SegmentedControl e Tabs: justify quando cabem", () => {
  it("padrão: como sempre, o conteúdo não cresce (start)", () => {
    render(<Envolve><SegmentedControl items={ITENS} value="s" /></Envolve>);
    expect(rolador()).toEqual({flexGrow: 0});
  });
  it.each([["center", "center"], ["end", "flex-end"]] as const)("SegmentedControl justify=%s", (justify, css) => {
    render(<Envolve><SegmentedControl items={ITENS} value="s" justify={justify} /></Envolve>);
    expect(rolador()).toEqual({flexGrow: 1, justifyContent: css});
  });
  it("Tabs aceita o mesmo justify — a causa era a mesma fila", () => {
    render(<Envolve><Tabs tabs={[{id: "a", label: "A", content: null}]} value="a" justify="center" /></Envolve>);
    expect(rolador()).toEqual({flexGrow: 1, justifyContent: "center"});
  });
});

// E5 · a marca do Radio (e do Checkbox, que é a mesma peça) ficava presa no topo do rótulo:
// `alignItems: "flex-start"` e um `marginTop: 1` fixo. O padrão agora é o do HeroUI Native —
// centralizado —, e `align="start"` põe a marca no meio da PRIMEIRA linha, pela conta dos tokens.
const linhaDoControle = () => StyleSheet.flatten(__instancias("Pressable").at(-1)?.style);
const marca = () => StyleSheet.flatten(__instancias("View").find((v) => {
  const e = StyleSheet.flatten(v.style);
  return e && e.borderWidth === t.size.borderWidth && e.width === e.height && e.width > 0;
})?.style);
describe("E5 · Radio e Checkbox: a marca na altura do texto", () => {
  it.each([["Radio", Radio], ["Checkbox", Checkbox]] as const)("%s: centralizado por padrão, sem o marginTop fixo", (_n, C) => {
    render(<Envolve><C label="Me lembre às 9h" checked={false} /></Envolve>);
    expect(linhaDoControle().alignItems).toBe("center");
    expect(marca().marginTop ?? 0).toBe(0);
  });
  it("align=\"start\": a marca no meio da primeira linha", () => {
    render(<Envolve><Radio label="Rótulo longo" description="que quebra em várias linhas" align="start" checked /></Envolve>);
    expect(linhaDoControle().alignItems).toBe("flex-start");
    const linha = t.size.textBase * t.size.leadingNormal;
    const lado = t.size.controlHMd / 2;
    expect(marca().marginTop).toBe(Math.max(0, (linha - lado) / 2));
  });
});

// E4 · a lista do Select e a do Combobox não rolavam no Android, e a folha descia atrás dos botões
// do sistema. Suspeita do app, NÃO confirmada no aparelho: um `View` em volta da lista reivindicava
// o toque, e no Android o dono do toque intercepta os movimentos seguintes. O aceite de verdade é o
// bloco E4 do `apps/native-smoke` (50 itens, rolar até o último). Aqui se cobra o que o código
// promete: ninguém em volta da lista reivindica o toque. ~~e as três folhas de baixo recuam a borda
// de baixo com o `SafeAreaView`~~ — o `SafeAreaView` não recuava dentro do `Modal`; ver o E10 abaixo.
const CINQUENTA = Array.from({length: 50}, (_, i) => ({value: `v${i}`, label: `Item ${i + 1}`}));
const reivindicam = () => [...__instancias("View"), ...__instancias("Animated.View")]
  .filter((p) => typeof p.onStartShouldSetResponder === "function");
describe("E4 · as folhas de baixo: nada em volta da lista reivindica o toque", () => {
  it("Select", () => {
    render(<Envolve><Select items={CINQUENTA} value="v0" label="Ano" /></Envolve>);
    expect(reivindicam()).toHaveLength(0);
  });
  it("Combobox", () => {
    render(<Envolve><Combobox items={CINQUENTA} /></Envolve>);
    expect(reivindicam()).toHaveLength(0);
  });
});

// E10 (0.12.1) · as folhas desciam atrás dos botões do Android. Causa lida no fonte da biblioteca
// (5.9.1): dentro do `Modal` o `SafeAreaView` não acha o provider, mede a si mesmo, e com altura 0
// não calcula recuo nenhum — e o do `Combobox` e o do `BottomSheet` eram vazios. Agora o recuo vem
// do contexto do React (como no HeroUI Native) e vira um espaço de altura conhecida no fim da folha.
// Entrada que reprova no código de antes: um recuo de 48 no contexto — antes nada media 48.
const RECUO = 48;
const espacos = (h: number) => __instancias("View").filter((p) => StyleSheet.flatten(p.style)?.height === h);
const FOLHAS: [string, () => React.ReactElement][] = [
  ["Select", () => <Select items={CINQUENTA} value="v0" label="Ano" />],
  ["Combobox", () => <Combobox items={CINQUENTA} />],
  ["BottomSheet", () => <BottomSheet open onClose={() => {}} title="Filtros">x</BottomSheet>],
];
describe("E10 · as folhas de baixo terminam acima da barra do sistema", () => {
  it.each(FOLHAS)("%s: o recuo do contexto vira espaço no fim da folha", (_n, folha) => {
    render(<Envolve><SafeAreaInsetsContext.Provider value={{top: 0, right: 0, bottom: RECUO, left: 0}}>
      {folha()}</SafeAreaInsetsContext.Provider></Envolve>);
    expect(espacos(RECUO)).toHaveLength(1);
    expect(__instancias("SafeAreaView")).toHaveLength(0);
  });
  it.each(FOLHAS)("%s: sem provider no app, vale a medida da abertura", (_n, folha) => {
    __definirMetricasIniciais(30);
    render(<Envolve>{folha()}</Envolve>);
    expect(espacos(30)).toHaveLength(1);
  });
  it.each(FOLHAS)("%s: a folha cobre a tela toda, e é por isso que o recuo da janela é o dela", (_n, folha) => {
    render(<Envolve>{folha()}</Envolve>);
    const modal = __instancias("Modal").at(-1)!;
    expect(modal.navigationBarTranslucent).toBe(true);
    expect(modal.statusBarTranslucent).toBe(true);
  });
  it("Combobox: com o teclado aberto a folha sobe acima dele, e o recuo vai a zero", () => {
    render(<Envolve><SafeAreaInsetsContext.Provider value={{top: 0, right: 0, bottom: RECUO, left: 0}}>
      <Combobox items={CINQUENTA} /></SafeAreaInsetsContext.Provider></Envolve>);
    expect(espacos(RECUO)).toHaveLength(1);
    act(() => __avisarTeclado("keyboardDidShow"));
    expect(StyleSheet.flatten(__instancias("View").filter((p) => "height" in (StyleSheet.flatten(p.style) ?? {})).at(-1)?.style).height).toBe(0);
    act(() => __avisarTeclado("keyboardDidHide"));
    expect(StyleSheet.flatten(__instancias("View").filter((p) => "height" in (StyleSheet.flatten(p.style) ?? {})).at(-1)?.style).height).toBe(RECUO);
  });
});

// E6 · o campo de busca do Combobox não tinha como pedir o teclado de números: para digitar um ano
// abria o de letras. Agora `searchKeyboardType` chega ao `TextInput` da folha.
describe("E6 · Combobox: o teclado do campo de busca", () => {
  const busca = () => __instancias("TextInput").find((p) => p.testID === "cb-busca");
  it("searchKeyboardType chega ao campo da folha", () => {
    render(<Envolve><Combobox items={CINQUENTA} testID="cb" searchKeyboardType="number-pad" /></Envolve>);
    expect(busca()?.keyboardType).toBe("number-pad");
  });
  it("sem ele, o teclado de texto de sempre", () => {
    render(<Envolve><Combobox items={CINQUENTA} testID="cb" /></Envolve>);
    expect(busca()?.keyboardType).toBeUndefined();
  });
});

// E8 · com algo escolhido, o X e a setinha do Combobox ficavam em alturas diferentes no Android.
// Medido no Yoga 3 (o motor do RN), não no dublê: com `height: "100%"` numa fila sem altura, a
// errata de compatibilidade dava à seta 25 de altura e o centro dela 5 abaixo do X. O conserto
// dá à seta a MESMA caixa do X (altura mínima `targetMin`, conteúdo no meio). Aqui se cobra a
// forma que garante isso; a prova de aparelho é o bloco E8 do `apps/native-smoke`.
describe("E8 · Combobox: o X e a setinha no mesmo centro", () => {
  it("a seta tem a caixa de toque do X: targetMin de altura mínima, sem altura em porcentagem", () => {
    render(<Envolve><Combobox items={CINQUENTA} value={CINQUENTA[0]} testID="cb" /></Envolve>);
    const seta = StyleSheet.flatten(__instancias("Pressable").find((p) => p.testID === "cb-seta")?.style);
    const xAlvo = StyleSheet.flatten(__instancias("Pressable").find((p) => p.testID === "cb-limpar")?.style);
    expect(seta.height).toBeUndefined();
    expect(seta.minHeight).toBe(t.size.targetMin);
    expect(seta.justifyContent).toBe("center");
    expect(xAlvo.minHeight).toBe(seta.minHeight);
  });
});

// Badge · o mesmo corte do E1 (entrelinha 1,0), e as medidas passam a ser as do `Chip` do HeroUI
// Native (ordem do Victor de 25/09/2026: "se o HeroUI já tem, vamos usar as deles"). O `xs` não
// existe no HeroUI e fica com a medida nossa (16 de altura), só com a linha consertada.
describe("Badge · as medidas do Chip do HeroUI Native, e a letra inteira", () => {
  const letra = () => estiloDo("Text");
  const selo = () => estiloDo("View", (p) => {
    const e = StyleSheet.flatten(p.style);
    return !!e && e.borderRadius === t.size.radiusControl;
  });
  it.each([
    ["sm", "textXs", "space4", "space2", "space05"],
    ["md", "textSm", "space5", "space3", "space1"],
  ] as const)("%s: letra, linha e recheio do HeroUI", (size, fonte, linha, px, py) => {
    render(<Envolve><Badge size={size}>Pago</Badge></Envolve>);
    expect(letra().fontSize).toBe(t.size[fonte]);
    expect(letra().lineHeight).toBe(t.size[linha]);
    expect(letra().lineHeight).toBeGreaterThanOrEqual(letra().fontSize * 1.3);
    expect(selo().paddingHorizontal).toBe(t.size[px]);
    expect(selo().paddingVertical).toBe(t.size[py]);
  });
  it("lg: letra 16, linha 24, recheio 16 × 6 (6 = space1 × 1,5, a conta do HeroUI)", () => {
    render(<Envolve><Badge size="lg">Pago</Badge></Envolve>);
    expect(letra().fontSize).toBe(t.size.textBase);
    expect(letra().lineHeight).toBe(t.size.space6);
    expect(selo().paddingHorizontal).toBe(t.size.space4);
    expect(selo().paddingVertical).toBe(t.size.space1 * 1.5);
  });
  it("xs é nosso: 16 de altura, letra 12 e linha 16", () => {
    render(<Envolve><Badge size="xs" count={3} /></Envolve>);
    expect(letra().fontSize).toBe(t.size.textXs);
    expect(letra().lineHeight).toBe(t.size.space4);
    expect(selo().minHeight).toBe(t.size.space4);
  });
});

// E7 · dentro do `Card variant="brand"` todo botão saía na tinta do cartão, e o tom era ignorado.
// O Victor quis as cores. Medido: a letra sobre o próprio fundo passa em todo tom e tema, mas o
// fundo contra o amarelo não se distingue (sucesso no escuro 1,00). Então o botão CHEIO com tom
// mantém a cor e ganha contorno na tinta; o contornado e o sem fundo seguem na tinta (a letra
// colorida direto no amarelo não passa de 4,5).
describe("E7 · os tons dentro do cartão da marca", () => {
  const caixaDo = (texto: string) => {
    const views = __instancias("View").map((v) => StyleSheet.flatten(v.style)).filter((e) => e && e.height && e.paddingHorizontal);
    return views.at(-1) ?? {};
  };
  it("cheio com tom: a cor do tom, com contorno na tinta do cartão", () => {
    render(<Envolve><Card variant="brand" action={<Button appearance="solid" tone="success">Confirmar</Button>} /></Envolve>);
    const c = caixaDo("Confirmar");
    expect(c.backgroundColor).toBe(t.color.success);
    expect(c.borderColor).toBe(t.color.primaryForeground);
  });
  it("sem fundo com tom: continua na tinta (a letra colorida não se lê no amarelo)", () => {
    render(<Envolve><Card variant="brand" action={<Button appearance="ghost" tone="danger">Agora não</Button>} /></Envolve>);
    expect(estiloDo("Text").color).toBe(t.color.primaryForeground);
  });
  it("fora do cartão nada muda: cheio verde sem contorno", () => {
    render(<Envolve><Button appearance="solid" tone="success">Confirmar</Button></Envolve>);
    const c = caixaDo("Confirmar");
    expect(c.backgroundColor).toBe(t.color.success);
    expect(c.borderColor).toBe("transparent");
  });
});
