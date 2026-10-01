# ADR-0053 — A fonte é a Atkinson Hyperlegible Next, e os ícones são o Phosphor Regular

- **Data:** 01/10/2026
- **Estado:** aceita · **a troca ainda não foi feita**. Ela sai num lote próprio, com o "pode"
  do Victor. Até lá, o código continua com IBM Plex e Carbon.
- **Autoria:** decisão do Victor, olhando lado a lado seis fontes e sete coleções de ícones com
  as cores, as cápsulas e os cartões da Aurea. Nas palavras dele: *"vamos usar Phosphor Regular e
  Atkinson Hyperlegible Next"*.
- **Muda:** a seção 5 do `CLAUDE.md` (identidade), que dizia *IBM Plex Sans / Serif / Mono;
  Carbon Icons*.

## A regra

> **A letra da Aurea é a Atkinson Hyperlegible Next. Os ícones são o Phosphor, no peso Regular.**

## Por que mudou

Duas queixas do Victor no mesmo dia:

1. **Faltaram ícones.** O app precisou de uma coroa (R-17) e o Carbon não tem, em versão
   nenhuma. Também não tem moto.
2. **A fonte incomodava.** A Aurea é arredondada como o HeroUI (cápsulas, cartões de 22), e a
   IBM Plex tem cantos firmes e letra estreita.

## O que foi medido antes de decidir

Tudo nos arquivos publicados, baixados com `npm pack` em 01/10/2026.

**Ícones:**

| coleção | nomes | desenho | coroa | moto | licença |
|---|---|---|---|---|---|
| Carbon 11.89.0 (a Aurea estava na 11.84.0) | 2.766 | forma cheia, cantos retos, grade 32 | não | não | Apache-2.0 |
| **Phosphor 2.1.1** | **1.512, em 6 pesos** | **traço redondo, grade 256** | **sim** | **sim** | **MIT** |
| Lucide 1.49.0 | 2.121 | traço 2, grade 24 | sim | sim | ISC |
| Tabler 3.48.0 | 5.166 de contorno + 1.054 cheios | traço 2, grade 24 | sim | sim | MIT |
| Gravity UI 2.22.0 (o do HeroUI) | 799 | forma cheia, cantos redondos, grade 16 | só com diamante | não | MIT |

- **Juntar duas coleções foi descartado:** o Carbon é forma cheia de canto reto, e as de traço
  têm ponta redonda. Lado a lado, destoam. O Victor apontou isso antes da medição.
- **O Phosphor desenha os seis pesos como forma preenchida** (`fill="currentColor"`), como o
  Carbon. O gerador de ícones do nativo (`packages/native/build-icons-native.mjs`) já trabalha
  com forma preenchida.
- 275 dos 2.766 nomes do Carbon eram de produto da IBM, logotipo ou nuvem.

**Fontes:**

| fonte | números de largura igual | par de código | licença |
|---|---|---|---|
| IBM Plex Sans (a atual) | — | IBM Plex Mono | OFL |
| **Atkinson Hyperlegible Next** | **sim** | **Atkinson Hyperlegible Mono** | **OFL** |
| Google Sans Flex | sim | Google Sans Code | OFL |
| Geist | sim | Geist Mono | OFL |
| Figtree | sim | nenhum | OFL |
| Nunito Sans | não | nenhum | OFL |

- A Atkinson Hyperlegible leva o nome do fundador do Braille Institute e foi feita *"para
  aumentar a legibilidade para leitores com baixa visão"* (README do repositório
  `googlefonts/atkinson-hyperlegible-next`). Letras parecidas (`I l 1`, `O 0`) têm desenhos
  diferentes. O Victor tem baixa visão.
- A Google Sans Flex era a outra finalista, por ter um controle de arredondamento. Perdeu para a
  legibilidade.
- O HeroUI não decide nenhuma das duas coisas: o `@heroui/styles` usa a fonte do sistema, e a
  documentação dele usa o Gravity UI, que tem só 799 ícones.

## O que a troca obriga (o lote)

1. **Ícones:**
   - trocar `@carbon/icons` por `@phosphor-icons/core` (MIT) no `packages/icons` e no gerador do
     nativo;
   - **todo nome de ícone muda.** Desde a A-04 o nome é conferido pelo TypeScript, então todo
     app que usa ícone para de compilar até trocar os nomes. Precisa de uma tabela de nomes
     antigos para novos, e de um aviso grande no `CHANGELOG.md`;
   - o sprite da web e os arquivos `icons/*` do nativo são regerados;
   - o `NOTICE` e o `docs/REFERENCES.md` trocam o crédito.
2. **Fonte:**
   - o `@aurea-uds/fonts` passa a levar a Atkinson Hyperlegible Next e a Mono, nos arquivos da
     web e nos arquivos fixos por peso do nativo (`files-native/`);
   - os tokens de família (`aurea.tokens.json`) e o `--font-*` do core trocam;
   - **todas as fotos de referência dos testes visuais mudam**;
   - as medidas que dependem da largura da letra se medem de novo.
3. **Uma versão do meio que quebra** (`0.x` com aviso, ADR-0014), antes da `1.0`.

## O que ainda falta decidir (perguntas ao Victor)

1. **Item escolhido:** a recomendação foi Regular no uso normal e **Fill** no item escolhido
   (aba ativa, item de menu atual). A decisão disse só "Phosphor Regular". Usa o Fill no
   escolhido, ou é Regular em tudo?
2. **Fonte de código:** o par natural é a **Atkinson Hyperlegible Mono** (OFL). Confirmar.
3. **Fonte editorial:** o `--font-editorial` (IBM Plex Serif) existe e está **sem uso** (lido no
   `aurea.css`, linha 1624). A Atkinson não tem serifada. Remove, ou fica?
4. **Ícone pequeno:** o Regular é traço médio. Nos tamanhos pequenos (16) pode ficar fino. Medir
   na vitrine antes de decidir se o tamanho pequeno usa o Bold.
