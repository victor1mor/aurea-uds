# ADR-0043 — O `Combobox` nativo diverge da web, e a PRESENÇA DA PROP é a chave

- **Data:** 11/09/2026
- **Estado:** aceita e **EXECUTADA** — `Combobox` e `SearchField`, publicados no npm na `0.8.0` (12/09/2026).
  ✅ **E ela foi PROVADA EM APARELHO em 12/09/2026**, Android 13, no modo `lote7` do
  `apps/native-smoke/`. ⚠ **No iOS não** — nenhum aparelho deste projeto rodou iOS, em lote
  nenhum (`NATIVE.md` §8.6 e §8.7).
- **Fecha:** a lacuna 1 do Lote 7 (`NATIVE.md` §8), medida pelo consumidor
- **Autoria:** medição do Opus, sob autorização do Victor em 11/09/2026

## Contexto

O consumidor mediu, como primeira e mais urgente das três lacunas:

> O `Select` nativo recebe items numa lista fixa, e o próprio código avisa: *"O papel é button e
> não combobox"*. A demanda é buscar um item dentro de um **catálogo remoto de milhares de
> linhas**, digitando.

Conferido, e o `Select` realmente escreve a própria lacuna (`inputs.tsx:576-578`). Havia um
agravante que a demanda não citava e que a medição achou: **a folha do `Select` usa `ScrollView`**
(`inputs.tsx:632`), que monta todos os itens. Milhares de linhas ali não ficam lentas — travam.

## O achado que decidiu a ADR

**A combinação que a demanda pede não existe na web.** Medido em `packages/react/src/inputs-client.tsx`:

| componente da web | seleção | busca |
|---|---|---|
| `Combobox` (linha 366) | única | **filtro do Base UI, no cliente.** Não tem `onInputChange` |
| `MultiCombobox` (linha 400) | múltipla | tem `onInputChange` + `loading`, e desliga o filtro com `filter={null}` |

Ou seja: **quem quer buscar no servidor E escolher UM item não tem componente na web.** O padrão
existe lá, mas só na seleção múltipla.

Copiar o contrato de seleção única para o nativo entregaria ao consumidor um filtro de cliente
sobre milhares de linhas que ele nem baixou — e o pior defeito seria silencioso: o app pergunta
"açúcar", o servidor devolve `AÇUCAR CRISTAL 5KG` e um filtro local o descartaria. A tela mostraria
"nenhum resultado" **sobre uma resposta cheia**.

## Alternativas rejeitadas

**Copiar o contrato do `Combobox` da web tal como está.** Rejeitada pelo parágrafo acima: entrega
o defeito silencioso na primeira tela do app.

**Trazer o `MultiCombobox` para o nativo e mandar usar com um item só.** Rejeitada: a seleção
múltipla arrasta fichas (`combobox-chip`, `ChipRemove`, a `Value` como lista) e um contrato de
array onde a demanda é um item. Entregar o componente errado com uma instrução de uso é como se
perde uma API.

**Uma prop `mode: "local" | "remote"`.** Rejeitada: é configuração onde há dedução. A presença de
`onSearchChange` **já diz** que quem busca é o app — uma prop a mais só cria o estado inválido
`mode="remote"` sem função de busca.

**Digitar no próprio gatilho, como na web.** Rejeitada por três medições de plataforma, e nenhuma
delas é gosto: o teclado ocupa metade da tela e abriria por cima da própria lista ancorada; o
gatilho precisa mostrar o **escolhido** com a geometria do `.input` para parecer um campo no
formulário, e um campo de texto ali mostraria o que se digitou; e a folha que sobe do rodapé é o
idioma dos seletores do próprio sistema nos dois lados.

**Mudar o `Select` para aceitar busca.** Rejeitada: o `Select` está publicado e o aviso dele é
honesto. Dois papéis num componente é como um contrato deixa de ser legível — e a `1.0` ainda não
saiu, mas `0.x` quebrar em silêncio é o que a [ADR-0014](0014-primeira-versao-publica-0-1-0.md)
proíbe.

## Decisão

