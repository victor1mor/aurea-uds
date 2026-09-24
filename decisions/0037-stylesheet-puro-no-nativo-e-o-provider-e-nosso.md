# ADR-0037 — O motor de estilo do nativo é o `StyleSheet` puro, e o provider é nosso

- **Data:** 31/08/2026
- **Estado:** aceita e **EXECUTADA** — ela é o motor de estilo dos **51 componentes** do
  `@aurea-uds/native`, publicado no npm desde 11/09/2026.
  ⚠ *Esta linha dizia* **"não executada (a Etapa 4 continua não autorizada)"** *até 14/09/2026* —
  onze dias depois de o Lote 1 sair. É o mesmo defeito que o cabeçalho do `NATIVE.md` tinha, e
  achado pela mesma varredura: **quem fecha um lote passa o olho nos cabeçalhos, e a linha
  `Estado:` de uma ADR é um cabeçalho.**
- **Substitui:** a [ADR-0028](0028-unistyles-como-motor-de-estilo-nativo.md), que escolhia o
  **Unistyles v3**. A 0028 passa a **superada**; o que ela mediu continua valendo e está citado
  aqui.
- **Autoria:** decisão explícita do Victor, em uma palavra — *"StyleSheet"* —, respondendo à
  primeira das três decisões que o [`NATIVE.md`](../docs/NATIVE.md) §7 pôs na mesa.

## Contexto

A ADR-0028 escolheu o Unistyles em 15/08/2026 e **fechou a própria porta de saída por escrito**:

> Reabre-se com evidência nova, não por gosto: se a Etapa 4 medir que os cinco peers custam mais
> do que a camada de tema vale, o `StyleSheet` puro volta à mesa — e aí é ADR nova.

Esta é a ADR nova. A evidência que a reabriu apareceu em 31/08/2026, ao levantar o plano do
**primeiro consumidor nativo** (o do [`CONSUMIDOR-1.md`](../docs/CONSUMIDOR-1.md), agora em React
Native) para montar a Etapa 4.

## A evidência nova, separada entre o que foi medido e o que foi argumentado

Esta separação é o ponto da ADR. **Duas destas linhas são medição; uma é raciocínio.** Misturar as
três seria vender argumento como número.

### Medido

| | onde | o que diz |
|---|---|---|
| **O Unistyles não roda no Expo Go** | ADR-0028, no pacote instalado | tem código nativo; exige development build |
| **O plano do consumidor pede Expo Go** | plano dele, lido em 31/08/2026 | a sequência de lançamento começa em *"MVP Android, Expo Go para teste interno"* |
| **Cinco peers, dois nativos** | ADR-0028 | `reanimated` e `nitro-modules` entre eles |
| **`StyleSheet` é mais rápido** | números publicados, citados na 0028 | **49,74 ms** contra **66,40 ms** (iOS) |
| **Um eixo de tema, e a Aurea tem dois** | ADR-0028 | tema × densidade = seis combinações; as `variants` do Unistyles são por folha, não globais |

**As duas primeiras linhas não podem valer juntas.** O passo 1 da sequência do consumidor deixa de
existir se o motor for o Unistyles.

### Argumentado — e é argumento, não medição

O achado do eixo duplo deixou duas saídas (registrar seis temas, ou manter densidade fora com um
provider nosso). **Nas duas, escrevemos um provider.** Se o provider é nosso de qualquer jeito, o
que o Unistyles ainda compra encolhe para "troca de tema sem re-render manual" — e os cinco peers
ficam caros em comparação.

**Isto é raciocínio sobre o que a 0028 mediu, não uma medição nova.** Está escrito assim de
propósito: a 0028 pediu que a Etapa 4 **medisse** o custo dos peers, e a Etapa 4 não rodou. O
Victor decidiu com a evidência disponível, que é o direito dele; o que esta ADR não faz é fingir
que houve benchmark.

## Decisão

**O alvo nativo usa o `StyleSheet` do React Native. A camada de tema é nossa: contexto e hook,
escritos e mantidos por nós.**

Consequência direta e imediata: **a segunda das três decisões do `NATIVE.md` §7 deixa de existir.**
Tema × densidade era problema porque o Unistyles tem um eixo só; num contexto nosso, dois eixos são
dois campos num objeto. Não há seis temas a registrar, nem eixo a esconder do motor.

## O que esta decisão compra, e o que ela custa

**Compra:**

- **O Expo Go volta.** O passo 1 da sequência do consumidor é viável de novo, e teste interno
  deixa de exigir EAS Build.
- **Zero peer novo.** Nada de Reanimated nem de Nitro no orçamento de manutenção do pacote — e a
  0028 já registrava o Reanimated como o que historicamente mais pede atenção em atualização de
  plataforma.
- **O mais rápido dos medidos**, pelos números publicados.
- **Nenhum fornecedor no caminho crítico.** A 0028 já tinha olhado o modelo comercial do time do
  Unistyles (o Uniwind tem tier pago) e registrado que isso se olha antes.

