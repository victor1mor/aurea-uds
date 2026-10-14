// 0.32.0, passo 9b · três peças de escolher no nativo, com o nome e a API da web: `Slider`,
// `OTPField` e `TagGroup`. As medidas, os estados e o comportamento são os do pacote nativo da
// referência, escritos com os tokens que dão o mesmo número; a cor e o canto são os da Aurea.
// O dublê não calcula layout nem toque: prova-se o que a peça pede ao motor e o que ela faz com o
// gesto que o teste entrega (o `PanResponder` do dublê guarda a configuração). A prova de aparelho
// é a bancada.
// Provado contra o defeito, um de cada vez: sem a trava da vizinha a faixa cruza; sem o passo o
// valor sai fracionado; sem a pergunta de "menos movimento" a bolinha e o cursor animam; com o X
// dentro da parte que escolhe a estrutura reprova; com a casa de 48 × 48 a medida reprova; com o
// colar ingênuo (só filtrar) o código colado depois de dois dígitos sai errado.
import {act, render} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {
  StyleSheet, __animacoes, __configsDeAnimacao, __definirPlataforma, __definirReduceMotion, __instancias,
  type ConfigDeGesto,
} from "./native-stubs/react-native";
import {AureaProvider, Field, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";
import {OTPField, Slider, TagGroup, type AureaTagItem} from "../../packages/native/src/escolha.js";

const t = resolverTokens("dark", "comfortable");
const claro = resolverTokens("light", "comfortable");
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};
// O glifo anota quem foi desenhado e com que lado e cor.
let glifos: Array<{nome: string; size?: number; color?: string}> = [];
const glifo = (nome: string) => ({size, color}: {size?: number; color?: string}) => {
  glifos.push({nome, size, color});
  return null;
};
const ICONES = criarRegistroDeIcones({x: glifo("x"), "x-bold": glifo("x-bold"), tag: glifo("tag")} as never);
const Envolve = ({children, tema = "dark"}: {children: React.ReactNode; tema?: "dark" | "light"}) =>
  <AureaProvider theme={tema} icons={ICONES} fontFamilies={FONTES}>{children}</AureaProvider>;

type Props = Record<string, unknown>;
type Estilo = Record<string, unknown>;
const plano = (p: Props | undefined) => (StyleSheet.flatten((p ?? {}).style as never) ?? {}) as Estilo;
const assentar = async () => { await act(async () => { await Promise.resolve(); }); };
const g = (dx: number, dy = 0) => ({dx, dy, vx: 0, vy: 0});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Slider
// ─────────────────────────────────────────────────────────────────────────────────────────────

// O trilho é o `View` medido que tem gesto; as alças, os `adjustable`. O dublê guarda TODAS as
// renderizações, então o estado de agora é o das últimas.
const trilho = () => __instancias("View").filter((p) => typeof p.onLayout === "function" && p.__gesto).at(-1)!;
const alcas = (n = 1) => __instancias("View").filter((p) => p.accessibilityRole === "adjustable").slice(-n);
const gestoDe = (p: Props) => p.__gesto as ConfigDeGesto;
const preenchimento = () => __instancias("View").filter((p) => p.pointerEvents === "none").at(-1)!;
// Trilho de 328: menos a alça de 28, o curso é 300 — 3 pontos por unidade de 0 a 100.
const medir = (largura = 328, altura = 20) =>
  act(() => { (trilho().onLayout as (e: unknown) => void)({nativeEvent: {layout: {width: largura, height: altura}}}); });
const tocarNoTrilho = (x: number, y = 10) => act(() => {
  const c = gestoDe(trilho());
  c.onPanResponderGrant({nativeEvent: {locationX: x, locationY: y}}, g(0));
});
const soltarNoTrilho = () => act(() => { gestoDe(trilho()).onPanResponderRelease({}, g(0)); });
const arrastar = (i: number, dx: number, dy = 0, n = 1) => {
  const c = gestoDe(alcas(n)[i]);
  act(() => { c.onPanResponderGrant({}, g(0)); });
  act(() => { c.onPanResponderMove({}, g(dx, dy)); });
  act(() => { c.onPanResponderRelease({}, g(dx, dy)); });
};

