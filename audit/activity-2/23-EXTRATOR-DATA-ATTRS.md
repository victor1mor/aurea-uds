# O extrator de `data-*` — cinco fontes, cinco réguas, uma medida só

**27/08/2026.** Achado ao começar a **ler as células** de `estados` da matriz do §13, e não por
uma busca por defeitos: a primeira célula lida acusou que faltava à Aurea um estado chamado
`date`.

---

## 1. Como apareceu

A célula `menu·estados` dizia que a `shark-ui` tem o estado `date` e a Aurea não. Um componente
de menu com um estado chamado "date" é implausível o bastante para conferir. No fonte da shark:

```
group-data-[date=open]/trigger-item:bg-accent
```

É **erro de digitação de `state`** no fonte dela. O seletor não casa com nada, nem lá. E chegou
até a matriz como uma inferioridade da Aurea.

A pergunta obrigatória do `CLAUDE.md` — *"quem mais tem esse problema?"* — abriu o resto.

---

## 2. O defeito, medido

As cinco fontes **medidas** preenchiam o campo `estadosData`. Cada uma com o seu regex:

| fonte | regex | o que media |
|---|---|---|
| `shadcn` | `/data-\[([\w-]+)[\]=]/` | **exige o `[`** — só variante Tailwind |
| `kibo` | `/data-\[([\w-]+)[\]=]/` | idem |
| `reui` | `/data-\[?([\w-]+)[\]=]/` | os dois |
| `shark` | `/data-\[?([\w-]+)[\]=\s]/` | os dois |
| `heroui` | `/data-\[?([a-z][a-z-]*)\]?/` | os dois, mais prosa e caminho de arquivo |

**Duas mediam o oposto das outras três, e a matriz comparava os cinco resultados como se fossem
um vocabulário só.** É a armadilha do §15 acontecendo dentro do instrumento: mesmo nome de campo,
medida diferente. `estadosData` da shadcn e `estadosData` da reui nunca significaram a mesma coisa.

### E havia uma distinção real embaixo, que nenhuma das cinco fazia

| | |
|---|---|
| **EMITIDO** | o componente **põe** o atributo no DOM: `data-active={aberto}`, `"data-folder": true` |
| **REAGIDO** | as classes dele **reagem** a um atributo que **outro** põe: `data-[state=open]:bg-x` |

As duas são evidência. Mas não são a mesma afirmação, e a diferença muda o veredito:

- `data-nested` do `dialog` da shark aparece **só como variante**. A shark não emite nada — quem
  emite é o `vaul`, a biblioteca de drawer embaixo. Como "estado que eles têm e a Aurea não", vira
  um gap que não existe.
- `data-entering` da heroui mora **só no CSS publicado** (`.select__popover[data-entering=true]`),
  e o extrator lia só o pacote `@heroui/react`. A metade reagida da fonte inteira era invisível.

---

## 3. A correção

Um módulo, [`data-attrs.mjs`](data-attrs.mjs), usado pelas cinco. Ele devolve três listas:
`emitidos`, `reagidos` e `todos` — e **`estadosData` continua sendo `todos`**, a união, porque
estreitar o campo faria o extrator errar para MENOS, que é a direção proibida.

Quatro formas sintáticas, e **três delas só entraram porque o delta contra o extrator antigo
mostrou nomes sumindo**:

| forma | exemplo | como foi achada |
|---|---|---|
| JSX / objeto | `data-x={v}` · `"data-x": v` | desenhada |
| variante arbitrária | `data-[state=open]:bg-x` | desenhada |
| **variante nua do Tailwind 4** | `data-invalid:border-destructive` | a shark **perdeu** `checked`, `invalid`, `selected`, `focus-visible` |
| **seletor CSS** | `[data-entering=true]` · `[&:not([data-overflow-x])]` | a heroui perdeu `entering`/`exiting`; a shark, `overflow-x`/`overflow-y` |

> **A lição do método:** a primeira versão do extrator "passou" no fixture e mesmo assim perdia
> quatro estados da shark. **Quem achou foi o delta contra o instrumento antigo**, item a item,
> exigindo razão para cada nome que sumiu. Um extrator novo que só se compara consigo mesmo não
> tem como saber o que não imaginou.

### As duas perdas que ficaram, e são certas

| perdido | de onde vinha | por que sai |
|---|---|---|
| `grid-pagination` (reui) | `"path": "data-grid-pagination.tsx"` | **nome de arquivo** |
| `slot-icon-def-` (heroui) | `` `«data-slot-icon-def-1»-${id}` `` | template literal do `useId` |

`entering`/`exiting` da heroui **voltaram** pelo caminho certo, lendo o CSS publicado.

---

## 4. O efeito, medido

```text
                 antes   depois   emitidos  reagidos
shadcn              26       50         28        42
kibo                 3       21         11        14
reui                79      105         96        45
shark               41       65         21        60
heroui              31       55         28        53
```

`shadcn` e `kibo` **dobraram**: mediam só variante, e variante é a metade que não emite. A
`heroui` saiu de **0 reagidos** — e 0 contra 42 da shadcn já era implausível — para 53, que é o
vocabulário do `react-aria` inteiro (`hovered`, `pressed`, `focus-visible`, `selected`, `pending`,
`unavailable`, `outside-month`…).

### Na matriz: 17 células mudaram, e todas de `estados`

Que **só** o eixo alimentado pelo extrator tenha mudado é o controle de que a correção não vazou.

| | antes | depois |
|---|---:|---:|
| `AUREA_INFERIOR` | 58 | **72** |
| `REQUER_LEITURA` | 183 | **168** |
| `AUREA_COBRE` | 3 | **5** |
| `INCONCLUSIVO` | 45 | 44 |
| `SO_AUREA` | 18 | 18 |
| **total** | 307 | 307 |

Mudou nos dois sentidos, que é como se parece uma remedição de verdade: `input`, `button` e
`textarea` passaram a ter cobertura **medida**; `combobox` saiu de coberto para inferior.

E a célula agora carrega a proveniência: **`dasQueFaltamSoReagidas`** lista, das que faltam,
quais **nenhuma** referência emite. É o que separa `nested` da shark — que é do `vaul` — de
`invalid` do checkbox, que é real.

---

## 5. Os controles

[`tests/unit/data-attrs.test.tsx`](../../tests/unit/data-attrs.test.tsx), 15 testes. Fixture com
**entrada conhecida → resultado conhecido**, no formato que o §1b do protocolo exige. Cada forma
foi **copiada de um fonte real**, e cada armadilha é uma que estourou de verdade.

A segunda metade do arquivo prova que os **inventários versionados** foram gerados com ele — um
extrator certo que ninguém ligou na cadeia passaria em todo o resto.

**Provado contra o defeito**, não só visto passando:

| defeito injetado | vermelhos |
|---|---:|
| só a forma de colchete (as duas voltas desfeitas) | 4 |
| o regex frouxo de antes (colhe prosa, caminho, variante) | 4 |
| emitido e reagido confundidos (o defeito original das cinco) | 3 |

---

## 6. O que isto custou, e por que foi feito agora

Refazer os cinco inventários invalidaria qualquer leitura de célula já registrada — e havia
**duas**, nenhuma delas de `estados`, nenhuma afetada. **Era o momento mais barato possível**, e
é a regra do `CLAUDE.md`: zero ocorrências é o instante mais barato de corrigir, não a razão de
adiar. Feito depois da leitura das 168 células, teria custado 168 reconferências — e o mecanismo
de `veredictoNaEpoca` teria marcado todas elas de uma vez.
