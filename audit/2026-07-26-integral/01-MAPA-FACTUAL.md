# Mapa factual — Aurea UDS — medido em 26/07/2026

Tudo aqui é **VERIFICADO** salvo marca contrária.

---

## 1. Identidade do projeto

| Campo | Valor | Evidência |
|---|---|---|
| Repositório | `C:\Aurea-UI`, branch `main`, sem tags | `git branch -a` |
| Versão do workspace | 1.7.0 | `package.json:4` |
| Marca | Aurea Universal Design System (Aurea UDS) | `AUREA.md:30` |
| Escopo npm | `@aurea-uds/*` | `packages/*/package.json` |
| Licença | Apache-2.0 (IBM Plex OFL 1.1, Carbon Apache-2.0) | `LICENSE`, `THIRD_PARTY_NOTICES.md` |
| Gestor | pnpm 11.16.0, workspace `packages/*` + `apps/*` | `package.json:7`, `pnpm-workspace.yaml` |
| Última alteração | commit `c4c0dc1` | `git log` |
| Arquivos versionados (fora `node_modules`) | 392 | inventário recursivo |

---

## 2. Tecnologias reais

| Camada | Tecnologia | Evidência |
|---|---|---|
| Tokens | DTCG 2025.10 em JSON, emissor próprio sem dependência | `packages/tokens/src/aurea.tokens.json`, `scripts/build-tokens.mjs` |
| CSS | CSS puro, custom properties, `color-mix()`, `oklch`, propriedades lógicas | `packages/core/src/aurea.css` |
| Comportamento web | JS vanilla (7 KB) + Base UI 1.6.0 para overlays | `packages/core/src/aurea.js`, `packages/react/package.json` |
| React | React 19.2.7, TypeScript 7.0.2 strict, build por `tsc` | `package.json:38`, `packages/react/tsconfig.json` |
| Ícones | Carbon Icons, sprite SVG de 1,26 MB gerado | `packages/icons/build-icons.mjs`, `dist/aurea-icons.svg` |
| Fontes | IBM Plex Sans/Serif/Mono, 11 WOFF2, 244 KB | `packages/fonts/files/` |
| Catálogo | SSR estático sem framework: `renderToStaticMarkup` no build | `scripts/build-catalog.mjs` |
| Testes | Vitest 4.1.10 + jsdom + jest-axe; Playwright 1.61.1 + axe-core 4.10.2 | `vitest.config.ts`, `playwright.config.ts` |
| Validação | Python (`scripts/validate.py`, 12 checks, 439 linhas) | leitura integral |
| CI | GitHub Actions, 4 jobs, actions fixadas por SHA | `.github/workflows/ci.yml` |
| Servidor local | `python -m http.server 8123` | `.claude/launch.json` |

**Não existe:** bundler, linter, formatter, type-check separado do build, changeset/
release automation, Storybook, publicação npm configurada.

---

## 3. Mapa arquitetural

```
tokens (DTCG json)
   └─ build-tokens.mjs ──> tokens/dist/aurea.tokens.css   (271 custom properties)
                                    │
core/src/aurea.css (87 KB, 376 classes, 698 linhas)
                                    │
   └─ build-core.mjs ──> core/dist/aurea.css = tokens.css + core.css   (96 KB)
                                    │
        ┌───────────────────────────┼──────────────────────────────┐
        │                           │                              │
   react/src/index.tsx        build-docs.mjs                build-catalog.mjs
   (arquivo único,            injeta <style> em            lê registry/*.json (65)
    899 linhas, 65 exports)   apps/docs/index.html          + content/**/*.mjs (35)
        │                     (670 KB, escrito a mão)        + aurea.contract.json
   tsc ──> react/dist                                        + patterns/*.md (23)
                                                                  │
                                                        169 .html + assets/
                                                        (fonts + core + 8 KB chrome)
```

Direção de dependência: tokens → core → {react, docs, catalog}. Sem ciclo.
O gerador do catálogo depende de `react/dist` (renderiza os componentes reais) e de
`core/dist` (embute o CSS). **VERIFICADO** em `build-catalog.mjs:547,652`.

---

## 4. Mapa do código

