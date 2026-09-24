# ADR-0016 — O `SegmentedControl` é um `radiogroup`, não um punhado de botões alternáveis

- **Data:** 07/08/2026
- **Estado:** aceita e aplicada
- **Fecha:** o achado **M20** da auditoria de 26/07/2026, aberto desde a Fase 5
- **Contexto do plano:** item **C1** do [`PLANO-1.0.md`](../docs/PLANO-1.0.md)
- **Autoria:** decisão do Opus, sob a autorização da Parte C

## Contexto

O `SegmentedControl` nasceu como `role="group"` com um `<button aria-pressed>` por opção. Isso é
uma descrição honesta de **N alternâncias independentes** — e é exatamente o que ele não é.

O que um leitor de tela conseguia dizer, medido: para cada botão, "pressionado" ou "não
pressionado". O que ele **não** conseguia dizer, e é a informação que importa num controle de
escolha única: **quantas opções existem e qual delas está valendo** — o "1 de 2". Nada na
marcação prometia que só uma pode estar ativa.

O padrão APG para escolha única entre poucas opções visíveis é
[`radiogroup`](https://www.w3.org/WAI/ARIA/apg/patterns/radio/). Ele não é só um nome de papel:
carrega **um único ponto de tabulação** para o grupo inteiro (roving tabindex), setas que
**movem e selecionam**, e `Home`/`End`.

A auditoria registrou o defeito e **deliberadamente não o corrigiu**, com a razão escrita:
"trocar isso muda a semântica para quem já consome, e é decisão a registrar, não ajuste". O
teste da época trancava o comportamento defeituoso para que a mudança fosse deliberada. Esta ADR
é a decisão que faltava.

## Alternativas

**A. Deixar como estava.** Rejeitada. A defesa possível seria "não quebrar quem consome", mas o
que se preserva é um contrato que descreve o componente errado. E o custo real da troca é baixo:
as props não mudam, e a pele não muda.

**B. `role="radiogroup"` escrito à mão**, com os `aria-checked` e um roving tabindex nosso.
Rejeitada, e é a alternativa que parece mais barata e não é. Ela reimplementa um *composite* —
foco que anda, seta que seleciona, `Home`/`End`, o que acontece quando um item some — que o
motor que a Aurea **já usa** entrega testado. O `BUILDING.md` §1 diz isto em uma linha: "se ele
já entrega, não escrevemos". E o risco não é teórico: um radiogroup com os papéis certos e sem o
comportamento é *pior* que o defeito original, porque agora ele **promete** o padrão.

**C. `toggle-group` do Base UI.** Rejeitada. Ele é o primitivo de alternância — o mesmo modelo
mental do `aria-pressed` que estamos saindo. Serve para "negrito/itálico/sublinhado", não para
"dia/mês/ano".

**D. `RadioGroup` + `Radio` do Base UI 1.6.** Escolhida.

## Decisão

O `SegmentedControl` passa a ser `RadioGroup` + `Radio.Root` do `@base-ui/react`.

**A API pública não muda:** `items`, `value`, `onChange` e `label` continuam iguais. O que muda é
o que o componente **emite**.

| | Antes | Depois |
|---|---|---|
| Contêiner | `role="group"` | `role="radiogroup"` |
| Opção | `<button aria-pressed>` | `<button role="radio" aria-checked>` |
| Tabulação | uma parada por opção | **uma para o grupo** |
| Setas | nada | movem **e** selecionam |
| `Home`/`End` | nada | primeira / última |

**Um detalhe de implementação que a medição obrigou:** `Radio.Root` renderiza um `<span>` por
padrão, e a pele da Aurea é `.segmented button`. Sem `render={<button type="button"/>}` o
componente perderia a pele inteira — e **nenhum gate veria**, porque o check 18 compara nome de
classe, não elemento. Medido antes de escrever, com `renderToStaticMarkup`.

O motor também emite um `<input type="radio">` escondido por item, para envio em formulário. Ele
é `position:fixed`, 1×1 e `aria-hidden`: não entra no flex do `.segmented` nem na árvore de
acessibilidade.

## Como isso é obrigado

Dois testes em `tests/unit/stable.test.tsx`, e o segundo é o que importa:

1. o grupo é `radiogroup` nomeado, só um `aria-checked="true"` por vez, e **nenhum
   `aria-pressed` sobrou** — os dois modelos convivendo seriam pior que qualquer um deles;
2. **um único ponto de tabulação, e a seta move E seleciona.**

**Provado contra o defeito** (`QUALITY.md` #29): substituindo a implementação por um
`radiogroup` de mentira — papéis renomeados à mão, sem roving tabindex — o teste (1) passa e o
teste (2) **reprova**, apontando "num radiogroup só o item marcado é tabulável: expected 1, got
2". É a alternativa **B** falhando exatamente onde ela falharia na vida real.

## Consequências

**Quebra de semântica em `0.x`, com nota no changelog** ([ADR-0014](0014-primeira-versao-publica-0-1-0.md)).
Quem estiliza por `[aria-pressed]` no CSS próprio perde o efeito; quem estiliza pela classe
`.active` — que é o que a Aurea documenta e emite — não sente nada.

Quem testa com `getByRole("button", {pressed: true})` precisa passar a
`getByRole("radio", {checked: true})`.

**Nenhuma mudança visual.** O elemento continua `<button class="active">` dentro de
`.segmented`, e as três regras de pele continuam casando.

**Custo aceito:** dois `<input>` escondidos por controle no DOM. É o preço de usar o primitivo do
motor em vez de reescrevê-lo, e ele não é visível nem para o olho nem para o leitor de tela.

## Condição de revisão

Se o Base UI publicar um primitivo de *segmented control* com semântica de rádio, reavaliar —
seria o mesmo padrão com menos marcação. Enquanto isso, esta é a montagem mínima que entrega o
padrão APG inteiro.
