# ATIVIDADE-2 — o estado de execução

A ordem está no `ATIVIDADE-2.md` do Victor (207 seções). Ela **não é um documento de discussão**:
autoriza executar um programa amplo de construção e proíbe encerrar no inventário.

Esta pasta é o **estado reentrante** que o §87 e o §88 exigem. Uma sessão nova não recomeça:
lê daqui onde parou.

| Arquivo | O que responde |
|---|---|
| [`00-STATUS.md`](00-STATUS.md) | **Comece aqui.** Onde parou, o que está aberto, o que vem a seguir |
| [`01-FASE-ZERO.md`](01-FASE-ZERO.md) | A medição do §8 e os defeitos que ela achou |
| [`02-FONTES.md`](02-FONTES.md) | Cobertura por fonte (§89) e a prova da `Referencia/` (§90) |
| [`03-GAPS.md`](03-GAPS.md) | A fila canônica única do §72 — todo gap com ID, tipo e estado |
| [`04-TRIAGEM.md`](04-TRIAGEM.md) | O que as nove referências têm e a Aurea não — e os falsos ausentes que a triagem produziu |
| [`05-INVENTARIO-BASE-UI.md`](05-INVENTARIO-BASE-UI.md) | O inventário do §9 da primeira referência: 47 primitives, 757 estados, e o que isso corrigiu na Aurea |
| [`06-INVENTARIO-RADIX.md`](06-INVENTARIO-RADIX.md) | O inventário do §9 da segunda, e a resposta a "a aposta na Base UI deixa buracos?" |
| [`07-INVENTARIO-MUI.md`](07-INVENTARIO-MUI.md) | O inventário do §9 da terceira — a de vocabulário mais rico —, e o que ele revelou sobre o enum de variante da Aurea |
| [`08-INVENTARIO-UNTITLED.md`](08-INVENTARIO-UNTITLED.md) | O inventário do §9 da quarta — a de proporção —, e os sete componentes nossos sem escala |
| `inventory.mjs` | Enumera a superfície pública das nove referências. Escreve `INVENTORY.json` |
| `crossref.mjs` | Cruza o inventário com a Aurea. Escreve `CROSSREF.json` |
| `inventory-baseui.mjs` | O inventário do §9 da `base-ui`. Escreve `INVENTORY-BASE-UI.json` |
| `inventory-radix.mjs` | O inventário do §9 da `radix`. Escreve `INVENTORY-RADIX.json` |
| `inventory-mui.mjs` | O inventário do §9 da `mui`. Escreve `INVENTORY-MUI.json` |
| `inventory-untitled.mjs` | O inventário do §9 da `untitled-ui`. Escreve `INVENTORY-UNTITLED.json` |

O extrator da API pública deixou de morar aqui: virou passo de build
(`scripts/build-api-surface.mjs` → `packages/contracts/api-surface.json`), porque o check 14 do
validador passou a depender dele.

## O que esta pasta não é

Não é uma segunda fonte de verdade. Os números de estado do projeto continuam no
[`STATE.md`](../../STATE.md), gerado e gateado pelo check 13. A fila de trabalho até a `1.0`
continua no [`PLANO-1.0.md`](../../docs/PLANO-1.0.md). Aqui fica só o que é da atividade: a comparação
com as referências, os gaps que ela abriu, e o que já foi fechado.

Quando um gap daqui coincide com um item do `PLANO-1.0`, o item de lá é o dono e este arquivo
aponta para ele. Duplicar fila é como se perde o estado.

## A regra de contagem

`CLAUDE.md` proíbe número de estado escrito à mão. Vale aqui também: **toda contagem nestes
arquivos vem com o comando que a reproduz e a data em que foi medida.** Número sem comando atrás
é o achado I1 outra vez.

## Conflito registrado com as regras vigentes (§181)

A ordem suspende, **para esta atividade**, a regra do `BUILDING.md` §5 ("escopo menor que o da
referência") como justificativa automática de corte — §17 e §180. Não suspende nada mais:
identidade visual (`CLAUDE.md`), gates, procedimento de construção e ADRs continuam valendo. O
§17 lista os motivos que ainda permitem excluir uma capacidade; "é muita coisa" não é um deles.

A [ADR-0015](../../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md) já ia nessa direção —
cobertura antes da demanda. A ordem vai além dela em ambição, não contra ela.
