import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type AureaChartMark = "line" | "area" | "bar";
export interface AureaSeries {
    /** O nome legível. É o que a legenda mostra e o que o leitor de tela anuncia — nunca a cor. */
    name: string;
    /** Um valor por rótulo do eixo X. Buracos são `null`, e o traço PULA neles em vez de fingir zero. */
    data: readonly (number | null)[];
    /** Sem isto, a ordem padrão da rampa — que começa pelo par MEDIDO (`--chart-2`, `--chart-4`). */
    color?: string;
    /** Sem isto, a marca do gráfico. Misturar (barra + linha) é permitido e é onde a rampa ajuda. */
    mark?: AureaChartMark;
}
export interface ChartProps {
    /** O eixo X, que é CATEGÓRICO — os rótulos saem como estão, sem escala de tempo. */
    labels: readonly string[];
    series: readonly AureaSeries[];
    /** O nome do desenho. Diga o que ele plota, não que ele é um gráfico. */
    label?: string;
    mark?: AureaChartMark;
    /** Altura em dp. O padrão é o `--chart-h` da web. Ver a nota sobre CSS no topo. */
    height?: number;
    /** Quantas marcas o eixo Y ganha. Ver a nota de honestidade em `regua()`. */
    yTicks?: number;
    /** Como um valor vira texto — no eixo, na seleção e na lista. */
    formatValue?: (v: number) => string;
    /**
     * ⚠ **Com duas ou mais séries ela é OBRIGATÓRIA e não desliga** — decisão 3 da ADR-0041, e a
     * medição está no topo deste arquivo. Com UMA série ela não aparece: o nome do gráfico já a
     * identifica, e uma legenda de um item é ruído.
     */
    showLegend?: boolean;
    /**
     * A lista de valores em texto, embaixo do desenho. **É a camada de acessibilidade** que
     * substitui o teclado do motor da web, e por isso o padrão é LIGADO.
     */
    showValues?: boolean;
    /** Avisado quando um ponto é tocado. O índice é o do rótulo. */
    onSelect?: (indice: number) => void;
    /** Ponto aceso sem ninguém tocar — para uma prévia, uma captura, uma tela sem dedo. */
    selectedIndex?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
export declare function Chart({ labels, series, label, mark, height, yTicks, formatValue, showLegend, showValues, onSelect, selectedIndex, style, testID, }: ChartProps): React.JSX.Element;
export interface ChartLegendProps {
    series: readonly AureaSeries[];
    /** As cores já resolvidas. O `Chart` passa as dele; quem montar a legenda à parte passa as suas. */
    colors?: readonly string[];
    style?: StyleProp<ViewStyle>;
    testID?: string;
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
export declare function ChartLegend({ series, colors, style, testID }: ChartLegendProps): React.JSX.Element;
