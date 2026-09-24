# A fila canônica de gaps

> §72: **uma** fila. §73: todo gap classificado por tipo. §14: todo estado de paridade explícito,
> inclusive `AUREA_INFERIOR` — o §14 proíbe escondê-lo.
>
> Um gap só entra aqui com **medição atrás**. Um gap só sai daqui com o critério do §91 cumprido:
> código, API, pele, estados, a11y, teste, preview, docs, registry, referências e gates — ou `N/A`
> com razão escrita.

## Legenda

**Tipo** (§73): `missing-component` · `missing-variant` · `missing-state` · `missing-behavior` ·
`missing-primitive` · `missing-composition` · `missing-example` · `missing-block` ·
`missing-template` · `missing-token` · `missing-a11y` · `missing-responsive` · `missing-tooling` ·
`missing-doc` · `missing-test` · `architecture` · `dx` · `performance` · `future`

**Paridade** (§14): `AUREA_SUPERA` · `AUREA_EQUIVALENTE` · `AUREA_PARCIAL` · `AUREA_AUSENTE` ·
`AUREA_INFERIOR` · `NÃO_APLICÁVEL` · `LICENÇA_BLOQUEIA_REUSO` · `INCONCLUSIVO`

---

## G-FORM-01 — campo de formulário não tem tamanho

| | |
|---|---|
| **Capacidade** | `Input` / `Select` / `Textarea` / `SearchField` / `Combobox` em `sm`, `md`, `lg` |
| **Família** | Forms |
| **Tipo** | `missing-variant` + `missing-doc` (a ficha declara o que não existe) |
| **Paridade** | `AUREA_INFERIOR` |
| **Aurea hoje** | `.input,.textarea,.select { height:var(--control-h-md) }` — fixo. Sem prop `size`, sem modificador de classe. Cinco fichas declaram `sizes: ["sm","md","lg"]` |
| **Referências** | Untitled UI `input.tsx` — `size?: "sm"\|"md"\|"lg"`, muda padding, `text-*` e **o tamanho e o deslocamento do ícone**; `select` igual; `textarea` só `sm\|md`. MUI `InputBase` — `size: small\|medium`, classe `sizeSmall` |
| **Dependências** | nenhuma — `--control-h-xs…xl` já existem e `.btn-sm`/`.btn-lg`/`.btn-xl` já os usam |
| **Licença** | MIT nas duas; nada copiado, só anatomia |
| **Complexidade** | baixa no CSS, **média na API**: `size` colide com o atributo HTML nativo (`<input size>` e `<select size>` são números). Untitled UI resolve com `Omit<…,"size">` — é quebra de contrato para quem usasse o nativo |
| **Risco** | baixo. Quebra registrada no [`CHANGELOG.md`](../../CHANGELOG.md) §Quebras de API, que é onde a ADR-0014 manda (o `MIGRATION.md` é documento histórico da Fase 0) |
| **Prioridade** | **1** — é capacidade anunciada e inexistente, o pior dos dois defeitos |
| **Status** | **FECHADO** em 21/08/2026 |

Medição em [`01-FASE-ZERO.md`](01-FASE-ZERO.md) §3, achado F0-2.

**Como fechou, contra o critério do §91:**

| Exigência | Onde |
|---|---|
| código | `packages/react/src/inputs.tsx` — `FieldSize`, e a prop nos cinco |
| API | `size?: FieldSize` = `Extract<ComponentSize,"sm"\|"md"\|"lg">`. `Omit<…,"size">` no `Input`, `Select` e `SearchField`, onde o nativo é número |
| pele | `packages/core/src/aurea.css` — `.input-sm/-lg`, `.select-sm/-lg`, `.textarea-sm/-lg`, mais o deslocamento do glifo e o reservado da seta. Só token e `calc()` |
| estados | os do campo não mudam com o tamanho; nada a acrescentar — `N/A` |
| a11y | `N/A` por medição: o tamanho não altera papel, nome nem teclado. O alvo de toque do `sm` é `--control-h-sm`, o mesmo do botão `sm` já publicado |
| teste | `tests/unit/field-size.test.tsx` — 10 testes; com a implementação revertida, 8 falham |
| preview | exemplo "Sizes" nas cinco páginas do catálogo. O `Combobox` mantém `render: null`, que é a regra do arquivo: página estática não tem runtime React e preview que não abre a lista seria falso (§105) |
| docs | descrição e `features` do `Input` corrigidas — diziam que **todo** atributo nativo passa, e `size` deixou de passar |
| registry | as cinco fichas passaram a dizer a verdade: `measure-api.mjs` já não acusa divergência em nenhuma delas |
| referências | Untitled UI `input.tsx`/`select.tsx`/`textarea.tsx` (`548c28a`), MUI `InputBase` (`f76d14a5`) — anatomia, nenhuma linha copiada |
| gates | `pnpm build` · `validate.py` · 213 testes · `check-pack` verdes |

**O que a construção ensinou, e ficou como trava:**

- A **catraca de px cru** (check 12) proibiu escrever `44px` e obrigou `calc(var(--space-10) +
  var(--space-1))`. O gate escolheu o design certo antes de mim.
- A **fronteira do core** (check 15) reprovou as seis classes novas até o React produzi-las — e
  reprovou de novo quando o prefixo era montado dinamicamente (`` `${base}-${size}` ``), porque
  assim ele não enxerga a classe. Prefixo literal em cada chamada, que é o idioma do `_PREFIX`.
- Um teste passava **a vazio**: "as regras não têm px cru" era verdade quando as regras não
  existiam. Corrigido para exigir a existência primeiro.

---

## G-REG-01 — duas fichas descrevem mal capacidade que existe

| | |
|---|---|
| **Capacidade** | ficha do registry dizer a verdade sobre variante |
| **Família** | Developer experience |
| **Tipo** | `missing-doc` |
| **Paridade** | `AUREA_INFERIOR` |
| **Aurea hoje** | `Drawer` declara `variants: ["left","right"]`, mas a prop chama-se `side` — a ficha não tem campo para dizer **qual prop** carrega a variante. `ToolbarButton` declara `["neutral","primary","ghost"]`: herda as 11 de `ButtonVariant`, e `neutral` **não é uma delas** |
| **Referências** | — (defeito interno) |
| **Dependências** | fechou junto com `G-REG-02`, que é o gate que o acusou |
| **Complexidade** | baixa |
| **Prioridade** | 2 |
| **Status** | **FECHADO** em 21/08/2026 |

**Como fechou.** O gate do `G-REG-02` acusou seis divergências em quatro componentes, e a
correção foi decidida por medição, não por gosto:

- **`Drawer`** ganhou o campo novo `variantProp: "side"`. A escala existia e estava certa; a
  ficha é que não tinha como dizer em qual prop ela mora.
- **`Icon`**, **`IconButton`** e **`ToolbarButton`** passaram a declarar a união inteira que o
  compilador entrega. A alternativa era estreitar a API, e a medição a descartou: o próprio
  repositório usa `IconButton` com `primary` e `danger-ghost` — nenhuma das duas declarada — e
  nos tamanhos `xs` e `xl`, também não declarados; e usa `ToolbarButton` com `danger` e
  `danger-ghost`. Estreitar quebraria o consumidor que já existe. **As fichas é que estavam
  erradas**, e a de `ToolbarButton` chegava a inventar uma variante `neutral`.

---

## G-REG-02 — nada confronta a ficha com o compilador

| | |
|---|---|
| **Capacidade** | contrato de API derivado da fonte, não escrito à mão (§118, §119) |
| **Família** | Developer experience |
| **Tipo** | `architecture` |
| **Paridade** | `AUREA_INFERIOR` — shadcn/ui e MUI publicam API derivada do código |
| **Aurea hoje** | o check 11 compara **nomes** de componente; o check 15/18 alcança só uniões `export type <X>Variant`. `variants`, `sizes`, `states` e `props` da ficha nunca foram comparados com a emissão do `tsc`. Foi assim que `G-FORM-01` e `G-REG-01` sobreviveram |
| **Referências** | §118/§119 da ordem; `measure-api.mjs` já prova que a extração é viável |
| **Dependências** | nenhuma |
| **Complexidade** | média |
| **Prioridade** | **1** — é o gap sistêmico do §97 |
| **Status** | **FECHADO** em 21/08/2026 — com ressalva escrita abaixo |

**Como fechou.** O caminho escolhido **não** foi um gate novo: o check 14 já comparava variante
do tipo com variante da ficha, e o comentário dele declarava o próprio limite — *"componente que
usa o tipo de OUTRO sem alias próprio fica fora — medido em 26/07: nenhum caso hoje"*. Essa
medição envelheceu e o buraco estava ocupado. Criar um check 27 concorrente seria a lógica
duplicada que o §21 proíbe.

Então o check 14 trocou de **fonte**: saiu de expressão regular sobre o `.tsx` e passou a ler
`packages/contracts/api-surface.json`, gerado pelo novo passo `pnpm build:api-surface` a partir
da emissão de declaração do `tsc`. Herança, `Omit`, `Pick` e alias em cadeia são resolvidos pelo
compilador, não por regex. O check passou a cobrir **`sizes`** também, e ganhou os campos
`variantProp`/`sizeProp` para a ficha apontar a prop certa.

O artefato é gerado e commitado; quem o mantém fresco é a trava de árvore suja da CI depois do
`pnpm build` — a mesma do `dist == build`. E ele **embarca** em `@aurea-uds/contracts` com ponto
de entrada próprio (`@aurea-uds/contracts/api-surface`), porque é exatamente o contrato legível
por máquina que o §51, o §52 e o §117 pedem.

Provado contra o defeito: devolvendo `neutral` à ficha do `ToolbarButton`, o validador reprova.

> **Ressalva, e ela importa.** Isto fecha a divergência de **`variants` e `sizes`**. O achado
> **M8** — 33 fichas sem contrato de `props` publicado, a Parte E do `PLANO-1.0` — **continua
> aberto**. O que mudou é que agora existe a fonte derivada de onde tirar esse contrato sem
> escrever 33 fichas à mão. Declarar o M8 fechado aqui seria o "já temos" sem prova que o §84
> proíbe. → `G-REG-03`.

---

## G-REG-03 — o contrato de `props` ainda é escrito à mão (M8)

| | |
|---|---|
| **Capacidade** | toda ficha publicar o contrato de props, derivado da fonte |
| **Família** | Developer experience |
| **Tipo** | `missing-doc` + `architecture` |
| **Paridade** | `AUREA_INFERIOR` |
| **Aurea hoje** | a cobertura de `props` nas fichas está no [`STATE.md`](../../STATE.md) §Cobertura das fichas, que é gerado — não se copia número dele para cá. O `api-surface.json` já traz props e tipos de **todos** os componentes. Falta ligar os dois, e decidir o que é contrato publicado (nome, tipo, descrição) contra o que é só assinatura |
| **Dependências** | `G-REG-02` (feito) |
| **Prioridade** | 1 |
| **Status** | `ABERTO` — é o M8, Parte E do [`PLANO-1.0.md`](../../docs/PLANO-1.0.md), que continua sendo o dono do item |

---

## G-FORM-02 — `MultiCombobox` não acompanha o tamanho do campo

| | |
|---|---|
| **Capacidade** | degrau `sm`/`md`/`lg` no combobox de múltipla escolha |
| **Família** | Forms |
| **Tipo** | `missing-variant` |
| **Paridade** | `AUREA_PARCIAL` — o resto da família já tem |
| **Aurea hoje** | `MultiCombobox` ficou de fora do `G-FORM-01`. O campo dele é `.combobox-chip-input` dentro de `.combobox-multi`, e a caixa é dirigida pelos chips, que quebram linha |
| **Por que não entrou junto** | **razão objetiva do §17, não "é muita coisa":** a altura dele não vem de `--control-h-*`, vem do conteúdo. O eixo de tamanho é o chip e a caixa mínima — anatomia diferente, que pede medição própria contra as referências em vez de cópia do caso de valor único |
| **Referências** | a medir — Untitled UI `input-tags-outer.tsx` é o candidato mais próximo |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

---

## G-DOC-01 — a Aurea tem toast e não conta a ninguém

| | |
|---|---|
| **Capacidade** | notificação transitória **descobrível** — ficha, página de catálogo, exemplo |
| **Família** | Feedback · Developer experience |
| **Tipo** | `missing-doc` |
| **Paridade** | `AUREA_PARCIAL` — o comportamento existe; a descoberta não |
| **Aurea hoje** | `useToast` é exportado, o `AureaProvider` monta a lista, o core tem `.toast-stack`, e **três receitas do catálogo usam**. Não há ficha de registry, componente exportado nem página. Quem navega o catálogo não descobre que existe |
| **Referências** | seis das nove têm toast como componente de primeira classe |
| **Por que importa** | o §52 pede que uma IA **descubra** o componente antes de saber usá-lo, e o §108 cobra "quando usar / quando não usar". Capacidade invisível é capacidade que ninguém usa |
| **Prioridade** | 2 |
| **Status** | **FECHADO** em 21/08/2026, junto com o `G-DX-01` |

**Por que não fechou hoje, e o que a tentativa revelou.** Dar ficha ao toast esbarra no modelo do
registry, e o esbarrão é maior que o toast:

- O check 11 exige que toda ficha corresponda a um **componente exportado em PascalCase**.
- O sistema de `patterns` do catálogo tem a mesma exigência: `build-catalog.mjs` reprova com
  *"não é o name de nenhuma ficha do registry"*.
- E a superfície pública do toast **é um hook**: `useToast()`. O componente que desenha a lista é
  interno e montado pelo `AureaProvider`.

Medido em 21/08/2026: o pacote exporta **três hooks públicos** — `useToast`, `useAureaStrings`,
`useSpriteUrl` — e **nenhum tem ficha, página ou exemplo**. Não é um buraco do toast: é um tipo
de superfície que o registry não modela.

Enquanto isso, o catálogo já **cita** o toast sem documentá-lo: o pattern do `Alert` diz *"an
Alert stays put; a Toast would vanish"*. A documentação usa o conceito para explicar outro e não
tem para onde apontar.

**Duas saídas, e a escolha é de modelo, não de código:**

1. **O registry ganha registro de hook.** Honesto com o que a biblioteca é. Custa mudar o modelo
   de página da [ADR-0001](../../decisions/0001-modelo-de-pagina-do-catalogo.md), que exige
   *preview + código* em todo item — e hook tem código, não tem preview.
2. **Exportar um componente de toast** só para haver o que documentar. Fecha rápido e é o §76 ao
   contrário: inventar superfície para satisfazer um gate. A necessidade de posicionar a lista
   noutro lugar existe em tese, mas **não foi medida em consumidor nenhum**.

Fica aberto de propósito. É o tipo de decisão que o §19 manda subir — "duas arquiteturas
materialmente diferentes sem evidência suficiente" —, e escolher no susto contaminaria o modelo
de página inteiro. → `G-DX-01`.

---

## G-DX-01 — o registry não modela hook, e a biblioteca exporta três

| | |
|---|---|
| **Capacidade** | descobrir e documentar a superfície pública que **não é componente** |
| **Família** | Developer experience |
| **Tipo** | `architecture` + `missing-doc` |
| **Paridade** | `AUREA_INFERIOR` — o shadcn/ui tipa `registry:hook` no registry dele |
| **Aurea hoje** | `useToast`, `useAureaStrings` e `useSpriteUrl` são exportados e não existem em ficha, página ou exemplo |
| **Referências** | o `registry.json` do shadcn/ui traz `registry:hook` entre os tipos; a `base-ui` documenta `useToastManager` dentro da página do componente |
| **Dependências** | toca a [ADR-0001](../../decisions/0001-modelo-de-pagina-do-catalogo.md) |
| **Prioridade** | 2 — bloqueava `G-DOC-01` |
| **Status** | **FECHADO** em 21/08/2026 — decidido pelo Victor: opção 1 |

**Como fechou, e por que era menor do que eu tinha descrito.** Eu havia dito que dar ficha a hook
obrigaria mudar o modelo de página da [ADR-0001](../../decisions/), que exige *preview + código*.
**Fui conferir e estava errado:** o modelo já tem a válvula — `Dialog` e `Drawer` vivem em portal
e não renderizam em página estática, então usam `render: null` mais um `note` que explica. Um
hook cai exatamente nesse caso: tem código, não tem preview estático.

O que mudou, então, foi pequeno:

- o registry ganhou o eixo **`kind`** (`component` | `hook`), opcional e com `component` como
  padrão — as fichas que já existiam não mudaram;
- o **check 11** passou a varrer `export (function|const) useX` e a cobrar ficha para cada hook
  público, do mesmo jeito que cobra para componente;
- a contagem de estado separou os dois. Isso **não era opcional**: a trava
  `componentes == fichas`, criada nesta mesma atividade, reprovaria assim que a primeira ficha de
  hook entrasse. O gate pegou a consequência no desenho, antes de o defeito existir;
- o catálogo passou a dizer a espécie: o caminho diz **Hooks › Feedback › useToast** em vez de
  *Components*, e o cartão do índice leva selo próprio. Um hook anunciado como componente mente
  sobre o que a página é.

---

## G-STATE-01 — o vocabulário de estado da Aurea contra o do motor

| | |
|---|---|
| **Capacidade** | linguagem de estado consistente e completa (§27, §131) |
| **Família** | Foundations |
| **Tipo** | `missing-state` |
| **Paridade** | `AUREA_PARCIAL` |
| **Aurea hoje** | o [inventário do §9 da `base-ui`](05-INVENTARIO-BASE-UI.md) mediu **68 atributos de estado** no motor. **53 deles a Aurea nunca declarou.** Parte é de peça que não temos (`nested-drawer-swiping`); parte é vocabulário que falta de verdade |
| **O caso mais claro** | validação de formulário. O motor tem `dirty`, `touched`, `valid` e `invalid`; a Aurea só tem `invalid`. Sem `touched` não dá para escrever a regra que todo formulário quer: *não mostre o erro antes de a pessoa ter mexido no campo* |
| **Já corrigido em 21/08** | (a) os oito que o core **pintava** sem ninguém declarar — `dragging`, `highlighted`, `read`/`unread`, e o `orientation` do Toolbar, que virou variante; travado pelo check 27. (b) **o caso do `touched`**, pelo caminho da plataforma: `:user-invalid` no core faz a validação nativa pintar só depois da interação, sem estado em JavaScript e sem `Field` novo. E o `.select[aria-invalid]`, que faltava na regra que input e textarea já tinham |
| **Falta** | triar os 53 restantes: quais são vocabulário nosso, quais são de peça que não temos, quais entram. E decidir `valid` — pintar o campo de verde é decisão visual nova, e pelo §96 sobe para o Victor |
| **Prioridade** | 2 |
| **Status** | `ABERTO` — parcialmente coberto |

---

## G-STATE-02 — `invalid` parava no controle de TEXTO · **FECHADO 28/08/2026**

| | |
|---|---|
| **Capacidade** | estado de validação em todo controle de formulário |
| **Família** | Forms |
| **Tipo** | `missing-state` |
| **Paridade** | `AUREA_INFERIOR` → **`EQUIVALENT`** |
| **Fonte** | leitura das células `checkbox·estados`, `radio·estados`, `switch·estados`, `number-field·estados`, `file-input·estados` (27/08/2026) |
| **Prioridade** | 2 |
| **Status** | **`FECHADO`** — bloco único no core, dois gates, sete fichas corrigidas |

A Aurea pintava `invalid` em `.input`, `.textarea` e `.select` — por `aria-invalid` **e**
`:user-invalid`, que é a solução boa — e **parava aí**. Um checkbox obrigatório reprovado
(*"aceite os termos"*) não tinha estado visual nenhum, e é o caso de validação mais comum que
existe num formulário. Um vocabulário que vale para três dos oito controles não é vocabulário, é
exceção (§131).

### A pergunta obrigatória: quem mais tem esse problema?

Respondida por **comando**, não de memória. `invalid` é estado de CAMPO, e as superfícies de campo
do sistema saem de um `grep`:

```
$ grep -n "var(--field-bg)" packages/core/src/aurea.css
418:.input,.textarea,.select      614:.control-mark
489:.input-group                 1083:.combobox-multi
```

mais o `.dropzone` (que usa `--surface-inset` com borda tracejada). **Seis superfícies**, e o
parentesco entre o controle e quem desenha é de **três tipos diferentes** — é por isso que a
correção não cabia numa regra:

| parentesco | superfícies | por quê |
|---|---|---|
| o próprio controle | `.input` `.textarea` `.select` | ele tem a borda |
| o **irmão** | `.control-mark` `.switch-track` | o `<input>` é `opacity:0`; quem desenha é o irmão |
| um **ancestral** | `.input-group` `.combobox-multi` `.dropzone` | o filho abre mão da moldura (`border:0`), então pintar o filho não pinta nada |

### O que estava errado, e não era só a falta

Três defeitos diferentes, e dois deles **não eram ausência de regra**:

1. **Ausência mesmo** — marcáveis, `.combobox-multi` e `.dropzone` não tinham regra nenhuma.
2. **Regra que existia e não pintava** — o `.input` dentro de um `.input-group`. O grupo zera a
   borda do filho, então `border-color` no filho não pinta nada. **E a ficha do `InputGroup`
   declarava `invalid`**: o contrato prometia o que o desenho não entregava, e nada reprovava.
3. **Empate de ordem, duas vezes** — a regra do checkbox, escrita junto do `.input`, perdia para
   `input:checked + .control-mark`, que mora 200 linhas abaixo com a **mesma especificidade**. O
   seletor casava e a cor não mudava. Movida para junto do checkbox, **o switch repetiu o defeito**
   contra a `:checked` dele, 20 linhas adiante: o switch DESLIGADO pintava e o LIGADO não.

O terceiro é o que decidiu a arquitetura. O problema não era a linha; era **estar espalhado**.
Hoje existe **um bloco só** — `INVÁLIDO — um vocabulário só`, depois da última regra que pinta
borda de campo em todo o arquivo. Não há empate a perder, e quem acrescentar uma superfície de
campo nova acrescenta uma linha num lugar que já tem a resposta.

### Os dois controles, e o que cada um pega

`tests/visual/invalido.spec.ts`, e nenhum dos dois lê CSS — os dois injetam `aria-invalid` no
controle **real** das páginas construídas e medem se a aparência muda.

| gate | pergunta | escopo |
|---|---|---|
| varredura | algum controle de formulário **não** se mostra inválido? | as 328 páginas |
| ficha × desenho | o **contrato** diz a verdade sobre o desenho, nas duas direções? | os campos, por seletor nomeado |

**Provados contra o defeito**, os dois:

- removendo o bloco inteiro, a varredura acusa **15 controles** — a família completa;
- devolvendo o bloco para **antes** da `:checked` do switch, acusa **exatamente um**: o switch. É o
  empate de ordem isolado.

E a varredura mede os **dois estados** do marcável, não o que a página traz. Não é hipótese: das 9
páginas com `.switch`, **2 têm todos os switches desligados** — nelas um gate de um estado só
passaria verde com o defeito presente.

### Duas cegueiras de instrumento, e uma delas quase virou correção errada

**A nona: o espelho de formulário.** A base-ui renderiza, ao lado do campo que a pessoa usa, um
segundo `<input>` de 1×1px com `clip-path`, `tabindex="-1"` e `aria-hidden="true"`, só para o
`<form>` submeter o valor com o tipo certo. O gate o acusava, e a "correção" seria **pintar um
pixel invisível**.

**A décima: medir o vizinho.** A primeira versão do gate de ficha perguntava *"algum controle desta
página pinta?"*, e a resposta foi **`Label` PINTA** — porque a página do `Label` tem um `.input`
dentro, que é o único jeito de demonstrar um rótulo. É a mesma cegueira do probe de teclado medindo
a aba do banco anterior. Só um **seletor nomeado por componente** separa *o controle deste
componente* de *um controle que aparece nesta página*.

### As sete fichas que estavam calando

Medido com seletor próprio, componente a componente, depois da correção:

| ficha | antes | agora |
|---|---|---|
| `Checkbox` `Radio` `Switch` `NumberField` `OTPField` `SearchField` `FileInput` | pintava **não**, declarava **não** | pinta **sim**, declara **sim** |
| `InputGroup` | pintava **não**, declarava **sim** ← contrato mentindo | pinta **sim**, declara **sim** |
| `Input` `Textarea` `Select` `PasswordField` `Combobox` `MultiCombobox` | pinta e declara | inalterado |
| `Range` | não pinta, não declara | **correto** — sempre dentro de `[min,max]` |
| `Label` `Field` `InputGroupAddon` `Calendar` `SegmentedControl` | sem controle próprio | motivo declarado em `FICHA_SEM_INVALIDO` |

`OTPField` e `SearchField` não estavam no cartão original: apareceram **quando o gate mediu**, que
é a diferença entre varrer e listar de memória.

### E o `FileInput` sabia e não dizia

A rejeição (tipo errado, tamanho estourado) é o **inválido deste campo**, e existia só como texto
solto embaixo da zona: o componente sabia que o arquivo tinha sido recusado e **não marcava o
campo**. Agora o `<input type=file>` recebe `aria-invalid` e `aria-describedby` — uma descrição por
rejeição, porque soltar cinco arquivos ruins de uma vez dá cinco motivos e juntá-los num parágrafo
perde qual é de qual. É o mesmo idioma do `Field`, que já fazia isso com `error`.

O `error` da ficha do `FileInput` **fica**: é o upload que falhou, outra coisa. Dois nomes para dois
conceitos não é inconsistência de vocabulário.

### O que este cartão ACHOU e não fecha aqui

Medir o `Combobox`, o `MultiCombobox` e o `FileInput` na página deles foi impossível: o catálogo
escreve **"Interactive — see the code."** no lugar do preview. A medição foi para o padrão que os
usa de verdade, e a causa virou cartão próprio — **`G-LAB-01`**.

## G-AXIS-13 — duas props entraram sem decisão de eixo responsivo · **ABERTO**

| | |
|---|---|
| **Capacidade** | toda prop de união literal passa pela classificação visual/comportamental |
| **Família** | Foundations |
| **Tipo** | `missing-responsive` |
| **Paridade** | `INCONCLUSIVO` — falta a triagem, não a capacidade |
| **Fonte** | `node scripts/sweep-responsivo.mjs`, seção **NÃO TRIADAS** (28/08/2026) |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

```
NÃO TRIADAS (prop nova entrou sem decisão):
    InputGroupAddon.layout
    AppShell.topbarVariant
```

As duas nasceram de correções desta atividade — `layout` da decomposição do `align`
([ADR-0048](../../decisions/0048-ordem-estrutural-e-geometria-sao-eixos-separados.md), `G-A11Y-06`)
e `topbarVariant` do `G-A11Y-11`, que ensinou `Exclude<>` ao `build-api-surface` e revelou um eixo
que o check 14 nunca tinha conseguido enxergar.

O Victor foi explícito ao aprovar o fechamento do `G-AXIS-04`: *"não transforme a conclusão de
`size` e `orientation` em sensação de que a camada responsiva está pronta para sempre. Ela está
provada para os eixos atuais. **Novos eixos precisam passar pela mesma classificação
visual/comportamental e pela mesma disciplina.**"* Estas duas são exatamente esse caso, e o sweep
existe para elas não passarem em silêncio — ele fez o trabalho dele.

O que decide: [`18-G-AXIS-04-FAMILIAS.md`](18-G-AXIS-04-FAMILIAS.md) é o documento a reler antes,
e a pergunta é a mesma das outras: o valor é **visual** (muda com o espaço) ou **comportamental**
(muda a semântica, e aí precisa resolver em runtime e publicar atributo)?

---

## G-GATE-02 — um gate media um HTML que não existia mais · **FECHADO 28/08/2026**

| | |
|---|---|
| **Capacidade** | um controle que mede o que diz medir |
| **Família** | Tooling |
| **Tipo** | `missing-test` |
| **Paridade** | `NÃO_APLICÁVEL` — é defeito interno, não comparação |
| **Fonte** | a suíte completa de navegador rodada em 28/08 durante o `G-STATE-02` |
| **Prioridade** | 2 |
| **Status** | **`FECHADO`** |

Os dois testes de `Tabs` vertical em `tests/visual/orientacao.spec.ts` procuravam
`.tabs-vertical` — classe que o **`G-AXIS-06` apagou em 22/08**, quando a orientação passou a vir
do `data-orientation` que o motor publica em vez de uma classe escolhida pelo React. O
comportamento vertical do `Tabs` estava correto o tempo todo; **quem estava errada era a régua.**

### O modo de falhar era pior que a falha

`boundingBox()` num locator que não casa **não devolve `null` — ele espera.** O gate morria 30
segundos depois com:

```
Test timeout of 30000ms exceeded.
```

que não diz nada sobre o que aconteceu. Um gate quebrado que parece **lento** é pior que um gate
vermelho: ninguém lê "timeout" como "este seletor não existe". Por isso a correção não foi trocar
a string — foi fazer o instrumento **falhar alto**:

```ts
async function caixa(page, sel) {
  const n = await page.locator(sel).count();
  expect(n, `o seletor \`${sel}\` não casou com NADA na página...`).toBeGreaterThan(0);
  return (await page.locator(sel).first().boundingBox())!;
}
```

Os 4 testes passam em **2,2s**, contra dois timeouts de 30s.

### Quem mais tem esse problema?

Respondida por **varredura**, não por leitura: extraindo todo seletor de classe literal das specs
de `tests/visual/` e conferindo cada um contra o CSS do core, o HTML construído das 328 páginas e
o bundle do `keyboard-probe`, **`.tabs-vertical` era o único seletor morto.** Os outros dois hits
(`.btn-group-horizontal`, `.menubar-vertical`) estão em COMENTÁRIO, descrevendo história; o resto
são extensões de arquivo (`.json`, `.png`, `.pnpm`).

É a terceira aparição da mesma lei nesta auditoria — **instrumento que erra em silêncio mede o
vizinho, ou não mede nada.** As outras duas: o probe de teclado medindo a aba do banco anterior, e
o gate de ficha × desenho respondendo *"`Label` pinta `invalid`"* porque a página do `Label` tem um
`.input` dentro.

---

## G-LAB-01 — o catálogo mostra HTML morto, e três componentes não são mostrados · **ABERTO**

| | |
|---|---|
| **Capacidade** | ver e OPERAR o componente antes de escolhê-lo |
| **Família** | Tooling |
| **Tipo** | `missing-tooling` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | achado colateral do `G-STATE-02` (28/08/2026): medir o `Combobox` na página dele foi impossível |
| **Prioridade** | **1** |
| **Status** | `ABERTO` — é o que o **COMPONENT LAB** resolve |

### O que foi medido

O `G-STATE-02` foi medir o `invalid` do `Combobox` na página do `Combobox` e não achou controle
nenhum. A página existe, tem três demonstrações, e as **três** dizem:

```
Interactive — see the code.
```

Varrido o catálogo inteiro, são **12 demonstrações em 6 páginas** — e em três delas é **tudo o que
a página tem**:

| página | placeholders / demos |
|---|---|
| `combobox` · `multicombobox` · `fileinput` | **3 / 3** — o componente nunca aparece |
| `iconbutton` | 1 / 6 |
| `useaureastrings` · `usespriteurl` | 1 / 1 — são hooks, não desenham: correto |

### A causa é maior que os três

O catálogo é markup **estático**. `scripts/build-catalog.mjs` chama `renderToStaticMarkup` no
build, e a página carrega **8.472 bytes** de `catalog.js`, que trata exatamente três coisas —
copiar código (`data-aurea-copy*`), trocar a aba preview/código (`data-aurea-tabpanel`) e mandar o
tema para as iframes. **Não há React na página, e não há hidratação** (as quatro demos em `iframe`
do `AppShell` também são `renderToStaticMarkup`).

Então nenhum preview do catálogo **abre**, **filtra**, **digita** ou **fecha**. Um `Select` é a
imagem de um select fechado; um `Dialog` é o botão que não abre nada; e um `Combobox`, que só
existe enquanto se digita nele, não tem imagem nenhuma — foi por isso que virou placeholder. Os
três "sem demo" não são um esquecimento de autoria: são **o limite do meio** aparecendo.

### Por que isto é gap, e não escolha

Três consequências medidas, não supostas:

1. **A pergunta do Victor não tem resposta hoje.** *"Eu consigo abrir esse componente, interagir
   com ele e observar pessoalmente que ele faz o que a Aurea afirma que faz?"* — para `Combobox`,
   `MultiCombobox` e `FileInput` a resposta é **não**, e para o resto é *"só o estado inicial"*.
2. **Os gates herdam a cegueira.** `alvo-clicavel`, `invalido` e o sweep varrem as 328 páginas e
   medem o que o SSR deixou lá: nada que dependa de abrir, focar ou digitar entra. O banco de
   teclado existe **fora** do catálogo (`apps/keyboard-probe`) exatamente por isso.
3. **A matriz do §13 lê a ficha, não o componente.** Foi assim que o `InputGroup` prometeu
   `invalid` por meses sem pintar: não havia onde a promessa esbarrar no comportamento.

### O que fecha

O **COMPONENT LAB** — área do catálogo com os componentes **reais**, montados e operáveis, com
cobertura derivada do registry e gate que reprova se um componente público não tiver demo que
funcione. Com ele, três coisas deste cartão caem juntas: os placeholders somem, os gates passam a
alcançar comportamento, e a reconciliação ficha × componente deixa de depender de seletor escrito
à mão (hoje o `invalido.spec.ts` precisa de um `ALVO` por componente **porque** a página do `Label`
tem um `.input` dentro).

### Dependência registrada

O `G-STATE-02` fechou **medindo em páginas de padrão** (`pattern-combobox-…`,
`pattern-multicombobox-…`, `pattern-fileinput-…`) em vez das páginas dos três componentes. O desvio
está escrito no gate, em `PAGINA`, e sai quando este cartão fechar.

---

## G-STATE-03 — o `DataGrid` tem seleção e declara zero estados · **ABERTO**

| | |
|---|---|
| **Capacidade** | contrato que descreve o que o componente faz |
| **Família** | Data |
| **Tipo** | `contract-drift` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura da célula `data-grid·estados` (27/08/2026) |
| **Prioridade** | 2 |
| **Status** | `ABERTO` |

```ts
DataGrid<T>({data, columns, label, filterable, pageSize, selectable, onSelectionChange, getRowId})
```

A ficha declara `states: []`. **Linha selecionada é estado**, e o componente tem `selectable` e
`onSelectionChange`. Também tem ordenação e paginação, e nenhuma delas aparece no contrato.

É a mesma família do `G-A11Y-04`: a ficha é escrita à mão e declarava MENOS do que o componente
entrega. Lá era teclado, aqui é estado. A régua tem de ser a mesma — **medir no navegador o que o
`DataGrid` de fato emite** e declarar isso, não escrever de memória.

---

## G-STATE-04 — item de menu e nó de árvore desabilitados · **ABERTO**

| | |
|---|---|
| **Capacidade** | anunciar que uma opção existe e não pode ser escolhida |
| **Família** | Navigation |
| **Tipo** | `missing-state` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura das células `menu·estados`, `context-menu·estados`, `tree·estados` (27/08/2026) |
| **Prioridade** | 2 |
| **Status** | `ABERTO` |

| ficha | `states` | tem `disabled` |
|---|---|---|
| `DropdownMenu` | `closed · highlighted · open` | **não** |
| `ContextMenu` | `closed · highlighted · open` | **não** |
| `TreeView` | `default · expanded · selected · focus` | **não** |
| `Menubar` | `default · hover · open · disabled · focus-visible` | **sim** |

**A inconsistência é interna, não com a referência.** O `Menubar` declara `disabled` e os outros
três não — os quatro são a mesma família de item navegável, servida pelo mesmo motor. Um item
desabilitado que não se anuncia é pior que ausente: a pessoa tenta, e nada acontece.

---

## G-STATE-05 — a `Timeline` não mostra progresso · **ABERTO**

| | |
|---|---|
| **Capacidade** | linha do tempo com etapa concluída, corrente e futura |
| **Família** | Data |
| **Tipo** | `missing-state` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura da célula `timeline·estados` (27/08/2026) |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

```ts
Timeline({items: Array<{title: ReactNode; description?: ReactNode; time?: ReactNode}>})
```

A ficha declara `states: []` e o componente confirma: **não há onde pôr estado**. Uma linha do
tempo sem `completed`/`current` é uma lista com um risco ao lado — não mostra progresso, que é a
razão de o componente existir. A reui pinta `data-completed={step <= activeStep || undefined}`.

O `Stepper` da Aurea, que é o irmão desta peça, declara `active · done · error` e resolve bem. A
`Timeline` ficou para trás do próprio sistema.

---

## G-STATE-06 — a `Pagination` não tem páginas, e o core tem a pele delas · **ABERTO**

| | |
|---|---|
| **Capacidade** | navegar por página, sabendo em qual se está |
| **Família** | Navigation |
| **Tipo** | `missing-state` + `dead-skin` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura da célula `pagination·estados` (27/08/2026) |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

```tsx
<nav className="pagination"><Button …>Anterior</Button>
  <Badge variant="primary">{page} / {total}</Badge><Button …>Próxima</Button></nav>
