# PLANO 1.0 — a estrada da Aurea até a primeira versão estável

> **CANÔNICO desde 02/08/2026.** É o documento **vivo** do que falta. Os checkboxes daqui são o
> estado real do projeto — não há uma segunda lista em lugar nenhum.
>
> O [`ROADMAP.md`](historia/ROADMAP.md) vira **história**: as fases 0 a 5 estão feitas e ficam lá como
> registro. O que ainda não existe está aqui.
>
> Autorizado pelo Victor em 02/08/2026, sob a
> [ADR-0015](../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md).

---

## 1. Como este documento funciona

**Uma PARTE por autorização.** Nada começa sem `PODE IMPLEMENTAR <parte>`. Uma parte pode levar
mais de uma sessão; o que ela não pode é ser misturada com outra.

**O checkbox é o estado.** Ao fechar um item, marque `[x]` no mesmo commit que o entrega. Item
marcado sem gate verde é mentira que a próxima sessão vai herdar.

**Toda parte fecha do mesmo jeito:**

```bash
pnpm build && python scripts/validate.py && pnpm test && pnpm exec playwright test
```

Mais `node scripts/check-pack.mjs`, a conferência visual nos dois temas, e o registro no
[`04-PROTOCOLO-IA.md`](../audit/2026-07-26-integral/04-PROTOCOLO-IA.md) §3.

**Sessão nova lê, nesta ordem:** `CLAUDE.md` → `STATE.md` → **este arquivo** →
[`BUILDING.md`](BUILDING.md) → o código que a parte toca.

---

## 2. Estado, de relance

| Parte | O que é | Itens | Feitos | Estado |
|---|---|---:|---:|---|
| ~~**A**~~ | Fronteira servidor/cliente | 4 | 4 | **FECHADA em 06/08/2026** |
| ~~**B**~~ | Fechar os rascunhos | 6 | 6 | **FECHADA em 06/08/2026** |
| ~~**C**~~ | Defeitos de semântica abertos | 3 | 3 | **FECHADA em 07/08/2026** |
| ~~**D**~~ | Aposentar a página manual | 4 | 4 | **FECHADA em 08/08/2026** |
| ~~**E**~~ | Contrato de API completo (M8) | 15 | 15 | **FECHADA em 07/08/2026** |
| ~~**F**~~ | Grade de dados profissional | 11 | 11 | **FECHADA em 08/08/2026** |
| ~~**G**~~ | Transferência de arquivos | 6 | 6 | **FECHADA em 09/08/2026** |
| ~~**H**~~ | Camada operacional | 16 | 16 | **FECHADA em 09/08/2026** |
| ~~**I**~~ | Composições de aplicação | 8 | 8 | **FECHADA em 11/08/2026** |
| ~~**J**~~ | Estados universais | 3 | 3 | **FECHADA em 09/08/2026** |
| **K** | Prova de plataforma e 1.0 | 5 | 3 | aberta — **só o K4 é trabalho**; o K2 está ⏸ adiado sem data ([ADR-0021](../decisions/0021-o-publicador-confiavel-fica-adiado.md)) |
| ~~**L**~~ | Componentes que o consumidor exige | 6 | 6 | **FECHADA em 15/08/2026** |
| ~~**M**~~ | Lacunas de sistema | 7 | 7 | **FECHADA em 13/08/2026** |
| **N** | Editor de conteúdo | 1 | 0 | aberta — §18 |
| **O** | As fronteiras que sobraram | 2 | 0 | aberta — §19 |
| | **TOTAL** | **97** | **92** | |
| **C** | Defeitos de semântica abertos | 3 | 0 | aberta |
| **D** | Aposentar a página manual | 4 | 0 | aberta |
| **E** | Contrato de API completo (M8) | 12 | 0 | aberta |
| **F** | Grade de dados profissional | 11 | 0 | aberta |
| **G** | Transferência de arquivos | 6 | 0 | aberta |
| **H** | Camada operacional | 16 | 0 | aberta — **sem referência local** |
| **I** | Composições de aplicação | 8 | 0 | aberta |
| **J** | Estados universais | 3 | 0 | aberta |
| **K** | Prova de plataforma e 1.0 | 4 | 0 | aberta |
| **L** | Component Lab e Stress Lab | 10 | 0 | **aberta — AUTORIZADA em 28/08/2026** |
| | **TOTAL** | **87** | **10** | |

> Esta tabela é escrita à mão e **é a única exceção** à regra de contagem gerada — porque conta
> intenção, não código. A contagem do que EXISTE continua no [`STATE.md`](../STATE.md), gerado.
>
> **O total foi de 80 para 81 em 11/08/2026**, e não é ajuste de contagem: a Parte K ganhou um item.
> O **K5** (publicar a `0.2.0`) nasceu da medição do K3, que achou cinco quebras acumuladas e
> mostrou que a condição do K4 era **circular** —
> [ADR-0020](../decisions/0020-a-proxima-versao-e-0-2-0-nao-1-0.md). Dobrar o K5 dentro do K4 deixaria
> um publish inteiro sem checkbox, e aqui **o checkbox é o estado**.

**Ordem obrigatória:** **A** vem primeiro e sozinha. Depois disso, B–E podem correr em qualquer
ordem; F–J dependem de A; K é a última **das dez primeiras**.

> **L a O nasceram em 13/08/2026**, da medição dos consumidores reais (§15). Elas não atrasam o
> **K4**: pela [ADR-0022](../decisions/0022-consumidor-real-e-projeto-do-victor.md) o que destrava a
> `1.0` é um consumidor instalando do npm, não a fila estar vazia. **A ordem entre elas é
> M → L → N → O**, e o motivo é medido: a Parte M é a cola que TODA tela reescreve (87 KB só em
> três telas de filtro de um consumidor), enquanto a L é seis componentes que faltam em telas
> específicas. Consertar a cola primeiro muda o custo de tudo que vier depois. O **O2** pode
> correr a qualquer momento — é documento, não código.
ordem; F–J dependem de A; K é a última. **L pode começar a qualquer momento** — o Victor foi
explícito ao autorizá-la: a fundação dela ajuda a provar os componentes durante a própria
construção, e o `G-LAB-01` mostra que ela não é conveniência (três componentes públicos não são
vistos por ninguém hoje).

> **A Parte A fechou em 06/08/2026** — o bloqueio caiu. B a K estão liberadas, na ordem acima.
> **A Parte B fechou em 06/08/2026**, a **C em 07/08/2026** e a **E em 07/08/2026** — os 15 itens,
> com o **M8** fechado e as quatro travas do `BUILDING.md` valendo para os **76**.
> **A Parte D fechou em 08/08/2026**, e com ela o **M13** — o placar de `02-ACHADOS.md` §0 tem
> agora **41 de 41 fechados**. A auditoria integral de 26/07/2026 está encerrada.

---

## 3. As regras que valem aqui

**Nenhum nome de aplicação consumidora entra neste repositório.** É o `CLAUDE.md`, e vale para
este arquivo também. Onde for preciso justificar uma demanda, ela é descrita pelo que é —
"superfície administrativa", "console de operação", "produto móvel" — nunca por quem a pede.

**Cobertura, não demanda.** Até a `1.0`, a fila é o contrato, não o pedido
([ADR-0015](../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md)). O `BUILDING.md` §5 está
suspenso; **o resto do `BUILDING.md` não está.**

**As referências ficam em [`Referencia/`](../Referencia/), dentro do repositório**, fora do git. A
tabela canônica — com o caminho onde a anatomia mora de verdade — é a do
[`BUILDING.md`](BUILDING.md) §1. Estas sete são as de construção geral, verificadas MIT em
02/08/2026:

| Pasta | O que é | Serve a |
|---|---|---|
| `base-ui-master` | o motor que a Aurea já usa | comportamento, teclado, ARIA |
| `ui-main` | shadcn/ui | decomposição, envelope de terceiro, fronteira de cliente |
| `kibo-main` | Kibo UI | componente raro: dropzone, tree, table, gantt, kanban, editor |
| `react-main` | Untitled UI React | escala, proporção: table, file-upload, app-navigation, date-picker |
| `reui-main` | ReUI | terceira leitura de anatomia |
| `media-chrome-main` | Media Chrome | anatomia de player e de biblioteca de mídia |
| `material-ui-master` | MUI `9.3.1` | 157 componentes: o catálogo de estados mais completo de todas |

**Mais nove, baixadas em 08/08/2026 para destravar a Parte H:** `agents-kit-main`,
`agent-prism-main`, `agent-elements-main`, `tool-ui-main`, `langfuse-main`, `openstatus-main`,
`activepieces-main`, `xyflow-main` e `kaneo-main`. O que cada uma serve, e **onde exatamente**,
está no [`BUILDING.md`](BUILDING.md) §1 — aqui não se repete.

**Cuidado com o caminho:** todas têm o conteúdo um nível abaixo (`ui-main/ui-main/…`); só a
`material-ui-master` tem direto na pasta.

**Licença deixou de ser critério de escolha, e é medido:** `git ls-files Referencia | wc -l`
devolve `0` — a pasta está no `.gitignore` e a Aurea não redistribui nada. A trava real é a do
`BUILDING.md`: nenhuma linha literal entra, nem CSS, nem SVG, nem fixture.

**Referência não é aparência.** Extrai-se anatomia, estados, teclado e caso de borda. Nunca cor,
raio, tipografia, espaçamento ou "jeitão".

---

## 4. Parte A — A fronteira entre servidor e cliente ✅

> **FECHADA em 06/08/2026.** Os quatro itens entregues, os quatro gates provados contra o
> defeito. O que está escrito abaixo é o enunciado original; o que mudou dele na execução está
> no rodapé desta seção, porque o plano não vale mais que a medição.

**O defeito, medido em 02/08/2026:** o pacote não tem **nenhuma** diretiva `"use client"`.
O `internal.tsx` chama `createContext`, e o `index.tsx` o reexporta. Contexto do React é API
**só de cliente**. Consequência: `import {Button} from "@aurea-uds/react"` dentro de um
componente de servidor **quebra na hora**, e quebra para o consumidor, não para nós.

**Já medido, para o trabalho não começar às cegas:** 13 dos 20 módulos usam estado, efeito,
contexto ou manipulador de evento. E o compilador **preserva** a diretiva no `dist` — testado.

**Referência:** `ui-main` e `base-ui-master`, que publicam a diretiva. Copiar a **posição** dela,
não código.

- [x] **A1 — Diretiva nos módulos que precisam.** Medir de novo antes (a lista muda com o
      código), aplicar só onde há API de cliente, e deixar servidor os módulos que forem
      puramente de marcação. Um módulo que não precisa e leva a diretiva empurra trabalho para o
      cliente do consumidor sem motivo.
- [x] **A2 — Trava que impede a diretiva sumir.** Check novo no `validate.py`: módulo que usa
      `useState`/`useEffect`/`useContext`/`createContext`/`on*=` e **não** declara a diretiva
      reprova. Provar contra o defeito: tirar a diretiva de um módulo e ver reprovar.
- [x] **A3 — Aplicação de prova em framework com componentes de servidor.** Uma página, um
      import do barril, um componente com estado. Roda na CI. Sem isso o A1 volta a quebrar sem
      ninguém ver — que é exatamente como ele chegou até aqui.
- [x] **A4 — Aplicação de prova em empacotador de cliente.** O outro lado: SPA, sem servidor.
      Mesma exigência de rodar na CI.

**Fecha quando:** as duas aplicações de prova constroem e renderizam na CI, e a trava A2 reprova
o defeito reintroduzido. ✅

### O que a execução mudou do enunciado (06/08/2026)

**Não eram 13 módulos de 20, eram 19 de 22.** A medição de 02/08 não contava os hooks NOSSOS —
`useAureaStrings` e `useSpriteUrl` — e são eles que fazem de cliente o `data-display`, o
`layout`, o `chart` e o `qrcode`. Ficam de **servidor** três: `disclosure.tsx` (marcação pura),
`index.tsx` (o barril — é o ponto da parte inteira) e o `pure.tsx` abaixo.

**Nasceu um módulo que o plano não previa, e ele é o defeito uma camada abaixo.** Num
empacotador de RSC, TODO export de um módulo com a diretiva vira referência de cliente. Com o
`internal.tsx` marcado, `cx` seguia importável do barril por um componente de servidor e
explodiria ao ser **chamado**. O que não tem estado (`cx`, `AureaStrings`, `defaultStrings`,
`ptBR`, `defaultSpriteUrl`) foi para `packages/react/src/pure.tsx`, sem diretiva. Mesmo desenho
da referência: no shadcn/ui o `cn` mora em `lib/utils.ts` sem diretiva.

**A regra da A2 tinha um buraco, e a medição o achou.** O enunciado dizia
"`useState`/`useEffect`/`useContext`/`createContext`/`on*=`". O `calendar.tsx` **não chama hook
nenhum** e mesmo assim precisa da diretiva, porque o `react-day-picker` não a publica. O check 26
ganhou um quarto critério — importação de motor de terceiro que usa estado e não publica a
diretiva (medido: `react-day-picker`, `recharts` e `@tanstack/react-table` não publicam; o
`@base-ui/react` publica). E ele vale **nas duas direções**: diretiva que sobra também reprova,
porque no `index.tsx` ela apagaria o ganho da parte inteira com a CI verde.

**A prova A3 achou um defeito que não é de fronteira, e ele foi corrigido na raiz.** Nem
`@aurea-uds/core` nem `@aurea-uds/fonts` declaravam a condição `types` do subpath `./css`, então
`import "@aurea-uds/core/css"` reprovava com **TS2882** em qualquer consumidor TypeScript —
medido nos dois empacotadores. Os dois pacotes passaram a emitir um `.d.ts` no `dist`.

**As aplicações de prova:** `apps/proof-server` (Next.js 16.3.0, App Router, `output: "export"` —
o build renderiza e grava o HTML, e é o HTML que a CI confere) e `apps/proof-client` (Vite, SPA,
com `tests/visual/proof-client.spec.ts` cobrando que hidrata e que o estado responde ao clique).
Nenhuma das duas publica.

---

## 5. Parte B — Fechar os rascunhos ✅

> **FECHADA em 06/08/2026.** Os seis itens entregues. O enunciado abaixo é o original; o que
> mudou dele na execução está no rodapé da seção, porque o plano não vale mais que a medição.

Quatro componentes públicos estão em `Draft`, e dois deles — `Sidebar` e `Topbar` — são o
`AppShell`, ou seja, a moldura de **toda** aplicação. Publicar shell em rascunho é publicar a
primeira tela do consumidor em rascunho.

**Referência:** `react-main/components/application/app-navigation` e o `sidebar` do `ui-main`.

- [x] **B1 — `Sidebar` → `Stable`.** Contrato de API publicado, estados (recolhida, gaveta,
      item ativo, grupo, aninhamento), teclado e teste.
- [x] **B2 — `Topbar` → `Stable`.** Idem, mais a relação com a gaveta em tela estreita.
- [x] **B3 — `Status` → `Stable`.**
- [x] **B4 — `QRCode` → `Stable`.**
- [x] **B5 — `Avatar.size` deixa de ser número.** Vira escala de token. É **quebra de API** e
      exige nota no changelog ([ADR-0014](../decisions/0014-primeira-versao-publica-0-1-0.md)).
      Sai da allowlist do check 23.
- [x] **B6 — `QRCode.size` deixa de ser número.** Mesma coisa, mesmo cuidado. Depois deste item
      a allowlist de dimensão numérica fica **vazia**.

**Fecha quando:** `STATE.md` mostra `Draft 0`, e a allowlist `dimensaoNumerica` está vazia. ✅

### O que a execução mudou do enunciado (06/08/2026)

**O B1 não era documentação: era construção.** O enunciado dizia "estados (recolhida, gaveta,
item ativo, grupo, aninhamento)", e a medição do passo 1 mostrou que **nenhum deles existia como
API**. A `Sidebar` era `<aside>{children}</aside>`; item, grupo, rótulo de grupo e item atual
existiam no core como `.doc-nav`/`.nav-group`, que são **chrome do catálogo** (achado A6) e nunca
foram públicos. A peça estava no repositório e não era da biblioteca. Foi construída sob o
`BUILDING.md`, com as três referências que a têm registradas no `REFERENCES.md`, e a `Sidebar`
entrou em `built-components.json` — as travas 21 a 24 valem para ela.

**Um formato só para grupo e aninhamento.** O Untitled UI separa em três (`link`,
`collapsible`, `collapsible-child`) e o shadcn em quatro peças. Aqui é um `SidebarItem`: com
`items` e sem `href` é grupo; com os dois é pai com sublista. Menos API, mesmos casos.

**O `Avatar` entrou em `built-components.json` junto**, e não por generosidade: a nota do
`_lote_2` naquele arquivo dizia, desde 31/07, que ele entraria "quando for trazido ao padrão". O
B5 trouxe — ficha com `props`, `sizes`, `states` e `a11y.apg` — então a condição escrita foi
cumprida. `Topbar`, `Status` e `QRCode` **não** entram: saíram de `Draft` por documentação, não
foram construídos sob o procedimento, e entram junto com os outros no **E15**.

**A escala do `Avatar` reaproveita `--control-h-*`** em vez de criar `--avatar-*`. `md` é o
`2.25rem` que o core já declarava, então nada muda em densidade `comfortable` — e agora a
densidade alcança o avatar, que era metade do defeito que o check 23 nasceu para pegar.

**O `QRCode` ganhou válvula de escape.** Tamanho de QR é medida de renderização de verdade (um
QR pequeno demais não escaneia), então o número livre virou três degraus **mais** `--qr-size` no
CSS — no mesmo idioma de `--qr-module` e `--qr-quiet`, que já eram os botões de ajuste dele.

**Três gates cobraram nesta parte, e dois deles cobraram a si mesmos:**

1. **O check 23 reprovou a prosa que documenta a própria correção.** O comentário que explica
   por que `Avatar.size` deixou de ser número precisa citar a forma antiga, e o gate lê a fonte
   inteira, comentário incluído. É o mesmo defeito que o **check 12** já tinha corrigido do lado
   do CSS em 02/08. Corrigido na raiz com o `_sem_comentario` que já existia, e provado nos dois
   sentidos: com o comentário, passa; com uma prop numérica de verdade, reprova.
2. **O navegador achou o que gate nenhum via.** A regra do trilho nasceu
   `.app-shell:has(.sidebar-collapsed)`, sem `>`. `:has()` casa com **qualquer descendente** —
   então a página do catálogo que mostra uma lateral recolhida como **exemplo**, dentro do
   `<main>`, recolhia a lateral **de verdade** do documento: coluna de 264px para 88px numa
   página que não pediu nada. Nenhum gate via, porque `sidebar.html` não tem baseline de pixel.
   Corrigido com o combinador de filho, e o `skin.spec` ganhou dois shells — um com o trilho
   aninhado, outro com ele como filho direto — que reprovam se o `>` sumir.
3. **O `--sidebar-rail` nasceu 2px pequeno demais.** Foi medido como "cabe um ícone" e esquecia
   que a `.sidebar` gasta `--space-4` de margem de cada lado antes de começar. Com `4.5rem` o
   ícone ficava fora da caixa. Medido no navegador, virou `5.5rem`, e o `skin.spec` passou a
   cobrar que o ícone caiba — asserção que a versão antiga reprovava.

**Limitação declarada, e ela precisa de uma ação do Victor:** o gate de pixel compara baselines
`-linux.png`, que **não dá para gerar nesta máquina**. Duas capturas mudaram de propósito — o
índice do catálogo (quatro fichas saíram de `Draft` e o chip de maturidade mudou) e o topo (o
contador de tokens foi de 260 para 261, com o `--sidebar-rail`). As `-win32.png` já foram
regravadas aqui; **as `-linux.png` precisam do job de regeneração da CI** (`workflow_dispatch`
com `update_snapshots=true`, e commitar o artefato `playwright-snapshots-linux`). Até isso, o
passo de screenshot da CI reprova — e reprova com razão.

**Acrescentado em 21/08/2026, pela ATIVIDADE-2:** mais uma captura entrou na mesma fila, a
`catalogo · lateral` nos dois temas. `Separator`, `Collapsible` e `ToggleGroup` são componentes
novos, então a lista da lateral do catálogo cresceu três linhas. Medido: **~3.500 pixels de
diferença**, contra os ~33 de uma captura que só mudou um dígito — a magnitude confirma que é a
lista, e não outra coisa. Mesma resolução, mesmo job da CI. São **três** capturas esperando
regeneração agora: `index`, `topo` e `lateral`.

---

## 6. Parte C — Os defeitos de semântica que seguem abertos ✅

> **FECHADA em 07/08/2026.** Os três saíram do placar, cada um com o controle que pega a
> regressão, e cada controle provado contra o defeito. O que a execução mudou do enunciado está
> no rodapé.

Três achados de auditoria vivos, todos em componente **já publicado**. São pequenos e são
dívida de acessibilidade, que é a que menos aparece e mais custa.

- [x] **C1 — `SegmentedControl` (achado M20).** Usa `aria-pressed` onde o padrão APG indica
      `radiogroup`. Escolha única entre opções é rádio, não um punhado de botões alternáveis.
      Conferir com `base-ui-master` antes de escrever.
- [x] **C2 — Popup em portal fora de marco (achado B7).** Conteúdo que vive em portal fica fora
      de qualquer landmark, e o leitor de tela perde a âncora.
- [x] **C3 — `$description` nos tokens (achado M15).** Estão em 18 de 260. Token sem descrição é
      token que ninguém sabe quando usar — e é o que o consumidor lê primeiro.

**Fecha quando:** os três saem do placar de `02-ACHADOS.md` §0, cada um com o teste que pega a
regressão. ✅

### O que a execução mudou do enunciado (07/08/2026)

**C1 — o `base-ui-master` respondeu, e a resposta poupou código.** O motor tem `radio-group` e
`radio`, com o padrão APG inteiro: roving tabindex, setas que movem **e** selecionam, `Home`/`End`.
Escrever isso à mão era a alternativa que parecia barata e não era — está rejeitada por escrito na
[ADR-0016](../decisions/0016-segmented-control-e-radiogroup.md), e o teste de teclado é a prova: um
`radiogroup` de mentira, com os papéis certos e sem o comportamento, **reprova**.

Duas coisas só apareceram porque a medição veio antes da escrita: o `Radio.Root` renderiza um
`<span>` e a pele da Aurea é `.segmented button` (sem `render={<button/>}` o componente perderia a
pele, e **o check 18 não veria** — ele compara classe, não elemento); e o motor emite um `<input>`
escondido por item, `position:fixed` e `aria-hidden`.

**C2 — o enunciado (e o achado) estavam errados sobre a causa.** O achado dizia que "a única forma
de satisfazer seria o consumidor montar o portal dentro do landmark dele", e tratava isso como
fora do nosso alcance. O defeito real era mais simples: **o consumidor não tinha essa forma.** O
`container` do Base UI existe em todo portal e nunca foi exposto — a saída estava trancada por
dentro. `portalContainer` no `AureaProvider` alcança os **11** portais de uma vez, o default não
muda (vai para o `body`), e o teste novo roda o axe com a regra `region` **ligada**.

**C3 — 70 descrições, e a decisão de não escrever 175.** `theme` e `density` são a camada que se
escolhe, e é ali que a ausência custa. O `base` ficou fora de propósito: são primitivos, onde o
nome já é a descrição e a frase obrigatória viraria enchimento — e descrição de enchimento é pior
que ausência, porque parece contrato. O **check 27** cobra por **nome**, não por declaração, senão
seria a mesma prosa em dois ou três lugares, que é o achado I1 esperando para acontecer.

**Um defeito de GATE encontrado de passagem, e deliberadamente não corrigido aqui:** o `docs.spec`
é **instável sob carga**. Em duas execuções da suíte completa ele reprovou capturas **diferentes**
(`aplicacoes` escuro + `feedback` claro na primeira; `feedback` escuro na segunda), e rodando o
spec isolado passou 26 de 26 — duas vezes. Conjunto que muda derruba a hipótese de conteúdo: é
corrida de tempo. O sintoma é 23px de diferença na ALTURA da seção, alternando entre tentativas da
mesma execução. **A causa exata não foi isolada** e não registro palpite como diagnóstico; o
rastro está no `04-PROTOCOLO-IA.md` §2, com os dois candidatos (o `catalog.spec` mascara o topo
`sticky` e espera a transição de tema; o `docs.spec` não faz nem um nem outro). Corrigir exige
regerar baselines, que hoje depende da CI — e a CI está bloqueada por cobrança.

**Uma baseline mudou de propósito nesta parte:** o `catalogo-index` cresceu 20px de altura, porque
o resumo do `AureaProvider` na ficha passou a citar o `portalContainer` e quebrou uma linha a
mais. Determinístico (mesmo diff nas duas tentativas). As `-win32` foram regravadas; as `-linux`
entram na mesma fila da Parte B.

---

## 7. Parte D — Aposentar a página manual ✅

`apps/docs/index.html` tem **682 KB** escritos à mão (medido em 08/08/2026; o plano dizia 670).
O enunciado abaixo é o original de 02/08 — **o D1 mediu e ele estava parcialmente vencido**, ver o
rodapé da seção.

Ninguém decidiu aposentá-la porque ela era a única prova visual. **Desde a Fase 10 não é mais:**
o catálogo gerado tem baseline no Linux.

- [x] **D1 — Inventariar o que ela ainda prova.** ✅ **08/08/2026.** Resposta: **nada que já não
      esteja provado em outro lugar** — e a medição corrigiu a premissa do D2. Números no rodapé
      da seção.
- [x] **D2 — Remover a página** e o CSS de moldura. ✅ **08/08/2026.** Saíram 682 KB de HTML,
      o `docs.css`, o gerador, o `docs.spec` e as 52 baselines. Do core: **8 regras, 0,60 KB**.
- [x] **D3 — Remover os 6 breakpoints legados.** ✅ **08/08/2026.** `LEGACY_BP` está vazia e o
      check 4b vale sem exceção. Quatro saíram com a página, um já não era usado, e o de **400
      virou `@container`** — ele servia o `MediaPlayer`, e um degrau da escala teria fechado o
      gate mantendo o defeito. **Fecha o M13, e com ele a auditoria de 26/07.**
- [x] **D4 — Refazer as baselines pelo caminho do Linux.** ✅ **08/08/2026.** E não foi preciso
      refazer nenhuma: **61/61 passaram no contêiner sem uma regravação**, o que é a prova de que
      D2 e D3 removeram só código morto. O caminho está no
      [`04-PROTOCOLO-IA.md`](../audit/2026-07-26-integral/04-PROTOCOLO-IA.md) §2.

**Fecha quando:** o core encolhe (medido em bytes, no commit), o M13 fecha e a CI segue verde.

### O que o D1 mediu, e ele muda o motivo da parte (08/08/2026)

**A premissa "25 KB de CSS de moldura no pacote público" está VENCIDA.** Ela era verdade em
02/08, quando o plano foi escrito — mas descreve o estado **anterior à Fase 4**, que já moveu 199
regras e 9 blocos `@media` para `apps/docs/docs.css` ao fechar o achado A6. Medido agora, com o
mesmo corpus de classe que o check 15 usa:

| O que | Quanto |
|---|---:|
| classes do core que **só** a página manual usa | **12** |
| regras do core com seletor só dessas classes | **8** |
| peso delas | **1,09 KB** de 86,4 KB — **1,3%** do core |

As 12: `bad`, `demo`, `doc-nav`, `eyebrow`, `media-optional`, `mobile-nav-close`,
`mobile-nav-toggle`, `off`, `open`, `operational-grid`, `universal-grid`, `warn`.

**E a primeira medição errou, pelo mesmo motivo que o E13 achou no `LogStream`.** Um extrator de
classe LITERAL disse 45 classes e 4,7 KB, porque não vê o que o React monta por template
(`badge-${variant}`, `alert-${variant}`, `btn-${…}` — 15 prefixos). Usando o corpus do próprio
check 15 — o conteúdo das strings do fonte —, o número caiu para 12 e 1,09 KB. Terceira vez que
esse ponto cego aparece nesta auditoria; aqui ele teria inflado o ganho da parte em 4×.

**O que a página prova sozinha: nada.** Medido: o `skin.spec` cobre **76 de 76** componentes por
asserção medida desde o item E13 (07/08/2026), o catálogo gerado tem **183** páginas, e o
`catalog-sweep` roda axe, hierarquia de título e rolagem lateral em todas. As 26 capturas do
`docs.spec` são de **seções da própria página**, não da biblioteca — e a página é o que sai.

**Então o motivo da Parte D deixa de ser "o core encolhe" e passa a ser:**

