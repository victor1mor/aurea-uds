import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type AureaIcon, type AureaIconRegistry } from "./icon.js";
export type AureaSliderOrientation = "horizontal" | "vertical";
export interface SliderProps<V extends number | readonly number[] = number | readonly number[]> {
    /** O rótulo. Obrigatório: é o nome das alças. `labelHidden` o tira da tela e deixa para o leitor de tela. */
    label: React.ReactNode;
    labelHidden?: boolean;
    /** Um número, ou uma lista de dois para a faixa (duas alças). */
    value?: V;
    defaultValue?: V;
    /** Chamado a cada passo, com o número (ou a lista, na faixa). */
    onValueChange?: (value: V) => void;
    /** Chamado ao soltar a alça, ao tocar no trilho e a cada passo do leitor de tela — o momento de salvar. */
    onValueCommitted?: (value: V) => void;
    /** Padrões da web: 0, 100 e 1. */
    min?: number;
    max?: number;
    step?: number;
    orientation?: AureaSliderOrientation;
    disabled?: boolean;
    /** As opções do `Intl.NumberFormat` do valor. Mesma prop da web e do `NumberField`. */
    format?: Intl.NumberFormatOptions;
    /** O locale do `Intl`. Sem ele, o do aparelho. */
    locale?: string;
    /** Mostrar o valor ao lado do rótulo. Padrão: sim. */
    showValue?: boolean;
    /** Com dois valores, o nome de cada alça, na ordem ("Mínimo", "Máximo"). */
    thumbLabels?: readonly string[];
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O controle deslizante da referência: o trilho, o preenchimento e a alça em cápsula, com o rótulo
 * e o valor na linha de cima.
 *
 *     <Slider label="Volume" defaultValue={30} />
 *     <Slider label="Preço" value={faixa} onValueChange={setFaixa} min={0} max={1000} step={10}
 *             format={{style: "currency", currency: "BRL"}} locale="pt-BR" thumbLabels={["Mínimo", "Máximo"]} />
 *
 * Arrastar a alça move a partir de onde ela está; tocar no trilho leva a alça mais perto até ali (e
 * continua arrastando, como na web). Na faixa, uma alça não passa da outra — para nela, como na
 * referência. Cada alça é um elemento `adjustable`: o leitor de tela anuncia o valor formatado e
 * desliza um passo para cima ou para baixo (`increment`/`decrement`).
 */
export declare function Slider<V extends number | readonly number[]>({ label, labelHidden, value, defaultValue, onValueChange, onValueCommitted, min, max, step, orientation, disabled, format, locale, showValue, thumbLabels, style, testID, }: SliderProps<V>): React.JSX.Element;
export interface OTPFieldProps {
    /** Quantas casas. Obrigatório, como na web: sem ele o campo não sabe quando está completo. */
    length: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Esconde os dígitos atrás de um ponto. */
    mask?: boolean;
    disabled?: boolean;
    /** O nome do campo para o leitor de tela. Dentro de um `Field`, vale o rótulo dele. */
    label?: string;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O campo de código de uso único — a anatomia da referência: UM campo de texto invisível por cima
 * das casas, que só desenham. É ele que recebe o teclado, o colar e o código do SMS
 * (`textContentType="oneTimeCode"` no iPhone, `autoComplete="sms-otp"` no Android).
 *
 *     <Field label="Código enviado por SMS"><OTPField length={6} value={codigo} onValueChange={setCodigo} /></Field>
 *
 * A casa da vez ganha a borda do foco e o cursor que pisca (parado com "menos movimento"). Só
 * dígitos entram, como na web. Para o leitor de tela é um campo só, com o nome do `label` (ou do
 * `Field`); as casas ficam fora da árvore, para ele não ler cada dígito duas vezes.
 */
export declare function OTPField({ length, value, defaultValue, onValueChange, mask, disabled, label, style, testID }: OTPFieldProps): React.JSX.Element;
export type AureaTagGroupSelectionMode = "none" | "single" | "multiple";
export type AureaTagSize = "sm" | "md" | "lg";
export type AureaTagVariant = "default" | "surface";
export interface AureaTagItem {
    id: string;
    label: React.ReactNode;
    /** O texto do nome do X ("Remover Design"), quando o `label` não é texto. */
    textValue?: string;
    /** O nome de um glifo do registro, ou o próprio desenho (R-11). */
    icon?: AureaIcon;
    disabled?: boolean;
}
export interface TagGroupProps {
    /** O nome do grupo. `labelHidden` o tira da tela e deixa para o leitor de tela. */
    label: React.ReactNode;
    labelHidden?: boolean;
    description?: React.ReactNode;
    errorMessage?: React.ReactNode;
    items: readonly AureaTagItem[];
    selectionMode?: AureaTagGroupSelectionMode;
    selectedKeys?: readonly string[];
    defaultSelectedKeys?: readonly string[];
    onSelectionChange?: (keys: string[]) => void;
    /** Com ele, cada etiqueta ganha o X. */
    onRemove?: (ids: string[]) => void;
    size?: AureaTagSize;
    variant?: AureaTagVariant;
    /** Registro local de ícones (o `x` e os das etiquetas), quando não há um em contexto. */
    icons?: AureaIconRegistry;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O grupo de etiquetas da referência: as etiquetas numa fila que quebra, com rótulo, descrição e
 * erro; escolha de nenhuma, uma ou várias; e o X de tirar.
 *
 *     <TagGroup label="Assuntos" selectionMode="multiple" items={assuntos}
 *               selectedKeys={escolhidos} onSelectionChange={setEscolhidos} onRemove={tirar} />
 *
 * ⚠ **O X é IRMÃO da etiqueta, e não filho**, ao contrário da referência (lá o botão de tirar mora
 * dentro do item tocável). No iPhone, um tocável dentro de outro some para o VoiceOver (`check
 * 43`); aqui a etiqueta é uma moldura com duas partes lado a lado — a que escolhe e a que tira —,
 * como o `.tag-main` e o `.tag-remove` da web.
 *
 * Com escolha, cada etiqueta é um botão com o estado `selected`; sem escolha, é só texto. A
 * escolhida ganha o fundo com 10% da marca e a letra no destaque (`primaryEmphasis`), a pintura
 * da web.
 */
export declare function TagGroup({ label, labelHidden, description, errorMessage, items, selectionMode, selectedKeys, defaultSelectedKeys, onSelectionChange, onRemove, size, variant, icons, style, testID, }: TagGroupProps): React.JSX.Element;
