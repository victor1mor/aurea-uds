# Inventário do §9 — `kibo-ui` (`Referencia/kibo-main`)

> Sexta das nove. O `BUILDING.md` §1 a aponta para *"anatomia de componente raro"* — `dropzone`,
> `tree`, `gantt`, `kanban`, `editor`, `table`.
>
> ```bash
> node audit/activity-2/inventory-kibo.mjs   # escreve INVENTORY-KIBO.json
> ```
>
> `kibo-ui @ 3d63cdb` · MIT · medido em 21/08/2026.

## 1. O sexto formato — e o primeiro que declara CUSTO

| Referência | Como declara |
|---|---|
| `base-ui` | 148 enums `*DataAttributes.ts`, JSDoc por membro |
| `radix` | inline no JSX, `data-state={open ? 'open' : 'closed'}` |
| `mui` | 118 `<nome>Classes.ts`, e o JSDoc diz **de que tipo** é cada membro |
| `untitled-ui` | união literal na prop + objeto `sortCx` com a receita de cada degrau |
| `shadcn-ui` | `registry.json` legível por máquina, com o grafo em `registryDependencies` |
| **`kibo-ui`** | **um pacote npm por componente** — nome, descrição e **dependências reais** — mais `packages/patterns/<componente>/<variante>/<n>.tsx` no disco |

É a única fonte do quadro em que **o custo de adotar cada peça está declarado pelo autor**. O §48
pergunta "custo em dependência nova"; aqui a resposta não é estimativa.

## 2. O que foi medido

| | |
|---|---|
| Pacotes de componente | 40 |
| Sem nenhuma dependência externa | 7 |
| Sobre `shadcn-ui` | 38 |
| Dependências externas distintas | 44 |
| Componentes com composição pronta | 53 |
| Variantes declaradas | 209 |
| **Composições** | **1.101** |
| Composições por componente | **20,8** |

## 3. `G-COMP-01` ganha a segunda medição, e ela é pior

A taxonomia **Componente → Variante → Composição** — de onde veio o vocabulário do `AUREA.md` §4 —
não está escrita em prosa aqui: está materializada em árvore de diretório
(`patterns/button/destructive/badge-destructive-3.tsx`). Dá para contar sem interpretar. Conferido
contra o disco: `button` tem 35 arquivos em 5 variantes, e o extrator diz 35 em 5.

| | kibo | shadcn | Aurea |
|---|---:|---:|---:|
| componentes | 53 | 54 | **88** |
| composições / patterns | **1.101** | 238 | **76** |
| por componente | **20,8** | 4,4 | **0,86** |

**A Aurea tem mais peça que as duas e vinte e quatro vezes menos composição que a primeira.** Duas
fontes independentes, mesma conclusão: o gargalo não é a peça.

E há um dado de forma junto: o `button-group` e o `input-group` do kibo têm **10 variantes** de
composição cada. São exatamente os dois componentes onde o inventário da `shadcn` achou eixo
faltando aqui (`G-AXIS-01`). Duas fontes apontando o mesmo lugar não é coincidência.

## 4. O gradiente de custo — a lista de compras ordenada por preço

Dos 40, **32 não existem aqui por nome**. Conferidos contra o `summary` da ficha, doze são a mesma
capacidade com outro nome ou uma composição do que já existe:

| kibo | Aurea | | kibo | Aurea |
|---|---|---|---|---|
| `avatar-stack` | `AvatarGroup` | | `snippet` | `CodeBlock` |
| `glimpse` | `HoverCard` | | `video-player` | `MediaPlayer` |
| `announcement` / `pill` | `Badge` | | `mini-calendar` | `Calendar` (forma diferente) |
| `tree` | `TreeView` | | `ticker` | `KPI` (parcial) |
| `dropzone` | `FileInput` | | `choicebox` | pattern `card-selectable-tile` |

Sobram **vinte**, e o valor deste inventário é que eles vêm **ordenados por preço**:

| Custo | Peças |
|---:|---|
| **0 dependências** | `cursor`, `typography` |
| 1 | `contribution-graph`, `credit-card`, `image-zoom`, `marquee`, `relative-time`, `tags` |
| 2 | `comparison`, `dialog-stack`, `list`, `rating` |
| 3 | `color-picker`, `deck`, `image-crop`, `reel`, `theme-switcher` |
| 4 | `kanban`, `mini-calendar` |
| 7 | `gantt` |
| **18** | `editor` |

O `editor` custa dezoito dependências (TipTap inteiro). O `gantt`, sete. Saber isso **antes** de
prometer a peça é a diferença entre uma fila e uma lista de desejos.

O que o ecossistema já assume, medido: `lucide-react` em 22 dos 40, `@radix-ui/react-use-controllable-state`
em 10, `motion` em 5, `date-fns` em 4. A Aurea usa Carbon Icons e não tem estado controlável
compartilhado — o segundo é um utilitário que o Base UI já resolve internamente.

## 5. O achado que não estava na lista: trocar o tema é ad hoc em três lugares

Apareceu ao verificar se `theme-switcher` era gap de verdade. É, e é pior do que "falta um
componente":

| Onde | O quê |
|---|---|
| `packages/core/src/aurea.js` | `window.Aurea.toggleTheme()` — a implementação canônica, em vanilla |
| `apps/catalog/assets/catalog.js` + `build-catalog.mjs` | usa a do core, mas monta o **próprio botão** (`#theme-toggle`, `btn-icon btn-ghost`), o **próprio CSS** de troca de ícone e um `espelhaTema()` |
| `apps/docs/index.html` | função `toggleTheme()` **separada**, `syncThemeButton()` próprio, outro id (`themeToggle`), outra variante (`btn-secondary`) e outro padrão de ARIA (`aria-pressed`) |
| `packages/react` | **nada** — `AureaProvider` recebe `strings`, `direction` e `spriteUrl`, e **não** `theme` |

Três soluções locais, duas delas divergindo em marcação e em ARIA, e **quem consome a Aurea em
React não tem como trocar o tema pela biblioteca**. É a mesma assinatura do `G-CAP-11`
(`InputGroup`), que já cobrou caro: três consumidores resolvendo por conta própria até o terceiro
herdar o defeito do primeiro. Ver `G-CAP-24`.

## 6. O que este inventário não deu

Só **3 estados `data-*`** distintos em 40 componentes — número baixo demais para ser verdade. O
kibo estiliza por classe condicional (`cn(...)`) e não por atributo, então o extrator mede pouco
aqui **por limite da fonte, não por limite do extrator**. Quem quiser estado do kibo tem de ler o
componente; este inventário não substitui isso, e dizer o contrário seria a amostragem que o §10
proíbe.
