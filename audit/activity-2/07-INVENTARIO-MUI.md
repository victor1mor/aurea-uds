# Inventário do §9 — `mui/material-ui`

> Terceira das nove, e a que o `BUILDING.md` §1 chama de *"a mais completa em cobertura e a mais
> distante em aparência"*. Escolhida agora porque é a referência que mais tem a dizer sobre
> **estado** e **variante** — justamente onde o inventário da `base-ui` já rendeu correção.
>
> ```bash
> node audit/activity-2/inventory-mui.mjs   # escreve INVENTORY-MUI.json
> ```
>
> `mui/material-ui @ f76d14a5` · MIT · medido em 21/08/2026.

## 1. A fonte mais rica das três, e por quê

Cada referência declara a própria superfície de um jeito, e a diferença entre elas é ela própria
um achado do §184:

| Referência | Como declara estado | O extrator precisa inferir? |
|---|---|---|
| `base-ui` | 148 enums `*DataAttributes.ts`, JSDoc por membro | não |
| `radix` | inline no JSX: `data-state={open ? 'open' : 'closed'}` | sim, o valor e a descrição |
| **`mui`** | **118 arquivos `<nome>Classes.ts`, e o JSDoc diz de que TIPO é cada membro** | **não, nem o tipo** |

A MUI é a única que separa, na própria fonte, o que é variante do que é estado do que é peça:

```ts
/** Styles applied to the root element if `variant="text"`. */       -> VARIANTE
/** State class applied to the root element if `disabled={true}`. */ -> ESTADO
/** Styles applied to the startIcon element if supplied. */          -> PEÇA
```

Isso permitiu preencher os campos do §9 **sem inferência minha**, que é o padrão mais alto
alcançado nas três leituras.

## 2. O que foi medido

| | |
|---|---|
| Componentes | 135 |
| Com vocabulário de classe declarado | 80 |
| Estados declarados | 160 |
| Peças de anatomia declaradas | 60 |
| Com eixo de variante | 60 |
| Com eixo de tamanho | 25 |
| Com par controlado / não-controlado | 7 |

## 3. O achado: dois eixos, e a Aurea achatou os dois num só

A MUI trata **aparência** (`variant`) e **tom** (`color`) como eixos **independentes**. Medido:
**19 componentes dela têm eixo `color`**, 27 têm eixo `variant`, e **9 têm os dois** — `Alert`,
`Badge`, `Button`, `ButtonGroup`, `Chip`, `CircularProgress`, `Fab`, `LinearProgress` entre eles.
O vocabulário de tom inclui `success`, `warning` e `info`.

A Aurea tem **um** enum. Decompondo `ButtonVariant` contra o eixo que o
[`DIRECTION.md`](../../docs/DIRECTION.md) §5 **já declara como direção**:

| | neutral | brand | danger |
|---|---|---|---|
| **solid** | `secondary` | `primary` | `danger` |
| **outline** | `outline` | *(vazia)* | `danger-outline` |
| **ghost** | `ghost` | *(vazia)* | `danger-ghost` |
| **link** | `link` | `link-primary` | `link-danger` |

Duas células vazias, e as duas no tom de marca: **a Aurea não tinha o botão de ação secundária
mais comum do mercado**, que é contorno na cor da marca.

**Fechado em 21/08** com `primary-outline` e `primary-ghost` — deriváveis, mesma receita do par
`danger-*`, e o texto em `--primary` já era precedente do `.btn-link-primary`. A matriz virou
teste: se alguém acrescentar um tom e esquecer uma aparência, a célula vazia aparece.

**O modelo, porém, continua achatado**, e isso não se fecha acrescentando valores. Está em
`G-API-01` com as três evidências medidas — células vazias, ordem de nome inconsistente dentro do
mesmo enum (`danger-outline` é tom-aparência, `link-danger` é aparência-tom), e o custo de um tom
novo ser uma aparência inteira. É decisão de API pública de grande alcance e **sobe para o
Victor**.

## 4. O que este inventário ainda não deu

- `OBSERVACOES` vazio nos 135, pela mesma razão das duas anteriores.
- Os **160 estados da MUI** ainda não foram cruzados com os nossos, como os 68 da `base-ui` foram.
  É a continuação natural do `G-STATE-01`.
- A comparação foi de **vocabulário**. Comparar o que cada componente FAZ — o `Table` da MUI
  contra o nosso, capacidade a capacidade — é a matriz do §13 e continua por fazer.
