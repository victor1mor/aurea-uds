// Lote F do nativo (01/10/2026) · R-10, R-12, R-14, R-16 e R-19, os acréscimos da fila
// (`docs/FILA.md`), cada um no desenho da referência no nativo quando ela tem a peça. As propostas
// foram aprovadas pelo Victor pelas pranchas de 01/10/2026 ("ok, 30 e 24").
//
// Cada `describe` reprova o código de antes do lote: sem `variant` a fila de abas é sempre a
// cápsula; sem `description` o item do Combobox tem uma linha; sem `display` o NumberField cai no
// `md`; sem `icon` a opção do RadioGroup não desenha glifo, e a descrição dela saía em 16.
// O dublê não calcula layout: prova-se o pedido ao motor. A prova de aparelho é o bloco LF do
// `apps/native-smoke`.
import {act, render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import * as React from "react";
import {StyleSheet, View, __instancias} from "./native-stubs/react-native";
import {
  AureaProvider, Combobox, NumberField, RadioGroup, SegmentedControl, Tabs, comOpacidade,
  criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children, icons}: {children: React.ReactNode; icons?: Parameters<typeof AureaProvider>[0]["icons"]}) =>
  <AureaProvider icons={icons}>{children}</AureaProvider>;
const plano = (p: Record<string, unknown>) => StyleSheet.flatten(
  typeof p.style === "function" ? (p.style as (e: {pressed: boolean}) => unknown)({pressed: false}) : p.style) ?? {};
const raiz = resolve(__dirname, "../..");

// O fio da casa: os números do `aurea.css:1039` (`inset-inline:15px`, `height:2px`, amarelo a 75%).
const ehFio = (e: Record<string, unknown>) =>
  e.position === "absolute" && e.height === 2 && e.left === 15 && e.right === 15 && e.bottom === 0
  && e.backgroundColor === comOpacidade(t.color.primary, 0.75);

// ── R-12 · Tabs variant="secondary" ─────────────────────────────────────────────────────────
describe("R-12 · Tabs: o jeito sublinhado da referência, com o fio da casa", () => {
  const abas = [
    {id: "geral", label: "Geral", content: null},
    {id: "aparencia", label: "Aparência", content: null},
    {id: "avisos", label: "Avisos", content: null},
  ];
  const fila = () => plano(__instancias("View").filter((p) => p.accessibilityRole === "tablist").at(-1)!);
  const tabs = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "tab").slice(-3);
  const fiosDentroDe = (p: Record<string, unknown>) =>
    ([p.children].flat(3) as Array<React.ReactElement | false | null>)
      .filter((c): c is React.ReactElement => !!c && typeof c === "object" && c.type === View)
      .filter((c) => ehFio(StyleSheet.flatten((c.props as {style?: unknown}).style) ?? {}));

  it("sem variant, continua a cápsula de hoje (fundo muted, raio de controle)", () => {
    render(<Envolve><Tabs tabs={abas} value="geral" /></Envolve>);
    const e = fila();
    expect(e.backgroundColor).toBe(t.color.muted);
    expect(e.borderRadius).toBe(t.size.radiusControl);
    // ADR-0059 (08/10/2026): era `secondary`, a mesma cor do trilho no tema claro — não se via.
    expect(plano(tabs()[0]).backgroundColor).toBe(t.color.segment);
    for (const x of tabs()) expect(fiosDentroDe(x)).toHaveLength(0);
  });
  it("secondary: a fila perde a cápsula e ganha o fio fino de 1 embaixo, na cor da borda", () => {
    render(<Envolve><Tabs tabs={abas} value="geral" variant="secondary" /></Envolve>);
    const e = fila();
    expect(e.backgroundColor).toBeUndefined();
    expect(e.borderRadius).toBeUndefined();
    expect(e.borderBottomWidth).toBe(t.size.borderWidth);
    expect(e.borderColor).toBe(t.color.border);
    expect(e.gap).toBe(t.size.space1);
  });
  it("secondary: a aba tem o recheio da referência (12 dos lados, 6 em cima e embaixo) e a altura da cápsula", () => {
    render(<Envolve><Tabs tabs={abas} value="geral" variant="secondary" /></Envolve>);
    const e = plano(tabs()[1]);
    expect(e.paddingHorizontal).toBe(t.size.space3);
    expect(e.paddingVertical).toBe(t.size.space1 + t.size.space05);
    expect(e.minHeight).toBe(t.size.controlHMd);
  });
  it("secondary: só a aba aberta leva o fio amarelo, e sem o fundo da cápsula", () => {
    render(<Envolve><Tabs tabs={abas} value="aparencia" variant="secondary" /></Envolve>);
    const [a, b, c] = tabs();
    expect([a, b, c].map((x) => fiosDentroDe(x).length)).toEqual([0, 1, 0]);
    expect(plano(b).backgroundColor).toBeUndefined();
  });
  it("o SegmentedControl continua com o MESMO fio (a peça mudou de casa, não de número)", () => {
    render(<Envolve><SegmentedControl value="a" onChange={() => {}}
      items={[{value: "a", label: "A"}, {value: "b", label: "B"}]} /></Envolve>);
    const fios = __instancias("View").map((p) => plano(p)).filter(ehFio);
    expect(fios).toHaveLength(1);
  });
});