| Caminho | Papel real | Tamanho |
|---|---|---|
| `packages/tokens/src/aurea.tokens.json` | fonte única dos valores visuais | 47 KB, 271 folhas |
| `packages/tokens/dist/aurea.tokens.css` | saída gerada, não editar | 8,9 KB |
| `packages/core/src/aurea.css` | pele do sistema, 376 classes | 87 KB / 698 linhas |
| `packages/core/src/aurea.js` | comportamento sem framework (abas, copy, TOC, tema) | 7 KB |
| `packages/core/dist/*` | gerado: tokens + core concatenados | 96 KB |
| `packages/react/src/index.tsx` | **todos** os 65 componentes num arquivo | 87 KB / 899 linhas |
| `packages/react/dist/*` | gerado por `tsc` | 77 KB + 19 KB `.d.ts` |
| `packages/contracts/registry/*.json` | 65 fichas — fonte do catálogo | 828 B–4,1 KB cada |
| `packages/contracts/aurea.contract.json` | contrato do sistema (ícones permitidos, archetypes, hard rules) | 91 KB |
| `packages/contracts/component-inventory.json` | **sem consumidor** além do validador | 86 KB |
| `packages/icons/dist/aurea-icons.svg` | sprite Carbon completo | 1,26 MB |
| `packages/fonts/` | WOFF2 + `fonts.css` | 244 KB |
| `apps/catalog/*.html` | 169 páginas geradas, versionadas | 27–101 KB cada |
| `apps/catalog/content/**/*.mjs` | conteúdo rico: 21 componentes, 12 patterns, 2 blocks | 35 arquivos |
| `apps/catalog/assets/catalog.css` | fontes (300 KB) + core verbatim (96 KB) + chrome (8 KB) | 405 KB |
| `apps/docs/index.html` | catálogo legado escrito à mão, 13 seções | 670 KB / 2.139 linhas |
| `patterns/*.md` | 23 receitas de arquétipo de aplicação | 2,4–3,1 KB cada |
| `examples/vanilla/index.html`, `examples/react/App.tsx` | exemplos de consumo | 0,9 KB + 6,6 KB |
| `scripts/` | 5 geradores + validador | 82 KB |
| `tests/unit/components.test.tsx` | **todo** o teste unitário num arquivo | 52 KB / 928 linhas |
| `tests/visual/*.spec.ts` | 6 specs Playwright | 4,5 / 4,4 / 0,9 / 4,0 / 3,1 / 2,5 KB |
| `legacy-reference.html` | referência visual congelada, nunca editar | 612 KB |

**Onde adicionar coisa nova, hoje:** componente → `packages/react/src/index.tsx` +
`packages/core/src/aurea.css` + `packages/contracts/registry/<Nome>.json`
(+ opcional `apps/catalog/content/<Nome>.mjs`). Três a quatro arquivos, todos gigantes.
Nada nisso está escrito em documento algum. **VERIFICADO** por ausência.

---

## 5. Inventário de componentes

65 componentes exportados do pacote React, 65 fichas de registry, cobertura
conjunto-exato garantida por gate (`validate.py` check 11).

### Por categoria

| Categoria | N | Componentes |
|---|---|---|
| Inputs | 13 | Checkbox, Combobox, Field, FileInput, Input, MultiCombobox, Radio, Range, SearchField, SegmentedControl, Select, Switch, Textarea |
| Actions | 7 | Button, ButtonGroup, IconButton, Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator |
| Navigation | 8 | Breadcrumb, Pagination, Sidebar, TableOfContents, Tabs, Topbar, TreeView, CommandPaletteShell |
| Feedback | 8 | Alert, Badge, Banner, EmptyState, Progress, Skeleton, Status, Timeline |
| Data Display | 7 | Card, DataGrid, DataList, KPI, Table, Avatar, LogStream |
| Overlays | 6 | ContextMenu, Dialog, Drawer, DropdownMenu, Popover, Tooltip |
| Layout | 5 | AppShell, Cluster, Grid, Stack, MediaPlayerShell |
| Code | 3 | CodeBlock, CodeEditor, Kbd |
| Media | 2 | MediaPlayer, QRCode |
| Communication | 2 | MessageComposer, MessageList |
| System | 2 | AureaProvider, NotificationCenter |
| Disclosure | 1 | Accordion |
| Identity | 1 | Icon |

Distribuição desigual declarada: 13 em Inputs contra 1 em Disclosure e 1 em Identity.
Sem `Other` — regra cumprida.

### Por camada

Component 35 · Composite 20 · Primitive 5 · Shell 3 · Foundation 2.

### Por maturidade declarada

