# ADR-0086 — Os acabamentos: o brilho, o fio e o `blurred` que lê

- **Data:** 28/10/2026
- **Estado:** aceita · na branch `claude/acabamentos`, para a `0.48.0` — o brilho e o fio na web e no nativo; o `blurred`
  só na web.
- **Origem:** os três acabamentos que a proposta de cores do Victor (25 e 26/10/2026) deixou de fora de propósito — a
  borda suave, o brilho no botão e o menu translúcido (o laboratório da proposta, "Acabamentos"). O Victor pediu para
  vê-los (*"quero ver na bancada, e se possível não alterar componente e sim entrar como novas variações"*), viu os três
  na bancada, nos dois temas e nas treze marcas, e decidiu: *"Pode os três"* (28/10/2026), com o menu como **correção** do
  `blurred` que já existia, o menu só na web e, no lote, só o registro da 0.47.0 junto. O porquê dele: *"dá mais
  propriedade sobre o nome UDS da Aurea; limitar ela deixa ela como um capricho meu"*.

## O que se mediu

- **A referência não tem nenhum dos três** (lido no pacote de estilos dela, 3.2.6): nem sombra colorida no botão, nem
  barra translúcida com cor, nem contorno no selo. Pela regra da ordem das fontes (CLAUDE.md, seção 2), quando ela não
  tem, a solução própria vai ao Victor — e foi.
- **O `blurred` de hoje reprova a leitura.** Desde a 0.33.0 ele é TRANSPARENTE com desfoque (o desfoque de 16 da
  referência). Medido na bancada, no pior caso — a letra da barra direto sobre a cor cheia que passa por baixo: **1,83:1**
  sobre o amarelo no escuro, **3,28:1** sobre o vermelho no claro, **2,98:1** sobre o laranja no escuro. Com o fundo do
  cartão a 72% (a proposta), o pior caso é **9,19:1**.
- **O Windows do Victor está com "Efeitos de transparência" desligado** (`EnableTransparency = 0`, lido no registro do
  Windows): o navegador diz "reduzir transparência" (`prefers-reduced-transparency: reduce`), e a Aurea já respeitava —
  a barra sai cheia. A bancada teve uma chave para forçar o efeito, para ele avaliar.

## A regra

1. **O brilho — `glow`.** No botão principal (`.btn-primary` na web; `appearance="solid" tone="brand"` no nativo), uma
   sombra difusa embaixo, na cor dele a 40%: 4 para baixo e 14 de desfoque (`--space-1` e `--space-3` + `--space-05`; no
   nativo, `space1` e `space3 + space05` — o 14 da proposta, sem número inventado). O foco continua o anel, e o brilho fica: na web, a
   regra tem mais força que o `:focus-visible` geral, que zera a sombra (repetir o brilho numa regra de foco, o check 44
   reprova). Desativado, não brilha. No `Button` e no `IconButton`, nos dois alvos, e no `ToolbarButton` da web, que é um
   `Button`.
2. **O fio — `ring`.** Em volta do fundo suave, o tom a 30%, POR DENTRO (uma largura de borda; no nativo, o
   `aroDoEstilo`): nunca muda a medida. Na web, no selo que não é cheio e no botão `soft` ou de contorno; no nativo, no
   selo que não é cheio e no botão `outline` (que no "sem linha" é o tom a 16%). O tom é o CHEIO (`--primary`,
   `--success`, `--destructive`, `--info`, `--warning`); sem tom, a cor da letra. No `Button`, no `IconButton` e no
   `Badge` (e no `Chip`, que é o `Badge`), nos dois alvos, e no `ToolbarButton` da web.
   - **É linha:** exceção nomeada à [ADR-0072](0072-sem-linha.md), como os estilos de aro da
     [ADR-0084](0084-os-estilos-novos-e-as-duas-excecoes.md) — só existe quando o app escolhe, e só como sombra por
     dentro, nunca borda. Fica abaixo de 3:1 de propósito: é acabamento; quem separa a peça do fundo continua sendo o
     fundo dela.
3. **O atributo:** cada prop escreve `data-glow` ou `data-ring` (`"true"` ou `"false"`) na peça. O mesmo atributo num
   contêiner, ou no `<html>`, vale para todas as de dentro; a peça com o seu atributo ganha do contêiner (`glow={false}`
   tira uma). O molde é o dos estilos do passo B (ADR-0084, item 6). No nativo, o mesmo atributo aparece no navegador (o
   `dataSet`); no aparelho, só a prop.
4. **Onde a prop não desenharia nunca, ela não existe:** a chave de tema (`ThemeToggle`), o botão de fechar
   (`CloseButton`) e, no nativo, o `LinkButton` não têm `glow` nem `ring`.
5. **O `blurred` lê** (correção, não variação — o Victor escolheu): o fundo é a cor do CARTÃO a 72%, com a cor de trás
   mais viva (`saturate(160%)`); o desfoque continua o de 16 da referência (`--space-4`; a proposta dizia 14, e 16 é o
   token que já existia). Sem desfoque no navegador, ou com "reduzir transparência", o cartão cheio. Só na web: o
   cabeçalho do nativo não tem `blurred`, e desfoque lá pediria uma biblioteca nova.

## Como é obrigada

- `tests/unit/acabamentos.test.tsx`: a prop escreve o atributo, as regras do core, o `blurred` corrigido, e o nativo
  (o brilho só no principal e não desativado, o fio no contorno, no `IconButton` e no selo que não é cheio). Provado
  contra o defeito: com o código da 0.47.0, reprovam 9 dos 11 (os 2 que passam são os de guarda).
- `tests/visual/acabamentos.spec.ts`: medido no site — o brilho e o fio onde se pedem, no contêiner, e fora com o `false`;
  o nativo no navegador; e a letra do `blurred` sobre a pior cor, nos dois temas, ≥ 4,5:1. Provado contra o defeito: com o
  CSS da 0.47.0, reprovam 4 dos 5 (o do nativo não depende do CSS).
- `tests/unit/sem-linha.test.tsx` e a varredura do catálogo: o `[data-ring="true"]` entrou na lista dos aros que o app
  escolhe; fora dele, o anel continua reprovando.

## As consequências, com os custos

- **A página inicial do site muda:** o topo dela é o `blurred` — passa de transparente ao cartão a 72%. As fotos `index` e
  `topo` vencem e voltam da CI.
- **Quem usa `blurred` vê a barra mais clara (no claro) ou mais clara que a página (no escuro)**, em vez de invisível —
  é o preço de a letra ler sobre qualquer conteúdo.
- **Mais uma exceção ao "sem linha"**, presa ao atributo que o app escolhe.