```

`‹ Anterior · [3 / 10] · Próxima ›`. **Sem páginas numeradas, não há onde marcar a corrente** — e
por isso a célula acusava `active`/`selected` faltando.

### E a leitura achou mais do que a célula acusava

O core **carrega a pele de uma paginação numerada que ninguém constrói**:

```css
.pagination button:not(.btn) { width:var(--control-h-md); … }      /* botão numérico */
.pagination button.active { background:var(--primary); … }          /* a página corrente */
```

Medido: `.pagination button.active` só é produzido por **`legacy-reference.html`** — o arquivo
congelado. Nem o React nem o catálogo geram essa marcação. É pele morta herdada do legado.

E com o **mecanismo errado**: a regra do próprio arquivo, duzentas linhas acima, é explícita —

> `aurea.css:153` — *ITEM ATUAL por `[aria-current]` e não por uma classe `.active`: o estado que
> o leitor de tela precisa e o que o olho precisa são o mesmo, e usar dois caminhos é esquecer o
> outro.*

O `.sidebar-item[aria-current]` obedece. O `.pagination button.active` não.

### Por que o check 15 não pegou

O check 15 cobra *"só entra classe que a biblioteca produz"*, e a classe `active` **é** produzida
— pela navegação dos docs. O que não tem produtor é a **combinação** `.pagination button.active`.
Fica registrado: o check 15 não vê seletor composto cujo conjunto não tem produtor, só a classe
solta.

---

## G-STATE-07 — o calendário recebe o intervalo do motor e joga fora · **ABERTO**

| | |
|---|---|
| **Capacidade** | seleção de intervalo de datas, desenhada como intervalo |
| **Família** | Data |
| **Tipo** | `unpainted-capability` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura da célula `calendar·estados` (27/08/2026) |
| **Prioridade** | 2 |
| **Status** | `ABERTO` |

**O achado não é que a Aurea não tenha a capacidade. É que ela a tem e não a desenha.**

```ts
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {label?: string};
```

`mode="range"` compila e funciona: o `react-day-picker` instalado emite `range_start`,
`range_middle` e `range_end` — medido no pacote, não suposto. A pele:

```css
.calendar td[data-selected] button { background:var(--primary); … }   /* e mais nada */
```

Os `data-*` que a pele do calendário consome são `selected`, `today`, `outside`, `disabled` e
`hidden`. **Nenhum de intervalo.** Um intervalo de 12 a 19 de agosto é desenhado como **oito
pílulas soltas**, sem faixa ligando, sem pontas arredondadas nas bordas. O motor faz o trabalho
inteiro e a pele o descarta.

`focus`/`focused` das mesmas células **não é gap**: a Aurea tem `:focus-visible` global
(`aurea.css:11`), e os dias são `<button>`.

---

## G-AXIS-09 — o eixo existe no sistema e falta na peça · **ABERTO**

| | |
|---|---|
| **Capacidade** | as peças de uma família compartilharem os eixos da família |
| **Família** | Foundations |
| **Tipo** | `missing-axis` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura das células `toggle·tom`, `toggle·aparencia`, `progress·tom`, `progress·aparencia`, `slider·tamanho`, `skeleton·aparencia` (27/08/2026) |
| **Prioridade** | 2 |
| **Status** | `ABERTO` |

Seis células, quatro componentes, **um padrão só**: o eixo existe no sistema, está em toda a
família, e falta naquela peça. Não é comparação com referência — é a Aurea contra ela mesma.

| peça | o que falta | quem da família já tem |
|---|---|---|
| `Toggle` | **tom** e **aparência** | `Button`, `IconButton`, `ToolbarButton`: `axes.tone` com 6 valores, 13 variantes. O `Toggle` **é** um botão, e tem `sizes` — não é peça sem eixo |
| `Progress` | **tom** e o modo **indeterminado** | `Alert`, `Badge`, `Banner`, `Status` têm o vocabulário `danger/success/warning`. A barra é `background:var(--primary)` fixa (`aurea.css:729`) |
| `Range` | **tamanho** | `Checkbox`, `Switch`, `Select`, `Avatar`, `Toggle`, `Icon` declaram `sm · md · lg`. O `Range` é o **único controle de formulário** sem a escala |
| `Skeleton` | **forma** | `border-radius:7px` fixo. `circular`/`pill` não brigam com a identidade — `--radius-control: 999px` já é a pílula da Aurea |
| `Tabs` | **tamanho** | a untitled declara `md · sm`; a tira da Aurea tem `--control-h-md` fixa (`aurea.css:734`) |
| `Table` | **tamanho** | mui (`medium · small`) **e** untitled (`md · sm`). A Aurea tem densidade GLOBAL, não por instância — e tabela densa dentro de página confortável é caso real |
| `EmptyState` | **tamanho** | untitled: `lg · md · sm`. O vazio de uma página inteira e o de um painel de 300px têm hoje o mesmo ícone e o mesmo respiro |

> **As três últimas só apareceram em 27/08**, ao corrigir o `else` pendurado de `eixos.mjs` — os
> campos planos da `untitled-ui` eram engolidos e as células nem existiam. Ver
> [`24-EIXOS-E-TECLAS.md`](24-EIXOS-E-TECLAS.md).

**O indeterminado do `Progress` é o mais grave dos seis.** `Progress({value: number})` exige um
número, e carregar sem porcentagem conhecida é o estado normal de uma requisição — a mui, a
shadcn e a heroui têm todas. Não é um eixo a mais: é o caso de uso mais comum do componente.

---

## G-AXIS-10 — a `Topbar` não pode rolar para fora da tela · **ABERTO**

| | |
|---|---|
| **Capacidade** | escolher se a barra superior acompanha a rolagem |
| **Família** | Layout |
| **Tipo** | `missing-axis` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura da célula `topbar·posicao` (27/08/2026) |
| **Prioridade** | 4 |
| **Status** | `ABERTO` |

`.topbar { position:sticky }` (`aurea.css:70`), sem escapatória: sair disso hoje exige brigar com
a cascata. A mui oferece cinco posições no `AppBar`, e das cinco **uma é uso legítimo** — a barra
que rola junto e sai da tela, em página de leitura longa. As outras quatro (`absolute`, `fixed`,
`relative`) são o modelo de posicionamento do Material vazando pela API.

Um eixo de dois valores resolve: `sticky` (o padrão de hoje) e `static`. Pequeno, e concreto.

---

## G-AXIS-11 — a família da orientação, segunda leva · **ABERTO**

| | |
|---|---|
| **Capacidade** | orientação em componentes que ainda não têm o eixo |
| **Família** | Foundations |
| **Tipo** | `missing-axis` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura das células `accordion·orientacao`, `stepper·orientacao`, `radio·orientacao` (27/08/2026) |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

O `G-AXIS-03`/`04`/`06` fecharam a orientação em **8 de 8 componentes elegíveis** — e "elegível"
queria dizer *"já tem o eixo, falta torná-lo responsivo"*. Estas três **não tinham o eixo**, então
nunca entraram na conta. É a continuação da mesma família, não um item solto.

| peça | referência | o que muda |
|---|---|---|
| `Stepper` | mui | **o mais usado dos três.** A vertical põe o conteúdo de cada etapa entre elas — o padrão de formulário longo. A pele fixa `grid-auto-flow:column` (`aurea.css:760`) |
| `Accordion` | base-ui **e** radix, as duas na raiz | acordeão horizontal; ver também `G-A11Y-08`, que é a outra metade da mesma peça |
| `Radio` | radix, no `RadioGroup`, e ela emite `aria-orientation` | **e aqui falta mais que o eixo: a Aurea não tem `RadioGroup` nenhum.** Só o `Radio` solto. As setas funcionam porque o browser agrupa por `name=`; o que falta é o grupo — rótulo, `role=radiogroup`, e a orientação do arranjo. Mesma família do `G-AXIS-02` (`FieldGroup`) |
| `NumberField` | base-ui, e ali é **comportamental** | decide se os botões de incremento ficam empilhados à direita ou um de cada lado, e para que lado as setas do teclado andam. `axes: {}` na ficha da Aurea |

---

## G-CAP-28 — as abas não tratam transbordo · **ABERTO**

| | |
|---|---|
| **Capacidade** | tira de abas que não cabe na linha |
| **Família** | Navigation |
| **Tipo** | `missing-capability` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura da célula `tabs·aparencia` (27/08/2026) |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

`.tabs { display:inline-flex }` (`aurea.css:734`), e **nenhuma regra de `overflow` em lugar
nenhum** — medido. Vinte abas estouram a linha. A mui chama isso de `variant="scrollable"` e o
trata como aparência; não é: é o que acontece quando o conteúdo não cabe, que toda tira de abas
real enfrenta.

O `line` da shadcn, que veio na mesma célula, **é** decisão de identidade e fica de fora: o
`CLAUDE.md` diz *"Campos, filtros, tabs e botões textuais em pill"*.

---

## G-A11Y-07 — o `DataGrid` prometia teclado de grade e não tinha · **FECHADO 28/08/2026**

| | |
|---|---|
| **Capacidade** | navegar uma grade de dados pelo teclado (APG `grid`) |
| **Família** | Data |
| **Tipo** | `missing-capability` |
| **Paridade** | `AUREA_INFERIOR` → **`EQUIVALENT`** |
| **Fonte** | medição no navegador em 27/08/2026, ao ler a célula `data-grid·teclado` |
| **Prioridade** | 1 |
| **Status** | **`FECHADO`** |

**A célula acusava UMA tecla faltando. A medição achou que as quatro declaradas não existiam.**

O `DataGrid` era o único dos oito bancos cujo `a11y.keyboard` não tinha `keyboardNote` — quatro
setas escritas de memória, sem navegador atrás. Acrescentado ao `apps/keyboard-probe`, o resultado
foi `ArrowUp, ArrowDown, ArrowLeft, ArrowRight` **todas inertes**. O fonte confirmava: nenhum
`onKeyDown`, nenhum `tabIndex` em célula, `<table>` puro sem `role="grid"`, e o único `tabIndex={0}`
no `.table-wrap` — foco de contêiner, para a rolagem.

A ficha declarava `role: "grid"` e `apg: "grid"`. **Prometia uma acessibilidade que nunca existiu**
— e isso é pior que não ter: quem lê o contrato para decidir se adota confia nele. Em 27/08 a ficha
foi corrigida para o que se media (`role: "table"`, `keyboard: []`). Em 28/08 o componente passou a
merecer o que prometia.

### Por que `grid`, agora de verdade

A APG manda usar `grid` quando as células contêm widgets operáveis, e as deste contêm: cabeçalho
ordenável é `<button>`, seleção é `<input type=checkbox>`. E vem de brinde a correção de uma
limitação que o próprio comentário do arquivo registrava como fato da vida:

> *"aria-selected é inválido em role=table, o estado acessível é o próprio checkbox"*

**Em `role="grid"` ele é válido.** A linha selecionada deixou de ser só `data-selected` (estilo) e
passou a ter `aria-selected` — estado ACESSÍVEL, que é o que o leitor de tela anuncia. O atributo
só aparece quando a grade é `selectable`: numa grade sem seleção, `aria-selected="false"` em toda
linha anuncia um estado que ela não tem.

### O modelo de foco, e o que ele custa

Uma parada de Tab para a grade inteira (roving tabindex pelas células, cabeçalho incluído), setas
navegando sem dar a volta, `Home`/`End` na linha, `Control+Home`/`Control+End` na grade,
`PageUp`/`PageDown` de 10 linhas, `Enter`/`F2` para entrar no widget da célula e `Escape` para
voltar. Dentro do widget o teclado é **dele** — a grade não intercepta.

Duas teclas para marcar um checkbox é o preço de a grade ter navegação, e é o que o exemplo *Data
Grid* da própria APG faz. Em troca, uma grade de 5 linhas com seleção deixou de custar **12 paradas
de Tab** e passou a custar **1**.

### O que a medição pegou, e o que ela não alcança

**9 das 13 teclas medidas no navegador**, de DUAS células de partida. A segunda partida não é
capricho: numa grade, começar no canto deixa `ArrowLeft` e `Home` sem para onde ir, e começar no
meio da coluna zero deixa as mesmas duas paradas. **Isso é inércia da POSIÇÃO, não do componente** —
e a diferença importa porque o relatório de "declarada sem efeito" é o que alimenta a
`keyboardNote`. O gate ganhou `deTambem` para isso, e o mecanismo serve a qualquer banco com borda.

As 4 restantes têm teste de comportamento, e o motivo de cada uma está escrito: `Escape` só age de
DENTRO de um widget (dois passos, que a foto não faz); `F2`, `Control+Home` e `Control+End` não
estão na lista de candidatas do probe, que pressiona teclas sem modificador.

### Duas correções de instrumento no caminho, e uma correção minha

**O seletor do banco quebrava o escopo.** `foco: "th,td"` vira `[data-probe="DataGrid"] th, td` —
*"os `th` deste banco, e TODOS os `td` da página"*. A asserção de foco (que existe desde o
`FileInput` medindo a aba do `Tabs`) pegou: o `.focus()` pousou fora da seção. `:is(th,td)` mantém
a lista dentro do descendente.

**E uma afirmação minha que a medição desmentiu.** Eu havia escrito, em comentário e em teste, que
sem o `clamp` da linha de "vazio" a grade *"sumia da ordem do Tab"*. **Falso** — ela continua
alcançável. O defeito real é mais sutil: a parada de Tab fica numa célula e o foco em outra.

```
sem o clamp   TH:0  TH:-1  TD:-1   ← foco no TD, parada de Tab no TH
com o clamp   TH:-1 TH:-1  TD:0    ← a parada acompanha o foco
```

Sair da grade e voltar devolvia a pessoa ao cabeçalho, e não a onde ela estava. E o **teste que eu
tinha escrito passava verde com o defeito presente**, porque CONTAVA quantas células têm
`tabindex="0"` — e a conta dá 1 nos dois casos. Reescrito como a invariante do roving: *a célula
focada É a parada*. Provado contra o defeito, com a mensagem nomeando o que quebra.

---

## G-A11Y-08 — o teclado que o motor não entrega, medido · **ABERTO**

| | |
|---|---|
| **Capacidade** | o teclado que as referências entregam e o motor da Aurea não |
| **Família** | Foundations |
| **Tipo** | `missing-capability` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura das células `menu·teclado`, `accordion·teclado`, `tabs·teclado`, `otp-field·teclado` (27/08/2026) |
| **Prioridade** | 2 |
| **Status** | `ABERTO` |

O `G-A11Y-04` mediu o que o motor **entrega** e corrigiu as fichas que declaravam menos. Estas
quatro são o resto: teclado que a radix entrega e a medição no navegador mostrou que o nosso
motor **não** entrega. Não é ficha errada — é capacidade.

| peça | falta | o que está atrás |
|---|---|---|
| `Menu` | `Home`, `End`, `PageUp`, `PageDown` | a radix delega a `RovingFocusGroup` e as tem; o menu da Base UI foi medido e não move nada com elas. `ArrowLeft`/`ArrowRight` são de **submenu** e o banco não tem submenu — **não estão provadas em nenhum sentido**, e é o que falta medir |
| `Accordion` | 4 setas + `Home`/`End` | **troca declarada:** o `Accordion` da Aurea é `<details>/<summary>` nativo, e `<details>` não faz foco itinerante — dez seções exigem dez `Tab`. O ganho do outro lado é real: funciona sem JavaScript, e o Ctrl+F do navegador revela conteúdo fechado, coisa que nenhum acordeão de motor faz |
| `Tabs` | ativação **manual** | a APG recomenda quando o painel é caro de montar: a seta move o foco e `Enter`/`Space` ativam. A Base UI **tem** o modo (`activateOnFocus`, `TabsTab.tsx:50`) e a Aurea não o expõe — mesma forma do `G-STATE-07` |
| `OTPField` | `ArrowDown` | assimetria **do motor**: a Base UI responde a `ArrowUp` e não a `ArrowDown`, medido em 22/08 e registrado no `keyboardNote` da ficha. Seta que anda num sentido e não no outro é defeito de acessibilidade |

**As duas do `Tabs` e do `OTPField` não exigem trocar de motor** — uma é prop que não passamos, a
outra é um `onKeyDown` de uma linha por cima do motor. As do `Accordion` exigem decisão
arquitetural, e ela tem de ser tomada com a troca à vista, não por omissão.

---

## G-CSS-02 — quatro raios crus, e dois fora da escala · **ABERTO**

| | |
|---|---|
| **Capacidade** | raio como identidade, e não como número solto |
| **Família** | Foundations |
| **Tipo** | `token-bypass` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura da célula `skeleton·aparencia` (27/08/2026) |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

O `CLAUDE.md` lista **raios** entre as coisas que não se trocam sem autorização. A escala existe
em tokens: `radius-xs: 6` · `sm: 8` · `md: 10` · `lg: 16` · `card: 22` · `control: 999`.

E o core tem **quatro `border-radius` crus**, medidos:

| onde | valor | token equivalente |
|---|---|---|
| `.checkbox .control-mark` (`597`) | `5px` | **nenhum** — fora da escala |
| `.skeleton` (`730`) | `7px` | **nenhum** — fora da escala |
| `.progress` (`728`) | `999px` | `--radius-control` |
| `.message-bubble` (`936`) | `6px` | `--radius-xs` — **e na mesma declaração já há um `var(--radius-…)`** |

Dois bypassam um token que existe; **dois usam um valor que a escala não tem**. Raio cru é
exatamente o mecanismo pelo qual a identidade deriva sem ninguém autorizar — e a catraca do
check 12 é de **espaçamento**, então raio não tem catraca nenhuma.

O `.message-bubble` é o mais claro: metade do atalho é token e metade é `6px`.

---

## G-A11Y-09 — teclado declarado sem medição: 29 fichas, e o DataGrid era só a primeira · **PARCIAL**

| | |
|---|---|
| **Capacidade** | a ficha dizer a verdade sobre o teclado que o componente entrega |
| **Família** | Foundations |
| **Tipo** | `contract-drift` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | o `G-A11Y-07` (27/08/2026), e a pergunta obrigatória do `CLAUDE.md` |
| **Prioridade** | 1 |
| **Status** | **`PARCIAL`** — 27 de 41 medidas, 14 na fila com teto |

O `G-A11Y-07` achou que a ficha do `DataGrid` prometia `role: "grid"` e quatro setas que **não
existiam**. *Quem mais tem esse problema?* — a resposta foi medida:

```text
41 fichas declaram a11y.keyboard
   12  tinham rastro de medição (keyboardNote)
   29  NÃO tinham — teclas escritas de memória
```

### O que foi feito na mesma sessão

O `apps/keyboard-probe` foi de **8 para 26 bancos**, e a medição achou exatamente o que se
esperava de listas escritas de memória:

| ficha | o que a medição corrigiu |
|---|---|
| `DataGrid` | **quatro setas que não existiam**, e `role: grid` num `<table>` puro |
| `TreeView` | entregava `Home`, `End`, `Enter`, `Space` sem declarar |
| `ContextMenu` | entregava `ArrowLeft`, `ArrowUp`, `Home`, `End` sem declarar |
| `Sidebar` | entregava `Space` sem declarar |
| `ToggleGroup` · `Toolbar` · `SegmentedControl` | entregavam `Enter` e `Space` sem declarar |
| `Combobox` | entregava `ArrowUp` sem declarar |
| `Stepper` | **o botão da etapa não recebia foco** — ver `G-A11Y-10` |

**27 de 41 estão medidas.** As 14 que faltam estão em `TECLADO_SEM_MEDICAO`, no check 30, **cada
uma com o motivo** — todas precisam de montagem que o banco não tem: sobreposição que só existe
aberta (`Dialog`, `Drawer`, `Popover`, `Tooltip`, `HoverCard`), dois níveis de foco (`Menubar`,
`NotificationCenter`, `MultiCombobox`), casca de aplicação (`AppShell`, `CommandPaletteShell`),
motor de terceiro (`MediaPlayer`), e três casos de peça-dentro-de-peça.

### O controle: check 30, com teto que só desce

Teclado declarado exige `keyboardNote` — o rastro que diz **quando**, **com que instrumento** e
**o que ficou por confirmar**. A nota pode declarar que a medição *não* confirmou (o `Chart`, cujo
teclado é do Recharts; o `FileInput`, cujas teclas abrem chrome do sistema operacional). O que não
pode é o silêncio.

A dívida é uma lista nomeada com teto de **14**, e o check reprova em três direções: nome fora da
lista sem nota, lista maior que o teto, e **nome na lista que já foi medido** — dívida quitada que
fica na lista faz o teto mentir.

---

## G-A11Y-10 — o botão da etapa do `Stepper` não recebia foco · **CORRIGIDO**

| | |
|---|---|
| **Capacidade** | etapa clicável alcançável pelo teclado (WCAG 2.1.1) |
| **Família** | Navigation |
| **Tipo** | `a11y-defect` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | medição em 27/08/2026, ao acrescentar o banco do `Stepper` |
| **Prioridade** | 1 |
| **Status** | **`CORRIGIDO`**, com o controle que o pega |

```css
.step-trigger { display:contents; … }     /* antes */
```

Um `<button>` com `display:contents` **não gera caixa**, e um elemento focalizável sem caixa não
recebe foco — o Chromium recusa `.focus()`. **A etapa clicável só funcionava com o mouse.** Falha
de WCAG 2.1.1 (Teclado).

E a regra contradizia o comentário imediatamente acima dela, escrito quando a peça foi feita:

> *"Etapa clicável (fluxo não-linear): o alvo é um botão de verdade, **com o foco do sistema**."*

### Como apareceu

Pelo banco do `Stepper`, que reprovou com *"o seletor `button` não pôs o foco dentro do banco"* —
a **asserção de foco** acrescentada ao probe horas antes, para que um seletor errado nunca mais
medisse o banco vizinho em silêncio. O instrumento novo achou um defeito de produto.

### Quem mais tem esse problema

`display:contents` aparece **uma vez** no core inteiro, e era esta. A pergunta foi feita e a
resposta é ninguém.

### A correção e a prova

`display:block; width:100%; text-align:inherit` reproduz o arranjo — o `.step-dot` já é
`margin:0 auto` e o rótulo já herda `text-align:center` do `.step`. Depois da correção o banco
mede `Enter, Space`, e a `skin.spec.ts` passa: a geometria não mexeu.

---

## G-A11Y-11 — o `Card` dizia "clicável" e não dava caminho de teclado · **CORRIGIDO**

| | |
|---|---|
| **Capacidade** | superfície clicável operável pelo teclado (WCAG 2.1.1) |
| **Família** | Layout |
| **Tipo** | `a11y-defect` |
| **Paridade** | `AUREA_INFERIOR` → **resolvido** |
| **Fonte** | leitura da célula `card·estados` (27/08/2026) |
| **Prioridade** | 2 |
| **Status** | **`CORRIGIDO`** em 28/08/2026, com o defeito tornado impossível de escrever |

O `Card` oferecia `variant="interactive"` — ponteiro de mão, elevação no hover — sobre uma `<div>`
sem `tabIndex`, sem `role` e sem teclado. E a descrição do próprio pattern dizia o que ele
pretendia ser:

> *"A card that is a target: the interactive variant carries the hover and **the focus ring**."*

Não havia anel de foco, porque não havia foco. **Mesma forma do `G-A11Y-10`**: a intenção estava
escrita e a implementação a contradizia.

### Quem mais tem esse problema — medido, não estimado

`cursor:pointer` aparece em **23 regras** do core, e ler o seletor daria a resposta errada: o
`.step-trigger` *parece* um gatilho e era um `<button>` que o `display:contents` deixara sem
caixa. Então a pergunta foi respondida por um gate que mede o **resultado** — para cada elemento
que o navegador desenha com `cursor:pointer` nas 328 páginas do catálogo, existe caminho de
teclado até a ação?

**Resposta: 22 das 23 têm. Uma não tinha, e era esta.**

### A decisão de semântica, que é o cerne

`tabIndex={0}` na `<div>` deixaria o gate verde e a pessoa sem papel, sem tecla e sem nome
acessível. A pergunta certa é o que a variante **promete**, e ela pode prometer duas coisas
diferentes:

| promessa | elemento |
|---|---|
| **ação** — clicar faz algo aqui | `<button>` |
| **navegação** — clicar leva a outro lugar | `<a href>` |

**O componente não pode adivinhar.** Escolher `<button>` sempre quebraria abrir-em-nova-aba num
cartão-link. Então quem sabe decide, pelo idioma que a casa já usa com a Base UI:

```tsx
<Card variant="interactive" render={<button type="button" onClick={…} />}>…</Card>
<Card variant="interactive" render={<a href="/planos" />}>…</Card>
```

### O defeito ficou IMPOSSÍVEL DE ESCREVER

Não é um aviso em prosa nem só um teste: é uma união discriminada, e `<Card
variant="interactive">` sem `render` **não compila** (`TS2322`). Provado nos dois sentidos — a
forma defeituosa falha, a correta e as outras variantes compilam.

### Três camadas mexidas, cada uma na sua

- **`fundirRender`** em `pure.tsx` — a peça compartilhada, porque o `G-API-02` vai repeti-la.
- **A pele** — `.card-interactive` ganhou `display:block; inline-size:100%; font:inherit;
  text-align:inherit; color:inherit`. Um `<button>` traz fonte própria, centraliza e encolhe até o
  conteúdo; sem isso o cartão-botão desenharia diferente do cartão-div. Mesma lição do
  `.step-trigger`.
- **O catálogo** — o pattern passou a demonstrar a forma correta, e o `code` que ele publica
  ensina `render`.

### Os controles, provados contra o defeito

| controle | prova |
|---|---|
| `tests/visual/alvo-clicavel.spec.ts` | reintroduzida a `<div>` antiga ⇒ reprova nomeando a página; restaurada ⇒ verde |
| `tests/unit/card-alvo.test.tsx` (7) | `fundirRender` ignorando o `render` ⇒ 5 vermelhos; classe da pele sumindo ⇒ 1 |
| `tsc` | a forma sem `render` não compila |

### Cinco cegueiras do gate, e por que elas ficam registradas

O gate **passou verde na primeira execução**, com o defeito presente. Cada volta está comentada
no fonte dele:

1. `closest([tabindex])` absolvia tudo — o catálogo envolve cada demonstração num
   `role="tabpanel" tabindex="0"`, que é foco de **rolagem**. Foco não é ativação.
2. Filhos herdam `cursor:pointer` e entravam como defeitos próprios — só a **raiz** é a causa.
3. Controle **desabilitado** não promete ação; acusá-lo é cobrar teclado de um inerte.
4. O `<span class="control-mark">` é **irmão** do input, não pai nem filho: o que o absolve é o
   `<label>` em volta.
5. O relatório não dizia **em que página**, e conferir a primeira com aquela classe mostrava um
   caso correto.

**O gate só é confiável porque cada acusação que ele fez foi investigada até o fim.** Sobrou uma,
e era real.

### E o gate novo revelou um segundo achado, de outra família

Ensinar o `api-surface` a resolver `Exclude<>` (necessário para a união discriminada) tornou
visível um eixo que estava escondido: **`AppShell.topbarVariant`** (`floating | flush`) gravava
`values: null`, e por isso o check 14 nunca teve o que comparar. A ficha não o declarava.
Medido em seguida: é a **única** prop com `Exclude<>` no pacote — nenhum outro eixo estava
escondido assim. Declarado em `AppShell.axes`.

---

## G-API-02 — o motor entrega e a Aurea não passa adiante · **FECHADO 28/08/2026**

| | |
|---|---|
| **Capacidade** | alcançar, pela API da Aurea, o que o motor já sabe fazer |
| **Família** | Foundations |
| **Tipo** | `capped-api` |
| **Paridade** | `AUREA_INFERIOR`/`REQUER_LEITURA` → **`EQUIVALENT` nas seis células** |
| **Fonte** | leitura das células de `anatomia` (27/08/2026) |
| **Prioridade** | 1 |
| **Status** | **`FECHADO`** — os quatro sítios de API fecharam. O `Calendar` NÃO era deste cartão: a leitura dele é pintura de intervalo, e mora no `G-STATE-07` |

**Este cartão nomeia um PADRÃO, não um componente.** Ele apareceu cinco vezes em leituras
independentes, e a quinta foi a que deixou claro que era o mesmo defeito:

| onde | o motor entrega | a Aurea | estado |
|---|---|---|---|
| `menu·anatomia` | Base UI tem 21 peças no `Menu` | usava 7, expunha 0 | **FECHADO** |
| `tabs·teclado` | Base UI tem `activateOnFocus` no `Tabs` | passava **fixo em `true`** | **FECHADO** |
| `number-field·anatomia` | Base UI tem `ScrubArea` | não expunha | **FECHADO** |
| `combobox·anatomia` | Base UI tem 28 peças no `Combobox` | expunha 0 | **FECHADO** |
| `G-STATE-07` | `react-day-picker` emite `range_start`/`middle`/`end` | a pele pinta só `[data-selected]` | **não é deste cartão** — ver abaixo |

> **A célula do `Tabs` não era a que este cartão dizia.** A tabela original apontava `G-A11Y-08`, e
> o `§4b` do HANDOFF mandava mover `tabs·anatomia`. Nenhuma das duas: `tabs·anatomia` já estava
> `EQUIVALENT` desde 27/08 e diz, por escrito, que ativação manual **não é anatomia** — *"o que
> falta ao `Tabs` é transbordo, ativação manual e tamanho: três capacidades, nenhuma delas
> anatomia"*. Quem estava `AUREA_INFERIOR` por exatamente isto era **`tabs·teclado`**, cuja leitura
> já tinha nomeado a causa: *"não está ausente: está FIXO em ativação automática. A correção é
> expor a escolha, não ligar um modo."* Corrigido medindo o arquivo, não seguindo a nota.
>
> **E a linha do `Calendar` sai do escopo por leitura, não por cansaço.** Ela é a única das cinco
> em que o defeito não é API fechada: a prop existe, o motor emite os três atributos e a **pele**
> só pinta `[data-selected]`. Isso é desenho, não superfície, e é literalmente o enunciado do
> `G-STATE-07`. Fechar este cartão com ela dentro seria fechar por definição.

---

### O que o menu ganhou, e por que a correção NÃO foi trocar dado por composição

`DropdownMenu({items: Array<{label, onClick?, disabled?, leadingIcon?}>})` **não expressava** nada
do que um menu real tem. Um menu "Ver" comum era impossível de escrever.

Havia duas saídas, e a escolha tem argumento:

**(a) trocar `items` por `children` compound.** Dá liberdade total e obriga a repetir a montagem em
cada um dos três menus.

**(b) manter o dado e abrir a FORMA dele.** Um menu **é** uma lista de comandos: `items` deixa o
caso comum trivial e mantém os três menus idênticos. O teto não estava em ser dado — estava em o
dado ter **uma forma só**.

Foi **(b)**. `MenuEntry` virou uma **união discriminada por `kind`**, com `kind` **opcional** no
item de ação:

```ts
type MenuEntry = MenuActionDef      // {label, onClick?, disabled?, leadingIcon?, render?}
               | MenuLinkDef        // {kind:"link",  href, target?, rel?, closeOnClick?}
               | MenuCheckboxDef    // {kind:"checkbox", checked?, defaultChecked?, onCheckedChange?}
               | MenuRadioGroupDef  // {kind:"radiogroup", value?, onValueChange?, items:[…]}
               | MenuSubmenuDef     // {kind:"submenu", items: MenuEntry[]}   ← aninha
               | MenuGroupDef       // {kind:"group",   label?, items: MenuEntry[]}
               | "separator";
