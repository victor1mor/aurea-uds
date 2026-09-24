# ADR-0015 — Até a `1.0`, a Aurea constrói por COBERTURA, não por demanda puxada

- **Data:** 02/08/2026
- **Estado:** aceita
- **Suspende:** a regra do [`BUILDING.md`](../docs/BUILDING.md) §5 — *"componente que nenhuma das duas
  superfícies pede espera"* — e o critério de entrada da Fase 6 do `ROADMAP.md`, *"demanda real
  de um consumidor"*
- **Reabre até:** a `1.0` sair. Depois dela, a regra de §5 volta a valer.
- **Autoria:** decisão do Victor em 02/08/2026

## Contexto

A [ADR-0009](0009-modelo-push-e-travar-depois.md) já tinha escolhido o **modelo push** — construir
na Aurea e travar. O `BUILDING.md` §5, escrito no dia seguinte, disse o contrário em uma linha:
componente sem pedido concreto espera. As duas conviveram porque, até aqui, o que faltava era
pequeno e a fila era curta.

Deixou de ser. A medição de 02/08/2026 mostrou o custo real da regra de espera:

- **16 nomes** da camada operacional existem no contrato e **não têm código**;
- **8 composições** de aplicação existem como contrato e não como bloco;
- a fronteira servidor/cliente **nunca foi provada** — nenhum consumidor de framework consegue
  importar o pacote hoje sem descobrir isso sozinho;
- **43 de 76** fichas não publicam `props`.

Com a regra de espera, cada um desses vira descoberta no meio do trabalho de outra pessoa. O
efeito medido, e é o motivo desta ADR: **o trabalho externo para** enquanto o componente é
construído aqui. Uma biblioteca que interrompe quem a usa não é fundação, é dependência.

## Decisão

**Até a `1.0`, a fila da Aurea é decidida por COBERTURA do contrato, não por pedido externo.**

O que isso muda, na prática:

1. O contrato (`packages/contracts/aurea.contract.json`) passa a ser a **lista de trabalho**: o
   que ele descreve e não existe em código é dívida, com ou sem alguém pedindo.
2. O [`PLANO-1.0.md`](../docs/PLANO-1.0.md) é a materialização dessa fila, e é ele que se lê antes de
   abrir sessão.
3. `BUILDING.md` §5 e o critério de entrada da Fase 6 do `ROADMAP.md` ficam **suspensos** e
   apontam para cá.

O que **não** muda, e é o ponto:

- O procedimento do `BUILDING.md` §§1–4 continua inteiro. Cobertura não é licença para construir
  de memória: medir primeiro, consultar as referências, escopo menor que o delas, registrar no
  `REFERENCES.md`, travas 21 a 24.
- A identidade do `CLAUDE.md` segue intocável.
- Escopo continua fechado por lote autorizado. Cobertura decide **o que entra na fila**, não que
  tudo entra de uma vez.

## Consequências

**Aceitas:**

- Vai existir componente construído antes de alguém usar. Alguns nascerão com API que a primeira
  aplicação real vai querer diferente — e `0.x` permite corrigir, com nota no changelog
  ([ADR-0014](0014-primeira-versao-publica-0-1-0.md)).
- O plano é longo. Ele é dividido em partes justamente para não precisar ser feito de uma vez.

**Rejeitada, e por quê:** manter a espera e aceitar as interrupções. Foi o que produziu a
situação atual, e o custo não cai sobre a Aurea — cai sobre quem depende dela.

## Como se sabe que esta ADR terminou

Quando o `PLANO-1.0.md` estiver com todas as partes fechadas e a `1.0` publicada. Aí o
`BUILDING.md` §5 volta a valer e esta ADR passa a `superada`.
