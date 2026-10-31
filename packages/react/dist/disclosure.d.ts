import React, { type ReactNode } from "react";
export type AccordionVariant = "default" | "surface";
export interface AccordionItem {
    id: string;
    title: ReactNode;
    content: ReactNode;
    /** O item que não abre: anunciado como desligado e fora do Tab. */
    disabled?: boolean;
}
export declare function Accordion({ items, variant, multiple, defaultValue, indicator, size, className }: {
    items: AccordionItem[];
    variant?: AccordionVariant;
    /** O desenho de abrir: `"chevron"` (o padrão, a setinha) ou `"plus"` (o "+" numa bolinha, que vira "×" quando abre). */
    indicator?: "chevron" | "plus";
    /** A altura da linha: `"md"` (o padrão) ou `"lg"` (60, com a letra do texto). */
    size?: "md" | "lg";
    /** Deixa vários itens abertos ao mesmo tempo. Sem isto, abrir um fecha o outro. */
    multiple?: boolean;
    /** Os itens que começam abertos (o `id` de cada um). */
    defaultValue?: string[];
    className?: string;
}): React.JSX.Element;
export declare function Collapsible({ trigger, children, open, defaultOpen, onOpenChange, disabled, className }: {
    trigger: ReactNode;
    children: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    className?: string;
}): React.JSX.Element;
