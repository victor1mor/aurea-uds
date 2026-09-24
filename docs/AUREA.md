# Aurea — Fonte de verdade

> Documento canônico do projeto. Centraliza **visão, arquitetura, estado real,
> backlog e ordem de execução**. Se algo aqui conflitar com outro doc, este vence
> (exceto decisão mais recente do Victor, que sempre vence e depois é registrada aqui).
>
> **Regra-mãe:** estamos construindo **uma UI universal**, não colando peças.
> A fundação é acertada **uma vez, com excelência**, para não refazer. Ideia que o
> Victor viu e mandou é **backlog**, não ordem de construir — a triagem (§4) separa
> ideia de decisão. Cada fase nova exige `PODE IMPLEMENTAR` por etapa.
>
> **Regra do exemplar — como construímos, para nunca refazer.** Em cada fase eu
> construo **UM** exemplar completo (um componente / uma página / um pattern) até
> ficar perfeito no padrão, e mando o Victor **validar**. Quando ele aprova ("é
> assim que quero"), o padrão está **travado — martelo batido**. Daí em diante eu
> replico o **mesmo** padrão para todos os outros itens **sem** validar um a um —
> porque todos seguem o exemplar aprovado. Só se re-valida se o próprio padrão
> mudar. Isso é o §2.0 aplicado ao trabalho: o exemplar aprovado **É** o padrão único.
>
> Idioma do PRODUTO = **inglês** (categorias, maturidade, page model, labels). A
> prosa deste doc é pt-BR (nossa língua de trabalho).

---

## §1 — O que a Aurea É

**Aurea é um design system universal:** uma identidade visual própria que se
expressa em qualquer plataforma, com o comportamento certo em cada uma.

> **Nome (rebrand 23/07/2026):** a marca é **Aurea**; nome oficial **Aurea Universal
> Design System**, curto **Aurea UDS**. Pacotes `@aurea-uds/*`, repo `aurea-uds`,
> domínio `aureauds.dev`. Motivo: "Aurea UI" já existia (pacote npm `aurea-ui` +
> `@aurea-design-system`); o scope `@aurea-uds` foi verificado livre no npm. "Aurea"
> e "UDS" isolados não são exclusivos — a **combinação** é o que nos identifica.

A equação que define tudo:

> **Identidade = tokens + pele própria. Comportamento = motor certo por plataforma.**

- **Universal** não é slogan: o mesmo sistema serve Web, Mobile, Desktop — e a
  organização (categoria, maturidade, plataformas) mostra isso desde o começo.
- **Identidade inegociável** (detalhe em `CLAUDE.md`): superfícies flutuantes; raio
  22px em card/dialog; pill nos controles; amarelo `oklch(0.795 0.184 86.047)`
  invariável; IBM Plex; Carbon Icons; sem gradiente; dark/light equivalentes;
  densidades compact/comfortable/spacious. Nada disso muda sem autorização.

---

## §2 — Princípios de arquitetura (a fundação excelente)

O que precisa estar **certo desde a base** para nunca refazer:

0. **PADRÃO ÚNICO — a regra que impede o Frankenstein.** Há **um só** padrão para
   TUDO. Todo componente — os que já existem e os que faltam — tem a mesma ficha
   no registry, o mesmo modelo de página, os mesmos gates de qualidade, a mesma
   escala de maturidade e a mesma matriz de plataforma. **Nenhum componente é caso
   especial.** Não se destaca "esses 4 componentes" nem se cria `Other`: ou uma
   regra vale para todos, ou não é regra. É isso que faz um SISTEMA e não uma pilha.

1. **Tokens = fonte única, neutra de plataforma.** DTCG. O CSS é uma *saída*; um
   objeto JS/nativo é outra. Nenhum valor visual nasce hardcoded fora do token.
2. **Comportamento vem do motor certo, não é reimplementado.** Web usa Base UI +
   DOM; Mobile usará componentes nativos. A Aurea governa a *pele*, não recria a
   plataforma.
3. **O contrato/registry é a fonte de verdade da biblioteca.** Cada componente se
   descreve como DADO (nome, categoria, maturidade, plataformas, tokens, a11y,
   dependências, variações, patterns relacionados). Máquina lê; humano não redigita.
4. **Dogfooding é lei de sanidade.** O catálogo é **gerado a partir do registry** e
   renderizado **com os próprios componentes Aurea** — não HTML escrito à mão. Se o
   catálogo mostra uma Sidebar, a sidebar dele É a `Sidebar` da Aurea. É isso que
   mata o "Frankenstein": uma fonte → superfície gerada → dogfooded.
5. **Acessibilidade primeiro (APG).** Onde o APG não cobre, pesquisa-se a prática
   atual e registra-se a decisão. Gate axe no CI.
6. **Espaçamento tokenizado** (`--space-*`), sem pixel cru novo.
7. **Taxonomia por função/intenção/domínio — nunca `Other`.**
8. **Maturidade explícita** para experimental não parecer oficial.
9. **Inglês como idioma base do produto**, com i18n para o resto.

O keystone: **os itens 3 e 4.** Acertar o registry e a geração do catálogo É a
fundação excelente. Com eles certos, todo componente e toda plataforma futura
encaixam sem redesign.

**Referências externas (Kibo UI **e** Untitled UI) = SÓ organização.** Espelhos
locais para consulta: `C:\Meus Sites\kibo-ui.com` e `C:\Meus Sites\untitledui.com`.
Servem de inspiração para: taxonomia, estrutura de catálogo, **page model**
(Overview → Installation → exemplos rotulados, cada um com Preview/Code),
breadcrumb, sidebar categorizada e granularidade de patterns. **Nunca** para
identidade, cor, código, asset ou dependência — e nunca autorização para copiar.
A lição prática das duas é a **uniformidade** (§2.0): toda página de componente é
idêntica em estrutura. A pele é sempre Aurea.

> **O que de fato foi analisado e adotado está em [`REFERENCES.md`](REFERENCES.md)**, com o
> número medido, o que ficou de fora e a licença de cada uma (achado M19). Citar referência sem
> esse registro é o que tornava a frase acima não verificável.

---

## §3 — Estado real hoje (sem ilusão)

> **Os números vivem em `STATE.md`, não aqui.** Ele é gerado do repositório por
> `python scripts/validate.py --write-state` e o check 13 do validador falha se
> divergir. Motivo: até 26/07/2026 esta seção carregava nove contagens escritas à mão,
> todas erradas (achado I1 em `audit/2026-07-26-integral/`). Contagem nova entra lá;
> aqui fica só o que não é contável — o que ainda dói e por quê.

**Sólido (Fases 0–5, no `origin`):**
- Monorepo pnpm: `tokens` (DTCG), `core` (CSS gerado), `fonts`, `icons` (Carbon),
  `contracts` (contrato + registry), `react` (componentes tipados) — contagens em `STATE.md`.
- Identidade travada e validada por gate. CI (validate, build git-clean, SHA-pin,
  audit). TS7 strict.
- Audit adversarial 18/07 fechado: 20/22 achados corrigidos; 2 follow-ups
  (A5 split de subpath, A4 baselines Linux) — ver `AUDIT-2026-07-18.md`.

**Fechado desde então (trilha Catálogo, fases 1 e 2 — detalhe no `ROADMAP.md`):**
- ~~Sem registry/metadata por componente.~~ ✔ **23/07:** todo componente ganhou
  ficha (59 à época); `layer` e a allowlist de categorias valem no gate. Commit `f1be243`.
- ~~Defaults em pt-BR.~~ ✔ **23/07:** baseline do produto em inglês; pt-BR segue
  disponível via `ptBR` (`<AureaProvider strings={ptBR}>`). Commit `7c0a220`.
- ~~Faltam do MVP: Sidebar, Topbar, Status, QRCode.~~ ✔ **23–24/07:** os quatro
  existem, pelo mesmo padrão dos outros. Commits `bcdc794`, `f16b357`.
- ~~Catálogo não é dogfooded / sem modelo de página padrão.~~ ✔ **24/07:**
  `apps/catalog` é gerado do registry por `scripts/build-catalog.mjs` (SSR
  estático, sem framework) — 63 páginas + índice à época, moldura feita com os próprios
  componentes. Commits `402a66d`, `eadcaf8`.

**Fechado em 24/07 (segunda leva):**
- ~~Só Components e Tokens existiam como área.~~ ✔ **Patterns granulares, Blocks e
  Recipes existem**, cada nome com um sentido só (46/8/23 à época).
- ~~Sem contrato de API publicado.~~ ✔ A ficha aceita `props` e o gate recusa prop
  sem tipo ou descrição. `Button` é o exemplar (12 props).
- ~~Componentes sem glifo.~~ ✔ Toda ficha tem `icon`, travado na allowlist do
  contrato pelo gate.
- ~~"Selecionado" era diferente em cada lugar.~~ ✔ Uma regra só no core serve nav
  ativo, aba ativa, item de lista e botão alternado.
- **Componentes novos:** `TableOfContents` e `Kbd` (ficha, props, i18n) — nasceram
  porque o catálogo precisou deles, e por isso são da biblioteca, não do app.

**Gaps reais hoje (as contagens estão em `STATE.md`):**
- **O padrão do exemplar não cobre a maioria.** Desde a Fase 7 toda página tem o núcleo do
  modelo — preview, o código que o produz, installation, proveniência e prev/next
  ([ADR-0001](../decisions/0001-modelo-de-pagina-do-catalogo.md)). O `props` **fechou**: é o achado
  **M8**, encerrado na Parte E do [`PLANO-1.0.md`](PLANO-1.0.md) em 07/08/2026, e hoje todas as
  fichas publicam contrato de API. O que segue numa minoria é `features` e `examples`. Números:
  `STATE.md`, que é gerado.
- **Comparação com referência externa ainda é a exceção.** `Button` (Kibo/Untitled) e agora os
  seis da Fase 11 (Carbon). Os outros nunca foram confrontados. O que mudou é que existe
  registro: [`REFERENCES.md`](REFERENCES.md) diz o que foi olhado, medido, adotado e recusado.
- ~~`apps/docs/index.html`~~ — **saiu** na Parte D do [`PLANO-1.0.md`](PLANO-1.0.md), em
  08/08/2026, junto com o `docs.css`, o gerador e as 52 baselines dele. Fechou o **M13**, e com ele
  a auditoria integral de 26/07. Os 6 breakpoints legados caíram no mesmo passo (`LEGACY_BP` está
  vazia); o ganho de CSS medido foi de **1,09 KB** e não os ~25 KB que esta linha prometia — a Fase
  4 já havia cobrado aquele ganho.
- **Maturidade e matriz de plataforma são decorativas hoje:** quase tudo se declara
  `Stable`, inclusive componente sem exemplo, sem props e sem teste.
- Conhecimento espalhado em vários docs (este arquivo centraliza a visão; `STATE.md`,
  o estado; `audit/2026-07-26-integral/`, os achados abertos).

---

## §4 — Backlog triado (ideias → baldes; NADA travado aqui)

Tudo que foi levantado (memórias do Codex, imagem-alvo, conversas) entra aqui
rotulado. Isto **não** é ordem de construir; é o mapa do que existe como ideia.
`[decisão]` = o Victor já decidiu. `[ideia]` = veio de referência, ainda triável.

> **Mapa-alvo estrutural em `DIRECTION.md`** (registrado 23/07): camadas de abstração,
> ~24 macroáreas, regras de nomenclatura e governança. É **direção/guarda-corpo** — o
> componente novo já nasce com camada/categoria/nome pré-definidos, sem sair do padrão.
> **Nada dali se pré-constrói**: cresce por pull real (Balde C, §5). O eixo `layer` e o
> allowlist de categorias já estão em vigor no gate (Fase 1).

### Balde A — Fundação (fazer primeiro, tem que ficar excelente)
- Registry/metadata dos componentes (o keystone). `[decisão]`
- Taxonomia oficial em inglês, sem `Other`. `[decisão]`
- Modelo de maturidade (Draft/Ready/Stable/Universal/Deprecated). `[decisão]`
- Matriz universal de plataformas por componente. `[decisão]`
- Baseline de idioma inglês (defaults → en, i18n mantém pt-BR). `[decisão]`
- Emit de tokens em JS/nativo (prep p/ multiplataforma; sem urgência). `[decisão]`

### Balde B — Produto (a biblioteca + o catálogo dogfooding que a prova)
- Catálogo gerado do registry, renderizado com componentes Aurea. `[decisão]`
- Modelo de página padrão: núcleo comum (breadcrumb, título, **preview**, **code**,
  installation, uses, prev/next) + extras declarados por tipo. Vive como DADO em
  [`scripts/page-model.mjs`](../scripts/page-model.mjs) e é decidido pela
  [ADR-0001](../decisions/0001-modelo-de-pagina-do-catalogo.md). `[decisão]`
  A lista que estava aqui antes — "Overview/Usage/Preview/Code/States/A11y/Tokens/
  Platforms/Related" — não existia em nenhuma das 169 páginas: era o achado I2.
- Proveniência visível ("Uses X"/"Used here"). `[ideia — ver D2]`
  A metade **"Uses X"** entrou na Fase 7: é seção do núcleo, em todo tipo de item.
  A metade **"Used here"** (o índice reverso) segue aberta, e é o que resta da D2.
- Construir os componentes que ainda não existem (ex.: Sidebar, Topbar, Status,
  QRCode) — pelo **mesmo** padrão único (§2.0), não como classe à parte. `[decisão]`
- QRCode arredondado (soft geometry sem perder escaneabilidade). `[decisão]`
- Patterns granulares (Categoria→Componente→Variante→Estado) → depois Blocks. `[decisão]`

### Balde C — Alcance universal (comprometido, sequenciado — SEM "talvez")
- `@aurea-uds/native` (React Native): **alvo confirmado** — filosofia "compartilhar
  só os tokens; pele e motor próprios por plataforma". Entra quando a fundação
  estiver excelente. `[decisão]`
- Outros alvos (Web Components, e-mail, terminal): universais por missão,
  sequenciados. `[decisão — detalhar no dia]`
- Extensões (charts, ai, operations): entram **por demanda real de consumidor**
  (YAGNI — não é dúvida, é pull). `[decisão]`

### Vocabulário do catálogo (DEFINIDO — martelo batido 22/07)
As 4 áreas de itens do topo, resolvidas:
- **Components** = peças base do sistema.
- **Patterns** = composições **granulares** de um componente base
  (Componente → Variante → Composição). Ex.: `Button → Destructive → With Kbd`;
  `QRCode → Rounded → Downloadable`. Modelo Kibo, bate com a imagem-alvo Aurea.
- **Blocks** = seções/telas maiores (arranjos de produto).
- **Recipes** = arquétipos de aplicação inteira (os 23 atuais).
- (Docs = fundamentos/tokens; Platforms = adapters/matriz.)

**Hooks entrou em 16/08/2026, e é ÍNDICE, não área de itens** — por isso a lista acima segue com
quatro. Os hooks públicos (`useToast`, `useAureaTheme`, `useAureaStrings`, `useSpriteUrl`) são API
e não têm ficha, porque ficha descreve componente; sem página eles não existiam em lugar nenhum que
se lesse, e foi assim que uma sessão concluiu que a Aurea "não tinha Toast em React" tendo o
`useToast` publicado. A página fica com `tokens.html` do lado do índice pela mesma razão: o núcleo
do modelo é preview + código, e hook não tem prévia estática — `useToast` só existe depois de um
clique, e caixa vazia com legenda é o defeito que a ADR-0001 já pagou.

### Decisões abertas (resolver na etapa certa)
- **D2** — chips "Uses X"/"Used here": feature permanente ou não.
- ~~**D3** — modelo de página.~~ ✔ **30/07/2026:** núcleo comum obrigatório + extras
  declarados por tipo. Registrada em [`decisions/0001`](../decisions/0001-modelo-de-pagina-do-catalogo.md).

> **Decisão nova vai para [`decisions/`](../decisions/README.md)**, não para esta lista. Prosa
> numerada sem data, sem alternativa e sem consequência foi o achado M19; a lista acima é o
> que resta migrar (tarefa T10.1).

---

## §5 — Ordem de execução (fundação → produto → alcance)

Uma etapa fechada por sessão, risco crescente, `PODE IMPLEMENTAR` a cada uma. O
detalhamento (o quê pesquisa/decide/entrega + gates) mora no `ROADMAP.md`; aqui
fica só a **ordem macro**, que é o que garante "base excelente antes de subir".

> **Numeração:** estes 5 itens são a **trilha Catálogo** (fases 1 a 5 dela). As
> Fases 0–7 do `ROADMAP.md` são a **trilha Biblioteca** — contagem separada, não
> se misturam. Estado das duas: no topo do `ROADMAP.md`.

1. **Fundação organizacional.** Definir o **registry/metadata** + taxonomia +
   maturidade + matriz de plataforma, e aplicá-lo **a TODOS os ~40 componentes que
   já existem** (o padrão único do §2.0 — todos ganham ficha, ninguém é exceção). É
   o keystone: acertar aqui faz o catálogo e todo componente futuro encaixarem sem
   redesign. Gate: cada componente existente tem ficha válida, provada por máquina.
2. **Idioma inglês + preencher lacunas de componente.** Flip do baseline p/ inglês.
   Construir os que ainda não existem (ex.: Sidebar, Topbar, Status, QRCode) — que
   entram pelo **mesmo** padrão de todos, não como classe à parte.
3. **Catálogo dogfooding.** App real que lê o registry e renderiza com componentes
   Aurea, no modelo de página padrão. Substitui o HTML manual. (Resolve D1/D2/D3.)
4. **Patterns → Blocks.** Receitas granulares primeiro; blocos maiores depois.
5. **Alcance universal.** React Native (quando a fundação sustentar); extensões
   conforme demanda real.

Regra de ouro da ordem: **nada da camada N+1 começa antes de a camada N estar
excelente.** Catálogo não começa antes do registry; RN não começa antes da
biblioteca web estável.

---

## Papéis dos documentos (fim do espalhamento)

| Documento | Papel | Não faz |
|---|---|---|
| **`AUREA.md`** (este) | fonte de verdade: visão, arquitetura, backlog, ordem macro | **não carrega número de estado** — isso é do `STATE.md`; não detalha etapa nem substitui runtime |
| `STATE.md` | **gerado e gateado**: os números do estado do projeto | não explica nem prioriza; não se edita à mão |
| `audit/2026-07-26-integral/` | auditoria integral de 26/07/2026: mapa factual, 34 achados, plano | as fases do plano só valem com `PODE IMPLEMENTAR`, uma por vez |
| `CLAUDE.md` | regras e identidade inegociável (aplicadas) | não sequencia trabalho |
| `ROADMAP.md` | etapas técnicas detalhadas por fase | não muda visão nem prioridade |
| `DIRECTION.md` | mapa-alvo da taxonomia universal (camadas, categorias, nomes, governança) — guarda-corpo do §4 | não é ordem de construir; nada se pré-constrói (pull/YAGNI) |
| `AUDIT-2026-07-18.md` | história fechada do audit adversarial | não é backlog vivo |
| `packages/contracts/*` | spec de máquina (contrato/registry) | não é doc de leitura humana |
| `FASE-6-BRIEF.md` | **fechado (24/07)** — história: a leitura da imagem-alvo região a região | não é backlog; o que falta está no `ROADMAP.md` |
| `AGENTS.md` | ponteiro para o `CLAUDE.md` | não repete regra (era cópia e divergiu) |
| **`decisions/`** | o registro de decisões (ADR): data, alternativa rejeitada, consequência, gate | não conta estado nem sequencia trabalho |
| **`QUALITY.md`** | quando uma coisa está pronta, e **quem cobra** cada critério | não é checklist de fase; não substitui o gate |
| **`MAP.md`** | onde mexer para fazer o quê; o DAG dos módulos; a receita de componente novo | não explica por quê — isso é `AUREA.md` e `decisions/` |
| **`REFERENCES.md`** | referência externa analisada: o que entrou, o que não, sob que licença | não é lista de inspiração |
| `MIGRATION.md` | **histórico**: como o kit monolítico virou os pacotes | não é roteiro de nada em curso |

**Decisão nova vai para [`decisions/`](../decisions/README.md)** — com data, alternativa e
consequência. O §4 daqui é backlog triado, não registro de decisão: foi a confusão entre as duas
coisas que produziu o achado M19.
