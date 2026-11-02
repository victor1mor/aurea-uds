import React, { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type RefAttributes, type ReactNode } from "react";
import { type Responsive } from "./pure.js";
import { type ColorChannel, type ColorSpace } from "./color.js";
import { Radio, type ColorSwatchOption, type FieldSize, type FieldVariant } from "./markup.js";
import { type IconName } from "./system.js";
export { FileInput, matchesAccept, type FileRejection, type UploadContext, type UploadFn } from "./file-input.js";
export type FieldOrientation = "vertical" | "horizontal";
export type FieldLabelWidth = "auto" | (string & {});
export interface FieldProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    label: string;
    hint?: ReactNode;
    error?: ReactNode;
    /** B-12 (24/09/2026): texto de ajuda que precisa de uma FRASE — mora embaixo do controle, onde
     *  cabe, e não divide a linha do rótulo. O `hint` continua o que é: nota curta ao lado do rótulo
     *  ("opcional", "em MB"). É o lugar da descrição da referência e da `description` que o
     *  `Checkbox` desta casa já tem. Entra no `aria-describedby` na ordem da tela: hint, descrição,
     *  erro. */
    description?: ReactNode;
    name?: string;
    orientation?: Responsive<FieldOrientation>;
    labelWidth?: FieldLabelWidth;
    /** 0.32.0, como o `isRequired` da referência: o asterisco vermelho depois do rótulo (escondido do
     *  leitor de tela) e o `required` no controle — é ele que anuncia "obrigatório". */
    required?: boolean;
}
export declare function Field({ label, hint, description, error, children, className, id, name, orientation, labelWidth, style, required, ...props }: FieldProps): React.JSX.Element;
export declare function Form({ errors, onSubmit, children, className, ...props }: Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & RefAttributes<HTMLFormElement> & {
    errors?: Record<string, string | string[]>;
    onSubmit?: (values: Record<string, unknown>) => void;
}): React.JSX.Element;
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, RefAttributes<HTMLInputElement> {
    formatOnBlur?: (value: string) => string;
    size?: Responsive<FieldSize>;
    /** 0.32.0, a da referência: `secondary` é o fundo neutro, para o campo dentro de um cartão. */
    variant?: FieldVariant;
}
export declare const Input: React.ForwardRefExoticComponent<Omit<InputProps, "ref"> & RefAttributes<HTMLInputElement>>;
export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "width">, RefAttributes<HTMLInputElement> {
    icon?: IconName;
    size?: Responsive<FieldSize>;
    /** A-08 (24/09/2026): a largura do campo — `"20rem"` ou `"auto"`. Sem ela, 100% da linha, como
     *  sempre. O `size` muda altura e letra, nunca largura. */
    width?: string;
}
export declare function SearchField({ icon, className, size, width, ...props }: SearchFieldProps): React.JSX.Element;
export declare function NumberField({ value, defaultValue, onValueChange, min, max, step, disabled, readOnly, required, label, id, name, format, locale, className, scrubbable, scrubDirection }: {
    value?: number | null;
    defaultValue?: number;
    onValueChange?: (v: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    name?: string;
    format?: Intl.NumberFormatOptions;
    locale?: string;
    className?: string;
    scrubbable?: boolean;
    scrubDirection?: "horizontal" | "vertical";
}): React.JSX.Element;
export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">, RefAttributes<HTMLDivElement> {
    label: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[]) => void;
    /** O `name` de todas as caixas, para o formulário. */
    name?: string;
    disabled?: boolean;
    /** O asterisco no rótulo, como o `Field`. */
    required?: boolean;
}
export declare function CheckboxGroup({ label, description, error, value, defaultValue, onValueChange, name, disabled, required, children, className, ...props }: CheckboxGroupProps): React.JSX.Element;
export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">, RefAttributes<HTMLDivElement> {
    label: ReactNode;
    /** O nome sai da tela e fica para o leitor de tela, como no `Checkbox` (a fileira de controles da vitrine da referência). */
    labelHidden?: boolean;
    description?: ReactNode;
    error?: ReactNode;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** O `name` de todas as opções, para o formulário. Sem ele, um nome próprio do grupo. */
    name?: string;
    disabled?: boolean;
    /** Pinta todas as opções de erro, como o `invalid` do nativo. Com `error`, já vale. */
    invalid?: boolean;
    /** `vertical` (o padrão) ou `horizontal`, como a referência e o nativo. */
    orientation?: "vertical" | "horizontal";
    /** O asterisco no rótulo, como o `Field`. */
    required?: boolean;
}
export declare function RadioGroup({ label, labelHidden, description, error, value, defaultValue, onValueChange, name, disabled, invalid, orientation, required, children, className, ...props }: RadioGroupProps): React.JSX.Element;
export declare namespace RadioGroup {
    export { Radio as Item };
}
export interface ListBoxItem {
    id: string;
    label: ReactNode;
    /** O texto que a busca pela letra lê, quando o `label` não é texto. */
    textValue?: string;
    description?: ReactNode;
    icon?: IconName;
    disabled?: boolean;
    /** O item de perigo ("Excluir"), na cor de perigo. */
    danger?: boolean;
    /** O atalho do item ("⌘N"), à direita, como na lista da referência (15/10/2026). Só mostra: quem liga a tecla é o app. */
    kbd?: string;
}
export interface ListBoxSection {
    title: ReactNode;
    items: readonly ListBoxItem[];
}
export type ListBoxSelectionMode = "none" | "single" | "multiple";
export interface ListBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    /** O nome da lista para o leitor de tela. */
    label: string;
    items: readonly (ListBoxItem | ListBoxSection)[];
    selectionMode?: ListBoxSelectionMode;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[]) => void;
    /** Sem escolha: o item foi ativado (Enter, Espaço ou clique). */
    onAction?: (id: string) => void;
}
export declare function ListBox({ label, items, selectionMode, value, defaultValue, onValueChange, onAction, className, ...props }: ListBoxProps): React.JSX.Element;
export type TagGroupSelectionMode = "none" | "single" | "multiple";
export type TagSize = "sm" | "md" | "lg";
export type TagVariant = "default" | "surface";
export interface TagItem {
    id: string;
    label: ReactNode;
    /** O texto do nome do X ("Remover Design"), quando o `label` não é texto. */
    textValue?: string;
    icon?: IconName;
    disabled?: boolean;
}
export interface TagGroupProps {
    /** O nome do grupo. `labelHidden` o tira da tela e deixa para o leitor de tela. */
    label: ReactNode;
    labelHidden?: boolean;
    description?: ReactNode;
    errorMessage?: ReactNode;
    items: readonly TagItem[];
    selectionMode?: TagGroupSelectionMode;
    selectedKeys?: readonly string[];
    defaultSelectedKeys?: readonly string[];
    onSelectionChange?: (keys: string[]) => void;
    /** Com ele, cada etiqueta ganha o X, e Delete/Backspace tiram a ativa. */
    onRemove?: (ids: string[]) => void;
    size?: TagSize;
    variant?: TagVariant;
    className?: string;
    id?: string;
}
export declare function TagGroup({ label, labelHidden, description, errorMessage, items, selectionMode, selectedKeys, defaultSelectedKeys, onSelectionChange, onRemove, size, variant, className, id }: TagGroupProps): React.JSX.Element;
export type SliderOrientation = "horizontal" | "vertical";
/** O que os dois modos do Slider têm em comum (o número e a cor). É a base que o leitor da API segue em
 *  `base & (a | b)` — com a união sozinha, ele não acha prop nenhuma (medido no `ColorSwatch`, 13/10/2026). */
