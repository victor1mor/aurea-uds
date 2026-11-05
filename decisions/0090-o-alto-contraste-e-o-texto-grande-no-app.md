# ADR-0090 — O alto contraste e o texto grande no app inteiro

- **Data:** 04/11/2026
- **Estado:** aceita · na `0.56.0` (branch `claude/bloco3-web`) — a web. O nativo vem no lote seguinte, com a comparação
  web × nativo nas 13 marcas (CLAUDE.md §8).
- **Não substitui** o "aumentar contraste" do sistema (`prefers-contrast: more`, ADR-0083): ele continua valendo sozinho.
- **Origem:** o MNT-30 (o app de rede): o texto grande e o alto contraste só existiam dentro do `DependencyGraph`
  (`textSize`, `highContrast`), e o app queria os dois botões no topo, para a aplicação inteira. É o 0-D e o 0-E do bloco 3.

## Como se decidiu

- **A referência não tem nenhum dos dois** (o pacote de estilos dela não tem regra de contraste nem de tamanho de letra):
  os dois modos são peça nossa, com a cara da Aurea.
- **Esboço no FigCraft** (muitas opções — a regra de 29/10/2026), quatro formas de cada, no claro da Gold. O Victor
  escolheu a **"C"** no contraste (o contorno nos campos, o apoio mais escuro, contorno nos cartões, o link sublinhado e
  contorno no botão) e a **"B"** no texto (a letra 2 acima, o campo e o botão de 36 para 44).
- **Bancada com as peças de verdade** (`apps/keyboard-probe/acessibilidade.html`), nos dois temas: *"Aprovo"*.
- **A Ember recebe os dois** (*"Sim, recebe"*): os modos só aparecem quando o app liga.

## A regra

1. **Liga por atributo**, em qualquer contêiner — a raiz do app inclusive: `data-contrast="high"` e `data-text="lg"`. Ou
   pelo `AppShell`: `highContrast` e `textSize="lg"` (os nomes que o `DependencyGraph` já usava). O `AppShell` marca a caixa
   dele **e a raiz da página**, porque menus, janelas e avisos abrem fora dele; ao sair, a raiz volta ao que era.
2. **O contraste "C"**: tudo o que o `prefers-contrast: more` faz (o contorno de 3:1 nos campos, as marcas na tinta, o foco
   do campo no `--focus-strong`), e mais: o texto de apoio a 80% do texto, o contorno `--input-strong` no cartão, o link
   sempre sublinhado, e o contorno do botão por dentro (o `--primary-foreground` no primário). As linhas que só ele acende
   são exceção nomeada à ADR-0072, como a do `prefers-contrast` — a trava `sem-linha.test.tsx` aceita cada uma só no seletor
   e na cor dela.
3. **O texto "B"**: um grupo de tokens novo, `textSize.lg` (emitido sob `[data-text="lg"]`, depois da densidade): cada
   degrau da letra sobe 2 (do `text-xs` ao `text-2xl`) e o `--control-h-md` vai ao `--target-min` — 44 em toda densidade.
   A altura de toque do nativo (`--touch-control-h-md`) daria 48 no conforto, e não foi a aprovada. A letra do corpo se
   refaz no contêiner que liga o modo (`font-size: var(--text-sm)`), menos na raiz, onde mudaria o `rem`.
4. **Sem o atributo, nada muda** — em nenhuma marca.

## Quem cobra

- `tests/visual/acessibilidade-modos.spec.ts` — na bancada, Gold e Ember, nos dois temas: hoje sem linha e a 36; o
  contraste com as linhas, o link e o apoio; o texto a 44 e 2 acima. Provado contra o código de antes.
- `tests/unit/appshell-modos.test.tsx` — as props do `AppShell` (a caixa e a raiz, e a raiz que volta) e a fonte dos tokens.
- `tests/unit/sem-linha.test.tsx` — as quatro linhas do contraste, só onde a regra diz.
