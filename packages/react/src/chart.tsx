"use client";
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
import React, {type ReactElement} from "react";
import {ResponsiveContainer, Tooltip, Legend, type LegendProps} from "recharts";
import {cx, useAureaStrings} from "./internal.js";

type Serie = {name?: string | number; value?: unknown; color?: string; dataKey?: string | number};

// Chart: a caixa. Dá ao Recharts o pai com altura definida que o ResponsiveContainer exige, e
// dá ao leitor de tela um nome para o conjunto — o <svg> interno é role="application" (é assim
// que o motor liga a navegação por seta entre os pontos) e um `application` sem nome à volta
// não diz o que ele está lendo. `group` e não `region`: gráfico não é marco de página, e três
// deles numa tela virariam três landmarks disputando o mesmo nome.
export interface ChartProps {children: ReactElement; label?: string; className?: string}
export function Chart({children, label, className}: ChartProps) {
  const s = useAureaStrings();
  const nome = label ?? s.chartLabel;
  // O nome vai para os DOIS: o grupo (que também abriga legenda e tooltip, que ficam FORA do
  // <svg>) e o desenho. Medido em 01/08/2026: o motor emite `<title></title>` vazio, e o <svg>
  // é role="application" com tabindex=0 — quem chega nele pelo Tab ouviria "application" e mais
  // nada. `title` é prop do gráfico do motor, não da caixa, então o repasse é aqui. Se o
  // consumidor já passou o seu, o dele vence.
  const desenho = React.isValidElement<{title?: string}>(children) && children.props.title == null
    ? React.cloneElement(children, {title: nome}) : children;
  return <div className={cx("chart", className)} role="group" aria-label={nome}>
    <ResponsiveContainer width="100%" height="100%">{desenho}</ResponsiveContainer>
  </div>;
}

// ChartTooltip: reusa `.tooltip`, a mesma superfície do Tooltip da Aurea — o valor sob o cursor
// é um rótulo, não um card. O quadradinho de cor vem do `color` do payload (é DADO: a cor da
// série), então é o único `style` inline do arquivo.
// ponytail: sem formatador de valor. `tickFormatter` do eixo já é do motor, e nenhum consumidor
// pediu o do tooltip — entra quando pedir.
export function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return <Tooltip
    cursor={{className: "chart-cursor"}}
    {...props}
    content={({active, payload, label}) => {
      if (!active || !payload?.length) return null;
      return <div className="tooltip chart-tooltip">
        {label != null && label !== "" && <strong>{String(label)}</strong>}
        {(payload as readonly Serie[]).map((p, i) => <span key={p.dataKey ?? i} className="chart-key">
          <i style={{background: p.color}}/>{p.name}<b>{String(p.value)}</b>
        </span>)}
      </div>;
    }}/>;
}

// ChartLegend: lista de séries. `value` do payload é o nome legível da série (o prop `name`),
// não o valor do dado — é o nome do campo no Recharts e não dá para renomear.
export function ChartLegend(props: LegendProps) {
  return <Legend
    verticalAlign="bottom"
    {...props}
    content={({payload}) => <ul className="chart-legend">
      {(payload ?? []).map((p, i) => <li key={p.value ?? i} className="chart-key">
        <i style={{background: p.color}}/>{p.value}
      </li>)}
    </ul>}/>;
}
