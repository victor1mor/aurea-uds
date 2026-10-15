import { type Responsive } from "./pure.js";
import React, { type HTMLAttributes, type RefAttributes, type ReactNode } from "react";
import { type UniversalState } from "./internal.js";
import { type IconName } from "./system.js";
import { type OverlaySide } from "./overlays.js";
export type StatusVariant = "neutral" | "online" | "offline" | "busy" | "away" | "running" | "success" | "warning" | "danger" | "info";
export declare function Status({ variant, state, children, className, ...props }: HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement> & {
    variant?: StatusVariant;
    state?: UniversalState;
}): React.JSX.Element;
export type AlertVariant = "info" | "success" | "warning" | "danger" | "accent";
export declare function Alert({ variant, state, title, icon, onDismiss, action, children, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    variant?: AlertVariant;
    state?: UniversalState;
    title?: ReactNode;
    icon?: IconName;
    onDismiss?: () => void;
    /** O botão do aviso ("Atualizar", "Desfazer"): depois do texto, antes do X. No celular, embaixo do texto. */
    action?: ReactNode;
}): React.JSX.Element;
export type BannerVariant = "info" | "success" | "warning" | "danger";
export declare function Banner({ variant, state, title, icon, onDismiss, children, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    variant?: BannerVariant;
    state?: UniversalState;
    title?: ReactNode;
    icon?: IconName;
    onDismiss?: () => void;
}): React.JSX.Element;
export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export declare function Spinner({ size, label, decorative, className, ...props }: HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement> & {
    size?: Responsive<SpinnerSize>;
    label?: string;
    decorative?: boolean;
}): React.JSX.Element;
export type DataStateValue = "loading" | "error" | "empty" | UniversalState;
export type DataStateProps = HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    state?: DataStateValue;
    message?: ReactNode;
    skeleton?: ReactNode;
    emptyTitle?: ReactNode;
    emptyIcon?: IconName;
    action?: ReactNode;
    children: ReactNode | (() => ReactNode);
    /** A barreira de erro (MNT-25): o que quebrar ao desenhar o conteúdo vira a cara de erro, com "Tentar de novo". */
    catchErrors?: boolean;
    /** Recebe o erro que a barreira pegou — para o app registrar. */
    onCatch?: (error: unknown, info: React.ErrorInfo) => void;
};
export declare function DataState({ catchErrors, onCatch, ...props }: DataStateProps): React.JSX.Element;
export declare function EmptyState({ icon, title, titleAs: TitleTag, description, action, state }: {
    icon?: IconName;
    title: ReactNode;
    titleAs?: "h2" | "h3" | "h4" | "p";
    description?: ReactNode;
    action?: ReactNode;
    state?: UniversalState;
}): React.JSX.Element;
export interface NotificationItem {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    time?: ReactNode;
    icon?: IconName;
    read?: boolean;
    group?: string;
    onClick?: () => void;
}
export declare function NotificationCenter({ items, onItemClick, onMarkAllRead, label, icon, side }: {
    items: NotificationItem[];
    onItemClick?: (item: NotificationItem) => void;
    onMarkAllRead?: () => void;
    label?: string;
    icon?: IconName;
    side?: OverlaySide;
}): React.JSX.Element;
