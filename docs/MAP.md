# Mapa do código — onde mexer para fazer o quê

Existe por causa do achado **M19**: nada dizia onde adicionar o quê, e descobrir isso exigia ler
o repositório inteiro. Aqui é o atalho — a fonte continua sendo o código.

## A regra que explica o resto

**Quase tudo é gerado.** Token → CSS; registry → catálogo; contagem → `STATE.md`. Se você está
editando um arquivo em `apps/catalog/*.html`, `packages/*/dist/` ou um número dentro de um
documento, quase certamente está editando a **saída** — e o gate vai reprovar. Procure a entrada.

| Você quer… | Mexe em | E depois |
|---|---|---|
| mudar um valor visual (cor, raio, espaço, fonte) | `packages/tokens/src/aurea.tokens.json` | `pnpm build` — o CSS **e o alvo nativo** são saída; o check 36 reprova se o nativo ficar para trás |
| mudar a aparência de um componente | `packages/core/src/aurea.css` | `pnpm build`; **só token**, a catraca do check 12 reprova valor cru |
| mudar o comportamento/API de um componente | `packages/react/src/<categoria>-client.tsx` — ou `markup.tsx`, se ele for marcação pura ([ADR-0026](../decisions/0026-marcacao-pura-e-de-servidor.md)); o `source.react` da ficha diz qual. O `<categoria>.tsx` sem sufixo é a **vitrine**: só reexporta | ficha em `packages/contracts/registry/` + teste |
| criar um componente | ver a receita abaixo | |
| mudar o texto de um rótulo padrão | `pure.tsx`, nas **três** pontas (`AureaStrings`, `defaultStrings`, `ptBR`) | inglês no default ([ADR-0012](../decisions/0012-idioma-do-produto-e-ingles.md)) |
| escrever o exemplo de um componente | `apps/catalog/content/<Nome>.mjs` (rico) ou `_starters.mjs` (mínimo) | `pnpm build:catalog` |
| escrever o preview de uma receita | `apps/catalog/content/_recipes.mjs` | idem |
| mudar a estrutura de TODA página do catálogo | `scripts/page-model.mjs` (o modelo é dado) + `scripts/build-catalog.mjs` | o gate do modelo cobra nas 170 |
| mudar o texto de uma receita | `patterns/<arquétipo>.md` | check 9 valida contra o contrato |
| adicionar um gate | `scripts/validate.py` (sem navegador) ou `tests/visual/*.spec.ts` (com) | **prove contra o defeito** (QUALITY.md #29) |
| mexer no alvo NATIVO (tema, tokens resolvidos) | `packages/native/src/` — e **só** os três arquivos que já existem; componente novo é Lote 1, não autorizado | `pnpm build:native`; checks 37/38/39 |
| regerar os ícones do nativo | `packages/native/build-icons-native.mjs` (a fonte é o `@carbon/icons`, a mesma do sprite web) | `pnpm build:icons-native`; o check 38 compara os dois alvos |
| trocar/acrescentar uma fonte | `packages/fonts/build-fonts.mjs` + os binários em `files/` (web) **e** `files-native/` (nativo) | `pnpm build:fonts`; o check 37 reprova se um lado ficar para trás |
| registrar uma decisão | `decisions/` | tabela no `decisions/README.md` |

## Os pacotes, e o que cada um deve

```
packages/
  tokens/     DTCG → CSS **e → nativo**. A origem de todo valor  [ADR-0005]
              visual. `/native` é dp, sem cascata, cor em 3      [ADR-0027]
              formas (hex/p3/oklch). Ver NATIVE.md Etapa 2.
  core/       o CSS do sistema + aurea.js (comportamento vanilla).
  icons/      sprite Carbon.                                     [NOTICE obrigatório]
  fonts/      IBM Plex empacotada.                               [ADR-0006]
  react/      os componentes, separados por categoria/fronteira. [ADR-0004, Fase 9]
              markup.tsx = os 22 de marcação pura, SEM diretiva.  [ADR-0026]
              <categoria>.tsx = VITRINE, só reexporta, sem
              diretiva; o código de cliente mora no irmão
              <categoria>-client.tsx.                            [ADR-0026]
  contracts/  o contrato do projeto + o registry por componente. [ADR-0011]
  native/     o alvo REACT NATIVE, pacote IRMÃO do react — não   [ADR-0037]
              um wrapper dele. Hoje é só o CHÃO (Lote 0):        [ADR-0038]
              src/ = provider de tema × densidade (3 arquivos,   [ADR-0039]
              e o check 39 reprova o quarto até o Lote 1 ser
              autorizado); icons/ = 2571 módulos GERADOS.
              Zero componente de interface, de propósito.
```

Dependência entre os módulos do pacote React é um **DAG**, e a ordem é:

```
pure → internal → system → actions → overlays → feedback → inputs → navigation → layout → data-display → resto
```

**`overlays` saiu do "resto" e entrou depois de `actions` em 18/08/2026**, e a mudança é de
DOCUMENTO, não de código: ele sempre importou só `internal`, `system` e `actions`. Estava listado
no fim sem motivo medido, e isso barrava um uso legítimo — o `Sidebar` recolhida precisa de
`Tooltip`, porque no trilho o rótulo vira `.sr-only` e quem enxerga fica com um ícone mudo.
Conferido antes de mover: `overlays` não importa `feedback`, `inputs`, `navigation` nem nada
depois deles, então não há ciclo. E o `feedback → overlays` que já existia é import de **tipo**
(`type OverlaySide`), que some na compilação e não é aresta de execução.

Quebrar essa ordem cria ciclo de import. Se o seu componente novo precisa de algo que está
"depois" dele, o problema é a casa dele — não a ordem. (O `Kbd` é a exceção declarada: **mora no
`markup.tsx`** porque o `Button` depende dele, e é público pela vitrine `data-display.tsx`. Morava
no `internal.tsx` até o item O1; a reexportação de compatibilidade que ficou lá saiu em
16/08/2026, porque dali — que tem a diretiva — ele voltava a ser referência de cliente.)

A ordem acima é a dos módulos de **código**, hoje os `-client.tsx`. As vitrines não entram no DAG:
elas não importam ninguém, só reexportam.

**Dentro do "resto" a ordem é livre, e existe uma aresta que vale registrar:** desde 15/08/2026
(item L2) o `media.tsx` importa `overlays.js`, porque a `Gallery` **amplia no `Dialog` que já
existe** em vez de criar uma segunda superfície flutuante. Não há ciclo — o `overlays.tsx` não
importa `media` —, e a regra que isso ilustra é a nº 9 da `DIRECTION.md`: componente composto
**reusa** os menores. Pela mesma razão o `Image` (L4) foi construído antes da `Gallery`: o ladrilho
dela **é** um `Image`.

**E há um segundo eixo desde 06/08/2026, que não é de ordem e sim de FRONTEIRA** (PLANO-1.0,
Parte A): `pure.tsx`, `markup.tsx`, `disclosure.tsx`, `index.tsx` **e as oito vitrines de
categoria** são módulos de **servidor** — sem `"use client"`. Os módulos restantes que dependem do
navegador declaram a diretiva na primeira linha. O check 26 cobra os dois lados: faltando reprova,
sobrando também.

**A vitrine entrou em 16/08/2026 e fechou o limite declarado da ADR-0026.** Até ali a diretiva
morava no arquivo da categoria, e ela contamina o módulo INTEIRO: `@aurea-uds/react/layout`
entregava `Card` como referência de cliente enquanto o barril já o entregava como servidor — o
mesmo componente, dois pesos, conforme o caminho do import. A forma que resolve é uma troca de
nome, não de código: `layout.tsx` passou a ser uma vitrine de duas linhas (`export *` do irmão
`layout-client.tsx` + a linha explícita do `markup.js`), e a diretiva foi junto com o código para
o irmão. **Medido no `apps/proof-server` com Turbopack:** com a diretiva de volta na vitrine, o
`KPI` importado do subpath aparece no payload como referência de cliente (`$L`); sem ela, como
marcação (`["$","strong",…]`). O **check 26b** reprova a diretiva em cima de um reexport do
`markup.js` — foi provado contra o defeito nos oito módulos antes da correção.

**O `markup.tsx` entrou em 15/08/2026 (item O1, [ADR-0026](../decisions/0026-marcacao-pura-e-de-servidor.md))
e muda onde um componente novo nasce.** Ele guarda os 22 que não fazem NADA que exija o navegador
— sem hook, sem manipulador preso em JSX, sem motor. A razão é medida: `Card` é uma `<div>` e
importá-lo embarcava 9 módulos e **118,5 KB**, porque a diretiva contamina o módulo inteiro; o
`Accordion`, da mesma natureza e num arquivo sem diretiva, custava **0,3 KB**.

A regra que isso cria, e que vale para todo componente novo:

> **Não chama hook, não prende manipulador, não toca motor → nasce no `markup.tsx`.** Na dúvida,
> **não** entra: cliente a mais é lento, servidor a mais é quebrado.

O arquivo é onde a coisa **mora**; a categoria é o que a **ficha declara**. As duas não precisam
coincidir — é o precedente do `Kbd`, agora virado regra. A **vitrine** da categoria o reexporta
(o subpath não muda), e o `index.tsx` o exporta **explicitamente** do `markup.js`, que é o que faz
ele chegar como componente de servidor. O **check 35** cobra essa linha, e o `source.react` da
ficha aponta para o `markup.tsx` (check 28). Por isso `cx` e os dicionários moram no `pure.tsx`
e não no `internal.tsx`: se morassem lá, um componente de servidor não poderia **chamar** `cx`.

Seis módulos de motor opcional moram fora dessa ordem, cada um em subpath próprio:
`code-editor.tsx`, `data-grid.tsx`, `qrcode.tsx`, `calendar.tsx`, `chart.tsx` e `graph.tsx`.
**Nenhum módulo leve pode importar essas dependências** — check 19.

## Receita: componente novo

> O procedimento completo — de onde vem o desenho, o que se extrai de referência e o que nunca,
> e as travas — está em [`BUILDING.md`](BUILDING.md). Aqui fica só a sequência.

0. **Ele precisa do navegador?** Se não chama hook, não prende manipulador em JSX e não toca
   motor de terceiro, a implementação vai para `markup.tsx` (sem diretiva) e o módulo da
   categoria o reexporta — [ADR-0026](../decisions/0026-marcacao-pura-e-de-servidor.md). Se precisa,
   segue o passo 3.
1. **Nome, categoria e camada** pela `DIRECTION.md`. Categoria fora da taxonomia reprova.
2. **As quatro referências** consultadas para ESTE componente e registradas em `REFERENCES.md`
   (QUALITY.md #2; check 21). Construir de memória é o defeito que `BUILDING.md` existe para impedir.
3. **Implementação** em `packages/react/src/<categoria>-client.tsx`, respeitando o DAG. O
   `<categoria>.tsx` é a vitrine e não recebe código — se o componente for público por lá e não
   pelo `export *`, acrescente o nome à linha de reexport.
4. **Pele** em `packages/core/src/aurea.css`, só com token. Classe emitida sem regra reprova
   (check 18) — e uma asserção em `tests/visual/skin.spec.ts`, porque o check 18 olha o **nome**
   e uma regra vazia passa nele (medido na Fase 11).
5. **Ficha** em `packages/contracts/registry/<Nome>.json`.
6. **Teste** em `tests/unit/` — `Stable` sem teste reprova (check 16).
7. **Exemplo** em `apps/catalog/content/` — sem preview e código a página não fecha (check 17).
8. `pnpm build && python scripts/validate.py && pnpm test`.

**Se o componente tem EIXO** (uma prop que é união literal — `variant`, `size`, `tone`, `side`,
`orientation`…), ele precisa estar declarado na ficha: os dois com nome próprio em `variants` e
`sizes`, **todo o resto em `axes`** (check 14). Eixo que existe no TypeScript e não na ficha
reprova — foi assim que oito eixos publicados ficaram sem contrato até 21/08/2026.

**Se o componente tem TOM**, a matriz aparência × tom é cobrada em dois lugares:
`tests/unit/button-tone.test.tsx` (toda célula tem regra, e a regra VENCE a cascata) e
`tests/visual/tone-contrast.spec.ts` (AA nos dois temas).

## Receita: capacidade nova no runtime vanilla

O `packages/core/src/aurea.js` e o pacote React são **duas entregas da mesma coisa**, e por quatro
vezes uma andou sem a outra. Ao acrescentar capacidade em `window.Aurea`:

1. Implementar em `packages/core/src/aurea.js`.
2. **Implementar a contraparte React** — normalmente um hook no `internal.tsx` mais a prop no
   `AureaProvider`, como `useTheme` e `useDensity`.
3. Declarar o par em `CONTRAPARTE_REACT`, no check 28 do `validate.py`. Sem contraparte, declarar
   em `_SO_VANILLA` **com motivo escrito** — o que não pode é ficar em silêncio.

## Onde vive a verdade sobre o estado

| Pergunta | Resposta |
|---|---|
| Quantos componentes/páginas/tokens? | [`STATE.md`](../STATE.md) — **gerado**, nunca escrito à mão |
| O que ficou decidido? | [`decisions/`](../decisions/README.md) |
| O que está quebrado e conhecido? | `audit/2026-07-26-integral/02-ACHADOS.md` §0 |
| O que fazer agora? | `audit/2026-07-26-integral/04-PROTOCOLO-IA.md` §3 |
| **Onde a ATIVIDADE-2 parou?** | [`audit/activity-2/00-STATUS.md`](../audit/activity-2/00-STATUS.md) — a seção **ONDE PAREI** |
| **O que as nove referências têm e a Aurea não?** | [`audit/activity-2/03-GAPS.md`](../audit/activity-2/03-GAPS.md), e os inventários `05`–`13` ao lado |
| Quando algo está pronto? | [`QUALITY.md`](QUALITY.md) |
| O que é a Aurea e por quê? | [`AUREA.md`](AUREA.md) |
