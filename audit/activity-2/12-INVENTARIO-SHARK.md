# Inventário do §9 — `shark-ui` (`Referencia/shark-ui-main`)

> Oitava das nove. Está no quadro por duas coisas que **só ela** tem.
>
> ```bash
> node audit/activity-2/inventory-shark.mjs   # escreve INVENTORY-SHARK.json
> ```
>
> `shark-ui @ 1261047` · MIT · medido em 21/08/2026.

## 1. Um quinto motor, e o oitavo formato

Ela roda sobre **`@ark-ui/react`** — 91 dos 95 componentes. O quadro de motores headless fecha em
cinco: Base UI (a aposta da Aurea), Radix, react-aria, o próprio da MUI, e o Ark.

E declara a superfície num oitavo formato: **módulo TypeScript por componente**, exportando um
objeto `RegistryItemType`. Não é JSON como o shadcn, nem `package.json` como o kibo, nem prosa como
o reui — é código tipado, o que quer dizer que **o manifesto é conferido pelo compilador**. É a
única fonte do quadro em que "o manifesto mentiu" é um erro de build.

| | |
|---|---|
| Manifestos | 101 |
| Com fonte | 95 |
| Sobre Ark UI | 91 |
| Com exemplo | 94 |
| **Composições** (`examples/<nome>/*.tsx`) | **801** |
| Estados `data-*` distintos | **41** |
| Templates | 9 |

**`G-COMP-01`, quarta medição independente:** 801 composições em 95 componentes = **8,4 por
componente**, contra 0,86 da Aurea. Quatro fontes, quatro métodos, mesma conclusão.

## 2. O dado exclusivo: quantos tokens um componente pode trazer

Nenhuma das outras sete declara **os próprios tokens** por componente. Esta declara, em `cssVars`,
e junto as próprias `@keyframes` em `css`. Então dá para medir uma coisa que a Aurea decide no
escuro toda vez que um componente precisa de um valor novo: **de quem é o token?**

Medido: **5 componentes em 95** trazem token próprio. Nove tokens no total, e **todos os nove são
de animação**:

| Componente | Tokens |
|---|---|
| `accordion` | `--animate-slide-up`, `--animate-slide-down` |
| `collapsible` | `--animate-expand`, `--animate-collapse` |
| `marquee` | `--animate-marquee-x`, `--animate-marquee-y` |
| `progress` | `--animate-indeterminate` |
| `swap` | `--animate-flip-in`, `--animate-flip-out` |

**95% dos componentes não introduzem token nenhum**, e a exceção tem explicação: uma `@keyframes`
não sai de uma escala de cor ou de espaço — ela é comportamento, não valor. É uma validação externa
do princípio `semantic-tokens-only` que o `aurea.tokens.json` declara no `$extensions`, e o número
para defendê-lo: se um componente da Aurea pedir token novo que **não** seja de animação, o ônus da
prova é dele.

## 3. O achado que não estava na lista: falta o link de pular conteúdo

Apareceu ao verificar se `skip-nav` era gap. É, e é **falha de nível A**.

O WCAG 2.2 SC 2.4.1 (*Bypass Blocks*) pede um caminho para saltar a navegação repetida. Medido:

| Onde | Tem? |
|---|---|
| `apps/docs/index.html` | **sim** — `.skip-link` escrito à mão, com CSS próprio e rótulo em português |
| `packages/core/src/aurea.css` | **não** — zero ocorrências |
| `packages/react` (`AppShell`, que é dono do `<main>`) | **não** |
| `apps/catalog` — as 200 páginas | **não** |

A página de demonstração é acessível; o componente que o consumidor instala não é. Todo aplicativo
construído sobre o `AppShell` nasce reprovando um critério de **nível A** — o mais básico — e o
catálogo da própria Aurea reprova em 200 páginas. Ver `G-A11Y-03`.

## 4. Nome não é capacidade, quarta vez

54 dos 95 não existem aqui por nome, e a maioria é o mesmo de sempre (`alert-dialog`→`Dialog`,
`native-select`→`Select`, `slider`→`Range`, `toast`→`useToast`, `radio-group`→`Radio`,
`sheet`→`Drawer`, `steps`→`Stepper`, `number-input`→`NumberField`, `tags-input`→`MultiCombobox`).

Vale registrar que boa parte do resto são **utilitários do Ark**, não componentes visuais:
`client-only`, `show`, `presence`, `format`, `locale`, `float`. Contá-los como capacidade ausente
seria comparar uma biblioteca de componentes com um runtime.

Os que sobram como capacidade de verdade e ainda não estavam na fila: `signature-pad`,
`image-cropper`, `json-tree-view`, `clipboard`, `editable`, `tour`, `timer`, `hitbox`, `swap`.

## 5. O limite deste inventário

Seis manifestos não têm fonte (`hitbox`, `rating-group`, `style`, `ui`, `use-is-mobile`, `utils`) —
três são infra (`style`, `ui`, `utils`), um é hook e dois são `INCONCLUSIVO`. Registrados, não
omitidos.
