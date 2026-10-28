# ADR-0085 — As treze marcas: a Aurea Ember e as 11 da paleta da 1.0

- **Data:** 28/10/2026
- **Estado:** aceita · na branch `claude/cores-c`, para a `0.47.0` — só a web (o nativo não tem eixo de marca). Aprovada
  na bancada (28/10/2026): *"Aprovo"*.
- **Origem:** a proposta de cores do Victor (25 e 26/10/2026, a mesma das [ADR-0083](0083-a-paleta-da-1-0.md) e
  [ADR-0084](0084-os-estilos-novos-e-as-duas-excecoes.md)), seções 0, 9b, 10 e a parte 3 do CSS: *"a `lory` passa a se
  chamar Aurea Ember"*; os nomes *"Aurea + nome em inglês"*; e *"Não as torne oficiais sem aprovação"*. A ordem aprovada em
  26/10/2026 (*"4 ok"*): o passo C das marcas, com o aviso da marca laranja. O começo: *"Pode começar"*, e as 11, *"As 11"*
  (28/10/2026).

## O que se mediu

- **O nativo não tem eixo de marca** (`data-brand` só existe no CSS da web, gerado pelo `scripts/build-tokens.mjs`). A
  proposta diz que a Ember muda "no core, no native e nos tokens"; no nativo não há o que mudar.
- **A parte 3 da proposta usa cinco tipos de valor:** hex, hex com transparência, `transparent`, `var(--x)` e duas
  misturas (`color-mix`). O arquivo de tokens não aceita mistura; as duas viram cor pronta com o MESMO valor — o fio do
  item atual da lateral (o primário a 75% com o transparente, em oklab, é o primário com alfa 0,75) e a ponta do degradê
  das marcas de letra branca (o primário 70% com o preto, em oklab: a luz e o croma × 0,7, o mesmo matiz).
- **O core tinha três regras escritas para "qualquer marca"** (`[data-brand]` sem nome), feitas quando só existia a
  `lory`: o item atual da lateral no claro (o botão primário só na Aurea Gold), o selo cheio da marca e a letra do selo de
  contorno da marca. Medidas nas 11 marcas: a primeira está certa como está (a proposta dá às marcas a lateral delas, com o
  fio na cor da marca); a segunda reprovava; a terceira passava pela mistura com o texto, e foi para o jeito da Gold
  pelo mesmo motivo ("fora da `lory`").
- **O axe nos dois bancos das cores, em cada marca e tema** (`tests/visual/marcas-passo-c.spec.ts`), com as marcas nos
  tokens e o core como estava, achou três defeitos — todos da proposta aplicada sobre o core de hoje, e nenhum na Aurea Gold:
  1. o segmento aceso, a aba e o item de navegação atual do **escuro** com a letra no primário puro: 1,56:1 (Cobalt) a
     4,3:1 (Cyan). É a regra 2.1b da proposta, que o passo A não levou para as marcas;
  2. o `.eyebrow` do escuro, pelo mesmo motivo (2,98 a 4,29:1), que a proposta não listava;
  3. o **selo cheio** da marca no acento: a letra escura no grafite (1,12:1 na Sun do claro) e a branca no azul claro
     (2,25:1 na Cobalt do escuro).
- **E um que não é do passo C:** no escuro, o nome dentro da célula "atenção" do painel de saúde mede 2,41:1 — na Aurea
  Gold da 0.46.0 publicada e igual em todas as marcas. Fica de fora desta decisão e vai ao Victor como pergunta à parte.

## A regra

1. **Treze paletas.** A padrão, a **Aurea Gold**, não tem atributo. As outras doze são `data-brand`: a **Aurea Ember**
   (`ember`) e as 11 da paleta da 1.0 — `sun`, `honey`, `orange`, `magenta`, `violet`, `indigo`, `cobalt`, `cyan`,
   `turquoise`, `emerald` e `lime`.
2. **A `lory` passa a se chamar Aurea Ember.** Só o nome: as cores, os links e tudo o mais ficam como eram, e continuam
   congelados (ADR-0083). `data-brand="lory"` vale como apelido **por uma versão** — no CSS dos tokens (o gerador lê o
   apelido em `brandAliases`) e no core (`:is([data-brand="ember"],[data-brand="lory"])`, que pesa o mesmo que o
   atributo sozinho). O site lê a escolha gravada `lory` como `ember`.
3. **As 11 marcas usam os neutros da Aurea** e redefinem só o primário e o que nasce dele: o link, o foco, o controle
   escolhido, a lateral, a seleção e o acento. Os valores são os da parte 3 da proposta, sem mudança.
