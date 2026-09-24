# Aurea — Direção (norte, NÃO ordem de construir)

> **O que este documento é:** o mapa-alvo da taxonomia universal da Aurea — camadas,
> categorias, regras de nomenclatura e governança. Serve de **guarda-corpo**: quando
> um componente novo entrar, ele já tem camada, categoria e nome **pré-definidos**, e
> o sistema não sai do padrão (§2.0 — padrão único, esticado para o futuro).
>
> **O que este documento NÃO é:** uma lista de tarefas. **NÃO se pré-constrói** nada
> daqui. Vale a regra do AUREA.md §4 Balde C e §5: extensão entra **por pull real —
> YAGNI**. Um componente ganha ficha **quando é construído**, não antes. Escrever
> ficha de componente que não existe = documentar fantasia.
>
> **Como isto se relaciona com o resto:** `AUREA.md` é a fonte de verdade (visão,
> ordem, decisões). Este arquivo é o **backlog estrutural** por trás do §4 — capturado
> a partir de uma avaliação externa (jul/2026) e filtrado pelas regras do projeto.
> Os inventários de componentes por área abaixo são **ilustrativos e não-vinculantes**.

---

## 0 — O que JÁ vincula (aplica-se a toda ficha, hoje)

Estas são as partes da direção que **já estão em vigor** — o gate as cobra:

1. **Eixo de camada (`layer`).** Todo componente declara sua camada de abstração.
   Não se mistura nível: uma Foundation não fica lado a lado com um Composite.
   Enum travado: `Foundation · Primitive · Component · Composite · Shell`.
2. **Categoria por objetivo do usuário**, nunca por aparência. **Nunca `Other`,
   `Miscellaneous` ou `Utilities`** (§2.7). Uma regra vale para todos ou não é regra.
3. **Disciplina de nomenclatura** (as 15 regras da §3 abaixo) — ao adicionar
   qualquer componente, o nome segue a distinção semântica já definida.
4. **Core pequeno; o resto é instalável por pull** (§4 Balde C, já decidido).

O restante deste documento é **direção** (para onde crescemos), não obrigação atual.

---

## 1 — Camadas de abstração (o eixo que faltava)

A crítica central da avaliação foi justa: uma lista **plana** de categorias mistura
níveis (um `Icon` ao lado de um `Button` ao lado de um `DataGrid`). A cura é um eixo
de **camada**, ortogonal à categoria. Cinco camadas travadas para os 59 atuais:

| Layer | O que é | Exemplos (dos 59) |
|---|---|---|
| **Foundation** | átomo/infra do sistema | `Icon` |
| **Primitive** | peça estrutural sem semântica de negócio | `Stack`, `Grid`, `Cluster` |
| **Component** | componente base com um propósito | `Button`, `Input`, `Badge` |
| **Composite** | compõe componentes menores | `DataGrid`, `Combobox`, `MessageComposer` |
| **Shell** | estrutura completa de app/módulo | `AppShell`, `MediaPlayerShell` |

> Camadas maiores da avaliação (`Advanced`, `Domain Extensions`, `Patterns`,
> `Templates`, `System & Governance`) são **fases posteriores** (§5 do AUREA.md), não
> camadas de ficha de componente. Ficam registradas na §2 como direção.

`AureaProvider` é **Providers/System**, não Foundation (é infra de runtime, não UI).

---

## 2 — Mapa-alvo das macroáreas (ilustrativo, não-vinculante)

Ordem-alvo de crescimento. Cada área vira realidade **só quando um consumidor puxa**.
Os inventários são exemplos do que *poderia* povoar cada categoria — não um checklist.

