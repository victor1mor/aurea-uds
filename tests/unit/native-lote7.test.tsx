// Lote 7 do NATIVE.md §8 — as três lacunas que o CONSUMIDOR mediu, e não o plano.
//
// ⚠ **O tema deste arquivo é MOMENTO e ORIGEM.** Momento porque a decisão central do
// `NumberField` é *quando* formatar (a ADR-0024: no blur, nunca enquanto se digita), e uma
// formatação ao vivo passa em inspeção visual — quem olha a tela vê "R$ 1.234,50" e acha bonito.
// Origem porque o `Combobox` tem DUAS fontes possíveis para a lista (o servidor do app ou o
// filtro daqui), e trocá-las em silêncio é entregar um filtro de cliente sobre milhares de linhas
// que ninguém baixou.
//
// Os dois defeitos são invisíveis na tela e caros no aparelho. É por isso que metade dos testes
// abaixo não olha aparência nenhuma.
import {render, act} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {
  StyleSheet, __definirPlataforma, __instancias,
} from "./native-stubs/react-native";

import {
  AureaProvider, Combobox, Field, Gallery, Image, Input, NumberField, SearchField,
  criarRegistroDeIcones, formatarNumero, lerNumero, resolverTokens, separadoresDoLocale,
  type AureaComboboxItem,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({
  "chevron--down": Glifo, search: Glifo, close: Glifo, add: Glifo, subtract: Glifo, image: Glifo,
});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

type Props = Record<string, unknown>;
const props = (primitivo: string, n = 0): Props => __instancias(primitivo)[n] ?? {};
const ultimo = (primitivo: string): Props => __instancias(primitivo).at(-1) ?? {};
const estilo = (primitivo: string, n = 0) => StyleSheet.flatten(props(primitivo, n).style);
const estiloDoUltimo = (primitivo: string) => StyleSheet.flatten(ultimo(primitivo).style);
/** A ÚLTIMA instância com aquele `testID` — depois de um `act` a antiga fica no registro. */
const porID = (primitivo: string, id: string): Props =>
  __instancias(primitivo).filter((p) => p.testID === id).at(-1) ?? {};
const tocar = async (p: Props) => {
  await act(async () => { (p.onPress as (() => void) | undefined)?.(); });
};
const digitar = async (p: Props, v: string) => {
  await act(async () => { (p.onChangeText as ((v: string) => void) | undefined)?.(v); });
};

const CATALOGO: AureaComboboxItem[] = [
  {value: "1", label: "Açúcar refinado"},
  {value: "2", label: "Arroz agulhinha"},
  {value: "3", label: "Feijão carioca"},
];

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 1 · Combobox — a lacuna que bloqueava o cadastro
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("Combobox — de onde vem a lista", () => {
  // 🔴 O DEFEITO CENTRAL DESTE COMPONENTE, e ele é silencioso: com busca remota, filtrar de novo
  // aqui esconderia resultados que o servidor mandou. O app pergunta "açúcar", o servidor devolve
  // "AÇUCAR CRISTAL 5KG" (em caixa alta, com outro acento, com o código na frente) e um filtro
  // local o descartaria — a tela mostraria "nenhum resultado" sobre uma resposta cheia.
  it("com `onSearchChange`, a Aurea NÃO filtra — a lista que chega é a que aparece", async () => {
    render(
      <Envolve>
        <Combobox items={CATALOGO} onSearchChange={() => {}} searchDelay={0} testID="cb" />
      </Envolve>);
    await digitar(porID("TextInput", "cb-busca"), "zzzzz");
    expect((ultimo("FlatList").data as unknown[]).length).toBe(3);
  });

  it("sem `onSearchChange`, a Aurea filtra o que recebeu", async () => {
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    await digitar(porID("TextInput", "cb-busca"), "arroz");
    expect((ultimo("FlatList").data as AureaComboboxItem[]).map((i) => i.label))
      .toEqual(["Arroz agulhinha"]);
  });

  // DEFEITO: exigir o acento certo de quem está PROCURANDO a palavra. Num catálogo em português
  // isso é exigir que a pessoa já saiba escrever o que não sabe achar.
  it("o filtro ignora acento e caixa", async () => {
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    await digitar(porID("TextInput", "cb-busca"), "ACUCAR");
    expect((ultimo("FlatList").data as AureaComboboxItem[]).map((i) => i.value)).toEqual(["1"]);
  });
});

describe("Combobox — a espera antes de bater no servidor", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  // 🔴 DEFEITO DE CUSTO, e ele não aparece em teste de tela: sem espera, "arroz" são CINCO
  // chamadas ao servidor e quatro respostas descartadas — e a última a chegar pode não ser a
  // última pedida, o que põe na tela o resultado de uma busca antiga.
  it("três letras viram UMA chamada, com a última", () => {
    const buscar = vi.fn();
    render(<Envolve><Combobox items={[]} onSearchChange={buscar} testID="cb" /></Envolve>);
    const campo = porID("TextInput", "cb-busca");
    act(() => { (campo.onChangeText as (v: string) => void)("a"); });
    act(() => { (porID("TextInput", "cb-busca").onChangeText as (v: string) => void)("ar"); });
    act(() => { (porID("TextInput", "cb-busca").onChangeText as (v: string) => void)("arr"); });
    expect(buscar).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(250); });
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar).toHaveBeenCalledWith("arr");
  });

  // 🔴 DEFEITO REAL E CHATO DE ACHAR: sair da tela com uma busca pendente dispara a função sobre
  // uma árvore desmontada. No app isso vira um `setState` em componente que não existe mais — um
  // aviso no console em desenvolvimento e, com sorte, nada em produção. Sem sorte, um crash.
  it("desmontar com busca pendente não chama `onSearchChange`", () => {
    const buscar = vi.fn();
    const tela = render(
      <Envolve><Combobox items={[]} onSearchChange={buscar} testID="cb" /></Envolve>);
    act(() => { (porID("TextInput", "cb-busca").onChangeText as (v: string) => void)("a"); });
    tela.unmount();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(buscar).not.toHaveBeenCalled();
  });

  it("`searchDelay: 0` desliga a espera", () => {
    const buscar = vi.fn();
    render(
      <Envolve><Combobox items={[]} onSearchChange={buscar} searchDelay={0} testID="cb" /></Envolve>);
    act(() => { (porID("TextInput", "cb-busca").onChangeText as (v: string) => void)("a"); });
    expect(buscar).toHaveBeenCalledWith("a");
  });
});

