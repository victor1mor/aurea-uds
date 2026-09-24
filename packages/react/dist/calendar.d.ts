import React from "react";
import { DayPicker } from "react-day-picker";
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    label?: string;
};
export declare function Calendar({ label, className, classNames, ...props }: CalendarProps): React.JSX.Element;
