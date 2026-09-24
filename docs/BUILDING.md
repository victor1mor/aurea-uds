# Como se constrói um componente da Aurea

Existe porque a biblioteca **está publicada no npm** — a versão corrente não se escreve aqui, se lê
no `CHANGELOG.md` e nos `package.json` — e a construção deixou de ser
experimento: cada componente novo é uma promessa de API para quem instalou. E porque a causa
raiz de retrabalho neste projeto, medida duas vezes em auditoria, é sempre a mesma — **componente
montado de memória**, plausível e não verificado.

Este documento é o **procedimento**. Ele não repete o que já está escrito em outro lugar:

| Pergunta | Onde já está respondida |
|---|---|
| Quando uma coisa está pronta? | [`QUALITY.md`](QUALITY.md) |
| Onde mexo para fazer o quê? | [`MAP.md`](MAP.md) |
| Que nome e categoria o componente leva? | `DIRECTION.md` |
| O que já foi decidido? | [`decisions/`](../decisions/README.md) |
| Quantos são? | [`STATE.md`](../STATE.md), gerado |

O que é só daqui: **de onde vem o desenho, e o que impede a construção de virar bagunça.**

---

## 1. As referências

Moram em **[`Referencia/`](../Referencia/)**, dentro do repositório e **fora do git** (no
`.gitignore` — o motivo está escrito lá). Nenhuma linha de código delas entra aqui.

**Licença não trava mais a escolha, e o motivo é medido:** a pasta está no `.gitignore` e
`git ls-files Referencia | wc -l` devolve **0** — a Aurea não redistribui nenhuma delas. O que se
extrai (anatomia, estado, teclado, caso de borda) não é matéria de direito autoral, e boa parte vem
do APG, que é público. A trava que importa continua sendo a da seção seguinte: **nenhuma linha
literal entra** — nem CSS, nem SVG, nem fixture.

**As nove licenças, medidas arquivo a arquivo em 09/08/2026** — a versão anterior desta frase
estava incompleta e listava só duas exceções:

| Pasta | Licença |
|---|---|
| `agent-prism-main`, `agent-elements-main`, `tool-ui-main`, `xyflow-main`, `kaneo-main` | MIT |
| `langfuse-main` | MIT Expat **exceto** `ee/`, `web/src/ee/`, `worker/src/ee/` |
| `activepieces-main` | MIT Expat **exceto** `packages/ee/` e `packages/server/api/src/app/ee` |
| `openstatus-main` | AGPL-3.0 |
| **`agents-kit-main`** | **Non-Commercial License** — uso comercial proibido sem autorização |

> **⚠ A REGRA MUDOU EM 20/08/2026 — copiar é permitido quando o Victor mandar.** Ele disse:
> *"vamos copiar quando eu mandar; se tivéssemos feito isso teria evitado o desgaste do sidebar"*.
> O texto abaixo nasceu sob a trava "nenhuma linha literal entra", e ela agora é o **padrão**, não a
> proibição: sem ordem dele, lê-se; com ordem dele, copia-se.
>
> **O que NÃO afrouxou é a licença**, porque essa parte não é escolha nossa. A tabela acima decide:
> `agents-kit-main` é **não-comercial** e `openstatus-main` é **AGPL-3.0** — nenhuma das duas entra
> numa base Apache-2.0, nem sob ordem. As MIT e a Apache-2.0 (`heroui-3`) entram **com o aviso de
> copyright preservado**, crédito no `REFERENCES.md` e o que foi alterado declarado.

As sete de 02/08/2026 são MIT. Nenhuma delas muda a regra, pelo motivo do parágrafo acima: nada é
redistribuído e nenhuma linha literal entra. **A `agents-kit-main` merece o destaque mesmo assim**
— a Aurea é Apache-2.0 e comercialmente livre, e ela foi a referência principal de cinco itens da
Parte H. Anatomia lida não é obra copiada; ainda assim, referência não-comercial num projeto que
não é fica **registrada**, não subentendida.

