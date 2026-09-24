# Achados — auditoria integral Aurea UDS — 26/07/2026

**41 achados: 41 fechados, 0 abertos, 0 parciais.** Placar por achado no §0.
**A auditoria integral de 26/07/2026 está encerrada.** Os dois últimos caíram em dias seguidos:
o **M8** em 07/08 (Parte E — era a condição de saída de `0.x` pela
[ADR-0014](../../decisions/0014-primeira-versao-publica-0-1-0.md)) e o **M13** em 08/08
(Parte D).

Distribuição: Críticos 2 · Altos 12 (A9 na Fase 3; A11 e A12 na Fase 5; A13 na Fase 7) · Médios 20 (M20 na Fase 5) · Baixos 7 (B7 na Fase 5).
Este cabeçalho já errou duas vezes por contagem à mão, no documento que denuncia contagem à
mão. Agora vem derivado da tabela do §0 — se algum dia divergir, a tabela é a fonte.

Mais 8 falsos alarmes registrados no §5 — igualmente importantes: são hipóteses plausíveis
que a medição derrubou.

Formato de cada achado: identificador · severidade · categoria · estado da verificação ·
localização · evidência · observado · esperado · impacto · extensão · causa imediata ·
causa raiz · dependências · recomendação · critério de correção · testes · doc afetada.

---

## 0. Estado das correções

O texto de cada achado abaixo é o da auditoria e **não é reescrito** — é registro.
Esta tabela é o que muda.

| Achado | Estado | Onde fechou |
|---|---|---|
| I1 — estado declarado em três docs, todos errados | **fechado** | Fase 1: `STATE.md` gerado + check 13 do `validate.py`; `BUILD_REPORT.json` removido |
| A1 — densidade não alcança tab/segmented/pagination | **fechado** | Fase 2: altura na cápsula via `var(--control-h-md)` |
| A2 — badge herda `line-height` e mede duas alturas | **fechado** | Fase 2: `line-height:1` + `min-height:var(--space-6)` + glifo com tamanho próprio |
| A3 — altura do chip depende do rótulo | **fechado** | Fase 2: `nowrap` + truncamento no `.chip-text` e no `.status-label` |
| B2 — alvo interativo de 67×13px | **fechado** | Fase 2: `min-height:24px` no `.btn-link` (SC 2.5.8) |
| B3 — `.btn-sm` com três alturas | **fechado** | Fase 2: `.pagination button:not(.btn)` — o seletor de elemento vencia por especificidade |
| A4 — `Icon` fixa sprite absoluto e 16 componentes repassam a prop | **fechado** | Fase 3: `spriteUrl` no `AureaProvider` via contexto; 52 sítios → 2 |
| M9 — variante pública que o contrato não declara | **fechado** | Fase 3: `oracle` fora de `BadgeVariant` + check 14 (tipo ⟷ ficha) |
| M14 — `ref` não chega nos componentes | **fechado com o diagnóstico corrigido** | Fase 3: era o TIPO, não `forwardRef` — ver §0.1 |
| A9 — componente descarta props que o tipo promete | **fechado** | Fase 3: achado novo, KPI/AppShell/Table — ver §0.2 |
| A6 — um quarto do core é chrome de docs e mockup de produto | **fechado** | Fase 4: 199 regras + 9 blocos `@media` → `apps/docs/docs.css`; core 28% menor; check 15 |
| M6 — `component-inventory.json` sem consumidor | **fechado** | Fase 4: removido — era cópia do contrato e já tinha divergido (ver §0.3) |
| A7 — os quatro overlays sem nenhum teste | **fechado** | Fase 5: 16 casos, axe com overlay ABERTO; e um defeito real de a11y na Tooltip (§0.5) |
| M7 — maturidade decorativa | **fechado** | Fase 5: 15 fichas `Stable` ganharam teste; check 16 cobra |
| M10 — indicador de foco não uniforme | **fechado** | Fase 5: contrato de foco (1 cor, 1 espessura, 2 offsets) + gate |
| A11 — Tooltip sem relação acessível | **fechado** | Fase 5: achado novo — ver §0.5 |
| A12 — Field mistura hint e erro no NOME do campo | **fechado** | Fase 5: achado novo — ver §0.5 |
| M20 — `SegmentedControl` com `aria-pressed` onde o APG indica `radiogroup` | **fechado** | Parte C do `PLANO-1.0` (07/08/2026): `RadioGroup` + `Radio` do Base UI, com [ADR-0016](../../decisions/0016-segmented-control-e-radiogroup.md). O teste que trancava o defeito virou o teste do padrão — e o do TECLADO é o que separa "renomeamos papéis" de "entregamos o padrão" |
| B7 — popup em portal fica fora de landmark | **fechado, com o diagnóstico corrigido** | Parte C (07/08/2026): o defeito não era o portal, era o consumidor **não ter como** mexer nele. `portalContainer` no `AureaProvider` repassa o `container` do Base UI aos 11 portais; com ele o axe passa com `region` LIGADA — ver §0.13 |
| M1 — identidade não era sempre via token | **fechado** | Fase 6: catraca em 4 eixos de identidade; peso e entrelinha zerados |
| M2 — tokens sem uso | **fechado** | Fase 6: 26 mortos removidos (86→63 sem uso); os 63 documentados com motivo |
| M3 — tokens duplicados | **fechado** | Fase 6: alias virou referência DTCG; 4 duplicatas removidas |
| M4 — unidade mista no eixo de raio | **fechado** | Fase 6: `--radius` (o único rem) removido |
| M5 — quatro eixos ausentes | **fechado** | Fase 6: peso, tamanho de ícone, letter-spacing e alvo de toque criados E em uso |
| M16 — cascata sem camada | **fechado** | Fase 6: `@layer aurea` — e a lição do token dentro da camada (§0.7) |
| M17, M18 — contrato de densidade e de tema | **fechados** | Fase 6: `packages/tokens/README.md` |
| M15 — `$description` nos tokens | **fechado** | Parte C (07/08/2026): os **70** nomes semânticos (`theme` + `density`) descritos, e o **check 27** cobra. O `base` fica fora de propósito — ver §0.13 |
| I2 — o "padrão único" não é o que o gerador implementa | **fechado** | Fase 7: modelo como DADO (`scripts/page-model.mjs`), um `itemPage` para os quatro tipos, gate nas 169 páginas, e as 23 receitas com preview e código. Decidido pela [ADR-0001](../../decisions/0001-modelo-de-pagina-do-catalogo.md) |
| M11 — dois esquemas de slug | **fechado com o diagnóstico corrigido** | Fase 7: slug do pattern = ficha + nome; a variante saiu da URL. A causa que o achado nomeou estava errada — ver §0.8 |
| B1 — altura fixa do demo | **fechado como decisão registrada** | Fase 7: [ADR-0002](../../decisions/0002-altura-fixa-do-demo.md), com o custo medido (94% de vazio no preview de uma linha) |
| A13 — classe que o React emite sem regra no core | **fechado** | Fase 11: as 9 ganharam pele; `semRegra` caiu de 12 para 3; `.grid` saiu do chrome do catálogo. E um achado de tabela: o `.command` do core passava no gate por acidente — ver §0.12 |
| A8 — catálogo sem navegação móvel | **fechado** | Fase 8: a lateral vira gaveta abaixo de md, com popover NATIVO e zero JS. [ADR-0003](../../decisions/0003-gaveta-de-navegacao-sem-javascript.md); o `h1` saiu de 4,6 telas abaixo para 196px — ver §0.9 |
| M13 — duas escalas de responsividade | **fechado** | Parte D do `PLANO-1.0` (08/08/2026): `LEGACY_BP` está **vazia**. Quatro breakpoints saíram junto com `apps/docs/index.html`, o de 1100 já não era usado, e o de **400 virou `@container`** — o sexto servia o `MediaPlayer`, e trocá-lo por um degrau da escala teria fechado o gate mantendo o defeito. Ver §0.15 |
| A5 — pacote indivisível, 8 dependências de runtime | **fechado** | Fase 9: 18 módulos por categoria, 17 subpaths, 1 dependência de runtime e 7 peers opcionais. Os três pesados fora do barril; checks 19 e smoke de CI — ver §0.10 |
| M19 — sem registro de decisão, referência, critério nem protocolo | **fechado** | Fase 10: 12 ADRs, `REFERENCES.md`, `QUALITY.md`, `MAP.md`, `manifest.json` gerado (check 20) e o protocolo declarado canônico |
| B5 — o produto elogia a si mesmo no chrome | **fechado** | Fase 10: selo "Dogfooded" removido |
| B6 — dois documentos históricos não se declaram históricos | **fechado** | Fase 10: aviso no topo de `MIGRATION.md` e `FASE-6-BRIEF.md` |
| B4 — string em português no conteúdo | **fechado como FALSO ALARME** | Fase 10: a ocorrência está num comentário, e comentário é pt-BR por decisão ([ADR-0012](../../decisions/0012-idioma-do-produto-e-ingles.md)) |
| A4 (18/07) — gate de pixel inativo | **fechado** | Fase 10: 48 baselines `-linux.png` commitados; a CI compara e bloqueia. **Não entra na contagem desta auditoria** — é follow-up da de 18/07/2026, e está aqui porque era o bloqueio mais antigo em aberto |
| M8 — o contrato de API publicado cobre um terço da biblioteca | **fechado** | Parte E do `PLANO-1.0` (07/08/2026): as **76** fichas publicam `props`, medido pelo check 13 no `STATE.md`. Toda assinatura saiu do fonte do módulo, e ler o código para escrever a ficha achou três defeitos que ninguém procurava — ver §0.14 |
| M12 — texto a 200% rola de lado | **fechado** | Fase 5 (T5.4): quebra por conteúdo + geometria em rem; gate nas 169 páginas. A causa que eu supus estava errada — ver §0.6 |

### §0.15 — a Parte D: o M13 fecha, e a auditoria encerra

**A página manual saiu.** `apps/docs/index.html`, 682 KB escritos à mão, mais o `docs.css`, o
gerador, o `docs.spec` e as 52 baselines dele.

**O ganho medido no core foi 0,60 KB, não os ~25 KB que o plano prometia** — e a diferença não é
erro de medição, é contagem dupla: a **Fase 4** já tinha cobrado aquele ganho ao fechar o **A6**,
movendo 199 regras e 9 blocos `@media` para o `docs.css`. O que sobrava no core eram 8 regras.

**O número caiu duas vezes antes de ficar certo, por motivos diferentes, e os dois são lição:**

1. **45 classes → 12**, quando o extrator passou a enxergar o que o React monta por TEMPLATE
   (`badge-${variant}` e outros 14 prefixos). Mesmo ponto cego do check 18 que o item E13 achou
   no `LogStream`, um dia antes.
2. **12 → 9**, quando a pergunta obrigatória do `CLAUDE.md` foi feita ao contrário — não "quem
   mais tem esse problema?" e sim **"quem mais usa isto?"**. Resposta: `.demo` em **178** páginas
   do catálogo, `.doc-nav` em **183**, `.eyebrow` em uma. Removê-las teria quebrado as 183
   páginas geradas, e o gate não veria porque elas continuariam declaradas.

**O M13 não fechou por remoção — o sexto breakpoint MUDOU DE NATUREZA.** Quatro
(`1366`/`821`/`800`/`820`) saíram com a página; o de `1100` já não era usado; e o de `400`
**servia o `MediaPlayer`**. Trocá-lo por um degrau da escala (`639`) teria fechado o gate
mantendo o defeito, porque a largura que aperta os controles é a do **player**, não a da janela —
um player numa lateral de 400px dentro de uma tela de 1920px tem exatamente o mesmo aperto, e o
breakpoint de viewport nunca o via. Virou `@container`. Conferido no navegador, na página real:
em 375px o player mede 243px, o `container-type` é `inline-size` e os controles recebem os 44px
de `--target-min`.

**E o check 4b tinha um buraco desde que nasceu — a QUARTA vez que um gate deste repositório lê
prosa como código.** Ele varria o fonte inteiro atrás de `@media (max-width:NNNpx)`, então o
comentário que explica por que um breakpoint saiu — e que precisa citar a forma antiga para
explicar — era contado como se fosse a regra. Apareceu no instante em que o último legado virou
`@container` e a prosa ao lado reprovou o build. As três anteriores: check 12 (02/08), check 23
(06/08) e a primeira medição do próprio D1 (08/08, algumas horas antes). Corrigido com o
`_sem_comentario` que já existia, e provado nos dois sentidos.

**Uma coisa escapou do inventário do D1 e foi achada pela suíte:** o `rtl.spec` também abria a
página manual — e fazia pior que lê-la, **trocava o `<style>` dela pelo do core em tempo de
execução** para medir cinco componentes. Reancorado numa página gerada no próprio teste, no
padrão do `skin.spec`. Ficou melhor do que era: agora não há mais nada na página para interferir.

**A prova de que só saiu código morto: zero pixel.** As capturas passaram 61/61 na máquina
Windows e 61/61 dentro do contêiner, sem uma baseline regravada.

### §0.14 — a Parte E: o M8 fecha, e ler o código para escrever a ficha achou mais três

O M8 era "43 de 76 fichas não publicam `props`". A correção é escrever contrato, e o único jeito
honesto de escrever contrato é **ler a implementação linha a linha** — não a ficha antiga, não a
memória. Foi essa leitura, e não uma busca por defeito, que achou os três abaixo. Vale registrar
porque é o argumento a favor do custo: publicar API é uma revisão de código disfarçada.

**1. `source.react` mandava o consumidor para o arquivo errado, em 58 das 76.** O campo que diz
onde se lê a implementação apontava para `packages/react/src/index.tsx`, que desde a Fase 9 é o
**barril** — 38 linhas de reexport. Em 76% das fichas o contrato mentia sobre a própria
localização. Ninguém viu porque o **check 11** valida o NOME do componente e nunca abriu o caminho
declarado. Fechado com o **check 28**, que cobra as duas metades — o arquivo existe **E** declara
o componente. Só a existência aprovaria `index.tsx` de novo, que é exatamente o defeito.

