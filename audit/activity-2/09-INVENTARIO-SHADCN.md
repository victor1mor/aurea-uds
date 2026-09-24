# Inventário do §9 — `shadcn-ui` (`Referencia/ui-main`)

> Quinta das nove, e a **primeira que conta duas vezes**: é referência local do `BUILDING.md` e
> fonte externa obrigatória do §3 ao mesmo tempo.
>
> ```bash
> node audit/activity-2/inventory-shadcn.mjs   # escreve INVENTORY-SHADCN.json
> ```
>
> `shadcn-ui @ 4e88ab8` · MIT · medido em 21/08/2026.

## 1. Cada referência declara de um jeito — e esta declara por manifesto

| Referência | Como declara | O extrator infere? |
|---|---|---|
| `base-ui` | 148 enums `*DataAttributes.ts`, JSDoc por membro | não |
| `radix` | inline no JSX, `data-state={open ? 'open' : 'closed'}` | sim: valor e descrição |
| `mui` | 118 `<nome>Classes.ts`, e o JSDoc diz **de que tipo** é cada membro | não, nem o tipo |
| `untitled-ui` | união literal na prop + objeto `sortCx` com a receita de cada degrau | não, para tamanho |
| **`shadcn-ui`** | **`registry.json` legível por máquina** — 411 itens tipados, com o grafo entre eles em `registryDependencies` | não: está declarado |

Ser legível por máquina muda **o que dá para medir**. Nas quatro anteriores a composição tinha de
ser inferida do código; aqui ela está declarada, e por isso esta é a primeira fonte que responde
"quantas composições existem" sem chute.

## 2. O que foi medido

| | |
|---|---|
| Itens no manifesto | 411 |
| — componentes (`registry:ui`) | 54 |
| — blocos (`registry:block`) | **97** |
| — exemplos (`registry:example`) | **238** |
| — tema, estilo, lib, hook, interno | 22 |
| Componentes distintos nos fontes | 62 |
| Com `cva` | 15 |
| Com escala de tamanho | 5 |
| `data-slot` distintos | 355 |
| Estados `data-*` distintos | 26 |

**A proporção é o achado.** Para cada componente há ~1,8 bloco e ~4,4 exemplos. A Aurea tem 88
fichas, 8 blocos e 76 patterns — ou seja, **0,09 bloco por componente**, contra 1,8. O gargalo da
Aurea não é falta de peça; é falta de composição pronta. Ver `G-COMP-01`.

## 3. Três motores para a mesma API — e a Base UI é a de maior cobertura

Nenhuma outra referência dá este dado: o shadcn mantém a mesma API sobre **três motores headless**
(`registry/bases/{aria,base,radix}`). É um experimento natural para a pergunta que a Aurea já fez
duas vezes — *"apostar na Base UI deixa buracos?"* — respondida por quem implementou os três.

| Motor | Componentes | Ausentes |
|---|---:|---|
| `base` (Base UI) | **62** | — |
| `radix` | 61 | `toast` |
| `aria` (react-aria) | 59 | `toast`, `menubar`, `navigation-menu` |

**59 dos 62 existem nos três.** A Base UI é a única sem lacuna — e o único item exclusivo dela é
justamente o `toast`, que a Aurea resolve por hook próprio. Terceira evidência independente a favor
da decisão de 16/07/2026, e a mais forte: as outras duas eram comparação de catálogo, esta é um
mesmo time implementando o mesmo produto três vezes.

## 4. Nome não é capacidade — e o inverso também

Dos 62 componentes, 22 não existem na Aurea **por nome**. Conferidos um a um contra o `summary` da
ficha, **14 são a mesma capacidade com outro nome**:

| shadcn | Aurea | | shadcn | Aurea |
|---|---|---|---|---|
| `alert-dialog` | `Dialog` | | `native-select` | `Select` |
| `sheet` | `Drawer` | | `radio-group` | `Radio` |
| `empty` | `EmptyState` | | `slider` | `Range` |
| `command` | `CommandPaletteShell` | | `input-otp` | `OTPField` |
| `toast` / `sonner` | `useToast` | | `direction` | `AureaProvider` |
| `message` / `message-scroller` / `bubble` | `MessageList` | | `item` | `DataList` |

É o §15 funcionando nos dois sentidos: contar por nome teria inventado 14 gaps que não existem.

Sobram **oito**, e três já estavam na fila (`carousel`, `resizable`, `navigation-menu`), dois são
o mesmo assunto de `G-CAP-02`/`G-A11Y-01` (`scroll-area`), e um é interno do site deles
(`questionnaire` importa de `@/app/(create)/components/`, não é peça distribuível). **Restam dois
de verdade**: `attachment` e `marker`.

## 5. O achado com mais lastro: eixos que a Aurea não tem

Não é componente faltando — é **eixo** faltando em componente que existe. Os três foram conferidos
no fonte da Aurea antes de virar cartão:

| Componente | shadcn | Aurea hoje |
|---|---|---|
| `Field` | `orientation: vertical · horizontal · responsive` | **nenhum** — `FieldProps` é `label/hint/error/htmlFor` |
| `InputGroup` | `align: inline-start · inline-end · block-start · block-end` | só `start`/`end` (inline) |
| `ButtonGroup` | `orientation: horizontal · vertical` | **nenhum** — `.btn-group` é `inline-flex` sem modificador |

O `Field` horizontal é o formulário de configurações — rótulo à esquerda, controle à direita — e
hoje só sai da Aurea com CSS ad hoc. O `block-end` do `InputGroup` é a barra de ações **abaixo** do
campo, que é exatamente a forma do `MessageComposer` que a Aurea já desenha à mão. Ver `G-AXIS-01`.

## 6. O que este inventário ainda não deu

Os 26 estados `data-*` e os 355 `data-slot` foram extraídos mas **não triados** contra o check 27.
O `data-slot` é um modelo de nomeação de parte interna que a Aurea não tem equivalente — cada peça
do shadcn se identifica no DOM — e decidir se vale adotar é assunto de outra sessão, não deste
inventário.
