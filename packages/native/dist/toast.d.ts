import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type IconName } from "./icon.js";
import { type AureaAlertVariant } from "./feedback.js";
/** As mesmas quatro faces do `AureaToastType` da web (`system.tsx:65`). */
export type AureaToastType = AureaAlertVariant;
export interface AureaToastInput {
    title: React.ReactNode;
    description?: React.ReactNode;
    type?: AureaToastType;
    /**
     * Quanto tempo fica, em ms. **`0` nunca fecha sozinho**, e é o que um aviso com `action` tem de
     * usar: um botão que foge da mão em cinco segundos é um botão que não existe para quem lê
     * devagar, para quem usa leitor de tela, ou para quem só olhou para o lado.
     */
    duration?: number;
    /** Uma ação curta — "Desfazer". Ver o aviso sobre `duration` acima. */
    action?: React.ReactNode;
    /** Deixe de fora para não desenhar ícone nenhum; sem isto vem o do tipo. */
    icon?: IconName | false;
}
export interface AureaToast extends AureaToastInput {
    id: string;
}
export interface AureaToastManager {
    /** Põe um aviso na pilha e devolve o `id`, que serve para fechá-lo antes da hora. */
    add: (aviso: AureaToastInput) => string;
    /** Tira um aviso pelo `id`. Chamar com um `id` que já saiu não faz nada. */
    close: (id: string) => void;
    /** A pilha, do mais antigo para o mais novo. */
    toasts: readonly AureaToast[];
}
/**
 * O gerente de avisos. **Precisa de um `ToastHost` acima na árvore.**
 *
 * ⚠ Sem hospedeiro ele LEVANTA em vez de devolver um gerente mudo — ver o cabeçalho deste
 * arquivo. O aviso que não aparece é o defeito que ninguém descobre.
 */
export declare function useToast(): AureaToastManager;
export interface ToastHostProps {
    children?: React.ReactNode;
    /** Quantos avisos cabem ao mesmo tempo. Passando disso, o mais ANTIGO sai. */
    max?: number;
    /** O padrão de `duration` para quem não passa um. */
    duration?: number;
    /**
     * Quanto subir a pilha. Use quando houver `BottomNav`: sem isto o aviso nasce em cima da barra
     * e tapa justamente o que a pessoa ia tocar.
     */
    offset?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * Hospeda a pilha de avisos e o estado dela.
 *
 * ⚠ **Ele desenha um `View` com `flex: 1` em volta dos filhos** — é o preço de não haver portal
 * no React Native, e ele está dito aqui em vez de escondido no `AureaProvider`. Ponha-o o mais
 * alto que puder, dentro do provider.
 *
 * ⚠ **O respiro de baixo é `Math.max`, não soma** — mesma conta do `BottomNav` (Lote 3): a barra
 * de gestos e o nosso espaçamento ocupam o MESMO espaço, e somar os dois empurra o aviso para o
 * meio da tela.
 */
export declare function ToastHost({ children, max, duration, offset, style, testID, }: ToastHostProps): React.JSX.Element;
/**
 * Um aviso da pilha. Exportado porque o hospedeiro o desenha e porque um teste precisa alcançá-lo
 * — não porque o app deva montá-lo à mão: quem cria aviso é o `useToast`.
 *
 * ⚠ **`danger` é `role="alert"`; o resto é `status`** — a mesma regra do `Alert` do Lote 2, e ela
 * vem do fonte da web, não do CSS. E no Android o papel sozinho não faz o leitor falar sem foco:
 * quem faz é a região viva.
 */
export declare function Toast({ toast, onClose }: {
    toast: AureaToast;
    onClose: () => void;
}): React.JSX.Element;