**2. O `Progress` grampeava o desenho e não o ARIA.** Com `value=150` a barra parava em 100% e o
leitor de tela anunciava "150 de 100". É a causa raiz de sempre — o grampo existia num lugar só —
e a correção é uma expressão servindo os dois. O teste cobra os dois lados (150 e −10, atributo e
largura), porque grampear só o ARIA passaria num teste que olhasse só o atributo.

**3. A ficha do `Progress` prometia um modo que não existe.** Dizia "Determinate or indeterminate"
e listava o estado `indeterminate`. Não há: `value` é obrigatório e o core só tem `.progress`
determinada (medido). Contrato que promete o que não existe custa mais que ausência.

E um quarto, que é o achado I1 uma camada abaixo: **o `STATE.md` é gerado, mas a FRASE sobre o
número era fixa.** O gerador escrevia "os 54 starters ainda não têm `props`: é o achado M8, que
segue aberto" — verdade até o instante em que a cobertura fechou, e mentira depois, dentro de um
arquivo cujo cabeçalho diz "GERADO. Não editar à mão" e que o check 13 gateia. Gerar o número não
basta se a prosa sobre o número continua escrita à mão. Agora ela deriva da medição.

### §0.13 — a Parte C do `PLANO-1.0`: os três de semântica, e um diagnóstico que estava errado

**M20 — o teste mudou de lado.** O `SegmentedControl` era `role="group"` com N `aria-pressed`, o
que descreve N alternâncias independentes. O teste da Fase 5 **trancava o defeito de propósito**,
para que a troca fosse deliberada; a [ADR-0016](../../decisions/0016-segmented-control-e-radiogroup.md)
é a decisão que faltava. Agora é `RadioGroup` + `Radio` do Base UI: um ponto de tabulação para o
grupo, setas que movem **e** selecionam, `Home`/`End`.

Duas coisas que só apareceram porque foram medidas antes de escrever: o `Radio.Root` renderiza um
**`<span>`**, e a pele da Aurea é `.segmented button` — sem `render={<button/>}` o componente
perderia a pele inteira, e **o check 18 não veria**, porque ele compara classe, não elemento. E o
motor emite um `<input>` escondido por item, que é `position:fixed` e `aria-hidden`.

Provado contra o defeito com a alternativa que mais tentaria: um `radiogroup` escrito à mão, com
os papéis certos e sem roving tabindex. O teste de semântica **passa**; o de teclado **reprova**.
É a diferença entre renomear papéis e entregar o padrão, e agora há um gate que a enxerga.

**B7 — o diagnóstico do achado estava certo no sintoma e errado na conclusão.** Ele dizia que "a
única forma de satisfazer seria o consumidor montar o portal dentro do landmark dele", e tratou
isso como impossível. O defeito real era outro, e mais simples: **o consumidor não tinha essa
forma.** O `container` do Base UI existe em todos os portais e nunca foi exposto — a saída
possível estava trancada por dentro.

`portalContainer` entra pelo `AureaProvider`, uma vez, e alcança os **11** portais da biblioteca
(diálogo, gaveta, dica, popover, cartão de prévia, os dois menus, notificação, dois comboboxes,
toast). É configuração de aplicação, então mora onde o `spriteUrl` mora — e pela mesma razão
medida no achado A4, onde 52 sítios repassavam a mesma prop à mão.

O default não mudou: sem a prop, o portal vai para o `body`, que é o que permite empilhar e
posicionar sem herdar `overflow` nem `transform`. O teste antigo continua lá, com a regra
`region` desligada e o motivo escrito; o **novo** roda o axe com ela **ligada**, e reprova se o
container deixar de ser repassado — provado tirando-o só da dica.

**M15 — descrever 70, e declarar por que não 175.** Os nomes de `theme` e `density` são a camada
que se **escolhe**, e é ali que a ausência custa: ninguém sabia quando usar `--surface-2` em vez
de `--surface-3`. O `base` ficou fora **de propósito** — são primitivos (`space-4`, `text-lg`),
onde o nome já é a descrição e uma frase obrigatória viraria enchimento. Descrição de enchimento
é pior que ausência, porque parece contrato.

O **check 27** cobra por **NOME, não por declaração**: `primary` existe no dark e no light,
`control-h-md` nas três densidades. Exigir a frase em cada uma seria a mesma prosa em dois ou três
lugares — o achado **I1** esperando para acontecer. Provado nos dois sentidos: tirando a descrição
de um token semântico ele reprova nomeando o token; tirando a de um primitivo, **não** reprova.

### §0.12 — a Fase 11: a pele que faltava, e o gate que aprovava uma regra vazia

**A13, medido antes de escrever uma linha.** Os seis componentes renderizados por SSR e abertos
com **só o core** — sem o chrome do catálogo, que é o mundo do consumidor:

| Classe | Como saía | Regra escrita | Referência |
|---|---|---|---|
| `.grid` | **`display:block`** — o Grid não era grid: empilhava | `grid-template-columns:repeat(auto-fill,minmax(min(var(--grid-min,15rem),100%),1fr))`, `gap:var(--space-4)` | os irmãos `.stack` e `.cluster`, que já existiam |
| `.timeline-dot` | **`0×0`, `display:inline`** — o trilho existia e a marca não; e o `<ol>` ainda mostrava a numeração do navegador | círculo de `var(--space-3)` em `--primary`, com anel de `--surface-1`; o trilho passou a ficar a **meio diâmetro do ponto**, então alinham por construção | ficha do Timeline (já declarava `--border`, `--primary`, `--surface-1`) |
| `.command-overlay` | `position:static` — não cobria nada | `fixed`, `inset:0`, `--overlay` + blur, `z-modal` | `.dialog-backdrop` do core |
| `.command-palette` | 810px de largura, sem superfície, sem raio, sem sombra | superfície flutuante: `--radius-card`, `--popover`, `--shadow-lg`, `width:min(680px,100%)` | a ficha do componente já listava esses tokens |
| `.data-list` | `<dl>` cru: `dt`/`dd` empilhados, com o recuo de 40px do navegador | duas colunas (`max-content` + `1fr`), termo em `--muted-foreground` | `th` do core (o termo é secundário, o valor é o conteúdo) |
| `.accordion` | `display:block`, sem divisória | coluna com `border-block` e divisória de 1px entre itens | Carbon, medido (`REFERENCES.md`) |
| `.accordion > summary` | 21px — a altura do texto, nada mais | `min-height:var(--control-h-md)`, peso medium, hover em `--surface-hover` | Carbon: cabeçalho na altura de controle |
| `.accordion-content` | `padding:0` — o corpo colava no título | respiro pequeno em cima, `--space-6` embaixo | Carbon: 8px / 24px |
| `.empty-state` | `display:block`, `padding:0`, alinhado à esquerda | coluna centralizada, `--space-10`/`--space-6`, `--muted-foreground` | `.notification-empty` e `.datagrid-empty`, que já respondiam isso assim |
| `.empty-title` | o `h3` do **navegador** (16,38px) | `--text-base` + `--weight-semibold` + `--leading-tight` | — |

**O achado de tabela: `.command` passava no gate da fronteira por acidente.** O core tinha uma
regra `.command` que é exatamente a superfície da paleta — e que **nenhum componente React
emite**: é o chrome da paleta vanilla da página de docs manual. Ela sobreviveu à Fase 4 porque o
check 15 lê as **strings** do pacote React, e o rótulo padrão `"Type a command…"` põe a palavra
`command` numa string. Ou seja: o gate que existe para manter o core limpo estava aprovando
chrome de documentação por causa de um texto de interface. A regra foi para
`apps/docs/docs.css`, que é a casa dela, e o sistema ficou com os dois nomes que o componente
emite de verdade. **Limite que fica declarado:** o check 15 não distingue nome de classe de
palavra de rótulo; é a mesma família do limite que ele já declarava ("olha classe, não regra").

**E o outro limite, esse achado ao tentar provar o controle:** o **check 18 olha NOME, não
efeito**. Trocando a regra do `.grid` por `.grid { }` — regra vazia — o validador continua
**verde**. Foi medido, não suposto:

| Estado do `.grid` | check 18 | `skin.spec.ts` |
|---|---|---|
| regra removida | **reprova** ("2 classes que o React emite não têm regra") | **reprova** |
| regra **vazia** (`.grid { }`) | passa | **reprova** ("o Grid tem de ser grid") |

Por isso a fase não fechou só com o check 18: entrou `tests/visual/skin.spec.ts`, que monta os
seis componentes com **só o core** e mede o efeito — 20 asserções, 2 temas. É o controle que
corresponde ao defeito que o A13 realmente era: *funciona na nossa documentação e não no
consumidor*.

**O que não precisou acontecer:** regerar baseline. `.grid` é a única das nove que aparece em
página fotografada (13 vezes no `index.html` do catálogo), e a regra do core foi escrita
equivalente à do chrome que saiu — `15rem == 240px`. Os 96 baselines passaram intactos, e é
essa passagem que **prova** a T11.3: se o catálogo continua idêntico depois de tirar a
redefinição do gerador, a regra do core está certa.

**Ganho medido de passagem:** a catraca de px cru do core caiu de **128 para 123**. Amarrar o
ponto e o trilho da timeline ao mesmo token dispensou os cinco literais que aquela regra tinha
(`24px`, `7px`, `5px`, `5px`, `18px`).

**Três coisas que só apareceram porque a fase foi verificada de verdade, e não só escrita:**

1. **O gate de RTL estava ancorado no recuo da timeline** — `padding-left: 24px` —, e esse
   recuo deixou de existir quando a regra passou a derivar do ponto. Reancorado no que a
   timeline de fato espelha agora: o `inset-inline-start` do trilho. Provado contra o defeito
   (trocando por `left` físico, reprova). É o mesmo movimento do §0.4, quando o gate media
   `.agent-card`: gate ancorado na coisa errada morre na primeira mudança legítima.
2. **A página de docs manual usava o `.timeline` do core com markup próprio** (`<div
   class="timeline-item">`, não `<ol><li>`), e o ponto dela é um `:before` posicionado em
   `-21px` — dependente do recuo que saiu. Os dois baselines de pixel dos docs acusaram. A
   geometria antiga foi para `apps/docs/docs.css`, presa ao markup legado com
   `:has(> .timeline-item)`; os baselines voltaram a passar **sem regeneração**. Chrome de
   documentação vive no docs.css: é a Fase 4 aplicada, não uma exceção nova.
3. **O item da timeline SEM descrição colava título e horário** — "Shipped14:20" — enquanto o
   item com descrição empilhava, porque o `<p>` é bloco e o `<small>` não. Achado olhando a
   página de verdade depois de tudo verde. É A2/A3 de novo (geometria dependendo do conteúdo)
   num componente que ninguém tinha olhado porque ele nunca teve pele. Corrigido na mesma
   regra, com asserção própria no `skin.spec.ts`.

### §0.11 — a Fase 10: governança, e o gate mais antigo em aberto

**M19 pedia sete coisas que não existiam.** O que foi feito, e o que foi feito **diferente** do
que a tarefa pedia:

| Pedido | Entregue |
|---|---|
| Registro de decisões (T10.1) | 12 ADRs. **Não** escrevi uma por decisão: onde a decisão já está em vigor E cobrada por gate, o registro é uma linha na tabela do `decisions/README.md` com data e quem obriga. Documento cerimonial em cima de gate é artefato para envelhecer — é a lição do M6 |
| Registro de referências (T10.2) | `REFERENCES.md`, com o número medido de cada uma, o que NÃO entrou, e a licença verificada em 30/07/2026 |
| Critérios de qualidade (T10.3) | `QUALITY.md`, cada critério com **quem cobra**. Dois critérios novos que a execução ensinou; um corrigido (o de `ref` — ver §0.1) |
| Protocolo canônico (T10.4) | declarado canônico **no mesmo caminho**: mover quebraria os links entre os quatro documentos e criaria um segundo lugar para a mesma coisa |
| Manifesto de máquina (T10.5) | `manifest.json` **derivado** e gateado (check 20), com a condição de morte escrita dentro dele: sem consumidor até a publicação, apagar |
| Mapa do código (T10.6) | `MAP.md`, com o DAG dos módulos e a receita de componente novo |
| B4, B5, B6 (T10.7) | dois resolvidos; **B4 é falso alarme** — a "string em português" está num comentário, e comentário é pt-BR por decisão |

**E o A4 de 18/07/2026 fechou — o bloqueio mais antigo do projeto.** O gate de pixel estava
inativo desde então por falta de baseline Linux, e esta máquina é Windows. Rodei o
`workflow_dispatch` que existia para isso, baixei o artefato e commitei 48 baselines. A CI agora
compara pixel e **bloqueia**.

Duas coisas que só apareceram por fazer isso de verdade:

1. **A regeneração cobria duas das três specs de pixel.** O passo de comparação já rodava
   `catalog.spec.ts`; ativar o gate assim quebraria a CI na primeira execução, porque o
   Playwright não cria baseline sozinho com `CI=true`. Corrigido antes de disparar.
2. **O gate `dist == build` pegou um erro meu.** Removi o selo "Dogfooded" do gerador e commitei
   sem regerar as 169 páginas. A CI acusou — e é por isso que os baselines saíram certos: ela
   gera do build, não do que está commitado.

### §0.10 — a Fase 9: o que o pacote publica, e o gate que estava mais fraco do que se pensava

**A5, medido antes e depois:**

| Medida | Antes | Depois |
|---|---|---|
| Arquivos no pacote React | 1 (970 linhas) | 18, o maior com 140 |
| Pontos de entrada | 1 (`.`) | 17 (13 categorias + 3 pesados + o barril) |
| Dependências de runtime | 8 | **1** (`@base-ui/react`) |
| Peers opcionais | 0 | 7 |

