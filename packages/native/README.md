# @aurea-uds/native

O alvo **React Native** da Aurea UDS.

Pacote **irmão** do `@aurea-uds/react`, não um wrapper dele: componentes próprios sobre
`View`/`Text`/`Pressable`, consumindo `@aurea-uds/tokens`. Só os tokens atravessam — decisão de
18/07/2026, registrada no `ROADMAP.md` Fase 7.

> **Estado: 51 componentes.** O **Lote 7** entrou em 11/09/2026 e é o primeiro que **não sai do
> plano** — ele saiu do APP. O consumidor mediu três lacunas na primeira tela que a pessoa toca, e
> elas viraram cinco componentes: **`Combobox`, `SearchField`, `NumberField`, `Image` e
> `Gallery`**, mais a prop `formatOnBlur` no `Input`. **Zero dependência nova.**
> Ver a seção **Buscar, número e mídia** abaixo, e o `NATIVE.md` §8.
>
> ⚠ **O `Combobox` DIVERGE da web de propósito** — ele aceita busca REMOTA em seleção única, que
> lá não existe ([ADR-0043](../../decisions/0043-o-combobox-nativo-diverge-da-web-e-a-presenca-da-prop-e-a-chave.md)).
> ⚠ **Os cinco do Lote 7 ainda não rodaram em aparelho** — só em teste.
>
> **O PLANO fechou no Lote 6**, em 09/09/2026 (`Timeline`, `DataList`, `Table`), e o **`Chart`** —
> a única peça que tinha ficado de fora — entrou no mesmo dia pela
> [ADR-0041](../../decisions/0041-o-motor-de-grafico-do-nativo-e-nosso-sobre-react-native-svg.md).
>
> ⚠ **O `Chart` é o único componente deste pacote cuja GEOMETRIA é nossa.** Na web ele é 79 linhas
> de pele sobre o `recharts`; aqui não há motor, então escala, eixo e caminho são código do
> repositório. **Zero dependência nova.** Ver a seção **Gráfico** abaixo.
>
> ⚠ **A `Table` do nativo NÃO é uma tabela**: cada linha vira um cartão e cada célula leva o nome
> da coluna junto. **A API é outra** — `columns` + `rows`, porque não há `<thead>` para escrever.
> Ver a seção **Dados** abaixo, que tem a medição inteira.
>
> **Lote 5 COMPLETO.** Os overlays entraram em 08/09/2026:
> `Dialog`, `ConfirmDialog`, `Drawer`, `BottomSheet` e o par `ToastHost`/`useToast`.
>
> ⚠ **O achado do lote é de ACESSIBILIDADE, e ele vale para todo o pacote:** o React Native
> **aceita** `role="dialog"` e `role="alertdialog"` — compila, passa o `tsc`, atravessa o Fabric —
> e **não os mapeia em nenhuma das duas plataformas.** Ver a seção **Confirmar e avisar** abaixo.
>
> **Lote 4 COMPLETO.** Os formulários entraram em 08/09/2026:
> `Field`, `Label`, `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `Radio`,
> `SegmentedControl`, `Form`, `KeyboardAvoiding`. Os dois últimos — **`DatePicker` e
> `PhotoInput`** — exigiram dependência nova, pararam o lote e voltaram para o Victor
> (`BUILDING.md` §3); ele autorizou os dois. Eles **não saem pelo barril**: moram em
> `@aurea-uds/native/system` — ver a seção **Data e câmera** abaixo.
>
> **Lote 3 COMPLETO — a moldura.** A moldura entrou em 08/09/2026:
> `BottomNav`, `Topbar`, `NavList`, `Stepper` — e o **puxar-para-atualizar**, que virou
> `onRefresh`/`refreshing` no `Screen`. ⚠ **A Aurea não entrega roteamento:**
> `expo-router`/`react-navigation` é escolha do app; daqui sai a pele.
>
> **Lote 2 COMPLETO — o painel de leitura.** O painel de leitura entrou em 08/09/2026: `KPI`,
> `Progress`, `Status`, `Badge`, `Alert`, `Skeleton`, `Spinner`, `EmptyState`, `DataState` e
> `Avatar`. Com ele vieram duas coisas que valem saber antes de usar: a tabela de **frases**
> (`<AureaProvider strings>`) e o hook **`useReduceMotion`** — ver as seções abaixo.
>
> **Lote 1 COMPLETO — os dez.** O chão (Lote 0) foi provado num Android em 03/09/2026 —
> as quatro perguntas do `NATIVE.md` §7 passaram — e sobre ele entraram `Text`, `Screen`, `Stack`,
> `Cluster`, `Grid`, `Card`, `Icon`, `Button` e `IconButton`.
>
> O `Screen` chegou por último e sozinho: ele foi o único que precisou de dependência nova, então
> parou o lote e voltou para o Victor (`BUILDING.md` §3). Ele autorizou o peer —
> [ADR-0040](../../decisions/0040-o-screen-adota-o-safe-area-context-como-peer.md).

## Instalação

```sh
pnpm add @aurea-uds/native react-native-svg react-native-safe-area-context
```

Quatro **peers obrigatórios**: `react` (≥19), `react-native` (≥0.76, pela Nova Arquitetura),
`react-native-svg` (≥15, pelos ícones) e `react-native-safe-area-context` (≥5, pelo `Screen`).
Para o texto sair no IBM Plex, some `@aurea-uds/fonts`.

O último costuma **já estar instalado**: `react-navigation` e `expo-router` o arrastam. Declará-lo
como peer não adiciona peso ao app — só diz o que já ia estar lá.

E **dois peers OPCIONAIS**, marcados como tal em `peerDependenciesMeta` — quem não usa data nem
câmera não instala nada e não vê aviso:

```sh
pnpm add @react-native-community/datetimepicker expo-image-picker
```

| | | |
|---|---|---|
| `@react-native-community/datetimepicker` | ≥8 | MIT · só para o `DatePicker` |
| `expo-image-picker` | ≥16 | MIT · só para o `PhotoInput` |

## Tema × densidade

Dois eixos, como na web: tema (`dark`/`light`) × densidade
(`compact`/`comfortable`/`spacious`). No React Native **não há cascata**, então alguém tem de
resolver os dois num valor — é o que o provider faz, e é a razão de ele existir
([ADR-0037](../../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md): o motor é o
`StyleSheet` puro e a camada de tema é nossa).

```tsx
import {AureaProvider, Button, Card, Cluster, Screen, Stack, Text} from "@aurea-uds/native";
import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
import {useFonts} from "expo-font";

