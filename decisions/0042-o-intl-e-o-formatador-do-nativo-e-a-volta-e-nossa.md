# ADR-0042 — No nativo o formatador é o `Intl` do aparelho, e a VOLTA é nossa

- **Data:** 11/09/2026
- **Estado:** aceita e **EXECUTADA** — `NumberField`, `formatarNumero`, `lerNumero` e `separadoresDoLocale`, publicados no npm na `0.8.0` (12/09/2026).
  ✅ **E ela foi PROVADA EM APARELHO em 12/09/2026**, Android 13, no modo `lote7` do
  `apps/native-smoke/`. ⚠ **No iOS não** — nenhum aparelho deste projeto rodou iOS, em lote
  nenhum (`NATIVE.md` §8.6 e §8.7).
- **Confirma:** a [ADR-0024](0024-mascara-de-campo-e-o-momento-nao-o-formato.md) — não a substitui
- **Fecha:** a lacuna 2 do Lote 7 (`NATIVE.md` §8), medida pelo consumidor
- **Autoria:** medição do Opus, sob autorização do Victor em 11/09/2026

## Contexto

O consumidor mediu três lacunas no alvo nativo. A segunda: *"O `Input` nativo tem `keyboardType`
e nada mais. A demanda é moeda, medida decimal e contador acumulado — os três aparecem em toda
tela de lançamento."*

Conferido no código: verdade. O `inputs.tsx:232-235` expõe `keyboardType` e o próprio comentário
cita a demanda — mas teclado é a metade fácil. O formato não existia.

A pergunta que veio junto era: *"se a mesma decisão vale, já que lá não há blur equivalente
garantido"*.

## A pergunta estava errada, e isso importa mais que a resposta

**Há blur no React Native, e ele já estava ligado.** O `TextInput` tem `onBlur` e `onFocus`; o
`Input` do Lote 4 declara os dois (`inputs.tsx:239-240`) e os liga (`inputs.tsx:278-279`). O
evento dispara ao perder foco, ao fechar o teclado e ao sair da tela.

Registrar isto é o ponto da regra do topo do `CLAUDE.md`: a dúvida também vale para o defeito que
se acha que se achou. O risco real da ADR-0024 no nativo **é outro**, e só apareceu quando a
premissa errada saiu da frente.

## O risco de verdade: quem chama o `Intl`, e quem volta

Na web, `NumberFieldRoot` do `@base-ui/react` recebe `format`/`locale` e faz **as duas pontas**:
chama o `Intl` na ida e **lê o texto de volta** na volta. A ADR-0024 pôde dizer *"quem formata é o
`Intl` da plataforma; a Aurea não escreve formatador de dinheiro"* porque havia um motor entre os
dois.

**Não há Base UI no alvo nativo** (ADR-0037: `StyleSheet` puro, a camada de tema é nossa). Então a
ida passa a ser uma chamada nossa — e a **volta**, que ninguém escreveu na web, passa a existir:
converter `R$ 1.234,50` em `1234.5` exige saber qual caractere é o separador decimal **daquele
locale**.

## O que foi medido (11/09/2026)

| Fonte | O que ela diz |
|---|---|
| `doc/IntlAPIs.md` do **próprio motor** | `Intl.NumberFormat` com `format` e `resolvedOptions` existe **nos dois sistemas**; a implementação delega à plataforma (ICU no Android, `NSFormatter` no iOS). Moeda e decimal — que é a demanda — estão cobertos |
| o mesmo documento | **`formatToParts` é só Android.** É o caminho óbvio para descobrir os separadores, e ele não serve |
| o mesmo documento | o resultado **varia com a versão do Android**, porque varia o ICU do aparelho. É o preço declarado de não embutir ICU no bundle |
| motor#768, motor#1035 | `notation: "compact"` **quebrado**, para número e para moeda |
| motor#789 | `signDisplay: "always"` com moeda **some com o símbolo nos positivos**, no Android |
| motor#1418 | `format()` **não lê string como decimal** |

## Alternativas rejeitadas

**Um polyfill (`@formatjs/intl-numberformat`).** Rejeitada duas vezes: é dependência nova, que
pelo `BUILDING.md` §3.3 interrompe o lote e exige o Victor — e resolve um problema que a medição
diz não existir, já que o `Intl` cobre moeda e decimal nos dois sistemas. O peso do polyfill de
locale é da ordem do pacote inteiro de ícones.