describe("Combobox — a lista e o que ela monta", () => {
  // 🔴 A TRAVA CONTRA O DEFEITO QUE ORIGINOU O COMPONENTE. O `Select` do Lote 4 usa `ScrollView`
  // (`inputs.tsx:632`), que monta TODOS os itens: um catálogo de milhares de linhas ali não fica
  // lento, trava. Este teste reprova quem trocar o `FlatList` por um `ScrollView` "para
  // simplificar" — e é exatamente o tipo de simplificação que passa em revisão.
  it("a folha usa `FlatList`, e não `ScrollView`", () => {
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    expect(__instancias("FlatList").length).toBe(1);
    expect(__instancias("ScrollView").length).toBe(0);
  });

  // Paginação: um catálogo remoto não cabe numa resposta só.
  it("`onEndReached` chega à lista", () => {
    const proxima = vi.fn();
    render(<Envolve><Combobox items={CATALOGO} onEndReached={proxima} testID="cb" /></Envolve>);
    expect(ultimo("FlatList").onEndReached).toBe(proxima);
  });

  // DEFEITO: o teclado fecha ao tocar num resultado e o toque se perde — a pessoa toca duas
  // vezes na mesma linha e acha que o app travou. É o padrão de lista sob campo de busca.
  it("tocar num resultado com o teclado aberto não perde o toque", () => {
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    expect(ultimo("FlatList").keyboardShouldPersistTaps).toBe("handled");
  });

  it("escolher emite o ITEM inteiro e fecha a folha", async () => {
    const escolher = vi.fn();
    render(
      <Envolve><Combobox items={CATALOGO} onValueChange={escolher} testID="cb" /></Envolve>);
    // As opções da lista são os `Pressable` que o `renderItem` desenhou; a primeira delas é a
    // primeira linha do catálogo.
    const opcoes = __instancias("Pressable").filter((p) => p.accessibilityRole === "menuitem");
    await tocar(opcoes[0]);
    expect(escolher).toHaveBeenCalledWith(CATALOGO[0]);
    expect(ultimo("Modal").visible).toBe(false);
  });

  // 🔴 O DEFEITO ESTRUTURAL QUE O `Select` LEVOU DUAS RODADAS PARA FECHAR: tocar no corpo da
  // folha a fechava. Aqui seria pior: tocar para posicionar o cursor no campo de busca fecharia a
  // folha inteira. A garantia é ESTRUTURAL — o fundo tocável é irmão da folha, não ancestral.
  // ~~O corpo reivindica o toque~~ saiu no E4 (25/09/2026): no Android um `View` dono do toque
  // intercepta os movimentos seguintes, e a lista de dentro não rolava (visto pelo app).
  it("o fundo que fecha não envolve a folha, e a folha não reivindica o toque", () => {
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    const fundo = __instancias("Pressable").find((p) => p.testID === "cb-fundo");
    expect(fundo).toBeDefined();
    expect(fundo!.children).toBeUndefined();
    const reivindicam = [...__instancias("View"), ...__instancias("Animated.View")]
      .filter((p) => typeof p.onStartShouldSetResponder === "function");
    expect(reivindicam).toHaveLength(0);
  });
});

