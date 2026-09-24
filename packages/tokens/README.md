# Fundamentos da Aurea — o que os tokens governam, e o que não governam

A resposta oficial para "qual eixo manda neste valor". Escrito na Fase 6 do plano da auditoria,
porque a auditoria achou os fundamentos documentados em lugar nenhum: densidade e tema prometiam
coisas que nenhum documento definia, e um quarto dos tokens não tinha quem os usasse (achados M2,
M17, M18).

As contagens moram no [`STATE.md`](../../STATE.md), gerado e conferido. Este arquivo guarda as
regras.

---

## Os eixos

| Eixo | Tokens | Unidade | Observações |
|---|---|---|---|
| Cor | `--<semântico>`, `--<família>-<degrau>` | oklch / hex | o semântico vem primeiro; um degrau da rampa serve para montar um semântico, não para usar direto |
| Espaço | `--space-0` … `--space-24` | rem | escala com saltos de propósito — nem todo inteiro existe |
| Tamanho de letra | `--text-xs` … `--text-5xl` | rem | |
| Família de letra | `--font-ui`, `--font-editorial`, `--font-code` | — | IBM Plex Sans / Serif / Mono |
| Peso de letra | `--weight-regular` … `--weight-bold` | número | criado na Fase 6; o eixo não existia |
| Altura de linha | `--leading-none` … `--leading-relaxed` | número | `--leading-none` existe para componentes cuja ALTURA é contrato |
| Espaçamento entre letras | `--tracking-tight` … `--tracking-widest` | em | criado na Fase 6 |
| Raio | `--radius-sm` … `--radius-card`, `--radius-control` | px | `--radius-card` (22px) e `--radius-control` (999px) são identidade — conferidos |
| Borda | `--border-width` | px | |
| Sombra | `--shadow-md`, `--shadow-lg` | sombra | os degraus `xs`/`sm` saíram na Fase 6: os dois eram `none` e ninguém usava |
| Camada | `--z-sticky` … `--z-toast` | número | para empilhar CAMADAS FLUTUANTES. `z-index: 1/2/3` local, dentro de um componente, não é este eixo |
| Movimento | `--duration-*`, `--ease-*` | duração / curva | |
| Tamanho de ícone | `--icon-sm` … `--icon-xl` | rem | criado na Fase 6; em rem para o glifo acompanhar a letra |
| Área de toque | `--target-min` | rem | 44px com raiz de 16px — WCAG 2.5.5/2.5.8 |
| Ponto de quebra | `--breakpoint-sm` … `--breakpoint-2xl` | px | `@media` não lê `var()`, então o CSS repete o número e o check 4b do `validate.py` guarda a escala |
| Densidade | ver abaixo | rem | |

**Valor novo em qualquer um destes eixos sai de um token.** Os valores crus do core são contados
por eixo pelo check 12 do `validate.py`, contra o `scripts/raw-px-baseline.json`: a conta pode
cair, nunca subir.

---

## O contrato da densidade — o que de fato muda

`data-density="compact | comfortable | spacious"` muda **oito** tokens, e só eles:

`--control-h-xs`, `--control-h-sm`, `--control-h-md`, `--control-h-lg`, `--control-h-xl`,
`--row-h`, `--card-pad`, `--section-gap`.

Ou seja: a densidade muda **a altura dos controles, a altura da linha de tabela, o respiro do
cartão e o vão entre seções**.

Ela **não** muda, de propósito: tamanho de letra, a escala geral de espaço, os vãos de layout,
raios, tamanhos de ícone nem alturas de linha. Densidade é sobre quão juntos os controles ficam, e
não uma segunda escala de letras.

Isso não estava escrito até a Fase 6, e a promessa "três densidades" soava como se mandasse em
tudo. Todo controle tem de tirar a altura de `--control-h-*` — três famílias não tiravam, e por
isso uma aba media 8px a menos que o campo ao lado em `spacious` (achado A1). O
`tests/visual/geometry.spec.ts` cobra isso hoje.

---

## O contrato do tema — e uma assimetria, de propósito

`data-theme="dark | light"`. O escuro é a base; o claro sobrescreve.

Os dois temas **não** são simétricos, e esta é a exceção: o claro sobrescreve seis cores que o
escuro deixa no valor base — `danger-400`, `info-400`, `success-400`, `warning-400`, `oracle-300`,
`oracle-400`.

Motivo: sobre uma superfície clara essas quatro famílias semânticas precisam de um tom mais fundo
para chegar a 4,5:1, enquanto no escuro o valor base já chega. Nada fica indefinido no escuro — ele
herda da base, então não há valor faltando. O que faltava era este parágrafo.

A identidade não muda entre temas: o amarelo principal é `oklch(0.795 0.184 86.047)` nos dois, e o
check 3 do `validate.py` reprova pelo valor canônico, não só pelo nome do token.

---

## Unidades: rem para tudo que deve acompanhar a letra

Letra, espaço, tamanho de ícone, altura de controle, largura da lateral e altura da barra do topo
são **rem**, para que quem dobra a letra do navegador ganhe controles maiores em vez de texto
cortado (WCAG 1.4.4, achado M12). A conversão de px foi exata (px÷16), então nada se moveu no
tamanho de raiz padrão — as 52 fotos de referência provam.

Os raios ficam em **px**: um canto é forma física, não texto, e escalá-lo com a letra faz a cápsula
deixar de ser cápsula.

---

## Tokens sem quem os use

63 de 174 nomes distintos não são citados pelo core. Isso não é desperdício automático:

| Grupo | Por que existe |
|---|---|
| `--breakpoint-*` (5) | `@media` não lê `var()`. O CSS repete o número e o check 4b guarda a escala contra eles |
| `--oracle-*` (11) | usados só por `apps/docs/docs.css`. `oracle` é vocabulário do app de origem, não do sistema (achado M9) — saem junto com aquela página |
| `--chart-*` (4) | reservados para gráficos, que ainda não existiam como componentes |
| degraus de rampa (6) | degraus intermediários das famílias semânticas, mantidos para um consumidor montar uma variante |
| o resto | usados só pelo `docs.css` — 14 no total |

**A regra daqui em diante:** um token nasce de um uso, não de uma escala que parece completa. A Fase
6 tirou 26 que não tinham uso em lugar nenhum (`--aether-*`, `--ember-*`, duas sombras `none`, dois
raios repetidos) e criou 15 que eram necessários na hora.

Repetidos são referências, não cópias: `--radius-full` é `{radius-control}`, então os dois nomes não
podem divergir. Dois tokens com o mesmo número escrito à mão divergem no dia em que um é ajustado.

---

## Cascata

O `packages/core/dist/aurea.css` embrulha os tokens **e** o CSS dos componentes em `@layer aurea`. O
CSS do próprio consumidor, escrito sem camada, ganha da biblioteca qualquer que seja a
especificidade do seletor — sem `!important`, sem caça à especificidade.

Os tokens ficam dentro da camada, junto com o core, e não fora. Uma **declaração** de propriedade
customizada disputa a cascata como qualquer outra: com os tokens fora, a sobrescrita de `:root` que
o core declara dentro de uma media query perdia para o valor base, e a lateral pulava 48px. Um app
que redefine um token no próprio `:root` sem camada continua ganhando dos dois.
