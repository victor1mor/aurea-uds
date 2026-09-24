# Auditoria integral — Aurea UDS — 26/07/2026

Índice documental desta auditoria e mapa de precedência do projeto.

**Etapa de auditoria (26/07/2026):** nada foi implementado — os seis arquivos desta pasta
foram o único acréscimo, e nenhum arquivo do projeto foi alterado.

**Depois disso** o Victor autorizou fase por fase. Fases 1, 2 e 3 estão executadas; o
placar por achado é a tabela em `02-ACHADOS.md` §0. Este documento descreve o método e o
mapa; ele **não** é o placar.

---

## 1. Documentos desta auditoria

| Arquivo | Assuntos que cobre | Status |
|---|---|---|
| `00-INDEX.md` (este) | índice documental, precedência, limites | entregue |
| `01-MAPA-FACTUAL.md` | inventário real, mapa arquitetural, mapa do código, inventário de componentes, inventário de fundações visuais | entregue |
| `02-ACHADOS.md` | achados (visual, consistência, arquitetura, a11y, responsividade, código, doc, testes), falsos alarmes, áreas não verificadas | entregue |
| `03-PLANO.md` | plano de correção por fases, critérios de qualidade, controles automáticos propostos | entregue — **proposta** |
| `04-PROTOCOLO-IA.md` | protocolo de sessão para agentes, estado atual, próxima tarefa exata | entregue — **proposta** |
| `05-SENTINELA-2026-08-12-CODEX-PARA-CLAUDE.md` | reauditoria das correções SENTINELA, inventário integral do diff, gates e handoff para revisão independente | entregue — **aprovação condicional** |
| `manifest.json` | manifesto estruturado legível por máquina | entregue — **proposta** |

**Proposta** significa: descreve o que deveria valer e ainda não é regra canônica do
projeto. O `03-PLANO.md` está sendo executado fase a fase; o `04-PROTOCOLO-IA.md` foi
seguido nas três primeiras. Quando o Victor aprovar, cada um migra para documento canônico
em vez de virar doc concorrente.

---

## 2. Precedência real do projeto (verificada, não presumida)

| Assunto | Documento canônico hoje | Observação |
|---|---|---|
| Identidade visual, nomes privados, toolchain | `CLAUDE.md` | instruções de projeto; carregado automaticamente |
| Visão, arquitetura, backlog, ordem macro | `AUREA.md` | declara-se canônico no cabeçalho |
| Etapas técnicas por fase | `ROADMAP.md` | 61 KB, duas trilhas paralelas (Biblioteca 0–7, Catálogo 1–5) |
| Taxonomia-alvo | `DIRECTION.md` | direção, não ordem de construir |
| Regras de projeto para agentes | `AGENTS.md` | ponteiro para `CLAUDE.md`, correto |
| Spec de máquina de componente | `packages/contracts/registry/*.json` | fonte real do catálogo gerado |
| Spec de máquina de sistema | `packages/contracts/aurea.contract.json` | consumido pelo gerador e pelo validador |
| História de auditoria | `AUDIT-2026-07-18.md`, `AUDIT-2026-07-26.md` | fechados |
| Consumo público | `README.md` | em inglês |

**Conflito de precedência encontrado:** `AUREA.md` diz que vence sobre os outros;
`CLAUDE.md` é injetado como instrução obrigatória em toda sessão de IA. Na prática
`CLAUDE.md` vence, porque é lido antes e sempre. Isso não está escrito em lugar nenhum.
Ver achado **I1** e **M19**.

**Sem documento canônico para:** estado do projeto (três documentos divergem),
registro de decisões (ADR), registro de referências externas, critérios objetivos de
conclusão, contrato de componente legível por humano, protocolo de sessão de IA,
manifesto de projeto. Ver `02-ACHADOS.md`.

---

## 3. Ordem de leitura recomendada

1. `01-MAPA-FACTUAL.md` — o que o projeto **é** hoje, medido.
2. `02-ACHADOS.md` — o que está errado, com evidência e severidade.
3. `03-PLANO.md` — em que ordem consertar e por quê.
4. `04-PROTOCOLO-IA.md` — como a próxima sessão continua sem reler tudo.

---

## 4. Método e classificação da evidência

Toda afirmação está marcada:

- **VERIFICADO** — medido nesta auditoria (comando, contagem, medição no navegador).
- **INFERÊNCIA** — conclusão provável a partir de evidência parcial.
- **DESCONHECIDO** — não localizado.
- **BLOQUEADO** — impedimento técnico registrado.

Causa raiz marcada como **HIPÓTESE** quando não foi provada.

### O que foi executado

