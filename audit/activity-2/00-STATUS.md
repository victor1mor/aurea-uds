# STATUS — onde a ATIVIDADE-2 parou

> **Comece por aqui.** O §88 exige que uma sessão nova saiba, sem reler o repositório: onde
> parou, o que falta, que fontes foram cobertas, o que foi implementado, o que está bloqueado,
> que decisões foram tomadas e que licenças foram confirmadas.

**Última sessão:** 28/08/2026 · branch `claude/atividade-2-uwun4w`

> ## Onde a atividade está HOJE
>
> O relato abaixo é de 21/08 e continua válido como HISTÓRIA. O estado corrente vive em três
> lugares, e nenhum deles é escrito à mão:
>
> - **`HANDOFF.md` (diário; ficou no repositório privado)** — a próxima ação exata, os bloqueios e os gates. É o
>   documento de continuidade; comece por ele.
> - **[`03-GAPS.md`](03-GAPS.md)** — a fila canônica. A contagem sai da linha `**Status**` de cada
>   cartão, e o comando está no §3 do `HANDOFF.md`.
> - **[`25-LEITURA-COMPLETA.md`](25-LEITURA-COMPLETA.md)** — o placar da matriz do §13, **gerado**
>   por `matrix.mjs` e gateado pelo check 31.
>
> **O que aconteceu desde 21/08, em três linhas:** a matriz do §13 foi lida por inteiro (315 de
> 315 células, com cinco defeitos de extrator achados no caminho); a fase de CONSTRUÇÃO foi
> autorizada pelo Victor em 28/08, por PARTE e não por cartão; e os dois primeiros cartões dela
> (`G-A11Y-11`, o `Card` que prometia clique sem teclado, e `G-STATE-02`, o `invalid` que parava
> nos controles de texto) fecharam com gate provado contra o defeito.
>
> **O achado que mudou a prioridade:** `G-LAB-01` — o catálogo é markup ESTÁTICO, sem React e sem
> hidratação, e três componentes públicos (`Combobox`, `MultiCombobox`, `FileInput`) não são
> mostrados em lugar nenhum. É o que a **Parte L** do [`PLANO-1.0.md`](../../docs/PLANO-1.0.md), o
> COMPONENT LAB, existe para resolver.

---

**Sessão de 21/08/2026** · base `1531f7b`

**Vinte e um gaps fechados**, contados no [`03-GAPS.md`](03-GAPS.md): treze cartões e oito linhas
da tabela de capacidades. Cada um com o critério do §91 cumprido e o controle provado contra o
defeito. **Sete abertos**, um deles (`G-GATE-01`) impossível de fechar desta máquina.

Os dois últimos a fechar — `G-CAP-24` (tema e densidade) e `G-A11Y-03` (link de pular) — são a
mesma família de outros dois que seguem abertos (`G-CAP-25`, o `TableOfContents` que promete marcar
a seção e não marca): **comportamento que existe no runtime vanilla e não no pacote React**. Os
quatro apareceram por acaso, nenhum gate os procurava. Agora existe o **check 28**, que confronta
cada capacidade de `window.Aurea` com uma contraparte declarada.

O `G-TOKEN-01` e o `G-TOKEN-02` nasceram e morreram no mesmo dia: subiram como decisão de paleta ao
fechar o `G-API-01`, e o Victor respondeu mandando **consertar a infraestrutura em vez de degradar
a API**. Fechá-los soltou dois achados que não eram deles: um defeito de AA **publicado**
(`G-A11Y-02`, 1.73:1 no `primary-outline` claro) e uma fraqueza do próprio gate visual
(`G-GATE-01`) — o `maxDiffPixels: 0` não é estrito como o arquivo afirmava, e deixou passar uma
mudança de cor no tema escuro.

**Seis travas novas:** a igualdade `componentes == fichas`; o check 14 lendo o contrato derivado
do compilador (agora cobrindo `sizes`, e **qualquer** eixo de união literal via `axes`); o check
27, que reprova estado que o core pinta e ficha nenhuma declara; o teste de matriz do botão, que
simula a cascata do CSS em vez de perguntar se a regra existe; a cobrança de que `solid` tenha
preenchimento de verdade; e o **primeiro gate de contraste do projeto**
(`tests/visual/tone-contrast.spec.ts`) — 30 células, dois temas, no navegador.

