# ADR-0036 — Marca é um eixo, e o amarelo continua invariável (dentro da Aurea)

- **Data:** 20/08/2026
- **Estado:** aceita · aplicada
- **Autoria:** decisão explícita do Victor. Ele perguntou *"a aurea pode ter temas? tipo atual é
  padrão e criar outros, como heroUI tem?"*, mandou criar a marca **`lory`** com as cores do
  consumidor dela, e escolheu, entre as opções apresentadas, **só cor** e **ADR emendando a
  regra**.
- **Emenda:** a linha do [`CLAUDE.md`](../CLAUDE.md) que diz *"Amarelo primário
  `oklch(0.795 0.184 86.047)` invariável entre temas"*.

## Contexto

A Aurea nasceu para os projetos do Victor, e o primeiro projeto real que vai consumi-la do npm é
de um **consumidor** que tem padrão de cor próprio: laranja `#FF6600`, neutros frios de baixa croma,
quatro semânticas com fundo `-soft`, e uma lateral que fica escura **nos dois temas**.

Duas saídas ruins estavam na mesa antes desta decisão, e as duas já custaram caro em outros
lugares deste repositório:

1. **Trocar o amarelo da Aurea pelo laranja.** É o que a sessão de 19/08 fez com a lateral rente:
   leu uma exceção autorizada como troca de padrão ([ADR-0034](0034-ter-a-variante-nao-e-usar-a-variante.md)).
2. **O consumidor sobrescrever token na mão.** Vira segunda verdade: a paleta da marca viveria
   num CSS do projeto dele, fora do gate, e divergiria da Aurea na primeira mudança.

**O que foi medido antes de decidir:** o `ui-kit-standalone` da marca usa **a mesma mecânica**
que a Aurea — `data-theme="light|dark"` e `data-density` no `<html>`, cor em OKLCH, escala de
espaçamento e raio em variável. Não havia arquitetura para inventar; faltava **um eixo**.

## Alternativas rejeitadas

**Um tema `lory` ao lado de `dark` e `light`.** Rejeitada: a marca precisa de claro **e** escuro.
Um terceiro valor no mesmo eixo obrigaria a escolher entre a marca dela e o tema do usuário.

**Marca trocando também tipografia, raio e ícone.** Oferecida ao Victor e recusada por ele. Sora e
Inter exigiriam empacotar duas famílias novas com licença própria; o raio de card de 26px
desmontaria a regra de pílula dentro do tema; e os 38 ícones estilo Lucide do kit contra os 2.571
Carbon da Aurea seria trocar cobertura por estilo. **Marca é paleta** — é o que o HeroUI faz.

**Editar a regra direto no `CLAUDE.md`, sem ADR.** Recusada por ele, e com razão: decisão de
identidade sem registro é exatamente o que esta pasta existe para impedir.

## Decisão

**A marca é um eixo próprio, ortogonal ao tema.**

```
data-brand ausente  (Aurea)  ×  data-theme="dark" | "light"
data-brand="lory"            ×  data-theme="dark" | "light"
```

- **Uma marca redefine COR e nada mais.** Tipografia, raio, densidade, espaçamento e ícones
  continuam sendo os da Aurea, em qualquer marca. Quem muda a forma não está trocando de marca —
  está fazendo outra biblioteca.
- **Sem `data-brand` no documento, nada disto se aplica.** A Aurea é a de sempre, byte a byte:
  quem não pediu marca nenhuma não recebe mudança nenhuma.
- **A regra do amarelo passa a valer DENTRO de cada marca, não entre marcas.** O
  `oklch(0.795 0.184 86.047)` continua invariável entre `dark` e `light` — que é o que a linha
  original protegia. O que ela não previa é que existiria uma segunda marca.
- **A paleta mora no arquivo de tokens**, em `brand.<nome>.<tema>`, e sai pelo mesmo build que
  emite tema e densidade. Não há CSS de marca escrito à mão, e não há paleta no projeto do
  consumidor.

## A marca `lory`

60 tokens por tema, lidos do `ui-kit-standalone` que o Victor enviou em 20/08/2026 — **lidos, não
inventados**. Primário `#FF6600` no claro (`oklch(0.682 0.197 44.5)`) e um laranja mais claro no
escuro (`oklch(0.72 0.19 48)`), porque o kit deles já resolve isso assim.

Uma coisa dela **não** é nossa e fica registrada: a **lateral é escura nos dois temas**. É decisão
de produto da marca, entrou como token dela, e não vaza para a Aurea.

## Como isso é obrigado

- **`scripts/build-tokens.mjs`** falha se uma marca existir no arquivo de tokens sem seletor
  declarado em `$extensions.ui.aurea.selectors` — marca sem seletor não emite em silêncio.
- **A página de Tokens do catálogo** monta cada amostra com os atributos do próprio escopo. O
  parser dela só aceitava **um** atributo e quebrou no primeiro seletor de marca; agora casa o par
  inteiro e reprova se sobrar qualquer coisa fora dos colchetes.
- **Medido em 20/08/2026, no navegador**, trocando os atributos ao vivo:

  | `data-brand` | `data-theme` | `--primary` |
  |---|---|---|
  | (nenhuma) | dark | `oklch(0.795 0.184 86.047)` |
  | (nenhuma) | light | `oklch(0.795 0.184 86.047)` |
  | `lory` | dark | `oklch(0.72 0.19 48)` |
  | `lory` | light | `oklch(0.682 0.197 44.5)` |

  As duas primeiras linhas são o contrato antigo continuando de pé; as duas últimas são o eixo novo.

## Consequências

**Boas:** o projeto do consumidor consome a Aurea do npm sem manter paleta própria, e sem que a Aurea
deixe de ser a Aurea para todo mundo. Marca nova é um objeto no arquivo de tokens mais duas linhas
de seletor.

**Custos, declarados:**

- **O gate de pixel não cobre marca.** As 44 baselines são da Aurea; uma regressão que só apareça
  sob `data-brand="lory"` passa. Cobrir exigiria dobrar as baselines por marca, que é o custo que
  o `playwright.config.ts` já recusou por motor.
- **Contraste sob `lory` não foi medido componente a componente.** O `skin.spec` roda sem marca.
  Isto é dívida declarada, não descuido: entra quando a marca começar a ser usada de verdade.
- **A linha do `CLAUDE.md` fica mais longa.** Regra que ganha exceção precisa dizer qual é.
