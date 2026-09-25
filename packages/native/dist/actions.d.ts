import * as React from "react";
import { type PressableProps } from "react-native";
import { type AureaIconRegistry, type IconName } from "./icon.js";
/** Quanto peso a caixa tem. */
export type AureaButtonAppearance = "solid" | "outline" | "ghost";
/** O que a cor significa. Mesmos nomes da web (ADR-0044). */
export type AureaButtonTone = "neutral" | "brand" | "danger" | "success" | "warning" | "info";
/** As cinco alturas de controle, todas de token de densidade. */
export type AureaButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
    children?: React.ReactNode;
    appearance?: AureaButtonAppearance;
    tone?: AureaButtonTone;
    size?: AureaButtonSize;
    leadingIcon?: IconName;
    trailingIcon?: IconName;
    /**
     * Um desenho QUALQUER na frente do texto, para quando a marca não pode ser um ícone nosso.
     *
     * ⚠ **Ele existe por causa de MARCA REGISTRADA, não por conveniência.** O botão "Entrar com
     * Google" e o "Entrar com Apple" exigem o desenho oficial de cada um, e nenhum dos dois pode
     * viver dentro desta biblioteca: o Google proíbe redesenhar e manda usar o arquivo do pacote
     * dele; a Apple proíbe usar o logo sem licença escrita. **Então a marca entra pelo app**, e o
     * que a Aurea dá é a cápsula em volta.
     *
     *     <Button appearance="outline" leading={<RNImage source={logoGoogle} style={{width: 18, height: 18}} />}>
     *       Entrar com Google
     *     </Button>
     *
     * ⚠ **A cor do texto NÃO atravessa para cá** — o que entra desenha a própria cor, e é assim
     * que tem de ser: a marca do Google tem cor fixa, e tingi-la seria justamente o que a regra
     * dele proíbe. Um `leadingIcon` nosso continua herdando a cor do botão.
     */
    leading?: React.ReactNode;
    /** O mesmo, do outro lado. */
    trailing?: React.ReactNode;
    /** Registro de ícones, quando não há um em contexto. Ver `criarRegistroDeIcones`. */
    icons?: AureaIconRegistry;
    fullWidth?: boolean;
    /** Estado de alternância, anunciado ao leitor de tela como `checked`. */
    pressed?: boolean;
}
/**
 * Botão. `Pressable` do RN, alvo ≥ `--target-min`, pele de token.
 *
 * ⚠ **`disabled` no RN não tira da ordem de foco como o `:disabled` do HTML** — ele bloqueia o
 * toque e marca `accessibilityState.disabled`, e o leitor de tela ainda alcança e anuncia
 * "desativado". Isso é MELHOR do que o `:disabled` da web para o caso que a ficha do `Button`
 * descreve: lá, um botão desabilitado some da ordem de foco e a explicação pendurada nele não é
 * lida por ninguém. Aqui não há o dilema, então não há o par `aria-disabled` — um só basta.
 */
export declare function Button({ children, appearance, tone, size, leadingIcon, trailingIcon, leading, trailing, icons, fullWidth, pressed, disabled, accessibilityLabel, ...rest }: ButtonProps): React.JSX.Element;
export interface IconButtonProps extends Omit<ButtonProps, "children" | "leadingIcon" | "trailingIcon" | "fullWidth"> {
    name: IconName;
    /** **Obrigatório**: um botão que só tem glifo não tem texto para o leitor de tela anunciar. */
    label: string;
}
/**
 * Botão REDONDO, só glifo.
 *
 * O raio é o da cápsula (`radiusControl`, 999) num quadrado, e um quadrado com raio 999 é um
 * círculo — o mesmo que o `.btn-icon` do core faz. Decisão do Victor, 25/09/2026 (ADR-0052): era
 * `--radius-md`/`--radius-sm`, e o HeroUI 3.2.6 faz o botão só de ícone redondo.
 *
 * ⚠ **`label` é obrigatório no tipo**, e é a única prop deste pacote que obriga texto. Um ícone
 * sozinho não diz nada a quem não o vê, e deixar isso opcional é o mesmo que deixá-lo vazio.
 */
export declare function IconButton({ name, label, appearance, tone, size, icons, pressed, disabled, ...rest }: IconButtonProps): React.JSX.Element;
