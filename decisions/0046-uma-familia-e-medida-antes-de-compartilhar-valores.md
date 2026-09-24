# ADR-0046 — Uma família é medida antes de compartilhar valores, e passo não herda

> 🔴 **RENUMERADA de `ADR-0018` para `ADR-0046` em 14/09/2026.** O número `0018` estava
> **DUPLICADO** — duas ADRs diferentes o carregavam, e a mais antiga fica com ele. O link sempre
> resolveu (o nome do arquivo é único); a MENÇÃO em prosa, não: *"ver a ADR-0018"* não dizia qual
> das duas, e este repositório cita ADR por número em dezenas de lugares. **A decisão, a data e o
> conteúdo não mudaram** — só o identificador.


- **Data:** 22/08/2026
- **Estado:** aceita
- **Autoria:** consequência das três famílias do `G-AXIS-04`, sob a ordem do Victor —
  *"para cada família, medir as propriedades próprias antes de generalizar"*
- **Obriga:** `tests/unit/responsivo.test.tsx` (5 casos) ·
  `tests/visual/responsivo.multi-motor.spec.ts` (2 casos × 3 motores) · o check 4b e o 15 do
  `validate.py`

## As duas regras

> **1.** Uma família de componentes só compartilha uma variável de passo depois de **medida**. O
> que ela tem próprio se descobre lendo o CSS dela, não deduzindo da família vizinha.
>
> **2.** Toda variável de passo é **registrada como não-herdável**. Custom property herda, e um
> passo posto num componente desce para os filhos dele.

## O que as produziu

A camada responsiva nasceu com a família de **botão**. Ao ganhar a de **campo**, já tinha
aprendido uma vez que a escala não é universal: `--step-px` carregava os 15px do botão e o campo
usa 13px. A correção foi local — variável própria para o campo — e a premissa de fundo ficou de
pé: *a grandeza por trás de todo degrau é `--control-h-*`*.

Ao medir as três famílias restantes, a premissa caiu.

### São três escalas, e elas nem reagem à densidade do mesmo jeito

| escala | fonte | densidade | quem |
|---|---|---|---|
| controle | `--control-h-*` | **varia** (compact/comfortable/spacious) | botão, campo, marcação, identidade |
| glifo | `--icon-*` | não varia | `Icon`, `Spinner` |
| QR | rem cru (7.5 / 10 / 15) | não varia | `QRCode`, sozinho |

E dentro da escala de controle, a **razão** é de cada componente, não da família: `h/2` quadrado
no `.control-mark`, `h·7/6 × h·2/3` no `.switch-track`, `1:1` no `.avatar`.

A família de **marcação** usa **uma** das seis variáveis que a camada emitia: gap (9px e 10px) e
corpo de texto são **fixos** nela, medido. Aplicar `--step-fs`, `--step-gap` e `--step-px` "porque
a família de campo usa" teria sido desenho por analogia.

E o degrau **base do `Spinner` é `sm`**, não `md` — `.spinner` já *é* o `sm`, e quem tem classe
própria é o `md`. Presumir `md` como base universal é o mesmo erro, um nível abaixo.

### O vazamento: 323 das 327 páginas

Antes de qualquer família ler `--step-*`, a pergunta obrigatória do `CLAUDE.md`: *quem mais tem
esse problema?* Medido com `jsdom` nas páginas construídas do catálogo:

```text
 323  .icon dentro de .btn
   4  .spinner dentro de .btn
   0  marcação dentro de qualquer definidor de passo
   0  identidade dentro de qualquer definidor de passo
```

Se o glifo lesse a grandeza do controle — ou se `--step-icon` fosse emitido junto do passo do
botão e herdasse — **todo ícone dentro de um botão responsivo mudaria de tamanho sozinho**, em
quase toda página. Marcação e identidade dão zero hoje; zero hoje não é zero amanhã, e a falha
seria silenciosa.

## Alternativas, e por que foram rejeitadas

**Uma classe de passo por família (`.gsize-*`, `.qr-*`).** Resolveria o vazamento sem
`@property`, mas multiplica a folha por família e devolve a vigilância a cada componente novo: a
família que esquecer de usar o prefixo certo volta a vazar, e nada acusa.

**Cada componente "zera" o que não lhe pertence.** Ruído em toda regra, e depende de o autor da
próxima família lembrar — que é exatamente a memória que esta atividade aprendeu a não ter.

**Deixar herdar e aceitar que o ícone acompanhe o botão.** É mudança visual em 323 páginas, sem
ninguém ter pedido, e o §96 manda mostrar A/B antes de decidir isso — não escorregar para dentro
de um refactor de infraestrutura.

**`@property` com sintaxe tipada (`syntax:"<length>"`).** Rejeitada por medição: propriedade
registrada com sintaxe tipada **exige** `initial-value`, e com `initial-value` a propriedade
sempre tem valor — o fallback de `var(--step-h, var(--control-h-md))` **nunca dispararia** e o
core inteiro perderia os padrões. `syntax:"*"` sem `initial-value` nasce *guaranteed-invalid*: o
fallback funciona e a herança some.

## Como é obrigada

```css
@property --step-h { syntax:"*"; inherits:false; }   /* × 9, geradas junto da camada */
```

A lista mora em `scripts/build-responsive-layer.mjs` (constante `VARIAVEIS`), junto da tabela de
passos — variável nova entra registrada por construção. Um teste unitário cobra as nove pelo nome
e pela forma exata; um teste de navegador cobra o efeito nos três motores.

**Provado antes de escrever regra**, nos três motores: valor posto no pai não chega ao filho
(7px, o fallback), e o fallback continua funcionando. **Provado contra o defeito**: removido o
bloco e reconstruído o `dist`, os três reprovam com `(20, 16, 24)` — exatamente a previsão
aritmética dos contêineres de 260/520/820px.

## Consequências, inclusive os custos

- **Custo de folha:** nove linhas de `@property`. A alternativa por prefixo custava uma família de
  classes inteira por escala.
- **Custo de suporte:** navegador sem `@property` ignora a at-rule, as variáveis voltam a herdar e
  o vazamento volta com elas. Baseline: Chrome 85 · Firefox 128 · Safari 16.4 — declarado no
  documento e no comentário do gerador.
- **Perda deliberada:** a solução "o pai dimensiona os filhos por herança de CSS" deixou de estar
  disponível de graça. O caso concreto é o `AvatarGroup`, cujo `size` hoje chega só ao "+N"; com o
  corte, sizing de grupo vira **decisão de API** (sobrepõe o filho, ou é só padrão?) em vez de
  efeito colateral de folha. Está registrado no `G-AXIS-05`.
- **Ganho:** `peleDoEixo` (então ainda `peleDeTamanho`) subiu para `pure.tsx` com o degrau base como **parâmetro**. Uma regra,
  não uma por módulo — que era o *"47 adaptações manuais independentes"* que o Victor proibiu.
- **Nada mudou de desenho:** 28 medidas de geometria idênticas antes/depois e **0** das 323
  páginas do catálogo com marcação diferente.

## Quando revisar

Quando aparecer uma família cuja grandeza **não** seja `--control-h-*`, `--icon-*` nem rem cru: aí
a tabela ganha coluna, e a pergunta "esta escala reage à densidade?" precisa ser respondida por
medição antes de a coluna existir. E se algum dia um pai **precisar** dimensionar filhos por
herança, isso é ADR novo — não exceção silenciosa a esta.
