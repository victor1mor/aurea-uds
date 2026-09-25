// Aurea nativo — a categoria **Overlays**: `Dialog`, `ConfirmDialog`, `Drawer` e `BottomSheet`.
//
// Lote 5 do `NATIVE.md` §5.5 — *confirmar e avisar*. Os três primeiros são Base UI na web
// (medido no `dependencies.engine` das fichas, e desta vez o documento estava CERTO); o quarto
// não existe na web e nasce aqui.
//
// ── O ACHADO QUE MUDOU ESTE LOTE, E ELE É SOBRE ACESSIBILIDADE ───────────────────────────────
//
// O React Native ACEITA `role="dialog"` e `role="alertdialog"`. Compila, passa o TypeScript,
// atravessa o C++ do Fabric — e **não faz nada em nenhuma das duas plataformas.** Medido em
// 08/09/2026, nas duas pontas, no fonte do `react-native@0.87.1`:
//
//   Android  ReactAccessibilityDelegate.kt:515 `fromRole()`  ->  `else -> null`
//            com o comentário do próprio RN: "No mapping from ARIA role to AccessibilityRole"
//   iOS      RCTViewComponentView.mm:1512 usa a string de `role` só para desempatar
//            "checkbox" e "radio" no `accessibilityValue`; a lista de traits
//            (accessibilityPropsConversions.h:24-104) **não tem** dialog nem alertdialog
//
// ⚠ **Isto é PIOR do que o papel não existir, e é a diferença que importa.** O Lote 3 escreveu
// que `role="banner"` e `role="navigation"` *"não existem"*; medido agora, eles existem — no
// TIPO. O que não existe é o mapeamento. Um componente que os usasse passaria na revisão de
// código, passaria no `tsc`, passaria em qualquer teste que perguntasse "a prop está lá?", e
// seria **inútil no aparelho**. A conclusão do Lote 3 estava certa; a razão que ela deu, não.
//
// **O que fazemos em vez disso**, e cada peça é uma tradução medida, não uma aproximação:
//
//   a web                          |  aqui
//   -------------------------------|--------------------------------------------------------
//   `role="dialog"` + foco preso   |  o `Modal` do RN — ele é uma JANELA do sistema, e o leitor
//                                  |  de tela já se limita à janela de cima. O confinamento vem
//                                  |  do motor, não de uma prop
//   `Escape` fecha                 |  `onRequestClose` — o BOTÃO VOLTAR do Android. É a mesma
//                                  |  ideia (a saída que a plataforma já oferece), e sem ele a
//                                  |  caixa fica PRESA: o RN documenta a prop como obrigatória
//   `aria-labelledby` no título    |  o título é um `Text` com `accessibilityRole="header"`, que
//                                  |  é o único papel desta família que o Android mapeia
//   `aria-describedby`             |  não há. A frase é lida por estar na ordem de leitura, e é
//                                  |  por isso que ela vem ANTES dos botões na árvore
//   `backdrop-filter: blur(5px)`   |  **não atravessa.** Não há filtro de fundo no RN, e o que
//                                  |  existe (`expo-blur`) é dependência nova. O `--overlay` já
//                                  |  é preto a 74% de alfa e carrega a separação sozinho
//
// ── O QUE FOI MEDIDO NA WEB, COM A LINHA ─────────────────────────────────────────────────────
//   .dialog-backdrop   aurea.css:1574  overlay + blur(5px)
//   .dialog            :1575           min(560, 100vw-40), maxH 100vh-40, padding 24, raio CARD,
//                                      fundo `popover`, borda, sombra LG
//   .dialog>header     :1576           linha, alinhado ao topo, space-between, gap 16, mb 16
//   .dialog-body       :1576           coluna, gap 14
//   .dialog-confirm    :1581           min(420, …) — mais estreito, e é a ÚNICA diferença de pele
//   .dialog-confirm>footer :1582       fim, gap space-2, margem-topo space-5
//   .drawer            :1585           min(480, 92vw), padding 24, fundo `surface-1`, sombra LG
//   .drawer-right/left :1585           borda no lado de dentro
//
// E o comentário do `.dialog-confirm` (aurea.css:1577-1579) decidiu uma coisa por nós: **o
// ConfirmDialog é o MESMO `.dialog`**, não uma segunda superfície. Aqui isso vira literalmente a
// mesma função interna com uma largura diferente.
import * as React from "react";
import {
  Animated, Easing, Modal, PanResponder, Pressable, ScrollView, View,
  type StyleProp, type ViewStyle,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Button} from "./actions.js";
