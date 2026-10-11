import React from "react";
export declare function CodeBlock({ children, language, copyable, preview, className }: {
    children: string;
    language?: string;
    copyable?: boolean;
    /** A prévia viva do código: com ela, o bloco vira a caixa de exemplo, com as abas Prévia | Código. */
    preview?: React.ReactNode;
    className?: string;
}): React.JSX.Element;
