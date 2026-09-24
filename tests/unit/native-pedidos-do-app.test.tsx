// OS PEDIDOS DO CONSUMIDOR DE 17/09/2026 — os que a conferência aprovou.
//
// Ele mandou treze itens. **Um já estava resolvido** (o `Combobox`, na `0.8.4`), **quatro não
// existem em lado nenhum** e viraram decisão do Victor, **um contradiz a nossa própria web** (o
// `IconButton` redondo) e foi recusado. Sobraram os que este arquivo trava.
//
// ⚠ **E DOIS eu classifiquei ERRADO na conferência**, medindo a web depois: o `Switch` com
// descrição (C1) e a segunda linha no item do `Combobox` (C2). Eu disse que *"a web já resolveu,
// é só traduzir"*. **Não resolveu:** o `Switch` da web também não tem descrição, e o
// `ComboboxOption` de lá é `{value, label}` — tem MENOS que o nosso. O C1 entrou assim mesmo,
// porque o nativo já dá descrição ao `Checkbox` e ao `Radio` e o `Switch` era o único de fora;
// o C2 ficou FORA, esperando decisão.
import {render, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {
  AureaProvider, Badge, BottomNav, BottomNavProvider, Button, Card, Checkbox, Field, Grid, IconButton,
  NavList, NumberField, Screen, Select, SegmentedControl, Switch, Tabs, Text,
  criarRegistroDeIcones, resolverTokens, useBottomNavSpace,
} from "../../packages/native/src/index.js";
import {__definirInsets} from "./native-stubs/react-native-safe-area-context";

const claro = resolverTokens("light", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({
  "chevron--right": Glifo, checkmark: Glifo, add: Glifo,
});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider theme="light" icons={ICONES}>{children}</AureaProvider>;

type Props = Record<string, unknown>;

// ═════════════════════════════════════════════════════════════════════════════════════════════
// A4 + B1 · NavList
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("A4 · o `value` do `NavList` pode ser tocável, então sai do `Pressable`", () => {
  // O caso REAL que o app mediu: um `Switch` na coluna da direita ("Desbloqueio por digital").
  //
  // 🔴 **A PRIMEIRA VERSÃO DESTE TESTE PASSOU VERDE COM O DEFEITO DENTRO.** Ela procurava
  // `onPress` entre os descendentes do gatilho — e **um `<Switch/>` não renderizado não tem
  // `onPress` nas props**: ele tem `label`, `checked`, `onChange`. O que é tocável só aparece
  // DEPOIS de montar, e a árvore de `children` guarda o elemento por montar.
  // ⚠ É a mesma lição que este repositório já pagou quatro vezes: *escolher a forma que o
  // defeito TEVE é parte do teste*. A forma aqui é **o nó do valor ser filho do gatilho** — e é
  // isso que se mede, por `testID`, que sobrevive por não ser renderizado.
  it("valor em COMPONENTE fica fora do gatilho", () => {
    const temNoID = (no: React.ReactNode, id: string): boolean => {
      if (Array.isArray(no)) return no.some((n) => temNoID(n as React.ReactNode, id));
      if (!React.isValidElement(no)) return false;
      const p = no.props as Props;
      return p.testID === id || temNoID(p.children as React.ReactNode, id);
    };
    render(
      <Envolve>
        <NavList items={[
          {id: "a", label: "Digital", value: <Switch label="x" testID="sw" />, onPress: () => {}},
        ]} />
      </Envolve>);
    const gatilhos = __instancias("Pressable").filter((p) => p.accessibilityRole === "link");
    expect(gatilhos.length).toBe(1);
    expect(temNoID(gatilhos[0].children as React.ReactNode, "sw")).toBe(false);
    // e ele continua na tela, do lado de fora
    expect(__instancias("Pressable").some((p) => p.testID === "sw")).toBe(true);
  });

  // ⚠ E o contrário: valor em TEXTO continua DENTRO, porque é parte da frase da linha. Pô-lo
  // fora criaria uma segunda parada do leitor de tela dizendo só "42 km", solta.
  it("valor em TEXTO continua na leitura da linha", () => {
    render(
      <Envolve>
        <NavList items={[{id: "a", label: "Km", value: "42 km", onPress: () => {}}]} />
      </Envolve>);
    const gatilho = __instancias("Pressable").find((p) => p.accessibilityRole === "link") ?? {};
    const textos: unknown[] = [];
    const andar = (n: React.ReactNode): void => {
      if (Array.isArray(n)) { n.forEach(andar); return; }
      if (!React.isValidElement(n)) return;
      const p = n.props as Props;
      if (typeof p.children === "string") textos.push(p.children);
      andar(p.children as React.ReactNode);
    };
    andar(gatilho.children as React.ReactNode);
    expect(textos).toContain("42 km");
  });
});

describe("B1 · linha sem ação não é `link`", () => {
  it("sem `onPress` não há papel de link, e não há `Pressable`", () => {
    render(<Envolve><NavList items={[{id: "a", label: "Só leitura", value: "3"}]} /></Envolve>);
    expect(__instancias("Pressable").filter((p) => p.accessibilityRole === "link")).toEqual([]);
    // ...e a linha continua sendo UMA leitura, não três paradas soltas.
    expect(__instancias("View").filter((p) => p.accessible === true).length).toBe(1);
  });

  it("com `onPress` o papel volta", () => {
    render(<Envolve><NavList items={[{id: "a", label: "Abre", onPress: () => {}}]} /></Envolve>);
    expect(__instancias("Pressable").filter((p) => p.accessibilityRole === "link").length).toBe(1);
  });

  // Seta em linha que não abre nada é promessa falsa.
  it("a seta só aparece quando há ação", () => {
    render(<Envolve><NavList items={[{id: "a", label: "Só leitura"}]} /></Envolve>);
    const antes = __instancias("Icon").length + __instancias("Svg").length;
    expect(antes).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// C4 · SegmentedControl — a linguagem de selecionado
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("C4 · o segmento escolhido usa a MARCA, não o texto comum", () => {
  const CASO = [{value: "a", label: "Um"}, {value: "b", label: "Dois"}];

  it("o rótulo escolhido é `primaryEmphasis`", () => {
    render(<Envolve><SegmentedControl items={CASO} value="a" /></Envolve>);
    const cores = __instancias("Text").map((p) => StyleSheet.flatten(p.style)?.color);
    expect(cores).toContain(claro.color.primaryEmphasis);
    // e NÃO o cinza de antes, nem o texto comum
    expect(cores).not.toContain(claro.color.foreground);
  });

  // O fio amarelo é a outra metade da mesma linguagem (`aurea.css:958-960`).
  it("e ele ganha o fio amarelo a 75%", () => {
    render(<Envolve><SegmentedControl items={CASO} value="a" /></Envolve>);
    const fios = __instancias("View").filter((p) => {
      const e = StyleSheet.flatten(p.style) ?? {};
      return e.position === "absolute" && e.height === 2 && e.bottom === 0;
    });
    expect(fios.length).toBe(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// C5 · Badge com glifo · C1 · Switch com descrição
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("C5 · o `Badge` aceita glifo antes e depois", () => {
  // ⚠ A sentinela é um `Text` com `testID`, e NÃO um `Icon`: o dublê de glifo devolve `null`,
  // então contar `Svg` mediria o dublê e não o slot. *Escolher o que o teste realmente exercita
  // é parte do teste* — a primeira versão disto reprovou código certo.
  const Marca = () => <Text testID="marca">v</Text>;

  it("o que entra em `leading` é desenhado", () => {
    render(<Envolve><Badge leading={<Marca />}>Tudo em dia</Badge></Envolve>);
    expect(__instancias("Text").some((p) => p.testID === "marca")).toBe(true);
  });

  it("e o que entra em `trailing` também", () => {
    render(<Envolve><Badge trailing={<Marca />}>Tudo em dia</Badge></Envolve>);
    expect(__instancias("Text").some((p) => p.testID === "marca")).toBe(true);
  });

  // Ponto puro não tem miolo, então também não tem slot — senão o selo deixa de ser um ponto.
  it("com `dot` sozinho os slots não entram", () => {
    render(<Envolve><Badge dot leading={<Marca />} /></Envolve>);
    expect(__instancias("Text").some((p) => p.testID === "marca")).toBe(false);
  });
});

describe("C1 · o `Switch` ganhou descrição", () => {
  it("ela desenha, e vira DICA para quem usa leitor de tela", () => {
    render(<Envolve><Switch label="Digital" description="Use a digital para entrar" /></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("Use a digital para entrar");
    const gatilho = __instancias("Pressable").find((p) => p.accessibilityRole === "switch") ?? {};
    expect(gatilho.accessibilityHint).toBe("Use a digital para entrar");
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// B2 · Tabs
// ═════════════════════════════════════════════════════════════════════════════════════════════

describe("B2 · `Tabs` — trocar de painel, não trocar de página", () => {
  // ⚠ O conteúdo é `<Text>` e não texto cru: um filho em string não vira instância de `Text`
  // no dublê, e o teste mediria o vazio. Mesma lição do slot do `Badge`, dois blocos acima.
  const ABAS = [
    {id: "r", label: "Resumo", content: <Text>corpo do resumo</Text>},
    {id: "h", label: "Histórico", content: <Text>corpo do histórico</Text>},
    {id: "f", label: "Fotos", content: <Text>corpo das fotos</Text>, disabled: true},
  ];

  it("os papéis são `tablist` e `tab` — e os dois mapeiam nos dois sistemas", () => {
    render(<Envolve><Tabs tabs={ABAS} value="r" /></Envolve>);
    expect(__instancias("View").some((p) => p.accessibilityRole === "tablist")).toBe(true);
    expect(__instancias("Pressable").filter((p) => p.accessibilityRole === "tab").length).toBe(3);
  });

  // 🔴 O papel `tabpanel` NÃO entra: ele existe no enum `Role` do Android e **não** no
  // `AccessibilityRole`, que é o que derruba a tela. Medido — e o `check 41` reprovou quando eu
  // tentei pôr. Este teste trava a ausência, para ninguém "melhorar" isso depois.
  it("o painel NÃO recebe papel", () => {
    render(<Envolve><Tabs tabs={ABAS} value="r" /></Envolve>);
    expect(__instancias("View").some((p) => p.accessibilityRole === "tabpanel")).toBe(false);
  });

  it("só o painel aberto é montado", () => {
    render(<Envolve><Tabs tabs={ABAS} value="h" /></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("corpo do histórico");
    expect(textos).not.toContain("corpo do resumo");
  });

  it("a aba escolhida é anunciada como escolhida", () => {
    render(<Envolve><Tabs tabs={ABAS} value="h" /></Envolve>);
    const abas = __instancias("Pressable").filter((p) => p.accessibilityRole === "tab");
    const estados = abas.map((p) => (p.accessibilityState as {selected: boolean}).selected);
    expect(estados).toEqual([false, true, false]);
  });

  it("aba indisponível não chama `onChange` e continua alcançável", () => {
    const trocar = vi.fn();
    render(<Envolve><Tabs tabs={ABAS} value="r" onChange={trocar} /></Envolve>);
    const fotos = __instancias("Pressable").filter((p) => p.accessibilityRole === "tab").at(-1) ?? {};
    expect(fotos.onPress).toBeUndefined();
    expect((fotos.accessibilityState as {disabled: boolean}).disabled).toBe(true);
    expect(trocar).not.toHaveBeenCalled();
  });

  // ⚠ A aba escolhida NÃO usa a marca — e isso é de propósito. O `.tab.active` da web é
  // `--foreground` e DESLIGA o fio que o `.segmented` recebe (`aurea.css:1128`). São dois sinais
  // para duas coisas. Este teste existe para ninguém "harmonizar" os dois depois.
  it("a aba escolhida NÃO usa a cor da marca — ao contrário do `SegmentedControl`", () => {
    render(<Envolve><Tabs tabs={ABAS} value="r" /></Envolve>);
    const cores = __instancias("Text").map((p) => StyleSheet.flatten(p.style)?.color);
    expect(cores).toContain(claro.color.foreground);
    expect(cores).not.toContain(claro.color.primaryEmphasis);
  });

  it("a fila rola na horizontal — quatro rótulos não cabem num telefone", () => {
    render(<Envolve><Tabs tabs={ABAS} value="r" /></Envolve>);
    expect(__instancias("ScrollView").some((p) => p.horizontal === true)).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// A1 · a fila que rola — e o defeito que eu já tinha PUBLICADO
// ═════════════════════════════════════════════════════════════════════════════════════════════
//
// 🔴 **A PRIMEIRA RESPOSTA QUE EU IA DAR ERA CRIAR UM COMPONENTE DE "CHIPS". Duas medições
// mataram a ideia, e as duas estavam a um comando de distância:**
//
//   1 · o `chip` da referência máxima é um RÓTULO — o único estado dele é `slot`, não há
//       `selected`. Ou seja, **ela também não tem grupo de chips de escolha**;
//   2 · e a nossa web **já resolvia o pedido**: `aurea.css:2127`, em tela de até 640px,
//       `.tabs,.pagination,.segmented { max-width:100%; overflow-x:auto; }`.
//
// **Não era desenho novo: era tradução que faltou.** Um terceiro jeito de escolher teria sido
// inventar o que já existia — e essa briga tem nome aqui: o `Sidebar`.
//
// 🔴 **E a segunda parte do pedido pegou código que eu PUBLIQUEI NA `0.8.5`:** o `Tabs` rolava
// com `showsHorizontalScrollIndicator={false}`, sem sinal nenhum de que havia mais abas. O
// consumidor nomeou isso pedindo OUTRA coisa, e a regra *"quem mais tem esse problema?"* trouxe
// até o `Tabs`. **A peça é a mesma nos dois.**

describe("A1 · `SegmentedControl` e `Tabs` rolam, e sabem quando transbordam", () => {
  const SEIS = ["Óleo", "Freio", "Pneu", "Corrente", "Revisão", "Outro"]
    .map((l) => ({value: l, label: l}));

  const medir = (visivel: number, conteudo: number) => {
    const rolador = __instancias("ScrollView").at(-1) ?? {};
    act(() => {
      (rolador.onLayout as (e: unknown) => void)({nativeEvent: {layout: {width: visivel}}});
      (rolador.onContentSizeChange as (w: number, h: number) => void)(conteudo, 40);
    });
  };

  it("o segmentado rola para o lado", () => {
    render(<Envolve><SegmentedControl items={SEIS} value="Óleo" /></Envolve>);
    expect(__instancias("ScrollView").some((p) => p.horizontal === true)).toBe(true);
  });

  // O sinal só aparece quando significa alguma coisa — é o que o `overflow-x:auto` da web faz.
  it("sem transbordo NÃO mostra barra; com transbordo mostra", () => {
    render(<Envolve><SegmentedControl items={SEIS} value="Óleo" /></Envolve>);
    medir(360, 300);
    expect((__instancias("ScrollView").at(-1) ?? {}).showsHorizontalScrollIndicator).toBe(false);

    medir(360, 900);
    expect((__instancias("ScrollView").at(-1) ?? {}).showsHorizontalScrollIndicator).toBe(true);
  });

  // ⚠ **A PRIMEIRA VERSÃO DESTE TESTE PASSOU VERDE COM O DEFEITO DENTRO — sexta vez neste
  // repositório.** Ela só renderizava e conferia o estado inicial, e tirando a guarda
  // `visivel > 0` ela continuava passando: no começo os DOIS valores são zero, e `0 > 0` é falso
  // de qualquer jeito. O teste media um caso onde a guarda não faz diferença.
  // **O caso que a guarda protege é o conteúdo chegar ANTES da largura** — o `onContentSizeChange`
  // pode disparar primeiro, e aí `900 > 0` daria "transbordou" com a barra piscando num rolador
  // cuja largura ninguém mediu ainda.
  // *Escolher a entrada que exercita o código é parte do teste* — a mesma lição do `M NaN NaN`.
  it("conteúdo medido ANTES da largura não decide nada", () => {
    render(<Envolve><SegmentedControl items={SEIS} value="Óleo" /></Envolve>);
    const rolador = __instancias("ScrollView").at(-1) ?? {};
    act(() => {
      (rolador.onContentSizeChange as (w: number, h: number) => void)(900, 40);
    });
    expect((__instancias("ScrollView").at(-1) ?? {}).showsHorizontalScrollIndicator).toBe(false);
  });

  it("o `Tabs` usa a MESMA peça — era o que estava quebrado na `0.8.5`", () => {
    render(<Envolve><Tabs tabs={[
      {id: "a", label: "Resumo", content: <Text>a</Text>},
      {id: "b", label: "Histórico", content: <Text>b</Text>},
    ]} value="a" /></Envolve>);
    medir(360, 900);
    expect((__instancias("ScrollView").at(-1) ?? {}).showsHorizontalScrollIndicator).toBe(true);
  });

  // O controle inteiro esmaece UMA vez. Duas opacidades de 0,5 dariam 0,25 e ele sumiria.
  it("desabilitado esmaece uma vez só", () => {
    render(<Envolve><SegmentedControl items={SEIS} value="Óleo" disabled /></Envolve>);
    const opacos = __instancias("ScrollView")
      .map((p) => StyleSheet.flatten(p.style)?.opacity).filter((o) => o != null);
    expect(opacos).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// A2 · o cartão da marca — e a regra que mora no TIPO
// ═════════════════════════════════════════════════════════════════════════════════════════════
//
// É a **primeira superfície grande preenchida com o amarelo** neste sistema. Até aqui ele só
// pintava coisa pequena: ponto de contador, pílula do passo atual, link de pular conteúdo.
//
// 🔴 **E a cor do texto não é escolha — é obrigação, medida nos dois temas contra o `primary`:**
//     texto comum ........ 10,34 claro · **1,83 escuro**  🔴
//     texto esmaecido .....  4,24 claro · **1,35 escuro**  🔴
//     primary-foreground ..  4,54 nos DOIS               ✅
// Sem forçar, o cartão sairia **quebrado no tema escuro sem ninguém ver no claro** — a assinatura
// exata dos defeitos que este repositório mais paga.

describe("A2 · `Card variant=\"brand\"`", () => {
  it("pinta com o amarelo de PREENCHER e larga a borda", () => {
    render(<Envolve><Card variant="brand" action={<Text>Registrar</Text>} testID="c" /></Envolve>);
    const cartao = __instancias("View").find((p) => p.testID === "c") ?? {};
    const e = StyleSheet.flatten(cartao.style);
    expect(e.backgroundColor).toBe(claro.color.primary);
    expect(e.borderColor).toBe("transparent");
  });

  it("o texto dentro dele é FORÇADO, e vence até o tom explícito", () => {
    render(
      <Envolve>
        <Card variant="brand" action={<Text>Registrar</Text>}>
          <Text>Faltam 300 km</Text>
          <Text tone="muted">desde a última troca</Text>
        </Card>
      </Envolve>);
    const cores = __instancias("Text").map((p) => StyleSheet.flatten(p.style)?.color);
    expect(cores.every((c) => c === claro.color.primaryForeground)).toBe(true);
    // e NENHUM deles caiu no esmaecido, que mede 1,35 no tema escuro
    expect(cores).not.toContain(claro.color.mutedForeground);
  });

  it("um cartão comum NÃO força cor nenhuma", () => {
    render(<Envolve><Card><Text tone="muted">normal</Text></Card></Envolve>);
    const cores = __instancias("Text").map((p) => StyleSheet.flatten(p.style)?.color);
    expect(cores).toContain(claro.color.mutedForeground);
  });

  it("a ação é desenhada, embaixo do conteúdo", () => {
    render(
      <Envolve>
        <Card variant="brand" action={<Text testID="acao">Registrar</Text>}>
          <Text>Faltam 300 km</Text>
        </Card>
      </Envolve>);
    expect(__instancias("Text").some((p) => p.testID === "acao")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 18/09/2026 · A TINTA DA MARCA VALE PARA LINHA E GLIFO, NÃO SÓ PARA LETRA
// ═════════════════════════════════════════════════════════════════════════════════════════════
//
// 🔴 **O `Card variant="brand"` saiu na `0.8.6` pela METADE, e o consumidor achou em UM DIA.**
// O bloco A2 acima mediu o contraste do TEXTO e parou ali. Medido depois, dentro do mesmo cartão:
//
//     contorno de campo (`borderStrong`) ....... 2,43 claro · 2,24 escuro   🔴 os DOIS
//     fundo de campo (`fieldBg`) ............... 1,61 claro                 🔴
//     glifo de botão sem fundo (`foreground`) .. 1,83 escuro                🔴
//     borda de inválido (`danger-400`) ......... 1,86                       🔴 pior que a tinta
//     foco (`focusStrong`) ..................... 1,00 escuro                🔴 lá ele É o amarelo
//
// A norma 1.4.11 pede **3:1** para o contorno que identifica um campo. Nenhum chega.
//
// 🔴 **E o pior era o `action`, que o TIPO EXIGE:** as quatro aparências de botão sobre o amarelo
// medem 1,61 · 1,00 · 1,38 · 1,83. **Nenhuma aparece.** O cartão obrigava a ter um botão e não
// dava a ele forma nenhuma de existir.
//
// ⚠ **Procurada uma superfície neutra para encaixar controle no amarelo, as três reprovam no tema
// claro** — `card` 1,91 · `background` 1,73 · `secondary` 1,61. Não há paleta possível: **uma
// única cor do sistema passa de 3:1 contra o amarelo nos dois temas**, e é a tinta (4,54).

const RegistroDeGlifos: string[] = [];
const GlifoQueAnota = ({color}: {size?: number; color?: string}) => {
  RegistroDeGlifos.push(color ?? "");
  return null as unknown as React.ReactElement;
};
const ICONES_ANOTADOS = criarRegistroDeIcones({
  add: GlifoQueAnota, subtract: GlifoQueAnota, checkmark: GlifoQueAnota,
  "chevron--down": GlifoQueAnota, "chevron--right": GlifoQueAnota,
});
const EnvolveAnotado = ({children}: {children: React.ReactNode}) =>
  <AureaProvider theme="light" icons={ICONES_ANOTADOS}>{children}</AureaProvider>;

const campoDoTeste = (id: string) =>
  StyleSheet.flatten(__instancias("TextInput").find((p) => p.testID === id)?.style) ?? {};

describe("a tinta da marca alcança CONTORNO e GLIFO, não só letra", () => {
  it("o campo dentro do cartão troca `borderStrong` (2,43) pela tinta (4,54) e larga o fundo", () => {
    render(
      <Envolve>
        <Card variant="brand" action={<Text>Confirmar</Text>}>
          <NumberField value={1200} onChange={() => {}} testID="km" />
        </Card>
      </Envolve>);
    const e = campoDoTeste("km-campo");
    expect(e.borderColor).toBe(claro.color.primaryForeground);
    expect(e.borderColor).not.toBe(claro.color.borderStrong);
    // sem fundo: NENHUMA superfície neutra do sistema separa do amarelo no tema claro
    expect(e.backgroundColor).toBe("transparent");
    expect(e.color).toBe(claro.color.primaryForeground);
  });

  it("FORA do cartão nada muda — o campo continua com a borda e o fundo de sempre", () => {
    render(<Envolve><Card><NumberField value={1200} onChange={() => {}} testID="km" /></Card></Envolve>);
    const e = campoDoTeste("km-campo");
    expect(e.borderColor).toBe(claro.color.borderStrong);
    expect(e.backgroundColor).toBe(claro.color.fieldBg);
  });

  // 🔴 O caso que a intuição erra: inválido NÃO pode vencer aqui.
  it("a tinta vence o INVÁLIDO, porque o vermelho mede 1,86 sobre o amarelo", () => {
    render(
      <Envolve>
        <Card variant="brand" action={<Text>Confirmar</Text>}>
          <Field label="Km" invalid error="Número alto demais">
            <NumberField value={9} onChange={() => {}} testID="km" />
          </Field>
        </Card>
      </Envolve>);
    const e = campoDoTeste("km-campo");
    expect(e.borderColor).toBe(claro.color.primaryForeground);
    expect(e.borderColor).not.toBe(claro.color.danger400 ?? claro.color.destructive);
  });

  it("o glifo do `IconButton` sem fundo vira tinta — ele media 1,83 no tema escuro", () => {
    RegistroDeGlifos.length = 0;
    render(
      <EnvolveAnotado>
        <Card variant="brand" action={<IconButton name="checkmark" label="Confirmar" />} />
      </EnvolveAnotado>);
    expect(RegistroDeGlifos).toContain(claro.color.primaryForeground);
    expect(RegistroDeGlifos).not.toContain(claro.color.foreground);
  });

  it("o botão CHEIO inverte: fundo na tinta, letra no amarelo do cartão", () => {
    render(
      <Envolve>
        <Card variant="brand"
              action={<Button appearance="solid" testID="acao">Registrar</Button>} />
      </Envolve>);
    const caixas = __instancias("View").map((p) => StyleSheet.flatten(p.style) ?? {});
    // o fundo do botão é a tinta, e NÃO o `secondary` (1,61) nem o amarelo (1,00)
    expect(caixas.some((e) => e.backgroundColor === claro.color.primaryForeground)).toBe(true);
    expect(caixas.some((e) => e.backgroundColor === claro.color.secondary)).toBe(false);
    const letras = __instancias("Text").map((p) => StyleSheet.flatten(p.style)?.color);
    expect(letras).toContain(claro.color.primary);
  });

  it("o botão CONTORNADO usa a tinta na borda — a `border` do tema mede 1,38", () => {
    render(
      <Envolve>
        <Card variant="brand" action={<Button appearance="outline">Registrar</Button>} />
      </Envolve>);
    const caixas = __instancias("View").map((p) => StyleSheet.flatten(p.style) ?? {});
    expect(caixas.some((e) => e.borderColor === claro.color.primaryForeground)).toBe(true);
    expect(caixas.some((e) => e.borderColor === claro.color.border)).toBe(false);
  });
});

// 🔴 A ARMADILHA QUE EU IA DEIXAR PASSAR: camada visual ≠ árvore de contexto.
//
// O `Modal` do React Native desenha POR CIMA de tudo, mas em React continua sendo FILHO de quem o
// escreveu. Um `Select` dentro do cartão amarelo abre a folha FORA dele — e sem um corte explícito
// a folha herdaria a tinta, pintando marrom sobre fundo normal.
describe("a tinta PARA nas superfícies que saem do cartão", () => {
  it("a folha do `Select` aberta dentro do cartão da marca não herda a tinta", () => {
    render(
      <Envolve>
        <Card variant="brand" action={<Text>Confirmar</Text>}>
          {/* SEM valor escolhido de propósito: assim "Gasolina" existe SÓ dentro da folha, e o
              gatilho (que fica no cartão e DEVE ter a tinta) mostra o texto de espera. Com um
              valor escolhido os dois textos são iguais e o teste não separa um do outro — foi
              como a primeira versão deste teste reprovou código certo. */}
          <Select items={[{value: "a", label: "Gasolina"}]} placeholder="Escolha" onChange={() => {}}
                  testID="combustivel" />
        </Card>
      </Envolve>);
    act(() => {
      const gatilho = __instancias("Pressable").find((p) => p.testID === "combustivel");
      (gatilho?.onPress as (() => void) | undefined)?.();
    });
    const dentroDaFolha = __instancias("Text")
      .filter((p) => p.children === "Gasolina")
      .map((p) => StyleSheet.flatten(p.style)?.color);
    expect(dentroDaFolha.length).toBeGreaterThan(0);
    expect(dentroDaFolha).not.toContain(claro.color.primaryForeground);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 19/09/2026 · OS QUATRO DEFEITOS DA PRIMEIRA INSTALAÇÃO EM APARELHO
// ═════════════════════════════════════════════════════════════════════════════════════════════
//
// 🔴 **NENHUM DOS QUATRO APARECE NO NAVEGADOR.** É a assinatura que este repositório já paga há
// duas semanas: o que a cascata do CSS resolve de graça, no React Native é conta explícita — e a
// conta que ninguém escreveu só aparece em vidro.

describe("A7 · o `NumberField` entrega o número a cada tecla", () => {
  // 🔴 O DEFEITO GRAVA DADO ERRADO, e é por isso que ele é a prioridade 1 do pedido.
  // O `Screen` tem `keyboardShouldPersistTaps="handled"`, então tocar em "Salvar" com o teclado
  // aberto CHEGA ao botão sem passar pelo blur. O `onPress` lia o valor anterior e regravava o
  // número velho, sem erro e sem aviso.
  // ⚠ **`pop()` e não `find()`, e isso custou uma rodada.** O registro do dublê guarda TODOS os
  // renders, e `find` devolve o PRIMEIRO — cuja closure ainda tem `emEdicao = null`. Chamar o
  // `onBlur` de lá faz o `confirmar` sair na primeira linha, e o teste reprova código certo. O
  // que o aparelho chama é sempre o render atual; o último da lista é ele.
  const ultimo = (id: string) => __instancias("TextInput").filter((p) => p.testID === id).pop();
  const digitarNo = (id: string, texto: string) => {
    act(() => { (ultimo(id)?.onChangeText as ((s: string) => void) | undefined)?.(texto); });
  };

  it("cada tecla emite, e a leitura respeita o separador do locale", () => {
    const vistos: Array<number | null> = [];
    render(
      <Envolve>
        <NumberField locale="pt-BR" onValueChange={(v) => vistos.push(v)} testID="n" />
      </Envolve>);
    digitarNo("n-campo", "1");
    digitarNo("n-campo", "10");
    expect(vistos).toEqual([1, 10]);
  });

  it("\"12,\" em pt-BR é 12, e \"12,5\" é 12.5", () => {
    const vistos: Array<number | null> = [];
    render(
      <Envolve>
        <NumberField locale="pt-BR" onValueChange={(v) => vistos.push(v)} testID="n" />
      </Envolve>);
    digitarNo("n-campo", "12");
    digitarNo("n-campo", "12,");
    digitarNo("n-campo", "12,5");
    expect(vistos).toEqual([12, 12, 12.5]);
  });

  it("apagar tudo emite `null`; texto que ainda não é número não emite nada", () => {
    const vistos: Array<number | null> = [];
    render(
      <Envolve>
        <NumberField locale="pt-BR" onValueChange={(v) => vistos.push(v)} testID="n" />
      </Envolve>);
    digitarNo("n-campo", "7");
    digitarNo("n-campo", "");
    expect(vistos).toEqual([7, null]);
    digitarNo("n-campo", ",");
    digitarNo("n-campo", "-");
    expect(vistos).toEqual([7, null]);
  });

  // ⚠ O caso que decide o desenho: prender durante a digitação escreveria por cima da pessoa.
  it("`min` NÃO prende enquanto se digita, e prende no blur", () => {
    const vistos: Array<number | null> = [];
    render(
      <Envolve>
        <NumberField locale="pt-BR" min={10} onValueChange={(v) => vistos.push(v)} testID="n" />
      </Envolve>);
    digitarNo("n-campo", "1");
    expect(vistos).toEqual([1]);
    act(() => { (ultimo("n-campo")?.onBlur as (() => void) | undefined)?.(); });
    expect(vistos).toEqual([1, 10]);
  });

  // 🔴 O CASO MAIS FÁCIL DE QUEBRAR: o pai devolve o valor a cada tecla, que é o `useState`
  // controlado de todo mundo. Se o eco reescrevesse o texto, "12," viraria "12" com o cursor
  // pulando — e digitar 12,5 ficaria impossível.
  it("o eco do pai não reescreve o que está sendo digitado", () => {
    function Pai() {
      const [v, setV] = React.useState<number | null>(null);
      return <NumberField locale="pt-BR" value={v} onValueChange={setV} testID="n" />;
    }
    render(<Envolve><Pai /></Envolve>);
    digitarNo("n-campo", "12");
    digitarNo("n-campo", "12,");
    expect(ultimo("n-campo")?.value).toBe("12,");
  });
});

describe("A6 · `Switch` sem rótulo não estica", () => {
  it("sem `label` e sem `description`, a raiz é o trilho e mais nada", () => {
    render(<Envolve><Switch checked onChange={() => {}} testID="sw" /></Envolve>);
    const raiz = __instancias("Pressable").find((p) => p.testID === "sw") ?? {};
    const e = StyleSheet.flatten(raiz.style as never) ?? {};
    // sem texto, não há vão entre trilho e nada
    expect((e as {gap?: number}).gap).toBeUndefined();
    // e a coluna de texto com `flex: 1`, que tomava a largura da linha inteira, não existe
    const colunas = __instancias("View")
      .map((p) => StyleSheet.flatten(p.style as never) as {flex?: number} | undefined)
      .filter((x) => x?.flex === 1);
    expect(colunas.length).toBe(0);
  });

  it("COM `label`, continua igual — coluna de texto e vão de 10", () => {
    render(<Envolve><Switch label="Digital" checked onChange={() => {}} testID="sw" /></Envolve>);
    const raiz = __instancias("Pressable").find((p) => p.testID === "sw") ?? {};
    expect((StyleSheet.flatten(raiz.style as never) as {gap?: number}).gap).toBe(10);
    const colunas = __instancias("View")
      .map((p) => StyleSheet.flatten(p.style as never) as {flex?: number} | undefined)
      .filter((x) => x?.flex === 1);
    expect(colunas.length).toBe(1);
  });

  // ⚠ **O MESMO DEFEITO MORA NO `Checkbox` E NO `Radio`, e o pedido do app não sabia disso.**
  // Eles são o mesmo desenho (o comentário do `Switch` diz isso em voz alta) e têm a MESMA coluna
  // vazia com `flex: 1`. Um `Checkbox` sem rótulo dentro de uma linha de `NavList` apagaria o
  // nome igual. Consertado junto, porque corrigir só onde se descobriu é o defeito que a §7 do
  // `NATIVE.md` nomeia — e declarado no relatório, porque é além da letra do A6.
  it("o `Checkbox` sem rótulo também não estica — mesmo desenho, mesmo defeito", () => {
    render(<Envolve><Checkbox checked onChange={() => {}} testID="cb" /></Envolve>);
    const colunas = __instancias("View")
      .map((p) => StyleSheet.flatten(p.style as never) as {flex?: number} | undefined)
      .filter((x) => x?.flex === 1);
    expect(colunas.length).toBe(0);
  });

  // C10, que o pedido do app deixou como "se for feito junto": sem isto o controle sobe MUDO.
  it("o `accessibilityLabel` de fora dá nome sem escrever nada na tela", () => {
    render(
      <Envolve>
        <Switch checked onChange={() => {}} accessibilityLabel="Desbloqueio por digital" testID="sw" />
      </Envolve>);
    const raiz = __instancias("Pressable").find((p) => p.testID === "sw") ?? {};
    expect(raiz.accessibilityLabel).toBe("Desbloqueio por digital");
    expect(__instancias("Text").length).toBe(0);
  });
});

describe("C14 · os filhos do `Grid` preenchem a célula", () => {
  it("todo filho direto ganha `flexGrow: 1`, e as larguras não mudam", () => {
    render(
      <Envolve>
        <Grid minColumnWidth={150}>
          <Card testID="a"><Text>curto</Text></Card>
          <Card testID="b"><Text>bem mais comprido, duas linhas</Text></Card>
        </Grid>
      </Envolve>);
    for (const id of ["a", "b"]) {
      const cartao = __instancias("View").find((p) => p.testID === id) ?? {};
      expect((StyleSheet.flatten(cartao.style as never) as {flexGrow?: number}).flexGrow).toBe(1);
    }
    const celulas = __instancias("View")
      .map((p) => StyleSheet.flatten(p.style as never) as {flexBasis?: number} | undefined)
      .filter((x) => x?.flexBasis === 150);
    expect(celulas.length).toBe(2);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// A5 · a barra de abas flutua de verdade
// ═════════════════════════════════════════════════════════════════════════════════════════════
//
// 🔴 **O INSET AQUI É 48 DE PROPÓSITO, e essa é a diferença entre teste e teatro.** O dublê
// devolve zero por padrão, e com zero `Math.max(4, 0)` e `16 + 0` são indistinguíveis de
// `paddingBottom: 4` — o defeito passaria verde. É exatamente a armadilha que o Lote 5 já pagou
// uma vez, com `Math.max(22, 0)`. Quarenta e oito é o que um Samsung com os três botões entrega.
const BOTOES_DO_ANDROID = 48;
const ITENS_DA_BARRA = [
  {id: "inicio", label: "Início", onPress: () => {}},
  {id: "perfil", label: "Perfil", onPress: () => {}},
];
const barra = () => __instancias("View").find((p) => p.testID === "nav") ?? {};
const estiloDaBarra = () => StyleSheet.flatten(barra().style as never) as {
  paddingBottom?: number; marginBottom?: number; margin?: number; position?: string;
};

describe("A5 · a folga do sistema fica POR FORA da pílula", () => {
  it("`floating`: recheio de baixo igual aos outros lados, e a folga vira margem", () => {
    __definirInsets({bottom: BOTOES_DO_ANDROID});
    render(<Envolve><BottomNav items={ITENS_DA_BARRA} current="inicio" testID="nav" /></Envolve>);
    const e = estiloDaBarra();
    // era `Math.max(space1, 48)` = 48 de recheio DENTRO da pílula: ela crescia para baixo e a
    // barriga ficava atrás dos botões do sistema.
    expect(e.paddingBottom).toBe(claro.size.space1);
    expect(e.paddingBottom).not.toBe(BOTOES_DO_ANDROID);
    // e a borda de baixo fica `space4` acima do topo da área do sistema
    expect(e.marginBottom).toBe(claro.size.space4 + BOTOES_DO_ANDROID);
    __definirInsets({});
  });

  it("`floating`: fica POR CIMA da tela, e o toque em volta passa para baixo", () => {
    render(<Envolve><BottomNav items={ITENS_DA_BARRA} current="inicio" testID="nav" /></Envolve>);
    const e = estiloDaBarra();
    expect(e.position).toBe("absolute");
    // a caixa É a pílula: a margem é o que sobra em volta, e o que sobra não pertence a ela
    expect(e.margin).toBe(claro.size.space4);
  });

  // ⚠ A variante que o pedido manda NÃO mexer.
  it("`edge`: continua no fluxo, com a folga do sistema por DENTRO", () => {
    __definirInsets({bottom: BOTOES_DO_ANDROID});
    render(
      <Envolve>
        <BottomNav variant="edge" items={ITENS_DA_BARRA} current="inicio" testID="nav" />
      </Envolve>);
    const e = estiloDaBarra();
    expect(e.paddingBottom).toBe(BOTOES_DO_ANDROID);
    expect(e.margin).toBe(0);
    expect(e.position).not.toBe("absolute");
    __definirInsets({});
  });
});

describe("A5 · a tela reserva o fim da rolagem sozinha", () => {
  const medirBarra = (altura: number) => {
    const b = __instancias("View").filter((p) => p.testID === "nav").pop();
    act(() => {
      (b?.onLayout as ((e: {nativeEvent: {layout: {height: number}}}) => void) | undefined)?.(
        {nativeEvent: {layout: {height: altura}}});
    });
  };
  // ⚠ `paddingBottom ?? padding`: o respiro do tema é `padding: space4` — um só número para os
  // quatro lados —, então sem a barra NÃO existe `paddingBottom` nenhum para ler. Medir só a
  // chave específica devolveria `undefined` e o teste reprovaria código certo.
  const respiroDoRolador = () => {
    const r = __instancias("ScrollView").pop();
    const e = StyleSheet.flatten(r?.contentContainerStyle as never) as
      {paddingBottom?: number; padding?: number} | undefined;
    return e?.paddingBottom ?? e?.padding;
  };

  it("dentro do provedor, o `Screen scroll` reserva pílula + margens + folga", () => {
    __definirInsets({bottom: BOTOES_DO_ANDROID});
    render(
      <Envolve>
        <BottomNavProvider>
          <Screen scroll><Text>conteúdo</Text></Screen>
          <BottomNav items={ITENS_DA_BARRA} current="inicio" testID="nav" />
        </BottomNavProvider>
      </Envolve>);
    expect(respiroDoRolador()).toBe(claro.size.space4);   // antes de medir: só o respiro do tema
    medirBarra(64);
    const esperado = 64 + claro.size.space4 * 2 + BOTOES_DO_ANDROID;
    // ⚠ SOMA ao respiro do tema, não substitui: escrever por cima colaria o último item na pílula
    expect(respiroDoRolador()).toBe(claro.size.space4 + esperado);
    __definirInsets({});
  });

  it("FORA do provedor, o `Screen` reserva zero — tela cheia não muda em nada", () => {
    render(<Envolve><Screen scroll><Text>conteúdo</Text></Screen></Envolve>);
    expect(respiroDoRolador()).toBe(claro.size.space4);
  });

  it("`edge` conta ZERO: ela fica no fluxo e já encurta a tela sozinha", () => {
    __definirInsets({bottom: BOTOES_DO_ANDROID});
    function Sonda() {
      return <Text testID="espaco">{String(useBottomNavSpace())}</Text>;
    }
    render(
      <Envolve>
        <BottomNavProvider>
          <Sonda />
          <BottomNav variant="edge" items={ITENS_DA_BARRA} current="inicio" testID="nav" />
        </BottomNavProvider>
      </Envolve>);
    medirBarra(64);
    const sonda = __instancias("Text").filter((p) => p.testID === "espaco").pop();
    expect(sonda?.children).toBe("0");
    __definirInsets({});
  });
});
