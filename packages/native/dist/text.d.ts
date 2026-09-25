import * as React from "react";
import { type TextProps as TextPropsRN } from "react-native";
/** A escala dos tokens (`--text-xs` … `--text-5xl`). `md` é o corpo, como no `body` da web. */
export type AureaTextSize = "xs" | "sm" | "md" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
/** Os quatro pesos que o pacote de fontes entrega. Ver ADR-0039: cada peso é uma FAMÍLIA. */
export type AureaTextWeight = 400 | 500 | 600 | 700;
/** Papel de tipografia — os três `--font-*` da Aurea. */
export type AureaTextFont = "ui" | "editorial" | "code";
/** O que a cor SIGNIFICA. Mesmo vocabulário do `tone` do Button (ADR-0044). */
export type AureaTextTone = "default" | "muted" | "subtle" | "primary" | "link" | "danger" | "success" | "warning" | "info";
export type AureaTextLeading = "none" | "tight" | "normal" | "relaxed";
/**
 * O PAPEL do texto — B-02, 25/09/2026, no molde do `Typography` do HeroUI Native 1.0.10. Uma lista
 * fechada: título 1–6, texto, texto pequeno, texto mínimo e código.
 */
export type AureaTextType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "body-sm" | "body-xs" | "code";
export interface TextProps extends TextPropsRN {
    /**
     * O papel (B-02). Dá tamanho, peso, entrelinha e fonte de uma vez, com os números do HeroUI
     * Native — os MESMOS da web, sem o degrau a mais do `size`. Uma opção solta passada junto
     * (`size`, `weight`…) continua valendo por cima dele.
     */
    type?: AureaTextType;
    size?: AureaTextSize;
    weight?: AureaTextWeight;
    font?: AureaTextFont;
    tone?: AureaTextTone;
    leading?: AureaTextLeading;
    /** Só o papel `ui` tem itálico no pacote de fontes; nos outros isto não tem efeito. */
    italic?: boolean;
    align?: "auto" | "left" | "right" | "center";
    /** Aplica o `tracking` do token. É RAZÃO de `em`: multiplicado pelo `fontSize` aqui dentro. */
    tracking?: "tight" | "normal" | "wide" | "wider" | "widest";
}
/**
 * Texto da Aurea. Sem provider acima, `useAureaTokens` levanta — de propósito: um padrão
 * silencioso aqui desenharia o app inteiro no tema errado sem nada acusar.
 *
 * ⚠ **`fontWeight` não aparece em lugar nenhum deste arquivo, e isso é a ADR-0039.** No IBM Plex
 * só Regular, Italic e Bold moram na família "IBM Plex Sans"; Medium e SemiBold são famílias
 * próprias. Pedir peso 600 por `fontWeight` devolveria o Regular sintetizado — **em silêncio**.
 * Quem escolhe a fonte aqui é o `fontFamily`, com o nome PostScript que o provider já resolveu.
 */
export declare function Text({ type, size, weight: pesoPedido, font: fontePedida, tone, leading, italic, align, tracking: trackingPedido, style, ...rest }: TextProps): React.JSX.Element;
export type AureaTypographyColor = "default" | "muted";
export type AureaTypographyWeight = "normal" | "medium" | "semibold" | "bold";
export type AureaTypographyAlign = "start" | "center" | "end" | "justify";
interface AureaTypographyBase extends Omit<TextPropsRN, "children"> {
    color?: AureaTypographyColor;
    weight?: AureaTypographyWeight;
    /** `start`/`end` viram `left`/`right`, que o React Native já espelha em RTL (nota do HeroUI Native). */
    align?: AureaTypographyAlign;
    /** Uma linha só, cortada com reticências (`numberOfLines={1}`). */
    truncate?: boolean;
    children?: React.ReactNode;
}
export interface HeadingProps extends AureaTypographyBase {
    type?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}
/** Título. Marca `accessibilityRole="header"` sozinho, como o HeroUI Native. */
export declare function Heading({ type, accessibilityRole, ...rest }: HeadingProps): React.JSX.Element;
export interface ParagraphProps extends AureaTypographyBase {
    type?: "body" | "body-sm" | "body-xs";
}
/** Parágrafo de texto corrido, em três tamanhos: 16, 14 e 12. */
export declare function Paragraph({ type, ...rest }: ParagraphProps): React.JSX.Element;
export type CodeProps = AureaTypographyBase;
/** Um trecho curto de código no meio da frase, com a fonte mono e o fundo do `code` da web. */
export declare function Code(props: CodeProps): React.JSX.Element;
export {};
