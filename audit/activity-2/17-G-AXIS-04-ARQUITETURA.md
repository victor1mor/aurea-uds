# G-AXIS-04 — o eixo responsivo como infraestrutura

**Decisão do Victor, 22/08/2026.** A Aurea terá os **dois** mecanismos, não um escolhido
globalmente. Este documento é a arquitetura provada, antes da expansão em massa.

---

## 1. A regra, na palavra dele

> *viewport responsive* → quando a decisão depende do tamanho da **aplicação/janela**;
> *container responsive* → quando o componente precisa responder ao **espaço em que foi colocado**.
>
> Para componentes reutilizáveis, prefira container query sempre que o comportamento for
> intrínseco ao componente. Para layout de aplicação e decisões realmente globais, viewport
> continua válido.

E a condição que decidiu o desenho da API:

> Não quero que `md`, `lg` etc. tenham semântica ambígua dependendo do contexto. A API pública deve
> deixar explícito se aquele valor está reagindo a viewport ou container.

## 2. Uma escala, dois mensuráveis

`md` é **sempre** 768px. O que muda é de que esses pixels são — e quem diz isso é o **prefixo**,
não o contexto:

| | viewport | container |
|---|---|---|
| classe | `vp-md:size-lg` | `ct-md:size-lg` |
| consulta | `@media (min-width:768px)` | `@container aurea (min-width:768px)` |

A escala ganhou **`2xs` (360px)** e **`xs` (480px)**, e não por simetria: contêineres são
rotineiramente mais estreitos que qualquer viewport — uma lateral tem 300px, uma coluna de cartão
tem 400px —, e sem eles o piso da escala (640) poria todo contêiner no mesmo balde.

O check 4b do `validate.py` passou a cobrar `@container` **além** de `@media`. Ele só olhava
`@media`, então um ponto de container fora da escala escaparia — e é justamente a escala única que
impede `md` de significar duas coisas. Provado: trocar um `768px` por `777px` reprova.

## 3. Como funciona, e por que não há uma linha de JavaScript

Um **passo de escala** é um conjunto de variáveis — `--step-h`, `--step-px`, `--step-gap`,
`--step-fs`. O componente **lê** as variáveis; a camada responsiva apenas as **re-põe** dentro de
`@media` ou `@container`.

```css
.btn      { block-size: var(--step-h, var(--control-h-md)); … }
.size-sm  { --step-h: var(--control-h-sm); … }
@media (min-width:768px)            { .vp-md\:size-lg { --step-h: var(--control-h-lg); … } }
@container aurea (min-width:768px)  { .ct-md\:size-lg { --step-h: var(--control-h-lg); … } }
```

Consequências que eram requisito:

- **CSS-first.** Nada observa largura. Sem `matchMedia`, sem `ResizeObserver`, sem listener.
- **SSR/RSC-safe.** A abstração mora em `pure.tsx`, o módulo **sem** `"use client"`: resolver um
  valor responsivo é computação de string, então serve componente de servidor sem virar
  referência de cliente. O HTML que o servidor manda já está certo, e continua certo se o
  JavaScript nunca chegar.
- **A explosão combinatória fica na infraestrutura.** Passos × pontos existe **uma vez**, no core,
  para todo o sistema — não uma vez por componente.

### O detalhe que fazia tudo falhar

As classes de tamanho **precisaram passar a setar variáveis**. Uma regra dentro de `@media` que
setasse `--step-h` **perderia** para um `height:` direto de `.btn-sm` — declaração direta não é
sobrescrita por variável que o autor já não leu. Sem isso, não há camada responsiva possível sem
duplicar tudo em cada componente.

A classe emitida é a mesma (`btn-sm`) e o computado é o mesmo. **Medido**, e por dois caminhos:
a suíte de geometria (10/10) e a suíte de pixel — cujas 8 falhas foram confirmadas **idênticas**
com e sem o refactor, isolando-as como as baselines já defasadas.

## 4. A API

```tsx
<Button size="sm" />                                          {/* simples */}
<Button size={{base: "xs", viewport:  {md: "lg"}}} />          {/* reage à JANELA */}
<Button size={{base: "xs", container: {sm: "md", md: "lg"}}} />{/* reage ao CONTÊINER */}
```

Tipada, e os dois ramos são **mutuamente exclusivos** (`never` no ramo oposto). Isso é decisão:
um valor que reagisse aos dois teria precedência ambígua e a API deixaria de dizer a que ele
responde. Quem precisa dos dois tem uma pergunta de desenho para responder, não um default para
herdar.

**Aditivo por construção:** valor simples continua emitindo `btn-sm`, byte por byte a classe de
antes. Só o responsivo entra pela camada genérica. Nenhum consumidor muda, nenhuma baseline se
mexe.

## 5. A prova

