# Plano de correção e critérios de qualidade — proposta

Cada fase exige `PODE IMPLEMENTAR` do Victor, uma por vez, como manda `CLAUDE.md`.

> **Estado das fases:** a tabela é em `02-ACHADOS.md` §0 — um lugar só, para não haver
> dois placares que discordam. Fases 1 e 2 estão executadas; as outras seguem propostas.

Ordem escolhida por **causa raiz**, não por severidade nominal. A justificativa de cada
posição está em "Por que aqui".

---

## Visão geral

| Fase | Objetivo | Achados | Custo | Risco |
|---|---|---|---|---|
| 1 | O mapa passa a ser verdade e a se manter verdade | I1 | baixo | baixo |
| 2 | Geometria de componente deixa de depender do contexto | A1 A2 A3 B3 B2 | baixo | baixo |
| 3 | Configuração entra pelo provider, não por prop repetida | A4 M14 M9 | baixo | baixo |
| 4 | Fronteira do core: sistema ≠ documentação ≠ produto | A6 M6 | médio | médio |
| 5 | Comportamento acessível passa a ser testado | A7 M10 M12 | médio | baixo |
| 6 | Fundações completas e sem valor cru novo | M1 M2 M3 M4 M5 M15 M17 M18 | médio | baixo |
| 7 | Um modelo de página, decidido como dado | I2 M11 B1 | alto | médio |
| 8 | Navegação universal de verdade | A8 M13 | alto | médio |
| 9 | Pacote divisível | A5 | alto | médio |
| 10 | Governança: decisão, referência, critério, continuidade | M19 B4 B5 B6 | médio | baixo |
| 11 | A pele que falta (proposta, nasceu na Fase 7) | A13 | médio | médio |

Fases 1–3 são as mais baratas e as que mais reduzem risco futuro. Fase 2 **deleta**
mais linha do que acrescenta; fase 3 remove 40 repasses de prop.

---

## Fase 1 — O mapa passa a ser verdade

**Objetivo:** nenhum número de estado é escrito à mão.

**Por que aqui:** toda decisão seguinte parte do estado do projeto. Enquanto três
documentos discordarem, qualquer priorização é chute. Foi o que quebrou o começo desta
auditoria. É também a fase mais barata.

**Escopo:** `README.md`, `AUREA.md` §3, `ROADMAP.md`, `BUILD_REPORT.json`,
`scripts/validate.py`, um script novo de contagem.

**Dependências:** nenhuma. **Riscos:** nenhum técnico.

**Tarefas**

| ID | Tarefa | Critério de aceite |
|---|---|---|
| T1.1 | Script que conta a realidade: páginas por tipo, componentes, fichas por campo, conteúdo rico, testes, tokens usados/definidos | roda em <2 s, saída determinística |
| T1.2 | Seção de estado **gerada** (arquivo próprio, referenciado por `AUREA.md` e `README.md`) | o texto publicado é byte-idêntico ao recalculado |
| T1.3 | `validate.py` check 13: estado publicado == estado recalculado | falha ao alterar um número à mão |
| T1.4 | Corrigir as 9 afirmações erradas e remover ou regenerar `BUILD_REPORT.json` | nenhum número desatualizado resta |

**Testes:** o próprio check 13. **Doc:** `README.md`, `AUREA.md`, `ROADMAP.md`.
**Evidência esperada:** `python scripts/validate.py` falha ao editar "169" para "170".

---

## Fase 2 — Geometria de componente deixa de depender do contexto

**Objetivo:** duas coisas iguais medem igual, em qualquer densidade e qualquer contexto.

**Por que aqui:** é uma família de causa raiz única (altura derivada de contexto em vez
de token), é a classe de defeito que o Victor vê, e é mecanicamente gateável. Barata e
fecha um assunto por inteiro.

**Escopo:** `packages/core/src/aurea.css` (5 regras), `scripts/build-catalog.mjs`
(1 regra de chrome), 1 spec novo.

**Dependências:** nenhuma. **Riscos:** mudar altura de aba/segmented altera a barra
Preview/Code das 169 páginas → os 16 baselines de screenshot do catálogo precisam ser
regerados deliberadamente. Não é regressão, é a correção.

**Tarefas**