1. **O M13 fecha** — é o último achado aberto da auditoria.
2. **682 KB de HTML escrito à mão param de precisar de manutenção**, e com eles as **52**
   baselines do `docs.spec` (26 por SO).
3. **O `docs.spec` instável some junto.** É o defeito de gate aberto desde 07/08 no
   `04-PROTOCOLO-IA.md` §2, que ninguém isolou — e que deixa de existir com a página.

O item **D2** segue valendo; o que muda é a expectativa. Quem cobrar "o core encolheu 25 KB" no
commit vai achar 1,09 KB e concluir que algo deu errado — não deu: a Fase 4 já tinha cobrado
aquele ganho, e contá-lo de novo seria contar duas vezes.

**Uma correção de escopo no D3, também do D1:** os seis breakpoints legados **não são todos da
página**. Medido no core: `1366`/`821`/`800`/`820` servem a moldura dela, mas **`400` serve o
`MediaPlayer`** (`.media-controls` em tela estreita) e não sai junto. O D3 remove quatro e decide
o que fazer com o quinto — a escala não tem degrau em 400px, e o mais próximo é `639`.

---

## 8. Parte E — O contrato de API completo (achado M8) ✅

**43 de 76 fichas não publicam `props`.** É o maior achado aberto da auditoria e é o que impede
sair de `0.x`: quem instala não tem onde ler a API, e o que não está na ficha não está prometido.

Dividido **por categoria**, porque é assim que cabe numa sessão e é assim que as decisões se
parecem entre si.

- [x] **E1 — Feedback (7):** `Alert`, `Badge`, `Banner`, `EmptyState`, `NotificationCenter`,
      `Progress`, `Skeleton` — o `Status` já tinha, desde a Parte B
- [x] **E2 — Navigation (6):** `Breadcrumb`, `CommandPaletteShell`, `Pagination`,
      `TableOfContents`, `Tabs`, `TreeView` — `Sidebar` e `Topbar` vieram da Parte B
- [x] **E3 — Data Display (5):** `DataGrid`, `DataList`, `KPI`, `Table`, `Timeline` — o `QRCode`
      veio da Parte B
- [x] **E4 — Overlays (6):** `ContextMenu`, `Dialog`, `Drawer`, `DropdownMenu`, `Popover`,
      `Tooltip`
- [x] **E5 — Layout (4):** `Card`, `Cluster`, `Grid`, `Stack`
- [x] **E6 — Code (3):** `CodeBlock`, `CodeEditor`, `LogStream`
- [x] **E7 — Communication (2):** `MessageComposer`, `MessageList`
- [x] **E8 — Media (2):** `MediaPlayer`, `MediaPlayerShell`
- [x] **E9 — System (1):** `Icon` — o `AureaProvider` ganhou `props` na Parte C, com o
      `portalContainer`
- [x] **E10 — Identity:** nada a fazer — o `Avatar` fechou no item B5
- [x] **E11 — Disclosure (1):** `Accordion`

O item **E12** original — "ligar as travas 21 a 24 para todos" — foi **medido em 07/08/2026 e
dividido em quatro**, porque o enunciado supunha que só faltava `props` e faltavam mais quatro
campos e dois arquivos. Os números e o método da medição estão no rodapé desta seção.

**Ordem executada: E12 → E13 → E14 → E15, do mais barato ao mais caro. Os quatro fecharam em 07/08/2026.**
Cada um **fecha sozinho e trava o seu ganho** — dá para parar entre eles sem deixar meia
correção no repositório. O custo ao lado é medido, não estimado.

- [x] **E12 — check 22: a regra, e os campos.** ✅ **07/08/2026.** A regra passou a cobrar a
      **verdade** de cada campo, medida onde dá para medir; os campos foram preenchidos; e com os
      76 na lista o check 22 reprova **zero**. O que a execução mudou do enunciado está no rodapé
      — em resumo: eram **6** fichas incompletas em `states` e não 27, e o `tokens` quase ganhou
      uma exceção que teria sido trava de mentira.
- [x] **E13 — check 24: a pele medida.** ✅ **07/08/2026.** Os 53 entraram; com os 76 na lista
      o check 24 reprova **zero**. Toda asserção foi medida no navegador antes de ser escrita — e
      a medição achou um defeito de pele que nenhum gate via, no `LogStream`. Rodapé da seção.
- [x] **E14 — check 21: as referências que faltavam.** ✅ **07/08/2026.** As **40** escritas, mais
      o `Dialog` que foi feito antes para medir o custo. `REFERENCES.md` foi de 508 para **1.476**
      linhas. Escrever as 40 mediu o próprio gate, e o limite está registrado no rodapé.
- [x] **E15 — Ligar as travas 21 a 24 para todos.** ✅ **07/08/2026.** Os 76 estão em
      `built-components.json` e **o arquivo de exceções deixou de existir** — a lista virou o
      conjunto. Provado contra o defeito: apagar `props` do `Card`, que era um dos que nunca
      estiveram na lista, **reprova**.

**Fecha quando:** `STATE.md` mostra `props` em 76 de 76 ✅, e `built-components.json` tem 76 nomes.

### O que a execução mudou do enunciado (07/08/2026)

**Eram 37, não 43, e a diferença não é erro do plano: é a Parte B.** A contagem de 02/08 valia
naquele dia; `Status`, `Sidebar`, `Topbar`, `QRCode` e `Avatar` ganharam ficha completa na Parte B
e o `AureaProvider` na Parte C. Por isso o E10 fechou sem uma linha de trabalho. O `STATE.md` é
que mandou — a tabela do §2 conta intenção, o gerado conta código.

**Publicar API é revisão de código disfarçada, e foi o que pagou o custo.** Escrever contrato
honesto obriga a ler a implementação linha a linha, e a leitura achou três defeitos que ninguém
procurava: `source.react` apontando para o barril em **58 das 76** fichas (check 28 novo), o
`Progress` grampeando o desenho e não o `aria-valuenow`, e a ficha do `Progress` prometendo um
modo indeterminado que não existe. O registro está em
[`02-ACHADOS.md` §0.14](../audit/2026-07-26-integral/02-ACHADOS.md).

**Um quarto defeito, e é o I1 uma camada abaixo:** o `STATE.md` é gerado e gateado, mas o
parágrafo sobre o M8 era texto **fixo** dentro do gerador. Virou mentira no instante em que a
cobertura fechou. Gerar o número não basta se a prosa sobre o número continua escrita à mão.

### Por que o E12 virou quatro — e como o custo foi medido (07/08/2026)

O enunciado dizia "com as fichas completas, os 76 entram em `built-components.json`". A medição
disse que `props` era **um** dos cinco campos que o check 22 cobra, e que faltavam mais dois
arquivos inteiros:

| Trava | O que falta para os 76 | Vira |
|---|---:|---|
| check 21 — referência registrada | **42** entradas no `REFERENCES.md` | E14 |
| check 22 — ficha completa | 27 `states` · 27 `keyboard`/`apg` · 12 `a11y.role` · 3 `tokens` | E12 |
| check 23 — dimensão não é número | nada | ✅ já vale para todos |
| check 24 — pele medida | **53** asserções no `skin.spec.ts` | E13 |

**O custo foi medido FAZENDO, não estimando — e essa é a parte que precisa ficar registrada,
porque eu errei antes de medir.** A primeira resposta ao Victor foi que o check 21 "custa
semanas". Semana é unidade de esforço de PESSOA, e quem executa é o agente. Ele recusou o número
e pediu medição. O `Dialog` foi então feito inteiro, sob o procedimento, e cronometrado: **10
chamadas de ferramenta, ~4.000 linhas de referência varridas, ~400 lidas de perto, 57 linhas de
prosa escritas.** Daí saem as 4–6 h do E14 e, por densidade, as dos outros três — **10 a 13 h no
total**, não semanas.

**E a medição mudou a recomendação.** Antes dela eu recomendava afrouxar o check 21 para valer só
de quem entrasse na lista depois da data em que a trava nasceu, tratando os 42 como dívida
declarada. Com o custo real na mão, a recomendação é **fazer os 42**. O argumento contra era o
preço, e o preço estava errado; o argumento a favor é que a leitura **paga**: escrever a entrada
do `Dialog` achou que o Base UI expõe `initialFocus` e `finalFocus`, com o default medido para
toque (foca o popup em vez do primeiro campo, para não abrir o teclado virtual), e que a Aurea não
expõe nenhum dos dois. Está registrado como lacuna conhecida no `REFERENCES.md`. Foi o mesmo
padrão de E1–E11: ler para escrever contrato acha defeito que ninguém procurava.

**A lição de método, para não repetir:** número que vai para um documento deste projeto tem
comando reprodutível atrás — inclusive número de CUSTO. "Semanas" foi contagem, não medição, no
projeto cuja primeira regra é *medir, não contar*.

### O que o E13 mudou do próprio enunciado (07/08/2026)

**A medição do passo 1 mudou três decisões antes de a primeira fixture ser escrita.** Renderizar
os 53 no servidor mostrou que **42** saem inteiros e entram como COMPONENTE; **6 são portal** e
`renderToStaticMarkup` devolve só o gatilho — `Dialog` e `Drawer` devolvem **zero byte** —, então
entram como MARCAÇÃO, no precedente do `HoverCard`; e o `ToolbarGroup` **lança** fora de um
`Toolbar` (`ToolbarRootContext is missing`), então vai aninhado. Escrever fixture antes de medir
teria produzido três testes que passariam medindo nada.

**E a medição achou um defeito de pele que nenhum gate via — o `LogStream`, e ele tinha duas
metades.** A pele do log é de três colunas (hora | nível | texto); o componente emitia **duas**,
então o texto caía na coluna do NÍVEL, com 72px de largura. E a prop `level` **não pintava nada**:
o core estiliza `.log-level.error` — um elemento — enquanto o React escrevia `log-error` no
container. Nenhum dos dois gates de fronteira via: o **check 18** só enxerga classe LITERAL e
`log-${level}` é template; o **check 15** dava as classes por produzíveis pelo mesmo motivo, via
prefixo. É o achado **A6** outra vez — a regra do core servia à página manual, escrita à mão com
as três partes, e a biblioteca pagava a conta. Corrigido na raiz, nos dois lados, e a asserção
reprova o defeito reintroduzido **nomeando a causa**.

**Uma medição minha errou três vezes antes de acertar, e as três viraram comentário no arquivo:**
comparar o TOPO de elementos de alturas diferentes acusava desalinhamento onde havia alinhamento
correto (é o centro que importa); o seletor `.pagination` casava com DUAS paginações, porque o
`DataGrid` desenha a sua; e a divisória da tabela media zero porque a única linha do fixture era
também a última, que perde a divisória de propósito. Nenhuma era defeito do CSS.

### O que o E12 mudou do próprio enunciado (07/08/2026)

**Eram 6 fichas incompletas em `states`, não 27.** O enunciado contava fichas com a lista vazia; a
medição perguntou outra coisa — **quais componentes EMITEM sinal de estado** (`aria-current`,
`aria-sort`, `data-selected`, classe `-active`…), lendo o corpo de cada função. Resposta:
`Breadcrumb`, `CodeBlock`, `DataGrid`, `MessageComposer` estavam mudas com sinal emitido; nas
outras 21 o `[]` era a verdade. Contar campo vazio não é medir contrato.

**A medição errou primeiro, e errou o erro clássico desta casa.** A primeira versão disse que o
`Grid` emite `aria-expanded` — e o que havia era o **comentário** do `AppShell` logo abaixo,
explicando o popover nativo. Terceira vez que um gate deste repositório lê prosa como se fosse
código (check 12 em 02/08, check 23 em 06/08). Agora a função de medição mora no `validate.py`
com o nome e o motivo escritos.

**E a medição TEM limite declarado, achado pela comparação entre fichas e não pelo gate:** ela lê
o *nosso* fonte, então não vê estado que o **motor** emite. O `Tooltip` declarava `states: []`
enquanto os outros oito overlays declaravam `["open","closed"]` — mesma família, mesmo portal,
mesma coisa. Corrigido à mão; overlay novo ainda depende de olho.

**O `tokens` quase ganhou uma exceção, e não ganhar foi o ponto.** O `ToolbarGroup` era o único
com `tokens: []`, e a saída fácil era medir e aceitar. Só que a medição que escrevi para isso
**nunca disparava** — o slice pega o corpo da função e a pele do `CodeEditor` mora num
`export const` separado, então ela aprovaria os 76 sempre. Trava que nunca dispara é pior que
trava nenhuma, porque parece cobertura. A causa real era outra: `.toolbar-group` tinha `gap:4px`,
pixel cru, e `4px` **é** `--space-1`. Virou token — o contador de pixel cru caiu de 123 para 122,
o gate exigiu travar o ganho, e o espaçamento passou a acompanhar a raiz, que é o que o M12
decidiu. `tokens` segue obrigatório sem exceção nenhuma.

**Nos cinco últimos, o certo era o contrário de declarar ausência.** `Input`, `Textarea`, `Field`,
`Pagination` e `CodeEditor` estavam sem `keyboard` **e** sem `apg` — e todos têm teclado. Ganharam
a lista, não a desculpa. O do `CodeEditor` é o que vale ler: o `indentWithTab` do CodeMirror está
**deliberadamente ausente**, então `Tab` **sai** do editor em vez de indentar. Editor que engole
`Tab` é armadilha de teclado (WCAG 2.1.2), e isso agora está no contrato publicado.

---

## 9. Parte F — Grade de dados profissional

O `DataGrid` de hoje ordena, filtra em geral, pagina e seleciona — **com o estado por dentro**.
Serve para uma tabela de demonstração. Não serve para uma superfície administrativa, onde os
dados moram no servidor e o filtro precisa sobreviver a um recarregamento de página.

**Referência:** `react-main/components/application/table`, `kibo-main/packages/table`, e a tabela
do `ui-main`. As três resolvem o mesmo problema de jeitos diferentes — ler as três antes de
escolher.

- [x] **F1 — Modo controlado.** ✅ **08/08/2026.** Ordenação, filtro, página e seleção aceitam
      valor e callback de fora; o modo interno segue sendo o default e nenhuma chamada existente
      mudou. `page` é **1-based** (o do nosso `Pagination`), com a conversão para o índice do motor
      num lugar só.
- [x] **F2 — Dados do servidor.** ✅ **08/08/2026.** `manualSorting`, `manualFiltering`,
      `manualPagination` e `rowCount`. Os nomes são **os do motor**, e a razão está medida no
      `REFERENCES.md`: **nenhuma das sete referências expõe API controlada** — não havia anatomia
      para copiar, então o vocabulário veio do contrato que o consumidor já lê.
- [x] **F3 — Filtro por coluna e por faceta**, além do filtro geral. ✅ **08/08/2026.** A linha de
      filtro é do **próprio cabeçalho** — cada controle nasce alinhado com a sua coluna sem uma
      linha de layout, porque quem alinha é a tabela. A faceta é um **`MultiCombobox`**, não um
      popover novo: as 147 linhas de `Popover` + `Command` + `Badge` da referência viraram reuso.
- [x] **F4 — Estado na URL.** ✅ **08/08/2026.** `gridStateToParams` e `gridStateFromParams`, o
      formato e nada mais — a grade não escreve na URL, porque só o consumidor sabe se aquela
      mudança é `push` ou `replace`. Saem do **barril**, não do subpath: quem lê a URL num
      framework de RSC é o servidor, e o subpath tem a diretiva. É o `pure.tsx` da Parte A
      valendo uma segunda vez.
- [x] **F5 — Seleção e ação em lote.** ✅ **08/08/2026.** E com **zero CSS novo**: a barra é
      `Toolbar` + `ToolbarButton` + `ToolbarSeparator` + `.hint`, que já são superfície flutuante
      com pele e teclado de setas. As duas referências (Activepieces e Kaneo) desenham a mesma
      barra à mão, com `position:fixed` e biblioteca de movimento — nenhum dos dois entrou.
- [x] **F6 — Cabeçalho fixo** na rolagem vertical. ✅ **08/08/2026.** `stickyHeader`, e a linha
      de filtro do F3 gruda uma altura de linha abaixo. O teto de altura é `--datagrid-max-h` em
      CSS, não prop: quem sabe quanta tela tem é a página, e altura não vira número na API
      (check 23). **Uma causa que eu ia escrever no core estava errada** — ver o rodapé.
- [x] **F7 — Colunas ocultáveis e redimensionáveis**, com a escolha persistível. ✅ **08/08/2026.**
      Os dois estados são **mapas serializáveis**, e a persistência é do consumidor, como no F4.
      O seletor de colunas é o `MultiCombobox` outra vez — terceira peça da parte que entra por
      reuso. A alça de redimensionar responde às **setas**: o motor só entrega o arrasto, e
      coluna que só se ajusta com mouse é funcionalidade que exclui.
- [x] **F8 — Estados: carregando, obsoleto, parcial e erro.** ✅ **08/08/2026.** O aviso é
      **texto**, não cor, e `error` vira `role="alert"` enquanto os outros ficam em
      `role="status"`. `loading` **não apaga** o que já está na tela — recarregar não é motivo
      para tirar do consumidor o que ele estava lendo. Os nomes aqui são **desta grade**: quem vai
      nomear os estados universais uma vez só é a **Parte J**, e antecipá-la criaria o segundo
      vocabulário que ela existe para impedir.
- [x] **F9 — Painel de detalhe da linha**, lateral, sem sair da lista. ✅ **08/08/2026.** O
      gatilho é um **botão por linha**, não a linha clicável: linha não é foco de teclado, e
      torná-la alvo exige inventar papel, tabindex e tecla que um `<button>` já é. Fechado, a
      marcação é exatamente a de antes. **Limite declarado:** a divisão é por largura de janela,
      não da grade — o `@container` foi tentado e recusado, ver o rodapé.
- [x] **F10 — Exportação com escopo visível.** ✅ **08/08/2026.** O rótulo diz o escopo, e a
      precedência é o que a pessoa acabou de fazer: seleção ganha de filtro, filtro ganha de tudo.
      **A grade não gera arquivo** — formato, codificação e transporte são do consumidor, a mesma
      linha que a Parte G traça para o envio.
- [x] **F11 — Virtualização, se e somente se medida.** ✅ **08/08/2026 — e a medição diz que
      NÃO precisa.** Comando: `node scripts/measure-grid.mjs`. Números no rodapé desta seção.

**Fecha quando:** os dez primeiros existem com teste, e o F11 está feito **ou** fechado com a
medição que diz que não precisa. ✅ **FECHOU em 08/08/2026** — os dez com teste, e o F11 pela
segunda via.

### F11 — a medição, e por que a virtualização NÃO entra (08/08/2026)

`node scripts/measure-grid.mjs` — renderiza a grade com quatro colunas em quatro tamanhos, mede o
render no servidor, o layout no navegador e os nós que sobram na página:

| linhas | render no servidor | layout no navegador | nós de DOM | HTML |
|---:|---:|---:|---:|---:|
| 100 | 44 ms | 28 ms | 527 | 7 KB |
| 1 000 | 287 ms | 62 ms | 5 027 | 68 KB |
| 5 000 | 449 ms | 300 ms | 25 027 | 345 KB |
| 10 000 | 1 203 ms | 684 ms | 50 027 | 692 KB |

**A decisão, e os três motivos:**

1. **Até 1 000 linhas numa página o custo é 62 ms de layout.** Esse é o caso real: a grade
   **pagina** desde a Fase 4 e tem modo servidor desde o **F2**. Quem tem 10 000 linhas passa
   `pageSize` ou `manualPagination` — uma prop —, e aí renderiza uma página.
2. **Virtualizar quebraria o render no servidor, e isso já custou caro aqui.** Linha virtual só
   existe depois que o navegador mede a caixa; `renderToStaticMarkup` devolveria uma tabela
   **vazia**. É exatamente o defeito do Recharts no Lote 3, que precisou de um bloco PRERENDER no
   gerador do catálogo — e ali era um `<svg>`, não a tabela inteira.
3. **Seria dependência nova** (`@tanstack/react-virtual`), e o `BUILDING.md` §3.3 diz que
   dependência nova interrompe o lote e exige o Victor. Pagar isso para melhorar um caso que a
   paginação já resolve é o oposto do que o item pediu.

**O que fica documentado em vez de código:** acima de ~1 000 linhas numa página, pagine ou use o
modo servidor. E o limite tem comando atrás — se alguém duvidar, roda de novo.

### O que a execução mudou do enunciado (08/08/2026)

**F1 e F2 eram EXPOSIÇÃO, não construção.** O motor já tinha `manualSorting`, `manualFiltering` e
`manualPagination`, e os três curto-circuitam o modelo de linha correspondente — medido no fonte
instalado. Escrever máquina de estado ao lado da dele teria sido o padrão paralelo que o protocolo
recusa.

**Nenhuma das sete referências expõe API controlada por prop, e nenhuma persiste estado na URL.**
Onde não havia anatomia, o vocabulário veio do contrato do motor (F1/F2) e de uma API de
plataforma (F4). Isso está medido no `REFERENCES.md`, referência por referência.

**Três itens entraram por REUSO, não por construção.** A faceta do F3 é o `MultiCombobox`; a barra
do F5 é `Toolbar` + `ToolbarButton` + `ToolbarSeparator` + `.hint`, com **zero CSS novo**. As
referências desenham as duas à mão — 147 e 57 linhas.

**A medição matou quatro declarações de CSS que eu tinha escrito com explicação convincente.** Três
no F3 (`height:auto`, `letter-spacing:normal`, `line-height:0`) e uma no F6
(`border-collapse:separate`, que eu ia justificar com "collapse anula sticky" — falso: eu estava
medindo a caixa da `<tr>` em vez da `<th>`). Cada declaração foi retirada e remedida sozinha.

**Um `@container` foi tentado, medido e RECUSADO no F9.** Quem sabe se o painel lateral cabe é a
largura da grade, não a da janela — foi o argumento que fez o `MediaPlayer` virar `@container` no
fecho do M13. Só que aqui o contêiner teria de ser a própria `.datagrid`, e `container-type:
inline-size` dá a ela contenção de tamanho: dentro de um pai que encolhe para caber (float,
inline-block, item de flex com largura automática) a grade **colapsa**. Trocar um defeito de
layout raro por um comum não vale, então ficou o breakpoint de escala e o limite está escrito no
core, ao lado da regra.

**E uma ficou declarada como PRECAUÇÃO, não como fato:** o `z-index:1` do cabeçalho fixo não tem
gate — `elementFromPoint` usa coordenada de janela e a grade está a 7000px de rolagem na página de
prova. Está escrito no core, ao lado da linha.

---

## 10. Parte G — Fila de transferência de arquivos

O `FileInput` de hoje já faz mais do que parece: **múltiplos arquivos, progresso real, cancelar e
repetir por item**. O que falta é o que transforma isso em fila confiável.

**Referência:** `kibo-main/packages/dropzone` e
`react-main/components/application/file-upload`.

**Fronteira, e ela não se move:** transporte, armazenamento e servidor **não entram na Aurea**. O
que entra é a peça de interface que mostra a fila e o que aconteceu com ela.

- [x] **G1 — Fila que sobrevive.** ✅ **08/08/2026.** A fila é dado serializável, e sai a cada
      mudança. Volta por `initialQueue`. **Limite da plataforma, declarado:** `File` não volta de
      um armazenamento — item restaurado tem a ficha e não tem os bytes, então o botão de repetir
      **some** nele em vez de existir e falhar.
- [x] **G2 — Pausar e retomar** por item e no conjunto. ✅ **08/08/2026.** Pausar HTTP não é
      pausar: é abortar com a intenção declarada, para separar "pausei" de "cancelei" — os dois
      chegam como `signal.aborted`. O `UploadContext` ganhou `resumeFrom`, a fração já enviada:
      quem tem transporte resumível continua de lá, quem não tem reenvia. A ação de conjunto é o
      mesmo laço da ação de item, para os dois não acabarem em estados diferentes.
- [x] **G3 — Pré-visualização** antes de enviar. ✅ **08/08/2026.** Só imagem, no lugar do ícone
      e no mesmo espaço — a linha não muda de altura. A URL de objeto é **revogada** ao remover e
      ao desmontar; sem isso o navegador segura os bytes até a página morrer.
- [x] **G4 — Soma de verificação** exibida e conferida. ✅ **08/08/2026.** SHA-256 pelo Web
      Crypto, sem dependência. **Conferir é comparar:** se o `upload` devolver `{checksum}`, os
      dois são comparados e a divergência **reprova o item**. Opcional por dois limites medidos:
      `crypto.subtle` exige contexto seguro, e o digest precisa do arquivo inteiro em memória.
- [x] **G5 — Conflito e substituição.** ✅ **09/08/2026.** Nome repetido **não entra sozinho**:
      fica em espera com três saídas na tela — substituir, manter os dois, pular. "Manter os dois"
      **não renomeia**: inventar `arquivo (1).txt` seria decidir pelo consumidor um nome que o
      servidor dele talvez não aceite; quem distingue são os ids.
- [x] **G6 — Recibo final.** ✅ **09/08/2026.** Só aparece quando **não há mais nada em voo** —
      recibo de fila que ainda anda é mentira. Sai como **texto puro** (TSV), porque o destino é
      um chamado, um e-mail ou um bloco de notas, e nenhum dos três lê marcação.

**Fecha quando:** a fila é um bloco montável, com teste do caminho de falha por item. ✅ **FECHOU em 09/08/2026.**

---

## 11. Parte H — A camada operacional

**A maior lacuna do contrato.** Dezesseis nomes estão descritos em
`packages/contracts/aurea.contract.json` (`componentRules.UniversalDomain`) e **nenhum tem uma
linha de código, ficha ou export.** Conferido em 02/08/2026.

> **O bloqueio de referência CAIU em 08/08/2026.** O aviso anterior dizia que nenhuma das sete
> referências locais tinha esta família — era verdade, e a saída escolhida pelo Victor foi baixar
> referência nova. Nove pastas entraram (`BUILDING.md` §1) e cobrem **15 dos 16**.
>
> **Sobra um: o `MemoryLedger` (H13), e ele não tem referência no mundo aberto.** Medido: o ADE do
> Letta tem só o servidor aberto, o OpenMemory do mem0 está sendo descontinuado, e o painel do
> mem0 é só na nuvem. Pelo passo 4, nasce de **pesquisa registrada** e por composição —
> `DataGrid` + `Timeline` + a procedência do `DetailsView` do `agent-prism`.
>
> **E por isso o H13 depende da Parte F:** o livro-razão precisa do `DataGrid` em modo controlado,
> que é o item F1. Abrir H antes de F deixa o H13 meio pronto esperando.

**Onde está a anatomia de cada um** — medido em 08/08/2026, antes de a parte abrir. O caminho
dentro de cada pasta está no [`BUILDING.md`](BUILDING.md) §1.

| Item | Pasta de referência |
|---|---|
| H1 `AgentCard` | `agents-kit-main` · `activepieces-main` |
| H2 `AgentStatus` | `agents-kit-main` · `openstatus-main` |
| H3 `AgentInspector` | `agent-prism-main` (`DetailsView/`) |
| H4 `InvocationPanel` | `agent-elements-main` (`tools/`) · `activepieces-main` (`agent-timeline`) |
| H5 `TaskQueue` | `agents-kit-main` · `kaneo-main` |
| H6 `HumanApproval` | `agents-kit-main` · `agent-elements-main` |
| H7 `ToolPermission` | `activepieces-main` (`agent-tools`) · `agent-elements-main` (`tool-registry`) |
| H8 `EventStream` | `openstatus-main` (`status-feed`, `status-events`) · `langfuse-main` (`events/`) |
| H9 `TraceTimeline` | `agent-prism-main` (`SpanCard/`, `TraceViewer/`) |
| H10 `HealthMatrix` | `openstatus-main` (`status-component-group`) · `langfuse-main` (`monitors/`) |
| H11 `ModelUsage` | `langfuse-main` (`ModelUsageChart`) |
| H12 `CostMeter` | `langfuse-main` (`ModelCostTable`, `TotalMetric`) |
| H13 `MemoryLedger` | **nenhuma** — pesquisa registrada, ver acima |
| H14 `DependencyGraph` | `xyflow-main` · `langfuse-main` (`trace-graph-view/`) |
| H15 `InterAgentMessage` | `agents-kit-main` (`agent-orchestrator`, `agent-routing-hub`) |
| H16 `AutomationCard` | `langfuse-main` (`automations/`) · `activepieces-main` |

Agrupados por afinidade — cada grupo é um lote, porque compartilham estado e vocabulário.

