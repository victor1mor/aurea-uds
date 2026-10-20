# ADR-0067 — O site segue a documentação da referência

- **Data:** 13/10/2026
- **Estado:** aceita · em construção na `0.32.0` (passo 11). **Ampliada em 17/10/2026** (lote T, `0.35.0`): o arranjo
  de documentação da referência, medido na página dela (a seção "Lote T", no fim).
- **Origem:** três ordens do Victor, de 13/10/2026, olhando o rascunho da página nova na bancada.
  1. O molde do site: *"A, referencia é [a referência principal], com alguns elementos nosso para
     diferencia"* (o nome da biblioteca não se escreve aqui, pela regra do `CLAUDE.md` §2).
  2. Os elementos nossos que entram: **as abas Preview | Code** e **o componente vivo no catálogo**.
     Não entram: a ficha do componente no cabeçalho e a densidade na prévia.
  3. Os títulos do menu e do sumário: *"igual ao dela, pode construir"*.
- **Troca:** a parte da [ADR-0001](0001-modelo-de-pagina-do-catalogo.md) que dizia QUAIS seções toda
  página tem. O resto da ADR-0001 fica: o modelo continua sendo DADO (`scripts/page-model.mjs`), com um
  núcleo comum e extras declarados por tipo, e a varredura continua cobrando o conjunto nas páginas emitidas.
- **A razão nova** (a regra "decisão registrada não se reabre sem evidência nova"): a decisão do Victor de
  seguir a documentação da referência, e a medida do site dela (13/10/2026, a 1440 de largura).

## O que o site dela tem (medido)

- **Topo em duas linhas:** a marca e a versão, a busca no meio, o tema; embaixo, as áreas do site e, à
  direita, a troca Web | Native.
- **Menu à esquerda (~220):** "Overview" e a lista em ordem ALFABÉTICA, item de 36 de altura e letra 14,
  o atual com fundo; os títulos de grupo em letra 14, peso médio, sem maiúsculas; selos "New" e "Updated".
- **Página de componente (912 de largura, 816 úteis):** título 28 com "Copy Markdown" ao lado; a
  descrição; pílulas de atalho; e as seções, nesta ordem: Usage (o import e o exemplo), Examples (um
  título por exemplo), Customization, Styling Reference, API Reference, Related Components; no fim, os
  cartões de anterior e próxima. **Sem trilha, e sem "Installation" na página** (fica no Getting Started).
- **"On this page" à direita (~208):** o título em letra 14, peso normal, esmaecido, com um ícone de lista.
- **Catálogo ("All Components"):** grupos por categoria, grade de 3, cada cartão com a foto do componente
  e o nome.
- **Início:** o título centralizado em duas linhas (a segunda cinza), o texto, dois botões, e uma vitrine
  grande e viva.

## A decisão

**1. A página de item segue a ordem dela.** O núcleo comum passa a ser: `title`, `usage` (com o `preview`
e o `code`) e `prevnext`. Saem do núcleo a `breadcrumb` e a `installation` (a instalação vai, uma vez, para
a página Getting Started). A "Uses" da ADR-0001 vira `related` ("Related Components"): é o mesmo dado, a
proveniência, e passa a ser OPCIONAL em todo tipo — a peça que não compõe nenhuma outra não tem o que
listar (a "Uses" dizia isso numa frase; a referência simplesmente não mostra a seção). Na página de componente, a "Reference" vira "Styling Reference" (`styling`) e
a "API" vira "API Reference"; "Examples" fica. A "Features" sai como seção: os pontos dela entram como
texto do Usage, para nada se perder.

**2. Os dois elementos da Aurea:**
- a caixa de exemplo é a da Aurea, com as abas Preview | Code (o `CodeBlock preview`, decisão de
  06/10/2026), e não a prévia em cima com o código embaixo;
- o cartão do catálogo mostra o componente DE VERDADE, parado (inerte), e não uma foto.

**A logo da Aurea fica** (ordem do Victor, 13/10/2026: *"ainda quero a logo da aurea, não a perca"*): no
topo, as quatro pétalas amarelas ao lado do nome, como no site de antes.

**3. O resto é o dela, com a aparência da Aurea** (a regra da [ADR-0066](0066-a-peca-e-a-da-referencia-e-o-nativo-tem-escala-de-toque.md)):
o topo em duas linhas, o menu alfabético com os selos, o sumário, o catálogo em grade de 3 e o início.

