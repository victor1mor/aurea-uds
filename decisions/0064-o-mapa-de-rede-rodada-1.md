# ADR-0064 — O mapa de rede, rodada 1: ler o mapa

- **Data:** 10/10/2026
- **Estado:** aceita · executada na `0.30.0` (ainda não publicada).
- **Origem:** os pedidos de um app de topologia de rede (MNT-01 a MNT-03 e MNT-06 a MNT-19). A
  proposta veio depois de três pesquisas (o código de hoje; o mercado de motor, arrumação, linhas e
  exportação, com licença; e as famílias de ícones). Escolha do Victor: *"como recomendado, pode
  construir a rodada 1"*. A rodada 2 (mexer no mapa) e os ícones de rede ficam para depois.
- **Muda:** o `DependencyGraph` ganha props genéricas de nó, de aresta e do mapa; duas dependências
  OPCIONAIS novas (`elkjs` e `modern-screenshot`); o `Icon` da web aceita o desenho do app; a tabela
  de troca de ícones ganha 7 nomes; o README ganha um aviso. Nada sai, nada muda de nome.

## A regra

**1. O mapa de rede é o `DependencyGraph`, com props GENÉRICAS** (a regra de 07/10: peça nova entra
como variação). O app traduz o domínio dele para elas; nada aqui diz "fibra" ou "switch".

- **Nó:** `icon` (nome do sprite ou desenho do app), SEMPRE junto do tipo em palavra — a recusa das
  cores por tipo (ADR-0018) continua de pé; `count` + `countLabel` (o selo de quantidade, e o que o
  leitor de tela ouve); `status` (a palavra, com um tom que só reforça); `ports` (alças com nome e
  lado); `layer` (a camada sugerida).
- **Aresta:** `fromPort`/`toPort`; `sourceLabel`/`targetLabel` (o nome da porta na ponta); e o que a
  linha é, sem depender de cor — `pattern` (`solid`, `dashed`, `dotted`, `double`), `weight`
  (`regular`, `thick`, `heavy`), `mark` no meio (`cross`, `dot`, `lock`), `count` e `legend`.
- **Mapa:** `orientation` (`vertical` = de cima para baixo, cada camada centrada); `layout`
  (`layered`, pelo `elkjs`); `rootId`; `edgeShape` (`step`, ângulo reto com canto); `groupParallel`
  (as linhas entre o mesmo par viram uma com o número, que é um botão que abre e junta); `minimap`;
  `controls`; `legend` (montada pelas linhas na tela); `focusId` (o "ir até"); `highlight` e
  `highlightNeighbors` (acende e apaga o resto); `hiddenIds` (esconde SEM refazer a arrumação);
  `onNodeHover`, `onNodeContextMenu`, `onEdgeSelect`; `textSize` (`lg`); `highContrast`; `apiRef`
  (caber, aproximar, afastar, ir até, `toDrawio`, `toPng`, `toSvg`).
- **Teclado:** as setas andam de nó em nó (o mais perto na direção, num cone de 45°).

**2. O motor continua o mesmo** (ADR-0045: não se troca motor antes de provar que ele não dá). A
arrumação em camadas é do **`elkjs`**, dependência OPCIONAL nova, carregada por `import()` só quando
`layout="layered"`; sem ela instalada, o mapa avisa uma vez e fica na arrumação simples. As portas
vão em ORDEM FIXA (o arrumador livre reordenava por dentro, e as linhas se cruzavam). A foto é do
**`modern-screenshot`**, opcional também, carregado só no `toPng`/`toSvg`. O `.drawio` é escrito pela
Aurea, à mão, como o formato documenta — sem dependência.

**3. O minimapa sai da lista de recusas.** A ficha recusava minimapa, painéis e seleção por
retângulo como "superfície de editor". O mapa de rede é LEITURA, e um mapa de cem equipamentos não se
lê sem a visão geral. Ele entra como opção, desligada, vestido pelas variáveis do próprio motor. Os
botões de zoom são `IconButton` da Aurea num `Panel` do motor. A seleção por retângulo continua fora
(é da rodada 2).

**4. Três regras de construção, achadas medindo na bancada:**
- **A espessura da linha vai pela variável do motor** (`--xy-edge-stroke-width`): a folha da Aurea
  mora numa camada, e a regra do motor, sem camada, ganharia. Medido: a fibra saía com 1 em vez de 6.
- **A lista de alças declaradas só vale até a primeira medida.** O motor sempre prefere a lista
  declarada (que existe para o mapa aparecer no servidor), e ela foi feita para o nó de 52 de altura:
  num nó com endereço, a linha nascia DENTRO dele e o nome da porta ficava escondido.
