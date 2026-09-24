# ADR-0032 — Um caminho só para o botão que fica aceso: `Toggle`. O `pressed` do `Button` está depreciado

- **Data:** 18/08/2026
- **Estado:** aceita
- **Autoria:** achado do Victor; pesquisa e execução do Opus, sob autorização explícita dele em 18/08/2026

## Contexto

O Victor perguntou, olhando a página do `Button`: **"temos o mesmo recurso duas vezes?"**

Medido no fonte, e a resposta é sim, em parte. `Button` declara `pressed?: boolean` e emite
`aria-pressed`; `Toggle` envelopa o motor Base UI com `pressed`, `defaultPressed` e
`onPressedChange`. **Na tela os dois são idênticos** — `.btn` com `aria-pressed`. A diferença é
real e invisível: no `Button` **o consumidor** guarda o estado e o componente só pinta e anuncia;
no `Toggle` o componente guarda o estado, devolve o callback e reclama no console quando é só ícone
sem nome acessível.

Dois caminhos para o mesmo controle é o "qual eu uso?" que denuncia recurso duplicado, e o
protocolo desta casa proíbe padrão paralelo.

## O que a pesquisa disse (18/08/2026, doze referências)

MUI, Fluent 2, React Aria, Adobe Spectrum, Carbon, Radix/Base UI, shadcn, ReUI, PrimeReact, HeroUI,
REI Cedar e o W3C APG. **Nenhuma põe o estado de pressionado no botão comum** — todas têm
componente separado. A `PrimeReact` é a mais próxima do nosso: `pressed` + `onPressedChange`, que é
exatamente a assinatura do nosso `Toggle`.

E as três fontes de prática de depreciação (Procore CORE, EightShapes, Design Systems Collective)
convergem: marca `@deprecated` numa versão **menor**, com a substituição escrita, e remove na
**maior** seguinte. Nunca de repente.

## Decisão

**1. O `Toggle` é o caminho único.** É o que as doze têm.

**2. O `pressed` do `Button` fica `@deprecated`** com `@deprecatedSince 0.4.0` e sai na `1.0`.
Continua funcionando enquanto isso — ninguém quebra hoje. E a Aurea está em `0.x`, onde o semver
permite quebrar antes da `1.0`: **este é o momento mais barato que vai existir**.

**3. Os dois exemplos de toggle saíram da página do `Button`** — ela estava ensinando um toggle
falso — e o `Toggle` ganhou página de conteúdo própria, que nunca teve (era só starter).

**4. E entra a regra que ninguém tinha escrito aqui, do W3C APG e do Adobe Spectrum: o rótulo NÃO
muda entre os estados.** Se o texto vira "Mute"/"Unmute" ou "Play"/"Pause", não é `Toggle` — é
`Button`. Quem lê tela ouve o rótulo novo e o estado ao mesmo tempo e não sabe se o botão descreve
o que **é** ou o que **fará**. Está escrita no fonte, na ficha e no catálogo.

## Alternativas recusadas

**Remover o `pressed` agora.** O semver de `0.x` permitiria, mas as três fontes de prática dizem
para dar janela de migração, e o custo de esperar até a `1.0` é zero.

**Manter os dois e documentar quando usar cada um.** Recusada: é a definição de padrão paralelo, e
a diferença é invisível na tela — documentação não resolve o "qual eu uso?".

**Tirar o `Toggle` e ficar com o `Button pressed`.** Recusada pela pesquisa: seria a única
biblioteca das doze a fazer isso, e perderia o gerenciamento de estado, o teclado do motor e a
cobrança de nome acessível.

## Custo aceito

A página do `Button` perdeu dois exemplos, e o exemplo novo do `Toggle` parece **menos botão** que
o falso que saiu — o `Toggle` é `ghost` por padrão, então desligado ele não tem caixa. Isso foi
mostrado ao Victor em print antes de seguir, e aprovado por ele.

## Como isso é obrigado

- `@deprecated` no tipo: o consumidor TypeScript vê o aviso no editor.
- A ficha do `Button` diz DEPRECATED na descrição do `pressed`, com a substituição.
- `CHANGELOG.md` tem a entrada em `### Deprecated`.
- **O que NÃO tem gate:** nada cobra que o `pressed` seja removido na `1.0`. É lembrete de
  documento, e fica declarado como tal em vez de fingir automação.
