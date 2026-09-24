import * as React from "react";
import { type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type IconName } from "./icon.js";
import { type AureaUniversalState } from "./strings.js";
export type AureaSpinnerSize = "sm" | "md" | "lg";
export interface SpinnerProps {
    /** `sm` é o padrão, como na web (`.spinner` sem modificador usa `--icon-sm`). */
    size?: AureaSpinnerSize;
    /** O que o leitor de tela anuncia. Sem ele, a frase `loading` do provider. */
    label?: string;
    /** Decorativo: some da árvore de acessibilidade. Use quando há texto ao lado dizendo o mesmo. */
    decorative?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O anel que gira. **700 ms, linear** — o mesmo `.7s linear` do `aurea.css:670`.
 *
 * ⚠ **Ele para quando a pessoa pede menos movimento.** Na web a regra global de
 * `prefers-reduced-motion` já fazia isso; aqui é o componente que pergunta, porque não há
 * cascata para fazê-lo por ele. Parado, o anel continua desenhado — quem precisa da informação
 * "algo está acontecendo" continua vendo o rótulo.
 */
export declare function Spinner({ size, label, decorative, style, testID }: SpinnerProps): React.JSX.Element;
export interface SkeletonProps {
    /** Padrão: ocupa a largura disponível. */
    width?: number | `${number}%`;
    /** Padrão: a altura de uma linha de texto (`--space-4`). */
    height?: number;
    radius?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * A caixa cinza que pulsa enquanto o dado não chega.
 *
 * ⚠ **A API é DIFERENTE da web, e a plataforma obriga.** Lá o `Skeleton` recebe `className` e
 * `style` e a página decide o tamanho no CSS. No React Native não há classe: se o componente não
 * aceitar medida, todo consumidor escreve o mesmo `style` inline. Então `width`/`height`/`radius`
 * são props — e continuam aceitando `style` para o resto.
 *
 * Ele é **invisível para o leitor de tela** (`aria-hidden` na web, `accessibilityElementsHidden`
 * aqui): anunciar "caixa" três vezes enquanto a tela carrega não ajuda ninguém.
 */
export declare function Skeleton({ width, height, radius, style, testID }: SkeletonProps): React.JSX.Element;
export interface ProgressProps {
    /** 0 a 100. Fora disso é grampeado, como na web (`Math.max(0, Math.min(100, value))`). */
    value: number;
    label?: string;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * A barra determinada. Só ela — **não há variante indeterminada**, nem na web.
 *
 * O papel é `progressbar` e o valor vai no `accessibilityValue`: sem isso o leitor de tela
 * anuncia que existe uma barra e não diz em quanto ela está, que é a única informação que ela tem.
 */
export declare function Progress({ value, label, style, testID }: ProgressProps): React.JSX.Element;
export type AureaAlertVariant = "info" | "success" | "warning" | "danger";
/** Mesmos quatro glifos do `feedback-client.tsx:43`. */
export declare const ICONE_DA_VARIANTE: Readonly<Record<AureaAlertVariant, IconName>>;
export interface AlertProps extends ViewProps {
    variant?: AureaAlertVariant;
    /** Um dos sete estados universais. Ele **escolhe a variante** e escreve o texto padrão. */
    state?: AureaUniversalState;
    title?: React.ReactNode;
    icon?: IconName;
    onDismiss?: () => void;
    children?: React.ReactNode;
}
/**
 * O aviso em linha.
 *
 * ⚠ **`danger` é `role="alert"`; o resto é `status`.** Vem do fonte da web
 * (`feedback-client.tsx:59`), e a diferença importa: `alert` interrompe o leitor de tela, `status`
 * espera a vez. Um aviso informativo que interrompe é um aviso que ensina a pessoa a ignorar
 * avisos.
 *
 * ⚠ **O ícone precisa estar no registro.** Os quatro glifos de variante não são importados por
 * este módulo — seria trazer ícone ao grafo do bundler pelas costas do consumidor, que é a
 * cláusula 4 da ADR-0038. Registre-os:
 *
 *     import InformationFilled from "@aurea-uds/native/icons/information--filled";
 *     const ICONES = criarRegistroDeIcones({"information--filled": InformationFilled, …});
 */
export declare function Alert({ variant, state, title, icon, onDismiss, children, style, accessibilityLabel, accessibilityHint, ...rest }: AlertProps): React.JSX.Element;
export interface EmptyStateProps {
    icon?: IconName;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    state?: AureaUniversalState;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O nada, dito com jeito.
 *
 * ⚠ **Não há `titleAs`, e a razão é a plataforma, não um corte.** Na web ele existe para escolher
 * entre `h2`/`h3`/`h4`/`p` e não saltar nível de título no documento — um problema que o
 * `heading-order` do axe pega. **No React Native não há hierarquia de títulos**: um `Text` é um
 * `Text`. A prop não teria efeito, e prop sem efeito é promessa falsa.
 */
export declare function EmptyState({ icon, title, description, action, state, style, testID, }: EmptyStateProps): React.JSX.Element;
export type AureaDataStateValue = "loading" | "error" | "empty" | AureaUniversalState;
export interface DataStateProps extends Omit<ViewProps, "children"> {
    state?: AureaDataStateValue;
    message?: React.ReactNode;
    /** Substitui o esqueleto padrão de `loading`. */
    skeleton?: React.ReactNode;
    emptyTitle?: React.ReactNode;
    emptyIcon?: IconName;
    action?: React.ReactNode;
    /** Função para o conteúdo caro não ser construído enquanto o estado o esconde. */
    children: React.ReactNode | (() => React.ReactNode);
}
/**
 * A região que troca de cara. **Ela não desenha nada próprio** — empilha o que já existe.
 *
 * ⚠ **A regra que não está no CSS e é a mais importante:** os sete estados universais
 * **acompanham** o conteúdo, não o substituem. `stale`, `partial`, `offline` querem dizer que o
 * dado está aí e tem ressalva — esconder o dado seria trocar informação parcial por informação
 * nenhuma. Só `loading`, `error` e `empty` tomam o lugar.
 */
export declare function DataState({ state, message, skeleton, emptyTitle, emptyIcon, action, children, style, ...rest }: DataStateProps): React.JSX.Element;
