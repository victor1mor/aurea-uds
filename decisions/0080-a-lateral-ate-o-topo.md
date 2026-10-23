# ADR-0080 — A lateral até o topo

- **Data:** 23/10/2026
- **Estado:** aceita · feita na branch `claude/shell`, na `0.42.0` (só a web).
- **Origem:** o MNT-34 do app de rede — o Victor pediu a ele *"sidebar de canto e que vá até o topo"* e *"tire esse topbar
  flutuante"* — e o PV-04 de um segundo app (a marca e o menu do alto até embaixo, sem barra no topo). O sistema que
  serviu de modelo à ADR-0077 tem esse arranjo: a lateral de canto até o topo, com a marca no alto dela, e uma barra de 56
  só sobre o conteúdo. Na bancada, o Victor: *"mantenha o atual e faça também os outros 4"*; depois, *"quero o botão de
  recolher conforme eu tinha aprovado"* (o das quinze laterais, item 107); e *"Aprovado o MNT-34"*.

## O que se mediu

- **O `AppShell` desenhava a barra de cima sempre**, com a marca nela (o `Header` vinha logo depois do link de pular, sem
  condição), e a lateral começava abaixo dela (a 96, na tela do Victor, 1280 × 663). Não havia como montar a tela do
  sistema que serviu de modelo.
- **A referência principal não tem moldura de aplicativo** nem lateral. O desenho é o das quinze laterais da própria Aurea
  (ADR-0079), aprovado pelo Victor.
- **Na bancada, com a peça de verdade, a 1280 × 663:** de canto, a lateral de 0 a 663 e o conteúdo a 16 dela e do topo;
  flutuante, a lateral de 16 a 647; com a barra, ela com 56 só sobre a coluna do conteúdo e o conteúdo a 72; o botão de
  recolher 36 × 36, ícone de 16, sem fundo, a 12 do título — igual ao das quinze.

## A regra

1. **`layout="sidebar"`** — a lateral vai do topo ao fim da janela (a de canto encostada; a flutuante com a margem dela) e
   a marca (`brand`) mora no topo dela (o `header` da `Sidebar`, ADR-0079). Sem `layout`, o arranjo de sempre, igual.
2. **A barra de cima só existe se o app passar `topbar`**, e fica só sobre a coluna do conteúdo: o `Header` rente e
   pequeno (56), com os itens a partir da esquerda (o botão de recolher, o título; as ações podem ir para a direita).
3. **O botão de recolher é o das quinze** (`AppShell.SidebarToggle`): o botão de ícone sem fundo, com o desenho de lateral,
   a 12 do título. Com a barra, o shell o põe no começo dela; sem barra, o app o põe ao lado do próprio título. A bolinha
   da junção (ADR-0056) fica só no arranjo de sempre.
4. **`sidebarFooter`** — o pé fixo da lateral (a pessoa e o sair), em qualquer arranjo.
5. **O respiro:** a de canto não tem margem, e o conteúdo ganha 16 do lado dela (o app de rede mediu o conteúdo encostado
   no menu).
6. **Abaixo de 1024** a lateral continua gaveta. O botão de recolher some; quem abre é o botão da gaveta — na barra, ou,
   sem barra, numa faixa de 56 com ele e a marca.

## O que fica para depois

- O resto da série da lateral: **4-A** (os modos de recolher "some" e "cápsula", a cápsula fixa), **4-B** (o botão de
  recolher no pé e dentro da lateral, o estado solto com gancho, o Ctrl+B) e **4-D a 4-H**.

## Quem cobra

- `tests/unit/appshell-lateral-ate-o-topo.test.tsx` — o HTML: sem barra, com barra, o botão aprovado no lugar dele e sem a
  bolinha, o `AppShell.SidebarToggle` recolhendo, o arranjo de sempre igual, o `sidebarFooter`. Com o `AppShell` da
  0.41.0, reprovam 5 de 6 (o que passa é "o arranjo de sempre não muda").
- `tests/visual/appshell-lateral-ate-o-topo.spec.ts` — no navegador, as medidas acima e a 800 × 450 (a faixa, a gaveta,
  nada rolando para o lado). Com o CSS da 0.41.0, reprovam 4 de 5.
