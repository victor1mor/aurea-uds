# Como se constrói um componente da Aurea

**Para qualquer pessoa ou IA que vá criar ou mudar uma peça da Aurea.** É o processo que a sessão de trabalho usa hoje,
passo a passo, na ordem. Reescrito em 23/11/2026 (o Victor: *"pode reescrever o BUILDING.md"*): a versão de 07/10/2026
descrevia referências e travas que não existem mais. A história de cada regra fica no [`CLAUDE.md`](../CLAUDE.md) e no
[`CHANGELOG.md`](../CHANGELOG.md); aqui está só o que fazer.

Quem decide é o **Victor**. Quando um passo disser "pergunte", é a ele.

---

## 0. Antes de tudo

### Leia, nesta ordem

1. O [`CLAUDE.md`](../CLAUDE.md), seções **1** (duvidar de si mesmo; medir, não lembrar), **2** (as referências), **5**
   (a identidade, que não se toca) e **6** (os nomes privados).
2. O [`STATE.md`](../STATE.md) — os números do projeto. É gerado; nunca se conta à mão.
3. O [`MAP.md`](MAP.md) (onde mexer), o [`QUALITY.md`](QUALITY.md) (quando está pronto), o
   [`DIRECTION.md`](DIRECTION.md) (nome e categoria) e, se a peça existe no celular, o [`NATIVE.md`](NATIVE.md).
4. As [`decisions/`](../decisions/README.md). **Decisão registrada não se reabre** sem evidência nova.

### O que mora FORA do repositório (peça ao Victor; nunca escreva no repositório)

- **O documento de referências** (`REFERENCIAS-DE-CONSTRUCAO.md`): quais são as referências de desenho, a ordem, onde
  ler cada uma e a licença. Sem ele, não se constrói peça que a referência tem.
- **O status de cada item** (`STATUS-1.0.md`) e o roteiro `conferir-status.py`: antes de perguntar qualquer coisa ao
  Victor, confira se ele já não decidiu. Só o que o roteiro responde "PODE PERGUNTAR" vira pergunta.
- **As duas listas privadas**, `.nomes-privados` e `.referencias`, na raiz da pasta de trabalho. O `validate.py` reprova
  sem elas. Numa cópia de trabalho, copie as duas **sem abrir**; nunca as mostre, nunca as envie.

### As três proibições que mais custaram caro

1. **Nome de biblioteca de referência não entra em nada que a Aurea publica** — código, comentário, site, pacote,
   commit, pedido de junção. Escreva "a referência", "a nº 1". O check 1b cobra. (Nome de COMPONENTE igual ao dela pode.)
2. **Peça que já existe não se altera nem se exclui.** O que for novo entra como **variação** (uma prop ou um valor
   novo). "Consertar" também é alterar: pergunte antes.
3. **Nada de memória de treino.** Versão, API, padrão de acessibilidade, segurança: leia a fonte atual (o pacote, a
   página publicada) antes de afirmar ou construir.

---

## 1. Meça a Aurea primeiro

Antes de abrir qualquer referência, veja o que a peça da Aurea faz **hoje**, no navegador:

- Suba o servidor local (o `aurea-main` do `.claude/launch.json` serve a pasta do repositório) e abra a página da peça
  no site (`apps/catalog/<peça>.html`).
- Meça com o teclado e o mouse de verdade, e leia as medidas com `getComputedStyle` — não com os olhos. Evento simulado
  por código engana o motor; o primeiro toque de tecla depois de trocar de página às vezes se perde: repita.
- Anote o estado de cada coisa: passar o mouse, apertar, desativado, foco, escolhido, erro; o Esc, o clique fora, para
  onde vai o foco.

Nem toda acusação é da peça: às vezes é a vitrine ou o teste. Meça antes de tocar.

---

## 2. Compare com as referências

### A ordem e o método

- A fila e o endereço de cada uma estão no documento de referências. A nº 1 é a fonte principal de desenho.
- **Leia o código publicado** (o pacote do npm, o arquivo do registro, o CSS) e, quando houver, a página viva de
  exemplos. Se a biblioteca é casca de outro motor, leia o motor também.
- Monte uma **tabela: peça × biblioteca**, cada célula com o que ela faz e o arquivo de onde saiu. Leia a fila inteira e
  as grandes do mercado listadas no documento de referências.
- **Decida pela maioria, e diga a conta** ("9 de 11"). Empate ou quase empate: leve a tabela ao Victor **sem palpite**.
- Faça o trabalho com as ferramentas diretas (ler, buscar, o navegador). Script que decide ou edita por baixo esconde o
  que foi feito — não use.

### O que vem de onde