describe("Slider · as medidas do nativo da referência", () => {
  it("trilho de 20 em cápsula; alça em cápsula de 28 × 20 com a bolinha a 2; 8 entre as partes", () => {
    render(<Envolve><Slider label="Volume" defaultValue={30} testID="s" /></Envolve>);
    const tr = plano(trilho());
    expect([tr.height, tr.width, tr.borderRadius, tr.borderCurve, tr.backgroundColor])
      .toEqual([t.size.space5, "100%", t.size.radiusFull, "continuous", t.color.secondary]);
    expect(tr.height).toBe(20);
    const a = plano(alcas()[0]);
    expect([a.width, a.height, a.padding, a.borderRadius, a.backgroundColor])
      .toEqual([28, 20, t.size.space05, t.size.radiusFull, t.color.controlSelected]);
    const bolinha = plano(__instancias("Animated.View").at(-1));
    expect([bolinha.flex, bolinha.backgroundColor, bolinha.borderRadius]).toEqual([1, t.color.controlSelectedForeground, t.size.radiusFull]);
    expect(bolinha.boxShadow).toEqual([...t.shadowLayers.shadowSm]);
    const raiz = plano(__instancias("View").find((p) => p.testID === "s"));
    expect(raiz.gap).toBe(8);
    expect(plano(preenchimento()).backgroundColor).toBe(t.color.controlSelected);
  });

  it("no tema claro a marca é a do controle marcado (a do `Switch`)", () => {
    render(<Envolve tema="light"><Slider label="Volume" defaultValue={30} /></Envolve>);
    expect(plano(alcas()[0]).backgroundColor).toBe(claro.color.controlSelected);
    expect(plano(__instancias("Animated.View").at(-1)).backgroundColor).toBe(claro.color.controlSelectedForeground);
  });

  it("na vertical o trilho tem 20 de largura e a alça é 20 × 28, e nunca some sem altura no pai", () => {
    render(<Envolve><Slider label="Volume" defaultValue={30} orientation="vertical" /></Envolve>);
    const tr = plano(trilho());
    expect([tr.width, tr.height, tr.flex, tr.minHeight]).toEqual([20, undefined, 1, 10 * t.remInDp]);
    const a = plano(alcas()[0]);
    expect([a.width, a.height]).toEqual([20, 28]);
  });

  it("a área de toque chega aos 44: o trilho por cima e por baixo, a alça nos dois eixos", () => {
    render(<Envolve><Slider label="Volume" /></Envolve>);
    expect(trilho().hitSlop).toEqual({top: 12, bottom: 12});
    expect(alcas()[0].hitSlop).toEqual({top: 12, bottom: 12, left: 8, right: 8});
    expect(20 + 12 * 2).toBe(t.size.targetMin);
    expect(28 + 8 * 2).toBe(t.size.targetMin);
  });
});

