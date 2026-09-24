# ADR-0049 — A escala de letras tem cinco degraus que se enxergam, e os dez nomes continuam

- **Data:** 19/09/2026
- **Estado:** ~~aceita~~ **substituída pela [ADR-0050](0050-a-escala-de-letras-e-a-do-heroui.md) em 24/09/2026**
- **Autoria:** decisão do Victor, olhando o app no aparelho — *"o tamanho das fontes: existem
  variações demais, fica muito estranho"* —, levada por ele ao consumidor como item **C15** e
  autorizada depois da medição abaixo.
- **Obriga:** `packages/tokens/src/aurea.tokens.json` (os dez `text-*`) · o bloco de escala no
  `packages/native/src/text.tsx`

## A regra

> **Uma escala de letras só serve se dois degraus vizinhos forem distinguíveis a olho nu.**
> A Aurea sobe **25% por degrau**, e o que uma tela mostra são **cinco** valores: 13 · 16 · 20 ·
> 25 · 31. Os dez NOMES continuam existindo, porque `size` é API pública dos dois alvos.

## O que estava errado, medido

O pé da escala tinha **quatro degraus em quatro pontos**:

| | valor | razão para o anterior |
|---|---|---|
| `xs` | 12 | — |
| `sm` | 13 | 1,083 |
| `md` | 14 | 1,077 |
| `base` | 16 | 1,143 |

Abaixo de ~1,15 dois tamanhos lado a lado não leem como **hierarquia**: leem como **erro**. E o
uso real amplificava isso — medido no pacote nativo, quantas vezes cada degrau aparece:

| degrau | usos | | degrau | usos |
|---|---|---|---|---|
| `sm` | **52** | | `xl` | 2 |
| `xs` | 12 | | `base` · `2xl` | 1 cada |
| `md` · `lg` | 8 cada | | `3xl` · `4xl` · `5xl` | **zero** |

Uma tela só — a de Início do consumidor — mostrava de 12 a 36 em **sete** tamanhos.

## A escala

| papel | antes | agora |
|---|---|---|
| legenda, apoio | 12 | **13** |
| texto corrido, controle | 13 e 14 | **16** |
| nome de cartão | 16 e 18 | **20** |
| título de tela | 20 e 24 | **25** |
| número em destaque | 30 | **31** |

**Nada encolheu.** É condição, não coincidência: o Victor tem **baixa visão**, e uma escala que
resolvesse a queixa encolhendo o corpo seria pior que o problema.

## As três coisas que esta decisão escolheu, e por quê

**1. Os dez nomes ficam, e alguns apontam para o mesmo número.** `sm`, `md` e `base` são 16;
`lg` e `xl` são 20. Parece desleixo e é o contrário: `size` é API pública nos dois alvos, e apagar
nome quebraria consumidor sem a pessoa ver nada de diferente na tela. **O que encolheu foi a lista
de VALORES**, que é o que se enxerga. Por consequência, **nenhum componente do pacote precisou
trocar de degrau** — os degraus é que se juntaram.

**2. O topo (36 e 48) não foi tocado.** A queixa é do pé da escala; lá em cima as razões já eram
1,2 e 1,33, que se distinguem. Mexer onde não há queixa é inventar trabalho.

**3. A web mudou junto, e isso não é efeito colateral: é a arquitetura.** O `aurea.tokens.json` é
o único lugar onde a escala existe, e o `@aurea-uds/core` sai dele. A regra fundadora do alvo
nativo é *"só os tokens atravessam"* — uma escala diferente por alvo quebraria exatamente a coisa
que o projeto existe para ser. ⚠ **E o mesmo defeito estava na web**: 12 · 13 · 14 · 16 são os
mesmos quatro degraus lá. Manter um alvo torto para poupar o outro não é conservador; é dois
sistemas com um nome só.

## O limite, declarado em vez de escondido

Com a letra do sistema em **1,3×**, o corpo de 16 vira ~21 e a linha ~29. Medido contra as alturas
de cápsula dos tokens:

| | letra normal | 1,3× | 1,5× |
|---|---|---|---|
| controle `md` e `lg` | cabe | cabe | cabe (menos `md` compacto) |
| controle `sm` | cabe | **estoura 1 ponto no compacto** | estoura 4 a 6 |

⚠ **Em 1,5× vários estouram — e isso já era verdade na escala antiga.** Não é regressão desta
decisão; é o teto que a altura de controle impõe, e ele fica nomeado aqui para a próxima pessoa
não ter de redescobrir.

## O que isto NÃO decide

Não decide que a altura de controle acompanhe a letra do sistema. Isso é outra conversa, mais
cara, e ela só vale a pena com um aparelho na mão em 1,5× — que este projeto não tem.
