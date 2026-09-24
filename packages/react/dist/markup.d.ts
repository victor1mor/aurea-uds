import React, { type HTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode, type RefAttributes, type TextareaHTMLAttributes } from "react";
import { type Responsive } from "./pure.js";
import type { ComponentSize } from "./actions.js";
export type BadgeVariant = "neutral" | "primary" | "info" | "success" | "warning" | "danger" | "running" | "paused" | "offline" | "review";
export type AvatarSize = "sm" | "md" | "lg";
export type TopbarVariant = "floating" | "flush" | "pill";
type CardBase = HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    padding?: "normal" | "none";
    orientation?: "vertical" | "horizontal";
};
export type CardProps = CardBase & ({
    variant?: "base" | "raised" | "inset" | "selected" | "danger";
    render?: ReactElement;
} | {
    variant: "interactive";
    render: ReactElement;
});
export declare function Card({ variant, padding, orientation, className, render, ...props }: CardProps): ReactElement<unknown, string | React.JSXElementConstructor<any>>;
export declare namespace Card {
    export { CardMedia as Media };
}
/** A mídia do cartão — a primeira das partes da especificação do `Card` (A-14). No vertical,
 *  primeira filha, ela SANGRA até a borda de cima e dos lados; no horizontal, fica à esquerda com a
 *  largura de miniatura, dentro do respiro, com o raio que sai da conta da casa (ADR-0033: raio do
 *  cartão menos o respiro dele). O que vai dentro — `Image`, vídeo — é do app. */