Os três componentes pesados **saíram do barril**: se ficassem, importar um `Button` carregaria
CodeMirror, react-table e `qr` — e a dependência opcional que o consumidor não instalasse
quebraria a importação com "Cannot find module". Fronteira que não muda o que se baixa é
decoração.

**O grafo foi medido antes de mover uma linha.** As 13 categorias tinham **três ciclos de 3**,
todos passando pelo mesmo ponto: `Button` usa `Kbd`, cuja categoria é Data Display, que depende
de Layout, que depende de Actions. Um componente de uma linha travava a ordem inteira. O `Kbd`
foi para o módulo interno com o motivo escrito, e sua casa pública (`/data-display`) o
reexporta — uma exceção declarada em vez de um ciclo silencioso.

**Duas armadilhas de ferramenta, para a próxima sessão não repetir:**

1. **`moduleResolution: "bundler"` emite import sem extensão, e o Node ESM recusa.** O build
   passou e o `import()` explodiu com `ERR_MODULE_NOT_FOUND`. Todo especificador relativo do
   pacote leva `.js` — apontando para o `.tsx`, que é o idioma correto de ESM em TypeScript.
2. **Remover comentário de JavaScript com regex come código.** Tentei limpar comentários para
   parar de contar palavra de comentário como classe; o `/*` de dentro do comentário
   "grupo de tipo (image/*)" abriu um bloco que fechou 4.750 caracteres adiante, levando junto
   o `className="dropzone"`. A saída não foi um tokenizador: foi trocar o corpus. Nome de classe
   só nasce **dentro de string**, então o gate passou a ler as strings do fonte.

**E aí apareceu o que importa: o check 15 estava mais fraco do que se acreditava.** Ele
procurava o nome da classe no fonte inteiro, então **identificador de código contava como
classe**: a variável `const off=disabled||loading` do Button fazia `.off` parecer produzida pela
biblioteca. Com o corpus correto, 5 classes que passavam há meses apareceram
(`alt`, `bad`, `off`, `open`, `step`) — todas chrome do `apps/docs` ou modificador grudado em
mockup. A allowlist cresceu 5 nomes **porque a medição ficou honesta, não porque o core piorou**,
e o JSON diz isso. É o mesmo tipo de correção que o §"Correção de números desta própria
auditoria" registra: gate que mede errado dá verde falso, e verde falso é pior que vermelho.

**Controles que impedem a volta:** check 19 (dependência pesada só no módulo dela — provado
contra o defeito: um `import ... from "codemirror"` em `inputs.tsx` reprova) e o smoke da CI, que
importa os 13 subpaths de categoria, os 3 pesados, e falha se um pesado reaparecer no barril.

**Limite declarado:** o critério do achado fala em `pnpm why codemirror` num app externo. O que
foi verificado aqui é o que **seria publicado** — `npm pack --dry-run`: 40 arquivos, todos em
`dist/`, e nenhum dos sete pacotes pesados em `dependencies`. Um app de verdade instalando do
npm não foi montado; isso só existe depois de publicar.

### §0.9 — a Fase 8: o gate que passava enquanto a página era inutilizável

**A8, medido antes de tocar em nada** (`button.html`, 375×812):

| Medida | Antes | Depois |
|---|---|---|
| Onde o `h1` começa | **3.710px — 4,6 telas abaixo** | **196px** |
| Itens de navegação antes dele | 65 de 65 | 0 |
| Altura da página | 14.104px | 10.590px |

O gate de rolagem lateral **passava** o tempo todo: nada estourava a largura. É o registro mais
limpo desta auditoria de que **medir a propriedade errada dá verde falso** — e a correção não é
outro gate de overflow, é medir onde o objetivo da página começa.

**A solução não tem JavaScript.** A lateral é um `popover` nativo e o botão do topo é o invoker;
Escape, clique fora, `aria-expanded`, volta do foco e `::backdrop` são do navegador. Decisão e
alternativas em [ADR-0003](../../decisions/0003-gaveta-de-navegacao-sem-javascript.md).

**Três coisas que só apareceram porque foram medidas, e não supostas:**

1. **`aria-expanded` não existe como atributo.** O popover entrega o estado na árvore de
   acessibilidade. O primeiro teste que escrevi usava `getByRole(..., {expanded})` do Playwright
   e reprovou — ele lê o atributo. O gate final lê a árvore por CDP; fica registrado para a
   próxima pessoa não repetir o caminho.
2. **`height:auto` com `top` e `bottom` postos não resolveu pelas âncoras.** O Chromium deu à
   gaveta a altura do CONTEÚDO — 3.498px de lateral rolando a página inteira. Altura explícita
   em `dvh`.
3. **O gate pegou um defeito meu antes de ele existir no repositório.** `.nav-toggle` empatava
   em especificidade com `.btn`, que vem depois no arquivo e vencia por ordem: o botão aparecia
   no desktop. O teste "acima de md não há gaveta" reprovou na hora. É o mesmo idioma que o core
   já usava em `.btn.mobile-nav-toggle` — a lição existia escrita e eu não a apliquei de
   primeira.

**M13, medido por dono** (quem usa cada breakpoint legado do core):

| Breakpoint | Regras | Quem serve |
|---|---|---|
| 820 (`display:block`) | 1 | agora só `apps/docs` — o shell do sistema saiu |
| 820 (`.mobile-nav-*`) | 3 | só `apps/docs` (classes que o React não produz) |
| 800 + 821 (`max-height`) | 6 | só `apps/docs` (`.doc-sidebar`) |
| 1366 + 821 | 1 | `:root{--sidebar-width:216px}` — o catálogo já sobrescreve |
| 400 | 3 | `.media-control*` — **sistema**, não docs |

Conclusão honesta: **`LEGACY_BP` não encolheu nesta fase, e não é falha de execução.** Cinco dos
seis breakpoints servem exclusivamente a uma página que esta fase não aposenta; o sexto (400)
governa o MediaPlayer, e migrá-lo é mudança de comportamento do player — outra fase, outro
baseline. O que mudou é que o shell do sistema deixou de depender de qualquer um deles.

**Observação medida de passagem, e que NÃO é do sistema:** conferindo que os docs manuais não
tinham quebrado, medi 317px de rolagem lateral em `apps/docs/index.html` a 375px. A causa é
`table { min-width:720px }` do core encontrando `<table>` escrito à mão FORA de um
`.table-wrap`/`.table-region`. É defeito daquela página, não da biblioteca: o componente `Table`
sempre embrulha, e as 170 páginas do catálogo passam na varredura de rolagem em 7 larguras.
Registrado aqui porque foi medido; morre com a página (A6/M13).

### §0.8 — a Fase 7, um achado novo e uma causa raiz minha que estava errada

**A13 — ALTO — 12 classes que os componentes React emitem não têm regra em CSS nenhum.**
*aberto.* Apareceu porque a fase obrigou a escrever preview para os 28 componentes que não
tinham nenhum: ao montar o do `CommandPaletteShell`, medi que `.command-overlay` e
`.command-palette` **não existem** no core, no `docs.css`, no chrome do catálogo — em lugar
nenhum. O componente é público, tem ficha, e renderiza sem pele. Perguntei "quem mais tem esse
problema?" antes de tocar em nada, e a resposta foi 12:

| Classe | Situação |
|---|---|
| `table` | não precisa: o core estiliza o **elemento** `table` (linha 335) |
| `combobox-section` | não precisa: é invólucro; a pele está em `.combobox-group-label` |
| `code-editor` | não precisa: a pele vem do `EditorView.theme` do CodeMirror, por decisão registrada no `index.tsx` |
| `accordion`, `accordion-content`, `command-overlay`, `command-palette`, `data-list`, `empty-state`, `empty-title`, `grid`, `timeline-dot` | **dívida**: componente público renderizando sem a pele |

O caso mais instrutivo é `.grid`: o chrome do catálogo **redefine** `.grid`, então o componente
`Grid` parece pronto em toda página deste catálogo e chega sem nada no consumidor. Um componente
que funciona na nossa documentação e não fora dela é o pior modo de falha possível para um design
system — e nenhum gate olhava para esse lado. O histórico confirma que nunca existiram: não é
regressão da Fase 4, é pele que nunca foi escrita.

**Gate no mesmo commit (check 18):** é o irmão do check 15, na direção contrária — classe que o
React emite tem de ter regra no core, ou estar na allowlist versionada de
`scripts/core-boundary.json`, que pode cair e nunca subir. **Não** escrevi as 9 peles nesta
sessão: pele é aparência, e aparência se decide com o Victor (`CLAUDE.md`) — entra como fase
própria, não como acréscimo silencioso no meio da Fase 7.

**M11: a causa raiz que eu escrevi estava errada.** O achado dizia "o slug vem de dois lugares
diferentes (nome do arquivo de content vs nome declarado do componente)". Medido: os dois sempre
vieram do **nome do arquivo**. O que produzia os dois esquemas era o segmento da **variante** —
`Button` + variante `Group` gerava `pattern-button-group-segmented-range`, indistinguível de um
pattern do `ButtonGroup`. A correção é tirar a variante da URL, não unificar fonte nenhuma. É a
segunda vez nesta auditoria (depois de M14 e M12) que uma causa raiz minha caiu na medição — e as
três vezes por eu ter escrito hipótese na linha "causa raiz".

**O que a fase achou de graça, por olhar o conjunto:**

- **9 entradas mortas** no `fallback` do gerador: componentes que já tinham arquivo de conteúdo
  próprio e portanto nunca caíam nele. Duas fontes para a mesma coisa, e ninguém percebeu porque
  código morto não falha. O check 17 agora reprova o par.
- **A lista de ícones do sprite era escrita à mão.** Um exemplo novo com ícone fora dela emitia
  `<use href="#i-x">` para um símbolo inexistente: **ícone invisível, sem 404 e sem gate** (o
  sprite é inline, então não há requisição para falhar). Agora o sprite é medido no HTML emitido.
- **O gerador nunca limpava o diretório.** Renomear slug deixava a página velha órfã — e contada
  pelo check 13 como página do catálogo.
- **`renderToStaticMarkup` não renderiza portal** (`<Dialog open>` = 0 bytes). É limite do meio,
  não conteúdo faltando; está declarado na emenda da ADR-0001.

**E o axe pegou três defeitos que os previews NOVOS criaram** — o que é o argumento inteiro a
favor de gate sobre as 169 páginas, porque os três passariam despercebidos numa revisão visual:

1. **Componente de página não cabe dentro de outra página.** O `AppShell` renderizado no painel
   de demo produzia `<main>` duplicado, `complementary` aninhado e dois `<nav>` com o mesmo nome.
   Testei a hipótese de que envolver num `<section>` neutralizaria o `<aside>` (HTML-AAM) —
   **caiu**: medido no navegador, o `aside` continua `complementary`. O preview do AppShell foi
   para um documento próprio, dentro de um `<iframe>`, com o tema atravessando por `postMessage`
   (em `file://` o iframe é de outra origem e ler o pai seria proibido). O `Sidebar` não precisou
   disso: ele espalha props, então o preview passa `role="presentation"`.
2. **O painel de preview rolava só com o mouse.** `scrollable-region-focusable` em duas páginas —
   mas a regra é do PAINEL, não daquelas duas: todo preview mais alto que a caixa cai nela. O
   `tabIndex` foi para o painel, que é onde o defeito mora.
3. **Contraste dentro da tela do player.** Um `Status` sobre `--media-canvas` reprovou AA. O core
   tem override de `Badge` para dentro do player e não tem de `Status` — componente que entra numa
   superfície própria precisa da regra dessa superfície. Trocado por `Badge`, e fica registrado
   como parente do A13.

E mais um parente do A13, achado no mesmo caminho: **link de navegação lateral não é componente
da Aurea.** O preview do AppShell com `<nav>` puro reprovou contraste; o que dá pele a ele é
`.doc-nav`, que é chrome do catálogo, não sistema. É o achado **A8** visto por outro ângulo, e
entra na Fase 8.

### §0.3 — o que a Fase 4 mediu, e onde A6 estava impreciso

A auditoria disse "25,3% dos bytes só docs / 3,9% só catálogo". O número estava certo em
magnitude e **frouxo em método**: o script lia `apps/docs/index.html` inteiro, e esse arquivo
contém o próprio CSS do core dentro do `<style>` — então toda classe "aparecia nos docs" e a
atribuição nunca foi verificada de fato. Refeito lendo só o MARKUP:

| Alcance | Antes da Fase 4 | Depois |
|---|---|---|
| Produzível por componente React | 61,0 % | **84,7 %** |
| Só a página de docs manual | 24,6 % | **0 %** |
| Só o catálogo gerado | 2,5 % | 3,5 % |
| Sem classe (reset, `:root`, `@media`) | 11,7 % | 11,7 % |
| Ninguém | 0,2 % | **0 %** |

Core: **89.207 → 64.207 bytes, 28% menor**. Isso é o que todo consumidor deixa de baixar.

Duas passadas foram necessárias: a primeira moveu 199 regras de topo; a segunda achou mais
9 blocos `@media` que misturavam regra de docs com regra do sistema. Sem a segunda, a
allowlist do gate nasceria com 80 classes em vez de 39 — e allowlist grande não gateia nada.

Prova de que a mudança é invisível: os **26 baselines de pixel dos docs passaram intactos**.
Mover regra altera ordem de cascata, e era o risco real da fase; ele não se materializou.

**Resíduo declarado** (`scripts/core-boundary.json`, 39 classes): 9 que o catálogo gerado
consome sem ter componente próprio (`demo`, `doc-nav`, `eyebrow`, `chart`, `hide-below-*`,
`nav-group*`, `warn`) e 30 que só aparecem grudadas numa classe do React
(`.btn.mobile-nav-toggle`, `.chart-bar.alt`). Somem quando `apps/docs` for aposentada.

