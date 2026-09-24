// Aurea nativo — o **aviso passageiro**: `ToastHost`, `useToast` e o `Toast` que a pilha desenha.
//
// Lote 5 do `NATIVE.md` §5.5. Na web isto é `useToast`, e o motor é o gerente de avisos do Base
// UI (`@base-ui/react/toast`), montado pelo `AureaProvider` num portal. **Aqui não há nem um nem
// outro**, e as duas ausências decidem a API deste arquivo.
//
// ── AUSÊNCIA 1: NÃO HÁ PORTAL ────────────────────────────────────────────────────────────────
//
// Na web o `AureaProvider` pendura a pilha no fim do `<body>` com um portal, e por isso ela flutua
// sobre tudo sem o app saber. O React Native **não tem portal**: um componente só desenha onde
// está na árvore.
//
// ⚠ **A saída óbvia seria fazer o `AureaProvider` desenhar a pilha, e ela está ERRADA.** Medido
// no `theme.tsx:158-160`: hoje o provider devolve **só contextos** — nenhum `View`. Pôr um `View`
// lá dentro mudaria o layout de **todo app que já usa a Aurea**, sem que nada acusasse: um
// contêiner novo entre a raiz e o primeiro filho é exatamente a mudança que quebra um `flex: 1`
// e aparece como "por que minha tela encolheu?" três dias depois. É a terceira vez que um lote
// mexeria na superfície de outro (o `Screen` já ganhou props no Lote 3); desta vez a resposta é
// não.
//
// Então a pilha tem um hospedeiro PRÓPRIO e EXPLÍCITO, que o app põe onde quer:
//
//     <AureaProvider>
//       <ToastHost>          {/* este é o `View` novo, e ele está à vista */}
//         <MinhaApp/>
//       </ToastHost>
//     </AureaProvider>
//
// O nome diz o que ele faz — hospeda. Quem não chama `useToast` não põe o `ToastHost`, não paga
// o `View`, e nada muda.
//
// ⚠ **E `useToast()` sem hospedeiro LEVANTA**, com a frase que diz o que fazer. Devolver um
// `add()` que não faz nada seria o defeito mais caro possível: o aviso de "salvo" que nunca
// aparece não quebra nada, não aparece em teste, e some no meio de um fluxo que parecia certo.
//
// ── AUSÊNCIA 2: NÃO HÁ `prefers-reduced-motion` ──────────────────────────────────────────────
//
// Mesma regra do Lote 2, e mesma armadilha: a entrada só anima quando `useReduceMotion()` devolve
// `false` — `null` (ainda lendo) trata-se como "não anime".
//
// ⚠ **Mas o TEMPO não é movimento, e a distinção importa:** com "remover animações" ligado o
// aviso ainda some sozinho depois de `duration`. Quem pediu menos movimento não pediu que o aviso
// ficasse na tela para sempre.
//
// ── O QUE FOI MEDIDO NA WEB, COM A LINHA ─────────────────────────────────────────────────────
//   .toast-stack   aurea.css:1586  fixo no canto de baixo, 22 de margem, min(360, 100vw-44), gap 10
//   .toast         :1586           linha, gap 11, padding 14, raio LG (não o de card), fundo
//                                  `popover`, sombra MD, transição .28s
//   .toast-text    :1586           coluna, gap 2
//   .toast-info/success/warning/danger :1595-1598  borda tingida + fundo semântico
//
// E o comentário do CSS (aurea.css:1587-1594) diz de onde veio o tingimento: **reusado do
// `.alert`/`.banner`, não inventado**. Aqui ele é reusado de novo — os mesmos pares
// `<x>Bg`/`<x>` que o `Alert` do Lote 2 usa (`feedback.tsx:60-63`).
import * as React from "react";
import {Animated, Easing, View, type StyleProp, type ViewStyle} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {IconButton} from "./actions.js";
import {criarFolha} from "./estilos.js";
import {Icon, type IconName} from "./icon.js";
import {ICONE_DA_VARIANTE, type AureaAlertVariant} from "./feedback.js";
import {useReduceMotion} from "./movimento.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

/** As mesmas quatro faces do `AureaToastType` da web (`system.tsx:65`). */
export type AureaToastType = AureaAlertVariant;

