# ADR-0031 — A lista de destinos não é chrome de aplicativo: `NavList` não é landmark e não tem item corrente

- **Data:** 18/08/2026
- **Estado:** aceita
- **Fecha:** o §4.3 do [`CONSUMIDOR-1.md`](../docs/CONSUMIDOR-1.md) — a **última** lacuna
- **Autoria:** medição do Opus, sob autorização explícita do Victor em 18/08/2026

## Contexto

Faltava a **linha que se toca e abre**: ícone, rótulo, segunda linha, valor e seta. O tijolo de
toda tela de ajustes, e o `ProfileItem` do PWA do Victor (4 usos). Era a única peça que restava
depois do `BottomNav` ([ADR-0030](0030-a-barra-inferior-reusa-o-item-da-lateral.md)).

O risco desta construção não era desenhar errado — era **construir o terceiro padrão paralelo de
navegação**, que o protocolo proíbe. A Aurea já tem `Sidebar` e `BottomNav`. Um terceiro
componente com rótulo, ícone e clique parece o mesmo componente de longe, e "qual eu uso?" é a
pergunta que denuncia padrão duplicado.

O passo 1 do [`BUILDING.md`](../docs/BUILDING.md) mediu os três vizinhos, no fonte:

| Vizinho | Medido | Por que não serve |
|---|---|---|
| `.sidebar-item` | já é ícone + rótulo + acessório numa linha clicável, com pílula no hover | pinta com `--sidebar-foreground`, token **escopado à lateral**; sem segunda linha, valor ou seta |
| `DataList` | `<dl>`, `grid-template-columns:minmax(0,max-content) minmax(0,1fr)` | é termo/valor e **não se toca** |
| `Table` | grade, `min-width:720px` no `.table` | grade de dados, não lista de destinos |

## Decisão

**1. É componente novo, e o que o separa dos outros dois é a SEMÂNTICA, não a aparência.**

`Sidebar` e `BottomNav` são **chrome de aplicativo**: moram num `<nav>` nomeado e marcam a seção
corrente com `aria-current="page"`. `NavList` é **conteúdo dentro da página** — a lista de destinos
em que se ENTRA e de onde se VOLTA.

Consequências, e as duas são deliberadas:

- **Não é landmark.** Um terceiro `<nav>` na mesma tela só acrescenta ruído para quem navega por
  landmark. É um `<ul>` de `<li>`, cada um com um link nativo.
- **Não tem `aria-current`.** Numa lista em que se entra e se volta não há o que estar corrente.
  Prometer isso faria o leitor de tela anunciar uma página atual que não existe.

As duas viraram asserção no teste unitário, porque decisão que só existe em prosa é decisão que a
próxima sessão "melhora".

**2. O valor da direita é um NÓ, não uma prop de tipo.** Não existe `badge`, não existe `status`,
não existe `switch`. `Badge` e `Status` compõem porque `value` aceita qualquer coisa — é a
`DIRECTION.md` §3.9 (composto reusa o menor) em vez de mais uma prop por acessório.

**3. Sem superfície e sem divisor.** Quem agrupa é o `Card`. E o realce de linha desta casa é a
**pílula** — pílula com traço embaixo se contradizem: o traço promete grade, a pílula promete alvo.

**3a. Mas o painel que a contém APERTA o padding.** `.card:has(> .nav-list)` cai para `--space-1`.
Isto é adendo de 18/08/2026, e veio de o Victor **circular a folga num print** depois de a medição
estar toda verde: com o `--card-pad` de 20px o realce começava a 21px da borda, o texto a 65px, e a
linha ocupava só **88%** da largura — realce flutuando no meio de uma caixa grande em vez de
preencher o painel. `--card-pad` é padding de CONTEÚDO; lista de linhas tocáveis quer outra escala.

