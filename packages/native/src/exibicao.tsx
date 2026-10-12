// Aurea nativo — quatro peças que acompanham o conteúdo: `Accordion`, `ScrollShadow`,
// `SkeletonGroup` e `PressableFeedback` (0.32.0, passo 9b).
//
// As quatro são as do pacote nativo da referência — anatomia, medidas, estados, comportamento e
// acessibilidade lidos no pacote publicado dela —, com o que é da Aurea por cima: as cores do tema,
// o canto 22 do cartão e a cápsula, a Atkinson, os ícones Phosphor, sem degradê, "menos movimento".
//
// Medido no pacote dela antes de escrito (a classe vira dp: `px-3` = 12, `py-4` = 16, `gap-4` = 16):
//
//   accordion   gatilho   linha, 16 em cima e embaixo, 12 dos lados (20 no `surface`), 16 entre as partes
//               seta      16, gira de 0 a −180° numa mola (amortecimento 140, rigidez 1000, massa 4)
//               resposta  12 dos lados (20 no `surface`), 16 embaixo; entra esmaecendo em 200 ms
//               fio       entre os itens, nenhum depois do último; no `surface`, 12 de recuo dos lados
//               surface   o cartão: fundo, canto 3xl (aqui o 22 da Aurea) e a sombra de superfície
//   scroll-shadow         um degradê de 50 nas pontas — TROCADO por um fio (decisão do Victor, abaixo)
//   skeleton-group        um provedor: `isLoading` e a animação para os esqueletos de dentro
//   pressable-feedback    escala 0,985 numa peça de 300 de largura (proporcional), 300 ms
//                         realce: camada cheia que vai a 10% em 200 ms
//                         onda: círculo de 1,25 × a diagonal que nasce no dedo, de 750 a 2000 ms
//
// ⚠ O QUE NÃO VEIO, e por quê:
//   • a mola de ALTURA do accordion (os vizinhos deslizando ao abrir). Altura não roda no motor
//     nativo de animação, e toda animação da Aurea roda nele (`driverNativo()`, E13). A resposta
//     entra esmaecendo, como a dela; os vizinhos descem de uma vez, e fechar é na hora.
//   • o degradê do scroll-shadow e o da onda — a Aurea não tem degradê (CLAUDE.md §5).
//   • `asChild` — o encaixe sem caixa própria dela não existe neste pacote.
import * as React from "react";
import {
  Animated, Easing, Pressable, View,
  type GestureResponderEvent, type LayoutChangeEvent, type NativeScrollEvent,
  type NativeSyntheticEvent, type PressableProps, type StyleProp, type ViewStyle,
} from "react-native";
import {canto, comOpacidade, criarFolha, estadoAcessivel, REACAO_AO_TOQUE} from "./estilos.js";
import {GrupoDeEsqueleto, Skeleton, usePulsoDoEsqueleto, type AureaSkeletonAnimation, type GrupoDeEsqueletoValor} from "./feedback.js";
import {Icon} from "./icon.js";
import {driverNativo, useReduceMotion} from "./movimento.js";
import {Text} from "./text.js";
import {useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  // ── Accordion ──────────────────────────────────────────────────────────────────────────────
  accordion: {flexDirection: "column"},
  // O `surface` da referência: o cartão com a sombra de superfície (a `shadowSm` inteira, como o
  // `Alert`). O canto é o 22 da Aurea, no lugar do 24 dela.
  accordionSurface: {...canto(t.size.radiusCard), backgroundColor: t.color.card, boxShadow: [...t.shadowLayers.shadowSm]},
  // O gatilho tem o canto da cápsula sempre: é o desenho do realce de quando o dedo está em cima
  // (decisão do Victor para a web, 11/10/2026: *"a seleção é quadrada deles quero nossa como capsula"*).
  gatilho: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: t.size.space4, paddingHorizontal: t.size.space3, gap: t.size.space4,
    ...canto(t.size.radiusControl),
  },
  gatilhoSurface: {paddingHorizontal: t.size.space5},
  titulo: {flex: 1, minWidth: 0},
  seta: {alignItems: "center", justifyContent: "center"},
  resposta: {paddingHorizontal: t.size.space3, paddingBottom: t.size.space4},
  respostaSurface: {paddingHorizontal: t.size.space5},
  // O fio dela é o `hairlineWidth` (um pixel do aparelho: 0,33 num telefone de 3×). Aqui é a borda
  // da Aurea, 1 — a mesma linha da web (`--border-width`), e uma que se enxerga.
  fio: {height: t.size.borderWidth, backgroundColor: t.color.border},
  fioSurface: {marginHorizontal: t.size.space3},
  inativo: {opacity: t.size.opacityDisabled},

  // ── ScrollShadow ───────────────────────────────────────────────────────────────────────────
  // A superfície (o padrão, 12/10/2026): a MESMA pele do `Accordion` no cartão — fundo do cartão, canto
  // 22 e a sombra de superfície —, com o recheio dos lados dele (20) e 12 em cima e embaixo.
  superficieDaLista: {...canto(t.size.radiusCard), backgroundColor: t.color.card, boxShadow: [...t.shadowLayers.shadowSm],
    paddingHorizontal: t.size.space5, paddingVertical: t.size.space3},
  // Dentro da superfície a janela da lista já está longe dos cantos: o fio vai de lado a lado dela.
  fioDeCimaNaSuperficie: {left: 0, right: 0},
  fioDaEsquerdaNaSuperficie: {top: 0, bottom: 0},
  // Cresce com a caixa: quem dá altura ao `ScrollShadow` (um `flex: 1`) a dá também à lista de dentro.
  miolo: {position: "relative", flexGrow: 1, flexShrink: 1},
  // No `plain` (sem caixa), o fio NÃO vai de ponta a ponta: recua o raio do cartão (22) dos dois lados e tem as pontas em
  // cápsula (escolha do Victor, 12/10/2026, opção "A"). De ponta a ponta ele desenhava uma quina, que
  // a Aurea não tem; recuado, ele para onde o canto de um cartão em volta começa a curvar.
  fioDeCima: {position: "absolute", top: 0, left: t.size.radiusCard, right: t.size.radiusCard,
    height: t.size.borderWidth, ...canto(t.size.radiusControl), backgroundColor: t.color.border},
  fioDeBaixo: {position: "absolute", bottom: 0, left: t.size.radiusCard, right: t.size.radiusCard,
    height: t.size.borderWidth, ...canto(t.size.radiusControl), backgroundColor: t.color.border},
  fioDaEsquerda: {position: "absolute", left: 0, top: t.size.radiusCard, bottom: t.size.radiusCard,
    width: t.size.borderWidth, ...canto(t.size.radiusControl), backgroundColor: t.color.border},
  fioDaDireita: {position: "absolute", right: 0, top: t.size.radiusCard, bottom: t.size.radiusCard,
    width: t.size.borderWidth, ...canto(t.size.radiusControl), backgroundColor: t.color.border},

  // ── PressableFeedback ──────────────────────────────────────────────────────────────────────
  // `overflow: hidden` é o da raiz dela: o realce e a onda ficam dentro do canto de quem usa.
  raizDoToque: {overflow: "hidden"},
  camada: {position: "absolute", top: 0, left: 0, right: 0, bottom: 0},
  onda: {position: "absolute", top: 0, left: 0},
}));

