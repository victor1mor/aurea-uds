# Aurea no nativo — o documento irmão

- **Escrito em:** 15/08/2026, fechando o item **O2** do [`PLANO-1.0.md`](PLANO-1.0.md) §19.
- **Estado:** nasceu como **proposta**; em 15/08/2026 o Victor autorizou e fechou as **Etapas 1,
  2 e 3** ([ADR-0027](../decisions/0027-a-cor-no-alvo-nativo.md) ·
  [ADR-0028](../decisions/0028-unistyles-como-motor-de-estilo-nativo.md)).
🔴 **AS TRÊS LINHAS QUE VINHAM AQUI ESTAVAM TODAS FALSAS, e ficaram falsas por onze dias.** Elas
diziam *"do Lote 1 em diante continua NÃO AUTORIZADO"*, *"o `check 39` reprova se
`packages/native/src/` ganhar qualquer arquivo além dos três"* e *"nenhuma linha de componente foi
escrita"* — enquanto o pacote tinha **51 componentes publicados no npm**. **É o defeito que a §7
deste arquivo nomeia, cometido no lugar mais lido dele: o cabeçalho.** Corrigido em 14/09/2026.

- ✅ **A ETAPA 4 ACABOU, e o alvo nativo está PUBLICADO.** `@aurea-uds/native@0.8.7` no npm desde
  18/09/2026 — a `0.8.6`, a `0.8.5` e a `0.8.4` em 17/09, a `0.8.3` e a `0.8.2` em 16/09, a
  `0.8.1` em 13/09 —, com **57 componentes** (número MEDIDO: as exportações de inicial maiúscula das duas
  portas do pacote, menos os dois provedores e as duas constantes). São os Lotes 0 a 7, o `Chart`,
  as **três de 15/09/2026** (`InputGroup`, `InputGroupAddon`, `PasswordField`), o **`Separator` de
  16/09** e o **`Tabs` de 17/09**. As cinco últimas saíram da tela de ENTRAR do app e dos pedidos
  dele, não de plano nenhum daqui.
  ⚠ **E o `CLAUDE.md` chegou a ter TRÊS contagens diferentes ao mesmo tempo (56, 55 e 54)** — esta
  linha dizia 55. *Contagem escrita à mão diverge sozinha*; as quatro linhas passaram a sair da
  mesma medição, em 17/09/2026.
  🔴 **E existe um OITAVO achado, de 16/09/2026, que NÃO está publicado: o botão de limpar do
  `Combobox` morava dentro do gatilho.** Ele quebra **só no iPhone**, e é por isso que o smoke
  inteiro passou por cima — **nenhum aparelho deste projeto rodou iOS, em lote nenhum**. Está
  consertado e **publicado na `0.8.4`** (17/09/2026).
  🔴 **E varrer o pacote atrás da FORMA desse defeito achou mais DOIS que ninguém tinha
  reportado** — o "X" do `Alert` (publicado assim por quatro versões) e o `Chart`, cuja moldura
  apagava as faixas que carregam os VALORES. O **`check 43`** nasceu daí. Isso, mais o **`Tabs`**
  e cinco pedidos do consumidor, **saiu na `0.8.5`, publicada em 17/09/2026**.
  ✅ **E a `0.8.6`, do mesmo dia, fechou os dois últimos pedidos que travavam tela:** o
  `SegmentedControl` e o `Tabs` **rolam** quando não cabem — com a barra aparecendo só quando há o
  que rolar — e nasceu o **`Card variant="brand"`**, o primeiro amarelo grande do sistema.
  ⚠ **A regra dele mora no TIPO:** `variant="brand"` **exige `action`**, porque o combinado é
  *"amarelo só para pedir ação"* e regra escrita apaga. Sem `action`, não compila.
  🔴 **E ELE SAIU PELA METADE — a `0.8.7` (18/09/2026) é o conserto, achado pelo consumidor em UM
  DIA.** A `0.8.6` mediu o contraste do TEXTO dentro do amarelo e parou ali; a mesma frase valia
  para **linha e glifo**. Medido: contorno de campo **2,43/2,24**, fundo de campo **1,61** no
  claro, glifo de botão **1,83** no escuro — e as QUATRO aparências do `action` que o tipo EXIGE,
  todas invisíveis (**1,61 · 1,00 · 1,38 · 1,83**). **O cartão obrigava a ter um botão e não dava
  a ele como existir.**
  ✅ Não entrou paleta nova: as três superfícies neutras do sistema reprovam contra o amarelo no
  tema claro (**1,91 · 1,73 · 1,61**), e **uma única cor passa de 3:1 nos dois temas** — a que o
  cartão já mandava para dentro. Três decisões saíram contra a intuição: o campo **perde o fundo**;
  a tinta **vence o inválido** (o vermelho mede 1,86 ali, menos que ela); e o foco vira
  **espessura**, porque no tema escuro a cor de foco É o amarelo.
  🔴 **E uma armadilha achada escrevendo o teste, não lendo o código:** o `Modal` desenha por cima
  de tudo mas continua sendo **filho** de quem o escreveu, então a folha de um `Select` dentro do
  cartão herdaria a tinta. **Camada visual e árvore de contexto são coisas diferentes**, e só a
  segunda manda na cor. Os seis sobrepostos do pacote passaram a cortar a herança.
  ⚠ **Alcance DECLARADO e não completo:** leem a tinta o `Text`, a família de campo, o `Button` e o
  `IconButton`. Componente fora dessa lista continua quebrado lá dentro, e **gate estático nenhum
  vê** — slot é ponto cego, o mesmo do `check 43`.
  ⚠ **E a `0.8.3` é PATCH DE CONSERTO, com sete defeitos que o consumidor mediu no `dist`
  publicado da `0.8.2`** — entre eles o tom da marca escrevendo texto ilegível no tema claro
  (1,73:1 contra os 4,5 exigidos) e o `Input` descartando `autoComplete` e `textContentType` em
  silêncio. **Nenhum dos 1430 testes pegou qualquer um.** Os quatro bloqueios da §5.2
  caíram; o `check 39` mudou de pergunta (hoje ele cobra que **todo nome exportado** apareça em
  teste, seguindo o `exports` do `package.json`).
- ✅ **"Provado em aparelho" vale para os 51 — no ANDROID.** O modo `lote7` do
  `apps/native-smoke/` rodou em 12/09/2026 e **sete das oito** perguntas passaram. ⚠ **A oitava é
  do iOS**, e está nomeada na §8.6.
- 🔴 **NENHUM APARELHO DESTE PROJETO RODOU iOS — em lote nenhum, desde 15/08/2026.** É a lacuna
  mais velha e mais larga do alvo, ela **não é do Lote 7** (é do projeto), e desde 13/09 há um
  obstáculo a mais: o Expo Go 57 do iOS **exige login nos dois lados**. §8.7.
- **A história de como se chegou aqui** está nas §5.1 a §5.6 (o plano) e na §7 (o diário). **Se
  você só tem cinco minutos, leia a §7.**
- ⚠ **O MOTOR MUDOU no mesmo dia.** O Victor decidiu **`StyleSheet` puro** —
  [ADR-0037](../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md), que **supera a
  ADR-0028** (Unistyles). Onde este documento discute Unistyles, é registro do que se mediu, não
  do que vale. **A camada de tema é nossa.**
- **O que já estava decidido e este documento NÃO reabre:** a arquitetura do
  [`ROADMAP.md`](historia/ROADMAP.md) Fase 7, decidida pelo Victor em 18/07/2026 — **só os tokens
  atravessam**.

---

## 1. Por que ele existe agora, e não antes

O `ROADMAP.md` Fase 7 mandava **não detalhar antes da hora**, com uma razão que continua boa:
especificar cedo grava pesquisa vencida. E o `PLANO-1.0.md` §20 registrava que o pacote nativo
*"cabe num documento irmão"* — irmão que **nunca foi escrito**.

Duas coisas mudaram, e as duas são medidas, não previsões:

1. **Existe um app Expo/React Native de verdade** num dos projetos do Victor, hoje.
2. **Existe um app de consumidor final planejado** em React Native.

O gatilho que o próprio ROADMAP escreveu — *"não construir enquanto não houver app RN
consumindo"* — deixou de ser hipotético. O que este documento faz é tirar a especificação do
limbo; o que ele **não** faz é começar.

---

## 2. A arquitetura, que não está em discussão

> **Filosofia (A): compartilhar SÓ os tokens.** O que viaja para o mobile é a camada de tokens
> (DTCG, já neutra). O resto não viaja: `@aurea-uds/react` roda sobre Base UI (DOM), o TanStack
> renderiza para DOM, e `<video>`/`<input type=file>` são web.
>
> — [`ROADMAP.md`](historia/ROADMAP.md), Fase 7, 18/07/2026

Logo `@aurea-uds/native` é um pacote **irmão**, não um wrapper do React web: componentes próprios
sobre `View`/`Text`/`Pressable`, consumindo `@aurea-uds/tokens`.

A opção (B) — "universal" via Tamagui — foi **recusada** na mesma decisão, porque trocaria o Base
UI e o CSS do core inteiros pelo modelo de outra biblioteca. Só se reabre se o Victor quiser
relitigar.

**Nada na pesquisa de 15/08/2026 contraria essa decisão.** Pelo contrário: ver §4.

---

## 3. O que existe hoje deste lado, medido

Medido no `packages/tokens/src/aurea.tokens.json` em 15/08/2026:

| `$type` | quantos | forma do `$value` |
|---|---:|---|
| `color` | **152** | `{colorSpace:"oklch", components:[L,C,H]}` |
| `dimension` | **85** | `{value, unit}` — `rem` e `px` |
| `number` | 14 | número puro (entrelinhas, pesos) |
| `fontFamily` | 3 | array de fallbacks |
| `duration` | 3 | `{value, unit:"ms"}` |
| `shadow` | 2 | objeto composto |
| `cubicBezier` | 2 | array de 4 números |
| **total** | **261** | dos quais **44 são alias** (`{…}`) |

Hoje o `build-tokens.mjs` emite **um** alvo: `aurea.tokens.css` (274 linhas). O `ROADMAP.md` já
antecipa o que falta e a frase dele continua exata:

> Não são "os mesmos valores" crus — os atuais têm seletores DOM, fallbacks web e dimensões
> `rem`/`px`; o objeto RN exige **transformação**.

---

## 4. A pesquisa de 15/08/2026

Feita porque o item mandou, e porque o `ROADMAP.md` diz **"re-pesquisar no dia"** sobre a
ferramenta de estilo. Datada de propósito: isto vence.

### Plataforma — a incerteza acabou

- A **New Architecture** (JSI + Fabric + TurboModules) **deixou de ser opcional**. É padrão desde
  RN 0.76 / Expo SDK 52, e no **Expo SDK 55 / RN 0.83 a arquitetura legada foi removida** — não dá
  mais para desligar. O SDK 54 foi o último em que dava.
- Compatibilidade do ecossistema: **~85%** dos pacotes populares do npm já suportam; ~15% seguem
  presos à Bridge.

