# ADR-0051 — O espaçamento dos primitivos de layout tem três degraus

- **Data:** 24/09/2026
- **Estado:** aceita · **afrouxa a regra da ficha do `Stack`** ("sem prop de espaçamento, de propósito")
- **Autoria:** decisão do Victor, escolhendo entre três saídas: três degraus, qualquer degrau da
  escala, ou continuar sem `gap`.
- **Obriga:** `Stack`, `Cluster` e `Grid` em `packages/react/src/markup.tsx` · as classes
  `*-gap-tight` e `*-gap-loose` do `packages/core/src/aurea.css` · as fichas dos três ·
  `tests/unit/consumidores-lote2.test.tsx`

## A regra

> **`gap` aceita três valores:** `tight` (`--space-2`, 8) · `normal` (o de cada peça: 16 no
> `Stack` e no `Grid`, 12 no `Cluster`) · `loose` (`--space-6`, 24). **Nenhum outro.**

## Por que mudou

A ficha do `Stack` dizia: *"um primitivo de layout que aceita qualquer espaçamento é como um
sistema deixa de ter espaçamento"*. A frase continua certa, e é por isso que a saída não foi a
escala inteira. O que mudou foi a evidência, a B-01 do documento dos consumidores:

- **180 `style={{}}` e 122 `<div>`** num app, quase todos `display:flex` + `gap`;
- **uma nota embaixo de um valor**, numa célula de tabela: com 16 de vão ela parece solta;
- **uma grade de filtros** que precisava de vão menor que 16 e colunas mais estreitas.

Sem prop, cada um desses vira `style` na mão — e aí o sistema tem **qualquer** espaçamento, só que
escondido. Três degraus devolvem o controle sem abrir a escala.

## O que ficou de fora, declarado

- **`Responsive`.** A camada responsiva gera uma regra por degrau × ponto da escala; três eixos
  novos nos três primitivos a multiplicariam sem nenhum caso medido pedindo.
- **`direction` no `Stack`.** Um `Stack` em linha é um `Cluster`; dois nomes para a mesma coisa.
- **O nativo.** O `Stack` e o `Cluster` do `@aurea-uds/native` continuam sem `gap` (o teste
  `native-lote1` cobra isso). Levar a mesma regra para lá é um passo à parte, e pede um "pode".
