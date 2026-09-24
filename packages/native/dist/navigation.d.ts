import * as React from "react";
import { type ViewProps } from "react-native";
import { type IconName } from "./icon.js";
export interface AureaNavItem {
    id: string;
    label: React.ReactNode;
    icon?: IconName;
    /** O contador de não lidos. Número vira selo; `true` vira ponto. */
    badge?: number | boolean;
    onPress?: () => void;
    disabled?: boolean;
}
export type AureaBottomNavVariant = "floating" | "edge";
/** Quanto a pílula ocupa: a tela menos a margem (`full`, o de sempre) ou só as abas (`content`). */
export type AureaBottomNavWidth = "full" | "content";
export type AureaBottomNavIndicator = "none" | "subtle" | "pill" | "circle" | "circle-raised" | "circle-outline" | "circle-bold";
export interface BottomNavProps extends ViewProps {
    items: AureaNavItem[];
    /** O `id` do item corrente. */
    current?: string;
    variant?: AureaBottomNavVariant;
    indicator?: AureaBottomNavIndicator;
    /**
     * `content` põe a pílula do tamanho das abas, no centro, em vez de ir de uma borda à outra.
     * Vale só no `floating`: a `edge` encosta na borda e continua da largura da tela.
     */
    width?: AureaBottomNavWidth;
    /** Nome da barra para o leitor de tela. Sem ele, a frase do provider. */
    label?: string;
}
/**
 * A barra inferior — a pele da navegação, **não a navegação**.
 *
 * ```tsx
 * <BottomNav
 *   current={aba}
 *   items={[
 *     {id: "painel", label: "Painel", icon: "dashboard", onPress: () => ir("painel")},
 *     {id: "avisos", label: "Avisos", icon: "notification", badge: 8, onPress: () => ir("avisos")},
 *   ]} />
 * ```
 *
 * ⚠ **Ela respeita a área do sistema sozinha, e desde 19/09/2026 POR FORA da pílula.** No
 * `floating` a folga vira `marginBottom`: a borda de baixo fica exatamente `space4` acima do topo
 * da área do sistema, seja ela a faixa dos três botões do Android (≈48), a linha de gesto (≈16)
 * ou o indicador do iPhone. No `edge`, que encosta na borda, ela continua sendo recheio por
 * dentro — igual à web, onde `.bottom-nav-edge` faz exatamente isso.
 *
 * ⚠ **Não é `Tabs`, e isso é decisão registrada**, não esquecimento — ver o bloco acima.
 *
 * ── COMO MONTAR AS ABAS, com `expo-router` ou `react-navigation` ─────────────────────────────
 *
 * ```tsx
 * import {Tabs} from "expo-router";
 * import {BottomNav, BottomNavProvider} from "@aurea-uds/native";
 *
 * const ROTAS = [
 *   {name: "index",  titulo: "Início", icone: "home"},
 *   {name: "perfil", titulo: "Perfil", icone: "user"},
 * ];
 *
 * <BottomNavProvider>
 *   <Tabs
 *     screenOptions={{headerShown: false}}
 *     tabBar={({state, navigation}) => (
 *       <BottomNav
 *         label="Menu principal"
 *         current={state.routes[state.index].name}
 *         items={ROTAS.map((r) => ({
 *           id: r.name, label: r.titulo, icon: r.icone,
 *           onPress: () => navigation.navigate(r.name),
 *         }))} />
 *     )} />
 * </BottomNavProvider>
 * ```
 *
 * E as telas, sem conta nenhuma de respiro: `<Screen scroll edges={["top"]}>`.
 *
 * 🔴 **O `BottomNav` VAI SOLTO NO `tabBar`, SEM `View` EM VOLTA — e esta linha já mandou o
 * contrário.** Até a `0.8.7` a documentação aqui mandava embrulhar a barra num `View` pintado com
 * o fundo do tema, porque a barra ficava no FLUXO e o que aparecia atrás dela era a raiz do app,
 * que no Android é branca. O consumidor seguiu, e o resultado em aparelho foi uma **caixa cinza
 * em volta da pílula**: ela não flutuava, e a tela terminava acima dela.
 *
 * ✅ **Hoje o `floating` é `position: absolute`** — ele sai do fluxo e passa por cima da tela,
 * que volta a ocupar a altura inteira. Não há nada atrás da pílula para pintar, então **o
 * embrulho não é mais necessário e atrapalha**: ele é quem desenha a faixa.
 *
 * ⚠ **O `edge` continua no fluxo**, e para ELE o conselho antigo continua valendo: embrulhe os
 * dois num `View` com `flex: 1` e `backgroundColor: t.color.background`, senão sobra a faixa
 * branca do Android no pé da tela.
 *
 * ⚠ **E o sintoma engana.** Visto em foto no aparelho em 10/09/2026: com a faixa branca a barra
 * *parece* flutuando longe do pé, que é exatamente o sinal de que o respiro virou SOMA em vez de
 * `Math.max`. A conta estava certa; o branco é que empurrava a leitura. **Antes de acusar a
 * aritmética, pinte o fundo.**
 *
 * 🔴 **FLUTUAR TEM UM PREÇO, E A BIBLIOTECA É QUEM PAGA:** o fim da rolagem fica atrás da pílula.
 * É para isso que o `BottomNavProvider` existe — a barra mede a própria altura e conta para ele,
 * e o `Screen scroll` reserva o espaço sozinho. **O app não calcula nada.** Para uma tela que não
 * usa `Screen` (uma fileira de botões presa no pé, por exemplo), o número está em
 * `useBottomNavSpace()`. Fora de um provedor os dois valem zero, e nada muda.
 */
