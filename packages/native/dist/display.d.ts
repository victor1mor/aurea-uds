import * as React from "react";
import { type ImageSourcePropType, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type AureaUniversalState } from "./strings.js";
export type AureaBadgeTone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";
export type AureaBadgeEmphasis = "soft" | "outline" | "solid";
export type AureaBadgeSize = "xs" | "sm" | "md" | "lg";
export type AureaBadgeAnchor = "top-end" | "top-start" | "bottom-end" | "bottom-start";
/** `auto` segue o recipiente (numa coluna, estica); `content` fica do tamanho do texto. */
export type AureaBadgeFit = "auto" | "content";
/** `count > max ? `${max}+` : String(count)` — a mesma linha do `markup.tsx:140`. */
export declare const formatarContagem: (count: number, max?: number) => string;
export interface BadgeProps extends ViewProps {
    /**
     * O tom. Chama-se `tone` e não `variant`, como no `Button` do Lote 1 — o vocabulário de cor
     * com significado é `tone` em todo o alvo nativo (ADR-0044 é quem separa os dois na web).
     */
    tone?: AureaBadgeTone;
    emphasis?: AureaBadgeEmphasis;
    size?: AureaBadgeSize;
    /** Um ponto antes do texto. Sozinho (sem conteúdo), o selo VIRA o ponto. */
    dot?: boolean;
    /**
     * Conteúdo antes do texto — na prática, um glifo (`<Icon name="checkmark" size="sm" />`).
     *
     * ⚠ **É NÓ e não nome de ícone, e a razão é a mesma da web** (`markup.tsx:126`): o `Icon` vive
     * noutro módulo, e receber o nome obrigaria este arquivo a importá-lo — trazendo o registro de
     * ícones ao grafo de todo app que só quer um selo. É a cláusula 4 da ADR-0038, e é o mesmo
     * desenho que o `Button` ganhou na `0.8.3`.
     *
     * ⚠ **O slot NÃO tinge o que recebe.** Quem passa o glifo escolhe a cor dele.
     */
    leading?: React.ReactNode;
    /** O mesmo, depois do texto. */
    trailing?: React.ReactNode;
    count?: number;
    /** Acima disto o selo mostra `99+`. */
    max?: number;
    /** Por padrão `count === 0` some — caixa zerada não merece um "0" no canto. */
    showZero?: boolean;
    /**
     * `content` põe o selo do tamanho do texto mesmo numa coluna — R-01, 24/09/2026.
     *
     * ⚠ **Não é o padrão, e a razão foi MEDIDA:** numa coluna o selo estica, e na web também —
     * `.stack` não declara `align-items`, então o `.badge` vira item de flex e estica (300 px numa
     * coluna de 300, contra 55 px solto num bloco). Os dois alvos já concordavam; o que faltava era
     * como pedir o contrário.
     *
     * ⚠ **Serve para COLUNA.** Aqui ele vira `alignSelf: "flex-start"`, e numa fila o eixo cruzado
     * é o vertical: o selo subiria para o topo em vez de ficar no meio. Numa fila o selo já tem o
     * tamanho do texto, então não passe `fit` ali.
     */
    fit?: AureaBadgeFit;
    /** Ancora o selo no canto de `children`, em vez de desenhá-lo em linha. */
    anchor?: AureaBadgeAnchor;
    /** O que o selo mostra quando `anchor` está em uso (aí `children` é o que ele decora). */
    badgeContent?: React.ReactNode;
    invisible?: boolean;
    children?: React.ReactNode;
}
export declare function Badge({ tone, emphasis, size, dot, count, max, showZero, leading, trailing, fit, anchor, badgeContent, invisible, children, style, ...rest }: BadgeProps): React.JSX.Element;
export type AureaStatusVariant = "neutral" | "online" | "offline" | "busy" | "away" | "success" | "warning" | "danger" | "info";
export interface StatusProps extends ViewProps {
    variant?: AureaStatusVariant;
    /** Um estado universal escolhe a variante E escreve o texto, como na web. */
    state?: AureaUniversalState;
    children?: React.ReactNode;
}
/**
 * Um ponto e uma palavra.
 *
 * ⚠ **`offline` não é uma cor a menos — é um ponto DIFERENTE.** No CSS ele é vazado: fundo
 * transparente com anel interno (`aurea.css:1071`). É o que separa "está fora" de "está bem",
 * para quem não distingue as duas cores.
 */
export declare function Status({ variant, state, children, style, ...rest }: StatusProps): React.JSX.Element;
export type AureaAvatarSize = "sm" | "md" | "lg";
export interface AvatarProps {
    /** URL ou `require()` de um asset local — as duas formas do `Image` do RN. */
    source?: ImageSourcePropType | string;
    /** Descrição para o leitor de tela. Vazio = decorativo. */
    alt?: string;
    /** O que aparece sem imagem, ou quando ela falha. Iniciais, em geral. */
    fallback?: React.ReactNode;
    size?: AureaAvatarSize;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O retrato redondo.
 *
 * ⚠ **A queda para o `fallback` é a parte que importa, e ela é a mesma da web:** se a imagem
 * falhar em carregar, o componente troca para o conteúdo alternativo — e volta a tentar quando a
 * `source` muda. Sem isso, uma URL quebrada deixa um buraco cinza permanente na lista.
 */
export declare function Avatar({ source, alt, fallback, size, style, testID }: AvatarProps): React.JSX.Element;
export interface KPIProps extends ViewProps {
    label: React.ReactNode;
    value: React.ReactNode;
    trend?: React.ReactNode;
}
/**
 * Um número com nome. **É um `Card`** — medido em `markup.tsx:105`, e não no CSS, que só mostra
 * a coluna.
 *
 * A ficha da web declara `role="group"`, e **o React Native não tem esse papel** — medido na lista
 * de `accessibilityRole`, que vai de `button` a `toolbar` e não inclui `group`. O que ele tem é
 * `accessible`, e ele faz exatamente o que se queria do `group`: o nó inteiro vira UM elemento de
 * acessibilidade, e o leitor anuncia as três linhas juntas em vez de como três textos soltos.
 *
 * Inventar `accessibilityRole="summary"` porque o nome parece próximo seria pior que não ter papel:
 * `summary` tem significado próprio (o resumo de um bloco expansível) e diria uma coisa errada.
 */
export declare function KPI({ label, value, trend, style, ...rest }: KPIProps): React.JSX.Element;