**Limite do gate:** ele olha CLASSE, não regra. Regra nova de docs escrita com classe que já
está na lista passa. Declarado no próprio arquivo.

### §0.4 — o que a Fase 4 quebrou, e o que isso revelou

Mover o CSS derrubou `tests/visual/rtl.spec.ts`, e por um motivo que vale registrar: o gate
de RTL provava o espelhamento do **core** medindo `.agent-card` — um mockup da página de
docs. Gate do core medindo classe de fora do core não prova nada sobre o core.

Pior: o teste irmão media `.map-marker-a`, que também saiu, e passou a **passar vazio** —
ele compara LTR com RTL, e sem regra os dois lados vêm `auto`. Falha silenciosa num gate.

Reancorado em componente de verdade (`.switch-track::after` e o par check/spinner que o
README declara como não espelhados), com guarda que exige valor real antes de comparar.
Provado: removendo a regra do core, o teste reprova com "a regra existe?" em vez de passar.

### §0.5 — quatro achados novos, que só apareceram porque alguém testou

Escrever o teste dos overlays e dos 15 componentes `Stable` achou defeito que a auditoria
não tinha achado. Era previsível: ela auditou a API por medição, não por comportamento.

**A11 — ALTO — a Tooltip não existia para leitor de tela.** *fechado.*
Medido em 30/07/2026: o popup saía sem `role`, sem `id`, e o disparador sem
`aria-describedby`. Quem foca o botão ouvia só o rótulo dele — o conteúdo da dica **nunca**
era anunciado. Era tooltip visual, num componente que o README vende como acessível.
Corrigido com `role="tooltip"` + `id` no popup e `aria-describedby` no disparador (padrão
APG). O teste exige os três.

**A12 — ALTO — o `Field` empurrava dica e erro para dentro do NOME do campo.** *fechado.*
`hint` e `error` ficavam dentro do `<label>`, então o nome acessível virava
"E-mail Usamos para entrar Endereço inválido" — tudo grudado — e nada dizia que o valor era
inválido. Nome é o que o campo **é**; dica e erro são sobre o **valor**. Corrigido com
`aria-describedby` e `aria-invalid`, clonando o controle (é a única forma de ligar sem
obrigar o consumidor a repetir ids).

**M20 — MÉDIO — `SegmentedControl` usa `aria-pressed` onde o APG indica `radiogroup`.**
*aberto.* Para escolha única entre poucas opções, `aria-pressed` em vários botões sugere
alternâncias independentes e não anuncia "1 de 2". **Não corrigido de propósito:** trocar
isso muda a semântica para quem já consome, e é decisão a registrar, não ajuste. O teste
tranca o comportamento atual para a mudança ser deliberada.

**B7 — BAIXO — popup em portal fica fora de landmark.** *aberto.*
O axe acusa `region` ("todo conteúdo num landmark") contra a tooltip aberta, e não é
artefato de teste: acusa mesmo com `<main>` no fixture. O popup vive num portal no nível do
`body` por construção — é o que permite empilhar e posicionar. Não é WCAG A/AA, e a única
forma de satisfazer seria o consumidor montar o portal dentro do landmark dele. A regra está
desligada **só** nessa asserção, com o motivo escrito ao lado.

Também vale registrar o que **não** era defeito: `.combobox-chip-input{outline:none}` parecia
foco apagado, mas o wrapper `.combobox-multi:focus-within` mostra o anel — apagar o de dentro
evita anel duplo. E `Accordion` usa `<details>/<summary>` nativo em vez de `aria-expanded`,
que é a escolha certa e não a falta de uma.

Três expectativas minhas caíram no caminho, e todas por eu supor implementação em vez de
medir: o Base UI 1.6 **não** usa `aria-modal` (esconde o irmão com `aria-hidden`); o jsdom
**não** contém Tab (não implementa `inert`), então contenção real de foco fica declarada como
não provada; e `SearchField` é `input[type=search]`, cujo papel é `searchbox`, não `textbox`.

### §0.6 — M12: a causa raiz que eu escrevi estava errada

O achado dizia: "Causa raiz: sistema de unidades misto. Tipografia e espaçamento em `rem`
convivendo com geometria em px." Plausível, e **errado** — medido em 30/07/2026.

A causa real: o `flex-wrap` da barra superior vivia **dentro de um `@media`**. Ou seja, o topo
só quebrava quando a JANELA era estreita. Texto a 200% aumenta o CONTEÚDO com o viewport
parado, então o `@media` nunca disparava e o `.btn-nav` passava 27px da borda direita — em
todas as páginas, o mesmo excesso, porque o defeito era do shell e não do conteúdo.

Achei porque medi **qual elemento** cruzava a borda, em vez de aceitar a hipótese que eu
mesmo havia escrito. A hipótese estava marcada como causa; devia estar marcada como hipótese.

**Correção:** `.topbar,.topbar > nav { flex-wrap:wrap; }` fora do `@media` — quebra por
conteúdo, cobre os dois casos, e não muda nada quando cabe.

**A migração de unidade foi feita de todo modo, e vale por si:** 35 tokens de geometria do
shell (`sidebar-width`, `topbar-height`, `content-max`, `control-h-*`, `row-h`, `card-pad`,
`section-gap`, nas três densidades e no base) passaram de px para rem. Conversão **exata**
(px÷16), então a 100% não muda um pixel — os 52 baselines passaram intactos, o que é a prova
— e a partir daí a altura de controle e a largura da lateral acompanham o tamanho do texto.
Sem isso, o texto dobrado seria cortado dentro de um botão de altura fixa.

**Gate:** matriz de texto 200% nas 169 páginas, dentro do `catalog-sweep`. A varredura de
largura que já existia não cobria isto — ela mexe no viewport, e é justamente o que o texto a
200% não faz. Provado: devolvendo o `flex-wrap` para dentro do `@media`, reprova com +22px.

**E o meu gate de geometria quebrou com a migração** — ele comparava `parseFloat("2.25rem")`
com 36px. Não era defeito do CSS: era gate ingênuo sobre unidade, escrito duas fases antes.
Agora resolve o token em pixels com uma sonda, e sobrevive a qualquer troca de unidade futura.

### §0.7 — a Fase 6 e as duas medições minhas que estavam curtas

**A camada quase quebrou o produto, e o baseline pegou.** Pôr o core em `@layer aurea` parecia
mudança de uma linha. Não é: **CSS sem camada vence camada nomeada independente de
especificidade**. Duas consequências que eu não previ, ambas achadas por medição:

1. `apps/docs/docs.css` e o chrome do catálogo ficaram fora da camada e passaram a vencer o
   core em tudo — uma seção dos docs encolheu 1.056px. Eles ESPECIALIZAM o core, não o consomem
   de fora; foram para dentro da mesma camada e a cascata voltou a ser ordem + especificidade.
2. Eu deixei os **tokens** fora da camada raciocinando que "custom property não disputa cascata
   por camada". Falso: a **declaração** de uma custom property compete como qualquer outra. Com
   os tokens fora, o `:root{--sidebar-width:216px}` que o core declara dentro de um `@media`
   perdeu para o valor base e a lateral saltou de 200px para 248px.

Os dois só apareceram porque os 52 baselines de pixel existem. Foi a primeira vez nesta
sequência que o gate de pixel pegou algo que a medição de propriedade não pegaria.

**Duas contagens minhas estavam curtas:**

- **M1 estava desatualizado a favor do projeto.** A auditoria mediu 17 raios crus, 10
  `font-size`, 15 `font-weight` e 5 `line-height`. Ao chegar na Fase 6 eram 5, 7, 10 e 3: a
  Fase 4 levou a maior parte junto com o CSS de docs. O eixo de peso e o de entrelinha foram a
  zero ao criar os tokens que faltavam.
- **"token sem uso" eu medi só no core.** Removi `--shadow-sm` por isso — e ele era usado pelo
  `docs.css` e pelo markup. O gate de ficha pegou de imediato (`Tooltip.json` declarava um token
  que deixou de existir), e o correto apareceu: dos 63 sem uso no core, **14 são usados só pelo
  `docs.css`** e saem com aquela página. "Sem uso" precisa dizer *sem uso por quem*.

**O que ficou:** `$description` em 18 de 260 folhas (eram 3). Os novos nasceram descritos; os
semânticos antigos seguem sem. É digitação de dados, não decisão — mas não foi feita.

### §0.1 — M14 estava errado no diagnóstico e certo no efeito

O achado dizia: "58 dos 65 componentes não aceitam `ref`; falta `forwardRef`".
Medido na Fase 3, com o React 19.2.7 que o projeto usa:

- **Em runtime o `ref` já chegava.** No React 19 `ref` é prop comum, então ele entra em
  `{...props}` e cai no elemento raiz de quem espalha. Testado: Card→DIV, Stack→DIV,
  Badge→SPAN, Kbd→KBD, Input→INPUT, Button→BUTTON.
- **Quem recusava era o TypeScript.** `HTMLAttributes<T>` não tem `ref`, então
  `<Card ref={r}/>` era erro de tipo — o consumidor precisaria de cast.
- **E o `peerDependencies` prometia `react: ">=18"`**, versão onde ref-como-prop não existe
  nem em runtime. Essa promessa era a parte de fato quebrada.

Correção: `&RefAttributes<T>` em 34 anotações (mudança só de tipo) e peer para `>=19`.
**Não** foram escritos 40 `forwardRef` — o React 19 os tornou desnecessários, e escrevê-los
seria trabalho grande contra um problema que já não existia. Quem já usava `forwardRef`
(Button, IconButton, ToolbarButton, Input, Select, Textarea) ficou como estava.

Lição de método: o achado nasceu de **contagem** (`grep -c forwardRef`) sem teste de
comportamento. Contar é rápido e mente quando a plataforma muda de regra sob os pés.

### §0.2 — A9 — ALTO — três componentes descartavam em silêncio as props que o tipo promete

- **Categoria:** contrato de API · **Estado:** VERIFICADO (teste de runtime) · **fechado na Fase 3**
- **Localização:** `packages/react/src/index.tsx` — `KPI`, `AppShell`, `Table`
- **Evidência:** os três declaravam `HTMLAttributes<HTMLDivElement>` /
  `HTMLAttributes<HTMLTableElement>` e destruturavam **apenas** as props nomeadas, sem
  `...props` e sem espalhar nada. O teste de `ref` os pegou: `ref.current` ficava `null`
  enquanto os outros 28 passavam.
- **Observado:** `id`, `data-*`, `aria-*`, `onClick`, `style`, `role` — tudo que um
  consumidor passasse era descartado **sem erro e sem aviso**. O tipo prometia a superfície
  inteira de atributos HTML; a implementação entregava nada.
- **Impacto:** pior que o `ref`: impede rotular, instrumentar e integrar o componente.
  Falha silenciosa é a pior espécie — nada quebra, só não funciona.
- **Causa raiz:** nenhum teste montava um componente com prop arbitrária. A auditoria não
  pegou porque auditou a API por **medição**, não linha a linha — limite que o
  `00-INDEX.md` §5 já declarava ("API React: média, sem leitura linha a linha").
- **Correção:** `...props` na destruturação e `{...props}` no elemento que o tipo nomeia.
- **Controle:** `tests/unit/ref.test.tsx` — 31 componentes, cada um montado com `ref`,
  exigindo que o `ref` chegue **e** caia no elemento que o tipo promete.

**Controles novos que impedem o retorno:** `tests/visual/geometry.spec.ts` (6 casos de
fixture sobre o core, 3 densidades × 2 temas + varredura de altura única nas 169 páginas)
e o check 13 do `validate.py`. Ambos foram testados **contra a regressão**: restaurando
`.tab{min-height:32px}` o fixture reprova com "tabs deveria medir --control-h-md (32px)
em compact"; tirando o `line-height:1` do `.badge`, a varredura reprova nas 169 páginas
com `.badge → 24, 26px`.

**Correção de números desta própria auditoria** (medições minhas que estavam erradas):

| Onde | Dizia | É |
|---|---|---|
| M2, §6 do mapa | 72 de 271 tokens sem uso (26,6%) | **73 de 185** nomes distintos (39,5%) — 271 são declarações, não nomes |
| A6, mapa, protocolo, manifesto | 381 classes no core | **376** — cinco só apareciam dentro de comentários |

---

## 1. Críticos

### I1 — CRÍTICO — o estado do projeto é declarado em três documentos e os três estão errados

- **Categoria:** governança / confiabilidade da documentação
- **Estado:** VERIFICADO
- **Localização:** `README.md:138`; `AUREA.md:98,99,105,113,118,129,133,211`; `ROADMAP.md:118,142`
- **Evidência (declarado → medido):**

| Declaração | Onde | Real |
|---|---|---|
| "147 pages across five areas" | `README.md:138` | **169** páginas HTML |
| "46 patterns" | `README.md:138` | **68** páginas `pattern-*` |
| "~40 componentes" | `AUREA.md:98`, `:211` | **65** |
| "53 testes (interação + axe)" | `AUREA.md:99` | **81** testes, **1** asserção axe |
| "os 59 componentes têm ficha" | `AUREA.md:105`, `ROADMAP.md:118` | **65** fichas |
| "63 páginas + índice" | `AUREA.md:113`, `ROADMAP.md:142` | **169** páginas |
| "147 páginas" | `AUREA.md:118`, `:133` | **169** |
| "o padrão do exemplar cobre 2 de 65" | `AUREA.md:129` | **21 de 65** têm conteúdo rico |
| "o catálogo não tem gate visual — nenhuma das 147 páginas" | `AUREA.md:133` | existe `tests/visual/catalog.spec.ts` desde `11cc6e1`, com 16 baselines |

