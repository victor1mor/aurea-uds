# Migração do HTML monolítico para Aurea

> **DOCUMENTO HISTÓRICO — o processo abaixo já foi executado (Fase 0, 07/2026).**
> Ele descreve como o kit monolítico virou os pacotes que existem hoje; não é roteiro para
> nada em curso. Quem chega agora começa por [`STATE.md`](../../STATE.md) e pela ordem de leitura do
> `CLAUDE.md`. Fica no repositório como registro de origem — o achado **B6** da auditoria de
> 26/07/2026 era exatamente isto não estar escrito no próprio arquivo.

1. Congele `legacy-reference.html` como evidência visual.
2. Use `packages/tokens` como fonte dos valores.
3. Importe `packages/core/dist/aurea.css` para manter as classes atuais.
4. Em projetos React, migre gradualmente para `@aurea-uds/react` sem alterar o HTML visual.
5. Use `packages/contracts/aurea.contract.json` para validar novas famílias.
6. Não adicione componente novo antes de registrar tokens, estados, acessibilidade e API no contrato.
