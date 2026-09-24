import React, { type ReactElement } from "react";
import { Tooltip, type LegendProps } from "recharts";
export interface ChartProps {
    children: ReactElement;
    label?: string;
    className?: string;
}
export declare function Chart({ children, label, className }: ChartProps): React.JSX.Element;
export declare function ChartTooltip(props: React.ComponentProps<typeof Tooltip>): React.JSX.Element;
export declare function ChartLegend(props: LegendProps): React.JSX.Element;
