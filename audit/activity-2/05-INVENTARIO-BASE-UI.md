# Inventário do §9 — `base-ui`

> A primeira das nove a passar do **enumerar** para o **inventariar**. Começou por ela porque é o
> motor que a Aurea já usa: o que estiver aqui responde de imediato "isto já vem de graça?" para
> qualquer linha da fila de gaps.
>
> ```bash
> node audit/activity-2/inventory-baseui.mjs   # escreve INVENTORY-BASE-UI.json
> ```
>
> `mui/base-ui @ 838b084` · MIT · medido em 21/08/2026.

## 1. Por que extraído, e não transcrito

O §9 pede cerca de trinta e oito campos por item. São 47 primitives: transcrever à mão seriam
quase mil e oitocentos campos, e a primeira coisa a acontecer seria amostragem — que o §10 proíbe.

A `base-ui` é regular o bastante para ser lida por máquina, e essa regularidade é ela própria um
achado do §184 ("o que torna esta biblioteca forte?"):

| Campo do §9 | Onde a `base-ui` já o declara |
|---|---|
| anatomia, subcomponentes | `index.parts.ts` — a lista oficial de peças |
| **estados** | 148 arquivos `*DataAttributes.ts`, cada um um `enum` **com JSDoc por membro** |
| props, eventos | `export interface <X>Props` |
| controlado / não-controlado | os pares `value`/`defaultValue`, `open`/`defaultOpen`, … |
| ARIA | `role:` e `aria-*` literais |

Uma biblioteca que declara os próprios estados num enum documentado é uma biblioteca que pode ser
consumida por ferramenta. É o §51 e o §119 da ordem, feitos por outro projeto — e é um dos
"beyond" que o §195 manda procurar: a Aurea tem o `api-surface.json` desde hoje, mas ainda não
tem o equivalente para **estados**.

O que o extrator **não** decide: o que dela entra na Aurea. Isso é o passo 3 do `BUILDING.md`, e
o campo `OBSERVACOES` nasce vazio de propósito.

## 2. O que foi medido

| | |
|---|---|
| Primitives | 47 |
| Documentados pelo próprio projeto | 37 |
| Internos / utilitários do pacote | 10 |
| **Declarações de estado** | **757** |
| Atributos `data-*` **distintos** em todo o motor | **68** |
| Com anatomia composta (mais de uma peça) | 30 |
| Com par controlado / não-controlado | 23 |
| Com contrato de teclado | 28 |
| Demos publicadas pelo projeto | 128 |

## 3. O achado de arquitetura — §184

A primeira medição de teclado deu **13 de 47**, número que não bate com quem já usou um `Select`
ou um `Menu` da `base-ui`. A causa não era o extrator: **o contrato de teclado não mora no
componente.**

Ele mora em internals compartilhados — `internals/composite` para roving tabindex,
`floating-ui-react/useListNavigation` para seta, `useTypeahead` para digitar-para-achar,
`useDismiss` para Escape e clique fora — e **cada primitive delega**. Medido: dos 28 com contrato
de teclado, **15 não escrevem uma única tecla**; tratam tudo por delegação.

É exatamente o que o §22 da ordem manda a Aurea fazer ("mecanismo compartilhado vira primitive,
não cópia"), praticado por quem já tem 47 componentes. O extrator passou a registrar as duas
coisas: o que a peça trata e a quem ela delega.

## 4. O achado que virou correção e trava

Cruzando os 68 estados do motor com os que as fichas da Aurea declaram, e depois com os que o
**core realmente pinta**:

> **De 15 atributos `data-*` que o core estilizava, oito não eram declarados por ficha nenhuma.**

O pior deles: **`data-highlighted`**. O core pinta `.menu-item[data-highlighted]` desde sempre, e
nenhuma ficha dizia que esse estado existe. E ele importa — `highlighted` **não é `hover` e não é
`focus`**: é o item apontado pelo teclado enquanto o foco continua no campo. Num combobox o foco
nunca sai do input, e mesmo assim há um item apontado. Quem trocar por `:hover` quebra a seta para
quem não usa mouse.

Corrigidos: `dragging` (FileInput) · `highlighted` (DropdownMenu, ContextMenu, Combobox,
MultiCombobox) · `read`/`unread` (NotificationCenter) · `orientation` do Toolbar, que **não é
estado** — é eixo, e eixo é variante, então foi para `variants` com `variantProp`, o mecanismo
criado hoje para exatamente isso.

**Trava: o check 27.** Todo `data-*` que o core pinta tem de ser declarado por alguma ficha.
Provado contra o defeito: tirando `highlighted` das quatro fichas, o validador reprova.

### Dois vocabulários, e o gate respeita os dois

O `data-*` é do **motor** (`data-panel-open`); o `states` da ficha é a palavra que a documentação
usa com quem consome (`open`). Exigir igualdade literal corromperia a ficha para agradar o gate.
Então existe uma **tradução explícita** no `validate.py` — curta, que não cresce sozinha, e onde
cada linha é a afirmação de que os dois nomes são a mesma coisa. É o §131: estado tem de ser uma
linguagem consistente.

## 5. O que este inventário ainda não deu

- **O campo `OBSERVACOES` está vazio nos 47.** É o "o que dela entra na Aurea", e é leitura, não
  extração. Ele se preenche por primitive, quando um gap da fila o alcança.
- **Os 53 estados que o motor tem e a Aurea nunca declarou** não foram triados. Alguns são
  claramente de peças que a Aurea não tem (`nested-drawer-swiping`); outros são vocabulário que
  falta — `dirty`, `touched`, `valid` são o quarteto de validação de formulário, e a Aurea só tem
  `invalid`. Isso é candidato a gap e ainda não foi aberto.
- **Dos oito gaps da fila que o motor cobre, quatro seguem abertos**: `scroll-area` (é decisão
  visual e sobe para o Victor pelo §96), `form`, `navigation-menu`, e o `toast` do `G-DOC-01`.
  Os outros quatro — `separator`, `collapsible`, `toggle-group`, `menubar` — fecharam em
  21/08/2026.
