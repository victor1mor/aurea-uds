# ADR-0020 — A próxima versão é `0.2.0`, não a `1.0`

- **Data:** 11/08/2026
- **Estado:** aceita · **EXECUTADA em 12/08/2026** — os seis pacotes estão no npm em `0.2.0`,
  medido com `npm view <pacote> version`. O laço da receita do publish e o que a execução mudou
  estão no rodapé do K5 em [`PLANO-1.0.md`](../docs/PLANO-1.0.md)
- **Complementa:** a [ADR-0014](0014-primeira-versao-publica-0-1-0.md), que escreveu a condição de
  saída de `0.x` e não disse o que fazer com as quebras que se acumulassem antes dela
- **Autoria:** decisão delegada pelo Victor ao Opus em 11/08/2026 ("escolha o melhor lógico"),
  depois que o item **K3** mediu cinco quebras de API acumuladas e não publicadas

## Contexto

O **K3** fechou o changelog e a medição trouxe um número que ninguém tinha: entre o publish da
`0.1.0` (31/07/2026) e hoje há **99 commits**, **cinco quebras de API** e **cinco defeitos
corrigidos** — nenhum deles disponível para quem instala. A pergunta chegou pronta: as cinco
quebras saem numa `0.2.0`, dando a quem instalou uma versão para migrar, ou direto na `1.0`?

**E a `1.0` não está disponível hoje.** A ADR-0014 escreveu duas condições para sair de `0.x`:

| Condição | Estado |
|---|---|
| fechar o **M8** — contrato de `props` publicado e batendo com o TypeScript | ✅ **fechada** na Parte E (92 de 92) |
| ter **pelo menos um consumidor real instalando do npm** | ❌ **aberta** |

**A segunda condição é circular, e é o que decide esta ADR.** O que está publicado no npm é a
`0.1.0`, e a `0.1.0` **quebra na hora** quando alguém a importa dentro de um componente de
servidor: nenhum módulo carrega `"use client"` e o barril reexporta contexto do React. Medido na
Parte A, em 06/08/2026.

Ou seja: a versão publicada **não pode ser instalada** no framework React dominante. A condição
pede um consumidor real; o defeito que impede um consumidor real de existir é exatamente o que
está retido esperando esse consumidor aparecer. **Esperar é esperar por uma coisa que a espera
impede.**

## Alternativas

**A. Ir direto para a `1.0`.** Rejeitada, por duas razões independentes.

1. **Viola a condição escrita da ADR-0014** — não há consumidor real instalando do npm. Uma
   decisão registrada não se reabre sem evidência nova, e "acumulamos muita coisa boa" não é
   evidência nova: é impaciência.
2. Ainda que a condição fosse dispensada: em semver, `1.0.0` **promete** que a API pública não
   quebra sem major. Estrear essa promessa no mesmo commit que quebra cinco coisas é a pior
   primeira impressão possível, e gasta de graça o orçamento de quebra barata que só o `0.x` dá.

**B. Reter tudo até um consumidor aparecer.** Rejeitada — é a alternativa séria, e é a que estava
valendo por omissão. A favor: nada é publicado antes de ser exercido por consumo real, que é o
espírito da ADR-0014. Contra, e decisivo: **é o argumento circular acima**. Além disso, 70 commits
de correção não servem a ninguém enquanto ficam aqui — inclusive cinco defeitos que o consumidor
sente hoje (o travamento em RSC, o CSS do core estilizando **toda `<table>`** do documento dele, o
`Progress` anunciando número errado, o `LogStream` com a mensagem na coluna errada, e a barreira de
teclado da gaveta no WebKit).

**C. `1.0` tratando as quebras como "história pré-1.0".** Rejeitada. É a alternativa A com
redação melhor: a condição do consumidor continua descumprida, e o consumidor que atualizar
continua com o avatar 4px menor e a tabela dele sem estilo — chamar isso de história não muda o
que acontece na tela dele.

**D. `0.2.0` agora, `1.0` quando houver consumidor real.** Escolhida.

## Decisão

