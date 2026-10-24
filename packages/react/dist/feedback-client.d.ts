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
export type BannerVariant = "info" | "success" | "warning" | "danger" | "consent";
/** Uma categoria de cookies do aviso de consentimento (GAR-19): a chave, o nome, para que serve e se é necessária. */
export interface ConsentCategory {
    /** A chave da categoria na escolha que o `onConsent` devolve. */
    id: string;
    label: ReactNode;
    /** Para que serve: o que a pessoa ganha ou perde ligando. */
    description?: ReactNode;
    /** Necessária para o site funcionar: sempre ligada, sem chave para desligar. */
    required?: boolean;
}
/** A escolha: a chave de cada categoria, ligada ou não. As necessárias vêm sempre ligadas. */
export type ConsentChoice = Record<string, boolean>;
/** Como a pessoa escolheu: aceitou tudo, rejeitou o que não é necessário, ou escolheu na janela. */
export type ConsentAction = "accept-all" | "reject" | "custom";
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title">, RefAttributes<HTMLDivElement> {
    variant?: BannerVariant;
    state?: UniversalState;
    title?: ReactNode;
    icon?: IconName;
    /** Desenha o X. No `consent`, é o botão "Ocultar esta mensagem" da confirmação; sem ele, o aviso some sozinho. */
    onDismiss?: () => void;
    /** Só no `consent`: as categorias da janela de preferências, na ordem em que aparecem. */
    categories?: ConsentCategory[];
    /** Só no `consent`: a escolha que já está guardada — para a pessoa voltar e mudar. Sem ela, só as necessárias ligadas. */
    value?: ConsentChoice;
    /** Só no `consent`: a escolha feita, para o app guardar e obedecer. As necessárias vêm sempre `true`. */
    onConsent?: (choice: ConsentChoice, action: ConsentAction) => void;
}
export declare function Banner(props: BannerProps): React.JSX.Element;
export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export declare function Spinner({ size, label, decorative, className, ...props }: HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement> & {
    size?: Responsive<SpinnerSize>;
    label?: string;
    decorative?: boolean;
}): React.JSX.Element;
export type DataStateValue = "loading" | "error" | "empty" | UniversalState;
export type DataStateProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & RefAttributes<HTMLDivElement> & {
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
