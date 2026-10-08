import React, { type HTMLAttributes, type RefAttributes, type ReactNode } from "react";
export interface TableProps extends HTMLAttributes<HTMLTableElement>, RefAttributes<HTMLTableElement> {
    /** Um `<caption>` de verdade; se for texto, vira também o nome da região que rola. */
    caption?: ReactNode;
    /** GAR-13: o cabeçalho fica preso no topo da caixa da tabela, que ganha teto (`--table-max-h`, 60vh) e rola por dentro. */
    stickyHeader?: boolean;
    /** GAR-12: a primeira coluna fica parada ao rolar de lado. */
    stickyFirstColumn?: boolean;
    /** GAR-12: a tabela cabe na largura da caixa, sem o mínimo de 720 — a comparação de dois itens no celular. */
    fit?: boolean;
    /** GAR-12: esconde as linhas marcadas como iguais (`<tr data-same>`) — o "Só diferenças". */
    differencesOnly?: boolean;
}
export declare function Table({ caption, stickyHeader, stickyFirstColumn, fit, differencesOnly, children, className, ...props }: TableProps): React.JSX.Element;
export interface SortableItem {
    id: string;
    label: ReactNode;
}
export interface SortableListProps extends Omit<HTMLAttributes<HTMLUListElement>, "onReorder">, RefAttributes<HTMLUListElement> {
    items: SortableItem[];
    onReorder: (from: number, to: number) => void;
    label?: string;
}
export declare function SortableList({ items, onReorder, label, className, ...props }: SortableListProps): React.JSX.Element;
