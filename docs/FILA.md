# A fila — o que falta, e como o HeroUI faz cada item

**Fotografia de 01/10/2026**, feita na sessão que fechou a R-20 (versão `0.12.4`), e atualizada no
mesmo dia pelo Lote F do nativo (versão `0.14.0`, ver §0). Fonte: o
documento de achados dos consumidores, que vive com o Victor (ver `CLAUDE.md` §3), conferido ID a
ID contra o `CHANGELOG.md`. **Peça ao Victor a versão mais nova antes de confiar nesta lista** —
ela envelhece a cada lote.

A pesquisa segue a ordem do `CLAUDE.md` §2: **primeiro o HeroUI**; só onde ele não tem a peça,
o **ReUI**. Desde 01/10/2026 a fila de referências tem cinco degraus — **HeroUI → ReUI → Shark UI
→ Untitled UI → MUI** (ordem do Victor; tabela no `CLAUDE.md` §2). Esta pesquisa foi feita antes
e só desceu até o ReUI: onde está **[ninguém]**, ainda falta olhar Shark UI, Untitled UI e MUI.
Nada aqui é da memória:

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

## 0. O que saiu desde esta fotografia

| versão | o quê | estado |
|---|---|---|
| `0.12.4` | **R-20**: o estado (`marcado`, `escolhido`, `desligado`, `aberto`, `ocupado`) chega ao leitor de tela da **web** em `aria-*`. Os 26 pontos do nativo | **publicada em 01/10/2026** (pedido #15), pelo terminal do Victor. Falta conferir no app, na web |
| `0.13.0` | **ADR-0053**: a fonte é a Atkinson Hyperlegible Next e Mono, e os ícones são o Phosphor, com a forma cheia no item escolhido. Resolve a **R-17** (o Phosphor tem coroa e moto). **Quebra** nomes de ícone | **publicada em 01/10/2026** (pedido #17, fotos da CI nos #18 e #19), pelo terminal do Victor. Falta o teste de aparelho e os apps trocarem os nomes |
| `0.14.0` | **Lote F do nativo**: R-10 (`text-md` vira apelido de `text-sm`, sai na 1.0), R-12 (`Tabs variant="secondary"`), R-14 (`description` no item do `Combobox`), R-16 (`NumberField size="display"`, letra 30), R-19 (`icon` no `RadioGroup.Item`, 24). De passagem: a descrição do `RadioGroup` saía em 16 e passou a 14 | **feita em 01/10/2026, NÃO publicada**. Propostas aprovadas pelas pranchas (*"ok, 30 e 24"*); falta o Victor ver o antes e depois, o "pode" do envio e o aceite de aparelho (blocos LF do `apps/native-smoke`) |

**Decisão do Victor, 01/10/2026:** *"o restante vamos usar HeroUI como referência"*. As
decisões da seção 1 (R-10, R-11, R-13, R-19) e as medidas da seção 2 seguem a recomendação
escrita aqui, que já é a do HeroUI. Onde o HeroUI não tem nada (o 112 da R-15, a cor padrão da
R-13), desce-se a fila de referências do `CLAUDE.md` §2 antes de inventar. Cada lote ainda pede o
seu "pode". **Os ícones (R-17) ficaram em aberto** — ver a R-17.

---

## 1. Nativo — decisões que são do Victor

### ~~R-10 · `textSm` e `textMd` valem os dois 14~~ — feito na `0.14.0`

✅ O `text-md` aponta para o `text-sm` (`"$value": "{text-sm}"`), com `$deprecated`; sai na 1.0.
O CSS da Aurea passou a usar `--text-sm`. Nada muda na tela.

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

### ~~R-19 · ícone em cada opção do `RadioGroup`~~ — feito na `0.14.0`

✅ `icon?: IconName` no `RadioGroup.Item`: 24 (`iconLg`, escolha do Victor — o HeroUI usa 22 nos
ícones de lista, que não existe na Aurea), antes do texto, vão de 12, cheio na opção escolhida.

- **[HeroUI]** Ele não tem prop de ícone: o `RadioGroup.Item` aceita **filhos livres**
  (`<View><Label/><Description/></View><Radio/>`), e o ícone entra como mais um filho
  (`radio-group.md`, "Anatomy" e "Example").
- **Recomendação, se o Victor ainda quiser:** `icon?: IconName` no `RadioGroup.Item` — lista
  fechada, que é como a Aurea traduz os filhos livres do HeroUI (mesmo caminho do
  `indicatorPlacement`). Medida do ícone: a do `ListGroup`/menu do HeroUI, a ler no pacote antes.

---

## 2. Nativo — peças a acrescentar (só acrescentam)

### ~~R-12 · `Tabs` sem o fio amarelo~~ — feito na `0.14.0`

✅ `<Tabs variant="secondary">`, com o fio da casa (`fioDoEscolhido`, a mesma peça do
`SegmentedControl`). ⚠ **A web não tem a variante**; ver §6.

- **[HeroUI]** `Tabs` tem `variant: 'primary' | 'secondary'` (`tabs.types.ts:30`). O
  `secondary` é exatamente o pedido: a lista com **fio de 1** embaixo (`border-bottom-width: 1px`,
  cor da borda) e o indicador com **fio de 2** na cor de destaque
  (`styles/components/tabs.css:19` e `:93`).
- **Recomendação:** `<Tabs variant="secondary">` — o nome do HeroUI, não o `indicator="line"` da
  ficha. O fio de 2 em `primaryEmphasis`, como o `SegmentedControl`.

### ~~R-14 · item do `Combobox` sem segunda linha~~ — feito na `0.14.0`

✅ `description?: string` no `AureaComboboxItem`: 14, apagada. ⚠ **O `Combobox` da web não tem**
(`ComboboxOption` é `{value, label}`); ver §6.

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

### ~~R-16 · `NumberField` só até `lg`~~ — feito na `0.14.0`

✅ `size="display"`: letra `text3xl` (30, seminegrito, escolha do Victor), altura `controlHXl`,
largura `space24`, botões do `lg`.

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

#### Trocar o pacote de ícones, juntar dois, ou completar o Carbon? (**decidido em 01/10/2026**)

✅ **Decisão do Victor, depois de ver as opções lado a lado:** os ícones passam a ser o
**Phosphor Regular**, e a fonte passa a ser a **Atkinson Hyperlegible Next**
([ADR-0053](../decisions/0053-a-fonte-e-a-atkinson-e-os-icones-sao-o-phosphor.md)). A R-17 se
resolve com a troca: o Phosphor tem coroa e moto. A troca é um lote próprio, com "pode"; a ADR
lista o que ele obriga. Das quatro perguntas, três foram respondidas em 01/10/2026 (Fill no
item escolhido, Atkinson Hyperlegible Mono, IBM Plex Serif sai); falta o peso do ícone pequeno,
já medido. O texto abaixo é a análise que levou à
decisão, mantida como registro.

O Victor: *"temos um pacote grande e mesmo assim faltou; poderíamos substituir o pacote, ou
juntar, mas juntar acredito que os traços iriam destoar"*. Medido nos pacotes baixados com
`npm pack`, em 01/10/2026:

| coleção | nomes | grade | desenho | coroa? | licença |
|---|---|---|---|---|---|
| **Carbon** (o nosso), `@carbon/icons` 11.89.0 | 2.766 (a Aurea está na **11.84.0**, com 2.706) | 32 | **formas cheias**, cantos retos | **não**, em versão nenhuma; tem `gem`, `diamond--solid`, `trophy` | Apache-2.0 |
| Lucide, `lucide-static` 1.49.0 | 2.121 | 24 | **traço de 2**, pontas redondas | sim | ISC |
| Phosphor, `@phosphor-icons/core` 2.1.1 | 1.512, em **6 pesos** (fino a cheio) | 256 | traço ou cheio, conforme o peso | sim | MIT |
| Tabler, `@tabler/icons` 3.48.0 | contorno + cheio | 24 | traço de 2 | sim | MIT |

- **Juntar destoa — o Victor tem razão, e se mede:** o Carbon desenha forma cheia numa grade de
  32 (`svg/32/car.svg` é um `path` preenchido); o Lucide e o Tabler desenham **traço** de 2 numa
  grade de 24 (`stroke-width="2"`, `stroke-linecap="round"`). Lado a lado, um ícone fica mais
  grosso e mais redondo que o outro.
- **O Carbon é largo, mas não é para o app de consumo:** 275 dos 2.766 nomes são de produto da
  IBM, logotipo ou nuvem (`ibm--*`, `logo--*`, `watson*`, `cloud*`). Para veículo tem `car`,
  `scooter`, `bicycle`, `gas-station`, `fuel-can`, `road`, `tools` — e não tem moto.
- **Trocar o pacote** muda a identidade (o `CLAUDE.md` §5 diz *Carbon Icons*) e quebra a
  compilação de todo app que usa ícone: desde a A-04 o nome é conferido pelo TypeScript, e os
  nomes mudam todos.
- **Recomendação (a decidir):**
  1. **Agora:** subir o Carbon de 11.84 para 11.89 (+60 nomes, sem quebrar nada) e desenhar as
     poucas faltas **na gramática do Carbon** (grade de 32, forma cheia), num conjunto próprio da
     Aurea com o mesmo tipo de nome. A coroa é a primeira.
  2. **Trocar só se a lista de faltas for longa.** Falta a lista: hoje só a coroa está anotada.
     Se trocar, o candidato é o **Phosphor** — tem o peso cheio (próximo do Carbon) e o fino, e é
     MIT.
- **Pergunta ao Victor:** quais ícones faltaram, além da coroa? A sessão do app tem a lista.

### R-18 · `Timeline` com cara de estrada (opcional)

- **[ReUI]** `Timeline` com partes `TimelineItem`, `TimelineHeader`, `TimelineDate`,
  `TimelineTitle`, `TimelineIndicator`, `TimelineSeparator`, `TimelineContent`; `orientation`
  vertical ou horizontal; `value` = o passo atual. Nove exemplos, entre eles "alternating" (os
  itens dos dois lados da linha) — o mais perto da estrada.
- **Recomendação:** `variant="road"` na `Timeline` de hoje, com a disposição alternada do ReUI.
  Baixa prioridade (a ficha diz "acabamento").

---

### Achado de passagem (01/10/2026), sem lote

- **A descrição do `Toast` do nativo sai em 16**: `Text size="sm"` (`toast.tsx:292`), e no telefone
  o `sm` é 16 (ADR-0050). O HeroUI Native usa `text-sm`, 14 (`styles/components/toast.css:47`). É o
  mesmo defeito que a `0.14.0` corrigiu no `RadioGroup`. A descrição do `Dialog` está certa
  (`md` → 16, e o HeroUI usa `text-base`, 16).

## 3. Nativo — teste de aparelho que falta

Rodar `node apps/native-smoke/rodar.mjs` na máquina do Victor e olhar os blocos:

1. **E9** (`LinkButton`), **E10** (recuo de baixo das folhas), **E11** (`Grid` reparte a sobra)
   — `0.12.1`.
2. **BottomNav mais baixo** — `0.12.2`.
3. **RG** (`RadioGroup`, as duas posições da marca) — `0.12.3`.
4. **E7** e **E8** — `0.11.0`, publicados sem o aceite.
5. **R-20** no navegador: abrir o app na web e conferir `aria-checked` na opção marcada.
6. **iPhone: nunca rodou.** Antes de prometer a `1.0`.
7. **LF-12, LF-14, LF-16 e LF-19** (`Tabs` secundário, segunda linha do `Combobox`, `NumberField`
   grande, ícone no `RadioGroup`) — `0.14.0`.

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
| — | `Tabs` sem `variant="secondary"` na web | **[HeroUI]** `.tabs--secondary` no `@heroui/styles` 3.2.6 (`tabs.css:246`) | paridade com o nativo (R-12, `0.14.0`); a web hoje só tem a cápsula |
| — | item do `Combobox` sem `description` na web | **[HeroUI]** o item da lista aceita `Description` | paridade com o nativo (R-14, `0.14.0`) |
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

1. ~~Publicar a `0.12.4` (R-20)~~ — publicada em 01/10/2026. Falta rodar o teste de aparelho (§3).
2. Decisões rápidas do nativo: ~~R-10, R-19~~ (`0.14.0`). Faltam: **R-11** (pedir ao Victor o
   texto da ficha: a "saída 2" muda a forma de usar os ícones) e **R-13** (descer a fila de
   referências — Shark UI, Untitled UI, MUI — antes de propor a cor).
3. **Lote da troca de fonte e ícones** (ADR-0053): antes da `1.0`, porque quebra todo nome de
   ícone. Falta só o peso do ícone pequeno (ADR-0053).
4. Acréscimos do nativo que o app já espera: ~~R-12, R-14, R-16~~ (`0.14.0`). Falta a **R-15**,
   que espera a resposta do Victor: os 112 do desenho do app são medida ou desenho solto?
5. Web: C-08 e M-03 fecham sem código; C-11, B-05, B-06 + N-01 + N-03 num lote só (paginação).
6. Lote 5 (peças novas da web) depois da `1.0`, como o `CLAUDE.md` já diz.
