# ADR-0089 — A caixa de exemplo empilhada

- **Data:** 02/11/2026
- **Estado:** aceita · na `0.54.0` (branch `claude/site-b-2`) — só na web.
- **Não substitui** a caixa com as abas Prévia | Código (DOC-02, `0.32.0`): ela continua o padrão do `CodeBlock preview`.
- **Origem:** na revisão do site B, o Victor mandou a foto da caixa de exemplo da referência (*"consegue desenhar como esse
  pra eu ver?"*), pediu a bancada funcional (*"quero um desenho funcional pra eu avaliar"*) e, olhando, *"preciso que seja
  fiel a referencia"*. Com a chave de degradê na bancada, escolheu *"Com degradê"*.

## O que se mediu (na página da referência, a 1280, 02/11/2026)

- A peça em cima, em 350 de altura, com recheio de 40, no fundo da página; o código embaixo, na mesma caixa.
- O código como ARQUIVO inteiro (o `import` e a função que devolve a peça).
- Recolhido, o código em 150, sumindo num degradê; o botão "Expand code" de 32, letra 12 peso médio, a 8 do fundo, no meio,
  com sombra. Aberto, o código inteiro e o mesmo botão, "Collapse code", embaixo dele.
- A caixa recolhida da Aurea, montada assim, mede 502; a da referência, 498.

## A regra

1. **`CodeBlock previewLayout="stacked"`** é variação: sem a prop (`"tabs"`), a caixa de sempre.
2. **Da Aurea:** sem linha (a referência tem uma em volta e outra entre a peça e o código; aqui a peça fica no fundo da página
   e o código no do cartão), o canto 22, as cores, a fonte e as frases (`codeBlockExpand`, `codeBlockCollapse`).
3. **O degradê é a TERCEIRA exceção à regra sem gradiente.** Vale só na regra `.demo.demo-stacked[data-collapsed]` do core
   (uma máscara: some o código, não pinta cor nenhuma); em qualquer outra regra ou arquivo, o check 4 do `validate.py`
   reprova. As outras duas: o `color.ts` (ADR-0069) e o `brand-gradient` (ADR-0084).
4. **Recolhe só o que passa de 5 linhas.** Código curto sai inteiro, sem botão.
5. **O site usa em todo exemplo**, com o código montado como arquivo (o `import` das peças que ele usa, do pacote da página
   — `@aurea-uds/react` ou `@aurea-uds/native` — e a função `Example`). No HTML puro, quem abre e recolhe é o `aurea.js`
   (`data-aurea-code-expand`); no React, a própria peça.

## Quem cobra

`tests/unit/site-b-pecas-0-54.test.tsx` (a peça, o botão e a exceção do gradiente só nesta regra) e o check 4.
