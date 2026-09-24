# A camada de DOCUMENTAÇÃO — §11 · o que o código não mostra

**22/08/2026** · quatro fontes lidas da web, com extrator próprio e controle próprio.

O §11 da ATIVIDADE-2 manda inventariar a documentação **além** do código, e o Victor reforçou ao
aprovar o eixo responsivo: *"não quero somente `Fonte X possui 84 componentes`. Quero descobrir
capacidades. Não reduza a fonte ao que o extrator consegue medir."*

A primeira página lida provou o ponto em dez minutos. O resto deste documento é o que veio depois.

---

## 1. O achado que paga a leitura sozinho

Na página do `input-group` da **shadcn/ui**, em prosa, fora de qualquer prop, `.d.ts` ou classe:

> *"For proper focus management, `InputGroupAddon` should always be placed **after**
> `InputGroupInput` or `InputGroupTextarea` in the DOM. Use the `align` prop to **visually**
> position the addon."*

A shadcn **conhece** o problema que a Aurea acabou de corrigir no `G-A11Y-06` — `align` posiciona
o desenho e não o documento — e resolve por **convenção que o autor precisa lembrar**.

E a convenção não fecha. Se o adorno está sempre **depois** do controle no DOM e
`align="inline-start"` o desenha **antes**, então um adorno focável no início fica
sistematicamente fora da ordem de foco. A regra protege o caso do ícone decorativo e falha
exatamente no `InputGroupButton` em posição inicial — que a própria shadcn documenta como uso.

| | shadcn/ui | Aurea (desde 22/08/2026) |
|---|---|---|
| dimensões | `align` achata ordem lógica + geometria | `side` (estrutural) e `layout` (visual), separados |
| ordem no DOM | responsabilidade do autor, por convecção escrita | o `InputGroup` **coloca** os filhos |
| mecanismo visual | `order` no CSS | nenhum — a ordem visual **é** a do DOM |
| garantia | documentada | **estrutural**: o estado defeituoso não é representável |
| verificação | nenhuma | 7 casos × 3 motores + varredura sistêmica de ordem de foco |

**Um inventário que só lesse código concluiria que as duas têm a mesma capacidade.**

---

## 2. O que cada fonte publica

| fonte | páginas | com achado de prosa | método |
|---|---:|---:|---|
| **shadcn/ui** | 67 | 55 | docs por componente |
| **MUI Material** | 60 | 45 | docs por componente |
| **Untitled UI** | 79 | 19 | docs por componente |
| **Shark UI** | 86 | 69 | docs por componente |
| **ReUI** | 23 | 13 | docs por componente (`/docs/components/base/<slug>`) |
| **21st.dev** | 76 | 18 | diretório de comunidade; licença item a item (§192) |

**Correção de registro:** a Untitled UI estava como `PENDING` com a nota de que *"o pacote npm é só
a CLI e os componentes não são publicados"*. Isso era verdade sobre o **npm** e virou, no
registro, uma conclusão errada sobre a fonte. A web publica **79** componentes.

---

## 3. Capacidades que só a documentação revela

### MUI — o mesmo problema que a Aurea acabou de resolver, resolvido de outro jeito

`useMediaQuery` tem página própria, e as seções dela são um mapa do problema:

```text
Basic media query · Using breakpoint helpers · Using JavaScript syntax ·
Testing · Client-side only rendering · Server-side rendering · Migrating from withWidth()
```

São exatamente as perguntas que o `G-AXIS-06` teve de responder. A diferença é a resposta: a MUI
resolve **sempre em JavaScript**, e por isso precisa de uma seção para renderização só no cliente
e outra para SSR. A Aurea resolve em **CSS por padrão** e em runtime **só** onde a semântica
depende disso — e a ficha declara qual dos dois (`responsive: {prop: visual|behavioral}`), com
gate derivando a natureza do código.

**Onde a Aurea supera:** valor simples não paga nada — nem `matchMedia`, nem observer, nem estado.
Medido e com teste. **Onde a MUI está à frente:** `useMediaQuery` é público, documentado e tem
seção de **teste**; o `useValorResponsivo` é público mas ainda não tem receita de teste publicada.

