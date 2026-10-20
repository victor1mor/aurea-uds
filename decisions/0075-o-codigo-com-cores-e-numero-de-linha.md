# ADR-0075 — O código com cores e número de linha

- **Data:** 20/10/2026
- **Estado:** aceita · feita na branch `claude/codigo-com-cores`, para a `0.37.0`.
- **Origem:** o Victor, comparando as caixas de código do site com as da referência: *"nosso codigo que fica nas caixas
  expostos não são como dos outros, com numero de linhas laterais e cores"*. Escolhas dele, em 20/10/2026: *"A: motor da
  Aurea"* e *"Agora, antes das travas"*.

## O que estava errado

A ficha do `CodeBlock` prometia "Read-only syntax-highlighted code display", e o componente desenhava `<pre><code>`
puro — sem cor nenhuma. A própria ficha se contradizia: a descrição de `language` dizia que ele não colore.

## A regra

1. **O `CodeBlock` ganha `lineNumbers` e `highlight`.** Sem as duas, a marcação é a de antes, byte a byte.
2. **O número da linha é o da referência**, medido na página dela: uma coluna de 16 (`--space-4`), alinhada à direita, a
   24 do código (`--space-6`). A coluna cresce com os algarismos da última linha (`--code-line-digits`). A cor é a
   apagada da Aurea, que se lê (4,69:1 no pior caso medido); a da referência apaga até ~2:1. O número é desenho do CSS,
   com o texto alternativo vazio: não entra no texto copiado nem no leitor de tela.
3. **As cores vêm do motor que a Aurea já usava no `CodeEditor`**, o `@lezer/highlight`, com as gramáticas do Lezer. A
   referência usa o Shiki; o resultado na tela é o mesmo, e o motor da Aurea é mais leve e já era dependência (opcional)
   dela. O `highlightCode` do Lezer colore código parado — sem editor, sem espera e sem navegador —, então serve ao site,
   montado no Node, e a quem usa o `CodeBlock` no servidor ou no cliente.
4. **O módulo é próprio, `@aurea-uds/react/code-highlight`**, como o `code-editor`: as gramáticas são peer OPCIONAL, e
   quem não usa as cores não as instala. O `CodeBlock` recebe quem colore pela prop; o barril principal não importa o
   Lezer (o check 19 cobra).
5. **As cores são as do `CodeEditor`** (`aureaHighlightStyle`): comentário apagado e em itálico, palavra-chave e nome de
   tipo em azul, texto entre aspas em verde, número em amarelo, função em 600. **Misturadas 20% com o texto**, como o
   nível do registro, que mora no mesmo fundo (`.log-stream`, ADR-0072): puras, o azul caía a 4,08:1 no claro e o verde
   a 4,44:1 no escuro. Com a mistura, todas passam de 4,5:1 nos dois temas (a menor, 5,13).
6. **O trecho de JSX solto** (várias linhas de JSX, uma embaixo da outra, como nos exemplos) é lido dentro de um
   fragmento quando a leitura direta erra, e só o trecho original é pintado. Sem isso, só a primeira linha saía certa.
   Dos 1.031 blocos de JSX do site, 1.019 são lidos sem erro.
7. **No site**, como na documentação da referência: o código dos exemplos, sempre com número; o do meio do texto, com
   número só a partir de 20 linhas; a linha de `import` e a assinatura dos hooks, só com cor.

## O que fica de fora

- O nome do comando no bash (`pnpm`, `npx`) sai sem cor: o modo de shell do CodeMirror só pinta comentário e palavra
  reservada.
- O botão de copiar cobre o fim da primeira linha quando ela é longa (já era assim): resolver pede tirar o botão de
  cima da área que rola, que muda a montagem da caixa.
- O "Expand code" da referência (o código longo recolhido) e o código sempre embaixo da prévia ficam para depois.

## Quem cobra

- `tests/unit/codigo-com-cores.test.tsx` — as línguas, o JSX solto (provado sem o fragmento), as linhas do `CodeBlock`
  com o texto igual ao código, e a marcação de antes sem as props.
- `tests/visual/codigo-com-cores.spec.ts` — o contraste de cada cor e do número nos dois temas (provado com as cores
  puras), o número fora do texto selecionado, a coluna de 16 a 24 do código e alinhada na linha 10 (provado sem a regra),
  e o site com cor e número nos exemplos.