Os números do projeto estão no [`STATE.md`](../../STATE.md), que é gerado — não se copia número
dele para cá.

---

## Onda atual

**Onda 0 — inventário e fundação.** A Fase Zero terminou; o inventário das fontes não começou.

| Etapa | Estado |
|---|---|
| Fase Zero — medir a Aurea real (§8) | **FEITA** — [`01-FASE-ZERO.md`](01-FASE-ZERO.md) |
| Estado persistente montado (§87) | **FEITO** — esta pasta |
| Licenças das locais (§5, §90) | **FEITO** — as nove MIT, reverificadas nos commits de hoje |
| Radix UI e Shark UI clonadas | **FEITO** — eram as duas obrigatórias sem cópia local |
| **Enumeração** da superfície das nove (§10) | **FEITA** — `node audit/activity-2/inventory.mjs` |
| Triagem contra a Aurea | **FEITA** — [`04-TRIAGEM.md`](04-TRIAGEM.md) |
| **Inventário do §9** (anatomia, estados, teclado, ARIA por item) | **9 de 9** ✔ — [`base-ui`](05-INVENTARIO-BASE-UI.md), [`radix`](06-INVENTARIO-RADIX.md), [`mui`](07-INVENTARIO-MUI.md), [`untitled-ui`](08-INVENTARIO-UNTITLED.md), [`shadcn-ui`](09-INVENTARIO-SHADCN.md), [`kibo-ui`](10-INVENTARIO-KIBO.md), [`reui`](11-INVENTARIO-REUI.md), [`shark-ui`](12-INVENTARIO-SHARK.md), [`media-chrome`](13-INVENTARIO-MEDIA-CHROME.md) — **completo** |
| Inventário das 8 fontes externas (§3) | **3 de 8** — a `shadcn-ui` conta duas vezes (é local e obrigatória) e a **`HeroUI` foi inventariada em 22/08** ([`15`](15-INVENTARIO-HEROUI.md)); 6 `PENDING`. **Correção:** eu escrevia que elas "exigem rede" — a rede FUNCIONA aqui, o que faltava era fazer |
| Matriz universal de capacidades (§13) | **EXISTE** — [`14-MATRIZ.md`](14-MATRIZ.md) + [`MATRIX.json`](MATRIX.json), 59 capacidades × eixo, **307 células** sobre **11 fontes de código**. 72 inferioridades medidas; **305 células a ler**, com a evidência alinhada. O **estado de leitura persiste** em [`MATRIX-ESTADO.json`](MATRIX-ESTADO.json) e é cobrado pelo check 29 |
| Backlog de gaps (§72) | [`03-GAPS.md`](03-GAPS.md) — os da Fase Zero, mais as capacidades ausentes verificadas |

---

## O que foi entregue em código

