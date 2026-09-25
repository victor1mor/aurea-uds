import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — a BUSCA: `Combobox` e `SearchField`.
//
// Lote 7 do `NATIVE.md` §8 — o primeiro lote que nasce de DEMANDA MEDIDA e não do plano: o alvo
// nativo fechou em 46 componentes em 11/09/2026, e o consumidor bateu em três lacunas na primeira
// tela que a pessoa toca. Esta é a primeira delas, e é a que bloqueia o cadastro.
//
// ── O QUE FALTAVA, LITERALMENTE ──────────────────────────────────────────────────────────────
// O `Select` (`inputs.tsx:576`) escreve a própria lacuna: *"O papel é `button` e não `combobox`.
// `combobox` promete um campo em que se DIGITA para filtrar; isto só abre uma lista."* Era
// honesto, e continua sendo — o `Select` não mudou. O que faltava era o componente que CUMPRE a
// promessa, e é este.
//
// E havia um agravante que a demanda não citava, medido aqui: a folha do `Select` usa
// `ScrollView` (`inputs.tsx:632`), que **monta todos os itens**. Um catálogo de milhares de
// linhas ali não fica lento — ele trava. Este usa `FlatList`, como o `DataList` do Lote 6 já
// fazia (`data.tsx:191`).
//
// ── A DIVERGÊNCIA DA WEB, E ELA É DELIBERADA ─────────────────────────────────────────────────
// **A demanda é busca REMOTA de seleção única, e essa combinação não existe na web.** Medido em
// `inputs-client.tsx`:
//
//     Combobox (seleção única)   -> `items` e filtro do Base UI, do lado do cliente. Sem `onInputChange`.
//     MultiCombobox (múltipla)   -> tem `onInputChange` + `loading`, e desliga o filtro (`filter={null}`)
//
// Ou seja: quem quer buscar no servidor E escolher UM item não tem componente na web. Copiar o
// contrato de lá deixaria o consumidor com um filtro de cliente sobre milhares de linhas que ele
// nem baixou.
//
// Então este componente soma `onSearchChange` + `loading` + `onEndReached` ao contrato de seleção
// única, e **a regra é uma só e vale para os dois lados**: se `onSearchChange` existe, a Aurea
// NÃO filtra — a lista que chega é a lista que aparece, e quem busca é o app. Sem ele, a Aurea
// filtra o que recebeu. É a mesma chave do `filter={null}` do `MultiCombobox`, escrita como
// presença de prop em vez de configuração de motor.
//
// É a mesma classe de divergência que a `Table` do Lote 6 assumiu (`columns`+`rows` em vez de
// `children`): quando a plataforma muda o problema, o contrato muda com ele — declarado, não
// escondido.
//
// ── ONDE SE DIGITA, E POR QUE NÃO É NO GATILHO ───────────────────────────────────────────────
// Na web o `<input>` É o combobox: digita-se nele e a lista desce ancorada. Aqui **o gatilho
// continua sendo um botão, e o campo de digitar mora DENTRO da folha**. Três razões medidas, não
// preferidas:
//
//   1. o teclado do telefone ocupa metade da tela. Um campo ancorado no meio de um formulário
//      abre o teclado por cima da própria lista — a folha sobe do rodapé e fica acima dele;
//   2. o gatilho precisa mostrar o ESCOLHIDO com a geometria do `.input` (mesma altura, mesma
//      borda, a mesma seta) — é o que faz o campo parecer um campo no formulário. Um campo de
//      texto ali mostraria o que se digitou, não o que se escolheu;
//   3. é o idioma dos seletores do próprio sistema, nos dois lados.
//
// ── A ACESSIBILIDADE, MEDIDA NO FONTE DO RN 0.87.1 (e não presumida) ─────────────────────────
// O Lote 5 ensinou que o RN ACEITA papel que não mapeia (`dialog` compila e vira `null`). Então
// os dois papéis daqui foram conferidos no fonte do `react-native@0.87.1` antes de usados:
//
//   `role="search"`   -> `accessibilityPropsConversions.h:64-65` traduz para
//                        `AccessibilityTraits::SearchField`, que o `RCTConversions.h:120-121`
//                        vira `UIAccessibilityTraitSearchField` no iOS; no Android o
//                        `ReactAccessibilityDelegate.kt:461` dá a `className`
//                        `android.widget.EditText`. **Mapeia nos dois.**
//   `role="combobox"` -> no Android o `ReactAccessibilityDelegate.kt:680-682` põe
//                        `roleDescription` de `R.string.combobox_description` (o TalkBack diz
//                        "caixa de combinação"); **no iOS não há trait equivalente** — não está
//                        na tabela do `RCTConversions.h`. Mapeia em UM lado.
//
// Por isso o gatilho é `button` com `expanded`, como o do `Select`: ele abre uma folha e não
// aceita digitação, então `button` é o que ele É nos dois sistemas. Quem digita é o campo da
// folha, e ele leva `search` — que mapeia nos dois.
import * as React from "react";
import { Animated, Easing, FlatList, Modal, PanResponder, Pressable, TextInput, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton } from "./actions.js";
import { criarFolha } from "./estilos.js";
import { Spinner } from "./feedback.js";
import { Icon } from "./icon.js";
import { KeyboardAvoiding, useCampo } from "./inputs.js";
import { useReduceMotion } from "./movimento.js";
import { Text } from "./text.js";
import { useAureaStrings, useAureaTokens, ForaDaMarca, usePeleSobreAMarca } from "./theme.js";
// As mesmas contas do `inputs.tsx`, e elas são repetidas AQUI de propósito: exportá-las de lá
// tornaria pública uma conta interna do outro módulo, e um `import` de função privada entre
// módulos irmãos é o começo de um acoplamento que ninguém declara. São três linhas.
const alturaDoTamanho = (t, s) => s === "sm" ? t.size.controlHSm : s === "lg" ? t.size.controlHLg : t.size.controlHMd;
const fonteDoTamanho = (t, s) => s === "sm" ? t.size.textSm : s === "lg" ? t.size.textLg : t.size.textBase; // ADR-0050: um degrau acima da web
// ⚠ O `13` do tamanho `md` NÃO é número inventado: é o `padding-inline` literal do `.input`
// (`aurea.css:685`), e é o mesmo valor que o `inputs.tsx:60` usa. Não há token de 13 — a escala
// tem `space3`=12 e `space4`=16 —, e é por isso que o CSS o escreve cru dos dois lados.
const respiroDoTamanho = (t, s) => s === "sm" ? t.size.space3 : s === "lg" ? t.size.space4 : 13;
// ── AS DUAS CONSTANTES DE INTERAÇÃO, e elas NÃO são geometria ────────────────────────────────
// Ficam nomeadas e no topo porque número solto no meio do componente é o que o `CLAUDE.md`
// passou a proibir em 12/09/2026. **Nenhuma das duas tem linha de `aurea.css` atrás, e não
// deveria ter:** uma é tempo de digitação, a outra é fração de viewport do motor de lista.
//
// 250 ms é o intervalo entre teclas de quem digita corrido. Abaixo disso a espera não junta
// letra nenhuma e cada tecla vira uma ida ao servidor; muito acima, a lista demora a reagir e a
// pessoa acha que o campo travou. `searchDelay` existe para o app discordar.
const ESPERA_PADRAO = 250;
// Fração da altura visível que sobra abaixo antes de pedir a próxima página. Meia tela de
// antecedência: menos que isso e a lista chega ao fim antes da resposta; mais, e o app pagina
// páginas que ninguém vai ver. É prop do `FlatList`, não medida de desenho.
const ANTECEDENCIA_DE_PAGINA = 0.5;
const folha = criarFolha((t) => ({
    // O gatilho é o `.input` da web (`aurea.css:685`), igual ao do `Select` — mesma altura, mesma
    // borda, o mesmo raio de controle.
    caixa: {
        width: "100%", minWidth: 0,
        borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
        borderRadius: t.size.radiusControl, backgroundColor: t.color.fieldBg,
        flexDirection: "row", alignItems: "center",
    },
    invalido: { borderColor: t.color.danger400 ?? t.color.destructive },
    desabilitado: { opacity: t.size.opacityDisabled },
    // As ações do gatilho — limpar e a seta. O `.combobox-actions` da web (`aurea.css:1673`) é
    // absoluto sobre o campo; aqui é um irmão na linha, porque não há campo por baixo.
    // `space05` mede 2 — o mesmo valor, agora com nome. O `.combobox-actions` da web
    // (`aurea.css:1673`) usa `gap:2px` literal; aqui o token existe, então é ele que entra.
    acoes: { flexDirection: "row", alignItems: "center", gap: t.size.space05 },
    // 🔴 O GATILHO É IRMÃO DO X, NÃO ANCESTRAL — defeito achado pelo consumidor em 16/09/2026.
    // O `IconButton` de limpar vivia DENTRO deste `Pressable`, e um `Pressable` nasce `accessible`
    // (`Pressable.js:274`). No iOS esse `accessible` vira `isAccessibilityElement`
    // (`RCTViewComponentView.mm:398`), e quem é elemento de acessibilidade NÃO expõe os filhos —
    // então o X existia na tela e não existia para o VoiceOver.
    // ⚠ **No Android não sumia**, e é por isso que o defeito atravessou o smoke inteiro: lá
    // `accessible` só liga `isFocusable` (`ReactViewManager.kt:96`) e o `ReactViewGroup.kt:1048`
    // continua entregando os filhos à árvore. Um aparelho só nunca responderia esta pergunta.
    // ⚠ É a MESMA forma dos dois consertos que este pacote já carrega (`busca.tsx` fundo da folha,
    // `inputs.tsx:909`): **num sistema de toque, o irmão resolve o que o ancestral quebra.**
    // Nenhuma distância nova: `flex`, `minWidth` e `100%` são relações, não medidas.
    gatilho: { flex: 1, minWidth: 0, height: "100%", flexDirection: "row", alignItems: "center" },
    // A seta deixou de ser enfeite dentro do gatilho e virou toque próprio — é onde a pessoa toca
    // para abrir. `accessible={false}` no JSX porque o gatilho JÁ anuncia tudo: um segundo botão
    // aqui seria a mesma informação duas vezes. O `Icon` sem rótulo já se esconde sozinho
    // (`icon.tsx:104`), então não sobra nada para o leitor de tela tropeçar.
    setaToque: { height: "100%", justifyContent: "center" },
    // A folha, com a mesma anatomia da do `Select` (`inputs.tsx:98-113`) — e é de propósito que
    // sejam iguais: são o mesmo gesto, e duas folhas diferentes para o mesmo gesto é como uma
    // biblioteca deixa de ter linguagem.
    fundoDaLista: { flex: 1, justifyContent: "flex-end", backgroundColor: "#00000080" },
    fundoDeToque: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
    // 🔴 OS 85% E OS 45% ERAM INVENTADOS, e saíram em 12/09/2026. **A casa já tinha a medida:**
    // o `folhaBaixo` do `BottomSheet` do Lote 5 (`overlays.tsx:104`) usa `maxHeight: "90%"`, e
    // duas folhas que sobem do rodapé com alturas diferentes é como uma biblioteca deixa de ter
    // linguagem. O `minHeight` sumiu: folha abraça o conteúdo, e uma altura mínima só servia para
    // desenhar vazio.
    lista: {
        maxHeight: "90%",
        borderTopLeftRadius: t.size.radiusCard, borderTopRightRadius: t.size.radiusCard,
        backgroundColor: t.color.popover, borderWidth: t.size.borderWidth, borderColor: t.color.border,
    },
    // O puxador, copiado do `BottomSheet` (`overlays.tsx:111-112`) — mesma medida, mesmo token.
    puxadorArea: { alignItems: "center", paddingVertical: t.size.space2 },
    puxador: { width: 40, height: 4, borderRadius: t.size.radiusFull,
        backgroundColor: t.color.borderStrong },
    // O campo de digitar, no topo da folha. É o `.input-group` da web (`aurea.css:741`): a borda
    // mora no GRUPO e o campo dentro dele é transparente e sem borda.
    grupo: {
        flexDirection: "row", alignItems: "center", gap: t.size.space1,
        margin: t.size.space3,
        paddingHorizontal: t.size.space3,
        borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
        borderRadius: t.size.radiusControl, backgroundColor: t.color.fieldBg,
    },
    // ⚠ `paddingVertical: 0` e `textAlignVertical: "center"` — a MESMA correção que o `Input` do
    // Lote 4 levou depois do vidro (`inputs.tsx:280-296`): sem elas o Android injeta o padding do
    // tema dele no nó do Yoga e o texto sai cortado dentro de uma caixa de altura fixa. A regra do
    // `CLAUDE.md` ("correção local é proibida sem responder quem mais tem esse problema") é o que
    // traz as duas linhas para cá, e este campo é exatamente "quem mais".
    campoDeTexto: { flex: 1, minWidth: 0, paddingVertical: 0, textAlignVertical: "center" },
    opcao: {
        minHeight: t.size.controlHLg, justifyContent: "center",
        paddingHorizontal: t.size.space4, paddingVertical: t.size.space2,
    },
    opcaoEscolhida: { backgroundColor: t.color.surface3 ?? t.color.muted },
    vazio: { paddingHorizontal: t.size.space4, paddingVertical: t.size.space5, alignItems: "center" },
    carregando: { paddingVertical: t.size.space4, alignItems: "center" },
}));
/**
 * O campo em que se DIGITA para achar um item.
 *
 * ```tsx
 * // catálogo remoto — a Aurea não filtra, o app busca
 * <Field label="Item">
 *   <Combobox
 *     items={resultados}
 *     value={escolhido}
 *     onValueChange={setEscolhido}
 *     onSearchChange={buscarNoServidor}
 *     loading={buscando}
 *     onEndReached={proximaPagina}
 *   />
 * </Field>
 *
 * // lista na mão — a Aurea filtra
 * <Combobox items={unidades} value={unidade} onValueChange={setUnidade} />
 * ```
 *
 * ⚠ **O gatilho é `button`, não `combobox`** — e desta vez a razão é medida, não herdada do
 * `Select`: `role="combobox"` mapeia no Android (`roleDescription`) e **não mapeia no iOS**; e o
 * gatilho, de qualquer forma, não aceita digitação. Quem digita é o campo da folha, que leva
 * `role="search"` — esse mapeia nos dois. A tabela com arquivo e linha está no topo deste módulo.
 *
 * ⚠ **Ele não guarda a escolha nem o texto buscado.** `value` e o que se digita são do app, como
 * na web e pela mesma razão do achado I1 da auditoria: um componente com a sua própria cópia do
 * estado é a segunda fonte de verdade que ninguém sabe que existe.
 */
