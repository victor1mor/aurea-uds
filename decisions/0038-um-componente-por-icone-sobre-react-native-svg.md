# ADR-0038 — Um componente por ícone sobre `react-native-svg`, gerado do SVG do Carbon

- **Data:** 31/08/2026
- **Estado:** aceita e **EXECUTADA** — os **2571** ícones estão gerados e publicados, e a
  cláusula do caminho profundo (`./icons/*`) é a forma documentada e usada.
  ⚠ *Mesma correção de 14/09/2026 da [ADR-0037](0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md):*
  *a linha dizia* **"não executada"** *com o pacote publicado.*
  ✅ **E a pendência que ela deixou aberta FECHOU:** o desempenho do `react-native-svg` em lista
  longa, adiado *"até existir tela de lista"*, foi medido em aparelho em 09/09/2026 — mil linhas
  com `virtualized`, pergunta 11 do smoke.
- **Fecha:** a **decisão 3** do [`NATIVE.md`](../docs/NATIVE.md) §7 — a **última** das três que travavam
  a Etapa 4. Com esta, nenhuma decisão de arquitetura fica pendente.
- **Autoria:** decisão explícita do Victor. Ele mandou pesquisar (*"qual padrão de mercado? o que
  performa melhor? PESQUISAR"*), leu a recomendação e disse **"Pode"**.

## Contexto

Na web o `Icon` da Aurea desenha `<use href="…#id">` contra **um sprite de 1,2 MB com 2571
símbolos** (`packages/icons/dist/aurea-icons.svg`). **No React Native esse caminho não existe:** o
`react-native-svg` resolve `<Use>` dentro da mesma árvore, não contra um arquivo externo por URL.

Era um dos quatro bloqueios que a §5.2 do `NATIVE.md` mediu como anteriores ao primeiro componente.
E não havia atalho: **`@carbon/icons-react-native` dá 404** — a IBM não publica pacote nativo.
Gerar é obrigatório; a decisão era só o formato de saída.

## O que foi medido (31/08/2026)

Busca para achar os candidatos; **npm, leitura de fonte e varredura de arquivo para confirmar cada
afirmação**. O detalhe inteiro está na §5.6 do `NATIVE.md`.

### Os quatro padrões que existem

| padrão | quem usa | mecanismo |
|---|---|---|
| **SVG por ícone** sobre `react-native-svg` | `heroui-native` (peer `^15.12.1`) · `@gluestack-ui/themed` (`>=13.4.0`) · `lucide-react-native` | um módulo por ícone |
| fonte de ícone, um pacote por família | `@react-native-vector-icons/*` | glifo no pipeline de texto do SO |
| não entrega ícone — recebe um renderizador | `react-native-paper` | `Settings.icon`, lido em `src/core/settings.tsx` |
| SVG → fonte no build | `react-native-nano-icons` **0.2.1** | glifo nativo |

**`react-native-vector-icons@10.3.0` está deprecado no próprio registro**, migrando para pacotes por
família.

### Os SVGs do Carbon convertem sem interpretação

Varridos os **2856 arquivos** de `@carbon/icons@11.87.0` (Apache-2.0), contando recurso por recurso:

| recurso | arquivos | RN-SVG |
|---|---:|---|
| `<path>` | 2849 | `<Path>` |
| `<circle>` | 237 | `<Circle>` |
| `<rect>` | 5 | `<Rect>` |
| `stroke` · `fill=` · `opacity` · `fill-rule` | 150 · 91 · 16 · 14 | todos |
| `<mask>` · `<use>` · gradiente · `<clipPath>` · `<g>` · `style=` | **0** | — |

**Três primitivas, zero recurso exótico.** É o melhor caso possível para gerar código.

Grade de tamanhos: **2753 em `32`**, 68 em `16`, 9 em `20`, 8 em `24`.

### O achado que mudou o desenho: o Metro não poda

A primeira versão da recomendação dizia *"com `sideEffects:false`, que o bundler poda sozinho"*.
**Isso é verdade na web e não é no React Native.**

O tree-shaking do Metro é **experimental**: exige `experimentalImportSupport`,
`EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH` e `EXPO_UNSTABLE_TREE_SHAKING`, **só vale em produção**, e a
documentação do Expo o descreve como *"very experimental, because it changes the fundamental
structure of how Metro bundles code"*. Passou a ligado por padrão só no **SDK 54**.

Um barril com 2856 ícones seria, portanto, **aposta na configuração do bundler do consumidor**.

**O `lucide-react-native` já resolveu isso**, e a solução está no `package.json` dele:

```
exports: { ".": …, "./icons": …, "./icons/*": … }
```

Caminho profundo por ícone. Módulo não importado **não entra no grafo** — não há poda a depender.

## Decisão

**O alvo nativo recebe um componente por ícone, gerado do SVG cru do `@carbon/icons` e desenhado
sobre `react-native-svg`.** Quatro cláusulas, e nenhuma é enfeite:

1. **`./icons/*` é a forma documentada como padrão.** `import Add from '@aurea-uds/native/icons/add'`
   é à prova de bundler **por construção**, não por configuração alheia. O barril existe para
   conveniência de quem tem tree-shaking ligado, e a documentação diz qual é qual.
2. **O gerador injeta a cor explicitamente.** `currentColor` aparece em **zero** dos 2856 arquivos —
   na web a cor vem da *ausência* de `fill`, herdada por CSS, e **no RN não há herança**. Sem
   injetar, todos os ícones saem pretos, e em silêncio.
3. **A trava do Paper: um renderizador de ícone injetável.** O consumidor que já tem a própria pilha
   de ícone não é obrigado a carregar a nossa. É o padrão de quem tem mais quilometragem nisso.
4. **`<Icon name>` continua existindo**, para a paridade de API com a web — mas como **registro que
   o app monta com o que usa**, nunca como mapa dos 2856, que anularia tudo acima.

O tamanho base é o **32**; os menores entram onde o Carbon os desenhou de propósito.

## As alternativas, e por que cada uma caiu

- **`react-native-nano-icons`** — o mais rápido dos medidos, e da Software Mansion, que mantém o
  próprio `react-native-svg`. Cai por três medições: está em **`0.2.1`**; traz `expo` e
  `@expo/config` no `peerDependencies`, e a Aurea é biblioteca — forçar o framework do consumidor é
  o que a arquitetura do `NATIVE.md` §2 recusa desde 18/07; e **degrada para `<Text>` no Expo Go**,
  que foi *a razão* de a [ADR-0037](0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md) trocar o
  motor de estilo dois dias antes. Adotá-lo devolveria pela porta dos ícones o problema que se
  acabou de tirar pela porta do estilo. **Fica na lista de vigiar**: reabre quando chegar à `1.0` e
  se soltar do Expo.
- **Fonte de ícone própria** — mais barata em runtime, mas o padrão de mercado está migrando para
  fora dela (o `react-native-vector-icons` deprecado é o sinal), e ela perde cor por parte.
- **Parser de SVG em runtime** — custo por render, para resolver um problema que o build resolve uma
  vez.
- **Subconjunto curado** (o que eu mesmo levava à mesa antes da pesquisa) — resolve à mão, com uma
  lista para manter, o que o caminho profundo resolve por construção.

## Consequências

- **`react-native-svg` entra como `peerDependency`** de `@aurea-uds/native`. É a mesma escolha do
  `heroui-native` e do `gluestack`, então o consumidor típico já o tem.
- **Um gerador novo**, irmão do `packages/icons/build-icons.mjs` que já consome esta mesma fonte
  para o sprite da web. **Uma fonte, dois alvos** — o mesmo desenho que a Etapa 2 usou para os
  tokens, e pelo mesmo motivo.
- **O pacote fica grande em número de arquivos.** O `lucide-react-native` tem 1792 módulos e 48 MB
  desempacotado; a nossa grade é maior. Isso pesa no tempo de build e no tarball, **não** no app do
  consumidor — que é justamente o que a cláusula 1 protege.
- **O gate do `dist == build`** vale aqui como vale para os tokens: gerado que não bate com a fonte
  reprova.
- **A saída de emergência está mapeada e é barata.** Se a Etapa 4 medir que o `react-native-svg` não
  aguenta a lista do consumidor, **a mesma geração emite fonte em vez de componente** — porque a
  fonte de verdade é o SVG do Carbon nos dois casos. Trocar o formato de saída não é reescrever a
  decisão.

## ~~O limite honesto desta ADR~~ ⚠ **PARCIALMENTE MEDIDO EM APARELHO — 03/09/2026**

> **Os ícones desenham.** Rodado pelo Victor num Android (`apps/native-smoke/`): os três
> escolhidos aparecem na cor do texto, e a escala `iconSm/Md/Lg/Xl` cresce sem borrar.
>
> **O que mais importa foi provado:** o `checkmark--filled` sai com o **visto vazado** dentro do
> círculo. Se o gerador tivesse pintado o `fill="none"` do contorno interno — o defeito que a
> cláusula 2 quase teve —, seria um círculo sólido. E o `calendar--add--alt`, que é um dos 10
> arquivos com o `<switch>` do Illustrator, desenhou inteiro.
>
> **O `exports` com `./icons/*` resolve no Metro**, e o caminho profundo **poda**: 723 módulos no
> bundle, com os importados presentes e `logo--kubernetes` ausente. Era a cláusula 1, e ela estava
> sem prova.
>
> ⚠ **O que CONTINUA por medir é o desempenho em lista longa** — a pergunta original desta seção.
> A tela de teste tem 40 linhas com um ícone cada e não engasgou, mas isso não é a lista do
> consumidor e não foi medido com instrumento. **Segue pendência.**

O texto abaixo é o limite original, mantido como registro.

**Nada disto rodou em aparelho, nem em emulador.** O que existe é contrato de pacote, fonte lido,
varredura dos 2856 arquivos e benchmark de terceiro — e o benchmark que mais impressiona é **do
fornecedor que foi recusado**, num cenário de 1000 ícones que não é o nosso.

**O que a Etapa 4 tem de medir, e é uma coisa só:** se o `react-native-svg` aguenta a lista do
consumidor com um ícone por linha. A moldura dele tem 4 ícones na barra inferior e um por linha —
o caso de "poucos", em que todas as fontes concordam que a diferença é mínima. **Concordar não é
medir**, e por isso está aqui como pendência e não como fato.

## Condição de revisão

- **O `nano-icons` chegar à `1.0` e largar o peer de `expo`** — aí o custo de runtime volta à mesa,
  e é ADR nova.
- **A medição em aparelho reprovar o `react-native-svg`** na lista do consumidor — aí muda o
  *formato de saída* do gerador, não esta decisão.
- **O Metro passar a podar de verdade, por padrão e fora de flag** — aí a cláusula 1 deixa de ser
  necessária, e o barril pode virar a forma documentada. Não urge: o caminho profundo continua
  correto de qualquer jeito.
