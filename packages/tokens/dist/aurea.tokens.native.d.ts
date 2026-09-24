// Gerado por scripts/build-tokens.mjs.
export type AureaColor = {hex: string; p3: string; oklch: string | null};
export type AureaShadow = {offsetX: number; offsetY: number; blurRadius: number; spreadDistance: number; color: string};
export declare const REM_EM_DP: number;
export declare const base: Record<string, number | string | number[] | AureaColor | AureaShadow>;
export declare const tracking: Record<string, number>;
export declare const breakpoints: Record<string, number>;
export declare const themes: Record<"dark" | "light", Record<string, AureaColor | number>>;
export declare const densities: Record<"compact" | "comfortable" | "spacious", Record<string, number>>;