| ID | Tarefa | Critério de aceite |
|---|---|---|
| T2.1 | `.tab`, `.segmented button`, `.pagination button` derivam altura de `var(--control-h-*)` | as três medem o token nas 3 densidades |
| T2.2 | `line-height` explícito em toda classe com `min-height` e conteúdo de texto (`.badge`, `.kbd`, `.status`, `.step`, `.notification-count`, e o que a varredura achar) | altura única por classe, por página, nos 2 temas e nas 3 densidades |
| T2.3 | `.chip`: `white-space:nowrap` (ou truncamento declarado) | rótulo de 1 e de 60 caracteres dão a mesma altura |
| T2.4 | Investigar a terceira altura de `.btn-sm` (B3) | causa nomeada; corrigida ou registrada como intencional |
| T2.5 | `.btn-link`: decidir alvo de 24px ou registrar a exceção de link em linha (B2) | decisão registrada |
| T2.6 | Spec de geometria por estilo computado — gate duro, independente de plataforma | falha se qualquer classe da lista tiver mais de uma altura, ou se um controle não medir o token |

**Testes:** `tests/visual/geometry.spec.ts` novo, no padrão de `rtl.spec.ts`/`status.spec.ts`
(compara propriedade, não pixel → roda como gate duro no CI Linux).

**Evidência esperada:** tabela de alturas por densidade com um único valor por classe.

---

## Fase 3 — Configuração entra pelo provider

**Objetivo:** o consumidor configura o sistema uma vez.

**Por que aqui:** A4 é a causa raiz de um achado que a auditoria anterior deu por
fechado, e a correção **remove** 40 linhas de repasse. Custo negativo.

**Escopo:** `packages/react/src/index.tsx`, `README.md`, 1 teste.

**Dependências:** nenhuma. **Riscos:** a prop `spriteUrl` continua válida como override —
sem quebra de compatibilidade.

**Tarefas**

| ID | Tarefa | Critério de aceite |
|---|---|---|
| T3.1 | `AureaProvider` aceita `spriteUrl`; contexto novo; `Icon` lê do contexto com o default atual como fallback | app em subcaminho renderiza ícones sem prop |
| T3.2 | Remover os 40 repasses `spriteUrl={spriteUrl}` e as declarações de prop que só existiam para repassar | contagem de `spriteUrl` cai de 52 para ≤4 |
| T3.3 | `forwardRef` em todo componente que renderiza um elemento DOM único (M14) | teste monta cada um com `ref` e `current` não é nulo |
| T3.4 | Resolver `oracle` (M9): variante de sistema documentada nas três pontas, ou removida das três | união TS == `variants` da ficha == variantes do CSS |
| T3.5 | Gate: união de variante do TypeScript == `variants` da ficha | falha ao adicionar variante só num lado |
| T3.6 | `README.md` documenta configuração de sprite | seção existe |

**Evidência esperada:** diff com mais linhas removidas que adicionadas.

---

## Fase 4 — Fronteira do core

**Objetivo:** `@aurea-uds/core` contém o sistema, e só.

**Por que aqui:** é a maior fonte paralela de verdade que resta e bloqueia as fases 8
e 9. Vem depois de 1–3 porque exige decisão por classe (~230 delas), o que é trabalho de
triagem, não de conserto.

**Escopo:** `packages/core/src/aurea.css`, `apps/docs/index.html`, `examples/`,
`packages/contracts/`, `validate.py`.

**Dependências:** `apps/docs/index.html` usa as classes de chrome; a remoção completa só
acontece quando os docs manuais forem aposentados (Fase 3 da trilha Catálogo).
**Riscos:** ALTO se feito de uma vez — os 26 baselines de screenshot dos docs dependem
dessas classes. Fazer em duas etapas.

**Tarefas**

| ID | Tarefa | Critério de aceite |
|---|---|---|
| T4.1 | Classificar as ~230 classes sem componente React em: chrome de docs, mockup de produto, candidato a componente do sistema | tabela versionada, uma linha por classe, com destino |
| T4.2 | Gate de fronteira com allowlist explícita igual à baseline de px cru: a lista **não cresce** | classe nova no core sem componente React reprova |
| T4.3 | Mover chrome de docs para folha própria do app de docs | core encolhe; docs continuam pixel-idênticos |
| T4.4 | Mockups de produto → `examples/`, ou removidos | nenhuma classe de domínio de aplicação no core |
| T4.5 | Candidatos a sistema ganham componente React + ficha + conteúdo | zero classes na zona cinzenta |
| T4.6 | `component-inventory.json` (M6): gerar do registry com `dist == build`, ou remover do pacote | não existe artefato de 86 KB sem consumidor |

