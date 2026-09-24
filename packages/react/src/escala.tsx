// GERADO por scripts/build-responsive-layer.mjs — não editar à mão.
//
// A escala canônica, lida de `packages/tokens/dist/aurea.tokens.css`. É a MESMA leitura que
// gera as `@media`/`@container` do core, e é por isso que o resolvedor de runtime e o CSS
// não podem discordar: não há dois números, há um.
//
// Sem `"use client"`: é dado, e um componente de servidor precisa dos tipos.

/** Os pontos da escala, em pixels. UMA escala para os dois mensuráveis — o prefixo da classe
 *  (`vp-` / `ct-`) é que diz de quê são os pixels. */
export const ESCALA={"2xs":360,"xs":480,"sm":640,"md":768,"lg":1024,"xl":1280,"2xl":1536} as const;

/** O subconjunto que o CONTAINER consulta. Contêiner de 1280px é raro o bastante para não valer
 *  regra, e ponto que ninguém usa é peso morto na folha. Cresce por medição. */
export const ESCALA_CONTAINER={"2xs":360,"xs":480,"sm":640,"md":768,"lg":1024} as const;

export type Breakpoint="2xs"|"xs"|"sm"|"md"|"lg"|"xl"|"2xl";
export type ContainerBreakpoint="2xs"|"xs"|"sm"|"md"|"lg";

/** Os pontos do maior para o menor. A resolução percorre nesta ordem e para no primeiro que
 *  couber, que é a semântica de `min-width`: o último ponto atingido vence. */
export const PONTOS_DESC:ReadonlyArray<Breakpoint>=["2xl","xl","lg","md","sm","xs","2xs"];
export const PONTOS_CONTAINER_DESC:ReadonlyArray<ContainerBreakpoint>=["lg","md","sm","xs","2xs"];
