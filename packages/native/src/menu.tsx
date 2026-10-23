// Aurea nativo — `Popover` e `DropdownMenu`: a camada que abre PRESA ao gatilho (0.32.0).
//
// Os nomes e a API são os da web (`overlays.tsx` do `@aurea-uds/react`): `trigger` é um elemento,
// `side` escolhe o lado, `arrow` liga a seta do `Popover`, e o menu recebe `items` na MESMA união
// `MenuEntry`. A anatomia, as medidas e o comportamento são os do pacote NATIVO da referência (o
// `Popover` e o `Menu` dela); a pele é a da Aurea — fundo `popover`, borda, canto 22 e sombra LG, a
// mesma superfície do `Dialog`.
//
// ── O QUE MUDA NA TRAVESSIA ──────────────────────────────────────────────────────────────────
//   a web (Base UI)               |  aqui
//   ------------------------------|------------------------------------------------------------
//   portal + posicionador         |  o `Modal` do RN (a janela de cima, sem dependência nova) e a
//                                 |  conta de posição nossa, a partir do `measureInWindow` do gatilho
//   `Escape` fecha                |  `onRequestClose` (o VOLTAR do Android) e `onAccessibilityEscape`
//                                 |  (o gesto de saída do VoiceOver, que o `Modal` não ouve)
//   clique fora fecha             |  o fundo tocável, IRMÃO do painel — a lição do `overlays.tsx`
//   submenu ao lado               |  abre NO LUGAR, dentro do mesmo painel, como o da referência:
//                                 |  num telefone não há "ao lado"
//   `menuitemcheckbox`/`radio`    |  `checkbox` e `radio`: o RN não tem os papéis de menu com marca
//
// ⚠ **A posição não está medida em aparelho.** O `measureInWindow` do gatilho e o `Modal` com
// `statusBarTranslucent` precisam contar do MESMO zero (o topo da tela). Com a tela de ponta a ponta
// do Android (o padrão das versões novas) contam; num app sem ela, o painel pode sair deslocado pela
// altura da barra de status. É pergunta para o `apps/native-smoke`, não para o dublê.
import * as React from "react";
import {
  Animated, Easing, Linking, Modal, Pressable, ScrollView, View, useWindowDimensions,
  type GestureResponderEvent, type LayoutChangeEvent,
} from "react-native";
import Svg, {Path} from "react-native-svg";
import {SafeAreaInsetsContext, initialWindowMetrics} from "react-native-safe-area-context";
import {canto, criarFolha, estadoAcessivel, letraDoToken, type EstadoAcessivel} from "./estilos.js";
import {NaSuperficie} from "./superficie.js";
import {Icon, type AureaIcon} from "./icon.js";
import {Text} from "./text.js";
import {ForaDaMarca, useTokensDoApp} from "./theme.js";
import {useReduceMotion, driverNativo} from "./movimento.js";
import type {AureaTokens} from "./tokens.js";

/** O lado do gatilho onde a camada abre. FÍSICO, como o `OverlaySide` da web. */
export type AureaOverlaySide = "top" | "right" | "bottom" | "left";

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A folha
// ─────────────────────────────────────────────────────────────────────────────────────────────

