# ADR-0056 — A lateral recolhe por um botão na junção, e sozinha em tela média

- **Data:** 03/10/2026
- **Estado:** aceita · executada na `0.18.0`, aprovada pela bancada com o código real rodando
  (*"pode, aprovado o lote G"*, 03/10/2026) e publicada em 03/10/2026.
- **Origem:** AN-01, pedido de um consumidor novo da web (`docs/FILA.md` §9). O Victor viu numa
  janela de 1508 × 757: a lateral sempre aberta, sem botão, e diminuir a janela não a recolhia — só
  virava gaveta abaixo de 1024. Ele marcou o lugar do botão: *no alto, na junção entre o menu e a
  área de conteúdo*.
- **Muda:** acrescenta três props ao `AppShell`; corrige a gaveta recolhida e a margem do conteúdo
  na escrita da direita para a esquerda. Nada sai.
- **Trocada em 26/11/2026 (lote 106, `0.82.0`): o botão saiu da junção e foi para a barra de cima, antes da marca.**
  Ver "A troca de 26/11/2026", no fim. As regras 1, 3, 4 e 5 continuam; a 2 e a 6 mudaram.

## As regras

1. **O botão só existe com `sidebarCollapsible`.** Sem a prop o shell é o de antes — inclusive as
   106 páginas do catálogo e quem já liga `sidebarCollapsed` a um botão próprio, que não ganha um
   segundo.
2. ~~**O lugar:** no meio do vão entre a lateral e o conteúdo (em cima do fio, na lateral rente), com
   o centro na altura do centro do primeiro item. Gruda junto com a lateral quando a página rola.~~ → na barra de cima,
   antes da marca (a troca de 26/11/2026).
3. **Entre 1024 e 1279 de largura a lateral é trilha sozinha.** A escolha da pessoa vale até a
   janela cruzar 1280; aí a largura volta a mandar.
4. **Controlado e não controlado**, como o `open` dos outros: `sidebarCollapsed` (controlado, já
   existia), `defaultSidebarCollapsed`, e `onSidebarCollapsedChange`, que avisa cada troca — pelo
   botão ou pela largura. Guardar a preferência é do app.
5. **Na gaveta (abaixo de 1024) a lateral nunca é trilha**, controlada ou não: recolhida ali, era
   uma gaveta de ícones sem nome.
6. ~~**A seta aponta para onde a lateral vai**, e vira na escrita da direita para a esquerda pela
   direção do provedor — nunca por `:dir(rtl)` na folha (ver "O que custou").~~ → o botão é o `Sidebar.Toggle`, com o
   desenho de lateral, que não vira (a troca de 26/11/2026).

## As fontes

A primeira da fila de referências (`CLAUDE.md` §2) não tem moldura de app. A **segunda** tem: um exemplo
de trilha de ícones que recolhe (os nomes viram dica, com uma trilha e um gatilho para comandá-la),
montado sobre a `Sidebar` de outra das referências (MIT), lida no código publicado
das duas.
Dela vieram o comportamento e os nomes: estado aberto/recolhido, `defaultOpen` + `open` +
`onOpenChange`, um gatilho, e o nome em dica na trilha (que a `Sidebar` da Aurea já fazia). Nenhuma
linha foi copiada, e nenhuma medida: tudo sai dos tokens que já existem.

## Alternativas rejeitadas

- **Ligado por padrão.** Mudaria a moldura de todo consumidor e o catálogo inteiro sem ele pedir.
- **O gatilho no cabeçalho do conteúdo, como na outra referência.** O Victor marcou a junção.
- **A faixa fina na borda da lateral, da outra referência.** É um segundo alvo para a mesma
  ação, só de mouse; o botão na junção já ocupa o lugar.
- **O atalho Ctrl/Cmd+B da outra referência.** Ele escuta a janela inteira e cancela a tecla: num editor de
  texto (o `BlockEditor` daqui) roubaria o negrito.
- **Guardar a escolha num cookie, como a outra referência.** Preferência é do app; a Aurea avisa.

## O que custou

- A lateral e o conteúdo ganham lugar escrito na grade (`.app-shell-collapsible`), porque o botão
  é um item da grade na mesma célula da lateral.
- **O empacotador do app reescreve `:dir(rtl)`** como lista de idiomas (`:lang(ar)`, `:lang(he)`…),
  e a regra deixa de pegar num documento com `dir="rtl"` sem esses idiomas — medido no Vite do
  banco da moldura. Por isso o botão se posiciona com propriedades lógicas, e a barra do `Progress`
  anda pela margem lógica. As cinco regras `:dir(rtl)` que já existiam (`Badge` e `TreeView`) têm o
  mesmo defeito e ficaram para uma tarefa à parte.
- A margem do `.content` passou a ser lógica: era física, e na escrita da direita para a esquerda o
  conteúdo encostava na borda da página e deixava 32 de vão na junção.

## Quem cobra

- `tests/visual/appshell-an01.spec.ts`, no banco `apps/keyboard-probe/shell.html`: o lugar do botão
  nas três variantes (aberta, recolhida e rolada), o clique e o teclado, a faixa média, a gaveta,
  o controlado, o `defaultSidebarCollapsed` e a direita para a esquerda. O código de antes reprova
  os nove.
- `tests/unit/appshell-an01.test.tsx`: sem a prop nada muda; a gaveta nunca é trilha.

## A troca de 26/11/2026 (lote 106, `0.82.0`)

O botão da junção sumia entre os cartões e nunca teve resposta (a pergunta ficou aberta desde a `0.18.0`). Na bancada viva
de 24/11/2026, com a conta das referências — 7 de 8 põem o botão de recolher na barra de cima, nenhuma na junção —, o
Victor decidiu: *"Na barra de cima"*. Na bancada do lote 106 (26/11/2026), com o código de antes ao lado do novo, ele
aprovou: *"Aprovo os cinco"*.

- **O lugar:** na barra de cima, ANTES da marca — o mesmo `Sidebar.Toggle` (o desenho de lateral, sem fundo) que o
  `layout="sidebar"` já usava desde a `0.42.0`. No `layout="docs"`, no tamanho pequeno da barra dele. Abaixo de 1024 ele
  some, como antes, e quem abre a gaveta é o botão da gaveta.
- **Sai:** a bolinha da junção (`.sidebar-toggle-slot`, `.sidebar-toggle`) e a dica dela. O `sidebarToggle="edge"`
  continua o padrão e passa a querer dizer "na barra de cima"; `"none"` continua sem botão do shell.
- **Quem cobra:** `tests/visual/appshell-an01.spec.ts` (o botão dentro da barra, antes da marca, nas três variantes e
  da direita para a esquerda, sem bolinha na junção) e `tests/unit/appshell-an01.test.tsx`. O código de antes reprova.