1. **Nasce o `Combobox` nativo**, de seleção única, somando ao contrato da web três props que lá
   só existem no `MultiCombobox`: `onSearchChange`, `loading` e `onEndReached` (paginação — um
   catálogo remoto não cabe numa resposta só).
2. **A chave é a PRESENÇA DA PROP:** com `onSearchChange`, a Aurea **não filtra** — a lista que
   chega é a lista que aparece. Sem ela, a Aurea filtra o que recebeu, ignorando acento e caixa.
   É a mesma chave do `filter={null}` do `MultiCombobox`, escrita como presença em vez de
   configuração de motor.
3. **A lista é `FlatList`**, como o `DataList` do Lote 6 (`data.tsx:191`) — não `ScrollView`.
   É a diferença entre funcionar e travar, e é a razão material de o `Select` não servir.
4. **Digita-se DENTRO da folha**, não no gatilho. O gatilho continua sendo o `.input` com a seta.
5. **O gatilho é `role="button"`; o campo da folha é `role="search"`.** Medido no fonte do
   `react-native@0.87.1`, não presumido — ver a tabela abaixo.
6. **`value` é o ITEM inteiro**, como na web, e aqui isso tem razão prática além da paridade: numa
   busca remota a lista some debaixo da escolha quando a pessoa digita outra coisa, e guardar só o
   `value` deixaria o gatilho em branco no instante seguinte à escolha.
7. **O `Select` não muda.** Os dois convivem, e a escolha é de tamanho de lista — a nota está no
   doc dos dois.
8. **Nasce junto o `SearchField`**, que é outro papel: ele FILTRA o que já está na tela e devolve
   texto; o `Combobox` ESCOLHE de um catálogo e devolve a escolha.

## O que foi medido no fonte do RN, e por que foi preciso medir

O Lote 5 provou que o React Native **aceita papel que não mapeia** — `role="dialog"` compila,
atravessa o Fabric e vira `null` nos dois sistemas. Então nenhum papel deste lote entrou sem
conferência:

| papel | Android | iOS |
|---|---|---|
| `search` | `ReactAccessibilityDelegate.kt:461` → `android.widget.EditText` | `accessibilityPropsConversions.h:64-65` → `AccessibilityTraits::SearchField` → `RCTConversions.h:120-121` → `UIAccessibilityTraitSearchField` |
| `combobox` | `ReactAccessibilityDelegate.kt:680-682` → `roleDescription` de `R.string.combobox_description` | **não há trait** — ausente da tabela do `RCTConversions.h` |

`search` mapeia nos dois; `combobox` em um. Como o gatilho **não aceita digitação** — quem digita
é o campo da folha —, `button` é o que ele É nos dois sistemas, e é o que ele declara.

## Como isto é obrigado

Quinze testes em `tests/unit/native-lote7.test.tsx`, nos quatro blocos do `Combobox` e no do
`SearchField`. **Três foram provados contra o defeito:**

- tirar a guarda do item 2 faz a Aurea filtrar a resposta do servidor, e o teste reprova;
- trocar o `FlatList` por um `ScrollView` "para simplificar" reprova — e é exatamente o tipo de
  simplificação que passa em revisão;
- tirar a limpeza do timer no desmonte faz a busca disparar sobre árvore desmontada, e reprova.

## Consequências, com o custo

- **Os dois alvos deixam de ter a mesma lista de props neste componente**, e é a segunda vez
  (a primeira foi a `Table` do Lote 6). O custo é real: quem porta uma tela da web encontra props
  a mais. Em troca, o caso que o consumidor tem de verdade é entregável sem gambiarra.
- **Quem escrever a busca remota na web vai querer estas props lá**, e aí a web é que terá de
  mudar. Esta ADR não decide isso — registra que o padrão nasceu no nativo.
- **A espera de 250 ms é um padrão, não uma lei.** Sem ela, "arroz" são cinco chamadas e quatro
  respostas descartadas; com ela, uma. `searchDelay={0}` desliga.

## Quando se revisa

Se o `Combobox` da web ganhar busca remota de seleção única, as duas APIs voltam à mesa para
convergir — e a convergência deve ser da web para cá, não o contrário, porque foi aqui que o caso
real apareceu primeiro.