export default function App() {
  const [pronto] = useFonts(AUREA_FONTS);
  if (!pronto) return null;
  return (
    <AureaProvider fontFamilies={FONT_FAMILIES}>
      <Screen scroll><Cartao /></Screen>
    </AureaProvider>
  );
}

function Cartao() {
  return (
    <Card variant="raised">
      <Stack>
        <Text size="lg" weight={600}>Aurea</Text>
        <Text tone="muted">O `Card` já traz raio, superfície e sombra do tema.</Text>
        <Cluster>
          <Button tone="brand" leadingIcon="add">Novo</Button>
          <Button appearance="outline">Cancelar</Button>
        </Cluster>
      </Stack>
    </Card>
  );
}
```

### Escrevendo estilo próprio

Use `criarFolha`, não `StyleSheet.create` direto — ela memoiza por par (tema, densidade), então
vinte instâncias do mesmo componente produzem **uma** folha, não vinte:

```tsx
import {criarFolha, useAureaTokens} from "@aurea-uds/native";

const folha = criarFolha((t) => ({
  caixa: {backgroundColor: t.color.surface2, padding: t.size.space4},
}));

function Meu() {
  const s = folha(useAureaTokens());
  return <View style={s.caixa} />;
}
```

Isso não é preciosismo: o smoke test no Android mediu **182 ms** de troca de tema com o app
recriando a folha a cada render de propósito, para medir o pior caso.

### A casca de uma tela

```tsx
<Screen scroll>
  <Text size="xl" weight={600}>Painel</Text>
  <Card>…</Card>
</Screen>
```

Preenche, pinta com o fundo do tema e afasta do entalhe e da barra de gestos. **As quatro bordas
por padrão** — em paisagem o entalhe fica de lado, e uma tela só com `top` quebra ao girar.

`padded={false}` para lista de borda a borda. `scroll` embrulha num `ScrollView` e **muda onde o
respiro cai**: ele vai para o `contentContainerStyle`, porque padding no próprio `ScrollView`
recorta a área rolável.

Não precisa de `SafeAreaProvider` acima: o `SafeAreaView` da biblioteca é view nativa e lê o inset
sozinha. Quem exige o provider são os **hooks** — e quem usa `react-navigation` já o tem.

### Alvo de toque

Três das cinco alturas de controle (26, 30, 36 dp) são menores que `--target-min` (44). O `Button`
resolve isso **sem mexer no desenho**: o `Pressable` tem `minHeight: 44` e a caixa pintada mantém
a altura do token.

Não é `hitSlop` de propósito — ele **não é lido pelo TalkBack**, e deixaria o alvo pequeno
justamente para quem usa leitor de tela.

`useAureaTheme()` devolve `{theme, density, setTheme, setDensity, toggleTheme}` — a mesma forma do
hook homônimo de `@aurea-uds/react`. `useAureaTokens()` devolve os valores já resolvidos, e **não
tem par na web** porque lá o CSS os resolve no uso.

Sem `<AureaProvider>` acima, os dois hooks **levantam**. É decisão: um padrão silencioso
desenharia o app inteiro no tema errado sem nada acusar.

## Os formulários

```tsx
<Form>
  <Field label="Quilometragem" hint="Só números" error={erros.km}>
    <Input keyboardType="numeric" value={km} onChangeText={setKm} />
  </Field>
  <Field label="Combustível">
    <Select items={[{value: "g", label: "Gasolina"}, {value: "e", label: "Etanol"}]}
            value={comb} onChange={setComb} />
  </Field>
  <Switch label="Lembrar deste veículo" checked={lembrar} onChange={setLembrar} />
</Form>
```

⚠ **O `Field` é o que dá NOME ao controle**, e isso é a diferença mais importante em relação à
web. Lá o `<label for>` aponta para um `id`; **no React Native não há `id` nem `htmlFor`** — o
nome é uma string no próprio controle. O `Field` empurra `label`, `hint` e o estado de inválido
por contexto, e é por isso que um `Input` solto, fora de um `Field`, **não tem nome** para quem
usa leitor de tela.

⚠ **`error` não é só texto vermelho:** ele marca o controle como inválido e vira a dica que o
leitor anuncia.

⚠ **`keyboardType="numeric"`** é o que faz digitar `12,4` custar dois toques em vez de oito.

### O que é diferente da web, e por quê

| | |
|---|---|
| `Switch` | **não é o do React Native** — aquele traz o interruptor do Material. Medidas do CSS |
| `Select` | não existe `<select>` no RN: é `Modal` + folha que sobe. O papel é `button`, não `combobox` — `combobox` promete um campo em que se digita |
| `Form` | é só o respiro. Não há `<form>`, `submit` nem validação de plataforma; o erro de cada campo vai no `Field` |
| `Field` | sem `orientation="horizontal"` — numa tela de 360dp a grade de `12rem` deixa o controle com menos de metade da largura |
| `Radio` | sem `name` — o agrupamento é do estado do app, não do DOM |
| `:hover` | não há ponteiro. O foco continua, e é a única pista de qual campo o teclado alimenta |

### Teclado

```tsx
<KeyboardAvoiding offset={alturaDaTopbar}>
  <Screen scroll>…</Screen>
