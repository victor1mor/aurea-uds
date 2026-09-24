# ADR-0025 — Editor por blocos: a Aurea entrega a MOLDURA, não o motor de texto rico

- **Data:** 15/08/2026
- **Estado:** aceita
- **Fecha:** o item **N1** do [`PLANO-1.0.md`](../docs/PLANO-1.0.md) §18
- **Autoria:** pesquisa e medição do Opus, sob a autorização da Parte N

## Contexto

O item N1 é o único da Parte N, e o enunciado dele **manda decidir antes de escrever**: *"editor é
motor pesado; ou se embrulha um de terceiro (decisão do Victor) ou se entrega só a pele dos blocos
e o motor fica com o consumidor."*

A origem é medida: um portal editorial monta artigo com blocos — texto, imagem com legenda — e hoje
faz isso com campo de texto simples e um componente próprio por bloco.

Esta ADR existe porque a Aurea **já embrulhou motor de terceiro três vezes** e sempre registrou o
porquê: Recharts no `Chart` (Lote 3), react-day-picker no `Calendar` (Lote 4), CodeMirror no
`CodeEditor`. Um "não" aqui, sem registro, pareceria incoerência — ou pior, esquecimento — para
quem chegasse depois e visse os três subpaths de motor opcional já existindo.

## O que a medição devolveu (15/08/2026)

### 1. A referência indicada não é o mesmo componente

O `editor` de `Referencia/kibo-main/packages/editor` tem **39 exports** e **17 dependências**
(TipTap 3.6.6, `@tiptap/pm`, lowlight, tippy.js, fuse.js, floating-ui). Medido export a export:
**18 dos 39 são de tabela**, e o resto é formatação inline e tipo de nó. É um editor de **documento
único** sobre ProseMirror.

**Lista de blocos, reordenação e bloco de imagem com legenda não existem ali.** A primeira pergunta
do [`BUILDING.md`](../docs/BUILDING.md) §2 passo 2 — *"é o mesmo componente?"* — responde **não**, e a
anatomia que o N1 pede não estava na referência que o próprio item indicou.

### 2. O que faltava já estava quase todo em casa

Medido no passo 1: `Prose` (L5) desenha a saída, `Image` (L4) é o bloco de imagem, `Textarea` e
`Field` são a entrada, `Toolbar` é a barra, `SortableList` (L3) tem o protocolo de arrasto
acessível. O buraco era **um**: a moldura.

### 3. O mercado, pesquisado e não lembrado

**TipTap 3** é MIT no editor e pago na nuvem; continua ProseMirror por baixo · **BlockNote** é
**MPL-2.0**, copyleft por arquivo, e a Aurea é Apache-2.0 · **Editor.js** é o modelo de blocos
independentes · **Lexical** e **ProseMirror** são as bases que o mercado aponta como de vida longa.

Na plataforma: **`contenteditable="plaintext-only"` virou Baseline Newly available**, e a
**EditContext API não é Baseline** — só Chromium. O caminho nativo cobre texto simples; não cobre
texto rico.

### 4. Segurança — e é esta que fecha a porta

O navegador **não sanitiza HTML colado**. Quem é dono da superfície de edição é dono do XSS de
colagem, e a pesquisa confirma que ProseMirror e Lexical tratam o `contenteditable` como **alvo de
renderização e nunca como fonte da verdade** exatamente por isso.

A Aurea **não pode decidir o que é seguro renderizar** dentro do domínio do consumidor. É a mesma
frase que a ficha do `Prose` já diz em voz alta desde o L5, e vale mais forte aqui: lá a Aurea
recebe HTML já pronto; aqui ela estaria **produzindo** o HTML a partir do que alguém colou.

## Decisão

**A Aurea entrega a moldura dos blocos. O motor de texto rico fica com o consumidor.**

O `BlockEditor` é dono de: ordem (arrasto e teclado), alça, remoção, estado `pego`, o nome
acessível do bloco (`kind` + posição), e a fenda onde o editor do consumidor entra.

O `BlockEditor` **não** é dono de: negrito, itálico, menu-bolha, barra de formatação, tabelas,
colagem e sanitização.

**Nenhuma dependência nova entrou** — `dependencies.engine` da ficha é `none`.

### Por que não é incoerente com o Chart, o Calendar e o CodeEditor

Nos três, **o motor É o componente**: sem Recharts não há gráfico, sem CodeMirror não há editor de
código. Por isso cada um mora em subpath próprio, com peer opcional, e quem não usa não paga.

Aqui o motor **não é** o componente. O que o item pede — "texto, imagem com legenda" — é moldura, e
moldura não justifica ProseMirror no pacote de quem só quer montar um artigo. A fronteira é a
mesma dos três; o lado dela em que este caso cai é que muda.

## Consequências

- **Quem quiser negrito e itálico traz o seu motor** e o põe dentro do bloco. A moldura não
  atrapalha: o corpo do bloco aceita conteúdo de fluxo.
- **A superfície de colagem, e o XSS que vem com ela, continua com quem tem contexto** para
  sanitizar. A ficha diz isso em voz alta.
- **Não há `onInsert`**, e é decisão e não esquecimento: acrescentar bloco é apendar na coleção de
  quem controla, e a reordenação leva o novo bloco a qualquer posição.
- **Se um consumidor real pedir texto rico embrulhado**, esta ADR não impede — ela exige que o
  pedido venha com uso medido, e que a decisão de dependência passe pelo Victor
  ([`BUILDING.md`](../docs/BUILDING.md) §3.3). O caminho está aberto e tem precedente: seria subpath
  próprio com peer opcional, como os outros três.

## O que esta decisão pagou por fora

O protocolo de arrasto acessível saiu da `SortableList` para o **`useReorder`** do `internal.tsx`,
porque o `BlockEditor` virou o **segundo** dono dele — e duas cópias garantiriam que a próxima
correção entrasse em uma só. É a regra do [`CLAUDE.md`](../CLAUDE.md): *correção local é proibida
sem responder "quem mais tem esse problema?"*.

A DOM da `SortableList` não mudou uma vírgula na extração. Quem prova isso são o gate de pixel e o
`skin.spec` — que medem a saída, não a origem.
