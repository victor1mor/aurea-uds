import React, { type HTMLAttributes, type RefAttributes, type ReactNode, type ReactElement } from "react";
import { type Responsive } from "./pure.js";
import { type IconName } from "./system.js";
import { type IconButtonProps } from "./actions.js";
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
    items?: SidebarEntry[];
    /** O link do roteador do app (M-01): `<Link href="/relatorios" />`. Recebe a pele, o estado de página atual e o conteúdo do item. */
    render?: ReactElement;
    /** A foto ou o logotipo do item (4-E — o time, a pessoa): toma o lugar do `icon`, no mesmo formato da `NavList`. Recolhida, ele
     *  fica na trilha, e não um vão. */
    avatar?: {
        src?: string;
        fallback?: ReactNode;
    };
    /** A ação do item ou do grupo (4-D — o "⋯", o "+"): um `IconButton` pequeno. Mora AO LADO do item, nunca dentro do link (botão
     *  dentro de link não é HTML válido, e o leitor de tela perde um dos dois). Recolhida, some, como na referência. */
    action?: ReactNode;
    /** Só no GRUPO (item com `items` e sem destino): o nome vira um botão que dobra a lista (4-D). */
    collapsible?: boolean;
    /** Com `collapsible`: o grupo começa aberto. Padrão: aberto. */
    defaultOpen?: boolean;
}
/** A lista da lateral: os itens e, entre eles, `"separator"` — a divisória entre seções (4-E). Sem linha (ADR-0072): é um vão.
 *  A lista se parte nela em duas, como os grupos da referência, que se separam fora da lista. */
export type SidebarEntry = SidebarItem | "separator";
export type SidebarVariant = "floating" | "flush" | "plain";
export type SidebarScrollbar = "hover" | "visible";
export type SidebarPlacement = "left" | "right";
export type SidebarCollapsible = "icon" | "capsule" | "offcanvas";
export type SidebarIndicator = "brand" | "segment" | "segment-dot" | "segment-line" | "subtle";
export interface SidebarState {
    /** Recolhida agora. */
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    toggle: () => void;
    /** O jeito de recolher que o provedor passa à lateral. */
    collapsible: SidebarCollapsible;
    /** O `id` da lateral: o botão de recolher aponta para ela (`aria-controls`). */
    id: string;
}
/** O estado da lateral: dentro de um `Sidebar.Provider` ou de um `AppShell` com `sidebarCollapsible`. Fora deles, `null`. */
export declare function useSidebar(): SidebarState | null;
declare function SidebarProvider({ collapsed, defaultCollapsed, onCollapsedChange, collapsible, shortcut, id, children }: {
    /** Recolhida (controlado). */
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    /** O jeito de recolher (4-A). Padrão: `icon`, a trilha. */
    collapsible?: SidebarCollapsible;
    /** O atalho Ctrl+B (Cmd+B no Mac). Padrão: ligado, como na referência. */
    shortcut?: boolean;
    /** O `id` da lateral. Sem ele, um gerado. */
    id?: string;
    children?: ReactNode;
}): React.JSX.Element;
declare function SidebarToggle({ variant, className, onClick, ...props }: Omit<IconButtonProps, "icon" | "label" | "variant" | "children"> & {
    variant?: "icon" | "item";
}): React.JSX.Element | null;
export declare function Sidebar({ items, current, collapsed, collapsible, indicator, panel, contrast, variant, placement, scrollbar, label, header, footer, children, className, onClick, id, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    items?: SidebarEntry[];
    current?: string;
    collapsed?: boolean;
    variant?: SidebarVariant;
    placement?: SidebarPlacement;
    scrollbar?: SidebarScrollbar;
    label?: string;
    /** O jeito de recolher (4-A): `icon` (a trilha, o padrão), `capsule` (a trilha em cápsula) ou `offcanvas` (sai da tela).
     *  Dentro de um `Sidebar.Provider`, vem dele. */
    collapsible?: SidebarCollapsible;
    /** O desenho do item atual (4-H): `brand` (o de hoje), `segment`, `segment-dot`, `segment-line` ou `subtle`. */
    indicator?: SidebarIndicator;
    /** A trilha das seções com o painel (4-F e 4-G): os itens do primeiro nível viram seções, e a lista da seção mora num
     *  painel — `docked`, ao lado da trilha (recolher esconde só o painel), ou `overlay`, por cima, ao lado do ícone. */
    panel?: "docked" | "overlay";
    /** A lateral de contraste (MNT-36): escura nas duas telas. Leva o tema escuro por dentro, como o `Card variant="contrast"`;
     *  numa página clara, o fundo é o cartão do escuro; numa página escura, mais escuro que a página. */
    contrast?: boolean;
    /** O topo fixo (4-C): a marca do app (`Sidebar.Brand`), a busca. Não rola com a lista. */
    header?: ReactNode;
    /** O pé fixo (4-C): a pessoa e o sair (`Sidebar.User`), a lista curta (`Sidebar.Nav`), o cartão de destaque. Não rola com a lista. */
    footer?: ReactNode;
}): React.JSX.Element;
export declare namespace Sidebar {
    export { SidebarBrand as Brand };
    export { SidebarUser as User };
    export { SidebarNav as Nav };
    export { SidebarShow as Show };
    export { SidebarProvider as Provider };
    export { SidebarToggle as Toggle };
}
/** A marca do app no topo da lateral: o `logo` (a letra, o desenho, a imagem), o nome e o subtítulo. `variant="tile"` (o
 *  padrão, a 11 das quinze) põe o logo num quadrinho na cor primária; `plain` (da 8 à 10) é o desenho solto e o nome
 *  grande. Recolhida, fica só o logo. */