**4. Os títulos de grupo do menu (`Sidebar`) e o título do sumário (`TableOfContents`) ficam como os
dela,** em todo lugar da Aurea e não só no site: letra 14, sem maiúsculas; o do menu em peso médio na cor
do texto, o do sumário em peso normal, esmaecido, com o ícone de lista desenhado pelo CSS (o sumário não
passa a depender do arquivo de ícones).

**5. Os selos saem dos dados, nunca à mão:** "New" é o componente que não está na superfície publicada
(`scripts/released-surface.json`); "Updated" é o que a seção da versão em construção do `CHANGELOG.md`
cita como mudado.

## Fases

- **A** — o molde inteiro, gerado em todas as páginas pelo `scripts/build-catalog.mjs`.
- **B** — as prévias vivas da página de componente (DOC-14).
- **C** — o celular, a busca com grupos (DOC-06/07) e a troca Web | Native.

## Consequências

- A varredura (`tests/visual/catalog-sweep.spec.ts`) e o gerador leem o modelo novo do mesmo
  `page-model.mjs`; a seção fora do modelo continua proibida.
- As fotos `index` e `topo` do catálogo mudam inteiras: regeram-se na CI, olhando cada uma.
- Endereços: a página inicial passa a ser o Início, e o catálogo de componentes vai para
  `components.html`. As âncoras de categoria (`#cat-…`) vão junto.

## Lote T (17/10/2026): o arranjo de documentação

Pedidos do Victor de 17/10/2026, com as fotos da documentação da referência ao lado das nossas (SITE-01 a 10 no
documento de achados), aprovados na bancada (*"aprovado, pode seguir"*). Cada medida foi lida na PÁGINA da referência,
na largura da tela do Victor e a 1440, e repetida como número na prova (`tests/visual/site-docs-arranjo.spec.ts`).