describe("Slider · posição, toque e arrasto", () => {
  it("depois de medir o trilho, a alça e o preenchimento seguem o valor (a alça não sai do trilho)", () => {
    render(<Envolve><Slider label="Volume" defaultValue={50} /></Envolve>);
    medir();
    expect(plano(alcas()[0]).left).toBe(150);
    const p = plano(preenchimento());
    // O preenchimento cobre a alça inteira: do começo até o fim dela.
    expect([p.left, p.width, p.top, p.bottom]).toEqual([0, 150 + 28, 0, 0]);
  });

  it("tocar no trilho leva a alça até ali, no passo, e compromete ao soltar", () => {
    const mudou = vi.fn(), salvou = vi.fn();
    render(<Envolve><Slider label="Volume" defaultValue={10} step={5} onValueChange={mudou} onValueCommitted={salvou} /></Envolve>);
    medir();
    // x = 14 (meia alça) + 62% de 300 → 62, que no passo de 5 vira 60.
    tocarNoTrilho(14 + 186);
    expect(mudou).toHaveBeenLastCalledWith(60);
    expect(salvou).not.toHaveBeenCalled();
    soltarNoTrilho();
    expect(salvou).toHaveBeenCalledWith(60);
    expect(plano(alcas()[0]).left).toBe(180);
  });

  it("arrastar a alça anda a partir de onde ela está, sem pular, e só no passo", () => {
    const mudou = vi.fn(), salvou = vi.fn();
    render(<Envolve><Slider label="Volume" defaultValue={50} step={5} onValueChange={mudou} onValueCommitted={salvou} /></Envolve>);
    medir();
    const c = gestoDe(alcas()[0]);
    act(() => { c.onPanResponderGrant({}, g(0)); });
    expect(mudou).not.toHaveBeenCalled();
    act(() => { c.onPanResponderMove({}, g(6)); });   // +2 → 52 → fica no 50
    expect(mudou).not.toHaveBeenCalled();
    act(() => { c.onPanResponderMove({}, g(9)); });   // +3 → 53 → 55
    expect(mudou).toHaveBeenLastCalledWith(55);
    act(() => { c.onPanResponderMove({}, g(600)); }); // passa do fim → 100
    expect(mudou).toHaveBeenLastCalledWith(100);
    act(() => { c.onPanResponderRelease({}, g(600)); });
    expect(salvou).toHaveBeenCalledWith(100);
  });

  it("o passo decimal não deixa resto de vírgula flutuante", () => {
    const mudou = vi.fn();
    render(<Envolve><Slider label="Opacidade" defaultValue={0.2} min={0} max={1} step={0.1} onValueChange={mudou} /></Envolve>);
    medir();
    arrastar(0, 30);   // +0,1
    expect(mudou).toHaveBeenLastCalledWith(0.3);
  });

  it("na faixa, uma alça não passa da outra: para nela", () => {
    const mudou = vi.fn();
    const {unmount} = render(<Envolve><Slider label="Preço" defaultValue={[20, 80]} onValueChange={mudou} /></Envolve>);
    medir();
    arrastar(0, 300, 0, 2);
    expect(mudou).toHaveBeenLastCalledWith([80, 80]);
    unmount();
    // E a de cima não desce abaixo da de baixo.
    render(<Envolve><Slider label="Preço" defaultValue={[20, 80]} onValueChange={mudou} /></Envolve>);
    medir();
    arrastar(1, -300, 0, 2);
    expect(mudou).toHaveBeenLastCalledWith([20, 20]);
  });

  it("duas alças no mesmo ponto: o primeiro movimento decide quem anda", () => {
    const mudou = vi.fn();
    render(<Envolve><Slider label="Preço" defaultValue={[50, 50]} onValueChange={mudou} /></Envolve>);
    medir();
    arrastar(1, -30, 0, 2);   // pegou a de cima, foi para trás: anda a de baixo
    expect(mudou).toHaveBeenLastCalledWith([40, 50]);
  });

  it("tocar no trilho move a alça mais perto do toque", () => {
    const mudou = vi.fn();
    render(<Envolve><Slider label="Preço" defaultValue={[20, 80]} onValueChange={mudou} /></Envolve>);
    medir();
    tocarNoTrilho(14 + 270);   // 90 → a de cima
    expect(mudou).toHaveBeenLastCalledWith([20, 90]);
    soltarNoTrilho();
    tocarNoTrilho(14 + 30);    // 10 → a de baixo
    expect(mudou).toHaveBeenLastCalledWith([10, 90]);
  });

  it("na vertical o valor cresce para cima", () => {
    const mudou = vi.fn();
    render(<Envolve><Slider label="Volume" defaultValue={50} orientation="vertical" onValueChange={mudou} /></Envolve>);
    medir(20, 328);
    expect(plano(alcas()[0]).bottom).toBe(150);
    arrastar(0, 0, -30);
    expect(mudou).toHaveBeenLastCalledWith(60);
    // Tocar a 194 do pé do trilho (y = 134 de cima) → 60.
    tocarNoTrilho(10, 328 - 194);
    soltarNoTrilho();
    expect(mudou).toHaveBeenLastCalledWith(60);
  });

  it("controlado: mostra o valor de fora e avisa o pedido", () => {
    const mudou = vi.fn();
    const {rerender} = render(<Envolve><Slider label="Volume" value={40} onValueChange={mudou} /></Envolve>);
    medir();
    arrastar(0, 30);
    expect(mudou).toHaveBeenLastCalledWith(50);
    // Quem guarda é a tela: sem ela mudar o `value`, a alça fica no 40.
    expect(plano(alcas()[0]).left).toBe(120);
    rerender(<Envolve><Slider label="Volume" value={50} onValueChange={mudou} /></Envolve>);
    expect(plano(alcas()[0]).left).toBe(150);
  });
});

