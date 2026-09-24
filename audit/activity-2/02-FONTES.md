# Cobertura das fontes

> §89 e §90 da ordem. `COMPLETE` não se declara com área relevante desconhecida, e a meta local
> é `PENDENTES = 0`.
>
> Estado em **21/08/2026**.

## 1. A `Referencia/` neste contêiner

`Referencia/` está no `.gitignore` (o motivo está escrito lá: 301 MB de código de terceiro que
serve para estudar, e a [ADR-0010](../../decisions/) prevê tornar o repositório público). Ela
mora na máquina do Victor e **não vem no clone**.

Este contêiner é efêmero e começou sem ela. Reconstruída por clone raso das origens públicas —
todas são repositórios públicos, e o `BUILDING.md` §1 já registrava quais eram as sete:

```bash
# reproduz a pasta neste contêiner (1,2 GB)
git clone --depth 1 <url> Referencia/<pasta-externa>/<pasta-interna>
```

O `BUILDING.md` avisa que seis têm o conteúdo **um nível abaixo** (`ui-main/ui-main/…`) e a MUI
não — o clone reproduziu essa forma de propósito, para o caminho documentado continuar valendo.

| Pasta | Projeto | Commit | Data | Versão | Licença |
|---|---|---|---|---|---|
| `base-ui-master/base-ui-master` | mui/base-ui | `838b084` | 2026-08-20 | 1.7.0 | MIT |
| `ui-main/ui-main` | shadcn-ui/ui | `4e88ab8` | 2026-08-20 | — | MIT |
| `react-main/react-main` | untitleduico/react | `548c28a` | 2026-08-04 | — | MIT |
| `kibo-main/kibo-main` | haydenbleasel/kibo | `3d63cdb` | 2026-05-04 | 1.1.5 | MIT |
| `reui-main/reui-main` | keenthemes/reui | `0daf79d` | 2026-08-20 | 2.3.0 | MIT |
| `media-chrome-main/media-chrome-main` | muxinc/media-chrome | `c624760` | 2026-07-01 | 4.19.2 | MIT |
| `material-ui-master` | mui/material-ui | `f76d14a5` | 2026-08-20 | 9.3.1 | MIT |
| `radix-primitives-main/radix-primitives-main` | radix-ui/primitives | `f7ecd5a` | 2026-07-31 | — | MIT |
| `shark-ui-main/shark-ui-main` | sharkui-inc/shark-ui | `1261047` | 2026-08-20 | — | MIT |

As duas últimas **não estavam na `Referencia/` do Victor**: são fontes obrigatórias do §3 sem
contrapartida local, clonadas em 21/08/2026. O `BUILDING.md` §1 fala em sete referências; com
elas são **nove**. Quando o `BUILDING.md` for atualizado, é isto que muda lá.

**Licenças reverificadas nestes commits em 21/08/2026: as nove são MIT.** Confirma o que o
`BUILDING.md` §1 registrou em 02/08/2026. `kibo` traz o texto MIT em `license.md` sem o título e
sem campo `license` no `package.json` — conferido pelo corpo, não pelo metadado.

> **Aviso ao Victor:** a versão dele em disco pode estar em commit anterior. Onde um número deste
> repositório citar uma referência, o commit acima é o que foi lido.

### Prova de cobertura local (§90)

| | |
|---|---|
| Projetos encontrados | 9 |
| Projetos classificados | 9 |
| Projetos com licença verificada | 9 |
| Projetos com a **superfície pública enumerada** | 9 |
| Projetos **inventariados a fundo** (§9: anatomia, estados, teclado, props, ARIA por item) | 0 |
| Projetos pendentes | **9** |

**Dois níveis diferentes, e confundi-los seria declarar `COMPLETE` cedo demais.**

A **enumeração** está feita para as nove: `node audit/activity-2/inventory.mjs` lista a superfície
pública inteira de cada uma, a partir da fonte de verdade declarada por projeto, sem amostra. É o
que a triagem do [`04-TRIAGEM.md`](04-TRIAGEM.md) consome.

O **inventário do §9** — o formulário de trinta e poucos campos por item, com anatomia, estados,
teclado, foco, ARIA, composição, RTL, i18n, motion — **não começou para nenhuma**. Enumerar diz
*o que existe*; o §9 pede *o que cada coisa é*. Só o segundo fecha uma fonte.

Leituras dirigidas já feitas, para não repetir:

| Referência | O que foi lido | Para quê |
|---|---|---|
| `react-main` | `components/base/input/input.tsx`, `select`, `textarea` | tamanho de campo — `G-FORM-01` |
| `ui-main` | `apps/v4/registry/bases/{aria,base}/ui/input.tsx` | idem |
| `material-ui-master` | `InputBase`, `OutlinedInput` (grep de `size`) | idem |

## 2. As fontes externas obrigatórias (§3)

