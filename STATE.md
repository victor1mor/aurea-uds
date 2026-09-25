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
| Componentes exportados por `@aurea-uds/react` | 116 |
| Fichas de registry | 116 |
| Hooks públicos com ficha | 9 |
| Maturidade declarada nas fichas | Ready 42 · Stable 83 |
| Receitas de arquétipo (`patterns/*.md`) | 23 |
| Classes declaradas no CSS do core | 559 |

## Tokens

| Métrica | Valor |
|---|---|
| Declarações emitidas | 407 |
| Nomes distintos | 189 |
| Nomes referenciados pelo core | 140 |
| Nomes nunca referenciados pelo core | 49 |

## Catálogo gerado

| Tipo de página | Quantidade |
|---|---|
| Componente | 125 |
| Pattern | 204 |
| Block | 15 |
| Recipe | 23 |
| Índice de área | 6 |
| **Total** | **373** |

## Cobertura das fichas

| Campo | Fichas que declaram |
|---|---|
| `props` (contrato de API publicado) | 116 de 116 |
| `variants` | 15 de 116 |
| `sizes` | 20 de 116 |
| `states` | 103 de 116 |
| `tokens` | 117 de 116 |
| `a11y.apg` | 121 de 116 |

## Conteúdo do catálogo

| Origem | Arquivos |
|---|---|
| Componentes com conteúdo próprio | 27 de 116 |
| Componentes com starter (preview + código mínimos) | 98 de 116 |
| Patterns com conteúdo | 77 |
| Blocks com conteúdo | 2 |
| Receitas com preview | 23 de 23 |

Todo item tem preview e código — é o núcleo do modelo de página decidido na
[ADR-0001](decisions/0001-modelo-de-pagina-do-catalogo.md). Os 98 componentes de
starter têm o mínimo do modelo e ainda não têm `features` nem `examples`. O contrato de API está publicado nas 116: o achado **M8** fechou na Parte E do [`PLANO-1.0.md`](PLANO-1.0.md).

## Garantias automáticas

| Métrica | Valor |
|---|---|
| Chamadas de `test()` nos testes unitários | 1172 |
| Componentes citados nos testes unitários | 123 de 116 |
| Specs de navegador (Playwright) | 22 |
| Baselines de screenshot no repositório | 44 |
| Baselines `-linux.png` (o que a CI compara) | 22 |

Com 22 baselines `-linux.png` no repositório, o **gate de pixel está ATIVO**: o
passo de screenshot da CI compara e bloqueia. Fechou o follow-up A4 da auditoria de
18/07/2026, aberto desde então. Os `-win32.png` servem à execução local nesta máquina e
não são comparados pela CI.
