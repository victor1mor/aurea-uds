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
export declare function AnelQueGira({ lado, cor, acessibilidade, style, testID }: AnelQueGiraProps): React.JSX.Element;
