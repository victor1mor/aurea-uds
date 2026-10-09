# ADR-0060 — Cor de categoria no selo, e o KPI com direção

- **Data:** 09/10/2026
- **Estado:** aceita · executada na `0.26.0` (ainda não publicada).
- **Origem:** o Lote L, três pedidos de um consumidor da web (um site de notícias): GAR-07 (cores
  no selo, com nomes universais), GAR-09 (KPI com tendência) junto com a MNT-04 (KPI sem caixa),
  e GAR-10 (caixa de resumo). Escolhas do Victor, depois de ver como a referência principal faz:
  **nome de cor**; o KPI com `direction`, `tone` e `variant="plain"`, e o número do nativo igual
  ao da web; o resumo como **padrão do catálogo**. Aprovado pela bancada (*"aprovado, pode"*).
- **Muda:** a regra do contrato que proibia "paletas alternativas"; 32 tokens novos
  (`category-*` e `category-*-bg`, nos dois temas); o `Badge` (web e nativo) ganha oito valores; o
  `KPI` (web e nativo) ganha quatro props. Nada sai, nada muda de nome.

## A regra

**1. O selo tem oito cores de CATEGORIA, com nome de cor:** `red`, `orange`, `green`, `teal`,
`cyan`, `blue`, `violet`, `pink`. Na web, `variant`; no nativo, `tone` (o vocabulário de cada
alvo, como já era).

- Elas marcam **grupo**, não estado: dizem "Motos" e "Carros", não "deu certo" ou "deu erro".
- **O amarelo fica de fora**: é da marca (seção 5 do `CLAUDE.md`).
- **Não mudam com a marca.** O nome diz a cor; uma marca que trocasse o azul faria o nome mentir.
- As três ênfases (`soft`, `solid`, `outline`) valem sem regra nova: a categoria declara só o
  acento, como os quatro propósitos.
- **Contraste:** todas passam de 4,5:1 nos dois temas, nas três ênfases. A pior é o verde no
  claro, com 4,65:1 (calculado ao escolher; medido no navegador pelo teste).
- **Claridade alternada:** vizinhas na roda de cores alternam dois níveis (no escuro, 0,85 e 0,76;
  no claro, 0,52 e 0,47), para não se distinguirem só pelo matiz. O azul fica no nível escuro de
  propósito: no nível claro do tema escuro ele perde a cor (medido na primeira bancada).
- A cor nunca vai sozinha: o selo de categoria leva a palavra, e o exemplo do catálogo leva o
  ícone no `leading`.

**2. O KPI diz para onde o número foi.**

- `direction`: `up`, `down`, `flat`. Desenha a seta (`trend-up`, `trend-down`, `minus`), pinta a
  tendência e põe uma palavra para o leitor de tela.
- `tone`: `success`, `danger`, `neutral`. O padrão vem da direção (alta é sucesso, baixa é perigo,
  estável é neutro). Existe para quando subir é ruim (custo, erro). **Sem `direction`, `tone` não
  pinta nada**: a cor nunca vem sozinha.
- `directionLabel`: a palavra do leitor de tela. Padrão em inglês ("Up", "Down", "No change"),
  como todo rótulo padrão do pacote web; o app passa na língua da página.
- `variant="plain"`: tira a caixa. O número fica dentro de um cartão que já existe (MNT-04), como o
  `panel="plain"` do `Tabs`.
- A seta fica na **primeira linha** da tendência, quando ela quebra.
- O `trend` continua sendo texto do domínio. Nada do que existia muda.

**3. No nativo, o KPI igual à web:** o número passa de `2xl` (24) para `3xl` (30), o da web desde
a `0.24.1`. A tendência passa de `xs` (14) para `sm` (16): é o tamanho do rótulo, e é a regra do
telefone (ADR-0050, o texto pequeno sobe um degrau). O vão interno sai de token (`--space-1`, 4),
e não mais de `5` cru, nos dois alvos.

