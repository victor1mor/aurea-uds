# Ler as células achou três defeitos no instrumento — e dois invertiam o sinal

**27/08/2026.** Continuação de [`23-EXTRATOR-DATA-ATTRS.md`](23-EXTRATOR-DATA-ATTRS.md), e a mesma
história: nenhum destes foi achado procurando defeito. Todos apareceram porque uma **célula era
implausível** e a conferência foi feita.

---

## 1. O teclado: a referência trata a tecla para BLOQUEÁ-LA

As células `checkbox·teclado` e `radio·teclado` diziam que falta `Enter` à Aurea. O fonte da radix:

```ts
radix/checkbox.tsx:186     if (event.key === 'Enter') event.preventDefault();
radix/radio-group.tsx:227  if (event.key === 'Enter') event.preventDefault();
```

Ela trata `Enter` **para bloquear** — é o que a WAI-ARIA manda (caixa e rádio alternam com
`Space`; `Enter` pertence ao envio do formulário), e o teste da própria radix se chama
*"should not check an item on Enter key"*.

O campo era, literalmente:

```js
TECLADO: TECLAS.filter((k) => texto.includes(`'${k}'`))
```

**"A string aparece em algum lugar do arquivo."** Comentário, nome de teste, união de tipo, ramo
que suprime — tudo virava suporte. E a matriz reportava que **falta à Aurea uma tecla que a
referência proíbe de propósito**.

### O que [`teclas.mjs`](teclas.mjs) faz

Três listas, e nenhuma é veredito:

| | |
|---|---|
| `tratadas` | a tecla aparece numa **comparação** (`event.key === 'X'`, `case 'X':`, `key: 'X'`, `['X'].includes`) |
| `suprimidas` | a comparação chama `preventDefault` e **nada mais** nas linhas seguintes |
| `citadas` | aparece no arquivo, fora de qualquer comparação |

**`TECLADO` continua sendo a UNIÃO de `tratadas` e `citadas`**, e isso não é conservadorismo: o
menu da radix **delega** quase todo o teclado a `RovingFocusGroup` e `useTypeahead`, que moram em
outros pacotes — só `Tab` e `Space` aparecem como comparação no arquivo dele. Estreitar o campo
faria o extrator errar para MENOS. O que muda é a proveniência ao lado.

A célula ganhou `dasQueFaltamSuprimidasNaReferencia` e `dasQueFaltamSoCitadas`, e as oito células
de `teclado` foram lidas com elas na mão: **duas viraram `EQUIVALENT`** (checkbox e radio),
**uma virou `AUREA_SUPERA`** (`select`: nove teclas medidas no navegador contra seis da radix, e
a única "faltando" é `Tab`, que a radix bloqueia).

---

## 2. A orientação: a prop era da SUB-PEÇA

`select·orientacao` e `combobox·orientacao` diziam que a base-ui tem orientação e a Aurea não. A
base-ui declara `orientation` em:

```
SelectSeparatorProps      ← o TRAÇO entre grupos da lista
ComboboxSeparatorProps    ← idem
```

O `SelectRoot` não tem orientação nenhuma. O extrator achatava as props de **todas as peças do
diretório** numa lista só (`todasProps`), e a prop da sub-peça virava prop do componente.

**Medido: quatro de treze** itens da base-ui com `ORIENTACOES` são esse caso.

| item | quem declara | é raiz? |
|---|---|---|
| accordion · menu · menubar · navigation-menu · separator · slider · tabs · toggle-group · toolbar | `*RootProps` / `Menubar.tsx` / `Separator.tsx` | **sim** |
| **select · combobox · autocomplete** | `*SeparatorProps` | **não** |
| **scroll-area** | `ScrollAreaScrollbarProps` | **não** |

O campo `ORIENTACAO_DECLARADA_EM` carrega a proveniência, e a matriz a mostra na célula. Não
decide o veredito — deixa a leitura decidir sem reabrir o fonte da referência.

---

## 3. O `else` pendurado, que engolia eixo inteiro

Este é o mais grave dos três, porque errava para **menos** — a direção que faz a Aurea parecer
melhor do que foi medida.

```js
if (dic) for (const [p, v] of Object.entries(dic)) if (Array.isArray(v) && v.length) bruto[p] = v;
else {
  const va = esquema === "rico" ? it.VARIANTES : it.variantes;
  const ta = esquema === "rico" ? it.TAMANHOS  : it.tamanhos;
  …
}
```

**O `else` pendura no `if` INTERNO do `for`, não no `if (dic)`.** Quando `dic` é nulo, o
`if (dic)` guarda o `for` inteiro — que contém o `else` — e **nada roda**. Os campos planos nunca
eram lidos.

