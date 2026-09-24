# Smoke test no celular — CINCO modos

App **descartável**. Existe por ordem do Victor, 02/09/2026, ao aprovar o Lote 0:

> *"O que mais me preocupa não são as vulnerabilidades nem a exceção do nome privado. É começar a
> construir 6 componentes sobre uma fundação nativa que passou em testes de código, mas ainda
> nunca renderizou em React Native de verdade."*

**Ele abre no modo `lote7`**, que é o mais novo e o único cujo lote inteiro saiu publicado **com
teste e nenhum vidro** (`NATIVE.md` §8.6). Os modos antigos continuam a um toque de distância,
porque cada um é o registro do que já foi provado.

| modo | pergunta | gabarito |
|---|---|---|
| **`lote7`** (abre nele) | **8 perguntas** — busca, número formatado e imagem | ⚠ **NUNCA RODOU** |
| `resto` | 11 perguntas — Lotes 3, 4, 5, 6 e o `Chart` | ✅ passaram as 11 em 10/09/2026 |
| `Lote 2` | 8 perguntas — o painel de leitura | ⚠ 7 de 8 em 10/09; falta meia (ver abaixo) |
| `Screen` | 3 perguntas — safe area, paisagem, scroll | ⚠ rodou em 04/09: 1 passou, 1 parcial, 1 sem resposta |
| `Lote 0` | 4 perguntas — pesos, ícones, troca de tema, cor | ✅ passou em 03/09/2026 |

⚠ **A meia pergunta que falta no `Lote 2`:** com «Remover animações» ligado no Android, o
`Spinner` e o `Skeleton` têm de PARAR. Os anéis giram (visto em foto), mas a preferência estava
DESLIGADA nas duas rodadas — a linha `menos movimento:` no topo daquela tela vira **`SIM`** quando
ela liga, e é assim que se sabe se o teste realmente aconteceu.

---

## 🔴 O modo `lote7` é o primeiro que NÃO é só de Android

As peças de busca, número e imagem foram escritas para os **dois** sistemas, e **três das oito
perguntas só existem porque o iOS se comporta diferente**:

| nº | por que o iOS decide sozinho |
|---|---|
| **3** | a janela do iOS **não encolhe** com o teclado (`inputs.tsx:732-733`); no Android o `adjustResize` resolve de graça. Sem o `KeyboardAvoiding`, a folha de 90% fica inteira ATRÁS do teclado — **é a pergunta que bloqueia o cadastro** |
| **5** | **não há botão VOLTAR no iOS.** Lá a saída por gesto é o puxador, e só ele |
| **6** | o `decimal-pad` do iOS **não tem tecla de menos** (`numero.tsx:255-259`) — por isso o campo com `min` negativo troca de teclado |

**Rodar só no Android responde CINCO das oito.** Está escrito aqui, e repetido na própria tela,
para que ninguém escreva "passou" sobre a metade — que é exatamente o erro do "11/11" inflado de
09/09/2026.

### A pergunta 1 não tem toque, e é a mais barata das oito

Ela é **leitura**: o motor de JavaScript do telefone não é o Node em que os 1409 testes rodam, e o
`NumberField` inteiro depende de duas coisas dele — `Intl.NumberFormat` e `String#normalize`. Se o
`Intl` vier sem a tabela de `pt-BR`, **a moeda sai formatada errada e sai em silêncio**. A tela
mostra os separadores medidos por sonda, não presumidos.

### As oito, e o que cada uma custa se falhar

O critério completo está **na tela**, ao lado do que ele julga — a resposta não pode depender de
memória nem deste arquivo. Aqui fica só o preço de cada uma.

| nº | pergunta | se falhar |
|---|---|---|
| 1 | o motor do aparelho formata como o nosso? | **toda moeda do app sai errada, em silêncio** — sem erro, sem lançar |
| 2 | a folha abre com o teclado JÁ em pé? | um toque a mais por cadastro, vezes o dia inteiro. O `autoFocus` vira dívida |
| 3 | ⚠ com o teclado aberto a lista continua visível? | **bloqueia o cadastro no iOS** — a pessoa digita e não vê resultado nenhum |
| 4 | rolar a lista **e** arrastar o puxador? | se (a) falhar o gesto está largo demais; se (b) falhar o iOS fica sem saída por gesto |
| 5 | ⚠ as três saídas — e o corpo que NÃO pode fechar | tocar para pôr o cursor no campo fecharia a folha. É regressão medida no `Select` em 10/09 |
| 6 | ⚠ o teclado certo, e a ida-e-volta do formato | campo que aceita negativo com teclado sem menos é campo quebrado |
| 7 | a busca acha sem acento? | exigir acento é exigir que a pessoa saiba escrever o que procura |
| 8 | a foto aparece, a quebrada não some, a grande cabe | grade que encolhe quando uma foto falha, e foto cortada onde se pediu para VER |