export declare function BottomNav({ items, current, variant, indicator, width, label, style, ...rest }: BottomNavProps): React.JSX.Element;
export type AureaTopbarVariant = "floating" | "flush" | "pill";
/** O recuo dos lados da `flush`: `bar` (20, o de sempre), `page` (16, o da `Screen`) ou `none`. */
export type AureaTopbarInset = "bar" | "page" | "none";
export interface TopbarProps extends ViewProps {
    variant?: AureaTopbarVariant;
    /**
     * Só na `flush` — R-02, 24/09/2026. Por padrão a barra recua 20 dos lados e a `Screen` recua 16,
     * então o título fica 4 para dentro do conteúdo. `page` alinha os dois; `none` serve para a
     * barra que já vai dentro de um conteúdo com recuo. As outras duas variantes são caixas com
     * margem própria e ignoram esta prop.
     */
    inset?: AureaTopbarInset;
    brand?: React.ReactNode;
    children?: React.ReactNode;
}
/**
 * A barra de cima.
 *
 * ⚠ **Ela NÃO gruda sozinha.** Na web o `.topbar` é `position: sticky`, que não existe no React
 * Native. Aqui a barra fica parada porque a TELA a põe fora do `ScrollView`:
 *
 * ```tsx
 * <Screen padded={false}>
 *   <Topbar brand={<Text weight={700}>Aurea</Text>} />
 *   <ScrollView>…</ScrollView>
 * </Screen>
 * ```
 *
 * ⚠ **E não é `banner`.** A ficha da web declara `role="banner"`, que é um *landmark* do HTML —
 * e **não há landmarks no RN**. Um papel inventado diria uma coisa errada; a barra fica sem papel,
 * e quem nomeia a tela é o conteúdo dela.
 */
export declare function Topbar({ variant, inset, brand, children, style, ...rest }: TopbarProps): React.JSX.Element;
export interface AureaNavListItem {
    id: string;
    label: React.ReactNode;
    description?: React.ReactNode;
    /** O valor à direita — um número, um estado, uma data. */
    value?: React.ReactNode;
    icon?: IconName;
    onPress?: () => void;
    disabled?: boolean;
}
export interface NavListProps extends ViewProps {
    items: AureaNavListItem[];
    /** O glifo de "isto abre", à direita. Registre-o, ou passe `false`. */
    chevron?: IconName | false;
}
/**
 * A lista de destinos DENTRO da página — a tela de ajustes, não a moldura do app.
 *
 * ⚠ **A distinção com o `BottomNav` decidiu o desenho, e a ficha da web a escreve:** aquele é
 * *chrome de aplicativo* e marca a seção corrente; este é *conteúdo*, e **não tem item corrente**
 * — não há o que estar "atual" numa lista em que se entra e da qual se volta. Por isso aqui não
 * existe `current`, e não é lacuna.
 *
 * ⚠ **Linha indisponível continua ALCANÇÁVEL pelo leitor de tela** (`accessibilityState.disabled`,
 * não sumir da árvore): quem usa leitor precisa descobrir que ela existe.
 */
