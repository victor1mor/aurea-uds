# ADR-0088 — O site B

- **Data:** 31/10/2026
- **Estado:** aceita · as peças na `0.52.0` (branch `claude/site-b-e8ad44`); o site, nos lotes seguintes — só na web.
- **Substitui:** da [ADR-0067](0067-o-site-segue-a-documentacao-da-referencia.md), o topo de duas linhas, a lateral sem
  caixa e a grade de 3 do "All Components"; da [ADR-0071](0071-a-pagina-inicial-e-a-vitrine-da-referencia.md), a página
  inicial copiada da referência. O resto das duas continua valendo.
- **Origem:** o desenho B do site, aprovado pelo Victor em 26/10 e 29/10/2026 (a documentação, o catálogo e a página de
  componente, nos dois temas). Em 30/10/2026 ele aceitou as dez recomendações e a ordem dos lotes (*"Aceito tudo"*), e
  depois mandou que a página fosse **idêntica** ao desenho (*"eu quero idêntico"*), com as cores de hoje (*"Cores de
  hoje"*). Em 31/10/2026 aprovou a página Introduction na bancada, em tamanho real, e as cinco mudanças de peça (*"pode"*).

## O que se mediu

- **A primeira bancada estava errada.** Ela comparava só as caixas grandes (a pílula, a lateral, o palco, o índice) e
  dizia "igual"; o Victor viu os itens da lateral fora do lugar (*"precisa alinhar os itens"*). Comparando TEXTO POR TEXTO
  (a posição, a largura, a letra, o peso, a entrelinha de cada trecho das duas páginas), eram 155 diferenças. Depois de
  acertadas: a 1440, nos dois temas, 134 textos no lugar e todas as caixas iguais; o que sobra é a largura de cada letra,
  porque as fontes da Aurea são os arquivos oficiais (ADR-0077) e as do desenho vinham de outro lugar.
- **O desenho usa letras que a Aurea não tem:** 13, 15, 17, 19, 22, 34 e 44. A escala da Aurea é a da referência
  ([ADR-0050](0050-a-escala-de-letras-vem-da-referencia.md)), e ela também não tem esses números.
- **O desenho não cabe em toda largura:** a 1280 e a 1024 ele rola de lado (a pílula passa da borda). A 1271 (o notebook
  de 14" do Victor), a página da referência tira o índice da direita.

## A regra

1. **A forma é a do desenho; as cores e a letra são as da Aurea de hoje.** Cada medida do desenho se escreve com os
   tokens — a conta entre tokens quando o número não é um degrau (`calc(var(--space-3) + var(--space-05))` para 14). A
   letra vai para o degrau mais perto da escala da ADR-0050, e no empate para o maior (13→12, 15→14, 17→18, 19→20, 22→24,
   34→36, 44→48); a entrelinha também (1,6 → 1,5; 1,65 → 1,7). Querer a letra do desenho seria abrir sete tamanhos novos
   e reabrir a ADR-0050: pergunta à parte.
2. **"Igual" se mede texto por texto**, contra o desenho com a letra da Aurea (a régua), em 1440, no tamanho do meio e
   no celular, nos dois temas. A bancada de aprovação mostra UMA página por vez, em tamanho real, com o desenho, a régua e
   a página de verdade a um clique (a mesma rolagem).
3. **As larguras são medidas:** a pílula cheia precisa de 1302 e cabe de 1335 para cima; de 1121 a 1334, o topo apertado
   do próprio desenho (a busca só com a lupa, as áreas mais juntas); abaixo de 1121, as áreas saem da pílula. O índice da
   direita só existe de 1280 para cima, como na referência (o Victor, 31/10/2026: *"vamos deixar como você fez mesmo...
   a referencia espreme demais"*).
4. **As cinco peças** (a `0.52.0`, só acrescentam):
   - o `AppShell` aceita a pílula (`topbarVariant="pill"`) e `topbarBlurred`; no `layout="docs"` a cápsula de 64 fica a
     14 do alto, as colunas começam a 96 com 28 de vão, o índice tem 236 e a altura do que mostra, a lateral vai até 16 do
     pé da tela;
   - o `Header` `pill` com `maxWidth` é a cápsula da largura do `Container`, e o `blurred` vale na `pill`;
   - o `TableOfContents` com o anel de leitura (`progress`) e o item atual na cápsula (`indicator="segment"`);
   - o grupo que dobra da `Sidebar` com a seta na ponta e os itens um passo para dentro, e o abrir e fechar no `aurea.js`;
   - o `Accordion` com o "+" numa bolinha (`indicator="plus"`) e a linha de 60 (`size="lg"`).
5. **O resto é do site** (a folha do gerador, sem peça nova): os botões do topo com o toque de 44 (`--target-min`), a
   lateral com os grupos numerados e a bolinha da categoria, o índice e a abertura nas medidas do desenho, o palco, os
   cartões e o rodapé.
6. **Os dez lotes**, na ordem aceita em 30/10/2026: 1 a moldura (+ esta ADR + o registro da 0.51.0), 2 a página inicial,
   3 a busca e o menu do celular, 4 o catálogo, 5 e 6 a página de componente, 7 a documentação, 8 Releases e Hooks, 9
   Tokens e Patterns, 10 Blocks e Recipes. Lote só do site não gera versão; lote que muda peça gera.

## Quem cobra

- `tests/unit/site-b-pecas.test.tsx` — o que o React desenha e o que o `aurea.js` faz (com as peças da 0.51.0, 9 dos 11
  reprovam).
- `tests/visual/site-b-pecas.spec.ts` — as medidas das peças no navegador, a 1440 (com a folha da 0.51.0, os dois
  reprovam).
- O `catalogo-fiel.mjs` — cada valor novo (`topbarVariant="pill"`, `indicator`, `size`) tem exemplo vivo no site.
