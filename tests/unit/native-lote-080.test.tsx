// O lote 080 (0.70.0), no nativo — as peças que o Victor aprovou olhando em 14/11/2026:
//   • PV-08 (*"Pode, os dois"*): `Stepper orientation="vertical"` — um passo embaixo do outro, a linha descendo entre as
//     bolinhas (amarela quando o próximo passo já foi feito ou é o atual), nenhuma depois do último; o padrão não muda.
//   • O `Input` e o `Field` do nativo (aprovados em 12/10, *"eu falei pra copiar tudo"*): `variant` (o `secondary` da
//     web), `required` no `Field` (o asterisco), `invalid` no próprio campo e a cor da seleção (a do `::selection`).
//   • O "sem linha" 1a (*"B, ponta a ponta"*): a linha clara embaixo da fila das abas `secondary`, na fileira que rola
//     (a largura toda); a borda transparente de dentro sai, para a altura não mudar. Também na Ember (14/11/2026).
// Provado contra o defeito: com o nativo da 0.69.0 o `orientation` não existe (a trilha continua em linha, sem linha entre
// as bolinhas) e a fileira das abas não tem borda nenhuma.
import {render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Field, Input, Stepper, Tabs, Textarea, resolverTokens} from "../../packages/native/src/index.js";
import {preenchimento} from "../../packages/native/src/estilos.js";

type Estilo = Record<string, unknown>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;
const CLARO = resolverTokens("light", "comfortable");
const PASSOS = [{label: "Conta", state: "done"}, {label: "Perfil", state: "done"}, {label: "Conteúdo", state: "active"},
  {label: "Agendamento"}, {label: "Revisão", optional: "Opcional"}] as const;

describe("PV-08 · Stepper em pé, no nativo", () => {
  const linhas = () => __instancias("View").map((p) => plano(p.style)).filter((s) => s.position === "absolute" && s.width === CLARO.size.borderWidth * 2);

  it("a trilha vira coluna e cada passo vira linha (bolinha + texto)", () => {
    render(<AureaProvider theme="light"><Stepper label="Publicar" orientation="vertical" testID="s" items={PASSOS as never} /></AureaProvider>);
    const trilha = plano(__instancias("View").find((p) => p.testID === "s")?.style);
    expect(trilha.flexDirection).toBe("column");
    const passos = __instancias("View").filter((p) => p.role === "listitem").map((p) => plano(p.style));
    expect(passos).toHaveLength(5);
    for (const s of passos) expect(s.flexDirection).toBe("row");
    expect(passos[0].paddingBottom).toBe(CLARO.size.space6);
    expect(passos[4].paddingBottom).toBe(0);
  });

  it("a linha desce entre as bolinhas — amarela até o passo atual, cinza depois, nenhuma depois do último", () => {
    render(<AureaProvider theme="light"><Stepper orientation="vertical" items={PASSOS as never} /></AureaProvider>);
    const l = linhas();
    expect(l).toHaveLength(4);
    expect(l.map((s) => s.backgroundColor)).toEqual([CLARO.color.primary, CLARO.color.primary, CLARO.color.border, CLARO.color.border]);
    // o meio da bolinha de 32, com a espessura de duas bordas, como a linha deitada da web
    expect(l[0].start).toBe(32 / 2 - CLARO.size.borderWidth);
    expect(l[0].top).toBe(32);
  });

  it("sem orientation, nada muda: a trilha em linha, sem linha entre as bolinhas", () => {
    render(<AureaProvider theme="light"><Stepper testID="s" items={PASSOS as never} /></AureaProvider>);
    expect(plano(__instancias("View").find((p) => p.testID === "s")?.style).flexDirection).toBe("row");
    expect(linhas()).toHaveLength(0);
  });
});