> **A categoria "AI & Agents" entrou em 09/08/2026** — [ADR-0017](../decisions/0017-categoria-ai-agents.md).
> A taxonomia estava travada em 13 e nenhuma descrevia esta família; distribuí-la pelas existentes
> quebraria em cinco módulos o que o contrato declara como um só domínio. **É decisão, não
> dedução** — o §2 do `DIRECTION.md`, de onde a categoria saiu, se declara não-vinculante. Se o
> Victor preferir outro nome ou preferir distribuir, agora é barato: campo de JSON nas fichas.

**H.a — Identidade de agente**
- [x] **H1 — `AgentCard`** ✅ 09/08/2026
- [x] **H2 — `AgentStatus`** ✅ 09/08/2026
- [x] **H3 — `AgentInspector`** ✅ 09/08/2026

**H.b — Execução**
- [x] **H4 — `InvocationPanel`** ✅ 09/08/2026
- [x] **H5 — `TaskQueue`** ✅ 09/08/2026

**H.c — Governança da ação**
- [x] **H6 — `HumanApproval`** ✅ 09/08/2026
- [x] **H7 — `ToolPermission`** ✅ 09/08/2026

**H.d — Observação**
- [x] **H8 — `EventStream`** ✅ 09/08/2026
- [x] **H9 — `TraceTimeline`** ✅ 09/08/2026
- [x] **H10 — `HealthMatrix`** ✅ 09/08/2026

**H.e — Custo e memória**
- [x] **H11 — `ModelUsage`** ✅ 09/08/2026
- [x] **H12 — `CostMeter`** ✅ 09/08/2026
- [x] **H13 — `MemoryLedger`** ✅ 09/08/2026 — o caso sem referência, por pesquisa registrada

**H.f — Relação**
- [x] **H14 — `DependencyGraph`** ✅ 09/08/2026 — motor `@xyflow/react`, peer OPCIONAL em
      subpath próprio. A decisão foi reaberta pela medição e fechada pelo ALVO que o Victor
      nomeou: uma aplicação tipo n8n. Registro completo no [`REFERENCES.md`](REFERENCES.md).
- [x] **H15 — `InterAgentMessage`** ✅ 09/08/2026
- [x] **H16 — `AutomationCard`** ✅ 09/08/2026

**Fecha quando:** os 16 têm export, ficha completa, pele medida no `skin.spec` e página no
catálogo — e a lista `UniversalDomain` do contrato deixa de ter nome sem código.

> ✅ **FECHOU em 09/08/2026.** Os 16 têm export, ficha, pele medida e página **com prévia
> renderizada** — inclusive o `DependencyGraph`, que eu cheguei a declarar impossível em HTML
> estático antes de procurar o caminho de SSR do motor. Ele trouxe a **terceira dependência
> opcional** do repositório — `@xyflow/react`, em subpath próprio, autorizada pelo Victor.

---

## 12. Parte I — As composições de aplicação

Oito arquétipos existem no contrato como **descrição** e não como bloco montável. Não viram
dezenas de componentes novos: são **composições** sobre o que já existe, e é isso que as torna
baratas depois das partes F, G e H.

**Referência:** `media-chrome-main` para a de mídia; `kibo-main` (`gantt`, `kanban`, `tree`,
`editor`) para as de construção e recurso; `reui-main/components/blocks` para leitura de
composição.

- [x] **I1 — `RunSession`.** ✅ **10/08/2026.** As **seis regiões** do contrato montadas com o
      que já existia — zero componente novo, zero CSS novo, zero string nova. O que a barra
      oferece **sai da tabela de transições**, não de uma lista escrita ao lado dos botões: o
      bloco lê o `aurea.contract.json`. Ponto de retomada e recibo são regiões próprias, e o
      recibo **existe desde o aceite** — é assim que "interrupt does not erase receipt" vale por
      construção. Puxa H.b (`InvocationPanel`) e H.c (`HumanApproval`), e os três "esperando" da
      Parte J entram pelo eixo `state`.
- [x] **I2 — `ReviewCompare`.** ✅ **10/08/2026.** As **cinco regiões** do contrato com o que já
      existia — zero componente novo, zero CSS novo. A decisão **sai da tabela de transições**,
      como no I1, mas aqui sem excluir nada: o `ReviewCompare` **não tem região `actions`**, então
      `decision` é onde toda ação de pessoa mora. O recibo **nasce do `apply`** (ao contrário do
      I1, onde existe desde o aceite) e o `rollback` **aponta** para ele em vez de apagá-lo. E a
      diferença é marcada em **texto** — o `+`/`-` do diff unificado —, que é a única cláusula do
      contrato em que as duas referências reprovam.
- [x] **I3 — `ResourceWorkbench`.** ✅ **10/08/2026.** As **seis regiões** do contrato, e metade
      da parte já estava construída: a fila com progresso, soma de verificação e conflito é a
      **Parte G** inteira. Duas regiões não viram `role=group` porque já são marco nomeado — o
      `role=tree` do `TreeView` e o `role=table` do `Table`. A fila diz **fase e porcentagem em
      palavra**, com o número saindo de um lugar só para o texto e o `aria-valuenow` nunca
      discordarem. E a largura do bloco é **medida**, não escolhida: `.table` tem
      `min-width:720px`, e a primeira versão cortava a coluna `State` fora da tela.
- [x] **I4 — `AnalyticsWorkbench`.** ✅ **10/08/2026.** **Oito** regiões — o dobro do I2 — e a
      primeira composição da parte que vem de `applicationPatterns`. A tabela **não é aba**:
      medido, o Base UI não renderiza o painel inativo no HTML estático, então a alternativa
      deixaria de existir para quem depende dela. E é `DataGrid`, não `Table`, porque **duas de
      sete linhas é resumo, não alternativa**. Custou **duas mudanças de infraestrutura**,
      autorizadas pelo Victor: `--chart-h` no core (default 220px inalterado) e `prerender` para
      blocos no gerador — sem ele, gráfico dentro de composição sai caixa vazia, e o **I8 vai
      precisar do mesmo**.
- [x] **I5 — `TransactionFlow`.** ✅ **11/08/2026.** As **sete** regiões do contrato, e a primeira
      composição em que **nenhum estado tem todas** — `review` é o que se lê antes do commit,
      `receipt`/`reversal` só existem depois: as duas metades não coexistem porque a transação ou
      ainda não aconteceu ou já aconteceu. `settled` é o máximo (seis) e é o que a página publica.
      Também a primeira em que a busca por anatomia devolveu **uma** referência de dezesseis —
      então o item nasceu de **pesquisa registrada** (valor em inteiro, `Intl` com código de
      moeda, `Idempotency-Key`, PCI DSS 4.0.1), no caminho que o `MemoryLedger` abriu no H13. O
      total é **somado**, e a referência que existia mostra o preço disso: o `checkout` do MUI
      escreve o total à mão em **quatro** lugares. Zero componente novo, zero CSS novo.
- [x] **I6 — `DeviceControl`.** ✅ **11/08/2026.** As **sete** regiões, e `fleet` é o `HealthMatrix`
      que a Parte H construiu — zero componente novo, zero CSS novo. Primeiro contrato **sem estado
      terminal** (`terminalStates: []`): dispositivo não termina, então não há recibo como no I5 — o
      que persiste é o `audit`. A palavra "confidence" do contrato virou o vocabulário do domínio
      por **pesquisa** (OPC UA: **Good · Uncertain · Bad**), e pausado ou fora do ar a leitura
      congela a hora e cai para `Uncertain · last usable`, nunca `Good`. Teste provado contra
      **onze** defeitos — e dois deles acharam defeito MEU: uma trava que o próprio rótulo do botão
      satisfazia, e a calibração que escondia o default quando o equipamento caía, justo quando a
      cláusula diz *retains*.
- [x] **I7 — `MediaLibrary`.** ✅ **11/08/2026.** As **oito** regiões, e a primeira composição com um
      **componente de motor** dentro — o `MediaPlayer`, que tem estado próprio. Daí saíram as duas
      decisões do item: a região `actions` **não repete o transporte** (o mesmo botão em dois
      lugares são duas verdades sobre quem controla — a lição do I1), e a seleção é **uma só
      constante** que a galeria, o detalhe e o player leem, com teste comparando os três no DOM.
      A galeria é de `<button>` e não de `Card`, porque medido: `.card-interactive` tem
      `cursor:pointer` e `:hover` e **nada de foco**. Custou **uma mudança de infraestrutura
      autorizada** — `--media-h`/`--media-ar` no core, default inalterado —, e a referência
      explicou de graça por que o `aspect-ratio` existia: **CLS**. Teste provado contra **doze**
      defeitos.
- [x] **I8 — `VisualBuilder`.** ✅ **11/08/2026.** As **sete** regiões, com o `canvas` sendo o
      `DependencyGraph` do H14 — e **o `prerender` que o I4 previu NÃO foi necessário**: o H14 já
      tinha resolvido o SSR do grafo, e o starter dele sai estático sem nada. Previsão não é
      medição. O **outline é a alternativa sem arrastar** e sai da mesma fonte que o canvas (teste
      compara os dois, na ordem); mover é no outline, conectar é no inspector e acrescentar é na
      paleta, os três por teclado. Segredo aparece como **referência**, e o teste reprova até a
      máscara — valor mascarado continua no DOM. Teste provado contra **onze** defeitos.

**Fecha quando:** cada uma é um bloco no catálogo, com código copiável e teste da composição —
não um desenho de como ela seria.

### O que o I1 mudou do enunciado (10/08/2026)

**O bloco JÁ EXISTIA, e era um desenho — exatamente o que o "Fecha quando" recusa.** A medição do
passo 1 achou `Run session panel` em `content/blocks/insight.mjs`, escrito antes da Parte H:
`Card` + `Status` + `Progress` + `CodeBlock` + `Alert`. Cinco componentes, nenhuma das seis
regiões do contrato, nenhuma ação, nenhum recibo. **Ele foi reescrito no lugar, não duplicado** —
um segundo bloco chamado "Run session" seria o padrão paralelo que o protocolo proíbe, e trocar o
nome mudaria o slug da página por nada.

**A lista de ações é DERIVADA, e é o ponto do item.** O bloco importa
`aurea.contract.json` e calcula, por estado, as transições que partem dele e cuja ação é de
pessoa. Escrever "no estado X mostre Y" à mão seria a segunda fonte da verdade que o achado I1
desta auditoria pune — e o teste reprova quem trocar: uma lista à mão que discorde do contrato em
**um** estado derruba o gate.

**Dois buracos do CONTRATO, medidos e registrados em vez de tapados:** `fork` e `reject` estão em
`actions` e **não têm transição nenhuma** na tabela. Por isso o `fork` não aparece em estado algum
— inventar a transição dele dentro de um preview seria decidir o contrato num lugar onde ninguém
procura decisão. O `reject` existe na prática porque o `HumanApproval` o oferece, e é por isso que
`approve`/`reject` ficam fora da barra: o mesmo botão em dois lugares são duas verdades sobre quem
decide.

**O teste da composição foi provado contra QUATRO defeitos**, porque teste que só concorda com o
presente não é gate: lista de ações à mão discordando do contrato → reprova; recibo apagado ao
interromper → reprova; estado falando só por cor → reprova em **seis** dos nove estados, e os três
que sobram são os universais da Parte J, que tiram o texto do vocabulário — a prova de que o
reúso é real e não decoração; região de retomada removida → reprova.

**Um limite de ferramenta ficou registrado no código:** o bloco lê o contrato por `import … with
{type: "json"}` e não por `readFileSync(new URL(…, import.meta.url))`, porque sob o Vite —
que é quem roda o teste da composição — `import.meta.url` não é URL de arquivo e a leitura morre
com `The URL must be of scheme file`. O atributo funciona nos dois mundos.

### O que o I2 mudou do enunciado (10/08/2026)

**A medição do passo 1 respondeu "não existe" desta vez** — os oito blocos do catálogo eram Auth,
Forms, Collections, Feedback, Metrics, Marketing, Communication e Operations, e nenhum comparava
nada. Diferente do I1, aqui não havia desenho antigo para reescrever no lugar.

**O contrato mudou o desenho antes do primeiro edit, e a diferença em relação ao I1 é estrutural:
o `ReviewCompare` NÃO TEM região `actions`.** O `RunSession` tem `actions` separada, e foi por
isso que o I1 excluiu `approve`/`reject` da barra — quem os oferecia era o `HumanApproval`. Aqui
`decision` é a única casa de ação de pessoa, então a derivação não exclui nada, e o
`HumanApproval` **não entra**: ele oferece aprovar E negar no mesmo portão, e a tabela diz que os
dois nunca coexistem (`reject` parte de `previewing`, `approve` parte de `testing`). Usá-lo
publicaria uma saída que o contrato não permite naquele estado.

**O recibo aqui é o contrário do recibo do I1, e isso é o contrato falando.** Na execução ele
existe desde o aceite ("interrupt does not erase receipt"); na revisão ele **nasce do `apply`**
("apply records receipt"), porque antes disso não houve mutação — e recibo de coisa que não
aconteceu é pior que recibo ausente, porque parece prova. O `rollback` acrescenta a linha que
aponta para ele, que é o que "rollback targets the receipt" quer dizer.

**`applied` é o único dos nove estados em que as cinco regiões coexistem** — o apply já escreveu o
recibo e o rollback ainda parte dali. É o estado que a página publica, e é onde a prova de regiões
roda; qualquer outro publicaria a composição com uma região a menos.

**Uma ordem foi trocada de propósito, e o contrato não impede:** `test_result` vem **antes** de
`decision` no DOM. `regions` é lista, não sequência, e em `testing` as duas existem juntas — quem
tabula chegaria em "Approve" antes de ler o resultado dos testes. Decidir antes da evidência é
exatamente o que a cláusula *"test result is announced"* existe para evitar.

**O achado da leitura das referências é sobre ELAS, e está no [`REFERENCES.md`](REFERENCES.md):**
o `DiffViewer` do Langfuse e o exemplo de diff do Kibo marcam adição e remoção **só por cor** — o
primeiro pinta a linha, o segundo deixa o Shiki consumir o marcador e virar fundo. As duas
reprovam a cláusula *"diff has textual additions and deletions"* que o **nosso** contrato exige. A
saída custou zero: o `+`/`-` da primeira coluna do diff unificado é texto por construção.

**O resumo "2 added · 2 removed" é CONTADO do diff**, nunca escrito ao lado dele — número à mão ao
lado do dado que ele resume é o achado I1 desta auditoria em escala de duas linhas. O teste lê os
dois do DOM e compara.

**A conferência visual mediu, a medição mandou cortar duas vezes, e na segunda ela achou a régua
errada.** A caixa do demo tem altura fixa ([ADR-0002](../decisions/0002-altura-fixa-do-demo.md)), e o
que importa **não é a caixa**: é o `.demo-panel` dentro dela, porque a caixa gasta 53px com as
abas *Preview/Code* e o painel gasta 24px de `padding` de cada lado. No viewport onde o `clamp`
bate no piso (1440×761), a conta medida é: caixa 457 → painel 402 → **354 úteis**.

| Passo | Altura da composição | Vão |
|---|---:|---:|
| como nasceu (diff de 8 linhas, 2 seletores) | 477 | 354 |
| diff de 2 linhas, hunk sem contexto | 355 | 354 |
| recibo de duas linhas para uma | **326** | 354 |

O primeiro corte é o mesmo do I1: o `source` já diz **qual** arquivo, então repetir o seletor como
linha de contexto gastava a altura que falta para o recibo aparecer. O segundo é literalmente o
corte que o I1 fez no checkpoint — quem, quando e o quê cabem numa linha sem perder nenhum dos
três. **355 num vão de 354 não foi aceito**: margem de 1px cede na primeira máquina que rasterizar
a fonte um grão diferente.

**E a medição achou o mesmo defeito no I1 — corrigido aqui, com autorização do Victor.** O
registro do I1 diz "447px num vão de 457". O **447 está certo**; o **vão** é que não: 457 é a
caixa, e ela gasta 53px com as abas antes de o painel começar. Comparado contra os 354 reais, o
`block-run-session-panel` **rolava**, que é exatamente o que a
[ADR-0002](../decisions/0002-altura-fixa-do-demo.md) lista como consequência boa da altura fixa —
*"nenhuma demo exige rolagem"*. A pergunta obrigatória desta casa — **quem mais tem esse
problema?** — foi medida nos nove blocos: só os dois das composições. `stats-row` e
`members-table` dão 402 em 402.

O I1 foi de **447 para 347**, com dois cortes medidos: um turno em vez de dois — o do humano
repetia o que o cabeçalho já diz, e o do agente é a única frase que não está em outro lugar — e
o vão de `--space-3` para `--space-2`. **Os dois passos da ferramenta ficaram**: cortar um deles
economizava 25px e fazia `write_file` aparecer duas vezes, como título e como passo único.
A correção não é do I2, e está registrada como tal.

**Uma colisão de nome apareceu e vale o registro:** o módulo passou a hospedar duas composições, e
`ACAO`/`ESTADO` do I1 já existiam. Os do I2 levam sufixo `_REVIEW` — o prefixo é a informação, e a
partir da terceira cada uma traz o seu. Um arquivo por composição resolveria também, ao custo de
duplicar `regiao` e `between`, que é o padrão paralelo que o protocolo recusa.

**O teste foi provado contra SEIS defeitos**, porque teste que só concorda com o presente não é
gate:

| Defeito reintroduzido | Resultado |
|---|---|
| lista de ações à mão, discordando do contrato em `applied` | **reprova** |
| diff sem os marcadores `+`/`-` (só a cor distinguiria) | **reprova**, nomeando a causa |
| `rollback` apagando o recibo | **reprova** (2 testes) |
| recibo aparecendo em `previewing`, antes de qualquer mutação | **reprova** |
| resultado de teste num `<div>` com a pele do `Alert`, sem papel que anuncie | **reprova** em 3 |
| região `comparison` removida | **reprova** |

---

### O que o I3 mudou do enunciado (10/08/2026)

**O passo 1 respondeu "não existe" de novo** — os dez blocos não tinham nada de workbench. E
respondeu uma segunda coisa que mudou o tamanho do item: **metade da parte já estava
construída.** O enunciado pede "fila, verificação, conflito e restauração", e a fila com
progresso por item, soma SHA-256 conferida e conflito com três saídas é a **Parte G**, fechada em
09/08. O I3 não reconstruiu nada disso: compôs.

**O `restore` é o terceiro órfão do contrato, e agora dá para chamar de padrão.** Está em
`actions` e não tem transição nenhuma, então não aparece em estado algum — como o `fork` do I1.
Ele existe por dois outros caminhos (o comportamento *"restore keeps provenance"* e o evento
`resource.restored`), e é por isso que o que se cobra dele no teste é a **procedência sobreviver
a todos os oito estados**, não um botão que a tabela não autoriza.

**Duas regiões não viraram `role=group`**, e é a mesma escolha do I1 com o `MessageList`:
`source` é o `role=tree` do `TreeView` e `collection` é o `role=table` do `Table`. Marco dentro de
marco só acrescenta um nível para o leitor de tela atravessar.

**O número do progresso sai de um lugar só.** O `aria-valuenow` da barra e a frase ao lado dela
leem a mesma variável. Escrever "62" na barra e "62%" no texto à mão seriam duas verdades sobre o
mesmo envio — e aqui isso custaria a cláusula *"progress announces percent and phase"* junto, que
é o que separa uma barra que **desenha** de uma que **anuncia**.

#### A largura do bloco é medida, e a medição achou um defeito de verdade

**O core declara `.table { min-width:720px }`.** A primeira versão punha árvore e tabela em duas
colunas dentro dos 680px que os outros blocos usam; a coluna da tabela ficava com **445px**, e a
coluna `State` — que é onde o `Status` de cada recurso mora — saía **fora da tela, cortada**.
Nenhum gate viu: o `catalog-sweep` cobra rolagem lateral da PÁGINA, e aqui quem transbordava era
uma coluna dentro do painel. **Quem achou foi olhar a imagem.**

| Medida | Valor |
|---|---:|
| painel do demo | 904 |
| menos o `padding` | 856 |
| `.table { min-width }` | 720 |
| sobra para a árvore | **124** |

Daí saem as duas decisões: o bloco vai a **880** (`min(880px,100%)`, e o painel comporta) e a
coluna da árvore fica em **`7rem`** — 856 − 112 − 12 de vão = **732**, o primeiro valor acima dos
720. Com 140px a tabela ainda vazava 16px da própria coluna: invisível nesta largura, e é
exatamente o tipo de coisa que quebra na próxima.

**E o rótulo cedeu, porque não havia como os dois caberem.** `.tree-label` corta com reticências
(mesmo desenho do `.sidebar-label`), e num nó filho sobram 48px. `Typography` pede **73** e saía
`Typo…`. Alargar a coluna não era saída: os 137px que o rótulo inteiro pediria deixariam a tabela
**13px curta**. Virou `Type`. **A primeira medição disse "inteiro" para os três e estava errada**
— ela olhava o primeiro `<span>` do nó, que é o do glifo, e não o `.tree-label`. Quem desmentiu
foi a imagem do tema claro.

**Prévia e procedência ficaram lado a lado**, e a razão é medida: empilhadas, a composição dava
**365** num vão de **354** e o painel rolava. As duas falam do mesmo recurso selecionado — o que
ele é, e de onde veio —, então a segunda coluna não é economia disfarçada de desenho. Fechou em
**318**.

**O teste foi provado contra CINCO defeitos:**

| Defeito reintroduzido | Resultado |
|---|---|
| barra e texto discordando da porcentagem | **reprova** em 6 estados |
| lista de ações à mão, discordando do contrato em `conflict` | **reprova** |
| procedência sumindo em `completed` | **reprova** |
| conflito explicado na fila em vez de na prévia | **reprova** (2 testes) |
| `TreeView` sem `label` — a região `source` perde o nome | **reprova** |

### O que o I4 mudou do enunciado (10/08/2026)

**Este item não cabia, e isso foi medido antes do primeiro edit.** O `AnalyticsWorkbench` tem
**oito** regiões, e três delas são incompressíveis:

| Peça | Altura medida |
|---|---:|
| `.chart`, fixo em `220px` no core | 220 |
| `Table` (legenda + cabeçalho + 1 linha) | 117 |
| linha de indicadores | 112 |
| **só essas três** | **449** |
| vão útil do painel | **354** |

Faltavam **95px antes** das outras cinco regiões. Daí as duas mudanças de infraestrutura que o
Victor autorizou, e as duas são de raiz, não remendo do bloco:

1. **`--chart-h` no core**, com default `220px` **inalterado** — mesmo idioma do `--qr-size`
   (B6) e do `--datagrid-max-h` (F6): quem sabe quanta tela tem é quem hospeda, e altura não
   vira prop numérica (check 23). O fallback é o que o **check 29** exige de quem não declara o
   token, então a ausência é deliberada e está escrita.
2. **`prerender` para BLOCO no gerador.** Ele era indexado por nome de componente e só alcançava
   `componentPage`; o Recharts 3 monta por efeito, então um `Chart` dentro de bloco sairia
   **caixa vazia** — o defeito que o Lote 3 registrou uma camada abaixo, repetido acima e sem
   gate nenhum (o check 17 cobra que a entrada exista, não que ela desenhe). O `blocks` passou a
   ser carregado antes do PRERENDER e a chave é o `slug`. **O I8 `VisualBuilder` compõe o
   `DependencyGraph`, que tem o mesmo problema** — fazer uma vez agora era o caminho barato.

**Sete das oito ações não têm transição, e desta vez NÃO é buraco de contrato.** `change_range`,
`filter`, `segment`, `compare`, `drilldown`, `annotate` e `export` não movem estado nenhum
porque **mudar o período não muda o estado da tela: refaz a consulta.** É a natureza do padrão,
e é por isso que este é o único dos quatro contratos **sem região `actions`** — as regiões *são*
os controles. Sobra `refresh`, e ele mora com `time_range`, que é quem é dono da atualidade.

**Abas foram medidas e RECUSADAS, e o motivo não é de gosto:** o Base UI **não renderiza o
painel inativo** no HTML estático — medido em 10/08, o painel da tabela simplesmente não existe
no HTML. Uma alternativa tabular que não está no DOM não é alternativa para ninguém.

**E a tabela virou `DataGrid` pela mesma cláusula.** *"visualization always has a tabular
alternative"* — com `Table`, o que cabia no vão eram **2 das 7 linhas** do gráfico, ou seja um
**resumo**: quem não enxerga a curva ficaria com menos dado, que é o defeito inteiro. O
`DataGrid` põe as sete no DOM e limita a caixa com `--datagrid-max-h`, a válvula do F6, com o
cabeçalho fixo do mesmo item. `9rem` porque a célula mede `--row-h` (48px): 48 de cabeçalho mais
**duas linhas inteiras**. Com `7.5rem` a caixa cortava a segunda ao meio, e meia linha lê como
defeito e não como "há mais abaixo".

**O guarda do prerender mentiu pela TERCEIRA vez, e agora o padrão está claro.** `prerender:
true` prova `<svg`, e o botão de exportar tem `leadingIcon` — o guarda deu o desenho por pronto
com o ícone. Medido: `graficoDesenhou: false` **com o gate verde**. É o mesmo defeito do
`DependencyGraph` em 09/08 (o `<svg>` de fundo do React Flow) e do Lote 3 antes dele. A prova
virou `recharts-area`. **Gate de nome não é gate de efeito**, três vezes seguidas.

**Um estouro de 11px custou 39px de altura.** A faixa de controles somava 867 numa largura de
856 e o `Export` caía para a segunda linha. `"30 days"` virou `"30d"` — o mesmo rótulo que o
seletor de período usa três centímetros à esquerda.

**Dois dos sete estados são UNIVERSAIS**, e o teste prova o reúso byte a byte: a frase de
`partial` e `stale` tem de ser idêntica à que o `Status` publica sozinho. Com a frase escrita à
mão o gate mostra as **duas redações lado a lado** — `"Some data missing"` contra `"Some of this
could not be loaded."` —, que é exatamente a condição aparecendo com dois nomes que a
[ADR-0018](../decisions/0018-estados-universais-sao-um-eixo-a-parte.md) existe para fechar.

**Um achado FORA DO ESCOPO, registrado como tarefa própria:** o Base UI avisa
*"expected a non-`<button>` because the `nativeButton` prop is false"* ao renderizar no
**cliente**. Medido: `renderToStaticMarkup` não emite; só o caminho de cliente emite — ou seja,
ele atinge **quem instala**, não o catálogo, que é HTML estático sem hidratação.

> **CORREÇÃO (11/08/2026): o alcance que este parágrafo dizia — "17 pontos" — estava ERRADO. É
> UM.** A sessão que executou a tarefa mediu e desmentiu. O defeito era `Radio.Root` dentro do
> `SegmentedControl`, e só ele; a correção foi **uma palavra** em `inputs.tsx`. Fechado no commit
> `52395b8`, com a trava nova em `tests/unit/setup.ts` — que, por morar no setup compartilhado,
> transforma **os 438 testes** em detector em vez de criar um palco escrito à mão.
>
> **E o erro é de método, não de digitação, por isso fica escrito.** Eu contei OCORRÊNCIA DE
> SINTAXE no nosso fonte; o que define o defeito mora no MOTOR — quais partes do Base UI trazem
> `nativeButton = false` por default. A medição certa vem pelos dois lados e foi essa que a
> tarefa fez: **9** partes do motor com o default `false`, **3** usadas pela Aurea, **1** com
> `render` de `<button>`. Mais um coletor de `console.error` na suíte inteira — 2 ocorrências,
> as duas do mesmo componente, e **zero** depois da correção. Três ângulos independentes contra
> um `grep` que eu nem conferi contra a própria saída: ela trazia `render={<Button`,
> `render={<IconButton` e `render={<strong/>}`, que o padrão que eu escrevi não casa.
>
> É a primeira regra do `CLAUDE.md` me pegando: **medir, não contar** — e "comando reprodutível
> atrás" só vale se alguém LER o que o comando devolveu.

**Fechou em 334 num vão de 354.** O teste foi provado contra **cinco** defeitos:

| Defeito reintroduzido | Resultado |
|---|---|
| tabela com 2 das 7 linhas (resumo no lugar da alternativa) | **reprova**, nomeando a contagem |
| frase universal escrita à mão no bloco | **reprova**, mostrando as duas redações |
| `refresh` oferecido em `error`, que a tabela não permite | **reprova** |
| rótulo de exportar sem escopo nem atualidade | **reprova** |
| recado com a pele do `Alert` e sem papel que anuncie | **reprova** em 4 estados |

### O que o I5 mudou do enunciado (11/08/2026)

