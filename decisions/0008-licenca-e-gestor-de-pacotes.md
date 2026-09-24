# ADR-0008 — Apache-2.0 e pnpm workspaces

- **Data:** 16/07/2026 (decisão) · registrada como ADR em 30/07/2026 (Fase 10, achado M19)
- **Estado:** aceita, em vigor e **gateada**
- **Decidiu:** Victor

Duas decisões pequenas, registradas juntas porque cada uma cabe em um parágrafo — e porque não
registrá-las foi parte do achado M19. Decisão curta também precisa de data e de consequência.

## Licença: Apache-2.0

**Contexto.** A biblioteca vai ser pública, e carrega trabalho de terceiros: IBM Plex (OFL-1.1) e
Carbon Icons (Apache-2.0).

**Alternativa considerada:** MIT, mais curta e mais comum em design systems. **Rejeitada** por um
motivo concreto: a Apache-2.0 tem cláusula de patente expressa e exige o aviso de mudanças —
proteção que a MIT não dá, e que vale para um projeto que pretende ser infraestrutura de outros.

**Consequência:** cada pacote publicável carrega o próprio `LICENSE`, e o de fontes carrega a OFL
com o copyright da IBM. O `NOTICE` de atribuição do Carbon precisa estar em `files` do
`package.json`, senão não entra no tarball. Tudo isso é o **check 10** do `validate.py`.

## Gestor: pnpm workspaces

**Contexto.** Vários pacotes (`tokens`, `core`, `icons`, `fonts`, `react`, `contracts`) com
dependência entre si e um build encadeado.

**Alternativa considerada:** npm workspaces (já vem instalado). **Rejeitada** pelo que o pnpm faz
melhor aqui: `node_modules` por pacote com links, o que torna **detectável** a dependência que um
pacote usa sem declarar — exatamente o erro que a Fase 9 estava caçando ao tornar CodeMirror,
react-table e `qr` peers opcionais.

**Consequência:** o repositório exige pnpm 11 (`packageManager` no `package.json` da raiz), e a
CI usa a mesma versão. Quem rodar `npm install` aqui produz uma árvore diferente da que os gates
verificam.
