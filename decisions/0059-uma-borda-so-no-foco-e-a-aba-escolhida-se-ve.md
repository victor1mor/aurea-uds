# ADR-0059 — Uma borda só no foco, e a aba escolhida se vê

- **Data:** 08/10/2026
- **Estado:** aceita · executada na `0.25.0` (ainda não publicada).
- **Origem:** pedido do Victor com seis imagens, comparando a Aurea com a referência principal:
  *"ela tem mais de uma borda e no componente que tem uma amarela fica com um dentro e a amarela
  fora, eu quero todos como [a referência] apenas uma borda. entende? TODOS OS COMPONENTES"* — e a
  aba escolhida, *"quero como o deles"*. Escolha dele entre duas propostas: **A** (*"A, pode criar
  os tokens, pode fazer"*).
- **Muda:** a regra de foco da B-09 (24/09/2026) na peça com borda; os tokens novos `segment` e
  `shadow-sm`; a cápsula escolhida do `Tabs` e do `SegmentedControl`, na web e no nativo; o check
  44 do `validate.py`; e o alvo nativo de tokens ganha `shadowLayers`. Nenhuma prop muda, nada sai.

## A regra

**O foco é uma linha só.**

1. **Peça sem borda própria** (o botão cheio, o botão fantasma, a aba, o item de menu): o anel de
   `--focus-width` afastado `--focus-offset`, como antes. Sozinho ele já é uma linha.
2. **Peça com borda própria** (campo, `Select`, `Textarea`, `InputGroup`, `Combobox`, área de
   soltar, checkbox e radio desmarcados, switch desligado, botão com contorno, cartão, bloco de
   código, controle do player): **a borda passa para a cor do foco e o anel encosta nela**
   (`outline-offset: 0`). Fica uma faixa só, de borda + anel.
3. **Peça cheia com a cor do foco** (checkbox marcado, switch ligado): **volta ao vão**. Colado, o
   anel sumiria no recheio. A borda dela já é da cor do recheio, então continua uma linha.
4. **Campo inválido:** o anel é da cor do perigo (`--focus-strong` redefinido no bloco do
   inválido). Encostado, o amarelo cobriria o vermelho justo enquanto a pessoa corrige.
5. A regra global deixou de pintar TODA borda de amarelo (`border-color … !important`). Era ela que
   dava a segunda linha até no botão de borda transparente, depois da transição.

**A aba escolhida tem cor própria.** Sobre o trilho (`--muted`), a cápsula escolhida do `Tabs` e
do `SegmentedControl` é `--segment` com a sombra pequena `--shadow-sm`. Antes era `--secondary`,
que no claro é a mesma cor do trilho (1:1) e no escuro dava 1,02:1. O segmentado mantém a letra na
cor da marca e o fio de baixo (a linguagem do escolhido da Aurea).

## As fontes

- **A referência principal, no pacote web dela** (a versão atual, baixada com `npm pack` em
  08/10/2026): o campo não tem borda em repouso (`--field-border-width: 0px`) e o foco
  é um anel de 2px **colado** (`focus-field-ring`: `ring-2`, `ring-offset-0`). O resto (botão,
  aba, checkbox, radio, switch, link, item de menu) usa o anel de 2px com vão de 2px
  (`focus-ring`, `--ring-offset-width: 2px`). No campo inválido focado, o anel é da cor do perigo
  (`invalid-field-ring`).
- **A aba dela:** trilho `--default` (claro 94%, escuro 27,4%), cápsula `--segment` (claro branco,
  escuro `oklch(0.3964 0.01 285.93)`), sombra `--surface-shadow` só no claro. O pacote nativo dela (a
  versão atual) usa as mesmas cores.
- **Os números:** a cor escura e as três camadas da sombra são as dela. No claro, o branco. A marca
  `lory` não tem par na referência: no escuro, o mesmo degrau de claridade (+0,122 sobre o trilho
  dela), no matiz da marca.

## Onde a Aurea difere da referência, e por quê

- **A faixa tem 3px, não 2.** A Aurea tem borda em repouso nos campos (a referência não tem), e
  ela vira parte da faixa: borda de 1 + anel de 2. Com 2px (o anel cobrindo a borda), metade da
  linha ficaria sobre a borda cinza, que muda pouco de contraste; com 3px, os 2px de fora passam do
  fundo para o amarelo. O Victor tem baixa visão. Proposto na bancada como escolha a confirmar.
- **O botão com contorno encosta o anel**; o da referência mostra borda + anel afastado. Foi a
  escolha **A** do Victor: nenhuma peça fica com duas linhas.

## Alternativas rejeitadas

- **B, igual à referência** (só os campos mudam): o botão com contorno, o checkbox e o switch
  continuariam com duas linhas. O Victor escolheu A.
- **O anel colado em toda peça:** some no botão amarelo e no switch ligado (anel amarelo sobre
  recheio amarelo). Medido nas fotos da bancada no primeiro desenho, que colava no switch ligado.
- **Uma propriedade por peça (`--focus-gap`) em vez da lista:** propriedade herdada vaza para
  dentro (um cartão com `0` colaria o anel de todo botão dentro dele); sem herança, ela pede
  `@property` com número escrito à mão. A lista é uma só, ao lado da regra global, e quem cobra que
  ela não esqueça ninguém é o navegador, não a lista.
- **Aproximar a sombra de três camadas por uma:** a medida é da referência. O nativo jogava fora as
  camadas 2 e 3 em silêncio; ganhou `shadowLayers`, a sombra inteira.

## Como ela é obrigada

- `tests/visual/catalog-sweep.spec.ts`, **"nenhuma peça focada desenha duas linhas"**: anda com Tab
  por toda prévia de toda página de componente, espera a transição da borda terminar e reprova
  borda visível afastada do anel ou encostada com outra cor — na peça, no irmão (`.control-mark`,
  `.switch-track`) ou na moldura. Nos três navegadores, na CI. Provado contra a folha de antes: 84
  peças reprovadas.
- O mesmo arquivo, **"a cápsula da aba e do segmento escolhidos se distingue do trilho"**: nos dois
  temas e na `lory`, piso de 1,08:1. Provado contra a folha de antes: 1,00 e 1,02.
- `tests/visual/geometry.spec.ts`: o campo encosta (`0px`) com a borda da cor do anel; o botão e a
  aba afastam (`2px`).
- `check 44` do `validate.py`: o afastamento só pode ser `var(--focus-offset)`, `0` ou
  `calc(-1 * var(--focus-width))`.
- `tests/unit/native-aba-escolhida.test.tsx`: no nativo, a aba e o segmento escolhidos usam
  `segment` e a sombra inteira, e a cor deles não é a do trilho.

## Consequências

- Peça nova com borda entra na lista da regra (`aurea.css`, logo abaixo do `:focus-visible`); se
  esquecer, a varredura reprova.
- O app não muda nada: tudo vem da Aurea. Quem lê `t.shadow.shadowSm` no nativo recebe a primeira
  camada; a sombra inteira está em `t.shadowLayers.shadowSm`.
- Fica de fora, para a auditoria item a item: o botão alternado ligado dentro da barra de
  ferramentas também some (1:1), mas a referência o desenha de outro jeito (um tom da cor da marca),
  então é outra peça e outro desenho.

## Quando rever

Se a Aurea tirar a borda dos campos em repouso, como a referência: aí a faixa volta a ser só o anel.