// ── R-14 · Combobox: segunda linha no item ───────────────────────────────────────────────────
describe("R-14 · Combobox: description no item, como a descrição de item do Select da referência", () => {
  async function abrir() {
    render(<Envolve><Combobox testID="cb" value={null} items={[
      {value: "1", label: "Açúcar cristal", description: "Pacote de 1 kg"},
      {value: "2", label: "Açúcar mascavo"},
    ]} /></Envolve>);
    const g = __instancias("Pressable").filter((p) => p.testID === "cb").at(-1)!;
    await act(async () => { (g.onPress as () => void)(); });
  }
  const textos = (s: string) => __instancias("Text").filter((p) => p.children === s);

  it("a segunda linha aparece embaixo do rótulo, em 14 e apagada", async () => {
    await abrir();
    const d = textos("Pacote de 1 kg");
    expect(d.length).toBeGreaterThan(0);
    const e = plano(d.at(-1)!);
    expect(e.fontSize).toBe(t.size.textSm);
    expect(e.color).toBe(t.color.mutedForeground);
  });
  it("vira a dica do item para o leitor de tela; o item sem ela fica sem dica", async () => {
    await abrir();
    const itens = __instancias("Pressable").filter((p) => p.accessibilityRole === "menuitem").slice(-2);
    expect(itens.map((p) => p.accessibilityHint)).toEqual(["Pacote de 1 kg", undefined]);
  });
});

// ── R-16 · NumberField size="display" ───────────────────────────────────────────────────────
describe("R-16 · NumberField: o tamanho display (número grande, título 2)", () => {
  const campo = () => plano(__instancias("TextInput").filter((p) => p.testID === "nf-campo").at(-1)!);
  const botoes = (lado: number) => __instancias("View").map(plano)
    .filter((e) => e.width === lado && e.height === lado && e.borderRadius === t.size.radiusControl);

  it("letra 30 em seminegrito, altura do degrau xl e largura 96", () => {
    render(<Envolve><NumberField testID="nf" value={42} size="display" /></Envolve>);
    const e = campo();
    expect(e.fontSize).toBe(t.size.text3xl);
    expect(e.fontSize).toBe(30);
    expect(e.fontFamily).toBe(t.font.ui[600]);
    expect(e.height).toBe(t.size.controlHXl);
    expect(e.width).toBe(t.size.space24);
  });
  it("os botões de − e + são os do lg, o maior do IconButton", () => {
    render(<Envolve><NumberField testID="nf" value={42} size="display" /></Envolve>);
    expect(botoes(t.size.controlHLg)).toHaveLength(2);
  });
  it("o lg não mudou: letra lg, peso regular, largura 64", () => {
    render(<Envolve><NumberField testID="nf" value={42} size="lg" /></Envolve>);
    const e = campo();
    expect(e.fontSize).toBe(t.size.textLg);
    expect(e.fontFamily).toBe(t.font.ui[400]);
    expect(e.height).toBe(t.size.controlHLg);
    expect(e.width).toBe(t.size.space16);
  });
  it("fullWidth vence a largura do display (moeda em 30 não cabe em 96)", () => {
    render(<Envolve><NumberField testID="nf" value={1234.5} size="display" fullWidth /></Envolve>);
    expect(campo().width).toBeUndefined();
    expect(campo().flex).toBe(1);
  });
});

