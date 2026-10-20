# ADR-0074 — A abertura de página, o aviso de cookies e o Chip

- **Data:** 19/10/2026
- **Estado:** aceita · feita na branch `claude/lote-u-mapa-gar`, para a `0.36.0`.
- **Origem:** os pedidos GAR-19 a GAR-22 de um consumidor da web (o site de um app), que o Victor mandou fazer junto do
  pedido 16 do app de topologia: *"falta só eles pra eu poder iniciar o outro projeto"*. As quatro escolhas são dele,
  feitas em 19/10/2026 sobre as recomendações: *"Variação do Banner"*, *"No alto, sem prender"*, *"Chip = outro nome do
  Badge"* e *"Section hero + 60 e 72"*.

## A regra

1. **A abertura de página é a `Section variant="hero"`** (GAR-21): a sobrelinha (`eyebrow`), o título (`title`, o `<h1>`;
   `titleAs="h2"` quando não é a primeira faixa), o texto (`description`), os botões ou o campo de e-mail (`actions`) e a
   imagem (`media`). `align="start"` põe o texto à esquerda e a imagem ao lado a partir de 1024; `align="center"` centra
   tudo, com a imagem embaixo. O que vem dentro (`children`) vai depois dos botões. No celular, tudo empilha.
2. **O título de capa cresce 36, 60 e 72** (GAR-22): os tokens novos `--text-6xl` (3,75rem) e `--text-7xl` (4,5rem), o
   degrau seguinte da escala publicada da referência depois do `--text-5xl` (ADR-0050), com `--leading-none`. 36 até 768,
   60 de 768 a 1024, 72 a partir de 1024.
3. **As larguras são da FAIXA, não da janela** (`@container`, como o `.media-player`). De ponta a ponta, dá o mesmo;
   numa coluna mais estreita (a prévia do catálogo, uma faixa dentro de outra), o título não passa dela. O 72 entra em
   1024, e não em 1280: numa janela de 1280 a barra de rolagem deixa a faixa com menos de 1280, e o 72 nunca apareceria
   na tela do Victor (1920 com zoom de 150%).
4. **Os vãos da abertura são os do início da referência** (medidos em 15/10/2026): a sobrelinha a 8 do título (16 a
   partir de 1024), o texto colado no título, os botões a 16, o que vier depois a 8 (16 a partir de 1024); o texto 16/24 e
   18/28 a partir de 768, em 672 de largura. A imagem toma a largura da coluna: quem a dimensiona é o app.
5. **O Início do site usa a peça** (`align="center"`). O título passa do 30/36/48 da referência ao 36/60/72 da Aurea; os
   vãos e o texto não mudam.
6. **O aviso de cookies é o `Banner variant="consent"`** (GAR-19). Nenhuma referência da fila tem a peça aberta; as regras
   vêm de duas fontes primárias, lidas em 19/10/2026: o guia de cookies da ANPD (págs. 30–33) e o aviso de cookies do
   governo britânico.
   - No primeiro nível, três botões de MESMO peso, nas palavras do guia: "Rejeitar cookies não necessários", "Aceitar
     todos os cookies" e "Selecionar cookies". Rejeitar é tão fácil de ver quanto aceitar.
   - "Selecionar" abre a janela de preferências (o `Dialog`), uma categoria por linha: as não necessárias com o `Switch`,
     começando DESLIGADAS; as necessárias com "Sempre ativos", sem chave.
   - Depois da escolha, a confirmação toma o lugar dos botões, com `role="alert"`, e recebe o foco (o botão apertado
     sumiu). "Ocultar esta mensagem" fecha o aviso.
   - O aviso é uma região com nome (o `<h2>`), mora no alto da página, antes do "pular para o conteúdo", e NÃO fica preso
     à tela: com `position:fixed` ele cobriria o que recebe o foco (WCAG 2.4.11).
   - O app guarda a escolha (`onConsent`) e deixa de desenhar o aviso. Para mudar depois (o "jeito direto" do guia), o
     app desenha o aviso de novo a partir de um link do rodapé, com `value` = a escolha guardada.
   - O fundo é o do cartão, com a sombra do `Alert`: no cinza do `Banner` comum, os botões cinza sumiam.
   - Só na web. As frases são onze chaves novas do `AureaStrings` (`consent*`), em inglês e em português.
7. **`Chip` é outro nome do `Badge`** (GAR-20), como o `Topbar` é do `Header`: o mesmo componente, a mesma marcação, na
   web e no nativo. Não é nome antigo (não é `@deprecated`): é o nome que a referência dá à mesma peça. O comentário do
   `aurea.css` que citava "o .chip do catálogo" passa a dizer que aquela é a classe do SITE, não peça da Aurea.

## Quem cobra

- `tests/visual/skin.spec.ts` — a abertura só com o core, em faixas de 375, 900 e 1300 na mesma janela (36, 60 e 72; a
  imagem embaixo e ao lado; os vãos; a centrada) e o `Chip` com a mesma marcação do `Badge`. Provado: sem as regras, e
  com `@media` no lugar de `@container`, reprova.
- `tests/visual/aviso-de-cookies.spec.ts` — o aviso no banco `apps/keyboard-probe/lote-u.html`, nos três navegadores.
  Provado estragando o código montado: categorias ligadas, foco fora da confirmação, aceitar com mais peso.
- `tests/visual/catalog-sweep.spec.ts` — o Início com o título novo (72/72 no largo, 36/40 no celular) e os vãos de antes.