**A próxima versão publicada dos seis pacotes é a `0.2.0`.** Ela leva o que está no
`[Unreleased]` do [`CHANGELOG.md`](../CHANGELOG.md): as cinco quebras, os 27 componentes, os três
subpaths e as correções.

**A `1.0` continua gateada pela ADR-0014**, e agora com a condição que faltava dita por extenso: o
consumidor real se instala da **`0.2.0`**, porque é a primeira versão que dá para instalar num
framework de componentes de servidor.

**Por que `0.2.0` é o veículo certo para cinco quebras, e não um risco:** em semver, `^0.1.0`
aceita **só** `0.1.x`. Quem depende assim **não recebe** a `0.2.0` automaticamente — a atualização
é um ato deliberado, com o changelog na frente. A ADR-0014 registrou isso como um **custo** ("é o
comportamento correto para `0.x` e é bom que seja, mas surpreende"); aqui ele é a **razão da
escolha**. Um minor de `0.x` é precisamente o lugar onde cinco quebras cabem sem pegar ninguém de
surpresa.

## Como isso é obrigado

**O número não se digita em seis lugares.** Ele vive nos `package.json` e no
`aurea.contract.json`, e o `manifest.json` (gerado, check 20) o repete a partir deles — divergir
entre pacotes reprova.

**E o changelog não pode ficar atrás dele.** O **check 31**, nascido no K3, reprova se os pacotes
carregarem uma versão que não tem seção própria no `CHANGELOG.md`. Provado contra o defeito em
11/08/2026: com os pacotes em `1.0.0` e sem `## [1.0.0]`, o validador reprova nomeando os dois
números.

**No momento do publish, três coisas acontecem juntas** — e é uma só operação, não uma lista de
lembrar:

1. `[Unreleased]` vira `## [0.2.0] — <data>` no `CHANGELOG.md`;
2. os seis `package.json` vão a `0.2.0`;
3. **`scripts/released-surface.json` é regerado** de `git show <commit-do-publish>:manifest.json`.
   Está escrito no `_como_regerar` daquele arquivo, e o motivo também: regerar fora de um release
   apaga a dívida em vez de cobrá-la.

**A versão NÃO sobe antes do publish.** Pacote declarando `0.2.0` enquanto o npm tem `0.1.0` é
mentira com gate verde — o check 31 exigiria a seção `[0.2.0]` de uma versão que não saiu, e o
`[Unreleased]` deixaria de descrever o que está por publicar. O bump é parte do ato de publicar,
não um preparo dele.

## Consequências

**Boas:**

- **Quebra o impasse.** A correção que destrava o consumidor real chega a quem instala, e a
  condição da ADR-0014 passa a ser alcançável em vez de circular.
- **Ninguém é atualizado por acidente** — `^0.1.0` não pega `0.2.0`.
- **A `1.0` guarda o que ela promete.** Ela estreia numa API que já foi exercida por consumo real,
  que é o que a ADR-0014 quis desde o início.
- **O check 31 começa a valer de verdade.** Hoje a superfície congelada é a de 31/07 e envelhece
  todo dia; com um release novo ela volta a ser um marco recente.

**Custos, declarados:**

- **Um ciclo de publish a mais, e ele é manual.** Pela [ADR-0013](0013-mecanica-de-publicacao-npm.md),
  publicar segue sendo ato manual com 2FA da máquina do Victor até o **K2** configurar o publicador
  confiável. A `0.2.0` não espera o K2 — a `0.1.0` também não esperou —, mas paga o mesmo trabalho
  manual.
- **`0.x` continua assustando parte de quem avalia biblioteca.** Custo já declarado na ADR-0014, e
  a resposta continua sendo a mesma: sai fechando a condição, não renumerando.
- **Sem provenance.** O repositório é privado, então a `0.2.0` sai sem attestation, igual à
  `0.1.0` — ADR-0013, e depende de uma decisão que não é técnica.

**Revisão:** ao aparecer o primeiro consumidor real instalando a `0.2.0` do npm. É o gatilho da
`1.0`, e é a revisão desta ADR e da ADR-0014 ao mesmo tempo.
