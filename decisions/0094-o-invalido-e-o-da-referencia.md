# ADR-0094 — O campo inválido é o da referência: o contorno vermelho, e o fundo não muda

- **Data:** 11/11/2026
- **Estado:** aceita · na `0.66.0` (branch `claude/lote-072`).
- **Substitui:** o item 4 da [ADR-0072](0072-sem-linha.md) só no que diz do CAMPO INVÁLIDO (*"o aviso que era linha vai
  para o fundo"*). O resto da 0072 continua — o escolhido, o arrastar e os avisos continuam fundo.
- **Origem:** o Victor viu o `DatePicker` inválido da 0.65.0 e disse *"não gostei muitos desse invalido, [a referência] faz ele
  como?"*. A sessão leu o pacote publicado da referência (web 3.2.7 e telefone 1.0.11, os mais novos em 11/11/2026),
  desenhou as 21 formas de campo com erro da Aurea lado a lado — A, como estavam (o fundo de perigo), e B, como a
  referência faz, com a cara da Aurea —, nos dois temas, e ele escolheu olhando: *"B como a referencia e Ember entra"*.

## O que a referência faz (lido no pacote dela)

- **Os campos** (texto, escolha, número, código, grupo, cor, data): o fundo continua o do campo; um contorno vermelho de 1;
  no foco, um anel vermelho de 2. O rótulo do campo fica vermelho; a frase de erro embaixo.
- **A caixa de marcar:** vazia, o contorno; marcada (ou meio-marcada), vermelha cheia com o visto branco.
- **O rádio:** o contorno, marcado ou não.
- **A chave (`Switch`):** não tem inválido.
- **Os grupos:** não têm desenho próprio — quem pinta são as opções, e o rótulo do grupo fica vermelho.

## A regra

1. **O fundo do campo com erro é o fundo do campo sem erro.** O `--danger-bg` sai do inválido (web) e o `dangerBg` também
   (nativo, `contornoDeErro()` no `estilos.ts`).
2. **A borda que já existe** (transparente, de 1) **fica na cor da frase de erro** — `--danger-400` na web, `danger400` no
   nativo. Nenhuma medida muda. A área de soltar arquivo, que tem a borda tracejada, fica com a linha cheia no erro. O
   cartão de escolha (`RadioGroup variant="card"`), que não tem borda, recebe o contorno por dentro (`inset`).
3. **No foco, o vermelho fica.** Na web, o anel cola na borda e é vermelho (`--focus-strong`, ADR-0059). No nativo, a
   borda engrossa para a do foco, na cor do erro — a pista do foco continua, como pedia o teste do `NumberField` de
   22/08/2026, e agora na cor do erro, como o campo focado da referência atual.
4. **O rótulo do campo e do grupo fica vermelho** (web: `.field`, `.checkbox-group`, `.radio-group`; nativo: o `Field`).
   O nome de cada opção (a caixa, o rádio, a opção do grupo) continua na cor do texto — no nativo, o nome da opção do
   `RadioGroup` deixa de ficar vermelho, para ser igual à web e ao desenho B.
5. **A caixa MARCADA com erro fica vermelha cheia**, o `--destructive`, com o visto branco (`--destructive-foreground`), nos
   dois alvos. O rádio marcado com erro guarda o amarelo e ganha o contorno. No nativo, a caixa e o rádio soltos passam a
   receber o erro do `Field` (antes não recebiam nada).
6. **A chave não tem inválido**, como na referência: o erro dela é a frase embaixo e o `aria-invalid` para o leitor de
   tela. A ficha do `Switch` deixa de declarar `invalid`, e a trava do inválido declara o motivo.
7. **No alto contraste** que o app liga (`data-contrast="high"`, ADR-0090), o contorno de 3:1 dos campos vem depois e pesa
   o mesmo: a regra do erro é repetida ali, para o vermelho não virar cinza.
8. **A Ember recebe** (o Victor: *"Ember entra"*).

## A exceção ao "sem linha"

O contorno do erro é a quarta linha nomeada da [ADR-0072](0072-sem-linha.md) (depois da do cartão de contorno, da de ponta
a ponta do site e das que só o contraste acende). A trava `tests/unit/sem-linha.test.tsx` aceita SÓ: na web, a cor
`--danger-400` na borda (ou `inset 0 0 0 var(--border-width) var(--danger-400)`) em regra cujo seletor fala do estado
inválido (`[aria-invalid="true"]` ou `:user-invalid`); no nativo, a linha do `contornoDeErro` no `estilos.ts`. A mesma cor
em outra regra, ou outra cor na regra do erro, reprova.

## O que fica de fora (pergunta à parte ao Victor)

A medição de 11/11/2026, com a peça rodando, achou quatro peças da web em que o erro do `Field` não chega: o `NumberField`
e o `OTPField` (nem pelo `Field` nem passando `aria-invalid` direto — o app não tem como mostrá-los com erro), o `Input`
dentro de um `InputGroup` (só passando o `aria-invalid` no `Input`) e o `FileInput` (não tem `error`; só fica vermelho com
arquivo recusado). A regra desta ADR já cobre o desenho delas (o `NumberField` entrou na lista); fazer o erro chegar é
mudança de peça, e vai ao Victor à parte.

## Quem cobra

- `tests/visual/invalido-referencia.spec.ts` — no navegador, nos dois temas e na Ember: o fundo com e sem erro é o mesmo,
  a borda e o rótulo são o `--danger-400`, a caixa marcada é o `--destructive`, a chave não muda. Contra o CSS de antes,
  reprova no fundo.
- `tests/unit/native-invalido-referencia.test.tsx` — no nativo: a caixa vazia com o contorno, a marcada vermelha com o
  visto branco, o rótulo vermelho, a chave igual. Contra o código de antes, 3 de 4 reprovam.
- `tests/visual/invalido.spec.ts` — todo controle de formulário continua se mostrando inválido (a chave, declarada fora).
- `tests/unit/sem-linha.test.tsx` — a exceção, nos dois lados.