export declare function NavList({ items, chevron, style, ...rest }: NavListProps): React.JSX.Element;
export type AureaStepState = "default" | "active" | "done" | "error";
export interface AureaStepItem {
    label: React.ReactNode;
    state?: AureaStepState;
    optional?: React.ReactNode;
    onPress?: () => void;
}
export interface StepperProps extends ViewProps {
    items: AureaStepItem[];
    label?: string;
    /** Glifos de `done` e `error`. Registre-os, ou o passo mostra o número. */
    doneIcon?: IconName | false;
    errorIcon?: IconName | false;
}
/**
 * A trilha de passos — o onboarding de 3 passos que o consumidor já tem.
 *
 * ⚠ **`aria-current="step"` não tem par no RN.** A web marca o passo ativo com ele; aqui o mais
 * próximo é `accessibilityState={{selected}}`, que é o que os leitores anunciam. Não é o mesmo
 * vocabulário — é o vocabulário que existe, e dizer isso é melhor que fingir paridade.
 */
export declare function Stepper({ items, label, doneIcon, errorIcon, style, ...rest }: StepperProps): React.JSX.Element;
export interface AureaTabItem {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
}
export interface TabsProps extends ViewProps {
    tabs: AureaTabItem[];
    /** O `id` da aba aberta. Controlado — quem guarda o estado é o consumidor, como na web. */
    value: string;
    onChange?: (id: string) => void;
    /** Nome da fila de abas para o leitor de tela. */
    label?: string;
}
/**
 * As abas DENTRO da tela — trocar o painel, não trocar de página.
 *
 * ⚠ **E essa frase é a fronteira com o `BottomNav`, que o Lote 3 quase errou ao contrário.** Lá
 * a ficha da web proíbe `tab` com a razão pronta — *"a tab swaps a panel inside the page, a
 * bottom bar changes page"* —, e há um teste cujo único trabalho é reprovar essa palavra na barra
 * de baixo. **Aqui é o caso certo**, então `tablist`/`tab` são os papéis honestos.
 * Medido antes de escrever: os dois estão no tipo do RN **e** no enum Kotlin
 * (`ReactAccessibilityDelegate.kt:368,370`), que é a interseção que o `check 41` cobra.
 *
 * ⚠ **A fila ROLA na horizontal, e a web não rola — divergência deliberada, com fonte.** A
 * referência máxima de desenho deste projeto tem estados de rolagem na lista de abas
 * (`left-scroll`, `right-scroll`, `left-right-scroll` no inventário), e num telefone de 360dp
 * quatro rótulos já não cabem. Espremer todas seria a outra saída, e ela apaga o rótulo — que é
 * o defeito que o app mediu no `SegmentedControl`. **A cápsula, o respiro e o raio continuam
 * sendo os do CSS**; o que muda é o transbordo.
 *
 * ⚠ **O painel inativo NÃO fica montado.** Na web o motor mantém os painéis no DOM e esconde;
 * aqui montar todos custaria memória e um painel com lista longa pagaria por telas que ninguém
 * está vendo. **A consequência está declarada e não é neutra:** o estado interno de um painel
 * (rolagem, texto digitado) **se perde** ao trocar de aba. Quem precisar do contrário guarda o
 * estado fora, como já faz com `value`.
 *
 * ⚠ **A aba escolhida NÃO usa a cor da marca, e isso é de propósito.** O `.tab.active` da web é
 * `--foreground` sobre `--secondary`, e ele **desliga o fio amarelo**
 * (`aurea.css:1128`, `:after { display:none }`) que o `.segmented` recebe. São dois sinais
 * diferentes para duas coisas diferentes: escolher um valor é uma coisa, trocar de painel é
 * outra. **Não "harmonize" isto com o `SegmentedControl`** — a diferença foi escrita à mão lá.
 *
 * ⚠ **Sem orientação VERTICAL.** A web tem (`aurea.css:1122-1126`), e ela resolve um problema de
 * largura de tela grande. Não há tablet medido neste projeto, e no nativo vale demanda antes de
 * cobertura — a mesma decisão da `Table` do Lote 6.
 */
export declare function Tabs({ tabs, value, onChange, label, style, ...rest }: TabsProps): React.JSX.Element;