```
00. Foundations        → tokens, cor, tipografia, spacing, shape, elevation,
                          motion, responsivo, densidade, iconografia, ilustração,
                          imagery, content design, a11y, i18n, platform adaptation
01. Primitives         → layout / interaction / structural / utility primitives
02. Core Components     → Actions · Form Structure · Text Entry · Selection ·
                          Date & Time · File Input · Search/Filter/Commands
03. Navigation/Overlay  → Navigation · Disclosure · Menus · Overlays
04. Feedback & Status   → Feedback · Status & Labels · Progress & Loading
05. Data & Content      → Identity · Content Display · Metrics/KPI · Lists ·
                          Tables & Grids · Data Visualization (charts)
06. Layout & Shells     → Application Layout · Structural · Responsive Patterns
07. Media/Images/Files  → Media · Images · File Management
08. Editors             → Editors · Editor Building Blocks
09. Code & Dev Tools    → Code · Runtime Tools · API Tools
10. Observability       → logs, traces, metrics, health, incidents, SLO/SLA
11. Communication       → Messaging · Inbox · Calls
12. Collaboration       → cursores, comentários, presença, review/approval
13. Workflow / PM       → Kanban, Gantt, board, automation (camada Kibo)
14. Scheduling          → calendars, agenda, booking
15. Maps & Location     → map, markers, routes, layers
16. Commerce & Billing  → produto, carrinho, checkout, faturamento
17. Auth/Account/Sec    → login, conta, permissões, segurança
18. AI & Agents         → prompt, chat, tool-calls, artifacts (extensão opcional)
19. Device & System     → theme/locale switch, status de rede/bateria/permissão
20. Marketing           → hero, pricing, testimonial (separado do produto)
21. Patterns            → soluções completas (não é componente — ver §5 AUREA.md)
22. Templates/Examples  → telas inteiras (não é componente)
23. Domain Extensions   → kits instaláveis: enterprise, devops, indústria,
                          logística, CRM, finanças, saúde, educação, CMS, geo
24. System & Governance  → registry, status, docs obrigatórias, qualidade
```

Referências de organização (só organização, nunca cópia/identidade — AUREA.md §2):
Untitled UI (foundations / base / application / examples / marketing), Kibo UI
(components / blocks / patterns; componentes de alto nível como Gantt/Kanban),
Carbon (patterns como combinação reutilizável).

---

## 3 — Disciplina de nomenclatura (vincula ao adicionar componente)

Nomes não são sinônimos. Cada um tem uma função semântica única:

1. `Menu` executa ações · `Select` escolhe um valor.
2. `Table` apresenta dados · `DataGrid` navega/edita (comportamentos diferentes).
3. `Tooltip` explica · `Popover` oferece conteúdo/interação.
4. `Alert` fica no contexto · `Toast` é temporário · `Banner` afeta área ampla ·
   `Notification` mora numa central.
5. `Field` organiza label+controle+descrição+erro · `Input` é só o controle.
6. `Badge` = metadado curto · `Tag` = classificação removível/selecionável ·
   `Pill` = formato visual (não é finalidade) · `Status` = condição operacional.
7. `Shell` = estrutura completa de app/módulo.
8. `Group` = coleção coordenada do mesmo controle.
9. Componente composto **reutiliza** os menores (não reimplementa).
10. Classifique pelo **objetivo do usuário**, não pela aparência.
11. Nunca categoria `Other`/`Miscellaneous`/`Utilities`.
12. Componente especializado **não** entra no Core.
13. Pattern não mora na mesma pasta de Component.
14. Template não é importado como primitive.
15. Figma e código usam a **mesma** nomenclatura; um responsável semântico por peça.

Renomeações sugeridas (quando chegar a fase de refactor, **não agora**):
`CommandPaletteShell` → `CommandPalette` (`.Root/.Input/.List/.Group/.Item/.Empty`).

---

## 4 — Reorganização dos 59 atuais (aplicada na Fase 1)

Categorias travadas no gate para os componentes que **existem hoje**:

