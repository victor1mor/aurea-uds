# @aurea-uds/fonts

A IBM Plex, em WOFF2, com as regras `@font-face` que a **Aurea UDS** espera.

```bash
pnpm add @aurea-uds/fonts
```

```js
import "@aurea-uds/fonts/css";  // ANTES do @aurea-uds/core/css
```

A ordem importa: o core só declara `--font-ui`, `--font-editorial` e `--font-code`, e é este
pacote que faz esses nomes apontarem para arquivos de verdade. Importe o core primeiro e o first
paint cai numa fonte do sistema.

Três famílias, porque o sistema usa as três: **Sans** para a interface, **Serif** para texto
editorial, **Mono** para código.

## Por que um pacote só dele

Ele saiu do core para que quem já serve a IBM Plex — de um CDN próprio, ou hospedada com outros
recortes — possa dispensá-lo sem copiar e alterar a folha de estilo.

## Licença

A IBM Plex está sob a **SIL Open Font License 1.1**, e o texto da licença vai junto com o pacote. A
OFL não é a Apache-2.0: leia-a antes de redistribuir os arquivos de fonte.