describe("Slider · o que se lê", () => {
  const textos = () => __instancias("Text").map((p) => p.children);

  it("o rótulo e o valor na linha de cima; o valor em 14 médio, com algarismos da mesma largura", () => {
    render(<Envolve><Slider label="Volume" defaultValue={30} /></Envolve>);
    expect(textos()).toEqual(expect.arrayContaining(["Volume", "30"]));
    const v = plano(__instancias("Text").find((p) => p.children === "30"));
    expect([v.fontSize, v.fontFamily, v.fontVariant]).toEqual([14, "Ui500", ["tabular-nums"]]);
  });

  it("na faixa os dois valores, com o traço da web; formatados pelo `Intl` com o locale", () => {
    render(<Envolve><Slider label="Preço" defaultValue={[1000, 3000]} min={0} max={5000} locale="pt-BR" /></Envolve>);
    expect(textos()).toContain("1.000 – 3.000");
  });

  it("`showValue={false}` tira o valor; `labelHidden` tira o rótulo da tela e o deixa na alça", () => {
    render(<Envolve><Slider label="Volume" defaultValue={30} showValue={false} labelHidden /></Envolve>);
    expect(textos()).not.toContain("30");
    expect(textos()).not.toContain("Volume");
    expect(alcas()[0].accessibilityLabel).toBe("Volume");
  });

  it("cada alça é `adjustable`, com o valor formatado e os dois passos do leitor de tela", () => {
    const mudou = vi.fn(), salvou = vi.fn();
    render(<Envolve>
      <Slider label="Opacidade" defaultValue={0.25} min={0} max={1} step={0.01} format={{style: "percent"}} locale="en-US"
              onValueChange={mudou} onValueCommitted={salvou} />
    </Envolve>);
    const a = alcas()[0];
    expect(a.accessible).toBe(true);
    expect(a.accessibilityRole).toBe("adjustable");
    expect(a.accessibilityLabel).toBe("Opacidade");
    // Inteiros de 0 a 100: a ponte do aparelho não aceita fração.
    expect(a.accessibilityValue).toEqual({min: 0, max: 100, now: 25, text: "25%"});
    expect(a.accessibilityActions).toEqual([{name: "increment", label: "Increase"}, {name: "decrement", label: "Decrease"}]);
    act(() => { (a.onAccessibilityAction as (e: unknown) => void)({nativeEvent: {actionName: "increment"}}); });
    expect(mudou).toHaveBeenLastCalledWith(0.26);
    expect(salvou).toHaveBeenLastCalledWith(0.26);
    act(() => { (alcas()[0].onAccessibilityAction as (e: unknown) => void)({nativeEvent: {actionName: "decrement"}}); });
    expect(mudou).toHaveBeenLastCalledWith(0.25);
  });

  it("na faixa cada alça leva o nome dela (`thumbLabels`)", () => {
    render(<Envolve><Slider label="Preço" defaultValue={[20, 80]} thumbLabels={["Mínimo", "Máximo"]} /></Envolve>);
    expect(alcas(2).map((p) => p.accessibilityLabel)).toEqual(["Mínimo", "Máximo"]);
  });

  it("desligado: esmaece, o gesto não pega e o leitor de tela não muda nada", () => {
    const mudou = vi.fn();
    render(<Envolve><Slider label="Volume" defaultValue={30} disabled onValueChange={mudou} testID="s" /></Envolve>);
    expect(plano(__instancias("View").find((p) => p.testID === "s")).opacity).toBe(t.size.opacityDisabled);
    expect(gestoDe(trilho()).onStartShouldSetPanResponder({}, g(0))).toBe(false);
    expect(gestoDe(alcas()[0]).onStartShouldSetPanResponder({}, g(0))).toBe(false);
    const a = alcas()[0];
    expect(a["aria-disabled"]).toBe(true);
    act(() => { (a.onAccessibilityAction as (e: unknown) => void)({nativeEvent: {actionName: "increment"}}); });
    expect(mudou).not.toHaveBeenCalled();
  });
});