Achado por uma célula implausível: `select·tamanho` marcada `SO_AUREA`, ou seja *"sete
referências, e nenhuma com escala de tamanho no select"*. A `untitled-ui` declara
`TAMANHOS: ["lg","md","sm"]` ali.

**17 itens das quatro fontes ricas perdiam 19 eixos.** Oito células mudaram:

```text
select·tamanho        SO_AUREA → REQUER_LEITURA     (a untitled tem)
avatar·tamanho        SO_AUREA → REQUER_LEITURA
input·tamanho         SO_AUREA → REQUER_LEITURA
textarea·tamanho      SO_AUREA → REQUER_LEITURA
tabs·tamanho                — → AUREA_INFERIOR     (a célula NEM EXISTIA)
pagination·tamanho          — → AUREA_INFERIOR
table·tamanho               — → AUREA_INFERIOR
empty-state·tamanho         — → AUREA_INFERIOR
```

O código saiu de `matrix.mjs` para [`eixos.mjs`](eixos.mjs) com fixture próprio — a armadilha não
era visível lendo, e não seria pega por um teste que só exercitasse o caminho do dicionário, que
era o caminho que funcionava.

---

## 4. E o eixo que a fonte tem sem enumerar

`tooltip·posicao` dizia que **só a Aurea** tem lados. A base-ui declara `side` no
`TooltipPositioner`, a mui declara `placement`, a radix declara `align` — tudo em
`PROPS_RELEVANTES`, campo para o qual a leitura de eixo **nunca olhava**.

Entrou a detecção por **presença**, com vocabulário vazio — nunca valores inventados. Uma lista
vazia em `porFonte` já basta para o veredito deixar de ser `SO_AUREA` e virar `REQUER_LEITURA`,
que é a verdade: a referência tem o eixo, e o inventário não capturou os valores.

A lista é curta pela mesma razão que o `EIXO_CANON` é — `side`, `placement`, `align`, `anchor`,
`orientation`, `direction`: props cujo **nome** já fixa a dimensão. Ficam de fora `type`, `color`
e `size`, porque o nome não fixa nada (`<input type=email>`, `color="#fff"`, `<input size=40>`).

### O limite que fica declarado

`popover·posicao` e `hover-card·posicao` continuavam `SO_AUREA` mesmo assim, e a leitura mostrou
por quê:

```ts
interface PopoverContentProps extends PopoverContentTypeProps
  → extends Omit<PopperPrimitive.PopperContentProps, …>
     → side?: Side          em packages/react/popper/src/popper.tsx:168, OUTRO PACOTE
```

O inventário lê membros **declarados**, não herdados por `extends` que cruzam pacote — seguir
isso exigiria resolução de módulo TypeScript. **Não foi construído um resolvedor: as duas células
foram LIDAS**, com a herança conferida à mão e escrita no `porque`. É para isso que a camada de
leitura existe.

---

## 5. O padrão, que já é o quarto desta auditoria

| # | armadilha | como apareceu |
|---|---|---|
| 1 | `grep -c` contava `forwardRef` errado | número grande demais |
| 2 | detector de foco não excluía `display:none` | o **mesmo** elemento acusado nas sete páginas |
| 3 | diff da matriz indexado por POSIÇÃO | 30 mudanças **nos dois sentidos** na mesma linha |
| 4 | lista fixa de fontes num agregador | `ls` trazia 17, a tabela citava 9 |
| 5 | `205 células` somava linha com célula | 6,2 eixos por capacidade, e nenhuma linha tem tantos |
| 6 | `data-*` medido por cinco réguas | estado chamado **`date`** num menu |
| 7 | teclado = "a string aparece no arquivo" | falta uma tecla que a referência **proíbe** |
| 8 | orientação da SUB-PEÇA | `Select` com orientação, e ele é `<select>` nativo |
| 9 | `else` pendurado | sete referências e **nenhuma** com tamanho no `select` |

**Nenhuma foi achada procurando defeito.** Todas apareceram porque um número ou uma célula era
implausível, e a conferência foi feita em vez de aceita.

E a mesma disciplina pegou um erro de LEITURA, não de instrumento: `stack·orientacao` foi escrita
`AUREA_INFERIOR` com a frase *"é a falta mais surpreendente desta leitura"*. A surpresa era o
sinal de que a conferência não tinha terminado — um `grep` achou o `Cluster`, que é a linha
horizontal ao lado do `Stack` vertical, mesma decomposição do `Menu`/`Menubar`. **Número
implausível é instrumento quebrado; leitura surpreendente é leitura incompleta.**
