# ADR-0076 — No tema claro, a letra de destaque é o azul da marca; o amarelo continua a marca

- **Data:** 20/10/2026
- **Estado:** aceita · feita na branch `claude/amarelo-azul`, para a `0.37.0`. **Substitui o item 1 e a seção "O custo,
  escrito" da [ADR-0073](0073-no-claro-a-letra-de-destaque-e-o-amarelo-da-marca.md)**; o resto dela continua valendo.
- **Origem:** a sessão do app, adotando a `0.36.0`, mediu no tema claro a letra de destaque amarela: links e o nome a
  1,75:1, a aba escolhida a 1,91:1, o selo "PRINCIPAL" a 1,6:1. O Victor: *"estamos abaixo do mínimo?"* — sim (a WCAG
  1.4.3 pede 4,5:1 para texto). Depois: *"vamos reabrir que quero que me de novas sugestões"*, com três duplas de cor que
  ele achou na internet. Viu seis caminhos rodando, numa bancada com as peças da Aurea nos dois temas e o contraste
  medido nos fundos de verdade, e escolheu: *"Amarelo + azul"*. E: *"Pode fazer o Amarelo + azul agora, antes do passo 2
  do lote 1, com a bancada antes do git."*

## O que a pesquisa achou

Uma referência de cada vez: o que já estava anotado (a dissecação de temas e cores), a referência principal, e depois
os outros sites.

- **Nenhuma fonte usa o amarelo vivo como letra no tema claro.** Todas usam o amarelo como fundo, com letra escura por
  cima. Na referência principal, nenhum tema pronto resolve: o azul padrão dela reprova como letra (3,38:1), e os temas
  claros dela, como o céu e a menta, ficam entre 1,53 e 1,76:1.
- **O amarelo que passa 4,5:1 vira ocre**, nos sistemas de cor consultados — a família do ouro escurecido da ADR-0054,
  que o Victor tinha recusado.
- **Quem tem marca amarela escreve com outra cor.** A Mailchimp e o Snapchat, com a letra quase preta e sublinhada; a
  IKEA, com o AZUL, a segunda cor da marca.

## A regra

1. **A marca continua amarela.** O amarelo é o fundo cheio (o botão primário, o selo cheio), o controle marcado, o traço
   das abas e a letra de destaque do tema ESCURO — tudo como na ADR-0073.
2. **No tema claro, a letra de destaque é o azul da marca**, o token novo `brand-blue` (`#0246f1`, o "azul elétrico" de
   uma das duplas do Victor). Apontam para ele, só no claro: `link`, `link-hover`, `primary-emphasis` e
   `primary-outline` — e, por seguir o `primary-emphasis`, o `sidebar-primary` (mas o item atual da lateral, no claro, é
   o botão primário: item 5).
   Vale para tudo que a ADR-0073 listava como letra amarela: os links, o selo primário suave e de contorno, a página
   atual da paginação, a etiqueta escolhida, o "hoje" do calendário, o link atual do cabeçalho, o rótulo do botão
   secundário, o `BottomNav` `subtle`, o `Avatar` da marca, o destaque do `Alert` e o ícone do `Dialog`. Web e nativo.
3. **Medido nos fundos do claro:** 6,12:1 no fundo da página (`#f5f5f5`), 6,67:1 no cartão, 5,59:1 no campo (`#ebebeb`).
   Contra o texto comum, 2,33:1 — se distingue dele, mas link no meio de uma frase ainda pede sublinhado (nenhuma cor
   passa 4,5:1 no campo e 3:1 contra o texto ao mesmo tempo).
4. **O selo primário cheio enche com o PRIMÁRIO** (o amarelo), e não com o acento: com o acento azul, sairia a tinta
   cinza sobre o azul, 1,99:1. Na web, só sem `data-brand` (`--badge-fill`), como a regra do contorno: na `lory` do claro,
   o primário com a letra dela mede 3,08:1, e o acento dela já é o fundo certo. No nativo, o `preenchimentoDoTom`.
5. **O item atual da lateral é o botão primário**, no claro da Aurea padrão: o fundo amarelo e a letra cinza-escura
   (8,13:1), sem o fio de baixo — o fundo já marca o estado. O Victor, olhando a bancada com o item em azul: *"não quero
   ele azul, não pode ser na cor do botão?"*, e *"depois disso eu aprovo"*. Vale para `.sidebar-item[aria-current]` e
   `.doc-nav a.active`; o fio some pela variável `--sidebar-current-line`. Dentro do item, a letra de destaque (o selo
   primário de contagem, um ícone de destaque) também é a tinta do botão: o azul sobre o amarelo mede 3,49:1, e o axe da
   varredura achou no "12" do exemplo da `Sidebar`. No escuro e na `lory`, o item atual continua como era. Quem cobra:
   `tests/visual/item-atual-lateral.spec.ts`.
6. **As marcas não mudam.** A `lory` declara a própria letra de destaque.
7. **As travas perdem a exceção.** A ADR-0073 abria uma exceção para o amarelo como letra no claro em quatro lugares: o
   `amarelo-no-claro.test.tsx`, o axe da varredura do catálogo, o `marca.spec` e o `tone-contrast.spec` (três pontos).
   Todas saíram: o 4,5:1 vale nos dois temas, sem exceção.

## O que fica para depois (decisões do Victor, 20/10/2026)

Três temas extras, como marcas (`data-brand`), sem prioridade: **Amarelo + âmbar** (`#a85300` como letra de destaque do
claro — o mesmo amarelo, só 5 cores trocadas), **Oliva + folhagem** e **Azul elétrico** (marcas inteiras, 127 cores cada;
melhor depois do gerador de paleta, D9). No nativo, marca só depois da D8.

## O custo, escrito

O tema claro passa a ter duas cores de marca. Quem lê o amarelo como "a cor da Aurea" encontra o azul nos links do
claro. O Victor escolheu isso depois de ver as seis opções rodando, com os números.
