// A FILA QUE ROLA — e por que ela existe em vez de cada componente resolver o seu.
//
// 🔴 **ISTO NÃO É DESENHO NOVO: É TRADUÇÃO QUE FALTOU.** O consumidor pediu em 17/09/2026 um
// grupo de opções que coubesse com seis itens, e a primeira resposta que eu ia dar era criar um
// componente de "chips". **Medindo a web antes, o pedido já estava resolvido lá:**
//
//     aurea.css:2127, em tela de até 640px:
//     .tabs,.pagination,.segmented { max-width:100%; overflow-x:auto; }
//
// Ou seja: **na web o segmentado e as abas JÁ rolam no telefone.** O nativo é que não traduziu.
// Criar um terceiro jeito de escolher teria sido inventar o que já existia — e essa briga tem
// nome neste repositório: o `Sidebar`.
//
// ⚠ **E o sinal de "tem mais" foi pedido junto, com razão:** quem não sabe que dá para arrastar
// não acha a sexta opção. A saída óbvia do React Native **não serve** — `fadingEdgeLength` é
// `@platform android` (medido no tipo do RN), e usá-la daria o aviso no Android e **nada no
// iPhone**. É a armadilha de um alvo só que este projeto já pagou várias vezes.
// Gradiente também não: proibido desde a Fase 0.
//
// **O que fica, e é o mesmo da web:** a opção cortada pela borda é o sinal, e ele vem do recorte.
// O que este módulo acrescenta é MEDIR se há transbordo, para (1) mostrar a barra de rolagem só
// quando ela significa alguma coisa e (2) dar ao teste um número para conferir.
// ⚠ **Declarado: se o corte LÊ bem é pergunta de vidro, e nenhum aparelho deste projeto rodou
// iOS.** O que está provado aqui é a medição, não a leitura.
import * as React from "react";
import {ScrollView, type LayoutChangeEvent, type StyleProp, type ViewStyle} from "react-native";

export interface FilaRolanteProps {
  /** O conteúdo da fila — normalmente a cápsula com os itens dentro. */
  children: React.ReactNode;
  /** Estilo do invólucro externo, não do conteúdo. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /**
   * Onde a fila fica quando CABE — E3, 25/09/2026. `start` (o padrão, o de sempre), `center` ou
   * `end`. Quando não cabe, ela rola, e o alinhamento deixa de existir: começa no início.
   */
  justify?: AureaFilaJustify;
}

/** Onde a fila fica, na linha, quando cabe. O nome é o do `Cluster` (R-09): o eixo da fileira. */
export type AureaFilaJustify = "start" | "center" | "end";
const JUSTIFICAR = {center: "center", end: "flex-end"} as const;

/**
 * Uma linha que rola para o lado quando não cabe, e que sabe QUANDO não cabe.
 *
 * O componente fica com a informação em vez de adivinhar: `onLayout` dá a largura visível e
 * `onContentSizeChange` dá a do conteúdo. Com as duas, `transbordou` é uma conta, não um palpite.
 */
export function FilaRolante({children, style, testID, justify = "start"}: FilaRolanteProps) {
  const [visivel, setVisivel] = React.useState(0);
  const [conteudo, setConteudo] = React.useState(0);
  const transbordou = conteudo > visivel && visivel > 0;

  return (
    <ScrollView
      horizontal
      testID={testID}
      onLayout={(e: LayoutChangeEvent) => setVisivel(e.nativeEvent.layout.width)}
      onContentSizeChange={(w) => setConteudo(w)}
      // A barra só aparece quando ela quer dizer alguma coisa. Com tudo cabendo ela seria ruído,
      // e é assim que o `overflow-x:auto` da web se comporta: sem transbordo, sem barra.
      showsHorizontalScrollIndicator={transbordou}
      // Sem isto o conteúdo estica até a largura do rolador, e o respiro da cápsula aparece como
      // faixa vazia à direita quando os itens cabem.
      // E3: centralizar ou ir para o fim exige o contrário — o recipiente do conteúdo cresce até a
      // largura do rolador (`flexGrow: 1`) e POSICIONA a cápsula lá dentro. Ela não estica: na
      // fileira, o filho tem a largura dele. Medido pelo app: rolador 335 de largura, fileira 281,
      // encostada à esquerda, e um `Cluster justify="center"` em volta não mudava nada.
      contentContainerStyle={justify === "start" ? {flexGrow: 0} : {flexGrow: 1, justifyContent: JUSTIFICAR[justify]}}
      style={style}>
      {children}
    </ScrollView>
  );
}

// ⚠ **Nada mais sai daqui.** A `FilaRolante` NÃO entra na porta da frente do pacote: é ferramenta
// de dentro, usada pelo `SegmentedControl` e pelo `Tabs`. Publicá-la criaria uma peça que o
// consumidor teria de entender para resolver um problema que é nosso.
