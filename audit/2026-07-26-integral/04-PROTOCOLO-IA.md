# Protocolo de sessão para agentes · estado atual · próxima tarefa

> **CANÔNICO desde 30/07/2026** (Fase 10, tarefa T10.4). Deixou de ser proposta: o `CLAUDE.md`
> aponta para cá na ordem de leitura obrigatória, e as Fases 1 a 9 foram executadas por ele.
>
> Continua **neste caminho** de propósito. Mover para a raiz quebraria os links que os quatro
> documentos da auditoria trocam entre si, e criaria um segundo lugar para a mesma coisa — que é
> o defeito que a Fase 10 existe para fechar, não para repetir. O que é história (§2 daqui para
> baixo, por fase) fica datado; o que é regra (§1) vale sempre.
>
> A parte VIVA deste arquivo são o §2 (estado) e o §3 (próxima tarefa) — os dois são reescritos
> ao fim de cada fase, e é o que a próxima sessão lê primeiro.

---

## 1. Protocolo de sessão

### Antes de começar (leitura obrigatória, nesta ordem)

1. `CLAUDE.md` — identidade intocável, nomes privados proibidos, toolchain.
   **Vence sobre qualquer outro documento**, porque é injetado em toda sessão.
2. [`STATE.md`](../../STATE.md) — o estado, gerado e gateado (check 13). Não editar à mão.
3. `AUREA.md` §1–2 e §5 — o que a Aurea é, princípios, ordem macro.
4. [`decisions/`](../../decisions/README.md) — o registro de decisões. O que não migrou ainda está em `AUREA.md` §4.
5. `audit/2026-07-26-integral/02-ACHADOS.md` — achados abertos.
6. `audit/2026-07-26-integral/03-PLANO.md` — a fase autorizada e só ela.
7. [`QUALITY.md`](../../docs/QUALITY.md) — quando a coisa está pronta, e quem cobra cada critério.
8. [`MAP.md`](../../docs/MAP.md) — onde mexer para fazer o quê. Atalho, não substituto do código.
9. A documentação específica da tarefa: ficha do componente em
   `packages/contracts/registry/`, `REFERENCES.md` se envolver referência externa, e
   `DIRECTION.md` se envolver nome ou categoria.
10. O código real dos arquivos que a tarefa toca. **Ler antes de editar, sempre.**
11. Confirmar dependências: a fase anterior está concluída?
12. Declarar o escopo da sessão em uma frase, antes do primeiro edit.

### Durante

- Trabalhar **só** no escopo declarado. Escopo novo entra como tarefa registrada,
  não como acréscimo silencioso.
- Não presumir. Medir. Toda afirmação de estado tem comando reprodutível atrás.
- Não criar padrão paralelo, componente duplicado nem documento concorrente.
- Correção local é proibida sem responder: **quem mais tem esse problema?**
  Foi a ausência dessa pergunta que produziu A2, A3 e A4.
- Toda mudança de comportamento vem com o controle automático que pega a regressão,
  no mesmo commit.
- Não introduzir dependência sem justificativa registrada.
- Após qualquer alteração: `python scripts/validate.py`.

### Antes de encerrar

Registrar, no formato abaixo:

```
Tarefa: <id do plano>
Arquivos analisados: <lista>
Arquivos alterados: <lista>
O que mudou: <uma frase por mudança>
Decisões tomadas: <id do ADR, ou "nenhuma">
Testes executados: <comando + resultado numérico>
Falhas: <o que quebrou, ou "nenhuma">
Limitações: <o que não deu para verificar e por quê>
Pendências: <o que ficou, com id>
Riscos: <o que pode ter quebrado sem gate>
Próxima tarefa exata: <id + primeira ação concreta>
Critério de continuidade: <como a próxima sessão sabe que pode começar>
```

Proibido encerrar com "continuar depois", "melhorar os componentes", "revisar o
restante" ou "finalizar a interface".

### Verificação obrigatória por fase (já vale hoje, `CLAUDE.md`)

```bash
python scripts/validate.py
```

```bash
pnpm test
```

```bash
pnpm exec playwright test tests/visual/catalog-sweep.spec.ts tests/visual/geometry.spec.ts tests/visual/rtl.spec.ts tests/visual/status.spec.ts
```

Mais: abrir o catálogo e o exemplo vanilla no navegador sem erro de console, e conferir
visualmente nos dois temas.

---

## 1b. SESSÃO DE 20/08/2026 — duas versões publicadas e o eixo de marca

> **É AQUI QUE A PRÓXIMA SESSÃO COMEÇA A LER.** O trabalho seguinte está escrito em
> [`ATIVIDADE-2.md`](../../docs/historia/ATIVIDADE-2.md) — a ordem do Victor de inventariar seis plataformas e
> copiar em massa. **Nada dela foi começado.**

```
Tarefa: sessão livre — quatro frentes autorizadas por ele, uma de cada vez

Arquivos analisados: STATE.md · PLANO-1.0.md · 02-ACHADOS.md · decisions/ · QUALITY.md ·
  BUILDING.md · packages/core/src/aurea.css · packages/react/src/navigation-client.tsx ·
  packages/react/src/layout-client.tsx · packages/react/src/overlays.tsx ·
  packages/tokens/src/aurea.tokens.json · apps/catalog/content/BottomNav.mjs ·
  apps/catalog/content/blocks/insight.mjs · scripts/build-tokens.mjs · scripts/build-catalog.mjs ·
  tests/visual/skin.spec.ts · Referencia/langfuse-main · Referencia/ui-main ·
  Referencia/material-ui-master · o ui-kit-standalone da marca (fora do repo)

Arquivos alterados: os seis package.json + a raiz + aurea.contract.json (versão) · CHANGELOG.md ·
  scripts/released-surface.json · packages/core/src/aurea.css · packages/tokens/src/aurea.tokens.json ·
  packages/react/src/navigation-client.tsx · apps/catalog/content/BottomNav.mjs ·
  apps/catalog/content/blocks/insight.mjs · packages/contracts/registry/BottomNav.json ·
  scripts/build-tokens.mjs · scripts/build-catalog.mjs · package.json (build:live) ·
  tests/unit/components.test.tsx · tests/visual/skin.spec.ts · tests/visual/marca.spec.ts (novo) ·
  QUALITY.md · PLANO-1.0.md · CLAUDE.md · decisions/0036 (novo) · 10 baselines (5 win32 + 5 linux
  na 0.5.0; 14 win32 + 16 linux ao longo do dia)

O que mudou:
  1. O sidebar responsivo do Codex foi revisado, medido e commitado (ADR-0035).
  2. O bloco `analytics-workbench` transbordava 23px — e o diagnóstico que eu dei primeiro
     estava ERRADO (ver Limitações).
  3. `BottomNav` reescrito em DOIS EIXOS (`variant` + `indicator`, sete indicadores), com as
     medidas do Material 3 pesquisadas, rótulo visível em todos e sem realce de mouse.
  4. A Aurea ganhou EIXO DE MARCA (`data-brand`) e a primeira marca, `lory` (ADR-0036).
  5. A lateral passou a se pintar com os tokens DELA — conserto que vale sem marca nenhuma.
  6. `pnpm build` passou a reconstruir o runtime do catálogo (`build:live` não era chamado por
     ninguém: qualquer mudança deixava as prévias rodando código velho, em silêncio).
  7. `0.4.0` e `0.5.0` publicadas no npm, as duas provadas instalando do registro.

Decisões tomadas: ADR-0035 (sidebar responsivo, do Codex) · ADR-0036 (marca é um eixo) ·
  QUALITY.md critério 12b (prévia tem de RODAR) · K4 do PLANO-1.0 reescrito para não reabrir
  a pergunta do consumidor real, que a ADR-0022 decidiu em 13/08

Testes executados: python scripts/validate.py = OK (34 checks) · pnpm test = 834/834 ·
  pnpm test:visual = 185/185 nos três motores (eram 167; as 18 novas são a marca.spec) ·
  node scripts/check-pack.mjs = OK · node scripts/check-published.mjs = OK na 0.4.0 e na 0.5.0 ·
  as 44 baselines conferidas nas DUAS máquinas, segunda passada 22/22 em cada

Falhas: nenhuma aberta. Duas fecharam no dia — o `catalog-sweep` reprovava no Chromium e no
  Firefox pelo transbordo do workbench.

Limitações:
  - O gate de pixel e o `skin.spec` rodam SEM marca. Regressão que só apareça sob `data-brand`
    passa; quem cobre marca é só a `marca.spec`, e ela mede a LATERAL, não a página inteira.
  - Contraste sob `lory` não foi medido componente a componente.
  - O push segue suspenso: 166 commits locais. O npm tem o código; o GitHub não.

Pendências: ATIVIDADE-2.md, inteira. E o `.doc-nav` continua sendo chrome do catálogo morando
  dentro do CSS do core (achado A6, nunca movido) — metade da confusão de especificidade do dia
  saiu daí.

Riscos: a marca `lory` foi corrigida TRÊS vezes olhando a tela, e as três correções nasceram do
  Victor apontando, não de gate. A `marca.spec` cobre o que aprendi; não cobre o que eu ainda
  não sei que errei.

Próxima tarefa exata: ATIVIDADE-2.md §5 passo 1 — conferir a licença das seis fontes externas e
  registrar o quadro no REFERENCES.md, ANTES de abrir código de qualquer uma.

Critério de continuidade: a árvore está limpa, `validate.py` OK, e a `0.5.0` está no npm com os
  seis pacotes conferidos no registro. Pode começar.
```

### As três lições do dia, e as três custaram rodada

**1. Código de saída zero não é prova de trabalho certo.** Numa regravação de baseline o
`git checkout` no minipc FALHOU, o script seguiu (usava `set -uo pipefail` sem o `-e`) e o
contêiner regravou 14 arquivos num commit antigo. As duas passadas deram 22/22 e os `-win32`
ficaram intactos: **tudo verde e tudo errado**. Só não virou dano porque eu conferi o `git log`
de lá antes de copiar. O script agora compara `git rev-parse HEAD` com o hash mandado daqui e
**para** se divergir.

**2. Medir cor contra ela mesma não pega defeito de RELAÇÃO.** A lateral do `lory` saiu mais
escura que a página no tema escuro — o inverso do que a Aurea faz — e as três medidas de
contraste passavam, porque cada uma media o painel contra ele mesmo. A trava que pega isso é
`lumPainel >= lumPagina`, e ela nasceu depois de três rodadas.

**3. Documento não ganha do olho dele.** O kit da marca diz, escrito, que a lateral é "sempre
escura". Eu segui o documento e ignorei três vezes o que ele estava vendo na tela. O que a marca
carrega é o que ele aprovou olhando.
## 1b. Extrator é código crítico — regra a partir de 22/08/2026

Decisão do Victor, ao aprovar o `G-AXIS-06`: *"esta sessão produziu evidência suficiente de que
extrator é também código crítico"*.

> **Nenhum extrator novo entra na cadeia sem um fixture/controle conhecido que prove que ele não
> está omitindo informação silenciosamente.**

O formato, quando viável:

```text
entrada conhecida  →  resultado esperado conhecido  →  teste  →  uso no inventário real
```

**Se a ferramenta usada para provar cobertura não é provada, a cobertura não é confiável.**

### Os cinco defeitos que pagaram por esta regra

Todos reais, todos nesta atividade, e **todos errando para menos** — o que é pior que errar para
mais, porque some em silêncio em vez de chamar atenção:

| defeito | como apareceu | como se evita |
|---|---|---|
| **primeiro valor perdido** | um `^` sem `\s*` antes da quebra: contagens sempre um a menos, e eixo de valor único sumindo inteiro | controle contra um arquivo lido a olho, que FALHA o script se discordar |
| **janela fixa invadindo o componente seguinte** | ler N caracteres a partir do `export`: o `ButtonGroup` foi acusado do que o `Toolbar` faz | delimitar pelo próximo `export`, não estimar por janela |
| **componente aninhado confundido com prop do motor** | `[^>]` deixava um `size={}` de um `<IconButton>` dentro de `render={}` passar por prop do `<BaseCombobox>` | `[^><]`, e neutralizar a seta `=>` antes da busca |
| **constante confundida com componente** | `export const ESCALA={...}` contado como componente sem ficha; e a correção pelo NOME quebrou no `KPI`, que é componente e é todo maiúsculo | o sinal é a DECLARAÇÃO (`= {` / `= [`), não o nome |
| **formato sintático novo invisível para o gate** | o extrator parou de ver `size` quando ele virou `Responsive<size>` | o gate que confronta ficha × compilador ACUSOU — controle que existe antes do defeito |

### O que conta como controle

- **um caso conhecido a olho**, escrito no próprio extrator, que o faz falhar se discordar
  (`inventory-heroui.mjs` contra `button.styles.ts`);
- **um estado `NAO_TRIADA`/`INCONCLUSIVO`** que impede coisa nova de sumir em silêncio
  (`sweep-responsivo.mjs`);
- **um teste com entrada e saída conhecidas** (`custo-responsivo.test.tsx`, que mede por ESCALA
  porque nome de função não sobrevive à minificação);
- **um gate independente que confronta a saída com outra fonte** (o check 14, ficha × compilador).

Plausibilidade **não** é controle: quatro dos cinco defeitos acima produziram números plausíveis.

## 2. Estado atual — 26/07/2026, medido

### Trilhas

| Trilha | Fase | Estado |
|---|---|---|
| Biblioteca (`ROADMAP.md` fases 0–7) | 0–5 concluídas | 5 fechada; 6 e 7 exigem autorização (numeração da trilha Biblioteca — não confundir com as fases do plano de auditoria) |
| Catálogo (`AUREA.md` §5, 5 etapas) | etapa 3 em andamento | registry e inglês fechados; catálogo gerado existe; **todo item tem preview e código** (Fase 7); conteúdo rico segue em 21/65 |
| **Auditoria (`03-PLANO.md`, 11 fases)** | **as 11 executadas — plano FECHADO** | placar por achado em `02-ACHADOS.md` §0. A Fase 11 nasceu na 7 (achado A13) e fechou em 30/07/2026 |

### Números reais

**Estão em [`STATE.md`](../../STATE.md)**, gerado e gateado pelo check 13.

Aqui havia uma tabela copiada à mão — que é exatamente o defeito I1 se repetindo dentro do
documento que o denuncia. Removida na Fase 3. O que não é contável fica abaixo.

### O controle do pacote PUBLICADO, e as três camadas da prova (12/08/2026)

`node scripts/check-published.mjs` (ou `pnpm published:check`) instala os pacotes **do registro** num
projeto limpo fora do repositório e constrói os dois lados. **Não** roda no `validate.py` nem na CI:
precisa de rede e de versão publicada.

**Por que ele existe:** todo gate deste repositório mede a **árvore**. O `check-pack.mjs` confere o
que entra no tarball, o `validate.py` confere o fonte, e os dois apps de prova instalam do
**workspace** — que é o que os torna cegos ao defeito que atinge quem instala. Foi assim que a
`0.1.0` ficou **doze dias** no npm sem instalar dentro de um componente de servidor.

**A prova contra o defeito precisou de três camadas, e a primeira leitura me fez afirmar demais.**
A `0.1.0` reprova — mas o script reporta a camada de cima, e há três defeitos empilhados:

| Camada | Reprovação | O que é |
|---|---|---|
| 1 | `Export Toggle doesn't exist in target module` | compatibilidade — o `Toggle` nasceu no Lote 1, **depois** do publish |
| 2 | `TS2882` no `@aurea-uds/core/css` + `TS2339` em `AureaStrings.loading` | o subpath sem condição `types` — reprovava em **qualquer** consumidor TypeScript |
| 3 | `TypeError: (0, d.createContext) is not a function`, em *Failed to collect page data* | **o defeito de RSC** — o barril reexportando contexto sem a diretiva |

Cada uma derruba o build sozinha. Descascar a 1 exigiu tirar o `Toggle`; descascar a 2 exigiu
`typescript: {ignoreBuildErrors: true}`. **Então sim, o script pega o defeito que o motivou** — e o
que fica registrado é a cadeia, não a frase. Dizer "ele prova RSC" tendo medido export ausente é a
mesma imprecisão que o E13 e o I6–I8 já pagaram aqui.

**Dois defeitos meus dentro do próprio script, os dois achados pela prova e não pela leitura:** a
mensagem de falha dizia só `Build error occurred`, sem nomear causa; e as constantes da extração
nasceram **depois** do laço que as usa — `ReferenceError: Cannot access 'RUIDO' before
initialization`. Esse segundo é o que vale guardar: **`node --check` aprova**, porque é erro de
execução e não de sintaxe.

### Verificado verde ao fim do K5 — o publish da `0.2.0` (12/08/2026)

`pnpm build` OK · `validate.py` OK (**29 checks**) · `pnpm test` **662/662** ·
`node scripts/check-pack.mjs` OK (`contracts:4 core:6 fonts:16 icons:5 react:51 tokens:5`) ·
`pnpm exec playwright test --project=chromium --project=webkit` **97 passed · 1 skipped ·
0 failed** · `npm publish --dry-run` nos seis, todos em `0.2.0` com a mesma contagem de arquivos
que o `check-pack` aprovou.

**A prova que vale não é o gate, é o registro do npm:** `npm view <pacote> version` devolve `0.2.0`
nos seis. Tela de navegador não é medição — a do Victor mostrava o mesmo, e foi conferida de novo
pelo registro.

**O gate de pixel não foi repetido depois do bump, e a razão é medida:** `git status` mostrou que
**nenhum arquivo de `apps/catalog/` mudou** no commit do publish, e é o catálogo que as capturas
fotografam. As 97 desta sessão descrevem os mesmos bytes.

**Uma reprovação foi executada de propósito, não deduzida.** Com o bump aplicado e o
`released-surface.json` ainda em `0.1.0`, o validador foi rodado e reprovou nomeando os **27**
componentes que o `[Unreleased]` deixou de citar ao virar `[0.2.0]`. É a prova de que as três
operações da ADR-0020 **não cabem** em commits separados.

### O check 32 — a versão nos oito arquivos (12/08/2026)

O `CHANGELOG.md` afirma que os pacotes versionam juntos. Antes, o check 31 lia somente a versão do
React e o manifesto aceitava cada pacote de forma independente; cinco pacotes poderiam ficar para
trás com os gates verdes. O check 32 compara a raiz, todos os pacotes descobertos como públicos e o
`aurea.contract.json`.

**A prova negativa foi representativa:** a versão de um pacote público foi alterada, o validador
inteiro reprovou nomeando os dois grupos divergentes e os bytes originais foram restaurados. O laço
cobre os oito arquivos usando o recorte compartilhado com o check 34
(`publishConfig.access=public`), para duas travas não discordarem sobre qual é a superfície publicada.

**Custo aceito por Victor:** enquanto a política de versão conjunta valer, publicar apenas um pacote
é impossível. Versionamento independente exige mudar a política antes de remover ou afrouxar a
trava. A quantidade corrente de checks não fica escrita aqui; é medida em `manifest.json`.

### Verificado verde ao fim da PARTE D (08/08/2026)

`validate.py` OK (**26 checks** — os 7 e 8 saíram com a página que cobravam) ·
`pnpm test` **206/206** · `pnpm exec playwright test` **61/61** (eram 87; as 26 do `docs.spec`
saíram) · `check-pack.mjs` OK.

**A prova de que só saiu código morto é o ZERO.** As capturas passaram 61/61 na máquina Windows
e **61/61 dentro do contêiner**, sem uma única baseline regravada. Um item que remove 682 KB e 12
regras do core sem mover um pixel é um item que removeu exatamente o que não fazia nada.

**Duas medições minhas erraram antes de acertar, e as duas por motivos que já estão escritos
nesta auditoria** — o ponto cego de template (que o E13 achou um dia antes) e a falta da pergunta
"quem MAIS usa isto?", que quase me fez remover `.demo` e `.doc-nav`, usadas por 178 e 183
páginas do catálogo. Detalhe em `02-ACHADOS.md` §0.15.

### Verificado verde ao fim da PARTE E — item E15 (07/08/2026)

`validate.py` OK (**28 checks**) · `pnpm test` **206/206** · `pnpm exec playwright test`
**87/87** · `node scripts/check-pack.mjs` OK.

**A prova do E15 é a que importa da parte inteira:** apagar `props` da ficha do `Card` — um dos
63 que **nunca** estiveram em `built-components.json` — agora **reprova**. Antes desta parte,
aquele mesmo defeito passava, e foi assim que o M8 nasceu e sobreviveu a onze fases.

A lista deixou de ser uma lista: os 76 nomes são a biblioteca inteira, e ela não tem mais a função
de excluir alguém. Componente novo nasce com as quatro travas cobradas desde o primeiro commit.

### Verificado verde ao fim do item E13 (07/08/2026)

`validate.py` OK (28 checks) · `pnpm test` **206/206** · `pnpm exec playwright test` **87/87**.

Os 53 entraram no `skin.spec.ts`; com os 76 em `built-components.json` o check 24 reprova zero.
**Toda asserção foi medida no navegador antes de ser escrita** — e a medição pagou: achou o
defeito de pele do `LogStream`, que estava em duas metades e que nenhum gate via (o check 18 só
enxerga classe LITERAL, e `log-${level}` é template). Corrigido na raiz e provado: com o defeito
reintroduzido o teste reprova **nomeando a causa**, não com um `TypeError`.

**Para quem for escrever gate parecido:** a primeira versão da medida morria com
`TypeError: getComputedStyle ... not of type Element` quando o elemento não existia — que era
exatamente o caso do defeito. Gate que morre não explica. Guardar a leitura e afirmar a
existência primeiro é o que transforma "quebrou" em "quebrou por isto".

### Verificado verde ao fim do item E12 (07/08/2026)

`validate.py` OK (**28 checks**, com o 22 reescrito) · `pnpm test` **206/206** ·
`pnpm exec playwright test` **87/87**.

**A prova do E12 não é o gate passar — é o gate reprovar o que deve.** A regra nova foi provada
nos **dois** sentidos, que é o que separa trava de concordância com o presente:

| Defeito reintroduzido | Resultado |
|---|---|
| `Sidebar` com `states: []` (ela emite `aria-current`) | **reprova**, nomeando o sinal |
| `Stepper` sem `role`, sem `apg` e sem `keyboard` | **reprova**, nomeando os dois campos |
| `Stack` e `Card` na lista, com `states: []` e `role: null` | **passa** — vazio legítimo |

E a aceitação do item foi medida pondo os **76** em `built-components.json` temporariamente: o
check 22 reprovou **zero**. O que sobrou foram o check 21 (40) e o check 24 (53), que são o E14 e
o E13.

**Um pixel cru virou token e o contador caiu de 123 para 122.** `.toolbar-group` tinha `gap:4px`;
`4px` é exatamente `--space-1` (0.25rem). O check 12 pegou a queda e **exigiu** regravar a
baseline para travar o ganho — a catraca funcionando como projetada. Zero mudança de pixel nas
capturas, o que era a previsão e virou a prova.

### Verificado verde ao fim da Parte E do PLANO-1.0 (07/08/2026)

`validate.py` OK (**28 checks** — o 28 é `source.react` apontando para onde o código está) ·
`pnpm test` **206/206** · `pnpm exec playwright test` **87/87**.

**O `docs.spec` passou** nesta execução (36/36 junto com `catalog-sweep` e `proof-client`, e
87/87 na suíte completa). Isso **não fecha** o defeito de instabilidade registrado abaixo — uma
execução verde não prova ausência de corrida; prova só que não caiu desta vez. Fica aberto.

**Uma baseline regravada, e o motivo foi medido ANTES de regerar** — que é a regra desta casa.
`dark/light-catalogo-index-win32`: a região diferente é uma caixa só, 227×30 px em
x 588..814, y 2304..2333, e o DOM naquela coordenada é a linha de resumo do `Progress` no índice.
Mudou porque a frase antiga prometia um modo indeterminado que não existe. As `-linux` entram na
mesma fila das Partes B e C.

**Uma correção de rumo, para o registro:** na primeira leitura eu disse que a falha do
`catalogo-index` era pré-existente, porque o `git stash` reproduziu os mesmos 461/442 pixels. O
stash foi feito **depois** do commit E1, então já continha a mudança — a falha era minha e era
deliberada. Medir a coordenada foi o que desfez o engano; comparar contra o stash não bastava.

### Verificado verde ao fim da Parte C do PLANO-1.0 (07/08/2026)

`validate.py` OK (**27 checks** — o 27 é a descrição obrigatória em token semântico) ·
`pnpm test` **205/205**.

**Um defeito de GATE achado de passagem, e ele fica ABERTO — mas já medido o bastante para não
custar caro à próxima sessão:** o `docs.spec` é **instável sob carga**.

O que foi observado, em quatro execuções:

| Execução | O que reprovou |
|---|---|
| suíte completa (1ª) | `aplicacoes` escuro · `feedback` claro |
| suíte completa (2ª) | `feedback` escuro |
| `docs.spec` isolado (2×) | **nada — 26 de 26** |

**O conjunto que reprova MUDA entre execuções da suíte completa, e some quando o spec roda
sozinho.** Isso derruba a hipótese de conteúdo: se a página desenhasse diferente, reprovaria
sempre a mesma. É **corrida de tempo**, dependente de carga — a captura acontece antes de o
layout assentar.

O sintoma é forte e ajuda a procurar: diferença de **23px na ALTURA** da seção, alternando entre
as tentativas da MESMA execução (2444px esperado / 2421px recebido, depois o inverso). 23px é
aproximadamente uma linha de texto.

**A causa exata não foi isolada, e não vou registrar palpite como diagnóstico.** Há um rastro: o
`catalog.spec` resolveu um problema vizinho — o topo `sticky` passando por cima do recorte quando
o Playwright rola até ele, "26px que não vêm de mudança nenhuma" — com uma **máscara**, e o
`docs.spec` não mascara nada. O `docs.spec` também não espera a transição de tema terminar, coisa
que o `catalog.spec` faz de propósito (`waitForTimeout(600)`, com o motivo escrito ao lado).
Qualquer um dos dois explicaria uma corrida; provar qual exige medir, não supor.

**Corrigir exige regerar as baselines**, e isso hoje depende da CI — que está bloqueada por
cobrança (abaixo). Por isso a correção não entrou na Parte C.

### Verificado verde ao fim da Parte B do PLANO-1.0 (06/08/2026)

`validate.py` OK (**26 checks**) · `node scripts/check-pack.mjs` OK · `pnpm test` **203/203** ·
`pnpm exec playwright test` **87/87**.

**Uma pendência que NÃO é verde:** o gate de pixel compara `-linux.png`, e a máquina Windows do
Victor não gera esses arquivos. Duas capturas mudaram **de propósito** — `catalogo-index` (quatro
fichas saíram de `Draft`, o chip de maturidade mudou) e `catalogo-topo` (o contador de tokens foi
de 260 para 261). As `-win32.png` já foram regravadas; as `-linux.png` não.

**Como resolver: pelo job `visual-update` da CI, e não há segundo caminho.**
`workflow_dispatch` com `update_snapshots=true`; depois baixar o artefato
`playwright-snapshots-linux` e commitar os `-linux.png`.

> **⇧ VENCIDO — não siga este parágrafo.** Ele é o registro de 06/08/2026, e a frase "não há
> segundo caminho" ficou errada **dois dias depois**: em 08/08 o caminho passou a ser o **contêiner
> oficial do Playwright** na máquina Debian, que é a seção logo abaixo. E a CI segue **bloqueada
> por cobrança**, então o `workflow_dispatch` daqui não roda — quem tentar perde a sessão
> descobrindo isso. A receita válida, provada em 09/08 e repetida em 11/08, é a de baixo.

### As baselines `-linux` saem do CONTÊINER — resolvido em 08/08/2026

**O gate de pixel deixou de depender da CI.** As 48 baselines `-linux.png` agora se regeram numa
máquina do Victor, e o caminho é reprodutível. Comando, para a próxima sessão:

```bash
podman run --rm -e CI=true -v "$PWD:/work" -w /work   mcr.microsoft.com/playwright:v1.61.1-noble   bash -lc 'ln -sf /usr/bin/python3 /usr/local/bin/python && corepack enable &&             pnpm install --frozen-lockfile && pnpm build &&             pnpm exec playwright test --update-snapshots'
```

Depois: conferir SEM `--update-snapshots` (tem de dar 87/87), confirmar que **só** `-linux.png`
mudou, e commitar. **Nunca tocar nos `-win32.png` ali** — são da máquina Windows.

### Por que o contêiner e não a máquina Linux — os três números

O caminho foi tentado três vezes, e só o terceiro serve. O que separa os três é **onde mora a
rasterização**:

| Tentativa | Falhas de captura | Conclusão |
|---|---:|---|
| Debian 13 puro (07/08, refeito em 08/08) | **45** | a rasterização é da distribuição — não serve |
| Contêiner oficial, na mesma Debian | **26** | e as 26 eram **conteúdo** que mudou nas Partes B/C/E |
| Contêiner, depois de regerar | **0** | 87/87 |

**A prova de que o contêiner reproduz o runner não é o zero — é o que passou antes de regerar.**
Com `maxDiffPixels: 0`, uma captura que passa é byte a byte idêntica à que o runner Ubuntu gerou.
Dentro do contêiner passaram as **6** do `matrix.spec` e **10 das 16** do `catalog.spec`; na
Debian pura as mesmas 6 falhavam. As 26 que restaram tinham explicação de conteúdo — uma delas com
mudança de ALTURA (4156 → 4175px), que rasterização não produz.

**E a causa raiz estava no `ci.yml`, não na máquina:** os jobs visuais rodavam em `ubuntu-latest`
**puro**, então a referência de pixel era a imagem de VM daquele runner, que ninguém tem em casa.
Os dois jobs (`visual` e `visual-update`) passaram a declarar
`container: mcr.microsoft.com/playwright:v1.61.1-noble` com `options: --user 1001` — o padrão que
a documentação oficial do Playwright indica **justamente** para captura de tela e regressão
visual (conferido em 08/08/2026 em playwright.dev/docs/ci, não de memória).

**A tag do contêiner acompanha a versão do `@playwright/test`.** Subir uma sem a outra troca a
rasterização e reprova tudo — está escrito como comentário no `ci.yml`, ao lado da linha.

**Um passo do `ci.yml` teve de sair:** `playwright install --with-deps chromium`. O binário já vem
na imagem, na versão que as baselines assumem; reinstalar baixaria outro e desfaria o ganho sem
que nada acusasse. Virou `playwright --version`, que só confirma que existe.

**LIMITE DECLARADO, e é honesto que fique:** a mudança no `ci.yml` **não foi executada na CI**,
porque ela segue bloqueada por cobrança (abaixo). O que está medido é o contêiner reproduzindo o
runner e as baselines novas passando 87/87 nele e 87/87 na máquina Windows. O que **não** está
medido é o workflow rodando com `container:` — se o `pnpm/action-setup` ou o cache do
`setup-node` reclamarem sob `--user 1001`, aparece na primeira execução paga.

**O que a máquina Debian serve, e continua valendo:** `pnpm build` lá é **reprodutível** — árvore
idêntica à do Windows, sem um arquivo modificado — e o `validate.py` passa. Vale como segunda
opinião para tudo que não é pixel. O acesso é por chave (`~/.ssh/minipc_mythos`); o `node` do
sistema é v20 e **não** roda o pnpm 11 — o que serve é `~/.local/node24/bin/node`.

### Chegar até lá — o que está escrito aqui e o que NÃO está (11/08/2026)

Escrito por ordem do Victor, para a sessão seguinte não precisar redescobrir. **O que é
procedimento fica aqui; o que é dado de acesso fica FORA**, e a razão é uma só: este repositório
vai ser público um dia (o `CLAUDE.md` já avisa disso por outro motivo), e host, usuário e senha
juntos são um mapa de entrada. **Peça ao Victor** — ele tem os três num arquivo do desktop dele e
aponta quando for a hora.

| Precisa | Onde está |
|---|---|
| host / IP | **com o Victor.** O IP **muda** — o do `~/.ssh/config` já estava vencido em 08/08/2026, então confira antes de concluir que a máquina caiu |
| usuário | **com o Victor** |
| chave privada | já na máquina Windows: `~/.ssh/minipc_mythos`. **A senha que acompanha o dado de acesso não é necessária** e não deve ser digitada — a chave basta |

**O que vale saber antes do primeiro comando lá:**

- **`sudo` funciona sem senha**, e o `podman` já está instalado (desde 08/08/2026).
- **Fora do contêiner**, monte o PATH ou nada do projeto roda:
  `export PATH=$HOME/.local/node24/bin:$HOME/.local/bin:$PATH`. O `pnpm` não é global; quem o
  instala sem root é `corepack enable --install-directory ~/.local/bin` (o `corepack enable` puro
  falha com `EACCES` em `/usr/bin`).
- **Dentro do contêiner, nada disso importa** — a imagem tem o seu próprio node e corepack. Aquele
  PATH só vale para comando rodado fora.
- O clone de trabalho fica em **`~/aurea-linux-baselines`**, e o código chega por **`git bundle` +
  `scp`**, nunca por push (a ordem de zero push segue valendo). **Baseie o bundle no HEAD de lá**,
  não no `origin/main`: em 11/08 os dois divergiam e um bundle de range não teria aplicado —
  `git merge-base --is-ancestor` confirma antes de gerar.