// Medidas do pacote nativo da referência, escritas com o token que dá o mesmo número. Onde a escala
// da Aurea não tem o número dela, vale o token mais perto, e a linha diz qual era.
const folha = criarFolha((t: AureaTokens) => ({
  camada: {flex: 1},
  fundoDeToque: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
  painel: {
    position: "absolute",
    backgroundColor: t.color.popover,
    borderWidth: t.size.borderWidth, borderColor: "transparent",
    ...canto(t.size.radiusCard),
    boxShadow: [...t.shadowLayers.shadowLg],
  },
  // O `Popover` da referência: 12 em cima e embaixo, 16 dos lados.
  painelPopover: {paddingVertical: t.size.space3, paddingHorizontal: t.size.space4},
  // O `Menu` da referência: 12 em cima e embaixo; dos lados ela usa 6, que a escala não tem — vale
  // o `space1` (4), o recheio do `.menu` da web. O texto do item continua a 16 da borda (4 + 12).
  painelMenu: {paddingVertical: t.size.space3, paddingHorizontal: t.size.space1},
  // O título do `Popover`: 18 em peso médio (no componente), e 4 até o corpo — o `gap-1` do exemplo
  // da referência.
  titulo: {marginBottom: t.size.space1},
  // A lista rola quando passa da janela; sem crescer, para o painel ter o tamanho do conteúdo.
  rolagem: {flexGrow: 0, flexShrink: 1},
  // O item: 8 em cima e embaixo, como o dela. Dos lados ela usa 10 e entre as peças 10, que a escala
  // não tem: aqui 12 (o texto fica a 16 da borda, o mesmo número dela) e 8. ⚠ A altura dela é 40
  // (8 + a linha de 24 + 8); aqui o mínimo é o `targetMin` (44), e não `hitSlop` — o `actions.tsx`
  // mediu que o TalkBack não enxerga o `hitSlop`.
  item: {
    minHeight: t.size.targetMin, flexDirection: "row", alignItems: "center",
    gap: t.size.space2, paddingVertical: t.size.space2, paddingHorizontal: t.size.space3,
    ...canto(t.size.radiusLg),
  },
  // O toque: o fundo de destaque do `.menu-item` da web (`surface-3`) e o 0,98 da referência; no item
  // que destrói, o fundo suave do perigo, como o dela.
  itemTocando: {backgroundColor: t.color.surface3, transform: [{scale: 0.98}]},
  itemTocandoPerigo: {backgroundColor: t.color.dangerBg, transform: [{scale: 0.98}]},
  desabilitado: {opacity: t.size.opacityDisabled},
  // Cresce, mas sem `flex: 1`: com base zero, num painel que tem a largura do conteúdo, o rótulo
  // não empurraria a largura e quebraria letra a letra.
  rotulo: {flexGrow: 1, flexShrink: 1, minWidth: 0},
  // A casa da marca: a caixa de 20 do indicador da referência, com o `check` de 16 — a mesma do
  // `Select`. Largura FIXA, como o `.menu-mark` da web: o rótulo não anda quando a marca aparece.
  indicador: {width: t.size.iconMd, height: t.size.iconMd, alignItems: "center", justifyContent: "center"},
  // O ponto do rádio: 8, o da referência e o `.menu-ponto` da web. Forma, não ícone.
  ponto: {
    width: t.size.space2, height: t.size.space2, ...canto(t.size.radiusFull),
    // A cor do ponto é a do TEXTO da linha, como na web (`.menu-ponto` pinta com `currentColor`) — era o destaque, azul
    // no claro e amarelo no escuro (bloco 1, 23/10/2026).
    backgroundColor: t.color.foreground,
  },
  // O rótulo de seção: 14 em peso médio e esmaecido (no componente), alinhado ao texto dos itens.
  rotuloDoGrupo: {paddingHorizontal: t.size.space3, paddingTop: t.size.space2, paddingBottom: t.size.space1},
  separador: {
    height: t.size.borderWidth, marginVertical: t.size.space2, marginHorizontal: t.size.space2,
    backgroundColor: t.color.border,
  },
  // O submenu aberto é uma superfície acima do menu, como o da referência: o fundo, a linha e a
  // sombra numa camada própria ATRÁS das linhas. Ela nasce já pintada (montada só com o submenu
  // aberto) — caixa que ganha cor depois de montada perde o raio no Android (react-native#52415).
  fundoDoSubmenu: {
    position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: t.color.popover,
    borderWidth: t.size.borderWidth, borderColor: "transparent",
    ...canto(t.size.radiusLg),
    boxShadow: [...t.shadowLayers.shadowMd],
  },
}));
type Folha = ReturnType<typeof folha>;

// A seta do `Popover`: a da referência tem 20 de largura e 12 de altura (`space5` × `space3`).
const larguraDaSeta = (t: AureaTokens) => t.size.space5;
const alturaDaSeta = (t: AureaTokens) => t.size.space3;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A posição
// ─────────────────────────────────────────────────────────────────────────────────────────────

type Retangulo = {x: number; y: number; width: number; height: number};
type Tamanho = {width: number; height: number};
type Recuo = {top: number; right: number; bottom: number; left: number};
type Medivel = {measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void};

const preso = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

/**
 * Onde o painel fica. Centrado no gatilho, como o da referência (o alinhamento padrão dela e o da
 * web), e preso dentro da janela com o recuo.
 *
 * ⚠ **Ele VIRA de lado quando não cabe e o outro lado tem mais espaço** — o que o posicionador da
 * web faz. A referência não vira: só empurra o painel para dentro da tela, e um menu pedido para
 * baixo num gatilho no pé da tela acaba EM CIMA do gatilho. Depois de virar, ele ainda é preso à
 * janela, como o dela.
 */
