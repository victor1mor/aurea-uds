# Estado do projeto — Aurea UDS

<!-- GERADO. Não editar à mão.
     Regravar:  python scripts/validate.py --write-state
     O check 13 do validador falha se este arquivo divergir da contagem real.
     Existe por causa do achado I1 da auditoria de 26/07/2026: nove números de estado
     escritos à mão em quatro documentos, todos errados. -->

Documento canônico do **estado**. `AUREA.md` traz visão e arquitetura; `ROADMAP.md`,
as etapas; aqui ficam os números — e eles são medidos, não escritos.

## Biblioteca

| Métrica | Valor |
|---|---|
| Componentes exportados por `@aurea-uds/react` | 135 |
| Fichas de registry | 135 |
| Hooks públicos com ficha | 9 |
| Maturidade declarada nas fichas | Deprecated 1 · Ready 47 · Stable 96 |
| Receitas de arquétipo (`patterns/*.md`) | 23 |
| Classes declaradas no CSS do core | 878 |

## Tokens

| Métrica | Valor |
|---|---|
| Declarações emitidas | 467 |
| Nomes distintos | 222 |
| Nomes referenciados pelo core | 175 |
| Nomes nunca referenciados pelo core | 47 |

## Catálogo gerado

| Tipo de página | Quantidade |
|---|---|
| Componente | 144 |
| Pattern | 219 |
| Block | 15 |
| Recipe | 23 |
| Índice de área | 8 |
| **Total** | **409** |

## Cobertura das fichas

| Campo | Fichas que declaram |
|---|---|
| `props` (contrato de API publicado) | 135 de 135 |
| `variants` | 27 de 135 |
| `sizes` | 31 de 135 |
| `states` | 119 de 135 |
| `tokens` | 136 de 135 |
| `a11y.apg` | 140 de 135 |

## Conteúdo do catálogo

| Origem | Arquivos |
|---|---|
| Componentes com conteúdo próprio | 42 de 135 |
| Componentes com starter (preview + código mínimos) | 102 de 135 |
| Patterns com conteúdo | 80 |
| Blocks com conteúdo | 2 |
| Receitas com preview | 23 de 23 |

Todo item tem preview e código — é o núcleo do modelo de página decidido na
[ADR-0001](decisions/0001-modelo-de-pagina-do-catalogo.md). Os 102 componentes de
starter têm o mínimo do modelo e ainda não têm `features` nem `examples`. O contrato de API está publicado nas 135: o achado **M8** fechou na Parte E do [`PLANO-1.0.md`](PLANO-1.0.md).

## Garantias automáticas

| Métrica | Valor |
|---|---|
| Chamadas de `test()` nos testes unitários | 1989 |
| Componentes citados nos testes unitários | 142 de 135 |
| Specs de navegador (Playwright) | 39 |
| Baselines de screenshot no repositório | 46 |
| Baselines `-linux.png` (o que a CI compara) | 22 |

Com 22 baselines `-linux.png` no repositório, o **gate de pixel está ATIVO**: o
passo de screenshot da CI compara e bloqueia. Fechou o follow-up A4 da auditoria de
18/07/2026, aberto desde então. Os `-win32.png` servem à execução local nesta máquina e
não são comparados pela CI.
