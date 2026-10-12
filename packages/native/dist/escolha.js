import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — três peças de ESCOLHER (0.32.0, passo 9b): `Slider`, `OTPField` e `TagGroup`.
//
// Mesmo nome e mesma API da web (`inputs-client.tsx`): as mesmas props, com os mesmos tipos de
// valor. Saem as que só existem no navegador (`className`, `id`, `name`, o `largeStep` do teclado,
// o `required` de formulário); entram `style` e `testID`, como no resto do pacote.
//
// O desenho, o comportamento e as medidas são os do pacote nativo da referência, lidos no código
// publicado dela e escritos com os tokens que dão o mesmo número. A cor, o canto, a fonte e os
// ícones são os da Aurea. Sem dependência nova: o gesto é o `PanResponder`, a animação é o
// `Animated` e o campo do código é um `TextInput`, todos do próprio React Native — a mesma escolha
// do `BottomSheet` (`overlays.tsx`).
import * as React from "react";
import { Animated, PanResponder, Platform, Pressable, TextInput, View, } from "react-native";
import { canto, criarFolha, estadoAcessivel } from "./estilos.js";
import { Icon } from "./icon.js";
import { Label, useCampo } from "./inputs.js";
import { driverNativo, useReduceMotion } from "./movimento.js";
import { formatarNumero } from "./numero.js";
import { Text } from "./text.js";
import { useAureaStrings, useAureaTokens, usePeleSobreAMarca } from "./theme.js";
const folha = criarFolha((t) => ({
    desabilitado: { opacity: t.size.opacityDisabled },
    // ── Slider ──────────────────────────────────────────────────────────────────────────────────
    // A referência: 8 entre as partes; o trilho de 20, a alça em cápsula de 28 × 20 com a bolinha de
    // dentro a 2 da borda. O canto é a cápsula da Aurea (lá é o `radius-xl`, 12, que no trilho de 20
    // já quase fecha a cápsula).
    deslizante: { gap: t.size.space2 },
    // Na vertical a referência ocupa a altura do pai e centraliza; a ordem das partes é a da web
    // (valor em cima, trilho, rótulo embaixo).
    deslizanteVertical: { height: "100%", alignItems: "center" },
    // A linha de cima: o rótulo e o valor nas pontas, no meio da altura um do outro.
    cabeca: { alignItems: "center" },
    soValor: { flexDirection: "row", justifyContent: "flex-end" },
    trilho: { width: "100%", height: t.size.space5, justifyContent: "center",
        ...canto(t.size.radiusFull), backgroundColor: t.color.secondary },
    // ⚠ Sem altura no pai, a vertical da referência some (altura zero). Aqui ela nunca fica menor que
    // a da web: o `--range-vertical-size` de lá é `10rem`.
    trilhoVertical: { width: t.size.space5, height: undefined, flex: 1, minHeight: 10 * t.remInDp,
        justifyContent: "flex-start", alignItems: "center" },
    preenchimento: { position: "absolute", ...canto(t.size.radiusFull), backgroundColor: t.color.controlSelected },
    preenchimentoDeitado: { top: 0, bottom: 0 },
    preenchimentoEmPe: { left: 0, right: 0 },
    alca: { position: "absolute", padding: t.size.space05, ...canto(t.size.radiusFull),
        backgroundColor: t.color.controlSelected },
    alcaDeitada: { width: t.size.space7, height: t.size.space5 },
    alcaEmPe: { width: t.size.space5, height: t.size.space7 },
    bolinha: { flex: 1, ...canto(t.size.radiusFull), backgroundColor: t.color.controlSelectedForeground,
        boxShadow: [...t.shadowLayers.shadowSm] },
    // ── OTPField ────────────────────────────────────────────────────────────────────────────────
    // A referência: casas de 44 × 48 com 8 entre elas. A altura é a do campo (`touchControlHMd`, a
    // escala de 48 do `Input`); a pele é a do `Input` — borda, fundo e a cápsula.
    codigo: { alignSelf: "flex-start" },
    casas: { flexDirection: "row", alignItems: "center", gap: t.size.space2 },
    casa: {
        width: t.size.space10 + t.size.space1, height: t.size.touchControlHMd,
        alignItems: "center", justifyContent: "center",
        borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
        ...canto(t.size.radiusControl), backgroundColor: t.color.fieldBg,
    },
    // A casa ativa: a borda da cor do foco, com a espessura do anel (o contorno de 2 da referência).
    casaAtiva: { borderColor: t.color.focusStrong, borderWidth: t.size.focusWidth },
    casaInvalida: { borderColor: t.color.danger400 ?? t.color.destructive },
    // O dígito da referência: 18 em seminegrito, na linha de 28 do `text-lg`.
    digito: { fontSize: t.size.textLg, lineHeight: t.size.textLg * t.size.textLgLeading,
        fontFamily: t.font.ui[600], color: t.color.foreground },
    // O ponto da máscara: o mesmo ponto de 10 do `RadioGroup`.
    ponto: { width: t.size.space2 + t.size.space05, height: t.size.space2 + t.size.space05,
        ...canto(t.size.radiusFull), backgroundColor: t.color.foreground },
    // O cursor da referência: 2 de largura, da altura da letra.
    cursor: { width: t.size.space05, height: t.size.textLg, ...canto(t.size.radiusFull),
        backgroundColor: t.color.mutedForeground },
    campoEscondido: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
    // ── TagGroup ────────────────────────────────────────────────────────────────────────────────
    // A referência: 12 entre rótulo, lista e descrição; 8 entre as etiquetas, numa fila que quebra.
    grupo: { gap: t.size.space3 },
    lista: { width: "100%", flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: t.size.space2 },
    etiqueta: { flexDirection: "row", alignItems: "center", ...canto(t.size.radiusFull) },
    // A parte principal fica POR CIMA do X: a área de toque estendida do X não pode roubar o toque de
    // quem quer escolher a etiqueta (ver o `TagGroup`).
    principal: { flexDirection: "row", alignItems: "center", zIndex: 1 },
    remover: { alignItems: "center", justifyContent: "center", ...canto(t.size.radiusFull) },
}));
/** Prende `v` entre `a` e `b`. */
const limitar = (v, a, b) => Math.min(Math.max(v, a), b);
/** Quantas casas decimais um número tem — para o passo de 0,1 não virar 0,30000000000000004. */
function casasDecimais(n) {
    const s = String(n);
    const exp = /e-(\d+)$/.exec(s);
    if (exp)
        return Number(exp[1]);
    const i = s.indexOf(".");
    return i < 0 ? 0 : s.length - i - 1;
}
/** O valor no passo mais perto, contado a partir do `min` (como na referência e no motor da web). */
function noPasso(v, min, max, passo) {
    if (!(passo > 0))
        return limitar(v, min, max);
    const bruto = min + Math.round((v - min) / passo) * passo;
    return limitar(Number(bruto.toFixed(Math.max(casasDecimais(passo), casasDecimais(min)))), min, max);
}
const ehLista = (v) => Array.isArray(v);
/**
 * O controle deslizante da referência: o trilho, o preenchimento e a alça em cápsula, com o rótulo
 * e o valor na linha de cima.
 *
 *     <Slider label="Volume" defaultValue={30} />
 *     <Slider label="Preço" value={faixa} onValueChange={setFaixa} min={0} max={1000} step={10}
 *             format={{style: "currency", currency: "BRL"}} locale="pt-BR" thumbLabels={["Mínimo", "Máximo"]} />
 *
 * Arrastar a alça move a partir de onde ela está; tocar no trilho leva a alça mais perto até ali (e
 * continua arrastando, como na web). Na faixa, uma alça não passa da outra — para nela, como na
 * referência. Cada alça é um elemento `adjustable`: o leitor de tela anuncia o valor formatado e
 * desliza um passo para cima ou para baixo (`increment`/`decrement`).
 */
