import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type AureaIcon } from "./icon.js";
/** O arquivo escolhido: o que o `expo-document-picker` devolve, sem o conteúdo. */
export type AureaFile = {
    /** O endereço local do arquivo — é ele que o app envia. */
    uri: string;
    name: string;
    /** Em bytes. Pode faltar: nem todo provedor de arquivos do Android informa. */
    size?: number;
    mimeType?: string;
};
export interface FileInputProps {
    value?: AureaFile[];
    onChange?: (arquivos: AureaFile[]) => void;
    /**
     * Os tipos aceitos, em MIME: `"application/pdf"`, `["image/*", "application/pdf"]`. É o filtro
     * do seletor do sistema, e a peça confere de novo na volta. Padrão: qualquer arquivo.
     */
    accept?: string | string[];
    /** Quantos arquivos cabem. Padrão: 1. Com o limite atingido, o gatilho some. */
    max?: number;
    /** O tamanho máximo, em bytes. O arquivo maior é recusado, com aviso embaixo do campo. */
    maxSize?: number;
    disabled?: boolean;
    /** O glifo do gatilho. Padrão `paperclip`; `false` tira. */
    addIcon?: AureaIcon | false;
    /** O glifo de cada arquivo escolhido. Padrão `file-text`, o mesmo da web; `false` tira. */
    fileIcon?: AureaIcon | false;
    removeIcon?: AureaIcon;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/** O tamanho para ler: a mesma conta do `formatSize` da web (`file-input.tsx`). */
export declare function formatarTamanho(bytes: number): string;
/** O arquivo bate com o `accept`? Sem `accept`, ou sem tipo informado, a resposta é sim. */
export declare function aceitaTipo(mimeType: string | undefined, accept: string | string[] | undefined): boolean;
/**
 * Escolher arquivo do aparelho.
 *
 * | a pergunta | o que ficou |
 * |---|---|
 * | a pessoa **cancelou** o seletor? | nada muda: nem a lista, nem o aviso |
 * | o arquivo passa do **`maxSize`**? | é recusado, e o aviso aparece embaixo, em vermelho |
 * | o tipo não bate com o **`accept`**? | idem — o seletor do sistema filtra, a peça confere |
 * | o tamanho **não veio**? | aceito: não há o que medir, e o servidor confere |
 * | **quantos** cabem? | `max`, padrão 1; no limite o gatilho some, como no `PhotoInput` |
 * | **nome comprido**? | corta no MEIO (`relat…2026.pdf`), para a extensão continuar à vista |
 *
 * Para o leitor de tela: o gatilho é um botão com o nome do `Field` e o texto dele; cada
 * arquivo lê *"nome, tamanho"*; o X lê *"Remover nome"*; o aviso de recusa é anunciado.
 */
export declare function FileInput({ value, onChange, accept, max, maxSize, disabled, addIcon, fileIcon, removeIcon, style, testID, }: FileInputProps): React.JSX.Element;