| Fonte | Site | Alcançável daqui | Status |
|---|---|---|---|
| Untitled UI | untitledui.com | sim (200) | **inventariada** 22/08 — código local + **79 páginas da web** ([`22`](22-INVENTARIO-DOCS.md)). O pacote npm é só a CLI, e isso era verdade sobre o **npm**: no registro virou a conclusão errada de que a fonte não dava para inventariar |
| HeroUI | heroui.com | sim (200) | **INVENTARIADA** em 22/08/2026 — [`15`](15-INVENTARIO-HEROUI.md), pelo CÓDIGO (`npm pack`), não pelo site |
| MUI | mui.com | sim (200) | **inventariada** 22/08 — código local + **60 páginas de documentação** ([`22`](22-INVENTARIO-DOCS.md)) |
| Radix UI (primitives) | radix-ui.com | — | inventariada em [`06`](06-INVENTARIO-RADIX.md) (código local, 21/08) |
| Radix **Themes** (camada estilizada) | radix-ui.com/themes | — | **INVENTARIADA** em 22/08/2026 — [`16`](16-INVENTARIO-RADIX-THEMES.md). É fonte SEPARADA: os primitives não têm aparência nenhuma |
| ReUI | reui.io | sim (200) | **inventariada** 26/08 — código + **23 páginas** de documentação ([`22`](22-INVENTARIO-DOCS.md)). O padrão é `/docs/components/base/<slug>`, com a família no caminho |
| Shark UI | shark.vini.one | sim (200) | **inventariada** 26/08 — código (clonado em 21/08) + **86 páginas** de documentação ([`22`](22-INVENTARIO-DOCS.md)) |
| shadcn/ui | ui.shadcn.com | sim (200) | **inventariada** 22/08 — código local + **67 páginas de documentação** ([`22`](22-INVENTARIO-DOCS.md)) |
| 21st.dev | 21st.dev/community/components | sim (200) | 🛑 **COLETA CONGELADA** por decisão do Victor (22/08) — ver o bloco abaixo. As 76 páginas já lidas ficam onde estão e não foram usadas em nada |

**Nenhuma FONTE foi inventariada, e nada aqui pode ser declarado `COMPLETE`.** O que existe é o
código de sete delas enumerado (§1 acima) — e código não é fonte: o §11 avisa que a documentação
traz o que o código não mostra, a começar por variante documentada, exemplo, guia e bloco.

Duas eram fontes obrigatórias **sem contrapartida local**, e deixaram de ser: Radix UI e Shark UI
foram clonadas em 21/08. Radix importa porque é a origem do headless que o ecossistema copiou, e
a Aurea usa Base UI, que veio da MUI — a comparação de *primitives* passa por ela.

Sem contrapartida de código continuam **HeroUI** e **21st.dev**. A HeroUI é biblioteca publicada
e clonável; a 21st.dev é um diretório de comunidade, onde a licença se avalia item a item (§192)
e o `directory.json` do shadcn — 288 registries de terceiros — é o mapa mais próximo que existe
no material local.

### O que a rede deste contêiner permite

Medido em 21/08/2026: `git clone` sobre HTTPS funciona; `curl` a `github.com/<owner>/<repo>`
devolve **403** pelo proxy, mas os sites de documentação respondem 200. Ou seja: **clonar
referência funciona, raspar a página do GitHub não.** O inventário de fonte externa se faz pela
documentação pública e pelo código clonado.

---

## 21st.dev — coleta CONGELADA (22/08/2026)

**Decisão do Victor:** *"não continue coleta automatizada dessa fonte até revisar e registrar as
restrições de uso/termos dela. Não quero que cobertura de benchmark crie problema jurídico ou de
licença."*

A 21st.dev é diferente das outras onze referências, e a diferença é de natureza: elas são
bibliotecas com **uma** licença de projeto, declarada no repositório; ela é um **diretório de
comunidade**, em que cada item tem autor e licença próprios. O §192 já mandava avaliar item a
item — o risco novo é a **coleta em massa** virar base de comparação antes de alguém ler os
termos.

**Estado:** `INVENTORY-DOCS-21ST.json` tem 76 páginas de índice, lidas em 22/08 **antes** da
decisão. Nada dali entrou em código, em desenho ou na matriz.

**O que destrava, nesta ordem:** (1) ler e **registrar** os Termos de Uso e a política de conteúdo
quanto a raspagem, uso automatizado e reuso de código de terceiros; (2) registrar a licença **por
item** de qualquer componente citado; (3) só então decidir se a fonte entra na matriz, e com que
restrição.

**Enquanto isso: nenhuma requisição automatizada nova.**

## A contagem canônica das referências

Os documentos falavam ora em "cinco fontes", ora em "seis", ora em "sete externas" — porque cada
contagem media coisa diferente: umas contavam **fontes**, outras **frentes de trabalho** (código e
documentação da mesma fonte como dois itens).

**São doze referências, cada uma com duas camadas possíveis: CÓDIGO e DOCUMENTAÇÃO.** A tabela
canônica, com o estado de cada camada, está no `HANDOFF.md` (diário; ficou no repositório privado) §16. Resumo:
**11 de 11** com código inventariado (a 21st.dev não é biblioteca) e **5 de 5** camadas de
documentação feitas (26/08/2026).
