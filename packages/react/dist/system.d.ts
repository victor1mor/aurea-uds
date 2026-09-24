import React, { type ReactNode } from "react";
import { type Responsive } from "./pure.js";
import { type AureaStrings, type AureaTheme, type AureaDensity } from "./internal.js";
export declare function AureaProvider({ children, strings, direction, spriteUrl, portalContainer, theme, defaultTheme, onThemeChange, density, defaultDensity, onDensityChange }: {
    children: ReactNode;
    strings?: Partial<AureaStrings>;
    direction?: "ltr" | "rtl";
    spriteUrl?: string;
    portalContainer?: HTMLElement | null;
    theme?: AureaTheme;
    defaultTheme?: AureaTheme;
    onThemeChange?: (theme: AureaTheme) => void;
    density?: AureaDensity;
    defaultDensity?: AureaDensity;
    onDensityChange?: (density: AureaDensity) => void;
}): React.JSX.Element;
export type AureaToastType = "info" | "success" | "warning" | "danger";
export declare const useToast: () => import("@base-ui/react").UseToastManagerReturnValue<any>;
export type AureaThemeName = "dark" | "light";
export type { AureaDensity };
export declare function useAureaTheme(): {
    theme: AureaThemeName | null;
    density: AureaDensity | null;
    setTheme: (t: AureaThemeName) => void;
    setDensity: (d: AureaDensity) => void;
    toggleTheme: () => void;
};
export type IconName = string;
export type IconSize = "sm" | "md" | "lg" | "xl";
export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    name: IconName;
    spriteUrl?: string;
    size?: Responsive<IconSize>;
}
export declare function Icon({ name, spriteUrl, size, className, ...props }: IconProps): React.JSX.Element;
