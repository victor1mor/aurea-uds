# ADR-0019 — Três motores na suíte, pixel num só, e a gaveta passa a gerir o próprio foco

**Data:** 09/08/2026
**Estado:** aceita
**Contexto:** item K1 da Parte K do [`PLANO-1.0`](../docs/PLANO-1.0.md) — Firefox e WebKit.

## O problema

A suíte visual rodava **só em Chromium** — uma linha em `playwright.config.ts`. O enunciado do K1
diz por quê isso não serve: *"uma biblioteca publicada que nunca abriu no Safari não sabe se
funciona no Safari"*.

## Decisão 1 — Os sete specs de MEDIÇÃO rodam nos três motores; os dois de CAPTURA, num só

`catalog.spec` e `matrix.spec` comparam pixel e ficam no Chromium. Três razões, medidas:

1. **`maxDiffPixels: 0` mais motor diferente é reprovação garantida.** Rasterização, hinting e
   sub-pixel são de cada motor. A Parte D já mediu isso dentro de UM motor: a Debian pura
   reprovava 45 capturas que o contêiner oficial passava.
2. **Baseline por motor multiplicaria as 44 por três** — por seis, contando os dois SOs. Cada
   mudança de UI passaria a exigir seis regravações, e as `-linux` já dependem de um contêiner
   noutra máquina.
3. **Não acrescentaria informação.** Se um motor desenhar diferente E isso importar, quem pega é
   a medição — `geometry`, `skin` e `catalog-sweep` leem caixa, estilo computado e rolagem
   lateral, que é onde diferença de motor vira DEFEITO em vez de virar outro pixel.

**Um teste ficou escopado ao Chromium por impossibilidade, não por escolha:** o que lê
`aria-expanded` implícito na árvore de acessibilidade. O protocolo que a expõe (CDP) não existe
fora do Chromium. Escopar declara onde a medição é possível; um `expect` que não pode rodar seria
cobertura de mentira.

## Decisão 2 — A gaveta do `AppShell` passa a gerir o próprio foco

**O que a troca de motor revelou, medido abrindo a gaveta e dando oito Tabs:**

| | Chromium | WebKit |
|---|---|---|
| foco ao abrir | fica no disparador | vai para o `<body>` |
| primeiro Tab entra na gaveta | sim | **nenhum dos oito** |
| Escape devolve o foco | sim | não |

No WebKit a gaveta abre, fica visível, e o Tab passeia pelo conteúdo da página sem nunca entrar
nela. **Quem navega por teclado no Safari abre a navegação e não consegue alcançá-la** — WCAG
2.1.1, barreira e não incômodo. E alcança todo consumidor: o popover está em
`packages/react/src/layout.tsx`, na biblioteca, não no catálogo.

O `AppShell` afirmava por escrito que *"o navegador entrega … a volta do foco para ele ao
fechar"*. Entregava — num motor só, e ninguém tinha como ver. É exatamente o que o cabeçalho do
`shell-nav.spec` já temia: **garantia de plataforma que ninguém verifica é garantia que some sem
nada ficar vermelho.** O temor se cumpriu não numa atualização, mas numa troca de motor.

**A decisão:** o foco vira responsabilidade nossa, **igual nos três motores** — em vez de
detectar qual navegador falha, que seria uma lista para manter e para envelhecer.

**O custo, declarado:** o shell deixou de ser *"sem uma linha de JavaScript"*, que era uma
propriedade que este repositório exibia com orgulho. Publicar barreira de teclado custa mais.

**Por que as mesmas cinco linhas existem em dois lugares** (`packages/core/src/aurea.js` e
`layout.tsx`): são dois RUNTIMES, não dois desenhos. O do core é delegado e serve página estática
e consumo vanilla — é o que o catálogo carrega; o do React serve quem instala só o
`@aurea-uds/react`, que importa o CSS do core e nunca o JS dele. Rodar os dois é inofensivo:
focar o mesmo elemento duas vezes não faz nada.

**O foco vai para a GAVETA, não para o primeiro link:** quem chega ouve o nome da região antes da
lista, e o Tab seguinte entra na lista sem pular nada. E o retorno **só acontece se o foco ficou
órfão** — se a pessoa já o moveu, puxá-lo de volta seria roubo.

## Decisão 3 — A gaveta continua NÃO-MODAL, e o Tab que escapa no WebKit é limite declarado

**Decidida pelo Victor em 10/08/2026**, sobre a lacuna que esta ADR deixou aberta em 09/08.

**O que ficou medido em 09/08:** no WebKit o Tab escapa do popover a partir de **qualquer**
elemento de dentro — rastro de `focusin`/`focusout`, foco no primeiro link da gaveta, um Tab, e o
foco sai para um botão de fora. O motor não põe conteúdo de popover na navegação sequencial do
documento. Fechar isso exige **prender o foco** enquanto a gaveta está aberta, ou seja, torná-la
**modal**.

**A decisão é não tornar.** O `layout.tsx` declara não-modalidade de propósito — *"o foco não fica
preso, e por isso não declaramos modalidade que não entregamos"* — e prender o foco mudaria o que
o componente é para fechar uma diferença de um motor. O que a Decisão 2 garantiu **nos três** é o
que a gaveta promete: abriu, o foco está dentro; fechou, o foco voltou ao disparador.

**O limite fica escrito onde ele vive**, não só aqui: no `shell-nav.spec`, ao lado da asserção que
deliberadamente não existe. **O teste não cobra o que não é verdade nos três** — escrever a
asserção do Tab e pulá-la no WebKit seria fingir cobertura; escrevê-la sem cumprir seria vermelho
permanente.

**O que reabre esta decisão:** o WebKit passar a sequenciar conteúdo de popover (aí não há nada a
decidir — o comportamento converge sozinho), ou uma medição de uso que mostre pessoa presa. Não
reabre por preferência.

## Alternativas recusadas

**Deixar como estava e declarar limitação do WebKit.** Recusada: acessibilidade básica não entra
na lista de coisas que se simplifica. Gaveta aberta e inalcançável por teclado é barreira.

**Corrigir só no WebKit, por detecção de motor.** Recusada: vira lista de exceções para manter, e
a próxima diferença aparece num motor que ninguém previu. Comportamento igual nos três é menos
código e menos surpresa.

**Trocar o popover nativo por um overlay de biblioteca.** Recusada por desproporção: o nativo
entrega Escape, clique fora e `aria-expanded` corretamente nos três; o que falta é foco, e foco
são cinco linhas.

## Consequência

`playwright.config.ts` passou de 61 para **131 testes**. E a suíte tem uma pendência honesta: o
Firefox **não foi verificado**, porque não inicia nesta máquina Windows — o log de eventos aponta
a assembly `mozglue` do próprio Firefox, os 59 arquivos estão íntegros e a reinstalação forçada
não resolveu. Ele se verifica no contêiner oficial do Playwright, que é o caminho que este
projeto já usa para as baselines `-linux` e é onde a CI roda.
