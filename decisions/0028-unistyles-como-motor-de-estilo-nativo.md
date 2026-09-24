# ADR-0028 — Unistyles v3 é o motor de estilo do alvo nativo

- **Data:** 15/08/2026
- **Estado:** ⛔ **SUPERADA em 31/08/2026** pela
  [ADR-0037](0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md) — o motor do nativo é o
  `StyleSheet` puro. **A escolha desta ADR não vale mais; tudo o que ela MEDIU continua valendo**,
  e é justamente o que sustentou a decisão de trocar: os cinco peers, o "não roda no Expo Go", os
  números de desempenho e o achado do eixo duplo. Leia-a como medição, não como decisão.
- **Fecha:** a **Etapa 3** do [`NATIVE.md`](../docs/NATIVE.md) §5, autorizada pelo Victor em 15/08/2026
- **Autoria:** medição do Opus, sob autorização explícita ("PODE IMPLEMENTAR a Etapa 3 com
  Unistyles")

> **A porta de saída era desta ADR, e foi por ela que se saiu.** A §"Consequências" abaixo escreve:
> *"se a Etapa 4 medir que os cinco peers custam mais do que a camada de tema vale, o `StyleSheet`
> puro volta à mesa — e aí é ADR nova."* A evidência que apareceu não foi bem essa — foi o conflito
> com o Expo Go no plano do primeiro consumidor, mais o raciocínio de que o provider é nosso nos
> dois caminhos. A ADR-0037 diz isso com todas as letras, inclusive que **não houve benchmark em
> aparelho**.

## Contexto

O [`ROADMAP.md`](../docs/historia/ROADMAP.md) Fase 7 deixou a ferramenta de estilo em aberto com uma instrução —
*"re-pesquisar no dia"* — e uma pista: *"Unistyles v3 é o par filosófico mais próximo"*. A Etapa 3
do `NATIVE.md` era escolher entre ele e o `StyleSheet` puro.

O Victor escolheu Unistyles. **Esta ADR não existe para confirmar a escolha — existe para medir o
que ela custa**, porque a recomendação que a sustentava vinha de um resumo de busca, e resumo de
busca não é medição.

## O que foi medido (15/08/2026)

Instalado numa pasta descartável e inspecionado — **não entrou neste repositório**.

| | medido |
|---|---|
| versão | **3.3.0** |
| licença | **MIT** — compatível com a Apache-2.0 da Aurea |
| React Native mínimo | **≥ 0.76** no `peerDependencies`; a documentação pede **≥ 0.78** e Nova Arquitetura |
| Expo Go | **não roda** — tem código nativo |

### O custo que a recomendação escondia: não é uma dependência, são cinco

```
peerDependencies: @react-native/normalize-colors, react, react-native,
                  react-native-edge-to-edge, react-native-nitro-modules,
                  react-native-reanimated
```

**`react-native-reanimated` e `react-native-nitro-modules` não são detalhe.** São módulos nativos,
e são exatamente o tipo de dependência que costuma quebrar em atualização de plataforma. Quem
adotar Unistyles adota os cinco.

### E ele NÃO destrava a cor de gamute largo

O `peerDependencies` traz **`@react-native/normalize-colors`** — o mesmo interpretador que a
correção da [ADR-0027](0027-a-cor-no-alvo-nativo.md) mediu recusando `color(display-p3 …)` e
`oklch()`. Então a pergunta "e se o Unistyles resolvesse a cor?" está **respondida antes de ser
feita**: não resolve, porque é o mesmo código. Fecha o assunto.

### O que encaixa, e é a maior parte

`UnistylesThemes` é uma **interface vazia que o consumidor aumenta** — um tema é objeto arbitrário.
O `themes.dark` / `themes.light` que o alvo nativo já emite entra **como está**, sem adaptação.

### O que NÃO encaixa, e é o achado desta etapa

**O Unistyles tem UM eixo de tema. A Aurea tem DOIS modos: tema × densidade.**

`dark`/`light` mais `compact`/`comfortable`/`spacious` são **seis** combinações, e `variants` do
Unistyles não serve: elas são por folha de estilo, não globais — densidade na Aurea é modo de
aplicação, como tema.

Duas saídas, e **esta ADR não escolhe** porque a escolha precisa do app na frente (é matéria da
Etapa 4):

1. **registrar seis temas** (`darkCompact`, `darkComfortable`, …) — simples, e multiplica por três
   o que o consumidor troca;
2. **manter densidade fora do Unistyles**, como valor lido do nosso próprio objeto — mantém dois
   eixos honestos e obriga um provider nosso por cima.

Fica **declarado** para que a Etapa 4 não descubra isso no meio do primeiro componente.

**Detalhe menor, mas que morde:** `UnistylesBreakpoints` já declara `landscape` e `portrait`. São
nomes **reservados** — os nossos cinco (`sm`…`2xl`) não colidem, mas ninguém pode acrescentar
esses dois.

## Decisão

**O alvo nativo usa Unistyles v3 como motor de estilo.** Os cinco peers vêm junto, e isso está
declarado, não subentendido.

**A razão que pesou não é desempenho** — o `StyleSheet` puro é mais rápido (49,74 ms contra 66,40).
É **filosófica, e é a mesma que rege a web**: o Unistyles **não traz componentes**. O time dele diz
que a ideia é você construir o seu design system em cima, que é exatamente a relação que a Aurea
tem com o Base UI. Um motor que trouxesse componentes disputaria a identidade — foi o motivo de o
Tamagui ter sido recusado em 18/07/2026, e o motivo de o NativeWind estar fora (4× o custo do
`StyleSheet`, e modelo de utilitário de classe).

**O que a escolha compra:** troca de tema e de breakpoint sem re-render manual, e um lugar único
para o tema morar — que no `StyleSheet` puro seria contexto e hook nossos, escritos à mão e
mantidos por nós.

## Consequências

- **Etapa 4 começa com desenvolvimento em build próprio, não Expo Go.** Não é escolha: Unistyles
  tem código nativo. Vale registrar porque muda o dia a dia de quem for construir.
- **Os cinco peers entram no orçamento de manutenção do pacote nativo**, e Reanimated
  historicamente é o que mais pede atenção em atualização de plataforma.
- **A questão tema × densidade é o primeiro item da Etapa 4**, decidida com o app na frente.
- **Se o Unistyles for abandonado**, o custo de sair é limitado: os tokens são nossos, os
  componentes seriam nossos, e o que se perde é a camada de troca de tema — reescrevível com
  contexto e hook. Não é aprisionamento de identidade, que era o risco do Tamagui.
- **Reabre-se com evidência nova**, não por gosto: se a Etapa 4 medir que os cinco peers custam
  mais do que a camada de tema vale, o `StyleSheet` puro volta à mesa — e aí é ADR nova.

## O limite honesto desta ADR

**Nada disto foi executado num aparelho.** O que foi medido é o contrato: versão, licença, peers,
requisitos e as formas de tema, breakpoint e variante — tudo lido do pacote instalado, não de
resumo de busca. O comportamento em tela é matéria da Etapa 4, e agora ele começa sabendo onde vai
tropeçar.
