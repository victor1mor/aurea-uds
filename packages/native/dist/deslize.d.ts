import * as React from "react";
import { type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
/** O lugar de um item dentro da fila, como o `onLayout` dele diz. */
export type CaixaDoItem = {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * A medida de cada item da fila e a do escolhido — o par do indicador. `medir(chave)` vai no `onLayout` de cada item;
 * `pronto` diz quando o indicador já está no lugar, e só então o item deixa de se pintar (antes, ele se pinta, como
 * sempre — nenhum quadro fica sem o escolhido).
 */
export declare function useFilaQueDesliza(ativo: string | undefined): {
    medir: (chave: string) => (e: LayoutChangeEvent) => void;
    alvo: CaixaDoItem | null;
    pronto: boolean;
    aoFicarPronto: React.Dispatch<React.SetStateAction<boolean>>;
};
/**
 * A peça que anda. Mora DENTRO da fila, como primeiro filho, atrás dos itens; `style` é a pintura do escolhido (a mesma
 * que o item usa), e `children` o que mais ela leva (o fio da aba secundária).
 */
export declare function IndicadorQueDesliza({ alvo, aoFicarPronto, style, children }: {
    alvo: CaixaDoItem | null;
    aoFicarPronto: (pronto: boolean) => void;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}): React.JSX.Element;
