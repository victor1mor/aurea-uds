// VITRINE da categoria — é este arquivo que `@aurea-uds/react/code` resolve. Sem `"use client"`
// de propósito: a diretiva contamina o módulo inteiro e faria a marcação pura chegar como cliente
// por vizinhança (ADR-0026; o check 26b reprova quem a puser de volta aqui).
export * from "./code-client.js";
export { LogStream } from "./markup.js";
