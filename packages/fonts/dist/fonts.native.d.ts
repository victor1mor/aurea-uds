// Gerado por packages/fonts/build-fonts.mjs. NÃO EDITAR.
export type AureaFontRole = "ui" | "editorial" | "code";
export type AureaFontFile = {
  file: string; postScriptName: string; family: string; typographicFamily: string;
  role: AureaFontRole; weight: number; style: "normal" | "italic";
};
/** nome PostScript -> asset, no formato que o `useFonts` do expo-font recebe. */
export declare const AUREA_FONTS: Record<string, number>;
/** papel -> peso -> nome PostScript, que é o que vai em `fontFamily`. */
export declare const FONT_FAMILIES: {
  ui: Record<"400" | "500" | "600" | "700" | "400i", string>;
  editorial: Record<"500" | "600" | "700", string>;
  code: Record<"400" | "500" | "600", string>;
};
export declare const AUREA_FONT_FILES: readonly AureaFontFile[];
