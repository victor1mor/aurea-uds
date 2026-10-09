// Aurea nativo — `Text`, a primitiva que a web nunca precisou ter.
//
// É o **bloqueio 3** da §5.2 do NATIVE.md, e a razão dele é estrutural, não de escopo:
//
//   web:    body { font-family:var(--font-ui); font-size:var(--text-sm);
//                  line-height:var(--leading-normal) }        ← e TODO <p>/<span>/<h1> herda
//   nativo: não há cascata de estilo de texto através de `View`, e não há `<p>`.
//
// **Toda string precisa de um `<Text>` com estilo explícito.** Sem esta primitiva, cada
// componente do pacote reimplementaria a escala — e a primeira divergência entre duas
// reimplementações seria invisível até alguém comparar duas telas.
//
// O `Prose` da web NÃO é o par disto: a ficha dele diz "não é o parser", ele é a pele do texto
// longo. Aqui a primitiva vem antes de qualquer pele.
//
// ── O que ele NÃO tem, e por quê (passo 5 do BUILDING.md: escopo menor) ──────────────────────
// • `numberOfLines`, `selectable`, `onPress` e o resto da API de `Text` do RN passam por `...rest`
//   — não são reimplementados nem restringidos;
// • não há `variant="h1"`. Título é `size` + `weight`, e inventar uma escala semântica paralela à
//   que os tokens já publicam seria uma segunda verdade sobre tipografia.
import * as React from "react";
import {Text as TextRN, type TextProps as TextPropsRN} from "react-native";
import {canto, criarFolha, letraDoToken} from "./estilos.js";
import {useAureaTokens, useSobreAMarca} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

/** A escala dos tokens (`--text-xs` … `--text-5xl`). `md` é o corpo, como no `body` da web. */
export type AureaTextSize =
  "xs" | "sm" | "md" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
/** Os pesos que o pacote de fontes entrega (o 800 desde a 0.28.0, GAR-16). Ver ADR-0039: cada peso é uma FAMÍLIA. */
export type AureaTextWeight = 400 | 500 | 600 | 700 | 800;
/** Papel de tipografia — os `--font-*` da Aurea (o `heading` desde a 0.28.0). */
export type AureaTextFont = "ui" | "editorial" | "code" | "heading";
/** O que a cor SIGNIFICA. Mesmo vocabulário do `tone` do Button (ADR-0044). */
export type AureaTextTone =
  "default" | "muted" | "subtle" | "primary" | "link" | "danger" | "success" | "warning" | "info";
export type AureaTextLeading = "none" | "tight" | "normal" | "relaxed";

/**
 * O PAPEL do texto — B-02, 25/09/2026, no molde do componente de tipografia da referência. Uma lista
 * fechada: título 1–6, texto, texto pequeno, texto mínimo e código.
 */
export type AureaTextType =
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "body-sm" | "body-xs" | "code";

export interface TextProps extends TextPropsRN {
  /**
   * O papel (B-02). Dá tamanho, peso, entrelinha e fonte de uma vez, com os números da
   * referência — os MESMOS da web, sem o degrau a mais do `size`. Uma opção solta passada junto
   * (`size`, `weight`…) continua valendo por cima dele.
   */
  type?: AureaTextType;
  size?: AureaTextSize;
  weight?: AureaTextWeight;
  font?: AureaTextFont;
  tone?: AureaTextTone;
  leading?: AureaTextLeading;
  /** Só o papel `ui` tem itálico no pacote de fontes; nos outros isto não tem efeito. */
  italic?: boolean;
  align?: "auto" | "left" | "right" | "center";
  /** Aplica o `tracking` do token. É RAZÃO de `em`: multiplicado pelo `fontSize` aqui dentro. */
  tracking?: "tight" | "normal" | "wide" | "wider" | "widest";
  /**
   * GAR-16 (0.28.0): algarismos da mesma largura (`fontVariant: ["tabular-nums"]`, iOS e Android) —
   * para número que alinha em coluna ou muda na tela. Desligado por padrão, como na web.
   */
  numeric?: boolean;
}

