# ADR-0041 — O motor de gráfico do nativo é NOSSO, sobre `react-native-svg`

- **Data:** 09/09/2026
- **Estado:** aceita · **executada** logo em seguida
- **Autorizada pelo Victor** — *"faz o Chart então"*. O `NATIVE.md` §5.6 marcava o `Chart` como
  *"decisão do tamanho de uma ADR, não um item de lote"*, e foi por isso que ele ficou fora do
  Lote 6 mesmo com o lote inteiro autorizado. Esta é a ADR.

## Contexto

O `Chart` é a **única peça do plano nativo que não atravessou** com os seis lotes. A razão está
escrita desde 31/08/2026: o `recharts` renderiza DOM.

Mas a frase esconde o problema de verdade, e ele só aparece medindo o que o `Chart` da web É:

    packages/react/src/chart.tsx   ->   79 linhas, e nenhuma delas desenha

A ficha diz a mesma coisa em uma frase: *"Aurea does not wrap the chart types: the engine draws,
this component holds."* O `Chart` da web é **pele**: uma caixa com altura, um nome acessível, um
tooltip e uma legenda. Escala, eixo, curva e interação são todos do motor.

**Então a pergunta não é "como portar 79 linhas".** É: no nativo não há motor — quem desenha?

## O que foi medido (09/09/2026)

### 1. As quatro bibliotecas de gráfico do React Native, no registro

Medido com `npm view`, não de memória:

| biblioteca | versão | o que ela ARRASTA | veredito |
|---|---|---|---|
| `victory-native` | 42.0.1 | **três peers nativos novos**: `@shopify/react-native-skia`, `react-native-reanimated`, `react-native-gesture-handler` (+ 5 deps de d3) | recusada — é o dobro do peso do pacote inteiro |
| `react-native-gifted-charts` | 1.4.78 | `react-native-linear-gradient` / `expo-linear-gradient` | **recusada por REGRA, não por peso** — gradiente é proibido na Aurea desde a Fase 0, e o motor o exige como peer |
| `react-native-svg-charts` | 5.4.0 | `react-native-svg` **`^6 \|\| ^7`** | recusada — incompatível: o nosso peer é `>=15` |
| `react-native-chart-kit` | 7.0.4 | só `react-native-svg` (que já temos) + `paths-js` | **a candidata de verdade** — ver abaixo |

⚠ **As duas primeiras estão VIVAS** — publicadas em 31/08 e 06/09/2026. "Abandonada" teria sido
afirmação de memória, e estaria errada. O `react-native-svg-charts` é o único velho de fato.

### 2. Por que a candidata de verdade também não serve — e a razão NÃO é peso

O `react-native-chart-kit` não traz peer nativo nenhum. Se o critério fosse dependência, ele
ganharia. **O critério que decide é outro, e ele vem do que a web faz:**

| | como se escreve |
|---|---|
| `recharts` (web) | `<AreaChart><Area stroke="var(--chart-2)" fill=… /></AreaChart>` — **marcas compostas**, e a aparência é toda passada por fora |
| `react-native-chart-kit` | `<LineChart data={data} chartConfig={…} />` — **dados entram, gráfico sai** |

**Adotá-lo não reproduziria a relação da web; inverteria ela.** Lá a Aurea segura e o motor
desenha *com as props da Aurea* — é por isso que o `chart.tsx` tem 79 linhas de pele e zero de
geometria. Aqui o motor desenharia *com as ideias dele*, e restaria brigar com a aparência dele
por fora.

⚠ **E essa briga tem nome neste repositório.** O `CLAUDE.md` registra o custo dela com o
`Sidebar`: *"eu li o fonte deles, extraí números e reimplementei em volta — e o desenho saiu
diferente do que ele via, três rodadas seguidas"*.

⚠ **Ele também estreitaria o alcance do pacote:** o peer dele é `react-native >=0.81`; o nosso é
`>=0.76`. Adotá-lo excluiria consumidores que hoje cabem.

### 3. A paleta de gráfico da Aurea é uma RAMPA, não um conjunto categórico

Medido rodando o validador de paleta sobre `--chart-1..5` (`#8ec5ff #2b7fff #155dfc #1447e6
#193cb8`), no tema escuro sobre a superfície de card:

```
[FAIL] Normal-vision floor   pior par adjacente ΔE 5.9 — abaixo de 15
[FAIL] CVD separation        pior par adjacente ΔE 5.2 (deutan)
```

**Os cinco são o mesmo azul, do claro ao escuro.** Isso é o certo para uma escala de MAGNITUDE e
é frágil para IDENTIDADE — duas séries em degraus vizinhos ficam indistinguíveis.

⚠ **E aqui a acusação precisou ser duvidada, porque ela quase saiu errada.** O uso real não pega
degraus vizinhos: o catálogo usa `--chart-2` e `--chart-4`, pulando um. Medido esse par:

