// Aurea nativo — `Screen`, a casca de uma tela.
//
// **NÃO TEM PAR NA WEB, e a razão é a plataforma.** Lá o `<body>` já é a tela: o navegador
// desenha a barra de status, o browser resolve o entalhe, e a única regra da Aurea é
// `body { background: var(--background) }` (medido no `packages/core/src/aurea.css`). No React
// Native não há `<body>`: a raiz de cada tela é um `View` que alguém precisa mandar preencher,
// pintar e afastar do entalhe.
//
// ── A DEPENDÊNCIA, E POR QUE ELA EXISTE ──────────────────────────────────────────────────────
// Este é o único componente do Lote 1 que precisou de dependência nova, e por isso ele parou o
// lote e voltou para o Victor (`BUILDING.md` §3). Ele autorizou o peer em 03/09/2026.
//
// O que foi medido antes de pedir:
//   • o `SafeAreaView` do PRÓPRIO React Native está **deprecado** desde a 0.81 — e nunca fez nada
//     no Android, onde ele é literalmente um `View`;
//   • o substituto de fato é `react-native-safe-area-context` (**MIT**), que é o que o
//     `react-navigation` e o `expo-router` já arrastam. Adotá-lo como peer não adiciona peso ao
//     app: declara o que já ia estar lá;
//   • ele é **módulo nativo** (`android/`, `ios/`, `common/cpp/` no tarball) — vem embutido no
//     Expo Go, então o caminho de smoke test continua valendo.
//
// ── POR QUE `SafeAreaView` E NÃO `useSafeAreaInsets` ─────────────────────────────────────────
// A biblioteca oferece os dois. O hook devolve números e deixa você somar; o componente resolve
// no lado NATIVO. Escolhi o componente, e a razão saiu da leitura do fonte C++
// (`RNCSafeAreaViewShadowNode.cpp`, versão 5.9.1), não de preferência:
//
//     getEdgeValue: "off" -> só o seu padding
//                   "maximum" -> max(inset, padding)
//                   qualquer outro (o padrão é "additive") -> inset + padding
//
// Ou seja: o inset **SOMA** ao padding que a folha da Aurea já pôs, no cálculo de layout do Yoga,
// antes do primeiro frame. Com o hook, o padding sairia de um `useState` que só tem valor DEPOIS
// que o nativo avisa — um quadro com o conteúdo embaixo do entalhe, e um re-render a cada
// rotação. O componente não tem esse quadro.
//
// ⚠ Um limite que o mesmo fonte declara e que herdamos: **padding em porcentagem não é
// suportado** na soma. Os tokens da Aurea são todos numéricos (dp), então isto não morde aqui —
// mas morde quem passar `padding: "5%"` no `style`.
import * as React from "react";
import {Keyboard, RefreshControl, ScrollView, View, type ViewProps} from "react-native";
import {SafeAreaInsetsContext, SafeAreaView, initialWindowMetrics} from "react-native-safe-area-context";
import {useBottomNavSpace} from "./barranav.js";
import {criarFolha} from "./estilos.js";
import {useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  raiz: {flex: 1},
  // Três superfícies e não a lista inteira de tokens: uma tela é fundo de página, painel ou
  // painel elevado. `surfaceInset` e `card` são de componente, não de tela.
  fundo_background: {backgroundColor: t.color.background},
  fundo_surface1: {backgroundColor: t.color.surface1},
  fundo_surface2: {backgroundColor: t.color.surface2},
  // `--space-4` é a mesma medida que o `Stack` usa entre filhos: a margem da tela e o ritmo do
  // conteúdo passam a ser o mesmo número, que é o que faz a página parecer alinhada.
  respiro: {padding: t.size.space4},
  // Sem isto, conteúdo curto não ocupa a altura e nada consegue se centralizar na tela.
  conteudo: {flexGrow: 1},
  // O rodapé fixo (R-06): o mesmo `respiro`, e só o de cima quando a raiz já recua. O
  // `marginTop: "auto"` é o que o cola no pé quando a tela não rola e o conteúdo é curto; com
  // `scroll` ele não muda nada, porque o rolador já ocupa o resto.
  rodape: {marginTop: "auto", padding: t.size.space4},
  rodapeNoRespiro: {marginTop: "auto", paddingTop: t.size.space4},
}));

export type AureaScreenEdge = "top" | "right" | "bottom" | "left";
export type AureaScreenBackground = "background" | "surface1" | "surface2";

/**
 * As quatro. **Não é excesso de zelo:** em paisagem o entalhe fica à ESQUERDA ou à DIREITA, e a
 * barra de gestos do Android mora embaixo. Uma tela que só protege o topo quebra ao girar.
 */
const TODAS_AS_BORDAS = ["top", "right", "bottom", "left"] as const;

