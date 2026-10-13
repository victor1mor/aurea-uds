import React from "react";
import { DayPicker, type DateRange, type DayPickerLocale } from "react-day-picker";
import { type Responsive } from "./pure.js";
import { type IconName } from "./system.js";
import type { FieldSize } from "./markup.js";
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    label?: string;
};
export declare function Calendar({ label, className, classNames, ...props }: CalendarProps): React.JSX.Element;
export interface DatePickerBase {
    minimumDate?: Date;
    maximumDate?: Date;
    disabled?: boolean;
    size?: Responsive<FieldSize>;
    /** A língua do campo E do calendário: o objeto de `react-day-picker/locale` (`import {ptBR} from
     *  "react-day-picker/locale"`), o mesmo que o `Calendar` recebe. Padrão: inglês, o padrão do motor. */
    locale?: DayPickerLocale;
    /** Como a data vira texto no gatilho. Padrão: dia, mês curto e ano na língua do `locale` (sem ele, inglês). */
    format?: (d: Date) => string;
    /** O texto do gatilho vazio. Padrão: a frase `datePlaceholder` (ou `dateRangePlaceholder` no intervalo). */
    placeholder?: string;
    /** O ícone no fim do gatilho. Padrão: `calendar`; `false` tira. */
    icon?: IconName | false;
    /** Vai no formulário como `aaaa-mm-dd`; no intervalo, `aaaa-mm-dd/aaaa-mm-dd` (o intervalo da ISO 8601). */
    name?: string;
    id?: string;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}
export type DatePickerProps = DatePickerBase & ({
    range?: false;
    value?: Date;
    defaultValue?: Date;
    onChange?: (d: Date) => void;
} | {
    range: true;
    value?: DateRange;
    defaultValue?: DateRange;
    onChange?: (r: DateRange) => void;
});
export declare function DatePicker(props: DatePickerProps): React.JSX.Element;