| O quê | De onde |
|---|---|
| anatomia, partes, nomes, estados, comportamento, teclado | da maioria das referências; a peça da Aurea é **quase idêntica** à da referência |
| medidas (recheio, altura, letra, vão) | **só da nº 1**, escritas com os tokens da Aurea que dão o mesmo número |
| movimento (o que anda, quanto tempo, que curva) | da referência de movimento (no documento de referências), com os tokens da Aurea |
| **a identidade — sempre a da Aurea** | o amarelo e as cores dos temas e das 13 marcas; os cantos (22 no cartão, 32 na folha de baixo, cápsula nos controles); a Inter, a Sora e a IBM Plex Mono; os ícones Phosphor; as densidades; **sem linha**; contraste de 4,5:1, toque de 44, foco visível |

Quando a referência não tem a peça, crie **pensando como ela criaria** (nomes, partes, estados, lista fechada de opções).

### Licença e cópia

- Copiar código **só com ordem do Victor**. Sem ordem, lê-se.
- MIT e Apache-2.0 podem entrar, com o aviso de direitos preservado, crédito no [`REFERENCES.md`](REFERENCES.md) e um
  comentário curto no ponto de uso.
- **Nunca entram**: licença não comercial, AGPL e versões pagas ("Pro") que proíbem uso em biblioteca de componentes.
  Destas, nem com ordem.
- Copia-se estrutura e geometria; nunca a paleta nem a pilha delas. Tudo passa pelos tokens.

---

## 3. Mostre ao Victor ANTES de construir

**Só está aprovado depois que ele VÊ.** Teste verde não é aprovação; foto não é aprovação; número não é aprovação.

1. **Monte a bancada viva**: uma página que roda no navegador com a peça de verdade (o CSS da Aurea), **hoje e a
   proposta lado a lado**, com botões para **Gold e Ember, claro e escuro**. A bancada mora em `node_modules/.bancada/`
   (fora do git) e se abre pelo servidor local. Entregue o endereço **completo** da página.
2. **Abra ao lado a página viva da referência** com a mesma peça.
3. Antes de pedir, confira que o painel do navegador está **à vista** — aprovar sem ver não vale.
4. Cada proposta tem um **nome que diz o que ela faz** ("a dica invertida", "escurece ao apertar"), nunca só uma letra.
   Uma pergunta por decisão.
5. Explique em português comum, sem jargão: o nome técnico vai, no máximo, entre parênteses.
6. Muitas opções? Primeiro um esboço no FigCraft; ele escolhe as finalistas; só elas viram bancada.
7. **Escolher não é aprovar.** Construir espera o "pode", e um "pode" vale só para aquilo.
8. **Decisão dada é só registrar**: anote onde ele decidiu e pare. Não emende outra pergunta.

---

## 4. Construa (depois do "pode")

- Trabalhe numa **cópia** (`git worktree add -b claude/lote-<n> <pasta> origin/main`). A pasta principal fica no `main`:
  o Victor usa a mesma pasta para puxar e publicar.
- Siga a receita do [`MAP.md`](MAP.md): o módulo da categoria; a pele no `packages/core/src/aurea.css` **só com token**
  (número cru é defeito até prova em contrário); a ficha em `packages/contracts/registry/<Peça>.json` (props, estados,
  tokens, acessibilidade); o exemplo na página da peça no site.
- **Quem mais tem esse problema?** Correção local sem essa resposta é proibida. Procure a mesma classe, a mesma regra,
  o mesmo padrão em outras peças — e quem usa a classe sem ser a peça (exemplo: o balão do gráfico usa a classe da dica).
- **A Ember sempre recebe** o que o lote faz, e a bancada mostra a Ember para ele aprovar.
- **O outro alvo:** mudou na web, procure a peça no nativo (`packages/native/src`), e vice-versa. Leve a mudança ou diga
  ao Victor por que não.
- **Movimento novo:** tempo e curva só dos tokens (`--duration-*`, `--ease-*`); só `transform`, `opacity` e cor; sai
  mais rápido do que entra; "reduzir movimento" desliga; o que abre pelo teclado aparece na hora. A tabela de qual token
  usar está em [`animation.md`](../apps/catalog/content/docs/animation.md).
- **Peça independente:** nenhuma depende, escondido, de outra para ter tamanho ou posição.
- ⚠ Texto com barra invertida (`\n`, `\b`) gravado por heredoc do terminal vira caractere de verdade e quebra a
  montagem. Grave pelo editor.

---

## 5. Prove com um teste que reprova o defeito

- Toda mudança de comportamento ou de aparência vem com o teste **no mesmo commit**.
- **Prove contra o defeito**: rode o teste no código de antes (o CSS montado antigo, ou a constante antiga posta de
  volta por um instante) e veja reprovar **pelo motivo certo**. Teste que só concorda com o presente não é teste.
- Escolher a entrada que exercita o código é parte do teste.
- Aparência se prova no navegador (`tests/visual/*.spec.ts`), nos dois temas e na Ember; comportamento, também em
  unidade (`tests/unit/`). O jsdom não lê CSS nem calcula leiaute.