import {criarFolha} from "./estilos.js";
import {IconButton} from "./actions.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens, ForaDaMarca} from "./theme.js";
import {useReduceMotion} from "./movimento.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  fundo: {flex: 1, backgroundColor: t.color.overlay},
  // 🔴 O FUNDO TOCÁVEL VIROU IRMÃO, NÃO ANCESTRAL — 10/09/2026, e a razão está no bloco
  // `naoAtravessa` abaixo. Absoluto e transparente: a cor continua no `fundo`, que é o
  // contêiner; este só recebe o toque de fora do painel.
  fundoDeToque: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
  centro: {flex: 1, alignItems: "center", justifyContent: "center", padding: 20},
  superficie: {
    width: "100%", maxWidth: 560, padding: 24,
    borderWidth: t.size.borderWidth, borderColor: t.color.border,
    borderRadius: t.size.radiusCard,
    backgroundColor: t.color.popover,
    ...(t.shadow.shadowLg ? {boxShadow: [t.shadow.shadowLg]} : null),
  },
  confirmar: {maxWidth: 420},
  cabecalho: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    gap: 16, marginBottom: 16,
  },
  titulo: {flex: 1},
  corpo: {gap: 14},
  rodape: {
    flexDirection: "row", justifyContent: "flex-end", gap: t.size.space2,
    marginTop: t.size.space5,
  },
  gaveta: {
    position: "absolute", top: 0, bottom: 0, width: "92%", maxWidth: 480, padding: 24,
    backgroundColor: t.color.surface1,
    ...(t.shadow.shadowLg ? {boxShadow: [t.shadow.shadowLg]} : null),
  },
  gavetaDireita: {right: 0, borderLeftWidth: t.size.borderWidth, borderLeftColor: t.color.border},
  gavetaEsquerda: {left: 0, borderRightWidth: t.size.borderWidth, borderRightColor: t.color.border},
  folhaBaixo: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    maxHeight: "90%",
    paddingHorizontal: 24, paddingTop: t.size.space2, paddingBottom: 24,
    backgroundColor: t.color.popover,
    borderTopLeftRadius: t.size.radiusCard, borderTopRightRadius: t.size.radiusCard,
    borderTopWidth: t.size.borderWidth, borderTopColor: t.color.border,
    ...(t.shadow.shadowLg ? {boxShadow: [t.shadow.shadowLg]} : null),
  },
  puxadorArea: {alignItems: "center", paddingVertical: t.size.space2},
  puxador: {width: 40, height: 4, borderRadius: 999, backgroundColor: t.color.borderStrong},
}));

/** Duração da entrada de painel, em ms. A mesma `.28s` do `.toast` do CSS (aurea.css:1586). */
const DURACAO = 280;

