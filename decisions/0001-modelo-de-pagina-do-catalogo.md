# ADR-0001 — Modelo de página do catálogo: núcleo comum + extras por tipo

- **Data:** 30/07/2026
- **Estado:** aceita
- **Decide:** a decisão **D3**, aberta em `AUREA.md` §4 desde 24/07/2026
- **Destrava:** Fase 7 do `audit/2026-07-26-integral/03-PLANO.md` (achado I2, crítico)
- **Autoria:** recomendação do Opus, aceita pelo Victor em 30/07/2026 ("vou seguir todas
  suas recomendações"). Se ele discordar depois, esta ADR é revisada — não contornada.

## Contexto

`AUREA.md` §2.0 promete **padrão único**: "nenhum componente é caso especial". A auditoria de
26/07 mediu o oposto na superfície que deveria provar isso — **quatro modelos de página sem
relação entre si** nas 169 páginas geradas:

| Tipo | Páginas | Seções (medido em 30/07/2026) |
|---|---|---|
| Componente (fallback) | 43 | `installation`, `preview`, `reference` |
| Componente (rico, ex. Button) | 21 | + `api`, `features`, `examples`, uma seção por feature |
| Pattern | 68 | `installation`, `preview`, `code`, `uses` |
| Block | 8 | `installation`, `preview`, `code`, `uses` |
| Recipe | 23 | `composition`, `capabilities`, `invariants`, `states` — **sem preview, sem código** |

O modelo declarado em `AUREA.md` §4 ("Overview/Usage/Preview/Code/States/A11y/Tokens/
Platforms/Related") não existe em nenhum deles.

O pior sintoma: **de uma receita o consumidor não consegue copiar nada.** São 23 páginas de
texto renderizado de Markdown.

## Alternativas

**A. Um modelo idêntico para todo tipo.** Rejeitada. Uma receita é o arquétipo de uma aplicação
inteira; um componente é uma peça. Forçar as mesmas seções produziria seções vazias — e seção
vazia lê como defeito, o que é pior que diferença. "Padrão único" não quer dizer "conteúdo
único"; quer dizer que a diferença é **regra**, não improviso.

**B. Núcleo comum obrigatório + extras declarados por tipo.** Escolhida.

**C. Deixar como está e documentar os quatro.** Rejeitada. Documentar improviso não o torna
padrão, e a divergência continuaria crescendo por ser o caminho de menor resistência — foi
exatamente como os quatro nasceram.

## Decisão

### Núcleo — obrigatório em TODO tipo de item

1. `breadcrumb` — onde a página está na hierarquia
2. título + resumo de uma linha
3. **`preview`** — o item renderizado com componentes Aurea de verdade
4. **`code`** — o código que produz aquele preview, copiável
5. `installation` — como obter o que a página mostra
6. `uses` — proveniência: que componentes Aurea a página consome
7. `prevnext` — navegação linear

**A consequência que importa:** as 23 receitas passam a ter preview e código. Isso é a metade
do achado I2, e é a razão principal desta ADR.

### Extras — declarados por tipo, e só estes

| Tipo | Extras |
|---|---|
| Componente | `reference` (a11y, tokens, plataformas) · `api` (props) · `features` + `examples` |
| Pattern | nenhum |
| Block | nenhum |
| Recipe | `composition` · `capabilities` · `invariants` · `states` |
| Área | é índice, não item: fora deste modelo |

O fallback do registry deixa de ser um modelo à parte. Uma página de componente sem conteúdo
rico tem as mesmas seções — `features`/`examples` ficam com um exemplo só. Página pobre é
conteúdo faltando, não estrutura diferente.

## Como isso é obrigado

O modelo vira **dado** — lista de seções, com obrigatoriedade por tipo — e as quatro funções do
gerador (`componentPage`, `patternPage`, `blockPage`, `recipePage`) consomem esse dado em vez de
cada uma montar o seu. Hoje são quatro implementações imperativas, e divergir é o caminho fácil.

Gate: teste que, para cada tipo, exige o conjunto de seções declarado e reprova a página que
divergir. Sem isso a ADR é decoração — foi o que a auditoria inteira mostrou sobre regra sem
gate.

## Consequências

**Boas:** consumidor copia de qualquer página; `§2.0` deixa de ser falso; página nova de
qualquer tipo nasce com o mesmo esqueleto; o gate impede o quinto modelo.

**Custos, declarados:**
- As 169 páginas são regeradas; os 16 baselines do catálogo mudam de propósito.
- As 23 receitas precisam de um preview REAL — é conteúdo a escrever, não só estrutura, e é a
  parte cara da Fase 7.
- `features`/`examples` em 44 componentes segue sendo conteúdo faltando (achado M8). A ADR
  garante a estrutura; ela não escreve o conteúdo.

**Revisão:** se um tipo novo aparecer (ex. um adapter de plataforma), ele entra declarando seus
extras nesta tabela — não criando um quinto modelo.

---

## Emenda de 30/07/2026 — o que a execução mediu

A ADR foi executada no mesmo dia (Fase 7). Três coisas que ela não previa, e agora fazem parte
dela porque foram **medidas**, não supostas.

### 1. Página estática não renderiza portal — e isso limita o preview de 7 componentes

`renderToStaticMarkup` **não** renderiza `createPortal`. Medido: `<Dialog open>` produz **0
bytes**. Tooltip, Popover, DropdownMenu, ContextMenu e NotificationCenter produzem só o
**disparador**; Dialog e Drawer, nada.

Consequência para o núcleo: nesses 7, `preview` é o disparador real e a lede da demo diz por quê;
`code` é a composição inteira, copiável. O `CodeEditor` cai no mesmo caso por outro motivo — o
CodeMirror monta no cliente, então a página estática mostra o elemento hospedeiro vazio.

Não é conteúdo faltando: é o **meio**. O catálogo é HTML estático por decisão (abre por `file://`,
sem framework). Preview interativo exigiria React na página — decisão nova, de outro tamanho, e
não é esta. Fica declarado aqui para não voltar como achado.

### 2. `uses` virou seção, e a Reference perdeu a linha

Nos componentes, a proveniência era uma linha `Uses` dentro da Reference — ou seja, o núcleo
existia em três tipos e em um estava escondido dentro de um extra. Agora é `#uses` em todos.
Dois dos 65 componentes (`AureaProvider`, `QRCode`) não compõem ninguém e a seção diz isso: é um
primitivo. Dizer "folha" é informação; caixa vazia seria defeito.

### 3. O preview de uma receita é o CENTRO do arquétipo, não a tela inteira

Declarado porque muda o que a ADR promete. Uma receita compõe de 2 a 5 patterns de arquitetura;
o preview mostra a superfície central montada com componentes reais, e o texto da página
(Composition) diz como os outros se encaixam. Onde o centro não é renderizável em HTML estático —
um mapa, um canvas, um grafo de nós — o preview mostra a superfície **espelho** que a própria
receita exige como invariante ("toda seleção no mapa espelha uma lista"), e o código diz isso na
primeira linha. Miniatura de tela inteira dentro de uma caixa de 32rem seria decoração; isto é
copiável.