| Pasta | O que é | Para que serve |
|---|---|---|
| `base-ui-master` | o motor que a Aurea **já usa** (`@base-ui/react`) | comportamento, teclado, ARIA. Se ele já entrega, não escrevemos |
| `ui-main` | shadcn/ui | decomposição em peças, o padrão de envelopar biblioteca de terceiro, e a fronteira servidor/cliente |
| `react-main` | Untitled UI React | escala de tamanhos, proporção, estados que a gente não lembrou. Forte em `table`, `file-upload`, `app-navigation`, `date-picker` |
| `kibo-main` | Kibo UI | anatomia de componente raro: `dropzone`, `tree`, `gantt`, `kanban`, `editor`, `table` |
| `reui-main` | ReUI | terceira leitura de anatomia, e blocos compostos |
| `media-chrome-main` | Media Chrome | anatomia de player e de biblioteca de mídia |
| `material-ui-master` | MUI (monorepo `9.3.1`) | catálogo de estados e anatomia madura — **157 componentes** em `packages/mui-material/src/`. É a mais completa em cobertura, e a mais distante em aparência |

### As de 08/08/2026 — a camada operacional e o grafo

Baixadas para destravar a **Parte H** do [`PLANO-1.0.md`](PLANO-1.0.md), que não tinha referência
local nenhuma. O caminho listado é onde a anatomia mora de verdade, medido antes de entrar aqui.

| Pasta | O que é | Onde está a anatomia |
|---|---|---|
| `agents-kit-main` | agents-ui | `components/agents-ui/` — `agent-card`, `agent-status-panel`, `agent-task-queue`, `agent-tool-approval`, `agent-ops-monitor`, `agent-orchestrator`, `agent-routing-hub` |
| `agent-prism-main` | AgentPrism (Evil Martians) | `packages/ui/src/components/` — `SpanCard/`, `TraceViewer/`, `TraceList/`, `DetailsView/`, `TokensBadge`, `PriceBadge` |
| `agent-elements-main` | Agent Elements | `lib/agent-ui/components/tools/` — 10 tipos de ferramenta, `tool-approval-footer`, `tool-registry`; e `question/question-prompt` |
| `tool-ui-main` | assistant-ui/tool-ui | `apps/www/app/components/` — terceira leitura de renderização de ferramenta |
| `langfuse-main` | Langfuse | `web/src/features/` — `dashboard/components/ModelUsageChart` e `ModelCostTable`, `automations/`, `monitors/`, `trace-graph-view/`, `events/` |
| `openstatus-main` | OpenStatus | `packages/ui/src/components/blocks/` — `status-component-group`, `status-component`, `status-bar`, `status-calendar`, `status-feed`, `status-events` |
| `activepieces-main` | Activepieces | `packages/web/src/features/agents/` — `agent-timeline`, `agent-tools`, `ai-model`, `structured-output` |
| `xyflow-main` | React Flow | `packages/react/` — nó, aresta, conector, tela |
| `kaneo-main` | Kaneo | `apps/web/src/components/` — fila com estado persistido: quadro, backlog, gantt |

Chegaram junto três satélites de React Flow — `React-Flow-Tree-Boilerplate-main`,
`vite-react-flow-template-main` e `React-flow-examples-apps-master` (este tem **um** arquivo, um
README). São modelos de partida, **não acrescentam anatomia** ao `xyflow-main` e podem ser
apagados. O `react-flow-hero-exploration-main` fica: é o único com composição visual.

**Atenção ao caminho:** **todas** têm o conteúdo **um nível abaixo** (`ui-main/ui-main/…`) — a
única exceção é a `material-ui-master`, com o conteúdo direto na pasta. Procurar no nível errado
foi o que fez quatro lotes seguidos concluírem que as referências não existiam.

Confirmar que existem antes de usar. Se sumirem, o Victor baixa de novo; **não invente um
substituto e não construa sem elas.**

**A ausência declarada em 02/08/2026 — a camada operacional / de agentes — foi RESOLVIDA em
08/08/2026.** As nove pastas acima cobrem **15 dos 16** nomes da Parte H, com o caminho de cada
uma medido antes de entrar. Sobra **um**, e ele fica declarado no mesmo espírito, para ninguém
procurar em vão:

**`MemoryLedger` (H13) não tem referência, e não é por falta de procurar.** O ADE do Letta é a
peça certa e **só o servidor é aberto**; o OpenMemory do mem0 está sendo descontinuado; o painel
do mem0 é só na nuvem. Pelo passo 4, ele nasce de **pesquisa registrada** no
[`REFERENCES.md`](REFERENCES.md) — e por composição, não por invenção: livro-razão é tabela mais
linha do tempo mais procedência, e a Aurea já tem `DataGrid`, `Timeline` e, no `agent-prism`, a
anatomia de procedência (`DetailsView/`).

### O que se extrai, e o que nunca

**Extrai-se:** anatomia (que peças o componente tem), catálogo de estados, comportamento de
teclado, o que uma implementação madura documenta, e os casos de borda que a gente não pensou.

**Nunca se extrai:** cor, raio, tipografia, espaçamento, sombra, "jeitão". A identidade é o
`CLAUDE.md` e não se negocia com referência. Se o resultado parece Material ou shadcn, a
referência foi lida errado.

Regra dita pelo Victor em 31/07/2026: *"tudo que eu te mandar de outros projetos é pra você
estudar, não mandei mudar aparência da Aurea."*

---

## 2. O procedimento, por componente

### Passo 1 — Medir o nosso primeiro

Antes de abrir qualquer referência. Se o componente já existe, renderizar com **só o core** — sem
o chrome do catálogo, que é o mundo do consumidor — e medir o que sai.

Isso não é formalidade. No `Avatar` esse passo achou três defeitos que nenhuma referência ia
apontar: imagem não quadrada vazando da caixa, `src` quebrado não caindo no fallback, e o
container do grupo sem regra no core.

### Passo 2 — Consultar o componente **nas quatro**

Só o componente da vez. Não ler as bibliotecas inteiras — é desperdício e não melhora a decisão.

Primeira pergunta, sempre: **é o mesmo componente?** Nome igual não é componente igual. O
"Stepper" do Kibo é campo numérico; o do MUI é assistente por etapas. Errar isso constrói a
coisa errada com o nome certo.

### Passo 3 — Separar o que serve do que não serve

Escrever, com o motivo:

- o que **converge** nas quatro (isso é o núcleo maduro do componente);
- o que **uma só** tem e vale (e por quê);
- o que **não entra** (e por quê — quase sempre: é da identidade delas, ou é API que existe por
  causa do sistema de estilo delas).

### Passo 4 — Se aparecer "algo a mais", PESQUISAR

Se durante a construção surgir a ideia de acrescentar alguma coisa que não veio da medição nem
das referências — **parar**. Não implementar de treino.

Pesquisar na internet, validar que é prática atual, e só então construir. Vale para: biblioteca,
versão, padrão de acessibilidade, API de plataforma, qualquer coisa de segurança.

O motivo é medido, não teórico: o conhecimento de treino chega desatualizado e já produziu erro
neste projeto — o caminho de publicação com token clássico do npm, por exemplo, **deixou de
existir em 09/12/2025** e a pesquisa foi o que evitou o erro ([ADR-0013](../decisions/0013-mecanica-de-publicacao-npm.md)).

### Passo 5 — Escopo menor que o da referência

O padrão da Aurea é entregar o componente, não a superfície de configuração de outra biblioteca.
No Stepper, oito componentes da referência viraram dois aqui. No Avatar, quatro props viraram o
necessário.

Se a referência tem um callback para customizar uma coisa que ninguém pediu, ele não entra.

### Passo 6 — Construir, na receita do [`MAP.md`](MAP.md)

Nome e categoria pela `DIRECTION.md` · implementação no módulo da categoria (respeitando o DAG) ·
pele no core **só com token** · ficha no registry · teste · exemplo no catálogo.

### Passo 7 — Registrar a referência

Entrada no [`REFERENCES.md`](REFERENCES.md) com: o que foi olhado, **o que foi medido** (número,
não impressão), o que entrou, o que ficou de fora e por quê, e a **licença verificada**.

Sem a licença o registro não está completo.

