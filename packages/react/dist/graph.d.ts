import React, { type ReactNode } from "react";
export interface GraphNodeItem {
    id: string;
    label: string;
    kind?: string;
    detail?: ReactNode;
    x?: number;
    y?: number;
}
export interface GraphEdgeItem {
    id?: string;
    from: string;
    to: string;
    label?: string;
    animated?: boolean;
}
export declare function DependencyGraph({ nodes, edges, label, selectedId, onSelect, connectable, onConnect, onNodeMove, height, className, ...props }: {
    nodes: GraphNodeItem[];
    edges: GraphEdgeItem[];
    label?: string;
    selectedId?: string | null;
    onSelect?: (id: string) => void;
    connectable?: boolean;
    onConnect?: (edge: {
        from: string;
        to: string;
    }) => void;
    onNodeMove?: (id: string, pos: {
        x: number;
        y: number;
    }) => void;
    height?: string;
    className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">): React.JSX.Element;
