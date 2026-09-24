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
export interface TextProps extends TextPropsRN {
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
export declare function Text({ size, weight, font, tone, leading, italic, align, tracking, style, ...rest }: TextProps): React.JSX.Element;