function posicionar(a: Retangulo, c: Tamanho, W: number, H: number, r: Recuo, d: number, pedido: AureaOverlaySide) {
  const vertical = pedido === "top" || pedido === "bottom";
  let lado = pedido;
  if (vertical) {
    const baixo = H - r.bottom - (a.y + a.height + d);
    const cima = a.y - d - r.top;
    if (pedido === "bottom" && c.height > baixo && cima > baixo) lado = "top";
    if (pedido === "top" && c.height > cima && baixo > cima) lado = "bottom";
  } else {
    const direita = W - r.right - (a.x + a.width + d);
    const esquerda = a.x - d - r.left;
    if (pedido === "right" && c.width > direita && esquerda > direita) lado = "left";
    if (pedido === "left" && c.width > esquerda && direita > esquerda) lado = "right";
  }
  const left = vertical ? a.x + a.width / 2 - c.width / 2
    : lado === "right" ? a.x + a.width + d : a.x - d - c.width;
  const top = !vertical ? a.y + a.height / 2 - c.height / 2
    : lado === "bottom" ? a.y + a.height + d : a.y - d - c.height;
  return {
    lado,
    left: preso(left, r.left, W - r.right - c.width),
    top: preso(top, r.top, H - r.bottom - c.height),
  };
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// O gatilho e o estado da camada
// ─────────────────────────────────────────────────────────────────────────────────────────────

type PropsDoGatilho = {
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean | null;
  pressed?: boolean;
  accessibilityState?: EstadoAcessivel;
  ref?: React.Ref<unknown>;
};

interface Camada {
  aberto: boolean;
  ancora: Retangulo | null;
  tamanho: Tamanho | null;
  fechar: () => void;
  aoMedirPainel: (e: LayoutChangeEvent) => void;
  gatilho: React.ReactElement;
}

/**
 * O gatilho da web é um ELEMENTO (`render={trigger}` no Base UI); aqui ele é clonado com o toque que
 * abre, a REF que mede e o estado `expanded` — o toque do app continua valendo, depois do nosso.
 *
 * ⚠ **A medida vem da ref**, e o `Button` e o `IconButton` da Aurea a levam até o `Pressable` (no
 * React 19 a `ref` é prop). Um gatilho que a engula ainda abre: cai no `currentTarget` do toque e,
 * sem ele, no PONTO do dedo — o painel abre onde a pessoa tocou, em vez de não abrir.
 */
function useCamada(trigger: React.ReactElement, aoFecharTambem?: () => void): Camada {
  const [aberto, setAberto] = React.useState(false);
  const [ancora, setAncora] = React.useState<Retangulo | null>(null);
  const [tamanho, setTamanho] = React.useState<Tamanho | null>(null);
  const no = React.useRef<Medivel | null>(null);
  const {width: W, height: H} = useWindowDimensions();
  const props = trigger.props as PropsDoGatilho;
  const refOriginal = props.ref;

  const medir = React.useCallback((e?: GestureResponderEvent) => {
    const alvo = no.current ?? (e?.currentTarget as unknown as Medivel | undefined);
    if (alvo && typeof alvo.measureInWindow === "function") {
      alvo.measureInWindow((x, y, width, height) => {
        if ([x, y, width, height].every(Number.isFinite)) setAncora({x, y, width, height});
      });
      return;
    }
    const toque = e?.nativeEvent;
    if (toque) setAncora({x: toque.pageX, y: toque.pageY, width: 0, height: 0});
  }, []);

  // A janela girou (ou mudou de tamanho) com a camada aberta: o gatilho andou, mede de novo.
  // Só a janela entra na lista: abrir já mede no toque, e medir de novo ao abrir seria dobrado.
  const abertoAgora = React.useRef(aberto);
  abertoAgora.current = aberto;
  React.useEffect(() => { if (abertoAgora.current) medir(); }, [W, H, medir]);

  const fechar = React.useCallback(() => {
    setAberto(false); setAncora(null); setTamanho(null);
    aoFecharTambem?.();
  }, [aoFecharTambem]);

  const aoMedirPainel = React.useCallback((e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout;
    // Mudar `left`/`top` dispara outro `onLayout` com o MESMO tamanho; sem a comparação, laço.
    setTamanho((antes) => antes && antes.width === width && antes.height === height ? antes : {width, height});
  }, []);

  const ref = React.useCallback((n: unknown) => {
    no.current = (n as Medivel | null) ?? null;
    if (typeof refOriginal === "function") refOriginal(n);
    else if (refOriginal && typeof refOriginal === "object") (refOriginal as React.RefObject<unknown>).current = n;
  }, [refOriginal]);

  const doApp = props.onPress;
  const tocar = React.useCallback((e: GestureResponderEvent) => {
    medir(e);
    setAberto(true);
    doApp?.(e);
  }, [medir, doApp]);

  // O estado do gatilho é ESCRITO por cima do que o botão calculou (o `...rest` dele vem depois),
  // então o `disabled` e o `pressed` dele entram de novo aqui, para não se perderem.
  const estado: EstadoAcessivel = {
    ...props.accessibilityState,
    ...(props.disabled != null ? {disabled: !!props.disabled} : null),
    ...(props.pressed !== undefined ? {checked: props.pressed} : null),
    expanded: aberto,
  };
  const gatilho = React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
    ref, onPress: tocar, accessibilityState: estado, "aria-expanded": aberto,
  });

  return {aberto, ancora, tamanho, fechar, aoMedirPainel, gatilho};
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A camada: o `Modal`, o fundo tocável, o painel e a seta
// ─────────────────────────────────────────────────────────────────────────────────────────────