export function Slider({ label, labelHidden, value, defaultValue, onValueChange, onValueCommitted, min = 0, max = 100, step = 1, orientation = "horizontal", disabled, format, locale, showValue = true, thumbLabels, style, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    const campo = useCampo();
    const inativo = disabled ?? campo?.disabled ?? false;
    const vertical = orientation === "vertical";
    // A faixa é decidida pela forma do valor, como na web: lista entra, lista sai.
    const faixa = ehLista(value ?? defaultValue);
    const paraLista = (v) => (v === undefined ? [min] : ehLista(v) ? [...v] : [v]).map((n) => limitar(n, min, max));
    const [proprio, setProprio] = React.useState(() => paraLista(defaultValue));
    const valores = value !== undefined ? paraLista(value) : proprio;
    const [trilho, setTrilho] = React.useState(0);
    const [arrastando, setArrastando] = React.useState(null);
    // A alça mede 28 no eixo do movimento; o curso dela é o trilho menos ela — a alça nunca sai do
    // trilho (a conta da referência).
    const alca = t.size.space7;
    const curso = Math.max(0, trilho - alca);
    const fracao = (v) => (max === min ? 0 : (v - min) / (max - min));
    const texto = (v) => formatarNumero(v, locale, format);
    // O valor vivo do gesto. Entre dois movimentos o React pode não ter desenhado ainda, então quem
    // arrasta lê e escreve aqui; a cada desenho ele volta a ser o que a tela mostra.
    const vivos = React.useRef(valores);
    vivos.current = valores;
    const gesto = React.useRef(null);
    const saida = (lista) => (faixa ? lista : lista[0]);
    const mudar = (i, bruto) => {
        const lista = [...vivos.current];
        // A alça para na vizinha (a referência não deixa uma passar da outra).
        const piso = i > 0 ? lista[i - 1] : min;
        const teto = i < lista.length - 1 ? lista[i + 1] : max;
        const v = limitar(noPasso(bruto, min, max, step), piso, teto);
        if (v === lista[i])
            return;
        lista[i] = v;
        vivos.current = lista;
        if (value === undefined)
            setProprio(lista);
        onValueChange?.(saida(lista));
    };
    const comprometer = () => onValueCommitted?.(saida(vivos.current));
    const ctl = React.useRef(null);
    ctl.current = {
        inativo,
        pegar: (i) => {
            const atual = vivos.current;
            // Duas alças no mesmo ponto: quem anda é decidido pelo primeiro movimento (para a esquerda, a
            // de baixo; para a direita, a de cima). Sem isso a alça de cima, que é a que recebe o toque,
            // ficaria presa na de baixo e a faixa não abriria para trás.
            gesto.current = { i, inicio: atual[i], decidir: atual.filter((v) => v === atual[i]).length > 1 };
            setArrastando(i);
        },
        pegarNoTrilho: (e) => {
            if (curso <= 0)
                return;
            const bruto = vertical ? e.nativeEvent.locationY : e.nativeEvent.locationX;
            // A distância desde o começo do trilho — na vertical, o começo é embaixo.
            const p = vertical ? trilho - bruto : bruto;
            const alvo = min + limitar((p - alca / 2) / curso, 0, 1) * (max - min);
            // A alça mais perto do toque; no empate, a que fica do lado do toque.
            let i = 0;
            let melhor = Infinity;
            vivos.current.forEach((v, k) => {
                const d = Math.abs(v - alvo);
                if (d < melhor || (d === melhor && alvo > v)) {
                    melhor = d;
                    i = k;
                }
            });
            gesto.current = { i, inicio: alvo, decidir: false };
            setArrastando(i);
            mudar(i, alvo);
        },
        mover: (g) => {
            const ag = gesto.current;
            if (!ag || curso <= 0)
                return;
            const delta = vertical ? -g.dy : g.dx;
            if (ag.decidir && delta !== 0) {
                const iguais = vivos.current.flatMap((v, k) => (v === vivos.current[ag.i] ? [k] : []));
                ag.i = delta < 0 ? iguais[0] : iguais[iguais.length - 1];
                ag.decidir = false;
                setArrastando(ag.i);
            }
            mudar(ag.i, ag.inicio + (delta / curso) * (max - min));
        },
        soltar: () => {
            if (!gesto.current)
                return;
            gesto.current = null;
            setArrastando(null);
            comprometer();
        },
        passo: (i, sentido) => {
            if (inativo)
                return;
            const antes = vivos.current[i];
            mudar(i, antes + sentido * step);
            if (vivos.current[i] !== antes)
                comprometer();
        },
    };
    // O toque no trilho. A alça tem o gesto dela (abaixo) e ganha o toque quando o dedo cai nela; o
    // preenchimento não recebe toque, então a posição do dedo é sempre contada a partir do trilho.
    const gestoDoTrilho = React.useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => !ctl.current.inativo,
        onMoveShouldSetPanResponder: () => !ctl.current.inativo,
        // Arrastando, a rolagem da tela não toma o dedo.
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => ctl.current.pegarNoTrilho(e),
        onPanResponderMove: (_e, g) => ctl.current.mover(g),
        onPanResponderRelease: () => ctl.current.soltar(),
        onPanResponderTerminate: () => ctl.current.soltar(),
    }), []);
    const inicioF = valores.length > 1 ? fracao(valores[0]) : 0;
    const fimF = fracao(valores[valores.length - 1]);
    // O preenchimento cobre a alça inteira (a conta da referência): começa no começo da primeira alça
    // (ou do trilho) e acaba no fim da última.
    const extensao = Math.max(alca, (fimF - inicioF) * curso + alca);
    const preenchido = vertical
        ? { bottom: inicioF * curso, height: extensao }
        : { left: inicioF * curso, width: extensao };
    // A área de toque chega aos 44 no eixo de fora (o trilho tem 20).
    const folga = (t.size.targetMin - t.size.space5) / 2;
    const nomeDoGrupo = typeof label === "string" ? label : campo?.label;
    const valorEscrito = showValue ? (_jsx(Text, { size: "xs", weight: 500, numeric: true, children: valores.map(texto).join(" – ") })) : null;
    const trilhoDesenhado = (_jsxs(View, { ...gestoDoTrilho.panHandlers, onLayout: (e) => {
            const { width, height } = e.nativeEvent.layout;
            setTrilho(vertical ? height : width);
        }, hitSlop: vertical ? { left: folga, right: folga } : { top: folga, bottom: folga }, testID: testID ? `${testID}-trilho` : undefined, style: [s.trilho, vertical && s.trilhoVertical], children: [_jsx(View, { pointerEvents: "none", style: [s.preenchimento, vertical ? s.preenchimentoEmPe : s.preenchimentoDeitado, preenchido] }), valores.map((v, i) => (_jsx(AlcaDoDeslizante, { indice: i, ctl: ctl, vertical: vertical, deslocamento: fracao(v) * curso, arrastando: arrastando === i, inativo: inativo, nome: thumbLabels?.[i] ?? nomeDoGrupo, valorEscrito: texto(v), porcento: Math.round(fracao(v) * 100), rotulosDasAcoes: [strings.increment, strings.decrement], testID: testID ? `${testID}-alca-${i}` : undefined }, i)))] }));
    return (_jsx(View, { testID: testID, style: [s.deslizante, vertical && s.deslizanteVertical, inativo && s.desabilitado, style], children: vertical ? (_jsxs(_Fragment, { children: [valorEscrito, trilhoDesenhado, !labelHidden && (typeof label === "string" ? _jsx(Text, { size: "sm", weight: 500, children: label }) : label)] })) : (_jsxs(_Fragment, { children: [!labelHidden
                    ? _jsx(Label, { trailing: valorEscrito, style: s.cabeca, children: label })
                    : valorEscrito && _jsx(View, { style: s.soValor, children: valorEscrito }), trilhoDesenhado] })) }));
}
function AlcaDoDeslizante({ indice, ctl, vertical, deslocamento, arrastando, inativo, nome, valorEscrito, porcento, rotulosDasAcoes, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const reduzir = useReduceMotion();
    // A bolinha encolhe a 90% enquanto o dedo arrasta — a referência e o `.slider-thumb` da web. Com
    // "menos movimento" ela salta, sem deslizar.
    const escala = React.useRef(new Animated.Value(1)).current;
    React.useEffect(() => {
        const destino = arrastando ? 0.9 : 1;
        if (reduzir !== false) {
            escala.setValue(destino);
            return;
        }
        const a = Animated.timing(escala, { toValue: destino, duration: t.size.durationFast, useNativeDriver: driverNativo() });
        a.start();
        return () => a.stop();
    }, [arrastando, reduzir, escala, t.size.durationFast]);
    const gesto = React.useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => !ctl.current.inativo,
        onMoveShouldSetPanResponder: () => !ctl.current.inativo,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => ctl.current.pegar(indice),
        onPanResponderMove: (_e, g) => ctl.current.mover(g),
        onPanResponderRelease: () => ctl.current.soltar(),
        onPanResponderTerminate: () => ctl.current.soltar(),
    }), [ctl, indice]);
    // A área de toque da alça chega aos 44 nos dois eixos (ela tem 28 × 20).
    const noEixo = (t.size.targetMin - t.size.space7) / 2;
    const fora = (t.size.targetMin - t.size.space5) / 2;
    return (_jsx(View, { ...gesto.panHandlers, testID: testID, hitSlop: vertical ? { top: noEixo, bottom: noEixo, left: fora, right: fora }
            : { top: fora, bottom: fora, left: noEixo, right: noEixo }, accessible: true, accessibilityRole: "adjustable", accessibilityLabel: nome, 
        // O motor do aparelho converte min, max e now para INTEIRO, e um valor fracionário (0,75)
        // derruba a ponte — por isso a escala de 0 a 100, como na referência; quem fala o valor é o
        // `text`, já formatado.
        accessibilityValue: { min: 0, max: 100, now: porcento, text: valorEscrito }, accessibilityActions: [{ name: "increment", label: rotulosDasAcoes[0] }, { name: "decrement", label: rotulosDasAcoes[1] }], onAccessibilityAction: (e) => {
            const nomeDaAcao = e.nativeEvent.actionName;
            if (nomeDaAcao === "increment")
                ctl.current.passo(indice, 1);
            else if (nomeDaAcao === "decrement")
                ctl.current.passo(indice, -1);
        }, ...estadoAcessivel({ disabled: inativo }), style: [s.alca, vertical ? s.alcaEmPe : s.alcaDeitada, vertical ? { bottom: deslocamento } : { left: deslocamento }], children: _jsx(Animated.View, { style: [s.bolinha, { transform: [{ scale: escala }] }] }) }));
}
const soDigitos = (s) => s.replace(/\D/g, "");
/**
 * O próximo valor a partir do texto do campo escondido. Só dígitos (o `numeric` da web), cortado
 * no tamanho. Quando chegam vários dígitos de uma vez — colar, ou o código do SMS que o sistema
 * preenche — e eles formam um código inteiro, o código colado vence o que já estava escrito.
 */
