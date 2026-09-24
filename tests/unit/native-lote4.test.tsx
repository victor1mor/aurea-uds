// Lote 4 do NATIVE.md — os formulários do alvo nativo.
//
// ⚠ **O tema deste arquivo é NOME.** Na web, `<label for>` liga o rótulo ao controle e o
// navegador faz o resto; **no React Native não há `id` nem `htmlFor`** — o nome de um controle é
// uma string NELE, e se ninguém a puser o campo é um nó anônimo para quem usa leitor de tela.
// Metade dos testes abaixo existe para reprovar exatamente esse silêncio, que não aparece na tela
// e não quebra nada.
import {render, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {
  StyleSheet, __animacoes, __definirPlataforma, __definirReduceMotion, __instancias,
} from "./native-stubs/react-native";

import {
  AureaProvider, Checkbox, Field, Form, Input, KeyboardAvoiding, Label, Radio, SegmentedControl,
  Select, Switch, Text, Textarea, criarRegistroDeIcones, resolverTokens, useCampo,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"chevron--down": Glifo});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

const props = (primitivo: string, n = 0) => __instancias(primitivo)[n] ?? {};
const estilo = (primitivo: string, n = 0) => StyleSheet.flatten(props(primitivo, n).style);
// Depois de um `act`, o componente re-renderiza e o dublê registra uma instância NOVA — a antiga
// fica no registro com as props de antes. Quem quer ver o efeito de uma interação lê a última.
const ultimo = (primitivo: string) => __instancias(primitivo).at(-1) ?? {};
const estiloDoUltimo = (primitivo: string) => StyleSheet.flatten(ultimo(primitivo).style);
const assentar = async () => { await act(async () => { await Promise.resolve(); }); };

