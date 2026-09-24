// Aurea nativo — a categoria **Feedback**: `Spinner`, `Skeleton`, `Progress`, `Alert`,
// `EmptyState` e `DataState`.
//
// Lote 2 do `NATIVE.md` §5.5 — *"o dashboard, que é só leitura"*. O consumidor medido pede uma
// **tela de leitura densa: métricas, histórico, avisos** (§5.1), e é essa tela que decide o
// escopo de cada API aqui — não a ficha da web, que serve 124 componentes e um catálogo.
//
// Tudo abaixo foi medido antes de escrito, e cada número traz a linha:
//
//   .spinner      aurea.css:668   borda 2 currentColor, direita transparente, redondo, .7s linear
//   .skeleton     aurea.css:1111  raio 7, fundo surface-3, pulso de opacidade .55 em 1.35s
//   .progress     aurea.css:1105  altura 8, raio 999, trilho surface-3, preenchimento primary
//   .alert        aurea.css:1088  grade auto/1fr/auto, gap 12, padding 14 16, raio lg, borda 1
//   .empty-state  aurea.css:1823  coluna centrada, gap space-3, padding space-10 space-6
//   .data-state   aurea.css:1110  grade com gap space-3 e NADA de superfície própria
//
// E a semântica veio do FONTE, não do CSS — `feedback-client.tsx` e `markup.tsx`. Foi de lá que
// saíram as três coisas que o CSS não conta: o `Alert` é `role=alert` só no `danger`, o
// `DataState` **acompanha** o conteúdo nos estados universais em vez de substituí-lo, e o vazio
// de uma REGIÃO não emite título de documento.
import * as React from "react";
import {Animated, Easing, View, type StyleProp, type ViewProps, type ViewStyle} from "react-native";
import {IconButton} from "./actions.js";
import {criarFolha} from "./estilos.js";
import {Icon, type IconName} from "./icon.js";
import {useReduceMotion} from "./movimento.js";
import {gravidadeDoEstado, type AureaUniversalState} from "./strings.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  // ── Spinner ────────────────────────────────────────────────────────────────────────────────
  // Um ANEL, e não o `ActivityIndicator` do React Native. Não é preferência: o `ActivityIndicator`
  // desenha a rosquinha do Material no Android e a coroa do iOS — duas aparências que não são a
  // Aurea, e o `CLAUDE.md` proíbe Material como aparência em voz alta. O anel é reprodutível
  // com borda, e `borderRightColor: transparent` existe no RN igual ao CSS.
  anel: {borderWidth: 2, borderRightColor: "transparent", borderRadius: t.size.radiusFull},

  // ── Skeleton ───────────────────────────────────────────────────────────────────────────────
  // O raio 7 é cru no CSS (`aurea.css:1111`) e entra aqui **como está**: inventar um token para
  // ele faria o nativo e a web desenharem cantos diferentes para a mesma peça.
  esqueleto: {borderRadius: 7, backgroundColor: t.color.surface3},

  // ── Progress ───────────────────────────────────────────────────────────────────────────────
  trilho: {height: 8, borderRadius: t.size.radiusFull, backgroundColor: t.color.surface3, overflow: "hidden"},
  preenchimento: {height: "100%", borderRadius: t.size.radiusFull, backgroundColor: t.color.primary},

  // ── Alert ──────────────────────────────────────────────────────────────────────────────────
  // A web usa GRADE de três trilhas (ícone, corpo, ação). Aqui é linha de flex com o corpo
  // `flex:1` — mesmo resultado, e `display:grid` não existe no RN (a mesma nota do `Grid`).
  // `alignItems:"flex-start"` porque o ícone acompanha a PRIMEIRA linha do texto, não o centro
  // de um parágrafo de três linhas.
  alerta: {
    flexDirection: "row", alignItems: "flex-start", gap: t.size.space3,
    paddingVertical: 14, paddingHorizontal: t.size.space4,
    borderWidth: t.size.borderWidth, borderRadius: t.size.radiusLg,
    backgroundColor: t.color.secondary, borderColor: t.color.border,
  },
  // O GRUPO de leitura: ícone + texto, lidos como uma coisa só. Ele existe porque a moldura
  // deixou de ser `accessible` (ver o comentário no componente) — e sem um grupo o título e o
  // corpo virariam duas paradas separadas do leitor de tela.
  // Nenhuma medida nova: `flex`, `minWidth` e o MESMO `gap` da moldura. O "X" fica de fora.
  grupoDoAlerta: {
    flex: 1, minWidth: 0,
    flexDirection: "row", alignItems: "flex-start", gap: t.size.space3,
  },
  alerta_info: {backgroundColor: t.color.infoBg, borderColor: t.color.info},
  alerta_success: {backgroundColor: t.color.successBg, borderColor: t.color.success},
  alerta_warning: {backgroundColor: t.color.warningBg, borderColor: t.color.warning},
  alerta_danger: {backgroundColor: t.color.dangerBg, borderColor: t.color.danger400 ?? t.color.destructive},
  corpoDoAlerta: {flex: 1, gap: 2},

  // ── EmptyState ─────────────────────────────────────────────────────────────────────────────
  vazio: {
    alignItems: "center", gap: t.size.space3,
    paddingVertical: t.size.space10, paddingHorizontal: t.size.space6,
  },

  // ── DataState ──────────────────────────────────────────────────────────────────────────────
  // Sem fundo e sem borda, e o comentário do CSS (`aurea.css:1107`) diz por quê: se ele ganhar
  // superfície, viram DUAS superfícies para a mesma coisa.
  regiao: {gap: t.size.space3},
}));

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaSpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  /** `sm` é o padrão, como na web (`.spinner` sem modificador usa `--icon-sm`). */
  size?: AureaSpinnerSize;
  /** O que o leitor de tela anuncia. Sem ele, a frase `loading` do provider. */
  label?: string;
  /** Decorativo: some da árvore de acessibilidade. Use quando há texto ao lado dizendo o mesmo. */
  decorative?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * O anel que gira. **700 ms, linear** — o mesmo `.7s linear` do `aurea.css:670`.
 *
 * ⚠ **Ele para quando a pessoa pede menos movimento.** Na web a regra global de
 * `prefers-reduced-motion` já fazia isso; aqui é o componente que pergunta, porque não há
 * cascata para fazê-lo por ele. Parado, o anel continua desenhado — quem precisa da informação
 * "algo está acontecendo" continua vendo o rótulo.
 */