- **A lateral não flutua** (SITE-01): sem caixa, na coluna de 220. Troca a escolha de 13/10/2026 (*"sidebar precisa ser o
  nosso flutuante"*), pela ordem nova dele: *"quero sidebar como da referência, que não seja mais flutuante"*.
- **Tudo num bloco de 1400 no centro** (SITE-02): a lateral, o texto (912, cada bloco até 900) e, de 1280 para cima, o
  índice (240 no começo de uma coluna de 268, alinhado com a ponta direita da barra). A peça: `AppShell layout="docs"`.
- **As áreas na segunda linha da barra, com ícone** (SITE-04), e **a linha de ponta a ponta embaixo** (SITE-05, a
  segunda exceção da [ADR-0072](0072-sem-linha.md)). A peça: `Header tabs`. No celular a linha das áreas rola de lado,
  como a dela.
- **As distâncias da referência:** as colunas começam 16 abaixo da barra e param 32 acima da borda de baixo; o primeiro
  grupo e o título do índice a 24 da barra; na lateral, a cápsula do item a 16 e o texto a 24; o índice sem barra de
  rolagem — a única exceção à regra da barra visível, escolhida pelo Victor (*"escondida sempre"*) entre ela e a da
  lateral, que some parada e volta com o ponteiro. A referência apaga as pontas da lista com degradê — não copiado (a Aurea não tem degradê).
- **A caixa do Usage é o `CodeBlock` padrão** (SITE-08), e **o anterior e o próximo ficam lado a lado**, com a descrição
  numa linha que termina em "…" (SITE-09).
- **Cada área tem a sua lateral, e o anterior/próximo são os vizinhos NELA** — como lá, onde o motor da documentação tira
  os vizinhos da árvore da área. Docs, Hooks e Tokens usavam o menu de Components; as páginas de hook marcam "Hooks".
- **Ficam para o lote U** (decisão do Victor, 17/10/2026): a área Docs completa, com os itens da referência (SITE-03); o
  menu "Copy" completo e o "Copy Prompt" (SITE-06); as notas de versão; e, em tela menor, o que a referência faz e nós
  ainda não — a lateral a partir de 768, a busca em ícone abaixo de 768, o índice em barra fixa entre 1024 e 1279.
  **Depois dele:** a troca Web | Native, à direita (SITE-07), o MCP e a migração.

## Lote U (18/10/2026): a área Getting Started

O SITE-03, com o "pode" do Victor (*"Comece pelo SITE-03, a área Docs"*). A árvore é a da área da referência, lida no
menu dela (o `meta.json` do ramo `v3`): **Overview** e **Handbook**, cada página com o ícone dela na lateral (o
equivalente no Phosphor). O grupo "UI for Agents" entra com o SITE-06, que faz o `llms.txt`.

- **Entram só as páginas com conteúdo de verdade, mais as que o Victor mandou construir.** Ficam fora CLI, MCP e Figma
  (a Aurea não tem nenhum dos três); Showcase e Roadmap entram (*"pq nao?"*, e a escolha dele). No fim do Handbook, quatro
  páginas só da Aurea: Density, Icons, RTL e Accessibility (*"Sim, as quatro"*).
- **O texto mora em arquivo, e não em código:** `apps/catalog/content/docs/<nome>.md`, como os da referência. O mesmo
  texto vira a página e o "Copy Markdown" (e, no SITE-06, o `.md` de cada página). O leitor (`scripts/docs-markdown.mjs`)
  tem vocabulário fechado: o que ele não conhece derruba a montagem, com o arquivo e a linha.
- **Desenhado só com a Aurea:** `Prose` (a pele do texto longo), `CodeBlock`, `Table` (que rola dentro da própria caixa;
  a tabela crua do `Prose` empurrava a página para o lado a 375) e `Link`. Os exemplos vivos (`::: demo`) usam a caixa
  Preview | Code das páginas de componente.
- **O nome:** a aba das áreas diz "Getting Started", como a da referência; no Início, "Docs", como no Início dela.
- **Medido, ainda diferente da referência:** a entrelinha do texto (27 na nossa, 24 na dela) e o espaço acima do título
  de seção (32 e 48). Os dois vêm do `Prose`; vão ao Victor antes de mudar a peça.

### SITE-06 (18/10/2026): o site para assistentes de IA

As ações da página da referência, lidas no código do site dela: o "Copy Prompt" e o "Copy Markdown" com a setinha
("View as Markdown" e os assistentes). Decisões do Victor: **sem os itens do servidor MCP** (entram com ele); o "Copy
Prompt" com **o texto e o ícone da Aurea** (logo de terceiro não entra — §5 do CLAUDE.md); e o `llms-full.txt` com
**tudo**. O texto de cada `.md` é o do "Copy Markdown" (uma fonte); a skill mora em `skills/aurea-uds/SKILL.md`, no
formato Agent Skills, e o `aurea-agents.md` do site é o corpo dela. O nome não é `AGENTS.md` de propósito: um arquivo com
esse nome dentro do repositório seria lido como regra pelos assistentes que trabalham na própria Aurea.

### As notas de versão (19/10/2026): a área Releases

A área da referência: o foguete no topo, depois de Components; "All Releases" com a última no alto; uma página por
versão, com a data e o comando de atualizar. Decisões do Victor: **todas as versões**, em inglês, escritas a partir do
CHANGELOG — que é em português e conta o processo; a nota conta só o que muda para quem usa —, numa **área própria**. A
versão que saiu dentro de outra é uma seção da nota de quem a publicou, como a referência faz com uma beta dela. O comando
de atualizar e os links o gerador escreve; o texto, cada nota. A montagem para se uma versão com data no CHANGELOG ficar
sem nota ou com outra data — e o passo 8 do "Como cada lote anda" (CLAUDE.md) passa a incluir a nota.

### O celular e o tablet (19/10/2026)

Medidos na página da documentação da referência a 375, 768 e 1100, com o "tudo como ela" do Victor. No `AppShell
layout="docs"`: a lateral é coluna desde 768; abaixo, a gaveta abre pelo FIM da barra, onde fica o botão dela (depois das
ações, também na ordem do Tab); abaixo de 1280 o índice é a gaveta de uma barra de 40 presa sob o topo, com o nome da
seção em vista (escrito pelo vigia do índice do `aurea.js`). No site: o topo do celular em duas linhas com a lupa, e a
chave claro/escuro no alto da gaveta. Os botões ficam com os 44 de toque da Aurea (a referência usa 34). E o "Copy Prompt"
volta a ser só das páginas de começar, como na referência (o padrão do mercado, pesquisado: o menu de copiar a página em
toda página; o texto de configuração, onde se configura).