**Escrever o formatador à mão** (símbolo, agrupamento e casas por tabela nossa). Rejeitada pela
mesma razão que a ADR-0024 recusou trazer os formatos de país: é conhecimento de **domínio**, não
de design system, e uma tabela de moedas dentro de uma biblioteca de interface envelhece sem
ninguém perceber. E erraria o que o `Intl` acerta de graça: o espaço estreito do francês, a
posição do símbolo em cada locale, o `minimumFractionDigits` de cada moeda.

**Uma tabela de separadores por locale**, para a volta. Rejeitada: é a mesma tabela envelhecendo,
em escala menor. O separador de milhar do francês é U+202F, e é exatamente o detalhe que uma
tabela escrita à mão erra.

**Aceitar `notation: "compact"` e deixar o defeito passar.** Rejeitada: um `1,2 mi` errado numa
tela de lançamento é pior que `1.234.567`, porque **parece certo**. É a mesma classe do defeito
de fonte que o `tokens.ts` documenta — não levanta e não some.

## Decisão

1. **A ADR-0024 atravessa inteira.** Formatar no **blur**, nunca enquanto se digita. As três
   medições que a sustentam (USWDS, MUI, prática de acessibilidade) são sobre comportamento
   humano, não sobre plataforma — e não há evidência nova que as reabra.
2. **A ida é o `Intl.NumberFormat` do aparelho**, com as mesmas props da web (`format`, `locale`)
   e o mesmo tipo (`Intl.NumberFormatOptions`). A Aurea não escreve formatador de moeda, aqui
   também não.
3. **A volta é nossa, e é `lerNumero`.** Ela deriva os separadores do locale **formatando um
   número-sonda** (`12345.6`) e lendo o primeiro e o último não-dígito da saída — porque
   `formatToParts`, que resolveria direto, não existe no iOS.
4. **`notation: "compact"` é recusado**: aviso em `__DEV__`, opção removida em produção, o resto
   do formato preservado.
5. **Sem `Intl`, a queda é o número cru com o separador do locale** — nunca uma moeda montada à
   mão. Uma moeda errada é pior que uma não formatada.
6. **O que sai por `onValueChange` é `number`, sempre.** É a tradução da trava da ADR-0024 ("o
   formulário envia `1234.5`, nunca `R$ 1.234,50`"): lá o motor renderiza um input escondido com o
   valor cru; aqui não há formulário nativo para esconder nada, então **o contrato é a assinatura
   da função**.
7. `formatarNumero`, `lerNumero` e `separadoresDoLocale` são **públicos**: o app tem o mesmo
   problema fora do campo — num resumo, num total, numa lista.

## Como isto é obrigado

Onze testes em `tests/unit/native-lote7.test.tsx`, nos blocos *"o formatador e a volta"*,
*"NumberField — formata no blur, e SÓ no blur"* e *"o teclado e a recusa medida"*.

**Três deles foram provados CONTRA o defeito**, e não só contra o estado atual:

- trocar a exibição para formatar ao vivo faz o campo mostrar `R$ 1.234,50` onde o teste exige
  `1234,5` — é literalmente o defeito que o MUI filmou, reprovando;
- emitir a string formatada em vez do número reprova a trava do item 6;
- tirar a limpeza do estado de edição no blur reprova o item 1.

## Consequências, com o custo

- **O resultado varia com a versão do Android**, porque varia o ICU do aparelho. É herdado do
  motor e não há como não herdar sem embutir ICU. Declarado no topo do `numero.tsx`.
- **`notation: "compact"` não funciona**, e quem o pedir descobre por um aviso e não por um número
  errado. Volta quando o motor fechar motor#768.
- **A sonda de separadores é uma chamada a mais por locale**, memoizada. Custo medido: uma
  formatação de `12345.6` na primeira vez, nada depois.
- Em troca: **nenhuma dependência nova**, e moeda, medida e contador entregues pelo `Intl` da
  plataforma — que é o que a ADR-0024 já tinha escolhido para a web.

## Quando se revisa

Se o motor fechar motor#768 (compact) ou motor#1418 (string como decimal), os itens 4 e o
cuidado do item 2 mudam. Se algum dia entrar um motor de formulário no alvo nativo, os itens 3 e 6
voltam à mesa — mas aí é outra ADR, sobre o motor.
