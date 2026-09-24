# ADR-0029 — A página de tokens mostra o nome REAL e sob qual seletor ele vale

- **Data:** 15/08/2026
- **Estado:** aceita
- **Fecha:** o defeito irmão achado pela sessão paralela que corrigiu o `[object Object]` (`8b1ca56`)
- **Autoria:** medição do Opus, sob autorização do Victor

## Contexto

A sessão paralela que corrigiu o `[object Object]` da coluna *Value* achou um irmão e **parou de
propósito**, porque havia decisão de apresentação no meio. Fez certo: o conserto óbvio esconde
informação.

**O defeito, medido no navegador em 15/08/2026 — e é maior do que o relato:**

| | antes |
|---|---:|
| chips mostrando um nome que **não existe** no CSS | **261 de 261** |
| amostras de cor computando `rgba(0,0,0,0)` (caixa vazia) | **153 de 153** |
| réguas de dimensão caindo em `auto` (todas do mesmo tamanho) | **84 de 84** |

A página inteira de referência de token estava dizendo o que não é.

**A causa é de uma linha.** O `flattenTokens` do gerador do catálogo montava o nome com o
**caminho** (`base-brand-yellow`, `theme-dark-chart-1`), e o `build-tokens.mjs` emite a **folha**
(`--brand-yellow`) sob o seletor do grupo. O caminho nunca foi nome de variável nenhuma, então
`var(--base-brand-yellow)` não resolvia — e valor que não resolve não dá erro: dá transparente.

**Por que nenhum gate viu:** o check 17 pergunta se a página tem conteúdo, não se o conteúdo é
verdade. E as 102 fichas do registry sempre usaram a folha (`--card`, `--border`), então a
paridade token ⟷ core (check 5) continuava verde. O defeito morava só aqui.

## A decisão que travava, e o número que a resolveu

Trocar o caminho pela folha esbarra numa coisa real: **a folha sozinha não identifica a linha.**
Medido — **70 dos 175 nomes valem em mais de um grupo**:

| padrão | quantos |
|---|---:|
| `theme.dark` + `theme.light` | 56 |
| `base` + as três densidades | 8 |
| `base` + `theme.light` | 6 |

`--chart-1` é dark **e** light. `--control-h-md` é base **e** compact **e** comfortable **e**
spacious. Mostrar só a folha produziria linhas visualmente idênticas com valores diferentes.

**Isso não é ambiguidade a esconder — é como o CSS funciona.** A mesma variável, redefinida sob
outro seletor, é o mecanismo que dá tema e densidade a esta casa.

## Decisão

**A página de tokens mostra o nome REAL da variável (`--chart-1`) e ganha uma coluna dizendo sob
qual SELETOR aquele valor vale** (`:root`, `[data-theme="dark"]`, `[data-density="compact"]`…).

O seletor sai do próprio `$extensions.ui.aurea.selectors` do arquivo de tokens — a **mesma** fonte
que o `build-tokens.mjs` usa para emitir o CSS. Escrever um segundo mapa no gerador do catálogo
seria a segunda verdade que aquele arquivo acabou de aprender a não ter.

### E a amostra carrega o próprio escopo

Não bastava consertar o nome. Com `var(--chart-1)` solto, a linha de `theme.light` seria pintada
com o valor de `dark` numa página escura — **mentira mais discreta que a caixa vazia, e por isso
pior**. Então o atributo do grupo vai na **própria amostra** (`data-theme="light"` no `<span>`), e
o `var()` resolve na definição que aquela linha documenta.

É a cascata usada como foi desenhada, em vez de contornada — e vale para as 261 linhas sem caso
especial nenhum.

### Provado, não presumido

Depois da correção, medido no navegador nos dois temas:

- amostras transparentes: **0** (eram 153);
- larguras distintas de régua: **41** (era 1);
- dos **56** pares dark/light, **44 pintam diferente** — e os **12** que pintam igual são
  exatamente os invariáveis por design (`--primary` e derivados, `--focus`, os cinco `--chart-*`).
  A regra do `CLAUDE.md` — *"amarelo primário invariável entre temas"* — aparece na medição.

Os 12 são a prova de que o escopo funciona: se ele não estivesse valendo, ou tudo diferiria, ou
nada.

## Consequências

- **A coluna nova é permanente.** Quem "simplificar" de volta para três colunas reintroduz o
  defeito, porque o nome sozinho não basta para 70 dos 175.
- **Quem mais tinha esse problema? Ninguém**, e foi verificado: só esta página construía nome de
  variável a partir do caminho. O serializador (`token-value.mjs`) e as 102 fichas sempre usaram a
  folha.
- **O gate continua sem cobrir isso.** Nenhum check pergunta "a amostra pinta alguma coisa?", e o
  do pixel só acusa mudança, não erro. Quem pegou foi medição no navegador — e fica registrado
  que essa classe de defeito (valor que não resolve e falha em silêncio) **não tem trava**.
