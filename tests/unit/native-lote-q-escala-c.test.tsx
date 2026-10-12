// 0.32.0, passo 9a — as peças de exibição, lista e janela do nativo nas medidas do pacote NATIVO da
// referência (lidas no pacote publicado dela; a escala de 48 aprovada pelo Victor, ADR-0066:
// *"sim, aprovo a escala de 48 no nativo"*).
//
// O dublê não calcula layout; prova-se o pedido ao motor. Cada `it` reprova o código de antes — o
// número antigo vai anotado ao lado. A prova de aparelho é o bloco 0.32 do `apps/native-smoke`.
//
// E o `BottomNav` NÃO MUDA (aprovado rodando pelo Victor, ADR-0055): o último bloco congela as
// medidas dele, lidas ANTES de qualquer mudança deste passo.
import {cleanup, render} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {
  AureaProvider, Avatar, BottomNav, BottomSheet, Card, ConfirmDialog, Dialog, NavList, Tabs,
  criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({
  "x": Glifo as never, "x-bold": Glifo as never, "caret-right": Glifo as never,
  house: Glifo as never, bell: Glifo as never, user: Glifo as never,
});
// Uma família por peso, como no aparelho (a Atkinson tem um arquivo por peso): é a família que diz
// o peso no nativo, não o `fontWeight`.
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};
type Estilo = Record<string, unknown>;
const plano = (s: unknown) => (StyleSheet.flatten(s as never) ?? {}) as Estilo;
const montar = (no: React.ReactNode, density: "compact" | "comfortable" | "spacious" = "comfortable") => {
  __limpar();
  return render(<AureaProvider icons={ICONES} fontFamilies={FONTES} density={density}>{no}</AureaProvider>);
};
const texto = (conteudo: string) => {
  const p = __instancias("Text").find((x) => x.children === conteudo);
  if (!p) throw new Error(`texto "${conteudo}" não desenhado`);
  return {...p, e: plano(p.style)};
};

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("Avatar · as medidas do avatar nativo da referência", () => {
  const lado = (size: "sm" | "md" | "lg", density?: "compact" | "spacious") => {
    montar(<Avatar size={size} fallback="AB" testID="av" />, density);
    return plano(__instancias("View").find((p) => p.testID === "av")!.style);
  };
  it("sm 40 · md 48 · lg 64 (eram 32 · 36 · 40, a altura de controle da web)", () => {
    expect([lado("sm").width, lado("md").width, lado("lg").width]).toEqual([40, 48, 64]);
    expect([lado("sm").height, lado("md").height, lado("lg").height]).toEqual([40, 48, 64]);
    expect([t.size.space10, t.size.space12, t.size.space16]).toEqual([40, 48, 64]);
  });
  it("o padrão é o md, 48", () => {
    montar(<Avatar fallback="AB" testID="av" />);
    expect(plano(__instancias("View").find((p) => p.testID === "av")!.style).width).toBe(48);
  });
  it("não anda com a densidade, como o `.avatar` da web (que mede na escala de espaço)", () => {
    expect([lado("md", "compact").width, lado("md", "spacious").width]).toEqual([48, 48]);
  });
  it.each([
    ["sm", 12, 16], ["md", 14, 20], ["lg", 16, 24],
  ] as const)("as iniciais do %s: %d numa linha de %d, peso médio (eram 14 ou 16, em negrito)", (size, letra, linha) => {
    montar(<Avatar size={size} fallback="AB" />);
    const {e} = texto("AB");
    expect([e.fontSize, e.lineHeight, e.fontFamily]).toEqual([letra, linha, "Ui500"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("NavList · a linha da lista da referência", () => {
  const ITENS = [
    {id: "a", label: "Conta", description: "Seus dados", onPress: () => {}},
    {id: "b", label: "Versão", value: "1.0"},
  ];
  it("recheio de 16 em volta do conteúdo (era 8 em cima e embaixo, 12 dos lados) e vão de 12", () => {
    montar(<NavList items={ITENS} />);
    const molduras = __instancias("View").map((p) => plano(p.style)).filter((e) => e.width === "100%");
    expect(molduras).toHaveLength(2);
    // O recheio dos lados mora na moldura; o de cima e de baixo, no miolo (ver o próximo teste).
    for (const e of molduras) {
      expect([e.paddingHorizontal, e.gap]).toEqual([t.size.space4, t.size.space3]);
      expect(e.paddingVertical ?? 0).toBe(0);
    }
    const tocavel = plano(__instancias("Pressable")[0]!.style);
    const leitura = plano(__instancias("View").find((p) => p.accessible === true)!.style);
    for (const e of [tocavel, leitura]) expect([e.paddingVertical, e.gap]).toEqual([t.size.space4, t.size.space3]);
    expect([t.size.space4, t.size.space3]).toEqual([16, 12]);
  });
  it("o recheio de cima e de baixo é do MIOLO, que é quem toca: a linha de uma linha só tem alvo de 56", () => {
    montar(<NavList items={[{id: "a", label: "Conta", onPress: () => {}}]} />);
    const e = plano(__instancias("Pressable")[0]!.style);
    const linhaDoTitulo = texto("Conta").e.lineHeight as number;
    // Antes: o miolo media só a linha do título (24), abaixo dos 44 do alvo mínimo.
    expect(2 * (e.paddingVertical as number) + linhaDoTitulo).toBeGreaterThanOrEqual(t.size.targetMin);
  });
  it("título 16 em peso médio (era 400); descrição 14", () => {
    montar(<NavList items={ITENS} />);
    expect([texto("Conta").e.fontSize, texto("Conta").e.fontFamily]).toEqual([16, "Ui500"]);
    expect([texto("Versão").e.fontSize, texto("Versão").e.fontFamily]).toEqual([16, "Ui500"]);
    expect([texto("Seus dados").e.fontSize, texto("Seus dados").e.fontFamily]).toEqual([14, "Ui400"]);
  });
  it("sem a altura mínima de controle da web (era 40): a altura sai do recheio e da linha", () => {
    montar(<NavList items={ITENS} />);
    for (const e of __instancias("View").map((p) => plano(p.style)).filter((x) => x.width === "100%")) {
      expect(e.minHeight).toBeUndefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("Tabs · a lista com cápsula da referência", () => {
  const ABAS = [{id: "a", label: "Resumo", content: null}, {id: "b", label: "Detalhes", content: null}];
  const lista = () => plano(__instancias("View").find((p) => p.accessibilityRole === "tablist")!.style);
  const abas = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "tab").map((p) => plano(p.style));
  it("o trilho: 4 de recheio (a referência usa 3; o token mais perto é o space1) e 4 de vão (eram 3 e 3)", () => {
    montar(<Tabs tabs={ABAS} value="a" />);
    expect([lista().padding, lista().gap]).toEqual([t.size.space1, t.size.space1]);
    expect(t.size.space1).toBe(4);
  });
  it("a aba: 12 dos lados, 6 em cima e embaixo, 6 de vão (era 14 dos lados, sem recheio vertical)", () => {
    montar(<Tabs tabs={ABAS} value="a" />);
    for (const e of abas()) {
      expect([e.paddingHorizontal, e.paddingVertical, e.gap, e.flexDirection])
        .toEqual([t.size.space3, t.size.space1 + t.size.space05, t.size.space1 + t.size.space05, "row"]);
    }
    expect([t.size.space3, t.size.space1 + t.size.space05]).toEqual([12, 6]);
  });
  it("o rótulo: 16 em peso médio, escolhida ou não (era 600 na escolhida e 400 nas outras)", () => {
    montar(<Tabs tabs={ABAS} value="a" />);
    expect([texto("Resumo").e.fontSize, texto("Resumo").e.fontFamily]).toEqual([16, "Ui500"]);
    expect([texto("Detalhes").e.fontSize, texto("Detalhes").e.fontFamily]).toEqual([16, "Ui500"]);
  });
  it("a aba tem 36 de altura (6 + a linha de 24 + 6), e o trilho, 44", () => {
    montar(<Tabs tabs={ABAS} value="a" />);
    const e = abas()[0]!;
    const altura = 2 * (e.paddingVertical as number) + (texto("Resumo").e.lineHeight as number);
    expect(altura).toBe(36);
    expect(altura + 2 * (lista().padding as number)).toBe(44);
  });
  it("a secundária NÃO muda: rótulo 600/400, 12 dos lados e 6 em cima e embaixo", () => {
    montar(<Tabs tabs={ABAS} value="a" variant="secondary" />);
    expect([texto("Resumo").e.fontFamily, texto("Detalhes").e.fontFamily]).toEqual(["Ui600", "Ui400"]);
    for (const e of abas()) {
      expect([e.paddingHorizontal, e.paddingVertical, e.minHeight])
        .toEqual([t.size.space3, t.size.space1 + t.size.space05, t.size.controlHMd]);
    }
    expect([lista().gap, lista().padding]).toEqual([t.size.space1, undefined]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("Dialog · a janela da referência nativa", () => {
  const superficie = () => __instancias("View").map((p) => plano(p.style))
    .find((e) => e.backgroundColor === t.color.popover && e.borderRadius === t.size.radiusCard)!;
  it("recheio de 20 (era 24)", () => {
    montar(<Dialog open title="Excluir" onClose={() => {}}>corpo</Dialog>);
    expect(superficie().padding).toBe(t.size.space5);
    expect(t.size.space5).toBe(20);
  });
  it("título 18 em peso médio (era 600), cabeçalho para o leitor de tela, 8 até o corpo (era 16)", () => {
    montar(<Dialog open title="Excluir" onClose={() => {}}>corpo</Dialog>);
    const titulo = texto("Excluir");
    expect([titulo.e.fontSize, titulo.e.fontFamily]).toEqual([18, "Ui500"]);
    expect(titulo.accessibilityRole).toBe("header");
    expect(titulo.e.marginBottom).toBe(t.size.space2);
  });
  it("o X é o `CloseButton` (o círculo de 40), preso ao canto a 16 da borda de fora, como na web", () => {
    const fechar = vi.fn();
    montar(<Dialog open title="Excluir" onClose={fechar}>corpo</Dialog>);
    const x = __instancias("Pressable").find((p) => p.accessibilityLabel === "Close")!;
    expect(x).toBeDefined();
    // O `CloseButton`: círculo da escala de toque, área de toque estendida. O `IconButton` de antes
    // não tinha `hitSlop`.
    expect([plano(x.style).width, plano(x.style).height]).toEqual([t.size.touchControlHSm, t.size.touchControlHSm]);
    expect(x.hitSlop).toBe(t.size.space3);
    (x.onPress as () => void)();
    expect(fechar).toHaveBeenCalledTimes(1);
    // O canto: 16 da borda de FORA; o absoluto conta de dentro da borda de 1.
    const canto = __instancias("View").map((p) => plano(p.style))
      .find((e) => e.position === "absolute" && e.top === t.size.space4 - t.size.borderWidth)!;
    expect(canto).toBeDefined();
    expect(canto.right).toBe(t.size.space4 - t.size.borderWidth);
  });
  it("o título não passa por baixo do X: reserva a largura dele no fim", () => {
    montar(<Dialog open title="Excluir" onClose={() => {}}>corpo</Dialog>);
    const recuo = texto("Excluir").e.paddingRight as number;
    expect(recuo).toBe(t.size.touchControlHSm);
    // A conta, da borda de fora: o título acaba em recheio + borda + recuo; o X começa em 16 + 40.
    const fimDoTitulo = t.size.space5 + t.size.borderWidth + recuo;
    const inicioDoX = t.size.space4 + t.size.touchControlHSm;
    expect(fimDoTitulo).toBeGreaterThan(inicioDoX);
  });
});

describe("ConfirmDialog · o MESMO `.dialog`, sem o X", () => {
  it("recheio de 20 (era 24), título 18 em peso médio (era 600), descrição 16", () => {
    montar(<ConfirmDialog open title="Apagar?" description="Não volta." onConfirm={() => {}} onCancel={() => {}} />);
    const superficie = __instancias("View").map((p) => plano(p.style))
      .find((e) => e.backgroundColor === t.color.popover && e.borderRadius === t.size.radiusCard)!;
    expect(superficie.padding).toBe(t.size.space5);
    expect([texto("Apagar?").e.fontSize, texto("Apagar?").e.fontFamily]).toEqual([18, "Ui500"]);
    expect(texto("Apagar?").e.marginBottom).toBe(t.size.space2);
    expect(texto("Não volta.").e.fontSize).toBe(16);
    // Tocar fora não fecha, e não há X: a saída é o Cancelar.
    expect(__instancias("Pressable").find((p) => p.accessibilityLabel === "Close")).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("BottomSheet · a folha da referência nativa", () => {
  const folha = () => plano(__instancias("Animated.View").at(-1)!.style);
  it("recheio de 20 dos lados e embaixo (era 24); o canto de 32 continua (ADR-0058)", () => {
    montar(<BottomSheet open title="Filtros" onClose={() => {}}>corpo</BottomSheet>);
    const e = folha();
    expect([e.paddingHorizontal, e.paddingBottom]).toEqual([t.size.space5, t.size.space5]);
    expect([e.borderTopLeftRadius, e.borderTopRightRadius]).toEqual([t.size.radiusSheet, t.size.radiusSheet]);
  });
  it("com o puxador, o recheio de cima é a faixa dele; sem o puxador, 20 (era 8)", () => {
    montar(<BottomSheet open title="Filtros" onClose={() => {}}>corpo</BottomSheet>);
    expect(folha().paddingTop).toBe(t.size.space2);
    montar(<BottomSheet open grabber={false} title="Filtros" onClose={() => {}}>corpo</BottomSheet>);
    expect(folha().paddingTop).toBe(t.size.space5);
  });
  it("título 18 em peso médio (era 600)", () => {
    montar(<BottomSheet open title="Filtros" onClose={() => {}}>corpo</BottomSheet>);
    expect([texto("Filtros").e.fontSize, texto("Filtros").e.fontFamily]).toEqual([18, "Ui500"]);
    expect(texto("Filtros").accessibilityRole).toBe("header");
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Confirmação, e não mudança: o `Card` nativo não tem título nem descrição próprios (é a caixa); o
// recheio é o `cardPad`, 16 no confortável — o da referência.
describe("Card · confirmação", () => {
  it("recheio de 16 no confortável", () => {
    montar(<Card testID="c">x</Card>);
    expect(plano(__instancias("View").find((p) => p.testID === "c")!.style).padding).toBe(16);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 🔒 O BOTTOMNAV CONGELADO. As medidas abaixo foram LIDAS do código antes deste passo (0.32.0, passo
// 9a, 11/10/2026), em todas as combinações de `variant`, `width`, `indicator` e aba escolhida, no
// confortável. Qualquer diferença reprova — a barra foi aprovada rodando pelo Victor (ADR-0055), e
// mudar uma medida dela pede o "pode" dele, com a barra rodando na bancada.
describe("BottomNav · congelado: nenhuma medida muda", () => {
  const ITENS = [{id: "a", label: "Início", icon: "house"}, {id: "b", label: "Avisos", icon: "bell", badge: 3},
    {id: "c", label: "Perfil", icon: "user", badge: true},
    {id: "d", label: React.createElement("span", null, "Mais"), icon: "house"}] as never;
  const MEDIDAS = ["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "flex", "flexGrow",
    "flexShrink", "flexBasis", "flexDirection", "padding", "paddingHorizontal", "paddingVertical",
    "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "margin", "marginHorizontal",
    "marginVertical", "marginBottom", "gap", "position", "top", "right", "bottom", "left", "alignSelf",
    "alignItems", "justifyContent", "borderRadius", "borderWidth", "borderTopWidth", "zIndex", "fontSize",
    "lineHeight", "opacity"];
  const medidas = (estilo: unknown) => {
    const e = plano(estilo);
    return MEDIDAS.filter((k) => e[k] !== undefined).map((k) => `${k}=${String(e[k])}`).join(",");
  };
  const CONGELADO = [
    "Pressable|minWidth=0,minHeight=40,flex=1,paddingHorizontal=0,paddingVertical=0,gap=0,alignItems=center,justifyContent=center,borderRadius=999",
    "Pressable|minWidth=0,minHeight=40,flex=1,paddingHorizontal=4,paddingVertical=2,gap=0,alignItems=center,justifyContent=center,borderRadius=18",
    "Pressable|minWidth=0,minHeight=40,flex=1,paddingHorizontal=4,paddingVertical=2,gap=0,alignItems=center,justifyContent=center,borderRadius=999",
    "Pressable|minWidth=40,minHeight=40,flex=1,flexGrow=0,flexShrink=1,flexBasis=auto,paddingHorizontal=0,paddingVertical=0,gap=0,alignItems=center,justifyContent=center,borderRadius=999",
    "Pressable|minWidth=40,minHeight=40,flex=1,flexGrow=0,flexShrink=1,flexBasis=auto,paddingHorizontal=12,paddingVertical=2,gap=0,alignItems=center,justifyContent=center,borderRadius=18",
    "Pressable|minWidth=40,minHeight=40,flex=1,flexGrow=0,flexShrink=1,flexBasis=auto,paddingHorizontal=12,paddingVertical=2,gap=0,alignItems=center,justifyContent=center,borderRadius=999",
    "Pressable|minWidth=40,minHeight=40,flex=1,flexGrow=0,flexShrink=1,flexBasis=auto,paddingHorizontal=4,paddingVertical=2,gap=0,alignItems=center,justifyContent=center,borderRadius=999",
    "Pressable|minWidth=44,minHeight=44,flex=1,flexDirection=row,paddingHorizontal=0,paddingVertical=0,gap=8,alignItems=center,justifyContent=center,borderRadius=999",
    "Pressable|width=136,minWidth=44,minHeight=44,flex=1,flexGrow=0,flexShrink=0,flexBasis=auto,flexDirection=row,paddingHorizontal=12,paddingVertical=0,gap=8,alignItems=center,justifyContent=center,borderRadius=999",
    "Pressable|width=44,minWidth=44,minHeight=44,flex=1,flexGrow=0,flexShrink=0,flexBasis=auto,flexDirection=row,paddingHorizontal=0,paddingVertical=0,gap=8,alignItems=center,justifyContent=center,borderRadius=999",
    "Text|flexShrink=1,fontSize=14,lineHeight=18",
    "Text|fontSize=12,lineHeight=16",
    "View|",
    "View|flexDirection=row,padding=4,paddingBottom=4,margin=16,marginBottom=16,gap=4,position=absolute,bottom=0,alignSelf=center,borderRadius=999,borderWidth=1,zIndex=20",
    "View|flexDirection=row,padding=4,paddingBottom=4,margin=16,marginBottom=16,gap=4,position=absolute,right=0,bottom=0,left=0,borderRadius=999,borderWidth=1,zIndex=20",
    "View|flexDirection=row,padding=4,paddingHorizontal=0,paddingBottom=4,margin=0,gap=4,position=relative,borderRadius=0,borderWidth=0,borderTopWidth=1",
    "View|minHeight=16,flexDirection=row,paddingHorizontal=4,paddingVertical=0,gap=4,alignItems=center,justifyContent=center,borderRadius=999,borderWidth=0",
    "View|position=absolute,opacity=0",
    "View|position=absolute,top=-2,right=-2",
    "View|position=absolute,top=-2,right=10",
    "View|width=10,height=10,minHeight=16,flexDirection=row,paddingHorizontal=0,paddingVertical=0,gap=4,alignItems=center,justifyContent=center,borderRadius=999,borderWidth=0",
    "View|width=24,height=24,position=relative,alignItems=center,justifyContent=center,borderRadius=999",
    "View|width=32,height=24,position=relative,alignItems=center,justifyContent=center,borderRadius=999",
    "View|width=32,height=32,position=relative,alignItems=center,justifyContent=center,borderRadius=999",
    "View|width=32,height=32,position=relative,alignItems=center,justifyContent=center,borderRadius=999,borderWidth=1",
    "View|width=56,height=32,position=relative,alignItems=center,justifyContent=center,borderRadius=999",
    "View|width=56,minHeight=40,paddingHorizontal=4,paddingVertical=4,gap=0,alignItems=center,justifyContent=center,borderRadius=999",
  ];
  const INDICADORES = ["none", "subtle", "pill", "circle", "circle-raised", "circle-outline", "circle-bold", "capsule", "expand"];

  it("todas as combinações pedem exatamente as medidas de antes", () => {
    const todas = new Set<string>();
    for (const variant of ["floating", "edge"]) for (const width of ["full", "content"])
      for (const indicator of INDICADORES) for (const current of ["a", "b"]) {
        __limpar();
        render(<AureaProvider icons={ICONES}>
          <BottomNav items={ITENS} current={current} indicator={indicator as never} width={width as never}
                     variant={variant as never} /></AureaProvider>);
        for (const nome of ["Pressable", "View", "Text"]) for (const p of __instancias(nome)) todas.add(`${nome}|${medidas(p.style)}`);
        cleanup();
      }
    expect([...todas].sort()).toEqual(CONGELADO);
  });
  // O que anda com a densidade é a altura de CONTROLE da web (`controlHLg`), e não a escala de toque
  // do nativo: a barra não passou a ela (ADR-0066, regra 3).
  it.each(["compact", "spacious"] as const)("%s: a aba e o disco seguem no `controlHLg` da densidade", (density) => {
    const d = resolverTokens("dark", density);
    for (const indicator of ["pill", "circle-bold"]) {
      montar(<BottomNav items={ITENS} current="a" indicator={indicator as never} />, density);
      for (const p of __instancias("Pressable")) expect(plano(p.style).minHeight).toBe(d.size.controlHLg);
      const discos = __instancias("View").map((p) => plano(p.style)).filter((e) => e.width === 56 && e.minHeight !== undefined);
      if (indicator === "circle-bold") {
        expect(discos).toHaveLength(4);
        for (const e of discos) expect(e.minHeight).toBe(d.size.controlHLg);
      }
      cleanup();
    }
    expect(d.size.controlHLg).not.toBe(d.size.touchControlHLg);
  });
});
