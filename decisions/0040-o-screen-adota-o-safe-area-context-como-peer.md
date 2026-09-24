# ADR-0040 — O `Screen` adota `react-native-safe-area-context` como peer, e resolve a borda no NATIVO

- **Data:** 03/09/2026
- **Estado:** aceita · **executada** no Lote 1 do [`NATIVE.md`](../docs/NATIVE.md)
- **Autorizada pelo Victor** — *"adota o peer no Screen"*. O `BUILDING.md` §3 manda parar o lote
  quando aparece dependência nova, e foi o que aconteceu: os outros oito componentes do Lote 1
  entraram em 03/09 e o `Screen` ficou de fora, esperando esta palavra.

## Contexto

O `Screen` **não tem par na web**, e não por esquecimento: lá o `<body>` já é a tela. A única regra
da Aurea sobre isso é uma linha, medida em `packages/core/src/aurea.css`:

    body { margin:0; background:var(--background); … }

O navegador resolve o resto — barra de status, entalhe, barra de gestos. **No React Native não há
`<body>`.** A raiz de cada tela é um `View` que alguém precisa mandar preencher, pintar e afastar
do recorte físico do aparelho. Esse alguém passa a ser o `Screen`.

E aí a pergunta deixa de ser de desenho e vira de dependência.

## O que foi medido (03/09/2026)

### O `SafeAreaView` do próprio React Native não serve

| | |
|---|---|
| estado | **deprecado desde a 0.81** |
| Android | nunca fez nada — é literalmente um `View` |
| controle | não devolve o inset; não dá para compor com o padding do tema |

Não é opinião de blog: a própria documentação do React Native marca o componente com o ícone de
depreciação e manda usar a biblioteca da comunidade.

### O substituto de fato, e o que ele custa

`react-native-safe-area-context`, medido contra o registro e contra o tarball:

| | |
|---|---|
| licença | **MIT** |
| última | `5.9.1` |
| o que é | **módulo nativo** — `android/`, `ios/`, `common/cpp/` no tarball |
| Expo Go | **vem embutido**, então o caminho de smoke test continua valendo |
| Expo SDK 57 | fixa **`~5.7.0`** no `bundledNativeModules.json` |
| quem já arrasta | `react-navigation` e `expo-router` |

**A última linha é a que decide o custo.** Um app React Native de verdade tem roteador, e o
roteador já traz esta biblioteca. Adotá-la como peer **não adiciona peso** ao aplicativo do
consumidor: declara o que já ia estar lá de qualquer jeito.

### O que se pesquisou além do óbvio

O Android 15 (API 35) força *edge-to-edge*, e o 16 nem deixa desligar — o que fez aparecer o
`react-native-edge-to-edge`. Ele **não é alternativa a esta decisão**: é a outra metade do
problema (as janelas do sistema), e desde a **RN 0.81** existe a propriedade `edgeToEdgeEnabled`
do Gradle que faz o mesmo. Quem calcula o inset continua sendo o `safe-area-context`, e a versão
**5.x** é a primeira que também acompanha o inset do **teclado** (IME) — que é exatamente o que o
Lote 4, todo de formulário, vai precisar.

### O achado que escolhe a API: `SafeAreaView` vence `useSafeAreaInsets`

A biblioteca oferece as duas formas, e a maioria dos textos recomenda o hook. **Aqui o componente
ganha**, e a razão saiu do fonte C++ (`RNCSafeAreaViewShadowNode.cpp` da 5.9.1), não de gosto:

```cpp
inline float getEdgeValue(std::string edgeMode, float insetValue, float edgeValue) {
  if (edgeMode == "off")          return edgeValue;
  else if (edgeMode == "maximum") return fmax(insetValue, edgeValue);
  else                            return insetValue + edgeValue;   // "additive", o padrão
}
```

O inset **soma ao padding que a folha da Aurea já pôs**, dentro do cálculo de layout do Yoga,
antes do primeiro quadro. Com o hook, esse padding sairia de um estado que só tem valor **depois**
que o nativo avisa: um quadro com o conteúdo embaixo do entalhe, e um re-render a cada rotação.

E o modo `additive` **não é novidade da 5.9**: ele está no `SafeAreaView.js` desde a **5.0.0**
(medido nas duas versões). Por isso o peer é `>=5` e não `>=5.9` — o intervalo cobre o que o Expo
SDK 57 fixa hoje e o que o registro publica agora.

## Decisão

