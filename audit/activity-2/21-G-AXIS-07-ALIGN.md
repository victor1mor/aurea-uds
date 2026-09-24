# `InputGroupAddon.align` — a triagem, e por que ela terminou em elegível

**22/08/2026** · fecha o eixo responsivo em **27 de 27** props elegíveis.

O Victor foi explícito: *"não presuma que ele deve ser responsivo apenas para atingir 27/27"*, e
fixou sete perguntas com dois resultados válidos — elegível e implementado, ou reclassificado como
não responsivo com evidência. Nada de `26/27, vemos depois`.

**Resultado: A — elegível, implementado, natureza `visual`.**

---

## As sete perguntas, respondidas por medição

### 1. `align` representa apresentação que pode mudar conforme o espaço?

**Sim, e a medição é grande.** Um grupo com adorno de prefixo (`https://`) e um botão ao fim,
medido no navegador com o CSS real do catálogo:

| largura da caixa | campo com adorno em LINHA | campo com adorno em FAIXA |
|---:|---:|---:|
| 200px | 95px — **48%** | 198px — **99%** |
| 260px | 155px — **60%** | 258px — **99%** |
| 320px | 215px — **67%** | 318px — **99%** |
| 420px | 315px — **75%** | 418px — **100%** |
| 640px | 535px — **84%** | 638px — **100%** |

Aos 200px o campo perde **mais da metade** da caixa para os adornos. Não é preferência de desenho:
é o campo deixar de caber. E o efeito desaparece sozinho quando há espaço — aos 640px a diferença
cai para 16 pontos —, que é exatamente o formato de um eixo responsivo.

### 2. Viewport faz sentido?

**Sim.** Um formulário que ocupa a largura da página decide pela janela: telefone empilha o
prefixo, desktop mantém em linha.

### 3. Container faz sentido?

**Sim, e é o caso mais forte.** O mesmo `InputGroup` num painel lateral de 260px e na coluna
principal de 640px tem de decidir diferente **na mesma janela** — que é o que a viewport não
consegue expressar.

### 4. Altera só o visual, ou comportamento/semântica?

**Só o visual**, e isso foi medido em três frentes:

```text
ARIA          o adorno emite `aria-hidden` e `aria-label` VINDOS DOS FILHOS.
              Nenhum deles sai do `align` — medido em AUREA-ARIA.json
motor         não há. É um <span>
teclado       a ordem de tabulação é a do DOM, e `align` não mexe no DOM
```

O que `align` move é a **posição**, por `order` — as quatro faixas são `order:-2 / -1 / 1 / 2`.
Pelo critério da [ADR-0047](../../decisions/0047-css-first-para-apresentacao-runtime-para-semantica.md),
isso é `visual`: não há atributo nem estado de motor a sincronizar, e o CSS resolve sozinho.

> **Mas a medição achou outra coisa, e ela virou cartão próprio.** `order` reordena o **desenho** e
> não o DOM. Um adorno com conteúdo focável numa faixa oposta à posição dele no DOM aparece antes
> do campo e é tabulado depois — WCAG 2.4.3, nível A. Medido nos três casos:
>
> ```text
> inline-end   DOM/foco: campo → botao   visual: campo → botao   ok
> block-start  DOM/foco: campo → botao   visual: botao → campo   ⚠ DIVERGEM
> block-end    DOM/foco: campo → botao   visual: campo → botao   ok
> ```
>
> **Isso não é consequência da responsividade** — acontece hoje, com valor estático. Varridas as
> páginas construídas: **35** grupos de campo, **4** adornos com conteúdo focável, **zero**
> divergências. É latente, não presente. Cartão `G-A11Y-06`, com gate provado contra o defeito.

### 5. Existe composição real em que mudar `align` evita quebra?

**Sim, e são as da própria Aurea.** `SearchField` põe o glifo em `inline-start`; `PasswordField`
põe o botão de revelar em `inline-end`; o `pattern-toolbar` põe um `InputGroup` com
`flex:1 1 180px`, que num contêiner estreito chega perto dos 200px medidos acima.

### 6. Alguma referência faz algo equivalente?

Medido nos inventários:

| referência | o que tem |
|---|---|
| **shadcn/ui** | `InputGroupAddon` com o eixo **idêntico**: `align: [block-end, block-start, inline-end, inline-start]` |
| **Shark UI** | `InputGroupAddon`, com `align` como estado de dado |
| **MUI** | `InputAdornment` com `position: [end, start]` — duas faixas, sem banda de bloco |
| **Untitled UI** | componentes separados (`LeadingIcon`, `TrailingButton`) — não é eixo |
| **Base UI** | `InputGroup`, sem eixo de alinhamento |

O eixo existe e converge — a Aurea o herdou de shadcn. **Nenhuma delas o faz responsivo**, então
aqui não é alcançar: é passar à frente, como no resto do eixo responsivo.

### 7. A API continuaria coerente?

**Sim.** `align?: Responsive<AddonAlign>`, o mesmo `Responsive<T>` dos outros 26, resolvido pela
mesma camada, declarado na ficha como `{"align": "visual"}` e conferido pelo mesmo check 12c.

Uma diferença de forma, e ela está no código: **este eixo não tem valor base sem classe.** As
quatro faixas têm regra própria no core e o componente sempre emitiu classe — um `inline-start`
que não emitisse nada ficaria sem `order` e sem padding. Por isso a chamada passa `padrao: ""`.

---

## O que ficou

```text
align                27 de 27 props elegíveis — fila do eixo responsivo VAZIA
natureza             visual (gate 12c confirma: sem motor, sem aria vindo do align)
camada               4 faixas × 12 pontos, na mesma tabela de eixos-por-regra
catálogo             0 das 326 páginas com marcação diferente
testes               +3 unitários · +1 gate de navegador (G-A11Y-06), provado contra o defeito
achado colateral     G-A11Y-06 — order × ordem de foco. Latente: 0 em 35 grupos reais
```

**A tabela do gerador foi renomeada** de `ORIENTACAO` para `EIXO_REGRA`: o que reúne aquelas
entradas não é o eixo, é a **natureza do passo** — regra, e não medida. Com `align` entrando pela
mesma porta, o nome antigo passou a mentir.
