import React from "react";
import { type Extension } from "@codemirror/state";
import { HighlightStyle } from "@codemirror/language";
export declare const aureaEditorTheme: Extension;
export declare const aureaHighlightStyle: HighlightStyle;
export interface CodeEditorProps {
    /** Conteúdo inicial. Não controlado (precedente MediaPlayer/FileInput): mudanças depois da montagem não recarregam o doc. */
    defaultValue?: string;
    /** Notificado a cada edição com o texto atual. */
    onChange?: (value: string) => void;
    /** Extensões do consumidor: a extensão de LINGUAGEM (@codemirror/lang-*) e o que mais quiser. Memorize o array para não reconfigurar à toa. */
    extensions?: Extension[];
    readOnly?: boolean;
    /** Nome acessível do editor; default vem da i18n (`codeEditor`). */
    ariaLabel?: string;
    className?: string;
}
export declare function CodeEditor({ defaultValue, onChange, extensions, readOnly, ariaLabel, className }: CodeEditorProps): React.JSX.Element;
