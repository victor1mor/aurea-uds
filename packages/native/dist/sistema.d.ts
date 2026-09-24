import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type IconName } from "./icon.js";
import { type AureaFieldSize } from "./inputs.js";
export interface DatePickerProps {
    value?: Date;
    onChange?: (d: Date) => void;
    /** Padrão: a data de hoje, quando o diálogo abre sem valor. */
    mode?: "date" | "time";
    minimumDate?: Date;
    maximumDate?: Date;
    disabled?: boolean;
    size?: AureaFieldSize;
    /** Como a data vira texto no gatilho. Padrão: o formato do aparelho. */
    format?: (d: Date) => string;
    placeholder?: string;
    icon?: IconName | false;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O campo de data — **a nossa pele, o calendário DELES**.
 *
 * ⚠ **E isso é a decisão, não uma concessão.** A Aurea desenha o gatilho (mesma altura, mesma
 * borda e o mesmo raio do `Input`), e o que abre é o **diálogo do sistema**. Data é um controle
 * que o Android e o iOS fazem melhor e que a pessoa já sabe usar — reimplementá-lo daria um
 * calendário com a nossa cor e o comportamento errado em nove casos de borda (fuso, calendário
 * não gregoriano, entrada por teclado, TalkBack).
 *
 * ⚠ **As duas plataformas têm APIs DIFERENTES**, e isso não é detalhe de implementação — é o que
 * o componente existe para esconder:
 *
 *     Android  ->  `DateTimePickerAndroid.open({...})`  IMPERATIVO, o diálogo é do sistema
 *     iOS      ->  `<RNDateTimePicker>`                 DECLARATIVO, vira um nó na árvore
 *
 * Um app que não soubesse disso escreveria o caminho do Android e veria nada acontecer no iPhone.
 */
export declare function DatePicker({ value, onChange, mode, minimumDate, maximumDate, disabled, size, format, placeholder, icon, style, testID, }: DatePickerProps): React.JSX.Element;
export type AureaPhoto = {
    uri: string;
    width?: number;
    height?: number;
};
export interface PhotoInputProps {
    value?: AureaPhoto[];
    onChange?: (fotos: AureaPhoto[]) => void;
    /** Quantas fotos cabem. Padrão: 1 — o plano do consumidor pede um anexo por lançamento. */
    max?: number;
    /**
     * De onde vem a foto. Padrão `camera`, que é o que o plano do consumidor pede.
     * `library` abre a galeria; quem quiser os dois desenha dois gatilhos.
     */
    source?: "camera" | "library";
    disabled?: boolean;
    /** Levar às configurações do app quando a pessoa negou e o sistema não pergunta mais. */
    offerSettings?: boolean;
    /** Avisado quando a permissão foi negada — o app pode querer contar uma história própria. */
    onPermissionDenied?: () => void;
    addIcon?: IconName | false;
    removeIcon?: IconName;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O anexo por foto.
 *
 * ⚠ **ESTE COMPONENTE CARREGA DECISÕES DE FLUXO QUE NÃO ERAM ÓBVIAS, e elas estão declaradas
 * aqui em vez de escondidas no código.** Eu recomendei adiá-lo por isso; o Victor mandou fazer, e
 * então cada pergunta foi respondida com um padrão — e cada padrão tem uma saída:
 *
 * | a pergunta | o que ficou | como mudar |
 * |---|---|---|
 * | o que mostrar **sem** permissão? | o gatilho aparece normal. Tocar é que pergunta | — |
 * | e se a pessoa **negar**? | pergunta de novo na próxima vez, enquanto o sistema deixar | `onPermissionDenied` |
 * | e se negar de vez (`canAskAgain: false`)? | um `Alert` de aviso + botão para as **configurações** | `offerSettings={false}` |
 * | **câmera ou galeria?** | câmera, que é o que o plano pede | `source="library"` |
 * | como **remover**? | um `IconButton` no canto de cada miniatura | `removeIcon` |
 * | **quantas** cabem? | uma | `max` |
 *
 * ⚠ **O gatilho some quando o limite é atingido**, em vez de ficar aceso e não fazer nada.
 */
export declare function PhotoInput({ value, onChange, max, source, disabled, offerSettings, onPermissionDenied, addIcon, removeIcon, style, testID, }: PhotoInputProps): React.JSX.Element;
