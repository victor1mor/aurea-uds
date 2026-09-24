# Fase 6 — Catálogo Dogfooding — BRIEF (input para o planejamento)

> **DOCUMENTO HISTÓRICO.** É o BRIEF de entrada de uma fase encerrada; permanece como
> registro do que foi pedido, não do que vale hoje. O estado atual está em
> [`STATE.md`](../../STATE.md) e as decisões, em [`decisions/`](../../decisions/README.md).
> Marcado por causa do achado **B6** (26/07/2026).

> **FECHADO em 24/07/2026.** Os 10 requisitos ditados pelo Victor foram implementados e as
> três dúvidas (D1 numeração, D2 chips "Uses", D3 modelo de página) estão resolvidas: as duas
> contagens de trilha vivem no `ROADMAP.md`, os chips "Uses" são seção real nas páginas de
> pattern e de block, e o modelo de página é o mesmo para todo tipo de item. O documento fica
> como **história**: a leitura região a região da imagem-alvo (§ "Organização do catálogo")
> continua sendo a referência de organização que ninguém mais reescreveu.
>
> Não é backlog. O que ainda falta está no `ROADMAP.md`, trilha Catálogo.

> Este arquivo é **entrada de requisitos**, não o plano. Requisitos ditados
> pelo Victor em 22/07/2026. O PLANO (etapas fechadas, formato das Fases 4/5)
> é produzido numa **sessão nova e dedicada** — ver "Como abrir a sessão" no fim.
> Regra do projeto: cada fase nova exige `PODE IMPLEMENTAR` por etapa.

Idioma base do PRODUTO = **inglês** (regra 7). Por isso a taxonomia, o modelo
de página, os níveis de maturidade e a matriz abaixo estão em inglês — são
vocabulário do catálogo. As notas ao Victor seguem em pt-BR.

---

## Requisitos (ditados pelo Victor — travados)

### 1. Taxonomia oficial (em inglês) — regra: SEM "Other"
Categorias base: **Foundations, Inputs, Navigation, Data Display, Feedback,
Overlays, Media, Identity, Platform Adapters** (+ outras se necessário).
Regra travada: **nunca** criar categoria `Other`/`Misc`/`Generic`. Todo
componente tem categoria própria explicável por função/intenção/domínio.

### 2. Modelo de página padrão (toda página de item, nesta ordem)
`Overview` · `Usage` · `Preview` · `Code` · `States` · `Accessibility` ·
`Tokens` · `Platforms` · `Related Patterns`.

### 3. Registry / metadata por componente (ficha técnica)
Campos: **name, category, status, supported platforms, tokens used,
accessibility, dependencies, variants, related patterns, maturity**.

### 4. Status de maturidade (evita experimental parecer oficial)
`Draft` · `Ready` · `Stable` · `Universal` · `Deprecated`.

### 5. Matriz universal de plataformas (por componente, desde o começo)
`Web` · `Mobile` · `Desktop` · `Touch` · `Keyboard` · `Screen reader` ·
`Offline` (talvez). O sistema é universal — a matriz aparece desde já.

### 6. Dogfooding real
A ferramenta Aurea é feita COM a Aurea. Sidebar, Tabs, Search, Cards,
CodeBlock, QRCode, Badges, Status e Table = os **componentes reais**, não HTML
improvisado. (Hoje `apps/docs/index.html` é HTML manual — este é o maior gap.)

### 7. Idioma base = inglês
Tudo visível no produto (nav, categorias, páginas, patterns, labels, estados,
botões, empty states, mensagens, exemplos, snippets, docs) **nasce em inglês**.
Conversa/planejamento com o Victor segue pt-BR. i18n já existe no `@aurea-uds/
react` (defaults hoje pt-BR → virar inglês, pt-BR como locale).

### 8. MVP de componentes essenciais (fechar antes de sair criando tudo)
`Button, IconButton, Input, Search, Select, Tabs, Badge, Card, Table, Sidebar,
Topbar, CodeBlock, QRCode, Status, Dialog, Tooltip`.

### 9. Patterns antes de Blocks
Depois dos componentes base, receitas pequenas — ex.: `Button with Kbd`,
`Rounded QRCode Downloadable`, `Selectable Table with Pagination`,
`Command Search`. **Blocks vêm depois** dos patterns.

### 10. Gates de qualidade (todo componente passa por todos)
Visual Aurea · tokens do design system · Carbon icons · arredondamento/soft
geometry · responsividade · teclado · acessibilidade · dark/light ·
**sem cor hardcoded**.

