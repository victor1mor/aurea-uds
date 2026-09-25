# Referências externas — o que foi analisado, e o que entrou

## ⭐ AS TRÊS PRINCIPAIS — declaradas pelo Victor em 18/08/2026

Ordem dita por ele: **[HeroUI](https://heroui.com/)** como principal, junto de
**[MUI](https://mui.com/)** e **[ReUI](https://reui.io/)**. Vale para toda construção daqui para
frente; as outras pastas de `Referencia/` continuam servindo, e o `BUILDING.md` §1 diz para quê.

| Principal | O que é, medido em 18/08/2026 | Licença | Onde se lê |
|---|---|---|---|
| **HeroUI** | ex-**NextUI**, branch `v3`, construída sobre **React Aria + Tailwind CSS v4**; ela mesma se posiciona como alternativa a MUI, Chakra e shadcn | **Apache-2.0** — a MESMA da Aurea, e a mais folgada das três | **na internet** (`heroui.com`), não há pasta em `Referencia/` |
| **MUI** | monorepo `9.3.1`, **157 componentes** em `packages/mui-material/src/`; a mais completa em cobertura e a mais distante em aparência | MIT | pasta `Referencia/material-ui-master` |
| **ReUI** | terceira leitura de anatomia, e blocos compostos | MIT | pasta `Referencia/reui-main` |

**O motivo declarado do Victor para a HeroUI é APARÊNCIA** — palavras dele: *"é esse estilo que
quero na aurea"*. Isso é diferente do que as outras referências servem, e a diferença **não é
detalhe**: o `BUILDING.md` §1 diz que de referência se extrai anatomia e **nunca** aparência, e o
`CLAUDE.md` trava paleta, raio, tipografia e densidade. As duas coisas não cabem juntas sem
decisão. **Fica registrado como pergunta aberta, não como permissão presumida** — quem levanta a
trava de identidade é ele, por escrito, e isso vira ADR.

**A trava que segue inteira em qualquer cenário:** nenhuma linha literal entra — nem CSS, nem SVG,
nem fixture — e nada é redistribuído. Referência se lê.


Existe por causa do achado **M19** da auditoria de 26/07/2026: o `AUREA.md` citava Kibo e
Untitled UI como referências e **não havia registro** do que foi analisado, do que foi adotado,
do que foi recusado, nem sob que licença. Citação sem registro é lembrança, e lembrança não
sobrevive a uma troca de sessão.

**A regra que este documento serve** (memória de trabalho do Victor, e agora escrita): não
construir layout nem apresentação a partir de treino. Proporção, estrutura e comportamento saem
de uma referência **medida**; a pele é sempre Aurea. Componente montado "de cabeça" foi de onde
saíram os defeitos que as auditorias acharam.

## Como registrar uma referência nova

Uma linha na tabela e uma seção abaixo, com: o que foi olhado, **o que foi medido** (número, não
impressão), o que entrou, o que ficou de fora **e por quê**, e a licença. Sem a licença o
registro não está completo — copiar estrutura é uma coisa, copiar código é outra.

| Referência | Para quê | Licença | Verificado em |
|---|---|---|---|
| [Kibo UI](https://www.kibo-ui.com) | organização do catálogo e anatomia da caixa de demo | MIT | 30/07/2026 |
| [Untitled UI React](https://www.untitledui.com/react) | escala de breakpoints e proporção de layout | MIT (tier grátis; há um PRO pago) | 30/07/2026 |
| [Base UI](https://base-ui.com) | motor de comportamento (não é referência visual: é dependência) | MIT | ver [ADR-0004](../decisions/0004-motor-headless-base-ui.md) |
| [shadcn/ui](https://ui.shadcn.com) | decomposição em peças, e o padrão de envelopar biblioteca de terceiro | MIT | 31/07/2026 |
| [MUI (Material UI)](https://mui.com/material-ui/) | anatomia e catálogo de estados (Stepper, Avatar) | MIT | 31/07/2026 |
| [Recharts](https://recharts.org) | motor de gráfico (não é referência visual: é dependência, peer opcional) | MIT | 01/08/2026 |
| [react-day-picker](https://daypicker.dev) | motor de calendário (não é referência visual: é dependência, peer opcional) | MIT | 01/08/2026 |
| [Carbon Design System](https://carbondesignsystem.com) | anatomia de Accordion e de empty state (Fase 11) | Apache-2.0 | 30/07/2026 |
| [Carbon Icons](https://carbondesignsystem.com/elements/icons/library/) | os glifos | Apache-2.0 | `packages/icons/NOTICE` |
| [IBM Plex](https://www.ibm.com/plex/) | as três famílias tipográficas | OFL-1.1 | `packages/fonts/LICENSE` |

---

## Kibo UI

**O que é:** registry de componentes sobre o shadcn/ui, hoje sob o guarda-chuva da Shadcnblocks.
Licença **MIT** (verificado em 30/07/2026).

**Por que foi olhado:** o Victor escolheu a ORGANIZAÇÃO dele para o catálogo, com prints, em
24/07/2026 — página por item em vez de tudo numa página só.

**O que foi medido e adotado** (está nos comentários do gerador, junto do número):

- **Página por item**, com breadcrumb → cabeçalho → demo → Installation → seções → prev/next.
  Virou o modelo de página, hoje dado em `scripts/page-model.mjs` ([ADR-0001](../decisions/0001-modelo-de-pagina-do-catalogo.md)).
- **A barra de abas do demo ocupa a largura toda e as abas dividem 50/50** — medido: barra
  `w-full`, 3px de padding, dois tabs `flex:1`. A peça que executa isso aqui é a `.segmented` da
  Aurea, esticada: comportamento deles, pele nossa.
- **Teto de altura do demo em 32rem**, e o índice lateral escondido abaixo de `xl` — os dois
  pontos vieram de medição no Kibo, e o segundo é o mesmo ponto de corte que eles usam.

**O que NÃO entrou:** a aparência inteira. Nada de sombra empilhada, raio pequeno ou paleta
deles; a identidade da Aurea (raio 22px, pill nos controles, amarelo invariável) é `CLAUDE.md` e
não se negocia com referência. Também não entrou o mecanismo de distribuição (CLI do shadcn que
copia código para dentro do projeto): a Aurea é biblioteca instalada, não código copiado —
decisão implícita que a [ADR-0010](../decisions/0010-distribuicao-npm-publico.md) tornou explícita.

**Código copiado:** nenhum.

## Untitled UI React

**O que é:** biblioteca React sobre Tailwind. O tier grátis é **MIT** (verificado em 30/07/2026,
na documentação deles); há um PRO pago, e nada dele foi usado.

**O que foi adotado:** a **escala de breakpoints** — a mesma do Tailwind (640/768/1024/1280/1536),
que eles usam de base. Aqui ela vive nos tokens (`--breakpoint-*`) e é **gateada** pelo check 4b:
breakpoint fora da escala reprova, com uma lista curta de legado congelado que só encolhe.

**O que NÃO entrou:** Tailwind. A Aurea é CSS próprio com tokens; adotar a escala de um sistema
não é adotar o sistema.

**Código copiado:** nenhum.

## Carbon Design System

**O que é:** o design system da IBM. Licença **Apache-2.0** (verificada em 30/07/2026). Já era
dependência aqui por dois lados — os glifos (Carbon Icons) e a tipografia (IBM Plex) —, então
é a referência com menos atrito para anatomia: mesma família de letra, mesma família de ícone.

**Por que foi olhado:** a Fase 11 (achado A13) precisava desenhar nove componentes públicos que
nunca tiveram pele, e `QUALITY.md` #2 proíbe construir de memória.

**O que foi medido e adotado** (lido na página de estilo do Accordion em 30/07/2026):

| Medida do Carbon | O que virou aqui |
|---|---|
| cabeçalho do accordion: 32 / 40 / 48px por tamanho | `min-height:var(--control-h-md)` — a mesma ideia, na nossa escala de densidade |
| divisória de 1px por item (`border-top`) | `.accordion > details + details { border-top:1px }` |
| corpo: 8px de respiro em cima, 24px embaixo | `var(--space-2)` e `var(--space-6)` — os mesmos dois degraus |
| título e corpo em 14px | `--text-md`, que é 0,875rem = 14px |

Da página de **padrão de empty state** veio a ordem das partes: imagem (opcional) → título →
corpo → ação primária → ação secundária. É exatamente o que o nosso `EmptyState` já emitia — a
referência confirmou a anatomia e não mudou o componente.

**O que NÃO entrou:**

- **O chevron do accordion.** O Carbon usa um ícone da biblioteca; aqui o marcador é o **nativo**
  do `<summary>`, que gira sozinho e custa zero código. Trocar exigiria o componente emitir um
  `<Icon>` — mudança de comportamento, não de pele.
- **O `margin-right: 25%` do painel.** É uma regra de largura de leitura da documentação deles,
  não do componente.
- **O alinhamento do empty state.** O Carbon não dá número, e os exemplos são alinhados à
  esquerda. Aqui é **centralizado**, e a razão veio de dentro: `.notification-empty` e
  `.datagrid-empty` já respondiam "aqui não há nada" centralizados e em `--muted-foreground`.
  `.empty-state` é o membro grande dessa família — coerência interna vence referência externa
  quando as duas discordam e a interna já está em produção.
- A aparência, como sempre. Raio 22px, pill e o amarelo invariável são `CLAUDE.md`.

**Código copiado:** nenhum.

## Lote 1 — o que cada referência deu, componente a componente

Primeiro lote construído sob o [`BUILDING.md`](BUILDING.md), em 31/07/2026. As quatro
referências foram consultadas **por componente**, não em bloco. Licenças verificadas na data:
Base UI **MIT**, shadcn/ui **MIT**, Untitled UI React **MIT** (tier grátis), Kibo UI **MIT**.

### `Toggle`

**Medido antes:** a Aurea não tinha nenhuma regra `.toggle`. Existia `SegmentedControl` (escolha
única entre vários) e o `pressed` do `Button` — que só ANUNCIA o estado, sem mantê-lo.

**Convergiu nas três que o têm** (Base UI, shadcn, Untitled): é um botão de dois estados com
`aria-pressed` gerido pelo componente, e escala de tamanho igual à do botão.

**Entrou:** a decomposição (um componente só) e a escala `sm`/`md`/`lg`.

**Não entrou:** o par `variant: default | outline` do shadcn. A Aurea já tem onze variantes de
botão; um segundo eixo de variante só para o toggle criaria duas gramáticas para a mesma caixa.

**Decisão nossa, não da referência:** pressionado usa **os mesmos tokens de
`.segmented button.active`**. Um toggle solto e um segmento aceso dizem a mesma coisa; parecer
diferente seria o sistema falando dois idiomas.

### `Spinner`

**Medido antes:** `.spinner` existia no core desde sempre, fixo em 16px, e era usado **só** por
dentro do `Button` — nunca teve componente, logo nunca teve papel acessível.

**Convergiu:** `role="status"` com nome acessível (shadcn e Untitled; Kibo idem).

**Entrou:** o papel e o nome — que era exatamente o que faltava — e a escala de tamanho no eixo
dos ícones (`--icon-sm/md/lg`), ideia da escala nomeada do Untitled.

**Não entrou:** o catálogo de *estilos* de spinner do Kibo (circle, pinwheel, ellipsis, ring,
bars, infinite) e os três do Untitled. Um sistema com seis spinners é um sistema sem spinner.

**Decisão nossa:** a prop `decorative`, que não existe em nenhuma delas. Dentro de um controle
que já anuncia a espera (o `Button loading` põe `aria-busy`), dois anúncios do mesmo fato é ruído.

### `NumberField`

**Medido antes:** nada. E o `Input` cru não resolve — o `type="number"` nativo traz setas
minúsculas, alteração acidental pela roda do mouse e nenhuma leitura de locale.

**Convergiu:** a anatomia *menos · campo · mais* numa peça só (Base UI `Group`; e o
"Stepper Button Group" do Kibo, que é `ButtonGroup` + `Input` + dois botões).

**Entrou:** essa anatomia, com `.input` e `.btn` da Aurea — sem peça nova.

**Não entrou:** o `ScrubArea` do Base UI (arrastar o rótulo para variar o número). É gesto que
ninguém descobre sozinho e sem equivalente por teclado.

**Medição que corrigiu a nossa ficha:** o motor **não** usa `role="spinbutton"`, ao contrário do
que o padrão APG sugere. Renderiza `type="text"` + `inputMode="numeric"` +
`aria-roledescription`. Eu havia escrito `spinbutton` na ficha; o teste reprovou e a **ficha foi
corrigida pelo medido**.

### `OTPField`

**Medido antes:** nada.

**Convergiu:** uma caixa por caractere, colar distribui o código inteiro, `Backspace` volta uma,
e `autocomplete="one-time-code"` para o telefone oferecer o código do SMS.

**Entrou:** tudo isso — e vem do motor, não foi escrito aqui.

**Não entrou:** a **dependência**. O shadcn resolve com o pacote `input-otp`; aqui não entra
dependência nova, porque o `@base-ui/react` — a única dependência de runtime da biblioteca — já
tem `otp-field`. Também não entrou o separador visual entre grupos de dígitos: é enfeite que
divide um valor único.

### `HoverCard`

**Medido antes:** nada. Existiam `Tooltip` (rótulo curto) e `Popover` (abre por clique).

**Convergiu nas três que o têm:** é uma terceira coisa — prévia rica, abre ao repousar o
ponteiro, e o conteúdo **é alcançável** (ao contrário da tooltip, cujo conteúdo não pode ser).

**Entrou:** essa distinção, e o motor (`preview-card` do Base UI).

**Não entrou:** superfície nova. Reusa `.popover`, porque é a mesma camada flutuante do sistema
— dar um segundo nome criaria duas peles para a mesma coisa. Só a largura de leitura é própria.

**Limite declarado na ficha:** por depender de repouso do ponteiro, não serve para informação
essencial. Quem navega por teclado ou toque não abre um hover card.

## Lote 2 — `AvatarGroup` e `Stepper`, e os três defeitos do `Avatar`

### `Avatar` — o que a medição achou antes de qualquer referência

Renderizado com só o core em 31/07/2026: **três defeitos**, e nenhum apareceria olhando a página
do catálogo, porque lá a imagem de exemplo é quadrada e carrega.

| Defeito | Medido | Corrigido com |
|---|---|---|
| Foto não quadrada vaza | imagem 3:1 saía **300×100** dentro de uma caixa de **40×40** | `overflow:hidden` + `object-fit:cover` |
| `src` quebrado não cai no fallback | via-se o ícone de imagem quebrada e o `alt` solto | `onError` |
| `.avatar-group` empilhava na vertical | o container **nunca teve regra** no core | `display:inline-flex` |

**Uma tentativa foi descartada, e vale registrar:** o Base UI **tem** primitivo de `avatar`, com
Root/Image/Fallback, e ele resolve o segundo defeito sozinho. Foi a primeira implementação.
Medido: ele só monta o `<img>` **depois** que a imagem carrega, então o HTML servido não tem
imagem nenhuma. Numa aplicação React isso é invisível — a hidratação monta em seguida —, mas o
nosso catálogo é HTML estático sem runtime, e a foto nunca apareceria. Trocar "imagem quebrada"
por "nenhuma imagem em página estática" seria pior. Ficou o `onError`, que mantém o `<img>` no
HTML servido.

### `AvatarGroup`

**Convergiu** (shadcn e Kibo; o MUI idem): pilha sobreposta, `max` corta a lista, o excedente
vira **um** avatar de contagem.

**Entrou:** exatamente isso, mais `total` — para quando o número real está no servidor e só veio
uma página de avatares.

**Não entrou:** o `renderSurplus` do MUI (callback para desenhar o "+N"), que é configuração
para um problema que ninguém teve; e a máscara em `radial-gradient` do Kibo, que recorta o
avatar anterior para o de cima "encaixar" — efeito bonito e frágil, com gradiente, que o
`CLAUDE.md` proíbe.

### `Stepper`

**Registro honesto da pesquisa: nenhuma das quatro referências locais tem stepper.** Nem o Base
UI, nem o shadcn, nem o Untitled UI, nem o Kibo. A única fonte é o **MUI** — e a página deles
avisa que o **Material Design parou de documentar o padrão**.

Ou seja: isto é menos padrão de mercado do que parece. Foi construído mesmo assim porque a pele
já estava no core sem dono (`.step`, `.step-dot`), e classe órfã é o achado A13 esperando para
acontecer de novo.

**Entrou do MUI:** a decomposição conceitual (lista de etapas, ponto, conector, rótulo) e três
estados que faltavam — **erro**, **opcional** e etapa **clicável** para fluxo não-linear.

**Não entrou:** os oito componentes deles viraram **um**; o `MobileStepper` com três variantes
(texto, pontinhos, barra), sendo que a barra é o nosso `Progress`; a orientação vertical; e a
ginástica de foco dos exemplos, que é lógica de aplicação e não do componente.

**Divergência da referência, deliberada:** o MUI expõe `<Stepper><Step/></Stepper>`. Aqui é
`items`, que é o idioma da casa (Timeline, DataList, Breadcrumb, SegmentedControl) e resolve a
numeração de graça — o número vem da posição, não de uma prop que o consumidor teria de manter
em sincronia.

## Lote 3 — `Chart`, `ChartTooltip`, `ChartLegend`

Construídos em 01/08/2026. Licenças verificadas na data: **Recharts MIT**, shadcn/ui **MIT**,
Untitled UI React **MIT** (tier grátis), Base UI **MIT**, Kibo UI **MIT**.

### A resposta que as quatro deram

**Duas das quatro envelopam o MESMO motor, e nenhuma das quatro escreve um.** O `chart` do
shadcn/ui é Recharts; os gráficos de linha, barra, pizza e radar do Untitled UI React são
Recharts. O **Base UI não tem gráfico** — é biblioteca de comportamento, e num gráfico não há
teclado nem ARIA de widget para entregar. O **Kibo UI também não tem**: é registry de
componente raro, e gráfico não é raro.

Isso decidiu a questão sem depender de gosto: **não escrevemos motor de gráfico.** O que é da
Aurea aqui é a pele.

### O motor, medido antes de entrar

| O que | Medido em 01/08/2026 |
|---|---|
| versão | 3.10.1, publicada em 25/07/2026 — **mantida**, não abandonada |
| licença | **MIT** |
| React 19 | declarado no `peerDependencies` deles |
| segurança | `pnpm audit --audit-level=high` limpo |
| peso | 7,4 MB descompactado, e traz `@reduxjs/toolkit` + `react-redux` como dependência **dura** |

O peso é a razão do **subpath próprio e do peer OPCIONAL**: ninguém que instala a Aurea pelo
`Button` baixa um motor de gráfico. É a mesma fronteira do `DataGrid` e do `QRCode`, e o check
19 a cobra.

### Três defeitos que a medição achou — e que nenhuma referência apontaria

1. **O Recharts 3 não renderiza no servidor.** `renderToStaticMarkup` de um `LineChart` 600×220
   devolve **127 bytes** — a `<div>` embrulho, sem `<svg>` nenhum. Com `width`/`height` fixos:
   igual. Com `initialDimension`: igual. É regressão conhecida do 3.0 (recharts#5997), sem
   correção no 3.10.1. O catálogo é HTML estático, então o preview seria uma caixa vazia
   justamente na página cujo assunto é o desenho. A saída foi montar num DOM real no gerador
   (`jsdom`, que já era dependência de teste) — ver o bloco PRERENDER do `build-catalog.mjs`.
2. **O `ResponsiveContainer` mede 0×0 sem `ResizeObserver`**, e aí o motor não desenha (153
   bytes). Vale para o jsdom, não para o navegador. Por isso o prerender e o teste de unidade
   têm um stub, e só eles.
3. **A legenda sai em ordem alfabética por `dataKey`, não na ordem em que as séries foram
   declaradas.** Medido nos dois sentidos: declarar `zulu, alpha, mike` e declarar
   `mike, zulu, alpha` dão os dois `Alpha, Mike, Zulu`. Num gráfico empilhado a legenda deixa de
   acompanhar a pilha. Não dá para corrigir de dentro do `ChartLegend` — ele recebe o payload
   pronto e não alcança os filhos do gráfico. Ficou **documentado na ficha**, com a saída
   (`payload`), e **fixado num teste** que reprova se o motor mudar de ideia em qualquer direção.

### O que entrou do shadcn/ui

A **decomposição**: uma caixa que hospeda, mais tooltip e legenda próprios. E o padrão de
envelopar biblioteca de terceiro — que aqui já era o do `DataGrid`.

### O que NÃO entrou, e por quê

- **O `ChartConfig`** (mapa `dataKey → {label, color, icon, theme}`). Medido: o payload que o
  motor entrega ao `content` **já traz** `name` (do prop `name` da série) e `color` resolvido.
  O objeto é indireção para reconstruir o que já chega. E o eixo `theme:{light,dark}` não existe
  aqui — `var(--chart-2)` já troca sozinho com o `data-theme`.
- **O par `ChartTooltip`/`ChartTooltipContent`** (e o mesmo para a legenda). No Recharts 2 o
  filho tinha de ser o componente DELES, o que obrigava o shadcn a reexportar o primitivo e pôr
  a pele no `content` — duas peças por peça. **Medido no 3.10.1: um componente nosso como filho
  é reconhecido.** Então são três peças, não seis. O teste de unidade fixa isso, porque se uma
  versão futura voltar atrás o tooltip e a legenda somem sem erro nenhum.
- **O `ChartStyle`**, que injeta um `<style>` por gráfico para criar `--color-<key>`. Sem o
  config ele não tem função.
- **Prop de altura.** Dimensão não é número (check 23): a caixa mede pelo CSS e quem quer outra
  altura escreve uma classe.
- **A aparência deles**, como sempre. E uma coisa a mais: **nenhum nome de classe do Recharts
  entrou no core.** A pele é escrita contra ELEMENTO (`.chart svg line`, `.chart svg text`),
  porque classe de terceiro declarada no core reprovaria o check 15 — é a mesma razão pela qual
  a pele do `CodeEditor` vem pelo `EditorView.theme` do CodeMirror e não do nosso CSS.

**Código copiado:** nenhum.

## Lote 4 — `Calendar`

Construído em 01/08/2026. Licenças verificadas na data: **react-day-picker MIT**, `date-fns` e
`@date-fns/tz` (dependências dele) **MIT**, shadcn/ui **MIT**, Untitled UI React **MIT** (tier
grátis), Base UI **MIT**, Kibo UI **MIT**.

### O que a medição do passo 1 achou, e ela mudou a conversa

**A Aurea não tinha nada de data** — nenhum componente, nenhuma ficha, nenhuma classe. Mas tinha
uma **posição publicada**: o pattern `Input → Native date range` diz, com todas as letras,
*"Two native pickers instead of a custom calendar — every locale and every screen reader for
free."* E a receita `booking-calendar` não desenha calendário nenhum: é `Card` com `Radio` de
horários.

Ou seja, o catálogo publicado **argumentava contra** o componente que este lote constrói. Não é
motivo para não construir — é motivo para os dois não se contradizerem, e o texto do pattern
antigo foi reconciliado no mesmo commit. A posição final está escrita nos três previews do
`patterns/Calendar.mjs`, e ela não é "calendário sempre": é **nativo para uma data simples,
`Calendar` para o que o nativo não faz** (intervalo com grade à vista, dia fechado, vários dias).

### O motor: por que houve decisão, e por que esta

**O Base UI não tem calendário nem campo de data.** Medido na lista de exports do `1.6.0` — que
é a versão mais recente (18/06/2026) — e não numa lembrança. Ele é dependência DURA daqui, então
essa era a resposta barata; ela não existe.

Duas das quatro referências resolvem, e resolvem diferente:

| Referência | Motor | Entrou? |
|---|---|---|
| shadcn/ui | **react-day-picker** | **sim** |
| Untitled UI React | React Aria (`react-aria-components` + `@internationalized/date`) | não |
| Base UI | não tem | — |
| Kibo UI | tem um `calendar`, mas é **calendário de eventos** (mês com itens dentro) — outro componente | — |

**Recusado o React Aria** e não por qualidade: trazer um segundo motor headless para conviver com
o Base UI é criar padrão paralelo, que o protocolo proíbe em uma linha.

O que foi medido do react-day-picker antes de aceitar:

| O que | Medido em 01/08/2026 |
|---|---|
| versão | 10.0.1, publicada em 15/05/2026 — mantida |
| licença | **MIT**; as duas dependências dele (`date-fns`, `@date-fns/tz`) também |
| segurança | `pnpm audit --audit-level=high` limpo |
| peso | 987 KB empacotado — daí o subpath próprio e o peer OPCIONAL |
| **SSR** | **renderiza** — 8618 bytes, `<table>` de verdade, 42 células |
| a11y de fábrica | `role="grid"`/`"gridcell"`, `aria-selected`, `<button>` por dia com a data por extenso, mês em `role="status" aria-live`, `<thead aria-hidden>` com `<th scope="col">` |
| API de tema | `classNames`, que troca **qualquer** nome de classe dele |

A linha do SSR é a que importa mais, e é a lição do Lote 3 sendo cobrada: **o calendário não
precisa de prerender nenhum** no catálogo, ao contrário do gráfico.

### O que entrou do shadcn/ui

Duas coisas, e as duas são decisão, não código:

- **O motor**, pelo voto de convergência acima.
- **A ausência de `DatePicker`.** Eles dizem explicitamente que não há componente-raiz para isso:
  seletor de data é `Popover` + `Calendar`, e a Aurea já tem os dois. Virou **pattern**, que é o
  veículo da casa para composição.

E `showOutsideDays` ligado por padrão, que é o default deles: mês com buraco nas pontas muda de
forma ao trocar de mês.

### O que NÃO entrou, e por quê

- **`react-aria-components`** — motor paralelo, acima.
- **O `Temporal`.** Pesquisado porque seria a resposta certa se estivesse pronto: chegou ao
  **Stage 4 do TC39 em março de 2026** e está no **ES2026**, com Chrome 144 (01/2026) e Firefox
  139 (05/2025). Mas o **Safari estável ainda não tem** — só o Technical Preview, parte sob
  flag. Biblioteca publicada não pode pôr na API pública um tipo que não existe num dos
  navegadores. Fica `Date`, e a troca é uma decisão futura com data.
- **Renomear os 21 nomes de classe do motor.** Só **três** foram renomeados — a raiz, o embrulho
  dos meses e o rótulo do mês. Todo o resto da pele é escrito contra ELEMENTO
  (`.calendar table`, `.calendar th`, `.calendar td button`) e contra os `data-*` que ele já
  emite (`data-selected`, `data-today`, `data-outside`, `data-disabled`, `data-hidden`) —
  **atributo não é classe**, então o check 15 nem os enxerga. Renomear tudo encheria o core de
  superfície que ninguém usa.
- **O CSS dele.** Não importamos `react-day-picker/style.css`, e isso tem uma consequência
  medida: o dia escondido das pontas **aparece**, porque quem o esconde é o CSS deles. A regra
  `[data-hidden]` existe por causa disso, e o `skin.spec` tem um segundo calendário no fixture
  **só** para haver dia escondido — sem ele a asserção seria um laço sobre lista vazia, que é
  regra sem prova.
- **Vários meses lado a lado.** `numberOfMonths` passa direto para o motor e funciona; o que não
  há é regra de layout para eles, então saem empilhados. Entra quando alguém pedir.

### Um detalhe do motor que virou invólucro

O `role` do `DayPicker` é tipado como `"application" | "dialog"` — nenhum dos dois serve para um
calendário inline, e ele não deixa a raiz ser um `group`. Então o `label`, quando existe, cria um
`<div role="group">` em volta. Sem `label` não há invólucro nenhum: dentro de um `Popover` quem
diz o assunto é o gatilho, e um grupo a mais só acrescentaria ruído.

**Código copiado:** nenhum.

## Parte B do PLANO-1.0 — `Sidebar`

06/08/2026. Não é lote: é o item **B1**, e o componente já existia — como `<aside>` e nada mais.
O que foi construído aqui é a **lista** que ele nunca teve.

### Passo 1 — o que a medição achou antes de abrir qualquer referência

Renderizado com só o core: a `.sidebar` desenha a **caixa** (superfície flutuante, rolagem
própria, gaveta abaixo de md) e **nenhuma peça de dentro**. Item, grupo, rótulo de grupo e marca
de item atual existiam no `aurea.css` — como `.doc-nav`, `.nav-group` e `.nav-group-label`, que
são **chrome do catálogo** (achado A6) e nunca foram API pública.

O defeito, então, não era de código e sim de escopo: **a peça estava no repositório e não era da
biblioteca.** Todo consumidor teria de reescrevê-la, e o único que existe — o nosso catálogo —
reescreveu.

### Passo 2 — quem TEM este componente, medido pasta a pasta

| Referência | Tem? | O que é |
|---|---|---|
| `ui-main` (shadcn/ui) | **sim** | `ui/sidebar.tsx`, 21,2 KB — o mais completo das sete |
| `react-main` (Untitled UI) | **sim** | `application/app-navigation`, 12 arquivos, 5 arranjos de lateral |
| `material-ui-master` (MUI) | **parcial** | não há "Sidebar": há `Drawer` + `List`/`ListItemButton`/`ListSubheader` |
| `base-ui-master` | **não** | 44 pastas em `packages/react/src`, nenhuma é lateral. Há `navigation-menu`, que é outra coisa (menu horizontal, padrão APG de menubar) |
| `kibo-main` | **não** | 43 pacotes, nenhum é lateral |
| `reui-main` | **não** | — |
| `media-chrome-main` | **não** | — |

### Passo 3 — o que serve, e o que não serve

**Convergiu nas três que têm** (e por isso é o núcleo maduro): item = ícone + rótulo +
acessório à direita; grupo com rótulo que **não é clicável**; **um** nível de aninhamento; e o
recolhimento em trilho de ícones.

**O que UMA só tem e valeu:** o `type: "link" | "collapsible" | "collapsible-child"` do Untitled
UI mostrou que os três casos precisam existir — mas mostrou também que eles cabem num formato
só, porque o que muda entre eles é *ter filho* e *ter href*, não a peça. Daí o `SidebarItem`
único da Aurea: com `items` e sem `href` é grupo; com os dois é pai com sublista.

**Uma divergência que decidiu um detalhe nosso:** o MUI marca o item atual com **classe**
(`.Mui-selected`, `ListItemButton`) e **nenhum atributo de acessibilidade** — quem usa leitor de
tela não fica sabendo em que página está. Untitled e shadcn usam `aria-current`. A Aurea usa
`aria-current` **e pinta a partir dele** (`.sidebar-item[aria-current]`), sem classe `.active`:
com uma fonte só não há como marcar o olho e esquecer o leitor. O `.doc-nav` do catálogo carrega
os dois até hoje, e é exatamente o defeito que isso evita.

**O que NÃO entrou, e por quê:**

- **O contexto e o `useSidebar()` do shadcn** (provider, `toggleSidebar`, atalho de teclado,
  cookie de persistência, `SIDEBAR_WIDTH_ICON = 3rem`). Estado e persistência são da aplicação;
  a Aurea recebe `collapsed` e pronto, como o `open` do `CommandPaletteShell`. Um provider para
  uma peça presentational é o que a auditoria chama de flexibilidade morta.
- **Os três modos `collapsible: offcanvas | icon | none`.** A Aurea já tem o *offcanvas* e ele
  não é prop: abaixo de md a gaveta é o popover nativo, que o navegador entrega inteiro. Sobrou
  o *icon*, que é o `collapsed`.
- **`side="left" | "right"`, `variant="sidebar" | "floating" | "inset"` (shadcn).** A lateral da
  Aurea é flutuante por identidade (`CLAUDE.md`), e o lado vem de `dir`, não de prop.
- **A rolagem virtualizada e o `SidebarMenuSkeleton`.** Ninguém mediu a lista que precisaria.
- **Qualquer coisa de aparência das três.** Raio, cor, sombra e espaçamento são do `CLAUDE.md`.

**Sobre o trilho:** a única largura medida numa referência é o `3rem` do shadcn; a do Untitled é
dada pelo conteúdo. O `--sidebar-rail` da Aurea é **4.5rem** porque a nossa caixa tem
`padding:var(--space-4)` dos dois lados, que o `3rem` não previa — ali o ícone encostaria na
borda. Número derivado da nossa geometria, não copiado.

**Teclado:** as três concordam em não inventar nada — link em `<nav>`, Tab nativo. **Não há
padrão APG para navegação de site**, e a ausência está registrada em `a11y.apg`. O roving
tabindex do nosso `TreeView` foi considerado e recusado: numa lateral, tabular item a item é o
que a pessoa espera.

**Licenças:** shadcn/ui, Untitled UI React e MUI — **MIT**, verificadas em 02/08/2026.

**Código copiado:** nenhum.

## Parte E do PLANO-1.0 — `Dialog`

07/08/2026. Não é lote nem componente novo: é o **primeiro dos 42** que nasceram antes do
`BUILDING.md` e por isso não têm registro aqui. Foi feito inteiro, sob o procedimento, para
**medir quanto custa cada um** antes de o Victor decidir se os 42 entram. O custo medido está no
`04-PROTOCOLO-IA.md` §3.

### Passo 1 — o que a medição achou antes de abrir qualquer referência

O `Dialog` da Aurea é `open` · `title` · `children` · `footer` · `onClose`. Cinco props, uma
saída só: Escape, fundo e botão de fechar chamam o mesmo `onClose`. O `.dialog-body` é a parte
que rola; cabeçalho e rodapé ficam. O motor é o `Dialog` do Base UI e o portal já respeita o
`portalContainer` do `AureaProvider` (fechado na Parte C).

### Passo 2 — quem TEM este componente, medido pasta a pasta

| Referência | Tem? | O que é |
|---|---|---|
| `base-ui-master` | **sim** | `react/src/dialog`, 11 peças (`Root`, `Trigger`, `Portal`, `Backdrop`, `Popup`, `Viewport`, `Title`, `Description`, `Close`, `Handle`) — é o motor que já usamos |
| `ui-main` (shadcn/ui) | **sim** | `ui/dialog.tsx`, 158 linhas, 9 peças sobre o Radix |
| `material-ui-master` (MUI) | **sim** | `Dialog/`, 343 linhas — o mais configurável: `maxWidth`, `fullScreen`, `fullWidth`, `scroll: body\|paper`, `slots` |
| `react-main` (Untitled UI) | **sim** | `application/modals/modal.tsx` — envelope fino sobre react-aria-components |
| `kibo-main` | **parcial** | não há `dialog`: há `dialog-stack`, que é outra coisa (pilha de diálogos encadeados) |
| `reui-main` | **não** | — |
| `media-chrome-main` | **não** | — |

### Passo 3 — o que serve, e o que não serve

**Convergiu nas quatro:** o diálogo é composto (gatilho · portal · fundo · popup · título ·
fechar), o título é o **nome acessível**, e o fechamento vem de três caminhos que precisam ser um
só comportamento. A Aurea entrega os quatro — o que ela não expõe é a **decomposição**, e isso é
o passo 5 do `BUILDING.md`: um `Dialog` de cinco props cobre o caso, e nove peças seriam
superfície de configuração de outra biblioteca.

**O que UMA só tem e VALE, e é o achado desta entrada:** o `initialFocus` e o `finalFocus` do
Base UI. Não é preferência de aparência — é acessibilidade, e o default deles é medido: o foco
vai para o primeiro elemento tabulável, **exceto quando o diálogo abriu por toque**, caso em que
o popup recebe o foco para não abrir o teclado virtual. Nós não expomos nem um nem outro. O
default cobre a maioria; o que falta é o formulário cujo primeiro campo não deve ser o alvo, e o
retorno de foco para um lugar que não é o gatilho. **Fica registrado como lacuna conhecida, não
implementado aqui** — prop nova é escopo novo (`BUILDING.md` §3.4).

**O que NÃO entra, e por quê:** `maxWidth` e `fullWidth` do MUI são dimensão como configuração,
que é o defeito do check 23 por outro caminho — a largura do diálogo é da identidade e sai de
token. `scroll: "body"` (rolar a página inteira em vez do corpo) não entra: a Aurea já escolheu
o corpo rolante, e dois modos de rolagem são duas peles. O `dialog-stack` do Kibo é componente
diferente e não se confunde com este — é o passo 2 do `BUILDING.md` funcionando ("nome igual não
é componente igual"; aqui, nome parecido).

**Teclado:** as quatro concordam e o Base UI já entrega — Escape fecha, o foco fica preso
enquanto aberto e volta ao gatilho ao fechar. Nada a escrever.

**Licenças:** Base UI, shadcn/ui, MUI e Untitled UI React — **MIT**, verificadas em 02/08/2026.

**Código copiado:** nenhum.

## Parte E, item E14 — as 40 que nasceram antes do procedimento

07/08/2026. São os componentes anteriores ao `BUILDING.md` (31/07/2026) e por isso sem registro
aqui. O item **E14** do [`PLANO-1.0.md`](PLANO-1.0.md) fecha a lacuna, e o `Dialog` acima foi o
primeiro — feito isolado para **medir o custo** antes de o Victor decidir.

### Uma medição de MÉTODO, feita antes da primeira entrada, e ela muda a aritmética

**Nem toda referência é uma leitura independente.** Medido em 07/08/2026 com
`difflib.SequenceMatcher` sobre o `alert.tsx` de cada uma:

| Comparação | Similaridade | O que significa |
|---|---:|---|
| `kibo-main/packages/shadcn-ui/**` ⟷ shadcn/ui | **94%** | é o shadcn **vendorizado** — muda o caminho do import e a ORDEM das classes |
| `reui-main/registry/bases/**` ⟷ shadcn/ui | **70%** | derivado, mas com variantes e decomposição próprias |

Consequência prática, e ela vale para as 40: **quando o componente do Kibo vem de
`packages/shadcn-ui/`, ele NÃO conta como convergência** — dizer "convergiu em quatro" contando
duas cópias do mesmo arquivo é inflar o número, que é o oposto do que este documento serve. O
Kibo conta quando o componente é dele: `packages/banner`, `packages/status`, `packages/table`,
`packages/combobox`, `packages/code-block`, `packages/video-player`, `packages/dropzone`,
`packages/tree`, e os outros de `packages/<nome>`.

É o irmão da regra do passo 2 do `BUILDING.md`. Lá: *nome igual não é componente igual*. Aqui:
**referência diferente não é leitura diferente.**

---

### `Alert`

**Medido antes:** `.alert` é grid de 3 colunas com `--radius-lg`, quatro variantes, e o papel
muda com a variante — `danger` sai `role="alert"`, as outras três `role="status"`.

**Quem tem:** shadcn (66L, 3 peças) · MUI (`Alert/`, 375L) · ReUI (72L, leitura derivada) ·
Kibo **não** (o `alert.tsx` dele é o do shadcn vendorizado; o `patterns/alert-dialog` é outro
componente) · Base UI, Untitled UI e Media Chrome **não têm**.

**Convergiu:** a caixa tem ícone opcional, título opcional e corpo, e o alerta **fica no fluxo** —
quem flutua é o toast. Título e descrição são peças separadas nas três.

**O que o MUI tem e as outras não, e vale registrar:** `severity` **separado de** `color`, e um
`iconMapping` por severidade. Ele é o único que trata "o que isto significa" e "de que cor isto é"
como eixos distintos. Não entra: na Aurea a cor **vem** do significado, por decisão de identidade
— dois eixos permitiriam um alerta de erro pintado de verde.

**Não entra:** o `onClose`/`closeText` do MUI e o `AlertDialog` que shadcn, Kibo e ReUI põem no
mesmo arquivo. Alerta que se fecha é `Banner` aqui, e diálogo de confirmação é `Dialog` — juntar
os três num nome foi o que fez o `alert-dialog` existir em três das sete.

**Decisão nossa:** o papel muda com a variante. Nenhuma das três faz isso — o MUI aceita `role`
como prop e o shadcn deixa fixo. `role="alert"` interrompe o leitor de tela, e interromper por um
aviso informativo é ruído; reservar a interrupção para `danger` é o que o próprio APG recomenda.

**Licenças:** shadcn/ui, MUI e ReUI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `Badge`

**Medido antes:** dez variantes, pill por `--radius-control`, e `line-height` fixo — este último é
o achado **A2**, em que o badge media duas alturas diferentes conforme o rótulo.

**Quem tem:** shadcn (48L) · MUI (`Badge/`, 361L) · Untitled UI (`base/badges`, com
`badge-types.ts` de 264L) · ReUI (48L) · Kibo tem `packages/pill`, que é outro componente.

**Aqui a primeira pergunta do passo 2 valeu a entrada inteira: NÃO é o mesmo componente.** O
`Badge` do MUI é o **contador sobreposto** a outro elemento — o pontinho no canto do ícone de
notificações (`badgeContent`, `anchorOrigin`, `overlap`, `max`). O do shadcn e o nosso são um
**rótulo curto**. São duas coisas com um nome só, e o MUI foi lido para não construir a errada. O
contador sobreposto existe na Aurea como `.notification-count`, dentro do `NotificationCenter`, e
não como componente público.

**Convergiu (shadcn, Untitled, ReUI):** é um `<span>` com variantes de tom, sem tamanho, e não é
focável — badge clicável é `Button`.

**O que o Untitled tem e vale:** o `badge-types.ts` separa **tipo** (pill, badge, dot) de **cor** e
de **tamanho** — 264 linhas só de tipos. Mostra até onde vai um sistema que trata o badge como
família. Não entra: a Aurea tem `Status` para o caso do ponto, e um segundo eixo de forma criaria
dois desenhos para a mesma etiqueta.

**Não entra:** o `outline` do shadcn — a Aurea já tem `neutral` com borda, e as duas conviveriam
sem que ninguém soubesse qual usar.

**Licenças:** shadcn/ui, MUI, Untitled UI React e ReUI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `Banner`

**Medido antes:** grid de 3 colunas com `--radius-card`, ícone e botão de dispensar opcionais, e
as colunas se mantêm sem eles — um `<span/>` vazio segura a grade, para que banners empilhados
fiquem alinhados.

**Quem tem:** **só o Kibo**, e é dele mesmo (`packages/banner`, não a pasta vendorizada). As outras
seis **não têm** — verificado pasta a pasta.

**O que o Kibo dá, e é o valor desta leitura:** cinco peças (`Banner`, `BannerIcon`, `BannerTitle`,
`BannerAction`, `BannerClose`) e um `show` **controlável** por contexto, com
`useControllableState`. Ou seja: ele resolve o "dispensar" guardando o estado, e expõe as duas
formas — controlado e não controlado.

**O que entrou:** a lista de peças — ícone, título, ação, fechar — confirmou que a nossa está
completa, e o `BannerAction` apontou o que faltava pensar: um banner costuma ter uma ação além do
fechar, e na Aurea ela entra pelos `children`, sem prop nova.

**O que NÃO entrou, e é o passo 5:** o estado de dispensa. Na Aurea, passar `onDismiss` desenha o
botão e **quem guarda a decisão é o consumidor** — um banner que se esconde sozinho reaparece no
próximo carregamento, e decidir se aquilo persiste é da aplicação, não do sistema. É a mesma
fronteira do `NotificationCenter` (lido/não-lido é do consumidor) e do `MessageList`.

**Licença:** Kibo UI — **MIT**, verificada em 02/08/2026.
**Código copiado:** nenhum.

### `Status`

**Medido antes:** ponto + rótulo, dez variantes que colorem **só o ponto** (`currentColor`), com o
rótulo em `--foreground`. O ponto é decorativo e sai do leitor de tela: quem diz o estado é o texto
(WCAG 1.4.1).

**Quem tem:** **só o Kibo** (`packages/status`, dele mesmo). As outras seis **não têm** —
`base-ui/combobox/status` é outra coisa (estado interno do combobox, não um componente).

**A divergência, e ela confirma uma decisão nossa que estava só na cabeça:** o `Status` do Kibo **é
um `Badge`** — `ComponentProps<typeof Badge>`, `variant="secondary"`, com `StatusIndicator` e
`StatusLabel` dentro. A Aurea separa os dois de propósito, e a razão está no `feedback.tsx`: o
Badge é metadado curto numa cápsula; o Status diz em que estado a coisa está. Ver a única
referência que tem os dois **fundi-los** é o argumento mais forte que eu tinha para conferir a
separação — e ela sobrevive: como `Badge`, o Status herda a cápsula e o fundo, e um painel com oito
estados vira oito cápsulas coloridas, que é ruído. O nosso é ponto + texto, sem caixa.

**O que entrou:** nada de anatomia. O que a leitura deu foi a **confirmação por contraste**, e isso
é registro legítimo — o passo 3 pede o que não serve e por quê.

**Uma diferença de vocabulário que vale anotar:** o Kibo tem quatro estados
(`online`/`offline`/`maintenance`/`degraded`) e a Aurea tem dez. `maintenance` e `degraded` não
existem aqui — e `degraded` é justamente um dos seis estados universais que a **Parte J** do
`PLANO-1.0` promete nomear. Fica o registro para quando ela abrir.

**Licença:** Kibo UI — **MIT**, verificada em 02/08/2026.
**Código copiado:** nenhum.

### `Skeleton`

**Medido antes:** uma classe, `aria-hidden="true"` sempre, animação `skeleton-pulse`, e nenhuma
prop de tamanho — a forma vem do `className`/`style` de quem usa.

**Quem tem:** shadcn (**13L**) · MUI (`Skeleton/`, 335L) · ReUI (13L) · Kibo só a cópia vendorizada
· Base UI, Untitled UI e Media Chrome **não têm**.

**A distância entre 13 e 335 linhas é a entrada inteira.** O shadcn é uma `<div>` com animação e
nada mais — que é o nosso desenho. O MUI tem `variant` (text/rectangular/rounded/circular),
`animation` (pulse/wave/false), `width`, `height`, e infere a forma do `children`.

**O que entrou:** nada. E a decisão de não entrar é o passo 5 explícito: `width`/`height` como prop
reprovaria no **check 23** (dimensão é escala de token, não número), e a forma já vem do
`className`, que é como o consumidor descreve a coisa que o esqueleto substitui.

**O que a leitura ACHOU, e não estava em referência nenhuma:** as três desenham o esqueleto e
nenhuma diz o que ele significa para quem não enxerga. A Aurea marca `aria-hidden` — um retângulo
pulsante não tem nada a dizer, e quem anuncia a espera é a região viva em volta, ou o `Spinner`,
que tem `role`. Está escrito no `a11y.apg` da ficha desde o item E12.

**Licenças:** shadcn/ui, MUI e ReUI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `NotificationCenter`

**Medido antes:** compõe `Popover` + lista agrupada, com o painel **fora** de região viva e um
anunciador `aria-live` à parte, que só fala a CHEGADA. Lido/não-lido é do consumidor.

**Quem tem:** **nenhuma das sete tem um centro de notificações.** O que existe é o vizinho: Base UI
tem `toast/` (54 arquivos) e o MUI tem `Snackbar/` (364L). Kibo tem o `toast.tsx` vendorizado do
shadcn.

**E o vizinho responde à pergunta que importa, então a leitura não foi em vão.** Toast e centro de
notificações resolvem o mesmo assunto em tempos opostos: o toast **interrompe** e some; o centro
**acumula** e é revisitado. O Base UI trata o toast como região viva; nós tratamos o painel como
**não** sendo uma, e essa é a decisão que a leitura confirma — reler o painel inteiro a cada
abertura despejaria o feed todo em quem usa leitor de tela.

**O que entrou do Base UI:** o motor. O painel é `Popover` do `@base-ui/react`, que já entrega
foco, `Escape` e posicionamento — não escrevemos nenhum dos três.

**O que NÃO entra:** a fila de toasts com auto-dismiss do MUI (`autoHideDuration`), porque a Aurea
já tem `useToast` no `AureaProvider` para esse caso, e são componentes diferentes.

**Limitação declarada:** não há referência local para o agrupamento por tempo nem para o padrão de
feed. O que existe aqui saiu de pesquisa registrada em 07/2026 (W3C ARIA23 e a nota do MDN sobre
`role="log"`), citada no `feedback.tsx`, não de referência.

**Licenças:** Base UI e MUI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `Stack`, `Cluster` e `Grid` — as três primitivas, numa entrada só

Vão juntas porque a leitura é a mesma e a decisão também: são `<div>` com uma classe, e o que se
consulta nelas é **quanta configuração um sistema deve expor**.

**Medido antes:** `.stack` é coluna com `--space-4`; `.cluster` é linha que **quebra**, centrada,
com `--space-3`; `.grid` é `auto-fill` com `minmax(min(var(--grid-min,15rem),100%),1fr)` e
`--space-4`. Nenhuma tem prop. O único botão de ajuste é `--grid-min`, e é CSS, não API.

**Quem tem:** só o **MUI** — `Stack/` (73L) e `Grid/` (292L). shadcn, Base UI, Kibo, ReUI e Media
Chrome **não têm primitiva de layout**; no Untitled, `grid.tsx` é padrão de fundo decorativo, não
layout (o passo 2 de novo: nome igual, componente diferente). Não existe `Cluster` em nenhuma das
sete — o nome é da `DIRECTION.md`.

**A ausência é o achado, e ela é maior que a presença.** Cinco das sete referências **não têm**
primitiva de layout, e não é esquecimento: elas assumem Tailwind, onde `flex flex-col gap-4` já é
a primitiva. A Aurea não tem Tailwind (`REFERENCES.md` § Untitled UI: "adotar a escala de um
sistema não é adotar o sistema"), então a primitiva precisa existir aqui — senão cada consumidor
escreve o próprio empilhamento e o espaçamento do sistema deixa de valer.

**O que o MUI tem, e é exatamente o que NÃO entra:** `Stack` aceita `direction`, `spacing`,
`divider` e `useFlexGap`, todos responsivos por breakpoint; `Grid` aceita `container`, `size`,
`offset`, `columns` e `spacing`. É um sistema de layout completo como API de componente.

Não entra, e o motivo tem número atrás: `spacing` como prop transforma **todo** espaçamento numa
decisão por sítio de uso, e foi assim que a auditoria de 26/07/2026 achou 24 linhas com pixel cru
entrando sem ninguém notar (achado M1, que virou a catraca do check 12). Uma primitiva que aceita
qualquer espaçamento é uma primitiva que não tem espaçamento. O `direction` também fica de fora:
`Stack` é coluna e `Cluster` é linha — dois nomes que se leem, em vez de um nome com uma prop que
inverte o significado.

**O que entrou:** uma ideia só, do `Grid` do MUI — que a grade precisa de **um** ponto de ajuste,
senão vira dezenas de casos particulares. Aqui ele é `--grid-min`, no CSS, no mesmo idioma do
`--qr-size` do `QRCode`: variável de ajuste, não prop. Um número de colunas como prop congelaria
o que só o contêiner sabe.

**Licença:** MUI — **MIT**, verificada em 02/08/2026.
**Código copiado:** nenhum.

### `AppShell`

**Medido antes:** grid de duas colunas que compõe `Topbar` + `Sidebar` + `<main>`; a lateral vira
gaveta em tela estreita com **popover nativo e zero JavaScript** ([ADR-0003](../decisions/0003-gaveta-de-navegacao-sem-javascript.md));
`sidebarCollapsed` é controlado pelo consumidor e encolhe a coluna para `--sidebar-rail`.

**Quem tem:** o **Untitled UI** é o único com a moldura inteira — `application/app-navigation`,
12 arquivos e cinco arranjos de lateral. shadcn tem `sidebar.tsx` (21,2 KB), que é a lateral e não
o shell. MUI tem `Drawer` + `AppBar` como peças soltas, sem a composição. Base UI, Kibo, ReUI e
Media Chrome **não têm**.

> Este componente já teve leitura registrada: a entrada **`Sidebar`** (Parte B) mediu as mesmas
> três referências pasta a pasta. O que se acrescenta aqui é o que é do **shell**, não da lateral.

**Convergiu (Untitled e shadcn):** o shell é grid, a coluna da lateral tem largura fixa em token,
e o recolhimento **muda a coluna do grid** — não é a lateral que encolhe sozinha.

**O que entrou:** essa relação. Está na regra `.app-shell:has(> .sidebar-collapsed)` do core, e o
`>` dela é uma cicatriz: sem o combinador de filho, uma lateral recolhida mostrada como **exemplo**
dentro do `<main>` recolhia a lateral de verdade do documento (medido em 06/08/2026; o `skin.spec`
ganhou dois shells por causa disso).

**O que NÃO entra:** o `SidebarProvider` + `useSidebar` do shadcn, que guarda o estado de recolher
em contexto e cookie. Na Aurea o `sidebarCollapsed` é do consumidor — quem sabe se há espaço, e se
a preferência se guarda, é a aplicação. Guardar num cookie é decisão de produto, não de sistema.

**Onde a Aurea diverge das duas, e de propósito:** a **marca mora no topo**, não na lateral
(decisão do Victor, 23/07/2026), então o `Topbar` atravessa a largura toda e a lateral começa
abaixo dele. Untitled e shadcn põem a marca na lateral. É identidade, e identidade não se negocia
com referência.

**Licenças:** Untitled UI React e shadcn/ui — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `Table`

**Medido antes:** `Table` é a tabela **apresentacional** — quem ordena, filtra e pagina é o
`DataGrid`. Ela embrulha a `<table>` numa região focável (`tabIndex=0`) para que uma tabela mais
larga que a tela role pelo teclado, e o `caption` vira o nome acessível dessa região.

**Quem tem:** as seis — shadcn (116L, 8 peças) · Kibo (`packages/table`, próprio) · Untitled
(`application/table`, 307L) · ReUI (101L) · MUI (`Table/`, 10 arquivos) · Media Chrome não.

**Convergiu nas seis:** a decomposição é a do HTML — root, header, body, footer, row, head, cell,
caption. Ninguém inventa nome para o que a linguagem já nomeia, e é o que a Aurea faz ao aceitar
`children` crus em vez de props de coluna.

**O que a Untitled tem e as outras não, e é o mais valioso desta leitura:** ela já traz **seleção**
(`selectionBehavior`, `selectionMode`, checkbox em `slot="selection"`) e **ordenação** com
`sortDirection` no cabeçalho, dentro da tabela apresentacional. Não entra **aqui** — entra no
`DataGrid`, e a **Parte F** do `PLANO-1.0` é exatamente essa fila (F1 modo controlado, F5 seleção
e ação em lote, F6 cabeçalho fixo). Fica o registro para quando ela abrir: a Untitled é a
referência a reler ali.

**O que NÃO entra:** o `TableFooter` do shadcn e do MUI. Rodapé de tabela é somatório, e somatório
é conteúdo — vai no `<tfoot>` que o consumidor escreve, sem peça nossa.

**O que a Aurea tem e nenhuma das seis tem:** a região **focável** em volta. Medido: shadcn e ReUI
embrulham num `<div className="overflow-x-auto">` sem `tabIndex`, o que produz uma área que rola
com o mouse e **não** com o teclado — falha de WCAG 2.1.1 que só aparece quando a tabela é larga.
A Aurea põe `role="region"`, `tabIndex={0}` e nome acessível.

**Licenças:** shadcn/ui, Kibo UI, Untitled UI React, ReUI e MUI — **MIT**, verificadas em
02/08/2026.
**Código copiado:** nenhum.

### `Kbd`

**Medido antes:** `.kbd` é cápsula pequena com borda, fonte de código e `--radius-sm`. Mora no
`internal.tsx` porque o `Button` depende dele (a prop `kbd`), e a casa pública é o `data-display`.

**Quem tem:** shadcn (**28L**) · ReUI (26L) · Kibo só a cópia vendorizada, mas tem
`patterns/kbd/` com 39 exemplos · Base UI, Untitled UI, Media Chrome e **MUI não têm**.

**Convergiu:** é `<kbd>` nativo com cápsula, em fonte monoespaçada, e **não é focável**.

**O que os 39 exemplos do Kibo deram, e não é anatomia:** a lista de casos de uso — teclas de seta,
combinações com modificador, teclas dentro de menu e dentro de botão. Confirmou que o uso principal
aqui (dentro do `Button`, via prop `kbd`, com `aria-keyshortcuts`) é um dos casos previstos, e não
uma invenção nossa.

**O que NÃO entra:** o `KbdGroup` do shadcn, que agrupa teclas com separador. A Aurea escreve o
atalho como um `Kbd` só (`"Ctrl+K"`), e a razão é o leitor de tela: `aria-keyshortcuts` recebe uma
string, e quebrar o atalho em três elementos faria o texto visível e o atributo divergirem.

**Licenças:** shadcn/ui, ReUI e Kibo UI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `KPI`

**Medido antes:** é um `Card` com rótulo em `--muted-foreground`, valor em `<strong>` e uma
tendência opcional em `<small>`. Nada é focável.

**Quem tem:** **nenhuma das sete.** Verificado pasta a pasta, incluindo os 157 componentes do MUI e
os 43 pacotes do Kibo. É um dos seis que o `BUILDING.md` §6 já registrava como sem referência
local — a decisão do Victor em 31/07/2026 foi mantê-los.

**O que existe de vizinho, e por que não serve:** o `Card` de todas elas. Mas cartão é contêiner; o
KPI é um **arranjo** de três textos com hierarquia definida, e a hierarquia é o componente. Ler o
Card não responde onde vai a tendência.

**Como foi construído, então:** por composição do que já existe aqui — `Card` para a superfície,
`--muted-foreground` para o rótulo, e o valor em `<strong>` porque é a única coisa que se lê de
longe. A tendência é `ReactNode` e não número, e essa decisão veio do passo 4 (pesquisar antes de
inventar): sinal, unidade e redação de uma variação são do domínio — "+12%", "▲ 12 pontos" e "12
mais que ontem" são a mesma informação em três idiomas de produto, e um sistema que escolhe um
deles está decidindo por quem não pediu.

**Limitação declarada:** esta entrada não tem referência externa, e isso é o registro honesto —
não uma formalidade cumprida. Se um dia entrar uma referência com painéis de indicador, o `KPI` é
o primeiro a reler.

**Licença:** não se aplica — nada foi lido.
**Código copiado:** nenhum.

### `Field` — e com ele o `Input` e o `Textarea`

**Registro histórico — medido antes da correção de 12/08/2026:** o `Field` era um `<label>` que
**clonava o filho** para pôr `aria-describedby` e `aria-invalid` no elemento certo. Isso ainda
deixava hint e erro dentro do nome acessível; o `Field` atual usa um contêiner e `<label for>`
quando é dono do nome. `Input` e `Textarea` são o elemento nativo com uma classe e nada mais —
`forwardRef`, todas as props passam.

**Quem tem a ideia de "campo com rótulo, dica e erro":** Untitled (`base/input/label.tsx` +
`hint-text.tsx`, peças separadas) · MUI (`FormControl` + `FormLabel` + `FormHelperText`) · shadcn
(`Label` solto, o campo se monta à mão) · ReUI idem · Base UI tem `field/`, que é o mais próximo do
nosso · Kibo e Media Chrome **não têm**.

**Convergiu:** rótulo, dica e mensagem de erro são **três textos com papéis diferentes**, e as
cinco tratam assim. Nenhuma junta os três num nó só.

**E aqui está o achado que a Aurea já tinha pago caro, confirmado pela leitura:** o **A12** (Fase
5) foi exatamente isto — hint e erro estavam DENTRO do `<label>`, então o nome acessível do campo
virava "E-mail Usamos para entrar Endereço inválido", tudo grudado, e nada dizia que o valor era
inválido. As cinco referências separam porque **nome é o que o campo É; dica e erro são sobre o
VALOR**. A correção da Aurea (clonar o filho para ligar `aria-describedby`) chega ao mesmo destino
por um caminho diferente: as outras obrigam o consumidor a repetir ids, e aqui isso é automático.

**O que NÃO entra:** a decomposição em `FormControl`/`FormLabel`/`FormHelperText` do MUI e as peças
soltas do shadcn. São quatro peças para desenhar um campo, e o passo 5 diz o contrário — um `Field`
com três props cobre o caso, e o consumidor que quiser montar à mão ainda pode, porque `Input` e
`Textarea` funcionam sozinhos.

**O que a Aurea faz e nenhuma faz:** ligar por **clonagem**. Medido: no shadcn e no Untitled o
consumidor escreve o `id` no `Input` e o `htmlFor` no `Label`, e esquecer um dos dois não reprova
em lugar nenhum — falha silenciosa. Aqui o `useId` gera, o `Field` liga, e não há como esquecer.

**Licenças:** Base UI, shadcn/ui, Untitled UI React, ReUI e MUI — **MIT**, verificadas em
02/08/2026.
**Código copiado:** nenhum.

### `Checkbox` e `Switch`

Juntos: mesma leitura, e a diferença entre eles foi o que a leitura decidiu.

**Medido antes:** os dois são `<label>` com `<input>` nativo dentro e um `.control-mark` desenhado.
O `Switch` põe `role="switch"` no input; o `Checkbox` tem `labelHidden` (o rótulo vira `.sr-only`)
e `description`.

**Quem tem:** Base UI (`checkbox/` 11 arq, `switch/` 11 arq) · shadcn (32L / 35L) · ReUI · MUI
(`Checkbox` 306L, `Switch` **442L**) · Untitled tem checkbox (119L) e **não tem switch** · Kibo só
as cópias vendorizadas · Media Chrome não.

**Convergiu nas cinco:** o `<input>` nativo continua existindo — escondido, mas presente — e a
marca é desenhada por cima. Ninguém troca o input por `<div role="checkbox">`, e a razão é o que a
Aurea também segue: o input nativo entrega foco, teclado, envio de formulário e o
`indeterminate` de graça.

**A divergência que importa, e ela é de papel:** o MUI e o shadcn desenham o Switch como um
`Checkbox` com outra pele — mesmo `role`. A Aurea põe `role="switch"`, e o Base UI também. A
diferença não é estética: um checkbox é "marque se quiser" num conjunto que se envia; um switch é
"isto está ligado agora", e o leitor de tela anuncia "ativado/desativado" em vez de
"marcado/desmarcado". Manter os dois papéis é o que separa as duas perguntas.

**O que entrou:** `role="switch"`, do Base UI.

**O que NÃO entra:** as 442 linhas de `Switch` do MUI, que são em quase tudo variação de tamanho e
cor por tema, e o `indeterminate` como prop pública do Checkbox — na Aurea ele existe, mas só
dentro do `DataGrid` (o cabeçalho de "selecionar todas"), porque é lá que o estado parcial tem
significado. Expor a terceira posição em todo checkbox convida a usá-la como enfeite.

**Licenças:** Base UI, shadcn/ui, Untitled UI React, ReUI e MUI — **MIT**, verificadas em
02/08/2026.
**Código copiado:** nenhum.

### `Range`

**Medido antes:** é `<input type="range">` puro com uma classe. Sem componente, sem estado.

**Quem tem:** todas menos Media Chrome — Base UI (`slider/`, **40 arquivos**) · shadcn (63L) ·
Untitled (75L) · ReUI (52L) · MUI (`Slider.js`, **1077 linhas**) · Kibo só vendorizado.

**A distância entre 1 elemento nativo e 1077 linhas é a entrada.** O que as outras constroem por
cima: **intervalo** (dois polegares), **marcas** com rótulo, rótulo de valor flutuante,
orientação vertical, escala não-linear.

**O que entrou:** nada, e a decisão é do passo 5 com uma razão medida atrás. O `<input
type="range">` nativo entrega setas, `Home`/`End`, `PageUp`/`PageDown`, arraste, toque e o
`aria-valuetext` — tudo sem uma linha. É o mesmo raciocínio que o `MediaPlayer` já usa para a
barra de posição, e está escrito lá: *"um slider de verdade, com setas/Home/End vindos do browser
— nada de `role="slider"` à mão"*.

**O que fica registrado como lacuna conhecida:** **intervalo** (de–até) não existe na Aurea, e o
nativo não faz. Quando aparecer demanda, o Base UI já tem — 40 arquivos, com dois polegares e
teclado — e é para lá que se olha. Não foi construído agora porque componente novo é lote novo
(`BUILDING.md` §3.4).

**Licenças:** Base UI, shadcn/ui, Untitled UI React, ReUI e MUI — **MIT**, verificadas em
02/08/2026.
**Código copiado:** nenhum.

### `Select`

**Medido antes:** é `<select>` **nativo** com uma classe e a seta desenhada em
`background-image`. Nenhuma das outras faz isso por padrão.

**Quem tem:** Base UI (`select/`, 60 arq) · shadcn (190L) · Untitled (`base/select/`, 10 arq) ·
ReUI (220L) · MUI (`Select/`, 15 arq) · Kibo vendorizado · Media Chrome não.

**Todas constroem uma listbox própria — e a Aurea usa o nativo.** É a divergência mais forte deste
lote, então precisa de razão, não de preferência:

1. **O nativo é o único que funciona no celular como as pessoas esperam.** Ele abre a roda do
   sistema, com a acessibilidade e o gesto do sistema. Uma listbox custom em tela pequena é uma
   lista rolável que compete com o teclado virtual.
2. **Ele entrega busca por digitação, `Home`/`End`, setas e formulário sem uma linha.**
3. **E a leitura NÃO foi unânime a favor do custom:** o Untitled mantém um `select-native.tsx` (97
   linhas) ao lado do custom, o que diz que eles também acham que há casos em que o nativo é a
   resposta certa.

**O que se PERDE, e fica declarado:** opção com ícone, opção com descrição em duas linhas, grupos
com cabeçalho estilizado e busca dentro da lista. Quem precisa disso na Aurea usa o **`Combobox`**,
que é custom e existe justamente para esse caso — a divisão de trabalho entre os dois é a decisão.

**O que NÃO entra:** o `Select` do MUI com `renderValue`, `multiple` e `native` como prop. Três
comportamentos diferentes atrás de um nome é o que faz alguém escolher errado.

**Licenças:** Base UI, shadcn/ui, Untitled UI React, ReUI e MUI — **MIT**, verificadas em
02/08/2026.
**Código copiado:** nenhum.

### `Combobox` e `MultiCombobox`

**Medido antes:** os dois são construídos sobre o Base UI, dentro de um `Field`. O multi desenha
os selecionados como chips que **quebram** em vez de esticar a caixa.

**Quem tem:** Base UI (`combobox/`, **96 arquivos** — o maior do motor) · shadcn (310L) · Kibo
(`packages/combobox`, próprio) · Untitled (`base/select/combobox.tsx`, 177L) · ReUI (323L) · **MUI
não tem** (o `Autocomplete` dele vive no pacote `@mui/lab`/`material` sob outro nome) · Media
Chrome não.

**Convergiu:** campo de texto + lista filtrada + estado vazio ("No results"), e o filtro é do
consumidor ou da própria lista, nunca do sistema de estilo.

**O que entrou:** o motor inteiro, do Base UI. Os 96 arquivos entregam filtro, navegação por seta,
`aria-activedescendant`, seleção múltipla e o estado vazio. Escrever isso à mão seria o defeito que
a [ADR-0004](../decisions/0004-motor-headless-base-ui.md) existe para impedir.

**O que a leitura mudou aqui, e é o passo 3 fazendo efeito:** shadcn e ReUI montam o combobox como
**composição na página** — `Popover` + `Command` + `CommandItem`, 310 linhas que o consumidor cola.
A Aurea entrega **um componente com `items`**, no idioma da casa (`Timeline`, `DataList`,
`Breadcrumb`, `Stepper`, `Sidebar`, `TreeView`). Menos superfície, e o mesmo caso coberto.

**O que NÃO entra:** o `custom-actions` do Kibo (42 exemplos de ação dentro da lista — "criar
novo", "limpar"). É um caso real, mas cada ação é uma decisão de produto; entra pelos `children`
quando alguém pedir, não como prop.

**Licenças:** Base UI, shadcn/ui, Kibo UI, Untitled UI React e ReUI — **MIT**, verificadas em
02/08/2026.
**Código copiado:** nenhum.

### `SearchField`

**Medido antes:** é `.input-wrap` + `Icon` + `Input type="search"`. Três linhas, sem estado.

**Quem tem:** **nenhuma das sete tem um componente de busca.** O que existe é o padrão: nas seis
com input, a busca é um `Input` com um ícone posto pelo consumidor.

**Por que ele existe aqui, então:** porque o ícone dentro do campo exige uma caixa (`.input-wrap`)
com o padding certo, e essa caixa **estava sendo reescrita** em três lugares do catálogo antes de
virar componente. É a mesma razão do `Sidebar` no item B1 — a peça existia no repositório e não era
da biblioteca.

**O que entrou:** `type="search"`, que é o único acréscimo sobre o `Input` e não é decorativo: o
navegador oferece o botão de limpar, o teclado do celular mostra a tecla "Buscar", e o leitor de
tela anuncia "campo de busca".

**Limitação declarada:** sem referência externa para a anatomia. A justificativa é interna
(duplicação medida), e está registrada como tal.

**Licença:** não se aplica — nada foi lido.
**Código copiado:** nenhum.

### `FileInput`

**Medido antes:** já faz mais do que parece — múltiplos arquivos, progresso real, cancelar e
repetir por item. A área de soltar é `.dropzone`, tracejada, com `--radius-card`.

**Quem tem:** Kibo (`packages/dropzone`, próprio) · Untitled (`application/file-upload`, com
`file-upload-base.tsx` de **15,6 KB** e um `draggable.tsx` à parte) · as outras cinco **não têm**.

**O que o Kibo dá:** a API da área de soltar — `accept`, `maxFiles`, `maxSize`, `onDrop`,
`onError`, e a decomposição em `Dropzone` + `DropzoneContent` + `DropzoneEmptyState`. Confirmou que
o nosso conjunto de validações (tipo e tamanho, com mensagem por arquivo) é o conjunto esperado.

**O que o Untitled dá, e é o que falta aqui:** a **fila** como peça — item com nome, tamanho,
barra de progresso, botão de cancelar e de repetir, e o `draggable.tsx` separado para reordenar. É
exatamente o enunciado da **Parte G** do `PLANO-1.0` (G1 fila que sobrevive, G2 pausar e retomar,
G6 recibo final). Fica o registro: quando a Parte G abrir, `application/file-upload` é a referência
a reler, e ela é a mais completa das sete.

**O que NÃO entra agora:** transporte. A fronteira está escrita na Parte G e não se move — o
componente mostra a fila e o que aconteceu com ela; subir o byte é do consumidor.

**Licenças:** Kibo UI e Untitled UI React — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `Textarea`

Lido junto com o `Field` acima — é o elemento nativo com uma classe, e a leitura das seis é a
mesma: ninguém constrói área de texto própria.

**A única decisão registrada:** `resize: vertical`, medido no core. As referências deixam o
`resize` nativo (que é `both`), e crescer na horizontal quebra o layout de qualquer formulário em
coluna. É correção nossa, não extraída.

**Licenças:** as mesmas do `Field`.
**Código copiado:** nenhum.

### `Toolbar`, `ToolbarButton`, `ToolbarGroup` e `ToolbarSeparator`

As quatro numa entrada: são um componente só decomposto, e a leitura é a mesma.

**Medido antes:** os quatro envelopam o `Toolbar` do Base UI. A barra é pill
(`--radius-control`), o grupo usa `--space-1` (era `gap:4px` cru até o item E12) e o separador
**atravessa** a barra por `align-self:stretch`. O `ToolbarGroup` **lança** fora de um `Toolbar` —
medido em 07/08/2026: `ToolbarRootContext is missing`.

**Quem tem:** só **duas** — Base UI (`toolbar/`, 23 arquivos, com `root`, `button`, `group`,
`link`, `input` e `separator`) e MUI (`Toolbar/`, 140L). shadcn, Kibo, Untitled, ReUI e Media
Chrome **não têm barra de ferramentas**.

**E as duas discordam no que importa.** O `Toolbar` do MUI é **layout** — uma `<div>` com altura e
padding, usada dentro do `AppBar`; não tem papel, nem teclado, nem grupo. O do Base UI é o **padrão
APG Toolbar**: `role="toolbar"`, roving tabindex, setas que movem entre os controles, `Home`/`End`.
São dois componentes com um nome, e é a pergunta do passo 2 outra vez.

**O que entrou:** o do Base UI, inteiro. A Aurea não escreveu uma linha de teclado — o roving
tabindex e as setas vêm do motor, e é isso que separa "uma fileira de botões" de uma barra de
ferramentas de verdade.

**A decomposição que entrou, e o que ficou de fora:** `Root`, `Button`, `Group` e `Separator` são
os quatro que existem aqui. Ficaram de fora o `Link` e o `Input` do Base UI — o primeiro porque o
`Button` da Aurea já vira `<a>` com `href`, e ter dois caminhos para o mesmo elemento é o defeito
que o passo 5 recusa; o segundo porque campo dentro de barra é composição, e o consumidor põe o
`SearchField` como filho.

**Uma coisa que a leitura do MUI deu de graça:** `data-orientation="vertical"`. O Base UI expõe a
orientação e o MUI não, e a barra vertical existe em painel lateral de editor. Está no core como
`.toolbar[data-orientation="vertical"]`, incluindo o giro do separador.

**Licenças:** Base UI e MUI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `IconButton`

**Medido antes:** é o `Button` com `btn-icon`, **quadrado** (36×36 em `md`, medido), com `label`
obrigatório que vira `aria-label`.

**Quem tem como componente próprio:** MUI (`IconButton`) e Untitled. shadcn e ReUI usam
`Button size="icon"`; Base UI não tem botão (é motor); Kibo vendorizado; Media Chrome tem
`media-chrome-button.ts` (12,7 KB), que é botão de player.

**A divergência é de API, não de pele, e a nossa é a mais rígida das três:** no shadcn,
`size="icon"` é um valor de tamanho como outro qualquer, e **nada obriga um nome acessível** — um
botão só com ícone sem `aria-label` compila, renderiza e é anunciado como "botão". No MUI o
`aria-label` também é opcional. Na Aurea, `label` é **prop obrigatória** do tipo.

**O que entrou:** a existência do componente separado, do MUI e do Untitled. Manter `IconButton`
como nome próprio em vez de `Button size="icon"` é o que permite exigir o rótulo no TIPO — com uma
prop de tamanho não haveria onde exigir.

**O que NÃO entra:** a `edge` prop do MUI (`start`/`end`, que corta o padding para alinhar com a
margem do contêiner). É compensação de um sistema de espaçamento que a Aurea não tem.

**Licenças:** MUI e Untitled UI React — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `Tabs`

**Medido antes:** `.tabs` é `inline-flex` pill com os painéis em `card card-inset`; o motor é o
`Tabs` do Base UI com `activateOnFocus` — seta move **e** seleciona.

**Quem tem:** todas menos Media Chrome — Base UI (`tabs/`, 24 arq) · shadcn (91L) · Untitled
(`application/tabs`, 229L) · ReUI (82L) · MUI (`Tabs.js`, **1028 linhas**) · Kibo vendorizado,
mais 11 exemplos próprios.

**Convergiu:** lista de abas + painéis, com `aria-controls`/`aria-labelledby` ligados, e uma aba
ativa por vez.

**A decisão que a leitura confirmou, e ela é de teclado:** `activateOnFocus`. O APG permite as duas
— seleção automática ao mover a seta, ou manual com `Enter`. O Base UI expõe as duas e a Aurea
escolhe a automática, que é o default do APG para quando o painel é barato de renderizar. Vale
registrar o limite: se um painel fizer requisição ao abrir, a automática dispara uma por seta. Não
é o caso hoje (os painéis são conteúdo pronto), e está anotado para quando for.

**O que NÃO entra, e são 1028 linhas do MUI:** `scrollButtons` (setas que aparecem quando as abas
não cabem), `variant="scrollable"`, `variant="fullWidth"`, e a orientação vertical. A Aurea deixa
as abas **quebrarem**, no mesmo idioma do `Cluster` — rolagem horizontal escondida é a fonte mais
barata de conteúdo inalcançável, e foi o achado **M12** (texto a 200% rolando de lado).

**Licenças:** Base UI, shadcn/ui, Untitled UI React, ReUI e MUI — **MIT**, verificadas em
02/08/2026.
**Código copiado:** nenhum.

### `Pagination`

**Medido antes:** `<nav>` com nome acessível, dois botões e um `Badge` com "página / total". Os
botões **desabilitam** nas pontas. Não guarda estado: `page`, `total` e `onPageChange`.

**Quem tem:** shadcn (127L) · Untitled (`application/pagination`, **378L** no base, mais
`pagination-dot.tsx`) · ReUI (156L) · MUI (`Pagination.js`, 256L) · Base UI **não tem** · Kibo
vendorizado · Media Chrome não.

**Convergiu:** é `<nav>` com nome, e o item atual carrega `aria-current="page"`.

**A divergência, e ela é de escopo:** as quatro desenham a **régua de números** — 1 2 3 … 8 9 —
com elipse e janela deslizante. A Aurea mostra "2 / 5" e dois botões.

Isso é o passo 5 no seu caso mais visível, e a razão é medida: a régua exige decidir quantos
números mostrar, quando elipsar, e o que fazer em tela estreita — o `pagination-base.tsx` do
Untitled gasta 378 linhas nisso, e o MUI expõe `boundaryCount`/`siblingCount` para o consumidor
decidir. Nenhuma dessas decisões melhora "ir para a próxima página", que é o que uma tabela
administrativa faz 95% do tempo.

**Fica declarado como lacuna conhecida:** salto direto para uma página distante não existe aqui. A
`Parte F` (F4, estado na URL) é onde isso volta a ser pergunta, e as quatro referências estarão
aqui registradas.

**O que entrou:** o `aria-current="page"` e o `<nav>` nomeado — os dois estão na Aurea porque as
quatro concordam, não porque alguém lembrou.

**Licenças:** shadcn/ui, Untitled UI React, ReUI e MUI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `TableOfContents`

**Medido antes:** `<nav>` com rótulo visível em caixa alta, itens com um nível de recuo (`sub`), e
o atual marcado com `aria-current`. Presentational: quem sabe as seções é a página.

**Quem tem:** **nenhuma das sete.** É um dos seis que o `BUILDING.md` §6 registra sem referência
local, e a decisão do Victor em 31/07/2026 foi mantê-los.

**O que existe de vizinho:** o índice lateral do próprio site do Kibo, que foi **medido em
30/07/2026** e está registrado na seção "Kibo UI" acima — dali veio a decisão de esconder o índice
abaixo de `xl`, que é o mesmo ponto de corte deles. Isso é anatomia de **catálogo**, não componente
publicado por eles.

**Como foi construído:** por composição do que já existe — `<nav>` nomeado (como `Breadcrumb` e
`Sidebar`), `aria-current` como única fonte do realce (a mesma decisão do item `Sidebar`, tomada
para que o olho e o leitor de tela não possam divergir), e **um** nível de aninhamento. O nível
único é decisão registrada: um índice que espelha cinco níveis de título é um segundo documento.

**Limitação declarada:** sem referência externa para a anatomia do componente.

**Licença:** não se aplica ao componente — a medição do índice do Kibo está registrada acima
(**MIT**, 30/07/2026).
**Código copiado:** nenhum.

### `DropdownMenu` e `ContextMenu`

Juntos porque, no motor, **são o mesmo componente com dois gatilhos** — `ContextMenu.Item`,
`.Separator` e `.Popup` do Base UI **são** os de `Menu.*`. Uma pele, duas aberturas.

**Medido antes:** os dois recebem `items: Array<MenuItemDef | "separator">` e renderizam com a
mesma função. O gatilho do `ContextMenu` é **focável** (`tabIndex 0`) com nome acessível.

**Quem tem:** Base UI (`menu/`, **74 arquivos**, e `context-menu/`, 9) · shadcn (257L / 252L) ·
ReUI (286L / 285L) · MUI tem `Menu` (322L) e **não tem** menu de contexto · Untitled e Kibo
próprios **não têm** · Media Chrome tem `js/menu/` (17 arq), que é menu de player.

**Convergiu:** item, separador, item desabilitado, ícone à esquerda, e o menu vive em portal.

**O achado desta entrada é de teclado, e ele estava na auditoria de 18/07/2026 (MÉDIO 3):** o menu
de contexto abre por `Shift+F10` ou pela tecla Menu, e o navegador só dispara esses eventos sobre
um elemento **FOCADO**. Um gatilho não focável é um menu que só existe para quem usa mouse. shadcn
e ReUI deixam o `ContextMenuTrigger` como uma `<div>` sem `tabIndex` — a Aurea põe `tabIndex={0}`,
`aria-label` e `aria-haspopup="menu"`.

**O que NÃO entra:** submenu, item com checkbox e item com rádio, que as três têm. São 250 linhas
de API para casos que nenhuma superfície pediu, e o `BUILDING.md` §5 continua valendo para o que
não é cobertura de contrato. O motor já entrega — quando houver demanda, é só expor.

**O que a Aurea faz diferente, e é o idioma da casa:** `items` como **dado**, não peças como
filhos. As três referências entregam `<DropdownMenuItem>` para o consumidor compor; aqui é uma
lista, como em `Timeline`, `Breadcrumb`, `Stepper`, `Sidebar` e `TreeView`.

**Licenças:** Base UI, shadcn/ui, ReUI e MUI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `CodeBlock`

**Medido antes:** `<pre><code>` com fonte de código, `--radius-lg`, rolagem própria e um botão de
copiar que flutua (`position:absolute`). O comportamento de copiar mora no `aurea.js` do core —
uma implementação para React e para HTML puro.

**Quem tem:** **só o Kibo** (`packages/code-block`, próprio, 2 arquivos). As outras seis **não
têm**.

**O que o Kibo dá:** a anatomia completa — cabeçalho com nome de arquivo, seletor de linguagem por
aba, numeração de linha, realce de linha, e o botão de copiar com estado "copiado".

**O que entrou:** o botão de copiar **com o estado de confirmação**. A Aurea troca o glifo
(`.c-copy` → `.c-done`), e a leitura confirmou que a confirmação visível é parte do componente, não
enfeite — sem ela ninguém sabe se o clique funcionou.

**O que NÃO entra:** realce de sintaxe, numeração e abas de linguagem. Realce exige um parser, e a
Aurea já tem onde ele mora: o `CodeEditor`, com o CodeMirror. Ter dois caminhos para colorir código
seria duas gramáticas — e o `CodeBlock` é para **mostrar**, não para editar. A `language` aqui vai
para `data-language` e rotula, não colore.

**Licença:** Kibo UI — **MIT**, verificada em 02/08/2026.
**Código copiado:** nenhum.

### `LogStream`

**Medido antes, e a medição achou defeito:** a pele do log é de três colunas (hora | nível | texto)
e o componente emitia **duas**, então o texto caía na coluna do nível, com 72px. E a prop `level`
não pintava nada. Corrigido no item **E13**, com asserção que reprova o defeito reintroduzido.

**Quem tem:** **nenhuma das sete.** É um dos seis do `BUILDING.md` §6.

**O que existe de vizinho, e por que não serve:** terminal e console aparecem em `sandbox` (Kibo) e
em `snippet`, mas os dois são superfícies de **execução**, com entrada — um log é só saída.

**Como foi construído:** `role="log"` com `aria-live="polite"`, que veio de pesquisa registrada
(W3C ARIA23 e a nota do MDN sobre `role="log"`), não de referência. A regra que importa: uma região
de log anuncia o que **chega depois** da montagem, e não relê o que já estava — é o oposto do
`NotificationCenter`, e a razão está escrita nos dois.

**Limitação declarada:** sem referência externa. E o defeito que o E13 achou é o argumento a favor
de registrar isso em vez de fingir cobertura — componente sem referência é componente que só a
medição do próprio repositório protege.

**Licença:** não se aplica — nada foi lido.
**Código copiado:** nenhum.

### `MediaPlayer` e `MediaPlayerShell`

**Medido antes:** headless sobre `<video>`/`<audio>` nativos — o motor é o navegador. Controles são
`<button>` com `aria-label` que troca de estado, e a barra é `<input type="range">` com
`aria-valuetext` por extenso ("4 minutes and 3 seconds", não "243"). O `Shell` é só a superfície.

**Quem tem:** **Media Chrome**, que é uma plataforma inteira (`media-controller.ts` com 40 KB,
`media-container.ts` com 23,7 KB, botões, diálogos, menus). E o **Kibo** — mas
`packages/video-player` dele é um **envelope do Media Chrome**, importando `MediaController`,
`MediaControlBar`, `MediaPlayButton` e os outros. Ou seja: **é a mesma leitura**, e contá-las como
duas seria repetir o erro que a nota de método desta seção mede. As outras cinco não têm.

**O que entrou:** a lista de controles e a ordem deles — reproduzir, voltar 10s, avançar 10s, tempo
decorrido/total, silenciar, volume, legendas, tela cheia. É exatamente a `MediaControlBar` do Media
Chrome, e a convergência aqui é forte porque o Kibo, ao envelopá-lo, escolheu a mesma fila.

**O que NÃO entra, e é a decisão mais consequente desta entrada: atalhos de teclado GLOBAIS.** O
Media Chrome tem `hotkeys`/`nohotkeys` no `media-controller.ts` e um
`media-keyboard-shortcuts-dialog.ts` inteiro para ensiná-los. A Aurea **não** intercepta tecla
nenhuma, e a razão é medida, não preferência: atalho global captura a barra de espaço, e a barra de
espaço é a tecla de rolar a página e de digitar. Que o Media Chrome tenha precisado de um
`nohotkeys` **e** de um diálogo para explicar os atalhos é o argumento a favor de não os ter —
cada controle aqui é focável e opera pelo próprio elemento nativo, então reproduzir, buscar e
mudar volume por teclado saem sem interceptar nada.

**O que a leitura confirmou de um jeito que só ela poderia:** que o Media Chrome também usa
`<input type="range">` real na barra (`media-chrome-range.ts`, 22,7 KB, envelopando o nativo) em
vez de `role="slider"` à mão. É a mesma escolha do `Range` e do `MediaPlayer` daqui, feita
independentemente pelas duas.

**Licenças:** Media Chrome e Kibo UI — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### `MessageComposer`

Lido junto com o `MessageList`, que já tem entrada abaixo por ter sido construído na mesma etapa.

**Medido antes:** é um `<form>` sobre `.input-wrap` + `.input`; `Enter` envia porque o formulário
envia, não porque alguém escutou tecla. Texto vazio ou só espaço nunca envia, e o botão desabilita
enquanto não há o que enviar.

**Quem tem:** **nenhuma das sete tem chat.** Verificado pasta a pasta, incluindo os 43 pacotes do
Kibo e os 157 componentes do MUI.

**Como foi construído:** por composição do que já existe — `input-wrap` do `SearchField`,
`IconButton` para enviar, e o `<form>` nativo para o `Enter`. A decisão registrada no
`communication.tsx` é a de não escutar teclado: `Enter` envia por submit nativo, e multilinha com
`Shift+Enter` fica para quando houver demanda.

**Limitação declarada:** sem referência externa. É o mesmo caso do `SearchField` — o componente
existe porque a composição estava sendo reescrita, e a justificativa é interna.

**Licença:** não se aplica — nada foi lido.
**Código copiado:** nenhum.

### `MessageList`

**Medido antes:** o contêiner **É** a região viva — `role="log"` com `aria-live="polite"` — e cada
mensagem compõe `Avatar` + `.message-bubble` + `Badge` de estado. Transporte e estado são do
consumidor.

**Quem tem:** **nenhuma das sete tem lista de conversa.** Verificado pasta a pasta: nenhuma
ocorrência de `chat` em nenhuma das árvores, e nem o Kibo (43 pacotes) nem o MUI (157 componentes)
têm o componente.

**Como foi construído, e a decisão que importa é de anúncio:** `role="log"` com `aria-live`
explícito veio de pesquisa registrada em 07/2026 (W3C ARIA23 e a nota do MDN sobre `role="log"`),
não de referência. O papel já implica `polite`, e o atributo vai junto por robustez entre leitores
— é o mesmo idioma do `LogStream`.

**E aqui está a diferença que precisa ficar escrita, porque é contraintuitiva:** o `MessageList`
**é** região viva e o painel do `NotificationCenter` **não é**. Uma conversa se lê na ordem em que
chega, então anunciar o que chega é o comportamento certo; um feed de notificações se revisita no
próprio ritmo, e relê-lo inteiro a cada abertura despejaria tudo de uma vez. Dois componentes
parecidos, duas decisões opostas, e as duas estão comentadas no código.

**Limitação declarada:** sem referência externa para a anatomia. O componente é composição do que
já existe aqui, e o que o protege é a medição do próprio repositório.

**Licença:** não se aplica — nada foi lido.
**Código copiado:** nenhum.

### `Topbar`

**Medido antes:** `<header>` com `--radius-card`, altura `--topbar-height` (64px medidos), três
variantes — `floating`, `flush`, `pill` — e a **marca dentro dele**, não na lateral.

**Quem tem:** MUI (`AppBar`) · Untitled UI (dentro de `application/app-navigation`, junto com os
cinco arranjos de lateral) · shadcn **não tem** barra de topo própria · Base UI, Kibo, ReUI e Media
Chrome também não.

> A leitura das mesmas fontes está registrada na entrada **`Sidebar`** (Parte B) e na do
> **`AppShell`** acima. O que se acrescenta aqui é o que é da barra.

**Convergiu nas duas:** a barra é `<header>` — landmark `banner` nativo, sem `role` escrito à mão —
e ela atravessa a largura toda.

**A decisão que diverge das duas, e é identidade:** a **marca mora no topo** (decisão do Victor,
23/07/2026). MUI e Untitled põem a marca na lateral quando há lateral. Por isso o `Topbar` é sempre
renderizado pelo `AppShell` e o que é opcional é o **conteúdo** dele, não a barra.

**O que entrou:** a variante `flush`, que veio da leitura do `AppBar` — o MUI tem `position` e
`elevation`, e o caso real por trás deles é "a barra encosta no conteúdo ou flutua sobre ele". Aqui
isso virou duas variantes nomeadas em vez de dois eixos numéricos, e o `AppShell` precisa saber
qual é porque a lateral se encaixa abaixo dela.

**O que NÃO entra:** `position="sticky"` e `elevation` como props. Sombra é token nesta casa
(`--shadow-*`), e um número de elevação abriria a porta para 24 sombras, que é o que o MUI tem.

**Licenças:** MUI e Untitled UI React — **MIT**, verificadas em 02/08/2026.
**Código copiado:** nenhum.

### O que o item E14 deixa medido sobre o próprio check 21

O item fechou as **40** entradas que faltavam, e o `validate.py` passa. Mas escrever as 40 mediu o
gate, e o resultado precisa ficar aqui em vez de virar surpresa numa sessão futura:

**O check 21 cobra o NOME no arquivo, não uma leitura.** Medido em 07/08/2026: com as 40 escritas,
**53 dos 76** componentes têm entrada com cabeçalho próprio e **23 passam por menção incidental** —
o nome aparece no meio da prosa de outra entrada, e isso basta. Os 23:

`Accordion`, `AureaProvider`, `Breadcrumb`, `Button`, `ButtonGroup`, `Card`, `CodeEditor`,
`CommandPaletteShell`, `DataGrid`, `DataList`, `Drawer`, `EmptyState`, `Icon`, `Popover`,
`Progress`, `QRCode`, `Radio`, `SegmentedControl`, `Timeline`, `Tooltip`, `TreeView` — mais
`MessageList` e `Topbar`, que **eram** meus e estão escritos acima.

É a lição que o repositório já tem registrada em outra forma — *gate de nome não é gate de efeito*
—, aqui aplicada ao gate que cobra referência. Fechar a diferença é escrever mais 21 entradas, e o
custo é conhecido: pela medição do `Dialog`, cerca de **3 a 4 horas**. Não foi feito no E14 porque
o enunciado dele são as 40 que o gate acusava, e ampliar escopo em silêncio é o que o
`BUILDING.md` §3.4 recusa.

**Fica como pergunta aberta para o Victor**, com as duas saídas escritas: apertar o check 21 para
exigir cabeçalho — e então as 21 viram fila —, ou aceitar que os 23 são cobertura por vizinhança
(vários deles *são* citados dentro de leituras de verdade, como `Popover` e `Tooltip` na entrada
do `Dialog`, ou `Breadcrumb` e `TreeView` na do `Sidebar`) e deixar o gate como está.

## Parte F do PLANO-1.0 — `DataGrid`, itens F1 e F2 (08/08/2026)

Sai da lista dos 23 "por menção incidental" do bloco acima: passa a ter entrada própria, porque
foi lido de verdade.

### Passo 1 — o que a medição achou antes de abrir qualquer referência

O `DataGrid` já ordenava, filtrava em geral, paginava e selecionava — **com todo o estado por
dentro**, o que o comentário do arquivo declarava de propósito ("controlar de fora só quando
houver demanda real"). A demanda chegou como F1.

E o motor já resolvia os dois itens. Medido no fonte **instalado**, não na documentação:
`manualSorting` (`RowSorting.ts:535`), `manualFiltering` (`ColumnFiltering.ts:408`) e
`manualPagination` (`RowPagination.ts:376`) **curto-circuitam** o modelo de linha correspondente,
e `RowPagination.ts:61,67` expõem `pageCount`/`rowCount`. Ou seja: F1 e F2 eram **exposição**, não
construção. Escrever máquina de estado nossa ao lado da dele seria o padrão paralelo que o
protocolo recusa.

### Passo 2 — quem TEM este componente, medido pasta a pasta

| Pasta | Tem grade de dados? | O que expõe |
|---|---|---|
| `ui-main` (shadcn/ui) | **exemplo**, não componente | `examples/tasks/data-table.tsx`: quatro `useState` DENTRO do exemplo. O consumidor copia e edita |
| `kibo-main` | sim (`packages/table`) | `TableProvider` + contexto; a ordenação mora num **átomo global (jotai)**, não em prop |
| `react-main` (Untitled UI) | sim | é envelope de **React Aria** (`AriaTable`, `AriaColumnProps`) — apresentação, e segundo motor headless, recusado no Lote 4 |
| `reui-main` | só primitivas | `<table>` com pele, sem motor |
| `material-ui-master` | **não** | o `DataGrid` é do MUI **X**, repositório separado — não está aqui |
| `base-ui-master` · `media-chrome-main` | não | — |

**O achado do passo 2 é uma ausência, e ela mudou o desenho:** **nenhuma das sete expõe API
controlada por prop.** Não havia anatomia para copiar. Por isso os nomes `manualSorting`,
`manualFiltering`, `manualPagination` e `rowCount` são **os do motor** — o consumidor já os lê na
documentação dele, e inventar sinônimo aqui criaria um segundo vocabulário para a mesma coisa.

### Passo 3 — o que serve, e o que não serve

**Entrou:** o par valor + callback em cada eixo (ordenação, filtro, página, seleção), com o modo
interno intacto como default; os quatro sinais de servidor; e `SortingState`/`RowSelectionState`
reexportados do subpath, pelo mesmo motivo que o `ColumnDef` já era — quem controla de fora
precisa tipar, e não deve instalar o motor para isso.

**Não entrou:** a decomposição em peças do Kibo (`TableProvider`, `TableHead`, `TableRow`… são
oito exports) — o `DataGrid` da Aurea é um componente, e quem quer montar peça a peça tem o
`Table`. E o contexto/átomo global: estado global é decisão do consumidor, não da biblioteca.

**Uma decisão de tradução, e ela é deliberada:** `page` é **1-based** na nossa API porque o
`Pagination` que aparece na tela é 1-based; o motor é 0-based. A conversão fica num lugar só,
dentro do componente. Consistência interna da Aurea ganha de espelhar o motor quando as duas
brigam.

### O motor: `8.21.3` hoje, e o `9` acabou de sair — PERGUNTA ABERTA PARA O VICTOR

O comentário do arquivo dizia "v8 porque o v9 ainda é beta (07/2026)". **Essa premissa venceu em
04/08/2026.** Medido no npm em 08/08/2026:

| Versão | Publicada |
|---|---|
| `8.21.3` (a nossa) | 14/04/2025 — **16 meses sem lançamento** |
| `9.0.0` estável | **04/08/2026** — quatro dias atrás |
| `9.1.0` · `9.1.1` | 07/08 e **08/08/2026** — duas correções em quatro dias |

**Recomendação: ficar no `8` nesta parte, e decidir o `9` como item próprio.** Três motivos, e
nenhum é preguiça: a cadência de correção mostra que a `9` ainda está assentando; F1 e F2 **não
precisam** dela, porque o `8` já tem os `manual*` medidos acima; e subir o par significa mudar o
peer `^8.21.3` → `^9`, que é **quebra para todo consumidor** e, pela
[ADR-0014](../decisions/0014-primeira-versao-publica-0-1-0.md), exige nota no changelog e a palavra
do Victor.

**O custo de adiar está declarado:** o `8` não recebe lançamento há 16 meses. Não é abandono — é
sucessão. Enquanto a `9` não entrar, isso é **dívida registrada**, não risco silencioso.

### Item F3 — filtro por coluna e por faceta

**A referência é uma só, e ela existe:** `ui-main/apps/v4/app/(app)/examples/tasks/components/data-table-faceted-filter.tsx`
(147 linhas). Kibo, Untitled, ReUI e MUI **não têm** faceta — medido.

**O que entrou dela, que é anatomia:** a faceta guarda um **array** de valores e vira `undefined`
quando esvazia; a **contagem por opção** vem de `getFacetedUniqueValues()`; e as `options` são
**declaradas**, não derivadas, quando é preciso manter na lista um valor que nenhuma linha tem
agora — a diferença entre "não há nenhum cancelado" e "cancelado não existe".

**O que NÃO entrou, e é a maior parte:** as 147 linhas montam `Popover` + `Command` +
`CommandInput` + `Badge` + `Separator` + um quadradinho de seleção desenhado à mão. Aqui a faceta
é um **`MultiCombobox`**, que já existe: escolher vários valores de uma lista **é** esse
componente, e ele traz teclado, ARIA, portal e pele já gateados. Também ficaram de fora a busca
dentro do popup (a lista de uma faceta é curta) e o ícone por opção.

**E uma diferença de lugar, deliberada:** o shadcn põe os controles numa **barra acima** da
tabela e reescreve o alinhamento à mão. Aqui a linha de filtro é do **próprio cabeçalho**, então
cada controle nasce alinhado com a sua coluna sem uma linha de layout — quem alinha é a tabela.

**Um filterFn de uma linha, e ele é nosso porque o motor não tem:** a faceta compara um valor
**escalar** da célula com o **array** selecionado, e `arrIncludes`/`arrIncludesSome` esperam a
célula array (medido em `filterFns.ts:45,67`). O shadcn obriga o consumidor a escrever isso em
cada coluna; aqui é injetado uma vez.

**O navegador achou o que gate nenhum veria, e a medição matou metade do que eu tinha escrito.**
A pele da linha de filtro nasceu com **seis** declarações. Cada uma foi tirada e remedida, uma a
uma. Três eram reais — sem `text-transform:none` o campo digita em maiúsculas; sem
`vertical-align:top` os dois controles (36px e 40px) começam em linhas diferentes; sem `gap:0` o
rótulo só-para-leitor-de-tela cobra 7px de vão. **Três não faziam nada** e saíram: `height:auto`
(altura em célula é mínimo, e o conteúdo já passa de `--row-h`), `letter-spacing:normal` (o
`.input` não herda o entreletras do cabeçalho) e `line-height:0` no rótulo (o `<label>` vazio já
não ocupa altura). Escrever CSS que "parece necessário" é o mesmo defeito de sempre num traje
novo — e as três só morreram porque cada uma foi medida sozinha.

**Duas medições minhas erraram antes de acertar, e as duas são reincidência registrada:** o
seletor do cabeçalho (`thead tr:first-child th`) casou com a tabela do **`Calendar`**, que também
tem `thead th`, e devolveu recuo 0 — é o `.pagination` do E13 outra vez. E comparar o topo dos
`<input>` acusou 5px de desalinhamento onde havia alinhamento correto: o campo de texto é um
`<input>` nu e a faceta é um `.field` com recheio, então o que se compara é a caixa de
**controle** — também E13, também escrito lá.

### Item F4 — o estado na URL

**Não houve o que ler, e a ausência é o achado.** Medido em 08/08/2026: **nenhuma** das sete
referências persiste estado de tabela na URL. O shadcn guarda em `useState` dentro do exemplo, o
Kibo num átomo global (jotai), o Untitled é apresentação. Onde não há anatomia, o passo 4 do
`BUILDING.md` manda pesquisar em vez de inventar — e o que a pesquisa devolve aqui é uma API de
plataforma, não uma biblioteca: `URLSearchParams`, que já sabe escapar, repetir chave e ler
`getAll()`.

**A decisão que custou pensamento não foi o formato, foi ONDE o código mora.** `gridStateFromParams`
é chamado onde a URL chega, e num framework de componentes de servidor isso é o **servidor**. Se
saísse do subpath do `DataGrid` — que tem `"use client"` — viraria referência de cliente e
quebraria ao ser CHAMADO. É o defeito da Parte A uma terceira vez, e por isso as duas funções
moram no `pure.tsx` e saem pelo barril.

**Um limite declarado, com a saída junto:** `f.estado=feito` sozinho na URL é ambíguo — texto ou
lista de um item? Sem saber, a volta chuta "repetido é lista, sozinho é texto", e uma faceta com
um valor escolhido voltaria como texto e pararia de filtrar. Por isso `gridStateFromParams` aceita
o **mesmo** array `filters` que a grade recebe. A alternativa era sujar o link com `f.estado[]=`,
e o link é o produto deste item.

### Item F5 — a barra de ação em lote

**Duas referências independentes, e elas convergem — que é o sinal de que a anatomia é madura.**
`activepieces-main/packages/web/src/components/custom/data-table/data-table-bulk-actions.tsx` (57
linhas) e `kaneo-main/apps/web/src/components/bulk-selection/bulk-toolbar.tsx` chegam à MESMA
lista: **contagem · divisória · ações · um jeito de limpar**. O shadcn tem só a contagem, e no
rodapé da paginação. Kibo, Untitled, ReUI, MUI e Base UI não têm.

**O que entrou:** a lista acima, mais duas decisões que as duas referências tomam igual — a barra
**não existe** sem seleção (é estado, não decoração), e a ação recebe **um jeito de limpar** junto
com as linhas, porque quase toda ação em lote termina esvaziando a seleção.

**O que NÃO entrou:** `position:fixed` no rodapé da janela, que as duas usam. Isso é decisão da
APLICAÇÃO — um componente que o consumidor põe onde quer não sequestra a viewport nem entra numa
briga de `z-index` que ele não pediu. E a animação por biblioteca de movimento (`motion/react`),
que é dependência nova para um item que não precisa dela.

**E o item entrou com ZERO CSS.** A barra é `Toolbar` + `ToolbarButton` + `ToolbarSeparator` +
`.hint`, todos já existentes: o `.toolbar` do core já é superfície flutuante em pílula com fundo
próprio, e o Base UI já dá o papel `toolbar` e a navegação por setas. Medido no navegador com só o
core: raio **999** (`--radius-control`), fundo próprio, dois botões. A referência desenha essa
mesma barra à mão. **Quando a resposta é "isto já existe aqui", ela ganha da resposta que compila.**

### Itens F6 — cabeçalho fixo, e a causa errada que a medição reprovou

**Referência: nenhuma tem.** Medido — shadcn, Kibo, Untitled, ReUI e MUI core não fixam cabeçalho
de tabela. O item saiu inteiro de medição no navegador.

**A `.table-wrap` tem `overflow:auto`, e é ELA que ancora o sticky — não a janela.** Consequência
que muda o desenho: sem teto de altura a caixa nunca rola por dentro, e o cabeçalho nunca teria de
onde se soltar. O teto é `--datagrid-max-h` (60vh por default), em CSS e não em prop, pelo mesmo
motivo do `--qr-size`: quem sabe quanta tela tem é a página, e altura não vira número na API.

**E aqui eu quase gravei uma causa errada no core.** A primeira medição disse que o cabeçalho
subia junto com o corpo; concluí `border-collapse:collapse` anula sticky em célula, escrevi a regra
`border-collapse:separate` e um comentário convincente explicando por quê. Estava errado: eu media
o topo da **`<tr>`**, e a linha não acompanha a célula grudada. Medindo a **`<th>`**, o sticky
funcionava desde o começo — **com `collapse`**. A regra saiu.

É a terceira vez nesta parte que medir a caixa errada produz um diagnóstico plausível e falso, e as
três estão registradas: o seletor que casou com a tabela do `Calendar`, o topo dos `<input>` de
alturas diferentes, e esta. **Antes de escrever uma causa, tirar a regra e medir de novo.**

### Item F7 — colunas ocultáveis e redimensionáveis

**A referência tem metade.** O shadcn tem seletor de colunas
(`examples/tasks/components/data-table-view-options.tsx`): um `DropdownMenu` com item de
marcação por coluna. **Redimensionar não tem nenhuma das sete** — medido.

**O que entrou:** a ideia de listar as colunas ocultáveis pelo cabeçalho delas, e a de não
oferecer as que não podem sumir (`getCanHide()`, mais a coluna de seleção, que some do menu por
não ser dado).

**O que NÃO entrou:** o `DropdownMenu` com itens de marcação. Aqui o seletor é o **`MultiCombobox`**
— terceira vez nesta parte que "escolher vários de uma lista" já tem componente. Menos código, e o
teclado e o ARIA vêm prontos.

**O que a referência não tinha e a acessibilidade exigiu:** a alça de redimensionar responde às
**setas**. O motor entrega `getResizeHandler()`, que é `mousedown`/`touchstart` — e mais nada.
Coluna que só se ajusta com mouse é funcionalidade que exclui, então a alça é um `<button>` de
verdade e cada toque move 16px, com piso de 40px.

**E uma medição impediu uma mudança de aparência que ninguém pediu.** A primeira versão punha a
busca e o seletor sempre num `Cluster`. Medido no navegador: a busca caía de **900px para 207px**,
porque deixava de ser item de grade e virava item de flex — para quem já usa `filterable` e nunca
pediu seletor de coluna. O `Cluster` passou a entrar **só quando há um segundo controle**, e há
teste de DOM cobrando isso.

### Itens F8, F9, F10 e F11 — o que veio de referência e o que não veio

**F8 (estados) e F10 (exportação) não têm referência nas sete** — medido. Saíram de decisão, e as
duas decisões são de linguagem, não de desenho: o aviso de dado velho é **texto** ("mostrando
dados que podem estar desatualizados"), e o botão de exportar carrega o **escopo** no rótulo. Cor
sozinha não diz nada a quem não a vê; "Exportar" sozinho esconde a pergunta que importa.

**F9 (painel de detalhe):** o que existe nas referências é `Drawer`/`Sheet` — sobreposição modal,
que **cobre a lista**. O item pede o contrário, por escrito: "sem sair da lista". Então o painel é
região ao lado, e o gatilho é um `<button>` por linha e não a `<tr>` clicável que quase todo
exemplo de tabela usa: linha não é foco de teclado, e torná-la alvo exige inventar papel, tabindex
e tecla que o botão já é.

**F11 (virtualização) fechou pela SEGUNDA via — a medição que diz que não precisa.** Comando:
`node scripts/measure-grid.mjs`. Até 1 000 linhas numa página o layout custa 62 ms, e a grade já
pagina e já tem modo servidor desde o F2. Virtualizar quebraria o `renderToStaticMarkup` (linha
virtual só existe depois que o navegador mede), que é o defeito do Recharts no Lote 3 — e ali era
um `<svg>`, aqui seria a tabela inteira. Mais dependência nova. Os números estão no `PLANO-1.0`
§9, e o comando está no repositório para quem duvidar.

**Licença verificada em 08/08/2026:** `@tanstack/react-table` e `@tanstack/table-core` seguem
**MIT** (arquivo `LICENSE` do pacote instalado).

**Código copiado:** nenhum.

## Parte G do PLANO-1.0 — a fila de transferência (08–09/08/2026)

### Passo 2 — quem TEM este componente, medido pasta a pasta

| Pasta | Tem fila de envio? | O que o item dela expõe |
|---|---|---|
| `react-main` (Untitled) | sim, `application/file-upload` | `{name, size, progress, failed, onDelete}` |
| `kibo-main` | `dropzone` | só a zona: `Dropzone`, `DropzoneContent`, `DropzoneEmptyState` |
| `ui-main` · `reui-main` · `base-ui-master` · `material-ui-master` | não | — |

**O achado do passo 2 é que o nosso já era MAIOR.** O item do Untitled não tem cancelar, não tem
repetir, não tem pausa, não tem soma nem conflito nem recibo — e o `FileInput` da Aurea já tinha
cancelar e repetir por item desde a Fase 5. Os seis itens da Parte G saíram de **decisão**, não de
anatomia copiada.

### As quatro decisões que a parte tomou, e o limite de cada uma

**G1 — `File` não volta de um armazenamento.** A fila é dado serializável e volta por
`initialQueue`, mas um item restaurado tem a ficha e **não tem os bytes**. Em vez de esconder isso,
o botão de repetir **some** nesses itens: oferecer um botão que falha é pior que não oferecer.

**G2 — pausar HTTP não é pausar, é abortar.** Então a intenção é marcada antes do `abort()` e lida
no `catch`, porque pausa e cancelamento chegam os dois como `signal.aborted`. O `UploadContext`
ganhou `resumeFrom` — a fração já enviada —, e quem tem transporte resumível de verdade (tus,
Range) continua de lá. A escolha é do consumidor porque o transporte é dele, a mesma fronteira que
já fazia `onProgress` vir de fora.

**G4 — SHA-256 é API de plataforma, não biblioteca.** `crypto.subtle`, zero dependência. Opcional
por dois limites medidos: só existe em contexto seguro, e o digest precisa do arquivo **inteiro**
em memória, porque o Web Crypto não tem hash em fluxo. E *conferir é comparar*: se o `upload`
devolver `{checksum}`, a divergência **reprova o item**.

**G5 — "manter os dois" não renomeia.** Inventar `arquivo (1).txt` seria decidir pelo consumidor
um nome que o servidor dele talvez não aceite. Quem distingue são os ids.

### Três defeitos que os TESTES acharam, e nenhum deles era de referência

1. **Corrida na conferência (G4):** arquivo pequeno com envio rápido termina **antes** de o hash
   sair, e comparar contra `undefined` pulava a conferência **em silêncio** — pior que não
   conferir, porque parece que conferiu. Agora a promessa da soma é guardada e aguardada.
2. **"Substituir" mantinha os dois (G5):** a função que aceitava o conflito lia `files` da closure,
   e o item removido ainda estava lá porque o React não havia re-renderizado. A lista base passou a
   vir por argumento.
3. **Um teste que não detectava nada (G6):** "o recibo só aparece quando a fila termina" passava
   com o defeito reintroduzido, porque com **um** arquivo a lista fica vazia dos dois jeitos. Com
   **dois** — um terminado, outro em voo — ele reprova. Teste que passa por acidente é cobertura de
   mentira.

**Código copiado:** nenhum.

## Parte H do PLANO-1.0 — a camada operacional (09/08/2026)

### `AgentCard`, `AgentStatus` e `AgentInspector` (grupo H.a)

**Passo 1 — a medição do nosso: não existia nada.** Os 16 nomes estavam no contrato
(`componentRules.UniversalDomain`) sem uma linha de código, ficha ou export desde que o contrato
foi escrito.

**Passo 2 — quem TEM, medido pasta a pasta.** As **sete referências antigas não têm** esta família
— foi por isso que a parte ficou bloqueada até 08/08/2026. Das nove novas:

| Pasta | Arquivo | O que deu |
|---|---|---|
| `agents-kit-main` | `components/agents-ui/agent-card.tsx` | o contrato do cartão e os **seis estados** |
| `agents-kit-main` | `components/agents-ui/agent-status-panel.tsx` | o painel de estado |
| `agent-prism-main` | `packages/ui/src/components/DetailsView/` | a anatomia do inspetor: cabeçalho + seções rotuladas |

**Passo 3 — o que entrou.** Os seis estados (`idle`, `thinking`, `running`, `paused`, `error`,
`completed`) são os da referência, medidos e não inventados. E a anatomia do cartão: retrato,
nome, modelo, estado, capacidades, ações.

**O que NÃO entrou, e por quê:**

1. **A cor solta.** A referência escreve `text-yellow-500`, `text-blue-500`, `text-red-500` dentro
   do componente. Aqui cada estado vira **variante do `Status`** que já existe — cor dentro de
   componente é o que a identidade da Aurea proíbe, e o `Status` já resolveu isso uma vez.
2. **O despacho por string.** `onAction: (action: string) => void` troca o compilador por um
   acordo verbal. Aqui as ações entram como nó: quem monta o botão já sabe o que ele faz.
3. **O ícone por estado.** A referência tem um por estado; o `Status` da Aurea já desenha o ponto,
   e um ícone ao lado seria a mesma informação duas vezes. **A primeira versão deste módulo tinha
   esse mapa de ícones e não renderizava nenhum** — código morto nascendo junto com o componente.
   Saiu antes do commit.

**As três peças são COMPOSIÇÃO:** `.card` já dá a superfície flutuante, `.status` já dá o estado,
`.data-list` já dá o par termo/valor. O CSS novo é só arranjo.

**Uma decisão de taxonomia saiu daqui, e está em ADR:** a categoria **"AI & Agents"**
([ADR-0017](../decisions/0017-categoria-ai-agents.md)). A lista de categorias estava travada em 13.

**Licenças:** `agents-kit-main` e `agent-prism-main` foram lidas, não redistribuídas — a pasta
`Referencia/` está no `.gitignore` e `git ls-files Referencia` devolve `0`.

**Código copiado:** nenhum.

### `InvocationPanel` e `TaskQueue` (grupo H.b)

**Passo 2 — quem TEM, medido:**

| Pasta | Arquivo | O que deu |
|---|---|---|
| `agent-elements-main` | `lib/agent-ui/components/tools/tool-row-base.tsx` | a linha de passo dobrável, com rótulo de "rodando" e de "pronto" |
| `agents-kit-main` | `components/agents-ui/agent-task-queue.tsx` | os **seis** estados de tarefa e a prioridade em **três** degraus |
| `activepieces-main` | `packages/web/src/features/agents/agent-timeline` | terceira leitura da linha do tempo de execução |

**O que entrou:** o vocabulário. Seis estados (`queued`, `running`, `completed`, `failed`,
`blocked`, `paused`) e três prioridades — medidos, não escolhidos aqui.

**O que NÃO entrou, e é a maior parte do `AgentTask`:** a referência carrega **15 campos**, e cinco
pertencem a **outros componentes desta mesma parte** — `metrics.tokens` e `metrics.cost` são o
`ModelUsage` (H11) e o `CostMeter` (H12), `checkpoints` é o `TraceTimeline` (H9), `assignee` é o
`AgentCard` (H1). Absorvê-los aqui faria a fila responder por quatro contratos e nenhum deles
direito. **Escopo menor por fronteira, não por preguiça** — e a fronteira estava escrita no plano
antes de eu abrir o arquivo.

**Duas trocas de mecanismo, as duas para o lado da plataforma:**

1. **O passo dobrável é `<details>` nativo**, o mesmo idioma do `Accordion` daqui. A referência usa
   um `Collapsible` de biblioteca para chegar no mesmo lugar; dobrar já é comportamento de
   navegador, com teclado e ARIA.
2. **`running` marca `aria-busy` na região inteira** em vez de animar o rótulo. A referência usa um
   `TextShimmer` — animação em cima do texto —, que um leitor de tela não alcança e que
   `prefers-reduced-motion` teria de desfazer.

**Uma decisão de pele, medida:** o estado do passo entra por **borda lateral**, não por fundo
colorido. Fundo compete com o texto do passo; a borda diz o mesmo sem disputar a leitura. O
`skin.spec` cobra os dois lados — que a borda de "rodando" difira da de "concluído", **e** que o
fundo continue transparente.

**Código copiado:** nenhum.

### `HumanApproval` e `ToolPermission` (grupo H.c)

**Passo 2 — quem TEM, medido:**

| Pasta | Arquivo | O que deu |
|---|---|---|
| `agents-kit-main` | `components/agents-ui/agent-tool-approval.tsx` | o pedido com **risco em três degraus**, parâmetros e razão; o histórico com decisão e ator |
| `agent-elements-main` | `lib/agent-ui/components/tools/tool-approval-footer.tsx` | o par aprovar/negar que, **depois de decidido, vira o resultado** em vez de sumir |
| `activepieces-main` | `packages/web/src/features/agents/agent-tools` | terceira leitura da lista de ferramentas |

**A referência junta as duas coisas num componente só** — o interruptor "always allow" mora dentro
do diálogo de aprovação. **Aqui são dois, e a separação é o ponto:** aprovar é sobre ESTA ação,
permitir é sobre TODAS as próximas. Misturá-las é exatamente como se concede permissão permanente
sem perceber, no meio de uma decisão pontual.

**O que entrou:** o risco em três degraus, os parâmetros como dado (não como prosa), e a regra de
que a decisão **substitui** os botões em vez de esvaziar a tela — sumir apaga o rastro do que a
pessoa escolheu.

**Duas decisões de ordem e de forma, as duas cobradas no `skin.spec`:**

1. **Negar vem ANTES de aprovar**, na leitura e na tabulação. A ação destrutiva não deve ser a
   primeira a receber foco nem a mais fácil de acertar sem ler.
2. **O escopo da ferramenta fica ao lado do nome, em monoespaçada.** "ler" e "ler /etc" são
   permissões diferentes, e conceder a segunda achando que é a primeira é o defeito que este
   componente existe para impedir.

**A escolha de três vias é o `SegmentedControl`** — que é o `radiogroup` do Base UI desde a
[ADR-0016](../decisions/0016-segmented-control-e-radiogroup.md). Escrever três botões alternáveis aqui
repetiria à mão o padrão que aquela ADR rejeitou por escrito.

### O check 29 nasceu deste grupo, de um defeito MEU

Escrevi `font-family:var(--font-mono)` em dois lugares — no `.file-checksum` do item **G4** e no
`.tool-permission-scope` daqui. **Esse token não existe**; o do sistema é `--font-code`. As duas
regras caíam caladas na fonte de texto, e **nenhum gate via**: o check 11 confere os tokens que a
FICHA declara, não os que o CSS usa.

Quem achou foi uma asserção de pele, por acidente — eu comparava a fonte do escopo e o valor não
batia. A pergunta do protocolo, feita depois: **quem mais tem esse problema?** A primeira medição
disse **120 tokens órfãos** e estava errada, com o erro de sempre: eu media contra o `src` do core,
e os tokens moram no pacote `tokens`, que só aparece no `dist`. Com o corpus certo são **5**, e os
cinco são legítimos — três são válvulas de escape com fallback, duas o Base UI escreve em tempo de
execução.

Daí saiu a regra do **check 29**: `var(--x)` **sem fallback** tem de existir. Com fallback a
ausência é deliberada. Provado contra o defeito: reintroduzir `--font-mono` reprova nomeando o
token.

**Código copiado:** nenhum.

### `EventStream`, `TraceTimeline` e `HealthMatrix` (grupo H.d)

**Passo 2 — quem TEM, medido:**

| Pasta | Arquivo | O que deu |
|---|---|---|
| `openstatus-main` | `packages/ui/src/components/blocks/status-feed.tsx` | o feed de eventos com agrupamento por data |
| `openstatus-main` | `blocks/status-component-group.tsx` | a grade de saúde e o vocabulário de cinco estados |
| `agent-prism-main` | `packages/ui/src/components/SpanCard/SpanCardTimeline.tsx` | a barra posicionada dentro de uma janela `minStart`/`maxEnd` |

**Passo 1 — e ele importou mais que o passo 2 aqui, porque DOIS destes três parecem coisas que já
existem.** A resposta em cada caso:

1. **`EventStream` não é o `LogStream`, e a diferença é de PAPEL.** `role="log"` é para saída de
   texto que se acumula; um evento tem estrutura — título, hora, gravidade — e por isso é
   `role="feed"`, o padrão APG de lista de artigos que a pessoa percorre.
2. **`TraceTimeline` não é o `Timeline`.** Aquele é uma coluna de MOMENTOS (ponto, título, hora);
   este é uma cascata de DURAÇÕES, onde a posição e a largura da barra **são** o dado. A
   matemática é a da referência: deslocamento `(start-min)/(max-min)`, largura `(end-start)/(max-min)`.
3. **`HealthMatrix` é grade, e não lista.** Uma coluna de serviços não deixa comparar; a grade sim.

**O que NÃO entrou, e é a decisão maior deste grupo:** as **onze cores por categoria de span** do
`agent-prism` (`llm_call`, `tool_execution`, `retrieval`, `embedding`, `guardrail`…). Cor por
categoria numa paleta travada é ilegível para quem não separa as cores, e é o mesmo defeito que o
grupo H.a já tinha recusado no `AgentStatus`. Aqui `kind` entra como **texto**.

**Duas decisões de comportamento, as duas com o custo escrito:**

1. **"Seguir o fim" é opt-in.** Sem ele, quem está lendo o topo perde o que chega; **com** ele e
   sem controle, quem está lendo o meio é arrastado para baixo. O segundo é pior, então o default
   é não seguir.
2. **A barra do rastro é `meter`, não `progressbar`.** Ela representa uma medida dentro de uma
   faixa conhecida, não o progresso de uma tarefa — e `aria-valuetext` carrega a duração em número,
   porque largura sozinha não é lida por ninguém.

**Uma medição de coerência que o `skin.spec` passou a cobrar:** o ponto do evento mede **igual** ao
ponto do `Status`. Dois indicadores de gravidade com tamanhos diferentes na mesma tela leem como
coisas diferentes, e não são.

**Código copiado:** nenhum.

### `ModelUsage`, `CostMeter` e `MemoryLedger` (grupo H.e)

**Passo 2 — quem TEM, medido:**

| Pasta | Arquivo | O que deu |
|---|---|---|
| `langfuse-main` | `web/src/features/dashboard/components/ModelUsageChart.tsx` | a métrica total no topo e a quebra por modelo; as **quatro** abas de dimensão |
| `langfuse-main` | `.../ModelCostTable.tsx` | as colunas modelo × tokens × custo, número à direita, e o `orderBy` decrescente |
| `langfuse-main` | `.../TotalMetric.tsx` | número grande + descrição. **28 linhas** — é arranjo, não componente |
| `langfuse-main` | `.../cards/BarListChartArea.tsx` | a lista de barras horizontais com rótulo de valor |
| `langfuse-main` | `web/src/utils/numbers.ts` | `costFormatter` = `Intl.NumberFormat("en-US")` com locale **pregado** |
| `agent-prism-main` | `packages/ui/src/components/{TokensBadge,PriceBadge}.tsx` | o par de unidades da família: contagem e preço (**14 e 27 linhas** — os dois são um `Badge`) |
| `agents-kit-main` | `components/agents-ui/agent-status-panel.tsx` | a tarifa por 1k tokens, entrada e saída separadas, e o `contextLength` como teto |

**Licenças verificadas hoje, lendo o arquivo:** `langfuse-main` é **MIT Expat exceto `ee/`,
`web/src/ee/` e `worker/src/ee/`** — os cinco arquivos usados estão **fora** de `ee/`.
`agent-prism-main` é **MIT**. E uma correção: **`agents-kit-main` é `Non-Commercial License`**
(Copyright 2025 Abhishek Gahlot), **não MIT** — o `BUILDING.md` §1 dizia que só havia AGPL e
MIT-exceto-`ee/` entre as de 08/08. Corrigido lá. Não muda a regra, pelo motivo que aquela
seção já dá: a pasta está no `.gitignore`, nada é redistribuído e **nenhuma linha literal
entra**. Muda o registro, que estava incompleto — e a Aurea é Apache-2.0, então a diferença
merece estar escrita.

**Passo 1 — e a pergunta que decidiu o grupo: `ModelUsage` e `CostMeter` são o mesmo
componente?** Na referência quase são: o `ModelUsageChart` e o `ModelCostTable` mostram os dois
`modelo × tokens × custo`. Separam-se por **PAPEL**, como o `EventStream` do `LogStream` no grupo
anterior:

- **`ModelUsage` é fatia de uma SOMA.** O teto é o próprio total, e a pergunta é *qual modelo
  levou quanto*. Sem orçamento nenhum envolvido.
- **`CostMeter` é fração de um TETO que vem de fora.** A pergunta é *quanto ainda cabe*.

Trocar um pelo outro mostra orçamento onde não existe orçamento. Os dois são `role="meter"` — os
dois são medida em faixa conhecida —, e é só isso que têm em comum.

**Passo 4 (pesquisa, porque a referência não tinha) — duas pesquisas, as duas registradas:**

1. **O teto do `CostMeter` não existe em nenhuma das nove pastas.** Medido: `grep -rliE "budget"`
   em `langfuse-main/web/src/` não devolve nenhuma tela de orçamento — o langfuse OSS mostra
   custo, não limite. Pesquisado em **09/08/2026**: o padrão de mercado de controle de custo de
   LLM é o **LiteLLM**, com orçamento em vários níveis (organização, time, projeto, chave,
   usuário) e **dois limiares distintos — o rígido, que bloqueia, e o brando, que só avisa**. É
   daí que vêm `limit` e `softLimit`, e é por isso que são dois campos e não um.
2. **`MemoryLedger` continua sem referência aberta, e foi reconfirmado.** O ADE do Letta só abre
   o servidor; o OpenMemory do mem0 está sendo descontinuado; o painel do mem0 é só na nuvem.
   O que a pesquisa de **09/08/2026** deu de utilizável foi **vocabulário**: as três espécies de
   memória — **episódica, semântica, procedural** — viraram padrão entre fornecedores em 2026.
   Os três níveis do Letta (`core`/`recall`/`archival`) ficaram **de fora**: são a arquitetura de
   um produto só, e travá-los aqui amarraria o contrato a um fornecedor.

**O que NÃO entrou, e por quê:**

- **As quatro abas do `ModelUsageChart`.** Existem porque são quatro CONSULTAS no produto dela;
  aqui os dados chegam prontos e a dimensão é a prop `metric`. Oito peças da referência viraram
  uma.
- **A série temporal e o seletor de modelos em popover.** A série é o `Chart`, que já existe;
  embutir um segundo gráfico aqui duplicaria aquele contrato.
- **A tarifa por 1k tokens com entrada e saída separadas** (do `agents-kit`). Medida, e deixada
  de fora: é preço de tabela do modelo, não consumo — pertence à ficha do modelo, não ao painel
  de uso. Entra por `segments` no `CostMeter` quem quiser quebrar o valor.
- **O `DataGrid` dentro do `MemoryLedger`.** O plano previa envolvê-lo; a medição diz que não dá.
  `data-grid.tsx` mora em subpath próprio porque carrega `@tanstack/react-table` como peer
  OPCIONAL (check 19), e `agents.tsx` sai pelo barril leve — importá-lo faria quem instala a
  biblioteca pelo `Button` passar a precisar da tabela. **A fronteira do pacote vence o plano.**
  Ordenar e filtrar o razão se compõe na aplicação.

**Uma decisão de formatação que a referência quase induziu ao erro.** O `costFormatter` do
langfuse é `usdFormatter(x, 2, 2)` — duas casas fixas. Com ele, um gasto real de **US$ 0,004**
imprime **`$0.00`**: o número some justamente no componente que existe para vigiá-lo. Aqui, valor
abaixo de um centavo abre até seis casas. O que **entrou** da referência é o outro lado da mesma
função: **locale pregado**, que é o que mantém a saída determinística entre a máquina e a CI.

**Duas decisões de acessibilidade, com o custo escrito:**

1. **`aria-valuenow` do `CostMeter` fica grampeado no teto**, porque valor fora da faixa é
   inválido em ARIA. O gasto verdadeiro — que pode ter estourado — vai em `aria-valuetext`.
2. **Livro-razão é APENDE-SÓ.** `forgotten` não tira a linha, risca. Sumir com a linha apaga
   exatamente o que se procura quando o agente para de saber uma coisa — e o risco não é a única
   marca, o selo ao lado diz a palavra.

**Um número inventado que foi recusado:** derivar `softLimit` em 80% de `limit`. 80% não veio de
medição nenhuma, e alerta que dispara sozinho num limiar que ninguém configurou é ruído com
aparência de política. Sem `softLimit`, não há estado de aviso.

**E uma cor que a medição matou.** A primeira versão pintava a barra em três degraus — normal,
aviso, estouro. O `skin.spec` reprovou no tema **escuro**, e o motivo estava no token:
`--warning-400` **é** `var(--brand-yellow)` no escuro, o **mesmo valor** de `--primary` (no claro
é `#6d4d00`, aí sim distinto). A barra de aviso saía **idêntica** à normal — degrau invisível em
metade dos temas. Perguntado *quem mais tem esse problema*: os outros seis usos de
`--warning-400` no core são **texto** ou **mistura de borda** (`.badge-warning`,
`.status-warning`, `.log-level.warn`, `.alert-warning`), e o único outro **preenchimento** é o
`.event-dot`, cujo vizinho é `--muted-foreground`. A colisão era só desta peça. A saída não foi
trocar de token: foi tirar a cor do limite **brando**, que passa a falar por **palavra** no
`Alert` — o mesmo critério dos cinco estados do `HealthMatrix` —, e guardar a cor para o limite
**rígido**, onde o vermelho separa nos dois temas. O `skin.spec` mede as duas metades: a barra
**não** muda em `near`, e o alerta **existe** lá e não existe abaixo do teto.

**E quatro defeitos que este grupo achou nos GRUPOS ANTERIORES**, os quatro corrigidos na raiz e
com gate no mesmo commit. Ficam aqui porque a lição é do método, não do componente:

1. **Os 13 de "AI & Agents" não tinham página no catálogo.** A categoria entrou no `validate.py`
   e não no `CAT_ORDER` do `build-catalog.mjs`, que era a única fonte das páginas. Gate: o
   gerador morre se uma categoria de ficha não tiver lugar na ordem.
2. **As 13 entradas de starter usavam `preview:`, chave que o gerador nunca leu** — quem desenha
   é `render`, e é função. As páginas saíam com o texto de fallback. Gate: chave fora do
   vocabulário mata o build.
3. **Com a prévia renderizando, a varredura achou três defeitos de a11y** que a caixa vazia
   escondia: `salto h1 → h3` no `AgentInspector` e no `InvocationPanel`, e
   `aria-required-children` no `EventStream`. Raiz comum: **componente não sabe a que
   profundidade da página está, e não pode fixar nível de título.** Os rótulos viraram `group`
   nomeado; o `feed` passou a ser do grupo. O peso do `<h3>` foi para token, e o gate de pixel
   confirmou **zero** mudança nas 44 baselines.
4. **As barras do `ModelUsage` e do `TraceTimeline` colapsavam a 0px** num painel estreito —
   `minmax(6rem,14rem) 1fr` dá ao rótulo tudo e à barra a sobra, e não havia sobra. O mínimo
   passou para o lado da BARRA. A asserção que devia ter pego isso passava com **1px contra
   0px**; foi reescrita para medir a razão dentro de uma caixa de 260px.

**Código copiado:** nenhum.

### `InterAgentMessage` e `AutomationCard` (grupo H.f, parte 1 de 2)

O `DependencyGraph` (H14) ficou de fora **desta entrada de propósito** — ele depende de uma
decisão de motor que a medição reabriu, e está registrada no fim.

**Passo 2 — quem TEM, medido:**

| Pasta | Arquivo | O que deu |
|---|---|---|
| `agents-kit-main` | `components/agents-ui/agent-orchestrator.tsx` | o `CommLogEntry` — `{id, timestamp, from, to, message}` —, que **é** o contrato do H15 |
| `agents-kit-main` | `components/agents-ui/agent-routing-hub.tsx` | a RAZÃO do encaminhamento (intenção, confiança, texto do porquê) e **as seis cores por intenção** |
| `langfuse-main` | `web/src/features/automations/AutomationSidebar.tsx` | a linha da regra: nome, `trigger.status` ativo/inativo, `trigger.eventSource`, `action.type` |
| `langfuse-main` | `.../automations/AutomationDetails.tsx` | a mesma anatomia aberta, mais a aba de execuções |

**Licenças conferidas hoje:** `agents-kit-main` é **Non-Commercial License** (o registro completo
está na entrada do H.e e no `BUILDING.md` §1). O `langfuse-main` é MIT Expat exceto `ee/`,
`web/src/ee/` e `worker/src/ee/` — e `web/src/features/automations/` está **fora** de `ee/`,
conferido no caminho.

**Passo 1 — a pergunta de sempre, e ela decidiu os dois:**

- **`InterAgentMessage` não é o `MessageList`.** Aquele é conversa com uma PESSOA (autor, corpo,
  hora, recibo de leitura). Aqui a **direção é o dado**: há um remetente e um destinatário, e é a
  passagem entre os dois que se lê. Um `MessageList` com dois autores não diz quem entregou o quê
  a quem.
- **`AutomationCard` não é o `AgentCard` nem a `TaskQueue`.** Aquele é identidade, aquela é
  trabalho enfileirado. Uma automação é **regra** — uma condição e uma consequência —, e é o par
  QUANDO/ENTÃO que a define. Ele entra em `DataList`, o par termo/valor da casa, pela mesma razão
  do `HumanApproval`: quem lê precisa achar a condição sem varrer um parágrafo.

**O que NÃO entrou, e por quê:**

- **As seis cores por intenção do `agent-routing-hub`** (`technical` ciano, `billing` âmbar,
  `sales` ardósia, `pricing`, `general`, `default`). **Terceira vez que a Parte H recusa a mesma
  coisa** — depois das onze de span no H.d e das seis de estado no H.a. `kind` entra como palavra,
  num selo.
- **O histórico de execuções do `AutomationDetails`.** Na referência é uma aba com tabela dentro
  do mesmo componente. Aqui já existem `DataGrid` e `EventStream`; absorvê-lo faria o cartão
  responder por dois contratos — o erro que a `TaskQueue` recusou no H.b.
- **O interruptor escrito à mão.** O `Switch` já é `role="switch"` sobre caixa de seleção nativa;
  um segundo aqui duplicaria teclado e estado.

**Uma decisão de acessibilidade que só apareceu ao escrever:** a seta entre remetente e
destinatário é um `Icon`, e **todo `Icon` da Aurea é `aria-hidden` por construção** (medido no
`system.tsx`). Sem mais nada, um leitor de tela ouviria "Curator Writer" — dois nomes lado a
lado, e a direção, que é o componente inteiro, sumiria no espaço entre eles. O par virou `group`
**nomeado** com a relação por extenso, o mesmo idioma que o `AgentInspector` passou a usar no H.e.

**E um controle que não entra:** sem `onToggle` o `AutomationCard` **não** desenha interruptor.
Controle que não faz nada é pior que controle nenhum — ele promete uma ação que não existe.

**Código copiado:** nenhum.

### `DependencyGraph` (H14) — a decisão de motor, e como ela fechou

**A dúvida que eu levantei estava certa em fazer, e a resposta desfez.** O registro de como ela
apareceu está logo abaixo, e fica: é o que impede que a mesma pergunta seja refeita do zero.

**O que decidiu foi o ALVO, e quem o nomeou foi o Victor:** *"minha dúvida é se a gente tentar
usar a Aurea fazendo algo como um n8n vamos conseguir?"*. Grafo de **leitura** não precisa de
motor — HTML posicionado basta, e é o que o langfuse faz. **Editor** precisa, e aí a conta é
outra. Medido em 09/08/2026:

| Quem | O que usa | Como se sabe |
|---|---|---|
| **Activepieces** (concorrente direta do n8n) | `@xyflow/react` **12.3.5** | está no `packages/web/package.json` da `Referencia/activepieces-main` |
| **n8n** | **Vue Flow** (o irmão Vue, mesma equipe xyflow) | o `Canvas.vue` do `editor-ui` envolve o Vue Flow |

Ou seja: **o padrão de mercado para "fazer um n8n" é o xyflow.** A autorização do Victor estava
certa; a minha ressalva valia para o outro alvo.

**Saúde e segurança, conferidas antes de instalar:** `@xyflow/react` **12.11.2**, **MIT**,
publicado há ~1 mês, mantido em tempo integral pela equipe do xyflow, peer `react >=17`.
**Zero** avisos no GitHub Advisory Database para `xyflow`. Traz `@xyflow/system`, `classcat` e
`zustand@4` — e só para quem instalar o peer opcional.

**E a instalação achou uma dívida que não era dele:** `pnpm audit` acusou `nanoid <3.3.17`
(GHSA-2v37-7h3g-55p8, **alto**). `pnpm why nanoid` mostrou os dois caminhos, e **nenhum** passa
pelo xyflow: os dois são `postcss`, um por `vite` e outro por `next`. Pré-existente, corrigido
com `override` no `pnpm-workspace.yaml`, no mesmo padrão do `undici`.

**O que entrou do motor, e o que nunca:** ele publica duas folhas. `style.css` é a identidade
deles — `--xy-node-border-radius-default: 3px`, `#1a192b`, sombras, nó branco — e **não entra**.
`base.css` é estrutura, com todo valor visível atrás de `var(--xy-algo, …-default)`, então a
pele da Aurea assume por **variável**: nenhuma classe `.react-flow__*` aparece no nosso core, o
que também evita plantar no check 15 uma classe que componente nenhum daqui produz.

**Escopo menor que o do motor (passo 5):** sem minimapa, sem painéis, sem nó redimensionável,
sem seleção por retângulo — e **sem `<Controls/>`**, porque os botões dele só ganham cor no
`style.css`. Zoom e deslocamento continuam no mouse e no teclado do motor.

**O layout é NOSSO, e é a peça que o motor não tem.** O React Flow recebe `x`/`y` prontos; sem
layout, um grafo sem coordenadas empilha tudo em (0,0). São camadas por caminho mais longo, com
corte de ciclo — grafo de dependência com ciclo é defeito do dado, mas travar o navegador por
causa dele seria defeito nosso. **Teto declarado:** não minimiza cruzamento de arestas. O
caminho de subida é o `elkjs`, que é o que o langfuse usa, e ele é dependência nova.

**A quarta recusa da mesma coisa:** o `GraphNode.tsx` do langfuse pinta **dez** tipos de nó em
dez cores (`AGENT` roxo, `TOOL` laranja, `GENERATION` magenta…). Depois das onze de span no H.d,
das seis de estado no H.a e das seis de intenção no H.f. `kind` sai como texto em caixa alta.

**E o que se PEGOU da mesma referência**, que é o oposto: *"Real-HTML accessibility (the win over
the old canvas renderer)"*. Nó desenhado em canvas não existe para o teclado nem para o leitor de
tela. Aqui ele é `<button>` de verdade quando dá para selecionar, com `aria-pressed`.

**E o defeito que SÓ o navegador achou — o mais caro deste grupo.** A primeira versão passava
`nodes` ao motor e **nenhum `onNodesChange`**. O motor aceita calado; o resultado é um grafo
**invisível**. Ele só tira o `visibility:hidden` de um nó depois de gravar a medida dele de volta
na lista, e sem o retorno não há onde gravar. Medido num navegador de verdade: os cinco nós saíam
`visibility: hidden`, com **zero** aresta e o `fitView` parado em `scale(1)`. **Nenhum teste de
jsdom pega isso**, porque lá não há layout para medir — e foi por isso que este item ganhou um
andaime de vite descartável só para ser visto uma vez. A lista interna preserva `measured` quando
os dados de fora mudam; sem isso, trocar a seleção jogaria a medida fora e o grafo piscaria a
cada clique.

**A prévia do catálogo EXISTE, e a primeira versão desta entrada dizia que não podia existir.**
Eu escrevi que grafo mede o DOM e portanto não cabe em HTML estático. Era conclusão, não
medição — o Victor olhou a página, viu uma caixa vazia e perguntou "cadê?". O motor tem caminho
de SSR **documentado**, e são três coisas por nó (`initialWidth`, `initialHeight` e um array
`handles` explícito) mais o viewport inicial no provider. Com elas, `renderToStaticMarkup`
devolve os nós, as arestas e um `fitView` já calculado.

**E o caminho até lá achou mais três, todos medidos no navegador:**

1. **Com `nodes` controlado, a loja do motor só é semeada num efeito** — e efeito não roda no
   servidor. O `ReactFlowProvider` precisa de `initialNodes`/`initialEdges` para o primeiro
   render; o `nodes` controlado continua mandando depois.
2. **A tela media 71px.** O painel de demo é `flex`, e uma caixa de largura automática entra
   como item que encolhe — a mesma armadilha que o `Chart` já tinha achado em 01/08/2026. A
   correção é do componente, não do exemplo: `.dependency-graph { inline-size:100% }`.
3. **A ORDEM DE CAMADA, que é a mais importante e quase passou batido.** O core da Aurea mora em
   `@layer aurea`, e no CSS **quem está fora de camada vence quem está dentro — especificidade
   nem entra na conta**. O `base.css` do motor, importado solto, sobrepunha o nosso core: o link
   de atribuição ficava com o `color:#999` cravado dele e reprovava contraste no axe **mesmo com
   a nossa regra sendo mais específica**. A saída é declarar `@layer motor, aurea;` e importar o
   motor em `layer(motor)`. Isso vale para **todo consumidor** e está escrito na ficha.

**Um limite que fica:** o `fitView` do servidor é calculado sobre a extensão do layout, e o
servidor não sabe a largura do painel — que muda com a janela. Em aplicação de verdade quem
resolve é o `fitView` do motor, no navegador. No catálogo, que é estático, o enquadramento virou
**aritmética de viewport no `catalog.js`**, junto das abas e do tema — chrome do catálogo, não da
biblioteca. E ele nunca AMPLIA: grafo de dois nós esticado até encher a caixa vira caricatura.

**Código copiado:** nenhum.

### Como a dúvida do motor apareceu — o registro original

O Victor autorizou o **React Flow** em 09/08/2026. A pesquisa e a medição feitas **depois** da
autorização trouxeram três fatos que ele ainda não tinha quando disse sim, e por isso ficam aqui:

1. **`@xyflow/react` está saudável.** Versão **12.11.2**, publicada há ~1 mês, **MIT**, mantida em
   tempo integral pela equipe do xyflow, com peer `react >=17` (serve o React 19 daqui).
   **Zero avisos** no GitHub Advisory Database para `xyflow`, conferido hoje. Dependências de
   runtime: `@xyflow/system`, `classcat` e `zustand@^4` — este último só chega a quem instalar o
   peer opcional.
2. **A folha de estilo dele se divide em duas, e só uma pode entrar.** `style.css` é a identidade
   deles — `--xy-node-border-radius-default: 3px`, `#1a192b`, sombras, nó branco — e é
   exatamente o que o `BUILDING.md` proíbe extrair. `base.css` é estrutura (posição, `z-index`,
   `transform-origin`, `pointer-events`) com **todo** valor atrás de `var(--xy-*, …-default)`, ou
   seja: sobrescritível por token, no idioma que o `--qr-size` e o `--datagrid-max-h` já usam.
   O consumidor importaria `@xyflow/react/dist/base.css`, como já importa o `@aurea-uds/core/css`.
3. **E o fato que muda a conversa: a referência mais próxima do nosso domínio NÃO usa React
   Flow.** O `trace-graph-view/` do langfuse — que é literalmente um grafo de agentes,
   ferramentas e chamadas — desenha `<div>` posicionados em absoluto, com o layout calculado por
   **ELK**. O `GraphNode.tsx` declara o motivo: *"Real-HTML accessibility (the win over the old
   canvas renderer)"* — nó é `role="button"`, focalizável, anunciado com tipo e rótulo.
   **E o React Flow não faz layout**: ele recebe `x`/`y` prontos. Adotá-lo, sozinho, não entrega
   um grafo de dependências — entrega uma tela com pan e zoom, e deixa o posicionamento aberto.

**O que isto abre, e está com o Victor:** se o grafo é de LEITURA (quem depende de quem), o
React Flow paga por pan/zoom e não resolve o layout; se ele é de EDIÇÃO, paga por tudo. E o
`GraphNode` traz, de brinde, a **quarta** recusa da mesma coisa: **dez cores por tipo de nó**
(`AGENT` roxo, `TOOL` laranja, `GENERATION` magenta…), que não entram de qualquer jeito.

## Parte I — as composições

Um bloco não é componente: não entra em `built-components.json` e o check 21 não o alcança. O
registro fica aqui mesmo assim, porque o que se mede numa referência é fato sobre **ela**, e
some se não for escrito. O motivo de desenho fica no código, ao lado da linha que ele explica.

### `ReviewCompare` (item I2, 10/08/2026)

Licenças verificadas na data: **Langfuse MIT Expat** (`web/src/components/DiffViewer.tsx` está
fora de `ee/`, `web/src/ee/` e `worker/src/ee/`, que são a exceção) · **Kibo UI MIT**.

**O que foi olhado:** `langfuse-main/web/src/components/DiffViewer.tsx` e o
`PromptVersionDiffDialog.tsx` que o hospeda; `kibo-main/apps/docs/examples/code-block-diff.tsx`.

**O que entrou:** a anatomia do cabeçalho de comparação do Langfuse — *o que* está sendo
comparado e *entre quais versões*, acima da diferença ("Changes v3 → v4" + nome do sujeito). É
a região `source` do contrato, e é a única das cinco que uma referência entregou pronta.

**O que NÃO entrou, e é o achado desta leitura:** **as duas marcam a diferença SÓ POR COR.** O
`DiffViewer` pinta a linha inteira (`bg-green-500/30` de um lado, `bg-destructive/60` do outro) e
não escreve nada; o exemplo do Kibo marca a linha com um comentário `// [!code ++]` que o Shiki
**consome** e converte em fundo colorido. Nos dois, quem não distingue as cores não distingue o
que entrou do que saiu — WCAG 1.4.1.

Isso reprova a cláusula que o **próprio contrato da Aurea** exige do padrão: *"diff has textual
additions and deletions"*. Não é preferência nossa contra desenho alheio; é uma exigência escrita
em `aurea.contract.json` que nenhuma das duas cumpre. A saída custou zero: o marcador é o `+`/`-`
da primeira coluna do diff unificado, que é texto por construção e não pede uma linha de CSS.

**O que nenhuma das duas tem:** decisão, resultado de teste e recibo. O `PromptVersionDiffDialog`
é diálogo de LEITURA, com um botão "Close" — não há aprovar, aplicar nem reverter. As três
regiões restantes do contrato (`decision`, `test_result`, `receipt`) nasceram de composição sobre
o que a Aurea já tinha, sem anatomia externa.

**Onde procurei e não achou:** os serviços de diff do Activepieces
(`packages/server/api/src/app/ee/projects/project-release/project-state/diff/`) são de servidor —
calculam a diferença, não a apresentam — e estão sob a **exceção EE** da licença dele.

### `ResourceWorkbench` (item I3, 10/08/2026)

Licenças verificadas na data: **Kibo UI MIT** · **Untitled UI React MIT** (tier gratuito).

**O que foi olhado:** `kibo-main/packages/tree/index.tsx` e
`react-main/components/application/file-upload/file-upload-base.tsx`.

**O que a leitura confirmou, e é a razão de o item ser barato:** as duas regiões caras já estavam
construídas aqui. O `tree` do Kibo se decompõe em **nove peças** (`TreeProvider`, `TreeView`,
`TreeNode`, `TreeNodeTrigger`, `TreeLines`, `TreeNodeContent`, `TreeExpander`, `TreeIcon`,
`TreeLabel`); o nosso `TreeView` é **uma**, com `items`. O passo 5 do `BUILDING.md` já tinha sido
aplicado quando ele foi feito, e nada novo se extrai.

**O que entrou do Untitled UI:** a anatomia do **item de fila** — nome, tamanho, progresso e ação
por item na mesma linha (`FileListItemProgressBar`). É o que o nosso `FileInput` já entrega desde
a Parte G, e a leitura serviu para confirmar que a nossa linha não estava faltando nada.

**O que NÃO entrou:** as duas variantes de item do Untitled (`ProgressBar` com barra separada e
`ProgressFill` com o preenchimento atrás da linha). São duas aparências para o mesmo estado, e um
sistema com duas é um sistema sem decisão. E o `motion/react` que o Kibo usa nos nós da árvore.

**Um nome igual que NÃO é o mesmo componente**, e vale o registro porque quase entrou na leitura
do item anterior: `kibo-main/packages/comparison` **não é diff** — é um deslizador de comparação
de IMAGEM, com alça arrastável e `motion`. É o caso que o passo 2 do `BUILDING.md` nomeia: nome
igual não é componente igual. A leitura de diff do I2 continua sendo Langfuse e o exemplo do Kibo.

### `AnalyticsWorkbench` (item I4, 10/08/2026)

**Nenhuma referência externa foi lida, e isso é decisão registrada, não esquecimento.** As oito
regiões deste padrão são todas peças que a Aurea já tem construídas e já registradas aqui —
`Chart` (Lote 3), `DataGrid` (Fase 9 e Parte F), `KPI`, `SegmentedControl`, `Select`, `Button`,
`Alert`, `Status`. O passo 2 do `BUILDING.md` manda consultar a referência **do componente da
vez**; aqui não há componente da vez. O que houve foi **medição**, e é ela que está registrada
no [`PLANO-1.0.md`](PLANO-1.0.md) §12.

**Duas medições vale repetir aqui, porque são fatos sobre FERRAMENTA e valem para o próximo:**

1. **O Base UI não renderiza o painel inativo de `Tabs` no HTML estático.** Medido com
   `renderToStaticMarkup`: o conteúdo do painel selecionado aparece, o do outro **não existe**.
   Quem for tentar resolver "gráfico ou tabela" com abas num contexto estático vai publicar uma
   alternativa que não está lá.
2. **O Recharts 3 monta por efeito, e um guarda que procura `<svg` não distingue o gráfico de
   um ícone.** Terceira vez neste repositório (Lote 3, `DependencyGraph` em 09/08, e aqui). A
   prova precisa ser específica do desenho — `recharts-area`, não `<svg`.

### `TransactionFlow` (item I5, 11/08/2026)

**A primeira busca deste item ESTAVA ERRADA, e o erro precisa ficar aqui antes do resultado.**
Procurei por **nome de pasta** — `checkout|payment|invoice|billing|transaction|cart` — e conclui
que havia **uma** referência de anatomia em dezesseis. O Victor perguntou se eu estava usando as
referências, refiz a busca **por conteúdo** (`grep` por `subtotal`, `idempotenc`, e por nome de
arquivo com `receipt|order-summary|refund|price|amount`) e apareceu o que a peneira grossa deixou
passar. O passo 2 do `BUILDING.md` avisa que *nome igual não é componente igual*; aqui foi o
inverso — **nome diferente É o mesmo componente**, e a busca por diretório não vê isso.

**A lição de método:** busca de referência é `grep` de CONTEÚDO, não `find` de diretório. Pasta
tem o nome que o autor escolheu; o conteúdo tem as palavras do domínio.

**O que existe, medido depois de refazer:**

| Onde | O que é | Serve? |
|---|---|---|
| `material-ui-master/docs/data/material/getting-started/templates/checkout` | template de checkout em 3 passos, com `Info`, `Review`, `PaymentForm` | **sim** — ordem das etapas, total sempre visível, revisão como passo |
| **`tool-ui-main/apps/www/components/tool-ui/order-summary`** | **296 linhas + esquema Zod de 108: itens, quantidade, preços, variante `summary`\|`receipt`** | **sim, e é a melhor das duas** — foi a que a primeira busca perdeu |
| `activepieces-main/packages/web/src/features/billing/components/price-summary.tsx` | 16 linhas: rótulo, valor em destaque, nota | pouco — recebe o valor já formatado como string |
| `langfuse-main/web/src/features/payment-banner` | banner de cobrança em atraso | não — é aviso, não é fluxo |
| `react-main/components/foundations/payment-icons` | ícones de bandeira de cartão | não — é aparência, e aparência não se extrai |
| `activepieces-main/packages/pieces/community/{checkout,cashfree-payments,…}` | integrações de API | não — não tem UI |
| `kaneo-main/apps/api/src/billing` | rotas de cobrança | não — é servidor |
| `reui-main/components/blocks` | `cta`, `faq`, `hero`, `pricing` | não — é marketing |

Ou seja: **duas** de dezesseis, e não uma. Ainda é pouco — a Parte H tinha três ou quatro por
item —, então o passo 4 continua valendo e a pesquisa registrada segue abaixo.

#### O que o `order-summary` do tool-ui deu — e ele corrigiu duas coisas já escritas

**Convergência com o que a composição já fazia, e é confirmação independente:** o breakdown é um
`<dl>` com `dt`/`dd` (o nosso `DataList` é o mesmo elemento); a formatação é `Intl.NumberFormat`
com `style:"currency"`; subtotal, taxa e total moram na **mesma** lista.

**E a confirmação que mais vale:** o esquema Zod deles tem `variant: "summary" | "receipt"` com
duas regras cruzadas — `receipt` **exige** `choice` (a decisão registrada) e `summary` **proíbe**
`choice`. É exatamente a divisão que eu havia medido no nosso contrato: *antes do commit existe
revisão, depois do commit existe recibo, e as duas não coexistem*. Cheguei nela pelas regiões do
`aurea.contract.json`; a referência a impõe por validação de tipo.

**Uma correção que a leitura obrigou, e uma que ela quase fez eu introduzir:**

1. **`tabular-nums` — copiado, MEDIDO e REJEITADO, e a rejeição é o registro que vale.** O
   `order-summary` põe `tabular-nums` em cada `dd`. Eu levei para a composição e ia pedir ao Victor
   a correção de raiz em `.data-list dd`, porque o core **já usa** a propriedade em cinco lugares
   (`.chart-tooltip b`, `.calendar td button`, `.file-size`, `.metric-total strong`,
   `.model-usage-value`). O Victor perguntou se era a melhor opção para um produto de extrema
   qualidade, e a medição respondeu **não** — larguras dos dez dígitos, no navegador, 11/08/2026:

   | Fonte | `normal` | `tabular-nums` | |
   |---|---:|---:|---|
   | **IBM Plex Sans** | 1 largura | 1 largura | **no-op** |
   | **Segoe UI** (1º fallback) | 1 | 1 | **no-op** |
   | `sans-serif` genérico | 2 | 1 | ajudaria — só no **terceiro** fallback |
   | **IBM Plex Serif** | 2 | **2** | a fonte **não tem** o recurso |
   | Georgia | 9 | 9 | idem |

   Na pilha que a Aurea carrega, a propriedade **não muda um pixel**. Regra que existe e não faz
   nada é o que o `skin.spec` foi construído para reprovar — eu ia pedir autorização para violar a
   trava da própria casa. **Saiu do bloco e não entrou no core.** As cinco que já existem valem
   como seguro se as duas primeiras fontes falharem, não como alinhamento visível; e o
   `.data-list dd` não precisa de nada.

   **E o defeito que eu tinha visto na imagem nunca era este:** o degrau de 74px entre os valores
   era o `max-content` de duas `.data-list` independentes, já resolvido pelas duas faixas. Levar
   `font-variant-numeric` da referência era **tipografia** — a primeira coisa que o `BUILDING.md`
   §1 lista entre as que **nunca** se extraem. A referência dá anatomia; a tipografia é nossa.

2. **Quantidade e unitário separados, total da linha derivado** — esta ficou, e é anatomia. Eles calculam
   `lineTotal = unitPrice × quantity` e põem a quantidade na descrição. A primeira versão daqui
   escrevia `Professional plan · 2 seats` com `USD 48.00` ao lado — e quem lê não sabe se 48 é o
   assento ou os dois. Agora o rótulo mostra `2 × USD 24.00`, o valor é o total da linha, e o
   teste cobra `cents === qty * unit`.

**O que NÃO entrou, e por quê:** `discount`/`discountLabel` e `shipping` com `"Free"` (o contrato
do `TransactionFlow` não tem nenhum dos dois — escopo menor que a referência, passo 5); a imagem
do item com fallback de ícone de pacote (aparência); os ícones `CheckCircle`/`Package` (idem); e o
`formatCurrency` com `try/catch` que devolve `` `${currency} ${amount.toFixed(2)}` `` no erro —
`toFixed` em `number` é a aritmética de ponto flutuante que a nossa decisão de centavo inteiro
existe para evitar.

**O que o `checkout` do MUI deu, e é anatomia de verdade:** a ordem em que as coisas aparecem
(itens → endereço → método → revisão → confirmação), o total **sempre visível** ao lado do
formulário e não no fim (`Info` fica na coluna fixa), e a revisão como passo próprio antes do
"Place order". As três convergem com as regiões do nosso contrato e nenhuma precisou de código.

**Dois defeitos MEDIDOS na referência, e os dois viraram trava do nosso lado:**

1. **O total está escrito à mão em quatro lugares.** `Info.tsx` lista quatro preços literais
   (`$15.00`, `Free`, `$69.99`, `$49.99`); `Review.tsx` escreve `$134.98`, `$9.99` e `$144.97`;
   e `Checkout.tsx` escreve o total uma quarta vez, com um ternário —
   `totalPrice={activeStep >= 2 ? '$144.97' : '$134.98'}`. Conferido: **os números batem hoje**
   (15 + 69,99 + 49,99 = 134,98; + 9,99 = 144,97). Mudar o preço de um item faz o total mentir em
   dois arquivos, e nenhum teste veria. É o achado **I1** desta auditoria com dinheiro em cima —
   por isso o nosso total é `SUBTOTAL + soma(TAXAS)` e o teste compara o DOM contra a conta.
2. **O `PaymentForm` pede número de cartão, CVV, validade e nome no próprio formulário**, com um
   *"Remember credit card details for next time"*. É exatamente a parte que **não entra**: sob o
   PCI DSS 4.0.1 esses campos são do provedor. O nosso `payment` é uma REFERÊNCIA (`Visa ending
   4242` · `Payment provider · pm_3e81`), e o teste reprova qualquer `input` na composição.

**E o que a referência NÃO tem, em nenhuma das dezesseis:** recibo imutável (a confirmação do MUI
é uma frase com o número do pedido e um botão), chave de idempotência, estorno, contestação. Três
das quatro cláusulas de comportamento do nosso contrato não tinham onde ser lidas.

#### A pesquisa que substituiu a referência ausente (passo 4)

**1. Representação do valor — inteiro em unidade menor.** `Decimal` do TC39 está em **stage 1** e
`Amount` em **stage 2**: em 08/2026 não existe decimal nativo em JavaScript. Centavo inteiro
segue sendo a representação correta; a soma acontece em inteiro e a divisão por 100 só na
formatação. ([tc39/proposal-decimal](https://github.com/tc39/proposal-decimal),
[tc39/proposal-amount](https://github.com/tc39/proposal-amount))

**2. Formatação — `Intl.NumberFormat` com `currencyDisplay:"code"`.** A cláusula do contrato é
*"amount **currency** fees and consequences appear before commit"*, e `$` é ambíguo entre quatro
moedas. Com o código a moeda aparece em cada linha, sem uma linha extra dizendo qual é. **Limite
medido:** o formatador separa código e número por espaço **não-quebrável** (U+00A0) — está certo,
os dois não devem cair em linhas diferentes, mas o `getByText` do testing-library normaliza o
texto do DOM e não o do matcher. O teste troca o NBSP; o número continua vindo da mesma função
que a tela usa.

**3. Idempotência — o cabeçalho `Idempotency-Key`.** É prática de mercado (Stripe et al.) e está
em **rascunho** no IETF: `draft-ietf-httpapi-idempotency-key-header-07`, standards track,
atualizado em 15/10/2025 e **ainda não publicado como RFC**. O nome no nosso recibo é o dele,
para o consumidor não inventar um terceiro.
([datatracker](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/))

**4. Segurança — PCI DSS 4.0.1, vigente desde 04/2025.** O que tira a página do comerciante do
escopo é o campo ser do provedor (iframe ou redirecionamento); com iframe ainda vale o requisito
**11.6.1**, e o **6.4.3** cobra inventário e integridade de todo script que carrega na página de
pagamento. A regra já estava escrita em `patterns/commerce_finance.md` desde a Fase 5 — o que a
pesquisa acrescentou foi **verificar que ela segue valendo**, e agora ela tem gate.
([PCI SSC SAQ A](https://listings.pcisecuritystandards.org/documents/PCI-DSS-v4-0-SAQ-A.pdf),
[Schellman](https://www.schellman.com/blog/pci-compliance/important-pci-dss-v4.0.1-update-for-e-commerce-merchants))

#### Um achado de conteúdo, fora do escopo do item

`patterns/commerce_finance.md` descreve o `TransactionFlow` com `.flow-panel`, `.flow-summary` e
`.flow-total`. Medido em 11/08/2026: **as três não existem no core** — `grep` em
`packages/core/src/aurea.css` devolve zero. A receita descreve uma pele que nunca foi construída.
Não é defeito de gate (o check 15 pega o contrário: classe no core que ninguém produz), e a
composição do I5 não usa nenhuma delas — usa `.data-list`, que existe. **Fica registrado como
tarefa**, porque quem ler a receita vai procurar uma classe que não está lá.

### `DeviceControl` (item I6, 11/08/2026)

**Busca feita por CONTEÚDO desta vez** — a lição que o I5 pagou. Termos: nome de arquivo com
`telemetr|calibrat|firmware|device|sensor`, e conteúdo com `acknowledge`, `isLive|autoRefresh`.

| Onde | O que é | Serve? |
|---|---|---|
| `openstatus-main/apps/dashboard/.../incidents/dialog-confirm.tsx` | confirmação controlada de `acknowledge`/`resolve`, que **fica aberta no erro** para a ação poder ser repetida | **sim** — anatomia de portão |
| `openstatus-main/.../incidents/{columns,data-table-row-actions,incident-action-cell}.tsx` | reconhecer alarme a partir de uma lista | **sim** — o `acknowledge` mora com o alarme |
| `agents-kit-main/components/agents-ui/agent-ops-monitor.tsx` | monitor de operação com incidentes | já registrado no H.d |
| `activepieces-main/.../platform/infra/health/index.tsx` | `autoRefresh` de painel ao vivo | pouco — é atualização de página, não fluxo de sensor |
| `*/telemetry*.ts` (Activepieces, Langfuse, AgentPrism) | telemetria de PRODUTO e OpenTelemetry | **não** — medido: nenhuma é leitura de equipamento |

**Nenhuma das dezesseis tem UI de sensor.** `telemetry` nelas é analytics de produto ou tracing de
LLM. Então, como no I5, o que faltou virou **pesquisa registrada**:

**A palavra "confidence" do contrato tem vocabulário no domínio, e não é "confidence".** O padrão
industrial é o do **OPC UA / OPC DA**: a qualidade de um valor é **Good · Uncertain · Bad**, com
códigos para casos exatos — `UncertainLastUsableValue` ("o que atualizava isto parou de atualizar")
e `UncertainSensorNotAccurate` ("o valor está num limite do sensor"). *Bad* significa que o valor
**não pode** ser usado; *Uncertain*, que é questionável mas ainda utilizável. Inventar "high
confidence" criaria um terceiro vocabulário num domínio que já tem um, e a distinção
Bad × Uncertain é a que decide se o operador pode agir sobre o número.
([OPC 10000-8, Data Access](https://reference.opcfoundation.org/Core/Part8/v104/docs/6.3),
[Cognite status codes](https://docs.cognite.com/dev/concepts/reference/status_codes))

Consequência no código: pausado ou fora do ar, a leitura mantém o último valor utilizável, a hora
**congela** e a qualidade cai para `Uncertain · last usable` — nunca `Good`. Há teste para isso nos
oito estados, e ele reprova o número congelado anunciado como bom.

**Do `dialog-confirm` do OpenStatus entrou a anatomia do portão** — tipo de confirmação nomeado,
escopo e ação de volta —, e ela mapeou no `HumanApproval` que a Parte H já tinha. **O que não
entrou:** o `toast.promise` (a Aurea não tem toast de promessa e o `Alert`/`role=alert` cobre o
anúncio), a dependência de `sonner`, e o padrão de manter o portão aberto no erro — que é
comportamento de rede, não de composição, e o preview é estático.

**Um reuso que a leitura confirmou:** o `EventStream` da Parte H já tinha resolvido a metade
difícil de "live telemetry can be paused" — o comentário dele diz que `follow` é prop e não default
justamente porque arrastar quem está lendo o meio é pior que perder o fim. A composição não usa o
`EventStream` (telemetria é valor com unidade, não linha de log), mas o controle de pausa segue a
mesma decisão: **existe nos dois sentidos e diz em qual está.**

### `MediaLibrary` (item I7, 11/08/2026)

**A referência estava declarada desde 02/08 e é a certa:** `media-chrome-main`, que o
[`BUILDING.md`](BUILDING.md) §1 registra como "anatomia de player e de biblioteca de mídia". Lida
por conteúdo — `chapter`, `track`, `playlist`, `caption`, `library` — em 11/08/2026.

| O que | Onde | O que deu |
|---|---|---|
| fila declarativa | `examples/vanilla/media-elements/media-playlist.html` | `<media-playlist>` com `<media-playlist-item type src>` **dentro** do `media-controller`, e `previous()`/`next()` chamados de FORA. A fila é irmã do player e a seleção é uma só — que é a cláusula *"library queue playback and item detail share one selection"* |
| capítulos | `examples/vanilla/vtt/elephantsdream/chapters.vtt` + `src/js/media-preview-chapter-display.ts` | capítulo é dado (`kind="chapters"` em WebVTT), com tempo e rótulo — convergente com a nossa região `chapters` |
| faixa e legenda | `src/js/menu/media-audio-track-menu.ts`, `media-captions-menu.ts` | eles resolvem em MENU; nós declaramos em TEXTO. Registrado abaixo, porque é divergência deliberada |
| atalhos de teclado | `src/js/media-keyboard-shortcuts-dialog.ts` | eles têm; o nosso `MediaPlayer` **deliberadamente não** tem atalho global (decisão de 07/2026, no `media.tsx`) — cada controle é focável e opera pelo próprio elemento |

**E a referência explicou uma regra do NOSSO core que eu ia contornar às cegas.** O exemplo da
playlist declara, com comentário: `/** add styles to prevent CLS (Cumulative Layout Shift) */` —
`aspect-ratio: 16/9` no container, *"set container aspect ratio if preload=none"*. É a razão de
existir do `aspect-ratio:16/9` em `.media-player`: sem ele, o player sem `preload` mede zero até a
mídia chegar e a página SALTA. Consequência para a válvula que o Victor autorizou neste item:
**`--media-ar: auto` só é seguro acompanhado de `--media-h`**, porque a altura passa a ser
determinada por outra via. Isso agora está escrito no core, ao lado da declaração.

**A divergência do menu, e por que ela fica:** o contrato pede que legenda, transcrição e descrição
de áudio sejam *discoverable*. Um menu esconde a lista atrás de um clique; a região `tracks` em
texto diz o que existe sem interação nenhuma. Para uma composição de catálogo — que é HTML estático
— o menu do Base UI nem renderiza o painel fechado (medido no I4, com abas). Escolher o menu aqui
publicaria uma capacidade que não está no DOM.

**O que NÃO entrou:** os web components (`media-playlist` é elemento customizado de terceiro, e a
Aurea envelopa `<video>`/`<audio>` nativos desde a Fase 5); o `hls-video-element` e o CDN do
exemplo; e o `media-gesture-receiver` — gesto sem equivalente de teclado é o que o `BUILDING.md` §5
manda deixar de fora, e é a mesma razão pela qual o `ScrubArea` do Base UI ficou fora do
`NumberField` no Lote 1.

**Uma medição do nosso lado que decidiu a galeria:** `.card-interactive` no core tem
`cursor:pointer` e `:hover` e **nenhuma regra de foco** — porque é um `<div>`, e `<div>` não recebe
Tab. A cláusula *"gallery selection works by keyboard"* exige elemento focável, então os crachás da
galeria são `<button type="button">` com a pele que já existe, e o selecionado leva `aria-current`
como o item ativo da `Sidebar`. **Isto é um limite conhecido do pattern "Selectable tile"** publicado
no catálogo: ele mostra um `Card` interativo que, do jeito que está publicado, não é alcançável por
teclado. Fica registrado aqui; corrigir é decisão de outro item, porque `Card` é componente público.

### `VisualBuilder` (item I8, 11/08/2026)

**A referência é a que a Aurea já usa, e ela estava registrada:** `xyflow-main` (React Flow), que
entrou na Parte H para o `DependencyGraph` (H14) — com layout em camadas escrito aqui, porque o
motor recebe `x`/`y` prontos. O `canvas` desta composição é aquele componente, no subpath `./graph`
com peer opcional.

**Duas medições do NOSSO lado decidiram o item, e nenhuma veio de referência externa:**

1. **O `prerender` que o registro do I4 previu NÃO foi necessário.** O I4 escreveu "o I8 vai
   precisar do mesmo", porque o gráfico do Recharts monta por efeito. Medido em 11/08: o starter do
   `DependencyGraph` no catálogo **não declara `prerender`** e sai desenhado, porque o H14 resolveu
   o SSR do motor (`initialWidth`/`initialHeight`/`handles` mais o viewport no provider). Previsão
   escrita num registro é hipótese, não medição — e esta ficou vencida em um dia.
2. **`height` é PROP do `DependencyGraph`**, então este item não precisou de válvula no core — ao
   contrário do `MediaPlayer` no I7. A diferença é de API, não de sorte: quem construiu o grafo
   expôs a altura; quem construiu o player deixou no CSS.

**O que o React Flow NÃO resolve, e a composição tem de resolver:** *"connect and move actions have
non-drag alternatives"*. O motor entrega arrastar — `onNodeMove` só existe por arrasto, e conectar é
puxar de um `handle` a outro. Sem teclado, um construtor visual exclui quem não usa mouse (WCAG
2.1.1). A saída é a que o contrato já pedia na região seguinte: **o `outline` é a alternativa**, e
mover é um par de botões nomeados por nó (`Move Webhook down`), conectar é um `Select` de destinos
no inspector, e acrescentar é botão na paleta. Nenhum dos três é novidade de desenho — são as peças
que a Aurea já tem, postas onde o teclado chega.

**Uma regra que veio do I5 e vale para segredo:** *"credentials are referenced never exposed"* é a
mesma cláusula do cartão, com outro nome. O que aparece é `secret ref · vault/smtp#current` — o
nome da referência e onde ela mora. **Máscara não conta:** `••••••••` é valor com fita adesiva e
continua no DOM, ao alcance de qualquer extensão. O teste reprova as duas coisas.

## Parte M do PLANO-1.0 — `ConfirmDialog` (M5)

**O que a medição do nosso achou primeiro (passo 1).** O `Dialog` existe e tem `footer` livre —
então "confirmação" parecia já resolvida por composição. Não estava, e o defeito é de
comportamento: `Dialog` fecha ao clicar fora, e num "isto apaga" clicar fora vira **cancelei**
sem ninguém ter decidido. Medido no `d.ts` do motor instalado, e é aí que a diferença fica óbvia:
`@base-ui/react@1.6.0` define `AlertDialogRootProps` como `Omit<DialogRoot.Props, 'modal' |
'disablePointerDismissal' | 'onOpenChange' | 'actionsRef' | 'handle'>`. As duas props que
permitiriam fechar por fora **não existem** no AlertDialog. Não é configuração: é outro papel.

| Referência | Tem? | O que se leu |
|---|---|---|
| `base-ui-master` | **sim** | `packages/react/src/alert-dialog` — e o `index.parts` mostra que só `Root` e `Trigger` são próprios; Backdrop, Popup, Title, Description e Close são **os mesmos do Dialog**. Confirma que a diferença é de papel, não de pele |
| `kibo-main` | **sim** | `packages/patterns/alert-dialog` com **seis** famílias: `confirmation`, `destructive`, `custom-actions`, `form`, `informational`, `success` |
| `ui-main` (shadcn) | **sim** | `registry/new-york-v4/ui/alert-dialog.tsx`, a composição de nove peças |
| `kaneo-main` | **sim** | dois consumos reais do mesmo padrão, em `apps/site` e `apps/web` |

**O que CONVERGE nas quatro, e por isso entrou:** título que é a pergunta; descrição que diz o
que se perde; dois botões; cancelar **antes** de agir na ordem visual; e a variante destrutiva
pintando só o botão de ação.

**O que UMA só tem e entrou assim mesmo:** nada. O que entrou fora das quatro veio da medição do
teclado, não da leitura — ver abaixo.

**O que NÃO entrou, e por quê:**
- As seis famílias do Kibo. `form` dentro de um alert dialog é `Dialog` com outro nome — o alerta
  existe para uma decisão binária. `success` e `informational` são `Alert` e `Toast`, que já
  existem. Ficaram `confirmation` e `destructive`, que aqui são uma prop booleana.
- A composição de nove peças do shadcn. Passo 5 do `BUILDING.md`, e o precedente é o próprio
  `Dialog` da Parte E: num diálogo cujo corpo é uma frase e dois botões, compor não acrescenta
  escolha nenhuma. São oito props.
- O `Trigger`. A Aurea controla abertura por `open`, como `Dialog` e `Drawer`.

**O que NENHUMA das quatro faz, e nós fazemos: mover o foco para o botão seguro.** As quatro
põem cancelar antes na ordem visual e deixam o foco onde o motor o largar. Quem abre um "isto
apaga" e aperta Enter por reflexo apaga. `initialFocus` aponta para o Cancelar. Isso saiu de
medir o teclado, não de ler — é o passo 4 do `BUILDING.md` aplicado ao contrário: apareceu "algo
a mais", e ele foi medido antes de entrar.

**Licenças verificadas em 13/08/2026:** `base-ui-master` MIT · `ui-main` MIT · `kibo-main` MIT ·
`kaneo-main` MIT. Nenhuma linha literal entrou — nem CSS, nem marcação: o `ConfirmDialog` reusa
`.dialog` e acrescenta duas regras (`.dialog-confirm` de largura e rodapé).

## Parte M do PLANO-1.0 — `AccessGate` (M4)

**Este é o registro de uma referência que NÃO estava na pasta — e do método que quase errou por
causa disso.**

Passo 2 do `BUILDING.md`, feito: procurei pasta com nome de permissão, gate, can ou rbac nas cinco
referências locais. **Zero em todas.** Eu li isso como veredito e fechei o item como "não é
componente". O Victor corrigiu no mesmo dia: *"não existir referência na pasta não quer dizer que
não é pra criar, deve buscar na internet"*. E o **§Passo 4 deste mesmo documento já mandava**
pesquisar quando aparece algo que a medição e as referências não cobrem. A pasta é um dado, não a
resposta.

**A pesquisa (13/08/2026), e o que cada fonte deu:**

| Fonte | O que é | O que se extraiu |
|---|---|---|
| [`@casl/react`](https://casl.js.org/v4/en/package/casl-react/) | a biblioteca de autorização mais usada em React | o componente declarativo `<Can I="read" a="Post">`, e a decisão de que ele **só esconde** — o nó sai do DOM |
| [react-admin — Authorization](https://marmelab.com/react-admin/Permissions.html) | framework de painel administrativo | `useCanAccess`/`usePermissions`, e a diferença que virou o desenho: aqui se **escolhe** esconder ou desabilitar |
| [Guia de RBAC em painel Next.js (01/2026)](https://eastondev.com/blog/en/posts/dev/20260107-nextjs-rbac-admin-guide/) | prática corrente de 2026 | o formato `<AccessGate resource=… mode="any">`, e a regra de que a verificação no cliente é **UX**, não segurança — quem barra é a API |
| [Frontend RBAC com `rbac-ui`](https://medium.com/@aviralj02/frontend-rbac-in-react-managing-ui-permissions-with-rbac-ui-11435f1e185d) | leitura de terceiro | confirma o mesmo embrulho para botão, aba, painel e seção |

**O que CONVERGE e entrou:** o portão recebe a resposta pronta e embrulha um filho; esconder é o
padrão; a verificação no cliente não é segurança.

**O que UMA só tem e entrou:** a **escolha** entre esconder e desabilitar, do react-admin. É o
valor inteiro do componente — sem ela, `{pode ? … : …}` faria o mesmo.

**O que NÃO entrou:** regras, papéis, políticas, `resource`/`action` como string, modo `any`/`all`.
Tudo isso é motor de autorização, e a Aurea não tem nem vai ter — `allowed` é booleano resolvido
fora. Passo 5: escopo menor que o da referência.

**O que nenhuma fonte faz, e nós fazemos:** tornar o `reason` **obrigatório pelo tipo** no modo
`disable`, e usar `aria-disabled` em vez de `disabled` — medido no M4, porque `disabled` tira o
controle da ordem de foco e o motivo morre para quem usa teclado.

**Licenças:** `@casl/react` MIT; react-admin MIT. Nada foi copiado — as fontes deram **anatomia e
vocabulário**, e a implementação são 8 linhas nossas sobre `Tooltip` e `cloneElement`.

## Parte M do PLANO-1.0 — `DataState` (M3)

**Passo 1, o nosso primeiro.** As peças já existiam todas — `Skeleton`, `Alert`, `EmptyState` — e
o eixo `UniversalState` fechou na Parte J. O que não existia era o **ligador**, e o `DataGrid` já
tinha resolvido isso para si com `state`/`stateMessage`. Ou seja: a decisão difícil já estava
tomada dentro de casa, para um componente só.

**Passo 2, as cinco locais: zero.** E desta vez a ausência foi tratada como dado, não veredito —
é a lição do M4. Elas não têm porque nenhuma é dona do dado: são bibliotecas de componente, e
carregar/falhar/vazio é do app.

**A pesquisa (13/08/2026):**

| Fonte | O que deu |
|---|---|
| [Casamento de padrão sobre o status do TanStack Query](https://gabrielpichot.fr/blog/simplify-tanstack-react-query-state-handling-with-pattern-matching/) | a LISTA de casos como uma coisa só, e o argumento de que espalhar `if` por tela é o que faz divergir |
| [`react-query-handler`](https://github.com/yuskraft/react-query-handler) | o formato "componentes opcionais de loading, error e empty" — confirma que `empty` é caso à parte, e não um `data.length===0` esquecido |
| [Suspense + ErrorBoundary](https://tanstack.com/query/v4/docs/framework/react/reference/QueryErrorResetBoundary) | o caminho alternativo, em que carregar é do Suspense e falhar é do boundary. **Não seguido**, e o motivo está abaixo |
| [MDN — `aria-busy`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy) e [regiões live](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) | a parte que TODAS as fontes de mercado deixaram de fora: marcar a região como ocupada enquanto carrega, para a tecnologia assistiva esperar em vez de anunciar meia atualização |

**O que NÃO entrou, e por quê:**
- **Suspense/ErrorBoundary.** Exige que o consumidor jogue promessa e erro para cima, e amarra a
  biblioteca a um jeito de buscar dado. A Aurea não sabe de onde o dado vem — recebe o estado já
  resolvido, como o `AccessGate` recebe `allowed`.
- **Qualquer coisa com `query` no nome ou na API.** É o vocabulário de uma biblioteca específica.
- **Retentar, invalidar, refazer.** Motor de dados. Fora.

**O que nenhuma fonte faz, e nós fazemos:** separar os estados **terminais** (carregando, erro,
vazio — que substituem o conteúdo) dos **universais** (`stale`, `partial`, `degraded`, `offline`,
`waiting_*` — que o acompanham). Isso não é invenção nova: é a regra que o `DataGrid` pagou para
aprender, promovida a componente. E o `aria-busy`, que a pesquisa mostrou faltar no mercado.

**Licenças:** TanStack Query MIT; `react-query-handler` MIT; MDN CC-BY-SA (texto lido, nada
copiado). Nenhuma linha entrou — as fontes deram a lista de casos e o vocabulário.

## Parte M do PLANO-1.0 — `Form` (M1)

**A pergunta era de dependência, e a resposta veio do motor que já se paga.**

Pesquisa (13/08/2026): o padrão de mercado para formulário em React é
[`react-hook-form`](https://react-hook-form.com) com [`zod`](https://zod.dev) via
`@hookform/resolvers`, e é literalmente o que o `Referencia/ui-main` embrulha em
`registry/new-york-v4/ui/form.tsx`. O `Referencia/kibo-main` tem `patterns/form` com o mesmo
desenho.

**Por que NÃO entrou:** embrulhar `react-hook-form` obrigaria **todo** projeto que consome a Aurea
a adotá-lo — inclusive os que já validam de outro jeito. E dependência nova interrompe o lote e
exige o Victor (`BUILDING.md` §3.3).

**E não foi preciso.** Medido no `@base-ui/react@1.6.0`, que é o motor declarado desde a Fase 2:
o `Form` dele já tem a prop `errors`, e o próprio tipo a descreve como *"validation errors returned
externally, typically after submission by a server or a form action"*. A divisão que eu ia propor —
a Aurea desenha, o consumidor decide — **já é a do motor**. Somam-se `Field.Root` (com `name`),
`Field.Control`, `Field.Error`, `Field.Description` e `Field.Validity`, e `validationMode` com
`onSubmit`/`onBlur`/`onChange`.

| Fonte | Tem? | O que se leu, e o que entrou |
|---|---|---|
| `base-ui-master` + o pacote instalado | **sim** | a divisão erro-externo/exibição, e o par `name` → `errors`. **É o que foi usado** |
| `ui-main` (shadcn) | **sim** | confirma o padrão de mercado e o custo dele: `form.tsx` só existe para casar com o `react-hook-form` |
| `kibo-main` | **sim** | `patterns/form`, mesma composição |
| `material-ui-master` | parcial | não tem `Form`; tem o catálogo de estados de campo, que a Aurea já cobria |

**O que NÃO entrou, e por quê:** schema, resolver, estado de campo, `register`, arrays de campo.
Tudo isso é motor de validação — a Aurea recebe o resultado, como o `AccessGate` recebe `allowed`
e o `DataState` recebe o estado.

**O defeito que a medição achou no caminho, e que nenhuma referência avisaria:** passar
`aria-invalid: undefined` explícito no clone do filho **vence a mesclagem** do motor. O campo saía
com `data-invalid` (vermelho na tela) e **sem** `aria-invalid` — válido para o leitor de tela. Pior
que não mostrar erro nenhum. As chaves de aria agora só entram quando têm valor.

**Licenças:** Base UI MIT; shadcn/ui MIT; Kibo MIT; react-hook-form MIT (lido, não instalado).

## Parte M do PLANO-1.0 — `CommandPalette` (M6)

**Passo 1, o nosso primeiro:** existia o `CommandPaletteShell` — casca sem motor, com o filtro por
conta do consumidor. O par casca/completo já tem precedente aqui: `MediaPlayerShell` e
`MediaPlayer`. Foi o desenho seguido, e por isso a casca **não mudou**.

**Pesquisa (13/08/2026):** o padrão de mercado é o [`cmdk`](https://github.com/pacocoursey/cmdk),
que é o que o `Referencia/ui-main` embrulha em `registry/.../command.tsx` e o
`Referencia/kibo-main` repete em `patterns/command`.

**Por que NÃO entrou:** o `@base-ui/react` — motor que a Aurea já paga desde a Fase 2 — tem
`autocomplete`, e medido no `index.parts.d.ts` dele o `Input`, o `List`, o `Popup`, o `Empty`, o
`Group` e o `Collection` **são literalmente os mesmos módulos do `combobox`** que o `Combobox` e o
`MultiCombobox` daqui já usam. Trazer o `cmdk` seria pagar por um segundo motor de lista filtrável
tendo um instalado, e obrigar todo consumidor a baixá-lo.

**Decisão de comportamento que veio da leitura:** `mode="list"`, que é o default do motor —
`inline` e `both` completam o texto digitado, e num campo de COMANDO isso é hostil: a pessoa digita
"del" e o campo vira "delete project" sozinho.

**O LIMITE, medido e declarado:** a v1 **não agrupa**. O `Autocomplete.Root` não consome a
estrutura agrupada como o `Combobox.Root` consome, e o caminho alternativo — dar a cada `Group` a
sua fatia de itens — **passa por cima do filtro**: digitar "the" devolvia os três comandos. Entre
agrupar e filtrar, filtrar é o ponto de uma paleta. Fica registrado como limite, não como
esquecimento, e o teste trava a escolha: lista plana, filtro funcionando.

**Licenças:** Base UI MIT; `cmdk` MIT (lido, não instalado); shadcn/ui MIT; Kibo MIT.

## Parte L do PLANO-1.0 — `Carousel` (L1)

**Passo 1, o nosso primeiro (15/08/2026):** não existia nada. `grep -n "carousel\|scroll-snap"` em
`packages/` devolve zero fora do `mask` do `OTPField`, que é outra coisa. Um consumidor roda a
galeria de fotos de produto com biblioteca de terceiro.

**Passo 2 — o componente nas referências, e a medição que decidiu tudo:** as **quatro** embrulham o
**mesmo motor**, o [`embla-carousel`](https://www.embla-carousel.com/):

| Onde | O que tem |
|---|---|
| `Referencia/kibo-main/kibo-main/packages/shadcn-ui/components/ui/carousel.tsx` | `useEmblaCarousel`, `opts`/`plugins`/`setApi`, teclado ←/→ |
| `Referencia/ui-main/…/registry/bases/{aria,base,radix,new-york-v4}/ui/carousel.tsx` | as **quatro** bases do shadcn: o mesmo arquivo, mudando só o `Button` importado |
| `Referencia/react-main/…/components/application/carousel/carousel-base.tsx` | idem, mais `IndicatorGroup`/`Indicator` e `scrollSnapList()` |
| `Referencia/activepieces-main/…/components/ui/carousel.tsx` | idem |

E o **`@base-ui/react` não tem carrossel** — medido: 46 pastas em `packages/react/src`, nenhuma é
`carousel`. É a mesma medição que abriu a decisão de motor do `Calendar`.

**Passo 4 — a pesquisa, porque a alternativa não veio de referência nenhuma (15/08/2026):** o
caminho sem JavaScript existe e **ainda não serve**. `::scroll-button()` e `::scroll-marker()` (CSS
Overflow 5) fazem carrossel acessível com zero script, mas **não são Baseline**: Chromium desde a
135, WebKit com o Safari 26.6 previsto para o fim de agosto de 2026, e o Firefox ainda "em
desenvolvimento". Um design system não entrega controle que só funciona num navegador.

**O que entrou:** o contêiner de rolagem nativo com `scroll-snap`, que é Baseline há anos e entrega
de graça o que o `embla` reimplementa — arrasto por toque com inércia, roda, teclado e o encaixe.
Sobra ao React o que o CSS não sabe: em qual slide se está, para acender o ponto e desabilitar a
seta da ponta. **Zero dependência nova**, e por isso o `BUILDING.md` §3.3 não foi acionado.

**O que NÃO entrou, e por quê:** `opts`/`plugins`/`setApi` (superfície de configuração do motor de
outra biblioteca — `BUILDING.md` §Passo 5); laço infinito e autoplay (não existem em rolagem nativa
e trariam o motor de volta pela porta dos fundos; nenhum apareceu na medição dos consumidores);
arrasto com o MOUSE (o toque é nativo, o mouse tem seta, roda e teclado); eixo vertical (sem uso
medido, e o sprite não tem chevron para cima); e as **sete peças** da decomposição da referência,
que aqui custariam sete fichas — quem embrulha cada slide é o componente, e é por isso que o rótulo
"Slide 3 de 8" nunca fica com o consumidor.

**O caso `multiple` da referência virou CSS:** `--carousel-slide` (default `100%`), no idioma do
`--qr-size` e do `--media-h`. Quantos slides aparecem por vez é decisão de layout da página.

**A11y — o que veio do APG e o que veio da medição:** região com `aria-roledescription="carousel"`
e nome próprio, slide como `group` com "Slide N de M", `<button>` nativo nos controles. Duas coisas
que referência nenhuma daqui dá: a faixa é `tabIndex={0}` porque conteúdo que rola tem de ser
alcançável por teclado (regra `scrollable-region-focusable` do axe), e o ponto é alvo de **24×24**
com desenho de 8px no `::before` — uma fila de pontos de 8px reprova o **WCAG 2.2 AA (2.5.8)**, e
é o erro que esse desenho convida a cometer.

**Licenças:** shadcn/ui MIT · Untitled UI React MIT · Kibo MIT · Activepieces MIT (exceto
`packages/ee/`, fora do que foi lido) · Base UI MIT. `embla-carousel` MIT — **lido, não instalado**.

## Parte L do PLANO-1.0 — `Image` (L4)

**Passo 1, o nosso primeiro (15/08/2026):** não existia. O que existia era a LIÇÃO, escrita no core
pelo item I7: o comentário do `--media-ar` registra que sem proporção fixa um player com
`preload=none` mede zero até a mídia chegar e a página SALTA. É a mesma física, e por isso este
componente não é conveniência — é o remendo de CLS que toda imagem de conteúdo precisa.

**Passo 2 — a referência ensinou pelo AVESSO, e isso vale registrar.** O `aspect-ratio` de
`Referencia/kibo-main/…/packages/shadcn-ui/components/ui/aspect-ratio.tsx` é o `AspectRatio` do
Radix: um COMPONENTE inteiro que existe para emular a proporção com o truque do `padding-bottom`.
Isso era necessário antes de a propriedade CSS ser Baseline. Hoje não é. Copiar aquela anatomia
seria trazer um componente para fazer o que uma linha de CSS faz — então aqui não há
`<AspectRatio>`: há uma prop `ratio`.

**A anatomia que entrou veio de `Referencia/tool-ui-main`** (`components/tool-ui/image-gallery/
gallery-grid.tsx`), que é onde o estado de ERRO está desenhado: `onError` troca a imagem por uma
caixa com ícone e o texto alternativo. Ele fecha uma dívida medida desta casa — o `Avatar` foi
medido em 31/07/2026 com `src` quebrado e **não** caía no fallback, mostrando o glifo de imagem
partida do navegador e perdendo o `alt` junto.

**O cuidado medido do item — não brigar com o `<Image>` do framework:** o elemento é trocável por
`render`, usando o `useRender` do `@base-ui/react`, motor que a Aurea já paga desde a Fase 2 e cujo
`render` o `ToolbarButton` daqui já usa. `<Image render={<NextImage/>} ratio="16/9"/>` mantém a
nossa pele e a nossa caixa, e entrega ao framework o `srcset`, o CDN e o loader dele.

**O marcador de carregamento não tem estado, e é decisão:** a caixa nasce com
`background:var(--surface-3)` — a superfície do `.skeleton` — e o bitmap a cobre ao pintar. Guardar
`loaded` em `useState` daria o mesmo resultado custando um render por imagem, e no HTML estático do
catálogo o estado nunca sairia de "carregando".

**O DEFEITO QUE A MEDIÇÃO ACHOU (15/08/2026), e ele é o registro mais útil desta entrada.** A
primeira versão da regra tinha `aspect-ratio: var(--image-ratio, auto)`. Medido no navegador, numa
caixa de 400px, com a imagem ainda não carregada:

| Caso | Com a regra | Sem a regra |
|---|---|---|
| `ratio="16/9"` | 400×225 | 400×225 |
| `width={300} height={200}`, sem `ratio` | **400×0** | 400×267 |

O fallback `auto` **vence** o `aspect-ratio: auto <width> / <height>` que o navegador deriva dos
atributos do elemento. Ou seja: a regra escrita para impedir o salto de layout produzia exatamente
o salto, no caso mais comum de todos. A proporção passou a ir inline e só quando existe; quem não
passa `ratio` fica com o comportamento do navegador, que já estava certo. Há asserção na pele e no
teste de unidade contra a volta.

**Licenças:** Kibo MIT · tool-ui (assistant-ui) MIT · Base UI MIT.

## Parte L do PLANO-1.0 — `Gallery` (L2)

**Passo 1, o nosso primeiro:** a galeria já existia — dentro do bloco `MediaLibrary` (item I7), que
é **demonstração de arquétipo**, não peça. Quem quisesse a galeria copiava o bloco. Este item é a
extração, e três coisas vieram medidas de lá, nenhuma delas de aparência:

- **o ladrilho é `<button>`, não `Card`.** Medido em 11/08/2026: o `.card-interactive` do core tem
  `cursor:pointer` e `:hover` e **nada de foco** — uma `<div>` com cursor de mão não recebe Tab;
- o selecionado se marca com **`aria-current`**, como o item ativo da `Sidebar`;
- **a seleção é UMA constante do consumidor**, não três strings paralelas — o achado I1. Por isso
  `selected` é prop e a galeria não guarda escolha nenhuma.

**A referência que o item mandava ler era a `media-chrome-main`, e a anatomia não estava lá.** Está
em `Referencia/tool-ui-main/…/components/tool-ui/image-gallery/` — `gallery-grid.tsx`,
`gallery-lightbox.tsx` e `image-gallery.tsx`. Fica registrado assim, e não corrigido em silêncio: é
a lição de que pasta indicada não é veredito, e procurar no conjunto inteiro custou um comando.

**O que entrou de lá:** a grade como lista (`role="list"`/`listitem`), o `<button>` com o texto
alternativo como nome, `loading="lazy"` e `decoding="async"` nas miniaturas — que aqui já vêm do
`Image` (L4) —, e o estado de erro por ladrilho, que também é do `Image`.

**A trava do item, cumprida:** *ampliar imagem é diálogo, e diálogo já existe*. A ampliação abre o
`Dialog` daqui, com foco preso, Escape e fundo — não nasce uma segunda superfície flutuante. A
referência faz o mesmo com o `<dialog>` nativo. A foto ampliada usa `fit="contain"`: cortar a
imagem que a pessoa pediu para **ver** é o oposto do pedido.

**O que a MEDIÇÃO obrigou a mudar, e não veio de referência nenhuma:**

1. **`image-redundant-alt` (axe).** Com `alt` e legenda dizendo a mesma coisa, o leitor de tela
   anuncia o texto duas vezes seguidas. A regra do WAI para figura com legenda resolve: quando o
   texto ao lado já diz, a miniatura entra com `alt=""`. O `alt` de verdade não se perde — ele
   nomeia a foto **ampliada**, que é onde não há legenda ao lado.
2. **A cápsula do selecionado não aparecia.** `.gallery-tile` e `.is-selected` têm a mesma
   especificidade, e a nossa vem depois no arquivo: `background:transparent` matava a cápsula da
   linguagem da casa e o escolhido saía só com o fio amarelo. A correção é
   `.gallery-tile:not(.is-selected)`, e não uma segunda regra de selecionado — reescrever a cápsula
   aqui seria a cópia que a seção "uma linguagem só" existe para impedir.
3. **Ladrilho que não faz nada não é botão.** Sem `onSelect` e sem `zoom`, os ladrilhos saem como
   conteúdo: um `<button>` inerte é alvo de foco que engana quem navega por teclado, e o axe não
   pega porque o botão é válido.

**Sem roving tabindex, e é decisão:** numa grade de fotos a pessoa espera tabular foto a foto, como
na lateral — a razão já está escrita no `Sidebar`. Roving aqui copiaria o `TreeView` para onde ele
atrapalha.

**Licenças:** tool-ui (assistant-ui) MIT · Media Chrome MIT · Base UI MIT.

## Parte L do PLANO-1.0 — `Prose` (L5)

**Passo 1, o nosso primeiro (15/08/2026):** medido no core, **não havia regra nenhuma** de `h1`–`h6`,
`blockquote`, `pre`, `code` ou `figcaption`. Título dentro de conteúdo saía com o tamanho do
navegador, e o corpo do documento é `--text-md` (14px) — tamanho de interface, pequeno para ler
artigo. Ou seja: um portal editorial que renderiza Markdown recebia texto sem pele.

**Passo 2 — a referência, e o que ela NÃO é.** O `typography` de `Referencia/ui-main`
(`apps/v4/examples/aria/typography-*.tsx`, 15 arquivos) **não é componente**: é uma página de
receitas em classes utilitárias, aplicadas elemento a elemento no JSX de quem copia. É o modelo
deles — código-fonte como produto. Não serve a uma biblioteca que **entrega CSS**, e por isso o
que se extraiu foi a LISTA DE ELEMENTOS que precisam de regra e o que cada um precisa: título com
entrelinha curta e espaço antes, parágrafo com entrelinha larga, citação com fio na borda inicial,
lista com recuo próprio, código dentro do texto menor que a linha, bloco de código que rola, e
tabela com recuo de célula.

**O que a nossa medição acrescentou às referências:**

- `--text-base` no corpo, contra os `--text-md` da interface — 16px é tamanho de leitura;
- `--leading-relaxed` (1.7), que **existia no token e não tinha uso nenhum** no core;
- `--prose-measure`, default `68ch` (medido: 652,8px). Linha longa demais é linha que a pessoa
  perde ao voltar para a seguinte;
- `0.9em` no código dentro do texto, e **não** um token: o tamanho é relativo à LINHA em que ele
  está, senão o mesmo código sai maior dentro de um `h2` do que dentro de um parágrafo. É o mesmo
  raciocínio do `line-height:1` do `.badge`.

**A TRAVA DO ITEM, e ela está provada e não prometida.** Toda regra é escopada em `.prose`, porque
este repositório já pagou uma vez pelo contrário: cinco regras de tabela eram de ELEMENTO e valiam
para toda `<table>` do documento — o calendário nasceu com `min-width:720px` por causa delas, e
gate nenhum viu, porque os checks 15 e 18 comparam CLASSE e seletor de elemento não tem nenhuma.
A prova agora é um teste: no `skin.spec` há uma `<table>`, uma `<blockquote>` e um `<h2>` **irmãos**
da prosa, e as asserções cobram que os três continuem exatamente como o navegador os deixou —
largura mínima zero, sem fio, sem recuo, com o tamanho de fonte do UA. Se uma regra perder o
escopo, eles mudam e o gate reprova.

**A tabela da prosa não é a tabela de dados**, e isso é decisão: sem `min-width:720px`, sem faixa
de cabeçalho em caixa alta, sem hover de linha. Uma tabela de três colunas no meio de um artigo
não é uma grade.

**A FONTE NÃO MUDA.** O `--font-editorial` (IBM Plex Serif) existe, está empacotado e **não tem
uso** no core. Usá-lo aqui seria decisão de APARÊNCIA, que pelo `BUILDING.md` §3.1 vai ao Victor
com imagem do antes e do depois — não entra por conta própria num componente. Fica declarado na
ficha como a variável a apontar por quem quiser serifa.

**Segurança, registrada porque é o caminho de uso mais provável:** `Prose` é uma `<div>`, então
aceita `dangerouslySetInnerHTML`. Quem entrega HTML de terceiro **sanitiza antes**. A Aurea desenha
o texto; ela não pode decidir o que é seguro renderizar, e a ficha diz isso em voz alta.

**Licenças:** shadcn/ui MIT.

## Parte L do PLANO-1.0 — máscara no campo (L6)

**Passo 1, o nosso primeiro (15/08/2026):** o comentário do `NumberField`, escrito no Lote 1, já
dizia que *"o valor digitado não é formatado por locale — o Base UI trata"*. Medido agora no
`@base-ui/react@1.6.0`: o `NumberFieldRoot` aceita **`format?: Intl.NumberFormatOptions`** e
**`locale?`**, e a nossa casca simplesmente **não repassava**. Ou seja, metade do item já estava
paga e desligada.

**Passo 4 — a pesquisa, e ela decidiu a outra metade contra a intuição.** Três medições
independentes, todas contra mascarar enquanto se digita:

| Fonte | O que diz |
|---|---|
| **USWDS** (design system do governo americano) | publica o `Input mask` **com reprovação registrada em WCAG 2.1 AA**: *"recovering from an error is difficult due to lack of feedback"* |
| **MUI** — a referência que o item mandava ler | **abandonou** máscara nos campos de data na v6: o texto *"leaks to the previous sections"* ao editar o meio do valor. Há um vídeo no repositório deles chamado `masked-input-bad-ux.mp4` |
| prática corrente | máscara ao vivo **descasa** o que o leitor de tela ANUNCIA (o que foi digitado) do que o campo MOSTRA (o que a máscara deixou); a recomendação é deixar digitar e colar à vontade e formatar **depois que o foco sai** |

**O que foi entregue, então, e por quê:**

- **moeda** — `format` e `locale` no `NumberField`, mais `name`. Zero componente novo, zero
  dependência: quem formata é o `Intl` da plataforma, e o motor formata **no blur**. Isso substitui
  a biblioteca de moeda que um consumidor carrega só para isso, que era o caso medido do item;
- **placa e documento** — `formatOnBlur` no `Input`. A Aurea entrega o **momento**, que é a decisão
  de acessibilidade; o **formato** continua do consumidor, porque placa e documento são regra de
  **país**, conhecimento de domínio e não de design system. Nada de máscara ao vivo.

**A TRAVA DO ITEM, dos dois lados, e provada:**

- no texto, o valor formatado **é o `value` do elemento** — nada pintado por cima. O teste cobra
  isso explicitamente, inclusive que não exista nó com o texto formatado fora do campo;
- no número, o motor renderiza um **input escondido com o valor CRU** quando há `name` (medido no
  fonte do `NumberFieldRoot`): o formulário envia `1234.5`, nunca `R$ 1.234,50`.

**Licenças:** Base UI MIT · MUI MIT (blog lido, nada copiado) · USWDS domínio público (lido).

## Parte L do PLANO-1.0 — `SortableList` (L3)

**Passo 1, o nosso primeiro (15/08/2026):** o item mandava olhar o `graph.tsx` daqui, "que já tem
arrasto". Tem — e o arrasto é **do motor**: `nodesDraggable` e `onNodeDragStop` são do
`@xyflow/react`. Não há padrão de arrasto próprio nesta casa para reusar; o que há é o precedente
do **I8**, e ele é a trava: **arrastar precisa de alternativa sem arrastar**.

**Passo 2 — a referência, e o que ela custa.** O `list` de `Referencia/kibo-main/packages/list` é
`@dnd-kit/core` (`DndContext`, `useDraggable`, `useDroppable`, `restrictToVerticalAxis`), e o
`kanban` de lá é o mesmo motor. Trazer o dnd-kit resolveria o item **e obrigaria todo consumidor a
baixá-lo** — dependência nova é o item 3 do `BUILDING.md` §3, o que interrompe o lote e exige o
Victor. Não fez falta: o protocolo de teclado é uma máquina de três estados, e o ponteiro é
`PointerEvent`.

**A decisão de ponteiro é medida, não estética:** o **drag-and-drop do HTML5 não dispara em toque
nenhum**, então um consumidor no celular ficaria sem reordenar — e são dois consumidores fazendo
arrasto HTML5 na mão hoje, que é a origem do item. `setPointerCapture` cobre mouse, toque e caneta
com o mesmo código, e `touch-action:none` na alça é o par obrigatório dele: sem essa linha o
navegador rola a página em vez de deixar arrastar. Está no CSS com o motivo escrito ao lado, e há
asserção na pele.

**O TECLADO é a razão de o componente poder existir**, e segue a convenção que o mercado
consolidou (a mesma do dnd-kit, e a que os guias de arrasto acessível descrevem): **Espaço pega,
setas movem, Espaço solta, Esc devolve ao lugar de onde saiu.** Três detalhes que só aparecem
implementando:

1. **o foco tem de SEGUIR o item.** Ele troca de lugar no DOM; sem seguir, a próxima seta move o
   vizinho. Vai por efeito e não por `requestAnimationFrame`, porque o React precisa ter commitado
   a ordem nova antes de procurar a alça;
2. **as setas não fazem nada com o item solto** — senão o componente sequestra a navegação de quem
   só está passando por ali;
3. **cada passo é ANUNCIADO** numa região viva `polite`. Sem isso quem não vê a lista move o item e
   não recebe confirmação nenhuma — que é literalmente a reprovação registrada do USWDS citada no
   item L6 ("recovering from an error is difficult due to lack of feedback"). `polite` e não
   `assertive`: mover item não é emergência, e interromper a leitura a cada seta seria pior.

**A lista é CONTROLADA** — `items` mais `onReorder(de, para)` —, e o teclado e o ponteiro chamam o
**mesmo** callback: não existem dois caminhos de dado sobre a ordem. É a escolha do `selected` da
`Gallery` e do `value` das `Tabs`.

**Licenças:** Kibo MIT (dnd-kit lido, **não instalado**) · React Flow MIT.

## Parte N do PLANO-1.0 — `BlockEditor` (N1)

**Passo 1, o nosso primeiro (15/08/2026).** O item descreve "um portal editorial monta artigo com
blocos (texto, imagem com legenda)". Medindo o que a casa já tinha para isso: **`Prose` (L5)**
desenha a saída (23 regras escopadas, título a tabela), **`Image` (L4)** é o bloco de imagem com
proporção reservada, **`Textarea` e `Field`** são a entrada, **`Toolbar`** é a barra e
**`SortableList` (L3)** tem o protocolo de arrasto acessível. Sobrava **um** buraco: a **moldura**
— ordem, alça, remoção, e o lugar onde o editor do consumidor entra.

**Passo 2 — e a primeira pergunta do `BUILDING.md` §2 é "é o mesmo componente?". NÃO É.** O
`editor` de `Referencia/kibo-main/packages/editor` tem **39 exports** e **17 dependências** no
`package.json` (TipTap 3.6.6, `@tiptap/pm`, lowlight, tippy.js, fuse.js, floating-ui). Medido
export a export: **18 dos 39 são de tabela** (`EditorTableRowAfter`, `EditorTableMergeCells`…), o
resto é formatação inline (negrito, itálico, tachado, sub, sup) e tipo de nó. É um editor de
**documento único** sobre ProseMirror. **Lista de blocos, reordenação e bloco de imagem com legenda
não existem ali** — a anatomia que o N1 pede não estava na referência indicada, e isso fica
registrado em vez de corrigido em silêncio, como no L2.

**Passo 4 — a pesquisa (15/08/2026), porque a decisão era de motor.** Estado atual medido:
**TipTap 3** é MIT no editor e pago na nuvem (colaboração/comentários), e continua sendo
ProseMirror por baixo · **BlockNote** é **MPL-2.0** (copyleft por arquivo, e a Aurea é Apache-2.0)
· **Editor.js** é o modelo de blocos independentes, cada bloco um `contenteditable` · **Lexical** e
**ProseMirror** são as bases que o mercado aponta como de vida longa. Na plataforma:
**`contenteditable="plaintext-only"` virou Baseline Newly available**, e a **EditContext API
NÃO é Baseline** — só Chromium, então está fora.

**A decisão, e o que a fechou, está na
[ADR-0025](../decisions/0025-editor-por-blocos-sem-motor.md).** A razão que pesou mais não é peso de
pacote: é **segurança**. O navegador **não sanitiza HTML colado**; quem é dono da superfície de
edição é dono do XSS de colagem, e a pesquisa confirma que ProseMirror e Lexical tratam o
`contenteditable` como **alvo de renderização e nunca como fonte da verdade** por essa razão. A
Aurea não pode decidir o que é seguro renderizar dentro do domínio do consumidor — é a mesma frase
que a ficha do `Prose` já diz em voz alta.

**O que ENTROU:** a moldura. Trilho com alça e remover, bloco como linha de lista, estado `pego`
por elevação e borda, e o corpo do bloco como fenda. Mais o **`kind`**, que é a única coisa que a
moldura sabe sobre o bloco — e existe só para o nome acessível ("Reordenar, Imagem 2 de 5").

**O que NÃO entrou, e por quê:** formatação inline, menu-bolha, barra de formatação e tabelas — são
do motor do consumidor. **`onInsert` também não**, e é YAGNI medido: acrescentar bloco é apendar na
coleção de quem controla, e a reordenação daqui leva o novo bloco a qualquer posição; uma costura
de inserção seria uma segunda forma de fazer a mesma coisa.

**Uma medição mudou o desenho.** O componente ia ser uma prop da `SortableList` — até medir que o
rótulo dela é `<span>`, que só aceita **conteúdo de frase**. Uma `<figure>` ali dentro é marcação
inválida que o navegador reescreve, e o bloco de imagem com legenda **é literalmente o que o item
pede**. Daí `.block-body` ser `<div>` dentro do `<li>`, e daí o componente existir. Há teste
unitário e asserção na pele para isso.

**O que a extração pagou:** o protocolo de teclado e de ponteiro saiu da `SortableList` para o
**`useReorder`** do `internal.tsx`, porque o `BlockEditor` virou o segundo dono do mesmo protocolo
— a regra do `CLAUDE.md` ("quem mais tem esse problema?"). A DOM da `SortableList` não mudou; quem
prova são o gate de pixel e o `skin.spec`.

**Licenças:** Kibo MIT (TipTap **lido, não instalado**). BlockNote (MPL-2.0), Editor.js, Lexical e
ProseMirror foram **pesquisados, não baixados e não instalados** — nenhuma linha de nenhum deles
entra aqui, e o `dependencies.engine` da ficha é `none`.

## Fora do PLANO-1.0 — `BottomNav`, a lacuna estrutural do consumidor (17/08/2026)

Não é item de parte: as partes acabaram em 15/08/2026. Vem do
[`CONSUMIDOR-1.md`](CONSUMIDOR-1.md) §4.1, autorizado pelo Victor em 17/08/2026 —
a Aurea tinha `Topbar` e `Sidebar`, e os dois são vocabulário de **desktop**.

**O passo 1 (medir o nosso) achou o que decidiu o desenho**, e não foi um defeito: foi o
`SidebarItem`. Ele já é `{id,label,href?,icon?,badge?,onClick?,items?}` e a lateral já pinta o
item atual por `[aria-current]`. Um `BottomNavItem` novo obrigaria o consumidor a manter **duas
listas do mesmo menu** — e listas gêmeas divergem. Daí a barra receber o tipo da lateral, e a
sublista ser ignorada: barra inferior é plana.

**Quantas das nove referências têm o componente: UMA.** Medido —
`find Referencia -iname "*bottom*nav*" -o -iname "*tabbar*"` devolve só a
`material-ui-master`. É o resultado esperado e está registrado por isso: as pastas são
bibliotecas de **desktop**, e zero na pasta manda **pesquisar**, não concluir que não se
constrói (`BUILDING.md` §1).

**O que a MUI (`packages/mui-material/src/BottomNavigation`, `BottomNavigationAction`) deu:** a
anatomia. Item em **coluna** — ícone sobre rótulo —, itens com `flex:1` dividindo a largura,
`min-width:80` / `max-width:168`, altura 56, e o estado `selected` mudando a cor.

**O que a MUI NÃO deu, e é o que a pesquisa cobriu:** ela não é um landmark. A raiz é uma `<div>`
sem `<nav>`, sem `aria-label` e sem `aria-current`; o item é `<button>` com `ButtonBase`. Isso é
mais fraco que a nossa própria `Sidebar`, então **não entrou**. A pesquisa (KendoReact, MDN
`navigation role`, APG Landmarks, a11y-collective) converge no contrário e é o que foi adotado:
contêiner `<nav>` **nomeado**, item **link**, `aria-current="page"` no atual.

**A distinção que virou teste:** barra inferior **não é `Tabs`**. Aba troca painel dentro da
página; barra inferior troca de página. `role="tablist"` num menu faz o leitor de tela prometer
setas que não levam a lugar nenhum — há asserção no teste unitário justamente para isso.

**O que veio SÓ da pesquisa, porque referência nenhuma tem:** o recuo do indicador de tela cheia
do iPhone, `padding-bottom:max(var(--space-1),env(safe-area-inset-bottom))`. Medido:
`grep -ri safe-area-inset Referencia/` = **0** nas nove pastas. Ele depende de o consumidor
declarar `viewport-fit=cover` na meta viewport (está na ficha e no catálogo); sem isso `env()`
devolve 0 e o `max()` entrega o espaço normal — **degrada, não quebra**. A Aurea não escreve a
meta do consumidor.

**Limite declarado da pele:** este é o único efeito que o `skin.spec` **não** consegue medir —
fora do aparelho o `env()` vale 0 em qualquer navegador. Ele é cobrado na **declaração**: a
asserção lê a regra `.bottom-nav` da folha de estilo e exige `safe-area-inset-bottom` ali. Apagou
a linha, reprova. É menos que efeito e está escrito como tal, em vez de fingir uma medida.

**O que NÃO entrou da MUI, e por quê:** `showLabels` (rótulo só no item selecionado) — é
identidade do Material e esconde o nome de quem enxerga; `slots`/`slotProps`/`component`/`sx` —
superfície de configuração da biblioteca deles (`BUILDING.md` passo 5); os 56/80/168px crus — o
check 12 reprova pixel novo, e a altura saiu de `--control-h-lg`, que é o alvo de toque.

**Licença verificada:** `material-ui-master` é MIT. Nada dela é redistribuído e nenhuma linha
literal entra — só anatomia. KendoReact, MDN, APG e a11y-collective foram **lidos na internet**,
não baixados.

## Fora do PLANO-1.0 — `Badge` reescrito (17/08/2026)

Pedido do Victor, com as palavras dele: *"o nosso atual é pobre"*. E ele estava certo — o
`Badge` era **uma forma, um tamanho e seis cores**. Ele mandou os códigos de referência e a
instrução: ler todos, e parar de construir de memória.

**As duas peças que as referências chamam pelo mesmo nome**, e que aqui viraram uma:

| | o que é | onde foi lida |
|---|---|---|
| CHIP | metadado curto numa pílula | `react-main/components/base/badges/badges.tsx` — 3 tipos × 3 tamanhos × 12 cores, com ponto, ícone, imagem, bandeira, botão de fechar e só-ícone |
| SOBREPOSTO | contador no canto de OUTRA coisa | `material-ui-master/packages/mui-material/src/Badge/Badge.js` |

A chave é `anchor`: sem ela `children` é o conteúdo do chip — **o uso de sempre, intacto nas
103 fichas**; com ela `children` é o que se decora.

**Os números vieram do fonte, não de impressão.** Da MUI: contador 20×20, raio 10, padding
`0 6px`, fonte 12, `line-height:1`, `z-index:1`; ponto 8×8; e o deslocamento do canto valendo
**0 para caixa quadrada e 14% para redonda** — é o `overlap`, e sem ele o contador de um avatar
fica solto fora do círculo. Da Untitled UI: os três tamanhos e o anel.

**O ANEL DE RECORTE é o achado que consertou a aparência.** Um fio da cor da superfície entre o
contador e o que está atrás. Três fontes independentes dizem a mesma coisa: `ring-[1.5px]
ring-bg-primary` no `avatar-online-indicator.tsx` da Untitled UI, `border-background border-2` no
ReUI que o Victor mandou, e `box-shadow: 0 0 0 2px background.paper` no exemplo de contato da
MUI. **Sem ele o contador derrete no ícone** — era exatamente o "esquisito" que ele apontou.

**A acessibilidade estava INVERTIDA no que eu tinha feito.** A documentação da MUI e três fontes
de a11y convergem: o badge sobreposto é `aria-hidden`, e o número mora no nome de **quem é
decorado** (`aria-label="Inbox, 4 unread messages"`). Sino anunciado como "sino 8" não diz a
ninguém o que é o 8. Por isso `formatBadgeCount` é **exportada**: o nome acessível tem de dizer a
mesma string que o olho vê, inclusive o `99+`.

**O que NÃO entrou, e as duas razões batem:** botão de fechar. Pela `DIRECTION.md` §3.6, chip
removível é **`Tag`**, não `Badge`; e um manipulador em JSX exigiria `"use client"` no
`markup.tsx`, que é o arquivo que existe para não ter a diretiva (ADR-0026 — `Card` custava
118,5 KB). **`Tag` não existe na Aurea, e é lacuna de verdade achada por esta leitura.**

**O que também não entrou:** a geometria. `rounded-md` e `shadow-xs` do tipo "modern" da
Untitled UI são a identidade **deles**; pílula continua pílula, pelo `CLAUDE.md`. Foram
substituídos por `emphasis` (soft/solid/outline), que muda o peso sem tocar na forma.

**Uma armadilha da casa, cobrada de novo:** as três ênfases nasceram escritas **antes** das
variantes no arquivo. Especificidade igual (0,1,0), então quem vem depois vence — e `solid`
desenhava igual ao `soft` em quatro das seis variantes. Medido no navegador, não visto. É a mesma
falha de ORDEM que o `.banner` e o `.data-list` já pagaram aqui.

**Medição de contraste, 36 combinações** (6 variantes × 3 ênfases × 2 temas), com canvas
resolvendo a cor de verdade e compondo a translucidez: **mínimo 5,60:1**, nenhuma abaixo de 4,5.
Está gateado no `skin.spec` e provado contra o defeito — devolvendo as ênfases para antes das
variantes, reprova.

**Licenças verificadas:** `material-ui-master` MIT, `react-main` (Untitled UI) MIT. Nada
redistribuído, nenhuma linha literal. ReUI foi **lido no chat**, não instalado.

## Limite honesto deste documento

A auditoria de 26/07/2026 registrou, no §6 ("o que não foi verificado"), que as referências não
tinham sido acessadas naquela sessão e que **nenhuma comparação podia ser afirmada**. Isto aqui
corrige a parte que dá para corrigir: o que já havia sido medido está registrado, com número, e
as licenças foram verificadas hoje.

O que **continua não feito**: comparar componente a componente com a referência. Foi feito no
`Button` e em nenhum outro (`AUREA.md` §3 declara isso como lacuna). Este documento não finge o
contrário.

## Fora do PLANO-1.0 — `Separator`, a régua que faltava (18/08/2026)

Nasceu de uma exigência do Victor: ao pedir as variantes de lateral do Untitled UI, ele mandou que
componente que a lateral usa e nós não temos seja **construído antes**, para não existir só dentro
da lateral. O inventário achou um: a variante `sidebar-section-dividers` precisa de divisor, e a
Aurea **não tinha nenhum**.

**Passo 1 — medir o nosso.** Zero. Só `.prose hr` (preso à prosa) e `ToolbarSeparator` (preso ao
Toolbar). Nenhuma régua geral.

**Passo 2 — as referências.** O HeroUI (`packages/styles/components/separator.css`, Apache-2.0)
deu a anatomia: box de 1px pintado com `background` e não com `border`; `--horizontal` em
`h-px w-full`; `--vertical` em `w-px h-auto min-h-2 self-stretch`. **A peça que eu não teria
pensado** é o separador **com rótulo no meio** (`separator__container` + `__line` + `__content`,
`flex items-center gap-3`) — o "or" entre dois caminhos de login, a data dentro de uma conversa.
Na implementação deles a orientação vem do **contexto do pai**, via `useSlottedContext`.

**A medição que INVERTEU o passo 2, e é o registro que importa.** O motor que já usamos entrega um
`Separator` — `node_modules/@base-ui/react/separator`. Lido o fonte: ele é `'use client'`, chama
`useRenderElement`, e o que produz são **dois atributos** (`role="separator"` e
`aria-orientation`). Importá-lo arrastaria o `markup.tsx` — que existe para NÃO ter a diretiva —
para o lado cliente. É o defeito da [ADR-0026](../decisions/0026-marcacao-pura-e-de-servidor.md), onde
o `Card` custou **118,5 KB** atravessando essa fronteira. Então aqui a regra "se o motor entrega,
não escrevemos" (`BUILDING.md` passo 2) **perde para a fronteira**, e fica escrito para a próxima
sessão não "corrigir" isto de volta.

**O que veio da pesquisa e não da referência:** `<hr>` nativo já tem `role="separator"` implícito,
então escrever o papel seria **ARIA redundante** — e o aviso do APG é que ARIA a mais é pior que
ARIA nenhuma. O papel `separator` também tem orientação horizontal por padrão, então
`aria-orientation` só aparece no vertical.

**O que NÃO entrou, pelo passo 5:** as três tonalidades do HeroUI (`secondary`/`tertiary`) — a Aurea
tem um `--border`, e inventar escala de tom aqui seria copiar o sistema de token deles; e o
separador com rótulo, que é outra estrutura (`<hr>` não carrega texto) e que ninguém pediu ainda.
Fica registrado como o próximo degrau, não como esquecimento.

**Licença verificada:** `heroui-3` é **Apache-2.0** — a mesma da Aurea. Nada dela é redistribuído e
nenhuma linha literal entra. O APG foi lido na internet em 18/08/2026.

## Fora do PLANO-1.0 — `NavList`, a última lacuna do consumidor (18/08/2026)

Vem do [`CONSUMIDOR-1.md`](CONSUMIDOR-1.md) §4.3, autorizado pelo Victor em
18/08/2026. Era a única lacuna que restava depois do `BottomNav`: a **linha que se toca e abre** —
ícone, rótulo, segunda linha, valor e seta. O tijolo de toda tela de ajustes.

**O passo 1 (medir o nosso) respondeu "componente ou pele?", que era a pergunta certa.** Os três
vizinhos foram medidos no fonte, não deduzidos:

| Vizinho | O que é, medido | Por que não serve |
|---|---|---|
| `.sidebar-item` | já é ícone + rótulo + acessório numa linha clicável, com pílula no hover | pinta com `--sidebar-foreground`, que é token **escopado à lateral**; e não tem segunda linha, valor nem seta |
| `DataList` | `<dl>` com `grid-template-columns:minmax(0,max-content) minmax(0,1fr)` | é termo/valor e **não se toca** — `DIRECTION.md` §3 separa por comportamento |
| `Table` | grade de dados com `min-width:720px` no `.table` | grade, não lista de destinos |

A conclusão: **componente novo**, mas reusando o menor (`DIRECTION.md` §3.9) — o `Icon`, e o valor
da direita é um **nó**, então `Badge` e `Status` compõem sem que o `NavList` saiba deles.

**Quantas das 20 pastas de `Referencia/` têm o componente: UMA.** E a medição merece registro
porque a busca por NOME mentiu primeiro. `find -name '*ListItem*'` acusou seis pastas; abertas uma
a uma, cinco eram falso positivo:

| Pasta | Quantos arquivos casaram | O que eram, aberto |
|---|---:|---|
| `material-ui-master` | 64 | **o componente maduro** — `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`, `ListItemSecondaryAction`, `ListItemAvatar` |
| `activepieces-main` | 27 | **não é UI**: ações de API de terceiro (item de checklist do ClickUp, item de lista do Kizeo) |
| `agent-prism-main` | 2 | `TraceListItem` — linha de trace, componente de domínio |
| `base-ui-master` | 1 | `useCompositeListItem` — navegação de **menu** por teclado, interno. **O motor que já usamos NÃO tem este componente** |
| `langfuse-main` | 1 | `TraceSearchListItem` — idem, domínio |
| `media-chrome-main` | 1 | renderizador da landing da documentação |

É a regra do `BUILDING.md` §1 acontecendo duas vezes: pasta com zero manda **pesquisar**, não
concluir que não se constrói; e nome de arquivo não é veredito — o que vale é abrir.

**O que a MUI deu, e é o que eu não teria pensado:** a **segunda linha**. O `ListItemText` tem
`primary` e `secondary`, e tela de ajustes real usa as duas ("Notifications" / "Push, email"). O
`CONSUMIDOR-1.md` §4.3 pedia só "ícone, rótulo, valor opcional e seta" — a referência
acrescentou a peça que faltava no enunciado. Também dela: o catálogo de estados do
`ListItemButton` (`selected`, `disabled`, `divider`, `alignItems`, `dense`, `autoFocus`).

**O que NÃO entrou da MUI, pelo passo 5:** `dense`, `disableGutters`, `alignItems`,
`disableTypography`, `inset`, `autoFocus` e o `component` polimórfico. Os sete existem por causa
do sistema de estilo e de densidade **dela** — aqui a densidade é global e o elemento sai do
`href`. E o `divider` ficou fora por decisão de identidade, não por esquecimento: o realce de
linha desta casa é a **pílula**, e pílula com traço embaixo se contradizem.

**O que veio SÓ da pesquisa, porque a referência não responde:** o alvo de toque e a semântica.

- **44px.** A pesquisa (WCAG 2.2 SC 2.5.8 AA = 24×24 como **piso legal**; SC 2.5.5 AAA = 44×44;
  Apple HIG 44pt; Material 3 48dp) converge em 44 para controle primário de dedo. A Aurea já
  tinha o token — `--target-min` = `2.75rem` = 44px — e já tinha o **mecanismo**:
  `@media (pointer:coarse)`. O `.nav-list-row` entrou **no bloco que já existia**, e não num
  bloco novo: dois lugares para a mesma regra é o defeito.
- **A seta é decorativa.** `aria-hidden`, e o `Icon` já emite o atributo — quem lê tela ouve
  "link", que já diz que abre. O alvo é a **linha inteira**, nunca a seta.
- **WCAG 2.5.3 Label in Name**: o rótulo vem primeiro no nome acessível, antes da segunda linha
  e do valor. Há asserção no teste unitário com `/^Profile/` justamente para isso.
- **`aria-disabled`, não `:disabled`.** Este não saiu da internet, saiu de **medição já escrita
  neste repositório** (13/08/2026, ao lado de `.btn:disabled`): `:disabled` tira o controle da
  ordem de foco e quem usa teclado nunca descobre que a linha existe.

**A distinção que virou teste, e é o que impede o terceiro padrão paralelo:** `NavList` **não é
landmark e não tem item corrente**. `Sidebar` e `BottomNav` são chrome de aplicativo — moram num
`<nav>` e marcam a seção com `aria-current="page"`. Este é conteúdo dentro da página: um terceiro
`<nav>` na mesma tela só acrescenta ruído para quem navega por landmark, e numa lista em que se
entra e se volta não há o que estar corrente. As duas asserções existem no teste unitário.

**Licença verificada:** `material-ui-master` é **MIT** (medido arquivo a arquivo em 09/08/2026,
tabela do `BUILDING.md` §1). Nada dela é redistribuído e **nenhuma linha literal entra** — só
anatomia. WCAG (SC 2.5.8, 2.5.5, 2.5.3), Apple HIG e Material 3 foram **lidos na internet** em
18/08/2026, não baixados. `dependencies.engine` da ficha é `null`.

---

## Lote 1 do alvo NATIVO — `Text`, `Stack`, `Cluster`, `Grid`, `Card`, `Icon`, `Button`, `IconButton` (03/09/2026)

**A referência primária foi a própria Aurea, e isso não é atalho — é o passo 1 do
[`BUILDING.md`](BUILDING.md).** Sete dos oito já existem na web, com ficha, CSS e implementação; a
anatomia deles foi decidida quando nasceram, e as referências externas daquele momento estão
registradas acima. Reabrir a anatomia aqui produziria um segundo desenho para o mesmo nome — que é
exatamente o defeito que este documento existe para não ter.

**O que foi medido no nosso, antes de escrever uma linha:**

| medido | onde |
|---|---|
| `.stack` · `.cluster` · `.grid` | `packages/core/src/aurea.css` — flex/gap e o `auto-fill` do grid |
| `.btn` e os cinco `.btn-*` | idem: alturas de token, `padding-inline` 10/12/15/20/26, `gap` 6/8/10 |
| `.btn-icon` | ~~raio `--radius-md`/`--radius-sm`, **não** o pill~~ — desde 25/09/2026 é redondo, o raio da cápsula ([ADR-0052](../decisions/0052-o-botao-so-de-icone-e-redondo.md)) |
| `variant` × `appearance` × `tone` | ficha do `Button`: *"`variant` é atalho para o par"* — ADR-0044 |
| a decisão de não ter `gap` | ficha do `Stack`: *"um primitivo que aceita qualquer espaçamento é como um sistema deixa de ter espaçamento"* |

**O que NÃO atravessou, com o motivo:** `variant` (atalho legado — o pacote nativo não tem
contrato publicado a manter), `href`, `type`, `kbd`, `loading` (é o `Spinner`, Lote 2) e
`appearance:"nav"` (sem consumidor até o Lote 3 — ADR-0034).

### Duas pesquisas datadas, e as duas mudaram o código

**1. Alvo de toque — pesquisado em 03/09/2026.** As guias divergem e o número importa:
Apple HIG **44 pt**, Material **48 dp**, WCAG 2.2 SC 2.5.8 (AA) **24 px**, SC 2.5.5 (AAA)
**44 px**. O token da Aurea é `--target-min: 44`, e a escala de controle mede
26 · 30 · 36 · 42 · 50 — **três das cinco alturas ficam abaixo dele**.

A saída óbvia seria `hitSlop`, e a pesquisa a derrubou: **ele não é levado em conta pelo
TalkBack** — a área do dedo cresce e o retângulo que o leitor de tela explora continua o visual.
Quem usa leitor ficaria com o alvo pequeno, que é exatamente quem mais precisa dele grande. A
recomendação corrente é `minHeight`/padding explícito, e é o que está no `Button`: o `Pressable`
tem `minHeight: targetMin` e **a caixa pintada mantém a altura do token** — o desenho não muda, o
alvo cresce, e o leitor de tela enxerga o alvo inteiro.

**2. `SafeAreaView` — pesquisado em 03/09/2026.** O do próprio React Native está **deprecado**
desde a **0.81** (*"has been deprecated and will be removed in a future release"*), e nunca fez
nada no Android. O recomendado é o `react-native-safe-area-context`. Isso tornou o `Screen`
**dependência nova**, que pelo [`BUILDING.md`](BUILDING.md) §3 interrompe o lote e exige o
Victor — **ele autorizou no mesmo dia**, e a decisão virou a
[ADR-0040](../decisions/0040-o-screen-adota-o-safe-area-context-como-peer.md).

A pesquisa continuou depois do "sim", e duas coisas mudaram o código:

- **O Android 15 força *edge-to-edge* e o 16 nem deixa desligar**, o que fez aparecer o
  `react-native-edge-to-edge`. Ele **não substitui** o `safe-area-context`: é a outra metade do
  problema (as janelas do sistema), e desde a **RN 0.81** existe a propriedade `edgeToEdgeEnabled`
  do Gradle que faz o mesmo. **Descartado com razão escrita, não por omissão.**
- **O componente ganhou do hook, e quem decidiu foi o fonte.** A recomendação corrente da
  comunidade é `useSafeAreaInsets`; lendo o `RNCSafeAreaViewShadowNode.cpp` da 5.9.1 ficou claro
  que o modo `additive` **soma** o inset ao padding do estilo dentro do cálculo do Yoga — antes do
  primeiro quadro, que é o que o hook não consegue. **A recomendação mais citada não era a certa
  para este caso**, e só a leitura do fonte mostrou isso.

**Licença verificada:** nada de terceiro foi copiado — nem uma linha do
`react-native-safe-area-context` entrou no repositório. Ele é **MIT**, medido no registro (5.9.1),
e entrou como **peer `>=5`** mais devDependency de typecheck. O `additive` foi medido nas versões
**5.0.0 e 5.7.0** além da 5.9.1, para o intervalo do peer não ser chute — a 5.7 é a que o
`bundledNativeModules.json` do **Expo SDK 57** fixa. As guias de acessibilidade foram lidas na
internet, não baixadas.

---

## Lote 2 do alvo nativo — 08/09/2026

**Nada de terceiro foi copiado, e nenhuma dependência nova entrou.** Os dez componentes saíram de
**duas leituras do próprio repositório**, e é essa a referência:

| lido | o que se extraiu |
|---|---|
| `packages/core/src/aurea.css` | a geometria e a cor de cada peça, com a linha: `.spinner` 668, `.badge` 976, `.status` 1060, `.alert` 1088, `.progress` 1105, `.data-state` 1110, `.skeleton` 1111, `.avatar` 1196, `.kpi` 1207, `.empty-state` 1823 |
| `packages/react/src/` | a semântica, que o CSS não conta — `feedback-client.tsx` (Status, Alert, Spinner, DataState, EmptyState), `markup.tsx` (KPI, Progress, Skeleton, Badge), `identity-client.tsx` (Avatar) |

**A segunda leitura mudou três decisões**, e sem ela as três teriam saído erradas:

1. **`.kpi` é uma coluna com `gap:5` no CSS — e um `<Card>` no fonte** (`markup.tsx:105`). Quem
   lesse só o CSS entregaria a peça sem superfície, sem borda e sem o raio 22 da identidade.
2. **O `Alert` é `role="alert"` só no `danger`** (`feedback-client.tsx:59`); o resto é `status`.
   `alert` interrompe o leitor de tela, `status` espera a vez.
3. **No `DataState`, os estados universais ACOMPANHAM o conteúdo** (`feedback-client.tsx:117`) em
   vez de substituí-lo. Isso não aparece em regra de CSS nenhuma.

**A pasta `Referencia/` não foi consultada, e não por escolha:** ela está no `.gitignore` e não
existe no ambiente onde este lote foi construído (`git ls-files Referencia | wc -l` devolve 0).
Fica dito para a próxima sessão não presumir que foi lida.

**Um padrão de acessibilidade foi seguido sem referência externa nova:** o `prefers-reduced-motion`
que o `aurea.css:2128` já aplica globalmente na web virou o hook `useReduceMotion` aqui, porque no
React Native não há cascata para aplicá-lo.

---

## Lote 3 do alvo nativo — 08/09/2026

**Nada de terceiro foi copiado, e nenhuma dependência nova entrou** — o `RefreshControl` é do
próprio React Native. As duas leituras foram as mesmas do Lote 2, e desta vez a segunda foi mais
decisiva que a primeira:

| lido | o que se extraiu |
|---|---|
| `packages/core/src/aurea.css` | `.topbar` 81, `.bottom-nav` 270, `.bottom-nav-item` 273, `.bottom-nav-mark` 306, `.bottom-nav-badge` 310, os sete indicadores 360–397, `.nav-list` 405, `.nav-list-row` 416, `.stepper` 1141, `.step-dot` 1145 |
| `packages/contracts/registry/*.json` | **o campo `a11y.apg` das quatro fichas** — e é ele, não o CSS, que decidiu este lote |
| `packages/react/src/navigation-client.tsx` | a estrutura e a razão da caixa que ancora o contador (linha 336) |

**A ficha do `BottomNav` é a referência que mais pesou, e ela não desenha nada.** O campo `a11y.apg`
dela escreve, em inglês, a decisão de NÃO adotar o padrão de abas — *"a tab swaps a panel inside
the page, a bottom bar changes page. Giving `role=tablist` to a menu makes the screen reader
promise arrow keys that lead nowhere."* O React Native **tem** `accessibilityRole="tab"`, então
esse erro estava a uma palavra de distância, e sem essa ficha ele teria sido cometido com a
consciência tranquila. Há um teste cujo único trabalho é reprovar aquela palavra.

A ficha do `NavList` decidiu a segunda: **ele não tem item corrente** — *"there is nothing to be
'current' in a list you enter and come back from"* —, então não existe `current` aqui, e não é
lacuna.

**A pasta `Referencia/` não foi consultada:** ela está no `.gitignore` e não existe no ambiente
onde este lote foi construído. Fica dito para a próxima sessão não presumir que foi lida.

---

## Lote 4 do alvo nativo — 08/09/2026

**Nada de terceiro foi copiado, e nenhuma dependência nova entrou** — o `TextInput`, o `Modal`, o
`Platform` e o `KeyboardAvoidingView` são todos do próprio React Native. As duas que o lote exigia
**não entraram**, e é por isso que ele parou em 11 de 13 (ver `NATIVE.md` §7).

| lido | o que se extraiu |
|---|---|
| `packages/core/src/aurea.css` | `.field` 672, `.label` 683, `.input/.select` 685, `.textarea` 694, as três medidas 831–832, `.form` 861, `.checkbox/.radio` 863, `.control-mark` 871, o visto 877, o ponto 878, `.switch-track` 882, o polegar 894, `.segmented` 922 |
| `packages/contracts/registry/*.json` | o campo `dependencies.engine`, que **corrigiu a premissa do lote** |
| `packages/react/src/inputs-client.tsx` | o `Field`, e o que ele resolve na web — `useId`, elemento rotulável, os três casos de "não dono" |

**A medição que mais mudou o lote foi de um campo de metadado, não de código.** O `NATIVE.md`
dizia *"sete dos treze são Base UI"*; rodando o `dependencies.engine` nas dez fichas, **são
dois**. O sete era da família de campo do Base UI (§5.2.4), que inclui quatro componentes fora
deste lote. O documento estava errado desde 31/08 e ninguém tinha rodado o comando.

**E a leitura do fonte decidiu o desenho do `Field`**, mas por subtração: a maior parte do que ele
faz na web — ligar `<label for>` a um `id`, detectar elemento rotulável, cair para `role="group"`
quando não dá — **não tem par no React Native**, onde o nome de um controle é uma string nele
mesmo. O que sobrou virou a decisão do lote: empurrar nome, dica e estado de inválido por
contexto.

**A pasta `Referencia/` não foi consultada:** está no `.gitignore` e não existe neste ambiente.

**Duas dependências foram MEDIDAS no registro e o Victor AUTORIZOU AS DUAS**, no mesmo dia — o
`BUILDING.md` §3 mandou parar, e a parada durou o tempo de ele responder:

| peer opcional | licença | medido no registro | o Expo SDK 57 fixa | para quem |
|---|---|---|---|---|
| `@react-native-community/datetimepicker` | MIT | 9.2.1 | 9.1.0 | `DatePicker` |
| `expo-image-picker` | MIT | 57.0.16 | ~57.0.15 | `PhotoInput` |

As duas vêm no Expo Go, e as duas entraram como **peer opcional** (`peerDependenciesMeta`): quem
não usa data nem câmera não instala nada e não vê aviso.

⚠ **Eu recomendei adiar a câmera e ele mandou fazer** — fica registrado porque a recomendação
continua tendo razão sobre *o que* ela é: câmera não é componente, é fluxo (permissão, intent,
prévia, negação). O que mudou foi o tratamento: em vez de esconder as escolhas de fluxo no código,
cada uma virou padrão **declarado** com uma saída — a tabela está no `packages/native/README.md` e
no comentário do `PhotoInput`.

**A leitura das duas foi de API, não de aparência** — nenhuma linha de terceiro foi copiada:

| lido | o que se extraiu |
|---|---|
| `@react-native-community/datetimepicker` (README + tipos) | que **as plataformas divergem**: `DateTimePickerAndroid.open()` é imperativo, `<RNDateTimePicker>` é declarativo. E que o cancelamento do Android chega como `type: "dismissed"` no mesmo callback do `set` |
| `expo-image-picker` (README + tipos) | `getCameraPermissionsAsync` / `requestCameraPermissionsAsync`, e o campo **`canAskAgain`** do `PermissionResponse` — é ele que separa "negou agora" de "negou de vez" |

**A aparência é 100% nossa nos dois.** O `DatePicker` é o gatilho do `Input` (mesma altura, mesma
borda, mesmo raio) e só o **diálogo** é do sistema — de propósito: data é um controle que o
Android e o iOS fazem melhor e que a pessoa já sabe usar. O `PhotoInput` é `Card` + `IconButton` +
miniatura; do `expo-image-picker` vem só o `uri`.

**E os dois saem por `@aurea-uds/native/system`, não pelo barril** — mesma cláusula do
`./icons/*` (ADR-0038): módulo que ninguém importa não entra no grafo do Metro, então um app que
só usa `Button` não arrasta o seletor de data nem a câmera, e não quebra na resolução por não ter
os peers opcionais. **Isto não é otimização: é o que faz "opcional" ser verdade.**

## Lote 5 do alvo nativo — 08/09/2026

**Nada de terceiro foi copiado, e nenhuma dependência nova entrou** — o `Modal`, o `PanResponder`
e o `Animated` são todos do próprio React Native.

**A leitura que mais valeu não foi de referência de design: foi do FONTE DO REACT NATIVE.**

| lido | o que se extraiu |
|---|---|
| `packages/contracts/registry/{Dialog,ConfirmDialog,Drawer,useToast}.json` | o campo `dependencies.engine` — os quatro **são** Base UI, e desta vez o `NATIVE.md` estava certo. O contrário do Lote 4, e é por isso que se mede dos dois lados |
| `packages/core/src/aurea.css:1574-1598` | as medidas: `.dialog` min(560), `.dialog-confirm` min(420), `.drawer` min(480)/92vw, `.toast` raio LG + sombra MD + os `.28s` |
| `packages/react/src/overlays.tsx:21-65` | **a decisão inteira do `ConfirmDialog`** — clicar fora não fecha, o foco nasce no botão seguro, a ordem é cancelar→agir. Nada disso está no CSS |
| `packages/react/src/system.tsx:64-66,119-130` | que o `useToast` da web é um envelope de duas linhas sobre o gerente do Base UI — ou seja, **o gerente é o trabalho**, e ele não atravessa |
| `react-native@0.87.1` `Libraries/Components/View/ViewAccessibility.d.ts:188-228` e `:60-…` | que `accessibilityRole` e `role` são listas DIFERENTES, e que só a segunda tem `dialog` |
| `react-native@0.87.1` `ReactAndroid/…/ReactAccessibilityDelegate.kt:515` | **o achado**: `fromRole()` cai em `else -> null` para `dialog`, `alertdialog`, `banner`, `navigation` e `group`, com o comentário do próprio RN *"No mapping from ARIA role to AccessibilityRole"* |
| `react-native@0.87.1` `React/Fabric/…/RCTViewComponentView.mm:1512` + `accessibilityPropsConversions.h:24-104` | a confirmação no iOS: a string de `role` só desempata `checkbox` e `radio`; não há trait de diálogo |
| `react-native@0.87.1` `Libraries/Modal/Modal.d.ts:34-38` | que `onRequestClose` é **obrigatório** — palavras do RN, não nossas |

**O achado corrige uma frase do Lote 3, e a correção é mais dura que o original.** O Lote 3
escreveu que `role="banner"` e `role="navigation"` *"não existem"* no RN. Medido agora: **existem
no tipo, e não existem no mapeamento.** A conclusão dele estava certa; a razão, não. E a forma
verdadeira é pior — porque um papel que não existe reprova no `tsc`, e um papel que existe e não
mapeia **passa em tudo** e é inútil no aparelho.

**Uma dependência foi CONSIDERADA e recusada, e a recusa é a decisão do `BottomSheet`:**
`@gorhom/bottom-sheet` é a biblioteca conhecida do assunto e arrastaria **duas** peças novas
(`react-native-gesture-handler` e `react-native-reanimated`) para um gesto de **um eixo**. O
`PanResponder` do próprio RN resolve. O custo está declarado no README e no JSDoc: o gesto roda na
ponte de JS, não na thread de UI — se engasgar numa lista longa dentro da folha, a troca é uma
ADR, não um remendo.

**A pasta `Referencia/` não foi consultada:** está no `.gitignore` e não existe neste ambiente.

## Lote 6 do alvo nativo — 09/09/2026 · **o último do plano**

**Nada de terceiro foi copiado, e nenhuma dependência nova entrou** — o `FlatList` e o
`useWindowDimensions` são do próprio React Native.

| lido | o que se extraiu |
|---|---|
| `packages/contracts/registry/{Timeline,DataList,Table}.json` | `dependencies.engine: null` nas três — este lote não tem motor headless nenhum. O trabalho é de semântica e de lista longa |
| ficha do `Timeline` | *"a ordem É a informação, e um leitor de tela anuncia a contagem e a posição de graça"* — a frase que decidiu **não** anunciar posição aqui, porque o "de graça" não atravessa |
| ficha do `DataList` | *"a ligação entre termo e valor vive na marcação e sobrevive com a folha de estilo desligada"* — no RN não há marcação nem folha, então a ligação virou o `accessibilityLabel` do par |
| ficha do `Table` | que a região é focável *"so a table wider than the screen can be scrolled with the keyboard, not only by dragging"* — **e no toque não há teclado**, o que derruba a metade que sustentava a grade |
| `packages/core/src/aurea.css:1221-1245` | as medidas, e **dois defeitos já pagos**: o valor resolvendo em `0px` a 320px (:1224) e o *"Shipped14:20"* de título colado no horário (:1240) |
| `packages/core/src/aurea.css:1183` | o `min-width: 720px` da `.table` — o número que torna a grade inviável num telefone de 360dp |
| `react-native@0.87.1` `ViewAccessibility.d.ts:188-228` + `ReactAccessibilityDelegate.kt:544` | que `table` **não está** em `accessibilityRole`, está em `role`, e cai em `else -> null`. É a mesma armadilha do Lote 5, agora decidindo o desenho de um componente inteiro |

**A medição que decidiu o lote foi a soma de duas.** Nem "o papel não mapeia" nem "a grade não
cabe" bastariam sozinhas: a primeira sozinha permitiria uma grade sem semântica, a segunda sozinha
permitiria uma lista que perde a semântica de tabela. Juntas elas mostram que **a grade perde a
leitura sem ganhar nada** — e aí virar lista deixa de ser troca e passa a ser a única forma com as
duas coisas.

**Nenhuma dependência foi considerada.** Não houve o que considerar: não há motor a trazer.

**A pasta `Referencia/` não foi consultada:** está no `.gitignore` e não existe neste ambiente.

## O `Chart` do alvo nativo — 09/09/2026 · **a única peça cuja geometria é nossa**

**Nada de terceiro foi copiado, e nenhuma dependência nova entrou.** Este é o primeiro componente
do pacote em que a leitura de referência não decidiu a APARÊNCIA — ela decidiu **não adotar um
motor**.

| lido / rodado | o que se extraiu |
|---|---|
| `packages/react/src/chart.tsx` (79 linhas) | que o `Chart` da web **não desenha** — a ficha diz *"the engine draws, this component holds"*. O que parecia uma porta de 79 linhas é, no nativo, um motor inteiro |
| `packages/contracts/registry/{Chart,ChartTooltip,ChartLegend}.json` | as três dependências de `recharts`; que o tooltip *"segue o ponteiro e não é focável"*; e que a acessibilidade é *"the engine's accessibility layer"*, por setas do teclado — **as três caem no toque** |
| `packages/core/src/aurea.css:1329-1344` | `--chart-h` 220, a grade em `--border`, o texto em `--muted-foreground`/`--text-xs`, a amostra de 9×9 com raio `sm` |
| `apps/catalog/content/patterns/Chart.mjs` | **o uso real da paleta**: `--chart-2` e `--chart-4`, pulando um degrau |
| `npm view` em quatro bibliotecas | o que cada uma arrasta — a tabela está na ADR-0041 |
| validador de paleta (`dataviz`) | que `--chart-1..5` é uma **rampa de um azul**: pares vizinhos medem ΔE 5.9 na visão normal e 5.2 no daltonismo, os dois abaixo do piso |

**A medição que mais mudou o trabalho foi de uma biblioteca que NÃO entrou.** O
`react-native-chart-kit` não traz peer nativo nenhum — se o critério fosse peso, ele ganhava. Ele
cai por FORMA: é `<LineChart data={…} chartConfig={…}/>`, dados entram e gráfico sai, enquanto o
`recharts` é `<AreaChart><Area stroke=… /></AreaChart>`, marca composta. **Adotá-lo não
reproduziria a relação da web; inverteria ela** — lá a Aurea segura e o motor desenha com as props
dela.

⚠ **E duas afirmações de memória foram desmentidas pelo comando**, o que é o motivo de a regra
existir: `victory-native` e `react-native-chart-kit` estão **vivas** (publicadas em 31/08 e
06/09/2026). "Abandonada" teria sido escrito com a mesma confiança e estaria errado. A única velha
de fato é a `react-native-svg-charts`, cujo peer é `react-native-svg ^6||^7`.

⚠ **A acusação sobre a paleta também precisou ser duvidada, e quase saiu errada.** Medidos os cinco
degraus juntos, ela reprova como categórica. Medido o par que o catálogo REALMENTE usa, ela passa
no critério de daltonismo. **A web não está quebrada** — ela usa dois degraus espaçados e tem
legenda sempre, que é o alívio prescrito. O que a medição produziu não foi uma correção na web: foi
uma **restrição** no nativo, e ela virou a prop que não desliga.

**Método:** o guia de visualização de dados (`dataviz`) foi lido antes da primeira linha de código
e emprestou o método — a ordem "forma → cor → validar", o piso de ΔE, a base da barra no zero, o
vão entre marcas, a lista de valores como camada de acessibilidade. **A paleta dele NÃO entrou:**
os parâmetros de cor são os tokens da Aurea, que são intocáveis. É exatamente o encaixe que o
próprio guia descreve.

**A pasta `Referencia/` não foi consultada:** está no `.gitignore` e não existe neste ambiente.

## Lote 7 do alvo nativo — 11–12/09/2026 · **a referência que eu não abri, e o que ela achou**

`Combobox`, `SearchField`, `NumberField`, `Image`, `Gallery`.

### 🔴 Este registro começa por um defeito de MÉTODO, não de código

**Os cinco foram escritos sem abrir referência nenhuma.** Em 11/09 eu li o código web da própria
Aurea e o fonte do `react-native@0.87.1`, e construí. O `BUILDING.md` §2 manda o contrário, em
sete passos, e o passo 2 é *"consultar o componente nas quatro"*.

A desculpa parcial é real e já está registrada no fim da entrada do `Chart`: **a pasta
`Referencia/` está no `.gitignore` e não existe nestas sessões.** Medido: `ls -d Referencia`
devolve ausente.

**Mas ela não cobre o que aconteceu.** O inventário da **HeroUI** estava DENTRO do repositório,
versionado, medido e pronto:

| | |
|---|---|
| `audit/activity-2/INVENTORY-HEROUI.json` | 83 KB · **85 componentes** |
| `audit/activity-2/15-INVENTARIO-HEROUI.md` | método e achados |
| medido em | 22/08/2026, sobre `@heroui/react` **3.2.4** + `@heroui/styles` 3.2.4 |
| licença | **Apache-2.0** — uma das duas que o `BUILDING.md` §1 autoriza copiar literalmente |

Não precisei de rede, nem da máquina do Victor, nem da pasta ausente. Bastava abrir um arquivo.
**Eu só o abri em 12/09, depois de o Victor cobrar três vezes** — e aí ele achou um defeito em
minutos. As palavras dele: *"HeroUI em designer é referência máxima"*.

⚠ **E o defeito já estava PUBLICADO** na `0.8.0` quando foi encontrado.

### O que foi lido, e o que foi medido

| Fonte | O que ela devolveu |
|---|---|
| `INVENTORY-HEROUI.json` · `number-field` | anatomia `Root · Group · Input · IncrementButton · DecrementButton`; estados `disabled · focus-visible · **focus-within** · hovered · invalid · pressed` |
| idem · `search-field` | `Root · Group · Input · ClearButton`; estados `disabled · **empty** · focus-within · hovered · invalid` |
| idem · `autocomplete` | `Popover · **Filter** · Value`, sobre `Select` + `Popover` do React Aria; estados com `empty`, `open`, `placement` |
| idem · `combo-box` | **é OUTRO componente**: `ComboBoxTrigger · ComboBoxPopover`, sobre `ComboBox` do React Aria. Eles têm os dois |
| idem · busca por `image` e `gallery` | **não existem nos 85.** Para esses dois não há referência HeroUI — é medição, não desculpa |
| `packages/core/src/aurea.css` | a geometria, linha a linha (`:685` campo · `:705-706` number-field · `:741-743` input-group · `:1434-1436` image · `:1448-1459` gallery) |
| `react-native@0.87.1`, fonte | o mapeamento real de `accessibilityRole` — `ReactAccessibilityDelegate.kt:461,680` e `RCTConversions.h:120` |

### O que a referência ACHOU — e a Aurea estava errada

**O `NumberField` nasceu sem estado de foco nenhum.** A HeroUI tem `focus-within` no Group deles;
a Aurea tem foco no `Input` (`inputs.tsx:344`), no `Textarea` e no `SearchField`
(`busca.tsx:520`). **O `NumberField` era o único campo de texto do pacote sem.**

No telefone o foco é a única pista de qual campo o teclado está alimentando — e isso já estava
escrito no `Input` do Lote 4 desde 08/09. Não foi aplicado.

Passou por **47 testes, pelo `validate.py`, pelo build, pelo `check-pack` e pela publicação.**
Nenhum deles pergunta "este componente é consistente com os irmãos dele?".

✅ Corrigido em 12/09, com **três testes**, provados contra o defeito em três mutações: sem o
estado (as três reprovam), com a ordem invertida (o inválido venceria o foco), e sem limpar no
blur (o campo ficaria aceso para sempre).

### O que NÃO entrou da HeroUI, e por quê

- **`variant: base/primary/secondary`** — é o sistema de eixos deles (`tailwind-variants`). A Aurea
  tem os seus, e copiar esse seria copiar o sistema de estilo junto.
- **A borda no GROUP do `number-field`.** Lá o `Group` carrega a caixa e o `Input` fica nu dentro.
  Aqui o `.number-field-group` (`aurea.css:705`) é só `inline-flex` + `gap`, e quem tem borda é o
  `.input`, com os botões **fora**. **O estado que faltava é deles; a geometria continua nossa.**
- **`combo-box` e `autocomplete` como dois componentes.** O nativo entrega um, e ele é o
  `autocomplete` deles — gatilho tipo select + folha com filtro. Escopo menor que a referência é o
  passo 5 do `BUILDING.md`.
- **Nenhuma linha literal entrou** — nem de código, nem de token, nem de SVG. A licença Apache-2.0
  permitiria, sob ordem do Victor; ela não foi dada e não foi usada.

### Limite declarado desta entrada

O inventário é **anatomia e eixos**, extraídos dos pacotes publicados. Ele **não** traz o corpo do
componente: não dá para saber daqui como a HeroUI resolve teclado, ordem de foco dentro do popover
ou caso de borda de digitação. Para isso é preciso o fonte, que exige a pasta ausente.

**As outras seis referências do `BUILDING.md` §1 continuam não consultadas.**

## Tipografia — `Text`, `Heading`, `Paragraph` e `Code` — 25/09/2026 · B-02

**Referência:** o HeroUI, por ordem do Victor de 25/09/2026 (*"HeroUI sempre vamos dar prioridade
a ele"*). Lido no pacote publicado, baixado com `npm pack`, não de memória. Nenhuma linha copiada:
a Aurea tira a FORMA e reescreve com os próprios tokens.

| lido | onde | o que a Aurea tirou |
|---|---|---|
| `@heroui/react` 3.2.6 · `components/typography/typography.d.ts` | a API da web | `Typography` com `type`, `align`, `color`, `weight`, `truncate`; `Heading` com `level` 1–6 (o nível é elemento **e** tamanho, sem `size` à parte); `Paragraph` com `size` `base`/`sm`/`xs`; `Code`. O `Typography` **não** troca de elemento (`elementType` fica de fora) — o nosso `Text` também não |
| `@heroui/styles` 3.2.6 · `dist/components/typography.css` | os números da web | títulos `4xl`…`base` em seminegrito com `tracking-tight`; texto `base`/`sm`/`xs` com entrelinha 28/24/20; código `sm` mono com fundo e canto |
| `heroui-native` 1.0.10 · `src/components/text/` e `src/styles/components/text.css` | a API e os números do telefone | a MESMA lista de papéis, mas os atalhos recebem `type` (`Heading type="h2"`, `Paragraph type="body-sm"`), e não `level`/`size`; o `Heading` marca `accessibilityRole="header"` sozinho; os números são os da web (o `Typography` dele **não** sobe o degrau que o resto do telefone sobe, ADR-0050) |

**O que ficou nosso:** todos os números saem de token — a escala de letras (ADR-0050), a entrelinha
`--leading-relaxed` (1,7, dando 27/24/20 contra 28/24/20), `--leading-tight` e `--tracking-tight`
(−0,01em, e não os −0,025em do Tailwind) nos títulos, e a pele do código é a do `code` do `.prose`
(`--surface-2`, `--radius-xs`, `--space-05`/`--space-1`). A fonte mono é a IBM Plex Mono do pacote
de fontes, e não o Menlo que o HeroUI Native usa no iOS.

**O que não entrou:** o `Prose` do HeroUI — a Aurea já tinha o dela (L5). E a `color` segue a
lista dele (`default`/`muted`), e não os nove `tone` do `Text` nativo antigo, que fica como está.
