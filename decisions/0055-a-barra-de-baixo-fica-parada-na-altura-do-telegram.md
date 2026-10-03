# ADR-0055 — A barra de baixo fica parada, na altura do Telegram

- **Data:** 03/10/2026
- **Estado:** aceita · executada na `0.17.0`, publicada em 03/10/2026.
- **Autoria:** decisão do Victor, olhando a bancada com o código real rodando no navegador:
  *"me incomoda o bottom nav todo se mexer quando [clica] no botão, quero ele estático, apenas os
  botões dinâmicos"*; *"ainda acho ele muito largo comparado a bottomnav como do telegram"* —
  "largo" é a grossura (*"grossura altura"*); *"o texto pode ficar mais próximo do ícone"*.
  Aprovado em 03/10/2026: *"a palavra agora é PERFEITO! pode. aprovado"*.
- **Muda:** a aparência publicada do `BottomNav`, nos dois alvos. Acrescenta dois indicadores.
- **Afrouxa:** a regra "o rótulo nunca some" da auditoria de 20/08/2026 (achado 6/7), só no
  indicador novo `expand`, por ordem do Victor.

## As regras

1. **Nenhuma medida do `BottomNav` depende de o item estar escolhido.** Trocar de aba muda só a
   pintura: cor, fundo, ícone cheio. O peso do nome é o médio em todos os itens, e o círculo do
   `circle-bold` é um disco DENTRO do item, em todos os itens.
   - A exceção é o `expand`, em que o escolhido cresce — numa vaga FIXA, para a barra não mudar:
     os botões andam, a barra não.
2. **A altura é a do Telegram.** O nome sai em 12 numa linha de 16 (o tamanho mais `space1`), o
   recheio de cima e de baixo do botão é `space05`, e o nome encosta no ícone (vão zero).
3. **Dois indicadores novos**, pensados como o HeroUI pensaria (nome curto, lista fechada):
   - `capsule` — o indicador ativo do Material 3 Expressive: cápsula de 56 × 32 só atrás do ícone;
   - `expand` — só o ícone nos outros; o escolhido vira cápsula amarela com o nome ao lado.

## As fontes

O HeroUI não tem barra de baixo. Na fila de referências (seção 2 do `CLAUDE.md`), o ReUI também
não tem, e o Shark UI tem só a anatomia, sem medida. A medida veio da referência do Victor — que,
pela ordem das fontes, vem antes do HeroUI:

| fonte | o que se leu | onde |
|---|---|---|
| **Telegram para Android 12.10.6** (30/09/2026) | pílula de **56** (`DialogsActivity.MAIN_TABS_HEIGHT`), botão de 48, ícone de 24 no topo 4, nome de 12 no topo 28,33 (colado na caixa do ícone); o escolhido ganha uma pílula da altura do botão | `MainTabsActivity.java`, `MainTabsLayout.java`, `glass/GlassTabView.java` |
| **Material 3 Expressive** | indicador ativo 56 × 32; barra de 64; o nome do escolhido não engrossa | `material-components-android`, `docs/components/BottomNavigation.md` |
| **Apple HIG** | barra para navegar, sempre visível, nome de uma palavra, ícone cheio no escolhido | `developer.apple.com/design/human-interface-guidelines/tab-bars` |

⚠ O código do Telegram é GPL-2.0, e nenhuma linha dele entrou aqui: leram-se **números**, que
passaram pelos tokens que já existem (`space05`, `space1`, `text-xs`, `--bottomnav-bold`,
`--bottomnav-ring`).

## O que foi medido

Na bancada, com o `react-native-web` e o código da branch, e no navegador com a folha da web — os
dois dão os mesmos números:

| | antes (0.16.1) | agora |
|---|---|---|
| a barra ao trocar de aba (`circle-bold`, `content`) | de 249 a 257 de largura | parada |
| altura — `none`, `subtle`, `pill` | 65 (nativo, medido no `pill`) · 62 (web) | **54** |
| altura — `circle-bold` | 73 (nativo) · 69 (web) | **58** |
| altura — `circle`, `circle-raised`, `circle-outline` | 70 (web; o nativo não foi medido) | **62** |
| altura — `capsule` · `expand` (novos) | 73 · 54, na primeira versão da bancada | **62** · **54** |
| do ícone ao nome, de tinta a tinta — `pill` / `circle-bold` | 9 / 13 | **6 a 7** (Telegram ≈ 6,5) |

## O preço

- O nome dos itens não escolhidos ficou um pouco mais grosso (o peso médio de todos).
- No nativo o nome desce de 14 para 12 — o tamanho da web e do Telegram.
- No `expand`, nome maior que 80 termina em "…", e a barra dele é a mais larga das quatro
  opções da bancada (290 com quatro itens).

## Quem cobra

- `tests/visual/geometry.spec.ts`: "a barra não se mexe quando se troca de aba" e "a altura do
  Telegram, o nome inteiro e colado no ícone" — os dois reprovam a folha antiga.
- `tests/unit/native-bottomnav-parada.test.tsx`: as mesmas regras no nativo; reprova o código antigo.
- `tests/visual/skin.spec.ts`: contraste e lugar do contador na `capsule` e no `expand`.
- O bloco `0.17` do `apps/native-smoke`, no aparelho.
