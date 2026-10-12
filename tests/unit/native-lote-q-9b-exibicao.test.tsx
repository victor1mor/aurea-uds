// 0.32.0, passo 9b — quatro peças do nativo da referência: `Accordion`, `ScrollShadow`, `SkeletonGroup`
// e `PressableFeedback` (`packages/native/src/exibicao.tsx`), e o `Skeleton` que lê o grupo.
//
// Cada número abaixo é o do pacote nativo da referência (a classe virada em dp), conferido contra o
// token que o dá — se o token mudar de valor, a medida deixa de ser a dela e o teste reprova.
//
// ⚠ O dublê de `react-native` não tem `Animated.spring` nem `Animated.createAnimatedComponent`. Os
// dois entram AQUI, só neste arquivo, com `??=` — o dia em que o dublê os ganhar, valem os dele.
// O `spring` registra a configuração ao lado das do `timing` (`__configsDeAnimacao`), para o teste
// perguntar a mola que a seta pediu.
import {render, act} from "@testing-library/react";
import {beforeAll, beforeEach, describe, expect, it} from "vitest";
import * as React from "react";
import {
  Animated, ScrollView, StyleSheet, Text as TextoCru,
  __animacoes, __configsDeAnimacao, __definirReduceMotion, __instancias,
} from "./native-stubs/react-native";
import {AureaProvider, Skeleton, comOpacidade, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";
import {Accordion, PressableFeedback, ScrollShadow, SkeletonGroup} from "../../packages/native/src/exibicao.js";

beforeAll(() => {
  const A = Animated as unknown as Record<string, unknown>;
  A.spring ??= (_v: unknown, cfg: Record<string, unknown>) => {
    __configsDeAnimacao().push({...cfg, __mola: true});
    return {start: () => { __animacoes().push({parado: false}); }, stop: () => {}};
  };
  A.createAnimatedComponent ??= (C: unknown) => C;
});

const t = resolverTokens("dark", "comfortable");
type P = Record<string, unknown>;
const plano = (s: unknown) => (StyleSheet.flatten(s as never) ?? {}) as P;
const valor = (v: unknown) => (v as {valor: number}).valor;
/** A última instância desenhada (o dublê guarda uma por render). */
const ultimo = (nome: string, f: (p: P) => boolean = () => true): P => {
  const l = __instancias(nome).filter(f);
  if (!l.length) throw new Error(`nenhum ${nome} desenhado`);
  return l[l.length - 1];
};
const porId = (nome: string, id: string) => ultimo(nome, (p) => p.testID === id);
const texto = (conteudo: string) => plano(ultimo("Text", (p) => p.children === conteudo).style);
const assentar = async () => { await act(async () => { await Promise.resolve(); }); };

// A seta registra o que recebeu: tamanho e cor.
let setas: Array<{size?: number; color?: string}> = [];
const Seta = (p: {size?: number; color?: string}) => { setas.push(p); return null; };
const ICONES = criarRegistroDeIcones({"caret-down": Seta as never});
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES} fontFamilies={FONTES}>{children}</AureaProvider>;
const montar = (no: React.ReactNode) => render(<Envolve>{no}</Envolve>);

beforeEach(() => { setas = []; });