---

## 3. O lote

A construção anda em **lotes**, não componente a componente — decisão do Victor em 31/07/2026.

**Um lote:**
- tem um tema (ex.: "os que o Base UI já entrega");
- é autorizado uma vez, com `PODE IMPLEMENTAR`;
- entrega com **todos os gates verdes** e um commit por componente;
- fecha com o registro no `04-PROTOCOLO-IA.md`, no formato de sempre.

**O que interrompe um lote no meio, e exige o Victor:**
1. **Decisão de aparência** que não é derivável do que já existe. Vai com imagem do antes e do
   depois, nos dois temas.
2. **Quebra de API.** A Aurea está publicada; `0.x` permite quebrar, mas com nota no changelog e
   nunca em silêncio ([ADR-0014](../decisions/0014-primeira-versao-publica-0-1-0.md)).
3. **Dependência nova.** Mesmo opcional.
4. **Componente que não estava no lote.** Escopo novo é lote novo, não acréscimo silencioso.

---

## 4. As travas

Critério que depende de lembrança não é critério. O que dá para gatear, gateia.

### O que já trava hoje

| Trava | Impede |
|---|---|
| check 11 | ficha inválida, categoria fora da taxonomia, token que não existe |
| check 12 | pixel cru novo em espaçamento, raio, fonte, peso, entrelinha — a contagem **só cai** |
| check 15 | classe no core que nenhum componente produz (chrome de docs voltando) |
| check 16 | ficha `Stable` sem teste |
| check 17 | item de catálogo sem preview e sem código |
| check 18 | classe que o React emite sem regra no core |
| check 25 | preview do catálogo que lê o relógio (`new Date()` sem argumento, `Date.now()`) |
| check 26 | módulo do pacote React com a diretiva `"use client"` faltando — **ou sobrando** |
| `tests/unit/setup.ts` | `console.error` do Base UI na montagem de CLIENTE — o que o catálogo estático não pode ver |
| `skin.spec.ts` | regra que existe e **não faz nada** (o check 18 olha nome, não efeito) |
| `geometry.spec.ts` | duas coisas iguais medindo diferente; foco fora do contrato |
| `catalog-sweep` | rolagem lateral, hierarquia de título, console, axe nos dois temas, texto a 200%, **e a rolagem VERTICAL dentro da caixa de demo** (11/08/2026 — a ADR-0002 diz que nenhuma prévia deve exigir rolagem, e 10 de 520 exigiam) |
| gate de pixel | mudança visual não deliberada |
| `check-pack.mjs` | arquivo que não devia ser publicado |
| `dist == build` | saída commitada divergindo da fonte |

### As quatro deste documento — **em vigor desde 31/07/2026**

Componente construído a partir daqui entra em `scripts/built-components.json`. A lista **só
cresce**, e entrar nela é aceitar as quatro de uma vez:

| Trava | Cobra | Provada contra |
|---|---|---|
| **check 21 — referência registrada** | o componente aparece no `REFERENCES.md` | pôr um componente sem entrada lá → reprova |
| **check 22 — ficha completa** | `props`, `states`, `tokens`, `a11y.role`, `a11y.keyboard` | ficha sem `props` → reprova nomeando os campos |
| **check 23 — dimensão não é número** | prop `size`/`width`/`height`/`radius`… declarada como `number` | tirar da allowlist → reprova |
| **check 24 — pele com efeito medido** | o nome aparece em `tests/visual/skin.spec.ts` | componente fora do spec → reprova |

