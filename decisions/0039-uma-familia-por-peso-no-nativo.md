# ADR-0039 — No nativo, cada peso é uma FAMÍLIA; `fontWeight` não escolhe fonte

- **Data:** 02/09/2026
- **Estado:** aceita · **executada** no Lote 0 do [`NATIVE.md`](../docs/NATIVE.md)
- **Fecha:** a ponta solta que a **Etapa 2** deixou por escrito — *"`fontFamily` sai como a família
  PEDIDA (`IBM Plex Sans`), não como o nome que o RN aceita… O nome final se decide quando os
  arquivos nativos entrarem."* Os arquivos entraram; o nome está decidido, e foi **medido**.

## Contexto

O bloqueio 1 da §5.2 do `NATIVE.md`: `@aurea-uds/fonts` tinha **11 `.woff2` e zero `.ttf`**, e o
React Native não lê woff2. Sem `.ttf` o IBM Plex não aparece no aparelho e o app cai na fonte de
sistema — que é a identidade que o `CLAUDE.md` declara intocável.

Resolver isso parecia ser só empacotar outro formato. Não é: **o formato traz junto uma decisão de
API**, e ela não aparece em nenhuma documentação de fonte — aparece dentro do arquivo.

## O que foi medido (02/09/2026)

### De onde vêm os `.ttf`, e a linhagem confere

Nenhum canal do npm publica TTF do IBM Plex. Medido baixando e listando os tarballs:

| pacote | versão | TTF |
|---|---|---:|
| `@ibm/plex` (monolítico) | 6.4.1 · 5.2.1 | **0** |
| `@ibm/plex-sans` · `-serif` · `-mono` | 1.1.0 · 2.0.0 · 2.5.0 | **0** |
| `@fontsource/ibm-plex-sans` | 5.3.0 | **0** |
| `@expo-google-fonts/ibm-plex-*` | 0.4.1 | **estáticos, um por peso** |

Os três primeiros publicam só `woff2`/`woff`. A origem escolhida é a última — MIT AND OFL-1.1, com
os TTF estáticos que o Google Fonts serve.

**E a linhagem foi conferida, não presumida:** o `ibm-plex-sans-400-normal.woff2` do repositório é
**byte a byte** o `ibm-plex-sans-latin-400-normal.woff2` do `@fontsource@5.3.0` (mesmo md5). Os dois
alvos, web e nativo, vêm do mesmo desenho.

### O achado que decide a API: a família RIBBI

Lendo a tabela `name` de cada `.ttf` (nameIDs 1, 2, 6, 16, 17):

| arquivo | `family` (nameID 1) | `postscript` (nameID 6) |
|---|---|---|
| sans 400 normal | `IBM Plex Sans` | `IBMPlexSans-Regular` |
| sans 400 italic | `IBM Plex Sans` | `IBMPlexSans-Italic` |
| sans 700 | `IBM Plex Sans` | `IBMPlexSans-Bold` |
| **sans 500** | **`IBM Plex Sans Medium`** | `IBMPlexSans-Medium` |
| **sans 600** | **`IBM Plex Sans SemiBold`** | `IBMPlexSans-SemiBold` |

**Só Regular, Italic e Bold moram na família `IBM Plex Sans`.** É o formato RIBBI, e vale para as
três famílias — Serif e Mono medem igual.

**Consequência direta:** `fontFamily: "IBM Plex Sans"` + `fontWeight: "600"` **não devolve o
SemiBold desenhado**. O peso não está naquela família; o sistema devolve o Regular, sintetizando o
peso ou ignorando o pedido. E faz isso **em silêncio** — o texto aparece, só que errado, o que é
pior do que não aparecer.

Na web isso não existe: o `@font-face` declara `font-family` e `font-weight` separadamente, e o
navegador casa os dois. **É mais uma coisa que a cascata do CSS resolvia e aqui não há quem
resolva** — a mesma classe de diferença que a Etapa 2 encontrou em `rem`, `em` e `@media`.

## Decisão

**No alvo nativo, `fontFamily` recebe o NOME POSTSCRIPT, e `fontWeight` não escolhe fonte.**

Três cláusulas:

1. **O nome é medido, não escrito.** O `build-fonts.mjs` lê a tabela `name` de cada `.ttf` e emite
   o mapa. Escrever `"IBMPlexSans-SemiBold"` numa constante seria uma segunda verdade sobre um byte
   que já existe no binário — e a primeira a divergir num troca-de-versão.
2. **O consumidor recebe a tradução pronta.** `FONT_FAMILIES.ui[600]` devolve o nome que o RN
   aceita; ninguém precisa saber que 600 é "SemiBold" nem que SemiBold é família própria.