const folha = criarFolha((t: AureaTokens) => ({
  hospedeiro: {flex: 1},
  pilha: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    paddingHorizontal: 22, gap: 10,
    zIndex: t.size.zToast,
  },
  aviso: {
    flexDirection: "row", alignItems: "center", gap: 11, padding: 14,
    maxWidth: 360, width: "100%", alignSelf: "flex-end",
    borderWidth: t.size.borderWidth, borderColor: t.color.border,
    borderRadius: t.size.radiusLg,
    backgroundColor: t.color.popover,
    ...(t.shadow.shadowMd ? {boxShadow: [t.shadow.shadowMd]} : null),
  },
  texto: {flex: 1, minWidth: 0, gap: 2},
  aviso_info: {backgroundColor: t.color.infoBg, borderColor: t.color.info},
  aviso_success: {backgroundColor: t.color.successBg, borderColor: t.color.success},
  aviso_warning: {backgroundColor: t.color.warningBg, borderColor: t.color.warning},
  aviso_danger: {
    backgroundColor: t.color.dangerBg,
    borderColor: t.color.danger400 ?? t.color.destructive,
  },
}));

/** Quanto um aviso fica na tela sem `duration`. */
const DURACAO_PADRAO = 5000;
/** A entrada, nos mesmos `.28s` do `.toast` do CSS. */
const ENTRADA = 280;

export interface AureaToastInput {
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: AureaToastType;
  /**
   * Quanto tempo fica, em ms. **`0` nunca fecha sozinho**, e é o que um aviso com `action` tem de
   * usar: um botão que foge da mão em cinco segundos é um botão que não existe para quem lê
   * devagar, para quem usa leitor de tela, ou para quem só olhou para o lado.
   */
  duration?: number;
  /** Uma ação curta — "Desfazer". Ver o aviso sobre `duration` acima. */
  action?: React.ReactNode;
  /** Deixe de fora para não desenhar ícone nenhum; sem isto vem o do tipo. */
  icon?: IconName | false;
}

export interface AureaToast extends AureaToastInput {
  id: string;
}

export interface AureaToastManager {
  /** Põe um aviso na pilha e devolve o `id`, que serve para fechá-lo antes da hora. */
  add: (aviso: AureaToastInput) => string;
  /** Tira um aviso pelo `id`. Chamar com um `id` que já saiu não faz nada. */
  close: (id: string) => void;
  /** A pilha, do mais antigo para o mais novo. */
  toasts: readonly AureaToast[];
}

const Ctx = React.createContext<AureaToastManager | null>(null);

/**
 * O gerente de avisos. **Precisa de um `ToastHost` acima na árvore.**
 *
 * ⚠ Sem hospedeiro ele LEVANTA em vez de devolver um gerente mudo — ver o cabeçalho deste
 * arquivo. O aviso que não aparece é o defeito que ninguém descobre.
 */
export function useToast(): AureaToastManager {
  const v = React.useContext(Ctx);
  if (!v) {
    throw new Error(
      "useToast() precisa de um <ToastHost> acima na árvore. " +
      "Ponha <ToastHost> dentro do <AureaProvider>, envolvendo o app.",
    );
  }
  return v;
}

