# ADR-0072 — Sem linha: nenhuma peça da Aurea desenha borda (menos a caixa de contorno), e o que sumia ganha fundo

- **Data:** 16/10/2026
- **Estado:** aceita · feita na branch `claude/lote-s`, na `0.34.0`. A primeira versão (só tirar a linha) foi
  REPROVADA na bancada — peças sumiram junto com o fundo —; os fundos novos (item 7) e a linha clara da caixa da
  vitrine (item 8) foram escolhidos pelo Victor, peça a peça, olhando a bancada: *"caixa B, o resto tudo B"*.
  **Ampliada em 17/10/2026** (lote T, `0.35.0`): a segunda linha, a de ponta a ponta embaixo das áreas do site (item 9).
  **Mudada em 22/10/2026 pela [ADR-0078](0078-no-claro-o-campo-e-branco-com-sombra.md)** (`0.40.0`): no tema CLARO, o
  CAMPO solto na página é branco com a sombra `--shadow-sm`; dentro de uma superfície branca e no escuro, o item 7 vale
  como era.
- **Origem:** o Victor, 16/10/2026, marcando na vitrine o segmentado, as abas e o aviso: *"não tem borda não tem linha
  ao redor e isso acho bonito quero fazer isso em todos os componentes, sem exceção, precisa me provar que fez em
  todos"*. Depois de ver a proposta simulada em todas as páginas do site, lado a lado com a de hoje, e as peças em que
  a linha é o desenho: *"olhei quero tudo sem borda sem exceções"*. E: *"deixe de fora, travas e mnt-28, faça agora só
  a atividade das linhas"*.

## Contexto

Medido no CSS de 16/10/2026: 168 regras do core desenhavam linha (borda com cor, ou o anel fino de `box-shadow`), 15
do site, 7 no tema do editor de código, e 59 cores de borda no nativo. A referência principal faz o contrário nos
campos: a borda existe, com cor transparente e espessura 0 (*"no border by default on form fields"*, no CSS publicado
dela, 3.2.6); o cartão também não tem linha.

Medido no site no ar, o preço para a baixa visão: sem a linha, o campo se separa da página só pela cor do fundo —
1,3:1 no escuro (com a linha, 7,3:1) e 1,09:1 no claro (2,06:1). O Victor viu os números antes de decidir; as peças
que ele marcou como bonitas já estavam nessa faixa (o segmentado 1,3:1, o aviso 1,13:1).

## Decisão

1. **Nenhuma peça desenha borda** — com DUAS exceções, decididas pelo Victor: o cartão de contorno (item 8) e a linha
   embaixo das áreas do site (item 9). Toda cor de borda é `transparent` — no core, no site, nas peças da web, nos
   exemplos do site e no nativo — e o anel fino de `box-shadow` (deslocamento 0, desfoque 0, até 2 de espessura) sai,
   porque é a mesma linha por outro caminho. **A espessura fica**: a borda continua lá, transparente, e nenhuma
   medida de peça muda.
2. **O foco fica.** O anel de foco (`outline` na web; no nativo, a borda da cor do foco, porque o React Native não
   tem `outline`) não é contorno da peça: mostra onde o teclado está, e foco visível é regra da Aurea.
3. **O que era DESENHADO com linha, e sumiria, vira desenho cheio** (não é exceção à regra: deixa de ser borda): o
   visto do checkbox (máscara na web, SVG no nativo), a rodinha de carregando (o mesmo arco — a referência também
   desenha a dela cheia), os pinos que se arrastam sobre a cor (o disco da cor, solto pela sombra), a amostra de cor
   (a sombra a solta do fundo branco), o "fora do ar" do `Status` (a bolinha apagada, e a palavra diz o estado), o
   traço do `Card accent` (cheio no topo, como o nativo já fazia), o cursor do editor de código.
