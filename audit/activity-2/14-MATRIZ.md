# §13 — a matriz universal de capacidades

**Gerada por** `node audit/activity-2/matrix.mjs` → [`MATRIX.json`](MATRIX.json).
**Depende de** `node scripts/measure-aurea-aria.mjs` → [`AUREA-ARIA.json`](AUREA-ARIA.json).
**Data da medição:** 22/08/2026.

O [`crossref.mjs`](crossref.mjs) cruzou **nomes** e parou onde tinha de parar: 59 capacidades
existem dos dois lados e ficaram em `A_COMPARAR`, porque o §15 é explícito — *"a Aurea possuir um
componente com o mesmo nome NÃO fecha o gap"*. Esta é a etapa seguinte: **capacidade contra
capacidade**, as 59, eixo a eixo.

---

## 0. A primeira versão estava errada, e o registro vale mais que o resultado

Ela fazia diferença de conjuntos sobre os valores dos nove inventários e concluía que a Aurea era
**inferior em 59 de 59 capacidades**, com o `Button` inferior em **7 eixos**. Um `Button` com 13
variantes, 2 eixos, 5 tamanhos e 6 estados não é inferior a isso. O número era grande demais para
ser verdade — foi o que fez conferir a linha, e a linha mostrou o que ele media:

| eixo | o que a diferença de conjuntos estava comparando |
|---|---|
| variantes | a `mui` declara `{variant, color, size, loadingPosition}`; o achatamento virava `color:primary` e `loadingPosition:center` "faltando" na Aurea — uma é o **eixo de tom**, a outra é **outra prop** |
| estados | a `mui` declara estado como **prosa** (`descricao: "State class applied to the..."`), comparada com `hover` |
| teclado | a `base-ui` escreve *"delega a ativação por Enter e Espaço"* — que **é** `Enter`+`Space`, exatamente o que a Aurea declara |
| aria | a Aurea usa `<button>` e `<input type=checkbox>` **nativos**; semântica implícita não aparece como atributo, e "não emite ARIA" lia-se como falta |

É a armadilha do §15 **um nível abaixo**. Lá era *"nome igual não é capacidade igual"*; aqui é
**"valor igual não é capacidade igual, e valor diferente não é capacidade diferente"**.

E ela se repetiu mais duas vezes antes da matriz ficar de pé, as duas achadas por conferir uma
linha que parecia errada:

- `estadosData` colhe **todo** `data-*` do fonte, e a maioria não é estado: `data-slot` marca
  anatomia, `data-variant`/`data-size`/`data-side` são os **eixos**. Sem filtrar, a linha do
  `Card` reportava que faltavam os "estados" `slot` e `variant` — e `estados` acusava em **40 das
  59** capacidades.
- o leitor da Aurea ignorava `variantProp`/`sizeProp`, então `Separator`, `Toolbar` e
  `ToggleGroup` — que declaram `variantProp: "orientation"` — entravam como eixo de **aparência**,
  e a matriz dizia que lhes faltava orientação. **A ficha nunca mentiu; o leitor é que estava
  errado.**

---

## 1. O que esta matriz emite, e o que ela se recusa a emitir

Veredito **automático** só onde os dois lados falam mesmo a mesma língua. O resto é
`REQUER_LEITURA` **com a evidência das nove referências alinhada ao lado** — que é trabalho
entregue, não promessa: quem for comparar não precisa reabrir nove inventários.

| eixo | veredito? | régua |
|---|---|---|
| **eixos** (aparência, tom, tamanho, orientação, posição) | só quando a Aurea **não tem o eixo inteiro** | por TIPO, via mapa de apelidos conferido à mão. Tendo os dois o eixo, **contagem não decide** |
| **estados** | sim | só `estadosData` das fontes medidas, onde o valor é o literal do `data-*`; a prosa das fontes ricas fica de fora e está **declarada** como não-comparável |
| **teclado** | sim, quando a fonte lista **teclas** | prosa vira `REQUER_LEITURA` |
| **aria** | **nunca** | a Aurea usa elemento nativo onde dá; lista vazia pode ser a plataforma trabalhando — que é a escolha melhor — ou falta |
| **anatomia** | **nunca** | `startIcon` da `mui` e `leadingIcon` da Aurea são a mesma peça |

Por que a contagem não decide: a `shadcn` declara **8 "tamanhos"** de botão porque conta `icon`,
`icon-sm`, `icon-lg` e `icon-xs` — que na Aurea são um **componente à parte** (`IconButton`) vezes
os 5 degraus. `8 > 5` diria "inferior" sobre um sistema que tem mais. A `mui` declara **7 "cores"**
contando `inherit`, que não é tom nenhum.

---

## 2. O resultado

**307 células** (59 capacidades × os eixos de cada uma), sobre **11 fontes de código**:

| veredito | células | |
|---|---:|---|
| `REQUER_LEITURA` | **168** | evidência alinhada, comparação humana pendente |
| `AUREA_INFERIOR` | **72** | inferioridade **medida**, com a evidência atrás |
| `INCONCLUSIVO` | **44** | nenhuma referência com a capacidade captura o eixo no seu esquema |
| `SO_AUREA` | **18** | só a Aurea tem — decisão a registrar, não gap |
| `AUREA_COBRE` | **5** | cobertura medida |

> **Remedido em 27/08** com o extrator de `data-*` compartilhado: 17 células mudaram, e as 17 de
> `estados` — o único eixo que ele alimenta. As cinco fontes medidas usavam cinco regex
> diferentes para o mesmo campo, duas medindo o oposto das outras três. Ver
> [`23-EXTRATOR-DATA-ATTRS.md`](23-EXTRATOR-DATA-ATTRS.md).

Além delas, **59 vereditos de LINHA** — o rollup por capacidade (36 `AUREA_INFERIOR`, 22
`REQUER_LEITURA`, 1 `AUREA_COBRE`). Linha **não é** célula, e confundir as duas coisas já
publicou `366 células` e uma fila de `205` que não existia; ver §7 do `HANDOFF.md`.

**Que 168 de 307 exijam leitura é o resultado honesto, não uma falha da ferramenta.** A alternativa
era o número da primeira versão, que era falso. O §13 pede uma matriz de capacidades; capacidade
não é derivável de vocabulário, e prometer que é foi o erro que esta página registra.

### As inferioridades medidas que valem construção

| capacidade | ficha | o que falta, medido |
|---|---|---|
| `slider` | `Range` | **orientação vertical** (base-ui, mui e radix têm), tamanho, tom |
| `tabs` | `Tabs` | orientação vertical (base-ui, mui, radix) |
| `accordion` | `Accordion` | orientação horizontal (base-ui, radix) |
| `menubar` | `Menubar` | orientação (base-ui) |
| `menu` · `combobox` · `select` | | orientação (base-ui) |
| `avatar` | `Avatar` | `circular \| rounded \| square` (mui) — a Aurea é sempre redonda |
| `toggle` · `progress` · `button-group` | | um eixo de tom que a Aurea não expõe |

**Onze capacidades sem eixo de orientação** — medido em 22/08, antes do `G-AXIS-04`/`G-AXIS-06`,
que desde então deram orientação a oito componentes; `tabs`, `menubar` e `slider` já saíram desta
lista. É o padrão mais forte que a matriz produziu, e ele é
coerente: a Aurea acabou de ganhar orientação em `Field`, `ButtonGroup` e `InputGroupAddon` pelo
`G-AXIS-01`, achado pelo mesmo caminho. É a **próxima família**, não onze itens soltos.

### Resíduo identificável, que NÃO é gap

- `input` × `untitled-ui`: lá a orientação mora no *input*, aqui mora no `Field`. Decomposição
  diferente, não capacidade faltando.
- `drawer` × `mui`: `"permanent or persistent"` é prosa vazando pelo campo de eixo.

---

## 3. O que a matriz achou e já foi corrigido

A linha do `slider` acusou que três referências dão `ArrowUp`/`ArrowDown`/`PageUp`/`PageDown` e a
Aurea não. Conferido: o `Range` **é** um `<input type="range">` nativo e o browser entrega as oito
teclas. A **ficha** é que declarava quatro. Virou o `G-A11Y-04`, com `Select` e `Radio` junto e um
gate que mede no navegador — ver [`03-GAPS.md`](03-GAPS.md).

Sobram **oito** capacidades cujo teclado a `radix` declara mais rico que a ficha da Aurea
(`menu` com 8 teclas a mais, `accordion` com 6, `otp-field` com 3). Essas vêm do **motor**, não do
elemento nativo, então a mesma pergunta precisa da mesma régua: **medir no navegador o que a Base
UI entrega**. Não está feito, e não vai ser afirmado sem medir — fica na fila como a segunda
metade do `G-A11Y-04`.

---

## 4. Limites, declarados

- **Uma referência que não captura um eixo não vira ausência.** `INCONCLUSIVO` aparece 45 vezes
  exatamente para isso, e `naoCapturadoPor` no JSON nomeia quais fontes e por quê.
- **`aria` e `anatomia` nunca recebem veredito.** São 118 das 168 células de `REQUER_LEITURA`.
- **O mapa de apelidos de eixo é curto de propósito.** Casar eixo demais inventa paridade, que é
  o erro que o §15 descreve. Cada linha dele é uma afirmação conferida à mão.
- **As fontes externas do §3 continuam `PENDING`.** A matriz cobre as **11 de código** já
  inventariadas (as nove locais + HeroUI + Radix Themes); quando as externas entrarem, ela roda
  de novo sem reescrita — e desde 26/08 um controle a faz **falhar** se existir um
  `INVENTORY-*.json` de código fora da tabela, porque lista fixa não reclama do que falta.
