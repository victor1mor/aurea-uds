# Aurea — regras do projeto

Design system independente. Marca: **Aurea**. Nome oficial: **Aurea Universal Design System** ·
curto **Aurea UDS**. Pacotes `@aurea-uds/*`; repositório `aurea-uds`; domínio `aureauds.dev`.

Este arquivo tem **só regras**. O diário de como cada uma nasceu ficou no repositório privado
original quando a Aurea foi aberta (24/09/2026). Quem decide é o Victor; quando uma regra aqui
disser "ordem do Victor", ela vale até ele dizer o contrário.

---

## 1. A regra que vem antes de todas — ordem do Victor, 30/08/2026

> **Duvide sempre das suas próprias decisões. Nunca use seu treinamento como verdade.**

**O que ela proíbe, em concreto:**

- **Afirmar estado sem comando atrás.** Não "o projeto tem X": `grep`, `ls`, `npm view`, e a saída.
  Vale para o que você escreveu cinco minutos antes — memória de sessão também é memória.
- **Contar à mão.** Número de estado sai de comando. Os números do projeto estão no
  [`STATE.md`](STATE.md), que é **gerado** (`python scripts/validate.py --write-state`).
- **Recomendar sem perguntar o alvo.** Antes de `pnpm add`, pergunte se é **web ou nativo**: as
  listas dos dois lados são diferentes, não a mesma com menos itens.
- **Recomendar sem perguntar ONDE o comando roda.** Comando colado sem `cd` esconde uma suposição.
  O repositório é pnpm workspace (`npm i` dentro dele quebra), e o app pode estar em outra máquina.
- **Agir sem autorização.** Fase nova, push, publicação, mudança de API: cada um exige um "pode".
  Autorização dada uma vez não vale para a próxima. Aviso automático do git **não é o Victor**.
- **Escrever "você pediu" ou "você autorizou"** (ordem de 14/09/2026). Do lado do agente, o que o
  Victor digita e o que chega preenchido no campo são idênticos. Escreva o que foi feito; se
  precisar de autorização, **peça de novo**.
- **Inventar distância** (ordem de 12/09/2026). Todo número de geometria sai de **token**. Número
  cru no fonte é defeito até prova em contrário, e a prova é uma linha do `aurea.css` com o número
  ao lado. Escala nova não se cria no meio de um componente.
- **Não medir a simetria.** "Está na posição certa?" se responde medindo o retângulo de cada peça,
  não olhando.
- **Consertar sem medir.** Nem toda acusação sobre a imagem é do componente: às vezes é a vitrine
  ou o dublê de teste. Mede-se antes de tocar.
- **Afirmar sobre imagem que você não olhou NA VERSÃO FINAL.** Olhe o arquivo que vai sair.
- **Afirmar sobre o próprio estado.** Se o Victor diz que a conversa compactou ou que algo foi
  esquecido, ele tem o instrumento; a sua memória é a coisa em questão. O que protege o projeto
  são os arquivos (este, o `CHANGELOG.md`, as ADRs).
- **Falar em jargão** (ordem de 14/09/2026: *"seja direto"*). Se a palavra precisa de tradução,
  ela já está errada — escreva a tradução e apague a palavra.
- **Escrever horário no fuso errado** (ordem do Victor, 24/09/2026). O Victor está no fuso **−3
  (horário de Brasília)**. Todo horário que se escreve para ele — agendamento, publicação, prazo —
  vai **no fuso dele**. O relógio dos servidores e o GitHub usam UTC: converta antes de escrever
  (UTC 21:06 = 18:06 para ele).
- **Hesitar em pergunta de sim ou não sobre o código.** Mede-se, e a primeira palavra é **sim** ou
  **não**.
- **Tratar resumo de busca como fonte.** A fonte é a página. Sobre interface de terceiros (Expo,
  npm, GitHub), não afirme nada que você não tenha aberto.

**E duvidar inclui duvidar da acusação** — dúvida também sobre o defeito que você acha que achou.
**Quando a dúvida não se resolve com comando, ela vira pergunta ao Victor — não palpite.**

---

## 2. A ordem das fontes — ordem do Victor, 24/09/2026

> **Quem decide, nesta ordem:** **1.** o Victor · **2.** as pesquisas dele · **3.** o **HeroUI**.

- **O HeroUI é a fonte principal de desenho**: tamanho, anatomia, estado, espaçamento. Antes de
  inventar, **ver como o HeroUI faz**.
- **Leia no código publicado, não na memória.** O inventário versionado está em
  [`audit/activity-2/INVENTORY-HEROUI.json`](audit/activity-2/INVENTORY-HEROUI.json). Para números,
  baixe o pacote: `npm pack @heroui/styles` (web) e `npm pack heroui-native` (telefone).
- Quando divergem, vale o de cima. Na dúvida, pergunte antes de escolher.
- ⚠ **O HeroUI não manda na identidade da Aurea** (seção 5). Dele se copia o desenho da peça; a
  aparência continua sendo a nossa.
