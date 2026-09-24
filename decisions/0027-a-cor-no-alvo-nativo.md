# ADR-0027 — A cor no alvo nativo: hex sozinho não serve, e o número é 0,0225

- **Data:** 15/08/2026
- **Estado:** aceita · **CORRIGIDA no mesmo dia** — ver §"A correção" no fim
- **Fecha:** a **Etapa 1** do [`NATIVE.md`](../docs/NATIVE.md) §5, autorizada pelo Victor em 15/08/2026
- **Autoria:** medição do Opus (`node scripts/measure-color-native.mjs`)

> ⚠ **LEIA A CORREÇÃO NO FIM ANTES DE AGIR POR ESTA PÁGINA.** O que está medido no corpo continua
> verdadeiro; a **consequência prática mudou**, porque uma premissa nunca tinha sido testada.

## Contexto

O [`NATIVE.md`](../docs/NATIVE.md) foi escrito no item O2 e pediu **uma** autorização: medir a cor antes
de prometer qualquer coisa. A razão era que o amarelo primário `oklch(0.795 0.184 86.047)` é
declarado **INTOCÁVEL** no [`CLAUDE.md`](../CLAUDE.md), que o `StyleSheet` do React Native
provavelmente não aceita `oklch()`, e que converter para sRGB é mapeamento de gamute **com perda**
— perda que o gate de pixel desta casa **não veria**, porque ele mede o navegador.

O documento admitia que a resposta podia ser "hex serve". **Não é.**

## O que existe para converter, medido

Os 152 tokens de `$type: color` não são 152 valores:

| forma do `$value` | quantos |
|---|---:|
| `oklch` | **95** |
| alias (`{outro-token}`) | 42 |
| `srgb` (já com hex) | 15 |

**A superfície real de conversão são 95 valores.** Os 15 em sRGB já estão no gamute por
construção, e os 42 alias resolvem para um dos outros.

## As três medições

### 1. Vinte dos noventa e cinco não cabem no sRGB

Convertendo OKLCH → OKLab → sRGB linear, **20 de 95** estouram algum canal. O amarelo da marca é
um deles (excesso de 0,0440). Depois do corte e do arredondamento para 8 bits:

| token | ΔEok após o corte | hex |
|---|---:|---|
| `theme.light.danger-bg` | 0,02280 | `#ffe2df` |
| **`base.brand-yellow`** | **0,02247** | **`#f0b100`** |
| `theme.*.primary-hover` | 0,02043 | `#fac000` |
| `theme.light.info-bg` | 0,02048 | `#ddf0ff` |
| `theme.*.primary-active` | 0,01928 | `#dd9f00` |

**O ΔEok de 0,0225 não é ruído.** O limiar de diferença perceptível (JND) publicado para ΔEok é
**≈ 0,02** — ele sai do JND de 2,3 do CIE Lab dividido por 100, porque a luminosidade do OKLab vai
de 0 a 1. O corte do amarelo cai **em cima do limiar**, não abaixo dele.

### 2. A conta foi provada contra o motor, e a primeira tentativa era falsa

As matrizes de OKLab→sRGB são constante de especificação, e eu as escrevi de memória — que é
exatamente o que este repositório não aceita como fonte. Então o script pinta cada cor no
Chromium e **lê o pixel rasterizado**: **95 de 95 comparadas, diferença máxima de 1/255**. O
amarelo rasteriza em `rgb(240, 177, 0)`, que é o `#f0b100` da conta.

**A primeira versão dessa validação imprimiu "0 de divergência" tendo comparado ZERO cores.** Ela
lia `getComputedStyle`, e o Chromium devolve `oklch(...)` sem resolver; o filtro de `rgb(` pulava
todas, e o relatório saía verde. É o mesmo defeito que já custou caro aqui — gate verde que não
era —, agora dentro da própria medição que ia decidir. Trocou-se para canvas 2D, que obriga o
motor a rasterizar em bytes.

### 3. A pergunta que decide: o navegador corta igual

Se o navegador **também** corta em sRGB, então mandar hex para o nativo não perde nada numa tela
comum — o usuário já via a cor cortada na web. Medido: corta igual, byte a byte.

**A perda só existe onde o navegador consegue pintar mais.** Em canvas `display-p3`, os **20**
tokens fora do gamute rasterizam **diferente** dos mesmos 20 em sRGB. O amarelo:

| | rasterizado |
|---|---|
| sRGB | `rgb(240, 177, 0)` |
| Display P3 | `rgb(230, 179, 19)` |

E isso não é caso de borda de aparelho: **todo iPhone desde 2016/2017 tem tela P3**, e a maioria
dos Android de topo também.

## Decisão

**O alvo nativo não recebe hex sozinho.**

1. **A fonte continua `oklch`.** Nada muda no `aurea.tokens.json` — a decisão é do adapter, não do
   token.
2. **O adapter da Etapa 2 emite DOIS valores por cor:** o de gamute largo onde a plataforma
   suporta, e o **hex como fallback**. Emitir só hex seria escolher, por omissão, a versão
   degradada para os aparelhos que a maioria dos usuários tem.
3. **O hex fica exatamente como esta medição o produziu** — `#f0b100` para o amarelo —, porque ele
   é byte a byte o que o navegador já pinta em sRGB. Fallback que diverge da web seria um segundo
   defeito em cima do primeiro.

### O que isso NÃO decide

O caminho de gamute largo no React Native **não está resolvido, e a pesquisa mostra por quê**: o
iOS tem suporte inicial a DisplayP3 (a sintaxe `color()` do CSS Color 4 chegou por PR ao core), e
o **Android segue limitado**. Então o adapter pode acabar entregando largo no iOS e hex no
Android — o que é aceitável e precisa ser **medido**, não presumido.

