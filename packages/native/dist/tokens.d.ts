export type AureaThemeName = "dark" | "light";
export type AureaDensity = "compact" | "comfortable" | "spacious";
/** Sombra no formato do `boxShadow` do RN 0.76+, que a Etapa 2 mediu ser 1:1 com o CSS. */
export type AureaShadow = {
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    spreadDistance: number;
    color: string;
};
/**
 * Peso -> nome de família que o `fontFamily` do RN aceita. **Total de propósito:** pedir um peso
 * nunca devolve `undefined`, porque `fontFamily: undefined` cai na fonte de sistema em silêncio,
 * que é a classe de defeito que este pacote inteiro existe para não ter.
 *
 * O que chega de fora **não** é total — ver `AureaFontInput` e `normalizarEscala`.
 */
export type AureaFontScale = Record<400 | 500 | 600 | 700, string> & {
    /** Só o papel `ui` tem itálico no pacote de fontes; nos outros é `undefined`. */
    italic?: string;
};
/**
 * O que o consumidor INJETA, e é parcial porque o pacote de fontes é parcial — medido em
 * 03/09/2026 no `@aurea-uds/fonts/native`:
 *
 *     ui         400  400i  500  600  700
 *     editorial            500  600  700      ← não há 400
 *     code       400       500  600           ← não há 700
 *
 * É a grade que o IBM Plex desenha, não um esquecimento nosso.
 */
export type AureaFontInput = Partial<Record<"400" | "500" | "600" | "700" | "400i", string>>;
export type AureaTokens = {
    theme: AureaThemeName;
    density: AureaDensity;
    /** Cores em **hex**, e só hex. Ver a nota sobre a ADR-0027 abaixo. */
    color: Record<string, string>;
    /** Todo token numérico, em dp — espaçamento, raio, tipografia, altura, duração, camada. */
    size: Record<string, number>;
    /** Família por papel de tipografia e peso. */
    font: {
        ui: AureaFontScale;
        editorial: AureaFontScale;
        code: AureaFontScale;
    };
    /** `boxShadow` do RN 0.76+. */
    shadow: Record<string, AureaShadow>;
    /** `cubicBezier` como os 4 números do DTCG. Não há curva de CSS no RN. */
    easing: Record<string, readonly [number, number, number, number]>;
    /** RAZÃO de `em`, não dp: `letterSpacing` no RN é absoluto, então multiplique pelo `fontSize`. */
    tracking: Record<string, number>;
    /** 1rem em dp. Medido no navegador (raiz sem `font-size` = 16px), não presumido. */
    remInDp: number;
};
/** O mapa que o consumidor injeta para o texto sair no IBM Plex. Ver `AureaProviderProps`. */
export type AureaFontFamilies = {
    ui: AureaFontInput;
    editorial: AureaFontInput;
    code: AureaFontInput;
};
/**
 * Resolve os tokens para um par (tema, densidade). Puro e sem estado: o provider chama isto
 * dentro de um `useMemo` e o resultado é o que os componentes leem.
 *
 * **Cor sai em `hex`, e isso não é escolha nossa.** A ADR-0027 mediu o interpretador de cor do
 * próprio React Native rodando no Node: ele RECUSA `oklch()`, `lab()`, `color(display-p3 …)` e
 * até `color(srgb …)` — nas versões 0.81.5 e 0.87.0, e é JavaScript compartilhado entre iOS e
 * Android. Passar `p3` a um `style` faz a cor ser DESCARTADA, em silêncio. Os campos `p3` e
 * `oklch` seguem no alvo de tokens como intenção registrada; aqui eles não passam.
 */
export declare function resolverTokens(theme: AureaThemeName, density: AureaDensity, fontFamilies?: AureaFontFamilies): AureaTokens;
