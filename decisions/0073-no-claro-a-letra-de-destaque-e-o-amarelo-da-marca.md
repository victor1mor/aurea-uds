# ADR-0073 — No tema claro, a letra de destaque é o amarelo da marca; sobre o amarelo, a letra é cinza-escura

- **Data:** 18/10/2026
- **Estado:** aceita · feita na branch `claude/lote-u-cores`, para a `0.36.0`. **Substitui a
  [ADR-0054](0054-no-tema-claro-a-letra-de-destaque-e-ouro-escuro.md)** (o ouro escurecido `#826202`).
  ⚠ **O item 1 e "O custo, escrito" foram substituídos pela [ADR-0076](0076-no-claro-a-letra-de-destaque-e-o-azul-da-marca.md)**
  (20/10/2026): no claro, a letra de destaque passou a ser o azul da marca. Os itens 2 a 9 continuam valendo.
- **A tinta (`#242424`) foi substituída pela [ADR-0083](0083-a-paleta-da-1-0.md) (26/10/2026)** — `#18181B`; e a marca marrom sobre o amarelo saiu.
- **Origem:** o Victor, 17/10/2026, olhando a lateral do site no tema claro: *"eu odeio esse marrom do modo claro, não
  conseguimos usar mesmo amarelo?"*. Viu numa bancada todas as peças que usavam o marrom, com o amarelo ao lado, e
  escolheu peça a peça (17 e 18/10/2026). Para a letra, recusou o cinza-escuro (*"eu quero amarelo, não preto"*),
  pediu a pesquisa em todas as referências e, com as cinco cores medidas lado a lado, escolheu a **B**, o amarelo da
  marca: *"b aprovaro"*. Foi avisado antes de que a B mede 1,75:1 e reprova três travas de contraste.

## A regra

1. **No tema claro, a letra e o ícone de destaque são o amarelo da marca**, o mesmo do escuro: `primary-emphasis`,
   `primary-outline`, `link` e `link-hover` apontam para `{brand-yellow}`. Vale para o item atual da lateral e o traço
   dele, os links, o selo primário, a página atual da paginação, a etiqueta escolhida, as setas e o "hoje" do
   calendário, o link atual do cabeçalho, o rótulo do botão secundário, o `BottomNav` `subtle`, o `Avatar` da marca, o
   destaque do `Alert` e o ícone do `Dialog`.
2. **O anel de foco do claro é a cor do texto** (`focus-strong` → `{foreground}`, o cinza-escuro `#242424`): 14,24:1
   no fundo da página e 8,13:1 em volta do botão amarelo. O amarelo como foco some em volta do botão amarelo (1,00:1).
3. **O controle marcado é o amarelo nos dois temas** (`control-selected` → `{brand-yellow}` também no claro). O rádio,
   o checkbox, a chave e o `Slider` ficam da mesma cor das outras peças.
4. **Sobre o amarelo, a letra é o cinza-escuro, nos dois temas** — o token novo `brand-yellow-ink` (`#242424`, o texto
   do tema claro; 8,13:1 sobre o amarelo). Usam-no `primary-foreground`, `sidebar-primary-foreground` e
   `control-selected-foreground`: o rótulo do botão principal, o visto do checkbox e do passo, o dia escolhido do
   calendário, o número do aviso, e a letra do selo primário CHEIO (`--badge-on` no `.badge-primary`, e o
   `preenchimentoDoTom` do nativo). Antes, o marrom; no selo cheio, a cor do fundo da página — que, com o acento do
   claro virando o amarelo, mediu 1,75:1 (o axe da varredura achou, na construção).