</KeyboardAvoiding>
```

O `behavior` muda com a plataforma — `padding` no iOS, `height` no Android — e a Aurea escolhe
por você. Um só nos dois lados deixa metade dos aparelhos com o botão de salvar sob o teclado.

## Buscar, número e mídia

O **Lote 7** (11/09/2026). Três lacunas que o app mediu, e não o plano — `NATIVE.md` §8.

### `Combobox` — digitar para achar um item

⚠ **Não confunda com o `Select`.** A escolha entre os dois é de TAMANHO DE LISTA, e a linha é
dura: o `Select` monta todos os itens num `ScrollView` — serve para unidades, estados e tipos.
**Um catálogo de milhares de linhas ali trava.** O `Combobox` usa `FlatList` e aceita busca remota.

```tsx
import {Combobox, Field} from "@aurea-uds/native";

// ① catálogo REMOTO — a Aurea não filtra, o app busca
<Field label="Item">
  <Combobox
    items={resultados}          // a lista JÁ BUSCADA
    value={escolhido}           // o ITEM inteiro, não o id
    onValueChange={setEscolhido}
    onSearchChange={buscar}     // ← a presença desta prop DESLIGA o filtro da Aurea
    loading={buscando}
    onEndReached={proximaPagina}
  />
</Field>

// ② lista NA MÃO — a Aurea filtra, ignorando acento e caixa
<Combobox items={unidades} value={unidade} onValueChange={setUnidade} />
```

**A regra em uma linha: `onSearchChange` presente = a Aurea não filtra.** É presença de prop, não
configuração — e ela existe porque filtrar de novo o que o servidor devolveu esconde resultado.

| | |
|---|---|
| espera antes de chamar `onSearchChange` | **250 ms**. `searchDelay={0}` desliga |
| onde se digita | **dentro da folha**, não no gatilho — o teclado ocupa metade da tela |
| `value` | o **item inteiro**: numa busca remota a lista some debaixo da escolha |
| ícones a registrar | `chevron--down`, `search`, `close` |

### `SearchField` — filtrar o que já está na tela

Outro papel: o `Combobox` **escolhe** de um catálogo e devolve a escolha; este **filtra** e
devolve texto.

```tsx
<SearchField placeholder="Filtrar" onSearchChange={setFiltro} />
```

### `NumberField` — moeda, medida e contador

```tsx
<Field label="Valor">
  <NumberField value={valor} onValueChange={setValor}
               format={{style: "currency", currency: "BRL"}} locale="pt-BR" />
</Field>

<Field label="Litros">
  <NumberField value={litros} onValueChange={setLitros}
               format={{maximumFractionDigits: 1}} locale="pt-BR" min={0} />
</Field>

<Field label="Quantidade">
  <NumberField value={qtd} onValueChange={setQtd} min={0} step={1} />
</Field>
```

⚠ **O que sai por `onValueChange` é `number`, sempre** — `1234.5`, nunca `"R$ 1.234,50"`.

⚠ **Formata no BLUR, e só no blur** ([ADR-0024](../../decisions/0024-mascara-de-campo-e-o-momento-nao-o-formato.md)
e [ADR-0042](../../decisions/0042-o-intl-e-o-formatador-do-nativo-e-a-volta-e-nossa.md)). Enquanto
o campo tem foco, ele mostra exatamente o que foi digitado. Máscara ao vivo é o defeito que o
USWDS publicou com reprovação WCAG registrada e que o MUI abandonou na v6.

⚠ **`notation: "compact"` é recusado** — quebrado no motor JS do RN nos dois sistemas. Sai aviso em
`__DEV__` e a opção é ignorada; o resto do formato sobrevive.

Os três auxiliares são públicos, porque o app tem o mesmo problema fora do campo:

```tsx
import {formatarNumero, lerNumero, separadoresDoLocale} from "@aurea-uds/native";

formatarNumero(1234.5, "pt-BR", {style: "currency", currency: "BRL"});  // "R$ 1.234,50"
lerNumero("R$ 1.234,50", "pt-BR");                                      // 1234.5
lerNumero("", "pt-BR");                                                 // null  ← não é 0
```

Para **texto** (placa, documento, telefone) o momento é o mesmo e o formato é seu:

```tsx
<Input value={placa} onChangeText={setPlaca} formatOnBlur={(v) => v.toUpperCase()} />
```

⚠ `formatOnBlur` exige o campo **controlado** — o valor formatado sai por `onChangeText`.

### `Image` e `Gallery` — mostrar foto

⚠ **`Image` NÃO é o `Image` do React Native com outra pele.** Ele faz as duas coisas que o
primitivo cru não faz: **reserva a caixa** antes dos bytes (sem isso o layout salta) e **cai para
um substituto** quando eles não vêm (sem isso uma URL quebrada deixa buraco).

```tsx
<Image source={foto.uri} alt="Frente do item" ratio="4/3" />