A anatomia veio dos dois exemplos de `NavigationMenu` que ele mandou: o item leva `p-3` — que a
nossa linha já tinha — e o **contêiner quase não leva nada**. Depois da regra: 97% da largura, e o
texto a 49px. **Filho DIRETO** de propósito: um card com layout grande e uma lista pequena dentro
não pode perder o padding dele.

E a decisão de cima não muda: a lista continua **sem pintar superfície**. O que se ajustou foi a
escala do painel que a contém.

**3b. A seta só aparece em linha que tem destino (`href`).** Achado **olhando** a página do
catálogo, depois de a medição já estar verde: a linha "Sign out" saiu com seta, e seta promete que
a linha ABRE algo. O §4.3 pede "a seta que NAVEGA", e a única coisa que o componente sabe sobre
navegar é o `href`. Linha de ação fica sem seta — e **não há prop para escolher**, porque o dado
que já existe decide.

**4. Quem cede espaço é o TEXTO.** Valor e seta nunca encolhem. Valor cortado **mente** ("R$ 1.2"
no lugar de "R$ 1.234") e seta cortada deixa de dizer que a linha abre.

**5. Linha indisponível é `aria-disabled`, não `:disabled`.** Isto não é escolha nova: é a medição
de 13/08/2026 que já está escrita no core ao lado de `.btn:disabled` — `:disabled` tira o controle
da ordem de foco e quem usa teclado **nunca descobre que a linha existe**. Com `href` e `disabled`
a linha deixa de ser link, porque link desabilitado não existe em HTML.

**6. O alvo de toque é a linha inteira, e cresce para 44px em ponteiro grosseiro.** Pesquisado em
18/08/2026: WCAG 2.2 SC 2.5.8 (AA) pede 24×24 como **piso legal**, SC 2.5.5 (AAA) pede 44×44, o
Apple HIG pede 44pt e o Material 3 pede 48dp. A Aurea já tinha o token (`--target-min` = 44px) e já
tinha o mecanismo (`@media (pointer:coarse)`); a regra entrou **no bloco existente**, não num novo.

## Alternativas recusadas

**Reusar `.sidebar-item` fora da lateral.** Recusada por medição: ela pinta com
`--sidebar-foreground`. Fora da lateral o token não é o do contexto, e a linha desenha errado sem
que nada acuse.

**Estender `SidebarItem` com `description` e `value`.** Foi o caminho que o `BottomNav` tomou e
funcionou lá, porque lá é o **mesmo menu**. Aqui não é: poluiria o tipo da lateral com dois campos
que ela não usa, para servir uma lista que não é menu de aplicativo.

**Ser landmark "por segurança".** Recusada: landmark a mais é ruído medível para quem navega por
landmark, e o `role="list"` do `<ul>` já dá a estrutura.

**Copiar a superfície de configuração da MUI** (`dense`, `disableGutters`, `alignItems`,
`disableTypography`, `inset`, `autoFocus`, `component`). Recusada pelo passo 5 do `BUILDING.md`:
os sete existem por causa do sistema de estilo e de densidade dela. Aqui a densidade é global e o
elemento sai do `href`.

## Custo aceito

Componente novo em vez de pele — mais uma ficha, mais um teste, mais uma entrada de referência.
E a **segunda linha** entrou mesmo sem o enunciado pedir (o §4.3 falava de "ícone, rótulo, valor
opcional e seta"): ela veio do `ListItemText` da MUI, que é a única referência madura das 20
pastas, e tela de ajustes real usa as duas linhas.

## Como isso é obrigado

- **Teste unitário:** `NÃO é landmark e NÃO marca item corrente` — as duas asserções.
- **`skin.spec.ts`:** a repartição da linha medida em caixa (rótulo reticencia, valor e seta
  inteiros), a lista sem fundo, a linha inerte focável, e a regra do `(pointer:coarse)` cobrada na
  declaração. **Provado contra o defeito:** removendo `min-width:0` do texto, reprova nomeando.
- **Checks 21 a 24** (`built-components.json`): referência registrada, ficha completa, dimensão
  não é número, pele com efeito medido.
