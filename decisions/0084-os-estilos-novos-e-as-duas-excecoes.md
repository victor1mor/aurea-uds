# ADR-0084 — Os estilos novos (passo B): o botão ligado, o segmento, a barra de baixo e a linha do tempo, e as duas exceções

- **Data:** 26/10/2026 (os estilos aprovados) · 27/10/2026 (o passo B construído)
- **Estado:** proposta · na branch `claude/cores-b`, para a `0.46.0` — web e nativo. Espera a bancada do Victor.
- **Origem:** a proposta de cores do Victor (25 e 26/10/2026, a mesma da [ADR-0083](0083-a-paleta-da-1-0.md)), regras 2.8,
  2.9, 2.11, 2.11b, 2.12 e 2.13: *"todos para construir"*. A ordem: *"Aprovo a ordem"* (26/10/2026), e o H: *"O estilo H da
  barra de baixo é um degradê. Abrimos uma segunda exceção (se não não conseguimos virar UDS de verdade)"*. O passo B:
  *"Pode começar o passo B das cores, com o registro da 0.45.0 junto."* E, medido o tamanho, *"Um lote só"*, com os nomes
  da proposta e a linha do tempo também no nativo (27/10/2026).

## O que se mediu

- **Como a referência principal chama esses jeitos:** `variant` — no botão alternável, `default` e `ghost`; nas abas,
  `primary` e `secondary` (lido no pacote dela, 27/10/2026). Ela não tem barra de baixo, linha do tempo nem controle
  segmentado. Na Aurea o `variant` já é usado no `Toggle` (o mesmo `default`/`ghost` dela), no `ToolbarButton` (o desenho
  do botão) e no `BottomNav` (`floating`/`edge`): um eixo de COR precisa de nome próprio.
- **O degradê no React Native:** a 0.87.1 tem `backgroundImage` com `linear-gradient()`; das versões 0.76 em diante (a
  mínima do pacote), `experimental_backgroundImage` (lido nos tipos e na documentação da versão). O `react-native-web`
  0.21.4 passa os dois adiante sem recusar.
- **O aro no nativo:** a borda ocupa lugar no React Native, e a peça mudaria de medida ao ser escolhida. A sombra por
  dentro (`inset: true`) existe desde a 0.76, e o `react-native-web` a traduz para o `inset` do CSS (lido no fonte dele).

## A regra

1. **Cada estilo é uma VARIAÇÃO.** O padrão de cada peça não muda: sem escolher nada, sai o que sempre saiu.
2. **O botão ligado** (`Toggle`, `ToggleGroup`, `Toolbar`, `ToolbarButton`): `pressedStyle` — `brand` (o amarelo, o
   padrão desde a 0.45.0), `neutral` (o cinza) e `contrast` (o grafite, invertido). Só a web (o nativo não tem toggle). O
   cinza ganha o contorno de 3:1 com "aumentar contraste" — a mesma exceção dos campos (ADR-0083).
3. **O segmento aceso** (`SegmentedControl`): `selectedStyle` — `current` (o padrão), `neutral`, `contrast`, `brand`, `ring`
   e `dot`. Web e nativo; no nativo, o `current` continua a cápsula amarela (24/10/2026).
4. **O item atual da barra de baixo** (`BottomNav`): `currentStyle` — o `indicator` escolhe a forma, o `currentStyle` a cor.
   Treze: `current` (o padrão), `neutral`, `contrast`, `brand`, `ring`, `plain`; `brand-white`, `white-ring`,
   `brand-gradient`; e a barra inteira amarela, `bar-ink`, `bar-ring`, `bar-plain`, `bar-light`. Na barra flutuante e na
   fixa, em todos os formatos; o `none` não tem fundo e não muda. Web e nativo.
   - ⚠ **O `brand-white` REPROVA a WCAG:** o branco sobre o amarelo mede 1,91:1 (1,67:1 no ponteiro). O Victor o aprovou
     sabendo disso (26/10/2026). A ficha diz isso.
5. **A linha do tempo** (`Timeline`): `variant` — `default` (o padrão), `ring`, `latest`, `time` e `contrast`. Web e
   nativo.
6. **O atributo:** cada prop escreve `data-pressed-style`, `data-segment-style`, `data-current-style` ou
   `data-timeline-style` na peça. O mesmo atributo num contêiner, ou no `<html>`, vale para todos os de dentro; a peça com o
   seu atributo ganha do contêiner. No nativo, o mesmo atributo aparece no navegador (o `dataSet`, como a marca do cartão
   de contorno).
7. **A `lory` fica de fora**, como no passo A: os estilos novos não a alcançam (a marca está congelada até o passo C).

## As duas exceções

