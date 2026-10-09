import * as React from "react";
import { type ImageSourcePropType, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type TomDeCor } from "./estilos.js";
import { type AureaUniversalState } from "./strings.js";
/**
 * GAR-07 (ADR-0060, 09/10/2026): as oito cores de CATEGORIA — marcam grupo, não estado ("Motos",
 * "Carros"). As mesmas da web, com os mesmos nomes; o amarelo fica de fora porque é da marca.
 */
export type AureaBadgeCategory = "red" | "orange" | "green" | "teal" | "cyan" | "blue" | "violet" | "pink";
export type AureaBadgeTone = TomDeCor | AureaBadgeCategory;
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
     * Conteúdo antes do texto — na prática, um glifo (`<Icon name="check" size="sm" />`).
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
/** GAR-09 (ADR-0060, 09/10/2026): para onde a métrica foi. Os mesmos nomes da web. */
export type AureaKPIDirection = "up" | "down" | "flat";
export type AureaKPITone = "success" | "danger" | "neutral";
export type AureaKPIVariant = "card" | "plain";
export interface KPIProps extends ViewProps {
    label: React.ReactNode;
    value: React.ReactNode;
    trend?: React.ReactNode;
    /**
     * Para onde foi. Desenha a seta (`trend-up`, `trend-down`, `minus` — o app registra os três, como
     * todo glifo do nativo), pinta a tendência e põe a palavra no nome que o leitor de tela ouve.
     */
    direction?: AureaKPIDirection;
    /** A cor da tendência. Padrão: alta = `success`, baixa = `danger`, estável = `neutral`. */
    tone?: AureaKPITone;
    /** A palavra do leitor de tela. Padrão em inglês, como na web: "Up", "Down", "No change". */
    directionLabel?: string;
    /** `plain` tira o cartão: o número dentro de um cartão que já existe (MNT-04). */
    variant?: AureaKPIVariant;
}
/**
 * Um número com nome. **É um `Card`** — medido em `markup.tsx:105`, e não no CSS, que só mostra
 * a coluna. Com `variant="plain"`, é só a coluna.
 *
 * A ficha da web declara `role="group"`, e **o React Native não tem esse papel** — medido na lista
 * de `accessibilityRole`, que vai de `button` a `toolbar` e não inclui `group`. O que ele tem é
 * `accessible`, e ele faz exatamente o que se queria do `group`: o nó inteiro vira UM elemento de
 * acessibilidade, e o leitor anuncia as três linhas juntas em vez de como três textos soltos.
 *
 * Inventar `accessibilityRole="summary"` porque o nome parece próximo seria pior que não ter papel:
 * `summary` tem significado próprio (o resumo de um bloco expansível) e diria uma coisa errada.
 *
 * Com `direction`, o nome do nó é escrito aqui (rótulo, número, palavra e tendência), porque a seta
 * é desenho e não tem texto para o leitor juntar — a web resolve com o `.sr-only`, que o nativo não
 * tem. Só quando as partes são texto; com nó próprio, o app dá o `accessibilityLabel`.
 *
 * O número em `3xl` e a tendência em `sm` desde a `0.26.0`: os mesmos da web (`0.24.1`).
 */
export declare function KPI({ label, value, trend, direction, tone, directionLabel, variant, style, ...rest }: KPIProps): React.JSX.Element;
