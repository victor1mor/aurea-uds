# Critérios de qualidade — quando uma coisa está pronta

Existe por causa do achado **M19**: não havia definição de "concluído". Sem ela, "pronto"
significa "eu parei", e foi assim que 59 de 65 fichas se declararam `Stable` sem teste.

Cada item diz **quem cobra**. Onde há gate, o gate é a verdade — critério sem gate é intenção, e
a auditoria inteira é sobre a diferença entre as duas coisas.

Era a proposta do §"Critérios de qualidade objetivos" do plano de auditoria; virou documento
canônico na Fase 10, corrigido onde a execução mostrou que a proposta estava errada.

---

## Para COMEÇAR um componente

| # | Critério | Quem cobra |
|---|---|---|
| 1 | Nome, `category` e `layer` decididos conforme `DIRECTION.md` | check 11 (enums) |
| 2 | Referência externa analisada e **registrada** em `REFERENCES.md` — anatomia, estados, teclado | **check 21** (para componente construído sob o `BUILDING.md`) |
| 3 | Padrão APG identificado, ou a ausência registrada junto da prática adotada | pessoa; o campo `a11y.apg` da ficha |

O item 2 é o que impede construir de memória. O procedimento está em
[`BUILDING.md`](BUILDING.md); o registro, em `REFERENCES.md`. Deixou de ser cobrado por lembrança
em 31/07/2026, quando a biblioteca foi publicada e construir errado passou a custar versão.

## Para ser FUNCIONAL

| # | Critério | Quem cobra |
|---|---|---|
| 4 | Renderiza nos 2 temas e 3 densidades **sem valor cru novo** | check 12 (catraca de px/raio/fonte/peso/entrelinha) |
| 5 | Estados: default, hover, focus-visible, active, disabled — mais os do papel | pessoa |
| 6 | Teclado conforme APG; foco visível pelo contrato de foco | `geometry.spec.ts` (contrato de foco) |
| 7 | Ficha válida com `tokens`, `states`, `a11y.role` e `a11y.keyboard` | check 11 |
| 8 | Toda classe que o componente emite **tem regra no core** | check 18 (o nome) |
| 8b | E a regra **faz alguma coisa**, com só o core carregado | `tests/visual/skin.spec.ts` (o efeito) |

O 8 nasceu na Fase 7: nove componentes públicos renderizavam sem pele (achado **A13**), e
ninguém percebia porque a página do catálogo os mostrava dentro de um chrome que os estilizava.

**O 8b entrou na Fase 11, e entrou porque o 8 foi provado contra o defeito.** O check 18 olha
NOME: trocando a regra do `.grid` por `.grid { }` ele continua verde. Um componente novo precisa
das duas coisas — a regra e uma asserção no `skin.spec.ts` que reprove se a regra virar vazia.

## Para ser DOCUMENTADO

| # | Critério | Quem cobra |
|---|---|---|
| 9 | `props` publicadas e batendo com a assinatura TypeScript | check 11 (formato) + check 22 (a ficha completa) + check 28 (`source.react` aponta para quem declara); o achado **M8 fechou** na Parte E, 07/08/2026 |
| 10 | Um exemplo por feature declarada, com Preview e Código equivalentes | pessoa |
| 11 | Página no modelo do tipo, sem seção faltando | gerador + `catalog-sweep` ([ADR-0001](../decisions/0001-modelo-de-pagina-do-catalogo.md)) |
| 12 | Preview **e** código existem — em todo tipo de item | check 17 |
| 12b | **A prévia RODA: hidrata e responde ao toque/teclado.** Marcação morta não conta como prévia | pessoa, abrindo e interagindo — o gate ainda não existe (ver abaixo) |

**O 12b é ordem do Victor, 20/08/2026, e vale para TODOS os componentes:** *"quero ver eles
dinamicos, nada de coisa estatico pois eu não sei se funciona de verdade e não confio em sua
palavra"*.

E ele tem o precedente do lado dele: o `Tooltip` do trilho recolhido existia no código, passava
no teste unitário e **não abria na página**, porque a prévia era HTML estático — o defeito viveu
até 20/08/2026 com todos os gates verdes ([ADR-0035](../decisions/0035-sidebar-responsivo-sem-inventar-recursos.md)).
Print prova DESENHO; só a interação prova COMPORTAMENTO.

O runtime existe desde a mesma data (`apps/catalog/assets/live.js`, IIFE clássico que roda até
aberto por `file://`), então prévia estática deixou de ter desculpa de infraestrutura.