```
Actions        Button · IconButton · ButtonGroup · Toolbar · ToolbarButton ·
               ToolbarGroup · ToolbarSeparator
Inputs         Input · Textarea · Checkbox · Radio · Switch · SegmentedControl ·
               Select · Combobox · MultiCombobox · SearchField · FileInput ·
               Range · Field
Navigation     Breadcrumb · Tabs · Pagination · TreeView · CommandPaletteShell
Overlays       Dialog · Drawer · Popover · Tooltip · DropdownMenu · ContextMenu
Feedback       Alert · Banner · Badge · Progress · Skeleton · EmptyState ·
               NotificationCenter
Disclosure     Accordion
Data Display   Table · DataGrid · DataList · KPI · Timeline
Identity       Avatar
Layout         AppShell · Card · Grid · Stack · Cluster
Media          MediaPlayer · MediaPlayerShell
Code           CodeBlock · CodeEditor · LogStream
Communication  MessageComposer · MessageList
System         Icon · AureaProvider
```

Re-buckets aplicados (endossados): `AureaProvider`→System · `Accordion`→Disclosure ·
`Avatar`→Identity. O 4º (**Field ≠ Input**) fica registrado como **regra de nome +
`layer`** (`Field` é `Composite`; `Input` é `Component`), **não** como categoria de um
membro só — YAGNI evita bucket-fantasma. `LogStream` fica em Code até um consumidor
puxar o módulo **Observability** (§2, área 10), quando migra.

Singletons de hoje (`Disclosure`, `Identity`) são categorias **reais** da direção que
vão crescer — não são catch-all.

---

## 5 — Governança-alvo (direção; adotada por pull)

Metadados que a ficha pode ganhar quando fizer falta (hoje ela já tem name, category,
layer, maturity, platforms, tokens, a11y, dependencies, related, source — mais
`variantProp`/`sizeProp`, opcionais, que dizem QUAL prop carrega a escala quando não é a de
nome óbvio; o `Drawer` usa `side`. Só fazem sentido desde 21/08/2026, quando o check 14 passou
a conferir `variants` e `sizes` contra a emissão do compilador e a ficha precisou de um jeito
de apontar a prop certa):

- **Registry:** package, owner, version, a11y status, figma parity, code parity,
  test coverage, deprecation status, replacement component.
- **Status formal (alvo):** `Draft · Experimental · Alpha · Beta · Stable ·
  Deprecated · Retired`. (Hoje o `maturity` do gate usa
  `Draft/Ready/Stable/Universal/Deprecated` — reconciliar quando/se necessário.)
- **Eixos de variante (não inventar solto):** Appearance (solid/subtle/outline/
  ghost/link/plain) · Tone (neutral/brand/info/success/warning/danger) · Size
  (xs/sm/md/lg/xl) · Density (compact/default/comfortable/touch) · Emphasis (high/
  medium/low).
- **Estados possíveis (documentar os aplicáveis):** default, hover, focus,
  focus-visible, active, pressed, selected, checked, indeterminate, expanded,
  collapsed, disabled, read-only, loading, success, warning, invalid, error, empty,
  skeleton, offline, overflow, truncated, dragging, drop-target.
- **Tokens em camadas (alvo do pacote tokens):** `Primitive → Semantic → Component →
  Contextual` (ex.: `yellow.500 → color.brand.primary → button.background.primary →
  dashboard.alert.warning.background`). DTCG 2025.10 já é a decisão (AUREA.md).
- **A11y baseline:** WCAG 2.2 AA + WAI-ARIA APG para contratos de teclado/foco/role.
- **Qualidade:** já temos vitest + axe + playwright (53 testes). **Não** adotar
  Storybook por hábito — só se um consumidor real justificar.

## 6 — Divisão de pacotes (alvo; NÃO criar vazios agora)

Core permanece pequeno (`tokens · themes · icons · primitives · components · layout ·
forms`). Os demais (`data · charts · editors · media · files · communication ·
collaboration · workflow · scheduling · maps · commerce · auth · ai · observability ·
marketing · patterns · templates`) são **instaláveis, criados por pull**. Pacote vazio
apodrece — nenhum nasce antes de ter conteúdo real que o justifique.
