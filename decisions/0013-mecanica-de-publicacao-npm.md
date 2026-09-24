# ADR-0013 — Como se publica: primeiro publish local com 2FA, depois trusted publishing

- **Data:** 31/07/2026
- **Estado:** aceita · **primeiro passo CUMPRIDO, segundo à espera de configuração** — o publish
  local com 2FA aconteceu **sete vezes**: `0.1.0` (31/07/2026), `0.2.0` (12/08), `0.3.0`, `0.4.0`
  e `0.5.0` (20/08), a `0.6.0` (30/08), a `0.7.0` (11/09), a `0.8.0` (12/09) e a **`0.8.1` em
  13/09/2026**, que é onde os **sete** pacotes estão agora — **dez vezes**, não sete.
  🔴 **E a `0.8.1` acrescentou um PASSO 0 a esta mecânica**, porque ela quase se perdeu num erro
  que mente: o `E404 Not Found - PUT` do npm é falta de **AUTENTICAÇÃO**, não pacote inexistente
  — 401 revelaria se o pacote existe, então o registro devolve 404 de propósito. O `npm whoami`
  dizia `E401`: a sessão tinha expirado, e **desde dez/2025 ela dura ~2 h**. O `publicar.mjs`
  passou a conferir a sessão ANTES de empacotar (e não no `--dry-run`, que é o caminho do agente). O passo 1 desta ADR está, portanto, satisfeito para todos: os sete EXISTEM, que era a
  condição que o npm impõe para aceitar um trusted publisher.
  ✅ **E a `0.7.0` é a primeira do `@aurea-uds/native`** — o que desbloqueia configurar o trusted
  publisher dele, que antes era impossível por não haver pacote.
  🔴 **Ela também é a que provou que o comando desta ADR tinha ficado INSUFICIENTE**, não errado: o
  `npm publish` não traduz `workspace:`, e o `native` é o primeiro pacote publicável com dependência
  interna. Detalhe na seção dos comandos, abaixo; o publish virou `scripts/publicar.mjs`.
  O passo 2 ganhou o arquivo que faltava — `.github/workflows/release.yml`, escrito em 30/08/2026,
  com `id-token: write`, disparo manual confirmado por escrito, a cadeia inteira de verificação e
  a ordem de publicação desta ADR. **Ele não publica nada enquanto o trusted publisher de cada
  pacote não for configurado em npmjs.com** (Settings → Trusted publisher: repositório, o nome
  `release.yml`, o ambiente `npm`) e o ambiente `npm` não existir em Settings → Environments.
  **CONFIGURADO em 30/08/2026, e o npm aceitou.** O trusted publisher está nos SEIS pacotes
  (`victor1mor/aurea-uds`, `release.yml`, ambiente `npm`, permissão `npm publish`), e o ambiente
  `npm` existe no repositório. A dúvida que esta ADR levantava — se o npm recusaria por causa da
  provenance ausente em repositório privado — **não se confirmou**: a configuração passou. A
  provenance continua ausente, que é outra coisa e já estava declarada.

  **O QUE FALTA NÃO É DAQUI.** Os jobs de CI são recusados antes de começar — medido em
  30/08/2026: três jobs, duas branches, **2 segundos cada e nenhum log** (HTTP 404), que é a
  assinatura do limite de gasto que o `CLAUDE.md` registra desde 07/08. Enquanto isso valer, o
  `release.yml` não roda, e o caminho de publicação continua sendo o local com 2FA. A
  configuração fica guardada e não se perde.

  **Como publicar quando a CI voltar:** Actions → Release → Run workflow → escrever `PUBLICAR`.
  A versão sai dos `package.json`; não há número a digitar. A alternativa rejeitada ganhou **prazo** desde então: os tokens que
  pulam o 2FA perderam gestão de conta e pacote em 31/07/2026 e perdem publicação direta em
  ≈01/2027 ([changelog do GitHub](https://github.blog/changelog/2026-07-31-restricting-npm-bypass-2fa-granular-access-tokens/)),
  então o caminho por token não é mais só pior — ele acaba
- **Complementa:** a [ADR-0010](0010-distribuicao-npm-publico.md), que decidiu *onde* publicar
  (npm público, escopo `@aurea-uds`) e não disse *como*
- **Autoria:** recomendação do Opus, a partir de pesquisa feita em 31/07/2026 — não de memória

## Contexto

A ADR-0010 deixou "publicar" como um ato sem mecânica escrita. A mecânica que qualquer pessoa
(ou agente) assumiria por hábito — **criar um token no npm, guardar como `NPM_TOKEN` no GitHub
e publicar pela CI** — **não funciona mais**. Pesquisado em 31/07/2026:

| Fato | Consequência aqui |
|---|---|
| Os **classic tokens do npm foram revogados em 09/12/2025** — não podem ser criados nem restaurados | O caminho `NPM_TOKEN` clássico está morto, não apenas desaconselhado |
| Os **granular tokens** valem no máximo 90 dias e exigem 2FA | Um segredo de CI com token expira sozinho a cada trimestre |
| **Trusted publishing (OIDC)** é o padrão OpenSSF, GA no npm desde 07/2025, e dispensa token | É para onde isto vai |
| Trusted publishing exige **npm CLI ≥ 11.5.1 e Node ≥ 22.14** | Esta máquina: npm 11.9.0, Node 24.14.0 — atende |
| O npm **exige que o pacote JÁ EXISTA** para configurar um trusted publisher | O primeiro publish **não pode** ser por OIDC |
| **Provenance não é gerada para repositório privado**, mesmo publicando pacote público | E o `aurea-uds` é privado (verificado com `gh repo view`) |

O último item é o que amarra tudo, e amarra numa coisa que já estava escrita: a condição 2 da
ADR-0010 diz que tornar o repositório público expõe, pelo **histórico do git** e pelo
`legacy-reference.html`, os nomes privados que o `CLAUDE.md` proíbe. Ou seja: **provenance
depende de uma decisão que ainda não foi tomada, e que não é técnica.**

## Alternativas

**A. Granular token guardado como segredo do GitHub, publish pela CI.** Rejeitada como destino.
É a versão sobrevivente do hábito antigo, e carrega os defeitos que o trusted publishing existe
para eliminar: um segredo de longa duração que vaza junto com qualquer coisa que leia o
ambiente do runner, e que ainda expira a cada 90 dias — então o custo de manutenção é
recorrente e a falha é sempre no pior momento.

**B. Publicar sempre à mão, da máquina do Victor.** Rejeitada como destino, **aceita para o
primeiro publish**. Não sobrevive a mais de um release: o que sai é o que estava na pasta
naquele instante, sem a garantia de que a CI passou, e é exatamente o modo de falha que o gate
`dist == build` existe para impedir.

**C. Esperar o repositório virar público para publicar com provenance.** Rejeitada. Acopla a
publicação a uma decisão sobre histórico do git que pode demorar, e o `README` continua
ensinando um comando que falha enquanto isso.

**D. Primeiro publish local com 2FA; trusted publishing dali em diante.** Escolhida.

## Decisão

1. **O primeiro publish de cada pacote é local**, da máquina do Victor, com a conta dele e
   **2FA**, e só depois de `pnpm build && python scripts/validate.py && pnpm test &&
   pnpm exec playwright test && node scripts/check-pack.mjs` passarem com a árvore limpa. É a
   única forma de o pacote existir, e o pacote precisa existir para o passo 2.
2. **Configurado o trusted publisher** de cada pacote em `npmjs.com` (organização/usuário,
   repositório, nome do arquivo de workflow, ambiente), **todo publish seguinte sai da CI**, sem
   token nenhum.
3. **Nenhum token de longa duração entra nos segredos do repositório.** Se um granular token for
   necessário para o passo 1, ele vive na máquina, é usado uma vez e é revogado.
4. **Provenance fica declarada como ausente** enquanto o repositório for privado. Não é
   negligência e não é contornável por configuração — quando (e se) o repositório virar público,
   ela passa a ser gerada sozinha, sem `--provenance`.

## Os comandos do primeiro publish

Na máquina do Victor, com a árvore limpa e tudo verde. `npm login` abre o navegador e pede o
2FA — **nenhum agente faz esse passo**, e nenhum token entra em arquivo do repositório.

```bash
npm login
```

```bash
pnpm build && python scripts/validate.py && pnpm test && pnpm exec playwright test && node scripts/check-pack.mjs
```

Depois, um pacote por vez, **nesta ordem, e são SETE** — o `tokens` primeiro porque o `native`
depende dele de verdade (`dependencies`), e o `native` por último; o `react` fica antes dele
porque é o que a documentação de instalação faz depender dos outros.

### 🔴 Empacotar com `pnpm`, publicar o tarball com `npm` — e por quê

**Medido em 10/09/2026, preparando a `0.7.0`.** O `@aurea-uds/native` é o **primeiro** pacote
publicável desta casa com dependência interna, então este caminho nunca tinha sido exercitado:

```
npm  pack -> "@aurea-uds/tokens": "workspace:^"    <- NÃO INSTALA EM NINGUÉM
pnpm pack -> "@aurea-uds/tokens": "^0.7.0"         <- correto
```

`workspace:` é protocolo do pnpm; fora dele não é versão válida. **Publicado assim, o pacote
quebra na instalação de todo consumidor** — e o `npm publish` não traduz.

Os seis anteriores não têm nenhuma dependência interna, e é por isso que seis releases com
`npm publish` passaram sem tocar nisso. **Não é que o comando antigo estivesse errado: ele deixou
de bastar quando o sétimo pacote nasceu.**

⚠ **Quem ENVIA continua sendo o npm**, de propósito — `npm publish <arquivo>.tgz`. Assim o
mecanismo de credencial não muda: 2FA no local, OIDC na CI. Trocar para `pnpm publish` também
resolveria a tradução, mas abriria duas perguntas novas que **não** estão medidas: se o
trusted publishing por OIDC funciona por ele, e o `--publish-branch`, cujo padrão é `master` e
que recusaria qualquer branch de trabalho. **Provado em 10/09/2026:** `npm publish` aceita
caminho de tarball e lê dele o nome e a versão certos.

⚠ **E medido antes de uniformizar:** para os seis sem dependência interna, o tarball do `pnpm`
é equivalente ao do `npm` — **mesma lista de arquivos e mesmo manifesto**, mudando só a ORDEM
das chaves. Uniformizar não muda o que eles já publicavam.

**⚠ O comando encadeado com `&&` não roda no terminal desta máquina, e isso foi descoberto
executando — 12/08/2026, no publish da `0.2.0`.** O PowerShell 5.1 **não tem** os operadores
`&&` e `||`: a linha falha no parser antes de chegar ao npm.

### 🔴 O publish virou SCRIPT, e a razão é o histórico desta própria seção

**Um comando, da raiz do repositório:**

```
node scripts/publicar.mjs --dry-run
```

```
node scripts/publicar.mjs
```

O primeiro empacota, confere tudo e **não publica**. O segundo publica, pedindo 2FA a cada
pacote. Se parar no meio, rodar de novo **continua de onde parou** — ele pula o que já está no
registro.

**Por que não é mais uma linha de shell.** Esta seção documentou um `foreach` de PowerShell, e
ele envelheceu **três vezes em três meses**:

| quando | o que estava errado |
|---|---|
| 12/08/2026 | usava `&&`, que o PowerShell 5.1 não tem — descoberto **no meio** do publish da `0.2.0` |
| 10/09/2026 | o caminho estava escrito à mão (`C:\dev\aurea-uds`) e o repositório mora em outro lugar |
| 10/09/2026 | a lista tinha **seis** pacotes, e o repositório tem sete desde o Lote 0 |

E a versão que eu escrevi para substituí-lo tinha um defeito **silencioso**:
`Get-ChildItem ... | Select-Object -Last 1` ordena por **nome**, então no dia em que existir uma
`0.10.0` ela perde para a `0.7.0` e o script publica o tarball errado.

É a mesma conclusão que o `apps/native-smoke/rodar.mjs` já havia forçado, e agora vale para o
passo mais irreversível do projeto: **ordem de execução é código, não sintaxe de shell.**

**O script PARA antes de publicar quando:**

1. um pacote está numa versão diferente dos outros;
2. o tarball levaria protocolo `workspace:`;
3. o tarball diz um nome ou versão diferente do esperado;
4. falta `publishConfig.access: "public"`;
5. a lista de pacotes do script divergiu dos pacotes publicáveis no disco — nos **dois** sentidos.

As guardas 1, 2, 4 e 5 estão provadas contra o defeito (10/09/2026): versão fora de sincronia
reprova; trocando `pnpm pack` por `npm pack` ele **para no `native`** nomeando
`dependencies.@aurea-uds/tokens="workspace:^"`; `publishConfig` removido reprova; e a divergência
de lista reprova tanto com pacote fora da lista quanto com pacote inexistente dentro dela. A
guarda 3 é defesa em profundidade e **não** foi provada por injeção — está dito em vez de
contado como provado.

⚠ **O `npm login` e o publish continuam sendo do Victor.** O `--dry-run` é o que um agente pode
rodar, e ele não fala com o registro além do `npm view`.

Antes de tudo, `npm publish "<tarball>" --dry-run` mostra o que sairia — e sobre o tarball de
verdade, que é a pergunta certa. O `publishConfig.access: "public"` está nos **sete** (medido em
10/09/2026), então não é preciso `--access public`.

**Cada pacote pede o 2FA separadamente** — são **sete** confirmações. Com chave de segurança
(WebAuthn), o npm abre o navegador em vez de pedir código digitado; medido no publish da `0.2.0`,
com `auth-type = web` já configurado nesta máquina.

⚠ **O `@aurea-uds/native` não tem trusted publisher configurado**, então ele não sai pela CI
enquanto isso não for feito em `npmjs.com`. Pelo caminho local com 2FA, sai.

### O que obriga isso, em vez de ficar só escrito aqui

- **`scripts/check-pack.mjs`** empacota com `pnpm` os pacotes que têm dependência de workspace e
  reprova se `workspace:` sobreviver ao tarball — desde 03/09/2026.
- **`check 42` do `validate.py`**, de 10/09/2026: o conjunto de pacotes publicáveis no disco tem
  de bater com a lista do `check-pack.mjs` **e** com os laços do `release.yml`, e o workflow não
  pode publicar com `npm publish` de dentro da pasta do pacote enquanto houver dependência
  `workspace:`. Ele nasceu reprovando os três defeitos reais: o `release.yml` publicava **seis**,
  conferia **seis**, e publicava pelo caminho que não traduz.

**Em seguida, e só então:** em `npmjs.com`, para cada pacote, *Settings → Trusted publisher* —
usuário/organização, repositório, nome do arquivo de workflow e ambiente. A partir daí o publish
sai da CI sem token.

## Como isso é obrigado

- **O que sai no tarball:** `scripts/check-pack.mjs`, com baseline versionado em
  `scripts/package-files.json`, rodando na CI. Provado contra o defeito: pondo `src` no `files`
  do core, reprova por duas vias independentes — o arquivo que o baseline não previa **e** a
  regra de "fonte não viaja".
- **`publishConfig.access: "public"`** nos seis pacotes. Sem isso o npm trata pacote com escopo
  como privado e o publish falha — é o erro que se descobre no pior momento possível.
- **A CI já bloqueia** com `dist == build`, os gates duros de Playwright e o gate de pixel.

## Consequências

**Boas:** o caminho normal de release não tem segredo para vazar; o primeiro publish é um ato
consciente de uma pessoa com 2FA, que é o que ele deve ser.

**Custos, declarados:**

- **O primeiro publish é manual e não é reproduzível pela CI.** Seis pacotes, seis atos.
- **Sem provenance no início.** Quem instalar não terá como verificar por atestado de onde o
  tarball veio. Está escrito aqui em vez de ficar implícito.
- **`repository` aponta para um repositório privado**, e por tabela não há canal público de
  issue. Um consumidor recebe código que não pode inspecionar nem reportar. Isto é
  consequência da decisão de manter o repositório privado, não desta ADR — mas publicar a
  torna visível para estranhos, e por isso está registrada aqui.
- **O trusted publisher amarra o publish a um arquivo de workflow por nome.** Renomear o
  workflow quebra o publish até alguém reconfigurar no npm.

**Revisão:** quando o repositório virar público (condição 2 da ADR-0010, que exige tratar o
histórico do git), esta ADR é revisada para exigir provenance — que passa a vir de graça.
