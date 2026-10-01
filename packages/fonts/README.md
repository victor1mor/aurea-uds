# @aurea-uds/fonts

A **Atkinson Hyperlegible Next** (texto) e a **Atkinson Hyperlegible Mono** (código), em WOFF2
para a web e TTF para o React Native, com as regras `@font-face` que a **Aurea UDS** espera. Até a
`0.12.4` era a IBM Plex (ADR-0053).

```bash
pnpm add @aurea-uds/fonts
```

```js
import "@aurea-uds/fonts/css";  // ANTES do @aurea-uds/core/css
```

A ordem importa: o core só declara `--font-ui`, `--font-editorial` e `--font-code`, e é este
pacote que faz esses nomes apontarem para arquivos de verdade. Importe o core primeiro e o first
paint cai numa fonte do sistema.

Duas famílias: a **Next** para a interface e a **Mono** para código. A Atkinson Hyperlegible foi
feita para quem enxerga pouco: letras parecidas (`I l 1`, `O 0`) têm desenhos diferentes.

⚠ `--font-editorial` não tem fonte própria desde a ADR-0053: a IBM Plex Serif saiu, e ele aponta
para a mesma Atkinson do texto. Continua existindo só para não quebrar quem o usa; sai na `1.0`.

## De onde vêm os arquivos

Das fontes variáveis do Google Fonts (`ofl/atkinsonhyperlegiblenext` e
`ofl/atkinsonhyperlegiblemono`), com um peso fixo por arquivo: o `.ttf` completo para o aparelho, e
o `.woff2` só com o alfabeto latino para a web.

## Por que um pacote só dele

Ele saiu do core para que quem já serve a fonte — de um CDN próprio, ou hospedada com outros
recortes — possa dispensá-lo sem copiar e alterar a folha de estilo.

## Licença

A Atkinson Hyperlegible está sob a **SIL Open Font License 1.1**, sem nome reservado, e o texto da
licença vai junto com o pacote. A OFL não é a Apache-2.0: leia-a antes de redistribuir os arquivos
de fonte.
