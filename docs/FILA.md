# A fila — o que falta, e como o HeroUI faz cada item

**Fotografia de 01/10/2026**, feita na sessão que fechou a R-20 (versão `0.12.4`). Fonte: o
documento de achados dos consumidores, que vive com o Victor (ver `CLAUDE.md` §3), conferido ID a
ID contra o `CHANGELOG.md`. **Peça ao Victor a versão mais nova antes de confiar nesta lista** —
ela envelhece a cada lote.

A pesquisa segue a ordem do `CLAUDE.md` §2: **primeiro o HeroUI**; só onde ele não tem a peça,
o **ReUI** (pedido do Victor, 01/10/2026). Nada aqui é da memória:

- HeroUI lido nos pacotes baixados com `npm pack` em 01/10/2026: `heroui-native` **1.0.10** (o
  telefone), `@heroui/react` e `@heroui/styles` **3.2.6** (a web). O arquivo está ao lado de cada
  afirmação.
- ReUI lido nas páginas de `reui.io/docs/components/*`, abertas em 01/10/2026. Licença: **MIT**
  nos componentes abertos (página `reui.io/legal/license`); os "Pro" são pagos e não entram.
- ⚠ **Ler não é copiar.** Copiar código só com ordem do Victor, com crédito no
  [`REFERENCES.md`](REFERENCES.md) (`CLAUDE.md` §7). O ReUI é feito para shadcn: dele se lê a
  **anatomia**, nunca a aparência (`CLAUDE.md` §5).

Legenda: **[HeroUI]** ele tem · **[ReUI]** o HeroUI não tem, o ReUI tem · **[ninguém]** nenhum dos
dois tem — cria-se *"pensando como o HeroUI criaria"*.

---

## 0. Feito e ainda não publicado

| versão | o quê | falta |
|---|---|---|
| `0.12.4` | **R-20**: o estado (`marcado`, `escolhido`, `desligado`, `aberto`, `ocupado`) chega ao leitor de tela da **web** em `aria-*`. Os 26 pontos do nativo | "pode" para empurrar, junção, publicação pelo Victor |

---

## 1. Nativo — decisões que são do Victor

### R-10 · `textSm` e `textMd` valem os dois 14

- **[HeroUI]** O `heroui-native` usa a escala do Tailwind: `text-xs` 12 · `text-sm` 14 ·
  `text-base` 16 · `text-lg` 18 · `text-xl` 20 · `text-2xl` 24. **Não existe `text-md`.**
  Contado nos estilos dele: `xs` 8 usos, `sm` 47, `base` 51, `lg` 22, `xl` 2, `2xl` 3 — e nenhum
  `md`.
- **Recomendação:** saída 1 da ficha — o `textMd` sai da escala (fica apontando para o `textSm`
  enquanto houver uso, com aviso no CHANGELOG). É o que o HeroUI tem: cada nome, um tamanho.
- O que a tela mostra já segue a [ADR-0050](../decisions/0050-a-escala-de-letras-e-a-do-heroui.md);
  só os nomes dos tokens ficaram para trás.

### R-11 · nome de ícone próprio: a doc manda `declare module`, a trava do app barra

- **[ninguém]** O HeroUI não tem registro de ícones: os ícones dele são componentes soltos
  (`@heroui/react/dist/components/icons.js`, um `svg` por função).
- **Recomendação:** saída 2 da ficha — o tipo do nome sai do próprio registro feito com
  `criarRegistroDeIcones` (já é genérico). Assim o app tipa o logotipo sem mexer na Aurea, e a
  trava dele não precisa abrir exceção. É mudança de API (acréscimo): precisa de "pode".

### R-13 · `Chart` sem `color` sai azul

- **[ninguém]** O HeroUI aberto não tem gráfico. O ReUI também não. O shadcn (que o ReUI segue)
  **não tem cor padrão**: cada série recebe a cor na configuração (`var(--chart-1)` …
  `var(--chart-5)`), página `ui.shadcn.com/docs/components/chart`.