```

**A forma antiga continua válida byte por byte** — `MenuItemDef` virou alias de `MenuActionDef` —
e o compilador cobra o resto. Não há quebra de API.

### Vale para os TRÊS menus, e isso não é generosidade

`DropdownMenu`, `ContextMenu` e `Menubar` importam o **mesmo** `renderMenuItems`. A pergunta
obrigatória do `CLAUDE.md` — *quem mais tem esse problema?* — tinha resposta exata no `import`, e
corrigir só o `DropdownMenu` seria o patch local que ele proíbe. O teste do `ContextMenu` é dele,
não uma inferência a partir do outro.

### O que os testes cobram, e o que eles pegaram

Comportamento, não markup: **o papel ARIA que o leitor de tela vai anunciar** e o efeito de operar
o item. Um menu que renderiza `role="menuitem"` onde deveria haver `menuitemcheckbox` mente para
quem não enxerga, e nenhuma inspeção de classe pegaria isso.

**Provados contra o defeito:** com o renderizador antigo no lugar, **7 dos 8 reprovam**.

E dois deles acharam coisa que eu ia deixar passar:

- **`onCheckedChange` recebia um `PointerEvent` de brinde.** O motor chama com
  `(checked, detalhes)`; a assinatura pública da Aurea dizia `(checked)`. Agora ela **passa só o
  `checked`**, e isso é contrato: repassar o segundo argumento faria a API pública da Aurea mudar
  junto com uma versão do Base UI.
- **O submenu não abre por clique em jsdom.** O `SubmenuTrigger` abre ao REPOUSAR o ponteiro, e
  repouso não existe ali — o teste estava prestes a acusar o componente de um defeito do
  ambiente. Medido por `ArrowRight`, que é a tecla que a APG define para entrar num submenu.

### Os estados novos são MEDIDOS, não escritos de memória

Eu ia declarar `checked` e `submenu-open` nas fichas de cabeça — o defeito exato que esta auditoria
existe para pegar. Medido no DOM, o que sai é:

```
div.menu-item :: data-checked   role=menuitemcheckbox aria-checked=true
div.menu-item :: data-unchecked role=menuitemcheckbox aria-checked=false
div.menu-item :: role=menuitem aria-haspopup=menu aria-expanded=true data-popup-open
```

Então as fichas declaram **`checked`** e **`popup-open`** — os nomes que o componente emite, não os
que eu tinha inventado. A medição também provou o argumento do slot de largura fixa: o indicador
**só existe quando marcado**, então sem o `.menu-mark` os rótulos andariam para o lado a cada
clique.

### Dois gates do próprio repositório cobraram a pele, e tinham razão

- **`raw-px`** subiu de 115 para 116: o recuo do rótulo de grupo repetia o `10px` do `.menu-item`.
  Repetir a constante não mantém a relação — quem mudar o recuo do item desalinharia o rótulo sem
  perceber. Virou `--menu-px`, e a catraca **voltou para 115**.
- **"pele faltando"** acusou `.menu-group`: classe emitida sem regra no core. Não ganhou regra —
  **deixou de ser emitida**. O `role="group"` carrega a semântica; classe sem pele é identidade
  prometida e não entregue.

### `Tabs` — a escolha entre ativar na seta e ativar no Enter

`activateOnFocus` estava **fixo em `true`** no JSX, sem valor, que em JSX é `={true}`. Não faltava
capacidade: faltava a saída. A APG nomeia os dois padrões e diz quando cada um serve — automática
quando o painel é barato, **manual** quando trocar de aba custa uma ida à rede; sem a escolha,
atravessar cinco abas por teclado dispara cinco carregamentos.

Default continua `true` — o comportamento de sempre, byte por byte, para quem não pede nada.
`loopFocus` entrou junto pela pergunta obrigatória: é a **mesma prop do mesmo `Tabs.List`**, tapada
pelo mesmo motivo, e o `Menubar` já expunha a dele.

Quatro testes medem o **efeito**, não a prop: o `Tabs` é controlado, então "o painel trocou" é
`onChange` ter sido chamado. **Provado contra o defeito:** devolvendo o `activateOnFocus` literal,
o teste da ativação manual reprova.

> **Correção de instrumento:** a primeira versão presumia que clicar na aba **já selecionada**
> emitia `onChange`. Não emite — o motor só avisa quando o valor muda de verdade.

### `NumberField` — a alça de arrasto, e por que a recusa anterior não se sustentava

A recusa estava **escrita no código**: *"fora de propósito: gesto que ninguém descobre sozinho e
que não tem equivalente por teclado"*. As duas metades da frase são verdade. A conclusão é que não
era: nenhuma delas é argumento contra **oferecer** o gesto, só contra **impô-lo**. `scrubbable` é
opt-in, default `false`.

**A prova que importa não é o arraste, é a adição.** Três dos sete testes existem só para provar
que ligar a alça **não tira nada**: o teclado continua inteiro, os dois botões continuam nomeados,
e a alça é invisível para a tecnologia assistiva. Uma capacidade aditiva que degradasse a acessível
seria pior que a ausência.

O arraste foi **medido**, não dado como inalcançável: o jsdom não tem `requestPointerLock` e mesmo
assim o motor responde a `pointerdown`+`pointermove` e o valor muda; `min`/`max` seguram durante o
arraste.

**Três defeitos que só apareceram ao escrever a pele e os testes:**

- **o cursor virtual renderizava VAZIO.** O Pointer Lock **esconde o ponteiro do sistema** e o
  motor desenha o `ScrubAreaCursor` no lugar dele — sem filho e sem caixa, o arraste ficava sem
  cursor nenhum;
- **o eixo não chegava à pele**, então a alça vertical mostrava `ew-resize`: a pele descrevendo um
  gesto que não é o que acontece. O motor **não publica** a direção (medido: o `State` do
  `ScrubArea` é o do `Root`), então saiu como classe — a regra da casa é atributo quando o motor
  publica, classe quando não;
- **o `aria-hidden` que o comentário prometia estava no ÍCONE**, não na alça, onde não fazia nada
  porque o `Icon` já o põe sozinho. Achado pelo teste que **mede** o atributo, não pelo que lê a
  intenção.

### `Combobox` — agrupa, e o vazio se escreve

Faltavam **opções agrupadas** e **o conteúdo do vazio**. `Clear` a leitura dava como ausente e
**já estava implementado** — esse ponto da leitura estava desatualizado, e fica registrado.

**A pendência de pesquisa está medida.** A pergunta em aberto era como o `Combobox.Root` recebe
itens agrupados para o filtro do motor funcionar. Lido no `AriaCombobox` do Base UI 1.6.0: é a
**mesma prop `items`**, tipada `readonly any[] | readonly Group<any>[]`, e `Group` é `{items: […]}`
com as demais chaves livres — `{label, items}` serve como está. O motor achata para resolver rótulo
e seleção, e **filtra dentro de cada grupo**, descartando o que ficou vazio e devolvendo
`{...grupo, items: filtrados}`.

O teste que vale é o do **filtro**: renderizar `role="group"` prova pouco. **Provado contra o
defeito:** com a lista sempre plana, 3 dos 5 reprovam.

> **Duas correções de instrumento**, as duas acusando o componente por defeito da régua: um
> `queryByRole("group")` solto reprova **sempre**, porque o invólucro do campo (`.combobox-group`,
> o `InputGroup` do motor) **também** é `role="group"`; e uma segunda consulta por papel+nome não
> reencontra o campo depois de aberto.

### O vazamento que o cartão achou em SETE componentes

Escrever o teste do teclado do `NumberField` revelou que `onValueChange` era chamado com **dois**
argumentos — `(valor, eventDetails)` — enquanto a assinatura pública declara um. Em TypeScript isso
é **invisível**, porque argumento a mais nunca é erro de tipo: o defeito é silencioso e a assinatura
é mentirosa. O custo é acoplamento — quem escrever `(v, e) => …` passa a depender do formato de
evento de **uma versão** do Base UI, e a Aurea deixa de poder trocar de motor sem quebrar consumidor.

Este cartão já tinha corrigido isso **uma vez**, no `onCheckedChange` do item de menu, **sem
perguntar quem mais tinha**. Tinham outros **sete**, medidos por varredura e conferidos um a um
contra o `.d.ts` do motor, que declara `eventDetails` nos sete: `NumberField`, `OTPField`,
`Combobox`, `MultiCombobox`, `Collapsible`, `Toggle` e `ToggleGroup`. Um ajudante — `soOValor` —
em vez de sete cópias.

**E dois testes já existentes codificavam o vazamento**, pedindo `expect.anything()` num segundo
parâmetro que a API nunca declarou. Foram escritos contra o comportamento observado em vez do
contrato — que é exatamente como um defeito silencioso ganha um gate verde por cima.

### O que NÃO é este cartão

**A API monolítica não é o defeito.** `Dialog({title, children, footer})`, `Popover`, `Drawer`,
`Card`, `Toolbar` e `ButtonGroup` recebem `children`, e ali a composição está servida com uma API
mais simples que a compound — é escolha boa.

---

## G-AXIS-12 — o `Drawer` não sobe pela base · **ABERTO**

| | |
|---|---|
| **Capacidade** | folha que sobe pela base da tela |
| **Família** | Overlays |
| **Tipo** | `missing-axis-value` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | leitura da célula `drawer·posicao` (27/08/2026) |
| **Prioridade** | 2 |
| **Status** | `ABERTO` |

```ts
side?: "left" | "right"
```

A mui tem `top · right · bottom · left`. **Falta o `bottom`** — e ele não é o quarto de quatro: a
folha que sobe pela base é *a* sobreposição de tela estreita. A shark construiu a gaveta dela
inteira em cima disso (o `swipe-direction` que o inventário mediu é o gesto de arrastar para
fechar).

Sem ele, um produto móvel feito com a Aurea não tem o gesto que as pessoas esperam — e a gaveta
lateral em tela de 375px cobre a página inteira, que é o comportamento que o `bottom` existe para
evitar.

---

## Capacidades achadas ao LER as células, e que não são estado · **TRIADAS, NÃO ABERTAS**

O §9 é explícito: **`N/A` nunca é gap silencioso.** Trinta e uma células do eixo `estados` foram
lidas em 27/08/2026, e dezoito saíram `N/A` — o valor da referência não era estado. Em nove
delas, porém, o valor **apontava para uma capacidade real** que a Aurea não tem. Elas não viram
cartão aqui porque não são o que a célula media; ficam nesta lista, medidas e nomeadas, para
entrar na fila pela porta certa.

| capacidade | onde apareceu | o que a referência faz | a Aurea hoje |
|---|---|---|---|
| **marcas de escala** no slider | `slider·estados` (`interval`) | shark marca cada N passos | `Range` é `<input type="range">` puro. O HTML resolve com `list=` + `<datalist>` — **capacidade nativa não exposta** |
| **colapso parcial** (espiada) | `collapsible·estados` (`partial-collapse`) | shark colapsa até uma altura em vez de zero | só colapsa a zero |
| **diálogo aninhado** | `dialog·estados` (`nested`, `has-nested`) | shark recua o de trás quando abre outro na frente | nada — e o atributo é do `vaul`, não da shark |
| **reordenar árvore por arraste** | `tree·estados` (`drag-target`) | reui marca o alvo do arraste | nada |
| **filtrar árvore por busca** | `tree·estados` (`search-match`) | reui realça o nó que casa | nada |
| **tipo de nó** (pasta/folha) | `tree·estados` (`folder`) | reui distingue no desenho | nada |
| **capa de pré-visualização** | `file-input·estados` (`cover`) | shark mostra a imagem enviada em capa | lista de nomes |
| **eixo de espaçamento** do grupo | `toggle-group·estados` (`spacing`) | juntos-como-segmento **ou** separados por gap | só o segmentado |
| **paginação numerada** | `pagination·estados` | páginas clicáveis com a corrente marcada | virou o `G-STATE-06`, que é gap |

As oito primeiras **não estão abertas como gap** por decisão de escopo: são capacidades novas, e
a `PLANO-1.0.md` governa a fila até a `1.0`. Entram por lá, não por aqui — mas agora existem
escritas, com a medida atrás, que é o que o §9 exige.

---

## G-API-01 — o enum de variante é o produto cartesiano de dois eixos, achatado

| | |
|---|---|
| **Capacidade** | expressar **aparência × tom** como eixos independentes (§23, §132) |
| **Família** | Foundations · Actions |
| **Tipo** | `architecture` |
| **Paridade** | `AUREA_INFERIOR` — a MUI separa `variant` de `color`; medido: **9 componentes dela têm os dois eixos**, e o vocabulário de tom inclui `success`, `warning` e `info` |
| **Aurea hoje** | `ButtonVariant` é **um** enum com 13 valores que são, na verdade, aparência (`solid`/`outline`/`ghost`/`link`/`nav`) × tom (`neutral`/`brand`/`danger`) |
| **O que o `DIRECTION.md` já diz** | o §5 declara a direção há tempos: *"Eixos de variante (não inventar solto): Appearance (solid/subtle/outline/ghost/link/plain) · Tone (neutral/brand/info/success/warning/danger)"*. **A direção declarada e o código divergem** |

**As três evidências de que o modelo achatado não escala, medidas e não opinadas:**

1. **Células vazias na matriz.** O tom de marca existia em `solid` (`primary`) e em `link`
   (`link-primary`), e **não existia** em `outline` nem em `ghost`. A Aurea não tinha o botão de
   ação secundária mais comum do mercado — contorno na cor da marca. *(Fechado em 21/08 com
   `primary-outline` e `primary-ghost`, que eram deriváveis; a matriz virou teste.)*
2. **A ordem do nome é inconsistente dentro do mesmo enum.** `danger-outline` é tom-aparência;
   `link-danger` é aparência-tom. Duas convenções, uma lista. Não há como acrescentar sem
   escolher arbitrariamente.
3. **Um tom novo custa uma aparência inteira.** Acrescentar `success` — que o §16 pede em toda
   família e que a MUI tem — significa acrescentar `success`, `success-outline`, `success-ghost`,
   `link-success`. Quatro valores para um conceito. Com `info` e `warning` juntos, o enum vai a 25.

É o teste do §110 (*"se a Aurea tiver 10× mais componentes, a arquitetura aguenta?"*) e a resposta
medida é **não**.

| | |
|---|---|
| **Custo de mudar** | **zero em pixel, zero em API velha** — a saída do Victor em 21/08 foi *aditiva*, e a estimativa de "alto" acima era do caminho de substituição, que não foi o escolhido |
| **Prioridade** | 2 — não é urgente, é estrutural. O §45 permite quebrar antes da `1.0`, e o §44 diz para não preservar limitação só porque existe |
| **Status** | **FECHADO** em 21/08/2026, aditivo, por autorização do Victor |

**Como fechou.** `variant` continua existindo com os treze valores e virou **atalho**; ao lado
dela entraram `appearance` (`solid`/`outline`/`ghost`/`link`/`nav`) e `tone`
(`neutral`/`brand`/`danger`/`success`/`info`). Um dicionário só, em `actions.tsx`, faz os dois
caminhos convergirem — e quando o par já tinha classe própria, é **essa** classe que sai. Por
isso nenhuma baseline se mexeu: `appearance="outline" tone="danger"` emite `.btn-danger-outline`,
caractere por caractere o DOM de antes. As três evidências acima ficam: a nº 1 já estava fechada,
a nº 2 (ordem inconsistente do nome) deixa de importar porque o nome deixou de ser a API, e a
nº 3 (um tom custa quatro nomes) passou a custar **três regras de CSS**.

**O que o fechamento comprou de fato:** nove células novas — `success` e `info` em `outline`,
`ghost`, `link` e `nav`, mais `brand`/`danger` em `nav`, que nenhum nome antigo alcançava.

**Três coisas que só apareceram porque a matriz virou teste**, e nenhuma delas foi deduzida:

1. `nav` × `brand` e `nav` × `danger` **não existiam** e ninguém tinha notado: `nav` era a única
   aparência sem par antigo para esses dois tons.
2. O bloco de tom, escrito ao lado das variantes de `link`, **perdia a cascata para `.btn-nav`**
   por ordem de origem — mesma especificidade, e `.btn-nav` vem depois. `nav`+success saía
   cinza. Quem achou foi o navegador; o teste da matriz aprovava, porque perguntava se a regra
   existia e não se ela **ganhava**. O detector foi reescrito para simular a cascata e reprova os
   quatro casos quando o bloco volta para o lugar errado (provado contra o defeito).
3. O gate que confere eixo do TypeScript contra a ficha só olhava `variants` e `sizes`. O eixo
   `tone` ia entrar **sem lugar na ficha** — o mesmo defeito que o gate existe para pegar,
   escapando por ter outro nome. Ao generalizar ("quem mais tem esse problema?"), apareceram
   **oito** eixos não declarados que já estavam publicados: `side` em quatro sobreposições,
   `direction` do provider, `kind` do MediaPlayer, `titleAs` do EmptyState. Todos declarados
   agora, em `axes`, e o catálogo passou a mostrá-los.

---

## G-TOKEN-01 — não existia par cor+texto para tom preenchido além de marca, neutro e destrutivo

| | |
|---|---|
| **Capacidade** | botão/superfície **preenchida** em tom de sucesso, aviso e informação |
| **Família** | Foundations · Tokens |
| **Tipo** | `missing-token` |
| **Paridade** | era `AUREA_INFERIOR` — MUI, HeroUI e Untitled UI têm preenchido em todos os tons |
| **Status** | **FECHADO** em 21/08/2026, por decisão do Victor |

**A decisão, na palavra dele:** *"Não considero aceitável uma API anunciar `tone="success"
appearance="solid"` e entregar visualmente um outline por limitação interna nossa. Isso é dívida
de infraestrutura, então corrija a infraestrutura."* E o princípio que fica: *"tokens de marca e
tokens semânticos podem coincidir por acaso somente quando isso não destrói significado."*

**O que entrou:** nove tokens por tema — `--success`, `--success-foreground`, `--success-hover` e
os irmãos de `info` e `warning`. Mesma estrutura do `--destructive`: no escuro, preenchimento
claro com texto escuro tingido do próprio matiz; no claro, preenchimento fundo com texto branco.
`success` e `info` **adotaram a cor que já estava no ar** (o antigo `--success-400`/`--info-400`
por tema), então nada que já usava esses tons mudou de pixel; o que é novo é o par de texto e o
realce. O core deixou de usar degrau de rampa: `.badge-*`, `.status-*`, `.alert-*`, `.banner-*` e
o `LogStream` passaram todos ao token semântico.

**O que sumiu:** o rebaixamento silencioso. `appearance="solid"` é preenchido em **todos** os seis
tons, e `outline` voltou a ser uma aparência que se pede — nunca o que sobra quando a paleta não
dá conta. A lista `AUSENTES` do teste continua existindo, **vazia**, porque é o lugar onde uma
ausência teria de ser declarada com motivo; e a matriz passou a cobrar que `solid` tenha fundo de
verdade, o que é o que pega a volta da degradação (provado: com o rebaixamento de volta, três
células reprovam).

---

## G-TOKEN-02 — `warning` era a cor da marca, e por isso não podia ser tom

| | |
|---|---|
| **Capacidade** | tom de **aviso** em ação |
| **Família** | Foundations · Tokens |
| **Tipo** | `missing-token` |
| **Paridade** | era `AUREA_INFERIOR` — toda referência do §3 tem botão de aviso |
| **Status** | **FECHADO** em 21/08/2026, por decisão do Victor |

**A medição que abriu o cartão:** no tema escuro `--warning-400` era literalmente
`var(--brand-yellow)`, e `--primary` também. A distância perceptual entre "aviso" e "marca" era
**dE = 0.001**. No tema claro, contra a marca-como-texto, era **0.044**. Para calibrar: os pares
de tom que a Aurea já trata como cores diferentes ficam em **0.19–0.20**.

**Como o valor foi escolhido — por otimização, não por gosto.** Três tentativas foram medidas e
descartadas antes da que ficou, e cada descarte ensinou o critério seguinte:

1. *Maximizar a distância da marca* → o ótimo é um cinza-marrom (`#88755f`). Distância sozinha
   destrói a semântica: um aviso sem croma não avisa.
