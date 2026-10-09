import React, { type HTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode, type RefAttributes, type TextareaHTMLAttributes } from "react";
import { type Responsive } from "./pure.js";
import type { ComponentSize } from "./actions.js";
import type { SidebarItem } from "./navigation-client.js";
export type BadgeCategory = "red" | "orange" | "green" | "teal" | "cyan" | "blue" | "violet" | "pink";
export type BadgeVariant = "neutral" | "primary" | "info" | "success" | "warning" | "danger" | "running" | "paused" | "offline" | "review" | BadgeCategory;
export type AvatarSize = "sm" | "md" | "lg";
export type HeaderVariant = "floating" | "flush" | "pill";
/** @deprecated `Topbar` é o nome antigo do `Header` (07/10/2026). O tipo continua valendo; use `HeaderVariant`. */
export type TopbarVariant = HeaderVariant;
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
/**
 * A largura mínima da coluna, por nome — AN-08 (03/10/2026). A referência não tem `Grid`, e nenhum dos
 * quatro números é novo: cada um já mede uma grade ou uma caixa da Aurea (ver `.grid-min-*` no CSS).
 * `md` é o padrão de sempre.
 */
export type GridMin = "xs" | "sm" | "md" | "lg";
export interface GridProps extends DivProps {
    /** `tight` (--space-2), `normal` (o de sempre, --space-4) ou `loose` (--space-6). */
    gap?: LayoutGap;
    /**
     * Largura mínima de cada coluna. Por nome (AN-08): `xs` 8rem, `sm` 12rem, `md` 15rem (o padrão)
     * ou `lg` 20rem. Ou em unidade de CSS (`"10rem"`, `"155px"`) — o `--grid-min` que o CSS sempre
     * leu. Até a 0.17, `"sm"` passava pelo tipo e a grade virava UMA coluna, sem aviso.
     */
    min?: GridMin | (string & {});
    /** Número fixo de colunas, iguais. Com ele, `min` deixa de valer. */
    columns?: number;
}
export declare function Grid({ gap, min, columns, className, style, ...props }: GridProps): React.JSX.Element;
export declare namespace Grid {
    export { GridItem as Item };
}
/**
 * Quantas colunas da grade o item ocupa — GAR-03 (06/10/2026). Texto, e não número, porque é o
 * valor de um eixo responsivo, como `size` e `orientation`.
 */
export type GridSpan = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
export interface GridItemProps extends DivProps {
    /**
     * Quantas colunas o item ocupa (GAR-03). Com `<Grid columns={12}>` é o "7 de 12" de página de
     * site. Responsivo, mobile-first: `{base: "12", viewport: {md: "7"}}` ocupa a linha inteira no
     * estreito e 7 de 12 a partir do `md`. Sem `span`, uma coluna, como qualquer filho de grade.
     */
    span?: Responsive<GridSpan>;
}
/** O item da grade que sabe quantas colunas ocupa (GAR-03). Mora em `Grid.Item`, como `Card.Media`. */
declare function GridItem({ span, className, ...props }: GridItemProps): React.JSX.Element;
/** A largura máxima do `Container`, pelos nomes da escala de pontos. `xl` (1280) é o padrão. */
export type ContainerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export interface ContainerProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    /** Até onde o conteúdo cresce: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 (padrão) · `2xl` 1536 · `full` sem teto. */
    size?: ContainerSize;
}
/**
 * A largura de leitura de uma página de SITE: centrada, com teto e o respiro dos lados que cresce
 * com a tela (16 no estreito, 32 a partir do `md`). É o que vai DENTRO de uma `Section`. O painel
 * de aplicativo continua sendo o `AppShell`.
 */