function proximoCodigo(anterior, texto, tamanho) {
    const novo = soDigitos(texto);
    if (novo.length > anterior.length + 1) {
        const colado = texto.startsWith(anterior) ? soDigitos(texto.slice(anterior.length)) : novo;
        if (colado.length >= tamanho)
            return colado.slice(0, tamanho);
    }
    return novo.slice(0, tamanho);
}
/**
 * O campo de código de uso único — a anatomia da referência: UM campo de texto invisível por cima
 * das casas, que só desenham. É ele que recebe o teclado, o colar e o código do SMS
 * (`textContentType="oneTimeCode"` no iPhone, `autoComplete="sms-otp"` no Android).
 *
 *     <Field label="Código enviado por SMS"><OTPField length={6} value={codigo} onValueChange={setCodigo} /></Field>
 *
 * A casa da vez ganha a borda do foco e o cursor que pisca (parado com "menos movimento"). Só
 * dígitos entram, como na web. Para o leitor de tela é um campo só, com o nome do `label` (ou do
 * `Field`); as casas ficam fora da árvore, para ele não ler cada dígito duas vezes.
 */
export function OTPField({ length, value, defaultValue, onValueChange, mask, disabled, label, style, testID }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    const campo = useCampo();
    const pele = usePeleSobreAMarca();
    const inativo = disabled ?? campo?.disabled ?? false;
    const invalido = campo?.invalido ?? false;
    const [proprio, setProprio] = React.useState(() => soDigitos(defaultValue ?? "").slice(0, length));
    const valor = value !== undefined ? soDigitos(value).slice(0, length) : proprio;
    const [focado, setFocado] = React.useState(false);
    const campoRef = React.useRef(null);
    const aoDigitar = (texto) => {
        const novo = proximoCodigo(valor, texto, length);
        // Letra rejeitada: o valor não muda, e o campo controlado volta sozinho ao que era.
        if (novo === valor)
            return;
        if (value === undefined)
            setProprio(novo);
        onValueChange?.(novo);
    };
    return (_jsxs(Pressable, { onPress: () => campoRef.current?.focus(), disabled: inativo, accessible: false, testID: testID, style: [s.codigo, inativo && s.desabilitado, style], children: [_jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: s.casas, children: Array.from({ length }, (_, i) => {
                    const digito = valor[i];
                    // A da vez é a primeira vazia, só com o campo em foco; cheio, nenhuma (a referência).
                    const ativa = focado && i === valor.length;
                    return (_jsx(View, { testID: testID ? `${testID}-casa-${i}` : undefined, style: [
                            s.casa,
                            ativa && s.casaAtiva,
                            invalido && s.casaInvalida,
                            // Sobre a marca vale a tinta, inclusive no lugar do vermelho — a regra do `Input`.
                            pele && { borderColor: pele.borderColor, backgroundColor: pele.backgroundColor },
                        ], children: digito != null
                            ? (mask
                                ? _jsx(View, { style: [s.ponto, pele && { backgroundColor: pele.color }] })
                                : _jsx(Text, { style: [s.digito, pele && { color: pele.color }], children: digito }))
                            : ativa ? _jsx(CursorDoCodigo, { cor: pele?.color }) : null }, i));
                }) }), _jsx(TextInput, { ref: campoRef, testID: testID ? `${testID}-campo` : undefined, value: valor, onChangeText: aoDigitar, onFocus: () => setFocado(true), onBlur: () => setFocado(false), editable: !inativo, inputMode: "numeric", textContentType: "oneTimeCode", autoComplete: Platform.OS === "android" ? "sms-otp" : "one-time-code", autoCorrect: false, autoCapitalize: "none", 
                // Sem `maxLength`: um limite no campo cortaria o texto colado ANTES de a Aurea achar o
                // código dentro dele ("Seu código é 123456").
                // No iPhone, com opacidade zero o campo não aceita colar — então 0,02 e a letra
                // transparente, e o cursor do sistema escondido (o desenhado é o da casa).
                caretHidden: Platform.OS === "ios", accessibilityLabel: label ?? campo?.label, accessibilityHint: campo?.hint, accessibilityValue: { text: `${valor.length} ${strings.positionOf} ${length}` }, ...estadoAcessivel({ disabled: inativo }), "aria-invalid": invalido || undefined, style: [s.campoEscondido, Platform.select({ ios: { opacity: 0.02, color: "transparent" }, default: { opacity: 0 } })] })] }));
}
function CursorDoCodigo({ cor }) {
    const t = useAureaTokens();
    const s = folha(t);
    const reduzir = useReduceMotion();
    const opacidade = React.useRef(new Animated.Value(1)).current;
    React.useEffect(() => {
        // Parado e aceso com "menos movimento" (e enquanto o sistema não respondeu).
        if (reduzir !== false) {
            opacidade.setValue(1);
            return;
        }
        // O piscar da referência: 500 ms para apagar, 500 para acender.
        const laco = Animated.loop(Animated.sequence([
            Animated.timing(opacidade, { toValue: 0, duration: 500, useNativeDriver: driverNativo() }),
            Animated.timing(opacidade, { toValue: 1, duration: 500, useNativeDriver: driverNativo() }),
        ]));
        laco.start();
        return () => laco.stop();
    }, [opacidade, reduzir]);
    return _jsx(Animated.View, { pointerEvents: "none", style: [s.cursor, cor != null && { backgroundColor: cor }, { opacity: opacidade }] });
}
/**
 * As medidas de cada tamanho, as da referência: em cima e embaixo 2 · 4 · 6, dos lados 8 · 10 · 12,
 * vão 4 · 4 · 6, letra 12 · 14 · 16 na linha de 16 · 20 · 24.
 */