| Verificação | Resultado |
|---|---|
| `python scripts/validate.py` | OK (12 checks) |
| `pnpm test` (vitest) | 81/81 passou, 51 s |
| `playwright catalog-sweep.spec.ts` (169 páginas × 7 larguras + headings + console/4xx + axe × 2 temas) | 5/5 passou |
| `playwright rtl.spec.ts` | 4/4 passou |
| `playwright status.spec.ts` | 4/4 passou |
| Medição própria: geometria de controle × 3 densidades | executada |
| Medição própria: alinhamento ícone↔texto, 20 páginas | executada |
| Medição própria: alvos < 24×24, 20 páginas | executada |
| Medição própria: contraste WCAG com conversão oklch→sRGB, 8 páginas × 2 temas | executada |
| Medição própria: texto a 200%, 8 páginas | executada |
| Medição própria: alcance do CSS do core por consumidor real, por regra e por byte | executada |
| Medição própria: modelo de página das 169 páginas geradas | executada |
| Render inspecionado em 1440px e 375px, tema escuro | executado |

### O que NÃO foi executado, e por quê

- `pnpm build` — **BLOQUEADO por decisão**: reescreve artefatos versionados; a trava
  de implementação proíbe alterar o repositório. A prova de build limpo existe no CI
  (`.github/workflows/ci.yml`, passo "Falhar se dist desatualizado").
- `pnpm test:visual` completo (screenshots) — não executado: os baselines do repo são
  `-win32`, comparar aqui não acrescenta informação, e regenerar alteraria arquivos.
- Leitura linha a linha de `packages/react/src/index.tsx` (899 linhas) e de
  `packages/core/src/aurea.css` (698 linhas de linha longa): auditados por medição e
  consulta dirigida, não por leitura integral. Ver §5.
- `ROADMAP.md` (61 KB): estrutura mapeada e seções de estado lidas; as ~900 linhas de
  histórico de fases concluídas não foram lidas integralmente.
- Leitura tela a tela de `apps/docs/index.html` (670 KB, 2.139 linhas).
- Teste com leitor de tela real (NVDA/JAWS/VoiceOver) — **BLOQUEADO**: não há leitor
  de tela neste ambiente. A11y semântica foi verificada por axe-core 4.10.2 e por
  medição de propriedade, não por uso assistivo.
- Navegadores além do Chromium — **BLOQUEADO**: só Chromium instalado.
- Referências externas (Kibo UI, Untitled UI) — **BLOQUEADO nesta sessão**: os espelhos
  locais citados em `AUREA.md` (`C:\Meus Sites\kibo-ui.com`, `C:\Meus Sites\untitledui.com`)
  não foram acessados; nenhuma comparação com referência externa foi feita, e portanto
  nenhuma é afirmada. O registro de referências (§10 do escopo pedido) fica **AUSENTE**
  por falta de análise, não por esquecimento.

### Limitação de execução registrada

A auditoria começou com uma varredura paralela de 10 agentes (um por subsistema).
Os 10 falharam no limite mensal de gasto da conta, sem devolver resultado
(1.255.882 tokens consumidos, 356 chamadas de ferramenta, zero retorno).
A auditoria foi então feita em sessão única, trocando leitura integral por medição
instrumentada. Consequência: a cobertura por **medição** é alta e reprodutível; a
cobertura por **leitura de julgamento** (estilo de código, nomes, comentários,
legibilidade linha a linha) é parcial e está declarada como tal em `02-ACHADOS.md`.

---

## 5. Áreas analisadas × não analisadas

| Área | Cobertura | Como |
|---|---|---|
| Estrutura do monorepo, build, CI | integral | leitura completa dos 5 scripts, CI, configs |
| Tokens (271) | integral | leitura do DTCG + medição de uso, paridade, duplicidade |
| CSS do core (376 classes, 87 KB) | alta | medição por regra e por byte; leitura dirigida das famílias de controle |
| API React (65 exports) | média | medição de convenções, tipos de união, refs, deps; **sem** leitura linha a linha |
| Gerador do catálogo (666 linhas) | média-alta | estrutura, page model, chrome, dogfooding medidos |
| 169 páginas geradas | integral | medição automatizada em todas |
| 65 fichas de registry | integral | leitura programática de todas |
| 35 arquivos de content | média | medição de chaves e cobertura; leitura de amostra |
| 23 receitas `patterns/*.md` | baixa | validadas pelo gate; **não lidas** nesta auditoria |
| Testes (81 unit + 17 visual) | integral | leitura dos 6 specs + medição de cobertura por componente |
| Documentação de governança | alta | leitura integral de 9 docs; `ROADMAP.md` parcial |
| `apps/docs/index.html` | baixa | tratado como superfície legada; medido, não lido |
| Acessibilidade | média-alta | axe × 169 páginas × 2 temas, contraste próprio, foco, alvos, headings, RTL, reduced-motion — **sem leitor de tela** |
| Responsividade | alta | 7 larguras × 169 páginas (gate) + 375px inspecionado + texto 200% |
| Referências externas | **nula** | ver §4 |
