# ADR-0048 — Ordem estrutural e geometria são eixos separados; nada reordena o desenho sem reordenar o documento

> 🔴 **RENUMERADA de `ADR-0020` para `ADR-0048` em 14/09/2026.** O número `0020` estava
> **DUPLICADO** — duas ADRs diferentes o carregavam, e a mais antiga fica com ele. O link sempre
> resolveu (o nome do arquivo é único); a MENÇÃO em prosa, não: *"ver a ADR-0020"* não dizia qual
> das duas, e este repositório cita ADR por número em dezenas de lugares. **A decisão, a data e o
> conteúdo não mudaram** — só o identificador.


- **Data:** 22/08/2026
- **Estado:** aceita
- **Autoria:** decisão do Victor ao recusar o `G-A11Y-06` como mitigado — *"minha prioridade não é
  preservar API nem minimizar trabalho; é construir a melhor fundação possível antes da 1.0"*
- **Obriga:** `tests/visual/adorno-estrutural.multi-motor.spec.ts` (7 casos × 3 motores) ·
  `tests/visual/ordem-de-foco.spec.ts` (varredura sistêmica) · `tests/unit/eixos-layout.test.tsx`
  · `tests/unit/responsivo.test.tsx`

## A regra

> **Ordem lógica e geometria são dimensões independentes, e a API as declara separadamente.**
>
> **Nada reordena o desenho sem reordenar o documento.** Onde houver conteúdo interativo:
> `ordem visual == ordem do DOM == ordem de tabulação`.

## O problema

`InputGroupAddon.align` tinha quatro valores — `inline-start`, `inline-end`, `block-start`,
`block-end` — e eles **achatavam duas dimensões independentes** num enum só:

```text
ORDEM LÓGICA   start | end        ← pertence antes ou depois do controle
GEOMETRIA      inline | block     ← ao lado ou em faixa própria
```

E a ordem lógica virava desenho por `order:` no CSS. `order` reordena a caixa e **não** o
documento, então um adorno com conteúdo focável numa faixa oposta à posição dele no DOM aparecia
antes do controle e era tabulado depois. **WCAG 2.4.3 (Focus Order), nível A.** Medido:

```text
inline-end   DOM/foco: campo → botao   visual: campo → botao   ok
block-start  DOM/foco: campo → botao   visual: botao → campo   DIVERGEM
block-end    DOM/foco: campo → botao   visual: campo → botao   ok
```

**Zero ocorrências reais** — 35 grupos de campo no catálogo, 4 adornos com conteúdo focável, todos
em posição coerente. E foi justamente por isso que o Victor mandou corrigir agora: *"zero
ocorrências significa que este é o momento mais barato para corrigir corretamente"*.

## A decisão

```tsx
side="start" | "end"                    // ESTRUTURAL — decide o DOM. NÃO é responsivo.
layout="inline" | "block"               // VISUAL — geometria. É responsivo.
```

E o `InputGroup` **coloca os filhos**: adornos `start`, controle, adornos `end`. A ordem dentro de
cada lado é preservada. Separar os eixos não bastaria — alguém ainda poderia escrever o adorno
`start` depois do controle —, então o grupo produz a árvore certa, e a tabulação segue a árvore.

**`side` não é responsivo, e isso é decisão, não omissão.** Trocar `start`/`end` por largura
mudaria a sequência lógica, que é outra coisa que trocar `inline` por `block`. Se um dia aparecer
caso legítimo, ele passa por análise própria e por uma implementação que mude a **estrutura real**
— não a pintura. Complexidade não entra no primitive sem evidência.

## Alternativas, e por que foram rejeitadas

**Manter o gate de detecção e chamar de mitigado.** Recusado pelo Victor: mitigação não elimina a
causa, e o defeito continuaria representável.

**Trocar `order` por `grid-area`.** É o mesmo defeito com outro nome — o Victor antecipou e
proibiu: *"se você remover `order` e usar `grid-area` para continuar desenhando fora da ordem do
DOM, o defeito arquitetural continua"*.

**Renderizar o adorno duas vezes e mostrar um por breakpoint.** Proibido: DOM duplicado, ids
duplicados, estado duplicado, foco escondido, formulário confuso. Um nó lógico, sempre.

**`tabindex` positivo para consertar a tabulação.** Reordena a tabulação de um jeito que nem o DOM
nem o desenho contam, e quebra a página inteira, não só o grupo.

**Compatibilidade eterna com `align`.** Recusada: *"quero sair dessa atividade com a API correta,
não com duas APIs"*. Estamos antes da 1.0.

## Consequências, inclusive os custos

**Quebra de API.** `align` deixou de existir. A migração é mecânica e foi aplicada por codemod em
todos os consumidores: `inline-start` → `side="start" layout="inline"`, e assim por diante.
Registrada no `CHANGELOG.md`.

**`order` saiu do core inteiro.** Varrido: era a única ocorrência, nas seis regras do adorno. A
varredura sistêmica cobriu também `flex-direction:*-reverse` (zero), `grid-area` (zero),
`grid-auto-flow:dense` (zero) e colocação explícita de grid (13, nenhuma reordenando interativo).

**Dois defeitos de acoplamento apareceram ao mexer, e os dois eram do mesmo tipo — CSS decidindo
por CLASSE onde a camada responsiva decide por PONTO:**

1. `inline` nasceu sem corpo, só com as regras compostas de recuo. Como `block` põe
   `inline-size:100%`, um `inline` vazio não desfazia nada: no contêiner largo o adorno ficava em
   faixa, com a classe certa e o desenho errado. **Valor de eixo que não diz o que é só funciona
   enquanto for o primeiro.**
2. A quebra de linha do grupo vinha de `:has(.input-group-addon-block)`, e `:has()` enxerga a
   classe, não a geometria efetiva — com `layout` responsivo a classe permanece. A correção tirou
   a geometria do `:has()`: o grupo sempre pode quebrar, e quem quebra é o adorno de 100%, que é
   consequência da largura dele e acompanha a camada sozinho.

**O que a segunda correção custou, e como foi contido:** ligar `flex-wrap` no grupo era
exatamente o que um comentário antigo do core proibia, porque o que transborda passaria a quebrar.
A contenção é a base **zero** do controle (`flex:1 1 0`): com base `auto` ele resolve para o
`width:100%` que o campo já tem e enche a linha sozinho. Medido — sem a troca, os dois adornos
caíam para a linha de baixo num contêiner de 900px — e há teste de navegador cobrando que um grupo
só com adornos em linha continue numa linha só.

**O que se ganhou:** o estado defeituoso deixou de ser representável. Não há combinação de props
que produza ordem visual diferente da ordem de foco, porque a ordem visual **é** a ordem do DOM.

## Quando revisar

Quando aparecer um caso medido em que `side` precise mudar por largura — e aí a pergunta é se a
estrutura pode mesmo mudar em runtime sem quebrar foco, e a resposta vem por medição, não por
conveniência. E se algum componente novo precisar de reordenação visual, ele passa por esta ADR
antes: a varredura de `ordem-de-foco.spec.ts` é sistêmica de propósito.
