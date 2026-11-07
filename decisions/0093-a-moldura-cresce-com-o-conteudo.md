# ADR-0093 — A moldura cresce com o conteúdo, e tem o "Full width"

- **Data:** 06/11/2026
- **Estado:** aceita · na `0.61.0` (branch `claude/lote-062`).
- **Substitui:** a frase da [ADR-0081](0081-a-bancada-do-bloco-1.md), item 1, *"a prévia em documento próprio (`iframe`)
  mantém a altura fixa"*. O resto da 0081 continua.
- **Origem:** o Victor achou na página da `Sidebar` exemplos sem o "Full width" da 0.60.0, e mandou varrer o site inteiro em
  várias larguras. A varredura (06/11/2026, à noite, o site publicado) achou duas coisas nas molduras — os exemplos que moram
  em documento próprio (`apps/catalog/embeds/`): **87 caixas de 25 páginas sem o botão** (o script dele pulava toda caixa com
  moldura) e **molduras que cortavam o conteúdo** (a altura fixa da caixa). A proposta rodou no site publicado, numa aba do
  navegador do app, e o Victor aprovou olhando (*"Pode"*).

## A regra

1. **Toda caixa de exemplo tem o "Full width"**, com moldura ou sem (`apps/catalog/site-b/js/_tela-cheia.js`). A moldura
   alarga com a página, como qualquer caixa.
2. **A moldura cresce até o conteúdo caber.** A altura de antes (a da caixa, `--demo-height`) é a de partida e o piso: ela
   nunca encolhe abaixo disso. Quem mede é a PÁGINA (o `catalog.js`): fora da tela ou dentro de um exemplo dobrado, o
   documento da moldura nem sabe o próprio tamanho (a altura dele é 0). O documento só AVISA (`aureaFrameMeasure`) quando
   algo pode ter mudado — carregou, a fonte chegou, a parte viva acendeu, o tamanho mudou —, e a página mede o que passa da
   moldura: o próprio documento e o que rola por dentro dele (a lista da `Sidebar`, que tem a altura da tela).
3. **A lista que rola numa altura própria sai da conta.** Se a moldura cresceu e a sobra de uma lista não diminuiu, a altura
   dela não depende da moldura — contá-la de novo faria a moldura crescer sem fim.
4. **A moldura que mostra a ROLAGEM fica na altura de antes** (`alturaFixa: true` no exemplo → `data-altura="fixa"`). Hoje é
   uma: a `Sidebar` com `scrollbar="visible"` — crescida, a lista caberia e a barra que o exemplo mostra sumiria.
5. **Em `file://`** o documento da moldura é de outra origem, e a página não pode medi-lo: a moldura fica na altura de antes,
   como era.

## O que fica de fora (outra pergunta ao Victor)

- O `AppShell` só mostra a lateral a partir de 1024 de largura; numa tela de 1280, a moldura no "Full width" tem 823, e ele
  continua como gaveta.
- O exemplo "The current item, five ways" da `Sidebar` corta o terceiro item de cada lateral: o exemplo tira a margem e a
  lateral flutuante continua descontando os 32 dela da altura. É do exemplo, não da moldura.

## Quem cobra

- `tests/visual/site-full-width.spec.ts` — as 25 páginas com moldura, a 1280 × 663, com os exemplos dobrados abertos: toda
  caixa com moldura tem o botão, nenhuma moldura passa da caixa, e nenhuma corta (o documento e o que rola por dentro); e a
  moldura `fixa` continua na altura de antes, rolando. Provado contra o site de antes: as 87 caixas reprovam no botão, e 24
  molduras no corte.