<Gallery items={fotos} zoom selected={atual} onSelect={setAtual} />
```

| | |
|---|---|
| `ratio` | aceita `4/3`, `"4/3"`, `"16:9"` ou o número. A web usa string; o RN quer número |
| `alt` | **obrigatório**. Decorativa de verdade se escreve `alt=""`, explícito |
| ampliar | é o **`Dialog`** que já existe, não uma superfície nova |
| legenda | com legenda, o nome vai para o LADRILHO e a imagem sai da árvore de acessibilidade |
| ícone a registrar | `image` (o substituto) |

Quem já usa `expo-image` por cache de disco troca o elemento sem perder a pele:

```tsx
<Image render={<ExpoImage contentFit="cover" transition={150} />} source={u} alt="…" />
```

⚠ `fit` **não** é traduzido para o elemento passado — `resizeMode` é do `Image` do RN e o
`expo-image` chama a mesma coisa de `contentFit`. Quem passa o elemento escreve a prop dele.

## Data e câmera

Estes dois **não saem do barril** — são o único ponto do pacote com importação própria:

```tsx
import {DatePicker, PhotoInput} from "@aurea-uds/native/system";
```

⚠ **E o caminho profundo é a forma documentada, pelo mesmo motivo dos ícones**
([ADR-0038](../../decisions/0038-um-componente-por-icone-sobre-react-native-svg.md)): um módulo
que ninguém importa **não entra no grafo do Metro**. Se eles saíssem por `@aurea-uds/native`, todo
app que importasse um `Button` arrastaria o seletor de data e a câmera para o bundle — e falharia
na resolução se os peers opcionais não estivessem instalados. Preguiça por construção, não por
poda.

```tsx
<Field label="Data do lançamento">
  <DatePicker value={data} onChange={setData} maximumDate={new Date()} />
</Field>

<Field label="Comprovante">
  <PhotoInput value={fotos} onChange={setFotos} max={3} />
</Field>
```

### `DatePicker` — a nossa pele, o calendário deles

A Aurea desenha o **gatilho** (mesma altura, mesma borda e o mesmo raio do `Input`); o que abre é
o **diálogo do sistema**. Data é um controle que o Android e o iOS fazem melhor e que a pessoa já
sabe usar — reimplementá-lo daria um calendário com a nossa cor e o comportamento errado em nove
casos de borda (fuso, calendário não gregoriano, entrada por teclado, TalkBack).

⚠ **As duas plataformas têm APIs diferentes, e é isso que o componente esconde:**

| | |
|---|---|
| Android | `DateTimePickerAndroid.open({…})` — **imperativo**, o diálogo é do sistema |
| iOS | `<RNDateTimePicker>` — **declarativo**, vira um nó na árvore |

Um app que não soubesse disso escreveria o caminho do Android e veria **nada acontecer** no
iPhone.

⚠ **Cancelar não escreve data.** No Android o evento volta com `type: "dismissed"`, e só
`type === "set"` chama o `onChange`. É o caso de borda mais fácil de errar, e há um teste cujo
único trabalho é reprová-lo.

### `PhotoInput` — as decisões de fluxo, declaradas

⚠ **Câmera não é componente, é fluxo** — permissão, intent, prévia, e o que fazer quando a pessoa
nega. Cada pergunta ficou com um padrão, e **cada padrão tem uma saída**:

| a pergunta | o que ficou | como mudar |
|---|---|---|
| o que mostrar **sem** permissão? | o gatilho aparece normal; tocar é que pergunta | — |
| e se a pessoa **negar**? | pergunta de novo na próxima vez, enquanto o sistema deixar | `onPermissionDenied` |
| e se negar **de vez** (`canAskAgain: false`)? | um `Alert` de aviso + botão para as configurações | `offerSettings={false}` |
| câmera ou galeria? | **câmera** | `source="library"` |
| como remover? | um `IconButton` no canto de cada miniatura | `removeIcon` |
| quantas cabem? | **uma** | `max` |

⚠ **O gatilho some ao atingir o limite**, em vez de ficar aceso e não fazer nada — botão que
existe e não responde é o defeito, não a proteção.

⚠ **`source="library"` NÃO pede a permissão de câmera.** São permissões diferentes, e pedir a
errada é um diálogo assustador que o app não precisava mostrar.

As frases (`cameraDenied`, `openSettings`, `photoRemove`, `datePlaceholder`) saem da tabela de
**Frases** — ver a seção abaixo.

## Gráfico

```tsx
import {Chart} from "@aurea-uds/native";

<Chart
  label="Custo por mês"
  labels={["jan", "fev", "mar", "abr"]}
  series={[{name: "Custo", data: [210, 198, 240, 187]}]}
  mark="area"
  formatValue={(v) => `R$ ${v}`} />