---

## Contexto que o planejamento tem de considerar (levantado, não decidido)

**O que o repo JÁ tem** (não recriar — é aditivo):
- `@aurea-uds/react` com ~40 componentes reais (inclui Button, IconButton,
  Input, SearchField, Select, Tabs, Badge, Card, DataGrid/Table, CodeEditor/
  CodeBlock, Dialog, Tooltip, AppShell). Faltam do MVP: **Sidebar, Topbar,
  Status e QRCode** como componentes nomeados (AppShell/status-dot existem como
  base).
- Tokens DTCG, fontes, ícones Carbon, contrato (17 patterns / 23 recipes),
  identidade travada (raio 22px, pill, amarelo `oklch(0.795 0.184 86.047)`,
  IBM Plex, sem gradiente), 53 testes, CI, gate axe.

**Gaps a planejar (= os requisitos acima):**
- idioma inglês · catálogo dogfooded · registry/metadata · maturidade ·
  matriz de plataforma · QRCode · taxonomia inglês sem Other.

**Decisões abertas que o PLANO precisa resolver (não decidir agora):**
1. **Numeração:** a `Fase 6 — Extensions` (charts/ai/operations) já existe no
   ROADMAP. A visão "Catálogo Dogfooding" é OUTRA coisa. Renumerar
   (Dogfooding vira Fase 6, Extensions Fase 7+) ou tratar como trilha à parte?
2. **App do catálogo:** o dogfooding exige um app real (React) que consome
   `@aurea-uds/react`. Stack? (Vite SPA? framework?) — pesquisar no dia
   (research-first). O `apps/docs/index.html` standalone continua ou é
   substituído/coexiste?
3. **QRCode arredondado:** dependência nova (lib de QR) ou geração própria?
   Preservar escaneabilidade (contraste, quiet zone, tamanho, correção) —
   soft geometry não pode quebrar leitura. Decisão registrada.
4. **Registry:** estende `packages/contracts` (JSON) ou pacote novo? Como o
   gate (validate.py) prova que a ficha bate com o componente real?
5. **Ordem das etapas** (risco crescente, uma por sessão): taxonomia+registry
   primeiro (fundação organizacional) → i18n inglês → MVP faltante (Sidebar/
   Topbar/Status/QRCode) → app dogfooding → patterns → blocks.

**Referências de ORGANIZAÇÃO (não de cor/identidade):** Kibo UI, Untitled UI
(taxonomia, page model, patterns granulares). Identidade continua Aurea.
Os requisitos que originaram este brief vieram de notas locais do Victor (21–22/07/2026).

---

## Organização do catálogo — análise da imagem-alvo (22/07/2026)

Imagem aprovada pelo Victor como alvo de ORGANIZAÇÃO (não de cor — identidade
já é Aurea). "Quero praticamente tudo que está aí quando se diz respeito
organização." Leitura região a região:

### A. Topbar (barra superior)
- Esquerda: logo (sol/asterisco amarelo) + wordmark "Aurea" + badge de
  versão `v1.7.0` (pill).
- Centro: nav de topo com 6 áreas — **Docs · Components · Patterns · Blocks ·
  Recipes · Platforms** (a ativa ganha realce amarelo).
- Direita: Search (pill, placeholder "Search", chip de atalho `⌘K`) · seletor
  de densidade (`Comfortable ▾`) · toggle de tema (sol/lua) · botão
  `⌘ K Command` (amarelo, pill) → paleta de comandos.

### B. Sidebar esquerda = árvore da taxonomia (granular)
- Categorias com ícone Carbon, cada uma expansível (chevron): Foundations,
  Inputs, Navigation, Data Display, Feedback, Overlays, Media, Identity,
  Platform Adapters.
- Profundidade granular estilo Kibo: **Categoria → Componente → Variante →
  Estado/Composição**. Exemplos visíveis:
  - Data Display → Table → Selectable → **Pagination** (selecionado)
  - Identity → QRCode → Rounded → **Downloadable** (selecionado, ponto amarelo)
  - Identity → Button → Destructive → **With Kbd**
- Item ativo: ponto amarelo + realce. Colapsado = chevron à direita.