describe("Slider · a bolinha encolhe ao arrastar, e respeita menos movimento", () => {
  const pegar = () => { const c = gestoDe(alcas()[0]); act(() => { c.onPanResponderGrant({}, g(0)); }); };

  it("sem a preferência, anima até 90% no tempo rápido", async () => {
    render(<Envolve><Slider label="Volume" defaultValue={30} /></Envolve>);
    await assentar();
    __configsDeAnimacao().length = 0;
    pegar();
    expect(__configsDeAnimacao().map((c) => [c.toValue, c.duration])).toContainEqual([0.9, t.size.durationFast]);
  });

  it("com a preferência, salta para 90% sem animar", async () => {
    __definirReduceMotion(true);
    render(<Envolve><Slider label="Volume" defaultValue={30} /></Envolve>);
    await assentar();
    __configsDeAnimacao().length = 0;
    pegar();
    expect(__configsDeAnimacao()).toHaveLength(0);
    const escala = (plano(__instancias("Animated.View").at(-1)).transform as Array<{scale: {valor: number}}>)[0].scale;
    expect(escala.valor).toBe(0.9);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// OTPField
// ─────────────────────────────────────────────────────────────────────────────────────────────

const campo = () => __instancias("TextInput").at(-1)!;
const digitar = (texto: string) => act(() => { (campo().onChangeText as (s: string) => void)(texto); });
const casas = (n = 6) => __instancias("View").filter((p) => String(p.testID ?? "").startsWith("o-casa-")).slice(-n);

describe("OTPField · as medidas do nativo da referência, com a pele do campo", () => {
  it("casas de 44 × 48 com 8 entre elas, em cápsula, com a borda e o fundo do `Input`", () => {
    render(<Envolve><OTPField length={6} testID="o" /></Envolve>);
    expect(casas()).toHaveLength(6);
    const c = plano(casas()[0]);
    expect([c.width, c.height]).toEqual([t.size.space10 + t.size.space1, t.size.touchControlHMd]);
    expect([c.width, c.height]).toEqual([44, 48]);
    expect([c.borderWidth, c.borderColor, c.backgroundColor, c.borderRadius, c.borderCurve])
      .toEqual([t.size.borderWidth, t.color.borderStrong, t.color.fieldBg, t.size.radiusControl, "continuous"]);
    const fila = plano(__instancias("View").find((p) => p.importantForAccessibility === "no-hide-descendants" && plano(p).gap !== undefined));
    expect(fila.gap).toBe(8);
  });

  it("o dígito é 18 em seminegrito, na linha de 28", () => {
    render(<Envolve><OTPField length={4} defaultValue="7" testID="o" /></Envolve>);
    const d = plano(__instancias("Text").find((p) => p.children === "7"));
    expect([d.fontSize, d.fontFamily, d.lineHeight, d.color]).toEqual([18, "Ui600", 18 * t.size.textLgLeading, t.color.foreground]);
    expect(Math.round(d.lineHeight as number)).toBe(28);
  });
});

describe("OTPField · digitar, colar e apagar", () => {
  it("cada dígito vai para a sua casa", () => {
    const mudou = vi.fn();
    render(<Envolve><OTPField length={6} onValueChange={mudou} testID="o" /></Envolve>);
    digitar("1");
    expect(mudou).toHaveBeenLastCalledWith("1");
    digitar("12");
    expect(mudou).toHaveBeenLastCalledWith("12");
    expect(__instancias("Text").slice(-2).map((p) => p.children)).toEqual(["1", "2"]);
  });

  it("só dígitos entram (o `numeric` da web)", () => {
    const mudou = vi.fn();
    render(<Envolve><OTPField length={6} defaultValue="1" onValueChange={mudou} /></Envolve>);
    digitar("1a");
    expect(mudou).not.toHaveBeenCalled();
  });

  it("colar acha o código no texto, e o código inteiro vence o que já estava escrito", () => {
    const mudou = vi.fn();
    render(<Envolve><OTPField length={6} defaultValue="12" onValueChange={mudou} /></Envolve>);
    digitar("12Seu código é 654321");
    expect(mudou).toHaveBeenLastCalledWith("654321");
  });

  it("colar mais do que cabe corta no tamanho; colar um pedaço continua de onde estava", () => {
    const mudou = vi.fn();
    const {unmount} = render(<Envolve><OTPField length={6} onValueChange={mudou} /></Envolve>);
    digitar("123456789");
    expect(mudou).toHaveBeenLastCalledWith("123456");
    unmount();
    render(<Envolve><OTPField length={6} defaultValue="12" onValueChange={mudou} /></Envolve>);
    digitar("1234");
    expect(mudou).toHaveBeenLastCalledWith("1234");
  });

  it("o campo não tem `maxLength`: ele cortaria o texto colado antes de o código ser achado", () => {
    render(<Envolve><OTPField length={6} /></Envolve>);
    expect(campo().maxLength).toBeUndefined();
  });

  it("apagar tira o último", () => {
    const mudou = vi.fn();
    render(<Envolve><OTPField length={6} value="123" onValueChange={mudou} /></Envolve>);
    digitar("12");
    expect(mudou).toHaveBeenLastCalledWith("12");
  });
});

describe("OTPField · a casa da vez, a máscara e o leitor de tela", () => {
  it("em foco, a primeira casa vazia ganha a borda do foco (2) e o cursor; cheio, nenhuma", () => {
    render(<Envolve><OTPField length={4} defaultValue="12" testID="o" /></Envolve>);
    act(() => { (campo().onFocus as () => void)(); });
    const c = casas(4).map(plano);
    expect([c[2].borderColor, c[2].borderWidth]).toEqual([t.color.focusStrong, t.size.focusWidth]);
    expect(c[1].borderColor).toBe(t.color.borderStrong);
    const cursor = plano(__instancias("Animated.View").at(-1));
    expect([cursor.width, cursor.height, cursor.backgroundColor]).toEqual([2, 18, t.color.mutedForeground]);
    digitar("1234");
    expect(casas(4).map((p) => plano(p).borderColor)).not.toContain(t.color.focusStrong);
  });

  it("o cursor pisca; com menos movimento, fica parado", async () => {
    render(<Envolve><OTPField length={4} /></Envolve>);
    act(() => { (campo().onFocus as () => void)(); });
    await assentar();
    expect(__animacoes().length).toBeGreaterThan(0);
  });

  it("com menos movimento o cursor não pisca", async () => {
    __definirReduceMotion(true);
    render(<Envolve><OTPField length={4} /></Envolve>);
    act(() => { (campo().onFocus as () => void)(); });
    await assentar();
    expect(__animacoes()).toHaveLength(0);
  });

  it("`mask` esconde o dígito atrás do ponto de 10", () => {
    render(<Envolve><OTPField length={4} defaultValue="12" mask testID="o" /></Envolve>);
    expect(__instancias("Text").map((p) => p.children)).not.toContain("1");
    const pontos = __instancias("View").map(plano).filter((e) => e.width === 10 && e.height === 10);
    expect(pontos).toHaveLength(2);
  });

  it("para o leitor de tela é um campo só, com nome, e as casas ficam fora da árvore", () => {
    render(<Envolve><OTPField length={6} defaultValue="12" label="Código" /></Envolve>);
    const c = campo();
    expect(c.accessibilityLabel).toBe("Código");
    expect(c.accessibilityValue).toEqual({text: "2 of 6"});
    expect(__instancias("View").some((p) => p.importantForAccessibility === "no-hide-descendants" && p.accessibilityElementsHidden)).toBe(true);
    // A raiz tocável não é elemento de acessibilidade (o campo dentro dela é).
    expect(__instancias("Pressable").at(-1)!.accessible).toBe(false);
  });

  it("o código do SMS: `oneTimeCode` no iPhone e `sms-otp` no Android, com o teclado numérico", () => {
    render(<Envolve><OTPField length={6} /></Envolve>);
    expect([campo().textContentType, campo().autoComplete, campo().inputMode]).toEqual(["oneTimeCode", "sms-otp", "numeric"]);
    expect(plano(campo()).opacity).toBe(0);
    __definirPlataforma("ios");
    render(<Envolve><OTPField length={6} /></Envolve>);
    expect(campo().autoComplete).toBe("one-time-code");
    expect(campo().caretHidden).toBe(true);
    // No iPhone, com opacidade zero o campo não aceita colar.
    expect([plano(campo()).opacity, plano(campo()).color]).toEqual([0.02, "transparent"]);
  });

  it("dentro de um `Field`: o nome e o erro vêm dele", () => {
    render(<Envolve><Field label="Código do SMS" error="Código errado"><OTPField length={4} testID="o" /></Field></Envolve>);
    expect(campo().accessibilityLabel).toBe("Código do SMS");
    expect(campo().accessibilityHint).toBe("Código errado");
    expect(campo()["aria-invalid"]).toBe(true);
    expect(plano(casas(4)[0]).borderColor).toBe(t.color.danger400);
  });

  it("desligado: não edita e esmaece", () => {
    render(<Envolve><OTPField length={4} disabled testID="o" /></Envolve>);
    expect(campo().editable).toBe(false);
    expect(plano(__instancias("Pressable").find((p) => p.testID === "o")).opacity).toBe(t.size.opacityDisabled);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// TagGroup
// ─────────────────────────────────────────────────────────────────────────────────────────────

const ITENS: AureaTagItem[] = [
  {id: "design", label: "Design"},
  {id: "codigo", label: "Código"},
  {id: "dados", label: "Dados", disabled: true},
];
const etiqueta = (id: string) => __instancias("View").filter((p) => p.testID === `g-${id}`).at(-1)!;
const escolher = (id: string) => __instancias("Pressable").filter((p) => p.testID === `g-${id}-escolher`).at(-1)!;
const remover = (id: string) => __instancias("Pressable").filter((p) => p.testID === `g-${id}-remover`).at(-1)!;
const tocar = (p: Props) => act(() => { (p.onPress as () => void)(); });
const rotulo = (s: string) => plano(__instancias("Text").filter((p) => p.children === s).at(-1));

describe("TagGroup · as medidas do nativo da referência", () => {
  it.each([
    // [tamanho, em cima e embaixo, dos lados, vão, letra, linha]
    ["sm", 2, 8, 4, 12, 16],
    ["md", 4, 10, 4, 14, 20],
    ["lg", 6, 12, 6, 16, 24],
  ] as const)("%s: %i em cima e embaixo, %i dos lados, vão %i, letra %i na linha de %i, peso médio",
    (size, vertical, lados, vao, letra, linha) => {
      render(<Envolve><TagGroup label="Assuntos" items={ITENS} size={size} testID="g" /></Envolve>);
      const e = plano(etiqueta("design"));
      expect([e.paddingVertical, e.paddingHorizontal, e.gap]).toEqual([vertical, lados, vao]);
      expect([e.borderRadius, e.borderCurve]).toEqual([t.size.radiusFull, "continuous"]);
      const r = rotulo("Design");
      expect([r.fontSize, r.lineHeight, r.fontFamily]).toEqual([letra, linha, "Ui500"]);
    });

  it("o padrão é o md; 12 entre rótulo, lista e descrição; 8 entre as etiquetas, numa fila que quebra", () => {
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} description="Escolha os assuntos" testID="g" /></Envolve>);
    expect(plano(etiqueta("design")).paddingHorizontal).toBe(10);
    expect(plano(__instancias("View").find((p) => p.testID === "g")).gap).toBe(12);
    const lista = plano(__instancias("View").filter((p) => p.accessibilityRole === "list").at(-1));
    expect([lista.flexDirection, lista.flexWrap, lista.gap, lista.width]).toEqual(["row", "wrap", 8, "100%"]);
  });

  it("a pintura: `default` no fundo secundário, `surface` no do cartão", () => {
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} testID="g" /></Envolve>);
    expect(plano(etiqueta("design")).backgroundColor).toBe(t.color.secondary);
    expect(rotulo("Design").color).toBe(t.color.secondaryForeground);
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} variant="surface" testID="g" /></Envolve>);
    expect(plano(etiqueta("design")).backgroundColor).toBe(t.color.card);
    expect(rotulo("Design").color).toBe(t.color.cardForeground);
  });
});

describe("TagGroup · escolher", () => {
  it("sem escolha, a etiqueta é só texto: nada para tocar", () => {
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} testID="g" /></Envolve>);
    expect(__instancias("Pressable")).toHaveLength(0);
    const lista = __instancias("View").filter((p) => p.accessibilityRole === "list").at(-1)!;
    expect(lista.accessibilityLabel).toBe("Assuntos");
  });

  it("uma: tocar escolhe, tocar outra troca, tocar a escolhida desfaz — e o leitor ouve `selected`", () => {
    const mudou = vi.fn();
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} selectionMode="single" onSelectionChange={mudou} testID="g" /></Envolve>);
    tocar(escolher("design"));
    expect(mudou).toHaveBeenLastCalledWith(["design"]);
    expect(escolher("design").accessibilityRole).toBe("button");
    expect((escolher("design").accessibilityState as {selected?: boolean}).selected).toBe(true);
    expect(escolher("design")["aria-selected"]).toBe(true);
    expect((escolher("codigo").accessibilityState as {selected?: boolean}).selected).toBe(false);
    tocar(escolher("codigo"));
    expect(mudou).toHaveBeenLastCalledWith(["codigo"]);
    tocar(escolher("codigo"));
    expect(mudou).toHaveBeenLastCalledWith([]);
  });

  it("várias: cada toque liga e desliga a sua; controlado, vale o que a tela guarda", () => {
    const mudou = vi.fn();
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} selectionMode="multiple" selectedKeys={["design"]}
                              onSelectionChange={mudou} testID="g" /></Envolve>);
    tocar(escolher("codigo"));
    expect(mudou).toHaveBeenLastCalledWith(["design", "codigo"]);
    // Controlado: sem a tela mudar, a `codigo` continua sem escolha.
    expect((escolher("codigo").accessibilityState as {selected?: boolean}).selected).toBe(false);
    tocar(escolher("design"));
    expect(mudou).toHaveBeenLastCalledWith([]);
  });

  it("a escolhida: 10% da marca sobre o fundo secundário e a letra no destaque, nos dois temas", () => {
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} selectionMode="single" defaultSelectedKeys={["design"]} testID="g" /></Envolve>);
    // #f0b100 a 10% sobre #333333, canal a canal.
    expect(plano(etiqueta("design")).backgroundColor).toBe("#46402e");
    expect(rotulo("Design").color).toBe(t.color.primaryEmphasis);
    expect(plano(etiqueta("codigo")).backgroundColor).toBe(t.color.secondary);
    render(<Envolve tema="light"><TagGroup label="Assuntos" items={ITENS} selectionMode="single" defaultSelectedKeys={["design"]} testID="g" /></Envolve>);
    // #f0b100 a 10% sobre #ebebeb.
    expect(plano(etiqueta("design")).backgroundColor).toBe("#ece5d4");
    expect(rotulo("Design").color).toBe(claro.color.primaryEmphasis);
  });

  it("a desligada esmaece e não escolhe", () => {
    const mudou = vi.fn();
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} selectionMode="multiple" onSelectionChange={mudou} testID="g" /></Envolve>);
    expect(plano(etiqueta("dados")).opacity).toBe(t.size.opacityDisabled);
    expect(escolher("dados").onPress).toBeUndefined();
    expect(escolher("dados")["aria-disabled"]).toBe(true);
  });

  it("a parte que escolhe chega aos 44 de altura de toque e fica por cima do X", () => {
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} selectionMode="single" onRemove={() => {}} testID="g" /></Envolve>);
    // md: linha de 20 + 12 em cima + 12 embaixo; dos lados, o recheio da etiqueta (o X fica à direita).
    expect(escolher("design").hitSlop).toEqual({top: 12, bottom: 12, left: 10, right: 0});
    expect(plano(escolher("design")).zIndex).toBe(1);
  });
});