4. **O que era AVISO feito de linha vai para o FUNDO**: o campo inválido (o fundo de perigo, `--danger-bg`, o mesmo dos
   avisos), o cartão escolhido (a marca a 12%), o passo com erro, a execução rodando ou com erro, a mensagem de erro, o
   item ativo da mídia, o nó e o contêiner escolhidos do mapa. O nó com o foco do teclado no mapa leva o anel de foco.
5. **O que já era desenho cheio continua**: o separador, o traço que liga os passos, a linha do tempo, o indicador das
   abas, as barras de progresso. O marcador do item ATUAL que era borda de um lado (a barra do `TableOfContents`, o
   traço da área atual no topo do site) é o mesmo indicador: volta como desenho cheio, no lugar da borda. Não são borda — e foi assim que o Victor os viu no comparativo antes de decidir.
6. **O recorte também sai**: o anel da cor do fundo que separava a bolinha da `Timeline` do traço, e o selo preso
   (`badge-overlay`) da peça embaixo dele. Dentro de uma caixa de outra cor ele aparecia como linha — a varredura do
   navegador mostrou os dois.

7. **O que sumiu junto com o fundo ganha um FUNDO** (a reprovação de 16/10: *"você precisa sugerir cores novas para
   componentes que sumiram total junto com fundo"*). Medido nas 149 páginas, nos dois temas: 81 casos de peça que perdeu
   o contorno e ficou com o fundo igual ao de trás (1,00 a 1,06:1). A resposta são três fundos TRANSLÚCIDOS da cor do
   texto — como o trilho desligado do switch da referência (`default-foreground` a 20%) —, que se separam de qualquer
   fundo atrás; uma cor fixa acaba igual a alguma superfície. `--fill-1` 6%, `--fill-2` 10% (campos, botão de contorno,
   barra de ferramentas, código, registro, área de soltar), `--fill-3` 20% (marca do checkbox e do rádio, trilho do
   switch); o botão de contorno com tom e o selo de contorno levam o tom a 16% (o botão, 22% com o mouse). A letra
   do selo de contorno vai 20% para a cor do texto nos dois temas (o verde do claro caía a 3,79:1; o `success` do
   escuro, a 4,15:1 no cartão), e a do nível `info` do registro também. No CLARO, a letra do botão
   de contorno com tom de estado vai 20% para a cor do texto: o azul do claro fica perto do limite contra a página
   branca, e sobre o tom a 16% caía a 4,02:1 (o mínimo é 4,5). O Victor viu três saídas na bancada (a letra de
   sempre, que reprova; o fundo do botão suave, que passa mas some, 1,00:1; e esta) e escolheu esta. Onde algo passa POR TRÁS ou uma peça cobre outra (a
   bolinha dos passos, as fotos de perfil, o nó do mapa), a mesma mistura OPACA sobre a cor da página (`-solid`) — a
   primeira sugestão, translúcida, deixava o traço aparecer atrás da bolinha (o Victor, na bancada). No nativo, o mesmo
   por `preenchimento(t, 1|2|3)` e `misturaOpaca()` (`estilos.ts`); dentro do cartão amarelo da marca, a tinta dele a 14%.
   Os pinos que se arrastam sobre a cor: branco por baixo e a cor numa bolinha por cima (desenho cheio, não aro), com
   sombra. Medido: no escuro 1,34:1 (campos) e 1,92:1 (controles); no claro 1,21:1 e 1,49:1.
8. **A única linha que fica: o cartão de contorno** (`Card variant="outline"`, a caixa da vitrine do Início), clara — o
   texto a 10% (1,34:1 no escuro, 1,21:1 no claro). Sem ela a caixa, que não tem fundo, deixava de existir; o Victor viu
   as três saídas (sumir, linha clara, fundo leve) na página inicial de verdade e escolheu a linha clara. As duas provas
   a trazem por escrito, só para esse seletor sozinho.
9. **A segunda linha: a de ponta a ponta embaixo das áreas do site** (o `Header` com `tabs` e `divider`; no site, a
   barra de cima com a linha das áreas). Decidida pelo Victor em 17/10/2026, olhando a documentação da referência ao
   lado da nossa: *"adicione essa linha que tem abaixo das opções Docs Components Patterns…"* e, à pergunta se era a
   linha que vai de uma ponta à outra, *"sim"*. É a da referência: 1 de altura, pendurada logo abaixo da barra (a
   barra fica com 100 cravados), na cor da linha da Aurea (`--border`), e o traço da área atual encosta nela. É
   desenhada como fundo de um `::after`, e não como borda — por isso as duas provas não a veem; ela vale só ali.

## Alternativas rejeitadas

- **A linha volta quando o sistema pede mais contraste** (`prefers-contrast: more`): proposta ao Victor; ele preferiu
  sem linha, sem exceção.
- **Exceções para as peças em que a linha é o desenho** (checkbox, rádio, as variantes de contorno, a rodinha, a
  amostra branca, os separadores): mostradas uma por uma no comparativo; recusadas (*"sem exceções"*). Onde a peça
  sumiria, ela foi redesenhada cheia (item 3) em vez de virar exceção.
- **Só tirar a linha** (a primeira versão): reprovada na bancada — campos, botões de contorno, a caixa da vitrine,
  o código e os controles vazios sumiam inteiros, sem linha e com o fundo igual ao de trás.
- **Um fundo de cor fixa** (o `--field-bg`, que as marcas redefinem): é exatamente o que some quando a superfície atrás
  tem a mesma cor. O translúcido não tem esse caso.
- **Espessura 0 em vez de cor transparente**: muda a medida de toda peça com borda (2 px a menos em cada caixa) e
  todas as fotos, sem diferença que se veja. Transparente guarda as medidas que vieram da referência.

## Consequências

- **Variantes que eram a própria linha ficam parecidas com outras**: o botão e o selo de contorno ganham fundo (o
  botão neutro fica perto do secundário); o `Card contrast` no escuro perde o contorno amarelo e fica igual ao cartão comum; as abas
  `secondary` perdem o fio de baixo; a tabela perde as linhas entre as linhas; o cartão tocável do nativo fica igual
  ao comum. As props continuam (componente não se exclui).
- **A norma 1.4.11 (3:1 no limite do campo) deixa de ser cumprida** nos campos, como medido acima — decisão do Victor.
  O campo dentro do cartão amarelo do nativo, que só a linha da tinta separava (4,54:1), passa a ser a tinta a 14%.
- **A ADR-0059 ("uma borda só no foco") fica sem objeto na parte da borda**: não há mais borda para o anel encostar. O
  anel de foco e a aba escolhida que se vê continuam.
- **Quase todas as fotos de comparação mudam** (web e nativo), nos dois sistemas.

## Quem cobra

- `tests/unit/sem-linha.test.tsx` — lê o CÓDIGO e pega todo estado (o mouse, o inválido, o escolhido, o arrastar):
  core, site, peças da web, exemplos e partes vivas do site, e o nativo (onde só a cor do foco passa). Provado contra
  a 0.33.0: 168 / 15 / 7 / 59 achados.
- `tests/visual/catalog-sweep.spec.ts`, "nenhuma peça desenha linha, em nenhuma página, nos dois temas" — abre toda
  página do site (e das prévias em documento próprio), nos dois temas, e mede cada elemento e os `::before`/`::after`,
  nos três navegadores. A primeira rodada achou o que a leitura do código não via (a caixa tracejada dos exemplos de
  contêiner, escrita no exemplo); a segunda, os dois recortes (item 6).
- O teste de foco da ADR-0059, na mesma varredura: anda com Tab por toda prévia e exige zero borda na peça focada.

## Condição de revisão

O Victor pedir a linha de volta em alguma peça, ou em algum modo (o alto contraste, por exemplo). A volta se faz pela
cor da borda, que está lá, transparente — sem mudar medida.
