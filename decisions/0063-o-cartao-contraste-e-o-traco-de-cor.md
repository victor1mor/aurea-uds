# ADR-0063 — O cartão `contrast` e o traço de cor no topo

- **Data:** 10/10/2026
- **Estado:** aceita · executada na `0.29.0` (ainda não publicada).
- **Origem:** o Lote N, dois pedidos de um consumidor do nativo (um app): MT-01, um cartão que se
  destaca da tela nos dois temas (o "mostrador"), e MT-02, um traço de cor no topo das caixas, na
  cor do assunto. Escolhas do Victor, depois de ver a referência principal, o mercado e a bancada
  parada: *"como recomendado e A, pode construir"*.
- **Muda:** o `Card` (web e nativo) ganha a variante `contrast` e a prop `accent`; um token novo,
  `--accent-width` (4); a ADR-0061 ganha uma exceção (o traço usa a cor cheia); o gerador de cores
  leva a marca para dentro de um pedaço com tema próprio. Nada sai, nada muda de nome.

## A regra

**1. `variant="contrast"` é o tema ESCURO dentro do cartão.**

- **No tema claro:** o cartão do tema escuro (`#292929`), sem linha em volta. Contra a tela clara
  (`#f5f5f5`), 13,3:1.
- **No tema escuro:** o cartão comum, com contorno amarelo (`--primary`), na borda de sempre (1).
- **Todo filho se ajusta**, porque lê as cores do escuro: texto (branco, 14,5:1), esmaecido
  (`#adadad`, 6,5:1), destaque (o amarelo, 7,6:1), selo, botão e campo. Na web, `data-theme="dark"`
  no próprio cartão (o caminho da `Section theme`); no nativo, um provedor de tokens só para os
  filhos (`TemaDentro`, interno). É a forma como a referência principal faz um pedaço escuro: o tema
  aplicado num elemento.
- **O que sai do cartão volta ao tema do app.** Na web, a folha vai para o fim da página e já sai
  fora do pedaço. No nativo, as seis janelas que saem do fluxo (`Select`, `Combobox`, `Dialog`,
  `ConfirmDialog`, `Drawer`, `BottomSheet`) pintam o fundo com os tokens do app
  (`useTokensDoApp`, interno), e o `ForaDaMarca` devolve o contexto do app ao que está dentro delas.
- **O tema do app não muda:** `useAureaTheme()` continua dizendo o tema do app dentro do cartão.
- **A marca não atravessa:** um `contrast` dentro do cartão `brand` não herda a tinta do amarelo.
- Aceita `onPress` + `accessibilityLabel` no nativo, e `render` na web, como os outros cartões.
- O nome é `contrast`, e não `inverse`: o cartão contrasta com a tela nos dois temas, mas no escuro
  ele não fica invertido.

**2. `accent` é o traço de cor no topo.**

- Cinco tons: `brand`, `success`, `info`, `warning`, `danger`. As oito cores de categoria ficam de
  fora: elas são cor de letra, que muda por tema, e não há cor cheia de categoria.
