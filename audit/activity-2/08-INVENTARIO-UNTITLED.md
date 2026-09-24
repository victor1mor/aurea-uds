# Inventário do §9 — `untitleduico/react` (Untitled UI React)

> Quarta das nove. O `BUILDING.md` §1 a aponta como a referência de *"escala de tamanhos,
> proporção, estados que a gente não lembrou"* — e foi dela que saiu o `G-FORM-01`. É a fonte a
> consultar quando a pergunta é **proporção**.
>
> ```bash
> node audit/activity-2/inventory-untitled.mjs   # escreve INVENTORY-UNTITLED.json
> ```
>
> `untitleduico/react @ 548c28a` · MIT · medido em 21/08/2026.

## 1. Cada referência declara de um jeito, e a diferença já rendeu quatro vezes

| Referência | Como declara | O extrator infere? |
|---|---|---|
| `base-ui` | 148 enums `*DataAttributes.ts`, JSDoc por membro | não |
| `radix` | inline no JSX, `data-state={open ? 'open' : 'closed'}` | sim: valor e descrição |
| `mui` | 118 `<nome>Classes.ts`, e o JSDoc diz **de que tipo** é cada membro | não, nem o tipo |
| **`untitled-ui`** | união literal na prop (`size?: "sm" \| "md"`) + objeto `sortCx` com a receita de cada degrau | não, para tamanho |

A união literal é o **contrato**; o `sortCx` é a **implementação**. Extrair os dois responde o que
interessa nesta fonte: quantos degraus, e o que muda em cada um.

## 2. O que foi medido

| | |
|---|---|
| Componentes | 34 (base 17 · application 12 · foundations 5) |
| Com escala de tamanho declarada | 15 |
| Escalas distintas | 6 |
| Sobre `react-aria-components` | 19 |

### As escalas, por frequência

| Vezes | Escala |
|---:|---|
| 6 | `sm · md` |
| 4 | `sm · md · lg` |
| 2 | `sm · md · lg · xl` |
| 1 | `md · lg` |
| 1 | `xs · sm · md · lg` |
| 1 | `xs · sm · md · lg · xl · 2xl` |

**A escala mais comum tem dois degraus, não cinco.** A Aurea dá cinco ao botão (`xs…xl`) e três
ao campo. Não é defeito — é uma diferença de filosofia que vale ter registrada quando alguém
propuser mais um degrau.

## 3. Um quarto motor no quadro — §184

19 dos 34 rodam sobre **`react-aria-components`**, da Adobe. Somando as leituras: a Aurea usa
Base UI; a `radix` é a origem do headless; a MUI tem motor próprio; a Untitled UI usa React Aria.
Quatro linhagens de comportamento, e a Aurea consome uma delas.

O `INVENTORY-UNTITLED.json` registra, por componente, **qual primitive do React Aria ele
envolve** — é o dado que responde "isto é comportamento dela ou do motor?" sem abrir o arquivo.

## 4. O achado que virou correção

Cruzando as escalas dela com as nossas, **sete componentes da Aurea aparecem sem escala onde ela
tem**: `EmptyState`, `Pagination`, `Table`, `Tabs`, `Checkbox`, `Radio`, `Switch`.

Os três últimos foram primeiro, porque são os que dividem a linha de formulário com o `Input` —
que já tinha ganhado escala no `G-FORM-01`. E medindo o core apareceu um problema **maior que a
escala**: a marca de seleção era `18px` cru e o trilho do switch `42×24px` cru, então os três
**não acompanhavam a densidade** enquanto todo o resto da linha acompanhava.

É o achado **A1** de 26/07/2026 outra vez — o mesmo defeito que foi pego no `SegmentedControl` —,
num lugar onde ninguém tinha olhado desde então. Fechado em `G-FORM-03`, sem trocar um pixel em
`comfortable`.

Os outros quatro (`EmptyState`, `Pagination`, `Table`, `Tabs`) seguem abertos.

## 5. O que este inventário ainda não deu

- `OBSERVACOES` vazio nos 34.
- A Untitled UI é a referência que o `BUILDING.md` aponta para **`table`, `file-upload` e
  `date-picker`** — três famílias que a Aurea tem parcialmente ou não tem. A leitura dirigida a
  elas ainda não foi feita.
- Comparar **o que cada componente faz** continua sendo a matriz do §13, que não existe.