- **Observado:** nove afirmações numéricas divergem do repositório, em ambos os
  sentidos — subestimam o feito (2 de 65 quando são 21) e superestimam (gate visual
  declarado inexistente quando existe).
- **Esperado:** um único lugar declara o estado, e ele é gerado a partir do código
  ou verificado por gate.
- **Impacto:** um agente ou pessoa que leia a documentação começa com o mapa errado.
  Isso não é hipótese: esta auditoria começou assim. `BUILD_REPORT.json` existe e
  declara `reactExports: 48` — mais um número errado, num arquivo que ninguém atualiza.
- **Extensão:** 4 documentos, 11 linhas, mais `BUILD_REPORT.json`.
- **Causa imediata:** os números foram escritos à mão em cada fase e não revisitados.
- **Causa raiz:** não existe fonte única para o estado, e nenhum gate compara doc com
  realidade. `validate.py` prova consistência interna do código, nunca da prosa.
- **Dependências:** nenhuma. É o achado mais barato de corrigir e o que mais bloqueia
  os outros, porque toda decisão seguinte parte deste mapa.
- **Recomendação:** um `STATE.md` (ou seção única do `AUREA.md`) **gerado** por script
  a partir de contagens reais, e um check 13 no `validate.py` que falhe quando o
  arquivo gerado difere do recalculado — exatamente o padrão `dist == build` já usado
  nos checks 6, 7 e 8.
- **Critério de correção:** `python scripts/validate.py` falha se qualquer número de
  estado publicado divergir da contagem medida.
- **Testes:** check novo no `validate.py`.
- **Doc afetada:** `README.md`, `AUREA.md`, `ROADMAP.md`, `BUILD_REPORT.json`.

### I2 — CRÍTICO — o "padrão único" não é o que o gerador implementa

- **Categoria:** arquitetura / fonte única de verdade
- **Estado:** VERIFICADO
- **Localização:** `AUREA.md:53-58` (regra §2.0) e `:166-168` (modelo declarado);
  `scripts/build-catalog.mjs:152` (`componentPage`), `:251` (`patternPage`),
  `:287` (`blockPage`), `:409` (`recipePage`)
- **Evidência:** medição das seções (`id=`) das 169 páginas geradas, normalizando os
  identificadores de demo:

| Tipo | Páginas | Seções emitidas |
|---|---|---|
| Componente | 65 | `installation`, `reference` |
| Pattern | 68 | `installation`, `uses` |
| Block | 8 | `installation`, `uses` |
| Recipe | 23 | `composition`, `capabilities`, `invariants`, `states` — **nenhum preview, nenhum código** |
| Área | 5 | só grupos de navegação |

  Painéis de preview por tipo: componente 1–22; pattern 1; block 1; **recipe 0**.
  44 das 65 páginas de componente têm exatamente 1 exemplo (o fallback do registry);
  Button tem 22, o segundo colocado tem 12.
- **Observado:** quatro modelos de página distintos. O modelo declarado em `AUREA.md:166`
  — "Overview/Usage/Preview/Code/States/A11y/Tokens/Platforms/Related" — não existe em
  nenhum deles: componentes têm duas seções, `Installation` e `Reference`.
  As 23 receitas não têm exemplo algum: são texto renderizado de Markdown.
- **Esperado:** ou um modelo para todos os tipos, ou núcleo comum + extras por tipo com
  a diferença **documentada e justificada** — que é a decisão D3, declarada aberta em
  `AUREA.md:196` e nunca fechada. O que existe hoje é a ausência de decisão virando
  quatro implementações.
- **Impacto:** a promessa central do projeto ("nenhum componente é caso especial",
  `AUREA.md:56`) é falsa na superfície que a demonstra. Um consumidor não consegue
  copiar nada de uma receita. 44 componentes "Stable" mostram um exemplo genérico.
- **Extensão:** 169 páginas, 4 geradores de página, 1 decisão aberta.
- **Causa imediata:** cada tipo de página ganhou sua função no gerador, em fases
  diferentes, sem um contrato compartilhado de seções.
- **Causa raiz:** o modelo de página nunca foi expresso como **dado** — nem no contrato,
  nem no registry, nem num schema. É código imperativo em quatro funções, então
  divergir é o caminho de menor resistência.
- **Dependências:** decidir D3 antes de mexer.
- **Recomendação:** declarar o modelo de página como dado (lista de seções, quais
  obrigatórias por tipo), fazer as quatro funções consumirem esse dado, e gatear.
- **Critério de correção:** teste que, para cada tipo, exige o conjunto de seções
  declarado — e falha se uma página do tipo divergir.
- **Testes:** extensão de `tests/visual/catalog.spec.ts` (já tem 4 contratos de
  modelo de página, hoje verificados só em `button.html`).
- **Doc afetada:** `AUREA.md` §4 (D3), `ROADMAP.md` Fase 3.

---

## 2. Altos

### A1 — ALTO — três famílias de controle estão fora do sistema de densidade

- **Categoria:** consistência visual / fundações
- **Estado:** VERIFICADO (medido no navegador)
- **Localização:** `packages/core/src/aurea.css:254` (`.segmented button{height:30px}`),
  `:323` (`.tab{min-height:32px}`), `:328` (`.pagination button{width:34px;height:34px}`)
- **Evidência:** altura computada em `apps/docs/`, três densidades:

| Seletor | compact | comfortable | spacious |
|---|---|---|---|
| `--control-h-md` (token) | 32px | 36px | 40px |
| `.input` | 32 | 36 | 40 |
| `.btn-lg` | 38 | 42 | 48 |
| `.tab` | **32** | **32** | **32** |
| `.segmented button` | **30** | **30** | **30** |
| `.pagination button` | **34** | **34** | **34** |

- **Observado:** em `spacious`, uma aba fica 8px mais baixa que o campo ao lado; um
  segmented control, 10px; um botão de paginação, 6px. Em `comfortable`, 4/6/2px.
- **Esperado:** todo controle da mesma classe de tamanho mede o mesmo, em qualquer
  densidade — é o que `.btn`, `.input`, `.select`, `.menu-item`, `.tree-node` e
  `.combobox-*` já fazem consumindo `var(--control-h-*)`.
- **Impacto:** é a causa sistêmica de "elementos semelhantes com alturas diferentes".
  Atinge toda superfície com aba, filtro segmentado ou paginação, em 2 das 3 densidades.
- **Extensão:** 3 regras no core → todas as superfícies do sistema, incluindo as abas
  Preview/Code das 169 páginas do catálogo (que usam `.segmented button`).
- **Causa imediata:** altura literal em px em vez do token de densidade.
- **Causa raiz:** a densidade foi implementada componente a componente, sem um
  invariante que obrigue todo controle a derivar sua altura do token. Nenhum gate mede
  geometria entre densidades — `matrix.spec.ts` fotografa as 3 densidades, mas compara
  pixel contra baseline `-win32`, e o gate de pixel está inativo no CI.
- **Dependências:** nenhuma.
- **Recomendação:** trocar as três alturas por `var(--control-h-sm|md)`; conferir se
  `.tabs`/`.segmented` (que têm `padding:3px` e `gap:3px`) precisam de ajuste para o
  conjunto continuar medindo o mesmo que um campo.
- **Critério de correção:** para cada densidade, `.tab`, `.segmented button`,
  `.pagination button`, `.btn`, `.input` medem a altura do token correspondente.
- **Testes:** spec Playwright de estilo computado (padrão do `rtl.spec`/`status.spec`,
  independente de plataforma, portanto gate duro): 3 densidades × N seletores.
- **Doc afetada:** `01-MAPA-FACTUAL.md` §6 (o que a densidade alcança).

### A2 — ALTO — `.badge` mede duas alturas na mesma página, porque herda o line-height do pai

- **Categoria:** consistência visual / geometria de componente
- **Estado:** VERIFICADO (medido)
- **Localização:** `packages/core/src/aurea.css:272`
- **Evidência:** `apps/catalog/input.html`, tema escuro, 1440px:

| Elemento | `line-height` computado | altura |
|---|---|---|
| `.badge` dentro de `.brand` | 18px | **26px** |
| `.badge.nav-count` dentro de `.btn.btn-nav` | 12px | **22px** |

  Mesmo `font-size` (12px), mesmo `padding` (3px/3px), mesma borda (1px),
  mesmo `min-height` (22px). Ocorre em 13 das 20 páginas amostradas e nas três
  densidades. Visível no render: o badge ao lado do logotipo é mais alto que os
  badges de contagem da navegação, na mesma barra.
- **Observado:** a regra `.badge` define `min-height`, `padding`, `font-size`,
  `font-weight` e `white-space` — e **não** define `line-height`. A altura passa a
  depender de onde o badge está.
- **Esperado:** um componente tem geometria própria; o contexto não decide sua altura.
- **Impacto:** o mesmo componente é visualmente inconsistente em toda superfície que
  o use em dois contextos tipográficos — o que é o caso do próprio chrome do catálogo.
