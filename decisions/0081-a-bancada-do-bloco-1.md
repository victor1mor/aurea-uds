# ADR-0081 — A bancada do bloco 1: a caixa que cresce, as letras de destaque e os tons do Badge

- **Data:** 24/10/2026
- **Estado:** aceita · feita na branch `claude/nat2`, na `0.43.0` (o bloco 1, o catálogo fiel).
- **Substitui:** a [ADR-0002](0002-altura-fixa-do-demo.md) (a caixa do exemplo de altura fixa).
- **Origem:** a bancada do bloco 1 — sete pontos lado a lado, nos dois temas, com o contraste medido na página, e dois de
  API. O Victor, depois de ver: *"Vi a bancada. Pode seguir com as opções que você recomendou nos nove pontos."*

## O que se mediu, e o que ficou

1. **A caixa do exemplo cresce com ele** (substitui a ADR-0002). Com toda variação à mostra (o bloco 1), 42 caixas rolavam
   por dentro na altura da varredura — na tela do Victor (1280 × 663), mais. A referência faz a caixa com altura mínima e
   deixa crescer com o exemplo. Fica: a mesma fórmula de antes (`clamp(14rem, 100dvh − 19rem, 32rem)`, 359 na tela do
   Victor, perto dos 350 da referência) vira a **mínima**; a caixa cresce. A prévia em documento próprio (`iframe`) mantém
   a altura fixa — ela rola dentro do próprio documento. A varredura "nenhuma prévia rola dentro da caixa" passa a medir
   na tela do Victor.
2. **A letra do `tone="primary"` é a de destaque** (`--primary-emphasis`: o azul no claro, o amarelo no escuro). Antes era
   o amarelo de preencher, de propósito — 1,75:1 no claro. Na web (o `Text`, o `Paragraph`, o `Heading`, o `Code`).
   ~~E no nativo.~~ → **No nativo, fica como era** (o amarelo de preencher): o Victor viu a bancada de cada mudança no
   nativo, antes e depois, e não aprovou esta (24/10/2026, ~18:15).
3. **Os botões da marca de contorno, fantasma e link, no claro, levam a letra azul** (`--primary-emphasis`), como a
   [ADR-0076](0076-no-claro-a-letra-de-destaque-e-o-azul-da-marca.md) diz do rótulo do botão secundário. A mistura marrom de
   21/08 passava sobre a página e caía para 4,22 dentro da barra de ferramentas; o azul dá 4,69. Na `lory`, o
   `--primary-emphasis` dela (o laranja escuro, opaco); o `--primary-outline` dela é translúcido e não serve para letra.
4. **O Avatar suave com tom usa o fundo do selo suave** (o `-bg` de cada tom de estado, a receita do `Badge`). O info media
   4,12 no claro.
5. **O traço da aba escolhida nas abas de código fica.** A referência marca a escolhida só pela cor da letra; a letra
   apagada da Aurea passa de 4,5:1, e a diferença de cor sozinha fica fraca para baixa visão.
6. **Os tons running, paused, offline e review do `Badge`**: running é o azul de info, paused o âmbar de aviso, offline o
   cinza apagado (como o `Status offline`), review o violeta de categoria. Antes, paused, offline e review saíam iguais ao
   neutral, e uma regra solta pintava o running de verde por cima.
7. **O `align` do `Text` e do `Code` vira bloco**: a peça era uma linha de texto, e alinhar dentro da própria largura não
   movia nada.
8. **A frase `comboboxOpen` entra no `AureaStrings` do nativo** (a mesma da web): no navegador, a setinha do `Combobox`
   nativo é o botão "abrir a lista" — sem nome, ela era uma parada de Tab muda. Pode quebrar a compilação de quem monta o
   dicionário inteiro.
9. **`ColorSpace` e `ColorChannel` são públicos** no `@aurea-uds/react`: o tipo das props `colorSpace` e `channel` agora se
   importa.

## Quem cobra

`tests/unit/bancada-bloco-1.test.tsx` (as regras do CSS e as frases) e `tests/visual/bancada-bloco-1.spec.ts` (o contraste
medido no navegador, nos dois temas), os dois provados contra o código de antes; e a varredura do catálogo.
