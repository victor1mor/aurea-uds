// Aurea nativo — o que MOSTRA dado: `Badge`, `Status`, `Avatar` e `KPI`.
//
// Lote 2 do `NATIVE.md` §5.5. O consumidor medido (§5.1) pede, nesta categoria, três coisas
// concretas: **métricas** no painel (`KPI`, e o `Progress` do módulo de feedback ao lado dele),
// um **contador de não lidos** na navegação inferior (`Badge` ancorado) e **avisos** com estado
// (`Status`). O `Avatar` entra pelo cadastro.
//
// Medido antes de escrito, com a linha:
//
//   .badge        aurea.css:976   pílula, minH space-6, padding 3/9, borda 1, textXs, weightMedium
//   .badge-xs/sm/lg  :983-985     as três medidas alternativas
//   .badge-dot    aurea.css:988   space-2 quadrado, redondo, cor corrente
//   .badge-*(tom) :1040-1043      cor X-400, fundo X-bg, borda misturada
//   .badge-solid/outline :1053-4  as duas ênfases além do `soft`
//   .status       aurea.css:1060  linha, gap space-2, mutedForeground, textSm
//   .status-dot   aurea.css:1055  8 quadrado, redondo, halo de 3 na cor corrente a 14%
//   .avatar       aurea.css:1196  quadrado da altura de controle, redondo, borda borderStrong
//   .kpi          aurea.css:1207  coluna com gap 5 — **dentro de um Card**
//
// ⚠ **O `.kpi` do CSS mente sozinho, e o fonte corrige:** `markup.tsx:105` mostra que o `KPI` é
// `<Card className="kpi">`. Quem lesse só o CSS faria uma coluna sem superfície — e a peça
// perderia o cartão, que é metade do que ela é.
import * as React from "react";
import {Image, View, type ImageSourcePropType, type StyleProp, type ViewProps, type ViewStyle} from "react-native";
import {criarFolha} from "./estilos.js";
import {Card} from "./layout.js";
import {gravidadeDoEstado, type AureaUniversalState} from "./strings.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  // ── Badge ──────────────────────────────────────────────────────────────────────────────────
  // 🔴 AS MEDIDAS SÃO AS DO `Chip` DO HeroUI NATIVE (1.0.10, `chip.css`) — ordem do Victor de
  // 25/09/2026: "se o HeroUI já tem, vamos usar as deles". Recheio, letra, linha e vão:
  //     sm  8 × 2  · letra 12 · linha 16        md  12 × 4 · letra 14 · linha 20
  //     lg  16 × 6 · letra 16 · linha 24        vão 4 entre ponto, texto e adornos
  // Até a 0.10.1 eram `3px 9px` e `gap:6` crus, e o texto saía com entrelinha 1,0: no Android a
  // perna do g e do p era cortada (a mesma causa do E1 no `Button`). A linha do HeroUI é ≥ 1,33 ×
  // a letra, e o IBM Plex precisa de 1,3. O raio continua a cápsula da Aurea (identidade) e a
  // borda continua nossa.
  // ⚠ O `xs` NÃO existe no HeroUI (é o contador sobre ícone): fica a medida nossa, 16 de altura,
  // agora com letra 12 e linha 16 para caber a letra inteira.
  selo: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: t.size.space1,
    paddingVertical: t.size.space1, paddingHorizontal: t.size.space3,
    borderWidth: t.size.borderWidth, borderRadius: t.size.radiusControl,
    backgroundColor: t.color.secondary, borderColor: t.color.border,
  },
  selo_xs: {minHeight: t.size.space4, paddingVertical: 0, paddingHorizontal: t.size.space1, borderWidth: 0},
  selo_sm: {paddingVertical: t.size.space05, paddingHorizontal: t.size.space2},
  selo_md: {},
  // 6 de recheio vertical: no HeroUI é `calc(var(--spacing) * 1.5)`, e `--spacing` é o `space1`.
  selo_lg: {paddingVertical: t.size.space1 * 1.5, paddingHorizontal: t.size.space4},
  ponto: {width: t.size.space2, height: t.size.space2, borderRadius: t.size.radiusFull},
  // `fit="content"` (R-01): o mesmo `alignSelf` que a âncora abaixo já usa para não esticar.
  justo: {alignSelf: "flex-start"},
  // A âncora é `position:relative` na web; aqui o filho absoluto já se posiciona por ela.
  ancora: {position: "relative", alignSelf: "flex-start"},
  sobreposto: {position: "absolute", zIndex: 1, minHeight: t.size.space4, paddingHorizontal: t.size.space1},
  // ⚠ A web desenha um anel da cor do FUNDO em volta do selo sobreposto
  // (`box-shadow:0 0 0 var(--space-05) var(--badge-ring)`, aurea.css:1010) — é o que separa o
  // número do ícone embaixo. `boxShadow` do RN 0.76+ aceita spread, então o anel atravessa.
  anel: {boxShadow: [{offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: t.size.space05, color: t.color.background}]},

  // ── Status ─────────────────────────────────────────────────────────────────────────────────
  estado: {flexDirection: "row", alignItems: "center", gap: t.size.space2},
  // O halo é `box-shadow 0 0 0 3px` da cor corrente a 14% (aurea.css:1055). Sem `color-mix` no
  // RN, o mesmo efeito sai com opacidade no próprio anel.
  pontoDeEstado: {width: 8, height: 8, borderRadius: t.size.radiusFull},

  // ── Avatar ─────────────────────────────────────────────────────────────────────────────────
  avatar: {
    alignItems: "center", justifyContent: "center", overflow: "hidden",
    borderRadius: t.size.radiusFull, backgroundColor: t.color.surface3,
    borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
  },
  imagem: {width: "100%", height: "100%"},

  // ── KPI ────────────────────────────────────────────────────────────────────────────────────
  kpi: {gap: 5},
}));

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaBadgeTone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";
export type AureaBadgeEmphasis = "soft" | "outline" | "solid";
export type AureaBadgeSize = "xs" | "sm" | "md" | "lg";
export type AureaBadgeAnchor = "top-end" | "top-start" | "bottom-end" | "bottom-start";
/** `auto` segue o recipiente (numa coluna, estica); `content` fica do tamanho do texto. */
export type AureaBadgeFit = "auto" | "content";