```

### ⚠ Ele é o único cuja geometria é nossa

Na web o `Chart` **não desenha**: a ficha diz *"Aurea does not wrap the chart types: the engine
draws, this component holds"*, e o arquivo tem 79 linhas de pele sobre o `recharts`. **Aqui não há
motor.** Escala, régua, caminho e eixo são código deste repositório.

As quatro bibliotecas de gráfico do React Native foram medidas no registro e recusadas — a razão
de cada uma está na [ADR-0041](../../decisions/0041-o-motor-de-grafico-do-nativo-e-nosso-sobre-react-native-svg.md).
A que mais importa: `react-native-chart-kit` não traz peer novo nenhum, e mesmo assim não serve,
porque é `data` entra / gráfico sai. O `recharts` é **marca composta** — adotá-la inverteria a
relação em que a Aurea segura e o motor desenha com as props dela.

**Zero dependência nova:** `react-native-svg` já é peer desde os ícones.

### O escopo, declarado

| entra | fica de fora |
|---|---|
| `line`, `area`, `bar` (e misturar as três) | pizza/rosca · **dois eixos Y** (é o erro nº 1 de gráfico) · empilhado · animação · zoom |

### ⚠ A legenda NÃO desliga com duas ou mais séries

Não é conselho — é medição. A paleta `--chart-1..5` é **o mesmo azul do claro ao escuro**: uma
rampa de magnitude, não um conjunto de identidade. Rodado o validador:

```
os cinco, pares vizinhos   ΔE 5.9 (visão normal)  ·  5.2 (daltonismo)   FALHA
--chart-2 + --chart-4      ΔE 13.7                ·  10.6               passa no daltonismo
```

Por isso a ordem padrão de cores **pula um degrau** e começa pelo par medido. E por isso a legenda
é obrigatória: num telefone a marca é mais fina que na web, e a cor sozinha não separa as séries
desta rampa.

### ⚠ Não há tooltip — o toque seleciona

A ficha da web diz que o tooltip *"segue o ponteiro e não é focável"*. **As duas metades caem no
toque.** No lugar: cada rótulo é um alvo, e o nome dele carrega os valores —
`"jan, Custo: 210, Meta: 200"`.

### ⚠ A lista de valores é a camada de acessibilidade, e vem LIGADA

A web delega a acessibilidade ao teclado do `recharts` (*"navegação por seta entre os pontos,
ligada por padrão"*). **Não há motor e não há setas.** O que substitui é `showValues`: ao
selecionar um ponto, os valores saem em texto. Desligue só se já resolveu o mesmo problema por
outro caminho.

### O que mais é diferente

| | |
|---|---|
| `role="group"` | **não mapeia** — cai em `else -> null` no Android, como `dialog` (Lote 5) e `table` (Lote 6). Aqui é `accessible` + `accessibilityLabel`, que é o que agrupa de verdade |
| altura | a web recusa uma prop de propósito (*"a caixa mede pelo CSS"*). **Aqui não há CSS**, então `height` existe — com o mesmo padrão de lá, 220 |
| buraco na série | `null` **PULA**: não vira zero e não liga os vizinhos por cima. Ligar inventaria um dado que não existe |
| a base da barra | o zero entra na régua sempre que os dados são positivos. **Barra que não nasce no zero mente sobre a proporção** |

⚠ **A régua do eixo Y divide o intervalo em partes iguais e não procura números redondos** — um
eixo de 0 a 97 sai `0 · 24,25 · 48,5 · …`, não `0 · 25 · 50 · …`. Está registrado na ADR-0041
**como melhoria, não como defeito**: o que existe é correto, só não é bonito.

## Dados

```tsx
import {DataList, Table, Timeline} from "@aurea-uds/native";
```

### ⚠ A `Table` não é uma tabela aqui — e isso não é um recuo

Duas medições decidem o desenho, e elas apontam para o mesmo lugar:

| | |
|---|---|
| **o papel não mapeia** | `accessibilityRole` não tem `table`; o `role` tem, e cai em `else -> null` no Android e sem trait no iOS — a mesma armadilha que o Lote 5 mediu no `dialog`. **Uma grade de verdade não se anunciaria como tabela em plataforma nenhuma** |
| **a grade não cabe** | `.table` tem `min-width: 720px` (aurea.css:1183). Num telefone de 360dp isso é rolagem horizontal de 2× — e a própria ficha da web só a aceita porque a região é focável pelo teclado. **No toque não há teclado**: sobra o arrastar, que a web já considerava a metade insuficiente |

```
manter a grade  ->  perde a leitura   E  não ganha a semântica
virar lista     ->  ganha a leitura   E  ganha `accessibilityRole="list"`, que MAPEIA
```

**Só a lista tem as duas.**

⚠ **O modo GRADE não foi construído**, de propósito: ele só faria sentido em tablet, e não há
tablet medido. No nativo vale **demanda antes de cobertura** (o inverso da ADR-0015, que vale para
a web) — meia-grade entregue seria pior que grade nenhuma. Ele volta como prop quando existir uma
tela de tablet medida.

### `Table`

```tsx
<Table
  caption="Lançamentos"
  columns={[
    {key: "data", header: "Data", primary: true},
    {key: "km", header: "Quilometragem"},
    {key: "custo", header: "Custo", cell: (l) => moeda(l.custo)},
  ]}
  rows={lancamentos}
  keyExtractor={(l) => l.id}
  onRowPress={abrir} />
```

⚠ **A API é OUTRA que a da web, e tinha de ser.** Lá você escreve `<thead>`/`<tbody>` como
`children`. Aqui não existem elementos de tabela para escrever, então a peça recebe **dados**.
Não é a mesma prop com outro nome — é uma superfície diferente, dita aqui em vez de descoberta no
erro de tipo.

⚠ **O cabeçalho não some: ele se muda.** Cada `header` passa a nomear a sua célula dentro do
cartão. É o que impede o defeito clássico da tabela virada em lista — quatro números soltos, um
embaixo do outro, sem dizer o que cada um é.

⚠ **`primary` marca a coluna que identifica a linha** (numa lista de lançamentos, a data). Ela
vira o título do cartão e **não repete o próprio nome**.

⚠ **A linha só vira alvo com `onRowPress`.** Uma linha tocável sem ação seria anunciada como
botão e não faria nada.

### `Timeline` e `DataList`

```tsx
<Timeline items={[{title: "Criado", description: "pelo app", time: "08/09 14:20"}]} />

