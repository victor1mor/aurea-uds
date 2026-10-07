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
| [Atkinson Hyperlegible Next e Mono](https://github.com/googlefonts/atkinson-hyperlegible-next) | as duas famílias tipográficas (desde 01/10/2026, ADR-0053) | OFL-1.1 | `packages/fonts/LICENSE` |
| ~~Carbon Icons~~ | ~~os glifos~~ — até a `0.12.4` | Apache-2.0 | — |
| ~~IBM Plex~~ | ~~as três famílias tipográficas~~ — até a `0.12.4` | OFL-1.1 | — |

Os detalhes de cada redistribuição (formatos, recortes, o que fica de fora) estão no
[`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md).

## Código copiado

**Nenhum.** A Aurea não tem linha de código copiada de outra biblioteca.

Se um dia entrar código de terceiro — o que só acontece por ordem do Victor e com a licença
conferida antes (o [`BUILDING.md`](BUILDING.md) §2 tem as licenças que cabem numa base
Apache-2.0) —, ele entra **aqui** e no `THIRD_PARTY_NOTICES.md`, com a licença e o aviso de
copyright que ela exigir, e com um comentário curto no ponto de uso.
