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
| Componentes exportados por `@aurea-uds/react` | 138 |
| Fichas de registry | 138 |
| Hooks públicos com ficha | 10 |
| Maturidade declarada nas fichas | Deprecated 1 · Ready 49 · Stable 110 |
| Receitas de arquétipo (`patterns/*.md`) | 23 |
| Classes declaradas no CSS do core | 1018 |

## Tokens

| Métrica | Valor |
|---|---|
| Declarações emitidas | 1026 |
| Nomes distintos | 241 |
| Nomes referenciados pelo core | 193 |
| Nomes nunca referenciados pelo core | 48 |

## Catálogo gerado

| Tipo de página | Quantidade |
|---|---|
| Componente | 227 |
| Pattern | 234 |
| Block | 15 |
| Recipe | 23 |
| Documentação | 85 |
| Índice de área | 11 |
| **Total** | **595** |

## Cobertura das fichas

| Campo | Fichas que declaram |
|---|---|
| `props` (contrato de API publicado) | 150 de 138 |
| `variants` | 31 de 138 |
| `sizes` | 36 de 138 |
| `states` | 135 de 138 |
| `tokens` | 139 de 138 |
| `a11y.apg` | 156 de 138 |

## Conteúdo do catálogo

| Origem | Arquivos |
|---|---|
| Componentes com conteúdo próprio | 44 de 138 |
| Componentes com starter (preview + código mínimos) | 104 de 138 |
| Patterns com conteúdo | 80 |
| Blocks com conteúdo | 2 |
| Receitas com preview | 23 de 23 |

Todo item tem preview e código — é o núcleo do modelo de página decidido na
[ADR-0001](decisions/0001-modelo-de-pagina-do-catalogo.md). Os 104 componentes de
starter têm o mínimo do modelo e ainda não têm `features` nem `examples`. O contrato de API está publicado nas 138: o achado **M8** fechou na Parte E do [`PLANO-1.0.md`](PLANO-1.0.md).

## Garantias automáticas

| Métrica | Valor |
|---|---|
| Chamadas de `test()` nos testes unitários | 2305 |
| Componentes citados nos testes unitários | 158 de 138 |
| Specs de navegador (Playwright) | 72 |
| Baselines de screenshot no repositório | 48 |
| Baselines `-linux.png` (o que a CI compara) | 24 |

Com 24 baselines `-linux.png` no repositório, o **gate de pixel está ATIVO**: o
passo de screenshot da CI compara e bloqueia. Fechou o follow-up A4 da auditoria de
18/07/2026, aberto desde então. Os `-win32.png` servem à execução local nesta máquina e
não são comparados pela CI.
