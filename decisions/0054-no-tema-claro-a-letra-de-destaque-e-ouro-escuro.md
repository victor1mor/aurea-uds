# ADR-0054 — No tema claro, a letra de destaque é o amarelo escurecido, e não o marrom

- **Data:** 02/10/2026
- **Estado:** aceita · executada na `0.16.0`, publicada em 02/10/2026.
- **Autoria:** decisão do Victor, olhando o app no tema claro: *"esse marrom me incomoda muito,
  quero amarelo como no modo escuro"*. Entre as quatro saídas da prancha, escolheu a **D**.
- **Muda:** a seção 5 do `CLAUDE.md` (identidade), na cor de destaque do tema claro. O amarelo
  primário `oklch(0.795 0.184 86.047)` **não muda**.

## A regra

> **No tema claro, quando o amarelo vira LETRA ou ÍCONE sobre fundo claro, ele é o
> `brand-yellow-text` — o mesmo matiz do amarelo (86), escurecido até ler. Onde ele é FUNDO, é
> o amarelo de verdade.**

Os tokens `primary-emphasis` e `primary-outline` do tema claro apontam para o `brand-yellow-text`
(`oklch(0.516 0.105 86.047)`, `#826202`). Antes, os dois eram o `brand-yellow-foreground`, o
marrom `#733e0a` (matiz 57,7).

## Por que não o amarelo puro

O amarelo `#f0b100` mede **1,9:1** no branco. Texto pede **4,5:1** (WCAG 1.4.3). Como letra no
tema claro ele some — e quem tem baixa visão é o primeiro a perder. No escuro ele mede 11:1, e por
isso lá a letra é o amarelo puro.

## O que foi medido antes de decidir

A prancha de 02/10/2026, com o código real, no tema claro:

| | cor | contraste | |
|---|---|---|---|
| A · hoje | marrom `#733e0a` | 8,7:1 no branco | lê, mas é outra cor |
| B · amarelo puro | `#f0b100` | 1,9:1 | reprova |
| C · ouro escuro | `#8e6b01` | 4,9:1 no branco | passa no branco… |
| D · C + amarelo de fundo | | | **a escolhida** |

O `#8e6b01` da prancha **não passava nos fundos cinza** do tema claro: 4,14:1 no `#ebebeb`
(`muted`, `secondary`, `accent`, `field-bg`), e 3,93:1 dentro do selo amarelado sobre cinza. A
cor final é o degrau que passa no **pior** fundo: `#826202`, 4,52:1 no `#ebebeb` com o véu de 10%
do selo, 5,7:1 no branco.

## O que NÃO muda

- **O anel de foco e o controle marcado do claro** (`focus-strong`, `control-selected`) continuam
  no marrom: são borda e preenchimento de estado, e o marrom é o que garante a borda visível.
- **O texto SOBRE o amarelo** (`primary-foreground`) continua o marrom, nos dois temas — é o mesmo
  dos botões amarelos do escuro.
- **As marcas** (`data-brand`) têm a própria `primary-emphasis` e não mudam.
- **O escuro** não muda.

## A outra metade da D é do app

A D põe o amarelo de verdade onde ele é FUNDO. No `BottomNav` isso já existe:
`indicator="circle-bold"` (o item escolhido num círculo amarelo). O app passa a prop; a Aurea não
muda nada ali.

## Quem cobra

`tests/unit/amarelo-no-claro.test.tsx`: o matiz das duas cores é o do amarelo (reprova o marrom
de antes), o contraste é ≥ 4,5:1 em todo fundo do tema claro, inclusive dentro do selo (reprova o
amarelo puro e o `#8e6b01`), o escuro continua no amarelo, e o foco continua no marrom. Na web,
o `tone-contrast.spec.ts` e o axe do `catalog-sweep.spec.ts`, nos dois temas.
