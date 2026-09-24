# ADR-0018 — Os estados universais são um eixo à parte, e são sete

**Data:** 09/08/2026
**Estado:** aceita
**Contexto:** Parte J do [`PLANO-1.0`](../docs/PLANO-1.0.md) — os estados universais.

## O problema

O contrato descreve condições que **nenhum componente da Aurea sabia representar**: esperando
pessoa, esperando aprovação, sem conexão, dado velho, resultado parcial, funcionamento degradado.
São transversais, então sem elas cada aplicação inventa a sua — e a mesma condição aparece de
seis jeitos diferentes na mesma tela.

Ao medir antes de escrever, apareceram duas coisas que o enunciado do plano não previa.

## Decisão 1 — São SETE, não seis

O `aurea.contract.json` descreve estes estados em **três listas que não concordam entre si**:

| Lista | Quantos | O que traz de universal |
|---|---:|---|
| `applicationPatterns.states` | 16 | `partial`, `stale`, `offline` |
| `operationalPatterns.states` | 9 | `waiting_user`, `waiting_approval`, **`waiting_dependency`** |
| `AppShell.states` | 5 | `offline`, `degraded` |

Os seis do plano foram colhidos das três e deixaram **`waiting_dependency`** de fora — que está no
contrato colado nos outros dois "esperando". Nomear dois dos três deixa o terceiro para cada
aplicação inventar, que é o defeito inteiro que a parte existe para fechar.

Os nomes são **os do contrato**, `snake_case` incluído. Traduzi-los para o gosto do TypeScript
criaria o segundo vocabulário e a trava não teria contra o que comparar.

## Decisão 2 — `state` é um eixo próprio, não um valor de `variant`

`Alert` e `Banner` já têm `variant` com quatro nomes: `info`, `success`, `warning`, `danger`.
Isso é **gravidade**. `stale` e `partial` são **condição do dado**.

Acrescentar os sete àquela união poria "obsoleto" ao lado de "perigo" e obrigaria quem chama a
escolher **um**: um alerta de perigo sobre dado velho perderia uma das duas informações. São
eixos porque respondem a perguntas diferentes — *quão grave é* × *o que está acontecendo*.

Então `state` é prop nova, com o mesmo nome nos cinco componentes, e escreve `data-state` no DOM —
que já era o idioma da casa (`.invocation-step[data-state]`, `.cost-meter[data-state]`).
Quem passa os dois manda: só o consumidor sabe se aquele "esperando" dele é grave.

## Decisão 3 — Falam por PALAVRA, e nenhum token novo nasce

**Quinta recusa da mesma coisa neste repositório** — depois das 11 cores por categoria de span
(H.d), das 6 de estado (H.a), das 10 por tipo de nó e das 6 por intenção (H.f).

A medição que fecha o argumento é a de 09/08 no `CostMeter`: `--warning-400` **é**
`var(--brand-yellow)` no tema escuro, então um degrau "de aviso" sai idêntico ao normal. Cor por
categoria numa paleta travada não separa. O sentido fica no texto (WCAG 1.4.1), e a cor que sobra
é a que já existia: `offline` mantém o ponto vazado que sempre teve, os outros seis derivam a
gravidade.

Nenhum dos sete chega a `danger`, e a razão é medida, não estética: **nos sete a tela ainda
serve**. `role="alert"` interrompe quem está lendo, e gastar a única interrupção do leitor de tela
com "o dado talvez esteja velho" é o oposto do que o papel serve.

## O que a trava cobra, e o que ela NÃO cobra

O **check 30** vale nos dois sentidos: ficha que declara um estado universal e não escreve
`data-state` reprova; componente que aceita a união `UniversalState` e publica menos que os sete
na ficha reprova. A lista dos sete é **lida do `pure.tsx`**, nunca copiada — copiá-la seria o
achado I1 dentro do gate que cobra honestidade.

**A primeira versão da regra nasceu forte demais e o gate me desmentiu na primeira execução.** Ela
exigia que quem declarasse um estado universal aceitasse a união, e reprovou o `HealthMatrix`, que
traz `degraded` entre os cinco valores de **saúde** dele. Perguntado *quem mais tem esse
problema*, medido nas 92 fichas: ele é o único — e estava certo. Há duas relações legítimas com um
estado universal:

- **carregar** o estado (o componente inteiro está nele) → recebe a união pela prop `state`;
- **enumerar** a palavra entre valores de domínio → o `degraded` da saúde é o mesmo `degraded` do
  contrato, mesma palavra e mesmo sentido, que é exatamente a convergência que esta parte quer.

Obrigá-lo à união faria uma célula de saúde poder estar "esperando aprovação". O que os dois casos
devem ter em comum é o marcador no DOM, e é isso que se cobra. Corrigir o componente para caber na
trava teria sido a trava mandando no sistema.

## Alternativas recusadas

**Os seis do plano, sem `waiting_dependency`.** Recusada: deixa um estado do contrato sem nome
compartilhado, que é o buraco por onde o vocabulário paralelo volta.

**Acrescentar os sete a `AlertVariant`.** Mais barata — nenhuma prop nova. Recusada por fundir
gravidade com condição, acima.

**Um token de cor por estado.** Recusada pela medição do `CostMeter`, acima.

**Renomear o `state` do `DataGrid` para caber.** Desnecessário: `stale` e `partial` já se chamavam
assim desde a Parte F. `loading` e `error` ficam **específicos da grade** de propósito — nos sete
universais a tela ainda serve, e sem linha nenhuma ela não serve.

## Consequência, e ela é barata de desfazer

Se o Victor preferir seis, sai **uma entrada** da união do `pure.tsx`, uma de cada uma das duas
tabelas de string e o nome das cinco fichas — o gate reaponta sozinho, porque lê a união.