/** `count > max ? `${max}+` : String(count)` — a mesma linha do `markup.tsx:140`. */
export const formatarContagem = (count: number, max = 99): string =>
  count > max ? `${max}+` : String(count);

export interface BadgeProps extends ViewProps {
  /**
   * O tom. Chama-se `tone` e não `variant`, como no `Button` do Lote 1 — o vocabulário de cor
   * com significado é `tone` em todo o alvo nativo (ADR-0044 é quem separa os dois na web).
   */
  tone?: AureaBadgeTone;
  emphasis?: AureaBadgeEmphasis;
  size?: AureaBadgeSize;
  /** Um ponto antes do texto. Sozinho (sem conteúdo), o selo VIRA o ponto. */
  dot?: boolean;
  /**
   * Conteúdo antes do texto — na prática, um glifo (`<Icon name="checkmark" size="sm" />`).
   *
   * ⚠ **É NÓ e não nome de ícone, e a razão é a mesma da web** (`markup.tsx:126`): o `Icon` vive
   * noutro módulo, e receber o nome obrigaria este arquivo a importá-lo — trazendo o registro de
   * ícones ao grafo de todo app que só quer um selo. É a cláusula 4 da ADR-0038, e é o mesmo
   * desenho que o `Button` ganhou na `0.8.3`.
   *
   * ⚠ **O slot NÃO tinge o que recebe.** Quem passa o glifo escolhe a cor dele.
   */
  leading?: React.ReactNode;
  /** O mesmo, depois do texto. */
  trailing?: React.ReactNode;
  count?: number;
  /** Acima disto o selo mostra `99+`. */
  max?: number;
  /** Por padrão `count === 0` some — caixa zerada não merece um "0" no canto. */
  showZero?: boolean;
  /**
   * `content` põe o selo do tamanho do texto mesmo numa coluna — R-01, 24/09/2026.
   *
   * ⚠ **Não é o padrão, e a razão foi MEDIDA:** numa coluna o selo estica, e na web também —
   * `.stack` não declara `align-items`, então o `.badge` vira item de flex e estica (300 px numa
   * coluna de 300, contra 55 px solto num bloco). Os dois alvos já concordavam; o que faltava era
   * como pedir o contrário.
   *
   * ⚠ **Serve para COLUNA.** Aqui ele vira `alignSelf: "flex-start"`, e numa fila o eixo cruzado
   * é o vertical: o selo subiria para o topo em vez de ficar no meio. Numa fila o selo já tem o
   * tamanho do texto, então não passe `fit` ali.
   */
  fit?: AureaBadgeFit;
  /** Ancora o selo no canto de `children`, em vez de desenhá-lo em linha. */
  anchor?: AureaBadgeAnchor;
  /** O que o selo mostra quando `anchor` está em uso (aí `children` é o que ele decora). */
  badgeContent?: React.ReactNode;
  invisible?: boolean;
  children?: React.ReactNode;
}