/**
 * Leva um valor animado ao `destino` quando o destino MUDA — com a animação de `criar`, ou de um
 * salto quando não há movimento (a pessoa pediu menos, o sistema ainda não respondeu). No primeiro
 * desenho não faz nada: o valor já nasce no lugar. E a resposta do sistema chegando depois não
 * dispara animação nenhuma — só a troca de destino dispara.
 */
function useLevarA(valor: Animated.Value, destino: number, semMovimento: boolean,
                   criar: (destino: number) => Animated.CompositeAnimation) {
  const ultimo = React.useRef(destino);
  const corrente = React.useRef<Animated.CompositeAnimation | null>(null);
  React.useEffect(() => () => corrente.current?.stop(), []);
  React.useEffect(() => {
    if (ultimo.current === destino) return;
    ultimo.current = destino;
    corrente.current?.stop();
    corrente.current = null;
    if (semMovimento) { valor.setValue(destino); return; }
    const a = criar(destino);
    a.start();
    corrente.current = a;
    // `criar` fica de fora de propósito: ele nasce a cada desenho, e o efeito só tem de rodar na troca.
  }, [valor, destino, semMovimento]);
}

/** O `Easing.out(Easing.ease)` da referência, escrito como a curva que ele é: o `ease` do RN é
 *  `bezier(0.42, 0, 1, 1)`, e o `out` o espelha. */
const SAIDA_SUAVE = Easing.bezier(0, 0, 0.58, 1);

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Accordion
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** `surface` põe tudo num cartão. Os mesmos nomes da web. */
export type AureaAccordionVariant = "default" | "surface";

/** Um item — o MESMO modelo do `Accordion` da web (`AccordionItem`). */
export interface AureaAccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  /** O item que não abre: anunciado como desligado, apagado, e o toque não faz nada. */
  disabled?: boolean;
}