- Altura `--accent-width` (4), da borda de fora para dentro; os outros lados com a borda comum de 1.
- **A cor CHEIA do tom, a mesma nos dois temas** (`--primary`, `--success`, `--info`, `--warning`,
  `--destructive`). É a exceção que esta ADR abre na ADR-0061 (item 3, "borda e barra usam o par
  `-400`"): o traço é enfeite. O nome da caixa diz o assunto, e o traço não carrega informação, então
  a norma de contraste para elemento gráfico não o obriga. Medido contra o cartão (claro / escuro):
  amarelo 1,9 / 7,6 · verde 5,4 / 2,7 · azul 4,5 / 3,2 · laranja 3,1 / 4,7 · vermelho 6,1 / 2,4.
- **Na web**, a borda de cima: o navegador afina o traço na curva do canto até a borda de 1. Ele vence
  as bordas do `selected`, do `danger` e do contorno do `contrast` (duas classes de força, depois).
- **No nativo**, uma faixa numa camada que se recorta no canto do cartão. Uma borda mais grossa só em
  cima, com o canto 22, desenha errado no Android: o defeito está registrado no projeto do React
  Native (#51926, fechado sem conserto em 24/03/2026). O recheio de cima cresce o que o traço come,
  para o conteúdo ficar onde fica na web.
- Funciona com `onPress`, com `accessible` e dentro da `Grid`.

**3. A marca chega a um pedaço com tema próprio.** O seletor da marca exigia marca e tema no MESMO
elemento (`[data-brand="lory"][data-theme="dark"]`). Uma `Section theme="dark"` ou um `contrast`
numa página `lory` saíam com o escuro da Aurea — medido em 10/10/2026: `--card` `#292929` e o
amarelo, em vez do azulado e do laranja da `lory`. O gerador agora emite também a forma com o tema
dentro da marca (`[data-brand="lory"] [data-theme="dark"]`). O defeito existia desde a `0.22.0`
(a `Section theme`, GAR-05).

## As fontes

- **A referência principal** (o pacote web dela e o do telefone, na versão atual, lidos em
  10/10/2026): o cartão dela tem só quatro variantes de fundo, sem cor de tom; ela **não tem cartão
  escuro nem traço de cor**. Tem o mecanismo: o tema escuro num elemento, na web, e um componente da
  biblioteca de estilo, no telefone. O que ela abre por cima vai para a raiz da tela, fora do pedaço.
- **O mercado** (20 sistemas abertos no código ou na página oficial): só um tem cartão escuro pronto
  (uma classe no cartão); a forma comum é o tema num pedaço da tela. **Nenhum tem traço em cartão.**
  Faixas num lado só aparecem em aviso e citação, sempre à esquerda, de 3 a 10. Um sistema tinha
  faixa no topo do aviso e a retirou na versão nova; o guia de migração dele manda refazer com borda
  de 3, na cor cheia.
- **A medida do traço** é a do pedido (4), aprovada pelo Victor. O mercado usa 3; a referência
  principal não tem.

## Alternativas rejeitadas

- **Fundo `#242424` no claro** (o do pedido): pediria um token só para isso. O cartão do escuro
  (`#292929`) é a mesma ideia, sem número novo.
- **Contorno no escuro com outra largura:** o `selected` da web tem 2 (borda e linha por dentro) e o
  foco tem 3; o `contrast` fica com 1. ⚠ No nativo, o `selected` tem só a borda (1): ali o que
  diferencia é o fundo (o `selected` é mais claro). Por isso a ficha avisa: não usar o `contrast`
  numa lista de escolha.
- **Traço na cor de letra (`-400`)**, como a ADR-0061 mandava: todos passariam de 5,3:1, mas no claro
  o laranja vira marrom e o amarelo vira ouro escuro. O Victor escolheu a cor cheia.
- **Uma lista declarada de filhos que se ajustam**, como o cartão `brand` faz: componente fora da
  lista ficaria quebrado. O tema inteiro alcança todos.
- **Deixar as janelas abertas de dentro no escuro:** seria coerente, mas diferente da web e da
  referência principal, onde elas saem no tema do app.

## Como ela é obrigada

- `tests/unit/lote-n.test.tsx` (web): o `data-theme` no cartão, a regra do contorno com a guarda do
  GAR-05, a medida nova, as cinco cores cheias, o traço depois das regras que mudam a borda, e o
  seletor da marca nas duas formas. Provado contra a `0.28.0`: 12 de 15 reprovam.
- `tests/unit/native-lote-n.test.tsx` (nativo): o fundo e o contorno nos dois temas, os filhos com as
  cores do escuro, o toque, o tema do app, a marca que não atravessa, a lista do `Select` e o
  `Dialog` abertos de dentro no tema do app, a camada do traço, o recheio, e nada mudando sem
  `accent`. Provado contra a `0.28.0` (18 de 22 reprovam) e contra a primeira versão desta sessão
  (a lista e o diálogo saíam com o fundo do escuro e a letra do claro: 2 reprovam).
- `tests/unit/paleta-adr0061.test.tsx`: a cor cheia só entra pela variável do traço, e a variável só
  pinta o traço. Qualquer outra borda com a cor cheia continua reprovando.

## Consequências

- O app troca o círculo do ícone (montado à mão) pelo `accent`, e o cartão da moto pelo `contrast`.
- Token novo muda a contagem da barra de cima do catálogo: as fotos `topo` e `tokens` da CI vencem.
- Toda janela nova do nativo que sai do fluxo pinta o fundo com `useTokensDoApp`, como as seis de hoje.
- O traço no nativo depende de a camada se recortar no canto: precisa do aceite no aparelho Android
  (bloco `0.29` do `apps/native-smoke`).

## Quando rever

Se um consumidor pedir o traço em outro lado (o mercado usa a esquerda) ou o `contrast` claro num
app escuro.
