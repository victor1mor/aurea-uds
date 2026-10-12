import * as React from "react";
import { type AureaIcon } from "./icon.js";
/** O lado do gatilho onde a camada abre. FÍSICO, como o `OverlaySide` da web. */
export type AureaOverlaySide = "top" | "right" | "bottom" | "left";
export interface PopoverProps {
    /** O elemento que abre — um `Button`, um `IconButton`. O toque dele continua valendo. */
    trigger: React.ReactElement;
    /** O título: 18 em peso médio, anunciado como cabeçalho. */
    title?: React.ReactNode;
    /** O corpo. Texto solto sai como a descrição da referência: 16, esmaecido. */
    children: React.ReactNode;
    /** O lado do gatilho. Vira sozinho quando não cabe. */
    side?: AureaOverlaySide;
    /** A seta apontando para o gatilho. */
    arrow?: boolean;
    /** Só do nativo, como nos outros sobrepostos: `-fundo` e `-painel` marcam as duas peças. */
    testID?: string;
}
/**
 * A janela pequena presa ao gatilho: abre no toque, fecha no toque fora e no VOLTAR.
 *
 * ⚠ **Sem papel de diálogo**, pela razão medida no `overlays.tsx`: `role="dialog"` não mapeia em
 * plataforma nenhuma. O confinamento do leitor de tela vem do `Modal`, que é uma janela do sistema;
 * o nome vem do título, que é um cabeçalho. No iOS, o gesto de saída do VoiceOver fecha.
 */
export declare function Popover({ trigger, title, children, side, arrow, testID }: PopoverProps): React.JSX.Element;
interface MenuItemBase {
    label: React.ReactNode;
    disabled?: boolean;
    leadingIcon?: AureaIcon;
}
/** Item de ação. `kind` é opcional, como na web. */
export interface MenuActionDef extends MenuItemBase {
    kind?: "item";
    onClick?: () => void;
    /**
     * Só do nativo: o item que DESTRÓI dado, com o texto e o toque no tom de perigo — o `danger` do
     * item da referência. A web ainda não tem o campo.
     */
    destructive?: boolean;
}
/** Item que abre um endereço — no aparelho, pelo `Linking`. Sem `disabled`, como na web. */
export interface MenuLinkDef {
    kind: "link";
    label: React.ReactNode;
    leadingIcon?: AureaIcon;
    href: string;
    /** Fechar ao tocar. Padrão `true`, como na web. */
    closeOnClick?: boolean;
}
/** Item que ALTERNA. Controlado (`checked`) ou não (`defaultChecked`). O menu fica aberto. */
export interface MenuCheckboxDef extends MenuItemBase {
    kind: "checkbox";
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
/** Opções mutuamente exclusivas. Escolher fecha o menu, como a escolha única da referência. */
export interface MenuRadioGroupDef {
    kind: "radiogroup";
    label?: React.ReactNode;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    items: Array<{
        value: string;
        label: React.ReactNode;
        disabled?: boolean;
        leadingIcon?: AureaIcon;
    }>;
}
/** Submenu: abre NO LUGAR, dentro do painel. `items` aninha a mesma união. */
export interface MenuSubmenuDef extends MenuItemBase {
    kind: "submenu";
    items: MenuEntry[];
}
/** Seção rotulada. O rótulo não é item: não se toca. */
export interface MenuGroupDef {
    kind: "group";
    label?: React.ReactNode;
    items: MenuEntry[];
}
export type MenuEntry = MenuActionDef | MenuLinkDef | MenuCheckboxDef | MenuRadioGroupDef | MenuSubmenuDef | MenuGroupDef | "separator";
export interface DropdownMenuProps {
    trigger: React.ReactElement;
    items: MenuEntry[];
    side?: AureaOverlaySide;
    /** O nome do menu para o leitor de tela. */
    label?: string;
    testID?: string;
}
/**
 * O menu de comandos preso ao gatilho.
 *
 * O estado de quem alterna sem ser controlado (`defaultChecked`, `defaultValue`) mora AQUI, e não no
 * painel: o painel desmonta ao fechar, e o item marcado tem de continuar marcado na próxima vez.
 */
export declare function DropdownMenu({ trigger, items, side, label, testID }: DropdownMenuProps): React.JSX.Element;
export {};
