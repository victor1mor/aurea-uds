# ADR-0079 — A lateral com o topo e o pé fixos

- **Data:** 23/10/2026
- **Estado:** aceita · feita na branch `claude/lateral`, na `0.41.0` (só a web: a `Sidebar` não existe no nativo).
- **Origem:** o pedaço **4-C** da série da lateral — as quinze laterais que o Victor aprovou em 21/10/2026 (*"vamos ter
  todas elas"*; a fila as dividiu em 4-A a 4-H, cada um uma versão) —, e o pedido PV-15 de um segundo app (o topo e o pé
  fixos; só a lista rola). O MNT-34 do app de rede (a lateral até o topo, sem a barra de cima) depende dele e vem na
  versão seguinte. O Victor viu a bancada com o código real, em tela cheia, e pediu a 9 e a 10 de canto, como a 8 e a 11
  (*"deixe como 8 e 11"*); depois, *"Aprovado o 4-C"*.

## O que se mediu

- **A referência principal não tem lateral** nem moldura de aplicativo (nenhum arquivo do pacote publicado dela). O
  desenho é o das quinze, da própria Aurea, aprovado pelo Victor — a bancada delas, de 21/10/2026, é a régua.
- **Contra a bancada das quinze, na variação 11:** o quadrinho da marca 36 × 36, a 16 da esquerda e 20 do topo; o
  primeiro item a 76; a pessoa numa caixinha de 255 × 56 a 12 do fim; a foto de 40; o sair de 32, a 215. Iguais. Da 8 à
  10, o que muda é a altura da linha do nome (as quinze usavam a Atkinson; o nome agora sai na Sora, ADR-0077), não os
  vãos.

## A regra

1. **A `Sidebar` ganha `header` e `footer`.** Com qualquer um deles, a caixa não rola mais: o topo e o pé ficam presos,
   e só o meio (`.sidebar-body` — a lista e o que vier em `children`) rola. Sem eles, o HTML é o de sempre.
2. **Quatro partes, todas da `Sidebar`** (peça nova é variação, não componente):
   - `Sidebar.Brand` — a marca do app: `logo`, `name`, `description`. `variant="tile"` (o padrão, a 11) põe o logo num
     quadrinho de 36 na cor primária; `plain` (da 8 à 10) é o desenho solto e o nome no tamanho de título.
   - `Sidebar.User` — a pessoa numa caixinha (o texto a 6%, `--fill-1`; o canto do item da lateral): `avatar`, `name`,
     `description`, `action` (o sair).
   - `Sidebar.Nav` — uma segunda lista com a pele da lateral (Suporte, Ajustes). O nome é obrigatório: duas navegações
     com o mesmo nome reprovam no axe.
   - `Sidebar.Show` — o que só aparece aberta (`when="expanded"`: a busca, o cartão de destaque) ou só recolhida
     (`when="collapsed"`: a lupa).
3. **Recolhida**, a marca fica só com o logo e a pessoa vira a foto e a ação empilhadas, sem a caixinha, centradas na
   trilha. Os nomes vão para o leitor de tela (`.sr-only`), como o rótulo do item. As partes sabem disso por um contexto
   interno da `Sidebar`; o estado de recolher com gancho, para o app, é o 4-B.
4. **Sem linha entre as partes** (ADR-0072): o vão separa. Na lateral de canto com partes, 12 de folga em cima e embaixo,
   como nas quinze.
5. **A barra de rolagem** que aparece com o ponteiro (e com o foco) vale para o meio, que é quem rola.

## O que fica para depois

- **O MNT-34** (a lateral até o topo no `AppShell`, com a marca dentro dela e a barra só sobre o conteúdo) — a versão
  seguinte.
- **4-A** (os modos de recolher "some" e "cápsula", a cápsula fixa), **4-B** (o botão de recolher no alto, no pé e ao
  lado do título; o estado solto com gancho; o Ctrl+B) e **4-D a 4-H**.

## Quem cobra

- `tests/unit/sidebar-topo-pe.test.tsx` — o HTML: sem partes, o de sempre; com elas, topo, meio e pé, nessa ordem; cada
  parte; recolhida, os nomes no leitor de tela, a busca trocada pela lupa. Com a `Sidebar` da 0.40.1, reprovam 7 de 8 (o
  que passa é o "sem partes, o de sempre").
- `tests/visual/sidebar-topo-pe.spec.ts` — no navegador: as medidas da variação 11; só o meio rola, e o topo e o pé não
  saem do lugar; recolhida, a marca e a pessoa no centro da trilha. Com o CSS da 0.40.1, reprovam 3 de 4.