export declare function Container({ size, className, ...props }: ContainerProps): React.JSX.Element;
/** O fundo da faixa: o da página (padrão), o de cartão ou o rebaixado. */
export type SectionSurface = "background" | "card" | "inset";
/** `base` é a faixa comum; `footer` é o rodapé do site (GAR-06, 07/10/2026). */
export type SectionVariant = "base" | "footer";
/** Uma coluna de links do rodapé: o título e os itens. */
export interface SectionFooterGroup {
    title: ReactNode;
    items: SidebarItem[];
}
/** O respiro de cima e de baixo: `md` (padrão, 64 e 96 a partir do `md`) ou `sm` (32 e 48). */
export type SectionSpacing = "sm" | "md";
export interface SectionProps extends HTMLAttributes<HTMLElement>, RefAttributes<HTMLElement> {
    surface?: SectionSurface;
    spacing?: SectionSpacing;
    /**
     * Um tema só para esta faixa (GAR-05): `"dark"` faz uma faixa escura dentro de uma página clara,
     * e o contrário. Fundo, letra e peças de dentro seguem o tema da faixa, e as regras de tema da
     * página não vazam para dentro dela.
     */
    theme?: "light" | "dark";
    /**
     * `footer` faz da faixa o RODAPÉ do site (GAR-06): `<footer>` com a marca, as colunas de links e a
     * linha legal, e o miolo já num `Container`. No celular, tudo empilha.
     */
    variant?: SectionVariant;
    /** Só no `footer`: a marca e uma frase curta, no alto à esquerda. */
    brand?: ReactNode;
    /** Só no `footer`: as colunas de links, cada uma com título. Os itens são `SidebarItem` (`id`, `label`, `href`, `render`). */
    links?: SectionFooterGroup[];
    /** Só no `footer`: a linha de baixo — direitos, termos, privacidade. */
    legal?: ReactNode;
    /** Só no `footer`: até onde o miolo cresce, pela escala do `Container`. Padrão: `xl`. */
    maxWidth?: ContainerSize;
    /** Só no `footer`: o nome da navegação do rodapé para o leitor de tela. Padrão: `"Footer"`. */
    navLabel?: string;
}
/**
 * A faixa de ponta a ponta de uma página de site (GAR-04): `<section>` com fundo e respiro de site.
 * O conteúdo vai dentro de um `Container`. Dê um nome à faixa (`aria-labelledby` no título dela)
 * quando ela for uma região que o leitor de tela deva listar.
 */