**Custa:**

- **A camada de troca de tema passa a ser nossa**, escrita à mão e mantida por nós. Era exatamente
  o que a 0028 dizia que o Unistyles comprava.
- **Re-render na troca de tema é problema nosso.** Contexto do React re-renderiza a subárvore; se
  isso doer em tela real, a solução é nossa (memo, seletor, contexto fatiado), não do fornecedor.
- **Breakpoints são nossos.** A 0028 registrou que o Unistyles já trazia `landscape`/`portrait`
  reservados; agora não há nada reservado, e também não há nada pronto.

## O que NÃO muda, e é bom deixar escrito

- **A filosofia continua a mesma, e é a razão de a 0028 ter escolhido o Unistyles em primeiro
  lugar:** o motor não traz componentes. O `StyleSheet` traz menos ainda. A recusa ao Tamagui
  (18/07/2026) e ao NativeWind continua valendo pelos mesmos motivos — disputar a identidade e
  modelo de utilitário de classe.
- **A cor não muda.** A [ADR-0027](0027-a-cor-no-alvo-nativo.md) mediu que o interpretador de cor
  do React Native recusa gamute largo, e o Unistyles usava **o mesmo** interpretador. Trocar de
  motor não destrava nem piora nada: `hex` continua sendo o único caminho vivo, e a perda de
  ΔEok 0,0225 no amarelo continua sendo teto da plataforma.
- **Os tokens não mudam.** O `@aurea-uds/tokens/native` da Etapa 2 já existe, é gerado e tem gate
  (check 36). Ele nunca dependeu do motor de estilo.
- **A arquitetura não muda.** `@aurea-uds/native` continua sendo pacote irmão sobre
  `View`/`Text`/`Pressable`, como o `ROADMAP.md` Fase 7 decidiu em 18/07/2026.

## ~~O limite honesto desta ADR~~ ✅ **A APOSTA FOI MEDIDA EM APARELHO — 03/09/2026**

> **A aposta se sustenta, e o número está aqui.** Rodado pelo Victor num Android, com
> `apps/native-smoke/` — uma tela com **40 linhas**, cada uma lendo cor, espaço e fonte do tema:
>
> | troca | medido |
> |---|---:|
> | tema `dark` → `light` + densidade `spacious` | **182 ms** |
> | densidade → `compact` | **161 ms** |
>
> Sem piscar. O critério escrito antes de medir era *"abaixo de ~200 ms"*, e passou — **mas passou
> perto, e isso merece ser dito em vez de arredondado para "rápido".**
>
> **Três coisas inflam esse número, e as três são de propósito:**
> 1. **É modo de desenvolvimento.** Expo Go, sem otimização de produção. É o cenário pessimista.
> 2. **O app chama `StyleSheet.create` a cada render**, deliberadamente — esconder isso atrás de um
>    cache mediria outra coisa que não o motor que esta ADR escolheu.
> 3. **40 linhas simultâneas** é mais do que uma tela real costuma trocar de uma vez.
>
> **E a densidade mudou o layout de verdade** — comparando as duas fotos, o texto se reagrupa entre
> `spacious` e `compact`. Isso prova, na tela, a precedência `base < tema < densidade` que o
> `tokens.ts` implementa e o teste unitário cobra.
>
> ⚠ **O que isto ensina ao Lote 1, e é a parte acionável:** os componentes **não** devem recriar a
> folha de estilo a cada render. `StyleSheet.create` fora do componente, ou `useMemo` sobre o par
> (tema, densidade). O app de smoke faz o contrário para medir o pior caso; um componente da Aurea
> não tem essa desculpa.

O texto abaixo é o limite original, mantido como registro.

**Nada disto rodou num aparelho** — a mesma frase que a 0028 teve de escrever, e pelo mesmo motivo.
O que decidiu foram os números publicados, o contrato dos pacotes e um conflito real com o plano do
consumidor.

**O que fica por medir, e é matéria da Etapa 4:** se o contexto do React, sem as otimizações do
Unistyles, re-renderiza a ponto de doer na troca de tema em tela real. É a única aposta desta
decisão, e ela é reversível.

## Condição de revisão

**Reabre-se com evidência nova, não por gosto** — a mesma cláusula da 0028, e agora ela aponta para
o outro lado:

- se a Etapa 4 medir, **em aparelho**, que a troca de tema com contexto próprio custa caro o
  bastante para justificar os cinco peers, o Unistyles volta à mesa e é ADR nova;
- se o consumidor abandonar o Expo Go por outro motivo, **um** dos pilares desta decisão cai — os
  outros (peers, desempenho, provider próprio de qualquer jeito) continuam de pé, então isso
  sozinho não reabre.

**O custo de sair continua limitado, nos dois sentidos.** Os tokens são nossos, os componentes
seriam nossos, e o que se troca é a camada de tema. Não é aprisionamento de identidade — que era o
risco do Tamagui, e continua sendo o motivo de ele estar fora.