**Evidência esperada:** bytes do core por alcance, com "só docs" e "só catálogo" em zero.

---

## Fase 5 — Comportamento acessível testado

**Objetivo:** o que o README promete sobre foco e teclado é verificado por máquina.

**Por que aqui:** acessibilidade fundamental está acima de refinamento, e as fases
anteriores não mexem no comportamento dos overlays.

**Escopo:** `tests/unit/`, `tests/visual/`, `packages/core/src/aurea.css` (foco),
`validate.py`.

**Dependências:** nenhuma. **Riscos:** baixo.

**Tarefas**

| ID | Tarefa | Critério de aceite |
|---|---|---|
| T5.1 | Dialog, Drawer, Popover, Tooltip: 6 casos cada (foco entra, `Tab` circula, `Escape` fecha, foco retorna, papel/`aria-modal`, axe **aberto**) | 24 testes novos passam |
| T5.2 | Cobrir os outros 32 componentes sem teste, começando pelos de entrada | cobertura sobe de 29/65 para 65/65 |
| T5.3 | Contrato de foco (M10): uma cor, uma espessura, offsets justificados; remover `!important` da regra global | gate de estilo computado por família |
| T5.4 | Matriz de texto 200% no `catalog-sweep` (M12) e correção das larguras de shell | `scrollWidth <= clientWidth` com raiz em 32px, 169 páginas |
| T5.5 | Gate: componente com ficha `Stable` tem teste | falha ao marcar Stable sem teste |

**Evidência esperada:** axe verde com overlay aberto; contagem de componentes testados
igual à de componentes exportados.

---

## Fase 6 — Fundações completas

**Objetivo:** todo eixo visual tem token, e nenhum valor cru novo entra.

**Escopo:** `packages/tokens/src/aurea.tokens.json`, `packages/core/src/aurea.css`,
`validate.py`, `scripts/raw-px-baseline.json`.

**Dependências:** fase 4 (não vale tokenizar CSS que vai sair). **Riscos:** médio —
tocar raio e tipografia move pixel; os baselines precisam ser regerados de propósito.

**Tarefas**

| ID | Tarefa | Critério de aceite |
|---|---|---|
| T6.1 | Estender a catraca a raio, `font-size`, `font-weight`, `line-height` (M1) | contagem por eixo nunca sobe |
| T6.2 | Criar os eixos ausentes: peso, tamanho de ícone, letter-spacing, área de toque (M5) | os 4 existem e são consumidos |
| T6.3 | Decidir os 72 tokens sem uso (M2): promover, documentar como paleta pública, ou remover | zero tokens sem decisão registrada |
| T6.4 | Resolver duplicatas e unidades mistas (M3, M4) | nenhum par mesmo-valor sem referência; raio com unidade única |
| T6.5 | `$description` obrigatória para token semântico (M15) | gate confere |
| T6.6 | Registrar contrato de densidade (M17) e assimetria de tema (M18) | documento diz o que varia e o que não |
| T6.7 | `@layer aurea` no core e remoção dos 3 `!important` estruturais (M16) | consumidor sobrepõe sem `!important` |

---

## Fase 7 — Um modelo de página, decidido como dado

**Objetivo:** o padrão único do `AUREA.md` §2.0 passa a ser verdade na superfície que
o demonstra.

**Por que aqui:** é o achado mais caro e depende de uma **decisão** (D3) e de conteúdo
para 44 componentes. Vem depois de as fundações e a fronteira estarem firmes, senão o
modelo novo nasce sobre base que vai mudar.

**Dependências:** decidir D3 (`AUREA.md:196`); fases 4 e 6.
**Riscos:** médio-alto — regenera 169 páginas.

**Tarefas**

