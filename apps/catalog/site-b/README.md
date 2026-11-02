# As páginas do site B, cada uma no seu arquivo

Desde 02/11/2026, cada página do desenho B mora aqui, para várias pessoas (ou sessões) construírem páginas ao mesmo tempo
sem mexer no mesmo arquivo.

- `paginas/<chave>.mjs` — o desenho da página. Exporta, por padrão, uma função `(site, ...o que a página é) => {node, toc}`.
- `css/<chave>.css` — o arranjo dela. Entra no fim da folha do site (`assets/catalog.css`), na ordem do nome do arquivo.
- `js/<chave>.js` — o comportamento dela, quando precisa (script comum, sem `import`). Entra no fim do `assets/catalog.js`,
  que toda página carrega: o arquivo tem de agir só na página dele (procure o elemento dela antes de fazer qualquer coisa).

Sem o arquivo, a página continua a de antes. Quem chama é o `scripts/build-catalog.mjs` (procure "AS PÁGINAS DO SITE B").

## As chaves

| chave | a página | o que a função recebe |
|---|---|---|
| o `nome` do `.md` em `content/docs/` (`quick-start`, `theming`…) | a página da Getting Started | `(site, doc)` |
| `inicio` | `index.html` | `(site)` |
| `componente` | a página de cada componente da web (`button.html`…) | `(site, ficha, indice)` |
| `releases` · `release` | a lista das versões · a nota de uma versão | `(site)` · `(site, release)` |
| `patterns` · `pattern` | a lista · um padrão | `(site)` · `(site, padrao, indice)` |
| `blocks` · `block` | a lista · um bloco | `(site)` · `(site, bloco, indice)` |
| `recipes` · `recipe` | a lista · uma receita | `(site)` · `(site, id, arquétipo, indice, ids)` |
| `hooks` · `tokens` | as páginas dessas áreas | `(site)` |

## O objeto `site`

As ferramentas do gerador: `h`, `Fragment`, `A` (as peças da Aurea), `pedacos`, `linhaMd`, `acoesDaPagina`,
`cabecaDaPagina`, `anteriorProximo`, `textoParaCopiar`, `paraTexto`, `vizinhos`, `demoBlock`, `blocoDeTile`, `secaoB`,
`identidade`, os dados (`fichas`, `docs`, `releases`, `patterns`, `blocks`, `contract`, `tokensDoc`…) e as funções das
páginas de hoje (`docPage`, `componentPage`, `homePage`…), para reaproveitar o que já existe. A lista inteira está no
`build-catalog.mjs`, na linha `const site = {`.

## As regras

- O site é feito **só com a Aurea**: peça que falta se cria na Aurea, nunca aqui.
- Toda medida sai de **token**.
- **Nenhuma peça da Aurea se altera aqui.** O que a página pede de peça já foi aprovado e construído na 0.54.0; se faltar
  outra coisa, pare e pergunte.
- **Nenhum nome de referência** em arquivo nenhum.
- Os arquivos gerados (`apps/catalog/*.html`, `assets/`, `llms*.txt`) **não** se commitam: quem junta remonta.
