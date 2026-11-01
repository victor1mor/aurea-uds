# Aurea — regras do projeto

Design system independente. Marca: **Aurea**. Nome oficial: **Aurea Universal Design System** ·
curto **Aurea UDS**. Pacotes `@aurea-uds/*`; repositório `aurea-uds`; domínio `aureauds.dev`.

Este arquivo tem **só regras**. O diário de como cada uma nasceu ficou no repositório privado
original quando a Aurea foi aberta (24/09/2026). Quem decide é o Victor; quando uma regra aqui
disser "ordem do Victor", ela vale até ele dizer o contrário.

---

## 1. A regra que vem antes de todas — ordem do Victor, 30/08/2026

> **Duvide sempre das suas próprias decisões. Nunca use seu treinamento como verdade.**

**O que ela proíbe, em concreto:**

- **Afirmar estado sem comando atrás.** Não "o projeto tem X": `grep`, `ls`, `npm view`, e a saída.
  Vale para o que você escreveu cinco minutos antes — memória de sessão também é memória.
- **Contar à mão.** Número de estado sai de comando. Os números do projeto estão no
  [`STATE.md`](STATE.md), que é **gerado** (`python scripts/validate.py --write-state`).
- **Recomendar sem perguntar o alvo.** Antes de `pnpm add`, pergunte se é **web ou nativo**: as
  listas dos dois lados são diferentes, não a mesma com menos itens.
- **Recomendar sem perguntar ONDE o comando roda.** Comando colado sem `cd` esconde uma suposição.
  O repositório é pnpm workspace (`npm i` dentro dele quebra), e o app pode estar em outra máquina.
- **Agir sem autorização.** Fase nova, push, publicação, mudança de API: cada um exige um "pode".
  Autorização dada uma vez não vale para a próxima. Aviso automático do git **não é o Victor**.
- **Escrever "você pediu" ou "você autorizou"** (ordem de 14/09/2026). Do lado do agente, o que o
  Victor digita e o que chega preenchido no campo são idênticos. Escreva o que foi feito; se
  precisar de autorização, **peça de novo**.
- **Inventar distância** (ordem de 12/09/2026). Todo número de geometria sai de **token**. Número
  cru no fonte é defeito até prova em contrário, e a prova é uma linha do `aurea.css` com o número
  ao lado. Escala nova não se cria no meio de um componente.
- **Não medir a simetria.** "Está na posição certa?" se responde medindo o retângulo de cada peça,
  não olhando.
- **Consertar sem medir.** Nem toda acusação sobre a imagem é do componente: às vezes é a vitrine
  ou o dublê de teste. Mede-se antes de tocar.
- **Afirmar sobre imagem que você não olhou NA VERSÃO FINAL.** Olhe o arquivo que vai sair.
- **Afirmar sobre o próprio estado.** Se o Victor diz que a conversa compactou ou que algo foi
  esquecido, ele tem o instrumento; a sua memória é a coisa em questão. O que protege o projeto
  são os arquivos (este, o `CHANGELOG.md`, as ADRs).
- **Falar em jargão** (ordem de 14/09/2026: *"seja direto"*). Se a palavra precisa de tradução,
  ela já está errada — escreva a tradução e apague a palavra.
- **Escrever horário no fuso errado** (ordem do Victor, 24/09/2026). O Victor está no fuso **−3
  (horário de Brasília)**. Todo horário que se escreve para ele — agendamento, publicação, prazo —
  vai **no fuso dele**. O relógio dos servidores e o GitHub usam UTC: converta antes de escrever
  (UTC 21:06 = 18:06 para ele).
- **Hesitar em pergunta de sim ou não sobre o código.** Mede-se, e a primeira palavra é **sim** ou
  **não**.
- **Tratar resumo de busca como fonte.** A fonte é a página. Sobre interface de terceiros (Expo,
  npm, GitHub), não afirme nada que você não tenha aberto.

**E duvidar inclui duvidar da acusação** — dúvida também sobre o defeito que você acha que achou.
**Quando a dúvida não se resolve com comando, ela vira pergunta ao Victor — não palpite.**

---

## 2. A ordem das fontes — ordem do Victor, 24/09/2026

> **Quem decide, nesta ordem:** **1.** o Victor · **2.** as pesquisas dele · **3.** a **referência
> principal de desenho**.

- **As referências de construção moram FORA do repositório** (ordem do Victor, 07/10/2026). Quais
  são, a fila de consulta, onde ler cada uma, as licenças e os inventários estão no documento de
  referências (`referencias/REFERENCIAS-DE-CONSTRUCAO.md`, na pasta do documento de achados do
  Victor). **Leia antes de construir.**
- ⚠ **Nome e informação de referência não entram em nada que a Aurea publica** — repositório,
  site ou pacote. Nos arquivos, escreva "a referência". Quem cobra é o check 1b do
  `validate.py`, com a lista fora do repositório (o `.referencias` local e o segredo
  `AUREA_REFERENCIAS` da CI).
- **A referência principal é a fonte principal de desenho**: tamanho, anatomia, estado,
  espaçamento. Antes de inventar, **ver como ela faz**.