| Commit | O quê |
|---|---|
| `43938f1` | `STATE.md` contava dois contextos React como componentes: 78 eram 76. Trava no validador, provada contra o defeito |
| `26f58b4` | esta pasta — o estado reentrante, a Fase Zero e a prova de licença das sete referências |
| `3892026` | **`G-FORM-01` fechado**: campo de formulário ganhou `sm`/`md`/`lg` nos cinco componentes, com os mesmos degraus do botão |
| `7cfbc1c` | **`G-REG-02` e `G-REG-01` fechados**: o check 14 passou a ler o contrato derivado do compilador (`api-surface.json`, novo passo de build e artefato publicado), cobre `sizes` além de `variants`, e as quatro fichas que discordavam foram corrigidas |
| `5a9a691` | **Onda 0 — enumeração e triagem**: nove referências enumeradas sem amostra, cruzadas com a Aurea, e as capacidades ausentes de maior lastro verificadas uma a uma |
| `43a372f` | **`Separator`, `Collapsible`, `ToggleGroup`**: três gaps fechados, todos com primitive no motor que a Aurea já usa. Zero dependência nova |
| `e33dcec` | **`Menubar`**: quarto gap coberto pelo motor. Fila de menus de aplicação, com a seta passando de um menu aberto para o vizinho |
| `10e4029` | **Inventário do §9 da `base-ui`** — 47 primitives, 757 estados. Achou oito estados que o core PINTA e ficha nenhuma declarava, inclusive `highlighted`. Corrigidos, e travados pelo check 27 |
| `67e1a0f` | **`:user-invalid`**, que é a resposta da plataforma ao `touched`, e o `.select[aria-invalid]` que faltava. Mais o **inventário do §9 da `radix`**, que respondeu "a aposta na Base UI deixa buracos?" |
| `6432f4f` | **`PasswordField`, `Label`, `AspectRatio`** — os dois últimos confirmados por dois métodos independentes; o primeiro só apareceu na comparação de famílias |
| `c45123e` | **Inventário do §9 da `mui`** — 135 componentes, 160 estados, 60 peças. Achou que o enum de variante da Aurea é o produto cartesiano de dois eixos achatado, com **duas células vazias** no tom de marca. As duas foram preenchidas; o modelo virou `G-API-01` |
| `f4b2159` | **`InputGroup`** — consolidou três soluções locais numa só e matou um defeito **publicado**: o `MessageComposer` sem ícone abria 40px de vão. A catraca de px cru caiu de 123 para 121 |
| `2e0b69f` | **`G-A11Y-01`** — a Aurea escondia as próprias barras de rolagem. Cinco regras, os dois caminhos (`scrollbar-color` e `::-webkit-scrollbar`), porque o Safari só ganhou o padrão na 26.2 |
| `d22fda1` | **`G-DX-01`** — o registry passou a modelar `kind: hook`, e os três hooks públicos saíram da invisibilidade com ficha, página e teste de contrato |
| (esta sessão) | **`G-API-01` fechado, aditivo** — o botão ganhou `appearance` + `tone` ao lado de `variant`; os treze valores viraram atalho e emitem a mesma classe, então nenhuma baseline se mexeu. Nove células novas. A ficha passou a declarar **todos** os eixos (`axes`), e a generalização achou oito eixos publicados que o contrato nunca declarou |
| (esta sessão) | **Inventário do §9 da `untitled-ui`** — 34 componentes, 6 escalas de tamanho. Achou **sete** componentes nossos sem escala, e nos três de formulário achou algo pior: `Checkbox`, `Radio` e `Switch` não acompanhavam a densidade. `G-FORM-03` |

---

## O que está bloqueado

**As três decisões que subiram foram respondidas pelo Victor em 21/08/2026**, e as três estão
fechadas ou em curso. O que segue abaixo é o registro do que era cada uma.

~~A primeira, pelo §96: a **`ScrollArea`**.~~ **Fechada, e não como eu propus:** medindo, o achado
foi que a Aurea **escondia** a própria barra. O conserto é CSS padrão com barra nativa, não um
componente de peças. Ver `G-A11Y-01`. O motor entrega o
comportamento, mas a barra de rolagem é **pele que a Aurea nunca teve** — trilho, polegar, canto,
e a decisão de quando ela aparece. Não é derivável dos tokens atuais sem inventar linguagem
visual, e o §96 manda mostrar A/B em vez de descrever em texto. Fica em `G-CAP-02`, aberto.

**As duas decisões de paleta que subiram ao fechar o `G-API-01` foram respondidas no mesmo dia** e
estão implementadas: preenchimento semântico para todo tom (`G-TOKEN-01`) e identidade própria para
o aviso (`G-TOKEN-02`). O princípio que ficou decidido daqui para frente, na palavra do Victor:
*"tokens de marca e tokens semânticos podem coincidir por acaso somente quando isso não destrói
significado. Se duas intenções diferentes ficam visualmente indistinguíveis, a semântica tem
precedência e deve receber token próprio."*

~~A segunda, pelo §19: **`G-API-01` — o enum de variante do botão é aparência × tom achatado num
só**.~~ **Fechada, e o custo estimado estava errado:** eu havia medido "quebra a API de todo botão
do repositório", e isso valia para o caminho de *substituição*. O Victor autorizou o **aditivo**, e
nesse caminho o custo é zero — `variant` continua, os treze valores continuam emitindo a mesma
classe, e o eixo novo só aparece nas células que não existiam. Sobraram duas decisões de paleta
que não são deriváveis e subiram no lugar: `G-TOKEN-01` (não há par cor+texto para preenchido em
sucesso/informação) e `G-TOKEN-02` (no tema escuro a cor de aviso **é** a cor da marca).

