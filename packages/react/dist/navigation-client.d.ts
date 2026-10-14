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
export type TabsPanel = "card" | "plain";
export type TabsVariant = "primary" | "secondary";
export declare function Tabs({ tabs, value, onChange, label, orientation, activateOnFocus, loopFocus, panel, variant }: {
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
    panel?: TabsPanel;
    variant?: TabsVariant;
}): React.JSX.Element;
export type PaginationVariant = "numbers" | "simple" | "compact";
export interface PaginationProps {
    page: number;
    total: number;
    onPageChange?: (p: number) => void;
    variant?: PaginationVariant;
    /** O resumo à esquerda — "1 a 5 de 50 pedidos". */
    summary?: ReactNode;
    /** O endereço de cada página. Com ele, as páginas são links. */
    href?: (page: number) => string;
    /** Quantas páginas aparecem de cada lado da atual. Padrão: 1. */
    siblings?: number;
    /** O nome do marco de navegação. Padrão: a frase `paginationLabel`. Com duas paginações na mesma
     *  página, cada uma diz de quê ("Páginas dos pedidos"), senão o leitor de tela ouve dois marcos iguais. */
    label?: string;
    className?: string;
}
export declare function Pagination({ page, total, onPageChange, variant, summary, href, siblings, label, className }: PaginationProps): React.JSX.Element;
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
    hasChildren?: boolean;
}
export declare function TreeView({ items, defaultExpandedIds, onSelect, onExpand, selectedId, label, className }: {
    items: TreeNode[];
    defaultExpandedIds?: string[];
    onSelect?: (node: TreeNode) => void;
    onExpand?: (node: TreeNode) => void | Promise<unknown>;
    selectedId?: string | null;
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
export type SidebarVariant = "floating" | "flush" | "plain";
export type SidebarScrollbar = "hover" | "visible";
export type SidebarPlacement = "left" | "right";
export declare function Sidebar({ items, current, collapsed, variant, placement, scrollbar, label, children, className, onClick, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    items?: SidebarItem[];
    current?: string;
    collapsed?: boolean;
    variant?: SidebarVariant;
    placement?: SidebarPlacement;
    scrollbar?: SidebarScrollbar;
    label?: string;
}): React.JSX.Element;
export type BottomNavVariant = "floating" | "edge";
export type BottomNavIndicator = "none" | "subtle" | "pill" | "circle" | "circle-raised" | "circle-bold" | "circle-outline" | "capsule" | "expand";
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
export interface NavListIndicator {
    icon: IconName;
    /** O que o sinal quer dizer ("Fixada"). Sai da tela e fica para o leitor de tela. */
    label: string;
}
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
    /** A foto da linha (AN-04) — o mesmo formato do `ChatMessage.avatar`. Toma o lugar do `icon`. */
    avatar?: {
        src?: string;
        fallback?: ReactNode;
    };
    /** Os sinais ao lado do `value` (AN-04): fixada, silenciada. Pequenos e apagados, cada um com nome. */
    indicators?: NavListIndicator[];
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
    /** 0.32.0 (DOC-06): o grupo do item ("Componentes", "Páginas"). Itens com o mesmo grupo saem juntos,
     *  sob o título dele, na ordem em que o grupo aparece primeiro. */
    group?: string;
}
export declare function CommandPalette({ open, onClose, items, placeholder, label, shortcuts }: {
    open: boolean;
    onClose: () => void;
    items: CommandItem[];
    placeholder?: string;
    label?: string;
    /** 0.32.0 (DOC-07): a linha que ensina as teclas, embaixo — ↑ ↓ mover, Enter abrir, Esc fechar. */
    shortcuts?: boolean;
}): React.JSX.Element | null;
export declare function CommandPaletteShell({ open, query, onQueryChange, children }: {
    open: boolean;
    query: string;
    onQueryChange: (v: string) => void;
    children?: ReactNode;
}): React.JSX.Element | null;
