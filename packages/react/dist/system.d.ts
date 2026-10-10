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
export type { IconName, PhosphorIconName, AureaIconNames, IconWeight } from "./icon-names.js";
import { type IconName, type IconWeight } from "./icon-names.js";
export type IconSize = "sm" | "md" | "lg" | "xl";
/**
 * O DESENHO do próprio app, como no nativo (`AureaIcon`, R-11) — MNT-02, ADR-0064, 10/10/2026. Um
 * componente que devolve o `<svg>` dele; recebe a classe e o tamanho da Aurea, e herda a cor
 * (`currentColor`). Serve ao glifo que o Phosphor não tem (o roteador de um mapa de rede) e ao
 * logotipo do app, sem sprite próprio nem `declare module`. Não tem forma cheia.
 */
export type AureaIconComponent = (props: React.SVGAttributes<SVGSVGElement>) => React.ReactElement;
/** Um ícone: o NOME de um glifo do sprite, ou o DESENHO do app. */
export type AureaIcon = IconName | AureaIconComponent;
export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "name"> {
    name: AureaIcon;
    spriteUrl?: string;
    size?: Responsive<IconSize>;
    /** `fill` desenha a forma cheia — a do item escolhido (ADR-0053). Nome próprio do app fica no `regular`. */
    weight?: IconWeight;
}
export declare function Icon({ name, spriteUrl, size, weight, className, ...props }: IconProps): React.JSX.Element;