⚠ **O que NÃO está aqui, e é decisão:** o filtro, a espera de 250 ms, a paginação, o `FlatList` em
vez de `ScrollView` e a ida-e-volta do formato estão provados em **1409 testes**. Encher a tela do
que já foi provado esconderia as oito que importam — mesma regra do modo `resto`.

### O que o modo `resto` NÃO pergunta, e por quê

Ele é deliberadamente curto. **Só entram perguntas que um teste de código não pode responder** —
o dublê não é o sistema. A escala do `Chart`, o caminho com buraco, a régua do eixo, a divisão da
faixa das barras: tudo isso é aritmética, e a aritmética já está provada em 1338 testes. Encher a
tela do que já foi provado esconderia as onze que importam.

**As três mais caras, se você só tiver cinco minutos:**

| nº | por quê |
|---|---|
| **4** — o teclado numérico sobe? | é a **única** linha do plano do consumidor que o Lote 4 existe para cumprir |
| **6** — o botão VOLTAR fecha as quatro superfícies? | é o `Escape` do nativo, e **nenhum teste de código prova que o Android o entrega** |
| **11** — mil linhas rolam sem engasgo? | é a pendência que a ADR-0038 deixou aberta em 31/08/2026 — *"volta a importar quando existir tela de lista"*. **Esta é a tela.** |

---

## 🔴 No iPhone é preciso LOGIN — no Android não