2. *Maximizar o croma entre os que já se distinguem* → foi para 55° de matiz, laranja forte, e
   **encostou no destrutivo**. Afastar de um vizinho aproxima do outro.
3. *Maximizar a menor das duas distâncias*, sem mais nada → desceu a luminosidade para fora da
   faixa que os outros tons ocupam, e o aviso ficaria escuro demais no tema escuro.

O critério final tem as três lições dentro: **maximizar a MENOR distância até a marca e até o
destrutivo**, restrito a (a) AA como texto sobre o fundo do tema, (b) dentro do gamute sRGB — o
que limita o tema claro, onde amarelos escuros têm croma máximo de ~0.12 — e (c) na faixa de
luminosidade que `success`, `info` e `danger` já ocupam (escuro 0.704–0.807; claro 0.438–0.466).

| | escuro | claro |
|---|---|---|
| valor | `oklch(0.72 0.175 60)` | `oklch(0.535 0.131 61)` |
| dE até a marca | **0.104** (era 0.001) | **0.119** (era 0.044) |
| dE até o destrutivo | 0.115 | 0.121 |
| contraste no fundo | 7.62:1 | 4.85:1 |

`--brand-yellow` e `--primary` **não foram tocados**. A família de aviso inteira acompanhou
(`-500`, `-800`, `-bg`), senão a borda âmbar do Alert ficaria sobre uma superfície amarela.

**A trava permanente:** o teste que antes GUARDAVA a colisão (afirmava que `--warning-400` era
alias da marca) agora guarda a separação, e guarda **por medição** — ele recalcula a distância em
oklab a partir do CSS gerado e reprova abaixo de `0.08`. Um alias novo, ou um valor que volte a
se aproximar, reprova. Provado contra o defeito.

---

## G-A11Y-02 — a marca como texto reprovava AA no tema claro, em componente publicado

| | |
|---|---|
| **Capacidade** | — (defeito, não capacidade) |
| **Família** | Foundations · Actions |
| **Tipo** | `a11y` |
| **Prioridade** | 1 — estava publicado |
| **Status** | **FECHADO** em 21/08/2026, junto com o `G-TOKEN-01` |

Não veio de referência nenhuma: apareceu na varredura de contraste feita para **verificar os tons
novos**. Das 30 células da matriz nos dois temas, três reprovaram — e nenhuma das três era minha.

`.btn-primary-outline` e `.btn-primary-ghost` pintavam o rótulo com `var(--primary)` cru. No tema
claro isso é amarelo-marca sobre fundo quase branco: **1.73:1**, contra os 4.5:1 que o SC 1.4.3
exige. A borda do outline, que o SC 1.4.11 cobra a 3:1, estava no mesmo número. O
`.btn-link-primary`, três linhas abaixo no mesmo arquivo, **já tinha** a correção de tema claro; as
duas irmãs nasceram sem ela, na sessão que preencheu as células vazias do tom de marca.

É a assinatura do §21 outra vez: a correção existia, e não foi aplicada a quem mais tinha o
problema.

**A trava:** `tests/visual/tone-contrast.spec.ts` — a matriz inteira, nos dois temas, no navegador,
cobrando 4.5:1 no rótulo e 3:1 na borda. Nenhum gate do projeto olhava para contraste até hoje.
Provado contra o defeito: removida a correção, ele reprova com o `1.73:1` exato.

---

## G-GATE-01 — o gate visual não pega mudança de cor

| | |
|---|---|
| **Capacidade** | — (defeito do próprio controle) |
| **Família** | Infra · Testes |
| **Tipo** | `gate-weakness` |
| **Prioridade** | 2 |
| **Status** | `ABERTO` — precisa de regeração de baseline pela CI, então **não fecha daqui** |

O `playwright.config.ts` declarava, por escrito, que o gate era "estrito (`maxDiffPixels: 0`)".
Não é. O `threshold` do Playwright — a tolerância de cor **por pixel**, em YIQ — segue no padrão
`0.2`. Os dois juntos significam *"nenhum pixel pode diferir mais de 20%"*, e não *"nenhum pixel
pode diferir"*.

**Como apareceu, e por que não foi por dedução:** a cor de aviso mudou de amarelo para âmbar; a
captura de `#agentes` no tema escuro ficou com **hash diferente** da baseline; e o teste **passou**.
No tema claro a mesma mudança reprovou, porque ali o salto de luminância é maior. Um gate que pega
uma cor e não pega a outra não é gate de cor.

**Por que não fechei:** ligar `threshold: 0` foi medido — reprova **15 das 26** seções dos docs,
várias em páginas que esta sessão não tocou. Daqui não dá para separar regressão de deriva de
baseline, e regravar `-linux.png` nesta máquina é exatamente o que o commit `042b677` mediu e
proibiu. O caminho é um commit só: regerar as baselines pelo `workflow_dispatch` e ligar o
`threshold` junto.

---

## G-AXIS-01 — três eixos que existiam na referência e não no componente equivalente daqui

| | |
|---|---|
| **Capacidade** | orientação do `Field`, alinhamento em bloco do `InputGroupAddon`, orientação do `ButtonGroup` |
| **Família** | Forms · Actions |
| **Tipo** | `missing-axis` |
| **Fonte** | inventário do §9 da `shadcn-ui` ([09](09-INVENTARIO-SHADCN.md) §5), com a `kibo` apontando o mesmo lugar |
| **Prioridade** | 2 |
| **Status** | **FECHADO** em 21/08/2026 |

Não era componente faltando: era eixo faltando em componente que **já existe aqui**. Os três foram
conferidos no fonte da Aurea antes de virar cartão, e não por nome.

| Componente | Antes | Agora |
|---|---|---|
| `Field` | nenhum eixo | `orientation: vertical · horizontal` |
| `InputGroupAddon` | `align: start · end` | `align: inline-start · inline-end · block-start · block-end` |
| `ButtonGroup` | nenhum eixo | `orientation: horizontal · vertical` |

**A renomeação, e por que ela entrou junto.** `start`/`end` queriam dizer, em segredo,
`inline-start`/`inline-end`. Mantê-los ao lado de `block-start`/`block-end` produziria o conjunto
`start | end | block-start | block-end`, em que dois valores declaram o eixo e dois o escondem — a
mesma doença do `ButtonVariant` que o `G-API-01` acabou de curar. A Aurea escreve propriedade
lógica em todo o CSS; o nome do valor acompanha. Quebra registrada no `CHANGELOG.md`, e o
consumidor que ela pegou foi um **teste** — que é para isso que ele existe.

**Três decisões de desenho, e as três saíram de medição:**

1. **`field-horizontal` é GRADE, não linha.** Em `flex-direction:row` a mensagem de erro viraria
   uma terceira coluna ao lado do controle. Ela fala do valor, então cai na coluna 2, embaixo do
   controle. A largura da coluna do rótulo é token (`--field-label-width`) para o consumidor
   alinhar várias linhas entre si.
2. **A quebra de linha do `InputGroup` é CONDICIONAL.** Ligar `flex-wrap` no grupo inteiro mudaria
   o comportamento de todo grupo que já existe: o que hoje transborda passaria a quebrar. Só grupo
   com adorno em bloco quebra.
3. **O raio muda quando há adorno em bloco**, e isso não é decisão nova — é a regra da Aurea
   aplicada ao caso certo. Campo em linha é pílula; **painel é 22px**. Um grupo com adorno em
   bloco deixou de ser uma linha. Visto no navegador: com 999px numa caixa alta as laterais viram
   semicírculos do tamanho da caixa e o texto do campo **colide com a curva**. Não é gosto, é
   colisão de conteúdo — e foi olhar que achou, depois de eu ter decidido não resolver por dedução.

Quatro controles, os quatro provados contra o defeito. E uma medição registrada em vez de
perseguida: a caixa do primeiro botão do adorno cai a 13px da borda e o texto do campo a 15px —
fechar dois pixels exigiria um padding fora da escala de espaço, ou seja, px cru.

**O que ficou de fora, e é medido:** o terceiro valor da `shadcn`, `responsive`. Lá ele depende de
uma **container query com contêiner nomeado** (`@md/field-group`), declarado por um componente
`FieldGroup` que a Aurea não tem. Um elemento não consulta o próprio tamanho, então `responsive`
sem esse componente seria media query de viewport — que responde a pergunta errada, porque quem
aperta o campo é o cartão em volta dele, não a janela. Ver `G-AXIS-02`.

---

## G-AXIS-02 — falta o `FieldGroup`, e sem ele não há campo responsivo

| | |
|---|---|
| **Capacidade** | agrupar campos e dar a eles um contexto de tamanho |
| **Família** | Forms |
| **Tipo** | `missing-component` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | apareceu ao fechar o `G-AXIS-01` |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

A `shadcn` tem `FieldGroup`, e é ele que declara o contêiner nomeado que o `orientation:
responsive` do `Field` consulta. Sem ele, "responsivo" só pode significar viewport — e a pergunta
certa é o **espaço disponível para o campo**, que é o cartão, a coluna ou o painel em volta.

Vale mais que o `responsive`: um grupo de campos é o que dá ao formulário um espaçamento próprio,
uma legenda (`<fieldset>`/`<legend>`) e um contexto de erro. A Aurea tem `Field` solto e nada que
os junte.

---

## G-COMP-01 — a Aurea tem peças e quase não tem composições prontas · **FECHADO**

| | |
|---|---|
| **Capacidade** | composição pronta para copiar (bloco) por componente |
| **Família** | Documentação · Composição |
| **Tipo** | `coverage` |
| **Paridade** | `AUREA_INFERIOR` — medido, não estimado |
| **Fonte** | inventário do §9 da `shadcn-ui` ([09](09-INVENTARIO-SHADCN.md) §2) |
| **Prioridade** | 2 |
| **Status** | **FECHADO** em 22/08/2026 |

O `registry.json` do shadcn é o primeiro manifesto legível por máquina do quadro, e por isso é a
primeira fonte que permite medir composição sem inferir:

| | kibo | reui | shark | shadcn | Aurea |
|---|---:|---:|---:|---:|---:|
| componentes | 53 | 22 | 95 | 54 | **88** |
| blocos | — | — | 2 | **97** | **8** |
| composições / patterns | **1.101** | 258 | 801 | 238 | **76** |
| composições por componente | **20,8** | 11,7 | 8,4 | 4,4 | **0,86** |

**Quatro** fontes independentes, medidas por quatro métodos diferentes — manifesto declarado,
árvore de diretório, barril gerado de previews e pasta por componente — chegam à mesma conclusão. A
Aurea é a que tem mais peça e a que tem menos composição, por uma ordem de grandeza.

**A Aurea tem MAIS peça e vinte vezes MENOS composição.** O §110 pergunta se a arquitetura aguenta
10× mais componentes; este número diz que o gargalo não está aí — está em quem monta a tela. É
coerente com o que o §11 avisa: *documentação traz o que o código não mostra*.

Não é para copiar os 97. É para decidir a razão-alvo e trabalhar contra ela, em vez de acrescentar
a 89ª peça.

### Como fechou

**A média escondia o formato.** O 0,86 sugere "todo componente com quase uma composição"; a
distribuição dizia outra coisa: **77 dos 90 componentes tinham ZERO**, e 13 carregavam as 76.
Na kibo e na reui nenhum componente está em zero; na shark, sete estão (quatro deles de infra).
Então o alvo não é "subir a média" — é **nenhum componente em zero**, que é uma promessa que se
verifica em vez de se estimar.

A conta de quem precisa de composição PRÓPRIA saiu do `layer` da ficha, não de opinião:
39 `Component` + 19 `Composite` + 3 `Shell` = **61**. Os 29 restantes (`Primitive`, `Foundation`,
hooks) existem dentro da composição dos outros — mas isso é afirmação, e afirmação se mede: a
varredura das páginas geradas mostrou `Icon` em 48.509 ocorrências, `Label` em 15.832, `Grid` em
421, `InputGroupAddon` em 33, `ToolbarSeparator` em 12, `ToolbarGroup` em 8 e `Stack` em 6 — e
**`AspectRatio` em 1, `Cluster` em 1 e `Separator` em 2, todas na página do próprio componente**.
Três primitivos que ninguém compunha; buraco, não cobertura. Ganharam arquivo próprio.

| | antes | depois |
|---|---:|---:|
| composições | 76 | **195** |
| por componente | 0,86 | **2,17** |
| componentes em ZERO | **77** | **13** |

Os 13 restantes são **6 hooks e o `AureaProvider`** — que não emitem marcação própria, e cuja
"composição" seria um trecho de código sem preview — mais **6 primitivos medidos dentro de outros**
(`Icon`, `Label`, `Grid`, `InputGroupAddon`, `ToolbarGroup`, `ToolbarSeparator`, `Stack`). É `N/A`
declarado, com o número atrás, e não silêncio.

### O que escrever as composições descobriu

Compor de verdade é o que revela o que a ficha não conta. Três defeitos saíram daqui, todos do
mesmo tipo — **a peça existe, e o que ela entrega não é o que ela anuncia**:

- **`ChartLegend` com `items`** — uma prop que não existe. O pattern anunciava
  `<ChartLegend items={[…]} />`; o componente recebe `LegendProps` do motor e lê o `payload` das
  séries. Fora de um gráfico ele renderiza **0 byte** (medido), então o preview saía vazio e caía
  no texto de portal, que não era o caso. Corrigido, e a escada de `prerender` do starter passou a
  servir pattern também.
- **`KPI` com `trend={{value, direction}}`** — outra prop inventada, esta derrubou o build. O
  `trend` é `ReactNode`. O gerador agora nomeia a demo que estourou: o traço do React só dizia
  "Objects are not valid as a React child" em 296 páginas.
- **`note` descartado** — 14 entradas de pattern explicavam por que o preview mostra só o
  disparador, e `patternPage` jogava o campo fora. O starter já resolvia isso; o pattern não.

E um quarto, grande o bastante para ter cartão próprio: **`G-CSS-01`**.

---

## G-CAP-23 — `attachment`: o arquivo anexado como peça, com estado próprio

| | |
|---|---|
| **Capacidade** | cartão de arquivo anexado, com `idle`/`error` e ação de remover |
| **Família** | Forms · Communication |
| **Tipo** | `missing-component` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | inventário do §9 da `shadcn-ui` |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

Conferido contra o `FileInput` da Aurea, cujo `summary` é *"Upload control with progress and
validation"*: aquele é o **controle de envio**; este é o **arquivo já anexado**, renderizado como
peça, com `data-state=idle|error`, 8 slots e eixos de `size` e `orientation`. São coisas
diferentes, e a segunda aparece em toda caixa de composição de mensagem — inclusive na da Aurea,
que hoje não tem onde apoiá-la.

---

## G-CAP-24 — trocar o tema (e a densidade) era ad hoc, e o React não tinha nenhum dos dois

| | |
|---|---|
| **Capacidade** | alternar tema e densidade pela biblioteca |
| **Família** | System |
| **Tipo** | `missing-component` + `divergência` |
| **Fonte** | inventário do §9 da `kibo-ui` ([10](10-INVENTARIO-KIBO.md) §5) |
| **Prioridade** | 1 |
| **Status** | **FECHADO** em 21/08/2026 |

**O cartão cresceu ao ser fechado.** Ele nasceu sobre o tema; ao implementar apareceu que
`window.Aurea.setDensity` existia desde sempre e o React também não tinha equivalente — e
densidade é identidade declarada no `CLAUDE.md`. Ninguém tinha notado. O estado era:

| Onde | Tema | Densidade |
|---|---|---|
| `packages/core/src/aurea.js` | `setTheme`, `toggleTheme` | `setDensity` |
| `apps/catalog` | botão, CSS e `espelhaTema()` próprios | — |
| `apps/docs/index.html` | função **separada**, outro id, outra variante, outro ARIA | — |
| `packages/react` | **nada** | **nada** |