describe("TagGroup · o X de tirar", () => {
  it("cada etiqueta ganha o X com `onRemove`, com o nome dela, e tirar avisa o id", () => {
    const tirou = vi.fn();
    glifos = [];
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} onRemove={tirou} testID="g" /></Envolve>);
    const x = remover("design");
    expect(x.accessibilityRole).toBe("button");
    expect(x.accessibilityLabel).toBe("Remove Design");
    tocar(x);
    expect(tirou).toHaveBeenCalledWith(["design"]);
    // O X da referência: 12, no traço grosso, na cor da letra.
    expect(glifos.filter((g) => g.nome === "x-bold")[0]).toEqual({nome: "x-bold", size: 12, color: t.color.secondaryForeground});
  });

  it("o X chega aos 44 (12 + 16 de cada lado) e é IRMÃO da parte que escolhe, não filho", () => {
    const {container} = render(<Envolve><TagGroup label="Assuntos" items={ITENS} selectionMode="single" onRemove={() => {}} testID="g" /></Envolve>);
    expect(remover("design").hitSlop).toBe(16);
    expect(12 + 16 * 2).toBe(t.size.targetMin);
    // No iPhone um tocável dentro de outro some para o VoiceOver (check 43).
    expect(container.querySelector('[data-testid="g-design-escolher"] [data-testid="g-design-remover"]')).toBeNull();
    expect(container.querySelector('[data-testid="g-design"] [data-testid="g-design-remover"]')).not.toBeNull();
  });

  it("na desligada o X não tira", () => {
    const tirou = vi.fn();
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} onRemove={tirou} testID="g" /></Envolve>);
    expect(remover("dados").onPress).toBeUndefined();
    expect(remover("dados")["aria-disabled"]).toBe(true);
  });

  it("`textValue` nomeia o X quando o rótulo não é texto", () => {
    render(<Envolve><TagGroup label="Assuntos" items={[{id: "a", label: <></>, textValue: "Arte"}]} onRemove={() => {}} testID="g" /></Envolve>);
    expect(remover("a").accessibilityLabel).toBe("Remove Arte");
  });
});

describe("TagGroup · rótulo, descrição, erro e ícone", () => {
  it("o rótulo em cima; `labelHidden` o tira da tela e o deixa na lista", () => {
    render(<Envolve><TagGroup label="Assuntos" labelHidden items={ITENS} /></Envolve>);
    expect(__instancias("Text").map((p) => p.children)).not.toContain("Assuntos");
    expect(__instancias("View").filter((p) => p.accessibilityRole === "list").at(-1)!.accessibilityLabel).toBe("Assuntos");
  });

  it("descrição esmaecida e erro em vermelho, embaixo", () => {
    render(<Envolve><TagGroup label="Assuntos" items={ITENS} description="Até três" errorMessage="Escolha um" /></Envolve>);
    expect(rotulo("Até três").color).toBe(t.color.mutedForeground);
    expect(rotulo("Escolha um").color).toBe(t.color.danger400);
  });

  it("o ícone da etiqueta: 16, na cor da letra", () => {
    glifos = [];
    render(<Envolve><TagGroup label="Assuntos" items={[{id: "a", label: "Arte", icon: "tag"}]} /></Envolve>);
    expect(glifos.find((g) => g.nome === "tag")).toEqual({nome: "tag", size: 16, color: t.color.secondaryForeground});
  });
});
