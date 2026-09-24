# ADR-0047 — CSS-first para apresentação; resolução em runtime quando a semântica depende disso

> 🔴 **RENUMERADA de `ADR-0019` para `ADR-0047` em 14/09/2026.** O número `0019` estava
> **DUPLICADO** — duas ADRs diferentes o carregavam, e a mais antiga fica com ele. O link sempre
> resolveu (o nome do arquivo é único); a MENÇÃO em prosa, não: *"ver a ADR-0019"* não dizia qual
> das duas, e este repositório cita ADR por número em dezenas de lugares. **A decisão, a data e o
> conteúdo não mudaram** — só o identificador.


- **Data:** 22/08/2026
- **Estado:** aceita
- **Autoria:** decisão do Victor ao autorizar o `G-AXIS-06`, em resposta à medição que mostrava o
  eixo de orientação parando em 3 de 8
- **Obriga:** o check 12c do `validate.py` (`responsive: {prop: visual|behavioral}`) ·
  `tests/visual/comportamental.multi-motor.spec.ts` (7 casos × 3 motores) ·
  `tests/unit/ssr-responsivo.test.tsx` · `tests/unit/custo-responsivo.test.tsx`

## A regra

> **CSS-first vale para propriedades puramente apresentacionais.**
>
> **Quando uma prop responsiva altera semântica, teclado, ARIA ou comportamento do motor,
> JavaScript é permitido e necessário** para manter comportamento e apresentação sincronizados.
>
> O valor responsivo **resolvido** é a única fonte de verdade: ele vai para o motor, o motor
> publica os atributos e ajusta o teclado, e a pele reage ao que o motor publicou.

E a consequência que o Victor escreveu em uma linha: *"não quero dogma de CSS-only produzindo uma
interface visualmente vertical que continua semanticamente horizontal"*.

## O que a produziu

O `G-AXIS-04` estabeleceu o eixo responsivo como CSS puro — sem `matchMedia`, sem observer, sem
estado dependente de hidratação. Para `size` isso continua certo: mudar um degrau de escala não
muda o que o componente **faz**.

Ao levar o eixo para `orientation`, cinco dos oito componentes não couberam. Medido no banco de
prova, no `Tabs` horizontal:

```text
ArrowRight  Um → Dois   MOVEU        ArrowDown  Um → Um   parado
ArrowLeft   Um → Três   MOVEU        ArrowUp    Um → Um   parado
```

O motor **honra** o `aria-orientation`. Uma lista de abas que o CSS desenhasse em coluna
continuaria anunciando `horizontal`, e Baixo/Cima continuariam mortos. CSS não escreve atributo.

Eu havia registrado isso como limite e parado em 3 de 8. **O Victor recusou o teto:** *"não quero
deixar `orientation` em 3/8 somente para preservar CSS-first. CSS-first é uma estratégia de
engenharia, não uma religião."*

## Alternativas, e por que foram rejeitadas

**Aceitar a divergência e documentar.** A API mentiria para quem navega por teclado. Contra o
`QUALITY.md` e contra a [ADR-0044](0044-semantica-tem-precedencia-sobre-coincidencia-de-token.md),
que já decidiu que API não degrada em silêncio.

**CSS decide, JavaScript corrige o atributo depois.** Duas fontes de verdade e uma janela — entre
o CSS aplicar e o efeito rodar — em que visual e comportamento divergem. Rejeitada pelo Victor
explicitamente, e com razão: o defeito que a infraestrutura existe para impedir voltaria em
miniatura, a cada travessia.

**`ResizeObserver` artesanal dentro de cada componente.** Cinco implementações do mesmo problema,
que é o *"47 adaptações manuais independentes"* proibido desde o `G-AXIS-04`.

**`ResizeObserver` para tudo, viewport inclusive.** Caro e errado: a janela já expõe `matchMedia`,
que é o mensurável certo e não exige medir elemento nenhum.

## Como é obrigada