- **HeroUI sempre primeiro** (ordem do Victor, 25/09/2026): *"HeroUI sempre vamos dar prioridade
  a ele"*. Quando ele **não tem** a peça que estamos criando, ela se cria **pensando como ele
  criaria** (nomes, anatomia, estados, lista fechada de opções), com a aparência da Aurea. Ele é a
  referência mesmo onde não tem o componente.
- **Quando o HeroUI não tem a peça, a consulta segue esta fila** (ordem do Victor, 01/10/2026),
  e para no primeiro que tiver:

  > **HeroUI → ReUI → Shark UI → Untitled UI → MUI**

  | # | referência | onde ler | base | licença (conferida em 01/10/2026) |
  |---|---|---|---|---|
  | 1 | **HeroUI** | `npm pack @heroui/styles` · `npm pack heroui-native` | React Aria (web) | MIT |
  | 2 | **ReUI** | `reui.io/docs/components/*` | shadcn, Base UI ou Radix | MIT nos abertos; os "Pro" são pagos e não entram |
  | 3 | **Shark UI** | `shark.vini.one/docs` | Ark UI + Tailwind | MIT |
  | 4 | **Untitled UI** | `untitledui.com/react` | React Aria + Tailwind | MIT nos abertos; o "PRO" é pago e não entra |
  | 5 | **MUI** | `mui.com` · `npm pack @mui/material` | próprio | MIT |

  - De todos se lê **anatomia, nomes, estados e comportamento**. A aparência é sempre a da Aurea
    (seção 5) — e o MUI é **Material**, que a seção 5 proíbe como aparência: dele, só o
    comportamento.
  - Medida (recheio, altura, vão) vem **só do HeroUI**, pela regra abaixo. Dos outros quatro,
    número nenhum entra sem passar pelos tokens que já existem.
  - Copiar continua exigindo ordem do Victor e crédito no `docs/REFERENCES.md` (seção 7).
- **As medidas vêm do HeroUI** (ordem do Victor, 25/09/2026): *"não vamos ficar inventando
  medidas, se HeroUI já tem vamos usar as deles, que já é validado; só criamos medidas e tamanho em
  componente exclusivo nosso"*. Recheio, altura, letra, linha e vão de peça que o HeroUI tem se
  leem no pacote dele (`@heroui/styles` na web, `heroui-native` no telefone) e se escrevem com os
  tokens que dão o mesmo número. A identidade (seção 5: raio, cor, fonte) continua nossa.

---

## 3. Comece aqui: a fila

**A fila são os achados dos consumidores.** O documento-fonte vive fora do repositório, com o
Victor, porque cita os apps pelo nome. Aqui cada achado se chama pelo ID (A-01, R-08…). **Peça ao
Victor a versão mais nova no começo da sessão**: ela é atualizada pela sessão do app.

### O que já saiu