const SEM_RECUO: Recuo = {top: 0, right: 0, bottom: 0, left: 0};

interface CamadaProps {
  c: Camada;
  side: AureaOverlaySide;
  seta?: boolean;
  menu?: boolean;
  label?: string;
  testID?: string;
  children?: React.ReactNode;
}

/**
 * A entrada é a da referência: o painel nasce invisível, é MEDIDO, vai para o lugar e só então
 * aparece — opacidade de 0 a 1, escala de 0,97 a 1 e um passo de 8 vindo do gatilho, no `durationBase`
 * (a dela é 200; a escala de duração da Aurea tem 180). A saída é imediata: o `Modal` some na hora.
 */
function CamadaPresa({c, side, seta = false, menu = false, label, testID, children}: CamadaProps) {
  // A camada sai do fluxo: o FUNDO é pintado com os tokens do APP (ADR-0063 — ver `useTokensDoApp`).
  // O texto e o ícone de dentro leem o tema do app sozinhos, porque estão dentro do `ForaDaMarca`.
  const tf = useTokensDoApp();
  const s = folha(tf);
  const {width: W, height: H} = useWindowDimensions();
  const reduzir = useReduceMotion();
  // O recuo da janela é o da referência (12) somado à área do sistema — do CONTEXTO, que atravessa o
  // `Modal`; sem `SafeAreaProvider`, a medida da abertura (o mesmo caminho do `RecuoDaFolha`).
  const sa = React.useContext(SafeAreaInsetsContext) ?? initialWindowMetrics?.insets ?? SEM_RECUO;
  const recuo: Recuo = {
    top: tf.size.space3 + sa.top, right: tf.size.space3 + sa.right,
    bottom: tf.size.space3 + sa.bottom, left: tf.size.space3 + sa.left,
  };
  // A distância do gatilho: a referência usa 9, que a escala não tem — vale o `space2` (8), o mesmo
  // do `Popover` da web. Com a seta, a altura dela: a ponta encosta no gatilho, sem passar por cima.
  const distancia = seta ? alturaDaSeta(tf) : tf.size.space2;
  const pronto = c.aberto && c.ancora != null && c.tamanho != null;
  const pos = pronto ? posicionar(c.ancora!, c.tamanho!, W, H, recuo, distancia, side) : null;

  const progresso = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!pronto) { progresso.setValue(0); return; }
    // `!== false`, e não `=== true`: enquanto o sistema não respondeu, não anima (ver `movimento.ts`).
    if (reduzir !== false) { progresso.setValue(1); return; }
    const laco = Animated.timing(progresso, {
      toValue: 1, duration: tf.size.durationBase, useNativeDriver: driverNativo(),
      easing: Easing.bezier(...tf.easing.easeStandard),
    });
    laco.start();
    return () => laco.stop();
  }, [pronto, reduzir, progresso, tf.size.durationBase, tf.easing.easeStandard]);

  // O passo vem do lado do gatilho: abaixo dele, o painel desce; acima, sobe. O da referência é a
  // distância, no máximo 12.
  const passo = Math.min(distancia, alturaDaSeta(tf));
  const de = pos && (pos.lado === "bottom" || pos.lado === "right") ? -passo : passo;
  const desloca = progresso.interpolate({inputRange: [0, 1], outputRange: [de, 0]});
  const entrada = pos
    ? {
      left: pos.left, top: pos.top, opacity: progresso,
      transform: [
        pos.lado === "top" || pos.lado === "bottom" ? {translateY: desloca} : {translateX: desloca},
        {scale: progresso.interpolate({inputRange: [0, 1], outputRange: [0.97, 1]})},
      ],
    }
    // Antes de medido, invisível: é a medida dele que diz onde ele vai.
    : {opacity: 0};

  return (
    <ForaDaMarca>
    <Modal visible={c.aberto} transparent animationType="none" statusBarTranslucent
           navigationBarTranslucent onRequestClose={c.fechar} testID={testID}>
      {c.aberto ? (
        <View style={s.camada}>
          {/* O fundo é transparente, como o da referência: o painel não escurece a tela. Ele só
              recebe o toque de fora — irmão do painel, não ancestral (`overlays.tsx`). */}
          <Pressable style={s.fundoDeToque} onPress={c.fechar} accessible={false}
                     testID={testID ? `${testID}-fundo` : undefined} />
          <Animated.View
            testID={testID ? `${testID}-painel` : undefined}
            onLayout={c.aoMedirPainel}
            onAccessibilityEscape={c.fechar}
            pointerEvents={pos ? "auto" : "none"}
            accessibilityRole={menu ? "menu" : undefined}
            accessibilityLabel={label}
            style={[
              s.painel, menu ? s.painelMenu : s.painelPopover,
              {left: recuo.left, top: recuo.top,
               maxWidth: W - recuo.left - recuo.right, maxHeight: H - recuo.top - recuo.bottom},
              entrada,
            ]}>
            {seta && pos && c.ancora && c.tamanho
              ? <Seta tf={tf} lado={pos.lado} ancora={c.ancora} painel={{...c.tamanho, x: pos.left, y: pos.top}} />
              : null}
            {children}
          </Animated.View>
        </View>
      ) : null}
    </Modal>
    </ForaDaMarca>
  );
}

