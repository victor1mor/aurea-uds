// E17 e E18 (achados do app, 10 e 14/10/2026; conferidos de novo em 29/10/2026 na 0.48.0) — dois defeitos de encaixe do
// nativo, com o conserto que a referência do celular usa (lida no pacote publicado dela, 1.0.11, em 29/10/2026).
//
// E18 · o `Button fullWidth` perdia a altura do tamanho. A caixa ganhava `flex: 1` dentro do `Pressable` do alvo (uma
// coluna com o mínimo de 44): numa coluna, `flex: 1` zera a base, e a caixa ficava com a altura do alvo — 44 em todo
// tamanho (o `lg` com 44, e não 56). A referência não tem `flex: 1` no botão: a altura é a do tamanho, e a largura vem
// de esticar. Aqui, quem estica é o `alignSelf: "stretch"` do alvo, que já existia.
//
// E17 · o `brand` do `Header` não encolhia. Ele ia num `View` sem estilo, que nunca fica menor que o conteúdo: com um
// título comprido, a ação da direita saía da tela. Na referência, na fila de texto + ação, o texto encolhe e o fim fica
// do tamanho dele. Aqui o `brand` encolhe (`flexShrink: 1`, `minWidth: 0`) e não cresce: com espaço sobrando, a barra
// fica como sempre foi (o `space-between`).
//
// O dublê não calcula layout; o que se prova é o pedido ao motor. A prova medida é o teste de navegador
// (`tests/visual/nativo-e17-e18.spec.ts`, as páginas do nativo no `react-native-web`). Com o código de antes, 12 dos 16
// reprovam; os quatro que passam nos dois (o alvo que estica e as ações soltas) são as travas contra o conserto exagerar.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Button, Header, Text, Topbar, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Record<string, unknown>;

// A caixa desenhada do botão: o `View` em fila, de borda transparente, logo dentro do alvo.
const caixa = () => plano(__instancias("View").filter((v) => {
  const e = plano(v.style); return e.flexDirection === "row" && e.borderColor === "transparent";
}).at(-1)?.style);
const alvo = () => plano(__instancias("Pressable").at(-1)?.style);

const ALTURA = {
  xs: t.size.controlHSm, sm: t.size.touchControlHSm, md: t.size.touchControlHMd, lg: t.size.touchControlHLg,
  xl: t.size.touchControlHLg + t.size.space2,
} as const;

describe("E18 · o Button de largura inteira tem a altura do tamanho", () => {
  it.each(Object.entries(ALTURA))("size=%s: a caixa tem %i de altura e nenhum flex", (size, altura) => {
    render(<Envolve><Button size={size as keyof typeof ALTURA} fullWidth>Entrar</Button></Envolve>);
    const e = caixa();
    expect(e.height).toBe(altura);
    expect(e.flex).toBeUndefined();
    expect(e.flexGrow).toBeUndefined();
    expect(e.flexBasis).toBeUndefined();
  });
  it.each(Object.keys(ALTURA))("size=%s: só a largura muda — a caixa é a mesma do botão comum", (size) => {
    render(<Envolve><Button size={size as keyof typeof ALTURA}>Entrar</Button></Envolve>);
    const comum = caixa();
    render(<Envolve><Button size={size as keyof typeof ALTURA} fullWidth>Entrar</Button></Envolve>);
    expect(caixa()).toEqual(comum);
  });
  it("quem estica de lado continua sendo o alvo, e o alvo de toque continua com o mínimo de 44", () => {
    render(<Envolve><Button size="sm" fullWidth>Entrar</Button></Envolve>);
    expect(alvo().alignSelf).toBe("stretch");
    expect(alvo().minHeight).toBe(t.size.targetMin);
  });
});

describe("E17 · o brand do Header encolhe, e as ações não", () => {
  const TITULO = <Text numberOfLines={1}>Relatório semanal de vendas — um nome comprido</Text>;
  const embrulho = (brand: React.ReactNode) => plano(__instancias("View").find((v) => v.children === brand)?.style);

  it.each([["Header", Header], ["Topbar", Topbar]] as const)("%s: o embrulho do brand encolhe até zero e não cresce",
    (_nome, Comp) => {
      render(<Envolve><Comp variant="flush" brand={TITULO}><Button>⋯</Button></Comp></Envolve>);
      const e = embrulho(TITULO);
      expect(e.flexShrink).toBe(1);
      expect(e.minWidth).toBe(0);
      expect(e.flexGrow).toBeUndefined();
      expect(e.flex).toBeUndefined();
    });
  it.each(["floating", "flush", "pill"] as const)("variant=%s: as ações vão soltas na barra, sem embrulho que encolha",
    (variant) => {
      const acao = <Button>⋯</Button>;
      render(<Envolve><Header variant={variant} brand={TITULO}>{acao}</Header></Envolve>);
      expect(__instancias("View").some((v) => v.children === acao && plano(v.style).flexShrink === 1)).toBe(false);
    });
});