// 🔴 A ESCALA TEM CINCO DEGRAUS QUE SE ENXERGAM, E DEZ NOMES — ordem do Victor, 19/09/2026,
// olhando o app no aparelho: *"o tamanho das fontes: existem variações demais, fica muito
// estranho"*.
//
// Medido no token antes de mexer: **12 · 13 · 14 · 16** eram quatro degraus em quatro pontos.
// Lado a lado, isso não lê como hierarquia — lê como erro. Uma tela só (a de Início) mostrava de
// 12 a 36 em SETE tamanhos.
//
// A escala nova sobe 25% por degrau, que é o mínimo para dois vizinhos serem distinguíveis a olho
// nu, e **nada encolhe** — o que importa, porque o Victor tem baixa visão:
//
//     legenda, apoio .............. 13   (era 12)
//     texto corrido, controle ..... 16   (era 13 e 14)
//     nome de cartão .............. 20   (era 16 e 18)
//     título de tela .............. 25   (era 20 e 24)
//     número em destaque .......... 31   (era 30)
//
// ⚠ **Os DEZ nomes continuam existindo, e alguns apontam para o mesmo número** — `sm`, `md` e
// `base` são 16; `lg` e `xl` são 20. Isso é de propósito: `size` é API pública dos dois alvos, e
// apagar nome quebraria consumidor sem ganhar nada. O que encolheu foi a lista de VALORES, que é
// o que a pessoa vê. Por isso nenhum componente do pacote precisou trocar de degrau: os degraus é
// que se juntaram.
//
// ⚠ **O topo (36 e 48) não foi tocado.** A queixa é do pé da escala, e ali as razões já eram boas
// (1,2 e 1,33). Mexer sem queixa é inventar trabalho.
//
// ⚠ **O limite, medido e declarado:** com a letra do sistema em 1,3× o corpo de 16 vira ~21 e a
// linha ~29. Isso cabe em toda cápsula, MENOS o controle `sm` na densidade compacta (28 de
// altura), que estoura por 1 ponto. Em 1,5× vários estouram — e isso já era verdade na escala
// antiga.
// ⚠ **ESCALA DA REFERÊNCIA, 24/09/2026 (ADR-0050, que substitui a 0049).** Os NÚMEROS são os da
// web — 12 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48, a escala que a referência usa. O que muda no
// telefone é o DEGRAU que cada papel pega, e isso também é da referência, lido no pacote dela: na
// web a peça é `text-sm` (14) e o apoio `text-xs` (12); no nativo dela a peça é `text-base` (16) e o
// apoio `text-sm` (14). Por isso aqui os nomes pequenos sobem UM degrau: o mesmo `size="sm"` que é
// 14 na web é 16 no telefone. Os componentes não trocam de nome; o mapa é que traduz o papel.
const TAMANHO: Record<AureaTextSize, string> = {
  xs: "textSm", sm: "textBase", md: "textBase", base: "textBase", lg: "textLg",
  xl: "textXl", "2xl": "text2xl", "3xl": "text3xl", "4xl": "text4xl", "5xl": "text5xl",
};
const ENTRELINHA: Record<AureaTextLeading, string> = {
  none: "leadingNone", tight: "leadingTight", normal: "leadingNormal", relaxed: "leadingRelaxed",
};

// Os papéis do B-02. Os números são os da referência (do pacote nativo dela), lidos
// no pacote: títulos do `4xl` ao `base` em seminegrito; texto em `base`, `sm` e `xs`. ⚠ Aqui o
// tamanho aponta para o TOKEN direto, e não para o `TAMANHO` acima: a referência não sobe o
// degrau no componente de tipografia (o `body-sm` dela é 14, como na web), então o papel também não sobe.
interface Papel { tamanho: string; peso: AureaTextWeight; entrelinha: string; fonte: AureaTextFont; junto?: true }
// O título usa o papel `heading` (GAR-16, 0.28.0) — hoje a mesma fonte do texto, no mesmo peso 600.
const titulo = (tamanho: string): Papel => ({tamanho, peso: 600, entrelinha: "leadingTight", fonte: "heading", junto: true});
const PAPEL: Record<AureaTextType, Papel> = {
  h1: titulo("text4xl"), h2: titulo("text3xl"), h3: titulo("text2xl"),
  h4: titulo("textXl"), h5: titulo("textLg"), h6: titulo("textBase"),
  body: {tamanho: "textBase", peso: 400, entrelinha: "leadingRelaxed", fonte: "ui"},
  "body-sm": {tamanho: "textSm", peso: 400, entrelinha: "leadingRelaxed", fonte: "ui"},
  "body-xs": {tamanho: "textXs", peso: 400, entrelinha: "leadingRelaxed", fonte: "ui"},
  code: {tamanho: "textSm", peso: 400, entrelinha: "leadingNormal", fonte: "code"},
};
const COR: Record<AureaTextTone, string> = {
  default: "foreground", muted: "mutedForeground", subtle: "subtleForeground",
  // ⚠ `primary` e `link` são o MESMO amarelo em matiz, e NÃO são intercambiáveis.
  // `primary` é o amarelo de PREENCHER, e escrito sobre o tema claro ele mede 1,73:1 — some.
  // `link` é o de ESCREVER: mesmo matiz, mais escuro, 5,02:1 no claro, e no escuro é o próprio
  // amarelo da marca. Quem quer texto amarelo legível nos dois temas usa `link`.
  primary: "primary", link: "link", danger: "destructive", success: "success",
  warning: "warning", info: "info",
};