describe("Combobox — o iOS da folha, que eu tinha analisado pelo sistema errado", () => {
  // 🔴 O DEFEITO: a versão de 11/09 dispensava o `KeyboardAvoidingView` citando um problema DO
  // ANDROID. O `inputs.tsx:732-733`, escrito no Lote 4, diz quem precisa de ajuda:
  //
  //     iOS      -> `padding`  · a janela NÃO encolhe; é preciso empurrar o conteúdo
  //     Android  -> `height`   · o sistema já redimensiona com `adjustResize`
  //
  // Ou seja: o Android se vira, o iOS não. Sem isto, uma folha de 90% com o teclado aberto no
  // iOS deixa a lista inteira ATRÁS do teclado — a pessoa digita e não vê resultado nenhum, no
  // componente que existe para desbloquear o cadastro.
  it("a folha levanta com o teclado, e o `behavior` muda por plataforma", () => {
    __definirPlataforma("ios");
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    expect(__instancias("KeyboardAvoidingView").at(-1)?.behavior).toBe("padding");
  });

  it("no Android o `behavior` é `height`, porque a janela já encolhe", () => {
    __definirPlataforma("android");
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    expect(__instancias("KeyboardAvoidingView").at(-1)?.behavior).toBe("height");
  });

  // 🔴 A SAÍDA DO iOS. `onRequestClose` é o botão VOLTAR do ANDROID e lá nunca dispara; sem
  // gesto, a única saída no iOS era tocar no fundo — e uma folha de 90% deixa pouco fundo.
  it("arrastar o cabeçalho para baixo fecha a folha", async () => {
    const {__ultimoGesto} = await import("./native-stubs/react-native");
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    await act(async () => {
      (porID("Pressable", "cb").onPress as () => void)();
    });
    const g = __ultimoGesto();
    expect(g).not.toBeNull();
    // Abaixo do limiar: volta. O limiar é `Math.max(80, altura/3)`, copiado do `BottomSheet`.
    await act(async () => { g!.onPanResponderRelease({}, {dx: 0, dy: 20, vx: 0, vy: 0}); });
    expect(ultimo("Modal").visible).toBe(true);
    // Acima: fecha.
    await act(async () => { g!.onPanResponderRelease({}, {dx: 0, dy: 200, vx: 0, vy: 0}); });
    expect(ultimo("Modal").visible).toBe(false);
  });

  // DEFEITO QUE O GESTO PODIA CRIAR: reivindicar o arrasto sobre a LISTA roubaria a rolagem —
  // que é a única coisa que este componente existe para fazer. Por isso ele mora no cabeçalho.
  it("o gesto NÃO reivindica antes de 6dp, para não roubar o toque de quem rola", async () => {
    const {__ultimoGesto} = await import("./native-stubs/react-native");
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    const g = __ultimoGesto()!;
    expect(g.onMoveShouldSetPanResponder({}, {dx: 0, dy: 3, vx: 0, vy: 0})).toBe(false);
    expect(g.onMoveShouldSetPanResponder({}, {dx: 0, dy: 9, vx: 0, vy: 0})).toBe(true);
  });
});

describe("NumberField — ele ESTICAVA, e o nosso CSS diz que abraça", () => {
  // 🔴 Achado olhando a primeira imagem da vitrine. O `.number-field` da web é `inline-flex`
  // (`aurea.css:704`) e ABRAÇA; a primeira versão daqui punha `flex: 1` no campo e PREENCHIA,
  // deixando o `−` e o `+` jogados nas pontas de um campo enorme.
  it("por padrão abraça o conteúdo, com a largura do `.number-field-input`", () => {
    render(<Envolve><NumberField value={3} testID="nf" /></Envolve>);
    // ⚠ `porID`, e não "a última View": o `Icon` de cada botão também é uma `View`, então a
    // última do registro não é o grupo. Terceira vez neste arquivo que a pergunta imprecisa
    // reprova código certo — a lição já está escrita duas vezes acima.
    expect(StyleSheet.flatten(porID("View", "nf").style).alignSelf).toBe("flex-start");
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).width)
      .toBe(tokens.size.space16);
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).flex).toBeUndefined();
  });

  // O eixo é o da HeroUI (`fullWidth`, medido no inventário) — esticar é decisão de USO.
  it("`fullWidth` estica, e é o que moeda formatada precisa", () => {
    render(<Envolve><NumberField value={3} fullWidth testID="nf" /></Envolve>);
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).flex).toBe(1);
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).minWidth)
      .toBe(tokens.size.space16);
  });
});

