# @aurea-uds/fonts

As fontes da **Aurea UDS**, com as regras `@font-face` que ela espera (ADR-0077, desde a `0.39.0`):

- **Inter** para o texto e os controles;
- **Sora** para os títulos;
- **IBM Plex Mono** para código e valores (o `numeric` e o número do `KPI`).

Até a `0.38.0` a web usava a Atkinson Hyperlegible (ADR-0053); até a `0.12.4`, a IBM Plex.

```bash
pnpm add @aurea-uds/fonts
```

```js
import "@aurea-uds/fonts/css";  // ANTES do @aurea-uds/core/css
```

A ordem importa: o core só declara `--font-ui`, `--font-heading`, `--font-editorial` e `--font-code`,
e é este pacote que faz esses nomes apontarem para arquivos de verdade. Importe o core primeiro e o
first paint cai numa fonte do sistema.

O título usa a Sora sozinho: o core aplica `--font-heading` a todo `h1` a `h6`, por uma regra de força
zero. Quem fixa outra fonte no próprio título ganha dela; a fonte que o título só herda do pai
(`body{font-family:…}`) perde.

⚠ `--font-editorial` não tem fonte própria desde a ADR-0053: ele aponta para a fonte do texto (hoje a
Inter). Continua existindo só para não quebrar quem o usa; sai na `1.0`.

⚠ **Os arquivos do React Native ainda são os da Atkinson Hyperlegible** (`@aurea-uds/fonts/native`), até a
`0.39.1`: a troca do aparelho é o lote seguinte, com os `.ttf` das fontes novas e o teste no aparelho. Os
tokens do nativo já dizem os nomes novos — passe o `FONT_FAMILIES` deste pacote ao `AureaProvider`, como
no exemplo, e nada muda até lá.

## De onde vêm os arquivos

| arquivo | origem | como |
|---|---|---|
| `inter-variable-normal.woff2`, `inter-variable-italic.woff2` | Inter 4.1 do autor (`rsms/inter`, `Inter-4.1.zip`, pasta `web/`) | cortadas para o recorte latino por `cortar-fontes.py`; continuam variáveis (peso 100–900 e tamanho óptico 14–32) |
| `sora-variable-normal.woff2` | `google/fonts`, `ofl/sora/Sora[wght].ttf`, commit `a926665019d3` | cortada do mesmo jeito; variável (peso 100–800) |
| `ibm-plex-mono-400-normal.woff2`, `-500-`, `-600-` | `@ibm/plex-mono` 2.5.0, `fonts/split/woff2/IBMPlexMono-{Regular,Medium,SemiBold}-Latin1.woff2` | **sem mudança nenhuma** (a licença reserva o nome "Plex") — só o nome do arquivo |

O corte guarda os caracteres que a web servia antes (o recorte `latin`, 218) e todos os recursos de
desenho, como os números de largura igual (`tnum`). A Inter fica com 217 deles (a original não tem a
barra de divisão `∕`) e a Sora com 217 (não tem o espaço fino); o recorte `Latin1` da IBM Plex Mono
cobre 214. Para refazer e conferir:

```bash
python packages/fonts/cortar-fontes.py <InterVariable.woff2> <InterVariable-Italic.woff2> <Sora[wght].ttf>
```

O script imprime o resumo (sha256) de cada arquivo. Os da IBM se conferem contra o pacote dela:

| arquivo | sha256 (começo) |
|---|---|
| `ibm-plex-mono-400-normal.woff2` | `e8993d946649b9d0` |
| `ibm-plex-mono-500-normal.woff2` | `41201b658a328b9d` |
| `ibm-plex-mono-600-normal.woff2` | `b7acd05041ab65f3` |

Os `atkinson-*.woff2` de `files/` e os `.ttf` de `files-native/` são da Atkinson e ficam só até a
`0.39.1`, para o nativo.

## Por que um pacote só dele

Ele saiu do core para que quem já serve a fonte — de um CDN próprio, ou hospedada com outros
recortes — possa dispensá-lo sem copiar e alterar a folha de estilo.

## Licença

As quatro famílias estão sob a **SIL Open Font License 1.1**, e o texto da licença vai junto com o
pacote, com o copyright de cada uma. A IBM Plex Mono tem o **nome reservado "Plex"**: arquivo
modificado não pode levar esse nome — por isso os dela vão sem mudança. A OFL não é a Apache-2.0:
leia-a antes de redistribuir os arquivos de fonte.