| versão | o que entrou |
|---|---|
| `0.8.8` | Lote 1: A-01, A-06, A-07, A-09, A-10, A-11, C-09 |
| `0.8.9` + `0.8.10` | A-03, C-10 · A-02 e B-08 (o `Select` com a aparência da Aurea) |
| `0.8.11` | N-10: `MediaEmbed` |
| `0.8.12` | escala de letras do HeroUI ([ADR-0050](decisions/0050-a-escala-de-letras-e-a-do-heroui.md)) |
| `0.8.13` + `0.8.14` | Lote 4 (nativo) inteiro: R-01 a R-10 |
| `0.9.0` | Lote 2, primeira leva: B-01, A-08, C-01, C-03, C-04, C-05, C-07, C-13, B-03 |
| `0.10.0` | Lote 2, segunda leva: B-07, B-10, B-12, A-05, A-14 — junção `5ca8d3e` (pedido #16). **Publicada em 24/09/2026**, pelo terminal do Victor |
| `0.10.1` | R-05, a metade que faltava: `criarGlifo` desenha a traço — pedido #4 do repositório público. **Publicada em 24/09/2026**, pelo terminal do Victor |
| `0.11.0` | Lote E (nativo): E1, E3, E4, E5, E6, E7, E8 e o `Badge` nas medidas do HeroUI — pedido #6. **Publicada em 25/09/2026**, pelo terminal do Victor, **sem o aceite de aparelho** |
| `0.12.0` | Lote 3: A-04, B-09, ADR-0052, B-02, E2, M-01 e o `ThemeToggle` — pedido #8. **Não saiu sozinha**: foi publicada dentro da `0.12.1` |
| `0.12.1` | E9 (`LinkButton`), E10 (recuo das folhas), E11 (`Grid` reparte a sobra) — pedidos #9 e #10. **Publicada em 26/09/2026**, pelo terminal do Victor. Leva a `0.12.0` junto |
| `0.12.2` | O `BottomNav` mais baixo, na web e no nativo (aprovado pela imagem) e dois patches de segurança da CI — pedido #11. **Publicada em 30/09/2026**, pelo terminal do Victor |
| `0.12.3` | `RadioGroup` no nativo, no desenho do HeroUI, com a marca no início ou no fim (aprovado pela imagem) — pedido #13. **Publicada em 30/09/2026**, pelo terminal do Victor |
| `0.12.4` | R-20: o estado chega ao leitor de tela da web em `aria-*` (os 26 pontos do nativo) — pedido #15. **Publicada em 01/10/2026**, pelo terminal do Victor |
| `0.13.0` | A troca de fonte e ícones da ADR-0053: Atkinson Hyperlegible Next e Mono, ícones Phosphor com a forma cheia no item escolhido. **Quebra** nomes de ícone. Aprovada pela imagem (pedido #17) e, com as fotos da CI (pedidos #18 e #19), **publicada em 01/10/2026**, pelo terminal do Victor |
| `0.14.0` | Lote F (nativo): R-10, R-12, R-14, R-16, R-19 — pedido #22. **Não saiu sozinha**: foi publicada dentro da `0.14.1` |
| `0.14.1` | O `IconButton` ocupado mostra só a rodinha, no centro (web) — pedido #24; a CI de volta ao verde (aceite do `node-forge`, espera de transição) — pedido #25. **Publicada em 02/10/2026**, pelo terminal do Victor. Leva a `0.14.0` junto |
| `0.15.0` | Nativo: R-11 (o desenho do app em toda prop de ícone), R-15 (moldura no `EmptyState`), R-18 (`Timeline` com `icon`, `tone`, `trailing`, `between`), R-21 (`FileInput` em `/system/file`), R-22 (o `PhotoInput` abre a foto), E13 — pedido #27. **Publicada em 02/10/2026**, pelo terminal do Victor, **sem o aceite de aparelho** |
| `0.16.0` | No tema claro, a letra de destaque é o amarelo escurecido `#826202` ([ADR-0054](decisions/0054-no-tema-claro-a-letra-de-destaque-e-ouro-escuro.md)) — pedido #29, fotos da CI no #30. **Publicada em 02/10/2026**, pelo terminal do Victor |
| `0.16.1` | O círculo do `BottomNav` `circle-bold` não vira risco no navegador, e o rótulo cabe nele na barra estreita (web e nativo) — pedido #31. A CI em paralelo e o aceite do `braces` (#32, #33) não mudam pacote. **Publicada em 03/10/2026**, pelo terminal do Victor |
| `0.17.0` | O `BottomNav` parado ao trocar de aba, na altura do Telegram, com o nome colado no ícone, e os indicadores novos `capsule` e `expand` ([ADR-0055](decisions/0055-a-barra-de-baixo-fica-parada-na-altura-do-telegram.md)). Aprovada pela bancada (*"PERFEITO! pode. aprovado"*) — pedido #35. **Publicada em 03/10/2026**, pelo terminal do Victor, **sem o aceite de aparelho** |
| `0.18.0` | Lote G, de um consumidor novo da web: AN-07 (`Progress` sem total, com `detail` e `tone`), AN-08 (`Grid` com `min` por nome), AN-04 (`NavList` com `avatar` e `indicators`) e AN-01 (`AppShell` com o botão de recolher — [ADR-0056](decisions/0056-a-lateral-recolhe-pelo-botao-na-juncao.md)); junto, as fichas com o Phosphor (pedido #37). Aprovada pela bancada (*"pode, aprovado o lote G"*) — pedido #38. **Publicada em 03/10/2026**, pelo terminal do Victor, **sem o aceite de aparelho** |
| `0.19.0` | Lote H, do consumidor novo da web: AN-06 (`TreeView` que carrega ao abrir), AN-05 (`Gallery` em lote), AN-03 (`MessageComposer` que anexa, responde e edita), AN-02 (`MessageList` para conversa longa — [ADR-0057](decisions/0057-a-conversa-longa-e-uma-janela-sem-virtualizacao.md)). Aprovada pela bancada (*"Pode"*) — pedido #40. **Não saiu sozinha**: foi publicada dentro da `0.19.1` |
| `0.19.1` | A cápsula do `BottomNav` saía quadrada no Android (`collapsable={false}`), aceita no aparelho (*"deu certo"*) — pedido #41. **Publicada em 04/10/2026**, pelo terminal do Victor. Leva a `0.19.0` junto |

O detalhe de cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

**A fila inteira, com a pesquisa de como o HeroUI (ou o ReUI) faz cada item, está em
[`docs/FILA.md`](docs/FILA.md)** — fotografia de 01/10/2026. Comece por ela; peça ao Victor o
documento de achados mais novo para conferir se ela envelheceu.

### O próximo passo

1. **O repositório está aberto desde 24/09/2026**, com um commit só. O histórico antigo e o diário
   ficaram no privado (`aurea-uds-privado`), que não recebe mais envios. Termos técnicos
   consagrados ficam em inglês (mobile, bundler, pull request, issue) — decisão do Victor, 24/09.
2. **A sessão do app adota as peças novas** e mede no aparelho.
3. **Lote 3 — "pode" dado em 24/09/2026:** M-01 (`render` em todos) · M-02 (`classNames` por
   parte) · B-02 (`Text`/`Heading`) · A-04 (nome de ícone checado pelo TypeScript) · B-09 (foco
   com uma linha). Na leitura de 24/09/2026, ele vem **antes** da `1.0`, porque muda a estrutura
   das peças.
   - **Lote 3 FECHADO em 25/09/2026, na versão `0.12.0`**, na branch `claude/friendly-cerf-ctu0v7`.
     O E2 e o M-01 entraram nele, e o `ThemeToggle` também (botão de claro e escuro: lua cheia
     escura no claro, sol cheio amarelo no escuro — aprovado pela imagem em 25/09/2026). **Empurrada
     com o "pode" de 25/09/2026, juntada no pedido #8 e publicada dentro da `0.12.1`.**
   - **A-04 feito.** Pode quebrar a compilação de quem passa ícone numa variável `string`.
   - **B-09 feito e aprovado pela imagem** (25/09/2026): foco de `--focus-width`/`--focus-offset`,
     `check 44`. Os itens de menu ganham a linha de foco, como no HeroUI.
   - **ADR-0052 feita e aprovada pela imagem** (25/09/2026): o botão só de ícone é redondo.
   - **B-02 feito e aprovado pela imagem**, no modelo do HeroUI (25/09/2026): lista fechada de papéis
     (título 1–6, texto, texto pequeno, texto mínimo, código), mais `Heading`, `Paragraph` e
     `Code`, nos dois alvos. O `Text` do nativo que já existe fica.
   - **M-01 só em `Button`, `IconButton` e itens de navegação; M-02 descartado; E2 entra aqui**
     (decisões do Victor, 25/09/2026 — ver "Lote E e decisões", abaixo).
   - **`0.12.1` publicada em 26/09/2026** (pedidos #9 e #10): E10 (recuo de baixo das três
     folhas), E9 (`LinkButton` no nativo) e E11 (`Grid` reparte a sobra). **Falta o aceite de
     aparelho** dos blocos E9, E10 e E11 do `apps/native-smoke`.
     **E4b fechado sem defeito (30/09/2026):** a lista do `Combobox` rola; a testada no app era
     curta. As cópias de diagnóstico R0 a R5 saíram do `apps/native-smoke`.
4. **Lote E** saiu na `0.11.0` — ver "Lote E e decisões de 25/09/2026", abaixo.
5. **Lote 5** (componentes novos e o resto): N-01 a N-09 · B-11 · B-13 · C-11 · C-12 · C-14 ·
   M-03 · M-04. Só acrescenta, então cabe depois da `1.0`.
6. **Lote F (nativo), `0.14.0`, publicado dentro da `0.14.1` em 02/10/2026:** R-10, R-12, R-14,
   R-16, R-19 — propostas aprovadas pelas pranchas (*"ok, 30 e 24"*). **Falta o aceite de
   aparelho** dos blocos LF do `apps/native-smoke`. O que falta da fila está no
   [`docs/FILA.md`](docs/FILA.md) §8.
7. **`0.15.0`, publicada em 02/10/2026** (pedido #27), pelo terminal do Victor: R-11 (toda prop de ícone do nativo aceita
   o próprio desenho do app, `AureaIcon`) · R-15 (o glifo do `EmptyState` numa moldura redonda —
   a "C" da prancha; a `illustration` foi reprovada e saiu) · R-18 (`Timeline` com `icon`, `tone`,
   `trailing` e `between`) · R-21 (`FileInput` em `/system/file`) · R-22 (o `PhotoInput` abre a
   foto; miniatura quadrada de 64, X todo fora) · E13 (no navegador, o nativo manda
   `useNativeDriver: false`). Escolhas do Victor: *"1 c, 2 sim, 3 sim"* e *"B pode seguir"*. Falta
   o aceite de aparelho dos blocos R-11, R-15, R-18, R-21 e R-22.
8. **`0.16.0`, publicada em 02/10/2026** (por volta das 19:45, Brasília), pelo terminal do Victor: no tema claro, a letra de destaque passa do
   marrom ao amarelo escurecido `#826202` ([ADR-0054](decisions/0054-no-tema-claro-a-letra-de-destaque-e-ouro-escuro.md)),
   a "D" da prancha (*"D"*). As fotos do catálogo vieram da CI no pedido #30 (o `main` voltou ao
   verde em 02/10/2026).
9. **`0.16.1`, publicada em 03/10/2026** (por volta das 08:40, Brasília), pelo terminal do Victor,
   da junção do pedido #33: o círculo do `BottomNav` `circle-bold` virava um risco no app rodando no
   navegador — o `react-native-web` passa `flex: 0` cru para o CSS. E na barra estreita
   (`width="content"`) o rótulo cortava dentro do círculo, na web e no nativo. Aprovado pela
   imagem (*"pode"*). Para a barra menos larga, o app passa `width="content"`.
10. **`0.17.0`, publicada em 03/10/2026** (por volta das 16:50, Brasília), pelo terminal do Victor, da junção do pedido #35 ([ADR-0055](decisions/0055-a-barra-de-baixo-fica-parada-na-altura-do-telegram.md)):
   o `BottomNav` não anda mais quando se troca de aba (o nome escolhido engrossava, e o círculo do
   `circle-bold` era o próprio item); fica na altura do Telegram (54 a 62, era 73), com o nome
   colado no ícone; e ganha `capsule` (Material 3 Expressive) e `expand` (só o escolhido mostra o
   nome — exceção, por ordem do Victor, à regra "o nome nunca some"). A "B" da bancada já existia:
   é o `pill`. O app não muda nada para a barra parar e afinar. Falta o aceite de aparelho (bloco
   `0.17` do `apps/native-smoke`).
11. **`0.18.0`, publicada em 03/10/2026** (por volta das 22:18, Brasília), pelo terminal do Victor,
   da junção do pedido #38 — o Lote G, aprovado pela bancada (*"pode, aprovado o lote G"*). Quatro pedidos de um consumidor novo, da web (`docs/FILA.md` §9): AN-07 (o
   `Progress` sem total, com `detail` e `tone`), AN-08 (`Grid` com `min` por nome), AN-04 (`NavList`
   com `avatar` e `indicators`) e AN-01 (o `AppShell` com o botão de recolher na junção e a trilha
   sozinha entre 1024 e 1279 — [ADR-0056](decisions/0056-a-lateral-recolhe-pelo-botao-na-juncao.md)).
   O shell vivo se mede no banco novo `apps/keyboard-probe/shell.html`. Falta o aceite de aparelho
   (blocos AN-07, AN-08 e AN-04 do `apps/native-smoke`). ⚠ O empacotador do app reescreve `:dir(rtl)` e a regra deixa de pegar:
   na folha do core, direção se resolve com propriedade lógica, não com `:dir()`.
12. **`0.19.0`, o Lote H, publicado dentro da `0.19.1` em 04/10/2026** (pedido #40) — os quatro pedidos que
   faltavam do consumidor novo da web (`docs/FILA.md` §9): AN-06 (`TreeView` que carrega ao abrir,
   `selectedId`), AN-05 (`Gallery` com escolha em lote, vídeo e carga por partes), AN-03
   (`MessageComposer` que anexa, responde e edita) e AN-02 (`MessageList` para conversa longa). **Sem
   dependência nova**: a conversa é uma janela que o app troca pelas pontas, e a Aurea não deixa a
   tela pular (decisão do Victor, [ADR-0057](decisions/0057-a-conversa-longa-e-uma-janela-sem-virtualizacao.md)).
   Medido montado no banco `apps/keyboard-probe/lote-h.html` (`tests/visual/lote-h.spec.ts`). Aprovado
   pela bancada (*"Pode"*, 04/10/2026), com o item da árvore em cápsula, pedido dele olhando a
   bancada. As seis regras de `:dir(rtl)` que sobraram (`Badge`, `Select`,
   `Switch`) ficaram para depois, por decisão dele (`docs/FILA.md` §6, D-01).
13. **`0.19.1`, publicada em 04/10/2026** (por volta das 18:38, Brasília), pelo terminal do Victor, da junção do pedido #41: no Android o escolhido do `BottomNav`
   saía quadrado no `capsule` e no `circle-bold` (e, pela mesma causa, no `circle`, `circle-raised` e
   `circle-outline`). ⚠ **A regra que custou caro:** no React Native, caixa que só tem
   `borderRadius` e ganha cor DEPOIS de montada não recebe o raio no Android (react-native#52415,
   aberto) — ela leva `collapsable={false}`, ou cor/borda desde o começo. Quem cobra:
   `tests/unit/native-capsula-android.test.tsx`. **Aceito no aparelho Android do Victor** em
   04/10/2026 (bloco `0.19.1`, no topo do `apps/native-smoke`: *"deu certo"*). Leva a `0.19.0` junto.

### Lote E e decisões de 25/09/2026

- **`0.11.0` · Lote E** (achados do app de 25/09/2026, nativo), **publicada em 25/09/2026 sem o
  aceite de aparelho**: E1, E3, E4, E5, E6, E7, E8 e o `Badge` com as medidas do `Chip` do HeroUI
  Native. **Pendente:** a sessão do app medir no aparelho, ou rodar os blocos E1–E8 do
  `apps/native-smoke`. O **E4** decide a causa (suspeita, não medida); o E7 e o E8 são desenho.
- **Para o Lote 3** (decisões do Victor, 25/09/2026): **E2**, o `Button` do nativo obedece o pai,
  como no HeroUI, com um `align` no `Stack` do nativo · **M-01** (`render`) só no `Button`, no
  `IconButton` e nos itens de navegação · **M-02** (`classNames` por parte) **descartado**: o
  HeroUI tirou isso na versão atual, e abriria a aparência das peças por dentro.
- **A medir:** as medidas das peças da WEB contra o `@heroui/styles`, pela regra das medidas.
  O `Badge` do nativo foi o primeiro a passar; a web não foi medida.

### Pendências soltas, sem lote nem decisão

- Largura mínima do `Combobox` (o resto da A-13).
- Capa vertical cortada no `MediaEmbed` (capa em pé numa caixa deitada). Precisa de "pode".
- `Select` e `Combobox` lado a lado mostram o vazio de jeitos diferentes. Observação do app.
- C-06 (`option` sem estilo no escuro) provavelmente morreu com o `Select` novo. **Medir antes de
  fechar.**
- O nativo **nunca rodou num iPhone**. Antes de prometer a `1.0`, rodar o teste de aparelho no iOS.

### Como cada lote anda

1. Ler a ficha e **conferir contra o código** antes de aceitar.
2. **Ver como o HeroUI faz.**
3. Consertar como **acréscimo**, com teste que **falha** no defeito antigo.
4. Verificar: `python scripts/validate.py` · `pnpm build` · `npx vitest run` ·
   `node scripts/check-pack.mjs` · `node scripts/publicar.mjs --dry-run` · e no navegador os
   testes do Playwright (Chromium em `/opt/pw-browsers/chromium` nas sessões de nuvem).
   - ⚠ **`--write-manifest` e `--write-state` regravam e ENCERRAM o script, sem conferir nada**
     — e juntos, só o primeiro roda. Rode cada um **sozinho**, e depois o `validate.py` **puro**:
     só a linha `Aurea validation: OK` prova a conferência. Em 01/10/2026 a `0.12.4` foi
     verificada com os dois juntos, o `STATE.md` ficou velho e o `main` ficou vermelho.
5. **Desenhar antes e depois e mostrar ao Victor.** Só está aprovado depois que ele vê; teste
   verde não é aprovação.
6. Levantar a versão nos **nove** arquivos (`package.json` da raiz, os sete pacotes e
   `packages/contracts/aurea.contract.json`), com a seção no `CHANGELOG.md`.
7. **Pedir o "pode"**, empurrar a branch e abrir o pedido de junção para o `main`. Quem junta e
   publica é o Victor.
8. Depois que ele publicar, anotar aqui e no `CHANGELOG.md`.

**Duas regras do Victor, de 23/09/2026:** o `main` fica **sempre** atualizado (lote aprovado vai
para a branch **e** para o `main`), e **só está aprovado depois que ele VÊ**.

**E a de 03/10/2026, para o `BottomNav`:** *"agora só vai ser aprovado e enviado para git quando eu
ver funcionando"*. Imagem parada não basta: ele vê a peça RODANDO, com toque (a bancada com o
código real no `react-native-web`, publicada como página), e só depois do "pode" dele ela entra
no git.

---

## 4. Publicar e empurrar

- **O site `aureauds.dev` é o catálogo, e publica sozinho** (decisão do Victor, 01/10/2026). Depois
  da CI verde no `main`, o `.github/workflows/site.yml` monta `site-dist/` (`scripts/montar-site.mjs`)
  e manda para a Cloudflare (Workers, plano gratuito). Os segredos `CLOUDFLARE_API_TOKEN` e
  `CLOUDFLARE_ACCOUNT_ID` vivem só nas configurações do GitHub; **nunca** na conversa nem em arquivo.
  - **A trava** (ordem do Victor, 01/10/2026): o site é feito **só com a Aurea**. O check 45
    reprova importação de fora (vale o que o `@aurea-uds/react` declara) e recurso de outro
    endereço. Peça que falta no site se cria **na Aurea**, nunca no site.
- **Publicar é um comando, da raiz: `node scripts/publicar.mjs`.** Com `--dry-run` ele confere
  tudo e não publica. O `npm login` e o publish são do Victor; agente roda só o `--dry-run`.
  - O script empacota com `pnpm` (que traduz o `workspace:` das dependências internas) e publica o
    tarball com `npm`. Publicar direto com `npm publish` sairia com `workspace:^` literal e o
    pacote não instalaria em ninguém.
  - O passo 0 confere `npm whoami` antes de empacotar: a sessão do npm dura cerca de 2 h, e sem
    sessão o registro responde `E404`, que parece "pacote não existe".
- **Nenhuma leitura de registro decide logo depois de um publish.** A ficha, a lista de versões, a
  consulta direta e o `npm pack` atrasam. **Quem decide é a saída `+ pacote@versão` no terminal de
  quem publicou.** Resposta negativa sua nessa janela não é evidência de nada.
- **O push faz parte do preparo.** Se a resposta manda o Victor dar `git pull`, o push já tinha de
  ter acontecido. Pedir o "pode" na mesma mensagem que manda puxar garante que ele puxe o vazio.
- **Quando o Victor mede uma coisa e você tem a explicação do seu lado, a explicação é sua até
  prova em contrário** — nunca a máquina dele.
- **Verificação é local antes de empurrar.** No repositório privado a CI estava parada por limite
  de gasto; no público, o GitHub Actions é gratuito.
- **A pasta local do Victor foi refeita em 24/09/2026 a partir do público.** A antiga apontava para
  o `aurea-uds-privado`, e o `git pull` respondia "Already up to date" puxando do repositório que
  não recebe mais nada. Se um `git pull` dele não trouxer o que foi juntado, a primeira pergunta é
  `git remote -v`.

---

## 5. Identidade visual — INTOCÁVEL

- Superfícies flutuantes; cartões, janelas e painéis com raio 22px (`--radius-card`).
- Campos, filtros, abas e botões de texto em cápsula (`--radius-control: 999px`).
- Amarelo primário `oklch(0.795 0.184 86.047)` invariável entre temas — e **invariável dentro de
  cada MARCA** ([ADR-0036](decisions/0036-marca-e-um-eixo-e-o-amarelo-continua-invariavel.md)).
  Marca é um eixo próprio (`data-brand`), ortogonal a `data-theme`, e **redefine só COR**. Sem
  `data-brand`, nada muda. Trocar o amarelo do padrão é proibido.
- ~~IBM Plex Sans / Serif / Mono; Carbon Icons~~ → **Atkinson Hyperlegible Next e ícones Phosphor
  Regular** (decisão do Victor, 01/10/2026,
  [ADR-0053](decisions/0053-a-fonte-e-a-atkinson-e-os-icones-sao-o-phosphor.md)). **Feita na
  `0.13.0`**, publicada em 01/10/2026. Decidido também: o item escolhido usa o Phosphor Fill, o código usa a Atkinson
  Hyperlegible Mono, e a IBM Plex Serif sai (o `--font-editorial` fica como apelido da fonte do
  texto até a `1.0`, para não quebrar quem o usa). Aberto: o peso do ícone pequeno (ADR, "A medida").
- **No tema claro, o amarelo como LETRA ou ÍCONE é o `brand-yellow-text`** (`#826202`, o mesmo
  matiz, escurecido até 4,5:1 no pior fundo), e não o marrom (decisão do Victor, 02/10/2026,
  [ADR-0054](decisions/0054-no-tema-claro-a-letra-de-destaque-e-ouro-escuro.md)). Onde o amarelo é
  FUNDO, é o amarelo de verdade. O foco e o controle marcado continuam no marrom.
- Sem gradientes (nem funcionais).
- Temas escuro e claro equivalentes; densidades compact / comfortable / spacious.
- Proibido: Material, Fluent, Bootstrap ou shadcn como aparência; caixas retangulares genéricas;
  trocar paleta, raios, tipografia ou densidade sem autorização.
- **Marca registrada de terceiro não entra** numa biblioteca Apache-2.0 (logos de Google, Apple
  etc.). O `Button` do nativo tem `leading`/`trailing` para o app pôr o desenho dele, e o slot **não tinge**
  o que recebe.

---

## 6. Nomes privados — PROIBIDOS

O repositório não pode conter os nomes de projetos e agentes privados do Victor, **nem menção a
outros projetos dele** (ordem de 31/08/2026). Falar do consumidor numa conversa é normal;
**escrever o nome dele num arquivo** não é.

- **Consumidor real se escreve como "o consumidor", "o app", "o item"** — nunca pelo produto, pelo
  repositório ou pelo ramo. A forma atravessa (quantas telas, que peças); o domínio, não. Conteúdo
  de exemplo usa nomes genéricos: Messenger, Analyst, Curator, Writer, "Relatórios".
- **A lista de nomes NÃO mora no repositório** (decisão do Victor, 24/09/2026). O `validate.py`
  a lê de:
  1. a variável de ambiente `AUREA_NOMES_PRIVADOS`, nomes separados por `;` — configurada no
     ambiente das sessões de nuvem e como segredo do repositório no GitHub;
  2. ou o arquivo `.nomes-privados` na raiz, um nome por linha — na máquina local; o git o ignora.
- **Sem a lista, o `validate.py` reprova.** Se isso acontecer numa sessão, a variável do ambiente
  não está configurada: avise o Victor. **Nunca** peça para ele colar a lista na conversa, e nunca
  escreva a lista em arquivo rastreado.
- Rodar `python scripts/validate.py` depois de QUALQUER alteração e antes de qualquer publicação.
- Para reusar um gate, reuse a **função** dele (`scan_text`, `decode_any`), não a sua ideia do que
  ela faz.

---

## 7. Como trabalhar

**Leitura antes do primeiro edit, nesta ordem:**

1. [`STATE.md`](STATE.md) — os números do projeto (gerado; nunca escrever contagem à mão).
2. [`audit/2026-07-26-integral/04-PROTOCOLO-IA.md`](audit/2026-07-26-integral/04-PROTOCOLO-IA.md)
   — como trabalhar e o que registrar no fim.
3. [`decisions/`](decisions/README.md) — o que já foi decidido. **Decisão registrada não se reabre
   sem evidência nova**; decisão nova entra lá, não em prosa solta.
4. [`docs/QUALITY.md`](docs/QUALITY.md) — quando uma coisa está pronta, e quem cobra.
5. [`docs/MAP.md`](docs/MAP.md) — onde mexer para fazer o quê.
6. [`docs/BUILDING.md`](docs/BUILDING.md) — como se constrói um componente. **Componente novo não
   começa sem ler isto.**
7. [`docs/NATIVE.md`](docs/NATIVE.md) — o alvo nativo (React Native).
8. [`docs/PLANO-1.0.md`](docs/PLANO-1.0.md) — o caminho até a `1.0`.

**As regras que custaram caro:**

- **Medir, não contar.**
- **Correção local é proibida sem responder "quem mais tem esse problema?"**
- **Mudança de comportamento vem com o controle que pega a regressão, no mesmo commit** — e o
  controle tem de ser **provado contra o defeito**, não só passar no estado atual. Gate que só
  concorda com o presente não é gate.
- **Escolher a entrada que exercita o código é parte do teste.** Um teste que passa com o defeito
  dentro é o achado mais comum deste projeto.
- **Afirmação velha se trata por espécie:** viva (alguém age com base nela hoje) → corrigir;
  histórica e datada → carimbar a data, não apagar; histórica que lê como atual → riscar com `~~`
  e pôr a correção ao lado.
- **A linha que envelhece primeiro é a que ninguém relê porque já leu:** cabeçalho, resumo de topo.
  Quem fecha um lote passa o olho no cabeçalho dos documentos irmãos.
- **Antes de aceitar uma demanda como "peça nova", procure na web se ela já existe lá.**

**Referências de desenho:**

- A pasta `Referencia/` (código de terceiros) fica fora do git. **A pasta ausente não é desculpa**
  (ordem de 12/09/2026): o inventário do HeroUI está versionado (seção 2).
- **Copiar só quando o Victor mandar** (ordem de 20/08/2026). Sem ordem dele, o padrão é ler.
- **A licença manda em cima da ordem.** Conferir o `LICENSE` antes de copiar; o
  [`docs/BUILDING.md`](docs/BUILDING.md) §2 tem as conhecidas. Código não-comercial ou AGPL não
  entra numa base Apache-2.0. O que for copiado leva crédito no
  [`docs/REFERENCES.md`](docs/REFERENCES.md) e um comentário curto no ponto de uso.
- Copia-se estrutura e geometria, nunca a paleta nem a pilha deles; tudo passa pelos tokens da
  Aurea.
- **Arquivo que o Victor mandar no chat se lê INTEIRO** — é provável pedido de implementação.

---

## 8. O alvo nativo, o que não é óbvio

- **Quantos componentes existem se mede:** os valores com inicial maiúscula exportados por
  `packages/native/src/index.ts`, `sistema.tsx` e `arquivo.tsx` (desde a `0.15.0`), menos os dois
  provedores e as duas constantes.
- **`DatePicker` e `PhotoInput` não saem pela porta da frente do pacote:** vivem em
  `@aurea-uds/native/system`, como os ícones vivem em `@aurea-uds/native/icons/*` (ADR-0038).
  O **`FileInput`** (R-21, `0.15.0`) vive num caminho só dele, `@aurea-uds/native/system/file`:
  no `/system`, todo app do `DatePicker` teria de instalar o `expo-document-picker`.
- **A `Table` do nativo não é uma tabela:** cada linha vira um cartão, e a API é `columns` + `rows`.
- **O `Chart` do nativo é o único cuja geometria é nossa** (ADR-0041). Com duas ou mais séries a
  legenda não desliga: a paleta `--chart-*` é uma rampa de um azul só.
- **O compilador não pega papel de acessibilidade errado no React Native** (a união termina em
  `| string`). Quem pega é o `check 41` do `validate.py`.
- **Peça marcada como elemento de acessibilidade não pode ter coisa tocável dentro:** no iPhone o
  que está dentro some para o VoiceOver. Quem pega é o `check 43`; conteúdo que o consumidor
  entrega é ponto cego dele.
- **Teste que pergunta ao dublê não prova o aparelho.** Peça nova aparece no `apps/native-smoke/`
  antes de sair; rodar é na máquina do Victor: `node apps/native-smoke/rodar.mjs`.

---

## 9. Ferramentas

- pnpm 12 (workspace em `pnpm-workspace.yaml`), desde 30/09/2026. O aviso "Update available" do
  pnpm não é ordem de atualizar: a versão sobe junto no `packageManager`, no `pnpm-lock.yaml` e na CI,
  com "pode", depois de testada numa cópia.
- TypeScript 7 strict (o binário `tsc` é o compilador nativo; usar a linha de comando).
- Python para scripts utilitários (`python`, não `python3`, no Windows).
- ⚠ **O terminal do Victor é o Windows PowerShell 5.1, que não aceita `&&`.** E `;` **não é
  equivalente**: ele segue depois de um erro, o que transforma uma cadeia de verificação em
  teatro. Para ele, **um comando por linha**; quando o comando é nosso, a ordem vai para dentro do
  script.
- Licença Apache-2.0; Atkinson Hyperlegible sob OFL 1.1; Phosphor Icons sob MIT (ADR-0053, desde a
  `0.13.0`; até a `0.12.4`, IBM Plex e Carbon).

## 10. Decisões já tomadas pelo Victor (16/07/2026)

1. Licença Apache 2.0.
2. Motor sem aparência: **Base UI** (`@base-ui/react`).
3. Tokens no formato **DTCG 2025.10** (`$value`/`$type`).
4. Fontes em pacote próprio, `@aurea-uds/fonts`.
5. Gradientes substituídos. Não reintroduzir.
6. Gestor: pnpm workspaces.