export interface SliderBase {
    /** O rótulo. Obrigatório: é o nome das alças. `labelHidden` o tira da tela e deixa para o leitor de tela. */
    label: ReactNode;
    labelHidden?: boolean;
    orientation?: SliderOrientation;
    disabled?: boolean;
    name?: string;
    /** Mostrar o valor ao lado do rótulo. Padrão: sim. */
    showValue?: boolean;
    className?: string;
    id?: string;
}
export interface SliderProps<V extends number | readonly number[] = number | readonly number[]> extends SliderBase {
    value?: V;
    defaultValue?: V;
    /** Chamado a cada passo, com o número (ou a lista, na faixa). */
    onValueChange?: (value: V) => void;
    /** Chamado ao soltar a alça — o momento de salvar. */
    onValueCommitted?: (value: V) => void;
    min?: number;
    max?: number;
    step?: number;
    /** O passo do Page Up/Down e do Shift + seta. */
    largeStep?: number;
    format?: Intl.NumberFormatOptions;
    locale?: string;
    /** Com dois valores, o nome de cada alça, na ordem ("Mínimo", "Máximo"). */
    thumbLabels?: readonly string[];
    channel?: undefined;
}
/** A TRILHA DE COR (0.32.0, ADR-0069), variação deste mesmo Slider: com `channel`, ele anda num canal da cor — e o
 *  valor passa a ser a COR (hex), como na referência, para várias trilhas repartirem a mesma. */
