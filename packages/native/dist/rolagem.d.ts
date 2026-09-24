import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export interface FilaRolanteProps {
    /** O conteúdo da fila — normalmente a cápsula com os itens dentro. */
    children: React.ReactNode;
    /** Estilo do invólucro externo, não do conteúdo. */
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * Uma linha que rola para o lado quando não cabe, e que sabe QUANDO não cabe.
 *
 * O componente fica com a informação em vez de adivinhar: `onLayout` dá a largura visível e
 * `onContentSizeChange` dá a do conteúdo. Com as duas, `transbordou` é uma conta, não um palpite.
 */
export declare function FilaRolante({ children, style, testID }: FilaRolanteProps): React.JSX.Element;