describe("O \"sem linha\" 1a · a linha embaixo da fila das abas secondary, no nativo", () => {
  const ABAS = [{id: "a", label: "Visão geral", content: null}, {id: "b", label: "Detalhes", content: null}];
  const fileira = () => plano(__instancias("ScrollView").at(-1)?.style);
  const fila = () => plano(__instancias("View").findLast((p) => p.accessibilityRole === "tablist")?.style);

  it("a linha clara vai na fileira que rola (a largura toda), e a borda de dentro sai", () => {
    render(<AureaProvider theme="light"><Tabs variant="secondary" tabs={ABAS} value="a" /></AureaProvider>);
    expect(fileira().borderBottomWidth).toBe(CLARO.size.borderWidth);
    expect(fileira().borderColor).toBe(preenchimento(CLARO, 2));
    expect(fila().borderBottomWidth).toBe(0);
    // a marca que a varredura do site reconhece (só existe no navegador)
    expect(__instancias("ScrollView").at(-1)?.dataSet).toEqual({aureaLine: "tabs"});
  });

  it("na Ember também (a regra de 14/11/2026)", () => {
    render(<AureaProvider theme="light" brand="ember"><Tabs variant="secondary" tabs={ABAS} value="a" /></AureaProvider>);
    expect(fileira().borderBottomWidth).toBe(CLARO.size.borderWidth);
  });

  it("na cápsula (primary), nada muda", () => {
    render(<AureaProvider theme="light"><Tabs tabs={ABAS} value="a" /></AureaProvider>);
    expect(fileira().borderBottomWidth).toBeUndefined();
  });
});

describe("O Input e o Field do nativo · variant, required, invalid e a cor da seleção", () => {
  const campo = () => __instancias("TextInput").at(-1)!;
  const estilo = () => plano(campo().style);

  it("variant=\"secondary\": o cinza do secondary, sem a sombra; primary (padrão) não muda", () => {
    render(<AureaProvider theme="light"><Field label="Nome"><Input variant="secondary" /></Field></AureaProvider>);
    expect(estilo().backgroundColor).toBe(CLARO.color.secondary);
    expect(estilo().boxShadow).toEqual([]);
    render(<AureaProvider theme="light"><Field label="Nome"><Input /></Field></AureaProvider>);
    expect(estilo().backgroundColor).toBe(CLARO.color.card);
    render(<AureaProvider theme="light"><Field label="Nome"><Textarea variant="secondary" /></Field></AureaProvider>);
    expect(estilo().backgroundColor).toBe(CLARO.color.secondary);
  });

  it("invalid={false} desmente o Field com erro; invalid marca sem Field", () => {
    render(<AureaProvider theme="light"><Field label="Email" error="Errado"><Input invalid={false} /></Field></AureaProvider>);
    expect(campo()["aria-invalid"]).toBe(false);
    render(<AureaProvider theme="light"><Field label="Email" error="Errado"><Input /></Field></AureaProvider>);
    expect(campo()["aria-invalid"]).toBe(true);
    render(<AureaProvider theme="light"><Input invalid /></AureaProvider>);
    expect(campo()["aria-invalid"]).toBe(true);
  });

  it("a cor do texto escolhido é a do ::selection da web", () => {
    render(<AureaProvider theme="light"><Input /></AureaProvider>);
    expect(campo().selectionColor).toBe(CLARO.color.selection);
  });

  it("required: o asterisco depois do rótulo, na cor de erro, fora da leitura", () => {
    render(<AureaProvider theme="light"><Field label="Email" required><Input /></Field></AureaProvider>);
    const ast = __instancias("Text").findLast((p) => p.children === "*");
    expect(ast).toBeDefined();
    expect(ast!.accessibilityElementsHidden).toBe(true);
    expect(plano(ast!.style).color).toBe(CLARO.color.danger400 ?? CLARO.color.destructive);
    render(<AureaProvider theme="light"><Field label="Email"><Input /></Field></AureaProvider>);
    expect(__instancias("Text").filter((p) => p.children === "*")).toHaveLength(1);  // só o do render anterior
  });
});

// 0-D e 0-E no nativo (14/11/2026) — as formas que o Victor aprovou na web em 04/11/2026 (ADR-0090): o `highContrast` ("C")
// e o `textSize="lg"` ("B") no `AureaProvider`. Provado contra o defeito: no nativo da 0.69.0 as duas props não existem.
import {Button, Card, Link, Text as TextoAurea, useAureaTokens} from "../../packages/native/src/index.js";
import {useMaisContraste} from "../../packages/native/src/contraste.js";