5. **O marrom fica onde o Victor pediu**, no token novo `primary-mark` (= `brand-yellow-foreground`, o marrom de antes,
   4,54:1 sobre o amarelo): o bichinho da chave ligada (*"mantenha o marrom"*), o centro do pino do `Slider` (*"não
   coloque preto, coloque marrom"*), o play do `MediaEmbed` (*"não quero preto"*) e o item escolhido do `BottomNav`
   cheio — `circle-bold`, `capsule` e `expand`, os três iguais (*"não use preto"*). Web e nativo.
6. **A bolinha do rádio é branca**, nos dois temas — o token novo `control-selected-dot` (*"pode deixar branco"*).
7. **O play do `MediaEmbed` perde o anel escuro**, e a caixa do vídeo perde o aro de 1: o fundo escuro aparecia pela
   borda transparente (ADR-0072) em volta da capa; agora ele é pintado só por dentro dela (`background-clip`). Numa
   capa amarela, quem separa o play é a sombra.
8. **O selo primário de contorno escreve com o amarelo puro**, o mesmo do suave (decisão do Victor, 18/10/2026, "A",
   olhando as duas rodando). A regra do sem linha (a "C" da ADR-0072) mistura a letra do contorno 20% com o texto; com o
   amarelo, isso dava um amarelo mostarda (2,36:1) só nesta peça. A referência principal usa a mesma letra no suave e no
   contorno. Na web, só sem `data-brand`: na `lory` do claro, sem a mistura, a letra cairia de 5,56 para 4,42:1. Os
   selos de estado continuam misturados.
9. **As marcas não mudam.** Os três tokens novos ganham, em cada `data-brand`, o valor que a marca já usava; o `lory`
   claro mantém o link de antes.

## O custo, escrito

O amarelo da marca mede **1,75:1** no fundo da página do claro (1,91 no branco do cartão, 1,60 no cinza do campo); a WCAG pede 4,5:1 para texto (1.4.3) e 3:1 para ícone (1.4.11).
Ele não passa, e quem tem baixa visão é o primeiro a perder. A decisão foi tomada sabendo disso, com as medidas
escritas em cada opção da bancada:

| | cor | contraste no fundo claro |
|---|---|---|
| Hoje (ADR-0054) | ouro escurecido `#826202` | 4,57 a 5,58 |
| **B · escolhida** | **o amarelo da marca `#f0b100`** | **1,54 a 1,91** |
| V | o modo vibrante da referência principal, `#dea400` | 2,04 |
| Y6 | o degrau 600 da escala de onde o amarelo vem, `#d08700` | 2,69 |
| Y7 | o degrau 700, `#a65f00` | 4,52 |
| C | a letra cinza-escura e o amarelo como fundo ou traço | 8,13 a 14,24 — recusada |
| D | a letra amarela numa cápsula escura | 8,13 — recusada |
| E | amarelo mostarda `oklch(0.65 0.16 86.047)` | 2,62 a 3,26 — recusada |

O muro da cor, medido: o amarelo da marca escurecido aos poucos dá 1,75 (ele mesmo, luminosidade 0,795) → 2,46 (0,70) → 2,98
(0,65) → 4,48 (0,55) → 5,16 (0,52). Para ler, ele vira ouro.

## O que as referências fazem (lido no código publicado delas, 18/10/2026)

Todas escurecem o amarelo quando ele vira letra no claro. A referência principal mistura o amarelo com a cor do texto
(4,57); o modo vibrante dela, opcional e só no claro, aceita *"less contrast"* e chega a 2,04. Das outras cinco, uma
usa um amarelo escurecido (4,35), duas trocam o aviso por laranja, uma usa o marrom que é o nosso (7,97) e duas usam o
degrau 600 da escala do amarelo (2,69) — uma delas, no tema amarelo —, aceitando ler pior. A Aurea vai além delas, por decisão do Victor.

## As travas, e o que cada uma aceita

A exceção é **uma cor, num tema**: o `--primary` como letra no claro. Nada mais.

- `tests/unit/amarelo-no-claro.test.tsx`, reescrito: no claro, destaque, contorno e link SÃO o amarelo; o foco é a cor
  do texto e se vê (3:1) em todo fundo e em volta do botão amarelo; o controle marcado é o amarelo nos dois temas;
  sobre o amarelo, a tinta é o `brand-yellow-ink` (4,5:1), a marca é o marrom (3:1) e a bolinha é branca. Provado
  contra os tokens de antes: os quatro testes reprovam.
- `catalog-sweep.spec.ts`, o axe: no claro, a acusação de contraste cuja letra é exatamente o `--primary` da página
  não conta; qualquer outra cor reprova, e no escuro não há exceção.
- `marca.spec.ts`: na Aurea, no claro, o item atual da lateral tem de SER o amarelo; as marcas e o escuro seguem no
  4,5:1.
- `tone-contrast.spec.ts`: na matriz do botão, o rótulo que é o `--primary` no claro não cobra o 4,5:1, mas não pode
  cair sobre amarelo (piso de 1,4; no fundo neutro ele dá de 1,54 a 1,91); nos papéis de texto, o `--link` do claro
  sai da conta; no link em prosa do claro, a trava cobra que ele SEJA o amarelo. No escuro, tudo segue no 4,5:1.
- `skin.spec.ts` (a pele): no claro, o acento da lateral tem de SER o amarelo; no selo, a letra que é exatamente o
  amarelo sai da conta do 4,5:1. No escuro, tudo segue no 4,5:1.
- O selo primário cheio e o de contorno, nos dois alvos: `amarelo-no-claro.test.tsx` cobra a letra do botão amarelo no
  cheio e o amarelo puro no contorno (provado contra o defeito: sem cada troca, os dois testes dela reprovam).

## O que NÃO muda

- O amarelo `oklch(0.795 0.184 86.047)`, em lugar nenhum.
- O tema escuro: a letra de destaque já era o amarelo.
- O amarelo como FUNDO (botão principal, cartão da marca, barra cheia).
- As marcas (`data-brand`).