export interface AccordionProps {
  items: AureaAccordionItem[];
  variant?: AureaAccordionVariant;
  /** Deixa vários itens abertos ao mesmo tempo. Sem isto, abrir um fecha o outro. */
  multiple?: boolean;
  /** Os itens que começam abertos (o `id` de cada um). */
  defaultValue?: string[];
  /**
   * Os itens abertos, do lado de quem usa — o `value` da referência, que a web não tem (lá o
   * `<details>` guarda o próprio estado). Com ele, quem abre e fecha é o `onValueChange`.
   */
  value?: string[];
  /** Chamado com a lista nova de abertos a cada toque. */
  onValueChange?: (value: string[]) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// A mola da seta, a da referência. Passa do amortecimento crítico (2·√(1000·4) ≈ 126), então não
// balança: assenta em cerca de 0,4 s.
const MOLA_DA_SETA = {damping: 140, stiffness: 1000, mass: 4} as const;
const ESMAECER_DA_RESPOSTA = 200;

/**
 * Seções que abrem e fecham — o accordion da referência, com a API da web (`items`, `variant`,
 * `multiple`, `defaultValue`).
 *
 * Um de cada vez por padrão, e o aberto fecha no toque (o `isCollapsible` dela, ligado). O
 * gatilho é um botão que diz se está aberto (`expanded`) dentro de um título (`header`), como o
 * dela; a resposta fechada não está na árvore, e o leitor de tela não a lê.
 */
export function Accordion({
  items, variant = "default", multiple = false, defaultValue, value, onValueChange, style, testID,
}: AccordionProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const [interno, setInterno] = React.useState<string[]>(defaultValue ?? []);
  const abertos = value !== undefined ? value : interno;
  const surface = variant === "surface";

  const alternar = (id: string) => {
    const aberto = abertos.includes(id);
    const novo = multiple
      ? (aberto ? abertos.filter((x) => x !== id) : [...abertos, id])
      : (aberto ? [] : [id]);
    if (value === undefined) setInterno(novo);
    onValueChange?.(novo);
  };

  return (
    <View testID={testID} style={[s.accordion, surface && s.accordionSurface, style]}>
      {items.map((item, i) => (
        <React.Fragment key={item.id}>
          {i > 0 ? <View style={[s.fio, surface && s.fioSurface]} /> : null}
          <ItemDoAccordion item={item} aberto={abertos.includes(item.id)} surface={surface}
            onAlternar={alternar} testID={testID ? `${testID}-${item.id}` : undefined} />
        </React.Fragment>
      ))}
    </View>
  );
}

function ItemDoAccordion({item, aberto, surface, onAlternar, testID}: {
  item: AureaAccordionItem; aberto: boolean; surface: boolean;
  onAlternar: (id: string) => void; testID?: string;
}) {
  const t = useAureaTokens();
  const s = folha(t);
  const reduzir = useReduceMotion();
  const inativo = !!item.disabled;

  const giro = React.useRef(new Animated.Value(aberto ? 1 : 0)).current;
  useLevarA(giro, aberto ? 1 : 0, reduzir !== false, (destino) =>
    Animated.spring(giro, {toValue: destino, ...MOLA_DA_SETA, useNativeDriver: driverNativo()}));

  // A resposta esmaece ao ABRIR. Um valor novo a cada troca, que já nasce em 0 quando vai esmaecer:
  // zerar depois, num efeito, deixaria passar um quadro com a resposta cheia. No primeiro desenho
  // ela nasce em 1 — o item que começa aberto não "abre".
  const montado = React.useRef(false);
  const entrada = React.useMemo(() => {
    const esmaecer = montado.current && aberto && reduzir === false;
    return {valor: new Animated.Value(esmaecer ? 0 : 1), esmaecer};
  }, [aberto]); // só a troca: a resposta do "menos movimento" chegando depois não esmaece de novo
  React.useEffect(() => { montado.current = true; }, []);
  React.useEffect(() => {
    if (!entrada.esmaecer) return;
    const a = Animated.timing(entrada.valor, {
      toValue: 1, duration: ESMAECER_DA_RESPOSTA, easing: SAIDA_SUAVE, useNativeDriver: driverNativo(),
    });
    a.start();
    return () => a.stop();
  }, [entrada]);

  // O realce do dedo é o da web: 3% da cor do texto, ou o cinza neutro no `surface`; e só no
  // fechado, como lá (`:not([open])`).
  const realce = surface ? t.color.secondary : comOpacidade(t.color.foreground, 0.03);
  const emTexto = (n: React.ReactNode) => typeof n === "string" || typeof n === "number";

  return (
    <View>
      <View accessibilityRole="header">
        <Pressable
          testID={testID}
          disabled={inativo}
          // A guarda repete o `disabled` de propósito, como o gatilho da referência: o toque que chega
          // por outro caminho (o leitor de tela, um teste) também não abre o item desligado.
          onPress={() => { if (!inativo) onAlternar(item.id); }}
          accessibilityRole="button"
          {...estadoAcessivel({expanded: aberto, disabled: inativo})}
          style={({pressed}) => [
            s.gatilho, surface && s.gatilhoSurface,
            pressed && !aberto && {backgroundColor: realce},
            inativo && s.inativo,
          ]}>
          <View style={s.titulo}>
            {emTexto(item.title) ? <Text size="sm" weight={500}>{item.title}</Text> : item.title}
          </View>
          <Animated.View style={[s.seta, {transform: [{rotate: giro.interpolate({
            inputRange: [0, 1], outputRange: ["0deg", "-180deg"],
          })}]}]}>
            <Icon name="caret-down" size="sm" color={t.color.foreground} />
          </Animated.View>
        </Pressable>
      </View>
      {aberto ? (
        <Animated.View testID={testID ? `${testID}-content` : undefined}
          style={[s.resposta, surface && s.respostaSurface, {opacity: entrada.valor}]}>
          {emTexto(item.content)
            ? <Text size="sm" tone="muted" leading="relaxed">{item.content}</Text>
            : item.content}
        </Animated.View>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// ScrollShadow
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaScrollShadowOrientation = "horizontal" | "vertical";
/**
 * Em que ponta o fio pode aparecer. `auto` e `both` são as duas pontas — e são o mesmo, como no
 * código dela (lá o `both` cai na mesma conta do `auto`). `top`/`left` só a do começo,
 * `bottom`/`right` só a do fim, `none` nenhuma.
 */
export type AureaScrollShadowVisibility = "auto" | "top" | "bottom" | "left" | "right" | "both" | "none";
/**
 * `surface` (o padrão): a lista numa superfície da Aurea, com o canto 22 do cartão, como o `Accordion`
 * no cartão. `plain`: sem caixa — para a lista que já mora dentro de um cartão (caixa dentro de caixa é
 * o que o `KPI variant="plain"` evita).
 */
export type AureaScrollShadowVariant = "surface" | "plain";

export interface ScrollShadowProps {
  /** O rolador: um `ScrollView`, um `FlatList`… Um elemento só. */
  children: React.ReactElement;
  /** Sem isto, sai do `horizontal` do rolador, como na referência. */
  orientation?: AureaScrollShadowOrientation;
  visibility?: AureaScrollShadowVisibility;
  /** `false` tira os fios. */
  isEnabled?: boolean;
  /** Padrão: `surface`. */
  variant?: AureaScrollShadowVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

type PropsDoRolador = {
  horizontal?: boolean | null;
  inverted?: boolean | null;
  onScroll?: unknown;
  onLayout?: (e: LayoutChangeEvent) => void;
  onContentSizeChange?: (w: number, h: number) => void;
  scrollEventThrottle?: number;
};

const ESMAECER_DO_FIO = 200;
// O da referência: um aviso de rolagem por quadro.
const AVISO_DE_ROLAGEM = 16;

/**
 * "Tem mais para lá" — o scroll-shadow da referência, com um FIO no lugar do degradê.
 *
 * 🔴 **Decisão do Victor:** a referência esmaece a ponta com um degradê de 50; a Aurea não tem
 * degradê (CLAUDE.md §5). Aqui é uma linha de 1 (a borda da Aurea, na cor de borda do tema), com as
 * pontas em cápsula, na ponta onde há mais conteúdo escondido, e SÓ lá: no topo da lista não há fio
 * em cima; no fim, não há embaixo. Na horizontal, à esquerda e à direita.
 *
 * 🔴 **E a lista mora numa superfície da Aurea** (Victor, 12/10/2026: *"o ScrollShadow não é [arredondado]
 * como todos da Aurea"*, apontando o `Accordion` no cartão): por padrão, fundo do cartão, canto 22 e a
 * sombra de superfície — a referência não tem caixa nenhuma. `variant="plain"` tira a caixa, para dentro
 * de um cartão; aí o fio recua 22 dos lados, para não fazer quina.
 *
 * Ele mede como o dela, pelos três avisos do rolador (`onLayout`, `onContentSizeChange` e
 * `onScroll`), e entrega ao rolador os avisos que o app já tinha posto, depois dos dele. O
 * `inverted` (a conversa, de baixo para cima) troca as pontas. O fio entra e sai esmaecendo em
 * 200 ms; com "menos movimento", aparece e some de uma vez.
 *
 * ⚠ Um `onScroll` que não é função — o `Animated.event` com o motor nativo — não é repassado: o
 * aviso dele vive no motor, e não há como chamá-lo daqui.
 */
export function ScrollShadow({
  children, orientation, visibility = "auto", isEnabled = true, variant = "surface", style, testID,
}: ScrollShadowProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const reduzir = useReduceMotion();
  const filho = React.isValidElement(children) ? (children as React.ReactElement<PropsDoRolador>) : null;
  const p: PropsDoRolador = filho?.props ?? {};
  const horizontal = orientation ? orientation === "horizontal" : !!p.horizontal;
  const invertido = !!p.inverted;

  const medidas = React.useRef({deslocamento: 0, visivel: 0, conteudo: 0});
  const [mais, setMais] = React.useState({antes: false, depois: false});
  const recalcular = () => {
    const {deslocamento, visivel, conteudo} = medidas.current;
    // A sobra menor que a espessura do próprio fio não conta: o arredondamento de pixel deixa o
    // deslocamento em 0,33 com a lista parada no topo, e o fio acenderia sem nada escondido.
    const folga = t.size.borderWidth;
    const antes = deslocamento > folga;
    const depois = visivel > 0 && conteudo - (deslocamento + visivel) > folga;
    setMais((a) => (a.antes === antes && a.depois === depois ? a : {antes, depois}));
  };

  const comecoPode = visibility !== "none" && visibility !== "bottom" && visibility !== "right";
  const fimPode = visibility !== "none" && visibility !== "top" && visibility !== "left";
  const noComeco = isEnabled && comecoPode && (invertido ? mais.depois : mais.antes);
  const noFim = isEnabled && fimPode && (invertido ? mais.antes : mais.depois);

  const opComeco = React.useRef(new Animated.Value(0)).current;
  const opFim = React.useRef(new Animated.Value(0)).current;
  const esmaecer = (v: Animated.Value) => (destino: number) =>
    Animated.timing(v, {toValue: destino, duration: ESMAECER_DO_FIO, useNativeDriver: driverNativo()});
  useLevarA(opComeco, noComeco ? 1 : 0, reduzir !== false, esmaecer(opComeco));
  useLevarA(opFim, noFim ? 1 : 0, reduzir !== false, esmaecer(opFim));

  if (!filho) return null;

  const rolador = React.cloneElement(filho, {
    scrollEventThrottle: p.scrollEventThrottle ?? AVISO_DE_ROLAGEM,
    onLayout: (e: LayoutChangeEvent) => {
      const {width, height} = e.nativeEvent.layout;
      medidas.current.visivel = horizontal ? width : height;
      recalcular();
      p.onLayout?.(e);
    },
    onContentSizeChange: (w: number, h: number) => {
      medidas.current.conteudo = horizontal ? w : h;
      recalcular();
      p.onContentSizeChange?.(w, h);
    },
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, layoutMeasurement, contentSize} = e.nativeEvent;
      const m = medidas.current;
      m.deslocamento = horizontal ? contentOffset.x : contentOffset.y;
      if (layoutMeasurement) m.visivel = horizontal ? layoutMeasurement.width : layoutMeasurement.height;
      if (contentSize) m.conteudo = horizontal ? contentSize.width : contentSize.height;
      recalcular();
      if (typeof p.onScroll === "function") (p.onScroll as (e: NativeSyntheticEvent<NativeScrollEvent>) => void)(e);
    },
  } as Partial<PropsDoRolador>);

  // Os fios são enfeite: fora do toque e fora do leitor de tela — quem lê a lista já ouve onde está.
  const decorativo = {
    pointerEvents: "none" as const,
    accessibilityElementsHidden: true,
    importantForAccessibility: "no-hide-descendants" as const,
  };
  const superficie = variant === "surface";
  const noLado = superficie && (horizontal ? s.fioDaEsquerdaNaSuperficie : s.fioDeCimaNaSuperficie);
  const fios = (
    <>
      <Animated.View {...decorativo} testID={testID ? `${testID}-start` : undefined}
        style={[horizontal ? s.fioDaEsquerda : s.fioDeCima, noLado, {opacity: opComeco}]} />
      <Animated.View {...decorativo} testID={testID ? `${testID}-end` : undefined}
        style={[horizontal ? s.fioDaDireita : s.fioDeBaixo, noLado, {opacity: opFim}]} />
    </>
  );
  if (!superficie) {
    return <View testID={testID} style={style}>{rolador}{fios}</View>;
  }
  // Na superfície, os fios ficam na borda da JANELA da lista (o miolo), e não na da caixa.
  return (
    <View testID={testID} style={[s.superficieDaLista, style]}>
      <View style={s.miolo}>{rolador}{fios}</View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// SkeletonGroup
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface SkeletonGroupProps {
  children?: React.ReactNode;
  /** `false` troca todos os esqueletos de dentro pelo conteúdo deles. Padrão: `true`. */
  isLoading?: boolean;
  /**
   * Some o grupo inteiro quando `isLoading` é `false` — para o grupo feito só de esqueletos, cujas
   * caixas de arrumação ficariam vazias ocupando lugar. Padrão: `false`.
   */
  isSkeletonOnly?: boolean;
  /** `"none"` para o pulso de todos. Padrão: `"pulse"`. */
  animation?: AureaSkeletonAnimation;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Um comando para vários esqueletos — o skeleton-group da referência. O `isLoading` e a `animation`
 * descem para todo `Skeleton` de dentro (a qualquer profundidade), e cada um pode trocar o seu.
 *
 * O PULSO é um só, do grupo: as caixas sobem e descem juntas, em vez de cada uma no tempo em que
 * montou. `SkeletonGroup.Item` é o próprio `Skeleton` — o nome existe porque a referência o tem.
 */
function SkeletonGroupRaiz({
  children, isLoading = true, isSkeletonOnly = false, animation = "pulse", style, testID,
}: SkeletonGroupProps) {
  const pulso = usePulsoDoEsqueleto(isLoading && animation === "pulse");
  const valor = React.useMemo<GrupoDeEsqueletoValor>(
    () => ({isLoading, animation, pulso}), [isLoading, animation, pulso]);
  if (isSkeletonOnly && !isLoading) return null;
  return (
    <GrupoDeEsqueleto.Provider value={valor}>
      <View testID={testID} style={style}>{children}</View>
    </GrupoDeEsqueleto.Provider>
  );
}

export const SkeletonGroup = Object.assign(SkeletonGroupRaiz, {Item: Skeleton});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// PressableFeedback
// ─────────────────────────────────────────────────────────────────────────────────────────────

// Os números da referência.
const ESCALA_PRESSIONADA = 0.985;
const LARGURA_DE_REFERENCIA = 300;   // a peça de 300 encolhe 0,985; a de 600, metade disso
const DURACAO_DA_ESCALA = 300;
const OPACIDADE_DO_REALCE = 0.1;
const DURACAO_DO_REALCE = 200;
const FATOR_DO_RAIO = 1.25;          // o círculo da onda: 1,25 × a diagonal da peça
const DIAGONAL_DE_REFERENCIA = 450;  // a onda de 1000 ms é a de uma peça com 450 de diagonal
const DURACAO_DA_ONDA = 1000;
const DURACAO_MINIMA_DA_ONDA = 750;

/** O quanto a peça encolhe: `escala` numa peça de 300; mais larga, menos; mais estreita, mais. */
const alvoDaEscala = (escala: number, largura: number) =>
  1 - (1 - escala) * (largura > 0 ? LARGURA_DE_REFERENCIA / largura : 1);

interface ToqueValor { pressionado: boolean; largura: number; altura: number; tudoParado: boolean }
const Toque = React.createContext<ToqueValor | null>(null);
function useToque(peca: string): ToqueValor {
  const v = React.useContext(Toque);
  if (!v) throw new Error(`Aurea ${peca}: use dentro de um PressableFeedback.`);
  return v;
}

// A raiz é o `Pressable` ANIMADO, como o dela: a escala vai no próprio alvo do toque, com o fundo e
// a borda de quem usa junto. Criado no primeiro desenho, e não ao importar o módulo — importar o
// pacote não pode depender de uma função de animação existir (o dublê dos testes não a tem).
const criarPressionavel = () => Animated.createAnimatedComponent(Pressable);
let pressionavelAnimado: ReturnType<typeof criarPressionavel> | null = null;

export interface PressableFeedbackProps extends Omit<PressableProps, "children" | "style" | "disabled"> {
  children?: React.ReactNode;
  /** Desliga o toque: anunciado como desligado e apagado (a `REACAO_AO_TOQUE` inerte da Aurea). */
  isDisabled?: boolean;
  /**
   * `false` tira a escala da raiz — para pôr a `PressableFeedback.Scale` num filho. `"disable-all"`
   * desliga também o realce, a onda e a escala de dentro. Padrão: `true`.
   */
  animation?: boolean | "disable-all";
  /** A escala com o dedo em cima, numa peça de 300 de largura. Padrão: 0,985, a da referência. */
  scale?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Um alvo de toque que responde — o pressable-feedback da referência. Por padrão a peça inteira
 * encolhe um pouco com o dedo em cima (0,985 numa peça de 300, proporcional à largura, em 300 ms).
 * Dentro dele, três partes que se combinam: `PressableFeedback.Highlight` (a camada que acende),
 * `PressableFeedback.Ripple` (a onda que nasce no dedo) e `PressableFeedback.Scale` (a escala num
 * filho só).
 *
 * É um botão para o leitor de tela (`accessibilityRole` troca). Com "menos movimento" a escala e o
 * realce SALTAM em vez de deslizar — como o `Button` da Aurea, que salta para 0,97 —, e a onda vira
 * uma camada parada.
 *
 * ⚠ Ele é UM elemento para o leitor de tela: não ponha botão dentro (no iPhone, o de dentro some —
 * o `check 43`). O que vai dentro é conteúdo.
 */
function PressableFeedbackRaiz({
  children, isDisabled = false, animation = true, scale = ESCALA_PRESSIONADA, style,
  onLayout, onPressIn, onPressOut, accessibilityRole, accessibilityState, ...resto
}: PressableFeedbackProps) {
  const s = folha(useAureaTokens());
  const reduzir = useReduceMotion();
  const [pressionado, setPressionado] = React.useState(false);
  const [medida, setMedida] = React.useState({largura: 0, altura: 0});
  const tudoParado = animation === "disable-all";
  const comEscala = animation !== false && !tudoParado;

  const escala = React.useRef(new Animated.Value(1)).current;
  useLevarA(escala, pressionado && comEscala ? alvoDaEscala(scale, medida.largura) : 1, reduzir !== false,
    (destino) => Animated.timing(escala, {
      toValue: destino, duration: DURACAO_DA_ESCALA, easing: SAIDA_SUAVE, useNativeDriver: driverNativo(),
    }));

  const contexto = React.useMemo<ToqueValor>(
    () => ({pressionado, largura: medida.largura, altura: medida.altura, tudoParado}),
    [pressionado, medida, tudoParado]);

  const Raiz = (pressionavelAnimado ??= criarPressionavel());
  return (
    <Toque.Provider value={contexto}>
      <Raiz
        {...resto}
        disabled={isDisabled}
        accessibilityRole={accessibilityRole ?? "button"}
        {...estadoAcessivel({...accessibilityState, disabled: isDisabled})}
        onLayout={(e: LayoutChangeEvent) => {
          const {width, height} = e.nativeEvent.layout;
          setMedida((m) => (m.largura === width && m.altura === height ? m : {largura: width, altura: height}));
          onLayout?.(e);
        }}
        onPressIn={(e: GestureResponderEvent) => { setPressionado(true); onPressIn?.(e); }}
        onPressOut={(e: GestureResponderEvent) => { setPressionado(false); onPressOut?.(e); }}
        style={[s.raizDoToque, isDisabled && REACAO_AO_TOQUE.inerte,
          comEscala && {transform: [{scale: escala}]}, style]}>
        {children}
      </Raiz>
    </Toque.Provider>
  );
}

export interface PressableFeedbackScaleProps {
  children?: React.ReactNode;
  /** A escala com o dedo em cima, pela largura da RAIZ. Padrão: 0,985. */
  scale?: number;
  /** `false` para esta escala. */
  animation?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A escala num filho só — com `animation={false}` na raiz, para não encolher duas vezes. */
function EscalaDoToque({children, scale = ESCALA_PRESSIONADA, animation = true, style, testID}: PressableFeedbackScaleProps) {
  const toque = useToque("PressableFeedback.Scale");
  const reduzir = useReduceMotion();
  const ligado = animation && !toque.tudoParado;
  const valor = React.useRef(new Animated.Value(1)).current;
  useLevarA(valor, toque.pressionado && ligado ? alvoDaEscala(scale, toque.largura) : 1, reduzir !== false,
    (destino) => Animated.timing(valor, {
      toValue: destino, duration: DURACAO_DA_ESCALA, easing: SAIDA_SUAVE, useNativeDriver: driverNativo(),
    }));
  return (
    <Animated.View testID={testID} style={[ligado && {transform: [{scale: valor}]}, style]}>
      {children}
    </Animated.View>
  );
}

export interface PressableFeedbackHighlightProps {
  /** Padrão: a cor do texto do tema (a referência usa um cinza claro no escuro e um escuro no claro). */
  color?: string;
  /** A opacidade com o dedo em cima. Padrão: 0,1. */
  opacity?: number;
  /** `false` tira o realce. */
  animation?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A camada que acende com o dedo em cima (o toque do iPhone): cobre a peça e vai a 10% em 200 ms. */
function RealceDoToque({color, opacity = OPACIDADE_DO_REALCE, animation = true, style, testID}: PressableFeedbackHighlightProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const toque = useToque("PressableFeedback.Highlight");
  const reduzir = useReduceMotion();
  const ligado = animation && !toque.tudoParado;
  const valor = React.useRef(new Animated.Value(0)).current;
  useLevarA(valor, toque.pressionado && ligado ? opacity : 0, reduzir !== false,
    (destino) => Animated.timing(valor, {toValue: destino, duration: DURACAO_DO_REALCE, useNativeDriver: driverNativo()}));
  if (!ligado) return null;
  return (
    <Animated.View testID={testID} pointerEvents="none"
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={[s.camada, {backgroundColor: color ?? t.color.foreground, opacity: valor}, style]} />
  );
}

export interface PressableFeedbackRippleProps {
  /** Padrão: a cor do texto do tema. */
  color?: string;
  /** A opacidade no pico da onda. Padrão: 0,1. */
  opacity?: number;
  /** `false` tira a onda. */
  animation?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

type Camada = {x: Animated.Value; y: Animated.Value; progresso: Animated.Value; viva: boolean;
  animacao: Animated.CompositeAnimation | null};

/**
 * A onda que nasce no dedo (o toque do Android): um círculo de 1,25 × a diagonal da peça, que
 * cresce de 0 até cobrir tudo e some ao soltar. Duas camadas que se revezam, como na referência: o
 * toque novo começa numa camada limpa enquanto a anterior termina de sumir, e a onda não pisca.
 *
 * Círculo cheio, de UMA cor — a dela é um degradê do centro para fora, e a Aurea não tem degradê.
 * Com "menos movimento" ela não cresce: acende inteira ao tocar e apaga ao soltar.
 */
function OndaDoToque({color, opacity = OPACIDADE_DO_REALCE, animation = true, style, testID}: PressableFeedbackRippleProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const toque = useToque("PressableFeedback.Ripple");
  const reduzir = useReduceMotion();
  const ligado = animation && !toque.tudoParado;
  const camadas = React.useRef<Camada[]>([0, 1].map(() => ({
    x: new Animated.Value(0), y: new Animated.Value(0), progresso: new Animated.Value(0), viva: false, animacao: null,
  }))).current;
  const ativa = React.useRef(0);
  React.useEffect(() => () => camadas.forEach((c) => c.animacao?.stop()), [camadas]);

  const diagonal = Math.hypot(toque.largura, toque.altura);
  const raio = diagonal * FATOR_DO_RAIO;
  // A duração acompanha o tamanho: 1000 ms numa diagonal de 450, nunca menos de 750 nem mais de 2000.
  const duracao = Math.min(
    Math.max(DURACAO_DA_ONDA * (diagonal > 0 ? diagonal / DIAGONAL_DE_REFERENCIA : 1), DURACAO_MINIMA_DA_ONDA),
    DURACAO_DA_ONDA * 2);

  const levar = (c: Camada, destino: number) => {
    c.animacao?.stop();
    c.animacao = null;
    if (reduzir !== false) { c.progresso.setValue(destino); return; }
    const a = Animated.timing(c.progresso, {toValue: destino, duration: duracao, useNativeDriver: driverNativo()});
    a.start();
    c.animacao = a;
  };
  const tocou = (e: GestureResponderEvent) => {
    if (!ligado) return;
    const anterior = camadas[ativa.current];
    // Só a onda que ainda está no ar termina de sumir; a camada parada em 0 iria a 2 passando pelo
    // pico, e piscaria no lugar antigo. A que já foi solta segue o próprio caminho até 2.
    if (anterior.viva) { anterior.viva = false; levar(anterior, 2); }
    ativa.current = 1 - ativa.current;
    const nova = camadas[ativa.current];
    nova.animacao?.stop();
    nova.x.setValue(e.nativeEvent.locationX - raio);
    nova.y.setValue(e.nativeEvent.locationY - raio);
    nova.progresso.setValue(0);
    nova.viva = true;
    levar(nova, 1);
  };
  const soltou = () => {
    const c = camadas[ativa.current];
    if (ligado && c.viva) { c.viva = false; levar(c, 2); }
  };

  if (!ligado) return null;
  return (
    <View testID={testID} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      onTouchStart={tocou} onTouchEnd={soltou} onTouchCancel={soltou} style={[s.camada, style]}>
      {camadas.map((c, i) => (
        <Animated.View key={i} pointerEvents="none" style={[s.onda, {
          width: raio * 2, height: raio * 2, ...canto(raio), backgroundColor: color ?? t.color.foreground,
          opacity: c.progresso.interpolate({inputRange: [0, 1, 2], outputRange: [0, opacity, 0]}),
          transform: [
            {translateX: c.x}, {translateY: c.y},
            {scale: c.progresso.interpolate({inputRange: [0, 1, 2], outputRange: [0, 1, 1]})},
          ],
        }]} />
      ))}
    </View>
  );
}

export const PressableFeedback = Object.assign(PressableFeedbackRaiz, {
  Scale: EscalaDoToque,
  Highlight: RealceDoToque,
  Ripple: OndaDoToque,
});
