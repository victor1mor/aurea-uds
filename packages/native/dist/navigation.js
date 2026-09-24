import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAnotarBottomNav } from "./barranav.js";
import { Badge } from "./display.js";
import { comOpacidade, criarFolha } from "./estilos.js";
import { Icon } from "./icon.js";
import { Card } from "./layout.js";
import { FilaRolante } from "./rolagem.js";
import { Text } from "./text.js";
import { useAureaStrings, useAureaTokens } from "./theme.js";
const folha = criarFolha((t) => ({
    // ── Topbar ─────────────────────────────────────────────────────────────────────────────────
    // ⚠ Sem `position: sticky` — ele não existe no React Native. Na web o `.topbar` gruda no topo
    // da rolagem; aqui uma barra que fica parada é uma barra FORA do `ScrollView`, e quem monta
    // isso é a tela. Não é omissão: é a composição correta na plataforma.
    topo: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        gap: t.size.space4, minHeight: t.size.topbarHeight,
    },
    topo_floating: {
        marginHorizontal: t.size.space4, marginTop: t.size.space4,
        paddingVertical: t.size.space2, paddingHorizontal: t.size.space4,
        borderWidth: t.size.borderWidth, borderColor: t.color.border,
        borderRadius: t.size.radiusCard, backgroundColor: t.color.card,
    },
    topo_flush: { paddingVertical: t.size.space2, paddingHorizontal: t.size.space5,
        backgroundColor: t.color.background },
    // `inset` (R-02, 24/09/2026): o recuo dos lados da `flush`. `page` é o mesmo `space4` do
    // `respiro` da `Screen` (`screen.tsx`), para o título alinhar com o conteúdo embaixo; `none` é
    // para a barra que já vai dentro de um conteúdo com recuo próprio.
    topo_recuo_page: { paddingHorizontal: t.size.space4 },
    topo_recuo_none: { paddingHorizontal: 0 },
    topo_pill: {
        alignSelf: "center", marginTop: t.size.space4, justifyContent: "flex-start",
        gap: t.size.space2, padding: t.size.space2,
        borderWidth: t.size.borderWidth, borderColor: t.color.border,
        borderRadius: t.size.radiusControl, backgroundColor: t.color.card,
    },
    // ── BottomNav ──────────────────────────────────────────────────────────────────────────────
    // 🔴 `floating` FLUTUA POR CIMA DA TELA, e isto é conserto de 19/09/2026 — a variante prometia
    // isso no nome e não fazia. `position: absolute` a tira do fluxo: a tela passa a ocupar a altura
    // inteira e rola POR BAIXO da pílula. É o mesmo que a web faz desde sempre com
    // `position: sticky; bottom: 0` (`aurea.css:270`) — a divergência era só deste lado.
    //
    // ⚠ **As margens são o que deixa o toque passar.** Com `left/right/bottom: 0` e `margin`, a
    // caixa deste `View` É a pílula: o que sobra em volta não pertence a ela, e o dedo encontra a
    // tela de baixo. Se a barra fosse uma faixa de largura cheia com a pílula centralizada dentro,
    // a faixa comeria o toque em silêncio.
    //
    // `zSticky` é token (20), o mesmo `--z-sticky` que a web usa na mesma peça.
    barra: {
        position: "absolute", bottom: 0, zIndex: t.size.zSticky,
        flexDirection: "row", gap: t.size.space1, margin: t.size.space4, padding: t.size.space1,
        borderWidth: t.size.borderWidth, borderColor: t.color.border,
        borderRadius: t.size.radiusControl, backgroundColor: t.color.card,
        boxShadow: [t.shadow.shadowMd],
    },
    // `edge` encosta na borda: sem margem, sem raio, só a linha de cima — e continua NO FLUXO,
    // porque uma barra encostada que flutuasse esconderia o fim da tela sem nada reservar.
    barra_edge: {
        position: "relative", left: undefined, right: undefined, bottom: undefined, zIndex: undefined,
        margin: 0, paddingHorizontal: 0, borderRadius: 0, backgroundColor: t.color.background,
        borderWidth: 0, borderTopWidth: t.size.borderWidth, boxShadow: undefined,
    },
    // A pílula CHEIA, de uma borda à outra menos a margem — o de sempre. Mora fora da `barra` para
    // o `content` nunca precisar DESFAZER estes dois (ver abaixo).
    barra_cheia: { left: 0, right: 0 },
    // 🔴 `width="content"` — R-08, 24/09/2026: *"ficou super largo"*. A pílula deixa de ir de uma
    // borda à outra e fica do tamanho das abas, no centro. Nenhuma conta nossa: medido no Yoga do
    // `react-native@0.87.1`, uma peça `absolute` SEM `left`/`right` se mede pelo conteúdo, limitada
    // à largura do pai (`AbsoluteLayout.cpp`, o ramo `FitContent` de `layoutAbsoluteChild`), e é
    // posicionada pelo `alignSelf` (`alignAbsoluteChild`, o caso `Align::Center`).
    // ⚠ **Por isso `left/right` NÃO podem existir aqui**, e a forma importa: escrever
    // `left: undefined` por cima de um `left: 0` apaga na montagem, mas NÃO numa atualização — o
    // `restoreDeletedValuesInNestedArray` do `ReactNativeAttributePayload.js` pula `undefined` e
    // devolve o valor do item anterior. Trocar `width` com a tela aberta deixaria a pílula cheia.
    barra_content: { alignSelf: "center" },
    aba: {
        flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center",
        gap: t.size.space1, minHeight: t.size.controlHLg, padding: t.size.space1,
        borderRadius: t.size.radiusControl,
    },
    // Com a pílula do tamanho do conteúdo, `flex: 1` MATA as abas: no RN ele é base ZERO, e a soma
    // de zeros é uma pílula de largura zero. Aqui cada aba mede o próprio conteúdo (base `auto`) e
    // só encolhe se não couber. O mínimo é o alvo de toque da própria aba, `controlHLg`, para uma
    // aba de rótulo curto não virar um alvo mais estreito que alto; e o respiro dos lados é o
    // `space3` que o `.bottom-nav-content` da web usa na mesma peça.
    aba_content: {
        flexGrow: 0, flexShrink: 1, flexBasis: "auto",
        minWidth: t.size.controlHLg, paddingHorizontal: t.size.space3,
    },
    // A CAIXA QUE ANCORA O CONTADOR, e ela existe por um defeito visto em tela: pendurado no ITEM,
    // o número cai no meio do RÓTULO. O `navigation-client.tsx:336` conta a história inteira — o
    // Victor viu o contador cobrir o nome em 17/08/2026, e a pesquisa (Material 3 e os guias de
    // barra de abas do iOS) diz o mesmo: canto superior do ÍCONE, nunca sobre o texto.
    marca: { position: "relative", alignItems: "center", justifyContent: "center",
        width: 32, height: 32, borderRadius: t.size.radiusControl },
    marcaRedonda: { borderRadius: t.size.radiusFull },
    contador: { position: "absolute", top: -t.size.space05, right: -t.size.space05 },
    // ── NavList ────────────────────────────────────────────────────────────────────────────────
    lista: { gap: t.size.space05 },
    linha: {
        flexDirection: "row", alignItems: "center", gap: t.size.space3, width: "100%",
        minHeight: t.size.controlHLg,
        paddingVertical: t.size.space2, paddingHorizontal: t.size.space3,
        borderRadius: t.size.radiusCard - t.size.space1,
    },
    // O MIOLO da linha: ícone + texto (+ valor em texto) + seta. Ele é quem toca; o que vem
    // depois dele, na moldura, é IRMÃO — ver o comentário no componente.
    // Nenhuma medida nova: `flex`, `minWidth` e o MESMO `gap` da moldura.
    linhaMiolo: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: t.size.space3 },
    linhaTexto: { flex: 1, minWidth: 0 },
    // ── Tabs ───────────────────────────────────────────────────────────────────────────────────
    // A cápsula é a MESMA do `SegmentedControl`, e o CSS diz isso em voz alta no comentário de
    // cima do `.tabs` (`aurea.css:1114`): *"Mesma regra da .segmented"*. Os três números vêm de
    // lá — `gap:3px; padding:3px` — e não de mim.
    abas: {
        flexDirection: "row", gap: 3, padding: 3,
        minHeight: t.size.controlHMd, borderRadius: t.size.radiusControl,
        backgroundColor: t.color.muted,
    },
    // `padding:0 14px` é literal no `.tab` (`aurea.css:1127`). A aba NÃO estica (nada de `flex`):
    // na web ela é conteúdo dentro de um `inline-flex`, e é isso que deixa a lista rolar quando
    // não cabe, em vez de espremer todas.
    // ⚠ O nome é `abaDeTab` porque `aba` JÁ EXISTE neste arquivo — é o item do `BottomNav`
    // (linha 78), que tem `flex: 1` e cresce. Reusar o nome teria sobrescrito um dos dois em
    // silêncio, e o `tsc` só pegou porque são chaves do mesmo objeto.
    abaDeTab: {
        alignItems: "center", justifyContent: "center",
        paddingHorizontal: 14, borderRadius: t.size.radiusControl,
    },
    abaDeTabAtiva: { backgroundColor: t.color.secondary },
    painel: { marginTop: t.size.space3 },
    // ── Stepper ────────────────────────────────────────────────────────────────────────────────
    trilha: { flexDirection: "row" },
    passo: { flex: 1, alignItems: "center" },
    bolinha: {
        width: 32, height: 32, marginBottom: t.size.space2,
        alignItems: "center", justifyContent: "center", borderRadius: t.size.radiusFull,
        borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
        backgroundColor: t.color.surface1,
    },
}));
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
export function BottomNav({ items, current, variant = "floating", indicator = "none", width = "full", label, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    const inset = useSafeAreaInsets();
    const redondo = indicator.startsWith("circle");
    const anotar = useAnotarBottomNav();
    const flutua = variant !== "edge";
    const justa = flutua && width === "content";
    return (_jsx(View, { accessibilityLabel: label ?? strings.bottomNavLabel, 
        // 🔴 A BARRA CONTA A PRÓPRIA ALTURA — é o que permite o `Screen` reservar o fim da rolagem
        // sem o app calcular nada. A conta é a pílula (o que o layout mede) mais as DUAS margens
        // mais a folga do sistema; `edge` conta zero, porque ela fica no fluxo e já encurta a tela.
        onLayout: anotar == null ? undefined : (e) => anotar(flutua ? e.nativeEvent.layout.height + t.size.space4 * 2 + inset.bottom : 0), style: [
            s.barra, justa ? s.barra_content : s.barra_cheia, variant === "edge" && s.barra_edge,
            // 🔴 NO `floating` A FOLGA DO SISTEMA VAI POR FORA — conserto de 19/09/2026, visto em
            // aparelho Samsung com os três botões (|||, ○, <).
            //
            // Antes, os ≈48 pontos da faixa do sistema entravam como RECHEIO dentro da pílula: ela
            // crescia para baixo e a barriga dela ficava atrás dos botões. A `margin: space4` não
            // compensava, porque o que cresceu foi o miolo.
            //
            // Agora: recheio de baixo igual aos outros lados, e a folga empurra a pílula para cima.
            // A borda de baixo fica exatamente `space4` acima do topo da área do sistema, em aparelho
            // de botões, de gesto ou com o indicador do iPhone — os três caem na mesma conta.
            flutua
                ? { paddingBottom: t.size.space1, marginBottom: t.size.space4 + inset.bottom }
                // `edge` NÃO MUDA: encostada na borda, a folga é recheio mesmo, senão sobraria uma
                // faixa de fundo entre a barra e o pé da tela. `max` e não soma, como sempre foi.
                : { paddingBottom: Math.max(t.size.space1, inset.bottom) },
            style,
        ], ...rest, children: items.map((it) => {
            const ativo = it.id === current;
            const corDoTexto = !ativo ? t.color.mutedForeground
                : indicator === "none" ? t.color.primaryEmphasis
                    : indicator === "circle-bold" ? t.color.primaryForeground
                        : indicator === "subtle" || indicator === "pill" ? t.color.primaryEmphasis
                            : redondo ? t.color.primaryEmphasis
                                : t.color.foreground;
            return (_jsxs(Pressable, { onPress: it.onPress, disabled: it.disabled, 
                // `link` e não `tab`: uma aba troca um painel DESTA tela; isto troca de tela.
                accessibilityRole: "link", accessibilityState: { selected: ativo, disabled: !!it.disabled }, style: [
                    s.aba, justa && s.aba_content,
                    indicator === "subtle" && { borderRadius: t.size.radiusCard - t.size.space1 },
                    ativo && (indicator === "subtle" || indicator === "pill")
                        && { backgroundColor: comOpacidade(t.color.primary, 0.12) },
                    ativo && indicator === "circle-bold" && {
                        flex: 0, width: 56, borderRadius: t.size.radiusFull,
                        backgroundColor: t.color.primary,
                    },
                ], children: [_jsxs(View, { style: [
                            s.marca, redondo && s.marcaRedonda,
                            ativo && indicator === "circle" && { backgroundColor: comOpacidade(t.color.primary, 0.14) },
                            ativo && indicator === "circle-raised" && {
                                backgroundColor: t.color.popover, boxShadow: [t.shadow.shadowMd],
                            },
                            ativo && indicator === "circle-outline" && {
                                borderWidth: t.size.borderWidth, borderColor: t.color.primaryEmphasis,
                            },
                        ], children: [it.icon && _jsx(Icon, { name: it.icon, size: "lg", color: corDoTexto }), it.badge != null && it.badge !== false && (_jsx(View, { style: s.contador, children: typeof it.badge === "number"
                                    ? _jsx(Badge, { tone: "danger", emphasis: "solid", size: "xs", count: it.badge })
                                    : _jsx(Badge, { tone: "danger", emphasis: "solid", size: "xs", dot: true }) }))] }), typeof it.label === "string"
                        ? _jsx(Text, { size: "xs", weight: ativo ? 500 : 400, numberOfLines: 1, style: { color: corDoTexto }, children: it.label })
                        : it.label] }, it.id));
        }) }));
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
export function Topbar({ variant = "floating", inset = "bar", brand, children, style, ...rest }) {
    const s = folha(useAureaTokens());
    return (_jsxs(View, { style: [
            s.topo, s[`topo_${variant}`],
            variant === "flush" && inset !== "bar" && s[`topo_recuo_${inset}`],
            style,
        ], ...rest, children: [brand != null && _jsx(View, { children: brand }), children] }));
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
export function NavList({ items, chevron = "chevron--right", style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    return (_jsx(View, { accessibilityRole: "list", style: [s.lista, style], ...rest, children: items.map((it) => {
            // 🔴 DUAS COISAS QUE O CONSUMIDOR MEDIU EM 17/09/2026, e as duas moram nesta linha.
            //
            // 1 · **O `value` ficava DENTRO do `Pressable`.** Como ele aceita qualquer conteúdo, um
            //     `Switch` ali virava botão dentro de botão — e **no iOS o `Switch` desaparecia**
            //     para o VoiceOver (a mesma armadilha do `Combobox`, do `Alert` e do `Chart`; o
            //     `check 43` é quem guarda a família).
            //     ⚠ **O `check 43` NÃO pega este caso, e é honesto dizer:** ele lê o NOSSO código, e
            //     aqui o que é tocável chega de fora. **Slot que recebe conteúdo do consumidor é
            //     ponto cego de qualquer gate estático** — por isso o conserto é de DESENHO.
            //
            // 2 · **Toda linha declarava `accessibilityRole="link"`, mesmo sem `onPress`.** Uma lista
            //     só de leitura anunciava cada linha como link que não vai a lugar nenhum.
            //
            // O que ficou, e por que o `value` se divide por TIPO em vez de sair sempre:
            //   • valor em TEXTO fica no miolo, porque é parte da frase da linha — pô-lo fora criaria
            //     uma segunda parada dizendo só "42 km", solta;
            //   • valor em COMPONENTE fica FORA, irmão do miolo, porque pode ser tocável.
            const temAcao = typeof it.onPress === "function";
            const valorEhTexto = typeof it.value === "string" || typeof it.value === "number";
            const miolo = (_jsxs(_Fragment, { children: [it.icon && _jsx(Icon, { name: it.icon, size: "md", color: t.color.foreground }), _jsxs(View, { style: s.linhaTexto, children: [typeof it.label === "string"
                                ? _jsx(Text, { size: "sm", numberOfLines: 1, children: it.label }) : it.label, it.description != null && (typeof it.description === "string"
                                ? _jsx(Text, { size: "xs", tone: "muted", numberOfLines: 1, children: it.description })
                                : it.description)] }), valorEhTexto && _jsx(Text, { size: "sm", tone: "muted", children: it.value }), temAcao && chevron
                        && _jsx(Icon, { name: chevron, size: "sm", color: t.color.mutedForeground })] }));
            return (_jsxs(View, { style: [s.linha, it.disabled && { opacity: t.size.opacityDisabled }], children: [temAcao ? (_jsx(Pressable, { onPress: it.onPress, disabled: it.disabled, accessibilityRole: "link", accessibilityState: { disabled: !!it.disabled }, style: s.linhaMiolo, children: miolo })) : (_jsx(View, { accessible: true, accessibilityState: { disabled: !!it.disabled }, style: s.linhaMiolo, children: miolo })), !valorEhTexto && it.value != null ? it.value : null] }, it.id));
        }) }));
}
/**
 * A trilha de passos — o onboarding de 3 passos que o consumidor já tem.
 *
 * ⚠ **`aria-current="step"` não tem par no RN.** A web marca o passo ativo com ele; aqui o mais
 * próximo é `accessibilityState={{selected}}`, que é o que os leitores anunciam. Não é o mesmo
 * vocabulário — é o vocabulário que existe, e dizer isso é melhor que fingir paridade.
 */
export function Stepper({ items, label, doneIcon = "checkmark", errorIcon = "error", style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    return (_jsx(View, { accessibilityRole: "list", accessibilityLabel: label ?? strings.stepperLabel, style: [s.trilha, style], ...rest, children: items.map((it, n) => {
            const st = it.state ?? "default";
            const cor = st === "error" ? (t.color.danger400 ?? t.color.destructive)
                : st === "active" ? t.color.primaryEmphasis
                    : t.color.foreground;
            const miolo = (_jsxs(_Fragment, { children: [_jsx(View, { style: [
                            s.bolinha,
                            st === "error" && { borderColor: cor },
                            st === "active" && { borderColor: t.color.primaryEmphasis },
                        ], children: st === "done" && doneIcon
                            ? _jsx(Icon, { name: doneIcon, size: "sm", color: cor })
                            : st === "error" && errorIcon
                                ? _jsx(Icon, { name: errorIcon, size: "sm", color: cor })
                                : _jsx(Text, { size: "sm", weight: 600, style: { color: cor }, children: n + 1 }) }), typeof it.label === "string"
                        ? _jsx(Text, { size: "sm", weight: 600, align: "center", style: { color: cor }, children: it.label })
                        : it.label, it.optional != null && (typeof it.optional === "string"
                        ? _jsx(Text, { size: "xs", tone: "muted", align: "center", children: it.optional })
                        : it.optional)] }));
            return it.onPress ? (_jsx(Pressable, { onPress: it.onPress, accessibilityRole: "button", accessibilityState: { selected: st === "active" }, style: s.passo, children: miolo }, n)) : (_jsx(View, { accessible: true, accessibilityState: { selected: st === "active" }, style: s.passo, children: miolo }, n));
        }) }));
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
export function Tabs({ tabs, value, onChange, label, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    const aberta = tabs.find((it) => it.id === value);
    return (_jsxs(View, { style: style, ...rest, children: [_jsx(FilaRolante, { children: _jsx(View, { accessibilityRole: "tablist", accessibilityLabel: label ?? strings.tabsLabel, style: s.abas, children: tabs.map((it) => {
                        const ativa = it.id === value;
                        return (_jsx(Pressable, { onPress: it.disabled ? undefined : () => onChange?.(it.id), disabled: it.disabled, accessibilityRole: "tab", accessibilityState: { selected: ativa, disabled: !!it.disabled }, accessibilityLabel: typeof it.label === "string" ? it.label : undefined, style: [s.abaDeTab, ativa && s.abaDeTabAtiva, it.disabled && { opacity: t.size.opacityDisabled }], children: typeof it.label === "string"
                                ? _jsx(Text, { size: "sm", weight: ativa ? 600 : 400, style: { color: ativa ? t.color.foreground : t.color.mutedForeground }, children: it.label })
                                : it.label }, it.id));
                    }) }) }), aberta
                ? (_jsx(Card, { variant: "inset", accessibilityLabel: typeof aberta.label === "string" ? aberta.label : undefined, style: s.painel, children: aberta.content }))
                : null] }));
}