**Como fechou.** O `AureaProvider` passou a ser o dono dos dois eixos, com `theme`/`defaultTheme`/
`onThemeChange` e `density`/`defaultDensity`/`onDensityChange` — controlado e não-controlado, a
mesma convenção do `Toggle` e do `ToggleGroup`. Os hooks `useTheme()` e `useDensity()` leem e
escrevem; o `toggleTheme` mora no provider porque **a inversão é a conta**, e foi deixá-la para o
consumidor que produziu duas implementações divergentes.

**A decisão que o teste guarda:** sem `theme` nem `defaultTheme`, o provider **adota** o que o
`<html>` já traz em vez de sobrescrever. O `data-theme` no markup existe para não haver piscada de
tema no carregamento, e um provider que impusesse o próprio default na primeira pintura
reintroduziria exatamente a piscada que o atributo evita. Provado contra o defeito.

**E o gate que impede a volta:** o **check 28** confronta cada capacidade de `window.Aurea` com uma
contraparte declarada no React. Foi construído porque este cartão, o `G-CAP-25` e o `G-A11Y-03` são
o mesmo defeito visto três vezes — comportamento que existe em vanilla e não em React — e nenhum
gate procurava por ele. Provado contra dois defeitos: capacidade nova sem contraparte, e
contraparte renomeada.

---

## G-CAP-25 — o `TableOfContents` anuncia que marca a seção em vista, e não marca

| | |
|---|---|
| **Capacidade** | índice que acompanha a rolagem (scroll-spy) |
| **Família** | Navigation |
| **Tipo** | `contrato-quebrado` + `divergência` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | inventário do §9 da `reui` ([11](11-INVENTARIO-REUI.md) §6) |
| **Prioridade** | 1 — **a ficha prometia o que o componente não fazia** |
| **Status** | **FECHADO** em 21/08/2026 |

Apareceu ao verificar se o `scrollspy` do `reui` (242 linhas, **zero dependências**) era gap de
verdade. É, e o gap não era a peça — era o contrato.

A ficha do `TableOfContents` diz *"marks the section in view"*. O componente React recebe `current`
por prop e **não observa nada**; e o `build-catalog.mjs` nunca passa `current` em nenhuma das cinco
chamadas.

| Onde | O quê |
|---|---|
| `packages/core/src/aurea.js` | `IntersectionObserver` que marca a seção em vista, em vanilla |
| `apps/docs/index.html` | **outro** `IntersectionObserver`, com `rootMargin` diferente (`-20% 0px -72% 0px`), mexendo em `.active` |
| `packages/react` | presentacional: `current` entra pronto, e ninguém o calcula |

O comportamento só existe nas páginas que carregam o `aurea.js` por fora. **Quem instala o pacote
React sozinho recebe um índice que nunca marca nada** — e a ficha diz que marca.

É a mesma família de três achados já pagos: o `G-FORM-01` (cinco fichas anunciavam `sizes` que não
existia), o `G-CAP-24` (tema resolvido em três lugares, nenhum em React) e este.

**Como fechou.** O componente observa quando ninguém passa `current`; `current` continua existindo
e continua vencendo. A régua **não é nova**: é a mesma do `tocSpy` do `aurea.js`, faixa estreita no
alto (`rootMargin: "0px 0px -75% 0px"`), e vence o **último** que a cruza — seção e subseção cruzam
juntas, e a específica é a que interessa. Reimplementar com outra régua criaria a terceira versão
divergente do mesmo comportamento, que é o defeito que este cartão existia para encerrar.

**A parte que quase virou regressão.** Os dois observadores — o do React e o do `aurea.js` —
escreveriam o mesmo `aria-current` com faixas diferentes numa página que tenha os dois. A
coordenação é o atributo `data-toc-spy="react"`, e ele sai do **efeito**, nunca do render: o
catálogo é gerado **estático** a partir deste mesmo componente, e marcar no render poria o atributo
nas 202 páginas — onde não há React vivo para observar, e onde o `tocSpy` é quem de fato marca. O
vanilla também se desconecta sozinho se o React assumir depois dele, porque a ordem entre
`DOMContentLoaded` e hidratação não é controlável.

Três controles, os três provados contra o defeito: voltar o componente a presentacional reprova 3
testes; mover a marca para o render reprova o teste de renderização estática; engolir o `ref` do
consumidor reprova o teste do `ref`.

**O que este cartão deixa em aberto, e é maior que ele:** o remédio geral. O check 14 confronta
EIXO da ficha com o tipo, e o check 28 confronta o runtime vanilla com o React — mas **ninguém
confronta comportamento prometido no `summary` com o que o componente faz**. Esta foi a terceira
ocorrência da família; nada garante que foi a última.

---

## G-A11Y-03 — faltava o link de pular conteúdo, e era falha de nível A

| | |
|---|---|
| **Capacidade** | saltar a navegação repetida (WCAG 2.2 SC 2.4.1, *Bypass Blocks*) |
| **Família** | Navigation · Shell |
| **Tipo** | `a11y` |
| **Fonte** | inventário do §9 da `shark-ui` ([12](12-INVENTARIO-SHARK.md) §3) |
| **Prioridade** | 1 |
| **Status** | **FECHADO** em 21/08/2026 |

O estado medido: existia à mão em `apps/docs/index.html`, e em lugar nenhum do core, do `AppShell`
ou das 200 páginas do catálogo. A página de demonstração era acessível; o componente que o
consumidor instala não era.

**Fechou no `AppShell`**, e não como componente solto — ele já cria o `<main>`, já tem o padrão de
id fixo, e é o único que conhece a ordem topo → lateral → conteúdo. Um `SkipLink` avulso repetiria
o erro do tema: peça nova sem dono. Como o catálogo é montado com o `AppShell`, as **202** páginas
ganharam o link no mesmo commit.

**O que o teste cobra, e não é a existência:**

1. que o link seja o **primeiro tabulável** — o critério não pede que ele exista, pede que dê para
   chegar nele antes da navegação; um link correto no fim do documento não bypassa nada;
2. que o `href` aponte para um elemento que **existe** (href para id inexistente é o defeito
   clássico aqui), e que esse elemento seja o `<main>`;
3. que o alvo tenha `tabindex="-1"` — sem isso o foco não vai junto em alguns motores, e o leitor
   de tela continua lendo do topo.

Verificado no navegador além do teste: primeiro `Tab` foca o link, ele desliza de
`translateY(-160%)` para a posição visível, `Enter` move o hash **e o foco** para
`MAIN#aurea-shell-main`, e o `Tab` seguinte cai no primeiro link do conteúdo — a navegação foi
realmente pulada.

---

## G-CAP-26 — o `MediaPlayer` não deixa compor a barra de controles

| | |
|---|---|
| **Capacidade** | montar a barra de controles do player |
| **Família** | Media |
| **Tipo** | `arquitetura` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | inventário do §9 do `media-chrome` ([13](13-INVENTARIO-MEDIA-CHROME.md) §2) |
| **Prioridade** | 3 |
| **Status** | `ABERTO` |

Medido: o `children` do `MediaPlayer` cai **dentro do `<video>`** (`{children}</MediaTag>`) — onde
moram `<source>` e `<track>`, não controle. A barra é montada por dentro, e o componente
destrutura quinze manipuladores de evento de mídia para conseguir. Trocar a ordem dos botões,
remover o de volume ou acrescentar um de velocidade **não é possível pela API**.

O `media-chrome` resolve o mesmo problema com 34 elementos independentes e um protocolo: qualquer
elemento, em qualquer profundidade, emite um evento de **pedido** que borbulha até o controlador, e
o controlador espalha o **estado** de volta por atributo. 26 eventos, 44 atributos.

Não é defeito — é uma escolha coerente com "um player que funciona sem configuração", e a Aurea
tem `MediaPlayerShell` justamente para quem quer montar à mão. O que está errado é o **contrato**:
a ficha não diz que a barra é fechada, e quem lê `MediaPlayer` + `children` supõe o contrário.

**Fechar barato:** declarar na ficha que a barra é fixa e que compor é papel do `MediaPlayerShell`.
**Fechar direito:** um eixo de `controls` (lista ordenada do que mostrar) — sem inventar protocolo
de evento, que seria trocar a arquitetura da Aurea inteira por causa de um componente.

---

## G-I18N-01 — o dicionário de mídia cobre um terço do necessário

| | |
|---|---|
| **Capacidade** | rótulo traduzido para o domínio de mídia |
| **Família** | System · Media |
| **Tipo** | `coverage` |
| **Paridade** | `AUREA_INFERIOR` |
| **Fonte** | inventário do §9 do `media-chrome` ([13](13-INVENTARIO-MEDIA-CHROME.md) §3) |
| **Prioridade** | 2 |
| **Status** | `ABERTO` |

| | Aurea | media-chrome |
|---|---:|---:|
| Idiomas | 2 (`en` embutido + `ptBR`) | **7** |
| Chaves totais | 69 | 45 |
| Chaves **de mídia** | **13** | **45** |

A Aurea tem mais chaves no total e **um terço** das de mídia. O que falta é o conjunto que só
aparece quando algo dá errado — erro de rede, de decodificação, de formato não suportado — mais
faixa de áudio, qualidade, cast, AirPlay e PiP. É a parte que quase todo sistema esquece, e é
justamente quando o rótulo mais importa.

O `media-chrome` também mostra uma decisão de forma que vale registrar: o dicionário é **por frase
em inglês**, não por identificador (`'A network error caused the media download to fail.'`), o que
faz a chave ausente degradar para um texto legível em vez de um identificador cru. A Aurea usa
identificador; trocar seria quebra grande, mas o comportamento na falta de chave merece decisão.

---

## G-BUG-01 — o vão de 40px que aparecia sem ícone

| | |
|---|---|
| **Capacidade** | — (defeito, não capacidade) |
| **Família** | Forms |
| **Tipo** | `missing-behavior` |
| **Paridade** | `N/A` |
| **Prioridade** | 1 — estava publicado |
| **Status** | **FECHADO** em 21/08/2026, junto com o `G-CAP-11` |

Não veio de referência nenhuma: apareceu ao consolidar o `G-CAP-11`, lendo o terceiro consumidor
do mecanismo local.

O `.input-wrap` fixava `padding-inline-start: 40px` no campo, **incondicionalmente**, para abrir
espaço ao glifo. Só que o `MessageComposer` tem o ícone **opcional** — e uma receita do catálogo
(`Message the team…`) o usa **sem ícone**. Resultado publicado: 40px de vão antes do texto, sem
nada dentro.

É a assinatura do defeito que o §21 descreve. Três lugares resolviam a mesma coisa por conta
própria (`SearchField`, `PasswordField`, `MessageComposer`), e o terceiro herdou uma regra escrita
para o primeiro.

**Como o `InputGroup` mata a classe do defeito, e não só a instância:** no modelo de flex o adorno
é um item, não um glifo posicionado por cima. Sem adorno não há item, e sem item não há espaço —
a distância deixa de ser um número escrito à mão e passa a ser somada pelo layout. A conta bate
com a de antes por construção: 12px + glifo + 12px são os mesmos 40px.

**Efeito colateral medido:** a catraca de px cru **caiu de 123 para 121**, porque o `12px` do
glifo e o `40px` do vão eram dois dos valores crus históricos. Baseline atualizada para travar o
ganho, que é o que o próprio gate pede quando a contagem cai.

---

## G-FORM-03 — os controles de seleção fora da escala e fora da densidade · **FECHADO**

| | |
|---|---|
| **Capacidade** | `Checkbox`, `Radio` e `Switch` em `sm`/`md`/`lg`, e acompanhando a densidade |
| **Família** | Forms |
| **Tipo** | `missing-variant` + `missing-behavior` |
| **Paridade** | era `AUREA_INFERIOR` |
| **Prioridade** | 1 |
| **Status** | **FECHADO** em 21/08/2026 |

**Como apareceu.** Cruzando a escala de tamanho da [`untitled-ui`](08-INVENTARIO-UNTITLED.md) com
a nossa: ela dá `sm|md` aos três, e a Aurea não dava nada. Sete componentes nossos apareceram
nessa lista; estes três são os que estão na mesma linha de formulário que o `Input`, e por isso
foram primeiro.

**O problema era maior que a escala.** Medindo o core: a marca de seleção era `18px` **cru** e o
trilho do switch `42×24px` **cru**. Nenhum dos três acompanhava a densidade, enquanto todo o
resto da linha do formulário acompanhava — o mesmo defeito que o achado **A1** pegou no
`SegmentedControl` em 26/07/2026, num lugar em que ninguém tinha olhado.

**Como fechou sem mexer em pixel.** Metade da altura de controle dá **exatamente** os 18px de
antes em `comfortable`; 7/6 e 2/3 dão os 42×24. A captura não muda, e as outras duas densidades
passam a estar certas. O botão do switch teve de encolher junto: preso em 16px, num trilho
`compact` de 20px ele mais os dois recuos dariam 22px e vazaria.

**O que ficou de fora, e por quê:** o glifo dentro da marca — o "V" do checkbox e o ponto do
radio — continua em pixel fixo. Escalá-lo em porcentagem daria `8.1px` onde hoje há `8px`, e a
diferença de subpixel trocaria capturas por um ganho que ninguém vê. Fica anotado, não esquecido.

---

## G-AXIS-04 — nenhum eixo da Aurea é responsivo; na Radix Themes, 47 de 50 são · **`size` FECHADO**

| | |
|---|---|
| **Capacidade** | eixo que aceita valor por breakpoint (`size={{initial:"1", md:"3"}}`) |
| **Família** | API · Layout |
| **Tipo** | `missing-capability` |
| **Paridade** | `AUREA_INFERIOR` — medido por três caminhos |
| **Fonte** | inventário do §9 da `@radix-ui/themes` 3.3.0 ([`16`](16-INVENTARIO-RADIX-THEMES.md)) |
| **Prioridade** | 3 |
| **Status** | `size` **FECHADO** em 22/08/2026 — **18 de 18** · `orientation` (0/8) e `align` (0/1) seguem abertos |
| **Decisão** | Victor, 22/08/2026: os **dois** mecanismos, explícitos na API — ver [`17`](17-G-AXIS-04-ARQUITETURA.md) |

| | Radix Themes | Aurea |
|---|---:|---:|
| componentes | 50 | 90 |
| com pelo menos um eixo responsivo | **47** | **0** |

A Aurea tem zero, e isso foi medido por três caminhos independentes porque um número desses
merece: **0** de 90 fichas mencionam `responsive`; **0** ocorrências de objeto de breakpoint no
fonte React; **0** props `size`/`orientation` no `api-surface.json` que não sejam união literal.

É um **grau de liberdade inteiro** que o consumidor de lá tem e o daqui não: ajustar a escala por
largura sem escrever CSS nem duplicar o componente.

### Não é o `G-AXIS-02`, e a diferença é o §15

O `G-AXIS-02` é sobre o `responsive` do `Field`, que na referência depende de uma **container
query com contêiner nomeado** — reage ao tamanho do **container**. Este reage ao tamanho da
**janela**, por prop. Duas capacidades diferentes com o mesmo nome, que é precisamente o que o
§15 manda não confundir. Fechar um não fecha o outro.

### Por que sobe em vez de eu implementar

Não é construção pequena escondida atrás de uma decisão pequena. Aceitar
`size={{initial, sm, md, lg}}` em **toda** prop de escala muda:

- **a assinatura de todo componente com `size`** — hoje união literal, gateada pelo check 14, que
  compara `sizes` da ficha com a união do TypeScript. Um objeto quebra essa comparação, e o gate
  precisa mudar junto;
- **a pele**, que hoje emite `btn-sm`; passaria a precisar de uma classe por breakpoint, ou de
  variável CSS por breakpoint. São dois desenhos diferentes com custos diferentes;
- **a catraca de px cru** e o tamanho do CSS, que hoje são gateados.

E há uma escolha de fundo antes de tudo isso: **breakpoint de janela ou container query?** A
Radix Themes escolheu janela; a referência do `Field` escolheu container. A Aurea escreve CSS
lógico e usa container query com contêiner nomeado em outros pontos — escolher janela aqui seria
divergir da própria linha sem alguém ter decidido.

O §96 manda mostrar A/B em vez de descrever em texto, e é o que falta: as duas formas montadas
lado a lado, para o Victor ver o que cada uma custa.

---

### A decisão, e a arquitetura que saiu dela

O Victor não escolheu viewport **ou** container: escolheu os **dois**, com a API dizendo
explicitamente a que um valor responde, e mandou construir a **abstração antes dos componentes**.
A arquitetura completa está em [`17-G-AXIS-04-ARQUITETURA.md`](17-G-AXIS-04-ARQUITETURA.md); o
resumo do que ficou de pé:

- **Uma escala, dois mensuráveis.** `md` é sempre 768px; o prefixo (`vp-` / `ct-`) diz de que são
  os pixels. A escala ganhou `2xs` (360) e `xs` (480) porque contêiner é rotineiramente mais
  estreito que qualquer viewport, e o piso de 640 poria todos no mesmo balde.
- **CSS-first, zero JavaScript.** Um passo de escala é um conjunto de variáveis; o componente lê,
  a camada responsiva re-põe dentro de `@media`/`@container`. Nada observa largura, nada depende
  de hidratação, e a abstração mora no módulo **sem** `"use client"`.
- **Aditivo.** Valor simples continua emitindo `btn-sm` — byte por byte a classe de antes. Só o
  responsivo entra pela camada genérica.
- **O check 4b passou a cobrar `@container`**, que ele não cobria. Provado: `777px` reprova.

**O que quase impediu tudo:** as classes de tamanho escreviam `height:` direto, e uma regra dentro
de `@media` que setasse `--step-h` **perderia** para ela. Foi preciso fazer o valor passar pela
variável. Classe emitida e computado idênticos — medido pela geometria (10/10) e pela suíte de
pixel, cujas 8 falhas foram confirmadas **as mesmas** com e sem o refactor.

**A prova é a que o Victor especificou:** o mesmo botão, o mesmo valor, a mesma viewport, em
contêineres de 260/520/820px, medindo diferente — 4 casos × 3 motores, verdes, e provados contra
dois defeitos (sem a camada `@container`; com o contêiner **sem nome**).

---

### O fechamento do eixo `size` — e as três escalas que a medição achou

A ordem era *"para cada família, medir as propriedades próprias antes de generalizar"*, e a
medição derrubou a premissa restante: **não há uma escala, há três**, e elas nem reagem à
densidade do mesmo jeito. Documento inteiro em
[`18-G-AXIS-04-FAMILIAS.md`](18-G-AXIS-04-FAMILIAS.md).

| escala | fonte | densidade | quem |
|---|---|---|---|
| controle | `--control-h-*` | **varia** | botão, campo, marcação, identidade |
| glifo | `--icon-*` | não varia | `Icon`, `Spinner` |
| QR | rem cru | não varia | `QRCode`, sozinho |

**A medição que mudou o desenho:** `.icon` aparece dentro de um `.btn` em **323 das 327** páginas
do catálogo (`jsdom`, não estimativa). Variável CSS herda — se o glifo lesse a grandeza do
controle, todo ícone dentro de botão responsivo mudaria de tamanho sozinho, em quase toda página.
Marcação e identidade dão zero hoje, mas zero hoje não é zero amanhã.

**A solução ficou na folha, não em cada componente:** `@property --step-* { syntax:"*";
inherits:false }` corta a herança de todas as nove variáveis de passo num lugar só. `syntax:"*"`
não é detalhe — com sintaxe tipada o `@property` exige `initial-value`, o fallback de `var()`
nunca dispararia e o core perderia todos os padrões. Provado nos três motores antes de escrever
qualquer regra.

**Duas presunções a menos:** a família de marcação usa **uma** das seis variáveis que a camada
emitia (gap e corpo de texto dela são fixos, medido); e o degrau **base do `Spinner` é `sm`**, não
`md` — presumir `md` como base universal é o erro que esta atividade já cometeu duas vezes, e
agora ele é parâmetro de `peleDoEixo`.

**Nada mudou de desenho:** 28 medidas de geometria idênticas antes/depois (inclusive `icon em
btn-lg` = 20.00px dos dois lados) e **0** das 323 páginas do catálogo com marcação diferente.

**O gate está provado contra o defeito:** removido o bloco `@property` e reconstruído o `dist`, os
três motores reprovam com `(20, 16, 24)` — exatamente a previsão aritmética.

---

## G-AXIS-05 — o corpo de texto do avatar só existe num degrau · **ABERTO**

| | |
|---|---|
| **Capacidade** | escala tipográfica dentro da peça de identidade |
| **Família** | Design · Tipografia |
| **Tipo** | `assimetria` |
| **Fonte** | a medição das famílias do `G-AXIS-04` (22/08/2026) |
| **Prioridade** | 5 |
| **Status** | **ABERTO** — precisa do A/B do §96 antes de mexer |

```text
.avatar-sm   font-size: var(--text-xs)     ← existe
.avatar      (herda)
.avatar-lg   (nenhuma)                     ← não existe
```