3. **O mapa é INJETADO no provider, não importado por ele.** `<AureaProvider fontFamilies={…}>`.
   Quem já tem a própria pilha de fonte não carrega 1,91 MB da nossa — é a mesma trava que a
   cláusula 3 da [ADR-0038](0038-um-componente-por-icone-sobre-react-native-svg.md) deu ao ícone,
   pelo mesmo motivo.

Sem o mapa, o provider devolve a família **pedida** (`IBM Plex Sans`), que é o que o token diz. Isso
é honesto e degrada de forma previsível: fonte de sistema, e não um peso errado.

## As alternativas, e por que cada uma caiu

- **Fonte variável** (`IBMPlexSans[wdth,wght].ttf`, que o Google Fonts publica e pesa 537 KB) —
  um arquivo por família em vez de onze. Cai porque o React Native **não expõe eixos de variação**:
  não há `fontVariationSettings` na API de `Text`, e o que se obtém é a instância default. Trocaria
  cinco pesos desenhados por um.
- **Converter os `woff2` que já temos** — o `woff2` é sfnt com Brotli **mais transformação das
  tabelas `glyf`/`loca`; desfazer isso exige um decodificador (`wawoff2`), que é dependência nova de
  build. E os nossos são o subset `latin`: converter entregaria uma fonte incompleta.
- **Subsetar os `.ttf` para `latin`**, como a web faz — cairia de 1,91 MB para ~250 KB. Cai **por
  ora**, não por mérito: exige `fonttools`, e o repositório roda Python de **stdlib pura**
  (medido: `validate.py` importa só `base64`, `collections`, `json`, `os`, `re`, `sys`,
  `unicodedata`, `pathlib`). No nativo a fonte é asset local do bundle, não transferência de rede
  por página, então o custo é do APK/IPA, uma vez. **Reabre quando o tamanho do bundle doer** — e
  aí é medição, não gosto.

## Consequências

- **`@aurea-uds/fonts` ganha o subpath `./native`** e o diretório `files-native/` — 11 `.ttf`,
  **1,91 MB**. O tarball do pacote vai de 236 KB para ~2,15 MB, e isso pesa para todo consumidor,
  inclusive o de web. É o custo aceito de não criar um sétimo pacote só para binário; foi o que o
  `NATIVE.md` §5.2.1 já previa (*"provavelmente um subpath novo"*).
- **Os glifos diferem entre os alvos:** o nativo carrega a fonte completa, a web o subset `latin`.
  Mesmo desenho, conjuntos diferentes.
- **O gate é o check 37** do `validate.py`: os dois lados têm de listar os mesmos 11 estilos, o
  mapa gerado tem de bater com os arquivos, e nome PostScript repetido reprova. Provado contra o
  defeito — com um `.ttf` a menos, reprova.
- **O `Text` do Lote 1 nasce sabendo disso.** Ele vai pedir peso e receber família; é a razão de o
  `AureaTokens.font` ser indexado por peso e não uma string só.

## ~~O limite honesto desta ADR~~ ✅ **MEDIDO EM APARELHO — 03/09/2026**

> **Os cinco pesos aparecem distintos.** Rodado pelo Victor num Android, com o app
> `apps/native-smoke/`: Regular, Medium, SemiBold e Bold saem visivelmente diferentes, o itálico
> sai inclinado, e — o que fecha a prova — a linha de **controle**, que não passa por
> `fontFamily`, sai com desenho diferente das quatro. Fossem todas iguais a ela, nenhuma fonte
> teria carregado; fossem as quatro iguais entre si, o nome PostScript não teria resolvido.
>
> **Serif e Mono também**: `IBM Plex Serif` saiu com serifa e `IBM Plex Mono` monoespaçado.
>
> **E a correção que veio depois desta ADR foi provada junto:** a tela imprime
> `IBMPlexSerif-Medium` e `IBMPlexMono-SemiBold` nos lugares de `editorial[400]` e `code[700]` —
> os dois pesos que **não existem** no IBM Plex e devolviam `undefined` antes de o provider fechar
> a grade.

O texto abaixo é o limite que esta ADR carregou por um dia, mantido como registro.

**Nada disto rodou em aparelho.** O que existe é a tabela `name` lida byte a byte, o contrato dos
pacotes e o comportamento documentado do `expo-font`. O que a Etapa 4 tem de medir é uma coisa só,
e é visual: se os cinco pesos aparecem distintos na tela. **A medição que sustenta esta ADR é do
arquivo, não do renderizador.**

## Condição de revisão

- **O React Native expor eixos de fonte variável** — aí a variável volta à mesa e são 11 arquivos a
  menos. É ADR nova.
- **O tamanho do bundle doer** — aí entra o subsetting, e com ele a dependência de `fonttools`.
  Não muda esta decisão: muda o conteúdo dos arquivos, não como se pede a fonte.
- **O IBM Plex publicar TTF estático em canal próprio** — trocaria a origem, não o desenho.
