import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — o **gráfico**, e ele é o único componente deste pacote cuja GEOMETRIA é nossa.
//
// [ADR-0041](../../decisions/0041-o-motor-de-grafico-do-nativo-e-nosso-sobre-react-native-svg.md),
// autorizada pelo Victor em 09/09/2026 (*"faz o Chart então"*). Leia-a antes de mexer aqui: ela
// tem as quatro bibliotecas medidas no registro, a razão de cada recusa, e o ESCOPO — que é o que
// impede este arquivo de virar um projeto.
//
// ── POR QUE ELE É DIFERENTE DE TODOS OS OUTROS ───────────────────────────────────────────────
//
// Os 44 componentes anteriores traduziram pele. Este não tem pele para traduzir:
//
//     packages/react/src/chart.tsx   ->   79 linhas, e NENHUMA delas desenha
//
// A ficha da web diz por quê, em uma frase: *"Aurea does not wrap the chart types: the engine
// draws, this component holds."* Lá o `recharts` faz escala, eixo, curva e interação. **Aqui não
// há motor**, então a conta de escala, a régua do eixo e o caminho da curva passam a ser código
// deste repositório. É o custo aceito de olhos abertos na ADR-0041.
//
// ── AS QUATRO COISAS DA WEB QUE NÃO ATRAVESSAM, e o que ficou no lugar ───────────────────────
//
//   `role="group"`          -> **não mapeia.** Medido no `fromRole()` do Android: cai em
//                              `else -> null`, como `dialog` (Lote 5) e `table` (Lote 6). Terceira
//                              vez. Aqui é `accessible` + `accessibilityLabel`, que é o que
//                              agrupa de verdade no RN
//   o teclado do motor      -> a ficha delega a acessibilidade a ele: *"navegação por seta entre
//                              os pontos, ligada por padrão"*. **Não há motor e não há setas.**
//                              No lugar: os valores saem em TEXTO (`showValues`), que é o padrão
//                              de gráfico acessível
//   o tooltip que segue     -> **não há ponteiro no toque.** A ficha diz que ele *"segue o
//     o ponteiro                ponteiro e não é focável"* — as duas metades caem. No lugar: o
//                              toque SELECIONA um ponto, que é a versão alcançável
//   altura por CSS          -> a web recusa uma prop de altura de propósito (*"dimensão não é
//                              número; a caixa mede pelo CSS"*). **Aqui não há CSS**, e a raiz do
//                              RN não tem folha para receber classe. Então `height` existe, com o
//                              mesmo padrão do `--chart-h` de lá: 220
//
// ── E UMA MEDIÇÃO DE COR QUE DECIDE UMA PROP ─────────────────────────────────────────────────
//
// A paleta `--chart-1..5` é **o mesmo azul do claro ao escuro** — rampa de MAGNITUDE, não conjunto
// de IDENTIDADE. Rodado o validador de paleta sobre os cinco, no escuro:
//
//     [FAIL] visão normal   pior par adjacente ΔE 5.9  (piso: 15)
//     [FAIL] daltonismo     pior par adjacente ΔE 5.2  (piso: 8)
//
// ⚠ **E a acusação precisou ser duvidada, porque quase saiu errada:** o uso real pula degraus. O
// catálogo da web usa `--chart-2` e `--chart-4`, e esse par mede `ΔE 10.6` no daltonismo (PASSA) e
// `13.7` na visão normal — abaixo do piso, mas perto. **A web não está quebrada**, porque ela tem
// legenda sempre, e legenda é exatamente o alívio que a regra prescreve.
//
// **A consequência aqui é a decisão 3 da ADR: com duas ou mais séries a legenda é OBRIGATÓRIA.**
// Não é conselho — é o que impede a cor de ser o único separador numa paleta que não separa
// sozinha, numa tela onde a marca é mais fina que na web.
import * as React from "react";
import { Pressable, View } from "react-native";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { criarFolha } from "./estilos.js";
import { Text } from "./text.js";
import { useAureaStrings, useAureaTokens } from "./theme.js";
/** A altura padrão, igual ao `--chart-h,220px` do `aurea.css:1329`. */
const ALTURA = 220;
/** Respiro do desenho: espaço para os números do eixo Y à esquerda e os rótulos embaixo. */
const CALHA = { esquerda: 44, direita: 8, topo: 8, baixo: 24 };
const folha = criarFolha((t) => ({
    caixa: { gap: t.size.space2 },
    legenda: {
        flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
        gap: t.size.space1, columnGap: t.size.space4,
    },
    chave: { flexDirection: "row", alignItems: "center", gap: t.size.space2 },
    amostra: {
        flexGrow: 0, flexShrink: 0,
        width: 9, height: 9, borderRadius: t.size.radiusSm,
    },
    valores: { gap: t.size.space1 },
    linhaDeValor: { flexDirection: "row", alignItems: "center", gap: t.size.space2 },
    nomeDoValor: { flexShrink: 0, maxWidth: "45%" },
    valor: { flex: 1, minWidth: 0 },
    vazio: { height: ALTURA, alignItems: "center", justifyContent: "center" },
}));
/**
 * A ordem padrão da rampa, e ela NÃO é `1,2,3,4,5`.
 *
 * ⚠ Começa pelo par que foi **medido** no validador — `--chart-2` e `--chart-4` —, que é o que o
 * catálogo da web já usa e o único par desta rampa que passa no critério de daltonismo. Degraus
 * vizinhos (`2` e `3`) medem ΔE 5.9 e são indistinguíveis; pular um degrau é o que os separa.
 */
