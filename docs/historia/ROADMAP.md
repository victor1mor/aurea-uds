# Aurea — Roadmap por fases

> ⚠️ **ESTE ARQUIVO É HISTÓRIA desde 02/08/2026.** A fila viva é o
> [`PLANO-1.0.md`](../PLANO-1.0.md), e a autorização passou a ser por PARTE. O que está abaixo é o
> registro das fases já executadas: instruções de push, de regeneração de baseline pela CI e
> qualquer "ainda falta" aqui descrevem o dia em que foram escritas, não hoje. O ponto de partida de
> uma sessão nova é o §3 do
> [`04-PROTOCOLO-IA.md`](../../audit/2026-07-26-integral/04-PROTOCOLO-IA.md).

Estado: **trilha Biblioteca** concluída (Fases 0 a 5; a Fase 5 fechou em
18/07/2026). A **trilha Catálogo** correu de 23/07 a 08/08/2026. Cada etapa
de qualquer trilha exigiu autorização ("PODE IMPLEMENTAR").

**A partir daqui quem implementa é o Opus; a Fable audita depois.**
O "Guia de execução" logo abaixo destila o método que produziu as fases
0–4. Segui-lo não é opcional — é o que mantém a qualidade igual.

Regra geral: toda fase termina com `python scripts/validate.py` OK,
docs e exemplo vanilla sem erros de console, conferência visual nos dois
temas, commits pequenos e push. Rollback padrão: `git revert` por commit.

---

## Guia de execução — para o Opus

As **Notas de execução** de cada etapa são o material da auditoria da
Fable. Escrever cada etapa já pensando no auditor: o que pesquisou, o que
decidiu, por quê, o que quebrou e como provou que fechou.

### Ciclo de UMA etapa (uma etapa por sessão, nunca duas)

1. **Pesquisar antes de codar.** O que a etapa manda checar + sempre:
   versão atual da lib, se é mantida, CVEs, se o padrão foi deprecado.
   "A lib tem o recurso X?" se responde **medindo no pacote instalado**
   (inspecionar exports/subpaths — método das etapas 3 e 5 da Fase 4),
   nunca de memória de treino.

2. **Decidir e registrar.** Toda decisão não óbvia entra nas Notas de
   execução com motivo e data (formato das fases 1–4). Escada de
   preferência: plataforma nativa > lib já instalada > lib nova.
   Lib nova só quando a etapa autoriza explicitamente. Beta não se adota
   (precedente: TanStack v9 beta recusado na etapa 6).

3. **Implementar o mínimo.** Presentational primeiro, estado interno;
   controlável de fora só com demanda real. Sem API própria onde a lib
   já tem uma (precedente: DataGrid re-exporta `ColumnDef`). Sem wrapper
   que é só alias (precedente: DatePicker = `<Input type="date">`).

4. **Fechar os gates** (checklist abaixo). Bug achado pelo gate é bom
   sinal, não vergonha — registrar nas notas como nas fases 3/4.

5. **Commit pequeno** no padrão do histórico
   (`feat: Fase N etapa M — nome (decisão-chave)`). Push só no fim da fase.

### Gates de toda etapa — checklist

- `python scripts/validate.py` OK (rodar após QUALQUER alteração;
  ele também pega vazamento de nome privado).
- Docs e exemplo vanilla abrem sem erro de console.
- Conferência visual nos DOIS temas (e RTL se o CSS tocar eixo inline).
- Teste de interação (Testing Library) do código NOSSO novo. Widget
  nativo do browser não se testa (decisão da etapa 5 da Fase 4).
- Baselines Playwright: se o markup dos docs mudou, provar com
  `git diff` que o `<style>` ficou byte-idêntico e SÓ ENTÃO regerar
  (armadilha da etapa 0). Registrar nas notas quais seções deslocaram.
- Notas de execução escritas no ROADMAP, dentro da etapa.

### CSS — o que a auditoria pega

- Espaçamento novo SÓ com `var(--space-*)` (tabela na Fase 4).
  **Não tocar** nos 239 pixels crus existentes.
- Identidade intocável: raio 22px em card/dialog, pill nos controles,
  amarelo primário invariável, IBM Plex, Carbon, sem gradientes.
  Nenhum token novo sem falar com o Victor.
- Classe nova segue idioma existente. Já decidido: linha de
  lista/menu/tree usa `--radius-sm` (pill em linha clampa e vira oval —
  bug real da Fase 3); seleção usa 14% de primary (tree/datagrid).
- Conteúdo demo usa nomes genéricos: Messenger, Analyst, Curator,
  Writer.

### A11y — o que a auditoria pega

- Padrão APG primeiro. Onde o APG não cobre, pesquisar a prática atual
  e REGISTRAR a decisão com motivo (precedentes: feed da etapa 4,
  `aria-sort` só no th ordenado da etapa 6, `aria-labelledby` do
  treeitem da etapa 3).
- Roving tabindex em coleções; nome acessível em gatilho só-ícone;
  chegada de item anunciada por live region SEPARADA do painel.

### Exceções de processo registradas (auditoria 18/07, M10)