- **No mapa de leitura, as alças existem, escondidas e surdas ao ponteiro** — para o motor medir a
  borda, sem nenhuma mão prometer clique.

**5. Os pedidos pequenos:** o `Icon` da web aceita o desenho do app (`AureaIconComponent`), como o
nativo; a tabela Carbon→Phosphor ganha `add--alt`, `edge-node`, `flow--connection`,
`ibm-cloud-pak--network-automation`, `location`, `network-interface` e `router` (o roteador aponta
para `arrows-out-cardinal`, a forma dele no Carbon, até a rodada dos ícones de rede); o README avisa
para reiniciar o servidor de desenvolvimento depois de atualizar.

## As fontes

- **A referência principal** (pacote web e do telefone, versão atual, lidos em 10/10/2026): não tem
  grafo, diagrama nem árvore visual. Vale o padrão do mercado com a cara da Aurea.
- **O motor que já usamos** (versão atual, MIT): não arruma sozinho; entrega de graça várias alças,
  minimapa, painel, rótulo em HTML, seleção múltipla, grupos e desenho só do que está na tela.
  Desfazer, abrir e fechar grupo, dobra editável e desvio de linha só existem nos exemplos pagos dele
  — ficam para a rodada 2, como código nosso ou biblioteca livre.
- **O arrumador** (`elkjs` 0.12, EPL-2.0 ou GPL-3.0): camadas, portas, raiz, menos cruzamento. A
  política da Apache põe a EPL na categoria B (pode ser dependência); bibliotecas Apache-2.0 do
  mercado dependem dele. Zero avisos de segurança e zero dependências (conferido antes de instalar).
- **A foto** (`modern-screenshot` 4.7, MIT, ativa): a biblioteca que o exemplo do motor usa está
  parada desde 02/2025 e travada numa versão antiga. Zero avisos, zero dependências.
- **O `.drawio`**: XML documentado (com esquema publicado); nenhuma biblioteca livre o escreve, e uma
  ferramenta de rede do mercado o gera à mão — como esta.
- **Ferramentas de rede do mercado** usam outro motor de rede genérico; os mapas fechados (os que o
  Victor citou) não dizem qual. O desenho das linhas (meio, estado, velocidade) é decisão do Victor,
  pela bancada.

## Alternativas rejeitadas

- **Trocar de motor** por uma biblioteca de diagrama completa: nenhuma cobre tudo com licença
  compatível, e a ADR-0045 pede prova de que o atual não dá. O atual deu.
- **Um componente novo `NetworkMap`**, ou `variant="network"`: a regra pede variação, e as props
  genéricas servem a qualquer grafo.
- **Cor por tipo de equipamento:** a quinta recusa (ADR-0018) continua; o tipo é palavra, com ícone.
- **Desvio de obstáculos agora:** é da rodada 2 (arrumar à mão); na rodada 1 a arrumação em camadas
  já evita a maior parte dos cruzamentos.
- **PDF:** não sai vetorial (os nós são HTML, e o conversor não lê `foreignObject`). Fica para depois.

## Como ela é obrigada

- `tests/visual/rede.spec.ts`, no navegador, com o banco `apps/keyboard-probe/rede.html` (a folha do
  motor importada SEM camada, o pior caso): a raiz no topo; as portas em ordem; a linha nascendo na
  borda e nenhum nome de porta coberto; a fibra com 6 e o miolo; o grupo que abre e junta; as setas;
  esconder sem mexer; o caminho que apaga o resto; visão geral, botões e legenda; texto grande e alto
  contraste; o `.drawio` como XML válido e a foto em PNG. Provado contra a primeira versão desta
  rodada: sem os três consertos da regra 4, 5 dos 11 reprovam.
- `tests/unit/rede-rodada1.test.tsx`: o desenho do app no `Icon`, os 7 nomes da tabela, o aviso do
  README, as dependências opcionais (e só por `import()`), o nó com ícone e selos no servidor, a pele
  pelas variáveis do motor, as frases nos dois idiomas.
- `tests/visual/teclado-motor.spec.ts`: a ficha declara as setas que o mapa agora entende.
- O check 19 prende `elkjs` e `modern-screenshot` ao `graph.tsx`.

## Consequências

- O app traduz o domínio dele para as props (o mapeamento sugerido está na bancada) e passa a
  instalar `elkjs` (e `modern-screenshot`, se quiser exportar foto).
- O padrão novo do catálogo e a página de prova mudam as fotos `topo` e a contagem de padrões.
- Rodada 2: arrumar à mão (laço, grade, alinhar, alfinete, desfazer, dobra), linhas que desviam com
  ponte, grupos e contêineres, outras arrumações, escala de 500 nós.

## Quando rever

Se a rodada 2 mostrar que o desvio de linhas e o desfazer pedem um motor que este não é.
