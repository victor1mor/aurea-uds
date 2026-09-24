// Os SEIS achados que o app trouxe da tela de entrar, 16/09/2026 — mais o OITAVO, que veio
// depois, da tela de adicionar veículo (o §8 no fim deste arquivo) — conferidos por ele no `dist`
// publicado da `0.8.2`, e os seis eram verdade.
//
// ⚠ **O tema deste arquivo é DEFEITO QUE NÃO APARECE NA TELA.** Cinco dos seis passaram por 1430
// testes, pelo `validate.py`, pelo build e pela publicação: um contraste que só falha num tema,
// props descartadas em silêncio, um ícone que só avisa em desenvolvimento. Quem pegou foi um
// consumidor usando.
import {render, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";

import {
  Alert, AureaProvider, Button, Chart, Combobox, IconButton, Input, PasswordField, Separator,
  Text,
  criarRegistroDeIcones, resolverTokens,
} from "../../packages/native/src/index.js";

const claro = resolverTokens("light", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones(
  {view: Glifo, "view--off": Glifo, locked: Glifo, add: Glifo, close: Glifo,
   "chevron--down": Glifo, "information--filled": Glifo, "warning--filled": Glifo,
   "checkmark--filled": Glifo, "error--filled": Glifo});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider theme="light" icons={ICONES}>{children}</AureaProvider>;

type Props = Record<string, unknown>;
const props = (primitivo: string, n = 0): Props => __instancias(primitivo)[n] ?? {};
const porID = (primitivo: string, id: string): Props =>
  __instancias(primitivo).filter((p) => p.testID === id).at(-1) ?? {};

describe("1 · o tom da marca escrevendo texto", () => {
  // O DEFEITO: o amarelo de PREENCHER usado para ESCREVER mede 1,73:1 no tema claro, contra os
  // 4,5:1 que a WCAG exige. O `link` é o mesmo matiz mais escuro: 5,02:1.
  it("ghost com tom da marca escreve em `link`, não em `primary`", () => {
    render(<Envolve><Button appearance="ghost" tone="brand" testID="b">Entrar</Button></Envolve>);
    const texto = __instancias("Text").at(-1) ?? {};
    const cor = StyleSheet.flatten(texto.style).color;
    expect(cor).toBe(claro.color.link);
    expect(cor).not.toBe(claro.color.primary);
  });

  it("outline também", () => {
    render(<Envolve><Button appearance="outline" tone="brand">Entrar</Button></Envolve>);
    expect(StyleSheet.flatten((__instancias("Text").at(-1) ?? {}).style).color)
      .toBe(claro.color.link);
  });

  // E o outro sentido: no botão SÓLIDO o amarelo continua sendo o fundo, e isso não pode mudar —
  // a identidade diz que o amarelo de preencher é invariável.
  // ⚠ O fundo NÃO está no `Pressable`: ele é só o alvo de toque de 44 dp (decisão de 03/09,
  // documentada no `actions.tsx`). A cápsula que se vê é um `View` por dentro.
  it("sólido mantém o amarelo da marca no FUNDO", () => {
    render(<Envolve><Button appearance="solid" tone="brand" testID="s">Entrar</Button></Envolve>);
    const capsula = __instancias("View").some(
      (v) => StyleSheet.flatten(v.style)?.backgroundColor === claro.color.primary);
    expect(capsula).toBe(true);
  });

  // ⚠ ACHADO POR MEDIR OS OUTROS TONS, e não por parar no primeiro: o `destructive` escrito no
  // tema claro dá 4,30:1 e reprova também. Vale o mesmo conserto.
  it("o tom `danger` também escreve numa cor legível", () => {
    render(<Envolve><Button appearance="ghost" tone="danger">Apagar</Button></Envolve>);
    const cor = StyleSheet.flatten((__instancias("Text").at(-1) ?? {}).style).color;
    expect(cor).toBe(claro.color.danger400);
    expect(cor).not.toBe(claro.color.destructive);
  });

  // O `IconButton` pinta o GLIFO com a mesma cor do texto — então ele herda o conserto.
  it("o IconButton segue a mesma regra", () => {
    render(<Envolve>
      <IconButton appearance="ghost" tone="brand" name="add" label="Somar" testID="ib" />
    </Envolve>);
    expect(porID("Pressable", "ib").accessibilityLabel).toBe("Somar");
  });
});

describe("2 · o tom `link` no Text", () => {
  it("existe e usa a cor de link", () => {
    render(<Envolve><Text tone="link">Esqueci minha senha</Text></Envolve>);
    expect(StyleSheet.flatten(props("Text").style).color).toBe(claro.color.link);
  });

  it("e `primary` continua sendo outra coisa", () => {
    render(<Envolve><Text tone="primary">x</Text></Envolve>);
    expect(StyleSheet.flatten(props("Text").style).color).toBe(claro.color.primary);
  });
});

describe("3 · o Input parou de descartar props", () => {
  // O DEFEITO MAIS CARO, e o único MUDO: sem estas props o gerenciador de senhas não reconhece
  // os campos, o teclado "corrige" o e-mail e o "próximo" não pula para a senha. Nada na tela.
  it("repassa o que o TextInput entende", () => {
    render(<Envolve>
      <Input autoComplete="email" textContentType="emailAddress" autoCorrect={false}
             returnKeyType="next" maxLength={120} />
    </Envolve>);
    const p = props("TextInput");
    expect(p.autoComplete).toBe("email");
    expect(p.textContentType).toBe("emailAddress");
    expect(p.autoCorrect).toBe(false);
    expect(p.returnKeyType).toBe("next");
    expect(p.maxLength).toBe(120);
  });

  it("aceita ref — é como o «próximo» foca a senha", () => {
    const alvo = React.createRef<never>();
    render(<Envolve><Input ref={alvo} /></Envolve>);
    expect(props("TextInput").ref).toBe(alvo);
  });

  it("e o que a Aurea calcula continua vencendo", () => {
    render(<Envolve><Input disabled /></Envolve>);
    expect(props("TextInput").editable).toBe(false);
  });

  // A camada dupla: o PasswordField já repassava, e o Input é que jogava fora.
  it("o PasswordField leva as props até o campo", () => {
    render(<Envolve>
      <PasswordField testID="p" autoComplete="current-password" textContentType="password" />
    </Envolve>);
    const p = porID("TextInput", "p-campo");
    expect(p.autoComplete).toBe("current-password");
    expect(p.textContentType).toBe("password");
  });
});

describe("4 · o olho da senha e o registro de glifos", () => {
  it("o PasswordField aceita um registro próprio", () => {
    const local = criarRegistroDeIcones({view: Glifo, "view--off": Glifo});
    render(<AureaProvider theme="light"><PasswordField testID="p" icons={local} /></AureaProvider>);
    expect(porID("Pressable", "p-olho").accessibilityLabel).toBeTruthy();
  });
});

describe("5 · o cadeado na frente da senha", () => {
  it("o `leading` entra ANTES do campo", () => {
    render(<Envolve>
      <PasswordField testID="p" leading={<Text testID="cadeado">L</Text>} />
    </Envolve>);
    expect(porID("Text", "cadeado").testID).toBe("cadeado");
    expect(porID("TextInput", "p-campo").secureTextEntry).toBe(true);
  });

  // O que o `leading` NÃO pode custar: as três decisões que o PasswordField carrega.
  it("e o olho, o rótulo e o `none` continuam de pé com ele", () => {
    render(<Envolve><PasswordField testID="p" leading={<Text>L</Text>} /></Envolve>);
    expect(porID("Pressable", "p-olho").accessibilityLabel).toBe("Show password");
    expect(porID("TextInput", "p-campo").autoCapitalize).toBe("none");
  });
});

describe("6 · o Separator", () => {
  it("desenha a linha com a cor e a espessura do sistema", () => {
    render(<Envolve><Separator testID="s" /></Envolve>);
    const st = StyleSheet.flatten(porID("View", "s").style);
    expect(st.backgroundColor).toBe(claro.color.border);
    expect(st.height).toBe(claro.size.borderWidth);
    expect(st.width).toBe("100%");
  });

  it("vertical vira coluna de um pixel", () => {
    render(<Envolve><Separator orientation="vertical" testID="s" /></Envolve>);
    const st = StyleSheet.flatten(porID("View", "s").style);
    expect(st.width).toBe(claro.size.borderWidth);
    expect(st.alignSelf).toBe("stretch");
  });

  it("com rótulo, vira linha–texto–linha", () => {
    render(<Envolve><Separator label="ou entre com" testID="s" /></Envolve>);
    const st = StyleSheet.flatten(porID("View", "s").style);
    expect(st.flexDirection).toBe("row");
    const pedacos = __instancias("View").filter(
      (p) => StyleSheet.flatten(p.style)?.flex === 1
        && StyleSheet.flatten(p.style)?.backgroundColor === claro.color.border);
    expect(pedacos.length).toBe(2);
  });

  // O papel `separator` NÃO existe no React Native — inventar o mais parecido diria uma coisa
  // errada. Mesma armadilha do Lote 5 e da `Table`.
  it("não inventa papel de acessibilidade", () => {
    render(<Envolve><Separator testID="s" /></Envolve>);
    expect(porID("View", "s").accessibilityRole).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 8 · O X DO `Combobox` MORAVA DENTRO DO GATILHO — achado na tela de adicionar veículo
// ═════════════════════════════════════════════════════════════════════════════════════════════
//
// O `IconButton` de limpar ficava DENTRO do `Pressable` do gatilho, que declara
// `accessibilityRole="button"`. Botão dentro de botão.
//
// 🔴 **E O ANDROID NÃO MOSTRAVA.** Medido no fonte do `react-native@0.87.1`:
//
// | | |
// |---|---|
// | `Pressable.js:274` | um `Pressable` nasce `accessible: true` |
// | `RCTViewComponentView.mm:398` | no iOS esse `accessible` vira `isAccessibilityElement`, e quem é elemento de acessibilidade não expõe os filhos — **o X sumia para o VoiceOver** |
// | `ReactViewManager.kt:96` | no Android ele só liga `isFocusable` |
// | `ReactViewGroup.kt:1048` | e os filhos continuam entrando na árvore — **no Android o X era alcançável** |
//
// ⚠ **É por isso que o smoke inteiro passou por cima.** Nenhum aparelho deste projeto rodou iOS,
// em lote nenhum — e este defeito só existe lá. *Um alvo só nunca responderia esta pergunta.*
//
// ⚠ **O que este teste prova é ESTRUTURA, não comportamento** — mesma declaração do
// `native-fundo-irmao.test.tsx`, e pela mesma razão: o dublê é a nossa ideia do React Native, e
// já esteve errado. Quem responde de verdade é um iPhone, que este projeto nunca teve.

/** Todo descendente do nó que carrega `onPress` — é a forma do defeito, não o nome dele. */
const tocaveisDentro = (no: React.ReactNode): Props[] => {
  const achados: Props[] = [];
  const andar = (n: React.ReactNode): void => {
    if (Array.isArray(n)) { n.forEach(andar); return; }
    if (!React.isValidElement(n)) return;
    const p = n.props as Props;
    if (p.onPress != null) achados.push(p);
    andar(p.children as React.ReactNode);
  };
  andar(no);
  return achados;
};

describe("8 · o X do `Combobox` é IRMÃO do gatilho, não filho", () => {
  const CATALOGO = [{value: "1", label: "Gol"}, {value: "2", label: "Palio"}];
  const comEscolha = () =>
    render(<Envolve>
      <Combobox items={CATALOGO} value={CATALOGO[0]} testID="cb" />
    </Envolve>);

  it("nada tocável mora dentro do gatilho", () => {
    comEscolha();
    const gatilho = porID("Pressable", "cb");
    expect(gatilho.accessibilityRole).toBe("button");
    expect(tocaveisDentro(gatilho.children as React.ReactNode)).toEqual([]);
  });

  it("e o X continua existindo, do lado de fora", () => {
    comEscolha();
    const limpar = porID("Pressable", "cb-limpar");
    expect(limpar.onPress).toBeTypeOf("function");
  });

  // A seta deixou de ser enfeite: ela abre. E é MUDA para o leitor de tela, porque o gatilho já
  // anuncia rótulo, valor e se está aberto — um segundo botão seria a mesma frase duas vezes.
  it("a seta abre, e não vira uma segunda parada do leitor de tela", () => {
    comEscolha();
    const seta = porID("Pressable", "cb-seta");
    expect(seta.onPress).toBeTypeOf("function");
    expect(seta.accessible).toBe(false);
    expect(seta.accessibilityRole).toBeUndefined();
  });

  it("desabilitado, nem o gatilho nem a seta tocam", () => {
    render(<Envolve>
      <Combobox items={CATALOGO} value={CATALOGO[0]} disabled testID="cb" />
    </Envolve>);
    expect(porID("Pressable", "cb").onPress).toBeUndefined();
    expect(porID("Pressable", "cb-seta").onPress).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 9 · E A VARREDURA ACHOU MAIS DOIS — nenhum deles reportado por ninguém
// ═════════════════════════════════════════════════════════════════════════════════════════════
//
// 🔴 **Este bloco é a prova de que o gate valia mais que o conserto.** O consumidor achou UM caso
// (o `Combobox`, §8). Varrendo o pacote inteiro atrás da FORMA dele — peça marcada como elemento
// de acessibilidade com coisa tocável dentro — apareceram mais dois, em 17/09/2026:
//
// | | desde | o que sumia no iPhone |
// |---|---|---|
// | **`Alert`** | 08/09/2026, quatro versões publicadas | o "X" de FECHAR o aviso |
// | **`Chart`** | 09/09/2026 | as faixas que carregam os VALORES — o gráfico inteiro |
//
// ⚠ **O do `Chart` é o pior dos três, e o motivo é irônico:** as faixas tocáveis existem
// justamente para o leitor de tela (o comentário delas diz *"é o que o leitor de tela lê"*), e a
// moldura marcada `accessible` apagava todas. No iPhone a pessoa ouvia o nome do gráfico e **zero
// dado**. No Android, leitura completa. *Um alvo só nunca responderia esta pergunta.*
//
// O gate que os achou é o **check 43** do `validate.py`, provado em quatro direções.

describe("9 · o `Alert`: a moldura é layout, o grupo é a leitura, o X é irmão", () => {
  const comX = () =>
    render(<Envolve><Alert variant="info" title="Ops" onDismiss={() => {}}>corpo</Alert></Envolve>);

  it("nada tocável mora dentro do grupo que é lido", () => {
    comX();
    const grupos = __instancias("View").filter((p) => p.accessible === true);
    expect(grupos.length).toBe(1);                       // há UM grupo, e é o do conteúdo
    expect(tocaveisDentro(grupos[0].children as React.ReactNode)).toEqual([]);
  });

  it("e o X de fechar continua existindo, fora do grupo", () => {
    const onDismiss = vi.fn();
    render(<Envolve><Alert variant="info" onDismiss={onDismiss}>corpo</Alert></Envolve>);
    const fechar = __instancias("Pressable").filter((p) => typeof p.onPress === "function");
    expect(fechar.length).toBeGreaterThan(0);
  });

  // O papel e o rótulo têm de morar em QUEM é elemento de acessibilidade — num `View` que não é,
  // o iOS ignora os dois. É a consequência direta de tirar o `accessible` da moldura.
  it("o papel de `danger` pousa no grupo, não na moldura", () => {
    render(<Envolve><Alert variant="danger">caiu</Alert></Envolve>);
    const grupo = __instancias("View").find((p) => p.accessible === true) ?? {};
    expect(grupo.accessibilityRole).toBe("alert");
  });

  it("o rótulo que o consumidor manda também", () => {
    render(<Envolve><Alert variant="info" accessibilityLabel="Aviso de km">x</Alert></Envolve>);
    const grupo = __instancias("View").find((p) => p.accessible === true) ?? {};
    expect(grupo.accessibilityLabel).toBe("Aviso de km");
  });
});

describe("9b · o `Chart`: o nome vai para o DESENHO, e as faixas sobrevivem", () => {
  const LABELS = ["jan", "fev", "mar"];
  const SERIE = [{name: "Custo", data: [10, 20, 30]}];
  const desenhar = () => {
    const r = render(
      <Envolve><Chart labels={LABELS} series={SERIE} label="Custo por mês" testID="g" /></Envolve>);
    // sem largura medida o desenho não sai; o `onLayout` é quem a dá.
    const medivel = __instancias("View").find((p) => typeof p.onLayout === "function");
    act(() => {
      (medivel?.onLayout as (e: unknown) => void)(
        {nativeEvent: {layout: {width: 300, height: 180}}});
    });
    return r;
  };

  it("nenhuma peça acessível tem faixa tocável dentro", () => {
    desenhar();
    for (const g of __instancias("View").filter((p) => p.accessible === true)) {
      expect(tocaveisDentro(g.children as React.ReactNode)).toEqual([]);
    }
  });

  it("o nome do gráfico continua sendo anunciado", () => {
    desenhar();
    const nomeados = __instancias("View")
      .filter((p) => p.accessible === true && p.accessibilityLabel === "Custo por mês");
    expect(nomeados.length).toBe(1);
  });

  // A razão de tudo: cada faixa carrega rótulo E valores, e é isso que uma pessoa cega lê.
  it("as faixas continuam alcançáveis, com rótulo e valor", () => {
    desenhar();
    const faixas = __instancias("Pressable")
      .filter((p) => typeof p.accessibilityLabel === "string"
        && (p.accessibilityLabel as string).includes("Custo"));
    expect(faixas.length).toBe(LABELS.length);
    expect(faixas[0].accessibilityLabel).toContain("jan");
  });
});
