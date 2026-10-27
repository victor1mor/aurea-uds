# ADR-0083 — A paleta da 1.0: o destaque grafite, a base Zinco profundo e o amarelo que não vira letra (passo A)

- **Data:** 26/10/2026 (as decisões) · 27/10/2026 (o passo A construído)
- **Estado:** aceita · o passo A na branch `claude/cores-a`, para a `0.45.0` — web e nativo. Os passos B (os estilos novos
  do botão ligado, do segmento, da barra de baixo e da linha do tempo) e C (as marcas: a `lory` vira Aurea Ember, e as 11
  marcas extras) acrescentam a esta ADR.
- **Origem:** a proposta de cores que o Victor preparou em outra conversa, *"definindo toda paleta vendo componente a
  componente"* (25 e 26/10/2026), aprovada família por família — seleção, campos, ações, navegação, avisos, dados,
  sobreposições e gráficos — numa bancada com os componentes reais da 0.43.0. Lida inteira aqui em 26/10/2026 (os oito
  arquivos), e a ordem decidida por ele: *"Aprovo a ordem"* — o passo A, o B, o C, e depois o site novo. A padrão continua a
  Aurea Gold, o amarelo de sempre (*"a gold que é padrão"*). E o passo A: *"Pode começar o passo A das cores, a paleta, com
  o registro da 0.44.0 junto."*

## O que se mediu

- **Os pares obrigatórios** (a auditoria da proposta, a fórmula da WCAG): 78 por tema — texto, fundos, campos, botões,
  estados, categorias, gráficos, foco, seleção, mídia. Na 0.43.0 reprovam **6 no claro e 5 no escuro** (o foco amarelo no
  branco, 1,91:1; o `--ring`; o texto do aviso no hover, 4,09:1; o `chart-1` do claro, 1,81:1; o `chart-4` e o `chart-5`
  do escuro; o item atual da lateral no claro). Com a proposta, **nenhum**.
- **Aqui, contra o código** (27/10/2026): as 78 cores da Aurea calculadas pelo navegador na folha montada são as da
  proposta, sem diferença; e na `lory`, nenhuma das 241 variáveis de antes muda (as quatro novas não são usadas nela).
- **Dois defeitos da bancada da proposta**, achados lendo a força dos seletores: o botão ligado novo perdia, no claro,
  para a regra de hoje — a letra continuava a mistura "marrom" sobre o amarelo, e o fio de baixo continuava, porque as
  regras de hoje pesam mais (`[data-theme="light"] .btn[aria-pressed="true"]` e `.btn[aria-pressed="true"]:not(.btn-icon)::after`
  contra `:is(.btn[aria-pressed="true"],…)`). A intenção escrita é clara — a letra do botão primário, sem fio —, e é a que
  entra.
- **Uma medida errada no texto da proposta:** a célula de "atenção" do painel de saúde — o texto diz `#D47919`, que dá
  **2,94:1** na página (reprova); o CSS da proposta diz `#D07612`, **3,07:1** na página e 3,34:1 no cartão. Vale o do CSS.
- **Os recursos novos, nos três navegadores da CI** (Chromium, Firefox e WebKit do Playwright 1.61.1, 27/10/2026): o
  marca-texto feito com sublinhado grosso deslocado para trás das letras (`text-decoration-thickness` em `em`,
  `text-underline-offset` negativo, `text-decoration-skip-ink: none`) aparece igual nos três; e o "aumentar contraste"
  (`prefers-contrast: more`) é reconhecido nos três.
- **O nativo** (o React Native 0.87.1, lido no código): o iOS responde por `isDarkerSystemColorsEnabled()` e o evento
  `darkerSystemColorsChanged`; o Android, por `isHighTextContrastEnabled()` e `highTextContrastChanged`. O nativo não tem
  marca (`data-brand` só existe no CSS da web).
- **Os links sem classe do site** (as 588 páginas montadas, 27/10/2026): 596 — 588 são a chave Web | Native no alto da
  página (um controle segmentado dentro de `<nav>`), 6 a trilha, **2 na prosa**.
- **A borda do botão de contorno não se pinta** desde a ADR-0072 (`border:1px solid transparent`; a variável `--btn-border`
  não é lida em lugar nenhum): a parte da regra da proposta que a pintava de amarelo não teria efeito.

