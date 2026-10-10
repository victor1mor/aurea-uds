# ADR-0061 — As cores dos dois temas seguem a paleta de referência

- **Data:** 09/10/2026
- **Estado:** aceita · executada na `0.27.0` (ainda não publicada) · aprovada pela bancada em
  09/10/2026 (*"aprovado, pode enviar"*).
- **Origem:** o pedido "cores e tons" do app consumidor (no escuro, ele queria os botões com a cor
  do claro), e a decisão do Victor depois de comparar, lado a lado, a Aurea, um assistente e um
  aplicativo de mensagens: *"as cores de tema claro e escuro vamos usar igual do [aplicativo], a
  nossa marca mantemos"*, e o *"pode faça tudo"*. O nome e a origem da paleta estão no documento de
  referências, fora do repositório (seção 2 do `CLAUDE.md`).
- **Muda:** a regra de identidade da seção 5 (a paleta deixa de ser a original); os neutros e as
  cores de estado dos dois temas; o papel de `--success`, `--info`, `--warning` e `--destructive`.
  **Não muda:** o amarelo da marca, os raios, a fonte, os ícones, as densidades, as oito cores de
  categoria (ADR-0060), a escala do gráfico, a marca `lory`. Nenhuma prop muda, nada sai.

## A regra

**1. As cores vêm da paleta de referência, valor por valor.**

| papel | claro | escuro |
|---|---|---|
| fundo da página (`--background`) | `#f5f5f5` | `#1f1f1f` |
| cartão, janela, lateral | `#ffffff` | `#292929` |
| texto (`--foreground`) | `#242424` | `#ffffff` |
| texto apagado (`--muted-foreground`, `--subtle-foreground`) | `#616161` | `#adadad` |
| preenchimento neutro (`--secondary`, `--muted` no escuro) | `#ebebeb` | `#333333` |
| borda (`--border`) | `#e0e0e0` | `#525252` |
| borda de campo (`--border-strong`) | `#616161` | `#adadad` |
| fundo cheio de sucesso, aviso, perigo, informação | `#107c10` · `#f7630c` · `#c50f1f` · `#0078d4` | os mesmos |
| letra sobre o fundo cheio | branca; preta-escura no aviso (`#242424`) | a mesma |
| letra de estado sobre a tela (`-400`) | `#0e700e` · `#8a3707` · `#b10e1c` · `#006cbf` | `#54b054` · `#faa06b` · `#eeacb2` · `#5caae5` |
| fundo suave de estado (`-bg`) | `#f1faf1` · `#fff9f5` · `#fdf3f4` · `#f3f9fd` | `#052505` · `#4a1e04` · `#3b0509` · `#002440` |
| véu das janelas (`--overlay`) | preto a 40% | preto a 50% |

**2. O fundo cheio de estado é a MESMA cor nos dois temas.** Era o pedido do app: no escuro, a
Aurea trocava o verde e o azul por cores claras com letra escura. Agora o botão cheio é o mesmo no
claro e no escuro, com a letra branca.

**3. Fundo é fundo, letra é letra.** `--success`, `--info`, `--warning` e `--destructive` são o
FUNDO cheio (botão cheio, selo cheio). Letra, ícone, borda e barra de progresso sobre a tela usam o
par `-400` (`--success-400`…), que cada tema ajusta. Como letra no escuro, o fundo cheio daria 2,4
a 3,6:1; o par de letra passa de 4,5:1 em todas as superfícies. O selo cheio de estado passa a ser
o botão cheio do mesmo tom (mesma cor, mesma letra), na web e no nativo.

> **Exceção, 10/10/2026 ([ADR-0063](0063-o-cartao-contraste-e-o-traco-de-cor.md)):** o traço no topo
> do `Card` (`accent`) usa a cor CHEIA, a mesma nos dois temas. É enfeite — o nome da caixa diz o
> assunto —, por decisão do Victor. A exceção mora numa variável própria (`--card-accent`); toda
> outra borda continua no par `-400`.

**4. Onde a paleta reprovaria a norma, vale o tom da própria paleta que passa** (medido nas cinco
superfícies de cada tema):
- a letra de aviso no claro é o `#8a3707` (o segundo tom de letra de aviso da paleta); o primeiro,
  `#bc4b09`, dá 4,25:1 sobre o preenchimento neutro;
- a letra de perigo no escuro é o `#eeacb2` (o terceiro tom de letra de perigo da paleta); o
  primeiro, `#dc626d`, dá 4,2:1 sobre o cartão;
- a letra sobre o botão de aviso é a escura (`#242424`, 5,0:1); a branca daria 3,1:1;
- a paleta não tem cor de "informação": vale o azul dela (`#0078d4`, letra branca 4,53:1).

## As fontes

- A paleta de referência: o tema claro e o escuro que o fabricante publica no pacote de temas da
  biblioteca dele (versão 9.2.2), lidos no texto do pacote. Os tons de letra de estado, das exceções
  que o próprio pacote declara para cada tema.
- A pesquisa que o Victor pediu antes de decidir (09/10/2026, páginas oficiais): a norma da web
  (WCAG 2.2) pede 4,5:1 na letra e não exige que o botão com texto se destaque do fundo; o guia de
  outra plataforma pede, no escuro, cores de primeiro plano mais claras e 7:1 em texto pequeno.
  **A recomendação da sessão foi manter o escuro original**; a decisão do Victor foi a paleta de
  referência, sabendo que o botão cheio fica com 2,2 a 3:1 contra o fundo escuro.

## Alternativas rejeitadas

- **Manter o escuro original** (cores claras no escuro): recomendação da sessão, não escolhida.
- **Copiar a paleta sem exceção:** três combinações reprovariam o 4,5:1 da letra (as do item 4).
- **Usar o fundo cheio também como letra:** o verde, o azul e o vermelho dariam 2,4 a 3,6:1 no
  escuro.
- **Trocar também o amarelo:** a marca é nossa (seção 5).

## Como ela é obrigada

- `tests/unit/paleta-adr0061.test.tsx`: os valores dos dois temas (a decisão é o número); o fundo
  cheio igual nos dois temas; a marca intocada; o core sem nenhuma letra, ícone, borda ou barra
  pintada com a cor de fundo; e o nativo seguindo a mesma regra. Provado contra a `0.26.1`.
- `tests/visual/tone-contrast.spec.ts`: os papéis de letra (agora `-400`) nas cinco superfícies,
  nos dois temas, acima de 4,5:1; a matriz dos botões.
- A varredura do catálogo (axe, nos dois temas): pegou o rótulo de grupo da lateral, que caiu para
  4,4:1 com a letra nova — corrigido (72% da letra da lateral).

## Consequências

- Todo app que usa a Aurea muda de cara nos dois temas. O tema escuro fica mais claro (fundo
  `#1f1f1f`, cartões `#292929`) e com bordas mais visíveis.
- Quem pintava letra com `--success` (ou `--info`, `--warning`, `--destructive`) no próprio app
  deve passar para o par `-400`.
- As fotos do catálogo e da matriz mudam todas.

## Quando rever

Se a paleta de referência mudar de versão, ou se o Victor pedir de volta o escuro original.