**Consequência para a Aurea:** a preocupação que o ROADMAP registrou em 18/07 ("New
Architecture/Fabric, Expo, tudo em fluxo") **envelheceu bem** — o fluxo parou. Um pacote novo
nasce direto na arquitetura nova, sem período de transição a suportar.

### Ferramenta de estilo — a pista do ROADMAP se confirmou, e apareceu uma nova

O ROADMAP tinha uma pista, não uma escolha: *"Unistyles v3 é o par filosófico mais próximo"*.
A pesquisa confirma, e pela razão certa: **o Unistyles não tem componentes** — o próprio time diz
que a ideia é você construir o seu design system em cima. É exatamente a relação que a Aurea tem
com o Base UI na web.

Números de desempenho publicados (iOS, quanto menor melhor): **StyleSheet 49,74 ms** · Uniwind Pro
beta 57,11 ms · **Unistyles 66,40 ms** · Uniwind 81,36 ms · **NativeWind 197,22 ms**.

Novidade que não existia em 18/07: o **Uniwind**, do mesmo time do Unistyles, ligação Tailwind
feita sobre Fabric. Não muda a recomendação — a Aurea não escreve utilitário Tailwind — mas
importa por um motivo: ele tem **tier pago** ("Pro beta"), e o modelo comercial do fornecedor de
uma dependência é coisa que se olha antes, não depois.

**O NativeWind está fora** por medida, não por gosto: 4× o custo do StyleSheet, e o modelo dele é
utilitário de classe — o mesmo que o `typography` do `ui-main` ensinou a recusar no item L5.

### O ponto que a pesquisa NÃO resolveu, e que decide 152 tokens

**Nenhuma fonte confiável diz que o `StyleSheet` do React Native aceita `oklch()` nativamente.**
O que se acha são **bibliotecas** anunciando suporte (styled-components/native, NativeWind, HeroUI)
— e biblioteca suportando não é plataforma suportando.

Isso importa mais aqui do que importaria em outro projeto:

> O amarelo primário `oklch(0.795 0.184 86.047)` é **invariável entre temas** e está declarado
> **INTOCÁVEL** no [`CLAUDE.md`](../CLAUDE.md).

Converter oklch → sRGB é **mapeamento de gamute, e é com perda**. Um adapter que faça isso em
silêncio pode entregar no aparelho um amarelo que não é o amarelo da marca — e ninguém veria, porque
o gate de pixel desta casa mede o **navegador**.

~~**Isto não se decide por pesquisa. Mede-se num aparelho**, e é a primeira etapa da proposta.~~

> ⚠ **A frase acima envelheceu no mesmo dia em que foi escrita, e ficou tachada em 31/08/2026.**
> Decidiu-se por pesquisa — sem aparelho nenhum. A Etapa 1 mediu a perda rasterizando em canvas no
> navegador, e a Etapa 2 rodou o **próprio interpretador de cor do React Native dentro do Node**
> (`node scripts/measure-color-rn-parser.mjs`), que é JavaScript compartilhado entre iOS e Android.
> Os "três pontos de hardware" caíram assim, sem celular. Ver §5, Etapas 1 e 2.
>
> **O que sobra de aparelho é outra coisa:** `PlatformColor()`/`DynamicColorIOS()`, que não passam
> pelo interpretador. Essa continua sendo a única hipótese viva de gamute largo.

---

## 5. A proposta — quatro etapas, na régua das Fases 4/5

Cada uma é fechada, cabe numa sessão e termina com resultado escrito. **As três primeiras foram
autorizadas e feitas em 15/08/2026. A Etapa 4 não.**

### ~~Etapa 1 — Medir a cor antes de prometer qualquer coisa~~ ✅ **FEITA em 15/08/2026**

Autorizada pelo Victor e fechada na [ADR-0027](../decisions/0027-a-cor-no-alvo-nativo.md). O comando
é `node scripts/measure-color-native.mjs`.

**Ela admitia terminar em "hex serve". Não terminou** — e o que decidiu não foi opinião:

- **A superfície real são 95 valores, não 152.** Os 152 tokens de cor são **95 `oklch` + 42 alias
  + 15 já em sRGB**.
- **20 dos 95 estouram o gamute sRGB**, o amarelo da marca entre eles. Ele corta para `#f0b100`, a
  **ΔEok 0,02247** — e o limiar de perceptível publicado para ΔEok é **≈ 0,02**. Cai em cima, não
  abaixo.
- **Numa tela sRGB o hex não perde nada:** o navegador corta igual, provado lendo o pixel
  rasterizado — **95 de 95, diferença máxima de 1/255**.
- **A perda é nas telas de gamute largo**, que é o que os aparelhos têm: em `display-p3` os 20
  rasterizam diferente. Amarelo: sRGB `rgb(240,177,0)` · P3 `rgb(230,179,19)`.

**Decisão:** o alvo nativo **não recebe hex sozinho**. O adapter emite o valor de gamute largo onde
a plataforma suporta, e hex como **fallback** — e o hex é exatamente este, porque é byte a byte o
que a web já pinta.

> ⚠ **CORRIGIDO no mesmo dia:** medido depois que o React Native **não aceita** nenhum formato de
> gamute largo por string de estilo, em nenhuma versão até a 0.87. Então `hex` não é fallback — é o
> único caminho. Ver a §"A correção" da [ADR-0027](../decisions/0027-a-cor-no-alvo-nativo.md).

**Não rodou em aparelho** (Windows, sem SDK Android; simulador iOS exige macOS) — e a ADR diz o
que ficou por medir. O que travava a decisão, porém, era saber **se havia perda e de quanto**, e
isso foi respondido sem aparelho. **E o que sobrou também acabou sendo respondido sem aparelho** —
ver a correção citada acima.

**E uma armadilha ficou registrada:** a primeira versão da validação imprimiu "0 de divergência"
tendo comparado **zero** cores — lia `getComputedStyle`, e o Chromium devolve `oklch()` sem
resolver. Trocou-se para canvas 2D, que obriga o motor a rasterizar em bytes.

### ~~Etapa 2 — O adapter de tokens, e só ele~~ ✅ **FEITA em 15/08/2026**

Autorizada pelo Victor. **Zero componente**, como o item exigia. O alvo é
`@aurea-uds/tokens/native` (`packages/tokens/dist/aurea.tokens.native.js`), gerado pelo mesmo
`build-tokens.mjs` — o parser do DTCG é um só — e cobrado pelo **check 36**, provado contra o
defeito (token novo na fonte sem regravar o alvo → reprova).

**O que sai:** 103 tokens de `base`, os dois temas, as três densidades, mais `tracking` (5) e
`breakpoints` (5) em objetos próprios. Cada cor em **três formas** — `hex`, `p3`, `oklch` —,
porque a [ADR-0027](../decisions/0027-a-cor-no-alvo-nativo.md) decidiu que hex sozinho não serve.

**Quatro impedâncias que o CSS esconde e o alvo nativo teve de encarar:**

1. **Não há cascata.** O alias `{brand-yellow}` vira `var(--brand-yellow)` no CSS e o navegador
   resolve no uso. Aqui é resolvido no build, por grupo.
2. **Não há `rem`.** `1rem = 16dp`, e o 16 foi **medido** no navegador (raiz sem `font-size`
   declarado), não presumido.
3. **Não há `em`.** `letterSpacing` no React Native é absoluto, então os 5 `tracking` saem como
   **razão** para o consumidor multiplicar pelo `fontSize`. Emitir dp daria certo num tamanho só.
4. **Não há `@media`.** Os 5 breakpoints saem à parte, declarados como **não** sendo para
   `StyleSheet`.

**A sombra ficou melhor do que o previsto.** O plano dizia `shadowColor`/`elevation`, que perdem
`spread` e divergem entre os sistemas. Medido: o **RN 0.76+ tem `boxShadow`** com sintaxe do CSS,
inclusive `spreadDistance` — e a Nova Arquitetura é obrigatória desde o Expo SDK 55, então o
mapeamento é **1:1 e sem perda**.

**Dois defeitos achados, e um deles é do arquivo de tokens.** `base.text-muted` estava declarado
`$type: "dimension"` apontando para uma **cor** — o CSS nunca reclamou porque alias vira `var()`
antes de o tipo ser olhado, e a página do catálogo desenhava uma **régua** para uma cor. Corrigido
na fonte, e o CSS saiu **byte a byte idêntico**, o que prova que a correção não mexeu no alvo web.
O segundo era meu: o gerador emitia `undefined` em silêncio nesse caso, e `JSON.stringify`
descartava a chave — agora ele **morre**.

**Seis tokens do `base` saem DENTRO de cada tema**, e não no `base`: `text-muted` e os cinco
`oracle-*` apontam para folhas que só existem por tema. Em JS não há ligação tardia; um valor
estático escolheria um tema e erraria no outro.

**As matrizes de cor foram provadas contra o rasterizador**, como as da Etapa 1: o `p3` emitido e
o `oklch` da fonte pintados no mesmo canvas P3 dão a mesma cor — **95 de 95, diferença máxima de
1/255**. A primeira rodada acusou 229 de divergência e era o **harness** reconstruindo a cor sem o
alfa, não o gerador.

**~~O que continua faltando, e é de aparelho~~ — CAIU no mesmo dia.** Eu tinha marcado três
pontos como "precisa de celular". Dois deles não precisavam, e o terceiro está respondido:
`node scripts/measure-color-rn-parser.mjs` roda o interpretador de cor do próprio React Native no
Node e mostra que ele **recusa** `color(display-p3 …)`, `oklch()`, `lab()` e até `color(srgb …)` —
nas versões **0.81.5 e 0.87.0**, e o interpretador é JavaScript compartilhado entre iOS e Android.
Aceita hex, `rgb()`, `hsl()` e `hwb()`.

**Consequência:** `hex` não é o *fallback* — é o **único caminho vivo**. Os campos `p3` e `oklch`
ficam como intenção registrada, não como API consumível. E a perda de ΔEok 0,0225 no amarelo, em
tela de gamute largo, deixa de ser evitável: é **teto da plataforma**, e fica declarada. Detalhe
inteiro na §"A correção" da [ADR-0027](../decisions/0027-a-cor-no-alvo-nativo.md).

**O que sobra de fato não medido:** `PlatformColor()`/`DynamicColorIOS()`, que buscam cor por nome
num catálogo nativo e não passam pelo interpretador. É a única hipótese viva de gamute largo, e é
ela que uma etapa futura investigaria.

**Uma coisa não se decidiu, de propósito:** `fontFamily` sai como a família **pedida**
(`IBM Plex Sans`), não como o nome que o RN aceita — o iOS quer o nome PostScript e o Android o
nome do arquivo. E o `@aurea-uds/fonts` hoje só tem **`.woff2`**, que o React Native não lê. O
nome final se decide quando os arquivos nativos entrarem.

### ~~Etapa 3 — A decisão de ferramenta, aí sim~~ ✅ **FEITA em 15/08/2026** · ⚠ **REVISTA em 31/08/2026**

> **O motor é o `StyleSheet` puro**, por decisão do Victor em 31/08/2026 —
> [ADR-0037](../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md), que **supera a
> ADR-0028**. A camada de tema é nossa: contexto e hook.
>
> **O que a Etapa 3 mediu continua inteiro, e foi o que decidiu a troca.** Ela nunca existiu para
> confirmar a escolha — existiu para medir o custo dela. O custo, medido, é o que abaixo está
> escrito, e é o que pesou contra ela mesma.

Autorizada pelo Victor ("PODE IMPLEMENTAR a Etapa 3 com Unistyles") e fechada na ADR-0028. Medido
no pacote instalado: **3.3.0, licença MIT** (compatível), React Native ≥ 0.76 no contrato e ≥ 0.78
na documentação, Nova Arquitetura.

**O custo que a recomendação escondia:** não é uma dependência, são **cinco** — incluindo
`react-native-reanimated` e `react-native-nitro-modules`, os dois nativos. E **não roda no Expo
Go** — que, medido o plano do consumidor em 31/08, virou conflito direto (§5.3).

**E ele não destrava a cor:** o `peerDependencies` traz o mesmo `@react-native/normalize-colors`
que a correção da ADR-0027 mediu recusando gamute largo. Assunto fechado antes de ser aberto — e
**esta parte não muda com a troca de motor**: o interpretador é o mesmo com ou sem Unistyles.

**O achado que derrubou a escolha:** o Unistyles tem **um** eixo de tema e a Aurea tem **dois** —
tema × densidade, seis combinações. As `variants` dele são por folha de estilo, não globais, então
não servem. As duas saídas declaradas na ADR **obrigavam um provider nosso de qualquer jeito** — e
foi isso que fez o que ele comprava encolher até não pagar os cinco peers.

**A lição de método, e ela é a razão de a Etapa 3 ter valido a pena mesmo tendo sido revertida:**
medir o custo de uma escolha já feita não é burocracia. Foi a medição desta etapa — não uma
pesquisa nova — que deu à Etapa 4 tudo o que ela precisou para decidir o contrário.

### Etapa 4 — Os primeiros componentes, guiados pelo consumidor

**NÃO AUTORIZADA.** O que está escrito abaixo é o **plano** dela, levantado em 31/08/2026 a pedido
do Victor, com o consumidor real na frente. Nenhuma linha de componente foi escrita.

Não os 103. Os que o app que já existe usa — e essa lista se **mede** no app, do jeito que a Parte
M mediu os consumidores da web. `BUILDING.md` vale inteiro: referência antes de escrever, escopo
menor que o da referência, travas 21 a 24.

---

## 5.1 O consumidor, lido em 31/08/2026

O Victor mandou ler o plano de construção do **app nativo do primeiro consumidor** — o mesmo projeto
do [`CONSUMIDOR-1.md`](CONSUMIDOR-1.md), agora na versão React Native — e disse: *"veja se através
dele você analisa e descobre se não vai precisar de mais componentes, tenho certeza que sim."*

> ⚠ **O plano do consumidor NÃO entra neste repositório, e nem o nome dele.** Ordem do Victor em
> 31/08/2026: *"Aurea não pode ter menção sobre outros projetos — apesar de falar aqui, documentação
> não pode conter."* O que está escrito abaixo é o que a Aurea **precisa saber**: quantas telas, que
> peças, que moldura. O produto, o domínio e o ramo ficam de fora. **Não reconstitua** — se precisar
> do contexto, pergunte a ele.

**Ele tem razão, e por um motivo que não é o esperado.** Não é que faltem variantes: é que o
React Native não tem `<p>`, não tem cascata de tipografia, não tem sprite de SVG externo e não tem
`<input type=file>`. **A Aurea vai precisar de componentes que a versão web nunca precisou ter.**

### O que o documento dele é, antes de qualquer conclusão tirada dele

Lido inteiro (777 linhas). **Ele se declara HISTÓRICO no próprio cabeçalho**, em duas notas: uma de
07/07/2026 dizendo que cita tecnologia que já saiu do projeto, e uma de 02/08/2026 dizendo que a
**Fase 1 dele — o PWA — foi removida inteira**. O Victor confirmou em 31/08: *"é isso mesmo, PWA vai
morrer."*

Consequência prática, e ela é só uma: **aquele documento é fonte de escopo, não de autorização.** As
sete features e a moldura mobile continuam valendo — foram desenhadas contra um produto que já
existe e já roda na web. A pilha e a sequência de lançamento dele, não: são de abril de 2026.

> ⚠ **Aqui eu errei, e a correção fica registrada.** A primeira versão desta seção transformou isso
> num "achado": o plano condiciona a fase React Native à fase PWA — *"só executar após a Fase 1
> validar hábito mobile"* —, a fase PWA foi removida, logo o portão nunca disparou, logo eu não sabia
> se o app nativo estava autorizado.
>
> **Estava, e o Victor já tinha me dito na mesma conversa: *"o app é React Native"*.** A decisão veio
> dele, agora, não de um documento de abril. Eu levantei como dúvida aberta uma coisa que já estava
> respondida, e ainda anunciei como descoberta.
>
> É o erro que a regra do topo do [`CLAUDE.md`](../CLAUDE.md) manda cortar dos **dois** lados: duvidar
> também do defeito que você acha que achou. Fica aqui em vez de ser apagado porque a próxima sessão
> vai reler o mesmo cabeçalho histórico e sentir a mesma vontade de tratá-lo como bloqueio.

### O escopo real do app, e ele é pequeno

**Sete features entram, cinco saem.** Traduzidas para vocabulário neutro — a forma é o que nos
interessa, e a forma sobrevive à tradução:

| entra | forma, que é o que nos importa |
|---|---|
| painel do item principal | tela de leitura densa: métricas, histórico, avisos |
| dois tipos de lançamento | dois formulários curtos, um diário e um periódico |
| anexo por **câmera nativa** | captura, permissão, prévia — nada disso é `<input type=file>` |
| avisos com **push nativo** | lista + contador de não lidos |
| consulta a catálogo externo | busca e exibição de um valor de referência |
| **biometria** (FaceID/digital) | chamada de sistema + tela de bloqueio |

**Fora:** conteúdo editorial, catálogo completo, comparador, busca geral e administração — tudo que
é aquisição por SEO, que é web e continua web.

E o diagnóstico daquele plano diz que **a experiência web já existe inteira** — lista, cadastro,
painel, onboarding de 3 passos, os dois lançamentos, avisos e anexo. O app nativo **reencena telas
que já foram desenhadas**, contra a mesma API. Isso é ótimo para nós: o inventário de componentes
não é adivinhação.

O plano ainda especifica a moldura mobile, e ela é literal:

- **navegação inferior fixa** com quatro abas, **contador de não lidos**, e o botão central abrindo
  uma folha com as opções de lançamento;
- **formulários de 1 tela**, com **teclado numérico automático** nos campos de medida e moeda;
- **alvos de toque ≥ 48px**;
- **pull-to-refresh** na lista e no painel;
- **feedback tátil** na confirmação;
- **splash screen**.

---

## 5.2 Os quatro bloqueios medidos hoje, antes de qualquer componente

Todos com comando atrás, porque a regra do topo do [`CLAUDE.md`](../CLAUDE.md) manda.

### ~~1. As fontes não atravessam — `@aurea-uds/fonts` é 100% `.woff2`~~ ✅ **FECHADO no Lote 0, 02/09/2026**

> **Resolvido**, e a solução trouxe uma decisão de API que ninguém tinha visto:
> [ADR-0039](../decisions/0039-uma-familia-por-peso-no-nativo.md).
>
> Os 11 `.ttf` estáticos entraram em `packages/fonts/files-native/` (1,91 MB) e saem pelo subpath
> `@aurea-uds/fonts/native`. **Nenhum canal do npm publica TTF do IBM Plex** — medido baixando os
> tarballs do `@ibm/plex` (6.4.1 e 5.2.1), dos três pacotes por família e do `@fontsource`: zero
> TTF em todos. Vieram do `@expo-google-fonts/ibm-plex-*@0.4.1`, e **a linhagem confere**: o
> `woff2` que já estava no repositório é byte a byte o `latin` do `@fontsource`, e os dois vêm do
> Google Fonts.
>
> **O que a medição achou e o plano não previa:** só Regular, Italic e Bold moram na família
> `IBM Plex Sans`. O **Medium é `IBM Plex Sans Medium`** e o SemiBold, `IBM Plex Sans SemiBold` —
> famílias próprias. Então `fontFamily:"IBM Plex Sans"` + `fontWeight:"600"` **não devolve o
> SemiBold**, e falha em silêncio. `fontFamily` passa a receber o **nome PostScript**, lido da
> tabela `name` de cada arquivo pelo próprio gerador. Gate: **check 37**.

O texto abaixo é o diagnóstico original, mantido como registro do que se mediu.

### 1. As fontes não atravessam — `@aurea-uds/fonts` é 100% `.woff2`

```
find packages/fonts -type f \( -name '*.woff2' -o -name '*.ttf' -o -name '*.otf' \) | wc -l   → 11
find packages/fonts -type f -name '*.woff2' | wc -l                                          → 11
```

Onze arquivos, **todos `.woff2`, zero `.ttf`/`.otf`**. O React Native não lê `woff2`. A Etapa 2 já
tinha registrado a ponta solta (§ *"Uma coisa não se decidiu, de propósito"*); agora ela é bloqueio
datado: **sem `.ttf` no pacote, o IBM Plex não aparece no aparelho** e o app cai na fonte de sistema
— que é exatamente a identidade que o `CLAUDE.md` declara intocável.

**Custo:** re-empacotar o Plex em `.ttf` (o OFL 1.1 permite), decidir o nome que cada plataforma
aceita (iOS quer o nome PostScript, Android o nome do arquivo) e provavelmente **um subpath novo**
`@aurea-uds/fonts/native`. É trabalho de pacote, não de componente — e vem **antes** do primeiro
componente, não depois.

### ~~2. Os ícones não atravessam — é um sprite de 1,2 MB com 2571 símbolos~~ ✅ **FECHADO no Lote 0, 02/09/2026**

> **Resolvido pela [ADR-0038](../decisions/0038-um-componente-por-icone-sobre-react-native-svg.md),
> executada.** `packages/native/icons/` tem **2571 módulos** (3,46 MB, 5146 arquivos com os
> `.d.ts`), gerados do mesmo `svg/32` do Carbon que alimenta o sprite da web. **Uma fonte, dois
> alvos** — e o **check 38** cobra que os dois listem exatamente os mesmos nomes.
>
> **A hipótese de "menos de 40 ícones" ficou para trás, e ainda bem:** o caminho profundo
> (`@aurea-uds/native/icons/<nome>`) faz o subconjunto ser escolhido pelo APP, no `import`, sem
> lista curada para manter. Quem importa 40 carrega 40.
>
> ⚠ **E a varredura da ADR-0038 tinha um furo, achado ao executá-la.** Ela declarava
> `<g>` · `<switch>` · `<foreignObject>` = **zero**. Medido agora no `svg/32` do `@carbon/icons`
> **11.84.0**, que é o instalado: **10 arquivos** trazem
> `<switch><foreignObject …/><g>DESENHO</g></switch>` — sujeira de exportação do Adobe
> Illustrator. O contador anterior procurava `<g ` **com espaço**, e estes são `<g>` sem atributo.
> Não muda a decisão: o gerador desdobra o `switch` e descarta o `foreignObject`, que é
> **exatamente o que o navegador faz** (a extensão Adobe do `requiredExtensions` não existe em
> lugar nenhum). Mas confirma a regra da casa — `grep` que mede a coisa errada mente com a mesma
> confiança de sempre.
>
> **Um segundo achado, e esse teria estragado 84 ícones:** `fill="none"` aparece em **91**
> lugares, e é o contorno INTERNO dos glifos `--filled`. A cláusula 2 da ADR mandava "injetar a
> cor explicitamente"; injetar em tudo teria pintado esse miolo e **coberto o desenho**. O
> gerador injeta onde o `fill` **falta**, nunca por cima — e o teste está escrito contra esse
> defeito.

O texto abaixo é o diagnóstico original, mantido como registro do que se mediu.

### 2. Os ícones não atravessam — é um sprite de 1,2 MB com 2571 símbolos

```
ls -la packages/icons/dist/            → aurea-icons.svg, 1 265 973 bytes
grep -o '<symbol' packages/icons/dist/aurea-icons.svg | wc -l   → 2571
```

Na web o `Icon` renderiza `<use href="…#id">` contra esse arquivo único — é o que a ficha diz
(*"Carbon icon primitive rendered from a sprite"*) e é o que o `useSpriteUrl` expõe. **No React
Native não existe esse caminho:** o `react-native-svg` resolve `<Use>` dentro da mesma árvore, não
contra um arquivo externo por URL.

**Três saídas, e nenhuma é grátis:** um componente por ícone (2571 módulos — inviável inteiro,
viável para um subconjunto), um parser de string SVG em runtime (custo por render), ou uma fonte de
ícones. **Decisão da Etapa 4**, e o app provavelmente usa menos de 40 ícones — o que faz
o subconjunto a hipótese mais barata.

### 3. Não existe `Text` na Aurea, e no nativo ele é obrigatório

```
ls packages/contracts/registry/ | grep -iE 'text|head|title|typo'
  → ContextMenu, Prose, Textarea      (nenhum componente de texto)
```

Na web a tipografia **cai por cascata**: `body { font-family:var(--font-ui); font-size:var(--text-md) }`
no `aurea.css:7`, e todo `<p>`/`<span>`/`<h1>` herda. O `Prose` é a pele do texto longo, não a
primitiva — a própria ficha diz *"não é o parser"*.

**No React Native não há cascata de estilo de texto através de `View`, e não há `<p>`.** Toda string
precisa de um `<Text>` com estilo explícito. Então o pacote nativo precisa de uma primitiva de texto
com a escala (`--text-xs`…`--text-3xl`, os pesos e as entrelinhas) que **a web nunca precisou
declarar como componente**.

É o exemplo mais limpo do que o Victor suspeitou: **não é a mesma lista com menos itens; é uma lista
diferente.**

### 4. O Base UI não atravessa, e ele está embaixo de 32 fichas

```
python -c "…dependencies.engine…"   → 32 fichas declaram um motor @base-ui/react
grep -rl 'from "@base-ui/react' packages/react/src/   → 9 módulos
```

As famílias inteiras de **sobreposição** (Dialog, Drawer, Popover, Tooltip, DropdownMenu,
ContextMenu, HoverCard, Menubar), de **campo** (Form, Field, Combobox, NumberField, OTPField,
RadioGroup, SegmentedControl) e as **abas** ficam sem motor no nativo. Não é porta: é **decisão de
motor nova**, componente a componente, sobre `Modal`/`Pressable`/`AccessibilityInfo` do próprio RN.

E há três motores menores na mesma situação, medidos por import:

| motor | módulo | o que cai |
|---|---|---|
| `recharts` | `chart.tsx` | Chart, ChartLegend, ChartTooltip |
| `react-day-picker` | `calendar.tsx` | Calendar |
| `@tanstack/react-table` | `data-grid.tsx` | DataGrid |
| `codemirror` | `code-editor.tsx` | CodeEditor |
| `@xyflow/react` | `graph.tsx` | DependencyGraph — **já declarado `native: "n-a"`** |

O `@tanstack/react-table` é headless e **em tese** roda em RN; os outros quatro renderizam DOM. Não
vou afirmar que o TanStack funciona sem ter rodado — fica como **hipótese a medir**, não como fato.

---

## 5.3 O conflito que a leitura do plano revelou — Expo Go × Unistyles ✅ **RESOLVIDO em 31/08/2026**

> **O Victor decidiu, e foi em uma palavra: *"StyleSheet"*.** É a **saída 2** das três abaixo. Está
> registrada na [ADR-0037](../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md), que
> **supera a ADR-0028** — o motor do nativo é o `StyleSheet` puro e a camada de tema é nossa.
>
> **O Expo Go volta a valer**, e com ele o passo 1 da sequência do consumidor.
>
> O texto abaixo é o diagnóstico original, mantido como registro do que se mediu e do que se pôs na
> mesa. A ADR-0037 é honesta sobre um ponto que importa: **não houve benchmark em aparelho**. O que
> decidiu foram os números publicados, o contrato dos pacotes e este conflito.

O plano do consumidor escreve a sequência de lançamento assim:

> ```
> 1. MVP Android (Expo Go para teste interno)
> 2. Beta interno (EAS Build → APK → grupo de teste)
> ```

E a [ADR-0028](../decisions/0028-unistyles-como-motor-de-estilo-nativo.md), medida no pacote instalado,
diz o contrário na primeira consequência:

> **Etapa 4 começa com desenvolvimento em build próprio, não Expo Go.** Não é escolha: Unistyles
> tem código nativo.

**As duas coisas não podem valer juntas.** O passo 1 do plano do app deixa de existir se o motor de
estilo for o Unistyles — vai-se direto ao passo 2 (EAS Build), com a fricção que isso traz para
teste interno.

**Isto é decisão do Victor, e são três saídas honestas:**

1. **Pular o Expo Go** e desenvolver em development build desde o primeiro dia. Custo: cada troca de
   dependência nativa exige rebuild; o "manda o link pro amigo testar" fica mais lento.
2. **Trocar o motor** — voltar ao `StyleSheet` puro, que roda no Expo Go, é **mais rápido**
   (49,74 ms contra 66,40 medidos na ADR) e não traz os cinco peers. Custo: a camada de troca de
   tema vira contexto e hook nossos, escritos e mantidos à mão. **A ADR-0028 já deixou essa porta
   aberta por escrito** — *"se a Etapa 4 medir que os cinco peers custam mais do que a camada de
   tema vale, o `StyleSheet` puro volta à mesa"*. Seria ADR nova.
3. **Aceitar o Unistyles e ignorar a sequência do plano**, que é histórico de abril de 2026 e já
   está desatualizado em outras cinco coisas.

**Não recomendo por gosto, recomendo pelo que foi medido:** a razão que a ADR-0028 deu para o
Unistyles é filosófica (ele não traz componentes) e o que ele compra é *um lugar único para o tema
morar*. Mas o achado do eixo duplo (abaixo) diz que **esse lugar único não serve como está** — ou se
registram seis temas, ou se põe um provider nosso por cima. **Nas duas saídas a gente escreve
provider próprio de qualquer jeito.** Se o provider é nosso nos dois caminhos, o que o Unistyles
ainda compra encolhe, e os cinco peers ficam mais caros em comparação.

**Então a saída 2 é a que eu levo à mesa** — e ela é reabertura de ADR, o que exige a sua palavra,
não a minha. Se você preferir manter o Unistyles, a saída 1 é coerente e o único custo é o Expo Go.

---

## 5.4 ~~Tema × densidade~~ — **A DECISÃO DEIXOU DE EXISTIR em 31/08/2026**

Ela era herdada da ADR-0028: o Unistyles tem **um** eixo de tema; a Aurea tem **dois** — tema
(dark/light) × densidade (compact/comfortable/spacious). Seis combinações, e as `variants` dele são
por folha de estilo, não globais, então não serviam. Ou se registravam seis temas, ou se punha um
provider nosso por cima.

**Com a escolha do `StyleSheet` (§5.3), isso evapora.** Não há motor com eixo único para contornar:
o tema mora num contexto nosso, e dois eixos são dois campos num objeto. Não há seis temas a
registrar, nem eixo a esconder de ninguém.

**O que sobra desta seção é uma observação de produto, e ela continua útil:** um app de consumidor
final **não expõe densidade ao usuário**. Ninguém abre Ajustes para trocar `comfortable` por
`compact` num app de registro pessoal. A densidade ali é **uma escolha do app, feita uma vez**, não
um eixo vivo — o que significa que o provider do Lote 0 pode nascer simples, com a troca em runtime
existindo mas sem UI que a exercite.

⚠ **Este era o segundo pilar da recomendação de trocar de motor**, e vale registrar o círculo: o
eixo duplo obrigava um provider nosso **nas duas saídas**, e foi isso que fez o Unistyles perder o
que ele comprava. A decisão que ele criava morreu junto com ele. Está escrito na
[ADR-0037](../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md).

---

## 5.5 Os lotes, derivados das telas reais do consumidor

Ordem de dependência, não de importância: cada lote só existe se o anterior existir. **Os números
são de componentes a escrever, não de fichas a copiar** — nenhum destes atravessa de graça.

### ~~Lote 0 — o pacote, antes do primeiro componente~~ ✅ **FEITO em 02/09/2026**

Autorizado pelo Victor (*"PODE IMPLEMENTAR o Lote 0"*) e entregue com **zero componente de
interface**, como o lote exigia. O que existe agora, e cada número sai de comando:

| | |
|---|---|
| `@aurea-uds/fonts/native` | 11 `.ttf` (1,91 MB) + o mapa de nomes **medido** na tabela `name` — [ADR-0039](../decisions/0039-uma-familia-por-peso-no-nativo.md) |
| `@aurea-uds/native/icons/*` | **2571** ícones sobre `react-native-svg`, gerados do Carbon — ADR-0038 |
| `@aurea-uds/native` | `AureaProvider` · `useAureaTheme` · `useAureaTokens` · `resolverTokens` — ADR-0037 |
| gates novos | **check 37** (fontes) · **38** (ícones) · **39** (o Lote 0 não vira Lote 1 sozinho) |
| testes | **18** novos, cada um provado contra o defeito que ele pega |
| tarball | o pacote entrou no `check-pack.mjs`; `native:11` linhas de baseline |

**O que o Lote 0 aprendeu e os lotes seguintes herdam** — três coisas, e nenhuma estava no plano:

1. **A precedência tem de ser explícita.** 8 tokens existem no `base` E na densidade, 1 no `base` E
   no tema. No CSS a cascata resolve; aqui alguém escolhe, e a ordem é `base < tema < densidade`.
   **O defeito seria invisível em `comfortable`** — é a única densidade cujos 8 valores são
   idênticos aos do `base` (medido) —, e só apareceria em compact/spacious.
2. **Cada peso de fonte é uma família.** Ver a §5.2.1, fechada.
3. **`fill="none"` não é ausência de cor.** Ver a §5.2.2, fechada.

**O que ele NÃO fez, de propósito:** nenhum componente, e o `check 39` guarda essa fronteira.

### ~~Lote 1 — o chão~~ ✅ **COMPLETO em 03/09/2026 — os 10**

Autorizado pelo Victor (*"PODE IMPLEMENTAR o Lote 1"*) **depois** de o smoke test passar no
aparelho — a ordem dele de 02/09, cumprida. Cada número abaixo sai de comando.

| componente | estado | o que ele decidiu |
|---|---|---|
| **`Text`** | ✅ | `size`·`weight`·`font`·`tone`·`leading`·`italic`·`align`·`tracking`. **Nunca emite `fontWeight`** (ADR-0039): o peso escolhe a **família** |
| **`Screen`** | ✅ **por último** | o único que precisou de dependência nova: parou o lote, voltou para o Victor (`BUILDING.md` §3) e ele autorizou — [ADR-0040](../decisions/0040-o-screen-adota-o-safe-area-context-como-peer.md) |
| `AureaProvider` | ✅ já existia | veio no Lote 0; ganhou o registro de ícones |
| `Icon` | ✅ | **importa zero ícone** — o registro é do app (ADR-0038, cláusula 4). Nome ausente: não desenha e avisa em `__DEV__` |
| `Stack` · `Cluster` · `Grid` | ✅ | `gap` real do RN 0.71+. O `Grid` é **flexWrap, não CSS Grid**, e o JSDoc diz isso em voz alta |
| `Card` | ✅ | 6 variantes, raio 22 do token, sombra por `boxShadow` |
| `Button` · `IconButton` | ✅ | `appearance` × `tone`, sem atalho `variant`. O alvo de toque é a decisão que segue abaixo |

**O que o Lote 1 decidiu, e cada uma nasceu de um defeito ou de uma medição:**

1. **`criarFolha` existe por causa dos 182 ms.** A folha é memoizada por par (tema, densidade), e
   é **pública** — o consumidor tem o mesmo problema. É a lição do smoke test virada em API, não
   comentário no fim de uma ADR.
2. **O alvo de toque não estica a caixa pintada.** Três das cinco alturas de controle (26, 30,
   36 dp) são menores que `--target-min`. O `Pressable` recebe `minHeight: 44`; a caixa pintada
   **mantém a altura do token**. Esticar o desenho seria mexer na identidade, que é intocável.
   ⚠ **E a linha antiga desta tabela dizia "alvo ≥ 48px (o plano exige)".** O token da Aurea é
   **44** (`--target-min`, WCAG 2.5.5/2.5.8, medido em `aurea.tokens.json`). O 48 era do plano do
   consumidor, lido em 31/08 e transcrito para cá como se fosse nosso. **Vale o token.**
3. **`hitSlop` foi recusado de propósito.** Ele aumenta a área do toque e **não é lido pelo
   TalkBack** — deixaria o alvo pequeno justamente para quem usa leitor de tela.
4. **`forwardRef` não entra**, como já não entra na web desde o React 19: `ref` é prop.
5. **O `Screen` resolve a borda no NATIVO, não no JavaScript.** A biblioteca oferece o hook
   `useSafeAreaInsets` e o componente `SafeAreaView`; a maioria dos textos recomenda o hook, e
   aqui ganhou o componente — por leitura do fonte C++, não por gosto. O modo `additive` **soma**
   o inset ao padding da folha dentro do cálculo do Yoga, **antes do primeiro quadro**; com o hook
   haveria um quadro com o conteúdo embaixo do entalhe e um re-render a cada rotação. Detalhe na
   [ADR-0040](../decisions/0040-o-screen-adota-o-safe-area-context-como-peer.md).

**O gate mudou de pergunta.** O **check 39** guardava *"o Lote 0 não vira Lote 1 sozinho"*; ele
reprovou toda vez que foi testado e **caiu quando a autorização chegou** — tirá-lo estava escrito
na mensagem do Victor. No lugar entrou a mesma pergunta um degrau acima: **todo valor exportado
pelo barril precisa aparecer no teste do alvo nativo.** Ele já pegou um de verdade
(`IconRegistryProvider`, exportado sem teste). O alvo nativo não tem gate de navegador nem ficha
no registry — o teste unitário é o único controle que sobra.

| | |
|---|---|
| arquivos novos em `packages/native/src/` | 6 — `estilos.ts`, `text.tsx`, `icon.tsx`, `layout.tsx`, `actions.tsx`, `screen.tsx` |
| testes | **31** novos, cada um nomeado contra o defeito que pega; o total medido pelo vitest é **1178** |
| defeitos injetados e reprovados | **9** — `hitSlop` no lugar de `minHeight` · esticar a caixa pintada · escolher peso por `fontWeight` · tirar a memoização · só a borda de cima · padding no próprio `ScrollView` · `...rest` no rolador · conteúdo sem `flexGrow` · fundo em hex cravado |
| baseline do tarball | `native:23` linhas |
| peers do pacote | **quatro** — `react`, `react-native`, `react-native-svg`, `react-native-safe-area-context` |

### ~~Lote 2 — o dashboard, que é só leitura~~ ✅ **COMPLETO em 08/09/2026 — os 10**

Autorizado pelo Victor (*"PODE IMPLEMENTAR o Lote 2"*). `KPI` · `Progress` · `Status` · `Badge` ·
`Alert` · `Skeleton` · `Spinner` · `EmptyState` · `DataState` · `Avatar`.

**Nenhum deles tem motor** na web — são marcação e CSS —, e foi por isso que ele era o lote de
menor risco depois do chão. O risco que ele tinha era outro, e apareceu.

**As cinco coisas que o lote decidiu, e nenhuma saiu de gosto:**

1. **Uma tabela de frases entrou, e ela é do tamanho do que existe.** `Alert`, `Status`,
   `EmptyState` e `DataState` falam sozinhos — os sete estados universais, o vazio, o erro, o
   rótulo do `Spinner`. A da web tem **mais de 200 chaves** porque serve 124 componentes; a daqui
   tem **quatro**, e cada chave nova nasce com um componente que a usa. `<AureaProvider strings>`
   e `useAureaStrings()`, com `ptBR` **copiado** do `pure.tsx` — duas traduções do mesmo estado é
   como um sistema passa a falar duas línguas.
2. **`useReduceMotion` existe porque o nativo perderia uma acessibilidade que a web tem de
   graça.** O `aurea.css:2128` zera toda animação sob `prefers-reduced-motion`; no RN não há
   cascata, então quem anima **pergunta**. Ele devolve `boolean | null`, e o `null` não é preguiça
   de tipo: `isReduceMotionEnabled()` é assíncrono, e começar em `false` faria **um quadro de
   animação tocar na cara de quem pediu que não tocasse**. Quem anima espera saber.
3. **O `Spinner` NÃO é o `ActivityIndicator`.** Ele desenharia a rosquinha do Material no Android
   e a coroa do iOS — duas aparências que o `CLAUDE.md` proíbe em voz alta. O anel de borda com
   `borderRightColor: transparent` reproduz o `.spinner` do CSS, e gira nos mesmos 700 ms.
4. **O estado universal ACOMPANHA o dado no `DataState`, não o substitui.** `stale`, `partial` e
   `offline` querem dizer que o dado está aí e tem ressalva — esconder o dado troca informação
   parcial por informação nenhuma. Só `loading`, `error` e `empty` tomam o lugar. **Isso não está
   no CSS**; veio do fonte.
5. **O `KPI` é um `Card`.** O `.kpi` do CSS é uma coluna com `gap:5` e nada mais; quem lesse só o
   CSS entregaria a peça sem superfície, sem borda e sem o raio 22 da identidade. `markup.tsx:105`
   é que conta.

**Três coisas da web NÃO atravessaram, e cada uma tem razão escrita:**

| | por quê |
|---|---|
| `titleAs` do `EmptyState` | escolhe entre `h2`/`h3`/`h4`/`p` para não saltar nível de título. **No RN não há hierarquia de títulos** — a prop não teria efeito, e prop sem efeito é promessa falsa |
| `image`/`imageAlt` do `Badge` | nenhuma das sete telas do consumidor medido (§5.1) usa selo com miniatura. Prop sem consumidor é superfície pública mantida de graça |
| `role="group"` do `KPI` | **o `accessibilityRole` do RN não tem `group`** — medido na lista. O que agrupa é `accessible`, e é o que está lá. Inventar `summary` porque o nome parece próximo diria uma coisa errada |

⚠ **E o gate reprovou a si mesmo.** Ao provar o **check 39** contra o defeito — tirar um
componente do teste e esperar reprovação — ele **passou verde**. Dois defeitos nele, os dois
achados por essa prova e não por leitura:

- o padrão era `\} from` com espaço único, e a lista de export do Lote 2 quebra a linha antes do
  `from` — **a linha inteira era invisível, e os dez teriam entrado sem controle nenhum**;
- ele filtrava por convenção de nome (inicial maiúscula, `use…`, `criar…`), então
  `formatarContagem`, `gravidadeDoEstado`, `defaultStrings` e `ptBR` saíam do pacote sem teste
  algum os obrigar a existir. **Convenção de nome não é critério; ser público é.**

| | |
|---|---|
| arquivos novos em `packages/native/src/` | 4 — `feedback.tsx`, `display.tsx`, `strings.ts`, `movimento.ts` |
| testes | **29** novos, cada um nomeado contra o defeito que pega; o total medido é **1207** |
| defeitos injetados e reprovados | **6** — `Alert` interrompendo sempre · `DataState` escondendo o dado · animação ignorando a preferência · `Badge` ancorado deixando de ser decorativo · `Status` offline virando só outra cor · `KPI` deixando de ser `Card` |
| baseline do tarball | `native:31` linhas |

### ~~Lote 3 — a moldura de navegação~~ ✅ **COMPLETO em 08/09/2026 — os 5**

Autorizado pelo Victor. `BottomNav` · `Topbar` · `NavList` · `Stepper` · e o **puxar-para-atualizar**,
que virou `onRefresh`/`refreshing` no `Screen` do Lote 1 em vez de componente próprio — no RN o
gesto pertence ao rolador, e um componente à parte seria uma casca sem dono.

**O tema deste lote é ACESSIBILIDADE TRADUZIDA, e é onde ele quase errou.** A web navega com
`<nav>`, `<a>` e `aria-current`; o React Native não tem nenhum dos três. Cada tradução é uma
escolha que pode sair errada de um jeito que ninguém vê:

| a web usa | existe no RN? | o que ficou, e por quê |
|---|---|---|
| `<nav>` (landmark `navigation`) | **não** | a barra recebe só `accessibilityLabel`. **Não há landmarks** no Android/iOS; inventar `toolbar` porque sobrou diria uma coisa que não é |
| `role="banner"` no `Topbar` | **não** | sem papel. Declarar `header` seria pior: no RN ele quer dizer *título*, não *cabeçalho de página* |
| `<a>` | `accessibilityRole="link"` | é o que separa "leva a outro lugar" de `button`, que promete ação nesta tela |
| `aria-current="page"` | `accessibilityState={{selected}}` | o par honesto |
| `role="list"` | **sim** | atravessa inteiro, no `NavList` e no `Stepper` |
| `color-mix(in srgb, primary 12%, transparent)` | **não** | hex de **oito** dígitos, `#RRGGBBAA`, com o alfa calculado. Um token "parecido" teria pintado outra cor |

⚠ **E o erro mais fácil de cometer estava a UMA PALAVRA de distância.** O RN tem
`accessibilityRole="tab"` e `"tablist"`, e usá-los na barra inferior seria natural. A ficha da web
proíbe em voz alta, e a razão atravessa sem uma vírgula de diferença:

> *"A tab swaps a panel inside the page, a bottom bar changes page. Giving `role=tablist` to a menu
> makes the screen reader promise arrow keys that lead nowhere."*

Há um teste cujo único trabalho é reprovar essa palavra.

**Duas coisas que a web carrega no CSS e aqui são conta explícita:**

1. **A barra de gestos.** Na web é `padding-bottom: max(--space-1, env(safe-area-inset-bottom))`
   (`aurea.css:270`); aqui é `Math.max(space1, inset.bottom)`. **Pelo máximo, não pela soma** —
   somar daria espaço a mais no aparelho que tem a barra e o certo no que não tem.
2. **O contador pendura no ÍCONE, não no item.** É defeito visto em tela: o Victor viu o número
   cobrir o nome inteiro em 17/08/2026, e a caixa `marca` existe só para dar a ele um canto.

**O que NÃO atravessou, com razão escrita:** o `position: sticky` do `.topbar` — ele não existe no
RN, e uma barra que fica parada é uma barra **fora do `ScrollView`**, montada pela tela. Não é
omissão: é a composição correta na plataforma, e o JSDoc mostra como.

| | |
|---|---|
| arquivos novos em `packages/native/src/` | 1 — `navigation.tsx` |
| testes | **17** novos, cada um nomeado contra o defeito que pega; o total medido é **1224** |
| defeitos injetados e reprovados | **5** — a barra virando `tab` · o respiro somando em vez de tomar o máximo · o contador saindo do ícone · a linha indisponível sumindo da árvore · o `RefreshControl` pendurado sem `onRefresh` |
| strings novas | 2 — `bottomNavLabel` e `stepperLabel`, **copiadas** do `pure.tsx`. Cada chave nova nasce com um componente que a usa |
| baseline do tarball | `native:33` linhas |

⚠ **A fronteira segue de pé, e é a primeira linha do módulo:** a Aurea **não entrega roteamento**.
Estes componentes recebem `items` e `current` e avisam por `onPress`; quem troca de tela é o app.

~~| **`ScrollView` com pull-to-refresh** | **NOVO.** O plano pede na lista e no painel |~~
✅ **Feito, e NÃO como componente:** virou `onRefresh`/`refreshing` no `Screen`. No RN o gesto
pertence ao rolador, então uma peça à parte seria uma casca sem dono. O `RefreshControl` é do
próprio React Native — **não é dependência nova**.

⚠ **`Tabs` continua fora deste lote**: é Base UI (§5.2.4) e o app tem bottom nav, não abas.

### ~~Lote 4 — registrar, que é o coração do app~~ ✅ **COMPLETO, os 13, em 08/09/2026**

Autorizado pelo Victor (*"PODE IMPLEMENTAR o Lote 4"*). Entram `Field`, `Label`, `Input`,
`Textarea`, `Select`, `Switch`, `Checkbox`, `Radio`, `SegmentedControl`, `Form` e o
`KeyboardAvoiding`. O seletor de data e a câmera **pararam o lote** — os dois exigem dependência
nova, e o `BUILDING.md` §3 manda parar. **O Victor autorizou as duas no mesmo dia** (*"ok faça
tudo"*), e elas entraram como `DatePicker` e `PhotoInput`, por `@aurea-uds/native/system` (§7).

⚠ **E a primeira coisa é uma correção deste documento, medida em 08/09/2026.** A linha abaixo
dizia *"sete destes são Base UI na web — este é o lote caro"*, e o `CLAUDE.md` repetiu. **São DOIS
de dez:**

```
Form              -> @base-ui/react
SegmentedControl  -> @base-ui/react/radio-group
os outros oito    -> engine: null
```

O sete veio da §5.2.4, que lista a **família de campo** do Base UI inteira — Form, Field,
Combobox, NumberField, OTPField, RadioGroup, SegmentedControl. **Quatro daqueles não estão neste
lote**, e o `Field` da Aurea não declara motor nenhum. O número era da família, não do lote, e a
frase misturou os dois. **É a mesma classe de erro que o `CLAUDE.md` chama de "medir, não
contar"** — e ela sobreviveu porque ninguém tinha rodado o comando.

**O lote é caro assim mesmo, por outro motivo — e este é real:**

| a web | o RN |
|---|---|
| `<label for>` + `id` liga rótulo e controle | **não existe.** O nome é uma STRING no controle, não uma referência a outro nó |
| `<select>` | **não existe.** É `Modal` + lista, exatamente o *"motor novo sobre `Modal`"* que a §5.2.4 previu |
| `<form>` com `submit` e validação de navegador | **não existe.** O `Form` daqui é o respiro, e nada mais |
| `:hover` na borda do campo | **não há ponteiro.** O foco continua, e é a única pista de qual campo o teclado alimenta |

⚠ **A tradução do `Field` é a decisão do lote.** Na web ele existe para resolver `htmlFor` —
`useId`, detecção de elemento rotulável, três casos de "não dono" achados por gate. Aqui ele
**empurra o nome, a dica e o estado de inválido para o controle por contexto**. Sem isso, cada
campo do app repetiria `accessibilityLabel` à mão, e é assim que metade dos formulários fica sem
nome para quem usa leitor de tela — **um defeito que não aparece na tela e não quebra nada**.

**Quatro coisas que o lote decidiu, e cada uma tem razão medida:**

1. **O `Switch` não é o `Switch` do React Native** — mesma razão do `Spinner` no Lote 2: ele
   traria o interruptor do Material no Android e o do iOS no iOS. As medidas são as do CSS:
   trilho de `altura × 7/6` por `altura × 2/3`.
2. **O `Select` é `button`, não `combobox`.** `combobox` promete um campo em que se DIGITA para
   filtrar; isto só abre uma lista. É o mesmo defeito do `tablist` no Lote 3, e a ficha da web
   induz ao erro — ela declara `combobox` porque lá o `<select>` É um.
3. **O `KeyboardAvoiding` escolhe o `behavior` por plataforma:** `padding` no iOS (a janela não
   encolhe), `height` no Android (o sistema já redimensiona). Um só nos dois lados deixa metade
   dos aparelhos com o botão de salvar embaixo do teclado.
4. **O visto do `Checkbox` é desenhado com duas bordas giradas −45°**, como no CSS, e não com um
   glifo — assim a peça não depende do registro de ícones do app.

**O que não atravessou, com razão escrita:** `orientation="horizontal"` do `Field` (numa tela de
360dp a grade de `12rem` deixa o controle com menos de metade da largura), `name` do `Radio` (o
agrupamento é do estado do app, não do DOM), e o `onSubmit`/`errors` do `Form` (não há `<form>`;
fingir a API criaria um `onSubmit` que nada dispara).

| | |
|---|---|
| arquivos novos em `packages/native/src/` | 1 — `inputs.tsx` |
| testes | **24** novos; o total medido é **1248** |
| defeitos injetados e reprovados | **6** — o `Field` não entregando o nome · o erro virando só texto vermelho · o `Select` declarando `combobox` · o `Modal` preso no botão voltar · um `behavior` só nas duas plataformas · o trilho do `Switch` com medida inventada |
| baseline do tarball | `native:35` linhas |

⚠ **E o dublê de teste tinha um buraco, achado por este lote:** `Animated.Value` não tinha
`setValue`, e o `Switch` o chama para SALTAR quando a pessoa pediu menos movimento. O teste
reprovava código certo — **a forma mais cara de um teste falhar, porque parece achado**.

**O que resta do lote original:**

Os dois formulários de 1 tela: `Field` · `Label` · `Input`
(com `keyboardType` numérico — o plano pede explicitamente para km/litros/valor) · `Textarea` ·
`Select` · `Switch` · `Checkbox` · `Radio` · `SegmentedControl` · `Form`, mais:

| | |
|---|---|
| **`KeyboardAvoidingView`** da Aurea | **NOVO.** Formulário de 1 tela com teclado numérico aberto é onde isso morde |

~~⚠ Sete destes são Base UI na web — este é o lote caro~~ · **ERRADO, e corrigido acima: são dois
de dez.**

✅ **`DatePicker` e `PhotoInput` FORAM FEITOS — o Victor autorizou as duas dependências em
08/09/2026** (*"ok faça tudo"*), inclusive a câmera, que eu tinha recomendado adiar. O lote fecha
em **13 de 13**.

| entrou | dependência | licença | Expo SDK 57 fixa | peer |
|---|---|---|---|---|
| `DatePicker` | `@react-native-community/datetimepicker` | **MIT** | 9.1.0 | **opcional** |
| `PhotoInput` | `expo-image-picker` | **MIT** | ~57.0.15 | **opcional** |

⚠ **Os dois NÃO saem pelo barril principal.** Eles vivem em `@aurea-uds/native/system`, pela
mesma razão que os 2571 ícones vivem em `./icons/*` — **ADR-0038**: sair pelo barril traria os
dois módulos NATIVOS ao grafo de todo app, inclusive de quem só quer um `Button`.

**A primeira versão tentou `require()` preguiçoso** dentro da função, para não criar caminho novo.
**Não presta, e foi o teste que mostrou:** o `require` escapa da resolução de módulo (o dublê não
era alcançado), o TypeScript não tipa o resultado, e a preguiça passa a depender de o bundler não
hastear o `require` — que é aposta na configuração do consumidor, a mesma que a ADR-0038 recusa. O
caminho profundo é preguiçoso **por construção**.

⚠ **E o gate teria deixado passar os dois componentes mais arriscados do pacote.** O check 39 lia
só o `index.ts`; com o caminho profundo, `DatePicker` e `PhotoInput` ficavam públicos e fora da
varredura. Ele passou a seguir o `exports` do `package.json`, que é quem define o que é público —
e a correção foi provada contra o defeito.

Detalhe das decisões de fluxo da câmera no §7.

### ~~Lote 5 — confirmar e avisar (4 + 1 novo)~~ ✅ **COMPLETO em 08/09/2026**

`Dialog` · `ConfirmDialog` · `Drawer` · `useToast` (que virou o par **`ToastHost`/`useToast`**),
mais:

| | |
|---|---|
| **`BottomSheet`** | **NOVO.** O plano diz que o botão central abre uma folha com as opções de lançamento. No idioma mobile isso é bottom sheet, não caixa centralizada |

⚠ **`Tooltip` não entra.** Não há hover no toque. Fica como decisão registrada, não esquecimento.

⚠ Os quatro são Base UI na web; no nativo o motor é o `Modal` do RN. **Medido no
`dependencies.engine` das quatro fichas, e desta vez o documento estava CERTO** — o contrário do
Lote 4, e é por isso que se mede dos dois lados.

⚠ **E o motor deu MENOS trabalho do que parecia e MAIS do que o CSS mostrava:** o `Modal` entrega
o confinamento de leitor de tela de graça (é uma janela do sistema), mas o papel `dialog` **não
existe no aparelho** — ver o §7, que é onde o achado deste lote mora.

### ~~Lote 6 — o resto do cockpit (3 + 1 a medir)~~ ✅ **COMPLETO em 09/09/2026 · e ele FECHA o plano**

`Timeline` (o histórico) · `DataList` (o valor de referência do catálogo externo) · `Table` → vira lista no telefone.

**Os três entraram.** Nenhum tem motor headless na web (`dependencies.engine: null` nas três
fichas, medido) — o trabalho foi de **semântica** e de **lista longa**.

⚠ **A `Table` virou lista de verdade, e a razão dobrou no meio do caminho:** o plano dizia "vira
lista no telefone" por causa da largura. Medindo, apareceu a segunda metade — **o papel `table`
não mapeia em plataforma nenhuma**, então a grade não se anunciaria como tabela de qualquer jeito.
Detalhe no §7.

⚠ ~~**`Chart` não atravessa**~~ ✅ **ELE ATRAVESSOU — 09/09/2026**, autorizado pelo Victor
(*"faz o Chart então"*) e registrado na
[ADR-0041](../decisions/0041-o-motor-de-grafico-do-nativo-e-nosso-sobre-react-native-svg.md).

A frase original estava certa no diagnóstico — *"pede motor novo sobre `react-native-svg`, é uma
decisão do tamanho de uma ADR"* — e a ADR foi escrita antes da primeira linha de código, que é o
que ela pedia. **Zero dependência nova**, e o escopo está declarado lá: linha, área e barra; sem
pizza, sem dois eixos, sem animação.

**O alvo nativo passa a ter 46 componentes, e não sobrou nada do plano.**

⚠ *Escrito em 09/09/2026 e verdadeiro naquele dia.* **Hoje são 51**: o Lote 7 nasceu em 11/09 da
fila do APP, não deste plano — §8. A frase fica porque o erro dela é a lição: *"não sobrou nada do
plano"* é verdade sobre um DOCUMENTO e nunca sobre um PRODUTO.

### O que fica fora, e por quê

`CodeEditor`, `DataGrid`, `BlockEditor`, `MediaPlayer`, `Gallery`, `CommandPalette`, `Menubar`,
`TreeView`, `Sidebar`, `AppShell` e as **16 fichas de AI & Agents** — nenhuma aparece nas sete
features do app. `DependencyGraph` e `Kbd` já estão declarados `native: "n-a"` nas fichas.

### E o que não é componente nenhum

Três das sete features do plano **não são trabalho da Aurea**, e é melhor dizer isso agora do que
descobrir no meio do lote:

- **Push nativo** — `expo-notifications` + serviço. Do lado da pele, o que a Aurea entrega já está
  nos lotes: o `Badge` de não lidos no `BottomNav` e a lista de alertas.
- **Biometria (FaceID/digital)** — `expo-local-authentication`. É uma chamada de sistema, não um
  componente. A tela de bloqueio que a envolve é `Screen` + `Button` do Lote 1.
- **Consulta ao catálogo externo** — é chamada de API contra o backend que já existe. A pele é
  `DataList` (Lote 6).

### A conta

| lote | componentes | dos quais novos |
|---|---:|---:|
| 1 — o chão | 10 | 2 |
| 2 — dashboard (leitura) | 10 | 0 |
| 3 — navegação | 5 | 1 |
| 4 — registrar | 13 | 3 |
| 5 — confirmar e avisar | 5 | 1 |
| 6 — resto do cockpit | 3 | 0 |
| **total** | **46** | **7** |

O Lote 4 conta 13 porque, além dos dez de formulário e do `KeyboardAvoidingView`, entram o
**seletor de data nativo** e a **câmera** — que os ⚠ acima explicam serem componentes novos, não
portas. O `Chart` **não** está na conta: é decisão do tamanho de uma ADR e pode ficar fora do MVP.

**46 contra 124 na web.** A ADR-0015 (cobertura antes da demanda) **não** se aplica aqui: no nativo
há consumidor medido, então vale o inverso — demanda antes da cobertura.

> ⚠ Esta tabela é **contagem à mão**, e o `CLAUDE.md` desconfia de contagem à mão com razão: a
> primeira versão desta linha dizia "~41" e estava errada em cinco. A soma está aberta acima para
> ser conferida. Ela vira número medido quando o Lote 0 criar o pacote e houver o que contar com
> comando.

---

## 5.6 A decisão dos ícones — pesquisa de mercado e desempenho, 31/08/2026

O Victor mandou pesquisar: *"qual padrão de mercado? o que performa melhor? PESQUISAR."* É a
**decisão 3**, a única que sobrou. Datada de propósito, como a §4: **isto vence.**

Método: busca para achar os candidatos, e **npm + leitura de fonte para confirmar cada afirmação**.
Onde só houve busca, está dito.

### Os quatro padrões que existem, medidos

| padrão | quem usa | mecanismo |
|---|---|---|
| **SVG por ícone** sobre `react-native-svg` | `heroui-native` (peer `^15.12.1`) · `@gluestack-ui/themed` (`>=13.4.0`) · `lucide-react-native` | um módulo por ícone; `sideEffects:false` para o bundler podar |
| **fonte de ícone**, um pacote por família | `@react-native-vector-icons/*` | glifo no pipeline de **texto** do sistema |
| **não entrega ícone** — recebe um renderizador | `react-native-paper` | `Settings.icon` é função de render (lido no fonte: `src/core/settings.tsx`) |
| **SVG → fonte no build** | `react-native-nano-icons` **0.2.1** | converte no build e pinta como glifo nativo |

Medições que sustentam a tabela:

- `lucide-react-native@1.38.0`: **1792 módulos de ícone**, 48 MB desempacotado, `sideEffects:false`,
  peer em `react-native-svg`. É a forma canônica do padrão 1.
- **`react-native-vector-icons@10.3.0` está DEPRECADO no npm.** A mensagem do próprio registro:
  *"has moved to a new model of per-icon-family packages"*. E, por busca, o `@expo/vector-icons`
  está no mesmo caminho.
- `react-native-paper` **não tem peer de ícone nenhum** — confirmado no `peerDependencies` e no
  fonte: o contexto tem `icon?: (props) => React.ReactNode`, com `MaterialCommunityIcon` de padrão.

### Desempenho — e a fonte ganha, com uma condição

O `react-native-svg` **não foi feito para ícone**: cada um vira subárvore React mais árvore de view
nativa, montada e reconciliada. Os relatos públicos são consistentes — lista com ~100 SVGs piscando,
tela levando 1–2 s. A fonte de ícone passa pelo pipeline de **texto** do sistema, que é muito mais
barato.

**Mas a diferença é função da quantidade.** As fontes convergem: com poucos ícones ela é mínima; ela
cresce com a contagem, e explode em lista longa. **O caso da Aurea aqui é o de poucos** — a moldura
do consumidor tem 4 ícones na barra inferior e um por linha de lista.

**O número mais forte que achei é do próprio fornecedor**, e por isso está marcado: o
`react-native-nano-icons` publica um gráfico de **1000 ícones multicoloridos** em `ScrollView` e
afirma ser **10–40× mais rápido** que o `react-native-svg`. É benchmark de quem vende, num cenário
que **não é o nosso**. Não repito como se fosse medida nossa.

### O `nano-icons` é sedutor e eu NÃO o recomendo — por três medições

Vem da **Software Mansion**, que mantém o próprio `react-native-svg` e o Reanimated. Isso lhe dá
crédito, e foi o que me fez olhar. Três coisas o tiram da mesa hoje:

1. **Está em `0.2.1`.** Pré-1.0 como fundação de ícone de um design system é a aposta que a
   ADR-0028 ensinou a não fazer sem medir o custo.
2. **Ele exige Expo.** O `peerDependencies` traz `expo: '*'` e `@expo/config: '>=9.0.0'`. A Aurea é
   biblioteca — forçar o framework do consumidor é o que a arquitetura da §2 recusa desde 18/07.
3. **⚠ Ele degrada exatamente onde o Victor acabou de decidir investir.** A documentação dele diz
   que *"no Expo Go os ícones são renderizados com um `<Text>` de fallback"*. O Expo Go foi **a
   razão** de a [ADR-0037](../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md) trocar
   o motor de estilo. Adotar o nano-icons devolveria pela porta dos ícones o problema que se acabou
   de tirar pela porta do estilo.

**Fica na lista de vigiar, não na de adotar.** Reabre-se quando chegar a `1.0` e se soltar do Expo.

### O que a Aurea já tem para isto, medido

```
npm view @carbon/icons version   → 11.87.0  (Apache-2.0)
find package/svg -name '*.svg'   → 2856 arquivos, 12 MB
```

**O `@carbon/icons` publica os SVGs crus**, mais um `metadata.json`. É a mesma fonte que o nosso
`packages/icons/build-icons.mjs` já consome para gerar o sprite da web. **Não existe pacote Carbon
para React Native** — `@carbon/icons-react-native` dá 404. Então gerar é obrigatório de qualquer
jeito; a pergunta é só o formato de saída.

### A recomendação, e ela mudou com a pesquisa

O que eu tinha levado à mesa era *"um componente por ícone, só o subconjunto"*. **A pesquisa
confirma a primeira metade e me faz largar a segunda**, porque o subconjunto curado resolve um
problema que o bundler já resolve sozinho:

> **Gerar um componente por ícone sobre `react-native-svg`, a partir do SVG do `@carbon/icons`** —
> que é exatamente o que fazem os dois design systems nativos vivos que medi (heroui-native e
> gluestack) e o `lucide-react-native`. Quem importa 40 ícones carrega 40.

Duas peças acompanham, e as duas saem da pesquisa, não de gosto:

- **A trava do Paper.** Aceitar um renderizador de ícone injetável — como `Settings.icon` — para o
  consumidor que já tem a própria pilha de ícone não ser obrigado a carregar a nossa. Custa pouco e
  é o padrão de quem tem mais quilometragem nisso.
- **O `<Icon name>` continua existindo**, para não quebrar a paridade de API com a web, mas como
  **registro que o app monta com o que usa** — não como mapa dos 2856, que anularia a poda.

### ⚠ A correção que a segunda rodada de medição obrigou — 31/08/2026

**A frase acima dizia `com sideEffects:false`, e eu a apaguei.** Ela apoiava a recomendação numa
coisa que eu não tinha medido: que o bundler poda sozinho. **No React Native, ele não poda
confiavelmente.**

Medido na documentação do Expo: o tree-shaking do Metro é **experimental**, ligado por três flags
(`experimentalImportSupport`, `EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH`, `EXPO_UNSTABLE_TREE_SHAKING`),
**só vale em produção**, e a própria Expo o descreve como *"very experimental, because it changes
the fundamental structure of how Metro bundles code"*. Só passou a ligado por padrão no **SDK 54**.

**Consequência direta:** um barril com 2856 ícones seria uma aposta na configuração do bundler do
consumidor. Se ele não podar, o app carrega os 2856.

**E o mercado já resolveu isso, do jeito que dá para copiar.** O `lucide-react-native` declara:

```
exports: { ".": …, "./icons": …, "./icons/*": … }
```

**Caminho profundo por ícone.** `import Add from '…/icons/add'` não depende de poda nenhuma — o
módulo que não é importado simplesmente não entra no grafo. O barril fica para conveniência de quem
tiver o tree-shaking ligado.

**Então a recomendação ganha uma cláusula, e ela é a parte que importa:** o pacote publica
`./icons/*`, e a documentação ensina o caminho profundo como forma padrão. **À prova de bundler por
construção, em vez de por configuração alheia.**

### O que a medição dos SVGs acrescentou — e é tudo a favor

Varridos os 2856 arquivos do `@carbon/icons`, contando quantos usam cada recurso:

| recurso | arquivos | o RN-SVG suporta? |
|---|---:|---|
| `<path>` | 2849 | sim (`<Path>`) |
| `<circle>` | 237 | sim (`<Circle>`) |
| `<rect>` | 5 | sim (`<Rect>`) |
| `stroke` | 150 | sim |
| `fill=` | 91 | sim |
| `opacity` | 16 | sim |
| `fill-rule` | 14 | sim (`fillRule`) |
| `<mask>` · `<use>` · gradiente · `<clipPath>` · `<g>` · `style=` | **0** | — |

**Três primitivas, nenhum recurso exótico.** A conversão é mecânica, não interpretativa — é o
melhor caso possível para gerar código.

**E uma pegadinha que a varredura desarmou antes de morder:** `currentColor` aparece em **zero**
arquivos. Na web a cor vem da *ausência* de `fill`, herdada por CSS. **No RN não há herança**, então
o gerador tem de injetar `fill={color}` explicitamente — trivial, mas silencioso: se ninguém
notasse, todos os ícones sairiam pretos.

**A grade de tamanhos:** 2753 em `32`, mais 68 em `16`, 9 em `20` e 8 em `24`. O alvo natural é o
32, com os pequenos entrando só onde o Carbon desenhou de propósito.

⚠ **O limite honesto: nada disto rodou em aparelho, nem em emulador.** É contrato de pacote, fonte
lido, varredura de SVG e benchmark de terceiro. O que a Etapa 4 tem de medir é se o
`react-native-svg` aguenta a lista do consumidor com um ícone por linha — e **se não aguentar, a
saída já está mapeada**: a mesma geração emite fonte em vez de componente, porque a fonte é o SVG do
Carbon nos dois casos.

---

## 6. O que este documento deliberadamente NÃO faz

~~**Não escolhe a ferramenta de estilo.**~~ **Escolheu** — Etapa 3, 15/08/2026,
[ADR-0028](../decisions/0028-unistyles-como-motor-de-estilo-nativo.md). E a §5.3 acima abre a
possibilidade de **reabrir**, com evidência nova (o conflito com o Expo Go e o provider que se
escreve nos dois caminhos), que é exatamente a condição que a própria ADR pôs.

~~**Não lista componentes.**~~ **Lista, desde 31/08/2026** — e lista porque a condição que proibia
foi cumprida: a §5.5 sai de um **consumidor medido** (o plano do app nativo do consumidor, lido inteiro), não
de demanda imaginada. É a mesma régua da
[ADR-0015](../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md), aplicada ao contrário porque
aqui existe o app que na web não existia.

O que continua valendo:

- **Não promete paridade.** Nunca houve promessa de que o nativo teria os mesmos componentes. As
  fichas declaram `platforms.native: "planned"` em 122 das 124 (`DependencyGraph` e `Kbd` são
  `n-a`), e isso é o teto honesto até a Etapa 4 rodar.
- **Não mexe em nada da web.** Nenhuma linha deste documento pede mudança no que já está
  publicado.
- **Não começa a Etapa 4.** Nenhum componente foi escrito, nenhum pacote foi criado, nenhuma
  dependência foi instalada. Fase nova exige autorização explícita.

---

## 7. O diário da construção

O diário desta seção — como cada defeito do alvo nativo foi achado, rodada por rodada — ficou no
repositório privado quando a Aurea foi aberta (24/09/2026). O que ele ensinou e continua valendo
está como regra no `CLAUDE.md` e nas ADRs.

---

## 8. O Lote 7 — as três lacunas que o CONSUMIDOR mediu, 11/09/2026

**Este é o primeiro lote do alvo nativo que não sai deste documento.** O §5.5 fechou o plano em
46 componentes e o `CLAUDE.md` escreveu, três vezes, *"não há Lote 7, e não sobrou nada do
plano"*. Estava certo sobre o plano e errado sobre a fila: **quem passou a mandar na fila foi o
app**, e ele bateu em três buracos na primeira tela que a pessoa toca.

A demanda chegou com prioridade medida — **1 > 2 > 3**, porque a 1 bloqueia o cadastro, a 2
bloqueia o lançamento diário e a 3 é acabamento. Os três itens foram **conferidos no código antes
de aceitos**, e um deles trazia uma premissa errada que só a conferência pegou.

### 8.1 As três, com o que a conferência achou

| | demanda | o que o código dizia | o que faltava |
|---|---|---|---|
| **1** | buscar num catálogo remoto de milhares de linhas, digitando | `Select`: *"O papel é `button` e não `combobox`"* (`inputs.tsx:576`) — honesto, e continua | `Combobox` e `SearchField` |
| **2** | moeda, medida decimal, contador acumulado | `Input`: só `keyboardType` (`inputs.tsx:232`), e o comentário já citava a demanda | `NumberField` e `Input.formatOnBlur` |
| **3** | foto principal do item, e galeria | `PhotoInput` ENTRA foto (`sistema.tsx:184`); nada MOSTRA. Só `Avatar`, que é outro papel | `Image` e `Gallery` |

E dois achados que a demanda não trazia:

- **O `Select` monta todos os itens** (`ScrollView`, `inputs.tsx:632`). Não é só que ele não deixa
  digitar: **um catálogo de milhares de linhas ali trava**, e isso é a razão material de o
  `Combobox` ser componente novo em vez de uma prop no `Select`.
- **A pergunta do item 2 partia de premissa errada.** Ela dizia *"no nativo não há blur
  equivalente garantido"*. Há: o `TextInput` tem `onBlur`, e o `Input` do Lote 4 já o declarava
  (`inputs.tsx:239-240`) e já o ligava (`inputs.tsx:278-279`). **O risco de verdade era outro**, e
  só apareceu quando a premissa errada saiu da frente — ver 8.3.

### 8.2 A lacuna 1 — e a divergência que ela obrigou

Registrada na **[ADR-0043](../decisions/0043-o-combobox-nativo-diverge-da-web-e-a-presenca-da-prop-e-a-chave.md)**.
O achado que decidiu tudo: **a combinação que o app pede não existe na web.**

    Combobox da web (seleção única)   -> filtro do Base UI, no cliente. Sem `onInputChange`
    MultiCombobox (múltipla)          -> tem `onInputChange` + `loading`, e desliga o filtro

Quem quer buscar no servidor **e** escolher um item só não tem componente lá. Copiar o contrato
de seleção única entregaria um filtro de cliente sobre milhares de linhas que o app nem baixou —
e o defeito seria silencioso: o servidor devolve `AÇUCAR CRISTAL 5KG`, o filtro local o descarta,
e a tela mostra "nenhum resultado" **sobre uma resposta cheia**.

**A regra: `onSearchChange` presente = a Aurea não filtra.** Presença de prop, não configuração.

E os papéis de acessibilidade foram **medidos no fonte do `react-native@0.87.1`**, porque o
Lote 5 ensinou que o RN aceita papel que não mapeia:

| papel | Android | iOS |
|---|---|---|
| `search` | `ReactAccessibilityDelegate.kt:461` → `android.widget.EditText` | `accessibilityPropsConversions.h:64` → `RCTConversions.h:120` → `UIAccessibilityTraitSearchField` |
| `combobox` | `ReactAccessibilityDelegate.kt:680` → `roleDescription` | **não há trait** |

`search` mapeia nos dois; `combobox` em um. Como o gatilho não aceita digitação — quem digita é
o campo da folha —, ele declara `button`, que é o que ele É nos dois sistemas.

### 8.3 A lacuna 2 — a ADR-0024 atravessa, e a VOLTA passa a existir

Registrada na **[ADR-0042](../decisions/0042-o-intl-e-o-formatador-do-nativo-e-a-volta-e-nossa.md)**.

Na web, o `NumberFieldRoot` do Base UI faz **as duas pontas**: chama o `Intl` na ida e lê o texto
de volta na volta. **Não há Base UI aqui** (ADR-0037). Então a ida vira chamada nossa — e a volta,
que ninguém precisou escrever na web, passa a existir: converter `R$ 1.234,50` em `1234.5` exige
saber qual caractere é o separador decimal daquele locale.

O `formatToParts`, que responderia direto, **é só Android** no motor JS do RN. Então os
separadores saem de **formatar um número-sonda** (`12345.6`) e ler o primeiro e o último
não-dígito — técnica que funciona onde `format` funciona, que é nos dois sistemas.

Três defeitos conhecidos do motor, e a biblioteca fica longe dos três: `notation: "compact"`
quebrado (recusado com aviso em `__DEV__`), `signDisplay: "always"` com moeda no Android, e
`format()` que não lê string como decimal (aqui só entra `number`).

### 8.4 A lacuna 3 — por que "usa o `Image` do RN" foi recusado

Era uma das três saídas possíveis, e a mais barata. Cai por medição: a ficha da web diz que o
componente *"reserva a caixa antes dos bytes chegarem, e cai para um substituto quando eles nunca
chegam"*. **O `Image` cru do RN não faz nenhuma das duas** — e o custo de não fazê-las já está
pago nesta casa: o `Avatar` foi medido em 31/07/2026 com URL quebrada e não caía no substituto.

`Gallery` reusa o que já existe: a grade é o `Grid` do Lote 1, e **ampliar é o `Dialog` do Lote
5** — a mesma trava que a web escreveu no item L2. Uma segunda superfície flutuante aqui seria
uma segunda linguagem.

### 8.5 O que o lote entregou, e o que ele custou

- **Cinco componentes** (`Combobox`, `SearchField`, `NumberField`, `Image`, `Gallery`), uma prop
  nova no `Input` (`formatOnBlur`), três auxiliares públicos de número e oito frases novas.
- **Zero dependência nova.** Tudo sobre `FlatList`, `Modal`, `TextInput` e `Image` do próprio RN.
  A trava do `BUILDING.md` §3.3 não precisou ser acionada.
- **Duas divergências declaradas da web** — a segunda e a terceira do alvo nativo, depois da
  `Table` do Lote 6: o contrato do `Combobox` e as props de busca.
- **47 testes**, e **seis deles provados CONTRA o defeito** e não só contra o estado atual:
  tirar a guarda do filtro remoto, trocar `FlatList` por `ScrollView`, formatar ao vivo, emitir a
  string em vez do número, esquecer a limpeza do timer no desmonte, esquecer o reset do estado de
  erro da imagem. **As seis mutações reprovaram**, que é o que torna os testes gate e não enfeite.

### 8.6 O que este lote NÃO fez, e fica declarado

- ✅ **O MODO `lote7` RODOU E PASSOU — 12/09/2026, Android 13 (API 33). SETE das oito.** O Victor
  rodou o roteiro e disse *"tudo OK e validado"*, e depois confirmou, perguntado: **só no Android.**

  🔴 **E perguntar mudou o número — para CIMA, não para baixo.** Eu tinha escrito, na tela e aqui,
  que **três** das oito só o iOS responderia. **Medido no fonte do RN, duas dessas três estavam
  erradas**, e a medição corrige a meu desfavor:

  | | o que eu disse | o que o fonte diz |
  |---|---|---|
  | **5** | *"só o iOS"* | no Android o VOLTAR **existe**, então as três saídas (escuro, VOLTAR, corpo que NÃO fecha) são TODAS exercitáveis lá. O que o iOS acrescenta é que **sem** VOLTAR o arrasto vira a única saída por gesto — e o arrasto é a **pergunta 4**, também respondida no Android |
  | **6b** | *"só o iOS"* | `ReactTextInputManager.kt:732-737` e `:1121-1125`: `numeric` no Android é `TYPE_CLASS_NUMBER \| FLAG_DECIMAL \| FLAG_SIGNED` — **tem menos**; `decimal-pad` é o mesmo **sem** `FLAG_SIGNED` — **não tem**. Os dois lados da pergunta desenham no Android |
  | **3** | *"só o iOS"* | ✅ **certo, e é a única.** No Android o `adjustResize` ajeita a folha **sem o conserto**, então "passou lá" não é evidência sobre o `KeyboardAvoiding` de 12/09 |

  **A lição é a mesma do resto deste arquivo, cobrada do outro lado:** *duvidar inclui duvidar da
  acusação*. Eu marquei três perguntas como impossíveis sem medir o Android, e isso teria jogado
  fora duas respostas boas que ele já tinha dado.

  **O que está PROVADO EM VIDRO, e o que é relato:**

  | | |
  |---|---|
  | **1** · o motor formata como o nosso | ✅ **eu confiro na foto** — `Intl` presente, decimal `","`, milhar `"."`, `normalize` NFD, `1234.5 -> 1.234,50`. Encerra a dúvida que sustentava o `NumberField` inteiro |
  | **8** a/b · a foto desenha, a quebrada cai no substituto | ✅ **eu confiro na foto** — glifo `image` do Carbon, mesma caixa, mesmo raio, **a grade não encolheu** |
  | **2 · 4 · 5 · 6 · 7 · 8c** | ✅ **relato dele**, sobre um build cujo commit a tela mostra |

  ⚠ **SOBRA UMA, e é a que bloqueia o cadastro: a 3, no iOS.** A janela de lá **não encolhe** com
  o teclado (`inputs.tsx:732-733`), e é para isso que a folha do `Combobox` foi envolvida num
  `KeyboardAvoiding` em 12/09 (`busca.tsx:393`). **Nenhum aparelho deste projeto rodou iOS até
  hoje** — nem neste lote nem em nenhum dos anteriores. Fica aberta, nomeada, e não bloqueia o
  Android.

  ✅ **E um conserto do mesmo dia está provado em VIDRO, não por construção:** o número dentro da
  cápsula do `NumberField` está no MEIO na vertical. Era a reclamação do Victor de horas antes, e
  a medição tinha dito que o componente estava certo nos dois alvos e que quem mentia era a
  vitrine. **A foto confirma a medição.**

- 🟡 ~~**PRIMEIRA RODADA — DUAS das oito.**~~ **Superado pela linha acima, no mesmo dia:** a
  primeira leva de fotos mostrou só as perguntas 1, 7 e 8, com `chamadas ao servidor: 0` e o campo
  de filtro vazio — ele tinha aberto a tela sem rodar o roteiro. **Registrar "duas de oito"
  naquele momento era o certo**, e é por isso que esta linha fica: o número subiu porque ele
  rodou, não porque eu afrouxei o critério.
  ~~**e as outras seis NÃO FORAM EXERCITADAS.**~~ Registrado assim de propósito: o "11/11" inflado de 09/09
  nasceu de tratar relato genérico como resultado por pergunta, e aqui as fotos dizem exatamente
  quais perguntas foram tocadas.

  ✅ **A 1 passou INTEIRA, e é a que eu confiro sozinho na foto** — o motor de JS do aparelho
  responde como o nosso: `Intl.NumberFormat` presente, decimal `","`, milhar `"."`, `normalize`
  NFD vivo, e `1234.5 -> 1.234,50`. **Isso encerra a dúvida que sustentava o `NumberField`
  inteiro:** os 1409 testes rodam em Node, e nada garantia que o motor do telefone trouxesse a
  tabela de `pt-BR`. Trouxe.

  ✅ **A 8 passou em dois terços, e também dá para conferir na foto:** as duas fotos boas
  DESENHAM (bytes de verdade, em `data:`, sem rede), e a terceira — quebrada de propósito — cai
  no SUBSTITUTO com a mesma caixa, o mesmo raio e o glifo `image` do Carbon dentro. **A grade não
  encolheu**, que é o que a proporção reservada existe para garantir. Falta o terço (c): a foto
  ampliada no `Dialog`.

  ✅ **E um conserto do mesmo dia está provado em VIDRO, não por construção:** o número dentro da
  cápsula do `NumberField` está no MEIO na vertical. Era a reclamação do Victor de horas antes, e
  a medição tinha dito que o componente estava certo nos dois alvos e que quem mentia era a
  vitrine. **A foto confirma a medição.**

  ⚠ **As seis restantes não foram exercitadas, e o instrumento diz isso sozinho:** o contador da
  pergunta 2 lê `chamadas ao servidor: 0` — ele escolheu um item sem digitar, então nem a espera
  de 250 ms nem o teclado foram tocados. As 3, 4 e 5 dependem da folha ABERTA e nenhuma foto a
  mostra. Na 6, os três campos desenham e o `+` soma certo, mas os teclados e o formato no blur
  exigem DIGITAR. Na 7 o campo está focado e VAZIO. **Nenhuma delas falhou; elas não aconteceram.**

- ~~**Nada foi provado em aparelho.** O `apps/native-smoke/` não foi estendido.~~ ✅ **O
  INSTRUMENTO EXISTE desde 12/09/2026** — o modo `lote7`, com **OITO** perguntas, e o app abre
  nele. ⚠ **Rodar continua sendo do Victor, na máquina dele:** `node apps/native-smoke/rodar.mjs`.
  ✅ **E ele RODOU em 12/09/2026 — sete das oito, no Android**, então *"provado em aparelho"* passou
  a valer para os **51** naquele alvo. A frase que estava aqui (*"enquanto ele não rodar, vale para
  46"*) foi escrita horas antes de ele rodar e envelheceu no mesmo dia.

  🔴 **E as quatro perguntas que esta linha listava estavam DUAS vezes erradas** — o que é a
  própria lição do §7 (corrigir onde se descobriu não é corrigir):
  1. *"a folha de **85%**"* — ela é de **90%** desde 12/09/2026. O 85 era um dos oito números
     inventados que o `CLAUDE.md` agora proíbe por escrito;
  2. *"o `decimal-pad` do iOS aceita **colar** `R$ 1.234,50`"* — a pergunta de verdade é outra e
     é pior: o `decimal-pad` do iOS **não tem tecla de menos**, então um campo com `min` negativo
     precisa de `numbers-and-punctuation` (`numero.tsx:255-259`). Colar é caso de borda; digitar
     um número negativo é a demanda.

  **Três das oito só se respondem no iOS**, e isso está dito na tela e no README: a janela de lá
  não encolhe com o teclado (a 3, que **bloqueia o cadastro**), não há botão VOLTAR (a 5), e o
  teclado decimal não tem menos (a 6). **Rodar só no Android responde cinco.**

  ✅ **E o modo trouxe um GATE, porque escrevê-lo achou um defeito meu:** eu chamei
  `<NumberField onChangeValue={...}>` — o certo é `onValueChange` — e **nada pegou**. O `App.js` é
  `.js`, o Metro não tipa, e o campo teria subido mudo no aparelho, sem erro no console. O
  `conferir-props.mjs` lê as interfaces do FONTE e confere prop a prop; virou o **passo 2** do
  `rodar.mjs` e custa menos de um segundo. Provado em cinco direções, inclusive a que importa:
  prop legítima herdada do React Native **não** pode reprovar.
  ⚠ **Ele nasceu cego duas vezes, como os outros três gates deste projeto:** montou o caminho do
  `react-native` a partir da raiz (com pnpm ele mora em `packages/native/node_modules/`), não
  achou nada e **saiu VERDE** dizendo "sem gate" para 14 componentes; e depois reprovou
  `accessibilityLabel` num componente que herda de `ViewProps` — falso positivo, que é o que faz
  um gate ser desligado. É o **quinto** gate do alvo nativo.
- **`MultiCombobox` não entrou** — é seleção múltipla, que a demanda não pede. Escopo novo é lote
  novo, não acréscimo silencioso (`BUILDING.md` §3.4).
- **As 46 fichas dos Lotes 0–6 continuam dizendo `native: "planned"`** no registry, e isso é
  falso desde 11/09/2026. As cinco deste lote foram corrigidas para `supported`; as outras são
  dívida anterior e **decisão do Victor**, não trabalho que este lote podia assumir sozinho.

---

## 8.7 O que 13/09/2026 acrescentou — e nada disso é componente

O Lote 7 fechou em 12/09. O dia seguinte não escreveu nenhuma linha de interface: publicou, e
**bateu em três paredes que não são da Aurea**. Ficam aqui porque as três voltam, e porque as três
me custaram uma rodada cada.

### 8.7.1 ✅ A `0.8.1` está PUBLICADA — e ela é patch de CONSERTO

`@aurea-uds/native@0.8.1`, e os **quatro defeitos que ela conserta chegaram à `0.8.0` publicada**:
o `NumberField` sem foco, o mesmo campo esticando em vez de abraçar, a folha do `Combobox` cega no
iOS, e dois números inventados (`"85%"`/`"45%"`).

🔴 **Nenhum dos 1409 testes, do `validate.py`, do build ou da publicação pegou qualquer um deles.**
Quem pegou foi o Victor **olhando imagem**, e o inventário da HeroUI. É a medida mais honesta do
que a suíte cobre e do que ela não cobre: ela prova comportamento, e **não prova aparência**.

**Conferido no REGISTRO, não no terminal** — e a diferença é o método, não a formalidade: os sete
leem `0.8.1`; o tarball **baixado de volta do npm** declara `"@aurea-uds/tokens": "^0.8.1"` e
carrega os quatro consertos (`focusStrong` 1×, `fullWidth` 5×, `KeyboardAvoiding` 2×, e `"85%"`
**0×**); o `check-published.mjs` instala os dois apps de prova do registro; e 5300 arquivos de
texto estão limpos de nome privado — varridos **importando** o `scan_text`/`decode_any` do
`validate.py`.

### 8.7.2 🔴 O iPhone exige LOGIN, o Android não — e isso reabre a pergunta 3

O Expo Go 57 do iOS recusa o projeto com *"You need to be signed in to Expo Go and Expo CLI to open
your project"*. Do changelog da Expo, palavras deles: *"you will need to be logged in to the same
account on both the terminal and in Expo Go"* e *"This requirement currently only applies to the
latest version of Expo Go for iOS"*.

**As três coisas que custaram tempo, todas medidas NO FONTE do `@expo/cli@57.0.24`** — a
documentação fala só de EAS e não responde nenhuma delas:

| | |
|---|---|
| **conta com Google não tem SENHA** | `npx expo login` sem flag pede usuário e senha e fica pedindo uma que não existe. A flag é **`--browser`** (`login/index.js`), e **`--sso` NÃO serve**: aquilo é SSO de organização |
| **`--browser` morre no Windows** | `cmd.exe /c start ... exited with non-zero code: 1` — o `start` corta a URL no primeiro `&`. `open.js:191` lê **`process.env.BROWSER`**, então `$env:BROWSER = "chrome"` contorna |
| **o token dispensa o navegador** | `UserSettings.js:164` devolve `process.env.EXPO_TOKEN` e `user.js:106` o aceita (`getAccessToken() \|\| getSession()?.sessionSecret`) — **não é só do EAS**, ao contrário do que a doc sugere |

✅ **O `rodar.mjs` passou a conferir e AVISAR antes de subir o servidor** — aviso e **não** gate,
porque reprovar pararia quem só usa Android, que é o caso comum aqui. O passo a passo está no
`apps/native-smoke/README.md`.

⚠ **E é por isto que a pergunta 3 continua aberta.** O conserto dela saiu na `0.8.1` sem nunca ter
rodado em vidro, e agora há uma tela a mais entre o Victor e a resposta.

### 8.7.3 🔴 O `E404` do npm MENTE sobre a própria causa — e virou o passo 0

Publicando a `0.8.1`, o script empacotou os sete, mandou o primeiro, e o registro respondeu:

```
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/@aurea-uds%2ftokens
npm error 404  ... could not be found or you do not have permission to access it.
```

Lê-se *"pacote não existe"*. **O pacote existia desde a véspera.** O `npm whoami` devolvia
**`E401`**: a sessão tinha expirado.

🔴 **O npm devolve 404 no `PUT` para falta de AUTENTICAÇÃO de propósito** — 401 revelaria se o
pacote existe. Então a mensagem aponta para o lado errado, e **foi para lá que a investigação foi
primeiro**. ⚠ **E a janela encolheu sem aviso:** desde dez/2025 o npm aposentou os tokens clássicos
e a sessão dura ~2 h, então *"publiquei ontem, logo estou logado"* deixou de ser verdade.

✅ **`publicar.mjs` ganhou um passo 0** que confere `npm whoami` **antes de empacotar** — e **não**
no `--dry-run`, que é o único caminho de publicação que um agente pode percorrer (ADR-0013).
Provado em três direções: sem sessão para com **zero tarballs**; `--dry-run` não é bloqueado; com
sessão segue.

⚠ **Ele NÃO conta como gate do alvo nativo** — é gate de publicação. Os do alvo nativo continuam
cinco.

### 8.7.4 ⚠ E a lição do dia não é técnica

Duas paredes das três acima eram **de credencial**, e as duas foram descobertas **depois** de
gastar o trabalho: uma depois de empacotar sete pacotes, outra depois de o iPhone recusar a tela.
Os dois consertos têm a mesma forma — **conferir a credencial antes do trabalho caro, e imprimir o
comando que resolve.**

É a mesma família do `check 39`, do `check 41` e do marcador de build: *controle que só cobre o
caso que eu imaginei não é controle.* A diferença é que desta vez o caso que eu não imaginei não
era código — era **quem está logado onde**.

---

## 8.8 O OITAVO achado do consumidor — botão dentro de botão no `Combobox`, 16/09/2026

**Não é componente novo, não é lote, e não está publicado.** É um defeito de estrutura que os
sete achados anteriores não tocaram, e ele veio de outra tela do app — a de adicionar veículo.

### 8.8.1 O defeito

O `IconButton` de limpar (`comboboxClear`) ficava **dentro** do `Pressable` do gatilho, que
declara `accessibilityRole="button"`.

### 8.8.2 🔴 E ele só quebra no iPhone — medido no fonte do `react-native@0.87.1`

| onde | o que está escrito lá | o que resulta |
|---|---|---|
| `Pressable.js:274` | `accessible: accessible !== false` | o gatilho nasce `accessible: true` |
| `RCTViewComponentView.mm:398` | `self.accessibilityElement.isAccessibilityElement = newViewProps.accessible` | no iOS o gatilho vira UM elemento de acessibilidade, e **os filhos não são expostos** — o "X" sumia para o VoiceOver |
| `ReactViewManager.kt:96` | `view.isFocusable = accessible` | no Android é só foco |
| `ReactViewGroup.kt:1048` | `safeAddChildrenForAccessibility(outChildren)` | e os filhos **continuam** na árvore — lá o "X" sempre foi alcançável |

⚠ **A regra da Apple sobre elemento de acessibilidade não expor filhos NÃO foi lida na fonte
dela** — o que foi lido é a linha do React Native que liga `accessible` a
`isAccessibilityElement`. Fica declarado em vez de disfarçado.

⚠ **O toque nunca esteve quebrado**, nos dois sistemas: numa disputa de toque o filho ganha do
pai. Tocar no "X" limpava; tocar no resto abria.

### 8.8.3 A lição, e ela é do tamanho do projeto

**Um alvo só nunca responderia esta pergunta.** O smoke rodou oito perguntas no Android em
12/09/2026 e sete passaram; este defeito estava lá o tempo todo e **não tinha como aparecer**,
porque no Android ele não existe.

É a mesma família da §7: *controle que só cobre o caso que eu imaginei não é controle* — só que
aqui o caso não imaginado é **o outro sistema operacional**, e ele continua sendo a lacuna mais
velha e mais larga do alvo nativo.

### 8.8.4 O conserto

A cápsula deixou de ser o gatilho e virou **só moldura**. Dentro dela, três irmãos:

1. o `Pressable` do gatilho (`flex: 1`), que carrega o texto e todo o anúncio de acessibilidade;
2. o "X", quando há escolha;
3. a seta, que **passou a abrir ao toque** e é muda para o leitor de tela (`accessible={false}`),
   porque o gatilho já anuncia rótulo, valor e se está aberto. O `Icon` sem rótulo já se esconde
   sozinho (`icon.tsx:104`).

⚠ **É a MESMA forma dos dois consertos que este pacote já carrega** — o fundo tocável da folha do
`Combobox` e o do `Select` (`inputs.tsx:909`): **num sistema de toque, o irmão resolve o que o
ancestral quebra.** Terceira vez.

**Custo declarado:** o respiro da direita da cápsula deixou de abrir a lista.

**Quem mais tinha o problema?** Medido: ninguém. O `SearchField` já punha o "X" como irmão, o
`Select` não tem botão de limpar, e o `Combobox` da web nunca teve o aninhamento — lá o campo é
um `<input>` e o "X" e a seta são dois botões irmãos (`inputs-client.tsx:378-381`).

### 8.8.5 O controle

`tests/unit/native-achados-do-app.test.tsx` §8 — quatro testes. O que decide caminha a árvore de
filhos do gatilho e exige que **nenhum descendente carregue `onPress`**: é a FORMA do defeito, não
o nome dele.

**Provado contra o defeito:** devolvendo o "X" para dentro do `Pressable`, ele reprova
(`expected [ { name: 'close', …(5) } ] to deeply equal []`).

⚠ **E ele prova ESTRUTURA, não comportamento** — mesma declaração do
`native-fundo-irmao.test.tsx`, pela mesma razão: *o dublê é a nossa ideia do React Native, e ela
já esteve errada.* **Quem responde de verdade é um iPhone, que este projeto nunca teve.**
