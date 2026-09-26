import * as React from "react";
import { type ViewProps } from "react-native";
export type AureaScreenEdge = "top" | "right" | "bottom" | "left";
export type AureaScreenBackground = "background" | "surface1" | "surface2";
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
export declare function Screen({ edges, padded, scroll, background, onRefresh, refreshing, footer, style, children, ...rest }: ScreenProps): React.JSX.Element;
/** O recuo de baixo do sistema (barra de botões ou de gestos), em dp. */
export declare function useRecuoDoSistema(): number;
/**
 * O espaço do recuo do sistema no fim de uma folha de baixo. Uso interno.
 * `comTeclado`: com o teclado aberto a folha sobe acima dele e deixa de ficar atrás da barra do
 * sistema, e o espaço vai a zero — senão sobraria uma faixa vazia entre a lista e o teclado.
 */
export declare function RecuoDaFolha({ comTeclado }: {
    comTeclado?: boolean;
}): React.JSX.Element;
