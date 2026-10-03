// A BARRA FICA PARADA QUANDO SE TROCA DE ABA — pedido do Victor, 03/10/2026: *"me incomoda o bottom
// nav todo se mexer [...] quero ele estático, apenas os botões dinâmicos"*.
//
// Medido antes do conserto, na bancada com o `react-native-web` de verdade: no `circle-bold` com
// `width="content"` a barra ia de 249 a 257 de largura conforme a aba escolhida, e por estar no
// centro, andava inteira. As duas causas, as mesmas da web (`geometry.spec`, "a barra não se mexe"):
//   1. o item escolhido do `circle-bold` tinha medida própria (56, contra o conteúdo dos outros);
//   2. o rótulo escolhido engrossava (500 contra 400), e texto mais grosso é texto mais largo.
//
// O dublê não mede texto, então a prova é a das MEDIDAS que o código pede: para cada aba escolhida,
// toda caixa da barra pede as mesmas medidas, e todo rótulo o mesmo tamanho e peso. Só a pintura
// (cor, fundo, sombra) pode mudar. O código de antes reprova nos dois pontos.
//
// O `expand` é o único em que o botão escolhido cresce. Nele a prova é outra: a vaga do escolhido e
// a dos outros são sempre as mesmas, então a soma — a barra — não muda.
import {cleanup, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, BottomNav, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({house: Glifo as never, bell: Glifo as never, user: Glifo as never});
const ITENS = [{id: "a", label: "Início", icon: "house"}, {id: "b", label: "Avisos", icon: "bell", badge: 3},
  {id: "c", label: "Perfil", icon: "user"}] as never;
const NOMES = ["Início", "Avisos", "Perfil"];
// Uma família por peso, como no aparelho (a Atkinson tem um arquivo por peso). Sem isto os quatro
// pesos caem na mesma família crua, e o peso que muda com a escolha não apareceria no estilo.
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};

// O que decide TAMANHO e LUGAR. Borda fica de fora: no React Native ela é desenhada dentro da caixa.
const LAYOUT = ["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "flex", "flexGrow",
  "flexShrink", "flexBasis", "flexDirection", "padding", "paddingHorizontal", "paddingVertical",
  "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "margin", "marginHorizontal",
  "marginVertical", "marginBottom", "gap", "position", "top", "right", "bottom", "left", "alignSelf"];
const medidas = (estilo: unknown) => {
  const e = (StyleSheet.flatten(estilo as never) ?? {}) as Record<string, unknown>;
  return LAYOUT.filter((k) => e[k] !== undefined).map((k) => `${k}=${String(e[k])}`).join(",");
};
// A barra inteira, em texto: cada caixa e cada rótulo, na ordem em que aparecem.
function barra(indicator: string, width: string, current: string) {
  __limpar();
  render(<AureaProvider icons={ICONES} fontFamilies={FONTES}>
    <BottomNav items={ITENS} current={current} indicator={indicator as never} width={width as never} /></AureaProvider>);
  const caixas = [...__instancias("Pressable"), ...__instancias("View")].map((p) => medidas(p.style));
  // Os rótulos das abas (o "3" do contador também é texto, e fica de fora).
  const rotulos = __instancias("Text").filter((p) => NOMES.includes(p.children as string)).map((p) => {
    const e = (StyleSheet.flatten(p.style as never) ?? {}) as Record<string, unknown>;
    // O peso no nativo é a FAMÍLIA (a Atkinson tem um arquivo por peso), não o `fontWeight`.
    return `${String(e.fontSize)}/${String(e.fontFamily)}`;
  });
  const abas = __instancias("Pressable").map((p) => ({escolhida: p.accessibilityState?.selected === true, medidas: medidas(p.style)}));
  cleanup();
  return {caixas, rotulos, abas};
}

const PARADOS = ["none", "subtle", "pill", "circle", "circle-raised", "circle-outline", "circle-bold", "capsule"] as const;
const LARGURAS = ["full", "content"] as const;

describe("BottomNav · a barra fica parada quando se troca de aba", () => {
  for (const indicator of PARADOS) for (const width of LARGURAS) {
    it(`${indicator} · ${width}: nenhuma caixa nem rótulo muda de medida`, () => {
      const [a, b, c] = ["a", "b", "c"].map((atual) => barra(indicator, width, atual));
      expect(a.caixas.length).toBeGreaterThan(5);
      expect(b.caixas).toEqual(a.caixas);
      expect(c.caixas).toEqual(a.caixas);
      expect(b.rotulos).toEqual(a.rotulos);
      expect(c.rotulos).toEqual(a.rotulos);
    });
  }
  it("o peso do rótulo é o mesmo escolhido ou não: 500 (o Label medium do Material 3)", () => {
    const {rotulos} = barra("none", "content", "b");
    expect(rotulos).toHaveLength(3);
    expect(new Set(rotulos).size).toBe(1);
    // 12, o do Telegram e o `text-xs` da web (a altura do Telegram, logo abaixo).
    expect(rotulos[0]).toBe(`${t.size.textXs}/Ui500`);
  });
});

