# ADR-0003 — A navegação do shell recolhe com o popover nativo, sem JavaScript

- **Data:** 30/07/2026
- **Estado:** aceita · geometria emendada pela [ADR-0035](0035-sidebar-responsivo-sem-inventar-recursos.md)
- **Fecha:** o achado **A8** (ALTO) da auditoria de 26/07/2026; tarefa **T8.1** da Fase 8
- **Autoria:** recomendação do Opus. Decisão técnica, dentro do que o Victor delegou; a
  aparência resultante (gaveta à esquerda, fundo escurecido) segue a linguagem já existente.

## Contexto

Medido em 30/07/2026, `apps/catalog/button.html` a 375×812:

| Medida | Antes |
|---|---|
| Onde o `h1` da página começa | **3.710px — 4,6 telas abaixo** |
| Itens de navegação antes dele | **65 de 65** |
| Altura total da página | 14.104px |
| `display` do `.app-shell` | `block` (o grid desmanchava e a lateral empilhava) |

O gate de rolagem lateral **passava**: nada estourava a largura. Usabilidade não se prova
medindo overflow — foi exatamente o que o achado A8 disse, e é a razão de existir o gate novo.

O padrão de gaveta já existia no repositório, mas como **CSS solto no core escrito para a
página de docs manual** (`.mobile-nav-toggle`, `.mobile-nav-backdrop`, `.mobile-open`), com o
JavaScript dela. Não era componente, não tinha ficha, e por isso o catálogo dogfooded não tinha
o que consumir.

## Alternativas

**A. Portar o padrão dos docs: classes + JS próprio no `aurea.js`.** Rejeitada. Reimplementa em
JavaScript o que a plataforma entrega pronto — foco, Escape, clique fora, estado anunciado — e
cada um desses é um bug em potencial. Também exigiria a mesma coisa duas vezes: uma no
`aurea.js` para a página estática e outra em React para o consumidor.

**B. Componente novo (`NavDrawer`) com ficha própria.** Rejeitada por ora. Mais superfície de
API para o mesmo resultado: quem tem `AppShell` quer que a navegação dele funcione no celular,
não quer montar uma gaveta. Se um dia existir gaveta fora do shell, ela nasce como componente e
o shell passa a consumi-la.

**C. Prop de opt-in (`navigation="collapsible"`).** Rejeitada. Uma opção que todo consumidor
teria de ligar não é opção, é pegadinha — e o default seria a versão quebrada no celular.

**D. `popover` nativo, sem JS, sempre ligado.** Escolhida.

## Decisão

> **Emenda de 20/08/2026:** a ADR-0035 substitui somente o corte e a largura abaixo. O mecanismo
> nativo, a não-modalidade e a ausência de API nova continuam vigentes.

O `AppShell` renderiza sempre:

- um **disparador** no topo (`IconButton` com `popovertarget`), escondido a partir de `lg`;
- a **lateral como popover nativo** (`<aside popover="auto" id="aurea-shell-nav">`).

Abaixo de `lg` (até 1023px) a lateral sai do fluxo e vira gaveta de até 296px — painel de 264px
mais as duas margens flutuantes — limitada também a `100vw − 2rem`. A partir de 1024px nada muda
na mecânica nem na API.

**O que o navegador entrega:** `Escape` fecha · clique fora fecha · `aria-expanded` no disparador
(na árvore de acessibilidade, não como atributo) · `::backdrop`. A entrada e a devolução do foco
são normalizadas pelo `AppShell` nos três motores desde a [ADR-0019](0019-tres-motores-pixel-em-um-e-o-foco-da-gaveta.md).

**Baseline Widely Available desde abril de 2025** nos quatro motores (pesquisado em 30/07/2026;
não estou transcrevendo versão por navegador porque as fontes divergiam num dígito e o número
errado num documento de decisão é pior que a ausência dele). O comportamento foi **medido** aqui,
no Chromium: `expanded=false` fechada e `expanded=true` aberta, na árvore de acessibilidade real.

**Não-modal de propósito.** O foco não fica preso. É a mesma decisão já registrada no
`CommandPaletteShell`: declarar modalidade sem entregá-la faz o leitor de tela esconder o resto
da página enquanto o teclado ainda alcança tudo, que é pior que não declarar nada.

## Como isso é obrigado

`tests/visual/shell-nav.spec.ts` — 5 casos: a lateral some e o `h1` cabe na primeira tela; o
disparador anuncia `expanded` (lido da árvore de acessibilidade **por CDP**, porque
`getByRole({expanded})` do Playwright consulta o atributo e não enxerga o estado implícito —
tentado, falhou, registrado); `Escape` fecha e devolve o foco; `Tab` entra na gaveta; a partir de
`lg` não há gaveta.

`catalog-sweep` — em 375px, o `h1` de **toda** página cabe na primeira tela.

Provado contra o defeito: removendo a linha que esconde a lateral fechada, a varredura reprova
as 170 páginas com "4.6 telas abaixo" e o teste da gaveta reprova junto.

## Consequências

**Boas:** todo consumidor de `AppShell` ganha navegação móvel sem fazer nada; zero JavaScript
novo no pacote; o comportamento acessível é o do navegador, não uma imitação nossa; e o preview
de shell em documento próprio (Fase 7) deu onde exercitar isso no catálogo.

**Custos, declarados:**
- O disparador existe no DOM em toda página, mesmo escondido. É um `<button>` de 0 pixel a partir
  de `lg`.
- `Chromium apenas`: o estado acessível foi verificado só nele, porque é o único navegador
  instalado. Firefox e Safari seguem não verificados — o mesmo limite declarado desde a Fase 5.
- O legado `@media (max-width:820px) { .app-shell { display:block } }` não morreu: passou a
  valer só para o shell **sem** gaveta, que é o `apps/docs/index.html`. Some com aquela página.

**Revisão:** se aparecer demanda por gaveta fora do shell, ou por travar o foco dentro dela,
esta ADR é revisada — a segunda exigiria trocar `popover` por `<dialog>` e escrever o
JavaScript que hoje não existe.
