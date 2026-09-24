# §9 — inventário da Radix Themes (a camada ESTILIZADA)

**Gerado por** `node audit/activity-2/inventory-radix-themes.mjs` → [`INVENTORY-RADIX-THEMES.json`](INVENTORY-RADIX-THEMES.json).
**Medido em** 22/08/2026 · `@radix-ui/themes` **3.3.0** · **MIT**.

---

## 0. Por que é fonte separada da `radix` que já foi inventariada

A [`06-INVENTARIO-RADIX.md`](06-INVENTARIO-RADIX.md) mediu os **primitives**: comportamento,
teclado, ARIA, e **nenhuma aparência**. Esta é a camada que a Radix publica **com pele**, e é ela
que tem `variant`, `size`, `color` e `radius`.

Mesmo dono, perguntas diferentes. Tratar as duas como uma só perderia exatamente o eixo que a
Aurea precisa comparar — e teria produzido a conclusão falsa de que *"a Radix não tem variantes"*,
que é verdade sobre os primitives e mentira sobre o produto.

## 1. Método

Os `*.props.d.ts` do pacote declaram cada eixo com **valores, default e `responsive`** — é
declaração, não inferência.

Uma armadilha, e ela é a de sempre: vários componentes **reexportam** a definição de um
`_internal` compartilhado. O `Button` vem de `base-button.props`, e o arquivo dele tem uma linha
só. Um extrator que lesse apenas `button.props.d.ts` reportaria *o botão da Radix não tem eixo
nenhum*. O extrator segue o reexport — quinta vez nesta auditoria que essa precaução era
necessária, e a segunda em que ela veio antes do erro em vez de depois.

## 2. O que a Radix Themes é

| | |
|---:|---|
| **50** | componentes |
| **48** | com eixo declarado |
| **47** | com pelo menos um eixo **responsivo** |

Os eixos: `accentColor`, `align`, `alignContent`, `appearance`, `as`, `clip`, `color`,
`direction`, `display`, `flow`, `grayColor`, `justify`, `justifyItems`, `layout`, `orientation`,
`p`, `panelBackground`, `pb`, `pl`, `pr`, `pt`, `px`, `py`, `radius`, `resize`, `scaling`,
`scrollbars`, `side`, `size`, `trim`, `underline`, `variant`, `weight`, `wrap`.

O botão, medido: `variant` com 6 valores (`classic`, `solid`, `soft`, `surface`, `outline`,
`ghost`), `size` com 4, `radius` com 5 e `color` com **26**.

### Convergência independente com o `G-API-01`

`appearance` está na lista de eixos da Radix Themes. A Aurea chegou ao mesmo nome pelo inventário
da `mui`, decompondo o enum achatado do botão — duas fontes, dois caminhos, o mesmo eixo. É a
melhor evidência que este tipo de auditoria produz: quando duas medições independentes convergem,
o eixo não é invenção nossa.

## 3. O achado: **47 de 50 contra 0**

`responsive: true` num eixo quer dizer que ele aceita **objeto por breakpoint**:

```tsx
<Button size={{initial: "1", md: "3"}} />
```

A Aurea tem **zero**. Medido por três caminhos independentes, porque um número desses merece:

| medição | resultado |
|---|---|
| fichas do registry que mencionam `responsive` | **0** de 90 |
| fonte React que aceita objeto de breakpoint | **0** ocorrências |
| props `size`/`orientation` no `api-surface.json` que não sejam união literal | **0** |

Não é detalhe. É um **grau de liberdade inteiro** que o consumidor da Radix Themes tem e o da
Aurea não: ajustar a escala por largura sem escrever CSS nem duplicar o componente. Virou
[`G-AXIS-04`](03-GAPS.md).

E ele **não** é o mesmo que o `G-AXIS-02`. Aquele é sobre o `responsive` do `Field`, que na
referência depende de uma **container query com contêiner nomeado** — reage ao tamanho do
CONTAINER. Este reage ao tamanho da JANELA, por prop. São duas capacidades diferentes com o mesmo
nome, que é precisamente o que o §15 manda não confundir.

## 4. Limites, declarados

- **Teclado e ARIA não estão medidos aqui, e é de propósito:** eles vêm dos primitives, que já
  têm inventário próprio na [`06`](06-INVENTARIO-RADIX.md). Repetir seria contar duas vezes.
- **Composições:** `INCONCLUSIVO`. O pacote publicado não traz exemplos.
- **A `untitledui` do npm é só a CLI**, conferido em 22/08/2026: `bin: {untitledui: …}` e nenhum
  componente. Os componentes da Untitled UI não são publicados como pacote, então a camada web
  dela não entra por este método — fica pendente, e agora com o motivo certo escrito.
