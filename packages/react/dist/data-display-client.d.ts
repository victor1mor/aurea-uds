import React, { type HTMLAttributes, type RefAttributes, type ReactNode } from "react";
export declare function Table({ caption, children, className, ...props }: HTMLAttributes<HTMLTableElement> & RefAttributes<HTMLTableElement> & {
    caption?: ReactNode;
}): React.JSX.Element;
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