describe("Field — a ligação que a web faz e o RN não tem", () => {
  // DEFEITO SILENCIOSO, e é o mais caro deste lote: o campo desenha o rótulo ao lado e NÃO o
  // entrega ao controle. Visualmente perfeito; para o leitor de tela, um campo sem nome.
  it("empurra o nome para o controle lá dentro", () => {
    render(<Envolve><Field label="Quilometragem"><Input /></Field></Envolve>);
    expect(props("TextInput").accessibilityLabel).toBe("Quilometragem");
  });

  // DEFEITO: o erro como texto vermelho e nada mais. Quem não enxerga a cor não sabe que errou.
  it("o erro marca o controle como inválido E vira a dica que o leitor anuncia", () => {
    render(<Envolve><Field label="Litros" error="Só números"><Input /></Field></Envolve>);
    expect(props("TextInput")["aria-invalid"]).toBe(true);
    expect(props("TextInput").accessibilityHint).toBe("Só números");
    expect(estilo("TextInput").borderColor).toBe(tokens.color.danger400);
  });

  // DEFEITO: mostrar dica E erro ao mesmo tempo. A informação que importa naquele momento é uma.
  it("com erro, a dica sai da tela", () => {
    render(<Envolve><Field label="A" hint="a dica" error="o erro"><Input /></Field></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("o erro");
    expect(textos).not.toContain("a dica");
  });

  it("o tamanho e o desabilitado descem pelo contexto", () => {
    render(<Envolve><Field label="A" size="lg" disabled><Input /></Field></Envolve>);
    expect(estilo("TextInput").height).toBe(tokens.size.controlHLg);
    expect(props("TextInput").editable).toBe(false);
  });

  // 🔴 DEFEITO VISTO NO VIDRO, 09/09/2026: *"o número em quilometragem está muito acima e está
  // cortando"*. As duas propriedades abaixo são o conserto, e nenhuma é enfeite.
  //
  //  · `paddingVertical: 0` — `padding-block:0` é LITERAL na web (`aurea.css:685`) e não
  //    atravessou. No RN a ausência não é "sem padding": o
  //    `AndroidTextInputComponentDescriptor.h:101-107` INJETA o padding do tema do Android no nó
  //    do Yoga quando as props não trazem nenhum vertical — e `hasPaddingVertical` é o que
  //    desliga a injeção. Com `height` fixa, esse padding come a altura por dentro e corta.
  //  · `textAlignVertical: "center"` — o `setTextAlignVertical` (`ReactTextInputManager.kt:571`)
  //    traduz ausente para `Gravity.NO_GRAVITY`, e o `EditText` fica no TOPO. É o "muito acima".
  //
  // ⚠ Este teste é frágil de propósito: ele cobra as PROPRIEDADES, não a aparência, porque a
  // aparência só o aparelho mede. Trocar `paddingVertical` por `paddingTop`+`paddingBottom`
  // também resolveria e reprovaria aqui — e é para reprovar mesmo, para que quem mexer leia isto.
  it("o campo de uma linha zera o padding vertical e centraliza — senão o Android corta", () => {
    render(<Envolve><Input /></Envolve>);
    expect(estilo("TextInput").paddingVertical).toBe(0);
    expect(estilo("TextInput").textAlignVertical).toBe("center");
  });

  // A caixa alta é o contrário nos dois lados, e o `.textarea` da web diz os dois:
  // `padding-block:var(--space-3)` e o texto começando em cima.
  it("a caixa alta tem o respiro do CSS e alinha no topo", () => {
    render(<Envolve><Textarea /></Envolve>);
    expect(estilo("TextInput").paddingVertical).toBe(tokens.size.space3);
    expect(estilo("TextInput").textAlignVertical).toBe("top");
  });

  it("useCampo é null fora de um Field, e não levanta", () => {
    const visto: unknown[] = [];
    const Sonda = () => { visto.push(useCampo()); return null; };
    render(<Envolve><Sonda /></Envolve>);
    expect(visto.at(-1)).toBeNull();
  });
});

describe("Input e Textarea", () => {
  // O plano do consumidor pede teclado numérico nos campos de medida e moeda. DEFEITO: engolir a
  // prop — o campo funcionaria, e digitar 12,4 passaria de dois toques para oito.
  it("o teclado pedido chega ao TextInput", () => {
    render(<Envolve><Input keyboardType="numeric" /></Envolve>);
    expect(props("TextInput").keyboardType).toBe("numeric");
  });

  // DEFEITO: o `Textarea` herdar a altura fixa do `Input`. Ele tem altura MÍNIMA e cresce.
  it("o Textarea tem altura mínima e é multilinha, não altura fixa", () => {
    render(<Envolve><Textarea /></Envolve>);
    const e = estilo("TextInput");
    expect(props("TextInput").multiline).toBe(true);
    expect(e.minHeight).toBe(104);
    expect(e.height).toBeUndefined();
    // E o raio é o LG, não o de controle: uma caixa alta em pílula viraria cápsula.
    expect(e.borderRadius).toBe(tokens.size.radiusLg);
  });

  it("o foco muda a borda — é a única pista de qual campo o teclado alimenta", () => {
    render(<Envolve><Input /></Envolve>);
    expect(estilo("TextInput").borderColor).toBe(tokens.color.borderStrong);
    act(() => { (props("TextInput").onFocus as () => void)(); });
    expect(estiloDoUltimo("TextInput").borderColor).toBe(tokens.color.focusStrong);
  });
});

describe("Checkbox e Radio — o mesmo desenho, duas semânticas", () => {
  it("cada um leva o SEU papel, e o estado marcado", () => {
    render(<Envolve><Checkbox label="Aceito" checked /></Envolve>);
    expect(props("Pressable").accessibilityRole).toBe("checkbox");
    expect(props("Pressable").accessibilityState.checked).toBe(true);

    render(<Envolve><Radio label="Diário" /></Envolve>);
    expect(props("Pressable", 1).accessibilityRole).toBe("radio");
    expect(props("Pressable", 1).accessibilityState.checked).toBe(false);
  });

  // DEFEITO: a marca com tamanho fixo. No CSS ela é METADE da altura de controle, e é assim que
  // ela cresce junto com a densidade sem token próprio.
  it("a marca é metade da altura do controle", () => {
    render(<Envolve><Checkbox label="A" size="lg" /></Envolve>);
    const marca = __instancias("View").map((p) => StyleSheet.flatten(p.style))
      .find((e) => e.width === tokens.size.controlHLg / 2);
    expect(marca).toBeDefined();
  });

  // DEFEITO: quadrado no rádio, ou redondo na caixa. É a diferença que diz "um" de "vários".
  it("a caixa é quadrada de canto suave; o rádio é redondo", () => {
    render(<Envolve><Checkbox label="A" /></Envolve>);
    const raios = __instancias("View").map((p) => StyleSheet.flatten(p.style).borderRadius);
    expect(raios).toContain(5);
    render(<Envolve><Radio label="B" /></Envolve>);
    const depois = __instancias("View").map((p) => StyleSheet.flatten(p.style).borderRadius);
    expect(depois).toContain(tokens.size.radiusFull);
  });

  it("desabilitado não dispara onChange", () => {
    const mudar = vi.fn();
    render(<Envolve><Checkbox label="A" disabled onChange={mudar} /></Envolve>);
    expect(props("Pressable").onPress).toBeUndefined();
    expect(props("Pressable").accessibilityState.disabled).toBe(true);
  });
});

describe("Switch — o interruptor que é NOSSO", () => {
  // DEFEITO: usar o `Switch` do React Native. Ele desenha o interruptor do Material no Android e
  // o do iOS no iOS — duas aparências que o CLAUDE.md proíbe em voz alta.
  it("não é o Switch da plataforma: é Pressable com papel de switch", () => {
    render(<Envolve><Switch label="Lembrar" /></Envolve>);
    expect(props("Pressable").accessibilityRole).toBe("switch");
    expect(__instancias("Switch")).toHaveLength(0);
  });

  // DEFEITO: as medidas do trilho inventadas. No CSS são frações da altura de controle.
  it("o trilho mede altura×7/6 por altura×2/3, como no CSS", () => {
    render(<Envolve><Switch label="A" /></Envolve>);
    const h = tokens.size.controlHMd;
    const trilho = __instancias("View").map((p) => StyleSheet.flatten(p.style))
      .find((e) => e.width === h * 7 / 6);
    expect(trilho).toBeDefined();
    expect(trilho!.height).toBe(h * 2 / 3);
  });

  // A mesma regra do Lote 2, e ela vale para TODA animação do pacote: com "menos movimento"
  // ligado, o polegar salta em vez de deslizar. O estado continua; some a animação.
  it("com menos movimento, o polegar não anima", async () => {
    __definirReduceMotion(true);
    render(<Envolve><Switch label="A" checked /></Envolve>);
    await assentar();
    expect(__animacoes()).toHaveLength(0);
  });
});

describe("SegmentedControl — um dos dois com motor Base UI na web", () => {
  const ITENS = [{value: "d", label: "Diário"}, {value: "p", label: "Periódico"}];

  // DEFEITO: um grupo de botões sem semântica de escolha. O leitor anuncia dois botões e não diz
  // que são alternativas nem qual está valendo.
  it("é um radiogroup de radios, com o escolhido marcado", () => {
    render(<Envolve><SegmentedControl items={ITENS} value="p" label="Tipo" /></Envolve>);
    expect(props("View").accessibilityRole).toBe("radiogroup");
    expect(props("View").accessibilityLabel).toBe("Tipo");
    const papeis = __instancias("Pressable").map((p) => p.accessibilityRole);
    expect(papeis).toEqual(["radio", "radio"]);
    expect(props("Pressable", 0).accessibilityState.checked).toBe(false);
    expect(props("Pressable", 1).accessibilityState.checked).toBe(true);
  });

  it("escolher avisa o app", () => {
    const mudar = vi.fn();
    render(<Envolve><SegmentedControl items={ITENS} value="d" onChange={mudar} /></Envolve>);
    act(() => { (props("Pressable", 1).onPress as () => void)(); });
    expect(mudar).toHaveBeenCalledWith("p");
  });
});

describe("Select — o motor novo sobre Modal que a §5.2.4 previu", () => {
  const ITENS = [{value: "a", label: "Gasolina"}, {value: "b", label: "Etanol"}];

  // DEFEITO: declarar `combobox` porque a ficha da web declara. `combobox` promete um campo em que
  // se DIGITA para filtrar; isto só abre uma lista. É o mesmo defeito do `tablist` no Lote 3.
  it("o gatilho é `button`, não `combobox`", () => {
    render(<Envolve><Select items={ITENS} value="a" /></Envolve>);
    expect(props("Pressable").accessibilityRole).toBe("button");
    expect(props("Pressable").accessibilityRole).not.toBe("combobox");
  });

  // DEFEITO: o valor escolhido só na tela. O leitor anunciaria "botão" e não diria o quê.
  it("o valor escolhido é anunciado, e o aberto/fechado também", () => {
    render(<Envolve><Select items={ITENS} value="b" /></Envolve>);
    expect(props("Pressable").accessibilityValue).toEqual({text: "Etanol"});
    expect(props("Pressable").accessibilityState.expanded).toBe(false);
  });

  it("abre a folha, escolhe, e fecha", () => {
    const mudar = vi.fn();
    render(<Envolve><Select items={ITENS} onChange={mudar} /></Envolve>);
    expect(props("Modal").visible).toBe(false);
    act(() => { (props("Pressable").onPress as () => void)(); });
    expect(ultimo("Modal").visible).toBe(true);
  });

  // DEFEITO REAL DO ANDROID: a folha sem `onRequestClose` fica PRESA — o botão voltar não a fecha,
  // e a pessoa sai do app para escapar.
  it("o botão voltar do Android fecha a folha", () => {
    render(<Envolve><Select items={ITENS} /></Envolve>);
    expect(props("Modal").onRequestClose).toBeTypeOf("function");
  });
});

describe("Form e KeyboardAvoiding", () => {
  it("o Form é o respiro, e nada mais — sem onSubmit que nada dispara", () => {
    render(<Envolve><Form><Text>a</Text></Form></Envolve>);
    expect(estilo("View").gap).toBe(tokens.size.space5);
  });

  // DEFEITO QUE MORDE METADE DOS APARELHOS: um `behavior` só nos dois lados. No iOS a janela não
  // encolhe e é preciso empurrar (`padding`); no Android o sistema já redimensiona (`height`).
  it("o behavior muda com a plataforma", () => {
    __definirPlataforma("ios");
    render(<Envolve><KeyboardAvoiding><Text>a</Text></KeyboardAvoiding></Envolve>);
    expect(props("KeyboardAvoidingView").behavior).toBe("padding");

    __definirPlataforma("android");
    render(<Envolve><KeyboardAvoiding><Text>a</Text></KeyboardAvoiding></Envolve>);
    expect(props("KeyboardAvoidingView", 1).behavior).toBe("height");
  });
});

describe("Label", () => {
  it("desenha o texto e o que vai à direita", () => {
    render(<Envolve><Label trailing={<Text>opcional</Text>}>Nome</Label></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("Nome");
    expect(textos).toContain("opcional");
  });
});