export interface ScreenProps extends ViewProps {
  /**
   * Que bordas recebem o inset do sistema. Padrão: as quatro.
   *
   * A forma de lista é a que a Aurea documenta, e ela vira `additive` em cada borda citada e
   * `off` nas outras — medido no `SafeAreaView.js` da 5.9.1. Quem precisar de `maximum` (usar o
   * MAIOR entre inset e padding, em vez da soma) usa o `SafeAreaView` da biblioteca direto: a
   * Aurea não reembrulha a API de terceiro para dar dois nomes à mesma coisa.
   */
  edges?: readonly AureaScreenEdge[];
  /** Padding de `--space-4` no conteúdo. Passe `false` para lista de borda a borda. */
  padded?: boolean;
  /** Envolve o conteúdo num `ScrollView`. */
  scroll?: boolean;
  /** Qual superfície a tela é. Padrão `background`, que é o `body` da web. */
  background?: AureaScreenBackground;
  /**
   * **Puxar para atualizar** — o Lote 3, e o plano do consumidor pede na lista E no painel.
   *
   * Só tem efeito com `scroll`: não há o que puxar numa tela que não rola. Chamado quando a
   * pessoa arrasta o topo para baixo; `refreshing` é quem desenha e some com o indicador, e é
   * do app — o componente não adivinha quando a busca terminou.
   *
   * ⚠ **Não é dependência nova.** O `RefreshControl` é do próprio React Native.
   */
  onRefresh?: () => void;
  refreshing?: boolean;
  /**
   * **O rodapé fixo** — R-06, 24/09/2026. Fica FORA da rolagem, colado embaixo, e respeita a
   * área do sistema sozinho:
   *
   * ```tsx
   * <Screen scroll footer={<Button fullWidth>Assinar</Button>}>…</Screen>
   * ```
   *
   * A borda de baixo dele fica `space4` acima do topo da área do sistema, a mesma conta do
   * `BottomNav` flutuante. Dentro de um `BottomNavProvider`, ele sobe acima da barra de abas.
   *
   * ⚠ **Sem gancho de inset, de propósito.** A `Screen` não exige `SafeAreaProvider` acima, e
   * `useSafeAreaInsets` exige. Quando a tela não pega a borda de baixo (`edges` sem `"bottom"`), o
   * rodapé ganha a própria `SafeAreaView` só nessa borda — a mesma peça nativa que a raiz já usa.
   */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * A casca de uma tela: preenche, pinta com o tema, e afasta do entalhe e da barra de gestos.
 *
 * ```tsx
 * <Screen scroll>
 *   <Text size="xl" weight={600}>Painel</Text>
 *   <Card>…</Card>
 * </Screen>
 * ```
 *
 * ⚠ **`scroll` muda ONDE o padding cai, e a diferença é visível.** Sem ele, o padding é da raiz.
 * Com ele, o padding vai para o `contentContainerStyle` — que é o certo, porque padding no
 * `ScrollView` em si recorta a área rolável e deixa a barra de rolagem para dentro.
 *
 * ⚠ **Não precisa de `SafeAreaProvider` acima.** O `SafeAreaView` da biblioteca é uma view
 * nativa e lê o inset do sistema sozinha (medido no fonte da 5.9.1: ela não consome contexto
 * nenhum). Quem exige o provider são os HOOKS — e quem usa `react-navigation` já o tem.
 */
export function Screen({
  edges = TODAS_AS_BORDAS,
  padded = true,
  scroll = false,
  background = "background",
  onRefresh,
  refreshing,
  footer,
  style,
  children,
  ...rest
}: ScreenProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const fundo = s[`fundo_${background}`];
  // 🔴 O ESPAÇO DA BARRA DE ABAS, quando ela flutua por cima desta tela — ver `barranav.tsx`.
  // **Zero** fora de um `BottomNavProvider`, que é o caso de toda tela cheia: sem abas, nada muda.
  const respiroDaBarra = useBottomNavSpace();

  return (
    // `...rest` fica SEMPRE na raiz, com ou sem scroll: `testID`, rótulo e papel de
    // acessibilidade são da tela, não do rolador.
    <SafeAreaView style={[s.raiz, fundo, !scroll && padded && s.respiro, style]} edges={edges} {...rest}>
      {scroll ? (
        <ScrollView
          style={s.raiz}
          // ⚠ O respiro da barra SOMA ao do tema em vez de substituí-lo: escrever
          // `paddingBottom` depois de `s.respiro` apagaria os 16 do tema e colaria o último
          // item na pílula. A conta é explícita porque a folha não soma sozinha.
          contentContainerStyle={[
            s.conteudo, padded && s.respiro,
            // Com rodapé, quem sobe acima da barra de abas é ELE; a rolagem termina em cima dele.
            respiroDaBarra > 0 && footer == null
              && {paddingBottom: (padded ? t.size.space4 : 0) + respiroDaBarra},
          ]}
          // A rosca do sistema é a única aparência da plataforma que a Aurea aceita aqui, e a
          // razão é que ela NÃO É desenho nosso: é o gesto do sistema operacional, com a física
          // que a pessoa já conhece. O que dá para pintar, pintamos — a cor é do tema.
          refreshControl={onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={t.color.primary}
              colors={[t.color.primary]}
              progressBackgroundColor={t.color.card} />
          ) : undefined}
          // Sem isto, tocar um botão com o teclado aberto exige DOIS toques: o primeiro só
          // fecha o teclado. É um defeito conhecido do RN, e a tela é o lugar certo de absorvê-lo
          // — o Lote 4 é todo formulário.
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
      {footer != null && (
        <Rodape
          dentroDoRespiro={!scroll && padded}
          pegaABorda={edges.includes("bottom")}
          respiroDaBarra={respiroDaBarra}>
          {footer}
        </Rodape>
      )}
    </SafeAreaView>
  );
}

/**
 * O rodapé da `Screen`. Três contas, cada uma com a sua razão:
 *
 * - **o recuo:** `space4`, o `respiro` da própria tela. Sem `scroll` e com `padded`, a raiz já
 *   recua 16 dos quatro lados, então o rodapé só afasta do conteúdo de cima;
 * - **a barra de abas:** dentro de um `BottomNavProvider` ela flutua por cima; o rodapé sobe o
 *   número que ela informa, que já inclui a área do sistema;
 * - **a área do sistema:** se a raiz pega a borda de baixo, ela já soma o inset; se não pega, o
 *   rodapé pega sozinho, com a mesma `SafeAreaView`.
 */
function Rodape({dentroDoRespiro, pegaABorda, respiroDaBarra, children}: {
  dentroDoRespiro: boolean; pegaABorda: boolean; respiroDaBarra: number; children: React.ReactNode;
}) {
  const t = useAureaTokens();
  const s = folha(t);
  const recuo = [
    dentroDoRespiro ? s.rodapeNoRespiro : s.rodape,
    respiroDaBarra > 0
      && {paddingBottom: (dentroDoRespiro ? 0 : t.size.space4) + respiroDaBarra},
  ];
  // Com a barra de abas, o número dela já traz a área do sistema: pegar a borda de novo somaria
  // o inset duas vezes.
  if (pegaABorda || respiroDaBarra > 0) return <View style={recuo}>{children}</View>;
  return <SafeAreaView edges={["bottom"]} style={recuo}>{children}</SafeAreaView>;
}

// ── E10 · O RECUO DAS FOLHAS DE BAIXO (`Select`, `Combobox`, `BottomSheet`) ──────────────────
// 🔴 DENTRO DE UM `Modal`, O `SafeAreaView` NÃO SERVE, e a razão foi lida no fonte da biblioteca
// (`SafeAreaView.kt` e `SafeAreaUtils.kt`, versão 5.9.1), não presumida:
//
//     findProvider(): sobe pelos pais atrás de um `SafeAreaProvider`; sem achar, usa A SI MESMO.
//     getSafeAreaInsets(view): if (view.height == 0) return null   // "ainda sem layout"
//
// O `Modal` é outra janela do Android: o `SafeAreaProvider` do app não é pai de nada lá dentro.
// Então a peça mede a si mesma — e a da 0.11.0 era VAZIA, de altura 0, esperando o recuo para
// ganhar altura. Nunca ganhava: o recuo ficava em zero e o último item, atrás dos botões do
// sistema (achado E10 do app).
//
// A saída é a do HeroUI Native (`select.tsx`, `useSafeAreaInsets`): o número vem do CONTEXTO
// do React, que atravessa o `Modal`, e vira um espaço de altura conhecida no fim da folha. Sem
// `SafeAreaProvider` no app, vale a medida da abertura (`initialWindowMetrics`), que a
// biblioteca calcula sem provider — e o componente não quebra quem não tem provider.
// ⚠ As três folhas cobrem a tela toda (`navigationBarTranslucent`): é o que faz o recuo do
// contexto, que é o da janela do app, ser exatamente o que a folha fica atrás da barra.

/** O recuo de baixo do sistema (barra de botões ou de gestos), em dp. */
export function useRecuoDoSistema(): number {
  const doContexto = React.useContext(SafeAreaInsetsContext);
  return (doContexto ?? initialWindowMetrics?.insets)?.bottom ?? 0;
}

/** O teclado está aberto? Pelos avisos do próprio React Native. */
function useTecladoAberto(): boolean {
  const [aberto, setAberto] = React.useState(false);
  React.useEffect(() => {
    const mostra = Keyboard.addListener("keyboardDidShow", () => setAberto(true));
    const esconde = Keyboard.addListener("keyboardDidHide", () => setAberto(false));
    return () => { mostra.remove(); esconde.remove(); };
  }, []);
  return aberto;
}

/**
 * O espaço do recuo do sistema no fim de uma folha de baixo. Uso interno.
 * `comTeclado`: com o teclado aberto a folha sobe acima dele e deixa de ficar atrás da barra do
 * sistema, e o espaço vai a zero — senão sobraria uma faixa vazia entre a lista e o teclado.
 */
export function RecuoDaFolha({comTeclado = false}: {comTeclado?: boolean}) {
  const recuo = useRecuoDoSistema();
  const teclado = useTecladoAberto();
  return <View style={{height: comTeclado && teclado ? 0 : recuo}} />;
}