## Consequências

- **A Etapa 2 muda de escopo antes de começar:** ela não é mais "converter para hex". É emitir
  dois valores e declarar qual plataforma recebe qual.
- **Fica um teto conhecido:** onde o fallback hex for usado, 20 cores ficam a até ΔEok 0,0225 da
  web — no limiar do perceptível. Isso é **limite declarado**, não defeito escondido.
- **O gate de pixel desta casa continua cego para isso**, e vai continuar: ele mede o navegador em
  sRGB. Quem cobrar a cor no nativo é a suíte do pacote nativo, quando existir.

## ✅ O item 3 foi MEDIDO EM APARELHO — 03/09/2026

Rodado pelo Victor num Android, com o app `apps/native-smoke/`. A tela imprime a cor que o tema
entregou ao lado da esperada, e o resultado é o terceiro item da lista abaixo:

> `primary` medido agora: **#f0b100** · esperado: **#f0b100** — **✓ bate**

**O hex sai idêntico ao da web, no aparelho.** É o que a Etapa 1 já tinha medido por rasterização
em canvas, agora confirmado no destino. As outras cores do tema `light` saíram junto e coerentes:
`background #f3f3f3`, `card #ffffff`, `border #dbdbdb`.

**Os itens 1 e 2 deixaram de fazer sentido**, e não por terem sido medidos: a §"A correção" abaixo
já mostrou que o interpretador de cor do React Native **recusa** todo formato de gamute largo, então
não há caminho `display-p3` a testar em plataforma nenhuma. A perda de ΔEok 0,0225 em tela de gamute
largo continua sendo **teto de plataforma**, e agora está declarada na própria tela do app.

---

## O que esta medição NÃO fez, e por quê

**Não rodou em aparelho nem em simulador.** A máquina é Windows, sem SDK Android, e simulador iOS
exige macOS. O que ficou por medir, e que é a primeira coisa da Etapa 2:

1. se o caminho `color(display-p3 …)` do React Native no iOS pinta mesmo o valor largo;
2. o que o Android faz quando recebe o mesmo valor;
3. se o hex de fallback sai idêntico ao da web nos dois.

O que esta medição responde — e era a pergunta que travava tudo — é **se existe perda na conversão
e de quanto**. Existe, é de 0,0225 no amarelo, e cai em cima do limiar do perceptível. Por isso a
decisão acima não precisou do aparelho.

---

## A correção — 15/08/2026, no mesmo dia

**Uma premissa desta ADR nunca tinha sido testada, e ela é falsa.** A decisão acima diz "o adapter
emite o valor de gamute largo **onde a plataforma suporta**". Eu tratei "onde a plataforma
suporta" como pergunta de **aparelho**, e cheguei a mandar o Victor instalar Expo, parear celular
e fotografar tela para descobrir.

Era desnecessário, e a medição custa segundos: o `StyleSheet` do React Native resolve cor com
**`@react-native/normalize-colors`, que é JavaScript puro e roda no Node**. O comando é
`node scripts/measure-color-rn-parser.mjs`. Resultado:

| formato | aceito? |
|---|:--:|
| `hex`, `rgb()`, `hsl()`, `hwb()` | **sim** |
| `color(display-p3 …)` | **não** |
| `color(srgb …)` | **não** |
| `oklch()`, `oklab()`, `lab()`, `lch()` | **não** |
| `color-mix()` | **não** |

Medido em **duas** versões, para não parecer defeito de uma: a **0.81.5** (a do Expo SDK 54) e a
**0.87.0**, a mais recente publicada. **Idêntico nas duas.** E o interpretador é JavaScript
compartilhado — não é específico de iOS nem de Android, então não há um lado onde funcione.

### O que muda

1. **`hex` não é o "fallback". É o ÚNICO caminho vivo.** Os campos `p3` e `oklch` do
   `aurea.tokens.native.js` **ficam** — custam nada e registram a intenção —, mas são **intenção,
   não API consumível**. Passar qualquer um deles a um `style` hoje faz a cor ser descartada.
2. **A perda de 0,0225 no amarelo deixa de ser evitável.** O corpo desta ADR mostrou que ela só
   aparece em tela de gamute largo; agora se sabe que, nessa tela, **o app nativo vai mostrar a
   versão cortada de qualquer jeito**, porque não há como entregar a outra. Não é escolha nossa —
   é teto da plataforma. Fica **declarado**, que é o que dá para fazer.
3. **Os três "pontos de aparelho" do fim desta página caem.** Não há o que fotografar: a cor larga
   nunca chega à tela para ser comparada. E o terceiro — se o hex bate com a web — está
   **respondido**: o interpretador devolve `rgba(240, 177, 0)` para `#f0b100`, que é exatamente o
   que o navegador rasteriza. Idêntico.

### O que esta correção NÃO afirma

Ela mede o caminho de **string de estilo**, que é como a Aurea usaria cor em 100% dos casos. Não
cobre `PlatformColor()` nem `DynamicColorIOS()`, que buscam cor por **nome num catálogo nativo** e
não passam por este interpretador. Um caminho de gamute largo por catálogo de assets no iOS
**continua possível e continua não medido** — e agora é a única hipótese viva, então é ela que uma
Etapa futura investigaria, não a string.

### A lição, porque ela é de método

Eu classifiquei como "precisa de hardware" uma pergunta que era **de biblioteca**. O custo disso
não foi teórico: o Victor instalou Node, Expo e Expo Go, criou projeto, mexeu em rede e não
conseguiu parear — tudo para descobrir algo que um `require()` respondia. **Antes de declarar que
falta hardware, procurar a parte da pergunta que é software.**