Medido no changelog da própria Expo em 13/09/2026
([`expo.dev/changelog/expo-go-57-login`](https://expo.dev/changelog/expo-go-57-login)), palavras
deles:

> *"you will need to be logged in to the same account on both the terminal and in Expo Go"*
> *"This requirement currently only applies to the latest version of Expo Go for iOS"*

**Sem isso o iPhone mostra** *"You need to be signed in to Expo Go and Expo CLI to open your
project"* **e não abre nada.** O Android não exige, e é por isso que ele funciona sem nada disso.

O `rodar.mjs` confere e avisa antes de subir o servidor — é **aviso, não gate**, porque reprovar
pararia quem só usa Android.

### A) Token — o caminho de quem entra com Google

**Conta criada com Google não tem senha**, então `npx expo login` sem flag fica pedindo uma que não
existe. O token resolve sem navegador nenhum:

1. abra [`expo.dev/settings/access-tokens`](https://expo.dev/settings/access-tokens) e crie um
   **personal access token**;
2. no PowerShell, **na mesma janela** em que vai rodar o smoke:
   ```
   $env:EXPO_TOKEN = "cole-o-token"
   ```
3. confira: `npx expo whoami` — tem de imprimir o seu usuário.

⚠ **O `$env:` morre quando a janela fecha.** Refaça o passo 2 a cada janela nova.

**Por que isto funciona, medido no fonte do `@expo/cli@57.0.24`** (e não na documentação, que fala
só de EAS): `api/user/UserSettings.js:164` devolve `process.env.EXPO_TOKEN`, e
`api/user/user.js:106` aceita isso como credencial — `getAccessToken() || getSession()?.sessionSecret`.

### B) Navegador

```
npx expo login --browser
```

⚠ **No Windows isso pode morrer** com `cmd.exe /c start ... exited with non-zero code: 1` — o
`start` corta a URL no primeiro `&`. Contorno, medido em `utils/open.js:191`, que lê
`process.env.BROWSER`:

```
$env:BROWSER = "chrome"
npx expo login --browser
```

### E no iPhone

Expo Go → aba **Home** → **avatar** no canto → a **MESMA conta** do terminal.

⚠ **Não use `--sso`.** Ele é para SSO de organização (`expo.dev/sso-login`), não para conta pessoal
com Google — medido no `login/index.js`, onde `--sso` e `--browser` são flags diferentes.

---

## COMO RODAR — dois passos, e nenhum deles é Android Studio

**Você não precisa instalar SDK, emulador, nem configurar nada no PC.** Isso não é sorte: foi a
[ADR-0037](../../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md) que devolveu o
**Expo Go** ao trocar o Unistyles pelo `StyleSheet` puro. O Expo Go é um app da Play Store que lê
um QR code — **o seu celular vira o aparelho de teste**.

### Antes: o servidor tem de rodar NA SUA MÁQUINA

**Não dá para rodar na nuvem** — medido em 03/09/2026: o `--tunnel` do Expo precisa do ngrok, e
o proxy do container remoto não deixa o ngrok conectar (*"tunnel took too long to connect"*). O
celular precisa alcançar o servidor pela rede, e um container na nuvem não está na sua Wi-Fi.

Então o projeto precisa estar no seu PC. Se ainda não estiver:

⚠ **Clone numa pasta sua, não em `C:\Windows\System32`.** O PowerShell aberto como
administrador começa ali, e é fácil clonar sem perceber — mas é pasta do sistema, exige
privilégio para escrever e é lugar errado para um projeto. Use algo como `C:\dev` ou a sua
pasta de usuário:

```sh
cd $HOME
git clone https://github.com/victor1mor/aurea-uds.git
cd aurea-uds
git checkout claude/native-md-read-rjlbxq
```

*(Sem git? Baixe o ZIP: no GitHub, escolha a branch `claude/native-md-read-rjlbxq`, botão verde
**Code** → **Download ZIP**, e extraia.)*

Você precisa de **Node.js** ([nodejs.org](https://nodejs.org), versão LTS) e de **pnpm**
(`npm install -g pnpm`, uma vez só). O `rodar.mjs` confere os dois antes de começar: se faltar
algum, ele diz qual e qual comando resolve.

> ⚠ **O `preparar.mjs` roda um `pnpm install` filtrado, e ele é obrigatório.** Sem isso o
> `pnpm pack` do `native` falha num clone limpo com
> `ERR_PNPM_CANNOT_RESOLVE_WORKSPACE_PROTOCOL` — ele só converte `workspace:^` na versão de
> verdade se o pacote-alvo estiver instalado. **Esta seção já afirmou o contrário**, e a
> afirmação não tinha comando atrás: aqui passava porque a sessão já tinha instalado. O install
> é `--filter @aurea-uds/native --prod`, que nesse recorte é uma dependência só e leva ~1 s —
> não é o workspace inteiro.

> 🔴 **09/09/2026 — o dia em que este app rodou CINCO vezes e não julgou um componente.** Quatro
> das cinco mediram **entrega**, não interface. Três causas foram achadas e consertadas (o npm que
> não reinstalava, o `git pull` que abortava, o cache), e elas viraram os controles que estão neste
> script. **A leitura para quem chega agora:** se o passo 5 disser `conferido: N arquivos`, a
> entrega está provada e qualquer erro na tela é de COMPONENTE — que é o que este app existe para
> medir. Se ele reprovar, **não julgue nenhuma pergunta** antes de resolver.
>
> ⚠ **E a via sem PC não existe hoje.** Tentar servir o app de um agente na nuvem está medido e
> falha: túnel por ngrok quebra no TLS interceptado, SSH na 22 é bloqueado e na 443 morre no
> `kex_exchange_identification`. O `eas.json` na pasta prepara o caminho pela Expo, mas ele exige
> credencial da conta e **nunca rodou**. Detalhe no `NATIVE.md` §7.

### Os dois passos (o script faz SEIS por dentro)

**1.** No celular Android, instale o app **Expo Go** (Play Store, grátis, da Expo).

**2.** No PC, **na pasta raiz do projeto** (a que tem `package.json` e a pasta `apps/`), abra um
terminal e rode **um comando**:

```sh
node apps/native-smoke/rodar.mjs
```

**Qualquer terminal serve** — PowerShell, Prompt de Comando (cmd) ou Git Bash. No Windows, o jeito
mais fácil de abrir na pasta certa: abra a pasta no Explorador, clique na barra de endereço, digite
`powershell` e dê Enter.

Ele atualiza o repositório, **confere as props**, empacota, instala, **confere a entrega** e sobe o
servidor. Na primeira vez demora alguns minutos (baixa o Expo).

> 🔴 **O passo 2 — "conferindo as props do `App.js` contra o fonte da biblioteca" — nasceu em
> 12/09/2026, escrevendo o modo `lote7`.** Eu chamei `<NumberField onChangeValue={...}>`; o nome
> certo é `onValueChange`. **Nada pegou:** o `App.js` é `.js`, o Metro não tipa, e o campo teria
> subido mudo no aparelho — um `+` que não soma, sem erro no console. O gate lê as interfaces do
> FONTE (não uma lista escrita à mão, que envelhece) e custa menos de um segundo.
>
> Ele pega **nome errado e nome inventado**. Não pega tipo errado (`value="0"` contra `value={0}`)
> nem prop obrigatória que falta — está declarado no cabeçalho do `conferir-props.mjs`, porque
> gate cuja cobertura ninguém sabe é gate que se confia demais.

> 🔴 **O passo 5 do script — "conferindo que o app vai rodar o código recém-empacotado" — existe
> por um defeito de 09/09/2026, e é o pior tipo que este app pode ter.** Consertei dois bugs, o
> Victor rodou de novo, e viu **todos** os erros outra vez. O código novo estava dentro do
> tarball e **não estava** em `node_modules`: o `npm install` respondia `up to date` em 700 ms,
> porque o alvo `file:` tinha o mesmo nome de antes (mesma versão, código diferente).
>
> Rodar o artefato errado é a única falha deste app **sem sintoma** — ele não quebra, ele
> **responde as perguntas com confiança sobre um artefato que não existe mais**. Por isso agora o
> script compara o `dist/` de dentro do tarball com o instalado, hash a hash, e **para** se
> divergir. Se você vir *"O app NÃO está rodando o código que você acabou de empacotar"*, siga o
> que a mensagem manda apagar — e **não julgue nenhuma pergunta** antes de ela sumir.

**3.** Abra o Expo Go, toque em **Scan QR code** e aponte para o QR que apareceu no terminal.

O app abre no celular. Para sair: `Ctrl+C` no terminal.

> ✅ **O ciclo foi rodado ponta a ponta em 03/09/2026**, até onde é possível sem celular:
> o `rodar.mjs` empacotou, instalou e subiu o servidor, e o Metro **serviu o bundle** (HTTP 200,
> 4 MB) — que é exatamente o que o Expo Go baixa. O que falta é encostar o celular.

**Se não conectar:** o celular e o PC têm de estar na **mesma rede Wi-Fi**. Se ainda assim não
for, pare e rode `npx expo start --tunnel` de dentro de `apps/native-smoke` — mais lento, mas
funciona por fora da rede local.

> Também funciona em iPhone (o Expo Go existe na App Store), mas o pedido era Android e é lá que
> as quatro perguntas foram escritas para serem julgadas.

---

## ✅ RODOU, E PASSOU — 03/09/2026

O Victor rodou num Android. **As quatro perguntas passaram**, e a tela provou mais do que se pediu:

| # | resultado |
|---|---|
| 1 | cinco pesos distintos, e a linha de **controle** diferente das quatro |
| 2 | ícones na cor do texto; o `checkmark--filled` com o **visto vazado** |
| 3 | **182 ms** (tema + `spacious`) e **161 ms** (`compact`), sem piscar |
| 4 | `primary` **#f0b100** = esperado — **✓ bate** |

Além disso: Serif e Mono corretos, a grade de fontes fechada
(`IBMPlexSerif-Medium` e `IBMPlexMono-SemiBold` onde o IBM Plex não tem peso), o
`calendar--add--alt` do `<switch>` desenhado, a densidade **mudando o layout de verdade**, e a
identidade atravessando — amarelo, raio 22px, pill de 999px.

**Este app cumpriu o que existia para cumprir.** Ele continua aqui para a próxima vez que a
fundação nativa mudar — é mais barato reabrir do que reescrever.

---

## O GABARITO DO LOTE 2 — oito perguntas, 08/09/2026

O app abre aqui. Os dez componentes passaram em **29 testes unitários**, e o que aqueles testes
não fazem é **desenhar**: eles leem que altura, que cor e que papel o componente pediu. Um anel
que pede a rotação certa ainda pode engasgar; um selo com `top:-8` ainda pode cair torto sobre um
ícone real.

### 🔴 Antes de tudo: a pergunta que não é de vidro

**Ligue `Remover animações`** — Configurações → Acessibilidade no Android (no iOS,
"Reduzir movimento").

| o que tem de acontecer | |
|---|---|
| a linha do topo | passa a dizer **`menos movimento: SIM`** |
| os três anéis (pergunta 8) | **param** |
| os esqueletos (pergunta 9) | **param** |

**Se continuarem animando, o alvo nativo ficou MENOS acessível que a web na mesma peça** — lá o
`aurea.css:2128` para tudo de graça, e aqui quem pergunta é o componente. **Nenhum teste de código
pega isso**, porque o teste pergunta ao dublê, e o dublê não é o sistema.

### As oito, em ordem

| # | o que julgar | o que reprova |
|---|---:|---|
| **8** | os três `Spinner` giram liso | tremer ou engasgar — o laço é nativo, então tremida aqui é achado |
| **9** | o pulso do `Skeleton` parece respiração | pisca-pisca. 1,35 s por ciclo, até 55% de opacidade |
| **10** | o selo `8` cai **sobre o canto** do sino, com o anel do fundo separando | colado no meio, cortado para fora, ou o `0` aparecendo |
| **11** | os dois `KPI` são **cartões** — superfície, borda, raio 22 | texto solto sobre o fundo: o `KPI` deixou de ser `Card` |
| **11b** | as barras preenchem **82%** e **18%** | as duas cheias: a porcentagem não chegou ao estilo |
| **12** | o ponto de `offline` é um anel **OCO** | círculo cheio de outra cor — some a diferença para quem não distingue cores |
| **13** | os quatro `Alert` têm **glifo** na cor da variante | sem ícone: é o registro do app, e este app registra os quatro de propósito |
| **14** | em `stale` e `offline` o **número continua na tela**, com o aviso em cima | o número sumir: o componente trocou informação parcial por informação nenhuma |
| **15** | o primeiro `Avatar` mostra **`VM`** | buraco cinza: a queda para o `fallback` não funcionou |

A **14** é a mais importante do lote e a única que não se vê parado: toque em `estado:` até
passar por `loading`, `error`, `empty`, `stale` e `offline`. Os três primeiros **substituem** o
conteúdo; os dois últimos **acompanham** ele.

---

## ✅ O SMOKE DO `Screen` RODOU — 04/09/2026, e o resultado NÃO é um "passou" redondo

O Victor rodou no aparelho dele. **Uma das três passou, uma ficou parcial e uma ficou sem
resposta** — e a diferença entre "sem resposta" e "reprovada" é a coisa mais importante desta
seção.

| # | pergunta | resultado |
|---|---|---|
| 5 | safe area + padding | ⚠ **PARCIAL** — `medido 16 · 16` = `esperado 16 · 16`, ✓ bate em TODAS as combinações (sem scroll, com scroll, bordas 4, bordas só topo, dark, light). Mas **o inset era 0 nos quatro lados**: a conta fecha e não houve entalhe para somar |
| 6 | paisagem e bordas laterais | ⚠ **SEM RESPOSTA** — a legenda saiu `retrato` nas cinco fotos: o aparelho não girou. E, com inset 0, girar não mudaria o número |
| 7 | scroll e a barra de status | ✅ **PASSOU** — *"quando rolo ela sobe e some"*. A faixa é recortada no topo da área rolável e **não aparece por cima da barra de status** |

**O que a 5 provou mesmo assim, e não é pouco:**

1. O `Screen` aplica o padding do tema, e o `onLayout` confirma **pelo lado de fora** — não é o
   componente dizendo que fez; é a posição medida do filho.
2. Com `scroll` ligado o respiro **migrou para o `contentContainerStyle`** e continuou em 16, nos
   dois modos. Era o contrato da ADR-0040, e ele está de pé em aparelho.
3. A identidade atravessou: raio 22, pílula de 999px nos botões, e os dois temas.

### ⚠ Por que o inset foi zero — e por que isso NÃO é defeito do `Screen`

O Expo Go não estava desenhando embaixo das barras do sistema neste aparelho, então não havia
inset a reportar. **Medido, não deduzido:** no Expo SDK 57 o `edgeToEdgeEnabled` **deixou de ser
configurável** — o `withEdgeToEdge.js` do `@expo/prebuild-config` avisa que *"Android 16 makes
edge-to-edge mandatory"* e manda tirar a chave do `app.json`. Num build de verdade o inset existe
e o `Screen` tem o que somar.

O que **não** dá é exercitar a soma no Expo Go, neste aparelho.

### O que fecharia as duas que sobraram

Qualquer um dos dois, e nenhum é trabalho deste app:

- um **dev client** (`npx expo prebuild` + build), onde o edge-to-edge é obrigatório;
- um **aparelho ou emulador com entalhe** rodando edge-to-edge.

Até lá, a soma `inset + padding` continua provada **só no fonte C++ e no teste unitário** — que é
exatamente o que a [ADR-0040](../../decisions/0040-o-screen-adota-o-safe-area-context-como-peer.md)
declara como seu limite. **Ela não ficou pior; ficou medida.**

---

## O GABARITO DO `Screen` — como julgar cada uma, 03/09/2026

O app abre aqui. **Toda pergunta tem número na tela**, e o número esperado é calculado do inset
que o sistema deu mais o token `--space-4` — nunca de constante escrita à mão.

**O instrumento:** a **faixa amarela** é o primeiro filho do `Screen`, e o `onLayout` dela devolve
onde ela caiu dentro do pai. Em Yoga a posição de um filho é medida a partir da borda do pai, então
esse número **é o padding que o pai aplicou**.

**Por que isto precisa de aparelho:** a [ADR-0040](../../decisions/0040-o-screen-adota-o-safe-area-context-como-peer.md)
escolheu o `SafeAreaView` da biblioteca lendo o fonte C++, e provou o contrato em teste unitário —
mas o dublê de teste **não calcula inset nenhum**, porque quem calcula é código Kotlin/ObjC.

### 1. Safe area + o padding da Aurea

Olhe o cartão **"O que o sistema deu, e o que o Screen fez"**, com `scroll` **desligado**.

| linha | o que tem de acontecer |
|---|---|
| `medido y · x` | **`✓ bate`** em verde |
| conta | `medido y` = `inset topo` + `16` |

**O que cada falha significa** — e são três diferentes, não uma:

| se `medido y` sair… | significa |
|---|---|
| só o **inset** (ex.: 47) | o modo é `maximum`, não `additive` — a ADR-0040 leu o fonte C++ errado |
| só **16** | o inset não chegou; o `SafeAreaView` não está fazendo nada |
| **zero** | nem o padding do tema chegou; o `Screen` não aplicou a folha |

E olhe o **fundo**: a cor do tema tem de pintar **até debaixo da barra de status**. É padding, não
margem. Uma tira de outra cor no topo quer dizer que o `Screen` não está preenchendo.

### 2. Gire o aparelho — as bordas laterais

⚠ **O `rotacionar automático` do Android precisa estar LIGADO.** O `app.json` deixou de travar em
retrato exatamente para esta pergunta (`orientation: "default"`, mudado em 03/09).

1. Gire para **paisagem**. A legenda do topo passa a dizer `PAISAGEM`.
2. Num aparelho com entalhe, `esq` ou `dir` no inset **tem de sair de 0** — e o `medido x`
   acompanha, continuando `✓ bate`.
3. Toque em **`bordas: 4`** para virar **`bordas: só topo`**. O `medido x` tem de **cair para 16**,
   porque as outras três bordas viram `off`.

**Se o `x` não mudar em nenhum dos dois casos**, a lista de bordas não está sendo respeitada — e o
padrão de quatro bordas do `Screen` é decoração.

⚠ **Aparelho sem entalhe pode dar `esq 0 · dir 0` em paisagem, e isso NÃO é falha.** Nesse caso o
passo 3 é o que decide: `4` e `só topo` têm de dar o mesmo `x`, e aí a pergunta fica **sem resposta
neste aparelho** — não aprovada. Diga qual foi o caso.

### 3. O scroll e a barra de status

Toque em **`scroll: desligado`** para ligar.

| o que fazer | o que tem de acontecer |
|---|---|
| olhar o `esperado` | **cai para 16** — o inset saiu do conteúdo e foi para o viewport. É o contrato, não um bug |
| olhar a faixa amarela | fica **no mesmo lugar físico da tela** que estava sem scroll |
| rolar para cima | a faixa é **recortada na linha de baixo da barra de status** — ela não passa por baixo da barra |

A segunda linha é a que prova o conjunto: o respiro **mudou de lugar no código** (raiz →
`contentContainerStyle`) e **o desenho não mudou**. Se a faixa pular ao ligar o scroll, os dois
caminhos não são equivalentes.

**Se ela passar por baixo da barra de status**, o inset não está no viewport — e aí o `Screen`
está deixando conteúdo debaixo do relógio.

---

## O GABARITO DO LOTE 0 — ✅ já respondido em 03/09/2026

Fica aqui como registro. O modo `lote0` é alcançável pelo botão `← smoke do Lote 0`.

O critério aparece **na própria tela**, ao lado do que ele julga. Aqui fica a versão curta.

### 1. Os cinco pesos são distintos?

**Passa:** as quatro linhas — Regular, Medium, SemiBold, Bold — parecem **visivelmente diferentes**
umas das outras, ficando mais grossas de cima para baixo. A linha itálica está inclinada. E a
última linha do bloco (*"Sem fontFamily"*) parece **diferente das outras** — ela é o controle,
sai na fonte do sistema.

**Reprova:** todas iguais. Aí o nome PostScript não resolveu e a
[ADR-0039](../../decisions/0039-uma-familia-por-peso-no-nativo.md) está errada. **É o achado mais
caro que este app pode dar** — e é bom que apareça agora, não depois de seis componentes.

**Reprova também:** se todas ficarem iguais **inclusive a de controle** — aí nenhuma fonte
carregou, e o problema é o `useFonts`, não o nome.

### 2. Os ícones desenham, e na cor certa?

**Passa:** os três aparecem na cor do texto (não pretos num tema claro), e crescem na fileira de
tamanhos abaixo. O do meio (`checkmark--filled`) é um **círculo cheio com um visto vazado dentro**.

**Reprova:** o do meio aparece como **círculo totalmente cheio, sem o visto**. Isso significa que o
miolo `fill="none"` foi pintado — o defeito que o gerador foi escrito para evitar.

**Reprova:** qualquer um deles vazio, ou todos pretos num tema claro.

### 3. A troca de tema dói?

Toque em **trocar tema** e nas densidades. O número em **ms** aparece no topo.

**Passa:** abaixo de ~200 ms, e a tela troca sem piscar.

**Reprova:** acima disso, ou piscando. Aí a aposta da ADR-0037 (contexto nosso, sem as otimizações
do Unistyles) precisa de revisão — e isso é **ADR nova**, não conserto solto.

As 40 linhas existem para isso: um cartão só não exercita re-render nenhum.

### 4. Sombra e cor pintam certo?

**Passa:** o cartão tem sombra visível (sutil no tema claro), e a linha abaixo dos quadrados diz
`✓ bate` para o amarelo.

**Reprova:** nenhuma sombra — o `boxShadow` do RN 0.76+ foi assumido 1:1 com o CSS **sem teste**,
na Etapa 2. Ou `✗ NÃO BATE` no amarelo.

---

## O que já foi provado sem aparelho — 03/09/2026

Escrever este app já respondeu mais do que se esperava. Tudo abaixo saiu de
`npx expo export --platform android`, que roda o Metro de verdade:

| o que | resultado |
|---|---|
| os três pacotes **instalam** como tarball | sim, `npm install` limpo |
| o `exports` com `./icons/*` **resolve no Metro** | sim — era cláusula 1 da ADR-0038, nunca testada |
| o **caminho profundo poda** | **723 módulos**. Os 3 ícones importados estão no bundle; `logo--kubernetes` e `wikis` **não** |
| o `require()` dos `.ttf` **resolve** | sim, os 11 viram assets do bundle |
| os **nomes PostScript** chegam ao bundle | `IBMPlexSans-SemiBold`, `IBMPlexSerif-Medium`, `IBMPlexMono-Regular` |
| bundle de bytecode (`.hbc`) | 1,7 MB |

⚠ **Isso elimina a classe "não abre", e não substitui o aparelho.** Empacotar prova que o grafo de
módulos fecha; **não** prova que um glifo aparece, que cinco pesos são distintos ou que a troca de
tema não pisca. As quatro perguntas continuam sendo do celular.

**E duas armadilhas que este app desarmou antes de morder:**

1. `npm pack` grava `"@aurea-uds/tokens": "workspace:^"` no tarball, que **não instala em lugar
   nenhum** — só o `pnpm pack` converte para `^<versão>`. O `check-pack.mjs` ganhou a trava, e o
   `scripts/publicar.mjs` (11/09/2026) faz do `pnpm pack` o único caminho de publicação.
2. A escala de fontes mentia: `editorial[400]` e `code[700]` não existem no IBM Plex, e quem
   pedisse recebia `undefined` — fonte de sistema, em silêncio. O provider passou a fechar a grade.

---

## Como isto está montado, e por quê

- **Fora do workspace pnpm** (`pnpm-workspace.yaml`), para nenhum `pnpm install` desta casa baixar
  o Expo por causa de uma coisa que se usa uma vez por lote.
- **Consome os pacotes por tarball**, não por link de workspace. Link exigiria `watchFolders` no
  Metro, e uma falha de configuração do bundler não ensina nada sobre a fundação nativa — que é a
  única coisa que este app existe para medir. De quebra, isto testa **o artefato**: o que o
  `check-pack.mjs` mede em lista de arquivos, o app roda de verdade.
- **`npm`, não `pnpm`**, justamente para ser um consumidor comum.

Rode `node preparar.mjs` de novo a cada mudança em `packages/` — os tarballs são um retrato, não
um link. (O `rodar.mjs` já faz isso.)

## A fronteira — ela MUDOU em 03/09/2026, e por ordem do Victor

**A regra antiga era:** *"nenhum componente da Aurea entra aqui — eles não existem. Se este app
precisar de um `Text` nosso, virou Lote 1 e parou."* Ela valeu enquanto não havia componente, e o
`check 39` da época a guardava.

**Hoje:** o Lote 1 existe, o `check 39` trocou de pergunta, e o Victor pediu o oposto — *"faça
somente o smoke test do `Screen`"*. Então o modo `screen` **importa o `Screen` de verdade**.

A fronteira nova é mais estreita, não mais larga:

- o modo `lote2` usa **nove** componentes da Aurea — são exatamente os que estão em julgamento;
- o modo `screen` usa **um**, o `Screen`;
- o modo `lote0` continua **sem nenhum** — é o instrumento que já respondeu, e mexer nele
  invalidaria o registro;
- nada mais entra sem outro pedido.

## Versões, medidas em 03/09/2026

O `expo install --fix` alinhou o SDK 57 para **react-native 0.86.3** e **react 19.2.3** — o RN
`0.87.1` que o `@aurea-uds/native` traz como devDependency de typecheck está **à frente** do que o
Expo estável usa. Não é conflito: o peer do pacote é `>=0.76`.

**O `Screen` empacotou.** `npx expo export --platform android` rodou o Metro de verdade em
03/09/2026 e fechou o grafo: **738 módulos** (eram 723 antes do `Screen`), com
`react-native-safe-area-context` e o `Screen` resolvidos. **Isso mata a classe "não abre" e não
responde nenhuma das três perguntas** — empacotar prova que o grafo fecha, não que um inset existe.

⚠ **Uma dependência entrou aqui depois, e não é para este app usar.** O `Screen` do Lote 1 (03/09,
autorizado pelo Victor) tornou `react-native-safe-area-context` **peer** do `@aurea-uds/native` —
e como o `preparar.mjs` reempacota os tarballs a cada execução, o peer novo passa a valer também
para este app. Ele está declarado no `package.json` daqui só para o install não tentar resolver o
peer sozinho.

A versão é **`~5.7.0`**, e não a última (`5.9.1`): é o que o `bundledNativeModules.json` do
**Expo SDK 57** fixa — medido, não escolhido. O peer do pacote é `>=5`, e o modo `additive` de
borda que o `Screen` usa existe **desde a 5.0.0** (medido no `SafeAreaView.js` das duas versões),
então as duas pontas do intervalo estão cobertas.

**A tela deste app continua sendo a do Lote 0.** Ele não importa o `Screen`, e a fronteira do fim
desta página vale igual: se um dia ele precisar de um componente da Aurea para funcionar, virou
outra coisa.
