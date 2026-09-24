# ADR-0030 — A barra inferior reusa o item da lateral, e o recuo do aparelho é contrato do consumidor

- **Data:** 17/08/2026
- **Estado:** aceita
- **Fecha:** o §4.1 do [`CONSUMIDOR-1.md`](../docs/CONSUMIDOR-1.md) — a lacuna estrutural
- **Autoria:** medição do Opus, sob autorização explícita do Victor em 17/08/2026

## Contexto

A Aurea tinha `Topbar` e `Sidebar`, e os dois são vocabulário de **desktop**. O inventário do
primeiro consumidor real mediu a falta: sem barra inferior, aplicativo não navega como aplicativo
navega. Foi a primeira das duas lacunas que sobraram para o **K4**, e a autorizada primeiro por
ser a estrutural.

Das nove pastas de `Referencia/`, **uma** tem o componente — medido com
`find Referencia -iname "*bottom*nav*" -o -iname "*tabbar*"`, que devolve só a `material-ui-master`.
É o resultado esperado: as pastas são bibliotecas de desktop. Pela regra do
[`BUILDING.md`](../docs/BUILDING.md) §1, zero na pasta manda **pesquisar**, e foi o que se fez.

## Decisão 1 — o item é o `SidebarItem`, e não um tipo novo

`BottomNav` recebe `items: SidebarItem[]`. Sublista (`items` aninhado) é ignorada: barra inferior
é plana.

**Por quê.** O passo 1 do `BUILDING.md` — medir o nosso antes de abrir referência — achou que o
tipo já existia inteiro: `{id, label, href?, icon?, badge?, onClick?, items?}`, e o item atual já
sai de `[aria-current]`, que é o mesmo atributo que o leitor de tela anuncia e a pele pinta.

Um `BottomNavItem` próprio pareceria mais limpo e obrigaria o consumidor a manter **duas listas do
mesmo menu** — a mesma navegação, escrita duas vezes, para desktop e para telefone. Listas gêmeas
divergem: é questão de tempo até uma ganhar um item que a outra não tem. Uma lista, duas peles.

**O que isso custa, dito em voz alta:** o tipo carrega um campo que a barra não usa. Está na ficha
e no catálogo. É mais barato que o defeito que ele evita.

## Decisão 2 — o recuo do aparelho é nosso; a `meta viewport` é do consumidor

A barra reserva o espaço do indicador de tela cheia do iPhone com
`padding-bottom: max(var(--space-1), env(safe-area-inset-bottom))`. Isso **só tem efeito** se a
página do consumidor declarar `viewport-fit=cover` na `meta viewport`.

**A Aurea não escreve a `meta` de ninguém.** Ela não é dona do documento — é biblioteca de
componente, e injetar `meta` seria decidir o enquadramento de uma página que não é dela.

**Por que isso não vira armadilha:** sem `viewport-fit=cover`, `env()` devolve 0 e o `max()`
entrega o espaço normal. **Degrada, não quebra.** O requisito está escrito na ficha, no comentário
do CSS e no catálogo, nos três lugares onde alguém vai procurar.

Nenhuma das nove referências usa `env(safe-area-inset)` — medido, `grep -ri` devolve **0**. Esta
parte veio inteira de pesquisa, pelo passo 4 do `BUILDING.md`.

## Decisão 2b — as VARIANTES saem de aplicativo que roda, não de peça de portfólio

**Acrescentada no mesmo dia, depois de o Victor rejeitar a primeira versão duas vezes.**

A barra nasceu como superfície flutuante de raio 22px, com o item atual pintado inteiro. Ele
mandou primeiro quatro referências visuais (barra em pílula, item atual preenchido) e depois
**prints que ele mesmo tirou** de WhatsApp, YouTube, Mercado Livre e Shopee.

**O que os quatro aplicativos fazem IGUAL, e virou a base:** rótulo visível em **todo** item,
ícone sobre rótulo, contador no canto do ícone, contador **menor** que o ícone (razão medida:
**0,67**).

**O que eles fazem diferente entre si, e virou `variant`:**

- **`flat`** — 3 dos 4 (YouTube, Mercado Livre, Shopee): barra chapada de ponta a ponta, fio em
  cima, item atual **sem fundo**; o que marca é a cor. **É o padrão**, por ser a maioria medida.
- **`surface`** — 1 dos 4 (WhatsApp): barra flutuante, e o realce envolve **só o ícone**, com o
  rótulo embaixo, fora dele. Pintar o item inteiro não aparece em aplicativo nenhum.
- **`pill`** e **`dock`** — **nenhum dos 4**. Ficam porque o Victor pediu, e a ficha registra em
  voz alta que elas escondem rótulo e que aplicativo real não faz isso.

**A regra que sai daqui e vale para o próximo componente:** peça de portfólio mostra o que é
bonito numa imagem; aplicativo que roda mostra o que sobrevive ao uso. Quando as duas discordam,
**a que roda ganha** — e a outra vira variante declarada, não padrão.

## Decisão 3 — não é `Tabs`, e isso é contrato

O contêiner é landmark `<nav>` nomeado e cada item é **link** com `aria-current="page"` no atual.
Não há `role="tablist"`, e não vai haver.

Aba troca **painel dentro da página**; barra inferior troca de **página**. Dar `role="tablist"` a
um menu faz o leitor de tela prometer navegação por setas que não leva a lugar nenhum — promessa
falsa é pior que ausência. Há asserção no teste unitário exatamente para isso, para que a
"melhoria" não entre por descuido numa sessão futura.

**A MUI não entrou nesta parte, e é a única referência que tinha o componente.** A raiz dela é uma
`<div>` sem `<nav>`, sem `aria-label` e sem `aria-current`; o item é `<button>`. Isso é mais fraco
que a nossa própria `Sidebar`, então ficou de fora. O que entrou dela foi **anatomia**: item em
coluna com ícone sobre rótulo, e itens dividindo a largura. A pesquisa (KendoReact, MDN
`navigation role`, APG Landmarks) converge no contrário da MUI, e é o que foi adotado.

## Consequências

- Quem já monta um `Sidebar` ganha a barra sem escrever lista nova.
- `AureaStrings` ganha `bottomNavLabel`. Dicionário completo customizado precisa da chave nova —
  está no `CHANGELOG`.
- **`BottomNav` NÃO entra no `AppShell`.** O shell é uma grade de desktop, e embutir a barra nele
  mudaria a moldura de todo consumidor que já a usa. A barra se posiciona sozinha (`sticky`) e
  quem a coloca é quem monta a tela. Se um dia a moldura precisar das duas, é decisão nova.
- **Limite declarado do gate:** o efeito do `env()` é o único que nenhum navegador de mesa produz
  — fora do aparelho ele vale 0. A pele o cobra na **declaração** (o `skin.spec` lê a regra
  `.bottom-nav` na folha de estilo e exige `safe-area-inset-bottom` ali). É menos que efeito, e
  está escrito como tal em vez de fingir uma medida. Provado contra o defeito: apagada a linha,
  reprova.