**O passo 1 respondeu "não existe" — e o passo 2 eu fiz ERRADO na primeira vez.** Nos onze blocos
do catálogo não havia nada de transação, isso estava certo. Mas a busca por referência eu fiz por
**nome de pasta** (`checkout|payment|invoice|billing|transaction|cart`) e conclui que havia **uma**
anatomia em dezesseis. O Victor perguntou se eu estava usando as referências; refiz a busca por
**conteúdo** (`grep` de `subtotal`, `idempotenc`, e nome de arquivo com
`receipt|order-summary|refund|price|amount`) e apareceu o `order-summary` do **tool-ui** — 296
linhas mais um esquema Zod de 108, e a melhor das duas. São **duas** de dezesseis, não uma.

**A lição de método, e ela vale para os itens I6 a I8:** busca de referência é `grep` de CONTEÚDO,
não `find` de diretório. Pasta tem o nome que o autor escolheu; o conteúdo tem as palavras do
domínio. O passo 2 do `BUILDING.md` avisa que *nome igual não é componente igual* — aqui foi o
inverso, e a peneira de diretório não vê.

**O que a leitura tardia trouxe: UMA correção que entrou e uma que a medição matou.** Entrou
quantidade × unitário separados, com o total da linha derivado e gateado (`2 × USD 24.00` →
`USD 48.00`) — isso é anatomia. **Não entrou o `tabular-nums`**, e a rejeição é o registro que
vale: eu o havia copiado da referência e ia pedir ao Victor a correção de raiz em `.data-list dd`.
Ele perguntou se era a melhor opção para um produto de extrema qualidade; medi as larguras dos dez
dígitos no navegador e a resposta é **não** — no **IBM Plex Sans** e no **Segoe UI** a propriedade
é **no-op** (uma largura com e sem ela), no `sans-serif` genérico ajudaria só no terceiro fallback,
e no **IBM Plex Serif** ela nem funciona (a fonte não tem o recurso). Ou seja: eu ia pedir
autorização para pôr no core uma regra que **não muda um pixel** — que é exatamente o que o
`skin.spec` existe para reprovar. E o defeito que eu tinha visto na imagem nunca era esse: o degrau
de 74px era o `max-content` de duas `.data-list` independentes, já resolvido pelas faixas.
`font-variant-numeric` é **tipografia**, a primeira coisa que o `BUILDING.md` §1 lista entre as que
nunca se extraem de referência. A trava existia e eu passei por cima dela. Números e fontes no
[`REFERENCES.md`](REFERENCES.md).

**E uma confirmação independente que vale registrar:** o esquema Zod do `order-summary` tem
`variant: "summary" | "receipt"`, onde `receipt` **exige** a decisão registrada e `summary` a
**proíbe**. É a mesma divisão que eu havia medido nas regiões do nosso contrato — antes do commit
existe revisão, depois existe recibo, e as duas não coexistem. Cheguei nela pelo contrato; a
referência a impõe por tipo.

**Então o item nasceu de PESQUISA, e é a segunda vez que isso acontece de propósito** — a
primeira foi o `MemoryLedger` no H13. Quatro coisas pesquisadas antes do primeiro edit, porque
envolve dinheiro e o passo 4 do `BUILDING.md` manda parar:

| O que | O que a pesquisa disse | O que virou código |
|---|---|---|
| representação do valor | `Decimal` do TC39 em **stage 1**, `Amount` em stage 2 — não há decimal nativo em 08/2026 | centavo **inteiro**; soma em inteiro, divisão por 100 só ao formatar |
| formatação | `Intl.NumberFormat` é o caminho, e `$` é ambíguo entre quatro moedas | `currencyDisplay:"code"` — "USD 199.74", a moeda em cada linha |
| idempotência | `Idempotency-Key` é prática de mercado e **rascunho** IETF (draft-07, não é RFC) | o nome do cabeçalho, no recibo |
| segredo financeiro | PCI DSS 4.0.1 tira a página do escopo quando o campo é do provedor | `payment` é REFERÊNCIA; **zero** `input` na composição, e há gate |

**A referência que existia mostrou o preço de não somar.** O `checkout` do MUI escreve o total à
mão em **quatro** lugares — quatro preços literais no `Info`, três valores no `Review` e o total
outra vez no `Checkout`, com um ternário (`activeStep >= 2 ? '$144.97' : '$134.98'`). Os números
**batem hoje**: 15 + 69,99 + 49,99 = 134,98, mais 9,99 = 144,97. Mudar o preço de um item faz o
total mentir em dois arquivos e nenhum teste vê. É o achado **I1** desta auditoria com dinheiro em
cima, e é por isso que aqui o total é `SUBTOTAL + soma(TAXAS)` e o teste compara o DOM contra a
conta, nos nove estados.

**Nenhum estado tem as sete regiões, e isso é medição — não desculpa.** `review` é o que se lê
antes do commit; `receipt` e `reversal` só existem depois dele. As duas metades não coexistem em
estado nenhum, porque a transação ou ainda não aconteceu ou já aconteceu. Contado por estado:
`settled`, `refunded` e `disputed` dão **seis**; `draft`, `pending` e `requires_action` dão cinco;
`processing` dá cinco; `failed` e `cancelled` dão cinco. A página publica `settled` — o máximo, e
o único terminal em que ainda há ação de pessoa (o estorno parte dali). O teste cobra as seis ali
**e** a sétima no estado em que ela existe, com a ausência das outras duas.

**As ações moram na REGIÃO QUE ELAS AFETAM, porque este contrato não tem região `actions`** — é o
segundo assim, depois do I4. `refund` fica em `reversal`; `cancel` e `authorize` em `review`, ao
lado da frase que diz a consequência. O arame de tropeço é a **soma** dos botões das duas barras
contra a derivação: ação nova no contrato que não caiba em nenhuma das duas reprova, em vez de
desaparecer da tela em silêncio.

**Um universal entrou pelo CONCEITO e não pelo nome, e é a primeira vez.** `requires_action` é
literalmente "espera que alguém aja" — o passo que o banco emissor devolve —, que é o
`waiting_user` do vocabulário da Parte J. No I1 os três "esperando" tinham o nome idêntico ao do
contrato; aqui o nome difere e o conceito é o mesmo. Escrever "Requires action" ao lado daria dois
textos para a mesma condição, que é o defeito que a [ADR-0018](../decisions/0018-estados-universais-sao-um-eixo-a-parte.md)
existe para fechar. O teste compara a frase do bloco com a que o `Status` publica sozinho.

**O quarto buraco de contrato, e agora nos dois sentidos de uma vez:** `create`, `review` e
`reconcile` estão em `actions` e não têm transição nenhuma (como o `fork` do I1, o `resolve` do I2
e o `restore` do I3); `submit`, `process`, `settle`, `fail` e `dispute` são transição **sem** estar
em `actions`. A segunda metade não é descuido do contrato — é a verdade do domínio: quem liquida é
o adquirente, quem recusa é a rede, e quem contesta é o titular pelo emissor. Nunca esta tela.

**O `Status` NÃO é live region, e a cláusula pedia uma.** Medido no fonte: é um
`<span class="status">` com ponto e rótulo. *"status updates use live regions"* se cumpre com o
`Alert` (`role="status"`, e `role="alert"` sozinho quando é `danger`), no mesmo desenho que o I4
usou. Os dois convivem porque respondem a perguntas diferentes — em que estado ESTÁ × o que
acabou de acontecer. `draft` não anuncia, e o critério sai do contrato: é o `initialState`, onde
nada aconteceu.

**Fechou em 293 num vão de 354 — e duas correções vieram de OLHAR a imagem, não de medir.** A
medição dava verde nas duas:

| O que a imagem mostrou | Correção |
|---|---|
| `items` e `amounts` empilhadas são duas `.data-list` independentes, cada uma com a coluna de termo em `max-content`: os valores saíam com **74px** de degrau, e uma pilha de dinheiro desalinhada lê como defeito | duas **faixas** de duas colunas, em vez de duas colunas de duas listas. Custa um vão de `--space-2`; a alternativa seria `subgrid` no `.data-list` do core, que é infraestrutura para todos |
| a região `reversal` em `settled` era uma barra com um botão e **nenhuma palavra** | a frase que diz o que o estorno faz — e ela já cita o recibo que a reversão preserva |
| "Visa ending 4242 · saved with the provider" quebrava em duas linhas e desalinhava a faixa | dois termos curtos, e o segundo é a regra dita como dado: `Stored by · Payment provider` |

**O teste foi provado contra OITO defeitos**, o maior número da parte até aqui, porque cada
cláusula de dinheiro precisa do seu:

| Defeito reintroduzido | Resultado |
|---|---|
| total escrito à mão, discordando da soma dos itens | **reprova** |
| derivação que para de filtrar por ação de pessoa (ações do sistema na barra) | **reprova** em 4 |
| recibo apagado num resultado terminal | **reprova** |
| reversão que apaga o recibo original em vez de apontar para ele | **reprova** |
| anúncio num `<div>` com a pele do `Alert`, sem papel que anuncie | **reprova** |
| campo de dado financeiro na composição (o que o PCI DSS tira daqui) | **reprova** |
| frase do estado universal escrita à mão no bloco | **reprova** |
| região do contrato removida da composição | **reprova** |

**Um achado de conteúdo, fora do escopo e registrado como tarefa:**
`patterns/commerce_finance.md` descreve este padrão com `.flow-panel`, `.flow-summary` e
`.flow-total`. Medido: **as três não existem no core**. A receita descreve uma pele que nunca foi
construída — e não há gate para isso, porque o check 15 pega o contrário (classe no core que
ninguém produz). A composição do I5 não usa nenhuma das três.

## 13. Parte J — Os estados universais

O contrato descreve estados que **nenhum componente da Aurea sabe representar hoje**: esperando
pessoa, esperando aprovação, sem conexão, dado velho, resultado parcial e funcionamento
degradado.

São transversais. Sem eles, cada aplicação inventa o seu — e aí a mesma condição aparece de seis
jeitos diferentes na mesma tela.

- [x] **J1 — Vocabulário e tokens.** ✅ **09/08/2026 — e são SETE, não seis.** A união
      `UniversalState` e a tabela de frases moram no `pure.tsx`, que é módulo **sem diretiva**:
      componente de servidor lê o vocabulário sem puxar cliente. **Token novo: nenhum**, e não foi
      economia — ver o rodapé. [ADR-0018](../decisions/0018-estados-universais-sao-um-eixo-a-parte.md).
- [x] **J2 — Aplicar em quem precisa:** `Status`, `Alert`, `Banner`, `EmptyState`, `DataGrid`.
      ✅ **09/08/2026.** Uma prop com o mesmo nome nos cinco (`state`), um marcador só no DOM
      (`data-state`, que já era o idioma da casa) e **zero CSS novo** — 61/61 sem mover um pixel.
      As composições da Parte I herdam o vocabulário quando existirem.
- [x] **J3 — Trava.** ✅ **09/08/2026.** **Check 30**, nos dois sentidos, com a lista **lida** do
      `pure.tsx` em vez de copiada. Provado contra o defeito nas duas direções — e a primeira
      versão da regra nasceu forte demais e o próprio gate a desmentiu na estreia.

**Fecha quando:** os seis estados têm representação única e testada. ✅ **FECHOU em 09/08/2026** —
com **sete**, pelo motivo do rodapé.

### O que a execução mudou do enunciado (09/08/2026)

**Eram SETE, e o sétimo é do contrato.** Os estados estão descritos em **três listas que não
concordam** — `applicationPatterns.states` (16 nomes), `operationalPatterns.states` (9) e
`AppShell.states` (5). Os seis do plano foram colhidos das três e deixaram `waiting_dependency`
de fora, que está colado nos outros dois "esperando". Nomear dois dos três deixa o terceiro para
cada aplicação inventar, que é o defeito inteiro.

**"Nenhum componente sabe representar hoje" estava parcialmente vencido, e isso mudou o trabalho
de INVENTAR para RECONCILIAR.** Medido antes do primeiro edit: `offline` já era `StatusVariant`
com pele própria desde sempre (ponto vazado, `aurea.css:391`), e `stale`/`partial` já eram o
`state` do `DataGrid` desde a Parte F. **Nada foi renomeado** — os nomes já eram os do contrato.

**`state` virou EIXO, não valor de `variant`,** e é a decisão que a parte inteira apoia: `variant`
é gravidade, `state` é condição. Fundir os dois poria "obsoleto" ao lado de "perigo" e obrigaria
quem chama a escolher um. [ADR-0018](../decisions/0018-estados-universais-sao-um-eixo-a-parte.md).

**NENHUM token novo, e "com token e regra" do enunciado não se cumpriu por medição.** Quinta
recusa de cor por categoria neste repositório: `--warning-400` **é** `var(--brand-yellow)` no
tema escuro (medido no `CostMeter` em 09/08), então um degrau "de aviso" sairia idêntico ao
normal. O sentido ficou no texto, a cor que sobra é a que já existia — e nenhum dos sete chega a
`danger`, porque **nos sete a tela ainda serve**.

**Três defeitos, e nenhum foi achado por leitura:**

1. **O check 11 leu `UNIVERSAL_STATES` como um componente chamado `UNIVERSAL`** — a regex dele
   casa `export const [A-Z]…` e para no `_`. Os outros exports do módulo são camelCase; o
   SCREAMING_CASE era hábito importado, não idioma da casa. Virou `universalStates`.
2. **A trava nasceu forte demais e o gate me desmentiu na estreia:** ela exigia a união de quem
   declarasse um estado universal, e reprovou o `HealthMatrix` — que traz `degraded` entre os
   cinco valores de **saúde**. Medido nas 92 fichas, ele é o único, e estava certo. Carregar o
   estado e enumerar a palavra são relações diferentes; o que as duas devem ter em comum é o
   marcador no DOM, e é isso que se cobra. **Corrigir o componente para caber na trava teria sido
   a trava mandando no sistema.**
3. **O `DataGrid` marcava o RECADO e não a si mesmo** — quem está obsoleto é a tabela, e o `Alert`
   é só como ela conta isso. Com `state="loading"` não há `Alert` nenhum, então o estado não
   chegava ao DOM por lugar algum. Achado pelo check 30 na primeira execução, corrigido na raiz, e
   com o teste que reprova se o marcador voltar para o recado.

---

## 14. Parte K — Prova de plataforma e a `1.0`

- [x] **K1 — Firefox e WebKit.** ✅ **MARCADO em 11/08/2026, por ordem do Victor.** O
      `playwright.config.ts` tem os três motores (61 → **131 testes**); o **WebKit passou** em
      09/08 e a passagem por ele achou uma barreira de teclado real na biblioteca (rodapé desta
      seção); o **Firefox rodou e passou no contêiner** oficial do Playwright em 11/08 — o mesmo
      contêiner das baselines `-linux`. Ficou desmarcado dois dias porque item que nunca rodou não
      se marca; rodou. ~~Nesta máquina Windows o Firefox segue não iniciando~~
      ~~(`browserType.launch: spawn UNKNOWN`)~~ — ~35 falhas de ambiente numa execução dos três
      motores, e é esperado: a verificação dele é no contêiner. Decisões em
      ⚠️ **VENCEU em 20/08/2026:** os três motores rodaram nesta máquina Windows —
      `pnpm test:visual` = **167 passaram, 0 falharam** em 26,5 min, Firefox incluído.
      [ADR-0019](../decisions/0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md).
- [ ] **K2 — Publicador confiável** nos seis pacotes. ⏸ **ADIADO SEM DATA em 12/08/2026** —
      [ADR-0021](../decisions/0021-o-publicador-confiavel-fica-adiado.md), decisão do Victor. **Fica
      desmarcado de propósito:** não foi feito, e aqui o checkbox é o estado. O que mudou é que ele
      deixou de ser dívida e passou a ser item esperando **motivo**. A evidência nova: o projeto
      publicou **duas vezes à mão**, de minutos cada, com a CI parada por um mês — e a ADR-0013
      rejeitou o token pelas razões certas mas não listou a saída de **não automatizar**, que é a
      única em que não existe segredo para vazar. Volta a valer por **frequência ou mãos** (mais de
      ~1 publish/mês, ou mais de um mantenedor), nunca por data. **Não bloqueia a `1.0`** — medido
      duas vezes: a `0.1.0` e a `0.2.0` saíram sem ele.
- [x] **K3 — Changelog de verdade**, com as quebras de API das partes B e F escritas.
      ✅ **11/08/2026.** E o enunciado estava **estreito**: as quebras não eram duas, eram **cinco**,
      e duas delas não estão em parte nenhuma do plano — são de CSS. Nasce o **check 31**, porque
      changelog sem gate apodrece igual a número escrito à mão. Rodapé da seção.
- [ ] **K4 — Publicar a `1.0`.** ⚠️ **NÃO REESCREVA ESTE ITEM COMO "FALTA CONSUMIDOR REAL".**
      Falta a DECISÃO do Victor de publicar, e mais nada do nosso lado.

      **A pergunta do consumidor está DECIDIDA e não se reabre** — a
      [ADR-0022](../decisions/0022-consumidor-real-e-projeto-do-victor.md), de 13/08/2026, diz que o
      projeto do Victor **É** o consumidor real, citando ele: *"a Aurea foi criada excepcionalmente
      para mim mesmo, para meus projetos pessoais"*. Consumidor de terceiro foi rejeitado na mesma
      ADR. O `04-PROTOCOLO-IA.md` já tinha aviso em caixa alta sobre isto porque a dúvida foi
      levantada **três vezes** depois de decidida — e em 20/08/2026 eu levantei a **quarta**, lendo
      a redação antiga DESTE item. Por isso ela morreu aqui: o texto era a fonte da recaída.

      **As três lacunas que estavam do NOSSO lado fecharam, e isso se mede:**
      1. ~~Navegação inferior~~ — `BottomNav`, 17/08/2026; refeito em 20/08 sobre a auditoria de
         UI/UX (dois eixos, sete indicadores, medidas do Material 3).
      2. ~~`Toast` em React~~ — nunca faltou: `useToast()` no `system.tsx`, achado em 16/08.
      3. ~~Linha de lista tocável~~ — `NavList` / `.nav-list-row`, em
         `packages/react/src/navigation-client.tsx`. **Medido, não lembrado.**

      **E a instalabilidade está provada contra defeito:** `node scripts/check-published.mjs`
      instala os pacotes **do registro** numa pasta limpa fora do repositório e constrói nos dois
      lados da fronteira servidor/cliente. Rodado em 20/08/2026 na `0.3.0`: **OK**. A `0.1.0`
      reprova nele em três camadas — export ausente, `TS2882` e `createContext is not a function`.

      **O que sobra é só isto:** publicar a `1.0`. É chamada do Victor, não gate nosso.
- [x] **K5 — Publicar a `0.2.0`.** ✅ **12/08/2026.** Os seis pacotes estão no npm em `0.2.0`,
      medido no registro (`npm view <pacote> version`), não na tela. Item nascido em 11/08 da
      medição do K3 e decidido na
      [ADR-0020](../decisions/0020-a-proxima-versao-e-0-2-0-nao-1-0.md): havia **cinco quebras de API**
      e cinco defeitos corrigidos parados aqui, e o que estava no npm **não instalava** num framework
      de componentes de servidor. As três coisas que a ADR manda acontecer **juntas** aconteceram
      **no mesmo commit** (`450d8df`) — e o rodapé explica por que não havia alternativa.

**Fecha quando:** a `1.0` está no npm e a [ADR-0015](../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md)
passa a `superada`.

### O que o K1 já pagou, e o que ele abriu (09/08/2026)

**A troca de motor achou uma BARREIRA DE TECLADO na biblioteca**, e ela estava lá desde a Fase 8.
A gaveta de navegação do `AppShell` confiava inteiramente no popover nativo para o foco, e o
`layout.tsx` afirmava por escrito que *"o navegador entrega … a volta do foco"*. Entregava — num
motor só. Medido no WebKit, abrindo a gaveta e dando oito Tabs:

| | Chromium | WebKit |
|---|---|---|
| foco ao abrir | fica no disparador | vai para o `<body>` |
| Tab entra na gaveta | sim, no primeiro | **nenhum dos oito** |
| Escape devolve o foco | sim | não |

No Safari, quem navega por teclado abria a navegação e não conseguia alcançá-la. **Corrigido:** o
shell passou a mover o foco para o primeiro item ao abrir e devolvê-lo ao disparador ao fechar,
igual nos três motores — cinco linhas no `aurea.js` do core e as mesmas no `AppShell`, porque são
dois runtimes. O custo está declarado na ADR: o shell deixou de ser "sem uma linha de JS".

**E ficou uma lacuna, que era decisão de desenho e não conserto — DECIDIDA em 10/08/2026:** no
WebKit o Tab escapa do popover a partir de **qualquer** elemento de dentro, porque o motor não põe
conteúdo de popover na navegação sequencial do documento. Fechar isso exigiria prender o foco
enquanto a gaveta está aberta, ou seja, torná-la **modal**. **O Victor decidiu que continua
não-modal** ([ADR-0019](../decisions/0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md), Decisão
3): deixa de ser pendência e passa a ser limite declarado, escrito no `shell-nav.spec` ao lado da
asserção que deliberadamente não existe. O que está garantido nos três motores é: abriu, o foco
está dentro; fechou, o foco voltou.

**Um defeito de build foi corrigido de passagem, e ele bloqueava tudo:** o prerender do catálogo
apostava `setTimeout(120)` para o motor de gráfico medir e desenhar dentro do jsdom. A margem foi
corroída em silêncio conforme o catálogo cresceu, e em 09/08 o `Chart` reprovava em cinco
execuções seguidas. Virou **espera pela prova**, com teto — o gate continua sendo o `if` que exige
o desenho, e foi provado contra o defeito.

### O que o K3 mudou do enunciado (11/08/2026)

**O enunciado estava estreito, e a medição disse em quanto.** Ele pedia "as quebras de API das
partes B e F". Medido de `a0dd056` (o commit do publish, 31/07 08:32) até `HEAD` — **99 commits**:

| Eixo | 0.1.0 | HEAD | Quebra? |
|---|---:|---:|---|
| componentes com ficha | 65 | **92** | não — 27 entraram, **zero** saiu |
| nomes exportados pelo `react` | 106 | **176** | não — **zero** removido |
| props em componente preexistente | — | **+39** | não — **zero** removida |
| tokens (nomes distintos) | 174 | **175** | não — 0 removidos, **0 valores mudados** |
| classes no CSS do core | 260 | **378** | **sim** — 14 removidas |
| regras de ELEMENTO no core | 14 | **9** | **sim** — as 5 de tabela |
| bytes do `aurea.css` | 73.066 | **112.040** | — |

**A Parte F não quebrou nada**, e o enunciado supunha que sim. O F1 entregou modo controlado
mantendo o interno como default — "nenhuma chamada existente mudou" era verdade literal. O que
parecia quebra dela é o `FileEntry`, que é da Parte G, e **também não é** (abaixo).

**As duas quebras que o plano não previa são de CSS, e a maior delas é a que mais dói.** Na `0.1.0`
o `@aurea-uds/core/css` publicava **cinco regras sem classe** — `table`, `th`, `td`,
`tr:last-child td`, `tbody tr:hover` — que alcançavam **toda `<table>` do documento do consumidor**,
inclusive a dele. Foram escopadas em 02/08 (`2a89958`) e ninguém escreveu nota, porque não havia
onde: nenhuma parte do `PLANO-1.0` cobre CSS do core. A outra são **14 classes removidas**, nenhuma
emitida por componente — inclusive `.accordion-item`, `.accordion-panel` e `.accordion-trigger`,
que o `Accordion` **nunca** usou (ele emite `.accordion`/`.accordion-content` em `<details>`).

**O `FileEntry` parecia quebra e não é — e é por isso que a verificação adversarial existe.** A
primeira medição acusou `id: number → string`, `status?` e `progress?` virando obrigatórios: livro
inteiro de quebra. Conferido: `FileEntry` **nunca foi exportado**, nas duas revisões. O tipo público
é o `FileQueueItem`, que é **novo**. Uma nota de quebra falsa custa mais que uma ausente, porque
manda o consumidor mexer no que está certo.

**O item de maior valor do changelog não é quebra nenhuma:** é que o pacote passou a funcionar em
componente de servidor. Na `0.1.0`, um `import {Button}` dentro de RSC **quebrava na hora** — é o
defeito que abre a Parte A. O changelog anterior citava a correção do `TS2882` e **não** citava
esta, que é a que impedia instalar em Next.js.

**Duas correções no que já estava escrito, e as duas eram imprecisão minha de 06/08:**

1. Dizia "`Avatar.size` **e** `AvatarGroup.size` deixaram de ser número". O `AvatarGroup` **não
   existia na `0.1.0`** — entrou no Lote 2, depois do publish, e nunca saiu com número. Não há o que
   migrar nele.
2. Dizia "nada muda de tamanho em densidade `comfortable`: `md` é o mesmo `2.25rem` = `36px` de
   antes". **Muda.** O default antigo era `size={40}` e virava `style` inline, que vencia o CSS — o
   avatar renderizado ia a **40px**. O novo default `"md"` dá `--control-h-md` = **36px**. Um
   `<Avatar />` sem prop **encolhe 4px**. A frase comparava o que o core declarava, não o que a tela
   mostrava; quem lê changelog quer a segunda.

**O idioma virou inglês, por decisão do Victor, e a medição sustentou a pergunta:** o
`CHANGELOG.md` **não vai em tarball nenhum** — nenhum dos seis pacotes o lista em `files` —, mas
está ao lado de um `README.md` que já está em inglês, e é o segundo arquivo que um visitante lê.
As 127 linhas que existiam foram traduzidas no mesmo passo, senão ficava metade em cada idioma.

**Nasce o check 31, e ele existe porque este defeito é o I1 outra vez.** Entre 31/07 e 11/08
entraram 27 componentes, 3 subpaths, 3 peers opcionais e 39 props, e o changelog citava **três**
quebras e mais nada. Nenhum gate olhava, porque nenhum gate lia nota de release. A regra: componente
que existe hoje e não estava na superfície publicada tem de aparecer **pelo nome** no corpo do
`[Unreleased]`. O congelado é `scripts/released-surface.json`, tirado de
`git show a0dd056:manifest.json` — que é **gerado** e gateado pelo check 20, então a lista é medida,
não digitada.

Provado contra **quatro** defeitos, e dois deles são defeitos do próprio gate:

| Injúria | Resultado |
|---|---|
| apagar `TaskQueue` do changelog | **reprova**, nomeando o que falta |
| apagar `ChartLegend` deixando `Chart` | **reprova** — `\b` casaria por dentro; a borda é "não pode ser parte de um nome" |
| citar `Spinner` só na seção da `0.1.0` | **reprova** — nome em versão publicada não documenta a mudança de agora |
| pôr os pacotes em `1.0.0` sem seção `## [1.0.0]` | **reprova** — é a armadilha do **K4** |

**Limite declarado, escrito no próprio arquivo:** o check 31 cobra **componente**, que é o eixo mais
grosso e o mais barato. Não cobra prop nova, token novo, subpath novo nem classe removida — um
changelog passa nele e ainda pode estar incompleto. Cobrir prop exigiria diff de assinatura contra o
commit do release, e o validador **não lê git de propósito** (roda em tarball).

**E o arquivo congelado não se regera por sessão.** Ele é marco de RELEASE: regerar fora de uma
publicação apaga a dívida em vez de cobrá-la. Está escrito no `_como_regerar`.

**Duas lições de método, e as duas são reincidência desta casa:**

1. **Minha medição leu COMENTÁRIO como código** — a regex de classe casou o texto de um comentário
   e inflou a contagem, e a de diretiva deu `"use client"` por presente no barril porque o
   comentário dele diz *"SEM `use client`"*. **Quarta vez** neste repositório (check 12 em 02/08,
   check 23 em 06/08, check 12 do lado do pixel cru em 02/08). Corrigido antes de qualquer número
   entrar no arquivo.
2. **Eu copiei um número do plano em vez de medir.** Escrevi "19 dos 22 módulos com a diretiva",
   que é o número do rodapé da Parte A — de 06/08, antes de `agents.tsx` e `graph.tsx` existirem.
   Medido agora: **21 de 24**. Mesma falha do "semanas" no E14: número que vai para documento deste
   projeto tem comando atrás, inclusive quando o documento é deste projeto.

**O que a leitura achou e NÃO virou entrada, de propósito:** 43 das 65 fichas preexistentes
ganharam `props` depois da `0.1.0` (22 já tinham). Contar isso como API nova infla o changelog em
quatro vezes — a prop existia no TypeScript e passou a estar **documentada**. As 39 props novas
saíram de diff de **assinatura de função**, não de ficha.

