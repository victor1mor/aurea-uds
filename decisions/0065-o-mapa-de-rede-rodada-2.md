# ADR-0065 — O mapa de rede, rodada 2: mexer no mapa

- **Data:** 10/10/2026
- **Estado:** aceita · executada na `0.31.0` (ainda não publicada).
- **Origem:** os pedidos de um app de topologia de rede que a rodada 1 ([ADR-0064](0064-o-mapa-de-rede-rodada-1.md))
  deixou para depois: MNT-13 (arrumar à mão), MNT-12.1 a 12.3 e 12.5 (linhas que desviam, paralelas,
  ponte, rótulos), MNT-16.4 a 16.7 (grupos, contêineres, nuvem, subárvore), MNT-11.2 (outras arrumações)
  e MNT-19.1 (escala). A proposta veio depois de três pesquisas (arrumar e desfazer; linhas; grupos,
  arrumações e escala), com licença e tamanho de cada caminho. A referência principal não tem grafo, grupo
  nem topologia. Escolha do Victor: *"como recomendado, pode construir a rodada 2"* — as seis
  recomendações abaixo.
- **Muda:** o `DependencyGraph` ganha o modo de arrumar, contêineres, recolher, nuvem, duas arrumações,
  rotas e pontes; uma dependência OPCIONAL nova (`@tisoap/react-flow-smart-edge`); o peer `@xyflow/react`
  sobe o mínimo para `^12.11.3`; 22 frases; e o teclado do mapa de leitura é consertado. Nada sai.

## A regra

**1. O modo de arrumar é uma chave (`editable`).** Ligada, o mapa vira editor, como o draw.io: o laço é o
botão principal na área vazia; Shift, Ctrl e Cmd somam à escolha; a tela anda com o botão do meio, o
direito ou Espaço + arrastar; a grade de 16 (`--space-4`) encaixa; a barra (a `Toolbar` da Aurea) alinha,
distribui, fixa, reorganiza, desfaz e refaz; e **as setas movem os escolhidos**. Desligada, é o mapa de
leitura de sempre, e **as setas andam de nó em nó**. A chave resolve a briga das setas: o mesmo gesto não
pode significar duas coisas no mesmo mapa.

**2. O desfazer é código nosso: pilha de COMANDOS**, cada passo com o inverso, os últimos 100 (o padrão do
draw.io). Não é foto do mapa inteiro, porque o mapa é **controlado pelo app**: cada passo — para frente ou
para trás — sai como um `onLayoutChange` com as posições e os fixos, e o app guarda. Entre o que o app
disse (`x`/`y`, `pinned`, `collapsed`) e o que a pessoa fez, vale **o último que escreveu**: o feito vale
até o app mudar aquele valor. Alternativa rejeitada: `use-undo` (MIT, 0,7 KB) — guarda instantâneos, e não
casa com o mapa controlado.

**3. As linhas.** Na arrumação em camadas, a linha em degrau segue a **rota do `elkjs`** (ângulo reto,
paralelas separadas), que a rodada 1 descartava. A rota vale enquanto as duas pontas estão onde o arrumador
as pôs e nenhum nó entrou no caminho. Depois de arrumar à mão — ou com posições guardadas pelo app —, a
linha que passaria por dentro de um nó pede o **desvio do `@tisoap/react-flow-smart-edge`** (MIT, sem
dependência, peer OPCIONAL): só a função pura dele, e o desenho é o nosso, com o canto da casa. A linha que
não passa por nó fica no degrau simples. A **ponte** é código nosso, na técnica do draw.io: a linha
desenhada depois salta sobre a de antes. Alternativa rejeitada: `libavoid-js` (ainda beta, lento nos
relatos, LGPL).