Stable 59 · Draft 4 · Ready 2. **Ver achado M7**: maturidade não reflete estado real.

### Estado real por componente (medido)

| Dimensão | Cobertura | Faltando |
|---|---|---|
| Ficha de registry válida | 65/65 | — |
| `tokens` declarados | 59/65 | AureaProvider, CodeEditor, DataList, EmptyState, Grid, ToolbarGroup |
| `states` declarados | 32/65 | 33 fichas |
| `props` publicadas (contrato de API) | 21/65 | 44 componentes |
| `variants` declaradas | 10/65 | 55 fichas |
| `sizes` declarados | 7/65 | 58 fichas |
| `a11y.apg` | 26/65 | 39 fichas |
| Conteúdo rico no catálogo | 21/65 | 44 componentes caem no fallback |
| Página com mais de 1 exemplo | 21/65 | 44 páginas com exatamente 1 |
| Mencionado em teste unitário | 29/65 | 36 componentes |

**Componentes sem nenhuma menção no teste unitário (36):** Accordion, Alert, Avatar,
Breadcrumb, Card, Checkbox, Cluster, CodeBlock, CommandPaletteShell, DataList, Dialog,
Drawer, EmptyState, Field, Grid, Icon, Input, KPI, LogStream, MediaPlayerShell, Popover,
Progress, Radio, Range, SearchField, SegmentedControl, Skeleton, Stack, Switch, Table,
TableOfContents, Tabs, Textarea, Timeline, ToolbarGroup, Tooltip.

**Componentes com conteúdo rico (21):** Button, ButtonGroup, Checkbox, Combobox, Field,
FileInput, IconButton, Input, MultiCombobox, Radio, Range, SearchField, SegmentedControl,
Select, Status, Switch, Textarea, Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator.

Distribuição de exemplos por página de componente:
44 páginas com 1 · 4 com 4 · 7 com 6 · 7 com 8 · 1 com 10 · 1 com 12 · **Button com 22**.

---

## 6. Inventário das fundações visuais

271 folhas DTCG emitidas como custom property — **185 nomes distintos**, porque
`theme.dark`, `theme.light` e as 3 densidades redeclaram nomes de `base`.
3 grupos de topo: `base`, `theme.{dark,light}`, `density.{compact,comfortable,spacious}`.

| Eixo | Tokens | Estado |
|---|---|---|
| Cor | 174 | completo; 3 rampas de 11 (`aether`, `ember`, `oracle`) + semânticas + superfícies + sidebar + chart 1–5 |
| Espaçamento | 15 (`--space-0`…`--space-24`, rem) | escala com furos deliberados (0,05,1..8,10,12,16,20,24) |
| Tipografia — tamanho | 11 (`--text-xs`…`--text-5xl`, rem) | completo |
| Tipografia — família | 3 | IBM Plex Sans/Serif/Mono |
| Tipografia — peso | **0** | **AUSENTE** — 15 `font-weight` crus no core |
| Tipografia — line-height | 3 (`--leading-*`) | 2 de 3 nunca usados; 5 `line-height` crus no core |
| Tipografia — letter-spacing | **0** | **AUSENTE** |
| Raio | 9 (`--radius*`) | unidades mistas (rem + px); 2 pares duplicados; 17 raios crus no core |
| Borda | 1 (`--border-width`) | nunca usado pelo core |
| Sombra | 4 (`--shadow-*`) | `--shadow-xs` nunca usado |
| Camadas / z-index | 6 (`--z-*`) | 2 nunca usados; 10 `z-index` crus no core |
| Duração / easing | 3 + 2 | `--duration-slow` nunca usado |
| Breakpoint | 5 (Tailwind: sm/md/lg/xl/2xl) | travado por gate; 6 breakpoints legados congelados convivem |
| Densidade | 8 chaves × 3 densidades | idênticas nas três — paridade OK |
| Tamanho de ícone | **0** | **AUSENTE** — `.icon-sm/lg/xl` em px cru |
| Área mínima de toque | **0** | **AUSENTE** — resolvido em CSS por `@media (pointer:coarse){min-height:44px}` |
| Foco | 2 (`--focus`, `--focus-strong`) | usado; ver M10 |
| Estado semântico | 4 famílias (success/warning/danger/info) × 3 níveis | assimetria dark/light (M18) |

### Densidade — o que realmente muda

`--control-h-xs/sm/md/lg/xl`, `--row-h`, `--card-pad`, `--section-gap`.
Consumidos 21 vezes no core. Valores:

| Token | compact | comfortable | spacious |
|---|---|---|---|
| control-h-md | 32px | 36px | 40px |
| control-h-lg | 38px | 42px | 48px |
| row-h | 42px | 48px | 54px |
| card-pad | 16px | 20px | 24px |
| section-gap | 18px | 24px | 32px |

Densidade **não** altera: tamanho de fonte, espaçamento geral, gaps, raios,
e não alcança `.tab`, `.segmented button` nem `.pagination button` (achado A1).

### Uso real dos tokens pelo core

O emissor produz **271 declarações** de custom property, que são **185 nomes distintos**
(o mesmo nome reaparece em `base`, `theme.dark`, `theme.light` e nas 3 densidades).

O core referencia 122 `var()` distintos, dos quais 10 são propriedades locais e não
tokens. Portanto: **112 dos 185 tokens são usados e 73 (39,5%) nunca são** — lista
completa em `02-ACHADOS.md`, M2.

---

## 7. Alcance do CSS que o consumidor baixa

Análise regra a regra de `packages/core/src/aurea.css` (87.216 bytes), classificando
cada regra pelo consumidor real que pode produzir aquelas classes:

| Alcance | Bytes | % |
|---|---|---|
| Produzível por componente React | 52.587 | 60,3 % |
| Só pela página de docs manual / mockups de produto | 22.091 | 25,3 % |
| Só pelo chrome do catálogo | 3.375 | 3,9 % |
| Regras sem classe (elemento, `:root`, `@media`, reset) | 9.162 | 10,5 % |
| Órfã (ninguém) | 0 | 0 % |

Nenhuma regra morta — mas 1 em cada 4 bytes serve superfície interna, não consumidor.
Ver achado A6.

---

## 8. Garantias automáticas existentes

| Gate | O que cobre | Onde |
|---|---|---|
| `validate.py` check 1 | 27 nomes privados, com auto-teste, UTF-16, invisíveis, base64 | repo inteiro |
| check 2–3 | JSON válido; tokens e seletores obrigatórios; **valor canônico** de amarelo/raios; comentários e chaves balanceados | core |
| check 4 | ausência de `gradient(` | core + docs |
| check 4b | breakpoint fora da escala Tailwind (legado congelado explicitado) | core |
| check 5 | todo token do pacote existe no core | tokens ⟷ core |
| check 6 | `dist == build` de core (CSS e JS) | core |
| check 7–8 | contrato embutido nos docs == pacote; `<style>` dos docs == build | docs |
| check 9 | 23 receitas ⟷ contrato, seções na ordem, índice do README | patterns/ |
| check 10 | LICENSE por pacote, OFL da IBM, NOTICE do Carbon em `files` | packages/ |
| check 11 | schema/enums das 65 fichas, token citado existe, ficha ⟷ export React, cobertura exata | registry |
| check 12 | catraca de pixel cru de **espaçamento** contra baseline versionada | 4 caminhos |
| `vitest` | 81 testes, 22 describes, 23 interações de teclado, **1** asserção axe | 29/65 componentes |
| `catalog-sweep` | 169 páginas × 7 larguras sem rolagem lateral; 1 h1 e sem salto; console limpo e sem 4xx; **axe com 5 tags em 169 páginas × 2 temas** | catálogo |
| `rtl.spec` | eixo inline espelha, glifos e mapa não | estilo computado |
| `status.spec` | variante não colapsa; rótulo não pintado pela variante | estilo computado |
| `catalog.spec` | screenshot de 8 recortes × 2 temas + 4 contratos de modelo de página | 1 página por tipo |
| `docs.spec` | 13 seções × 2 temas | screenshot |
| `matrix.spec` | variantes × estados × 2 temas × 3 densidades | screenshot |
| CI | `pnpm audit --audit-level=high`, build com árvore limpa, smoke ESM, smoke SSR | GitHub Actions |

**Resultado da execução hoje:** validate OK · 81/81 unit · 13/13 nos gates duros de
Playwright (sweep + RTL + status).

**Gate de pixel INATIVO no CI:** não existe nenhum `*-linux.png` no repositório;
o passo de screenshot emite `::warning::` e não bloqueia
(`ci.yml:121-127`). Os 48 baselines existentes são `-win32`
(16 do catálogo, 26 dos docs, 6 da matriz).
Follow-up **A4 da auditoria de 18/07** — segue aberto.