### O que o K5 mudou do enunciado (12/08/2026)

**A ADR-0020 dizia "três coisas acontecem juntas" e não dizia que era obrigatório. É — e a medição
mostrou em que sentido.** Não existe ordem em que os três passos caibam em commits separados sem um
commit **vermelho** no meio:

| Estado intermediário | O que o check 31 faz |
|---|---|
| pacotes em `0.2.0`, `released-surface.json` em `0.1.0`, `[Unreleased]` virou `[0.2.0]` | **reprova**, nomeando os 27 componentes que o `[Unreleased]` deixou de citar |
| o mesmo, sem seção `## [Unreleased]` nenhuma | **reprova** pelo outro braço da regra |
| só o `released-surface.json` regerado, antes do bump | apaga a dívida em vez de cobrá-la — é o que o `_como_regerar` proíbe |

Os três entraram no commit `450d8df`, e a reprovação do meio foi **executada**, não deduzida: o
validador foi rodado com o bump aplicado e a superfície velha, e listou os 27 nomes.

**E a receita da ADR tem um laço que só aparece ao executá-la.** Ela manda regerar o
`released-surface.json` de `git show <commit-do-publish>:manifest.json` — mas o arquivo mora **dentro**
do commit do publish, então o hash não existe enquanto ele está sendo escrito. Resolvido sem hash
falso: o campo `commit` foi commitado com a palavra `PENDENTE` e a explicação no lugar do valor, e o
hash entrou no commit seguinte. A alternativa era `--amend`, que reescreve o commit que acabou de ser
publicado.

**Não eram seis arquivos de versão, eram oito.** Além dos seis `package.json`, a raiz do workspace
(privada, mas ela acompanhou a `0.1.0` — medido em `git show a0dd056:package.json`) e o
`packages/contracts/aurea.contract.json`. Medido também que **nenhum dos seis depende de outro**,
então não havia faixa de versão interna para acertar.

**O achado de gate foi fechado depois do publish pelo check 32.** A política de versionar em bloco
é da [ADR-0014](../decisions/0014-primeira-versao-publica-0-1-0.md), de 31/07/2026, e o "Como isso é
obrigado" dela já afirmava que "divergir entre pacotes reprova" — só que não reprovava: o check 31
lia apenas `packages/react/package.json` e o manifesto aceitava versões independentes. Uma ADR
descrevendo um gate que não existia é o mesmo defeito que o A12 e o AUD-0001, um nível acima.
Agora a raiz, os pacotes públicos descobertos por `publishConfig.access=public` e
`packages/contracts/aurea.contract.json` precisam declarar o mesmo número. A prova representativa
alterou a versão de um pacote público, e o validador nomeou os dois grupos divergentes; o laço usa
a mesma lista descoberta para os oito arquivos. **O custo não foi decidido aqui:** ele já vinha da
ADR-0014 — enquanto a política conjunta valer, publicar apenas um pacote não passa no validador.
Para versionamento independente, muda-se a ADR primeiro.

**Um defeito no procedimento escrito, corrigido na raiz:** o comando de publish da
[ADR-0013](../decisions/0013-mecanica-de-publicacao-npm.md) encadeia com `&&`, que **o PowerShell 5.1
não tem** — e é o terminal da máquina que publica. A próxima sessão copiaria o comando e ele
falharia no parser antes de tocar o npm. A forma do PowerShell entrou ao lado, com a parada no
primeiro erro.

**O gate de pixel não foi repetido, e a razão é medida:** entre a execução de 97 capturas desta
sessão e o commit do publish, **nenhum arquivo de `apps/catalog/` mudou** (`git status`), e é o
catálogo que as capturas fotografam. Repetir 15 minutos por troca de número de versão seria gastar
tempo para reconfirmar bytes idênticos.

**A restrição do npm que o Victor viu na conta dele NÃO atinge este caminho** — pesquisado em
12/08/2026, não lembrado: o que foi restrito em 31/07/2026 são os **tokens que pulam o 2FA**
(perdem gestão de conta/pacote agora, e perdem publicação direta em ≈01/2027). Publicação
interativa com 2FA presente segue valendo. O efeito real é sobre o **K2**: ele confirma a escolha da
ADR-0013 pelo OIDC e põe **prazo** nela.

---

## 15. As quatro partes que a medição dos consumidores abriu (13/08/2026)
## 14b. Parte L — O COMPONENT LAB e o STRESS LAB

**Autorizada pelo Victor em 28/08/2026**, junto da PARTE inteira de 17 cartões da ATIVIDADE-2, e
como **entrega nova obrigatória** — não como melhoria opcional do catálogo.

O critério de aceitação é dele, textual:

> *"Eu consigo abrir esse componente, interagir com ele e observar pessoalmente que ele faz o que
> a Aurea afirma que faz?"*

Hoje a resposta é **não**, e isso está medido: o catálogo é markup estático
(`renderToStaticMarkup` no build, 8.472 bytes de `catalog.js` que só copiam código, trocam a aba e
mandam o tema para as iframes — **sem React e sem hidratação**). Nenhum preview abre, filtra ou
digita, e `combobox`, `multicombobox` e `fileinput` têm **3 de 3** demonstrações substituídas por
*"Interactive — see the code."*: os três componentes públicos **nunca aparecem**. O achado está
registrado como [`G-LAB-01`](../audit/activity-2/03-GAPS.md).

O catálogo passa a ter **três papéis separados**, e a separação é a decisão de arquitetura:

| papel | pergunta que responde |
|---|---|
| **DOCUMENTAÇÃO** | como eu aprendo a usar isto? |
| **COMPONENT LAB** | eu consigo ver e OPERAR isto? |
| **STRESS LAB** | eu consigo QUEBRAR isto? |

> 🔴 **ESTE BLOCO FOI MEDIDO CONTRA O CÓDIGO EM 10/09/2026, e o enunciado acima estava
> DESATUALIZADO em três pontos.** O Victor perguntou *"você conferiu o código? se realmente não
> foi feito?"* — e a resposta é que eu tinha lido **checkbox**, não código. Checkbox é
> documentação, e documentação envelhece; é a regra do topo do `CLAUDE.md` cobrando este próprio
> arquivo. O que o comando desmentiu:
>
> | o texto acima dizia | medido em 10/09/2026 |
> |---|---|
> | *"8.472 bytes de `catalog.js`"* | **18.007 bytes** |
> | *"sem React e sem hidratação"* | **existe `live.js`, 522.946 bytes**, com React e montagem — nasceu em 18/08/2026 |
> | *"`combobox`, `multicombobox` e `fileinput` têm 3 de 3 substituídas"* | a frase está em **3 arquivos**, e são `combobox`, `useaureastrings` e `usespriteurl`. **`multicombobox` e `fileinput` saíram** — alguém consertou e não marcou |
>
> ⚠ **Nenhum item mudou de aberto para fechado por causa disso.** O que mudou é o PONTO DE
> PARTIDA: dois dos dez começam de parcial, não de zero, e um está praticamente pronto. Declarar
> "está tudo por fazer" custaria reconstruir infraestrutura que já existe.

- [ ] **L1 — Componentes reais, montados.** React na página, hidratado. O fim do markup morto.
      ⚠ **PARCIAL, e a fronteira é exata.** O runtime existe e funciona: o `build-catalog.mjs:420`
      troca `renderToStaticMarkup` por `renderToString` quando recebe um `alvo`, e emite
      `<script src="../assets/live.js">`. **Mas o marcador `data-componente` está em ZERO das 372
      páginas de componente e em 16 dos 21 embeds** — ou seja, a camada viva só chega aos
      *embeds*, nunca à página que a pessoa navega. São **3 componentes** vivos: `sidebar`,
      `bottomnav` e `toggle`.
      🎯 **O que falta não é construir o mecanismo — é LIGAR os outros 73**, e decidir se a página
      de componente passa a hospedar o alvo ou se ela embute o *embed*.
- [ ] **L2 — Cobertura DERIVADA do registry**, com gate que reprova se um componente público não
      tiver demonstração que funcione. Derivada, não escrita: lista à mão é lista que envelhece.
      ⚠ **ABERTO, e medido:** nenhum check do `validate.py` cobra cobertura de demonstração.
      **É por isso que os três erros da tabela acima puderam envelhecer em silêncio** — sem gate,
      quem conserta não precisa marcar, e quem lê não tem como saber. Este item é o que impede a
      repetição, e por isso deveria vir ANTES do L1 na ordem de execução.
- [ ] **L3 — Interação completa:** clicar, digitar, escolher, abrir/fechar, expandir, arrastar,
      redimensionar, teclado — testável apertando teclas, não lendo uma tabela.
      ⚠ **PARCIAL, e a parte que existe mora FORA do catálogo:** o banco de teclado é o
      `apps/keyboard-probe/`, app próprio. Isso não é acidente — o rodapé desta seção já
      registrava que ele *"precisou viver fora do catálogo"* exatamente porque a prévia é morta.
      **Fecha junto com o L1**: com componente montado, o teclado volta para dentro.
- [ ] **L4 — Capacidades reais à mostra:** variantes, tamanhos, tons, aparências, estados,
      orientação, responsivo, `disabled`, `readonly`, `invalid`, `loading`, vazio, controlado.
      ⚠ **ABERTO como está escrito.** As páginas TÊM várias prévias — o `button.html` tem 20
      pares prévia/código (`role="tabpanel"`) —, mas elas são escritas à mão, uma a uma, e não
      derivadas do contrato de API. **A pergunta do item não é "há exemplos?" e sim "as
      capacidades DECLARADAS aparecem todas?"**, e essa ninguém responde hoje.
- [ ] **L5 — Playground de props** com edição ao vivo e código gerado.
      ⚠ **ABERTO, do zero:** a palavra `playground` não aparece em nenhum arquivo do repositório.
- [ ] **L6 — Responsive Lab:** o mesmo componente em containers pequeno/médio/grande ao mesmo
      tempo, lado a lado.
      ⚠ **ABERTO, do zero:** nenhuma ocorrência de `responsive-lab` no repositório.
- [ ] **L7 — Temas (dark/light), densidades, RTL, container estreito/largo, texto ampliado.**
      ⚠ **PARCIAL, e só o tema.** O `catalog.js` manda `data-theme` para as iframes por
      `postMessage` (e reenvia ao trocar) — isso funciona. **Densidade e RTL: zero ocorrências no
      `catalog.js`.** Texto ampliado e container: nada.
- [ ] **L8 — Cenários funcionais para os complexos** (DataGrid, Tree, Calendar, Editor, Charts,
      Media, Upload, AI) com dados de fixture — não caixas falsas.
      ⚠ **ABERTO como está escrito, mas NÃO são caixas falsas.** Medido: `datagrid.html` e
      `calendar.html` têm **zero** ocorrências de *"Interactive — see the code."* — eles têm
      demonstração de verdade. O que não existe é a palavra `fixture` em lugar nenhum: os dados
      são inline, não um conjunto nomeado e reusável. **O item é sobre a FONTE dos dados, não
      sobre a existência da demo.**
- [ ] **L9 — Navegação:** busca, categorias, filtros, status do registry
      (STABLE/BETA/EXPERIMENTAL/DEPRECATED).
      ✅ **PRATICAMENTE FEITO, e este é o item que o plano subestimava mais.** Medido no
      `index.html`: busca (`search` ×9, `Search` ×2), filtro (`filter` ×2), categorias
      (`Feedback`, `Navigation`, `Overlays`, `Data Display`) e status — `Stable` aparece **82
      vezes**. ✅ **E a ponta solta foi medida no mesmo dia, em vez de ficar como pergunta:** no
      `packages/contracts/` o único status de componente é **`stable`**. Não há BETA nem
      EXPERIMENTAL escondido do usuário — a tela mostra tudo o que existe.
      ⚠ **E aqui a regra "duvide da acusação" pagou de novo:** o `grep` achou **um**
      `deprecated` e eu ia registrar *"há um componente depreciado cujo status nunca chega na
      tela"*. Fui ver onde: é **prosa**, dentro da descrição do `variant` do `BottomNav` (os
      quatro nomes de 17/08/2026 *"are deprecated, not removed"*). **Não é status de componente.**
      Terceira acusação errada evitada no mesmo dia, e as três pelo mesmo motivo: o padrão bateu,
      o significado não.
- [ ] **L10 — STRESS LAB, separado:** 320px, containers extremos, texto enorme, strings longas,
      muitos itens, zero itens, loading, erro, RTL, zoom, dark/light, densidades, assíncrono,
      overlays aninhados, teclado.
      ⚠ **ABERTO, do zero:** a palavra `stress` só aparece dentro de `node_modules`.

**Fecha quando:** todo componente público tem demonstração operável, o gate de cobertura é verde,
e o `G-LAB-01` fecha junto — inclusive o desvio que o `invalido.spec.ts` carrega hoje (medir três
componentes em páginas de PADRÃO porque a página deles não tem componente).

⚠ **E A ORDEM DE EXECUÇÃO MUDOU COM A MEDIÇÃO: o L2 vem primeiro.** Sem o gate de cobertura,
qualquer progresso no L1 volta a envelhecer sem aviso — foi exatamente o que aconteceu entre
18/08 e 10/09/2026, quando o runtime nasceu, três componentes foram ligados, dois "see the code"
foram consertados, e **nada disso apareceu no plano.** Gate primeiro, ligação depois.

**Efeito colateral que vale registrar:** com o Lab, os gates da ATIVIDADE-2 deixam de medir só o
que o SSR deixou na página. Hoje `alvo-clicavel`, `invalido` e o sweep varrem 328 páginas de HTML
morto, e o banco de teclado precisou viver FORA do catálogo (`apps/keyboard-probe`) exatamente por
isso.

---

## 15. O que este plano NÃO cobre

> **De onde vieram.** O Victor mandou LER os projetos dele e medir o que falta na Aurea para
> atender todos — e depois cortou o escopo em voz alta: *"você aqui vai fazer a aurea isso e nada
> mais, os outros projeto voce apenas leu e vai continuar assim não toque neles"*. Nenhum arquivo
> fora deste repositório foi tocado, e nenhum será. Achado lá vira item aqui.
>
> **Por que entra neste documento e não noutro.** A [ADR-0022](../decisions/0022-consumidor-real-e-projeto-do-victor.md)
> (13/08/2026) diz que consumidor real é projeto do Victor instalando do npm. Então o que os
> projetos dele exigem **é** a estrada até a `1.0` — não é demanda de fora, é a condição de saída.
> E o §1 continua valendo: **uma parte por autorização**, checkbox é o estado.
>
> **Os nomes dos projetos não aparecem aqui**, por ordem do `CLAUDE.md`. Cada item diz o TIPO de
> consumidor que o exige; a evidência com nome ficou no chat da sessão.

### O que a medição mediu

Nove superfícies de interface, em seis projetos: um portal editorial com área administrativa de
29 páginas (Next.js, App Router); um ecossistema de agentes com **quatro** superfícies (uma React,
uma TypeScript sem framework, uma JavaScript com CSS próprio e uma HTML servida por Python); uma
base editorial de consulta em TypeScript puro; um motor com três aplicações (web, desktop e
**mobile em Expo/React Native**); dois projetos Rust cuja única interface é um visualizador d3.

**Três design systems concorrentes** foram encontrados, e um deles tem ADR próprio ainda válido
autorizando cada agente a manter a sua interface. Isso é decisão do Victor a revogar — não é
trabalho de código e não vira item aqui.

### Decisões que este plano NÃO reabre

Quatro coisas que a medição levantou já estavam decididas e **medidas**. Ficam registradas com a
evidência que seria necessária para reabrir — sem ela, não se toca.

| Levantado | Já decidido | Reabre só com |
|---|---|---|
| Campo de data | **Parte A do `ROADMAP.md` §Etapa 5 (17/07/2026):** `<Input type="date">` **é** o DatePicker; a Base UI não tem componente de data público. E hoje ainda existe o `Calendar` para dia/intervalo/múltiplo | um caso medido que o nativo e o `Calendar` juntos não cubram |
| Virtualizar a grade | **F11 (08/08/2026), por medição:** até 1 000 linhas o layout custa 62 ms; virtualizar quebraria o render no servidor e traria dependência nova | uma tela real medida onde `pageSize`/`manualPagination` não resolve |
| Componentes de servidor | **Parte A (06/08/2026):** 19 dos 22 módulos usam API de cliente de verdade; o `pure.tsx` nasceu para o que não usa, e o check 26 reprova diretiva faltando **e** sobrando | ver o **O1** abaixo, que é a fatia que sobrou e tem evidência nova |
| Pacote nativo | **§19 deste plano (02/08/2026):** trilha separada, documento próprio, "só os tokens atravessam" (`ROADMAP.md` Fase 7) | nada — o que falta é ESCREVER o documento irmão, e isso é o **O2** |

### Uma coisa que eu contei errado e não é item

**Sparkline não falta.** O `Chart` hospeda qualquer elemento do Recharts — é assim que o gráfico
de rosca de um consumidor entra sem componente novo. Sparkline é `Chart` + `LineChart` sem eixo.
O que falta é **exemplo no catálogo**, não código; entra como conteúdo quando a fila de exemplos
por componente começar.

---

## 16. Parte L — Os componentes que o consumidor exige e não existem

**Seis componentes.** Todos com uso medido em projeto real, todos com referência local para ler
antes de escrever — a regra do `CLAUDE.md` §Referências.

- [x] **L1 — `Carousel`.** ✅ **15/08/2026, e SEM dependência nova.** A pergunta que o item mandava
      decidir primeiro foi respondida medindo: as **quatro** referências embrulham o MESMO motor, o
      `embla-carousel` (kibo, as quatro bases do `ui-main`, o `react-main` e o `activepieces`), e o
      `@base-ui/react` não tem carrossel — 46 pastas, nenhuma é. Pagar por esse motor obrigaria todo
      consumidor a baixá-lo, para algo que o navegador já faz. E o caminho sem JavaScript ainda não
      serve: `::scroll-button()`/`::scroll-marker()` **não são Baseline** (Chromium tem; o Safari
      26.6 estava chegando; o Firefox segue em desenvolvimento). Então o motor é o contêiner de
      rolagem nativo com `scroll-snap`, que dá de graça toque com inércia, roda, teclado e o
      encaixe; ao React sobra descobrir em qual slide se está. A animação fica no CSS de propósito —
      `scrollBy` sem `behavior` obedece ao valor computado, e a regra de `prefers-reduced-motion`
      que o core já tinha alcança o componente sem uma linha nova. **Um** componente e não sete
      peças: quem embrulha cada slide é ele, e por isso "Slide 3 de 8" nunca fica com o consumidor.
      Quantos aparecem por vez é CSS (`--carousel-slide`), o caso `multiple` da referência sem
      prop nenhuma. O ponto é alvo de 24×24 com desenho de 8 no `::before` — fila de pontos de 8px
      reprova o WCAG 2.2 AA (2.5.8). **Limites declarados:** sem laço, sem autoplay, sem arrasto de
      mouse e sem eixo vertical (nenhum tem uso medido, e o sprite não tem chevron para cima).
      **Ler antes:** `Referencia/kibo-main/kibo-main/packages/patterns/carousel`,
      `Referencia/react-main/react-main/components/application/carousel` e os quatro exemplos de
      `Referencia/ui-main/ui-main/apps/v4/examples/aria/carousel-*.tsx` — que são justamente os
      casos de borda (api, multiple, orientation). **Decidir primeiro, como no DatePicker:** se
      `scroll-snap` do CSS cobre, o componente é marcação e não motor. A regra do `BUILDING.md`
      §3.3 vale — dependência nova interrompe e exige o Victor.
- [x] **L2 — `Gallery` (com ampliação).** ✅ **15/08/2026.** A extração levou junto as três decisões
      que o I7 mediu: o ladrilho é `<button>` e não `Card` (o `.card-interactive` do core tem cursor
      e hover e **nada** de foco — `<div>` com cursor de mão não recebe Tab); o escolhido se marca
      com `aria-current`; e a seleção vem de FORA, porque no arquétipo biblioteca, detalhe e player
      compartilham UMA constante. Ampliar abre o `Dialog` daqui — a trava cumprida —, com
      `fit="contain"`, porque cortar a imagem que a pessoa pediu para VER é o oposto do pedido.
      **A referência indicada não tinha a anatomia:** ela está no `Referencia/tool-ui-main`
      (`components/tool-ui/image-gallery/`), não na `media-chrome-main`. Fica registrado assim, e
      não corrigido em silêncio. **Três defeitos que a medição achou:** legenda repetindo o `alt`
      fazia o leitor de tela anunciar duas vezes (`image-redundant-alt`); a cápsula do selecionado
      não aparecia porque `.gallery-tile` e `.is-selected` empatam em especificidade e a nossa vinha
      depois; e ladrilho sem `onSelect` e sem `zoom` não pode ser `<button>` — botão inerte é alvo
      de foco que engana quem usa teclado. O bloco `MediaLibrary` do **I7** já compõe galeria,
      detalhe e player, mas é **demonstração**, não componente reutilizável: quem quiser a galeria
      copia o bloco. Extrair o que é componente. **Ler antes:** `Referencia/media-chrome-main` (a
      mesma que ensinou o `aspect-ratio` por CLS no I7) e a seleção como constante única que o I7
      já provou. **Trava:** ampliar imagem é diálogo, e diálogo já existe — não nasce um segundo.
- [x] **L3 — `SortableList` (reordenar arrastando).** ✅ **15/08/2026, e SEM dependência nova.** O
      teclado não é extra: é a razão de o componente poder existir. Espaço pega, setas movem, Espaço
      solta, Esc devolve ao lugar de onde saiu, e cada passo é anunciado numa região viva `polite`.
      Três coisas só apareceram implementando, e as três têm teste: o foco precisa **seguir** o item
      (senão a próxima seta move o vizinho, e vai por efeito porque o React precisa ter commitado a
      ordem nova); as setas não podem fazer nada com o item **solto**, senão o componente sequestra
      a navegação; e sem anúncio quem não vê a lista não recebe confirmação nenhuma — que é a
      reprovação registrada do USWDS, citada no L6. O `list` e o `kanban` do kibo são ambos
      `@dnd-kit/core`, e adotá-lo obrigaria todo consumidor a baixá-lo. **Ponteiro e não DnD do
      HTML5, e a razão é medida:** o DnD nativo não dispara em toque nenhum, então o celular ficaria
      sem reordenar — e são justamente dois consumidores fazendo arrasto HTML5 na mão. O
      `touch-action:none` na alça é o par obrigatório do `setPointerCapture`, com asserção na pele.
      A lista é controlada, e teclado e ponteiro chamam o MESMO `onReorder`. Dois consumidores fazem arrasto HTML5 na
      mão. **A trava é de acessibilidade, não de motor:** o **I8** já estabeleceu o precedente de
      que **arrastar precisa de alternativa sem arrastar** (lá foi o outline saindo da mesma
      fonte do canvas). Sem caminho por teclado, não fecha. **Ler antes:** `Referencia/kibo-main`
      (kanban e gantt) e o `graph.tsx` daqui, que já tem arrasto.
- [x] **L4 — `Image`.** ✅ **15/08/2026, e ele quase entrou QUEBRADO.** A regra nasceu com
      `aspect-ratio:var(--image-ratio,auto)`, e o fallback `auto` passa por cima do
      `auto <width>/<height>` que o navegador deriva dos atributos: medido numa caixa de 400px, com
      a imagem ainda não carregada, `width={300} height={200}` sem a prop `ratio` saía **400×0** — a
      regra escrita contra o salto de layout produzindo o salto, no caso mais comum. Hoje a
      proporção vai inline e só quando existe, com asserção na pele e no teste contra a volta.
      `src` quebrado cai numa caixa com o MESMO espaço reservado e o `alt` sob `role="img"` — a
      dívida que o `Avatar` mediu em 31/07/2026. O marcador de carregamento não tem estado: a caixa
      nasce em `--surface-3` e o bitmap a cobre. `render` troca o `<img>` pelo do framework do
      consumidor, via `useRender` do motor que a casa já paga. **A referência ensinou pelo avesso:**
      o `aspect-ratio` do kibo é o do Radix, um componente inteiro para emular o que a propriedade
      CSS hoje faz sozinha. Proporção reservada, `srcset` e marcador enquanto carrega. **A razão é
      CLS**, a mesma que o I7 mediu no player. **Ler antes:** `aspect-ratio` em
      `Referencia/kibo-main/.../packages/patterns/aspect-ratio` e a `--media-ar` que já existe no
      core. **Cuidado medido:** um consumidor usa o `<Image>` do framework dele; o nosso não pode
      brigar com isso — provavelmente aceita `render`/`asChild`.
- [x] **L5 — `Prose` (texto longo renderizado).** ✅ **15/08/2026.** Medido primeiro: o core **não
      tinha regra nenhuma** de `h1`–`h6`, `blockquote`, `pre`, `code` nem `figcaption`, e o corpo do
      documento é `--text-md` (14px), tamanho de interface. O componente é uma linha; tudo o mais é
      CSS. O corpo passa a `--text-base` com `--leading-relaxed` — token que existia e não tinha uso
      —, e a coluna para em `--prose-measure` (68ch = 652,8px medidos). **A trava do item virou
      teste, não promessa:** o `skin.spec` renderiza uma `<table>`, uma `<blockquote>` e um `<h2>`
      IRMÃOS da prosa e cobra que os três continuem como o navegador os deixou. A tabela da prosa
      não é a tabela de dados: sem os 720px, sem caixa alta, sem hover. **A fonte não muda** — o
      `--font-editorial` existe, está sem uso, e trocá-la é decisão de aparência que vai ao Victor.
      A ficha diz em voz alta que HTML de terceiro se **sanitiza** antes. Um portal editorial renderiza Markdown com
      GFM. **Não é o parser** — o parser é do consumidor. É a **pele** do texto: tipografia,
      medida de linha, tabela, citação, código dentro do texto. **Ler antes:** o `typography` do
      `Referencia/ui-main`. **Trava:** não pode vazar para toda `<table>` do documento — foi
      exatamente o defeito que o Lote 4 pagou e que o comentário do `.table-wrap` registra.
- [x] **L6 — Máscara no campo.** ✅ **15/08/2026, e SEM componente novo.** A metade da **moeda** já
      estava paga e desligada: medido no `@base-ui/react@1.6.0`, o `NumberFieldRoot` aceita
      `format?: Intl.NumberFormatOptions` e `locale?`, e a nossa casca não repassava. Passou a
      repassar, com `name` — que é o que faz o motor renderizar o input escondido com o valor CRU.
      A metade do **texto** é `Input.formatOnBlur`, e a decisão de NÃO mascarar ao vivo é
      pesquisada: o `Input mask` do **USWDS** é publicado com reprovação de **WCAG 2.1 AA**
      registrada; o **MUI** abandonou máscara nos campos de data na v6 porque o texto *"leaks to the
      previous sections"* (há um `masked-input-bad-ux.mp4` no repositório deles); e máscara ao vivo
      descasa o que o leitor de tela anuncia do que o campo mostra. A Aurea entrega o **momento**;
      o formato fica com o consumidor, porque placa e documento são regra de país. **A trava está
      provada dos dois lados:** no texto, o valor formatado É o `value` do elemento (o teste cobra
      que não exista nó com o texto fora do campo); no número, o formulário envia `1234.5`.
      Registrado na [ADR-0024](../decisions/0024-mascara-de-campo-e-o-momento-nao-o-formato.md),
      porque um **não** sem página é lacuna que a próxima sessão preenche por engano. Moeda, placa, documento. Um consumidor carrega biblioteca de
      moeda só para isso. **Ler antes:** `Referencia/material-ui-master` (catálogo de estados
      maduro) e `Referencia/react-main`. **Trava do I8, que já foi paga:** valor mascarado
      **continua no DOM** — máscara é apresentação, e o teste tem de reprovar quem esconder só
      na tela.

**Fecha quando:** os seis com ficha no registry, página no catálogo com preview que desenha,
teste provado contra o defeito, e os gates de sempre.

### A PARTE L FECHOU em 15/08/2026 — 6 de 6

**Nenhum dos seis trouxe dependência nova**, e em três deles isso foi decisão medida contra o
padrão de mercado: o `embla-carousel` (L1), o `@dnd-kit/core` (L3) e a biblioteca de moeda (L6).
Nos três, o que substituiu a dependência já estava pago — o contêiner de rolagem do navegador, o
`PointerEvent`, e o `Intl` mais o motor que a casa usa desde a Fase 2.

**O que a construção mudou do enunciado, e não é ajuste de prosa:**

