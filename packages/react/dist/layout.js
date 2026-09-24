// VITRINE da categoria — é este arquivo que `@aurea-uds/react/layout` resolve. Sem `"use client"`
// de propósito: a diretiva contamina o módulo inteiro e faria a marcação pura chegar como cliente
// por vizinhança (ADR-0026; o check 26b reprova quem a puser de volta aqui).
export * from "./layout-client.js";
export { Card, Stack, Cluster, Grid } from "./markup.js";
// PORTADO no merge de 28/08/2026 — sai do markup (servidor), como os demais de marcação.
export { AspectRatio } from "./markup.js";
