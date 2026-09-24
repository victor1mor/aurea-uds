# ADR-0026 — Marcação pura é de servidor, e mora num módulo sem diretiva

- **Data:** 15/08/2026
- **Estado:** aceita
- **Fecha:** o item **O1** do [`PLANO-1.0.md`](../docs/PLANO-1.0.md) §19
- **Autoria:** medição do Opus (`node scripts/measure-boundary.mjs`), sob a autorização da Parte O

## Contexto

A Parte A (06/08/2026) deu ao pacote React uma fronteira servidor/cliente e a gateou pelo check
26. O rodapé dela registrou uma suspeita: alguns módulos seriam de cliente **por causa dos nossos
hooks**, não por estado próprio. O item O1 mandou **medir primeiro** e só depois decidir,
admitindo em voz alta que podia terminar em "não vale".

Não terminou. E a medição corrigiu o enunciado em três pontos.

## O que a medição devolveu (15/08/2026)

O comando é `node scripts/measure-boundary.mjs`. Ele classifica cada export do pacote por
**hook**, **manipulador preso em JSX**, **motor de terceiro** e **contágio** (usar alguém que
precisa), e depois pesa o **fecho transitivo** de cada módulo no `dist`.

### O número que decidiu

| se o consumidor importa… | módulos que embarcam | peso |
|---|---:|---:|
| `Card` / `Stack` / `Cluster` / `Grid` (`layout.js`) | 9 | **118,5 KB** |
| `KPI` / `DataList` / `Timeline` / `Prose` (`data-display.js`) | 10 | **123,5 KB** |
| `Topbar` (`navigation.js`) | 8 | **112,4 KB** |
| os seis controles (`inputs.js`) | 6 | **87,2 KB** |
| `MediaPlayerShell` (`media.js`) | 6 | **70,1 KB** |
| **`Accordion` (`disclosure.js`)** | **1** | **0,3 KB** |

`Card` é uma `<div>` com uma classe. Num framework de RSC a diretiva contamina o **módulo
inteiro** e o fecho dele, então importar `Card` embarcava nove módulos de JavaScript.

**A última linha é a prova de que isso não era inevitável, e ela já estava no repositório:** o
`Accordion` é da mesma natureza e custa **0,3 KB**, porque o `disclosure.tsx` nunca teve a
diretiva. A única diferença entre os dois era o arquivo em que cada um caiu na Fase 9.

### Três correções ao enunciado do próprio item

1. **`chart` e `qrcode` não são de cliente "por causa dos nossos hooks".** Medido: os três
   exports de `chart` usam `recharts` (`ResponsiveContainer`, `Tooltip`, `Legend`) e o `QRCode`
   usa `encodeQR`. São **zero** puros nos dois. O mesmo vale para `calendar` (`DayPicker`).
2. **O item diz que `Table` "chega como cliente sem precisar".** Não é verdade: `Table` chama
   `useAureaStrings` para o nome acessível da região. Os outros quatro que ele nomeia — `Card`,
   `Stack`, `Grid`, `Cluster` — estavam certos.
3. **O item olhou para quatro módulos e o problema estava em nove.** `inputs` sozinho tinha
   **seis** componentes puros, mais que qualquer um dos acusados.

**Total: 22 de 105 exports não precisavam de cliente por nada que faziam** (mais o `Accordion`,
que já estava certo).

### Uma medição errada foi corrigida antes de decidir

A primeira versão do script adivinhava o nome do motor a partir do caminho do pacote
(`react-day-picker` → `reactdaypicker`) e por isso deu `Calendar` e `ChartLegend` como puros —
o que teria mandado para o servidor componentes que o navegador precisa montar. A detecção passou
a ser pelo **identificador importado**, e os dois voltaram a ser cliente. Fica registrado porque
o erro estava do lado perigoso: medição frouxa que **autoriza** a mudança errada.

## Decisão

**Os 22 componentes de marcação pura moram em `packages/react/src/markup.tsx`, que não tem
`"use client"`.** O `index.tsx` os exporta **explicitamente** de lá, e cada módulo de categoria os
**reexporta**.

Resultado medido: o fecho de `markup.js` é de **2 módulos e 27,3 KB** — e como não tem a
diretiva, pelo barril esses componentes renderizam no servidor e não mandam JavaScript nenhum.

### Por que um módulo novo, e não um por categoria