// ── R-19 · RadioGroup.Item icon ─────────────────────────────────────────────────────────────
describe("R-19 · RadioGroup: ícone na opção", () => {
  // Glifos de mentira, que só anotam o que receberam: o nome sai do testID.
  const glifo = (nome: string) => ({size, color}: {size?: number; color?: string}) =>
    <View testID={`glifo-${nome}`} style={{width: size, height: size, backgroundColor: color}} />;
  const ICONES = criarRegistroDeIcones({
    truck: glifo("truck"), "truck-fill": glifo("truck-fill"), storefront: glifo("storefront"),
  });
  const ordem = (p: Record<string, unknown>) =>
    ([p.children].flat(3) as Array<{key?: string} | false | null>).filter(Boolean).map((c) => (c as {key?: string}).key);
  const itens = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "radio");
  const glifos = (nome: string) => __instancias("View").filter((p) => p.testID === `glifo-${nome}`);

  function Entrega({inicio}: {inicio?: boolean}) {
    return (
      <Envolve icons={ICONES}>
        <RadioGroup value="normal" indicatorPlacement={inicio ? "start" : undefined}>
          <RadioGroup.Item value="normal" icon="truck" label="Normal" description="Em 5 a 7 dias úteis" />
          <RadioGroup.Item value="retirar" icon="storefront" label="Retirar na loja" />
          <RadioGroup.Item value="sem" label="Sem ícone" />
        </RadioGroup>
      </Envolve>);
  }

  it("o ícone vem antes do texto, com a marca no fim", () => {
    render(<Entrega />);
    expect(itens().slice(-3).map(ordem)).toEqual([
      ["icone", "texto", "marca"], ["icone", "texto", "marca"], ["texto", "marca"]]);
  });
  it("com a marca no início, o ícone continua colado antes do texto", () => {
    render(<Entrega inicio />);
    expect(ordem(itens().at(-3)!)).toEqual(["marca", "icone", "texto"]);
  });
  it("tem 24 (iconLg, escolha do Victor) e a cor do rótulo", () => {
    render(<Entrega />);
    const e = plano(glifos("storefront").at(-1)!);
    expect(e.width).toBe(t.size.iconLg);
    expect(e.width).toBe(24);
    expect(e.backgroundColor).toBe(t.color.foreground);
  });
  it("na opção escolhida sai a forma cheia (ADR-0053); nas outras, a regular", () => {
    render(<Entrega />);
    expect(glifos("truck-fill").length).toBeGreaterThan(0);
    expect(glifos("truck")).toHaveLength(0);
    expect(glifos("storefront").length).toBeGreaterThan(0);
  });
  it("🔴 a descrição sai em 14 (o tamanho da referência) e não em 16, que é o rótulo", () => {
    render(<Entrega />);
    const d = plano(__instancias("Text").filter((p) => p.children === "Em 5 a 7 dias úteis").at(-1)!);
    const r = plano(__instancias("Text").filter((p) => p.children === "Normal").at(-1)!);
    expect(d.fontSize).toBe(t.size.textSm);
    expect(r.fontSize).toBe(t.size.textBase);
  });
});

// ── R-10 · textMd é apelido do textSm ───────────────────────────────────────────────────────
describe("R-10 · textMd vira apelido do textSm, marcado para sair na 1.0", () => {
  it("no telefone os dois continuam valendo 14 — nada muda na tela", () => {
    expect(t.size.textMd).toBe(t.size.textSm);
    expect(t.size.textSm).toBe(14);
  });
  it("no arquivo de tokens, text-md APONTA para text-sm e leva $deprecated", () => {
    const json = JSON.parse(readFileSync(resolve(raiz, "packages/tokens/src/aurea.tokens.json"), "utf8"));
    expect(json.base["text-md"].$value).toBe("{text-sm}");
    expect(json.base["text-md"].$deprecated).toMatch(/text-sm/);
  });
  it("o CSS da Aurea não usa mais o nome velho (quem usa é só quem veio de fora)", () => {
    const css = readFileSync(resolve(raiz, "packages/core/src/aurea.css"), "utf8");
    expect(css).not.toMatch(/var\(--text-md\)/);
    const tokens = readFileSync(resolve(raiz, "packages/tokens/dist/aurea.tokens.css"), "utf8");
    expect(tokens).toMatch(/--text-md:var\(--text-sm\);/);
  });
});
