# ADR-0067 — O site segue a documentação da referência

- **Data:** 13/10/2026
- **Estado:** aceita · em construção na `0.32.0` (passo 11).
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
