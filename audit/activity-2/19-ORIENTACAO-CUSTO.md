# `orientation` pela camada responsiva — a medição de custo que decide o desenho

**22/08/2026** · não é arquitetura ainda: é a **evidência** que a próxima sessão precisa para
escolher entre dois desenhos sem refazer a conta. Fechado o `size` em 18/18, este é o próximo
eixo da fila (`HANDOFF.md` §5).

---

## 1. Por que `orientation` não é `size` com outro nome

Um passo de `size` é um conjunto de **medidas**: a camada re-põe `--step-h`, o componente lê. Um
passo de `orientation` é um conjunto de **regras**, e elas não são uniformes. Lido do core:

```text
.btn-group-vertical        flex-direction:column; align-items:stretch                        67 B
.toggle-group-vertical     flex-direction:column; align-items:stretch                        70 B
.menubar-vertical          + inline-size:max-content                                         90 B
.menubar-vertical .menubar-trigger     justify-content:flex-start        ← DESCENDENTE       66 B
.toolbar[data-orientation="vertical"]  + border-radius                  ← ATRIBUTO, não classe  117 B
.toolbar[…] .toolbar-sep   align-self/inline-size/block-size/min-block-size/margens ← DESC.  158 B
.separator-vertical        inline-size:1px; align-self:stretch; min-block-size               91 B
.range-vertical            writing-mode:vertical-rl; direction:rtl; inline-size; width      118 B
.tabs-root-vertical        display:GRID; grid-template-columns; align-items; gap            118 B
.tabs-vertical             flex-direction:column; align-items:stretch; min-height             76 B
.tabs-vertical .tab        min-block-size; text-align                  ← DESCENDENTE         77 B
.field-horizontal          display:GRID; grid-template-columns; align-items; column-gap     184 B
.field-horizontal>.label   grid-column; flex-direction; align-items; justify-content; gap   135 B
.field-horizontal>*:not(.label)        grid-column:2                    ← DESCENDENTE         50 B
                                                                              TOTAL       1.417 B
```

Três coisas saltam, e nenhuma é o que se presumiria:

**(a) Cinco dos oito colapsam em `flex-direction:column; align-items:stretch`. Três não.** O
`Separator` troca a grandeza do risco, o `Range` troca `writing-mode`, e o `Tabs` e o `Field`
trocam o `display` inteiro para `grid`.

**(b) Quatro regras alcançam DESCENDENTES.** Isso decide a questão da herança sozinho — ver §3.

**(c) O `Toolbar` casa por `data-orientation`, não por classe.** Uma camada que compõe classes
não alcança esse seletor. Ou o `Toolbar` passa a emitir classe também, ou a camada aprende a
forma de atributo.

**E o degrau base não é `horizontal` em todos:** o `Field` nasce **vertical** (`orientation =
"vertical"` é o default e ele emite `field-${orientation}` só quando não é vertical). Terceiro
caso do mesmo padrão, depois do `Spinner`; `peleDoEixo` já tem o parâmetro.

---

## 2. Os dois desenhos, e o que cada um custa

O core hoje tem **146.720 bytes crus** e **39.424 gzipados**.

### A — regra por ponto

A camada re-emite cada uma das 14 regras com seletor prefixado, para cada ponto: 7 de viewport +
5 de container = 12. Nenhuma regra existente muda.

### B — variáveis, como no `size`

As 14 regras são reescritas em termos de variáveis de eixo (`--eixo-dir`, `--eixo-cross`,
`--eixo-display`, `--eixo-wm`…) e a camada só re-põe as variáveis.

### A conta — e a correção que ela obrigou

A primeira versão deste documento recomendava **B**, com base em bytes **crus**. Estava medindo a
coisa errada: o consumidor baixa **gzip**, e doze cópias quase idênticas da mesma regra é o melhor
caso que existe para o gzip. Medido, gerando as duas camadas de verdade:

