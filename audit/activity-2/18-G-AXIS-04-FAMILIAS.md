# G-AXIS-04 · as três famílias restantes — a medição que precedeu a expansão

**22/08/2026** · fecha `size` em **18 de 18** componentes elegíveis.

O Victor foi explícito na ordem de trabalho: *"para cada família, medir as propriedades próprias
antes de generalizar"*. Este documento é essa medição. Ela **derrubou** a premissa com que a
expansão teria começado, e é por isso que existe: sem ela, 323 páginas do catálogo teriam mudado.

---

## 1. A premissa que a medição derrubou

A camada responsiva nasceu com a família de **botão**, ganhou a de **campo** e, ao ganhá-la,
já tinha aprendido uma vez que a escala não é universal (`--step-px` carregava 15px do botão e o
campo usa 13px). A premissa restante — corrigida agora — era que **a grandeza** por trás de todo
degrau é a mesma: `--control-h-*`.

**É falsa.** Há **três escalas**, e elas nem sequer reagem à densidade do mesmo jeito.

| escala | fonte | varia com densidade? | degraus | quem usa |
|---|---|---|---|---|
| **controle** | `--control-h-*` | **sim** (compact/comfortable/spacious) | xs sm md lg xl | botão, campo, marcação, identidade |
| **glifo** | `--icon-*` | **não** | sm md lg xl | `Icon`, `Spinner` |
| **QR** | rem cru (7.5 / 10 / 15) | **não** | sm md lg | `QRCode`, sozinho |

Valores, lidos de `packages/tokens/dist/aurea.tokens.css`:

```text
--control-h-  xs 1.625  sm 1.875  md 2.25  lg 2.625  xl 3.125 rem   (comfortable)
              xs 1.5    sm 1.75   md 2     lg 2.375  xl 2.75  rem   (compact)
              xs 1.75   sm 2.125  md 2.5   lg 3      xl 3.5   rem   (spacious)
--icon-               sm 1      md 1.25   lg 1.5    xl 2     rem   (uma só, sem densidade)
```

---

## 2. O que cada família tem de PRÓPRIO

### Marcação — `Checkbox`, `Radio`, `Switch`

Sai da **mesma grandeza do botão**, transformada por uma **razão que é de cada componente**:

```text
.control-mark   h/2 × h/2          quadrado    18×18 no md comfortable
.switch-track   h·7/6 × h·2/3      retângulo   42×24 no md comfortable
```

E — medido, não presumido — **não tem mais nenhuma propriedade por degrau**:

```text
gap        9px (checkbox/radio) e 10px (switch)   FIXO, não muda de degrau
font-size  não existe regra por degrau
padding    não existe
```

Ou seja: das seis variáveis que a camada já emitia, esta família usa **uma**. `--step-fs`,
`--step-gap`, `--step-px`, `--step-field-px` e `--step-select-pe` são todas irrelevantes aqui, e
tê-las aplicado "porque a família de campo usa" teria sido desenho por analogia.

**Conclusão:** não ganha variável nova. Lê `--step-h`; a razão fica no componente, onde já estava.

### Identidade — `Avatar`, `AvatarGroup`

Mesma grandeza, razão **1:1**. O próprio core já dizia por que, e a razão é boa: *"um avatar ao
lado de um botão na mesma linha tem de ter a mesma altura"*.

Uma propriedade própria, e ela é **assimétrica**:

```text
.avatar-sm   font-size: var(--text-xs)     ← existe
.avatar-lg   (nenhuma)                     ← não existe
```

O `lg` fica com as iniciais do tamanho do `md` numa caixa 17% maior. Parece omissão, não decisão.
A camada **reproduz a assimetria** (`--step-avatar-fs` só tem valor no degrau `sm`) em vez de
inventar a simetria: corrigir é mudança visual, e mudança visual pede o A/B do §96. Registrado
como **`G-AXIS-05`**.

### Glifo — `Icon`, `Spinner`

Escala **própria**, e o `Spinner` tem uma pegadinha a mais:

```text
.icon      base md    --icon-md      classes: icon-sm, icon-lg, icon-xl
.spinner   base SM    --icon-sm      classes: spinner-md, spinner-lg
```

O degrau **base do Spinner é `sm`**. Presumir `md` como base de toda família é o erro que esta
atividade já cometeu duas vezes; aqui ele virou **parâmetro** de `peleDoEixo(base, valor, padrao)` (renomeado em 22/08, quando `orientation` entrou pela mesma camada).

### `QRCode` — família de um

Não compartilha escala com ninguém: `7.5rem / 10rem / 15rem`, sem relação com controle nem com
glifo, e sem reagir à densidade. Já tinha a variável certa (`--qr-size`); ganhou só o passo.

---

## 3. A medição que mudou o desenho: 323 páginas

Variável CSS **herda**. Antes de fazer qualquer família ler `--step-*`, a pergunta obrigatória é a
do `CLAUDE.md`: *"quem mais tem esse problema?"* — quantas vezes uma peça de família aparece
**dentro** de um elemento que define o passo.

