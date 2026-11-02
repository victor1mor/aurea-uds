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
    /** `rows` (o site B, 0.54.0 — a lista de membros da página inicial, aprovada pela bancada em 01/11/2026, o D-7.6): sem a
     *  caixa, cada linha é uma CÁPSULA de 54, 4 entre elas; com o mouse, o `--fill-1`; a linha com `data-selected`, o amarelo
     *  a 14%. O cabeçalho em mono maiúsculo, apagado. Cabe na largura (sem o mínimo de 720). */
    variant?: "default" | "rows";
    /** GAR-12: esconde as linhas marcadas como iguais (`<tr data-same>`) — o "Só diferenças". */
    differencesOnly?: boolean;
}
export declare function Table({ caption, stickyHeader, stickyFirstColumn, fit, differencesOnly, variant, children, className, ...props }: TableProps): React.JSX.Element;
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