### C. Cabeçalho da página
- Breadcrumb: `🏠 > Patterns > Identity > QRCode > Rounded` (espelha a árvore).
- Eyebrow: `⊞ PATTERN UNIVERSAL` (caixa alta, com ícone) → tipo + escopo.
- Título grande (serif): "Rounded QRCode Pattern".
- Subtítulo: "Built from Aurea primitives and ready for every platform."

### D. Badges de plataforma (linha de chips)
- `Web` (globo) · `Mobile` (celular) · `Desktop` (monitor) · `Keyboard` ·
  `Screen reader` (destacado em verde = suportado). = a matriz universal
  resumida no topo da página.

### E. Painéis Preview + Code (dois lados)
- Esquerda "Preview" (+ chip `Uses QRCode`): QR arredondado (módulos e olhos
  redondos) em card branco; abaixo botão `⤓ Download` (+ chip `Uses Button`).
- Direita: abas `Preview | Code` (Code ativa); filename `RoundedQRCode.tsx` +
  chip `tsx` + ícone copiar (tooltip "Copy code"); bloco de código TSX com
  syntax highlight (`import { QRCode } from '@aurea-uds/react'` …); chip
  `Uses CodeBlock` no rodapé.

### F. "Used here" = proveniência de dogfooding VISÍVEL
- Linha de chips: `Sidebar · Tabs · Card · CodeBlock · Badge · QRCode · Status
  · Table` + chip `Uses Badge` + ícone (i).
- Cada painel/seção da página leva um chip `Uses <Componente>` mostrando com
  QUAL componente Aurea real ele é feito. O catálogo se rotula com suas próprias
  peças — o dogfooding fica auditável na cara.

### G. Painel "Estados" (States) — usa o componente Status
- Chip `Uses Status`. Linhas: Sucesso (check verde) · Informação (info azul) ·
  Atenção (warning amarelo), cada uma com descrição + chip `Uses Status`.

### H. Painel "Platform Matrix" — usa o componente Table
- Chip `Uses Table`. Tabela: colunas `Platform | Web | Mobile | Desktop |
  Keyboard`; linhas Web (✓✓✓✓), Mobile (—✓——), Desktop (——✓—). Rodapé:
  `Rows per page 5 ▾` · `1–3 of 3` · paginação `‹ 1 ›` · chip `Uses Table`.

### I. "On this page" (TOC à direita)
- Overview (ativo) · Usage · States · Accessibility · Platforms · Tokens.
- (Preview/Code aparecem como abas inline; Related Patterns não está no TOC
  desta captura — ver dúvida sobre o modelo de página.)

### Princípios de organização extraídos (o que replicar)
1. **Proveniência visível ("Uses X"/"Used here"):** toda superfície declara de
   qual componente real é feita — dogfooding auditável.
2. **Árvore granular:** categoria → componente → variante → estado/composição.
3. **Breadcrumb espelha a árvore.**
4. **Plataforma em dois lugares:** badges no topo + Platform Matrix (tabela).
5. **Preview + Code lado a lado, com filename/copy.**
6. **Toda seção é um componente real** (States=Status, Matrix=Table, etc.).
7. **Topbar:** busca + ⌘K command + densidade + tema + versão.

### Dúvidas a resolver antes do plano (perguntadas ao Victor 22/07)
- **D1. Patterns × Blocks × Recipes:** o topo tem os três + Components + Docs +
  Platforms. Qual a fronteira de cada um? (o repo hoje usa "patterns"=17
  vocabulário e "recipes"=23 arquétipos de app — diferente do "Pattern"
  granular da imagem).
- **D2. Chips "Uses X"/"Used here":** feature permanente (proveniência real) ou
  decoração do mockup?
- **D3. Modelo de página:** o mesmo (Overview…Related) vale para TODO tipo de
  item (Component/Pattern/Block/Recipe) igual, ou cada tipo tem layout próprio?

---

## Como abrir a sessão de planejamento (copiar)

```text
Leia C:\dev\aurea-uds\FASE-6-BRIEF.md, o C:\dev\aurea-uds\ROADMAP.md e o C:\dev\aurea-uds\CLAUDE.md.
Não implemente nada. Produza o PLANO da Fase 6 (Catálogo Dogfooding) no formato
das Fases 4/5: etapas fechadas, uma por sessão, risco crescente, com o que cada
etapa pesquisa/decide/entrega e seus gates. Resolva primeiro as "Decisões abertas"
do brief (numeração, stack do app, QRCode, registry, ordem). Traga o plano para eu
aprovar com PODE IMPLEMENTAR antes de qualquer código.
```