/**
 * A pílula pequena — rótulo, contagem ou ponto.
 *
 * ⚠ **Ancorado, o número é DECORATIVO para o leitor de tela.** Ele some da árvore, e quem carrega
 * a informação é o rótulo de quem foi decorado. Sem isso o leitor anuncia *"sino, 8"* e a pessoa
 * não sabe o que é o 8 — regra lida em três fontes de acessibilidade em 17/08/2026 e registrada
 * no fonte da web. **Quem usa contagem ancorada escreve o rótulo do alvo**, sempre:
 *
 *     <Badge count={8} anchor="top-end">
 *       <IconButton name="notification" label="Avisos, 8 não lidos" onPress={abrir} />
 *     </Badge>
 *
 * ⚠ **`image`/`imageAlt` da web NÃO atravessaram.** Nenhuma das sete telas do consumidor medido
 * usa selo com miniatura, e prop sem consumidor é superfície pública para manter de graça. Volta
 * quando houver tela que peça.
 */
/** A letra e a linha do selo, do `Chip` do HeroUI Native (ver a folha). O token direto, e não o
 *  `size` do `Text`, que no telefone sobe um degrau (ADR-0050) — o HeroUI não sobe no chip. */
const LETRA_DO_SELO = (t: AureaTokens, size: string) =>
  size === "lg" ? {fontSize: t.size.textBase, lineHeight: t.size.space6}
  : size === "md" ? {fontSize: t.size.textSm, lineHeight: t.size.space5}
  : {fontSize: t.size.textXs, lineHeight: t.size.space4};

