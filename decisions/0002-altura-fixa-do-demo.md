# ADR-0002 — O demo tem altura fixa, e o preview pequeno flutua

- **Data:** 30/07/2026
- **Estado:** aceita (mantém a decisão original do Victor, agora com o custo medido)
- **Registra:** o achado **B1** da auditoria de 26/07/2026, e fecha a tarefa **T7.7**
- **Autoria:** decisão do Victor (24/07/2026, no comentário do gerador: "nada de rolar pra ver
  o exemplo, nem no monitor de 14\""). Esta ADR não a reabre — ela escreve o preço.

## Contexto

`scripts/build-catalog.mjs` declara, no chrome do catálogo:

```css
.demo { --demo-height:clamp(14rem, calc(100dvh - 19rem), 32rem); height:var(--demo-height); }
```

É `height`, não `min-height`: **toda** demo da mesma tela mede o mesmo, e o demo cabe na
primeira tela sem rolagem. Isso é o que o Victor pediu, e continua valendo.

O achado B1 registrou o efeito colateral sem número. Medido em 30/07/2026, janela 1280×720,
`apps/catalog/kbd.html`:

| Medida | Valor |
|---|---|
| Caixa do demo | 416px |
| Painel de preview | 362px |
| Conteúdo do preview (`Press ⌘ K to search.`) | **21px** |
| Vazio | **341px — 94% do painel** |

Um preview de uma linha ocupa a mesma caixa de um preview de tela cheia. Lido cru, isso parece
layout quebrado — e é a leitura que o achado B1 nomeia.

## Alternativas

**A. `min-height` em vez de `height`.** Rejeitada por ora. Resolve o vazio e **quebra o pedido**:
as demos passam a ter alturas diferentes na mesma página, e uma demo grande volta a empurrar o
conteúdo para fora da primeira tela. Era o estado anterior, e foi trocado de propósito.

**B. Altura por item (o conteúdo declara a sua).** Rejeitada: transfere para cada arquivo de
conteúdo uma decisão de layout, e 169 páginas com altura ad-hoc é o oposto de padrão único —
seria o achado I2 reaparecendo por outra porta.

**C. Manter `height` e declarar o custo.** Escolhida.

## Decisão

A altura fixa fica. O custo fica **escrito**: preview de uma linha mostra ~94% de vazio, e isso
é consequência aceita de "todo demo mede o mesmo e nenhum exige rolagem".

O caminho de conserto **não** é mexer na altura: é o conteúdo crescer. Um preview que preenche a
caixa é um preview que mostra mais de um estado do componente — que é justamente o que o achado
**M8** (`features`/`examples` em 44 componentes) cobra. Os 44 starters escritos na Fase 7 são o
mínimo do modelo, não o alvo.

## Como isso é obrigado

Nada gateia "vazio no preview", e é deliberado: seria gatear gosto. O que existe é o gate de
geometria — todo demo da mesma página mede o mesmo —, e ele continua valendo.

## Consequências

**Boas:** nenhuma demo exige rolagem; a página tem ritmo previsível; comparar dois componentes é
comparar duas caixas iguais.

**Custos, declarados:** os previews de uma linha (Kbd, Badge, Breadcrumb, Pagination) leem como
caixa vazia até ganharem conteúdo. É dívida de CONTEÚDO, e o M8 é onde ela mora.

**Revisão:** se um preview pequeno chegar em revisão do Victor como defeito visual depois de o M8
fechar, a alternativa A volta à mesa — com o gate de geometria medindo a diferença antes.