<DataList items={[{term: "Quilometragem", value: "12,4 km/l"}]} />
```

⚠ **No `DataList`, cada par é UM nó acessível** com o nome `"termo: valor"`. Na web o `<dl>`
garante o par de graça; aqui não há `<dl>` nem papel de lista de definição, então a ligação tem de
ser dita. Sem isso, quem varre com o dedo ouve "Quilometragem", dá um passo, ouve "12,4 km/l" — e
num painel de oito pares perde qual valor era de qual termo.

⚠ **Ele empilha abaixo de 640dp, no mesmo ponto da web.** O comentário do CSS registra o defeito
que a regra evita: a 320px a coluna do valor resolvia em **0px** e jogava o texto para fora da
página. `layout="inline"` / `"stacked"` força, contra a largura.

⚠ **No `Timeline` a contagem e a posição NÃO são anunciadas**, e é escolha. Na web ele é um
`<ol>`, e a ficha diz que o leitor anuncia "1 de 40" de graça; aqui esse "de graça" não existe e
teria de ser escrito item a item. Pendurar isso em cada evento de um histórico é ruído a cada
parada do leitor — e a ordem cronológica já está no `time`, que é a informação de verdade. **Quem
precisa de posição precisa é da data.**

### Lista longa: `virtualized`

```tsx
<Screen>                                {/* SEM `scroll` */}
  <Table … rows={mil} virtualized />
</Screen>
```

`virtualized` troca o `map` por um `FlatList`, que só monta o que está na tela. É a resposta à
pendência que a [ADR-0038](../../decisions/0038-um-componente-por-icone-sobre-react-native-svg.md)
deixou aberta em 31/08/2026 — *"o desempenho em lista longa volta a importar quando existir tela
de lista"*. **Esta é a tela de lista.**

⚠ **Com `virtualized`, o componente É o rolador — não o ponha dentro de `<Screen scroll>`.** Dois
roladores no mesmo eixo é erro conhecido do RN: o de fora dá altura infinita ao de dentro, a
virtualização desliga, e o console avisa *"VirtualizedLists should never be nested inside plain
ScrollViews"*.

⚠ **E o trilho do `Timeline` não é desenhado no modo virtualizado** — honestidade, não defeito.
Ele é uma linha do topo ao pé da lista INTEIRA, e no `FlatList` a lista inteira não existe: só a
janela. Desenhá-lo daria um trilho que começa e termina no lugar errado conforme se rola. Os
pontos continuam.

## Confirmar e avisar

```tsx
import {BottomSheet, ConfirmDialog, Dialog, Drawer, ToastHost, useToast} from "@aurea-uds/native";
```

### ⚠ Primeiro, o que NÃO funciona — e passa em tudo

O React Native aceita `role="dialog"` e `role="alertdialog"`. Eles estão no tipo, compilam, e
atravessam o C++ do Fabric. **E não fazem nada no aparelho.** Medido em 08/09/2026, nas duas
pontas, no fonte do `react-native@0.87.1`:

| plataforma | onde morre |
|---|---|
| Android | `ReactAccessibilityDelegate.kt:515`, `fromRole()` cai em `else -> null` — com o comentário do próprio RN: *"No mapping from ARIA role to AccessibilityRole"* |
| iOS | a lista de traits (`accessibilityPropsConversions.h:24-104`) **não tem** `dialog` nem `alertdialog`; a string de `role` só desempata `checkbox` e `radio` |

**Isto é pior do que o papel não existir.** Um componente que os usasse passaria na revisão de
código, passaria no `tsc`, passaria em qualquer teste que perguntasse "a prop está lá?" — e seria
inútil para quem usa leitor de tela. Há um teste neste repositório cujo único trabalho é reprovar
essas duas palavras.

**O que a Aurea faz em vez disso:**

| a web | aqui |
|---|---|
| `role="dialog"` + foco preso | o **`Modal`** do RN. Ele é uma **janela do sistema**, e tanto o TalkBack quanto o VoiceOver já se limitam à janela de cima — o confinamento vem do sistema operacional, não de um laço de `Tab` em JavaScript |
| `Escape` fecha | **`onRequestClose`** — o botão VOLTAR do Android. O RN documenta a prop como obrigatória; sem ela a caixa fica **presa** |
| `aria-labelledby` | o título é um `Text` com `accessibilityRole="header"` — o único papel desta família que o Android mapeia |
| `aria-describedby` | não existe. A frase é lida por **estar na ordem**, e é por isso que ela vem antes dos botões na árvore |
| `backdrop-filter: blur(5px)` | **não atravessa.** Não há filtro de fundo no RN, e o que existe (`expo-blur`) é dependência nova. O `--overlay` já é preto a 74% e separa sozinho |

### `Dialog` e `ConfirmDialog`

```tsx
<Dialog open={aberto} title="Editar lançamento" onClose={fechar}
        footer={<><Button appearance="outline" onPress={fechar}>Cancelar</Button>
                  <Button onPress={salvar}>Salvar</Button></>}>
  <Field label="Quilometragem"><Input value={km} onChangeText={setKm} /></Field>
</Dialog>

<ConfirmDialog open={perguntando} destructive
               title="Apagar este lançamento?"
               description="Ele sai do histórico e do custo/km. Isto não volta."
               confirmLabel="Apagar" onConfirm={apagar} onCancel={desistir} />