~~A terceira, também pelo §19:~~ **Fechada.**
**o registry não modela hook, e a biblioteca exporta três** — `useToast`, `useAureaStrings`,
`useSpriteUrl`, nenhum com ficha, página ou exemplo. Dar ficha ao toast (`G-DOC-01`) esbarra
nisso, e as duas saídas mexem em coisas diferentes: uma muda o modelo de página da ADR-0001, a
outra inventa um componente para satisfazer o gate. Está em `G-DX-01`, com a medição.

Fora essas duas, nada está bloqueado. O §19 autoriza executar sem pedir autorização componente
por componente.

Duas restrições **de ambiente**, não de código:

1. **`Referencia/` não vem no clone.** É gitignorada e mora na máquina do Victor. Reconstruída
   aqui por clone raso — ver [`02-FONTES.md`](02-FONTES.md). Uma sessão nova em contêiner limpo
   precisa refazer isso antes de inventariar.
2. **O Playwright precisa do navegador fixado.** O contêiner traz Chromium 1194 pré-instalado; o
   projeto fixa `@playwright/test` 1.61.1, que quer o build 1228. `pnpm exec playwright install
   chromium` resolve (≈114 MB). Sem isso a suíte inteira falha com
   `Executable doesn't exist`, o que **parece** um defeito do repositório e não é.
3. **Seis screenshots falham, e a causa de cada grupo é diferente.** Conferir a causa antes de
   culpar o próprio commit é o passo que separa as duas.

   **Quatro já falhavam em árvore limpa**, antes de qualquer mudança desta sessão: `catalogo ·
   index` e `catalogo · topo`, nos dois temas. A causa **não** é do contêiner — está declarada no
   [`PLANO-1.0.md`](../../docs/PLANO-1.0.md) §5: as duas capturas mudaram **de propósito** na Parte B
   (quatro fichas saíram de `Draft`, e o contador de tokens foi de 260 para 261) e esperam a
   regeneração das `-linux.png` pela CI desde 06/08/2026. O passo reprova, e reprova com razão.

   **Cinco são desta sessão, e cada uma tem causa medida:** `catalogo · lateral` nos dois temas
   (os componentes novos entram na lista — ~3.500 pixels, contra os ~33 de uma diferença de
   antialiasing); `catalogo · tokens` nos dois temas (a página de tokens desenha uma amostra por
   token, e entraram nove tokens novos por tema, além do aviso ter mudado de cor); e `docs · claro
   · agentes` (o `Badge`, o `Alert` e a matriz de saúde pintam aviso). Todas são consequência
   pretendida do `G-TOKEN-02`.

   **E uma NÃO falhou, o que é o achado:** `docs · escuro · agentes` mudou — o hash da captura é
   outro — e passou assim mesmo. É o `G-GATE-01`.

   **Não regravar as baselines aqui.** O commit `042b677` mediu isso em 07/08/2026 e reprovou o
   caminho: rodar `--update-snapshots` numa máquina Linux qualquer troca as 48 baselines por
   imagens daquela máquina e deixa a CI vermelha em tudo. O caminho é o `workflow_dispatch` com
   `update_snapshots=true` e commitar o artefato `playwright-snapshots-linux`.

   A obrigação de quem mexe no CSS é **não passar** do que já falhava sem entender por quê.

---

## ONDE PAREI — leia isto antes de qualquer coisa

**Estado em 22/08/2026, branch `claude/atividade-2-uwun4w`.** Árvore limpa, tudo commitado e
empurrado. Nada pendente no disco.

### Para ver o que já existe

O `apps/catalog` é **gerado e commitado** — as **321** páginas estão no branch. Não é preciso
reconstruir para olhar:

```bash
git fetch origin claude/atividade-2-uwun4w
git checkout claude/atividade-2-uwun4w
pnpm install                 # node_modules não viaja
pnpm build                   # só se for MEXER; para olhar, abra o HTML direto
```

Abra `apps/catalog/index.html`. O que mudou nesta leva e vale conferir com o olho:

| Página | O que olhar |
|---|---|
| `button.html` | o eixo `tone` na Reference, e o link de pular no **primeiro Tab** |
| `pattern-button-the-two-axes.html` | `variant` antigo e `appearance`+`tone` novo, lado a lado |
| `pattern-button-warning-is-not-the-brand.html` | o aviso âmbar ao lado do primário amarelo |
| `pattern-button-the-same-tone-across-appearances.html` | as quatro aparências do mesmo tom |
| `usetheme.html` · `usedensity.html` | os dois hooks novos |
| qualquer página | Tab no carregamento revela o link de pular |
| `patterns.html` | **195 composições** sobre 77 componentes — era 76 sobre 13 |
| `logstream.html` | a linha de log com as **três** células: hora, nível e mensagem |
| `alert.html` | o glifo da variante, e o título fora da trilha do ícone |
| `pattern-chart-the-whole-reading-surface.html` | grade, eixo, legenda e tooltip juntos, desenhados de verdade |
| `pattern-appshell-the-frame-of-a-whole-application.html` | o shell num documento próprio, por `<iframe>` |
| eixo `size` responsivo | **18 de 18** componentes elegíveis — ver [`18`](18-G-AXIS-04-FAMILIAS.md) |

### O que está pronto e travado

| | |
|---|---|
| Inventário do §9 | **9 de 9** referências locais — [`05`](05-INVENTARIO-BASE-UI.md) a [`13`](13-INVENTARIO-MEDIA-CHROME.md) |
| Gaps fechados | **30** (o `G-AXIS-03` inteiro), cada um com controle provado contra o defeito |
| Gaps abertos | **9** — ver [`03-GAPS.md`](03-GAPS.md), que é o placar; o `G-AXIS-05` é o mais novo |
| Gates no `validate.py` | **28** |
| Testes unitários | **379** |
| Gates de navegador novos | contraste ×2 · link real ×2 · teclado nativo ×3 · teclado do motor ×7 · orientação ×4 · range vertical ×6×3 motores · responsivo ×6×3 motores |
| Falhas visuais | 9 — **as mesmas** de antes desta leva, e as 3 novas são consequência pretendida do `warning` |

### O que precisa de VOCÊ, e não de mim

1. **`G-GATE-01`** — o `maxDiffPixels: 0` **não é estrito**: sem `threshold: 0` ele tolera 20% de
   desvio de cor por pixel. Medido: a captura de `#agentes` no escuro mudou de hash e o teste
   **passou**. Ligar o `threshold` reprova 15 das 26 seções, e daqui não dá para separar regressão
   de deriva de baseline. O caminho é **um commit só**: regerar as baselines pelo
   `workflow_dispatch` com `update_snapshots=true` e ligar o `threshold` junto.
2. **As 9 baselines** — 6 já esperavam desde 06/08 (`PLANO-1.0` §5); 3 são desta leva (a cor de
   aviso). Só a CI pode regerar; o commit `042b677` mediu e proibiu fazer de outra máquina.

---

## Próximo passo, e por quê

A ordem abaixo é por **dependência**, não por tamanho (§71). Item adiado continua na fila.

1. ~~**`G-CAP-25`**~~ — **FECHADO em 21/08.** O componente observa quando ninguém passa `current`,
   com a mesma faixa do runtime vanilla, e os dois se coordenam pelo `data-toc-spy="react"` — que
   sai do **efeito**, nunca do render, senão as 202 páginas estáticas levariam a marca sem ter
   React vivo para honrá-la. O check 28 já não tem ausência declarada nenhuma.
2. ~~**`G-AXIS-01`**~~ — **FECHADO em 21/08.** Os três eixos entraram, e o `align` do adorno
   passou aos quatro valores lógicos (quebra registrada). Nasceu daí o **`G-AXIS-02`**: falta um
   `FieldGroup`, e sem ele não existe campo responsivo — na referência o `responsive` depende de
   uma container query com contêiner nomeado que só um grupo pode declarar.

   *Correção de registro:* eu havia escrito aqui que o `MessageComposer` já desenhava à mão a
   forma do adorno em bloco, e fui conferir ao implementar: **não desenha** — ele é uma linha,
   com o campo e o botão lado a lado. Então isto não foi consolidação de solução local como o
   `InputGroup` foi; foi capacidade que a Aurea não tinha.
