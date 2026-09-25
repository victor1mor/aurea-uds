# ADR-0052 — O botão só de ícone é redondo

- **Data:** 25/09/2026
- **Estado:** aceita · **muda a aparência publicada** do botão só de ícone, na web e no nativo
- **Autoria:** decisão do Victor, escolhendo entre duas saídas: redondo em todos os botões só de
  ícone, ou só nos botões do player de vídeo.
- **Obriga:** `.btn-icon` e `.media-control` em `packages/core/src/aurea.css` · o `IconButton` em
  `packages/native/src/actions.tsx` · `tests/visual/geometry.spec.ts` (botão só de ícone é
  redondo, nas três densidades) · `tests/unit/native-lote1.test.tsx` (os cinco tamanhos)

## A regra

> **O botão só de ícone é um quadrado com o raio da cápsula (`--radius-full`, 999): um círculo.**
> Em todos os tamanhos, nos dois alvos. Redondo exige as duas metades: raio de pelo menos metade
> do lado **e** largura igual à altura.

## Por que mudou

Até a `0.10.1` o botão só de ícone era um quadrado de canto `--radius-md` (10px) no `md`, `lg`
e `xl`, e `--radius-sm` (6px) nos dois menores. A pergunta veio do Victor olhando a imagem de antes e
depois do B-09, no botão do player: *"botão pode ser redondo?"*.

Medido antes de decidir:

- **HeroUI 3.2.6** (`@heroui/styles`, `button.css`): o botão é `rounded-3xl` e o só de ícone
  (`.button--icon-only`) tem largura igual à altura, `w-10` num `h-10`. É um círculo.
- **Aurea:** os botões de texto já são cápsula (seção 5 do `CLAUDE.md`). O de ícone era o único
  botão quadrado.

## As saídas, e por que a outra perdeu

1. **Redondo em todos os botões só de ícone.** Escolhida.
2. **Redondo só no player.** Rejeitada: a mesma tela passaria a ter dois formatos de botão de
   ícone, o do player e o do resto.

## O que a medição achou no caminho

O `btn-xl` escapou da primeira passada: a regra dele mora numa linha à parte, e a lista de
tamanhos do teste tinha quatro. Com os cinco na lista, ele apareceu.


O `.media-control` media **38×36**: o recheio lateral de 8px + 8px em volta de um ícone de 20px o
deixava mais largo que alto, e raio 999 ali dá pílula, não círculo. Todos os botões do player são
só ícone, então o recheio lateral saiu: 36×36 com mouse, 44×44 em tela de toque.

Os que já eram redondos e não mudam: o "x" do selo (`.badge-dismiss`) e o "x" dos itens
escolhidos do `Combobox` (`.combobox-chip-remove`).

## Como é obrigada

- `tests/visual/geometry.spec.ts`: mede os cinco tamanhos do `.btn-icon` e o `.media-control`
  nas três densidades — largura igual à altura, raio de pelo menos metade do lado. Provado contra
  o CSS antigo (raio 8 num botão de 24) e contra o recheio lateral de volta (38×36).
- `tests/unit/native-lote1.test.tsx`: os cinco tamanhos do `IconButton` do nativo com
  `radiusControl` e largura igual à altura. Provado contra o código antigo: todos reprovam.
  Esse teste cobrava o contrário até esta ADR.

## Consequências

- Muda a aparência de todo `IconButton`, dos botões de fechar e dos controles do player.
- O teste do nativo que chamava o círculo de "defeito" foi invertido, e o comentário do
  `IconButton` que dizia "o raio NÃO é o pill" foi reescrito.

## Revisão

Reabre se o HeroUI deixar de fazer o botão só de ícone redondo, ou se o Victor pedir.