/**
 * A seta: a medida e o lugar da referência (20 × 12, apontando para o MEIO do gatilho, a 12 das
 * pontas do painel); o desenho é o da seta da web, uma curva só, e não um triângulo de bico.
 * O fundo cobre a borda do painel embaixo dela, e o traço continua a borda.
 */
function Seta({tf, lado, ancora, painel}: {tf: AureaTokens; lado: AureaOverlaySide; ancora: Retangulo; painel: Retangulo}) {
  const w = larguraDaSeta(tf);
  const h = alturaDaSeta(tf);
  const b = tf.size.borderWidth;
  const meio = b / 2;          // o bico recua meio traço, para o traço não ser cortado pela caixa
  const vertical = lado === "top" || lado === "bottom";
  // Ao longo da borda, contado de dentro dela (o absoluto do RN conta da caixa de recheio).
  const ao = vertical
    ? preso(ancora.x + ancora.width / 2 - painel.x - b - w / 2, tf.size.space3, painel.width - 2 * b - w - tf.size.space3)
    : preso(ancora.y + ancora.height / 2 - painel.y - b - w / 2, tf.size.space3, painel.height - 2 * b - w - tf.size.space3);
  // A curva: o ponto de controle a DUAS profundidades da base deixa o bico exatamente na ponta.
  const linha =
    lado === "bottom" ? `M0 ${h} Q${w / 2} ${2 * meio - h} ${w} ${h}`        // painel embaixo: aponta para cima
    : lado === "top" ? `M0 0 Q${w / 2} ${2 * (h - meio)} ${w} 0`             // painel em cima: para baixo
    : lado === "right" ? `M${h} 0 Q${2 * meio - h} ${w / 2} ${h} ${w}`       // painel à direita: para a esquerda
    : `M0 0 Q${2 * (h - meio)} ${w / 2} 0 ${w}`;                             // painel à esquerda: para a direita
  const lugar =
    lado === "bottom" ? {top: -h, left: ao}
    : lado === "top" ? {bottom: -h, left: ao}
    : lado === "right" ? {left: -h, top: ao}
    : {right: -h, top: ao};
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
          style={[{position: "absolute"}, lugar]}>
      <Svg width={vertical ? w : h} height={vertical ? h : w}>
        <Path d={`${linha} Z`} fill={tf.color.popover} />
        <Path d={linha} fill="none" stroke={tf.color.border} strokeWidth={b}
              strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Popover
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface PopoverProps {
  /** O elemento que abre — um `Button`, um `IconButton`. O toque dele continua valendo. */
  trigger: React.ReactElement;
  /** O título: 18 em peso médio, anunciado como cabeçalho. */
  title?: React.ReactNode;
  /** O corpo. Texto solto sai como a descrição da referência: 16, esmaecido. */
  children: React.ReactNode;
  /** O lado do gatilho. Vira sozinho quando não cabe. */
  side?: AureaOverlaySide;
  /** A seta apontando para o gatilho. */
  arrow?: boolean;
  /** Só do nativo, como nos outros sobrepostos: `-fundo` e `-painel` marcam as duas peças. */
  testID?: string;
}

/**
 * A janela pequena presa ao gatilho: abre no toque, fecha no toque fora e no VOLTAR.
 *
 * ⚠ **Sem papel de diálogo**, pela razão medida no `overlays.tsx`: `role="dialog"` não mapeia em
 * plataforma nenhuma. O confinamento do leitor de tela vem do `Modal`, que é uma janela do sistema;
 * o nome vem do título, que é um cabeçalho. No iOS, o gesto de saída do VoiceOver fecha.
 */
export function Popover({trigger, title, children, side = "bottom", arrow = false, testID}: PopoverProps) {
  const c = useCamada(trigger);
  return (
    <>
      {c.gatilho}
      <CamadaPresa c={c} side={side} seta={arrow} testID={testID}>
        <TituloDoPopover title={title} />
        {/* ADR-0078: o popover é superfície branca; o campo de dentro fica cinza. */}
        <NaSuperficie.Provider value>{typeof children === "string" ? <Text size="md" tone="muted">{children}</Text> : children}</NaSuperficie.Provider>
      </CamadaPresa>
    </>
  );
}

function TituloDoPopover({title}: {title: React.ReactNode}) {
  const s = folha(useTokensDoApp());
  if (title == null || title === false) return null;
  return <Text size="lg" weight={500} accessibilityRole="header" style={s.titulo}>{title}</Text>;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// O modelo do menu — a MESMA união da web
// ─────────────────────────────────────────────────────────────────────────────────────────────

interface MenuItemBase {label: React.ReactNode; disabled?: boolean; leadingIcon?: AureaIcon}
/** Item de ação. `kind` é opcional, como na web. */
export interface MenuActionDef extends MenuItemBase {
  kind?: "item";
  onClick?: () => void;
  /**
   * Só do nativo: o item que DESTRÓI dado, com o texto e o toque no tom de perigo — o `danger` do
   * item da referência. A web ainda não tem o campo.
   */
  destructive?: boolean;
}
/** Item que abre um endereço — no aparelho, pelo `Linking`. Sem `disabled`, como na web. */
export interface MenuLinkDef {
  kind: "link"; label: React.ReactNode; leadingIcon?: AureaIcon; href: string;
  /** Fechar ao tocar. Padrão `true`, como na web. */
  closeOnClick?: boolean;
}
/** Item que ALTERNA. Controlado (`checked`) ou não (`defaultChecked`). O menu fica aberto. */
export interface MenuCheckboxDef extends MenuItemBase {
  kind: "checkbox"; checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void;
}
/** Opções mutuamente exclusivas. Escolher fecha o menu, como a escolha única da referência. */
export interface MenuRadioGroupDef {
  kind: "radiogroup"; label?: React.ReactNode; value?: string; defaultValue?: string;
  onValueChange?: (value: string) => void;
  items: Array<{value: string; label: React.ReactNode; disabled?: boolean; leadingIcon?: AureaIcon}>;
}
/** Submenu: abre NO LUGAR, dentro do painel. `items` aninha a mesma união. */
export interface MenuSubmenuDef extends MenuItemBase {kind: "submenu"; items: MenuEntry[]}
/** Seção rotulada. O rótulo não é item: não se toca. */
export interface MenuGroupDef {kind: "group"; label?: React.ReactNode; items: MenuEntry[]}
export type MenuEntry = MenuActionDef | MenuLinkDef | MenuCheckboxDef | MenuRadioGroupDef | MenuSubmenuDef
  | MenuGroupDef | "separator";

// ─────────────────────────────────────────────────────────────────────────────────────────────
// DropdownMenu
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface DropdownMenuProps {
  trigger: React.ReactElement;
  items: MenuEntry[];
  side?: AureaOverlaySide;
  /** O nome do menu para o leitor de tela. */
  label?: string;
  testID?: string;
}

type PapelDaLinha = "menuitem" | "checkbox" | "radio" | "link";

interface Contexto {
  tf: AureaTokens;
  s: Folha;
  /** A chave do submenu aberto mais fundo, ou `null`. Os de cima dele também estão abertos. */
  subAberto: string | null;
  setSubAberto: (k: string | null) => void;
  marcado: Record<string, boolean | string>;
  marcar: (k: string, v: boolean | string) => void;
  fechar: () => void;
}

// Com um submenu aberto, o resto do menu esmaece e não responde, como o da referência: o que está
// fora do caminho aberto. A chave de cada entrada é o caminho dela (`3/1/0`).
const apagado = (k: string, aberto: string | null) =>
  aberto != null && k !== aberto && !k.startsWith(`${aberto}/`) && !aberto.startsWith(`${k}/`);

/**
 * O menu de comandos preso ao gatilho.
 *
 * O estado de quem alterna sem ser controlado (`defaultChecked`, `defaultValue`) mora AQUI, e não no
 * painel: o painel desmonta ao fechar, e o item marcado tem de continuar marcado na próxima vez.
 */
export function DropdownMenu({trigger, items, side = "bottom", label, testID}: DropdownMenuProps) {
  const tf = useTokensDoApp();
  const s = folha(tf);
  const [subAberto, setSubAberto] = React.useState<string | null>(null);
  const [marcado, setMarcado] = React.useState<Record<string, boolean | string>>({});
  // Fechar o menu fecha os submenus — ele reabre do começo.
  const fecharSub = React.useCallback(() => setSubAberto(null), []);
  const c = useCamada(trigger, fecharSub);
  const marcar = React.useCallback((k: string, v: boolean | string) => setMarcado((m) => ({...m, [k]: v})), []);
  const ctx: Contexto = {tf, s, subAberto, setSubAberto, marcado, marcar, fechar: c.fechar};
  return (
    <>
      {c.gatilho}
      <CamadaPresa c={c} side={side} menu label={label} testID={testID}>
        <ScrollView style={s.rolagem}>{renderizar(items, "", null, ctx)}</ScrollView>
      </CamadaPresa>
    </>
  );
}

function renderizar(items: MenuEntry[], prefixo: string, paiSub: string | null, ctx: Contexto): React.ReactNode[] {
  const {s, subAberto} = ctx;
  return items.map((it, i) => {
    const k = `${prefixo}${i}`;
    if (it === "separator") {
      return <View key={k} style={[s.separador, apagado(k, subAberto) && s.desabilitado]}
                   accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
    }
    switch (it.kind ?? "item") {
      case "group": {
        const g = it as MenuGroupDef;
        return (
          <View key={k}>
            <RotuloDoGrupo ctx={ctx} k={k}>{g.label}</RotuloDoGrupo>
            {renderizar(g.items, `${k}/`, paiSub, ctx)}
          </View>
        );
      }
      case "radiogroup": {
        const g = it as MenuRadioGroupDef;
        const atual = g.value ?? (ctx.marcado[k] as string | undefined) ?? g.defaultValue;
        return (
          <View key={k} accessibilityRole="radiogroup"
                accessibilityLabel={typeof g.label === "string" ? g.label : undefined}>
            <RotuloDoGrupo ctx={ctx} k={k}>{g.label}</RotuloDoGrupo>
            {g.items.map((r, j) => {
              const kr = `${k}/${j}`;
              const escolhido = r.value === atual;
              return (
                <Linha key={kr} ctx={ctx} papel="radio" rotulo={r.label} icone={r.leadingIcon}
                  estado={{checked: escolhido}} inativo={!!r.disabled || apagado(kr, subAberto)}
                  marca={escolhido ? <View style={s.ponto} /> : null}
                  aoTocar={() => {
                    if (!escolhido) {
                      if (g.value === undefined) ctx.marcar(k, r.value);
                      g.onValueChange?.(r.value);
                    }
                    ctx.fechar();
                  }} />
              );
            })}
          </View>
        );
      }
      case "checkbox": {
        const cb = it as MenuCheckboxDef;
        const ligado = cb.checked ?? (ctx.marcado[k] as boolean | undefined) ?? cb.defaultChecked ?? false;
        return (
          <Linha key={k} ctx={ctx} papel="checkbox" rotulo={cb.label} icone={cb.leadingIcon}
            estado={{checked: ligado}} inativo={!!cb.disabled || apagado(k, subAberto)}
            marca={ligado ? <Icon name="check" size="sm" color={ctx.tf.color.foreground} /> : null}
            aoTocar={() => {
              // Alterna e FICA aberto — a escolha múltipla da referência e o item da web.
              if (cb.checked === undefined) ctx.marcar(k, !ligado);
              cb.onCheckedChange?.(!ligado);
            }} />
        );
      }
      case "link": {
        const l = it as MenuLinkDef;
        return (
          <Linha key={k} ctx={ctx} papel="link" rotulo={l.label} icone={l.leadingIcon}
            inativo={apagado(k, subAberto)}
            aoTocar={() => {
              // Endereço que nenhum app abre rejeita a promessa; não há o que dizer, e não pode virar erro solto.
              void Linking.openURL(l.href).catch(() => {});
              if (l.closeOnClick ?? true) ctx.fechar();
            }} />
        );
      }
      case "submenu": {
        const sm = it as MenuSubmenuDef;
        const aberto = subAberto === k || (subAberto?.startsWith(`${k}/`) ?? false);
        return (
          <LinhaDeSubmenu key={k} ctx={ctx} def={sm} aberto={aberto}
            inativo={!!sm.disabled || apagado(k, subAberto)}
            alternar={() => ctx.setSubAberto(aberto ? paiSub : k)}>
            {renderizar(sm.items, `${k}/`, k, ctx)}
          </LinhaDeSubmenu>
        );
      }
      default: {
        const a = it as MenuActionDef;
        return (
          <Linha key={k} ctx={ctx} papel="menuitem" rotulo={a.label} icone={a.leadingIcon}
            destrutivo={a.destructive} inativo={!!a.disabled || apagado(k, subAberto)}
            aoTocar={() => { a.onClick?.(); ctx.fechar(); }} />
        );
      }
    }
  });
}

function RotuloDoGrupo({ctx, k, children}: {ctx: Contexto; k: string; children?: React.ReactNode}) {
  if (children == null || children === false) return null;
  return (
    <View style={[ctx.s.rotuloDoGrupo, apagado(k, ctx.subAberto) && ctx.s.desabilitado]}>
      {typeof children === "string"
        ? <Text size="xs" weight={500} tone="muted" accessibilityRole="header">{children}</Text>
        : children}
    </View>
  );
}

interface LinhaProps {
  ctx: Contexto;
  papel: PapelDaLinha;
  rotulo: React.ReactNode;
  icone?: AureaIcon;
  /** `undefined`: a linha não tem casa de marca. `null`: tem, e está vazia. */
  marca?: React.ReactNode;
  estado?: EstadoAcessivel;
  inativo?: boolean;
  destrutivo?: boolean;
  final?: React.ReactNode;
  aoTocar: () => void;
}

function Linha({ctx, papel, rotulo, icone, marca, estado, inativo = false, destrutivo = false, final, aoTocar}: LinhaProps) {
  const {tf, s} = ctx;
  const cor = destrutivo ? letraDoToken(tf, "destructive") ?? tf.color.destructive : tf.color.foreground;
  return (
    <Pressable
      onPress={inativo ? undefined : aoTocar}
      disabled={inativo}
      // Escrito por extenso, e não `{papel}`: o check 41 lê os papéis no fonte, e só confere o que vê.
      accessibilityRole={papel === "checkbox" ? "checkbox" : papel === "radio" ? "radio"
        : papel === "link" ? "link" : "menuitem"}
      {...estadoAcessivel({...estado, disabled: inativo})}
      style={({pressed}) => [
        s.item, pressed && (destrutivo ? s.itemTocandoPerigo : s.itemTocando), inativo && s.desabilitado,
      ]}>
      {marca !== undefined ? <View style={s.indicador}>{marca}</View> : null}
      {icone ? <Icon name={icone} size="md" color={cor} /> : null}
      {typeof rotulo === "string" || typeof rotulo === "number"
        // 16 em peso médio, o título do item da referência.
        ? <Text size="md" weight={500} tone={destrutivo ? "danger" : "default"} style={s.rotulo}>{rotulo}</Text>
        : <View style={s.rotulo}>{rotulo}</View>}
      {final}
    </Pressable>
  );
}

/** O gatilho do submenu: a seta de 16 gira 90° ao abrir, como a da referência. */
function LinhaDeSubmenu({ctx, def, aberto, inativo, alternar, children}: {
  ctx: Contexto; def: MenuSubmenuDef; aberto: boolean; inativo: boolean; alternar: () => void; children: React.ReactNode;
}) {
  const {tf, s} = ctx;
  const reduzir = useReduceMotion();
  const giro = React.useRef(new Animated.Value(aberto ? 1 : 0)).current;
  const antes = React.useRef(aberto);
  React.useEffect(() => {
    const mudou = antes.current !== aberto;
    antes.current = aberto;
    // Só anima o que MUDOU: a resposta do sistema chegando não pode virar um giro de 0 para 0.
    if (!mudou || reduzir !== false) { giro.setValue(aberto ? 1 : 0); return; }
    const laco = Animated.timing(giro, {
      toValue: aberto ? 1 : 0, duration: tf.size.durationFast, useNativeDriver: driverNativo(),
      easing: Easing.bezier(...tf.easing.easeStandard),
    });
    laco.start();
    return () => laco.stop();
  }, [aberto, reduzir, giro, tf.size.durationFast, tf.easing.easeStandard]);
  const seta = (
    <Animated.View style={{transform: [{rotate: giro.interpolate({inputRange: [0, 1], outputRange: ["0deg", "90deg"]})}]}}>
      <Icon name="caret-right" size="sm" color={tf.color.mutedForeground} />
    </Animated.View>
  );
  return (
    <View>
      {aberto ? <View pointerEvents="none" style={s.fundoDoSubmenu} /> : null}
      <Linha ctx={ctx} papel="menuitem" rotulo={def.label} icone={def.leadingIcon}
        estado={{expanded: aberto}} inativo={inativo} final={seta} aoTocar={alternar} />
      {aberto ? children : null}
    </View>
  );
}