## A regra (o passo A)

1. **A base Zinco profundo** (substitui os neutros da ADR-0061): claro — página `#F5F5F5`, cartão branco, texto
   `#09090B`, secundário `#EBEBED`, texto de apoio `#686871`; escuro — página `#09090B`, cartão `#18181B`, texto `#FAFAFA`,
   secundário `#27272A`, texto de apoio `#A1A1AA`. **O cartão do escuro não tem linha** (o Victor, 26/10/2026: *"sem
   bordas"* — a ADR-0072 continua).
2. **No claro, o amarelo nunca é letra.** O destaque (`--primary-emphasis`) e o link (`--link`) são o grafite do texto; o
   amarelo aparece como fundo, traço, sublinhado, faixa ou indicador. No escuro, o amarelo é o próprio destaque. O azul da
   marca deixa de ser destaque e link (continua como cor auxiliar).
3. **O link** separa-se do texto por mais que a cor (WCAG 1.4.1): no claro, o **marca-texto** é o padrão — a faixa
   amarela a 45% atrás da metade de baixo das letras, a palavra inteira no ponteiro (14,79:1) —, e o grafite com o
   **sublinhado** amarelo é a variação (`class="link-underline"`, ou `data-link="underline"` num contêiner); no escuro, o
   amarelo sublinhado, sem faixa (amarelo sobre quase preto vira marrom). Vale para o link sem classe, para o `Link` e para
   o texto no tom link. **A navegação fica de fora**: a trilha (como a proposta pediu) e, pelo mesmo motivo, todo link
   dentro de `<nav>` e o segmento que é link (medido acima). No nativo, o `Text tone="link"`: a faixa num trecho de texto de
   dentro no claro, o sublinhado no escuro.
4. **Sobre o amarelo, a tinta `#18181B`** (era `#242424`), nos dois temas — a letra do botão primário, o ícone da barra de
   baixo cheia, o play (`--primary-mark` deixa de ser o marrom). **Dentro dos controles, as marcas são brancas**: a bolinha
   do `Switch` e a alça do `Slider` (o token novo `--control-thumb`), o visto do `Checkbox` e o ponto do rádio.
5. **O foco:** o `--focus` do claro é o bronze `#BD7000` (3,83:1 no branco; o amarelo dava 1,91:1). O grafite
   (`--focus-strong`) continua o foco da maioria das peças. **O foco dos campos é o amarelo**, uma linha só, nos dois
   temas — com 1,75:1 na página e 1,91:1 no cartão, abaixo dos 3:1; o Victor decide na bancada do passo A (*"acho que vou
   aprovar mesmo reprovando"*).
6. **O campo do claro é branco com a sombra fina em todo lugar** — também dentro das superfícies brancas (reverte o item 2
   da ADR-0078). No escuro, nada muda.
7. **"Aumentar contraste" do sistema** (`prefers-contrast: more` na web; o iOS e o Android no nativo): o campo ganha o
   contorno de 3:1 (`--input-strong`: `#8D8D91` no claro, `#646467` no escuro), as quatro marcas dos controles voltam à
   tinta e o foco do campo volta ao grafite. **É a segunda exceção nomeada à ADR-0072** — a única linha que só essa
   preferência acende.
8. **O escolhido do claro tem a letra grafite** — a aba, o segmento aceso, o item de navegação atual, o `.eyebrow`; no
   nativo, o `corDoEscolhido` e a letra do `tone="primary"`. O fio amarelo de baixo continua. Era a mistura de 45% (o
   "marrom").
9. **O botão ligado** (`Toggle`, `ToggleGroup`, `ToolbarButton`) é amarelo cheio com a letra do botão primário, sem o fio
   e sem o fundo "clarinho" — o estilo C, o padrão definitivo. Os estilos cinza e grafite entram no passo B.
10. **A linha do tempo** consertada: o trilho por baixo dos pontos e parando no último; o trilho em `--input`.
11. **Fora da marca:** a letra do aviso cheio é a tinta (4,67:1 no hover; era 4,09:1); os gráficos ganham cinco degraus
    azuis com 3:1 ou mais nos dois temas; a célula de "atenção" do painel, no claro, `#D07612` (o `--warning-500` do claro,
    o único uso dele).
12. **A `lory` fica 100% como é hoje** (o Victor, 26/10/2026), inclusive os pontos que já reprovam nela: os tokens dela são
    congelados na fonte, e toda regra nova leva `:where(:not([data-brand="lory"],[data-brand="lory"] *))`.

## O que ela substitui

- **ADR-0076** (no claro, a letra de destaque é o azul): inteira, menos o que ela já mantinha do amarelo.
- **ADR-0081**, itens 2 e 3 (a letra do `tone="primary"` e os botões da marca de contorno, fantasma e link, no claro, em
  azul): passam ao grafite.
- **ADR-0061**, nos neutros (a paleta de referência): passam ao Zinco profundo. As cores de estado continuam.
- **ADR-0078**, item 2 (o campo cinza dentro de uma superfície branca).
- **ADR-0073**, na tinta (`#242424` → `#18181B`).
- As decisões de 17/10/2026 (o marrom como marca sobre o amarelo), 23/10/2026 (a cor do escolhido a 45%) e 24/10/2026 (a
  letra do amarelo misturada com o texto, 80/150).
- A seção 5 do `CLAUDE.md` nesses pontos.

## As alternativas, e por que não

- **Escrever as regras da proposta por cima das de hoje, sem tocar nelas** (como a bancada fez): é o que entrou onde a regra
  nova ganha; no botão ligado e no escolhido, a regra de hoje passou a valer **só na `lory`**, porque por cima ela perdia
  pela força do seletor.
- **Tirar do nativo o contexto "estou numa superfície branca"** (`superficie.tsx`), que deixa de mudar a cor do campo:
  mexeria em oito peças fora do pedido. O contexto fica; a função do fundo do campo ignora a superfície, com a razão escrita.
- **A cor da célula de saúde solta no CSS:** número cru no fonte; foi para o token.
- **A faixa do marca-texto como `background`** (o laboratório da proposta): ia até o fim da linha quando o elemento ocupa a
  largura toda; a proposta já a trocou pelo sublinhado grosso.
- **A borda amarela do botão de contorno** (parte da regra 2.3): sem efeito desde a ADR-0072 — não entrou.

## Como é obrigada

- `tests/visual/lory-congelada.spec.ts` — a `lory`, nos dois temas, sai com as mesmas cores da 0.44.0.
- `tests/visual/paleta-passo-a.spec.ts` — no navegador: o escolhido grafite, o link com marca-texto (e a navegação sem), o
  botão ligado amarelo com a letra da tinta e sem fio, o campo branco no cartão, a linha do tempo por baixo dos pontos, o
  "aumentar contraste" (o contorno e as marcas na tinta).
- `tests/unit/paleta-passo-a.test.tsx` — os tokens (os valores da proposta, a `lory` congelada) e o nativo (o escolhido, a
  letra do amarelo, o campo, o foco, as marcas e o "aumentar contraste").
- `tests/unit/sem-linha.test.tsx` — a exceção do "aumentar contraste", provada nos dois sentidos (dentro da preferência
  passa; fora, a mesma linha reprova). `tests/unit/tema-na-secao.test.tsx` — toda regra nova de tema claro leva a guarda.

## As consequências, com os custos

- **Quase todas as fotos mudam de cor**, nos dois temas.
- **As exceções conscientes**, registradas: o foco amarelo dos campos no claro (1,75:1, à espera da bancada); as marcas
  brancas dentro do amarelo (1,91:1 — o estado se lê pelo controle cheio contra o vazio; com "aumentar contraste", viram a
  tinta). O campo sem linha continua abaixo dos 3:1 no visual padrão (1,09:1), como na referência.
- **No nativo, o link não tem a variação sublinhada no claro** (não existe prop para pedir); fica para quando for pedida.
- **A `lory` guarda os pontos que já reprovam nela** (a letra branca do botão primário no laranja, 3,08:1; o item atual da
  lateral, 2,59:1; o segmento aceso do escuro, 3,93:1) — decisão do Victor; o item do bloco 3 que os consertaria cai.
- **O conserto da linha do tempo não vale na `lory`**, porque nenhuma regra nova vale nela — pergunta levada à bancada.

## Revisão

Quando o Victor mudar qualquer um destes pontos. Os passos B e C acrescentam a esta ADR.
