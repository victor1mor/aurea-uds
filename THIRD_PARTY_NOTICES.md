# Third-party notices

- **IBM Plex fonts:** IBM Corp., SIL Open Font License 1.1. Redistribuídos em **dois formatos**,
  para dois alvos:
  - `packages/fonts/files/*.woff2` — 11 arquivos, o subset `latin`, para a web. Vêm do
    `@fontsource/ibm-plex-*` (medido em 02/09/2026: byte a byte idênticos aos dele).
  - `packages/fonts/files-native/*.ttf` — os **mesmos 11 estilos** em TrueType estático, para o
    React Native, que não lê woff2. Vêm do `@expo-google-fonts/ibm-plex-{sans,serif,mono}@0.4.1`
    (MIT AND OFL-1.1), que empacota os TTF do Google Fonts. **Fonte completa**, não subset.

  Nenhum dos arquivos foi modificado — nem o desenho, nem as tabelas. A OFL 1.1 permite a
  redistribuição; o texto da licença está em `packages/fonts/LICENSE`.
- **Carbon Icons** (`@carbon/icons`): IBM Corp., Apache License 2.0. Consumidos da **mesma fonte**
  para **dois alvos**, e em nenhum deles o desenho é alterado:
  - `packages/icons/dist/aurea-icons.svg` — o sprite da web, um `<symbol>` por ícone.
  - `packages/native/icons/*.js` — um componente por ícone para o React Native, gerado sobre
    `react-native-svg`. Os dados de `path` são copiados **verbatim**; o que muda é apenas o nome
    dos elementos e dos atributos, traduzidos para a API do `react-native-svg`
    (`<path>` → `<Path>`, `stroke-width` → `strokeWidth`), mais o `fill` injetado onde o arquivo
    original não declara nenhum — na web essa cor vinha da herança do CSS, que no React Native não
    existe.

  A atribuição exigida pela Apache-2.0 está em `packages/icons/NOTICE` e `packages/native/NOTICE`.

Aurea preserva as atribuições declaradas na fonte original.
