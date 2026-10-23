# ADR-0077 — A fonte é a Inter, a Sora e a IBM Plex Mono

- **Data:** 22/10/2026
- **Estado:** aceita · **a web na `0.39.0`** (branch `claude/fonte`); **o nativo na `0.40.1`** (branch `claude/nativo`;
  era a `0.39.1` — a `0.40.0` foram os campos brancos, ADR-0078): os `.ttf` das fontes novas, ver "O nativo", abaixo.
  **Substitui a parte da fonte da [ADR-0053](0053-a-fonte-e-a-atkinson-e-os-icones-sao-o-phosphor.md)**;
  a parte dos ícones (Phosphor Regular, Fill no item escolhido) continua valendo.
- **Origem:** o Victor quer que a Aurea seja adotada na empresa dele, e mediu-se o sistema interno que o chefe dele
  criou (o mapa fica fora do repositório, no documento de achados). A fonte de lá: Sora nos títulos, Inter no texto,
  IBM Plex Mono nos números. Ele: *"a nossa apesar de ter objetivo nobre quando olho pra ela não vejo 'beleza'"*. Viu
  as duas fontes na mesma tela, com as peças da Aurea, e levou a pessoas da mesa dele: *"todos votaram em Sora + Inter +
  Plex Mono"*. Depois: *"vamos mudar mesmo"*, *"não quero manter a Atkinson"* e *"a fonte não irá ser mudada de novo,
  essa é a última vez"*.

## O que se mediu

- **O sistema que serviu de modelo** (lido no estilo calculado de cada peça, e no CSS dele): a Sora vale para todo
  título, do `h1` ao `h5`, por uma regra geral — não há classe especial. A Inter vem do Google Fonts, com o eixo de
  tamanho óptico (14 a 32). A configuração das letras é `normal` em toda parte; o único recurso ligado é o `tnum`
  (números de largura igual), nos números.
- **A Inter do Google Fonts tira recursos.** Com e sem o `ss02`, os pixels saem idênticos. O arquivo do autor (a
  versão 4.1, `rsms/inter`) tem o `ss02` ("Disambiguation"). Dos 31 caracteres parecidos comparados um a um, ele muda
  três: o `I` maiúsculo, o `l` minúsculo e o `0`. Lido na tabela de substituições do arquivo, muda também o `Ì Í Î Ï`
  (o `I` com acento) e o `ß`. O Victor escolheu **sem o `ss02`**: *"igual ao sistema do meu chefe"*.
- **As licenças.** As três são SIL OFL 1.1. A Inter e a Sora não têm nome reservado: o arquivo pode ser cortado e
  manter o nome. A IBM Plex Mono tem o **nome reservado "Plex"**: arquivo modificado não pode levar esse nome — por
  isso os dela vão sem mudança nenhuma.
- **A cobertura.** O recorte latino que a web servia tem 218 caracteres. A Inter cobre 217 (falta a barra de divisão,
  `∕`); a Sora, 217 (falta o espaço fino, que cai na Inter); o recorte `Latin1` da IBM Plex Mono, 214.

## A regra

1. **Texto e controles: Inter** (`--font-ui`). **Títulos: Sora** (`--font-heading`) — o core aplica a todo `h1` a `h6`
   por `:where(h1,h2,h3,h4,h5,h6)`, de força zero, e às classes de título (`.typography-h*`, a abertura de página). O
   modelo deixa o `h6` na fonte do texto; a Aurea põe a Sora também nele (decisão do Victor, 22/10/2026): nenhuma peça
   da Aurea escreve `<h6>` sem classe, o `Heading` de nível 6 já era Sora, e a referência trata o `h6` como os outros
   títulos. **Código e valores: IBM Plex Mono** (`--font-code`) — o código, o `numeric` (`Text`, `Heading`,
   `Paragraph`, `Code`) e o número do `KPI` (decisão do Victor, 22/10/2026, como os valores e os números de
   identificação no modelo; a referência usa os algarismos de largura igual na fonte do texto, e a Aurea segue o
   modelo). Os outros números — a tabela, o contador, a paginação, o calendário — ficam na Inter, com o `tnum`. O
   `--font-editorial` continua apelido do texto até a `1.0`.
2. **A Inter vai sem o `ss02`.** O tamanho óptico acompanha o tamanho da letra sozinho (`font-optical-sizing:auto`).
3. **Os arquivos** (`packages/fonts/files/`):
   - a Inter e a Sora são **variáveis** — um arquivo cobre todos os pesos —, cortadas dos arquivos oficiais para os
     caracteres de antes (os 218 do recorte latino, menos o que a fonte original não tem — ver "A cobertura") por
     `packages/fonts/cortar-fontes.py`, com todos os recursos de desenho;
   - a IBM Plex Mono são os recortes `Latin1` da própria IBM (`@ibm/plex-mono` 2.5.0), um peso por arquivo (400, 500 e
     600), **sem mudança** — o resumo de cada um está no README do pacote.
