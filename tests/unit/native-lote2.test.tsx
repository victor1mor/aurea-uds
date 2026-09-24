// Lote 2 do NATIVE.md — o painel de leitura do alvo nativo.
//
// Mesma regra do Lote 1: cada teste é nomeado contra o DEFEITO que ele pega, e foi provado
// injetando esse defeito antes de valer. Teste que só concorda com o presente não é teste.
//
// O que estes testes NÃO fazem continua sendo desenhar. O que eles fazem, e o dublê de
// `react-native` explica no cabeçalho, é ler **o que o componente pediu aos primitivos da
// plataforma** — que altura, que cor, que papel de acessibilidade, e se pediu para animar.
import {render, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {
  StyleSheet, __animacoes, __definirReduceMotion, __instancias, __limpar,
} from "./native-stubs/react-native";

import {
  Alert, AureaProvider, Avatar, Badge, DataState, EmptyState, KPI, Progress, Skeleton, Spinner,
  Status, Text, criarRegistroDeIcones, defaultStrings, formatarContagem, gravidadeDoEstado,
  ptBR, resolverTokens, useAureaStrings, useReduceMotion,
  AUREA_UNIVERSAL_STATES, ICONE_DA_VARIANTE,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");

// Um glifo qualquer: o que se testa aqui não é o desenho do ícone, e sem registro o `Icon`
// avisaria em `__DEV__` a cada montagem, enchendo a saída de ruído que não é achado.
const Glifo = () => null;
const ICONES = criarRegistroDeIcones(Object.fromEntries(
  [...Object.values(ICONE_DA_VARIANTE), "document--blank", "close"].map((n) => [n, Glifo]),
));

const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

const props = (primitivo: string, n = 0) => __instancias(primitivo)[n] ?? {};
const estilo = (primitivo: string, n = 0) => StyleSheet.flatten(props(primitivo, n).style);

// `useReduceMotion` resolve uma Promise no efeito; sem esvaziar a fila de microtarefas o
// componente ainda está no valor inicial quando o teste olha.
const assentar = async () => { await act(async () => { await Promise.resolve(); }); };

describe("Spinner — o anel, e a preferência de movimento", () => {
  // DEFEITO: esquecer de girar. O anel parado parece um anel quebrado.
  //
  // O `await` não é cerimônia: o laço só começa DEPOIS de o sistema responder que pode
  // (`useReduceMotion` é assíncrono, e o `movimento.ts` escreve por que isso é de propósito).
  // Um teste síncrono aqui passaria a impressão de que a animação começa no primeiro render.
  it("inicia a animação depois de o sistema dizer que pode", async () => {
    render(<Envolve><Spinner /></Envolve>);
    await assentar();
    expect(__animacoes()).toHaveLength(1);
  });

  // DEFEITO GRAVE, E SILENCIOSO: na web a regra global de `prefers-reduced-motion` (aurea.css:2128)
  // para toda animação sem o componente saber. No RN não existe cascata, então um componente que
  // não pergunta fica MENOS acessível que a mesma peça na web — e nada acusa.
  it("NÃO anima quando a pessoa pediu menos movimento", async () => {
    __definirReduceMotion(true);
    render(<Envolve><Spinner /></Envolve>);
    await assentar();
    expect(__animacoes()).toHaveLength(0);
  });

  // DEFEITO: um anel sem rótulo é um nó anônimo para quem usa leitor de tela.
  it("tem rótulo e papel quando não é decorativo, e some quando é", () => {
    render(<Envolve><Spinner /></Envolve>);
    expect(props("Animated.View").accessibilityRole).toBe("progressbar");
    expect(props("Animated.View").accessibilityLabel).toBe(defaultStrings.loading);

    render(<Envolve><Spinner decorative /></Envolve>);
    expect(props("Animated.View", 1).accessibilityElementsHidden).toBe(true);
    expect(props("Animated.View", 1).accessibilityRole).toBeUndefined();
  });

  it("cresce com o tamanho pedido, pela escala de ícone do tema", () => {
    render(<Envolve><Spinner size="lg" /></Envolve>);
    expect(estilo("Animated.View").width).toBe(tokens.size.iconLg);
  });
});

describe("Skeleton — a caixa que pulsa", () => {
  // DEFEITO: deixar o esqueleto na árvore de acessibilidade. Uma tela carregando anunciaria
  // "caixa, caixa, caixa" antes de qualquer conteúdo.
  it("é invisível para o leitor de tela", () => {
    render(<Envolve><Skeleton /></Envolve>);
    expect(props("Animated.View").accessibilityElementsHidden).toBe(true);
  });

  it("NÃO anima quando a pessoa pediu menos movimento", async () => {
    __definirReduceMotion(true);
    render(<Envolve><Skeleton /></Envolve>);
    await assentar();
    expect(__animacoes()).toHaveLength(0);
  });

  // DEFEITO: sem altura própria a caixa colapsa em zero e o esqueleto não aparece.
  it("tem altura de uma linha por padrão, e aceita a medida pedida", () => {
    render(<Envolve><Skeleton /></Envolve>);
    expect(estilo("Animated.View").height).toBe(tokens.size.space4);
    render(<Envolve><Skeleton height={80} radius={4} /></Envolve>);
    expect(estilo("Animated.View", 1).height).toBe(80);
    expect(estilo("Animated.View", 1).borderRadius).toBe(4);
  });
});

describe("Progress — a barra determinada", () => {
  // DEFEITO: papel sem valor. O leitor anuncia que existe uma barra e não diz em quanto ela está,
  // que é a única informação que ela carrega.
  it("publica o valor, e grampeia o que sai de 0..100", () => {
    render(<Envolve><Progress value={42} label="Score" /></Envolve>);
    expect(props("View").accessibilityRole).toBe("progressbar");
    expect(props("View").accessibilityValue).toEqual({min: 0, max: 100, now: 42});

    render(<Envolve><Progress value={999} /></Envolve>);
    expect(props("View", 2).accessibilityValue).toEqual({min: 0, max: 100, now: 100});
    render(<Envolve><Progress value={-5} /></Envolve>);
    expect(props("View", 4).accessibilityValue).toEqual({min: 0, max: 100, now: 0});
  });

  it("o preenchimento é a porcentagem do trilho", () => {
    render(<Envolve><Progress value={30} /></Envolve>);
    expect(estilo("View", 1).width).toBe("30%");
  });
});

describe("Alert — o aviso em linha", () => {
  // DEFEITO: tudo `role=alert`. `alert` INTERROMPE o leitor de tela; a informação que espera a vez
  // não deve interromper — um aviso informativo que interrompe ensina a pessoa a ignorar avisos.
  //
  // 🔴 **ESTE TESTE EXIGIA O DEFEITO, e é a razão de ele ter chegado ao aparelho.** Ele dizia
  // `expect(...accessibilityRole).toBe("status")` — e `status` **não é um papel do React Native**.
  // O app do Victor caiu com `Invalid accessibility role value: status` em 09/09/2026, e o teste
  // estava verde o tempo todo, porque o dublê aceita qualquer string. **O teste não provava o RN:
  // provava a minha ideia do RN**, escrita por mim nos dois arquivos.
  //
  // O que ficou: `danger` é `alert`, que existe entre os 40 papéis. O resto **não passa papel** —
  // e quem faz o TalkBack falar no Android é a REGIÃO VIVA, que é o que este teste passa a cobrar.
  // O `check 41` do `validate.py` é o controle que pega a regressão contra a lista real.
  // ⚠ **ESTES DOIS ACHAVAM O `View` PELA POSIÇÃO, e isso os quebrou em 17/09/2026** — o conserto
  // do aninhamento (check 43) acrescentou UM `View` ao `Alert` e os índices andaram. O defeito
  // não era do conserto: era de um teste que dizia "o quarto `View`" quando queria dizer "a
  // moldura". **Achar pelo SIGNIFICADO não quebra quando a árvore muda, e é o que o teste
  // sempre quis dizer.** Reescritos, e os dois continuam reprovando o defeito original.
  const moldura = () => __instancias("View").filter((p) => p.accessibilityLiveRegion != null).at(-1) ?? {};
  const grupo = () => __instancias("View").filter((p) => p.accessible === true).at(-1) ?? {};

  it("só o danger interrompe; o resto espera a vez — e sem papel inválido", () => {
    render(<Envolve><Alert variant="danger">falhou</Alert></Envolve>);
    expect(grupo().accessibilityRole).toBe("alert");
    expect(moldura().accessibilityLiveRegion).toBe("assertive");

    render(<Envolve><Alert variant="info">oi</Alert></Envolve>);
    expect(grupo().accessibilityRole).toBeUndefined();
    expect(moldura().accessibilityLiveRegion).toBe("polite");
  });

  // DEFEITO: tratar os sete estados como um só. `waiting_*` é o sistema funcionando e avisando;
  // o resto é problema. Pintar tudo de amarelo apaga a diferença.
  it("o estado universal escolhe a variante e escreve a frase", () => {
    render(<Envolve><Alert state="waiting_approval" /></Envolve>);
    expect(gravidadeDoEstado("waiting_approval")).toBe("info");
    expect(StyleSheet.flatten(moldura().style).backgroundColor).toBe(tokens.color.infoBg);
    expect(props("Text", 0).children).toBe(defaultStrings.universalState.waiting_approval);

    render(<Envolve><Alert state="stale" /></Envolve>);
    expect(gravidadeDoEstado("stale")).toBe("warning");
    expect(StyleSheet.flatten(moldura().style).backgroundColor).toBe(tokens.color.warningBg);
  });

  it("as frases saem do provider, não do módulo", () => {
    render(<AureaProvider icons={ICONES} strings={ptBR}><Alert state="offline" /></AureaProvider>);
    expect(props("Text", 0).children).toBe(ptBR.universalState.offline);
  });
});

describe("EmptyState — o nada, dito com jeito", () => {
  it("sem descrição, o estado universal escreve a frase", () => {
    render(<Envolve><EmptyState title="Sem lançamentos" state="partial" /></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("Sem lançamentos");
    expect(textos).toContain(defaultStrings.universalState.partial);
  });
});

describe("DataState — a região que troca de cara", () => {
  it("loading mostra esqueleto e marca a região como ocupada", () => {
    render(<Envolve><DataState state="loading">{"conteúdo"}</DataState></Envolve>);
    expect(props("View").accessibilityState).toEqual({busy: true});
    expect(__instancias("Animated.View").length).toBeGreaterThan(0);
  });

  it("error vira alerta danger com a frase do provider", () => {
    render(<Envolve><DataState state="error">{"conteúdo"}</DataState></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain(defaultStrings.dataError);
  });

  // DEFEITO, E É O MAIS CARO DESTE ARQUIVO: esconder o dado num estado universal. `stale`,
  // `partial` e `offline` querem dizer que o dado ESTÁ AÍ e tem ressalva — trocá-lo por um aviso
  // é trocar informação parcial por informação nenhuma. Só loading/error/empty tomam o lugar.
  it("o estado universal ACOMPANHA o conteúdo, não o substitui", () => {
    // `<Text>` e não uma string solta: no RN de verdade um texto cru dentro de `View` LEVANTA.
    // Escrever o teste com o uso inválido esconderia isso.
    render(<Envolve><DataState state="stale"><Text>o número</Text></DataState></Envolve>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("o número");
    expect(textos).toContain(defaultStrings.universalState.stale);
  });

  // DEFEITO: chamar a função de conteúdo mesmo quando ele não vai aparecer. A prop existe
  // justamente para o conteúdo caro não ser construído atrás de um esqueleto.
  it("children como FUNÇÃO não é chamada enquanto o estado esconde o conteúdo", () => {
    const caro = vi.fn(() => "o número");
    render(<Envolve><DataState state="loading">{caro}</DataState></Envolve>);
    expect(caro).not.toHaveBeenCalled();
    render(<Envolve><DataState>{caro}</DataState></Envolve>);
    expect(caro).toHaveBeenCalled();
  });
});

describe("Badge — a pílula pequena", () => {
  it("acima do máximo vira 99+", () => {
    expect(formatarContagem(5)).toBe("5");
    expect(formatarContagem(120)).toBe("99+");
    expect(formatarContagem(120, 9)).toBe("9+");
  });

  // DEFEITO: um "0" permanente no canto do sino. Caixa zerada não merece enfeite.
  it("ancorado, some em zero — e volta com showZero", () => {
    render(<Envolve><Badge count={0} anchor="top-end"><Skeleton /></Badge></Envolve>);
    expect(__instancias("Text")).toHaveLength(0);
    render(<Envolve><Badge count={0} anchor="top-end" showZero><Skeleton /></Badge></Envolve>);
    expect(__instancias("Text").map((p) => p.children)).toContain("0");
  });

  // DEFEITO: deixar o número na árvore de acessibilidade. O leitor anuncia "sino, 8" e ninguém
  // sabe o que é o 8 — quem carrega a informação é o rótulo de QUEM foi decorado.
  it("ancorado, o selo é decorativo para o leitor de tela", () => {
    render(<Envolve><Badge count={8} anchor="top-end"><Skeleton /></Badge></Envolve>);
    const selo = __instancias("View").find((p) => p.accessibilityElementsHidden === true);
    expect(selo).toBeDefined();
  });

  it("o tom pinta pelo token, e solid inverte o texto", () => {
    render(<Envolve><Badge tone="danger">3</Badge></Envolve>);
    expect(estilo("View").backgroundColor).toBe(tokens.color.dangerBg);
    render(<Envolve><Badge tone="danger" emphasis="solid">3</Badge></Envolve>);
    expect(estilo("View", 1).backgroundColor).toBe(tokens.color.danger400);
  });
});

describe("Status — o ponto e a palavra", () => {
  // DEFEITO: fazer `offline` ser só outra cor. Quem não distingue as duas cores perde a diferença
  // entre "está fora" e "está bem" — no CSS ele é VAZADO, não pintado.
  it("offline é ponto vazado, não só outra cor", () => {
    render(<Envolve><Status variant="offline">Fora</Status></Envolve>);
    const ponto = estilo("View", 1);
    expect(ponto.backgroundColor).toBe("transparent");
    expect(ponto.borderWidth).toBe(2);

    render(<Envolve><Status variant="online">Ativo</Status></Envolve>);
    expect(estilo("View", 3).backgroundColor).toBe(tokens.color.success);
  });

  it("o estado universal escolhe a variante e escreve a frase", () => {
    render(<Envolve><Status state="degraded" /></Envolve>);
    expect(props("Text", 0).children).toBe(defaultStrings.universalState.degraded);
    expect(AUREA_UNIVERSAL_STATES).toContain("degraded");
  });
});

describe("Avatar — o retrato redondo", () => {
  // DEFEITO: URL quebrada deixando um buraco cinza permanente. E o outro lado do mesmo defeito:
  // nunca mais tentar depois de uma falha, mesmo com imagem nova.
  it("cai para o fallback quando a imagem falha, e tenta de novo com source nova", () => {
    const {rerender} = render(<Envolve><Avatar source="http://x/a.png" fallback="VM" /></Envolve>);
    expect(__instancias("Image")).toHaveLength(1);

    act(() => { (props("Image").onError as () => void)(); });
    expect(__instancias("Text").map((p) => p.children)).toContain("VM");

    rerender(<Envolve><Avatar source="http://x/b.png" fallback="VM" /></Envolve>);
    expect(__instancias("Image").length).toBeGreaterThan(1);
  });

  it("o lado sai da altura de controle do tema", () => {
    render(<Envolve><Avatar fallback="A" size="lg" /></Envolve>);
    expect(estilo("View").width).toBe(tokens.size.controlHLg);
  });
});

describe("KPI — o número com nome", () => {
  // DEFEITO: ler só o CSS. O `.kpi` é uma coluna com gap; o fonte da web mostra que ele é um
  // `<Card>`. Sem o cartão a peça perde superfície, borda e o raio 22 da identidade.
  it("é um Card, com o raio da identidade", () => {
    render(<Envolve><KPI label="Custo" value="R$ 1,20" /></Envolve>);
    expect(estilo("View").borderRadius).toBe(tokens.size.radiusCard);
    expect(estilo("View").backgroundColor).toBe(tokens.color.card);
  });

  // DEFEITO: três textos soltos. O RN não tem `role="group"`, e `accessible` é o que agrupa.
  it("é UM elemento de acessibilidade, não três", () => {
    render(<Envolve><KPI label="Custo" value="R$ 1,20" trend="+3%" /></Envolve>);
    expect(props("View").accessible).toBe(true);
    expect(props("View").accessibilityRole).toBeUndefined();
  });
});

describe("useReduceMotion e as strings — a superfície pública do lote", () => {
  it("useReduceMotion responde ao sistema", async () => {
    const visto: boolean[] = [];
    const Sonda = () => { visto.push(useReduceMotion()); return null; };
    __definirReduceMotion(true);
    render(<Envolve><Sonda /></Envolve>);
    await assentar();
    expect(visto.at(-1)).toBe(true);
  });

  it("useAureaStrings devolve o que o provider recebeu", () => {
    const visto: string[] = [];
    const Sonda = () => { visto.push(useAureaStrings().dataEmpty); return null; };
    render(<AureaProvider strings={ptBR}><Sonda /></AureaProvider>);
    expect(visto.at(-1)).toBe(ptBR.dataEmpty);
  });
});

// 🔴 A TABELA DE FRASES SAI EM PORTUGUÊS DE VERDADE — 10/09/2026, e este teste existe porque o
// que já havia NÃO provava isso. O teste do `Alert state="offline"` (acima) compara o texto
// renderizado com `ptBR.universalState.offline` — o MESMO objeto que ele acabou de passar ao
// provider. Se o `ptBR` fosse igual ao `defaultStrings` por acidente (uma cópia mal feita, um
// merge, um `export const ptBR = defaultStrings`), ele passaria VERDE e a tela sairia em inglês.
// É a forma exata que este projeto cobra caro: *teste que só concorda com o presente não é teste.*
//
// ⚠ E o defeito que motivou isto foi visto EM FOTO, no aparelho, em 09/09/2026:
// `"Waiting for approval."` e `"This may be out of date."` no meio de uma tela em português. A
// biblioteca estava certa — o app de smoke é que não passava `strings`. Mas o consumidor tem o
// mesmo risco, e o gate é aqui.
//
// PROVADO CONTRA O DEFEITO, nas duas direções que importam:
//   `export const ptBR = defaultStrings`      -> 3 testes reprovam
//   `<AureaProvider>` sem a prop `strings`    -> 1 teste reprova
describe("as frases: o ptBR é português, e é DIFERENTE do inglês", () => {
  // Literais, de propósito. Comparar com a própria tabela é o defeito que este teste fecha.
  const ESPERADO: Record<string, string> = {
    waiting_user: "Esperando alguém agir.",
    waiting_approval: "Esperando aprovação.",
    waiting_dependency: "Esperando outra coisa terminar.",
    offline: "Sem conexão. Isto foi carregado antes.",
    stale: "Isto pode estar desatualizado.",
    partial: "Parte disto não pôde ser carregada.",
    degraded: "Funcionando com capacidade reduzida.",
  };

  it("as SETE chaves de estado universal existem, em português, e nenhuma repete o inglês", () => {
    // As sete, não "as que eu lembrei": a lista vem do próprio pacote.
    expect(Object.keys(ESPERADO).sort()).toEqual([...AUREA_UNIVERSAL_STATES].sort());
    for (const [chave, frase] of Object.entries(ESPERADO)) {
      const k = chave as keyof typeof ptBR.universalState;
      expect(ptBR.universalState[k]).toBe(frase);
      expect(ptBR.universalState[k]).not.toBe(defaultStrings.universalState[k]);
    }
  });

  // ⚠ `__limpar()` antes de cada montagem: o registro do dublê é COMPARTILHADO, e sem limpar um
  // caso enxergaria os `Text` do anterior — passaria por contaminação, não por acerto. É a mesma
  // armadilha de "gate que só concorda com o presente", um andar abaixo.
  it("o `Alert` RENDERIZA a frase portuguesa — `stale`, uma das duas vistas em inglês", () => {
    __limpar();
    render(<AureaProvider icons={ICONES} strings={ptBR}><Alert state="stale" /></AureaProvider>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain(ESPERADO.stale);
    expect(textos).not.toContain(defaultStrings.universalState.stale);
  });

  it("o `Status` RENDERIZA a frase portuguesa — `waiting_approval`, a outra", () => {
    __limpar();
    render(
      <AureaProvider icons={ICONES} strings={ptBR}><Status state="waiting_approval" /></AureaProvider>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain(ESPERADO.waiting_approval);
    expect(textos).not.toContain(defaultStrings.universalState.waiting_approval);
  });

  it("SEM `strings` a biblioteca cai no inglês — e isso é o comportamento CERTO", () => {
    __limpar();
    render(<AureaProvider icons={ICONES}><Alert state="stale" /></AureaProvider>);
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain("This may be out of date.");
    expect(textos).not.toContain(ESPERADO.stale);
  });
});
