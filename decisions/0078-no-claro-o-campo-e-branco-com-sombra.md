# ADR-0078 — No claro, o campo é branco com sombra; dentro de uma superfície branca, continua cinza

- **Data:** 22/10/2026
- **Estado:** aceita · feita na branch `claude/campos`, na `0.40.0` (a web e o site); **o React Native na `0.40.1`**, na
  branch `claude/nativo`, junto com a fonte do nativo (ADR-0077; o Victor, *"pode fazer juntos"*) — ver "O nativo", abaixo.
  **Muda o item 7 da [ADR-0072](0072-sem-linha.md) só para os campos, e só no tema claro.**
- **Origem:** o Victor comparou a página inicial da Aurea com a da referência, as duas na mesma largura: *"porque nossos
  caixas não são brancas?"* — e o sistema que serviu de modelo à ADR-0077 também usa o campo branco. Viu a bancada com quatro saídas nos temas da Aurea (claro, escuro e a marca `lory`), no
  notebook e no monitor de baixa visão: *"gostei Branco + sombra no meu notebook dá pra ver perfeitamente e no meu
  monitor va péssimo dá pra ver também por conta da sombra"*. E, sobre a sugestão: *"Pode seguir com a sugestão dos
  campos: branco com sombra no claro, escuro como hoje, cinza dentro de cartão."*

## O que se mediu

- **A referência** (lido no CSS publicado dela, 3.2.6): no claro, o campo é a cor de superfície (branco) com
  `--field-shadow: 0 2px 4px #0000000a, 0 1px 2px #0000000f, 0 0 1px #0000000f`, sem borda, sobre a página `#f5f5f5`; no
  escuro, a cor de superfície SEM sombra (`0 0 0 0 transparent inset`). Dentro de uma superfície, a variação `secondary`
  (o fundo neutro, sem sombra) — mas é o app que a escolhe.
- **A sombra dela é o nosso `--shadow-sm`, número por número** (ADR-0059). Nenhum número novo.
- **Na bancada, nos pixels desenhados** (a cor do campo contra a de volta): Aurea claro, o campo de antes 1,21:1; o
  branco 1,09:1 — quem desenha a borda é a sombra; branco dentro do cartão branco 1,00:1 (só a sombra); o de antes
  dentro do cartão, 1,21:1. Escuro: o de antes 1,34:1; o da referência (a superfície, sem sombra) 1,13:1.

## A regra

1. **No CLARO, o campo solto na página é a cor do cartão (`--card`), com a sombra `--shadow-sm`.** Vale para o campo de
   texto, a área de texto, a lista (`.select`, que também é o gatilho do seletor de data), o grupo de campo (e a busca),
   o número, a busca com lista e as casas do código — os mesmos que a regra do "sem linha" pintava. O campo de DENTRO
   de um grupo fica transparente e sem sombra (a do grupo basta).
2. **Dentro de uma superfície que pinta a cor do cartão, o campo continua o cinza de antes** (`--fill-2`, sem sombra):
   o cartão (menos o de contorno, que é transparente, e o `inset`, que é cinza), a janela, a gaveta, o popover, o menu, a
   paleta de comandos, o painel do app (menos o `plain`), a faixa de superfície cartão, o aviso, o aviso de cookies, o
   toast, a superfície do acordeão, o detalhe da grade de dados e a célula da tabela. **A superfície escolhe sozinha**:
   na referência é o app quem lembra; esquecido, sai branco no branco.
3. **O painel de prévia do site é página** (`.demo-panel` de prévia, cinza, dentro do cartão do site): nele, o campo
   volta ao branco — senão as prévias mostrariam o cinza.
4. **No ESCURO, nada muda.** O jeito da referência mede 1,13:1 contra 1,34:1 do de antes, e sombra preta não se vê no
   escuro; quem usa o monitor no escuro perderia.
5. **O mecanismo:** duas variáveis, `--field-fill` e `--field-lift` (o fundo e a sombra do campo onde ele está). O
   valor "de página" (`--field-fill-page`, `--field-lift-page`) mora em cada elemento de tema, como os `--fill-*` da
   ADR-0072 — segue a faixa de outro tema (GAR-05); as superfícies brancas devolvem `var(--fill-2)` e `none`. Um app com
   uma superfície branca própria faz o mesmo.
