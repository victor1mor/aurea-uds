import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — a categoria **Inputs**: `Field`, `Label`, `Input`, `Textarea`, `Select`,
// `Switch`, `Checkbox`, `Radio`, `SegmentedControl` e `Form`.
//
// Lote 4 do `NATIVE.md` §5.5 — o coração do app do consumidor: *dois formulários curtos, um
// diário e um periódico*, com **teclado numérico automático** nos campos de medida e moeda (§5.1).
//
// ── UMA CORREÇÃO ANTES DE TUDO, E ELA MUDA O TAMANHO DESTE LOTE ──────────────────────────────
// O `NATIVE.md` §5.5 diz *"sete destes são Base UI na web — este é o lote caro"*, e o `CLAUDE.md`
// repetiu. **Medido em 08/09/2026, são DOIS de dez:**
//
//     Form              -> @base-ui/react
//     SegmentedControl  -> @base-ui/react/radio-group
//     os outros oito    -> engine: null
//
// De onde veio o sete: a §5.2.4 lista a **família de campo** do Base UI inteira — Form, Field,
// Combobox, NumberField, OTPField, RadioGroup, SegmentedControl. Quatro daqueles **não estão
// neste lote**, e o `Field` da Aurea não declara motor. O número certo era da família, não do
// lote, e a frase misturou os dois.
//
// Isso não torna o lote fácil — só torna caro por outro motivo, que é o de verdade: **a ligação
// rótulo↔controle da web não existe aqui.** Ver o `Field`, abaixo.
//
// ── O QUE FOI MEDIDO, COM A LINHA ────────────────────────────────────────────────────────────
//   .field         aurea.css:672   coluna, gap 7
//   .label         :683            linha, space-between, gap 12, textSm, weightSemibold
//   .input/.select :685            altura de controle, padding-inline 13, borda borderStrong
//   .textarea      :694            minH 104, padding-block space-3, raio LG (não o de controle)
//   .select        :696            seta desenhada como imagem de fundo, padding-end 38
//   as três medidas:831-832        sm -> controlHSm/textXs/space-3 · lg -> controlHLg/textBase/space-4
//   .form          :861            grade com gap space-5
//   .field-error   :862            danger-400, textXs
//   .checkbox/.radio :863          linha, alinhada no TOPO, gap 9
//   .control-mark  :871            METADE da altura de controle, borda borderStrong, fundo fieldBg
//   o visto        :877            8×4 com borda esquerda+baixo, girado -45°
//   o ponto        :878            8×8 redondo
//   .switch-track  :882            largura h×7/6, altura h×2/3, raio 999, fundo muted
//   o polegar      :894            inset 3, lado = 100% − space-1 − space-05, redondo
//   .segmented     :922            linha, gap 3, padding 3, minH controlHMd, fundo muted
import * as React from "react";
import { Animated, KeyboardAvoidingView as KeyboardAvoidingViewRN, Modal, Platform, Pressable, ScrollView, TextInput, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { comOpacidade, criarFolha } from "./estilos.js";
import { FilaRolante } from "./rolagem.js";
import { IconButton } from "./actions.js";
import { Icon } from "./icon.js";
import { useReduceMotion } from "./movimento.js";
import { Text } from "./text.js";
import { useAureaStrings, useAureaTokens, usePeleSobreAMarca, ForaDaMarca } from "./theme.js";
const alturaDoTamanho = (t, s) => s === "sm" ? t.size.controlHSm : s === "lg" ? t.size.controlHLg : t.size.controlHMd;
const fonteDoTamanho = (t, s) => s === "sm" ? t.size.textSm : s === "lg" ? t.size.textLg : t.size.textBase; // ADR-0050: um degrau acima da web
const respiroDoTamanho = (t, s) => s === "sm" ? t.size.space3 : s === "lg" ? t.size.space4 : 13;
const folha = criarFolha((t) => ({
    campo: { gap: 7 },
    rotulo: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    caixa: {
        width: "100%", minWidth: 0,
        borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
        borderRadius: t.size.radiusControl, backgroundColor: t.color.fieldBg,
        color: t.color.foreground,
    },
    // O `.textarea` é o único da família com raio LG em vez do de controle: uma caixa alta em
    // pílula viraria uma cápsula, e o CSS já decidiu isso (`aurea.css:694`).
    areaDeTexto: { minHeight: 104, paddingVertical: t.size.space3, borderRadius: t.size.radiusLg },
    invalido: { borderColor: t.color.danger400 ?? t.color.destructive },
    desabilitado: { opacity: t.size.opacityDisabled },
    // O GRUPO é a mesma caixa do campo virada em LINHA, e os números são os mesmos: mesma borda,
    // mesmo raio de controle, mesmo fundo. A altura e o respiro horizontal entram por tamanho, como
    // no `Input`, porque é o grupo que passa a desenhar a caixa quando existe um.
    grupo: {
        flexDirection: "row", alignItems: "center", width: "100%", minWidth: 0,
        borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
        borderRadius: t.size.radiusControl, backgroundColor: t.color.fieldBg,
        gap: t.size.space1,
    },
    // Dentro do grupo o campo perde a caixa e vira só o texto — a borda passou a ser do grupo.
    // ⚠ As DUAS últimas linhas continuam obrigatórias: são o conserto de Android de 09/09/2026
    // (`paddingVertical: 0` desliga a injeção do tema, `textAlignVertical` tira o texto do topo).
    // É o mesmo par que o `campoDeTexto` do `busca.tsx` carrega pela mesma razão.
    campoNoGrupo: { flex: 1, minWidth: 0, paddingVertical: 0, textAlignVertical: "center" },
    encaixe: { flexDirection: "row", alignItems: "center", flexShrink: 0, gap: t.size.space1 },
    marcaBase: {
        alignItems: "center", justifyContent: "center",
        borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
        backgroundColor: t.color.fieldBg,
    },
    // E5: a marca no MEIO da altura do texto, como o HeroUI Native. Era `flex-start` com um
    // `marginTop: 1` fixo, e a bolinha ficava presa no topo do rótulo.
    linhaDeControle: { flexDirection: "row", alignItems: "center", gap: 9 },
    linhaNoTopo: { alignItems: "flex-start" },
    trilho: { borderRadius: t.size.radiusFull, backgroundColor: t.color.muted,
        borderWidth: t.size.borderWidth, borderColor: t.color.border, justifyContent: "center" },
    polegar: { position: "absolute", left: 3, borderRadius: t.size.radiusFull },
    segmentada: {
        flexDirection: "row", alignSelf: "flex-start", gap: 3, padding: 3,
        minHeight: t.size.controlHMd, borderRadius: t.size.radiusControl,
        backgroundColor: t.color.muted, borderWidth: t.size.borderWidth, borderColor: "transparent",
    },
    segmento: { flex: 1, alignItems: "center", justifyContent: "center",
        paddingHorizontal: 14, borderRadius: t.size.radiusControl },
    segmentoAtivo: { backgroundColor: t.color.secondary },
    // 🔴 O FIO AMARELO DO ESCOLHIDO — ele faltava, e a falta era metade do defeito C4.
    // O `aurea.css:958-960` põe este fio em TODOS os selecionados da casa (`.is-selected`, aba
    // ativa, botão alternado e `.segmented button.active`), e o bloco de comentário acima dele
    // diz por quê, com data: *"Item de nav ativo, aba ativa, item de lista lateral e botão
    // alternado ligado mostram o MESMO sinal (…) Um usuário aprende uma vez e reconhece em todo
    // lugar (pedido do Victor, 24/07)."*
    // Os três números saem daquela linha, não de mim: altura 2 (fração de pixel borra), recuo 15,
    // e o amarelo a 75% (cheio ele grita mais que o próprio rótulo).
    // ⚠ Em segmento estreito o recuo de 15 de cada lado zera a largura e o fio some — **e é o
    // mesmo comportamento da web**, onde `inset-inline:15px` num box estreito não desenha nada.
    fioDoSegmento: {
        position: "absolute", left: 15, right: 15, bottom: 0, height: 2,
        borderRadius: t.size.radiusFull, backgroundColor: comOpacidade(t.color.primary, 0.75),
    },
    formulario: { gap: t.size.space5 },
    // A folha do `Select`: no RN não existe `<select>`, então a lista é um `Modal` — que é
    // exatamente o "motor novo sobre `Modal`" que a §5.2.4 previu.
    fundoDaLista: { flex: 1, justifyContent: "flex-end", backgroundColor: "#00000080" },
    fundoDeToque: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
    lista: {
        maxHeight: "60%", paddingVertical: t.size.space2,
        borderTopLeftRadius: t.size.radiusCard, borderTopRightRadius: t.size.radiusCard,
        backgroundColor: t.color.popover, borderWidth: t.size.borderWidth, borderColor: t.color.border,
    },
    opcao: { minHeight: t.size.controlHLg, justifyContent: "center",
        paddingHorizontal: t.size.space4 },
}));
const CampoCtx = React.createContext(null);
/** O que os controles leem do `Field` acima deles. Público porque um controle novo vai precisar. */
export function useCampo() {
    return React.useContext(CampoCtx);
}
const GrupoDeCampo = React.createContext(null);
/** O grupo em volta do campo, quando existe um. `null` quando o campo está sozinho. */
export function useGrupoDeCampo() {
    return React.useContext(GrupoDeCampo);
}
/**
 * Rótulo, controle, dica e erro — na ordem, com o respiro do CSS.
 *
 * ```tsx
 * <Field label="Quilometragem" hint="Só números" error={erro}>
 *   <Input keyboardType="numeric" value={km} onChangeText={setKm} />
 * </Field>
 * ```
 *
 * ⚠ **O `error` não é só um texto vermelho:** ele marca o controle como inválido para o leitor de
 * tela e vira a dica que ele anuncia. Um campo que fica vermelho e não diz nada é um campo que só
 * quem enxerga sabe que está errado.
 *
 * ⚠ **Não há `orientation="horizontal"`.** Na web ela põe rótulo e controle lado a lado numa
 * grade de `12rem`; num telefone de 360dp isso deixa o controle com menos de metade da largura.
 * Volta quando houver alvo de tela larga — tablet é outro lote.
 */
export function Field({ label, hint, error, disabled, size = "md", children, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const invalido = error != null && error !== false;
    const ctx = React.useMemo(() => ({
        label,
        // A dica que o leitor anuncia é o ERRO quando há erro — é a informação que importa naquele
        // momento, e é o que o `aria-describedby` da web acaba fazendo na prática.
        hint: invalido && typeof error === "string" ? error : typeof hint === "string" ? hint : undefined,
        invalido, disabled, size,
    }), [label, hint, error, invalido, disabled, size]);
    return (_jsx(CampoCtx.Provider, { value: ctx, children: _jsxs(View, { style: [s.campo, style], ...rest, children: [label != null && _jsx(Label, { children: label }), children, hint != null && !invalido && (typeof hint === "string"
                    ? _jsx(Text, { size: "xs", tone: "muted", children: hint }) : hint), invalido && (typeof error === "string"
                    ? _jsx(Text, { size: "xs", tone: "danger", children: error }) : error)] }) }));
}
/**
 * O rótulo.
 *
 * ⚠ **Ele NÃO nomeia o controle sozinho**, ao contrário do `<label for>` da web — no RN um texto
 * ao lado é só um texto. Quem nomeia é o `accessibilityLabel` do controle, e é o `Field` que o
 * entrega. Um `Label` solto é decoração; use-o dentro de um `Field`.
 */
export function Label({ children, trailing, style, ...rest }) {
    const s = folha(useAureaTokens());
    return (_jsxs(View, { style: [s.rotulo, style], ...rest, children: [typeof children === "string"
                ? _jsx(Text, { size: "sm", weight: 600, children: children }) : children, trailing] }));
}
/**
 * O campo de uma linha.
 *
 * ⚠ **`:hover` não atravessa, e não é lacuna.** A web clareia a borda no ponteiro
 * (`aurea.css:686`); **não há ponteiro no telefone**. O foco continua existindo e é o que marca o
 * campo ativo.
 */
export function Input({ value, defaultValue, onChangeText, placeholder, disabled, size, keyboardType, secureTextEntry, autoCapitalize, formatOnBlur, onBlur, onFocus, multiline, style, testID, 
// ⚠ O `...rest` NÃO é enfeite: sem ele, toda prop do `TextInput` que a lista acima não nomeia
// era descartada em silêncio — `autoComplete`, `textContentType`, `autoCorrect`,
// `returnKeyType`, `onSubmitEditing`, `maxLength`. Defeito publicado na `0.8.2`.
...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const peleDaMarca = usePeleSobreAMarca();
    const campo = useCampo();
    const grupo = useGrupoDeCampo();
    const tam = size ?? grupo?.size ?? campo?.size ?? "md";
    const inativo = disabled ?? grupo?.disabled ?? campo?.disabled;
    const [focado, setFocado] = React.useState(false);
    return (_jsx(TextInput
    // O resto vem PRIMEIRO de propósito: o que a Aurea calcula (respiro, cor, nome do `Field`,
    // `editable`) tem de vencer, e as props que ela redefine estão no `Omit` da interface —
    // então não chegam por aqui e não há o que sobrescrever por acidente.
    , { ...rest, testID: testID, value: value, defaultValue: defaultValue, onChangeText: onChangeText, placeholder: placeholder, placeholderTextColor: peleDaMarca?.color ?? t.color.subtleForeground, editable: !inativo, keyboardType: keyboardType, secureTextEntry: secureTextEntry, autoCapitalize: autoCapitalize, multiline: multiline, onFocus: () => { setFocado(true); grupo?.aoFocar(true); onFocus?.(); }, onBlur: () => {
            setFocado(false);
            grupo?.aoFocar(false);
            // Só avisa quando o texto MUDOU: emitir o mesmo valor a cada saída de foco faria o app
            // re-renderizar sem motivo, e num formulário de dez campos isso é dez renders por
            // preenchimento. Mesma guarda da web (`inputs-client.tsx:194`).
            if (formatOnBlur && value != null) {
                const formatado = formatOnBlur(value);
                if (formatado !== value)
                    onChangeText?.(formatado);
            }
            onBlur?.();
        }, 
        // O nome e a dica vêm do `Field` — ver o bloco acima sobre por que a ligação da web não
        // atravessa. Sem isto, o campo é um nó anônimo para o leitor de tela.
        accessibilityLabel: campo?.label, accessibilityHint: campo?.hint, accessibilityState: { disabled: !!inativo }, "aria-invalid": campo?.invalido, style: [
            // DENTRO DE UM GRUPO o campo não desenha caixa nenhuma: borda, fundo, altura, respiro,
            // inválido, foco e desabilitado passam a ser do grupo. Manter qualquer um dos dois
            // desenhando daria borda dentro de borda — que é exatamente o defeito que o `.input-group
            // > .input` da web zera à mão (`aurea.css:751`).
            grupo ? s.campoNoGrupo : s.caixa,
            grupo
                ? { fontSize: fonteDoTamanho(t, tam), fontFamily: t.font.ui[400], color: t.color.foreground }
                : { height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam),
                    fontSize: fonteDoTamanho(t, tam), fontFamily: t.font.ui[400], color: t.color.foreground,
                    // ⚠ AS DUAS LINHAS ABAIXO NÃO SÃO ENFEITE — sem elas o texto sobe e é CORTADO no
                    // Android, e foi assim que este campo chegou ao vidro em 09/09/2026.
                    //
                    // `padding-block:0` é LITERAL na web (`aurea.css:685`) e não atravessou. No RN a falta
                    // dele não é "sem padding": o `AndroidTextInputComponentDescriptor.h:101-107` INJETA o
                    // padding do tema do Android no nó do Yoga sempre que as props não trazem `padding`,
                    // `paddingTop`/`paddingBottom` nem `paddingVertical` — e o `hasPaddingVertical` é
                    // exatamente o que desliga a injeção. Com `height` fixa, esse padding come a altura por
                    // dentro e a caixa de texto fica menor que a linha: daí o corte.
                    //
                    // O `textAlignVertical` é o outro lado da mesma conta. Na web, um campo com
                    // `block-size` centraliza a linha sozinho; no Android o `setTextAlignVertical` do
                    // `ReactTextInputManager.kt:571` traduz `null`/`auto` para `Gravity.NO_GRAVITY`, que
                    // deixa o `EditText` no topo. `center` é o que reproduz a web — e o `Textarea` o
                    // sobrescreve para `top`, que é o que uma caixa alta faz nos dois lados.
                    paddingVertical: 0, textAlignVertical: "center" },
            !grupo && campo?.invalido && s.invalido,
            // O foco é o único estado que sobra do trio da web (hover/focus/active), e ele importa
            // mais aqui: no telefone é a única pista de qual campo o teclado está alimentando.
            !grupo && focado && { borderColor: t.color.focusStrong },
            // 🔴 DENTRO DO CARTÃO DA MARCA A TINTA VENCE TUDO — inclusive inválido e foco, e isso é
            // medição, não preferência (os números estão no `usePeleSobreAMarca`): sobre o amarelo a
            // borda de inválido mede **1,86** e o `focusStrong` do tema ESCURO mede **1,00**, porque
            // lá ele É o amarelo. Deixá-los vencer apagaria o campo justamente quando ele mais
            // precisa ser achado.
            peleDaMarca && { color: peleDaMarca.color },
            !grupo && peleDaMarca,
            // E o foco continua existindo, por ESPESSURA em vez de cor — a única pista que sobra
            // quando só há uma tinta. O dobro da borda do token, não número novo.
            !grupo && peleDaMarca && focado && { borderWidth: t.size.borderWidth * 2 },
            !grupo && inativo && s.desabilitado,
            style,
        ] }));
}
/** A caixa alta. Mesmo campo, `multiline`, raio LG e altura mínima de 104 (medida no CSS). */
export function Textarea({ rows, size, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const campo = useCampo();
    const tam = size ?? campo?.size ?? "md";
    return (_jsx(Input, { ...rest, size: tam, style: [
            s.areaDeTexto,
            // `rows` não existe no RN; a conta é a do CSS para os tamanhos alternativos
            // (`aurea.css:836`: `min-block-size: calc(--step-h * 3)`).
            rows != null && { minHeight: alturaDoTamanho(t, tam) * rows },
            { height: undefined, textAlignVertical: "top" },
            style,
        ], multiline: true }));
}
/**
 * A caixa de campo que aceita coisas dentro — glifo na frente, botão atrás, os dois.
 *
 *     <InputGroup>
 *       <InputGroupAddon><Icon name="email" size="sm" /></InputGroupAddon>
 *       <Input value={email} onChangeText={setEmail} keyboardType="email-address" />
 *     </InputGroup>
 *
 * ⚠ **O `Input` lá dentro para de desenhar a própria caixa** — quem desenha borda, fundo, altura,
 * foco e inválido passa a ser o grupo. Isso é automático: o campo enxerga o grupo por contexto.
 */
export function InputGroup({ size, disabled, children, style, testID, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const peleDaMarca = usePeleSobreAMarca();
    const campo = useCampo();
    const tam = size ?? campo?.size ?? "md";
    const inativo = disabled ?? campo?.disabled ?? false;
    const [focado, setFocado] = React.useState(false);
    // O contexto muda de identidade a cada render se for objeto literal, e isso re-renderiza todo
    // campo de todo formulário a cada tecla. Mesma memoização do `Field`.
    const ctx = React.useMemo(() => ({ size: tam, disabled: inativo, aoFocar: setFocado }), [tam, inativo]);
    return (_jsx(View, { testID: testID, style: [
            s.grupo,
            { height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam) },
            campo?.invalido && s.invalido,
            // O foco vem do campo lá dentro, por contexto: no React Native não existe `:focus-within`,
            // e sem isto a única pista de qual campo o teclado alimenta sumiria ao entrar num grupo.
            focado && { borderColor: t.color.focusStrong },
            // Sobre a marca a tinta vence inválido e foco — ver `usePeleSobreAMarca`.
            peleDaMarca,
            peleDaMarca && focado && { borderWidth: t.size.borderWidth * 2 },
            inativo && s.desabilitado,
            style,
        ], ...rest, children: _jsx(GrupoDeCampo.Provider, { value: ctx, children: children }) }));
}
/**
 * Um encaixe dentro do `InputGroup`. **A posição é a do JSX** — antes do campo fica na frente,
 * depois fica atrás. Não há prop de lado, e o porquê está no bloco do grupo lá em cima.
 */
export function InputGroupAddon({ children, style, testID, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    return _jsx(View, { testID: testID, style: [s.encaixe, style], ...rest, children: children });
}
export function PasswordField({ defaultVisible = false, size, disabled, autoCapitalize = "none", leading, icons, testID, style, ...rest }) {
    const strings = useAureaStrings();
    const campo = useCampo();
    const [visivel, setVisivel] = React.useState(defaultVisible);
    const tam = size ?? campo?.size ?? "md";
    const inativo = disabled ?? campo?.disabled;
    return (_jsxs(InputGroup, { size: tam, disabled: inativo, testID: testID, children: [leading ? _jsx(InputGroupAddon, { children: leading }) : null, _jsx(Input, { ...rest, size: tam, disabled: inativo, autoCapitalize: autoCapitalize, secureTextEntry: !visivel, style: style, testID: testID ? `${testID}-campo` : undefined }), _jsx(InputGroupAddon, { children: _jsx(IconButton, { name: visivel ? "view--off" : "view", label: visivel ? strings.passwordHide : strings.passwordShow, appearance: "ghost", size: tam === "lg" ? "md" : "sm", disabled: inativo, icons: icons, onPress: () => setVisivel(v => !v), testID: testID ? `${testID}-olho` : undefined }) })] }));
}
function ControleMarcado({ papel, label, description, checked, onChange, disabled, size, style, testID, accessibilityLabel, align = "center", }) {
    const t = useAureaTokens();
    const s = folha(t);
    const campo = useCampo();
    const tam = size ?? campo?.size ?? "md";
    const inativo = disabled ?? campo?.disabled;
    // Mesma conta do `Switch`, pela mesma razão: sem texto, a coluna vazia com `flex: 1` tomaria a
    // largura que sobra dentro de uma fileira e apagaria o que estivesse ao lado.
    const temTexto = label != null || description != null;
    // A marca é METADE da altura do controle — `aurea.css:871`, e é o que faz ela crescer junto
    // com a densidade sem token próprio.
    const lado = alturaDoTamanho(t, tam) / 2;
    // `start`: o meio da marca no meio da PRIMEIRA linha do rótulo. A linha é a do `Text size="sm"`
    // do rótulo (entrelinha normal), então a conta sai dos mesmos tokens que desenham o texto.
    const linha = t.size.textBase * t.size.leadingNormal;
    const noTopo = align === "start" ? { marginTop: Math.max(0, (linha - lado) / 2) } : null;
    return (_jsxs(Pressable, { testID: testID, onPress: inativo ? undefined : () => onChange?.(!checked), disabled: inativo, accessibilityRole: papel, accessibilityState: { checked: !!checked, disabled: !!inativo }, 
        // ⚠ O `accessibilityLabel` de fora vence o `label` escrito, e existe para o caso em que o
        // nome JÁ está na tela ao lado — uma linha de `NavList`, por exemplo. Sem ele, ou o nome
        // aparece escrito duas vezes, ou o controle sobe MUDO para quem usa leitor de tela.
        accessibilityLabel: accessibilityLabel ?? (typeof label === "string" ? label : campo?.label), accessibilityHint: typeof description === "string" ? description : campo?.hint, style: [s.linhaDeControle, align === "start" && s.linhaNoTopo, inativo && s.desabilitado, style], children: [_jsx(View, { style: [
                    s.marcaBase, noTopo,
                    { width: lado, height: lado,
                        borderRadius: papel === "radio" ? t.size.radiusFull : 5 },
                    checked && { backgroundColor: t.color.controlSelected, borderColor: t.color.controlSelected },
                ], children: checked && (papel === "radio"
                    // O ponto do rádio é 8×8 e da cor SELECIONADA, não da cor de primeiro plano — no CSS
                    // ele é `background: var(--control-selected)` sobre a marca já pintada.
                    ? _jsx(View, { style: { width: 8, height: 8, borderRadius: t.size.radiusFull,
                            backgroundColor: t.color.controlSelectedForeground } })
                    // O visto da web é desenhado com DUAS BORDAS de um retângulo 8×4 girado −45°. Isso
                    // atravessa inteiro: `transform: rotate` e `borderLeftWidth`/`borderBottomWidth`
                    // existem no RN. Desenhá-lo assim, em vez de trazer um glifo, mantém a peça sem
                    // depender do registro de ícones do app.
                    : _jsx(View, { style: {
                            width: 8, height: 4, marginTop: -2,
                            borderLeftWidth: 2, borderBottomWidth: 2,
                            borderColor: t.color.controlSelectedForeground,
                            transform: [{ rotate: "-45deg" }],
                        } })) }), temTexto && (_jsxs(View, { style: { flex: 1 }, children: [typeof label === "string" ? _jsx(Text, { size: "sm", children: label }) : label, description != null && (typeof description === "string"
                        ? _jsx(Text, { size: "xs", tone: "muted", children: description }) : description)] }))] }));
}
/** A caixa que marca. `accessibilityRole="checkbox"` + `state.checked`. */
export function Checkbox(p) { return _jsx(ControleMarcado, { ...p, papel: "checkbox" }); }
/**
 * O círculo que escolhe **um de vários**.
 *
 * ⚠ **Não há prop `name`.** Na web ela agrupa os rádios pelo DOM; aqui o agrupamento é do
 * estado do app — quem sabe qual está escolhido é o `useState` da tela, e `checked` sai dele.
 */
export function Radio(p) { return _jsx(ControleMarcado, { ...p, papel: "radio" }); }
/**
 * O interruptor.
 *
 * ⚠ **NÃO é o `Switch` do React Native**, pela mesma razão que o `Spinner` não é o
 * `ActivityIndicator`: aquele desenha o interruptor do Material no Android e o do iOS no iOS —
 * duas aparências que o `CLAUDE.md` proíbe em voz alta. As medidas aqui são as do CSS: trilho de
 * `altura × 7/6` por `altura × 2/3`, polegar com 3 de folga.
 *
 * ⚠ **E ele respeita "menos movimento"**: com a preferência ligada, o polegar salta em vez de
 * deslizar. O estado continua o mesmo — o que some é a animação, não a informação.
 */
export function Switch({ label, description, checked, onChange, disabled, size, style, testID, accessibilityLabel, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const campo = useCampo();
    const tam = size ?? campo?.size ?? "md";
    const inativo = disabled ?? campo?.disabled;
    const reduzir = useReduceMotion();
    const temTexto = label != null || description != null;
    const h = alturaDoTamanho(t, tam);
    const larguraDoTrilho = h * 7 / 6;
    const alturaDoTrilho = h * 2 / 3;
    const ladoDoPolegar = alturaDoTrilho - t.size.space1 - t.size.space05;
    const curso = larguraDoTrilho - ladoDoPolegar - 6;
    const pos = React.useRef(new Animated.Value(checked ? 1 : 0)).current;
    React.useEffect(() => {
        const destino = checked ? 1 : 0;
        if (reduzir === true) {
            pos.setValue(destino);
            return;
        }
        if (reduzir === null)
            return;
        const a = Animated.timing(pos, { toValue: destino, duration: 160, useNativeDriver: true });
        a.start();
        return () => a.stop();
    }, [checked, pos, reduzir]);
    return (_jsxs(Pressable, { testID: testID, onPress: inativo ? undefined : () => onChange?.(!checked), disabled: inativo, accessibilityRole: "switch", accessibilityState: { checked: !!checked, disabled: !!inativo }, 
        // O `accessibilityLabel` de fora vence o `label` escrito — ver a prop, em `ControleProps`.
        accessibilityLabel: accessibilityLabel ?? (typeof label === "string" ? label : campo?.label), 
        // Mesma regra do `ControleMarcado`: a descrição vira DICA quando é texto. Sem isto ela
        // desenha na tela e não existe para quem usa leitor de tela.
        accessibilityHint: typeof description === "string" ? description : campo?.hint, 
        // 🔴 SEM RÓTULO E SEM DESCRIÇÃO, A RAIZ É O TRILHO E MAIS NADA — e isto é conserto de um
        // defeito que só aparece no ANDROID, achado pelo consumidor em 19/09/2026.
        //
        // A coluna de texto abaixo tem `flex: 1` e existia mesmo vazia. Dentro de uma fileira — uma
        // linha de `NavList`, onde o valor-componente é IRMÃO do miolo (`navigation.tsx:248`) — esse
        // `flex: 1` faz a raiz do `Switch` tomar toda a largura que sobra. O miolo, que também tem
        // `flex: 1`, encolhe até restar só o ícone, e o NOME DA LINHA SOME.
        //
        // ⚠ **No navegador o defeito não aparece**, porque lá a divisão de espaço entre dois
        // irmãos com `flex:1` parte da largura do conteúdo. É a mesma família do `padding-block` do
        // `Input`: o que a cascata resolve de graça, aqui é conta explícita.
        style: [
            { flexDirection: "row", alignItems: "center" },
            temTexto && { gap: 10 },
            inativo && s.desabilitado, style,
        ], children: [_jsx(View, { style: [
                    s.trilho,
                    { width: larguraDoTrilho, height: alturaDoTrilho },
                    checked && { backgroundColor: t.color.controlSelected, borderColor: t.color.controlSelected },
                ], children: _jsx(Animated.View, { style: [
                        s.polegar,
                        { width: ladoDoPolegar, height: ladoDoPolegar,
                            backgroundColor: checked ? t.color.controlSelectedForeground : t.color.mutedForeground,
                            transform: [{ translateX: pos.interpolate({ inputRange: [0, 1], outputRange: [0, curso] }) }] },
                    ] }) }), temTexto && (_jsxs(View, { style: { flex: 1 }, children: [typeof label === "string" ? _jsx(Text, { size: "sm", children: label }) : label, description != null && (typeof description === "string"
                        ? _jsx(Text, { size: "xs", tone: "muted", children: description }) : description)] }))] }));
}
/**
 * Um de poucos, lado a lado.
 *
 * É um dos **dois** componentes deste lote que declaram motor Base UI na web
 * (`@base-ui/react/radio-group`), e o que o motor entrega lá são as **setas do teclado**. **Não
 * há teclado aqui**, então o que resta é o que já se faz à mão: papel de grupo de rádio, um
 * `radio` por segmento, e o estado `selected` em quem está escolhido.
 */
export function SegmentedControl({ items, value, onChange, label, disabled, justify, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const campo = useCampo();
    const inativo = disabled ?? campo?.disabled;
    return (_jsx(FilaRolante, { justify: justify, children: _jsx(View, { accessibilityRole: "radiogroup", accessibilityLabel: label ?? campo?.label, style: [s.segmentada, inativo && s.desabilitado, style], ...rest, children: items.map((it) => {
                const ativo = it.value === value;
                return (_jsxs(Pressable, { onPress: inativo ? undefined : () => onChange?.(it.value), disabled: inativo, accessibilityRole: "radio", accessibilityState: { checked: ativo, disabled: !!inativo }, accessibilityLabel: typeof it.label === "string" ? it.label : undefined, style: [s.segmento, ativo && s.segmentoAtivo], children: [typeof it.label === "string"
                            ? _jsx(Text, { size: "sm", weight: ativo ? 600 : 400, 
                                // 🔴 ERA `foreground`, E ISSO QUEBRAVA A LINGUAGEM DE SELECIONADO.
                                // Achado pelo consumidor em 17/09/2026. A web pinta o escolhido com a
                                // MARCA (`aurea.css:937-938`), e o comentário de cima daquela regra diz
                                // que nav ativo, aba ativa, item de lista e botão ligado mostram o mesmo
                                // sinal — ordem do Victor, 24/07. O `SegmentedControl` daqui discordava
                                // da web **e do `BottomNav` deste mesmo pacote**, que já usa este token.
                                //
                                // ⚠ **`primaryEmphasis` e NÃO `primary`, e a razão está no CSS:** *"sem
                                // fundo, a marca vira TEXTO, e o amarelo puro"* não se lê no claro
                                // (`aurea.css:358`). É a mesma lição que a `0.8.3` pagou no `Button`.
                                // No escuro os dois valem o mesmo amarelo; no claro este aprofunda.
                                //
                                // ⚠ **Uma divergência declarada, não escondida:** para o `.segmented` a
                                // web usa uma mistura própria (`primary 45% + foreground`) em vez do
                                // token, enquanto para o `.bottom-nav` usa o token. São dois âmbares
                                // parecidos para a MESMA linguagem, e isso é incoerência DA WEB. Escolhi
                                // o token, que deixa os dois componentes daqui iguais entre si.
                                style: { color: ativo ? t.color.primaryEmphasis : t.color.mutedForeground }, children: it.label })
                            : it.label, ativo && _jsx(View, { style: s.fioDoSegmento })] }, it.value));
            }) }) }));
}
/**
 * A escolha de um de muitos.
 *
 * ⚠ **Não existe `<select>` no React Native**, e é aqui que a §5.2.4 acertou a previsão: *"decisão
 * de motor nova, componente a componente, sobre `Modal`/`Pressable`/`AccessibilityInfo` do próprio
 * RN"*. O gatilho parece o `.input` da web (mesma altura, mesma borda, a mesma seta à direita); a
 * lista é uma folha que sobe de baixo, que é o idioma do telefone — um menu suspenso do tamanho de
 * um `<select>` de desktop seria intocável com o polegar.
 *
 * ⚠ **O papel é `button` e não `combobox`.** `combobox` promete um campo em que se DIGITA para
 * filtrar; isto só abre uma lista. Prometer o que não se faz é o mesmo defeito do `tablist` no
 * Lote 3.
 *
 * ⚠ **Quem DIGITA para filtrar é o `Combobox`** (Lote 7, `busca.tsx`), e ele nasceu desta
 * lacuna — o consumidor bateu nela no cadastro. **A escolha entre os dois é de tamanho de
 * lista, e a linha é dura:** este monta todos os itens num `ScrollView` (abaixo), o que serve
 * para unidades, estados e tipos; um catálogo de milhares de linhas aqui não fica lento, trava.
 * O `Combobox` usa `FlatList` e aceita busca remota.
 */
export function Select({ items, value, onChange, placeholder, disabled, size, chevron = "chevron--down", style, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const peleDaMarca = usePeleSobreAMarca();
    const campo = useCampo();
    const tam = size ?? campo?.size ?? "md";
    const inativo = disabled ?? campo?.disabled;
    const [aberto, setAberto] = React.useState(false);
    const escolhido = items.find((i) => i.value === value);
    return (_jsxs(_Fragment, { children: [_jsxs(Pressable, { testID: testID, onPress: inativo ? undefined : () => setAberto(true), disabled: inativo, accessibilityRole: "button", accessibilityLabel: campo?.label, accessibilityHint: campo?.hint, accessibilityValue: { text: escolhido?.label }, accessibilityState: { disabled: !!inativo, expanded: aberto }, style: [
                    s.caixa,
                    { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                        height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam) },
                    campo?.invalido && s.invalido,
                    // Sobre a marca a tinta vence inválido — ver `usePeleSobreAMarca`.
                    peleDaMarca,
                    inativo && s.desabilitado,
                    style,
                ], children: [_jsx(Text, { size: tam === "sm" ? "xs" : tam === "lg" ? "base" : "md", tone: escolhido ? "default" : "subtle", numberOfLines: 1, children: escolhido?.label ?? placeholder ?? "" }), chevron && _jsx(Icon, { name: chevron, size: "sm", color: peleDaMarca?.color ?? t.color.subtleForeground })] }), _jsx(ForaDaMarca, { children: _jsx(Modal, { visible: aberto, transparent: true, animationType: "slide", onRequestClose: () => setAberto(false), children: _jsxs(View, { style: s.fundoDaLista, children: [_jsx(Pressable, { style: s.fundoDeToque, onPress: () => setAberto(false), accessible: false }), _jsx(SafeAreaView, { edges: ["bottom"], style: s.lista, children: _jsx(ScrollView, { children: items.map((it) => (_jsx(Pressable, { disabled: it.disabled, onPress: () => { onChange?.(it.value); setAberto(false); }, accessibilityRole: "menuitem", accessibilityState: { selected: it.value === value, disabled: !!it.disabled }, style: [s.opcao, it.disabled && s.desabilitado], children: _jsx(Text, { size: "md", weight: it.value === value ? 600 : 400, children: it.label }) }, it.value))) }) })] }) }) })] }));
}
/**
 * A pilha de campos, com o respiro do `--space-5`.
 *
 * ⚠ **Ele é MUITO menos do que o `Form` da web, e de propósito.** Lá ele é `@base-ui/react`: mapa
 * de erros por nome de campo, submissão nativa do `<form>`, validação do navegador. **Nada disso
 * existe no React Native** — não há `<form>`, não há `submit`, não há validação de plataforma. O
 * que sobra é o espaçamento, e o `Field` já leva o erro de cada campo pelo `error`.
 *
 * Fingir a API da web aqui criaria um `onSubmit` que nada dispara e um `errors` que ninguém lê.
 */
export function Form({ children, style, ...rest }) {
    const s = folha(useAureaTokens());
    return _jsx(View, { style: [s.formulario, style], ...rest, children: children });
}
/**
 * A casca que levanta o formulário quando o teclado sobe.
 *
 * ⚠ **É a peça mais chata deste lote, e a razão é que o comportamento certo DIFERE por
 * plataforma** — está na documentação do próprio React Native e é medido, não folclore:
 *
 *     iOS      -> `padding`  · a janela não encolhe; é preciso empurrar o conteúdo
 *     Android  -> `height`   · o sistema já redimensiona a janela com `adjustResize`
 *
 * Um `behavior` só nos dois lados deixa metade dos aparelhos com o botão de salvar embaixo do
 * teclado — e é exatamente o formulário de uma tela do consumidor (§5.1), com teclado numérico
 * aberto, que morde primeiro.
 *
 * ⚠ **Não é dependência nova:** o `KeyboardAvoidingView` é do próprio React Native. O que a Aurea
 * acrescenta é a escolha de `behavior` por plataforma, para o app não ter de saber disso.
 */
export function KeyboardAvoiding({ children, offset, style, ...rest }) {
    return (_jsx(KeyboardAvoidingViewRN, { behavior: Platform.OS === "ios" ? "padding" : "height", keyboardVerticalOffset: offset, style: [{ flex: 1 }, style], ...rest, children: children }));
}
