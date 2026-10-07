# ADR-0058 — A folha que sobe de baixo tem 32 de canto

- **Data:** 06/10/2026
- **Estado:** aceita · executada na `0.20.0` (ainda não publicada).
- **Origem:** HER-03, da auditoria referência × Aurea de 06/10/2026 (documento de achados do Victor,
  fora do repositório). Decisão do Victor olhando as duas versões na bancada do Lote I, com o
  código real rodando: *"folha com 32"*.
- **Muda:** o token novo `radius-sheet` (32) e os cantos de cima das três folhas do nativo. Nenhuma
  prop muda, nada sai.

## A regra

**Os cantos de cima da folha que sobe de baixo são `radius-sheet`, 32.** O resto da identidade não
muda: cartões, janelas e painéis continuam com 22 (`--radius-card`, `CLAUDE.md` §5). A folha é a
exceção porque ela encosta na borda de baixo da tela e acompanha o canto do próprio telefone.

Vale para as três peças do nativo que sobem de baixo: a `BottomSheet`, a lista do `Select` e a
folha do `Combobox`. Quando a web ganhar a gaveta de baixo (WEB-06), ela usa o mesmo token.

## As fontes

- O pacote nativo da referência, na folha de estilo da folha de baixo: os dois cantos de cima com
  o raio de quatro vezes o raio base dela = 32. O `Select`, o `Menu` e o `Popover` dele abrem
  como folha com a mesma peça (lido no pacote baixado com `npm pack` em 06/10/2026).
- O número é o dele; o nome do token é da Aurea, no estilo dos outros raios com papel
  (`radius-card`, `radius-control`).

## Alternativas rejeitadas

- **Ficar com 22, a regra de painel.** Era o padrão até aqui. O Victor viu as duas na bancada e
  escolheu 32.
- **32 só na `BottomSheet`.** A lista do `Select` e a folha do `Combobox` sobem do mesmo jeito; com
  dois cantos diferentes, o app teria duas folhas que parecem peças diferentes.
- **Escrever 32 nos componentes.** Número cru no fonte é defeito (`CLAUDE.md` §1); escala nova se
  cria no pacote de tokens, não no meio de um componente.

## Como ela é obrigada

`tests/unit/native-her03-folha.test.tsx`: o token vale 32 nas três densidades; a `BottomSheet`
aberta tem 32 nos dois cantos de cima; e toda chamada de `cantosDeCima` no fonte do nativo usa
`radiusSheet` — uma folha nova que nascer com o 22 reprova. Provado com o `radiusCard` de volta.

## Consequências

- O canto de cima da folha fica mais redondo que o de um cartão. No iPhone ele sai também
  contínuo (HER-01).
- O app não muda nada: a folha vem da Aurea.

## Quando rever

Se a gaveta de baixo da web (WEB-06) for construída e o 32 não servir numa tela larga.