const medidasDaEtiqueta = (t, tamanho) => tamanho === "sm"
    ? { vertical: t.size.space05, lados: t.size.space2, vao: t.size.space1, letra: t.size.textXs, linha: t.size.space4 }
    : tamanho === "lg"
        ? { vertical: t.size.space1 + t.size.space05, lados: t.size.space3, vao: t.size.space1 + t.size.space05,
            letra: t.size.textBase, linha: t.size.space6 }
        : { vertical: t.size.space1, lados: t.size.space2 + t.size.space05, vao: t.size.space1, letra: t.size.textSm,
            linha: t.size.space5 };
/**
 * A mistura de duas cores opacas, `pct` da primeira — o `color-mix()` da web, que o React Native
 * não tem. ⚠ A conta é em sRGB; a web mistura em OKLab. Com 10% a diferença não passa de um ponto
 * por canal. Cor que não for hex de seis cai na segunda, para nunca entregar uma cor que o motor
 * descarte.
 */
function misturar(a, b, pct) {
    const hex = /^#[0-9a-fA-F]{6}$/;
    if (!hex.test(a) || !hex.test(b))
        return b;
    const ca = parseInt(a.slice(1), 16);
    const cb = parseInt(b.slice(1), 16);
    return "#" + [16, 8, 0]
        .map((d) => Math.round(((ca >> d) & 255) * pct + ((cb >> d) & 255) * (1 - pct)).toString(16).padStart(2, "0"))
        .join("");
}
const textoDaEtiqueta = (it) => it.textValue ?? (typeof it.label === "string" ? it.label : "");
/**
 * O grupo de etiquetas da referência: as etiquetas numa fila que quebra, com rótulo, descrição e
 * erro; escolha de nenhuma, uma ou várias; e o X de tirar.
 *
 *     <TagGroup label="Assuntos" selectionMode="multiple" items={assuntos}
 *               selectedKeys={escolhidos} onSelectionChange={setEscolhidos} onRemove={tirar} />
 *
 * ⚠ **O X é IRMÃO da etiqueta, e não filho**, ao contrário da referência (lá o botão de tirar mora
 * dentro do item tocável). No iPhone, um tocável dentro de outro some para o VoiceOver (`check
 * 43`); aqui a etiqueta é uma moldura com duas partes lado a lado — a que escolhe e a que tira —,
 * como o `.tag-main` e o `.tag-remove` da web.
 *
 * Com escolha, cada etiqueta é um botão com o estado `selected`; sem escolha, é só texto. A
 * escolhida ganha o fundo com 10% da marca e a letra no destaque (`primaryEmphasis`), a pintura
 * da web.
 */