O avatar `lg` fica com as iniciais do tamanho do `md` numa caixa **17% maior**. Parece omissão, não
decisão: a regra do `sm` existe justamente porque a caixa menor pedia texto menor, e o mesmo
raciocínio aplicado ao `lg` daria texto maior.

**Por que não corrigi junto.** É mudança **visual**, e o §96 manda mostrar A/B em vez de decidir
por dedução. A camada responsiva **reproduz a assimetria** (`--step-avatar-fs` só tem valor no
degrau `sm`), então o caminho responsivo e o estático concordam byte por byte — o defeito, se for
defeito, não se espalhou.

**O que fecha:** montar os três degraus lado a lado com e sem a escala tipográfica, nos dois temas,
e o Victor escolher. Se a escala entrar, o único lugar a mexer é a coluna `avfs` da tabela em
`scripts/build-responsive-layer.mjs`.

### O irmão que a mesma medição achou

`AvatarGroup` aceita `size`, e ele **só chega ao "+N"** — os avatares da pilha ficam no degrau que
cada um tiver. `<AvatarGroup size="lg">` com filhos sem `size` dá uma fila de avatares `md` com um
contador `lg` no fim. Não corrigi pelo mesmo motivo (é mudança visual), e há uma escolha de
desenho embutida: um `size` no grupo **sobrepõe** o do filho, ou é só um padrão? Com as variáveis
de passo agora **não-herdáveis**, a solução por herança de CSS deixou de estar disponível de
graça — o que torna a pergunta uma decisão de API, não um detalhe de folha.

---

## G-AXIS-07 — `InputGroupAddon.align`: a última prop elegível · **FECHADO**

| | |
|---|---|
| **Capacidade** | eixo de alinhamento do adorno de campo, responsivo |
| **Família** | API · Layout |
| **Tipo** | `triagem` |
| **Fonte** | o `sweep-responsivo`, que parou em 26 de 27 (22/08/2026) |
| **Prioridade** | 5 |
| **Status** | **FECHADO** em 22/08/2026 — eixo responsivo em **27 de 27** |
| **Decisão** | Victor: triar com sete perguntas, e **dois** resultados válidos — nada de "vemos depois" |

Triagem inteira em [`21-G-AXIS-07-ALIGN.md`](21-G-AXIS-07-ALIGN.md). O número que a decidiu:

| largura da caixa | campo com adorno em LINHA | em FAIXA |
|---:|---:|---:|
| 200px | **48%** | 99% |
| 320px | 67% | 99% |
| 640px | 84% | 100% |

Aos 200px o campo perde mais da metade da caixa para os adornos, e o efeito some sozinho quando há
espaço — que é a forma de um eixo responsivo. **`visual`**, medido: o adorno não emite `role` nem
`aria-*` a partir do `align`, não há motor, e a ordem de tabulação continua sendo a do DOM.

**shadcn/ui tem o eixo idêntico** (as mesmas quatro faixas) e **nenhuma referência o faz
responsivo** — aqui não é alcançar, é passar à frente.

---

## G-A11Y-06 — `order` reordenava o desenho e não o DOM · **CORRIGIDO ESTRUTURALMENTE**

| | |
|---|---|
| **Capacidade** | ordem visual == ordem do DOM == ordem de tabulação |
| **Família** | A11y · API |
| **Tipo** | `defeito-estrutural` |
| **Fonte** | achado colateral da triagem do `G-AXIS-07` (22/08/2026) |
| **Prioridade** | 4 |
| **Status** | **CORRIGIDO ESTRUTURALMENTE** em 22/08/2026 — o estado defeituoso deixou de ser representável |
| **Decisão** | Victor: *"não mantenha apenas como mitigado. Quero eliminar a causa."* — [ADR-0048](../../decisions/0048-ordem-estrutural-e-geometria-sao-eixos-separados.md) |

### O defeito

`InputGroupAddon.align` achatava duas dimensões independentes num enum de quatro valores — ordem
lógica (`start`/`end`) e geometria (`inline`/`block`) — e resolvia a ordem por `order:` no CSS.
`order` reordena a caixa e **não** o documento:

```text
inline-end   DOM/foco: campo → botao   visual: campo → botao   ok
block-start  DOM/foco: campo → botao   visual: botao → campo   DIVERGEM
block-end    DOM/foco: campo → botao   visual: campo → botao   ok
```

**WCAG 2.4.3 (Focus Order), nível A**, com **zero** ocorrências reais — e foi por isso que o
Victor mandou corrigir: *"zero ocorrências significa que este é o momento mais barato para
corrigir corretamente"*.

### A correção

```tsx
side="start" | "end"        ESTRUTURAL — decide o DOM. Não é responsivo.
layout="inline" | "block"   VISUAL — geometria. É responsivo.
```

E o `InputGroup` **coloca os filhos**: adornos `start`, controle, adornos `end`, preservando a
ordem dentro de cada lado. Separar os eixos não bastaria — alguém ainda poderia escrever o adorno
no lugar errado. O grupo produz a árvore certa, e a tabulação segue a árvore.

**`order` saiu do core inteiro.** Era a única ocorrência: seis regras, todas do adorno.

### A pergunta obrigatória: quem mais tem esse problema?

Varrido o core por tudo que pode reordenar o percebido — e depois medido no resultado, porque ler
CSS não pega o que nasce de composição:

```text
order                       6   TODAS no adorno · agora 0
flex-direction: *-reverse   0
grid-area                   0
grid-auto-flow: dense       0
grid-row/column explícito  13   nenhuma reordena elemento interativo
```

`tests/visual/ordem-de-foco.spec.ts` virou **sistêmico**: varre todas as páginas construídas e,
em cada contêiner que de fato reordena, compara a sequência dos filhos com conteúdo focável entre
DOM e tela. Provado contra o defeito plantado.

> **Duas correções do instrumento, registradas.** A primeira versão comparava qualquer contêiner
> flex/grid e acusou os contêineres de página inteira — num layout de duas colunas o sumário nasce
> depois no DOM e aparece mais acima; são regiões independentes, não reordenação. A segunda exigia
> um mecanismo em uso e ainda acusava: `.topbar` tem `grid-column:1/-1` para **atravessar** as
> colunas, não para trocar de lugar. O que esses mecanismos reordenam são os **filhos diretos**, e
> é nesse nível que a comparação vale.

### Dois defeitos de acoplamento que só apareceram ao mexer

Os dois do mesmo tipo — **CSS decidindo por CLASSE onde a camada responsiva decide por PONTO**:

1. `inline` nasceu sem corpo próprio. Como `block` põe `inline-size:100%`, um `inline` vazio não
   desfazia nada: no contêiner largo o adorno ficava em faixa, com a classe certa e o desenho
   errado. **Valor de eixo que não diz o que é só funciona enquanto for o primeiro.**
2. A quebra de linha vinha de `:has(.input-group-addon-block)`, e `:has()` enxerga a classe, não a
   geometria efetiva. Tirada do `:has()`: o grupo sempre pode quebrar, e quem quebra é o adorno de
   100%. A regressão que isso poderia causar está contida pela base **zero** do controle
   (`flex:1 1 0`), com teste de navegador cobrando que um grupo só com adornos em linha continue
   numa linha só.

### As provas

`tests/visual/adorno-estrutural.multi-motor.spec.ts` — **7 casos × 3 motores**: `start` antes do
controle mesmo escrito depois · DOM == tela nas duas geometrias · tabulação `antes → campo →
depois` com focável nos dois lados · a transição de `layout` em runtime sem mexer no foco, na
identidade dos nós, na sequência nem na contagem de botões · a transição inversa · RTL com o lado
**lógico** (o `start` vai para a direita) · e a linha única com adornos em linha.

Mais 4 unitários novos e a migração guardada: nenhuma classe do enum achatado sobrou no core nem
no catálogo.

---

## G-AXIS-06 — orientação responsiva esbarrava na semântica que o CSS não muda · **FECHADO**

| | |
|---|---|
| **Capacidade** | eixo de orientação responsivo nos componentes que navegam por seta |
| **Família** | API · Layout · A11y |
| **Tipo** | `limite-de-mecanismo` |
| **Fonte** | a medição do banco de prova ao fechar `orientation` (22/08/2026) |
| **Prioridade** | 4 |
| **Status** | **FECHADO** em 22/08/2026 — `orientation` em **8 de 8** |
| **Decisão** | Victor, 22/08/2026: sincronizar a semântica — [ADR-0047](../../decisions/0047-css-first-para-apresentacao-runtime-para-semantica.md) |

### O achado

Em `Tabs`, `Menubar`, `Toolbar` e `ToggleGroup` a orientação carrega **semântica de teclado**: o
`aria-orientation` decide que par de setas move o foco. Medido no `apps/keyboard-probe`, no `Tabs`
horizontal:

```text
ArrowRight  Um → Dois   MOVEU        ArrowDown  Um → Um   parado
ArrowLeft   Um → Três   MOVEU        ArrowUp    Um → Um   parado
```

O motor **honra** o que é anunciado, e CSS não escreve atributo. Eu havia registrado isso como
limite e parado em 3 de 8. O `Separator` entrava na mesma lista por outro caminho: anuncia
`aria-orientation` e o CSS não podia acompanhar.

### A decisão do Victor

Recusou o teto: *"não quero deixar `orientation` em 3/8 somente para preservar CSS-first.
CSS-first é uma estratégia de engenharia, não uma religião."* E fixou a regra que passou a valer
para todo eixo — **CSS-first para apresentação; resolução em runtime quando a prop altera
semântica, teclado, ARIA ou comportamento do motor** —, com três condições que moldaram o
desenho:

- **uma infraestrutura, não cinco.** Um resolvedor genérico (`useValorResponsivo`), não um
  `useResponsiveOrientation`;
- **o mecanismo segue a natureza do valor.** `matchMedia` para viewport, `ResizeObserver` para
  container, **nada** para valor simples;
- **o valor resolvido é a única fonte de verdade.** Nada de CSS decidir e o JavaScript correr
  atrás do atributo — seriam duas fontes e uma janela de divergência.

### O que fechou

```text
orientation            8 de 8
resolvedor             packages/react/src/responsivo-runtime.tsx — genérico, serve outros eixos
escala                 packages/react/src/escala.tsx — GERADA da mesma leitura que faz o CSS
contêiner              closest(".container-scope") — a MESMA regra do @container, não heurística
                       + a primitive <ContainerScope>, com teste de que os dois caminhos batem
pele                   reage ao data-orientation que o MOTOR publica
gate                   check 12c: responsive {prop: visual|behavioral}, derivado do código
provas                 7 casos × 3 motores + 4 de SSR/hidratação + 3 de custo
```

**A prova negativa que o Victor pediu, e ela passa nos três motores:** no horizontal, Left/Right
navegam e **Up/Down não assumem** a navegação das abas; no vertical, Up/Down navegam. Mais a
travessia: depois de alargar o contêiner, Direita passa a navegar e Baixo **para** — que é o que
separa "o motor nasceu certo" de "o motor foi atualizado".

**Custo medido** (`20-G-AXIS-06-CUSTO.md`): 4,6 KB brotli, **um** observer para a aplicação
inteira, uma observação por contêiner, sete ouvintes de `matchMedia` no total, e **zero** para
valor simples.

### O que continua CSS puro, e por quê

`size` em 18 de 18, e `orientation` em `ButtonGroup`, `Field` e `Range` — nenhum deles anuncia
orientação que possa divergir do desenho. O gate 12c reprova quem tentar o contrário nos dois
sentidos: `visual` que entrega valor a um motor, e `behavioral` que não resolve em runtime.

---

## G-AXIS-03 — a família da orientação: o motor entrega e o React não expunha · **FECHADO**

| | |
|---|---|
| **Capacidade** | eixo de orientação nos componentes que navegam por seta |
| **Família** | API · Layout |
| **Tipo** | `divergência` + `missing-axis` |
| **Fonte** | a matriz do §13 (22/08/2026) |
| **Prioridade** | 2 |
| **Status** | **FECHADO** em 22/08/2026 — os quatro, e os dois últimos **sem trocar motor nenhum** |

A matriz achou **onze** capacidades sem eixo de orientação, e foi o padrão mais forte que ela
produziu — não são onze itens soltos, é uma família. Medido no `@base-ui/react` 1.6.0, cinco
primitives declaram `orientation`: `tabs`, `menubar`, `slider`, `accordion`, `toggle-group`.

E a triagem separa duas coisas bem diferentes:

| componente | sobre o quê é construído | o que faltava |
|---|---|---|
| `Tabs` | `BaseTabs` | **exposição** — o motor sempre teve |
| `Menubar` | `BaseMenubar` | **exposição** — idem |
| `ToggleGroup` | motor | já expunha (via `variantProp`) |
| `Range` | `<input type=range>` **nativo** | ~~construção~~ → **exposição**: o nativo entrega, medido |
| `Accordion` | `<details>/<summary>` **nativo** | **nada a ganhar**: a prop está deprecada na origem |

Os dois primeiros são a **quinta e a sexta ocorrência** da família que o check 28 persegue: tema,
densidade, scroll-spy do `TableOfContents`, link de pular — *o comportamento existe e não chega ao
consumidor*.

### Eu escrevi que os dois últimos exigiam trocar de motor. Estava errado nos dois.

A afirmação não tinha medição atrás: veio de uma linha da matriz do §13 dizendo que três
referências têm o eixo e a Aurea não — o que é verdade sobre a **declaração** e não diz nada sobre
a **capacidade**. O Victor mandou medir antes de trocar, e virou a
[ADR-0045](../../decisions/0045-nao-trocar-motor-para-obter-uma-prop.md).

**`Range`: o `<input type=range>` nativo entrega.** Medido nos três motores, na ordem
geometria → teclado → direção → RTL → toque → a11y:

| | Chromium | Firefox | WebKit |
|---|---|---|---|
| caixa vertical | 16×200 | 20×200 | 20×200 |
| teclas que movem | **8/8** | **8/8** | **8/8** |
| `ArrowUp` · clique no topo · arraste | 51 · 100 · 100 | 51 · 100 · 100 | 51 · 100 · 100 |
| estável em documento RTL | ✔ | ✔ | ✔ |

Duas propriedades bastam, e as duas só apareceram medindo: `writing-mode:vertical-rl` põe o eixo
**inline** na vertical — daí a altura ser `inline-size` e **não** `block-size`, que produziu uma
caixa **deitada** (129×16) na primeira tentativa; e `direction:rtl` põe o **topo como o maior**,
sem a qual `ArrowUp` **diminui** e clicar no topo dá **0**.

**`Accordion`: a prop que eu ia buscar está deprecada na origem.** O `orientation` do accordion da
Base UI 1.6.0 é `@deprecated`, e o tipo diz por quê: *"Deprecated following the APG guidance update
to remove roving focus. This state no longer affects keyboard focus behavior."* O inventário da
`radix` ainda lista as seis teclas porque reflete o APG **antigo**.

E a pergunta que o Victor mandou responder — **o que "horizontal" significa como capacidade** —
tem resposta em duas partes: como **comportamento** foi removido do padrão, então não há o que
ganhar; como **apresentação** é CSS no componente que já existe — medido, três `<details>` num
contêiner flex ficam lado a lado, `Enter` alterna e a semântica de divulgação fica intacta.

**Conclusão: nenhum motor trocado, e uma prop a mais.**

### O que mudou

- **`Tabs.orientation`**. A raiz vira **grade** na vertical, não linha: com `flex-direction:row` o
  painel e a lista dividem a mesma linha e o `stretch` do flex estica a lista até a altura do
  painel. Medido — a lista media **336px** para **108px** de abas.
- **`Menubar.orientation`**, e aqui a orientação não é só layout: numa barra vertical o menu não
  pode abrir para baixo, porque abriria **em cima do item seguinte da própria barra**. Ele abre em
  `inline-end` — lógico, não `right`, para que em árabe ele abra sozinho para o outro lado.
- Ao contrário do `ButtonGroup` (que **não** anuncia orientação, porque `role="group"` não navega
  por seta), aqui o `aria-orientation` **sai** — e sai do motor. Lista de abas navega por seta,
  então anunciar é prometer teclado que existe. É a regra do `G-AXIS-01` aplicada do outro lado.

### Dois defeitos meus, os dois achados medindo

1. **`align-items:stretch` no `.menubar-vertical` fazia cada gatilho medir 1216px** — a viewport
   inteira —, porque `.menubar` é flex de nível de bloco e ocupa o pai. Invisível na horizontal,
   gritante na vertical. `inline-size:max-content` faz `stretch` querer dizer *"todos do tamanho
   do maior rótulo"*: 158px, medido.
2. **O gate passava com o defeito de volta.** Trocada a grade por linha, os dois testes do `Tabs`
   continuavam verdes — porque no banco de medição o texto longo estava numa aba **não
   selecionada**, e só o painel ativo renderiza. Sem painel mais alto que a lista, linha e grade
   desenham igual. Corrigido o banco, o teste reprova com `a lista mede 336 para 108 de abas`.

   É a mesma lição do `G-A11Y-05`, onde o gate do token passava enquanto a regra apontava para o
   token errado: **um controle que não foi provado contra o defeito não é controle, é decoração.**

### Os controles

`tests/visual/range-vertical.multi-motor.spec.ts` — **6 casos × 3 motores**, e o `playwright.config`
ganhou Firefox e WebKit só para os arquivos `*.multi-motor.*`: baseline de pixel é por motor, e
multiplicar a suíte inteira por três triplicaria o custo sem responder pergunta nova.
Provado contra os dois defeitos: sem `direction:rtl` reprovam 6 dos 18; com `block-size` no lugar
de `inline-size`, a geometria reprova nos três.

Duas armadilhas do próprio teste, as duas medidas: `page.setContent` dá origem `about:blank` e o
`<link>` relativo **não resolve** — a primeira versão media um `<input>` sem estilo nenhum e
acusava o componente por defeito do teste, e por isso o `montar()` tem um **controle** que reprova
se o `writing-mode` computado não for vertical. E a caixa injetada precisa ser `position:fixed` por
cima: no fluxo da página do catálogo ela cai sob o layout, e o clique acerta outro elemento —
teclado e geometria passavam, ponteiro e arraste ficavam no valor não tocado.

`tests/unit/eixos-layout.test.tsx` (+4 casos) cobra a estrutura — classe emitida, regra no core,
`aria-orientation` correto. `tests/visual/orientacao.spec.ts` (4 casos) cobra a **caixa**, que é o
que jsdom não sabe fazer: lista ao lado do painel, lista que não estica, gatilhos do tamanho do
maior rótulo, e menu que abre ao lado. Provados contra o defeito: os quatro reprovam quando as
regras voltam ao estado anterior.

---

## G-A11Y-05 — todo link em prosa reprovava contraste no tema claro · **FECHADO**

| | |
|---|---|
| **Capacidade** | ler um link (WCAG 2.2 SC 1.4.3, nível AA) |
| **Família** | Tokens · Acessibilidade |
| **Tipo** | `defeito` |
| **Paridade** | irrelevante — é reprovação de norma, não comparação |
| **Fonte** | axe na varredura do catálogo, ao conferir os patterns novos (22/08/2026) |
| **Prioridade** | 1 |
| **Status** | **FECHADO** em 22/08/2026 |

O core pintava `a { color: var(--primary) }`, e `--primary` é o amarelo da marca. Medido:

| | contraste | AA pede |
|---|---:|---|
| link sobre o fundo do tema **claro** | **1,73:1** | 4,5:1 |
| link sobre `--card` claro | **1,91:1** | 4,5:1 |
| link sobre o fundo do tema **escuro** | 10,34:1 | 4,5:1 ✔ |

**Todo link em prosa, no tema claro, desde sempre.** Ninguém viu por dois motivos que vale
nomear: o projeto se desenvolve no escuro, onde passa folgado; e o catálogo repinta os próprios
links, então as páginas que alguém abre para conferir são exatamente as que escondem o defeito.
Ele apareceu porque um pattern novo pôs um `<a>` cru dentro de um `<p>` — compor de novo mostrou
o que olhar de novo não mostrava.

### A raiz é a ADR-0044, e por isso a correção não foi escurecer o amarelo

`--primary` é **invariável entre temas** porque é IDENTIDADE — está no `CLAUDE.md`, é intocável.
Um papel semântico que precisa **mudar com o tema** não pode ser servido por ele. É a mesma frase
do Victor que fechou o `G-TOKEN-02`, num sintoma diferente: *"se duas intenções diferentes ficam
visualmente indistinguíveis, a semântica tem precedência e deve receber token próprio."*

Nasceram `--link` e `--link-hover`:

- **escuro:** `{brand-yellow}` — por REFERÊNCIA, não por cópia do valor. A identidade é apontada,
  então ela continua sendo uma coisa só. Nada muda de aparência no tema escuro.