export declare function Section({ surface, spacing, theme, variant, brand, links, legal, maxWidth, navLabel, children, className, ...props }: SectionProps): React.JSX.Element;
export type KPIDirection = "up" | "down" | "flat";
export type KPITone = "success" | "danger" | "neutral";
export type KPIVariant = "card" | "plain";
export interface KPIProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    label: ReactNode;
    value: ReactNode;
    /** A mudança, como texto do domínio ("+8% no mês"). */
    trend?: ReactNode;
    /** Para onde foi. Desenha a seta, pinta a tendência e diz a palavra ao leitor de tela. */
    direction?: KPIDirection;
    /** A cor da tendência. Padrão: alta = `success`, baixa = `danger`, estável = `neutral`. */
    tone?: KPITone;
    /** A palavra que o leitor de tela ouve antes da tendência. Padrão em inglês: "Up", "Down", "No change". */
    directionLabel?: string;
    /** `plain` tira a caixa: o número dentro de um cartão que já existe. */
    variant?: KPIVariant;
}
export declare function KPI({ label, value, trend, direction, tone, directionLabel, variant, className, ...props }: KPIProps): React.JSX.Element;
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
export type TypographyType = "body" | "body-sm" | "body-xs" | "code" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TypographyColor = "default" | "muted";
export type TypographyWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold";
export type TypographyAlign = "start" | "center" | "end" | "justify";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type ParagraphSize = "base" | "sm" | "xs";
interface TypographyBase {
    align?: TypographyAlign;
    color?: TypographyColor;
    weight?: TypographyWeight;
    truncate?: boolean;
    /** GAR-16 (0.28.0): algarismos da mesma largura — para número que alinha em coluna (preço, ano,
     *  ficha técnica) ou que muda na tela. Desligado por padrão: no texto corrido o "1" estreito é o certo. */
    numeric?: boolean;
}
export interface TextProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color">, RefAttributes<HTMLSpanElement>, TypographyBase {
    type?: TypographyType;
}
export declare function Text({ type, align, color, weight, truncate, numeric, className, ...props }: TextProps): React.JSX.Element;
export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, "color">, RefAttributes<HTMLHeadingElement>, TypographyBase {
    level?: HeadingLevel;
}
export declare function Heading({ level, align, color, weight, truncate, numeric, className, ...props }: HeadingProps): React.JSX.Element;
export interface ParagraphProps extends Omit<HTMLAttributes<HTMLParagraphElement>, "color">, RefAttributes<HTMLParagraphElement>, TypographyBase {
    size?: ParagraphSize;
}
export declare function Paragraph({ size, align, color, weight, truncate, numeric, className, ...props }: ParagraphProps): React.JSX.Element;
export interface CodeProps extends Omit<HTMLAttributes<HTMLElement>, "color">, RefAttributes<HTMLElement>, TypographyBase {
}
export declare function Code({ align, color, weight, truncate, className, ...props }: CodeProps): React.JSX.Element;
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
    /** Foto redonda no início — o selo com imagem da referência. */
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
    /** `circle` recolhe o canto em 14% — é a sobreposição circular da referência, para avatar redondo. */
    anchorShape?: "square" | "circle";
    /** Esconde sem tirar o filho do lugar. */
    invisible?: boolean;
    /** Conteúdo do badge no modo sobreposto (no modo chip, quem manda é `children`).
     *  Chama-se assim, e não `content`, porque este colide com o atributo HTML de mesmo nome. */
    badgeContent?: ReactNode;
}
export declare function Badge({ variant, emphasis, size, dot, leading, trailing, image, imageAlt, count, max, showZero, fit, anchor, anchorShape, invisible, badgeContent, children, className, ...props }: BadgeProps): React.JSX.Element;
/** O tom da barra: a mesma lista fechada do `ButtonTone`. Pausado é `neutral`; falha é `danger`. */
export type ProgressTone = "brand" | "neutral" | "success" | "warning" | "danger" | "info";
export interface ProgressProps {
    /** 0 a 100; fora disso é grampeado. **Sem `value`, a barra é indeterminada** (AN-07): o total
     *  ainda não se sabe, e um pedaço corre pelo trilho, no lugar de um 0% que parece parado. */
    value?: number;
    /** O nome que o leitor de tela anuncia. Não aparece. */
    label?: string;
    /** O texto de apoio, no alto à direita — a saída de texto da barra de progresso da referência: velocidade, tempo
     *  que falta, bytes. Em texto, vai junto no `aria-valuetext`. */
    detail?: ReactNode;
    tone?: ProgressTone;
    className?: string;
}
export declare function Progress({ value, label, detail, tone, className }: ProgressProps): React.JSX.Element;
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
export interface HeaderProps extends HTMLAttributes<HTMLElement>, RefAttributes<HTMLElement> {
    /** A pele: `floating` (caixa solta), `flush` (encostada, o fundo da página) ou `pill` (cápsula). */
    variant?: HeaderVariant;
    /** A marca. No `AppShell`, é aqui que entra também o botão que abre a lateral. */
    brand?: ReactNode;
    /** Só na `flush` (B-07): a linha embaixo da barra. */
    divider?: boolean;
    /**
     * Os links do site (GAR-01) — a mesma lista do `Sidebar` e do `BottomNav`. No celular (abaixo
     * de 768) eles saem da barra e entram no painel do botão de menu.
     */
    items?: SidebarItem[];
    /** O `id` do item da página atual: ganha `aria-current="page"` e a cor de destaque. */
    current?: string;
    /** O que fica do lado direito: busca, botão de ação, conta. Fica na barra também no celular. */
    actions?: ReactNode;
    /** Até onde o miolo da barra cresce, pela escala do `Container` (`sm` 640 … `2xl` 1536, `full`). */
    maxWidth?: ContainerSize;
    /** O nome da navegação para o leitor de tela. Padrão: `"Main"`. */
    navLabel?: string;
    /** O nome do botão de menu do celular. Padrão: `"Menu"`. */
    menuLabel?: string;
    /** O `id` do painel do celular. Padrão: `"aurea-header-menu"`. Troque só se a página tiver dois cabeçalhos de site. */
    menuId?: string;
}
export declare function Header({ variant, divider, brand, items, current, actions, maxWidth, navLabel, menuLabel, menuId, children, className, ...props }: HeaderProps): React.JSX.Element;
/** @deprecated `Topbar` é o nome antigo do `Header` (07/10/2026). Continua funcionando, igual; use `Header`. */
export declare function Topbar(props: HeaderProps): React.JSX.Element;
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
