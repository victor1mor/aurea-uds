# §9 — inventário da HeroUI (primeira fonte EXTERNA do §3)

**Gerado por** `node audit/activity-2/inventory-heroui.mjs` → [`INVENTORY-HEROUI.json`](INVENTORY-HEROUI.json).
**Medido em** 22/08/2026 · `@heroui/react` **3.2.4** + `@heroui/styles` **3.2.4** · **Apache-2.0**.

---

## 0. Correção de registro, antes de tudo

Eu havia escrito, em três lugares desta pasta, que as sete fontes externas *"exigem rede"* — como
se isso fosse impedimento. Fui conferir: **a rede funciona neste ambiente.**
`untitledui.com` devolve 301, `heroui.com` e `ui.shadcn.com` devolvem 200, e `npm pack` baixa
pacote. O que faltava era **fazer**, não poder. As outras seis continuam pendentes por tempo, e o
motivo agora está escrito certo.

## 1. O método, e por que não é raspar o site

As nove locais foram medidas no **código**. Medir a externa pela prosa da documentação produziria
uma coluna que não se compara com as outras — e o §15 já ensinou o que acontece quando se compara
coisa de natureza diferente. Então a HeroUI entra pelos **pacotes publicados**, que é código, e
pelos mesmos campos.

**Dois pacotes, e isso é o achado do método.** `@heroui/react` tem os componentes;
`@heroui/styles` tem os **eixos** (`tv({variants:{…}})`, tailwind-variants). Medir só o primeiro
concluiria que *a HeroUI não tem variante nenhuma*. O segundo publica o **fonte TypeScript**, então
os eixos saem declarados, não inferidos.

E houve uma armadilha antes dessa: os dois tarballs do npm extraem para `package/`. Extrair ambos
no mesmo lugar **mistura os dois pacotes** — foi o que aconteceu na primeira tentativa, e o
`package.json` vinha de um enquanto os arquivos vinham do outro. Só apareceu porque o conteúdo não
fazia sentido (um pacote importando a si mesmo).

## 2. O controle do extrator, que já pagou

A primeira versão do parser relatou, para o botão, `size: [md, sm]` e `variant` com seis valores.
O fonte, lido a olho, tem `size: [lg, md, sm]` e **sete** variantes, mais o eixo `isIconOnly`
inteiro. Ele perdia **o primeiro valor de cada eixo** — um `^` sem `\s*` numa expressão regular.

Efeito na medição: **6 eixos inteiros e 2 componentes** a menos.

| | antes do controle | depois |
|---|---:|---:|
| componentes com eixo declarado | 55 | **57** |
| nomes de eixo distintos | 17 | **23** |

Por isso o script agora falha se discordar de `button.styles.ts`, que foi conferido linha a linha.
**Quarta vez nesta auditoria que um extrator erra para menos** — e a única que não custou uma volta
inteira, porque desta vez o controle veio junto.

## 3. O que a HeroUI é

| | |
|---:|---|
| **85** | componentes publicados |
| **57** | com eixo declarado no pacote de estilos |
| **72** | construídos sobre `react-aria-components` |
| **1** | sobre Radix (`avatar`) |
| **23** | nomes de eixo distintos |

Os eixos: `align`, `animationType`, `color`, `fullWidth`, `hideScrollBar`, `isAttached`,
`isDetached`, `isDisabled`, `isIconOnly`, `isInvalid`, `isRequired`, `layout`, `orientation`,
`placement`, `scroll`, `shape`, `showDots`, `size`, `status`, `truncate`, `type`, `variant`,
`weight`.

**A aposta de motor é a mesma forma da nossa, com outro nome.** A Aurea põe comportamento na Base
UI; a HeroUI põe em `react-aria-components`. 72 de 85 — não é uma biblioteca que escreve o próprio
teclado, é uma que escolheu um motor e vestiu.

## 4. Confronto com a Aurea

Depois do mapa de sinônimos (conferido um a um) e da remoção do ruído — namespace de reexport
(`rac`), peça interna (`close-button`, `menu-item`) e primitivo de composição sem contraparte de
peça (`field-error`, `description`):

| | |
|---:|---|
| **61** | capacidades na HeroUI |
| **90** | fichas na Aurea |
| **20** | só na HeroUI |

E as 20 não são vinte itens soltos — são **quatro famílias**:

| família | itens | |
|---|---|---|
| **Cor** (6) | `color-area`, `color-field`, `color-picker`, `color-slider`, `color-swatch`, `color-swatch-picker` | a Aurea não tem nada disto |
| **Data e hora** (5) | `date-field`, `date-picker`, `date-range-picker`, `range-calendar`, `time-field` | a Aurea tem `Calendar` e nenhum campo |
| **Formulário** (3) | `fieldset`, `form`, `switch-group` | `fieldset` **corrobora o `G-AXIS-02`**, que já estava aberto |
| **Outros** (6) | `alert-dialog`, `link`, `meter`, `progress-circle`, `scroll-shadow`, `tag-group` | `progress-circle` já constava do backlog |

### O que este inventário fecha, e não abre

**`G-AXIS-03` ganha uma quinta medição, e desta vez a favor.** A HeroUI declara `orientation` em
**6** componentes (`button-group`, `scroll-shadow`, `separator`, `switch-group`,
`toggle-button-group`, `toolbar`); a Aurea, depois do `G-AXIS-03`, declara em **7** (`ButtonGroup`,
`Field`, `Menubar`, `Separator`, `Tabs`, `ToggleGroup`, `Toolbar`). A família era real, e o lado
que dependia de exposição está fechado.

## 5. Limites, declarados

- **Teclado e ARIA não estão medidos.** Eles moram no `react-aria-components`, num terceiro
  pacote, e afirmá-los a partir do que a HeroUI importa seria o mesmo erro que a primeira versão
  da matriz do §13 cometeu. O JSON traz `primitivesReactAria` por componente, que é a evidência
  para quem for medir.
- **Composições não estão contadas.** O pacote publicado não traz exemplos, e o número do
  `G-COMP-01` para as outras quatro fontes veio de manifesto ou de pasta de exemplos. Contar zero
  aqui seria mentir por ausência de dado — a coluna fica **`INCONCLUSIVO`**, não vazia.
- **Seis fontes externas continuam pendentes:** `21st.dev`, `Untitled UI` (web), `MUI` (site),
  `Radix` (site), `ReUI` (site), `shadcn/ui` (site) e `Shark UI` (site). Para cinco delas o código
  local já foi inventariado; o que falta é a camada de documentação, que traz o que o código não
  mostra (§11).