export function Badge({
  tone = "neutral", emphasis = "soft", size = "md", dot, count, max = 99, showZero,
  leading, trailing, fit = "auto", anchor, badgeContent, invisible, children, style, ...rest
}: BadgeProps) {
  const t = useAureaTokens();
  const s = folha(t);

  const acento = tone === "primary" ? t.color.primaryEmphasis
    : tone === "info" ? t.color.info400 ?? t.color.info
    : tone === "success" ? t.color.success400 ?? t.color.success
    : tone === "warning" ? t.color.warning400 ?? t.color.warning
    : tone === "danger" ? t.color.danger400 ?? t.color.destructive
    : t.color.secondaryForeground;
  const fundoDoTom = tone === "info" ? t.color.infoBg
    : tone === "success" ? t.color.successBg
    : tone === "warning" ? t.color.warningBg
    : tone === "danger" ? t.color.dangerBg
    : undefined;

  const pele: ViewStyle = emphasis === "solid"
    ? {backgroundColor: acento, borderColor: "transparent"}
    : emphasis === "outline"
      ? {backgroundColor: "transparent", borderColor: acento}
      : tone === "neutral"
        ? {}
        : {backgroundColor: fundoDoTom, borderColor: acento};
  const corDoTexto = emphasis === "solid" ? t.color.background
    : tone === "neutral" ? t.color.secondaryForeground : acento;

  const numero = count != null ? formatarContagem(count, max) : undefined;
  const miolo = anchor ? (numero ?? badgeContent) : (numero ?? children);
  // Ponto puro: `dot` sem nada para mostrar. Aí o selo não tem conteúdo e ganha medida própria.
  const soPonto = !!dot && miolo == null;

  const selo = (
    <View
      style={[
        s.selo, s[`selo_${size}`], pele,
        fit === "content" && !anchor && s.justo,
        anchor && s.sobreposto, anchor && s.anel,
        anchor && posicaoDaAncora(anchor),
        soPonto && {width: t.size.space2, minWidth: t.size.space2, height: t.size.space2,
                    minHeight: t.size.space2, paddingHorizontal: 0, paddingVertical: 0,
                    backgroundColor: acento, borderWidth: 0},
        style,
      ]}
      {...(anchor ? {accessibilityElementsHidden: true,
                     importantForAccessibility: "no-hide-descendants" as const} : rest)}>
      {dot && !soPonto && <View style={[s.ponto, {backgroundColor: corDoTexto}]} />}
      {/* ⚠ Os dois slots ficam FORA do ponto e dentro do selo, na ordem da web: ponto, antes,
          texto, depois. Com `soPonto` o selo não tem miolo, então eles também não entram. */}
      {!soPonto && leading}
      {typeof miolo === "string" || typeof miolo === "number"
        ? <Text weight={500} style={[LETRA_DO_SELO(t, size), {color: corDoTexto}]}>{miolo}</Text>
        : miolo}
      {!soPonto && trailing}
    </View>
  );

  if (!anchor) return selo;
  const escondido = invisible || (count === 0 && !showZero) || (miolo == null && !dot);
  return <View style={s.ancora} {...rest}>{children}{!escondido && selo}</View>;
}

/**
 * O canto, traduzido para o RN.
 *
 * A web usa `inset-*` mais `transform: translate(±50%, ∓50%)`, o que centra o selo EM CIMA do
 * canto. `translate` percentual não existe no `transform` do RN — medido no contrato — então o
 * deslocamento sai por `inset` negativo, que é o mesmo efeito com aritmética diferente.
 */
