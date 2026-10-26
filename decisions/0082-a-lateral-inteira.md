# ADR-0082 — A lateral inteira (o bloco 2)

- **Data:** 26/10/2026
- **Estado:** aceita · feita na branch `claude/bloco-2-lateral`, na `0.44.0` (só a web: o nativo não tem `Sidebar`).
- **Origem:** o bloco 2 do plano único (23/10/2026) — o que faltava das quinze laterais que o Victor aprovou em 21/10/2026
  (item 107: *"registre as 15 todas gostei de todas, vamos ter todas elas"*), as alternativas do item atual (item 101:
  *"Manter 1, e criar tambem 2, 3, 4, 5 como alternativas"*) e o 2-A (o item 102, o fio que não começa onde o texto começa,
  e o achado 13 do item 106, o subitem que vira vão na trilha). Na bancada de 26/10/2026, com as quinze rodando: *"Vi a
  bancada do bloco 2. Aprovo as quinze e as quatro decisões como propostas."*

## O que se mediu

- **A referência principal não tem lateral** (o pacote de estilos dela, na versão mais nova publicada, conferida em
  26/10/2026). Pela fila, a segunda referência também não tem o componente, mas os blocos de aplicativo dela montam a
  lateral de uma biblioteca de base — lida no código publicado: um provedor com gancho (aberta ou recolhida, controlado ou
  não), os jeitos de recolher `icon` (a trilha) e `offcanvas` (sai da tela), o atalho Ctrl+B (Cmd+B no Mac), a ação do
  grupo e do item, a divisória entre grupos; no modo de ícones, a sublista, as ações e o selo somem.
- **O atalho dela vale até dentro de um campo de texto** — num editor, Ctrl+B é o negrito, e ela o toma.
- **A lateral da Aurea, na 0.43.0:** o texto do item a 12 da borda dele e o fio do escolhido a 15 (um número cru); fora do
  `AppShell`, a lateral reservava a altura de uma barra de cima que não existe (começava a 96, na tela do Victor, 1280 ×
  663); recolhida, o subitem sem ícone virava um botão vazio na trilha; o estado de recolher só existia dentro do
  `AppShell`.

## A regra

1. **O jeito de recolher** (`collapsible` na `Sidebar`; `sidebarCollapsible` no `AppShell`, que aceita o nome além de
   `true`): `icon`, a trilha (o padrão, igual a antes); `capsule`, a trilha com o canto de cápsula; `offcanvas`, a lateral sai
   da tela e a trilha do shell vai a zero.
2. **O estado solto** (`Sidebar.Provider`, `Sidebar.Toggle`, `useSidebar`): o estado mora num provedor, e o `AppShell` usa o
   mesmo por dentro. O botão de recolher vai a qualquer lugar — ao lado do título, dentro da lateral (a `action` da
   `Sidebar.Brand`; recolhida, ele desce para baixo do logo) ou no pé, como linha (`variant="item"`). `sidebarToggle="none"`
   tira o botão que o shell põe sozinho. O **Ctrl+B** (Cmd+B no Mac) recolhe e abre, como na referência, ligado por padrão
   (`shortcut`, `sidebarShortcut`); abaixo de 1024, abre e fecha a gaveta. **A divergência, decidida pelo Victor (D3):**
   o atalho não age onde se digita. `useSidebar` devolve `null` fora de um provedor (a referência lança erro).
3. **O item:** `avatar` no lugar do ícone (fica na trilha); `action` ao lado do link, nunca dentro dele (some na trilha);
   no grupo, `collapsible` e `defaultOpen` — o nome vira um botão de divulgação, com `aria-expanded` e `aria-controls`.
4. **A divisória:** a palavra `"separator"` entre os itens parte a lista em duas, com um vão de 16 — sem linha
   (ADR-0072). A barra de baixo, que usa a mesma lista, a ignora.
5. **A trilha das seções** (`panel`; `sidebarPanel` no `AppShell`): o primeiro nível vira seções numa trilha em cápsula, e
   a lista da seção escolhida mora num painel — `docked`, ao lado (recolher esconde o painel), ou `overlay`, por cima, ao
   lado do ícone, numa janelinha que segura o foco e fecha com o Esc. A seção da página atual leva `aria-current="true"`.
6. **O item atual** (`indicator`; `sidebarIndicator`, D4): `brand`, o de hoje, continua o padrão; `segment` (a cápsula da
   aba escolhida, a letra na cor do texto, sem fio — o item atual da documentação da referência), `segment-dot` (com o
   ponto amarelo), `segment-line` (com o fio amarelo) e `subtle` (só o cinza — o mesmo do ponteiro em cima).
7. **O texto e o fio a 16** (D1, o 2-A): o recuo do texto do item, do título do grupo, da marca e do título do painel é um
   número só, `--sidebar-item-x` = `--space-4`, e o fio do escolhido começa nele — onde a curva da cápsula já acabou. Todas
   as laterais andam 4 para dentro (no arranjo de documentação, o texto continua a 8; o fio passa de 15 a 16).
8. **A sublista some na trilha** (o 2-A, o achado 13): recolhida, a lateral não desenha a sublista, como a referência; o
   item pai continua, com o nome na dica.
9. **A lateral solta vai do topo até embaixo** (D2): fora do `AppShell`, o topo dela é a margem (16) e o fim também. O app
   que tem uma barra própria em cima diz a altura dela em `--sidebar-offset`.

## O que fica para depois

- A regra "o padrão é o nosso, as variações são as da referência" (24/10/2026), peça por peça — a lateral já ganhou as
  dela no item atual.
- A varredura de alinhamento de todas as peças (o 2-D, no bloco 3): onde começam o texto, o indicador e a curva de cada uma.