- **claro:** `oklch(0.52 0.106 86.047)` — **a mesma matiz da marca** (86.047), com croma e
  luminosidade escolhidos por busca: o **maior croma** que cabe no gamut sRGB *e* passa 4,5:1 nas
  três superfícies claras. Resultado medido: **5,02** (fundo) · **5,55** (card) · **4,66**
  (secondary), e 3,56:1 contra o corpo do texto, para o link se distinguir da prosa.

⚠️ **Isto muda a aparência do tema CLARO** — links deixam de ser amarelos e passam a ser âmbar
escuro. É reparo de reprovação AA, na régua que o projeto já usou no `G-A11Y-01` e no `G-A11Y-03`,
mas é mudança visível: se o Victor preferir outro valor, o que está decidido é o *papel* (`--link`
existe e é semântico), não o tom exato.

### Quem mais tem esse problema

Perguntado antes de corrigir, e **medido**: 11 papéis de texto × 5 superfícies × 2 temas.
No **escuro, nenhuma** reprovação. No **claro, só `--primary`** — que é preenchimento (com
`--primary-foreground` por cima) e nunca texto sobre a página. Era o link e mais nada.

### O controle, e a brecha que ele tinha

`tests/visual/tone-contrast.spec.ts` ganhou **três** testes por tema. O primeiro cobra os papéis
de texto sobre as superfícies; ele tem **controle negativo** (o corpo do texto tem de passar de
10:1) porque a primeira medição deu `--foreground` sobre `--background` = **1,00:1**, impossível
— eu tinha lido `oklch(0.985 0 0)` com regex de número, tratando `0.985` como canal 0-255. O
mesmo erro de `oklch` que já me pegou duas vezes nesta atividade.

O segundo é a brecha, e ela é a lição: o gate de token **passava** com o defeito de volta. Medido:
devolvi a regra do core para `--primary`, deixei o token certo no lugar, e os quatro testes
passaram — **um token bom apontado por ninguém não pinta nada.** Então entrou um terceiro teste
que mede um `<a>` REAL, em prosa, com a cascata real. Esse reprova a 1,73:1, que é o defeito.

---

## G-A11Y-04 — a ficha declarava MENOS teclado do que o componente entrega · **FECHADO**

| | |
|---|---|
| **Capacidade** | o contrato publicado dizer a verdade sobre o teclado |
| **Família** | Contrato · Acessibilidade |
| **Tipo** | `divergência` |
| **Fonte** | a matriz do §13, linha `slider` (22/08/2026) |
| **Prioridade** | 2 |
| **Status** | **FECHADO** em 22/08/2026 |

A matriz acusou que três referências dão `ArrowUp`/`ArrowDown`/`PageUp`/`PageDown` ao slider e a
Aurea não. Fui conferir: o `Range` da Aurea **é** um `<input type="range">` nativo, e o browser
entrega as oito teclas há vinte anos. Quem estava errado era a **ficha**.

Medido no navegador, três componentes que são elemento nativo:

| ficha | declarava | o navegador entrega |
|---|---|---|
| `Range` | 4 teclas | **8** — faltavam ArrowUp, ArrowDown, PageUp, PageDown |
| `Select` | 2 teclas | **9** — faltavam as setas todas, Home/End, PageUp/PageDown |
| `Radio` | 3 teclas | **5** — faltavam ArrowLeft, ArrowRight |

Não é detalhe de documentação. A ficha é o **contrato publicado**: quem audita acessibilidade lê o
contrato, um contrato que promete menos produz gap falso — e, pior, autoriza uma reescrita que
troque o elemento nativo por outra coisa sem ninguém notar que oito teclas foram embora.

### O que a medição corrigiu que a leitura teria errado

Nos **dois** sentidos, e é por isso que a régua é o navegador e não o texto do APG:

- no `Radio` ela **acrescentou** `ArrowLeft`/`ArrowRight`, que o padrão do grupo de rádio não
  destaca;
- e **impediu** acrescentar `Home`/`End`, que o padrão menciona e o navegador não faz.

E o gate achou o que a medição à mão não achou: eu tinha testado Up/Down/Home/End/PageUp/PageDown
no `<select>` e **nunca Left/Right**, que também movem. É o §10 se provando sozinho — amostragem
falha, e falha em silêncio.

### O controle

`tests/visual/teclado-nativo.spec.ts`, 3 casos, provado contra o defeito: com as fichas
antigas, **os três reprovam**. Ele varre **toda** tecla plausível, não só as declaradas — uma que
a ficha esqueceu não estaria na lista — e cobra os dois lados: tecla que move e a ficha não
declara, e tecla que a ficha declara e não move.

**Escopo declarado, porque ele não é geral:** só os componentes que SÃO elemento nativo, e só num
navegador (Chromium/Linux). Uma plataforma cujo `<select>` nativo ligue menos teclas faria a ficha
do `Select` prometer demais, e **este gate não pegaria** — está escrito na própria ficha.

### A segunda metade: o teclado que o MOTOR entrega

Sobravam oito capacidades cujo teclado a `radix` declara mais rico que a nossa ficha. Essas vêm do
motor, não do elemento, e teclado de motor é **efeito** — roving tabindex, captura de tecla, foco
gerido. O catálogo é `renderToStaticMarkup`: medir lá mediria HTML parado. Então entrou
`apps/keyboard-probe`, uma aplicação de verdade nos moldes do `proof-client`, e
`tests/visual/teclado-motor.spec.ts`, que pressiona tecla e fotografa o estado observável.

**Dois achados reais, com a evidência:**

| ficha | declarava | o motor também responde a | evidência medida |
|---|---|---|---|
| `DropdownMenu` | ArrowDown, Enter, Escape | **ArrowUp**, **Space** | `aria-expanded=true` e foco no `.menu-item` — ArrowUp abre no ÚLTIMO item, Space no primeiro |
| `OTPField` | ArrowLeft, ArrowRight, Backspace, Delete | **ArrowUp**, **Home** | foco muda de caixa |

**E cinco alarmes falsos, que são a parte que interessa.** A primeira execução reprovou cinco de
sete, e **quatro das cinco eram cegueira do meu instrumento**:

1. **A impressão digital do foco não distinguia irmãos.** As caixas do `OTPField` são `<input>`
   com a mesma classe e sem texto — a foto era idêntica para as quatro, e a seta que anda entre
   elas saía como "não faz nada". Corrigido com o índice do elemento no documento.
2. **A medição começava do primeiro item.** `Home` no primeiro não tem para onde ir, e `Space`
   num rádio já marcado não muda nada — as duas saíam como tecla inerte. Corrigido começando do
   segundo.
3. **O campo era medido pristino.** O `OTPField` vazio prende o foco na primeira caixa por
   construção — é onde você tem de digitar — e ali nenhuma seta anda. Com dois dígitos, todas
   andam. Medir um campo vazio é medir um estado em que quase nada pode acontecer.
4. **A foto incluía atributos de ANIMAÇÃO.** `data-starting-style` e `data-ending-style` aparecem
   e somem sozinhos enquanto o painel do `Tabs` monta, sem tecla nenhuma — era isso que fazia o
   `Tabs` "responder" a Escape, Enter, as setas e Page Up/Down. **Fotografia do relógio, não do
   componente.** Corrigido excluindo-os e deixando a montagem assentar antes da foto de
   referência.

O que destravou a triagem foi pôr o **diff no relatório**: enquanto o teste só dizia *que* algo
mudou, não dava para separar "a tecla agiu" de "o motor mexeu um atributo de animação". Sem o
diff o teste é oráculo, e oráculo não se audita.

### Uma asserção que foi RETIRADA, e por quê

A primeira versão também cobrava o inverso — *"a ficha declara tecla que não faz nada"*. As quatro
acusações que ela produziu eram todas falsas, e uma delas **não tem correção genérica**: `Enter`
num `<select>` fechado não faz nada mensurável; ele confirma a escolha com a lista **aberta**, e a
lista nativa é chrome do sistema operacional, fora do alcance do DOM.

**Ausência de mudança observável não prova ausência de efeito.** Uma foto genérica do DOM pode
provar que uma tecla faz algo; não pode provar que ela não faz. Cobrar o inverso é pedir ao teste
uma conclusão que o método não sustenta — e produz exatamente o que produziu: acusação contra ficha
correta. O gate do elemento nativo cobra os dois lados porque lá o efeito é o VALOR do controle,
que é sempre legível; aqui não é, e a diferença está declarada no fonte.

### O que a matriz apontou e a medição NÃO confirmou

Vale tanto quanto o que ela achou. A `radix` declara, para o `Accordion`, navegação por seta entre
cabeçalhos, e para `Checkbox`/`Tabs`/`Radio`/`DataGrid`, `Enter`. Medido: **o motor da Aurea não
responde a nenhuma delas.**

Para o `Accordion` isso não é defeito e sim **decisão**: ele é `<details>/<summary>` nativo, e a
`radix` navega por seta porque implementa roving focus por cima. É diferença de **capacidade**, e
fica registrada como tal — não como erro de ficha. Copiar o teclado de uma referência para a nossa
ficha porque ela declara mais seria repetir o erro que a primeira versão da matriz do §13 cometeu.

---

## G-CSS-01 — o core desenha por grade e ninguém conferia se o React entregava as células · **FECHADO**

| | |
|---|---|
| **Capacidade** | o componente React preencher a grade que o core desenha para ele |
| **Família** | Core · React · Consistência |
| **Tipo** | `divergência` |
| **Paridade** | `AUREA_INFERIOR` contra a própria referência congelada |
| **Fonte** | escrever as composições do `G-COMP-01` (22/08/2026) |
| **Prioridade** | 1 |
| **Status** | **FECHADO** em 22/08/2026 |

Achado ao escrever o pattern do `LogStream`. O core declara `.log-line` como uma grade de **três**
trilhas — `86px 72px minmax(0,1fr)`: hora, nível, mensagem — e o React emitia **dois** filhos.
Medido no navegador, não deduzido:

| | React (antes) | referência congelada |
|---|---|---|
| hora | `<time>` sem `.log-time`, x=14 **w=86** | `.log-time`, x=14 w=86 |
| nível | **não existia** | `.log-level.warn`, x=112 w=72 |
| mensagem | x=112 **w=72** | x=196 **w=690** |

A mensagem caía na trilha do nível e media **72px**. Não é desalinho cosmético: é a linha de log
ilegível, e o nível — a informação que faz alguém olhar o log — perdido. No lugar dele o
componente emitia `log-warn`, uma classe com **zero** regras no core. Classe sem regra não
quebra nada: ela some, e ninguém vê.

**"Quem mais tem esse problema?"** — a pergunta que o `CLAUDE.md` exige antes de corrigir no
lugar. A varredura do core por `grid-template-columns` sem `auto-fill`/`auto-fit` deu seis
candidatos, confrontados um a um com o render real:

| seletor | trilhas | filhos emitidos | |
|---|---:|---:|---|
| `.alert` | 3 | **1** | **DESALINHADO** |
| `.banner` | 3 | 3 | ok |
| `.data-list` | 2 | 2 | ok |
| `.log-line` | 3 | **2** | **DESALINHADO** |
| `.message` | 2 | 2 | ok |
| `.notification-item` | 3 | — | portal, medido à parte |

O `.alert` tinha o mesmo defeito por outro caminho: emitia o título solto, que caía na **trilha do
ícone** e crescia com o próprio texto (medido: título x=16 **w=230**, contra ícone w=300 e corpo
w=544 na referência), e o corpo entrava como item **anônimo** da grade. E não desenhava ícone
nenhum, embora a referência congelada desenhe um por variante — deixando **a cor como único
sinal** do tipo de aviso, que é reprovação direta de WCAG 1.4.1.

### O que mudou

- **`LogStream`** emite as três células sempre, mesmo vazias — o mesmo recurso dos `<span/>` do
  `Banner` — com `.log-time`, `.log-level` e o **texto** do nível, que antes não existia em lugar
  nenhum. O modificador passou a ser o que o core casa (`.log-level.warn`), não `log-warn`.
- **`Alert`** passou a emitir ícone · corpo · ação, com título e corpo **juntos** na trilha 2. O
  ícone é **função da variante**, como o `role` já era: `information--filled`, `checkmark--filled`,
  `warning--alt--filled`, `error--filled`. `icon` sobrepõe; `onDismiss` entrou junto, espelhando o
  `Banner`.
- O `Banner` **não** ganhou ícone automático, de propósito: ele não existe na referência congelada
  e um aviso de largura de página nem sempre quer glifo. A assimetria é decidida, não herdada.
- **`.log-level.info` recebeu `--info`** em vez do amarelo da marca. É a [ADR-0044](../../decisions/0044-semantica-tem-precedencia-sobre-coincidencia-de-token.md)
  aplicada: INFO num log e a cor primária da Aurea são duas intenções, e estavam visualmente
  indistinguíveis. A base segue em `--primary` para o nível que o sistema não conhece.

### O controle

`tests/unit/grade-do-core.test.tsx`, **12 casos**, provado contra o defeito: com os dois
componentes revertidos ao estado anterior, **9 dos 12 reprovam**. Ele cobra três coisas:

1. **aridade** — o componente emite tantos itens quantas trilhas o core declara para a sua classe
   (as trilhas são LIDAS do `aurea.css`, não escritas no teste: mudar a grade move o alvo junto);
2. **texto solto** — nenhum nó de texto direto dentro da grade, porque item anônimo é exatamente
   o que escondeu o defeito do `Alert`;
3. **classe órfã** — nenhuma classe emitida pelo React fica sem regra no core. É o sintoma que
   precede quase toda aridade errada, e é o que teria pego `log-warn` no dia em que nasceu.

O ponto 3 já cobrou uma dívida ao ser escrito: acusou `.log-level.info`, que o componente emitia e
o core não pintava.

---

## G-A11Y-01 — a Aurea escondia as próprias barras de rolagem · **FECHADO**

| | |
|---|---|
| **Capacidade** | região que rola avisar que rola, e dar o que arrastar |
| **Família** | Foundations · Layout |
| **Tipo** | `missing-a11y` |
| **Prioridade** | 1 |
| **Status** | **FECHADO** em 21/08/2026 |

**Como apareceu, e por que o gap anterior estava mal formulado.** O `G-CAP-02` estava na fila
como "falta um `ScrollArea`", e eu o tinha marcado para subir ao Victor pelo §96, achando que a
pergunta era estética. Ao medir antes de escrever, a pergunta virou outra: `.sidebar` e `.toc`
tinham `scrollbar-width: none` **mais** `::-webkit-scrollbar { width: 0 }`. **A barra não estava
faltando — estava sendo removida.**

Isso não é estilo. Uma região que rola sem barra visível não anuncia que rola, e não oferece
alvo para arrastar. Quem usa ponteiro perde o controle; quem depende de alvo grande perde duas
vezes.

**O conserto foi o pequeno, e por isso não precisou de decisão.** A barra continua **nativa** —
não há `<div>` fazendo de polegar —, então a rolagem por clique no trilho e as preferências de
acessibilidade do sistema continuam de pé. É exatamente o que um `ScrollArea` de peças trocaria
por conta própria, e a razão de ele **não** ter entrado.

**Dois caminhos, porque um só não cobre.** Medido nos dados do MDN em 21/08/2026:

| | Chrome | Firefox | Safari |
|---|---|---|---|
| `scrollbar-width` | 121 | 64 | 18.2 |
| `scrollbar-color` | 121 | 64 | **26.2** |
| `::-webkit-scrollbar` | 2 | **153** | 4 |

O par padrão ainda não alcança o Safari da maioria; o caminho webkit não alcança o Firefox
antigo. Juntos cobrem os três. **A estimativa que eu tinha dado ao Victor — "duas linhas" —
estava errada, e a medição é que mostrou.**

O `ScrollArea` de peças da Base UI fica adiado: entra quando houver pedido de barra sobreposta ou
sombra de borda, e aí sim é decisão visual.

---

## Capacidades ausentes, verificadas uma a uma

Vindas da triagem do [`04-TRIAGEM.md`](04-TRIAGEM.md) e conferidas nas três fontes da Aurea
(ficha, símbolo exportado, classe do core). **Não são as 376 candidatas** — são as de maior
lastro, verificadas. As demais seguem no `CROSSREF.json` esperando a mesma verificação.

Cada linha ainda precisa do trabalho do §9 antes de virar construção: anatomia, estados, teclado
e ARIA medidos nas referências que a têm. Estar nesta tabela é ter passado da triagem, não estar
pronta para escrever.

| ID | Capacidade | Família | Refs | Observação |
|---|---|---|---:|---|
| ~~`G-CAP-01`~~ | `collapsible` | Disclosure | 5 | **FECHADO em 21/08** |
| ~~`G-CAP-02`~~ | `scroll-area` | Layout | 5 | **FECHADO em 21/08, e não como eu tinha proposto.** Medindo, o achado foi outro: a Aurea **escondia** a própria barra. O conserto é CSS padrão (barra nativa, fina, no tema), não um componente de peças — ver abaixo |
| ~~`G-CAP-03`~~ | `separator` | Layout | 5 | **FECHADO em 21/08** |
| ~~`G-CAP-04`~~ | `toggle-group` | Actions | 5 | **FECHADO em 21/08** |
| ~~`G-CAP-05`~~ | `aspect-ratio` | Layout | 4 | **FECHADO em 21/08** |
| `G-CAP-06` | `carousel` | Data display | 4 | |
| `G-CAP-07` | `form` | Forms | 4 | a Aurea tem `Field`; o envelope de formulário não |
| ~~`G-CAP-08`~~ | `menubar` | Navigation | 4 | **FECHADO em 21/08** |
| `G-CAP-09` | `navigation-menu` | Navigation | 4 | menu de navegação com painéis — o "mega menu" do §16 |
| `G-CAP-10` | `rating` | Data entry | 4 | |
| ~~`G-CAP-11`~~ | `input-group` | Forms | 3 | **FECHADO em 21/08.** Fechou por §21, não por demanda: eu já tinha resolvido "coisa grudada no campo" **três vezes** localmente. A consolidação matou um defeito publicado junto — ver abaixo |
| ~~`G-CAP-12`~~ | `label` | Forms | 3 | **FECHADO em 21/08** |
| `G-CAP-13` | `resizable` | Layout | 3 | painéis redimensionáveis — o §153 |
| `G-CAP-14` | `date-picker` | Forms | 2 | **o exemplo do §15**: `Calendar` é a grade; seletor é campo + popover + máscara + locale |
| `G-CAP-15` | `progress-circle` | Feedback | 2 | `Progress` é a barra linear |
| `G-CAP-16` | `chip` | Data display | 2 | só existe o chip **de dentro do combobox** |
| `G-CAP-17` | `list` | Data display | 2 | `DataList` e `MessageList` são de domínio |
| `G-CAP-18` | `color-picker` | Forms | 2 | |
| `G-CAP-19` | `gantt` | Productivity | 2 | |
| `G-CAP-20` | `kanban` | Productivity | 2 | |
| ~~`G-CAP-22`~~ | `password-toggle` | Forms | 2 | **FECHADO em 21/08.** Achado pela comparação de família de primitives, não pela triagem por nome — `password-toggle-field` (radix) e `password-input` (shark) dividiam a evidência |
| `G-CAP-21` | `announcement` · `bottom-nav` · `marquee` · `tags` · `typography` · `locale` | vários | 2 | agrupadas por ainda não terem sido medidas separadamente |

---

## O motor já entrega oito destes — medido

Cruzando a fila com a enumeração da `base-ui`, que **já é dependência de runtime** do
`@aurea-uds/react`:

```bash
node -e '…' # o cruzamento está no INVENTORY.json, fonte `base-ui`
```

| Gap | Primitive no motor | Estado |
|---|---|---|
| `collapsible` | `collapsible` | **fechado** |
| `separator` | `separator` | **fechado** |
| `toggle-group` | `toggle-group` | **fechado** |
| `toast` (`G-DOC-01`) | `toast` | já usado; falta ficha e página |
| `scroll-area` | `scroll-area` | aberto — **decisão visual, §96** |
| `form` | `form` | aberto |
| `menubar` | `menubar` | **fechado** |
| `navigation-menu` | `navigation-menu` | aberto |

**Custo em dependência nova: zero** (§48). Comportamento, teclado e ARIA vêm do motor; o que a
Aurea escreve é pele, ficha, teste e documentação.

Os que **não** têm primitive no motor — `aspect-ratio`, `carousel`, `rating`, `input-group`,
`label`, `resizable`, `date-picker`, `progress-circle`, `chip`, `list`, `color-picker`, `gantt`,
`kanban` — precisam do inventário do §9 nas referências que os têm antes de virar construção.

---

## Pendente de inventário

A fila acima é curta porque só a Fase Zero terminou, e ela vai crescer muito: o §16 lista as
famílias mínimas a cobrir e **nenhuma** foi cruzada com as referências ainda. O
[`02-FONTES.md`](02-FONTES.md) mostra as sete referências locais não inventariadas e as oito
fontes externas em `PENDING`.

**Isto não é a matriz do §13.** A matriz universal de capacidades ainda não existe; ela nasce
quando o inventário das fontes existir. O que está aqui não é resultado de inventário — é o que
a medição do próprio workspace entregou de graça.