3. ~~**`G-COMP-01`**~~ — **FECHADO em 22/08.** A média (0,86 contra 20,8 do kibo) escondia o
   formato: **77 dos 90 componentes estavam em ZERO**. O alvo virou "nenhum componente em zero",
   que se verifica em vez de se estimar. Agora são **195 composições sobre 77 componentes**, e os
   13 restantes são `N/A` **medido**, não presumido — 6 hooks mais o `AureaProvider`, que não
   emitem marcação, e 6 primitivos contados dentro das composições dos outros.

   *Correção de registro:* a linha acima dizia "88 componentes"; são **90** desde que os hooks
   ganharam ficha (`G-DX-01`).

   E compor de verdade revelou o que a ficha não conta — foi assim que saíram o **`G-CSS-01`** e
   três defeitos de documentação: `ChartLegend items` e `KPI trend={{…}}`, duas props que não
   existem, e o campo `note` que 14 patterns declaravam e a página **descartava**.
4. ~~**`G-A11Y-04`, segunda metade**~~ — **FECHADO em 22/08.** Medido com `apps/keyboard-probe` +
   `tests/visual/teclado-motor.spec.ts`: duas fichas declaravam menos (`DropdownMenu` também abre
   com ArrowUp e Space; `OTPField` também anda com ArrowUp e Home). E o que a `radix` declara e o
   motor da Aurea **não** faz ficou registrado como diferença de capacidade, não como erro de
   ficha — o `Accordion` é `<details>` nativo, e navegar por seta entre cabeçalhos exige roving
   focus por cima, que ele não tem.

   *A parte que interessa:* a primeira execução reprovou 5 de 7, e **4 eram cegueira do
   instrumento** — foto que não distinguia irmãos, medição começando do primeiro item, campo
   medido vazio, e atributos de ANIMAÇÃO na foto. Está tudo no cartão.
5. **A família da orientação** — `G-AXIS-03`, **PARCIAL**. `Tabs` e `Menubar` FECHADOS em 22/08:
   o motor sempre entregou `orientation` e a Aurea não expunha — a quinta e a sexta ocorrência da
   família do check 28. `Range` (`<input type=range>`) e `Accordion` (`<details>`) ficam ABERTOS:
   ali a vertical é **construção**, não exposição, e trocar o motor deles é decisão do Victor.
6. **As fontes externas do §3.** Duas feitas em 22/08, as duas pelo **código** e não pelo site:

   - **`HeroUI`** ([`15`](15-INVENTARIO-HEROUI.md)) — 85 componentes, 72 sobre
     `react-aria-components`, 20 capacidades só nela em quatro famílias (cor, data/hora,
     formulário, outros). `fieldset` corrobora o `G-AXIS-02`.
   - **`Radix Themes`** ([`16`](16-INVENTARIO-RADIX-THEMES.md)) — a camada ESTILIZADA, fonte
     separada da de primitives. **47 de 50 componentes têm eixo responsivo e a Aurea tem 0**:
     virou o `G-AXIS-04`, que sobe pelo §96 por ser decisão de API.

   Falta: `21st.dev`, `Untitled UI` (o pacote npm é só a CLI — os componentes não são
   publicados), e a camada de documentação de `MUI`/`ReUI`/`shadcn`/`Shark`.

   *Correção de registro:* eu escrevia aqui que elas "exigem rede", como se fosse impedimento. **A
   rede funciona neste ambiente** — `npm pack` baixa, e os sites respondem. O que faltava era
   fazer.
7. ~~**A matriz do §13**~~ — **FEITA em 22/08.** [`14-MATRIZ.md`](14-MATRIZ.md). E o que ela
   ensinou está lá no §0: a primeira versão concluiu que a Aurea era inferior em **59 de 59**, o
   que era falso — a armadilha do §15 um nível abaixo, *"valor igual não é capacidade igual, e
   valor diferente não é capacidade diferente"*.
8. **`G-STATE-01`** — os ~53 estados que o motor tem e a Aurea nunca declarou seguem sem triagem.
   O `valid` (pintar de verde) é decisão visual e sobe pelo §96.
