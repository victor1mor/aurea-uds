# ADR-0010 — Distribuição: npm público, escopo `@aurea-uds`

- **Data:** 30/07/2026 (recomendação do Opus, aceita pelo Victor) · ADR escrita na Fase 10
- **Estado:** aceita e **EXECUTADA em 31/07/2026** — os seis pacotes estão no npm público em
  `0.1.0`, publicados pelo Victor com 2FA. Verificado no registro, não na tela: contagem de
  arquivos de cada tarball idêntica ao baseline do `scripts/package-files.json`

## Contexto

Nada do que existe está publicado. Os pacotes têm nome (`@aurea-uds/*`), versão (1.7.0) e
licença, e o `README` ensina `pnpm add @aurea-uds/react` — um comando que hoje falha.

## Alternativas

**A. Registro privado / GitHub Packages.** Rejeitada: o projeto quer ser infraestrutura pública
(domínio próprio, licença Apache, catálogo aberto). Registro privado só adiciona atrito.

**B. Não publicar; consumir por caminho de arquivo ou git.** Rejeitada como destino, aceita como
estado atual: funciona para o primeiro consumidor do próprio Victor, mas não sobrevive a um
segundo, e esconde os problemas que só aparecem no `npm install` de fora.

**C. npm público, escopo `@aurea-uds`.** Escolhida.

## Decisão e ORDEM

Publicar no npm público, **depois das Fases 9, 10 e 11** — nessa ordem, e por motivos concretos:

- **9 (fechada):** mudou a API pública. Subpaths e três componentes fora do barril. Publicar antes
  seria publicar uma API que ia quebrar na semana seguinte.
- **11 (aberta):** nove componentes públicos renderizam **sem pele** (achado A13). Publicar um
  componente sem CSS é publicar defeito com número de versão.
- **10 (esta):** é onde a decisão fica registrada e os controles de publicação nascem.

## Antes do primeiro publish, obrigatório

1. **Gate de tarball:** só `dist/` entra. Verificado hoje à mão com `npm pack --dry-run` (40
   arquivos, todos em `dist/`); vira gate antes de publicar.
2. **Nome privado não vaza.** O check 1 varre o repositório, mas o histórico do git e o
   `legacy-reference.html` contêm os nomes antigos — está escrito no `CLAUDE.md` e **não** é
   resolvido por publicar só `dist/`. Avisar o Victor antes de tornar o repositório público é
   parte do ato.
3. **Versão.** 1.7.0 é a versão herdada do kit. Publicar exige decidir se o primeiro release
   público é 1.7.0 ou 0.x — decisão nova, ADR nova.

## Consequências

**Boas:** o `README` deixa de mentir; o consumidor instala como instala qualquer outra coisa.

**Custos, declarados:** publicar é **definitivo** — nome ocupado, versão imutável, `deprecate` é
o único desfazer. E cria obrigação de compatibilidade que hoje não existe.

---

## Emenda — 31/07/2026: o estado das três condições

| Condição | Estado |
|---|---|
| 1. Gate de tarball | **fechada** — `scripts/check-pack.mjs` com baseline versionado, na CI, provado contra o defeito |
| 2. Nome privado não vaza | **em pé, e assumida como custo.** O Victor decidiu em 31/07/2026 publicar com o repositório **privado**. Publicar não expõe o histórico do git; o que fica ausente é provenance e canal público de issue, declarado na [ADR-0013](0013-mecanica-de-publicacao-npm.md). Tornar o repositório público continua exigindo tratar o histórico — e continua não decidido |
| 3. Versão | **fechada** — [ADR-0014](0014-primeira-versao-publica-0-1-0.md): `0.1.0`, não `1.7.0` |

E uma coisa que esta ADR não podia saber: **a mecânica de publicar mudou**. Os classic tokens do
npm foram revogados em 09/12/2025, então o caminho que esta decisão implicitamente supunha
(token em segredo de CI) não existe mais. Está na [ADR-0013](0013-mecanica-de-publicacao-npm.md).

## O que foi publicado, medido no registro em 31/07/2026

| Pacote | Versão | Arquivos no tarball | Baseline do `check-pack` |
|---|---|---|---|
| `@aurea-uds/tokens` | 0.1.0 | 5 | 5 ✓ |
| `@aurea-uds/icons` | 0.1.0 | 5 | 5 ✓ |
| `@aurea-uds/fonts` | 0.1.0 | 15 | 15 ✓ |
| `@aurea-uds/core` | 0.1.0 | 5 | 5 ✓ |
| `@aurea-uds/contracts` | 0.1.0 | 4 | 4 ✓ |
| `@aurea-uds/react` | 0.1.0 | 41 | 41 ✓ |

O gate previu exatamente o que saiu. É a primeira vez que ele é conferido contra a realidade em
vez de contra si mesmo.

**Armadilha registrada, porque custou uma conclusão errada:** consultar
`registry.npmjs.org/<pacote>` **antes** de o pacote existir faz o CDN guardar o 404, e a
consulta seguinte devolve o 404 velho por minutos. Eu li esse cache e afirmei que a publicação
não tinha acontecido. A distinção se faz com `?qualquercoisa=<aleatório>` na URL, que é uma
chave de cache nova — ou esperando. Um controle (consultar um pacote que sabidamente existe)
prova que a rede funciona, mas **não** desfaz o cache negativo daquela URL específica.