const ITENS = [
  {id: "a", title: "Pergunta A", content: "Resposta A"},
  {id: "b", title: "Pergunta B", content: "Resposta B"},
  {id: "c", title: "Pergunta C", content: "Resposta C", disabled: true},
];
const tocar = (id: string) => act(() => { (porId("Pressable", id).onPress as () => void)(); });

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("Accordion · as medidas do nativo da referência", () => {
  it("gatilho: 16 em cima e embaixo, 12 dos lados, 16 entre título e seta, na cápsula", () => {
    montar(<Accordion testID="acc" items={ITENS} />);
    const g = plano(porId("Pressable", "acc-a").style);
    expect([g.paddingVertical, g.paddingHorizontal, g.gap]).toEqual([16, 12, 16]);
    expect([g.paddingVertical, g.paddingHorizontal, g.gap]).toEqual([t.size.space4, t.size.space3, t.size.space4]);
    expect([g.flexDirection, g.alignItems, g.justifyContent]).toEqual(["row", "center", "space-between"]);
    expect(g.borderRadius).toBe(t.size.radiusControl);
  });

  it("resposta: 12 dos lados e 16 embaixo; `surface` põe 20 dos lados no gatilho e na resposta", () => {
    const r = montar(<Accordion testID="acc" items={ITENS} defaultValue={["a"]} />);
    const resp = plano(porId("Animated.View", "acc-a-content").style);
    expect([resp.paddingHorizontal, resp.paddingBottom]).toEqual([t.size.space3, t.size.space4]);
    r.rerender(<Envolve><Accordion testID="acc" variant="surface" items={ITENS} defaultValue={["a"]} /></Envolve>);
    expect(plano(porId("Pressable", "acc-a").style).paddingHorizontal).toBe(20);
    expect(plano(porId("Animated.View", "acc-a-content").style).paddingHorizontal).toBe(t.size.space5);
  });

  it("`surface` é o cartão: canto 22, fundo de cartão e a sombra de superfície", () => {
    montar(<Accordion testID="acc" variant="surface" items={ITENS} />);
    const raiz = plano(porId("View", "acc").style);
    expect([raiz.borderRadius, raiz.borderCurve, raiz.backgroundColor]).toEqual([t.size.radiusCard, "continuous", t.color.card]);
    expect(raiz.boxShadow).toEqual([...t.shadowLayers.shadowSm]);
    // O `default` não tem caixa nenhuma.
    montar(<Accordion testID="d" items={ITENS} />);
    expect(plano(porId("View", "d").style).backgroundColor).toBeUndefined();
  });

  it("um fio ENTRE os itens (nenhum depois do último), na borda da Aurea; no `surface`, 12 de recuo", () => {
    montar(<Accordion items={ITENS} />);
    const fios = () => __instancias("View").map((p) => plano(p.style))
      .filter((e) => e.height === t.size.borderWidth && e.backgroundColor === t.color.border);
    expect(fios()).toHaveLength(ITENS.length - 1);
    expect(fios()[0].marginHorizontal).toBeUndefined();
    montar(<Accordion variant="surface" items={ITENS} />);
    expect(fios().at(-1)!.marginHorizontal).toBe(t.size.space3);
  });

  it("título 16 em peso médio, resposta 16 esmaecida e folgada, seta `caret-down` de 16 na cor do texto", () => {
    montar(<Accordion items={ITENS} defaultValue={["a"]} />);
    expect([texto("Pergunta A").fontSize, texto("Pergunta A").fontFamily]).toEqual([16, "Ui500"]);
    const r = texto("Resposta A");
    expect([r.fontSize, r.color, r.lineHeight]).toEqual([16, t.color.mutedForeground, 16 * t.size.leadingRelaxed]);
    expect(setas[0]).toEqual({size: 16, color: t.color.foreground});
    expect(setas[0].size).toBe(t.size.iconSm);
  });
});

