# ADR-0068 — O `DatePicker` da web é componente

- **Data:** 13/10/2026
- **Estado:** aceita · em construção na `0.32.0` (passo 12, a família de data).
- **Origem:** a escolha do Victor, de 13/10/2026, entre manter o seletor de data como padrão do catálogo (A) ou
  fazer dele um componente (B): *"data B, pode construir"*.
- **Troca:** a frase do topo de `packages/react/src/calendar.tsx` que dizia que o `DatePicker` NÃO se constrói
  ("seletor de data é composição de Popover com calendário… registrada como PATTERN"). O padrão do catálogo
  (`Calendar · Date picker`) continua, como exemplo de composição; o componente passa a existir ao lado.
- **A razão nova** (a regra "decisão registrada não se reabre sem evidência nova"): a frase antiga se apoiava
  numa referência que não tem a peça. A referência principal tem (o seletor de data, o de intervalo, o campo
  de data e o de hora), o nativo da Aurea já tem um `DatePicker`, e quase todo sistema do mercado entrega o
  seletor de data como componente.

## Alternativas

- **A · ficar padrão** (a composição `Popover` + `Calendar` montada por cada app). Rejeitada: cada app refaz o
  foco, a janela, o fechar ao escolher e a leitura da data, e cada um sai diferente — o contrário do que um
  sistema de desenho entrega. E o nome existiria só de um lado (o nativo tem a peça).
- **Uma peça por forma, como a referência** (`DatePicker` e `DateRangePicker`). Rejeitada pela regra do
  Victor (07/10/2026 e 13/10/2026): o novo entra como VARIAÇÃO. O intervalo é `range`, no mesmo componente.
- **O campo de data por partes** (dia, mês e ano digitados em pedaços, como o da referência). Fica para
  depois, por decisão do Victor: primeiro o gatilho comum mais o calendário.

## Decisão

- O `DatePicker` da web tem o **mesmo nome e as mesmas props** do nativo (`value`, `onChange`, `minimumDate`,
  `maximumDate`, `disabled`, `size`, `format`, `placeholder`, `icon`), mais `range` (o intervalo), `name`
  (o valor no formulário) e `defaultValue`.
- Mora em `@aurea-uds/react/calendar`, ao lado do `Calendar`: o motor de calendário é dependência opcional, e
  só este caminho o puxa.
- **O gatilho é o campo do `Select`** com o calendário no lugar da seta (`.date-picker-trigger`); a janela é o
  `.popover` com o `Calendar` dentro (`.date-picker-popover`). Nenhuma pele nova além dessas duas regras.
- **Fechar ao escolher:** a data única fecha no clique; o intervalo, no segundo clique de cada abertura. **Cada
  abertura começa um intervalo novo** — o do motor estendia o que já existia (com 1 a 3 escolhido, clicar 15 e
  20 dava 1 a 20).
- **O formulário recebe a data LOCAL** (`aaaa-mm-dd`; o intervalo, `aaaa-mm-dd/aaaa-mm-dd`, o intervalo da
  ISO 8601) — `toISOString` passa por UTC e, à noite no Brasil, daria o dia seguinte.
- **O `Field` nomeia o gatilho:** como o `DatePicker` mora fora do pacote principal, ele se registra numa lista
  interna (`controlesRotulaveis`) que o `Field` consulta, sem importar o motor do calendário.
- **A janela APONTA para o rótulo do campo** (`aria-labelledby`), escolha do Victor (13/10/2026: *"quero
  soluções que eu não precise refazer e/ou sejam melhores práticas de mercado"*). É o que faz a biblioteca de
  acessibilidade em que a referência se apoia: o rótulo tem `for` E `id`, e a janela aponta para o `id`. A
  referência em si (3.2.6) monta a janela SEM o diálogo, e ela sai sem nome — não seguimos esse ponto, porque
  janela sem nome é o que o axe reprova. Para isso o `<label>` do `Field` ganhou `id`; o `DatePicker` o acha ao
  abrir pela ligação do navegador (`labels`). Sem rótulo, o `aria-label` do campo ou a frase de escolher.
- **A língua é o `locale`**, escolha do Victor (13/10/2026): o objeto do motor (`react-day-picker/locale`), o
  mesmo que o `Calendar` recebe, e o campo e o calendário mudam juntos — é como se usa o motor no mercado. Sem
  ele, inglês, o padrão do motor e o da referência no servidor. **Nunca a língua do ambiente**: medido no
  catálogo, o Node em pt-BR escrevia "12 de ago. de 2026", o navegador "Aug 12, 2026", e o React descartava a
  hidratação (erro 418). A referência troca para a língua do navegador DEPOIS de carregar; não seguimos esse
  ponto, porque o texto pula na tela depois de aparecer. O texto da data leva `lang` com a língua dela. O
  nativo segue com o formato do aparelho (lá não há servidor). **Fica para depois:** a língua num lugar só,
  para o app inteiro (como o provedor de língua da referência) — acrescenta, e a prop continua valendo.
- Duas frases novas na web: `datePlaceholder` (o mesmo nome do nativo) e `dateRangePlaceholder`.

## Como é obrigada

- `tests/unit/datepicker-web.test.tsx`: o texto vazio pela língua, o fechar ao escolher, o intervalo novo a
  cada abertura (provado contra o do motor), o valor do formulário pela data local, os limites, o nome pelo
  `Field` (provado sem o registro), a janela que aponta para o rótulo do `Field` (provado: sem o `id` no
  rótulo ela saía "Pick a date"), o `locale` no campo e no calendário juntos (provado tirando de cada um), o
  formato padrão fixo (um dublê faz o ambiente "falar português"; o defeito antigo reprova em qualquer
  máquina) e o axe fechado e aberto (que achou a janela sem nome).
- `tests/visual/catalog-sweep.spec.ts`, "console limpo": pegou o erro de hidratação nas três páginas do
  `DatePicker`.
- `tests/visual/catalog-sweep.spec.ts`, nos três navegadores: o gatilho sem a seta, o calendário que abre com o
  foco num dia e com o nome do campo, e o Esc que devolve o foco.

## Consequências

- A família de data fica com um componente a mais na web; o campo por partes e o de hora ficam abertos.
- O padrão `Calendar · Date picker` do catálogo continua, e o texto dele precisa apontar para o componente.

## Revisão

Quando entrar o campo de data por partes (o par do `DateField` da referência), rever se ele vira variação do
`DatePicker` ou do `Input`.