| desenho | cru | gzip |
|---|---:|---:|
| **A** — regra por ponto | +19.316 B (**+13,2%**) | +1.020 B (**+2,6%**) |
| **B** — variáveis | +2.876 B (**+2,0%**) | +182 B (**+0,5%**) |

Em bytes crus, B é **6,7× menor** e a escolha parece óbvia. **Na rede, a diferença inteira entre
os dois desenhos é de 838 bytes.**

E o que esses 838 bytes compram, do outro lado:

| | A | B |
|---|---|---|
| regras existentes que mudam | **nenhuma** | **14** |
| variáveis novas | **nenhuma** | **~20** |
| conceito novo no core | nenhum — é a mesma regra sob outro seletor | uma indireção por propriedade |
| superfície de regressão visual | ~zero | as 14 regras, nos dois temas e três densidades |
| `display:grid`, `writing-mode`, seletor de atributo | funcionam sem tratamento | cada um precisa de variável própria |

**Não há gate de tamanho de CSS no `validate.py`** — conferido, não presumido.

A catraca de `raw-px`, sim, se mexeu — e a afirmação que estava aqui (*"a camada gerada não
introduz pixel cru: os valores saem das regras que já existem"*) era **dedução, não medição**. Os
valores saem das regras que já existem **e são copiados por ponto**, e a contagem é de
ocorrências: 115 → 139 de uma vez. Corrigido excluindo a região gerada da contagem, o que não
afrouxa nada — o que a camada emite é conferido corpo a corpo contra a regra estática pelo
controle do gerador, e pixel cru novo só entra na camada entrando antes na regra estática, onde a
catraca o pega. Uma catraca que dispara sem defeito é uma catraca que se aprende a ignorar.

**Recomendação: A.** 838 bytes gzipados não pagam 14 regras reescritas e 20 variáveis novas. E o
argumento de que "o custo de A cresce com cada ponto novo da escala" também encolhe no gzip: ponto
novo é mais uma cópia quase idêntica, que é justamente o que comprime bem.

> Registrado como método: **medir a grandeza que o consumidor paga.** A conta em bytes crus estava
> aritmeticamente certa e respondia à pergunta errada — o mesmo tipo de erro que o `grep -c` do
> `forwardRef` cometeu, um nível acima.

## 3. O que foi implementado, e os dois achados que só apareceram fazendo

**Feito em 22/08/2026, no desenho A.** A camada gerada ganhou uma tabela de orientação no mesmo
arquivo e no mesmo formato da tabela de passos do `size`, com um **controle** que reprova o build
se ela discordar do core — provado contra dois defeitos, um na regra do componente e outro na do
descendente.

### Achado 1 — o valor BASE precisa de corpo próprio, e o sentido que faltava era o principal

A primeira versão emitia regra só para o valor **não-base**, seguindo o que o `size` faz (`md` não
emite classe). Consequência: a orientação viajava num sentido só. Um `ButtonGroup` horizontal
virava coluna no estreito, mas um declarado `base:"vertical"` **nunca voltava a linha no largo**.

E esse é o sentido **principal**: `@media`/`@container` são `min-width`, então o desenho natural é
mobile-first — empilhado por padrão, enfileirado quando sobra espaço. Justamente ele não
funcionava. Descoberto por teste vermelho nos três motores, não por leitura.

O corpo do valor base **não é cópia** de uma regra estática — ele reconstrói o que a regra de base
faz no eixo (`.btn-group` nem declara `flex-direction`, porque `row` é o valor inicial). Então o
controle de texto não tem contra o que conferir, e a volta é provada onde importa: **no navegador,
comparando o computado do responsivo com o do estático**. Provado contra o defeito — trocando
`align-items:center` por `flex-start` no corpo base, os três motores reprovam com
`row/flex-start/inline-flex` contra `row/center/inline-flex`.

### Achado 2 — o eixo só cabe em 3 dos 8, e o motivo é medido

Em quatro componentes a orientação carrega **semântica de teclado**. Medido no banco de prova, no
`Tabs` horizontal:

```text
ArrowRight  Um → Dois   MOVEU        ArrowDown  Um → Um   parado
ArrowLeft   Um → Três   MOVEU        ArrowUp    Um → Um   parado
```

O motor **honra** o `aria-orientation`. Uma lista de abas que o CSS desenha em coluna continuaria
anunciando `horizontal`, e Baixo/Cima continuariam mortos — a API anunciando uma coisa e
entregando outra. CSS não muda atributo, e sincronizar por JavaScript seria observar largura, que
a decisão do `G-AXIS-04` proíbe quando o CSS resolve — e aqui ele **não** resolve.

**A regra que ficou, aplicada uniformemente:** o eixo responsivo de orientação só é oferecido onde
a orientação **anunciada** não pode divergir da visual — ou porque o componente não anuncia
nenhuma (`ButtonGroup` é `role="group"` sem `aria-orientation`; `Field` é um `<label>`), ou porque
quem a anuncia é o próprio CSS (`Range`: `writing-mode` no `<input type=range>` nativo, provado
nos três motores no `G-AXIS-03`).

Ficam de fora com o motivo registrado — cartão **`G-AXIS-06`** — `Tabs`, `Menubar`, `Toolbar`,
`ToggleGroup` (roving focus) e `Separator` (anuncia `aria-orientation` e não pode acompanhar). O
`sweep-responsivo` passou a marcar `✕` para decisão e `·` para fila, e a imprimir os excluídos com
o motivo: um `3/8` lido daqui a duas sessões não pode virar cinco tarefas fantasma.

**Quando houver como sincronizar a semântica, cada um é UMA LINHA na tabela** — a camada, o
controle e o gate já cobrem a forma.

### O estado

```text
orientation      3 de 8   ButtonGroup · Field · Range      (5 excluídos por decisão)
regras na camada 6        3 componentes × 2 valores
descendentes     3        os do Field, ida e volta
testes           +5 unitários · +3 no navegador × 3 motores
controle         o gerador FALHA se a tabela discordar do core
```

## 4. A herança — registro, já não decisivo

> Esta seção decidia o desenho B. Com A escolhido, ela vira registro: a conclusão continua
> verdadeira e vale para qualquer desenho futuro que dependa de herança.

### O que foi medido

No `size`, a variável de passo **não pode herdar** — foi o que o `@property … inherits:false`
resolveu, e o que evitou mudar 323 páginas.

Em `orientation` é o oposto: **quatro das regras alcançam descendentes** (`.toolbar-sep`,
`.menubar-trigger`, `.tabs-vertical .tab`, `.field-horizontal>.label`). Se a variável de eixo não
herdar, o desenho B **não funciona** — o filho nunca recebe o valor. Então:

> `@property … inherits:false` **não está disponível** para as variáveis de eixo. É uma diferença
> de natureza entre os dois eixos, não uma inconsistência.

E aí volta a pergunta obrigatória do `CLAUDE.md`: *quem mais tem esse problema?* Medido com
`jsdom` nas 326 páginas construídas:

```text
   3  Range dentro de Field
      (uma única forma de aninhamento em 326 páginas)
```

**E ela é benigna.** O `Field` nasce vertical, e degrau base **não emite classe nem variável** —
então o `Field` padrão não empurra nada para o `Range`. Um `Field` explicitamente **horizontal**
empurraria `row`, que já é o default do `Range`. Nos dois casos, nada muda.

**Conclusão:** a herança é segura hoje **e** necessária ao desenho B. O controle que precisa
existir junto é o teste que reprova se um componente com orientação **explícita** perder para a
do ancestral — porque valor explícito no próprio elemento tem de vencer, e é isso que separa
"herança útil" de "vazamento".

---
