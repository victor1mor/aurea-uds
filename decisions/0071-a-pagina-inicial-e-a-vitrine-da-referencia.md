# ADR-0071 — A página inicial e a vitrine são as da referência, e o ícone do campo guarda a medida dela

- **Data:** 15/10/2026
- **Estado:** aceita · feita na branch `claude/lote-r`, na `0.33.0`, em passos mostrados na bancada antes do git.
- **Origem:** o Victor, 15/10/2026, comparando a página inicial da Aurea com a da referência no monitor de 24" e no
  notebook: *"analise cada milímetro tudo, não quero mais ter que apontar nada"*; depois *"A, B, C, pode"* (A = as
  diferenças na peça, B = as peças que a vitrine dela usa e a Aurea não tinha, C = a aba "Components"); e, vendo a
  busca ao lado do campo da referência, *"de um lado é curto (correto), do outro é largo… temos dezenas de
  componentes assim"*, com *"A sim, B sim, C sim e também faça como o deles o Ctrl K separado, D… pode"*.

## Contexto

A página inicial da Aurea seguia a da referência no desenho geral, mas a medição (o código dela e as duas páginas
rodando, em 1902, 1440 e 375) mostrou três famílias de diferença:

1. **Na peça**: o topo transparente de 56, a chave de tema de três posições, o rodapé de uma linha, o selo sem
   linha, o botão "Theme" apagado.
2. **Peças que faltavam** para montar a vitrine "Components" dela: o grupo de opções na web, a descrição no
   `Switch`/`Radio`, o tracinho do código, o botão suave, as partes do cartão, o aviso com botão, o atalho na
   lista, o avatar colorido.
3. **Uma medida errada em toda a família de campos**: o texto do campo com ícone na frente ficava a 24 do ícone
   (28 no `lg`), com 13 do outro lado — o campo somava o recuo dele aos 12 do adorno, e o comentário da regra
   prometia "12, o glifo, 12". No fim, o texto do adorno ficava a 4 da borda.

## Decisão

1. **Toda diferença vira VARIAÇÃO de peça que já existe** (a regra de 07/10/2026), com o nome da referência ou o do
   nativo quando já havia um: `Header size/blurred/menuActions`, `ThemeToggle mode="light-dark-system"` e a
   preferência `"system"` do `AureaProvider`, `Section layout="inline"`, `Badge emphasis="flat"`, `Button quiet`,
   `appearance="soft"` e `variant="danger-soft"`, `RadioGroup` na web (o do nativo), `description` e `labelHidden`
   no `Radio`/`Switch`, `Switch indicatorPlacement` (o nome do `RadioGroup` do nativo), `OTPField groupSize`, as
   partes do `Card`, `Alert action`, `ListBox kbd`, `Avatar tone/emphasis`, o `kbd` em lista e o desenho do app no
   `leadingIcon` do `Button`.
2. **A vitrine "Components" é a da referência**, montada só com peças da Aurea, num arquivo só para a página pronta
   e a viva (`apps/catalog/live/vitrine-componentes.mjs`). Viva pelo `home.js`, que só o Início carrega, sob o
   provedor único do site. **De propósito diferente**: sem foto de pessoa (iniciais e ícones), sem marca de outra
   empresa ("continuar com" e-mail e chave de acesso), as fileiras de abas sem painel são o `SegmentedControl`, e o
   perfil é um exemplo genérico (números de seguidores da Aurea seriam falsos).
3. **O campo com ícone guarda a medida da referência**: o campo depois de um adorno em linha não põe recuo próprio
   (12, o ícone, 12); a busca é 12, a lupa, 8; o texto ou ícone do fim fica a 12 da borda, o botão a 4 (o glifo dele
   cai a 12) e a tecla a 8. Vale na base e na camada responsiva; com o adorno em faixa, o recuo continua.
4. **A chave de tema de três posições é pintada**, como a de duas era: a escolhida é branca nos dois temas (a da
   referência), a lua e o monitor no preto absoluto (`--black`, 21:1) e o sol no amarelo da marca, puro (`--brand-yellow`).
   O amarelo de ícone do tema claro (ADR-0054) foi reprovado no sol (*"não existe sol marrom"*); das três formas de sol
   amarelo mostradas rodando — puro no branco, puro com contorno, puro num círculo preto —, o Victor escolheu a
   primeira, sabendo do contraste medido: **1,91:1 no branco**. A escolha continua dita pelo fundo branco e pelo nome
   da opção.
5. **A linha entre as seções** das listas (a `ListBox`, o `Select` com grupos e os dois `Combobox`) é automática,
   de borda, 8 para dentro de cada lado: na referência quem a põe é quem usa a lista, e aqui a lista vem por dados.

## Alternativas rejeitadas

- **Componentes novos para a vitrine** (um `ProfileCard`, um `LoginCard`): reprovado pela regra de 07/10/2026 — as
  partes do `Card` montam os três cartões dela.
- **Abas sem painel** (o `Tabs` com conteúdo vazio): um painel vazio que recebe o Tab não é aba; a escolha de um
  entre vários é o `SegmentedControl`, com a mesma aparência.
- **Consertar o espaço do ícone peça por peça**: a causa era uma regra só, e consertá-la num lugar só conserta a
  família inteira. A varredura de 785 ícones nas 146 páginas não achou o defeito fora dos campos.
- **Mudar o tamanho do ícone do campo para os 16 da referência**: o campo da Aurea tem a escala dela (16 no `sm`,
  20 no `md` e no `lg`); o pedido foi a distância, não o desenho.

## Consequências

- **Quebra de compilação** (anotada no `CHANGELOG.md`): quatro frases novas no `AureaStrings`; o `kbd` e o
  `leadingIcon`/`trailingIcon` do `Button` com tipos mais largos; a caixa da `CommandPalette` e da
  `CommandPaletteShell` no portal.
- **Mudança de desenho** para quem já usa: o texto dos campos com ícone chega 12 mais perto do ícone; o texto do fim
  se afasta 8 da borda; a classe `.card-header` deixou de ser o cabeçalho em linha da primeira versão pública.
- As fotos `topo` e `componentes` do catálogo mudam (o "Ctrl" e o "K" separados, as peças novas).

## Quem cobra

- `catalog-sweep.spec.ts` (nos três navegadores): as medidas do campo com ícone, da busca e do fim; a linha entre as
  seções; o `Card.Header`; a chave no fim; o "Ctrl K" separado e anunciado como `Control+K`; a vitrine (colunas,
  vãos, larguras, viva, uma coluna no celular).
- `lote-r-pecas.test.tsx` e `lote-r-respostas.test.tsx`: a marcação de cada variação, provada contra a peça antiga.

## Condição de revisão

Uma medida nova da referência (o código dela muda) ou uma decisão do Victor contra uma das diferenças de propósito.
