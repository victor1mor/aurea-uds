// Lote N (0.29.0) · o NATIVO, com os mesmos nomes da web (ADR-0063, pedido de um app):
//   MT-01: `Card variant="contrast"` — o tema ESCURO dentro do cartão. No claro, o cartão do escuro
//          sem linha em volta; no escuro, o contorno amarelo com a borda de sempre. Todo filho se
//          ajusta, e o que sai do fluxo (a folha, o diálogo) volta ao tema do app;
//   MT-02: `Card accent` — o traço no topo, `accentWidth`, na cor CHEIA do tom, igual nos dois temas.
// O dublê só registra; o desenho se vê na bancada do `react-native-web`.
// Provado contra o defeito: na 0.28.0 o `contrast` e o `accent` não existem (o cartão sai comum, sem
// traço), e a 1ª versão desta sessão pintava a lista do `Select` aberta de dentro com o fundo do
// escuro e a letra do claro — os testes abaixo reprovam nas duas.
import {act, render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {
  AureaProvider, Badge, Button, Card, Dialog, Select, Text, resolverTokens, useAureaTheme,
} from "../../packages/native/src/index.js";

type Estilo = Record<string, unknown>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;
const textoDe = (c: string) => __instancias("Text").map((p) => ({...p, s: plano(p.style)})).findLast((p) => p.children === c);
const viewCom = (id: string) => plano(__instancias("View").findLast((p) => p.testID === id)?.style);
const CLARO = resolverTokens("light", "comfortable");
const ESCURO = resolverTokens("dark", "comfortable");

describe("MT-01 · Card contrast: o tema escuro dentro do cartão", () => {
  it("no claro, o cartão é o do escuro, sem linha em volta", () => {
    render(<AureaProvider theme="light"><Card variant="contrast" testID="c"><Text>Oi</Text></Card></AureaProvider>);
    const s = viewCom("c");
    expect(s.backgroundColor).toBe(ESCURO.color.card);
    expect(s.backgroundColor).not.toBe(CLARO.color.card);
    expect(s.borderColor).toBe("transparent");
    expect(textoDe("Oi")?.s.color).toBe(ESCURO.color.foreground);
  });

  it("no escuro, o contorno amarelo, com a borda de sempre", () => {
    render(<AureaProvider theme="dark"><Card variant="contrast" testID="c"><Text>Oi</Text></Card></AureaProvider>);
    const s = viewCom("c");
    expect(s.backgroundColor).toBe(ESCURO.color.card);
    expect(s.borderColor).toBe(ESCURO.color.primary);
    expect(s.borderWidth).toBe(ESCURO.size.borderWidth);
  });

  it("todo filho se ajusta: o destaque, o esmaecido e o selo saem iguais ao do tema escuro", () => {
    const tela = (tema: "light" | "dark", embrulho: boolean) => {
      const miolo = <>
        <Text tone="link">Destaque</Text><Text tone="muted">Esmaecido</Text>
        <Badge size="xs" tone="success">TUDO EM DIA</Badge>
      </>;
      return render(<AureaProvider theme={tema}>{embrulho ? <Card variant="contrast">{miolo}</Card> : miolo}</AureaProvider>);
    };
    const r1 = tela("dark", false);
    const noEscuro = ["Destaque", "Esmaecido", "TUDO EM DIA"].map((c) => textoDe(c)?.s.color);
    r1.unmount();
    tela("light", true);
    const noCartao = ["Destaque", "Esmaecido", "TUDO EM DIA"].map((c) => textoDe(c)?.s.color);
    expect(noCartao).toEqual(noEscuro);
    expect(noCartao[0]).toBe(ESCURO.color.link);
    expect(noCartao[1]).toBe(ESCURO.color.mutedForeground);
  });

  it("com onPress é UM botão com nome, e a pele é a mesma", () => {
    render(<AureaProvider theme="light">
      <Card variant="contrast" onPress={() => {}} accessibilityLabel="Abrir o painel"><Text>Moto</Text></Card>
    </AureaProvider>);
    const p = __instancias("Pressable").findLast((x) => x.accessibilityLabel === "Abrir o painel");
    expect(p?.accessibilityRole).toBe("button");
    expect(plano(p?.style).backgroundColor).toBe(ESCURO.color.card);
    expect(textoDe("Moto")?.s.color).toBe(ESCURO.color.foreground);
  });

  it("o useAureaTheme continua o do app: só os tokens mudam", () => {
    let visto = "";
    const Espia = () => { visto = useAureaTheme().theme; return null; };
    render(<AureaProvider theme="light"><Card variant="contrast"><Espia/></Card></AureaProvider>);
    expect(visto).toBe("light");
  });

  it("dentro do cartão da marca, o contrast não herda a tinta do amarelo", () => {
    render(<AureaProvider theme="light">
      <Card variant="brand" action={<Button>Agir</Button>}>
        <Card variant="contrast"><Text>Dentro</Text></Card>
      </Card>
    </AureaProvider>);
    expect(textoDe("Dentro")?.s.color).toBe(ESCURO.color.foreground);
    expect(textoDe("Dentro")?.s.color).not.toBe(CLARO.color.primaryForeground);
  });

  it("a lista do Select aberta de dentro sai no tema do APP (fundo e letra)", async () => {
    render(<AureaProvider theme="light">
      <Card variant="contrast">
        <Select testID="sel" items={[{value: "a", label: "Revisão"}, {value: "b", label: "Abastecimento"}]} value="a"/>
      </Card>
    </AureaProvider>);
    await act(async () => {
      (__instancias("Pressable").findLast((p) => p.testID === "sel")?.onPress as () => void)();
    });
    const lista = __instancias("View").map((p) => plano(p.style)).findLast((s) => s.maxHeight === "60%");
    expect(lista?.backgroundColor).toBe(CLARO.color.popover);
    expect(lista?.backgroundColor).not.toBe(ESCURO.color.popover);
    expect(textoDe("Abastecimento")?.s.color).toBe(CLARO.color.foreground);
  });

  it("o diálogo aberto de dentro também sai no tema do app", () => {
    render(<AureaProvider theme="light">
      <Card variant="contrast"><Dialog open onClose={() => {}} title="Painel"><Text>Corpo</Text></Dialog></Card>
    </AureaProvider>);
    const superficie = __instancias("View").map((p) => plano(p.style)).findLast((s) => s.maxWidth === 560);
    expect(superficie?.backgroundColor).toBe(CLARO.color.popover);
    expect(superficie?.backgroundColor).not.toBe(ESCURO.color.popover);
    expect(textoDe("Corpo")?.s.color).toBe(CLARO.color.foreground);
  });
});

describe("MT-02 · Card accent: o traço no topo", () => {
  const CHEIA = {brand: "primary", success: "success", info: "info", warning: "warning", danger: "destructive"} as const;
  const traco = () => __instancias("View").map((p) => plano(p.style)).findLast((s) => s.height === CLARO.size.accentWidth && typeof s.backgroundColor === "string");

  for (const tema of ["light", "dark"] as const) {
    for (const [tom, papel] of Object.entries(CHEIA)) {
      it(`${tom}, tema ${tema}: a cor CHEIA, a mesma nos dois temas`, () => {
        render(<AureaProvider theme={tema}><Card accent={tom as keyof typeof CHEIA}><Text>Caixa</Text></Card></AureaProvider>);
        expect(traco()?.backgroundColor).toBe(CLARO.color[papel]);
        expect(CLARO.color[papel]).toBe(ESCURO.color[papel]);
      });
    }
  }

  it("a camada do traço cobre a caixa da borda e se recorta no canto do cartão", () => {
    render(<AureaProvider theme="light"><Card accent="success"><Text>Caixa</Text></Card></AureaProvider>);
    const camada = __instancias("View").find((p) => p.pointerEvents === "none" && plano(p.style).overflow === "hidden");
    const s = plano(camada?.style);
    expect(s.position).toBe("absolute");
    expect(s.top).toBe(-CLARO.size.borderWidth);
    expect(s.left).toBe(-CLARO.size.borderWidth);
    expect(s.borderRadius).toBe(CLARO.size.radiusCard);
    expect(s.borderCurve).toBe("continuous");
  });

  it("o recheio de cima cresce o que o traço come, para o conteúdo ficar onde fica na web", () => {
    render(<AureaProvider theme="light"><Card accent="info" testID="c"><Text>Caixa</Text></Card></AureaProvider>);
    expect(viewCom("c").paddingTop).toBe(CLARO.size.cardPad + CLARO.size.accentWidth - CLARO.size.borderWidth);
  });

  it("funciona com onPress e com o contrast", () => {
    render(<AureaProvider theme="dark">
      <Card accent="danger" onPress={() => {}} accessibilityLabel="Perigo"><Text>Alvo</Text></Card>
    </AureaProvider>);
    expect(traco()?.backgroundColor).toBe(ESCURO.color.destructive);
    render(<AureaProvider theme="light"><Card variant="contrast" accent="brand"><Text>Moto</Text></Card></AureaProvider>);
    expect(traco()?.backgroundColor).toBe(ESCURO.color.primary);
  });

  it("sem accent, nada muda: nenhuma camada, o recheio de sempre", () => {
    render(<AureaProvider theme="light"><Card testID="c"><Text>Caixa</Text></Card></AureaProvider>);
    expect(__instancias("View").some((p) => p.pointerEvents === "none" && plano(p.style).overflow === "hidden")).toBe(false);
    expect(viewCom("c").paddingTop).toBeUndefined();
    expect(viewCom("c").padding).toBe(CLARO.size.cardPad);
  });
});