// A folha cobre só o que NÃO depende das props — a cor por tom. O resto (tamanho, peso, família)
// é derivado por instância, porque são 10 × 4 × 3 combinações e uma folha com 120 entradas seria
// mais cara de criar do que os objetos que ela pouparia.
const folha = criarFolha((t: AureaTokens) => {
  const tons = {} as Record<AureaTextTone, {color: string}>;
  for (const [tom, token] of Object.entries(COR) as [AureaTextTone, string][]) {
    // ADR-0061: `success`, `info`, `warning` e `destructive` são a cor de FUNDO cheio; a LETRA é o
    // par `-400` de cada tema. Na 0.27.0 este mapa ficou de fora e o texto de tom saía com a cor de
    // fundo — no escuro, ~2,5:1. Achado na 0.28.0; `paleta-adr0061.test.tsx` cobra.
    tons[tom] = {color: letraDoToken(t, token) ?? t.color.foreground};
  }
  return tons;
});

/**
 * Texto da Aurea. Sem provider acima, `useAureaTokens` levanta — de propósito: um padrão
 * silencioso aqui desenharia o app inteiro no tema errado sem nada acusar.
 *
 * ⚠ **`fontWeight` não aparece em lugar nenhum deste arquivo, e isso é a ADR-0039.** Na Atkinson
 * Hyperlegible (como era na IBM Plex) só Regular, Italic e Bold moram na família "Atkinson
 * Hyperlegible Next"; Medium e SemiBold são famílias
 * próprias. Pedir peso 600 por `fontWeight` devolveria o Regular sintetizado — **em silêncio**.
 * Quem escolhe a fonte aqui é o `fontFamily`, com o nome PostScript que o provider já resolveu.
 */
export function Text({
  type, size, weight: pesoPedido, font: fontePedida, tone = "default", leading,
  italic = false, align, tracking: trackingPedido, numeric = false, style, ...rest
}: TextProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const sobreAMarca = useSobreAMarca();
  // Sem `type`, os padrões de sempre (`md`, 400, `ui`, `normal`) — nada muda para quem já usa.
  const papel = type ? PAPEL[type] : undefined;
  const weight = pesoPedido ?? papel?.peso ?? 400;
  const font = fontePedida ?? papel?.fonte ?? "ui";
  const tracking = trackingPedido ?? (papel?.junto ? "tight" : undefined);

  const proprio = React.useMemo(() => {
    const fontSize = size
      ? t.size[TAMANHO[size]] ?? t.size.textBase
      : papel ? t.size[papel.tamanho] ?? t.size.textBase : t.size[TAMANHO.md];
    const razao = leading
      ? t.size[ENTRELINHA[leading]] ?? t.size.leadingNormal
      : papel ? t.size[papel.entrelinha] ?? t.size.leadingNormal : t.size.leadingNormal;
    const escala = t.font[font];
    // O itálico é UMA fonte, não um estilo sintético: `fontStyle:"italic"` faria o sistema
    // inclinar o desenho reto, e a Atkinson tem itálico desenhado. Só o `ui` o tem — nos outros
    // papéis o pedido cai no peso pedido, que é o comportamento honesto.
    const familia = italic && escala.italic ? escala.italic : escala[weight];
    return {
      fontFamily: familia,
      fontSize,
      // `lineHeight` no RN é ABSOLUTO (dp), não múltiplo — os tokens de entrelinha são razão.
      lineHeight: fontSize * razao,
      // `letterSpacing` também é absoluto: o token é razão de `em` e multiplica o tamanho.
      // É a impedância que a Etapa 2 mediu e resolveu emitindo razão em vez de dp.
      ...(tracking ? {letterSpacing: fontSize * t.tracking[`tracking${tracking[0].toUpperCase()}${tracking.slice(1)}`]} : null),
      ...(align ? {textAlign: align} : null),
      ...(numeric ? {fontVariant: ["tabular-nums" as const]} : null),
      // O código leva a pele do `code` da web: fundo, canto e um recheio pequeno (a referência).
      ...(type === "code" ? {
        alignSelf: "flex-start" as const, backgroundColor: t.color.surface2, ...canto(t.size.radiusXs),
        paddingHorizontal: t.size.space1, paddingVertical: t.size.space05,
      } : null),
    };
  }, [t, type, papel, size, weight, font, leading, italic, align, tracking, numeric]);

  // 🔴 SOBRE UMA SUPERFÍCIE DA MARCA A COR É FORÇADA, e ela vence até o tom explícito.
  // Medido contra o `primary` nos dois temas: texto comum dá **1,83 no escuro**, esmaecido
  // **1,35**, e `danger` menos ainda. **Nenhum tom alcança os 4,5 da norma sobre o amarelo** —
  // só o `primary-foreground`, com 4,54. Respeitar um `tone` ali dentro seria obedecer a prop e
  // entregar texto que não se lê.
  // ⚠ **A consequência está declarada e não é neutra:** dentro de um cartão da marca não existe
  // texto esmaecido. A hierarquia sai de PESO e TAMANHO.
  // ⚠ E `style` continua por último de propósito: quem passa cor à mão assume a conta.
  return <TextRN style={[s[tone], sobreAMarca && {color: sobreAMarca.tinta}, proprio, style]} {...rest} />;
}