export function Spinner({size = "sm", label, decorative, style, testID}: SpinnerProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const reduzir = useReduceMotion();
  const giro = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // `!== false` e não `!reduzir`: enquanto é `null` o sistema ainda não respondeu, e
    // animar nesse vão é animar na cara de quem talvez tenha pedido que não.
    if (reduzir !== false) return;
    const laco = Animated.loop(Animated.timing(giro, {
      toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true,
    }));
    laco.start();
    // Sem o `stop` o laço sobrevive à desmontagem e continua acordando o JS — o vazamento
    // clássico de `Animated.loop`.
    return () => laco.stop();
  }, [giro, reduzir]);

  const lado = size === "lg" ? t.size.iconLg : size === "md" ? t.size.iconMd : t.size.iconSm;
  const acessibilidade = decorative
    ? {accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const}
    : {accessible: true, accessibilityRole: "progressbar" as const,
       accessibilityLabel: label ?? strings.loading};

  return (
    <Animated.View
      testID={testID}
      {...acessibilidade}
      style={[
        s.anel,
        {width: lado, height: lado, borderColor: t.color.foreground, borderRightColor: "transparent"},
        {transform: [{rotate: giro.interpolate({inputRange: [0, 1], outputRange: ["0deg", "360deg"]}) }]},
        style,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface SkeletonProps {
  /** Padrão: ocupa a largura disponível. */
  width?: number | `${number}%`;
  /** Padrão: a altura de uma linha de texto (`--space-4`). */
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A caixa cinza que pulsa enquanto o dado não chega.
 *
 * ⚠ **A API é DIFERENTE da web, e a plataforma obriga.** Lá o `Skeleton` recebe `className` e
 * `style` e a página decide o tamanho no CSS. No React Native não há classe: se o componente não
 * aceitar medida, todo consumidor escreve o mesmo `style` inline. Então `width`/`height`/`radius`
 * são props — e continuam aceitando `style` para o resto.
 *
 * Ele é **invisível para o leitor de tela** (`aria-hidden` na web, `accessibilityElementsHidden`
 * aqui): anunciar "caixa" três vezes enquanto a tela carrega não ajuda ninguém.
 */
export function Skeleton({width, height, radius, style, testID}: SkeletonProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const reduzir = useReduceMotion();
  const opacidade = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (reduzir !== false) return;
    // 1,35 s no total, com o vale em .55 na METADE — é o `@keyframes skeleton-pulse` do
    // `aurea.css:1112` lido literalmente: 675 ms para descer e 675 para voltar.
    const laco = Animated.loop(Animated.sequence([
      Animated.timing(opacidade, {toValue: 0.55, duration: 675, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      Animated.timing(opacidade, {toValue: 1, duration: 675, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
    ]));
    laco.start();
    return () => laco.stop();
  }, [opacidade, reduzir]);

  return (
    <Animated.View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        s.esqueleto,
        {width: width ?? "100%", height: height ?? t.size.space4},
        radius != null && {borderRadius: radius},
        {opacity: opacidade},
        style,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Progress
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface ProgressProps {
  /** 0 a 100. Fora disso é grampeado, como na web (`Math.max(0, Math.min(100, value))`). */
  value: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A barra determinada. Só ela — **não há variante indeterminada**, nem na web.
 *
 * O papel é `progressbar` e o valor vai no `accessibilityValue`: sem isso o leitor de tela
 * anuncia que existe uma barra e não diz em quanto ela está, que é a única informação que ela tem.
 */
export function Progress({value, label, style, testID}: ProgressProps) {
  const s = folha(useAureaTokens());
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{min: 0, max: 100, now: pct}}
      style={[s.trilho, style]}>
      <View style={[s.preenchimento, {width: `${pct}%`}]} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Alert
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaAlertVariant = "info" | "success" | "warning" | "danger";

/** Mesmos quatro glifos do `feedback-client.tsx:43`. */
export const ICONE_DA_VARIANTE: Readonly<Record<AureaAlertVariant, IconName>> = {
  info: "information--filled",
  success: "checkmark--filled",
  warning: "warning--alt--filled",
  danger: "error--filled",
};

export interface AlertProps extends ViewProps {
  variant?: AureaAlertVariant;
  /** Um dos sete estados universais. Ele **escolhe a variante** e escreve o texto padrão. */
  state?: AureaUniversalState;
  title?: React.ReactNode;
  icon?: IconName;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

/**
 * O aviso em linha.
 *
 * ⚠ **`danger` é `role="alert"`; o resto é `status`.** Vem do fonte da web
 * (`feedback-client.tsx:59`), e a diferença importa: `alert` interrompe o leitor de tela, `status`
 * espera a vez. Um aviso informativo que interrompe é um aviso que ensina a pessoa a ignorar
 * avisos.
 *
 * ⚠ **O ícone precisa estar no registro.** Os quatro glifos de variante não são importados por
 * este módulo — seria trazer ícone ao grafo do bundler pelas costas do consumidor, que é a
 * cláusula 4 da ADR-0038. Registre-os:
 *
 *     import InformationFilled from "@aurea-uds/native/icons/information--filled";
 *     const ICONES = criarRegistroDeIcones({"information--filled": InformationFilled, …});
 */
export function Alert({
  variant, state, title, icon, onDismiss, children, style,
  // 🔴 ESTES DOIS SAEM DO RESTO DE PROPÓSITO, e é consequência do conserto abaixo: a moldura
  // deixou de ser elemento de acessibilidade, e rótulo em quem não é elemento **não faz nada no
  // iOS**. Eles pousam no GRUPO, que é quem o leitor de tela alcança.
  accessibilityLabel, accessibilityHint,
  ...rest
}: AlertProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const v: AureaAlertVariant = variant ?? (state ? gravidadeDoEstado(state) : "info");
  const corDoIcone = v === "success" ? t.color.success
    : v === "warning" ? t.color.warning
    : v === "danger" ? (t.color.danger400 ?? t.color.destructive)
    : t.color.info;

  return (
    // 🔴 A MOLDURA NÃO É MAIS `accessible` — defeito achado em 17/09/2026 varrendo o pacote
    // inteiro atrás da forma do defeito do `Combobox`, e este é o MESMO: o `IconButton` de fechar
    // morava dentro de um recipiente marcado `accessible`, e **no iOS isso o apagava**.
    //
    // A doc do próprio React Native diz a razão em uma linha: *"VoiceOver disallowing nested
    // accessibility elements"*. A da Apple diz o outro lado: *"An individual view does not contain
    // any other views that need to be accessible"* e *"you need to make sure that the container
    // view itself is not accessible"*.
    //
    // ⚠ **No Android nunca apareceu** (lá `accessible` só liga `isFocusable`), e é por isso que o
    // aviso rodou em vidro em 10/09/2026 com este defeito dentro e passou.
    //
    // O que fica: a moldura é só layout; o GRUPO abaixo é a unidade de leitura (ícone + texto),
    // e o "X" é IRMÃO dele. Mesma forma do `Combobox` e dos quatro fundos tocáveis.
    <View
      // Android: a região viva é o que faz o leitor falar sem foco, e ela cobre a moldura
      // inteira de propósito — o que muda é o conteúdo, e o "X" some junto quando o aviso fecha.
      accessibilityLiveRegion={v === "danger" ? "assertive" : "polite"}
      style={[s.alerta, s[`alerta_${v}`], style]}
      {...rest}>
      <View
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        // 🔴 **ERA `accessibilityRole="status"`, E ISSO DERRUBAVA O APP.** Medido no aparelho em
      // 09/09/2026: *"Invalid accessibility role value: status"* — tela vermelha, não aviso.
      //
      // ⚠ **E o comentário que estava aqui dizia o contrário**: *"`alert` e `status` existem os
      // dois no `accessibilityRole` do RN — não é adaptação."* **Nunca foi medido.** O
      // `AccessibilityRole` tem 40 valores e `status` não é um deles; `alert` é.
      //
      // ⚠ **1336 testes passaram por cima disso**, porque o dublê aceita qualquer string. É a
      // terceira forma da mesma armadilha, e a pior: o Lote 5 achou papéis que o tipo aceita e a
      // plataforma ignora; este é um papel que o tipo aceita e a plataforma **REJEITA**.
      //
      // O que fica: `danger` é `alert`, que existe. O resto **não tem papel** — e não perde nada,
      // porque quem faz o leitor de tela falar no Android é a REGIÃO VIVA abaixo, não o papel.
      // Mesma decisão do `Topbar`, do `Chart` e da `Table`: inventar um papel "parecido" diria
      // uma coisa errada, e aqui diria uma que quebra.
        {...(v === "danger" ? {accessibilityRole: "alert"} : null)}
        style={s.grupoDoAlerta}>
        <Icon name={icon ?? ICONE_DA_VARIANTE[v]} size="md" color={corDoIcone} />
        <View style={s.corpoDoAlerta}>
          {title != null && <Text size="sm" weight={600}>{title}</Text>}
          {children != null
            ? (typeof children === "string" ? <Text size="sm" tone="muted">{children}</Text> : children)
            : state ? <Text size="sm" tone="muted">{strings.universalState[state]}</Text> : null}
        </View>
      </View>
      {/* ⚠ Era `label="Close"` literal, e ficava em inglês num app em português — a tabela de
          frases não tinha `close` até o Lote 5 criá-la para o `Dialog`. Corrigido junto. */}
      {onDismiss ? <IconButton appearance="ghost" size="sm" name="close" label={strings.close} onPress={onDismiss} /> : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  icon?: IconName;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  state?: AureaUniversalState;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * O nada, dito com jeito.
 *
 * ⚠ **Não há `titleAs`, e a razão é a plataforma, não um corte.** Na web ele existe para escolher
 * entre `h2`/`h3`/`h4`/`p` e não saltar nível de título no documento — um problema que o
 * `heading-order` do axe pega. **No React Native não há hierarquia de títulos**: um `Text` é um
 * `Text`. A prop não teria efeito, e prop sem efeito é promessa falsa.
 */
export function EmptyState({
  icon = "document--blank", title, description, action, state, style, testID,
}: EmptyStateProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const desc = description ?? (state ? strings.universalState[state] : null);
  return (
    <View testID={testID} style={[s.vazio, style]}>
      <Icon name={icon} size="xl" color={t.color.subtleForeground} />
      {typeof title === "string"
        ? <Text size="base" weight={600} leading="tight" align="center">{title}</Text>
        : title}
      {desc != null && (typeof desc === "string"
        ? <Text size="sm" tone="muted" align="center">{desc}</Text>
        : desc)}
      {action}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// DataState
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaDataStateValue = "loading" | "error" | "empty" | AureaUniversalState;

// `Omit<…, "children">` porque `children` aqui aceita FUNÇÃO, e o `ViewProps` do RN não.
export interface DataStateProps extends Omit<ViewProps, "children"> {
  state?: AureaDataStateValue;
  message?: React.ReactNode;
  /** Substitui o esqueleto padrão de `loading`. */
  skeleton?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  emptyIcon?: IconName;
  action?: React.ReactNode;
  /** Função para o conteúdo caro não ser construído enquanto o estado o esconde. */
  children: React.ReactNode | (() => React.ReactNode);
}

/**
 * A região que troca de cara. **Ela não desenha nada próprio** — empilha o que já existe.
 *
 * ⚠ **A regra que não está no CSS e é a mais importante:** os sete estados universais
 * **acompanham** o conteúdo, não o substituem. `stale`, `partial`, `offline` querem dizer que o
 * dado está aí e tem ressalva — esconder o dado seria trocar informação parcial por informação
 * nenhuma. Só `loading`, `error` e `empty` tomam o lugar.
 */
export function DataState({
  state, message, skeleton, emptyTitle, emptyIcon, action, children, style, ...rest
}: DataStateProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const conteudo = () => (typeof children === "function" ? children() : children);
  const caixa = (dentro: React.ReactNode, ocupado?: boolean) => (
    <View accessibilityState={ocupado ? {busy: true} : undefined} style={[s.regiao, style]} {...rest}>
      {dentro}
    </View>
  );

  if (state === "loading") return caixa(skeleton ?? <Skeleton height={t.size.space8} />, true);
  if (state === "error") {
    return caixa(
      <Alert variant="danger">
        {message ?? strings.dataError}
      </Alert>);
  }
  if (state === "empty") {
    return caixa(
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle ?? strings.dataEmpty}
        description={message}
        action={action} />);
  }
  if (state) {
    return caixa(
      <>
        <Alert variant={gravidadeDoEstado(state)} state={state}>{message}</Alert>
        {conteudo()}
      </>);
  }
  return caixa(conteudo());
}