**4. Contêiner e grupo são a mesma coisa: `parentId`, um pai por nó.** O contêiner aberto é a caixa em
volta dos filhos, com cabeça (fechar, ícone, nome); fechado, ele é um nó que diz quantos guarda, e as
linhas dos escondidos saem dele — as que sobram entre o mesmo par viram uma, com o número (a "aresta
agregada" do mercado). **VLAN não é contêiner**: um equipamento está em várias, e isso não cabe em um pai
só — VLAN é filtro e destaque (`hiddenIds`, `highlight`). **Recolher a subárvore** (`collapsible`) esconde
o que o nó DOMINA — o que só se alcança passando por ele —, e não a árvore de quem foi achado primeiro:
com cabo redundante, o switch de acesso não some com um dos dois núcleos.

**5. O arrumador fora da tela principal é o app quem entrega** (`layoutWorker`), com a receita no README
(Vite; e a pasta pública, que funciona em qualquer empacotador). Copiar o trabalhador do `elkjs` para
dentro do nosso pacote seria redistribuí-lo (EPL/GPL), e o jeito de criar trabalhador muda de empacotador
para empacotador.

**6. A dobra editável fica para a rodada 3**, com as guias de alinhar durante o arraste, os rótulos que
desviam e o PDF. É a parte grande, e com o desvio automático ela faz menos falta.

E as escolhas de construção, medidas na bancada:

- **Na árvore e no círculo, o contêiner aberto não vira caixa.** O `elkjs` só põe filho dentro de pai na
  arrumação em camadas; a caixa em volta de filhos espalhados cobria os outros nós.
- **O rótulo de HTML fica acima das linhas e dos nós** (`--graph-label-z`): o motor eleva a linha de quem
  está dentro de um contêiner, e o nome da porta saía por baixo da caixa do site.
- **Nenhum rótulo cobre outro nem um nó**: o de `priority` maior fica; no empate, o primeiro da lista.
  Não há biblioteca livre que posicione rótulo sem sobrepor; as abertas escondem por prioridade.
- **O nó com porta vai ao arrumador com a POSIÇÃO de cada porta** (`FIXED_POS`), e a linha sem porta, a
  uma porta de base no meio do lado: sem ela, o arrumador ligava a linha no canto do nó.
- **O mapa de leitura tem UMA parada de Tab por nó**, a linha só é parada com `onEdgeSelect`, e todo texto
  do motor sai das frases da Aurea — na `0.30.0`, a caixa do motor e o botão do nó eram duas paradas, e a
  linha tinha nome em inglês e mandava apertar Delete.

## Como é obrigada

- `tests/visual/rede2.spec.ts` (18 casos, três navegadores), na bancada `apps/keyboard-probe/rede2.html`.
  Sem os seis consertos da bancada, 7 reprovam.
- `tests/unit/rede-rodada2.test.tsx` (15) e `tests/unit/rede-rodada2-geometria.test.tsx` (23). Com o mapa
  da `0.30.0`, os 3 do teclado de leitura reprovam.
- `tests/visual/rede.spec.ts` (rodada 1) continua passando.
- O check 19 prende a dependência nova ao `graph.tsx`; o check 31b cobra o aviso de compilação de toda
  frase nova (nasceu nesta rodada: quatro versões tinham acrescentado frase sem aviso).

## Consequências e custos

- **O desenho da linha em degrau muda** na arrumação em camadas (passa a ser a rota do arrumador).
- **Desvio em mapa grande custa**: medido ~2,7 ms por linha num mapa de 400 nós; a conta roda em lotes
  pequenos, entre um quadro e outro, só para as linhas que atravessam nó.
- **A linha que desvia não separa paralelas** (limite do pacote, assumido por ele); na arrumação em
  camadas, quem separa é o `elkjs`.
- O pai escondido do motor não esconde os filhos, nem a aresta: o mapa calcula o que fecha.

## Revisão

Reabrir se o `@xyflow/react` publicar fechar grupo e desfazer livres; se o `elkjs` publicar um
trabalhador que os empacotadores levem sozinhos; ou se um app medir travamento com o desvio.
