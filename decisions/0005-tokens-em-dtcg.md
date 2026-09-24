# ADR-0005 — Tokens no formato DTCG

- **Data:** 16/07/2026 (decisão) · registrada como ADR em 30/07/2026 (Fase 10, achado M19)
- **Estado:** aceita, em vigor desde a Fase 1
- **Decidiu:** Victor

## Contexto

Os tokens nasceram como um JSON próprio, plano, com valores crus. Um formato próprio significa
ferramenta própria para tudo: emitir CSS, emitir nativo, validar, importar em ferramenta de
design.

## Alternativas

**A. Manter o formato próprio.** Rejeitada: nada além de nós lê, e o custo aparece inteiro na
primeira integração (Figma, React Native, Style Dictionary).

**B. DTCG (Design Tokens Community Group), `$value`/`$type`.** Escolhida. É o padrão que as
ferramentas do mercado leem, e traz `$description` — significado junto do valor.

## Decisão

`packages/tokens/src/aurea.tokens.json` é DTCG: toda folha tem `$value` e `$type`. O CSS é uma
**saída** desse arquivo, não a origem. Referência entre tokens usa a sintaxe DTCG (`{radius.card}`),
o que a Fase 6 usou para acabar com duplicata de valor.

## Consequências

**Boas:** um emissor por alvo, sem inventar formato; a Fase 6 pôde tratar alias como referência
declarada em vez de dois nomes com o mesmo número.

**Custos, declarados:** `$description` é opcional no padrão e ficou em 18 de 260 folhas — o
achado **M15**, ainda parcial. Os tokens semânticos antigos seguem sem descrição.