- **Decisão que vai ao Victor vem com a resposta da referência principal** (ordem do Victor,
  08/10/2026: *"decisoes que devo tomar sempre verificar antes na [referência principal] e eu so
  aprovo se eles não existe la, usamos o padrão do mercado com nossa cara"*). Antes de levar uma
  escolha (A ou B, nome, comportamento, medida), ler como ela faz e trazer isso na pergunta. Se ela
  tem, a proposta é o jeito dela com a aparência da Aurea; solução própria só vai para aprovação
  quando ela não tem.
- **Leia no código publicado dela, não na memória.** O documento de referências diz onde.
- Quando divergem, vale o de cima. Na dúvida, pergunte antes de escolher.
- ⚠ **A referência não manda na identidade da Aurea** (seção 5). Dela se copia o desenho da peça;
  a aparência continua sendo a nossa.
- **A referência principal sempre primeiro** (ordem do Victor, 25/09/2026). Quando ela **não
  tem** a peça que estamos criando, a peça se cria **pensando como ela criaria** (nomes,
  anatomia, estados, lista fechada de opções), com a aparência da Aurea. Ela é a referência mesmo
  onde não tem o componente.
- **Quando ela não tem a peça, a consulta segue a fila de referências** (ordem do Victor,
  01/10/2026), que está no documento de referências, e para na primeira que tiver.
  - De todas se lê **anatomia, nomes, estados e comportamento**. A aparência é sempre a da Aurea
    (seção 5).
  - Medida (recheio, altura, vão) vem **só da referência principal**, pela regra abaixo. Das
    outras, número nenhum entra sem passar pelos tokens que já existem.
  - Copiar continua exigindo ordem do Victor e crédito no `docs/REFERENCES.md` (seção 7).
- **As medidas vêm da referência principal** (ordem do Victor, 25/09/2026): medida que ela já tem,
  validada, não se inventa; só se cria medida e tamanho em componente exclusivo nosso. Recheio,
  altura, letra, linha e vão de peça que ela tem se leem no pacote dela e se escrevem com os
  tokens que dão o mesmo número. A identidade (seção 5: raio, cor, fonte) continua nossa.
- **QUASE IDÊNTICA À REFERÊNCIA PRINCIPAL** (regra do Victor, 11/10/2026: *"tem que ser quase
  idêntico [à referência], só add nossas características"*). A peça da Aurea é a peça da
  referência principal — anatomia, partes, medidas, espaçamento, estados, comportamento, teclado,
  onde cada coisa fica — e por cima dela só entra o que é da Aurea: o amarelo e as cores dos temas
  (ADR-0061); os cantos (22 no cartão, 32 na folha de baixo, cápsula nos controles; nada quadrado);
  a Inter, a Sora e a IBM Plex Mono (ADR-0077) e o Phosphor; as densidades; nenhum degradê; **nenhuma linha** (ADR-0072); e a
  acessibilidade de baixa visão (contraste medido, toque de 44, foco visível). Divergir em qualquer outra coisa é pergunta
  ao Victor, com o motivo.
  - **O alcance, decidido pelo Victor em 11/10/2026:** vale para as peças E para o site da Aurea (o
    site segue a documentação da referência, com a cara da Aurea). *"A questão é não colocar nomes
    dos outros no projeto; aqui do desenvolvimento é livre"*: copiar o desenho é livre, e **copiar o
    nome de COMPONENTE também** (`CloseButton`, `ColorSwatch`… podem ser os dela). O que não entra é
    o nome da BIBLIOTECA dela (nem de nenhuma outra) escrito em qualquer coisa do projeto —
    repositório, site, pacote, pedido de junção (seção 2, acima). Nomes de prop que a Aurea já
    decidiu continuam (o `tone`, seção 11).
  - **O PADRÃO É O NOSSO; AS VARIAÇÕES, AS DELA** (regra do Victor, 24/10/2026: *"vamos ter nossos primários mas variações
    iguais a deles, já que a deles é genérica as pessoas gostam de usar"*). Cada peça tem o seu jeito Aurea como padrão (o
    que aparece sem escolher nada — por exemplo, a aba escolhida no amarelo do botão) e ganha, como VARIAÇÃO a mais, o
    jeito da referência: o desenho e os nomes dela, com as cores, os cantos, a fonte e o "sem linha" da Aurea. O exemplo
    que o Victor deu é a coluna "igual à referência" da bancada do nativo de 24/10/2026 (a aba escolhida branca com a
    letra na cor do texto, o visto da lista no amarelo misturado com o texto, o menu no cinza apagado). Toda variação
    passa na mesma régua de leitura e foco visível. Fazer peça por peça, com a bancada (a nossa ao lado da dela) — **em
    outro momento**, não no meio de outro trabalho.
  - ⚠ O toque: a caixa de marcar e o rádio do nativo seguem a referência (6 a mais, invisível — decisão do Victor,
    24/10/2026); o "toque de 44" da lista acima vale para o resto.
- **Antes de desenhar ou mostrar uma peça que a referência tem** (lição de 11/10/2026, quando cinco
  peças da prancha voltaram para correção): (1) abrir a PÁGINA DE EXEMPLOS dela — o pacote não traz
  exemplos, e uma ficha antiga dizia "não tem" o que estava num exemplo; (2) ler o CSS publicado
  dela e copiar anatomia e medidas; (3) medir o desenho contra isso no navegador antes de mostrar.
- **Pesquisa, uma referência de cada vez** (ordem do Victor, 10/10/2026: *"busca massiva ao mesmo
  tempo gasta token demais"*): primeiro o que já está anotado no documento de achados e os pacotes
  já baixados; depois a referência principal; achou tudo, para. Só a peça que faltou segue para a
  próxima da fila, em sequência, e para na primeira que tiver. Sem buscas em paralelo. Fora da fila,
  só depois de a fila acabar.

---

## 3. Comece aqui: a fila

**A fila são os achados dos consumidores.** O documento-fonte vive fora do repositório, com o
Victor, porque cita os apps pelo nome. Aqui cada achado se chama pelo ID (A-01, R-08…). **Peça ao
Victor a versão mais nova no começo da sessão**: ela é atualizada pela sessão do app.

### O que já saiu

| versão | o que entrou |
|---|---|
| `0.8.8` | Lote 1: A-01, A-06, A-07, A-09, A-10, A-11, C-09 |
| `0.8.9` + `0.8.10` | A-03, C-10 · A-02 e B-08 (o `Select` com a aparência da Aurea) |
| `0.8.11` | N-10: `MediaEmbed` |
| `0.8.12` | escala de letras da referência ([ADR-0050](decisions/0050-a-escala-de-letras-vem-da-referencia.md)) |
| `0.8.13` + `0.8.14` | Lote 4 (nativo) inteiro: R-01 a R-10 |
| `0.9.0` | Lote 2, primeira leva: B-01, A-08, C-01, C-03, C-04, C-05, C-07, C-13, B-03 |
| `0.10.0` | Lote 2, segunda leva: B-07, B-10, B-12, A-05, A-14 — junção `5ca8d3e` (pedido #16). **Publicada em 24/09/2026**, pelo terminal do Victor |
| `0.10.1` | R-05, a metade que faltava: `criarGlifo` desenha a traço — pedido #4 do repositório público. **Publicada em 24/09/2026**, pelo terminal do Victor |
| `0.11.0` | Lote E (nativo): E1, E3, E4, E5, E6, E7, E8 e o `Badge` nas medidas da referência — pedido #6. **Publicada em 25/09/2026**, pelo terminal do Victor, **sem o aceite de aparelho** |
| `0.12.0` | Lote 3: A-04, B-09, ADR-0052, B-02, E2, M-01 e o `ThemeToggle` — pedido #8. **Não saiu sozinha**: foi publicada dentro da `0.12.1` |
| `0.12.1` | E9 (`LinkButton`), E10 (recuo das folhas), E11 (`Grid` reparte a sobra) — pedidos #9 e #10. **Publicada em 26/09/2026**, pelo terminal do Victor. Leva a `0.12.0` junto |
| `0.12.2` | O `BottomNav` mais baixo, na web e no nativo (aprovado pela imagem) e dois patches de segurança da CI — pedido #11. **Publicada em 30/09/2026**, pelo terminal do Victor |
| `0.12.3` | `RadioGroup` no nativo, no desenho da referência, com a marca no início ou no fim (aprovado pela imagem) — pedido #13. **Publicada em 30/09/2026**, pelo terminal do Victor |
| `0.12.4` | R-20: o estado chega ao leitor de tela da web em `aria-*` (os 26 pontos do nativo) — pedido #15. **Publicada em 01/10/2026**, pelo terminal do Victor |
| `0.13.0` | A troca de fonte e ícones da ADR-0053: Atkinson Hyperlegible Next e Mono, ícones Phosphor com a forma cheia no item escolhido. **Quebra** nomes de ícone. Aprovada pela imagem (pedido #17) e, com as fotos da CI (pedidos #18 e #19), **publicada em 01/10/2026**, pelo terminal do Victor |
| `0.14.0` | Lote F (nativo): R-10, R-12, R-14, R-16, R-19 — pedido #22. **Não saiu sozinha**: foi publicada dentro da `0.14.1` |
| `0.14.1` | O `IconButton` ocupado mostra só a rodinha, no centro (web) — pedido #24; a CI de volta ao verde (aceite do `node-forge`, espera de transição) — pedido #25. **Publicada em 02/10/2026**, pelo terminal do Victor. Leva a `0.14.0` junto |
| `0.15.0` | Nativo: R-11 (o desenho do app em toda prop de ícone), R-15 (moldura no `EmptyState`), R-18 (`Timeline` com `icon`, `tone`, `trailing`, `between`), R-21 (`FileInput` em `/system/file`), R-22 (o `PhotoInput` abre a foto), E13 — pedido #27. **Publicada em 02/10/2026**, pelo terminal do Victor, **sem o aceite de aparelho** |
| `0.16.0` | No tema claro, a letra de destaque é o amarelo escurecido `#826202` ([ADR-0054](decisions/0054-no-tema-claro-a-letra-de-destaque-e-ouro-escuro.md)) — pedido #29, fotos da CI no #30. **Publicada em 02/10/2026**, pelo terminal do Victor |
| `0.16.1` | O círculo do `BottomNav` `circle-bold` não vira risco no navegador, e o rótulo cabe nele na barra estreita (web e nativo) — pedido #31. A CI em paralelo e o aceite do `braces` (#32, #33) não mudam pacote. **Publicada em 03/10/2026**, pelo terminal do Victor |
| `0.17.0` | O `BottomNav` parado ao trocar de aba, mais baixo, com o nome colado no ícone, e os indicadores novos `capsule` e `expand` ([ADR-0055](decisions/0055-a-barra-de-baixo-fica-parada-e-mais-baixa.md)). Aprovada pela bancada (*"PERFEITO! pode. aprovado"*) — pedido #35. **Publicada em 03/10/2026**, pelo terminal do Victor, **sem o aceite de aparelho** |
| `0.18.0` | Lote G, de um consumidor novo da web: AN-07 (`Progress` sem total, com `detail` e `tone`), AN-08 (`Grid` com `min` por nome), AN-04 (`NavList` com `avatar` e `indicators`) e AN-01 (`AppShell` com o botão de recolher — [ADR-0056](decisions/0056-a-lateral-recolhe-pelo-botao-na-juncao.md)); junto, as fichas com o Phosphor (pedido #37). Aprovada pela bancada (*"pode, aprovado o lote G"*) — pedido #38. **Publicada em 03/10/2026**, pelo terminal do Victor, **sem o aceite de aparelho** |
| `0.19.0` | Lote H, do consumidor novo da web: AN-06 (`TreeView` que carrega ao abrir), AN-05 (`Gallery` em lote), AN-03 (`MessageComposer` que anexa, responde e edita), AN-02 (`MessageList` para conversa longa — [ADR-0057](decisions/0057-a-conversa-longa-e-uma-janela-sem-virtualizacao.md)). Aprovada pela bancada (*"Pode"*) — pedido #40. **Não saiu sozinha**: foi publicada dentro da `0.19.1` |
| `0.19.1` | A cápsula do `BottomNav` saía quadrada no Android (`collapsable={false}`), aceita no aparelho (*"deu certo"*) — pedido #41. **Publicada em 04/10/2026**, pelo terminal do Victor. Leva a `0.19.0` junto |
| `0.20.0` | Lote I: A5, C9 e MNT-05, R-23, HER-01, HER-02 e HER-03 ([ADR-0058](decisions/0058-a-folha-de-baixo-tem-32-de-canto.md)) — pedido #43. **Não saiu sozinha**: foi publicada dentro da `0.22.0` |
| `0.21.0` | Lote J: CHK-01 e GAR-08 — pedido #44. **Não saiu sozinha**: foi publicada dentro da `0.22.0` |
| `0.22.0` | Lote K1: `Container`, `Grid.Item span`, `Section` e o tema na faixa (GAR-02 a GAR-05), e as referências de desenho fora de tudo que é publicado — pedido #46. **Publicada em 07/10/2026** (avisada às 13:40, Brasília), pelo terminal do Victor, **sem o aceite de aparelho** dos blocos `0.20` e `0.21`. Leva a `0.20.0` e a `0.21.0` junto |
| `0.23.0` | Lote K2: o `Topbar` passa a se chamar `Header` (o nome antigo continua), o cabeçalho de site com o menu do celular em popover (GAR-01) e o rodapé de site, `Section variant="footer"` (GAR-06) — pedido #48. **Publicada em 07/10/2026** (21:06, Brasília), pelo terminal do Victor |
| `0.24.0` | Lote K3: a tabela de comparação — `Table` com `stickyHeader`, `stickyFirstColumn`, `fit` e `differencesOnly`, e a pele do HTML de comparação (GAR-12 e GAR-13); a ficha técnica agrupada como padrão do catálogo (GAR-11) — pedido #50. **Publicada em 08/10/2026** (10:34, Brasília), pelo terminal do Victor |
| `0.24.1` | R-24 (o selo preso do nativo), o número do KPI da web em `--text-3xl` e a válvula `--chart-text` — pedido #53. **Publicada em 08/10/2026** (entre 15:25 e 15:30, Brasília), pelo terminal do Victor |
| `0.25.0` | Uma borda só no foco (o anel encosta na peça com borda) e a aba escolhida que se vê (`--segment` + `--shadow-sm`, web e nativo; `t.shadowLayers` no nativo) — [ADR-0059](decisions/0059-uma-borda-so-no-foco-e-a-aba-escolhida-se-ve.md), pedido #54. **Publicada em 08/10/2026** (entre 17:22 e 17:25, Brasília), pelo terminal do Victor |
| `0.26.0` | Lote L: oito cores de categoria no `Badge` (GAR-07), o `KPI` com direção, tom e sem caixa (GAR-09, MNT-04), a caixa de resumo no catálogo (GAR-10) — [ADR-0060](decisions/0060-cor-de-categoria-no-selo-e-o-kpi-com-direcao.md), pedido #56. **Não saiu sozinha**: foi publicada dentro da `0.27.0` |
| `0.26.1` | E16: no navegador, o `DatePicker` do nativo abre o calendário do navegador — pedido #57. **Não saiu sozinha**: foi publicada dentro da `0.27.0` |
| `0.27.0` | As cores dos dois temas seguem a paleta de referência; o amarelo da marca fica — [ADR-0061](decisions/0061-as-cores-dos-temas-seguem-a-paleta-de-referencia.md), pedido #58. **Publicada em 09/10/2026** (entre 13:13 e 13:19, Brasília), pelo terminal do Victor. Leva a `0.26.0` e a `0.26.1` junto |
| `0.28.0` | Lote M: `share` no `Button` e no `IconButton` (GAR-14), `Image frame="phone"` (GAR-15), `--font-heading`, `--weight-extrabold`, a fonte 800 e `numeric` (GAR-16) — [ADR-0062](decisions/0062-compartilhar-moldura-e-numeros.md), pedido #61. **Publicada em 09/10/2026** (entre 19:24 e 19:30, Brasília), pelo terminal do Victor |
| `0.29.0` | Lote N: `Card variant="contrast"` (o tema escuro dentro do cartão) e `Card accent` (o traço de 4 no topo, na cor cheia), web e nativo; a marca chega a um pedaço com tema próprio — [ADR-0063](decisions/0063-o-cartao-contraste-e-o-traco-de-cor.md), pedido #63. **Publicada em 10/10/2026** (entre 13:05 e 13:10, Brasília), pelo terminal do Victor |
| `0.30.0` | A rodada 1 do mapa de rede: o `DependencyGraph` de cima para baixo, em camadas pelo `elkjs` (opcional), com ícone, selos, portas, a linha que diz o que é sem cor, enlaces juntos, minimapa, ir até, caminho, setas e exportar `.drawio`/PNG/SVG; o `Icon` da web aceita o desenho do app — [ADR-0064](decisions/0064-o-mapa-de-rede-rodada-1.md), pedido #64. **Publicada em 10/10/2026** (por volta das 15:38, Brasília), pelo terminal do Victor |
| `0.31.0` | A rodada 2 do mapa de rede: o modo de arrumar (`editable`), desfazer, as rotas do `elkjs` e o desvio (`@tisoap/react-flow-smart-edge`, opcional), rótulos que somem, contêiner que fecha, árvore e círculo, `visibleOnly` e `layoutWorker` — [ADR-0065](decisions/0065-o-mapa-de-rede-rodada-2.md), pedido #65. **Publicada em 10/10/2026** (entre 20:25 e 20:29, Brasília), pelo terminal do Victor |
| `0.32.0` | O lote único — a peça é a da referência, com a cara da Aurea: 12 componentes novos (`CloseButton`, `Slider`, `CheckboxGroup`, `ListBox`, `Link`, `ColorSwatch`, `ProgressCircle`, `TagGroup`, `DatePicker` na web, `ColorArea`, `ColorField`, `ColorPicker`), o nativo na escala de toque, o mapa de rede (MNT-21 a 26) e o site no molde da documentação da referência — [ADR-0066](decisions/0066-a-peca-e-a-da-referencia-e-o-nativo-tem-escala-de-toque.md) a [ADR-0069](decisions/0069-escolher-cor-a-excecao-ao-gradiente-e-o-motor-nosso.md), pedido #66. **Publicada em 14/10/2026** (entre 17:56 e 18:07, Brasília, medido no npm), pelo terminal do Victor |
| `0.33.0` | O lote R — a página inicial e a vitrine da referência: o topo de 56 que embaça, a chave de tema de três posições (`"system"`), a aba "Components" só com peças da Aurea; o `RadioGroup` na web e as peças da vitrine como variações; o espaço do ícone do campo e a camada das janelinhas no posicionador — [ADR-0070](decisions/0070-os-grupos-sao-os-da-referencia.md) e [ADR-0071](decisions/0071-a-pagina-inicial-e-a-vitrine-da-referencia.md), pedido #68. **Publicada em 16/10/2026** (entre 12:29 e 12:45, Brasília, medido no npm), pelo terminal do Victor |

| `0.34.0` | O lote S — **sem linha**: nenhuma peça desenha borda (transparente, nenhuma medida muda), na web e no nativo; a única que fica é a do `Card variant="outline"`, clara; o que sumia ganha fundo (o texto a 6, 10 e 20%), o contorno com tom leva o tom a 16% e a letra mais escura (a "C"), o aviso que era linha vira fundo e o desenho de linha vira desenho cheio — [ADR-0072](decisions/0072-sem-linha.md), pedido #70. **Publicada em 17/10/2026** (entre 08:16 e 08:24, Brasília, medido no npm), pelo terminal do Victor |
| `0.35.0` | O lote T — o site no arranjo da documentação da referência: `AppShell layout="docs"`, `Header tabs`, `Container size="docs"`, cinco tokens de largura, cada área com a sua lateral, a segunda linha da ADR-0072 (a de ponta a ponta embaixo das áreas) e o índice sem barra de rolagem; e o MNT-28 (o nó movido encaixa na grade, no vizinho e onde a linha fica reta) — [ADR-0067](decisions/0067-o-site-segue-a-documentacao-da-referencia.md), seção "Lote T", pedido #72. **Publicada em 17/10/2026** (entre 17:58 e 18:04, Brasília, medido no npm), pelo terminal do Victor |
| `0.36.0` | O lote U — as cores do amarelo ([ADR-0073](decisions/0073-no-claro-a-letra-de-destaque-e-o-amarelo-da-marca.md)), a bolinha do `Radio`, as faixas do mapa (MNT-27) e o clique no nó (pedido 16); a abertura de página (`Section variant="hero"`, `--text-6xl` e `--text-7xl`), o aviso de cookies (`Banner variant="consent"`) e o `Chip` (GAR-19 a 22, [ADR-0074](decisions/0074-a-abertura-o-aviso-de-cookies-e-o-chip.md)); o site com as áreas Getting Started e Releases, os textos para assistentes de IA e o celular e o tablet — pedidos #75 a #82. **Publicada em 20/10/2026** (por volta das 12:12, Brasília, medido no npm), pelo terminal do Victor |
| `0.37.0` | O `CodeBlock` com número de linha e cores ([ADR-0075](decisions/0075-o-codigo-com-cores-e-numero-de-linha.md)); o lote 1, passo 1 — as fichas dizem a verdade (checks 48 e 49) e o desativado de sete peças; o azul da marca como letra de destaque do claro e o item atual da lateral na cor do botão ([ADR-0076](decisions/0076-no-claro-a-letra-de-destaque-e-o-azul-da-marca.md)); o `CodeEditor` que recebe o teclado; e, junto, o site com a parte viva em toda caixa — pedidos #84 a #88. **Publicada em 21/10/2026** (por volta das 16:45, Brasília, medido no npm), pelo terminal do Victor |
| `0.37.1` | O lote 0-A, o primeiro dos lotes de até 3 horas: o conteúdo largo não alarga a página no `DataState`, no `Form` e no corpo do `Dialog` (MNT-33), e o texto de exemplo dos campos a 4,5:1 ou mais na marca `lory` (MNT-29) — pedido #89. **Publicada em 22/10/2026** (entre 08:41 e 08:50, Brasília, medido no npm), pelo terminal do Victor |
| `0.38.0` | O lote 0-B: a legenda do `DependencyGraph` que fecha (`legendCollapsible`) e o botão do minimapa junto do zoom (`minimapToggle`) — MNT-31, a L1 e a M2 da bancada; e o teste da lateral que ainda cobrava o amarelo no claro — pedido #90. **Publicada em 22/10/2026** (entre 11:08 e 11:22, Brasília, medido no npm), pelo terminal do Victor |
| `0.39.0` | O lote F-1: a fonte nova da web — Inter no texto, Sora em todo título (h1 a h6) e IBM Plex Mono no código e nos valores (o `numeric` e o número do `KPI`) ([ADR-0077](decisions/0077-a-fonte-e-a-inter-a-sora-e-a-ibm-plex-mono.md)); os nomes de fonte do nativo trocados, os arquivos do nativo na `0.40.1` — pedido #91. **Publicada em 22/10/2026** (entre 17:23 e 17:29, Brasília, medido no npm), pelo terminal do Victor |
| `0.40.0` | Os campos brancos no claro: o campo solto na página é a cor do cartão com o `--shadow-sm` (a sombra da referência); dentro de uma superfície branca, o cinza de antes; no escuro, nada muda — a web e o site ([ADR-0078](decisions/0078-no-claro-o-campo-e-branco-com-sombra.md)), pedido #92. **Publicada em 22/10/2026** (entre 23:41 e 23:45, Brasília, medido no npm), pelo terminal do Victor |
| `0.40.1` | O nativo: a Inter, a Sora e a IBM Plex Mono em 14 `.ttf` completos (3,17 MB, *"Completas"*), o título na Sora, o `numeric` e o número do `KPI` na Plex Mono; os campos brancos no claro pelo contexto da superfície ([ADR-0077](decisions/0077-a-fonte-e-a-inter-a-sora-e-a-ibm-plex-mono.md) e [ADR-0078](decisions/0078-no-claro-o-campo-e-branco-com-sombra.md)); na web, as quatro superfícies brancas que a 0.40.0 esqueceu — pedido #93. **Publicada em 23/10/2026** (entre 10:44 e 10:54, Brasília, medido no npm), pelo terminal do Victor |
| `0.41.0` | A lateral com o topo e o pé fixos: `header` e `footer` no `Sidebar`, e as partes `Sidebar.Brand`, `Sidebar.User`, `Sidebar.Nav` e `Sidebar.Show` — o 4-C das quinze laterais ([ADR-0079](decisions/0079-a-lateral-com-topo-e-pe-fixos.md)), pedido #94. **Publicada em 23/10/2026** (entre 14:44 e 14:50, Brasília, medido no npm), pelo terminal do Victor |
| `0.42.0` | A lateral até o topo: `AppShell layout="sidebar"` (a lateral do alto até embaixo, com a marca nela, e a barra de cima só sobre o conteúdo, quando o app passa `topbar`), `AppShell.SidebarToggle` e `sidebarFooter` — o MNT-34 ([ADR-0080](decisions/0080-a-lateral-ate-o-topo.md)), pedido #95. **Publicada em 25/10/2026** (entre 08:32 e 08:39, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido #96 (a auditoria de volta ao verde) |
| `0.43.0` | O bloco 1, o catálogo fiel: toda peça com página e toda variação num exemplo vivo, o nativo no site (a chave Web \| Native e as 79 páginas do nativo), quatro travas novas na CI, `CodeBlock tabs`, `SegmentedControl` com `size` e `href`, as fichas das peças só do nativo e as decisões da bancada ([ADR-0081](decisions/0081-a-bancada-do-bloco-1.md)) — pedido #97. **Publicada em 25/10/2026** (entre 17:23 e 17:29, Brasília, medido no npm), pelo terminal do Victor |
| `0.44.0` | O bloco 2, a lateral inteira: `Sidebar` com `collapsible`, `indicator` e `panel`, `Sidebar.Provider`, `Sidebar.Toggle` e `useSidebar` (o Ctrl+B), no item `avatar`, `action`, o grupo que dobra e o `"separator"`, o texto e o fio a 16 e a lateral solta do topo até embaixo ([ADR-0082](decisions/0082-a-lateral-inteira.md)) — pedido #99. **Publicada em 26/10/2026** (entre 19:50 e 19:55, Brasília, medido no npm), pelo terminal do Victor |
| `0.45.0` | As cores, passo A — a paleta da 1.0: os neutros Zinco, no claro o amarelo nunca é letra (o destaque e o link na cor do texto, o link com marca-texto), as marcas brancas nos controles, o foco dos campos no amarelo, o campo branco em todo lugar, o botão ligado amarelo, a linha do tempo consertada, o "aumentar contraste" do sistema e quatro tokens novos; a `lory` congelada ([ADR-0083](decisions/0083-a-paleta-da-1-0.md)) — pedido #100. **Publicada em 27/10/2026** (entre 16:20 e 16:28, Brasília, medido no npm), pelo terminal do Victor |
| `0.46.0` | As cores, passo B — os estilos novos: `pressedStyle` no botão ligado (só web), `selectedStyle` no `SegmentedControl`, `variant` na `Timeline` e `currentStyle` no `BottomNav` (13 valores), web e nativo; a barra de baixo na mesma altura nos nove formatos; as duas exceções, o degradê do `brand-gradient` e os aros por dentro ([ADR-0084](decisions/0084-os-estilos-novos-e-as-duas-excecoes.md)) — pedido #101. **Publicada em 28/10/2026** (entre 09:55 e 10:02, Brasília, medido no npm), pelo terminal do Victor |
| `0.47.0` | As cores, passo C — as treze marcas: a `lory` passa a se chamar Aurea Ember (só o nome, sem apelido) e as 11 marcas da paleta da 1.0 entram, na web (`data-brand`) e no nativo (`brand` no `AureaProvider`); a `Toolbar` nas medidas da referência; o contador e o ponto da barra de baixo vermelhos; a Ember com os estilos novos ([ADR-0085](decisions/0085-as-treze-marcas.md)) — pedido #102. **Publicada em 28/10/2026** (entre 19:35 e 19:41, Brasília, medido no npm), pelo terminal do Victor |
| `0.48.0` | Os acabamentos: o brilho (`glow`, no `Button` e no `IconButton`) e o fio (`ring`, no `Button`, no `IconButton`, no `Badge` e no `Chip`), web e nativo, também por `data-glow`/`data-ring` num contêiner da web; e o `Header` `blurred` que se lê sobre qualquer coisa (o cartão a 72% com o desfoque, só na web) ([ADR-0086](decisions/0086-os-acabamentos.md)) — pedido #103. **Publicada em 29/10/2026** (entre 10:42 e 10:48, Brasília, medido no npm), pelo terminal do Victor |
| `0.49.0` | O mapa desmarca (MNT-35): com um nó escolhido, o clique na área vazia e o Esc chamam `onSelect(null)`, no modo de leitura e no de arrumar, e o leitor de tela ouve `graphSelectionCleared` — pedido #104. **Publicada em 29/10/2026** (entre 14:40 e 14:50, Brasília, medido no npm), pelo terminal do Victor |
| `0.49.1` | Dois encaixes do nativo e uma ficha: o `Button` com `fullWidth` na altura do tamanho (E18), o `brand` do `Header` que encolhe e deixa as ações na tela (E17) e a ficha do tom `link` (E19) — pedido #105. **Publicada em 29/10/2026** (entre 22:28 e 22:35, Brasília, medido no npm), pelo terminal do Victor |
| `0.50.0` | A lateral de contraste (MNT-36): `Sidebar contrast` e `AppShell sidebarContrast` — escura nas duas telas, na flutuante e na de canto reto, com as cores medidas da Ember em tokens só dela ([ADR-0087](decisions/0087-a-lateral-de-contraste.md)) — pedido #106. **Publicada em 30/10/2026** (entre 10:02 e 10:09, Brasília, medido no npm), pelo terminal do Victor |
| `0.51.0` | A ponta da barra de cima (MNT-37): `AppShell topbarActions`, o `actions` do `Header` repassado em todo arranjo — no `layout="sidebar"`, a chave de tema vai para o fim da barra do conteúdo ([ADR-0080](decisions/0080-a-lateral-ate-o-topo.md), seção do MNT-37) — pedido #108. **Publicada em 30/10/2026** (entre 18:20 e 18:23, Brasília, medido no npm), pelo terminal do Victor |
| `0.52.0` | As peças do site B: `AppShell topbarVariant="pill"` e `topbarBlurred`, o `blurred` e o `maxWidth` do `Header` `pill`, `TableOfContents progress` e `indicator="segment"`, o grupo que dobra da `Sidebar` com a seta na ponta, `Accordion indicator="plus"` e `size="lg"` ([ADR-0088](decisions/0088-o-site-b.md)) — pedido #109; e os consertos da auditoria de segurança de 31/10/2026 (`CodeBlock`, `ColorSwatch`, `DataGrid`) — pedido #110. **Publicada em 31/10/2026** (por volta das 21:53, Brasília, medido no npm), pelo terminal do Victor |
O detalhe de cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

**A fila inteira, com a pesquisa de como as referências fazem cada item, está fora do
repositório** (era o `docs/FILA.md`, fotografia de 01/10/2026; saiu em 07/10/2026 com as
referências). Peça ao Victor o documento de achados mais novo para conferir se ela envelheceu.

### O próximo passo

1. **O repositório está aberto desde 24/09/2026**, com um commit só. O histórico antigo e o diário
   ficaram no privado (`aurea-uds-privado`), que não recebe mais envios. Termos técnicos
   consagrados ficam em inglês (mobile, bundler, pull request, issue) — decisão do Victor, 24/09.
2. **A sessão do app adota as peças novas** e mede no aparelho.
3. **Lote 3 — "pode" dado em 24/09/2026:** M-01 (`render` em todos) · M-02 (`classNames` por
   parte) · B-02 (`Text`/`Heading`) · A-04 (nome de ícone checado pelo TypeScript) · B-09 (foco
   com uma linha). Na leitura de 24/09/2026, ele vem **antes** da `1.0`, porque muda a estrutura
   das peças.
   - **Lote 3 FECHADO em 25/09/2026, na versão `0.12.0`**, na branch `claude/friendly-cerf-ctu0v7`.
     O E2 e o M-01 entraram nele, e o `ThemeToggle` também (botão de claro e escuro: lua cheia
     escura no claro, sol cheio amarelo no escuro — aprovado pela imagem em 25/09/2026). **Empurrada
     com o "pode" de 25/09/2026, juntada no pedido #8 e publicada dentro da `0.12.1`.**
   - **A-04 feito.** Pode quebrar a compilação de quem passa ícone numa variável `string`.
   - **B-09 feito e aprovado pela imagem** (25/09/2026): foco de `--focus-width`/`--focus-offset`,
     `check 44`. Os itens de menu ganham a linha de foco, como na referência.
   - **ADR-0052 feita e aprovada pela imagem** (25/09/2026): o botão só de ícone é redondo.
   - **B-02 feito e aprovado pela imagem**, no modelo da referência (25/09/2026): lista fechada de papéis
     (título 1–6, texto, texto pequeno, texto mínimo, código), mais `Heading`, `Paragraph` e
     `Code`, nos dois alvos. O `Text` do nativo que já existe fica.
   - **M-01 só em `Button`, `IconButton` e itens de navegação; M-02 descartado; E2 entra aqui**
     (decisões do Victor, 25/09/2026 — ver "Lote E e decisões", abaixo).
   - **`0.12.1` publicada em 26/09/2026** (pedidos #9 e #10): E10 (recuo de baixo das três
     folhas), E9 (`LinkButton` no nativo) e E11 (`Grid` reparte a sobra). **Falta o aceite de
     aparelho** dos blocos E9, E10 e E11 do `apps/native-smoke`.
     **E4b fechado sem defeito (30/09/2026):** a lista do `Combobox` rola; a testada no app era
     curta. As cópias de diagnóstico R0 a R5 saíram do `apps/native-smoke`.
4. **Lote E** saiu na `0.11.0` — ver "Lote E e decisões de 25/09/2026", abaixo.
5. **Lote 5** (componentes novos e o resto): N-01 a N-09 · B-11 · B-13 · C-11 · C-12 · C-14 ·
   M-03 · M-04. Só acrescenta, então cabe depois da `1.0`.
6. **Lote F (nativo), `0.14.0`, publicado dentro da `0.14.1` em 02/10/2026:** R-10, R-12, R-14,
   R-16, R-19 — propostas aprovadas pelas pranchas (*"ok, 30 e 24"*). **Falta o aceite de
   aparelho** dos blocos LF do `apps/native-smoke`. O que falta da fila está na
   a fila de 01/10/2026 (fora do repositório), §8.
7. **`0.15.0`, publicada em 02/10/2026** (pedido #27), pelo terminal do Victor: R-11 (toda prop de ícone do nativo aceita
   o próprio desenho do app, `AureaIcon`) · R-15 (o glifo do `EmptyState` numa moldura redonda —
   a "C" da prancha; a `illustration` foi reprovada e saiu) · R-18 (`Timeline` com `icon`, `tone`,
   `trailing` e `between`) · R-21 (`FileInput` em `/system/file`) · R-22 (o `PhotoInput` abre a
   foto; miniatura quadrada de 64, X todo fora) · E13 (no navegador, o nativo manda
   `useNativeDriver: false`). Escolhas do Victor: *"1 c, 2 sim, 3 sim"* e *"B pode seguir"*. Falta
   o aceite de aparelho dos blocos R-11, R-15, R-18, R-21 e R-22.
8. **`0.16.0`, publicada em 02/10/2026** (por volta das 19:45, Brasília), pelo terminal do Victor: no tema claro, a letra de destaque passa do
   marrom ao amarelo escurecido `#826202` ([ADR-0054](decisions/0054-no-tema-claro-a-letra-de-destaque-e-ouro-escuro.md)),
   a "D" da prancha (*"D"*). As fotos do catálogo vieram da CI no pedido #30 (o `main` voltou ao
   verde em 02/10/2026).
9. **`0.16.1`, publicada em 03/10/2026** (por volta das 08:40, Brasília), pelo terminal do Victor,
   da junção do pedido #33: o círculo do `BottomNav` `circle-bold` virava um risco no app rodando no
   navegador — o `react-native-web` passa `flex: 0` cru para o CSS. E na barra estreita
   (`width="content"`) o rótulo cortava dentro do círculo, na web e no nativo. Aprovado pela
   imagem (*"pode"*). Para a barra menos larga, o app passa `width="content"`.
10. **`0.17.0`, publicada em 03/10/2026** (por volta das 16:50, Brasília), pelo terminal do Victor, da junção do pedido #35 ([ADR-0055](decisions/0055-a-barra-de-baixo-fica-parada-e-mais-baixa.md)):
   o `BottomNav` não anda mais quando se troca de aba (o nome escolhido engrossava, e o círculo do
   `circle-bold` era o próprio item); fica mais baixa (54 a 62, era 73), com o nome
   colado no ícone; e ganha `capsule` e `expand` (só o escolhido mostra o
   nome — exceção, por ordem do Victor, à regra "o nome nunca some"). A "B" da bancada já existia:
   é o `pill`. O app não muda nada para a barra parar e afinar. Falta o aceite de aparelho (bloco
   `0.17` do `apps/native-smoke`).
11. **`0.18.0`, publicada em 03/10/2026** (por volta das 22:18, Brasília), pelo terminal do Victor,
   da junção do pedido #38 — o Lote G, aprovado pela bancada (*"pode, aprovado o lote G"*). Quatro pedidos de um consumidor novo, da web (a fila de 01/10/2026 (fora do repositório), §9): AN-07 (o
   `Progress` sem total, com `detail` e `tone`), AN-08 (`Grid` com `min` por nome), AN-04 (`NavList`
   com `avatar` e `indicators`) e AN-01 (o `AppShell` com o botão de recolher na junção e a trilha
   sozinha entre 1024 e 1279 — [ADR-0056](decisions/0056-a-lateral-recolhe-pelo-botao-na-juncao.md)).
   O shell vivo se mede no banco novo `apps/keyboard-probe/shell.html`. Falta o aceite de aparelho
   (blocos AN-07, AN-08 e AN-04 do `apps/native-smoke`). ⚠ O empacotador do app reescreve `:dir(rtl)` e a regra deixa de pegar:
   na folha do core, direção se resolve com propriedade lógica, não com `:dir()`.
12. **`0.19.0`, o Lote H, publicado dentro da `0.19.1` em 04/10/2026** (pedido #40) — os quatro pedidos que
   faltavam do consumidor novo da web (a fila de 01/10/2026 (fora do repositório), §9): AN-06 (`TreeView` que carrega ao abrir,
   `selectedId`), AN-05 (`Gallery` com escolha em lote, vídeo e carga por partes), AN-03
   (`MessageComposer` que anexa, responde e edita) e AN-02 (`MessageList` para conversa longa). **Sem
   dependência nova**: a conversa é uma janela que o app troca pelas pontas, e a Aurea não deixa a
   tela pular (decisão do Victor, [ADR-0057](decisions/0057-a-conversa-longa-e-uma-janela-sem-virtualizacao.md)).
   Medido montado no banco `apps/keyboard-probe/lote-h.html` (`tests/visual/lote-h.spec.ts`). Aprovado
   pela bancada (*"Pode"*, 04/10/2026), com o item da árvore em cápsula, pedido dele olhando a
   bancada. As seis regras de `:dir(rtl)` que sobraram (`Badge`, `Select`,
   `Switch`) ficaram para depois, por decisão dele (a fila de 01/10/2026 (fora do repositório), §6, D-01).
13. **`0.19.1`, publicada em 04/10/2026** (por volta das 18:38, Brasília), pelo terminal do Victor, da junção do pedido #41: no Android o escolhido do `BottomNav`
   saía quadrado no `capsule` e no `circle-bold` (e, pela mesma causa, no `circle`, `circle-raised` e
   `circle-outline`). ⚠ **A regra que custou caro:** no React Native, caixa que só tem
   `borderRadius` e ganha cor DEPOIS de montada não recebe o raio no Android (react-native#52415,
   aberto) — ela leva `collapsable={false}`, ou cor/borda desde o começo. Quem cobra:
   `tests/unit/native-capsula-android.test.tsx`. **Aceito no aparelho Android do Victor** em
   04/10/2026 (bloco `0.19.1`, no topo do `apps/native-smoke`: *"deu certo"*). Leva a `0.19.0` junto.
14. **`0.20.0`, o Lote I, feito em 06/10/2026 e publicado dentro da `0.22.0` em 07/10/2026** — o grupo 1 da fila de
   06/10/2026 (a fila agora mora no documento de achados do Victor, fora do repositório), com o
   "pode" do mesmo dia: A5 (o `SegmentedControl` do nativo não quebra o rótulo, e `fullWidth` nos dois
   alvos), C9 e MNT-05 (`panel="plain"` no `Tabs`, nos dois alvos), R-23 (`exif` → `takenAt` no
   `PhotoInput`, e várias fotos de uma vez da galeria), HER-01 (o canto contínuo do iOS em todo o
   nativo), HER-02 (`Alert` e `Toast` com 22, nos dois alvos) e HER-03 (a folha de baixo com 32,
   [ADR-0058](decisions/0058-a-folha-de-baixo-tem-32-de-canto.md)). ⚠ **A regra nova:** todo raio
   do nativo passa por `canto()` (`estilos.ts`); raio escrito à mão reprova em
   `tests/unit/native-canto-continuo.test.tsx`. Aprovado pela bancada (*"pode, folha com 32"*,
   06/10/2026). Falta o aceite de aparelho (bloco `0.20`, no topo do
   `apps/native-smoke`). O LOGO-01 fechou sem peça nova (decisão do Victor: o app usa o encaixe
   `leading` do `Button`).
15. **`0.21.0`, o Lote J, feito em 06/10/2026 e publicado dentro da `0.22.0` em 07/10/2026** — aprovado pela bancada
   (*"aprovado o J"*): CHK-01 (`RadioGroup variant="card"`, o cartão de escolha, no nativo; a pele
   do `Card` mora em `estilos.ts`) e GAR-08 (o cartão clicável na horizontal volta a ter a coluna da
   foto, na web — `:where(.card-interactive)`), mais o achado da medição: o cartão-link e o item de
   menu-link saíam sublinhados. Quem cobra no navegador: `card-horizontal-clicavel.spec.ts` e
   `link-sem-sublinhado.spec.ts`. ⚠ **A lição:** depois de mudar CSS, rodar também os testes de
   navegador (`pnpm exec playwright test`), não só os unitários — o `skin.spec` do Lote I só foi
   pego assim. E a barra de cima do catálogo mostra a contagem de tokens: token novo muda a foto
   `topo` da CI.
16. **`0.22.0`, o Lote K1, feito na madrugada de 06 para 07/10/2026 e publicado em 07/10/2026** (pelo terminal do Victor) — o
   Victor mandou fazer (*"pode fazer o K1 hoje"*) e foi dormir; **aprovado pela bancada em
   07/10/2026** (*"aprovo"*), pedido #46. A página de
   SITE, na web: `Container` (GAR-02), `Grid.Item span` pela camada responsiva (GAR-03, família
   `grid-span`), `Section` com `surface`, `spacing` e `theme` (GAR-04 e GAR-05). E o conserto do
   GAR-05: as 22 regras `[data-theme="light"] X` levam uma guarda de força zero e não vazam mais
   para dentro de uma faixa escura. ⚠ **Regra nova:** seletor de tema claro com descendente leva
   a guarda — `tests/unit/tema-na-secao.test.tsx` reprova quem esquecer. O cabeçalho e o rodapé
   de site (GAR-01 e GAR-06) ficaram para a próxima sessão, por decisão do Victor.

17. **`0.23.0`, o Lote K2, feito em 07/10/2026, aprovado pela bancada** (*"aprovado, B, pode"*) **e
   publicado no mesmo dia** (21:06, Brasília, pelo terminal do Victor, da junção do pedido #48) —
   com o "pode" do Victor (*"pode fazer o GAR-01 e GAR-06"*): o `Topbar` passa a se chamar
   **`Header`** nos dois alvos (*"pode alterar nome não tem problema"*), com o `Topbar` mantido como
   nome antigo; o cabeçalho de site é o `Header` com `items`, `current`, `actions`, `maxWidth` e
   `menuId` (GAR-01); o rodapé é a `Section variant="footer"` (GAR-06). O menu do celular desce
   abaixo da barra (*"Painel que desce"*) e é um **popover** nativo, sem JavaScript — a opção "B" do
   Victor, depois de medido que o `<details>` da primeira versão não fechava com o Esc nem com o
   toque fora. Quem cobra: `site-gar01-06.test.tsx` e `site-gar01-06.spec.ts`. ⚠ **A lição:** o
   Python no Windows grava CRLF; ao reescrever arquivo do repositório com ele, use `newline="\n"`
   e confira com `git ls-files --eol -m`.

18. **`0.24.0`, o Lote K3, feito em 08/10/2026, aprovado pela bancada** (*"aprovado, pode"*) **e
   publicado no mesmo dia** (10:34, Brasília, pelo terminal do Victor, da junção do pedido #50) — com o "pode" do Victor
   (*"pode, e depois GAR-11, GAR-12 e GAR-13"*) e as quatro decisões dele, tomadas depois de ver a
   referência principal: a `Table` ganha `stickyHeader`, `stickyFirstColumn`, `fit` e
   `differencesOnly` (GAR-12 e GAR-13), e a pele do HTML de comparação (`th scope="rowgroup"`,
   `th scope="row"`, `td data-best`, `tr data-same`); a ficha agrupada (GAR-11) é um padrão do
   catálogo com `Card` + `DataList`, sem código novo. Quem cobra: `tabela-gar11-13.test.tsx` e
   `tabela-gar12-13.spec.ts`.

19. **`0.24.1`, feita e aprovada pela bancada em 08/10/2026** (*"aprovado, pode"*) **e publicada no
   mesmo dia** (entre 15:25 e 15:30, Brasília, pelo terminal do Victor, da junção do pedido #53) — três consertos
   de consumidores: R-24 (o selo preso do nativo segue a referência principal: encosta no canto e
   sai 25% do próprio tamanho; mínimo de 16; preso ao círculo do `IconButton`, e não à área de
   toque), o número do KPI da web em `--text-3xl` (a ficha prometia; o CSS não aplicava) e a
   válvula `--chart-text` para o texto do gráfico. ⚠ **A regra nova:** deslocamento em
   porcentagem (`translateX: "25%"`) só existe na Nova Arquitetura do React Native, e o pacote
   aceita desde a 0.76 — no nativo, o deslocamento sai em pontos, a partir da medida da peça.

20. **`0.25.0`, feita e aprovada pela imagem em 08/10/2026** (*"aprovado, pode"*) **e publicada no
   mesmo dia** (entre 17:22 e 17:25, Brasília, pelo terminal do Victor, da junção do pedido #54) — com o "pode" do Victor
   (*"A, pode criar os tokens, pode fazer. e me mostre antes"*), [ADR-0059](decisions/0059-uma-borda-so-no-foco-e-a-aba-escolhida-se-ve.md):
   o foco é **uma linha só** (na peça com borda, a borda vira a cor do foco e o anel encosta nela;
   sem borda, o anel continua afastado; checkbox marcado e switch ligado também) e a **aba
   escolhida se vê** (`--segment` + `--shadow-sm`, no `Tabs` e no `SegmentedControl`, web e
   nativo). ⚠ **A regra nova:** peça nova com borda entra na lista da regra de foco (`aurea.css`,
   logo abaixo do `:focus-visible`); quem cobra é a varredura do catálogo, com Tab, nos três
   navegadores. ⚠ **A lição:** a borda dos botões muda de cor com transição — medir o foco antes
   de ela terminar escondeu metade das peças com duas linhas (39 viraram 84).

21. **`0.26.0`, o Lote L, feita e aprovada pela bancada em 09/10/2026** (*"aprovado, pode"*) **e
   publicada dentro da `0.27.0` no mesmo dia** (pedido #56) — com
   as escolhas do Victor depois de ver a referência principal (*"nome de cor"*, o KPI com direção,
   o resumo como padrão do catálogo), [ADR-0060](decisions/0060-cor-de-categoria-no-selo-e-o-kpi-com-direcao.md):
   GAR-07 (oito cores de categoria no `Badge`, tokens `category-*`, web e nativo), GAR-09 e MNT-04
   (`KPI` com `direction`, `tone`, `directionLabel` e `variant="plain"`, web e nativo; o número do
   nativo em `3xl`, igual à web) e GAR-10 (a caixa de resumo, padrão do `Card` no catálogo). Junto,
   o `.gitattributes` marca os ícones gerados do nativo. ⚠ **A regra nova:** a marcação pura da web
   (`markup.tsx`) não importa o `Icon` (ele usa hook); ícone ali é desenho do CSS por máscara, como
   o menu do `Header` e a seta do `KPI`. ⚠ **A lição:** na bancada do nativo, o provedor precisa do
   `fontFamilies` do app — sem ele o negrito some, e a foto mente.

22. **`0.26.1`, o E16, feita em 09/10/2026 e publicada dentro da `0.27.0` no mesmo dia** (pedido #57;
   *"pode seguir com o E16"*, *"pode faça tudo"*): no navegador
   (`react-native-web`), o `DatePicker` do nativo não abria nada — a biblioteca de data não tem versão
   web. Agora o `<input type="date">` do navegador fica invisível por cima do gatilho da Aurea (a pele é
   a nossa, o calendário é o do navegador), com `showPicker()` no clique e o ícone do campo esticado
   para abrir também dentro de página de outro endereço. ⚠ **A lição:** o `showPicker()` não existe no
   Safari do iPhone e é recusado pelo Chrome em página de outro endereço — por isso o campo fica POR
   CIMA, e não escondido e aberto por código. Quem cobra: `native-e16-datepicker-web.test.tsx`.

23. **`0.27.0`, as cores da paleta de referência, feita em 09/10/2026** (*"pode faça tudo"*),
   [ADR-0061](decisions/0061-as-cores-dos-temas-seguem-a-paleta-de-referencia.md): os neutros e as
   cores de estado dos dois temas seguem a paleta de referência escolhida pelo Victor (nome fora do
   repositório); o amarelo, os raios, a fonte e os ícones continuam os nossos. O fundo cheio de estado
   é o mesmo nos dois temas; letra, ícone, borda e barra usam o par `-400`; o selo cheio é o botão
   cheio. ⚠ **A lição:** cor de FUNDO e cor de LETRA são papéis diferentes, mesmo quando o valor
   coincide num tema — eram o mesmo token, e a troca da paleta mostrou 24 lugares que pintavam letra
   com a cor de fundo. **Aprovada pela bancada em 09/10/2026** (*"aprovado, pode enviar"*), com os três
   tons trocados por outro tom da própria paleta, **e publicada no mesmo dia** (entre 13:13 e 13:19,
   Brasília, pelo terminal do Victor, da junção do pedido #58). Leva a `0.26.0` e a `0.26.1` junto.

24. **`0.28.0`, o Lote M, feita em 09/10/2026** (*"pode construir a 0.28.0"*),
   [ADR-0062](decisions/0062-compartilhar-moldura-e-numeros.md) — os três pedidos do grupo 2 (o site),
   com a pesquisa além da fila de referências, por ordem do Victor: GAR-14 (`share` no `Button` e no
   `IconButton`, web e nativo — detecta o recurso; sem ele, copia e mostra "Link copiado" preso ao
   botão, com a medida dele), GAR-15 (`Image frame="phone"`, moldura GENÉRICA, e a captura do escuro)
   e GAR-16 (`--font-heading`, `--weight-extrabold`, a fonte 800, `numeric`, a tabela com algarismos
   da mesma largura). Junto, o "copiado" que fala e dois consertos do nativo que a `0.27.0` deixou de
   fora (o `Text` com tom e a barra do `Progress` pintavam com a cor de fundo). ⚠ **A regra nova:** o
   aviso preso a um botão tem a MEDIDA do botão — o recheio é UMA regra (`.btn,.toast-anchored`).
   ⚠ **A lição:** no `aurea.js`, rolar o campo do próprio aviso (selecionar o link) disparava o
   "rolou a página, fecha" — medido no navegador, e só lá: o teste de unidade passava.
   **Aprovada pela bancada** (*"aprovado, pode enviar a 0.28.0"*) **e publicada no mesmo dia**
   (entre 19:24 e 19:30, Brasília, pelo terminal do Victor, da junção do pedido #61).

25. **`0.29.0`, o Lote N, feita em 10/10/2026** (*"como recomendado e A, pode construir"*),
   [ADR-0063](decisions/0063-o-cartao-contraste-e-o-traco-de-cor.md) — os dois pedidos de um app do
   nativo: MT-01 (`Card variant="contrast"`: o tema escuro dentro do cartão; no claro, o cartão do
   escuro sem linha; no escuro, o contorno amarelo) e MT-02 (`Card accent`: o traço de 4 no topo, na
   cor CHEIA, exceção à ADR-0061), web e nativo, com o token `--accent-width`. Junto, o conserto que
   o MT-01 achou: uma faixa escura numa página `lory` saía com o escuro da Aurea (desde a `0.22.0`).
   ⚠ **A regra nova:** no nativo, janela que sai do fluxo (folha, diálogo) pinta o FUNDO com
   `useTokensDoApp()` — o `ForaDaMarca` devolve o contexto do app só a quem está dentro dela.
   ⚠ **A lição:** a primeira versão abria a lista do `Select` de dentro do `contrast` com o fundo do
   escuro e a letra do claro; só a bancada no navegador mostrou. E o traço no Android é uma faixa
   recortada no canto, não uma borda mais grossa (react-native#51926, fechada sem conserto).
   **Aprovada pela bancada** (*"aprovado, pode enviar a 0.29.0"*) **e publicada no mesmo dia** (entre
   13:05 e 13:10, Brasília, pelo terminal do Victor, da junção do pedido #63).

26. **`0.30.0`, a rodada 1 do mapa de rede, feita em 10/10/2026** (*"como recomendado, pode construir a
   rodada 1"*), [ADR-0064](decisions/0064-o-mapa-de-rede-rodada-1.md) — os pedidos de um app de
   topologia: o `DependencyGraph` de cima para baixo, arrumado em camadas pelo `elkjs` (peer OPCIONAL
   novo), com ícone, selos e portas no nó; a linha que diz o que é sem cor (traço, peso, marca, número,
   nome da porta nas pontas, legenda); linhas repetidas juntas num botão "×n"; minimapa (fora da lista
   de recusas), botões de zoom, ir até, caminho, vizinhos, esconder sem refazer; texto grande, alto
   contraste e setas; exportar `.drawio` (nosso), PNG e SVG (`modern-screenshot`, peer OPCIONAL novo).
   Junto, MNT-01 (7 nomes na tabela Carbon→Phosphor), MNT-02(a) (o `Icon` da web aceita o desenho do
   app) e MNT-03 (o README manda reiniciar o servidor). ⚠ **As regras novas:** no mapa, a espessura da
   linha vai pela variável do motor (`--xy-edge-stroke-width`) — a folha da Aurea mora numa camada e a
   do motor não; a lista de alças declaradas só vale até a primeira medida; e no mapa de leitura as
   alças existem, escondidas e surdas. ⚠ **A lição:** os três defeitos só apareceram na bancada com o
   código real, e o banco `apps/keyboard-probe/rede.html` importa a folha do motor sem camada — o pior
   caso — para o teste valer para quem a importa assim. **Aprovada pela bancada** (*"aprovado, pode
   enviar a 0.30.0"*) **e publicada no mesmo dia** (por volta das 15:38, Brasília, pelo terminal do
   Victor, da junção do pedido #64).

27. **`0.31.0`, a rodada 2 do mapa de rede, feita em 10/10/2026** (*"como recomendado, pode construir a
   rodada 2"*), [ADR-0065](decisions/0065-o-mapa-de-rede-rodada-2.md) — mexer no mapa: o modo de arrumar
   (`editable`: laço, Shift, arrastar vários, grade de 16, alinhar, distribuir, fixar, reorganizar, setas),
   desfazer como pilha de comandos e o aviso `onLayoutChange`; as rotas do `elkjs` e o desvio pelo
   `@tisoap/react-flow-smart-edge` (peer OPCIONAL novo), com a ponte nossa; rótulos que somem; o
   contêiner `parentId` que fecha, a subárvore por dominador e a nuvem; a árvore e o círculo;
   `visibleOnly` e `layoutWorker`. Junto: o teclado do mapa de leitura (duas paradas por nó, linha em
   inglês, publicado na `0.30.0`) e o aviso de compilação que faltou em quatro versões. ⚠ **As regras
   novas:** frase nova no `AureaStrings` sai com o nome dela sob "⚠ Pode quebrar a compilação" — o check
   31b cobra, contra as frases guardadas no `released-surface.json`; e o rótulo de HTML do mapa fica
   acima das linhas e dos nós (`--graph-label-z`). ⚠ **A lição:** a bancada achou seis defeitos que os
   testes não pegavam (rótulo por baixo do contêiner, botão em cima da porta, clique que escolhia o nó,
   desvio jogado fora, caixa de contêiner na árvore, ícone da nuvem para fora — este, o Victor viu); cada
   um ganhou o teste que reprova sem o conserto. **Publicada em 10/10/2026** (entre 20:25 e 20:29,
   Brasília, medido no npm), pelo terminal do Victor, da junção do pedido #65.

28. **`0.32.0`, o lote único, feita de 11 a 14/10/2026** em 12 passos na branch `claude/lote-q` — a regra
   do Victor de 11/10: a peça é a da referência principal, e por cima só entra o que é da Aurea. A escala
   e a entrelinha, as ações, os campos (`Slider`, `CheckboxGroup`, `ListBox`), a navegação, as janelas, os
   dados, os avisos, o texto, o nativo na escala de toque ([ADR-0066](decisions/0066-a-peca-e-a-da-referencia-e-o-nativo-tem-escala-de-toque.md))
   e as nove peças novas dele, o mapa de rede (MNT-21 a 26), o site no molde da documentação da referência
   ([ADR-0067](decisions/0067-o-site-segue-a-documentacao-da-referencia.md)), o `DatePicker` da web
   ([ADR-0068](decisions/0068-o-datepicker-da-web-e-componente.md)) e a família de cor inteira — `ColorArea`,
   `ColorField`, `ColorPicker`, a trilha de cor do `Slider` e as amostras do `ColorSwatch`, com todos os
   canais e o alfa ([ADR-0069](decisions/0069-escolher-cor-a-excecao-ao-gradiente-e-o-motor-nosso.md)).
   Cada passo aprovado pela bancada; a cor por último (*"continue e tudo aprovado"*, 14/10/2026).
   ⚠ **As regras novas:** o catálogo carrega uma CÓPIA do CSS do core (`apps/catalog/assets/catalog.css`) —
   depois de mexer no core, remontar o catálogo antes de rodar a varredura, ou ela mede o CSS velho; o
   leitor da API soma os ramos de `Base & (A | B)` escrito direto no parâmetro; e o `InputGroup` lê do
   `Input` de dentro o tamanho E a pele (`secondary`); a medida de uma peça muda por CLASSE, nunca pelo
   contexto (`btn-kbd`, e não `.btn .kbd`). ⚠ **A lição:** os passos rodaram só os testes do próprio passo, e a
   suíte INTEIRA de navegador (843 testes, três navegadores), rodada no fechamento, pegou sete defeitos que
   ninguém tinha visto — o foco de duas linhas e a cor que some no alto contraste nas amostras, o Tab que
   descia e voltava no cabeçalho do site, o título quebrado no meio da palavra no celular, o `Kbd` de duas
   alturas e as peças de cor fora das travas de inválido e de máscara. A suíte inteira roda uma vez, no fim do
   lote (a regra de 01/11/2026, em "Como a fila anda"). **Publicada em 14/10/2026** (entre 17:56 e 18:07,
   Brasília, medido no npm), pelo terminal do Victor, da junção do pedido #66.

29. **`0.33.0`, o lote R, feito de 14 a 16/10/2026** na branch `claude/lote-r` — a página inicial contra a da
   referência, *"cada milímetro"* (o Victor, 15/10/2026), e *"A, B, C, pode"*: as diferenças na peça (o topo de 56 que
   embaça, a chave de tema de três posições e a preferência `"system"`, o rodapé de uma linha, o selo sem linha, o
   `quiet`), as peças que a vitrine dela usa (o `RadioGroup` na web, `description`/`labelHidden`, o tracinho do
   `OTPField`, o botão suave, as partes do `Card`, o `Alert` com botão, o atalho na `ListBox`, o `Avatar` colorido) e a
   aba "Components" da vitrine, viva, só com peças da Aurea; depois, o espaço do ícone do campo (24 → 12, a busca 8),
   o "Ctrl K" separado, a linha entre as seções, a `CommandPaletteShell` que fecha e a camada das janelinhas no
   posicionador — [ADR-0070](decisions/0070-os-grupos-sao-os-da-referencia.md) e
   [ADR-0071](decisions/0071-a-pagina-inicial-e-a-vitrine-da-referencia.md). Cada passo na bancada antes do git; o
   sol da chave no amarelo da marca, puro (*"não existe sol marrom"*; das três formas mostradas rodando, a "B", com
   1,91:1 no branco medido). ⚠ **As regras novas:** a camada (`z-index`) de janelinha mora no
   POSICIONADOR do motor (a classe `positioner`) — na caixa de dentro, estática, ela não vale; e o sprite do site mede
   também os estados que só a parte viva desenha (a chave de tema nas três escolhas). ⚠ **A lição:** o Victor achou
   três defeitos que a medição do dia não pegava — o texto do campo a 24 do ícone (com 13 do outro lado, e o
   comentário da regra prometendo 12), a chave vazia ao clicar e a caixa cortada pelo topo fixo; cada um ganhou o teste
   que reprova sem o conserto. E o `TaskStop` não mata os filhos de uma suíte em segundo plano: antes de rodar outra,
   conferir que a anterior morreu. **Publicada em 16/10/2026** (entre 12:29 e 12:45, Brasília, medido no npm), pelo terminal do
   Victor, da junção do pedido #68 (que trouxe junto o #67, o registro da 0.32.0).

30. **`0.34.0`, o lote S, feito de 16 a 17/10/2026** na branch `claude/lote-s` — **sem linha**
   ([ADR-0072](decisions/0072-sem-linha.md)). O Victor marcou na vitrine as peças sem borda (*"não tem linha ao redor, e
   isso acho bonito"*), viu a proposta em todas as páginas lado a lado com a de hoje e decidiu *"quero tudo sem borda, sem
   exceções"*; depois, cada peça que sumiu ao lado da sugestão de fundo: *"caixa B, o resto tudo B"*; e, para o contorno
   colorido, a "C" (o tom a 16% e a letra mais escura). ⚠ **As regras novas:** nenhuma borda com cor, nem o anel fino de
   `box-shadow` — quem cobra é o `tests/unit/sem-linha.test.tsx` (o código, em todo estado) e a varredura do catálogo; a
   única linha é a do `.card-outline`; o fundo novo vai SÓ na peça que sumiu (um seletor largo, `.badge:not(...)`,
   pintou por cima do fundo calibrado do suave); o marcador do item ATUAL não é contorno, é indicador (desenho cheio); e
   desenho por máscara precisa da regra do alto contraste. ⚠ **As lições:** a suíte INTEIRA achou, depois do "aprovado",
   onze defeitos que os testes do lote não pegavam; as fotos, olhadas uma a uma, acharam mais dois; e a montagem parcial
   (`build:core`/`build:catalog`) deixou o catálogo velho — antes de commitar, `pnpm build` inteiro e `git status` limpo.
   Falhas que já existem na 0.33.0, fora da CI: o crachá `danger` cheio da `lory` no claro (4,03:1, decisão do Victor), a
   largura da prosa (705 > 700) e, no WebKit do Windows, o nome do `NavList` e as setas do `Radio`. **Publicada em
   17/10/2026** (entre 08:16 e 08:24, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido #70 (que levou
   junto o #69, o registro da 0.33.0).

31. **`0.35.0`, o lote T, feito em 17/10/2026** na branch `claude/lote-t` — o mapa de rede (MNT-28: o nó movido encaixa na
   grade, no vizinho e onde a linha fica reta) e o site no arranjo da documentação da referência, pedido a pedido com as
   fotos dela ao lado das nossas: `AppShell layout="docs"`, `Header tabs`, `Container size="docs"`, cinco tokens de
   largura, a segunda linha da ADR-0072 e cada área com a sua lateral — [ADR-0067](decisions/0067-o-site-segue-a-documentacao-da-referencia.md),
   seção "Lote T". Aprovado na bancada (*"aprovado, pode seguir"*). A trava do site (`scripts/trava_do_site.py`) entrou
   como rascunho, FORA do validador: 30 reprovações, que são o trabalho do próximo lote. ⚠ **As regras novas:** medida de
   site se tira da PÁGINA da referência, na largura da tela do Victor (a dele: 1920 com zoom de 150% = 1280 × 663), e se
   repete como número na prova (`site-docs-arranjo.spec.ts`); e o texto se mede pelo TEXTO (`Range`), não pela caixa do
   item — medi a caixa, chamei de texto, e levei um "16" errado ao Victor. ⚠ **As lições:** a barra de rolagem
   escondida na coluna apareceu no índice de DENTRO, que numa tela baixa encolhe e rola sozinho; um `sticky` dentro de
   outro soma os deslocamentos; e a borda transparente do sem linha ainda soma 1 à medida (a barra tinha 101, e tudo
   embaixo ficava 1 abaixo da referência). **Publicada em 17/10/2026** (entre 17:58 e 18:04, Brasília, medido no npm),
   pelo terminal do Victor, da junção do pedido #72.

32. **`0.36.0`, o lote U, feito de 17 a 19/10/2026** em oito passos, cada um aprovado na bancada e juntado no `main`
   (pedidos #75 a #81), e fechada em 20/10/2026 no pedido #82 (*"Pode fechar a 0.36.0 agora"* — os apps consomem pelo
   npm, não pelo GitHub). As cores do amarelo ([ADR-0073](decisions/0073-no-claro-a-letra-de-destaque-e-o-amarelo-da-marca.md)),
   a bolinha do `Radio`, o MNT-27, o pedido 16; os GAR-19 a 22 ([ADR-0074](decisions/0074-a-abertura-o-aviso-de-cookies-e-o-chip.md));
   e o site: Getting Started, Copy Prompt e `llms.txt`, Releases, celular e tablet. ⚠ **As regras novas:** a abertura
   mede a largura da FAIXA (`@container`), não a da janela; o `validate.py` cobra o componente e a frase novos também na
   seção `## [x] — em construção` e na da versão datada ainda não registrada; e nome de componente entre crases na versão
   em construção põe o selo "Updated" no site — só crases em quem mudou. ⚠ **As lições:** a suíte local não cabia antes
   de o Victor desligar, e a CI fez o papel dela (a varredura do WebKit caiu uma vez por lentidão da máquina do GitHub,
   21 → 91 min, sem código novo, e passou rodada de novo); o `check-pack` reprova no Git Bash (rodar pelo PowerShell); e
   um teste com a última versão escrita à mão reprovaria a cada versão (`site-releases.spec.ts` passou a ler o
   `package.json`). **Publicada em 20/10/2026** (por volta das 12:12, Brasília, medido no npm), pelo terminal do Victor,
   da junção do pedido #82.

33. **`0.37.0`, feita de 20 a 21/10/2026** — o `CodeBlock` com número de linha e cores (ADR-0075, #84); o lote 1, passo 1:
   as fichas dizem a verdade (o check 48, a plataforma da ficha é o que o pacote exporta; o check 49, o estado prometido
   tem prova no código) e o desativado de sete peças (#85); o azul da marca como letra de destaque do claro e o item
   atual da lateral na cor do botão (ADR-0076, #86); o fechamento (#87); e o site com a parte viva em toda caixa (#88),
   que achou e consertou o `CodeEditor` que não dizia receber o teclado. ⚠ **As regras novas:** as caixas do site
   acendem sob o provedor ÚNICO do site (`live/vivo.tsx`, por portal) — com uma segunda raiz, a página ganha duas
   regiões de avisos com o mesmo nome; a página de componente carrega o `live.js` (ou o `live-motores.js`) NO LUGAR do
   `search.js`. ⚠ **As lições:** o `publicar.mjs` não monta, empacota o `dist/` que houver — antes de mandar o Victor
   publicar, `pnpm build` na pasta dele; e conserto de pacote juntado antes do publish sai na versão que está sendo
   publicada, não na seguinte. **Publicada em 21/10/2026** (por volta das 16:45, Brasília, medido no npm), pelo terminal
   do Victor, da junção do pedido #88.

34. **`0.37.1`, o lote 0-A, feito em 21/10/2026** — o primeiro lote da regra nova (até 3 horas, uma versão por lote): os
   pedidos do app de rede MNT-33 (`minmax(0, 1fr)` no `.data-state`, no `.form` e no `.dialog-body`) e MNT-29 (era da
   MARCA: na `lory`, a cor fraca dava 2,51 a 3,58; agora 4,87 a 6,22), e o registro da 0.37.0. ⚠ **As lições:** o
   teste com a tabela DIRETO na grade passava com o defeito — o caso real do app tem um invólucro, e só com ele a prova
   reprova o CSS de antes; e teste que acrescenta a folha DEPOIS de desenhar mede a transição do fundo (2,24 onde a
   página real dá 4,69) — a folha vai no `<head>`. **Publicada em 22/10/2026** (entre 08:41 e 08:50, Brasília, medido
   no npm), pelo terminal do Victor, da junção do pedido #89. O registro entrou no lote seguinte (0-B, pedido #90).

35. **`0.38.0`, o lote 0-B, feito em 21 e 22/10/2026** — o MNT-31 do app de rede: a legenda e o minimapa do mapa cobriam os
   nós dos cantos de baixo. Quatro formas rodando na bancada; o Victor escolheu *"L1 para legenda e M2 para minimapa"*:
   `legendCollapsible` (o botão "Legenda" parado no canto, a lista sobe acima dele) e `minimapToggle` (o botão "Visão
   geral" junto dos de zoom). ⚠ **A lição:** o motor do mapa NÃO repassa o `id` ao minimapa — o `aria-controls` do botão
   apontava para um nome que não existia; o nome fica numa caixa em volta. E a ficha do componente é contrato: prop nova sem
   a ficha reprova no validador. **Publicada em 22/10/2026** (entre 11:08 e 11:22, Brasília, medido no npm), pelo terminal
   do Victor, da junção do pedido #90. O registro entrou no lote seguinte (a fonte, 0.39.0).

36. **`0.39.0`, o lote F-1, feito em 22/10/2026** — a fonte nova da web ([ADR-0077](decisions/0077-a-fonte-e-a-inter-a-sora-e-a-ibm-plex-mono.md)):
   a Inter (a do autor, sem o `ss02`, cortada para o latino), a Sora (em todo h1 a h6, por `:where()` de força zero) e a
   IBM Plex Mono (os arquivos da IBM sem mudança, pelo nome reservado), no código, no `numeric` e no número do `KPI` —
   as quatro escolhas do Victor depois da revisão independente. Aprovada na bancada (*"Aprovado, pode seguir"*).
   ⚠ **As lições:** a revisão independente achou onze pontos que a sessão não tinha visto (o validador reprovando, uma
   frase falsa sobre a largura da Inter, a Plex Mono prometida nos números e ausente do CSS); o `vitest` rodado JUNTO
   com a suíte do Playwright estourou o tempo de vários testes — os dois em sequência; a troca de fonte mexeu onde
   ninguém olhava: o tipo do nó do mapa quebrou em duas linhas (aceito pelo Victor) e a faixa de controles de um bloco
   do site desceu uma linha só no Linux da CI; e um aviso de segurança novo do `next` (o app de prova) reprovou a
   auditoria no meio do pedido. **Publicada em 22/10/2026** (entre 17:23 e 17:29, Brasília, medido no npm), pelo
   terminal do Victor, da junção do pedido #91. O registro entrou no lote seguinte (os campos, 0.40.0).

37. **`0.40.0`, os campos brancos, feita em 22/10/2026** ([ADR-0078](decisions/0078-no-claro-o-campo-e-branco-com-sombra.md))
   — o Victor comparou a página inicial com a da referência (*"porque nossos caixas não são brancas?"*) e viu a bancada nos
   temas da Aurea, no notebook e no monitor de baixa visão: *"gostei Branco + sombra"*. No claro, o campo solto é branco
   com o `--shadow-sm`; dentro de uma superfície branca, o cinza de antes, e a superfície escolhe sozinha
   (`--field-fill`/`--field-lift`); no escuro, nada muda. Aprovada pela bancada (*"Aprovado, pode seguir com a 0.40.0"*).
   ⚠ **A lição:** a lista das superfícies brancas esqueceu quatro que recebem campo (o `Header` flutuante e o de pílula,
   a lateral aberta da documentação e o item da `SortableList`) — achado no lote seguinte, perguntando "quem mais pinta a
   cor do cartão?" com a lista das 40 regras que pintam `--card`/`--popover`, e consertado na 0.40.1. **Publicada em
   22/10/2026** (entre 23:41 e 23:45, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido #92. O
   registro entrou no lote seguinte (o nativo, 0.40.1).

38. **`0.40.1`, o nativo, feita de 22 a 23/10/2026** — a fonte nova no aparelho (os `.ttf` da Inter e da IBM Plex Mono
   sem mudança, a Sora fixada num peso por arquivo por `packages/fonts/fontes-nativas.py`; completos, *"Completas"*, 3,17 MB
   contra 0,40 MB da Atkinson), o título na Sora, o `numeric` e o `KPI` na Plex Mono, e os campos brancos do nativo
   (`fundoDeCampo()` e o contexto `superficie.tsx`). Aprovada pela bancada no `react-native-web` (*"Aprovado, pode
   seguir"*). ⚠ **As lições:** o `vitest` inteiro achou um defeito meu — a `Table` e o `Slider` usavam o `numeric` só pelos
   algarismos de mesma largura e passaram para a Plex Mono; dentro das peças, `numeric` com `font="ui"`. A pergunta "quem
   mais pinta a cor do cartão?" achou quatro superfícies da web que a 0.40.0 esqueceu. E a lista do pacote
   (`scripts/package-files.json`) ainda citava os arquivos da Atkinson — o `check-pack --write` regrava. **Publicada em
   23/10/2026** (entre 10:44 e 10:54, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido #93. O
   registro entrou no lote seguinte (a lateral, 0.41.0). Falta o teste no aparelho (bloco 0.40.1).

39. **`0.41.0`, a lateral com o topo e o pé fixos, feita em 23/10/2026** ([ADR-0079](decisions/0079-a-lateral-com-topo-e-pe-fixos.md))
   — o 4-C das quinze laterais que o Victor aprovou em 21/10/2026, e o pedido de um segundo app: `header` e `footer` no
   `Sidebar` (só a lista do meio rola) e as partes `Sidebar.Brand` (a marca do app, em ladrilho ou solta), `Sidebar.User`
   (a pessoa e o sair), `Sidebar.Nav` e `Sidebar.Show` (o que aparece só aberta ou só recolhida). Aprovada na bancada em
   tela cheia (*"Aprovado o 4-C"*), depois de *"pq 9 e 10 têm distância maior da lateral? deixe como 8 e 11"* — as duas
   passaram ao arranjo encostado. ⚠ **As lições:** a nota de versão com lista dentro de lista parou o `build-catalog`
   (o leitor das notas só lê lista de um nível); e a regra da barra de rolagem mudou de seletor (`.sidebar-body`), e o
   `engine-batch.test` ainda cobrava o antigo. **Publicada em 23/10/2026** (entre 14:44 e 14:50, Brasília, medido no npm), pelo terminal do Victor,
   da junção do pedido #94. O registro entrou no lote seguinte (a lateral até o topo, 0.42.0).

40. **`0.42.0`, a lateral até o topo, feita em 23/10/2026** ([ADR-0080](decisions/0080-a-lateral-ate-o-topo.md)) — o
   MNT-34 de um app de rede e o pedido de um segundo app: `AppShell layout="sidebar"` (a lateral do alto até embaixo, com a
   marca nela; a barra de cima só existe se o app passar `topbar`, e fica só sobre o conteúdo), `AppShell.SidebarToggle`
   (o botão de recolher das quinze laterais) e `sidebarFooter`. Aprovada na bancada com a peça de verdade (*"Aprovado o
   MNT-34"*). O teste de navegador achou um defeito antes de sair: na barra do conteúdo, um título sozinho ia para a ponta
   direita. ⚠ **A lição:** o `main` reprovou DEPOIS da junção do pedido #95, com a CI do pedido verde — dois alertas `high`
   novos (`undici` e `zod`, só em ferramenta) saíram no intervalo, e a rodada do site ficou parada. O conserto foi o pedido
   #96 (`overrides`; a `zod` saltou da 3 para a 4, conferida rodando os esquemas do `@expo/cli`); e no `main` a `visual` caiu
   uma vez com o WebKit da máquina do GitHub travando (*"WebKit encountered an internal error"*), verde rodada de novo.
   **Publicada em 25/10/2026** (entre 08:32 e 08:39, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido
   #96. O registro entrou no lote seguinte (o bloco 1, 0.43.0).

41. **`0.43.0`, o bloco 1 do plano único — o catálogo fiel, feito de 23 a 25/10/2026** ([ADR-0081](decisions/0081-a-bancada-do-bloco-1.md))
   — *"quero todos os componentes exemplos tudo"*: toda peça com página no site, toda variação num exemplo vivo (eram 473
   valores sem exemplo em 70 peças; agora nenhum), o nativo ao lado da web (a chave Web | Native e as 79 páginas do nativo
   pelo `react-native-web`) e quatro travas novas na CI (o catálogo fiel, o nome citado existe, o exemplo compila e a
   página vigiada). As decisões de peça foram uma a uma, na bancada. ⚠ **As lições:** (1) o `check-pack` não rodava nas
   conferências do bloco, e o `@aurea-uds/contracts` passou a levar o `api-surface-native.json` (210 KB) sem ninguém ver —
   achado só no fechamento; entra no pacote, como o da web, e o `check-pack` vai nas conferências de todo lote; (2) as
   páginas do nativo saíam diferentes em cada computador, porque o nativo escreve data e número no idioma do aparelho — a
   trava "dist desatualizado" da CI reprovou; o conserto ficou só na montagem (`apps/catalog/nativo/idioma-da-montagem.mjs`,
   o "en-US" para quem não diz o idioma), com `tests/unit/site-nativo-idioma.test.tsx` provado contra o defeito; (3) o
   validador leva de 5 a 10 minutos por rodada na máquina do Victor — rodar em segundo plano; (4) mudar peça no meio de
   trabalho de página entristeceu o Victor: mudança de peça é pergunta à parte, desenhada, com "pode" antes.
   **Publicada em 25/10/2026** (entre 17:23 e 17:29, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido
   #97. O registro entrou no lote seguinte (o bloco 2).

42. **`0.44.0`, o bloco 2 do plano único — a lateral inteira, feito em 26/10/2026** ([ADR-0082](decisions/0082-a-lateral-inteira.md))
   — o que faltava das quinze laterais aprovadas em 21/10 (4-A, 4-B, 4-D a 4-H) e o 2-A: `Sidebar` com `collapsible`
   (`icon`, `capsule`, `offcanvas`), `indicator` (cinco jeitos do item atual) e `panel` (`docked`, `overlay`);
   `Sidebar.Provider`, `Sidebar.Toggle` e `useSidebar`, com o Ctrl+B que não age onde se digita; no item, `avatar`,
   `action`, o grupo que dobra e o `"separator"`; o texto e o fio a 16 (`--sidebar-item-x`); a lateral solta do topo até
   embaixo; o `AppShell` com o mesmo provedor e seis padrões novos no site. Aprovada na bancada com as quinze rodando
   (*"Aprovo as quinze e as quatro decisões como propostas"*). ⚠ **As lições:** (1) o teste de navegador achou um defeito
   antes de sair (na lateral rente que sai da tela, a coluna ficava em 68: a regra da rente recolhida vinha depois na
   folha); (2) a suíte inteira do Chromium achou sete pontos que os testes do lote não pegavam (o nome das cinco laterais
   do exemplo, a chave que estourava a 200%, a prévia mais alta que a caixa, o teste que supunha a lateral aberta, o logo a
   20, a página que rolava de lado a 320 e o painel com 262) — e os dois testes que tinham reprovado só rodaram de novo
   DEPOIS do commit, antes do envio: o que reprovou roda de novo depois do conserto, antes do commit; (3) o validador achou
   sete acertos de ficha (o check 46 só alcança as partes `Sidebar.X = …` escritas logo depois da função; o check 47 não
   aceita número de versão no texto da ficha; a nota de teclado só onde o teclado foi medido); (4) a bancada se entrega pelo
   endereço COMPLETO da página — o Victor abriu a raiz do servidor e viu uma lista de pastas (*"cade?"*).
   **Publicada em 26/10/2026** (entre 19:50 e 19:55, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido
   #99. O registro entrou no lote seguinte (as cores, passo A).

43. **`0.45.0`, as cores, passo A — a paleta da 1.0, feita em 27/10/2026** ([ADR-0083](decisions/0083-a-paleta-da-1-0.md)) — a
   proposta de cores que o Victor preparou componente a componente (25 e 26/10/2026) e as quatro decisões da bancada: o foco dos
   campos no amarelo (*"1 C Amarelo"*), o texto de apoio `#5E5E65` (o `#686871` da proposta dava 3,88:1 nos fundos de 10% —
   o axe achou), a linha do tempo consertada em todas as marcas e o cartão do escuro sem borda. Web e nativo; a `lory`
   congelada, provada contra a 0.44.0 (`ember-congelada.spec.ts`). ⚠ **As lições:** (1) a fronteira do core recusou a classe
   `link-underline` (o core só tem classe que um componente produz) — a variação virou o atributo `data-link="underline"`;
   (2) a suíte inteira do Chromium achou o `rtl.spec` lendo o trilho antigo da linha do tempo, e a CI achou o `geometry.spec`
   comparando a cor calculada ("86.046997", no WebKit) com o texto do token ("86.047") — cor se compara pelo MESMO caminho
   nos dois lados; (3) a suíte de unidade estourou o tempo em dois testes com a máquina carregada (as fotos da CI sendo
   baixadas e comparadas ao mesmo tempo): o que esgotou o tempo roda de novo sozinho antes de virar defeito; (4) a página de tokens cresce com
   token novo — a foto dela muda de altura, e a altura se explica pelas linhas novas antes de aceitar. **Publicada em
   27/10/2026** (entre 16:20 e 16:28, Brasília, medido no npm; o `native` apareceu no registro 6 minutos depois dos outros —
   a saída do terminal do Victor já dizia `+ @aurea-uds/native@0.45.0`), pelo terminal do Victor, da junção do pedido #100.
   O registro entrou no lote seguinte (as cores, passo B).

44. **`0.46.0`, as cores, passo B — os estilos novos, feita em 27 e 28/10/2026** ([ADR-0084](decisions/0084-os-estilos-novos-e-as-duas-excecoes.md))
   — as variações da proposta de cores do Victor, todas para construir (*"Um lote só"*): o botão ligado em três cores
   (`pressedStyle`, só web), o segmento aceso em seis (`selectedStyle`), a linha do tempo em cinco (`variant`) e o item atual
   da barra de baixo em treze (`currentStyle`), cada uma também por atributo num contêiner; e as duas exceções nomeadas — o
   degradê do `brand-gradient` (o check 4 só aceita `gradient(` na regra dele) e os aros, sempre sombra por dentro. Na
   bancada o Victor viu a barra de baixo mais alta em cinco formatos (*"quero todos da mesma altura"*): o círculo e a cápsula
   passaram a 28 e todas as barras a 54. Aprovada (*"Aprovo o passo B e os cinco pontos como estão"*). ⚠ **As lições:** (1) o
   `sem-linha.test` não via o aro escrito por VARIÁVEL — passou a ler também a variável que guarda um anel; (2) depois de
   mexer em exemplo do site, montar também o `build:live` (as caixas vivas), não só o `build:catalog`; (3) dois "defeitos"
   da bancada eram do banco, não da peça (a caixa esticada da linha do tempo, o "3" solto em vez do `Badge`) — medidos antes
   de mexer. **Publicada em 28/10/2026** (entre 09:55 e 10:02, Brasília, medido no npm), pelo terminal do Victor, da junção
   do pedido #101. O registro entrou no lote seguinte (as cores, passo C).

45. **`0.47.0`, as cores, passo C — as treze marcas, feita em 28/10/2026** ([ADR-0085](decisions/0085-as-treze-marcas.md)) —
   o começo (*"Pode começar"*, *"As 11"*): a Aurea Ember (a antiga `lory`) e as 11 marcas da paleta da 1.0 com os neutros
   da Aurea; o que a bancada achou e o Victor decidiu olhando (a `Toolbar` nas medidas da referência, o contador e o ponto da
   barra de baixo vermelhos como no nativo, a Ember com os estilos novos e as marcas brancas no escuro); e o nativo também
   (*"ele precisa atualizar e receber também"*). Aprovada (*"Aprovo"*). ⚠ **As lições:** (1) SUGESTÃO do documento não é
   ordem — o apelido `lory` foi adotado sem perguntar, e o Victor mandou tirar (*"pare com paliativo mude de verdade"*,
   *"mude 100% lory para ember"*); (2) decisão que a sessão tomou sozinha se mostra VISUAL, lado a lado (como a proposta
   pedia × como ficou), e não em número — ele manteve as cinco olhando; (3) a troca automática de nome quebrou o próprio
   teste que procurava o nome antigo e deixou dois textos dizendo o nome novo onde era o velho — conferir o que a troca
   alcança. **Publicada em 28/10/2026** (entre 19:35 e 19:41, Brasília, medido no npm), pelo terminal do Victor, da junção
   do pedido #102. O registro entrou no lote seguinte (os acabamentos).

46. **`0.48.0`, os acabamentos, feita em 28/10/2026** ([ADR-0086](decisions/0086-os-acabamentos.md)) — os três que a
   proposta de cores deixou de fora (*"Pode os três"*): o brilho (`glow`) e o fio (`ring`) como variações que o app
   escolhe, web e nativo, e o menu translúcido como CORREÇÃO do `blurred`, que não lia (1,83:1 sobre o amarelo, no escuro;
   agora, nunca menos de 9:1). Aprovada na bancada (*"Aprovado"*). ⚠ **As lições:** (1) as duas fotos `index` do Linux
   mudaram no serrilhado do texto da abertura, e no Windows não — medido antes de aceitar (*"Medir antes"*): a Debian do
   Hyper-V do notebook, com o contêiner da CI, tira a foto IGUAL byte a byte à da CI, e com a barra de cima de antes só o
   selo da versão mudava; a causa era a barra translúcida nova; (2) o check 44 recusou o brilho repetido no
   `:focus-visible` — a regra já tinha mais força que o foco geral, e o teste de navegador passou a MEDIR o brilho com a
   peça focada pelo teclado; (3) `data-glow` e `data-ring` são ESCOLHA, não estado, e se registram como os estilos do
   passo B. **Publicada em 29/10/2026** (entre 10:42 e 10:48, Brasília, medido no npm), pelo terminal do Victor, da junção
   do pedido #103. O registro entrou no lote seguinte (o MNT-35).

47. **`0.49.0`, o mapa desmarca, feita em 29/10/2026** — o MNT-35 do app de rede, com a escolha do Victor (*"A:
   onSelect(null)"*): com um nó escolhido, o clique na área vazia do desenho e o Esc dentro do mapa chamam `onSelect(null)`,
   nos dois modos; arrastar não desmarca; o Esc que desmarcou para ali, e o de dentro de um campo é do campo; o leitor de
   tela ouve "Nenhum nó escolhido". Aprovada na bancada (*"Aprovado"*). ⚠ **As lições:** (1) as fotos `index` do Linux
   foram tiradas ANTES do envio, na Debian do Hyper-V com o contêiner da CI, e a CI do pedido passou de primeira; (2) o
   registro da 0.48.0, feito neste lote, esqueceu de regravar o `released-surface.json` — achado no lote seguinte, que o
   levou direto à 0.49.0; o registro de uma versão publicada tem TRÊS partes: o CHANGELOG, o CLAUDE.md e esse arquivo.
   **Publicada em 29/10/2026** (entre 14:40 e 14:50, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido
   #104. O registro entrou no lote seguinte (o E17 e o E18).

48. **`0.49.1`, os encaixes do nativo, feita em 29/10/2026** — o E17 e o E18 do app, com o conserto que a referência do
   celular faz: o botão de largura inteira na altura do tamanho (o `flex: 1` dentro do alvo de toque zerava a base, e a caixa
   ficava com 44 em todo tamanho) e o título do `Header` que encolhe, com as ações do tamanho delas; e o E19, a ficha do tom
   `link`, que ainda dizia o contrário da paleta da 1.0. Aprovada na bancada (*"Aprovado"*). Junto, a regra da Ember no §5:
   a única paleta fechada a mudança de cor. ⚠ **As lições:** (1) a altura se provou no navegador, nas páginas do nativo do
   site — o dublê do React Native do teste de unidade não calcula o layout; (2) as fotos `index` do Linux, tiradas antes do
   envio na Debian, fizeram a CI passar de primeira outra vez. **Publicada em 29/10/2026** (entre 22:28 e 22:35, Brasília,
   medido no npm), pelo terminal do Victor, da junção do pedido #105. O registro entrou no lote seguinte (a lateral de
   contraste, 0.50.0).

49. **`0.50.0`, a lateral de contraste, feita de 29 a 30/10/2026** ([ADR-0087](decisions/0087-a-lateral-de-contraste.md)) — o
   MNT-36 de um app da web, a forma *"A, escura neutra"* da bancada das 13 marcas: `Sidebar contrast` (o tema escuro por
   dentro, como o cartão `contrast`; na página clara, o cartão do escuro; na escura, mais escura que a página, pelo tema do
   ANCESTRAL) e `AppShell sidebarContrast`; a Ember com as cores medidas do app onde nasceu, em tokens que só ela define
   (o `inherit` traz o valor da página). Aprovada na bancada do `AppShell` de verdade (*"Aprovado"*). ⚠ **As lições:**
   (1) a primeira bancada mostrou só a flutuante, e o Victor cobrou: *"não fez o de canto reto conforme o sistema que
   mostrei"* — a bancada mostra o arranjo que o app usa, não só o padrão da Aurea; (2) a pergunta "quem mais?" achou a
   `plain` (sem caixa), que com `contrast` deixaria a letra clara sobre a página clara; (3) pedi a aprovação com o painel do
   navegador ESCONDIDO (*"aprovar sem ver?"*) — antes de pedir, conferir que o painel está à vista e mandar o endereço
   completo; (4) a Debian do Hyper-V não respondeu, e as fotos do Linux saíram do minipc, com o mesmo contêiner da CI;
   (5) a publicação do site caiu duas vezes num 502 passageiro da API do GitHub — o conserto entrou no lote seguinte.
   **Publicada em 30/10/2026** (entre 10:02 e 10:09, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido
   #106. O registro entrou no lote seguinte (o site que não para num erro passageiro).

50. **`0.51.0`, a ponta da barra de cima, feita em 30/10/2026** — o MNT-37 de um app da web: no `layout="sidebar"` a chave
   de tema que o app punha no `topbar` ficava colada no botão de recolher, porque o shell não repassava o encaixe da ponta
   do `Header`. Agora é o `AppShell topbarActions`, em todo arranjo (no `"docs"`, o botão da gaveta continua o último). A
   bancada foi o `AppShell` de verdade (`apps/keyboard-probe/ponta.html`). Das 24 fotos do Linux, só as duas `index`
   mudaram, no selo da versão. **Publicada em 30/10/2026** (entre 18:20 e 18:23, Brasília, medido no npm), pelo terminal do
   Victor, da junção do pedido #108. O registro entrou no lote seguinte (as peças do site B, 0.52.0).

51. **`0.52.0`, as peças do site B, feita em 31/10/2026** ([ADR-0088](decisions/0088-o-site-b.md)) — as cinco mudanças de
   peça que a página Introduction do desenho B pediu, aprovadas na bancada da página inteira em tamanho real (*"pode"*): a
   pílula do `AppShell`, o `Header` `pill` largo e translúcido, o anel de leitura do `TableOfContents`, o grupo que dobra da
   `Sidebar` e o "+" do `Accordion`. Junto, os consertos da auditoria de segurança do mesmo dia (*"Junto da 0.52.0"*): a
   língua do `CodeBlock` e as tabelas de nomes só leem chave própria (`proprio()`, no `pure.tsx`), a cor do `ColorSwatch`
   só entra no estilo se for cor, e a `DataGrid` descarta a ordem e o filtro de link com nome do `Object.prototype`.
   ⚠ **As lições:** (1) a bancada do site B mostra a página INTEIRA igual ao desenho, em tamanho real, medida texto por
   texto — a primeira, só com o topo, foi reprovada, e a segunda dizia "igual" medindo só as caixas grandes; (2) o conserto
   da auditoria foi enviado DEPOIS de o pedido #109 ter sido juntado e ficou fora do `main` — antes de enviar para uma
   branch com pedido aberto, conferir que o pedido continua aberto (`gh pr view`). **Publicada em 31/10/2026** (por volta
   das 21:53, Brasília, medido no npm), pelo terminal do Victor, da junção do pedido #110 (o #109 foi juntado antes). O
   registro entrou no lote seguinte (o site B, 1b).

**Juntar (06/10/2026):** o Victor autorizou a sessão a juntar os pedidos #45, #43 e #44 quando a CI
de cada um ficasse verde, nessa ordem. Autorização daquela noite, para aqueles pedidos; publicar
continua só com ele (o npm pede o segundo fator).

### Lote E e decisões de 25/09/2026

- **`0.11.0` · Lote E** (achados do app de 25/09/2026, nativo), **publicada em 25/09/2026 sem o
  aceite de aparelho**: E1, E3, E4, E5, E6, E7, E8 e o `Badge` com as medidas do `Chip` da
  referência (telefone). **Pendente:** a sessão do app medir no aparelho, ou rodar os blocos E1–E8 do
  `apps/native-smoke`. O **E4** decide a causa (suspeita, não medida); o E7 e o E8 são desenho.
- **Para o Lote 3** (decisões do Victor, 25/09/2026): **E2**, o `Button` do nativo obedece o pai,
  como na referência, com um `align` no `Stack` do nativo · **M-01** (`render`) só no `Button`, no
  `IconButton` e nos itens de navegação · **M-02** (`classNames` por parte) **descartado**: a
  referência tirou isso na versão atual, e abriria a aparência das peças por dentro.
- **A medir:** as medidas das peças da WEB contra o pacote da referência, pela regra das medidas.
  O `Badge` do nativo foi o primeiro a passar; a web não foi medida.

### Pendências soltas, sem lote nem decisão

- Largura mínima do `Combobox` (o resto da A-13).
- Capa vertical cortada no `MediaEmbed` (capa em pé numa caixa deitada). Precisa de "pode".
- `Select` e `Combobox` lado a lado mostram o vazio de jeitos diferentes. Observação do app.
- C-06 (`option` sem estilo no escuro) provavelmente morreu com o `Select` novo. **Medir antes de
  fechar.**
- O nativo **nunca rodou num iPhone**. Antes de prometer a `1.0`, rodar o teste de aparelho no iOS.

### Como cada lote anda

1. Ler a ficha e **conferir contra o código** antes de aceitar.
2. **Ver como a referência faz** (documento de referências, seção 2).
3. Consertar como **acréscimo**, com teste que **falha** no defeito antigo.
4. Verificar: `python scripts/validate.py` · `pnpm build` · `npx vitest run` ·
   `node scripts/check-pack.mjs` · `node scripts/publicar.mjs --dry-run` · e no navegador os
   testes do Playwright (Chromium em `/opt/pw-browsers/chromium` nas sessões de nuvem).
   - ⚠ **`--write-manifest` e `--write-state` regravam e ENCERRAM o script, sem conferir nada**
     — e juntos, só o primeiro roda. Rode cada um **sozinho**, e depois o `validate.py` **puro**:
     só a linha `Aurea validation: OK` prova a conferência. Em 01/10/2026 a `0.12.4` foi
     verificada com os dois juntos, o `STATE.md` ficou velho e o `main` ficou vermelho.
5. **Desenhar antes e depois e mostrar ao Victor.** Só está aprovado depois que ele vê; teste
   verde não é aprovação.
6. Levantar a versão nos **nove** arquivos (`package.json` da raiz, os sete pacotes e
   `packages/contracts/aurea.contract.json`), com a seção no `CHANGELOG.md`.
7. **Pedir o "pode"**, empurrar a branch e abrir o pedido de junção para o `main`. Quem junta e
   publica é o Victor.
8. Depois que ele publicar, anotar aqui e no `CHANGELOG.md` — e escrever a **nota de versão em inglês**,
   `apps/catalog/content/releases/vX-Y-Z.md` (a área Releases do site, decisão do Victor de 19/10/2026), com a data do
   CHANGELOG. Só o que muda para quem usa; nada do processo, de pessoa ou de app. Versão que sai dentro de outra vira
   `## Includes vX.Y.Z` na nota de quem a publicou. ⚠ Sem a nota, o `build-catalog` para: a trava cobra toda versão com
   data no CHANGELOG.

**Duas regras do Victor, de 23/09/2026:** o `main` fica **sempre** atualizado (lote aprovado vai
para a branch **e** para o `main`), e **só está aprovado depois que ele VÊ**.

**E a de 03/10/2026, para o `BottomNav`:** *"agora só vai ser aprovado e enviado para git quando eu
ver funcionando"*. Imagem parada não basta: ele vê a peça RODANDO, com toque (a bancada com o
código real no `react-native-web`, publicada como página), e só depois do "pode" dele ela entra
no git.

---

## 4. Publicar e empurrar

- **O site `aureauds.dev` é o catálogo, e publica sozinho** (decisão do Victor, 01/10/2026). Depois
  da CI verde no `main`, o `.github/workflows/site.yml` monta `site-dist/` (`scripts/montar-site.mjs`)
  e manda para a Cloudflare (Workers, plano gratuito). Os segredos `CLOUDFLARE_API_TOKEN` e
  `CLOUDFLARE_ACCOUNT_ID` vivem só nas configurações do GitHub; **nunca** na conversa nem em arquivo.
  - **A trava** (ordem do Victor, 01/10/2026): o site é feito **só com a Aurea**. O check 45
    reprova importação de fora (vale o que o `@aurea-uds/react` declara) e recurso de outro
    endereço. Peça que falta no site se cria **na Aurea**, nunca no site.
- **Publicar é um comando, da raiz: `node scripts/publicar.mjs`.** Com `--dry-run` ele confere
  tudo e não publica. O `npm login` e o publish são do Victor; agente roda só o `--dry-run`.
  - O script empacota com `pnpm` (que traduz o `workspace:` das dependências internas) e publica o
    tarball com `npm`. Publicar direto com `npm publish` sairia com `workspace:^` literal e o
    pacote não instalaria em ninguém.
  - O passo 0 confere `npm whoami` antes de empacotar: a sessão do npm dura cerca de 2 h, e sem
    sessão o registro responde `E404`, que parece "pacote não existe".
- **Nenhuma leitura de registro decide logo depois de um publish.** A ficha, a lista de versões, a
  consulta direta e o `npm pack` atrasam. **Quem decide é a saída `+ pacote@versão` no terminal de
  quem publicou.** Resposta negativa sua nessa janela não é evidência de nada.
- **O push faz parte do preparo.** Se a resposta manda o Victor dar `git pull`, o push já tinha de
  ter acontecido. Pedir o "pode" na mesma mensagem que manda puxar garante que ele puxe o vazio.
- **Quando o Victor mede uma coisa e você tem a explicação do seu lado, a explicação é sua até
  prova em contrário** — nunca a máquina dele.
- **Verificação é local antes de empurrar.** No repositório privado a CI estava parada por limite
  de gasto; no público, o GitHub Actions é gratuito.
- **O `main` exige a CI verde** (decisão do Victor, 07/10/2026: *"A, pode"*). A regra `main` do
  GitHub (conjunto de regras do repositório) cobra as seis verificações da CI, vindas do GitHub
  Actions: `build`, `test`, `visual` e `varredura` nos três navegadores. A `visual-update` não
  (só roda à mão). Não exige a branch atualizada com o `main`. Continuam as três proteções de
  antes: não apagar, não reescrever o histórico, entrar só por pedido de junção.
  - **A junção automática do GitHub está permitida** no repositório. Ligá-la num pedido continua
    exigindo o "pode" do Victor para AQUELE pedido.
  - **Pedido com a CI vermelha fica travado**, inclusive o do Victor. O caso que mais acontece: o
    número de componentes muda e as fotos `index` e `topo` do catálogo vencem. Conserto: rodar a
    CI no modo de regerar fotos (`gh workflow run CI --ref <branch> -f update_snapshots=true`),
    baixar o artefato `playwright-snapshots-linux`, **olhar cada foto que mudou** e commitar só
    essas. ⚠ Foto NOVA (arquivo que não existia) muda o `manifest.json` e o `STATE.md`: regravar os
    dois (`--write-manifest`, `--write-state`, cada um sozinho) e rodar o `validate.py` puro ANTES de
    empurrar — em 14/10/2026 as 2 fotos novas da 0.32.0 reprovaram a `build` da CI por isso.
  - **A trava de fotos tem tolerância de cor 0,02** (`playwright.config.ts`, decisão do Victor,
    09/10/2026). Com o 0,2 padrão do Playwright, a troca de paleta da `0.27.0` passou sem foto
    nova — até o fundo do escuro; com 0, o serrilhado reprovou 3 de 5 rodadas sem mudança. Não subir o
    número. Quando a `visual` reprovar, as imagens da diferença estão no artefato
    `playwright-report` da rodada.
  - **Alerta de segurança novo reprova a auditoria da `build` sem nenhuma dependência nossa
    mudar** (07/10/2026: o `next` do app de prova). Com correção publicada: subir a versão — direta
    no `package.json`, indireta por `overrides` no `pnpm-workspace.yaml`. Sem correção: aceitar
    com registro no `auditConfig`, como os que já estão lá.
- **A pasta local do Victor foi refeita em 24/09/2026 a partir do público.** A antiga apontava para
  o `aurea-uds-privado`, e o `git pull` respondia "Already up to date" puxando do repositório que
  não recebe mais nada. Se um `git pull` dele não trouxer o que foi juntado, a primeira pergunta é
  `git remote -v`.

---

## 5. Identidade visual — INTOCÁVEL

- Superfícies flutuantes; cartões, janelas e painéis com raio 22px (`--radius-card`).
- **A exceção: a folha que sobe de baixo tem 32** (`--radius-sheet`, decisão do Victor, 06/10/2026,
  [ADR-0058](decisions/0058-a-folha-de-baixo-tem-32-de-canto.md)).
- Campos, filtros, abas e botões de texto em cápsula (`--radius-control: 999px`).
- Amarelo primário `oklch(0.795 0.184 86.047)` invariável entre temas — e **invariável dentro de
  cada MARCA** ([ADR-0036](decisions/0036-marca-e-um-eixo-e-o-amarelo-continua-invariavel.md)).
  Marca é um eixo próprio (`data-brand`), ortogonal a `data-theme`, e **redefine só COR**. Sem
  `data-brand`, nada muda. Trocar o amarelo do padrão é proibido.
- **A FONTE É A INTER (texto), A SORA (títulos, todo h1 a h6) E A IBM PLEX MONO (código e valores: o `numeric` e o número do `KPI`)**
  (decisão do Victor, 22/10/2026, *"vamos mudar mesmo"* — todos os que ele ouviu escolheram essa tela —, e *"a fonte
  não irá ser mudada de novo, essa é a última vez"*; [ADR-0077](decisions/0077-a-fonte-e-a-inter-a-sora-e-a-ibm-plex-mono.md)).
  A Inter vai SEM o `ss02`, igual ao sistema que serviu de modelo; os arquivos são os do autor, cortados para o latino;
  os da IBM Plex Mono vão sem mudança (nome reservado "Plex"). A Atkinson SAI de tudo: a web na `0.39.0`, o nativo na
  `0.40.1` (14 `.ttf` COMPLETOS, 3,17 MB — *"Completas"*, 22/10/2026). Os ícones continuam os Phosphor.
- ~~IBM Plex Sans / Serif / Mono; Carbon Icons~~ → ~~**Atkinson Hyperlegible Next**~~ (fonte trocada pela ADR-0077,
  acima) **e ícones Phosphor Regular** (decisão do Victor, 01/10/2026,
  [ADR-0053](decisions/0053-a-fonte-e-a-atkinson-e-os-icones-sao-o-phosphor.md)). **Feita na
  `0.13.0`**, publicada em 01/10/2026. Decidido também: o item escolhido usa o Phosphor Fill, o código usa a Atkinson
  Hyperlegible Mono, e a IBM Plex Serif sai (o `--font-editorial` fica como apelido da fonte do
  texto até a `1.0`, para não quebrar quem o usa). Aberto: o peso do ícone pequeno (ADR, "A medida").
- ~~No tema claro, o amarelo como LETRA ou ÍCONE é o `brand-yellow-text` (`#826202`), ADR-0054~~ →
  ~~**no tema claro, a letra e o ícone de destaque são o PRÓPRIO amarelo da marca**, o mesmo do escuro
  (decisão do Victor, 18/10/2026, *"b aprovaro"*, sabendo que mede 1,75:1 —
  [ADR-0073](decisions/0073-no-claro-a-letra-de-destaque-e-o-amarelo-da-marca.md))~~ → ~~**no tema claro, a letra de
  destaque é o AZUL da marca**, `brand-blue` (decisão do Victor, 20/10/2026, *"Amarelo + azul"* —
  [ADR-0076](decisions/0076-no-claro-a-letra-de-destaque-e-o-azul-da-marca.md))~~ → **NO CLARO, O AMARELO NUNCA É LETRA**
  (a paleta da 1.0, a proposta de cores do Victor de 25 e 26/10/2026 e a bancada de 27/10/2026 —
  [ADR-0083](decisions/0083-a-paleta-da-1-0.md)): o destaque (`primary-emphasis`) e o link (`link`, `link-hover`) são a
  COR DO TEXTO (`#09090B`); o amarelo aparece como fundo, traço, sublinhado, faixa ou indicador. O link se separa do texto
  pelo **marca-texto** (a faixa amarela a 45% atrás da metade de baixo das letras — o padrão do claro) ou pelo
  **sublinhado** amarelo (a variação, `data-link="underline"` no link ou num contêiner; e o único jeito no escuro, onde o
  link é o amarelo); a navegação (a trilha, `<nav>`, o segmento que é link) fica sem. O escolhido do claro (aba, segmento,
  item de navegação, `.eyebrow`) tem a letra do texto, com o fio amarelo. O item atual da lateral, no claro, continua o
  botão primário. **Sobre o amarelo, a tinta** `brand-yellow-ink` (**`#18181B`**), nos dois temas, e **nada de marrom em
  lugar nenhum** (o `primary-mark` é a tinta). **Dentro dos controles, as marcas são BRANCAS** (`--control-thumb`, o visto,
  o ponto do rádio). **O foco:** o `--focus` do claro é o bronze `#BD7000`; a maioria das peças usa o `--focus-strong`
  (o grafite no claro, o amarelo no escuro); **o foco dos CAMPOS é o amarelo** nos dois temas — no claro, 1,75:1, a
  exceção consciente do Victor (*"1 C Amarelo"*), que o `geometry.spec` aceita só nos campos. Fora essa exceção e as marcas
  brancas, o 4,5:1 vale nos dois temas — e a varredura do axe cobra. **O botão ligado** é amarelo com a letra do botão
  primário, sem fio. **"Aumentar contraste" do sistema** (`prefers-contrast: more`; no nativo, `useMaisContraste`): o
  contorno de 3:1 nos campos (`--input-strong`), as marcas na tinta e o foco do campo no grafite. Temas extras decididos,
  sem prioridade: Amarelo + âmbar, Oliva + folhagem e Azul elétrico (ADR-0076) — e as 11 marcas da proposta da paleta
  (passo C, só com o sim do Victor).
- ~~**Os neutros** e~~ **as cores de estado dos dois temas seguem a paleta de referência** (decisão do
  Victor, 09/10/2026, [ADR-0061](decisions/0061-as-cores-dos-temas-seguem-a-paleta-de-referencia.md));
  o amarelo da marca, os raios, a fonte e os ícones continuam os nossos. **Os NEUTROS são a base Zinco profundo**
  (ADR-0083): claro — página `#F5F5F5`, cartão branco, texto `#09090B`, secundário `#EBEBED`, texto de apoio `#5E5E65`
  (aprovado na bancada: o `#686871` da proposta dava 3,88:1 nos fundos de 10% dos blocos); escuro — página `#09090B`,
  cartão `#18181B` **sem borda**, texto `#FAFAFA`, texto de apoio `#A1A1AA`. ⚠ Os fundos translúcidos (`--fill-*`) são
  feitos da cor do texto: texto mais escuro, fundo mais escuro — cor nova de texto se mede também sobre eles. O fundo cheio de estado
  (`--success`, `--info`, `--warning`, `--destructive`) é a MESMA cor nos dois temas; letra, ícone,
  borda e barra sobre a tela usam o par `-400`. ⚠ Nunca pintar letra com a cor de fundo de estado:
  `paleta-adr0061.test.tsx` reprova.
- Sem gradientes (nem funcionais) — com DUAS exceções estreitas, cada uma cobrada pelo check 4: pintar as cores que se
  escolhem ([ADR-0069](decisions/0069-escolher-cor-a-excecao-ao-gradiente-e-o-motor-nosso.md), só no `color.ts`) e o item
  atual da barra de baixo no estilo `brand-gradient` (o H — decisão do Victor, 26/10/2026, *"se não não conseguimos virar UDS
  de verdade"*; [ADR-0084](decisions/0084-os-estilos-novos-e-as-duas-excecoes.md), só na regra dele e só quando o app escolhe).
- **Sem linha** (decisão do Victor, 16/10/2026, [ADR-0072](decisions/0072-sem-linha.md)): nenhuma peça desenha
  borda — a cor de toda borda é transparente (a espessura fica, nenhuma medida muda), e o anel fino de `box-shadow`
  não entra. O que só a linha separava do fundo ganha FUNDO translúcido da cor do texto (`--fill-1` 6%, `--fill-2`
  10%, `--fill-3` 20%; no nativo, `preenchimento()`), e OPACO onde algo passa por trás ou uma peça cobre outra
  (`-solid`; `misturaOpaca()`). O aviso que era linha (inválido, escolhido, erro) é fundo. O foco fica (no nativo, é
  borda). As DUAS linhas: a do cartão de contorno, clara (o texto a 10%), e a de ponta a ponta embaixo das áreas do
  site (`Header` com `tabs` e `divider`, decisão do Victor de 17/10/2026, ADR-0072 item 9) — e a que SÓ o "aumentar
  contraste" do sistema acende: o contorno de 3:1 dos campos (`--input-strong`, ADR-0083), uma exceção nomeada na trava,
  presa ao `@media (prefers-contrast:more)` (e o do botão ligado cinza, ADR-0084). E os AROS dos estilos de aro, que o app
  escolhe (o segmento `ring`, o item `ring`, `white-ring` e `bar-ring` da barra de baixo, o ponto `ring` da linha do tempo —
  ADR-0084) e o FIO dos acabamentos (`ring`, o tom a 30% em volta do fundo suave — ADR-0086): sempre sombra por dentro,
  nunca borda, e só quando escolhidos. Quem cobra: `tests/unit/sem-linha.test.tsx`
  (o código, em todo estado) e a varredura "nenhuma peça desenha linha" (toda página, dois temas, três navegadores).
  **O CAMPO NO CLARO É BRANCO COM SOMBRA** (decisão do Victor, 22/10/2026, *"gostei Branco + sombra"*,
  [ADR-0078](decisions/0078-no-claro-o-campo-e-branco-com-sombra.md)): solto na página, a cor do cartão e o `--shadow-sm`
  (a sombra da referência); ~~dentro de uma superfície branca (cartão, janela, folha, menu, painel do app), o `--fill-2` de
  sempre~~ → **também dentro de uma superfície branca** (ADR-0083: dentro do cartão branco, quem separa o campo é a
  sombra), e a superfície escolhe sozinha (`--field-fill`/`--field-lift`) — a lista continua valendo para a `lory`; no
  escuro, nada muda. No nativo (`0.40.1`), o mesmo por `fundoDeCampo()`: a superfície branca liga um
  contexto interno (`superficie.tsx`) que o campo lê. ⚠ **Peça nova que pinta a cor do cartão (ou do popover) e
  recebe conteúdo do app entra na lista** (a regra das superfícies no `aurea.css`; no nativo, liga o contexto) — a
  0.40.0 esqueceu o `Header` flutuante, e a 0.40.1 consertou.
- Temas escuro e claro equivalentes; densidades compact / comfortable / spacious.
- **As TREZE marcas** (passo C, 28/10/2026 — [ADR-0085](decisions/0085-as-treze-marcas.md)): a padrão, a **Aurea Gold**,
  sem `data-brand`; a **Aurea Ember** (`ember`, a antiga `lory` — sem apelido: *"mude 100% lory para ember"*); e as 11 da
  paleta da 1.0 (`sun`, `honey`, `orange`, `magenta`, `violet`, `indigo`, `cobalt`, `cyan`, `turquoise`, `emerald`,
  `lime`), com os neutros da Aurea. ⚠ **Regra para "qualquer marca" (`[data-brand]` sem nome) não se escreve:** ela valia só
  para a `lory` quando ela era a única, e com as 11 passou a valer para todas — o selo cheio saiu errado assim. Só sobra a da
  lateral; quem cobra é o `tests/unit/marcas-passo-c.test.tsx`. Toda marca nova passa pelo axe do
  `tests/visual/marcas-passo-c.spec.ts`. **No nativo, a marca é a prop `brand` do `AureaProvider`** (os mesmos nomes); o
  gerador emite o que cada marca muda sobre cada tema, e a folha memoizada tem a marca na chave — quem cobra é o
  `tests/unit/native-marcas.test.tsx`.
- **A Ember fica CONGELADA no padrão** (decisão do Victor, 26/10/2026 — ADR-0083): os tokens dela estão escritos com os
  valores de antes da paleta da 1.0, e toda regra nova da paleta (passo A) leva
  `:where(:not([data-brand="ember"],[data-brand="ember"] *))`. As
  exceções, cada uma decidida pelo Victor: o conserto da linha do tempo (era defeito em todas as marcas); as marcas dos
  controles brancas no escuro (*"Brancos, como as outras"*, 28/10/2026); e os estilos novos do passo B, que a alcançam quando
  o app os escolhe (*"Sim, como as outras"*, 28/10/2026). Quem cobra: `tests/visual/ember-congelada.spec.ts` (contra a
  0.44.0).
  - **E é a ÚNICA marca fechada a mudança de cor** (ordem do Victor, 29/10/2026: *"Ember deve sempre ter a cor original
    onde foi criado no Lory pois essa paleta pertence so meu trabalho a a unica que não esta aberta a mudança de cor"*):
    as cores dela são as do sistema onde a `lory` nasceu — o laranja base `#f76500` e os neutros de lá. Ela não segue
    paleta de outro lugar (uma paleta âmbar de um app foi a pergunta, e a resposta foi não). O que entra nela é só o que
    vem desse mesmo sistema de origem, como a lateral escura dele (MNT-36, as cores medidas em 29/10).
- ~~Proibido: a aparência de outro design system~~ (trocado em 11/10/2026, ordem do Victor): **a peça
  é a da referência principal, quase idêntica, com as características desta seção por cima** (seção
  2, "quase idêntica"). Nome de componente igual ao dela é permitido. Continua proibido: o nome da
  BIBLIOTECA de outro sistema escrito em qualquer coisa do projeto;
  caixas retangulares genéricas; trocar paleta, raios, tipografia ou densidade sem autorização.
- **Marca registrada de terceiro não entra** numa biblioteca Apache-2.0 (logos de
  outras empresas). O `Button` do nativo tem `leading`/`trailing` para o app pôr o desenho dele, e o slot **não tinge**
  o que recebe.

---

## 6. Nomes privados — PROIBIDOS

O repositório não pode conter os nomes de projetos e agentes privados do Victor, **nem menção a
outros projetos dele** (ordem de 31/08/2026). Falar do consumidor numa conversa é normal;
**escrever o nome dele num arquivo** não é.

- **Consumidor real se escreve como "o consumidor", "o app", "o item"** — nunca pelo produto, pelo
  repositório ou pelo ramo. A forma atravessa (quantas telas, que peças); o domínio, não. Conteúdo
  de exemplo usa nomes genéricos: Messenger, Analyst, Curator, Writer, "Relatórios".
- **A lista de nomes NÃO mora no repositório** (decisão do Victor, 24/09/2026). O `validate.py`
  a lê de:
  1. a variável de ambiente `AUREA_NOMES_PRIVADOS`, nomes separados por `;` — configurada no
     ambiente das sessões de nuvem e como segredo do repositório no GitHub;
  2. ou o arquivo `.nomes-privados` na raiz, um nome por linha — na máquina local; o git o ignora.
- **Sem a lista, o `validate.py` reprova.** Se isso acontecer numa sessão, a variável do ambiente
  não está configurada: avise o Victor. **Nunca** peça para ele colar a lista na conversa, e nunca
  escreva a lista em arquivo rastreado.
- Rodar `python scripts/validate.py` depois de QUALQUER alteração e antes de qualquer publicação.
- Para reusar um gate, reuse a **função** dele (`scan_text`, `decode_any`), não a sua ideia do que
  ela faz.

---

## 7. Como trabalhar

**Leitura antes do primeiro edit, nesta ordem:**

1. [`STATE.md`](STATE.md) — os números do projeto (gerado; nunca escrever contagem à mão).
2. [`audit/2026-07-26-integral/04-PROTOCOLO-IA.md`](audit/2026-07-26-integral/04-PROTOCOLO-IA.md)
   — como trabalhar e o que registrar no fim.
3. [`decisions/`](decisions/README.md) — o que já foi decidido. **Decisão registrada não se reabre
   sem evidência nova**; decisão nova entra lá, não em prosa solta.
4. [`docs/QUALITY.md`](docs/QUALITY.md) — quando uma coisa está pronta, e quem cobra.
5. [`docs/MAP.md`](docs/MAP.md) — onde mexer para fazer o quê.
6. [`docs/BUILDING.md`](docs/BUILDING.md) — como se constrói um componente. **Componente novo não
   começa sem ler isto.**
7. [`docs/NATIVE.md`](docs/NATIVE.md) — o alvo nativo (React Native).
8. [`docs/PLANO-1.0.md`](docs/PLANO-1.0.md) — o caminho até a `1.0`.

**Componente da Aurea não se exclui, só se corrige; peça nova entra como VARIAÇÃO** (ordem do
Victor, 07/10/2026: *"os componentes da aurea não podem ser excluidos, apenas corrigidos.
componente novos tem que entrar como variações."*). Antes de criar um nome novo, achar o
componente que já existe e propor a variação (`variant` ou prop nova); quando não for óbvio de qual,
perguntar. Troca de nome só com ordem dele, e o nome antigo continua funcionando (como o `Topbar`,
hoje `Header`).

**As regras que custaram caro:**

- **Medir, não contar.**
- **Correção local é proibida sem responder "quem mais tem esse problema?"**
- **Mudança de comportamento vem com o controle que pega a regressão, no mesmo commit** — e o
  controle tem de ser **provado contra o defeito**, não só passar no estado atual. Gate que só
  concorda com o presente não é gate.
- **Escolher a entrada que exercita o código é parte do teste.** Um teste que passa com o defeito
  dentro é o achado mais comum deste projeto.
- **Afirmação velha se trata por espécie:** viva (alguém age com base nela hoje) → corrigir;
  histórica e datada → carimbar a data, não apagar; histórica que lê como atual → riscar com `~~`
  e pôr a correção ao lado.
- **A linha que envelhece primeiro é a que ninguém relê porque já leu:** cabeçalho, resumo de topo.
  Quem fecha um lote passa o olho no cabeçalho dos documentos irmãos.
- **Antes de aceitar uma demanda como "peça nova", procure na web se ela já existe lá.**

**Referências de desenho:**

- A pasta `Referencia/` (código de terceiros) fica fora do git. **A pasta ausente não é desculpa**
  (ordem de 12/09/2026): o inventário da referência principal está no documento de referências (seção 2).
- **Copiar só quando o Victor mandar** (ordem de 20/08/2026). Sem ordem dele, o padrão é ler.
- **A licença manda em cima da ordem.** Conferir o `LICENSE` antes de copiar; o
  [`docs/BUILDING.md`](docs/BUILDING.md) §2 tem as conhecidas. Código não-comercial ou AGPL não
  entra numa base Apache-2.0. O que for copiado leva crédito no
  [`docs/REFERENCES.md`](docs/REFERENCES.md) e um comentário curto no ponto de uso.
- Copia-se estrutura e geometria, nunca a paleta nem a pilha deles; tudo passa pelos tokens da
  Aurea.
- **Arquivo que o Victor mandar no chat se lê INTEIRO** — é provável pedido de implementação.

---

## 8. O alvo nativo, o que não é óbvio

- **Quantos componentes existem se mede:** os valores com inicial maiúscula exportados por
  `packages/native/src/index.ts`, `sistema.tsx` e `arquivo.tsx` (desde a `0.15.0`), menos os dois
  provedores e as duas constantes.
- **`DatePicker` e `PhotoInput` não saem pela porta da frente do pacote:** vivem em
  `@aurea-uds/native/system`, como os ícones vivem em `@aurea-uds/native/icons/*` (ADR-0038).
  O **`FileInput`** (R-21, `0.15.0`) vive num caminho só dele, `@aurea-uds/native/system/file`:
  no `/system`, todo app do `DatePicker` teria de instalar o `expo-document-picker`.
- **A `Table` do nativo não é uma tabela:** cada linha vira um cartão, e a API é `columns` + `rows`.
- **O `Chart` do nativo é o único cuja geometria é nossa** (ADR-0041). Com duas ou mais séries a
  legenda não desliga: a paleta `--chart-*` é uma rampa de um azul só.
- **O compilador não pega papel de acessibilidade errado no React Native** (a união termina em
  `| string`). Quem pega é o `check 41` do `validate.py`.
- **Peça marcada como elemento de acessibilidade não pode ter coisa tocável dentro:** no iPhone o
  que está dentro some para o VoiceOver. Quem pega é o `check 43`; conteúdo que o consumidor
  entrega é ponto cego dele.
- **Teste que pergunta ao dublê não prova o aparelho.** Peça nova aparece no `apps/native-smoke/`
  antes de sair; rodar é na máquina do Victor: `node apps/native-smoke/rodar.mjs`.

---

## 9. Ferramentas

- pnpm 12 (workspace em `pnpm-workspace.yaml`), desde 30/09/2026. O aviso "Update available" do
  pnpm não é ordem de atualizar: a versão sobe junto no `packageManager`, no `pnpm-lock.yaml` e na CI,
  com "pode", depois de testada numa cópia.
- TypeScript 7 strict (o binário `tsc` é o compilador nativo; usar a linha de comando).
- Python para scripts utilitários (`python`, não `python3`, no Windows).
- ⚠ **O terminal do Victor é o Windows PowerShell 5.1, que não aceita `&&`.** E `;` **não é
  equivalente**: ele segue depois de um erro, o que transforma uma cadeia de verificação em
  teatro. Para ele, **um comando por linha**; quando o comando é nosso, a ordem vai para dentro do
  script.
- Licença Apache-2.0; Inter, Sora e IBM Plex Mono sob OFL 1.1 (ADR-0077, desde a `0.39.0`; a Atkinson Hyperlegible,
  OFL 1.1, de 01/10 a 22/10/2026 e no nativo até a `0.40.0`); Phosphor Icons sob MIT (ADR-0053, desde a
  `0.13.0`; até a `0.12.4`, IBM Plex e Carbon).

## 10. Decisões já tomadas pelo Victor (16/07/2026)

1. Licença Apache 2.0.
2. Motor sem aparência: **Base UI** (`@base-ui/react`).
3. Tokens no formato **DTCG 2025.10** (`$value`/`$type`).
4. Fontes em pacote próprio, `@aurea-uds/fonts`.
5. Gradientes substituídos. Não reintroduzir.
6. Gestor: pnpm workspaces.

## 11. Regras de trabalho que moravam só na memória das sessões (passadas para cá em 11/10/2026)

Ordem do Victor, 11/10/2026: *"veja todas suas memórias e anote na do projeto"*. A memória de uma
sessão não chega à outra; este arquivo chega. O que já estava nas seções acima não se repete aqui.

**Começo de sessão e registro**
- **Comece pelo bloco "PASSAGEM PARA A PRÓXIMA SESSÃO"**, no topo da fila do documento de achados (fora
  do repositório, na pasta do Victor). Depois confira por comando: `git status -sb`, `gh pr list`,
  `npm view @aurea-uds/react version`.
- **Tudo se anota no documento de achados** — pedido, decisão, achado, com a prova. O Victor não cola
  texto entre sessões; nunca entregar "texto para colar". No fim da resposta, dizer ONDE ficou escrito.
- **Decisão dada é só registrar:** anotar e parar. Não emendar "baixo? instalo? guardo onde?".

**Como a fila anda**
- ~~**Rodadas maiores** (ordem de 10/10/2026): juntar mais componentes em cada versão.~~ → **Lotes de até 3 horas**
  (ordem do Victor, 21/10/2026: *"não ultrapassa 3hrs ... pelo menos 3 atualizações por dia"*): o ciclo inteiro —
  construir (até 1h15, com a versão, o CHANGELOG e a nota), a conferência rápida, a bancada (o Victor aprova olhando),
  a suíte do Chromium uma vez (39 min), a CI (34 min), juntar e publicar — cabe em ~2h50. Cada lote vira uma versão; o registro da
  publicada vai dentro do lote seguinte. Lote que passar de 1h15 de construção se divide ANTES de começar. A fila
  dividida assim mora no documento de achados ("ORDEM NOVA"). O que encolhe é o lote, nunca a conferência.
- **A suíte inteira roda UMA vez, no fim do lote** (ordem do Victor, 01/11/2026: *"precisa de todos esses suites? a toda
  hora?"* e *"pare de rodar tantas CI, deixe pra fazer depois que aprovo"*): durante o trabalho, só os testes do que mudou;
  nada de suíte antes de o Victor aprovar olhando; no fim, uma rodada da suíte do Chromium com o código final; o que
  reprovar, consertar e rodar de novo SÓ o que reprovou. Depois, a CI roda tudo nos três navegadores.
- **Qualidade extrema, sem refazer** (06/10/2026): prazo curto encolhe o ESCOPO, nunca a verificação.
  Se não cabe tudo, dizer quanto cabe, com números, e ele escolhe.
- **Muitas opções: o esboço vem antes da bancada** (decisão do Victor, 29/10/2026, *"Sim, para explorar"*): quando uma
  escolha tem MUITAS opções, elas saem primeiro como esboço no FigCraft (o programa de desenho da máquina dele, que se
  roteiriza pela linha de comando — uma tela em segundos); ele escolhe as finalistas, e só elas viram bancada funcional,
  com a peça real. A aprovação continua sendo SÓ na bancada. Com uma ou duas opções, direto na bancada.
- **O caminho até a `1.0`** (08 e 09/10/2026): terminar a fila do documento de achados → auditar a
  referência principal peça a peça, com as variações, e adotar o jeito dela → a `1.0` só quando a
  sessão disser que está pronta, com aprovação visual dele, e com mais duas marcas além de `aurea` e
  `lory` (cumprido na `0.47.0`: as 11 da paleta da 1.0) → antes dela, uma auditoria rígida e independente de tudo, feita por quem não escreveu o código
  (um agente sem o contexto da conversa, ou outra sessão aberta pelo Victor), consertada antes de sair.
- **Sem versão paga por enquanto** (08/10/2026): não propor preço, plano pago ou venda sem pedido dele.
  Pedido de quem é de fora é bem-vindo e entra na fila normal, sem prazo prometido; texto público sobre
  suporte, leve e acolhedor.
- **Mesmo nome de prop na web e no nativo** (06/10/2026, mantido em 11/10/2026): vale o do nativo
  (`tone`, `appearance`); a web aceita o antigo como apelido. E `onPress` nos dois.
- **Todo projeto deve lembrar a Apple** (06/10/2026); a referência principal é a nº 1.

**Travas, pasta e autonomia**
- **Trava (hook) que bloqueou: pare e peça o "pode".** Não contornar por outro caminho; só seguir o
  caminho que a própria mensagem da trava indica quando ele não chega ao mesmo efeito proibido.
  Remendo se declara com essa palavra.
- **A pasta principal fica no `main`.** O terminal do Victor usa a mesma pasta
  (`git pull`, `node scripts/publicar.mjs`): antes de mandar comando para ele, `git switch main`,
  `git status -sb` igual ao `origin/main` e `dist/` montado. Trabalho de lote vai numa branch ou numa
  cópia (worktree).
- **Com o Victor ausente** (06/10/2026): decidir pelo padrão recomendado e seguir (commit, envio de
  branch, pedido de junção, conserto da CI), anotando cada decisão. Continuam dele: juntar, publicar
  no npm e aprovar aparência. Trava que bloquear: pular, anotar e seguir.
- **Não arquivar conversas:** os arquivamentos automáticos da conta estão desligados por ordem dele
  (ao fechar o pedido e por inatividade). Nunca religar; ao ligar junção automática num pedido,
  conferir que o arquivamento ao fechar está desligado.
- **As memórias de agosto e setembro** (da pasta antiga) são histórico, de antes da troca de fonte e
  ícones: reconferir contra este arquivo e o código. Este arquivo e o código ganham da memória.
