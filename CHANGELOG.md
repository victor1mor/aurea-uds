# Changelog

Este arquivo existe porque a [ADR-0014](decisions/0014-primeira-versao-publica-0-1-0.md) definiu o
que `0.x` quer dizer aqui: **pode quebrar numa versão do meio, e a quebra sai com aviso — `0.x`
não é licença para quebrar em silêncio.**

Os **sete** pacotes sobem de versão **juntos**: `@aurea-uds/tokens`, `@aurea-uds/core`,
`@aurea-uds/icons`, `@aurea-uds/fonts`, `@aurea-uds/react`, `@aurea-uds/contracts` e
`@aurea-uds/native`. O formato segue o [Keep a Changelog](https://keepachangelog.com); a numeração
segue o [SemVer](https://semver.org), com a ressalva do `0.x` acima.

Nada aqui é palpite: toda contagem deste arquivo foi medida contra o commit publicado, e os comandos
estão em [How this was measured](#how-this-was-measured). As entradas até a `0.6.0` foram escritas
em inglês e ficam como estão: são registro.

---

## [Unreleased]

Nada além da `0.12.0`, logo abaixo, que está pronta e não publicada. As peças novas dela são
`Text`, `Heading`, `Paragraph` e `Code` (B-02), e o `ThemeToggle`. Quando o Victor publicar, esta
seção fica vazia.

---

## [0.12.0] — 2026-09-25

⏳ **Não publicada.** Espera o "pode" do Victor para o push, e o publish é dele.

É o **Lote 3** inteiro: A-04, B-09 (com os menus), o botão só de ícone redondo (ADR-0052), B-02,
E2 e M-01 — o M-02 foi descartado. Sobe o número do meio porque **pode quebrar**: o A-04 recusa
nome de ícone escrito numa variável `string`, o E2 faz o botão do nativo esticar numa coluna sem
alinhamento, e o botão só de ícone muda de forma. As imagens de antes e depois do B-09, dos menus,
do botão redondo e do B-02 foram aprovadas pelo Victor.

### ⚠ Mudou — leia antes de atualizar

- **A-04 · o nome do ícone é checado pelo TypeScript, na web e no nativo.** `IconName` deixou de
  ser `string` e passou a ser a lista dos 2571 nomes do Carbon, gerada da mesma fonte que monta o
  sprite e os ícones do nativo. `<Icon name="chevron-down">` (um traço só; o certo é
  `chevron--down`) compilava e não desenhava nada; agora não compila, em toda prop que recebe
  ícone. No nativo a chave do registro (`criarRegistroDeIcones`) também é conferida.
  - **Pode quebrar a compilação de quem passa ícone numa variável `string`.** Tipe a variável
    como `IconName`.
  - **Sprite próprio ou glifo de `criarGlifo`:** declare os nomes uma vez, em
    `interface AureaIconNames` (exemplo no `README.md` de cada pacote).
  - Medido antes: 359 nomes de ícone escritos nos exemplos, fichas e documentos, **nenhum**
    errado. O defeito era o tipo, não um nome.
- **B-09 · o foco é uma linha só, e ela sai de dois tokens novos:** `--focus-width` e
  `--focus-offset` (2px e 2px, os números do contrato que já existia). Mudar o foco do sistema
  inteiro é mudar uma linha. Toda regra de foco do core passou a usá-los. Duas coisas mudam na tela:
  - **Tabela com rolagem (`.table-region`) e `DataGrid`:** o foco era um halo claro de `--focus` a
    38%, difícil de ver. Agora é a linha de foco, por dentro, como o HeroUI 3.2.6 faz nas tabelas.
  - **Player de vídeo (`MediaPlayer`), tema claro:** o foco dos controles era marrom escuro em cima
    do fundo quase preto do player, e sumia. Agora é o amarelo, nos dois temas: o player redefine
    `--focus-strong` em vez de ter uma regra de foco à parte.
  - **Menus, foco de teclado:** o item em foco era só o fundo cinza, igual ao do mouse em cima;
    uma regra do destaque apagava a linha. Agora leva a linha de foco por dentro, como o `menu-item`
    do HeroUI 3.2.6. Com o mouse, continua só o fundo. Onde o foco fica no campo (`Combobox`,
    `CommandPalette`), o destaque continua sendo o fundo: ali o item nunca recebe o foco.
  - Pequenos, sem mudar o desenho: o controle de posição do player perdeu 1px de afastamento (3 →
    2), e a alça de redimensionar colunas da `DataGrid` desenha a linha por dentro (era 1px fora).
  - **Controle:** o `check 44` do `validate.py` lê toda regra de foco do core e reprova linha, cor
    ou afastamento escrito à mão e sombra no lugar da linha. O teste de navegador do contrato de
    foco mede também as peças que a amostra antiga não via. Os dois foram provados contra o CSS
    antigo.
- **E2 · o `Button` do nativo obedece o pai**, como o do HeroUI Native e o `.btn` da web num
  `.stack` (decisão do Victor, 25/09/2026). Saiu o `alignSelf: "flex-start"` que vencia a
  centralização de quem estava em volta: no `EmptyState` o botão ficava à esquerda e o resto no
  meio. ⚠ **A consequência:** numa coluna sem alinhamento o botão agora ocupa a largura toda — no
  rodapé do `Screen`, na ação do cartão da marca e em qualquer coluna do app. "Do tamanho do texto"
  se diz no pai: o `Stack` do nativo ganhou o `align` da web (`start`, `center`, `end`,
  `stretch`; novo tipo `AureaStackAlign`). O `IconButton` tem largura fixa, como o só-ícone do
  HeroUI, e nunca estica.
- **O botão só de ícone é redondo**, em todos os tamanhos, na web e no nativo
  ([ADR-0052](decisions/0052-o-botao-so-de-icone-e-redondo.md), decisão do Victor, 25/09/2026).
  Era um quadrado de canto 10px (6px nos dois menores). Vale para todo `IconButton`, os botões de
  fechar e os controles do player, que também perderam o recheio lateral para ficarem quadrados
  (eram 38×36). É como o HeroUI 3.2.6 faz.


### Adicionado

- **`ThemeToggle`, na web e no nativo** (pedido do Victor, 25/09/2026): o botão de claro e escuro
  com cor no ícone. No tema claro mostra a **lua, na tinta do texto**; no escuro, o **sol, no
  amarelo da marca** — o tema para onde se vai, e o nome dele diz isso ("Mudar para o tema
  escuro"). É um só-ícone redondo, sem cor solta. Peça exclusiva da Aurea: o HeroUI não tem troca
  de tema. Os glifos são os CHEIOS do Carbon (a lua de contorno ficava branca por dentro).
  ⚠ No nativo, `asleep--filled` (lua) e `light--filled` (sol) saem do registro do app, como os
  do `Alert`.

- **M-01 · `render` no `Button`, no `IconButton` e nos itens de navegação** (`Sidebar`,
  `BottomNav`, `NavList`, `Breadcrumb`) — decisão do Victor, 25/09/2026: só onde o app precisa do
  link do roteador. `render={<Link href="/relatorios" />}` desenha o link do roteador com a pele e
  o conteúdo da peça; o destino é do elemento. No botão desativado ou carregando, o clique é barrado
  também no elemento. O HeroUI 3.2.6 não tem `render`; o idioma é o da Base UI, que a Aurea já usa
  no `Card` (`fundirRender`).
- **M-02 (`classNames` por parte) não entra**: o HeroUI tirou isso na versão atual, e abriria a
  aparência das peças por dentro. Decisão do Victor, 25/09/2026.

- **B-02 · `Text`, `Heading`, `Paragraph` e `Code`, na web e no nativo**, no molde do HeroUI 3.2.6
  (decisão do Victor, 25/09/2026: HeroUI sempre primeiro). Uma **lista fechada de papéis** em vez
  de tamanhos soltos: título 1 a 6, texto, texto pequeno, texto mínimo e código. Cor só normal ou
  apagada (`color="muted"`), quatro pesos, alinhamento e corte em uma linha (`truncate`).
  - `Heading level={2}` renderiza um `h2` com a cara de título 2; o nível é o desenho, como no
    HeroUI. `Paragraph size="sm"` é um `p` de 14px. `Code` é um `code` com a pele do código do
    `Prose`. `Text` é um `span` com o papel que você escolher.
  - Os números são de token: a escala de letras (ADR-0050), `--leading-relaxed` no texto,
    `--leading-tight` e `--tracking-tight` nos títulos.
  - **No nativo o `Text` que já existia fica como está**, com as opções soltas; ganhou só o
    `type`, o mesmo papel da web. `Heading`, `Paragraph` e `Code` são novos lá também.

---

## [0.11.0] — 2026-09-25

⏳ **Não publicada.** Espera o "pode" do Victor para o push, e o publish é dele.

É o **Lote E**: os achados do app de 25/09/2026, todos no nativo. Sai separado do Lote 3, a partir
do `main`, porque são defeitos que o app sente hoje. Sobe o número do meio por causa de **uma**
mudança de aparência que não é acréscimo, o E5 — a regra da
[ADR-0014](decisions/0014-primeira-versao-publica-0-1-0.md), no precedente da `0.10.0`.

### ⚠ Mudou — leia antes de atualizar

- **E5 · a marca do `Radio` e do `Checkbox` fica no MEIO da altura do texto**, como no HeroUI
  Native (`radio.css` e `control-field.css`: `align-items: center`). Ficava presa no topo do
  rótulo, com um `marginTop: 1` fixo. Para rótulo longo, de várias linhas, `align="start"` põe a
  marca no meio da **primeira** linha, pela conta dos tokens.
- **`Badge` · as medidas do `Chip` do HeroUI Native** (ordem do Victor de 25/09/2026: *"se o
  HeroUI já tem, vamos usar as deles"*). `sm` 8 × 2 de recheio, letra 12, linha 16; `md` 12 × 4,
  letra 14, linha 20; `lg` 16 × 6, letra 16, linha 24; 4 de vão. As alturas passam a ser as do
  HeroUI mais a borda de 1 da Aurea: pequeno 20 → 22, médio 24 → 30, grande 28 → 38. O raio continua a
  cápsula da Aurea. O `xs` (contador sobre ícone) não existe no HeroUI e fica com 16 de altura,
  agora com letra 12. Motivo de fundo: o texto saía com entrelinha 1,0, e no Android o g e o p
  eram cortados — a mesma causa do E1.
- **E7 · dentro do `Card variant="brand"`, o botão cheio com tom mantém a cor** (sucesso, perigo,
  aviso, informação) e ganha contorno na tinta do cartão. Medido: a letra sobre o próprio fundo
  passa em todo tom e tema, mas o fundo contra o amarelo não se distingue (sucesso no escuro
  1,00) — o contorno (4,54) mostra onde o botão está. O contornado e o sem fundo seguem na tinta:
  a letra colorida direto no amarelo não passa de 4,5.
- **E4 · as três folhas de baixo (`Select`, `Combobox`, `BottomSheet`) recuam a borda de baixo**
  com o `SafeAreaView` da `react-native-safe-area-context`, a mesma peça do `Screen`: recuam só o
  que a folha fica de fato atrás da barra de botões do Android, e zero quando não fica. O app via a
  lista descer atrás dos botões do sistema.

### Corrigido

- **E1 · o `Button` cortava a perna das letras** (g, p, ç) no Android. O rótulo saía com
  entrelinha 1,0; o IBM Plex precisa de 1,3 em para caber inteiro, e o React Native do Android
  corta o que passa da linha. Agora é a entrelinha normal (1,5), como o rótulo do botão do HeroUI
  Native. Cabe em todo tamanho e densidade: os dois menores têm linha de 21 e o menor botão mede
  24 (compacto); os maiores têm linha de 24 e medem 32 ou mais.
  - O `Badge` tinha o mesmo defeito, e foi junto (ver "Mudou").
- **E4 · a lista do `Select` e a do `Combobox` não rolavam no Android.** ⚠ **Causa não
  confirmada no aparelho.** Um `View` em volta da lista reivindicava o toque
  (`onStartShouldSetResponder`), e no Android o dono do toque intercepta os movimentos seguintes
  (`JSResponderHandler.onInterceptTouchEvent`): o `ScrollView` de dentro não os recebia. A linha
  era redundante desde 10/09/2026 (o fundo que fecha virou irmão da folha, e é isso que impede o
  toque no corpo de fechá-la) e saiu das quatro peças que têm rolagem dentro: `Select`,
  `Combobox`, `Dialog` e `Drawer`. O aceite é o bloco E4 do `apps/native-smoke`: abrir a lista de
  50 e rolar até o último.

- **E8 · no `Combobox` com algo escolhido, o X e a setinha ficavam em alturas diferentes** no
  Android: a setinha, uns 5 pontos mais baixa. Medido no Yoga 3, o motor de layout do React
  Native: a seta tinha `height: "100%"` numa fila sem altura, e com a errata de compatibilidade
  (`Errata.All`) isso lhe dava 25 de altura e o centro fora do lugar. Agora ela tem a mesma caixa
  de toque do X (altura mínima de 44, conteúdo no meio): os três centros — X, seta e campo —
  coincidem nas 18 combinações medidas, e o toque da seta sobe de 16 para 44 de altura.

### Adicionado

- **E3 · `justify` no `SegmentedControl` e nas `Tabs`** (`start`, o padrão · `center` · `end`):
  onde a fila fica quando cabe na linha. Os dois moram no mesmo rolador horizontal, e a fila
  ficava colada à esquerda; um `Cluster justify="center"` em volta não mudava nada (medido pelo
  app: rolador 335, fileira 281). O nome é o do `Cluster`. Novo tipo exportado: `AureaFilaJustify`.
- **E5 · `align` no `Radio` e no `Checkbox`** (`center`, o padrão · `start`).
- **E6 · `searchKeyboardType` no `Combobox`**: o teclado do campo de busca da folha. Para buscar
  um ano, `"number-pad"`; sem ele, o teclado de texto de sempre.

### Ficou para o Lote 3

- **E2 · o `Button` não obedece a centralização de quem está em volta** (`alignSelf:
  "flex-start"`). Decisão do Victor, 25/09/2026: seguir o HeroUI Native (o botão obedece o pai).
  Como isso faz o botão esticar dentro de um `Stack` sem alinhamento, vai no Lote 3, junto com um
  `align` no `Stack` do nativo.

---

## [0.10.1] — 2026-09-24

✅ **PUBLICADA em 24/09/2026, nos sete pacotes, pelo terminal do Victor.** Não conferida no
registro, de propósito: logo depois do publish nenhuma leitura de registro decide.

Uma peça só, e só acréscimo: **R-05, a metade que faltava.** Sai sozinha, sem o Lote 3, porque
sem ela o app não abre: o logotipo dele é desenhado a traço, e a trava do app barra o
`react-native-svg` direto.

### Adicionado

- **R-05 · `criarGlifo` desenha a TRAÇO.** Cada forma aceita `stroke`, `strokeWidth`,
  `strokeLinecap` e `strokeLinejoin`, com os nomes do SVG. Duas coisas que um logotipo a traço
  precisa:
  - **`"currentColor"`** em `stroke` ou `fill` é a cor do `Icon`, e o traço troca com o tema.
  - **A tinta pode ir no desenho inteiro**, como os atributos no `<svg>` raiz de um arquivo; a
    de cada forma vence.

  ```tsx
  const Logo = criarGlifo({fill: "none", stroke: "currentColor", strokeWidth: 2,
                           strokeLinecap: "round", paths: ["M…"]});
  ```

  Sem `stroke`, nada muda. A espessura está na unidade do `viewBox`: cresce com o glifo.
  O glifo a traço entrou no `apps/native-smoke` (bloco 2), para a prova no aparelho.

---

## [0.10.0] — 2026-09-24

✅ **PUBLICADA em 24/09/2026, nos sete pacotes, pelo terminal do Victor.** Não conferida no
registro, de propósito: logo depois do publish nenhuma leitura de registro decide.

É o **Lote 2 dos achados dos consumidores, segunda leva** — B-07, B-10, B-12, A-05 e A-14, todas
na web. Desenho de antes e depois aprovado pelo Victor. Sobe o número do meio por causa de **uma**
mudança de aparência que não é acréscimo (regra da
[ADR-0014](decisions/0014-primeira-versao-publica-0-1-0.md)).

### ⚠ Mudou — leia antes de atualizar

- **A-05 · o item atual da lateral (`Sidebar`, `AppShell`) ganhou o traço da casa.** Até a `0.9.0`
  ele era só um fundo cinza; agora o texto e o glifo vão para a cor de destaque da lateral e um
  traço de 2 px corre embaixo, o mesmo do índice do catálogo (`.doc-nav`). Contraste do item atual
  medido: claro 7,27 · escuro 7,92 · `lory` claro 5,47 · `lory` escuro 6,11 — todos passam AA. Na
  lateral recolhida o traço se ajusta ao trilho estreito.

### Adicionado

- **B-07 · `Topbar divider`** — uma linha fina embaixo da barra rente (`variant="flush"`). Nas
  outras variantes é ignorada: elas já flutuam com borda própria.
- **B-10 · `AppShell topbarDivider` e `contentVariant="plain"`** — `plain` tira a caixa (fundo,
  borda, raio e respiro) em volta do conteúdo, para telas que já trazem cartões próprios.
- **B-12 · `Field description`** — a frase de apoio EMBAIXO do controle, ligada por
  `aria-describedby` na ordem dica, descrição, erro. A `hint` continua ao lado do rótulo.
- **A-14 · `Card orientation="horizontal"` e `Card.Media`** — o modo lista: capa à esquerda com
  **96** de largura (o `size-24` do exemplo horizontal do `heroui-native`, que é também o nosso
  `--space-24`) e o texto à direita. Na vertical, `Card.Media` como primeiro filho encosta na borda
  de cima, recortada no raio 22.

### Corrigido

- **A casca (`AppShell`) esticava a barra do topo em página curta.** Sem linhas declaradas, o grid
  repartia a sobra do `min-height:100vh` entre a barra e o conteúdo: em tela estreita (a lateral
  vira gaveta) a barra crescia — de 134 para **414** px em 375 de largura. Achado no desenho da
  B-10, e **já existia na `0.9.0`**. A sobra agora vai para a linha do conteúdo.

### Controles

- `tests/unit/consumidores-lote2-leva2.test.tsx` — 8 testes; contra o código antigo, 6 reprovam e
  os outros 2 são guardas.
- `tests/visual/shell-nav.spec.ts` — "página curta não estica a barra do topo", provado reprovando
  sem o conserto (134 → 414). Rodado só no Chromium: Firefox e WebKit não estavam instalados no
  ambiente.
- ⚠ **16 fotos de referência do `catalog.spec.ts` estão velhas** (de 11/09/2026) e reprovam igual
  no `main` limpo, com os mesmos números de pixel. Não vêm desta versão.

## [0.9.0] — 2026-09-24

✅ **PUBLICADA em 24/09/2026, nos sete pacotes, pelo terminal do Victor.** Não conferida no
registro, de propósito: logo depois do publish nenhuma leitura de registro decide.

É o **Lote 2 dos achados dos consumidores, primeira leva** — as props de layout da web. Sobe o
número do meio, e não só o último, por causa de **uma** mudança que não é acréscimo (a regra da
[ADR-0014](decisions/0014-primeira-versao-publica-0-1-0.md): quebra em `0.x` sai com aviso).

### ⚠ Mudou — leia antes de atualizar

- **A janela (`Dialog`) sem tamanho escolhido passou de 560 para 448 de largura.** Decisão do
  Victor: as larguras agora são as do HeroUI (`xs` 320 · `sm` 384 · `md` 448 · `lg` 512), mais
  `xl` 1024 e `full`, e o padrão é o `md` do HeroUI. Toda janela que não passa `size` fica **112
  px mais estreita**. Quem precisa da largura antiga passa `size="lg"` (512), a mais próxima. O
  `ConfirmDialog` continua com 420, mais estreito que a janela comum.

### Adicionado

- **B-01 · `Stack`, `Cluster` e `Grid`:** `gap` com três degraus (`tight` 8 · `normal` · `loose`
  24 — [ADR-0051](decisions/0051-o-espacamento-dos-primitivos-tem-tres-degraus.md)); `align` e
  `justify` com os mesmos nomes do `Cluster` nativo; `wrap` no `Cluster`; `min` e `columns` no
  `Grid`. Sem as props, nenhuma classe muda.
- **A-08 · `width` no `SearchField` e no `InputGroup`** — a busca deixa de ocupar a linha inteira
  numa barra.
- **C-01 · `aria-label` no `Combobox` e no `MultiCombobox`**, para filtro sem rótulo visível.
- **C-03 · `Button grow`**, e **C-13 · `target`, `rel` e `download`** no `Button` com `href`.
- **C-04 · `Separator spacing`**, nos mesmos três degraus do `gap`.
- **C-05 · `Card padding="none"`** — a capa encosta na borda, recortada no raio 22.
- **B-03 · `Dialog size`** e **C-07 · `Dialog dismissible={false}`** (nem Esc nem clique fora
  fecham, e o X fica desativado).

### Não entrou

- **C-02 · `Select fullWidth`:** medido, o `.select` já tem `width:100%` e ocupa a largura toda em
  bloco, coluna e fila (380 de 380). A prop não mudaria nada.

### Controles

- `tests/unit/consumidores-lote2.test.tsx` — contra o código antigo, 13 dos 16 testes das props
  novas reprovam; os outros são guardas. O teste da largura padrão cobra os 448.
- `tests/visual/skin.spec.ts` (Chromium) — a janela e a confirmação, medidas no navegador.

## [0.8.14] — 2026-09-24

✅ **PUBLICADA em 24/09/2026, nos sete pacotes, pelo terminal do Victor.** Não conferida no
registro, de propósito: logo depois do publish nenhuma leitura de registro decide.

É o **Lote 4 dos achados dos consumidores, segunda parte** — as seis fichas do nativo que faltavam,
na ordem de quantos remendos cada uma tira da regra "só Aurea" do app (R-01 7, R-09 3, R-02 3,
R-07 2, R-06 1, R-05 1), e a R-10. Desenho de antes e depois aprovado pelo Victor.

### Adicionado

- **R-01 · `Badge fit="content"`, na web e no nativo.** O selo fica do tamanho do texto dentro de
  uma coluna. ⚠ **O padrão NÃO mudou, e a razão foi medida:** a ficha dizia que a web já deixava o
  selo do tamanho do texto; no navegador, numa `.stack` ele estica igual (300 px numa coluna de 300,
  55 px solto), porque ela não declara `align-items`. Na web a prop vira `inline-size:fit-content`
  (o selo continua no meio de uma fila); no nativo vira `alignSelf: "flex-start"`, que **só serve
  em coluna** — está escrito na prop. Ancorado, é ignorada.
- **R-09 · `Cluster` do nativo com `align`, `justify` e `wrap`.** São os nomes que o documento
  propõe para a web na B-01, de propósito. Sem as props, nada muda.
- **R-02 · `Topbar inset` (`bar` · `page` · `none`)**, só na `flush`. `page` recua o mesmo 16 da
  `Screen`, e o título alinha com o conteúdo; o padrão continua 20.
- **R-07 · token `opacity-disabled` (0,5)** — o único token de opacidade do HeroUI
  (`--disabled-opacity: 0.5`, 51 usos no `@heroui/styles` 3.2.6) e o 0,5 que os campos, o menu e o
  `Combobox` da Aurea já usavam. Na web e no nativo esses pontos passam a ler o token; **nenhum
  valor mudou**. ⚠ O 0,45 do botão desativado continua fora: mudar é mudar a aparência publicada.
  E o **`comOpacidade` sai pela porta da frente** do `@aurea-uds/native`.
- **R-06 · `Screen footer`.** Fica fora da rolagem, com a borda de baixo `space4` acima da área do
  sistema, e acima da barra de abas dentro de um `BottomNavProvider`. ⚠ **Sem gancho de inset:** a
  `Screen` não exige `SafeAreaProvider`, então o rodapé usa a mesma `SafeAreaView` só na borda de
  baixo quando a raiz não a pega.
- **R-05 · `criarGlifo`.** Um glifo próprio (o logotipo) desenhado pela Aurea a partir de
  retângulos, círculos e caminhos; o app não importa o `react-native-svg`. Não traz peso novo: o
  `Chart` já usa o mesmo motor pela porta da frente.

### Documentado

- **R-10 · `text-md` é sinônimo do `text-sm`** (14), de propósito — ADR-0050, escolha 1. Nenhum
  número mudou; o token ganhou a descrição.

### Corrigido

- **O exemplo do `Card` com `onPress` citava o ramo do app**, copiado da ficha
  R-04. Saiu na `0.8.13` dentro do `layout.d.ts`. Agora diz `"Relatório de março"`.

### Controles

- `tests/unit/native-consumidores-0-8-14.test.tsx` — contra o código antigo, **19 de 26 reprovam**;
  os outros 7 são guardas do que não podia mudar.
- `tests/unit/consumidores-0-8-14.test.tsx` — o `Badge` da web.

## [0.8.13] — 2026-09-24

✅ **PUBLICADA em 24/09/2026, nos sete pacotes, pelo terminal do Victor.** Não conferida no
registro, de propósito.

É o **Lote 4 dos achados dos consumidores** (o nativo), com as duas fichas que ele manda primeiro:
R-04 e R-08. A R-03 cai junto com a R-08.

### Adicionado

- **R-04 · o `Card` do nativo responde ao toque:** `<Card onPress={abrir} accessibilityLabel="…">`.
  Até aqui a documentação mandava a tela embrulhar o cartão num `Pressable`, e o app que usa só a
  Aurea ficava sem caminho.
  - Com `onPress`, o **tipo exige** o `accessibilityLabel` e o cartão vira um botão para o leitor
    de tela.
  - Com `onPress`, o tipo **não aceita** `variant="brand"`: ele exige `action`, que é um botão
    dentro do cartão, e botão dentro de botão some no iPhone.
  - Sem `variant`, o cartão tocável usa a pele `interactive`. Sem `onPress`, nada muda.
  - A reação ao toque é a do `Button` (0,97 de tamanho e 0,9 de opacidade), agora num lugar só
    (`REACAO_AO_TOQUE`, no `estilos.ts`), e o `Button` lê de lá.
  - ⚠ **Uma regra o tipo não cobre:** cartão com `onPress` não pode ter coisa tocável dentro. O
    conteúdo é do app, e o `check 43` não o alcança.
  - ⚠ **O HeroUI não serve de modelo aqui:** o exemplo oficial do `heroui-native@1.0.10` põe um
    `Button` dentro do cartão tocável — o defeito que o `check 43` barra.
- **R-08 · `width="content"` no `BottomNav`, na web e no nativo.** A barra fica do tamanho das
  abas, no centro, em vez de ir de uma borda à outra. Só na `floating`; na `edge` a prop é
  ignorada. Sem a prop, nada muda.
  - No nativo não há conta nossa: uma peça `absolute` sem `left`/`right` se mede pelo conteúdo e
    obedece `alignSelf`, lido no Yoga do `react-native@0.87.1` (`AbsoluteLayout.cpp`).
  - ⚠ **Por isso o `left: 0`/`right: 0` saiu do estilo base da barra** e só entra na barra cheia.
    Apagar um valor escrevendo `undefined` por cima funciona ao montar e **falha ao atualizar** no
    RN (`restoreDeletedValuesInNestedArray`, no `ReactNativeAttributePayload.js`).
  - ⚠ **Com quatro abas o ganho é pequeno:** numa tela de 360, a barra fica com uns 275 em vez de
    uns 328.

### Já estava consertado — o documento mediu a `0.8.7`

- **R-08, defeitos 1 e 3** (a barra não flutuava e descia atrás dos botões do Android): saíram na
  **`0.8.8`**. Para sumirem no app, é preciso atualizar **e tirar o `View` pintado em volta do
  `BottomNav`**, que é quem desenha a caixa.
- **R-03** (o app tinha de pintar o fundo atrás da barra): também resolvido na `0.8.8` para a
  `floating`.

### Corrigido

- **A ficha do `BottomNav`** ainda dizia que a folga do iPhone era recheio da barra. Desde a
  `0.8.8` ela é margem, por fora.

### Controles

- `tests/unit/native-consumidores-lote4.test.tsx` e `tests/unit/consumidores-lote4.test.tsx`.
  Contra o código antigo, reprovam 6 de 10 e 1 de 4; os outros são guardas do que não podia mudar.
- `tests/unit/tipos-nativo/card-tocavel.tsx`: uma sonda que o `tsc` compila de verdade. Nenhum
  `tsconfig` lê `tests/`, então um `@ts-expect-error` num teste passaria com a regra quebrada.
  Provado: com o nome opcional, o `tsc` reprova.
- O dublê do `Pressable` passou a guardar também o estilo com o dedo em cima.

## [0.8.12] — 2026-09-24

✅ **PUBLICADA em 24/09/2026, nos sete pacotes, pelo terminal do Victor** (`publicar: os 7 em 0.8.12`).

### Mudou

- **A escala de letras passa a ser a do HeroUI** ([ADR-0050](decisions/0050-a-escala-de-letras-e-a-do-heroui.md),
  que substitui a 0049). Os números viram **12 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48**, a escala
  do Tailwind que o HeroUI usa, lida no pacote publicado deles.
  - **Web:** as peças voltam a **14** (botão, campo, Select, abas, lateral, rótulo) e o apoio a
    **12** (selo, etiqueta, erro de campo). O botão e o campo pequenos ficam em 14, e não em 12,
    como no HeroUI. O título de cartão fica em 14 com peso médio. **No telefone, o texto digitado
    nos campos sobe para 16**, que é a regra deles e evita o Safari ampliar a página sozinho.
  - **Nativo:** as peças ficam em **16** e o apoio em **14**, um degrau acima da web, como o
    HeroUI Native. Os componentes não mudaram de `size`: quem traduz é o mapa do `text.tsx`.
  - ⚠ **O que muda para quem consome:** na web, o texto das peças fica menor que na `0.8.8`–`0.8.11`
    (16 → 14). O `md`, que é o corpo do `body`, também vai para 14. Os títulos grandes quase não
    mudam: `lg` 20 → 18, `2xl` 25 → 24, `3xl` 31 → 30.
  - Controle: `tests/unit/escala-heroui.test.tsx`. Voltar o mapa do nativo para a escala antiga
    faz ele falhar.

## [0.8.11] — 2026-09-24

✅ **PUBLICADA em 24/09/2026**, pelo terminal do Victor.

Adianta o **N-10** do Lote 5, porque ele travava o app que mede as versões: a trava do app recusa
`<iframe>` sem peça da Aurea, e o trailer dele é do YouTube. Sem esta peça, o app não sobe e a
`0.8.10` não pode ser vista funcionando.

### Adicionado

- **`MediaEmbed` (N-10): vídeo de outro site (YouTube, Vimeo) na moldura da Aurea.** A mesma
  caixa do `MediaPlayer` — raio de cartão, borda, fundo escuro —, e o que antes ficava com o
  consumidor passa a vir pronto:
  - `title` **obrigatório no tipo**: é o nome acessível do vídeo, e sem ele não compila;
  - a proporção (`ratio`, `16/9` por padrão) é reservada antes de carregar, e a página não pula;
  - `referrerPolicy="strict-origin-when-cross-origin"` por padrão, que é o que os termos do
    YouTube pedem (lido em 24/09/2026); e `loading="lazy"`;
  - **com `poster`, nada do outro site carrega até o clique.** Até lá há a imagem e um botão de
    tocar da casa; no clique o vídeo nasce, já tocando (`autoplay={false}` desliga), e o foco vai
    para ele;
  - `href` mostra um link para o vídeo no site de origem, que é a saída quando o dono bloqueia a
    incorporação — a página não consegue detectar esse bloqueio, então o link fica sempre à vista.
  - Teclado medido no navegador: Enter e Espaço abrem o vídeo. Controles em
    `tests/unit/consumidores-n10.test.tsx`.

## [0.8.10] — 2026-09-24

✅ **PUBLICADA em 24/09/2026, nos sete pacotes, pelo terminal do Victor.** **Ela carrega tudo da
`0.8.9`** (a seção abaixo), então quem instalar a `0.8.10` recebe os dois consertos daquela também.

Aprovada pelo Victor vendo as imagens, em 24/09/2026: o `Select` novo e o catálogo sem cortes.

### Mudou

- **`Select` passa a ter a pele da Aurea (A-02 e B-08).** Era o `<select>` do navegador, e a lista
  que ele abria era a do sistema operacional — no Windows, a caixa cinza do Windows. Agora é o
  `Select` do Base UI com a pele da casa: gatilho em cápsula, lista flutuante igual à do
  `Combobox`, **sem campo de busca**. Não nasceu componente novo: é o mesmo `Select`.
  - **A forma de escrever continua:** `<option>`/`<optgroup>` como filhos, `value`/`defaultValue`,
    `onChange` com `e.target.value`, `name` (vai no formulário por um campo escondido),
    `disabled`, `size`.
  - **Novo:** `items`, `onValueChange`, `placeholder`, `required`.
  - ⚠ **Quebra pequena:** o nó na página é um `<button>` com papel `combobox`, não mais um
    `<select>`, e o `ref` aponta para esse botão. Quem lia `ref.current.value` ou estilizava
    `select` pelo nome da tag precisa ajustar. Teclado medido: setas, Home, End, Enter e Espaço.
  - Saiu do `markup.tsx` (servidor) para o `inputs-client.tsx`, porque agora tem estado.

### Corrigido (catálogo, não a biblioteca)

- **Nove amostras do catálogo rolavam dentro da caixa** e **duas páginas vazavam para o lado a
  320px**, depois da escala de letra da `0.8.8`. A caixa não cresceu (a regra é a amostra caber na
  primeira tela): o conteúdo de cada amostra foi rearrumado, e o cartão "Next" desce de linha
  quando o nome não cabe. O `catalog-sweep` inteiro volta a passar.

## [0.8.9] — 2026-09-24

⚠ **NUNCA PUBLICADA SOZINHA.** Ela foi aprovada, mas saiu inteira dentro da `0.8.10` (24/09/2026):
o registro pula da `0.8.8` para a `0.8.10`.

🔴 **A `0.8.8` foi medida num app real no dia seguinte, e a escala de letras nova (ADR-0049) quebrou
duas telas que a `0.8.7` desenhava inteiras.** As quatro correções do Lote 1 passaram; estas duas
são regressão. Nenhuma das duas é defeito NOVO: a letra maior expôs dois achados que já estavam na
fila (A-03 e C-10), e o conserto é o deles, adiantado do Lote 2.

### Adicionado

- **`AppShell` aceita `navItems`, `currentNavId` e `navLabel` (A-03).** A lista vai para o `Sidebar`
  que o shell já cria. Até aqui, quem queria a lista declarativa passava outro `Sidebar` como
  `navigation`, e saíam **duas caixas, uma dentro da outra**. Com a letra da `0.8.8` a de dentro
  passava 36px da borda e cortava o texto: "8.174" virava "8.17". Com `navItems` há uma caixa só,
  os números cabem, e nome longo termina em "…". `navigation` continua valendo e passou a ser
  opcional; quando os dois vêm, a lista vem antes.
- **`Field` aceita `labelWidth` (C-10).** No `orientation="horizontal"` a coluna do rótulo era o
  token `--field-label-width` (192px), sem prop. Num telefone a 375px o campo ficava com 85px e
  **2px para o texto**: o valor escolhido sumia. `labelWidth="auto"` faz a coluna do tamanho do
  rótulo (61px para "Ordenar", e o texto ganha 133px); uma medida CSS (`"8rem"`) fixa outra. Sem a
  prop, os 192px de sempre.

⚠ **As duas correções pedem uma linha no app.** Nada muda para quem não passa as props novas —
quem tem a caixa dupla troca `navigation={<Sidebar items current />}` por `navItems`/`currentNavId`,
e o campo estreito ganha `labelWidth="auto"`.

Controles em `tests/unit/consumidores-0-8-9.test.tsx`, provados contra o defeito.

---

## [0.8.8] — 2026-09-23

✅ **PUBLICADA em 23/09/2026, nos sete pacotes, pelo terminal do Victor.** Não conferida no
registro, de propósito: logo depois do publish nenhuma leitura de registro decide.
⚠ **Até a véspera esta entrada dizia "levantada nos nove arquivos" desde 19/09, e era FALSO:** os
nove continuavam em `0.8.7`. Medido em 23/09 com `grep '"version"'` antes de levantar.

Ela leva **duas levas**: os consertos do nativo de 19/09 (abaixo) e o **Lote 1 dos achados dos
consumidores** — três apps instalaram a `0.8.7` pelo npm e mediram os defeitos da web que seguem.

### Corrigido — Lote 1 dos achados dos consumidores (web)

- **A-01 · `Combobox` e `MultiCombobox`: o texto do item caía na coluna do check.** O indicador do
  Base UI não monta nada quando o item não está escolhido, e o rótulo ia para a trilha de 16px:
  "1080p / Blu-ray" saía em quatro linhas, com 96px de altura. Agora a coluna existe sempre, e cada
  item tem 36px. O core também manda o último filho para a segunda coluna, para quem escreve o HTML
  à mão.
- **A-06 · A gaveta mobile não fechava ao escolher um item.** A biblioteca abria a gaveta e nunca a
  fechava por código. Agora escolher um item fecha, na lista declarativa e na navegação que o
  consumidor passa como `children`, no `@aurea-uds/react` e no `aurea.js`.
- **A-07 · Alargar a janela deixava a gaveta presa por cima da página**, sem véu e sem o botão que
  a fecharia. Cruzar `lg` (1024px, o mesmo número do `@media` do core) agora fecha a gaveta.
- **A-09 · `DependencyGraph`: o rótulo da aresta saía preto sobre preto.** As variáveis de cor
  existiam no core, mas quem as lia era a folha de identidade do motor, que a Aurea não carrega.
  Agora o rótulo lê as duas direto. E o vão entre colunas **cresce com o rótulo mais longo**: sem
  isso, o rótulo legível entrava por baixo dos nós. Grafo sem rótulo sai idêntico.
- **A-10 · `DependencyGraph`: duas arestas entre o mesmo par viravam uma.** A identidade era o par
  `from->to`. `GraphEdgeItem` ganhou **`id?: string`**, e as arestas paralelas saem de alturas
  diferentes do nó. Sem `id`, a primeira de cada par mantém o id de sempre.
- **A-11 · `DataGrid`: a busca ignorava a coluna que vinha vazia na primeira linha.** A regra do
  motor olha só a primeira linha; agora vale o primeiro valor presente. `enableGlobalFilter: false`
  na coluna continua mandando.
- **C-09 · O raio do item de menu passa de 8px para 18px**, pela conta da casa (raio do painel
  menos o respiro dele). O painel `.menu` passa a ter o raio de cartão e `--space-1` de respiro.
  ⚠ **Vale para toda lista que usa `.menu`:** `Combobox`, `MultiCombobox`, `DropdownMenu`,
  `ContextMenu`, `Menubar` e a lista da `CommandPalette`.

Controles em `tests/unit/consumidores-lote1.test.tsx`, provados contra o defeito.

🔴 **A PRIMEIRA VEZ QUE O APP RODOU NUM ANDROID DE VERDADE, e os quatro defeitos que ela achou
NÃO aparecem no navegador.** Não é acaso: os quatro são lugares onde a cascata do CSS resolve de
graça e no React Native a conta tem de estar escrita. Mais uma escala de letras nova, que é
decisão de desenho e não conserto.

### Corrigido

- **`NumberField` só entregava o número quando o campo perdia o foco.** É o mais grave da lista,
  e o dano é MUDO: o `Screen` tem `keyboardShouldPersistTaps="handled"`, então tocar em "Salvar"
  com o teclado aberto **chega ao botão sem passar pelo blur** — e o `onPress` lia o valor
  anterior. Num formulário que corrige um número já salvo, isso **regrava o antigo, sem erro e sem
  aviso**. A cara disso na tela ("o campo está vazio") era o sintoma menor.

  Agora cada tecla emite, lida pelas regras do `locale`: em pt-BR `"12,"` é `12`, `"1.234,5"` é
  `1234.5`, apagar tudo é `null`, e `","` ou `"-"` sozinhos não emitem nada.

  ⚠ **`min`/`max` NÃO prendem durante a digitação.** Com `min={10}`, prender faria o `"1"` virar
  10 na cara de quem ainda ia digitar o `5` de 15 — o campo escreveria por cima da pessoa. Prende
  no blur, e se prender mudou o número ele é emitido de novo.

  ⚠ **A ADR-0024 fica intacta:** formata só no blur, e com foco quem manda é quem digita —
  inclusive contra o eco do pai, que é o caso comum de um `useState` controlado.

- **`Switch` sem rótulo esticava e apagava o nome da linha do `NavList`.** A coluna de texto tem
  `flex: 1` e existia mesmo vazia; dentro de uma fileira, onde o valor é IRMÃO do miolo, ela tomava
  a largura que sobrava e o **nome da linha sumia**. Sem rótulo e sem descrição, a raiz passou a
  ser o trilho e mais nada.

  ⚠ **O `Checkbox` e o `Radio` tinham o MESMO defeito** — são o mesmo desenho, com a mesma coluna
  vazia. Consertados junto, com teste próprio. O consumidor não sabia disso; o `grep` sabia.

- **Filhos do `Grid` não preenchiam a célula**, então dois `KPI` lado a lado saíam de alturas
  diferentes quando um quebrava o texto em duas linhas. A célula já tinha a altura certa — medido
  no fonte do motor de layout, `Style.h:907`: `alignItems = Stretch` —, mas numa coluna um filho
  sem `flexGrow` mede o próprio conteúdo. ⚠ **Na web isto é de graça** porque o cartão É o item da
  grade; aqui existe uma célula no meio que corta a herança de altura.

- **A pílula do `BottomNav` invadia os botões do Android e não flutuava.** Duas causas:

  1. a folga do sistema entrava como **recheio dentro** da pílula, nas duas variantes. Com os três
     botões do Android são ≈48 pontos: ela crescia para baixo e a barriga ficava atrás deles;
  2. **a documentação deste repositório** mandava embrulhar a barra num `View` pintado — o que
     desenhava a caixa cinza em volta e fazia a tela terminar acima dela.

  Agora `floating` é `position: absolute`: a tela ocupa a altura inteira e rola **por baixo** da
  pílula, a folga do sistema vira `marginBottom`, e as margens são o que deixa o toque passar para
  a tela de baixo. ⚠ **`edge` não mudou em nada** — continua no fluxo, com a folga por dentro,
  pelo máximo e não pela soma.

- **E a mesma coisa na WEB**, que o pedido não sabia: o `aurea.css` punha
  `env(safe-area-inset-bottom)` no `padding-bottom` da pílula. Agora vai em `margin-bottom`, e
  `.bottom-nav-edge` declara o recheio de volta, que ali é o certo.

### Adicionado

- **`BottomNavProvider` e `useBottomNavSpace()`** — flutuar tem um preço, e a biblioteca é quem
  paga: o fim da rolagem ficaria atrás da pílula. A barra mede a própria altura e conta para o
  provedor; o `Screen` com `scroll` reserva o espaço sozinho. **O app não calcula nada.** Para uma
  tela que não usa `Screen`, o número está no gancho. ⚠ **Fora de um provedor os dois valem zero**,
  e nada muda numa tela cheia.

### Mudado

- **A escala de letras tem cinco degraus que se enxergam** — [ADR-0049](decisions/0049-a-escala-de-letras-tem-cinco-degraus-que-se-enxergam.md).

  O pé da escala tinha **quatro degraus em quatro pontos** (12 · 13 · 14 · 16). Abaixo de ~1,15,
  dois tamanhos lado a lado não leem como hierarquia: leem como erro. Uma tela só mostrava de 12 a
  36 em **sete** tamanhos.

  | papel | antes | agora |
  |---|---|---|
  | legenda, apoio | 12 | **13** |
  | texto corrido, controle | 13 e 14 | **16** |
  | nome de cartão | 16 e 18 | **20** |
  | título de tela | 20 e 24 | **25** |
  | número em destaque | 30 | **31** |

  **Nada encolheu**, e isso é condição e não coincidência. ⚠ **Os dez nomes continuam** e alguns
  apontam para o mesmo número — `size` é API pública dos dois alvos, e apagar nome quebraria
  consumidor sem mudar nada na tela. Por isso **nenhum componente precisou trocar de degrau**.

  ⚠ **A web mudou junto**, e não é efeito colateral: o `aurea.tokens.json` é o único lugar onde a
  escala existe, e o mesmo defeito estava lá. O limite medido: em letra do sistema **1,3×** tudo
  cabe, menos o controle `sm` na densidade compacta, que estoura por 1 ponto.

---

## [0.8.7] — 2026-09-18

✅ **PUBLICADA** — os sete pacotes, pelo terminal do Victor, em 18/09/2026.

🎯 **Um patch de conserto, e ele fecha o `Card variant="brand"` que a `0.8.6` entregou pela
metade.** Achado pelo consumidor **em um dia**.

### Corrigido

- **A tinta da marca alcança CONTORNO e GLIFO, não só letra.**

  A `0.8.6` mediu o contraste do TEXTO dentro do cartão amarelo, forçou a cor dele e parou ali.
  **A mesma frase — "sobre o amarelo existe UMA tinta" — valia para linha e glifo desde o primeiro
  dia.** Medido contra o `primary` `#f0b100`, do `aurea.tokens.json`:

  | dentro do cartão da marca | claro | escuro |
  |---|---|---|
  | contorno de campo (`borderStrong`) | **2,43** 🔴 | **2,24** 🔴 |
  | fundo de campo (`fieldBg`) | **1,61** 🔴 | 7,90 |
  | glifo de botão sem fundo (`foreground`) | 10,34 | **1,83** 🔴 |
  | borda de inválido (`danger-400`) | **1,86** 🔴 | **1,86** 🔴 |
  | foco (`focusStrong`) | 4,54 | **1,00** 🔴 |

  A **1.4.11** pede 3:1 para o contorno que identifica um campo. Nenhum chega.

  🔴 **E o pior era o `action`, que o próprio TIPO exige.** Medidas as quatro aparências de botão
  sobre o amarelo — cheio neutro **1,61** · cheio da marca **1,00** · contornado **1,38** ·
  só-texto **1,83** no escuro. **Nenhuma aparece.** O cartão obrigava a ter um botão e não dava a
  ele nenhuma forma de existir.

  ✅ **A saída não foi paleta nova: foi medir que NÃO HÁ paleta possível.** Procurada uma
  superfície neutra onde encaixar controle dentro do amarelo, as três candidatas reprovam no tema
  claro — `card` **1,91** · `background` **1,73** · `secondary` **1,61**. **Uma única cor do
  sistema inteiro passa de 3:1 contra o amarelo nos dois temas: `primary-foreground`, com 4,54** —
  e ela já era mandada para dentro do cartão; só o texto escutava.

  **Três decisões que a medição tomou contra a intuição:**

  1. **o campo perde o fundo** e vira contorno da tinta, porque fundo nenhum separa;
  2. **a tinta vence o estado de INVÁLIDO** — o vermelho mede 1,86 ali, *menos* que a tinta, e
     pintar de vermelho deixaria o campo errado mais difícil de achar que o certo. O erro passa a
     ser dito pela mensagem do `Field` e pelo estado que o leitor de tela anuncia, que é o que a
     **1.4.1** já exige de qualquer forma;
  3. **o foco vira ESPESSURA e não cor** — no tema escuro o `focusStrong` **é** o amarelo.

  O botão cheio **inverte** (fundo na tinta, letra no amarelo do cartão); contornado e sem fundo
  usam a tinta.

- **A tinta PARA nas superfícies que saem do cartão** — achado escrevendo o teste, não lendo o
  código. O `Modal` do React Native desenha por cima de tudo, mas em React continua sendo **filho**
  de quem o escreveu: a folha de um `Select` dentro do cartão herdaria a tinta e pintaria marrom
  sobre fundo normal. **Camada visual e árvore de contexto são coisas diferentes**, e só a segunda
  manda na cor. Os **seis** sobrepostos do pacote passam a cortar a herança.

⚠ **O alcance fica DECLARADO e não completo:** leem a tinta o `Text`, a família de campo, o
`Button` e o `IconButton`. **Componente fora dessa lista continua quebrado dentro do cartão
amarelo**, e gate estático nenhum vê isso — o que o consumidor encaixa não está no nosso código,
o mesmo ponto cego que o `check 43` já declara.

---

## [0.8.6] — 2026-09-17

✅ **PUBLICADA** — os sete pacotes, pelo terminal do Victor, em 17/09/2026.
⚠ **E ela quase ficou parada por engano da sessão:** os nove arquivos levantados e o `--dry-run`
verde não valem nada se o commit não é **empurrado**. Ele deu `git pull` três vezes e leu `0.8.5`
nas três — estava certo; o commit não existia no remoto.

🎯 **Os dois últimos pedidos que travavam telas do consumidor** — e o primeiro deles não era
desenho novo: era tradução que faltou.

### Adicionado

- **`SegmentedControl` e `Tabs` rolam para o lado quando não cabem.**

  🔴 **A primeira resposta que eu ia dar era criar um componente de "chips", e duas medições
  mataram a ideia:** o `chip` da referência máxima é um **rótulo** (o único estado dele é `slot`,
  não há `selected`), e **a nossa web já resolvia o pedido** — `aurea.css:2127`, em tela de até
  640px: `.tabs,.pagination,.segmented { max-width:100%; overflow-x:auto; }`. Um terceiro jeito de
  escolher teria sido inventar o que já existia.

  **O sinal de "tem mais" foi pedido junto, com razão** — quem não sabe arrastar não acha a sexta
  opção. ⚠ **A saída óbvia do React Native NÃO serve:** `fadingEdgeLength` é `@platform android`,
  medido no tipo, e daria o aviso no Android e **nada no iPhone**. Gradiente é proibido desde a
  Fase 0. **O que fica é o mesmo da web:** a opção cortada pela borda, mais a barra de rolagem —
  que agora aparece **só quando há transbordo**, medido (`onLayout` × `onContentSizeChange`) em
  vez de adivinhado.

  ⚠ **Declarado: se o corte LÊ bem é pergunta de vidro**, e nenhum aparelho deste projeto rodou
  iOS. O que está provado é a medição, não a leitura.

- **`Card variant="brand"`** — a primeira superfície grande preenchida com o amarelo neste
  sistema. Até aqui ele só pintava coisa pequena: ponto de contador, pílula do passo atual, link
  de pular conteúdo.

  🔴 **A cor do texto lá dentro é FORÇADA, e não é gosto — é contraste medido nos dois temas:**

  | texto sobre o amarelo | claro | escuro |
  |---|---|---|
  | comum | 10,34 | **1,83** 🔴 |
  | esmaecido | 4,24 | **1,35** 🔴 |
  | `primary-foreground` | **4,54** | **4,54** ✅ |

  Sem forçar, o cartão sairia **quebrado no tema escuro sem ninguém ver no claro**. E como no RN
  não há cascata de cor, ela viaja por contexto — a mesma decisão que o `Field` do Lote 4 tomou.

  ⚠ **Consequência declarada: dentro dele existe UMA cor de texto.** A hierarquia sai de peso e
  tamanho, não de cor.

  🔴 **E a regra de uso mora no TIPO, não num documento.** O combinado foi *"o cartão amarelo é só
  para pedir uma ação"*. Escrita em prosa, essa regra apagaria — este repositório tem registro
  disso em cada arquivo. Então **`variant="brand"` exige `action`**: sem ela não compila. É a
  mesma escolha que faz o `label` do `IconButton` ser obrigatório.

### Corrigido — `@aurea-uds/native`

- **`Tabs`: a fila rolava sem dar sinal de que havia mais abas** — defeito que saiu na `0.8.5`,
  com `showsHorizontalScrollIndicator={false}`. Quem não soubesse arrastar não achava a terceira
  aba. ⚠ **Quem nomeou foi o consumidor pedindo OUTRA coisa**, e a regra *"quem mais tem esse
  problema?"* trouxe até aqui. A peça de rolagem agora é a mesma nos dois.

---

## [0.8.5] — 2026-09-17

✅ **PUBLICADA — os sete, 17/09/2026.** A fonte é o terminal do Victor, que rodou
`node scripts/publicar.mjs` depois de `npm login`.

🔴 **E a leitura do registro daqui disse que a versão NÃO EXISTIA, minutos depois — pela terceira
vez em dois dias.** Desta vez pelo `npm pack`, que é justamente a leitura que a `0.8.3` tinha
promovido a *"a que decide"*. **Ela também atrasa.** O que sobra, e é a lição corrigida: **não
existe leitura de registro que decida logo após um publish.** Quem decide é a saída do publish na
tela de quem publicou. Uma resposta negativa minha nessa janela não é evidência de nada — e
acusar com base nela já custou uma rodada inteira.

🎯 **Duas frentes, e as duas vieram do consumidor:** a família de defeito "peça acessível com
coisa tocável dentro", e uma lista de treze pedidos medidos contra o código.

### Adicionado

- **`Tabs`** — abas DENTRO da tela, trocar o painel e não trocar de página. Papéis `tablist` e
  `tab`, os dois medidos no tipo do RN **e** no enum do Android antes da primeira linha.
  **Nenhuma dependência nova.**

  ⚠ **A fila de abas ROLA na horizontal e a web não rola** — divergência deliberada: a referência
  máxima de desenho deste projeto tem estados de rolagem na lista de abas, e num telefone de
  360dp quatro rótulos não cabem. Espremer apaga o rótulo, que é o defeito que o consumidor já
  tinha medido no `SegmentedControl`.

  ⚠ **O painel inativo NÃO fica montado**, ao contrário da web. O estado interno dele (rolagem,
  texto digitado) **se perde** ao trocar de aba. Declarado, não escondido.

  ⚠ **A aba escolhida NÃO usa a cor da marca**, e há um teste travando isso: o `.tab.active` da
  web é `--foreground` e **desliga** o fio amarelo que o `.segmented` recebe. São dois sinais
  para duas coisas.

- **`check 43` no `validate.py`** — nenhum recipiente marcado como elemento de acessibilidade
  pode conter `Pressable`, `IconButton`, `Button` ou `Touchable*`.

  **Por que gate e não teste em aparelho:** o defeito **só quebra no iPhone**, e nenhum aparelho
  deste projeto rodou iOS, em lote nenhum. O smoke passou sete de oito no Android **com o defeito
  dentro**.

  As duas docs, lidas na fonte: o React Native chama de *"VoiceOver disallowing nested
  accessibility elements"*; a Apple diz *"An individual view does not contain any other views
  that need to be accessible"*.

  **Provado em quatro direções**, e **achou mais dois** no dia em que nasceu.

- **`Badge`**: `leading` e `trailing`. São NÓ e não nome de ícone, pela mesma razão da web — o
  slot não tinge o que recebe.
- **`Switch`**: `description`. ⚠ **Aqui o nativo vai ADIANTE da web**, não atrás: lá o `Switch`
  não tem. A dívida passa a ser da web.
- **`NavList`**: a linha sem ação deixou de anunciar-se como link, e a seta só aparece quando há
  ação. Seta em linha que não abre nada é promessa falsa.

### Corrigido — `@aurea-uds/native`

- **`Alert`: o "X" de fechar saiu de dentro do grupo de leitura.** Publicado assim desde
  08/09/2026, por **quatro versões**. No iPhone o botão de fechar **não existia** para o
  VoiceOver.
- **`Chart`: o nome saiu da moldura e foi para o desenho.** O pior dos três: as faixas tocáveis
  carregam rótulo **e valores** de propósito, e a moldura apagava todas. No iPhone a pessoa ouvia
  o nome do gráfico e **zero dado**.
- **`NavList`: o `value` pode ser tocável, então saiu do `Pressable`.** Um `Switch` ali virava
  botão dentro de botão. ⚠ **O `check 43` NÃO pega este caso** — ele lê o nosso código, e aqui o
  que é tocável chega do consumidor. **Slot é ponto cego de gate estático**, e por isso o conserto
  é de desenho. Valor em TEXTO continua dentro, porque é parte da frase da linha.
- **`SegmentedControl`: o escolhido voltou para a linguagem única de selecionado** — cor da marca
  e o fio amarelo, como manda o `aurea.css`. Ele discordava da web **e do `BottomNav` deste mesmo
  pacote**. ⚠ `primaryEmphasis` e não `primary`: *"sem fundo, a marca vira TEXTO"* e o amarelo
  puro não se lê no claro — a mesma lição que a `0.8.3` pagou no `Button`.

### Mudado — por dentro

- `comOpacidade` saiu do `navigation.tsx` para o módulo de estilo, porque o `SegmentedControl`
  passou a precisar dele. Copiar a função seria o defeito que as regras nomeiam.
- Dois testes do `Alert` e um do `NavList` mediam a **posição** ou a **implementação** em vez da
  promessa, e quebraram quando a árvore mudou. Reescritos para medir o que queriam dizer.

### Não feito, e por quê

- **`Combobox` com segunda linha no item** e **chips que quebram linha**, **card na cor da
  marca**, **radio em cartão**, **ícone grande no vazio**: nenhum existe na web. São desenho novo
  para os dois lados, não tradução — decisão do Victor.
- **`IconButton` redondo**: **recusado**. O `.btn-icon` da web é raio médio, medido, e o nativo
  copia. Redondo muda a identidade dos dois lados.

---

## [0.8.4] — 2026-09-17

✅ **PUBLICADA em 17/09/2026**, pelo terminal do Victor. *(Esta linha dizia "não publicada ainda"
até 24/09/2026 — ficou para trás quando a versão saiu.)*

🎯 **Um conserto só, e ele é o OITAVO achado do consumidor** — o primeiro que vem de uma tela
diferente da de entrar.

### Corrigido — `@aurea-uds/native`

- **`Combobox`: o botão de limpar saiu de dentro do gatilho.** Ele era filho do `Pressable` que
  declara `accessibilityRole="button"` — botão dentro de botão. A cápsula virou moldura, e o
  gatilho, o "X" e a seta passaram a ser irmãos dentro dela.

  **O efeito é SÓ no iPhone, e está medido no fonte do `react-native@0.87.1`:** um `Pressable`
  nasce `accessible: true` (`Pressable.js:274`); no iOS isso vira `isAccessibilityElement`
  (`RCTViewComponentView.mm:398`), e quem é elemento de acessibilidade não expõe os filhos — o
  "X" existia na tela e **não existia para o VoiceOver**. No Android `accessible` só liga
  `isFocusable` (`ReactViewManager.kt:96`) e os filhos continuam entrando na árvore
  (`ReactViewGroup.kt:1048`), então lá ele sempre foi alcançável.

  🔴 **É por isso que o smoke inteiro passou por cima: nenhum aparelho deste projeto rodou iOS,
  em lote nenhum.** Quem achou foi o consumidor, na tela de adicionar veículo, 16/09/2026.

  **Mudou junto, e é ganho:** a seta deixou de ser enfeite e passou a abrir a lista ao toque. Ela
  é muda para o leitor de tela (`accessible={false}`), porque o gatilho já anuncia rótulo, valor e
  se está aberto.

  **Custo declarado:** o respiro da direita da cápsula deixou de abrir a lista ao toque. A área
  que abre é o texto mais a seta.

  ⚠ **Não há ícone novo, string nova nem dependência nova.** Nenhuma medida nova: o que entrou na
  folha de estilo é `flex`, `minWidth` e `100%` — relações, não distâncias.

---

## [0.8.3] — 2026-09-16

✅ **PUBLISHED — all seven, 2026-09-16.** Verified by downloading the package back from npm: the
seven read `0.8.3`, the `native` tarball declares `"@aurea-uds/tokens": "^0.8.3"` with no
`workspace:`, and it carries all seven fixes.

🔴 **And reading the registry lied again — worse than last time, because this time the rule from
last time was already being followed.** After the `0.8.2` publish one package read stale, and the
lesson recorded was *"re-read before accusing"*. Here I **did** re-read — three times in forty
seconds — and also asked for the full version list, and also asked for the exact version, which
answered **404**. All three agreed, and all three were wrong: the package was already published
and the publish output on the terminal said so. **The lag covers the whole package document, not
just the latest tag, and its 404 is indistinguishable from a version that never existed.**
The reading that decides is `npm pack <package>@<version>` — it touches the artifact instead of
the document.

**Every item below came from the consumer**, who checked `0.8.2` against the published `dist` and
filed six findings. All six were true, and five of them had passed 1430 tests, `validate.py`, the
build and the whole publish.

### Fixed — native

- **The brand tone was writing text in the fill colour.** `Button`/`IconButton` with
  `appearance="ghost"|"outline"` and `tone="brand"` painted the label with `primary` — the yellow
  meant for *filling*. Against the light theme that measures **1.73:1**, where WCAG asks 4.5:1. It
  now uses `link`: same hue, darker, **5.02:1** on light, and on dark it *is* the brand yellow, so
  nothing changes there. The identity is untouched — the fill yellow stays invariable; what
  changed is which of the two is used to **write**.
- **And "who else has this problem?" found a second tone.** Measuring the rest, `destructive` as
  text on light is **4.30:1** and fails too. It now uses `danger400` (6.86 light, 7.47 dark) — not
  an invention: `Input` already used that token for its invalid border.
  ⚠ The same question also showed **the web had already fixed this** (`aurea.css:1032` and
  `:1036`, both tones darkened under `[data-theme="light"]`). Native was the only side missing it,
  for the third time this week.
- **`Input` was dropping props in silence.** It destructured fourteen and had neither `...rest`
  nor `ref`, so `autoComplete`, `textContentType`, `autoCorrect`, `returnKeyType`,
  `onSubmitEditing` and `maxLength` were discarded. On a sign-in screen that means the password
  manager does not recognise the fields, the keyboard "corrects" the e-mail address, and the
  keyboard's *next* key does not move focus to the password. ⚠ It was two layers deep:
  `PasswordField` forwarded `...rest` and `Input` threw it away. `InputProps` now extends
  `TextInputProps` with an `Omit` of what Aurea computes, and `ref` arrives as a prop (React 19,
  no `forwardRef`). **This is the worst of the six — the only one with no symptom on screen.**

### Added — native

- **`Text` gained a `link` tone.** Nothing in the package used `color.link`, so the app had to
  write `style={{color: t.color.link}}` by hand.
- **`PasswordField` gained `leading`** — a slot in front of the field, for the padlock. It had
  been sealed shut: the component builds its own group, so there was nowhere to put one.
- **`PasswordField` gained `icons`**, and its JSDoc now says what was written nowhere: the eye
  needs `view` and `view--off` in the registry. Without them the button is **invisible** and the
  warning only fires in `__DEV__` — in production nobody can reveal the password they typed, with
  nothing on screen to explain why.
- **`Separator`** — same colour and thickness as the web's `.separator`, two orientations, plus a
  `label` for the line-with-text-in-the-middle ("or continue with"). ⚠ `label` **does not exist on
  the web** and the divergence is declared rather than hidden. ⚠ It carries **no accessibility
  role**: `separator` is not in React Native's list, and inventing the nearest match is the trap
  Lote 5 and `Table` already paid for.

### Verified

18 new tests. The three most important gates were proven **against the defect**: putting the fill
yellow back into text fails 2; reverting the `Text` tone fails 1; removing `Input`'s `...rest`
fails 6.

1448 tests across 41 files · `validate.py` OK · `check-pack` OK · `tsc` clean · build clean.

---

## [0.8.2] — 2026-09-15

✅ **PUBLISHED — all seven, 2026-09-16.** Verified against the registry, not against the terminal:
the seven read `0.8.2`; the `native` tarball **downloaded back from npm** declares
`"@aurea-uds/tokens": "^0.8.2"` with no `workspace:` anywhere in its manifest, and carries the three
new components plus `Button`'s `leading`/`trailing`.

🔴 **And the first registry read lied — a cheap lesson, recorded because it looks exactly like a
real defect.** Moments after the publish, six packages read `0.8.2` and `native` still read `0.8.1`
— the signature of a half-finished publish. It wasn't one: npm says so in the publish output
(*"Your package is being processed and may take a few minutes to become available"*), and the second
read was `0.8.2`. **The rule "verify against the registry, not the terminal" does not say WHEN**;
reading too early produces a false negative wearing the face of a broken release.

### Added — native

Three components, and they exist because **the app measured the sign-in screen** and found two
gaps. The first one was real on this side only.

- **`InputGroup`** — the field box that accepts things inside it. It takes over border, radius,
  background, height, invalid and focus; the `Input` inside it goes quiet. Both drawing at once is
  border-inside-border, the same defect that `.input-group > .input` zeroes by hand on the web
  (`aurea.css:751`). Proven in both directions: give the box back to the field and two tests fail.
- **`InputGroupAddon`** — a slot. **No `side` prop, unlike the web**: there the CSS needs to know
  which side to pad; here the order is the JSX order inside a Yoga row, and a prop that changed
  nothing would be a prop that lies. Declared in the JSDoc rather than mirrored for symmetry.
- **`PasswordField`** — the password field with the eye. It does **not** accept `secureTextEntry`
  (a password field that did would stop being one, the same reason `type` does not cross on the
  web); the button's **label is the state announcement**, with no pressed state beside it, or the
  screen reader says the same thing twice; and `autoCapitalize` starts at `none`, because on
  Android the first letter is capitalised by default and in a hidden field nobody sees the typo.
- **`Button` gained `leading`/`trailing`** — any drawing, not one of our icons.

**Measured before writing**: the gap was **native-only**. The web has had `InputGroup`,
`InputGroupAddon` and `PasswordField` since 2026-08-29, so this is that design translated, not a
new one. Focus crosses by context, because React Native has no `:focus-within` — without it the
only hint of which field the keyboard is feeding disappears the moment you put an icon in it. The
Android fix of 2026-09-09 (`paddingVertical: 0` + `textAlignVertical`) crosses into the group, with
a test of its own.

### Not added, on purpose — the Google and Apple logos

The app asked for them. They are **not coming**, and the reason is not technical.

Measured: `@carbon/icons` 11.84.0 ships **46 brand logos** and **neither Google nor Apple is among
them**; the `apple` icon that does exist is filed under Enterprise/Commerce with the alias
*"fruit"* — it is the fruit. Read at the source, not from memory: Google requires its own asset
bundle and forbids redrawing the mark (*"you can't change the size or color of the Google 'G'
logo"*); Apple forbids the logo outright (*"You may not use the Apple Logo … except pursuant to an
express written trademark license from Apple"*).

**A trademark does not go into an Apache-2.0 library.** What shipped instead is `leading`/`trailing`
on `Button`: the capsule is ours, the mark comes from the app — and the slot **does not tint** what
it receives, with a test, because tinting the "G" is exactly what Google's rule forbids.

### Verified

1430 tests across 40 files · `validate.py` OK (42 checks) · `check-pack` OK · `tsc` clean ·
`pnpm build` clean.

---

## [0.8.1] — 2026-09-13

✅ **PUBLISHED — all seven, 2026-09-13.** Verified against the registry, not against the terminal:
the seven read `0.8.1`; the published `native` tarball declares `"@aurea-uds/tokens": "^0.8.1"`
with no `workspace:` anywhere in its manifest; the tarball **downloaded back from npm** carries all
four fixes (`focusStrong` in `dist/numero.js`, `fullWidth` in five places, `KeyboardAvoiding` twice
in `dist/busca.js`, and **zero** occurrences of the invented `"85%"`/`"45%"`); `check-published.mjs`
installs both proof apps from the registry and builds them on both sides of the server/client
boundary; and a scan of all **5300** text files across the seven downloaded tarballs — using
`validate.py`'s own `scan_text`/`decode_any`, imported rather than reimplemented — finds no private
name.

**A patch that ships only fixes, and every one of them was found by a human looking at a picture —
not by the 1409 tests, not by `validate.py`, not by the build, and not by the release itself.**

Four defects reached `0.8.0` in `@aurea-uds/native`. Three were found when the maintainer asked for
visual proof and the in-repo HeroUI inventory was finally opened; the fourth was found by asking
*"you do remember these run on iOS too?"*.

### Fixed — `@aurea-uds/native`

- **`NumberField` had no focus state.** It was the only field in the package without one: tapping it
  changed nothing on screen. The border now goes to `focusStrong`, in the same order every other
  field uses — invalid first, focus last, so a field being corrected still shows where the keyboard
  is landing.
- **`NumberField` stretched instead of hugging.** The web `.number-field` is `inline-flex`
  (`aurea.css:704-706`) and hugs its content; this one had `flex: 1` and filled the row, leaving the
  `−` and `+` thrown to the edges. It now hugs by default and takes a **`fullWidth`** prop for the
  case that needs the width (formatted currency does not fit in 64dp — not here and not on the web).
  The axis is HeroUI's own (`number-field` publishes `fullWidth`), not an invention.
- **The `Combobox` sheet was blind on iOS.** The sheet was not wrapped in `KeyboardAvoiding`, on the
  written reasoning that the keyboard metrics do not arrive inside a `Modal` — **which looked at the
  wrong platform.** Android already resizes the window (`adjustResize`); **iOS does not**, so a 90%
  sheet with the keyboard up left the entire list behind it: you type and see no results. This is
  the piece that blocks a form on the platform nobody on this project had run.
- **Raw numbers replaced by tokens.** `maxHeight: "85%"` and `minHeight: "45%"` were invented in the
  middle of a component with no CSS line behind them; the sheet is now a single token-derived height.

### Fixed — the instrument, not the library

- The test double discarded `textAlignVertical`, so every text field in the showcase rendered its
  text glued to the top. Measured first in the RN source — Android maps `"center"` to
  `Gravity.CENTER_VERTICAL` (`ReactTextInputManager.kt:574-587`) and iOS centres a single-line
  `UITextField` by default (`RCTUITextField.mm:224-227`) — so **the components were correct on both
  targets and the conversion was not**. Four call sites were affected.

### Added — the native smoke app

- **A `lote7` mode with eight questions**, and the app opens in it. Seven passed on Android 13 on
  2026-09-13; the one left open is the iOS keyboard question above, because **no device on this
  project has ever run iOS**.
- **`conferir-props.mjs`**, wired as step 2 of `rodar.mjs`: it reads the component interfaces from
  source and checks every prop the smoke app writes. It exists because a prop was written as
  `onChangeValue` instead of `onValueChange` in a `.js` file that nothing type-checks — the field
  would have shipped mute to a device with no console error.
- **The iOS path is documented** — Expo Go 57 on iOS requires being signed in on both the terminal
  and the app, with the same account, and the runner now says so.

### Unchanged

No API was removed and no behaviour outside these fixes changed. Consumers on `0.8.0` upgrade by
version number alone. ⚠ `@aurea-uds/native` still has no npm trusted publisher, so this ships
locally with 2FA. CI remains stopped by the account's spend limit.

---

## [0.8.0] — 2026-09-12

**The first batch the plan did not contain.** `NATIVE.md` §5.6 closed the native roadmap at Lote 6,
and `CLAUDE.md` said three times that there would be no Lote 7. That was right about the document
and wrong about the queue: **the consumer app became the queue**, and it hit three gaps on the very
first screen a user touches. All three were verified against the code before being accepted — and
one of them arrived with a premise that only the check caught.

✅ **PUBLISHED — all seven, 2026-09-12.** Verified against the registry, not against the terminal:
the seven read `0.8.0`; the published `native` tarball declares `"@aurea-uds/tokens": "^0.8.0"`
(no `workspace:`) and carries `dist/busca.js`, `dist/numero.js` and `dist/midia.js`; the two proof
apps install from npm and build (`check-published.mjs`); and a scan of all **5300** text files
across the seven downloaded tarballs — using `validate.py`'s own word-boundary matcher, not a naive
substring — finds no private name.

The work in this entry was done on 2026-09-11; the release date above is the day it reached the
registry. ⚠ `@aurea-uds/native` still has no npm trusted publisher, so this shipped locally with
2FA, as `0.7.0` did. CI remains stopped by the account's spend limit.

### Added — `@aurea-uds/native`, five components (46 → 51)

- **`Combobox`** — the field you *type in* to find one item, over `FlatList` and a bottom sheet.
  Takes `onSearchChange`, `loading` and `onEndReached` on top of the web's single-select contract.
- **`SearchField`** — magnifier, field and clear in one box. `role="search"`.
- **`NumberField`** — currency, decimal measure and a stepped counter. Formats on blur via the
  platform `Intl`, and emits a raw `number`.
- **`Image`** — reserves its box before the bytes arrive and falls back when they never do. Neither
  of which the bare RN `Image` does.
- **`Gallery`** — a grid of tiles that enlarges into the `Dialog` that already exists.

Also added: **`Input.formatOnBlur`**, three public number helpers (`formatarNumero`, `lerNumero`,
`separadoresDoLocale`) and **eight new strings** in both languages. Two of those keys
(`comboboxSearch`, `searchClear`) have **no web counterpart**, because the anatomy differs — the
sheet has a search field of its own, and RN has no `type="search"` drawing an "x" for free.

**Zero new dependencies.** Everything sits on `FlatList`, `Modal`, `TextInput` and `Image` from
React Native itself. The `BUILDING.md` §3.3 tripwire was never pulled.

### Decisions

- **[ADR-0043]** — *the native `Combobox` diverges from the web, and prop PRESENCE is the switch.*
  Remote search with **single** selection does not exist on the web: there `Combobox` filters
  client-side, and the one with `onInputChange` is `MultiCombobox`, which is multi-select. With
  `onSearchChange`, Aurea does not filter; without it, it does. This is the **second** declared
  divergence of the native target, after Lote 6's `Table`.
- **[ADR-0042]** — *the formatter is the device's `Intl`, and the way BACK is ours.* Confirms
  ADR-0024 (format on blur, never live). What changes without Base UI is that the round trip
  becomes ours: `lerNumero` derives the locale's separators by formatting a **probe number**,
  because `formatToParts` is Android-only in the RN JS engine. `notation: "compact"` is **refused**
  with a `__DEV__` warning — it is broken on both platforms, and a wrong "1.2M" on a data-entry
  screen is worse than "1,234,567" because it looks right.

### Fixed — a premise, not code

The demand asked whether ADR-0024 still held "since there is no guaranteed blur equivalent" on
native. **There is.** `TextInput` has `onBlur`, and `Input` has declared and wired it since Lote 4
(`inputs.tsx:239-240`, `278-279`). Recording this matters more than the answer: the real risk was
elsewhere, and it only surfaced once the wrong premise was out of the way.

### Changed — contracts

`Combobox`, `SearchField`, `NumberField`, `Image` and `Gallery` now read `"native": "supported"`.

⚠ **The other 46 fichas still read `"native": "planned"`, and that has been false since
11/09/2026.** It is pre-existing debt from Lotes 0–6, not something this batch introduced or could
honestly claim on its own. Flagged for decision, not silently fixed.

### How this was measured

    # the five new components, and that they leave the barrel
    grep -n "Lote 7" -A 30 packages/native/src/index.ts

    # the accessibility roles, in the RN source rather than from memory
    grep -n "SEARCH ->" node_modules/.pnpm/react-native@*/node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/uimanager/ReactAccessibilityDelegate.kt
    grep -n "SearchField" node_modules/.pnpm/react-native@*/node_modules/react-native/React/Fabric/RCTConversions.h

    # 47 tests, six of them proven against the defect and not just against today's state
    npx vitest run tests/unit/native-lote7.test.tsx

### Not done, and declared

**Nothing was proven on a device.** `apps/native-smoke/` was not extended. The open glass questions
are concrete and listed in `NATIVE.md` §8.6 — none of them blocks use, all of them matter once
there is a real screen.

---

## [0.7.0] — 2026-09-11

✅ **PUBLISHED — all seven, and `@aurea-uds/native` for the first time ever.** Verified against the
registry, not against the terminal: the seven read `0.7.0`, the published `native` tarball declares
`"@aurea-uds/tokens": "^0.7.0"` (no `workspace:`), and a scan of all 5294 text files across the
seven downloaded tarballs — run with `validate.py`'s own word-boundary matcher, not a naive
substring — finds no private name. The leaks that `0.5.0` and `0.6.0` carry are **not** in this one.

⚠ **`@aurea-uds/native` still has no npm trusted publisher**, so it does not yet ship from CI. What
changed is that configuring one is now *possible*: npm requires the package to exist first, and it
does. CI itself remains stopped by the account's spend limit.

🔴 **And the publish found a defect that would have been permanent.** `npm publish` does **not**
translate the `workspace:` protocol, and `@aurea-uds/native` is the first publishable package in
this house with an internal dependency. Published by the path the ADR documented, it would have
carried `"@aurea-uds/tokens": "workspace:^"` literally — **uninstallable for every consumer, and
immutable in the registry.** The path is now `scripts/publicar.mjs`: pnpm packs (it translates), npm
publishes the tarball (so 2FA locally and OIDC in CI are unchanged).

✅ **The third blocker — "37 of the 46 native components have never rendered on a device" — fell
on 10/09/2026, and this entry says 10/09 rather than 09/09 because the first claim was
overstated.** On 09/09 the smoke ran and the report was *"4 sim, 6 sim, 11 sim. tudo
funcionando"*; this file recorded eleven of eleven. **Question 5 was in fact broken** — touching
the body of the `Select` sheet closed it — and it slipped through under the general "everything
works" because only three questions had been named. *A generic report is not a per-question
result*, and treating one as the other is how a broken question got recorded as passing.

✅ **What closed on 10/09 differs in kind: the build was verified.** The screen showed
`build c072f83` and the terminal printed the same value, so the answers are about the code that
exists rather than about an artefact nobody had identified. **That had never been true of any
earlier run**, and it is why the eleven of mode `resto` and seven of the eight of `lote2` count
now. The three most expensive passed, each closing a different debt — the **numeric keyboard**
(the single line of the consumer's plan that Batch 4 exists to satisfy), the **Android BACK
button** across all four overlay surfaces (no code test can prove it: React Native's `Modal`
decides), and **a thousand rows scrolling** without stutter, which is the oldest open question of
the whole target —
[ADR-0038](decisions/0038-um-componente-por-icone-sobre-react-native-svg.md) opened it on
31/08/2026 and deferred it *"until there is a list screen"*.

⚠ **One half-question remains, and it does not block.** Mode `lote2` asks whether `Spinner` and
`Skeleton` **stop** when Android's "Remove animations" is on. They spin correctly; the preference
was **off** on every run, so the half that matters was never exercised. No code test reaches it:
the test asks the double, and the double is not the operating system.

### Added — the React Native target, complete

`@aurea-uds/native` goes from the Lote 0 foundation to **46 components** across seven batches, all
authorised one by one between 02/09 and 09/09/2026.

- **Batch 1** — `Text`, `Screen`, `Stack`, `Cluster`, `Grid`, `Card`, `Icon`, `Button`,
  `IconButton`, plus `criarFolha`, the memoised stylesheet factory.
- **Batch 2** — `KPI`, `Progress`, `Status`, `Badge`, `Alert`, `Skeleton`, `Spinner`,
  `EmptyState`, `DataState`, `Avatar`, plus the strings table and `useReduceMotion`.
- **Batch 3** — `BottomNav`, `Topbar`, `NavList`, `Stepper`, and pull-to-refresh as
  `onRefresh`/`refreshing` on `Screen`.
- **Batch 4** — `Field`, `Label`, `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `Radio`,
  `SegmentedControl`, `Form`, `KeyboardAvoiding`, plus `DatePicker` and `PhotoInput` behind the
  deep path `@aurea-uds/native/system`.
- **Batch 5** — `Dialog`, `ConfirmDialog`, `Drawer`, `BottomSheet`, `ToastHost`/`useToast`.
- **Batch 6** — `Timeline`, `DataList`, `Table`.
- **`Chart` and `ChartLegend`** — [ADR-0041](decisions/0041-o-motor-de-grafico-do-nativo-e-nosso-sobre-react-native-svg.md).

### Changed — three things that do NOT match the web, on purpose

Each is measured, and each is documented where a reader will hit it:

- **`Table` is not a table.** Each row becomes a card and each cell carries its column name, and
  the API is `columns` + `rows`, not `children`. Two measurements force it: `min-width: 720px` does
  not fit a 360dp phone, and the `table` accessibility role **maps to nothing on either platform**.
  Keeping the grid would lose the reading without gaining the semantics.
- **`Chart` draws.** On the web it is 79 lines of skin over `recharts`; here scale, ruler, path and
  axis are code in this repository. **With two or more series the legend cannot be turned off** —
  the `--chart-*` palette is a single-hue ramp, measured at ΔE 5.9 between neighbours.
- **`ToastHost` is explicit.** There is no portal in React Native, and putting the stack inside
  `AureaProvider` would add a `View` to every existing consumer's layout in silence.

### Fixed

- 🔴 **`accessibilityRole="status"` crashed the app.** `Alert` and `Toast` passed it; `status` is
  **not** one of React Native's 40 accessibility roles, and Android answers with a red screen —
  `Invalid accessibility role value: status` — not a silent degradation. Found on a real device on
  09/09/2026, the first day the smoke instrument ran.
  The comment sitting above the line claimed both `alert` and `status` existed. It had **never been
  measured**. 1336 tests passed over it because the `react-native` test double accepts any string:
  *the double is our idea of React Native, and that idea was wrong*. `danger` now uses `alert`,
  which exists; every other variant passes **no role at all** — `accessibilityLiveRegion` is what
  makes TalkBack speak, and it is untouched.
  **The compiler cannot catch this, and that is the larger finding.** In `react-native@0.87.1` the
  type files that `moduleResolution: "bundler"` resolves are the generated ones, and there the
  `AccessibilityRole` union ends in **`| string`** — which collapses all 40 literals to `string`.
  A probe confirms it: `const p: AccessibilityRole = "not-a-role"` compiles clean. That is how
  React Native generates types from Flow, not a misconfiguration here, which means **no TypeScript
  project can catch this class of defect**.
  **New `check 41`** reads the role lists out of the installed `react-native` and rejects any
  literal the package passes. A hand-written list would repeat the very mistake it exists to catch.
  Writing it surfaced a **third crashing role nobody had noticed**: what throws is a Kotlin enum
  (`ReactAccessibilityDelegate.fromValue`), and that enum has **39** entries against TypeScript's
  **40**. The extra one is **`tabbar`** — it compiles, the type offers it, and it crashes exactly
  like `status`. The check requires membership in **both** lists.
- 🔴 **`Input` clipped its own text on Android.** `padding-block:0` is literal in the web CSS and
  never crossed over — and its absence in React Native does not mean "no padding": the Android
  component descriptor **injects the platform theme's padding into the Yoga node** whenever no
  vertical padding is given. With a fixed height that eats the box from the inside. The other half
  is alignment: with no `textAlignVertical`, Android leaves the text at the **top**. Two properties
  fix both, and each mirrors a decision the web already had. `Textarea` was never affected — it
  already sent its own vertical padding.
- **`Select` closed its own sheet.** A `View` with no handler does not become a responder in React
  Native, so a touch on the sheet body passed through to the backdrop. Found while writing the
  Batch 5 overlays, which have the same shape.
- **`Alert`'s dismiss button was hardcoded to English.** The strings table had no `close` key until
  Batch 5 added one for `Dialog`.
- 🔴 **`@aurea-uds/react`: the theme had TWO sources of truth, and they diverged after a write.**
  `useAureaTheme` (port `/system`) reads the DOM and needs no provider; `useTheme`/`useDensity`
  (main barrel) read React context and need one. Both are public, on different ports, and nothing
  said which to use. Inside an `AureaProvider`, calling `useAureaTheme().setTheme("light")`:

  ```
  BEFORE   ctx=dark   dom=dark    attr=dark
  AFTER    ctx=dark   dom=light   attr=light
  ```

  The attribute flips and **the whole stylesheet follows it**, while every component reading
  `useTheme()` keeps rendering as dark on a page that is light. No error, no warning — and it
  shipped in `0.6.0`. The cause is exact: the `/system` setter wrote
  `document.documentElement.dataset` directly, while the provider's effect only rewrites the
  attribute when **its own value** changes, which it had not.
  **Fixed:** with a provider present, all three writers (`setTheme`, `setDensity`, `toggleTheme`)
  delegate to it; standing alone they still write the DOM, and that half has its own test — a fix
  that required a provider would be a worse break than the defect. Reading still comes from the
  DOM in both cases, because the DOM is what the stylesheet obeys.
  Detection is a **sentinel context**, not "inspect `ThemeContext`": its default is
  `{theme:undefined,setTheme:noop}` **on purpose**, so `useTheme()` does not throw outside a
  provider — which means the value cannot tell *no provider* from *provider that has not adopted a
  theme yet*.
- 🔴 **And fixing that surfaced a second defect that had been passing tests for months.** The
  provider's `toggleTheme` was `value==="light"?"dark":"light"`; with the value undefined that
  yields **`light`** — so anyone on a system-light default clicked the toggle and **saw nothing
  happen**. It is the exact failure the comment above `useAureaTheme` warns about ninety lines
  further down, and which a test over there already enforced.
  **The two halves disagreed on the same edge case, and the disagreement survived because each was
  tested alone.** A test that exercises only one side never sees the seam — the same shape as
  check 39, check 41, and the three delivery defects of the same day: a control that only covers
  the case its author imagined.

- **Check 39 was blind to any test file not named `native-lote*`.** Found by the check itself when
  the `Chart` test arrived as `native-chart.test.tsx`. A gate whose reach depends on a filename
  convention goes blind to every new file that does not follow it.

- 🔴 **Touching the body of a sheet closed it — and the 09/09 fix did not hold on the device.**
  That fix added `onStartShouldSetResponder` to the panel while the panel still sat **inside** the
  backdrop's `Pressable`. Tests passed. On 10/09 the defect was reported intact on glass: a touch
  between two options of the `Select` sheet closed it, exactly like a touch outside.
  **The reason is structural.** The panel contains a `ScrollView`, and a `ScrollView` *must* claim
  the touch in order to scroll; responder negotiation asks the deepest node first, so the
  `ScrollView` decides and the panel's handler is never consulted. **A handler does not beat a
  component whose whole job is to win that negotiation.** The 1347 tests passed because the double
  accepts the handler and does not simulate the negotiation — *the double is our idea of React
  Native*, for the third time in one week.
  **Fixed by construction:** the touchable backdrop is no longer an ancestor of the panel. It is
  an absolutely-positioned sibling drawn first (hence behind); the veil colour lives on the
  container, which takes no touch. With no ancestor there is no propagation to cancel.
  **Who else had it?** Four: `Dialog`, `Drawer`, `BottomSheet` and `Select` — all four fixed in
  the same commit. `ConfirmDialog` has been immune since birth: its backdrop has no `onPress`, and
  that is one word of difference, on purpose.
  The control (`tests/unit/native-fundo-irmao.test.tsx`) requires, for all four, that a closing
  backdrop exists **and has no children**. Proved against the defect in both places: re-nesting
  `Dialog` fails only the Dialog case; re-nesting `Select` fails only the Select case.
  ⚠ And an older `ConfirmDialog` test failed alongside and was rewritten: it used the veil colour
  **on the Pressable** as its marker, and the colour moved elements. The premise had aged, not the
  code.
- **A white band sat under the bottom bar in dark theme.** `Screen` paints the theme on its own
  root and `BottomNav` is its sibling, so what showed behind the bar was the app's root view — and
  an unpainted root is **white** on Android. Not a library defect: the smoke app used a Fragment
  where it needed a painted `View`.
  ⚠ **And the symptom pointed at the wrong component.** With the white band the bar *looks* like
  it is floating far from the bottom, which is precisely the sign the app's own question 1 says to
  read as "the gesture-bar breathing room became a sum instead of `Math.max`". The arithmetic was
  correct. **Before blaming the arithmetic, paint the background** — now written into the
  `BottomNav` JSDoc, because a consumer following the documented "she is a sibling of the screen"
  hits the same band.

### Fixed — the instrument, which ships nothing but decides everything

`apps/native-smoke` is not published. It is listed here because on 09/09/2026 it ran on a device
**six times, and three of those runs measured nothing but its own delivery** — the code was
correct, the packed tarball was correct, and the phone kept executing JavaScript that no longer
existed on disk.

- **`npm install` did not reinstall when the version was unchanged.** The prepare script only
  invalidated the lockfile and `node_modules/@aurea-uds` when the tarball **version** changed. The
  common case is the opposite — same version, new code — and there npm answers `up to date in
  704ms` and installs nothing, because the `file:` target is literally the same path. Invalidation
  is now **unconditional**: it costs 9–16s of install and buys an app that does not lie.
- **Running the smoke dirtied a tracked file, so the next `git pull` aborted.** The app's
  `package.json` is versioned *and* rewritten by the prepare script, because it pointed at a
  tarball with the version in its name. The name lost the version and never changes again.
- **The phone's bundler cache served stale JavaScript.** Metro now always starts with `--clear`,
  and the run sheet says to force-quit Expo Go if the error returns, because the device's own cache
  is the one thing `--clear` does not reach.
- **The documented command did not run in the user's shell.** It was `git pull && node …`, and
  Windows PowerShell 5.1 rejects `&&`. Replacing it with `;` would have been **worse than the
  defect**: `;` does not stop on error, so a failed pull would let the smoke run against old code —
  which is precisely runs 3 and 4 above. The `git pull` became **step 1 inside the script**, so
  ordering is code rather than shell syntax and the documented command is a single one.
- **The app never passed `strings`, so the phrase table had never been seen on glass.** Two library
  strings rendered in **English** in the middle of a Portuguese screen. The library was right —
  without `strings` the English defaults are correct behaviour — but the phrase table is Batch 2's
  first decision and the instrument was not exercising it. Now the screen doubles as a gate: a key
  missing from `ptBR` shows up in English immediately.

- 🔴 **And the most expensive finding of 10/09 is not a component: the running machine was 17
  commits behind.** Three independent fixes, in three different files, and the report was
  *"nothing changed"*. Three simultaneous wrong fixes is improbable; **code that never arrives is
  the simple explanation**, and it is the signature this repository already recorded on 09/09 —
  *a wrong fix breaks one thing; a fix that never arrives changes nothing.* The proof came out of
  the user's own terminal: its first line read `[1/4]`, and the runner has had **five** steps
  since 09/09.
  ⚠ **The trap is of my own design.** `git pull` became step 1 *inside* the runner, to work around
  PowerShell's rejection of `&&` — so **the fix that makes the runner self-update can only arrive
  through a manual pull.** Until it does, every run reinforces the illusion. A circular dependency
  I created without seeing it.
  ✅ **The control lives on the screen**, which is the one place none of the other gates look: the
  prepare step writes the commit into `versao.json` (git-ignored, per the `package.json` lesson),
  all four modes print `build <commit>` in the header, and the runner prints the value the screen
  must show. **Two numbers to compare, and the argument about who believes whom is over.** It paid
  for itself before judging a single component — it is what identified the stale checkout.

**Four gates came out of this, each born from a measured defect rather than caution:** `check 41`
(accessibility roles against the intersection of both real lists), **step 3 of the runner** (what
is installed matches the freshly packed tarball, hash by hash, 22 files) and `conferir-bundle.mjs`
(what the phone actually **executes** — built with `expo export --no-bytecode` and read: 30
`accessibilityRole` occurrences, 11 distinct values, all serviceable, zero `status`).
🔴 **That last one is the question that was missing all along.** Four runs asked *"is the code
right?"* and *"is the installed package right?"* — both measured, both yes. **Nobody asked "what is
the phone executing?"**, which is the only one that decides.


### Peer dependencies

`@aurea-uds/native` declares four required peers — `react` `>=19`, `react-native` `>=0.76`,
`react-native-svg` `>=15`, `react-native-safe-area-context` `>=5` — and **two optional**:
`@react-native-community/datetimepicker` `>=8` and `expo-image-picker` `>=16`. Whoever uses neither
dates nor the camera installs nothing extra and sees no warning.

### Verified before this entry was written

- `pnpm build`, `npx vitest run` (**1351 tests, 37 files**), `node scripts/check-pack.mjs`
  (`contracts:5 core:6 fonts:29 icons:5 native:45 react:73 tokens:8`), `tsc --noEmit`, and
  `python scripts/validate.py` (**41 checks**) — all green, locally. **CI is still stopped**, so
  the green never comes from outside: verification here is local, before the push, or it is blind.
- **The catalogue was driven in Chromium**, which is this repository's own per-phase requirement
  and the one that exercises the theme fix end to end: the toggle flips three times in a row and
  both the `data-theme` attribute **and the painted background** follow it
  (`oklch(0.145 0 0) ↔ oklch(0.965 0 0)`), with zero page errors.
- **On a real Android phone, over a build whose commit was read off the screen and matched the
  terminal**: 29 of the smoke instrument's 30 questions — the eleven of mode `resto` and seven of
  the eight of `lote2`. The one that remains is half of a question and does not block.
  ⚠ **The verification that matters most here is the one about the verification itself**: without
  the build marker, an earlier run of this same instrument reported "everything works" over code
  that was 17 commits old, and one broken question was recorded as passing.
- **All seven tarballs packed and scanned for private names: clean.** 5316 files read, using the
  validator's own patterns.
  ⚠ **A first pass with a naive substring match reported ten hits and every one was false** — a
  five-letter name on the list sits inside the middle of an ordinary English word that happens to
  be a Carbon icon filename, and three-letter names land inside SVG path data by chance. The
  validator uses **word boundaries** for exactly that reason, and reusing its own patterns is what
  turned ten into zero.
  🔴 **And writing that sentence leaked one.** The first draft of this entry named the word, which
  is precisely what the rule forbids — *"never transcribe the names in the clear in any file"*.
  **Check 26 caught it before the commit.** The lesson is not "be careful": it is that the gate has
  to run on the prose too, and it does.

---

## ~~[Unreleased]~~ — notas escritas depois da 0.6.0, que saíram na 0.7.0 (título corrigido em 25/09/2026)

No published code changed. What follows is documentation, one decision, and one gate — recorded
here because the next release must not go out without the privacy fix below being understood.

### Fixed

- **A private consumer name was removed from the published stylesheet.** It sat in a source comment
  in `packages/core/src/aurea.css` (and so in `dist/aurea.css`, which `@aurea-uds/core` ships) from
  18/08/2026. Measured against the registry by downloading all twelve tarballs — six packages ×
  two versions: **only `@aurea-uds/core`, in `0.5.0` and `0.6.0`, one file each.** The other five
  packages are clean in both. `npm deprecate` does not remove files and the `unpublish` window has
  closed, so those two tarballs stay as they are; **every version from here on is clean.**
- **A contradiction inside `CLAUDE.md`:** one section said pushing was suspended while another said
  it was allowed. The suspension ended on 30/08/2026; the stale line is gone.

### Added

- **`MediaEmbed`** — vídeo de outro site na moldura da Aurea (N-10). O detalhe está na seção da
  `0.8.11`, no topo deste arquivo.

- **The private-name gate now covers the consumer's product and repository names**
  (`scripts/validate.py`, base64 as always). Proved against the defect: with the name in a decoy
  file the gate fails, printing only an index and never the name.
- **`decisions/0037`** — the native style engine is plain `StyleSheet`, and the theme layer is
  ours. **Supersedes `decisions/0028`** (Unistyles). What 0028 *measured* still stands and is what
  overturned its own choice: five peers (two native), no Expo Go, and one theme axis against
  Aurea's two.
- **`decisions/0038`** — one generated component per icon over `react-native-svg`, built from the
  raw SVG in `@carbon/icons` (2856 files scanned: three primitives, no masks, no `<use>`, no
  gradients). Deep paths `./icons/*` are the documented form, because Metro's tree shaking is
  experimental and a 2856-icon barrel would be a bet on the consumer's bundler config. **This was
  the last architectural decision blocking the native work** — what remains is authorization, not
  choice.
- **`NATIVE.md` grew from 291 to ~850 lines** — Etapa 4 now has a plan drawn from a measured
  consumer: four packaging blockers, 46 components in seven batches (seven of which the web has
  never needed), and the icon research behind the one decision still open.

### Changed

- **The consumer inventory was renamed to [`CONSUMIDOR-1.md`](docs/CONSUMIDOR-1.md)** and generalized,
  with the product, repository and domain vocabulary removed — the old filename carried the product
  name, so it could not stay. What a design system needs from that inventory — how many screens,
  which UI pieces, how many uses, which gaps — survives without the name.

---

## [0.6.0] — 2026-08-30

This section covers the reconciliation of two lineages that had drifted apart. `0.5.0` was
published on 20/08/2026 from a working copy that never pushed; the repository's `main` had been
frozen since 07/08 while a second line of work continued on a branch. Both were real, both had
tests, and neither was a superset of the other — so what follows is the union, and the notes say
which side each piece came from where that matters.

### Added

- **Nine components.** `AspectRatio` — a box that keeps its proportion, whatever the width.
  `Collapsible` — one section that opens and closes, with the open state owned by the app.
  `ContainerScope` — declares an Aurea container, the box that container-responsive values
  measure themselves against. `InputGroup` and `InputGroupAddon` — the box that looks like a
  field and holds the control plus whatever is glued to it: a glyph, a prefix, a button.
  `Label` — the field label on its own, for when you are not using `Field`. `Menubar` — the
  application menu row, where an open menu hands over to its neighbour. `PasswordField` — a
  password field whose show/hide control announces what it does. `ToggleGroup` — several
  toggles sharing one state, with arrow-key navigation between them.

- **Three hooks, and six that existed but were not documented.** New: `useTheme` and
  `useDensity` read and switch the current theme and density from anywhere inside
  `AureaProvider`; `useValorResponsivo` resolves a `Responsive<T>` into the single value that
  applies right now. Already shipping in `0.5.0` with no ficha, and now part of the published
  contract: `useAureaStrings`, `useAureaTheme`, `usePortalContainer`, `useReorder`,
  `useSpriteUrl`, `useToast`.

- **The menu is an anatomy, not a list of labels.** `DropdownMenu`, `ContextMenu` and `Menubar`
  take a `MenuEntry` union instead of a flat array of actions: `link`, `checkbox`,
  `radio-group`, `group`, `submenu`, plus the plain action and the `"separator"` string. A
  submenu is a `MenuEntry[]` again, so the shape nests as far as the menu does.

- **`Combobox` groups its options, and says so when nothing matches.** The same `items` prop
  takes flat options or `{label, items}` groups — the kind is read from the first element, and
  mixing the two is not supported. `empty` writes what the list shows when nothing matches; a
  fixed string could not say "no fruit by that name". `Combobox` also regained `size`.

- **`NumberField` exposes the drag handle.** `scrubbable` turns on the engine's scrub area and
  `scrubDirection` chooses the axis. The direction is a class, not a `data-*` attribute: an axis
  is not a state, and the gate that checks painted states against declared ones says so.

- **`Tabs` chooses what the arrow keys do.** `activateOnFocus` (the default, and what Aurea
  always did) moves focus and switches the panel together; `activateOnFocus={false}` is the
  APG's manual pattern, where the arrow only moves focus and Enter or Space activates — the
  right one when switching a tab costs a network round trip. `loopFocus` decides whether the
  last tab wraps to the first, and `orientation` is responsive.

### Changed — one break, and it is spelled out

- **`size` on the field family is the system's step, not the HTML attribute.** In `0.5.0`
  `Input`, `SearchField`, `Select`, `Checkbox`, `Radio` and `Switch` inherited the DOM's `size` —
  a width in characters on `<input>`, a count of visible options on `<select>` — because their
  props extended the element's attributes untouched. They now declare `size?: Responsive<'sm' |
  'md' | 'lg'>`, and the native attribute is shadowed with `Omit`.

  **What breaks:** `<Input size={30} />` and `<Select size={5} />` stop compiling, and a runtime
  value that used to reach the DOM no longer does. Everything else is unchanged.

  **Why the system's step wins.** One prop name cannot mean two things. Every other size axis in
  Aurea — `Button`, `IconButton`, `Avatar`, `Spinner`, `Toggle` — is already `sm`/`md`/`lg`, and
  a field family that alone means something else is the kind of exception nobody remembers at the
  call site. The native width in characters is a layout tool from before CSS; `width` or a
  container does it better and does not collide with a name the system already owns.

  **The replacement:** set the width in CSS, or wrap the field in a box that has one. The step
  now controls the height, the padding and the type size together, which is what the catalog page
  for these components has always claimed it did.

  This is the break [ADR-0014](decisions/0014-primeira-versao-publica-0-1-0.md) allows in a `0.x`
  minor, and this entry is the note it requires.

### Fixed

- **Seven components leaked the engine's event object into your callback.** `onValueChange`,
  `onOpenChange` and `onPressedChange` were handed straight to Base UI, which calls them with
  `(value, eventDetails)` — a second argument the public signature never declared and
  TypeScript never showed, because a function that accepts one argument is assignable where two
  are passed. `soOValor` in `pure.tsx` now trims the call to the declared arity. Two existing
  tests had encoded the leak, asserting `expect.anything()` in a second parameter; they were
  written against observed behaviour instead of against the contract, and they were corrected
  along with it.

- **The field size steps did nothing.** `Input`, `SearchField`, `PasswordField`, `Select`,
  `Textarea`, `Checkbox`, `Radio`, `Switch` and `Combobox` document a `size` of `sm`/`md`/`lg`,
  and the catalog page showed three fields labelled Small, Medium and Large that rendered
  identically. The prop had been dropped on one side of the merge while the page that explains
  it survived on the other.

- **`AppShell` lost its skip link.** The first stop of the keyboard was the navigation, with no
  way past it — WCAG 2.4.1. The link is back, and `<main>` is focusable so the jump lands.

- **The `DataGrid` ficha promised less than the component ships.** It said `role: table` with no
  keys, describing the component as it was before the APG grid was built; the merged code
  shipped the grid — roving tabindex over cells, arrows, `Home`/`End`, `Control+Home`/
  `Control+End`, `PageUp`/`PageDown`, `Enter`/`F2` into the cell's widget and `Escape` back out.
  Measured in a browser again on 29/08/2026: nine of the thirteen keys move the DOM from two
  starting cells, and the note records which four the method cannot reach and why.

- **`BottomNav`, `ToolPermission` and `CodeEditor` shipped keys their fichas did not declare** —
  `Space` on the first, `ArrowUp`/`ArrowDown`/`Space` on the second, `Enter` on the third. Found
  by measuring, not by reading: the keyboard bank went from 26 sections to 44, and 22 fichas
  that declared keyboard with nothing behind them now carry the trace of a browser measurement.

- **`NavList` and `AppShell` had whole sentences inside `a11y.keyboard`.** They counted as
  declared keys, the catalog drew them as if they were shortcuts, and no measurement could ever
  match one against a `KeyboardEvent.key`. Prose about the keyboard now has its own places
  (`a11y.keyboardNote` when a measurement is behind it, `a11y.nota` when it is description), and
  a gate rejects anything in the list that is not a key token.

- **The `lory` brand's semantic colours were below AA, and nothing was measuring them.** Five
  pairs: `success`, `warning`, `danger` and `info` in the light theme, and `danger` in the dark
  one. The worst measured **1.74:1** against a 4.5 minimum — a warning badge nobody could read.
  The cause is structural and applies to any palette read from a kit: the `-400` step comes from
  the MIDDLE of the ramp, and nothing from the middle of a ramp reads on a 0.95-lightness
  background. Only lightness moved; the hue is untouched and the chroma gave up the minimum
  needed to stay inside sRGB.

  Nothing was measuring them because the 18 badge combinations are built for the DEFAULT brand
  only, while ADR-0036 says a brand redefines colour — the very axis that check covers. The brand
  gate now carries the semantic matrix, and it reads the brand list from the token file instead
  of a hand-written array, so the next brand is covered without a new test.

### Notes

- `Separator` keeps the plain `<hr>` with a static `orientation`, not the engine-backed version
  with a responsive one that the other lineage had. Making it responsive means resolving at
  runtime, which means a hook, which under ADR-0026 would move it into a client module — and
  the measurement in that ADR put the cost of that at nine modules and 118 KB for anyone
  importing a sibling. A responsive hairline is not worth that, and the decision is recorded
  rather than quietly reversed.

---

## [0.5.0] — 2026-08-20

### Added

- **Brands: a second axis, orthogonal to the theme.** `data-brand` on the `<html>` element
  selects a named palette; `data-theme` keeps doing light/dark. Every brand carries BOTH themes,
  which is why it could not be a third value on the theme axis. Without `data-brand` the document
  is Aurea, byte for byte — nothing changes for anyone who does not ask.

  **A brand redefines COLOUR and nothing else.** Type, radius, density, spacing and icons stay
  Aurea's in every brand. This is deliberate: what changes the shape is not a brand, it is another
  library. Decided in [ADR-0036](decisions/0036-marca-e-um-eixo-e-o-amarelo-continua-invariavel.md).

  **The first brand is `lory`**: orange `#FF6600`, cool low-chroma neutrals, four
  semantics with soft backgrounds, 60 tokens per theme.

  ```html
  <html data-brand="lory" data-theme="light" data-density="comfortable">
  ```

  **The rule about the yellow changed SCOPE, not strength.** It said "invariant between themes";
  it now says invariant *within each brand* — which is what it always protected. Aurea's yellow is
  still the same in light and dark, and changing the default's primary is still forbidden.

### Fixed

- **The sidebar paints itself with its OWN tokens.** The current item used `--secondary` and
  `--foreground` — page tokens — and the resting items were being caught by the prose-link rule
  (`[data-theme="light"] a:not([class])`, which outweighs `.doc-nav a`). Neither was visible in
  Aurea, where the panel and the page share a lightness. `--sidebar-accent`,
  `--sidebar-accent-foreground` and `--sidebar-primary` were already published with no use in the
  core; they are the pair that was right all along.

- **`--sidebar-primary` in the light theme is the emphasis yellow, not the raw one.** On the white
  panel the raw yellow measured 1.60:1. Each brand now sets this to whatever reads on ITS panel.

- **The sidebar group label** went from 58% to 70% of `--sidebar-foreground`: on a light panel the
  old value measured 4.11:1, under AA.

- **`BottomNav`, `Sidebar` and the analytics block** — see the 0.4.0 entry; those shipped there.

---

## [0.4.0] — 2026-08-20

### Changed

- **`Sidebar` gained a `flush` variant — the one exception this design system makes to its
  floating-surface rule.** Opt-in: `variant="flush"` sits the panel against the edges, takes the
  full height and separates it from the content by a single rule instead of a gap. Measured on
  18/08/2026 against four shipping apps — Cloudflare, Sophos, Claude's own app and HeroUI's
  dashboard — none of which floats its sidebar.

  **The default is unchanged: the sidebar still floats**, exactly as published in `0.3.0` (margin,
  card radius, border on all four sides). Nothing about an existing `Sidebar` looks different
  unless you ask for the variant.

  Cards, dialogs and panels are untouched either way: the floating surface the system is built on
  stays. The exception is for this component, it is opt-in, and it does not generalise.

  **`AppShell` forwards it — `<AppShell sidebarVariant="flush">`.** Without that prop the variant
  would be unreachable for anyone composing through the shell, which is the normal path.

  **The icon rail is 68px, not 88px** (`--sidebar-rail` is now `4.25rem`), and the rail item is a
  36px SQUARE, centred, instead of a 71×36 stretched row. Both numbers were read in the reference
  source (`MAIN_SIDEBAR_WIDTH = 68`, `NavButton` icon-only is `size-9`). A rail wider than its item
  stretches the item into a capsule, which is the defect these two numbers fix.

  **The item icon went from 16px to 20px** — `--icon-md`, which is exactly their `size-5`.

  **And the collapsed rail now carries a Tooltip with the item name.** Collapsed, the label becomes
  `.sr-only`: a screen reader still hears it and a sighted user was left with a mute icon. This
  moved `overlays` before `feedback` in the module DAG (`MAP.md`) — no cycle, since `overlays` only
  imports `internal`, `system` and `actions`.

  The rows inside keep their radius in **both** variants — the concentric rule is written as
  `calc()` against `--radius-card`, not against the panel's own radius, so a flush panel with
  radius `0` does not drag the rows to zero with it.

### Deprecated

- **`Button`'s `pressed` prop, in favour of `<Toggle>`.** Removed in `1.0`; it still works today.
  Twelve reference libraries were read on 18/08/2026 — MUI, Fluent 2, React Aria, Adobe Spectrum,
  Carbon, Radix/Base UI, shadcn, ReUI, PrimeReact, HeroUI, Cedar and the W3C APG — and **none of
  them puts the pressed state on the plain button**: every one has a separate component, and ours
  is `Toggle`. Two ways to build the same control is the "which one do I use?" that marks a
  duplicated feature.

  The real difference: `Button pressed` only paints and announces while YOU keep the state;
  `Toggle` owns the state (Base UI engine), returns `onPressedChange`, and demands an accessible
  name when it is icon-only.

  Also: the two toggle examples left the Button catalog page — they were teaching a fake toggle —
  and `Toggle` got its own rich page, which it never had.

  **And a rule nobody had written down here, from the APG and Adobe Spectrum: the label must not
  change between states.** "Mute"/"Unmute" or "Play"/"Pause" is not a toggle, it is a Button.

### Added

- **`Separator` — the rule between things.** The system had none: only `.prose hr`, scoped to prose,
  and `ToolbarSeparator`, scoped to the toolbar. `orientation` is `horizontal` (a full-width
  hairline) or `vertical` (a 1px column that stretches, with a floor so it cannot measure zero and
  vanish).

  **It is a native `<hr>` and ships no JavaScript.** Base UI, the engine already in use, HAS a
  `Separator` — and it was deliberately not used: it is `'use client'`, it calls a hook, and all it
  produces is `role="separator"` plus `aria-orientation`, two attributes. Importing it would drag
  the pure-markup module across the server/client boundary, which is the defect
  [ADR-0026](decisions/0026-marcacao-pura-e-de-servidor.md) records — `Card` cost 118.5 KB crossing
  it. A native `<hr>` already carries `role="separator"` implicitly, so writing the role would be
  redundant ARIA; and `aria-orientation` appears only when vertical, because the role already
  defaults to horizontal.

  Inside a `Toolbar`, keep using `ToolbarSeparator`: that one takes part in the roving tabindex the
  engine manages. Base UI splits the two for the same reason.

- **`NavList` — the tappable list row.** The last gap the real consumer had
  (`CONSUMIDOR-1.md` §4.3). A list of rows that open something: leading icon, label, an
  optional second line, an optional trailing value, and the chevron. It is the brick every
  settings screen is built from, and neither `DataList` (a `<dl>` of term and value, not
  tappable) nor `Table` (a data grid) was it.

  `items: NavListItem[]` — `{id, label, description?, value?, icon?, href?, onClick?, disabled?}`.
  `href` decides the element **and the chevron**: with it the row is a link and gets the arrow,
  without it the row is a button and carries none — an arrow promises the row opens something, and
  signing out opens nothing.

  **It is NOT a landmark and has no current item**, and that is the decision that separates it
  from `Sidebar` and `BottomNav`: those two are app chrome, live in a `<nav>` and mark the current
  section with `aria-current="page"`. This is content inside the page — a third `<nav>` on one
  screen only adds noise for landmark navigation, and there is nothing to be "current" in a list
  you enter and come back from.

  The second line came from MUI's `ListItemText` (`primary`/`secondary`), the only mature
  reference among the nine folders — Base UI, the engine already in use, has no such component.
  A disabled row is `aria-disabled`, not `:disabled`, because `:disabled` drops the row out of the
  tab order and a keyboard user never finds out it exists. On a coarse pointer the whole row grows
  to 44px (`--target-min`).

  **A `Card` whose direct child is a `NavList` tightens its padding to `--space-1`.** The 20px of
  `--card-pad` is content padding: it left the row highlight floating in the middle of a big box —
  88% of the width, text starting 65px from the edge. The panel gives almost nothing and the row
  gives the rest.

### Changed

- **`Badge` rewritten — it was one shape, one size and six colours.** Nothing that already uses it
  changed: `md` is still the historical size, `soft` is still the historical tone, and `children`
  is still the content. What it gained, read from the local sources of Untitled UI's `badges.tsx`
  and MUI's `Badge.js`:

  `emphasis` (soft · outline · solid) · `size` (sm · md · lg) · `dot` · `leading`/`trailing`
  nodes · `image`/`imageAlt` · `count` with `max` (`99+`) and `showZero` · `anchor` on any of four
  corners, which turns it into the counter that rides on the corner of a child · `anchorShape`
  (`circle` pulls it 14% back, MUI's `overlap`) · `invisible` · and a cutout ring in the surface
  colour, overridable with `--badge-ring`.

  Also exported: **`formatBadgeCount(count, max)`**, so the accessible name can say the same
  string the eye sees.

  **An anchored badge is `aria-hidden`** — the count belongs in the accessible name of the thing
  it decorates (`aria-label="Inbox, 4 unread messages"`). This is the documented pattern in every
  source read.

  All 36 combinations of variant × emphasis × theme were measured for text contrast; the lowest is
  **5.60:1** and `skin.spec` now gates it.

  No dismiss button: `DIRECTION.md` §3.6 reserves removable classification for `Tag`, and a
  handler would force `"use client"` on the pure-markup module. `Tag` does not exist yet.

### Added

- **`BottomNav`** — the bar an application's top-level navigation lives in on a phone. Aurea had
  `Topbar` and `Sidebar`, and both are desktop vocabulary; this was the structural gap measured in
  [`CONSUMIDOR-1.md`](docs/CONSUMIDOR-1.md) §4.1 against a real consumer.

  It takes the **same `SidebarItem` type** as `Sidebar` — one list feeds the sidebar on a desktop
  and the bar on a phone, because two lists of one menu drift apart. A nested `items` is ignored:
  a bottom bar is flat. The container is a `<nav>` landmark and each item is a link with
  `aria-current="page"` on the current one; it is deliberately **not** a `tablist`, because a tab
  swaps a panel inside the page while a bottom bar changes page.

  The bar reserves room for the iPhone home indicator with `env(safe-area-inset-bottom)`, which
  only takes effect if **your** page declares `viewport-fit=cover` — without it the bar gets its
  normal spacing, so it degrades rather than breaks. Positioning is `sticky`, not `fixed`.

  New string key **`bottomNavLabel`** (`"Main"` / `"Principal"`) in `AureaStrings`. Anyone passing
  a complete custom dictionary must add it; `defaultStrings` and `ptBR` already carry it.

### Changed — 20/08/2026

- **`BottomNav` was rebuilt on two independent axes, and the four old variant names are now
  deprecated aliases.** A UI/UX audit of the component found the problem was structural, not
  cosmetic: `flat`, `surface`, `pill` and `dock` did not derive from one grammar — each said
  "this is the current page" in a different visual language, and two of them hid labels.

  The axes: **`variant`** says where the bar sits (`floating` | `edge`), and **`indicator`** says
  what shape marks the current item (`none` | `subtle` | `pill` | `circle` | `circle-raised` |
  `circle-bold` | `circle-outline`). The meaning never changes with the shape — current is always
  the brand gold. Everything else is shared: touch target, icon frame, typography, badge
  anchoring, safe area.

  **Every item now keeps its label, in every indicator.** `pill` used to hide the inactive ones
  and `dock` hid all of them; icon-only navigation only works when the symbols are unmistakable.

  **The measurements are researched, not invented:** the icon frame is `2rem` (32px), which is
  the Material 3 active-indicator height over a 24dp icon; the gap from icon to label is 4px,
  M3's own; the `circle-bold` circle is `3.5rem` (56px), M3 Expressive's expanded indicator. The
  touch target stays on the item (`--control-h-lg`), against Apple's 44pt minimum.

  **The bar no longer paints a hover background.** It is phone chrome; a finger has no hover, and
  the grey shape it drew was the same shape the `subtle` indicator uses for "you are here".
  `:focus-visible` is untouched — that one is access, not decoration.

  `variant="flat" | "surface" | "pill" | "dock"` still work and map onto the pair.

- **The `AppShell` sidebar becomes a drawer below `lg` (1024px), not below `md` (768px).** Between
  768 and 1023 the fixed column used to squeeze the content instead of getting out of the way.
  The mechanism is unchanged — the same native popover, no new prop, no new component.

- **A floating sidebar no longer loses 32px to its own margins.** `--sidebar-width` names the
  PANEL; the shell's grid track now adds the two `--space-4` margins when the panel floats, and
  uses the raw token when it is flush. A 264px panel rendered 232px, and a 68px rail rendered
  36px — at 36px the card radius closes on both ends and the panel becomes a capsule.

- **`Tooltip` passes the child's own `id` through to the engine.** A trigger that already had an
  `id` diverged from the one Base UI registered, and the tooltip opened and closed in the same
  microtask. No public API changed.
---

## [0.3.0] — 2026-08-17

Everything below landed after `0.2.0` shipped to npm on 2026-08-12: **11 new components**
(`AccessGate`, `BlockEditor`, `Carousel`, `CommandPalette`, `ConfirmDialog`, `DataState`, `Form`,
`Gallery`, `Image`, `Prose`, `SortableList`), two new APIs that are not components
(`useAureaTheme()` and `screenStateToParams` / `screenStateFromParams`), a third token target
(`@aurea-uds/tokens/native`), and **three breaking changes**, each with its note below.

The change with the widest reach is not a component: **22 pieces of pure markup now render on the
server**, from the barrel and from the category subpaths alike. If you render for SEO, that is
weight you stop shipping without touching a line of your code.

Counts were measured against the published surface, not typed — see
[How this was measured](#how-this-was-measured) in the `0.2.0` section for the commands.

### Added

#### `BlockEditor` — the frame around content blocks, and nothing inside them

An editorial portal builds an article out of blocks — a heading, a paragraph, an image with a
caption — and today writes that scaffolding by hand, once per block type. `BlockEditor` is that
scaffolding: order (by dragging **and** by keyboard), a handle, an optional remove button, and the
slot where **your** editor goes.

**Aurea does not own the rich text, and that is the decision, not an omission.** There is no bold,
no italic, no bubble menu, no formatting toolbar. [ADR-0025](decisions/0025-editor-por-blocos-sem-motor.md)
has the four measurements behind it; the one that closed the door is security. A browser does not
sanitize pasted HTML, so whoever owns the editing surface owns the paste XSS — which is why
ProseMirror and Lexical both treat `contenteditable` as a render target and never as the source of
truth. Aurea cannot decide what is safe to render inside your domain.

**No new dependency.** Kibo's editor is TipTap 3.6.6 over ProseMirror with 17 dependencies, and 18
of its 39 exports are table controls — it is a single-document editor, not a block list, so the
anatomy this item needed was not in the reference the item itself pointed at. That is recorded
rather than quietly worked around.

Blocks are controlled — `blocks` plus `onReorder(from, to)` and an optional `onRemove(index)`.
Leave `onRemove` off and no remove button is rendered, because a button that cannot act is a focus
target that lies to whoever uses a keyboard. There is deliberately no insert affordance: adding a
block is appending to your own collection, and the reorder here carries it anywhere.

The keyboard protocol is the same one `SortableList` ships, and it is now literally the same code:
it was extracted into a shared `useReorder` when this component became its second owner. The DOM of
`SortableList` did not change — the pixel gate and the skin spec are what prove that.

#### `SortableList` — dragging, and the keyboard that lets it ship

The lock on this one is accessibility, not engineering: dragging needs a way that is not dragging,
the precedent set by the visual builder. So the keyboard path is not an extra here — it is the
reason the component may exist. **Space** picks an item up, **arrows** move it, **Space** drops it,
**Escape** puts it back where it started, and every step is announced in a polite live region.
Three things only show up once you build it: focus has to *follow* the item across its move or the
next arrow key moves its neighbour; arrows must do nothing while nothing is picked up, or the
component hijacks ordinary navigation; and without the announcements someone who cannot see the
list gets no confirmation at all.

**No new dependency.** Kibo's list and kanban are both `@dnd-kit/core`, and adopting it would make
every consumer download it. Pointer events cover mouse, touch and pen in the same code — and that
choice is measured, not stylistic: HTML5 drag and drop fires on **no** touch device, which would
have left phones unable to reorder at all. The `touch-action: none` on the handle is the mandatory
other half of pointer capture; without it the browser scrolls the page instead of letting you drag,
and the skin spec asserts it.

The list is controlled — `items` plus `onReorder(from, to)` — and the keyboard and the pointer call
the same callback, so there is never more than one source of truth about the order.

#### `Prose` — the skin for long-form text, and not one line of parser

Measured first: the core had **no rule at all** for `h1`–`h6`, `blockquote`, `pre`, `code` or
`figcaption`, and the document body is 14px — interface size, not reading size. A CMS-rendered
article arrived unstyled.

`Prose` is one `<div>`; everything else is CSS. Bring your own Markdown renderer, because the
parser is yours and always was. Body text moves to `--text-base` with `--leading-relaxed` (a token
that existed and had no use anywhere), and the column stops growing at `--prose-measure`, 68ch by
default — a line you lose your place in is not a line.

**Every rule is scoped under `.prose`, and that is now a test rather than a promise.** This
repository has paid for the alternative once: five element-level table rules applied to every
`<table>` in the document, and the calendar was born 720px wide because of them, with no gate
seeing it — checks 15 and 18 compare classes, and an element selector has none. The skin spec now
renders a `<table>`, a `<blockquote>` and an `<h2>` as *siblings* of the prose and asserts they
stay exactly as the browser left them.

The prose table is deliberately not the data table: no 720px minimum, no uppercase header band, no
row hover. A three-column table inside an article is not a grid.

The typeface does **not** change. `--font-editorial` (IBM Plex Serif) ships and stays unused here:
serif body text is an appearance decision, and those go to the design system's owner with a before
and after, never into a component by default. Point `font-family` at the token if you want it.

`Prose` accepts `dangerouslySetInnerHTML` because it is a div and that is how CMS HTML arrives —
**sanitise it first.** Aurea styles the text; it cannot decide what is safe to render.

#### `Gallery` — what was a block became a part

The gallery already existed inside the `MediaLibrary` block, which is an archetype demo, not a
part: anyone who wanted it copied the block. This is the extraction, and it carries three measured
decisions out with it — the tile is a `<button>` (the core's `.card-interactive` has cursor and
hover and **no focus**, so a div with a pointer cursor never receives Tab), the chosen tile is
marked with `aria-current`, and the selection lives with the consumer, because library, detail and
player share one constant.

**Enlarging opens the `Dialog` this library already has** — focus trap, Escape and backdrop
included. No second floating surface was born for it, and the enlarged photo uses `fit="contain"`,
because cropping the picture someone asked to *see* is the opposite of the request.

Two defects the measurement caught and the tests now hold shut: a caption repeating the alt text
made screen readers announce it twice (`image-redundant-alt`), so a captioned thumbnail is
decorative inside the tile and the real alt names the enlarged image instead; and the selected
tile lost its capsule because `.gallery-tile` and `.is-selected` have equal specificity and ours
came later in the file — fixed by only clearing the background of tiles that are *not* selected,
rather than writing a second copy of the shared "selected" language.

A tile with nothing to do is not a button: without `onSelect` and without `zoom` the tiles render
as content, because an inert `<button>` is a focus stop that lies to anyone on a keyboard.

#### `Image` — the box is reserved before the bytes arrive

Layout shift, not convenience. The core already carried the lesson in the `--media-ar` comment: a
player with `preload=none` measures zero until the media arrives and the page jumps when it does.
Same physics for any content image.

`ratio="16/9"` reserves the box. Leave it off when you pass `width` and `height` and the browser
already knows — **and that case is why this component nearly shipped broken.** The first version
declared `aspect-ratio: var(--image-ratio, auto)` in the core, and the `auto` fallback overrides the
`auto <width> / <height>` the browser derives from the attributes: measured in a 400px box, an image
with `width={300} height={200}` and no `ratio` came out **400×0**. The rule written to prevent the
jump was producing it. The ratio now goes inline and only when it exists; there are assertions in
the skin spec and the unit tests against its return.

A broken `src` falls back to a box that keeps the same reserved space, the same surface and the
`alt` text under `role="img"` — closing the defect class the `Avatar` was measured with in July,
where a broken source showed the browser's torn-image glyph and threw the alt text away.

The loading marker has no state: the reserved box is painted in `--surface-3`, the same surface as
`.skeleton`, and the bitmap covers it. `render` swaps the `<img>` for your framework's optimised
one — ours keeps the skin and the box, yours keeps the CDN and the `srcset`.

#### `Carousel` — the scroll container is the engine

Four references, one engine: shadcn (all four bases), Untitled UI, Kibo and Activepieces all wrap
`embla-carousel`. Base UI has no carousel — measured: 46 modules, none of them one. Buying a
carousel engine for something the browser already does was not worth a new dependency, so this is a
native scroll container with `scroll-snap`: touch dragging with inertia, wheel, keyboard and the
snap itself all come from the platform. React only works out **which slide you are on**, which is
what lights the dot and disables the arrow at the end.

The CSS-only route was researched and rejected on dates, not taste: `::scroll-button()` and
`::scroll-marker()` are not Baseline — Chromium has them, Safari 26.6 was still landing and Firefox
is in development. A design system cannot ship a control that works in one browser.

**One component, not seven parts.** Each child is wrapped for you, so `role="group"`,
`aria-roledescription="slide"` and the label *"Slide 3 of 8"* are never the consumer's to maintain.
Props are `label`, `controls` and `indicators` — nothing else.

**How many slides show at once is CSS, not a prop:** `--carousel-slide` (default `100%`). That is
the references' `multiple` case with no API at all, in the same idiom as `--qr-size` and `--media-h`.

Two accessibility details that came from measuring rather than from any reference: the track is
`tabIndex={0}`, because scrollable content has to be reachable by keyboard (axe's
`scrollable-region-focusable`), and each dot is a **24×24** target with an 8px mark drawn in
`::before` — a row of 8px dots fails WCAG 2.2 AA (2.5.8).

Five new strings (`carouselLabel`, `carouselSlide`, `carouselOf`, `carouselPrev`, `carouselNext`).
No loop, no autoplay, no mouse-drag, no vertical axis — all declared limits, none of them measured
as needed by a real consumer.

#### `ConfirmDialog` — the decision that cannot be taken by accident

A `Dialog` closes when you click outside it. On a "this deletes it" that click becomes **"I
cancelled"** without anyone having decided, and the user never learns they answered. `ConfirmDialog`
is `role="alertdialog"`: measured in `@base-ui/react@1.6.0`, its root type is
`Omit<DialogRoot.Props, 'modal' | 'disablePointerDismissal' | …>` — the two props that would let a
click outside close it **do not exist**. It is a different role, not a configured `Dialog`.

Focus opens on the **safe** button, so a reflex Enter cancels. Two things guarantee it and both were
measured one at a time: DOM order (cancel comes first) and `initialFocus` — which earns its place by
holding the focus even when the two buttons are swapped, the kind of visual change someone makes
without thinking about the keyboard.

Eight props, not the nine composed parts of the references: `open`, `title`, `description`,
`confirmLabel`, `cancelLabel`, `destructive`, `onConfirm`, `onCancel`. `description` is a prop rather
than children because it is the node behind `aria-describedby` — only what goes through it is
announced.

Two new strings, `confirmCancel` and `confirmProceed`. No new surface in the core: it reuses
`.dialog` and adds `.dialog-confirm` for width and footer.

#### `CommandPalette` — the palette with the engine wired up

`CommandPaletteShell` stays exactly as it was, for anyone composing their own chrome; this is the
pair with the engine, following the `MediaPlayer`/`MediaPlayerShell` precedent already in the
library. Commands are **data** (`{id, label, icon?, kbd?, run}`), never children — a list kept as
children drifts out of sync with the filter.

Closing happens **before** the command runs, so a command that navigates does not leave the palette
floating over the new screen.

**No new dependency.** The market answer is `cmdk`, which is what shadcn wraps — but
`@base-ui/react` has `autocomplete`, and its `Input`, `List`, `Popup`, `Empty` and `Collection` are
literally the same modules `Combobox` already uses here. A second filtered-list engine was not worth
buying.

**Known limit, declared rather than hidden:** v1 does not group. `Autocomplete.Root` does not take
the grouped shape `Combobox.Root` takes, and giving each group its own slice of items overrides the
engine's filter — typing "the" returned all three commands. Between grouping and filtering,
filtering is the point of a palette.

#### `Form` — shows the error, does not decide what an error is

`errors`, keyed by the field's `name`, and `onSubmit` with the collected values. Aurea validates
nothing: no schema, no rules, no resolver, no field state. Validate wherever suits you — a schema on
the client, a server action, the API's answer — and hand the result over.

**No form library became a dependency, and none was needed.** The market pattern is
`react-hook-form` + `zod`, which is exactly what shadcn's `form.tsx` exists to wrap — but marrying
it would force every project using Aurea to adopt it, including those already validating another
way. Meanwhile `@base-ui/react`, the engine Aurea has paid for since Phase 2, already types its
`Form.errors` as *"validation errors returned externally, typically after submission by a server or
a form action"*. The split was already the engine's.

`Field` gains an optional `name`. With it, the child becomes the form's control and receives
`aria-invalid` and the message id; without it, `Field` behaves exactly as before — the addition is
additive on purpose, because that component's semantics were paid for with an audit (`AUD-0001`).

#### `screenStateToParams` / `screenStateFromParams` — the URL format, beyond the grid

`gridStateToParams` covered one component. A real screen carries more that a link should keep: which
tab is open, which view mode, which item is in detail. Without a shared format each consumer invents
one per screen, and two screens of the same product end up with different URL vocabularies. Three
short keys join the grid's five: `tab`, `view`, `detail`.

**These do not manage the URL, and never will.** Managing means touching history, and the choice
between `push` and `replace` belongs to the consumer — registered here since F4, and getting it
wrong fills the back button with one entry per keystroke in a filter. If you want a manager,
[`nuqs`](https://nuqs.dev) is the one the market settled on. What lives here is the *format*, which
is what `nuqs` has no opinion about.

They import nothing, touch no `window`, and live in the module without the `"use client"` directive,
because they are called where the URL arrives — which on a server-components framework is the
server.

#### `useAureaTheme()` — the two axes Aurea puts on `<html>`, readable from React

Until now the theme lived only in `window.Aurea.setTheme`, which is vanilla: in React there was no
way to know the current theme without reaching into the DOM, so a theme button could not tell which
icon to draw. The hook returns `{theme, density, setTheme, setDensity, toggleTheme}`.

It reads the DOM through `useSyncExternalStore` instead of holding state, so whoever actually
changes the attribute is followed — a script in the `<head>`, `window.Aurea`, or a theme library.
`theme` is `null` while unknown, including on the server, because pretending to know it is what
produces a hydration mismatch.

**It persists nothing, on purpose.** Remembering a preference is the application's job.
[`next-themes`](https://github.com/pacocoursey/next-themes) already does persistence, system
preference, cross-tab sync and the no-flash inline script, and it writes `data-theme` on `<html>` —
the same attribute Aurea reads, so they compose with no glue at all. What no theme library covers is
**density**, and that is what this hook is really for.

#### `DataState` — one region, four faces, and the fourth is the one everyone gets wrong

`loading`, `error` and `empty` replace the content. Every universal state — `stale`, `partial`,
`degraded`, `offline`, `waiting_*` — **does not**: the content stays on screen and the notice goes
above it. Showing old data without saying so is worse than showing none, and hiding what the reader
already had because it went stale takes away information they were using. Same decision `DataGrid`
already took, promoted to a component.

While loading, the region carries `aria-busy="true"` — what tells assistive technology to wait
instead of announcing half an update. `Skeleton` is already `aria-hidden`, so what speaks is the
region, not the rectangles. Every market source found on this pattern leaves that out.

`children` may be a function: in the loading face it is never called, so an expensive tree is not
rendered before its data exists. Aurea holds no data engine — no retry, no invalidate, nothing with
`query` in the name; you pass the state you already resolved.

#### `AccessGate` — hide the action, or show it inert with the reason

Aurea holds no rules, roles or policies: you pass `allowed` as an answer you already computed. What
the component carries is the choice people get wrong — `mode="hide"` removes the action (what
`@casl/react` does, and the right default when it would mean nothing to this user), `mode="disable"`
keeps it visible and inert (what `react-admin` lets you pick, and the right call when they should
know it exists). In disable mode `reason` is **required by the type**: an action that says no
without saying why is worse than one that is simply absent.

**It is not security.** Hiding a button stops nobody from calling the API — the server is what
refuses. This only avoids offering what would be refused.

#### `aria-disabled` on `Button` now means inert, not just announced — ⚠ behaviour change

Passing `aria-disabled` used to reach the DOM and nothing else: the button announced itself as
disabled to a screen reader **and still ran its `onClick`**. It now blocks activation, which is the
same fix `AUD-0004` already applied to the link branch — the `<button>` had been left out.

If you were passing `aria-disabled` as decoration and relying on the click, the click stops. That is
the point: a control cannot say "disabled" and act.

Why it matters, measured on 2026-08-13: `disabled` removes the control from the tab order, so a
`Tooltip` explaining **why** an action is unavailable is never read by anyone using a keyboard — and
the `<span>` wrapper other libraries document fixes the pointer, not the keyboard (the span arrives
at `tabIndex -1`). `aria-disabled` keeps the control reachable, so the explanation reaches too. The
core's 12 `:hover:not(:disabled)` rules now exclude `[aria-disabled="true"]` as well, so an inert
button no longer lights up under the pointer.

The component that picks between the two ways is `AccessGate`, above — [ADR-0023](decisions/0023-o-portao-de-permissao-e-componente.md).

#### `@aurea-uds/tokens/native` — the same identity, in the shape React Native reads

A third target next to `/css` and `/json`: a JavaScript module of plain objects, in **dp** and
without a cascade, generated from the same DTCG file. Nothing is retyped by hand, and a gate fails
if the native target falls behind the CSS one.

The value that decided its shape is **colour**, and it was measured on the parser rather than
assumed ([ADR-0027](decisions/0027-a-cor-no-alvo-nativo.md)): React Native's `StyleSheet` refuses a
wide-gamut colour written as a string, so **hex is the only living path** — verified against
versions 0.81.5 and 0.87.0. Twenty of the 95 `oklch` values fall outside sRGB, and the brand yellow
shifts by ΔEok 0.0225 when clipped — right at the edge of perceptible, and only on a wide-gamut
screen, because in sRGB the browser clips it the same way (95 of 95, max 1/255 apart).

There is no native component library yet, and this subpath does not promise one.

### Changed

#### Pure markup renders on the **server**, from the barrel *and* from the category subpath

Twenty-two components do nothing that needs a browser — `Card` is a `<div>` with a class. They used
to arrive as client references anyway, because a `"use client"` directive contaminates the whole
module and everything in its import closure. Measured before deciding: importing `Card` pulled in
**9 modules and 118.5 KB**; `Prose`, also a `<div>`, cost 123.5 KB. The proof it was avoidable was
already in the package — `Accordion`, the same kind of component in a file that never had the
directive, cost **0.3 KB**.

Those 22 now live in a module with no directive ([ADR-0026](decisions/0026-marcacao-pura-e-de-servidor.md)),
so from `@aurea-uds/react` they render on the server and ship no JavaScript.

**And since 2026-08-17 that holds for `@aurea-uds/react/<category>` too.** Each category module is
now a directive-free showcase that re-exports the client half from a sibling; the public surface is
unchanged — the same 20 subpaths, the same names, the same exports, and nothing for you to edit.
Measured in a real RSC bundler (Next 16 + Turbopack): with the directive back in place the payload
carries a client reference, without it the same component arrives as markup.

**Nothing to do on your side.** If you render on the server for SEO, you stop paying for the parts
that never needed the browser — whichever import path you use.

#### Masking a field: `Input.formatOnBlur`, and `NumberField.format` / `locale` / `name`

No mask component, and the reason is researched rather than preferred. Three independent
measurements say the same thing: the **USWDS** ships its input mask with a recorded **WCAG 2.1 AA
failure** ("recovering from an error is difficult due to lack of feedback"); **MUI dropped** masked
date fields in v6 because the text "leaks to the previous sections" while you edit — their repo
still carries a video named `masked-input-bad-ux.mp4`; and a live mask makes a screen reader
announce what was typed while the field shows what the mask allowed.

So Aurea ships the **moment**, not the format. `Input.formatOnBlur` normalises the value after
focus leaves — type and paste freely, and the field tidies up when you go. The format stays yours,
because plates and document numbers are country rules, not design-system knowledge.

Money needed no component at all: `NumberField` now forwards `format` (`Intl.NumberFormatOptions`),
`locale` and `name` to the engine, which formats **on blur** through the platform's `Intl`. That
replaces the currency library a consumer would otherwise install for this alone. The wrapper had
simply never passed the option through — the engine has supported it all along.

Both halves keep the value where it belongs: the formatted text **is** the input's own value, and
with `name` the number field renders a hidden input carrying the raw number, so a form submits
`1234.5` and never `R$ 1.234,50`.

### Fixed

#### A text link in the light theme failed WCAG AA, and had since the beginning

`a { color: var(--primary) }` puts the brand yellow on light surfaces at **1.68:1**, against the
4.5:1 that AA requires — measured on the generated page, not estimated. It had been latent forever:
no catalogue page had a link in running text until `Prose` arrived, and every componentised link
(`.btn-link`, the sidebar, the table of contents) already sets its own colour. The fix is not a new
decision — the formula, the theme guard and the reasoning were already written in this stylesheet
for `.btn-link-primary`: deepen the yellow with `--foreground`. It now measures **6.92:1**.

Scoped to `a:not([class])` on purpose, so it reaches exactly the link content writes and cannot
override a component that already solved its own colour. The pixel gate confirms it: **22 of 22
captures unchanged**.

Accessibility fixes from an external audit (SENTINELA cycle 1, 2026-08-12). Three of them change
public types, so they are listed as breaking even though every one of them fixes a control that was
unusable with a screen reader.

### ⚠ Breaking changes

#### 1. `Field` no longer renders a `<label>` wrapper, and `hint`/`error` left the name

At `0.2.0`, `Field` wrapped everything in one `<label>` — including `hint` and `error`. The
accessible name of `<Field label="E-mail" hint="We use it to sign in" error="Invalid address">` was
therefore **`"E-mail We use it to sign in Invalid address"`**, all three glued together, and the
description repeated what the name already said. Wrapping also produced `<label>` inside `<label>`
— invalid HTML — for `Switch`, `Checkbox` and `Radio`, which bring their own.

The wrapper is now a `<div class="field">`, and `Field` takes one of two shapes depending on the
child: a real `<label for>` when the child is a single labelable native element or a documented
Aurea control that forwards the association, or `role="group"` with `aria-labelledby` otherwise.
Arbitrary component wrappers are groups; assuming they forward `id` would recreate a label with no
target. A child already named by `label`, `aria-label` or `aria-labelledby` also stays inside a
named group instead of receiving a second label. `hint` and `error` are always description only,
via `aria-describedby`, and `error` also sets `aria-invalid` on the control.

**What breaks:** the `htmlFor` prop is gone from `FieldProps` (it had no effect once the wrapper
stopped being a `<label>`), the props type is now based on `HTMLAttributes<HTMLDivElement>`, and a
CSS selector written as `label.field` no longer matches. `id` now means *the id of the control*,
which is what `htmlFor` points at.

```diff
- <Field label="Quality">
-   <div className="row"><Range /><Input type="number" /></div>
- </Field>
+ <Field label="Quality">
+   <div className="row">
+     <Range aria-label="Quality" />
+     <Input type="number" aria-label="Quality, exact value" />
+   </div>
+ </Field>
```

A layout wrapper as the child makes `Field` a named group, and each control inside then needs its
own name — one label cannot name two controls.

#### 2. `Toggle` requires a name, and the type now enforces it

`ToggleProps` was an interface with `label?: string`, so `<Toggle icon="checkmark" />` compiled and
rendered a focusable button with no text, no `aria-label` and no accessible name at all. It is now a
union: either a non-boolean/non-nullish `children` value or `label` is required. A runtime guard also
catches blank labels, empty strings, arrays, Fragments and decorative-only elements, which the
type system cannot express as empty, and reports the same error for JavaScript consumers.

```diff
- <Toggle icon="checkmark" />
+ <Toggle icon="checkmark" label="Mark as done" />
```

#### 3. `Combobox` and `MultiCombobox` accept `aria-describedby` and `aria-invalid`

Additive in practice, but it is the counterpart of the `Field` change: both components destructure a
fixed prop list, so anything `Field` injected was dropped in silence and the input never received the
error state. They now forward both to the input, which is the focal node.

### Fixed

- **`Button`/`IconButton` with `href`**: a disabled or loading link kept the consumer's `onClick` and
  still ran the action on click. `<a>` has no `disabled`, so the component now suppresses activation.
  Enabled links are unaffected.
- **`MediaPlayer` in `kind="audio"`**: `onClick` was destructured out to be composed with play/pause
  in video mode and never re-attached for audio, so the callback the type promises silently vanished.
- **`FileInput` lost records after restoring a queue.** New ids always started from `f0`, and ids in
  `initialQueue` come from you — so restoring `f0` and then adding a file gave both the same id.
  Removing the new one removed the restored one too, `patch` updated both, and React warned about
  duplicate keys. New ids now skip everything already in use, including ids outside the `f<n>` shape.
- **`FileInput` items restored in an active state were inert.** `pending`, `uploading` and `paused`
  are normalised to `canceled` on restore: without the bytes the item is neither uploading nor able
  to, and it used to show Pause/Resume/Cancel buttons that did nothing while counting as in-flight,
  which held the receipt back indefinitely. If you persist the queue, expect an interrupted upload to
  come back as `canceled` rather than as whatever it was when the page closed.
- **`FileInput` leaked object URLs when a preview was replaced.** Only the remove path revoked; the
  single-file swap and the conflict "Replace" did not, so repeatedly replacing an image accumulated
  blobs in memory with one visible. Revocation moved to the one place every list change passes
  through, so all three paths are covered.
- **Package entry points now match the published surface.** `@aurea-uds/react/agents` was emitted
  but blocked by the exports map; it now resolves like every lightweight category. Calendar, Chart
  and DependencyGraph remain explicit optional-engine subpaths, and the README lists all six such
  modules instead of promising they are available from the barrel.
- **`@aurea-uds/tokens/css` now declares its CSS subpath to TypeScript.** The generated declaration
  ships with the CSS, so a bundler-mode consumer can resolve a tokens-only import without TS2882.
- **Validation and documentation drift are now gated.** The private-name scan prunes ignored trees
  before descending; current docs no longer advertise removed paths, closed debt or stale module
  counts; the distribution contract matches all public packages; and all eight version declarations
  must agree.
- **Catalog behavior now runs outside the Chromium-only pixel spec.** Breadcrumb, active navigation,
  sidebar icons and Preview/Code tabs moved to the cross-engine sweep, so Firefox/WebKit projects no
  longer skip behavior merely because its former file also contained screenshots.
- **A toast's `type` painted nothing.** `AureaToastType` has offered `info`, `success`, `warning`
  and `danger` from the start, and the viewport emitted `toast-<type>` — but the four rules did not
  exist in the stylesheet, so all four looked identical. They now use the same treatment `Alert` and
  `Banner` already use: a tinted border and the matching semantic background. No new value, no new
  token. If you were passing `type` and seeing no difference, that was this.
- **`DataList` pushed the page sideways on a narrow screen.** The term column was `max-content`,
  which never shrinks, so a long term dragged the whole document past the viewport — 179px of
  horizontal scroll at 320px, on a component published since `0.1.0`. The column can now shrink, and
  below 640px the list stacks into one column. Nothing moved on wide screens: the pixel baselines
  are unchanged.

---

## [0.2.0] — 2026-08-12

Everything below landed after `0.1.0` shipped to npm on 2026-07-31.
It is a large release: **27 new components**, **70 new exported names**, **39 new props** on
components that already existed — and **nothing was removed from the JavaScript API**.

**This shipped as `0.2.0`, not `1.0`.** Five breaking changes belong in a `0.x` minor, where
`^0.1.0` does not pick them up and updating stays a deliberate act with these notes in front of it.
The reasoning — including why holding them back was circular — is in
[ADR-0020](decisions/0020-a-proxima-versao-e-0-2-0-nao-1-0.md).

> **The headline, if you read one line:** the package now works in React Server Components. At
> `0.1.0` a single `import { Button } from "@aurea-uds/react"` inside a server component crashed
> the render, because no module carried the `"use client"` directive while the barrel re-exported
> React context. That is fixed, and there is a gate so it stays fixed.

### ⚠ Breaking changes

Five, and only one of them touches a TypeScript signature you are likely to be using.

#### 1. The core stylesheet no longer styles bare `<table>` elements

At `0.1.0`, `@aurea-uds/core/css` shipped five **unclassed** rules — `table`, `th`, `td`,
`tr:last-child td` and `tbody tr:hover`. They reached **every `<table>` in your document**, not
just Aurea's. A table you wrote yourself inherited our data-table look: the grey header band, the
uppercase heading, the letter-spacing, and `min-width: 720px`.

They are now scoped to `.table, .table-wrap table`. Unclassed element rules in the core went from
**14 to 9** (`a`, `body`, `button`, `html`, `img`, `input`, `select`, `svg`, `textarea` remain, and
those are the deliberate reset).

**What breaks:** a plain `<table>` of yours stops being styled by us. If you were relying on that
leak, add the class:

```diff
- <table>
+ <table class="table">
```

Aurea's own `Table` and `DataGrid` are unaffected — they always emitted `.table` and `.table-wrap`.
The pixel gate confirmed it: **zero change across every baseline** when the rules were scoped, which
is the proof that the rules only ever reached markup that already wanted them.

#### 2. `Avatar.size` is a scale, not a number — and the default is 4px smaller
**`InputGroupAddon.align` foi decomposto em `side` + `layout`.** O enum de quatro valores achatava
duas dimensões independentes — ordem lógica (`start`/`end`) e geometria (`inline`/`block`) — e
resolvia a ordem por `order:` no CSS. Como `order` reordena o desenho e não o documento, um adorno
com conteúdo focável podia aparecer antes do controle e ser tabulado depois: **WCAG 2.4.3, nível
A**. A correção é estrutural, não cosmética — `side` decide a posição no DOM (o `InputGroup`
coloca os filhos) e `layout` decide só a geometria. Ver a
[ADR-0048](decisions/0048-ordem-estrutural-e-geometria-sao-eixos-separados.md) e o `G-A11Y-06`.

A migração é mecânica, e um codemod a aplicou em todos os consumidores do repositório:

```diff
- <InputGroupAddon align="inline-start">…</InputGroupAddon>
+ <InputGroupAddon side="start" layout="inline">…</InputGroupAddon>
- <InputGroupAddon align="inline-end">…</InputGroupAddon>
+ <InputGroupAddon side="end" layout="inline">…</InputGroupAddon>
- <InputGroupAddon align="block-start">…</InputGroupAddon>
+ <InputGroupAddon side="start" layout="block">…</InputGroupAddon>
- <InputGroupAddon align="block-end">…</InputGroupAddon>
+ <InputGroupAddon side="end" layout="block">…</InputGroupAddon>
```

**`layout` aceita valor responsivo; `side` não, e é decisão.** Geometria pode mudar com o espaço;
sequência lógica é outra coisa. Se um dia houver caso medido para `side` responsivo, ele passa por
análise própria e por uma implementação que mude a estrutura real.

**Duas mudanças de comportamento acompanham, no `InputGroup`:** ele agora **ordena os próprios
filhos** por `side` (a ordem dentro de cada lado é preservada), e a quebra de linha deixou de vir
de `:has()` — o grupo sempre pode quebrar, e quem quebra é o adorno de largura total. Quem
dependia de o grupo nunca quebrar com adornos em linha continua servido: o controle passou a ter
base zero (`flex:1 1 0`) e encolhe em vez de empurrar.

---

**`InputGroupAddon.align` passou a usar os quatro valores lógicos.** Os dois de antes chamavam-se
`start` e `end` e queriam dizer, em segredo, `inline-start` e `inline-end`.

```diff
- <InputGroupAddon align="start">…</InputGroupAddon>
+ <InputGroupAddon align="inline-start">…</InputGroupAddon>
- <InputGroupAddon align="end">…</InputGroupAddon>
+ <InputGroupAddon align="inline-end">…</InputGroupAddon>
```

Por quê: com `block-start` e `block-end` entrando, manter os nomes curtos produziria o conjunto
`start | end | block-start | block-end`, em que dois valores declaram o eixo e dois o escondem — a
mesma doença do `ButtonVariant` que acabou de ser curada. E a Aurea escreve propriedade lógica em
todo o CSS; o nome do valor acompanha.

**`Avatar.size` e `AvatarGroup.size` deixaram de ser número.** Agora é a escala `sm | md | lg`,
com `md` como default.

```diff
- <Avatar fallback="VM" size={48} />
+ <Avatar fallback="VM" size="lg" />
```

`size?: number` became `size?: "sm" | "md" | "lg"`, defaulting to `"md"`.

**Why:** the number became an inline `style`, and inline wins over CSS — the `36px` the core
declared died, and anyone wanting another size wrote a raw pixel value that density never reached.
The scale reuses `--control-h-*`, so an avatar next to a same-sized button now aligns by
construction. Equivalences: `sm` = `--control-h-sm`, `md` = `--control-h-md`,
`lg` = `--control-h-lg`.

**Read this even if you never passed `size`:** the old default prop was `size={40}`, which rendered
a 40px avatar via inline style. The new default `"md"` renders `--control-h-md`, which is
`2.25rem` = **36px** at `comfortable` density. **A default `<Avatar />` gets 4px smaller.** In
`compact` and `spacious` it now follows density, which is the point. Vanilla consumers styling
`.avatar` directly see no change — the 36px is what the core always declared.

`AvatarGroup` also takes the scale, but it is **new in this release** and never shipped with a
numeric `size`, so there is nothing to migrate there.

#### 3. `QRCode.size` is a scale, not a number
**`Input.size`, `Select.size` e `SearchField.size` deixaram de ser o atributo HTML.** Agora são
a escala `sm | md | lg` do sistema, com `md` como default — a mesma escala do `Button`, do
`Avatar` e do `QRCode`. `Textarea` e `Combobox` ganharam a prop, e ali não havia atributo nativo
para tirar.

```diff
- <Input size={30} />
+ <Input style={{width: "30ch"}} />     {/* largura é CSS */}
+ <Input size="sm" />                   {/* degrau do sistema */}
```

Por quê: `size` no HTML é **número** — largura em caracteres no `<input>`, linhas visíveis no
`<select>` — e ninguém dimensiona campo assim há vinte anos; largura é CSS. Enquanto isso, cinco
fichas do registry anunciavam `sizes: ["sm","md","lg"]` e a capacidade **não existia**:
`.input,.textarea,.select` fixavam `--control-h-md` e não havia modificador nenhum. O nome
estava ocupado pelo atributo errado.

Medido em 21/08/2026 antes de trocar: **nenhum consumidor deste repositório** passava `size` a
estes cinco. A `<select size>` para lista de múltiplas linhas continua possível pelo `multiple`,
que é o caminho semântico.

Equivalências: `sm` = `--control-h-sm`, `md` = `--control-h-md`, `lg` = `--control-h-lg` — os
mesmos degraus do botão, de propósito: um campo `sm` e um botão `sm` na mesma linha medem igual
nas três densidades. `Textarea` é a exceção justificada e não recebe altura: o corpo dele é o
conteúdo, então o que escala é a caixa mínima.

**`QRCode.size` deixou de ser número.** Agora é `sm | md | lg` — `7.5rem`, `10rem` e `15rem`,
com a quiet zone incluída na medida. `md` são os `160px` de antes.

```diff
- <QRCode value="https://example.dev" size={160} />
+ <QRCode value="https://example.dev" />
- <QRCode value="https://example.dev" size={240} />
+ <QRCode value="https://example.dev" size="lg" />
```

`sm | md | lg` = `7.5rem`, `10rem`, `15rem`, quiet zone included in the measure. **`md` is the same
160px as before**, so the default renders identically.

QR size is a real rendering measure — a QR too small does not scan — so there is an **escape
valve**. Override `--qr-size` in CSS, the same path already documented for `--qr-module` and
`--qr-quiet`:

```css
.my-poster-qr { --qr-size: 28rem; }
```

#### 4. `SegmentedControl` is a `radiogroup`, not a group of toggle buttons

The props did not change — `items`, `value`, `onChange` and `label` are the same. What changed is
what it emits, and why: a single choice among a few options is a radio group, while `aria-pressed`
on several buttons describes independent toggles. Finding M20, decided in
[ADR-0016](decisions/0016-segmented-control-e-radiogroup.md).
- **O menu deixou de ter uma forma só de item.** Os três menus da Aurea (`DropdownMenu`,
  `ContextMenu`, `Menubar`) recebiam `items: Array<{label, onClick?, disabled?, leadingIcon?}>`, e
  essa forma fechada não expressava nada do que um menu real tem. Um menu "Ver" comum — item que
  alterna, opções mutuamente exclusivas, seção rotulada — era **impossível de escrever**, embora o
  motor por baixo servisse as cinco peças.

  `MenuEntry` é agora uma **união discriminada** por `kind`:

  | `kind` | o que é |
  |---|---|
  | *(omitido)* | item de ação — **a forma de sempre** |
  | `"link"` | um `<a href>` de verdade |
  | `"checkbox"` | item que alterna (`checked`/`defaultChecked`/`onCheckedChange`) |
  | `"radiogroup"` | opções mutuamente exclusivas, com rótulo de grupo |
  | `"submenu"` | submenu, que aninha a mesma união |
  | `"group"` | seção rotulada (o rótulo **não** é um item) |

  **Não há quebra:** `kind` é opcional no item de ação e `MenuItemDef` virou alias de
  `MenuActionDef`, então todo código existente continua compilando e renderizando igual.

  Duas escolhas de contrato que valem nota:

  - **`onCheckedChange` recebe só `(checked)`.** O motor chama com `(checked, detalhes)`; repassar
    o segundo argumento faria a assinatura pública da Aurea mudar junto com uma versão do Base UI.
  - **Link não tem `disabled`.** O HTML não desabilita âncora e o motor não aceita a prop — um
    destino indisponível é um item de ação desabilitado, não um link apagado.

  Ver o `G-API-02`.


- **`Tabs` escolhe entre ativar na seta e ativar no Enter.** `activateOnFocus` sempre existiu no
  motor e a Aurea o passava **fixo em `true`** — a escolha existia e não chegava a ninguém. A APG
  nomeia os dois padrões: automática quando o painel é barato, **manual** quando trocar de aba
  custa uma ida à rede, porque senão atravessar cinco abas por teclado dispara cinco
  carregamentos. O default continua `true`, byte por byte o que a Aurea já fazia. `loopFocus`
  entrou junto: é a mesma prop do mesmo `Tabs.List`, e o `Menubar` já expunha a dele.

- **`NumberField` ganhou uma alça de arrasto (`scrubbable`, `scrubDirection`).** Puxar a alça muda
  o valor, que é o que qualquer ferramenta de desenho faz num campo numérico e o que evita
  quarenta cliques no `+` num intervalo largo. **Opt-in, default `false`, e estritamente aditiva:**
  os dois botões, as setas e Home/End continuam intactos, e a alça é `aria-hidden` porque arrastar
  é gesto de ponteiro e não há equivalente de teclado a prometer. O eixo do arrasto sai como
  classe, não como `data-*`: o motor não publica a direção.

- **`Combobox` agrupa opções, e o vazio se escreve.** O de seleção única recebia só uma lista
  plana e mostrava uma frase fixa quando nada casava. Agora `items` aceita `ComboboxOptGroup[]` —
  a **mesma prop**, que é como o motor recebe grupo — e `empty` escreve o que aparece quando nada
  casa. O filtro do motor atravessa o agrupamento: digitar esconde item **dentro** do grupo e faz
  sumir o grupo que ficou sem candidato. `MultiCombobox` ganhou o mesmo `empty`.

  Com isso o `G-API-02` fecha nos **quatro** sítios de API. A quinta linha do cartão — o intervalo
  do `Calendar` — não era dele: ali a prop existe e o motor emite os três atributos; quem não
  pinta é a **pele**. Isso é desenho, e é o enunciado do `G-STATE-07`.

### Corrigido (contrato de API)

- **Sete callbacks entregavam um segundo argumento que a assinatura não declarava.** Todo callback
  de mudança do Base UI é chamado com `(valor, eventDetails)`, e a Aurea repassava o callback do
  consumidor **cru** ao motor em sete componentes: `NumberField`, `OTPField`, `Combobox`,
  `MultiCombobox`, `Collapsible`, `Toggle` e `ToggleGroup`. Em TypeScript o defeito é
  **invisível** — argumento a mais nunca é erro de tipo — então a assinatura era mentirosa sem que
  nada acusasse.

  O custo é acoplamento: quem escrevesse `onValueChange={(v, e) => …}` passava a depender do
  formato de evento de **uma versão** do Base UI, e a Aurea deixava de poder trocar de motor sem
  quebrar consumidor. Hoje um ajudante (`soOValor`) entrega **só o valor** nos sete.

  **Não é quebra de tipo**, e pode ser quebra de comportamento para quem tenha passado a usar o
  segundo argumento: ele nunca esteve na assinatura pública nem documentado, mas estava lá em
  tempo de execução. Se você o usava, o caminho é o `ref`/estado do seu próprio componente.


- **`Tabs` e `Menubar` ganharam `orientation`.** O `@base-ui/react` sempre entregou o eixo; a
  Aurea é que não passava adiante — a quinta e a sexta ocorrência da família *"o comportamento
  existe e não chega ao consumidor"*, que já tinha dado tema, densidade, scroll-spy e link de
  pular. Achado pela matriz do §13, que mostrou **onze** capacidades sem eixo de orientação.

  ```tsx
  <Tabs orientation="vertical" … />      {/* lista à esquerda, painel ao lado */}
  <Menubar orientation="vertical" … />   {/* e os menus abrem AO LADO, não por baixo */}
  ```

  Numa barra vertical o menu abrir para baixo o poria em cima do item seguinte da própria barra.
  Ele abre em `inline-end` — lógico e não `right`, para que em árabe abra sozinho para o outro
  lado. E, ao contrário do `ButtonGroup`, aqui o `aria-orientation` **sai**: lista de abas navega
  por seta, então anunciar é prometer teclado que existe.

  `Range` e `Accordion` **não** ganharam vertical: eles são `<input type=range>` e
  `<details>` nativos, e ali a vertical é construção, não exposição. Fica registrado como
  capacidade a decidir, no `G-AXIS-03`.

- **Três eixos de layout que faltavam em componente que já existia:** `Field` ganhou
  `orientation`, `ButtonGroup` ganhou `orientation`, e o `InputGroupAddon` ganhou alinhamento em
  **bloco** — a barra de ações acima ou abaixo do campo, dentro da mesma moldura.

  ```tsx
  <Field label="Time zone" orientation="horizontal">…</Field>   {/* linha de configurações */}
  <ButtonGroup orientation="vertical">…</ButtonGroup>
  <InputGroupAddon align="block-end">…</InputGroupAddon>        {/* caixa de composição */}
  ```

  Um grupo com adorno em bloco **troca o raio de pílula pelo raio de painel**: ele deixou de ser
  uma linha. Medido no navegador — com 999px numa caixa alta as laterais viram semicírculos do
  tamanho da caixa e o texto do campo colide com a curva.

  Não entrou o `responsive` do `Field`. Na referência ele depende de uma container query com
  contêiner nomeado, declarada por um `FieldGroup` que a Aurea não tem — e sem esse componente
  "responsivo" só poderia significar viewport, que é a pergunta errada: quem aperta o campo é o
  cartão em volta, não a janela.

- **`TableOfContents` passou a marcar a seção em vista sozinho.** A ficha dele dizia *"marks the
  section in view"* desde sempre; o componente React recebia `current` por prop e **não observava
  nada** — e o gerador do catálogo nunca passava `current`. O comportamento existia duas vezes em
  vanilla (no `aurea.js` e, com outra faixa, na página de documentação) e zero vezes em React:
  quem instalava só `@aurea-uds/react` recebia um índice que nunca marcava nada.

  ```tsx
  <TableOfContents items={secoes} />              {/* agora acompanha a rolagem */}
  <TableOfContents items={secoes} current="x" />  {/* quem controla, continua controlando */}
  ```

  A régua não é nova: é a mesma do runtime vanilla — faixa estreita no alto da janela, e vence a
  **última** seção que a cruza, porque seção e subseção cruzam juntas e a específica é a que
  interessa. Sem `IntersectionObserver`, continua uma lista de links que funciona.

- **`AureaProvider` ganhou `theme` e `density`, e a biblioteca ganhou `useTheme` e `useDensity`.**
  Os dois eixos existiam no runtime vanilla (`window.Aurea.setTheme`, `toggleTheme`, `setDensity`)
  **desde sempre**, e o pacote React não tinha nenhum dos três. Quem instalava só
  `@aurea-uds/react` não podia trocar tema nem densidade — as duas coisas que o sistema chama de
  identidade — e o catálogo e a documentação resolviam o tema cada um por conta própria, já
  divergindo em marcação e em ARIA.

  ```tsx
  <AureaProvider defaultTheme="dark" defaultDensity="comfortable">…</AureaProvider>

  const {theme, toggleTheme} = useTheme();
  const {density, setDensity} = useDensity();
  ```

  Controlado e não-controlado, a mesma convenção do `Toggle` e do `ToggleGroup`. **Sem `theme`
  nem `defaultTheme`, o provider adota o que o `<html>` já traz** em vez de sobrescrever: o
  `data-theme` no markup existe para não haver piscada de tema ao carregar, e um provider que
  impusesse o próprio default na primeira pintura devolveria a piscada.

  `toggleTheme` mora no provider porque a inversão **é** a conta: um botão de tema não escolhe
  entre dois valores, ele inverte o atual. Deixar isso para o consumidor foi o que produziu duas
  implementações divergentes da mesma coisa neste repositório.

- **195 composições prontas, sobre 77 componentes.** Eram 76 sobre 13. A medição que reformulou
  o trabalho não foi a média (0,86 por componente contra 20,8 do kibo) e sim o **formato dela**:
  **77 dos 90 componentes tinham ZERO**. O alvo virou "nenhum componente em zero", que se
  verifica em vez de se estimar. Os 13 que seguem sem composição própria são os 6 hooks mais o
  `AureaProvider` — que não emitem marcação — e 6 primitivos medidos **dentro** das composições
  dos outros (`Icon` em 48.509 ocorrências, `Label` em 15.832, `Grid` em 421). `AspectRatio`,
  `Cluster` e `Separator` apareciam **só na própria página**, então eram buraco e não cobertura:
  ganharam arquivo.

- **`Alert` ganhou `icon` e `onDismiss`,** espelhando o `Banner`. E passou a desenhar o glifo da
  variante por padrão, como a referência congelada sempre fez — antes **a cor era o único sinal**
  do tipo de aviso, o que reprova WCAG 1.4.1.

  ```tsx
  <Alert variant="danger" title="Blocked" onDismiss={close}>…</Alert>   {/* error--filled */}
  <Alert variant="warning" icon="idea">…</Alert>                        {/* o consumidor troca */}
  ```

  O `Banner` **não** ganhou glifo automático, de propósito: ele não existe na referência congelada
  e um aviso de largura de página nem sempre quer um. A assimetria é decidida, não herdada.

### Corrigido (acessibilidade)

- **O `DataGrid` prometia teclado de grade e não tinha nenhum.** A ficha declarava `role: "grid"`,
  `apg: "grid"` e quatro setas; medidas no navegador, as quatro eram inertes — `<table>` puro, sem
  `onKeyDown` e sem `tabIndex` em célula nenhuma.

  Agora ele implementa a grade da **WAI-ARIA APG** de verdade: a grade inteira é **uma** parada de
  Tab (roving tabindex pelas células, cabeçalho incluído), as setas navegam célula a célula sem dar
  a volta, `Home`/`End` vão aos extremos da **linha** e `Control+Home`/`Control+End` aos da
  **grade**, `PageUp`/`PageDown` saltam 10 linhas, `Enter` e `F2` entram no widget da célula e
  `Escape` volta para ela. Dentro do widget o teclado é dele — a grade não intercepta.

  ⚠️ **Muda o número de paradas de Tab.** Uma grade de 5 linhas com seleção custava 12 paradas
  (cada botão de ordenar, cada checkbox) e passa a custar 1. Quem dependia de tabular direto para
  um checkbox agora chega nele por seta + `Enter`. É o modelo da APG, e é o que torna uma grade
  grande navegável.

  Duas mudanças acompanham:

  - **`role="grid"` no lugar de `role="table"`**, o que torna **`aria-selected` válido na linha** —
    antes a seleção era só `data-selected` (estilo), porque `aria-selected` é inválido em
    `role="table"`. O atributo só aparece quando a grade é `selectable`.
  - **A região de rolagem perdeu o `tabIndex={0}`**: ela existia para a rolagem ser alcançável, e
    agora há células focáveis dentro. Uma parada de Tab a menos, antes da grade.

  Nove das treze teclas são medidas em navegador (`apps/keyboard-probe` +
  `tests/visual/teclado-motor.spec.ts`) e as outras quatro têm teste de comportamento; o motivo de
  cada uma está na `keyboardNote` da ficha. Ver o `G-A11Y-07`.

- **`invalid` parava nos três controles de TEXTO.** A Aurea pintava o estado de validação em
  `.input`, `.textarea` e `.select` e em mais nada. Um checkbox obrigatório reprovado — *"aceite
  os termos"*, o caso de validação mais comum que existe num formulário — **não tinha estado
  visual nenhum**, e nem o radio, nem o switch, nem o `NumberField`, nem o `OTPField`, nem o
  `SearchField`, nem o `FileInput`, nem o campo dentro de um `InputGroup` ou de um
  `MultiCombobox`.

  Agora `invalid` vale para as **seis superfícies de campo** do sistema, e pelos dois caminhos que
  já existiam (`[aria-invalid="true"]` da aplicação e `:user-invalid` da plataforma). O alvo muda
  com o parentesco: o próprio controle quando ele tem a borda, o **irmão** que desenha quando o
  `<input>` é `opacity:0` (`.control-mark`, `.switch-track`), e o **ancestral** quando o filho abre
  mão da moldura (`.input-group`, `.combobox-multi`, `.dropzone`).

  ⚠️ **Muda a aparência** de checkbox, radio, switch, dropzone e campo com adorno **quando o
  controle está inválido** — antes não mudavam nada. Nenhum outro estado foi tocado.

  Duas consequências que valem nota:

  - **`FileInput` marca a rejeição.** Arquivo recusado por tipo ou tamanho agora põe
    `aria-invalid` no `<input type=file>` e liga o motivo por `aria-describedby` — uma descrição
    por rejeição. Antes o motivo existia só como texto solto: o componente sabia que o arquivo
    tinha sido recusado e **não marcava o campo**.
  - **Sete fichas do registry ganharam `invalid`** em `states` (`Checkbox`, `Radio`, `Switch`,
    `NumberField`, `OTPField`, `SearchField`, `FileInput`). O `error` do `FileInput` **fica** — é
    o upload que falhou, outro conceito.

  O estado é medido no navegador por `tests/visual/invalido.spec.ts`, que injeta o atributo no
  controle real das 328 páginas construídas e compara a aparência computada. Ver o `G-STATE-02`.

- **Todo link em prosa reprovava contraste no tema claro.** O core pintava
  `a { color: var(--primary) }`, e `--primary` é o amarelo da marca: **1,73:1** contra os 4,5:1
  que a WCAG 2.2 SC 1.4.3 pede. Desde sempre, e invisível porque o projeto se desenvolve no tema
  escuro (lá dá 10,34:1) e o catálogo repinta os próprios links.

  Nasceram **`--link` e `--link-hover`**. No escuro, `--link` referencia `{brand-yellow}` — a
  identidade é apontada, não copiada, e **nada muda de aparência no tema escuro**. No claro,
  `oklch(0.52 0.106 86.047)`: a mesma **matiz** da marca, com o maior croma que cabe no gamut sRGB
  e passa 4,5:1 nas três superfícies claras (5,02 · 5,55 · 4,66 medidos).

  ⚠️ **Muda a aparência do tema claro:** links passam de amarelo a âmbar escuro. `--brand-yellow`
  e `--primary` ficam intactos. É a
  [ADR-0044](decisions/0044-semantica-tem-precedencia-sobre-coincidencia-de-token.md) de novo —
  `--primary` é invariável entre temas porque é identidade, então não pode servir um papel
  semântico que precisa mudar com o tema.

- **Cinco fichas declaravam menos teclado do que o componente entrega.** Três eram elemento
  nativo (abaixo) e duas vêm do motor: `DropdownMenu` também abre com **ArrowUp** (foco no último
  item) e com **Space**, e `OTPField` também anda com **ArrowUp** e **Home**. Medido num navegador
  de verdade, com a aplicação montada — o catálogo é estático e teclado de motor é efeito.

- **Três fichas declaravam menos teclado do que o componente entrega.** `Range` dizia 4 teclas e o
  `<input type="range">` nativo entrega 8; `Select` dizia 2 e entrega 9; `Radio` dizia 3 e entrega
  5. A ficha é o contrato publicado: prometer menos produz gap falso em auditoria de
  acessibilidade — e autoriza trocar o elemento nativo por outra coisa sem ninguém notar o que
  se perdeu. Medido no navegador, não lido no APG: a medição **acrescentou** `ArrowLeft`/
  `ArrowRight` ao `Radio` e **impediu** acrescentar `Home`/`End`, que o padrão menciona e o
  navegador não faz.

### Corrigido

- **`LogStream` mostrava a mensagem numa coluna de 72px e nunca mostrava o nível.** O core desenha
  `.log-line` como uma grade de **três** trilhas — hora, nível, mensagem — e o componente emitia
  **dois** filhos, então a mensagem caía na trilha do nível. Medido no navegador em 22/08/2026:
  **72px** contra os **690px** da referência congelada. O nível ia numa classe (`log-warn`) que o
  core **não pinta** — e classe sem regra não quebra nada, ela some.

  O `Alert` tinha o mesmo defeito por outro caminho: o título caía na trilha do **ícone**.

  A regressão é pega por `tests/unit/grade-do-core.test.tsx`, que lê as trilhas do `aurea.css` e
  cobra do componente o mesmo número de células — mais a regra geral que teria pego `log-warn` no
  dia em que nasceu: **nenhuma classe emitida pelo React fica sem regra no core**.

- **`.log-level.info` recebeu `--info`** em vez do amarelo da marca. É a
  [ADR-0044](decisions/0044-semantica-tem-precedencia-sobre-coincidencia-de-token.md) aplicada:
  INFO num log e a cor primária da Aurea são duas intenções, e estavam indistinguíveis.

### Corrigido (acessibilidade)

- **`AppShell` passou a entregar o link de pular conteúdo.** WCAG 2.2 SC 2.4.1 (*Bypass Blocks*),
  **nível A** — o mais básico. Ele existia escrito à mão só na página de documentação; o core não
  tinha, o `AppShell` não tinha, e as 200 páginas do catálogo não tinham. A página de demonstração
  era acessível e o componente que o consumidor instala não era.

  Agora é o primeiro nó tabulável do shell e aponta para o `<main>`, que ganhou `tabindex="-1"`
  para o foco ir junto com o hash. O rótulo vem do dicionário (`skipToContent`), então traduz. Como
  o catálogo é montado com o `AppShell`, as 202 páginas ganharam o link no mesmo commit.

  Nada muda visualmente em repouso: o link fica fora da tela por transformação e aparece **no
  foco** — não por `display:none`, que o tiraria da tabulação, nem por `left:-9999px`, que faz a
  página rolar de lado ao focar.

- **Todo tom tem preenchimento próprio, e `warning` deixou de ser a cor da marca.** Duas mudanças
  de token que fecham o eixo de tom do botão.

  `appearance="solid"` com `tone="success"` entregava, até aqui, um botão de contorno — a Aurea
  não tinha o par cor+texto que um botão cheio exige, e rebaixava em silêncio. Agora existem
  `--success` + `--success-foreground` + `--success-hover`, e os mesmos três para `info` e
  `warning`, na mesma estrutura do `--destructive`: no escuro, preenchimento claro com texto
  escuro; no claro, preenchimento fundo com texto branco. Todos medidos — o pior contraste da
  matriz de 5 aparências × 6 tons, nos dois temas, é **4.54:1**.

  `success` e `info` **adotaram a cor que já estava no ar**, então nada que já usava esses tons
  mudou de pixel. O que mudou de propósito foi `warning`.

  ```diff
  - <Button appearance="solid" tone="success">Approve</Button>   {/* saía outline */}
  + <Button appearance="solid" tone="success">Approve</Button>   {/* sai preenchido */}
  + <Button appearance="solid" tone="warning">Revoke</Button>    {/* tom novo */}
  ```

- **`--warning-400` não é mais `var(--brand-yellow)`.** No tema escuro, a cor de aviso e a cor da
  marca eram **a mesma cor** — distância perceptual de `0.001`, quando os outros pares de tom da
  Aurea ficam em `0.19`. Um aviso idêntico ao botão primário não avisa.

  O valor novo foi escolhido por otimização: entre os que passam AA como texto sobre o fundo do
  tema, cabem no gamute sRGB e ficam na faixa de luminosidade que os outros tons já ocupam, é o
  que **maximiza a menor distância até a marca e até o destrutivo** — porque afastar de um
  aproxima do outro. Ficou em `oklch(0.72 0.175 60)` no escuro (distância `0.104` da marca,
  `0.115` do destrutivo) e `oklch(0.535 0.131 61)` no claro. `--brand-yellow` e `--primary` estão
  intactos; a família de aviso inteira (`-500`, `-800`, `-bg`) acompanhou.

  **Muda o pixel** de tudo que pinta aviso: `Badge`, `Status`, `Alert`, `Banner`, o nível `warn`
  do `LogStream` e a célula de aviso da matriz de saúde.

### Corrigido (acessibilidade)

- **`Button variant="primary-outline"` e `primary-ghost` reprovavam AA no tema claro.** O rótulo
  saía com `--primary` cru — amarelo-marca sobre fundo quase branco, **1.73:1** contra os 4.5:1
  que o WCAG 2.2 SC 1.4.3 exige; a borda do outline ficava no mesmo número, contra os 3:1 do SC
  1.4.11. O `link-primary` já tinha a correção de tema claro desde sempre; estas duas nasceram sem
  ela. Agora as três usam a mesma.

  Achado ao **medir** a matriz de tom inteira para verificar os tons novos — nenhum gate do
  projeto olhava para contraste. Passou a haver um: `tests/visual/tone-contrast.spec.ts` cobre as
  30 células nos dois temas, no navegador.

- **O botão ganhou o eixo `tone`, ao lado de `appearance` — e nenhum código existente muda.**
  `variant` era, na prática, dois eixos achatados num nome só: `primary` é preenchido+marca,
  `danger-outline` é contorno+destrutivo, `link-danger` é link+destrutivo. Dava para ver o
  achatamento na própria ordem das palavras — em `outline`/`ghost` o tom vem na frente, em
  `link` vem atrás.

  ```diff
  + <Button appearance="outline" tone="success">Approve</Button>   {/* célula nova */}
    <Button variant="danger-outline">Delete</Button>               {/* continua igual */}
  + <Button appearance="outline" tone="danger">Delete</Button>     {/* o MESMO botão */}
  ```

  **Os treze valores de `variant` continuam valendo, e continuam emitindo a mesma classe.**
  Quando o par (aparência, tom) já tinha nome próprio, é esse nome que sai — então o DOM é
  caractere por caractere o de antes e nenhuma captura de tela mudou. Um eixo sozinho modifica
  o par do atalho em vez de substituí-lo, que é o que permite `<IconButton tone="danger">`
  sem reescrever o default `ghost` do componente.

  **O que passou a existir:** `success` e `info` nas aparências `outline`, `ghost`, `link` e
  `nav`, e `brand`/`danger` em `nav` — nove células que nome nenhum alcançava. Os tons pintam a
  partir de `--success-400`/`--info-400`, que já são os tokens "esta cor, legível contra a
  superfície **deste** tema" usados pelo `Alert`.

  **O que deliberadamente não existe, e por quê.** `appearance="solid"` com `success`/`info` cai
  na aparência `outline` do mesmo tom: um botão preenchido precisa do par cor+texto que só
  `--destructive`, `--primary` e `--secondary` têm, e inventá-lo é decisão de paleta. E
  `warning` **não é** um tom de botão: medido, `--warning-400` no tema escuro é literalmente
  `var(--brand-yellow)`, a mesma cor de `--primary` — um aviso idêntico ao botão primário não
  avisa. As duas ausências estão declaradas na ficha, no teste e na página do catálogo.

- **A ficha do registry passou a declarar TODOS os eixos, não só `variants` e `sizes`.** O campo
  `axes` (`{prop: [valores]}`) cobre o resto, e o validador agora reprova qualquer prop de união
  literal que a ficha não declare. Ao generalizar apareceram **oito** eixos publicados que o
  contrato nunca declarou: `side` em `Popover`, `Tooltip`, `HoverCard` e `DropdownMenu`,
  `direction` no `AureaProvider`, `kind` no `MediaPlayer`, `titleAs` no `EmptyState`. O catálogo
  passou a mostrá-los na mesma linha de `Variants` e `Sizes`.

- **O registry passou a modelar HOOK, e os três públicos ganharam ficha e página.** `useToast`,
  `useAureaStrings` e `useSpriteUrl` existiam, funcionavam e não estavam declarados em lugar
  nenhum — o catálogo chegava a **citar** o toast para explicar o `Alert` ("an Alert stays put; a
  Toast would vanish") e não tinha para onde apontar.

  A ficha ganhou o eixo `kind` (`component` | `hook`), opcional e com `component` como padrão. O
  validador cobra ficha para todo hook público, como já cobrava para componente. E o catálogo diz
  a espécie: **Hooks › Feedback › useToast**, com selo próprio no índice.

- **`size` no `Checkbox`, no `Radio` e no `Switch`** — `sm | md | lg`, os mesmos degraus do resto
  da família. Uma linha de formulário com um campo `sm` e um checkbox de tamanho fixo ao lado
  desalinhava.

- **`InputGroup` e `InputGroupAddon`** — a caixa que parece um campo e segura o controle mais o
  que vem grudado nele: um glifo, um prefixo (`https://`), um sufixo (`@acme.dev`), um botão. A
  moldura é do grupo e o controle de dentro abre mão da dele, que é o que permite o adorno morar
  **dentro** da caixa em vez de flutuar sobre ela.

- **`primary-outline` e `primary-ghost` no `Button`** — e no `IconButton` e no `ToolbarButton`,
  que herdam o mesmo tipo. Eram as duas células vazias da matriz aparência × tom: o tom de marca
  existia em `solid` (`primary`) e em `link` (`link-primary`) e **não existia** em `outline` nem
  em `ghost`. Na prática, faltava o botão de ação secundária mais comum do mercado — contorno na
  cor da marca. Mesma receita do par `danger-*`, com o token do outro tom.

- **`PasswordField`, `Label` e `AspectRatio`.**

  - **`PasswordField`** é o campo de senha com mostrar/ocultar. O botão fica no fim do campo,
    aponta para ele com `aria-controls`, e **o rótulo muda com o estado** — é assim que o leitor
    de tela sabe o que o botão faz. Sem `aria-pressed`: com os dois, o anúncio fica duplicado
    ("Mostrar senha, não pressionado"), e nenhuma das duas referências faz isso.
  - **`Label`** é o rótulo avulso, para quem monta o próprio campo e não usa `Field`. Antes disso
    quem saía do `Field` escrevia um `<label>` cru e perdia a pele.
  - **`AspectRatio`** é a caixa de proporção fixa. Hoje é uma linha de CSS, e ainda assim é
    componente: sem ele cada consumidor reescreve o `padding-top: 56.25%` de 2015, ou esquece o
    `min-width: 0` que impede a caixa de estourar a coluna de um grid.

- **Dois textos novos em `AureaStrings`**: `passwordShow` e `passwordHide`, com tradução em `ptBR`.

- **`Separator`, `Collapsible` e `ToggleGroup`** — três capacidades que cinco das nove
  referências têm e a Aurea não tinha, todas com primitive no `@base-ui/react`, que já era
  dependência de runtime. Nenhuma dependência nova.

  - **`Separator`** é a linha de divisão do sistema, em qualquer eixo, com `role="separator"` e
    `aria-orientation`. Ela já existia duas vezes resolvida localmente — `.toolbar-sep` e
    `.menu-sep` —, e agora a cor e a espessura moram num lugar só.
  - **`Collapsible`** é **uma** seção controlada, e não um `Accordion` de um item: o `Accordion`
    é um conjunto sobre `<details>` nativo, que abre sem JS e guarda o próprio estado; aqui a
    aplicação é a dona do `open`.
  - **`ToggleGroup`** é vários `Toggle` com estado compartilhado, `multiple` opcional e seta
    andando por dentro do grupo. Não é o `SegmentedControl`, que é escolha única e obrigatória.

- **`Menubar`** — a fila de menus de aplicação (Arquivo, Editar, Ver). Não é uma `Toolbar` com
  `DropdownMenu` dentro, e a diferença não é de aparência: com um menu **aberto**, a seta lateral
  e o ponteiro passam para o menu vizinho sem fechar e reabrir. Isso é estado compartilhado entre
  os menus, e é o que o motor traz. Os itens são os mesmos dados dos outros menus daqui, então um
  item de menubar nunca diverge de um item de menu de contexto.

- **`Toggle` aceita `value`.** É o que identifica o toggle dentro de um `ToggleGroup`; solto, não
  muda nada.

- **`@aurea-uds/contracts` publica a superfície de API.**
  `import surface from "@aurea-uds/contracts/api-surface" with {type: "json"}` — todo componente
  que o `@aurea-uds/react` exporta, com suas props e, quando o tipo é união de literais, os
  valores que cada prop aceita. É **derivado**: o build lê a emissão de declaração do compilador,
  então herança, `Omit`, `Pick` e alias em cadeia são resolvidos por quem sabe resolvê-los.
  Serve para uma ferramenta responder "quais variantes este componente aceita?" sem varrer o
  nosso fonte nem confiar na nossa prosa.

- **A ficha de registry ganhou `variantProp` e `sizeProp`**, opcionais: dizem qual prop carrega a
  escala quando não é a de nome óbvio. O `Drawer` usa `side`.

### Corrigido

- **A Aurea escondia as próprias barras de rolagem.** `.sidebar` e `.toc` tinham
  `scrollbar-width: none` e `::-webkit-scrollbar { width: 0 }`. Região que rola sem barra visível
  não avisa que rola e não dá o que arrastar — era um controle removido, não uma escolha de
  estilo. Agora a barra aparece, fina e na cor do tema, em toda região do sistema que rola.

  Ela continua **nativa**: não há `<div>` fazendo de polegar, então a rolagem por clique no
  trilho e as preferências de acessibilidade do sistema continuam de pé. Dois caminhos, porque
  os dois são necessários — `scrollbar-color` só chegou ao Safari na 26.2 e `::-webkit-scrollbar`
  só chegou ao Firefox na 153.

- **`Checkbox`, `Radio` e `Switch` não acompanhavam a densidade.** A marca de seleção era `18px`
  cru e o trilho do switch `42×24px` cru — em `comfortable` casavam com o resto por coincidência,
  e em `compact` e `spacious` ficavam do mesmo tamanho enquanto a linha do formulário inteira
  mudava. As medidas agora saem da altura de controle: metade dela dá exatamente os 18px de antes
  em `comfortable`, então nada muda ali; o que muda é as outras duas densidades passarem a estar
  certas. O botão do switch também encolhe com o trilho — preso em 16px, ele vazaria de um trilho
  `compact`.

- **O `MessageComposer` sem ícone abria um vão de 40px antes do texto.** O invólucro antigo fixava
  o recuo do glifo de forma incondicional, e o ícone do composer é opcional — uma receita do
  catálogo usa exatamente assim. `SearchField`, `PasswordField` e `MessageComposer` passaram todos
  a usar o `InputGroup`, onde o espaço vem do adorno existir: sem adorno, sem espaço.

- **Validação nativa não pintava nada.** `required`, `type="email"` e `pattern` não davam estado
  visual nenhum: o campo só ficava vermelho se a aplicação passasse `error` à mão. Agora o core
  usa **`:user-invalid`**, que é a resposta da plataforma ao problema que as bibliotecas resolvem
  com um estado `touched` em JavaScript — o erro aparece depois de a pessoa mexer no campo e sair
  dele, e não antes do primeiro caractere. Vale também no exemplo vanilla, sem uma linha de JS.
  Suporte medido pelos dados do MDN: Chrome 119, Firefox 88, Safari 16.5.

- **`.select[aria-invalid]` não existia.** A regra tinha sido escrita para `input` e `textarea`, e
  o terceiro campo da mesma família ficou sem — um select marcado como inválido pela aplicação
  não mostrava nada.

- **Oito estados que o core desenhava e ficha nenhuma declarava.** O pior deles é
  `data-highlighted`: o core pinta `.menu-item[data-highlighted]` desde sempre, e o contrato
  negava que o estado existisse. Ele não é `hover` nem `focus` — é o item apontado pelo teclado
  enquanto o foco continua no campo, que é o caso normal de um combobox. Também entraram
  `dragging` no `FileInput`, `read`/`unread` no `NotificationCenter`, e o `orientation` do
  `Toolbar`, que não é estado: é eixo, e foi para `variants` com `variantProp`.

- **Quatro fichas de registry mentiam sobre a API que descrevem.** O `ToolbarButton` declarava
  uma variante `neutral` que não existe em `ButtonVariant` e escondia nove que existem; o
  `IconButton` escondia sete variantes e dois tamanhos — inclusive `primary` e `danger-ghost`,
  que o próprio repositório usa; o `Icon` não declarava tamanho nenhum; e o `Drawer` declarava
  `variants` numa prop chamada `side`. Passaram meses assim porque o gate que compara tipo com
  ficha lia o fonte com expressão regular e não enxergava união herdada. Agora ele lê a
  superfície de API acima e cobre `sizes` além de `variants`.

- **O `STATE.md` publicava 78 componentes onde o pacote tem 76**, contando dois contextos React
  como componentes. Saía também no bloco do README e no `manifest.json`.

- **`Sidebar` recebe a navegação como dado.** `items`, `current`, `collapsed` e `label`. Um
  formato de item cobre grupo e aninhamento; o item atual sai com `aria-current="page"`, que é
  também de onde vem a pele. `children` continua valendo e não é legado — é o caminho para quem
  monta a lista a partir de um roteador ou de um CMS.
- **`AppShell.sidebarCollapsed`**, controlado pelo consumidor: encolhe a coluna do grid para
  `--sidebar-rail`. O shell não decide quando recolher nem desenha o botão que recolhe.
- **Token `--sidebar-rail`** (`5.5rem`): a coluna da lateral recolhida.
- **`Sidebar`, `Topbar`, `Status` e `QRCode` saíram de `Draft`** e publicam contrato de `props`.
  Não há mais ficha em rascunho.

| | Before | After |
|---|---|---|
| Container | `role="group"` | `role="radiogroup"` |
| Option | `<button aria-pressed>` | `<button role="radio" aria-checked>` |
| Tab stops | one per option | one for the whole group |
| Arrow keys | nothing | move **and** select; plus `Home`/`End` |

What breaks in practice:

```diff
  /* your own CSS, if it keyed off the old attribute */
- .my-segmented button[aria-pressed="true"] { … }
+ .my-segmented button[aria-checked="true"] { … }
```

```diff
  // tests
- getByRole("button", {pressed: true})
+ getByRole("radio", {checked: true})
```

Styling by the `.active` class — which is what Aurea emits and documents — is unaffected. And
**no pixel changed**: the element is still `<button class="active">`.

#### 5. Fourteen classes were removed from the core stylesheet

Measured: **no component in the library emitted any of them.** They styled a hand-written
documentation page that no longer exists, and they were dead weight in every consumer's download.

`.accordion-item` · `.accordion-panel` · `.accordion-trigger` · `.copied` · `.doc-sidebar` ·
`.media-library-row` · `.mobile-nav-backdrop` · `.mobile-nav-close` · `.mobile-nav-toggle` ·
`.operational-grid` · `.overlay` · `.pattern-toolbar` · `.time-display` · `.universal-grid`

**What breaks:** if you hand-wrote markup using one of these names, it loses its styling. Note the
three accordion ones in particular — the `Accordion` component never used them. It emits
`.accordion` and `.accordion-content` on native `<details>` / `<summary>`, and that is unchanged.

### Added

#### React Server Components are supported

Twenty-one of the twenty-four modules now carry `"use client"`. Three deliberately do not: the
barrel (`index`), `disclosure` (pure markup), and a new `pure` module. That split is the whole point —
re-exporting a client component from a server module is the supported path, so
`import { Button } from "@aurea-uds/react"` inside a server component now works.

The directive is applied where a client API is actually used, so nothing is pushed to your client
bundle without cause. There is a gate (`validate.py` check 26) that fails **in both directions**: a
module that needs the directive and lacks it, and a module that carries one it does not need.

These are importable from a **server** component, because they live in the directive-free module:

- `cx`, `defaultStrings`, `ptBR`, `defaultSpriteUrl`, `AureaStrings`
- `gridStateToParams`, `gridStateFromParams`, `GridState` — URL state for `DataGrid`, exported from
  the **barrel** rather than the `./data-grid` subpath on purpose: in an RSC framework the server
  reads the URL, and the subpath carries the directive
- `universalStates`, `stateSeverity`, `UniversalState`

Also fixed as part of this: `@aurea-uds/core` and `@aurea-uds/fonts` now emit a `.d.ts` for their
`./css` subpath. `import "@aurea-uds/core/css"` used to fail with **TS2882** in any TypeScript
consumer under `moduleResolution: "bundler"` or `"node16"`.

#### 27 new components

Registry entries went from **65 to 92**. All declare a published `props` contract, and all are
`Ready`.

**AI & Agents (16)** — a new category, [ADR-0017](decisions/0017-categoria-ai-agents.md):

| Component | What it is |
|---|---|
| `AgentCard` | Who an agent is, what state it is in, and what it can do. |
| `AgentInspector` | The detail of one agent: configuration, tools, instructions. |
| `AgentStatus` | The state of an agent, in one fixed vocabulary. |
| `AutomationCard` | A rule that runs on its own: when this, then that — and a switch. |
| `CostMeter` | Spend against a ceiling, with the soft and hard limits kept apart. |
| `DependencyGraph` | Who depends on whom, on a canvas you can pan, zoom and build on. |
| `EventStream` | What happened, in order, live. |
| `HealthMatrix` | What is up, in a grid. |
| `HumanApproval` | The gate: what is about to happen, and a person's decision. |
| `InterAgentMessage` | A message from one agent to another, where the direction is the data. |
| `InvocationPanel` | One execution: what was asked, the steps, what came out. |
| `MemoryLedger` | What the agent stored, recalled or forgot — and where it came from. |
| `ModelUsage` | Consumption split by model: which one took how much. |
| `TaskQueue` | The work queue: what is waiting, what is running, what failed. |
| `ToolPermission` | What each tool may do, without asking again. |
| `TraceTimeline` | How long each step took, as a waterfall. |

**Everywhere else (11):**

| Component | Category | What it is |
|---|---|---|
| `Chart`, `ChartTooltip`, `ChartLegend` | Data Display | A sized, named surface hosting a Recharts chart in Aurea tokens, its tooltip, and its legend. |
| `Calendar` | Inputs | Month grid for picking a day, a range, or several days. |
| `NumberField` | Inputs | Numeric field with decrease and increase controls. |
| `OTPField` | Inputs | One box per character, for a verification code typed or pasted. |
| `AvatarGroup` | Identity | Overlapping stack of avatars, with a count for the ones that do not fit. |
| `HoverCard` | Overlays | Rich preview that opens on pointer rest, and whose content can be reached. |
| `Spinner` | Feedback | Indeterminate activity indicator for a wait with no known end. |
| `Stepper` | Navigation | Progress through numbered steps, for a task with a fixed order. |
| `Toggle` | Actions | Two-state button that stays pressed, for a setting you flip in place. |

#### Three new subpaths, three new optional peers

| Subpath | Optional peer | If you do not install it |
|---|---|---|
| `@aurea-uds/react/chart` | `recharts@^3.10.1` | `Chart`, `ChartTooltip`, `ChartLegend` are unavailable |
| `@aurea-uds/react/calendar` | `react-day-picker@^10.0.1` | `Calendar` is unavailable |
| `@aurea-uds/react/graph` | `@xyflow/react@^12.11.2` | `DependencyGraph` is unavailable |

They are **optional** peers and live behind subpaths, so importing from the barrel never pulls a
charting, calendar or graph engine into your bundle. `@base-ui/react` remains the only runtime
dependency, unchanged at `^1.6.0`.

#### `DataGrid` grew from a demo table into a server-backed grid

27 new props. Sorting, filtering, pagination and selection kept their internal-state default, so
**no existing call changed**.

- **Controlled mode:** `sorting` / `onSortingChange`, `globalFilter` / `onGlobalFilterChange`,
  `page` / `onPageChange`, `rowSelection` / `onRowSelectionChange`. `page` is **1-based**, matching
  our `Pagination`.
- **Server-side data:** `manualSorting`, `manualFiltering`, `manualPagination`, `rowCount`.
- **Per-column and faceted filtering:** `filters`, `columnFilters` / `onColumnFiltersChange`. The
  filter row is part of the header, so each control is aligned with its column by construction.
- **Bulk actions:** `bulkActions` — a `Toolbar`, with arrow-key navigation, and zero new CSS.
- **Sticky header:** `stickyHeader`. Height ceiling is `--datagrid-max-h` in CSS, not a prop.
- **Hideable and resizable columns:** `hideableColumns`, `columnVisibility` /
  `onColumnVisibilityChange`, `resizableColumns`, `columnSizing` / `onColumnSizingChange`. Both are
  serialisable maps, so you decide where they persist. The resize handle responds to **arrow keys**.
- **States:** `state`, `stateMessage`. `loading` does **not** blank the rows you are already
  reading; `error` announces via `role="alert"`, the others via `role="status"`.
- **Row detail panel:** `renderDetail`, `detailRowId` / `onDetailRowIdChange`. The trigger is a
  button per row, not a clickable row.
- **Export:** `onExport`. The label states the scope; selection beats filter, filter beats
  everything. The grid does not generate the file — format, encoding and transport are yours.
- **URL state:** `gridStateToParams` / `gridStateFromParams` from the barrel. They are the format
  and nothing more; the grid never writes to the URL, because only you know whether a change is a
  `push` or a `replace`.

#### Universal states

Seven conditions that every application used to reinvent, now named once and applied consistently:
`waiting_user`, `waiting_approval`, `waiting_dependency`, `offline`, `stale`, `partial`,
`degraded`. [ADR-0018](decisions/0018-estados-universais-sao-um-eixo-a-parte.md).

- A `state` prop, with the same name and the same vocabulary, on `Status`, `Alert`, `Banner`,
  `EmptyState` and `DataGrid`. It marks `data-state` in the DOM.
- `universalStates`, `stateSeverity` and the `UniversalState` union are exported from the barrel and
  readable from a server component.
- `state` is its own **axis**, not a `variant` value: `variant` is severity, `state` is condition.
  Merging them would put "stale" next to "danger" and force you to pick one.
- **No new token and no new CSS** — the sense is carried by text, and none of the seven reaches
  `danger`, because in all seven the screen still works.

#### `FileInput` became a transfer queue

- New public type `FileQueueItem` — `id`, `name`, `bytes`, `status`, `progress`, and optional
  `restored`, `checksum`, `finishedAt`.
- New props `initialQueue`, `onQueueChange`, `preview`, `checksum`.
- `UploadContext` now includes `resumeFrom`, so **pausing is no longer cancelling** — your upload
  function is told where to resume.
- `UploadFn` may now resolve with `{checksum?: string}`; the component compares it against the one
  it computed locally. Returning `void` is still valid, so existing upload functions keep working.

#### Layout, shell and provider

- **`AureaProvider.portalContainer`** — where every popup in the library mounts: dialog, drawer,
  tooltip, popover, hover card, both menus, the notification panel, both combobox lists and the
  toasts. Without it nothing changes (the portal goes to `document.body`, which is what lets it
  stack and position without inheriting `overflow` or `transform`). Point it at a node inside one of
  your landmarks when you need popup content to satisfy "all content in a landmark".

  ```jsx
  const [anchor, setAnchor] = useState(null);
  <AureaProvider portalContainer={anchor}>
    <main>{…}<div ref={setAnchor} /></main>
  </AureaProvider>
  ```

- **`Sidebar` takes navigation as data:** `items`, `current`, `collapsed`, `label`. One item shape
  covers groups and nesting — with `items` and no `href` it is a group, with both it is a parent
  with a sublist. The current item gets `aria-current="page"`, which is also where its styling comes
  from. `children` still works and is not legacy — it is the path for building the list from a
  router or a CMS.
- **`AppShell.sidebarCollapsed`**, controlled by you: collapses the grid column to
  `--sidebar-rail`. The shell decides neither when to collapse nor what the collapse button looks
  like.
- **`Sidebar`, `Topbar`, `Status` and `QRCode` left `Draft`** and publish a `props` contract. No
  component is in draft any more.

#### CSS escape valves

Seven custom properties you can set to tune a component. All are read **with a fallback**, so every
default is exactly what it was before the valve existed — setting nothing changes nothing.

| Property | Default | Tunes |
|---|---|---|
| `--datagrid-max-h` | `60vh` | height ceiling of a `stickyHeader` grid |
| `--datagrid-detail-w` | `20rem` | width of the row detail panel |
| `--chart-h` | `220px` | height of the `Chart` surface |
| `--log-h` | `240px` | height of the `LogStream` box |
| `--media-h` | `360px` | height of the media player |
| `--media-ar` | `16/9` | its aspect ratio — `auto` is only safe together with `--media-h` |
| `--qr-size` | `10rem` | size of the QR, quiet zone included |

`--media-ar` exists for **CLS**, not decoration: without a fixed ratio, a player with
`preload="none"` measures zero until the media arrives and the page jumps.

#### Tokens

- One new token, `--sidebar-rail` (`5.5rem`): the width of the collapsed sidebar column.
- **`$description` went from 19 to 90** of the 175 distinct names — every `theme` and `density`
  token now says when to use it. `base` was left out on purpose: those are primitives where the name
  *is* the description, and a mandatory sentence would be filler. Filler reads as contract, which is
  worse than absence. Gate: `validate.py` check 27.
- **No token was removed and no existing token changed value.** 261 declarations, 175 distinct
  names.

### Changed

- **`AppShell` collapses to one column at 767px instead of 820px.** The legacy breakpoint was
  retired for the standard scale. Between 768px and 820px the sidebar column now stays.
- **`MediaPlayer` compacts by its own width, not the viewport's.** The `400px` media query became a
  `@container` query. A player in a 400px side panel inside a 1920px window is exactly as cramped as
  one in a 400px window, and the viewport query never saw it.
- **`Sidebar` emits list semantics** — `role="list"` and `role="listitem"` — when given `items`.
- **The `CodeBlock` `<pre>` is focusable** (`tabIndex`). It is an `overflow: auto` box, so code
  wider than the container used to be unreachable by keyboard.
- **`Icon` inside `AvatarGroup` and similar wrappers is `aria-hidden`**, with the accessible name on
  the group.

### Fixed

- **`Progress` announced the wrong number.** `aria-valuenow` reported the raw `value` while the bar
  clamped to 0–100 — so `value={150}` announced `150` against `aria-valuemax={100}`. It now
  announces the clamped percentage. The signature is unchanged. Its registry entry also stopped
  promising an indeterminate mode, which never existed.
- **`LogStream` put the message in the wrong column, and `level` painted nothing.** The skin is
  three columns (time | level | text) and the component emitted **two**, so the text landed in the
  72px level column. Separately, `level` wrote `log-${level}` on the container while the core styled
  `.log-level.error` on an inner element. Both fixed at the root. Neither boundary gate saw it: one
  reads only literal class names and `log-${level}` is a template, the other treated the class as
  producible through the same prefix.
- **The navigation drawer could not be reached by keyboard in WebKit.** The shell trusted the native
  popover entirely for focus. Measured in Safari: opening the drawer left focus on `<body>`, and
  none of eight `Tab` presses entered it. The shell now moves focus to the first item on open and
  returns it to the trigger on close, identically in all three engines. Declared limit: the drawer
  is **not modal**, so `Tab` can leave it in WebKit — that is a decision, not a defect
  ([ADR-0019](decisions/0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md), Decision 3).
- **`import "@aurea-uds/core/css"` failed type-checking** with TS2882. Both `core` and `fonts` now
  declare a `types` condition for their `./css` subpath.
- **`ToolbarGroup` used a raw `4px` gap** where `4px` *is* `--space-1`, so its spacing ignored
  density. It now follows the root.

### Removed

- The 14 core classes listed under **Breaking changes #5**, and the 5 unclassed table rules under
  **#1**.
- Six legacy breakpoints outside the standard scale (`1366`, `821`, `820`, `800`, `640`, `400`).
  Four served a documentation page that no longer exists, one was already unused, and `400` became
  the `@container` query described under **Changed**.
- Nothing was removed from the JavaScript API. Zero exports, zero props.

### How this was measured

`0.1.0` was published at commit `a0dd056` (2026-07-31 08:32). Every number above comes from
comparing that commit with `HEAD`:

```bash
# components: 65 -> 92, and which 27 are new (manifest.json is generated, gated by check 20)
git show a0dd056:manifest.json
# exported names: 106 -> 176, and that none was removed
git diff a0dd056..HEAD -- packages/react/src/
# props on pre-existing components: 39 new, 0 removed (function signatures, not registry entries —
# an entry that gained `props` in Part E documents a prop that already existed)
git diff a0dd056..HEAD -- packages/react/src/ packages/contracts/registry/
# unclassed element rules in the core: 14 -> 9; classes: 260 -> 378; 73,066 -> 112,040 bytes
git diff a0dd056..HEAD -- packages/core/src/aurea.css
# tokens: +1 name, 0 removed, 0 values changed, 19 -> 90 descriptions
git diff a0dd056..HEAD -- packages/tokens/src/aurea.tokens.json
# subpaths, peers, and the ./css types condition
git diff a0dd056..HEAD -- packages/*/package.json
```

Two things this list deliberately does **not** claim. Comment text was stripped before extracting
class and property names — the first pass counted prose as code, which is the same defect checks 12
and 23 exist to catch. And prop changes were read from function signatures rather than registry
entries, because 43 entries gained a `props` array during this cycle for props that already
existed; counting those as new API would have inflated this file substantially.

`validate.py` **check 31** now fails if a component enters the library without being named here.
Its declared limit is written into `scripts/released-surface.json`: it gates components, not props,
tokens, subpaths or removed classes.

---

## [0.1.0] — 2026-07-31

First public release of all six packages: `@aurea-uds/tokens`, `@aurea-uds/core`,
`@aurea-uds/icons`, `@aurea-uds/fonts`, `@aurea-uds/react` and `@aurea-uds/contracts`.

Numbering starts at `0.1.0` rather than the `1.7.0` inherited from the originating kit — the
reasoning is in [ADR-0014](decisions/0014-primeira-versao-publica-0-1-0.md), along with the written
condition for leaving `0.x`.
