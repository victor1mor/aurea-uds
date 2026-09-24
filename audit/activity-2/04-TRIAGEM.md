# Triagem — o que as nove referências têm e a Aurea não

> **Isto não é a matriz do §13.** O §15 é explícito: ter um componente com o mesmo nome **não**
> fecha o gap, e a comparação tem de ser por capacidade (`Table / column pinning`), não por nome.
> O que está aqui é a triagem mecânica que separa "não existe de jeito nenhum" de "existe e falta
> comparar a fundo". É o que torna a comparação profunda possível sem amostragem — não a
> comparação.
>
> Medido em **21/08/2026**:
>
> ```bash
> node audit/activity-2/inventory.mjs   # enumera as nove, escreve INVENTORY.json
> node audit/activity-2/crossref.mjs    # cruza com a Aurea, escreve CROSSREF.json
> ```

## 1. Como a enumeração foi feita, e por que não é amostra

O §10 proíbe "analisei os mais importantes". Então nada foi lido por amostra: cada referência foi
**enumerada** a partir da fonte de verdade dela, que é diferente em cada projeto e está declarada
no campo `fonteDeVerdade` do `INVENTORY.json`.

Achar a fonte certa foi metade do trabalho, e é o §11 na prática:

> O `components/ui/` do ReUI tem 28 arquivos. O `components/` do Shark UI tem 20. **Os dois são o
> chrome do site de documentação, não a biblioteca.** A biblioteca do ReUI mora em
> `registry-reui/bases/base/`; a do Shark, em `registry/`. Tomar o índice pelo produto teria
> subestimado as duas em mais de três vezes.

## 2. O resultado da triagem

| | |
|---|---|
| Itens enumerados nas nove referências + Aurea | `INVENTORY.json` → `totais` |
| Nomes distintos depois de canonizar sinônimos e tirar ruído | 431 |
| Sem nada de nome parecido na Aurea | 372 |
| Existem dos dois lados e **faltam comparar** | 59 |
| Só na Aurea | 21 |

> Os números caem conforme os gaps fecham: começaram em 376/55 e são 372/59 depois de
> `Separator`, `Collapsible`, `ToggleGroup` e `Menubar`. Rode os dois comandos acima para ter o
> de hoje — este é o de 21/08/2026.

Os 372 **não são 372 gaps**. São candidatos. Um nome só vira gap depois de passar pela
verificação da §3 — e a §4 mostra por que essa verificação não é formalidade.

## 3. Os candidatos com mais lastro, verificados um a um

Verificação: para cada candidato, procurar nas **três** fontes da Aurea — nome de ficha, símbolo
exportado (via `api-surface.json`) e classe do core. Só depois classificar.

### Ausente de verdade — nada nas três fontes

~~`collapsible`~~ · `scroll-area` · `aspect-ratio` · `carousel` · `form` · ~~`menubar`~~ ·
`navigation-menu` · `rating` · `resizable` · `announcement` · `bottom-nav` · `color-picker` ·
`gantt` · `kanban` · `marquee` · `tags` · `typography` · `locale`

Riscados: fechados em 21/08/2026 — ver [`03-GAPS.md`](03-GAPS.md).

### Ausente, e o vizinho mais próximo não é substituto

| Candidato | O que a Aurea tem | Por que não fecha |
|---|---|---|
| `chip` | `.combobox-chip` | é o chip **dentro do combobox**, com remoção acoplada ao valor. Chip solto é outro componente |
| ~~`separator`~~ | `ToolbarSeparator` | separava itens **de barra**. **Fechado em 21/08**: a linha do sistema passou a morar num lugar só |
| `progress-circle` | `Progress` | é a barra linear. O anel é outra anatomia |
| `input-group` | `.input-wrap` | posiciona **um glifo**. Grupo de campo com prefixo, sufixo e botão acoplado é outra coisa |
| `label` | `.label` dentro do `Field` | não há rótulo avulso para quem não usa `Field` |
| `list` | `DataList`, `MessageList` | as duas são listas **de um domínio**. Lista genérica não existe |
| `date-picker` | `Calendar` | **este é o exemplo do §15 na íntegra.** `Calendar` é a grade do mês; seletor de data é campo + popover + grade + máscara + locale. Ter um não dá o outro |

### Existe com outro nome — `A_COMPARAR`, não gap

| Candidato | O que é na Aurea |
|---|---|
| `command` | `CommandPaletteShell`, com `.command`, `.command-overlay`, `.command-palette` |
| `alert-dialog` | `Dialog` — **falta comparar** se cobre `role="alertdialog"`, que é o ponto do componente |
| ~~`toggle-group`~~ | **Fechado em 21/08**: `ToggleGroup` com `multiple`, que era o que faltava |
| `slider` | `Range`, que é `<input type="range">` |
| `otp-field` | `OTPField` |
| `native-select` | `Select`, que é o `<select>` nativo |

### Existe, funciona, e **não está declarado em lugar nenhum** — `AUREA_PARCIAL`

**`toast`.** A Aurea tem toast: `useToast` é exportado, o `AureaProvider` monta a lista, o core
tem `.toast-stack` e **três receitas do catálogo usam**. Mas não há ficha de registry, não há
componente exportado e não há página no catálogo. Quem navega o catálogo não descobre que existe.

Não é capacidade ausente — é capacidade **invisível**, e o §52 ("a documentação deve permitir que
uma IA descubra o componente") e o §108 a cobram como defeito. → `G-DOC-01`.

## 4. Três falsos ausentes que a triagem produziu, e o que cada um ensinou

Nenhum destes virou gap. Todos foram pegos ao conferir na fonte, que é a regra que o
[`00-STATUS.md`](00-STATUS.md) registra desde a Fase Zero.

1. **`OTPField` e `QRCode` apareciam como ausentes.** A canonização de nome quebrava em acrônimo:
   `OTPField` virava `otpfield`, que não casa com o `input-otp` do shadcn nem com o `qr-code` do
   Kibo. Corrigido no `inventory.mjs` com uma regra a mais para `MAIÚSCULAS+Palavra`.
2. **`slider` e `native-select` apareciam como ausentes.** São o `Range` e o `Select` da Aurea.
   Entraram na lista de sinônimos — que é curta de propósito: casar nome demais **inventa**
   paridade, que é o erro que o §15 descreve.
3. **`chip` apareceu como PRESENTE.** Meu próprio script de verificação leu `.chip` de um
   **comentário** do CSS. É exatamente o defeito que o `validate.py` já tinha corrigido no check
   15 em 2026 ("comentário não produz classe") e que eu reintroduzi num script novo. A capacidade
   não existe.

O saldo: **a triagem por nome erra nas duas direções.** Por isso ela não decide nada sozinha, e
por isso a §3 existe.

## 5. O que isto ainda não é

- **Não é a matriz do §13.** Falta a linha por capacidade — `Select / searchable`,
  `Table / column pinning`, `Upload / resumable`. A triagem opera no nível do nome do componente;
  a matriz opera abaixo dele, e é onde o §15 diz que a comparação de verdade acontece.
- **Não cobre as fontes externas.** As oito do §3 seguem `PENDING` no
  [`02-FONTES.md`](02-FONTES.md). O que foi enumerado é o **código** de nove projetos, não a
  documentação de nenhum — e o §11 avisa que a documentação traz o que o código não mostra:
  variantes documentadas, exemplos, guias, blocos.
- **Não classificou a maioria.** Só os de maior lastro foram verificados um a um. O resto está no
  `CROSSREF.json` esperando a mesma verificação.