export interface SliderColorProps extends SliderBase {
    /** O canal: `hue`, `saturation`, `brightness`, `lightness`, `red`, `green`, `blue` ou `alpha`. */
    channel: ColorChannel;
    /** O espaço de `hue` e `saturation` (`hsb` ou `hsl`); os outros canais já dizem o deles. Padrão: `hsb`. */
    colorSpace?: ColorSpace;
    /** A cor, em hex ou `rgb()`/`hsl()`/`hsb()`. Controlado. */
    value?: string;
    defaultValue?: string;
    /** Chamado a cada passo, com o hex (`#rrggbb`, ou `#rrggbbaa` com transparência). */
    onValueChange?: (value: string) => void;
    /** Chamado ao soltar — o momento de salvar. */
    onValueCommitted?: (value: string) => void;
}
export declare function Slider<V extends number | readonly number[]>(props: SliderBase & (SliderProps<V> | SliderColorProps)): React.JSX.Element;
export interface ColorAreaProps {
    /** A cor, em hex ou `rgb()`/`hsl()`/`hsb()`. Controlado. */
    value?: string;
    /** A cor de partida quando você não controla. Padrão: branco. */
    defaultValue?: string;
    /** Chamado a cada passo, com o hex (`#rrggbb`, ou `#rrggbbaa` com transparência). */
    onValueChange?: (value: string) => void;
    /** Chamado ao soltar o ponteiro e a cada tecla — o momento de salvar. */
    onValueCommitted?: (value: string) => void;
    /** O espaço de cor da área: `hsb` (o padrão), `hsl` ou `rgb`. */
    colorSpace?: ColorSpace;
    /** O canal do eixo de lado. Padrão: saturação (HSB e HSL) ou vermelho (RGB). A área não tem alfa. */
    xChannel?: Exclude<ColorChannel, "alpha">;
    /** O canal do eixo de cima. Padrão: brilho (HSB), luminosidade (HSL) ou verde (RGB). */
    yChannel?: Exclude<ColorChannel, "alpha">;
    /** Pontinhos por cima da área, como na referência — ajudam a ver a posição. */
    showDots?: boolean;
    disabled?: boolean;
    /** Vai no formulário como hex. */
    name?: string;
    id?: string;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}