Outras capacidades documentadas que a Aurea não tem, ou não declara:

- **`Stack` com "Responsive values"** e **`Grid` com span por breakpoint** — eixo responsivo em
  primitives de layout. A Aurea tem a camada, mas `Stack`/`Grid` ainda não a usam.
- **`Tooltip` no toque**: *"On mobile, the tooltip is displayed when the user longpresses the
  element and hides after a delay of 1500ms."* Comportamento de toque **documentado com número**.
- **`Drawer`**: *"Some low-end mobile devices won't be able to follow the fingers at 60 FPS."*
  Limitação de desempenho declarada — a Aurea não declara nenhuma.
- **`Modal` → seção "Limitations" → "Focus trap"**, e **`Pagination`**: *"items are in tab order,
  with a tabindex of 0"*. Teclado e foco documentados por componente.
- **`Stepper`** com tipo **Mobile** entre os tipos de passo.

### Untitled UI — a11y como contrato repetido, e uma camada que a Aurea não tem

A prosa de acessibilidade é **padronizada por componente**: *"supports keyboard navigation (arrow
keys to navigate, Enter to select, Escape to close), proper ARIA attributes, focus management, and
screen reader compatibility"*. Não é mais informação que a ficha da Aurea traz — a ficha declara
`a11y.keyboard` item a item e é **gateada contra o comportamento medido**, o que a prosa não é.

O que a Untitled tem e a Aurea **não**: **templates** (`dashboards`, `dashboards-02`, seções de
página, `404-sections`). A Aurea tem 8 blocks e 23 recipes; template de página inteira é outra
coisa, e está fora do inventário atual.

### shadcn — as seções são o mapa de capacidade

A página do `input-group` publica, como seções: `Composition` · `Align` · `Icon` · `Text` ·
`Button` · `Kbd` · `Dropdown` · `Spinner` · `Textarea` · `Custom Input` · **`RTL`** ·
`API Reference`. Uma seção de **RTL por componente** é declaração de suporte que a Aurea faz por
teste (`rtl.spec.ts`) e **não** por documentação.

E o `attachment` documenta: *"An AttachmentGroup scrolls horizontally... keyboard users reach
off-screen items by tabbing to them."* — rolagem horizontal com alcance por teclado. A Aurea tem
o `G-CAP-23` (attachment) **aberto**, e isto é insumo direto para ele.

### ReUI — a fonte mais densa, e uma classe de capacidade que a Aurea não tem

23 componentes, mas de escopo muito maior que o das outras: `data-grid` (TanStack Table v9, com
ordenação, filtro, paginação, linhas de rodapé, arrastar-e-soltar, **virtualização**, rolagem
infinita e fixação de linha), `event-calendar` (mês/semana/dia/N-dias/agenda, agendamento por
arraste, **eventos recorrentes**, **fusos horários**), `gantt` (painéis de árvore e linha do tempo,
escalas de dia a ano, zoom, arraste e redimensionamento), `kanban`, `sortable`, `tree`, `cascader`,
`filters`.

Duas coisas que só a prosa diz, e as duas são capacidade:

**Alternativa de teclado ao arraste.** Em `filters`: *"o punho de arraste, um soltar de ponteiro,
**Alt com as setas** e o menu da linha"* — quatro caminhos para a mesma ação de reordenar. A Aurea
não tem nenhum componente com arraste, então não tem o problema — mas quando tiver, esta é a
referência de como não deixar a operação só no ponteiro.

**Headless de verdade, testável sem navegador.** Em `filters`: *"oito dessas nove não tocam no DOM
tampouco, que é o que permite a consulta, o catálogo de operadores e a máquina de passos serem
testados num ambiente node sem navegador"*. A Aurea separa pele de motor, mas a lógica que
existe mora dentro de componentes React — não há uma camada de lógica pura testável em node.
**Capacidade ausente**, e vale um cartão quando a matriz for atualizada.

### Shark UI — o eixo responsivo, resolvido de um terceiro jeito

86 componentes, e a comparação mais direta que apareceu em toda a camada de documentação:

