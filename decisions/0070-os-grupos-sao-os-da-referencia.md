# ADR-0070 — Os grupos da página "All Components" são os da referência

- **Data:** 14/10/2026
- **Estado:** aceita · feita na branch `claude/lote-r`, para o próximo lote.
- **Origem:** a pergunta 5 da bancada (14/10/2026). O Victor aprovou a proposta (*"pode"*) e, depois de ver a página
  nova rodando e a lista de onde foi cada componente, *"bancada do lote parte do site da aurea aprovado"*.
- **Troca:** a lista de categorias da Fase 1 ([`docs/DIRECTION.md`](../docs/DIRECTION.md) §4), que já não era a do
  gate desde o crescimento do catálogo.

## Contexto

Medido no site da referência (14/10/2026): o menu da lateral dela é UMA lista só, em ordem alfabética, sem grupos —
igual ao da Aurea. Os grupos aparecem só na página "All Components": 15, em ordem alfabética — Buttons, Collections,
Colors, Controls, Data Display, Date and Time, Feedback, Forms, Layout, Media, Navigation, Overlays, Pickers,
Typography, Utilities.

A Aurea tinha 14 grupos próprios, numa ordem própria. Pela regra de 11/10/2026 (a peça e o site seguem a referência,
com a cara da Aurea — [ADR-0067](0067-o-site-segue-a-documentacao-da-referencia.md)), a pergunta era se os grupos
também seguem.

## Decisão

1. **O menu da lateral fica como está**: uma lista alfabética, como o da referência.
2. **A página "All Components" passa aos 15 grupos da referência**, em ordem alfabética, e **no fim os 3 só nossos**:
   AI & Agents, Code, Communication — assuntos que a referência não tem.
3. **Onde vai cada componente:**
   - o que a referência também tem vai para **o mesmo grupo dela**;
   - o que ela não tem vai para **o grupo da peça mais parecida dela**, com o porquê escrito (a tabela mostrada ao
     Victor na bancada, "Pergunta 5");
   - o que é de assunto que ela não tem vai para um dos 3 grupos nossos.
4. A lista mora em dois lugares, que andam juntos: o `CATEGORY` do `scripts/validate.py` (a trava das fichas) e o
   `CAT_ORDER` do `scripts/build-catalog.mjs` (a ordem do site).

## Consequências

- 71 fichas mudaram de grupo. O `category` de cada ficha continua sendo o único lugar de onde o grupo sai.
- Os testes que escolhiam peças pelo grupo antigo passam a olhar os grupos de campo da lista nova (`invalido.spec.ts`:
  Forms, Pickers, Colors, Date and Time, Controls).
- Grupo novo só entra por decisão nova aqui.

## Quem cobra

O `validate.py` reprova ficha com grupo fora da lista.
