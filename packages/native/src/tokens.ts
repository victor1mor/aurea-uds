// Aurea nativo — resolver os tokens para UM par (tema, densidade).
//
// Lote 0 do NATIVE.md, sobre a ADR-0037 (`StyleSheet` puro, a camada de tema é NOSSA).
//
// É AQUI que a cascata que o CSS dá de graça deixa de existir. Na web, `data-theme` e
// `data-density` no `<html>` reescrevem custom properties e todo `var()` abaixo enxerga o valor
// novo, resolvido no USO. No React Native não há cascata, não há `var()` e não há ligação tardia:
// alguém tem de escolher, uma vez, qual dos três valores de `--control-h-md` é o valor. Esse
// alguém é esta função.
//
// A PRECEDÊNCIA É MEDIDA, não convencionada — e é a razão de o `mesclar` existir em vez de um
// spread solto. Rodado sobre `@aurea-uds/tokens/native` em 02/09/2026:
//   • 8 nomes existem no `base` E na densidade — controlH{Xs,Sm,Md,Lg,Xl}, rowH, cardPad,
//     sectionGap. No CSS a densidade ganha;
//   • 1 nome existe no `base` E no tema — `warning400`. No CSS o tema ganha.
// Logo: base < tema < densidade. Inverter isso devolve o app inteiro numa densidade só, e em
// silêncio — o teste `tokens.test.ts` prova a ordem contra esse defeito.
import {base, themes, densities, tracking, REM_EM_DP} from "@aurea-uds/tokens/native";

export type AureaThemeName = "dark" | "light";
export type AureaDensity = "compact" | "comfortable" | "spacious";

/** Sombra no formato do `boxShadow` do RN 0.76+, que a Etapa 2 mediu ser 1:1 com o CSS. */
export type AureaShadow = {
  offsetX: number; offsetY: number; blurRadius: number; spreadDistance: number; color: string;
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
  font: {ui: AureaFontScale; editorial: AureaFontScale; code: AureaFontScale};
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
export type AureaFontFamilies = {ui: AureaFontInput; editorial: AureaFontInput; code: AureaFontInput};

type Cor = {hex: string; p3: string; oklch: string | null};
const ehCor = (v: unknown): v is Cor => typeof v === "object" && v !== null && "hex" in (v as object);
const ehSombra = (v: unknown): v is AureaShadow =>
  typeof v === "object" && v !== null && "blurRadius" in (v as object);

// Um objeto por grupo, na ordem em que ganham. `Object.assign` sobre um alvo novo — não sobre o
// `base` importado, que é do módulo de tokens e não é nosso para mutar.
function mesclar(...grupos: Record<string, unknown>[]): Record<string, unknown> {
  return Object.assign({}, ...grupos) as Record<string, unknown>;
}

const PESOS = [400, 500, 600, 700] as const;

/**
 * Fecha a grade parcial que o pacote de fontes emite numa escala TOTAL.
 *
 * Existe por um defeito concreto, achado em 03/09/2026 ao escrever o app de smoke test: o tipo
 * prometia os quatro pesos para os três papéis, e o mapa real não tem `editorial[400]` nem
 * `code[700]`. Quem pedisse recebia `undefined`, o RN cairia na fonte de sistema **em silêncio**,
 * e a tela pareceria certa num peso e errada noutro — a classe de defeito mais cara deste alvo,
 * porque não levanta e não some.
 *
 * A queda é para o peso mais PRÓXIMO que existe, e em empate para o mais leve: pedir 400 num
 * papel que só tem 500+ devolve o 500, e não o 700 — engordar o texto é mais visível do que
 * afiná-lo. Sem nenhum peso, cai na família crua do token, que é o comportamento de quem não
 * injetou mapa nenhum.
 */
function normalizarEscala(entrada: AureaFontInput | undefined, familiaCrua: string): AureaFontScale {
  const disponiveis = PESOS.filter((p) => entrada?.[String(p) as keyof AureaFontInput]);
  const escala = {} as Record<400 | 500 | 600 | 700, string> & {italic?: string};
  for (const p of PESOS) {
    const exato = entrada?.[String(p) as keyof AureaFontInput];
    if (exato) { escala[p] = exato; continue; }
    const perto = disponiveis
      .slice()
      .sort((a, b) => Math.abs(a - p) - Math.abs(b - p) || a - b)[0];
    escala[p] = (perto && entrada?.[String(perto) as keyof AureaFontInput]) || familiaCrua;
  }
  const italico = entrada?.["400i"];
  if (italico) escala.italic = italico;
  return escala;
}

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
export function resolverTokens(
  theme: AureaThemeName,
  density: AureaDensity,
  fontFamilies?: AureaFontFamilies,
): AureaTokens {
  const cru = mesclar(base as Record<string, unknown>, themes[theme], densities[density]);

  const color: Record<string, string> = {};
  const size: Record<string, number> = {};
  const shadow: Record<string, AureaShadow> = {};
  const easing: Record<string, readonly [number, number, number, number]> = {};
  const texto: Record<string, string> = {};

  for (const [nome, valor] of Object.entries(cru)) {
    if (ehCor(valor)) color[nome] = valor.hex;
    else if (ehSombra(valor)) shadow[nome] = valor;
    else if (typeof valor === "number") size[nome] = valor;
    else if (Array.isArray(valor)) easing[nome] = valor as unknown as readonly [number, number, number, number];
    else if (typeof valor === "string") texto[nome] = valor;
    // Nada cai fora: o check do validador cobra que a classificação seja total, porque um token
    // que some daqui some do app sem ninguém acusar.
  }

  // Sem mapa injetado, a família CRUA do token preenche os quatro pesos: é o token dizendo
  // "IBM Plex Sans", que no aparelho vira Regular ou fonte de sistema. Honesto e previsível —
  // e é por isso que o `fontFamilies` do provider existe.
  const font = {
    ui: normalizarEscala(fontFamilies?.ui, texto.fontUi ?? "System"),
    editorial: normalizarEscala(fontFamilies?.editorial, texto.fontEditorial ?? "System"),
    code: normalizarEscala(fontFamilies?.code, texto.fontCode ?? "System"),
  };

  return {theme, density, color, size, font, shadow, easing, tracking: {...tracking}, remInDp: REM_EM_DP};
}
