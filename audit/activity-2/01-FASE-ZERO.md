# Fase Zero — a Aurea medida

> §8 da ordem: medir antes de comparar. Não confiar em número antigo, em memória, nem no
> documento da atividade. **O workspace atual é a verdade.**
>
> Medido em **21/08/2026**, contêiner Linux limpo, clone de `main` em `1531f7b`.

## 1. As ferramentas canônicas rodam

| Comando | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | OK |
| `pnpm build` | OK — 8 passos, do token ao `proof-client` |
| `python scripts/validate.py` | OK |
| `pnpm test` | OK — 8 arquivos, 203 testes |
| `node scripts/check-pack.mjs` | OK — contracts 4 · core 6 · fonts 16 · icons 5 · react 47 · tokens 5 |

`pnpm exec playwright test` roda depois de `pnpm exec playwright install chromium`: o contêiner
traz um build de Chromium diferente do que o projeto fixa. **Quatro screenshots reprovam**, e não
é defeito nem do contêiner: são as capturas que a Parte B mudou de propósito e que esperam a
regeneração das `-linux.png` pela CI desde 06/08/2026 — está declarado no
[`PLANO-1.0.md`](../../docs/PLANO-1.0.md) §5. Ver `00-STATUS.md`.

## 2. Os números

Os do projeto estão no [`STATE.md`](../../STATE.md), que é **gerado** e gateado pelo check 13 —
não se copia número dele para cá. O que a Fase Zero acrescenta é a medição que **não existia**:
a API pública real.

```bash
node scripts/build-api-surface.mjs         # escreve packages/contracts/api-surface.json
```

> O extrator nasceu aqui como `measure-api.mjs` e **virou passo de build** quando o `G-REG-02`
> fechou: o check 14 do validador passou a depender dele, e o artefato passou a embarcar em
> `@aurea-uds/contracts`.

Ela lê a **emissão de declaração do `tsc`**, não o registry. Em 21/08/2026:

| Medida | Valor |
|---|---|
| Componentes exportados | 76 |
| Módulos (subpaths) | 22 |
| Hooks públicos | 3 |
| Nomes de prop distintos em toda a biblioteca | 96 |

O conjunto de 76 é **idêntico** ao conjunto das 76 fichas de registry — nem sobra nem falta um
nome. Isso valida o extrator contra uma fonte independente antes de ele ser usado para acusar
alguém.

## 3. O que a medição achou

### F0-1 — o `STATE.md` contava dois contextos React como componentes · **FECHADO**

`project_state()` publicava `len(exported)`, e `exported` é todo export em PascalCase do pacote.
Dois deles são `StringsContext` e `SpriteContext` — e a allowlist `NAO_COMPONENTE`, dez linhas
acima do check 11, já declarava que não são componentes. O check 11 subtraía; o número não.

Publicava **78 onde o pacote tem 76**, no `STATE.md`, no bloco do README e no `manifest.json`.

Passou porque o número era *gerado*: o check 13 provava que a documentação não mentia sobre a
medição, e ninguém provava que a medição não mentia sobre o pacote.

**Trava:** o check 11 já exige `exported - NAO_COMPONENTE == fichas` como conjunto, logo os dois
números publicados têm de ser o mesmo número. O validador reprova se divergirem. Provada contra
o defeito — com `len(exported)` de volta, falha com `componentes (78) != fichas (76)`.

Commit `43938f1`.

### F0-2 — sete fichas declaram capacidade que a API não tem · **ver `03-GAPS.md`**

Cruzando ficha × compilador × CSS do core:

| Ficha | Declara | API real | CSS do core |
|---|---|---|---|
| `Input` | `sizes: sm/md/lg` | sem prop `size` | sem modificador |
| `Select` | `sizes: sm/md/lg` | sem prop `size` | sem modificador |
| `Textarea` | `sizes: sm/md/lg` | sem prop `size` | sem modificador |
| `SearchField` | `sizes: sm/md/lg` | sem prop `size` | sem modificador |
| `Combobox` | `sizes: sm/md/lg` | sem prop `size` | sem modificador |
| `Drawer` | `variants: left/right` | prop existe, chama-se `side` | `.drawer-left` / `.drawer-right` |
| `ToolbarButton` | `variants: neutral/primary/ghost` | herda as 11 de `ButtonVariant` | — |

São **dois defeitos diferentes**, e confundi-los seria corrigir o errado:

- **Capacidade ausente** (os cinco campos): `.input,.textarea,.select` fixam
  `height:var(--control-h-md)` e não têm modificador nenhum. Os tokens `--control-h-xs…xl`
  existem e o botão já os usa (`.btn-sm`, `.btn-lg`, `.btn-xl`). O campo ficou para trás.
  Todas as referências têm campo com tamanho. → gap `G-FORM-01`.
- **Ficha errada** (`Drawer`, `ToolbarButton`): a capacidade existe, a ficha a descreve mal.
  `ToolbarButton` chega a declarar `neutral`, que **não é** um `ButtonVariant`. → gap `G-REG-01`.

### F0-3 — o registry é escrito à mão e ninguém o confronta com o compilador · **sistêmico**

F0-2 só foi encontrado porque a Fase Zero extraiu a API. Nenhum gate compara ficha com tipo:
o check 11 compara **nomes** de componente, e o check 15/18 só alcança uniões declaradas como
`export type <X>Variant`. `variants`, `sizes`, `states` e `props` da ficha nunca foram
confrontados com o que o `tsc` emitiu.

É o gap sistêmico do §97: 33 fichas sem contrato de API publicado (o achado M8, Parte E do
`PLANO-1.0`) não se fecham escrevendo 33 fichas à mão — se fecham **derivando** do compilador,
que é o §118 (self-documenting) e o §119 (self-validating). → gap `G-REG-02`.

## 4. O que ficou provado sobre o instrumental

- **O extrator erra para menos, não para mais, quando não entende um tipo.** A primeira
  versão acusou `Banner` e `IconButton` de fichas erradas; os dois eram limitação do extrator
  (alias em cadeia `BannerVariant = AlertVariant`, e herança por `Omit<ButtonProps,…>`). Corrigido
  antes de qualquer acusação virar achado. **Nenhum gap desta pasta foi aberto sem conferir a
  fonte.**
- O extrator não usa a API programática do TypeScript de propósito: ela não é estável até a 7.1
  (`CLAUDE.md`, Toolchain). Lê a emissão de declaração, que é regular o bastante.