1. **O L4 veio ANTES do L2**, porque o ladrilho da galeria **é** um `Image`, e a regra 9 da
   `DIRECTION.md` diz que componente composto reusa os menores. Ordem de item dentro de uma parte
   não é contrato — só a ordem entre partes é.
2. **A referência indicada nem sempre tinha a anatomia.** No L2 o item mandava a `media-chrome`, e
   a galeria com grade, ladrilho, erro e lightbox estava na `tool-ui-main`. Registrado no
   `REFERENCES.md`, não corrigido em silêncio: é a lição de que pasta indicada não é veredito.
3. **Duas referências ensinaram pelo AVESSO.** O `aspect-ratio` do kibo (L4) é um componente
   inteiro para emular o que a propriedade CSS faz sozinha hoje; o `typography` do `ui-main` (L5)
   não é componente, é receita em classe utilitária, modelo que não serve a quem entrega CSS.
4. **O L6 encolheu para duas props, e cresceu em evidência.** Três medições independentes contra
   mascarar ao vivo — a reprovação de WCAG do próprio USWDS, o abandono da máscara pelo MUI, e a
   prática corrente. O item pedia máscara; o que serve o consumidor é o momento certo de formatar.

**Três defeitos foram achados pela MEDIÇÃO e não por gate**, e os três têm asserção agora: o
`aspect-ratio:auto` que produzia altura zero (L4), a cápsula de selecionado que não aparecia por
empate de especificidade (L2), e a legenda que fazia o leitor de tela anunciar duas vezes (L2).
Um quarto foi achado pelo gate e é do REPOSITÓRIO: comentário de **bloco** citando o nome de uma
prop entre crases fez uma classe do core parecer produzida pelo pacote React — terceira vez que um
gate daqui lê prosa como se fosse código.

**O que ficou declarado como limite, e não como esquecimento:** carrossel sem laço, sem autoplay,
sem arrasto de mouse e sem eixo vertical; galeria sem roving tabindex; prosa sem serifa (é decisão
de aparência, e vai ao Victor com imagem); e o formato de placa/documento fora da biblioteca,
porque é regra de país.

**E a varredura completa achou mais um, que é do CORE e não da parte.** A página do `Prose` foi a
primeira do catálogo com um link em CORPO DE TEXTO, e o axe reprovou `color-contrast` no tema
claro: o `a { color:var(--primary) }` global dá **1,68:1** sobre superfície clara, contra os 4,5:1
do AA — medido, não estimado. Era defeito latente desde sempre, e a cura não é decisão nova: a
fórmula, o guarda de tema e a razão já estavam escritos neste repositório para o
`.btn-link-primary` e para a linguagem de selecionado. Aplicada ao `<a>` de conteúdo, dá **6,92:1**.
O `:not([class])` é a parte cirúrgica — sem ele a regra passaria por cima de `.btn`, `.doc-nav a` e
`.toc a` —, e o gate de pixel prova que ela não mexeu em nada: **22 de 22 capturas sem um pixel de
diferença**.

---

## 17. Parte M — As lacunas de sistema

**Sete itens, e são os caros.** Não são componentes: são a cola que todo consumidor reescreve.
A medição dá o preço — num único administrativo, três telas de filtro somam **87 KB** de código
que faz a mesma coisa.

- [x] **M1 — `Form` e validação.** ✅ **13/08/2026, e SEM dependência nova.** O padrão de
      mercado é `react-hook-form` + `zod` — é o que o `ui-main` embrulha —, e embrulhar isso aqui
      obrigaria TODO projeto consumidor a adotá-lo, inclusive os que já validam de outro jeito.
      Não foi preciso: medido no `@base-ui/react@1.6.0`, o `Form` do motor **já** tipa `errors`
      como "erros de validação retornados externamente, tipicamente depois do envio por um
      servidor ou action". A divisão que eu ia propor já era a do motor. O `Field` ganhou `name`
      de forma aditiva — sem ele, o componente é o de antes byte a byte, porque a semântica dele
      foi paga com auditoria (AUD-0001). E a medição achou um defeito que referência nenhuma
      avisaria: `aria-invalid: undefined` explícito **vence a mesclagem**, e o campo saía vermelho
      na tela e VÁLIDO para o leitor de tela. Hoje o `Field` sabe mostrar erro e ninguém orquestra. **Ler
      antes:** `Referencia/ui-main/ui-main/apps/v4/registry/new-york-v4/ui/form.tsx` e o `form`
      de `Referencia/kibo-main`. **Decidir antes de escrever:** dependência de biblioteca de
      formulário é decisão do Victor (`BUILDING.md` §3.3). O caminho sem dependência é aceitar o
      resultado de validação de fora e só desenhar — que é o que o `Field` já quase faz.
- [x] **M2 — Estado na URL, além da grade.** ✅ **13/08/2026 — `screenStateToParams` /
      `screenStateFromParams`.** Três chaves de TELA (`tab`, `view`, `detail`) somadas às cinco da
      grade, com o mesmo contrato: preservar o que não é deste formato (`ref`, `utm_*`) e limpar
      o que saiu do estado. A pesquisa de novo disse o que **não** fazer — o `nuqs` é o
      gerenciador que o mercado consolidou (adaptadores para Next, React Router, TanStack Router
      e SPA; Sentry, Supabase, Vercel e Clerk usando), e gerenciar exige mexer no histórico, onde
      a escolha entre `push` e `replace` é do consumidor, como o **F4** já tinha registrado. Fica
      nosso o FORMATO, sobre o qual o `nuqs` não tem opinião. Continuam sem diretiva, no
      `pure.tsx`, porque são chamadas onde a URL chega — no servidor.
- [x] **M3 — Ligar dado a estado.** ✅ **13/08/2026 — `DataState`.** O eixo `universalStates`
      fechou na **Parte J** e nada o ligava a uma consulta; cada tela ligava na mão. O desenho
      não foi inventado: a regra que separa os **terminais** (carregando/erro/vazio, que
      substituem o conteúdo) dos **universais** (`stale`, `partial`, `degraded`, `offline`,
      `waiting_*`, que o acompanham) é a que o `DataGrid` já tinha pago para aprender, promovida
      a componente. Da pesquisa veio a lista de casos (o casamento de padrão sobre o status do
      TanStack Query) e o que ela **não** cobre: `aria-busy` na região enquanto carrega, para a
      tecnologia assistiva esperar em vez de anunciar meia atualização. Suspense/ErrorBoundary
      ficou de fora de propósito — amarraria a biblioteca a um jeito de buscar dado. `children`
      aceita função, e na face de carregando ela não é chamada.
- [x] **M4 — Portão de permissão.** ✅ **13/08/2026 — `AccessGate`**
      ([ADR-0023](../decisions/0023-o-portao-de-permissao-e-componente.md)). **Este item me pegou
      errando o método.** Eu tinha fechado como "não é componente" porque nenhuma das cinco
      referências locais tem portão; o Victor corrigiu — *"não existir referência na pasta não
      quer dizer que não é pra criar, deve buscar na internet"* —, e o `BUILDING.md` §Passo 4 já
      mandava pesquisar. A pesquisa devolveu o padrão com nome (`Can` do CASL, `useCanAccess` do
      react-admin, `AccessGate` dos guias de painel) e a divisão que virou o desenho: o CASL só
      esconde, o react-admin deixa escolher. Entregue com dois modos, `reason` obrigatório pelo
      tipo no modo `disable`, e `allowed` como resposta pronta — a Aurea não guarda regra nem
      papel. O outro lado do item era defeito medido: `disabled` tira o botão da ordem de foco, então a dica que explica
      **por quê** nunca é lida por quem usa teclado — e o embrulho de `<span>` que o MUI
      documenta conserta o ponteiro e não o teclado. Além disso `aria-disabled` chegava ao DOM e
      **o clique continuava executando**, que é o AUD-0004 uma segunda vez, agora no `<button>`.
      Entregue: `aria-disabled` vira inerte-mas-alcançável, as 12 regras de hover do core
      excluem-no, e a ficha do `Button` nomeia o critério entre as duas formas.
- [x] **M5 — Confirmação destrutiva.** ✅ **13/08/2026 — `ConfirmDialog`.** Existe `Dialog`; não existe o padrão "isto apaga" com foco
      no botão seguro e rótulo que diz o que se perde. Dois consumidores têm um botão de apagar
      cada um com o seu jeito. **Ler antes:** `alert-dialog` em `Referencia/kibo-main` e o
      `AlertDialog` do `Referencia/base-ui-master` — que é o motor que já usamos.
- [x] **M6 — Motor do `CommandPaletteShell`.** ✅ **13/08/2026 — `CommandPalette`, e SEM
      dependência nova.** A casca não mudou; o par é o do `MediaPlayer`/`MediaPlayerShell`. O
      padrão de mercado é o `cmdk`, que o `ui-main` embrulha — mas o `@base-ui/react` tem
      `autocomplete`, e medido no `index.parts` dele o `Input`, o `List`, o `Popup`, o `Empty` e
      o `Collection` são **os mesmos módulos do `combobox`** que o `Combobox` daqui já usa. Pagar
      por um segundo motor de lista filtrável não se justificava. Fechar acontece ANTES de
      executar, senão um comando que navega deixa a paleta sobre a tela nova. **Limite declarado:**
      a v1 não agrupa — o `Autocomplete.Root` não consome a estrutura agrupada, e dar a cada grupo
      a sua fatia passa por cima do filtro (medido: digitar "the" devolvia os três comandos).
      Entre agrupar e filtrar, filtrar é o ponto de uma paleta. Hoje existe a casca e o filtro é do consumidor.
      **Ler antes:** `command` em `Referencia/kibo-main` e o `cmdk` que o `Referencia/ui-main`
      embrulha. **Decidir:** filtro nosso ou motor de terceiro.
- [x] **M7 — Tema com API React.** ✅ **13/08/2026 — `useAureaTheme()`.** E a pesquisa disse
      principalmente o que **não** construir: o `next-themes` já resolve persistência,
      preferência do sistema, sincronia entre abas e o script embutido contra o flash — e
      escreve **`data-theme` no `<html>`**, que é exatamente o atributo que a Aurea lê. Os dois
      se encaixam sem cola. Reimplementar isso seria trocar biblioteca mantida por cópia pior, e
      guardar preferência é da APLICAÇÃO. O que ficou nosso é o que ninguém cobre: **densidade**,
      que é eixo da Aurea, e ler o estado atual de dentro do React. `useSyncExternalStore` e não
      `useState`, para acompanhar quem troca por fora; `theme: null` enquanto desconhecido,
      porque fingir saber no servidor é o que produz erro de hidratação — armadilha documentada
      no próprio `next-themes`. Não há provider, hook nem componente de tema no pacote React —
      o tema mora no `aurea.js` como `window.Aurea.setTheme`, e a persistência que o catálogo
      ganhou em 13/08/2026 é **do catálogo**, de propósito. Um consumidor carrega biblioteca de
      tema por causa disso. **Trava a decidir:** persistir é papel da aplicação, então
      provavelmente o que a Aurea entrega é o hook e o gancho, não o armazenamento.

**Fecha quando:** cada item com decisão registrada onde couber ADR, e nenhum deles introduzindo
dependência sem o Victor.

---

## 18. Parte N — O editor de conteúdo

- [x] **N1 — Editor de texto rico por blocos.** ✅ **15/08/2026, e SEM dependência nova.** A
      decisão que o item mandava tomar primeiro foi tomada medindo, e está na
      [ADR-0025](../decisions/0025-editor-por-blocos-sem-motor.md): **a Aurea entrega a moldura, o
      motor fica com o consumidor** — a segunda opção, como o próprio item previa. **A referência
      indicada não era o mesmo componente**, e isso fica registrado como no L2: o `editor` do kibo
      tem 39 exports e 17 dependências (TipTap 3.6.6 sobre ProseMirror), **18 dos 39 só de
      tabela**, e é editor de DOCUMENTO ÚNICO — lista de blocos, reordenação e bloco de imagem com
      legenda não existem lá. **O que fechou a porta não foi peso, foi segurança:** o navegador não
      sanitiza HTML colado, e quem é dono da superfície de edição é dono do XSS de colagem — a
      pesquisa confirma que ProseMirror e Lexical tratam o `contenteditable` como alvo de
      renderização e nunca como fonte da verdade justamente por isso. A Aurea não pode decidir o
      que é seguro renderizar no domínio do consumidor. **Uma medição mudou o desenho:** ia ser
      prop da `SortableList`, até medir que o rótulo dela é `<span>`, que só aceita conteúdo de
      frase — uma `<figure>` ali é marcação inválida, e bloco de imagem com legenda é literalmente
      o que o item pede. Daí `.block-body` ser `<div>` no `<li>`, com teste e asserção na pele. **A
      extração que isto pagou:** o protocolo de arrasto saiu da `SortableList` para o `useReorder`
      do `internal.tsx`, porque o `BlockEditor` virou o segundo dono dele — a DOM da `SortableList`
      não mudou, e quem prova são o gate de pixel e o `skin.spec`. **Sem `onInsert`**, e é decisão:
      acrescentar bloco é apendar na coleção de quem controla, e a reordenação leva o novo bloco a
      qualquer posição.

### A PARTE N FECHOU em 15/08/2026 — 1 de 1

E fechou com um **não** registrado, que é o desfecho mais fácil de uma sessão futura desfazer por
engano. Fica dito aqui e na [ADR-0025](../decisions/0025-editor-por-blocos-sem-motor.md): **não existe
motor de texto rico na Aurea, e é decisão medida.** Quem chegar querendo negrito e itálico não está
diante de uma lacuna — está diante de uma fronteira, e a razão dela é segurança antes de peso.

Reabrir exige o que o `BUILDING.md` §3.3 pede para qualquer dependência: uso medido de consumidor
real, e a decisão do Victor. O caminho tem precedente pronto — subpath próprio com peer opcional,
como `Chart`, `Calendar` e `CodeEditor`.

---

## 19. Parte O — As duas fronteiras que sobraram

- [x] **O1 — Medir quem é cliente só por nossa causa.** ✅ **15/08/2026, e NÃO terminou em "não
      vale".** Medido com comando (`node scripts/measure-boundary.mjs`) e decidido na
      [ADR-0026](../decisions/0026-marcacao-pura-e-de-servidor.md): **22 de 105 exports não precisavam
      de cliente por nada que faziam**, e agora moram no `markup.tsx`, sem diretiva. **O número que
      decidiu:** importar `Card` — uma `<div>` — embarcava **9 módulos e 118,5 KB**, porque a
      diretiva contamina o módulo inteiro e o fecho dele; `Prose` custava 123,5 KB. Depois: o fecho
      dos 22 é de **2 módulos e 27,3 KB**, e pelo barril eles não mandam JavaScript nenhum. **A
      prova de que dava para fazer já estava no repositório:** o `Accordion`, da mesma natureza,
      custava **0,3 KB** — a única diferença era o arquivo em que ele caiu na Fase 9. **A medição
      corrigiu o enunciado deste item em três pontos:** `chart` e `qrcode` **não** são de cliente
      por causa dos nossos hooks (é o motor deles — recharts e `qr`; o mesmo vale para o
      `calendar`); `Table` **precisa** de cliente (chama `useAureaStrings`), ao contrário do que a
      linha acima dizia; e o item olhava quatro módulos quando o problema estava em **nove** — o
      `inputs` sozinho tinha seis puros. **E uma medição errada minha foi pega antes de decidir:** a
      primeira versão do script adivinhava o motor pelo nome do pacote e deu `Calendar` e
      `ChartLegend` como puros — teria mandado para o servidor componentes que o navegador precisa
      montar. **Sem quebra de API** (os 22 seguem saindo do barril e dos subpaths, conferido em
      runtime), com **check 35** provado contra o defeito, e um limite declarado: pelo subpath da
      categoria eles continuam vindo de um módulo com a diretiva.
      **✅ Esse limite FECHOU em 16/08/2026** (adendo da mesma ADR-0026): as oito categorias que
      reexportavam marcação pura viraram **vitrines sem diretiva** (`layout.tsx` = `export *` do
      irmão `layout-client.tsx` + a linha do `markup.js`), e a ADR **errou ao prever o custo** —
      não exigiu "duas entradas públicas": os 20 subpaths seguem idênticos, mudou arquivo, não
      fronteira. Medido no `apps/proof-server` com Turbopack: com a diretiva reposta na vitrine o
      `KPI` do subpath chega ao payload como referência de cliente (`$L`); sem ela, como marcação.
      Trava: **check 26b**, provado contra o defeito nos oito módulos.
      > **O enunciado original, preservado** — três frases dele foram derrubadas pela medição, e
      > apagá-las esconderia que a suspeita estava parcialmente errada:
      >
      > A Parte A fechou certo: 19 de 22 módulos usam API de cliente. Mas o rodapé dela registra
      > uma coisa que agora tem consequência medida: `data-display`, `layout`, `chart` e `qrcode`
      > são de cliente **por causa dos nossos hooks** `useAureaStrings` e `useSpriteUrl` — não por
      > estado próprio. Para um consumidor que renderiza conteúdo no servidor por SEO, isso
      > significa que `Card`, `Stack`, `Grid`, `Cluster` e `Table` chegam como cliente sem
      > precisar. **Medir primeiro:** quanto do módulo depende mesmo do contexto, e se dá para
      > separar em duas entradas sem duplicar componente. **Só depois** decidir. Pode terminar em
      > "não vale" — e aí o resultado da medição fica escrito, como no F11.
- [x] **O2 — Escrever o documento irmão do nativo.** ✅ **15/08/2026 — e ele NÃO constrói nada,
      como o item mandava.** O documento é o [`NATIVE.md`](NATIVE.md), e volta para o Victor: o que
      ele pede é **uma** autorização, a da Etapa 1. **A pesquisa de hoje mudou o quadro do
      ROADMAP:** a New Architecture **deixou de ser opcional** (padrão desde RN 0.76/Expo SDK 52, e
      a legada foi REMOVIDA no Expo SDK 55/RN 0.83), então o "tudo em fluxo" que mandava adiar
      parou de fluir; e a pista do ROADMAP sobre o **Unistyles v3** se confirmou pela razão certa —
      ele não tem componentes, e o time dele diz que a ideia é você construir o seu design system
      em cima, que é a relação que a Aurea já tem com o Base UI. O **NativeWind ficou fora por
      medida** (197 ms contra 49 do StyleSheet). **O achado que decide 152 tokens não veio da
      pesquisa e sim da falta dela:** nenhuma fonte confiável diz que o `StyleSheet` aceita
      `oklch()` — o que existe é BIBLIOTECA anunciando suporte —, e o amarelo primário é declarado
      intocável. Converter oklch→sRGB é mapeamento com perda, e o gate de pixel desta casa mede o
      NAVEGADOR: erraria em silêncio. Por isso a Etapa 1 da proposta é **medir a cor no aparelho**,
      antes de qualquer componente. O §19 dizia há muito tempo que o pacote nativo
      tem plano próprio, e esse plano **nunca foi escrito** — agora foi. Agora há dois alvos reais e medidos:
      uma aplicação Expo/React Native que **já existe** num dos projetos, e um app de consumidor
      final planejado em React Native. Este item **não constrói nada** — ele produz o documento
      com o que o `ROADMAP.md` Fase 7 já rege ("só os tokens atravessam"), pesquisando o estado
      atual do mercado antes de propor caminho, e volta para o Victor autorizar.

---

## 20. O que este plano NÃO cobre

**O pacote nativo** — e desde 15/08/2026 o documento irmão **existe**: [`NATIVE.md`](NATIVE.md),
escrito pelo **O2** (§19). Ele é proposta, não autorização.
Decisão do Victor em 02/08/2026: trilha separada, plano próprio. Ele é uma
plataforma inteira — gerador de tokens tipados, conversão de unidade, tipografia e ícone nativos,
componentes próprios, testes nos dois sistemas. Cabe num documento irmão, não numa parte daqui.
O `ROADMAP.md` Fase 7 já registra a decisão de arquitetura que o rege: **só os tokens atravessam**.

**A camada de marca alternativa.** O contrato trava o amarelo primário e o `brandOverrides`
reafirma a trava. Se alguma superfície precisar de outra cor primária, isso é **decisão do
Victor + ADR**, não um item de plano.

---

## 21. Registro de sessão

Uma linha por sessão, ao fechar. O formato longo vai para o
[`04-PROTOCOLO-IA.md`](../audit/2026-07-26-integral/04-PROTOCOLO-IA.md); aqui fica o rastro curto.

