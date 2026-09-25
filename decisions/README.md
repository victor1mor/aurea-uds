# Registro de decisões (ADR)

Decisão importante fica aqui, com data e consequência. Antes disto, as decisões viviam como
prosa numerada em `AUREA.md` §4 — sem data, sem alternativa considerada, sem consequência — e
a auditoria de 26/07/2026 registrou a ausência como achado **M19**.

**Uma decisão registrada não se reabre sem evidência nova.** Reabrir por lembrança é como o
projeto perde tempo duas vezes no mesmo assunto.

---

✅ **OS CINCO NÚMEROS DUPLICADOS FORAM RESOLVIDOS — 14/09/2026, por ordem do Victor.**

`0016`, `0017`, `0018`, `0019` e `0020` carregavam **duas ADRs diferentes cada um**. **A mais
antiga ficou com o número**; a de 21–22/08/2026 foi renumerada para o próximo livre:

| era | virou | assunto |
|---|---|---|
| `0016` | **[0044](0044-semantica-tem-precedencia-sobre-coincidencia-de-token.md)** | semântica tem precedência sobre coincidência de token |
| `0017` | **[0045](0045-nao-trocar-motor-para-obter-uma-prop.md)** | não trocar de motor para obter uma prop |
| `0018` | **[0046](0046-uma-familia-e-medida-antes-de-compartilhar-valores.md)** | família é medida antes de compartilhar valores |
| `0019` | **[0047](0047-css-first-para-apresentacao-runtime-para-semantica.md)** | CSS-first para apresentação, runtime para semântica |
| `0020` | **[0048](0048-ordem-estrutural-e-geometria-sao-eixos-separados.md)** | ordem estrutural e geometria são eixos separados |

⚠ **Cada arquivo renumerado carrega a nota no topo**, dizendo de onde veio — e **a decisão, a data
e o conteúdo não mudaram**, só o identificador.

🔴 **O TRABALHO NÃO FOI O `git mv` — foi decidir as 27 MENÇÕES EM PROSA.** As 23 referências com
link (`[ADR-00XX](caminho)`) são mecânicas: rótulo e caminho andam juntos. As outras **não têm link
nenhum** — *"a decisão está na ADR-0018"* dentro de um comentário de código —, e aí `sed` é
corrupção de registro, não limpeza: das 27, **23 mudaram e 4 ficaram**, e cada uma foi decidida
LENDO o contexto contra o assunto das duas candidatas.

**Exemplo do que um `sed` cego teria destruído:** `inputs-client.tsx` menciona `ADR-0016` **duas
vezes** — a da linha 32 é sobre resolver por classe (CSS-first → `0047`) e a da 293 é sobre o
`radiogroup` do `SegmentedControl` (**continua `0016`**). Trocar as duas, ou nenhuma, estaria
errado nos dois casos.

**Achado em 14/09/2026**, passando o olho nos cabeçalhos das 49 ADRs — a linha `Estado:` de uma ADR é um cabeçalho, e envelhece igual.