```
[PASS] CVD separation        ΔE 10.6 (deutan) · 12.6 (tritan)
[FAIL] Normal-vision floor   ΔE 13.7 — abaixo de 15, mas perto
```

**Passa no critério de daltonismo, que é o que mais importa, e fica marginalmente abaixo do de
visão normal.** E a web tem legenda sempre — que é exatamente o alívio que a regra prescreve
("a cor nunca é a única coisa que identifica uma série", diz a ficha do `ChartLegend`).

**Conclusão honesta: a web NÃO está quebrada.** A paleta funciona como categórica para duas ou
três séries bem espaçadas **e com legenda**. Fora disso, degrada. Isso não é defeito a corrigir —
é uma **restrição a respeitar**, e ela decide uma coisa no nativo (ver a decisão 4).

⚠ **Trocar a paleta não está em questão:** `--chart-*` são tokens, e a identidade é intocável.

### 4. Os papéis de acessibilidade da web, de novo, não mapeiam

A ficha do `Chart` diz `role="group"`. Medido no `fromRole()` do
`ReactAccessibilityDelegate.kt`: **não há `GROUP`** — ele cai no `else -> null`, como `dialog`
(Lote 5) e `table` (Lote 6). Terceira vez.

E a acessibilidade da web depende de uma coisa que aqui **não existe de jeito nenhum**: a ficha
diz que a navegação entre pontos é *"the engine's accessibility layer, on by default"*, por setas
do teclado. **Não há motor e não há setas.**

## Decisão

**1. O motor é nosso, sobre `react-native-svg`.** Zero dependência nova — ele já é peer desde o
Lote 0, por causa dos 2571 ícones (ADR-0038).

**2. O escopo é MÍNIMO e está declarado aqui**, porque "um motor de gráfico" é ilimitado e é
assim que um item de lote vira um projeto:

| entra | fica de fora, e por quê |
|---|---|
| marcas `line`, `area`, `bar` | **pizza/rosca** — nenhuma demanda medida, e a forma é a pior escolha para comparar magnitude |
| um eixo X categórico, um Y linear | **dois eixos Y** — é o erro nº 1 de gráfico, e não entra nunca |
| grade e marcas de eixo, dos tokens | **empilhado** — sem demanda |
| `ChartLegend` | **animação** — o estático ainda não foi visto em aparelho; pôr movimento antes disso é ordem invertida |
| tocar para selecionar um ponto | **zoom / arrastar** — é o `PanResponder` de novo, e sem demanda |

**3. A legenda é OBRIGATÓRIA com duas ou mais séries.** Não é conselho: é a consequência direta da
medição 3. A cor sozinha não separa as séries desta paleta, e num telefone a marca é mais fina que
na web.

**4. Não há tooltip de ponteiro — o toque SELECIONA um ponto.** No toque não há hover. A ficha da
web diz que o tooltip *"segue o ponteiro e não é focável"*; as duas metades caem aqui.

**5. Os valores são alcançáveis como TEXTO, e é isso que substitui a camada do motor.** A web
delega a acessibilidade ao teclado do `recharts`; aqui isso não existe, então o gráfico expõe os
valores em forma de lista — o padrão de "gráfico acessível" que o próprio guia de visualização
prescreve, e que reusa o que o Lote 6 acabou de construir.

**6. O `Chart` não usa papel nenhum** — `accessible` + `accessibilityLabel`, que é o que agrupa de
verdade no RN. Inventar um papel "parecido" diria uma coisa errada, e é a lição que o Lote 5 e o
Lote 6 já pagaram.

## Consequências

- **O pacote continua com os mesmos seis peers**, dois deles opcionais. O `Chart` não acrescenta
  nenhum.
- **A geometria passa a ser nossa, e portanto nossa para manter.** É o custo real desta decisão, e
  ele está aceito de olhos abertos: escala, eixo e caminho são código do repositório, não de
  terceiro. Em troca, a aparência é 100% da Aurea sem briga.
- ⚠ **A escolha de marcas do eixo é simples de propósito** e está documentada no componente: ela
  divide o intervalo em partes iguais, sem procurar "números redondos". Um algoritmo de *nice
  numbers* é a melhoria óbvia e fica registrada como tal — não como defeito.
- ⚠ **Nada disto rodou em aparelho**, como os Lotes 2 a 6. E o `Chart` é o que mais depende do
  vidro: `react-native-svg` em lista longa era a pendência original da ADR-0038.
- **Se um dia houver demanda de gráfico interativo pesado** (zoom, arrasto, sessenta quadros por
  segundo), a conversa volta para o `victory-native` — e aí os três peers dele passam a ter
  contrapartida. Hoje não têm.