Medido nas 327 páginas construídas do catálogo, com `jsdom` (`.prova/aninhamento.mjs`):

```text
 323  glifo: icon dentro de .btn        ex: accordion.html
   4  glifo: spinner dentro de .btn     ex: button.html
   0  marcação dentro de qualquer um
   0  identidade dentro de qualquer um
```

**O glifo está dentro do botão em 323 das 327 páginas.** Se `.icon` lesse `--step-h`, ou se
`--step-icon` fosse emitido junto do passo do botão e herdasse, todo ícone dentro de um botão
responsivo mudaria de tamanho sozinho — sem ninguém ter pedido, em quase toda página.

Marcação e identidade dão **zero** hoje, mas zero hoje não é zero amanhã: um `Avatar` dentro de um
`Button` é markup plausível, e a falha seria silenciosa.

---

## 4. A solução: cortar a herança na FOLHA, não em cada componente

```css
@property --step-h { syntax:"*"; inherits:false; }
```

Registrar **toda** variável de passo como não-herdável resolve a classe inteira do problema num
lugar só, em vez de exigir vigilância a cada família nova.

`syntax:"*"` **não é detalhe**: uma propriedade registrada com sintaxe tipada exige
`initial-value`, e com `initial-value` a propriedade **sempre tem valor** — o fallback de
`var(--step-h, var(--control-h-md))` nunca dispararia, e o core inteiro perderia os padrões. Com
`"*"` e sem `initial-value` ela nasce *guaranteed-invalid*, o fallback funciona, e a herança some.

**Provado nos três motores** antes de escrever qualquer regra (`.prova/t.mjs`):

```text
chromium  herdou? 7px | fallback puro: 7px | no próprio elemento: 42px  ✔
firefox   herdou? 7px | fallback puro: 7px | no próprio elemento: 42px  ✔
webkit    herdou? 7px | fallback puro: 7px | no próprio elemento: 42px  ✔
```

**Limitação declarada:** navegador sem `@property` ignora a at-rule, as variáveis voltam a herdar
e o vazamento volta com elas. Baseline: Chrome 85, Firefox 128, Safari 16.4.

---

## 5. Prova de que nada mudou de desenho

Método do `CLAUDE.md` — medir contra o estado **anterior**, não contra a expectativa.

**Geometria** (`git stash` → build → medir → pop → build → medir), 28 casos no navegador, com o
CSS real do catálogo:

```text
diff ANTES.txt DEPOIS.txt  →  IDÊNTICO
```

Inclui os dois casos que importam: `icon em btn-lg` = 20.00px nos dois lados, `spinner em btn-lg`
= 16.00px nos dois lados.

**Marcação emitida:** as 323 páginas do catálogo reconstruídas e comparadas byte a byte com as
anteriores — **0 páginas diferentes**.

> **Armadilha de instrumento, registrada:** a primeira versão do medidor devolveu `spinner` =
> 4×22px e `switch-track` = 2×20px, e os três degraus do spinner idênticos. Número implausível =
> instrumento quebrado: `<span>` é **inline**, e `width`/`height` não se aplicam a inline. Ambos
> só existem como filhos de flex na vida real (dentro de `.btn` e de `.switch`). Com a caixa de
> prova em `display:flex`, spinner deu 16/20/24 e o trilho deu 42×24 — que é exatamente o que o
> comentário do core diz ter sido o valor de antes. Corroboração independente.

---

## 6. A prova negativa do gate

`tests/visual/responsivo.multi-motor.spec.ts` ganhou o caso do ícone dentro do botão responsivo.
Com o bloco `@property` **removido** e o `dist` reconstruído, os três motores reprovam:

```text
✘ chromium  ✘ firefox  ✘ webkit
Error: o ícone dentro do botão mudou de tamanho (20, 16, 24)
```

20 / 16 / 24 é exatamente a previsão aritmética: contêiner de 260px não alcança nenhum ponto
(fica no `md` de fallback), o de 520px alcança `xs` (→ `--icon-sm`), o de 820px alcança `md`
(→ `--icon-lg`).

> **Armadilha registrada:** a primeira execução da prova negativa **passou**. Eu havia removido o
> bloco de `packages/core/src/aurea.css`, mas o app de prova empacota `packages/core/dist/aurea.css`
> — o mesmo defeito de artefato velho que já tinha custado uma investigação com o `catalog.css`.
> O hash do CSS empacotado não tinha mudado, e isso era visível na saída do build.

---

## 7. O que ficou

| item | onde |
|---|---|
| `size` responsivo | **18 de 18** componentes elegíveis |
| variáveis de passo | 9, todas registradas como não-herdáveis |
| escalas | 3, cada uma com variável própria |
| `peleDoEixo` | subiu para `pure.tsx` — uma regra, não uma por módulo |
| testes | +5 unitários, +2 no navegador × 3 motores |
| aberto | `orientation` (0 de 8) · `align` (0 de 1) · `G-AXIS-05` |
