# ADR-0092 — Os pontos de quebra seguem a fonte

- **Data:** 06/11/2026
- **Estado:** aceita · na `0.61.0` (branch `claude/lote-062`).
- **Origem:** a conferência da auditoria externa (05/11/2026) achou que, com a FONTE PADRÃO do navegador a 200% numa tela
  de 1280, o site espremia as três colunas — a do meio ficava com 128, o título saía uma letra por linha e o topo ocupava
  460 dos 900. O desenho (hoje e a proposta) foi ao FigCraft e o Victor aprovou (*"Pode"*); o arranjo é do `AppShell` do
  core, e mudar o core alcança todo app — ele mandou fazer (*"vamos fazer logo todas agora, para não atrapalhar a 1.0"*).

## A regra

1. **Todo ponto de quebra de TELA é em `em`**: no CSS do core (`@media`), na camada responsiva gerada
   (`build-responsive-layer.mjs`), no CSS do site e nas perguntas que o JavaScript faz à tela (`matchMedia` do `AppShell`,
   das props responsivas e do site). Numa consulta de mídia, `em` é a fonte que a pessoa escolheu no navegador: com a fonte
   em dobro, a tela de 1280 se comporta como a de 640 — o mesmo arranjo que o zoom de 200% já dava.
2. **O valor é o mesmo**: o pixel dividido por 16 (`1024px` → `64em`, `767px` → `47.9375em`). Com a fonte normal, nada
   muda — nenhuma foto mudou.
3. **O contêiner continua em px** (`@container`): ele mede o ESPAÇO da caixa, e não a tela.
4. **Os tokens `--breakpoint-*` continuam em px** (é o número da escala); a trava 4b lê `em` × 16 contra eles.
5. **CSS e JavaScript concordam**: uma pergunta em px num lado e em `em` no outro deixaria a lateral aberta pelo JS e fechada
   pelo CSS com a fonte aumentada.

## Quem cobra

- `tests/visual/texto-200.spec.ts` — a fonte padrão do Chromium em 32 (CDP `Page.setFontSizes`), a página do Button a 1280:
  uma coluna, o título numa linha, o topo baixo, sem rolagem de lado; e, com a fonte normal, as três colunas. Provado contra
  o site de antes (o título saía uma letra por linha).
- A trava 4b do `validate.py` (a escala, agora lida também em `em`).