```

⚠ **O `ConfirmDialog` NÃO é um `Dialog` com dois botões.** A diferença é de comportamento e ela
atravessou inteira da web: **tocar fora não fecha.** Um toque fora virando "cancelei" é o acidente
que o componente existe para impedir.

⚠ **O que não atravessou, e é honesto dizer:** na web o foco nasce no botão seguro, porque quem
abre um "isto apaga" e aperta Enter por reflexo tem de cancelar. **No toque não há esse reflexo** —
não há foco de teclado nem Enter. Mover o foco do *leitor de tela* para o Cancelar traduziria o
mecanismo e perderia a intenção: pularia justamente a frase que diz o que se perde. Então o foco
não é movido, e o que sobra é o que vale aqui: o fundo não fecha, e a **ordem** é cancelar →
confirmar.

⚠ **`description` é obrigatória**, e diz o que se perde e se volta.

### `Drawer`

```tsx
<Drawer open={aberto} title="Filtros" side="right" onClose={fechar}>…</Drawer>
```

⚠ **O lado é FÍSICO, não lógico.** A razão vem da ficha da web e vale igual: um painel preso à
direção da escrita mudaria de lado ao trocar o idioma, e um painel de navegação não deve andar.

⚠ **A animação é nossa, e a do `Modal` fica desligada** — o `animationType="slide"` do RN sobe de
**baixo**, sempre. Deixá-lo ligado faria o painel lateral entrar pelo chão.

### `BottomSheet` — o único sem ficha na web

```tsx
<BottomSheet open={aberto} title="Novo lançamento" onClose={fechar}>…</BottomSheet>
```

⚠ **Ele responde ao mesmo problema que a caixa centralizada, e responde diferente porque a mão é
diferente:** num telefone segurado numa mão só, o alto da tela é o lugar mais difícil de alcançar.
A caixa centralizada põe as escolhas exatamente lá; a folha põe onde o polegar está.

⚠ **O arrastar é `PanResponder`, que é do próprio React Native — não é dependência nova.** Foi
escolha deliberada contra `@gorhom/bottom-sheet`, que arrastaria **duas** peças novas
(`gesture-handler` + `reanimated`) para um gesto de um eixo.

**O que a escolha compra e o que custa, dito em vez de escondido:** compra zero dependência e um
componente que roda no Expo Go. Custa o gesto rodar na ponte de JS, não na thread de UI — numa
lista longa dentro da folha, arrastar pode engasgar. Se isso aparecer em aparelho, a troca é uma
ADR, não um remendo.

⚠ **Soltar no meio do caminho VOLTA**, não fecha: só passa quem arrastou mais de um terço da
altura, ou deu um lance rápido. Fechar cedo demais transforma um toque trêmulo em perda de dado.

### `useToast` — e por que o hospedeiro é explícito

```tsx
<AureaProvider>
  <ToastHost offset={alturaDaBottomNav}>
    <App/>
  </ToastHost>
</AureaProvider>

// em qualquer lugar dentro:
const {add} = useToast();
add({title: "Lançamento salvo", type: "success"});
```

⚠ **Não há portal no React Native.** Na web o `AureaProvider` pendura a pilha no fim do `<body>` e
o app não precisa saber. Aqui um componente só desenha onde está na árvore.

⚠ **A saída óbvia seria o `AureaProvider` desenhar a pilha, e ela está errada.** Medido: hoje ele
devolve **só contextos**, nenhum `View`. Pôr um `View` lá mudaria o layout de **todo app que já
usa a Aurea**, em silêncio — um contêiner novo entre a raiz e o primeiro filho é exatamente o que
quebra um `flex: 1` e aparece como *"por que minha tela encolheu?"* três dias depois.

Então o hospedeiro é próprio e está à vista. Quem não chama `useToast` não põe o `ToastHost`, não
paga o `View`, e nada muda.

⚠ **`useToast()` sem hospedeiro LEVANTA**, com a frase que diz o que fazer. Devolver um `add()`
mudo seria o defeito mais caro possível: o aviso de "salvo" que nunca aparece não quebra nada, não
levanta, e some no meio de um fluxo que parecia certo.

⚠ **`duration: 0` nunca fecha sozinho, e é o que um aviso com `action` tem de usar.** Um botão
"Desfazer" que foge da mão em cinco segundos é um botão que não existe para quem lê devagar, para
quem usa leitor de tela, ou para quem só olhou para o lado.

⚠ **`offset` existe por causa da `BottomNav`:** sem ele o aviso nasce em cima da barra e tapa
justamente o que a pessoa ia tocar. O respiro da barra de gestos é `Math.max`, **não soma** — a
mesma conta do Lote 3.

⚠ **Tempo não é movimento:** com «remover animações» ligado o aviso não desliza, mas o relógio
continua. Quem pediu menos movimento não pediu que o aviso ficasse para sempre.

## A moldura

```tsx
<Screen padded={false} scroll onRefresh={buscar} refreshing={carregando}>
  <Topbar brand={<Text weight={700}>Aurea</Text>} />
  …
</Screen>
<BottomNav
  current={aba}
  items={[
    {id: "painel", label: "Painel", icon: "dashboard", onPress: () => ir("painel")},
    {id: "avisos", label: "Avisos", icon: "notification", badge: 8, onPress: () => ir("avisos")},
  ]} />
