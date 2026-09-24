import React, { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type RefAttributes, type ReactNode } from "react";
import { type Responsive } from "./pure.js";
import { type FieldSize } from "./markup.js";
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
     *  ("opcional", "em MB"). É o lugar do `Description` do HeroUI e da `description` que o
     *  `Checkbox` desta casa já tem. Entra no `aria-describedby` na ordem da tela: hint, descrição,
     *  erro. */
    description?: ReactNode;
    name?: string;
    orientation?: Responsive<FieldOrientation>;
    labelWidth?: FieldLabelWidth;
}
export declare function Field({ label, hint, description, error, children, className, id, name, orientation, labelWidth, style, ...props }: FieldProps): React.JSX.Element;
export declare function Form({ errors, onSubmit, children, className, ...props }: Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & RefAttributes<HTMLFormElement> & {
    errors?: Record<string, string | string[]>;
    onSubmit?: (values: Record<string, unknown>) => void;
}): React.JSX.Element;
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, RefAttributes<HTMLInputElement> {
    formatOnBlur?: (value: string) => string;
    size?: Responsive<FieldSize>;
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
export declare function SegmentedControl({ items, value, onChange, label }: {
    items: Array<{
        value: string;
        label: ReactNode;
    }>;
    value: string;
    onChange: (v: string) => void;
    label?: string;
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