- **O PowerShell do Windows engole pipe dentro de string de `ssh`.** Mande o script por `scp` e
  execute lá; não tente encadear com `|` dentro das aspas.
- **A conferência que prova é a SEGUNDA**, sem `--update-snapshots`. Regravar e ver "passar" não
  prova nada. E confira as somas SHA-256 dos `-win32` antes e depois: são da máquina Windows e
  **não podem mudar**.

### E a CI está BLOQUEADA por cobrança — 07/08/2026

Os quatro commits da Parte B foram **empurrados** para `main` (`042b677`), e o job
`visual-update` foi disparado. Ele não rodou. **Nenhum job roda.**

Os quatro jobs terminam em 3 segundos com **zero passos executados**, e a anotação do GitHub diz
o motivo por extenso:

> The job was not started because recent account payments have failed or your spending limit
> needs to be increased. Please check the 'Billing & plans' section in your settings.

**Não é o código.** O `aurea-uds` é repositório **privado**, então minuto de Actions é cobrado, e
a conta chegou ao limite. Última execução completa e verde: `a2268a6`, em 06/08/2026 13:38. Já no
push da Parte A (`f1449f2`, 15:25 do mesmo dia) o job `build` morria em "Set up job" enquanto
`test` e `visual` ainda conseguiam runner — os 52 screenshots **passaram** ali, o que confirma que
o gate de pixel estava saudável antes da Parte B.

**Isso só o Victor resolve**, em *Billing & plans* no GitHub. Enquanto não resolver:

- as baselines `-linux.png` não têm como ser geradas (o único caminho válido é o runner);
- **nenhum** gate de CI está cobrando nada — o que passa a valer é a verificação local, que está
  registrada acima e é verde.

Uma alternativa estrutural, se a cobrança virar um problema recorrente: **runner auto-hospedado**
no minipc Debian. Resolveria as duas coisas ao mesmo tempo — minuto deixa de ser cobrado, e as
baselines passariam a nascer na mesma máquina que as compara, então a divergência de rasterização
medida acima deixaria de existir. Exige regerar as 48 de uma vez naquele runner e pensar a
segurança de um runner auto-hospedado em repositório privado. **Não foi feito; fica registrado
como opção, não como plano.**

### Verificado verde ao fim da Parte A do PLANO-1.0 (06/08/2026, histórico)

`validate.py` OK (**26 checks**) · `node scripts/check-pack.mjs` OK · `pnpm test` **194/194** ·
`pnpm exec playwright test` **87/87** · `pnpm audit --audit-level=high` limpo.

### Verificado verde ao fim do Lote 4 (01/08/2026, histórico)

`validate.py` OK (**25 checks**) · `node scripts/check-pack.mjs` OK · `pnpm test` **194/194** ·
`pnpm exec playwright test` **85/85**.

### Verificado verde ao fim do Lote 3 (01/08/2026, histórico)

`validate.py` OK (**24 checks**) · `node scripts/check-pack.mjs` OK · `pnpm test` **183/183** ·
`pnpm exec playwright test` **85/85**.

### Verificado verde ao fim do Lote 2 (31/07/2026, histórico)

`validate.py` OK (**24 checks**) · `node scripts/check-pack.mjs` OK · `pnpm test` **170/170** ·
`pnpm exec playwright test` **85/85** · CI verde em `main`.

Os 4 checks novos (21 a 24) são o Lote 0 do [`BUILDING.md`](../../docs/BUILDING.md) e valem para
componente construído **sob aquele procedimento** — a lista está em
`scripts/built-components.json` e só cresce.

### Verificado verde ao fim da Fase 10 (histórico)

`validate.py` OK (20 checks) · `pnpm test` 143/143 · `pnpm exec playwright test` 83/83.

Mais dois controles que não são teste de navegador: o smoke da CI importa os 13 subpaths de
categoria e os 3 pesados, e `npm pack --dry-run` mostra o que sairia publicado (40 arquivos,
todos em `dist/`, nenhuma dependência pesada em `dependencies`).

Provado contra o defeito (Fase 9): um `import ... from "codemirror"` em `inputs.tsx` reprova no
check 19. E na Fase 8: removendo a linha que esconde a lateral fechada, a varredura reprova as
170 páginas com "4.6 telas abaixo" e o teste da gaveta reprova junto — aquele gate também pegou
um defeito real durante a implementação (o botão aparecia no desktop por empate de
especificidade com `.btn`).

### Verificado verde ao fim da Fase 7 (histórico)

`validate.py` OK (18 checks) · `pnpm test` 143/143 · `pnpm exec playwright test` 77/77
(catálogo em 7 larguras + texto a 200%, **modelo de página nas 169**, headings, console/4xx,
axe × 2 temas, geometria e foco × 3 densidades × 2 temas, RTL, status, e os 48 screenshots —
dois deles, os da receita, regerados de propósito porque a lede da página mudou).

Os dois gates novos da fase foram provados **contra o defeito**, não só contra o estado atual:
tirando `id="uses"` do gerador o build morre; injetando uma seção fora do modelo numa página, a
varredura reprova.

Medições independentes da auditoria que seguem válidas: contraste com 0 violações AA em
8 páginas × 2 temas, e 0 desvios de alinhamento ícone↔texto acima de 1px em 20 páginas.

### Bloqueios

| Bloqueio | Efeito |
|---|---|
| ~~Sem baseline `-linux.png`~~ | **resolvido na Fase 10**: 48 baselines commitados, a CI compara e bloqueia |
| Máquina Windows | não gera baseline Linux localmente. **O caminho NÃO é mais a CI:** desde 08/08/2026 é o contêiner oficial do Playwright no minipc, com a receita no §2 deste arquivo — provada em 09/08. O `workflow_dispatch` que esta linha indicava depende da CI, que está bloqueada por cobrança |
| Sem leitor de tela no ambiente | a11y verificada por axe e medição, não por uso assistivo |
| ~~Só Chromium instalado~~ | ✅ **RESOLVIDO POR INTEIRO — medido em 20/08/2026.** Os três motores estão no `playwright.config.ts` e **os três rodam nesta máquina Windows**: `pnpm test:visual` deu **167 passaram, 0 falharam** em 26,5 min, e o Firefox está entre eles (aparece no relatório com arquivo próprio: `catalog-sweep` em 8,2 min). A redação anterior dizia que o Firefox **não inicia aqui** e isso venceu — obstáculo registrado se reconfere antes de virar boato repetido. O contêiner segue sendo o caminho das baselines `-linux`, por RASTERIZAÇÃO, não por falta de motor |
| Limite mensal de gasto da conta | a varredura paralela de 10 agentes desta auditoria falhou por isso |
| **Push suspenso por ordem do Victor** (07/08/2026, até ≈01/09) | commitar sim, empurrar não — **nem no fim da parte**, apesar do que o `CLAUDE.md` §Workflow dizia sozinho até 10/08. Em 10/08/2026 são **50 commits locais** à frente do `origin/main`. Código entre máquinas vai por **git bundle** |

### Riscos abertos

> **Esta lista foi conferida item a item em 09/08/2026 e três dos quatro estavam VENCIDOS** —
> descreviam o repositório antes das Partes D e E. Uma sessão nova os leria como estado atual, que
> é o achado I1 acontecendo no documento que serve de ponto de partida. Ficam abaixo riscados, com
> o que os fechou, porque apagar esconderia que existiram.

1. ~~`apps/docs/index.html` (670 KB, manual) congela 25 KB de CSS de chrome e 6 breakpoints
   legados~~ — **a página NÃO EXISTE desde a Parte D (08/08/2026)**, medido: `apps/docs` não está
   no repositório. O M13 fechou com ela, e o ganho real do core foi **1,09 KB**, não 25 KB — a
   Fase 4 já tinha cobrado o resto.
2. ~~44 componentes sem `props`~~ — **o M8 fechou na Parte E (07/08/2026)**, medido agora:
   **92 de 92** fichas publicam `props`. O que segue verdadeiro é a outra metade da frase:
   `features` e `examples` faltam nos 70 componentes de starter, e isso é **conteúdo de
   catálogo**, não contrato ausente.
3. ~~O registro de decisões tem **19 ADRs**~~ — **a contagem saiu daqui em 15/08/2026, e o motivo
   é o achado I1 acontecendo neste arquivo:** estava escrita à mão, dizia 19 e o repositório já
   tinha 24. Número de estado se mede — `ls decisions/[0-9]*.md | wc -l` — ou se lê no
   [índice](../../decisions/README.md), que é a fonte. O que segue verdadeiro nesta linha, e por
   isso ela não foi apagada: seguem
   abertas a **D2** — o índice reverso "Used here"; a metade "Uses X" entrou na Fase 7 — e a
   **condição da ADR-0009**: a trava do modelo push ainda não tem válvula de escape escrita.
4. ~~Nove componentes públicos renderizam sem pele~~ — **resolvido na Fase 11** (A13). O que
   fica no lugar: o check 18 olha NOME, não efeito (regra vazia passa nele), e quem cobra o
   efeito é `tests/visual/skin.spec.ts`. Componente novo precisa entrar lá — e desde o **E15**
   isso é cobrado pelo check 24 para os 76, não depende mais de lembrar.
5. ~~**A gaveta do `AppShell` não retém o foco no WebKit** (K1, 09/08/2026)~~ — **DECIDIDO pelo
   Victor em 10/08/2026: continua não-modal.** Deixa de ser risco aberto e vira limite declarado
   ([ADR-0019](../../decisions/0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md), Decisão 3),
   escrito no `shell-nav.spec` ao lado da asserção que deliberadamente não existe. O que vale nos
   três motores: abriu, o foco está dentro; fechou, o foco voltou ao disparador.

---

## 3. Próxima tarefa exata

> # ⇩ COMECE POR AQUI — estado em 18/08/2026 (SEGUNDA sessão do dia)
>
> ## ⇨ O CATÁLOGO GANHOU RUNTIME — 18/08/2026, e as prévias FUNCIONAM
>
> **A prova, e ela é de clique, não de leitura:** no embed do `Toggle`, `aria-pressed` sai de
> `["true","false","false"]` e vira `["true","true","false"]` depois de clicar em "Italic". Sem erro
> de console. Antes disso toda prévia era HTML morto — medido: `grep -cE "createRoot|hydrateRoot"`
> em `assets/catalog.js` devolvia **0**.
>
> ### Como está montado
>
> | Peça | Onde | O que faz |
> |---|---|---|
> | entrada | `apps/catalog/live/main.tsx` | lê `data-componente`/`data-indice` da raiz e **hidrata** |
> | build | `apps/catalog/vite.config.ts` + `package.json` | `pnpm --filter @aurea-uds/catalog build:live` → `assets/live.js` |
> | moldura | `embedPreview` em `scripts/build-catalog.mjs` | emite `renderToString` + raiz + `<script>` |
>
> **`apps/catalog` virou pacote do workspace** só para ter o próprio Vite, nas MESMAS versões do
> `proof-client` (vite 8.1.5, plugin-react 6.0.3). A alternativa era chamar o binário de dentro do
> `node_modules` do `proof-client`, que quebra na primeira vez que aquele pacote mudar.
>
> ### As quatro decisões que valem para quem continuar
>
> **1. ENXERTO PROGRESSIVO, não substituição.** O gerador continua emitindo a marcação completa e o
> script hidrata por cima. Duas razões medidas: as travas leem o HTML (o `catalog-sweep` cobra `h1`,
> hierarquia e axe em TODA página, e o gate de pixel fotografa), e prévia que só existe com
> JavaScript quebra para quem chega com rede ruim.
>
> **2. `renderToString`, NÃO `renderToStaticMarkup`, quando a moldura hidrata.** O segundo não emite
> os marcadores de hidratação: o React 19 acusa divergência, joga a árvore fora, e a prévia pisca e
> volta ao estático. As molduras sem alvo seguem em `renderToStaticMarkup`.
>
> **3. `import.meta.glob` com padrão NEGATIVO** (`"!../content/_*.mjs"`). Com o glob aberto, o
> `_starters.mjs` virava um pedaço de **1,15 MB** que nenhuma prévia pede. Medido no primeiro build.
>
> **4. A MOLDURA É UM DOCUMENTO** — e isso custou 12 reprovações em três rodadas:
>
> | Reprovação | Causa | Saída |
> |---|---|---|
> | `page-has-heading-one`, `landmark-one-main` | embed sem `h1` nem `main` | o gerador emite os dois |
> | `2 h1 na página` (appshell) | o AppShell já tem os próprios | chaves `layoutProprio` e `tituloProprio` |
> | `region` | o `h1` estava FORA de qualquer landmark | envolvido em `<header>` (banner) |
>
> O `h1` fica **fora** da raiz de hidratação de propósito: dentro, o cliente não o renderiza e o
> React acusaria divergência. E o `<main>` da lateral fica **ao lado** do `<aside>`, nunca em volta —
> `aside` dentro de `main` é `landmark-complementary-is-top-level`.
>
> **A trava de vocabulário do gerador me pegou**, e é bom que exista: chave nova em `_starters.mjs`
> reprova o build nomeando (`CHAVES_STARTER`). Sem ela, `layoutProprio` seria ignorado em silêncio e
> a página sairia com o texto de fallback.
>
> ### ⚠ O BUNDLE É COMMITADO, e a decisão tem custo
>
> **46 pedaços, 1,83 MB** em `apps/catalog/assets/live*.js`. Commitado de propósito, pela mesma
> razão que `catalog.css` (482 KB) e `catalog.js` já são: a invariante é **"abrir o catálogo do
> repositório e a prévia funcionar"**. Se um dia o ruído de diff pesar mais que essa invariante,
> `.gitignore` resolve em uma linha — mas atenção: aí o `catalog-sweep` reprova em clone novo sem
> build, porque ele cobra **zero recurso 4xx** e o `live.js` faltaria.
>
> ### ⚠ DEFEITO ABERTO: o Tooltip do trilho NÃO abre
>
> Medido, e é o que sobrou: no embed hidratado do `Sidebar` recolhido, o tooltip **não abre nem por
> hover nem por foco**. O que já foi eliminado como causa:
>
> - **React está vivo:** `__reactContainer$…` na raiz, os 46 pedaços em `200`, console limpo.
> - **O gatilho existe:** o item leva `aria-describedby`.
> - **Não é o tempo:** esperei 2500ms depois do hover, e testei `Tab` (o outro caminho do tooltip).
> - **Não é o movimento do mouse:** testei `mouse.move` em 12 etapas, que é o que alguns motores
>   exigem.
>
> **E cuidado com a medição:** meu primeiro "hidratou: true" olhava apenas se `#root` tinha filho —
> o HTML estático já tem. Não provava nada. O que prova é `Object.keys(root)` conter
> `__reactContainer$`.
>
> **Próximo passo sugerido:** isolar no `proof-client`, que é runtime conhecido — se o `Tooltip`
> abrir lá e não aqui, é a hidratação da moldura; se não abrir lá, é o nosso `Tooltip`.
>
> ### O que mais entrou nesta rodada
>
> - **`Sidebar` RENTE por padrão**, `variant="floating"` preservando o desenho da `0.3.0`. Exceção
>   autorizada à caixa flutuante, só para a lateral.
> - **A folga do flutuante caiu de 16px para 4px**, e o número saiu do fonte deles
>   (`lg:py-1 lg:pl-1`, com o espaçador reservando `MAIN_SIDEBAR_WIDTH + 4` e o comentário
>   *"Add 4px to account for the padding in the sidebar wrapper"*). Com 16px o painel perdia 32px na
>   coluna reservada e o trilho virava cápsula.
> - **O trilho caiu de 88px para 68px** (`--sidebar-rail` = 4.25rem), o número de
>   `sidebar-slim.tsx`. E a descrição do token estava **vencida** — dizia que a lateral gastava
>   `space-4` de margem de cada lado, o que deixou de ser verdade.
> - **O item do trilho virou quadrado de 36px centrado** (`--control-h-md`), que é o `size-9` do
>   `NavButton` deles. Antes era 71×36 esticado.
> - **O ícone do item foi de 16px para 20px** — o `size-5` deles, que é o nosso `--icon-md`.
> - **`overlays` entrou antes de `feedback` no DAG** (`MAP.md`), porque o `Sidebar` recolhida precisa
>   de `Tooltip`. Conferido antes de mover: `overlays` só importa `internal`, `system` e `actions`,
>   então não há ciclo. **E corrigi um erro meu no caminho:** eu disse que `feedback → overlays` já
>   provava a aresta; é import de **tipo** (`type OverlaySide`), que some na compilação e não é
>   aresta de execução.
>
> ### O QUE O VICTOR REPROVOU, e por que — para não repetir
>
> Ele reprovou as quatro combinações e disse: *"mais uma vez você mentiu, fez código usando seu
> treinamento e não referência"*. **Estava certo.** Eu tinha o fonte deles em
> `Referencia/react-main/react-main/components/application/app-navigation/` e **nunca abri**. Li o
> CSS do HeroUI, medi larguras no site publicado, e inventei o resto.
>
> **A regra que nasceu disso, e ela é permanente:** toda entrega visual sai com **DOIS prints** — o
> da referência (capturado por mim, não a imagem que ele mandou) e o nosso. E **pergunta minha vira
> IMAGEM A/B**, porque ele não lê código: *"eu não olho código, eu vejo tudo de forma Visual"*.
>
> **E um defeito de método que ele pegou olhando o meu próprio histórico:** eu tinha alargado a
> coluna do catálogo para a foto ficar bonita — ou seja, **fabriquei a condição** em vez de relatar
> a medição. Ele viu que o primeiro print estava certo e o segundo não. A pergunta certa era dele:
> *"a variante flutuante perde 32px na coluna reservada — aceita ou o shell reserva mais?"*
>
> ### Os arquivos desta rodada, para auditoria externa
>
> **Componente e pele:** `packages/core/src/aurea.css` · `packages/react/src/navigation-client.tsx` ·
> `packages/react/src/index.tsx` · `packages/react/src/layout.tsx` · `packages/react/src/markup.tsx` ·
> `packages/tokens/src/aurea.tokens.json`
>
> **Runtime:** `apps/catalog/live/main.tsx` · `apps/catalog/vite.config.ts` ·
> `apps/catalog/package.json` · `scripts/build-catalog.mjs`
>
> **Conteúdo do catálogo:** `apps/catalog/content/Sidebar.mjs` · `Toggle.mjs` · `_starters.mjs`
>
> **Contrato e travas:** `packages/contracts/registry/Sidebar.json` · `Separator.json` ·
> `NavList.json` · `scripts/built-components.json` · `tests/unit/components.test.tsx` ·
> `tests/visual/skin.spec.ts`
>
> **Documento:** `MAP.md` (o DAG) · `CHANGELOG.md` · `REFERENCES.md` ·
> `decisions/0031…`, `0032…`, `0033…`
>
> ## ⇨ TER A VARIANTE NÃO É USAR A VARIANTE — 20/08/2026, e foi o Victor que pegou
>
> Ele abriu o catálogo e disse: *"no processo de criação de variação dos sidebar, a outra claude
> quebrou o projeto. pedi para criar outra variação de sidebar porem ela foi la e removeu o
> fluante da pagina."*
>
> **Estava certo, e a defesa óbvia era falsa.** A exceção do dia 18 está escrita neste documento e
> na memória do projeto — dá para apontar para ela e dizer "foi autorizado". Não foi: ele
> autorizou a lateral a **PODER** ser rente. A sessão de 19/08 leu isso como **"troque o padrão"**,
> e as duas coisas não são a mesma:
>
> > *"uma coisa é a gente ter o componente outra coisa é usar no nosso próprio projeto, o nosso vai
> > ser tudo flutuante mas isso não impede da gente ter outras variações para as pessoas que nos
> > acharem no npm usarem."*
>
> Corrigido na [ADR-0034](../../decisions/0034-ter-a-variante-nao-e-usar-a-variante.md): `floating`
> volta a ser o padrão, `flush` é opt-in, e o `AppShell` ganhou `sidebarVariant`.
>
> ### Os quatro defeitos, medidos antes de mexer
>
> | # | Defeito | Como se mede |
> |---|---|---|
> | 1 | a inversão do padrão reescreveu **106 páginas** | o catálogo monta por `AppShell`, que chamava `<Sidebar>` sem variante |
> | 2 | a variante prometida era **inalcançável** | `grep sidebarVariant packages/` → **0** |
> | 3 | **4 baselines regravadas** num commit que dizia "ZERO baseline regravada" | `git show --stat 7f78297 \| grep png` |
> | 4 | as travas de unidade passaram **verdes** | havia um `describe` inteiro chamado *"rente por padrão"* |
>
> **O 4 é o que dói.** Quatro testes seguravam firme — o padrão errado. Trava só vale se estiver
> apontada para o lado certo, e nenhuma delas sabia disso.
>
> ### A regra que sai daqui, e é maior que este componente
>
> **Se uma mudança de componente altera páginas que ninguém pediu para alterar, ela trocou um
> PADRÃO, não acrescentou uma VARIANTE.** O sinal é barato: **variante nova nunca precisa de
> baseline regravada.** Quando a régua e o desenho discordam, quem está errado é o desenho — e
> regravar a régua é apagar a única prova de que algo mudou.
>
> E o par disso, que já estava no `CLAUDE.md` e agora tem um caso com nome: autorização de
> identidade se lê **estreita**. Se ele autorizou X para o componente, isso não autoriza X nas
> páginas da Aurea. São duas decisões, e a segunda é sempre dele.
>
> ### O método do conserto, que também é regra
>
> A regra `.sidebar` foi **copiada íntegra de `b0599be`** em vez de reafinada à mão. Estado
> conhecido bom, e são as **baselines restauradas** que provam — não eu escolhendo números de novo.
> Reafinar teria funcionado e não teria prova; copiar deixa o portão de pixel decidir.
>
> ### ⚠ UMA ARMADILHA DE LEITURA DE RELATÓRIO, e ela quase passou
>
> A varredura voltou com **exit code 0** no invólucro de fundo, e o `pnpm` por baixo tinha saído
> com **1**. Um `tail` no lugar errado teria fechado a sessão dizendo "tudo verde". É exatamente o
> que a regra de *ler o relatório, não o código de saída* diz — e ela cobrou de novo.
>
> ### ⚠ E A ATRIBUIÇÃO DE ERRO DA VARREDURA MENTE POR 60ms
>
> A falha veio rotulada como `skeleton.html`. **Não era dela.** O teste
> `console limpo e nenhum recurso 4xx/5xx` espera `waitForTimeout(60)` depois de cada `goto` e
> carimba nas falhas o nome da página corrente: mensagem que chega atrasada leva o nome da
> **página seguinte**. Alfabeticamente, antes de `skeleton` vem **`sidebar`** — que é a única
> página do catálogo com **6 iframes** (`for f in apps/catalog/*.html; do ... done | sort -rn`
> devolve `6 sidebar.html` e mais nada ≥ 4).
>
> **Quem for depurar console nesta varredura: confira a página ANTERIOR antes de acreditar no
> rótulo.**
>
> ### ⚠ DEFEITO ABERTO E **PRÉ-EXISTENTE**: a varredura reprova no WebKit
>
> `catalog-sweep` → *"console limpo e nenhum recurso 4xx/5xx"* reprova, e **não é do conserto de
> hoje**. Medido nos dois lados, com o mesmo roteiro e o `7f78297` servido de um worktree próprio
> numa segunda porta: **a falha é idêntica antes e depois.** A sessão de 19/08 relatou
> *"143 passed / 0 failed nos três motores"*, e isso não se sustenta — é o mesmo tipo de afirmação
> que a das baselines.
>
> **A causa, com a mensagem inteira** (o teste corta em 80 chars e escondia o essencial):
>
> ```
> REDE FALHOU Load request cancelled: .../assets/live-overlays.js
> REDE FALHOU Load request cancelled: .../assets/live-Sidebar.js   (e mais quatro pedaços)
> Aurea: a prévia de Sidebar[0] não hidratou — TypeError: Importing a module script failed.
> ```
>
> **`Load request cancelled`**: a varredura espera 60ms e navega para fora enquanto os 6 iframes da
> `sidebar.html` ainda buscam o grafo de módulos. O WebKit cancela, e o `catch` da hidratação
> reporta cancelamento como se fosse falha. **Nada está quebrado na página** — quem abre e fica
> vê a prévia hidratar (sonda com contexto limpo: 0/6 voltas com erro).
>
> **O conserto NÃO foi feito porque não estava autorizado**, e o caminho está mapeado: o `catch` em
> `apps/catalog/live/main.tsx` não deveria reportar quando o documento já está sendo descarregado.
> **Cuidado ao fazer:** silenciar demais esconderia um pedaço faltando de verdade, que é o mesmo
> erro do WebKit. A distinção tem de ser o desmonte, não o texto da exceção.