**4. A caixa de resumo não é peça nova.** É um padrão do catálogo, na página do `Card`: título curto
e uma lista (`Stack role="list"`, `Cluster role="listitem"`, ícone `check`). Não é o `Alert`: o
aviso anuncia ao leitor de tela, e um resumo espera ser lido.

## As fontes

- **A referência principal** (o pacote web dela na versão atual, lido em 09/10/2026): o selo dela
  tem só as cinco cores de estado, e cor nova só pelo CSS, com nome semântico; ela não tem KPI no
  pacote livre; e não tem caixa de resumo (só o aviso, que é anúncio).
- **A fila de referências** (as páginas abertas, não resumos): a segunda e a terceira têm só
  estados no selo; a quarta usa nome de matiz no selo (o padrão que o Victor escolheu); a quinta
  descreve a tendência como alta, baixa e neutra, com a cor do estado e o número ao lado. Nenhuma
  das cinco tem resumo editorial.
- **Os números das cores são da Aurea:** a referência não tem categoria, então a medida não vem
  dela. Cada valor foi escolhido em OKLCH e conferido contra o fundo, o cartão e o fundo suave dos
  dois temas antes de entrar.

## Na web, a seta é desenho do CSS

O `KPI` é marcação pura (ADR-0026): sem JavaScript no navegador. O `Icon` lê o arquivo de ícones
por um hook, e importá-lo levaria o motor de cliente para dentro de todo `Card`. A seta é o mesmo
desenho do Phosphor, por máscara no CSS — o caminho que o menu do `Header` já usa. No nativo, a
seta é o `Icon` (o app registra `trend-up`, `trend-down` e `minus`, como todo ícone).

## Alternativas rejeitadas

- **Cores numeradas** (`category-1` a `category-8`, como o `--chart-N`): sobreviveriam a uma marca
  que mudasse as cores, mas não são o padrão de mercado. O Victor escolheu o nome de cor.
- **Categoria também na moldura do ícone do nativo** (`Timeline`, `EmptyState`): a da web não tem;
  os dois alvos divergiriam. As categorias ficam no selo.
- **`tone` pintando a tendência sem `direction`:** seria cor sozinha dizendo alta ou baixa.
- **O resumo como variação do `Alert`:** mudaria o papel de anúncio de um componente que existe
  para anunciar.
- **Importar o `Icon` no `KPI` da web:** levaria código de cliente a todo componente de marcação.

## Como ela é obrigada

- `tests/visual/badge-categoria.spec.ts`: as oito cores, nas três ênfases, nos dois temas e nas
  duas marcas, passam de 4,5:1 contra o fundo da página e o do cartão, medido no navegador; cada
  categoria tem cor própria (nenhuma cai no neutro). E o KPI: a seta aparece, tem a cor do tom, e
  fica na primeira linha quando a tendência quebra. Provado contra a `0.25.0`: lá as categorias
  saem neutras e o KPI não tem seta.
- `tests/unit/lote-l.test.tsx` e `tests/unit/native-lote-l.test.tsx`: a web (as classes, a palavra do leitor de tela, o `plain` sem
  `.card`, o `tone` que não pinta sem direção) e o nativo (as cores dos tokens por categoria, o
  número em `text3xl`, o `plain` sem cartão, o nome acessível). Provado contra a `0.25.0`.
- O check 14 cobra os eixos novos nas fichas (`Badge.variants`, `KPI.variants` e `KPI.axes`).

## Consequências

- O consumidor escolhe a cor de cada categoria dele. A Aurea não diz que "Motos" é azul.
- Token novo muda a contagem da barra de cima do catálogo: as fotos `topo` e `tokens` da CI vencem.
- Quem formata dinheiro com espaço comum vê "R$ 12.400" quebrar entre o símbolo e o número numa
  coluna estreita (a web já fazia desde a `0.24.1`). O formatador de moeda do JavaScript usa espaço
  que não quebra.

## Quando rever

Se um consumidor precisar de mais de oito categorias: aí o problema é de forma (filtro, lista), não
de uma nona cor.
