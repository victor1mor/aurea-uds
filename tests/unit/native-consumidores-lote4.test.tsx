// LOTE 4 DOS ACHADOS DOS CONSUMIDORES — o nativo, 24/09/2026.
//
// Duas fichas do documento dos consumidores, conferidas contra o código antes de aceitar:
//
// - **R-04** · o `Card` não respondia ao toque, e a própria documentação mandava a tela embrulhá-lo
//   num `Pressable` — que a regra "só Aurea" do app barra. Decisão do Victor (23/09): o conserto é
//   na Aurea, com `onPress` no `Card`.
// - **R-08** · a barra de abas. Dos três defeitos da foto, DOIS já tinham saído na `0.8.8` (a barra
//   não flutuava e a folga do sistema ia por dentro) — o documento mediu a `0.8.7`. Sobrou o
//   terceiro, *"ficou super largo"*, e é ele que este arquivo trava: `width="content"`.
//
// Cada `expect` que cobra o comportamento novo REPROVAVA antes dele.
import {spawnSync} from "node:child_process";
import {render} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {
  AureaProvider, BottomNav, Button, Card, Text, criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";
import {__definirInsets} from "./native-stubs/react-native-safe-area-context";

const claro = resolverTokens("light", "comfortable");
const ICONES = criarRegistroDeIcones({home: () => null});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider theme="light" icons={ICONES}>{children}</AureaProvider>;

type Estilo = Record<string, unknown> & {transform?: {scale?: number}[]};
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;

// ═════════════════════════════════════════════════════════════════════════════════════════════
// R-04 · o Card tocável
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("R-04 · o `Card` responde ao toque com `onPress`", () => {
  const cartao = () => __instancias("Pressable").find((p) => p.testID === "c");

  it("com `onPress` o cartão É um botão, com nome, e o toque chega", () => {
    const abrir = vi.fn();
    render(
      <Envolve>
        <Card testID="c" onPress={abrir} accessibilityLabel="Relatório de março"><Text>Março</Text></Card>
      </Envolve>);
    const c = cartao();
    expect(c).toBeDefined();
    expect(c?.accessibilityRole).toBe("button");
    expect(c?.accessibilityLabel).toBe("Relatório de março");
    (c?.onPress as () => void)();
    expect(abrir).toHaveBeenCalledTimes(1);
  });

  it("a pele padrão com `onPress` é `interactive`; sem `onPress`, nada muda", () => {
    render(
      <Envolve>
        <Card testID="c" onPress={() => {}} accessibilityLabel="x" />
        <Card testID="parado" />
      </Envolve>);
    expect(plano(cartao()?.style).borderColor).toBe(claro.color.borderStrong);
    // o cartão comum continua um `View`, com a borda comum — não virou alvo por engano
    expect(__instancias("Pressable").some((p) => p.testID === "parado")).toBe(false);
    const parado = __instancias("View").find((p) => p.testID === "parado");
    expect(plano(parado?.style).borderColor).toBe(claro.color.border);
  });

  it("a variante escrita pelo app manda na pele", () => {
    render(<Envolve><Card testID="c" variant="selected" onPress={() => {}} accessibilityLabel="x" /></Envolve>);
    expect(plano(cartao()?.style).borderColor).toBe(claro.color.primaryOutline);
  });

  // A decisão do Victor foi "a reação do `Button`". O teste compara com o `Button` MEDIDO, e não
  // com os números escritos aqui — se um dia os dois divergirem, é aqui que aparece.
  it("com o dedo em cima, a MESMA reação do `Button`", () => {
    render(
      <Envolve>
        <Card testID="c" onPress={() => {}} accessibilityLabel="x" />
        <Button testID="b" onPress={() => {}}>Ok</Button>
      </Envolve>);
    const doCartao = plano(cartao()?.__estiloTocando);
    const doBotao = plano(__instancias("Pressable").find((p) => p.testID === "b")?.__estiloTocando);
    expect(doCartao.opacity).toBe(0.9);
    expect(doCartao.transform).toEqual([{scale: 0.97}]);
    expect(doCartao.opacity).toBe(doBotao.opacity);
    expect(doCartao.transform).toEqual(doBotao.transform);
    // e em repouso, nada
    expect(plano(cartao()?.style).transform).toBeUndefined();
  });

  it("`disabled` apaga o cartão e diz isso ao leitor de tela", () => {
    render(<Envolve><Card testID="c" onPress={() => {}} accessibilityLabel="x" disabled /></Envolve>);
    expect(cartao()?.disabled).toBe(true);
    expect(cartao()?.accessibilityState).toEqual({disabled: true});
    expect(plano(cartao()?.style).opacity).toBe(0.45);
  });

  // As regras que moram no TIPO. Elas NÃO se provam aqui dentro: nenhum `tsconfig` do
  // repositório lê `tests/`, então um `@ts-expect-error` neste arquivo passaria com a regra
  // quebrada — a primeira versão deste teste fazia exatamente isso. Quem prova é a sonda
  // `tipos-nativo/card-tocavel.tsx`, compilada pelo `tsc` de verdade (meio segundo). Provado contra
  // o defeito: com `accessibilityLabel?` opcional, o `tsc` reprova com `Unused '@ts-expect-error'`.
  it("o tipo exige o nome, barra o `brand` e só aceita `disabled` com `onPress`", () => {
    const r = spawnSync(process.execPath,
      ["node_modules/typescript/bin/tsc", "-p", "tests/unit/tipos-nativo"], {encoding: "utf8"});
    expect(r.stdout + r.stderr).toBe("");
    expect(r.status).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// R-08 · a largura da barra
// ═════════════════════════════════════════════════════════════════════════════════════════════

const ITENS = [
  {id: "inicio", label: "Início", icon: "home", onPress: () => {}},
  {id: "perfil", label: "Perfil", icon: "home", onPress: () => {}},
];
const barra = () => plano(__instancias("View").find((p) => p.testID === "nav")?.style);
const abas = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "link").map((p) => plano(p.style));

describe("R-08 · `width=\"content\"`: a pílula do tamanho das abas, no centro", () => {
  it("o padrão continua de borda a borda, com as abas dividindo a largura", () => {
    render(<Envolve><BottomNav items={ITENS} current="inicio" testID="nav" /></Envolve>);
    const e = barra();
    expect(e.left).toBe(0);
    expect(e.right).toBe(0);
    for (const a of abas()) expect(a.flex).toBe(1);
  });

  // ⚠ A FORMA importa, não só o resultado achatado: `left: undefined` por cima de `left: 0` passa
  // no `flatten` e FALHA numa atualização do RN. Por isso o teste cobra que as duas chaves NÃO
  // EXISTAM no estilo achatado — nem como `undefined`.
  it("`content`: sem `left`/`right`, centralizada, e cada aba mede o próprio conteúdo", () => {
    render(<Envolve><BottomNav width="content" items={ITENS} current="inicio" testID="nav" /></Envolve>);
    const e = barra();
    expect("left" in e).toBe(false);
    expect("right" in e).toBe(false);
    expect(e.alignSelf).toBe("center");
    expect(e.position).toBe("absolute");
    for (const a of abas()) {
      expect(a.flexGrow).toBe(0);
      expect(a.flexBasis).toBe("auto");
      expect(a.minWidth).toBe(claro.size.controlHLg);
      expect(a.paddingHorizontal).toBe(claro.size.space3);
    }
  });

  it("`content` não mexe na folga do sistema: ela continua POR FORA", () => {
    __definirInsets({bottom: 48});
    render(<Envolve><BottomNav width="content" items={ITENS} current="inicio" testID="nav" /></Envolve>);
    expect(barra().marginBottom).toBe(claro.size.space4 + 48);
    expect(barra().paddingBottom).toBe(claro.size.space1);
  });

  it("na `edge` a largura é ignorada: encostada na borda, continua da largura da tela", () => {
    render(<Envolve><BottomNav variant="edge" width="content" items={ITENS} current="inicio" testID="nav" /></Envolve>);
    expect(barra().alignSelf).toBeUndefined();
    for (const a of abas()) expect(a.flex).toBe(1);
  });
});