O processo acima ("uma etapa por sessão, Notas por etapa, commit por etapa,
push por fase") teve desvios reais no histórico. Registrados, não escondidos:

- **Fase 4 etapa 2 (FileInput) sem Notas de execução** no ROADMAP — a etapa
  foi implementada e comitada sem o bloco de notas que as outras têm. Débito
  documental; reconciliar se a etapa for revisitada.
- **Commit `08d0145` juntou duas sessões** (etapa 7 sessões 3 e 4) num só
  commit, contra "commit por etapa/sessão".
- **Push antes do fim da fase:** `f22be48` (Fase 5.2) foi pra `origin` antes
  de a Fase 5 fechar, contra "push só no fim da fase".

Efeito prático: nenhum dano ao código; é divergência de disciplina de
processo. A regra segue valendo; estes são os casos onde não foi seguida.

---

# Trilha Catálogo — em execução (desde 23/07/2026)

**Numeração — a dúvida D1 do `FASE-6-BRIEF.md`, resolvida na prática.** São
DUAS trilhas, cada uma com sua contagem:

- **Trilha Biblioteca** = as Fases 0 a 7 deste arquivo (construir a biblioteca).
  Fases 0–5 fechadas; `Extensions` e `Platforms` seguem como fases futuras dela.
- **Trilha Catálogo** = as 5 fases da ordem macro do `AUREA.md` §5 (organizar e
  publicar o que a biblioteca virou). É a que está em execução.

As duas contagens NÃO se misturam: "Fase 3" sozinho é ambíguo — sempre dizer a
trilha. Nada aqui renumera o histórico; renumerar quebraria as referências de
commit das fases antigas.

## Fase 1 (Catálogo) — Registry ✅ (23/07/2026)

O keystone do `AUREA.md` §2.3. Ficha de registry para os **59 componentes que
existiam então** — nenhum é exceção (§2.0). Contagem atual: `STATE.md`. Eixo `layer` (`Foundation · Primitive ·
Component · Composite · Shell`) e allowlist de categorias sem `Other` passaram a
valer no gate. Commit `f1be243`.

## Fase 2 (Catálogo) — Inglês + lacunas do MVP ✅ (23–24/07/2026)

Idioma base do produto virou inglês; pt-BR continua disponível como locale
`ptBR`. Rebrand `Aurea UI` → `Aurea UDS` (`@aurea-uds/*`). Os 4 componentes que
faltavam do MVP entraram pelo mesmo padrão dos outros.

| Entrega | Commit |
|---|---|
| defaults en + `ptBR` locale | `7c0a220` |
| README/examples/patterns/demos em inglês | `5a689dd` `a791dc8` `4b4c43a` `b224187` |
| rebrand `Aurea UI` → `Aurea UDS` | `9da0915` |
| QRCode (dots redondos, sem lib nova) | `bcdc794` |
| Status · Sidebar · Topbar + responsividade enraizada | `f16b357` `2510639` |
| baselines Playwright regeneradas após o rebrand | `cb2476d` |

## Fase 3 (Catálogo) — Catálogo dogfooded 🔄 (em andamento)

Substitui o `apps/docs/index.html` escrito à mão. Gerado por
`scripts/build-catalog.mjs`: SSR estático com `react-dom/server`, **sem
framework** — 63 páginas de componente + índice à época (contagem atual em
`STATE.md`), que abrem direto do disco.
A moldura é dogfooded (AppShell, Topbar, Sidebar, Badge, Status).

- **Etapa 1** ✅ — catálogo gerado do registry (63 fichas, 27 previews). `402a66d`
- **Etapa 2** ✅ — uma página por componente, page model do Kibo: breadcrumb →
  header → Preview/Code → Installation → Reference → Features → Examples →
  prev/next. Conteúdo rico por componente em `apps/catalog/content/<Name>.mjs`
  (molde: `Button.mjs`); os demais caem no fallback do registry. `eadcaf8`
- **Etapa 3** ✅ — revisão visual, um item por vez, validada pelo Victor: topbar
  flush · scrollbar da lateral · espaçamento e alinhamento da nav · atributo
  `hidden` vencendo nosso CSS · abas 50/50 · caixa de demo de altura igual ·
  seções em superfície · barra do ativo · topo estreito que quebra em vez de
  esconder a navegação. (`1cd54a1` → `c7cd951`)
- **Etapa 4** ✅ — as quatro áreas do vocabulário existem (`fb2406e`): Patterns
  granulares no formato Componente → Variante → Composição, Blocks, Recipes
  (renderizando os `patterns/*.md` que já estavam escritos) e o topo com as cinco
  áreas e contagem vinda dos dados. Isso resolveu a dúvida D1 do brief: um nome,
  um sentido — os patterns de ARQUITETURA do contrato moram dentro de Recipes.
- **Etapa 5** ✅ — comportamento que era do app passou a ser do CORE (`4b7fc85`):
  copiar (`[data-aurea-copy]`), o índice que se marca sozinho, e as abas (setas,
  Home/End) que já existiam e o catálogo reimplementava. `CodeBlock` ganhou
  `copyable`; `TableOfContents` nasceu como componente com ficha. O script do
  catálogo caiu para quatro linhas de cola de tema.
- **Etapa 6** ✅ — o EXEMPLAR fechado (`43890f0`, `959e46f`): `Button` com 11
  variantes (aparência × tom), 5 tamanhos com token de densidade novo (`xs`/`xl`),
  `pressed`, `fullWidth`, `kbd` — que trouxe o componente `Kbd`. Tabela de API
  gerada da ficha (campo `props`, cobrado pelo gate). Uma linguagem só para
  "selecionado" em nav/aba/lista/toggle. Ícone por ficha (campo `icon`, travado na
  allowlist do contrato).
- **Etapa 7** 🔄 — **replicar o exemplar** nos outros 63 componentes, em ondas por
  categoria (Actions primeiro). Por componente: `props` na ficha, conteúdo rico com
  um exemplo por recurso, patterns granulares e a conferência com a referência
  externa. Antes da primeira onda: o gate visual do catálogo, senão cada onda pode
  quebrar as anteriores sem ninguém notar.

**Débito conhecido:**
- **A4 do audit 18/07** — baseline Linux para a CI bloquear regressão de pixel.
  Depende de rodar o Playwright em Linux; esta máquina é Windows.
- `apps/docs/index.html` (manual) coexiste com o catálogo. Aposentar só quando o
  catálogo tiver gate visual E conteúdo completo: hoje o docs é a única superfície
  com baseline de pixel.

## Fases 4 e 5 (Catálogo)

Patterns granulares → Blocks; depois alcance universal. Detalhar no dia — a
ordem macro está no `AUREA.md` §5.

---

## Fase 0 — Estabilização ✅ (concluída)

git + LICENSE Apache-2.0 + lockfile pnpm; purge de nomes privados com
validador forte auto-testado; `aurea.js` do core reescrito (genérico, com
guards, `window.Aurea`); gradientes substituídos (chevron SVG, pulso de
opacidade, donut SVG `pathLength=100`, `color-mix`); toast respeita 320px.

---

## Fase 1 — Fundação ✅ (concluída)

**Objetivo:** fonte única de tokens (DTCG 2025.10), fontes fora do CSS,
`@aurea-uds/react` publicável, CI mínima.

**Etapas, em ordem:**

1. **Tokens DTCG.** Converter `packages/tokens/src/aurea.tokens.json` para
   o formato DTCG 2025.10 (`$value`/`$type`; tipos: color, dimension,
   fontFamily, duration, cubicBezier, shadow, number). Valores IDÊNTICOS —
   nenhuma mudança visual. Manter as escalas históricas (aether/oracle/
   ember) — são primitivos de marca documentados. Renomear o arquivo para
   `aurea.tokens.json` mantendo export `./json`.
2. **Gerador de CSS.** `scripts/build-tokens.mjs` (Node, sem dependências;
   Style Dictionary só se o custo compensar) lê o DTCG e emite
   `packages/tokens/dist/aurea.tokens.css` (`:root`, `[data-theme="dark"]`,
   `[data-theme="light"]`, `[data-density="*"]`). Gate: os VALORES gerados
   devem ser idênticos aos atuais (diff permitido só em formatação).
3. **Desduplicar o core.** `packages/core/src/aurea.css` perde o bloco de
   custom properties duplicado. O build (`scripts/build-core.mjs`) concatena
   tokens CSS + fontes? NÃO — fontes saem (etapa 4); concatena
   `tokens/dist/aurea.tokens.css` + componentes → `core/dist/aurea.css`
   continua um arquivo único standalone para consumidores.
   O validador troca o check "dist == src" por "dist == build".
4. **Pacote de fontes.** Criar `packages/fonts`: decodificar os 11 base64
   do CSS para `files/*.woff2` reais + `dist/fonts.css` com `url()`
   relativos + export `./css`. Core CSS deixa de embutir fontes (~110KB
   finais). Docs continuam standalone (mantêm base64 inline — não mexer).
   README: instruir `@aurea-uds/fonts/css` antes do core.
5. **Build do React.** `packages/react`: tsconfig strict (TS7), `tsc`
   emitindo ESM + `.d.ts` em `dist/`; package.json com `exports` map,
   `types`, `sideEffects: false`, `files: ["dist"]`. Registrar em
   `ROADMAP.md` qualquer incompatibilidade do tsc nativo.
6. **CI.** `.github/workflows/ci.yml`: pnpm install → validate.py →
   build tokens/core/react → falhar se `git status` sujo após builds
   (dist desatualizado) → smoke: `node -e "import('...')"`.

**Arquivos afetados:** packages/tokens/*, packages/core/*, packages/fonts/*
(novo), packages/react/*, scripts/build-*.mjs (novos), scripts/validate.py,
.github/workflows/ci.yml (novo), README.md, package.json raiz.

**Riscos:** divergência de valores na regeneração (mitigar com script de
comparação token a token antes de trocar); ordem de variáveis CSS afeta
fallbacks `var()` encadeados — preservar ordem; paths de fontes relativos
quebrarem em bundlers — testar com `npm pack` + projeto de teste.

**Aceite:** validate OK; docs visualmente idênticos; `npm pack` dos 4
pacotes instala num projeto Vite de teste e `Button`+`Card` renderizam com
fonte e tema corretos; CSS do core ≤ 120KB; CI verde.

**Testes:** comparação token a token (script, gate automático);
`tsc --noEmit`; consumo real via `npm pack`; validate.py; browser.

**Notas de execução (Fase 1):**

- TypeScript **7.0.2** (nativo/Go) via `tsc` CLI. Build do `@aurea-uds/react`
  (strict, `jsx:react-jsx`, `module:ESNext`, `moduleResolution:bundler`)
  emitiu ESM + `.d.ts` sem erros; saída revisada e correta (sem
  incompatibilidade bloqueante). `newLine:"lf"` fixado para o emit ser
  reprodutível entre Windows/Linux (gate de git-limpo da CI). Sem API
  programática estável até 7.1 — só CLI, conforme decidido.
- Tokens: valores idênticos ao CSS anterior; diffs só de formatação
  (zeros normalizados, alpha `%`→fração). DTCG 2025.10 não tem módulo de
  tema estável (Resolver/modes é draft): grupos base/theme/density mapeados
  a seletores e referências emitidas como `var()` runtime; `shadow: none`
  representado como lista vazia.
- Seletor de tema/densidade no core passou de `html[data-*]` para `[data-*]`
  (vindo do pacote tokens): analisado e verificado como sem efeito visual.

---

## Fase 2 — Primitives ✅ (concluída)

**Objetivo:** comportamentos acessíveis reais via **Base UI**
(`@base-ui/react`, decisão do Victor), visual 100% Aurea.

- Adicionar Base UI como dependência do react pkg (avaliar versão atual e
  changelog antes — research-first).
- Reconstruir sobre Base UI mantendo as classes CSS atuais: Dialog, Drawer,
  Tooltip (real), Popover, Menu, Tabs, Toast API. Ids únicos via `useId`;
  portal; focus trap; Escape; restauração de foco; scroll lock.
- `AureaProvider` com strings pt-BR default (i18n mínima — remove os
  textos hardcoded de Pagination/Dialog/etc.).
- Aceite: navegação por teclado completa em todos os overlays; axe-core sem
  violações nos exemplos; paridade com o comportamento dos docs.

**Notas de execução (Fase 2):**

- **Base UI 1.6.0** (`@base-ui/react` — o pacote foi renomeado de
  `@base-ui-components/react`; 1.0 GA em 11/12/2025). `date-fns`/`@date-fns/tz`
  são peers **opcionais** (só componentes de data) — não instalados.
- **Drawer** usa o `Dialog` da Base UI estilizado como painel lateral. O
  `Drawer` nativo (1.6) traz swipe/snap-points cujo transform conflita com o
  CSS fixo do `.drawer`; o Drawer Aurea é painel simples. Mesma acessibilidade.
- **Toast — armadilha:** a lista de toasts precisa ser renderizada por um
  componente *dentro* de `<Toast.Viewport>`. Mapear `useToastManager().toasts`
  no componente-pai e passar como children deixa o viewport vazio (sem erro).
- **Tabs:** o atributo de seleção é `data-active` (não `data-selected`);
  `activateOnFocus` fica em `Tabs.List` (não em `Root`) e o default da Base UI
  é ativação manual — Aurea liga `activateOnFocus` (seta troca a aba direto).
- **Tooltip:** a Base UI não usa `aria-describedby` por design (é hint visual;
  o nome acessível vem do gatilho). Gatilhos só-ícone precisam de `aria-label`.
- Overlays flutuantes (tooltip/popover/menu) usam `z-modal` + ordem do portal
  para funcionarem sobre diálogos, sem tokens novos.
- Classes CSS novas (aditivas, com tokens Aurea): `.dialog-backdrop`,
  `.drawer-backdrop`, `.drawer-left/right`, `.tooltip`, `.popover`, `.menu`,
  `.menu-item`, `.menu-sep`, `.toast-text`. Corrigido: o Dialog do React usava
  `.dialog-backdrop` sem CSS no core.

## Fase 3 — Core completo ✅ (concluída em 17/07/2026)

ContextMenu, ButtonGroup, Toolbar, Banner e Combobox básico (DropdownMenu
saiu na Fase 2). RTL por propriedades lógicas no eixo inline, com zero
mudança em LTR provada por 26 screenshots a `maxDiffPixels: 0`. Vitest 4 +
Testing Library (12 testes) e Playwright 1.61 como gates de CI.

**Decisões tomadas na execução:**

- **Escopo do RTL: só o eixo inline.** O eixo bloco (top/bottom/height) não
  muda com RTL; migrá-lo seriam ~200 edições de risco sem ganho. O CSS ficou
  misto (inline lógico, bloco físico) — que é a norma de mercado.
- **Não espelham, de propósito:** check do `.checkbox` e `.spinner` (glifos
  desenhados com borda); `.map-*` e `.builder-*` (geografia/arte com
  `rotate()` fixo — espelhar os nós sem as arestas quebraria o desenho);
  `.drawer-left`/`.drawer-right` (o nome promete lado físico).
- **Sem forma lógica** (bloco 12 do CSS, via `:dir(rtl)`):
  `background-position` do chevron do `.select` e o `translateX` do knob do
  `.switch`.

**Bugs encontrados pelos próprios gates** (todos corrigidos):

1. `Combobox` usava `Combobox.Label`, que associa ao **trigger** — o input
   ficava sem nome acessível e o label sobrescrevia o `aria-label` do botão.
   Pego pelo Testing Library.
2. Variantes do `Banner` não pintavam: a regra base `.banner` vinha **depois**
   das variantes, e com a mesma especificidade a última vence. Pego pela
   matriz de aceite.
3. `Toolbar` vertical virava um oval: `--radius-control` (999px) clampa em 50%
   da menor dimensão. Agora usa `--radius-lg`.

**Débito registrado — o gate visual não cobre `apps/docs`:** ✅ resolvido na
Fase 4 etapa 0 (os docs passaram a ser gerados a partir do core).

`apps/docs/index.html` era standalone e trazia uma **cópia própria** do CSS
inline, então screenshot dos docs não testava `packages/core` (verificado: uma
mudança de 2px no core passou batido). Por isso `core-css.spec.ts` injetava o
CSS do core sobre o markup dos docs — era ele que gateava o core. A cópia já
divergira: faltavam nos docs os 25 seletores das Fases 2 e 3 (`.menu`,
`.popover`, `.banner`, `.combobox-*`…), e os componentes novos **não estavam
demonstrados nos docs**.

**Baselines de screenshot só existem para win32.** A rasterização de fonte
difere entre SOs; o CI (ubuntu) precisa dos `*-linux.png`. Não deu para
gerá-los aqui (sem Docker, WSL sem distro). O job `visual` roda
`rtl.spec.ts` (compara estilo computado — independe de plataforma) como gate
duro e deixa os screenshots não-bloqueantes até os baselines existirem. Para
criá-los: rodar o CI via `workflow_dispatch` com `update_snapshots=true` e
commitar o artefato `playwright-snapshots`.

## Fase 4 — Aplicações ✅ (concluída em 18/07/2026)

### Etapa 0 — `<style>` dos docs gerado a partir do core ✅ (17/07/2026)

`scripts/build-docs.mjs` regenera o `<style>` como [`@font-face` base64] +
[`packages/core/dist/aurea.css`]. Os docs seguem standalone; as fontes agora
vêm de `packages/fonts` (os 11 base64 re-encodam **idênticos** aos que já
estavam inline — os `.woff2` foram decodificados deles na Fase 1).

**A troca era provadamente segura antes de tocar em qualquer coisa:** os 26
baselines de `docs.spec.ts` (CSS próprio dos docs) já eram **byte-idênticos**
aos de `core-css.spec.ts` (CSS do core injetado no mesmo markup) — as duas
specs eram, literalmente, o antes e o depois da migração. E `docs.spec.ts`
passou a `maxDiffPixels: 0` depois dela.

- `validate.py` ganhou o check docs == build (verificado que **falha** numa
  edição à mão do `<style>`); `build:docs` entrou no `pnpm build`, então o
  gate de git-limpo da CI também cobre.
- `core-css.spec.ts` apagado: a injeção existia só porque os docs não usavam
  o core. Agora `docs.spec.ts` gateia o core direto.
- Demonstrados nos docs: Toolbar (horizontal + vertical), Banner (4
  variantes), Menu (`data-highlighted`/`data-disabled`), Popover, Tooltip e
  Combobox. ButtonGroup e Dialog/Drawer/Toast já estavam.

**Armadilha registrada — qualquer conteúdo novo nos docs churna os 26
baselines.** As alturas do layout são fracionárias, então inserir uma demo
desloca todas as seções seguintes em sub-pixel e o texto rasteriza diferente
(~2% dos pixels), mesmo em seção intocada. Não é regressão: o `<style>` fica
byte-idêntico ao commit anterior e `packages/core` nem é tocado — dá para
provar com `git diff` antes de regerar. Regerar os 26 é o procedimento normal
ao mexer no markup dos docs.

**Ainda não demonstrados** (fora do escopo da etapa 0): classes só do React
(`.dialog-backdrop`, `.drawer-left/right`, `.toast-text` — os overlays dos
docs são vanilla, usam `.overlay`/`.drawer-wrap`) e lacunas pré-existentes das
Fases 0/1 (`.card-raised/interactive/selected/danger`, `.card-title`,
`.badge-info`, `.chart-bar`, `.time-display`).

### Componentes da Fase 4 — uma etapa por sessão

Cada etapa abaixo é **fechada e independente**: uma sessão pega UMA, pesquisa,
implementa, fecha os gates e comita. Não emendar duas numa sessão — sessão
longa gasta token relendo tudo (pedido explícito do Victor, 17/07/2026). A
ordem é recomendação (risco crescente); o Victor pode reordenar.

**Gate de toda etapa** (já é a regra geral do topo): `validate.py` OK; docs +
exemplo vanilla sem erro de console; conferência visual nos dois temas;
teste de interação (Testing Library) do componente novo; baselines de
screenshot regerados (ver a armadilha da etapa 0); commit pequeno. Push só no
fim da Fase 4.

**Antes de escrever qualquer etapa: pesquisar o estado atual** (regra
research-first — versão da lib, se é mantida, CVEs, se o padrão não foi
deprecado). Cada etapa abaixo diz o que checar.

#### Regra de CSS NOVO da Fase 4 — espaçamento tokenizado

Espaçamento **novo** usa `var(--space-*)`, não pixel cru. Motivo: o
`aurea.css` atual tem 239 pixels crus em gap/padding/margin contra 2 usos da
escala — seis medidas diferentes pro mesmo "espaço entre itens", sem ritmo
(o Victor viu nos prints; débito conhecido).

```
 4px→--space-1   8px→--space-2  12px→--space-3  16px→--space-4
20px→--space-5  24px→--space-6  32px→--space-8
```

Valor fora da escala (7px, 10px, 14px…) → arredonda pro mais próximo dela.

- **NÃO tocar nos 239 valores que já existem.** Trocar 7px por 8px muda a
  aparência, e o CLAUDE.md trata a identidade como intocável sem autorização.
  O Victor decide esse débito depois — a regra é só pra pilha não crescer.
- **Densidade:** compact/comfortable/spacious só escalam `--control-h-*`,
  `--row-h`, `--card-pad`, `--section-gap` — **não** os gaps internos. Se um
  componente novo precisa respirar diferente por densidade, isso não sai de
  graça; pensar nisso ao escrever, mas **não inventar token novo sem falar
  com o Victor**.

#### Etapa 1 — Combobox/MultiSelect avançados ✅ (17/07/2026)

Estende o Combobox básico (Fase 3): multi-seleção com chips, opções agrupadas,
carga assíncrona/filtrada. **Pesquisar:** API atual do `Combobox` da Base UI
para `multiple` + fonte assíncrona (o básico já usa `items`+`itemToStringLabel`).
Reusar `.combobox-*`; classe de chip nova se preciso (regra de CSS acima).

`MultiCombobox` em `@aurea-uds/react`. Base UI 1.6.0 (última, mantida): `multiple`
+ `Chips`/`Value`/`ChipRemove`; `Group`/`GroupLabel`/`Collection` para grupos;
`filter={null}`+`onInputChange` para async. Classes novas de chip/grupo com
`--space-*` (pill do sistema); reusa `.combobox-popup/-item/-empty`. Demo estática
nos docs (formulários) + 26 baselines regeradas; 3 testes de interação.

#### Etapa 2 — FileInput / DropZone

Só a UI de entrada — upload real é Fase 5. `<input type="file">` nativo + zona
de arrastar-soltar, lista de arquivos, validação de tipo/tamanho no cliente
(fronteira de confiança: validar de verdade, não só visual). Sem dependência
nova. **Pesquisar:** só padrões de a11y de dropzone (foco, anúncio de arquivos).

#### Etapa 3 — TreeView ✅ (17/07/2026)

Árvore expansível com teclado (setas, Home/End, `aria-expanded`, `role="tree"`).
**Pesquisar:** se a Base UI já tem primitive de árvore (na 1.6 talvez não) — se
não tiver, headless próprio mínimo. Não inventar; medir antes.

`TreeView` em `@aurea-uds/react`. Medido antes: Base UI 1.6.0 não tem tree
primitive (35 componentes; os subpath exports não incluem `tree` — só
`collapsible`/`accordion`/`composite`) → headless próprio mínimo. `role=tree/
treeitem/group` + roving tabindex (só o nó ativo é tabulável); setas, Home/End,
Enter/Espaço; `aria-expanded` nos nós de pasta. Nome acessível por
`aria-labelledby` apontando só o rótulo da linha (senão a leitura engole os
filhos aninhados); o grupo fica DENTRO do treeitem (posse por contenção, sem
`aria-owns`). Setas horizontais respeitam `dir` (em RTL, ArrowLeft expande e
ArrowRight colapsa; chevron espelha via `:dir(rtl)`). Classes novas
`.tree/-group/-item/-node/-twist/-indent/-label` com `--space-*`; a linha usa
`--radius-sm` (não é pill — igual ao `.menu-item`). Indentação por nível é
`padding-inline-start` inline. Demo estática nos docs (dados) + 12 baselines
regeradas (só `dados` e as seções após ela deslocam em sub-pixel); 3 testes de
interação (expandir/colapsar por seta, Enter seleciona + onSelect, roving +
Home/End).

#### Etapa 4 — NotificationCenter ✅ (17/07/2026)

Compõe primitives que já existem (Popover/Menu + Badge + lista): painel de
notificações, lido/não-lido, agrupamento por tempo. Pouco CSS novo — o ganho é
a composição. **Pesquisar:** padrão de a11y de "feed de notificações"
(`aria-live` na chegada, não no painel inteiro).

`NotificationCenter` em `@aurea-uds/react`, presentational (o consumidor é dono do
estado lido/não-lido). Reusa o `.popover` como superfície do painel; compõe
`BasePopover` direto (não o wrapper `Popover`) para pôr o count no gatilho e a
classe `.notification-panel` no popup. **A11y do feed pesquisado e aplicado:** o
painel NÃO é live region — o usuário o revisita no próprio ritmo; a CHEGADA é
anunciada por um `role="status" aria-live="polite"` **à parte** (fora do portal,
sempre montado), detectada por diff de ids desde a montagem (a lista inicial não
dispara, senão despeja o feed todo). Estrutura é `<ul>` por grupo (não
`role="feed"` — este exige `aria-busy`/`aria-setsize`/gestão de foco de scroll
infinito, exagero aqui). Cada não lida ganha ponto visual + prefixo `sr-only`
"Não lida"; o count no gatilho vai no **nome acessível** do botão (o badge visual
é `aria-hidden`). Agrupamento por tempo é do consumidor (campo `group` por item,
agrupado na 1ª aparição) — sem date-fns, sem `Date.now()`, sem timezone. Classes
novas `.notification-trigger/-count/-panel/-head/-list/-sublist/-group-label/
-item/-dot/-item-title/-item-desc/-time/-empty` com `--space-*`; a linha usa
`--radius-sm` (não é pill). Demo estática nos docs (feedback) + 14 baselines
regeradas (feedback + seções após ela deslocam em sub-pixel; nenhuma seção ANTES
mudou — o CSS só adiciona `.notification-*`); 3 testes de interação (count +
grupos + sr-only de não lida, callbacks de item/marcar-todas, estado vazio).

#### Etapa 5 — DatePicker ✅ (17/07/2026)

**Decisão primeiro, código depois.** Avaliar `<input type="date"/"datetime-local">`
nativo estilizado (os docs já usam) vs. componente da Base UI. **Pesquisar:**
se a Base UI tem date component estável na versão atual e o custo dos peers
`date-fns`/`@date-fns/tz` (marcados opcionais na Fase 2). Se o nativo cobre,
usar o nativo (regra: feature de plataforma antes de lib). Registrar a decisão.

**Decisão: nativo.** Medido no pacote instalado (mesmo método da etapa 3): a
Base UI 1.6.0 **não tem date component público** — nenhum export `calendar`/
`date-field`/`date-picker`, só `internals/temporal` + adapters date-fns/luxon
(maquinaria interna instável; Calendar/DateField primitives ainda são issue
aberta, mui/base-ui#1709). Os peers `date-fns`/`@date-fns/tz` seguem **não
instalados**. `<input type="date"/"datetime-local">` com `.input` cobre:
teclado, leitor de tela e localização vêm do browser.

- **Sem componente novo em `@aurea-uds/react`** — `<Input type="date"/>` já é o
  DatePicker; um wrapper seria alias sem valor. Por isso também **sem teste de
  interação novo**: não há código nosso a testar (testar o widget nativo é
  testar o browser).
- **A lacuna real era tema:** em dark, o indicador de calendário nativo ficava
  escuro sobre fundo escuro e o popup do calendário abria claro. Corrigido no
  core com `color-scheme` escopado aos campos (`.input`/`.textarea`/`.select`,
  base dark + override light — mesmo idioma do chevron do `.select`). Escopado
  de propósito: no root mudaria scrollbars da página inteira (aparência
  intocável sem autorização). De carona, dropdown nativo do `.select` e
  scrollbar do `.textarea` também seguem o tema.
- Docs: campo `type="date"` novo + hint registrando a decisão na demo "Data e
  autenticação" (formulários); baselines regeradas (armadilha da etapa 0).
- Reavaliar a Base UI quando Calendar/DateField saírem de `internals` — só se
  surgir demanda real de calendário customizado (range, marcação de dias).

#### Etapa 6 — DataGrid ✅ (17/07/2026)

A mais pesada e a única com **dependência nova**: TanStack Table headless + skin
Aurea (sort, filtro, paginação, seleção). **Pesquisar antes de instalar:** versão
atual do `@tanstack/react-table`, se é mantida, compat com React 19 e com o
`tsc` nativo (TS7). Skin usa `.table`/`.table-region` existentes + CSS novo
tokenizado. Provavelmente a única etapa que encosta no orçamento de uma sessão.

`DataGrid` em `@aurea-uds/react`. **Pesquisado antes de instalar:**
`@tanstack/react-table` **8.21.3** (v8 estável, React 16.8–19; o v9 era
9.0.0-beta.47 em 13/07/2026 — tree-shakável e compatível com React Compiler,
mas API ainda mudando → **não** adotar beta; reavaliar no GA, a migração é
mecânica: `useTable`+`tableFeatures`). O `tsc` nativo (TS7) compilou os types
pesados do v8 **sem erro nem lentidão notável** — nada a registrar.

- Presentational, estado interno (sorting/filtro/página/seleção); controlar de
  fora só quando houver demanda real. `columns` são `ColumnDef` do TanStack
  (re-exportado) — sem API própria de coluna.
- **A11y:** cabeçalho ordenável é `<button>` real; `aria-sort` fica **só** no
  th ordenado (padrão APG). Seleção **não** usa `aria-selected` na `<tr>`
  (inválido em `role=table`) — o estado acessível é o checkbox da linha
  (`GridCheck` interno, com `indeterminate` real no "selecionar todas");
  `data-selected` é só estilo. `onSelectionChange` emite as linhas ORIGINAIS
  via `getPreFilteredRowModel` (seleção sobrevive a filtro e página).
- Pele reusa `.table-wrap`/`th`/`td` e compõe `SearchField` + `Pagination`.
  Classes novas `.datagrid/-sort/-sort-icon/-selcol/-empty` com `--space-*`;
  linha selecionada usa 14% de primary (mesmo idioma do `.tree-node`).
  Ícones: `chevron--sort/-up/-down` (Carbon, já no sprite completo).
- **Bug latente achado de carona:** `.pagination button { width:34px }` esmagava
  os botões de TEXTO (Anterior/Próxima) do `Pagination` React. Fix **aditivo**
  `.pagination .btn { width:auto }` — não muda os botões numéricos dos docs.
- Docs: demo estática em "dados" + 3 símbolos de sort no sprite inline; 12
  baselines regeneradas (dados + seções após; **nenhuma antes mudou** — o CSS
  novo não vazou). 4 testes de interação (sort + aria-sort; seleção com
  indeterminate e originais no callback; filtro global + vazio; paginação).

#### Etapa 7 — Receitas (documentação, pode passar de uma sessão)

Documentar os 23 arquétipos do contrato como composições em `patterns/` —
**documentação, não pacote de código**. 23 é muito pra uma sessão: a primeira
monta a estrutura de `patterns/` + faz algumas; as seguintes continuam. Fazer
por último, quando os componentes das etapas 1–6 existirem pra compor.

**Sessão 1 (17/07/2026) — estrutura + 5 receitas.** `patterns/README.md`
define o formato (front matter `archetype`+`patterns`; seções Composição /
Capacidades / Invariantes / Estados — espelho do `recipeContract`), traz o
vocabulário pattern→blocos (os 17 patterns e quais componentes React/classes
core os realizam) e o índice dos 23. Receitas feitas: `saas_admin`,
`dashboard_bi`, `file_cloud`, `agent_ai`, `booking_calendar` — escolhidas por
exercitarem os componentes das etapas 1–6 (MultiCombobox, FileInput, TreeView,
NotificationCenter, date nativo, DataGrid). `validate.py` ganhou o **check 9**
(front matter da receita ⟷ contrato: archetype existe, nome do arquivo = id,
lista de patterns idêntica; índice do README cita os 23) — verificado que
falha com patterns errados e com índice incompleto. Sem mudança em docs/core/
react → sem baseline nem teste novo. **Restam 18 receitas** — a lista
"Pendentes" do README é a fila das próximas sessões.

**Sessão 2 (18/07/2026, Opus) — 6 receitas.** `public_site`, `docs_cms`,
`catalog_gallery`, `media_streaming`, `workflow_automation`,
`developer_tools`. Arquétipos e patterns lidos do contrato (não de
memória); invariantes citados verbatim em inglês. Só blocos existentes
(conferido contra o CSS do core e os exports do `@aurea-uds/react`):
`media_streaming` compõe `MediaPlayerShell` + `.media-*`/`.queue-list`;
`workflow_automation` usa `.builder-*` com `.builder-outline` como a
paridade de teclado exigida pelo invariant; `developer_tools` marca o
slot do editor como Fase 5.3 (CodeMirror) sem inventar componente.
`validate.py` check 9 OK (front matter bate com o contrato). Índice do
README movido (11 feitas, 12 pendentes). Doc pura → sem baseline/teste.

**Sessões 3 e 4 (18/07/2026, Opus) — 12 receitas, etapa 7 FECHADA.**
Sessão 3: `messaging_social`, `commerce_finance`, `maps_logistics`,
`iot_control`, `project_crm_erp`, `education`. Sessão 4:
`personal_productivity`, `mobile_pwa`, `support_service`,
`regulated_records`, `creative_workspace`, `observability_ops`.
Mesmo método: arquétipos/patterns/invariantes do contrato (não de
memória); invariantes verbatim; só blocos existentes. Notas de decisão
onde o contrato aperta: `commerce_finance` deixa segredo de pagamento
no provedor (a UI Aurea não coleta cartão em claro — regra de fronteira
de confiança); `iot_control` mantém o knob de calibração explícito (o
mundo físico deriva); `mobile_pwa` amarra o piso de 320px ao precedente
do toast (Fase 0). `validate.py` check 9 OK; índice do README com as 23.
Doc pura → sem baseline/teste. **Etapa 7 completa → Fase 4 fechada.**

Regras da receita (o que a auditoria confere):

- Formato do `patterns/README.md` — front matter + as 4 seções na ordem,
  invariantes citados em inglês como no contrato.
- Só compor blocos que JÁ existem (regra do contrato: arquétipo nunca
  cria família nova de componente). Usar o vocabulário
  pattern→blocos do README; se um bloco parecer faltar, a receita
  aponta o mais próximo existente — não inventa.
- Mover cada receita feita no índice do README (Pendentes → Feitas).
- Receita é doc pura: sem baseline nem teste novo. Gate: `validate.py`
  (check 9) + commit por sessão.

Ao fechar as 23, a etapa 7 fecha a Fase 4 → **push da fase**.

## Fase 5 — Creation (requer autorização)

Quatro etapas fechadas, **uma por sessão**, no formato da Fase 4 — o
Guia de execução vale inteiro. Ordem por risco crescente. A única
dependência nova autorizada é a da etapa 3.

### Etapa 1 — MediaPlayer (API React)

O CSS já está completo (`.media-player`, `.media-controls`,
`.media-seek*`, `.media-library*`, `.media-compact`, `.queue-list`…).
Falta o componente: headless próprio sobre `<audio>`/`<video>` nativos —
o motor de mídia é o browser; o componente só liga estado (play/pause,
tempo, buffer, volume) às classes existentes. Sem dependência nova.

**Pesquisar:** a11y atual de media player — o APG não tem pattern
fechado de player; checar prática corrente (nomes dos controles,
atalhos de teclado, `.media-seek` como slider com `aria-valuetext` de
tempo legível).

**Aceite:** play/pause/seek/volume por teclado; estado espelhado nas
classes existentes sem CSS novo estrutural; demo nos docs; testes de
interação dos handlers (o elemento de mídia é do browser — mockar).

**Notas de execução (Fase 5 etapa 1, 18/07/2026, Opus):**

- **`MediaPlayer` em `@aurea-uds/react`**, presentational/estado interno
  (não controlado — controlar de fora só com demanda real). Renderiza um
  `<video>`/`<audio>` nativo (prop `kind`, default video) dentro do
  `.media-player`/`.media-viewport` e liga o estado (playing, tempo,
  buffer, volume, mudo, legenda, tela cheia) aos `.media-*` que já
  existiam. `MediaPlayerShell` segue exportado (wrapper burro).
- **A11y pesquisada (07/2026; o APG não fecha player).** Fontes:
  W3C APG "Media Seek Slider" e accessible.org. Aplicado: controles são
  `<button>` nativos com `aria-label` que TROCA de estado
  (Reproduzir↔Pausar, Silenciar↔Ativar som); a barra é `<input
  type="range">` nativo — slider real, com setas/Home/End vindos do
  browser — e o `aria-valuetext` lê o tempo por extenso ("4 minutos e 16
  segundos de 12 minutos e 34 segundos"), porque o valor cru "256" não se
  entende. Legenda usa `aria-pressed`. **Decisão registrada: SEM atalho
  global de teclado** — cada controle é focável e opera pelo próprio
  elemento nativo, então play/pause/seek/volume por teclado saem sem
  interceptar; interceptar quebraria digitação e não é padrão APG.
- **Sem CSS novo (nem estrutural).** O `<video>` preenche o
  `.media-viewport` por `style` inline NO ELEMENTO (width/height 100%,
  object-fit), não por regra no stylesheet. Prova: `pnpm build` deixou
  `packages/core` e o `<style>` dos docs **byte-idênticos** (git status só
  mostra o pacote react + o teste) → zero baseline Playwright regerado.
- **Sem dependência nova** (a etapa não autorizava). Estado sincroniza por
  eventos de mídia do React (`onPlay/onPause/onTimeUpdate/onVolumeChange/
  onDurationChange/onProgress/onLoadedMetadata/onEnded`); o único listener
  manual é `fullscreenchange` (vem do `document`, não do elemento).
- **Escopo mínimo demonstrável:** play/pause, ±10s, seek+tempo, volume+
  mudo, legenda (só aparece se o consumidor passar `<track>` — detecção
  por `textTracks`), tela cheia (só vídeo). **Deferido de propósito** (o
  CSS continua lá, adicionar é aditivo): velocidade, PiP e o overflow
  mobile (`.media-control-text`/`.media-mobile-menu`/
  `.media-options-popover`) — extras, não exigidos pelo aceite.
- **Bug achado pelo gate (registrado):** `togglePlay` ramificava por
  `el.paused`, que no jsdom fica preso em `true` (e mesmo no browser fica
  atrás do estado) — o botão "Pausar" chamava `play()` de novo. Corrigido
  ramificando pelo estado sincronizado `playing` (fonte: eventos). Bug bom
  de gate: o teste de interação pegou.
- **Tempo por extenso é helper pt-BR embutido** (`spokenTime`, exportado
  p/ teste), não i18n — precedente: `formatSize` do FileInput também tem
  unidades hardcoded. Os rótulos de botão, esses sim, passam pela i18n
  (13 strings `media*` novas em `AureaStrings`/`defaultStrings`).
- **Docs não mudaram:** a seção "Mídia" já demonstrava todo o vocabulário
  `.media-*` (o componente usa um subconjunto) e o componente não é
  renderizado no HTML estático — logo "demo nos docs" já estava satisfeito
  e mexer só churnaria os 26 baselines à toa.
- **Gates:** `validate.py` OK; `pnpm test` 31/31 (4 novos: `spokenTime`
  singular/plural, play/pause via evento, seek com aria-valuetext + move
  currentTime, mute troca elemento+rótulo); docs abrem sem erro de console
  (o motor de mídia é do browser — mockado nos testes, como manda o aceite).

### Etapa 2 — Upload real

Estende o FileInput/DropZone (Fase 4 etapa 2): envio com progresso,
cancelamento e retry POR ARQUIVO. A API recebe a função de envio do
consumidor — não embute endpoint nem protocolo.

**Pesquisar:** o caminho atual para progresso de upload no browser
(confirmar se `XMLHttpRequest.upload.onprogress` segue sendo o padrão
ou se `fetch` já cobre progresso de envio de forma utilizável).
Fronteira de confiança: validação no cliente é UX; quem decide é o
servidor.

**Aceite:** progresso real por arquivo; cancelar aborta a requisição;
erro num arquivo não derruba a fila; testes com envio mockado.

**Notas de execução (Fase 5 etapa 2, 18/07/2026, Opus):**

- **Estendeu o `FileInput` (não criou componente novo).** Prop opcional
  `upload?: (file, {signal, onProgress}) => Promise<void>`. Sem `upload`, o
  componente é idêntico à Fase 4 (os 2 testes antigos passam sem tocar). O
  transporte é do consumidor — a UI **não embute endpoint nem protocolo**;
  só orquestra fila, estado por arquivo e o `AbortController`.
- **Pesquisa (07/2026) — progresso de upload no browser.** Fontes: Jake
  Archibald ("Fetch streams are great, but not for measuring upload/download
  progress", 2025) e MDN `XMLHttpRequest.upload`. Confirmado: **o `fetch` ainda
  NÃO expõe progresso de envio de forma confiável** — request streams só em
  Chromium e dão número impreciso; `XMLHttpRequest.upload.onprogress` segue
  sendo o padrão real. **Decisão:** não medir progresso nós; o `onProgress(0..1)`
  vem de FORA (o consumidor chama enquanto envia por XHR/fetch — escolha dele).
  Assim o contrato não amarra transporte nem congela essa pesquisa no código.
- **Fronteira de confiança preservada.** A validação de tipo/tamanho (já da
  Fase 4) é UX no cliente; quem decide de verdade é o servidor do consumidor.
  O `upload` recebe o `File` cru e o `signal`; o que ele faz com isso é dele.
- **Cancelar = `AbortController.abort()`** no signal do contrato — é o que corta
  a requisição do consumidor. No `catch`, `signal.aborted` distingue "cancelado"
  de "falhou" **seja qual for o erro que o consumidor lançou** (não depende de
  `name === "AbortError"`). Retry re-invoca `upload` com controller novo.
- **Erro/cancelamento por arquivo não derruba a fila:** cada arquivo é uma
  promessa independente com `catch` próprio; `patch` é `setState` funcional
  (seguro sob closures velhas quando N enviam em paralelo). Single-mode que
  troca o arquivo aborta o envio anterior; `remove` também aborta o em voo.
- **Sem CSS novo (nem no core).** A barra reusa `.progress`/`.progress>span`
  (largura do preenchimento inline por ser data-driven); o erro reusa
  `.field-error`. Precedente do MediaPlayer: estilo inline no ELEMENTO em vez de
  regra no stylesheet. **Prova:** `pnpm build` deixou `packages/core`,
  `packages/icons`, tokens, fontes e o `<style>` dos docs **byte-idênticos**
  (git status só mostra `packages/react` + o teste) → **zero baseline Playwright
  regerado**. O `<style>` dos docs é o `core.css` verbatim, então qualquer regra
  nova ali regeraria os 26 snapshots à toa.
- **A11y:** a barra é `role="progressbar"` (APG) com `aria-valuemin/max/now` e
  `aria-label` "Enviando <arquivo>" — o leitor conta o progresso sem depender da
  cor. Conclusão/erro/cancelamento são anunciados pela região `role="status"`
  aria-live que já existia (não uma por progresso — só nas transições, senão
  spammaria). Cancelar/retry são `<button>` com nome acessível que inclui o
  arquivo. 6 strings `upload*` novas passam pela i18n (`AureaStrings`).
- **Sem dependência nova** (a etapa não autorizava; a nova só entra na etapa 3).
  `AbortController` é nativo.
- **Deferido de propósito** (aditivo, sem demanda): callback de resultado ao
  consumidor (ele já criou a Promise — sabe o desfecho), auto-retry, limite de
  concorrência da fila, e demo estática nos docs (o upload é React-only e não é
  renderizado no HTML dos docs — mexer só churnaria baseline, como na etapa 1).
- **Gates:** `validate.py` OK; `pnpm test` 34/34 (3 novos: progresso real refletido
  no `aria-valuenow` + conclusão anunciada; cancelar aborta o signal e habilita
  retry; erro num arquivo não derruba o outro e retry reenvia só o que falhou —
  tudo com envio mockado por promessa deferida, dirigido pelo teste). `pnpm build`
  git-clean fora do pacote react. TS7 strict compila.

### Etapa 3 — CodeEditor (CodeMirror)

Dependência nova AUTORIZADA aqui (como TanStack na Fase 4 etapa 6):
CodeMirror 6 com tema Aurea via tokens.

**Pesquisar antes de instalar:** versão atual de `codemirror` /
`@codemirror/*`, manutenção, licença (MIT), peso; como o tema consome
`var(--*)` do core (`EditorView.theme`); linguagens ficam FORA — o
consumidor passa a extensão de linguagem (não embutir nenhuma).

**Aceite:** editor com tema Aurea nos dois temas, sem cor hardcoded
fora de token; demo nos docs; teste de que o tema aplica.

**Notas de execução (Fase 5 etapa 3, 18/07/2026, Opus):**

- **`CodeEditor` em `@aurea-uds/react`** — headless sobre a `EditorView` do
  CodeMirror 6 (o motor de edição é dele, como o `<video>` é do browser no
  MediaPlayer). O componente monta a view uma vez, dá a pele Aurea e liga
  `defaultValue`/`onChange`. **Não controlado** (mudança em `defaultValue` após
  montar não recarrega o doc) — precedente MediaPlayer/FileInput; controlar de
  fora só com demanda real. `onChange` sai por `ref` → notifica o mais recente
  sem recriar o listener (sem remontar). `readOnly`/`ariaLabel`/`extensions`
  vivem num `Compartment` reconfigurável: trocam sem remontar (preservam doc,
  seleção e histórico).
- **Dependência nova AUTORIZADA, pesquisada e MEDIDA no pacote (07/2026).**
  `codemirror` 6.0.2 (só re-exporta `EditorView`/`basicSetup`/`minimalSetup` —
  medido: por isso `@codemirror/state`, `@codemirror/language` e
  `@lezer/highlight` entram diretos), `@codemirror/view` 6.43.6,
  `@codemirror/state` 6.7.1, `@codemirror/language` 6.12.4, `@lezer/highlight`
  1.2.3. **Todos MIT** (compatível com Apache-2.0), **ativamente mantidos**
  (view/state publicados nas horas anteriores à checagem). `@codemirror/commands`
  foi instalado e **removido** ao confirmar que `basicSetup` já traz history +
  keymaps — não uso direto (escada: não inflar deps).
- **LINGUAGENS FICAM FORA (regra da etapa).** Não embutimos nenhuma
  `@codemirror/lang-*`; o consumidor passa a dele em `extensions` (o exemplo
  React mostra `javascript({typescript:true})` como dep DELE). Assim peso e
  escolha de linguagem são do consumidor e a lista de deps não incha —
  paralelo ao "DataGrid re-exporta `ColumnDef`, não reimplementa".
- **Tema por TOKEN, sem cor hardcoded (aceite central).** A pele é um
  `EditorView.theme` + `HighlightStyle` que só referenciam `var(--*)` do core.
  **Decisão registrada:** para TEXTO de sintaxe uso apenas tokens que VIRAM
  entre dark/light — `--foreground`, `--muted-foreground` e os semânticos
  `--info-400`/`--success-400`/`--warning-400`/`--danger-400` (têm override no
  `[data-theme="light"]`). **NÃO uso `--primary` como cor de texto**: o amarelo é
  invariável e falharia contraste sobre o inset claro; `--primary` fica só em
  realce de par de brackets e seleção de autocomplete (14% — idioma do
  `.tree-node[data-selected]`). Mapeamento: comentário→muted itálico;
  keyword/tipo/tag→info; string/regexp→success; número→warning; inválido→danger.
- **SEM CSS novo no core.** A pele vive no StyleModule que o CodeMirror injeta
  a partir do `EditorView.theme` (JS-side), não no stylesheet do core.
  **Prova:** `pnpm build` deixou `packages/core`, `tokens`, `fonts`, `icons` e o
  `<style>` de `apps/docs/index.html` **byte-idênticos** (git status só mostra
  `packages/react` + testes + README/exemplo + lockfile) → **zero baseline
  Playwright regerado**. O editor casa com o `.code-block` já existente
  (raio `--radius-lg`, fundo `--surface-inset`, `--font-code`).
- **Conferência visual REAL nos dois temas** (gate obrigatório; não é surface
  do HTML estático). Bundlei um demo efêmero (Vite) consumindo o `dist` +
  `core.css`, servi e li o `getComputedStyle` renderizado (o screenshot travou —
  Browser pane oculto congela o rAF do CodeMirror). Confirmado: **dark** fundo
  `--surface-inset` (oklch .145), keyword `#8ec5ff`, string `#42d392`, número =
  amarelo da marca (legível no escuro); **light** fundo oklch .94, keyword
  `#164f9d`, string `#0f6b3e`, número `#6d4d00` (marrom, legível no claro) —
  cada cor pega o override do `[data-theme="light"]`, zero falha de contraste.
  Artefatos e deps temporários (`vite`, `@codemirror/lang-javascript`) removidos;
  `@codemirror/view` fica como devDep da RAIZ só para o teste (o teste roda da
  raiz e o pacote está em `packages/react/node_modules`; mesma versão dedupada →
  `findFromDOM` acha a mesma instância).
- **A11y.** O `.cm-content` é `role="textbox"` (do CodeMirror) e recebe
  `aria-label` via `EditorView.contentAttributes` (default pela i18n:
  `codeEditor`). Sem atalho global inventado — o CodeMirror já traz o keymap
  acessível. `readOnly` usa `EditorState.readOnly` + `EditorView.editable`.
- **Demo:** exemplo React (`examples/react/App.tsx`) com o padrão "traga sua
  linguagem" + seção no README. O HTML estático dos docs NÃO foi tocado (é
  só-CSS; o CodeMirror não tem vocabulário de classe estático e mexer só
  churnaria os 26 baselines — mesma linha das etapas 1-2).
- **Deferido de propósito** (aditivo, sem demanda): modo controlado (`value`),
  altura default (o consumidor dá altura ao container), e demo estática no HTML
  dos docs (React-only, como MediaPlayer/upload).
- **Gates:** `validate.py` OK; `pnpm test` 38/38 (4 novos: monta+reflete o
  `defaultValue`+nome acessível; tema aplica e é token-based — StyleModule cita
  `var(--surface-inset)`/`var(--font-code)`; `onChange` dispara com o texto via
  transação por `findFromDOM`; `readOnly` deixa `contenteditable=false`).
  `pnpm build` git-clean fora do pacote react. TS7 strict compila.

### Etapa 4 — Chat/colaboração (primitives)

Compõe o que existe: `.message`, `Avatar`, `Badge`, `.status-dot`.
Presentational — transporte e estado são do consumidor (mesma linha do
NotificationCenter). Sem dependência nova.

**Pesquisar:** a11y de log de conversa (`role="log"`,
`aria-live="polite"` na chegada — paralelo direto da decisão do
NotificationCenter, Fase 4 etapa 4).

**Aceite:** lista de mensagens com autor/hora/estado; entrada composta
de blocos existentes; anúncio de chegada; testes de interação.

**Notas de execução (Fase 5 etapa 4, 18/07/2026, Opus):**

- **Dois primitives em `@aurea-uds/react`** (o título da etapa diz "primitives"):
  `MessageList` (o log de conversa) e `MessageComposer` (a entrada). Ambos só
  **compõem** o que já existia — `.message`/`.message-bubble` + `Avatar` + `Badge`
  + `.status-dot` na lista; `.input-wrap` + `.input` + `IconButton` no composer.
  **Presentational:** transporte e estado (as mensagens, o envio) são do
  consumidor — mesma linha do NotificationCenter. `ChatMessage` carrega
  `author`/`time`/`status` (autor/hora/estado do aceite); `status` vira
  `<Badge variant><i class="status-dot"/>…</Badge>` (os dois blocos que a etapa
  mandou compor).
- **A11y do log de conversa pesquisada e registrada (07/2026).** Fontes: W3C
  **ARIA23** ("Using role=log…") e **MDN "log role"**. Decisão: o container das
  mensagens **É** a live region — `role="log" aria-live="polite"`. O `role="log"`
  já implica `polite`, mas o `aria-live` vai **explícito** por robustez entre
  leitores (mesmo idioma do `LogStream` que já existia no pacote). **Diferença
  registrada vs. NotificationCenter (Fase 4 etapa 4):** lá o painel **não** é live
  region e um anunciador **à parte** conta as chegadas, porque um feed se revisita
  no próprio ritmo; um **chat se lê na ordem em que chega**, então aqui o próprio
  log anuncia. Consequência boa: chegada de mensagem = mutação nativa da região
  (React insere só o nó novo na lista keyada) — **sem o diff manual de ids** que o
  feed precisou; e a lista inicial **não** dispara, pois a região só anuncia o que
  muda **depois** de existir no DOM (sem o guard `seen===undefined` do feed). O log
  tem nome acessível (`aria-label`, default i18n `chatLabel`).
- **Composer:** `<form>` sobre `.input-wrap` + `.input`; Enter envia (submit
  nativo) e limpa. Texto é **estado interno** (não controlado — controlar de fora
  só com demanda real, precedente MediaPlayer/FileInput/CodeEditor). Não envia
  vazio/só-espaço (aparado no `submit`); o botão de envio **desabilita** enquanto
  vazio. O input tem `aria-label` sempre (placeholder não serve de nome acessível).
- **SEM CSS novo no core.** O único posicionamento novo é `marginTop:var(--space-2)`
  **inline no elemento** do cluster de estado (precedente das etapas 1-3: estilo no
  elemento, não regra no stylesheet; e respeita a regra de espaçamento tokenizado
  da Fase 4). O composer usa `flex`/`minWidth` inline para o input crescer e o botão
  não quebrar linha. **Prova:** `pnpm build` deixou `packages/core`, `tokens`,
  `fonts`, `icons` e o `<style>` de `apps/docs/index.html` **byte-idênticos**
  (git status só mostra `packages/react` + o teste + o exemplo) → **zero baseline
  Playwright regerado**. O `<style>` dos docs é o `core.css` verbatim; qualquer
  regra nova ali regeraria os 26 snapshots à toa.
- **Sem dependência nova** (a etapa não autorizava; a única da fase era o CodeMirror
  da etapa 3).
- **Demo:** exemplo React (`examples/react/App.tsx`) com `MessageList` +
  `MessageComposer` mostrando o modelo presentational (o consumidor é dono do array
  e acrescenta no `onSend`). O HTML estático dos docs **não** foi tocado — a seção
  "Colaboração" já demonstra o vocabulário `.message` + composer (`.input-wrap`) nos
  dois temas, e o componente é React-only (não renderiza no HTML estático); mexer só
  churnaria os 26 baselines (mesma linha das etapas 1-3). 3 strings i18n novas
  (`chatLabel`/`chatMessage`/`chatSend`).
- **Deferido de propósito** (aditivo, sem demanda): auto-scroll pro fim + max-height
  do log (o consumidor dá altura/scroll — mesma posse de layout do "estado é dele");
  modo controlado do composer (`value`/`onChange`); `<textarea>` + Shift+Enter para
  multilinha; alinhamento próprio-usuário à direita (o core `.message` não tem
  variante "own" e adicioná-la seria CSS novo — precisa autorização do Victor).
- **Gates:** `validate.py` OK; `pnpm test` 41/41 (3 novos: log nomeado com
  autor/hora/estado + `aria-live`; chegada entra na **mesma** região sem remontar;
  composer desabilita vazio, Enter envia aparado e limpa). `pnpm build` git-clean
  fora do pacote react. TS7 strict compila.

**Fase 5 completa (4/4 etapas) → push da fase.**

## Fase 6 — Extensions (requer autorização)

Cada pacote é UMA etapa fechada (uma por sessão); o Guia de execução
vale inteiro. Critério de entrada: **demanda real de um consumidor** —
sem demanda, a fase não começa.

- `@aurea-uds/charts` — ECharts com tema Aurea usando `--chart-1..5`.
  Dependência nova: pesquisar antes de instalar (versão atual,
  manutenção, licença Apache-2.0, peso; tema via `registerTheme`
  consumindo tokens).
- `@aurea-uds/ai` — AgentStatus, ToolCall, TraceTimeline, CostMeter em
  React. O CSS já existe (`.trace`, `.invocation`, `.cost-meter`,
  `.agent-*`); componente presentational, sem dependência nova.
- `@aurea-uds/operations` — LogViewer, EventStream, HealthMatrix. Idem:
  CSS existe (`.log-stream`, `.event-stream`, `.health-matrix`), sem
  dependência nova. Virtualização de log só se a demanda real exigir —
  e aí é decisão registrada, não reflexo.

## Fase 7 — Platforms (requer autorização)

> 🔴 **ESTA SEÇÃO ESTAVA DESATUALIZADA, e a correção é de 09/09/2026.** Ela dizia *"NÃO detalhar
> agora"* e *"o Opus não deve detalhá-la antes disso"* sobre o React Native — enquanto o alvo
> nativo **já estava inteiro**: 44 componentes, os Lotes 0 a 6, autorizados um a um pelo Victor
> entre 02/09 e 09/09/2026. **Duas ordens opostas no mesmo repositório**, que é exatamente o
> defeito que o [`CLAUDE.md`](../../CLAUDE.md) já nomeou três vezes (a linha do `ATIVIDADE-2.md`, a da
> suspensão de push, e a "regra mais lida do arquivo é a que envelhece primeiro").
>
> **A fonte do alvo nativo é o [`NATIVE.md`](../NATIVE.md), e só ela.** O §7 é o resumo; o §5.1–5.6 é
> o plano medido. Esta seção vale para os alvos que NÃO começaram.

- Web Components, e-mail (React Email/MJML com tokens Aurea), terminal — **estes** continuam sem
  detalhamento, e a regra abaixo vale para eles.
- ✅ **React Native: FEITO.** O alvo saiu do papel em 02/09/2026 e fechou em 09/09/2026 com **44
  componentes** (`@aurea-uds/native`, ainda **não publicado** no npm). A decisão de arquitetura
  abaixo — compartilhar SÓ os tokens — foi seguida à risca e **não** foi relitigada.
- Só especificar os alvos restantes quando a Fase 6 estiver estável — **regra da própria
  fase.** Especificar antes gravaria pesquisa vencida, e o nativo provou a regra pelo avesso: foi
  especificado **no dia**, medindo o consumidor real, e as três decisões de motor
  (ADR-0037/0038/0040) saíram diferentes do que a "pista" de 18/07 apontava.

**Decisão de arquitetura — React Native (18/07/2026): filosofia (A),
compartilhar SÓ os tokens.** Motivo: bate com o padrão já registrado da Aurea
(identidade = tokens + pele própria; comportamento = motor certo por
plataforma). O que viaja pro mobile é a camada de tokens (DTCG já é neutra —
Fase 1); o resto NÃO viaja: `@aurea-uds/react` roda sobre Base UI (DOM/web),
TanStack renderiza pra DOM, e `<video>`/`<input type=file>` são web. Logo RN
é um pacote IRMÃO (`@aurea-uds/native` ou similar), não um wrapper do React web:
componentes próprios sobre `View`/`Text`/`Pressable`, consumindo
`@aurea-uds/tokens`; ícones Carbon via `react-native-svg`; IBM Plex por font
linking nativo. **Recusado (B) "universal" via Tamagui:** trocaria Base UI + o
CSS core inteiros pelo modelo do Tamagui — rasga as decisões das Fases 0–5
(identidade intocável, Base UI como motor). Só se reabre se o Victor quiser
relitigar isso.

- ✅ **FEITO** (era: preparo necessário antes de RN começar, *"YAGNI até haver consumidor"* — o
  consumidor apareceu, foi medido no `NATIVE.md` §5.1, e isto virou o Lote 0):
  `build-tokens.mjs` passa a emitir TAMBÉM um objeto de
  tema JS/TS além do `.css` atual. **Não são "os mesmos valores" crus** — os
  atuais têm seletores DOM, fallbacks web e dimensões `rem`/`px`; o objeto RN
  exige TRANSFORMAÇÃO (unidades → number/dp, tema/densidade → runtime não-CSS,
  fontes → nomes nativos). O DTCG dá a fonte única; o adapter converte por alvo
  (auditoria 18/07, M11). ~~Não construir enquanto não houver app RN consumindo.~~ Construído —
  `resolverTokens(tema, densidade)` no `@aurea-uds/native`, e a transformação prevista aqui
  (unidades → dp, tema/densidade em runtime, fontes → nomes nativos) foi exatamente a que se fez.
- ~~Ferramenta de estilo do RN: decisão de Fase 7, re-pesquisar no dia. Pista atual (não
  escolha): Unistyles v3.~~ ✅ **DECIDIDA em 02/09/2026 —
  [ADR-0037](../../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md): `StyleSheet`
  puro, e a camada de tema é NOSSA.** A pista apontava para Unistyles e a medição no dia foi
  contra ela — o que é o argumento de "re-pesquisar no dia" funcionando, não falhando. A ADR-0037
  **supera a 0028**.
- Quando chegar a hora **dos alvos restantes**: especificar no formato das Fases 4/5 (etapas
  fechadas, uma por sessão, Guia de execução inteiro) e submeter ao
  Victor ANTES de implementar ("PODE IMPLEMENTAR"). Foi o que o nativo fez, lote a lote.

---

## Dependências externas planejadas

Registro de decisões sobre libs de terceiros (não é uma fase; é referência).

**Para o Opus:** o que vale aqui é a DECISÃO (usar como dependência,
não embutir), não a versão. Versão anotada tem data — no dia de
instalar, re-pesquisar versão atual, manutenção e CVEs (passo 1 do
Guia). A decisão só se reabre se o cenário mudar (lib abandonada,
licença mudou); aí é falar com o Victor, não decidir sozinho.

### xyflow / React Flow — grafo de nós (Fase 5/6)

`@xyflow/react` (v12.11, MIT — compatível com a Apache-2.0 do projeto) para os
componentes de grafo de nós: o "builder" com nós/arestas e o grafo de
dependências. Entra quando a Fase 5 (Creation) ou a Fase 6 (`@aurea-uds/flow`
ou similar) precisar disso.

**Decisão (17/07/2026): usar como DEPENDÊNCIA, não embutir (vendoring).**
Motivos:

- É motor de comportamento (pan/zoom/drag de grafo), não aparência — igual ao
  Base UI. Recebe a pele Aurea por CSS; o comportamento vem de fora.
- Embutir congelaria a versão e nos tornaria donos de correções de bug/segurança
  que hoje chegam via update. O bundle pesa igual embutido ou não.
- Vendoring só compensa para trecho minúsculo, lib abandonada ou licença que
  obriga — nada disso se aplica (v12 é atual e mantida).

Contraponto ao Carbon (que É internalizado): o Carbon são glifos SVG estáticos,
sem comportamento e sem updates de segurança relevantes — copiar os SVGs é
seguro e remove a dependência de runtime. O React Flow é código vivo. Categorias
diferentes, decisões diferentes.
