# A matriz do §13 lida por inteiro — 315 de 315 células

**27/08/2026.** A matriz existia desde 22/08 com a evidência das onze fontes alinhada e **nenhuma
célula lida**.

<!-- PLACAR:INICIO — gerado por matrix.mjs; não editar à mão -->

**315 de 315 células** têm estado, razão e data.

| estado | células | |
|---|---:|---|
| `EQUIVALENT` | **141** | a capacidade está servida — muitas vezes por outra decomposição |
| `N/A` | **97** | a comparação não se aplica, e cada uma diz por quê |
| `AUREA_INFERIOR` | **31** | falta medida, e cada uma tem cartão |
| `INCONCLUSIVE` | **31** | lida, e o que falta MEDIR está escrito |
| `AUREA_SUPERA` | **15** | a Aurea entrega mais, com o argumento e não com a contagem |

<!-- PLACAR:FIM -->

O estado vive em [`MATRIX-ESTADO.json`](MATRIX-ESTADO.json), escrito à mão, e sobrevive a cada
recálculo. O check 29 reprova se as duas camadas se descolarem.

---

## 1. A leitura mudou o número, e o número era do instrumento

Ler as células achou **cinco defeitos de extrator**, e nenhum foi procurado. Todos apareceram
porque uma célula era implausível:

| # | o que a célula dizia | o que era |
|---|---|---|
| 1 | falta à Aurea o estado **`date`** num menu | `group-data-[date=open]` — erro de digitação de `state` no fonte da shark, e cinco extratores mediam `data-*` com cinco réguas |
| 2 | falta à Aurea a tecla **`Enter`** no checkbox | a radix trata `Enter` para **BLOQUEÁ-LA** (`preventDefault`), como a WAI-ARIA manda |
| 3 | falta ao `Select` a **orientação** | a base-ui a declara em `SelectSeparatorProps` — a **sub-peça** |
| 4 | **só a Aurea** tem tamanho no `select` | um `else` **pendurado** engolia os campos planos de 17 itens |
| 5 | a Aurea não emite **`label`**, `invalid`, `selected` | quatro extratores comiam o prefixo `aria-` |

Cada correção virou um módulo compartilhado com fixture provado contra o defeito:
[`data-attrs.mjs`](data-attrs.mjs), [`teclas.mjs`](teclas.mjs), [`eixos.mjs`](eixos.mjs),
[`aria.mjs`](aria.mjs).

**Dois deles invertiam o SINAL da célula** — não era ruído, era o contrário do que a evidência
dizia. E o quarto errava para **menos**, a direção que faz a Aurea parecer melhor do que foi
medida.

---

## 2. A leitura achou dois defeitos de produto, e um deles é WCAG

Nenhum dos dois estava sendo procurado.

**`G-A11Y-10` — o botão da etapa do `Stepper` não recebia foco.** `.step-trigger` tinha
`display:contents`, e um `<button>` sem caixa não recebe foco: a etapa clicável só funcionava com
o mouse. Falha de **WCAG 2.1.1**. E a regra contradizia o comentário escrito acima dela quando a
peça foi feita — *"o alvo é um botão de verdade, com o foco do sistema"*. **Corrigido**, com o
banco que o pega.

**`G-A11Y-11` — o `Card` diz "clicável" e não dá caminho de teclado.** `variant="interactive"`
entrega ponteiro de mão e elevação no hover numa `<div>` sem `tabIndex`, sem `role`, sem teclado —
e o próprio catálogo renderiza `<div class="card card-interactive">`. Um design system que oferece
a aparência sem a semântica entrega a armadilha pronta.

---

## 3. E o teclado que ninguém tinha medido

O `G-A11Y-07` achou que a ficha do `DataGrid` prometia `role: "grid"` e quatro setas **que não
existiam**. A pergunta obrigatória — *quem mais tem esse problema?* — foi medida: **29 de 41
fichas declaravam teclado sem nada atrás.**

O banco foi de **8 para 26 seções**, e a medição achou o que se espera de listas escritas de
memória: `TreeView`, `ContextMenu`, `Sidebar`, `ToggleGroup`, `Toolbar`, `SegmentedControl` e
`Combobox` **entregavam teclas que a ficha não declarava**. Hoje são **27 de 41 medidas**, e as 14
restantes estão nomeadas no check 30 com motivo e **teto que só desce**.

---

## 4. O padrão que a leitura nomeou: `G-API-02`

Cinco leituras independentes chegaram ao mesmo lugar — **o motor entrega e a Aurea não passa
adiante**: o intervalo do calendário, o `activateOnFocus` do `Tabs` (passado **fixo em `true`**),
as 19 peças do `Menu` reduzidas a um `items` fechado, as 28 do `Combobox`, o `ScrubArea` do
`NumberField`.

E o cartão diz também o que **não** é: `Dialog`, `Popover`, `Drawer`, `Card`, `Toolbar` e
`ButtonGroup` recebem `children`, e ali a API simples é escolha boa. O teto é o `items: T[]` com
`T` fechado — e ele é invisível até alguém precisar passar por ele.

---

## 5. As três regras que esta leitura pagou para aprender

**Número implausível é instrumento quebrado.** Cinco defeitos de extrator saíram daí. *"Sete
referências, e nenhuma com escala de tamanho no `select`?"* — era o `else` pendurado.

**Leitura surpreendente é leitura incompleta.** `stack·orientacao` foi escrita `AUREA_INFERIOR`
com a frase *"a falta mais surpreendente desta leitura"*. Um `grep` achou o `Cluster`, que é a
linha horizontal ao lado do `Stack` vertical. A surpresa era o sinal de que a conferência não
tinha terminado.

**Instrumento que erra em silêncio mede o vizinho.** Um seletor que não casava fez o probe medir a
aba do banco anterior — e foi assim que o `DataGrid` "provou" não ter teclado. A conclusão estava
certa; **a evidência, não**. Hoje há asserção de foco, e foi ela que achou o `G-A11Y-10`.

> E o mecanismo pegou a própria leitura: ao escrever as 62 últimas células em lote, seis saíram
> com o `veredictoNaEpoca` errado. O check as marcou como desatualizadas na primeira execução
> seguinte. **O controle funcionou contra quem o escreveu**, que é a única prova que vale.

---

## 6. O que fica aberto, e é honesto que fique

As **31 `INCONCLUSIVE`** não são "vemos depois": cada uma diz o que falta medir.

- **24 de `aria`** — atributos como `aria-expanded` e `aria-controls` só existem no estado
  ABERTO, e `AUREA-ARIA.json` mede um render padrão. O que resolve: medir o estado aberto, como o
  banco de teclado passou a fazer com o `ContextMenu`.
- **7 de `teclado`** — o lado da Aurea é medido no navegador; o das referências não existe no
  inventário, e elas **declaram** teclado em vez de medi-lo. O que resolve: medir a referência com
  o mesmo banco. Não vai ser afirmado sem medir.