export function TagGroup({ label, labelHidden, description, errorMessage, items, selectionMode = "none", selectedKeys, defaultSelectedKeys, onSelectionChange, onRemove, size = "md", variant = "default", icons, style, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    const [proprio, setProprio] = React.useState(defaultSelectedKeys ?? []);
    const escolhidos = selectedKeys ?? proprio;
    const escolhe = selectionMode !== "none";
    const m = medidasDaEtiqueta(t, size);
    const escolher = (it) => {
        if (!escolhe || it.disabled)
            return;
        const ja = escolhidos.includes(it.id);
        const novo = selectionMode === "multiple"
            ? (ja ? escolhidos.filter((x) => x !== it.id) : [...escolhidos, it.id])
            : (ja ? [] : [it.id]);
        if (selectedKeys === undefined)
            setProprio(novo);
        onSelectionChange?.(novo);
    };
    // As áreas de toque chegam aos 44: a parte que escolhe, pela altura da linha; o X (12), pelos
    // quatro lados — e o pedaço do X que cai em cima do texto fica com o texto (`principal`, acima).
    const folgaDoTexto = Math.max(0, (t.size.targetMin - m.linha) / 2);
    const folgaDoX = (t.size.targetMin - t.size.space3) / 2;
    const fundo = variant === "surface" ? t.color.card : t.color.secondary;
    const letra = variant === "surface" ? t.color.cardForeground : t.color.secondaryForeground;
    return (_jsxs(View, { testID: testID, style: [s.grupo, style], children: [!labelHidden && _jsx(Label, { children: label }), _jsx(View, { accessibilityRole: "list", accessibilityLabel: typeof label === "string" ? label : undefined, style: s.lista, children: items.map((it) => {
                    const escolhida = escolhe && escolhidos.includes(it.id);
                    const cor = escolhida ? t.color.primaryEmphasis : letra;
                    const conteudo = (_jsxs(_Fragment, { children: [it.icon != null && _jsx(Icon, { name: it.icon, size: "sm", color: cor, icons: icons }), _jsx(Text, { weight: 500, numberOfLines: 1, style: { fontSize: m.letra, lineHeight: m.linha, color: cor }, children: it.label })] }));
                    const estiloPrincipal = [s.principal, { gap: m.vao }];
                    return (_jsxs(View, { testID: testID ? `${testID}-${it.id}` : undefined, style: [
                            s.etiqueta,
                            { gap: m.vao, paddingVertical: m.vertical, paddingHorizontal: m.lados,
                                // O fundo existe desde a montagem; escolher só troca a cor (a regra do raio no Android).
                                backgroundColor: escolhida ? misturar(t.color.primary, t.color.secondary, 0.1) : fundo },
                            it.disabled && s.desabilitado,
                        ], children: [escolhe ? (_jsx(Pressable, { onPress: it.disabled ? undefined : () => escolher(it), disabled: it.disabled, accessibilityRole: "button", accessibilityLabel: textoDaEtiqueta(it) || undefined, ...estadoAcessivel({ selected: escolhida, disabled: !!it.disabled }), hitSlop: { top: folgaDoTexto, bottom: folgaDoTexto, left: m.lados, right: onRemove ? 0 : m.lados }, testID: testID ? `${testID}-${it.id}-escolher` : undefined, style: estiloPrincipal, children: conteudo })) : (_jsx(View, { style: estiloPrincipal, children: conteudo })), onRemove && (_jsx(Pressable, { onPress: it.disabled ? undefined : () => onRemove([it.id]), disabled: it.disabled, accessibilityRole: "button", accessibilityLabel: `${strings.fileRemove} ${textoDaEtiqueta(it)}`.trim(), ...estadoAcessivel({ disabled: !!it.disabled }), hitSlop: folgaDoX, testID: testID ? `${testID}-${it.id}-remover` : undefined, style: s.remover, children: _jsx(Icon, { name: "x", weight: "bold", size: t.size.space3, color: cor, icons: icons }) }))] }, it.id));
                }) }), description != null && (typeof description === "string"
                ? _jsx(Text, { size: "xs", tone: "muted", children: description }) : description), errorMessage != null && (typeof errorMessage === "string"
                ? _jsx(Text, { size: "xs", tone: "danger", children: errorMessage }) : errorMessage)] }));
}