- A paleta azul é decisão registrada ([ADR-0041](../decisions/0041-o-motor-de-grafico-do-nativo-e-nosso-sobre-react-native-svg.md)): o `Chart` nativo é a única peça
  com geometria nossa.
- **Pergunta ao Victor:** com **uma** série, o padrão passa a ser o amarelo primário (o app já
  passa `t.color.primary` em toda chamada)? Com duas ou mais, a rampa azul continua.

### R-19 · ícone em cada opção do `RadioGroup`

- **[HeroUI]** Ele não tem prop de ícone: o `RadioGroup.Item` aceita **filhos livres**
  (`<View><Label/><Description/></View><Radio/>`), e o ícone entra como mais um filho
  (`radio-group.md`, "Anatomy" e "Example").
- **Recomendação, se o Victor ainda quiser:** `icon?: IconName` no `RadioGroup.Item` — lista
  fechada, que é como a Aurea traduz os filhos livres do HeroUI (mesmo caminho do
  `indicatorPlacement`). Medida do ícone: a do `ListGroup`/menu do HeroUI, a ler no pacote antes.

---

## 2. Nativo — peças a acrescentar (só acrescentam)

### R-12 · `Tabs` sem o fio amarelo

- **[HeroUI]** `Tabs` tem `variant: 'primary' | 'secondary'` (`tabs.types.ts:30`). O
  `secondary` é exatamente o pedido: a lista com **fio de 1** embaixo (`border-bottom-width: 1px`,
  cor da borda) e o indicador com **fio de 2** na cor de destaque
  (`styles/components/tabs.css:19` e `:93`).
- **Recomendação:** `<Tabs variant="secondary">` — o nome do HeroUI, não o `indicator="line"` da
  ficha. O fio de 2 em `primaryEmphasis`, como o `SegmentedControl`.

### R-14 · item do `Combobox` sem segunda linha

- **[HeroUI]** No telefone, o `Select` tem `Select.ItemDescription`: letra `--text-sm`, linha
  `1.375`, cor apagada (`styles/components/select.css:117`). Na web, o item da lista aceita
  `Description`.
- **Recomendação:** `description?: string` no `AureaComboboxItem`, com essas medidas nos tokens.

### R-15 · `EmptyState` com ícone pequeno e solto

- **[HeroUI]** O `EmptyState` dele é mínimo (`empty-state.css`: só recuo de 8, letra pequena,
  apagada) — é o recheio do vazio de uma lista, sem ícone.
- **[ReUI]** `Icon Tile`: o ícone dentro de uma moldura quadrada, *"para linhas de lista,
  cartões e estados vazios"*. Tamanhos: `xs` 24/14 · `sm` 32/16 · `default` 40/18 · `lg` 48/22 ·
  `xl` 56/28 (moldura/ícone). O shadcn faz o mesmo com `EmptyMedia variant="icon"`.
- **Recomendação:** `iconFrame` no `EmptyState` com lista fechada (`sm` | `md` | `lg`). O desenho
  do app pede 112 — **maior que o maior do ReUI** (56). Perguntar ao Victor se 112 é medida ou
  desenho solto antes de criar escala nova.

### R-16 · `NumberField` só até `lg`

- **[ninguém]** O `NumberField` do HeroUI web tem só `variant` (`primary`/`secondary`), sem
  tamanho grande (`number-field.css:179`). O telefone não tem `NumberField`. O ReUI tem
  `Number Field`, sem tamanho de destaque.
- **Recomendação:** `size="display"` acrescentado à lista (o `lg` fica). A letra sai da escala de
  títulos que já existe (`Heading` do B-02), não de número novo.

### R-17 · não há coroa para recurso pago

- **[ninguém]** O Carbon (os ícones da Aurea) não tem coroa. O HeroUI não traz pacote de ícones.
- O conjunto que o HeroUI usa na documentação, `@gravity-ui/icons` 2.22.0 (**MIT**), tem
  `crown-diamond.svg` — conferido no pacote baixado.