const ORDEM = ["chart2", "chart4", "chart1", "chart5", "chart3"];
/**
 * A régua do eixo Y.
 *
 * ⚠ **Ela divide o intervalo em partes IGUAIS e não procura "números redondos"**, e isso está dito
 * em vez de escondido: um eixo de 0 a 97 com quatro marcas sai `0 · 24,25 · 48,5 · 72,75 · 97`, e
 * não `0 · 25 · 50 · 75 · 100`. Um algoritmo de *nice numbers* é a melhoria óbvia, e está
 * registrada na ADR-0041 **como melhoria, não como defeito** — o que existe aqui é correto, só
 * não é bonito.
 *
 * O zero entra na escala quando os dados são todos positivos. Isso não é enfeite: **barra que não
 * nasce no zero mente sobre a proporção**, que é o erro mais comum de gráfico de barras.
 */
function regua(valores, marcas) {
    const cru = valores.filter((v) => Number.isFinite(v));
    if (cru.length === 0)
        return { min: 0, max: 1, passos: [0, 1] };
    let min = Math.min(...cru);
    let max = Math.max(...cru);
    if (min > 0)
        min = 0;
    if (max < 0)
        max = 0;
    // Série constante: um intervalo de zero dividiria por zero e sumiria com o traço.
    if (min === max) {
        max = min + 1;
    }
    const n = Math.max(1, marcas);
    const passos = Array.from({ length: n + 1 }, (_, i) => min + ((max - min) * i) / n);
    return { min, max, passos };
}
/** Formata um número sem depender de locale — o app manda o dele por `formatValue`. */
const padrao = (v) => Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
export function Chart({ labels, series, label, mark = "line", height = ALTURA, yTicks = 4, formatValue = padrao, showLegend, showValues = true, onSelect, selectedIndex, style, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    const [tocado, setTocado] = React.useState(null);
    const [larguraMedida, setLargura] = React.useState(0);
    const nome = label ?? strings.chartLabel;
    const selecionado = selectedIndex ?? tocado;
    // ⚠ A legenda NÃO desliga com duas ou mais séries — decisão 3 da ADR-0041.
    const comLegenda = series.length >= 2 ? true : (showLegend ?? false);
    const cores = React.useMemo(() => series.map((serie, i) => serie.color ?? t.color[ORDEM[i % ORDEM.length]] ?? t.color.primary), [series, t.color]);
    const todos = React.useMemo(() => series.flatMap((serie) => serie.data.filter((v) => v != null)), [series]);
    const { min, max, passos } = React.useMemo(() => regua(todos, yTicks), [todos, yTicks]);
    if (labels.length === 0 || series.length === 0) {
        return (_jsx(View, { style: [s.vazio, style], testID: testID, children: _jsx(Text, { size: "sm", tone: "muted", children: strings.dataEmpty }) }));
    }
    const largura = larguraMedida;
    const areaL = Math.max(0, largura - CALHA.esquerda - CALHA.direita);
    const areaA = Math.max(0, height - CALHA.topo - CALHA.baixo);
    // Cada rótulo ganha uma FAIXA de largura igual, e o ponto fica no meio dela. É o que alinha a
    // linha com a barra quando os dois aparecem no mesmo gráfico.
    const faixa = labels.length > 0 ? areaL / labels.length : 0;
    const x = (i) => CALHA.esquerda + faixa * i + faixa / 2;
    const y = (v) => CALHA.topo + areaA - ((v - min) / (max - min)) * areaA;
    const caminho = (dados, fechar) => {
        let d = "";
        let aberto = false;
        dados.forEach((v, i) => {
            if (v == null) {
                // ⚠ Buraco PULA — não vira zero e não liga os vizinhos por cima dele. Ligar por cima
                // inventaria um dado que não existe, que é a mentira mais fácil de um gráfico de linha.
                if (aberto && fechar)
                    d += ` L ${x(i - 1)} ${y(min)} Z`;
                aberto = false;
                return;
            }
            if (!aberto) {
                d += `${fechar ? ` M ${x(i)} ${y(min)} L` : " M"} ${x(i)} ${y(v)}`;
                aberto = true;
            }
            else {
                d += ` L ${x(i)} ${y(v)}`;
            }
        });
        if (aberto && fechar) {
            const ultimo = dados.length - 1 - [...dados].reverse().findIndex((v) => v != null);
            d += ` L ${x(ultimo)} ${y(min)} Z`;
        }
        return d.trim();
    };
    const tocar = (i) => { setTocado(i); onSelect?.(i); };
    return (_jsxs(View, { style: [s.caixa, style], testID: testID, children: [_jsxs(View, { onLayout: (e) => setLargura(e.nativeEvent.layout.width), style: { height }, children: [largura > 0 ? (_jsx(View, { accessible: true, accessibilityLabel: nome, children: _jsxs(Svg, { width: largura, height: height, testID: testID ? `${testID}-svg` : undefined, children: [_jsx(G, { children: passos.map((v, i) => (_jsx(Line, { x1: CALHA.esquerda, y1: y(v), x2: largura - CALHA.direita, y2: y(v), stroke: t.color.border, strokeWidth: t.size.borderWidth }, `g${i}`))) }), _jsxs(G, { children: [passos.map((v, i) => (_jsx(SvgText, { x: CALHA.esquerda - 6, y: y(v) + 4, textAnchor: "end", fontSize: t.size.textSm, fontFamily: t.font.ui[400], fill: t.color.mutedForeground, children: formatValue(v) }, `ty${i}`))), labels.map((rotulo, i) => (_jsx(SvgText, { x: x(i), y: height - 6, textAnchor: "middle", fontSize: t.size.textSm, fontFamily: t.font.ui[400], fill: t.color.mutedForeground, children: rotulo }, `tx${i}`)))] }), series.map((serie, n) => {
                                    const marca = serie.mark ?? mark;
                                    const cor = cores[n];
                                    if (marca === "bar") {
                                        // As barras de várias séries dividem a faixa, com 2dp de respiro entre elas — o
                                        // vão é o que impede duas cores vizinhas de virarem um bloco só.
                                        const barras = series.filter((z) => (z.mark ?? mark) === "bar").length;
                                        const ordem = series.filter((z) => (z.mark ?? mark) === "bar").indexOf(serie);
                                        const larguraBarra = Math.max(1, (faixa * 0.7) / barras - 2);
                                        return (_jsx(G, { children: serie.data.map((v, i) => v == null ? null : (_jsx(Rect, { x: x(i) - (faixa * 0.7) / 2 + ordem * (larguraBarra + 2), y: Math.min(y(v), y(0)), width: larguraBarra, height: Math.max(1, Math.abs(y(v) - y(0))), 
                                                // 4dp arredondado na ponta do dado, ancorado na base — a base fica reta.
                                                rx: 4, fill: cor }, i))) }, n));
                                    }
                                    return (_jsxs(G, { children: [marca === "area" ? (_jsx(Path, { d: caminho(serie.data, true), fill: cor, fillOpacity: 0.15 })) : null, _jsx(Path, { d: caminho(serie.data, false), stroke: cor, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" })] }, n));
                                }), selecionado != null && selecionado >= 0 && selecionado < labels.length ? (_jsxs(G, { children: [_jsx(Line, { x1: x(selecionado), y1: CALHA.topo, x2: x(selecionado), y2: CALHA.topo + areaA, stroke: t.color.borderStrong, strokeWidth: t.size.borderWidth }), series.map((serie, n) => {
                                            const v = serie.data[selecionado];
                                            return v == null ? null : (_jsx(Circle, { cx: x(selecionado), cy: y(v), r: 4, fill: cores[n], stroke: t.color.card, strokeWidth: 2 }, n));
                                        })] })) : null] }) })) : null, largura > 0 ? (_jsx(View, { style: { position: "absolute", left: CALHA.esquerda, top: CALHA.topo,
                            width: areaL, height: areaA, flexDirection: "row" }, children: labels.map((rotulo, i) => (_jsx(Pressable, { onPress: () => tocar(i), accessibilityRole: "button", accessibilityState: { selected: selecionado === i }, accessibilityLabel: [
                                rotulo,
                                ...series.map((serie) => {
                                    const v = serie.data[i];
                                    return v == null ? null : `${serie.name}: ${formatValue(v)}`;
                                }).filter(Boolean),
                            ].join(", "), style: { flex: 1 }, testID: testID ? `${testID}-ponto-${i}` : undefined }, i))) })) : null] }), comLegenda ? _jsx(ChartLegend, { series: series, colors: cores }) : null, showValues && selecionado != null && selecionado >= 0 && selecionado < labels.length ? (_jsxs(View, { style: s.valores, children: [_jsx(Text, { size: "sm", weight: 600, children: labels[selecionado] }), series.map((serie, n) => {
                        const v = serie.data[selecionado];
                        return v == null ? null : (_jsxs(View, { style: s.linhaDeValor, children: [_jsx(View, { style: [s.amostra, { backgroundColor: cores[n] }] }), _jsx(Text, { size: "sm", tone: "muted", style: s.nomeDoValor, children: serie.name }), _jsx(Text, { size: "sm", style: s.valor, children: formatValue(v) })] }, n));
                    })] })) : null] }));
}
/**
 * Qual cor é qual série.
 *
 * ⚠ **O nome é TEXTO, sempre** — a cor nunca é a única coisa que identifica uma série. É a regra
 * da ficha da web, e aqui ela pesa mais: a paleta da Aurea é uma rampa de um azul só, e a medição
 * no topo deste arquivo mostra que duas séries vizinhas nela são indistinguíveis.
 *
 * `accessibilityRole="list"` — um dos poucos papéis desta família que o RN mapeia de verdade.
 */
export function ChartLegend({ series, colors, style, testID }) {
    const t = useAureaTokens();
    const s = folha(t);
    return (_jsx(View, { accessibilityRole: "list", style: [s.legenda, style], testID: testID, children: series.map((serie, n) => (_jsxs(View, { accessible: true, accessibilityLabel: serie.name, style: s.chave, children: [_jsx(View, { style: [s.amostra, {
                            backgroundColor: serie.color ?? colors?.[n]
                                ?? t.color[ORDEM[n % ORDEM.length]] ?? t.color.primary,
                        }] }), _jsx(Text, { size: "xs", tone: "muted", children: serie.name })] }, n))) }));
}
