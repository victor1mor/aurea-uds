import * as React from "react";
import { type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { Skeleton, type AureaSkeletonAnimation } from "./feedback.js";
/** `surface` põe tudo num cartão. Os mesmos nomes da web. */
export type AureaAccordionVariant = "default" | "surface";
/** Um item — o MESMO modelo do `Accordion` da web (`AccordionItem`). */
export interface AureaAccordionItem {
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
    /** O item que não abre: anunciado como desligado, apagado, e o toque não faz nada. */
    disabled?: boolean;
}
export interface AccordionProps {
    items: AureaAccordionItem[];
    variant?: AureaAccordionVariant;
    /** Deixa vários itens abertos ao mesmo tempo. Sem isto, abrir um fecha o outro. */
    multiple?: boolean;
    /** Os itens que começam abertos (o `id` de cada um). */
    defaultValue?: string[];
    /**
     * Os itens abertos, do lado de quem usa — o `value` da referência, que a web não tem (lá o
     * `<details>` guarda o próprio estado). Com ele, quem abre e fecha é o `onValueChange`.
     */
    value?: string[];
    /** Chamado com a lista nova de abertos a cada toque. */
    onValueChange?: (value: string[]) => void;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * Seções que abrem e fecham — o accordion da referência, com a API da web (`items`, `variant`,
 * `multiple`, `defaultValue`).
 *
 * Um de cada vez por padrão, e o aberto fecha no toque (o `isCollapsible` dela, ligado). O
 * gatilho é um botão que diz se está aberto (`expanded`) dentro de um título (`header`), como o
 * dela; a resposta fechada não está na árvore, e o leitor de tela não a lê.
 */
export declare function Accordion({ items, variant, multiple, defaultValue, value, onValueChange, style, testID, }: AccordionProps): React.JSX.Element;
export type AureaScrollShadowOrientation = "horizontal" | "vertical";
/**
 * Em que ponta o fio pode aparecer. `auto` e `both` são as duas pontas — e são o mesmo, como no
 * código dela (lá o `both` cai na mesma conta do `auto`). `top`/`left` só a do começo,
 * `bottom`/`right` só a do fim, `none` nenhuma.
 */
export type AureaScrollShadowVisibility = "auto" | "top" | "bottom" | "left" | "right" | "both" | "none";
export interface ScrollShadowProps {
    /** O rolador: um `ScrollView`, um `FlatList`… Um elemento só. */
    children: React.ReactElement;
    /** Sem isto, sai do `horizontal` do rolador, como na referência. */
    orientation?: AureaScrollShadowOrientation;
    visibility?: AureaScrollShadowVisibility;
    /** `false` tira os fios. */
    isEnabled?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * "Tem mais para lá" — o scroll-shadow da referência, com um FIO no lugar do degradê.
 *
 * 🔴 **Decisão do Victor:** a referência esmaece a ponta com um degradê de 50; a Aurea não tem
 * degradê (CLAUDE.md §5). Aqui é uma linha de 1 (a borda da Aurea, na cor de borda do tema) na
 * ponta onde há mais conteúdo escondido, e SÓ lá: no topo da lista não há fio em cima; no fim, não
 * há embaixo. Na horizontal, à esquerda e à direita.
 *
 * Ele mede como o dela, pelos três avisos do rolador (`onLayout`, `onContentSizeChange` e
 * `onScroll`), e entrega ao rolador os avisos que o app já tinha posto, depois dos dele. O
 * `inverted` (a conversa, de baixo para cima) troca as pontas. O fio entra e sai esmaecendo em
 * 200 ms; com "menos movimento", aparece e some de uma vez.
 *
 * ⚠ Um `onScroll` que não é função — o `Animated.event` com o motor nativo — não é repassado: o
 * aviso dele vive no motor, e não há como chamá-lo daqui.
 */
export declare function ScrollShadow({ children, orientation, visibility, isEnabled, style, testID, }: ScrollShadowProps): React.JSX.Element | null;
export interface SkeletonGroupProps {
    children?: React.ReactNode;
    /** `false` troca todos os esqueletos de dentro pelo conteúdo deles. Padrão: `true`. */
    isLoading?: boolean;
    /**
     * Some o grupo inteiro quando `isLoading` é `false` — para o grupo feito só de esqueletos, cujas
     * caixas de arrumação ficariam vazias ocupando lugar. Padrão: `false`.
     */
    isSkeletonOnly?: boolean;
    /** `"none"` para o pulso de todos. Padrão: `"pulse"`. */
    animation?: AureaSkeletonAnimation;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * Um comando para vários esqueletos — o skeleton-group da referência. O `isLoading` e a `animation`
 * descem para todo `Skeleton` de dentro (a qualquer profundidade), e cada um pode trocar o seu.
 *
 * O PULSO é um só, do grupo: as caixas sobem e descem juntas, em vez de cada uma no tempo em que
 * montou. `SkeletonGroup.Item` é o próprio `Skeleton` — o nome existe porque a referência o tem.
 */
declare function SkeletonGroupRaiz({ children, isLoading, isSkeletonOnly, animation, style, testID, }: SkeletonGroupProps): React.JSX.Element | null;
export declare const SkeletonGroup: typeof SkeletonGroupRaiz & {
    Item: typeof Skeleton;
};
export interface PressableFeedbackProps extends Omit<PressableProps, "children" | "style" | "disabled"> {
    children?: React.ReactNode;
    /** Desliga o toque: anunciado como desligado e apagado (a `REACAO_AO_TOQUE` inerte da Aurea). */
    isDisabled?: boolean;
    /**
     * `false` tira a escala da raiz — para pôr a `PressableFeedback.Scale` num filho. `"disable-all"`
     * desliga também o realce, a onda e a escala de dentro. Padrão: `true`.
     */
    animation?: boolean | "disable-all";
    /** A escala com o dedo em cima, numa peça de 300 de largura. Padrão: 0,985, a da referência. */
    scale?: number;
    style?: StyleProp<ViewStyle>;
}
/**
 * Um alvo de toque que responde — o pressable-feedback da referência. Por padrão a peça inteira
 * encolhe um pouco com o dedo em cima (0,985 numa peça de 300, proporcional à largura, em 300 ms).
 * Dentro dele, três partes que se combinam: `PressableFeedback.Highlight` (a camada que acende),
 * `PressableFeedback.Ripple` (a onda que nasce no dedo) e `PressableFeedback.Scale` (a escala num
 * filho só).
 *
 * É um botão para o leitor de tela (`accessibilityRole` troca). Com "menos movimento" a escala e o
 * realce SALTAM em vez de deslizar — como o `Button` da Aurea, que salta para 0,97 —, e a onda vira
 * uma camada parada.
 *
 * ⚠ Ele é UM elemento para o leitor de tela: não ponha botão dentro (no iPhone, o de dentro some —
 * o `check 43`). O que vai dentro é conteúdo.
 */
declare function PressableFeedbackRaiz({ children, isDisabled, animation, scale, style, onLayout, onPressIn, onPressOut, accessibilityRole, accessibilityState, ...resto }: PressableFeedbackProps): React.JSX.Element;
export interface PressableFeedbackScaleProps {
    children?: React.ReactNode;
    /** A escala com o dedo em cima, pela largura da RAIZ. Padrão: 0,985. */
    scale?: number;
    /** `false` para esta escala. */
    animation?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/** A escala num filho só — com `animation={false}` na raiz, para não encolher duas vezes. */
declare function EscalaDoToque({ children, scale, animation, style, testID }: PressableFeedbackScaleProps): React.JSX.Element;
export interface PressableFeedbackHighlightProps {
    /** Padrão: a cor do texto do tema (a referência usa um cinza claro no escuro e um escuro no claro). */
    color?: string;
    /** A opacidade com o dedo em cima. Padrão: 0,1. */
    opacity?: number;
    /** `false` tira o realce. */
    animation?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/** A camada que acende com o dedo em cima (o toque do iPhone): cobre a peça e vai a 10% em 200 ms. */
declare function RealceDoToque({ color, opacity, animation, style, testID }: PressableFeedbackHighlightProps): React.JSX.Element | null;
export interface PressableFeedbackRippleProps {
    /** Padrão: a cor do texto do tema. */
    color?: string;
    /** A opacidade no pico da onda. Padrão: 0,1. */
    opacity?: number;
    /** `false` tira a onda. */
    animation?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * A onda que nasce no dedo (o toque do Android): um círculo de 1,25 × a diagonal da peça, que
 * cresce de 0 até cobrir tudo e some ao soltar. Duas camadas que se revezam, como na referência: o
 * toque novo começa numa camada limpa enquanto a anterior termina de sumir, e a onda não pisca.
 *
 * Círculo cheio, de UMA cor — a dela é um degradê do centro para fora, e a Aurea não tem degradê.
 * Com "menos movimento" ela não cresce: acende inteira ao tocar e apaga ao soltar.
 */
declare function OndaDoToque({ color, opacity, animation, style, testID }: PressableFeedbackRippleProps): React.JSX.Element | null;
export declare const PressableFeedback: typeof PressableFeedbackRaiz & {
    Scale: typeof EscalaDoToque;
    Highlight: typeof RealceDoToque;
    Ripple: typeof OndaDoToque;
};
export {};
