# ADR-0050 — A escala de letras vem da referência, nos dois alvos

- **Data:** 24/09/2026
- **Estado:** aceita · **substitui a [ADR-0049](0049-a-escala-de-letras-tem-cinco-degraus-que-se-enxergam.md)**
- **Autoria:** decisão do Victor. Primeiro comparou, na mesma tela, as letras em 16 e em 14, e
  escolheu *"a da direita, 14, com apoio em 12"*. Depois ampliou o pedido: *"quero como da [a referência]
  todos os tamanhos 100% de todo projeto"*.
- **Obriga:** os dez `text-*` do `packages/tokens/src/aurea.tokens.json` · o mapa `TAMANHO` do
  `packages/native/src/text.tsx` · `tests/unit/escala-de-letras.test.tsx`

## A regra

> **Os números são os da referência:** 12 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48. É a escala do
> framework de CSS deles, que eles usam sem mudar nada. **Cada alvo escolhe o degrau como a referência escolhe:** na
> web, a peça fica em 14 e o apoio em 12; no telefone, a peça fica em 16 e o apoio em 14.

## De onde saiu, medido

A documentação deles não abriu pela rede desta sessão. Então os números vêm do código publicado:
o pacote web da referência e o pacote nativo dela.

| papel | web (pacote web da referência) | telefone (pacote nativo da referência) |
|---|---|---|
| botão, campo, Select, abas, rótulo, corpo de cartão | `text-sm` · **14** | `text-base` · **16** |
| botão grande | `text-base` · 16 | `text-lg` · 18 |
| etiqueta, selo, descrição, erro de campo | `text-xs` · **12** | `text-sm` · **14** |
| título de cartão | `text-sm` · 14, peso médio | `text-lg` · 18 |
| títulos de página | 18 · 20 · 24 · 30 · 36 | os mesmos |

A web da referência usa `text-sm` **75 vezes**, `text-base` 24 e `text-xs` 23. Todo o resto aparece
duas ou três vezes, e só em título.

## O que isto corrige na ADR-0049

A 0049 atendeu a uma queixa certa, *"variações demais"*, com a ferramenta errada. Ela juntou os
tamanhos pequenos **subindo** tudo para 16. No telefone ficou bom. No computador, 16 é o tamanho da
referência para o telefone, e a tela ficou grande: o Victor passou a usar a página com o zoom do
navegador em 80%. A queixa nunca foi de tamanho; era de **quantidade**. Esta escala resolve a
quantidade do mesmo jeito: numa tela de peças aparecem três tamanhos, 12 · 14 · 16.

## Três escolhas, e por quê

1. **`md` é 14.** O framework de CSS deles não tem `md`. Aqui ele é o corpo do `body` da web, e o corpo das
   peças da referência é 14. Com 16, tudo o que herda do `body` sairia maior que as peças ao lado.
2. **No telefone os nomes pequenos sobem um degrau** (`xs`→14, `sm`/`md`→16). É o que o pacote
   nativo da referência faz. Os componentes não trocaram de `size`; quem traduz o papel é o mapa do `text.tsx`.
3. **Na web, o texto digitado nos campos sobe para 16 abaixo de 640px.** É a regra deles.
   A razão é do Safari do iPhone: um campo com letra menor que 16 faz a
   página ampliar sozinha quando ganha foco.

## O que ficou de fora, declarado

- **O `line-height` continua sendo a regra da Aurea**, um multiplicador por papel, e não a
  entrelinha fixa de cada degrau dessa escala. Mudar isso mexe na altura de toda cápsula, e a
  decisão foi sobre tamanho de letra.
- **O que o consumidor escreve fora das peças segue o `body`, com 14.** Um parágrafo solto do app
  sai com 14, e na referência sairia com os 16 do navegador. Isso é deliberado; o motivo está na
  escolha 1.
