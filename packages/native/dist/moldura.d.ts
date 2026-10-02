import * as React from "react";
import { type TomDeCor } from "./estilos.js";
import { type AureaIcon } from "./icon.js";
export interface IconeEmMolduraProps {
    icon: AureaIcon;
    /** O lado da moldura, em dp — sempre de um token. */
    moldura: number;
    /** O lado do glifo, em dp — sempre de um token. */
    glifo: number;
    tone?: TomDeCor;
    /**
     * A cor de BAIXO, quando há algo atrás. No escuro os fundos suaves são translúcidos (o
     * `successBg` é `oklch(0.42 0.11 150 / 0.36)`), e o trilho da `Timeline` aparecia através da
     * moldura. É o mesmo truque do ponto da linha do tempo: a cor da superfície faz o buraco.
     */
    sobre?: string;
}
export declare function IconeEmMoldura({ icon, moldura, glifo, tone, sobre }: IconeEmMolduraProps): React.JSX.Element;