function posicaoDaAncora(anchor: AureaBadgeAnchor): ViewStyle {
  const meio = -8;
  return anchor === "top-end" ? {top: meio, right: meio}
    : anchor === "top-start" ? {top: meio, left: meio}
    : anchor === "bottom-end" ? {bottom: meio, right: meio}
    : {bottom: meio, left: meio};
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Status
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaStatusVariant =
  | "neutral" | "online" | "offline" | "busy" | "away"
  | "success" | "warning" | "danger" | "info";

export interface StatusProps extends ViewProps {
  variant?: AureaStatusVariant;
  /** Um estado universal escolhe a variante E escreve o texto, como na web. */
  state?: AureaUniversalState;
  children?: React.ReactNode;
}

/**
 * Um ponto e uma palavra.
 *
 * ⚠ **`offline` não é uma cor a menos — é um ponto DIFERENTE.** No CSS ele é vazado: fundo
 * transparente com anel interno (`aurea.css:1071`). É o que separa "está fora" de "está bem",
 * para quem não distingue as duas cores.
 */
export function Status({variant, state, children, style, ...rest}: StatusProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  // Mesma linha do `feedback-client.tsx:34`: `offline` é ele mesmo; o resto vira a gravidade.
  const v: AureaStatusVariant = variant
    ?? (state ? (state === "offline" ? "offline" : gravidadeDoEstado(state)) : "neutral");

  const cor = v === "online" || v === "success" ? t.color.success
    : v === "away" || v === "warning" ? t.color.warning
    : v === "busy" || v === "danger" ? (t.color.danger400 ?? t.color.destructive)
    : v === "info" ? t.color.info
    : v === "offline" ? t.color.subtleForeground
    : t.color.mutedForeground;

  const rotulo = children ?? (state ? strings.universalState[state] : null);
  return (
    <View style={[s.estado, style]} {...rest}>
      <View style={[
        s.pontoDeEstado,
        v === "offline"
          // Vazado: sem preenchimento, com o anel de 2 por dentro. `borderWidth` faz o que o
          // `inset 0 0 0 2px` do CSS faz.
          ? {backgroundColor: "transparent", borderWidth: 2, borderColor: cor}
          : {backgroundColor: cor},
      ]} />
      {typeof rotulo === "string"
        ? <Text size="sm">{rotulo}</Text>
        : rotulo}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaAvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  /** URL ou `require()` de um asset local — as duas formas do `Image` do RN. */
  source?: ImageSourcePropType | string;
  /** Descrição para o leitor de tela. Vazio = decorativo. */
  alt?: string;
  /** O que aparece sem imagem, ou quando ela falha. Iniciais, em geral. */
  fallback?: React.ReactNode;
  size?: AureaAvatarSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * O retrato redondo.
 *
 * ⚠ **A queda para o `fallback` é a parte que importa, e ela é a mesma da web:** se a imagem
 * falhar em carregar, o componente troca para o conteúdo alternativo — e volta a tentar quando a
 * `source` muda. Sem isso, uma URL quebrada deixa um buraco cinza permanente na lista.
 */
export function Avatar({source, alt, fallback, size = "md", style, testID}: AvatarProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const [falhou, setFalhou] = React.useState(false);
  // A `source` nova merece uma tentativa nova — é o `useEffect([src])` do `identity-client.tsx`.
  React.useEffect(() => { setFalhou(false); }, [source]);

  const lado = size === "sm" ? t.size.controlHSm : size === "lg" ? t.size.controlHLg : t.size.controlHMd;
  const fonte = typeof source === "string" ? {uri: source} : source;

  return (
    <View
      testID={testID}
      accessible={!!alt}
      accessibilityRole={alt ? "image" : undefined}
      accessibilityLabel={alt || undefined}
      style={[s.avatar, {width: lado, height: lado}, style]}>
      {fonte && !falhou
        ? <Image source={fonte} style={s.imagem} onError={() => setFalhou(true)} />
        : typeof fallback === "string"
          ? <Text size={size === "sm" ? "xs" : "md"} weight={700}>{fallback}</Text>
          : fallback}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// KPI
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface KPIProps extends ViewProps {
  label: React.ReactNode;
  value: React.ReactNode;
  trend?: React.ReactNode;
}

/**
 * Um número com nome. **É um `Card`** — medido em `markup.tsx:105`, e não no CSS, que só mostra
 * a coluna.
 *
 * A ficha da web declara `role="group"`, e **o React Native não tem esse papel** — medido na lista
 * de `accessibilityRole`, que vai de `button` a `toolbar` e não inclui `group`. O que ele tem é
 * `accessible`, e ele faz exatamente o que se queria do `group`: o nó inteiro vira UM elemento de
 * acessibilidade, e o leitor anuncia as três linhas juntas em vez de como três textos soltos.
 *
 * Inventar `accessibilityRole="summary"` porque o nome parece próximo seria pior que não ter papel:
 * `summary` tem significado próprio (o resumo de um bloco expansível) e diria uma coisa errada.
 */
export function KPI({label, value, trend, style, ...rest}: KPIProps) {
  const s = folha(useAureaTokens());
  return (
    <Card style={[s.kpi, style]} accessible {...rest}>
      {typeof label === "string" ? <Text size="sm" tone="muted">{label}</Text> : label}
      {typeof value === "string" || typeof value === "number"
        ? <Text size="2xl" weight={700}>{value}</Text> : value}
      {trend != null && (typeof trend === "string"
        ? <Text size="xs" tone="muted">{trend}</Text> : trend)}
    </Card>
  );
}