**O gate que falta, escrito aqui para não virar lembrança:** hoje quem cobra é pessoa, e
critério sem gate é intenção — está no topo deste documento. O controle certo varre as páginas
com `embed`, confirma que a raiz hidratou (`__reactContainer$` no nó) e reprova quem ficou
estático. `tests/visual/sidebar-responsive.spec.ts` já faz isso para UM componente; falta
generalizar.

## Para ser `Stable`

| # | Critério | Quem cobra |
|---|---|---|
| 13 | Tudo acima | — |
| 14 | Teste de interação e de teclado | check 16 (exige menção em teste; não julga qualidade) |
| 15 | axe verde, inclusive com overlay **aberto** | `tests/unit/overlays.test.tsx`, `catalog-sweep` |
| 16 | Geometria única por classe, nas 3 densidades e 2 temas | `geometry.spec.ts` |
| 17 | `ref` chega e cai no elemento que o tipo promete | `tests/unit/ref.test.tsx` |
| 18 | Nenhum achado aberto de severidade ≥ MÉDIO sobre ele | pessoa, contra `02-ACHADOS.md` §0 |

**O item 17 estava errado na proposta.** Ele dizia "`forwardRef` se renderiza elemento DOM". A
Fase 3 mediu: no React 19 `ref` é prop comum e chega sozinho — o que faltava era o **tipo** e a
promessa de `react>=18` no `peerDependencies`. Escrever 40 `forwardRef` teria sido trabalho
grande contra um problema que já não existia. O critério é o comportamento, não a técnica.

## Para PUBLICAR uma versão

| # | Critério | Quem cobra |
|---|---|---|
| 19 | `python scripts/validate.py` OK | ele mesmo — quantos checks são está em `manifest.json` (`gates.validate`), medido, porque escrever o número aqui é o achado I1 e esta linha já esteve vencida em três |
| 19 | `python scripts/validate.py` OK | ele mesmo (**30 checks**) |
| 20 | `pnpm test` verde | vitest |
| 21 | Gates duros de Playwright verdes | `pnpm exec playwright test` |
| 22 | **Gate de pixel ativo e verde** | **sim, desde a Fase 10**: 48 baselines `-linux.png` no repositório; a CI compara e bloqueia. ⚠️ **Mas ele não é estrito**: `maxDiffPixels: 0` sem `threshold: 0` tolera 20% de desvio de cor POR PIXEL. Medido em 21/08/2026 — uma mudança de cor passou. Ver `G-GATE-01` |
| 22b | **Contraste AA em toda célula de aparência × tom** | `tests/visual/tone-contrast.spec.ts`: 30 células, 2 temas, no navegador — 4,5:1 no rótulo (SC 1.4.3), 3:1 na borda (SC 1.4.11). Achou um defeito já publicado no dia em que nasceu |
| 22c | **O que o runtime vanilla faz, o React faz** | check 28: cada capacidade de `window.Aurea` precisa de contraparte declarada, ou de ausência declarada com motivo |
| 23 | Build com árvore limpa (`dist == build`) | passo "Falhar se dist desatualizado" da CI |
| 24 | `pnpm audit --audit-level=high` limpo | CI |
| 25 | Estado regerado (`STATE.md`) | check 13 |
| 26 | Só `dist/` entra no tarball | `scripts/check-pack.mjs` (baseline versionado), na CI ([ADR-0010](../decisions/0010-distribuicao-npm-publico.md)) |
| 26b | Publish pelo caminho da [ADR-0013](../decisions/0013-mecanica-de-publicacao-npm.md), sem token de longa duração no repositório | pessoa; `publishConfig.access` está nos seis pacotes |

## Para ACEITAR uma alteração

| # | Critério | Quem cobra |
|---|---|---|
| 27 | **Causa raiz nomeada.** Se a correção é local, está escrito por que a causa raiz não foi tocada — e isso vira tarefa | revisão |
| 28 | **Existe controle automático que pegaria a regressão.** Se não existe, ele entra no mesmo commit | revisão |
| 29 | O controle foi **provado contra o defeito** — reintroduzir o problema e ver reprovar | revisão |

O 27 e o 28 são o que teria evitado A2, A3 e A4: em todos, uma correção local foi aceita sem
controle e sem perguntar "quem mais tem esse problema?".

O 29 não estava na proposta e entrou porque as fases 7, 8 e 9 pegaram, cada uma, um defeito real
**no próprio gate** ao tentar prová-lo — inclusive um gate que passava porque media identificador
de código como se fosse classe de CSS.
