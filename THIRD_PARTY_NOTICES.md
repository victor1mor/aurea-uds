# Third-party notices

- **Atkinson Hyperlegible Next e Mono** (desde 01/10/2026, ADR-0053): The Atkinson Hyperlegible
  Next Project Authors e The Atkinson Hyperlegible Mono Project Authors, SIL Open Font License
  1.1, **sem nome reservado**. Redistribuídas em **dois formatos**, para dois alvos:
  - `packages/fonts/files/*.woff2` — 8 arquivos, só o alfabeto latino (o intervalo do subset
    `latin` do fontsource), para a web.
  - `packages/fonts/files-native/*.ttf` — os **mesmos 8 estilos** em TrueType estático, completos,
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
- ~~**IBM Plex fonts** (IBM Corp., OFL 1.1) e **Carbon Icons** (IBM Corp., Apache-2.0)~~ — usados
  até a `0.12.4`; saíram em 01/10/2026 (ADR-0053).

Aurea preserva as atribuições declaradas na fonte original.