```

⚠ **A Aurea não entrega roteamento.** Estes componentes recebem `items` e `current` e avisam por
`onPress`. Quem troca de tela é o app.

⚠ **O `BottomNav` não é `Tabs`, e não é distração de nomenclatura:** uma aba troca um painel
*desta* tela; a barra troca de tela. Por isso os itens são `link` e não `tab` — dar `tablist` a um
menu faz o leitor de tela prometer setas que não levam a lugar nenhum.

⚠ **Ele respeita a barra de gestos sozinho**, pelo máximo entre o respiro do tema e o inset do
sistema.

⚠ **O `Topbar` não gruda sozinho** — `position: sticky` não existe no RN. A barra fica parada
porque a tela a põe **fora** do `ScrollView`, como no exemplo acima.

### Puxar para atualizar

`onRefresh` + `refreshing` no `Screen`, e só com `scroll` — não há o que puxar numa tela que não
rola. `refreshing` é do app: o componente não adivinha quando a busca terminou.

## Frases

`Alert`, `Status`, `EmptyState` e `DataState` falam sozinhos: os sete estados universais, o vazio,
o erro, o rótulo do `Spinner`. O padrão é **inglês**, como na web.

```tsx
import {AureaProvider, ptBR} from "@aurea-uds/native";

<AureaProvider strings={ptBR}>…</AureaProvider>
```

A tabela tem **quatro chaves**, contra as mais de 200 do `@aurea-uds/react` — ela é do tamanho do
que o alvo nativo desenha, e cada chave nova nasce com um componente que a usa. `useAureaStrings()`
lê o que estiver valendo.

## Movimento

```tsx
const reduzir = useReduceMotion();   // true · false · null (ainda não se sabe)
```

⚠ **Na web isso é de graça e aqui não é.** O `aurea.css` tem uma regra global de
`prefers-reduced-motion` que zera toda animação; **o React Native não tem cascata**, então quem
anima pergunta. O `Spinner` e o `Skeleton` já perguntam — este hook é para o seu código fazer o
mesmo.

O `null` é a resposta honesta enquanto o sistema não respondeu: a leitura é assíncrona, e começar
em `false` tocaria um quadro de animação na cara de quem pediu que não tocasse. Quem anima escreve
`if (reduzir !== false) return;`.

## O painel de leitura

```tsx
<DataState state={carregando ? "loading" : erro ? "error" : vazio ? "empty" : undefined}>
  {() => (
    <Stack>
      <KPI label="Custo por km" value="R$ 1,20" trend="+3% no mês" />
      <Progress value={score} label="Saúde" />
      <Status variant="online">Sincronizado</Status>
    </Stack>
  )}
</DataState>
```

⚠ **Os sete estados universais ACOMPANHAM o conteúdo**, não o substituem: `stale`, `partial` e
`offline` dizem que o dado está aí e tem ressalva. Só `loading`, `error` e `empty` tomam o lugar.

⚠ **`children` como FUNÇÃO** existe para o conteúdo caro não ser construído atrás de um esqueleto.

⚠ **O `Alert` precisa dos glifos de variante no registro** (`information--filled`,
`checkmark--filled`, `warning--alt--filled`, `error--filled`). Este pacote não os importa por
você — seria trazer ícone ao grafo do bundler pelas suas costas (ADR-0038, cláusula 4).

### O selo ancorado, e o rótulo que ele exige

```tsx
<Badge count={8} anchor="top-end">
  <IconButton name="notification" label="Avisos, 8 não lidos" onPress={abrir} />
</Badge>
```

⚠ **Ancorado, o número some da árvore de acessibilidade** — quem carrega a informação é o rótulo
de quem foi decorado. Sem isso o leitor de tela anuncia *"sino, 8"* e ninguém sabe o que é o 8.

## Ícones

Um componente por ícone, gerado do SVG do `@carbon/icons` sobre `react-native-svg`
([ADR-0038](../../decisions/0038-um-componente-por-icone-sobre-react-native-svg.md)).

**A forma documentada é o caminho profundo:**

```tsx
import Add from "@aurea-uds/native/icons/add";
import ChevronDown from "@aurea-uds/native/icons/chevron--down";

<Add size={size.iconMd} color={color.foreground} />
```

Importar 40 ícones carrega 40. **O barril (`@aurea-uds/native/icons`) existe, mas não é a forma
documentada:** ele traz os 2571 ao grafo do bundler a menos que o tree-shaking do Metro
— experimental, três flags, só em produção — esteja ligado. O caminho profundo não depende de
poda nenhuma: módulo que não é importado não entra no grafo.

`color` **não herda**: `currentColor` não existe no React Native, e o desenho do Carbon não traz
`fill` nenhum. O padrão é preto explícito — passe a cor do tema.

Os nomes são **os mesmos do sprite da web**, e um gate cobra isso (check 38): o que `<Icon name>`
desenha lá, `icons/<nome>` desenha aqui.

## O que este pacote não faz

- **Não promete paridade** com a web. O React Native não tem `<p>`, cascata de tipografia,
  `<input type=file>` nem hover — a lista do nativo é **outra**, não a mesma com menos itens.
- **Não entrega roteamento.** `expo-router`/`react-navigation` é escolha do app.
- **Não força framework.** Expo não é peer: o pacote é biblioteca.

## Cor: um limite da plataforma, declarado

As cores saem em **hex**, e não por escolha nossa. O interpretador de cor do React Native
**recusa** `oklch()`, `lab()`, `color(display-p3 …)` e até `color(srgb …)` — medido nas versões
0.81.5 e 0.87.0, e é JavaScript compartilhado entre iOS e Android. Passar gamute largo a um
`style` faz a cor ser **descartada em silêncio**.

Consequência: em tela de gamute largo o amarelo da marca perde **ΔEok 0,0225**, que cai em cima do
limiar do perceptível. Não é evitável hoje — é teto de plataforma, e está registrado na
[ADR-0027](../../decisions/0027-a-cor-no-alvo-nativo.md).

## Licença

Apache-2.0. Os glifos são do `@carbon/icons` (IBM Corp., Apache-2.0) — ver `NOTICE`.