6. **O `variant="secondary"` do campo continua como era** (o `--secondary`, sem sombra).
7. **Peça nova que pinta a cor do cartão (ou do popover) e recebe conteúdo do app entra na lista** (a regra das
   superfícies no `aurea.css`; no nativo, o contexto). Na 0.40.1 entraram as que a 0.40.0 esqueceu: o `Header`
   flutuante e o de pílula (a busca na barra), a lateral da documentação aberta como popover e o item da
   `SortableList`. As que pintam a cor do cartão e não recebem campo ficam de fora: a barra de baixo, a dica, o selo, a
   moldura de celular, as peças do mapa.

## O nativo (0.40.1)

- **A mesma regra, sem cascata.** O fundo do campo sai de `fundoDeCampo(t, naSuperficie)` (`estilos.ts`): no claro e
  fora de superfície, a cor do cartão com as três camadas do `--shadow-sm` (`t.shadowLayers.shadowSm`); no resto, o
  `preenchimento(t, 2)` de antes. Vale para os oito campos que a regra do "sem linha" pintava: `Input`, `InputGroup`,
  `Select`, `Combobox`, `SearchField`, `NumberField`, as casas do `OTPField` e o gatilho do `DatePicker`.
- **Quem diz "estou numa superfície branca" é um contexto** (`superficie.tsx`, interno ao pacote), que o `Card` liga
  (o de contorno e o `inset` herdam de quem está em volta, como na web), e também o `Card variant="contrast"`, o
  `Dialog`, o `Drawer`, a `BottomSheet`, o conteúdo do `Popover`, o `Accordion` com `surface`, o `Header` flutuante e o
  de pílula e o `ScrollShadow` de superfície. O contexto atravessa a janela que sai do fluxo (o `Modal` do React
  Native), e por isso o campo dentro da folha também fica cinza. O `Alert`, o `Toast` e a célula da `Table` não ligam:
  são um elemento só para o leitor de tela, e campo dentro deles some no iPhone (o check 43).
- **Ficam cinza de propósito:** a busca de dentro da lista do `Combobox` (ela mora numa folha) e as áreas de arquivo
  (`PhotoInput`, `FileInput`) — na web elas também não estão na lista dos campos.

## O custo, escrito

- **A cor do campo contra a página cai de 1,21:1 para 1,09:1 no claro**: o limite do campo passa a ser a sombra. A
  norma 1.4.11 (3:1 no limite) já não era cumprida desde a ADR-0072; continua não sendo — decisão do Victor, olhando as
  duas telas dele.
- **Toda foto de catálogo do claro que tem campo muda.**

## Quem cobra

- `tests/visual/campos-brancos.spec.ts` (na máquina local; a CI não o roda) — 12 casos no navegador, o fundo e a sombra
  calculados: a página clara, as superfícies brancas, as que não são brancas, o painel de prévia, o escuro, a faixa de
  outro tema e a `lory`. Com o CSS da 0.39.0, reprova 7. Os quatro casos da 0.40.1 (o `Header` flutuante e o de
  pílula, o item da `SortableList` e a lateral aberta) reprovam com o CSS da 0.40.0 — e o teste de unidade, 1 de 4.
- `tests/unit/campos-brancos.test.tsx` (na CI) — o CSS montado declara o valor de página por tema, a lista de superfícies
  e o campo com as duas variáveis.
- As fotos do catálogo (`catalog.spec.ts`, `matrix.spec.ts`).
- `tests/unit/native-campos-brancos.test.tsx` (na CI) — no nativo, os seis campos de texto e escolha: soltos no claro,
  brancos com as três camadas da sombra; dentro do `Card`, cinza sem sombra; o cartão de contorno herda; no escuro,
  cinza; o `Header` e o `ScrollShadow` (32 casos, com o `numeric`, o `KPI`, a `Table` e o `Slider` da ADR-0077). Com o nativo da 0.40.0,
  reprovavam 14 dos 26 primeiros; sem o contexto no `Header` e no `ScrollShadow`, reprovam os 3 casos de cinza deles.
- O aparelho: o bloco `0.40.1` do `apps/native-smoke`.