- **Extensão:** 1 regra no core; toda página que renderiza Badge em mais de um contexto.
- **Causa imediata:** `line-height` ausente na regra.
- **Causa raiz:** **este modo de falha já foi diagnosticado e corrigido neste projeto —
  só para `.chip`.** O comentário em `scripts/build-catalog.mjs:624-626` descreve
  exatamente o mesmo bug ("o `.chip` era inline-block com line-height 1.6 … 25,19px
  contra 25,59px na mesma fila") e a correção aplicada foi `font:var(--text-xs)/1` no
  `.chip`. Ninguém perguntou "quem mais tem esse problema?". É a correção local que
  preserva a falha estrutural.
- **Dependências:** nenhuma.
- **Recomendação:** definir `line-height` explícito em toda classe cuja altura seja
  derivada de conteúdo (`.badge`, `.chip`, `.kbd`, `.status`, `.tab`, `.step`,
  `.notification-count`) e varrer o core por classes com `min-height` sem `line-height`.
- **Critério de correção:** para cada uma dessas classes, a altura computada é única
  em toda página do catálogo, em ambos os temas e nas três densidades.
- **Testes:** o teste que faltou existe em espírito no `catalog.spec.ts`; falta a
  asserção: para um conjunto de classes, `new Set(alturas).size === 1` por página.
- **Doc afetada:** regra de fundação "componente tem geometria própria" — inexistente.

### A3 — ALTO — a altura do `.chip` depende do comprimento do rótulo

- **Categoria:** consistência visual / robustez de conteúdo
- **Estado:** VERIFICADO (medido)
- **Localização:** `scripts/build-catalog.mjs:627` (chrome do catálogo)
- **Evidência:** `apps/catalog/input.html`: 28 chips medem 24px; **1 mede 26px** — o de
  rótulo `value / defaultValue`. `font-size` 12px, `line-height` 12px, `min-height` 24px,
  `padding` 0 nos dois casos. O rótulo mais longo embrulha em duas linhas.
  Mesmo efeito em `select.html`.
- **Observado:** a regra tem `display:inline-flex`, `align-items:center`,
  `min-height:var(--space-6)` e `font:var(--text-xs)/1` — e **não** tem
  `white-space:nowrap` (que o `.badge` tem).
- **Esperado:** a fila de chips mede o mesmo independentemente do texto.
- **Impacto:** é o resíduo do achado **A4 da auditoria de 26/07**. A correção anterior
  acertou o `line-height` e adicionou `min-height`, o que **mascarou** o sintoma medido
  na época (25,19 vs 25,59) e deixou passar a outra metade da causa: conteúdo que
  embrulha. A auditoria anterior deu o achado como fechado.
- **Extensão:** toda página de componente com ficha de props longa.
- **Causa imediata:** ausência de `white-space:nowrap` / `flex:none`.
- **Causa raiz:** mesma de A2 — a correção foi na instância medida, não na regra geral
  "geometria de componente não depende de conteúdo".
- **Dependências:** corrigir junto com A2.
- **Recomendação:** `white-space:nowrap` no `.chip` (ou `overflow-wrap` com altura fixa
  e truncamento explícito, se rótulo longo for esperado — decisão a registrar).
- **Critério de correção:** altura única para todo chip, com rótulo de 1 e de 60 caracteres.
- **Testes:** o mesmo teste de A2, mais um caso de conteúdo longo injetado.
- **Doc afetada:** nenhuma existente.

### A4 — ALTO — `Icon` fixa um caminho absoluto de sprite e 16 componentes repassam a URL à mão

- **Categoria:** arquitetura de API / funcionamento no consumidor
- **Estado:** VERIFICADO
- **Localização:** `packages/react/src/index.tsx:63` —
  `spriteUrl="/aurea-icons.svg"`; `AureaProvider` em `:40`
- **Evidência:** `spriteUrl` aparece 52 vezes no arquivo: 16 declarações
  `spriteUrl?:string` em tipos de props, 40 repasses `spriteUrl={spriteUrl}`,
  1 default literal. O `AureaProvider` aceita apenas `{children, strings, direction}` —
  não provê sprite. Único contexto React do pacote: `StringsContext` (`:35`).
- **Observado:** o default do ícone é `/aurea-icons.svg`, caminho absoluto da **raiz do
  domínio**. Qualquer aplicação servida em subcaminho, ou com o asset em outra pasta,
  perde todos os ícones — e para consertar tem de passar `spriteUrl` em cada componente
  que renderiza ícone.
- **Esperado:** a URL do sprite é configuração de aplicação. Configuração de aplicação
  entra pelo provider, uma vez.
- **Impacto:** dobra a superfície de API de 16 componentes e transfere para o consumidor
  um trabalho repetitivo que o provider resolveria. Esta é a **causa raiz** do achado
  **A3 da auditoria de 26/07** (404 em `/aurea-icons.svg` em duas páginas). A correção
  aplicada então — passar `spriteUrl` nos fallbacks do catálogo — tratou o sintoma na
  superfície interna e deixou o defeito na API pública.
- **Extensão:** 16 componentes, 52 pontos de código, todo consumidor externo.
- **Causa imediata:** default literal no `Icon` e ausência de contexto.
- **Causa raiz:** o `AureaProvider` foi criado para i18n e nunca promovido a lugar de
  configuração do sistema; cada necessidade nova virou prop.
- **Dependências:** nenhuma. É também a correção que mais **deleta** código (40 repasses).
- **Recomendação:** `SpriteContext` no `AureaProvider` (`spriteUrl` opcional, default
  atual como fallback), `Icon` lê do contexto, prop mantida como override local.
  Remover os 40 repasses.
- **Critério de correção:** um app montado em `/sub/path/` com
  `<AureaProvider spriteUrl="/sub/path/icons.svg">` renderiza ícones em todos os
  componentes sem passar prop nenhuma.
- **Testes:** teste unitário que monta fora da raiz e checa o `href` do `<use>`.
- **Doc afetada:** `README.md` (seção "Consume in React" não menciona sprite).

### A5 — ALTO — o pacote React é um arquivo único com um único entry point e oito dependências de runtime

- **Categoria:** arquitetura / empacotamento / cadeia de suprimentos
- **Estado:** VERIFICADO
- **Localização:** `packages/react/src/index.tsx` (899 linhas, 87 KB, 65 exports);
  `packages/react/package.json:11-18` (exports), `:31-40` (dependencies)
- **Evidência:** `exports` declara só `"."`. `dependencies`: `@base-ui/react`,
  `@codemirror/language`, `@codemirror/state`, `@codemirror/view`, `@lezer/highlight`,
  `codemirror`, `@tanstack/react-table`, `qr`. Destas, cinco servem **um** componente
  cada: CodeMirror ×5 → `CodeEditor`; `@tanstack/react-table` → `DataGrid`; `qr` → `QRCode`.
  `forwardRef` aparece 7 vezes para 65 componentes.
- **Observado:** quem instala `@aurea-uds/react` para usar um `Button` instala CodeMirror
  e uma biblioteca de tabela. Sem subpath exports, não há como consumir uma fatia.
  58 dos 65 componentes não aceitam `ref`.
- **Esperado:** dependências pesadas de componente único ficam atrás de subpath
  (`@aurea-uds/react/code-editor`) ou de peer dependency opcional.
- **Impacto:** peso de instalação, superfície de dependência (auditoria de segurança do
  consumidor herda 8 árvores), e impossibilidade de adotar o sistema por partes.
  `forwardRef` ausente impede composição com bibliotecas que precisam de ref
  (foco programático, tooltips de terceiros, virtualização).
- **Extensão:** todo o pacote publicado.
- **Causa imediata:** um arquivo, um entry point.
- **Causa raiz:** o pacote cresceu por acréscimo sem revisão de fronteira; o follow-up
  **A5 da auditoria de 18/07** ("split de subpath") foi registrado e nunca executado
  (`AUREA.md:102`).
- **Dependências:** o split de arquivo deve vir antes do split de exports.
- **Recomendação:** dividir `index.tsx` por categoria do registry (a taxonomia já existe
  e é gateada), publicar subpaths, mover CodeMirror/react-table/qr para
  `peerDependencies` opcionais dos três componentes, e adicionar `forwardRef` onde o
  componente renderiza um elemento DOM único.
- **Critério de correção:** `pnpm why codemirror` num app que só usa Button não resolve
  CodeMirror; smoke de CI importa por subpath.
- **Testes:** smoke ESM já existe (`ci.yml:57`); estender para subpaths.
- **Doc afetada:** `README.md`, `AUREA.md:102`.

### A6 — ALTO — um quarto do CSS que o consumidor baixa é chrome de documentação e mockup de produto

- **Categoria:** arquitetura / fronteira sistema ⟷ produto
- **Estado:** VERIFICADO (medido por regra e por byte)
- **Localização:** `packages/core/src/aurea.css` — 376 classes
- **Evidência:** classificação de cada regra pelo consumidor que pode produzi-la
  (considerando os templates de classe do React: `` `btn-${…}` ``, `` `badge-${…}` `` etc.):

| Alcance | Bytes | % |
|---|---|---|
| Produzível por componente React | 52.587 | 60,3 % |
| Só docs manual / mockup de produto | 22.091 | **25,3 %** |
| Só chrome do catálogo | 3.375 | 3,9 % |
| Sem classe (reset, `:root`, `@media`) | 9.162 | 10,5 % |

  Exemplos de classes no core sem nenhum componente React correspondente:
  `.doc-nav`, `.doc-sidebar`, `.doc-topbar`, `.doc-main`, `.doc-section`, `.doc-actions`,
  `.demo`, `.demo-grid`, `.demo-title`, `.hero`, `.hero-meta`, `.eyebrow`, `.icon-grid`,
  `.icon-tile`, `.icon-search`, `.icon-category`, `.pattern-gallery`, `.device-grid`,
  `.universal-grid`, `.tooltip-demo`, `.section-head`, `.span-3`…`.span-12`, `.w3`
  (chrome de documentação); `.agent-card`, `.agent-head`, `.agent-stats`, `.approval`,
  `.invocation`, `.memory-entry`, `.cost-meter`, `.flow-panel`, `.flow-total`, `.trace`,
  `.trace-step`, `.permission-row`, `.queue-list`, `.schedule-grid`, `.health-matrix`,
  `.operational-grid`, `.builder-canvas`, `.builder-node`, `.builder-edge`, `.map-panel`,
  `.map-route`, `.map-marker`, `.chart`, `.chart-area`, `.donut`, `.usage-bars`,
  `.event-stream`, `.automation-card`, `.agenda-list` (mockup de aplicação).
- **Observado:** o pacote `@aurea-uds/core` — descrito no `README.md:30` como "generated
  CSS (tokens + components)" — entrega ao consumidor a folha de estilo da própria página
  de documentação e um conjunto de telas de produto herdadas do kit original.
- **Esperado:** o pacote do sistema contém o sistema. Chrome de docs vive no app de docs;
  mockup de produto vive no exemplo.
- **Impacto:** 25 KB de peso injustificado por consumidor; superfície pública não
  documentada e não contratada (nenhuma dessas classes está no registry ou no contrato);
  regra de produto misturada com regra de sistema, que é o que impede saber o que é a
  Aurea e o que era o app de onde ela nasceu.
- **Extensão:** ~230 classes, 25,5 KB de 87 KB.
- **Causa imediata:** o core nasceu como extração de um HTML monolítico e a fronteira
  nunca foi traçada.
- **Causa raiz:** não existe regra — nem gate — que diga o que pode entrar no core.
  O critério "o core contém apenas classes produzíveis pela biblioteca" é mecanicamente
  verificável e não é verificado.
- **Dependências:** `apps/docs/index.html` depende dessas classes. Só sai quando os
  docs manuais forem aposentados — que é a Fase 3 do Catálogo, já em andamento.
- **Recomendação:** três destinos — (a) classe de chrome de docs vai para o app de docs;
  (b) mockup de produto vira exemplo em `examples/`; (c) o que for genuinamente sistema
  ganha componente React, ficha e nome de sistema. Depois, gate.
- **Critério de correção:** o gate falha se `packages/core/src/aurea.css` declarar classe
  não produzível pelo pacote React (com allowlist explícita para reset/utilitário).
- **Testes:** check novo no `validate.py`, reaproveitando a análise desta auditoria.
- **Doc afetada:** `README.md:30`, `AUREA.md:38` ("Identidade = tokens + pele própria").

### A7 — ALTO — os quatro overlays cujo valor é gerenciamento de foco não têm nenhum teste

- **Categoria:** testes / acessibilidade
- **Estado:** VERIFICADO
- **Localização:** `tests/unit/components.test.tsx` (928 linhas, 81 testes)
- **Evidência:** 29 dos 65 componentes aparecem no arquivo. **Dialog, Drawer, Popover e
  Tooltip não aparecem em nenhuma linha.** O arquivo tem **1** asserção axe
  (`toHaveNoViolations`) em 81 testes. O `catalog-sweep` roda axe nas 169 páginas ×
  2 temas, mas sempre no **estado inicial**: nenhuma página estática abre overlay.
- **Observado:** o `README.md:81-83` vende exatamente esses componentes por
  "focus trap, Escape, focus restoration, scroll lock" via Base UI. Nada disso é
  verificado por teste algum.
- **Esperado:** o comportamento que o README promete é o que mais precisa de teste,
  porque é invisível em screenshot e quebra em silêncio numa atualização do Base UI.
- **Impacto:** uma atualização de `@base-ui/react` pode remover o focus trap sem falhar
  nenhum gate. Para usuário de teclado e leitor de tela, isso é falha de acessibilidade
  fundamental, não regressão cosmética.
- **Extensão:** 4 componentes de overlay + 32 outros componentes sem teste
  (lista completa em `01-MAPA-FACTUAL.md` §5).
- **Causa imediata:** cobertura por acréscimo — testou-se o que se construiu na fase,
  e os overlays vieram na Fase 2.
- **Causa raiz:** não existe critério de "componente concluído" que exija teste.
  `validate.py` check 11 exige ficha; nada exige teste. Maturidade "Stable" é declarada
  à mão (ver M7).
- **Dependências:** nenhuma.
- **Recomendação:** para cada overlay, teste de: foco entra ao abrir, `Tab` circula
  dentro, `Escape` fecha, foco volta ao disparador, `aria-modal`/`role` corretos, e axe
  com o overlay **aberto**. Depois, gate que exija teste por componente.
- **Critério de correção:** todo componente com `a11y.role` de overlay tem os 6 casos.
- **Testes:** vitest + `@testing-library/user-event` (já instalados); jest-axe já instalado.
- **Doc afetada:** `AUREA.md:73` ("Gate axe no CI" — verdadeiro só para páginas estáticas).

### A8 — ALTO — o catálogo não tem navegação móvel, e o padrão já existe no core sem uso

- **Categoria:** responsividade / adaptação
- **Estado:** VERIFICADO (render inspecionado + contagem)
- **Localização:** `scripts/build-catalog.mjs` (nenhuma ocorrência);
  `packages/core/src/aurea.css` (classes definidas); `apps/docs/index.html` (10 usos)
- **Evidência:** em 375×800, `apps/catalog/button.html` empilha a lateral **acima** do
  conteúdo: a barra de navegação superior embrulha em duas linhas e em seguida vem a
  lista completa de 65 componentes, item a item, antes de qualquer conteúdo da página.
  As classes `.mobile-nav-toggle`, `.mobile-nav-backdrop`, `.mobile-nav-close`,
  `.mobile-open`, `.mobile-search` existem no core; `grep` no gerador: **0**;
  em `apps/docs/index.html`: **10**.
- **Observado:** o gate de rolagem lateral passa (nada estoura em 320/375px) — e a
  experiência ainda é inutilizável: para ler a documentação de um componente no celular,
  é preciso rolar por 65 itens de navegação.
- **Esperado:** navegação recolhida atrás de um disparador em tela estreita, com o
  conteúdo primeiro. É o que a página de docs manual faz.
- **Impacto:** "Universal não é slogan" (`AUREA.md:40`) — a superfície que prova o
  sistema não é usável na plataforma mais comum. E a regressão é invisível para os
  gates atuais, que medem overflow, não usabilidade.
- **Extensão:** 169 páginas.
- **Causa imediata:** o shell gerado usa empilhamento em vez de recolhimento.
- **Causa raiz:** o padrão de navegação móvel foi implementado **no CSS do core para a
  página de docs manual** (ver A6) em vez de virar componente da biblioteca com ficha.
  Como não é componente, o gerador dogfooded não tem o que consumir.
- **Dependências:** A6 (a fronteira do core) e I2 (o shell é parte do modelo de página).
- **Recomendação:** promover o padrão a componente do sistema (`AppShell` com
  `navigation="collapsible"`, ou `Sidebar` com estado de abertura), com ficha, e
  consumi-lo no gerador.
- **Critério de correção:** em 375px, o primeiro conteúdo da página fica visível sem
  rolar por navegação; a navegação é alcançável por teclado e anuncia estado.
- **Testes:** spec Playwright em 375px: a caixa do `h1` da página aparece acima de
  `viewport.height`; disparador tem `aria-expanded`; `Escape` fecha.
- **Doc afetada:** `DIRECTION.md` (o padrão não está mapeado), `AUREA.md` §3.

---

## 3. Médios

### M1 — MÉDIO — "identidade sempre via token" é falso para raio e tipografia

- **Estado:** VERIFICADO · **Local:** `packages/core/src/aurea.css`
- **Evidência:** 17 `border-radius` crus (linhas 101, 243, 249, 317, 319, 383, 389, 391,
  394, 400, 401, 402, 404, 407, 483, 484, 636 — valores 3, 5, 6, 7, 8, 9, 10, 11, 12,
  999px); 10 `font-size` crus (101, 102, 110, 130, 369, 484, 598×3, 602 — 10, 11, 12,
  18, 20px); 15 `font-weight` crus; 5 `line-height` crus. Enquanto isso
  `--radius-xs/sm/md/lg`, `--text-*` e `--leading-tight/relaxed` existem, e
  `--leading-tight` e `--leading-relaxed` **nunca são usados**.
- **Declarado:** `README.md:14` — "identity (yellow, radii, typography) always via token".
- **Impacto:** trocar a linguagem de raios ou a escala tipográfica exige varredura manual;
  o gate de identidade (check 3) só confere três valores canônicos.
- **Causa raiz:** a catraca de pixel cru (check 12) cobre **só espaçamento**. Nenhum
  outro eixo tem controle, então cada eixo recua no ritmo do descuido.
- **Recomendação:** estender a catraca a raio, tamanho de fonte, peso e line-height,
  com baseline versionada — o mecanismo já existe e já provou funcionar.
- **Critério:** contagem por eixo não sobe; `validate.py --write-raw-px-baseline` cobre
  os quatro eixos novos.

### M2 — MÉDIO — 73 dos 185 tokens (39,5%) nunca são usados pelo core

- **Estado:** VERIFICADO · **Local:** `packages/tokens/src/aurea.tokens.json`
- **Nota de método:** o emissor produz **271 declarações** de custom property, que são
  **185 nomes distintos** (o mesmo nome é redeclarado em `base`, `theme.dark`,
  `theme.light` e nas 3 densidades). O denominador correto é 185. Destes, 112 são
  referenciados pelo core e **73 não**. Uma versão anterior deste documento dizia
  "72 de 271 (26,6%)" — denominador errado, subestimando o problema.
  Os 122 `var()` distintos do core incluem 10 propriedades locais que não são token
  (`--btn-bg`, `--btn-fg`, `--btn-border`, `--qr-module`, `--qr-quiet`, `--media-played`,
  `--shell-top`, `--anchor-width`, `--available-height`, `--p`).
- **Evidência:** rampas inteiras sem consumo — `--aether-50…950` (11 tokens, **0** usos
  no core, **0** no React) e `--ember-50…950` (11 tokens, **0** e **0**);
  `--oracle-*` (13 tokens, 7 usos). Mais: `--radius`, `--radius-xs`, `--radius-xl`,
  `--shadow-xs`, `--border-width`, `--duration-slow`, `--leading-tight`,
  `--leading-relaxed`, `--text-xl/2xl/4xl/5xl`, `--text-muted`, `--z-base`,
  `--z-dropdown`, `--input`, `--ring`, `--sidebar-ring`, `--primary-active`,
  `--foreground-strong`, `--chart-3/4/5`, `--space-0/7/10/12/16/24`,
  `--danger-800`, `--info-500`, `--info-800`, `--success-700`, `--warning-800`,
  `--media-control-bg`, `--media-control-hover`, `--breakpoint-*` (5, esperado: `@media`
  não lê `var()`).
- **Impacto:** 26% da fundação é decorativa. Um consumidor que use `--aether-500`
  depende de algo que ninguém exercita e que nenhum teste protege.
- **Causa raiz:** tokens herdados do kit original entraram por transcrição, não por
  necessidade. Não há regra de "token nasce por uso".
- **Recomendação:** decidir explicitamente por token: promover a uso, marcar como
  paleta pública documentada, ou remover. Registrar a decisão.
- **Critério:** todo token emitido é usado pelo core **ou** está numa allowlist com
  justificativa; gate confere.

### M3 — MÉDIO — tokens duplicados: dois nomes para o mesmo valor

- **Estado:** VERIFICADO · **Local:** `packages/tokens/dist/aurea.tokens.css`
- **Evidência:** `--radius-xl:22px` == `--radius-card:22px`;
  `--radius-control:999px` == `--radius-full:999px`.
- **Impacto:** duas verdades para a mesma coisa; mudar uma e esquecer a outra é a
  próxima inconsistência. `--radius-card` e `--radius-control` são os nomes da
  identidade (`CLAUDE.md`), gateados; `--radius-xl` e `--radius-full` não são.
- **Recomendação:** alias explícito (`--radius-xl: {radius.card}` via referência DTCG)
  ou remoção dos nomes não-canônicos.
- **Critério:** nenhum par de tokens do mesmo `$type` compartilha valor sem ser
  referência declarada.

### M4 — MÉDIO — semântica e unidade misturadas no mesmo eixo de token

- **Estado:** VERIFICADO
- **Evidência:** `--text-muted: var(--muted-foreground)` — uma **cor** dentro do
  namespace da escala de tamanho de texto (`--text-xs`…`--text-5xl`, todos rem).
  `--radius: 0.625rem` em rem enquanto `--radius-xs/sm/md/lg/xl/card: 6/8/10/16/22/22px`
  em px.
- **Impacto:** quem lê `--text-*` espera tamanho; quem calcula com `--radius-*` não pode
  assumir unidade. Ambos quebram autocompletar e ferramenta de token.
- **Causa raiz:** nomenclatura sem regra escrita; `DIRECTION.md` normatiza nomes de
  componente, não de token.
- **Recomendação:** renomear `--text-muted` para o namespace de cor; unificar a unidade
  de raio. Registrar a convenção de nomenclatura de token.

### M5 — MÉDIO — quatro fundações ausentes

- **Estado:** VERIFICADO
- **Evidência:** não existe token de **peso de fonte** (15 valores crus no core),
  **tamanho de ícone** (`.icon-sm/.icon-lg/.icon-xl` com px cru),
  **letter-spacing**, **área mínima de interação** (resolvida em CSS por
  `@media (pointer:coarse){min-height:44px}` — `aurea.css:688`).
- **Impacto:** quatro eixos visuais fora do sistema de tokens; o emit para plataforma
  nativa (decisão do Balde A) não terá o que emitir.
- **Recomendação:** criar os quatro eixos antes de qualquer trabalho de plataforma nativa.

### M6 — MÉDIO — `component-inventory.json` (86 KB) não tem consumidor

- **Estado:** VERIFICADO · **Local:** `packages/contracts/component-inventory.json`
- **Evidência:** `grep` no repositório: citado apenas em
  `packages/contracts/package.json` (lista de arquivos) e em `scripts/validate.py:116`
  (que só confere se é JSON válido). Nenhum script, teste ou app o lê.
- **Impacto:** terceira "fonte de verdade" ao lado do contrato e do registry, com 86 KB
  que podem divergir de ambos sem que nada acuse. É publicado no pacote.
- **Causa raiz:** artefato de fase anterior mantido por inércia.
- **Recomendação:** decidir: gerar a partir do registry (e gatear `dist == build`),
  ou remover do pacote. Não deixar como está.

### M7 — MÉDIO — maturidade e matriz de plataforma são campos decorativos

- **Estado:** VERIFICADO · **Local:** `packages/contracts/registry/*.json`
- **Evidência:** 59 de 65 fichas declaram `maturity: "Stable"` — inclusive os 44 sem
  exemplo próprio no catálogo e os 36 sem menção em teste. `platforms`: `web=stable` em
  61, `web=supported` em 4, `native=planned` em 64, `native=n-a` em 1.
- **Impacto:** os dois eixos que existiriam para dizer "isto ainda não está pronto" não
  dizem nada. `AUREA.md:76` justifica a maturidade como "para experimental não parecer
  oficial" — o efeito atual é o inverso: o incompleto parece oficial.
- **Causa raiz:** maturidade é escrita à mão e não derivada de evidência.
- **Recomendação:** definir maturidade por critério verificável (tem props publicadas +
  tem exemplo por feature + tem teste + tem a11y documentada = Stable) e **derivar** o
  campo, ou gatear a coerência.
- **Critério:** o gate falha se uma ficha `Stable` não cumprir os critérios.

### M8 — MÉDIO — o contrato de API publicado cobre um terço da biblioteca

- **Estado:** VERIFICADO
- **Evidência:** `props` em 21/65 fichas; `variants` em 10/65; `sizes` em 7/65;
  `states` em 32/65; `a11y` tem só `role` (65), `keyboard` (65) e `apg` (26).
  Fichas mais vazias (bytes de JSON): CodeEditor 459, Grid 466, Stack 479,
  AureaProvider 491, EmptyState 492, DataList 493, Cluster 496, Skeleton 503.
- **Impacto:** 44 componentes públicos sem contrato de API. `validate.py` garante que
  **quando** há `props` elas têm tipo e descrição — nunca que devam existir.
- **Recomendação:** extrair props da assinatura TypeScript e comparar com a ficha
  (o inverso do que existe hoje), com allowlist de props herdadas de HTML.
- **Critério:** toda ficha de componente `Stable` declara props, e a lista bate com o
  tipo exportado.

### M9 — MÉDIO — variante pública que o contrato não declara, e variante em CSS que a API não tem

- **Estado:** VERIFICADO
- **Evidência:** `BadgeVariant` (`packages/react/src/index.tsx:101`) inclui `"oracle"`;
  `packages/contracts/registry/Badge.json` lista 10 variantes e **omite** `oracle`.
  Inverso: `.btn-oracle` existe em `packages/core/src/aurea.css` e **não** existe em
  `ButtonVariant` — só é alcançável escrevendo a classe à mão.
- **Impacto:** o contrato mente nas duas direções. O gate de registry compara nome de
  ficha com export React, nunca o conteúdo da API.
- **Nota de nomenclatura:** `oracle`, `running`, `paused`, `review` são semânticas de
  produto (papel de agente, estado de job) num sistema universal. Não violam a regra de
  nomes privados de `CLAUDE.md`, mas são vocabulário herdado do app de origem — mesma
  família de A6.
- **Recomendação:** decidir se `oracle` é variante do sistema (então documentar, nomear
  em termos de sistema e expor em Button também) ou não é (então remover das duas pontas).
- **Critério:** união TypeScript de variante == `variants` da ficha == variantes do CSS.

### M10 — MÉDIO — o indicador de foco não é uniforme

- **Estado:** VERIFICADO · **Local:** `packages/core/src/aurea.css`
- **Evidência:** regra global (linha 11) `outline:2px solid var(--focus-strong);
  outline-offset:2px; border-color:…!important`. Divergem: `:245` (controles de marca,
  offset 2px), `:437` (`.media-seek`, **cor `--primary`**, offset 3px), `:540`
  (`.tree-item`, offset **-2px**), `:563` (`.notification-item`, offset -2px),
  `:577` (`.datagrid`, **sem outline**, `box-shadow` de 3px), `:698` (`.table-region`,
  idem). Total: 3 offsets, 2 cores, 2 técnicas.
- **Impacto:** o sinal de foco é a principal affordance para uso sem mouse. Variar a
  técnica entre famílias reduz a previsibilidade justamente para quem mais depende dela.
  Nenhum gate mede foco.
- **Nota:** o `!important` na regra global impede o consumidor de sobrepor a cor de
  borda no foco.
- **Recomendação:** um contrato de foco: uma cor, uma espessura, e apenas duas variações
  justificadas (offset externo para elemento livre, interno para item dentro de
  contêiner rolável). Documentar. Gatear por estilo computado.

### M11 — MÉDIO — dois esquemas de slug para patterns do mesmo componente

- **Estado:** VERIFICADO · **Local:** `apps/catalog/`
- **Evidência:** `pattern-button-group-segmented-range.html` e
  `pattern-button-group-with-counter.html` (esquema com hífen) convivem com
  `pattern-buttongroup-icons-share-actions.html`,
  `pattern-buttongroup-multiple-selection-pinned-filters.html`,
  `pattern-buttongroup-range-time-range.html`,
  `pattern-buttongroup-single-selection-view-switch.html` (esquema sem hífen).
- **Impacto:** URL é contrato. Dois esquemas para o mesmo componente quebram link
  previsível e sugerem dois componentes onde há um.
  `pattern-button-group-segmented-range` e `pattern-buttongroup-range-time-range`
  parecem cobrir o mesmo assunto — **INFERÊNCIA**, não confirmado por leitura do conteúdo.
- **Causa raiz:** o slug vem de dois lugares diferentes (nome do arquivo de content
  vs nome declarado do componente); `scripts/build-catalog.mjs:42` normaliza, mas a
  entrada já difere.
- **Recomendação:** derivar o slug **sempre** do `name` da ficha; gatear.

### M12 — MÉDIO — texto a 200% provoca rolagem lateral (WCAG 1.4.4)

- **Estado:** VERIFICADO (medido)
- **Evidência:** com `font-size` da raiz em 32px (200%), em 1280×900:
  `+27px` de rolagem lateral em 8 de 8 páginas amostradas (button, input, index, tokens,
  recipe-saas-admin, block-stats-row, status, alert). Zero elementos com conteúdo
  cortado — o texto cresce, o layout estoura.
- **Causa raiz:** sistema de unidades misto. Tipografia e espaçamento em `rem`
  (`--text-*`, `--space-*`) convivem com geometria em px: `--sidebar-width:264px`,
  `--control-h-*` em px, 93 `width`/`height` crus e 45 `min-height` crus no core.
  Quando a fonte dobra, o conteúdo em rem cresce e o contêiner em px não acompanha.
- **Impacto:** direto para usuário de baixa visão que aumenta a fonte do navegador em vez
  de usar zoom de página. O gate de 320–1536px passa porque testa **largura**, não
  **tamanho de texto**.
- **Recomendação:** converter as larguras de shell e alturas de controle para rem
  (ou `em`), ou declarar explicitamente que o suporte é por zoom de página e registrar
  a decisão. Adicionar a matriz de texto 200% ao `catalog-sweep`.
- **Critério:** com raiz em 32px, `scrollWidth <= clientWidth` nas 169 páginas.

### M13 — MÉDIO — a responsividade roda sobre duas escalas ao mesmo tempo

- **Estado:** VERIFICADO
- **Evidência:** 10 breakpoints distintos em `@media` no core: 400, 640, 767, 768, 820,
  1023, 1024, 1100, 1366 px (+ `max-height:800px`). Seis são o legado congelado
  declarado em `validate.py:172` — `{400, 800, 820, 821, 1100, 1366}` — e governam
  `.app-shell`, `.media-*`, `.builder-*`, `.schedule-*`, `.spatial-*`.
- **Impacto:** a escala Tailwind está travada por gate para o **novo**, mas o
  comportamento real em telas médias é decidido pelo legado. Prever o layout exige
  conhecer as duas escalas.
- **Nota:** o gate está correto — impede o legado de crescer. O achado é a dívida, não
  o gate.
- **Recomendação:** migrar os 6 legados junto com a aposentadoria de `apps/docs`
  (que é o que os congela), e reduzir a lista no gate a cada migração.

### M14 — MÉDIO — 58 dos 65 componentes não aceitam `ref`

- **Estado:** VERIFICADO · **Evidência:** `forwardRef` aparece 7 vezes em
  `packages/react/src/index.tsx` para 65 exports.
- **Impacto:** impede foco programático, integração com bibliotecas de posicionamento,
  virtualização e medição. Para um sistema que se vende como infraestrutura, `ref` é
  parte do contrato.
- **Recomendação:** `forwardRef` em todo componente que renderiza um elemento DOM único.
- **Critério:** teste que monta cada componente com `ref` e verifica `current`.

### M15 — MÉDIO — 3 de 271 tokens têm `$description`

- **Estado:** VERIFICADO · **Local:** `packages/tokens/src/aurea.tokens.json`
- **Impacto:** o DTCG existe justamente para carregar significado junto do valor.
  Sem descrição, ninguém sabe quando usar `--surface-2` em vez de `--surface-3`,
  e a escolha volta a ser gosto.
- **Recomendação:** `$description` obrigatória para todo token semântico (superfície,
  estado, foco, texto); gatear.

### M16 — MÉDIO — cascata sem camadas e 22 `!important`

- **Estado:** VERIFICADO · **Evidência:** `@layer` não aparece no core.
  22 `!important`: 11 no `.sr-only` (legítimo), 5 em `hide-below-*`/`only-below-*`
  (utilitário, legítimo), 4 em `prefers-reduced-motion` (legítimo), 1 em
  `:focus-visible{border-color:…!important}` (linha 11), 1 em
  `grid-template-columns:1fr!important` (linha 700), 1 em `overflow:visible!important`
  (linha 704).
- **Impacto:** sem `@layer`, o consumidor que escreve CSS próprio compete por
  especificidade com a biblioteca; os três `!important` não-utilitários não podem ser
  sobrepostos de forma nenhuma.
- **Recomendação:** envolver o core em `@layer aurea` (mudança de uma linha, com teste
  de regressão visual), e trocar os três `!important` estruturais por especificidade.

### M17 — MÉDIO — o alcance real da densidade não está documentado

- **Estado:** VERIFICADO · **Evidência:** 8 tokens de densidade, 21 usos no core.
  Densidade altera altura de controle, altura de linha de tabela, padding de card e
  gap de seção. **Não** altera tamanho de fonte, espaçamento geral, gaps de layout, raio.
- **Impacto:** `CLAUDE.md` e `AUREA.md:45` prometem "densidades compact/comfortable/
  spacious" sem dizer o que a densidade governa. Quem consome espera mais e recebe menos;
  quem implementa não sabe se um gap novo deveria variar.
- **Recomendação:** registrar o contrato de densidade — o que varia, o que não varia,
  e por quê. É decisão de design, não defeito; o defeito é ser tácita.

### M18 — MÉDIO — assimetria não registrada entre os temas

- **Estado:** VERIFICADO · **Evidência:** o tema claro sobrepõe 6 cores que o escuro
  deixa no `base`: `danger-400`, `info-400`, `success-400`, `warning-400`,
  `oracle-300`, `oracle-400`. Todas as 6 existem em `base`, portanto **não há bug de
  cor indefinida** — o escuro herda o valor base.
- **Impacto:** `CLAUDE.md` diz "temas dark/light equivalentes". Medido: 56 chaves no
  escuro, 62 no claro. A diferença é provavelmente deliberada (o claro precisa de tom
  diferente para essas semânticas) — **HIPÓTESE**, não registrada em lugar nenhum.
- **Recomendação:** registrar a assimetria como decisão, ou igualar declarando as 6 no
  escuro com o valor base. Gatear a paridade com allowlist de exceções justificadas.

### M19 — MÉDIO — não existe registro de decisões, de referências, de critérios, nem protocolo de sessão

- **Estado:** VERIFICADO (por ausência)
- **Evidência:** varredura dos 12 documentos de governança:

| Assunto exigido | Estado | Onde |
|---|---|---|
| Índice documental | PARCIAL | tabela "Papéis dos documentos" em `AUREA.md:232` |
| Contexto e objetivos | EXISTE | `AUREA.md` §1–2 |
| Arquitetura | PARCIAL | `AUREA.md` §2 é principiológico; não há diagrama de módulos e fronteiras |
| Mapa do código | **AUSENTE** | nada diz onde adicionar o quê |
| Fundações e regras visuais | PARCIAL | `CLAUDE.md` lista a identidade; o inventário de fundações não existia até esta auditoria |
| Inventário de componentes com estado | PARCIAL | registry tem os dados; nenhuma vista humana |
| Contrato de componente (anatomia, API, estados, a11y, aceite) | **AUSENTE** como doc; parcial como dado (21/65) |
| Registro de referências externas | **AUSENTE** | `AUREA.md:83` cita Kibo/Untitled sem registrar o que foi analisado nem a conclusão |
| Registro de decisões (ADR com id/data/alternativas/consequências) | **AUSENTE** | decisões vivem em prosa numerada em `AUREA.md:194-197` e `:145-197`, sem data, alternativa ou consequência |
| Estratégia de testes | PARCIAL | `ROADMAP.md:49-83` tem checklist de gates |
| Critérios de qualidade objetivos | **AUSENTE** | não há definição de "componente concluído" |
| Estado do projeto com próxima tarefa exata | **DIVERGENTE** | ver I1 |
| Manual/protocolo para agentes de IA | PARCIAL | `ROADMAP.md:18-48` tem "Guia de execução — para o Opus"; não cobre o que registrar no fim da sessão |
| Manifesto estruturado do projeto | **AUSENTE** | há manifesto por componente (registry), não do projeto |

- **Impacto:** continuidade entre sessões depende de reler 12 documentos, dois deles com
  61 KB e 670 KB. Decisão fechada não tem registro consultável, então volta a ser
  discutida — e decisão nova não tem lugar canônico para entrar.
- **Recomendação:** ver `03-PLANO.md` fase 6 e as propostas em `04-PROTOCOLO-IA.md`
  e `manifest.json`.

---

## 4. Baixos

### B1 — BAIXO — altura fixa do demo deixa preview pequeno flutuando no vazio
`scripts/build-catalog.mjs:591` — `.demo{height:clamp(14rem, calc(100dvh - 19rem), 32rem)}`.
Em 1440×1000, o preview de `pattern-qrcode-rounded-downloadable` ocupa ~500px para um
QR de 160px e um botão. **É decisão registrada do Victor** ("nada de rolar pra ver o
exemplo", comentário na linha 591) — não é defeito. O que falta é registrar o custo:
previews pequenos leem como layout quebrado. Alternativa a considerar:
`min-height` em vez de `height`.

### B2 — BAIXO — um alvo interativo de 67×13px
`BUTTON.btn.btn-link` medido em 67×13px. Abaixo de 24×24 (WCAG 2.2 SC 2.5.8), embora
provavelmente coberto pela exceção de alvo em linha. É o único alvo pequeno que não é
link de texto entre 37 medidos em 20 páginas (os outros 36 são `<a>` em prosa).
**Recomendação:** confirmar a exceção ou dar altura de alvo ao `.btn-link`.

### B3 — BAIXO — `.btn-sm` mede três alturas na mesma página
Em `apps/docs/`, densidade compact: `[20, 28, 34]`. O 20 é `.btn-link` (sem altura,
esperado); o 28 é o token `--control-h-sm`; **o 34 não tem explicação encontrada**.
**Estado:** VERIFICADO como medição, **DESCONHECIDO** como causa. Investigar junto de A1.

### B4 — BAIXO — uma string em português no conteúdo do produto
`apps/catalog/content/patterns/Button.mjs:4` — "Variante". Única ocorrência em 35
arquivos de content. O eixo inglês está, no resto, cumprido.

### B5 — BAIXO — o produto elogia a si mesmo no chrome
Badge "Dogfooded" na barra superior das 169 páginas
(`scripts/build-catalog.mjs`, shell). É afirmação de processo interno numa superfície de
consumidor. Sugestão: mover para a página de contexto do projeto.

### B6 — BAIXO — dois documentos históricos não se declaram históricos
`MIGRATION.md` e `FASE-6-BRIEF.md`. `AUREA.md:240` marca `FASE-6-BRIEF.md` como
"fechado (24/07)"; o próprio arquivo não diz. `MIGRATION.md` não é marcado em lugar
nenhum e descreve um processo já executado. Quem abrir o arquivo direto não sabe.

---

## 5. Falsos alarmes — hipóteses que a medição derrubou

Registrados porque a próxima auditoria não deve gastar tempo neles, e porque o método
exige separar o que foi medido do que foi suposto.

1. **Contraste.** Hipótese: o tema claro e os badges falham AA. **Derrubada.**
   Medição independente com conversão `oklch`→sRGB por canvas, 8 páginas × 2 temas:
   **0 nós de texto abaixo do mínimo AA**. O `axe` das 169 páginas × 2 temas também
   passa. *Nota de método: minha primeira medição acusou 1.914 violações — era bug meu,
   `getComputedStyle().color` devolve `oklab()` em Chromium e eu leria os componentes
   como RGB. Números de contraste sem conversão explícita não valem nada.*

2. **Alinhamento ícone↔texto.** Hipótese principal sugerida pelas imagens.
   **Derrubada.** Centro vertical do `svg` contra centro da caixa de texto irmã, em
   todos os elementos de 20 páginas: **0 desvios acima de 1px**.

3. **`apps/catalog/assets/catalog.css` é fonte paralela de verdade.** **Derrubada.**
   Os 405 KB são: fontes base64 (300.570 B) + `packages/core/dist/aurea.css`
   **verbatim** (96.071 B, verificado por comparação de string) + 8.140 B de chrome
   próprio. O catálogo não redefine componente.

4. **O catálogo não é dogfooded de verdade.** **Derrubada.** O gerador usa 33
   componentes Aurea distintos via `h(A.X)` (Badge 22×, TableOfContents 8×, CodeBlock 8×,
   Table, Icon, Button, Toolbar, AppShell, Breadcrumb, Card, Field, QRCode, Timeline…)
   e apenas 5 tags HTML cruas em 666 linhas.

5. **O amarelo da identidade não está cabeado.** **Derrubada.** `--brand-yellow` não é
   consumido diretamente pelo core, mas `--primary: var(--brand-yellow)` nos **dois**
   temas, em `packages/tokens/dist/aurea.tokens.css`. O gate de identidade é válido.

6. **Os 6 tokens exclusivos do tema claro causam cor indefinida no escuro.**
   **Derrubada.** Todos os 6 existem em `base`; o escuro herda. Ver M18 (fica como
   assimetria não registrada, não como bug).

7. **Os achados A1, A2, A3 e A5 da auditoria de 26/07 seguem abertos.** **Derrubados.**
   Executados hoje: 169 páginas × 7 larguras sem rolagem lateral; hierarquia de títulos
   correta em 169; console limpo e nenhum 4xx; axe sem violação em 169 × 2 temas;
   RTL 4/4; status 4/4. **13 de 13 gates passaram.** As correções são reais e agora
   estão gateadas. O que **não** está fechado é a causa raiz de dois deles — ver A3
   (resíduo do A4 anterior) e A4 (causa do A3 anterior).

8. **A imagem `Aurea UI.png` mostra defeitos do produto.** **Derrubada — e isto é o
   achado mais importante desta seção.** A imagem é um **mockup-alvo**, não o produto.
   O catálogo real não tem: busca (⌘K), seletor de densidade, botão de command palette,
   abas de plataforma (Web/Mobile/Desktop/Keyboard/Screen reader), matriz de plataforma,
   chips "Uses X"/"Used here" na posição mostrada, painel de estados, nem as seções
   Overview/Usage/States/Accessibility/Platforms/Tokens no índice lateral. A árvore de
   navegação do mockup é hierárquica (Foundations → Data Display → Table → Selectable →
   Pagination); a real é uma lista plana agrupada. O mockup também está em português
   ("Estados", "Sucesso", "Operação confirmada") e usa `@aurea-ui/react`, scope antigo.
   **Conclusão:** o desalinhamento aparente nas imagens não é defeito de implementação —
   é a distância entre alvo e implementado, que é exatamente o que I2 mede.

---

## 6. O que não foi verificado

Declarado para que a auditoria não pareça mais completa do que é.

| Área | Por quê |
|---|---|
| Leitor de tela real (NVDA/JAWS/VoiceOver) | BLOQUEADO — indisponível no ambiente. A a11y aqui é axe + medição de propriedade. Nome acessível, ordem de anúncio e experiência real de navegação **não** foram testados. |
| Navegadores além do Chromium | BLOQUEADO — só Chromium instalado. Firefox/Safari não verificados. |
| Referências externas (Kibo UI, Untitled UI) | Não acessadas nesta sessão. Nenhuma comparação é afirmada; o registro de referências fica AUSENTE por falta de análise. |
| Leitura linha a linha de `index.tsx` e `aurea.css` | Auditados por medição e consulta dirigida. Achados de **estilo** de código (nomes, comentários, complexidade de função, legibilidade) não foram levantados. |
| `ROADMAP.md` integral (61 KB) | Estrutura mapeada, seções de estado lidas; ~900 linhas de histórico não lidas. |
| `apps/docs/index.html` integral (670 KB) | Tratado como superfície legada a aposentar; medido, não lido. |
| Conteúdo das 23 receitas `patterns/*.md` | Validadas pelo gate (front matter + 4 seções na ordem); **profundidade e qualidade do texto não avaliadas**. |
| Desempenho | Não medido: nem tamanho de bundle real, nem tempo de render, nem custo do sprite de 1,26 MB. Área inteira **não auditada**. |
| Conteúdo traduzido / idioma longo | Não testado (o produto é monolíngue em inglês hoje). |
| `pnpm build` local | BLOQUEADO por decisão (a trava proíbe alterar artefatos). Provado no CI. |
| Gate de pixel | Inativo no CI por ausência de baseline `-linux.png`; não avaliado quanto ao que pegaria. |
