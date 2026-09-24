import React, { type ReactNode, type ReactElement } from "react";
import { type Responsive } from "./pure.js";
import { type IconName } from "./system.js";
export type DialogSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";
export declare function Dialog({ open, title, children, footer, onClose, size, dismissible }: {
    open: boolean;
    title: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    onClose: () => void;
    size?: DialogSize;
    dismissible?: boolean;
}): React.JSX.Element;
export declare function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }: {
    open: boolean;
    title: ReactNode;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}): React.JSX.Element;
export declare function Drawer({ open, title, children, onClose, side }: {
    open: boolean;
    title: ReactNode;
    children: ReactNode;
    onClose: () => void;
    side?: "left" | "right";
}): React.JSX.Element;
export type AccessGateProps = {
    allowed: boolean;
    children: ReactElement;
} & ({
    mode?: "hide";
    fallback?: ReactNode;
    reason?: never;
} | {
    mode: "disable";
    reason: ReactNode;
    fallback?: never;
});
export declare function AccessGate({ allowed, children, ...resto }: AccessGateProps): React.JSX.Element;
export type OverlaySide = "top" | "right" | "bottom" | "left";
export declare function Tooltip({ children, content, side }: {
    children: ReactElement;
    content: ReactNode;
    side?: OverlaySide;
}): React.JSX.Element;
export declare function Popover({ trigger, title, children, side }: {
    trigger: ReactElement;
    title?: ReactNode;
    children: ReactNode;
    side?: OverlaySide;
}): React.JSX.Element;
export declare function HoverCard({ trigger, children, side }: {
    trigger: ReactElement;
    children: ReactNode;
    side?: OverlaySide;
}): React.JSX.Element;
interface MenuItemBase {
    label: ReactNode;
    disabled?: boolean;
    leadingIcon?: IconName;
}
/** Item de ação — a forma de sempre. `kind` é opcional para não quebrar quem já usa. */
export interface MenuActionDef extends MenuItemBase {
    kind?: "item";
    onClick?: () => void;
    /** O elemento que MATERIALIZA o item, no idioma `render` da casa (o mesmo do `Card`). Para
     *  navegação prefira `href`, que usa o `LinkItem` do motor. */
    render?: ReactElement;
}
/** Item que é um link de verdade: `<a href>`, com o `LinkItem` do motor por trás.
 *  NÃO estende `MenuItemBase`, e a ausência é a informação: **link não tem `disabled`** — o HTML
 *  não desabilita âncora, e o motor não aceita a prop. Um destino indisponível é um item de ação
 *  desabilitado, não um link apagado. */
export interface MenuLinkDef {
    kind: "link";
    label: ReactNode;
    leadingIcon?: IconName;
    href: string;
    target?: string;
    rel?: string;
    /** Fechar o menu ao clicar. O padrão do motor é `false` (a navegação desmonta tudo de qualquer
     *  jeito); aqui o padrão é `true`, porque numa aplicação de página única o clique NÃO desmonta
     *  e o menu ficaria aberto por cima da tela nova. */
    closeOnClick?: boolean;
}
/** Item que ALTERNA. Controlado (`checked`) ou não (`defaultChecked`), como todo par da casa. */
export interface MenuCheckboxDef extends MenuItemBase {
    kind: "checkbox";
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
/** Opções MUTUAMENTE EXCLUSIVAS. O grupo é a unidade — um rádio solto não tem sentido. */
export interface MenuRadioGroupDef {
    kind: "radiogroup";
    label?: ReactNode;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    items: Array<{
        value: string;
        label: ReactNode;
        disabled?: boolean;
        leadingIcon?: IconName;
    }>;
}
/** Submenu. `items` aninha a mesma união — um submenu pode ter submenu. */
export interface MenuSubmenuDef extends MenuItemBase {
    kind: "submenu";
    items: MenuEntry[];
}
/** Seção ROTULADA. O rótulo é do grupo, não um item: `GroupLabel` não é focável nem clicável. */
export interface MenuGroupDef {
    kind: "group";
    label?: ReactNode;
    items: MenuEntry[];
}
export type MenuEntry = MenuActionDef | MenuLinkDef | MenuCheckboxDef | MenuRadioGroupDef | MenuSubmenuDef | MenuGroupDef | "separator";
/** @deprecated desde 28/08/2026 — use `MenuEntry`. Mantido porque `MenuActionDef` É a forma
 *  antiga: quem tipava com `MenuItemDef` continua compilando. */
export type MenuItemDef = MenuActionDef;
export declare function DropdownMenu({ trigger, items, side, label }: {
    trigger: ReactElement;
    items: MenuEntry[];
    side?: OverlaySide;
    label?: string;
}): React.JSX.Element;
export declare function ContextMenu({ children, items, label, className }: {
    children: ReactNode;
    items: MenuEntry[];
    label?: string;
    className?: string;
}): React.JSX.Element;
export type MenubarOrientation = "horizontal" | "vertical";
export declare function Menubar({ menus, label, modal, disabled, loopFocus, orientation, className }: {
    menus: Array<{
        label: ReactNode;
        items: MenuEntry[];
        disabled?: boolean;
    }>;
    label?: string;
    modal?: boolean;
    disabled?: boolean;
    loopFocus?: boolean;
    orientation?: Responsive<MenubarOrientation>;
    className?: string;
}): React.JSX.Element;
export {};
