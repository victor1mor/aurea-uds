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
| Componentes exportados por `@aurea-uds/react` | 125 |
| Fichas de registry | 125 |
| Hooks públicos com ficha | 9 |
| Maturidade declarada nas fichas | Deprecated 1 · Ready 44 · Stable 89 |
| Receitas de arquétipo (`patterns/*.md`) | 23 |
| Classes declaradas no CSS do core | 737 |

## Tokens

| Métrica | Valor |
|---|---|
| Declarações emitidas | 467 |
| Nomes distintos | 222 |
| Nomes referenciados pelo core | 174 |
| Nomes nunca referenciados pelo core | 48 |

## Catálogo gerado

| Tipo de página | Quantidade |
|---|---|
| Componente | 134 |
| Pattern | 219 |
| Block | 15 |
| Recipe | 23 |
| Índice de área | 6 |
| **Total** | **397** |

## Cobertura das fichas

| Campo | Fichas que declaram |
|---|---|
| `props` (contrato de API publicado) | 125 de 125 |
| `variants` | 18 de 125 |
| `sizes` | 24 de 125 |
| `states` | 108 de 125 |
| `tokens` | 126 de 125 |
| `a11y.apg` | 130 de 125 |

## Conteúdo do catálogo

| Origem | Arquivos |
|---|---|
| Componentes com conteúdo próprio | 29 de 125 |
| Componentes com starter (preview + código mínimos) | 105 de 125 |
| Patterns com conteúdo | 80 |
| Blocks com conteúdo | 2 |
| Receitas com preview | 23 de 23 |

Todo item tem preview e código — é o núcleo do modelo de página decidido na
[ADR-0001](decisions/0001-modelo-de-pagina-do-catalogo.md). Os 105 componentes de
starter têm o mínimo do modelo e ainda não têm `features` nem `examples`. O contrato de API está publicado nas 125: o achado **M8** fechou na Parte E do [`PLANO-1.0.md`](PLANO-1.0.md).

## Garantias automáticas

| Métrica | Valor |
|---|---|
| Chamadas de `test()` nos testes unitários | 1627 |
| Componentes citados nos testes unitários | 132 de 125 |
| Specs de navegador (Playwright) | 37 |
| Baselines de screenshot no repositório | 44 |
| Baselines `-linux.png` (o que a CI compara) | 22 |

Com 22 baselines `-linux.png` no repositório, o **gate de pixel está ATIVO**: o
passo de screenshot da CI compara e bloqueia. Fechou o follow-up A4 da auditoria de
18/07/2026, aberto desde então. Os `-win32.png` servem à execução local nesta máquina e
não são comparados pela CI.