export function Combobox({ items, value, onValueChange, onSearchChange, searchDelay = ESPERA_PADRAO, loading, onEndReached, placeholder, searchPlaceholder, empty, clearable = true, draggable = true, disabled, size, chevron = "chevron--down", searchIcon = "search", searchKeyboardType, style, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const peleDaMarca = usePeleSobreAMarca();
    const strings = useAureaStrings();
    const campo = useCampo();
    const tam = size ?? campo?.size ?? "md";
    const inativo = disabled ?? campo?.disabled;
    const [aberto, setAberto] = React.useState(false);
    const [texto, setTexto] = React.useState("");
    const reduzir = useReduceMotion();
    // ── A ESPERA ────────────────────────────────────────────────────────────────────────────────
    // O timer vive num `ref` e é limpo em três lugares: à digitação seguinte, ao fechar a folha e
    // ao desmontar. O terceiro é o que importa e o que mais se esquece — sem ele, sair da tela com
    // uma busca pendente dispara `onSearchChange` sobre um componente que já não existe, e o app
    // leva um `setState` em árvore desmontada.
    const relogio = React.useRef(null);
    const cancelar = React.useCallback(() => {
        if (relogio.current != null) {
            clearTimeout(relogio.current);
            relogio.current = null;
        }
    }, []);
    React.useEffect(() => cancelar, [cancelar]);
    // A referência mais recente da função de busca, para o timer não disparar a de um render
    // anterior. É o padrão de `ref` para callback — e existe porque o app costuma passar uma
    // arrow nova a cada render.
    const buscaAtual = React.useRef(onSearchChange);
    React.useEffect(() => { buscaAtual.current = onSearchChange; }, [onSearchChange]);
    const digitar = React.useCallback((v) => {
        setTexto(v);
        if (!buscaAtual.current)
            return;
        cancelar();
        if (searchDelay <= 0) {
            buscaAtual.current(v);
            return;
        }
        relogio.current = setTimeout(() => {
            relogio.current = null;
            buscaAtual.current?.(v);
        }, searchDelay);
    }, [cancelar, searchDelay]);
    const fechar = React.useCallback(() => {
        cancelar();
        setAberto(false);
        setTexto("");
    }, [cancelar]);
    // ── O ARRASTO, copiado do `BottomSheet` do Lote 5 (`overlays.tsx:427-451`) ──────────────────
    // Os números são os DE LÁ, não novos: 6dp para reivindicar, limiar de 80dp ou um terço da
    // altura, velocidade 1.2. Copiar em vez de reinventar é o que mantém as duas folhas com o
    // mesmo tato — e é a regra do `BUILDING.md` sobre não criar escala nova no meio de um
    // componente.
    const arrasto = React.useRef(new Animated.Value(0)).current;
    const altura = React.useRef(0);
    React.useEffect(() => { if (!aberto)
        arrasto.setValue(0); }, [aberto, arrasto]);
    const gestos = React.useMemo(() => PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => draggable && g.dy > 6,
        onPanResponderMove: (_e, g) => { if (g.dy > 0)
            arrasto.setValue(g.dy); },
        onPanResponderRelease: (_e, g) => {
            const limiar = Math.max(80, altura.current / 3);
            if (g.dy > limiar || g.vy > 1.2) {
                fechar();
                return;
            }
            if (reduzir !== false) {
                arrasto.setValue(0);
                return;
            }
            Animated.timing(arrasto, {
                toValue: 0, duration: t.size.durationSlow, useNativeDriver: true,
                easing: Easing.bezier(...t.easing.easeEmphasized),
            }).start();
        },
    }), [draggable, fechar, arrasto, reduzir, t.size.durationSlow, t.easing.easeEmphasized]);
    // ── O FILTRO, QUANDO ELE É NOSSO ────────────────────────────────────────────────────────────
    const filtrados = React.useMemo(() => {
        if (onSearchChange)
            return items; // busca remota: a lista que chegou é a lista.
        const alvo = dobrar(texto.trim());
        if (!alvo)
            return items;
        return items.filter((i) => dobrar(i.label).includes(alvo));
    }, [items, texto, onSearchChange]);
    const nada = !loading && filtrados.length === 0;
    return (_jsxs(_Fragment, { children: [_jsxs(View, { style: [
                    s.caixa,
                    { height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam) },
                    campo?.invalido && s.invalido,
                    // Sobre a marca a tinta vence inválido — ver `usePeleSobreAMarca`.
                    peleDaMarca,
                    inativo && s.desabilitado,
                    style,
                ], children: [_jsx(Pressable, { testID: testID, onPress: inativo ? undefined : () => setAberto(true), disabled: inativo, accessibilityRole: "button", accessibilityLabel: campo?.label, accessibilityHint: campo?.hint, accessibilityValue: { text: value?.label }, accessibilityState: { disabled: !!inativo, expanded: aberto }, style: s.gatilho, children: _jsx(Text, { size: tam === "sm" ? "xs" : tam === "lg" ? "base" : "md", tone: value ? "default" : "subtle", numberOfLines: 1, style: { flex: 1, minWidth: 0 }, children: value?.label ?? placeholder ?? "" }) }), _jsxs(View, { style: s.acoes, children: [clearable && value != null && !inativo && (_jsx(IconButton, { name: "close", label: strings.comboboxClear, appearance: "ghost", size: "sm", onPress: () => onValueChange?.(null), testID: testID ? `${testID}-limpar` : undefined })), chevron && (_jsx(Pressable, { accessible: false, disabled: inativo, style: s.setaToque, onPress: inativo ? undefined : () => setAberto(true), testID: testID ? `${testID}-seta` : undefined, children: _jsx(Icon, { name: chevron, size: "sm", color: t.color.subtleForeground }) }))] })] }), _jsx(ForaDaMarca, { children: _jsx(Modal, { visible: aberto, transparent: true, animationType: reduzir !== false ? "none" : "slide", statusBarTranslucent: true, navigationBarTranslucent: true, onRequestClose: fechar, children: _jsxs(KeyboardAvoiding, { style: s.fundoDaLista, children: [_jsx(Pressable, { style: s.fundoDeToque, onPress: fechar, accessible: false, testID: testID ? `${testID}-fundo` : undefined }), _jsxs(Animated.View, { style: [s.lista, { transform: [{ translateY: arrasto }] }], onLayout: (e) => { altura.current = e.nativeEvent.layout.height; }, children: [_jsx(View, { style: s.puxadorArea, ...(draggable ? gestos.panHandlers : null), accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: _jsx(View, { style: s.puxador }) }), _jsxs(View, { style: [s.grupo, { height: alturaDoTamanho(t, tam) }], ...(draggable ? gestos.panHandlers : null), children: [searchIcon && _jsx(Icon, { name: searchIcon, size: "sm", color: t.color.subtleForeground }), _jsx(TextInput, { testID: testID ? `${testID}-busca` : undefined, value: texto, onChangeText: digitar, placeholder: searchPlaceholder ?? strings.comboboxSearch, placeholderTextColor: t.color.subtleForeground, 
                                                // ⚠ `autoFocus` é o que faz a folha valer a pena: abrir um campo de busca e
                                                // exigir um segundo toque para o teclado subir é um toque a mais em cada
                                                // cadastro. O foco entra com a folha; o teclado vem junto.
                                                autoFocus: true, autoCorrect: false, autoCapitalize: "none", 
                                                // Mapeia nos dois sistemas — conferido no fonte do RN, tabela no topo do módulo.
                                                accessibilityRole: "search", accessibilityLabel: searchPlaceholder ?? strings.comboboxSearch, 
                                                // `returnKeyType="search"` troca o "enter" do teclado pela lupa. É pista de
                                                // plataforma, não decoração: diz à pessoa que aquele campo é de busca antes de
                                                // ela digitar a primeira letra.
                                                returnKeyType: "search", keyboardType: searchKeyboardType, style: [
                                                    s.campoDeTexto,
                                                    { fontSize: fonteDoTamanho(t, tam), fontFamily: t.font.ui[400],
                                                        color: t.color.foreground },
                                                ] }), texto.length > 0 && (_jsx(IconButton, { name: "close", label: strings.searchClear, appearance: "ghost", size: "sm", onPress: () => digitar(""), testID: testID ? `${testID}-busca-limpar` : undefined }))] }), loading && (_jsx(View, { style: s.carregando, children: _jsx(Spinner, { label: strings.comboboxLoading }) })), nada && (_jsx(View, { style: s.vazio, children: typeof empty === "string" || empty == null
                                            ? _jsx(Text, { size: "sm", tone: "muted", children: empty ?? strings.comboboxEmpty })
                                            : empty })), _jsx(FlatList, { data: filtrados, keyExtractor: (i) => i.value, keyboardShouldPersistTaps: "handled", onEndReached: onEndReached, onEndReachedThreshold: ANTECEDENCIA_DE_PAGINA, renderItem: ({ item }) => (_jsx(Pressable, { disabled: item.disabled, onPress: () => { onValueChange?.(item); fechar(); }, accessibilityRole: "menuitem", accessibilityState: {
                                                selected: item.value === value?.value, disabled: !!item.disabled,
                                            }, style: [
                                                s.opcao,
                                                item.value === value?.value && s.opcaoEscolhida,
                                                item.disabled && s.desabilitado,
                                            ], children: _jsx(Text, { size: "md", weight: item.value === value?.value ? 600 : 400, children: item.label }) })) }), _jsx(SafeAreaView, { edges: ["bottom"] })] })] }) }) })] }));
}
// ── A DOBRA DE ACENTO, e por que ela é sondada em vez de presumida ───────────────────────────
// Buscar "acucar" tem de achar "açúcar" — num catálogo em português, exigir o acento certo é
// exigir que a pessoa saiba escrever o que está procurando. A dobra é `NFD` + remoção dos
// diacríticos combinantes, que é a forma padrão.
//
// **A sonda existe porque o motor é o motor, não um navegador.** `String.prototype.normalize` é
// ES2015 e está no motor, mas este pacote roda em qualquer motor que o consumidor escolha — e
// um `normalize` ausente derrubaria a busca inteira com `TypeError` em vez de degradá-la. A
// sonda roda UMA vez, no carregamento do módulo, e custa uma string de dois caracteres.
const TEM_NORMALIZE = (() => {
    try {
        return "é".normalize("NFD").length === 2;
    }
    catch {
        return false;
    }
})();
const dobrar = (v) => {
    const minusculo = v.toLowerCase();
    return TEM_NORMALIZE
        ? minusculo.normalize("NFD").replace(/[̀-ͯ]/g, "")
        : minusculo;
};
/**
 * A lupa + o campo, numa peça só.
 *
 * ⚠ **Não é o mesmo papel do `Combobox`, e confundir os dois é o erro comum:** o `Combobox`
 * ESCOLHE um item de um catálogo e devolve a escolha; este FILTRA o que já está na tela e devolve
 * texto. Um cadastro pede o primeiro; uma lista com muitas linhas pede o segundo.
 *
 * ⚠ **`role="search"`, e ele mapeia nos dois sistemas** — conferido no fonte do RN 0.87.1, com
 * arquivo e linha no topo deste módulo. É a diferença entre este componente e o `Combobox`, cujo
 * gatilho não pôde levar `combobox` porque o iOS não tem o trait.
 *
 * ⚠ **A borda mora no GRUPO, não no campo** — é o `.input-group` da web (`aurea.css:741`), e é o
 * que deixa lupa, campo e botão de limpar dentro de uma caixa só em vez de três.
 */