describe("BottomNav · expand: os botões andam, a barra não", () => {
  for (const width of LARGURAS) {
    it(`${width}: a vaga do escolhido e a dos outros são sempre as mesmas`, () => {
      const vagas = ["a", "b", "c"].map((atual) => barra("expand", width, atual).abas);
      const doEscolhido = new Set(vagas.flatMap((v) => v.filter((x) => x.escolhida).map((x) => x.medidas)));
      const dosOutros = new Set(vagas.flatMap((v) => v.filter((x) => !x.escolhida).map((x) => x.medidas)));
      expect(doEscolhido.size).toBe(1);
      expect(dosOutros.size).toBe(1);
    });
  }
  it("a vaga do escolhido é fixa: ícone + vão + 80 para o nome + recheio dos dois lados = 136", () => {
    const {abas} = barra("expand", "content", "b");
    const escolhida = abas.find((x) => x.escolhida)!.medidas;
    expect(escolhida).toContain(`width=${t.size.iconLg + t.size.space2 + t.size.space20 + t.size.space3 * 2}`);
    expect(t.size.iconLg + t.size.space2 + t.size.space20 + t.size.space3 * 2).toBe(136);
    // E os outros, no `content`, têm a largura do alvo de toque.
    for (const x of abas.filter((y) => !y.escolhida)) expect(x.medidas).toContain(`width=${t.size.targetMin}`);
  });
  it("o nome dos não escolhidos sai da tela e fica para o leitor de tela", () => {
    __limpar();
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="b" indicator="expand" /></AureaProvider>);
    const abas = __instancias("Pressable");
    expect(abas.map((p) => p.accessibilityLabel)).toEqual(["Início", undefined, "Perfil"]);
    // Só o escolhido desenha o nome.
    expect(__instancias("Text").map((p) => p.children).filter((x) => NOMES.includes(x as string))).toEqual(["Avisos"]);
  });
});

describe("BottomNav · capsule: a cápsula de 56 × 32 em todos os itens, pintada só no escolhido", () => {
  it("a moldura de todos tem 56 × 32, e só a do escolhido é amarela", () => {
    __limpar();
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="b" indicator="capsule" /></AureaProvider>);
    const molduras = __instancias("View").map((p) => StyleSheet.flatten(p.style) ?? {})
      .filter((e) => e.width === 56 && e.height === 32);
    expect(molduras).toHaveLength(3);
    expect(molduras.map((e) => e.backgroundColor)).toEqual([undefined, t.color.primary, undefined]);
  });
  it("o contador fica no canto do ícone, e não no da cápsula", () => {
    __limpar();
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator="capsule" /></AureaProvider>);
    const contador = __instancias("View").map((p) => StyleSheet.flatten(p.style) ?? {})
      .find((e) => e.position === "absolute" && e.top === -t.size.space05)!;
    expect(contador.right).toBe((56 - 32) / 2 - t.size.space05);
  });
});

// A ALTURA DO TELEGRAM — 03/10/2026, pedido do Victor: *"ainda acho ele muito largo comparado a
// bottomnav como do telegram"*, e "largo" é a grossura. Medido no fonte do Telegram para Android
// 12.10.6: pílula de 56, botão de 48, ícone de 24, nome de 12 numa linha de 16. A nossa media 73 no
// `circle-bold` (na bancada, com o `react-native-web`): o nome saía em 14 com linha de 21, e havia 4
// de recheio em cima e embaixo. O código de antes reprova as três travas.
describe("BottomNav · a altura do Telegram", () => {
  const estiloDoNome = (indicator: string) => {
    __limpar();
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator={indicator as never} /></AureaProvider>);
    return (StyleSheet.flatten(__instancias("Text").find((p) => p.children === "Início")!.style as never) ?? {}) as Record<string, number>;
  };
  it.each(["none", "pill", "circle-bold", "capsule"])("%s: o nome é 12 numa linha de 16", (indicator) => {
    const e = estiloDoNome(indicator);
    expect([e.fontSize, e.lineHeight]).toEqual([t.size.textXs, t.size.textXs + t.size.space1]);
    expect(t.size.textXs + t.size.space1).toBe(16);
  });
  it("o recheio de cima e de baixo do botão é space05", () => {
    __limpar();
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator="pill" /></AureaProvider>);
    for (const p of __instancias("Pressable")) {
      const e = (StyleSheet.flatten(p.style as never) ?? {}) as Record<string, number>;
      expect(e.paddingVertical).toBe(t.size.space05);
    }
  });
  it("o disco do circle-bold: space1 em volta, sem vão entre o ícone e o nome", () => {
    __limpar();
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="a" indicator="circle-bold" /></AureaProvider>);
    const discos = __instancias("View").map((p) => (StyleSheet.flatten(p.style as never) ?? {}) as Record<string, number>)
      .filter((e) => e.width === 56 && e.borderRadius === t.size.radiusFull);
    expect(discos).toHaveLength(3);
    for (const d of discos) expect([d.paddingVertical, d.paddingHorizontal, d.gap]).toEqual([t.size.space1, t.size.space1, 0]);
  });
});
