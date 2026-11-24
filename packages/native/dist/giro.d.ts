import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export interface AnelQueGiraProps {
    /** O lado da caixa do anel. */
    lado: number;
    /** A cor do traço. */
    cor: string;
    /** O que o leitor de tela recebe — o `Spinner` diz "carregando"; o botão esconde (ele mesmo diz "ocupado"). */
    acessibilidade: object;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O anel que gira. **700 ms, linear** — o mesmo `.7s linear` do `.spinner` da web.
 *
 * ⚠ **Ele para quando a pessoa pede menos movimento.** Na web a regra global de `prefers-reduced-motion` já fazia isso;
 * aqui é o componente que pergunta, porque não há cascata para fazê-lo por ele. Parado, o anel continua desenhado.
 */
export declare function AnelQueGira({ lado, cor, acessibilidade, style, testID }: AnelQueGiraProps): React.JSX.Element;