- **Pergunta ao Victor:** copiar a coroa do Gravity (com crédito) ou o app desenhar com
  `criarGlifo` (depende da R-11)?

### R-18 · `Timeline` com cara de estrada (opcional)

- **[ReUI]** `Timeline` com partes `TimelineItem`, `TimelineHeader`, `TimelineDate`,
  `TimelineTitle`, `TimelineIndicator`, `TimelineSeparator`, `TimelineContent`; `orientation`
  vertical ou horizontal; `value` = o passo atual. Nove exemplos, entre eles "alternating" (os
  itens dos dois lados da linha) — o mais perto da estrada.
- **Recomendação:** `variant="road"` na `Timeline` de hoje, com a disposição alternada do ReUI.
  Baixa prioridade (a ficha diz "acabamento").

---

## 3. Nativo — teste de aparelho que falta

Rodar `node apps/native-smoke/rodar.mjs` na máquina do Victor e olhar os blocos:

1. **E9** (`LinkButton`), **E10** (recuo de baixo das folhas), **E11** (`Grid` reparte a sobra)
   — `0.12.1`.
2. **BottomNav mais baixo** — `0.12.2`.
3. **RG** (`RadioGroup`, as duas posições da marca) — `0.12.3`.
4. **E7** e **E8** — `0.11.0`, publicados sem o aceite.
5. **R-20** no navegador: abrir o app na web e conferir `aria-checked` na opção marcada.
6. **iPhone: nunca rodou.** Antes de prometer a `1.0`.

## 4. Do app, não da Aurea

- **R-07** (a cor do círculo atrás do ícone) e **R-08** (`width="content"`): a Aurea já entrega;
  falta o app adotar.

---

## 5. Web — peças novas

| ID | peça | como fazem | recomendação |
|---|---|---|---|
| N-01 | contagem de resultados | **[HeroUI]** `Pagination.Summary` (`pagination.d.ts`): o texto "1–10 de 100" é parte da paginação | parte da `Pagination`, não peça solta |
| N-02 | controle de ordenação | **[HeroUI]** ordenação mora no cabeçalho da `Table` (`sortDescriptor`); fora dela, é um `Select` | `Select` com um ícone de direção; sem peça nova |
| N-03 | itens por página | **[ReUI]** `DataGridPagination` com `sizes={[4, 8, 16]}`; o HeroUI não tem | prop `pageSizes` na `Pagination` (junto do B-06) |
| N-04 | alternar visualização | **[HeroUI]** `ToggleButtonGroup` (`toggle-button-group.d.ts`: `size`, `orientation`, `fullWidth`, `isDetached`) | `ToggleButtonGroup` da Aurea; o alternador é um uso dele |
| N-05 | anexo para baixar | **[ReUI]** `File Upload`, exemplo "Table Upload": ícone pelo tipo, nome, tamanho (`formatBytes`) e botão de baixar | `Attachment` com ícone, nome, tamanho e ação |
| N-06 | tags por categoria | **[HeroUI]** `TagGroup` + `Tag` (web e telefone), com `size` e `variant` | `TagGroup` da Aurea; categoria = um grupo com `Label` |
| N-07 | código com copiar | **[ReUI]** `Code Block` com `CodeBlockCopyButton`; o HeroUI 3 não tem (o `Snippet` era da 2) | `copyable` no `Code` do B-02, sem o realce de sintaxe do ReUI |
| N-08 | mosaico com "+N" | **[ninguém]** | criar na `Card`, depois do desenho aprovado |
| N-09 | página avulsa centrada | **[ninguém]** | peça de leiaute pequena; perguntar o nome ao Victor |
| — | partes do `Card` | **[HeroUI]** `Card.Header`, `Card.Title`, `Card.Description`, `Card.Content`, `Card.Footer` (`card/index.d.ts`). Não tem `Overlay` nem `Section` | seguir as cinco do HeroUI; `Overlay`/`Section` só se o app provar a falta |

## 6. Web — o que está aberto