export interface ToastHostProps {
  children?: React.ReactNode;
  /** Quantos avisos cabem ao mesmo tempo. Passando disso, o mais ANTIGO sai. */
  max?: number;
  /** O padrão de `duration` para quem não passa um. */
  duration?: number;
  /**
   * Quanto subir a pilha. Use quando houver `BottomNav`: sem isto o aviso nasce em cima da barra
   * e tapa justamente o que a pessoa ia tocar.
   */
  offset?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Hospeda a pilha de avisos e o estado dela.
 *
 * ⚠ **Ele desenha um `View` com `flex: 1` em volta dos filhos** — é o preço de não haver portal
 * no React Native, e ele está dito aqui em vez de escondido no `AureaProvider`. Ponha-o o mais
 * alto que puder, dentro do provider.
 *
 * ⚠ **O respiro de baixo é `Math.max`, não soma** — mesma conta do `BottomNav` (Lote 3): a barra
 * de gestos e o nosso espaçamento ocupam o MESMO espaço, e somar os dois empurra o aviso para o
 * meio da tela.
 */
export function ToastHost({
  children, max = 3, duration = DURACAO_PADRAO, offset = 0, style, testID,
}: ToastHostProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const inset = useSafeAreaInsets();
  const [avisos, setAvisos] = React.useState<AureaToast[]>([]);
  const proximo = React.useRef(0);
  // Os relógios vivem numa `ref` porque fechar um aviso à mão tem de PARAR o dele — senão o
  // relógio dispara depois, sobre um `id` que já saiu, e no dia em que os `id` forem reusados ele
  // fecha o aviso errado.
  const relogios = React.useRef(new Map<string, ReturnType<typeof setTimeout>>()).current;

  const close = React.useCallback((id: string) => {
    const r = relogios.get(id);
    if (r) { clearTimeout(r); relogios.delete(id); }
    setAvisos((atual) => atual.filter((a) => a.id !== id));
  }, [relogios]);

  const add = React.useCallback((entrada: AureaToastInput) => {
    const id = `aurea-toast-${proximo.current++}`;
    const aviso: AureaToast = {...entrada, id};
    setAvisos((atual) => {
      const proxima = [...atual, aviso];
      // Corta pelo começo: o aviso mais NOVO é o que a pessoa está esperando ver.
      const excedentes = proxima.slice(0, Math.max(0, proxima.length - max));
      for (const e of excedentes) {
        const r = relogios.get(e.id);
        if (r) { clearTimeout(r); relogios.delete(e.id); }
      }
      return proxima.slice(-max);
    });
    const ms = entrada.duration ?? duration;
    if (ms > 0) relogios.set(id, setTimeout(() => close(id), ms));
    return id;
  }, [max, duration, close, relogios]);

  React.useEffect(() => () => {
    for (const r of relogios.values()) clearTimeout(r);
    relogios.clear();
  }, [relogios]);

  const gerente = React.useMemo<AureaToastManager>(
    () => ({add, close, toasts: avisos}), [add, close, avisos],
  );

  return (
    <Ctx.Provider value={gerente}>
      <View style={[s.hospedeiro, style]} testID={testID}>
        {children}
        {avisos.length > 0 ? (
          // `box-none` para o vão entre os avisos NÃO comer o toque: a pilha cobre a largura
          // toda, e sem isto ela viraria uma faixa morta no pé da tela.
          <View
            pointerEvents="box-none"
            style={[s.pilha, {paddingBottom: Math.max(22, inset.bottom) + offset}]}
            testID={testID ? `${testID}-pilha` : undefined}>
            {avisos.map((a) => <Toast key={a.id} toast={a} onClose={() => close(a.id)} />)}
          </View>
        ) : null}
      </View>
    </Ctx.Provider>
  );
}

/**
 * Um aviso da pilha. Exportado porque o hospedeiro o desenha e porque um teste precisa alcançá-lo
 * — não porque o app deva montá-lo à mão: quem cria aviso é o `useToast`.
 *
 * ⚠ **`danger` é `role="alert"`; o resto é `status`** — a mesma regra do `Alert` do Lote 2, e ela
 * vem do fonte da web, não do CSS. E no Android o papel sozinho não faz o leitor falar sem foco:
 * quem faz é a região viva.
 */
export function Toast({toast, onClose}: {toast: AureaToast; onClose: () => void}) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const reduzir = useReduceMotion();
  const entrada = React.useRef(new Animated.Value(0)).current;
  const tipo = toast.type ?? "info";

  React.useEffect(() => {
    if (reduzir !== false) { entrada.setValue(1); return; }
    const laco = Animated.timing(entrada, {
      toValue: 1, duration: ENTRADA, useNativeDriver: true,
      easing: Easing.bezier(...t.easing.easeEmphasized),
    });
    laco.start();
    return () => laco.stop();
  }, [reduzir, entrada, t.easing.easeEmphasized]);

  const corDoIcone = tipo === "success" ? t.color.success
    : tipo === "warning" ? t.color.warning
    : tipo === "danger" ? (t.color.danger400 ?? t.color.destructive)
    : t.color.info;

  const glifo = toast.icon === false ? null : (toast.icon ?? ICONE_DA_VARIANTE[tipo]);

  return (
    <Animated.View
      accessible
      // Mesma correção do `Alert` — ver o comentário longo em `feedback.tsx`. `status` NÃO é um
      // papel do RN, e usá-lo derruba o app com "Invalid accessibility role value".
      {...(tipo === "danger" ? {accessibilityRole: "alert"} : null)}
      accessibilityLiveRegion={tipo === "danger" ? "assertive" : "polite"}
      style={[
        s.aviso, s[`aviso_${tipo}`],
        // Os mesmos 12dp de baixo que o `.toast[data-starting-style]` da web usa.
        {opacity: entrada, transform: [{translateY: entrada.interpolate({
          inputRange: [0, 1], outputRange: [12, 0],
        })}]},
      ]}
      testID={`toast-${toast.id}`}>
      {glifo ? <Icon name={glifo} size="md" color={corDoIcone} /> : null}
      <View style={s.texto}>
        <Text size="sm" weight={600}>{toast.title}</Text>
        {toast.description != null
          ? (typeof toast.description === "string"
              ? <Text size="sm" tone="muted">{toast.description}</Text>
              : toast.description)
          : null}
      </View>
      {toast.action}
      <IconButton name="close" label={strings.dismissNotification} appearance="ghost" size="sm"
                  onPress={onClose} />
    </Animated.View>
  );
}