`tests/visual/responsivo.multi-motor.spec.ts` — **4 casos × 3 motores**, todos verdes. O primeiro
é exatamente o que o Victor pediu:

> o **mesmo** componente, com o **mesmo** valor, na **mesma** viewport, em contêineres de larguras
> diferentes, medindo diferente.

Contêineres de 260 / 520 / 820px, um botão idêntico em cada. Se os três medissem igual, o que
existiria seria uma media query com outro nome — é esta medição, e não a leitura do CSS, que
separa os dois mecanismos. Os outros três casos fecham o cerco: encolher a **janela** não muda as
alturas dos contêineres fixos; o valor por viewport reage à janela; e as classes emitidas têm a
forma que o core pinta.

Provado contra **dois** defeitos distintos: sem a camada `@container`, reprova; com o contêiner
declarado **sem nome**, reprova também.

`tests/unit/responsivo.test.tsx` — 6 casos sobre a parte que é computação, incluindo a promessa
que sustenta tudo (*valor simples não muda nada*) e a varredura que cobra que **toda** classe
emitível tem regra no core. Essa última é o `log-warn` do `G-CSS-01` outra vez: classe sem regra
não quebra, ela **some** — e aqui sumiria só num ponto da escala, então a página pareceria certa
até alguém redimensionar.

## 6. A varredura, e a segunda família

`node scripts/sweep-responsivo.mjs` — re-executável, e a fonte é a **nossa** superfície
(`api-surface.json`), não a lista da Radix: *"a Radix é evidência da necessidade, não teto"*.

| | |
|---|---:|
| props de união literal | 55 |
| **elegíveis** | **27** |
| semântica — o significado não muda porque a caixa encolheu | 16 |
| eixo global da aplicação (`theme`, `density`, `direction`) | 5 |
| posição de sobreposição — o motor já vira sozinho | 6 |
| estrutura de documento (`titleAs`) | 1 |
| **não triadas** | **0** |

O critério mora no script, não numa decisão de ocasião: elegível é **escolha de apresentação que
uma quantidade diferente de espaço poderia razoavelmente mudar**. Prop nova que apareça e não
esteja na tabela sai como `NAO_TRIADA` — nunca some em silêncio.

### A família de campo, numa refatoração só

`Input`, `Select`, `Textarea`, `SearchField`, `PasswordField` e `Combobox`. `size` foi de **3/18**
para **9/18**.

E aplicar à *segunda* família é o que revelou dois defeitos que a primeira escondia — os dois
achados medindo contra o estado anterior, não lendo:

1. **`--step-px` não era universal.** Ele carregava o padding do **botão** (15px no md) e o campo
   usa 13px. Altura e corpo de texto são compartilhados entre famílias; padding **não é**. Cada
   família com medida própria ganhou variável própria — `--step-field-px`, `--step-select-pe` —,
   num lugar só.
2. **O padding do `textarea` regrediu de 12/14/16 para 14/14/14.** A base dele vem **depois** da
   regra compartilhada e a sobrescrevia. E o md dele é **14px**, não 13px como `input`/`select`:
   presumir que a família era uniforme foi o que produziu a regressão.

### A camada passou a ser GERADA

`scripts/build-responsive-layer.mjs`, de uma tabela única. A razão é aritmética: a camada é
passos × pontos × famílias — 5 × 12 já dava 65 corpos de regra com **uma** família, e acrescentar
a de campo levaria cada corpo a carregar mais duas variáveis, em 65 lugares. À mão, a próxima
família simplesmente não seria acrescentada — que é exatamente o *"não quero 47 adaptações manuais
independentes"*.

Os pontos saem da escala de `--breakpoint-*`, lida dos tokens: é o que garante que a escala
continue sendo **uma só** mesmo quando a tabela crescer.

## 7. O que falta, e por quê

A **prova arquitetural** está feita, e aplicada a duas famílias. O que vem depois, na ordem que o Victor definiu:

1. ~~A varredura das props elegíveis.~~ **FEITA** — §6 acima.
2. **As 9 ocorrências de `size` que faltam:** `Avatar`, `AvatarGroup`, `Checkbox`, `Icon`,
   `QRCode`, `Radio`, `Spinner`, `Switch`, `Toggle`. São outras três famílias (identidade,
   glifo, controle de marcação), e cada uma precisa da mesma pergunta que o campo respondeu:
   **quais medidas ela tem próprias?** Presumir que são as do botão foi o defeito nº 1.
3. **Os outros eixos.** A camada já é genérica — o eixo é parâmetro, e há teste cobrando isso —,
   mas só `size` tem regras no core. `orientation` é o candidato óbvio depois do `G-AXIS-03`.
4. **Exemplos no catálogo.** O banco de prova vive em `apps/keyboard-probe`, que não é vitrine.