describe("0-D e 0-E · os modos de leitura no AureaProvider do nativo", () => {
  let lidos: ReturnType<typeof useAureaTokens> | null = null;
  let mais: boolean | null = null;
  function Ler() { lidos = useAureaTokens(); mais = useMaisContraste(); return null; }

  it("textSize=\"lg\": cada degrau da letra sobe 2, do xs ao 2xl; o resto não muda", () => {
    render(<AureaProvider theme="light" textSize="lg"><Ler /></AureaProvider>);
    for (const k of ["textXs", "textSm", "textBase", "textLg", "textXl", "text2xl"] as const) expect(lidos!.size[k]).toBe(CLARO.size[k] + 2);
    expect(lidos!.size.text3xl).toBe(CLARO.size.text3xl);
    expect(lidos!.size.controlHMd).toBe(CLARO.size.controlHMd);
  });

  it("highContrast: o apoio a 80% do texto, as marcas na tinta, e o \"aumentar contraste\" ligado", () => {
    render(<AureaProvider theme="light" highContrast><Ler /></AureaProvider>);
    expect(lidos!.color.mutedForeground).not.toBe(CLARO.color.mutedForeground);
    expect(lidos!.color.controlThumb).toBe(CLARO.color.brandYellowInk);
    expect(mais).toBe(true);
  });

  it("sem as props, nada muda; um provedor de dentro sem elas herda as de fora", () => {
    render(<AureaProvider theme="light"><Ler /></AureaProvider>);
    expect(lidos!.size.textSm).toBe(CLARO.size.textSm);
    expect(lidos!.color.mutedForeground).toBe(CLARO.color.mutedForeground);
    render(<AureaProvider theme="light" textSize="lg" highContrast><AureaProvider theme="dark"><Ler /></AureaProvider></AureaProvider>);
    expect(lidos!.size.textSm).toBe(resolverTokens("dark", "comfortable").size.textSm + 2);
    expect(mais).toBe(true);
  });

  it("no alto contraste, o cartão ganha o contorno de 3:1, o botão o aro por dentro, e o link o sublinhado", () => {
    render(<AureaProvider theme="light" highContrast><Card testID="c"><TextoAurea>x</TextoAurea></Card></AureaProvider>);
    expect(plano(__instancias("View").findLast((p) => p.testID === "c")?.style).borderColor).toBe(CLARO.color.inputStrong);
    // as marcas do navegador que a varredura do site reconhece: o contorno do cartão e o aro do botão
    expect(__instancias("View").findLast((p) => p.testID === "c")?.dataSet).toEqual({aureaContrast: "high"});
    render(<AureaProvider theme="light" highContrast><Button testID="b" tone="neutral" onPress={() => {}}>Salvar</Button></AureaProvider>);
    // o aro vai na caixa do botão (a mesma do brilho e do fio, ADR-0086)
    const aros = __instancias("View").map((p) => plano(p.style)).filter((s) => JSON.stringify(s.boxShadow ?? []).includes("\"inset\":true"));
    expect(aros.length, "o botão ganha o aro por dentro").toBeGreaterThan(0);
    expect(JSON.stringify(aros.at(-1)!.boxShadow)).toContain(CLARO.color.inputStrong);
    expect(__instancias("View").findLast((p) => JSON.stringify(plano(p.style).boxShadow ?? []).includes("\"inset\":true"))?.dataSet)
      .toEqual({aureaContrast: "high"});
    render(<AureaProvider theme="light" highContrast><TextoAurea tone="link">Ver</TextoAurea></AureaProvider>);
    expect(plano(__instancias("Text").findLast((p) => JSON.stringify(p.style ?? "").includes("underline"))?.style).textDecorationLine).toBe("underline");
  });
});

// D4 no nativo (aprovado em 19/10/2026, visto na imagem em 14/11/2026): a marca no fim e cinza; a Ember como era.
import {DropdownMenu, Select} from "../../packages/native/src/index.js";
import {indicadorDaEscolhida} from "../../packages/native/src/inputs.js";

describe("D4 · a marca do escolhido no nativo", () => {
  const corDoVisto = (t: ReturnType<typeof resolverTokens>) => (indicadorDaEscolhida(t) as React.ReactElement<{children: React.ReactElement<{color: string}>[]}>);
  it("o visto do Select é cinza (o de apoio), também na Ember", () => {
    const claro = corDoVisto(CLARO); const filho = React.Children.toArray(claro.props.children).find((c) => React.isValidElement(c)) as React.ReactElement<{color: string}>;
    expect(filho.props.color).toBe(CLARO.color.mutedForeground);
    const EMBER = resolverTokens("light", "comfortable", undefined, "ember");
    const fe = React.Children.toArray(corDoVisto(EMBER).props.children).find((c) => React.isValidElement(c)) as React.ReactElement<{color: string}>;
    expect(fe.props.color).toBe(EMBER.color.mutedForeground);
  });
});