declare function CardMedia({ className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>): React.JSX.Element;
export type LayoutGap = "tight" | "normal" | "loose";
export type StackAlign = "start" | "center" | "end" | "stretch";
export type ClusterAlign = "start" | "center" | "end" | "baseline";
export type ClusterJustify = "start" | "center" | "end" | "between";
type DivProps = HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>;
export interface StackProps extends DivProps {
    /** `tight` (--space-2), `normal` (o de sempre, --space-4) ou `loose` (--space-6). */
    gap?: LayoutGap;
    /** Eixo cruzado. Padrão `stretch`: os filhos ocupam a largura, como sempre. */
    align?: StackAlign;
}
export declare function Stack({ gap, align, className, ...props }: StackProps): React.JSX.Element;
export interface ClusterProps extends DivProps {
    /** `tight` (--space-2), `normal` (o de sempre, --space-3) ou `loose` (--space-6). */
    gap?: LayoutGap;
    /** Eixo cruzado (o vertical). Padrão `center`, como sempre. */
    align?: ClusterAlign;
    /** Eixo principal. `between` espalha o que sobrar: o nome à esquerda, o botão à direita. */
    justify?: ClusterJustify;
    /** Padrão `true`: a fila quebra linha. `false` mantém tudo numa linha só. */
    wrap?: boolean;
}
export declare function Cluster({ gap, align, justify, wrap, className, ...props }: ClusterProps): React.JSX.Element;
export interface GridProps extends DivProps {
    /** `tight` (--space-2), `normal` (o de sempre, --space-4) ou `loose` (--space-6). */
    gap?: LayoutGap;
    /**
     * Largura mínima de cada coluna, em unidade de CSS (`"10rem"`, `"155px"`). Padrão `15rem`. É o
     * `--grid-min` que o CSS sempre leu e que nenhum tipo mostrava.
     */
    min?: string;
    /** Número fixo de colunas, iguais. Com ele, `min` deixa de valer. */
    columns?: number;
}
export declare function Grid({ gap, min, columns, className, style, ...props }: GridProps): React.JSX.Element;
export declare function KPI({ label, value, trend, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    label: ReactNode;
    value: ReactNode;
    trend?: ReactNode;
}): React.JSX.Element;
export declare function DataList({ items }: {
    items: Array<{
        term: ReactNode;
        value: ReactNode;
    }>;
}): React.JSX.Element;
export declare function Timeline({ items }: {
    items: Array<{
        title: ReactNode;
        description?: ReactNode;
        time?: ReactNode;
    }>;
}): React.JSX.Element;
export declare function Prose({ className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>): React.JSX.Element;
export type BadgeEmphasis = "soft" | "solid" | "outline";
export type BadgeSize = "xs" | "sm" | "md" | "lg";
export type BadgePlacement = "top-end" | "top-start" | "bottom-end" | "bottom-start";
export type BadgeFit = "auto" | "content";
export declare function formatBadgeCount(count: number, max?: number): string;
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, RefAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    /** `soft` é o tom de sempre; `solid` preenche com o acento; `outline` é só contorno. */
    emphasis?: BadgeEmphasis;
    size?: BadgeSize;
    /** Ponto de estado antes do texto. Sozinho num `anchor`, ele É o badge. */
    dot?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Foto redonda no início — o `BadgeWithImage` da referência. */
    image?: string;
    imageAlt?: string;
    /** Conteúdo numérico. Passa por `max` e some em zero, salvo `showZero`. */
    count?: number;
    max?: number;
    showZero?: boolean;
    /** `content`: do tamanho do texto mesmo numa coluna. Padrão `auto`, que segue o recipiente. */
    fit?: BadgeFit;
    /** Liga o modo SOBREPOSTO e escolhe o canto. `children` passa a ser o que se decora. */
    anchor?: BadgePlacement;
    /** `circle` recolhe o canto em 14% — é o `overlap` da MUI, para avatar redondo. */
    anchorShape?: "square" | "circle";
    /** Esconde sem tirar o filho do lugar. */
    invisible?: boolean;
    /** Conteúdo do badge no modo sobreposto (no modo chip, quem manda é `children`).
     *  Nome da MUI, e não `content`: este colide com o atributo HTML de mesmo nome. */
    badgeContent?: ReactNode;
}
export declare function Badge({ variant, emphasis, size, dot, leading, trailing, image, imageAlt, count, max, showZero, fit, anchor, anchorShape, invisible, badgeContent, children, className, ...props }: BadgeProps): React.JSX.Element;
export declare function Progress({ value, label }: {
    value: number;
    label?: string;
}): React.JSX.Element;
export declare function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>): React.JSX.Element;
export declare function AvatarGroup({ children, max, total, label, size, className }: {
    children: ReactNode;
    max?: number;
    total?: number;
    label?: string;
    size?: Responsive<AvatarSize>;
    className?: string;
}): React.JSX.Element;
export declare function LogStream({ lines }: {
    lines: Array<{
        time?: string;
        level?: string;
        text: string;
    }>;
}): React.JSX.Element;
export declare function MediaPlayerShell({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>): React.JSX.Element;
export declare function Topbar({ variant, divider, brand, children, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    variant?: TopbarVariant;
    brand?: ReactNode;
    divider?: boolean;
}): React.JSX.Element;
export declare function Kbd({ children, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>): React.JSX.Element;
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, RefAttributes<HTMLTextAreaElement> {
    size?: Responsive<FieldSize>;
}
export declare const Textarea: React.ForwardRefExoticComponent<Omit<TextareaProps, "ref"> & RefAttributes<HTMLTextAreaElement>>;
export declare function Checkbox({ label, labelHidden, description, size, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & RefAttributes<HTMLInputElement> & {
    label: ReactNode;
    labelHidden?: boolean;
    description?: ReactNode;
    size?: Responsive<FieldSize>;
}): React.JSX.Element;
export declare function Radio({ label, size, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & RefAttributes<HTMLInputElement> & {
    label: ReactNode;
    size?: Responsive<FieldSize>;
}): React.JSX.Element;
export declare function Switch({ label, size, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & RefAttributes<HTMLInputElement> & {
    label: ReactNode;
    size?: Responsive<FieldSize>;
}): React.JSX.Element;
export type RangeOrientation = "horizontal" | "vertical";
export declare function Range({ orientation, className, ...props }: InputHTMLAttributes<HTMLInputElement> & RefAttributes<HTMLInputElement> & {
    orientation?: Responsive<RangeOrientation>;
}): React.JSX.Element;
export type FieldSize = Extract<ComponentSize, "sm" | "md" | "lg">;
export declare function Label({ htmlFor, className, children, ...props }: HTMLAttributes<HTMLLabelElement> & RefAttributes<HTMLLabelElement> & {
    htmlFor?: string;
}): React.JSX.Element;
export type AddonSide = "start" | "end";
export type AddonLayout = "inline" | "block";
export declare function InputGroup({ className, children, width, style, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    width?: string;
}): React.JSX.Element;
export declare function InputGroupAddon({ side, layout, className, children, ...props }: HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement> & {
    side?: AddonSide;
    layout?: Responsive<AddonLayout>;
}): React.JSX.Element;
export declare function AspectRatio({ ratio, className, style, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    ratio?: number;
}): React.JSX.Element;
export {};
