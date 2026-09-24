# ADR-0045 — Não trocar de motor para obter uma prop antes de provar que o motor atual é incapaz

> 🔴 **RENUMERADA de `ADR-0017` para `ADR-0045` em 14/09/2026.** O número `0017` estava
> **DUPLICADO** — duas ADRs diferentes o carregavam, e a mais antiga fica com ele. O link sempre
> resolveu (o nome do arquivo é único); a MENÇÃO em prosa, não: *"ver a ADR-0017"* não dizia qual
> das duas, e este repositório cita ADR por número em dezenas de lugares. **A decisão, a data e o
> conteúdo não mudaram** — só o identificador.


- **Data:** 22/08/2026
- **Estado:** aceita
- **Autoria:** regra permanente escrita pelo Victor em 22/08/2026, ao responder o `G-AXIS-03`
- **Obriga:** `tests/visual/range-vertical.multi-motor.spec.ts` (a prova nos três motores) e o
  procedimento de triagem do `03-GAPS.md` para todo gap do tipo `missing-axis`

## A regra

> Não trocar primitive/motor para obter uma prop antes de provar que o motor atual é incapaz
> de entregá-la.

## O que a produziu

Ao fechar a primeira metade do `G-AXIS-03` eu registrei, no cartão do gap, que a orientação
vertical do `Range` **"exige trocar o motor"**, porque ele é um `<input type="range">` nativo. E
registrei a mesma coisa para o `Accordion`, que é `<details>/<summary>`.

**As duas afirmações estavam erradas, e nenhuma delas tinha medição atrás.** Elas vieram de uma
linha da matriz do §13 dizendo que três referências têm o eixo e a Aurea não — o que é verdade
sobre a *declaração* e não diz nada sobre a *capacidade*.

### `Range`: o motor nativo entrega

Medido em 22/08/2026 nos **três** motores (Chromium, Firefox, WebKit), na ordem que o Victor
especificou — geometria, teclado, direção, RTL, toque, acessibilidade:

| | Chromium | Firefox | WebKit |
|---|---|---|---|
| caixa vertical | 16×200 | 20×200 | 20×200 |
| teclas que movem | **8/8** | **8/8** | **8/8** |
| `ArrowUp` | 51 | 51 | 51 |
| clique no topo | 100 | 100 | 100 |
| arraste ao topo | 100 | 100 | 100 |
| estável em documento RTL | ✔ | ✔ | ✔ |

Duas propriedades bastam, e cada uma faz uma coisa — as duas descobertas **medindo**, não lendo:

- `writing-mode: vertical-rl` põe o eixo **inline** na vertical, e por isso a altura se dá com
  `inline-size` e **não** com `block-size`. A primeira tentativa usou `block-size` e a caixa saiu
  **deitada** (129×16) nos três motores.
- `direction: rtl` inverte o início do eixo inline para o **topo ser o maior**. Sem ela, medido:
  `ArrowUp` **diminui** e clicar no topo dá **0**. Vai no próprio elemento e não herdada, para o
  eixo não mudar com a direção do documento — *"para cima é mais"* é convenção de instrumento, não
  de idioma.

### `Accordion`: a prop que se ia buscar está **deprecada na origem**

O `orientation` do `Accordion` da Base UI 1.6.0 está marcado `@deprecated`, e o motivo está escrito
no próprio tipo:

> *Deprecated following the [APG guidance update](https://github.com/w3c/aria-practices/pull/3434)
> to remove roving focus. This state no longer affects keyboard focus behavior.*

O inventário da `radix` ainda lista `ArrowUp/Down/Left/Right/Home/End` para o accordion — ele
reflete a orientação **antiga** do APG. Trocar o motor do nosso `Accordion` para ganhar essa prop
seria adotar um padrão que **o próprio padrão removeu**.

E a pergunta que o Victor mandou responder antes de qualquer troca — *o que "horizontal" significa
como capacidade* — tem resposta em duas partes:

1. **Como comportamento** (foco itinerante, seta entre cabeçalhos): **removido do APG**. Não há o
   que ganhar.
2. **Como apresentação** (cabeçalhos lado a lado): medido em 22/08/2026 — três `<details>` num
   contêiner flex ficam lado a lado (mesmo `y`, `x` crescente), `Enter` no `<summary>` alterna, e
   a semântica de divulgação continua intacta. **É CSS, no componente que já existe.**

## Por que a regra vale além destes dois casos

Trocar de motor não custa uma prop: custa a superfície inteira do componente, o teclado que já
estava provado, o peso da dependência e a compatibilidade do consumidor. Aceitar "a referência
declara e nós não" como razão suficiente inverteria o ônus da prova — e as duas vezes em que eu
aceitei essa razão, **as duas estavam erradas**.

## Consequências

- Todo gap do tipo `missing-axis` passa a exigir, antes de qualquer proposta de troca, a resposta
  a **"o motor atual consegue?"**, com medição.
- Quando a resposta for não, a evidência tem de ser a **limitação concreta** que impede o contrato
  da Aurea, não a ausência da prop na assinatura.
- Quando o eixo vier de um padrão, conferir se o padrão ainda o recomenda. O caso do `Accordion`
  mostra que uma referência pode estar declarando o que a norma já retirou.