| ID | o quê | como o HeroUI faz | recomendação |
|---|---|---|---|
| B-04 | `AppShell` sem controle de medida/mobile | **[ninguém]** | ler a ficha de novo; decidir com o Victor |
| B-05 | `Skeleton` sem props | **[HeroUI]** `animationType`: `shimmer` · `pulse` · `none` (`skeleton.css`); tamanho por classe | `animation="pulse" \| "none"`. ⚠ o `shimmer` dele é **gradiente** — proibido (§5) |
| B-06 | `Pagination` sem primeira/última e sem itens por página | **[HeroUI]** partes `Summary`, `Content`, `Item`, `Link`, `Previous`, `Next`, `Ellipsis`; `size` `sm`/`md`/`lg`. **Não tem primeira/última** | seguir as partes dele; primeira/última só com "pode" (o HeroUI não tem) |
| B-11 | campos irmãos não alinham | **[ninguém]** | `subgrid` no `Grid`; medir antes |
| B-13 | `DependencyGraph` sem estado na aresta | **[ninguém]** — peça só nossa | acréscimo de `id`/`selected` |
| C-06 | `option` sem estilo no escuro | — | **medir**: provavelmente morreu com o `Select` novo |
| C-08 | `Button` com vão fixo de 8 | **[HeroUI]** também fixo: `gap-2` (8) em **todos** os tamanhos (`button.css:5`; `--sm` e `--lg` não mexem no vão) | **fechar sem mudar** — igual ao HeroUI |
| C-11 | `Tooltip` em texto só abre pelo teclado com `tabIndex` | **[HeroUI]** o `Tooltip.Trigger` põe ele mesmo o foco: `useFocusable` + `role="button"` (`tooltip.js:138-153`) | o gatilho da Aurea faz o mesmo |
| C-12 | sprite de ícones de 1,27 MB | **[HeroUI]** um componente por ícone, importado um a um | ícone por arquivo na web, como o nativo já faz (`icons/*`) |
| C-14 | `DataGrid` preso ao TanStack Table 8 | **[ReUI]** a grade dele já usa o **TanStack Table 9**. No npm: `latest` = **9.2.4**; a Aurea pede `^8.21.3` (`packages/react/package.json`) | subir para a 9 numa cópia, com "pode" (muda a dependência) |
| M-03 | tema por componente | **[HeroUI]** não tem: as variantes só trocam variáveis de CSS (`button.css`: *"Color variants - only set custom property values"*) | fechar como "igual ao HeroUI" ou decidir |
| M-04 | variantes em lista fechada | **[HeroUI]** a lista é fechada no componente, mas o `@heroui/styles` exporta `buttonVariants` (feito com `tailwind-variants`) para quem quer estender | decidir: expor as classes BEM como API documentada |

## 7. Pendências soltas (do `CLAUDE.md` §3)

- **Largura mínima do `Combobox`** — **[HeroUI]** não há mínima no campo: o texto tem
  `min-w-0 flex-1`, e a **lista** é que tem no mínimo a largura do gatilho
  (`min-w-(--trigger-width)`, `combo-box.css:17` e `:102`); `fullWidth` estica.
- **Vazio do `Select` e do `Combobox`** diferentes — **[HeroUI]** os dois usam o mesmo
  `EmptyState` (recuo 8, letra pequena, apagada) dentro da lista. Seguir: um vazio só.
- **Capa vertical cortada no `MediaEmbed`** — precisa de "pode".
- **Medir a web contra o `@heroui/styles`**, pela regra das medidas (o nativo começou pelo
  `Badge`).

---

## 8. Ordem sugerida (a decidir com o Victor)

1. Publicar a `0.12.4` (R-20) e rodar o teste de aparelho (§3).
2. Decisões rápidas do nativo: R-10, R-13, R-19, R-11.
3. Acréscimos do nativo que o app já espera: R-12, R-14, R-15, R-16.
4. Web: C-08 e M-03 fecham sem código; C-11, B-05, B-06 + N-01 + N-03 num lote só (paginação).
5. Lote 5 (peças novas da web) depois da `1.0`, como o `CLAUDE.md` já diz.
