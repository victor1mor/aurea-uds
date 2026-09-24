# ADR-0012 — O produto fala inglês; a conversa é em português

- **Data:** 23/07/2026 (decisão) · registrada como ADR em 30/07/2026 (Fase 10, achado M19)
- **Estado:** aceita, em vigor
- **Decidiu:** Victor

## Contexto

O projeto nasceu em português: strings padrão dos componentes, documentação, nomes de exemplo.
O alvo, porém, é uma biblioteca pública com domínio próprio e pacotes no npm.

## Alternativas

**A. Manter pt-BR como padrão.** Rejeitada: um design system público com `aria-label="Fechar"`
por padrão exclui a maioria dos consumidores, e a tradução vira responsabilidade de quem instala.

**B. Inglês por padrão, sem i18n.** Rejeitada: perderia o português que já existia e funcionava.

**C. Inglês como baseline, i18n mantida, pt-BR como locale exportado.** Escolhida.

## Decisão

- **Produto** (strings padrão, rótulos, README, catálogo, código e comentários de conteúdo
  público): **inglês**.
- **pt-BR** continua disponível como locale: `<AureaProvider strings={ptBR}>`.
- **Conversa com o Victor e comentários de código do repositório:** português. Não é
  inconsistência — é o público de cada texto. O comentário explica para quem mantém; a string
  aparece para quem usa.

## Consequências

**Boas:** o consumidor internacional instala e usa; a i18n existe de verdade porque foi
exercitada por dois idiomas.

**Custos, declarados:**
- Toda string nova precisa passar pela i18n; string cravada em inglês no componente é dívida
  silenciosa (foi assim que `navigationToggle` entrou na Fase 8 — pela i18n, nas três pontas).
- O achado **B4** apontou uma "string em português no conteúdo" e era **falso alarme**: a
  ocorrência está num *comentário*, e comentário é português por esta decisão. Medido de novo em
  30/07/2026: o conteúdo visível do catálogo está em inglês.
- `apps/docs/index.html` (a página manual, legada) segue em português. Ela sai inteira; traduzir
  o que vai ser apagado seria trabalho contra o próprio plano.