| Data | Parte | Itens fechados | Gates | Commit |
|---|---|---|---|---|
| 02/08/2026 | — | plano criado, ADR-0015 | validate OK · 194/194 · 85/85 | — |
| 06/08/2026 | **A** | A1 · A2 · A3 · A4 — parte fechada | validate OK (26 checks) · pack OK · 194/194 · 87/87 | `88710e1` + este |
| 06/08/2026 | **B** | B1 · B2 · B3 · B4 · B5 · B6 — parte fechada | validate OK (26 checks) · pack OK · 203/203 · 87/87 · baseline `-linux` PENDENTE | este |
| 07/08/2026 | **C** | C1 · C2 · C3 — parte fechada; ADR-0016; check 27 | validate OK (27 checks) · 205/205 | este |
| 07/08/2026 | **E** | E1 a E11 — o **M8 fecha**, 76/76 com `props`; check 28; `Dialog` no `REFERENCES.md`; o E12 vira E12–E15, medido | validate OK (28 checks) · 206/206 · 87/87 | `52b795f` `69859ae` `bd4f6f6` `0cbbd4f` `45d9b2b` |
| 07/08/2026 | **E** | **E12** — check 22 reescrito e provado nos dois sentidos; 6 `states` · 3 `tokens` · 27 `a11y`; `.toolbar-group` de pixel cru para `--space-1` | validate OK (28 checks) · 206/206 · 87/87 · raw-px 123→122 | `1f03fce` |
| 07/08/2026 | **E** | **E13** — os 53 no `skin.spec`; defeito de pele do `LogStream` achado e corrigido na raiz | validate OK (28 checks) · 206/206 · 87/87 | `f5574fb` |
| 07/08/2026 | **E** | **E14** — as 40 entradas de referência (508 → 1.476 linhas) | validate OK (28 checks) | `159f9dc` `6fd7b8b` `e7e5bb3` `7f29f8f` |
| 07/08/2026 | **E** | **E15** — os 76 em `built-components.json`; **a parte fecha** | validate OK (28 checks) · pack OK · 206/206 · 87/87 | `d184b2e` |
| 08/08/2026 | — | baselines `-linux` saem do **contêiner**, não da CI; `ci.yml` fixa a imagem | validate OK · 87/87 Windows · 87/87 contêiner | `345fd19` |
| 08/08/2026 | **D** | D1 · D2 · D3 · D4 — **parte fechada**; o **M13** cai e a auditoria encerra | validate OK (26 checks) · pack OK · 206/206 · 61/61 · zero pixel | `c8e4bc5` `45fb1a3` + este |
| 08/08/2026 | — | as referências vão a 12; a Parte H destrava (15/16); licença deixa de ser critério, por medição | validate OK (26 checks) | `e3a8b7e` |
| 08/08/2026 | **F** | **F1** · **F2** — modo controlado e dados do servidor; 10 testes, provados contra dois defeitos; `DataGrid` ganha entrada própria no `REFERENCES.md` | validate OK (26 checks) · pack OK · **216/216** · 61/61 · zero pixel | `7a453c5` |
| 08/08/2026 | **F** | **F3** — linha de filtro no cabeçalho, faceta com `MultiCombobox`; a ficha do `DataGrid` para de prometer `role=grid`; 3 das 6 declarações de pele morreram na prova | validate OK (26 checks) · pack OK · **222/222** · 61/61 · zero pixel | `5ff3967` |
| 08/08/2026 | **F** | **F4** — estado serializável no `pure.tsx` (servidor lê URL); 7 testes provados contra duas injúrias | validate OK (26 checks) · pack OK · **229/229** · 61/61 · zero pixel | `7a9fa6f` |
| 08/08/2026 | **F** | **F5** — barra de lote com **zero CSS novo**; 6 testes provados contra duas injúrias | validate OK (26 checks) · pack OK · **235/235** · 61/61 · zero pixel | `2d745ee` |
| 08/08/2026 | **F** | **F6** — cabeçalho fixo, medido ROLANDO no navegador; uma causa errada minha foi reprovada antes de virar regra | validate OK (26 checks) · pack OK · **236/236** · 61/61 · zero pixel | `8e9f215` |
| 08/08/2026 | **F** | **F7** — colunas ocultáveis e redimensionáveis, com teclado na alça; a busca sozinha não mudou de aparência | validate OK (26 checks) · pack OK · **242/242** · 61/61 · zero pixel | `18bba33` |
| 08/08/2026 | **F** | **F8** — carregando, obsoleto, parcial e erro; recado em texto e `role` certo por gravidade | validate OK (26 checks) · pack OK · **248/248** · 61/61 · zero pixel | `123d6da` |
| 08/08/2026 | **F** | **F9** — painel de detalhe ao lado da lista; `@container` tentado, medido e recusado | validate OK (26 checks) · pack OK · **253/253** · 61/61 · zero pixel | `3bc5c81` |
| 08/08/2026 | **F** | **F10** — exportação com o escopo no rótulo; a grade não gera arquivo | validate OK (26 checks) · pack OK · **258/258** · 61/61 · zero pixel | `a560148` |
| 08/08/2026 | **F** | **F11** — fecha pela MEDIÇÃO (`node scripts/measure-grid.mjs`): virtualização não entra. **A PARTE F FECHA** | validate OK (26 checks) · pack OK · 258/258 · 61/61 | `7d12208` |
| 08/08/2026 | **G** | **G1** · **G2** — a fila vira dado serializável; pausar deixa de ser cancelar (`resumeFrom`); `size` vira `bytes` por ordem do check 23 | validate OK (26 checks) · **263/263** · 61/61 | `a6fa060` |
| 09/08/2026 | **G** | **G3** · **G4** — prévia que revoga a URL; soma SHA-256 conferida contra a do servidor. Uma **corrida real** achada por teste | validate OK (26 checks) · **268/268** · 61/61 | `a3344da` |
| 09/08/2026 | **G** | **G5** · **G6** — conflito com três saídas; recibo em texto puro. **A PARTE G FECHA** | validate OK (26 checks) · pack OK · **272/272** · 61/61 · zero pixel | `0eb64f3` |
| 09/08/2026 | **H** | **H.a** (H1·H2·H3) — a camada operacional começa; categoria **"AI & Agents"** por [ADR-0017](../decisions/0017-categoria-ai-agents.md) | validate OK (26 checks) · pack OK · **278/278** · 61/61 · 4 baselines `-win32` regravadas | `cf2f98b` |
| 09/08/2026 | **H** | **H.b** (H4·H5) — `<details>` nativo no lugar de `Collapsible`; `aria-busy` no lugar de shimmer | validate OK (26 checks) · pack OK · **285/285** · 61/61 | `c015aba` |
| 09/08/2026 | — | **correção de gate:** o commit do H.b saiu com `STATE.md` vencido, com o gate já avisando | validate OK | `2d15929` |
| 09/08/2026 | **H** | **H.c** (H6·H7) — aprovar e permitir viram dois; nasce o **check 29** (token usado e nunca declarado) | validate OK (**29 checks**) · pack OK · **291/291** · 61/61 | `f2f1abf` |
| 09/08/2026 | **H** | **H.d** (H8·H9·H10) — separação por PAPEL (`feed` × `log`, duração × momento); as 11 cores por categoria recusadas | validate OK (29 checks) · pack OK · **298/298** · 61/61 | `56d459f` |
| 09/08/2026 | **H** | **H.e** (H11·H12·H13) — fatia de soma × fração de teto; o razão apende-só, **sem referência**, por pesquisa registrada. **Quatro achados fora do escopo, todos de H.a–H.d e todos corrigidos na raiz com gate provado:** os 13 de "AI & Agents" sem página no catálogo · `preview:` que o gerador nunca leu · três defeitos de a11y (`h1→h3`, `aria-required-children`) que a prévia vazia escondia · as barras de `ModelUsage` e `TraceTimeline` colapsadas a 0px em painel estreito | validate OK (29 checks) · pack OK · **307/307** · 61/61 · catálogo 183 → **196 páginas** · 4 baselines `-win32` regravadas · zero pixel nas outras 40 | `4dd8723` |
| 09/08/2026 | **H** | **H.f, parte 1** (H15·H16) — a direção como dado (`group` nomeado, porque `Icon` é sempre `aria-hidden`) e a regra QUANDO/ENTÃO com o `Switch` que já existe. **Quarta recusa da mesma coisa:** as 6 cores por intenção do routing-hub. **O H14 ficou parado** — a medição reabriu a decisão de motor | validate OK (29 checks) · pack OK · **313/313** · 61/61 · catálogo **198 páginas** · 4 baselines `-win32` regravadas | `31d8cf5` |
| 09/08/2026 | **H** | **H14** — **A PARTE H FECHA.** `@xyflow/react` como peer OPCIONAL em subpath `./graph`; layout em camadas escrito aqui, porque o motor recebe `x`/`y` prontos. **Dois defeitos que só o navegador achou:** o grafo saía INVISÍVEL (`nodes` sem `onNodesChange`) e o `prerender` do catálogo aprovou uma prévia quebrada — o guarda foi apertado e provado | validate OK (29 checks) · pack OK (**react:51**) · **319/319** · 61/61 · catálogo **199 páginas** · `pnpm audit` limpo | `d88f20d` |
| 09/08/2026 | — | **as 4 baselines `-linux` regravadas no contêiner do minipc** — a pendência que atravessava H.a a H.f. 61/61 com o flag, **61/61 sem ele**, 4 arquivos alterados e nenhum `-win32` (22/22 somas conferem) | validate OK · pack OK · 319/319 · 61/61 | — |
| 09/08/2026 | **H** | **correção do H14:** a prévia do grafo era uma caixa vazia — o Victor perguntou "cadê?". O motor tem SSR (`initialWidth`/`initialHeight`/`handles` + viewport no provider) e eu tinha concluído sem procurar. Mais três achados: loja semeada só em efeito, tela encolhendo a 71px em painel flex, e **CSS fora de camada vencendo o `@layer aurea`** | validate OK · pack OK · **319/319** · 61/61 | — |
| 09/08/2026 | **K** | **K1 pela METADE, e fica desmarcado.** A suíte vai a **131 testes** em três motores — pixel só no Chromium ([ADR-0019](../decisions/0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md)). O **WebKit passou** e achou uma **barreira de teclado** aberta desde a Fase 8: a gaveta do `AppShell` confiava no popover nativo para o foco e o Safari não entrega — corrigido nos dois runtimes. O **Firefox não inicia nesta máquina** (`mozglue`), então nunca rodou. Mais: o prerender do catálogo (defeito anterior, bloqueava o build) deixou de apostar em `setTimeout` e passou a esperar a PROVA | validate OK (30 checks) · pack OK · **332/332** · playwright **95 passed · 1 skipped · 0 failed** (chromium+webkit) · `pnpm audit` limpo | este |
| 10/08/2026 | **I** | **I1 `RunSession`** — o bloco existia e era um DESENHO (escrito antes da Parte H); virou a composição do contrato, reescrita no lugar. As seis regiões, e as ações **derivadas da tabela de transições** em vez de escritas ao lado dos botões. Teste da composição provado contra **quatro** defeitos. **Um achado fora do escopo, corrigido na raiz:** o `<pre>` do `CodeBlock` é `overflow:auto` e nunca foi focável — código mais largo que a caixa era inalcançável por teclado em **qualquer** página, e quem achou foi o `catalog-sweep` quando a linha de import cresceu. Mais a **Decisão 3** da [ADR-0019](../decisions/0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md): a gaveta continua não-modal | validate OK (30 checks) · pack OK (react:51) · **366/366** · playwright **95 passed · 1 skipped · 0 failed** · zero pixel · `pnpm audit` limpo | este |
| 10/08/2026 | **I** | **I2 `ReviewCompare`** — as cinco regiões do contrato, com a decisão **derivada da tabela de transições** e sem excluir nada, porque o `ReviewCompare` **não tem região `actions`**. O recibo **nasce do `apply`** (no I1 existe desde o aceite) e o `rollback` **aponta** para ele. A diferença é marcada em **texto** — o `+`/`-` do diff unificado —, que é a **única cláusula do contrato em que as duas referências reprovam**: Langfuse pinta a linha, Kibo deixa o Shiki consumir o marcador ([`REFERENCES.md`](REFERENCES.md)). Teste provado contra **seis** defeitos. **Um achado fora do escopo, corrigido com autorização:** o bloco do **I1 rolava** — o registro dele comparou a altura contra a caixa do demo (457) e não contra o painel (**354**), que é o vão de verdade. Foi de 447 para **347**; o I2 fecha em **326** | validate OK (30 checks) · pack OK (react:51) · **403/403** · playwright **95 passed · 1 skipped · 0 failed** · 2 baselines `-win32` regravadas (o crachá de Blocks foi de 8 para 9) | este |
| 10/08/2026 | **I** | **I3 `ResourceWorkbench`** — as seis regiões, e **metade da parte já estava construída**: a fila com progresso, soma de verificação e conflito é a Parte G. `source` e `collection` não viram `role=group` porque já são marco nomeado (`role=tree`, `role=table`). O número do progresso sai de **um lugar só**, para a barra e a frase nunca discordarem. Teste provado contra **cinco** defeitos. **Duas falhas de construção, e as duas achadas por OLHAR a imagem:** `.table` exige `min-width:720px` e a coluna `State` saía cortada da tela; e a minha medição de truncamento do rótulo da árvore olhava o `<span>` do glifo, não o `.tree-label` — disse "inteiro" para os três e o tema claro mostrou `Typo…` | validate OK (30 checks) · pack OK (react:51) · **438/438** · playwright **95 passed · 1 skipped · 0 failed** · 2 baselines `-win32` (o crachá de Blocks foi de 9 para **10** e ganhou um dígito: 1084 pixels) | este |
| 10/08/2026 | **I** | **I4 `AnalyticsWorkbench`** — **oito** regiões, a primeira de `applicationPatterns`. **Duas mudanças de infraestrutura autorizadas:** `--chart-h` no core (default 220px inalterado, idioma do `--qr-size`) e **`prerender` para BLOCO** no gerador — sem ele, gráfico dentro de composição sai caixa vazia, e o I8 precisa do mesmo. Abas **medidas e recusadas** (o Base UI não renderiza o painel inativo no HTML estático); a tabela é `DataGrid` porque 2 de 7 linhas é resumo, não alternativa. Teste provado contra **cinco** defeitos, e o da frase universal mostra as duas redações lado a lado. **O guarda do prerender mentiu pela TERCEIRA vez:** deu o gráfico por pronto com o `<svg>` do ícone do botão de exportar. **Achado fora do escopo, registrado como tarefa:** o Base UI avisa `nativeButton` só no caminho de cliente — atinge quem instala, não o catálogo. **O alcance que eu registrei (17) estava errado: é UM**, corrigido em `52395b8` | validate OK (30 checks) · pack OK (react:51) · **464/464** · playwright **95 passed · 1 skipped · 0 failed** · 2 baselines `-win32` (crachá de Blocks 10 → 11) | este |
| 11/08/2026 | — | **fora do plano: as 10 prévias que ROLAVAM, e o gate que faltava.** Medido nas 206 páginas: 10 de **520** caixas de demo exigiam rolagem, contra a [ADR-0002](../decisions/0002-altura-fixa-do-demo.md), e **nenhum teste olhava**. Três causas — CSS de altura fixa (5), grid responsivo colapsado em uma coluna (1) e conteúdo alto demais (4). Nasce a **quinta válvula** do core, `--log-h` (default 240px inalterado), e o `catalog-sweep` passa a medir a rolagem VERTICAL da caixa, **provado contra as três causas** | validate OK · **662/662** · playwright chromium **62/62** · **0 de 524** rolando · zero pixel | este |
| 11/08/2026 | **I** | **I6** · **I7** · **I8** — **A PARTE I FECHA**, 8 de 8. **I6 `DeviceControl`**: primeiro contrato SEM estado terminal (dispositivo não termina), e a palavra "confidence" virou o vocabulário do domínio por pesquisa — OPC UA **Good · Uncertain · Bad**, com a leitura congelada caindo para `Uncertain · last usable` e nunca `Good`. **I7 `MediaLibrary`**: primeira com um MOTOR dentro, então a barra de ações **não repete o transporte**, e a seleção é uma constante que a galeria, o detalhe e o player leem. Custou a válvula **`--media-h`/`--media-ar`** no core (autorizada, default inalterado), e a referência explicou de graça que o `aspect-ratio` existe por **CLS**. **I8 `VisualBuilder`**: o **outline é a alternativa sem arrastar** e sai da mesma fonte do canvas; segredo é referência e o teste reprova até a máscara; e o **`prerender` que o I4 previu não foi necessário**. Testes provados contra **11 + 12 + 11** defeitos, e **três acharam defeito meu**: travas que cobravam a palavra em vez da regra. **Achado fora do escopo, medido e registrado como tarefa: 10 de 520 prévias do catálogo ROLAM**, contra a ADR-0002, e nenhum gate olha isso | validate OK (30 checks) · pack OK (react:51) · **662/662** · playwright **95 passed · 1 skipped · 0 failed** (chromium+webkit) · 2 baselines `-win32` (crachá de Blocks 12 → **15**) · zero pixel nas outras 59 | este |
| 11/08/2026 | **I** | **correção do I5, e ela é sobre MÉTODO:** a busca de referência tinha sido por **nome de pasta** e perdeu o `order-summary` do tool-ui (296 linhas + esquema Zod). Refeita por CONTEÚDO, são **2 de 16** e não 1. A leitura tardia trouxe quantidade × unitário separados, com o total da linha derivado e gateado. E o `tabular-nums` que eu copiei dela foi **medido e rejeitado**: no IBM Plex Sans e no Segoe UI é **no-op** (uma largura de dígito com e sem), e no IBM Plex Serif nem funciona — eu ia pedir autorização para pôr no core uma regra que não muda pixel. `font-variant-numeric` é tipografia, que o `BUILDING.md` §1 proíbe extrair de referência. Mais a confirmação de que o `variant summary\|receipt` deles impõe por TIPO a mesma divisão que eu medi pelo contrato | validate OK · **526/526** · playwright chromium **61/61, zero pixel** | este |
| 11/08/2026 | **I** | **I5 `TransactionFlow`** — as **sete** regiões, e a primeira composição em que **nenhum estado tem todas**: `review` é antes do commit, `receipt`/`reversal` só depois. Publica `settled` (seis, e o único terminal com ação). Também a primeira em que a busca por anatomia devolveu **1 de 16** referências, então o item nasceu de **pesquisa registrada** — valor em inteiro (TC39 `Decimal` em stage 1), `Intl` com **código** de moeda, `Idempotency-Key` (draft IETF, não é RFC) e **PCI DSS 4.0.1**: `payment` é referência e a composição tem **zero** `input`, com gate. O total é **somado**; a referência que existia escreve o dela à mão em **quatro** lugares. As ações moram na região que afetam, porque este contrato não tem `actions`. Teste provado contra **oito** defeitos. **Duas correções vieram de OLHAR a imagem:** a pilha de dinheiro desalinhada em 74px (duas faixas no lugar de duas colunas) e a região de reversão que era uma barra sem palavra nenhuma. **Achado fora do escopo, registrado:** `patterns/commerce_finance.md` promete `.flow-panel`/`.flow-summary`/`.flow-total`, e as três **não existem no core** | validate OK (30 checks) · pack OK (react:51) · **526/526** · playwright **95 passed · 1 skipped · 0 failed** (chromium+webkit) · 2 baselines `-win32` (crachá de Blocks 11 → **12**) · **`-linux` PENDENTES** | este |
| 11/08/2026 | **K** | **K1 marcado** (ordem do Victor: o Firefox rodou e passou no contêiner) e **a decisão do `0.2.0`**, delegada por ele e registrada na [ADR-0020](../decisions/0020-a-proxima-versao-e-0-2-0-nao-1-0.md). O argumento que decide sozinho: a `1.0` exige **consumidor real instalando do npm**, e o que está no npm **quebra na hora** dentro de um componente de servidor — esperar o consumidor era esperar por uma coisa que a espera impedia. Em semver `^0.1.0` **não pega** `0.2.0`, então cinco quebras num minor de `0.x` não surpreendem ninguém. Nasce o item **K5** (o total vai a 81), porque dobrar um publish inteiro dentro do K4 o deixaria sem checkbox | validate OK · pack OK · 662/662 | este |
| 11/08/2026 | **K** | **K3 — o changelog, e ele estava mais vazio do que o enunciado supunha.** Medido de `a0dd056` (o publish) até `HEAD`, **99 commits**: 27 componentes, 70 nomes exportados, **39 props** em componentes preexistentes e **zero remoção** de API. As quebras não eram as duas da Parte B: são **cinco**, e as duas que faltavam são **de CSS** — as 5 regras de ELEMENTO que estilizavam **toda `<table>` do consumidor** (regras sem classe: 14 → 9) e 14 classes removidas. A **Parte F não quebrou nada**. Duas imprecisões minhas de 06/08 corrigidas: o `AvatarGroup` **não existia** na `0.1.0`, e o `<Avatar/>` sem prop **encolhe 4px** (o default era `size={40}` inline, hoje é `md` = 36px) — a frase antiga comparava o que o core declarava, não o que a tela mostrava. O `FileEntry` **parecia** quebra e não é: nunca foi exportado. Idioma **inglês** por decisão do Victor (o arquivo não vai em tarball nenhum, mas está ao lado de um README em inglês); as 127 linhas antigas traduzidas no mesmo passo. Nasce o **check 31** com `scripts/released-surface.json`, provado contra **quatro** injúrias, duas delas defeitos do próprio gate (substring, e nome citado em versão já publicada). **Duas reincidências minhas:** a medição leu **comentário como código** (4ª vez nesta casa) e eu **copiei um número do plano** — "19 de 22" módulos com a diretiva era de 06/08; são **21 de 24** | validate OK (**29 checks** — é o número que o `manifest.json` MEDE, `gates.validate`; as linhas acima escreveram "30" à mão e o gerado dizia 28. O I1 dentro do próprio registro do I1) · pack OK (react:51) · **662/662** · playwright chromium+webkit | este |
| 09/08/2026 | **J** | **J1 · J2 · J3 — A PARTE J FECHA**, com **sete** estados e não seis ([ADR-0018](../decisions/0018-estados-universais-sao-um-eixo-a-parte.md)): `waiting_dependency` estava no contrato e fora do plano. Eixo próprio (`state` × `variant`), **zero token novo** e **zero CSS novo**. Nasce o **check 30**, com a lista LIDA do `pure.tsx` e provado nos dois sentidos. **Três defeitos achados por gate, nenhum por leitura:** o check 11 lendo `UNIVERSAL_STATES` como um componente · a trava nascida forte demais, desmentida pelo `HealthMatrix` na estreia · o `DataGrid` marcando o RECADO em vez de si mesmo | validate OK (**30 checks**) · pack OK (react:51) · **332/332** · 61/61 · zero pixel · `pnpm audit` limpo | este |
| 12/08/2026 | **K** | **K5 — a `0.2.0` ESTA NO NPM**, os seis, medidos com `npm view` e nao na tela. A ADR-0020 dizia que as tres coisas do publish acontecem juntas; medido que e **obrigatorio** — com o bump aplicado e a superficie velha o check 31 reprova nomeando os 27 componentes, e nao ha ordem sem um commit vermelho no meio. **Eram oito arquivos de versao, nao seis** (a raiz privada do workspace acompanhou a `0.1.0`, e o `aurea.contract.json`). A receita da ADR tem um **laco**: manda regerar o `released-surface.json` de `git show <commit>:manifest.json`, e o arquivo mora dentro desse commit — o campo `commit` saiu com a palavra `PENDENTE` e o hash entrou no commit seguinte, em vez de `--amend` no commit ja publicado. **Dois achados, um corrigido e um registrado:** o comando de publish da ADR-0013 encadeia com `&&`, que o **PowerShell 5.1 nao tem** — a forma do PowerShell entrou ao lado; e **nada cobra que os seis pacotes versionem juntos** (o check 31 le so o `react`), que e o I1 no eixo da versao, deixado como tarefa por nascer no meio de um publish. A restricao de 2FA do npm foi **pesquisada, nao lembrada**: atinge token, nao publicacao interativa — e poe prazo no K2 | validate OK (29 checks) · pack OK (react:51) · **662/662** · playwright **97 passed · 1 skipped · 0 failed** (nao repetido depois do bump: nenhum arquivo de `apps/catalog/` mudou) | `450d8df` + este |
| 12/08/2026 | **K** | **K2 ADIADO por decisao ([ADR-0021](../decisions/0021-o-publicador-confiavel-fica-adiado.md)) e nasce o `check-published.mjs`.** O K2 sai da fila **sem ser feito**: a ADR-0013 rejeitou o token pelas razoes certas e **nao listou a saida de nao automatizar**, que e a unica em que nao existe segredo para vazar — dois publishes a mao, de minutos, com a CI parada por um mes. Gatilho de volta e **frequencia ou maos**, nunca data, e explicitamente NAO "a CI voltou". O checkbox fica desmarcado, porque nao foi feito. **E o controle que faltava:** todo gate deste repositorio mede a ARVORE, e foi por isso que a `0.1.0` ficou DOZE DIAS no npm sem instalar em RSC sem ninguem poder ver. O `check-published.mjs` instala **do registro** num projeto limpo fora do repo, reusando `proof-server` e `proof-client` com `workspace:*` trocado pela versao — reuso, nao um terceiro app. **Provado nas duas direcoes E em tres camadas:** a `0.2.0` passa (exit 0); a `0.1.0` reprova por `Export Toggle doesn't exist` (compatibilidade — o Toggle nasceu no Lote 1); tirado o Toggle, reprova por **TS2882** no `./css` sem condicao `types`; e desligada a checagem de tipos, reprova por `TypeError: (0, d.createContext) is not a function` — **este e o defeito de RSC**. O registro e a CADEIA e nao a frase, porque a primeira leitura me fez afirmar "prova RSC" quando eu tinha medido export ausente. **Dois defeitos meus dentro do proprio script:** a mensagem de falha dizia so `Build error occurred`, sem nomear causa (e a regra do E13), e as constantes da extracao nasceram DEPOIS do laco que as usa — `ReferenceError: Cannot access RUIDO before initialization`, que `node --check` **aprova**, porque e erro de execucao e nao de sintaxe | validate OK (29 checks) · `pnpm published:check` OK na 0.2.0 · reprova na 0.1.0 | este |
| 15/08/2026 | **L** | **A PARTE L FECHA, 6 de 6, e sem UMA dependência nova** — e em três itens isso foi decisão medida contra o padrão de mercado: o `embla-carousel` (as QUATRO referências o embrulham; o `@base-ui/react` não tem carrossel, 46 pastas), o `@dnd-kit/core` (é o `list` e o `kanban` do kibo) e a biblioteca de moeda (o motor já aceitava `Intl.NumberFormatOptions`; a nossa casca é que não repassava). O que substituiu cada um já estava pago: contêiner de rolagem com `scroll-snap`, `PointerEvent`, e o `Intl` da plataforma. **O L4 veio antes do L2** porque o ladrilho da galeria É um `Image` (regra 9 da DIRECTION). **A referência indicada nem sempre tinha a anatomia** — a da galeria estava na `tool-ui-main` e não na `media-chrome` —, e **duas ensinaram pelo AVESSO**: o `aspect-ratio` do kibo é um componente para emular o que a propriedade CSS já faz, e o `typography` do `ui-main` é receita em classe utilitária, modelo que não serve a quem entrega CSS. **O L6 encolheu para duas props e cresceu em evidência:** três medições independentes contra mascarar ao vivo — a reprovação de WCAG 2.1 AA do próprio USWDS, o abandono da máscara pelo MUI na v6 (`masked-input-bad-ux.mp4`) e a prática corrente. **Quatro defeitos achados pela MEDIÇÃO, não por gate:** o `aspect-ratio:auto` que produzia altura ZERO no caso mais comum do `Image` (a regra contra o salto de layout produzindo o salto) · a cápsula do selecionado que sumia por empate de especificidade com `.is-selected` · a legenda que fazia o leitor de tela anunciar duas vezes · e o **link de texto no tema claro a 1,68:1**, reprovação de WCAG AA latente desde sempre no core, que só apareceu quando o catálogo ganhou a primeira página com link em corpo de texto. Curado com a fórmula que já estava escrita para o `.btn-link-primary` (6,92:1 depois), escopado em `:not([class])` para não passar por cima de componente nenhum. **E um quinto, do REPOSITÓRIO:** comentário de BLOCO citando o nome de uma prop entre crases fez uma classe do core parecer produzida pelo pacote React — 3ª vez que um gate daqui lê prosa como código | validate OK · pack OK (react:51) · **760 testes** · chromium **sweep 14/14** + **pixel 22/22 sem um pixel de diferença** · webkit **26/26** · 4 baselines `-win32` regravadas (6 páginas novas na navegação) · **`-linux` pendentes** · **Firefox NÃO rodou**: o binário do Playwright parou de iniciar nesta máquina no meio da sessão (SxS, `mozglue` — confirmado no log de eventos do Windows), e a reinstalação com `--force` é decisão do Victor | este |
| 13–15/08/2026 | **L–O nascem** + **M** | **A Parte M FECHA, 7 de 7, e sem UMA dependência nova.** A sessão começou no catálogo (tema que persiste, lateral que abre no item atual, os últimos previews vazios, os três tamanhos do QRCode) e virou medição dos consumidores reais do Victor — nove superfícies em seis projetos, lidas e NUNCA tocadas. Dela nasceram as partes **L, M, N, O** (§15–19). Entregues na M: `ConfirmDialog`, `AccessGate`, `DataState`, `useAureaTheme`, `screenState*`, `Form`, `CommandPalette`. **A lição da sessão foi de MÉTODO, e o Victor a deu duas vezes:** (1) *"não existir referência na pasta não quer dizer que não é pra criar, deve buscar na internet"* — eu tinha fechado o M4 como "não é componente" por achar zero nas cinco pastas, e o §Passo 4 do BUILDING.md já mandava pesquisar; a pesquisa devolveu o padrão com nome e o desenho (ADR-0023, reescrita e não apagada). (2) Em quatro itens a pesquisa serviu para dizer o que **NÃO** construir — `next-themes`, `nuqs`, `react-hook-form`, `cmdk` —, e em três deles o motor que já se paga (`@base-ui/react`) tinha a peça. **E eu reportei um gate verde que não era:** `| tail` engole o código de saída, e a varredura tinha 4 reprovações nos meus dois componentes novos (axe da paleta, salto de título e rolagem do DataState) — corrigidas, com a cobrança de axe trazida para o teste de unidade | validate OK (30 checks) · **728 testes** · pack OK · skin 2/2 · catalog 16/16 · **sweep 14/14** | `bfddb7d` |
| 15/08/2026 | **N** | **A PARTE N FECHA, 1 de 1, e o resultado é um NÃO registrado** ([ADR-0025](../decisions/0025-editor-por-blocos-sem-motor.md)): o `BlockEditor` entrega a **moldura** dos blocos e o motor de texto rico fica com o consumidor — a opção que o próprio item previa, agora com medição atrás. **A referência indicada não era o mesmo componente**, e é a primeira pergunta do BUILDING §2: o `editor` do kibo tem 39 exports e 17 dependências (TipTap 3.6.6 sobre ProseMirror), **18 dos 39 só de tabela**, e é editor de DOCUMENTO ÚNICO — lista de blocos, reordenação e bloco de imagem com legenda **não existem lá**. **O que fechou a porta foi SEGURANÇA, não peso:** o navegador não sanitiza HTML colado, e quem é dono da superfície de edição é dono do XSS de colagem — a pesquisa confirma que ProseMirror e Lexical tratam o `contenteditable` como alvo de renderização e nunca como fonte da verdade por isso mesmo. A Aurea não pode decidir o que é seguro renderizar no domínio do consumidor. **Pesquisa registrada:** TipTap 3 (MIT no editor, pago na nuvem) · BlockNote (**MPL-2.0**, e a Aurea é Apache-2.0) · Editor.js · Lexical · e a plataforma — `contenteditable="plaintext-only"` **virou Baseline**, a **EditContext API NÃO é** (só Chromium). **Uma medição mudou o desenho:** ia ser prop da `SortableList`, até medir que o rótulo dela é `<span>`, que só aceita conteúdo de frase — `<figure>` ali é marcação inválida, e bloco de imagem com legenda é literalmente o que o item pede. **A extração que isso pagou:** o protocolo de arrasto saiu para o `useReorder` do `internal.tsx` porque o `BlockEditor` virou o segundo dono dele, e a DOM da `SortableList` não mudou — quem prova são o pixel e o `skin.spec`. **Dois defeitos meus achados por gate, não por leitura:** o axe reprovou o `<textarea>` sem rótulo do meu próprio fixture (corretamente — o rótulo é do consumidor), e a prévia do catálogo exigia rolagem, **502px numa caixa de 354**, contra a ADR-0002; encolheu em duas medições até 2 blocos. **E uma contagem à mão vencida saiu do `04-PROTOCOLO-IA.md`:** dizia "19 ADRs" e o repositório tinha 24 — o achado I1 acontecendo no arquivo que serve de ponto de partida | validate OK (30 checks) · pack OK (react:51) · **769 testes** · skin 4/4 · **sweep 28/28** (chromium+webkit) · pixel: 10/16 intactas, **6 `-win32` regravadas** (1 componente novo em Inputs; diff conferido: só os contadores no topo e o deslocamento da lista) · **`-linux` pendentes** · **Firefox NÃO rodou** (SxS/`mozglue`, decisão do Victor) | este |
| 15/08/2026 | **O** | **A PARTE O FECHA, 2 de 2 — E COM ELA AS PARTES ACABAM.** O **O1** não terminou em "não vale": medido com comando (`node scripts/measure-boundary.mjs`), **22 de 105 exports não precisavam de cliente por nada que faziam**, e importar `Card` — uma `<div>` — embarcava **9 módulos e 118,5 KB**, porque a diretiva contamina o módulo inteiro e o fecho dele. Agora eles moram no `markup.tsx`, sem diretiva: fecho de **2 módulos e 27,3 KB**, e pelo barril não vai JavaScript nenhum ([ADR-0026](../decisions/0026-marcacao-pura-e-de-servidor.md)). **A prova de que dava para fazer já estava no repositório:** o `Accordion`, da mesma natureza, custava **0,3 KB** — a diferença era só o arquivo em que ele caiu na Fase 9. **A medição corrigiu o enunciado do próprio item em três pontos:** `chart`, `qrcode` e `calendar` são de cliente pelo MOTOR e não pelos nossos hooks; `Table` PRECISA de cliente; e o problema estava em nove módulos, não quatro (o `inputs` sozinho tinha seis). **E uma medição errada minha foi pega antes de decidir** — a primeira versão adivinhava o motor pelo nome do pacote e daria `Calendar` e `ChartLegend` como puros, mandando para o servidor o que o navegador precisa montar. **Sem quebra de API**, com **check 35 provado contra o defeito** — e a prova DERRUBOU a explicação que eu tinha escrito: tirar um nome da linha explícita não faz o componente sumir, faz ele **voltar a ser cliente em silêncio**, com `tsc` verde e testes passando. O texto foi corrigido para o que foi medido. O **O2** produziu o [`NATIVE.md`](NATIVE.md) e **não construiu nada**, como mandava: a New Architecture do RN deixou de ser opcional (legada REMOVIDA no Expo SDK 55/RN 0.83), o Unistyles v3 se confirmou como par filosófico, o NativeWind saiu por medida (197 ms contra 49 do StyleSheet) — e o achado que decide 152 tokens é que **nenhuma fonte confiável diz que o `StyleSheet` aceita `oklch()`**, sendo o amarelo primário intocável e a conversão para sRGB com perda. Por isso a Etapa 1 proposta é medir a cor no aparelho | validate OK (**33 checks**, medido no `manifest.json`, que é gerado — eu tinha escrito 31 à mão e a linha da Parte N diz 30, as duas erradas: o número era 32 antes deste item. **Terceira vez na mesma sessão** que contagem à mão apareceu, agora na minha própria; e a renumeração do check para **35** saiu de outra medição — o 29 que eu escolhi **já existia**, e o validador conta números DISTINTOS, então a colisão passaria calada) · pack OK (react:53) · **769 testes** · suíte visual completa nos dois motores · zero pixel novo | este |
| 15/08/2026 | — (`NATIVE.md`) | **Etapa 1 do nativo, autorizada e FEITA** — e ela admitia terminar em "hex serve", mas terminou no contrário ([ADR-0027](../decisions/0027-a-cor-no-alvo-nativo.md)). Medido por comando (`node scripts/measure-color-native.mjs`): a superfície real são **95 valores `oklch`**, não 152 (o resto é 42 alias + 15 já em sRGB); **20 dos 95 estouram o gamute sRGB**, o amarelo da marca entre eles, cortando para `#f0b100` a **ΔEok 0,02247** — e o limiar de perceptível publicado para ΔEok é **≈0,02**, então cai EM CIMA dele, não abaixo. **A pergunta que decidiu:** numa tela sRGB o navegador corta IGUAL — provado lendo o pixel rasterizado, 95 de 95, diferença máxima de 1/255 —, então hex não perde nada ali; a perda é nas telas de **gamute largo**, que é o que os aparelhos têm (todo iPhone desde 2016/17). Em `display-p3` os 20 rasterizam diferente: amarelo sRGB `rgb(240,177,0)` contra P3 `rgb(230,179,19)`. **Decisão: o nativo não recebe hex sozinho** — o adapter emite largo onde a plataforma suporta e hex como fallback, e o fallback é este, porque é byte a byte o que a web já pinta. **A Etapa 2 muda de escopo antes de começar.** **E um defeito meu dentro da própria medição:** a primeira validação imprimiu "0 de divergência" tendo comparado **ZERO** cores — lia `getComputedStyle` e o Chromium devolve `oklch()` sem resolver, então o filtro pulava todas. Verde que não era, agora dentro do script que ia decidir; trocado para canvas 2D, que obriga o motor a rasterizar em bytes. **NÃO rodou em aparelho** (Windows, sem SDK Android; simulador iOS exige macOS) e a ADR declara os três pontos que ficaram para a Etapa 2 | validate OK (33 checks) · pack OK · nada em `packages/` mudou, então nem render nem teste se moveram (o `STATE.md` regravou idêntico) | este |
| 15/08/2026 | — (`NATIVE.md`) | **Etapa 2 do nativo, autorizada e FEITA — zero componente**, como o item exigia. O alvo é `@aurea-uds/tokens/native`, gerado pelo MESMO `build-tokens.mjs` (o parser do DTCG continua sendo um só) e cobrado pelo **check 36**, provado contra o defeito: token novo na fonte sem regravar o alvo reprova. **Quatro impedâncias que o CSS esconde:** não há cascata (alias resolvido no build, por grupo) · não há `rem` (**1rem = 16dp**, MEDIDO no navegador) · não há `em` (os 5 `tracking` saem como RAZÃO — `letterSpacing` no RN é absoluto, e emitir dp acertaria num tamanho de fonte só) · não há `@media` (os 5 breakpoints saem à parte, declarados como não sendo para `StyleSheet`). **A sombra ficou MELHOR que o previsto:** o plano dizia `shadowColor`/`elevation`, que perdem `spread`; medido, o **RN 0.76+ tem `boxShadow`** com sintaxe do CSS inclusive `spreadDistance`, e a Nova Arquitetura é obrigatória desde o Expo SDK 55 — mapeamento 1:1 e sem perda. **DOIS DEFEITOS, e um é do arquivo de tokens:** `base.text-muted` estava `$type:"dimension"` apontando para uma COR — o CSS nunca reclamou porque alias vira `var()` antes de o tipo ser olhado, e a página do catálogo desenhava uma RÉGUA para uma cor; corrigido na fonte, e o CSS saiu **byte a byte idêntico**, o que prova que a correção não tocou o alvo web. O segundo era meu: o gerador emitia `undefined` em silêncio e o `JSON.stringify` descartava a chave — agora ele morre. **Seis tokens do `base` saem DENTRO de cada tema** (`text-muted` e os cinco `oracle-*`): apontam para folhas que só existem por tema, e em JS não há ligação tardia. **As matrizes de cor foram provadas contra o rasterizador**, como na Etapa 1 — `p3` emitido contra `oklch` da fonte no mesmo canvas P3, **95 de 95, máximo 1/255**; a primeira rodada acusou 229 e era o MEU harness reconstruindo a cor sem o alfa. **Falta hardware, não trabalho:** os três pontos de aparelho da ADR-0027 não são executáveis nesta máquina. **E um defeito PRÉ-EXISTENTE foi sinalizado sem desvio:** 198 `[object Object]` na página de tokens do catálogo, contagem idêntica antes e depois | validate OK (**34 checks**, medido) · pack OK (tokens:8) · **769 testes** · suíte visual **103 passed / 1 skipped / 0 falhas** nos dois motores · pixel: 14/16 intactas, **2 `-win32` regravadas** (a linha do `text-muted` mudou de tabela), diff conferido | este |
| 15/08/2026 | — (`NATIVE.md`) | **A ADR-0027 foi CORRIGIDA no mesmo dia, e a lição é de método.** Eu tinha classificado três pontos como "precisa de aparelho" e cheguei a mandar o Victor instalar Node, Expo e Expo Go, criar projeto e parear celular — que **não pareou**. Dois desses pontos não precisavam de celular nenhum, e o terceiro já estava respondido: o `StyleSheet` do React Native resolve cor com `@react-native/normalize-colors`, que é **JavaScript puro e roda no Node**. Medido em `node scripts/measure-color-rn-parser.mjs` (novo, e a dependência **não entra no repositório** — o script a procura onde já exista, pelo `BUILDING.md` §3.3): o interpretador **RECUSA** `color(display-p3 …)`, `color(srgb …)`, `oklch()`, `oklab()`, `lab()`, `lch()` e `color-mix()`; aceita hex, `rgb()`, `hsl()` e `hwb()`. Conferido em **duas** versões para não parecer defeito de uma — a **0.81.5** (Expo SDK 54) e a **0.87.0**, a mais recente —, e o interpretador é JS compartilhado, então não há um lado onde funcione. **O que muda:** `hex` não é o *fallback* do alvo nativo, é o **único caminho vivo**; `p3` e `oklch` ficam como intenção registrada, não API consumível. E a perda de **ΔEok 0,0225** no amarelo, em tela de gamute largo, **deixa de ser evitável** — é teto da plataforma, e fica declarada. **O que sobra de fato não medido:** `PlatformColor()`/`DynamicColorIOS()`, que buscam cor por nome num catálogo nativo e não passam pelo interpretador — é a única hipótese viva de gamute largo. **A lição:** classifiquei como "falta hardware" uma pergunta que era **de biblioteca**, e o custo caiu no Victor. Antes de declarar que falta hardware, procurar a parte da pergunta que é software | validate OK (34 checks) · pack OK · CSS e `packages/core/dist` **inalterados** (nada visual se moveu, então nem render nem teste precisaram rodar) | este |
| 15/08/2026 | — (`NATIVE.md`) | **Etapa 3 do nativo, autorizada e FEITA — e a ADR-0028 não existe para confirmar a escolha, e sim para MEDIR o que ela custa**, porque a recomendação que a sustentava vinha de resumo de busca. Medido no pacote instalado (numa pasta descartável; **não entrou no repositório**): **Unistyles 3.3.0, licença MIT** — compatível com a Apache-2.0 —, React Native ≥ 0.76 no contrato e ≥ 0.78 na documentação, Nova Arquitetura. **O custo que a minha recomendação escondia: não é UMA dependência, são CINCO** — `react-native-reanimated` e `react-native-nitro-modules` entre elas, as duas nativas —, e **não roda no Expo Go**. **E ele NÃO destrava a cor:** o `peerDependencies` dele traz o mesmo `@react-native/normalize-colors` que a correção da ADR-0027 mediu recusando gamute largo, então a pergunta "e se o Unistyles resolvesse?" está respondida antes de ser feita. **A razão que pesou não é desempenho** (o `StyleSheet` puro é mais rápido, 49,74 ms contra 66,40): é filosófica, a mesma da web — **o Unistyles não traz componentes**, então não disputa a identidade, que foi o motivo de o Tamagui ter sido recusado em 18/07. **O achado que a Etapa 4 herda:** o Unistyles tem **um** eixo de tema e a Aurea tem **dois** (tema × densidade, seis combinações), e as `variants` dele são por folha de estilo, não globais — duas saídas declaradas na ADR, e escolher exige o app na frente. **Nesta sessão também foi FUNDIDO** o galho da sessão paralela (`8b1ca56`): `[object Object]` na página de tokens, 198 → 0, com a serialização virando módulo compartilhado. Fusão testada com `merge-tree` antes — limpa, apesar de as duas sessões terem mexido no `build-tokens.mjs` | validate OK (34 checks) · pack OK · build reproduz a árvore | este |
| 15/08/2026 | — (catálogo) | **O defeito irmão da página de tokens, autorizado e corrigido — e ele era MAIOR que o relatado.** A sessão paralela achou e parou de propósito, porque havia decisão de apresentação no meio; fez certo. Medido por mim no navegador antes de tocar em nada: **261 de 261** chips mostravam um nome que **não existe** no CSS, **153 de 153** amostras de cor computavam `rgba(0,0,0,0)` (caixas vazias) e **84 de 84** réguas caíam em `auto`, todas do mesmo tamanho. A página inteira de referência de token dizia o que não é. **Causa de uma linha:** o `flattenTokens` montava o nome com o CAMINHO (`base-brand-yellow`) e o `build-tokens.mjs` emite a FOLHA (`--brand-yellow`) sob o seletor do grupo — e `var()` que não resolve não dá erro, dá transparente. **Por que gate nenhum viu:** o check 17 pergunta se há conteúdo, não se ele é verdade; e as 102 fichas sempre usaram a folha, então a paridade do check 5 seguia verde. **A decisão que travava, resolvida por número** ([ADR-0029](../decisions/0029-a-pagina-de-tokens-mostra-o-nome-real-e-o-escopo.md)): **70 dos 175 nomes valem em mais de um grupo** (56 dark+light, 8 base+densidades, 6 base+light), então a folha sozinha não identifica a linha — e isso não é ambiguidade a esconder, é como o CSS funciona. A página passa a mostrar o nome REAL mais uma coluna com o SELETOR sob o qual ele vale, tirada do próprio `$extensions.ui.aurea.selectors` para não criar um segundo mapa. **E a amostra carrega o próprio escopo:** sem isso a linha de `theme.light` seria pintada com o valor de `dark` numa página escura — mentira mais discreta que a caixa vazia, e por isso pior. **Provado depois:** 0 transparentes, 41 larguras distintas, e dos 56 pares dark/light **44 pintam diferente** — os 12 que pintam igual são exatamente os invariáveis por design (`--primary` e derivados, `--focus`, os cinco `--chart-*`), que é a regra do `CLAUDE.md` aparecendo na medição. **Quem mais tinha o problema? Ninguém**, verificado. **E uma faixa magenta no topo da captura me fez parar e medir:** é a máscara do próprio Playwright, idêntica na baseline antiga — pré-existente, não defeito, e não era minha para "consertar" | validate OK · pixel: 14/16 intactas, 2 `-win32` regravadas com o diff conferido | este |
| 16/08/2026 | — (infra) | **As baselines `-linux` deixaram de ser pendência — e nunca deveriam ter sido.** Eu vinha escrevendo "fica para o contêiner de outra máquina" sessão após sessão como se fosse fim de linha; o Victor avisou **"pela milionésima vez"** que existe um minipc Linux na rede local dedicado exatamente a isto. **A regra virou global** (`~/.claude/rules/`, fora do repositório), não do projeto: antes de dizer "precisa de outra máquina", lembrar que ela existe. **Como foi feito, seguindo o que o projeto já mandava:** código por **git bundle** (push suspenso), e as capturas geradas de dentro da imagem FIXADA `mcr.microsoft.com/playwright:v1.61.1-noble` via **podman** — porque o `ci.yml` avisa que a rasterização depende da máquina e que o chromium da imagem **não se reinstala**. **O resultado é a prova de que o contêiner reproduz:** das 22 baselines, **só 8 mudaram** (índice, lateral, topo e tokens × dois temas) e as outras **14 saíram byte a byte idênticas**. Regravadas com `--update-snapshots` e reconferidas na sequência: **22 passed** nas duas rodadas. **Duas coisas que teriam quebrado e foram pegas antes:** o `webServer` do playwright chama `python` e a imagem Ubuntu só tem `python3`; e a chave SSH já existia — **a senha nunca foi necessária**, e por isso não entrou em memória, documento nem commit. O `~/.ssh/config` do Victor aponta para um IP que morreu (`.9`), e isso ficou avisado a ele, não corrigido em silêncio | validate OK · pixel local (win32) **22/22** · pixel no contêiner (linux) **22/22** | este |
| 16/08/2026 | — (infra) | **O Firefox roda, e a frase que dizia o contrário era minha, herdada e nunca conferida.** O bloco "COMECE POR AQUI" afirmava desde 15/08 que o binário falhava em SxS e que a correção exigia reinstalar com a flag que o hook bloqueia — e eu **repeti isso em três registros de sessão sem voltar a testar**. Testado hoje: `firefox.exe --version` devolve **Mozilla Firefox 151.0**, exit 0, binário íntegro (61 arquivos, 327 MB, `mozglue.dll` no lugar). **Nada reinstalado, nenhuma flag bloqueada usada.** **A suíte completa nos TRÊS motores: 143 passed · 2 skipped · 0 failed** (chromium 63, firefox 40, webkit 40) — primeira vez que a promessa da [ADR-0019](../decisions/0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md) fica inteira. **Uma armadilha quase me fez reinstalar 327 MB à toa:** o `PrintDeps.exe` do próprio Playwright reporta `mozglue.dll => not found`, e é **falso positivo** — ele não procura na pasta do executável como o carregador do Windows procura em tempo de execução. Se eu tivesse acreditado na ferramenta em vez de rodar o binário, teria "consertado" o que não estava quebrado. **A causa da falha de 15/08 não foi estabelecida e não inventei uma** — o que ficou provado é que não era permanente. **Mesma classe do erro anterior:** obstáculo registrado como permanente tem de ser reconferido antes de ser repetido | três motores **143 passed / 2 skipped / 0 failed** · validate OK | este |
| 16/08/2026 | — (consumidor) | **A demanda do primeiro consumidor, medida — e ela mostra que a Aurea está quase pronta para ele.** Lidas as **15 telas** do PWA do Victor e o relatório de requisitos, **sem tocar em um arquivo**. Resultado no [`CONSUMIDOR-1.md`](CONSUMIDOR-1.md): a demanda de um produto inteiro cai **quase toda** dentro das 103 fichas — formulários, catálogo pesquisável, datas, comprovantes, galeria, gráficos, histórico, estados de carregamento/erro/vazio, alertas, confirmação de exclusão, limites de plano (`AccessGate`), perfil e gamificação. **A ADR-0015 se provou:** construir por cobertura de contrato em vez de por pedido deixou o primeiro consumidor quase servido. **TRÊS LACUNAS medidas:** navegação inferior (não existe nada — `Topbar` e `Sidebar` são vocabulário de DESKTOP, e é a lacuna estrutural) · `Toast` em React (existe no core como JS puro, mas não há ficha entre as 103 nem módulo React que o produza) · linha de lista tocável (`DataList` é `<dl>`, `Table` é tabela; falta a linha com ícone, rótulo e seta que navega). **E UM ERRO MEU, apontado por ele pela TERCEIRA vez:** eu vinha escrevendo que o consumidor era "candidato, não consumo" e que o K4 exigia instalação do npm — quando a [ADR-0022](../decisions/0022-consumidor-real-e-projeto-do-victor.md) já tinha decidido em 13/08, **citando a frase dele**, que projeto do Victor É o consumidor real. O que falta para o K4 fechar está do NOSSO lado. Corrigido no documento e gravado como regra: **decisão registrada em ADR não se reabre em prosa.** **E uma tarefa começada sem autorização foi DESFEITA:** li um "Tentar novamente" como sinal verde e comecei a divisão dos subpaths; ele apontou, e a árvore voltou ao estado coerente — o plano ficou escrito no `COMECE POR AQUI`, que vale mais que código pela metade | validate OK · árvore limpa | este |
| 16/08/2026 | — (consumidor) | **A lacuna do `Toast` NÃO EXISTIA, e o erro era meu — mas a ida até lá achou um defeito de verdade.** Eu tinha escrito no `CONSUMIDOR-1.md` que "nenhum módulo React produz toast". Falso: o `system.tsx` publica `useToast()` desde sempre e o `AureaProvider` **já monta o viewport** — nem `<Toaster/>` existe para posicionar. **Como eu errei:** li o **registry** e concluí sobre o **código**. Não há ficha `Toast` — isso é verdade —, e ficha é *contagem*, não medida; a fonte era `grep -rn toast packages/react/src`, que devolve o hook na primeira linha. **O DEFEITO REAL, que só a leitura do código acharia:** o `system.tsx` emite `toast-${t.type}` e as classes `.toast-info/.toast-success/.toast-warning/.toast-danger` **não existiam no core** — o `AureaToastType` prometia quatro faces e as quatro pintavam idênticas. É o ponto CEGO do check 18, que só enxerga classe literal: o mesmo que já tinha deixado passar o `log-${level}`. **Respondida a pergunta "quem mais tem esse problema?"**, que é obrigatória: varridos os **18** padrões de classe dinâmica do pacote React, este era o **único** órfão (o `ev-${e.id}` do `agents.tsx` é `id`, não classe). Corrigido com o mecanismo do `.alert`/`.banner` **reusado**, não inventado — e as regras vão DEPOIS da base `.toast`, porque mesma especificidade faz a última vencer. **Dois controles, e cada um cobre uma metade:** teste de unidade para o tipo virar classe (o lado que emite) e asserção de EFEITO no `skin.spec` para a classe pintar — esta **provada contra o defeito** (removidas as quatro regras, reprova; repostas, passa). **A lacuna que sobrou é outra e é decisão do Victor:** hook público não tem página no catálogo (ficha é de componente), então `useToast`, `useAureaTheme`, `useAureaStrings` e `useSpriteUrl` são API sem lugar onde se leia — foi por isso que eu mesmo concluí que o toast não existia. Documentados por ora no README do pacote | validate OK (34 checks) · pack OK (react:69) · **774 testes** · suíte visual chromium **63/63**, zero pixel novo | este |
| 17/08/2026 | — (BottomNav + Badge) | **A lacuna ESTRUTURAL do `CONSUMIDOR-1` §4.1 FECHOU: existe `BottomNav`** — e ele recebe o **mesmo `SidebarItem`** da lateral, porque duas listas do mesmo menu divergem ([ADR-0030](../decisions/0030-a-barra-inferior-reusa-o-item-da-lateral.md)). Quatro variantes, e **duas saem de aplicativo QUE RODA**: o Victor mandou prints de WhatsApp, YouTube, Mercado Livre e Shopee, e o que os quatro fazem igual é rótulo visível em TODO item, ícone sobre rótulo e contador no canto do ícone. `flat` é 3 dos 4 (sem fundo no atual, só cor) e `surface` é o WhatsApp (realce só no ÍCONE, rótulo embaixo e fora dele). **`Badge` reescrito no mesmo dia** a pedido dele — *"o nosso atual é pobre"* —: 14 capacidades lidas no fonte local da Untitled UI e da MUI, e o uso de sempre intacto. **TRÊS DEFEITOS ANTIGOS caíram junto, e o padrão é um só — gate que não olha para a composição:** `.badge-primary` dentro de `.btn-primary` media contraste **1** (amarelo sobre amarelo, invisível, PUBLICADO) e nenhum gate via porque página nenhuma compunha os dois; as ênfases nasceram escritas ANTES das variantes e, com especificidade igual, `solid` desenhava igual ao `soft` em 4 das 6; e um fixture do `skin.spec` usava a string `"3"` no lugar de um `<Badge>`, então **o gate passou verde com o defeito na tela** — fixture mais fraco que o uso real é gate que mente. **A lição mais cara da sessão é minha:** construí de memória e o Victor teve de corrigir a barra TRÊS vezes; as três se resolveram lendo referência e medindo | validate OK (36 checks) · **804 testes** · `skin.spec` **6/6** nos três motores · contraste medido em **36 combinações**, mínimo **5,60:1** · travas novas provadas contra o defeito | este |
| 17/08/2026 | — (garantia + backup) | **A suíte fechou nos TRÊS motores DEPOIS das mudanças de CSS: 143 passed · 2 skipped · 0 failed.** Não é o número herdado de 16/08 — as quatro regras do toast e a correção do `DataList` entraram depois dele, e rodar só o chromium teria deixado Firefox e WebKit sem resposta. **E os 136 commits que o push suspenso segura deixaram de existir numa máquina só:** `git bundle` da Aurea (69 MB, `git bundle verify` respondeu "records a complete history") mais `.tar.gz` dos dez projetos de `C:\dev` e `C:\dev-data`, todos conferidos com `gzip -t`. **A escolha entre bundle e tar foi medida, não preferida:** bundle guarda só o COMMITADO, e um dos projetos dele tem pastas com parte rastreada e parte fora do git — bundle ali perderia o resto em silêncio. **Um erro meu, registrado porque se repete:** meu laço de acompanhamento casava com uma linha ANTIGA do log, voltava na hora, e eu li isso como "parou de crescer" — matei um `tar` e apaguei um arquivo que provavelmente já estava pronto. Nada se perdeu (a origem nunca foi tocada), mas a decisão saiu de uma leitura errada. Refeito gravando em disco LOCAL e movendo no fim, que é o certo para pasta sincronizada | três motores **143/143** · 10 arquivos íntegros (`gzip -t`) · 6,5 GB no Drive | este |
| 17/08/2026 | — (release) | **A `0.3.0` ESTÁ NO NPM**, os seis pacotes, publicados pelo Victor com 2FA e **conferidos no registro** (`npm view <pacote> version` nos seis) — não na tela do publish. O `pnpm published:check` fecha a prova do outro lado: instala do registro numa pasta temporária e constrói as duas aplicações de prova — **proof-server (RSC) com 5 asserções e proof-client com 2**. É a única medição que atravessa o npm de verdade. **O que vai na versão, medido contra `released-surface.json` e não digitado:** 11 componentes novos, `useAureaTheme`, `screenState*`, `@aurea-uds/tokens/native` e 3 quebras com nota. **O item de maior alcance não é componente:** marcação pura passou a renderizar no SERVIDOR, pelo barril e — desde ontem — pelo subpath da categoria; `Card` custava 118,5 KB e passou a custar zero. **Três entradas faltavam no changelog e nenhum gate teria acusado**, porque o check 31 cobra COMPONENTE: o alvo nativo dos tokens, a mudança de fronteira servidor/cliente e os dois defeitos de ontem (o `type` do toast e o `DataList`). Entraram antes do bump. **A forma do release é a mesma da 0.2.0 e pelo mesmo motivo:** bump + changelog + superfície no MESMO commit, senão o check 31 reprova os três separados. **Uma falha que NÃO era falha:** a primeira rodada do `published:check` morreu com `EBUSY ... unlink` no cache do npm — é o antivírus do Windows segurando o arquivo, o mesmo achado A7 que o gerador do catálogo já contorna com retentativa. Rodar de novo passou. Não confundir trava de arquivo do Windows com pacote quebrado | seis pacotes em **0.3.0** no registro · `published:check` OK (5 + 2 provas) · validate OK (34 checks) · pack OK · 774 testes · visual chromium 63/63 | este |
| 16/08/2026 | — (catálogo) | **Hook público ganhou onde ser lido — e a página nova achou dois defeitos no que já existia.** O catálogo documentava componente e mais nada; `useToast`, `useAureaTheme`, `useAureaStrings` e `useSpriteUrl` são API publicada e **não apareciam em lugar nenhum**, porque ficha descreve componente. Entrou `hooks.html` como **índice de área**, não como item: o núcleo do modelo é preview + código, e hook não tem prévia estática — `useToast` só existe depois de um clique, e caixa vazia com legenda é exatamente o defeito que a ADR-0001 já pagou no `Chart`. O conteúdo é dado (`content/_hooks.mjs`), com a mesma trava do `_starters`: chave que o gerador não lê reprova, e o `source` de cada hook é conferido no arquivo — **check 28 na mão**, porque hook não tem ficha onde o `source` viva. **O DEFEITO 1, e ele era do componente, não da página:** `.data-list` usava `grid-template-columns:max-content`, que não encolhe; um termo longo empurrava a PÁGINA — a varredura acusou **+179px** de rolagem lateral a 320px. `DataList` é publicado: quem escrevesse um termo comprido levava o mesmo. Duas tentativas erradas ficam registradas porque cada uma ensinou: `auto` **não resolveu** (a trilha tem max-content como máximo e não encolhe sob aperto — caiu para +90px, não zerou), e a regra de mídia que empilha **não valia nada** escrita ANTES da base, porque mídia não soma especificidade e a base vencia por vir depois — a mesma armadilha que o comentário do `.banner` já registrava dez linhas acima. **O DEFEITO 2:** o caminho do arquivo dentro de um `.chip` estourava o `<h2>` e `overflow-wrap` não resolve — `.chip` é `inline-flex` com `line-height:1`, caixa que não quebra. Caminho é conteúdo, não etiqueta: saiu do título. **E a segunda verdade que isso expôs:** o `validate.py` tinha uma CÓPIA à mão da lista de índices de área do `page-model.mjs`. O `hooks.html` foi contado como página de COMPONENTE e o STATE.md publicou 104 componentes onde há 103. A cópia morreu: a lista agora é LIDA do modelo | validate OK (34 checks) · pack OK · 774 testes · varredura do catálogo **14/14** · suíte visual chromium **63/63** · só as 2 baselines do `topo` mudaram (a área nova no topo), e **nenhuma outra** — o que prova que a mudança no `.data-list` não mexeu em pixel de página existente · catálogo **218 páginas** | este |
| 16/08/2026 | — (O1, adendo) | **O limite declarado da ADR-0026 fechou, e a ADR tinha errado o preço dele.** Ela previa "quebrar cada categoria em **duas entradas públicas** — mudança de fronteira publicada". Não foi nada disso: os **20 subpaths** seguem idênticos, com os mesmos nomes e exports. As oito categorias que reexportavam marcação pura (`code`, `data-display`, `feedback`, `identity`, `inputs`, `layout`, `media`, `navigation`) viraram **vitrines sem diretiva** — `export *` do irmão `-client.tsx` mais a linha explícita do `markup.js` — e a diretiva foi junto com o código, por `git mv`. **A medição é do empacotador, não de script nosso:** o `apps/proof-server` (Next 16 + Turbopack) passou a importar `KPI`/`Kbd` do subpath dentro de uma página de servidor, e o defeito foi **reposto de propósito** para ver a diferença — com a diretiva na vitrine o payload traz `["$","$L5",…]` (referência de cliente); sem ela, `["$","strong",…]` (marcação). **A trava é o check 26b**, escrito ANTES da correção e provado contra o defeito: acusou os oito módulos, mais uma **reexportação morta de `Kbd`** que sobrara no `internal.tsx` desde o O1 e que ninguém importava. Mudaram o `source.react` de **35** fichas (check 28 cobra) e o baseline do pack, que ganhou os 16 arquivos novos de `dist` | validate OK (34 checks) · pack OK (react:69) · **769 testes** · `tsc` verde · `next build` do proof-server verde · STATE.md sem alteração (nenhuma contagem mudou) | este |
| 21/08/2026 | — (ATIVIDADE-2) | 21 gaps fechados fora da numeração deste plano — ver [`audit/activity-2/03-GAPS.md`](../audit/activity-2/03-GAPS.md) | validate OK (28 checks) · pack OK · 324/324 · 80/89 visual (9 esperando baseline) | `a97e104` |
| 28/08/2026 | **L autorizada** (ATIVIDADE-2) | `G-A11Y-11` e `G-STATE-02` fechados · `G-LAB-01` aberto · check 31 novo | validate OK (31 checks) · 464/464 · 2/2 nos gates do `invalido` | `8a3a1df` + este |

> **A ATIVIDADE-2 corre em paralelo a este plano e não usa a numeração dele.** Ela trabalha por
> COBERTURA medida contra nove referências, e a fila dela vive no
> [`03-GAPS.md`](../audit/activity-2/03-GAPS.md). Onde as duas se tocam está anotado abaixo.
>
> **O que a ATIVIDADE-2 adiantou de partes deste plano:**
>
> - **Parte E** (contrato de API): o `packages/contracts/api-surface.json` passou a existir,
>   derivado da emissão do `tsc`. O `props` das fichas agora **pode** ser derivado em vez de
>   escrito — o trabalho da parte ficou menor, mas segue aberto (`G-REG-03`).
> - **Parte J** (estados universais): o check 27 passou a reprovar estado que o core pinta e
>   ficha nenhuma declara. Os ~53 estados que o motor tem e a Aurea nunca declarou seguem sem
>   triagem (`G-STATE-01`).
> - **Parte K** (prova de plataforma): apareceu um bloqueio novo que não estava previsto aqui —
>   o gate visual **não é estrito** (`G-GATE-01`), e isso precisa fechar antes de a `1.0` poder
>   confiar nas capturas.