1. **O degradê do `brand-gradient` — a SEGUNDA exceção à [ADR-0007](0007-sem-gradientes.md)**, depois da escolha de cor
   ([ADR-0069](0069-escolher-cor-a-excecao-ao-gradiente-e-o-motor-nosso.md)). Estreita como aquela: só o item atual da
   barra de baixo, só quando o app escolhe o H, do amarelo até a ponta clara (o amarelo a 30% com o branco; uma marca que
   precisar de outra ponta a define em `--primary-gradient-end`, no passo C). No nativo sem degradê, fica o amarelo cheio.
   O motivo é do Victor: *"se não não conseguimos virar UDS de verdade"*.
2. **Os aros dos estilos de aro — exceção nomeada à [ADR-0072](0072-sem-linha.md):** o segmento `ring`, o item `ring`,
   `white-ring` e `bar-ring` da barra de baixo e o ponto `ring` da linha do tempo. O aro é o desenho que dá nome ao estilo, e
   o Victor aprovou cada um pelo nome (26/10/2026, depois da ADR-0072). Só existe quando o app escolhe o estilo; é sempre
   uma sombra por dentro (`inset`), nunca borda — a peça não muda de medida.

## A barra na mesma altura

Na bancada do passo B, o Victor viu que a barra de baixo era mais alta em cinco formatos: *"todos esses tem a altura
maior que o restante não esta padronizado quero todos da mesma altura do none, subtle pill expand"* (27/10/2026). Medido:
54 no `none`, no `subtle`, no `pill` e no `expand`; 62 no `circle`, no `circle-raised`, no `circle-outline` e no
`capsule` (o círculo e a cápsula tinham 32 em volta do ícone de 24, e empurravam o nome); 58 no `circle-bold` (o disco
tinha altura mínima de 48). Duas formas rodando lado a lado com a de hoje; a escolhida: *"B: o círculo e a cápsula com
28, e todas as barras na altura de 54."*

- O círculo e a cápsula têm **28** (`--bottomnav-ring` = `--icon-lg` + `--space-1`; no nativo, `iconLg` + `space1`) e
  passam 2 por fora da caixa em cima e embaixo — o desenho entra 2 na linha do nome, e o nome fica no mesmo lugar.
- O disco do `circle-bold` perde a altura mínima: 56 × 44.
- A largura da moldura dos formatos que não são redondos continua 32 (`--space-8`): é ela que dá o canto ao contador.
- Muda as alturas da [ADR-0055](0055-a-barra-de-baixo-fica-parada-e-mais-baixa.md). Quem cobra: o `geometry.spec` (as nove
  barras iguais à do `none`), o `native-bottomnav-baixa` e o `native-bottomnav-parada` (o 28, a margem e o disco), e o
  `paleta-passo-b.spec` (as nove barras do celular, rodando no navegador).

## As medidas

As da proposta, escritas com os tokens: o aro de 1,5 é `1.5 × --border-width` (2 no ponto da linha do tempo); o ponto do
`dot` é `--space-1 + --space-05` (6); o halo do `latest` é `--space-1` (4); a coluna da hora do `time` é `--space-12 +
--space-1` (52). **Uma diferença:** o vão do ponto do `dot` até o nome é `--space-2` (8) — a proposta dizia 7, que não está
na escala.

## Como é obrigada

- **O degradê:** o check 4 do `validate.py` aceita `gradient(` no CSS do core SÓ na regra cujo seletor nomeia
  `data-current-style="brand-gradient"`; em qualquer outra regra, ou em outro arquivo, reprova.
- **Os aros:** `tests/unit/sem-linha.test.tsx` passou a ler também a VARIÁVEL que guarda um anel (`--…-ring`,
  `--…-shadow`) — a leitura antiga só via a propriedade, e o anel escrito por variável passava calado — e aceita o anel só
  na regra que nomeia um estilo de aro; no nativo, a sombra por dentro só nasce no `aroDoEstilo` do `estilos.ts`. A
  varredura do navegador (`catalog-sweep.spec.ts`) descarta só o anel, e só dentro de um estilo de aro escolhido.
- **Os estilos:** `tests/unit/paleta-passo-b.test.tsx` (o que o código promete) e `tests/visual/paleta-passo-b.spec.ts` (as
  cores no navegador), provados contra a 0.45.0; `tests/visual/lory-congelada.spec.ts` continua provando a `lory`.

## As consequências, com os custos

- **Duas exceções a regras que diziam "sem exceções".** As duas são estreitas, escolhidas pelo app e cobradas por trava.
- **O `brand-white` reprova a WCAG** e sai mesmo assim, por decisão consciente; o padrão continua passando.
- **Mais 25 valores com exemplo vivo no site** (a trava do catálogo fiel), e as fichas de seis peças mudam.

## Revisão

Quando o passo C trouxer as marcas: a ponta do degradê por marca (`--primary-gradient-end`) e o `brand-white` nas marcas de
letra branca (que passam).
