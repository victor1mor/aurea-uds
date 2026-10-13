import * as React from "react";
import { Animated, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type IconName, type AureaIcon } from "./icon.js";
import { type AureaUniversalState } from "./strings.js";
export type AureaSpinnerSize = "sm" | "md" | "lg";
export interface SpinnerProps {
    /**
     * 16 · 24 · 32, e o padrão é o `md` (24) — a escala do pacote nativo da referência (0.32.0).
     * Até a 0.31.0 era 16 · 20 · 24, com o `sm` de padrão, como a web.
     */
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
/** O pulso (`"pulse"`, o padrão) ou a caixa parada (`"none"`) — os nomes da web (0.32.0). O brilho que
 *  corre da referência ("shimmer") é degradê, e degradê a Aurea não tem. */
export type AureaSkeletonAnimation = "pulse" | "none";
export interface SkeletonProps {
    /** Padrão: ocupa a largura disponível. */
    width?: number | `${number}%`;
    /** Padrão: a altura de uma linha de texto (`--space-4`). */
    height?: number;
    radius?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    /**
     * 0.32.0: `false` troca a caixa pelo conteúdo de verdade (`children`) — o `isLoading` da referência.
     * Padrão: `true`, a caixa de sempre. Dentro de um `SkeletonGroup`, sem este, vale o do grupo.
     */
    isLoading?: boolean;
    /** O conteúdo que aparece no lugar da caixa quando `isLoading` é `false`. */
    children?: React.ReactNode;
    /** `"none"` deixa a caixa parada, como na web. Dentro de um `SkeletonGroup`, sem este, vale o do grupo. */
    animation?: AureaSkeletonAnimation;
}
/**
 * O que o `SkeletonGroup` manda para os esqueletos de dentro: o `isLoading` e a `animation` do grupo,
 * e o PULSO — um valor só, e por isso todos sobem e descem juntos, em vez de cada um no seu tempo.
 *
 * Mora aqui, ao lado do `Skeleton`, porque é ele quem lê. O grupo (`exibicao.tsx`) importa daqui;
 * o contrário fecharia um ciclo de importação entre os dois arquivos. Ferramenta de dentro: não sai
 * pela porta da frente do pacote.
 */
export interface GrupoDeEsqueletoValor {
    isLoading: boolean;
    animation: AureaSkeletonAnimation;
    pulso: Animated.Value;
}
export declare const GrupoDeEsqueleto: React.Context<GrupoDeEsqueletoValor | null>;
/**
 * O pulso do esqueleto: liga só quando `ativo`, e só depois de o sistema dizer que pode mexer.
 * Desligado, a opacidade volta a 1 — um laço parado no meio deixaria a caixa meio apagada.
 * O `SkeletonGroup` usa o mesmo, uma vez para o grupo inteiro.
 */
export declare function usePulsoDoEsqueleto(ativo: boolean): Animated.Value;
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
 *
 * 0.32.0: o `isLoading` e os `children` da referência. Com `isLoading={false}` a caixa sai e o
 * conteúdo entra, num esmaecer da duração lenta da Aurea (a referência usa o esmaecer padrão do
 * motor dela); com "menos movimento", ou no primeiro desenho, ele entra sem esmaecer. Sem as props
 * novas, nada muda: é a caixa de sempre.
 */
export declare function Skeleton({ width, height, radius, style, testID, isLoading, children, animation }: SkeletonProps): React.JSX.Element;
/** O tom da barra: a mesma lista fechada do `tone` do `Button`. Pausado é `neutral`; falha é `danger`. */
export type AureaProgressTone = "brand" | "neutral" | "success" | "warning" | "danger" | "info";
export interface ProgressProps {
    /**
     * 0 a 100. Fora disso é grampeado, como na web (`Math.max(0, Math.min(100, value))`).
     * **Sem `value`, a barra é indeterminada** (AN-07): o total ainda não se sabe, e um pedaço corre
     * pelo trilho, no lugar de um 0% que parece parado.
     */
    value?: number;
    label?: string;
    /**
     * O texto de apoio, no alto à direita — a saída de texto da barra de progresso da referência: velocidade, tempo que
     * falta, bytes. Em texto, ele vai junto no `accessibilityValue`. É texto: a barra é um elemento
     * só para o leitor de tela, e coisa tocável dentro dela some no iPhone (`check 43`).
     */
    detail?: React.ReactNode;
    tone?: AureaProgressTone;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * A barra de progresso — determinada, ou indeterminada quando não há `value` (AN-07, 03/10/2026).
 *
 * O papel é `progressbar` e o valor vai no `accessibilityValue`: sem isso o leitor de tela
 * anuncia que existe uma barra e não diz em quanto ela está, que é a única informação que ela tem.
 * Sem total, não há `now` — a barra não finge um 0%.
 *
 * Sem total, um pedaço de 2/5 corre de -100% a 350% da própria largura em 1,5 s, na curva da
 * barra de progresso da referência — os mesmos números da web. Quando a pessoa pede menos movimento
 * ele não corre: a barra inteira, apagada, e nunca um pedaço parado, que leria como 40% feito.
 */
export declare function Progress({ value, label, detail, tone, style, testID }: ProgressProps): React.JSX.Element;
export type AureaAlertVariant = "info" | "success" | "warning" | "danger";
/** Mesmos quatro glifos do `feedback-client.tsx:43`. */
export declare const ICONE_DA_VARIANTE: Readonly<Record<AureaAlertVariant, IconName>>;
export interface AlertProps extends ViewProps {
    variant?: AureaAlertVariant;
    /** Um dos sete estados universais. Ele **escolhe a variante** e escreve o texto padrão. */
    state?: AureaUniversalState;
    title?: React.ReactNode;
    icon?: AureaIcon;
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
 *     import InformationFilled from "@aurea-uds/native/icons/info";
 *     const ICONES = criarRegistroDeIcones({"info": InformationFilled, …});
 */
export declare function Alert({ variant, state, title, icon, onDismiss, children, style, accessibilityLabel, accessibilityHint, ...rest }: AlertProps): React.JSX.Element;
export interface EmptyStateProps {
    /**
     * O glifo, dentro de uma moldura redonda — R-15, 02/10/2026, escolhida pelo Victor na prancha
     * (*"1 c"*). Moldura de 64 (o `Avatar` `lg` da referência) e glifo de 32, o de antes. O desenho
     * do próprio app entra aqui também (`icon={Logo}`, R-11).
     */
    icon?: AureaIcon;
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
    emptyIcon?: AureaIcon;
    action?: React.ReactNode;
    /** Função para o conteúdo caro não ser construído enquanto o estado o esconde. */
    children: React.ReactNode | (() => React.ReactNode);
    /** A barreira de erro (MNT-25): o que quebrar ao desenhar o conteúdo vira a cara de erro, com "Tentar de novo". */
    catchErrors?: boolean;
    /** Recebe o erro que a barreira pegou — para o app registrar. */
    onCatch?: (error: unknown, info: React.ErrorInfo) => void;
}
/**
 * A região que troca de cara. **Ela não desenha nada próprio** — empilha o que já existe.
 *
 * ⚠ **A regra que não está no CSS e é a mais importante:** os sete estados universais
 * **acompanham** o conteúdo, não o substituem. `stale`, `partial`, `offline` querem dizer que o
 * dado está aí e tem ressalva — esconder o dado seria trocar informação parcial por informação
 * nenhuma. Só `loading`, `error` e `empty` tomam o lugar.
 */
export declare function DataState({ catchErrors, onCatch, ...props }: DataStateProps): React.JSX.Element;