describe("Combobox — os papéis, medidos no fonte do RN e não presumidos", () => {
  // O Lote 5 mediu que o RN ACEITA papel que não mapeia (`dialog` -> `null`). `combobox` mapeia
  // no Android e NÃO no iOS; `button` e `search` mapeiam nos dois. Por isso o gatilho é `button`
  // (ele abre uma folha, não aceita digitação) e o campo da folha é `search`.
  it("o gatilho é `button` com `expanded`; o campo da folha é `search`", () => {
    render(<Envolve><Combobox items={CATALOGO} testID="cb" /></Envolve>);
    expect(porID("Pressable", "cb").accessibilityRole).toBe("button");
    expect((porID("Pressable", "cb").accessibilityState as {expanded: boolean}).expanded)
      .toBe(false);
    expect(porID("TextInput", "cb-busca").accessibilityRole).toBe("search");
  });

  // DEFEITO SILENCIOSO, o mesmo do Lote 4: o campo desenha o rótulo ao lado e não o entrega ao
  // controle. Visualmente perfeito; para o leitor de tela, um campo sem nome.
  it("o nome vem do `Field`, como em todo controle deste pacote", () => {
    render(
      <Envolve>
        <Field label="Item" hint="Comece a digitar"><Combobox items={CATALOGO} testID="cb" /></Field>
      </Envolve>);
    expect(porID("Pressable", "cb").accessibilityLabel).toBe("Item");
    expect(porID("Pressable", "cb").accessibilityHint).toBe("Comece a digitar");
  });

  it("o gatilho mostra o ESCOLHIDO mesmo quando ele não está mais em `items`", () => {
    // É a razão de `value` ser o item inteiro e não o `value`: numa busca remota a pessoa escolhe
    // e depois digita outra coisa, e a lista some debaixo da escolha. Guardar só o id deixaria o
    // campo em branco no instante seguinte.
    render(
      <Envolve>
        <Combobox items={[]} value={{value: "9", label: "Açúcar refinado"}} testID="cb" />
      </Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("Açúcar refinado");
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 2 · SearchField — o outro papel, e a confusão que ele evita
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("SearchField", () => {
  it("é `search`, que mapeia nos dois sistemas", () => {
    render(<Envolve><SearchField placeholder="Filtrar" testID="sf" /></Envolve>);
    expect(porID("TextInput", "sf-campo").accessibilityRole).toBe("search");
    expect(porID("TextInput", "sf-campo").accessibilityLabel).toBe("Filtrar");
  });

  it("o botão de limpar só existe quando há o que limpar", async () => {
    render(<Envolve><SearchField testID="sf" /></Envolve>);
    expect(porID("Pressable", "sf-limpar").onPress).toBeUndefined();
    await digitar(porID("TextInput", "sf-campo"), "arroz");
    expect(porID("Pressable", "sf-limpar").onPress).toBeDefined();
  });

  it("a borda mora no GRUPO, não no campo — uma caixa, não três", () => {
    render(<Envolve><SearchField testID="sf" /></Envolve>);
    expect(estilo("View", __instancias("View").findIndex((p) => p.testID === "sf")).borderColor)
      .toBe(tokens.color.borderStrong);
    expect(StyleSheet.flatten(porID("TextInput", "sf-campo").style).borderWidth).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 3 · NumberField — o MOMENTO, que é a ADR-0024 inteira
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("o formatador e a volta", () => {
  // A sonda: o separador decimal e o de grupo saem de formatar 12345.6, e não de uma tabela
  // escrita à mão. `formatToParts`, que resolveria isso direto, é só Android no motor.
  it("deriva os separadores do locale", () => {
    expect(separadoresDoLocale("pt-BR")).toEqual({decimal: ",", grupo: "."});
    expect(separadoresDoLocale("en-US")).toEqual({decimal: ".", grupo: ","});
  });

  // 🔴 A VOLTA É O QUE A WEB NÃO PRECISOU ESCREVER — lá o Base UI lê o texto de volta. Sem isto,
  // um campo de moeda em pt-BR devolve `NaN` para tudo que a pessoa digitar com vírgula.
  it("lê de volta o que a pessoa digita ou COLA", () => {
    expect(lerNumero("1.234,50", "pt-BR")).toBe(1234.5);
    expect(lerNumero("R$ 1.234,50", "pt-BR")).toBe(1234.5);
    expect(lerNumero("12,4", "pt-BR")).toBe(12.4);
    expect(lerNumero("-12,4", "pt-BR")).toBe(-12.4);
    expect(lerNumero("1,234.50", "en-US")).toBe(1234.5);
  });

  // `null` NÃO é zero, e a diferença importa num lançamento: campo vazio é "não informado",
  // zero é "informado como zero".
  it("texto sem número devolve `null`, e `null` não é 0", () => {
    expect(lerNumero("", "pt-BR")).toBeNull();
    expect(lerNumero("abc", "pt-BR")).toBeNull();
    expect(lerNumero("R$ ", "pt-BR")).toBeNull();
    expect(lerNumero("0", "pt-BR")).toBe(0);
  });

  // Dois separadores decimais não viram número: adivinhar qual a pessoa quis é pior que devolver
  // o valor anterior.
  it("texto ambíguo devolve `null` em vez de adivinhar", () => {
    expect(lerNumero("1,2,3", "pt-BR")).toBeNull();
  });

  it("formata moeda e medida pelo `Intl`", () => {
    expect(formatarNumero(1234.5, "pt-BR", {style: "currency", currency: "BRL"}))
      .toContain("1.234,50");
    expect(formatarNumero(12.44, "pt-BR", {maximumFractionDigits: 1})).toBe("12,4");
  });
});

describe("NumberField — formata no blur, e SÓ no blur", () => {
  // 🔴 O DEFEITO QUE A ADR-0024 EXISTE PARA IMPEDIR, e ele PASSA em inspeção visual: formatar ao
  // vivo deixa a tela bonita e descasa o que o leitor de tela anuncia (o que foi digitado) do que
  // o campo mostra (o que a máscara deixou passar). O USWDS publicou o defeito junto com o
  // componente; o MUI abandonou a máscara na v6 por causa dele.
  it("enquanto se digita, o campo mostra EXATAMENTE o que foi digitado", async () => {
    render(
      <Envolve>
        <NumberField value={null} format={{style: "currency", currency: "BRL"}} locale="pt-BR"
                     testID="nf" />
      </Envolve>);
    const campo = porID("TextInput", "nf-campo");
    await act(async () => { (campo.onFocus as () => void)(); });
    await digitar(porID("TextInput", "nf-campo"), "1234,5");
    expect(porID("TextInput", "nf-campo").value).toBe("1234,5");
  });

  it("no blur, formata — e emite o número CRU", async () => {
    const mudou = vi.fn();
    render(
      <Envolve>
        <NumberField defaultValue={undefined} onValueChange={mudou}
                     format={{style: "currency", currency: "BRL"}} locale="pt-BR" testID="nf" />
      </Envolve>);
    await act(async () => { (porID("TextInput", "nf-campo").onFocus as () => void)(); });
    await digitar(porID("TextInput", "nf-campo"), "1234,5");
    await act(async () => { (porID("TextInput", "nf-campo").onBlur as () => void)(); });

    // 🔴 A TRAVA DA ADR-0024: o que sai é `1234.5`, nunca `"R$ 1.234,50"`. Na web o motor
    // renderiza um input escondido com o valor cru; aqui o contrato É a assinatura da função, e
    // quem devolvesse a string formatada quebraria toda conta do app em silêncio.
    expect(mudou).toHaveBeenCalledWith(1234.5);
    expect(porID("TextInput", "nf-campo").value).toContain("1.234,50");
  });

  it("apagar tudo devolve `null`, e texto ilegível devolve o valor de antes", async () => {
    const mudou = vi.fn();
    render(
      <Envolve><NumberField value={10} onValueChange={mudou} locale="pt-BR" testID="nf" /></Envolve>);
    await act(async () => { (porID("TextInput", "nf-campo").onFocus as () => void)(); });
    await digitar(porID("TextInput", "nf-campo"), "abc");
    await act(async () => { (porID("TextInput", "nf-campo").onBlur as () => void)(); });
    expect(mudou).not.toHaveBeenCalled();
    expect(porID("TextInput", "nf-campo").value).toBe("10");

    await act(async () => { (porID("TextInput", "nf-campo").onFocus as () => void)(); });
    await digitar(porID("TextInput", "nf-campo"), "");
    await act(async () => { (porID("TextInput", "nf-campo").onBlur as () => void)(); });
    expect(mudou).toHaveBeenCalledWith(null);
  });

  it("prende no `min` e no `max`", async () => {
    const mudou = vi.fn();
    render(
      <Envolve>
        <NumberField value={null} onValueChange={mudou} min={0} max={100} locale="pt-BR"
                     testID="nf" />
      </Envolve>);
    await act(async () => { (porID("TextInput", "nf-campo").onFocus as () => void)(); });
    await digitar(porID("TextInput", "nf-campo"), "500");
    await act(async () => { (porID("TextInput", "nf-campo").onBlur as () => void)(); });
    expect(mudou).toHaveBeenCalledWith(100);
  });
});

describe("NumberField — os botões, que são o contador acumulado", () => {
  it("somam e tiram o `step`", async () => {
    const mudou = vi.fn();
    render(
      <Envolve><NumberField value={3} onValueChange={mudou} step={2} testID="nf" /></Envolve>);
    await tocar(porID("Pressable", "nf-mais"));
    expect(mudou).toHaveBeenCalledWith(5);
    await tocar(porID("Pressable", "nf-menos"));
    expect(mudou).toHaveBeenLastCalledWith(1);
  });

  // DEFEITO: um botão vivo no limite. A pessoa toca, nada muda, e ela não sabe se o app travou
  // ou se chegou ao fim.
  it("desabilitam no limite", () => {
    render(<Envolve><NumberField value={0} min={0} max={5} testID="nf" /></Envolve>);
    expect((porID("Pressable", "nf-menos").accessibilityState as {disabled: boolean}).disabled)
      .toBe(true);
    expect((porID("Pressable", "nf-mais").accessibilityState as {disabled: boolean}).disabled)
      .toBe(false);
  });

  // DEFEITO: tocar no `+` no meio de uma digitação descarta o que foi digitado, em silêncio.
  it("empurrar no meio da digitação parte do que está ESCRITO, não do valor antigo", async () => {
    const mudou = vi.fn();
    render(
      <Envolve>
        <NumberField value={1} onValueChange={mudou} locale="pt-BR" testID="nf" />
      </Envolve>);
    await act(async () => { (porID("TextInput", "nf-campo").onFocus as () => void)(); });
    await digitar(porID("TextInput", "nf-campo"), "40");
    await tocar(porID("Pressable", "nf-mais"));
    expect(mudou).toHaveBeenCalledWith(41);
  });
});

describe("NumberField — o foco, achado pela REFERÊNCIA", () => {
  // 🔴 ESTE DEFEITO NÃO FOI ACHADO POR MIM, E É O PONTO. Ele passou por 47 testes, pelo
  // `validate.py`, pelo build e pela publicação. Quem o achou foi o inventário da HeroUI que já
  // estava no repositório — `audit/activity-2/INVENTORY-HEROUI.json`, medido em 22/08/2026 sobre
  // `@heroui/react@3.2.4`, que lista os estados do `number-field` deles:
  //
  //     disabled · focus-visible · FOCUS-WITHIN · hovered · invalid · pressed
  //
  // O `NumberField` daqui nasceu SEM estado de foco nenhum, e era o único campo de texto do
  // pacote assim. No telefone o foco é a ÚNICA pista de qual campo o teclado está alimentando —
  // está escrito no `Input` do Lote 4 desde 08/09, e não foi aplicado aqui.
  it("marca o foco, como todo campo de texto do pacote", async () => {
    render(<Envolve><NumberField value={10} locale="pt-BR" testID="nf" /></Envolve>);
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).borderColor)
      .toBe(tokens.color.borderStrong);
    await act(async () => { (porID("TextInput", "nf-campo").onFocus as () => void)(); });
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).borderColor)
      .toBe(tokens.color.focusStrong);
    await act(async () => { (porID("TextInput", "nf-campo").onBlur as () => void)(); });
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).borderColor)
      .toBe(tokens.color.borderStrong);
  });

  // DEFEITO DE ORDEM, e ele é sutil: um campo inválido que está sendo CORRIGIDO precisa mostrar
  // que está ativo. Se o inválido vencer o foco, a pessoa digita sem pista nenhuma.
  it("com foco, o foco vence o inválido — porque é o inválido que está sendo corrigido", async () => {
    render(
      <Envolve>
        <Field label="Litros" error="Só números"><NumberField value={1} testID="nf" /></Field>
      </Envolve>);
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).borderColor)
      .toBe(tokens.color.danger400);
    await act(async () => { (porID("TextInput", "nf-campo").onFocus as () => void)(); });
    expect(StyleSheet.flatten(porID("TextInput", "nf-campo").style).borderColor)
      .toBe(tokens.color.focusStrong);
  });

  // A TRAVA DE CONSISTÊNCIA, e ela é a que impede o defeito de voltar em OUTRO campo: os três
  // campos de texto do pacote têm de marcar foco com a MESMA cor. Um campo novo que esquecer
  // reprova aqui, não daqui a um mês numa comparação com referência.
  //
  // ⚠ **E O QUEM CARREGA A CAIXA NÃO É O MESMO NOS TRÊS — a primeira versão deste teste errou
  // exatamente aí.** Ela lia a borda no `TextInput` dos três e o `SearchField` devolveu
  // `undefined`. Não era defeito do componente: ali a borda mora no GRUPO, porque ele tem lupa e
  // botão de limpar dentro da mesma caixa — é o `.input-group:focus-within` do nosso CSS
  // (`aurea.css:743`), e é a mesma estrutura que a HeroUI usa no `search-field` dela
  // (`Root · Group · Input · ClearButton`, com `focus-within` no Group).
  //
  // Os outros dois são `.input:focus-visible` (`aurea.css`), com a borda no próprio campo. **Duas
  // anatomias, um token** — e o teste tem de perguntar ao nó certo em cada uma, senão ele reprova
  // código correto, que é a forma mais cara de um teste falhar.
  it("Input, SearchField e NumberField marcam foco com o MESMO token", async () => {
    render(
      <Envolve>
        <Input value="a" testID="in" />
        <SearchField testID="sf" />
        <NumberField value={1} testID="nf" />
      </Envolve>);
    // [ id do campo que recebe o foco , id do nó que CARREGA a caixa , primitivo desse nó ]
    const anatomia: Array<[string, string, string]> = [
      ["in", "in", "TextInput"],                 // a borda é do próprio campo
      ["sf-campo", "sf", "View"],                // a borda é do GRUPO
      ["nf-campo", "nf-campo", "TextInput"],     // a borda é do próprio campo
    ];
    const cores: unknown[] = [];
    for (const [campoID, caixaID, primitivo] of anatomia) {
      await act(async () => { (porID("TextInput", campoID).onFocus as () => void)(); });
      cores.push(StyleSheet.flatten(porID(primitivo, caixaID).style).borderColor);
    }
    expect(cores).toEqual([
      tokens.color.focusStrong, tokens.color.focusStrong, tokens.color.focusStrong,
    ]);
  });
});

describe("NumberField — o teclado e a recusa medida", () => {
  it("o padrão é `decimal-pad`", () => {
    render(<Envolve><NumberField value={0} testID="nf" /></Envolve>);
    expect(porID("TextInput", "nf-campo").keyboardType).toBe("decimal-pad");
  });

  // DEFEITO REAL DE PLATAFORMA: o `decimal-pad` do iOS **não tem tecla de menos**. Um campo que
  // aceita −5 e não deixa digitá-lo é um campo quebrado, e só no iOS.
  it("com `min` negativo no iOS, o teclado tem sinal", () => {
    __definirPlataforma("ios");
    render(<Envolve><NumberField value={0} min={-10} testID="nf" /></Envolve>);
    expect(porID("TextInput", "nf-campo").keyboardType).toBe("numbers-and-punctuation");
  });

  // 🔴 RECUSA MEDIDA, não preferência: `notation: "compact"` está quebrado no motor nos dois
  // sistemas (motor#768, motor#1035). Um "1,2 mi" errado numa tela de lançamento é pior que
  // "1.234.567", porque parece certo.
  it("`notation: \"compact\"` é ignorado, e o resto do formato sobrevive", () => {
    const avisos: unknown[][] = [];
    const original = console.warn;
    console.warn = (...a: unknown[]) => { avisos.push(a); };
    try {
      render(
        <Envolve>
          <NumberField value={1234567} locale="pt-BR" testID="nf"
                       format={{notation: "compact", minimumFractionDigits: 2}} />
        </Envolve>);
    } finally { console.warn = original; }
    expect(avisos.map(String).join(" ")).toContain("compact");
    expect(porID("TextInput", "nf-campo").value).toBe("1.234.567,00");
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 4 · Input.formatOnBlur — o MOMENTO para texto
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("Input.formatOnBlur", () => {
  it("normaliza quando o foco sai, e não enquanto se digita", async () => {
    const mudou = vi.fn();
    render(
      <Envolve>
        <Input value="abc1d23" onChangeText={mudou}
               formatOnBlur={(v) => v.toUpperCase()} testID="in" />
      </Envolve>);
    await digitar(porID("TextInput", "in"), "abc1d2");
    expect(mudou).toHaveBeenCalledWith("abc1d2");   // o que foi digitado, cru
    await act(async () => { (porID("TextInput", "in").onBlur as () => void)(); });
    expect(mudou).toHaveBeenLastCalledWith("ABC1D23");
  });

  // DEFEITO DE CUSTO: emitir o mesmo valor a cada saída de foco re-renderiza o formulário inteiro
  // sem motivo — num formulário de dez campos, dez renders por preenchimento.
  it("não avisa quando o texto não mudou", async () => {
    const mudou = vi.fn();
    render(
      <Envolve>
        <Input value="ABC" onChangeText={mudou} formatOnBlur={(v) => v.toUpperCase()} testID="in" />
      </Envolve>);
    await act(async () => { (porID("TextInput", "in").onBlur as () => void)(); });
    expect(mudou).not.toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 5 · Image e Gallery — a terceira lacuna
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("Image — reservar a caixa e cair para o substituto", () => {
  // 🔴 SEM ISTO O LAYOUT SALTA quando o bitmap chega, e num telefone o salto acontece com o dedo
  // já a caminho do botão. É a primeira das duas promessas da ficha da web.
  it("reserva a caixa: a proporção entra e a superfície pinta", () => {
    render(<Envolve><Image source="http://x/a.jpg" alt="Frente" ratio="4/3" testID="im" /></Envolve>);
    const s = StyleSheet.flatten(porID("Image", "im").style);
    expect(s.aspectRatio).toBeCloseTo(4 / 3);
    expect(s.backgroundColor).toBe(tokens.color.surface3 ?? tokens.color.muted);
  });

  it("aceita a razão como número, como `16/9` e como `16:9`", () => {
    render(
      <Envolve>
        <Image source="a" alt="a" ratio={2} testID="a" />
        <Image source="b" alt="b" ratio="16/9" testID="b" />
        <Image source="c" alt="c" ratio="16:9" testID="c" />
      </Envolve>);
    expect(StyleSheet.flatten(porID("Image", "a").style).aspectRatio).toBe(2);
    expect(StyleSheet.flatten(porID("Image", "b").style).aspectRatio).toBeCloseTo(16 / 9);
    expect(StyleSheet.flatten(porID("Image", "c").style).aspectRatio).toBeCloseTo(16 / 9);
  });

  // 🔴 A SEGUNDA PROMESSA, e ela tem cicatriz nesta casa: o `Avatar` foi medido em 31/07/2026 com
  // `src` quebrado e NÃO caía no substituto. Aqui o substituto continua sendo a imagem para quem
  // usa leitor de tela, com o mesmo texto.
  it("`onError` cai no substituto, que mantém o nome acessível", async () => {
    render(<Envolve><Image source="http://x/a.jpg" alt="Frente do item" testID="im" /></Envolve>);
    await act(async () => { (porID("Image", "im").onError as () => void)(); });
    const caixa = porID("View", "im");
    expect(caixa.accessibilityRole).toBe("image");
    expect(caixa.accessibilityLabel).toBe("Frente do item");
  });

  // DEFEITO: uma URL quebrada deixa um buraco cinza PERMANENTE, mesmo depois de o app trocar a
  // foto. É a mesma linha que o `Avatar` precisou (`display.tsx:283`).
  it("`source` nova merece uma tentativa nova", async () => {
    const tela = render(
      <Envolve><Image source="http://x/a.jpg" alt="a" testID="im" /></Envolve>);
    await act(async () => { (porID("Image", "im").onError as () => void)(); });
    expect(porID("View", "im").accessibilityRole).toBe("image");
    tela.rerender(<Envolve><Image source="http://x/b.jpg" alt="a" testID="im" /></Envolve>);
    expect(porID("Image", "im").source).toEqual({uri: "http://x/b.jpg"});
  });

  // `alt=""` é decorativo EXPLÍCITO, como manda a WAI — não um esquecimento.
  it("`alt` vazio sai da árvore de acessibilidade", () => {
    render(<Envolve><Image source="a" alt="" testID="im" /></Envolve>);
    expect(porID("Image", "im").accessible).toBe(false);
    expect(porID("Image", "im").accessibilityLabel).toBeUndefined();
  });
});

describe("Gallery", () => {
  const FOTOS = [
    {id: "a", source: "http://x/a.jpg", alt: "Frente"},
    {id: "b", source: "http://x/b.jpg", alt: "Verso"},
  ];

  // DEFEITO: um alvo que não faz nada engana quem navega por leitor de tela — ele anuncia
  // "botão", a pessoa toca, e nada acontece. Mesma decisão da web.
  it("sem `onSelect` e sem `zoom`, os ladrilhos não são alvos", () => {
    render(<Envolve><Gallery items={FOTOS} testID="g" /></Envolve>);
    expect(__instancias("Pressable").filter((p) => p.accessibilityRole === "imagebutton").length)
      .toBe(0);
  });

  it("com `zoom`, os ladrilhos viram alvos com o nome da foto", () => {
    render(<Envolve><Gallery items={FOTOS} zoom testID="g" /></Envolve>);
    expect(porID("Pressable", "g-a").accessibilityRole).toBe("imagebutton");
    expect(porID("Pressable", "g-a").accessibilityLabel).toBe("Frente");
  });

  // 🔴 LEGENDA VISÍVEL TORNA A MINIATURA DECORATIVA. Na web quem exigiu isso foi o axe
  // (`image-redundant-alt`): com `alt` e legenda dizendo a mesma coisa, o leitor anuncia duas
  // vezes seguidas. Aqui a tradução é outra — quem carrega o nome é o LADRILHO — mas a regra é a
  // mesma, e o `alt` continua nomeando a foto ampliada.
  it("com legenda, a imagem sai da árvore e o ladrilho leva o nome", () => {
    render(
      <Envolve>
        <Gallery items={[{...FOTOS[0], caption: "Frente do item"}]} zoom testID="g" />
      </Envolve>);
    expect(porID("Pressable", "g-a").accessibilityLabel).toBe("Frente do item");
    expect(__instancias("Image")[0].accessible).toBe(false);
  });

  // A trava que a web escreveu no item L2, e ela atravessa: ampliar é DIÁLOGO, e diálogo já
  // existe. Uma segunda superfície flutuante aqui seria uma segunda linguagem.
  it("ampliar abre o `Dialog` que já existe, com a foto em `contain`", async () => {
    render(<Envolve><Gallery items={FOTOS} zoom testID="g" /></Envolve>);
    expect(ultimo("Modal").visible).toBe(false);
    await tocar(porID("Pressable", "g-a"));
    expect(ultimo("Modal").visible).toBe(true);
    // A foto ampliada é a última `Image` montada, e ela não corta: cortar o que a pessoa pediu
    // para VER é o oposto do que ela pediu.
    expect(ultimo("Image").resizeMode).toBe("contain");
  });

  it("a galeria não guarda a escolha — `selected` é do app", async () => {
    const escolher = vi.fn();
    render(<Envolve><Gallery items={FOTOS} onSelect={escolher} testID="g" /></Envolve>);
    await tocar(porID("Pressable", "g-b"));
    expect(escolher).toHaveBeenCalledWith("b");
    // Nada mudou sozinho: sem `selected` vindo de fora, nenhum ladrilho está escolhido.
    expect((porID("Pressable", "g-b").accessibilityState as {selected: boolean}).selected)
      .toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 6 · O provider — as frases novas existem nos dois idiomas
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("as frases do Lote 7", () => {
  // DEFEITO SILENCIOSO: uma chave que existe no inglês e não no português deixa um botão do app
  // falando outra língua no meio da tela — e o tipo não pega, porque `AureaStrings` é total.
  it("estão nos dois idiomas e chegam ao componente", async () => {
    const {defaultStrings, ptBR} = await import("../../packages/native/src/strings.js");
    for (const chave of [
      "increment", "decrement", "comboboxEmpty", "comboboxClear", "comboboxLoading",
      "comboboxSearch", "searchClear", "galleryLabel",
    ] as const) {
      expect(defaultStrings[chave], chave).toBeTruthy();
      expect(ptBR[chave], chave).toBeTruthy();
      expect(ptBR[chave], chave).not.toBe(defaultStrings[chave]);
    }
  });

  it("o `Combobox` usa a frase do provider no campo de busca", async () => {
    const {ptBR} = await import("../../packages/native/src/strings.js");
    render(
      <AureaProvider icons={ICONES} strings={ptBR}>
        <Combobox items={[]} testID="cb" />
      </AureaProvider>);
    expect(porID("TextInput", "cb-busca").placeholder).toBe("Buscar");
  });
});

// Uma linha de higiene: nenhum dos componentes novos pode ter ficado sem folha memoizada. Duas
// instâncias do mesmo componente leem a MESMA folha enquanto (tema, densidade) não muda — é o
// que a ADR-0037 comprou, e é fácil de perder escrevendo `StyleSheet.create` dentro do corpo.
describe("a folha é memoizada por (tema, densidade)", () => {
  it("duas instâncias leem o mesmo objeto de estilo", () => {
    render(
      <Envolve>
        <Image source="a" alt="a" testID="a" />
        <Image source="b" alt="b" testID="b" />
      </Envolve>);
    const a = (porID("Image", "a").style as unknown[])[0];
    const b = (porID("Image", "b").style as unknown[])[0];
    expect(a).toBe(b);
  });
});