**Um resolvedor só, genérico.** `useValorResponsivo<T>(valor, padrao, ancora?)` em
`packages/react/src/responsivo-runtime.tsx`. Ele não sabe o que é orientação — o eixo chegou por
ela, mas qualquer eixo comportamental futuro usa o mesmo. Foi o que o Victor pediu ao recusar um
`useResponsiveOrientation`.

**O mecanismo muda com a natureza do valor:**

```text
valor simples   →  nada. Nenhum listener, nenhum observer, nenhum estado.
viewport        →  matchMedia          (é o que a janela expõe)
container       →  ResizeObserver      (não há outra forma de medir um elemento)
```

**Uma escala só.** `packages/react/src/escala.tsx` é **gerado** pela mesma leitura dos tokens que
produz as `@media`/`@container` do core. Não há `if (width >= 768)` em lugar nenhum: o número
existe uma vez.

**O contêiner é o mesmo mensurável, sem heurística.** Quem define o contêiner no CSS é
`.container-scope`, e `@container aurea` casa com o ancestral mais próximo que o declare. A regra
do JavaScript é a **mesma regra** — `closest(".container-scope")` —, não uma parecida. Por cima
disso, a primitive `<ContainerScope>` publica o elemento por contexto para o caso explícito; há
teste cobrando que os dois caminhos apontam para o mesmo elemento.

**O gate que impede a discussão de voltar.** A ficha declara
`responsive: {prop: "visual" | "behavioral"}`, e o check 12c **deriva a natureza do código** em vez
de consultar lista: se o componente entrega o valor a um motor, ou se a ARIA medida
(`AUREA-ARIA.json`) inclui `aria-{prop}`, o eixo é comportamental e a ficha não pode dizer
`visual`. O inverso também reprova — `visual` que resolve em runtime paga um observer que o CSS
resolveria de graça.

## Consequências, inclusive os custos

**O que se recuperou:** `orientation` fecha em **8 de 8**. Os cinco que estavam excluídos —
`Tabs`, `Toolbar`, `Menubar`, `ToggleGroup`, `Separator` — voltaram com visual, `aria-orientation`,
`data-orientation`, teclado e geometria dizendo a mesma coisa, provado nos três motores.

**O custo, medido e não temido** (`audit/activity-2/20-G-AXIS-06-CUSTO.md`):

```text
bundle do resolvedor    13.314 B cru · 5.126 B gzip · 4.621 B brotli
observers               UM para a aplicação inteira, independente do número de componentes
observações             uma por CONTÊINER — o mínimo possível
ouvintes de matchMedia  SETE no total (um por ponto), não sete por componente
valor simples           zero: nem matchMedia, nem observer, nem estado
```

Os dois compartilhamentos não são especulativos: a versão ingênua registrava **sete ouvintes por
componente**, e o teste de escala existe justamente para o custo não voltar a ser linear em
silêncio.

**O que se perdeu:** os cinco deixaram de ser resolvidos por CSS puro. Num ambiente sem
JavaScript, eles ficam no valor **base** — que é o mesmo que o servidor renderiza, e portanto
coerente: a interface aparece certa, só não adapta. `jsdom` sem `matchMedia`/`ResizeObserver` cai
no mesmo lugar em vez de quebrar.

**O que NÃO mudou:** `size` continua CSS puro em 18 de 18, e a API pública continua a mesma
`Responsive<T>` com os três formatos. O que muda é o mecanismo interno, conforme a natureza da
prop — e agora isso está declarado na ficha e gateado.

## Quando revisar

Quando aparecer um eixo comportamental que o resolvedor não sirva sem mudança — aí a pergunta é se
a abstração está errada ou se o eixo é mesmo especial, e a resposta vem por medição. E se algum
dia o CSS ganhar como escrever atributo (ou o ARIA ganhar como seguir uma container query), a
metade `behavioral` deixa de precisar de runtime e esta ADR volta à mesa.
