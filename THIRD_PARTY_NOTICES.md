# Third-party notices

- **Inter** (desde 22/10/2026, ADR-0077): The Inter Project Authors, SIL Open Font License 1.1, **sem nome
  reservado**. Origem: a versão 4.1 do autor (`rsms/inter`, `Inter-4.1.zip`, pasta `web/`, fonte variável com peso
  e tamanho óptico). Redistribuída em `packages/fonts/files/inter-variable-normal.woff2` e
  `inter-variable-italic.woff2`, **cortadas** para o mesmo recorte latino de antes por
  `packages/fonts/cortar-fontes.py` — o desenho, os eixos e os recursos (`tnum`, `kern`…) não mudam; só saem os
  outros alfabetos. A OFL 1.1 permite a modificação com o mesmo nome quando não há nome reservado.
- **Sora** (desde 22/10/2026, ADR-0077): The Sora Project Authors, SIL Open Font License 1.1, **sem nome
  reservado**. Origem: `google/fonts`, `ofl/sora/Sora[wght].ttf`, commit `a926665019d3` (o projeto de origem,
  `sora-xor/sora-font`, não marca versão). Redistribuída em `packages/fonts/files/sora-variable-normal.woff2`,
  cortada pelo mesmo script, do mesmo jeito.
- **IBM Plex Mono** (desde 22/10/2026, ADR-0077): IBM Corp., SIL Open Font License 1.1, **com o nome reservado
  "Plex"** — arquivo modificado não pode levar o nome. Por isso os três arquivos
  (`packages/fonts/files/ibm-plex-mono-{400,500,600}-normal.woff2`) são os da própria IBM, **sem mudança
  nenhuma**: os recortes `Latin1` de `@ibm/plex-mono` 2.5.0 (`fonts/split/woff2/IBMPlexMono-{Regular,Medium,
  SemiBold}-Latin1.woff2`), só com outro nome de arquivo. O resumo (sha256) de cada um está no README do pacote.
- **Atkinson Hyperlegible Next e Mono** (de 01/10/2026 até a 0.40.1, ADR-0053; a web saiu dela na 0.39.0, ADR-0077 —
  o nativo sai no lote seguinte): The Atkinson Hyperlegible
  Next Project Authors e The Atkinson Hyperlegible Mono Project Authors, SIL Open Font License
  1.1, **sem nome reservado**. Redistribuídas em **dois formatos**, para dois alvos:
  - `packages/fonts/files/atkinson-*.woff2` — 9 arquivos, só o alfabeto latino (o intervalo do subset
    `latin` do fontsource). Foram a fonte da web de 01/10 a 22/10/2026; desde a 0.39.0 ficam só para a
    vitrine do nativo, e saem com ele.
  - `packages/fonts/files-native/*.ttf` — os **mesmos 9 estilos** em TrueType estático, completos,
    para o React Native, que não lê woff2.

  Os dois **foram gerados** das fontes variáveis do Google Fonts (`ofl/atkinsonhyperlegiblenext` e
  `ofl/atkinsonhyperlegiblemono`): um peso fixo por arquivo, e o recorte latino no woff2. O
  desenho não muda; o nome PostScript do itálico foi acertado para `AtkinsonHyperlegibleNext-Italic`.
  A OFL 1.1 permite a modificação com o mesmo nome quando não há nome reservado; o texto da
  licença está em `packages/fonts/LICENSE`.
- **Phosphor Icons** (`@phosphor-icons/core` 2.1.1, desde 01/10/2026, ADR-0053): Phosphor Icons,
  MIT. Consumidos da **mesma fonte** para **dois alvos**, nos pesos Regular e Fill, e em nenhum
  deles o desenho é alterado:
  - `packages/icons/dist/aurea-icons.svg` — o sprite da web, um `<symbol>` por ícone e peso.
  - `packages/native/icons/*.js` — um componente por ícone e peso para o React Native, gerado sobre
    `react-native-svg`. Os dados de `path` são copiados **verbatim**, mais o `fill` com a cor do
    `Icon` — na web essa cor vem de `currentColor`, que no React Native não existe.

  Os 79 logotipos de marca do pacote (nomes com `-logo`) ficam de fora. O aviso de copyright e de
  permissão exigido pela MIT está em `packages/icons/NOTICE` e `packages/native/NOTICE`.
- ~~**IBM Plex Sans e Serif** (IBM Corp., OFL 1.1) e **Carbon Icons** (IBM Corp., Apache-2.0)~~ — usados
  até a `0.12.4`; saíram em 01/10/2026 (ADR-0053). A IBM Plex **Mono** voltou em 22/10/2026 (ADR-0077), acima.

Aurea preserva as atribuições declaradas na fonte original.