| ID | Tarefa | Critério de aceite | Estado (30/07/2026) |
|---|---|---|---|
| T7.1 | **Decisão D3** registrada como ADR: modelo igual para todos os tipos, ou núcleo + extras por tipo | ADR com alternativas e consequências | **concluída** — [ADR-0001](../../decisions/0001-modelo-de-pagina-do-catalogo.md), emendada com o que a execução mediu |
| T7.2 | Modelo de página como **dado** (seções, obrigatoriedade por tipo) consumido pelas 4 funções do gerador | uma fonte, quatro consumidores | **concluída** — `scripts/page-model.mjs`; as quatro funções viraram adaptadores de um `itemPage` |
| T7.3 | Recipes ganham preview/código, ou o tipo é redefinido como documento e isso é declarado | consumidor sabe o que pode copiar | **concluída** — 23 previews + código em `content/_recipes.mjs`; o que o preview mostra está declarado na emenda da ADR |
| T7.4 | Conteúdo rico para os 44 componentes restantes, no padrão do exemplar | `props`, `features` com exemplo por feature, `states` | **parcial, por decisão** — os 44 ganharam preview + código (o núcleo do modelo). `props`/`features`/`examples` é o achado **M8** e a ADR-0001 declara que ela garante a estrutura, não escreve o conteúdo |
| T7.5 | Gate: conjunto de seções por tipo | página divergente reprova | **concluída** — gerador se cobra antes de escrever; `catalog-sweep` cobra as 169 no navegador, inclusive "nenhuma seção fora do modelo". Provado contra o defeito nas duas pontas |
| T7.6 | Slug sempre derivado do `name` da ficha (M11) | um esquema só | **concluída** — e a causa raiz do achado estava errada (ver `02-ACHADOS.md` §0.8) |
| T7.7 | Registrar o custo da altura fixa do demo (B1) | decisão e alternativa registradas | **concluída** — [ADR-0002](../../decisions/0002-altura-fixa-do-demo.md), com o vazio medido |

**O que a fase deixou aberto, nomeado:** o achado **M8** (props/features/examples em 44
componentes) e o achado **novo A13** (12 classes que o React emite sem regra no core, 9 delas
dívida). O A13 é aparência, e aparência se decide com o Victor — proposta abaixo como Fase 11.

---

## Fase 8 — Navegação universal

**Objetivo:** o sistema é usável na plataforma mais comum.

**Dependências:** fases 4 e 7. **Riscos:** médio.

| ID | Tarefa | Critério de aceite | Estado (30/07/2026) |
|---|---|---|---|
| T8.1 | Navegação recolhível como componente do sistema, com ficha (A8) | conteúdo visível sem rolar navegação em 375px | **concluída** — gaveta no `AppShell` com popover nativo, sem JS; ficha com `states`, `props`, `a11y.keyboard` e o motivo do não-modal. [ADR-0003](../../decisions/0003-gaveta-de-navegacao-sem-javascript.md) |
| T8.2 | Migrar os 6 breakpoints legados junto da aposentadoria de `apps/docs` (M13) | `LEGACY_BP` do gate encolhe a cada migração | **não migrou, e o motivo está medido** — 5 dos 6 servem só `apps/docs` (que esta fase não aposenta) e o 6º (400px) é do MediaPlayer. O que mudou: o shell do SISTEMA não depende mais de nenhum deles. Tabela por dono em `02-ACHADOS.md` §0.9 |
| T8.3 | Gate de usabilidade móvel: `h1` acima da dobra em 375px; disparador com `aria-expanded`; `Escape` fecha | reprova o empilhamento atual | **concluída** — `tests/visual/shell-nav.spec.ts` (5 casos) + a dobra nas 170 páginas do `catalog-sweep`. Provado contra o defeito |

**O que a fase deixou aberto, nomeado:** **M13** (morre com `apps/docs`) e o parente do A13 que
ela confirmou — link de navegação lateral não é componente da Aurea: quem dá pele a ele é
`.doc-nav`, chrome do catálogo. Entra na Fase 11 junto das outras nove classes sem pele.

---

## Fase 9 — Pacote divisível

**Objetivo:** adotar a Aurea por partes é possível.

**Dependências:** fase 3 (API estável). **Riscos:** médio — muda o pacote publicado.

| ID | Tarefa | Critério de aceite | Estado (30/07/2026) |
|---|---|---|---|
| T9.1 | Dividir `index.tsx` por categoria do registry | nenhum arquivo acima de ~200 linhas | **concluída** — 18 módulos, o maior com 140 linhas. O grafo foi medido antes: 3 ciclos, todos pelo `Kbd` (ver `02-ACHADOS.md` §0.10) |
| T9.2 | Subpath exports | `import {Button} from "@aurea-uds/react/actions"` funciona | **concluída** — 17 entradas no `exports`; smoke importa as 13 categorias |
| T9.3 | CodeMirror, react-table e `qr` como peer opcionais dos 3 componentes | app com só Button não resolve CodeMirror | **concluída no que dá para verificar sem publicar** — 1 dependência de runtime, 7 peers opcionais, e `npm pack --dry-run` confirma o que sairia. App externo instalando do npm só existe depois de publicar |
| T9.4 | Smoke de CI por subpath | passo novo verde | **concluída** — e ele falha se um pesado voltar ao barril. Mais o check 19 no `validate.py`, provado contra o defeito |

