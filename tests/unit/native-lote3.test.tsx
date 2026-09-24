// Lote 3 do NATIVE.md — a moldura de navegação do alvo nativo.
//
// Mesma regra dos dois lotes anteriores: cada teste nomeia o DEFEITO que pega, e foi provado
// injetando esse defeito antes de valer.
//
// ⚠ **O tema deste arquivo é acessibilidade traduzida, e é o que ele mais protege.** A web
// navega com `<nav>`, `<a>` e `aria-current`; o RN não tem nenhum dos três. Cada tradução aqui é
// uma escolha que pode ser feita errada de um jeito que ninguém vê — e a mais fácil de errar é a
// que a ficha da web proíbe em voz alta: dar `tablist` a uma barra que troca de TELA.
import {render, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {__definirInsets} from "./native-stubs/react-native-safe-area-context";

import {
  AureaProvider, BottomNav, NavList, Screen, Stepper, Text, Topbar,
  criarRegistroDeIcones, defaultStrings, ptBR, resolverTokens,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({
  "dashboard": Glifo, "notification": Glifo, "chevron--right": Glifo,
  "checkmark": Glifo, "error": Glifo,
});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

const props = (primitivo: string, n = 0) => __instancias(primitivo)[n] ?? {};
const estilo = (primitivo: string, n = 0) => StyleSheet.flatten(props(primitivo, n).style);

const ABAS = [
  {id: "painel", label: "Painel", icon: "dashboard"},
  {id: "avisos", label: "Avisos", icon: "notification", badge: 8},
];

describe("BottomNav — a pele da navegação, não a navegação", () => {
  // DEFEITO QUE A FICHA DA WEB PROÍBE EM VOZ ALTA: dar papel de aba a uma barra que troca de TELA.
  // "A tab swaps a panel inside the page, a bottom bar changes page. Giving role=tablist to a menu
  // makes the screen reader promise arrow keys that lead nowhere." O RN TEM `tab` e `tablist`, e
  // é justamente por isso que este teste existe: o erro está a uma palavra de distância.
  it("os itens são `link`, NUNCA `tab`", () => {
    render(<Envolve><BottomNav items={ABAS} current="painel" /></Envolve>);
    const papeis = __instancias("Pressable").map((p) => p.accessibilityRole);
    expect(papeis).toEqual(["link", "link"]);
    expect(papeis).not.toContain("tab");
    expect(__instancias("View").map((p) => p.accessibilityRole)).not.toContain("tablist");
  });

  // DEFEITO: o item corrente sem marca na árvore de acessibilidade. Visualmente ele muda de cor;
  // para quem usa leitor de tela, nada muda — e a cor é justamente o que essa pessoa não recebe.
  it("o item corrente é `selected` para o leitor de tela", () => {
    render(<Envolve><BottomNav items={ABAS} current="avisos" /></Envolve>);
    expect(props("Pressable", 0).accessibilityState.selected).toBe(false);
    expect(props("Pressable", 1).accessibilityState.selected).toBe(true);
  });

  // DEFEITO REAL, e a web o carrega no CSS: sem o respiro da barra de gestos, a última linha de
  // rótulo fica EMBAIXO dela. E o outro lado do mesmo defeito é SOMAR em vez de tomar o máximo:
  // aí sobra espaço demais no aparelho que tem a barra.
  //
  // 🔴 **ESTE TESTE MUDOU EM 19/09/2026, e a mudança é do comportamento, não dele.** Ele cobrava
  // `paddingBottom = max(space1, inset)` nas DUAS variantes. Medido em aparelho, isso é o defeito
  // A5: no `floating` os ≈48 pontos da faixa dos três botões do Android viravam recheio DENTRO da
  // pílula, ela crescia para baixo e a barriga ficava atrás dos botões. A regra do máximo
  // continua valendo — **só que no `edge`**, que é quem encosta na borda. O teste ficou com as
  // duas metades em vez de perder a que continua verdadeira.
  it("`edge` respeita a barra de gestos pelo MÁXIMO, e não pela soma", () => {
    __definirInsets({bottom: 34});
    render(<Envolve><BottomNav variant="edge" items={ABAS} /></Envolve>);
    const comBarra = __instancias("View").map((p) => StyleSheet.flatten(p.style).paddingBottom);
    expect(comBarra).toContain(34);
    expect(comBarra).not.toContain(34 + tokens.size.space1);
    __definirInsets({});
  });

  it("`floating` põe a folga do sistema POR FORA, e o recheio fica igual aos outros lados", () => {
    render(<Envolve><BottomNav items={ABAS} /></Envolve>);
    expect(estilo("View").paddingBottom).toBe(tokens.size.space1);

    __definirInsets({bottom: 34});
    render(<Envolve><BottomNav items={ABAS} /></Envolve>);
    const barras = __instancias("View").map((p) => StyleSheet.flatten(p.style));
    // o recheio NÃO cresce com o inset — era isso que empurrava a pílula para trás dos botões
    expect(barras.map((e) => e.paddingBottom)).not.toContain(34);
    // ele vira margem, e a borda de baixo fica `space4` acima da área do sistema
    expect(barras.map((e) => e.marginBottom)).toContain(tokens.size.space4 + 34);
    __definirInsets({});
  });

  // DEFEITO: o contador pendurado no ITEM em vez do ÍCONE. O Victor viu isso em tela em
  // 17/08/2026 — o número cobriu o nome inteiro. A caixa `marca` existe para dar a ele um canto.
  it("o contador pendura na caixa do ÍCONE, não no item", () => {
    render(<Envolve><BottomNav items={ABAS} current="painel" /></Envolve>);
    // ⚠ A PRÓPRIA BARRA é absoluta desde 19/09/2026 (ela flutua por cima da tela), então o filtro
    // passou a excluí-la pelo que só ela tem: `bottom: 0`. Sem isso o teste conta duas e reprova
    // código certo — e contar "quantos absolutos existem" nunca foi o ponto dele: o ponto é que o
    // contador pendura pelo CANTO DE CIMA da caixa do ícone.
    const absolutos = __instancias("View")
      .map((p) => StyleSheet.flatten(p.style))
      .filter((e) => e.position === "absolute" && e.bottom !== 0);
    expect(absolutos).toHaveLength(1);
    expect(absolutos[0].top).toBe(-tokens.size.space05);
  });

  it("a barra tem nome, e ele sai do provider", () => {
    render(<Envolve><BottomNav items={ABAS} /></Envolve>);
    expect(props("View").accessibilityLabel).toBe(defaultStrings.bottomNavLabel);
    render(<AureaProvider icons={ICONES} strings={ptBR}><BottomNav items={ABAS} /></AureaProvider>);
    const nomes = __instancias("View").map((p) => p.accessibilityLabel);
    expect(nomes).toContain(ptBR.bottomNavLabel);
  });

  // DEFEITO: traduzir `color-mix(in srgb, primary 12%, transparent)` por um token qualquer que
  // "parece próximo". O RN não tem `color-mix`; o que ele tem é hex de OITO dígitos.
  it("o indicador usa o primary com alfa, não outro token", () => {
    render(<Envolve><BottomNav items={ABAS} current="painel" indicator="pill" /></Envolve>);
    const fundos = __instancias("Pressable").map((p) => StyleSheet.flatten(p.style).backgroundColor);
    // 12% de 255 = 31 = 0x1f
    expect(fundos).toContain(`${tokens.color.primary}1f`);
  });
});

describe("Topbar — a barra de cima", () => {
  // DEFEITO: inventar um papel porque a web tem um. `banner` é landmark do HTML e NÃO existe no
  // RN; declarar `header` (que no RN quer dizer "título") diria uma coisa errada.
  it("não inventa papel: `banner` não existe no RN", () => {
    render(<Envolve><Topbar brand={<Text>Aurea</Text>} /></Envolve>);
    expect(props("View").accessibilityRole).toBeUndefined();
  });

  it("as três variantes mudam a pele", () => {
    render(<Envolve><Topbar variant="floating" /></Envolve>);
    expect(estilo("View").borderRadius).toBe(tokens.size.radiusCard);
    render(<Envolve><Topbar variant="pill" /></Envolve>);
    expect(estilo("View", 1).borderRadius).toBe(tokens.size.radiusControl);
  });
});

describe("NavList — a lista de destinos DENTRO da página", () => {
  // ⚠ **OS DOIS GANHARAM `onPress` EM 17/09/2026, e a razão não é enfeite.** O `NavList` passou
  // a só declarar `accessibilityRole="link"` quando a linha REALMENTE abre alguma coisa (pedido
  // do consumidor: uma lista só de leitura anunciava cada linha como link que não vai a lugar
  // nenhum). Sem `onPress` não há mais `Pressable`, e o teste de baixo contava `Pressable`.
  // **O que ele quer provar continua inteiro** — linha indisponível segue na árvore de
  // acessibilidade —; o que estava errado era medir a IMPLEMENTAÇÃO em vez da promessa. E uma
  // lista de destinos em que nada abre nada nunca foi o caso real.
  // O caso SEM `onPress` tem teste próprio, em `native-pedidos-do-app.test.tsx`.
  const ITENS = [
    {id: "conta", label: "Conta", description: "nome e e-mail", icon: "dashboard",
     onPress: () => {}},
    {id: "sair", label: "Sair", disabled: true, onPress: () => {}},
  ];

  // `list` é um dos poucos papéis da web que atravessa inteiro — ao contrário de `navigation` e
  // `banner`. DEFEITO: deixar sem papel por analogia com os outros dois.
  it("é uma `list`, e isso atravessa da web", () => {
    render(<Envolve><NavList items={ITENS} /></Envolve>);
    expect(props("View").accessibilityRole).toBe("list");
  });

  // DEFEITO: sumir com a linha indisponível da árvore de acessibilidade. Quem usa leitor de tela
  // precisa DESCOBRIR que ela existe — é a diferença entre "não posso" e "não há".
  it("linha indisponível continua alcançável pelo leitor de tela", () => {
    render(<Envolve><NavList items={ITENS} /></Envolve>);
    expect(__instancias("Pressable")).toHaveLength(2);
    expect(props("Pressable", 1).accessibilityState.disabled).toBe(true);
  });

  // A ficha da web escreve isto: aqui NÃO há item corrente, porque não há o que estar "atual"
  // numa lista em que se entra e da qual se volta. DEFEITO: copiar `current` do `BottomNav`.
  it("não tem item corrente, e isso é decisão", () => {
    render(<Envolve><NavList items={ITENS} /></Envolve>);
    const selecionados = __instancias("Pressable")
      .map((p) => p.accessibilityState?.selected)
      .filter((v) => v === true);
    expect(selecionados).toHaveLength(0);
  });
});

describe("Stepper — a trilha de passos", () => {
  const PASSOS = [
    {label: "Conta", state: "done" as const},
    {label: "Veículo", state: "active" as const},
    {label: "Pronto", optional: "opcional"},
  ];

  it("é uma `list` com nome, e o nome sai do provider", () => {
    render(<Envolve><Stepper items={PASSOS} /></Envolve>);
    expect(props("View").accessibilityRole).toBe("list");
    expect(props("View").accessibilityLabel).toBe(defaultStrings.stepperLabel);
  });

  // DEFEITO: o passo ativo sem marca na árvore. `aria-current="step"` não tem par no RN, e o
  // mais próximo é `selected` — o que não se pode é deixar sem nada.
  it("o passo ativo é `selected`", () => {
    render(<Envolve><Stepper items={PASSOS} /></Envolve>);
    const selecionados = __instancias("View")
      .map((p) => p.accessibilityState?.selected)
      .filter((v) => v === true);
    expect(selecionados).toHaveLength(1);
  });

  // DEFEITO: mostrar o número em cima do visto. `done` e `error` trocam o número por glifo.
  it("passo sem estado mostra o NÚMERO, e ele começa em 1", () => {
    render(<Envolve><Stepper items={PASSOS} doneIcon={false} errorIcon={false} /></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain(1);
    expect(textos).toContain(3);
  });

  it("passo com onPress vira botão; sem, não é tocável", () => {
    const tocar = vi.fn();
    render(<Envolve><Stepper items={[{label: "A", onPress: tocar}, {label: "B"}]} /></Envolve>);
    expect(__instancias("Pressable")).toHaveLength(1);
    act(() => { (props("Pressable").onPress as () => void)(); });
    expect(tocar).toHaveBeenCalled();
  });
});

describe("Screen — puxar para atualizar (Lote 3)", () => {
  // DEFEITO: aceitar `onRefresh` e não ligar nada. A prop existiria, a tela não puxaria, e nada
  // acusaria — o consumidor descobriria no aparelho.
  //
  // ⚠ E o teste olha a PROP, não uma instância renderizada — porque é assim que o RN funciona:
  // `refreshControl` é um ELEMENTO passado por prop, e quem o desenha é o `ScrollView` por
  // dentro. Procurar `__instancias("RefreshControl")` aqui daria zero e diria a coisa errada
  // sobre o código (foi o que este teste fez na primeira versão).
  it("com scroll e onRefresh, o RefreshControl chega ao ScrollView", () => {
    const atualizar = vi.fn();
    render(<Envolve><Screen scroll onRefresh={atualizar} refreshing><Text>oi</Text></Screen></Envolve>);
    const controle = props("ScrollView").refreshControl as React.ReactElement<{
      refreshing: boolean; onRefresh: () => void; tintColor: string;
    }>;
    expect(controle).toBeDefined();
    expect(controle.props.refreshing).toBe(true);
    expect(controle.props.tintColor).toBe(tokens.color.primary);
    act(() => { controle.props.onRefresh(); });
    expect(atualizar).toHaveBeenCalled();
  });

  // DEFEITO: pendurar o controle mesmo sem `onRefresh`. Aí a tela mostra a rosca do sistema e não
  // atualiza nada — pior que não ter o gesto.
  it("sem onRefresh, não há RefreshControl nenhum", () => {
    render(<Envolve><Screen scroll><Text>oi</Text></Screen></Envolve>);
    expect(__instancias("RefreshControl")).toHaveLength(0);
    expect(props("ScrollView").refreshControl).toBeUndefined();
  });
});
