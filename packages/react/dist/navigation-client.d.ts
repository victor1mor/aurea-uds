import React, { type HTMLAttributes, type RefAttributes, type ReactNode, type ReactElement } from "react";
import { type Responsive } from "./pure.js";
import { type IconName } from "./system.js";
export type StepState = "default" | "active" | "done" | "error";
export interface StepItem {
    label: ReactNode;
    state?: StepState;
    optional?: ReactNode;
    onClick?: () => void;
}
export declare function Stepper({ items, label, className }: {
    items: StepItem[];
    label?: string;
    className?: string;
}): React.JSX.Element;
export interface BreadcrumbItem {
    label: ReactNode;
    href?: string;
    render?: ReactElement;
}
export declare function Breadcrumb({ items, label }: {
    items: BreadcrumbItem[];
    label?: string;
}): React.JSX.Element;
export type TabsOrientation = "horizontal" | "vertical";
export declare function Tabs({ tabs, value, onChange, label, orientation, activateOnFocus, loopFocus }: {
    tabs: Array<{
        id: string;
        label: ReactNode;
        content: ReactNode;
    }>;
    value: string;
    onChange: (id: string) => void;
    label?: string;
    orientation?: Responsive<TabsOrientation>;
    activateOnFocus?: boolean;
    loopFocus?: boolean;
}): React.JSX.Element;
export declare function Pagination({ page, total, onPageChange }: {
    page: number;
    total: number;
    onPageChange: (p: number) => void;
}): React.JSX.Element;
export interface TocItem {
    id: string;
    label: string;
    sub?: boolean;
}
export declare function TableOfContents({ items, current, label, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    items: TocItem[];
    current?: string;
    label?: string;
}): React.JSX.Element;
export interface TreeNode {
    id: string;
    label: ReactNode;
    icon?: IconName;
    children?: TreeNode[];
}
export declare function TreeView({ items, defaultExpandedIds, onSelect, label, className }: {
    items: TreeNode[];
    defaultExpandedIds?: string[];
    onSelect?: (node: TreeNode) => void;
    label?: string;
    className?: string;
}): ReactElement<unknown, string | React.JSXElementConstructor<any>>;
export interface SidebarItem {
    id: string;
    label: ReactNode;
    href?: string;
    icon?: IconName;
    badge?: ReactNode;
    onClick?: () => void;
    items?: SidebarItem[];
    /** O link do roteador do app (M-01): `<Link href="/relatorios" />`. Recebe a pele, o estado de página atual e o conteúdo do item. */
    render?: ReactElement;
}
export type SidebarVariant = "floating" | "flush";
export declare function Sidebar({ items, current, collapsed, variant, label, children, className, onClick, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    items?: SidebarItem[];
    current?: string;
    collapsed?: boolean;
    variant?: SidebarVariant;
    label?: string;
}): React.JSX.Element;
export type BottomNavVariant = "floating" | "edge";
export type BottomNavIndicator = "none" | "subtle" | "pill" | "circle" | "circle-raised" | "circle-bold" | "circle-outline";
export type BottomNavWidth = "full" | "content";
/** @deprecated Os quatro nomes de 17/08/2026. Use `variant` + `indicator`. */
export type BottomNavVariantLegacy = "flat" | "surface" | "pill" | "dock";
export type BottomNavVariantAny = BottomNavVariant | BottomNavVariantLegacy;
export declare function BottomNav({ items, current, variant, indicator, width, label, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    items: SidebarItem[];
    current?: string;
    variant?: BottomNavVariantAny;
    indicator?: BottomNavIndicator;
    width?: BottomNavWidth;
    label?: string;
}): React.JSX.Element;
export interface NavListItem {
    id: string;
    label: ReactNode;
    description?: ReactNode;
    value?: ReactNode;
    icon?: IconName;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    /** O link do roteador do app (M-01). Linha com `render` é linha com destino: leva a seta, como a com `href`. */
    render?: ReactElement;
}
export declare function NavList({ items, className, ...props }: HTMLAttributes<HTMLUListElement> & RefAttributes<HTMLUListElement> & {
    items: NavListItem[];
}): React.JSX.Element;
export interface CommandItem {
    id: string;
    label: string;
    icon?: IconName;
    kbd?: string;
    run: () => void;
}
export declare function CommandPalette({ open, onClose, items, placeholder, label }: {
    open: boolean;
    onClose: () => void;
    items: CommandItem[];
    placeholder?: string;
    label?: string;
}): React.JSX.Element | null;
export declare function CommandPaletteShell({ open, query, onQueryChange, children }: {
    open: boolean;
    query: string;
    onQueryChange: (v: string) => void;
    children?: ReactNode;
}): React.JSX.Element | null;