- **Os `INVENTORY-DOCS-*.json` não entram**, por decisão declarada no controle: eles medem
  páginas, seções e prosa, e cruzar naturezas diferentes é a armadilha do §15. A documentação
  **anota** capacidade em [`22-INVENTARIO-DOCS.md`](22-INVENTARIO-DOCS.md); não pontua.

---

## 5. O estado de LEITURA — a camada que não se recalcula

Tudo acima é **derivado**: `node audit/activity-2/matrix.mjs` reconstrói o veredito de máquina do
zero a cada execução. Isso é o que se quer de um número medido — e é exatamente o que **não** se
pode querer da leitura humana das células. Até 27/08/2026 não havia onde guardá-la: uma sessão que
lesse 63 células e acabasse os tokens **perdia as 63**. Era o bloqueio entre a matriz e o trabalho
que ela existe para habilitar.

[`MATRIX-ESTADO.json`](MATRIX-ESTADO.json) é esse lugar. É **escrito à mão**, é a única parte de
`MATRIX.json` que não é gerada, e vence o derivado.

| campo da célula | quem escreve | vive em |
|---|---|---|
| `veredito` | a máquina, do zero a cada execução | `MATRIX.json` (gerado) |
| `estado` | **a leitura humana** | `MATRIX-ESTADO.json` (à mão) |

Os oito valores, fixados pelo Victor: `PENDING` · `IN_REVIEW` · `CONFIRMED` · `EQUIVALENT` ·
`AUREA_SUPERA` · `AUREA_INFERIOR` · `N/A` · `INCONCLUSIVE`. A chave é **`<capacidade>·<eixo>`**, e
nunca o índice da linha — a ordem muda quando uma fonte entra, e indexar por posição já produziu
um diff falso de 30 células.

### O derivado é sempre `PENDING`, inclusive onde a máquina mediu

É a decisão de desenho que importa aqui, e ela tem evidência atrás. A tentação óbvia era semear o
estado a partir do veredito — `AUREA_INFERIOR` da máquina vira `AUREA_INFERIOR` de leitura, e a
fila cai de 307 para 183 de graça. As duas células do §2 acima mostram por que isso seria falso:

| célula | máquina | leitura | por quê |
|---|---|---|---|
| `input·orientacao` | `AUREA_INFERIOR` | **`EQUIVALENT`** | a orientação existe; mora no `Field` |
| `drawer·aparencia` | `AUREA_INFERIOR` | **`N/A`** | `"permanent or persistent"` é prosa vazando pelo campo de eixo |

Semear do veredito faria essas duas nascerem erradas — e, pior, ninguém as releria: já teriam
estado. **O veredito de máquina é a evidência de ENTRADA da leitura, não a leitura.** São as duas
únicas células que começam com estado escrito, e começam porque foram lidas de verdade em 22/08.

### O que garante que uma leitura não se perde nem apodrece

Três defeitos são possíveis, e os três em silêncio:

| defeito | o que acontece | quem pega |
|---|---|---|
| a mescla não funciona | a próxima execução devolve `PENDING` e a leitura evapora | `tests/unit/matriz-estado.test.tsx` |
| **órfã** | estado à mão para célula que a matriz não produz mais (chave errada, capacidade removida, eixo renomeado) — a leitura existe no arquivo e a matriz não a usa | o teste **e** o check 29 |
| **desatualizada** | a matriz foi regerada, o veredito mudou **por baixo** de uma leitura já feita, e a decisão continua exibida como se a evidência dela ainda existisse | `veredictoNaEpoca` + check 29 |
| **fora de sincronia** | alguém editou o estado e não rodou `matrix.mjs`; os dois arquivos versionados discordam | check 29 |

Os dois controles foram **provados contra o defeito**, não só vistos passando — que é a terceira
regra do `CLAUDE.md`:

- o teste: desligando a mescla ⇒ 2 vermelhos; removendo a detecção de órfã ⇒ 1; desligando a
  detecção de desatualizada ⇒ 1; desligando o vocabulário fechado ⇒ 2.
- o check 29: [`prova-check-29.py`](prova-check-29.py) extrai o bloco do próprio `validate.py` e o
  roda contra sete pares de arquivos corrompidos de propósito, **incluindo o controle negativo**
  (os arquivos reais, intactos, que têm de passar). `python audit/activity-2/prova-check-29.py`.

### Como se lê uma célula

A linha em `MATRIX.json` já traz a evidência das 11 fontes alinhada — **não é para reabrir
inventário**, e isso é metade do trabalho que esta matriz entregou. Decidir, e escrever:

```json
"avatar·aparencia": {
  "estado": "AUREA_INFERIOR",
  "veredictoNaEpoca": "AUREA_INFERIOR",
  "porque": "a mui expõe circular|rounded|square; a Aurea é sempre redonda. …",
  "em": "2026-08-27"
}
```

Depois `node audit/activity-2/matrix.mjs` e versionar a saída. `porque` e `em` são obrigatórios —
estado sem razão e sem data é opinião anônima, e a execução falha sem eles.
