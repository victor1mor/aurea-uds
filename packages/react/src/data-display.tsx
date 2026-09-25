// VITRINE da categoria — é este arquivo que `@aurea-uds/react/data-display` resolve. Sem
// `"use client"` de propósito: a diretiva contamina o módulo inteiro e faria a marcação pura
// chegar como cliente por vizinhança (ADR-0026; o check 26b reprova quem a puser de volta aqui).
export * from "./data-display-client.js";
export {Kbd, KPI, DataList, Timeline, Prose, Text, Heading, Paragraph, Code,
  type TextProps, type HeadingProps, type ParagraphProps, type CodeProps, type TypographyType,
  type TypographyColor, type TypographyWeight, type TypographyAlign, type HeadingLevel, type ParagraphSize} from "./markup.js";
