/** Os pontos da escala, em pixels. UMA escala para os dois mensuráveis — o prefixo da classe
 *  (`vp-` / `ct-`) é que diz de quê são os pixels. */
export declare const ESCALA: {
    readonly "2xs": 360;
    readonly xs: 480;
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
    readonly "2xl": 1536;
};
/** O subconjunto que o CONTAINER consulta. Contêiner de 1280px é raro o bastante para não valer
 *  regra, e ponto que ninguém usa é peso morto na folha. Cresce por medição. */
export declare const ESCALA_CONTAINER: {
    readonly "2xs": 360;
    readonly xs: 480;
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
};
export type Breakpoint = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ContainerBreakpoint = "2xs" | "xs" | "sm" | "md" | "lg";
/** Os pontos do maior para o menor. A resolução percorre nesta ordem e para no primeiro que
 *  couber, que é a semântica de `min-width`: o último ponto atingido vence. */
export declare const PONTOS_DESC: ReadonlyArray<Breakpoint>;
export declare const PONTOS_CONTAINER_DESC: ReadonlyArray<ContainerBreakpoint>;
