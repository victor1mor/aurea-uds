import React from "react";
import { type AureaStrings, type AureaTheme, type AureaDensity } from "./pure.js";
export { cx, fundirRender, defaultStrings, ptBR, defaultSpriteUrl, universalStates, stateSeverity, type AureaStrings, type UniversalState, type AureaTheme, type AureaDensity } from "./pure.js";
export declare const StringsContext: React.Context<AureaStrings>;
export declare const useAureaStrings: () => AureaStrings;
export declare const SpriteContext: React.Context<string>;
export declare const useSpriteUrl: () => string;
export declare const ThemeContext: React.Context<{
    theme?: AureaTheme;
    setTheme: (t: AureaTheme) => void;
    toggleTheme: () => void;
}>;
/** Tema atual e como trocá-lo. Fora de um `AureaProvider`, devolve `undefined` e no-ops — não
 *  lança: um componente isolado num teste não deve morrer por falta de provider. */
export declare const useTheme: () => {
    theme?: AureaTheme;
    setTheme: (t: AureaTheme) => void;
    toggleTheme: () => void;
};
export declare const DensityContext: React.Context<{
    density?: AureaDensity;
    setDensity: (d: AureaDensity) => void;
}>;
/** Densidade atual e como trocá-la. Mesma regra do `useTheme`. */
export declare const useDensity: () => {
    density?: AureaDensity;
    setDensity: (d: AureaDensity) => void;
};
export declare const DentroDoProviderContext: React.Context<boolean>;
export declare const PortalContext: React.Context<HTMLElement | null | undefined>;
export declare const usePortalContainer: () => HTMLElement | null | undefined;
export interface Reordenavel<E extends HTMLElement> {
    ref: React.RefObject<E | null>;
    pego: number | null;
    aviso: string;
    teclado: (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => void;
    ponteiroBaixo: (e: React.PointerEvent<HTMLButtonElement>, i: number) => void;
    ponteiroMove: (e: React.PointerEvent) => void;
    ponteiroSolta: () => void;
}
export declare function useReorder<E extends HTMLElement>({ count, order, onReorder, rowSelector, handleSelector }: {
    count: number;
    order: unknown;
    onReorder: (from: number, to: number) => void;
    rowSelector: string;
    handleSelector: string;
}): Reordenavel<E>;
