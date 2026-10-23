# Código de terceiros na Aurea — o que entra, e sob que licença

Este documento lista só o que **entra** na Aurea: as dependências cujo código roda dentro dela e os
recursos que ela redistribui. Cada linha diz para que serve e sob que licença.

As leituras de desenho de outras bibliotecas, que orientam a construção, **não moram no
repositório** (decisão do Victor, 07/10/2026). Elas ficam com o Victor, fora do git.

| Dependência | Para quê | Licença | Onde está o aviso |
|---|---|---|---|
| [Base UI](https://base-ui.com) | motor de comportamento das peças da web (sem aparência) | MIT | [ADR-0004](../decisions/0004-motor-headless-base-ui.md) |
| [Recharts](https://recharts.org) | motor de gráfico (dependência opcional) | MIT | — |
| [react-day-picker](https://daypicker.dev) | motor de calendário (dependência opcional) | MIT | — |
| [Phosphor Icons](https://phosphoricons.com) | os glifos, Regular e Fill (desde 01/10/2026, ADR-0053) | MIT | `packages/icons/NOTICE` · `packages/native/NOTICE` |
| [Inter](https://github.com/rsms/inter) | a fonte do texto (desde 22/10/2026, ADR-0077), da versão 4.1 do autor, cortada para o latino | OFL-1.1 | `packages/fonts/LICENSE` |
| [Sora](https://github.com/sora-xor/sora-font) | a fonte dos títulos (desde 22/10/2026, ADR-0077), do `google/fonts`, cortada para o latino | OFL-1.1 | `packages/fonts/LICENSE` |
| [IBM Plex Mono](https://github.com/IBM/plex) | a fonte do código e dos valores (desde 22/10/2026, ADR-0077), os arquivos da IBM sem mudança (nome reservado "Plex") | OFL-1.1 | `packages/fonts/LICENSE` |
| [Atkinson Hyperlegible Next e Mono](https://github.com/googlefonts/atkinson-hyperlegible-next) | as duas famílias tipográficas (de 01/10/2026, ADR-0053; a web saiu dela em 22/10/2026, o nativo sai na 0.40.1) | OFL-1.1 | `packages/fonts/LICENSE` |
| ~~Carbon Icons~~ | ~~os glifos~~ — até a `0.12.4` | Apache-2.0 | — |
| ~~IBM Plex~~ | ~~as três famílias tipográficas~~ — até a `0.12.4` | OFL-1.1 | — |

Os detalhes de cada redistribuição (formatos, recortes, o que fica de fora) estão no
[`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md).

## Marca de terceiro no SITE (não na biblioteca)

| Marca | Onde | Regra de uso | Arquivos |
|---|---|---|---|
| O logo do GitHub (Invertocat) | só no site `aureauds.dev`: o botão do topo e a nota do Início, que levam ao repositório (decisão do Victor, 15/10/2026) | a do GitHub (`brand.github.com/foundations/logo`, lida em 15/10/2026): pode ser o botão que leva ao projeto; não se modifica; só em preto ou branco. GITHUB® e o logo são marcas registradas da GitHub, Inc. e **não** estão sob a licença Apache-2.0 deste repositório | `apps/catalog/marcas/github/`, os arquivos oficiais sem alteração |

Nenhum pacote publicado (`@aurea-uds/*`) leva o logo: marca de terceiro não entra na biblioteca (CLAUDE.md §5).

## Código copiado

**Nenhum.** A Aurea não tem linha de código copiada de outra biblioteca.

Se um dia entrar código de terceiro — o que só acontece por ordem do Victor e com a licença
conferida antes (o [`BUILDING.md`](BUILDING.md) §2 tem as licenças que cabem numa base
Apache-2.0) —, ele entra **aqui** e no `THIRD_PARTY_NOTICES.md`, com a licença e o aviso de
copyright que ela exigir, e com um comentário curto no ponto de uso.