**O `Field` do Shark tem `orientation: "vertical" | "horizontal" | "responsive"`** — um terceiro
valor **dentro do enum**. É o `G-AXIS-02` (campo responsivo) resolvido por um valor mágico: o
componente decide sozinho o que "responsive" significa, e o consumidor não diz nem o ponto nem o
mensurável. A Aurea resolveu o mesmo problema com `Responsive<T>`, que **obriga** a dizer os dois
(`{base, viewport}` ou `{base, container}`) e proíbe os dois juntos por tipo.

**Onde a Aurea supera:** o valor mágico não diz a que responde — exatamente a ambiguidade que o
Victor mandou eliminar (*"não quero que `md`, `lg` etc. tenham semântica ambígua dependendo do
contexto"*). **Onde o Shark é mais simples:** para o caso comum, `"responsive"` é uma palavra
contra um objeto.

**E o resto do Shark é o oposto do eixo da Aurea.** A frase que se repete em 17 páginas é *"você
pode usar utilitários de breakpoint para mudar o espaçamento interno em tamanhos de tela
diferentes"* — ou seja, o consumidor escreve `md:[--space:--spacing(5)]` à mão, por componente.
É precisamente o *"47 adaptações manuais independentes"* que o Victor proibiu ao abrir o
`G-AXIS-04`. A Aurea tem eixo tipado em 27 props; o Shark tem uma convenção de Tailwind.

**Um achado importado, conferido na Aurea — e ela está limpa.** O `collapsible` do Shark
documenta que elementos interativos dentro da área recolhida saem da ordem de tabulação. É o mesmo
problema do `G-A11Y-06` um andar acima: conteúdo escondido que continua focável. Medido nas
páginas construídas de `collapsible`, `accordion`, `tabs`, `drawer`, `dialog`, `popover` e
`dropdownmenu`: **nenhum tab stop fantasma**.

> **Quarta armadilha de instrumento, registrada.** A primeira versão do detector acusou um botão
> em **todas as sete** páginas — o `nav-toggle` do chrome do catálogo. Uniformidade assim é sinal
> de instrumento, não de defeito: faltava excluir `display:none`, que **já** tira da ordem de
> tabulação. Elemento ausente não é tab stop fantasma.

---

## 4. O extrator, e o controle dele

`audit/activity-2/inventory-docs.mjs`, sob a regra do
[`04-PROTOCOLO-IA.md` §1b](../2026-07-26-integral/04-PROTOCOLO-IA.md).

```text
O QUE EXTRAI   páginas existentes · seções (da ESTRUTURA, não do texto) · árvore de
               composição · frases por assunto (foco, teclado, ARIA, responsivo, toque,
               composição, acessibilidade)
FONTE          a web, com cache em disco e 400ms entre requisições
LIMITAÇÕES     cobre a parte MECÂNICA. A leitura humana continua obrigatória — este documento
               §1 e §3 são ela, e não saíram do extrator
CONTROLE       resposta CONHECIDA por fonte, vinda do inventário de CÓDIGO que já existe.
               shadcn: a frase de gestão de foco + as seções `Composition` e `Align`.
               MUI: `contained`/`outlined`/`variant` do Button, que o código já mediu.
PROVADO        o controle reprovou TRÊS defeitos do extrator, um atrás do outro:
                 1. cabeçalho lido do texto achatado colava o conteúdo anterior no título
                    (`InputGroupText Align`, `View Code inline-end`)
                 2. corrigido para ler `<h2>` da estrutura — e o `#` da âncora vinha junto
                 3. sem tirar `<script>` antes das tags, o Next.js embute a página de novo
                    dentro de `self.__next_f` e todo trecho aparecia duplicado
```

Nenhum dos três teria quebrado nada: os três produziriam um inventário **plausível e menor**, que
é como os cinco defeitos anteriores desta atividade nasceram.

---

## 5. O que fica em aberto

- **21st.dev** — 🛑 **COLETA CONGELADA** por decisão do Victor (22/08/2026), depois de as 76
  páginas já terem sido lidas: *"não continue coleta automatizada dessa fonte até revisar e
  registrar as restrições de uso/termos dela"*. Catálogo de comunidade, licença **item a item**
  (§192). Nada dali entrou em código, desenho ou matriz, e nenhuma requisição nova sai antes da
  revisão dos termos. Ver `02-FONTES.md` e o `HANDOFF.md` §18.
**Nada.** As cinco camadas de documentação estão feitas (26/08/2026). A 21st.dev está congelada
por decisão — ver §5 abaixo.

O que faltava era o **padrão de URL** das duas últimas, e as duas foram descobertas medindo o
índice em vez de adivinhando:

```text
ReUI       /docs/components/base/<slug>     ← a FAMÍLIA vem no caminho
Shark UI   /docs/components/<slug>
```

O ReUI tinha ficado `PENDENTE` porque o extrator estava apontado para `/docs/<slug>`, que devolvia
0 casamentos — e ele **falhou em vez de devolver zero em silêncio**, que é o comportamento que a
regra do §1b pede. O que a varredura errada trazia eram páginas de conteúdo (`changelog`,
`agent-skills`, `cursor`), nenhuma de componente.

---

## 6. O que a matriz viu, e o que ela NÃO deve ver

Ao recalcular a matriz com o inventário completo (26/08/2026), apareceu um defeito que não era da
documentação: **a matriz ignorava dois inventários de CÓDIGO.**

A lista de fontes dela era fixa, com 9 entradas, e `ls INVENTORY-*.json` traz 17 arquivos. A
**HeroUI** (85 componentes) e a **Radix Themes** — inventariadas em 22/08 e as duas com licença e
método registrados — nunca entraram. Lista fixa não reclama do que falta.

**Corrigido, e com controle:** a matriz agora **falha** se existir um `INVENTORY-*.json` de código
fora da tabela. Provado removendo a HeroUI da lista — reprova nomeando o arquivo.

### O efeito das duas fontes, medido antes e depois

```text
                 antes   depois
AUREA_INFERIOR      61       58
REQUER_LEITURA     180      183
AUREA_COBRE          3        3
SO_AUREA            18       18
INCONCLUSIVO        45       45
total              307      307
```

> **Remedido em 27/08.** Esta tabela publicava `98 → 94` e `202 → 205`. Os dois lados vinham do
> mesmo instrumento recursivo, que contava as **59 linhas de rollup** junto com as células — daí
> um total de `366` para 59 capacidades, que dá 6,2 eixos por capacidade e nenhuma linha tem
> tantos. A direção da mudança estava certa; a escala, não. A armadilha está registrada no §7 do
> `HANDOFF.md`, com a tabela que separa os dois níveis.

Três células mudaram de veredito, e as três do mesmo jeito:

```text
slider·orientacao    AUREA_INFERIOR → REQUER_LEITURA
tabs·orientacao      AUREA_INFERIOR → REQUER_LEITURA
menubar·orientacao   AUREA_INFERIOR → REQUER_LEITURA
```

A Radix Themes declara `eixosResponsivos`, e isso acrescenta uma dimensão que a regra mecânica não
resolve sozinha: deixa de ser "a Aurea tem menos" e passa a ser "precisa de leitura". É o
comportamento certo — a matriz não deve decidir o que não mediu.

> **Quinta armadilha de instrumento, registrada.** O primeiro diff entre as duas matrizes acusou
> **30** células mudadas, nos dois sentidos na mesma linha. Impossível: acrescentar fonte não
> inverte veredito para os dois lados ao mesmo tempo. Eu estava indexando as linhas por
> **posição** (`linhas[1]`), e a ordem mudou — então comparei capacidades diferentes uma com a
> outra. Chaveado pelo **nome** da capacidade, o número real é **3**.

### Por que a documentação NÃO vira linha de matriz

Os cinco `INVENTORY-DOCS-*.json` **não** entram na tabela de fontes, e é decisão, não esquecimento
— o controle novo os exclui explicitamente.

Eles medem outra coisa: páginas, seções e prosa. A matriz compara **capacidade × capacidade**
entre implementações. Cruzar as duas naturezas é exatamente a armadilha do §15 — a mesma que já
fez esta matriz concluir *"inferior em 59 de 59"*, que era falso. A documentação **anota**
capacidade (é o §1 e o §3 deste documento); ela não pontua.
