# ADR-0066 — A peça é a da referência, quase idêntica; e o nativo tem a escala de toque

- **Data:** 11/10/2026
- **Estado:** aceita · em construção na `0.32.0`.
- **Origem:** duas ordens do Victor, de 11/10/2026.
  1. *"tem que ser quase identico a [a referência principal] so add nossas caracteriscas"* (o nome
     da biblioteca não se escreve aqui, pela regra do `CLAUDE.md` §2), com o alcance esclarecido no
     mesmo dia: o desenho e o NOME de componente podem ser os dela; o que não entra é o nome da biblioteca.
  2. Depois da auditoria do nativo: *"sim, aprovo a escala de 48 no nativo"*.
- **Muda:** a regra de desenho de toda peça (o `CLAUDE.md` §2 e §5 já dizem); a escala `sm`/`lg` dos
  controles da web; uma escala de altura própria do nativo; a entrelinha dos títulos; o `Kbd`; o
  `CloseButton` novo; o peso `bold` do `Icon`, para nomes escolhidos.

## A regra

**1. A peça da Aurea é a da referência principal, quase idêntica.** Anatomia, medidas, estados,
comportamento e teclado vêm dela, lidos no CSS e no código publicados (não na página de documentação, e
não na memória). Por cima, só o que é da Aurea: as cores e os dois temas, os cantos (22 nos cartões, 32
na folha de baixo, cápsula nos controles — nada quadrado), a Atkinson Hyperlegible, os ícones Phosphor,
as três densidades, nenhum degradê e o cuidado com baixa visão. Nome de componente igual ao dela é
permitido (`CloseButton`); o `tone` da Aurea fica (decisão do Victor de 11/10/2026).

**2. A escala de altura da web segue a dela onde ela tem degrau:** `sm` 32 e `lg` 40 (eram 30 e 42); o
`md` já era 36. O `xs` (26) e o `xl` (50) ficam, porque ela não os tem. As outras densidades andam o
mesmo que o `md`: compacto 28 · 32 · 36, espaçoso 36 · 40 · 44.

**3. O nativo tem a sua escala de altura, feita para o dedo** — os tokens `touch-control-h-sm/md/lg`,
dentro das três densidades: 40 · 48 · 56 no confortável, como o pacote nativo da referência (botão,
campo e seleção de 48); 36 · 44 · 52 no compacto e 44 · 52 · 60 no espaçoso (o mesmo passo de 4 da
web). Eles moram no MESMO arquivo de tokens e saem também no CSS, mas a web não os usa. O nativo passa a
eles **peça a peça**, e não trocando o `controlH*` de uma vez: o `controlH*` também mede peças que não
são controle (a barra de baixo, aprovada rodando pelo Victor), e trocar o valor por baixo delas
mudaria a barra sem ninguém ver.

**4. Cada título tem a sua entrelinha**, a da escala publicada dela: 40 · 36 · 32 · 28 · 28 · 24 para
36 · 30 · 24 · 20 · 18 · 16 (`text-4xl-leading` … `text-lg-leading`; o 16 usa o `leading-normal`). Eram
1,2 em todos. São razões, para o nativo multiplicar pelo tamanho. A entrelinha do texto corrido fica a
nossa (1,7 → 27, 24 e 20, contra 28, 24 e 20 dela): 1 ponto a menos no corpo de 16, e não pediu mudança.

**5. O peso `bold` do ícone existe só para nomes escolhidos, um a um** (`NOMES_BOLD`, hoje `x`). O traço
da Aurea continua o Regular (ADR-0053); o `x` do `CloseButton` é o Bold por decisão do Victor (*"1
bold"*), porque é o traço do X da referência. Os outros nomes pedidos em `bold` desenham o regular,
como o nome do app pedido em `fill`.

## O que fica de fora, e por quê

- **O X de 18 do `CloseButton` nativo dela:** a escala de ícone da Aurea é 16 · 20 · 24 · 32, e escala
  nova não se cria no meio de um componente. O nativo usa 20 (`iconMd`); a diferença vai à bancada.
- **O 32 da anotação HER-12 para o `CloseButton` nativo** estava errado: lido no CSS publicado, o botão
  `sm` só de ícone do nativo dela tem 40 (`--spacing` × 10, com a unidade de 4).

## Quem cobra

- `tests/unit/lote-q-base.test.tsx` (web: o `CloseButton`, o `kbd-single`, o `bold`) e
  `tests/unit/native-lote-q-base.test.tsx` (a escala de toque nas três densidades; o `CloseButton` de 40).
- `tests/visual/skin.spec.ts`: a medida no navegador (o círculo de 24 com o X de 16; a tecla de 24, em
  cápsula, sem borda, na fonte do texto).
- O check 36 do `validate.py` (o alvo nativo dos tokens não fica para trás).
