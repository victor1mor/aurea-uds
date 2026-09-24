// LOTE 4 DOS ACHADOS DOS CONSUMIDORES, segunda parte — o nativo, 24/09/2026 (`0.8.14`).
//
// Seis fichas, na ordem de quantos remendos cada uma tira da regra "só Aurea" do app:
// R-01 (7), R-09 (3), R-02 (3), R-07 (2), R-06 (1), R-05 (1). Cada uma foi conferida contra o
// código antes de aceitar, e UMA mudou no caminho: a R-01 dizia que a web deixava o selo do
// tamanho do texto, e MEDIDO no navegador ela estica igual dentro de uma coluna (300 px contra
// 55 px solto). Por isso a R-01 é prop nova, e não mudança do padrão.
//
// Cada `expect` que cobra o comportamento novo REPROVAVA antes dele.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {
  AureaProvider, Badge, BottomNav, BottomNavProvider, Button, Cluster, Icon, Input, Screen, Text,
  Topbar, comOpacidade, criarGlifo, criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";

const claro = resolverTokens("light", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider theme="light">{children}</AureaProvider>;
type Estilo = Record<string, unknown>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;
const ultima = (tipo: string, id: string) =>
  __instancias(tipo).filter((p) => p.testID === id).at(-1);

// ═════════════════════════════════════════════════════════════════════════════════════════════
describe("R-01 · `Badge fit=\"content\"`", () => {
  it("o padrão segue o recipiente: nenhum `alignSelf`", () => {
    render(<Envolve><Badge testID="b">Em dia</Badge></Envolve>);
    expect(plano(ultima("View", "b")?.style).alignSelf).toBeUndefined();
  });

  it("`content` não estica numa coluna", () => {
    render(<Envolve><Badge testID="b" fit="content">Em dia</Badge></Envolve>);
    expect(plano(ultima("View", "b")?.style).alignSelf).toBe("flex-start");
  });

  // Ancorado, o selo é absoluto sobre o canto de outra peça: `fit` ali não teria sentido.
  it("ancorado, a prop é ignorada no selo", () => {
    render(<Envolve><Badge fit="content" count={3} anchor="top-end"><Text>x</Text></Badge></Envolve>);
    const selo = __instancias("View").map((p) => plano(p.style)).find((e) => e.position === "absolute");
    expect(selo?.alignSelf).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
describe("R-09 · `Cluster` com `align`, `justify` e `wrap`", () => {
  it("sem props, nada muda: centro no eixo cruzado e quebra de linha", () => {
    render(<Envolve><Cluster testID="c" /></Envolve>);
    const e = plano(ultima("View", "c")?.style);
    expect(e.alignItems).toBe("center");
    expect(e.flexWrap).toBe("wrap");
    expect(e.justifyContent).toBeUndefined();
  });

  it.each([
    ["start", "flex-start"], ["center", "center"], ["end", "flex-end"], ["between", "space-between"],
  ] as const)("justify=%s vira justifyContent %s", (justify, esperado) => {
    render(<Envolve><Cluster testID="c" justify={justify} /></Envolve>);
    expect(plano(ultima("View", "c")?.style).justifyContent).toBe(esperado);
  });

  it.each([
    ["start", "flex-start"], ["center", "center"], ["end", "flex-end"], ["baseline", "baseline"],
  ] as const)("align=%s vira alignItems %s", (align, esperado) => {
    render(<Envolve><Cluster testID="c" align={align} /></Envolve>);
    expect(plano(ultima("View", "c")?.style).alignItems).toBe(esperado);
  });

  it("`wrap={false}` mantém tudo numa linha", () => {
    render(<Envolve><Cluster testID="c" wrap={false} /></Envolve>);
    expect(plano(ultima("View", "c")?.style).flexWrap).toBe("nowrap");
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
describe("R-02 · `Topbar inset`", () => {
  const recuo = () => plano(ultima("View", "t")?.style).paddingHorizontal;

  it("a `flush` continua recuando 20 por padrão", () => {
    render(<Envolve><Topbar testID="t" variant="flush" /></Envolve>);
    expect(recuo()).toBe(claro.size.space5);
  });

  // A prova do alinhamento é contra a PRÓPRIA `Screen`, e não contra um número escrito aqui.
  it("`page` recua o mesmo que a `Screen`", () => {
    render(<Envolve><Screen testID="s"><Topbar testID="t" variant="flush" inset="page" /></Screen></Envolve>);
    expect(recuo()).toBe(plano(ultima("SafeAreaView", "s")?.style).padding);
    expect(recuo()).toBe(claro.size.space4);
  });

  it("`none` zera o recuo", () => {
    render(<Envolve><Topbar testID="t" variant="flush" inset="none" /></Envolve>);
    expect(recuo()).toBe(0);
  });

  it("as caixas com margem própria ignoram a prop", () => {
    render(<Envolve><Topbar testID="t" variant="floating" inset="none" /></Envolve>);
    expect(recuo()).toBe(claro.size.space4);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
describe("R-07 · o token de opacidade e o `comOpacidade`", () => {
  it("o token existe e vale o 0,5 do HeroUI", () => {
    expect(claro.size.opacityDisabled).toBe(0.5);
  });

  it("o campo desativado lê o token", () => {
    render(<Envolve><Input testID="i" disabled /></Envolve>);
    const achatados = __instancias("View").concat(__instancias("TextInput")).map((p) => plano(p.style));
    expect(achatados.some((e) => e.opacity === claro.size.opacityDisabled)).toBe(true);
  });

  it("`comOpacidade` sai pela porta da frente e acrescenta o alfa ao hex", () => {
    expect(comOpacidade("#f0b100", 0.14)).toBe("#f0b10024");
    // cor que não é hex de seis dígitos volta crua, para nunca sair algo que o RN descarte
    expect(comOpacidade("red", 0.5)).toBe("red");
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
describe("R-06 · `Screen footer`", () => {
  const rodape = () => __instancias("View").concat(__instancias("SafeAreaView"))
    .map((p) => ({p, e: plano(p.style)})).find(({e}) => e.marginTop === "auto");

  it("sem `footer`, nada muda", () => {
    render(<Envolve><Screen scroll><Text>x</Text></Screen></Envolve>);
    expect(rodape()).toBeUndefined();
  });

  it("com `scroll` e a borda de baixo na raiz: recuo `space4` e colado embaixo", () => {
    render(<Envolve><Screen scroll footer={<Button>Assinar</Button>}><Text>x</Text></Screen></Envolve>);
    const r = rodape();
    expect(r).toBeDefined();
    expect(r?.e.padding).toBe(claro.size.space4);
  });

  // A raiz sem a borda de baixo não soma o inset — então o rodapé tem de pegá-la sozinho.
  it("sem a borda de baixo na raiz, o rodapé pega a área do sistema com a própria SafeAreaView", () => {
    render(
      <Envolve>
        <Screen scroll edges={["top"]} footer={<Button>Assinar</Button>}><Text>x</Text></Screen>
      </Envolve>);
    const r = __instancias("SafeAreaView").find((p) => plano(p.style).marginTop === "auto");
    expect(r?.edges).toEqual(["bottom"]);
  });

  it("dentro de um `BottomNavProvider`, sobe acima da barra, e a rolagem não reserva de novo", () => {
    const ITENS = [{id: "a", label: "A", onPress: () => {}}];
    render(
      <Envolve><BottomNavProvider>
        <Screen scroll edges={["top"]} footer={<Button>Assinar</Button>}><Text>x</Text></Screen>
        <BottomNav items={ITENS} current="a" testID="nav" />
      </BottomNavProvider></Envolve>);
    const barra = __instancias("View").filter((p) => p.testID === "nav").at(-1);
    React.act(() => { (barra?.onLayout as (e: unknown) => void)({nativeEvent: {layout: {height: 60}}}); });
    // o que a barra conta ao provedor: a pílula mais as duas margens (inset 0 no dublê)
    const espaco = 60 + claro.size.space4 * 2;
    const r = __instancias("View").map((p) => plano(p.style)).filter((e) => e.marginTop === "auto").at(-1);
    expect(r?.paddingBottom).toBe(claro.size.space4 + espaco);
    // e a rolagem termina em cima do rodapé: ela NÃO soma o espaço da barra outra vez
    const conteudo = plano(__instancias("ScrollView").at(-1)?.contentContainerStyle);
    expect(conteudo.paddingBottom).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
describe("R-05 · `criarGlifo`", () => {
  it("o `Icon` desenha o glifo do app, na cor do tema, sem o app tocar no motor de SVG", () => {
    // Criado AQUI e não no corpo do `describe`: lá, no código antigo, a falta do `criarGlifo`
    // derrubava o arquivo inteiro e escondia as outras cinco fichas.
    const Marca = criarGlifo({
      viewBox: "0 0 64 64",
      circles: [{cx: 32, cy: 32, r: 30}],
      paths: ["M10 10L20 20", {d: "M1 1", fill: "#ff0000"}],
    });
    const ICONES = criarRegistroDeIcones({marca: Marca});
    render(<AureaProvider theme="light" icons={ICONES}><Icon name="marca" size="xl" /></AureaProvider>);
    const svg = __instancias("Svg").at(-1);
    expect(svg?.viewBox).toBe("0 0 64 64");
    expect(svg?.width).toBe(claro.size.iconXl);
    expect(__instancias("Circle").at(-1)?.fill).toBe(claro.color.foreground);
    const caminhos = __instancias("Path");
    expect(caminhos.map((p) => p.d)).toEqual(["M10 10L20 20", "M1 1"]);
    // a cor fixa de uma forma ganha da cor do tema
    expect(caminhos[1]?.fill).toBe("#ff0000");
    expect(caminhos[0]?.fill).toBe(claro.color.foreground);
  });

  it("sem `viewBox`, a caixa é a do Carbon", () => {
    render(<AureaProvider theme="light" icons={criarRegistroDeIcones({x: criarGlifo({paths: ["M0 0"]})})}>
      <Icon name="x" /></AureaProvider>);
    expect(__instancias("Svg").at(-1)?.viewBox).toBe("0 0 32 32");
  });
});