---

## Fase 10 — Governança

**Objetivo:** decisão fechada fica fechada; sessão nova começa em 10 minutos.

| ID | Tarefa | Critério de aceite | Estado (30/07/2026) |
|---|---|---|---|
| T10.1 | ADRs com id/data/contexto/alternativas/consequência; migrar as decisões já tomadas | toda decisão de `AUREA.md` §4 tem ADR | **concluída, com um desvio declarado** — 12 ADRs onde havia alternativa real com custo real; as 8 que já são cobradas por gate entram numa tabela de contabilidade no `decisions/README.md`, com data e quem obriga. ADR cerimonial em cima de gate é artefato para envelhecer (lição do M6) |
| T10.2 | Registro de referências externas | Kibo/Untitled registrados de fato | **concluída** — `REFERENCES.md`, com o número medido, o que não entrou e a licença verificada hoje |
| T10.3 | Critérios objetivos de qualidade promovidos a doc canônico | "concluído" é verificável | **concluída** — `QUALITY.md`, cada critério com **quem cobra**; um critério da proposta estava errado e foi corrigido |
| T10.4 | Protocolo de sessão de IA canônico | sessão nova sem contexto anterior consegue continuar | **concluída** — declarado canônico no mesmo caminho, e o `CLAUDE.md` diz isso |
| T10.5 | Manifesto de projeto legível por máquina, gerado e gateado | `dist == build` | **concluída** — `manifest.json` derivado, check 20, provado contra o defeito. Com a condição de morte escrita: sem consumidor até publicar, apagar |
| T10.6 | Mapa do código (onde adicionar o quê) | doc existe | **concluída** — `MAP.md`, com o DAG dos módulos e a receita de componente novo |
| T10.7 | B4, B5, B6 | os três resolvidos | **concluída** — B5 e B6 corrigidos; **B4 é falso alarme** (a ocorrência é um comentário, e comentário é pt-BR por decisão) |
| T10.8 | Ativar o gate de pixel (follow-up A4 de 18/07) | passo de screenshot bloqueia de verdade | **concluída** — 48 baselines `-linux.png` no repositório; a CI compara e bloqueia. O bloqueio mais antigo do projeto |

---

## Fase 11 — a pele que falta (proposta, nasceu na Fase 7)

**Objetivo:** nenhum componente público renderiza sem a pele da Aurea.

**Por que existe:** achado **A13**. Nove classes que os componentes emitem não têm regra em CSS
nenhum — `.command-overlay`, `.command-palette`, `.empty-state`, `.empty-title`, `.data-list`,
`.accordion`, `.accordion-content`, `.grid`, `.timeline-dot`. O `.grid` é o caso que define a
urgência: o chrome do catálogo o redefine, então `Grid` parece pronto em toda página daqui e chega
sem nada no consumidor.

**Por que não foi feito na Fase 7:** escrever pele é decidir aparência, e aparência é decisão do
Victor (`CLAUDE.md`). O check 18 impede a lista de crescer enquanto isso.

**Onde entra na ordem:** antes de **publicar**. Publicar um componente sem pele é publicar um
defeito com número de versão.