describe("Accordion · abrir e fechar", () => {
  const aberto = (r: ReturnType<typeof montar>, id: string) => !!r.container.querySelector(`[data-testid="acc-${id}-content"]`);

  it("um de cada vez: abrir o B fecha o A; tocar no aberto fecha (o `isCollapsible` da referência)", () => {
    const visto: string[][] = [];
    const r = montar(<Accordion testID="acc" items={ITENS} onValueChange={(v) => visto.push(v)} />);
    expect(aberto(r, "a")).toBe(false);
    tocar("acc-a");
    expect(aberto(r, "a")).toBe(true);
    tocar("acc-b");
    expect([aberto(r, "a"), aberto(r, "b")]).toEqual([false, true]);
    tocar("acc-b");
    expect(aberto(r, "b")).toBe(false);
    expect(visto).toEqual([["a"], ["b"], []]);
  });

  it("`multiple` deixa vários abertos", () => {
    const r = montar(<Accordion testID="acc" multiple items={ITENS} defaultValue={["a"]} />);
    tocar("acc-b");
    expect([aberto(r, "a"), aberto(r, "b")]).toEqual([true, true]);
  });

  it("`value` deixa o estado com quem usa: o toque só avisa", () => {
    const visto: string[][] = [];
    const r = montar(<Accordion testID="acc" items={ITENS} value={[]} onValueChange={(v) => visto.push(v)} />);
    tocar("acc-a");
    expect(visto).toEqual([["a"]]);
    expect(aberto(r, "a")).toBe(false);
    r.rerender(<Envolve><Accordion testID="acc" items={ITENS} value={["a"]} /></Envolve>);
    expect(aberto(r, "a")).toBe(true);
  });

  it("o item desligado não abre, é anunciado desligado e fica apagado", () => {
    const r = montar(<Accordion testID="acc" items={ITENS} />);
    tocar("acc-c");
    expect(aberto(r, "c")).toBe(false);
    const g = porId("Pressable", "acc-c");
    expect(g.disabled).toBe(true);
    expect((g.accessibilityState as P).disabled).toBe(true);
    expect(plano(g.style).opacity).toBe(t.size.opacityDisabled);
  });
});

describe("Accordion · acessibilidade", () => {
  it("o gatilho é um botão que diz se está aberto, dentro de um título", () => {
    montar(<Accordion testID="acc" items={ITENS} />);
    const g = porId("Pressable", "acc-a");
    expect(g.accessibilityRole).toBe("button");
    expect([(g.accessibilityState as P).expanded, g["aria-expanded"]]).toEqual([false, false]);
    expect(__instancias("View").filter((p) => p.accessibilityRole === "header")).toHaveLength(ITENS.length);
    tocar("acc-a");
    expect((porId("Pressable", "acc-a").accessibilityState as P).expanded).toBe(true);
  });

  it("o realce do dedo é a cápsula da web: 3% do texto no fechado, nada no aberto, o neutro no `surface`", () => {
    const r = montar(<Accordion testID="acc" items={ITENS} defaultValue={["b"]} />);
    expect(plano(porId("Pressable", "acc-a").__estiloTocando).backgroundColor).toBe(comOpacidade(t.color.foreground, 0.03));
    expect(plano(porId("Pressable", "acc-b").__estiloTocando).backgroundColor).toBeUndefined();
    r.rerender(<Envolve><Accordion testID="acc" variant="surface" items={ITENS} /></Envolve>);
    expect(plano(porId("Pressable", "acc-a").__estiloTocando).backgroundColor).toBe(t.color.secondary);
  });
});

