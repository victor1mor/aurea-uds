import type { CodeLine } from "./code-client.js";
/** As línguas que `highlightCode` colore. Com outra, ele devolve `null` e o `CodeBlock` mostra o texto puro. */
export declare const highlightLanguages: readonly string[];
/**
 * Colore o código para o `CodeBlock` (a prop `highlight`): devolve as linhas, cada uma com os pedaços de texto e a
 * classe da cor. Língua que não está em `highlightLanguages` devolve `null`, e o bloco sai sem cor.
 *
 * ```tsx
 * import {CodeBlock} from "@aurea-uds/react";
 * import {highlightCode} from "@aurea-uds/react/code-highlight";
 * <CodeBlock language="tsx" highlight={highlightCode} lineNumbers>{code}</CodeBlock>
 * ```
 */
export declare function highlightCode(code: string, language: string): CodeLine[] | null;
