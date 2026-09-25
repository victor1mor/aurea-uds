import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
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
/**
 * Uma linha que rola para o lado quando não cabe, e que sabe QUANDO não cabe.
 *
 * O componente fica com a informação em vez de adivinhar: `onLayout` dá a largura visível e
 * `onContentSizeChange` dá a do conteúdo. Com as duas, `transbordou` é uma conta, não um palpite.
 */
export declare function FilaRolante({ children, style, testID, justify }: FilaRolanteProps): React.JSX.Element;
