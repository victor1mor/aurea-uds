# ADR-0062 — O botão compartilha, a moldura de celular é genérica, e os números alinham

- **Data:** 09/10/2026
- **Estado:** aceita · executada na `0.28.0` (ainda não publicada) · as escolhas foram do Victor
  depois de ver a pesquisa e a bancada; os ajustes da bancada também (*"link copiado quero mesma
  largura dos outros botões"*, o botão só de ícone com o círculo sempre à vista, a tabela com o
  canto da Aurea).
- **Origem:** o grupo 2 da fila — três pedidos de um site consumidor (GAR-14, GAR-15, GAR-16). A
  pesquisa foi além da fila de referências, por ordem do Victor (*"não se limite apenas às nossas
  referências, busque outras; vamos reduzir mais ainda a construção 100% nossa"*): a referência
  principal lida no código publicado do dia, a fila conferida, e mais de dez fontes de mercado por
  pedido, com licença. Os nomes ficam no documento de referências, fora do repositório.
- **Muda:** `Button` e `IconButton` ganham `share` (web e nativo); `Image` ganha `frame` e
  `srcDark` (web) / `sourceDark` (nativo); a tipografia ganha `numeric` e o peso `extrabold`; os
  tokens `--font-heading` e `--weight-extrabold`; a fonte 800 nos dois alvos; a tabela inteira com
  algarismos da mesma largura. **Não muda:** nenhuma prop sai, nenhum padrão muda — o título
  continua no semibold.

## As decisões

**1. Compartilhar é um comportamento do botão, não uma peça nova.** A referência principal não tem;
o guia de migração dela manda pôr o comportamento num botão que já existe, e nenhuma das fontes de
mercado tem "compartilhar pelo aparelho" (só "copiar"). Pela regra da casa — peça nova entra como
variação —, é a prop `share` no `Button` e no `IconButton`.

**2. Detectar o recurso, não adivinhar o aparelho** (escolha do Victor). O botão pergunta ao
navegador se ele sabe compartilhar este link (`navigator.canShare`). Sabe — o celular, e o Chrome,
o Edge e o Safari no computador —: abre a janela do aparelho, e a pessoa cancelar (`AbortError`)
não é erro. Não sabe: copia o link e mostra "Link copiado" preso ao botão. A cópia falhou: avisa e
mostra o link selecionado. O pedido original ("no computador, copiar") exigiria adivinhar o
aparelho, e nenhum sistema grande faz isso.

**3. O aviso tem a medida do botão.** A altura, o recheio, a letra, o peso e a cápsula — a regra do
recheio passou a ser UMA para os dois (`.btn,.toast-anchored`). Na web o aviso é o `Toast` ancorado
do motor, num gerenciador próprio (a documentação do motor manda separar o ancorado da pilha),
montado pelo `AureaProvider` de fora; no HTML puro, o `aurea.js` faz o mesmo pelo
`[data-aurea-share]`. O anúncio ao leitor de tela vai pela região de status (WCAG 4.1.3).

**4. A moldura de celular é GENÉRICA.** Quase todo o mercado desenha um iPhone; as regras de
marketing do fabricante proíbem simular o aparelho dele (a ilha, o entalhe, os botões), e a Aurea
não leva marca de terceiro. A moldura é variação do `Image` (`frame="phone"`), segue o tema (a
superfície do cartão, a borda e a sombra média) e tem o canto da folha de baixo, 32 (escolha do
Victor: o token que já existe, sem medida nova); o de dentro acompanha (32 − 8). A captura do tema
escuro é opcional (escolha do Victor).

**5. Os números alinham onde se lê em coluna.** `--font-heading` (o nome da maioria dos sistemas)
e `--weight-extrabold: 800` (o nome de dois sistemas grandes) entram; o título padrão continua no
semibold, como na referência principal (escolha do Victor). Algarismos da mesma largura ligados por
padrão na `Table` inteira e no campo de número; no nativo, no número do `KPI` e nas células da
`Table`. A `DataList` não liga por padrão (ninguém liga, e a ficha técnica alinha à esquerda, com
texto misturado): para isso existe `numeric` na tipografia, nos dois alvos.

**6. A fonte 800 sai do mesmo processo das outras.** Cortada da fonte variável oficial do Google
Fonts; o processo foi provado refazendo o 700 — só a data de criação (`head.modified`) mudou, as
outras tabelas são idênticas byte a byte, no `.ttf` e no `.woff2`. Na web, 12 KB, baixados só
quando alguma regra pede 800; no nativo, 48 KB.

## Alternativas rejeitadas

- **Uma peça `ShareButton` própria:** contraria a regra da variação, e a referência faz no botão.
- **Adotar uma biblioteca de copiar:** nenhuma faz compartilhar E copiar; a mais usada diz
  "copiado" mesmo quando falha; outra é de logos de redes sociais (marca de terceiro).
- **Copiar no computador mesmo quando o navegador sabe compartilhar:** escolha do Victor contra.
- **Um gerenciador de aviso por botão:** cada um criaria uma região "Notificações" — numa página
  de notícias com vários botões, várias regiões para o leitor de tela.
- **Moldura de iPhone (dos pacotes prontos):** marca de terceiro; e os pacotes estão parados ou
  aceitam só React até a 18.
- **Título padrão em 800:** mudaria a cara de todo app; o 800 fica opcional.
- **Pacotes prontos de fonte no lugar do `@aurea-uds/fonts`:** toca a decisão nº 4 de 16/07/2026;
  registrado para o Victor decidir, não feito.

## Como ela é obrigada

- `tests/unit/lote-m.test.tsx` — o `Button share` no React (as cinco saídas: compartilhar,
  cancelar, copiar, falhar, o clique do app que cancela) e no `aurea.js`; o "copiado" do bloco de
  código que fala; a regra única do recheio; a moldura e a captura de cada tema; os tokens, a fonte
  800, `numeric` e `extrabold`, a tabela e o campo de número.
- `tests/unit/native-lote-m.test.tsx` — o `share` no Android, no iPhone e no navegador; a moldura e
  o `sourceDark`; `numeric`, o 800, o papel `heading`, o `KPI` e a `Table`.
- `tests/visual/compartilhar.spec.ts` — nos três motores e nos dois temas: o aviso com a altura, a
  letra, o peso, o recheio e a cápsula do botão, logo abaixo dele; o erro com o link selecionado;
  a moldura com 32 e 24 de canto e a proporção; "11.111" e "88.888" com a mesma largura.
- Provados contra a `0.27.0`: 36 dos testes novos reprovam com o código de antes.

## Consequências

- Quem já usa `Button` e `Image` não muda nada; a tabela passa a ter algarismos da mesma largura
  em todas as células (só os algarismos mudam).
- O aviso do compartilhar precisa do `AureaProvider` (ou do `aurea.js` na página); sem os dois, o
  botão ainda compartilha e copia, e diz no console que não tem como avisar.
- Dois `Viewport` de aviso do motor por página (a pilha e o ancorado), com o rótulo padrão do motor.

## Quando rever

Se a referência principal ganhar um botão de compartilhar ou uma moldura; se o Victor quiser o
título padrão em 800; ou se a fonte ganhar uma versão nova.
