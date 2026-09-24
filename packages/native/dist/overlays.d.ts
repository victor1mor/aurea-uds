import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
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
export declare function Dialog({ open, title, children, footer, onClose, scroll, style, testID, }: DialogProps): React.JSX.Element;
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
export declare function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, destructive, onConfirm, onCancel, testID, }: ConfirmDialogProps): React.JSX.Element;
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
export declare function Drawer({ open, title, children, onClose, side, scroll, style, testID, }: DrawerProps): React.JSX.Element;
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
export declare function BottomSheet({ open, title, children, onClose, grabber, draggable, scroll, style, testID, }: BottomSheetProps): React.JSX.Element;
