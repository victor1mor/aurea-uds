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

O detalhe de cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

### O próximo passo

1. **O repositório está aberto desde 24/09/2026**, com um commit só. O histórico antigo e o diário
   ficaram no privado (`aurea-uds-privado`), que não recebe mais envios. Termos técnicos
   consagrados ficam em inglês (mobile, bundler, pull request, issue) — decisão do Victor, 24/09.
2. **A sessão do app adota as peças novas** e mede no aparelho.
3. **O Lote 3 espera um "pode":** M-01 (`render` em todos) · M-02 (`classNames` por parte) · B-02
   (`Text`/`Heading`) · A-04 (nome de ícone checado pelo TypeScript) · B-09 (foco com uma linha).
   Na leitura de 24/09/2026, ele vem **antes** da `1.0`, porque muda a estrutura das peças.
4. **Lote 5** (componentes novos e o resto): N-01 a N-09 · B-11 · B-13 · C-11 · C-12 · C-14 ·
   M-03 · M-04. Só acrescenta, então cabe depois da `1.0`.

### Pendências soltas, sem lote nem decisão

- Largura mínima do `Combobox` (o resto da A-13).
- Capa vertical cortada no `MediaEmbed` (capa em pé numa caixa deitada). Precisa de "pode".
- `Select` e `Combobox` lado a lado mostram o vazio de jeitos diferentes. Observação do app.
- C-06 (`option` sem estilo no escuro) provavelmente morreu com o `Select` novo. **Medir antes de
  fechar.**
- 16 fotos de referência do `catalog.spec.ts` estão velhas (de 11/09/2026) e reprovam igual no
  `main` limpo. Regravar pede olhar cada uma antes.
- O nativo **nunca rodou num iPhone**. Antes de prometer a `1.0`, rodar o teste de aparelho no iOS.

### Como cada lote anda

1. Ler a ficha e **conferir contra o código** antes de aceitar.
2. **Ver como o HeroUI faz.**
3. Consertar como **acréscimo**, com teste que **falha** no defeito antigo.
4. Verificar: `python scripts/validate.py` · `pnpm build` · `npx vitest run` ·
   `node scripts/check-pack.mjs` · `node scripts/publicar.mjs --dry-run` · e no navegador os
   testes do Playwright (Chromium em `/opt/pw-browsers/chromium` nas sessões de nuvem).
5. **Desenhar antes e depois e mostrar ao Victor.** Só está aprovado depois que ele vê; teste
   verde não é aprovação.
6. Levantar a versão nos **nove** arquivos (`package.json` da raiz, os sete pacotes e
   `packages/contracts/aurea.contract.json`), com a seção no `CHANGELOG.md`.
7. **Pedir o "pode"**, empurrar a branch e abrir o pedido de junção para o `main`. Quem junta e
   publica é o Victor.
8. Depois que ele publicar, anotar aqui e no `CHANGELOG.md`.

**Duas regras do Victor, de 23/09/2026:** o `main` fica **sempre** atualizado (lote aprovado vai
para a branch **e** para o `main`), e **só está aprovado depois que ele VÊ**.

---

## 4. Publicar e empurrar

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

---

## 5. Identidade visual — INTOCÁVEL

- Superfícies flutuantes; cartões, janelas e painéis com raio 22px (`--radius-card`).
- Campos, filtros, abas e botões de texto em cápsula (`--radius-control: 999px`).
- Amarelo primário `oklch(0.795 0.184 86.047)` invariável entre temas — e **invariável dentro de
  cada MARCA** ([ADR-0036](decisions/0036-marca-e-um-eixo-e-o-amarelo-continua-invariavel.md)).
  Marca é um eixo próprio (`data-brand`), ortogonal a `data-theme`, e **redefine só COR**. Sem
  `data-brand`, nada muda. Trocar o amarelo do padrão é proibido.
- IBM Plex Sans / Serif / Mono; Carbon Icons; sem gradientes (nem funcionais).
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
  `packages/native/src/index.ts` e `sistema.tsx`, menos os dois provedores e as duas constantes.
- **`DatePicker` e `PhotoInput` não saem pela porta da frente do pacote:** vivem em
  `@aurea-uds/native/system`, como os ícones vivem em `@aurea-uds/native/icons/*` (ADR-0038).
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

- pnpm 11 (workspace em `pnpm-workspace.yaml`).
- TypeScript 7 strict (o binário `tsc` é o compilador nativo; usar a linha de comando).
- Python para scripts utilitários (`python`, não `python3`, no Windows).
- ⚠ **O terminal do Victor é o Windows PowerShell 5.1, que não aceita `&&`.** E `;` **não é
  equivalente**: ele segue depois de um erro, o que transforma uma cadeia de verificação em
  teatro. Para ele, **um comando por linha**; quando o comando é nosso, a ordem vai para dentro do
  script.
- Licença Apache-2.0; IBM Plex sob OFL 1.1; Carbon Icons sob Apache-2.0.

## 10. Decisões já tomadas pelo Victor (16/07/2026)

1. Licença Apache 2.0.
2. Motor sem aparência: **Base UI** (`@base-ui/react`).
3. Tokens no formato **DTCG 2025.10** (`$value`/`$type`).
4. Fontes em pacote próprio, `@aurea-uds/fonts`.
5. Gradientes substituídos. Não reintroduzir.
6. Gestor: pnpm workspaces.