// ── Heading, Paragraph e Code — B-02, 25/09/2026 ───────────────────────────────────────────────
// Os atalhos do componente de tipografia do nativo da referência (título, parágrafo e código),
// com a API DELA: o papel entra por `type`, e não por `level`/`size` como na web dela. Cada alvo
// segue a referência do seu lado. As opções são as mesmas quatro dela — cor, peso, alinhamento, corte —, todas
// listas fechadas.
export type AureaTypographyColor = "default" | "muted";
export type AureaTypographyWeight = "normal" | "medium" | "semibold" | "bold";
export type AureaTypographyAlign = "start" | "center" | "end" | "justify";
interface AureaTypographyBase extends Omit<TextPropsRN, "children"> {
  color?: AureaTypographyColor;
  weight?: AureaTypographyWeight;
  /** `start`/`end` viram `left`/`right`, que o React Native já espelha em RTL (nota da referência). */
  align?: AureaTypographyAlign;
  /** Uma linha só, cortada com reticências (`numberOfLines={1}`). */
  truncate?: boolean;
  children?: React.ReactNode;
}
const PESO: Record<AureaTypographyWeight, AureaTextWeight> = {normal: 400, medium: 500, semibold: 600, bold: 700};
const ALINHA = {start: "left", center: "center", end: "right", justify: "justify"} as const;
function papelDe(type: AureaTextType, {color, weight, align, truncate, style, ...rest}: AureaTypographyBase) {
  return (
    <Text {...rest} type={type} tone={color === "muted" ? "muted" : "default"}
          weight={weight ? PESO[weight] : undefined}
          numberOfLines={truncate ? 1 : rest.numberOfLines}
          style={[align ? {textAlign: ALINHA[align]} : null, style]} />
  );
}

export interface HeadingProps extends AureaTypographyBase { type?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" }
/** Título. Marca `accessibilityRole="header"` sozinho, como a referência. */
export function Heading({type = "h1", accessibilityRole = "header", ...rest}: HeadingProps) {
  return papelDe(type, {accessibilityRole, ...rest});
}

export interface ParagraphProps extends AureaTypographyBase { type?: "body" | "body-sm" | "body-xs" }
/** Parágrafo de texto corrido, em três tamanhos: 16, 14 e 12. */
export function Paragraph({type = "body", ...rest}: ParagraphProps) {
  return papelDe(type, rest);
}

export type CodeProps = AureaTypographyBase;
/** Um trecho curto de código no meio da frase, com a fonte mono e o fundo do `code` da web. */
export function Code(props: CodeProps) {
  return papelDe("code", props);
}
