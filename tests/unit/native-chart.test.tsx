// O `Chart` — o único componente deste pacote cuja GEOMETRIA é nossa (ADR-0041).
//
// ⚠ **Isto muda o que um teste consegue provar, e vale dizer antes.** Nos 44 componentes
// anteriores o teste perguntava "que props saíram?". Aqui ele pergunta **"a conta está certa?"** —
// o `y` de um valor, a largura de uma barra, o caminho de uma linha com buraco. Isso é mais
// testável, não menos: aritmética se verifica sem aparelho.
//
// O que continua fora do alcance é o mesmo de sempre: **se um `d` correto como texto sai torto
// como forma, só o vidro conta.**
import {render, act} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {
  AureaProvider, Chart, ChartLegend, criarRegistroDeIcones, defaultStrings, ptBR, resolverTokens,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={criarRegistroDeIcones({})}>{children}</AureaProvider>;

const todos = (p: string) => __instancias(p);
const textos = () => todos("Text").map((p) => p.children);

const LABELS = ["jan", "fev", "mar", "abr"];
const UMA = [{name: "Custo", data: [10, 20, 30, 40]}];
const DUAS = [
  {name: "Custo", data: [10, 20, 30, 40]},
  {name: "Meta", data: [15, 15, 15, 15]},
];

// O `Svg` só é montado depois do `onLayout`, que no dublê nunca dispara sozinho. Este ajudante
// desenha e ENTREGA a largura, que é o que põe a geometria para rodar.
function desenhar(no: React.ReactElement, largura = 344, altura = 220) {
  const r = render(<Envolve>{no}</Envolve>);
  const caixa = todos("View").find((p) => StyleSheet.flatten(p.style)?.height === altura);
  act(() => {
    (caixa?.onLayout as (e: unknown) => void)?.({nativeEvent: {layout: {width: largura, height: altura}}});
  });
  return r;
}

beforeEach(() => { __limpar(); });

describe("A escala — a conta que a web nunca precisou fazer", () => {
  // A BASE DE UM GRÁFICO DE BARRAS. Barra que não nasce no zero mente sobre a proporção: uma de
  // 40 ao lado de uma de 38 pareceria o dobro se a régua começasse em 38.
  it("o zero entra na régua quando os dados são todos positivos", () => {
    desenhar(<Chart labels={LABELS} series={UMA} mark="bar" testID="c" />);
    const numeros = todos("SvgText").map((p) => p.children).filter((v) => typeof v === "string");
    expect(numeros).toContain("0");
    expect(numeros).toContain("40");
  });

  // DEFEITO QUE SOME COM O TRAÇO: um intervalo de zero divide por zero.
  //
  // 🔴 **A PRIMEIRA VERSÃO DESTE TESTE PASSOU VERDE COM O DEFEITO DENTRO.** Ela conferia
  // `d.includes("M")` — e `0/0` produz `M NaN NaN L NaN NaN`, onde o "M" continua lá. Provado
  // tirando a guarda: o teste não acusou. **Gate que confere um caractere não confere uma
  // conta.** Agora ele cobra NÚMERO FINITO em toda coordenada, que é a propriedade de verdade.
  //
  // ⚠ **E o DADO do teste também estava errado — segunda camada do mesmo erro.** Com
  // `[15,15,15,15]` a guarda do ZERO já resolve antes (o `min` vira 0, e 0 ≠ 15), então a entrada
  // nunca chegava na guarda que eu queria provar. **O único caso alcançável é TUDO ZERO.**
  // Escolher a entrada que exercita o código é parte do teste, não detalhe dele.
  it("série toda em zero não divide por zero", () => {
    desenhar(<Chart labels={LABELS} series={[{name: "Meta", data: [0, 0, 0, 0]}]} />);
    const d = todos("Path").map((p) => p.d as string).find(Boolean)!;
    expect(d).not.toContain("NaN");
    const numeros = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    expect(numeros.length).toBeGreaterThan(0);
    expect(numeros.every((n) => Number.isFinite(n))).toBe(true);
  });

  it("lista vazia mostra o vazio, e não um desenho de nada", () => {
    render(<Envolve><Chart labels={[]} series={[]} /></Envolve>);
    expect(textos()).toContain(defaultStrings.dataEmpty);
    expect(todos("Svg")).toHaveLength(0);
  });

  // A MENTIRA MAIS FÁCIL DE UM GRÁFICO DE LINHA: ligar por cima de um buraco inventa um dado que
  // não existe. Tratar o buraco como zero é a outra versão da mesma mentira.
  it("buraco PULA — não vira zero e não liga os vizinhos", () => {
    desenhar(<Chart labels={LABELS} series={[{name: "s", data: [10, null, 30, 40]}]} />);
    const d = todos("Path").map((p) => p.d as string).find(Boolean)!;
    // Dois trechos: o `M` reabre o traço depois do buraco.
    expect(d.match(/M/g)?.length).toBe(2);
  });
});

describe("As marcas", () => {
  it("`line` desenha caminho sem preenchimento; `area` acrescenta o preenchido", () => {
    desenhar(<Chart labels={LABELS} series={UMA} mark="line" />);
    const soLinha = todos("Path");
    expect(soLinha).toHaveLength(1);
    expect(soLinha[0].fill).toBe("none");

    __limpar();
    desenhar(<Chart labels={LABELS} series={UMA} mark="area" />);
    const comArea = todos("Path");
    expect(comArea).toHaveLength(2);
    expect(comArea.some((p) => p.fillOpacity === 0.15)).toBe(true);
  });

  it("`bar` desenha um retângulo por ponto, com a ponta arredondada", () => {
    desenhar(<Chart labels={LABELS} series={UMA} mark="bar" />);
    const barras = todos("Rect");
    expect(barras).toHaveLength(4);
    expect(barras[0].rx).toBe(4);
  });

  // O VÃO ENTRE BARRAS não é enfeite: sem ele duas cores vizinhas viram um bloco só — e esta
  // paleta é uma rampa de um azul, onde vizinhas já são parecidas.
  it("duas séries de barra dividem a faixa e ficam mais estreitas", () => {
    desenhar(<Chart labels={LABELS} series={UMA} mark="bar" />);
    const sozinha = todos("Rect")[0].width as number;

    __limpar();
    desenhar(<Chart labels={LABELS} series={DUAS} mark="bar" />);
    const dividida = todos("Rect")[0].width as number;
    expect(dividida).toBeLessThan(sozinha);
  });

  it("uma série pode ter marca PRÓPRIA — barra e linha no mesmo desenho", () => {
    desenhar(
      <Chart labels={LABELS} mark="bar"
             series={[{name: "Custo", data: [10, 20, 30, 40]},
                      {name: "Meta", data: [15, 15, 15, 15], mark: "line"}]} />,
    );
    expect(todos("Rect").length).toBeGreaterThan(0);
    expect(todos("Path").length).toBeGreaterThan(0);
  });
});

describe("A cor — e a medição que decide uma prop", () => {
  // A ORDEM PADRÃO NÃO É 1,2,3,4,5. Ela começa pelo par MEDIDO no validador de paleta — os
  // únicos dois degraus desta rampa que passam no critério de daltonismo (ΔE 10.6). Degraus
  // vizinhos medem 5.9 e são indistinguíveis.
  it("a rampa padrão PULA um degrau, e começa pelo par medido", () => {
    desenhar(<Chart labels={LABELS} series={DUAS} mark="bar" />);
    const cores = todos("Rect").map((p) => p.fill);
    expect(cores).toContain(tokens.color.chart2);
    expect(cores).toContain(tokens.color.chart4);
    // E NÃO usa o degrau vizinho do primeiro.
    expect(cores).not.toContain(tokens.color.chart3);
  });

  it("`color` na série vence a rampa", () => {
    desenhar(<Chart labels={LABELS} mark="bar"
                    series={[{name: "s", data: [1, 2, 3, 4], color: "#ff0000"}]} />);
    expect(todos("Rect")[0].fill).toBe("#ff0000");
  });
});

describe("A legenda — obrigatória por MEDIÇÃO, não por gosto", () => {
  // A DECISÃO 3 DA ADR-0041. A paleta é uma rampa de um azul só; a cor sozinha não separa as
  // séries, e num telefone a marca é mais fina que na web. Desligar a legenda com duas séries
  // deixaria a identidade por conta da cor — que é justamente o que a medição reprova.
  it("com DUAS séries ela aparece mesmo com `showLegend={false}`", () => {
    desenhar(<Chart labels={LABELS} series={DUAS} showLegend={false} />);
    expect(textos()).toContain("Custo");
    expect(textos()).toContain("Meta");
    expect(todos("View").some((p) => p.accessibilityRole === "list")).toBe(true);
  });

  // Com UMA série a legenda é ruído: o nome do gráfico já a identifica.
  it("com UMA série ela não aparece sozinha", () => {
    desenhar(<Chart labels={LABELS} series={UMA} />);
    expect(todos("View").some((p) => p.accessibilityRole === "list")).toBe(false);
  });

  it("`showLegend` liga a de uma série só", () => {
    desenhar(<Chart labels={LABELS} series={UMA} showLegend />);
    expect(todos("View").some((p) => p.accessibilityRole === "list")).toBe(true);
  });

  // A cor NUNCA é a única coisa que identifica a série — regra da ficha da web, e aqui ela pesa
  // mais por causa da rampa.
  it("o nome da série é TEXTO, não só um quadrado colorido", () => {
    __limpar();
    render(<Envolve><ChartLegend series={DUAS} /></Envolve>);
    expect(textos()).toContain("Custo");
    const nomes = todos("View").map((p) => p.accessibilityLabel).filter(Boolean);
    expect(nomes).toContain("Custo");
  });
});

describe("O toque — porque não há ponteiro", () => {
  // A ficha da web diz que o tooltip "segue o ponteiro e não é focável". As DUAS metades caem no
  // toque. O que fica no lugar é uma faixa tocável por rótulo, com nome.
  it("cada rótulo é um alvo, e o nome dele carrega os valores", () => {
    desenhar(<Chart labels={LABELS} series={DUAS} />);
    const alvos = todos("Pressable");
    expect(alvos).toHaveLength(4);
    expect(alvos[0].accessibilityLabel).toBe("jan, Custo: 10, Meta: 15");
  });

  it("tocar seleciona, avisa o app, e acende o ponto", () => {
    const escolher = vi.fn();
    desenhar(<Chart labels={LABELS} series={UMA} onSelect={escolher} />);
    expect(todos("Circle")).toHaveLength(0);

    act(() => { (todos("Pressable")[2].onPress as () => void)(); });
    expect(escolher).toHaveBeenCalledWith(2);
    expect(todos("Circle").length).toBeGreaterThan(0);
  });

  // ⚠ A CAMADA DE ACESSIBILIDADE. A web delega isso ao teclado do `recharts`; aqui não há motor
  // nem setas, então os valores saem em TEXTO. É por isso que vem ligado.
  it("selecionar mostra os valores em TEXTO, e é o padrão", () => {
    desenhar(<Chart labels={LABELS} series={DUAS} selectedIndex={1} />);
    expect(textos()).toContain("fev");
    expect(textos()).toContain("20");
    expect(textos()).toContain("15");
  });

  it("`showValues={false}` desliga, mas o desenho continua", () => {
    desenhar(<Chart labels={LABELS} series={DUAS} selectedIndex={1} showValues={false} />);
    expect(textos()).not.toContain("20");
    expect(todos("Path").length).toBeGreaterThan(0);
  });

  it("`formatValue` manda no eixo E na seleção", () => {
    desenhar(<Chart labels={LABELS} series={UMA} selectedIndex={0}
                    formatValue={(v) => `R$ ${v}`} />);
    expect(textos()).toContain("R$ 10");
    expect(todos("SvgText").map((p) => p.children)).toContain("R$ 0");
  });
});

describe("O papel que o RN aceita e não mapeia — terceira vez", () => {
  // MEDIDO no `fromRole()` do Android: não há `GROUP`, ele cai em `else -> null`. A ficha da web
  // diz `role="group"`; escrevê-lo aqui passaria no `tsc` e seria inútil no aparelho — como
  // `dialog` (Lote 5) e `table` (Lote 6).
  it("o Chart não usa `group`; ele agrupa com `accessible` + nome", () => {
    desenhar(<Chart labels={LABELS} series={UMA} label="Custo por mês" />);
    const papeis = [...todos("View"), ...todos("Svg")].flatMap((p) => [p.accessibilityRole, p.role]);
    expect(papeis).not.toContain("group");

    const grupo = todos("View").find((p) => p.accessibilityLabel === "Custo por mês");
    expect(grupo?.accessible).toBe(true);
  });

  it("sem `label`, cai na frase da tabela de frases — e ela traduz", () => {
    desenhar(<Chart labels={LABELS} series={UMA} />);
    const grupo = todos("View").find((p) => p.accessible && p.accessibilityLabel);
    expect(grupo?.accessibilityLabel).toBe(defaultStrings.chartLabel);
    expect(ptBR.chartLabel).toBe("Gráfico");
  });
});

describe("Os eixos", () => {
  // Sem eles a calha reservada fica vazia e o gráfico vira uma forma sem unidade.
  it("desenha os números do Y e os rótulos do X", () => {
    desenhar(<Chart labels={LABELS} series={UMA} yTicks={4} />);
    const t = todos("SvgText").map((p) => p.children);
    expect(t).toContain("jan");
    expect(t).toContain("abr");
    expect(t).toContain("0");
    expect(t).toContain("40");
  });

  it("`yTicks` manda em quantas marcas saem", () => {
    desenhar(<Chart labels={LABELS} series={UMA} yTicks={2} />);
    // 2 marcas -> 3 linhas de grade (as pontas contam).
    expect(todos("Line").filter((p) => p.x1 !== p.x2)).toHaveLength(3);
  });

  it("a grade é recessiva — cor de borda, não de dado", () => {
    desenhar(<Chart labels={LABELS} series={UMA} />);
    const grade = todos("Line").filter((p) => p.x1 !== p.x2);
    expect(grade.every((p) => p.stroke === tokens.color.border)).toBe(true);
  });
});
