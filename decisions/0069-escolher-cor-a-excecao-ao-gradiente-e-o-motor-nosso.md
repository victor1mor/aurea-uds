# ADR-0069 — Escolher cor: a única exceção ao gradiente, e o motor é nosso

- **Data:** 13/10/2026
- **Estado:** aceita · em construção na `0.32.0` (passo 12, a família de cor).
- **Origem:** as escolhas do Victor, de 13/10/2026: *"cor A com C como variação, data B, pode construir"*;
  *"área de cor como peça nova, ColorPicker componente"*; e, sobre o motor, *"Opção 1 — como o calendário"*.
- **Troca:** abre UMA exceção na [ADR-0007](0007-sem-gradientes.md) ("sem gradientes, nem os funcionais"), do
  jeito que ela mesma manda: *"entram como decisão nova aqui — não como exceção solta num componente"*.

## Contexto

A referência escolhe cor numa ÁREA (saturação × brilho, para um matiz) e numa TRILHA (o matiz), as duas
pintadas com gradiente. Ali o gradiente não é enfeite: ele É o dado — mostra, de uma vez, as cores que se pode
escolher. A Aurea proíbe gradiente, até o funcional (ADR-0007, decisão do Victor de 16/07/2026).

E o motor da Aurea (Base UI, [ADR-0004](0004-motor-headless-base-ui.md)) não tem nada de cor. A referência tira
a cor da biblioteca de acessibilidade em que se apoia.

## Alternativas

**Para a pintura** (mostradas rodando ao Victor na bancada, passo 12 · cor):

- **A · a exceção escrita, só para escolher cor.** Escolhida.
- **B · a mesma área e a mesma trilha em degraus** (blocos de cor lado a lado). Recusada: escolhe-se por
  degrau, e a cor exata fica só no campo do código.
- **C · só amostras e o campo do código.** Entra como VARIAÇÃO, para paleta fechada — não como a forma padrão.

**Para o motor:**

- **1 · nosso, como o calendário.** Escolhida. A trilha é o `Slider` da Aurea (Base UI); a área e as contas de
  cor são nossas. Segue a ADR-0004 (o que o Base UI não tem é feito por nós, como o `TreeView`) e o precedente
  do calendário, em que o segundo motor foi recusado.
- **2 · as peças de cor da biblioteca de acessibilidade da referência** (o pacote de cor dela, 3.2.1,
  Apache-2.0, sem alerta de segurança). Recusada: é o segundo motor que a Aurea já recusou, e a trilha deixaria de ser o
  `Slider` da Aurea.
- **Uma biblioteca só de conversão de cor.** Pesquisadas no registro do npm e na base de alertas do GitHub em
  13/10/2026: `colord` 2.10.0 (MIT, sem dependências; teve o alerta médio GHSA-2wm5-q62r-hmrv, corrigido na
  2.9.4) e `culori` 4.0.2 (MIT, sem dependências, sem alertas, de 27/06/2025). Não entram: as contas de hex,
  rgb, hsl e hsb são fórmulas curtas e padrão, e dependência nova pede o Victor ([`BUILDING.md`](../docs/BUILDING.md) §3).

## Decisão

- **A exceção é UMA, e estreita:** gradiente só para pintar **as cores que se escolhem** — o fundo da área de
  cor e a trilha de cor. Em nenhum outro lugar: nem superfície, nem botão, nem progresso, nem medidor.
- **E mora num arquivo só:** `packages/react/src/color.ts` (as contas e a pintura). O CSS do core continua com
  ZERO `gradient(`: a pintura chega pela variável que o componente põe, e a folha só a usa.
- **O motor é nosso.** As contas (hex ↔ rgb ↔ hsl ↔ hsb) não têm dependência. O nome da cor sai do matiz e da
  luminosidade do HSL (a claridade: "escuro", "claro") e da força do HSB ("vivo", "pálido", "acinzentado" — no
  HSL um tom pastel tem saturação 1 e sairia "vivo"; o teste prova). A
  área segue o DESENHO acessível da referência, lido no código da biblioteca dela: um grupo
  com DOIS `input type="range"` escondidos, um por eixo, anunciados como "2D slider", e o valor dito com o
  NOME da cor ("vivid red"), na língua do app — o nome é nosso, com as frases no `AureaStrings`.