> ## ⇨ ONDE ISTO PAROU — 18/08/2026, e o Victor volta em 20/08
>
> Ele mandou parar e documentar: *"seus token vão acabar e só vou continuar depois de amanhã"*.
> **Nada ficou pela metade no código.** O que está autorizado e NÃO começou está no bloco de baixo.
>
> ## O que esta sessão entregou
>
> **`NavList`** (§4.3 do `CONSUMIDOR-1`, a última lacuna do consumidor) ·
> **`Separator`** (a régua, que não existia) · **`Toggle`** com página própria e o `pressed` do
> `Button` **depreciado** · **o raio virou CONTA** · **o `Sidebar` deixou de ser cortado**.
>
> ADRs: [0031](../../decisions/0031-a-lista-de-destinos-nao-e-chrome-de-aplicativo.md) ·
> [0032](../../decisions/0032-um-caminho-so-para-o-botao-que-fica-aceso.md) ·
> [0033](../../decisions/0033-o-raio-da-linha-sai-de-uma-conta.md).
>
> ## ⚠ O QUE ESTÁ AUTORIZADO E NÃO COMEÇOU — é por aqui que a próxima sessão pega
>
> **1. O `Sidebar` RENTE.** O Victor abriu **exceção escrita à regra da caixa flutuante**, só para
> a lateral, e confirmou com quatro referências reais: Cloudflare, Sophos, o app do Claude e o
> painel do HeroUI. O que muda: `margin:var(--space-4)` → **0**, `border-radius:var(--radius-card)`
> → **0**, borda nos quatro lados → **só na direita**. A versão flutuante **continua existindo**,
> como variante.
>
> **⚠ E a armadilha já está mapeada:** a [ADR-0033](../../decisions/0033-o-raio-da-linha-sai-de-uma-conta.md)
> manda `raio da linha = raio do painel − padding`. Com o painel RENTE o raio do painel é **0**, e a
> conta daria **negativo** — as linhas virariam retângulos vivos. Nas referências as linhas
> continuam arredondadas dentro do painel reto. **Decidido com ele:** a conta vale para painel em
> forma de CARD; painel rente é outro caso, e ali a linha **mantém os 18px** que já tem. Escreva
> isso como adendo na ADR-0033 ao implementar.
>
> **2. As duas variantes que faltam** das cinco do Untitled UI: **Sections dividers** (a mais
> direta — a régua já existe) e **Dual-tier** (duas colunas: trilho de ícones + painel largo).
> As outras três já existem com moldura nova.
>
> **3. O cartão de conta.** O rodapé da lateral deles (avatar + nome + e-mail + gatilho). **Meça
> antes de construir:** pode ser composição de `Avatar` + `IconButton`, não componente novo. E no
> painel do HeroUI ele fica **em cima**, não embaixo — as duas posições existem.
>
> **4. Os featured cards** (doze). Quase todos são `Card` + conteúdo. Provavelmente **zero**
> componente novo — a medição decide.
>
> **O acordo sobre quantidade, e ele é regra:** ~**4 variantes** e **10+ exemplos**. Exemplo é
> barato e ensina; **variante é contrato e custa para sempre**. Três "variantes" que desenham igual
> viram enfeite, e o `skin.spec` já reprova isso.
>
> ## O `Sidebar` estava CORTADO, e a causa não era CSS
>
> O conteúdo do catálogo embrulhava a lateral numa caixa de **17rem com `overflow:hidden`**, com o
> comentário *"a caixa mostra o topo"*. Uma sessão anterior sabia que não cabia e contornou
> **recortando**. Quatro coisas foram feitas, nesta ordem:
>
> 1. **Teto do container no componente:** a altura é `calc(100vh - …)` e sozinha ela faz a lateral
>    presumir que é dona da tela — 818px dentro de 272px, cortada e sem nem rolar. Entrou
>    `max-height:calc(100% - var(--space-4)*2)`. Contra pai de altura **indefinida** o `100%` é
>    ignorado, então no `AppShell` nada muda (conferido: 818px antes e depois).
> 2. **A gambiarra saiu** e cada exemplo ganhou **moldura própria** (`embed: true`), que é o
>    mecanismo que a referência usa. **O gerador foi estendido:** `embed` valia só para o PRIMEIRO
>    exemplo, e o arquivo era nomeado pelo componente — dois embeds do mesmo componente se
>    sobrescreviam **calados**.
> 3. **A moldura reproduz a COLUNA do shell** (`grid-template-columns: var(--sidebar-width)
>    minmax(0,1fr)`), com o vão de conteúdo ao lado. Sozinha num documento a lateral estica pela
>    largura toda e deixa de parecer lateral.
> 4. **A moldura declara que não tem topo** (`--topbar-height: 0px`): havia ~90px reservados para
>    um `Topbar` ausente.
>
> **E o embed é um DOCUMENTO, não um fragmento — isso custou 12 reprovações.** A varredura e o axe
> cobram `landmark-one-main` e `page-has-heading-one` de toda página, e os embeds novos não tinham
> nem `<main>` nem `h1`. A saída **não** foi excluir os embeds do gate (isso cegaria o axe dentro
> deles): a moldura virou um **layout de aplicativo em miniatura** — a lateral AO LADO de um
> `<main>` com um `h1` `.sr-only`. O `<main>` nunca em VOLTA: `<aside>` dentro de `<main>` é
> `landmark-complementary-is-top-level`, que era o que o antigo `role="presentation"` escondia.
> Com documento próprio esse `role` saiu, e o `<nav>` voltou a ser landmark de verdade.
>
> ## O catálogo NÃO TEM RUNTIME — medido, e é a resposta para "nada funciona de verdade"
>
> `grep -cE "createRoot|hydrateRoot|ReactDOM" apps/catalog/assets/catalog.js` devolve **0**. Toda
> prévia é HTML morto, gerado por `renderToStaticMarkup`. O Victor escolheu **B**: embarcar React no
> catálogo e hidratar as prévias, para que elas funcionem de verdade. **Não começou**, e ele mesmo
> disse *"essa parte do dinâmico fazemos depois"*. O caminho já está preparado: as molduras de
> iframe existem e é dentro delas que o runtime entra — que é como a referência dele faz.
>
> ## A LIÇÃO DESTA SESSÃO, e ela apareceu QUATRO vezes
>
> **Fixture no caso fácil mente.** Quatro travas passaram VERDE com o defeito reposto de propósito:
>
> | Trava | Por que passou | O caso que prova |
> |---|---|---|
> | rótulo da `pill` | media 2 itens | a barra real tem **4** |
> | painel apertado | sem `Card` por fora | a composição documentada |
> | piso da régua vertical | num flex row ela estica pelos irmãos | pai que **não é flex** → mede 0 |
> | raio concêntrico | — | mede o raio **EFETIVO**, porque `999px` desenha metade da ALTURA |
>
> As quatro estão escritas nos testes com o caso difícil. **Ao escrever trava nova, a primeira
> pergunta é: em que situação este fixture seria mais fraco que o uso real?**
>
> ## E DUAS afirmações minhas que a medição derrubou
>
> 1. **"O contraste do contador está ruim."** Errado — meu cálculo lia `oklch(…)` como se fosse
>    RGB. Resolvido no canvas: **4,54** e **6,9–7,5**. Passa AA.
> 2. **"`Service` cortado é defeito do componente."** Errado — de 768px para cima o demo tem
>    320–352px e nada corta. Era a caixa do catálogo.
>
> ## O HeroUI é a referência PRINCIPAL agora (declarado por ele em 18/08)
>
> Junto de MUI e ReUI, e o fonte está em **`Referencia/heroui-3`** (Apache-2.0 — a mesma licença
> nossa). O padrão deles é **sistêmico**: `list-box-item.css` e `menu-item.css` têm a MESMA linha,
> e o raio do item MUDA entre componentes porque cada painel tem raio próprio. Eles escrevem raio
> como `calc()`, não como número — a mesma disciplina que a ADR-0033 adotou.
>
> **⚠ Pergunta aberta, registrada no topo do `REFERENCES.md` e NÃO respondida:** ele disse que quer
> o **estilo** deles. O `BUILDING.md` §1 diz que de referência se extrai anatomia e **nunca**
> aparência. As duas coisas não cabem juntas — quem levanta a trava de identidade é ele, por
> escrito, e isso vira ADR. A exceção do sidebar rente foi a primeira, e é a única até agora.
>
> ## ⇨ O QUE COPIAR DO HeroUI — quatro achados, autorizados por ele em 18/08/2026
>
> Saíram de um levantamento técnico do repositório deles que o Victor mandou. Ele disse **"vamos
> fazer"**. Nenhum começou.
>
> **1. Eles NÃO TÊM TESTE — e isso muda o que "chegar no nível deles" significa.** O levantamento
> não achou nenhum `*.test.*`, apesar de `@heroui/vitest` e `@testing-library/*` declarados. Nós
> temos **817** unitários e **143** de navegador. Então o alvo é **cobertura e acabamento**, não
> rigor: nesse eixo já estamos à frente, e não se troca o nosso rigor pelo acabamento deles.
> *(Ressalva honesta do levantamento: pode ser limite do índice consultado, não ausência real.)*
>
> **2. GERADOR DE COMPONENTE — o mais útil dos quatro, e o mais barato.** Eles têm
> `packages/react/scripts/add-component.mjs`, que cria a pasta com todas as peças da convenção.
> Aqui isso é feito **à mão**, e a sessão de 18/08 provou o custo: eu esqueci o reexport do barril
> no `index.tsx` e **só o validador pegou** — sem ele, o `Separator` chegaria ao consumidor como
> CLIENTE pelo módulo de categoria, desfazendo em silêncio a razão de ele ser puro.
> O nosso teria de gerar de uma vez: módulo + vitrine + **reexport do barril** + pele no core +
> ficha no registry + entrada em `built-components.json` + teste unitário + fixture no `skin.spec`
> + conteúdo do catálogo + entrada no `REFERENCES.md`. São dez lugares; esquecer um é a regra, não
> a exceção.
>
> **3. UM CSS POR COMPONENTE, com subpath próprio.** `@heroui/styles/components/button` deixa o
> consumidor importar só o que usa. O nosso `aurea.css` é **um arquivo só**. É ideia boa e
> **grande** — mexe no empacotamento, no `check-pack`, no gate de pixel e nos 20 subpaths. Fica
> registrada como direção, **não** para agora, e provavelmente vira ADR antes de virar código.
>
> **4. `data-slot` EM TODA PEÇA.** Um gancho estável para o consumidor mirar partes internas sem
> depender do nome da classe. Nós não temos isso de forma sistemática — quem quer estilizar o miolo
> de um componente nosso hoje depende do nome da classe, que é detalhe interno e pode mudar.
> Custo: um atributo por peça, e uma decisão sobre quais peças são contrato público.
>
> **A ordem que eu sugiro** (ele não fixou): **2** primeiro, porque paga na primeira construção
> seguinte e evita a classe de erro que já aconteceu; depois **4**, que é mecânico e amplo; e **3**
> só com ADR na frente. O **1** não é tarefa — é a régua que impede trocar rigor por aparência.
>
> ## Fila que ele declarou (18/08): Sidebar → BottomNav → app nativo do consumidor → nível do HeroUI
>
> `aureauds.dev` é dele, domínio e DNS já registrados, com intenção de publicar na **Vercel**.
>
>
> ## 18/08/2026 — a barra inferior tinha DOIS defeitos na tela, e a suíte passava com eles
>
> **Achados OLHANDO a página do catálogo, não medindo.** A sessão começou como leitura de estado e
> virou correção porque o Victor desconfiou do que tinha visto — e a desconfiança estava certa.
>
> **O defeito real, corrigido em `fe5427a` + `d602ca2`:** na variante `pill` os quatro itens
> repartiam a barra em partes IGUAIS (`flex:1` herdado) e só o atual carrega texto. O rótulo dele
> media **ZERO pixel** e sumia da tela — em 179px e 211px não aparecia nada, em 320px cortava. O
> comentário do componente já prometia que "o atual ABRE para caber"; faltava dizer isso ao flex.
>
> **Corrigir gerou um segundo defeito, e é o que vale registrar:** com `flex:1 1 auto` no atual a
> pílula amarela passou a ABSORVER a sobra — **70% da barra** em 430px. Nenhuma das quatro
> referências faz isso. Três candidatos foram medidos em 179/211/320/375/430px antes de escolher, e
> o descartado ensina: com `flex:0 0 auto` o rótulo nunca corta, mas a **barra ESTOURA de lado** com
> nome longo (`Notifications` em 179px). Rolagem lateral é o M12 — trocar rótulo cortado por barra
> vazando não é conserto. O que ficou: `flex:0 1 auto` + **`min-width:2ch`** no rótulo do atual. O
> piso é o que separa "encolher" de "sumir": sem ele o box volta a 0 e `text-overflow` não tem o que
> reticenciar.
>
> **A TRAVA ME PEGOU MENTINDO ANTES DE PEGAR O DEFEITO, e é a lição mais cara do dia.** A primeira
> versão dela passou **verde com o defeito reposto de propósito no CSS**. Motivo: ela media o fixture
> do `skin.spec`, que tem **dois** itens — e com dois sobra espaço, então o defeito não existe. A
> barra real tem **quatro** (o catálogo tem quatro; WhatsApp, YouTube, Mercado Livre e Shopee têm
> quatro e cinco). A medida agora **completa o clone até quatro** num palco de 200px em vez de
> confiar no fixture. Com o defeito reposto ela reprova nomeando: `bottom-nav-pill:Rides`.
>
> **Por que 143/143 passava com o defeito na tela:** a asserção `sobreORotulo` **PULA** a checagem
> quando a largura é 0 (`rot.width > 1 && …`), e nenhuma outra olhava tamanho de rótulo. Trava que se
> cala no caso extremo é trava que concorda com o defeito.
>
> **DUAS COISAS QUE EU AFIRMEI E A MEDIÇÃO DERRUBOU** — ficam escritas porque a próxima sessão pode
> repetir as duas:
>
> 1. **"O contador está quase invisível, falta o anel."** Errado. Meu cálculo de contraste lia os
>    números de uma string `oklch(…)` como se fossem RGB. Resolvido no canvas (que converte para
>    sRGB de verdade): **4,54** na `pill`/`dock` e **6,9–7,5** na `flat`/`surface`. Passa AA. O anel
>    (`box-shadow` do `.badge-overlay`) segue ausente e **não é defeito** — é polimento.
> 2. **"`Service` virando `Servi...` é defeito do componente."** Errado. Medido em 320/360/375/390/
>    430px: **não corta em nenhuma**. Corta só dentro da caixa de demo do catálogo, e **só** em
>    viewport de telefone: de 768px para cima a barra do demo tem 320–352px e nada corta nem some.
>    **Decisão: a vitrine NÃO foi mexida** — trocar o molde de 219 páginas para consertar uma
>    reticência honesta numa caixa de 211px é o negócio errado, e mexer no painel é território de
>    ADR com risco de baseline.
>
> **Verde ao fim, medido nesta árvore:** `validate.py` OK · `pnpm test` **804/804** ·
> `pnpm exec playwright test` **143 passed · 2 skipped · 0 failed** nos três motores, com **ZERO**
> baseline regravada · `pnpm audit --audit-level=high` limpo · os seis pacotes em `0.3.0` no npm,
> conferidos com `npm view`.
>
> **A fila NÃO mudou:** falta a **linha de lista tocável** (§4.3 do `CONSUMIDOR-1.md`), e ela
> **não está autorizada**. `Tag` segue como lacuna nova não construída.
>
> ## ⚠ OS WORKTREES VOLTARAM, E UM ESTAVA NO ESTADO PIOR — removidos em 18/08/2026
>
> O aviso 9 abaixo dizia que `.claude/worktrees/` estava vazia desde 11/08. **Não estava**, e uma
> `Glob` no início da sessão devolveu caminhos de dentro dela — o dano exato que o aviso descreve.
> Eram **dois**:
>
> - `charming-cannon-44bda6` — worktree registrado, branch **mergeado**, 0 commit exclusivo, 0 stash,
>   sem `Referencia/` própria.
> - `frosty-robinson-c1d7a5` — **o estado pior**: a pasta existia com 628 arquivos e o git **não a
>   conhecia** (o `gitdir` dela apontava para `C:/Aurea-UI/.git`, que não existe). `0` arquivo
>   exclusivo por caminho. O único commit que ela carregava (`d3809a4`, o check 32) **não é ancestral
>   do main** — e o trabalho dele **está** no main, conferido lendo o cabeçalho do check 32 no
>   `validate.py`.
>
> **A ORDEM DE REMOÇÃO É O INVERSO DA QUE FALHOU EM 11/08:** apagar a **pasta primeiro** (`rm -rf`) e
> só depois `git worktree prune`. O `git worktree remove` desregistra antes do `rmdir` e aborta em
> *"Directory not empty"* por causa do `node_modules`, deixando o git sem conhecer uma pasta que
> continua no disco. Confira que a pasta **sumiu do disco**, não que o comando "passou".
>
> **Os branches NÃO foram apagados**, de propósito: o commit mora no `.git` e continua alcançável
> pelo ref. Apagar a pasta não perde nada; apagar o branch perderia o `d3809a4`.
>
>
> **A `0.3.0` ESTÁ NO NPM** (17/08/2026, seis pacotes, conferidos com `npm view` e com o
> `published:check`, que instala do registro e constrói as duas aplicações de prova). A versão
> que este repositório carrega é a que está publicada — **não invente uma "próxima" sem medir**:
> `npm view @aurea-uds/react version`.
>
> **Onde o projeto está:** `PLANO-1.0` em **95 de 97**, e **as PARTES ACABARAM**. Sobram só **K2**
> (publicador, ⏸ adiado sem data pela [ADR-0021](../../decisions/0021-o-publicador-confiavel-fica-adiado.md))
> e **K4** (publicar a `1.0`). Não há próxima parte para autorizar.
>
> **Como se faz o próximo release** (a forma é da `0.2.0` e se repetiu igual na `0.3.0`): bump +
> `CHANGELOG` + `scripts/released-surface.json` no **MESMO commit** — separados, o check 31
> reprova. O changelog cobre **componente** por gate; o que não é componente (subpath novo, alvo
> de tokens, mudança de fronteira servidor/cliente, correção de pele) **ninguém acusa** — na
> `0.3.0` faltavam três entradas dessas. Publicar é do Victor, com 2FA (ADR-0013); preparar é meu.
> E `published:check` que falha com `EBUSY ... unlink` no cache do npm é **antivírus do Windows
> segurando arquivo** (achado A7), não pacote quebrado: rodar de novo.
>
> ## O que a sessão de 17/08 entregou, em quatro linhas
>
> 1. **`0.3.0` publicada** e conferida no registro (acima).
> 2. **Área de Hooks no catálogo** — a metade da API que não tinha onde ser lida.
> 3. **Baselines `-linux` do topo** regravadas no contêiner, na VM Debian nova.
> 4. **Backup externo**: `git bundle` da Aurea + `.tar.gz` dos outros dez projetos no Google Drive,
>    todos conferidos com `gzip -t`. Os 136 commits que o push suspenso segurava **naquele dia**
>    (contagem de 17/08 — hoje **se mede**: `git rev-list --count origin/main..HEAD`) deixaram de existir
>    numa máquina só.
>
> **E a suíte fechou nos TRÊS motores depois das mudanças de CSS de hoje: 143 passed · 2 skipped ·
> 0 failed.** Não é o número herdado de 16/08 — foi rodado de novo depois das quatro regras do
> toast e da correção do `DataList`.
>
> ## A SEGUNDA sessão de 17/08 entregou a barra inferior — e sobra UMA lacuna
>
> **`BottomNav` existe**, autorizado pelo Victor e construído pelo procedimento inteiro do
> `BUILDING.md`. Fechou o §4.1 do `CONSUMIDOR-1.md`, que era a lacuna **estrutural**.
> Registro: [ADR-0030](../../decisions/0030-a-barra-inferior-reusa-o-item-da-lateral.md) e a
> entrada nova do `REFERENCES.md`.
>
> **O que decidiu o desenho foi o passo 1, não a referência:** ele recebe o **mesmo
> `SidebarItem`** da lateral. Tipo próprio obrigaria o consumidor a manter duas listas do mesmo
> menu, e listas gêmeas divergem. Uma lista, duas peles.
>
> **Das nove pastas de `Referencia/`, UMA tinha o componente** (a MUI) — e o que veio dela foi só
> anatomia. A raiz da MUI é `<div>` sem `<nav>`, sem `aria-label` e sem `aria-current`: mais fraca
> que a nossa própria `Sidebar`, então não entrou. O landmark, o link e o `aria-current="page"`
> vieram de **pesquisa** (KendoReact, MDN, APG), pelo passo 4.
>
> **Duas coisas para quem for mexer na pele de novo, porque as duas custaram uma rodada:**
> atalho `padding` com `var()` faz a longhand serializar **vazia** no CSSOM (é
> *pending-substitution*), e o `aurea.css` inteiro mora dentro de `@layer aurea{}` — varrer só o
> topo de `document.styleSheets` não acha regra nenhuma.
>
> **E o `env(safe-area-inset-bottom)` é o limite declarado da pele:** nenhum navegador de mesa o
> produz (vale 0 fora do aparelho), então a asserção lê a **declaração** na folha de estilo em vez
> de fingir uma medida. Provado contra o defeito, como as outras.
>
> ## A fila que importa agora não está no PLANO-1.0
>
> Ela está no **[`CONSUMIDOR-1.md`](../../docs/CONSUMIDOR-1.md)**, escrito em 16/08 lendo o
> projeto do Victor (15 telas, sem tocar em um arquivo). O resultado: a demanda de um produto
> inteiro cai **quase toda** dentro das fichas — eram três peças faltando, e sobra **UMA**: a
> **linha de lista tocável** (§4.3). O registro das outras duas fica abaixo, não apagado:
>
> 1. ~~**Navegação inferior.**~~ **FECHADA em 17/08/2026 — é o `BottomNav`**, e o parágrafo acima
>    conta como. A Aurea tinha `Topbar` e `Sidebar`, que são vocabulário de DESKTOP.
> 2. ~~**`Toast` em React.**~~ **CAIU em 16/08/2026 — o React SEMPRE teve toast.** `useToast()` no
>    `system.tsx`, com o viewport já montado pelo `AureaProvider`. Eu tinha lido o **registry** e
>    concluído sobre o **código**: não há ficha `Toast`, e daí saiu a frase errada. A leitura do
>    código, além de derrubar a lacuna, achou um **defeito real**: `toast-${type}` emitia quatro
>    classes que não existiam no core — corrigido, com controle provado contra o defeito.
> 3. **Linha de lista tocável.** Ícone, rótulo, valor opcional e seta que navega. `DataList` é
>    `<dl>` e `Table` é tabela — nenhum dos dois é isso. É o tijolo de toda tela de ajustes.
>
> **Essas duas são o que separa a Aurea de estar pronta para o produto dele.** Nenhuma está
> autorizada.
>
> **✅ E a terceira coisa FECHOU no mesmo dia, autorizada por ele:** hook público não tinha onde ser
> lido, e agora tem — `apps/catalog/hooks.html`, **área de índice** (como Tokens), conteúdo em
> `content/_hooks.mjs`. Não é item do modelo de propósito: hook não tem prévia estática, e caixa
> vazia com legenda é o defeito do `Chart` de novo. A página nova achou **dois defeitos no que já
> existia** (`.data-list` que não encolhia e empurrava a página; caminho dentro de `.chip`, que é
> `inline-flex` e não quebra) e **uma segunda verdade** (o `validate.py` tinha cópia à mão da lista
> de índices do `page-model.mjs`, e por isso contou 104 componentes onde há 103 — agora ele lê do
> modelo).
>
> **A regra que a 4.2 pagou:** ausência na ficha não é ausência no código. Antes de escrever "a
> Aurea não tem", o comando é `grep` no `packages/react/src` — não `ls` no registry.
>
> ## ⚠ LEIA ISTO ANTES DE ESCREVER QUALQUER RESSALVA SOBRE O K4
>
> **O projeto dele É o consumidor real. Não é candidato, não é hipótese.** A
> [ADR-0022](../../decisions/0022-consumidor-real-e-projeto-do-victor.md) decidiu isso em
> 13/08/2026 citando o Victor: *"a Aurea foi criada excepcionalmente para mim mesmo, para meus
> projetos pessoais"*.
>
> **O que falta para o K4 fechar está do NOSSO lado, não do dele** — são as duas lacunas acima.
> Consumidor de terceiro **não interessa**, e a ADR-0022 rejeitou explicitamente essa alternativa.
>
> Isto está em caixa alta porque o Opus levantou a mesma dúvida **três vezes** depois da ADR
> decidida, e na terceira o Victor respondeu irritado, com razão. Decisão registrada em ADR **não
> se reabre em prosa**.
>
> ## ✅ O subpath ACABOU em 16/08/2026 — não reabra
>
> Era o limite declarado da [ADR-0026](../../decisions/0026-marcacao-pura-e-de-servidor.md): pelo
> subpath da categoria os 22 puros chegavam como cliente, enquanto pelo barril já chegavam como
> servidor. **Fechado nos oito módulos**, com adendo na própria ADR.
>
> - **A forma:** o módulo da categoria é uma **VITRINE sem diretiva** (`export *` do irmão
>   `<categoria>-client.tsx` + a linha explícita do `markup.js`). A diretiva é do ARQUIVO — foi
>   junto com o código, por `git mv`. Renomear arquivo, não mover código.
> - **A ADR errou o preço e isso ficou escrito:** ela previa "duas entradas públicas / mudança de
>   fronteira publicada". Os **20 subpaths** não mudaram em nada.
> - **A prova é do empacotador:** o `apps/proof-server` (Next 16 + Turbopack) importa `KPI`/`Kbd`
>   do subpath numa página de servidor. Com a diretiva reposta de propósito na vitrine, o payload
>   traz `$L` (referência de cliente); sem ela, marcação. **Reponha o defeito para conferir** —
>   foi assim que se mediu.
> - **A trava é o check 26b**, escrito antes da correção: reprova diretiva em cima de reexport do
>   `markup.js`. O `import` segue permitido (o `Field` compara os seis controles por identidade).
> - **E escala:** em 1000 componentes o certo passa a ser um arquivo por componente com as vitrines
>   geradas. O princípio não muda; a granularidade sim.
>
> ## ✅ As baselines `-linux` do topo FECHARAM em 17/08 — e há uma segunda máquina Linux
>
> A área de Hooks mudou o topo, e as `-linux` (que são as que a CI compara) foram regravadas no
> mesmo dia. **Não virou pendência.**
>
> **A máquina nova:** além do minipc, o Victor tem uma **VM Debian 13 no Hyper-V** desta máquina,
> já com uma chave minha autorizada. O minipc estava desligado; a VM resolveu. **O endereço, o
> usuário e o caminho da chave NÃO entram neste repositório** — estão com o Victor e na memória
> fora daqui, pela mesma regra que já valia para o minipc.
>
> **O procedimento, e ele vale para qualquer regravação futura:** empacotar só o necessário
> (`apps/catalog`, `packages/*/dist`, o spec, as baselines, `playwright.config.ts`), mandar por
> **scp**, e rodar de dentro de `mcr.microsoft.com/playwright:v1.61.1-noble` por **podman
> rootless**. As armadilhas, todas medidas hoje:
>
> - o `webServer` chama `python` e a imagem só tem `python3` → symlink em `/usr/local/bin/python`;
> - a imagem **não traz** `@playwright/test`. Instalar os devDeps do repositório seria baixar
>   recharts/codemirror/react à toa — um `package.json` mínimo com `@playwright/test@1.61.1` (a
>   MESMA versão do repositório) basta, e é o que faz o runner casar com `/ms-playwright`;
> - a VM começou sem podman, sem git, sem node, com o usuário fora do sudoers e o `apt` apontando
>   para o DVD de instalação (`cdrom://`). Root resolveu as três coisas.
>
> **E rode SEM `--update-snapshots` primeiro.** Foi o que provou o contêiner: 14 passaram byte a
> byte contra baselines geradas noutra máquina, noutro dia, e só as 2 do `topo` falharam. Se
> falhassem todas, regravar seria fabricar baseline em vez de medir.
>
> ## Duas pendências que ACABARAM em 16/08 — não as repita
>
> - **✅ As baselines `-linux`.** Vinham sendo empilhadas como "dívida declarada" sessão após
>   sessão. O Victor tem uma **máquina Linux na rede local** dedicada a isso e avisou "pela
>   milionésima vez". As 22 foram regravadas de dentro da imagem fixada
>   (`mcr.microsoft.com/playwright:v1.61.1-noble`, por **podman** — a máquina não tem docker), com
>   o código indo por **git bundle** porque o push segue suspenso. **Só 8 mudaram**; as outras 14
>   saíram byte a byte idênticas, o que prova que o contêiner reproduz. **O acesso à máquina não
>   entra neste repositório** — está com o Victor, e a regra virou global, fora daqui.
> - **✅ O Firefox roda.** Este bloco dizia desde 15/08 que o binário falhava em SxS. Era frase
>   herdada e nunca reconferida, repetida em três registros. Testado: **Mozilla Firefox 151.0**,
>   exit 0, nada reinstalado. **A suíte nos três motores: 143 passed · 2 skipped · 0 failed**
>   (chromium 63, firefox 40, webkit 40) — primeira vez que a
>   [ADR-0019](../../decisions/0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md) fica inteira.
>   **Armadilha:** o `PrintDeps.exe` do próprio Playwright reporta `mozglue.dll => not found` e é
>   **falso positivo** — ele não procura na pasta do executável.
>
> **A lição que as duas compartilham, e o Victor cobrou as duas no mesmo dia:** obstáculo que eu
> registro como permanente tem de ser **reconferido antes de ser repetido**. Copiar limitação
> antiga para o relatório novo não é continuidade — é propagar boato.
>
> ## O que foi entregue em 15–16/08 (contexto, não tarefa)
>
> **Parte N** — `BlockEditor` ([ADR-0025](../../decisions/0025-editor-por-blocos-sem-motor.md)): a
> Aurea entrega a **moldura** dos blocos e **não tem motor de texto rico**, por segurança (o
> navegador não sanitiza HTML colado). **Parte O** — `markup.tsx`
> ([ADR-0026](../../decisions/0026-marcacao-pura-e-de-servidor.md)) e o
> [`NATIVE.md`](../../docs/NATIVE.md). **NATIVE Etapas 1, 2 e 3**
> ([ADR-0027](../../decisions/0027-a-cor-no-alvo-nativo.md) ·
> [ADR-0028](../../decisions/0028-unistyles-como-motor-de-estilo-nativo.md)): a cor medida (hex é o
> **único** caminho vivo — o React Native recusa gamute largo por string de estilo, medido nas
> versões 0.81.5 e 0.87.0), o alvo `@aurea-uds/tokens/native` gerado e gateado, e **Unistyles v3**
> escolhido — que custa **cinco** peers e não roda no Expo Go. **A Etapa 4 não está autorizada** e é
> a primeira que constrói componente.
>
> **Correção de página inteira:** a de tokens do catálogo mostrava **261 nomes que não existem**,
> 153 amostras de cor vazias e 84 réguas iguais
> ([ADR-0029](../../decisions/0029-a-pagina-de-tokens-mostra-o-nome-real-e-o-escopo.md)).
>
> ## Identidade — o Victor reforçou em 16/08, e nada muda
>
> **Tudo arredondado, inspiração Apple.** A Aurea já é isso por contrato: raio 22px nas
> superfícies, pílula nos controles, sem gradiente. Ele mandou quatro referências visuais que
> **coincidem** com o que existe. Vale a trava do [`BUILDING.md`](../../docs/BUILDING.md) §1: de
> referência se extrai **anatomia**, nunca aparência.
>
> ## ⇨ ONDE ISTO PAROU — 17/08/2026, fim da tarde, e a razão é ORÇAMENTO
>
> A sessão acabou porque os tokens do Victor acabaram (98% do semanal). **Nada ficou pela metade
> no código: o commit `85216fc` está fechado e com todos os gates verdes.** O que falta é
> mecânico e está listado abaixo, em ordem.
>
> ### 1. AS BASELINES DE PIXEL — ⚠ NÃO precisam de nada. Medido.
>
> **Eu previ que `index` e `topo` iam reprovar. Previsão errada: `catalog.spec` fecha 16/16.**
> As `-win32` já tinham sido regravadas quando o crachá foi de 103 para **104** (a página do
> `BottomNav`); o `Badge` virar conteúdo rico mudou a contagem de *rich* no gerador, e isso **não
> aparece em nenhum recorte capturado**. As `-linux` foram regravadas no mesmo lote, no contêiner.
>
> Fica escrito porque é o tipo de coisa que se propaga: **não regrave baseline por previsão.**
> Rode, leia, e regrave só o que reprovar.
>
> ```
> npx playwright test tests/visual/catalog.spec.ts --project=chromium
> ```
>
> ### 2. A SUÍTE COMPLETA não terminou — mas ela já pagou o preço dela
>
> Ela rodou até o teste 66 de 145 e **achou uma regressão que os testes rápidos não pegaram**:
> `geometry.spec` reprovou com `.badge → 8, 16, 20, 24, 28px`. A trava cobra **altura única por
> classe na mesma página**, e o `Badge` novo tem escala.
>
> **Duas causas, e só uma era defeito** — está no commit `c100703`:
>
> 1. **DEFEITO:** o contador da barra encolhia `.badge` por regra **contextual**
>    (`.bottom-nav-badge .badge`). O mesmo nome medindo 16px numa página e 24px noutra é a
>    correção local que o `CLAUDE.md` proíbe. Agora existe **`size="xs"`** (16px, sem borda) — o
>    mesmo `size="xs"` do ReUI que o Victor mandou — e a barra **pede** o tamanho.
> 2. **Não era defeito:** `sm`/`lg`/`overlay` declaram outro tamanho **por classe**, que é o
>    propósito da escala. O seletor da trava passou a excluir quem declara tamanho próprio, e o
>    contrato que ela protege continua inteiro: dois badges do MESMO tamanho na mesma página têm
>    de medir igual, e sobrescrita contextual continua reprovando.
>
> **A suíte terminou: 140 passed · 2 skipped · 3 failed.** Os três já foram resolvidos:
>
> - **2 × `geometry`** — a regressão real acima, corrigida em `c100703`. `geometry` + `skin`
>   fecham **36/36 nos três motores** depois dela.
> - **1 × `catalog-sweep` axe, Firefox, tema escuro** — e este era **artefato meu**. Eu rodei
>   `pnpm build` **no meio da varredura**, que é exatamente a armadilha já registrada: o axe
>   fotografa página em reconstrução e a falha parece violação de acessibilidade. Rodado
>   isolado depois, passa nos dois temas. **Repeti um erro que já estava escrito** — quando a
>   varredura estiver rodando, a árvore não se toca.
>
> Falta rodar a suíte **inteira uma vez, com a árvore parada**, para ter o número limpo.
>
> **E ao rodar: LER O RELATÓRIO, não o código de saída.** `| tail` engole a falha — nesta mesma
> sessão isso escondeu 4 reprovações atrás de um `exit 0`.
>
> ### 3. O que estava verde quando parou
>
> `python scripts/validate.py` → **OK, 34 checks** (esta linha dizia **36**, e era contagem à
> mão: a numeração do arquivo vai até 36 mas **não tem o 7 nem o 8** — saíram com a página que
> cobravam. Quem mede é o `manifest.json`, gerado e gateado, e ele diz 34) · **804 testes unitários** · `skin.spec` **6/6**
> nos três motores · contraste medido em 36 combinações, mínimo **5,60:1**.
>
> ## O que esta sessão entregou, e o que ela ensinou
>
> **`BottomNav`** fechou o §4.1 do `CONSUMIDOR-1` — a lacuna ESTRUTURAL.
> [ADR-0030](../../decisions/0030-a-barra-inferior-reusa-o-item-da-lateral.md). Recebe o **mesmo
> `SidebarItem`** da lateral: uma lista, duas peles. Quatro variantes, e **duas saem de aplicativo
> que roda** — o Victor mandou prints de WhatsApp, YouTube, Mercado Livre e Shopee.
>
> **`Badge`** foi reescrito a pedido dele (*"o nosso atual é pobre"*): 14 capacidades, lidas no
> fonte local da Untitled UI e da MUI. O registro completo está no `REFERENCES.md`.
>
> **TRÊS DEFEITOS ANTIGOS que esta construção desenterrou, e o padrão deles é o mesmo:**
>
> 1. `.badge-primary` dentro de `.btn-primary` media contraste **1** — amarelo sobre amarelo,
>    invisível, **publicado**, e nenhum gate via **porque página nenhuma compunha os dois**.
> 2. As três ênfases nasceram escritas **antes** das variantes: especificidade igual, ordem de
>    fonte decide, e `solid` desenhava igual ao `soft` em 4 das 6 variantes.
> 3. Um fixture do `skin.spec` usava a string `"3"` no lugar de um `<Badge>` de verdade. Sem a
>    caixa de 24px o defeito não aparecia, e **o gate passou verde com o erro na tela**.
>    **Fixture mais fraco que o uso real é gate que mente.**
>
> **A lição que o Victor cobrou três vezes nesta sessão, e ela é a mais cara:** eu construí de
> memória em vez de pesquisar antes. A barra inferior teve de ser refeita três vezes — cor errada,
> contador cobrindo o rótulo, contador maior que o ícone — e todas as três se resolveram lendo
> referência e medindo, não pensando. **A regra já existia e eu furei.**
>
> ## ⇨ O QUE FAZER DEPOIS DAS BASELINES
>
> **Duas coisas, e a ordem é essa:**
>
> **(a) O Victor ia mandar mais códigos de referência para o `Badge`.** Ele disse: *"vou te mandar
> os códigos de referência; depois que criamos, voltamos"* — voltar quer dizer voltar ao
> `BottomNav`, para trocar o contador caseiro dele pelo `Badge` ancorado. Hoje o `BottomNav` ainda
> tem `.bottom-nav-badge` próprio; **compor `Badge anchor=…` no lugar é dívida declarada**, não
> esquecimento.
>
> **(b) A LINHA DE LISTA TOCÁVEL — o §4.3, a última lacuna do `CONSUMIDOR-1`.** Fechada
> ela, o **K4** não espera mais nada, nem de fora nem de dentro. **Não está autorizada.**
>
> ## Uma lacuna NOVA, achada e não construída: `Tag`
>
> Chip removível (com o X de fechar) **não é `Badge`** — a `DIRECTION.md` §3.6 reserva
> classificação removível para **`Tag`**, e `Tag` não existe na Aurea. O segundo motivo bate com o
> primeiro: um manipulador em JSX forçaria `"use client"` no `markup.tsx`, que é o arquivo que
> existe para NÃO ter a diretiva (ADR-0026 — o `Card` custava 118,5 KB). Não invente um
> `Badge onDismiss`: os dois motivos apontam para o mesmo componente novo.
>
> **E o primeiro passo dela não é código.** O [`BUILDING.md`](../../docs/BUILDING.md) §2 manda medir o
> nosso primeiro e consultar o componente nas referências antes de escrever uma linha. O que a
> barra inferior aprendeu e vale igual aqui: as pastas de `Referencia/` são bibliotecas de
> **desktop**, então é provável que devolvam pouco — **zero na pasta manda PESQUISAR na internet**,
> não concluir que não se constrói. Na barra inferior UMA das nove tinha o componente, e o que
> valia nela não era o componente: era a anatomia.
>
> **E olhe o nosso primeiro, de verdade.** Na barra inferior o passo 1 achou o desenho inteiro
> dentro do `SidebarItem` que já existia. A linha de lista tem vizinhos óbvios — `.sidebar-item`
> (que já é ícone + rótulo + acessório numa linha clicável), `DataList`, `Table`. **Comece medindo
> se o que falta é um componente ou uma pele.**
>
> Depois disso vale tudo que o `BUILDING.md` §4 cobra de componente novo: ficha, teste, pele com
> efeito no `skin.spec`, entrada no `REFERENCES.md`, conteúdo no catálogo — e a linha nova no
> `decisions/README.md` **no mesmo commit** se sair ADR.
>
> ## O resto da fila, sem pressa
>
> - **Etapa 4 do nativo** — precisa do app real na frente.
> - **Logo e marca** do produto dele — identidade dele, sessão própria.
> - **Conteúdo do catálogo** — 81 dos 103 componentes têm só o starter, sem `features` nem
>   `examples`. É dívida de documentação, não de biblioteca, e não segura versão nenhuma.
> - **K2** (publicador confiável) — ⏸ adiado sem data, e **não** bloqueia a `1.0`.
>
> **Push:** suspenso por ordem dele até ~01/09/2026. Quantos commits locais **se mede**:
> `git rev-list --count origin/main..HEAD`. **Desde 17/08 eles têm cópia externa** — o `git bundle`
> em `Aurea-UDS-backup` no Google Drive, com LEIA-ME próprio.
>
> **O que o K5 destravou:** a `0.1.0` **quebrava na hora** quando importada num componente de
> servidor, então a condição da `1.0` ("consumidor real instalando do npm") era **circular** — o
> defeito que impedia o consumidor era o que estava retido esperando por ele. Está publicado. A
> metade circular caiu.
>
> **O que sobrou, e por que nenhuma das duas é trabalho de agente sozinho:**
>
> - ~~**K4** espera consumidor real instalando a `0.2.0`. Não há ADR: consumidor interno
>   satisfazendo "consumidor real" muda a ADR-0014... Não presuma que satisfaz.~~
>   **⚠ ESTE PARÁGRAFO ESTAVA VENCIDO E ERA A ARMADILHA.** Ele é de 12/08; no dia seguinte a
>   [ADR-0022](../../decisions/0022-consumidor-real-e-projeto-do-victor.md) decidiu, citando o
>   Victor, que **projeto dele É o consumidor real**. Ler esta linha e "concluir" que a dúvida
>   continua aberta foi **exatamente** o que fez o Opus reabrir a questão três vezes. Fica riscada,
>   não apagada, para quem a encontrar em algum registro antigo saber que já foi respondida. O que
>   falta para o K4 é a navegação inferior e a linha de lista — do nosso lado.
> - **K2** (publicador confiável) está ⏸ **ADIADO SEM DATA** desde 12/08/2026 —
>   [ADR-0021](../../decisions/0021-o-publicador-confiavel-fica-adiado.md), decisão do Victor. **Não
>   o trate como pendência.** A saída que a ADR-0013 não listou é **não automatizar**: dois publishes
>   à mão, de minutos, com a CI parada por um mês, e nenhum segredo existindo para vazar. Volta a
>   valer por **frequência ou mãos** (>~1 publish/mês, ou mais de um mantenedor), **nunca** só porque
>   a CI voltou. O `checkbox` fica desmarcado de propósito: não foi feito.
>
> **E existe um controle novo, de DEPOIS do publish:** `node scripts/check-published.mjs` instala os
> pacotes **do registro** num projeto limpo fora do repositório — reusando `apps/proof-server` e
> `apps/proof-client` com `workspace:*` trocado pela versão — e constrói os dois. Existe porque todo
> gate deste repositório mede a ÁRVORE, e a `0.1.0` ficou doze dias no npm sem instalar em RSC sem
> ninguém poder ver. **Não roda no `validate.py` nem na CI** (precisa de rede e de versão
> publicada), e **não é o K4**.
>
> **Se houver um próximo publish, leia o rodapé do K5 no `PLANO-1.0.md` antes.** Três coisas que só
> aparecem executando: as três operações da ADR-0020 são **obrigatoriamente um commit** (qualquer
> ordem separada deixa um commit vermelho — o check 31 reprova nomeando 27 componentes); são **oito**
> arquivos de versão, não seis; e a receita da própria ADR tem um **laço** (o `released-surface.json`
> é gerado de `git show <commit>:manifest.json` e mora dentro desse commit).
>
> **A `0.3.0` (17/08) confirmou as três e acrescentou uma quarta:** o laço se resolve preenchendo o
> campo `commit` num commit SEGUINTE, de uma linha — o hash não existe enquanto o commit está sendo
> escrito, e nenhum gate lê esse campo.
>
> **⚠ UMA PENDÊNCIA DE OUTRA MÁQUINA, e ela é a primeira coisa a resolver:** a Parte I acrescentou
> quatro blocos (I5 a I8), então o crachá de `Blocks` no topo do catálogo foi de **11 para 15**. As
> duas baselines `-win32` do topo foram regravadas aqui — duas vezes, 11→12 no I5 e 12→15 no
> I6–I8 —; as **`-linux`, que são as que a CI compara, não.** Elas saem do contêiner oficial do
> Playwright no minipc — a receita está no §2 deste documento, provada em 09/08 e repetida em
> 11/08, **com o caminho de acesso ao lado dela** ("Chegar até lá"). O host, o usuário e a senha
> **não** estão escritos: são dados que o Victor fornece, porque este repositório vai ser público.
> Enquanto as `-linux` não saírem, o passo de screenshot da CI reprova, e reprova com razão.
> **São só essas duas capturas:** todo o resto da Parte I e a correção das dez prévias fecharam com
> **zero** mudança de pixel nas outras 59.
>
> **O que pode começar, e cada um precisa de `PODE IMPLEMENTAR` do Victor:**
>
> | Candidato | Estado | Primeira ação |
> |---|---|---|
> | ~~**K1 Firefox**~~ | ✅ **MARCADO em 11/08/2026** | por ordem do Victor. O Firefox **rodou e passou** no contêiner (131 testes, três motores); o WebKit passou em 09/08. **Nesta máquina o Firefox segue não iniciando** (`browserType.launch: spawn UNKNOWN`) — ~35 falhas de ambiente numa execução dos três motores, e é esperado: a verificação dele é no contêiner |
> | ~~**K3 changelog**~~ | ✅ **FECHADO em 11/08/2026** | e o enunciado estava estreito: as quebras eram **cinco**, não duas, e **duas são de CSS** — nenhuma parte do plano cobre CSS do core. A **Parte F não quebrou nada**. Nasce o **check 31** (`scripts/released-surface.json`), provado contra quatro injúrias |
> | ~~decidir `0.2.0` × `1.0`~~ | ✅ **DECIDIDO em 11/08/2026** | o Victor delegou ("escolha o melhor lógico") e virou a [ADR-0020](../../decisions/0020-a-proxima-versao-e-0-2-0-nao-1-0.md): **`0.2.0`**, porque a condição do K4 era circular. Nasceu o item **K5** |
> | ~~**K5 publicar a `0.2.0`**~~ | ✅ **FECHADO em 12/08/2026** | os seis no npm em `0.2.0`, commit `450d8df`. O agente preparou e conferiu; **o `npm login` e o `npm publish` foram do Victor** — a ADR-0013 diz por escrito que nenhum agente faz esse passo. Dois achados: o comando de publish da ADR encadeia com `&&`, que o **PowerShell 5.1 não tem** (corrigido lá), e **nada cobra que os seis versionem juntos** (tarefa registrada) |
> | **K2 publicador confiável** | ⏸ **ADIADO SEM DATA em 12/08/2026** | [ADR-0021](../../decisions/0021-o-publicador-confiavel-fica-adiado.md). Não é pendência: é item esperando **motivo**. Gatilho é frequência ou número de mantenedores, não data — e **não** "a CI voltou" |
> | **K4 publicar a `1.0`** | **aberto, e é decisão do Victor** | falta consumidor real instalando a `0.2.0`. Ele disse em 12/08 que sai de projeto dele e fica para depois — **sem ADR**, e usar consumidor interno muda a ADR-0014 |
> | ~~as 10 prévias que rolam~~ | ✅ **FECHADO em 11/08/2026** | as dez caberam e **o gate existe**: `catalog-sweep` mede a rolagem vertical da caixa de demo, provado contra as três causas. **0 de 524.** |
>
> **Seis coisas que a próxima sessão precisa saber ANTES do primeiro comando:**
>
> 1. **Confira o servidor antes de qualquer teste de pixel.** A porta 8123 é fixa e
>    `reuseExistingServer` é silencioso — se houver outro worktree servindo, você fotografa a
>    árvore dele. Aconteceu duas vezes em 11/08. O comando está no registro abaixo.
>    *(Em 11/08, ao fim do K3, o worktree antigo foi removido — ver o aviso 9. O risco continua
>    valendo para qualquer sessão paralela: o que prova é comparar a soma SHA-256 da página servida
>    com a do arquivo local, não olhar `git worktree list`.)*
> 2. **O vão útil do painel de demo é 354px** (viewport 1440×761, onde o `clamp` da ADR-0002 bate
>    no piso), e **`.table` exige `min-width:720px`**. Os dois números decidiram o desenho do I3
>    e do I4 — ver o registro do I4.
> 3. **Medir não basta: OLHE a imagem.** Cinco vezes em 10–11/08 a medição passou verde e a
>    imagem reprovou — duas delas no I5.
> 4. **Trava cobra a REGRA, não a presença da palavra.** Três vezes em 11/08 eu escrevi teste que
>    passava com o defeito dentro: `/default/i` satisfeito pelo rótulo do botão "Revert to default"
>    (I6), `/resume at/i` satisfeito com o valor trocado por "where you left off" (I7), e "existe
>    algum botão de mover" satisfeito com metade das setas apagadas (I8). Nos três casos quem pegou
>    foi a **prova contra o defeito**, não a leitura. Ao escrever a asserção, pergunte: *qual defeito
>    exatamente ela deixa passar?*
> 5. **Busca de referência é `grep` de CONTEÚDO, não `find` de diretório.** No I5 eu procurei
>    pastas chamadas `checkout|payment|invoice|cart`, conclui "uma referência em dezesseis" e
>    perdi o `order-summary` do tool-ui — 296 linhas, esquema Zod, e a melhor das duas. Pasta tem
>    o nome que o autor escolheu; o conteúdo tem as palavras do domínio. Procure por `subtotal`,
>    `refund`, `idempotenc`, e por nome de ARQUIVO, não só de pasta. Vale para o I6, I7 e I8.
> 6. **O pane do navegador da sessão pode estar oculto**, e aí o `screenshot` expira ("the
>    Browser pane is not displayed"): sem composição de quadros não há foto. A saída usada no I5
>    foi fotografar com o **Playwright** e ler o PNG — mesmo viewport, mesma troca de tema
>    (`document.documentElement.dataset.theme`) que o `catalog.spec` usa.
> 7. **Número que você copia de um documento DESTE projeto também precisa de comando atrás.** No
>    K3 eu copiei "19 dos 22 módulos com a diretiva" do rodapé da Parte A — verdade em 06/08,
>    vencida depois que `agents.tsx` e `graph.tsx` nasceram. São **21 de 24**. E o contador de
>    checks que estas linhas escrevem à mão ("30") discorda do `manifest.json`, que MEDE e diz
>    **29**. *Medir, não contar* vale para o próprio registro, não só para o código.
> 8. **Fan-out de agentes é proibido por medição, e eu esbarrei nisso outra vez.** Comecei o K3 com
>    um workflow de 14 agentes; o Victor mandou parar antes de queimar a conta. O mesmo trabalho
>    saiu de **quatro scripts** de medição no scratchpad, mais barato e — o que importa mais —
>    **reprodutível**, que é o que o changelog precisava citar no rodapé. Medição é script.
> 9. ~~**Há um worktree antigo na árvore**~~ — **REMOVIDO em 11/08/2026**, com autorização do
>    Victor. **⚠ E VOLTOU A ENCHER: em 18/08/2026 havia DOIS, um deles órfão do git — removidos, e
    o relato está no topo do §3.** Depois disso `.claude/worktrees/` está vazia e
    `git worktree list` mostra só o `main`. Fica
>    registrado porque o **procedimento** vale para a próxima vez, e porque ele quase deu errado.
>
>    O dano que ele fazia: carregava uma **cópia vencida** do `PLANO-1.0.md` e deste arquivo, então
>    `grep -r` devolvia **duas** respostas e uma era velha — aconteceu comigo na varredura de fim do
>    K3. E servir a porta **8123** de dentro dele faz o `reuseExistingServer` fotografar a árvore
>    errada **calado**, que já custou duas vezes em 11/08 (§2).
>
>    **Antes de apagar, o que se confere** — e `git status` **não basta**, porque ele não mostra
>    arquivo ignorado: trabalho não commitado, `stash list`, commit exclusivo
>    (`git log main..<branch>`), arquivo que exista só lá (`git diff --diff-filter=D 52395b8..main`)
>    e, o mais importante, se há **`Referencia/`** própria dentro — ela é gitignored e valiosa. Neste
>    caso: tudo vazio, o branch **mergeado**, e a `Referencia/` só existe no `main`. Nada se perdeu.
>
>    **⚠ E o `git worktree remove` FALHOU NO MEIO, deixando o pior estado possível:** ele
>    **desregistrou** o worktree e depois abortou o `rmdir` com *"Directory not empty"* — por causa
>    do `node_modules` (41.399 arquivos). Resultado: o git deixou de conhecer a pasta e a pasta
>    continuou lá, com as cópias vencidas. O `--force` seguinte então recusa com *"is not a working
>    tree"*, porque já não é. **Confira que a pasta SUMIU do disco**, não que o comando "passou";
>    se sobrou, apague o diretório à mão e rode `git worktree prune`.
>
> ---
>
> **11/08/2026 — K3, o changelog. E ele estava mais vazio do que o enunciado supunha.**
>
> ```
> Tarefa: PLANO-1.0 Parte K, item K3 — changelog de verdade. Autorizado pelo Victor.
> Arquivos analisados: a superficie publica inteira entre a0dd056 (o publish da 0.1.0) e HEAD,
>   99 commits — packages/react/src/*.tsx (24 modulos) · packages/core/src/aurea.css ·
>   packages/tokens/src/aurea.tokens.json · os 6 package.json · as 92 fichas de registry ·
>   manifest.json nas duas revisoes · ADR-0014 (o que 0.x obriga) · QUALITY.md
> Arquivos alterados: CHANGELOG.md (reescrito, ingles) · scripts/validate.py (check 31) ·
>   scripts/released-surface.json (novo, congelado) · manifest.json (gerado) · PLANO-1.0.md ·
>   este arquivo
> O que mudou: o changelog cobre os 99 commits. 5 quebras (eram 2 no enunciado), 27 componentes,
>   3 subpaths, 3 peers opcionais, 39 props, 7 valvulas de CSS, RSC. Nasce o check 31.
> Decisoes tomadas: idioma INGLES (decisao do Victor, perguntada com a medicao na mao: o arquivo
>   nao vai em tarball nenhum, mas o README ao lado esta em ingles) · o congelado e' marco de
>   RELEASE e nao se regera por sessao · o gate cobra COMPONENTE, e o limite esta escrito nele
> Testes executados: validate OK (29 checks, medido em manifest.json gates.validate) ·
>   check-pack OK (react:51) · vitest 662/662 · playwright chromium+webkit 97 passed, 1 skipped,
>   0 failed · check 31 provado contra 4 injurias
> Falhas: a MINHA medicao errou duas vezes antes de virar numero. (1) A regex leu COMENTARIO como
>   codigo — 4a vez nesta casa — e deu `"use client"` por presente no barril, cujo comentario diz
>   "SEM use client". (2) Copiei "19 de 22 modulos" do rodape da Parte A em vez de medir: sao
>   21 de 24. As duas corrigidas antes de qualquer numero entrar no arquivo.
> Limitacoes: o check 31 cobra componente, nao prop/token/subpath/classe removida. Cobrir prop
>   exigiria diff de assinatura contra o commit do release, e o validador nao le git de proposito
>   (roda em tarball). Esta escrito no _limite_declarado do released-surface.json.
> Pendencias: as 2 baselines -linux do topo, desde o I5 — precisam do minipc. K1 (marcar), K2 e K4.
> Riscos: a decisao 0.2.0 x 1.0 e' do Victor e esta' na tabela de candidatos acima.
> Proxima tarefa exata: nada comeca sem PODE IMPLEMENTAR. As tres da Parte K dependem de fora.
> Criterio de continuidade: check 31 verde com o changelog completo, e reprovando sem ele.
> ```
>
> **O que a medição derrubou do enunciado, em uma tabela:**
>
> | O enunciado dizia | A medição disse |
> |---|---|
> | "as quebras das partes B e F" | **a Parte F não quebrou nada** — o F1 manteve o modo interno como default |
> | duas quebras | **cinco**, e **duas são de CSS**: as 5 regras de ELEMENTO que estilizavam toda `<table>` do consumidor, e 14 classes removidas. Nenhuma parte do plano cobre CSS do core |
> | — | o item de maior valor **não é quebra**: o pacote passou a funcionar em componente de servidor, e o changelog anterior não citava |
> | `Avatar.size` e `AvatarGroup.size` | o `AvatarGroup` **não existia** na `0.1.0` |
> | "nada muda de tamanho em `comfortable`" | **muda**: o default era `size={40}` inline; hoje é `md` = 36px. Um `<Avatar/>` sem prop encolhe **4px** |
> | — | o `FileEntry` **parecia** quebra grossa (`id` de number para string, dois campos virando obrigatórios) e **nunca foi exportado**. Nota de quebra falsa custa mais que ausente |
>
> **11/08/2026 — as 10 prévias que rolavam, e o gate que faltava. Fora do PLANO-1.0.**
>
> ```
> Tarefa: fora do plano — o achado da sessao do I6-I8: 10 de 520 caixas de demo rolavam, contra a
>   ADR-0002, e nenhum gate olhava. Autorizado pelo Victor depois de eu propor o chip e ele
>   perguntar por que nao fazer aqui.
> Arquivos analisados: as 206 paginas do catalogo, medidas com script proprio (arvore de alturas
>   ate 3 niveis) · packages/core/src/aurea.css (.log-stream, .media-player, as tres classes com
>   `auto-fill`) · content/_starters.mjs · content/_recipes.mjs · content/blocks/app.mjs
> Arquivos alterados: aurea.css (+`--log-h`) + dist · _starters.mjs (3 previas) · _recipes.mjs
>   (4 previas) · blocks/app.mjs (2 previas) · catalog-sweep.spec.ts (o gate) · BUILDING.md
> O que mudou: 10 previas passaram a caber, por TRES causas distintas — e o gate novo pega as tres.
> Decisoes tomadas: `--log-h` no core, a QUINTA valvula de altura, com default 240px inalterado.
> Testes executados: vitest 662/662 · playwright chromium 62/62 (o gate novo entrou) · validate OK
> Falhas: nenhuma. ZERO baseline de pixel mudou — as paginas corrigidas nao tem captura.
> Limitacoes: o gate mede a 1440x761, que e' o pior caso registrado; outras larguras nao sao
>   varridas, porque a caixa so tem altura fixa nesta.
> Pendencias: Parte K. As baselines -linux seguem pendentes desde o I5.
> Riscos: nenhum novo.
> Proxima tarefa exata: Parte K — ver a tabela de candidatos acima.
> Criterio de continuidade: 0 de 524 caixas rolando, com gate provado.
> ```
>
> **As dez tinham TRÊS causas, e só uma era "conteúdo demais" — que era a minha hipótese.**
>
> | Causa | Quantas | O que era |
> |---|---:|---|
> | **CSS de altura fixa** | 5 | `.media-player` tem `aspect-ratio:16/9` (464px na largura do painel) e `.log-stream` tinha `height:240px` — gastava 240 para mostrar três linhas |
> | **grid responsivo COLAPSADO** | 1 | `.health-matrix` sem largura vira **uma coluna**: 192px de largura, quatro células empilhadas, 362px de altura. A prévia mentia sobre o componente — matriz é matriz porque tem colunas |
> | **conteúdo alto demais** | 4 | formulário empilhado, dois turnos de conversa onde um basta, frase de aviso em duas linhas |
>
> **A do grid colapsado é a que eu não teria achado sem perguntar "quem mais?".** Varridas as três
> classes que o core declara com `auto-fill` — `.grid`, `.icon-grid`, `.health-matrix` — só essa
> estava colapsada, então o conserto é na prévia e não numa regra. Mas a medição valeu: sem ela eu
> teria cortado células de uma matriz que não tinha conteúdo demais nenhum.
>
> **O gate ficou onde pega a CLASSE, não o caso** — `catalog-sweep`, que já varre as 206 páginas —,
> e ele mede `scrollHeight > clientHeight`, o mesmo sinal que o navegador usa para decidir se põe
> barra. Não mede altura contra um número escrito no teste, que envelheceria na primeira mudança de
> densidade. **Provado contra as três causas**, uma a uma, e a mensagem nomeia o defeito:
> `healthmatrix.html [caixa 0]: conteúdo 362px, sobra 8px além da caixa`.
>
> **E a regra da ADR-0002 está no gate, não só no documento:** quem cede é o conteúdo. Nas dez, a
> saída foi sempre cortar o que já estava dito em outro lugar — o título "Sign in" que o botão
> primário repete, a segunda frase do aviso que descreve os dois campos logo abaixo, o turno do
> humano que repete o título da receita — ou dar ao layout a largura que ele já pedia.

> **11/08/2026 — I6, I7 e I8: A PARTE I FECHA. Oito composições, 8 de 8.**
>
> ```
> Tarefa: PLANO-1.0 Parte I, itens I6, I7 e I8 — autorizados juntos, num pedido so.
> Arquivos analisados: aurea.contract.json (DeviceControl, MediaLibrary, VisualBuilder) ·
>   packages/react/src/{agents,media,graph,inputs,layout}.tsx · packages/core/src/aurea.css
>   (.media-player, .card-interactive, .health-matrix, .graph-node) · content/_starters.mjs
>   (MediaPlayer e DependencyGraph) · Referencia/: openstatus (incidents/dialog-confirm),
>   media-chrome (playlist, chapters, tracks, keyboard-shortcuts), xyflow
> Arquivos alterados: content/blocks/insight.mjs (+3 composicoes) · tests/unit/composition.test.tsx
>   (+3 describes) · packages/core/src/aurea.css (a valvula --media-h/--media-ar) + dist ·
>   REFERENCES.md · PLANO-1.0.md · STATE.md/README/manifest (gerados) · 206 paginas do catalogo ·
>   2 baselines -win32
> O que mudou: as 7 regioes do DeviceControl, as 8 do MediaLibrary e as 7 do VisualBuilder, todas
>   por composicao. Zero componente novo. UMA mudanca de core, autorizada.
> Decisoes tomadas: (1) --media-h/--media-ar no core, pedidas ao Victor com a medicao na mao;
>   (2) a barra de acoes do I7 NAO repete o transporte do player; (3) o I8 publica `idle` e nao
>   `invalid`, porque o alerta de validacao nao e' regiao e custava 56px; (4) a galeria do I7 e' de
>   <button> porque `.card-interactive` nao recebe foco.
> Testes executados: vitest 662/662 · playwright chromium 61/61 · validate.py OK (30 checks)
> Falhas: as 2 do `catalogo-topo` (crachá de Blocks 12 -> 15), regravadas DEPOIS de conferir o
>   servidor (curl: 15 blocos) e de OLHAR o recorte ampliado: baseline 12, captura 15.
> Limitacoes: as baselines -linux seguem pendentes, agora com tres blocos de diferenca.
> Pendencias: Parte K (K1 marcar, K3 changelog, K2 e K4 dependem de fora) + as 10 previas que
>   rolam, achadas nesta sessao e fora do plano.
> Riscos: nenhum novo. A valvula do core tem default identico ao de antes — zero pixel nas 59
>   capturas que nao sao o topo.
> Proxima tarefa exata: ver a tabela de candidatos acima.
> Criterio de continuidade: os quatro verdes acima.
> ```
>
> **O achado que vale mais que os tres itens: 10 de 520 prévias do catálogo ROLAM.** A ADR-0002 fixa
> a altura da caixa de demonstração e lista como consequência boa *"nenhuma demo exige rolagem"* —
> e **nenhum gate olha isso**. Medido nas 204 páginas, viewport 1440×761:
>
> | Página | Conteúdo | Caixa |
> |---|---:|---:|
> | `recipe-media-streaming` | 585 | 402 |
> | `recipe-observability-ops` | 538 | 402 |
> | `mediaplayer` · `mediaplayershell` | 530 | 402 |
> | `block-settings-form` | 510 | 402 |
> | `recipe-agent-ai` | 505 | 402 |
> | `recipe-workflow-automation` | 485 | 402 |
> | `recipe-developer-tools` | 474 | 402 |
> | `block-sign-in-panel` | 445 | 402 |
> | `healthmatrix` | 410 | 402 |
>
> Nos dois do player a causa é medida (`min-height:360px` + `aspect-ratio:16/9` = 464px na largura
> do painel); os outros nove são conteúdo alto demais. **O lugar da trava é o `catalog-sweep`**, que
> já varre as 204 páginas medindo rolagem LATERAL — falta a VERTICAL dentro do `.demo-panel`. Não
> liguei o gate aqui porque ele reprovaria dez páginas que não são deste item, e allowlist grande
> nasce como dívida escondida. Está registrado como tarefa própria, com a lista e o método.
>
> **O que os três itens ensinaram, e é uma coisa só: o que decide o desenho é a MEDIÇÃO da caixa.**
> Os três nasceram estourando o vão de 354 (429, 385 e 419) e os três fecharam abaixo dele (328,
> 338 e 328), sempre cortando o que **já estava dito em outro lugar** — a linha de título que
> repetia o nome já visível na frota (I6) ou na galeria (I7), o `detail` que fazia uma célula ter
> três linhas numa matriz que mede a mais alta (I6), o rótulo empilhado sobre o controle (I8). Em
> nenhum deles a saída foi mexer na altura da caixa, que é o que a ADR-0002 proíbe. E o I7 é a
> exceção que confirma: quando o conteúdo **não podia** ceder — um player tem altura mínima no CSS
> —, a saída foi pedir autorização para uma válvula, não empurrar o problema para a demo.
>
> **Uma previsão de registro morreu em um dia, e vale como aviso sobre registros:** o I4 escreveu
> que "o I8 vai precisar do mesmo [prerender]". Não precisou — o H14 já havia resolvido o SSR do
> grafo, e o starter dele sai desenhado sem `prerender` nenhum. Registro é bom para o que foi
> medido; para o que vem depois, ele é hipótese, e hipótese em documento canônico envelhece calada.

> **11/08/2026 — I5 `TransactionFlow`. A Parte I vai a 5 de 8.**
>
> ```
> Tarefa: PLANO-1.0 Parte I, item I5 — a composicao de transacao, autorizada nesta sessao.
> Arquivos analisados: packages/contracts/aurea.contract.json (applicationPatterns.TransactionFlow)
>   · apps/catalog/content/blocks/insight.mjs (os 4 anteriores) · content/blocks/app.mjs
>   · tests/unit/composition.test.tsx · packages/react/src/{pure,feedback,data-display}.tsx
>   · packages/core/src/aurea.css (.data-list, .stepper, .table) · patterns/commerce_finance.md
>   · Referencia/: as 16 pastas varridas por checkout|payment|invoice|billing|transaction|cart,
>     e o template checkout do MUI lido inteiro (Checkout, Info, Review, PaymentForm)
> Arquivos alterados: content/blocks/insight.mjs (+268) · tests/unit/composition.test.tsx (+165)
>   · REFERENCES.md · PLANO-1.0.md · STATE.md + README (gerados) · manifest.json (gerado)
>   · 203 paginas do catalogo regeradas · 2 baselines -win32
> O que mudou: as SETE regioes do contrato, com as acoes derivadas da tabela de transicoes e
>   morando na regiao que cada uma afeta (o contrato nao tem regiao `actions`). Valor em centavo
>   INTEIRO, total SOMADO, moeda por codigo, chave de idempotencia no recibo, metodo por
>   referencia e zero campo de dado financeiro. Zero componente novo, zero CSS novo.
> Decisoes tomadas: (1) publicar `settled` — nenhum estado tem as sete regioes, e ele e' o maximo
>   com seis; (2) `requires_action` entra como o universal `waiting_user`, pelo CONCEITO e nao
>   pelo nome — primeira vez que isso acontece; (3) sem `Stepper`: as regioes deste contrato nao
>   sao passos e o `Status` ja diz o estado; (4) categoria "Operations", como as outras quatro.
> Testes executados: vitest 526/526 · playwright chromium+webkit 95 passed 1 skipped 0 failed ·
>   validate.py OK (30 checks) · check-pack OK (react:51) · build 203 paginas
> Falhas: 35 do FIREFOX numa primeira execucao dos tres motores — `browserType.launch: spawn
>   UNKNOWN`. E' o defeito de ambiente do K1, nao regressao: nesta maquina o Firefox nao inicia.
>   Mais as 2 do `catalogo-topo` (chromium), que eram o crachá de Blocks e foram regravadas
>   DEPOIS de conferir o servidor (curl: 12 blocos) e de OLHAR o recorte ampliado: baseline 11,
>   captura 12.
> Limitacoes: as baselines -linux do topo NAO foram regravadas — dependem do conteiner no minipc.
>   E a busca por anatomia devolveu 1 referencia de 16: o resto do item saiu de pesquisa, com as
>   fontes no REFERENCES.md.
> Pendencias: I6, I7, I8, Parte K. Mais o `.flow-panel`/`.flow-summary`/`.flow-total` que a
>   receita de commerce promete e o core nao tem.
> Riscos: o gate de pixel da CI reprova ate as -linux sairem. E' a mesma fila da Parte B e do I4.
> Proxima tarefa exata: as -linux no minipc, e depois a tabela de candidatos acima.
> Criterio de continuidade: os cinco verdes acima, com as -linux declaradas pendentes.
> ```
>
> **O que este item ensinou, e não é sobre dinheiro:** foi o primeiro em que o **passo 2 do
> `BUILDING.md` quase não teve o que ler** — uma referência de anatomia em dezesseis pastas. O
> reflexo errado ali é construir de memória e chamar de decisão. O caminho que funcionou é o que o
> `MemoryLedger` (H13) abriu: **quando não há anatomia, pesquisa registrada com fonte** — e as
> quatro pesquisas mudaram código de verdade (centavo inteiro em vez de float, código de moeda em
> vez de símbolo, o nome do cabeçalho de idempotência, e o campo de cartão que **não** entra).
>
> **CORREÇÃO, mesma sessão, e ela é o achado mais útil deste item:** a frase "uma referência de
> anatomia em dezesseis" acima estava **errada**, e o erro era meu método de busca. Procurei por
> **nome de pasta** e o componente certo se chama `order-summary` — nome diferente, mesma coisa.
> Refeita por conteúdo (`grep` de `subtotal`, `idempotenc`, nome de arquivo com
> `receipt|refund|price|amount`), a resposta é **duas de dezesseis**: o `checkout` do MUI e o
> `order-summary` do **tool-ui**, este último com 296 linhas e um esquema Zod de 108.
>
> **A leitura tardia mudou código, o que prova que a busca ruim custou:** quantidade × unitário
> separados, com o total da linha derivado (`2 × USD 24.00` → `USD 48.00`), porque `"2 seats"` ao
> lado de um número não diz se o número é o assento ou os dois. Isso é anatomia, entrou, e tem
> teste (`cents === qty * unit`). Mais uma confirmação independente: o
> `variant: "summary" | "receipt"` deles **exige** a decisão no recibo e a **proíbe** no resumo — a
> mesma divisão que eu havia medido nas regiões do contrato.
>
> ### O `tabular-nums`: eu ia pedir autorização para pôr no core uma regra que não faz nada
>
> Da mesma leitura eu levei `font-variant-numeric:tabular-nums` para a composição, e trouxe ao
> Victor a correção de raiz — `.data-list dd` no core, que alcança **15 páginas** — como decisão
> dele. Ele respondeu com **uma pergunta**: *"é a opção correta e a melhor para um produto de
> extrema qualidade?"*. Medi então o que eu devia ter medido antes de escrever a linha — largura
> dos dez dígitos, no navegador, por fonte:
>
> | Fonte | `normal` | `tabular-nums` | |
> |---|---:|---:|---|
> | **IBM Plex Sans** | 1 largura | 1 largura | **no-op** |
> | **Segoe UI** (1º fallback) | 1 | 1 | **no-op** |
> | `sans-serif` genérico | 2 | 1 | ajudaria — só no **terceiro** fallback |
> | **IBM Plex Serif** | 2 | **2** | a fonte **não tem** o recurso |
> | Georgia | 9 | 9 | idem |
>
> **Saiu do bloco e não entrou no core.** Três coisas ficam desta:
>
> 1. **Regra que não faz nada é o que o `skin.spec` existe para reprovar** — e eu ia pedir
>    autorização para violar a trava da própria casa, com a palavra "qualidade" na frase.
> 2. **`font-variant-numeric` é TIPOGRAFIA**, a primeira coisa que o `BUILDING.md` §1 lista entre as
>    que **nunca** se extraem de referência. A trava existia; passei por cima dela porque a
>    propriedade *parecia* técnica em vez de estética. O tool-ui roda outra fonte, onde ela
>    provavelmente faz efeito — o que vale numa pilha não vale na outra.
> 3. **O defeito que eu tinha visto na imagem nunca era esse:** o degrau de 74px entre os valores
>    era o `max-content` de duas `.data-list` independentes, e já estava resolvido pelas faixas. Eu
>    empilhei uma segunda "correção" sobre um problema já corrigido, sem medir se ela mudava algo.
>
> **As cinco declarações que o core já tem** (`.chart-tooltip b`, `.calendar td button`,
> `.file-size`, `.metric-total strong`, `.model-usage-value`) são no-op pelo mesmo motivo. Não são
> defeito — valem como seguro se as duas primeiras fontes falharem —, mas quem as ler não deve
> concluir que elas alinham alguma coisa hoje. **Não mexi nelas:** custo zero e fora do escopo.
>
> **E a referência que existia foi mais útil pelo DEFEITO que pela anatomia.** O `checkout` do MUI
> escreve o total à mão em quatro lugares, e os quatro números batem — hoje. Ver isso numa
> biblioteca madura é o argumento mais forte que existe para o teste que compara o DOM contra a
> soma: não é rigor de estilo, é o que impede a próxima mudança de preço de mentir em dois
> arquivos ao mesmo tempo.
>
> ---
>
> **11/08/2026 — MERGE: a correção do `nativeButton` entra no `main` (`5cca32c`).**
>
> ```
> Tarefa: fora do PLANO-1.0 — trazer o branch `claude/goofy-leakey-b07dba` (52395b8) para o main.
> Arquivos analisados: o diff do branch contra a base comum (0cce032, o I3) ·
>   packages/react/src/inputs.tsx (a correcao) · tests/unit/setup.ts (o gate) · BUILDING.md §4
> Arquivos alterados: resolucao de 8 conflitos — 1 real (04-PROTOCOLO-IA.md) e 7 HTML gerados
> O que mudou: `nativeButton` no BaseRadio.Root do SegmentedControl (uma palavra), e o gate de
>   `console.error` do Base UI no setup COMPARTILHADO — os 464 testes viraram detector.
> Decisoes tomadas: nenhuma. Os DOIS registros do §3 ficaram, em ordem de data; o cabecalho do
>   registro alheio ganhou NOTA em vez de reescrita.
> Testes executados: 464/464 · playwright 95 passed, 1 skipped, 0 failed · validate.py OK
>   (30 checks) · check-pack OK · build limpo (202 paginas)
> Falhas: nenhuma. Mas a porta 8123 tinha servidor de OUTRO worktree servindo 10 blocos contra
>   os 11 daqui — pego pela regra do registro anterior, ANTES da primeira captura.
> Limitacoes: nenhuma nova.
> Pendencias: I5 a I8, Parte K. As baselines -linux estao EM DIA.
> Riscos: o worktree `.claude/worktrees/goofy-leakey-b07dba` continua existindo; o branch ja
>   esta mesclado e pode ser removido quando o Victor quiser.
> Proxima tarefa exata: ver a tabela de candidatos acima. Nenhum comeca sem autorizacao.
> Criterio de continuidade: arvore limpa em 5cca32c e os cinco verdes acima.
> ```
>
> **O que o merge trouxe, e a parte boa não é a correção:** a correção é uma palavra. O que vale
> é **onde o gate foi parar** — `tests/unit/setup.ts`, o setup compartilhado. Um teste próprio
> para o `SegmentedControl` cobriria o caso que alguém lembrou; o setup cobre o que ninguém
> lembrou, e custou o mesmo. **Quando o defeito é uma CLASSE de erro e não um caso, a trava vai
> para onde todos os testes passam.**
>
> ---
>
> **11/08/2026 — as baselines `-linux` saíram, e o caminho quase produziu CORRUPÇÃO SILENCIOSA.**
>
> ```
> Tarefa: fechar a divida das baselines -linux, atrasada tres geracoes (I2, I3, I4).
> Arquivos analisados: playwright.config.ts (webServer, reuseExistingServer) ·
>   tests/visual/catalog.spec.ts (o recorte `topo`, o unico sem mascara) ·
>   apps/catalog/button.html (o fragmento .topbar, contra o HEAD)
> Arquivos alterados: 2 baselines -linux (dark/light-catalogo-topo) · PLANO-1.0.md ·
>   04-PROTOCOLO-IA.md (a correcao do meu numero errado, e este registro)
> O que mudou: as duas baselines -linux do topo passaram a refletir o crachao de Blocks em 11.
>   Nenhum -win32 tocado (22/22 conferidos).
> Decisoes tomadas: nenhuma.
> Testes executados: no conteiner do minipc, DUAS execucoes — com --update-snapshots
>   (129 passed, 2 skipped, 0 failed, 2 regravadas) e SEM o flag (129 passed, 2 skipped,
>   0 failed, ZERO regravadas). E' a segunda que vale.
> Falhas: UMA, e ela e' o achado desta sessao — ver abaixo.
> Limitacoes: nenhuma nova.
> Pendencias: I5 a I8 e K. Mais o MERGE do branch `claude/goofy-leakey-b07dba` (commit
>   52395b8, a correcao do nativeButton), que saiu de um ponto anterior ao I4.
> Riscos: a porta 8123 e' compartilhada e `reuseExistingServer` e' silencioso — ver abaixo.
> Proxima tarefa exata: I5 `TransactionFlow`, ou o merge do branch acima. Ambos precisam de
>   "PODE IMPLEMENTAR".
> Criterio de continuidade: arvore limpa e os cinco verdes.
> ```
>
> **O Firefox RODOU E PASSOU no contêiner** — 131 testes nos três motores, contra os 96 que esta
> máquina Windows consegue. É a metade que falta do **K1**, que está desmarcado desde 09/08 por
> *"item que nunca rodou não se marca"*. **Não marquei**: o K1 é da Parte K e não está
> autorizado. Mas agora ele tem execução atrás, e fechá-lo é barato.
>
> > **⇧ Vencido — o K1 foi MARCADO em 11/08/2026**, por ordem do Victor, com base exatamente nesta
> > execução. O parágrafo acima fica como registro do dia em que a prova apareceu.
>
> ### O achado: `reuseExistingServer` fotografa a árvore de OUTRA sessão, calado
>
> O `playwright.config.ts` declara `webServer` na porta **8123** com
> `reuseExistingServer: !process.env.CI`. Em 11/08 havia **duas sessões** trabalhando neste
> repositório — esta, e a que corrigiu o `nativeButton` num **worktree** com o estado anterior ao
> I4, ou seja **10 blocos**. A minha execução do `catalog.spec` reusou o servidor **dela** e
> fotografou a árvore dela.
>
> **O sintoma parecia regressão minha:** os dois `catalogo-topo` reprovando por 28 e 24 pixels,
> **de forma determinística** — reprovava isolado e reprovava na suíte, o que derruba a hipótese
> de corrida que o `docs.spec` tinha ensinado a suspeitar.
>
> **O que separou "regressão" de "servidor errado" foi medir a coordenada e OLHAR.** A caixa dos
> pixels diferentes tinha **7×8 px** — tamanho de um glifo — em x 820..826, e o `elementFromPoint`
> naquele ponto devolveu o crachá `nav-count` de **Blocks**. Ampliados 7×, os dois recortes
> mostraram a resposta sem margem para interpretação: **a baseline dizia `11` e a captura dizia
> `10`**. O HTML em disco tinha `11`, e a baseline em disco era byte a byte a commitada.
>
> **E o que quase aconteceu é pior que a falha.** O reflexo — o mesmo que eu usei três vezes hoje
> com razão — é "conteúdo mudou de propósito, regrava a baseline". Rodar `--update-snapshots` ali
> teria escrito, num repositório com 11 blocos, **baselines mostrando 10**. O gate ficaria verde
> por cima de uma foto da árvore de outra pessoa, e o próximo a mexer no topo herdaria isso sem
> nenhuma pista.
>
> **A regra que este achado escreve:** antes de regravar qualquer baseline, **confirmar que o
> servidor está servindo a SUA árvore.** Um comando basta, e ele é a versão de pixel do "medir,
> não contar":
>
> ```bash
> curl -s http://127.0.0.1:8123/apps/catalog/button.html | grep -o 'nav-count[^>]*>[0-9]*<'
> ```
>
> **Não gateei isso, e a razão é honesta:** a trava certa seria o `webServer` servir de um
> diretório carimbado e o teste conferir o carimbo — mudança na config que afeta toda execução, e
> que eu não vou fazer dentro de uma tarefa de baseline. Fica declarado, com o comando.


> **11/08/2026 — DEFEITO DE CLIENTE fechado FORA de item: o `nativeButton` do Base UI. A Parte I
> segue em 3 de 8; o I4 não começou.**
>
> > **Nota do merge (11/08/2026):** este registro foi escrito num worktree que saiu do `0cce032`,
> > antes do I4. A frase acima valia lá e **não vale mais**: o I4 fechou em `dc6ed1b` e a Parte I
> > está em **4 de 8**. Fica como estava, com esta nota ao lado — reescrever registro de outra
> > sessão apagaria de onde ele enxergava o repositório, que é metade do que um registro serve.
>
> ```
> Tarefa: fora do PLANO-1.0 — defeito achado em 10/08 pela medicao do I4, quando o prerender do
>   catalogo passou a montar o SegmentedControl de verdade (jsdom + createRoot).
> Arquivos analisados: node_modules/.pnpm/@base-ui+react@1.6.0_*/node_modules/@base-ui/react/
>   internals/use-button/useButton.js (a validacao inteira) · .../radio/root/RadioRoot.js (o que
>   `nativeButton` troca) · .../@base-ui/utils/error.js (o Set que deduplica) · os 34 arquivos do
>   motor que citam `nativeButton` · packages/react/src/{inputs,overlays,actions,feedback,
>   system,navigation}.tsx · tests/unit/setup.ts · tests/unit/stable.test.tsx · playwright.config.ts
> Arquivos alterados: packages/react/src/inputs.tsx · tests/unit/setup.ts ·
>   packages/react/dist/inputs.js (build) · 7 paginas do catalogo (geradas) · BUILDING.md ·
>   este arquivo
> O que mudou: `BaseRadio.Root` do `SegmentedControl` passou a declarar `nativeButton` — uma
>   palavra, no unico ponto do pacote onde uma parte com `nativeButton = false` recebe um
>   `<button>` no `render`.
>   E o `tests/unit/setup.ts` ganhou o gate que faltava: `console.error` que contenha
>   "Base UI:" derruba o teste.
> Decisoes tomadas: nenhuma ADR. A semantica de `nativeButton` foi LIDA no fonte instalado, nao
>   lembrada — e a leitura e' que disse que a correcao e' `nativeButton: true` e nao trocar o
>   elemento do `render`.
> Testes executados: pnpm test 438/438 · validate.py OK · pnpm build limpo (201 paginas) ·
>   check-pack OK (react:51) · playwright chromium+webkit 95 passed / 1 skipped / 0 failed
> Falhas: nenhuma de codigo. UMA de INFRAESTRUTURA, e ela quase virou diagnostico errado — ver
>   o rodape.
> Limitacoes: o gate so alcanca o que a suite unitaria MONTA. Os 92 componentes sao citados
>   (STATE.md), mas nao em toda configuracao — e os dois pontos que dependem do consumidor
>   (`Popover` e `DropdownMenu` recebem `trigger` como `ReactElement` qualquer) nao tem como
>   ser medidos daqui: quem escolhe o elemento e' quem instala.
> Pendencias: I4 a I8 (5 itens) e K (K1 pela metade, K2, K3, K4). As baselines -linux do topo
>   seguem duas geracoes atrasadas, do I2 e do I3.
> Riscos: o gate le a mensagem por SUBSTRING ("Base UI:"). Se o motor mudar o prefixo numa
>   atualizacao, a trava para de pegar sem reprovar nada — silenciosa, que e' o pior modo de
>   falhar. Fica declarado aqui porque nao ha como gatear o gate sem um segundo defeito plantado.
> Proxima tarefa exata: **I4 `AnalyticsWorkbench`** — inalterada. Comecar pelo passo 1, e nele
>   pela largura: o `Chart` e a `Table` na mesma composicao, e a `.table` exige 720px dos 856 do
>   painel. Referencia: `langfuse-main/web/src/features/dashboard`.
> Criterio de continuidade: arvore limpa e os cinco verdes acima.
> ```
>
> **O alcance relatado era 17 e o real e UM — e os dois numeros saem do mesmo comando mal lido.**
> `grep -n "render={<button" packages/react/src/*.tsx` devolveu 17 linhas em 5 arquivos, mas as
> 17 sao as ocorrencias de `render={` **qualquer** — `render={<h2/>}`, `render={<strong/>}`,
> `render={trigger}`, `render={<IconButton…/>}`. Com o padrao literal:
>
> ```bash
> rg -n 'render=\{<button' packages/react/src   # 2 linhas, 1 arquivo — e uma delas e comentario
> rg -c 'render=\{'        packages/react/src   # 17, em 5 arquivos
> ```
>
> **"Quem mais tem esse problema?" foi respondida por dois caminhos, e os dois deram o mesmo
> numero.** O aviso so existe onde o componente do motor declara `nativeButton = false` e recebe
> um `<button>`; onde o padrao e' `true`, entregar `<button>` e' o certo e o motor cala.
>
> | | quantos | quais |
> |---|---:|---|
> | partes do motor com `nativeButton = false` | **9** | `Checkbox.Root`, `Combobox.Item`, `Menu.CheckboxItem`, `Menu.Item`, `Menu.RadioItem`, `Menu.SubmenuTrigger`, `Radio.Root`, `Select.Item`, `Switch.Root` |
> | dessas, usadas pela Aurea | **3** | `Combobox.Item`, `Menu.Item`, `Radio.Root` |
> | dessas, com `render` de `<button>` | **1** | `Radio.Root`, em `SegmentedControl` |
>
> As outras duas nao passam `render` nenhum e ficam com o elemento padrao do motor. E o sentido
> **contrario** foi medido junto, porque ele tem o aviso simetrico: as **11** partes de
> `nativeButton = true` que a Aurea usa (`Toolbar.Button`, `Dialog.Close`, `Popover.Trigger`,
> `Menu.Trigger`, `Combobox.Clear`/`Trigger`/`ChipRemove`, `NumberField.Increment`/`Decrement`,
> `Tabs.Tab`, `Toast.Close`) entregam `<button>` — por padrao do motor, ou via `Button`/
> `IconButton`, que renderizam `<button>`. Nenhuma reprova.
>
> **E a medicao de runtime confirmou o UM.** Com um coletor de `console.error` pendurado no setup
> e a suite inteira rodando: **2 ocorrencias, as duas do `SegmentedControl`** — uma pelo
> `stable.test.tsx`, outra pelo `agents.tsx`, que o compoe. Zero de qualquer outra origem. Depois
> da correcao, **zero em 438 testes**.
>
> **Por que nenhum gate via, e a resposta e' estrutural, nao descuido.** A validacao do motor mora
> dentro de um `React.useEffect`, e `renderToStaticMarkup` **nao executa efeito**. O catalogo e'
> HTML estatico sem hidratacao, entao a assercao de console limpo do `catalog-sweep` nunca teve o
> que ver.
>
> **E o `apps/proof-client`, que e' cliente de verdade, tambem nao pegava — por DOIS motivos, e a
> primeira versao deste registro so tinha visto o segundo.** Um: ele JA cobra console limpo
> (`expect(erros).toEqual([])`, `proof-client.spec.ts:32`), mas o que ele monta sao quatro
> elementos de fumaca — `Button`, `details`, um `card` — e nunca um `SegmentedControl`. Dois, e
> este e' o mais fundo: o `vite build` compila em **producao**, e a validacao do motor esta dentro
> de `process.env.NODE_ENV !== 'production'`. Ela nao e' silenciada ali; ela nao existe no pacote.
> Prova de cliente que so roda o bundle de producao **nunca** vai ver aviso de dev — e e' por isso
> que a trava tinha de ficar no jsdom, que roda em dev. Medido:
>
> ```bash
> grep -c "acts as a button expected" apps/proof-client/out/assets/*.js   # 0 — a mensagem nao esta la
> grep -c "nativeButton"              apps/proof-client/out/assets/*.js   # 1 — a prop esta
> ```
>
> **A trava e' o setup, nao um teste novo — e isso e' o ponto.** `tests/unit/setup.ts` troca o
> `console.error` e reprova no `afterEach`. Como o `@testing-library/react` monta no CLIENTE,
> cada um dos 438 testes virou detector de graca. Um palco escrito a mao teria coberto o
> `SegmentedControl` e mais nada — que e' exatamente como este defeito atravessou a Parte C, onde
> a linha do `render={<button/>}` foi escrita e medida.
>
> **O delta de DOM foi medido antes e depois, e ele e' menor do que a mensagem promete.** O aviso
> ameaca "atributos extras como `role` ou `aria-disabled`", e **nenhum apareceu**: o
> `rootProps.role = "radio"` do `RadioRoot` ja vencia o `role="button"` na fusao. A unica
> diferenca real e' o `<input type="radio">` escondido **perder o `id`**, que migra para o botao
> — e migra para o lado certo, porque o botao e' o radio de verdade e o input e' `aria-hidden`
> com `tabindex="-1"`. Comportamento identico nos dois lados: `Enter` nao seleciona, `Espaco`
> seleciona, a seta move E seleciona, o clique funciona. O mesmo delta aparece nas 7 paginas do
> catalogo regeradas — ordem de atributo e o `id` a menos, zero pixel.
>
> **O que mudou de verdade, entao, foi o caminho:** com `nativeButton = false` o motor
> `preventDefault`ava `Enter`/`Espaco` e chamava o `onClick` por conta propria; agora deixa a
> ativacao nativa do `<button>` acontecer. Mesmo resultado observavel, uma camada a menos.
>
> **A falha de infraestrutura, porque ela quase virou diagnostico errado.** A primeira execucao
> completa do Playwright reprovou **81** capturas — paginas com o dobro da altura e 16px a menos
> de largura, ou seja, sem CSS. Os 6 primeiros testes passaram e do 7 em diante tudo caiu: o
> `python -m http.server` da config, que e' de uma thread so, morreu no meio. Rodando o
> `matrix.spec` sozinho: **6/6**. Com o servidor de pe antes: **95/95**. O comentario da
> `playwright.config.ts` ja descrevia essa classe de flake — foi ele que apontou a causa. Anotar
> "81 capturas reprovaram" como resultado da mudanca teria sido contar, nao medir.
> **10/08/2026 — PARTE I, item I4 (`AnalyticsWorkbench`) FECHADO. A Parte I vai a 4 de 8.**
>
> ```
> Tarefa: PLANO-1.0 Parte I, item I4 — a composicao AnalyticsWorkbench.
> Arquivos analisados: packages/contracts/aurea.contract.json (applicationPatterns.patterns.
>   AnalyticsWorkbench — 8 regions, 8 actions, 7 states, transitions, behavior, accessibility) ·
>   apps/catalog/content/blocks/{app,insight}.mjs · scripts/build-catalog.mjs (o bloco
>   PRERENDER, componentPage, blockPage, a ordem de carga) · packages/core/src/aurea.css
>   (.chart, .table, .datagrid) · packages/react/src/{chart,navigation,inputs}.tsx ·
>   packages/contracts/registry/{Chart,Tabs,DataGrid}.json · apps/catalog/content/_starters.mjs
>   (o idioma do prerender e do Chart) · scripts/validate.py (check 29) · decisions/0002 e 0018
> Arquivos alterados: packages/core/src/aurea.css · scripts/build-catalog.mjs ·
>   apps/catalog/content/blocks/insight.mjs · tests/unit/composition.test.tsx · REFERENCES.md ·
>   PLANO-1.0.md · STATE.md · README.md · manifest.json · as 202 paginas do catalogo (geradas) ·
>   2 baselines -win32 · este arquivo
> O que mudou: nasceu o bloco `Analytics workbench` — OITO regioes, o dobro do I2. E DUAS
>   mudancas de infraestrutura, autorizadas pelo Victor: (1) `--chart-h` no core, com default
>   220px INALTERADO; (2) `prerender` passou a valer para BLOCO no gerador.
> Decisoes tomadas: nenhuma ADR nova. As duas mudancas de infra sao aplicacao de idioma que ja
>   existe — `--qr-size` (B6) e `--datagrid-max-h` (F6) para a primeira, o bloco PRERENDER do
>   Lote 3 para a segunda. O que e' decisao e esta escrito no codigo: abas RECUSADAS por
>   medicao, e `DataGrid` no lugar de `Table` porque 2 de 7 linhas e' resumo.
> Testes executados: pnpm test 464/464 (eram 438; +26 da composicao) · pnpm exec playwright
>   test --project=chromium --project=webkit 95 passed, 1 skipped, 0 failed · validate.py OK
>   (30 checks) · check-pack OK (react:51) · build limpo (202 paginas, 11 blocos) · o bloco
>   conferido nos DOIS temas por andaime de Playwright, sem erro de console, com altura E
>   largura medidas contra o vao do painel
> Falhas: UMA de gate e conteudo deliberado — o crachao `nav-count` de Blocks foi de 10 para 11
>   (28 e 24 pixels), medido no fragmento `.topbar` contra o HEAD antes de regravar. Duas
>   baselines -win32; nenhuma -linux tocada.
>   E UMA de construcao, que e' a terceira do mesmo tipo — o guarda do prerender, abaixo.
> Limitacoes: o Browser pane continua sem compor quadros nesta maquina. O Firefox segue sem
>   iniciar (ADR-0019). As baselines -linux estao agora TRES geracoes atrasadas (I2, I3, I4) —
>   o Victor informou em 11/08 que so consegue rodar o conteiner quando chegar em casa.
> Pendencias: I5 a I8 (4 itens) e K (K1 pela metade, K2, K3, K4). As 2 baselines -linux do topo.
>   Mais a tarefa registrada do `nativeButton`, abaixo.
> Riscos: o bloco LE o `aurea.contract.json`. O que NAO tem gate: (a) altura e largura de
>   composicao contra o vao do painel — os dois nomes ja declarados no registro do I3, e o I4
>   pagou os dois de novo; (b) o vocabulario de chave de BLOCO nao e' validado como o de
>   starter e' (`CHAVES_STARTER`), entao uma chave que o gerador nao le passa calada — foi
>   assim que 13 paginas sairam vazias no H.e, e agora blocos leem `prerender` tambem.
> Proxima tarefa exata: **I5 `TransactionFlow`** — valor, moeda, reconciliacao, estorno e
>   recibo. Comecar pelo passo 1 do BUILDING.md. Aviso que vale: o I5 nao tem grafico, entao
>   nao depende do prerender; o que ele tem e' DINHEIRO, e o `BUILDING.md` passo 4 manda
>   pesquisar antes de inventar formato, arredondamento ou moeda.
> Criterio de continuidade: arvore limpa e os cinco verdes acima.
> ```
>
> **O item NAO CABIA, e isso foi medido antes do primeiro edit.** Três peças incompressíveis —
> `.chart` fixo em 220px, uma `Table` mínima em 117 e a linha de indicadores em 112 — somam
> **449** num vão de **354**, e sobravam cinco regiões. Foi o que motivou as duas mudanças de
> infraestrutura, e as duas são de raiz:
>
> 1. **`--chart-h` no core**, default `220px` **inalterado**. Mesmo idioma do `--qr-size` e do
>    `--datagrid-max-h`: quem sabe quanta tela tem é quem hospeda, e altura não vira prop
>    numérica (check 23). O fallback é o que o **check 29** exige de quem não declara o token.
> 2. **`prerender` para BLOCO no gerador.** Ele era indexado por nome de componente e só
>    alcançava `componentPage`. O `blocks` passou a ser carregado **antes** do bloco PRERENDER e
>    a chave é o `slug`. **O I8 `VisualBuilder` compõe o `DependencyGraph`, que tem o mesmo
>    problema** — fazer uma vez agora era o caminho barato, não o caminho generoso.
>
> **Sete das oito ações não têm transição, e desta vez NÃO é buraco de contrato.** Mudar o
> período não muda o estado da tela: **refaz a consulta**. É a natureza do padrão, e é por isso
> que este é o único dos quatro contratos **sem região `actions`** — as regiões *são* os
> controles. Vale registrar porque as três composições anteriores treinaram o olho a ver órfão
> como defeito, e aqui a leitura certa é a oposta.
>
> ### O guarda do prerender mentiu pela TERCEIRA vez, e o padrão agora está claro
>
> `prerender: true` prova `<svg`. O botão de exportar tem `leadingIcon`, o ícone É um `<svg>`, e
> o guarda deu o desenho por pronto **antes de o motor montar**. Medido: `graficoDesenhou:
> false` com o **gate verde**. A prova virou `recharts-area`.
>
> | Quando | O que enganou o guarda |
> |---|---|
> | Lote 3 (01/08) | o preview do `Chart` passava no check 17 sendo caixa vazia |
> | H14 (09/08) | o `<svg>` de fundo pontilhado do React Flow |
> | **I4 (10/08)** | **o `<svg>` do ícone de um botão vizinho** |
>
> **"Gate de nome não é gate de efeito", três vezes.** E a lição específica desta terceira: a
> prova genérica fica MENOS confiável conforme a peça cresce, porque uma composição tem mais
> vizinhos. Prova de composição precisa ser específica do desenho, sempre.
>
> ### Duas medições de FERRAMENTA que valem para o próximo
>
> **O Base UI não renderiza o painel inativo de `Tabs` no HTML estático.** Medido com
> `renderToStaticMarkup`: o conteúdo do painel selecionado aparece, o do outro **não existe**.
> Resolver "gráfico ou tabela" com abas publicaria uma alternativa que não está lá — e a
> cláusula é justamente *"visualization always has a tabular alternative"*.
>
> **E `Table` virou `DataGrid` pela mesma cláusula.** Com `Table`, o que cabia no vão eram **2
> das 7 linhas**, ou seja um resumo: quem não enxerga a curva ficaria com menos dado. O
> `DataGrid` põe as sete no DOM e limita a caixa com `--datagrid-max-h` — a válvula do F6, com o
> cabeçalho fixo do mesmo item. `9rem` porque a célula mede `--row-h` (48px): cabeçalho mais
> **duas linhas inteiras**. Com `7.5rem` a segunda saía cortada ao meio, e meia linha lê como
> defeito, não como "há mais abaixo". **Quem viu isso foi a imagem, não a medida.**
>
> ### Um achado FORA DO ESCOPO, registrado como tarefa própria
>
> O Base UI avisa *"expected a non-`<button>` because the `nativeButton` prop is false"*. Medido:
> `renderToStaticMarkup` **não** emite; só o caminho de cliente emite — então ele atinge **quem
> instala**, e não o catálogo, que é HTML estático sem hidratação. Por isso nenhum gate daqui o
> vê: o `catalog-sweep` olha o catálogo.
>
> Eu registrei o alcance como **17 pontos** e **estava errado: é UM**. A tarefa foi executada em
> 11/08/2026 e fechou em `52395b8` — uma palavra em `inputs.tsx`, mais a trava em
> `tests/unit/setup.ts`. **Fica como tarefa, não como acréscimo silencioso** continua sendo a
> decisão certa; o número é que não era.
>
> ### A correção do meu número, e ela é lição de MÉTODO (11/08/2026)
>
> **Eu contei ocorrência de SINTAXE no nosso fonte. O que define o defeito mora no MOTOR.** Nem
> todo `render={<button/>}` avisa: avisa quem passa um `<button>` para uma parte do Base UI cujo
> default é `nativeButton = false`. Essa lista não está no nosso código.
>
> A medição certa veio por três ângulos independentes, e é o modelo para a próxima:
>
> | Ângulo | Resultado |
> |---|---|
> | partes do motor com `nativeButton = false` | **9** |
> | dessas, usadas pela Aurea | **3** (`Combobox.Item`, `Menu.Item`, `Radio.Root`) |
> | dessas, com `render` de `<button>` | **1** — `Radio.Root`, no `SegmentedControl` |
> | sentido contrário: partes com default `true` que usamos | **11**, e nenhuma reprova |
> | runtime: coletor de `console.error` na suíte | **2** ocorrências, as duas do mesmo componente |
> | depois da correção | **zero em 438 testes** |
>
> **E o `grep` não só era o instrumento errado — eu não conferi a saída dele contra o próprio
> padrão.** Ela trazia `render={<Button`, `render={<IconButton` e `render={<strong/>}`, que
> `render={<button` não casa. O número saiu de um `-c` que eu li sem olhar as linhas.
>
> É a primeira regra do `CLAUDE.md` me pegando em cheio: **medir, não contar**. E ela tem uma
> segunda metade que este erro escreve com sangue — *"toda afirmação de estado tem comando
> reprodutível atrás"* só vale se alguém **ler o que o comando devolveu**. Um comando que ninguém
> confere é uma contagem com aparência de medição, que é pior que um palpite declarado.
>
> **A trava que a tarefa deixou é o que eu não teria feito**, e vale registrar por isso: em vez
> de um teste próprio para o `SegmentedControl`, ela pôs o coletor no `setup.ts` compartilhado —
> os **438** testes viraram detector de graça. Palco escrito à mão cobre o caso que a pessoa
> lembrou; o setup cobre o que ela não lembrou.

> **10/08/2026 — PARTE I, item I3 (`ResourceWorkbench`) FECHADO. A Parte I vai a 3 de 8.**
>
> ```
> Tarefa: PLANO-1.0 Parte I, item I3 — a composicao ResourceWorkbench.
> Arquivos analisados: packages/contracts/aurea.contract.json (operationalPatterns.patterns.
>   ResourceWorkbench — regions, actions, states, transitions, behavior, accessibility) ·
>   apps/catalog/content/blocks/{app,insight}.mjs (os 10 blocos, para medir se ja existia) ·
>   packages/react/src/navigation.tsx (TreeView) · packages/contracts/registry/FileInput.json
>   (a fila da Parte G) · packages/core/src/aurea.css (.table, .tree-label) · decisions/0002 ·
>   Referencia/kibo-main/packages/tree/index.tsx + packages/comparison/index.tsx ·
>   Referencia/react-main/components/application/file-upload/file-upload-base.tsx
> Arquivos alterados: apps/catalog/content/blocks/insight.mjs · tests/unit/composition.test.tsx ·
>   REFERENCES.md · PLANO-1.0.md · STATE.md · README.md · manifest.json · as 201 paginas do
>   catalogo (geradas) · 2 baselines -win32 · este arquivo
> O que mudou: nasceu o bloco `Resource workbench` — as seis regioes do contrato com o que ja
>   existia, zero componente novo e zero CSS novo. Metade da parte ja estava construida: a fila
>   com progresso, soma de verificacao e conflito e' a Parte G inteira.
> Decisoes tomadas: nenhuma ADR. As decisoes de desenho saem do CONTRATO e da MEDIDA, e estao
>   escritas no codigo: `source` e `collection` nao viram role=group porque ja sao marco
>   nomeado; o numero do progresso sai de um lugar so; a largura do bloco e' 880 porque
>   `.table` exige 720.
> Testes executados: pnpm test 438/438 (eram 403; +35 da composicao) · pnpm exec playwright
>   test --project=chromium --project=webkit 95 passed, 1 skipped, 0 failed · validate.py OK
>   (30 checks) · check-pack OK (react:51) · build limpo (201 paginas, 10 blocos) · o bloco
>   conferido nos DOIS temas por andaime de Playwright, sem erro de console, com a altura E a
>   largura medidas contra o vao do painel
> Falhas: UMA de gate, e ela era conteudo deliberado — o crachao `nav-count` de Blocks foi de 9
>   para 10 e GANHOU UM DIGITO, entao empurrou os itens seguintes: 1084 pixels, contra os 20 do
>   I2. Medido no fragmento `.topbar` contra o HEAD antes de regravar. Duas baselines -win32;
>   nenhuma -linux tocada.
>   E DUAS de construcao, as duas achadas por OLHAR a imagem e nenhuma por gate — detalhe abaixo.
> Limitacoes: o Browser pane continua sem compor quadros nesta maquina. O Firefox segue sem
>   iniciar (ADR-0019), entao a suite roda em dois motores.
> Pendencias: I4 a I8 (5 itens) e K (K1 pela metade, K2, K3, K4). As 2 baselines -linux do topo,
>   que agora sao duas geracoes atrasadas (I2 e I3) e saem juntas no conteiner.
> Riscos: o bloco LE o `aurea.contract.json`, entao mudanca na tabela de transicoes muda o
>   preview e o teste acompanha. O que NAO tem gate, e agora ja custou duas vezes no mesmo dia:
>   LARGURA de componente dentro de composicao. `.table` exige 720px e nada avisa quem monta
>   uma coluna menor — o `catalog-sweep` cobra rolagem da PAGINA, e o que transborda aqui e'
>   uma coluna dentro do painel. Fica declarado ao lado da altura, que e' o irmao dele.
> Proxima tarefa exata: **I4 `AnalyticsWorkbench`** — filtro temporal, indicadores, grafico e
>   **a tabela equivalente**, que o enunciado diz nao ser opcional. Comecar pelo passo 1, e
>   nele pela largura: o `Chart` e a `Table` na mesma composicao, e a `.table` exige 720px dos
>   856 do painel. Referencia: `langfuse-main/web/src/features/dashboard`.
> Criterio de continuidade: arvore limpa e os cinco verdes acima.
> ```
>
> **O passo 1 respondeu "não existe" de novo, e respondeu uma segunda coisa que mudou o TAMANHO
> do item:** metade da parte já estava construída. O enunciado pede "fila, verificação, conflito
> e restauração", e a fila com progresso por item, soma SHA-256 conferida e conflito com três
> saídas é a **Parte G**, fechada em 09/08. O I3 não reconstruiu nada disso — compôs.
>
> **O `restore` é o TERCEIRO órfão do contrato, e agora dá para chamar de padrão em vez de
> acidente.** Está em `actions` sem transição nenhuma, como o `fork` do I1. Ele existe por dois
> outros caminhos — o comportamento *"restore keeps provenance"* e o evento `resource.restored` —,
> e por isso o que o teste cobra dele é a **procedência sobreviver aos oito estados**, não um
> botão que a tabela não autoriza.
>
> ### As duas falhas de construção, e as duas foram achadas por OLHAR
>
> **1. A coluna `State` saía fora da tela.** O core declara `.table { min-width:720px }`. A
> primeira versão punha árvore e tabela em duas colunas dentro dos 680px que os outros blocos
> usam, e a coluna da tabela ficava com **445px** — a tabela ia a 720, começava depois da árvore
> e terminava em 1180 num painel de 904. A coluna onde o `Status` de cada recurso mora ficava
> **cortada**. Gate nenhum viu: o `catalog-sweep` cobra rolagem lateral da PÁGINA, e aqui quem
> transbordava era uma coluna dentro do painel.
>
> A saída é aritmética, e está escrita no código: painel 904 − 48 de `padding` = **856**; a tabela
> exige **720**; sobram **124** para a árvore. Bloco a `min(880px,100%)` e coluna da árvore em
> `7rem` → 856 − 112 − 12 = **732**, o primeiro valor acima de 720. Com 140px a tabela ainda
> vazava 16px da própria coluna — invisível nesta largura, e é o tipo de coisa que quebra na
> próxima.
>
> **2. E a MINHA medição errou, pelo mesmo tipo de engano que já mora nesta auditoria.** Escrevi
> uma medida que dizia se o rótulo da árvore cabia, e ela respondeu **"inteiro" para os três**.
> Estava olhando o primeiro `<span>` do nó — que é o do **glifo** — e não o `.tree-label`. Quem
> desmentiu foi a **imagem do tema claro**, onde `Typography` saía `Typo…`.
>
> Remedida no elemento certo: `.tree-label` corta com reticências (mesmo desenho do
> `.sidebar-label`) e num nó filho sobram **48px**; `Typography` pede **73**. Alargar a coluna não
> era saída — os 137px que o rótulo inteiro pediria deixariam a tabela **13px curta**. Virou
> `Type`. **Quem cede é o conteúdo**, que é a mesma ordem que a ADR-0002 dá para a altura.
>
> **A lição é uma frase: medida escrita às pressas mente com a mesma confiança de uma medida
> certa.** As duas vezes em que este dia errou — o vão do I1 e o rótulo do I3 — a medição
> **passou verde** e a imagem reprovou. Olhar não é etapa opcional depois de medir.
>
> ### O que fica sem gate, e agora tem dois nomes
>
> **Altura** de composição contra o vão do painel, e **largura** de componente dentro de coluna.
> Nenhum dos dois é cobrado por nada: o `geometry.spec` cobra que todo demo da mesma página meça
> igual, e o `catalog-sweep` cobra rolagem da página. Os dois defeitos deste dia passaram por
> baixo dos dois. Fica declarado, não consertado — gatear exigiria uma medida por bloco, que é a
> alternativa B que a própria [ADR-0002](../../decisions/0002-altura-fixa-do-demo.md) recusou.

> **10/08/2026 — PARTE I, item I2 (`ReviewCompare`) FECHADO. A Parte I vai a 2 de 8.**
>
> ```
> Tarefa: PLANO-1.0 Parte I, item I2 — a composicao ReviewCompare.
> Arquivos analisados: packages/contracts/aurea.contract.json (operationalPatterns.patterns.
>   ReviewCompare — regions, actions, states, transitions, behavior, accessibility, coverage) ·
>   apps/catalog/content/blocks/{app,insight}.mjs (os 8 blocos, para medir se ja existia) ·
>   scripts/build-catalog.mjs (descoberta de blocos, usesChips) · scripts/validate.py (checks
>   12 e 25, para saber o alcance deles em conteudo de catalogo) · packages/react/src/
>   {code,feedback,agents}.tsx (CodeBlock, Alert/Status, HumanApproval) · decisions/0002 ·
>   Referencia/langfuse-main/web/src/components/DiffViewer.tsx + features/prompts/components/
>   PromptVersionDiffDialog.tsx · Referencia/kibo-main/apps/docs/examples/code-block-diff.tsx
> Arquivos alterados: apps/catalog/content/blocks/insight.mjs · tests/unit/composition.test.tsx ·
>   REFERENCES.md · PLANO-1.0.md · STATE.md · README.md · manifest.json · as 200 paginas do
>   catalogo (geradas) · 2 baselines -win32 · este arquivo
> O que mudou: (1) o bloco `Review compare` NASCEU — as cinco regioes do contrato com o que ja
>   existia, zero componente novo e zero CSS novo. (2) O I1 foi CORRIGIDO: o bloco dele rolava
>   dentro do painel de previa, e o registro de 09/08 comparava contra a regua errada.
> Decisoes tomadas: nenhuma ADR. As tres decisoes de desenho saem do CONTRATO e estao escritas
>   no codigo: `decision` acumula toda acao de pessoa (nao ha regiao `actions`); o recibo nasce
>   do `apply` e nao do aceite; `test_result` vem antes de `decision` no DOM, por teclado.
> Testes executados: pnpm test 403/403 (eram 366; +37 da composicao) · pnpm exec playwright test
>   --project=chromium --project=webkit 95 passed, 1 skipped, 0 failed · validate.py OK
>   (30 checks) · check-pack OK (react:51) · build limpo (200 paginas, 9 blocos) · os dois
>   blocos conferidos nos DOIS temas por andaime de Playwright, sem erro de console, com a
>   altura MEDIDA contra o vao do painel
> Falhas: UMA, e ela era conteudo deliberado. O `catalogo-topo` reprovou nos dois temas, 20
>   pixels. MEDIDO antes de regravar, comparando o fragmento `.topbar` contra o do HEAD: o
>   crachao `nav-count` de Blocks foi de 8 para 9. Duas baselines -win32 regravadas; as -linux
>   entram na fila do conteiner. Nenhum -linux tocado.
> Limitacoes: o Browser pane continua sem compor quadros nesta maquina; a conferencia saiu por
>   andaime de Playwright rodado como `node --input-type=module -e`, sem arquivo em disco. O
>   Firefox segue sem iniciar (ADR-0019), entao a suite roda em dois motores.
> Pendencias: I3 a I8 (6 itens) e K (K1 pela metade, K2, K3, K4). As 2 baselines -linux do topo.
> Riscos: o bloco LE o `aurea.contract.json`, entao mudanca na tabela de transicoes muda o
>   preview e o teste acompanha — que e o desejado. O que NAO tem gate: `resolve` esta em
>   `actions` sem transicao nenhuma e por isso nao aparece em estado algum (mesmo buraco que o
>   `fork` do I1); e a altura da composicao contra o vao do painel nao tem trava — foi medida a
>   mao duas vezes hoje, e e' assim que o I1 passou 24h rolando sem ninguem ver.
> Proxima tarefa exata: **I3 `ResourceWorkbench`** — arvore, lista/grade, previa, fila,
>   verificacao, procedencia, conflito e restauracao. Comecar pelo passo 1 do BUILDING.md, e
>   nele pela pergunta que pagou duas vezes seguidas: o bloco ja existe em
>   `content/blocks/*.mjs`? (no I1 existia, no I2 nao). Referencia: `kibo-main` (`tree`,
>   `table`) e `react-main/components/application/file-upload`; a fila e a verificacao ja
>   existem como Parte G.
> Criterio de continuidade: arvore limpa e os cinco verdes acima.
> ```
>
> **A medição do passo 1 mudou o item antes do primeiro edit pela terceira parte seguida.** Aqui
> ela respondeu **"não existe"** — os oito blocos eram Auth, Forms, Collections, Feedback,
> Metrics, Marketing, Communication e Operations, e nenhum comparava nada. Diferente do I1, não
> havia desenho antigo para reescrever no lugar.
>
> **A diferença entre I1 e I2 é ESTRUTURAL e sai do contrato: o `ReviewCompare` não tem região
> `actions`.** O `RunSession` tem, e foi por isso que o I1 tirou `approve`/`reject` da barra —
> quem os oferecia era o `HumanApproval`. Aqui `decision` é a única casa de ação de pessoa, então
> a derivação não exclui nada, e o `HumanApproval` **não entra**: ele oferece aprovar E negar no
> mesmo portão, e a tabela diz que os dois nunca coexistem (`reject` parte de `previewing`,
> `approve` parte de `testing`). Usá-lo publicaria uma saída que o contrato não permite.
>
> **O recibo aqui é o INVERSO do recibo do I1, e também é o contrato falando.** Na execução ele
> existe desde o aceite (*"interrupt does not erase receipt"*); na revisão ele nasce do `apply`
> (*"apply records receipt"*), porque antes disso não houve mutação — e recibo de coisa que não
> aconteceu é pior que recibo ausente, porque parece prova.
>
> **O achado da leitura das referências é sobre ELAS, e é o mais forte da sessão.** O `DiffViewer`
> do Langfuse pinta a linha inteira e não escreve nada; o exemplo do Kibo marca com um comentário
> `[!code ++]` que o Shiki **consome** e vira cor. **As duas reprovam a cláusula que o nosso
> contrato exige** — *"diff has textual additions and deletions"* —, e quem não distingue as cores
> não distingue o que entrou do que saiu (WCAG 1.4.1). A saída custou zero: o `+`/`-` da primeira
> coluna do diff unificado é texto por construção. Registro em `REFERENCES.md`.
>
> **O teste foi provado contra SEIS defeitos**, e o segundo é o que importa desta parte:
>
> | Defeito reintroduzido | Resultado |
> |---|---|
> | lista de ações à mão, discordando do contrato em `applied` | **reprova** |
> | diff sem os marcadores `+`/`-` (só a cor distinguiria) | **reprova**, nomeando a causa |
> | `rollback` apagando o recibo | **reprova** (2 testes) |
> | recibo aparecendo em `previewing`, antes de qualquer mutação | **reprova** |
> | resultado de teste num `<div>` com a pele do `Alert`, sem papel que anuncie | **reprova** em 3 |
> | região `comparison` removida | **reprova** |
>
> ### O defeito do I1, e ele é sobre MEDIR CONTRA A COISA CERTA
>
> **A régua da conferência de ontem estava errada, e por isso o bloco do I1 saiu rolando.** O
> registro de 09/08 diz *"447px num vão de 457"*. O **447 está certo**. O **457 não é o vão**: é a
> caixa do demo inteira, e ela gasta **53px** com as abas *Preview/Code* antes de o painel
> começar, mais **48px** de `padding` do painel. O vão real, medido a 1440×761 (onde o `clamp` da
> [ADR-0002](../../decisions/0002-altura-fixa-do-demo.md) bate no piso), é **354**.
>
> | | caixa | painel | vão útil | composição | rola? |
> |---|---:|---:|---:|---:|---|
> | I1, como estava | 457 | 402 | 354 | **447** | **sim** |
> | I1, corrigido | 457 | 402 | 354 | **347** | não |
> | I2 | 457 | 402 | 354 | **326** | não |
>
> A ADR-0002 lista *"nenhuma demo exige rolagem"* como consequência **boa** da altura fixa, e a
> frase original do Victor é *"nada de rolar pra ver o exemplo, nem no monitor de 14 polegadas"*.
> Então não era gosto: era a decisão sendo desfeita sem ninguém ver.
>
> **A pergunta obrigatória — quem MAIS tem esse problema? — foi medida nos nove blocos**, e a
> resposta é: só os dois das composições. `stats-row` e `members-table` dão 402 em 402.
>
> **Os cortes do I1 foram dois, e o terceiro foi RECUSADO pela imagem.** Um turno em vez de dois
> (o do humano repetia o que o cabeçalho já diz; o do agente é a única frase que não está em
> nenhum outro lugar) e o vão de `--space-3` para `--space-2`. O terceiro seria cortar um passo
> da ferramenta — economizava 25px e fazia `write_file` aparecer **duas vezes**, como título e
> como passo único. **Isso só apareceu porque a imagem foi OLHADA depois de medida**, e é a mesma
> lição que a Parte J deixou escrita.
>
> **E a lição de método é sobre o que não tem gate.** Altura de composição contra o vão do painel
> **não é gateada por nada** — o `geometry.spec` cobra que todo demo da mesma página meça igual,
> que é outra coisa. Foi assim que o I1 passou um dia inteiro rolando com a CI verde. Fica
> declarado como limite, não como conserto: gatear isso exigiria uma medida por bloco, e nove
> blocos com altura ad-hoc é a alternativa B que a própria ADR-0002 recusou.

> **10/08/2026 — PARTE I, item I1 (`RunSession`) FECHADO. A Parte I abre com 1 de 8.**
>
> ```
> Tarefa: PLANO-1.0 Parte I, item I1 — a composição RunSession.
> Arquivos analisados: packages/contracts/aurea.contract.json (operationalPatterns.patterns.
>   RunSession — regions, actions, states, transitions, behavior, accessibility; e
>   applicationPatterns.patterns, que NAO tem RunSession) · apps/catalog/content/blocks/
>   {app,insight}.mjs · apps/catalog/content/_recipes.mjs (a receita agent_ai, para nao
>   duplicar) · scripts/build-catalog.mjs (blocos, demoBlock, usesChips) · packages/react/src/
>   {agents,feedback,communication,actions,data-display,code}.tsx · pure.tsx (universalStates)
> Arquivos alterados: apps/catalog/content/blocks/insight.mjs · tests/unit/composition.test.tsx
>   (NOVO) · tests/unit/stable.test.tsx · packages/react/src/code.tsx · packages/core/src/
>   aurea.css · tests/visual/shell-nav.spec.ts · decisions/0019-*.md + decisions/README.md ·
>   PLANO-1.0.md · STATE.md · manifest.json · este arquivo
> O que mudou: o bloco `Run session panel` deixou de ser um DESENHO de execucao e passou a ser
>   a composicao do contrato: as seis regioes, e as acoes DERIVADAS da tabela de transicoes.
>   Zero componente novo, zero CSS novo, zero string nova.
> Decisoes tomadas: ADR-0019 ganhou a **Decisao 3** — a gaveta do AppShell continua NAO-MODAL
>   (decisao do Victor, 10/08). A lacuna aberta em 09/08 deixa de ser pendencia e vira limite
>   declarado, escrito no shell-nav.spec ao lado da assercao que deliberadamente nao existe.
> Testes executados: pnpm test 366/366 (eram 332; +33 da composicao, +1 do CodeBlock) ·
>   pnpm exec playwright test --project=chromium --project=webkit 95 passed, 1 skipped,
>   0 failed, ZERO pixel · validate.py OK (30 checks) · check-pack OK (react:51) ·
>   pnpm audit limpo · pnpm build limpo (199 paginas) · a pagina do bloco conferida nos DOIS
>   temas por andaime de Playwright, sem erro de console, e a altura MEDIDA contra a caixa
>   do demo (447 num vao de 457 — ver abaixo)
> Falhas: DUAS, as duas achadas por gate.
>   (1) O `catalog-sweep` reprovou nos DOIS temas: `scrollable-region-focusable` no <pre> da
>       secao Installation. NAO era do preview — era do `CodeBlock`, que e' `overflow:auto` no
>       core e nunca teve tabIndex. Estava aberto desde sempre e so nao aparecia porque nenhuma
>       linha era comprida o bastante; a linha de import do bloco novo (sete componentes) fez
>       transbordar. Corrigido na RAIZ, no componente, e nao encurtando a minha lista.
>   (2) Backtick dentro do template literal do campo `code` matou o parse do modulo inteiro.
>       Barato, mas vale o registro: o `code` e' string, e comentario com crase a fecha.
> Limitacoes: o Browser pane continua sem compor quadros nesta maquina. A conferencia visual
>   saiu por andaime de Playwright, e desta vez o andaime foi escrito NO SCRATCHPAD, fora do
>   repositorio — em 09/08 um andaime desses entrou num commit.
> Pendencias: I2 a I8 (7 itens) e K (K1 pela metade, K2, K3, K4).
> Riscos: o bloco agora LE o `aurea.contract.json`. Se alguem mudar a tabela de transicoes, o
>   preview muda junto e o teste da composicao acompanha — que e' o desejado. O que NAO tem
>   gate: `fork` e `reject` estao em `actions` sem transicao nenhuma, e por isso o `fork` nao
>   aparece em estado algum. E' buraco do CONTRATO, esta escrito no bloco e no PLANO-1.0 §12.
> Proxima tarefa exata: **I2 `ReviewCompare`** — diferenca antes, aprovacao, reversao e recibo
>   depois. Comecar pelo passo 1 do BUILDING.md, que neste item ja pagou: MEDIR se o bloco ja
>   existe em `content/blocks/*.mjs` antes de escrever um. O I1 achou um `Run session panel`
>   escrito antes da Parte H, e reescreve-lo no lugar poupou uma pagina duplicada e um slug
>   novo. Referencia: `reui-main/components/blocks` para leitura de composicao.
> Criterio de continuidade: arvore limpa e os cinco verdes acima.
> ```
>
> **A medição do passo 1 mudou o item antes do primeiro edit, como em toda parte anterior.** O
> enunciado do I1 dizia "oito arquétipos existem no contrato como descrição e não como bloco
> montável". Metade estava vencida: **o bloco existia** — `Run session panel`, em
> `content/blocks/insight.mjs`, escrito antes da Parte H, com `Card` + `Status` + `Progress` +
> `CodeBlock` + `Alert`. Cinco componentes, nenhuma das seis regiões, nenhuma ação, nenhum
> recibo. Era exatamente o que o "Fecha quando" da parte recusa: **um desenho de como ela
> seria.** Foi reescrito NO LUGAR — um segundo bloco chamado "Run session" seria o padrão
> paralelo que este protocolo proíbe, e trocar o nome mudaria o slug da página por nada.
>
> **O item inteiro é sobre não escrever a máquina de estados duas vezes.** A lista de ações sai
> do `aurea.contract.json`: as transições que partem do estado atual e cuja ação é de pessoa.
> Escrever "no estado X mostre Y" ao lado dos botões seria o achado I1 desta auditoria
> acontecendo dentro da peça que o contrato existe para descrever.
>
> **O teste da composição foi provado contra QUATRO defeitos**, porque teste que só concorda com
> o presente não é gate:
>
> | Defeito reintroduzido | Resultado |
> |---|---|
> | lista de ações à mão, discordando do contrato em um estado | **reprova** |
> | recibo apagado ao interromper | **reprova** (2 testes) |
> | estado falando só por cor, sem texto | **reprova** em 6 dos 9 |
> | região de retomada removida | **reprova** |
>
> **A terceira linha é a que vale ler:** reprova em **seis** dos nove estados, e os três que
> continuam verdes são os universais da Parte J — eles tiram o texto do vocabulário do
> `pure.tsx`, não do bloco. É a prova de que o reúso da Parte J é real e não citação.
>
> **E o gate achou um defeito que não era meu, que é o padrão desta casa.** A violação de axe
> apontava para o `<pre>` da seção Installation, não para o preview. `.code-block` é
> `overflow:auto` no core — região rolável — e o `<pre>` nunca foi focável: **código mais largo
> que a caixa era inalcançável por teclado em qualquer página do catálogo**. O painel de demo do
> catálogo já tinha corrigido esse mesmo defeito do lado dele em 30/07/2026; na biblioteca ele
> seguia aberto. Corrigido no componente, com o motivo escrito ao lado da regra do core para
> quem escreve a marcação à mão, e com teste que reprova a remoção do `tabIndex`.
>
> **A conferência visual mediu, e a medição mandou cortar.** A caixa do demo tem altura FIXA
> ([ADR-0002](../../decisions/0002-altura-fixa-do-demo.md)) e a composição nasceu com **588px
> num vão de 457** — a barra de ações, que é a região que o item existe para mostrar, ficava
> abaixo da dobra dentro do painel rolável. Três cortes medidos um a um: o `input` do
> `InvocationPanel` (o primeiro passo já nomeia o arquivo), a linha `Saved` do checkpoint
> (virou sufixo da que sobrou) e a linha `Started` do recibo; mais `--space-3` no lugar de
> `--space-4` entre as seis regiões. **447px.** A ADR-0002 diz que o conserto de demo não é
> mexer na altura — aqui foi o conteúdo que se ajustou, que é o caminho que ela indica.
>
> **O andaime de conferência não tocou o repositório.** Rodou como `node --input-type=module
> -e` a partir da raiz, sem arquivo nenhum: em 09/08 um andaime desses entrou num commit, e
> um script que nunca existe em disco não tem como entrar. Ele mede a caixa contra o vão,
> troca o `data-theme` com a mesma espera de 600 ms do `catalog.spec` e captura as duas.

> **09/08/2026 — PARTE K, item K1: METADE FEITA, e ele fica DESMARCADO.**
>
> ```
> Tarefa: PLANO-1.0 Parte K, item K1 — Firefox e WebKit na suite visual.
> Arquivos analisados: playwright.config.ts · tests/visual/*.spec.ts (os 9) ·
>   packages/react/src/layout.tsx (o AppShell e o popover da gaveta) ·
>   packages/core/src/aurea.js · scripts/build-catalog.mjs (o prerender) ·
>   scripts/validate.py (checks 11, 15 e 22) · o log de eventos do Windows
> Arquivos alterados: playwright.config.ts · packages/core/src/aurea.js ·
>   packages/react/src/layout.tsx · scripts/build-catalog.mjs · scripts/validate.py ·
>   tests/visual/{shell-nav,skin}.spec.ts · decisions/0019-*.md (NOVO) + decisions/README.md ·
>   PLANO-1.0.md · este arquivo
> O que mudou: a suite passou de 61 para 131 testes em tres motores. Os dois specs de PIXEL
>   ficam no Chromium; os sete de MEDICAO rodam nos tres. E a passagem pelo WebKit achou uma
>   BARREIRA DE TECLADO na biblioteca, aberta desde a Fase 8 — corrigida.
> Decisoes tomadas: ADR-0019 (duas: pixel num motor so; e a gaveta do AppShell passa a gerir o
>   proprio foco, o que custou a propriedade "sem uma linha de JS" que o shell exibia).
> Testes executados: pnpm test 332/332 · pnpm exec playwright test --project=chromium
>   --project=webkit 95 passed, 1 skipped, 0 failed · validate.py OK (30 checks) ·
>   check-pack OK (react:51) · pnpm audit limpo · pnpm build limpo
> Falhas: QUATRO, todas achadas por medicao e todas corrigidas ou registradas.
>   (1) O Firefox nao inicia nesta maquina: `spawn UNKNOWN`, e o log de eventos aponta a
>       assembly `mozglue` DO PROPRIO FIREFOX. Os 59 arquivos estao integros (327 MB), os
>       runtimes MSVC do sistema estao instalados e `install --force` nao resolveu. NAO e
>       defeito da Aurea, e nao ha correcao conhecida — os relatos sao de ambiente.
>   (2) A gaveta do AppShell confiava no popover nativo para o foco, e o `layout.tsx` AFIRMAVA
>       por escrito que "o navegador entrega a volta do foco". Entregava num motor so. No
>       WebKit o foco ia para o <body> ao abrir, OITO Tabs nao entravam na gaveta e o Escape
>       nao devolvia nada. Corrigido nos dois runtimes.
>   (3) O prerender do catalogo apostava `setTimeout(120)` para o motor de grafico desenhar
>       dentro do jsdom. Defeito ANTERIOR ao K1 e ele bloqueava o build: o `Chart` reprovava em
>       cinco execucoes seguidas, e com 1000 ms passava. Virou espera pela PROVA, com teto.
>   (4) Eu ENCURTEI a fatia do check 22 para matar um falso positivo no `Grid`, e a prova
>       contra o defeito me reprovou: a `Sidebar` com `states: []` deixou de ser acusada,
>       porque o `aria-current` dela mora num auxiliar nao exportado. Revertido; o auxiliar e
>       que mudou de lugar.
> Limitacoes: o Firefox nunca rodou um teste. Por isso o K1 fica DESMARCADO — item que nunca
>   rodou nao se marca. Ele sai no conteiner oficial do Playwright, no minipc, que e o mesmo
>   caminho das baselines `-linux` e e onde a CI roda.
> Pendencias: I (8 itens) e K (K1 pela metade, K2, K3, K4). Mais a LACUNA DE DESENHO abaixo.
> Riscos: o `focoDaGaveta` existe em DOIS arquivos (core e React) porque sao dois runtimes;
>   quem mexer num tem de mexer no outro, e esta escrito nos dois. E o auxiliar precisa ficar
>   ANTES do primeiro export do modulo — se alguem mover, o check 22 acusa o componente de
>   cima. Esta escrito no `layout.tsx` e no `validate.py`.
> Proxima tarefa exata: **a LACUNA de desenho abaixo precisa do Victor**; sem ela, seguir com
>   K3 (changelog, fecha sozinho aqui) ou a Parte I. O Firefox so no conteiner.
> Criterio de continuidade: arvore limpa e os cinco verdes acima, com o playwright rodado
>   como `--project=chromium --project=webkit` (o Firefox reprova nesta maquina por ambiente).
> ```
>
> **A LACUNA QUE PRECISA DO VICTOR, e ela é decisão de desenho, não conserto.** No WebKit o Tab
> escapa do popover a partir de **qualquer** elemento de dentro — medido com rastro de
> `focusin`/`focusout`: foco no `link[0]` da gaveta, um Tab, e o foco sai para um botão de fora.
> O motor não põe conteúdo de popover na navegação sequencial do documento. Fechar isso exige
> **prender o foco** enquanto a gaveta está aberta, ou seja, torná-la **modal** — e o
> `layout.tsx` declara não-modalidade de propósito, com a frase *"o foco não fica preso, e por
> isso não declaramos modalidade que não entregamos"*. Prender o foco numa gaveta de navegação
> móvel é o padrão convencional e resolveria; mudar a modalidade do shell não é coisa que eu
> faça sozinho. **O que está garantido hoje nos três motores:** abriu, o foco está dentro;
> fechou, o foco voltou ao disparador.
>
> **O teste NÃO cobra o que não é verdade nos três.** Escrever a asserção do Tab e pular no
> WebKit seria fingir cobertura; escrevê-la sem cumprir seria gate vermelho permanente. A
> ausência está escrita no `shell-nav.spec`, com o motivo.
>
> **Uma corrida foi corrigida no mesmo teste, e ela quase passou despercebida por SORTE:** ler
> `document.activeElement` logo depois do clique é corrida, porque o `toggle` do popover é
> assíncrono. Na primeira execução o Chromium reprovou e o **WebKit passou** — o mesmo defeito,
> dois resultados. Virou `expect.poll`, e as três execuções seguintes deram 9/9.
>
> **A lição de método desta sessão é a (4), e é sobre mim:** eu troquei uma regra de gate
> achando que era "estritamente mais correta", com um argumento que parecia sólido — *código em
> coluna zero depois do componente não é dele*. A prova contra o defeito derrubou em dez
> segundos: a `Sidebar` deixou de ser acusada. **Argumento convincente não é medição**, e a
> única razão de isso não ter virado um gate cego commitado é que este repositório exige provar
> a trava contra o defeito, não contra o estado atual.
>
> **E o Browser pane continua sem compor quadros nesta máquina** — reabrir não resolve, ele
> precisa estar visível na janela. Toda conferência visual desta sessão saiu por Playwright.

> **09/08/2026 — a PARTE J FECHADA: os 3 itens (J1·J2·J3).**
>
> ```
> Tarefa: PLANO-1.0 Parte J — estados universais. A parte FECHA.
> Arquivos analisados: packages/contracts/aurea.contract.json (as TRES listas de estado:
>   applicationPatterns.states, operationalPatterns.states, AppShell.states) ·
>   packages/react/src/{feedback.tsx, data-grid.tsx, pure.tsx, agents.tsx} ·
>   packages/core/src/aurea.css (.status-*, .alert-*, .banner-*) ·
>   scripts/validate.py (checks 11 e 22) · as 92 fichas de packages/contracts/registry/
> Arquivos alterados: packages/react/src/{pure.tsx, feedback.tsx, data-grid.tsx, index.tsx,
>   internal.tsx} · 5 fichas (Status, Alert, Banner, EmptyState, DataGrid) ·
>   scripts/validate.py (check 30 NOVO) · tests/unit/components.test.tsx ·
>   decisions/0018-*.md (NOVO) + decisions/README.md · PLANO-1.0.md · STATE.md · manifest.json
> O que mudou: os sete estados universais passaram a existir com UM nome, UMA frase e UM
>   marcador no DOM. `state` e' prop nova nos cinco componentes, eixo a parte de `variant`.
>   ZERO CSS novo e ZERO token novo — e nenhum dos dois foi economia, os dois foram medicao.
> Decisoes tomadas: ADR-0018 (tres decisoes num documento: sao SETE e nao seis; `state` e'
>   eixo proprio e nao valor de `variant`; falam por palavra e nao por cor). O setimo
>   (`waiting_dependency`) foi decisao MINHA — o Victor autorizou a parte sem separar o
>   ponto, e desfazer custa uma entrada da uniao.
> Testes executados: pnpm test 332/332 (eram 319; +13) · pnpm exec playwright test 61/61 ·
>   validate.py OK (30 checks) · node scripts/check-pack.mjs OK (react:51) · pnpm audit limpo ·
>   pnpm build limpo · catalogo aberto no navegador (alert e datagrid), zero console, os sete
>   chips renderizando e os dois temas conferidos por estilo computado
> Falhas: TRES, todas achadas por gate e nenhuma por leitura, todas corrigidas aqui.
>   (1) o check 11 leu `UNIVERSAL_STATES` como um componente chamado `UNIVERSAL` — a regex
>   dele para no `_`; virou `universalStates`, que ja era o idioma do modulo. (2) o check 30
>   nasceu FORTE DEMAIS e reprovou o `HealthMatrix`, que enumera `degraded` entre cinco
>   valores de saude — medido nas 92 fichas, ele e' o unico, e estava certo; quem mudou foi a
>   REGRA. (3) o `DataGrid` marcava o RECADO e nao a si mesmo, e com `state="loading"` nao ha
>   recado: o estado nao chegava ao DOM por lugar nenhum.
> Limitacoes: NENHUMA em aberto. O screenshot do Browser pane nao funciona nesta maquina —
>   ele exige o pane VISIVEL na janela para a pagina compor quadros, e reabri-lo nao resolveu
>   (mesmo erro, e selecionar a aba tambem nao adianta). A conferencia visual dos dois temas
>   saiu por OUTRO caminho, e ele fica registrado porque e' reprodutivel e nao custa nada: o
>   Playwright ja esta instalado e ja dirige estas mesmas paginas. Um andaime descartavel
>   capturou as cinco nos dois temas — mesmo `data-theme` e mesma espera de 600ms que o
>   `catalog.spec` usa de proposito — e as dez imagens foram OLHADAS, nao so medidas. O
>   andaime foi apagado no MESMO comando que o rodou, e isso e' deliberado: o commit
>   `50127c5` existe porque um andaime desses ja entrou num commit antes.
> Pendencias: I (8 itens) e K (4). A CI segue bloqueada por cobranca — so o Victor resolve.
> Riscos: baixo. Nenhuma mudanca de DOM em quem nao passa `state` (medido: 61/61 zero pixel),
>   e o unico caminho novo e' opt-in. O que NAO tem gate: se um componente futuro enumerar
>   uma palavra universal com sentido DIFERENTE, o check 30 aprova — ele cobra o marcador, nao
>   o significado. E' o mesmo limite declarado do check 22 (gate le o nosso fonte, nao a
>   cabeca de quem escreve).
> Proxima tarefa exata: **Parte I ou Parte K — a escolha e' do Victor.** Nenhuma comeca sem
>   "PODE IMPLEMENTAR". A **I** (8 itens, PLANO-1.0 §12) e' onde mora o n8n: o **I8
>   `VisualBuilder`** compoe o `DependencyGraph` de 09/08 e o contrato exige dele "um caminho
>   completo sem arrastar". O `I1 RunSession` e' o mais citado e puxa H.b e H.c, que existem.
>   **Aviso que continua valendo:** auto-arranjo de grafo e' `elkjs` — DEPENDENCIA NOVA, que
>   pelo BUILDING.md §3.3 interrompe o lote e exige o Victor. A **K** (4 itens, §14) e' mais
>   barata em codigo e mais cara em infra: o K1 (Firefox e WebKit) e' uma linha no
>   playwright.config.ts e um lote de baselines novas, que saem do conteiner do minipc; o K2
>   (publicador confiavel) e o K4 (publicar a 1.0) dependem de coisas fora do repositorio.
>   Comecar a I pelo I1, que reusa o que ja existe; comecar a K pelo K1, que e' o unico dos
>   quatro que fecha sozinho aqui dentro.
> Criterio de continuidade: arvore limpa e os cinco verdes acima. Se algum estiver vermelho,
>   o vermelho e' a tarefa.
> ```
>
> `pnpm test` **332/332** · `playwright` **61/61** · `validate.py` OK (**30 checks**) ·
> `check-pack` OK · `pnpm audit` limpo · **zero pixel**.
>
> **A medicao mudou o enunciado antes do primeiro edit, como em todas as partes anteriores.** O
> plano dizia seis estados e "com token e regra". Sao **sete** — `waiting_dependency` esta no
> contrato colado nos outros dois "esperando", e nomear dois dos tres deixa o terceiro para cada
> aplicacao inventar, que e' o defeito inteiro. E **nenhum token nasceu**: quinta recusa de cor
> por categoria neste repositorio, pela medicao de 09/08 no `CostMeter` — `--warning-400` **e'**
> `var(--brand-yellow)` no tema escuro, entao o degrau "de aviso" sai identico ao normal.
>
> **E metade do trabalho ja estava feita com os nomes certos.** `offline` era `StatusVariant`
> desde sempre, com pele propria; `stale` e `partial` eram o `state` do `DataGrid` desde a Parte
> F. **Nada foi renomeado** — a parte foi RECONCILIAR, nao inventar, que era exatamente o palpite
> que a sessao anterior deixou escrito neste paragrafo.
>
> **A licao de metodo desta parte e' sobre a TRAVA, nao sobre o codigo.** A minha regra reprovou
> um componente que estava certo, e a saida facil era mudar o componente para caber nela. Ha duas
> relacoes legitimas com um estado universal — **carregar** o estado (o componente inteiro esta
> nele) e **enumerar** a palavra entre valores de dominio. Obrigar o `HealthMatrix` a uniao faria
> uma celula de saude poder estar "esperando aprovacao". **Trava que manda no sistema e' trava
> errada**, e quem descobre isso e' a pergunta que este repositorio ja tinha: *quem mais tem esse
> problema?* — medida nas 92 fichas, respondida com UM.
>
> **A lista dos sete e' LIDA, nunca copiada.** O check 30 le a uniao do `pure.tsx`. Escrever os
> sete nomes dentro do gate seria o achado I1 acontecendo dentro do gate que cobra honestidade:
> bastaria alguem acrescentar o oitavo no TypeScript para a trava passar a aprovar ficha
> incompleta, calada.
>
> **UM ACHADO QUE OLHAR AS IMAGENS PRODUZIU, e ele NAO e' desta parte — fica para o Victor
> decidir.** As cinco paginas publicam os sete estados corretamente: eles aparecem como chips no
> eixo `States` e a prop `state` esta na tabela de API com o tipo e a descricao inteiros. **Mas
> nenhuma previa MOSTRA um.** A do `Alert` segue com `info` + `danger`, a do `Status` com
> online/busy/away/offline. Quem le a pagina fica sabendo que os sete existem e nunca ve um
> renderizado.
>
> Isso e' conteudo de catalogo, nao a Parte J: o criterio de fecho da parte ("representacao
> unica e testada") esta cumprido, e os 70 componentes de starter tambem tem previa minima por
> decisao ([ADR-0001](../../decisions/0001-modelo-de-pagina-do-catalogo.md)). Registro em vez de
> fazer calado porque acrescentar cinco previas e' escopo novo, e escopo novo entra como tarefa,
> nao como acrescimo silencioso. **Se o Victor quiser, e' barato:** o `Status` e o `Alert` ja tem
> secao `Examples` no modelo de pagina, entao cabe um exemplo em cada sem tocar no gerador.

> **09/08/2026 — a PARTE H FECHADA: os 16 itens (H1–H16).**
>
> ```
> Tarefa: PLANO-1.0 Parte H — grupo H.e (H11·H12·H13) e grupo H.f (H14·H15·H16). A parte FECHA.
> Arquivos analisados: Referencia/langfuse-main/.../dashboard/components/
>   {ModelUsageChart,ModelCostTable,TotalMetric,cards/BarListChartArea}.tsx, utils/numbers.ts,
>   features/automations/{AutomationSidebar,AutomationDetails}.tsx, trace-graph-view/GraphNode.tsx ·
>   agent-prism-main/.../{TokensBadge,PriceBadge}.tsx ·
>   agents-kit-main/.../{agent-status-panel,agent-orchestrator,agent-routing-hub}.tsx ·
>   xyflow-main/packages/{react/package.json,system/src/styles/*.css} ·
>   activepieces-main/packages/web/package.json (a medicao que fechou a decisao de motor) ·
>   as 9 LICENSE das referencias novas · MAP.md (o DAG) · packages/react/src/data-grid.tsx
> Arquivos alterados: packages/react/src/{agents.tsx, graph.tsx (NOVO), pure.tsx} ·
>   packages/react/package.json (peer opcional + subpath ./graph) · packages/core/src/aurea.css ·
>   6 fichas novas em packages/contracts/registry/ · scripts/{built-components.json,
>   build-catalog.mjs, validate.py, package-files.json} · pnpm-workspace.yaml (override nanoid) ·
>   apps/catalog/content/_starters.mjs · tests/unit/{components.test.tsx,setup.ts} ·
>   tests/visual/skin.spec.ts · 4 baselines `-win32` · REFERENCES.md · BUILDING.md · PLANO-1.0.md
> O que mudou: os 16 nomes da camada operacional passaram a existir. Entrou a TERCEIRA
>   dependencia opcional do repositorio (@xyflow/react, subpath ./graph). E os 13 componentes
>   de "AI & Agents" GANHARAM PAGINA no catalogo — nao tinham nenhuma.
> Decisoes tomadas: o motor do H14 (autorizado pelo Victor, reaberto por medicao minha e
>   fechado pelo ALVO que ele nomeou: aplicacao tipo n8n). Tres ficam registradas sem precisar
>   dele: o MemoryLedger NAO envolve o DataGrid (check 19 vence o plano), o limite brando do
>   CostMeter nao tem cor (no escuro --warning-400 E o amarelo da marca), e o DependencyGraph
>   nao tem previa estatica (grafo mede o DOM).
> Testes executados: pnpm test 319/319 · pnpm exec playwright test 61/61 · validate.py OK (29
>   checks) · node scripts/check-pack.mjs OK (react:51) · pnpm audit limpo · pnpm build limpo ·
>   as cinco paginas novas abertas no browser nos dois temas · o grafo visto num andaime de
>   vite descartavel, que foi o unico jeito de ve-lo de verdade
> Falhas: SEIS, todas achadas por gate ou pelo navegador e corrigidas aqui. As quatro do H.e
>   estao no bloco abaixo. As duas do H14: (1) o grafo saia INVISIVEL — `nodes` sem
>   `onNodesChange`, e sem o retorno o motor nao tem onde gravar a medida; (2) o `prerender`
>   do catalogo aprovou uma previa QUEBRADA porque so exigia `<svg`, e o fundo pontilhado do
>   motor e um.
> Limitacoes: NENHUMA em aberto desta parte. As baselines `-linux` (que este bloco chegou a
>   listar como pendentes) foram regravadas no conteiner do minipc na mesma noite — 61/61 COM e
>   61/61 SEM o flag, 4 arquivos alterados, nenhum -win32, e as 22 somas dos -win32 conferidas
>   antes e depois. Commit `613c51b`. O que segue nao medido e o ci.yml rodando com
>   `container:`, e isso e a CI bloqueada por cobranca, nao esta parte.
> Pendencias: I (8 itens), J (3) e K (4).
> Riscos: o @xyflow/react e peer OPCIONAL e mora em subpath — quem instala pelo Button nao paga
>   por ele, e o check 19 reprova se o import escapar do graph.tsx. O `pnpm audit` esta limpo.
> Proxima tarefa exata: **Parte I ou Parte J — a escolha e do Victor e ele NAO respondeu ainda.**
>   Nenhuma das duas comeca sem "PODE IMPLEMENTAR". As duas, com o primeiro passo ja escrito:
>
>   **J — Estados universais (3 itens, PLANO-1.0 §13).** Sem dependencia nova. Seis estados que
>   componente nenhum da Aurea sabe representar hoje: esperando pessoa, esperando aprovacao, sem
>   conexao, dado velho, resultado parcial, degradado. J1 nomeia e tokeniza, J2 aplica em Status/
>   Alert/Banner/EmptyState/DataGrid, J3 e a trava (ficha que declara um destes e nao o emite
>   reprova). Comecar medindo o que o DataGrid JA faz: ele tem `state` com stale/partial/error
>   desde a Parte F, e provavelmente o J1 e' generalizar aquele vocabulario em vez de inventar
>   outro. Ver `packages/react/src/data-grid.tsx` e as strings `dataGridStale`/`dataGridPartial`
>   no `pure.tsx`.
>
>   **I — Composicoes de aplicacao (8 itens, PLANO-1.0 §12).** Mais cara, e onde mora o n8n: o
>   **I8 `VisualBuilder`** compoe o `DependencyGraph` que nasceu em 09/08 e o contrato exige dele
>   "um caminho completo sem arrastar" — ou seja, teclado faz tudo que o arraste faz. O `I1
>   RunSession` e' o mais citado pelo contrato e puxa H.b e H.c, que ja existem. Referencias:
>   `media-chrome-main` (midia), `kibo-main` (gantt/kanban/tree/editor), `reui-main/components/
>   blocks`. **Aviso:** se o I8 pedir auto-arranjo de grafo, isso e' o `elkjs` — DEPENDENCIA
>   NOVA, e pelo `BUILDING.md` §3.3 interrompe o lote e exige o Victor.
>
>   Se ele nao disser qual, PERGUNTAR — nao escolher.
> Criterio de continuidade: arvore limpa, e os quatro verdes acima. Se algum estiver vermelho,
>   o vermelho e' a tarefa.
> ```
>
> `pnpm test` **319/319** · `playwright` **61/61** · `validate.py` OK (**29 checks**) · `check-pack` OK · `pnpm audit` limpo.
>
> **Uma DECISÃO DE TAXONOMIA saiu daqui e precisa da conferência do Victor:** a categoria
> **"AI & Agents"** entrou na lista travada de 13 — [ADR-0017](../../decisions/0017-categoria-ai-agents.md).
> O motivo está lá por extenso; o resumo é que distribuir os 16 nomes pelas categorias existentes
> quebraria em cinco módulos o que o contrato declara como um domínio só, e que o §2 do
> `DIRECTION.md`, de onde a categoria saiu, se declara **não-vinculante** — então é escolha, não
> leitura. **Enquanto a Parte H não fechar, desfazer é barato** (campo de JSON nas fichas + uma
> linha no `validate.py`); depois que o catálogo publicar as páginas, não é.
>
> **As três peças são COMPOSIÇÃO**, e é o padrão que a Parte F já vinha mostrando: `.card` dá a
> superfície, `.status` dá o estado, `.data-list` dá o par termo/valor. O CSS novo é só arranjo.
>
> **Três coisas da referência ficaram de fora, e as três pelo mesmo motivo — ela decide o que não
> é dela:** a cor solta (`text-yellow-500` dentro do componente; aqui vira variante do `Status`),
> o despacho de ação por STRING (troca o compilador por acordo verbal), e um ícone por estado —
> este último eu **cheguei a escrever**, e o mapa não renderizava nenhum. Código morto nascendo
> junto com o componente; saiu antes do commit.
>
> **As quatro travas cobraram na hora:** pôr os três em `built-components.json` reprovou por falta
> de entrada no `REFERENCES.md` e por falta de asserção no `skin.spec` — que é exatamente o que o
> E15 desenhou para acontecer com componente novo.
>
> **PENDÊNCIA que não é verde, e ela ATRAVESSA os cinco grupos:** as quatro capturas do catálogo
> (`catalogo-index` e `catalogo-topo`, nos dois temas) mudaram de propósito a cada grupo, porque
> **treze** componentes entraram no índice e o contador do topo subiu junto. As `-win32` foram
> regravadas a cada vez e estão em dia; as **`-linux` NÃO foram** — elas saem do contêiner
> (receita no §2 deste arquivo), numa máquina fora de alcance nesta madrugada. **Enquanto isso, o
> passo de screenshot da CI reprova, e reprova com razão.**
>
> **E em 09/08, com o H.e, a diferença DEIXOU de ser de contador:** o `CAT_ORDER` corrigido fez o
> índice ganhar uma **seção inteira** ("AI & Agents", agora 16 itens) e o catálogo ir de 183 a
> 199 páginas.
>
> ✅ **RESOLVIDO em 09/08/2026, à noite, com o Victor em casa.** As quatro se regeraram no
> contêiner oficial no minipc, pela receita do §2 — nada de novo foi inventado. Transferência do
> código por **git bundle** (segue valendo a ordem de zero push até a cota voltar), acesso por
> chave `minipc_mythos`. Os números:
>
> - `--update-snapshots` no contêiner: **61/61**;
> - conferência **sem** o flag, no mesmo contêiner: **61/61** — é isto que prova a baseline, não
>   a regravação;
> - alterados: **exatamente 4**, todos `-linux`. `grep -c win32` nos alterados: **0**;
> - de volta no Windows: as **22** somas SHA-256 dos `-win32`, tiradas ANTES, conferem **22/22**;
> - suíte local depois: **61/61**.
>
> **O gate de pixel está em dia nas duas plataformas.** O que continua não medido é o `ci.yml`
> rodando com `container:` — a CI segue bloqueada por cobrança, e isso é outra coisa.
>
> **H.b (09/08):** `InvocationPanel` e `TaskQueue`. Duas trocas de mecanismo, as duas para o lado
> da plataforma — o passo dobrável é `<details>` nativo (a referência gasta um `Collapsible` de
> biblioteca) e `running` marca `aria-busy` na região em vez de animar o rótulo com um
> `TextShimmer`, que leitor de tela não alcança e que `prefers-reduced-motion` teria de desfazer.
>
> **E o escopo do `TaskQueue` encolheu por FRONTEIRA, não por preguiça:** o `AgentTask` da
> referência tem 15 campos e cinco pertencem a outros componentes desta mesma parte — token e
> custo são H11 e H12, `checkpoints` é H9, `assignee` é H1. Absorvê-los faria a fila responder
> por quatro contratos e nenhum direito.
>
> **Um gate morreu em vez de explicar, e é o defeito que o E13 já tinha registrado:** o
> `skin.spec` chamou `getComputedStyle` num seletor sem elemento — faltava um passo `running` na
> fixture — e o erro saiu como `TypeError`, não como "esta asserção não achou o elemento".
>
> **H.c (09/08):** `HumanApproval` e `ToolPermission`. A referência junta os dois num componente
> só, com o interruptor "always allow" DENTRO do diálogo de aprovação. Aqui são dois, e a
> separação é o ponto: aprovar é sobre ESTA ação, permitir é sobre TODAS as próximas — e misturar
> as duas é exatamente como se concede permissão permanente sem perceber.
>
> **Nasceu o check 29, de um defeito MEU, e ele estava em DOIS lugares:** escrevi
> `var(--font-mono)` no `.file-checksum` (item G4) e no `.tool-permission-scope` (aqui). **Esse
> token não existe** — o do sistema é `--font-code`. As duas regras caíam caladas na fonte de
> texto, e nenhum gate via: o check 11 confere os tokens que a FICHA declara, não os que o CSS
> usa. Quem achou foi uma asserção de pele, por acidente.
>
> **E a pergunta "quem mais tem esse problema?" errou antes de acertar, pelo motivo de sempre:**
> a primeira medição acusou **120** tokens órfãos, medindo contra o `src` do core — e os tokens
> moram no pacote `tokens`, que só aparece no `dist`. Com o corpus certo são **5**, e os cinco são
> legítimos: três válvulas de escape com fallback, duas que o Base UI escreve em execução. Daí a
> regra do check 29 ser sobre `var()` **sem fallback**. Provado contra o defeito.
>
> **H.d (09/08):** `EventStream`, `TraceTimeline` e `HealthMatrix`. Aqui o passo 1 valeu mais que
> o passo 2, porque **dois dos três parecem coisas que já existem** — e a separação de cada um é
> por PAPEL, não por aparência: `EventStream` é `role="feed"` (o evento tem estrutura) contra o
> `role="log"` do `LogStream` (texto que se acumula); e `TraceTimeline` é cascata de DURAÇÕES
> contra a coluna de MOMENTOS do `Timeline`.
>
> **A decisão maior foi recusar as ONZE cores por categoria de span** do `agent-prism`. Cor por
> categoria numa paleta travada é ilegível para quem não separa as cores — mesmo defeito que o
> H.a já tinha recusado. `kind` entra como texto.
>
> **E duas decisões de comportamento com o custo escrito dos dois lados:** "seguir o fim" é
> opt-in (sem ele quem lê o topo perde o que chega; com ele quem lê o meio é arrastado — o
> segundo é pior), e a barra do rastro é `meter` e não `progressbar`, com `aria-valuetext`,
> porque largura sozinha não é lida por ninguém.
>
> **H.e (09/08):** `ModelUsage`, `CostMeter` e `MemoryLedger`. Terceira vez que a pergunta do
> grupo é a mesma: **são o mesmo componente?** Na referência quase são — o `ModelUsageChart` e o
> `ModelCostTable` mostram os dois `modelo × tokens × custo`. Separam-se por PAPEL: **fatia de uma
> SOMA** (o teto é o próprio total) contra **fração de um TETO que vem de fora**. Trocar um pelo
> outro mostra orçamento onde não existe orçamento.
>
> **O `MemoryLedger` NÃO envolve o `DataGrid`, e o plano dizia o contrário.** O `PLANO-1.0` §11
> escrevia que o razão dependia da Parte F. A medição diz que não dá: `data-grid.tsx` mora em
> subpath próprio porque carrega `@tanstack/react-table` como peer OPCIONAL (check 19), e
> `agents.tsx` sai pelo barril leve — importá-lo faria quem instala a biblioteca pelo `Button`
> passar a precisar da tabela. **A fronteira do pacote vence o plano**, e quem compõe as duas
> coisas é a aplicação.
>
> **Uma cor morreu na medição, e o motivo estava no token.** A primeira versão do `CostMeter`
> pintava três degraus de barra. O `skin.spec` reprovou **no escuro**: `--warning-400` **é**
> `var(--brand-yellow)` lá, o mesmo valor de `--primary`. A barra "de aviso" saía idêntica à
> normal. Perguntado *quem mais tem esse problema* — os outros seis usos do token no core são
> texto ou mistura de borda, e o único outro preenchimento (`.event-dot`) tem `--muted-foreground`
> de vizinho. Era só desta peça. O limite brando passou a falar por **palavra**, no `Alert`;
> a cor ficou para o rígido, onde o vermelho separa nos dois temas.
>
> **E o achado que não era desta tarefa: os 13 componentes de "AI & Agents" não tinham página no
> catálogo.** A [ADR-0017](../../decisions/0017-categoria-ai-agents.md) acrescentou a categoria à
> taxonomia do `validate.py` em 09/08 e **não** ao `CAT_ORDER` do `build-catalog.mjs`, que era a
> única fonte das páginas de componente. Os 10 do H.a–H.d entraram no repositório sem página, sem
> entrada na navegação e sem contagem — o gerador seguiu imprimindo `76 components` com 86 fichas.
> Nenhum gate viu: o check 17 cobra item de catálogo sem prévia, e **item que não existe não é
> item**. Corrigido na raiz (todos os 13 de uma vez, catálogo 183 → 196 páginas) e com o controle
> no mesmo commit: o `build-catalog` agora **morre** se uma categoria de ficha não tiver lugar no
> `CAT_ORDER`. Provado contra o defeito — tirar `"AI & Agents"` da lista mata o build nomeando-a.
>
> **E o segundo achado, da mesma família e no mesmo dia: as 13 entradas de starter declaravam
> `preview:`, uma chave que o gerador NUNCA leu.** Quem desenha é `render`, e é uma FUNÇÃO. As
> treze páginas saíam com "Interactive — see the code." no lugar do componente. O check 17 não
> viu pelo motivo de sempre — ele cobra que a ENTRADA exista, não que ela desenhe, e é o mesmo
> "gate de nome não é gate de efeito" que o Lote 3 já tinha encontrado na prévia vazia do
> `Chart`. Corrigido nas 13, com gate: o `build-catalog` **morre** se um starter declarar chave
> fora do vocabulário. Provado contra o defeito.
>
> **E aí a prévia passou a renderizar, e a varredura achou TRÊS defeitos de acessibilidade que
> estavam escondidos atrás da caixa vazia** — todos de componentes entregues nos grupos
> anteriores, todos com a mesma raiz: **um componente não sabe a que profundidade da página ele
> está, e mesmo assim fixava `<h3>`.**
>
> - `AgentInspector` e `InvocationPanel`: `salto h1 → h3`. Os rótulos viraram `<p>`, e a seção
>   que eles nomeiam virou `role="group"` com `aria-labelledby`. O leitor de tela continua
>   sabendo onde cada bloco começa; ninguém precisa adivinhar o nível certo.
> - `EventStream`: `aria-required-children`. `role="feed"` só aceita `article` como filho, e o
>   cabeçalho de grupo era irmão dos artigos. Agora o **feed é do grupo** e leva o nome dele (a
>   data); sem agrupamento, o feed único continua se chamando como o componente.
>
> **Uma pegadinha na correção, e ela é de aparência:** `<h3>` traz `font-weight:bold` do
> navegador e `<p>` não. Trocar a tag mudaria o peso dos três rótulos sem ninguém pedir — então
> o peso foi **fixado em token** nas três regras. O gate de pixel confirma: **zero** mudança nas
> 44 baselines.
>
> **Um número inventado foi recusado:** derivar `softLimit` em 80% de `limit`. Sem `softLimit`
> configurado, não existe estado de aviso — alerta que dispara num limiar que ninguém escolheu é
> ruído com aparência de política.
>
> **E uma asserção minha passou por acidente antes de o navegador me desmentir.** Escrevi "a
> barra maior é maior que a menor" no `skin.spec`, e ela passava com **1px contra 0px** — as
> barras do `ModelUsage` e as do `TraceTimeline` estavam colapsadas no painel do catálogo, onde
> as colunas resolviam `224px 24px`. O `1fr` só recebe a SOBRA, e não havia sobra. Corrigido nos
> dois (`minmax(0,Nrem) minmax(8rem,1fr)` — o mínimo do lado da BARRA, e quem trunca é o
> rótulo), e a asserção foi reescrita para medir a **razão** dentro de uma caixa de **260px**.
> Provada contra o defeito: repor o grid antigo reprova.
>
> **H.f (09/08):** `InterAgentMessage`, `AutomationCard` e `DependencyGraph`. **A Parte H fecha.**
>
> **`InterAgentMessage` não é o `MessageList`** — aquele é conversa com uma PESSOA; aqui a
> **direção é o dado**. E ela quase se perdeu: a seta entre remetente e destinatário é um `Icon`,
> e **todo `Icon` da Aurea é `aria-hidden` por construção**, então um leitor de tela ouviria
> "Curator Writer" e a direção sumiria no espaço entre os dois nomes. O par virou `group`
> **nomeado**, o mesmo idioma que o `AgentInspector` adotou no H.e.
>
> **`AutomationCard` é REGRA** — condição e consequência —, e é o par QUANDO/ENTÃO que a separa
> do `AgentCard` (identidade) e da `TaskQueue` (trabalho). Sem `onToggle` **não nasce
> interruptor**: controle que não faz nada promete uma ação que não existe. E regra desligada
> não some e não muda de cor, ela **recua** — apagar o cartão esconderia justamente a regra que
> alguém precisa achar para religar.
>
> **QUARTA recusa da mesma coisa:** as 6 cores por intenção do `agent-routing-hub`. Depois das 11
> de span no H.d, das 6 de estado no H.a e das **10 por tipo de nó** que o `GraphNode` do langfuse
> traz. `kind` sai como palavra, sempre.
>
> **A decisão de motor do H14 foi reaberta por mim e fechada pelo VICTOR — com uma pergunta.**
> Eu autorizei-me a duvidar depois de medir que o `trace-graph-view/` do langfuse não usa React
> Flow e que o React Flow **não faz layout**. A pergunta dele desfez a dúvida porque trocou o
> alvo: *"se a gente tentar usar a Aurea fazendo algo como um n8n vamos conseguir?"*. Grafo de
> **leitura** não precisa de motor; **editor** precisa — e o padrão de mercado para este editor é
> o xyflow, medido nos dois lados: a `activepieces-main`, que já está em `Referencia/` e é
> concorrente direta do n8n, usa `@xyflow/react` 12.3.5; e o próprio n8n usa **Vue Flow**, da
> mesma equipe. **A autorização dele estava certa; a minha ressalva valia para o outro alvo.**
>
> **O que entrou do motor, e o que nunca:** `base.css` (estrutura, tudo atrás de `var(--xy-*)`)
> entra; `style.css` (raio 3px, `#1a192b`, sombras) **não**. Nenhuma classe `.react-flow__*`
> aparece no nosso core — a pele assume por variável, o que também evita plantar no check 15
> uma classe que componente nenhum daqui produz.
>
> **Dois defeitos que SÓ o navegador achou, e o segundo é uma trava que mentiu:**
>
> 1. **O grafo saía INVISÍVEL.** Eu passava `nodes` ao motor e nenhum `onNodesChange`; ele aceita
>    calado, e só tira o `visibility:hidden` do nó depois de gravar a medida dele de volta na
>    lista. Sem o retorno, não há onde gravar: cinco nós ocultos, **zero** aresta, `fitView`
>    parado em `scale(1)`. **Nenhum teste de jsdom pega isso**, porque lá não há layout — este
>    item precisou de um andaime de vite descartável só para ser visto uma vez.
> 2. **O `prerender` do catálogo aprovou uma prévia QUEBRADA.** O guarda só exigia um `<svg>`, e
>    o `<Background/>` do motor emite um — então ele aprovou o fundo pontilhado achando que era
>    o grafo. No navegador os nós saíam entre x=314 e x=1394 numa caixa de 667px. **"Gate de nome
>    não é gate de efeito", terceira vez neste repositório.** O guarda passou a aceitar o trecho
>    que prova o desenho, e foi provado contra o defeito.
>
> **E aí eu escrevi a desculpa errada, e o Victor pegou.** Concluí que grafo mede o DOM e portanto
> não cabe em HTML estático, pus uma `note` na página e segui. Ele abriu, viu um retângulo vazio e
> perguntou **"cadê?"**. Era conclusão, não medição: o motor tem caminho de **SSR documentado** —
> `initialWidth`, `initialHeight` e um array `handles` por nó, mais o viewport inicial no
> provider. **A página de hoje renderiza o grafo de verdade.** Corrigido em `d3b5210`, com mais
> três achados no caminho, e o terceiro vale para todo consumidor:
>
> - com `nodes` controlado, a loja do motor só é semeada num EFEITO — e efeito não roda no
>   servidor. O provider precisa de `initialNodes`/`initialEdges` para o primeiro render;
> - a tela media **71px**: painel de demo é flex e caixa de largura automática encolhe. Corrigido
>   no COMPONENTE (`inline-size:100%`), não no exemplo;
> - **CSS fora de camada vence CSS em camada, e especificidade nem entra na conta.** O core mora
>   em `@layer aurea`; o `base.css` do motor, importado solto, o sobrepunha — o link de
>   atribuição ficava com o `#999` cravado deles e reprovava contraste no axe **mesmo com a nossa
>   regra sendo mais específica**. A saída é `@layer motor, aurea;` e importar o motor em
>   `layer(motor)`. **Está na ficha do `DependencyGraph`, e todo consumidor precisa disso.**
>
> **E a instalação achou dívida que não era dela:** `pnpm audit` acusou `nanoid <3.3.17`
> (**alto**). `pnpm why` mostrou os dois caminhos, e nenhum passa pelo xyflow — os dois são
> `postcss`, um por `vite` e outro por `next`. Corrigido com `override`, no padrão do `undici`.
>
> **Próximo:** **I** ou **J**, e a escolha é do Victor. A **J** não tem dependência nova e fecha
> os seis estados universais; a **I** tem o **I8 (`VisualBuilder`), que É o n8n** — ele compõe o
> `DependencyGraph` que acabou de nascer.

> **09/08/2026 — a PARTE G FECHADA: os 6 itens.** `pnpm test` **272/272** · `playwright`
> **61/61** · `validate.py` OK · `check-pack` OK · zero pixel.
>
> **O nosso já era maior que a referência.** O item de fila do Untitled UI expõe
> `{name, size, progress, failed, onDelete}` e mais nada — sem cancelar, sem repetir, sem pausa. O
> `FileInput` já tinha os dois primeiros desde a Fase 5. Os seis itens saíram de DECISÃO, e cada
> decisão veio com o limite declarado: `File` não volta de armazenamento (G1), pausar HTTP é
> abortar (G2), `crypto.subtle` exige contexto seguro e o arquivo inteiro em memória (G4).
>
> **Três defeitos foram achados pelos TESTES, não pela leitura** — e o terceiro é sobre os testes:
> uma corrida que pulava a conferência de soma em silêncio; "substituir" que mantinha os dois
> porque lia a closure velha; e um teste do recibo que **passava com o defeito reintroduzido**,
> porque com um arquivo só a lista fica vazia dos dois jeitos. Com dois arquivos ele detecta.
> Teste que passa por acidente é cobertura de mentira.
>
> **E o check 23 achou um nome ruim procurando outra coisa:** `size:number` na fila foi lido como
> DIMENSÃO. Estava certo pelo motivo errado — num sistema onde `size` é escala de token em todo
> lugar, chamar o peso do arquivo de `size` era ambiguidade esperando acontecer. Virou `bytes`.
>
> **Próxima:** H, I, J ou K. A H está destravada desde 08/08.

> **08/08/2026 — a PARTE F FECHADA: os 11 itens.**
>
> ```
> Tarefa: PLANO-1.0 Parte F — os 11 itens, parte FECHADA
> Arquivos analisados: packages/react/src/data-grid.tsx · packages/contracts/registry/DataGrid.json ·
>   tests/unit/components.test.tsx · o fonte INSTALADO do @tanstack/table-core 8.21.3 ·
>   Referencia/{ui-main,kibo-main,react-main,reui-main,material-ui-master,base-ui-master,media-chrome-main}
> Arquivos alterados: data-grid.tsx · DataGrid.json · components.test.tsx · REFERENCES.md ·
>   PLANO-1.0.md · STATE.md e manifest.json (gerados)
> O que mudou: os quatro eixos aceitam valor+callback de fora, com o interno como default;
>   os quatro sinais de servidor chegam ao motor; SortingState e RowSelectionState reexportados.
> Decisões tomadas: nenhum ADR — mas uma PERGUNTA ABERTA para o Victor, o TanStack 9 (abaixo).
> Testes executados: pnpm test 258/258 · pnpm exec playwright test 61/61 · validate.py OK (26) ·
>   check-pack OK · pnpm build limpo
> Falhas: nenhuma
> Limitações: nenhuma — o achado de role/teclado abaixo foi corrigido no mesmo dia
> Pendências: nenhuma na Parte F
> Riscos: nenhum novo — zero pixel mudou, e o modo interno tem teste próprio provando que não mudou
> Próxima tarefa exata: a próxima PARTE, e ela precisa de autorização — G, H, I, J ou K.
>   A H está destravada desde 08/08 (referências baixadas); o H13 depende do F1, que já existe
> Critério de continuidade: árvore limpa após pnpm build, os cinco verdes acima
> ```
>
> **F1 e F2 eram EXPOSIÇÃO, não construção, e a medição é que disse isso.** No fonte instalado do
> motor, `manualSorting` (`RowSorting.ts:535`), `manualFiltering` (`ColumnFiltering.ts:408`) e
> `manualPagination` (`RowPagination.ts:376`) curto-circuitam o modelo de linha correspondente.
> Escrever máquina de estado nossa ao lado seria o padrão paralelo que o §1 recusa.
>
> **O passo 2 achou uma AUSÊNCIA, e ela desenhou a API:** nenhuma das sete referências expõe API
> controlada por prop — o shadcn guarda tudo em `useState` dentro do exemplo, o Kibo põe a
> ordenação num átomo global (jotai), o Untitled é envelope de React Aria (segundo motor headless,
> já recusado no Lote 4) e o MUI **core não tem** grade (é do MUI X, outro repositório). Sem
> anatomia para copiar, o vocabulário veio do motor.
>
> **Os dez testes foram provados contra o defeito, nos dois eixos:** com a prop de ordenação aceita
> e ignorada, os dois testes de F1 reprovam; com os quatro `manual*` aceitos e não repassados ao
> motor, os três de F2 reprovam. Um deles **não** é detector e está dito por escrito: "sem
> `rowCount` a paginação some" passa nos dois estados — é trava de documentação do limite, não de
> comportamento.
>
> **Um erro meu de ferramenta, registrado porque quase custou o trabalho:** rodei
> `git checkout <arquivo>` para desfazer uma injúria e apaguei a implementação **não commitada**
> junto. O backup em disco salvou. Para a próxima: desfazer injúria se faz com cópia, não com
> `git checkout`, enquanto o trabalho não está commitado.
>
> ### ACHADO NOVO, medido e NÃO corrigido — a ficha do `DataGrid` promete semântica que ele não tem
>
> `DataGrid.json` declara `a11y.role: "grid"` e quatro setas em `a11y.keyboard`. Medido no fonte:
> o componente emite `role="region"` no embrulho rolável e um `<table>` **sem role** — cujo papel
> implícito é `table`, não `grid` — e tem **zero** `onKeyDown`. Pelo APG, `grid` exige navegação
> por célula com as setas; ela não existe. As referências que envelopam o mesmo motor (shadcn,
> Kibo) também usam `<table>` simples.
>
> **A pergunta do §1 — quem MAIS tem esse problema? — foi feita, e a resposta corrigiu a medição.**
> Um levantamento literal acusa **25 de 64** fichas com role que o nosso fonte não escreve, e o
> número é **enganoso**: quase todas são papel IMPLÍCITO e legítimo (`<nav>` é `navigation`,
> `<input type=checkbox>` é `checkbox`, `<aside>` é `complementary`). É o ponto cego de sempre
> num traje novo: contar texto em vez de medir efeito. O `DataGrid` é diferente porque `grid`
> **não** é implícito em `<table>` e porque o teclado prometido não existe.
>
> **CORRIGIDO em 08/08/2026, com o Victor delegando a escolha.** A ficha passou a declarar
> `role: table`, `apg: table`, `keyboard: []` — igual à do `Table`, que tem a mesma marcação. A
> alternativa (implementar a navegação por célula do APG) foi recusada por escrito: é item de
> acessibilidade, não de F, e nenhuma das referências que envelopam o mesmo motor a implementa.
> **O controle que pega a regressão já existia e não foi preciso escrever:** os dois helpers de
> linha do `components.test.tsx` fazem `getByRole("table")`, e ~15 testes quebram se alguém
> puser `role="grid"` de volta.
>
> ### O que o F3 acrescentou, e o que a medição matou
>
> **A pele nasceu com SEIS declarações e ficou com TRÊS.** Cada uma foi retirada e remedida no
> navegador, sozinha. Sobreviveram `text-transform:none` (sem ela o campo digita em maiúsculas),
> `vertical-align:top` (sem ela os dois controles, de 36px e 40px, começam em linhas diferentes)
> e `gap:0` (sem ela o rótulo só-para-leitor-de-tela cobra 7px). Morreram `height:auto`,
> `letter-spacing:normal` e `line-height:0` — nenhuma mudava um pixel.
>
> **Duas medições minhas erraram antes de acertar, e as duas são reincidência do E13:** o seletor
> `thead tr:first-child th` casou com a tabela do `Calendar` e devolveu recuo 0; e comparar o
> topo dos `<input>` acusou 5px de desalinhamento onde havia alinhamento, porque um é `<input>`
> nu e o outro é um `.field` com recheio. O que se compara é a caixa de CONTROLE.
>
> ### O F4 é a Parte A cobrando pela TERCEIRA vez
>
> `gridStateFromParams` é chamado ONDE A URL CHEGA — num framework de RSC, o servidor. Saindo do
> subpath do `DataGrid`, que tem `"use client"`, ele viraria referência de cliente e quebraria ao
> ser CHAMADO. As duas funções moram no `pure.tsx` e saem pelo **barril**; os tipos são
> estruturais para o `pure.tsx` não passar a depender do `@tanstack`.
>
> **Nenhuma das sete referências persiste estado de tabela na URL** — medido. Onde não há
> anatomia, o passo 4 manda pesquisar, e a resposta foi uma API de plataforma (`URLSearchParams`),
> não uma biblioteca.
>
> **Sete testes, provados contra duas injúrias:** serializar sem limpar o que sobrou da grade
> anterior derruba quatro; ignorar o `filters` na volta derruba três. E um deles trava o LIMITE,
> não o comportamento — a faceta de um valor só volta como texto quando o `filters` não é
> passado, e isso está escrito nos dois lados.
>
> ### O F5 entrou com ZERO CSS, e é o resultado que vale registrar
>
> A barra de lote é `Toolbar` + `ToolbarButton` + `ToolbarSeparator` + `.hint`, todos já no
> repositório: o `.toolbar` do core já é superfície flutuante em pílula com fundo próprio, e o
> Base UI já dá o papel `toolbar` e as setas. As DUAS referências (Activepieces e Kaneo) desenham
> a mesma barra à mão — e convergem na mesma anatomia, o que é o sinal de que ela é madura.
> Ficaram de fora o `position:fixed` sobre a janela (decisão de APLICAÇÃO, e briga de z-index de
> graça) e a animação por biblioteca de movimento (dependência nova para nada).
>
> **Medido no navegador com só o core:** raio 999 = `--radius-control`, fundo próprio, dois
> botões. E a fixture do `skin.spec` renderiza a barra de VERDADE, não marcação à mão: a seleção
> entra CONTROLADA (`rowSelection={{alpha:true}}`), então `renderToStaticMarkup` já sai com ela.
> É um caminho melhor que o precedente dos seis de portal, e serve para qualquer peça que só
> exista sob estado.
>
> **Seis testes, provados contra duas injúrias:** agir sobre o modelo FILTRADO em vez do
> pré-filtrado derruba um (o consumidor marcou antes de filtrar — a linha escondida continua
> escolhida); e desenhar a barra sem seleção derruba três.

> **08/08/2026 — a PARTE D FECHOU, e com ela a AUDITORIA INTEGRAL de 26/07/2026.** Placar:
> **41 achados, 41 fechados, 0 abertos.** O resto desta seção é história das fases.
>
> Dois dias, duas partes, os dois últimos achados: o **M8** caiu na Parte E (07/08) e o **M13**
> na Parte D (08/08).
>
> **O que a Parte D entregou:** `apps/docs/index.html` (682 KB escritos à mão), o `docs.css`, o
> gerador, o `docs.spec` e as 52 baselines dele saíram. `LEGACY_BP` está **vazia** — o check 4b
> vale sem exceção nenhuma. E o `rtl.spec` deixou de depender daquela página: gera a própria,
> no padrão do `skin.spec`.
>
> **A próxima sessão escolhe entre F, G, H, I, J ou K.** A ordem do §2 do
> [`PLANO-1.0.md`](../../docs/PLANO-1.0.md) libera todas. Três observações para a escolha:
>
> - a **F** (grade de dados, 11 itens) é a maior e a mais útil para superfície administrativa
>   real — e o `REFERENCES.md` já registra, na entrada do `Table`, que o
>   `react-main/components/application/table` é a referência a reler lá, com seleção e
>   ordenação prontas;
> - a **G** tem o mesmo tipo de pista: o `application/file-upload` do Untitled (15,6 KB) é a
>   fila completa que a parte promete;
> - a **H** continua exigindo uma decisão antes de começar — nenhuma das sete referências tem a
>   camada operacional, e está escrito no enunciado dela.
>
> **Duas perguntas ficam abertas, e nenhuma bloqueia:**
>
> 1. O **check 21** cobra o NOME no `REFERENCES.md`, não uma leitura: 55 dos 76 têm entrada com
>    cabeçalho próprio, 21 passam por menção. Fechar custa ~3–4 h.
> 2. O **`ci.yml` com `container:` nunca rodou na CI**, que segue bloqueada por cobrança. O que
>    está medido é o contêiner reproduzindo o runner; o que não está é o workflow sob
>    `--user 1001`.

**O `03-PLANO.md` acabou.** As 11 fases estão executadas (placar em `02-ACHADOS.md` §0). O que
resta não é fase do plano: **publicação**, a **trilha nativa**, e os achados que seguem abertos
por decisão (M13).

**Ordem decidida pelo Victor em 27/07/2026, e ela vence:** fechar o plano primeiro, para não
deixar ponta solta. Ou seja **7 → 8 → 9 → 10**, depois **publicar**, e só então o **inventário
de demanda real** + a **trilha nativa**. A **Fase 11** (a pele que falta, achado A13) entra
antes de publicar: publicar componente sem pele é publicar defeito com número de versão.

Eu havia recomendado o inverso (inventário antes, para não consertar o que ele não vai usar).
Ele decidiu o contrário e reafirmou. Não reabrir sem evidência nova.

A Fase 11 fechou em 30/07/2026: as nove classes do A13 ganharam pele, `semRegra` caiu de 12 para
3, o `.grid` saiu do chrome do catálogo, e **nenhum pixel mudou** (a regra do core foi escrita
equivalente à que saiu — a prova é os 96 baselines passarem). Ver `02-ACHADOS.md` §0.12.

**A próxima é PUBLICAR** — decidido em 27/07/2026 e reafirmado: fechar o plano primeiro, depois
publicar, e só então o inventário de demanda real e a trilha nativa. O caminho está livre: a
Fase 9 deixou o pacote divisível e a 11 tirou o último "publicar defeito com número de versão".

**O preparo mecânico está feito (31/07/2026)** e o `QUALITY.md` "Para PUBLICAR uma versão" não
tem mais linha vermelha: o critério 26 virou gate (`scripts/check-pack.mjs`, com baseline
versionado, rodando na CI e provado contra o defeito), o `pnpm audit --audit-level=high` está
limpo, os seis pacotes ganharam `publishConfig.access`, `repository`, `description` e README.

**A mecânica de publicar mudou desde o que qualquer sessão assumiria de memória** — pesquisado
em 31/07/2026 e registrado na [ADR-0013](../../decisions/0013-mecanica-de-publicacao-npm.md):
os classic tokens do npm foram **revogados em 09/12/2025**, então `NPM_TOKEN` num segredo do
GitHub não é mais um caminho. O primeiro publish é **local com 2FA** (o npm exige que o pacote
exista antes de aceitar um trusted publisher); daí em diante é OIDC, sem token. E **provenance
não é gerada para repositório privado** — o `aurea-uds` é privado, e torná-lo público esbarra
na condição 2 da ADR-0010 (o histórico do git contém os nomes proibidos).

**As duas decisões que faltavam foram tomadas pelo Victor em 31/07/2026:**

1. **A versão é `0.1.0`**, não a `1.7.0` herdada do kit — [ADR-0014](../../decisions/0014-primeira-versao-publica-0-1-0.md),
   com a condição de saída de `0.x` escrita (fechar o M8 + um consumidor real instalando do npm).
2. **Publica com o repositório privado**, assumindo a ausência de provenance e de canal público
   de issue como custo declarado.

**A Aurea ESTÁ PUBLICADA desde 31/07/2026** — os seis pacotes no npm público em `0.1.0`, na
organização `aurea-uds`. E desde então a construção passou a andar por **lotes**, sob o
[`BUILDING.md`](../../docs/BUILDING.md), que é canônico e está na ordem de leitura do `CLAUDE.md`.

**Lotes fechados em 31/07/2026** (a fila completa está no `BUILDING.md` §5):

| Lote | O que entrou |
|---|---|
| 0 | as quatro travas — checks 21 a 24, provados contra o defeito |
| 1 | `Toggle` · `Spinner` · `NumberField` · `OTPField` · `HoverCard` |
| 2 | `AvatarGroup` · `Stepper`, mais os três defeitos do `Avatar` |

**Lote 3 fechado em 01/08/2026** — `Chart` · `ChartTooltip` · `ChartLegend`, envelope sobre o
**Recharts 3.10.1 (MIT)** em subpath próprio (`@aurea-uds/react/chart`) com peer **opcional**,
no molde do `DataGrid`. O registro completo do que foi medido está no
[`REFERENCES.md`](../../docs/REFERENCES.md); em resumo:

- **A decisão se confirmou sozinha:** duas das quatro referências (shadcn/ui e Untitled UI
  React) envelopam o MESMO motor, e nenhuma das quatro escreve um. Base UI e Kibo não têm
  gráfico.
- **Escopo menor que o do shadcn:** o `ChartConfig` não entrou (o payload do motor já traz
  `name` e `color` — medido), o par `Tooltip`/`TooltipContent` virou uma peça só (o Recharts 3
  reconhece um componente nosso como filho — medido, e fixado em teste porque o 2 não
  reconhecia), e não há prop de altura (check 23).
- **Nenhum nome de classe do Recharts entrou no core.** A pele é escrita contra ELEMENTO
  (`.chart svg line`, `.chart svg text`) — classe de terceiro no core reprovaria o check 15, e é
  a mesma razão pela qual a pele do `CodeEditor` vem pelo tema do CodeMirror.
- **`.chart` deixou de ser resíduo:** a classe estava na lista `catalogo` do
  `core-boundary.json` (regra órfã do mockup do `apps/docs`) e agora tem componente. A lista
  encolheu, que é a direção permitida.

**Três defeitos que a medição achou, e que nenhuma referência apontaria:**

1. **O Recharts 3 não renderiza no servidor** — `renderToStaticMarkup` devolve 127 bytes, sem
   `<svg>` (regressão conhecida do 3.0, recharts#5997, sem correção no 3.10.1). O catálogo é
   HTML estático, então o preview do gráfico seria uma caixa vazia. Saída: um bloco **PRERENDER**
   no `build-catalog.mjs` que monta num DOM real (`jsdom`, que já era dependência de teste) e
   grava o HTML; a entrada de conteúdo pede com `prerender: true`, do mesmo jeito que `embed:
   true` já pedia iframe. O gerador **morre** se um prerender montar sem produzir `<svg>`.
2. **A foto saía rígida.** O motor congela a largura medida no style, e ele põe um calço de 0×0
   entre as duas caixas — medido no navegador a 375px: a caixa dava 245px e o desenho de 640px
   saía cortado. O prerender solta as duas caixas; o `<svg>` tem viewBox e escala.
3. **A legenda sai em ordem alfabética por `dataKey`**, não na ordem de declaração das séries
   (medido nos dois sentidos). Não dá para corrigir de dentro — a legenda recebe o payload
   pronto. Ficou documentado na ficha, com a saída (`payload`), e **fixado num teste** que
   reprova se o motor mudar em qualquer direção.

**Lote 4 fechado em 01/08/2026** — `Calendar`, sobre **react-day-picker 10.0.1 (MIT)** em subpath
próprio (`@aurea-uds/react/calendar`) com peer **opcional**. Registro completo no
[`REFERENCES.md`](../../docs/REFERENCES.md); em resumo:

- **Houve decisão de motor porque a resposta barata não existia:** o **Base UI não tem**
  calendário nem campo de data — medido na lista de exports do `1.6.0`, a versão mais recente.
  Das outras três referências, o shadcn/ui usa react-day-picker, o Untitled UI usa React Aria
  (recusado: segundo motor headless ao lado do Base UI é padrão paralelo) e o `calendar` do Kibo
  é **calendário de eventos**, outro componente.
- **Ele renderiza no servidor** — 8618 bytes, `<table>` de verdade, 42 células. Ao contrário do
  Recharts, então o catálogo **não** precisou de prerender. Essa foi a primeira coisa medida, e é
  a lição do Lote 3 sendo cobrada antes de escolher.
- **Não existe `DatePicker`**, e é decisão: seletor de data é `Popover` + `Calendar`, o shadcn
  também não tem componente-raiz para isso, e a composição virou **pattern**
  (`content/patterns/Calendar.mjs`, três previews).
- **Três nomes renomeados, não 21.** O motor tem API de tema própria (`classNames`); só a raiz, o
  embrulho dos meses e o rótulo do mês precisam de nome. O resto da pele é ELEMENTO e `data-*` —
  e atributo não é classe, então o check 15 nem o vê.
- **O `Temporal` foi pesquisado e ficou de fora**: Stage 4 em março/2026 e no ES2026, mas o
  **Safari estável ainda não tem**. Biblioteca publicada não põe na API pública um tipo que falta
  num navegador. Fica `Date`.

**DEFEITO QUE SÓ A CI ACHOU, e virou o check 25.** O preview do calendário lia o RELÓGIO: o mês
estava congelado, o `today` não, e `data-today` caía numa célula diferente a cada dia. Local
passava; no runner, onde já era 2 de agosto enquanto aqui ainda era 1, o `dist == build`
reprovou. Catálogo é HTML **gerado e commitado** — preview que lê a data muda de arquivo sozinho
e reprova amanhã, com um diff que não diz nada a ninguém.

Corrigido congelando `today` junto com o mês nos três previews e no fixture do `skin.spec`. E
virou trava: o **check 25** reprova `new Date()` sem argumento e `Date.now()` dentro de
`apps/catalog/content/`. Provado contra o defeito — reintroduzir a data do sistema no
`patterns/Calendar.mjs` reprova nomeando o arquivo. É geral, não é sobre calendário.

**ACHADO — regra de ELEMENTO não é gateada. FECHADO em 02/08/2026.** Os checks 15 e 18 comparam
CLASSE. As cinco regras da tabela de dados (`table`, `th,td`, `th`, `tr:last-child td`,
`tbody tr:hover`) não têm classe nenhuma, então **nenhum dos dois as enxerga** — e valiam para
toda `<table>` do documento, inclusive a de um consumidor. O calendário nasceu com 720px de
largura por causa delas, e o cabeçalho de dias herdou a faixa cinza, a caixa alta e o
espaçamento de letra de um cabeçalho de tabela de dados. Quem achou foi o navegador, não gate.

A pergunta que o protocolo exige, respondida antes de corrigir — **quem mais tem esse
problema?** Medido: o `Table` embrulha em `.table-region` e emite `.table` na tabela; o
`DataGrid` embrulha em `.table-wrap`; o conteúdo do catálogo usa o componente; e as **3** tabelas
da página legada estão **todas** dentro de `.table-wrap`. Nenhuma `<table>` do repositório ficava
descoberta, então escopar era seguro.

Escopado. **O gate de pixel acusou ZERO mudança nas 48 baselines** — que é a prova de que a
regra só alcançava quem já a queria. E o desfazimento local que o Lote 4 tinha escrito no
calendário saiu junto: o que sobrou lá é desenho, não antídoto.

Dois ganhos que vieram de brinde:

- **`.table` saiu da lista `semRegra`** do `core-boundary.json`. Ela estava lá *por causa* desse
  vazamento ("o core estiliza o ELEMENTO table"); some com ele. A lista de exceções caiu de 3
  para 2.
- **O contador de pixel cru passou a descartar comentário**, como os outros eixos já faziam e
  como o próprio `raw-px-baseline.json` já prometia por escrito ("contagem só na FONTE e fora de
  comentário"). A assimetria cobrou na hora: uma frase explicando de onde vinha o 1px do
  navegador foi contada como valor cru e o gate reprovou a prosa. A baseline seguiu em **123** —
  não havia outro falso positivo escondido.

**O que continua sem gate, e agora está escrito:** regra de ELEMENTO no core. Escreva-a escopada,
ou ela é global. Está no `_limite_declarado` do `core-boundary.json`, que é onde alguém procura.

### O que a Parte B entregou (06/08/2026)

**Não há mais ficha em `Draft`.** `STATE.md` mostra `Ready 13 · Stable 63`, e a allowlist
`dimensaoNumerica` do check 23 está **vazia** — o check passou a valer para todo o pacote React
sem exceção nenhuma.

**O B1 não era documentação, era construção — e a medição do passo 1 é que disse isso.** A
`Sidebar` era `<aside>{children}</aside>`. Item, grupo, rótulo de grupo e item atual existiam no
core como `.doc-nav`/`.nav-group`, ou seja **chrome do catálogo** (achado A6): a peça estava no
repositório e não era da biblioteca, então todo consumidor teria de reescrevê-la. Construída sob
o `BUILDING.md`, com as três referências que a têm (shadcn/ui, Untitled UI, MUI) registradas no
`REFERENCES.md`; as outras quatro **não têm** o componente, e isso está medido pasta a pasta lá.
`Sidebar` e `Avatar` entraram em `built-components.json`; `Topbar`, `Status` e `QRCode` **não** —
eles saíram de `Draft` por documentação, e entram junto com os outros no item **E15**.

**Três defeitos apareceram durante a execução, e dois eram dos próprios gates:**

1. **O check 23 reprovou a prosa que documenta a correção que ele mesmo pediu.** O comentário do
   `Avatar` precisa citar a forma antiga (`size` como número) para explicar por que ela saiu, e o
   gate lê o fonte inteiro. **É o mesmo defeito que o check 12 já tinha corrigido do lado do
   CSS**, em 02/08/2026 — a pergunta "quem mais tem esse problema?" tinha uma resposta e ninguém
   a fez na época. Corrigido com o `_sem_comentario` que já existia, e provado nos dois sentidos.
2. **O navegador achou o que gate nenhum via.** A regra do trilho nasceu
   `.app-shell:has(.sidebar-collapsed)`. `:has()` casa com **qualquer descendente**, então a
   página do catálogo que mostra uma lateral recolhida como EXEMPLO, dentro do `<main>`, recolhia
   a lateral **de verdade** do documento — coluna de 264px para 88px numa página que não pediu
   nada. Não havia gate: `sidebar.html` não tem baseline de pixel, e nenhum check olha o efeito
   de um seletor. Corrigido com o combinador de filho; o `skin.spec` ganhou **dois** `.app-shell`
   (um com o trilho aninhado, outro com ele como filho direto) e reprova se o `>` sumir.
3. **O `--sidebar-rail` foi calculado errado na primeira vez.** `4.5rem` cabia o ícone e esquecia
   que a `.sidebar` gasta `--space-4` de margem de cada lado antes de começar; o ícone saía da
   caixa. Medido no navegador → `5.5rem`, e o `skin.spec` passou a cobrar que o ícone caiba.

**O que fica registrado para o E12** — e o registro se pagou, ver a nota abaixo: o check 22 exige
`a11y.role` não-vazio, e o `Status` legitimamente **não tem role** — ele é texto com um ponto
decorativo, e `role="status"` seria uma região viva, que é outra coisa. Quando o **E15** ligar as
travas para os 76, esse caso vai reprovar por uma razão que não é defeito. A saída já tem
precedente no próprio check: o `a11y.keyboard` aceita vazio **quando a ausência está declarada em
`a11y.apg`** (foi o que o `Spinner` ensinou no Lote 1). Não foi feito agora porque nada falha
hoje — mas está escrito para não custar uma sessão depois.

> **Nota de 07/08/2026 — isto acima é o parágrafo mais barato deste arquivo.** A Parte E foi
> medir o que o E12 exigia e encontrou o caso do `Status` **junto com mais onze** (`AppShell`,
> `AureaProvider`, `Badge`, `Card`, `Cluster`, `CodeBlock`, `EmptyState`, `Grid`,
> `MessageComposer`, `Skeleton`, `Stack`), e o mesmo buraco em `states` para outros 27. O
> diagnóstico e a saída já estavam escritos aqui, de graça, porque uma sessão anterior anotou um
> problema que ainda não falhava. Virou o item **E12**, com ~2 h medidas. Anotar o que ainda não
> quebra é o que fez a diferença entre "descobrir" e "executar".

### O que a Parte C entregou (07/08/2026)

**O placar do `02-ACHADOS.md` §0 tem agora DOIS achados abertos**, e os dois são partes do plano:
**M8** (contrato de `props` → Parte E) e **M13** (breakpoints legados → Parte D). Nenhum outro.

**M20 — o teste mudou de lado.** Ele trancava o defeito de propósito desde a Fase 5, esperando uma
decisão; a decisão é a [ADR-0016](../../decisions/0016-segmented-control-e-radiogroup.md), e agora
ele tranca o padrão. O `SegmentedControl` é `RadioGroup` + `Radio` do Base UI — o motor entrega o
padrão APG inteiro, e reescrevê-lo à mão era a alternativa que parecia barata. Provado contra
exatamente ela: um `radiogroup` de mentira passa no teste de semântica e **reprova** no de teclado.

**B7 — o achado estava certo no sintoma e errado na conclusão.** Ele dizia que satisfazer a regra
`region` dependia do consumidor montar o portal dentro do landmark dele, e parou aí. O defeito era
que **ele não tinha como**: o `container` do Base UI existe em todo portal e nunca foi exposto.
`portalContainer` no `AureaProvider` alcança os 11 portais de uma vez, o default não muda, e o
teste novo roda o axe com `region` **ligada** — provado tirando o container só da dica.

**M15 — 70 descrições, e a decisão de não escrever 175.** `theme` e `density` são a camada que se
escolhe; `base` são primitivos, e frase obrigatória ali viraria enchimento — que é pior que
ausência, porque parece contrato. O check 27 cobra por **nome**, não por declaração: exigir a
mesma frase no dark e no light seria o achado I1 se repetindo.

**Uma lição de método, e ela custou tempo nesta sessão:** tentei costurar os 11 portais com um
script de regex. Ele duplicou atributo, deixou variável solta em duas funções e não importou o
hook em dois arquivos. Onze edições explícitas teriam sido mais rápidas e não teriam gerado nada
para desfazer. **Regex não edita código com forma variável** — e o custo de descobrir isso foi
maior que o do trabalho.

**A PARTE C FECHOU EM 07/08/2026. A PRÓXIMA É D OU E** — o
[`PLANO-1.0.md`](../../docs/PLANO-1.0.md) diz que B–E correm em qualquer ordem, F–J dependiam da A e K
é a última. **Nada começa sem `PODE IMPLEMENTAR <parte>`.**

**Antes de começar a próxima, uma pendência da B precisa ser resolvida pelo Victor:** os
baselines `-linux.png` do gate de pixel. Ver o bloco "Verificado verde ao fim da Parte B" no §2.

### O que a Parte A entregou (06/08/2026)

**A1 — 19 dos 22 módulos levam `"use client"` na primeira linha**, que é a posição das
referências (Base UI e shadcn/ui, medidos). Ficam de servidor `disclosure.tsx` (marcação pura),
`index.tsx` (o barril) e o `pure.tsx` novo. Não eram 13 de 20 como a medição de 02/08 dizia: ela
não contava `useAureaStrings` e `useSpriteUrl`, que são hooks e sozinhos fazem cliente o
`data-display`, o `layout`, o `chart` e o `qrcode`. **A lista mudou porque foi medida de novo,
que é o que o item A1 mandava fazer.**

**O defeito uma camada abaixo, que o plano não previa.** Num empacotador de RSC todo export de um
módulo com a diretiva vira referência de cliente — então `cx`, vindo do `internal.tsx` marcado,
seguia importável do barril por um componente de servidor e explodiria ao ser CHAMADO. O que não
tem estado foi para `packages/react/src/pure.tsx`, sem diretiva; o `internal` reexporta e os 19
módulos de cliente não mudaram uma linha de import. O barril importa de lá.

**A2 — check 26, nas duas direções**, e com um quarto critério que o enunciado não tinha:
importação de motor de terceiro que usa estado e **não publica a diretiva**. O `calendar.tsx` não
chama hook nenhum e mesmo assim precisa dela, porque o `react-day-picker` não a publica (medido,
junto com `recharts` e `@tanstack/react-table`; o `@base-ui/react` publica). Sem esse critério a
regra literal aprovava um `calendar.tsx` quebrado — foi a pergunta "quem mais tem esse problema?"
que o achou. Provado contra o defeito quatro vezes: diretiva fora do `internal`, fora do
`calendar`, POSTA no `index` (que apagaria o ganho da parte inteira com a CI verde) e na posição
errada (depois dos imports).

**A3 e A4 — as duas aplicações de prova, e as duas rodam na CI.** `apps/proof-server` é Next.js
16.3.0, App Router, `output: "export"`: o build **renderiza** os componentes de servidor e grava
o HTML, e a CI confere o HTML — inclusive o `cx()` chamado no servidor. Provado contra o defeito:
tirando a diretiva de `internal.js`, o `next build` morre apontando
`internal.js → index.js → page.tsx`. `apps/proof-client` é um SPA em Vite, e o
`tests/visual/proof-client.spec.ts` cobra o que só o navegador mostra — que hidrata e que o
estado responde ao clique. Provado contra duas injúrias: sem a folha do core o raio cai de 22px
para 0, e com o Toggle inerte o `aria-pressed` não muda.

**A prova A3 achou um defeito que não é de fronteira, e ele foi corrigido na raiz.** Nem
`@aurea-uds/core` nem `@aurea-uds/fonts` declaravam a condição `types` do subpath `./css`:
`import "@aurea-uds/core/css"` reprovava com **TS2882** em QUALQUER consumidor TypeScript — e não
é aviso, é erro de compilação. Medido nos dois empacotadores, com TS 7 e
`moduleResolution: "bundler"`. Os dois pacotes passaram a emitir um `.d.ts` no `dist`. É o tipo de
coisa que só aparece quando alguém consome o pacote de fora, que é para o que as provas existem.

**Uma armadilha de ferramenta que vale registrar:** ao instalar as provas, o pnpm 11 gravou
sozinho um `minimumReleaseAgeExclude` no `pnpm-workspace.yaml` para aceitar um `vite` publicado
**naquela hora**. Isso é afrouxar uma política de supply-chain por causa de um app de prova.
Desfeito: as duas provas fixam versão EXATA das ferramentas, o `vite` voltou para a 8.1.5 que o
lockfile já tinha, e o `pnpm-workspace.yaml` não mudou.

Em 02/08/2026 a fila mudou de dono. O inventário de demanda real, que estava marcado aqui como
próximo passo, **foi feito** — e o que ele mostrou é que esperar por pedido estava custando caro:
cada peça faltante virava interrupção no trabalho de quem depende da biblioteca. O Victor decidiu
o contrário, e está registrado na
[ADR-0015](../../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md): até a `1.0`, a fila é
**cobertura do contrato**, não demanda puxada. O `BUILDING.md` §5 está suspenso.

O que falta virou **11 partes com checkbox** no [`PLANO-1.0.md`](../../docs/PLANO-1.0.md), que passou a
estar na ordem de leitura obrigatória do `CLAUDE.md`. **A autorização agora é por PARTE.**

**Por que a Parte A vinha primeiro, e sozinha** (histórico, resolvido em 06/08/2026): o pacote não
tinha nenhuma diretiva `"use client"`, e o barril reexportava um `createContext`. Medido em
02/08/2026 — isso quebrava o import em qualquer aplicação com componentes de servidor, e quebrava
do lado de quem consome. Enquanto ela não fechasse, nenhuma outra parte tinha para quem entregar.

A candidata que estava aqui — escopar a regra de elemento `table` — **foi feita em 02/08/2026**
e está descrita acima. Não há tarefa técnica pendente fora do inventário.

**Pendências que não são lote:**

1. **Trusted publisher** de cada um dos seis pacotes em `npmjs.com` (*Settings → Trusted
   publisher*: `victor1mor`, `aurea-uds`, `ci.yml`, ambiente vazio). É a metade da
   [ADR-0013](../../decisions/0013-mecanica-de-publicacao-npm.md) que falta; até lá, publicar
   é ato manual.
2. **`Avatar.size` e `QRCode.size` são `number`** — dívida declarada na allowlist do check 23,
   que só encolhe. Trocar por escala de token é **quebra de API** e, com a biblioteca
   publicada, exige o Victor (`BUILDING.md` §3).
3. Os achados abertos por decisão: **M8** (o maior — 51 componentes sem `props`/`features`/
   `examples`), M13, M20, B7.

**O gate de pixel do Lote 3, e como ele fechou.** O lote moveu pixel de propósito: três
componentes novos são três linhas novas no índice gerado, e a página cresceu de 4054px para
4156px. O gate reprovou `index` e `topo` nos dois temas — quatro screenshots, e **só esses**.

O caminho do Linux foi percorrido inteiro em 01/08/2026, e é este:

```bash
gh workflow run ci.yml -f update_snapshots=true
```

Depois `gh run download <id> -n playwright-snapshots-linux`, copiar para `tests/visual/` e
commitar. O artefato traz **as 48**; o `git status` depois da cópia mostrou **as mesmas 4** que
tinham reprovado no Windows — e essa coincidência é a verificação que importa: se a pele nova do
`.chart` tivesse mexido em alguma outra página, teria aparecido uma quinta.

**Cuidado que continua valendo:** o gate de pixel BLOQUEIA desde a Fase 10. A Fase 11 não
precisou regerar porque não moveu pixel; a próxima mudança que mover exige o caminho do Linux —
`gh workflow run ci.yml -f update_snapshots=true`, esperar, `gh run download <id> -n
playwright-snapshots-linux`, copiar para `tests/visual/` e commitar. Regenerar só o `-win32`
local não ativa nada e não conserta a CI.

**E a condição pendente da [ADR-0009](../../decisions/0009-modelo-push-e-travar-depois.md):** a
trava do modelo push ainda não tem válvula de escape escrita. Não é fase; é uma decisão do
Victor que falta.

Duas fases que o plano original não tem, e que precisam entrar antes do uso real:
**distribuição/publicação** (decidido: npm público, escopo `@aurea-uds`, **depois** da Fase 9 —
que já fechou, então o caminho está livre assim que a 10 e a 11 saírem) e a **trilha nativa**
(`@aurea-uds/native` não existe; para React Native só os tokens atravessam).

**Critério de continuidade** (como a próxima sessão sabe que pode começar): árvore limpa depois
de `pnpm build`, `python scripts/validate.py` OK com **26 checks**,
`node scripts/check-pack.mjs` OK, `pnpm test` **194/194** e `pnpm exec playwright test`
**87/87**. Se qualquer um estiver vermelho, o vermelho é a tarefa.

O `pnpm build` agora termina construindo o SPA da prova A4 (`build:proof-client`) — é barato e o
teste do navegador não pode rodar contra saída velha. A prova A3 (`build:proof-server`, Next) fica
**fora** da cadeia por custar ~30 s; a CI a chama por nome, depois do passo de árvore limpa.

**E leia o [`BUILDING.md`](../../docs/BUILDING.md) antes do primeiro edit.** Ele é o procedimento:
as quatro referências locais, medir o nosso primeiro, consultar só o componente da vez,
pesquisar antes de acrescentar qualquer coisa que não veio da medição, e escopo menor que o da
referência. Os dois primeiros lotes acharam **sete** defeitos seguindo isso — três deles em
código que eu mesmo tinha acabado de escrever.

**E agora existe um critério novo, que não existia antes de 31/07/2026:** a biblioteca está
publicada. Toda mudança de API é mudança que alguém pode já estar consumindo — a partir daqui,
quebrar exige nota no changelog, e a [ADR-0014](../../decisions/0014-primeira-versao-publica-0-1-0.md)
diz o que `0.x` permite e o que não.

**Nada começa sem `PODE IMPLEMENTAR`.**