9. **`G-REG-03`** (Parte E do `PLANO-1.0`), **`G-CAP-26`**, **`G-I18N-01`**, **`G-TOKEN`**
   fechados — ver o `03-GAPS.md` para o estado de cada um.

### A lição desta leva, que vale mais que a fila

**Quatro achados foram a mesma coisa vista quatro vezes**, e todos apareceram por acaso: tema,
densidade, o scroll-spy do `TableOfContents` e o link de pular. O padrão é sempre
*"o comportamento existe no runtime vanilla e o React não tem"*. O **check 28** passou a procurar
por isso.

Mas o gate cobre `window.Aurea`, e **não** cobre a família maior: *"a ficha promete um
comportamento que o componente não entrega"*. O check 14 confronta **eixo** declarado com o tipo;
ninguém confronta **comportamento** prometido no `summary`/`states` com o que o código faz.
Enquanto esse gate não existir, a quinta ocorrência já está no repositório — só não foi achada.

**A leva seguinte achou uma quinta, e de outra família** (`G-CSS-01`): *o core desenha por grade e
o React não entrega as células*. Vale registrar **como** ela apareceu, porque não foi nenhum gate:
apareceu ao **escrever a composição**. Ler a assinatura do `LogStream` não diz nada; montá-lo numa
página e olhar diz que a mensagem tem 72px. Compor é um método de auditoria, não só entrega — foi
o que também derrubou duas props inventadas e um campo que a página jogava fora.

A conclusão prática: **nenhum gate pega o que ninguém tentou usar.** Os três primitivos que
estavam em zero composição (`AspectRatio`, `Cluster`, `Separator`) eram exatamente os que ninguém
tinha montado — e por isso ninguém sabia se funcionavam.

---

## Regras desta atividade que já custaram caro

- **O extrator erra para menos.** `measure-api.mjs` acusou duas fichas erradas que eram limitação
  dele (alias em cadeia, herança por `Omit<>`). Conferir na fonte antes de abrir gap — foi o que
  impediu dois achados falsos.
- **Dois defeitos parecidos não são o mesmo defeito.** "Ficha declara o que a API não tem" virou
  `G-FORM-01` (capacidade ausente) e `G-REG-01` (ficha mal escrita). Corrigir os dois do mesmo
  jeito estragaria um dos dois.
- **§10 proíbe amostragem.** Leitura dirigida ao gap da vez serve para construir e **não conta
  como inventário**. As duas coisas estão separadas no [`02-FONTES.md`](02-FONTES.md) de
  propósito.
- **O índice não é o produto (§11), e isso quase custou 3× a contagem.** O `components/ui/` do
  ReUI e o `components/` do Shark UI são o chrome do site de documentação, não a biblioteca.
- **Os dois métodos não são redundantes.** A triagem por NOME e a comparação por FAMÍLIA DE
  PRIMITIVES acham coisas diferentes: `password-toggle-field` (radix) e `password-input` (shark)
  são a mesma capacidade com nomes que não casam, então a evidência ficou dividida em duas linhas
  de uma referência cada e as duas caíram abaixo do corte. Só a comparação de família a pegou.
- **Medir no navegador, não deduzir do CSS.** O botão do switch saiu errado DUAS vezes seguidas
  por dedução: `100%` num elemento absoluto resolve contra a caixa de PADDING do contêiner (não a
  de borda), e no eixo INLINE resolve contra a LARGURA (não a altura). A mesma conta nos dois
  eixos deu um botão de 34×16. Trinta segundos de `getComputedStyle` responderam o que duas
  rodadas de raciocínio erraram.
- **A triagem por nome erra nas duas direções**, e três vezes já errou: acrônimo quebrado fez
  `OTPField` e `QRCode` parecerem ausentes; sinônimo faltando fez o mesmo com `slider` e
  `native-select`; e um script meu leu `.chip` de um **comentário** do CSS e deu a capacidade
  como presente — o mesmo defeito que o `validate.py` já tinha corrigido no check 15. Conferir
  na fonte antes de abrir gap não é formalidade.

---

## ATIVIDADE-2: CONTINUA

O §199 lista 20 critérios de conclusão. Nenhum está cumprido. O §93 é explícito: entrega
intermediária não encerra a atividade.