O precedente é o **`Kbd`**, e já estava escrito no [`MAP.md`](../docs/MAP.md): ele morava no
`internal.tsx` **por dependência** e a casa **pública** dele era `/data-display`, que o
reexportava. Aqui é a mesma regra em escala — **o arquivo é onde a coisa mora; a categoria é o que
a ficha declara**, e as duas não precisam coincidir. A taxonomia do registry não muda e nenhuma
ficha muda de categoria; muda só o `source.react` das 22, que passa a apontar para onde o código
realmente está (é o que o check 28 cobra).

### A API não quebra

`@aurea-uds/react/layout` continua entregando `Card`, e todos os 22 continuam saindo do barril —
conferido em runtime, 22 de 22. Nenhum consumidor precisa mudar uma linha.

## Consequências

- **Quem renderiza no servidor por SEO para de pagar por isso.** É o caso que abriu o item.
- **A regra para componente novo:** se não chama hook, não prende manipulador e não toca motor,
  ele nasce no `markup.tsx`. Na dúvida, **não** entra — cliente a mais é lento, servidor a mais é
  quebrado.
- **O check 35 protege o ganho**, e o que ele pega é sutil: tirar um nome da linha explícita do
  `index.tsx` **não quebra nada** — o `tsc` fica verde, o componente continua existindo (vem do
  módulo de categoria) e nenhum teste reprova. Ele só volta a ser cliente, e os 118,5 KB voltam
  junto. Foi provado contra esse defeito exato, e a explicação escrita antes da prova **estava
  errada** (dizia que o nome viraria `undefined` por ambiguidade de `export *`); corrigiu-se o
  texto, não a medição.
- ~~**Limite declarado, e não é pequeno:** pelo **subpath da categoria**
  (`@aurea-uds/react/layout`) o `Card` continua vindo de um módulo com a diretiva~~ — **FECHADO em
  16/08/2026** (ver adendo abaixo).
- **`chart`, `qrcode`, `calendar` e `graph` seguem 100% cliente**, e agora está medido por quê:
  o motor é deles, não a nossa vizinhança. Não há o que separar ali.

---

## Adendo — 16/08/2026: o limite do subpath fechou, e custou menos do que esta ADR previu

**O que esta ADR errou:** ela dizia que resolver o subpath exigiria "quebrar cada categoria em
**duas entradas públicas** — mudança de fronteira publicada". Não exigiu. A superfície pública não
mudou em nada: continuam o barril e os mesmos **20 subpaths**, com os mesmos nomes e os mesmos
exports (medido: `packages/react/package.json`, campo `exports`). O que
mudou foi um arquivo virar dois, do lado de dentro.

**A forma.** O módulo da categoria virou uma **vitrine sem diretiva**, que só reexporta:

```tsx
// layout.tsx — a vitrine
export * from "./layout-client.js";
export {Card, Stack, Cluster, Grid} from "./markup.js";
```

O código de cliente foi para `layout-client.tsx`, **levando a diretiva junto**. Em oito
categorias: `code`, `data-display`, `feedback`, `identity`, `inputs`, `layout`, `media` e
`navigation`. Não foi mover código — foi `git mv` do arquivo e escrever a vitrine no nome vago.

**A medição, e ela é do empacotador, não do nosso script.** O `apps/proof-server` (Next 16 +
Turbopack) passou a importar `KPI` e `Kbd` de `@aurea-uds/react/data-display` dentro de uma página
de servidor. No payload de RSC:

| estado | o que o payload traz |
|---|---|
| com a diretiva na vitrine (defeito reposto de propósito) | `["$","$L5",null,{"children":"K"}]` — **referência de cliente** |
| vitrine como está agora | `["$","strong",null,{"children":"sem diretiva"}]` — **marcação** |

**A trava:** o **check 26b** reprova módulo COM a diretiva que reexporte do `markup.js` — o
`import` continua permitido, porque o `Field` precisa da identidade de referência dos seis
controles. Provado contra o defeito: escrito antes da correção, acusou os oito módulos, mais uma
reexportação morta de `Kbd` que sobrara no `internal.tsx` desde o item O1.

**O que NÃO mudou, e é o ponto:** nenhum consumidor muda uma linha, nenhuma ficha muda de
categoria. Mudou o `source.react` de **35** fichas, que passou a apontar para o irmão `-client` —
o check 28 reprova se apontar errado.

**Quando isto deixa de servir:** em escala de mil componentes o certo passa a ser um arquivo por
componente, com as vitrines geradas. O princípio é o mesmo — **a diretiva é do arquivo** —, muda a
granularidade.
