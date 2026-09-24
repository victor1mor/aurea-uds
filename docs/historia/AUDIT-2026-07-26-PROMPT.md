# Auditoria adversarial — catálogo Aurea (26/07/2026)

> Arquivo de uso único, entregue ao auditor externo (Codex). Quando o relatório existir e os
> achados estiverem tratados, este arquivo sai do repo — como saiu o prompt da auditoria de
> 18/07. Não é backlog nem documentação de processo.

---

## Prompt (copiar a partir daqui)

Você é auditor adversarial de um design system. O implementador (Claude Opus) construiu o
catálogo `apps/catalog` em ritmo alto nos últimos dias e **declarou** uma série de garantias.
Seu trabalho **não é** concordar: é tentar derrubar cada declaração com medição. O cliente já
encontrou inconsistências visuais a olho nu — logo, existe pelo menos uma classe de defeito
que os gates atuais não pegam. Ache-a, e ache as outras.

Trabalhe em `C:\dev\aurea-uds`. Não altere código sem que o achado esteja provado e registrado.

### Regra número um: nada é aceito por afirmação

Para CADA item abaixo, produza evidência medida — seletor, valor computado, página, tema,
largura de janela. "Parece certo" não é resultado. "Não encontrei" só vale se você disser
**como** procurou e em quantas páginas.

O gate visual atual (`tests/visual/catalog.spec.ts`) cobre **uma página por tipo** — índice,
um componente, um pattern, um block, uma recipe, tokens, lateral, topo. São 169 páginas no
total. **Assuma que a divergência mora nas páginas não amostradas** e prove o contrário
varrendo TODAS elas por script.

### O que foi declarado (as afirmações a derrubar)

1. **Uma linguagem só para "selecionado".** Item de nav ativo, aba ativa, item de lista
   lateral e botão com `aria-pressed` devem ter: cápsula elevada, rótulo na cor da marca e
   fio amarelo `inset-inline:15px; bottom:0; height:2px` a 75% de `--primary`. No tema claro
   o rótulo aprofunda com `--foreground`. Verifique nos 4 casos, nas 169 páginas, nos 2 temas.
2. **Identidade intocável** (`CLAUDE.md`): card/dialog/painel com raio 22px
   (`--radius-card`); campos, tabs e botões textuais em pill (`--radius-control:999px`);
   amarelo `oklch(0.795 0.184 86.047)` invariável entre temas; IBM Plex; Carbon Icons;
   **zero gradiente**; proibida caixa retangular genérica. Procure violação em CSS **e** no
   renderizado.
3. **Espaçamento novo só com `var(--space-*)`.** Não vale pixel cru novo. Os 239 pixels crus
   históricos ficam. Diga quantos pixels crus existem hoje e quais entraram depois de 23/07
   (use `git log -S`).
4. **Caixa de demo com a mesma altura em toda página**, cedendo à janela:
   `clamp(14rem, calc(100dvh - 19rem), 32rem)`. Meça em todas as páginas com demo, em pelo
   menos 3 alturas de janela. Divergência de 1px é achado.
5. **Toda linha da seção Reference é uma fila de chips do mesmo tamanho e borda** — inclusive
   `role="..."` e as plataformas. Meça altura, padding e raio dos chips; qualquer valor solto
   é achado.
6. **Todo item da lateral tem glifo** (campo `icon` da ficha, dentro da allowlist de 159 do
   contrato). Conte itens e `<svg>` em todas as páginas, nas 5 áreas.
7. **axe (wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice) = zero violação** nos 2 temas.
   Foi verificado em ~20 páginas. **Rode nas 169**, nos 2 temas. Espere achar coisa.
8. **Sem rolagem lateral** em 320/375/640/768/1024/1280/1536 — em todas as páginas.
9. **Preview e Code batem**: o código mostrado gera o preview exibido. Amostre pelo menos 20
   exemplos e diga onde divergem (prop no código que não está no render, ou vice-versa).
