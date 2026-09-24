# ADR-0006 — As fontes moram num pacote próprio

- **Data:** 16/07/2026 (decisão) · registrada como ADR em 30/07/2026 (Fase 10, achado M19)
- **Estado:** aceita, em vigor desde a Fase 1
- **Decidiu:** Victor

## Contexto

IBM Plex (Sans, Serif, Mono) é parte da identidade e é **pesada**: ~300 KB de woff2. Ela vivia
embutida no CSS do core, então todo consumidor baixava a tipografia inteira junto das regras,
sem escolha e sem saber.

## Alternativas

**A. Manter embutida no core.** Rejeitada: mistura duas coisas de ciclo de vida diferente
(regra de componente muda toda semana; arquivo de fonte, quase nunca) e impede quem já serve
IBM Plex de não baixar de novo.

**B. Pacote `@aurea-uds/fonts`.** Escolhida.

## Decisão

As fontes saem do core e viram `@aurea-uds/fonts`, com CSS próprio. **A ordem de import é
obrigatória — fontes ANTES do core** — e está escrita no README, no Installation de todas as
169 páginas do catálogo e no exemplo.

## Consequências

**Boas:** o core encolhe; quem já tem IBM Plex servida não baixa duas vezes; a licença OFL-1.1
fica isolada no pacote a que pertence, com o `LICENSE` correto (gate de licença, check 10).

**Custos, declarados:** é mais um pacote para instalar, e a ordem de import é um detalhe que o
consumidor pode errar em silêncio (o texto renderiza com fallback). Por isso ela aparece em toda
página gerada, não só no README.