export function SearchField({ value, onChangeText, onSearchChange, searchDelay = ESPERA_PADRAO, placeholder, disabled, size, icon = "search", clearable = true, onSubmit, style, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const peleDaMarca = usePeleSobreAMarca();
    const strings = useAureaStrings();
    const campo = useCampo();
    const tam = size ?? campo?.size ?? "md";
    const inativo = disabled ?? campo?.disabled;
    const [focado, setFocado] = React.useState(false);
    // O campo pode ser controlado (`value`) ou não; o texto interno cobre o segundo caso, e é o que
    // o botão de limpar precisa para saber se tem o que limpar.
    const [interno, setInterno] = React.useState("");
    const texto = value ?? interno;
    const relogio = React.useRef(null);
    const cancelar = React.useCallback(() => {
        if (relogio.current != null) {
            clearTimeout(relogio.current);
            relogio.current = null;
        }
    }, []);
    React.useEffect(() => cancelar, [cancelar]);
    const buscaAtual = React.useRef(onSearchChange);
    React.useEffect(() => { buscaAtual.current = onSearchChange; }, [onSearchChange]);
    const digitar = React.useCallback((v) => {
        setInterno(v);
        onChangeText?.(v);
        if (!buscaAtual.current)
            return;
        cancelar();
        if (searchDelay <= 0) {
            buscaAtual.current(v);
            return;
        }
        relogio.current = setTimeout(() => {
            relogio.current = null;
            buscaAtual.current?.(v);
        }, searchDelay);
    }, [cancelar, onChangeText, searchDelay]);
    return (_jsxs(View, { testID: testID, style: [
            s.caixa,
            { height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam),
                gap: t.size.space1 },
            campo?.invalido && s.invalido,
            // O foco é a única pista de campo ativo que sobra no telefone — mesma decisão do `Input`
            // do Lote 4, e ela vale igual aqui.
            focado && { borderColor: t.color.focusStrong },
            // Sobre a marca a tinta vence inválido e foco; o foco vira ESPESSURA — `usePeleSobreAMarca`.
            peleDaMarca,
            peleDaMarca && focado && { borderWidth: t.size.borderWidth * 2 },
            inativo && s.desabilitado,
            style,
        ], children: [icon && _jsx(Icon, { name: icon, size: "sm", color: peleDaMarca?.color ?? t.color.subtleForeground }), _jsx(TextInput, { testID: testID ? `${testID}-campo` : undefined, value: value, onChangeText: digitar, placeholder: placeholder, placeholderTextColor: peleDaMarca?.color ?? t.color.subtleForeground, editable: !inativo, autoCorrect: false, autoCapitalize: "none", returnKeyType: "search", onSubmitEditing: onSubmit, onFocus: () => setFocado(true), onBlur: () => setFocado(false), accessibilityRole: "search", accessibilityLabel: campo?.label ?? placeholder, accessibilityHint: campo?.hint, accessibilityState: { disabled: !!inativo }, style: [
                    s.campoDeTexto,
                    { fontSize: fonteDoTamanho(t, tam), fontFamily: t.font.ui[400],
                        color: t.color.foreground },
                ] }), clearable && texto.length > 0 && !inativo && (_jsx(IconButton, { name: "close", label: strings.searchClear, appearance: "ghost", size: "sm", onPress: () => digitar(""), testID: testID ? `${testID}-limpar` : undefined }))] }));
}
