// VITRINE da categoria — é este arquivo que `@aurea-uds/react/navigation` resolve. Sem
// `"use client"` de propósito: a diretiva contamina o módulo inteiro e faria a marcação pura
// chegar como cliente por vizinhança (ADR-0026; o check 26b reprova quem a puser de volta aqui).
export * from "./navigation-client.js";
// `Header` é o nome de mercado do antigo `Topbar` (07/10/2026); os dois são o mesmo componente.
export {Header, Topbar, type HeaderVariant, type HeaderProps, type TopbarVariant} from "./markup.js";
