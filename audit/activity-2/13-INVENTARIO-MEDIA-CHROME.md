# Inventário do §9 — `media-chrome` (`Referencia/media-chrome-main`)

> Nona e última. É a mais diferente do quadro, e por isso ensina o que as outras oito não tinham
> como ensinar.
>
> ```bash
> node audit/activity-2/inventory-media-chrome.mjs   # escreve INVENTORY-MEDIA-CHROME.json
> ```
>
> `media-chrome @ c624760` · MIT · medido em 21/08/2026.

## 1. O nono formato: protocolo, não props

| Referência | Como declara |
|---|---|
| `base-ui` | enums `*DataAttributes.ts` |
| `radix` | inline no JSX |
| `mui` | `<nome>Classes.ts`, com o tipo de cada membro |
| `untitled-ui` | união literal na prop + `sortCx` |
| `shadcn-ui` | `registry.json` legível por máquina |
| `kibo-ui` | um `package.json` por componente — declara o **custo** |
| `reui` | MDX com **prosa de intenção** |
| `shark-ui` | módulo TypeScript **conferido pelo compilador** |
| **`media-chrome`** | **`constants.ts` com eventos de PEDIDO e atributos de ESTADO** |

A diferença não é cosmética. Numa árvore React o estado desce por prop e o pedido sobe por
callback — o que amarra o controle à posição dele na árvore. Aqui **qualquer** elemento em
**qualquer** profundidade emite um evento de pedido (`mediaplayrequest`) que borbulha até o
controlador, e o controlador espalha o estado de volta por atributo (`mediapaused`). É o que
permite montar um player inteiro em HTML, sem framework, com os controles em qualquer ordem.

| | |
|---|---|
| Elementos | 34 |
| Eventos de pedido | **26** |
| Atributos de estado | **44** |
| Slots distintos | 35 |
| `part` distintas | 26 |

Nota de método: `MediaUIAttributes` **não** é objeto literal — é derivado de `MediaUIProps` em
tempo de execução (`propName.toLowerCase()`). O primeiro corte do extrator procurou literal e
achou zero, o que é obviamente falso num protocolo de estado. Deriva-se do mesmo jeito que a fonte.

## 2. A pergunta que este inventário existia para responder

**A composição do `MediaPlayer` da Aurea é livre ou fixa?** Medido: **fixa**.

O `children` do `MediaPlayer` cai **dentro do `<video>`** (`{children}</MediaTag>`) — o lugar de
`<source>` e `<track>`, não de controle. A barra inteira é montada por dentro, e o componente
destrutura os quinze manipuladores de evento de mídia para fazê-lo. Trocar a ordem dos botões,
tirar o de volume ou acrescentar um de velocidade **não é possível pela API**.

Não é defeito: é uma escolha coerente com "um player que funciona sem configuração". Mas é uma
escolha que a ficha não declara, e o §110 pergunta se a arquitetura aguenta 10× — aqui a resposta
é que cada controle novo é uma prop nova no monólito. Ver `G-CAP-26`.

## 3. i18n: o único do quadro que traduz

Sete idiomas (`de`, `en`, `es`, `fr`, `pt`, `zh-CN`, `zh-TW`), 45 chaves de texto humano, com
dicionário por frase em inglês — não por identificador. Inclui as mensagens de erro por extenso
(*"A network error caused the media download to fail."*), que é a parte que quase todo sistema
esquece de traduzir.

| | Aurea | media-chrome |
|---|---:|---:|
| Idiomas | 2 (`en` embutido + `ptBR`) | **7** |
| Chaves totais | 69 | 45 |
| Chaves **de mídia** | **13** | **45** |

A Aurea tem mais chaves no total e **um terço** das de mídia. Faltam as de erro, faixa de áudio,
qualidade, cast, AirPlay e PiP — e é exatamente o conjunto que só aparece quando o player encontra
problema, que é quando o rótulo mais importa.

## 4. O que este inventário não dá

`media-theme.ts` não declara `customElements.define` de forma que o extrator leia, e ficou como
`INCONCLUSIVO` — registrado, não omitido. E o inventário **não** cobre o `media-store`, que é onde
a máquina de estado vive: ler aquilo é trabalho de outra sessão, e dizer que este inventário o
cobre seria a amostragem que o §10 proíbe.