| ADR | Assunto | Estado | Data da decisão |
|---|---|---|---|
| [0001](0001-modelo-de-pagina-do-catalogo.md) | Modelo de página do catálogo: núcleo comum + extras por tipo (decide **D3**) | aceita · emendada 30/07 | 30/07/2026 |
| [0002](0002-altura-fixa-do-demo.md) | O demo tem altura fixa, e o preview pequeno flutua (registra **B1**) | aceita | 24/07/2026 |
| [0003](0003-gaveta-de-navegacao-sem-javascript.md) | A navegação do shell recolhe com o popover nativo (fecha **A8**; geometria emendada pela 0035) | aceita · emendada | 30/07/2026 · 20/08/2026 |
| [0004](0004-motor-headless-base-ui.md) | Motor headless: Base UI | aceita | 16/07/2026 |
| [0005](0005-tokens-em-dtcg.md) | Tokens no formato DTCG | aceita | 16/07/2026 |
| [0006](0006-fontes-em-pacote-proprio.md) | As fontes moram num pacote próprio | aceita | 16/07/2026 |
| [0007](0007-sem-gradientes.md) | Sem gradientes, nem os funcionais | aceita · gateada | Fase 0 (07/2026) |
| [0008](0008-licenca-e-gestor-de-pacotes.md) | Apache-2.0 e pnpm workspaces | aceita · gateada | 16/07/2026 |
| [0009](0009-modelo-push-e-travar-depois.md) | Construir tudo na Aurea e travar depois | aceita · condição pendente | 26/07/2026 |
| [0010](0010-distribuicao-npm-publico.md) | Distribuição: npm público, escopo `@aurea-uds` | aceita · **não executada** | 30/07/2026 |
| [0011](0011-registry-como-fonte-do-componente.md) | O registry é a fonte do que um componente é | aceita · gateada | 23/07/2026 |
| [0012](0012-idioma-do-produto-e-ingles.md) | O produto fala inglês; a conversa é em português | aceita | 23/07/2026 |
| [0013](0013-mecanica-de-publicacao-npm.md) | Como se publica: publish local com 2FA (o resto **emendado pela 0021**) | aceita · publish manual **feito 2×** (`0.1.0`, `0.2.0`); trusted publisher **adiado** | 31/07/2026 |
| [0014](0014-primeira-versao-publica-0-1-0.md) | A primeira versão pública é `0.1.0` (fecha a condição 3 da 0010) | aceita · **publicada** | 31/07/2026 |
| [0015](0015-cobertura-antes-da-demanda-ate-a-1-0.md) | Até a `1.0`, a fila é COBERTURA do contrato, não demanda puxada (suspende `BUILDING.md` §5) | aceita · vigente | 02/08/2026 |
| [0016](0016-segmented-control-e-radiogroup.md) | O `SegmentedControl` é `radiogroup`, não botões alternáveis (fecha o achado M20) | aceita · aplicada | 07/08/2026 |
| [0017](0017-categoria-ai-agents.md) | A categoria "AI & Agents" entra na taxonomia travada (Parte H) | aceita · aplicada | 09/08/2026 |
| [0018](0018-estados-universais-sao-um-eixo-a-parte.md) | Os estados universais são um eixo à parte de `variant`, e são **sete** (Parte J) | aceita · aplicada | 09/08/2026 |
| [0019](0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md) | Suíte em três motores, pixel num só; a gaveta do `AppShell` gere o próprio foco; e ela continua NÃO-MODAL (K1) | aceita · aplicada | 09/08/2026 · Decisão 3 em 10/08/2026 |
| [0020](0020-a-proxima-versao-e-0-2-0-nao-1-0.md) | A próxima versão é a `0.2.0`, não a `1.0`: a condição de saída de `0.x` era **circular** — o que está no npm não instala em RSC (K5) | aceita · **executada** | 11/08/2026 |
| [0021](0021-o-publicador-confiavel-fica-adiado.md) | O publicador confiável (K2) fica **adiado sem data**: publicar segue manual com 2FA, porque **não automatizar** é a saída que a 0013 não listou (emenda a 0013) | aceita · vigente | 12/08/2026 |
| [0022](0022-consumidor-real-e-projeto-do-victor.md) | "Consumidor real" (K4) é projeto do Victor, desde que instale **do npm** e exista por si — a Aurea foi feita para os projetos dele (emenda a 0014) | aceita · aguardando o primeiro consumo | 13/08/2026 |
| [0023](0023-o-portao-de-permissao-e-componente.md) | O portão de permissão **é** componente (`AccessGate`), e `aria-disabled` passa a significar inerte-mas-alcançável no `Button` — a ADR nasceu dizendo o contrário e foi corrigida pelo Victor no mesmo dia | aceita · corrigida no dia | 13/08/2026 |
| [0024](0024-mascara-de-campo-e-o-momento-nao-o-formato.md) | **Não existe componente de máscara**, e é decisão: a Aurea entrega o MOMENTO (`Input.formatOnBlur`, `NumberField.format`) e o formato fica com o consumidor | aceita · vigente | 15/08/2026 |
| [0025](0025-editor-por-blocos-sem-motor.md) | **O `BlockEditor` entrega a MOLDURA dos blocos, não o motor de texto rico** — sem dependência nova; a colagem, e o XSS que vem com ela, fica com quem tem contexto para sanitizar | aceita · vigente | 15/08/2026 |
| [0026](0026-marcacao-pura-e-de-servidor.md) | **Marcação pura mora em `markup.tsx`, sem diretiva**: 22 componentes deixam de chegar como cliente — `Card` custava 118,5 KB e é uma `<div>`. O `Accordion`, a 0,3 KB, já era a prova | aceita · vigente | 15/08/2026 |
| [0027](0027-a-cor-no-alvo-nativo.md) | **O nativo não recebe hex sozinho**: 20 dos 95 tokens `oklch` estouram o sRGB e o amarelo da marca corta a **ΔEok 0,0225**, em cima do limiar do perceptível. Adapter emite gamute largo + hex de fallback | aceita · vigente | 15/08/2026 |
| [0028](0028-unistyles-como-motor-de-estilo-nativo.md) | ~~Unistyles v3 é o motor de estilo do nativo~~ — **superada pela 0037**. O que ela MEDIU continua valendo: cinco peers (Reanimated e Nitro entre eles), não roda no Expo Go, e o achado do eixo duplo | ⛔ **superada** pela [0037](0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md) | 15/08/2026 |
| [0029](0029-a-pagina-de-tokens-mostra-o-nome-real-e-o-escopo.md) | **A página de tokens mostra o nome REAL (`--chart-1`) e sob qual seletor ele vale** — os 261 chips mostravam um nome inexistente, e por isso 153 amostras eram caixas vazias. A folha sozinha não basta: 70 dos 175 nomes valem em mais de um grupo | aceita · vigente | 15/08/2026 |
| [0030](0030-a-barra-inferior-reusa-o-item-da-lateral.md) | **`BottomNav` recebe o `SidebarItem`** — uma lista, duas peles; tipo próprio obrigaria o consumidor a manter duas listas do mesmo menu. Mais: o `env(safe-area-inset-bottom)` é nosso e a `meta viewport` é do consumidor (degrada, não quebra), e a barra **não é `Tabs`** — item é link, nunca `role="tablist"` | aceita · vigente | 17/08/2026 |
| [0031](0031-a-lista-de-destinos-nao-e-chrome-de-aplicativo.md) | **`NavList` não é chrome de aplicativo** — `Sidebar` e `BottomNav` moram num `<nav>` e marcam `aria-current="page"`; esta é a lista de destinos DENTRO da página, então não é landmark e não tem item corrente (as duas viraram asserção). Mais: o valor da direita é um NÓ e não uma prop por acessório, sem superfície e sem divisor (quem agrupa é o `Card`), quem cede espaço é o TEXTO, e linha indisponível é `aria-disabled` — `:disabled` tira da ordem de foco | aceita · vigente | 18/08/2026 |
| [0032](0032-um-caminho-so-para-o-botao-que-fica-aceso.md) | **Um caminho só para o botão que fica aceso: `Toggle`** — o `pressed` do `Button` fica `@deprecated` (0.4.0, sai na `1.0`). Doze referências pesquisadas e **nenhuma** põe o estado no botão comum. Mais: a regra do APG/Spectrum de que **o rótulo não muda entre estados** — se vira "Mute"/"Unmute", é `Button` | aceita · vigente | 18/08/2026 |
| [0033](0033-o-raio-da-linha-sai-de-uma-conta.md) | **Raio do filho = raio do pai − padding** — linha de lista dentro de painel deixa de ser pílula (18px hoje, escrito como `calc()`). O Victor achou riscando um canto: `999px` desenha metade da ALTURA, então a pílula muda de raio quando a linha ganha segunda linha, e o erro era **8,8px**. **Primeira exceção autorizada à pílula**, e só para linha de lista | aceita · vigente | 18/08/2026 |
| [0034](0034-ter-a-variante-nao-e-usar-a-variante.md) | **Ter a variante não é usar a variante** — a lateral volta a **flutuar por padrão** e `flush` vira opt-in; o `AppShell` ganha `sidebarVariant`. A exceção de 18/08 autorizava a lateral a **poder** ser rente, e uma sessão leu como "troque o padrão": reescreveu 106 páginas do catálogo, deixou a variante prometida **inalcançável** pelo shell e **regravou 4 baselines** dizendo que não regravou nenhuma | aceita · vigente | 20/08/2026 |
| [0035](0035-sidebar-responsivo-sem-inventar-recursos.md) | **Sidebar responsivo sem inventar recursos** — gaveta abaixo de `lg`, largura do painel preservada, preview standalone íntegro, Tooltip hidratado também em `file://` e demos só com destinos existentes | aceita · aplicada | 20/08/2026 |
| [0036](0036-marca-e-um-eixo-e-o-amarelo-continua-invariavel.md) | **Marca é um eixo, e o amarelo continua invariável dentro dela** — `data-brand` ortogonal a `data-theme`, redefinindo **só cor**; primeira marca `lory` (60 tokens por tema, lidos do kit do consumidor e não inventados). Emenda a regra do `CLAUDE.md` sem afrouxá-la: sem `data-brand`, a Aurea é byte a byte a mesma | aceita · aplicada | 20/08/2026 |
| [0037](0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md) | **O motor de estilo do nativo é o `StyleSheet` puro, e a camada de tema é NOSSA** (supera a 0028). Reabriu por evidência nova: o plano do primeiro consumidor pede Expo Go, onde o Unistyles não roda. Some com a decisão tema × densidade | aceita · **executada** no Lote 0 (02/09/2026) | 31/08/2026 |
| [0038](0038-um-componente-por-icone-sobre-react-native-svg.md) | **Um componente por ícone sobre `react-native-svg`, gerado do SVG do `@carbon/icons`** — com `./icons/*` como forma documentada, porque o tree-shaking do Metro é experimental. Fecha a ÚLTIMA decisão que travava a Etapa 4 | aceita · **executada** no Lote 0: 2571 ícones, gate no check 38 (02/09/2026) | 31/08/2026 |
| [0039](0039-uma-familia-por-peso-no-nativo.md) | **No nativo cada peso é uma FAMÍLIA, e `fontWeight` não escolhe fonte** — medido na tabela `name` dos `.ttf`: só Regular/Italic/Bold moram em "IBM Plex Sans"; Medium e SemiBold são famílias próprias. `fontFamily` recebe o nome PostScript, e o mapa é injetado no provider | aceita · **executada** no Lote 0 | 02/09/2026 |
| [0040](0040-o-screen-adota-o-safe-area-context-como-peer.md) | **O `Screen` adota `react-native-safe-area-context` como peer `>=5`, e resolve a borda no NATIVO** — o `SafeAreaView` do próprio RN está deprecado desde a 0.81 e nunca fez nada no Android. O componente vence o hook `useSafeAreaInsets` por medição no fonte C++: o inset SOMA ao padding do tema dentro do Yoga, antes do primeiro quadro. A dependência já vem com o roteador, então o peer declara o que o app já ia ter | aceita · **executada** no Lote 1 | 03/09/2026 |
| [0041](0041-o-motor-de-grafico-do-nativo-e-nosso-sobre-react-native-svg.md) | **O motor de gráfico do nativo é NOSSO, sobre `react-native-svg`** — zero dependência nova (o svg já é peer desde os ícones). As quatro bibliotecas de RN foram medidas no registro: `victory-native` arrasta TRÊS peers nativos, `gifted-charts` exige gradiente (proibido desde a Fase 0), `svg-charts` peer em `svg ^6||^7`. A candidata real, `react-native-chart-kit`, cai por outra razão: ela é `data` entra / gráfico sai, enquanto o `recharts` da web é MARCA COMPOSTA — adotá-la inverteria a relação em que a Aurea segura e o motor desenha com as props dela. Escopo declarado: linha, área e barra; sem pizza, sem dois eixos, sem animação | aceita · **executada** em seguida | 09/09/2026 |
| [0042](0042-o-intl-e-o-formatador-do-nativo-e-a-volta-e-nossa.md) | **No nativo o formatador é o `Intl` do aparelho, e a VOLTA é nossa** — CONFIRMA a 0024 (formatar no blur, nunca ao vivo) e resolve o que muda sem Base UI: a ida é `Intl.NumberFormat`, e a volta (`lerNumero`) passa a existir, derivando os separadores do locale por número-SONDA porque `formatToParts` é só Android no motor. A premissa da demanda estava errada — há `onBlur` no RN, e o `Input` já o ligava. `notation: "compact"` é RECUSADO com aviso: quebrado nos dois sistemas (motor#768, motor#1035), e um "1,2 mi" errado parece certo. Zero dependência nova | aceita · **executada** no Lote 7 | 11/09/2026 |
| [0043](0043-o-combobox-nativo-diverge-da-web-e-a-presenca-da-prop-e-a-chave.md) | **O `Combobox` nativo diverge da web, e a PRESENÇA DA PROP é a chave** — busca remota de seleção ÚNICA não existe na web (lá o `Combobox` filtra no cliente e quem tem `onInputChange` é o `MultiCombobox`, que é múltiplo). Com `onSearchChange`, a Aurea não filtra; sem ele, filtra. `FlatList` e não `ScrollView` — é a razão material de o `Select` não servir para milhares de linhas. Papéis medidos no fonte do RN 0.87.1: `search` mapeia nos dois, `combobox` só no Android, e por isso o gatilho é `button`. Segunda divergência declarada do alvo nativo, depois da `Table` | aceita · **executada** no Lote 7 | 11/09/2026 |

> **A 0023 ficou 2 dias fora desta tabela** (escrita em 13/08, indexada em 15/08). O arquivo existia
> e o índice não sabia — que é o mesmo modo de falha do achado I1: a verdade em dois lugares, e um
> deles vencido. Quem escreve ADR nova acrescenta a linha aqui **no mesmo commit**.

## As decisões que NÃO ganharam ADR própria, e por quê

A tarefa T10.1 pedia ADR para toda decisão do `AUREA.md` §4. Escrevi ADR onde havia
**alternativa real com custo real** — é o que o formato serve para preservar. As de baixo já
estão decididas, em vigor e **cobradas por gate**: o registro delas é o gate, e um documento
cerimonial em cima disso seria mais um artefato para envelhecer (a lição do achado M6, o JSON
de 86 KB que ninguém consumia). Ficam aqui contabilizadas, com onde vivem e quem as obriga:

| Decisão | Data | Onde vive | Quem obriga |
|---|---|---|---|
| Taxonomia oficial em inglês, sem `Other` | 23/07/2026 | `DIRECTION.md` §4 | check 11 (`CATEGORY`) |
| Modelo de maturidade (Draft/Ready/Stable/Universal/Deprecated) | 23/07/2026 | `AUREA.md` §2.8 | checks 11 e 16 |
| Matriz de plataformas por componente | 23/07/2026 | ficha de cada componente | check 11 (`PLAT_STATUS`) |
| Escala de breakpoints (Tailwind) | 24/07/2026 | `packages/tokens` | check 4b, com legado congelado |
| Contrato de densidade e assimetria de tema | Fase 6 | `packages/tokens/README.md` | prosa + achados M17/M18 fechados |
| Camada `@layer aurea` no core | Fase 6 | `packages/core/src/aurea.css` | check 6 (`dist == build`) |
| Vocabulário do catálogo (Components/Patterns/Blocks/Recipes) | 22/07/2026 | `AUREA.md` §4 | o gerador e o check 13 |
| QRCode com módulos redondos | Fase 5 | comentário no componente | teste unitário do QRCode |
| O `Accordion` usa o marcador NATIVO do `<summary>`, não um chevron de ícone | Fase 11 | comentário na regra `.accordion` do core + `REFERENCES.md` | `tests/visual/skin.spec.ts` (a linha do cabeçalho) |
| Semântica tem precedência sobre coincidência de token; API não degrada em silêncio | 21/08/2026 | [ADR-0044](0044-semantica-tem-precedencia-sobre-coincidencia-de-token.md) | `button-tone.test.tsx` (distância ≥ 0,08 e matriz completa) + `tone-contrast.spec.ts` (AA nas 30 células) |
| Não trocar de motor para obter uma prop antes de provar que o motor atual é incapaz | 22/08/2026 | [ADR-0045](0045-nao-trocar-motor-para-obter-uma-prop.md) | `range-vertical.multi-motor.spec.ts` (6 casos × 3 motores) + a triagem de todo gap `missing-axis` |
| Família é medida antes de compartilhar valores, e passo de escala **não herda** | 22/08/2026 | [ADR-0046](0046-uma-familia-e-medida-antes-de-compartilhar-valores.md) | `responsivo.test.tsx` (5 casos) + `responsivo.multi-motor.spec.ts` (2 × 3 motores) |
| **CSS-first para apresentação; resolução em runtime quando a semântica depende disso** | 22/08/2026 | [ADR-0047](0047-css-first-para-apresentacao-runtime-para-semantica.md) | check 12c do `validate.py` + `comportamental.multi-motor.spec.ts` (7 × 3 motores) + `ssr-responsivo` + `custo-responsivo` |
| **Ordem estrutural e geometria são eixos separados; nada reordena o desenho sem reordenar o documento** | 22/08/2026 | [ADR-0048](0048-ordem-estrutural-e-geometria-sao-eixos-separados.md) | `adorno-estrutural.multi-motor.spec.ts` (7 × 3 motores) + `ordem-de-foco.spec.ts` (varredura sistêmica) |
| ~~**A escala de letras tem cinco degraus que se enxergam, e os dez nomes continuam**~~ — **substituída pela 0050** | 19/09/2026 | [ADR-0049](0049-a-escala-de-letras-tem-cinco-degraus-que-se-enxergam.md) | os dez `text-*` do `aurea.tokens.json` (check 36 do `validate.py`) + o bloco de escala no `packages/native/src/text.tsx` |
| **A escala de letras é a do HeroUI, nos dois alvos** (substitui a 0049) | 24/09/2026 | [ADR-0050](0050-a-escala-de-letras-e-a-do-heroui.md) | os dez `text-*` do `aurea.tokens.json` + o mapa `TAMANHO` do `packages/native/src/text.tsx` + `tests/unit/escala-heroui.test.tsx` |
| **O espaçamento dos primitivos de layout tem três degraus** (afrouxa a regra da ficha do `Stack`) | 24/09/2026 | [ADR-0051](0051-o-espacamento-dos-primitivos-tem-tres-degraus.md) | `Stack`, `Cluster` e `Grid` no `markup.tsx` + as classes `*-gap-*` do `aurea.css` + as três fichas |
| **O botão só de ícone é redondo** (muda a aparência publicada) | 25/09/2026 | [ADR-0052](0052-o-botao-so-de-icone-e-redondo.md) | `.btn-icon` e `.media-control` do `aurea.css` + o `IconButton` do `packages/native/src/actions.tsx` + `geometry.spec.ts` + `native-lote1.test.tsx` |
| `.empty-state` é centralizado, ao contrário do Carbon | Fase 11 | `REFERENCES.md` (a razão: coerência com `.notification-empty` e `.datagrid-empty`, que já estão em produção) | `tests/visual/skin.spec.ts` |

**Ainda abertas, e portanto sem ADR:** a **D2** (índice reverso "Used here" — metade já entrou
na Fase 7 como seção `uses`) e os alvos do Balde C além do `@aurea-uds/native`.

> O *emit de tokens para nativo* saiu desta lista em 02/09/2026: ele foi **executado** na Etapa 2
> (`@aurea-uds/tokens/native`, gate no check 36) e o pacote que o consome existe desde o Lote 0.

## Formato

Identificador, data, estado, contexto, alternativas **com o motivo da rejeição**, decisão,
como ela é obrigada (gate), consequências — incluindo os custos — e condição de revisão.

Decisão curta também vale ADR: a [0008](0008-licenca-e-gestor-de-pacotes.md) tem dois parágrafos
por assunto e serve ao mesmo propósito. O que não vale é decisão sem data e sem consequência.