4. **Os quatro ajustes da 9b:** (1) no escuro, a letra do escolhido é o `--primary-emphasis` — na Aurea Gold ele é o
   próprio amarelo, e nada muda; vale também para o `.eyebrow`; (2) a lateral das marcas usa o `--primary-emphasis` e o fio
   na cor da marca; (3) a cápsula clara do `bar-light` tem sempre a letra escura (já era assim desde a 0.46.0); (4) a ponta
   do degradê do `brand-gradient` por marca (`--primary-gradient-end`), escura nas quatro de letra branca.
5. **O selo cheio é o botão cheio em toda marca** (o primário com a letra do primário), e o selo de contorno da marca
   escreve com o acento, como na Gold. Só a Ember fica como era. Regra para "qualquer marca" (`[data-brand]` sem nome) só
   sobra a da lateral, e o `tests/unit/marcas-passo-c.test.tsx` cobra.
6. **A Aurea Orange troca o aviso pelo mel** (`#F5A524`), como no laboratório da proposta — o laranja do aviso seria a
   cor da própria marca. O fundo suave do aviso sai na mesma proporção que o da Aurea tem com o laranja dela (4% no
   branco; 30% no preto).
7. **O `brand-white` da barra de baixo (o F) reprova nas marcas de letra escura**, como já reprova na Aurea Gold
   (ADR-0084). A página de marcas do site diz isso.
8. **A Ember recebe os estilos novos** (o Victor, 28/10/2026: *"Sim, como as outras"*), e muda a [ADR-0084](0084-os-estilos-novos-e-as-duas-excecoes.md)
   item 7. O padrão dela continua congelado; com um estilo escolhido, o botão ligado dela ganha a pintura que o passo A dá às
   outras marcas. Os estilos que pintam o laranja cheio dela herdam o par que ela já reprovava no claro (a letra branca no
   laranja, 3,08:1).
9. **As marcas dos controles da Ember no escuro são brancas** (o Victor: *"Brancos, como as outras"*): a bolinha do
   `Switch`, a alça do `Slider`, o visto e o ponto do `Radio`. Eram o quase preto do fundo dela; a referência usa branco nos
   dois temas. Só os três tokens do escuro mudam (`control-thumb`, `control-selected-foreground`, `control-selected-dot`).
10. **O contador e o ponto da barra de baixo são vermelhos, como no nativo** (o Victor: *"Vermelho, igual"*, *"Vermelho
   sempre"*, *"Vermelho, como no nativo"*). Os exemplos da web passam o selo `danger`; no item atual, a peça só inverte o
   selo da cor da MARCA (`.badge-primary`), que sumiria na cápsula; o ponto vazio é o `--destructive` — menos na barra
   inteira da marca, onde continua a tinta (o vermelho no amarelo não chega a 3:1). O vermelho é o mesmo do nativo
   (`#C50F1F`, medido no print do site e na bancada).
11. **A `Toolbar` nas medidas da referência** (o Victor, vendo as duas lado a lado: *"Medidas da referência"*): 4 por
   dentro e 8 entre os botões, como a barra "colada" dela (era 7 e 6, escritos à mão).

## Como é obrigada

- `tests/visual/marcas-passo-c.spec.ts`: o axe nos dois bancos das cores, nas 12 marcas (a Gold e as 11) e nos dois temas;
  só o F das marcas de letra escura passa, e a célula "atenção" do escuro, que não é de marca. Provado contra o defeito.
- `tests/unit/marcas-passo-c.test.tsx`: os nomes e o primário das marcas, o apelido, o aviso da Orange, e que o core não
  fala da `lory` sem a `ember` nem escreve regra nova para qualquer marca.
- `tests/visual/lory-congelada.spec.ts`: a Ember e a `lory` saem com as cores da 0.44.0, nos dois temas. Provado contra o
  defeito: com o core escrevendo só `lory`, a `ember` reprova (77 diferenças).

## As consequências, com os custos

- **Doze marcas a mais no arquivo de tokens** (522 tokens: 11 marcas, dois temas): a página de tokens do site cresce, e a foto dela muda.
- **O apelido `lory` sai na versão seguinte.** Quem usa `data-brand="lory"` tem uma versão para trocar.
- **O site ganha as 13 marcas no botão "Theme"**, com o nome sem o "Aurea" da frente (Gold, Ember, Sun…).

## Revisão

Quando o apelido `lory` sair (a versão depois da `0.47.0`): tirar o `brandAliases`, o `:is()` do core e a leitura do site.
