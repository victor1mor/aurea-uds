# ADR-0057 — A conversa longa é uma janela que o app troca pelas pontas, sem biblioteca de virtualização

- **Data:** 04/10/2026
- **Estado:** aceita · executada na `0.19.0` (Lote H), aprovada pela bancada do Victor (*"Pode"*,
  04/10/2026). Falta a publicação.
- **Origem:** AN-02, pedido de um consumidor novo da web (`docs/FILA.md` §9): conversas com
  centenas de milhares de mensagens, e o `MessageList` desenhava todas na página.
- **Decidido por:** o Victor, em 04/10/2026, depois da medida abaixo — *"Janela nossa, sem
  dependência"*. Antes dela, a recomendação desta sessão era a biblioteca; ele perguntou *"Pq não
  ter nosso, não quero mais dependência? É muito necessário?"*, e a medida mudou a recomendação.
- **Muda:** acrescenta seis props ao `MessageList` (`hasMoreBefore`, `onReachStart`,
  `loadingBefore`, `hasMoreAfter`, `onReachEnd`, `loadingAfter`). Nenhuma dependência entra.

## A medida

O `MessageList` da `0.18.0`, com tudo virando página, no Chromium da sessão de nuvem (máquina de
servidor; num celular deve ser algumas vezes mais lento — **não medido no aparelho**):

| mensagens na tela | abrir | carregar 50 antigas | rolagem (quadro médio · pior) | memória |
|---|---|---|---|---|
| 1.000 | 0,3 s | 0,08 s | 16,7 · 17 ms | 11 MB |
| 10.000 | 2,4 s | 0,34 s | 16,4 · 26 ms | 47 MB |
| 50.000 | 10,7 s | 1,4 s | 42,5 · 135 ms | 191 MB |

Até umas mil mensagens não há problema nenhum. O problema é **deixar acumular**.

## A decisão

1. **O app guarda uma janela** (umas mil mensagens) e a troca pelas pontas: ao chegar no alto,
   carrega as antigas e descarta as recentes do outro lado; ao descer, traz de volta. A Aurea só
   avisa (`onReachStart`, `onReachEnd`) quando a linha de cada ponta entra na tela — a linha de
   "carregar mais" da tabela da referência, a mesma da `Gallery` (AN-05).
2. **O que é da Aurea é não pular.** A mensagem que começa no alto da tela fica no mesmo lugar
   quando entram antigas em cima, saem recentes embaixo, ou alguma coisa cresce depois de montar
   (a fonte, uma foto). A conta é guardar a posição dela a cada rolagem e rolar a diferença depois
   da troca, e de novo a cada mudança de tamanho da lista.
3. **Quem está no fim acompanha** a mensagem que chega; quem subiu, não é puxado. A lista abre no fim.
4. **Leitor de tela:** com a janela, a lista deixa de ser região viva (`aria-live="off"`) — senão
   as cinquenta antigas carregadas em cima seriam lidas em voz alta — e um anunciador à parte lê só
   a mensagem que chega no fim (o idioma do `NotificationCenter`).
5. **Sem as props novas, nada muda:** a lista não rola nada e continua região viva.

## Alternativas rejeitadas

- **Uma biblioteca de virtualização** (MIT, 7,8 KB minificado + gzip, `npm audit` limpo). Tem o
  modo de conversa oficial desde 25/05/2026 (ancorar no fim e acompanhar o que chega, conferidos no
  pacote baixado). Era a recomendação da sessão. **Rejeitada pelo Victor:** mais uma dependência, e a
  medida mostrou que ela não é necessária enquanto o app guarda uma janela.
- **Outra, menor** (MIT, 4,1 KB): ainda em `0.x`, com a API mudando.
- **Uma terceira** (MIT, 20,1 KB): a peça de conversa dela é paga.
- **Virtualização escrita aqui:** com mensagens de alturas diferentes, segurar a posição ao carregar
  as antigas é justamente o ponto difícil (a primeira biblioteca só o resolveu em maio de 2026). Seriam 300 a
  500 linhas de risco para um ganho que a janela já entrega.
- **`content-visibility: auto`** (o navegador pula o desenho fora da tela). Medido: abre mais rápido
  (10 mil em 0,36 s), mas **piora** a rolagem (quadro médio de 16 para 38 ms com 10 mil; de 42 para
  313 ms com 50 mil).
- **`overflow-anchor` do navegador** para não pular: o Chromium segura sozinho, mas não é garantia
  em todo navegador, e o teste precisa provar a conta da Aurea. O banco desliga a âncora do
  navegador no contêiner.

## Como ela é obrigada

- `tests/visual/lote-h.spec.ts`, sobre o banco `apps/keyboard-probe/lote-h.html` (5.000 mensagens
  de mentira, janela de 200): abre no fim; carrega as antigas e a mensagem do alto não anda mais de
  1 px; a janela não passa de 200 e trazer as recentes de volta também não pula; quem está no fim
  acompanha. **Provado contra o defeito:** sem a conta de segurar, os dois testes de "não pular"
  reprovam; sem o acompanhamento por tamanho, reprovam "abre no fim" e "acompanha"; e o código da
  `0.18.0` reprova os sete.
- `tests/unit/conversa-an02.test.tsx`: as linhas das pontas, o anunciador e a lista fora da região viva.

## Consequências

- **Custo para o app:** ele descarta as mensagens distantes e recarrega quando a pessoa volta a
  elas. Pular para uma mensagem fixada antiga é carregar o pedaço em volta dela — o mesmo que ele
  faria com a biblioteca.
- **Achado no caminho (04/10/2026):** a primeira âncora era a primeira mensagem *à vista*; um
  álbum cortado no alto cresceu 480 px para baixo dele, e a conversa desceu sem a conta perceber.
  A âncora é a primeira mensagem que **começa** na tela.

## Condição de revisão

Se um app precisar guardar dezenas de milhares de mensagens na página de uma vez (sem poder
descartar), ou se a janela de mil medir lenta no aparelho, a virtualização volta à mesa — e a
primeira candidata é a mesma, com a medida refeita.
