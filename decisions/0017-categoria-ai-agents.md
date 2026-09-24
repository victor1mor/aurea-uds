# ADR-0017 — A categoria "AI & Agents" entra na taxonomia

**Data:** 09/08/2026
**Estado:** aceita
**Contexto:** Parte H do [`PLANO-1.0`](../docs/PLANO-1.0.md) — a camada operacional.

## O problema

O `packages/contracts/aurea.contract.json` declara **16 nomes** em
`componentRules.UniversalDomain` — `AgentCard`, `TaskQueue`, `HumanApproval`, `TraceTimeline`,
`CostMeter` e companhia. Nenhum tinha código. A Parte H existe para construí-los.

A taxonomia de categorias do registry está **travada em 13** no `scripts/validate.py`, e o
comentário ao lado diz a regra: *"Crescer = adicionar categoria da direção, não catch-all."*

Nenhuma das 13 descreve o objetivo dessa família. Distribuí-los por afinidade — `AgentStatus` em
Feedback, `TaskQueue` em Data Display, `HumanApproval` em Overlays — cabe no gate e **quebra a
família em cinco lugares**, inclusive no código, porque o repositório organiza um módulo por
categoria (Fase 9, achado A5).

## A decisão

Entra a categoria **"AI & Agents"**, da macroárea **18** do [`DIRECTION.md`](../docs/DIRECTION.md) §2.
O código dela mora em `packages/react/src/agents.tsx`.

## Por que isto é uma DECISÃO e não uma dedução

Porque o §2 do `DIRECTION.md` se declara, na própria linha do título, **"ilustrativo,
não-vinculante"**. Tirar uma categoria de lá é escolher, não ler. O §4 — que é o vinculante —
reorganizou os 59 de então e não previu esta família.

Registro em ADR em vez de mudar o gate em silêncio: categoria aparece na ficha, na navegação do
catálogo e no caminho da página, e desfazer depois custa renomear tudo isso.

## Alternativas recusadas

**Distribuir pelas 13 existentes.** Cabia no gate sem tocar em nada. Recusada porque separa em
cinco módulos uma família que o contrato declara como uma só, e porque a próxima sessão precisaria
descobrir, componente a componente, onde cada peça foi parar.

**Uma categoria nova de nome próprio** ("Operations", "Agentic"). Recusada porque inventar nome
fora do `DIRECTION.md` é o oposto do que o gate pede — e "da direção" era a única porta aberta.

## Consequência, e ela precisa do Victor

A taxonomia deixou de ter 13 categorias. Se o Victor preferir outro nome ou preferir distribuir,
a mudança é de **campo de JSON em 16 fichas** mais uma linha no `validate.py` — barata enquanto a
Parte H não fechar, cara depois que o catálogo publicar as páginas.