export declare function ColorArea({ value, defaultValue, onValueChange, onValueCommitted, colorSpace, xChannel, yChannel, ...resto }: ColorAreaProps): React.JSX.Element;
export interface ColorFieldProps {
    /** A cor, em hex ou `rgb()`/`hsl()`/`hsb()`; `""` é o campo vazio. Controlado. */
    value?: string;
    /** A cor de partida quando você não controla. Sem ela, o campo começa vazio. */
    defaultValue?: string;
    /** Chamado ao confirmar (Enter ou sair do campo) e a cada tecla no canal, com o hex — ou `""`, ao limpar. */
    onValueChange?: (value: string) => void;
    /** Chamado junto do `onValueChange` — o momento de salvar. */
    onValueCommitted?: (value: string) => void;
    /** Um canal só, no lugar do código: `hue`, `saturation`, `brightness`, `lightness`, `red`, `green`, `blue`, `alpha`. */
    channel?: ColorChannel;
    /** O espaço de `hue` e `saturation` no modo canal (`hsb` ou `hsl`). Padrão: `hsb`. */
    colorSpace?: ColorSpace;
    /** A amostra na frente. Padrão: sim no código, não no canal. */
    swatch?: boolean;
    size?: Responsive<FieldSize>;
    /** `secondary` é o fundo neutro, para o campo dentro de um cartão (o mesmo do `Input`). */
    variant?: FieldVariant;
    /** A largura do campo — `"20rem"` ou `"auto"`. Sem ela, 100% da linha, como os outros campos. */
    width?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    /** Vai no formulário como hex. */
    name?: string;
    placeholder?: string;
    id?: string;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
}
export declare function ColorField({ value, defaultValue, onValueChange, onValueCommitted, channel, colorSpace, swatch, size, variant, width, disabled, readOnly, required, name, placeholder, id, className, ...aria }: ColorFieldProps): React.JSX.Element;
export interface ColorPickerProps {
    /** O nome, ao lado da amostra no gatilho ("Cor da marca"). Nomeia o gatilho e a janela. */
    label: string;
    /** A cor, em hex ou `rgb()`/`hsl()`/`hsb()`. Controlado. */
    value?: string;
    /** A cor de partida quando você não controla. Padrão: branco. */
    defaultValue?: string;
    /** Chamado a cada passo, com o hex (`#rrggbb`, ou `#rrggbbaa` com transparência). */
    onValueChange?: (value: string) => void;
    /** Chamado ao soltar, a cada tecla, ao escolher uma amostra e ao confirmar o código — o momento de salvar. */
    onValueCommitted?: (value: string) => void;
    /** Cores prontas, embaixo da trilha; com `variant="swatches"`, no lugar da área. Hex ou `{color, label}`. */
    swatches?: readonly (string | ColorSwatchOption)[];
    /** `"swatches"`: a paleta fechada — só as amostras e o campo do código. Padrão: `"full"`. */
    variant?: "full" | "swatches";
    /** O conteúdo da janela, montado por quem usa (no lugar do padrão): `ColorArea`, `Slider` com `channel`,
     *  `ColorField` e o que mais couber. As peças de cor sem valor próprio usam a cor do seletor. */
    children?: ReactNode;
    disabled?: boolean;
    /** Vai no formulário como hex. */
    name?: string;
    id?: string;
    className?: string;
}
export declare function ColorPicker({ label, value, defaultValue, onValueChange, onValueCommitted, swatches, variant, children, disabled, name, id, className }: ColorPickerProps): React.JSX.Element;
export declare function OTPField({ length, value, defaultValue, onValueChange, mask, disabled, required, label, id, className, groupSize, variant }: {
    length: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (v: string) => void;
    mask?: boolean;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    className?: string;
    /** O tracinho entre os grupos: a cada `groupSize` caixas (3 num código de 6). */
    groupSize?: number;
    /** `secondary`: o fundo neutro do `Input` secundário, para o campo dentro de um cartão. */
    variant?: "primary" | "secondary";
}): React.JSX.Element;
export type SegmentedControlSelectedStyle = "current" | "neutral" | "contrast" | "brand" | "ring" | "dot";
export declare function SegmentedControl({ items, value, onChange, label, fullWidth, size, selectedStyle }: {
    items: Array<{
        value: string;
        label: ReactNode;
        href?: string;
    }>;
    value: string;
    onChange?: (v: string) => void;
    label?: string;
    fullWidth?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    selectedStyle?: SegmentedControlSelectedStyle;
}): React.JSX.Element;
export interface ComboboxOption {
    value: string;
    label: string;
}
export interface ComboboxOptGroup {
    label: string;
    items: ComboboxOption[];
}
export declare function Combobox({ items, value, onValueChange, placeholder, label, empty, disabled, size, id, className, "aria-describedby": descrito, "aria-invalid": invalido, "aria-label": rotulo }: {
    items: ComboboxOption[] | ComboboxOptGroup[];
    empty?: ReactNode;
    value?: ComboboxOption | null;
    onValueChange?: (v: ComboboxOption | null) => void;
    placeholder?: string;
    label?: ReactNode;
    disabled?: boolean;
    size?: Responsive<FieldSize>;
    id?: string;
    className?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
    /** C-01 (24/09/2026): nome para o leitor de tela quando não há `label` visível — um filtro numa
     *  grade sem rótulos. Vai direto para o campo. Com `label`, prefira o `label`. */
    "aria-label"?: string;
}): React.JSX.Element;
export declare function MultiCombobox({ items, value, onValueChange, onInputChange, loading, placeholder, label, empty, disabled, id, className, "aria-describedby": descrito, "aria-invalid": invalido, "aria-label": rotulo }: {
    items: ComboboxOption[] | ComboboxOptGroup[];
    empty?: ReactNode;
    value?: ComboboxOption[];
    onValueChange?: (v: ComboboxOption[]) => void;
    onInputChange?: (query: string) => void;
    loading?: boolean;
    placeholder?: string;
    label?: ReactNode;
    disabled?: boolean;
    id?: string;
    className?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
    /** C-01 (24/09/2026): nome para o leitor de tela quando não há `label` visível — um filtro numa
     *  grade sem rótulos. Vai direto para o campo. Com `label`, prefira o `label`. */
    "aria-label"?: string;
}): React.JSX.Element;
export interface SelectOption {
    value: string;
    label: ReactNode;
    disabled?: boolean;
}
export interface SelectOptGroup {
    label: ReactNode;
    items: SelectOption[];
}
type SelectChange = {
    target: {
        value: string;
        name?: string;
    };
    currentTarget: {
        value: string;
        name?: string;
    };
};
export interface SelectProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange" | "name">, RefAttributes<HTMLButtonElement> {
    items?: SelectOption[] | SelectOptGroup[];
    value?: string;
    defaultValue?: string;
    onChange?: (e: SelectChange) => void;
    onValueChange?: (value: string) => void;
    placeholder?: ReactNode;
    name?: string;
    required?: boolean;
    size?: Responsive<FieldSize>;
}
export declare const Select: React.ForwardRefExoticComponent<Omit<SelectProps, "ref"> & RefAttributes<HTMLButtonElement>>;
export interface EditorBlock {
    id: string;
    kind?: ReactNode;
    children: ReactNode;
}
export interface BlockEditorProps extends Omit<HTMLAttributes<HTMLOListElement>, "onReorder">, RefAttributes<HTMLOListElement> {
    blocks: EditorBlock[];
    onReorder: (from: number, to: number) => void;
    onRemove?: (index: number) => void;
    label?: string;
}
export declare function BlockEditor({ blocks, onReorder, onRemove, label, className, ...props }: BlockEditorProps): React.JSX.Element;
export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">, RefAttributes<HTMLInputElement> {
    size?: Responsive<FieldSize>;
    defaultVisible?: boolean;
}
export declare function PasswordField({ className, size, defaultVisible, id, ...props }: PasswordFieldProps): React.JSX.Element;
