import React from "react";
/** Uma aba do `CodeBlock` em abas: o nome (o "npm"), o código e, se for outra, a língua dele. */
export interface CodeBlockTab {
    label: string;
    code: string;
    language?: string;
}
/** Um pedaço de uma linha de código, com a classe da cor (`tok-keyword`, `tok-string`…) quando tem cor. */
export interface CodeToken {
    text: string;
    className?: string;
}
/** Uma linha de código: os pedaços, na ordem. */
export type CodeLine = CodeToken[];
/** Quem colore: recebe o código e a língua e devolve as linhas, ou `null` quando não conhece a língua. O da Aurea é o
 *  `highlightCode` de `@aurea-uds/react/code-highlight`. */
export type CodeHighlighter = (code: string, language: string) => CodeLine[] | null;
export declare function CodeBlock({ children, language, copyable, preview, lineNumbers, highlight, tabs, className }: {
    children?: string;
    language?: string;
    copyable?: boolean;
    /** A prévia viva do código: com ela, o bloco vira a caixa de exemplo, com as abas Prévia | Código. */
    preview?: React.ReactNode;
    /** Mostra o número de cada linha à esquerda. O número não entra no texto copiado nem é lido pelo leitor de tela. */
    lineNumbers?: boolean;
    /** Colore o código. Passe o `highlightCode` de `@aurea-uds/react/code-highlight` (os analisadores são peer opcional). */
    highlight?: CodeHighlighter;
    /** As alternativas do mesmo passo, em abas (o comando de instalar em npm, pnpm, yarn e bun): a fileira em cima, dentro
     *  da caixa, e um código por aba. Com `tabs`, o `children` não é lido. */
    tabs?: CodeBlockTab[];
    className?: string;
}): React.JSX.Element;
