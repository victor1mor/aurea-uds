# ADR-0044 — Semântica tem precedência sobre coincidência de token, e API não degrada em silêncio

> 🔴 **RENUMERADA de `ADR-0016` para `ADR-0044` em 14/09/2026.** O número `0016` estava
> **DUPLICADO** — duas ADRs diferentes o carregavam, e a mais antiga fica com ele. O link sempre
> resolveu (o nome do arquivo é único); a MENÇÃO em prosa, não: *"ver a ADR-0016"* não dizia qual
> das duas, e este repositório cita ADR por número em dezenas de lugares. **A decisão, a data e o
> conteúdo não mudaram** — só o identificador.


- **Data:** 21/08/2026
- **Estado:** aceita
- **Autoria:** decisão do Victor em 21/08/2026, em resposta a duas escaladas do §96 abertas ao
  fechar o `G-API-01`
- **Obriga:** o teste `tests/unit/button-tone.test.tsx` (distância perceptual mínima, e matriz sem
  célula ausente) e o gate `tests/visual/tone-contrast.spec.ts` (AA em toda célula, nos dois temas)

## Contexto

O eixo de tom do botão (`G-API-01`) fechou de forma aditiva, e ao fechá-lo sobraram duas coisas que
**não eram deriváveis** e subiram pelo §96:

1. **Não existia par cor+texto para tom preenchido** além de marca, neutro e destrutivo.
   `--destructive` só é um botão cheio porque `--destructive-foreground` existe ao lado, escolhido
   tema a tema. Para verde e azul existiam só as rampas. A implementação de então **rebaixava**
   `appearance="solid"` para `outline` quando o tom não tinha par.
2. **`--warning-400` era literalmente `var(--brand-yellow)`** no tema escuro, e `--primary`
   também. Distância perceptual medida: **0,001** — a mesma cor. Os outros pares de tom da Aurea
   ficam em **0,19**.

## Alternativas rejeitadas, e por quê

| Alternativa | Rejeitada porque |
|---|---|
| Manter o rebaixamento de `solid` para `outline` | *"Não considero aceitável uma API anunciar `tone="success" appearance="solid"` e entregar visualmente um outline por limitação interna nossa."* A API mentiria sobre o que entrega, e o consumidor não teria como saber. |
| Pintar `solid` de sucesso com `--success-bg` + `--success-400` | Faz o preenchido de sucesso ficar visivelmente mais fraco que o de perigo **com o mesmo `appearance`** — inventa uma inconsistência onde havia uma ausência. |
| Usar `--success-500` cru como preenchimento | Reprova AA no tema claro. Medido. |
| Deixar `warning` fora do eixo de tom | Toda referência do §3 tem botão de aviso. Manter a ausência preserva uma limitação nossa como se fosse desenho. |
| Trocar a cor da marca para abrir espaço ao aviso | A paleta é intocável (`CLAUDE.md`). O amarelo é a identidade; quem tem de sair de cima é o aviso. |

## Decisão

**1. Tokens de marca e tokens semânticos podem coincidir por acaso somente quando isso não
destrói significado. Se duas intenções diferentes ficam visualmente indistinguíveis, a semântica
tem precedência e deve receber token próprio.**

**2. API não degrada em silêncio.** Se um eixo declara um valor, o sistema entrega aquele valor.
Falta de token é **dívida de infraestrutura** — conserta-se a infraestrutura, não se rebaixa a
entrega. `outline` é uma aparência que se pede, nunca o que sobra quando a paleta não dá conta.

## Como isso foi executado

Nove tokens por tema — `--success`, `--success-foreground`, `--success-hover` e os irmãos de
`info` e `warning` — na mesma estrutura do `--destructive`. `success` e `info` **adotaram a cor
que já estava no ar**, então nada que já usava esses tons mudou de pixel.

O valor do aviso saiu de **otimização, não de gosto**, e três tentativas foram medidas e
descartadas antes: maximizar a distância da marca dá um cinza-marrom (distância sozinha destrói a
semântica); maximizar croma vai a 55° e encosta no destrutivo; maximizar a menor das duas
distâncias sem mais nada sai da faixa de luminosidade que os outros tons ocupam. O critério final
tem as três lições dentro — **maximizar a MENOR distância até a marca e até o destrutivo**,
restrito a AA sobre o fundo do tema, ao gamute sRGB e à faixa de L da família:

| | escuro | claro |
|---|---|---|
| valor | `oklch(0.72 0.175 60)` | `oklch(0.535 0.131 61)` |
| dE até a marca | **0,104** (era 0,001) | **0,119** (era 0,044) |
| dE até o destrutivo | 0,115 | 0,121 |
| contraste no fundo | 7,62:1 | 4,85:1 |

`--brand-yellow` e `--primary` seguem **intactos**.

## Como a decisão é obrigada

- `tests/unit/button-tone.test.tsx` recalcula a distância em oklab a partir do CSS gerado e reprova
  abaixo de `0,08`. Um alias novo, ou um valor que volte a se aproximar da marca, reprova. O mesmo
  teste cobra que **toda célula** da matriz aparência × tom tenha regra, e que `solid` tenha
  preenchimento de verdade — é o que pega a volta do rebaixamento.
- `tests/visual/tone-contrast.spec.ts` mede as 30 células nos dois temas no navegador, cobrando
  4,5:1 no rótulo (SC 1.4.3) e 3:1 na borda (SC 1.4.11). **Foi este gate que achou o `G-A11Y-02`**,
  um defeito de AA já publicado que nada tinha a ver com o tom.

Os dois foram provados contra os defeitos que pegam.

## Consequências, incluindo os custos

- **Muda o pixel** de tudo que pinta aviso: `Badge`, `Status`, `Alert`, `Banner`, o nível `warn` do
  `LogStream` e a célula de aviso da matriz de saúde. Três baselines visuais passam a divergir até
  a CI regerar as `-linux.png`.
- A família de aviso inteira (`-500`, `-800`, `-bg`) acompanhou o matiz novo — senão a borda âmbar
  do `Alert` ficaria sobre uma superfície amarela.
- O princípio **1** vale daqui para frente para qualquer par marca/semântica, não só para o aviso.
  Quem introduzir um token semântico novo tem de medir a distância até a marca.

## Condição de revisão

O princípio **2** não se revisa: é contrato de API. O **1** se revisa se a identidade da Aurea
deixar de ser amarela — o que é decisão do Victor, não desta ADR.