- **As peças:** `ColorArea` (peça nova, autorizada pelo Victor); `ColorPicker` (componente); a trilha de cor
  como variação do `Slider`; as amostras para escolher como variação do `ColorSwatch`; o campo de cor como
  padrão do catálogo (`InputGroup` + `ColorSwatch`).
- **O valor é texto hex** (`#rrggbb`, como o `<input type="color">` do navegador), com `value`, `defaultValue`,
  `onValueChange` e `onValueCommitted` — o idioma das peças de entrada da Aurea web (`Slider`, `Select`,
  `NumberField`).
- **Na web.** O nativo fica para depois: o `Slider` e o `ColorSwatch` ainda não existem lá.

### A família inteira, como a referência (decisões do Victor, 14/10/2026)

Medido na documentação da referência (v3): seis peças de cor e 46 exemplos. A Aurea tinha cinco e mostrava nove.
O Victor: *"vamos ter todos os 6? e todos os seus exemplos são vários"*. Decidido:

- **`ColorField` é componente novo** — o campo de cor com a amostra na frente, que valida, edita um canal só e vai
  no formulário.
- **Todos os canais e espaços de cor, com transparência** (RGB, HSL, HSB e alfa) na área, na trilha e no campo.
  O valor continua hex; com transparência, o hex de oito dígitos (`#rrggbbaa`), que o CSS lê.
- **O xadrez entra, só onde há transparência** — é como se vê que a cor é transparente. Muda a decisão antiga do
  `ColorSwatch` ("sem o xadrez"); o xadrez é desenho de SVG, e não gradiente. **A forma quadrada não entra**: a
  amostra continua só redonda, identidade da Aurea.
- **A função `render` não entra** nas peças de cor: vale a M-01 (só no `Button`, no `IconButton` e nos itens de
  navegação).
- Os exemplos da referência entram todos no catálogo, menos os de `render` e os de forma quadrada.

## Como é obrigada

- **Check 4 do `validate.py`, estendido:** passa a varrer também o código dos componentes
  (`packages/react/src`), e `gradient(` só é aceito em `color.ts`. Antes, ele olhava só o CSS e o catálogo — um
  gradiente posto pelo código passaria calado.
- `tests/unit/color.test.tsx` (as contas, o nome da cor — o pastel não é "vivo" —, a tinta pelo contraste da
  WCAG), `color-area.test.tsx` (as teclas, o que o leitor de tela ouve, só um na ordem do Tab, o matiz no cinza,
  o anel só do teclado), `slider-hue.test.tsx`, `color-swatch-picker.test.tsx` (marcação pura, o visto pelo
  contraste) e `color-picker.test.tsx` (o código que volta, a trilha que mexe a área no cinza, as amostras com o
  nome da cor), e `color-field.test.tsx` (o código no Enter, o que não é cor volta, o vazio limpa, o canal como
  número, o alfa em por cento, o `Field` nomeando, marcando obrigatório e o erro). Cada um provado contra o defeito
  que ele cobra.
- `tests/visual/skin.spec.ts`, passo 12: as medidas da referência (área 224 e canto 16; pino 16 com anel 3;
  amostra de 32, borda 2, vão 8, 77%; o gatilho com o vão de 12; o `ColorField` na altura do `Input`, a amostra
  de 24 e o xadrez na cor transparente).
- `tests/visual/catalog-sweep.spec.ts`: o `ColorPicker` com o foco preso, o Esc que devolve o foco, e o anel só do
  teclado — com a PRIMEIRA abertura pelo mouse (a escuta começava tarde e o anel acendia; medido na bancada em
  14/10/2026).
- **Check 14 do `validate.py`**: os eixos da ficha (`channel`, `colorSpace`, `xChannel`, `yChannel`) têm de ser
  props do componente. Foi ele que mostrou que o leitor da API não via os ramos de `Base & (A | B)` (o `Slider` e
  o `ColorSwatch`), consertado no `build-api-surface.mjs`.

## Consequências

- Com o alto contraste do sistema ligado, o navegador apaga fundos — a área e a trilha somem. A escolha
  continua possível pelo teclado e pelo campo do código, que o `ColorPicker` sempre mostra.
- A família de cor cresce na web; o nativo e o canal de transparência (alfa) ficam abertos.