1. **`react-native-safe-area-context` entra como peer `>=5`** do `@aurea-uds/native` — **não
   opcional**. Peer opcional devolveria erro obscuro em tempo de execução, que é a classe de
   defeito que este pacote inteiro existe para não ter. É o mesmo tratamento que o
   `react-native-svg` já tem por causa dos ícones.
2. **O `Screen` usa o `SafeAreaView` da biblioteca**, com `edges` na forma de **lista**, que vira
   `additive` nas bordas citadas e `off` nas outras (medido no `SafeAreaView.js` da 5.9.1).
3. **O padrão são as quatro bordas.** Em paisagem o entalhe fica à esquerda ou à direita, e a
   barra de gestos do Android mora embaixo — uma tela só com `top` quebra ao girar.
4. **A Aurea não reembrulha a API de terceiro.** Quem precisar do modo `maximum` usa o
   `SafeAreaView` da biblioteca direto, e quem precisar dos números usa `useSafeAreaInsets` — os
   dois continuam importáveis. Dar dois nomes à mesma coisa é o que faz um design system envelhecer.
5. **`scroll` muda onde o respiro cai**, e isso é contrato, não detalhe: sem ele o padding é da
   raiz; com ele vai para o `contentContainerStyle`. Padding no próprio `ScrollView` recorta a
   área rolável e leva a barra de rolagem para dentro.

## Consequências

- O `@aurea-uds/native` passa a ter **quatro peers**, um deles módulo nativo. Um app que só use
  `Text`, `Card` e `Button` ainda precisa declará-lo — é o custo aceito no item 1.
- O `apps/native-smoke/` declarou a mesma dependência em **`~5.7.0`**, a versão do Expo SDK 57.
  Não é para ele usar: é porque o `preparar.mjs` reempacota os tarballs a cada execução, então o
  peer novo alcança o app mesmo sem ele importar o `Screen`.
- **Dez testes** cobrem o `Screen` (a suíte foi de 1168 para 1178), e **cinco defeitos** foram
  injetados e reprovados: só a borda de cima, padding no próprio `ScrollView`, `...rest` no
  rolador, conteúdo sem `flexGrow`, fundo em hex cravado.

## O limite honesto — MEDIDO em 04/09/2026, e ele encolheu

⚠ **Esta seção dizia "nada disto desenhou num aparelho". Deixou de ser verdade em 04/09/2026**, e
a correção sobe para cá em vez de morar só no README do smoke — que é o defeito de forma que o
`NATIVE.md` §7 nomeia: *corrigir onde se descobriu não é corrigir*.

O `apps/native-smoke/` ganhou um modo para o `Screen` e o Victor rodou. **Das três perguntas, uma
passou, uma ficou parcial e uma ficou sem resposta:**

| # | pergunta | resultado |
|---|---|---|
| 1 | o inset soma ao `--space-4`? | ⚠ **PARCIAL** — `medido = esperado` em todas as combinações, mas o **inset foi 0**: a conta fecha sem exercitar a soma |
| 2 | em paisagem as bordas laterais protegem? | ⚠ **SEM RESPOSTA** — aparelho não girou; e com inset 0 não mudaria |
| 3 | com `scroll`, recorta ou passa sob a barra? | ✅ **RECORTA** — *"quando rolo ela sobe e some"* |

**O que passou a estar provado em aparelho:** o padding do tema é aplicado e medido pelo lado de
fora (`onLayout` do filho); e a decisão 5 desta ADR — `scroll` move o respiro para o
`contentContainerStyle` — vale no vidro, não só no teste.

**O que continua provado só no fonte C++ e no teste unitário:** a soma `additive` em si. Fecha com
um dev client (`expo prebuild`, onde o edge-to-edge do Android 16 é obrigatório) ou com um
aparelho com entalhe. **Não bloqueia nada hoje.**

### O que segue valendo desta seção

**Nada disto desenhou num aparelho** *(vale para o que sobrou acima)*. O que existe é fonte C++ lido, contrato de pacote medido e
teste unitário sobre um dublê — e o dublê **não calcula inset nenhum**, porque quem calcula é
código Kotlin/ObjC. As perguntas que só a tela responde:

1. o inset **soma mesmo** ao `--space-4`, ou aparece dobrado/ausente?
2. em **paisagem**, as bordas laterais protegem o conteúdo?
3. com `scroll`, o conteúdo rola **sob** a barra de status ou é recortado nela?

O `apps/native-smoke/` é o lugar onde isso se responde, e ele **não foi estendido** para o
`Screen` — a fronteira do app é o Lote 0, e movê-la é decisão do Victor, não deste documento.
