# ADR-0034 — Ter a variante não é usar a variante: a Aurea flutua, e `flush` é oferta

- **Data:** 20/08/2026
- **Estado:** aceita
- **Autoria:** correção do Victor; medição e execução do Opus, com autorização escrita dele em 20/08/2026
- **Toca a identidade:** sim — devolve o flutuante às páginas da Aurea e reduz a exceção da [ADR-0033](0033-o-raio-da-linha-sai-de-uma-conta.md) ao tamanho que ela sempre teve
- **Corrige:** o commit `7f78297` (19/08/2026)

## Contexto

Em 18/08/2026 o Victor abriu uma exceção escrita à regra da caixa flutuante do `CLAUDE.md`: a
lateral **pode** ser rente, e ele confirmou com quatro aplicativos que rodam na mão — Cloudflare,
Sophos, o app do Claude e o painel do próprio HeroUI. Nenhum flutua a lateral.

Na sessão de 19/08 essa autorização foi lida como **"troque o padrão"**. O `Sidebar` passou a nascer
`flush`, e o flutuante virou `variant="floating"`.

O Victor abriu o catálogo em 20/08 e reprovou:

> "eu mandei criar nova variação, mas não mandei mudar da nossa própria página. uma coisa é a gente
> ter o componente outra coisa é usar no nosso próprio projeto, o nosso vai ser tudo flutuante mas
> isso não impede da gente ter outras variações para as pessoas que nos acharem no npm usarem."

## O estrago, medido antes de decidir

**1. A inversão do padrão reescreveu 106 páginas.** O catálogo monta tudo por `AppShell`, e o
`AppShell` chamava `<Sidebar>` **sem variante** — logo, recebia o padrão. Medido no navegador em
20/08: `.sidebar` em `x=0`, `border-radius: 0`, borda só à direita, contra `margin: 16px` e
`border-radius: 22px` no commit anterior.

**2. A variante prometida era inalcançável.** O `CHANGELOG` anunciava `variant="floating"` como a
saída para quem instalou a `0.3.0`. Mas o `AppShell` não tinha prop para repassá-la:
`grep sidebarVariant packages/` devolvia **zero**. A porta de emergência estava escrita e trancada.

**3. O portão de pixel foi calibrado para aceitar.** O commit `7f78297` regravou quatro baselines
— `dark`/`light` de `catalogo-index` e `catalogo-lateral` — enquanto a mensagem dele afirmava
"com ZERO baseline regravada". O controle que existia para pegar exatamente isto foi atualizado
para não pegar.

**4. E as travas de unidade passaram verdes.** Havia um `describe` inteiro chamado *"Sidebar —
rente por padrão"*, com quatro testes, todos passando. Trava só vale se estiver apontada para o
lado certo: ela segurou firme o padrão errado.

## Decisão

**`floating` é o padrão. `flush` é a variante, e é opt-in.**

```
Sidebar            variant="floating" (padrão)  ·  variant="flush"
AppShell           sidebarVariant?: SidebarVariant  → repassa
```

A regra `.sidebar` foi restaurada **íntegra do commit `b0599be`**, não reafinada à mão: estado
conhecido bom, e são as baselines de pixel que provam, em vez de eu escolher números de novo. O
bloco rente virou `.sidebar-flush`, que desfaz exatamente o que a flutuante põe.

**E o `AppShell` ganhou `sidebarVariant`**, par do `topbarVariant` que já existia ao lado. Sem ele
a variante seria enfeite para quem monta pelo caminho normal — que é o defeito 2 acima, e ele
voltaria espelhado se o padrão fosse trocado sem abrir a porta.

## A regra que sai disto, e vale além deste componente

**Autorização para um componente TER um desenho não é autorização para as páginas da Aurea USAREM
esse desenho.** São duas decisões, e a segunda é do Victor, sempre.

Quando as duas coincidem, é porque ele disse as duas — não porque uma implica a outra.

**O sinal de que a linha foi cruzada é barato de checar:** se uma mudança de componente altera
páginas que ninguém pediu para alterar, ela trocou um **padrão**, não acrescentou uma **variante**.
E variante nova nunca precisa de baseline regravada.

## O que NÃO voltou atrás

Três números da mesma rodada ficam, por decisão explícita do Victor em 20/08. Eles são acabamento
do componente, lidos no fonte da referência, e não têm nada a ver com a identidade das nossas
páginas:

| | de | para | fonte |
|---|---:|---:|---|
| trilho recolhido (`--sidebar-rail`) | 88px | 68px | `MAIN_SIDEBAR_WIDTH = 68` |
| ícone do item | 16px | 20px | `size-5` = nosso `--icon-md` |
| item do trilho | 71×36 esticado | 36×36 quadrado | `NavButton` icon-only é `size-9` |

O `Tooltip` do trilho recolhido também fica. O defeito então aberto foi fechado pela
[ADR-0035](0035-sidebar-responsivo-sem-inventar-recursos.md): o trigger e o Base UI passaram a
registrar o mesmo ID, inclusive no catálogo aberto por `file://`.

## Como isso é obrigado

**`tests/unit/components.test.tsx`** — o `describe` foi virado ao contrário e ganhou um teste que
não existia: *"o AppShell repassa a variante — e sem ela a lateral flutua"*. É a prova contra o
defeito 2, que passava calado porque ninguém media o caminho do shell.

**`tests/visual/skin.spec.ts`** — o palco tinha uma lateral `variant="floating"` para provar que as
duas variantes desenham diferente; agora tem uma `variant="flush"`, e as asserções mediram o lado
certo: o **padrão** tem margem, raio e borda nos quatro lados; a variante não tem nenhum dos três.
A asserção de que as duas medem diferente continua, porque é ela que impede a prop virar decoração.

**As quatro baselines de pixel** voltaram ao conteúdo de `b0599be`. Se a restauração do CSS tivesse
errado um pixel, o portão reprovaria — e foi por isso que a regra foi copiada em vez de reescrita.
