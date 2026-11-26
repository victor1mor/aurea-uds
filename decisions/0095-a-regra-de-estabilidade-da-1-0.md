# ADR-0095 — A regra de estabilidade da 1.0: o que é público e quanto tempo um nome velho continua

- **Data:** 26/11/2026
- **Estado:** aceita · lote 107 (branch `claude/lote-107-7df43a`). O Victor leu o resumo, viu a página nova ao lado da
  de antes e aprovou as três escolhas (o prazo de 6 meses, os consertos só na versão mais nova, a frase nova numa versão
  menor): *"Aprovo as três"* (26/11/2026).
- **Origem:** o UDS-A2, item 2 da Fase A do relatório "Aurea como UDS completo" (fora do repositório), aprovado pelo Victor
  em 24/11/2026 (*"Sim, os 5"*): a 1.0 é um compromisso, e compromisso precisa estar escrito. O relatório pedia duas
  coisas: dizer o que é a "API pública" e por quanto tempo um nome marcado para sair continua funcionando.

## O que já existia (lido antes de escrever)

- **A página Versioning** (lote 090, 20/11/2026) já dizia: as sete versões andam juntas; o que muda numa versão de
  correção, numa menor e numa maior; o que quebra; o ajuste visual pequeno cabe numa menor; o nome velho sai só na
  maior seguinte. **Faltava:** o prazo em tempo, a lista do que é público, os modos de leitura, as frases do
  `AureaStrings`, o teclado, as dependências de par, o selo de maturidade e os consertos de versões antigas.
- **A página Migration** (lote 091, 0.76.0): a tabela do que saiu e a lista "Old names that stay".
- **As travas:** o check 31 (componente novo citado no CHANGELOG, contra o `scripts/released-surface.json`), o 31b
  (frase nova do `AureaStrings` sai sob "⚠ Pode quebrar a compilação"), o 50 (nome citado nas páginas existe) e o 16
  ("Stable" na ficha exige teste). A regra não muda nenhuma delas.
- **As fichas** têm `maturity`: 110 `Stable`, 50 `Ready`, 2 `Deprecated` (`Topbar`, `useValorResponsivo`), nenhuma
  `Draft`. O site mostra o selo no topo da página da peça.

## O que os sistemas maduros fazem (só leitura)

- O prazo costuma vir em versões maiores: o nome marcado sai depois de pelo menos uma versão maior. Quando vem em
  tempo, os números citados vão de 3 a 6 meses (comunidade pequena) a 18 meses (plataforma com muitas equipes).
- O que contam como público: nomes de token, variáveis CSS, classes, props, caminhos de importação.
- O aviso: nota de versão, marca nos tipos, página de migração, aviso no console.

## A regra

1. **Público é o que se vê e se usa de fora dos pacotes:** componentes e ganchos exportados, com props, valores e tipos
   (web e nativo); os caminhos do `exports` de cada pacote; os tokens (CSS, JSON e nativo); as classes e os atributos
   `data-*` que o site documenta para HTML puro; os nomes das marcas e os valores de tema, densidade e modo de leitura;
   as chaves do `AureaStrings`; o teclado e o nome acessível que a página da peça documenta; os nomes dos campos do
   contrato em `@aurea-uds/contracts`.
2. **Não é público:** o que o site não documenta (classe interna, ajudante privado, a estrutura interna do HTML), o texto
   dos avisos de desenvolvimento, a ordem das regras no CSS e o CONTEÚDO do contrato (ele cresce; os nomes dos campos
   ficam).
3. **O selo diz até onde a regra vai:** `Stable`, `Ready` e `Universal` estão cobertos; `Draft` não (hoje nenhuma ficha
   é `Draft`); `Deprecated` é nome velho que tem um novo.
4. **Quebra, só em versão maior:** tirar ou renomear algo público, tirar ou mudar um caminho de importação, mudar um
   padrão, apertar um tipo, tirar um comportamento de teclado ou um nome acessível documentado, subir a versão mínima de
   React, React Native ou outra dependência de par, e mudar o tamanho de uma peça ou baixar o contraste.
5. **Cabe numa menor:** o acréscimo; a chave nova do `AureaStrings`, que chega com o padrão em inglês (a nota continua
   avisando em "May break compilation", e o check 31b continua cobrando); o ajuste visual pequeno; o desenho novo que
   entra como VARIAÇÃO escolhida, com o padrão igual (a regra da seção 7 do `CLAUDE.md`); marcar um nome como velho.
6. **O nome velho:** marcado numa menor, com o substituto; escrito em três lugares (a seção "Deprecated" da nota de
   versão, o `@deprecated` nos tipos e a página Migration); tirado só numa maior E **pelo menos 6 meses** depois da menor
   que o marcou — se a maior vier antes, ele espera a seguinte; cada maior que tira nomes tem a sua seção na Migration.
7. **Marcado não quer dizer que sai.** O `Topbar` e o `useValorResponsivo` ficam com a marca para o código novo usar o
   nome atual, e a Migration os lista em "Old names that stay". Isto desfaz a aparente contradição entre o selo
   `Deprecated` das duas fichas e a frase "keep working in 1.0".
8. **Consertos, só na versão mais nova**, inclusive os de segurança. É o que o processo de publicação faz hoje (uma
   linha só, publicada em etapa pelo `release.yml`); o prazo de 6 meses dá tempo de planejar a troca de versão maior.

## O que fica de fora, e por quê

- **A chave nova do `AureaStrings` no nativo:** o `AureaProvider` do nativo pede o objeto INTEIRO (`strings?:
  AureaStrings`, sem juntar com o padrão), enquanto o da web aceita parte (`Partial<AureaStrings>`). Depois da 1.0, uma
  frase nova no nativo quebraria todo app que passa as frases. É mudança de pacote, fora deste lote: fica como pendência
  antes da 1.0.
- **Aviso no console para nome velho:** não entra agora. A marca nos tipos já risca o nome no editor, e o texto dos
  avisos de desenvolvimento não é público.

## Consequências

- A página Versioning do site passa a dizer tudo isto, em inglês; a Migration diz o prazo de 6 meses.
- Quem tirar um nome depois da 1.0 confere a data da menor que o marcou antes de pôr na lista da maior.