10. **Nada prometido sem exemplo**: cada item de `features` deve ter exemplo correspondente na
    página. Cheque os 21 componentes com conteúdo rico.
11. **Props documentadas batem com a assinatura real** em `packages/react/src/index.tsx`.
    Prop que existe no código e não na ficha, ou tipo errado, é achado. São 22 fichas com
    `props`.
12. **Hierarquia de títulos válida** (h1 → h2 → h3, sem pular, sem h4 antes do h1) e um só
    `<h1>` por página. Nas 169.
13. **Sem id duplicado, sem link quebrado, console limpo.** Nas 169.

### Onde as regras vivem

- `CLAUDE.md` — identidade e proibições. `AUREA.md` — visão, estado real, §2.0 padrão único.
- `DIRECTION.md` — taxonomia, camadas e as 15 regras de nomenclatura (§3).
- `ROADMAP.md` — trilhas, etapas e débito declarado.
- `scripts/validate.py` — o gate de dado (fichas, tokens citados, ícones, nomes privados).
- `scripts/build-catalog.mjs` — o gerador: TODA página sai daqui. Defeito repetido em N
  páginas é **um** defeito no gerador, não N defeitos.

### Ataques que eu quero que você tente

- **Divergência entre páginas do mesmo tipo.** Duas páginas de componente devem ser
  estruturalmente idênticas: mesma ordem de seções, mesmos espaçamentos, mesma altura de
  cabeçalho. Compare TODAS contra a do `Button` (o exemplar declarado) e liste as que fogem.
- **O fallback contra o conteúdo rico.** 44 componentes ainda usam o fallback do registry.
  Eles ficam visivelmente piores/menores? A página parece quebrada ou só vazia? Diga.
- **Densidades.** Troque `data-density` para compact e spacious: algo estoura, encosta ou
  sobrepõe? O gate não cobre isso no catálogo.
- **RTL.** `dir="rtl"` no catálogo: o que espelha errado? (o core promete espelhar por
  propriedade lógica).
- **Zoom 200% e `prefers-reduced-motion`.** Alguma transição essencial some ou algo escapa?
- **O CSS morto.** `apps/catalog/assets/catalog.css` concatena fontes + core + chrome. Quanto
  do core não é usado por nenhuma página do catálogo? E há regra do chrome que não casa com
  nada?
- **Nomes privados.** `python scripts/validate.py` deve dar OK. Tente furá-lo: procure nome
  privado em arquivo novo, em comentário, em conteúdo de exemplo.

### Formato do relatório

Um arquivo `AUDIT-2026-07-26.md` na raiz, em pt-BR, com:

1. **Veredito em uma linha** por afirmação (1 a 13): CONFIRMADA / QUEBRADA / PARCIAL.
2. **Achados numerados**, do mais grave ao mais leve. Cada um com:
   - severidade (ALTO / MÉDIO / BAIXO) e por quê;
   - evidência medida (página, tema, seletor, valor esperado × obtido);
   - **causa raiz** — no gerador, no core, no conteúdo, ou no gate;
   - correção proposta em uma frase.
3. **O que os gates atuais NÃO pegam** — a lista que interessa. Para cada buraco, o teste que
   o fecharia.
4. **Falso alarme**: o que parecia defeito e não era, para não voltar na próxima rodada.

Sem elogio, sem resumo executivo, sem "no geral está bom". Se estiver bom, o relatório é
curto; se não estiver, é longo. Não invente achado para encher.

### Como rodar

```bash
pnpm install
pnpm build                 # completo: tokens, icons, core, fonts, react, docs, catalog
python scripts/validate.py # tem de dar "Aurea validation: OK"
pnpm test                  # 81 unit
pnpm test:visual           # 60 visual, 1 worker (serializado de propósito)
python -m http.server 8123 # e varra http://localhost:8123/apps/catalog/*.html
```

O axe está em `node_modules/.pnpm/axe-core@4.10.2/node_modules/axe-core/axe.min.js` —
injete com Playwright. Sem rede: o espelho do Kibo está em `C:\Meus Sites\kibo-ui.com`.
