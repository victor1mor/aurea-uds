# Inventário do §9 — `reui` (`Referencia/reui-main`)

> Sétima das nove. É a primeira cujo inventário começa com uma **subtração**.
>
> ```bash
> node audit/activity-2/inventory-reui.mjs   # escreve INVENTORY-REUI.json
> ```
>
> `reui @ 0daf79d` · MIT · medido em 21/08/2026.

## 1. A subtração: 62 de 62 arquivos são o `shadcn-ui`, byte a byte

O `registry/bases/base/ui` do `reui` tem 62 arquivos. Comparados por `sha256`, **os 62 são
idênticos aos do `shadcn-ui`** — mesmo nome, mesmo conteúdo, zero diferença. É cópia vendorizada,
não trabalho próprio.

Isso importa porque duas das nove referências compartilham um corpo de código. Contar as duas
separadamente inflaria o quadro do §13 com o mesmo componente duas vezes, e a comparação "quantas
fontes têm X?" passaria a medir quantas fontes **copiaram** X. Medido, não suposto.

O que é do `reui` são **22 componentes** documentados em `content/docs/(components)/`, sobre dois
motores (`base` e `radix`).

## 2. O sétimo formato — e o único que responde QUANDO USAR

| Referência | Como declara |
|---|---|
| `base-ui` | 148 enums `*DataAttributes.ts`, JSDoc por membro |
| `radix` | inline no JSX |
| `mui` | 118 `<nome>Classes.ts`, com o tipo de cada membro |
| `untitled-ui` | união literal na prop + `sortCx` |
| `shadcn-ui` | `registry.json` legível por máquina, com o grafo entre itens |
| `kibo-ui` | um `package.json` por componente — declara o **custo** |
| **`reui`** | **MDX com frontmatter + prosa de intenção** |

O §11 diz que documentação traz o que o código não mostra. Aqui é literal. A prosa do `cascader`
explica que a diferença para um combobox plano é a **navegação por nível**: o ramo abre em vez de
commitar, o popup fica aberto, a trilha diz onde se está, e o gatilho mostra o caminho inteiro
*"porque num seletor aninhado a folha sozinha é frequentemente ambígua"*. Nada disso está no tipo,
no `data-*` ou na classe. É a única fonte do quadro de onde se extrai **razão**, e não só forma.

## 3. A escala — o dado que nenhuma outra fonte dá

| Componente | Linhas | Composições | Deps |
|---|---:|---:|---:|
| `filters` | **10.172** | 12 | 5 |
| `event-calendar` | 9.844 | 5 | 3 |
| `gantt` | 8.919 | 5 | 4 |
| `cascader` | 8.554 | 20 | 3 |
| `data-grid` | 6.190 | 30 | 9 |
| … | | | |
| `icon-stack` | 94 | 6 | 0 |

**Isto muda o que "adicionar um gantt" significa.** O `kibo` disse que custa 7 dependências; o
`reui` diz que custa **~9.000 linhas**. As duas medidas juntas são a resposta honesta ao §48 —
dependência é o custo de entrada, tamanho é o custo de manter. Um `event-calendar` com fusos,
recorrência e arrastar-para-agendar não é "mais um componente": é um produto dentro do produto.

## 4. `G-COMP-01`, terceira medição independente

258 composições em 22 componentes = **11,7 por componente**. Terceira fonte, terceiro método
(barril gerado de previews, aqui), mesma conclusão.

| | kibo | reui | shadcn | Aurea |
|---|---:|---:|---:|---:|
| composições por componente | 20,8 | **11,7** | 4,4 | **0,86** |

## 5. O que a Aurea não tem — e o que é só nome

Dos 22, **onze têm equivalente aqui** (`data-grid`→`DataGrid`, `autocomplete`→`Combobox`,
`date-selector`→`Calendar`, `tree`→`TreeView`, `file-upload`→`FileInput`, `number-field`,
`stepper`, `timeline`, `alert`, `badge`, `scrollspy`→`TableOfContents`).

Sobram **onze**, e três já estavam na fila (`gantt`, `kanban`, `rating`). Os novos, com o preço:

| Peça | Deps | Linhas | O que é |
|---|---:|---:|---|
| `cascader` | 3 | 8.554 | combobox de vários níveis, com trilha e busca |
| `filters` | 5 | 10.172 | construtor de filtro com árvore booleana |
| `event-calendar` | 3 | 9.844 | calendário de eventos com fusos e recorrência |
| `sortable` | 6 | 463 | reordenar arrastando (vertical, grade, aninhado) |
| `phone-input` | 1 | 230 | telefone com país e validação |
| `icon-tile` / `icon-stack` | 2 / 0 | 129 / 94 | superfície quadrada para ícone; ícones em camadas |
| `frame` | 1 | 195 | moldura para conteúdo relacionado |

O `phone-input` e o `icon-tile` são os baratos; o `filters` e o `event-calendar` são projetos.

## 6. O achado que não estava na lista: o `TableOfContents` promete o que não faz

Apareceu ao verificar se `scrollspy` era gap. A ficha do `TableOfContents` diz *"marks the section
in view"* — e o componente React **não observa nada**: recebe `current` por prop, e o catálogo
nunca passa `current`.

| Onde | O quê |
|---|---|
| `packages/core/src/aurea.js` | `IntersectionObserver` que marca a seção em vista, em vanilla |
| `apps/docs/index.html` | **outro** `IntersectionObserver`, com `rootMargin` diferente (`-20% 0px -72% 0px`), mexendo em `.active` |
| `packages/react` | `TableOfContents` é presentacional: `current` entra pronto, e ninguém o calcula |

O comportamento só existe nas páginas que carregam o `aurea.js` por fora. Quem usa o pacote React
sozinho recebe um índice que nunca marca nada — e a ficha diz que marca. É a mesma família do
`G-CAP-24` (tema) e do `G-FORM-01` (`sizes` anunciado e inexistente). Ver `G-CAP-25`.

## 7. O limite deste inventário

`file-upload` está documentado, tem screenshots e **não tem fonte neste checkout** — registrado
como `temFonte: false`, não omitido. E o primeiro corte do extrator mediu o arquivo errado: o
`packages/registry/.../src/index.ts` é um barril **gerado** de previews (*"Do not edit by hand"*), e
dava 29 linhas para um `cascader` virtualizado. O número não fazia sentido, e foi por não fazer
sentido que o erro apareceu.