| ID | Tarefa | Critério de aceite | Estado (30/07/2026) |
|---|---|---|---|
| T11.1 | Anatomia de cada uma das 9, com referência externa registrada (o que é a peça, quais estados) | tabela versionada, uma linha por classe | **concluída** — tabela em `02-ACHADOS.md` §0.12, com o medido ANTES ao lado da regra. Referência: Carbon (Apache-2.0), registrada em `REFERENCES.md` com o que entrou e o que não |
| T11.2 | Regra no core usando token em todo eixo (raio, espaço, cor, peso) | a catraca do check 12 não sobe | **concluída** — a catraca **caiu** de 128 para 123: amarrar ponto e trilho da timeline ao mesmo token dispensou 5 literais |
| T11.3 | `.grid` sai do chrome do catálogo e passa a vir do core | remover a redefinição do gerador; o catálogo continua idêntico | **concluída** — e a prova é a passagem dos baselines: `.grid` é a única das nove numa página fotografada (13× no `index.html`), e a regra do core é equivalente à que saiu (`15rem == 240px`) |
| T11.4 | Baselines regerados de propósito, nos dois temas | diff de pixel revisado, não aceito no escuro. **O gate de pixel está ATIVO desde a Fase 10**, então não basta regerar o `-win32` local: `gh workflow run ci.yml -f update_snapshots=true`, esperar, `gh run download <id> -n playwright-snapshots-linux`, copiar para `tests/visual/` e commitar — senão a CI reprova | **não foi preciso, e o motivo está medido** — nenhum pixel mudou. As nove classes não aparecem nas páginas fotografadas, exceto `.grid`, cuja regra foi escrita equivalente à do chrome. Os baselines passaram intactos. **O caminho do Linux continua valendo** para a próxima mudança visual que MOVA pixel |
| T11.5 | `semRegra` do `core-boundary.json` cai para as 3 justificadas | check 18 exige a queda | **concluída** — 12 → 3 (`table`, `combobox-section`, `code-editor`). A lista chegou ao piso: classe nova sem regra reprova de imediato |
| T11.6 | *(nova)* Controle que cobra o EFEITO, não o nome | o gate reprova com regra vazia | **concluída** — `tests/visual/skin.spec.ts`: os seis componentes com só o core, 2 temas. Nasceu porque provar o check 18 contra o defeito mostrou que `.grid { }` passa nele |
| T11.7 | *(nova)* Reancorar o gate de RTL, que media o recuo da timeline | espelhamento provado no que a regra nova de fato usa | **concluída** — passou a medir o `inset-inline-start` do trilho; provado contra o defeito (`left` físico reprova). E o recuo antigo da timeline dos docs foi para `docs.css`, preso ao markup legado — os baselines voltaram a passar sem regeneração |

---

## Critérios de qualidade objetivos — proposta

Hoje não existe definição de "concluído". Proposta, verificável por máquina:

**Para iniciar um componente**
1. Nome, `category` e `layer` decididos conforme `DIRECTION.md`.
2. Referência externa analisada e registrada (anatomia, estados, teclado).
3. Padrão APG identificado, ou ausência registrada com a prática adotada.

**Para um componente ser "funcional"**
4. Renderiza nos 2 temas e 3 densidades sem valor cru novo.
5. Estados: default, hover, focus-visible, active, disabled — e os próprios do papel.
6. Teclado conforme APG; foco visível pelo contrato de foco.
7. Ficha de registry válida com `tokens`, `states`, `a11y.role` e `a11y.keyboard`.

**Para um componente ser "documentado"**
8. `props` publicadas e batendo com a assinatura TypeScript.
9. Um exemplo por feature declarada, com Preview e Código equivalentes.
10. Página no modelo do tipo, sem seção faltando.

**Para um componente ser "Stable"**
11. Tudo acima, mais: teste de interação, teste de teclado, axe verde inclusive em
    estado aberto (se aplicável), geometria única por classe.
12. `forwardRef` se renderiza elemento DOM.
13. Nenhum achado aberto de severidade ≥ MÉDIO sobre ele.

**Para publicar versão**
14. `validate.py` OK, `pnpm test` verde, gates duros de Playwright verdes, gate de pixel
    **ativo** e verde, build com árvore limpa, `pnpm audit --audit-level=high` limpo.
15. Estado do projeto regerado (fase 1).

**Para aceitar uma alteração**
16. Causa raiz nomeada; se a correção é local, está registrado por que a causa raiz não
    foi tocada — e vira tarefa.
17. Existe um controle automático que pegaria a regressão. Se não existe, ele entra
    no mesmo commit.

O item 17 é o que teria evitado A2, A3 e A4: em todos, uma correção local foi aceita
sem controle e sem pergunta "quem mais tem esse problema?".

---

## Estrutura de tarefa — proposta

Estados: `não iniciada` · `em análise` · `pronta` · `em implementação` · `em validação` ·
`bloqueada` · `concluída` · `rejeitada` · `depreciada`.

Uma tarefa só vai a `concluída` com: implementação completa, critérios de aceite
atendidos, testes executados **e** citados, documentação atualizada, regressões
avaliadas, evidência registrada. Código escrito não é tarefa concluída.
