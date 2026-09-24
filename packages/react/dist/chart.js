"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Lote 3 do BUILDING.md (01/08/2026). SUBPATH PRÓPRIO, como ./data-grid e ./qrcode: o único
// componente que precisa do `recharts`, que é peer OPCIONAL. Se morasse em data-display.tsx,
// quem importa Table baixaria um motor de gráfico inteiro — que é o achado A5 visto de perto.
//
// NÃO ESCREVEMOS MOTOR DE GRÁFICO. Duas das quatro referências (shadcn/ui e Untitled UI React)
// envelopam o MESMO motor, o Recharts, e nenhuma das quatro desenha eixo à mão. O que é nosso
// aqui é só a pele: a caixa, o tooltip e a legenda. Escala, eixo, curva e interação são dele.
//
// O QUE FICOU DE FORA, e por quê (BUILDING.md passo 5 — escopo menor que o da referência):
//   • o `ChartConfig` do shadcn (mapa dataKey → {label, color, theme}). MEDIDO em 01/08/2026: o
//     payload que o Recharts entrega ao `content` já traz `name` (do prop `name` da série) e
//     `color` resolvido. O objeto de configuração é indireção para reconstruir o que já chega.
//     E o eixo `theme:{light,dark}` não existe aqui: `var(--chart-2)` já troca com o data-theme.
//   • o par `ChartTooltip`/`ChartTooltipContent`. No Recharts 2 o filho tinha de ser o
//     componente DELES, o que forçava o shadcn a reexportar o primitivo e pôr a pele no
//     `content`. MEDIDO no 3.10.1: um componente NOSSO como filho é reconhecido. Então é uma
//     peça só, não duas.
//   • prop de altura. Dimensão não é número (check 23): a caixa mede pelo CSS (`.chart`), e
//     quem quer outra altura escreve uma classe. Sem prop, sem pixel cru no consumidor.
import React from "react";
import { ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cx, useAureaStrings } from "./internal.js";
export function Chart({ children, label, className }) {
    const s = useAureaStrings();
    const nome = label ?? s.chartLabel;
    // O nome vai para os DOIS: o grupo (que também abriga legenda e tooltip, que ficam FORA do
    // <svg>) e o desenho. Medido em 01/08/2026: o motor emite `<title></title>` vazio, e o <svg>
    // é role="application" com tabindex=0 — quem chega nele pelo Tab ouviria "application" e mais
    // nada. `title` é prop do gráfico do motor, não da caixa, então o repasse é aqui. Se o
    // consumidor já passou o seu, o dele vence.
    const desenho = React.isValidElement(children) && children.props.title == null
        ? React.cloneElement(children, { title: nome }) : children;
    return _jsx("div", { className: cx("chart", className), role: "group", "aria-label": nome, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: desenho }) });
}
// ChartTooltip: reusa `.tooltip`, a mesma superfície do Tooltip da Aurea — o valor sob o cursor
// é um rótulo, não um card. O quadradinho de cor vem do `color` do payload (é DADO: a cor da
// série), então é o único `style` inline do arquivo.
// ponytail: sem formatador de valor. `tickFormatter` do eixo já é do motor, e nenhum consumidor
// pediu o do tooltip — entra quando pedir.
export function ChartTooltip(props) {
    return _jsx(Tooltip, { cursor: { className: "chart-cursor" }, ...props, content: ({ active, payload, label }) => {
            if (!active || !payload?.length)
                return null;
            return _jsxs("div", { className: "tooltip chart-tooltip", children: [label != null && label !== "" && _jsx("strong", { children: String(label) }), payload.map((p, i) => _jsxs("span", { className: "chart-key", children: [_jsx("i", { style: { background: p.color } }), p.name, _jsx("b", { children: String(p.value) })] }, p.dataKey ?? i))] });
        } });
}
// ChartLegend: lista de séries. `value` do payload é o nome legível da série (o prop `name`),
// não o valor do dado — é o nome do campo no Recharts e não dá para renomear.
export function ChartLegend(props) {
    return _jsx(Legend, { verticalAlign: "bottom", ...props, content: ({ payload }) => _jsx("ul", { className: "chart-legend", children: (payload ?? []).map((p, i) => _jsxs("li", { className: "chart-key", children: [_jsx("i", { style: { background: p.color } }), p.value] }, p.value ?? i)) }) });
}
