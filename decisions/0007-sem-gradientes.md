# ADR-0007 — Sem gradientes, nem os funcionais

- **Data:** Fase 0 (07/2026) · registrada como ADR em 30/07/2026 (Fase 10, achado M19)
- **Estado:** aceita, em vigor e **gateada**
- **Decidiu:** Victor

## Contexto

O kit de origem usava gradiente como recurso visual — em superfície, em botão e também em lugares
funcionais (barra de progresso, medidor). Gradiente é a marca registrada de uma época de
interface, envelhece rápido, e some quando o usuário força alto contraste.

## Alternativas

**A. Manter em uso funcional (progresso, medidor).** Rejeitada — e esta é a parte que importa da
decisão: "só no funcional" é como o gradiente volta. Uma exceção documentada vira duas.

**B. Nenhum gradiente.** Escolhida. A profundidade vem de superfície, borda e espaço — que é a
identidade descrita no `CLAUDE.md`.

## Decisão

`gradient(` não existe no CSS do core, nem no dos docs. Cor chapada, borda de 1px e raio fazem o
trabalho.

## Como isso é obrigado

Check 4 do `validate.py`: o build reprova se a string `gradient(` aparecer em
`packages/core/{src,dist}/aurea.css` ou em `apps/docs/index.html`. É gate, não convenção.

## Consequências

**Boas:** a identidade não depende de moda; alto contraste e impressão não degradam; um valor a
menos para revisar em code review.

**Custos, declarados:** efeitos que dependem de gradiente (brilho, vidro, glow) estão fora do
vocabulário. Se um dia forem necessários, entram como decisão nova aqui — não como exceção
solta num componente.
