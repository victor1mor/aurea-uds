# ADR-0033 — O raio da linha sai de uma CONTA, não de um número: filho = pai − padding

- **Data:** 18/08/2026
- **Estado:** aceita
- **Autoria:** achado do Victor num print; medição e execução do Opus, com autorização escrita dele em 18/08/2026
- **Toca a identidade:** sim — é a primeira exceção autorizada à pílula em controle

## Contexto

O Victor riscou de vermelho o canto de uma linha dentro de um card e disse que a curva "não segue a
mesma distância". Estava certo, e o erro é **geométrico**, medido:

| | |
|---|---|
| Altura da linha (com segunda linha de texto) | 53,5px |
| Raio declarado na linha | `999px` (`--radius-control`) |
| Raio que o navegador **desenha** | **26,8px** — a metade da altura |
| Padding do card | 4px |
| Raio do card | 22px |
| Raio que o card precisaria para o vão ser constante | 30,8px |
| **Erro** | **8,8px** |

**E a pílula não tem conserto por ajuste do pai:** `999px` nunca desenha 999 — o navegador limita à
metade da menor dimensão. Então o raio efetivo da pílula **muda com a altura da linha**: 21px numa
linha de um texto, 26,8px numa de dois. Qualquer raio de card acerta um caso e erra o outro.

## Decisão

**Raio do filho = raio do pai − padding do pai.** Escrito como `calc()` no CSS, não como número:

```css
border-radius: calc(var(--radius-card) - var(--space-1));
```

Aplicado em `.nav-list-row` e em `.sidebar-item`. Hoje resolve **18px** (22 − 4). Se alguém mudar o
raio do card ou o padding do painel, a linha segue sozinha — número cravado divergiria em silêncio.

**Junto veio o painel apertado:** `.sidebar` passou de `--space-4` (16px) para `--space-1` (4px), o
mesmo que `.card:has(> .nav-list)` já fazia. E a `.sidebar-group-label` passou a alinhar com o TEXTO
do item (4 + 12 = 16px) em vez de com a borda.

## O que a pesquisa confirmou (18/08/2026, `Referencia/heroui-3`, Apache-2.0)

O HeroUI faz a mesma conta, e o padrão é **sistêmico**:

| Componente | Padding do painel | Raio do item |
|---|---:|---:|
| `list-box` | `p-1` = 4px | `rounded-2xl` = 16px |
| `menu` | `p-1` = 4px | `rounded-2xl` = 16px |
| `tabs` | `p-1` = 4px | `rounded-3xl` = 24px |

**O raio do item MUDA entre os componentes deles** — porque cada painel tem raio próprio e o item
segue a conta. Não é um número copiado: é a relação. E o painel do `tabs` deles é escrito como
`calc(var(--radius) * 2.5)`, ou seja, eles também expressam raio como conta.

`list-box-item.css` e `menu-item.css` têm a **mesma linha, idêntica** — a prova de que é padrão da
casa deles e não escolha por componente.

## A exceção à identidade, e o tamanho dela

O `CLAUDE.md` manda pílula (`--radius-control`, 999px) em controle. **Linha de lista dentro de
painel deixa de ser pílula**, e só ela. Botão, campo, filtro e tab textual seguem em pílula — nada
mais muda.

Autorizado por escrito pelo Victor em 18/08/2026, depois de comparar as duas versões em print.

## Adendo — 18/08/2026: o painel RENTE não quebra a conta, e o motivo é como ela foi escrita

Quando o Victor autorizou a lateral **rente**, a armadilha estava prevista: se o painel tem raio
**0**, `raio do pai − padding` daria **negativo**, e as linhas virariam retângulos vivos. Nas
referências elas continuam arredondadas dentro do painel reto.

**Não quebrou, e por sorte nenhuma:** o `calc()` foi escrito contra o **token**
(`var(--radius-card) - var(--space-1)`), não contra o raio computado do painel. Então a linha
resolve 18px em qualquer painel — rente ou flutuante —, e o `skin.spec` cobra isso: o raio da linha
é o **mesmo** nas duas variantes, e maior que zero na rente.

**A regra, então, dita com precisão:** `filho = pai − padding` descreve um painel em forma de
**card**. Painel rente é outro caso, e ali o raio da linha é **escolha** — e a escolha foi manter
os 18px, que é o que as referências mostram.

## Como isso é obrigado

`tests/visual/skin.spec.ts` mede o raio **EFETIVO** (não o declarado) e exige
`raio da linha + padding do painel − raio do painel ≈ 0`, mais uma segunda asserção de que a linha
não volta a ser pílula. **Provado contra o defeito:** repondo `--radius-control`, reprova com
`Received: 8.8`.