declare function SidebarBrand({ logo, name, description, variant, action, className, ...props }: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    logo: ReactNode;
    name: ReactNode;
    description?: ReactNode;
    variant?: "tile" | "plain";
    /** Uma ação ao lado da marca: o `Sidebar.Toggle`. Recolhida, ela desce para baixo do logo. */
    action?: ReactNode;
}): React.JSX.Element;
/** A pessoa no pé da lateral, numa caixinha: a foto (`avatar`), o nome, o papel e a ação (o sair). Recolhida, a foto e a ação, empilhadas. */
declare function SidebarUser({ avatar, name, description, action, className, ...props }: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    avatar: ReactNode;
    name: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
}): React.JSX.Element;
/** Uma segunda lista com a pele da lateral (a do pé: Suporte, Ajustes). `label` é obrigatório: duas listas com o mesmo nome confundem o leitor de tela. */
declare function SidebarNav({ items, current, label, className, ...props }: Omit<HTMLAttributes<HTMLElement>, "children"> & {
    items: SidebarEntry[];
    current?: string;
    label: string;
}): React.JSX.Element;
/** O que só aparece com a lateral aberta (`when="expanded"`: a busca, o cartão de destaque) ou só recolhida (`when="collapsed"`: o botão da lupa). */
declare function SidebarShow({ when, children }: {
    when: "expanded" | "collapsed";
    children?: ReactNode;
}): React.JSX.Element | null;
export type BottomNavVariant = "floating" | "edge";
export type BottomNavIndicator = "none" | "subtle" | "pill" | "circle" | "circle-raised" | "circle-bold" | "circle-outline" | "capsule" | "expand";
export type BottomNavWidth = "full" | "content";
export type BottomNavCurrentStyle = "current" | "neutral" | "contrast" | "brand" | "ring" | "plain" | "brand-white" | "white-ring" | "brand-gradient" | "bar-ink" | "bar-ring" | "bar-plain" | "bar-light";
/** @deprecated Os quatro nomes de 17/08/2026. Use `variant` + `indicator`. */
export type BottomNavVariantLegacy = "flat" | "surface" | "pill" | "dock";
export type BottomNavVariantAny = BottomNavVariant | BottomNavVariantLegacy;
export declare function BottomNav({ items, current, variant, indicator, width, label, currentStyle, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    items: SidebarEntry[];
    current?: string;
    variant?: BottomNavVariantAny;
    indicator?: BottomNavIndicator;
    width?: BottomNavWidth;
    label?: string;
    currentStyle?: BottomNavCurrentStyle;
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
}): React.JSX.Element;
export declare function CommandPaletteShell({ open, query, onQueryChange, onClose, label, children }: {
    open: boolean;
    query: string;
    onQueryChange: (v: string) => void;
    /** Quem fecha: a janela avisa pelo Esc e pelo clique fora. */
    onClose?: () => void;
    /** O nome da janela (o padrão é o da paleta, "Command palette"). */
    label?: string;
    children?: ReactNode;
}): React.JSX.Element;
export {};