As quatro foram **provadas contra o defeito** antes de valer (`QUALITY.md` #29): reintroduzir o
problema e ver reprovar. Trava que só concorda com o presente não é trava.

**Desde 07/08/2026 elas valem para os 76 — a lista deixou de excluir alguém.** Ela nasceu como
exceção: os anteriores ao procedimento não publicavam `props` (o achado **M8**, fechado na Parte E
em 07/08/2026), e ligar as quatro
para todos de uma vez teria reprovado o repositório inteiro. A Parte E do
[`PLANO-1.0.md`](PLANO-1.0.md) desfez isso em quatro passos — `props` nas 76 fichas (E1–E11), a
regra do check 22 reescrita para cobrar a verdade medida de cada campo (E12), os 53 que faltavam
no `skin.spec` (E13) e as 40 entradas de referência (E14) — e o **E15** ligou as quatro.

**O que muda para quem constrói agora:** componente novo nasce com as quatro cobradas desde o
primeiro commit. Não existe mais "entra na lista quando for trazido ao padrão", porque não existe
mais fora da lista. E o check 11 já exigia ficha para todo export do pacote React, então um
componente novo sem nome em `built-components.json` reprova nos dois lados.

O check 23 é a exceção: ele vale para **todo** o pacote React, e desde 06/08/2026 **sem exceção
nenhuma** — a allowlist `dimensaoNumerica` está vazia. `Avatar.size` saiu no item B5 e
`QRCode.size` no B6, os dois com escala de token no lugar do número. Prop nova assim reprova.

E ele aprendeu uma coisa nessa passagem: **comentário não é assinatura.** O check 23 lia o fonte
inteiro e reprovou o comentário que explicava por que `Avatar.size` tinha deixado de ser número —
exatamente o defeito que o check 12 já havia corrigido do lado do CSS em 02/08/2026. Os dois
passam pelo `_sem_comentario` agora.

**A Parte A do `PLANO-1.0.md` acrescentou uma trava que vale para componente NOVO também.** Desde
06/08/2026 o pacote React tem fronteira servidor/cliente, e ela é gateada pelo check 26. Módulo
novo que chame hook, `createContext`, manipulador de evento em JSX **ou** importe motor de
terceiro que use estado sem publicar a diretiva, precisa de `"use client"` na **primeira linha**.
E o contrário também reprova: marcação pura com a diretiva empurra JavaScript ao consumidor de
graça. O que não tem estado mora em `pure.tsx`, que é o módulo sem diretiva — é de lá que o
barril tira `cx`.

**O Lote 4 achou o que nenhuma trava olha: regra de ELEMENTO.** Os checks 15 e 18 comparam
CLASSE — classe declarada no core contra classe que o React emite. `table { min-width:720px }`
não tem classe nenhuma, então nenhum dos dois a vê, e ela valia para toda tabela do documento.
O calendário nasceu com 720px de largura por causa dela, e quem achou foi o navegador.

Corrigido na raiz em 02/08/2026, depois de medir que **nenhuma** `<table>` do repositório ficava
descoberta: as cinco regras foram escopadas a `.table`/`.table-wrap`, e o gate de pixel acusou
**zero** mudança nas 48 baselines. **Regra de elemento no core segue sem gate** — é o limite
declarado no `core-boundary.json`. Escreva-a escopada, ou ela é global.

**O Lote 3 achou o limite da trava mais barata.** O check 17 cobra que todo item do catálogo
tenha preview e código — e o catálogo é HTML estático, gerado com `renderToStaticMarkup`. O
Recharts 3 monta o desenho por EFEITO, então o preview do `Chart` passaria no check 17 sendo uma
**caixa vazia**: o gate olha se existe entrada de conteúdo, não se ela desenha alguma coisa. Quem
achou foi a medição do passo 1, não o gate. A saída (montar num DOM real no gerador) está no
bloco PRERENDER do `build-catalog.mjs`, e o gerador agora **morre** se um prerender montar e não
produzir `<svg>` — que é a metade da trava que faltava.

**Uma trava já foi corrigida pelo primeiro lote, e isso é o processo funcionando.** O check 22
nasceu exigindo `a11y.keyboard` sempre, e reprovou o `Spinner` — que não tem interação de
teclado nenhuma. Vazio por esquecimento é defeito; vazio porque não existe interação é a
verdade. A regra passou a aceitar teclado vazio **quando a ausência está declarada em
`a11y.apg`**, que é o idioma do critério 3 do `QUALITY.md`. Só reprova quem deixou os dois em
branco — que é literalmente "não pensei no teclado".

---

## 5. A fila

Ordem decidida pelo Victor em 31/07/2026: **os baratos primeiro**, porque em todos eles o motor
que já usamos entrega o comportamento e falta só a pele. Risco baixo, e enquanto isso o
inventário de demanda real decide os caros.

| Lote | O que | Por quê |
|---|---|---|
| ~~**0**~~ | ~~as quatro travas acima~~ | **concluído em 31/07/2026** — checks 21 a 24, provados contra o defeito |
| ~~**1**~~ | ~~`Toggle` · `Spinner` · `NumberField` · `OTPField` · `HoverCard`~~ | **concluído em 31/07/2026** — o registro por componente está no `REFERENCES.md` |
| ~~**2**~~ | ~~`AvatarGroup` · `Stepper`~~ | **concluído em 31/07/2026** — mais os três defeitos do `Avatar` que a medição achou |
| ~~**3**~~ | ~~`Chart` · `ChartTooltip` · `ChartLegend`~~ | **concluído em 01/08/2026** — envelope sobre Recharts (MIT, 3.10.1), subpath próprio e peer opcional. Duas das quatro referências envelopam o mesmo motor; nenhuma escreve um |
| ~~**4**~~ | ~~`Calendar`~~ | **concluído em 01/08/2026** — react-day-picker (MIT, 10.0.1), subpath próprio e peer opcional. O Base UI não tem calendário: medido, e foi o que abriu a decisão do motor. Não há `DatePicker`: é composição, e virou pattern |
| **—** | ~~o resto~~ | **superado em 02/08/2026** — a fila deixou de ser por lote e passou a ser o [`PLANO-1.0.md`](PLANO-1.0.md) |

### A fila mudou de dono em 02/08/2026

Os lotes 0 a 4 fecharam, e com eles a lista curta acabou. O que falta é grande demais para caber
numa tabela de lote: está em **[`PLANO-1.0.md`](PLANO-1.0.md)**, dividido em 11 partes, com
checkbox por item. **É lá que se lê o que fazer a seguir**, e a autorização passou a ser por
PARTE, não por lote.

### ⚠ Esta seção está SUSPENSA até a `1.0`

O critério que estava escrito aqui — *"componente que nenhuma superfície pede espera"* — **não
vale mais até a `1.0` sair.** Foi suspenso pela
[ADR-0015](../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md), por uma razão medida: com ele,
cada peça que faltava virava uma interrupção no trabalho de quem depende da biblioteca.

Até a `1.0`, a fila é decidida por **cobertura do contrato**. O
`packages/contracts/aurea.contract.json` descreve o que a Aurea promete ser; o que ele descreve e
não existe em código é dívida, com ou sem pedido.

**O resto deste documento não está suspenso.** Cobertura decide *o que entra na fila* — não
autoriza construir de memória, pular a medição do passo 1, ignorar as referências ou afrouxar as
travas 21 a 24.

Quando a `1.0` sair, esta seção volta a valer e a ADR-0015 passa a `superada`.

---

## 6. O que este documento não decide

- **`features` e `examples` nas fichas de starter.** O `props` **saiu desta lista**: o achado M8
  fechou na Parte E do [`PLANO-1.0.md`](PLANO-1.0.md) em 07/08/2026 e todas as fichas publicam
  contrato de API. O que falta é conteúdo dos componentes que já existem, não construção de novos —
  fila própria, e as contagens vivem no `STATE.md`, que é gerado.
- ~~**`apps/docs/index.html`**~~ — **removida** na Parte D, em 08/08/2026, com o `docs.css`, o
  gerador e as 52 baselines. Fechou o M13, o último achado da auditoria integral. O ganho de CSS
  medido foi de **1,09 KB**, e não os ~25 KB que esta linha prometia: a Fase 4 já tinha cobrado
  aquele ganho ao mover 199 regras para o `docs.css`, e contá-lo de novo seria contar duas vezes.
- **Os 6 componentes que nenhuma das quatro referências tem** (`KPI`, `LogStream`,
  `NotificationCenter`, `MediaPlayerShell`, `Timeline`, `TableOfContents`). Decisão do Victor em
  31/07/2026: **ficam todos**, e entram na fila de conteúdo junto com os outros 44.