// 🔴 TOCAR NO CORPO DA CAIXA A FECHAVA — e este comentário registra DUAS tentativas, porque a
// primeira parecia certa e o aparelho a desmentiu.
//
// A forma antiga punha o painel DENTRO do `Pressable` do fundo, e usava
// `onStartShouldSetResponder` no painel para "reivindicar o toque". Isso passou em teste
// unitário, foi commitado em 09/09/2026 como conserto, e **o Victor reportou o defeito
// intacto no vidro em 10/09** — tocar no corpo da folha do `Select` fechava, igual a tocar
// fora. O dublê aceitou; o Android não.
//
// A RAZÃO, lida na estrutura: o painel tem um `ScrollView` dentro (`Corpo` quando `scroll`, e
// no `Select` sempre). O `ScrollView` PRECISA reivindicar o toque para rolar, e a negociação
// do responder pergunta ao mais profundo primeiro — então quem decide é ele, e o
// `onStartShouldSetResponder` do painel nunca é consultado. Um manipulador não vence um
// componente cujo trabalho é ganhar essa disputa.
//
// ✅ O CONSERTO DE VERDADE É ESTRUTURAL, e não depende de negociação nenhuma: **o fundo tocável
// deixou de ser ancestral do painel.** Ele agora é um irmão absoluto, desenhado ANTES (logo,
// atrás). Um toque no painel não tem o fundo na sua cadeia de ancestrais, então não existe
// propagação para cancelar. A cor do véu fica no contêiner, que não recebe toque.
//
// ⚠ **E ISTO NÃO ESTÁ MEDIDO EM APARELHO** — está garantido por construção, que é uma
// afirmação mais forte que "passou no teste", mas não é o vidro. Foi exatamente confiar em
// "passou no teste" que produziu a primeira tentativa.
//
// ~~O `naoAtravessa` FICA no painel como segunda linha: agora é redundante, e redundância que
// não custa nada num caminho que já falhou uma vez se paga.~~ — **E4, 25/09/2026: ela CUSTAVA.**
// No Android, um `View` que vira dono do toque pelo JavaScript passa a interceptar os movimentos
// seguintes (`JSResponderHandler.onInterceptTouchEvent`), e o `ScrollView` de dentro deixa de
// rolar. O app viu a lista do `Select` e a do `Combobox` sem rolar; a suspeita não está confirmada
// no aparelho, mas a linha era redundante por construção e saiu dos painéis que têm rolagem dentro
// (`Dialog`, `Drawer`, `Select`, `Combobox`). Fica no `ConfirmDialog` (sem fundo tocável e sem
// rolagem) e no `BottomSheet`, onde os `panHandlers` do arrasto já a sobrescrevem.
//
// ⚠ Vale para os QUATRO que têm esta forma: `Dialog`, `Drawer`, `BottomSheet` e o `Select` do
// Lote 4 (`inputs.tsx`). O `ConfirmDialog` é imune desde que nasceu — o fundo dele não tem
// `onPress`, e é uma palavra de diferença, de propósito.
const naoAtravessa = {onStartShouldSetResponder: () => true} as const;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Dialog
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface DialogProps {
  /**
   * Controlado, SEMPRE — mesmo contrato da web. A caixa nunca se fecha sozinha: ela pede, por
   * `onClose`, e quem decide é você. Duas fontes para um estado é como um diálogo trava aberto.
   */
  open: boolean;
  /** O nome acessível e o `<h2>` da web. Obrigatório: caixa sem nome anuncia só "janela". */
  title: React.ReactNode;
  children?: React.ReactNode;
  /** A linha de ações. Sem ela o rodapé não é desenhado — não é desenhado vazio. */
  footer?: React.ReactNode;
  /** Chamado pelo botão VOLTAR do Android, pelo fundo e pelo botão de fechar. Uma saída para os três. */
  onClose: () => void;
  /** O corpo rola. Desligue quando o conteúdo já rola por conta própria. */
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A caixa que interrompe para uma tarefa focada.
 *
 * ⚠ **O `Modal` do RN é o motor, e ele dá de graça o que a web precisa de biblioteca para ter:**
 * ele abre uma JANELA do sistema, e tanto o TalkBack quanto o VoiceOver limitam a leitura à
 * janela de cima. É o confinamento de foco — só que vindo do sistema operacional, não de um
 * laço de `Tab` em JavaScript.
 *
 * ⚠ **`onRequestClose` NÃO é opcional**, e o próprio RN documenta assim (*"This is required on
 * iOS and Android"*, `Modal.d.ts:36`). Sem ele o botão voltar do Android não faz nada e a caixa
 * fica presa — o equivalente exato de um diálogo web que ignora `Escape`.
 */
export function Dialog({
  open, title, children, footer, onClose, scroll = true, style, testID,
}: DialogProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const Corpo = scroll ? ScrollView : View;
  return (
    <ForaDaMarca>
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent
           navigationBarTranslucent onRequestClose={onClose} testID={testID}>
      <View style={[s.fundo, s.centro]}>
        <Pressable style={s.fundoDeToque} onPress={onClose} accessible={false}
                   testID={testID ? `${testID}-fundo` : undefined} />
        <View style={[s.superficie, style]}>
          <View style={s.cabecalho}>
            <Text size="lg" weight={600} accessibilityRole="header" style={s.titulo}>{title}</Text>
            <IconButton name="close" label={strings.close} appearance="ghost" size="sm"
                        onPress={onClose} />
          </View>
          <Corpo {...(scroll ? {contentContainerStyle: s.corpo} : {style: s.corpo})}>
            {children}
          </Corpo>
          {footer ? <View style={s.rodape}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
    </ForaDaMarca>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// ConfirmDialog
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  open: boolean;
  /** A pergunta nas palavras do que está em jogo — "Apagar este lançamento?", não "Tem certeza?". */
  title: React.ReactNode;
  /** OBRIGATÓRIA. Diga o que se perde e se volta. Vem ANTES dos botões na ordem de leitura. */
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Deixa o botão de confirmar em `danger`. Só quando a ação DESTRÓI dado. */
  destructive?: boolean;
  onConfirm: () => void;
  /** Dispara no botão de cancelar e no botão VOLTAR. O toque fora **não** chega aqui. */
  onCancel: () => void;
  testID?: string;
}

/**
 * A decisão que não se desfaz.
 *
 * ⚠ **NÃO é um `Dialog` com dois botões** — a diferença é de COMPORTAMENTO, e ela sobreviveu
 * inteira à travessia: **tocar fora NÃO fecha.** Na web isso vem do `disablePointerDismissal` do
 * Base UI; aqui vem de o fundo simplesmente não ter `onPress`. O acidente que o componente
 * existe para impedir é o mesmo nos dois lados: um toque fora virar "cancelei" sem ninguém ter
 * decidido.
 *
 * ⚠ **O que NÃO atravessou, e é honesto dizer:** na web o foco nasce no botão SEGURO, porque
 * quem abre um "isto apaga" e aperta Enter por reflexo tem de cancelar. **No toque não há esse
 * reflexo** — não há foco de teclado nem Enter. Mover o foco do LEITOR DE TELA para o Cancelar
 * seria traduzir o mecanismo e perder a intenção: ele pularia a frase que diz o que se perde,
 * que é justamente o que a pessoa precisa ouvir. Então o foco não é movido, e o que sobra da
 * garantia é o que de fato vale aqui: o fundo não fecha, e a ORDEM é cancelar → confirmar.
 *
 * A ordem é a mesma da web e pela mesma razão medida lá (quatro referências convergem): quem lê
 * com o dedo encontra a saída antes da ação.
 *
 * ⚠ **O papel `alertdialog` não existe no aparelho** — ver o cabeçalho deste arquivo. O que
 * separa esta caixa de um `Dialog` para quem não vê é o texto, não um atributo.
 */
export function ConfirmDialog({
  open, title, description, confirmLabel, cancelLabel, destructive, onConfirm, onCancel, testID,
}: ConfirmDialogProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  return (
    <ForaDaMarca>
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent
           navigationBarTranslucent onRequestClose={onCancel} testID={testID}>
      {/* Um `View`, não um `Pressable`: é aqui, e em uma palavra, que mora a diferença de
          comportamento em relação ao `Dialog`. */}
      <View style={[s.fundo, s.centro]}>
        <View {...naoAtravessa} style={[s.superficie, s.confirmar]}>
          <View style={s.cabecalho}>
            <Text size="lg" weight={600} accessibilityRole="header" style={s.titulo}>{title}</Text>
          </View>
          <View style={s.corpo}>
            {typeof description === "string"
              ? <Text size="md" tone="muted">{description}</Text>
              : description}
          </View>
          <View style={s.rodape}>
            <Button appearance="outline" onPress={onCancel}
                    testID={testID ? `${testID}-cancelar` : undefined}>
              {cancelLabel ?? strings.confirmCancel}
            </Button>
            <Button appearance="solid" tone={destructive ? "danger" : "brand"} onPress={onConfirm}
                    testID={testID ? `${testID}-confirmar` : undefined}>
              {confirmLabel ?? strings.confirmProceed}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
    </ForaDaMarca>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Drawer
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaDrawerSide = "left" | "right";

export interface DrawerProps {
  open: boolean;
  title: React.ReactNode;
  children?: React.ReactNode;
  onClose: () => void;
  /**
   * De qual borda ele entra. É um lado FÍSICO, não lógico — a ficha da web decide isso e a razão
   * atravessa inteira: um painel preso à direção da escrita se mudaria de lado ao trocar o
   * idioma, e um painel de navegação não deve andar.
   */
  side?: AureaDrawerSide;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * O painel que entra pela borda.
 *
 * ⚠ **A animação é nossa, e a do `Modal` fica desligada.** O `animationType="slide"` do RN sobe
 * de BAIXO, sempre — não há variante lateral. Então o `Modal` entra com `none` e quem desliza é
 * um `Animated.View` em `translateX`, que é também o que deixa o lado ser escolhido.
 *
 * ⚠ **Ele respeita "remover animações"**: com a preferência ligada o painel aparece no lugar, em
 * vez de deslizar. É a mesma regra do `Spinner` e do `Skeleton` (Lote 2) — no RN não existe a
 * cascata de `prefers-reduced-motion` que a web ganha de graça.
 */
export function Drawer({
  open, title, children, onClose, side = "right", scroll = true, style, testID,
}: DrawerProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const reduzir = useReduceMotion();
  const progresso = React.useRef(new Animated.Value(0)).current;
  const Corpo = scroll ? ScrollView : View;

  React.useEffect(() => {
    if (!open) { progresso.setValue(0); return; }
    // `reduzir !== false` e não `reduzir === true`: enquanto a leitura não voltou (`null`), o
    // silêncio é o certo. Animar no escuro é tocar um quadro na cara de quem pediu que não.
    if (reduzir !== false) { progresso.setValue(1); return; }
    const laco = Animated.timing(progresso, {
      toValue: 1, duration: DURACAO, useNativeDriver: true,
      easing: Easing.bezier(...t.easing.easeEmphasized),
    });
    laco.start();
    return () => laco.stop();
  }, [open, reduzir, progresso, t.easing.easeEmphasized]);

  const desloca = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [side === "right" ? 480 : -480, 0],
  });

  return (
    <ForaDaMarca>
    <Modal visible={open} transparent animationType="none" statusBarTranslucent
           navigationBarTranslucent onRequestClose={onClose} testID={testID}>
      <View style={s.fundo}>
        <Pressable style={s.fundoDeToque} onPress={onClose} accessible={false}
                   testID={testID ? `${testID}-fundo` : undefined} />
        <Animated.View
          style={[
            s.gaveta, side === "right" ? s.gavetaDireita : s.gavetaEsquerda,
            {transform: [{translateX: desloca}]}, style,
          ]}>
          <View style={s.cabecalho}>
            <Text size="lg" weight={600} accessibilityRole="header" style={s.titulo}>{title}</Text>
            <IconButton name="close" label={strings.close} appearance="ghost" size="sm"
                        onPress={onClose} />
          </View>
          <Corpo {...(scroll ? {contentContainerStyle: s.corpo} : {style: s.corpo})}>
            {children}
          </Corpo>
        </Animated.View>
      </View>
    </Modal>
    </ForaDaMarca>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// BottomSheet
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface BottomSheetProps {
  open: boolean;
  /** O nome. Opcional aqui, e só aqui: uma folha de opções curta às vezes não tem título na tela. */
  title?: React.ReactNode;
  children?: React.ReactNode;
  onClose: () => void;
  /** Mostra o puxador. Desligue quando `arrastavel` estiver desligado — ele prometeria um gesto que não existe. */
  grabber?: boolean;
  /** Arrastar para baixo fecha. Ligado; desligue quando o conteúdo rolar na horizontal. */
  draggable?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A folha que sobe de baixo. **NÃO existe na web** — é o único componente deste lote sem ficha.
 *
 * ⚠ **Ela é a resposta ao mesmo problema que a web resolve com a caixa centralizada, e a resposta
 * é diferente porque a mão é diferente:** num telefone segurado numa mão só, o alto da tela é o
 * lugar mais difícil de alcançar. Uma caixa centralizada põe as escolhas exatamente lá. A folha
 * de baixo põe onde o polegar está.
 *
 * ⚠ **O arrastar é `PanResponder`, que é do próprio React Native — não é dependência nova.** Foi
 * a escolha deliberada contra `@gorhom/bottom-sheet`, que é a biblioteca conhecida do assunto:
 * ela arrasta junto `react-native-gesture-handler` e `react-native-reanimated`, **duas** peças
 * novas, para um gesto de um eixo. O `BUILDING.md` §3 manda parar o lote por dependência nova, e
 * parar o lote por isto seria caro por nada.
 *
 * **O que a escolha compra e o que ela custa, dito em vez de escondido:** compra zero dependência
 * e um componente que roda no Expo Go. Custa o gesto rodar na ponte de JS, não na thread de UI —
 * numa lista longa dentro da folha, arrastar pode engasgar. Se isso aparecer em aparelho, a
 * troca é uma ADR, não um remendo.
 *
 * ⚠ **Soltar no meio do caminho volta**, não fecha: só passa do limiar quem arrastou mais de um
 * terço da altura da folha. Fechar cedo demais é como um gesto de fechar vira perda de dado.
 */
export function BottomSheet({
  open, title, children, onClose, grabber = true, draggable = true, scroll = true, style, testID,
}: BottomSheetProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const reduzir = useReduceMotion();
  const arrasto = React.useRef(new Animated.Value(0)).current;
  const altura = React.useRef(0);
  const Corpo = scroll ? ScrollView : View;

  React.useEffect(() => { if (!open) arrasto.setValue(0); }, [open, arrasto]);

  const gestos = React.useMemo(
    () =>
      PanResponder.create({
        // Só reivindica o gesto DEPOIS de 6dp para baixo. Reivindicar no toque roubaria o
        // primeiro toque de todo botão dentro da folha.
        onMoveShouldSetPanResponder: (_e, g) => draggable && g.dy > 6,
        onPanResponderMove: (_e, g) => { if (g.dy > 0) arrasto.setValue(g.dy); },
        onPanResponderRelease: (_e, g) => {
          const limiar = Math.max(80, altura.current / 3);
          if (g.dy > limiar || g.vy > 1.2) { onClose(); return; }
          if (reduzir !== false) { arrasto.setValue(0); return; }
          Animated.timing(arrasto, {
            toValue: 0, duration: DURACAO, useNativeDriver: true,
            easing: Easing.bezier(...t.easing.easeEmphasized),
          }).start();
        },
      }),
    [draggable, onClose, arrasto, reduzir, t.easing.easeEmphasized],
  );

  return (
    <ForaDaMarca>
    <Modal visible={open} transparent animationType={reduzir !== false ? "none" : "slide"}
           statusBarTranslucent navigationBarTranslucent onRequestClose={onClose} testID={testID}>
      <View style={s.fundo}>
        <Pressable style={s.fundoDeToque} onPress={onClose} accessible={false}
                   testID={testID ? `${testID}-fundo` : undefined} />
        <Animated.View
          {...naoAtravessa}
          {...gestos.panHandlers}
          onLayout={(e) => { altura.current = e.nativeEvent.layout.height; }}
          style={[s.folhaBaixo, {transform: [{translateY: arrasto}]}, style]}>
          {grabber ? (
            // Sem papel e sem nome: o puxador é decoração de uma superfície que já é alcançável
            // por outros caminhos. Anunciá-lo poria um "botão" sem ação na varredura do leitor.
            <View style={s.puxadorArea} accessible={false} importantForAccessibility="no-hide-descendants">
              <View style={s.puxador} />
            </View>
          ) : null}
          {title ? (
            <View style={s.cabecalho}>
              <Text size="lg" weight={600} accessibilityRole="header" style={s.titulo}>{title}</Text>
            </View>
          ) : null}
          <Corpo {...(scroll ? {contentContainerStyle: s.corpo} : {style: s.corpo})}>
            {children}
          </Corpo>
          {/* E4: o recuo da barra de botões do Android — o mesmo `SafeAreaView` do `Select` e do
              `Combobox`, que recua só o que a folha fica de fato atrás dela. */}
          <SafeAreaView edges={["bottom"]} />
        </Animated.View>
      </View>
    </Modal>
    </ForaDaMarca>
  );
}
