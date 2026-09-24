# ADR-0023 — O portão de permissão é componente, e o que faltava também era a explicação alcançável

- **Data:** 13/08/2026
- **Estado:** aceita — **corrigida no mesmo dia**, ver "A correção do Victor" abaixo
- **Fecha:** o item **M4** do [`PLANO-1.0.md`](../docs/PLANO-1.0.md) §17
- **Autoria:** medição do Opus, sob a autorização da Parte M

## Contexto

O M4 nasceu de um consumidor real que tem um componente próprio de portão de permissão, e o
enunciado pedia um equivalente na Aurea, com uma trava: *"esconder botão não é segurança — a
ficha tem de dizer isso em voz alta"*.

## A correção do Victor, 13/08/2026 — e ela derruba a primeira metade desta ADR

Esta ADR nasceu dizendo **"portão de permissão não é componente"**, com um argumento só: nenhuma
das cinco referências locais tem um. O Victor cortou na hora: *"não existir referência na pasta
não quer dizer que não é pra criar, deve buscar na internet"*.

Ele está certo, e o `BUILDING.md` §Passo 4 **já mandava fazer isso** — "se aparecer algo a mais,
PESQUISAR na internet, validar que é prática atual". Eu tratei a ausência na pasta como veredito e
pulei o passo. A ausência é um dado; não é a resposta.

**O que a pesquisa devolveu (13/08/2026):** o portão existe, tem nome e é padrão corrente.
`<Can I="read" a="Post">` do `@casl/react`; `useCanAccess`/`usePermissions` do react-admin;
`<AccessGate resource=… mode="any">` repetido nos guias de painel administrativo. E devolveu
também a divisão que virou o desenho: **o CASL só esconde**, o **react-admin deixa escolher**
esconder ou desabilitar.

**Por que as cinco referências locais não têm, então:** porque nenhuma delas é a camada de UI
única de ninguém — são bibliotecas de componente, e autorização é do app. A Aurea é outra coisa:
ela é a única camada de UI dos projetos que a consomem, e a linha `{pode ? … : …}` ia se repetir
em todos, cada um com um critério.

**O que sobreviveu da versão original:** tudo que estava medido — o defeito de foco do `disabled`,
o `<span>` que não resolve o teclado, e o `aria-disabled` que anunciava e deixava clicar. Isso não
dependia da pergunta "é componente?", e continua valendo palavra por palavra abaixo.

## O que a medição achou, antes de escrever qualquer coisa

**Nenhuma das cinco referências tem portão de permissão.** Medido em 13/08/2026, procurando pasta
com nome de permissão, gate, can ou rbac em `ui-main`, `kibo-main`, `react-main`, `reui-main` e
`material-ui-master`: **zero** em todas. Não é lacuna nossa — é que isso não é componente de
biblioteca de interface. `{pode ? <Button/> : null}` é uma linha do consumidor, e uma biblioteca
que a embrulha só troca uma linha por uma dependência.

**O que existe de verdade, e ninguém tinha medido, é o outro lado da moeda:** quando a ação
aparece mas não pode ser usada, a pessoa precisa saber POR QUÊ. E aí havia defeito.

| Medição (13/08/2026) | Resultado |
|---|---|
| `Tooltip` em `<Button disabled>` — foco chega? | **não.** `disabled` tira o botão da ordem de foco |
| … e a dica abre? | **não.** Sem foco não há dica; quem usa teclado nunca lê o motivo |
| Embrulho de `<span>` (o que o MUI documenta) | resolve o **ponteiro**; o span nasce com `tabIndex -1`, então **não** resolve o teclado |
| `aria-disabled` passado pelo consumidor | o atributo chegava ao DOM e **o clique continuava executando** |

A última linha é a mais séria: `aria-disabled` é só semântica, e quem tem de barrar a ativação é
o componente. Era o mesmo defeito que o **AUD-0004** já tinha corrigido no ramo de link — o
`<button>` ficou de fora.

## Alternativas rejeitadas

**Não ter portão nenhum, deixando `{pode ? … : …}` para cada consumidor.** Era a decisão original
desta ADR, e caiu com a pesquisa. O motivo de ela cair não é "o mercado faz": é que a escolha
entre **esconder** e **desabilitar com motivo** é uma decisão de acessibilidade, e deixada solta
ela vira nove critérios diferentes em nove telas. O que se ganha ao centralizar não é a linha —
é a decisão.

**Chamar de `PermissionGate` e aceitar regras, papéis ou políticas.** Rejeitada: a Aurea não sabe
nada sobre autorização e não vai saber. `allowed` é resposta pronta. O nome ficou `AccessGate`,
que é o do padrão pesquisado e não promete um motor que não existe.

**Fazer o `Tooltip` embrulhar sozinho em `<span>`.** Rejeitada: resolve o ponteiro e deixa o
teclado de fora, ou seja, cria a impressão de que o problema foi tratado. É a mesma armadilha do
"gate de nome não é gate de efeito".

## Decisão

1. **Existe o `AccessGate`**, e ele NÃO decide permissão: recebe `allowed` já resolvido. Dois
   modos — `hide` (padrão, o nó sai do DOM) e `disable` (fica visível e inerte). No modo
   `disable` o `reason` é **obrigatório pelo tipo**: dizer "não" sem dizer por quê é pior que
   não mostrar. A ficha repete, em voz alta, que isto não é segurança.
2. **`aria-disabled` passa a significar inerte-mas-alcançável** no `Button`: o controle continua
   focável e anunciado como desabilitado, e o componente barra `onClick`/`onClickCapture`. A pele
   é a mesma de `:disabled`, e as 12 regras de `:hover:not(:disabled)` do core passaram a excluir
   também `[aria-disabled="true"]`.
3. **A escolha entre as duas formas é do consumidor, e a ficha nomeia o critério:** `disabled`
   quando não há nada a dizer; `aria-disabled` quando existe um porquê — e aí a explicação vai
   num `Tooltip`, que agora alcança.

## Como isto é obrigado

Dois testes em `tests/unit/overlays.test.tsx`, provados contra o defeito em 13/08/2026: tirar o
bloqueio de ativação do ramo inerte reprova o segundo. O primeiro é o registro do defeito de
`disabled` — ele **afirma** que o foco não chega, para que ninguém "conserte" isso por engano e
ache que resolveu o teclado.

## Consequências, com o custo

- Um consumidor que já passava `aria-disabled` esperando só semântica **perde o clique**. É
  quebra de comportamento, e está no `CHANGELOG` como tal. Também é a correção de um defeito: o
  controle anunciava-se desabilitado e agia.
- A Aurea não entrega nada sobre autorização, e isso é proposital. Quem esconde ação por
  permissão continua fazendo `{pode ? … : …}`.

## Quando se revisa

Se aparecer caso medido em que o consumidor precise da MESMA regra de esconder/desabilitar em
muitas telas e a linha se repita a ponto de divergir — aí a discussão volta, com a medição junto.
