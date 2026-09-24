# ADR-0011 — O registry é a fonte do que um componente é

- **Data:** 23/07/2026 (decisão) · registrada como ADR em 30/07/2026 (Fase 10, achado M19)
- **Estado:** aceita, em vigor e **gateada** (checks 11, 14, 16, 17)
- **Decidiu:** Victor ("o keystone")

## Contexto

Antes, o que um componente **era** estava espalhado: o nome no código, a categoria na cabeça de
quem escreveu, os estados no CSS, a acessibilidade em comentário, e a documentação num HTML
escrito à mão. Não havia como perguntar ao repositório "quais componentes existem, em que
categoria, com que tokens" sem ler tudo.

## Alternativas

**A. Extrair tudo do código (TypeScript como fonte).** Rejeitada: o tipo sabe a assinatura, não
sabe categoria, maturidade, padrão APG, plataforma nem token consumido. Extrair isso exigiria
convenção de comentário — que é metadado sem gate, ou seja, prosa.

**B. Uma ficha por componente, em JSON, versionada.** Escolhida.

## Decisão

`packages/contracts/registry/<Componente>.json` descreve cada componente como **dado**: nome,
categoria, camada, maturidade, resumo, ícone, plataformas, variantes, tamanhos, estados, tokens,
a11y, dependências, relacionados e origem. Quem consome:

- o **catálogo** é gerado dele (169 páginas), não escrito à mão;
- o **`STATE.md`** conta a partir dele;
- os **gates** cobram a coerência com o código.

## Como isso é obrigado

- **Check 11:** schema, enums (categoria da taxonomia, camada, maturidade, status de plataforma),
  nome ⟷ arquivo ⟷ export React, ícone na allowlist do contrato, e **token citado tem de existir
  no CSS** — foi o que matou `--font-sans` fictício.
- **Check 14:** união de variante no TypeScript == `variants` da ficha (achado M9).
- **Check 16:** ficha `Stable` exige teste (achado M7).
- **Check 17:** todo componente tem de onde tirar preview e código (ADR-0001).

## Consequências

**Boas:** a pergunta "o que existe?" tem resposta de máquina; documentação nova nasce do dado;
divergência entre contrato e código reprova o build.

**Custos, declarados:** a ficha é escrita à mão, então ela pode estar **incompleta** sem estar
errada — e está: `props` em 22 de 65 (achado **M8**, aberto). Gate só pega o que se propôs a
medir; ele nunca provou que a ficha diz tudo o que poderia dizer.
