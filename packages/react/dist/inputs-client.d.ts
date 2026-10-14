import React, { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type RefAttributes, type ReactNode } from "react";
import { type Responsive } from "./pure.js";
import { type ColorSwatchOption, type FieldSize, type FieldVariant } from "./markup.js";
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
export interface SliderProps<V extends number | readonly number[] = number | readonly number[]> {
    /** O rótulo. Obrigatório: é o nome das alças. `labelHidden` o tira da tela e deixa para o leitor de tela. */
    label: ReactNode;
    labelHidden?: boolean;
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
    orientation?: SliderOrientation;
    disabled?: boolean;
    name?: string;
    format?: Intl.NumberFormatOptions;
    locale?: string;
    /** Mostrar o valor ao lado do rótulo. Padrão: sim. */
    showValue?: boolean;
    /** Com dois valores, o nome de cada alça, na ordem ("Mínimo", "Máximo"). */
    thumbLabels?: readonly string[];
    /** A TRILHA DE COR (0.32.0, ADR-0069), variação deste mesmo Slider: `"hue"` faz dele a trilha do matiz — de 0 a
     *  360, pintada com o círculo de cores, o pino na cor do valor, o valor em graus, e o nome da cor para o leitor
     *  de tela. Um valor só. */
    channel?: "hue";
    className?: string;
    id?: string;
}
export declare function Slider<V extends number | readonly number[]>({ label, labelHidden, value, defaultValue, onValueChange, onValueCommitted, min, max, step, largeStep, orientation, disabled, name, format, locale, showValue, thumbLabels, channel, className, id }: SliderProps<V>): React.JSX.Element;
export interface ColorAreaProps {
    /** A cor, em hex (`#rrggbb` ou `#rgb`). Controlado. */
    value?: string;
    /** A cor de partida quando você não controla. Padrão: branco. */
    defaultValue?: string;
    /** Chamado a cada passo, com o hex `#rrggbb`. */
    onValueChange?: (value: string) => void;
    /** Chamado ao soltar o ponteiro e a cada tecla — o momento de salvar. */
    onValueCommitted?: (value: string) => void;
    disabled?: boolean;
    /** Vai no formulário como `#rrggbb`. */
    name?: string;
    id?: string;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}
export declare function ColorArea({ value, defaultValue, onValueChange, onValueCommitted, ...resto }: ColorAreaProps): React.JSX.Element;
export interface ColorPickerProps {
    /** O nome, ao lado da amostra no gatilho ("Cor da marca"). Nomeia o gatilho e a janela. */
    label: string;
    /** A cor, em hex (`#rrggbb` ou `#rgb`). Controlado. */
    value?: string;
    /** A cor de partida quando você não controla. Padrão: branco. */
    defaultValue?: string;
    /** Chamado a cada passo, com o hex `#rrggbb`. */
    onValueChange?: (value: string) => void;
    /** Chamado ao soltar, a cada tecla, ao escolher uma amostra e ao confirmar o código — o momento de salvar. */
    onValueCommitted?: (value: string) => void;
    /** Cores prontas, embaixo da trilha; com `variant="swatches"`, no lugar da área. Hex ou `{color, label}`. */
    swatches?: readonly (string | ColorSwatchOption)[];
    /** `"swatches"`: a paleta fechada — só as amostras e o campo do código. Padrão: `"full"`. */
    variant?: "full" | "swatches";
    disabled?: boolean;
    /** Vai no formulário como `#rrggbb`. */
    name?: string;
    id?: string;
    className?: string;
}
export declare function ColorPicker({ label, value, defaultValue, onValueChange, onValueCommitted, swatches, variant, disabled, name, id, className }: ColorPickerProps): React.JSX.Element;
export declare function OTPField({ length, value, defaultValue, onValueChange, mask, disabled, required, label, id, className }: {
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
}): React.JSX.Element;
export declare function SegmentedControl({ items, value, onChange, label, fullWidth }: {
    items: Array<{
        value: string;
        label: ReactNode;
    }>;
    value: string;
    onChange: (v: string) => void;
    label?: string;
    fullWidth?: boolean;
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