describe("Accordion · movimento", () => {
  it("a seta gira de 0 a −180°, na mola da referência; a resposta entra esmaecendo em 200 ms", async () => {
    montar(<Accordion testID="acc" items={ITENS} />);
    await assentar();
    const giro = plano(ultimo("Animated.View", (p) => Array.isArray(plano(p.style).transform)).style).transform as P[];
    expect((giro[0].rotate as P).__interpolado).toEqual(["0deg", "-180deg"]);
    tocar("acc-a");
    const configs = __configsDeAnimacao();
    expect(configs.find((c) => c.__mola)).toMatchObject({toValue: 1, damping: 140, stiffness: 1000, mass: 4, useNativeDriver: true});
    expect(configs.find((c) => c.duration === 200)).toMatchObject({toValue: 1, useNativeDriver: true});
    // A resposta NASCE em 0 — zerada depois, um quadro cheio passaria antes do esmaecer.
    expect(valor(plano(porId("Animated.View", "acc-a-content").style).opacity)).toBe(0);
  });

  it("o item que começa aberto não esmaece nem gira ao montar", async () => {
    montar(<Accordion testID="acc" items={ITENS} defaultValue={["a"]} />);
    await assentar();
    expect(__configsDeAnimacao()).toHaveLength(0);
    expect(valor(plano(porId("Animated.View", "acc-a-content").style).opacity)).toBe(1);
  });

  it("com «menos movimento», abre sem mola e sem esmaecer", async () => {
    __definirReduceMotion(true);
    montar(<Accordion testID="acc" items={ITENS} />);
    await assentar();
    tocar("acc-a");
    expect(__animacoes()).toHaveLength(0);
    expect(__configsDeAnimacao()).toHaveLength(0);
    expect(valor(plano(porId("Animated.View", "acc-a-content").style).opacity)).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("ScrollShadow · o fio no lugar do degradê", () => {
  const rolar = (y: number, visivel = 200, conteudo = 500) => act(() => {
    (porId("ScrollView", "lista").onScroll as (e: unknown) => void)({nativeEvent: {
      contentOffset: {x: 0, y}, layoutMeasurement: {width: 300, height: visivel}, contentSize: {width: 300, height: conteudo},
    }});
  });
  const medir = (visivel: number, conteudo: number, horizontal = false) => act(() => {
    const r = porId("ScrollView", "lista");
    (r.onLayout as (e: unknown) => void)({nativeEvent: {layout: horizontal ? {width: visivel, height: 50} : {width: 300, height: visivel}}});
    (r.onContentSizeChange as (w: number, h: number) => void)(horizontal ? conteudo : 300, horizontal ? 50 : conteudo);
  });
  const fio = (lado: "start" | "end") => porId("Animated.View", `sombra-${lado}`);
  const aceso = (lado: "start" | "end") => valor(plano(fio(lado).style).opacity);

  it("no topo, só o fio de baixo; no meio, os dois; no fim, só o de cima", async () => {
    __definirReduceMotion(true);
    montar(<ScrollShadow testID="sombra"><ScrollView testID="lista" /></ScrollShadow>);
    await assentar();
    expect([aceso("start"), aceso("end")]).toEqual([0, 0]);
    medir(200, 500);
    expect([aceso("start"), aceso("end")]).toEqual([0, 1]);
    rolar(100);
    expect([aceso("start"), aceso("end")]).toEqual([1, 1]);
    rolar(300);
    expect([aceso("start"), aceso("end")]).toEqual([1, 0]);
  });

  it("o fio é uma linha de 1 na cor de borda, colada na ponta; fora do toque e do leitor de tela", () => {
    montar(<ScrollShadow testID="sombra"><ScrollView testID="lista" /></ScrollShadow>);
    const cima = plano(fio("start").style);
    expect(cima).toMatchObject({position: "absolute", top: 0, left: 0, right: 0, height: t.size.borderWidth, backgroundColor: t.color.border});
    expect(cima.height).toBe(1);
    expect(plano(fio("end").style)).toMatchObject({position: "absolute", bottom: 0, height: t.size.borderWidth});
    expect([fio("start").pointerEvents, fio("start").accessibilityElementsHidden]).toEqual(["none", true]);
  });

  it("o conteúdo que cabe não acende fio; a sobra menor que o próprio fio também não", async () => {
    __definirReduceMotion(true);
    montar(<ScrollShadow testID="sombra"><ScrollView testID="lista" /></ScrollShadow>);
    await assentar();
    medir(500, 300);
    expect([aceso("start"), aceso("end")]).toEqual([0, 0]);
    rolar(0.33, 200, 200.5);
    expect([aceso("start"), aceso("end")]).toEqual([0, 0]);
  });

  it("na horizontal (pelo `horizontal` do rolador), os fios ficam à esquerda e à direita", async () => {
    __definirReduceMotion(true);
    montar(<ScrollShadow testID="sombra"><ScrollView testID="lista" horizontal /></ScrollShadow>);
    await assentar();
    expect(plano(fio("start").style)).toMatchObject({left: 0, top: 0, bottom: 0, width: t.size.borderWidth});
    expect(plano(fio("end").style)).toMatchObject({right: 0, width: t.size.borderWidth});
    medir(200, 500, true);
    expect([aceso("start"), aceso("end")]).toEqual([0, 1]);
  });

  it("`visibility` escolhe a ponta; `none` e `isEnabled={false}` apagam tudo", async () => {
    __definirReduceMotion(true);
    const r = montar(<ScrollShadow testID="sombra" visibility="top"><ScrollView testID="lista" /></ScrollShadow>);
    await assentar();
    medir(200, 500);
    rolar(100);
    expect([aceso("start"), aceso("end")]).toEqual([1, 0]);
    r.rerender(<Envolve><ScrollShadow testID="sombra" visibility="none"><ScrollView testID="lista" /></ScrollShadow></Envolve>);
    expect([aceso("start"), aceso("end")]).toEqual([0, 0]);
    r.rerender(<Envolve><ScrollShadow testID="sombra" isEnabled={false}><ScrollView testID="lista" /></ScrollShadow></Envolve>);
    expect([aceso("start"), aceso("end")]).toEqual([0, 0]);
  });

  it("o `inverted` (a conversa) troca as pontas", async () => {
    __definirReduceMotion(true);
    montar(<ScrollShadow testID="sombra"><ScrollView testID="lista" inverted /></ScrollShadow>);
    await assentar();
    medir(200, 500);
    expect([aceso("start"), aceso("end")]).toEqual([1, 0]);
  });

  it("os avisos do app chegam depois dos dele, e o aviso de rolagem é um por quadro (16)", () => {
    const vistos: string[] = [];
    montar(<ScrollShadow testID="sombra">
      <ScrollView testID="lista" onScroll={() => vistos.push("rolou")} onLayout={() => vistos.push("mediu")}
        onContentSizeChange={() => vistos.push("cresceu")} />
    </ScrollShadow>);
    expect(porId("ScrollView", "lista").scrollEventThrottle).toBe(16);
    medir(200, 500);
    rolar(10);
    expect(vistos).toEqual(["mediu", "cresceu", "rolou"]);
  });

  it("com movimento, o fio entra esmaecendo em 200 ms, no motor nativo", async () => {
    montar(<ScrollShadow testID="sombra"><ScrollView testID="lista" /></ScrollShadow>);
    await assentar();
    medir(200, 500);
    expect(__configsDeAnimacao()).toEqual([expect.objectContaining({toValue: 1, duration: 200, useNativeDriver: true})]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("SkeletonGroup · um comando para vários esqueletos", () => {
  const caixas = () => __instancias("Animated.View").filter((p) => p.accessibilityElementsHidden === true);
  const Tres = () => <>
    <Skeleton testID="e1"><TextoCru>Um</TextoCru></Skeleton>
    <Skeleton testID="e2"><TextoCru>Dois</TextoCru></Skeleton>
    <SkeletonGroup.Item testID="e3"><TextoCru>Três</TextoCru></SkeletonGroup.Item>
  </>;

  it("carregando, os de dentro são caixas; com `isLoading={false}`, o conteúdo deles", () => {
    const r = montar(<SkeletonGroup testID="g"><Tres /></SkeletonGroup>);
    expect(["e1", "e2", "e3"].map((id) => !!r.container.querySelector(`[data-testid="${id}"]`))).toEqual([true, true, true]);
    expect(r.container.textContent).toBe("");
    r.rerender(<Envolve><SkeletonGroup testID="g" isLoading={false}><Tres /></SkeletonGroup></Envolve>);
    expect(r.container.querySelector('[data-testid="e1"]')).toBeNull();
    expect(r.container.textContent).toBe("UmDoisTrês");
  });

  it("o PULSO é um só: três caixas, um laço, o mesmo valor nas três (sem o grupo, três laços)", async () => {
    montar(<SkeletonGroup><Tres /></SkeletonGroup>);
    await assentar();
    expect(__animacoes()).toHaveLength(1);
    const ops = ["e1", "e2", "e3"].map((id) => plano(porId("Animated.View", id).style).opacity);
    expect(new Set(ops).size).toBe(1);
    montar(<Tres />);
    await assentar();
    expect(__animacoes()).toHaveLength(1 + 3);
  });

  it("cada um troca o seu: o item com `isLoading` fica caixa no grupo carregado", () => {
    const r = montar(<SkeletonGroup isLoading={false}>
      <Skeleton testID="fica" isLoading><TextoCru>Escondido</TextoCru></Skeleton>
      <Skeleton testID="sai"><TextoCru>Visto</TextoCru></Skeleton>
    </SkeletonGroup>);
    expect(r.container.querySelector('[data-testid="fica"]')).not.toBeNull();
    expect(r.container.textContent).toBe("Visto");
  });

  it("`animation=\"none\"` para o pulso do grupo; e o item que pede o pulso pulsa sozinho", async () => {
    montar(<SkeletonGroup animation="none"><Skeleton testID="parada" /></SkeletonGroup>);
    await assentar();
    expect(__animacoes()).toHaveLength(0);
    expect(valor(plano(porId("Animated.View", "parada").style).opacity)).toBe(1);
    montar(<SkeletonGroup animation="none"><Skeleton testID="viva" animation="pulse" /></SkeletonGroup>);
    await assentar();
    expect(__animacoes()).toHaveLength(1);
  });

  it("`isSkeletonOnly` some com o grupo inteiro quando carregou", () => {
    const r = montar(<SkeletonGroup testID="g" isSkeletonOnly isLoading={false}><Tres /></SkeletonGroup>);
    expect(r.container.querySelector('[data-testid="g"]')).toBeNull();
    expect(r.container.textContent).toBe("");
  });

  it("com «menos movimento», nenhum pulso", async () => {
    __definirReduceMotion(true);
    montar(<SkeletonGroup><Tres /></SkeletonGroup>);
    await assentar();
    expect(__animacoes()).toHaveLength(0);
  });

  it("o conteúdo que chega esmaece (na duração lenta da Aurea); o que já estava lá, não", async () => {
    const r = montar(<SkeletonGroup><Tres /></SkeletonGroup>);
    await assentar();
    const antes = __configsDeAnimacao().length;
    r.rerender(<Envolve><SkeletonGroup isLoading={false}><Tres /></SkeletonGroup></Envolve>);
    const novas = __configsDeAnimacao().slice(antes);
    expect(novas).toHaveLength(3);
    expect(novas[0]).toMatchObject({toValue: 1, duration: t.size.durationSlow, useNativeDriver: true});
    const envoltorio = ultimo("Animated.View", (p) => !p.testID && !p.accessibilityElementsHidden);
    expect(valor(plano(envoltorio.style).opacity)).toBe(0);
    montar(<SkeletonGroup isLoading={false}><Skeleton><TextoCru>Já</TextoCru></Skeleton></SkeletonGroup>);
    await assentar();
    expect(valor(plano(ultimo("Animated.View").style).opacity)).toBe(1);
  });

  it("o `Skeleton` sozinho continua o de sempre; `SkeletonGroup.Item` é o próprio `Skeleton`", async () => {
    expect(SkeletonGroup.Item).toBe(Skeleton);
    montar(<Skeleton testID="so" />);
    await assentar();
    expect(__animacoes()).toHaveLength(1);
    // O dublê guarda uma instância por desenho; a pergunta é QUANTAS caixas, não quantos desenhos.
    expect(new Set(caixas().map((p) => p.testID))).toEqual(new Set(["so"]));
    expect(plano(porId("Animated.View", "so").style).height).toBe(t.size.space4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("PressableFeedback · a escala, o realce e a onda da referência", () => {
  const raiz = () => porId("Pressable", "toque");
  const medirRaiz = (largura: number, altura: number) =>
    act(() => { (raiz().onLayout as (e: unknown) => void)({nativeEvent: {layout: {width: largura, height: altura}}}); });
  const apertar = () => act(() => { (raiz().onPressIn as (e: unknown) => void)({nativeEvent: {}}); });
  const soltar = () => act(() => { (raiz().onPressOut as (e: unknown) => void)({nativeEvent: {}}); });
  const escalaDe = (p: P) => ((plano(p.style).transform as P[])[0].scale);

  it("é um botão para o leitor de tela, com o recorte da raiz; o papel troca", () => {
    montar(<PressableFeedback testID="toque"><TextoCru>Abrir</TextoCru></PressableFeedback>);
    expect(raiz().accessibilityRole).toBe("button");
    expect(plano(raiz().style).overflow).toBe("hidden");
    montar(<PressableFeedback testID="toque" accessibilityRole="link" />);
    expect(raiz().accessibilityRole).toBe("link");
  });

  it("desligado: não toca, anunciado desligado, apagado na reação inerte da Aurea (0,45)", () => {
    montar(<PressableFeedback testID="toque" isDisabled accessibilityState={{selected: true}} />);
    expect(raiz().disabled).toBe(true);
    expect(raiz().accessibilityState).toEqual({selected: true, disabled: true});
    expect(plano(raiz().style).opacity).toBe(0.45);
  });

  it("0,985 numa peça de 300; proporcional à largura (150 → 0,97); solta, volta a 1", async () => {
    __definirReduceMotion(true);
    montar(<PressableFeedback testID="toque" />);
    await assentar();
    medirRaiz(300, 60);
    apertar();
    expect(valor(escalaDe(raiz()))).toBeCloseTo(0.985, 6);
    soltar();
    expect(valor(escalaDe(raiz()))).toBe(1);
    medirRaiz(150, 60);
    apertar();
    expect(valor(escalaDe(raiz()))).toBeCloseTo(0.97, 6);
  });

  it("com movimento, a escala desliza em 300 ms no motor nativo; nada anima ao montar", async () => {
    montar(<PressableFeedback testID="toque" />);
    await assentar();
    medirRaiz(300, 60);
    expect(__configsDeAnimacao()).toHaveLength(0);
    apertar();
    expect(__configsDeAnimacao()).toEqual([expect.objectContaining({duration: 300, useNativeDriver: true})]);
    expect(__configsDeAnimacao()[0].toValue).toBeCloseTo(0.985, 6);
  });

  it("`animation={false}` tira a escala da raiz, e a `Scale` leva a escala para um filho", async () => {
    __definirReduceMotion(true);
    montar(<PressableFeedback testID="toque" animation={false}>
      <PressableFeedback.Scale testID="filho"><TextoCru>x</TextoCru></PressableFeedback.Scale>
    </PressableFeedback>);
    await assentar();
    medirRaiz(300, 60);
    apertar();
    expect(plano(raiz().style).transform).toBeUndefined();
    expect(valor(escalaDe(porId("Animated.View", "filho")))).toBeCloseTo(0.985, 6);
  });

  it("o realce cobre a peça na cor do texto e vai a 10% com o dedo em cima (200 ms com movimento)", async () => {
    __definirReduceMotion(true);
    montar(<PressableFeedback testID="toque"><PressableFeedback.Highlight testID="realce" /></PressableFeedback>);
    await assentar();
    const realce = () => porId("Animated.View", "realce");
    expect(plano(realce().style)).toMatchObject({position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.color.foreground});
    expect([realce().pointerEvents, realce().accessibilityElementsHidden]).toEqual(["none", true]);
    expect(valor(plano(realce().style).opacity)).toBe(0);
    apertar();
    expect(valor(plano(realce().style).opacity)).toBe(0.1);
    soltar();
    expect(valor(plano(realce().style).opacity)).toBe(0);
  });

  it("a onda nasce no dedo: círculo de 1,25 × a diagonal, centrado no toque, 0 → 10% → 0", async () => {
    __definirReduceMotion(true);
    montar(<PressableFeedback testID="toque"><PressableFeedback.Ripple testID="onda" /></PressableFeedback>);
    await assentar();
    medirRaiz(300, 150);
    const raio = Math.hypot(300, 150) * 1.25;
    const camadas = () => __instancias("Animated.View").slice(-2);
    const c0 = plano(camadas()[0].style);
    expect([c0.width, c0.height, c0.borderRadius]).toEqual([raio * 2, raio * 2, raio]);
    expect((c0.opacity as P).__interpolado).toEqual([0, 0.1, 0]);
    act(() => { (porId("View", "onda").onTouchStart as (e: unknown) => void)({nativeEvent: {locationX: 100, locationY: 40}}); });
    const ativa = camadas().map((p) => plano(p.style)).find((e) => valor((e.transform as P[])[0].translateX) !== 0)!;
    expect(valor((ativa.transform as P[])[0].translateX)).toBeCloseTo(100 - raio, 6);
    expect(valor((ativa.transform as P[])[1].translateY)).toBeCloseTo(40 - raio, 6);
  });

  it("com movimento, a onda dura pelo tamanho: 1000 ms numa diagonal de 450, no mínimo 750", async () => {
    montar(<PressableFeedback testID="toque"><PressableFeedback.Ripple testID="onda" /></PressableFeedback>);
    await assentar();
    medirRaiz(270, 360); // diagonal 450
    act(() => { (porId("View", "onda").onTouchStart as (e: unknown) => void)({nativeEvent: {locationX: 1, locationY: 1}}); });
    expect(__configsDeAnimacao().at(-1)).toMatchObject({toValue: 1, duration: 1000, useNativeDriver: true});
    medirRaiz(30, 40); // diagonal 50
    act(() => { (porId("View", "onda").onTouchEnd as () => void)(); });
    expect(__configsDeAnimacao().at(-1)).toMatchObject({toValue: 2, duration: 750});
  });

  it("o primeiro toque não acende a camada parada: só a onda no ar termina de sumir", async () => {
    // A camada que nunca foi usada está em 0. Mandá-la a 2 com movimento a faz passar pelo pico (10%)
    // e piscar no canto da peça — o defeito que o comentário do `tocou` descreve.
    montar(<PressableFeedback testID="toque"><PressableFeedback.Ripple testID="onda" /></PressableFeedback>);
    await assentar();
    medirRaiz(270, 360);
    act(() => { (porId("View", "onda").onTouchStart as (e: unknown) => void)({nativeEvent: {locationX: 1, locationY: 1}}); });
    expect(__configsDeAnimacao().map((c) => c.toValue)).toEqual([1]);
    // Com o dedo ainda em cima, o segundo toque manda a onda viva sumir (a 2) e acende a outra.
    act(() => { (porId("View", "onda").onTouchStart as (e: unknown) => void)({nativeEvent: {locationX: 2, locationY: 2}}); });
    expect(__configsDeAnimacao().map((c) => c.toValue)).toEqual([1, 2, 1]);
  });

  it("`\"disable-all\"` desliga a escala, o realce e a onda", () => {
    montar(<PressableFeedback testID="toque" animation="disable-all">
      <PressableFeedback.Highlight testID="realce" /><PressableFeedback.Ripple testID="onda" />
    </PressableFeedback>);
    expect(plano(raiz().style).transform).toBeUndefined();
    expect(__instancias("Animated.View").filter((p) => p.testID === "realce")).toHaveLength(0);
    expect(__instancias("View").filter((p) => p.testID === "onda")).toHaveLength(0);
  });

  it("as partes fora de um `PressableFeedback` acusam", () => {
    const erro = console.error;
    console.error = () => {};
    try {
      expect(() => montar(<PressableFeedback.Highlight />)).toThrow(/PressableFeedback/);
    } finally { console.error = erro; }
  });
});
