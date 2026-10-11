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
| Componentes exportados por `@aurea-uds/react` | 128 |
| Fichas de registry | 128 |
| Hooks públicos com ficha | 9 |
| Maturidade declarada nas fichas | Deprecated 1 · Ready 44 · Stable 92 |
| Receitas de arquétipo (`patterns/*.md`) | 23 |
| Classes declaradas no CSS do core | 781 |

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
| Componente | 137 |
| Pattern | 219 |
| Block | 15 |
| Recipe | 23 |
| Índice de área | 6 |
| **Total** | **400** |

## Cobertura das fichas

| Campo | Fichas que declaram |
|---|---|
| `props` (contrato de API publicado) | 128 de 128 |
| `variants` | 25 de 128 |
| `sizes` | 26 de 128 |
| `states` | 112 de 128 |
| `tokens` | 129 de 128 |
| `a11y.apg` | 133 de 128 |

## Conteúdo do catálogo

| Origem | Arquivos |
|---|---|
| Componentes com conteúdo próprio | 35 de 128 |
| Componentes com starter (preview + código mínimos) | 102 de 128 |
| Patterns com conteúdo | 80 |
| Blocks com conteúdo | 2 |
| Receitas com preview | 23 de 23 |

Todo item tem preview e código — é o núcleo do modelo de página decidido na
[ADR-0001](decisions/0001-modelo-de-pagina-do-catalogo.md). Os 102 componentes de
starter têm o mínimo do modelo e ainda não têm `features` nem `examples`. O contrato de API está publicado nas 128: o achado **M8** fechou na Parte E do [`PLANO-1.0.md`](PLANO-1.0.md).

## Garantias automáticas

| Métrica | Valor |
|---|---|
| Chamadas de `test()` nos testes unitários | 1679 |
| Componentes citados nos testes unitários | 135 de 128 |
| Specs de navegador (Playwright) | 37 |
| Baselines de screenshot no repositório | 44 |
| Baselines `-linux.png` (o que a CI compara) | 22 |

Com 22 baselines `-linux.png` no repositório, o **gate de pixel está ATIVO**: o
passo de screenshot da CI compara e bloqueia. Fechou o follow-up A4 da auditoria de
18/07/2026, aberto desde então. Os `-win32.png` servem à execução local nesta máquina e
não são comparados pela CI.