4. **A Atkinson sai de tudo.** A web na `0.39.0`; o nativo, e os arquivos dela do pacote, na `0.40.1`. Os NOMES de
   fonte dos tokens do nativo já trocam na `0.39.0` (decisão do Victor, 22/10/2026); o app que passa o `fontFamilies`
   não vê diferença até os arquivos chegarem.

## O nativo (0.40.1)

- **O React Native não lê `woff2` nem fonte variável no Android**: um `.ttf` estático por peso, como a Atkinson era
  (ADR-0039 — uma família por peso, o nome é o PostScript lido na tabela `name`). São 14 arquivos em
  `packages/fonts/files-native/`, feitos por `packages/fonts/fontes-nativas.py`, que imprime o resumo (sha256) de
  cada um e sai igual a cada rodada:
  - **Inter** — 400, o itálico 400, 500, 600, 700 e 800: os `.ttf` estáticos do próprio autor (`Inter-4.1.zip`, pasta
    `extras/ttf/`), **sem mudança**;
  - **Sora** — 400 a 800: a fonte variável do Google Fonts (a mesma da web) fixada num peso por arquivo, com o nome de
    cada peso escrito à mão (a tabela de estilos dela não tem o 500);
  - **IBM Plex Mono** — 400, 500 e 600: os `.ttf` da própria IBM (`@ibm/plex-mono` 2.5.0, `fonts/complete/ttf/`),
    **sem mudança** (o nome reservado).
- **O título é Sora também no nativo**: o mapa `heading` deixa de apontar para a fonte do texto. O `numeric` (`Text`) e
  o número do `KPI` saem na IBM Plex Mono, como na web; o `font` pedido pelo app continua mandando. Os números de
  dentro das peças — a célula da `Table` e o valor do `Slider` — ficam na Inter com algarismos de mesma largura (pedem
  `numeric` com `font="ui"`), como o `.slider-output` e a tabela da web.
- **Os arquivos vão COMPLETOS**, com todos os alfabetos que cada fonte desenha (decisão do Victor, 22/10/2026,
  *"Completas"*, olhando as três medidas): 3,17 MB no app, contra 0,40 MB da Atkinson. Cortar a Inter e a Sora no
  alfabeto latino daria 1,99 MB; no recorte da web, 1,37 MB. A referência principal não traz fonte no nativo (usa a do
  sistema); o pacote de mercado da Inter para o React Native traz cada peso completo, cerca de 340 KB.
- **A altura da linha cobre a letra** (o Android corta o que passa dela): a Inter pede 1,21 do tamanho, a Sora 1,26 e a
  IBM Plex Mono 1,30 (a `hhea` de cada arquivo) — dentro do 1,3 que as peças de uma linha já usavam.

## O custo, escrito

- **A Aurea deixa de ter uma fonte desenhada para baixa visão.** Na Inter sem o `ss02`, o `I` maiúsculo e o `l`
  minúsculo são o mesmo traço, e o `0` só se separa do `O` pela largura; na Sora, dos títulos, também (olhado no desenho
  dos arquivos, 22/10/2026). O que continua protegendo quem enxerga pouco é o resto da regra: o contraste
  medido nos dois temas, o foco visível, o toque de 44 e a página que não rola de lado com o texto a 200%.
- **O pacote da web fica maior.** Antes, a Atkinson eram seis arquivos de cerca de 12 KB, um por peso. Agora a Inter
  são 95 KB (104 KB o itálico) e a Sora 37 KB, cada uma com todos os pesos; a IBM Plex Mono, 17 KB por peso. Do pacote,
  o navegador só baixa o que a página usa. O site é outra conta: ele embute todas as fontes no `catalog.css`, que passou
  de 249 KB para 441 KB comprimido (medido em 22/10/2026), pago só na primeira visita — aceito pelo Victor, porque os
  testes de medida do site contam com a fonte pronta no primeiro desenho.
- **Toda foto de catálogo muda**, porque toda tela tem letra.

## Quem cobra

- `tests/unit/fonte-adr0077.test.tsx` — o `fonts.css` declara as três famílias com os arquivos certos; os arquivos
  cobrem os 218 caracteres (menos os já medidos); a Inter e a Sora são variáveis, com o `tnum`; os da IBM Plex Mono são
  idênticos aos da IBM (o resumo); os tokens apontam para as famílias certas; a regra dos títulos existe; e o `numeric`
  e o número do `KPI` usam a fonte de código.
- `tests/visual/skin.spec.ts` — o `Kbd` na fonte do texto, o `CodeBlock` e o log na fonte de código (roda na máquina
  local; a CI não o roda).
- `scripts/validate.py` — o `LICENSE` do pacote leva o copyright de cada família, e nada da Atkinson; e o check 37: a
  web e o nativo têm as mesmas famílias e estilos, e cada peso fixo da web (a IBM Plex Mono) existe no nativo.
- `tests/unit/native-lote0.test.tsx` — os 14 `.ttf` das três famílias, nenhum da Atkinson, e o mapa de nomes do nativo.
- `tests/unit/native-campos-brancos.test.tsx` — o `numeric` e o número do `KPI` do nativo na IBM Plex Mono.
- O aparelho: o bloco `0.40.1` do `apps/native-smoke`.