---

## 6. A versão

1. Levante a versão nos **nove** arquivos: o `package.json` da raiz, os sete pacotes e
   `packages/contracts/aurea.contract.json`.
2. Escreva a seção no `CHANGELOG.md` (em português): o que mudou, a decisão do Victor com as palavras dele e a data,
   e "Quem cobra" (os testes, com "reprova no código de antes, medido").
3. Escreva a **nota de versão em inglês** em `apps/catalog/content/releases/vX-Y-Z.md` — só o que muda para quem usa,
   nada do processo. Sem ela, a montagem do site para.
4. Decisão nova de desenho vira uma ADR em `decisions/`.

---

## 7. A conferência

Nesta ordem. Os longos rodam em segundo plano.

```
pnpm build
python scripts/validate.py --write-manifest
python scripts/validate.py --write-state
python scripts/validate.py
npx vitest run
node scripts/exemplos-compilam.mjs
node scripts/check-pack.mjs        (pelo PowerShell; no Git Bash ele reprova à toa)
pnpm exec playwright test <os testes do lote> --project=chromium
```

- `--write-manifest` e `--write-state` regravam e **encerram** sem conferir: cada um sozinho, e depois o `validate.py`
  puro. Só a linha `Aurea validation: OK` prova a conferência.
- Durante o trabalho, só os testes do que mudou. A **suíte inteira do Chromium roda uma vez, no fim**, com o código
  final; o que reprovar, conserta e roda de novo só ele. Reprovação suspeita de ser antiga se mede na versão anterior
  antes de culpar o lote.
- Exemplo do site mudou: a montagem do catálogo e das caixas vivas vem antes do `exemplos-compilam`.

---

## 8. Enviar e juntar

- Commit em português; termina com a linha de coautoria. Pedido de junção em **inglês**, sem nome de referência.
- O envio e o `gh` usam a conta do projeto **só no comando**, sem trocar a conta ativa da máquina.
- Abra o pedido para o `main`, ligue o conserto automático da CI (Auto-fix) e a junção automática (`merge`). O GitHub
  junta quando as seis verificações passam.
- ⚠ **Juntar publica o site.** Por isso a aparência é aprovada pelo Victor **antes** do pedido.
- Mudou o número da versão ou uma peça na foto do catálogo: as fotos `-linux` vencem. Gere pela CI
  (`gh workflow run CI --ref <branch> -f update_snapshots=true`) ou na máquina Linux, **olhe cada foto que mudou** e
  commite só essas.

---

## 9. Publicar e registrar

- **Publicar no npm é só do Victor.** A sessão dispara o `release.yml` (com PUBLICAR), que manda os sete pacotes para a
  área de espera do npm; o Victor aprova lá, com o segundo fator. Logo depois de publicar, o npm atrasa: quem decide é a
  saída da publicação, não uma consulta.
- O **registro** vai no lote seguinte: a marca "Publicada" na seção do `CHANGELOG.md`, a linha e o item no `CLAUDE.md`,
  o `scripts/released-surface.json` do commit publicado, e a release no GitHub (`gh release create vX.Y.Z --target <o
  commit completo da junção>`). Horários sempre no fuso de Brasília.
- Anote o que mudou no documento de achados e no `STATUS-1.0.md`, fora do repositório.

---

## 10. As travas que já cobram

O que dá para cobrar por máquina, cobra. Não desligue trava; se uma bloquear, pare e pergunte.

| Trava | Impede |
|---|---|
| check 1b | nome de referência em qualquer arquivo |
| check 11 | ficha inválida, categoria fora da lista, token que não existe |
| check 12 | número cru novo em espaçamento, raio, fonte — a contagem só cai |
| check 15 · check 18 | classe no core que nenhum componente produz · classe que o React emite sem regra no core |
| check 22 | ficha sem `props`, `states`, `tokens` ou acessibilidade |
| check 23 | prop de tamanho declarada como número |
| check 24 | peça sem a pele medida em `tests/visual/skin.spec.ts` |
| check 26 | módulo do React sem `"use client"`, ou com ele sobrando |
| checks 31 · 31b | componente ou frase nova sem nota no `CHANGELOG.md` |
| checks 48 · 49 | ficha que promete plataforma ou estado que o código não tem |
| `sem-linha.test` e a varredura do catálogo | borda com cor, em qualquer estado |
| `catalog-sweep` | página que rola de lado, contraste (axe), texto a 200%, console |
| as fotos (`-linux`) | mudança visual não deliberada |
| `check-pack.mjs` | arquivo que não devia ir no pacote |
| `exemplos-compilam` | trecho de código do site que não compila |

O `validate.py` tem mais de 50 checks; a lista completa é o próprio arquivo.
