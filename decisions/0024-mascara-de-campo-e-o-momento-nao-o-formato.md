# ADR-0024 — Máscara de campo: a Aurea entrega o MOMENTO, não o formato

- **Data:** 15/08/2026
- **Estado:** aceita
- **Fecha:** o item **L6** do [`PLANO-1.0.md`](../docs/PLANO-1.0.md) §16
- **Autoria:** pesquisa e medição do Opus, sob a autorização da Parte L

## Contexto

O item L6 pediu **máscara no campo — moeda, placa, documento** —, e a origem é medida: um
consumidor real carrega uma biblioteca de moeda só para formatar dinheiro num input.

Esta ADR existe porque o resultado é um **não** — não nasceu componente de máscara — e um não sem
registro é uma lacuna que a próxima sessão preenche por engano. O mercado tem o componente; até um
design system de governo tem. Quem chegar aqui sem esta página vai achar que faltou.

## O que a pesquisa devolveu (15/08/2026)

Três medições independentes, todas contra **mascarar enquanto se digita**:

| Fonte | O que ela diz |
|---|---|
| **USWDS** — o design system do governo americano | publica o `Input mask` **com reprovação registrada em WCAG 2.1 AA**: *"recovering from an error is difficult due to lack of feedback"*. Não é que ninguém tenha feito: é que quem fez publicou o defeito junto |
| **MUI** — a referência que o próprio item mandava ler | **abandonou** máscara nos campos de data na v6, e escreveu o motivo: o texto *"leaks to the previous sections"* ao editar o meio do valor. Há um vídeo no repositório deles chamado `masked-input-bad-ux.mp4` |
| prática corrente de acessibilidade | máscara ao vivo **descasa** o que o leitor de tela ANUNCIA (o que foi digitado) do que o campo MOSTRA (o que a máscara deixou passar). A recomendação é deixar digitar e colar à vontade e formatar **depois que o foco sai** |

E o passo 1 achou metade do item **já paga e desligada**: o comentário do `NumberField`, escrito no
Lote 1, dizia que o motor formata por locale. Medido agora no `@base-ui/react@1.6.0`, o
`NumberFieldRoot` aceita `format?: Intl.NumberFormatOptions` e `locale?` — e **formata no blur**,
que é exatamente o momento que a pesquisa recomenda. A nossa casca simplesmente não repassava.

## Alternativas rejeitadas

**Um componente `MaskedInput`, com padrão de máscara (`###-####`, `AAA-0A00`).** Rejeitada pelas
três medições acima. O que se entregaria é o defeito documentado de outra pessoa, com a nossa marca.

**Embrulhar uma biblioteca de máscara (`react-imask`, `react-number-format`).** Rejeitada duas
vezes: é dependência nova, que pelo `BUILDING.md` §3.3 interrompe o lote e exige o Victor — e o
que ela entrega é justamente o comportamento que a pesquisa desaconselha.

**Trazer os formatos de país para a biblioteca** (CPF, CNPJ, placa Mercosul, telefone). Rejeitada:
é conhecimento de **domínio**, não de design system. A Aurea não sabe o que é um documento válido
em lugar nenhum, e uma tabela de formatos por país dentro de uma biblioteca de interface envelhece
sem ninguém perceber.

**Pintar a máscara por cima do campo** (sobreposição, `::after`, atributo de dado). Rejeitada, e é
a razão da trava do item: o valor mascarado tem de **continuar no DOM**. Máscara é apresentação —
o que a pessoa vê tem de ser o que o formulário envia e o que a tecnologia assistiva lê.

## Decisão

1. **Não existe componente de máscara na Aurea**, e não é lacuna: é decisão.
2. **Moeda, porcentagem e unidade** saem do `NumberField`, que passa a repassar `format`, `locale`
   e `name` ao motor. Quem formata é o `Intl` da plataforma, no blur. Isso substitui a biblioteca
   de moeda que o consumidor carregava.
3. **Placa, documento e telefone** saem do `Input.formatOnBlur`: a Aurea entrega o **momento** —
   normalizar quando o foco sai, nunca enquanto se digita — e o **formato fica com o consumidor**.
4. **O valor formatado é o `value` do elemento**, dos dois lados. No número, o `name` faz o motor
   renderizar o input escondido com o valor CRU: o formulário envia `1234.5`, nunca `R$ 1.234,50`.

## Como isto é obrigado

Cinco testes em `tests/unit/components.test.tsx`, no bloco *"máscara no campo"*. Dois deles são a
trava escrita como teste: um afirma que, depois de formatar, **não existe nó com o texto formatado
fora do campo** — quem pintasse a máscara por cima passaria numa inspeção visual e reprova ali; o
outro lê o input escondido do `NumberField` e cobra o número cru.

Há também um teste que afirma que **digitar não é interrompido**: o campo mostra exatamente o que
foi digitado até o foco sair. É o defeito da máscara ao vivo escrito como asserção.

## Consequências, com o custo

- **Um consumidor que espera máscara ao vivo não a tem, e vai estranhar.** É o custo declarado
  desta decisão, e a ficha do `Input` explica o porquê no lugar em que ele vai procurar.
- **O formato continua sendo trabalho do consumidor.** Ele escreve `plate`, `cpf`, `phone` — a
  Aurea não os fornece e não vai fornecer.
- Em troca: nenhuma dependência nova, e o comportamento que a pesquisa endossa.

## Quando se revisa

Se aparecer **medição** — não impressão — de que a formatação no blur atrapalha um caso real, ou
se o padrão de acessibilidade mudar de recomendação. A reprovação do USWDS e o abandono do MUI são
o estado de 2026; se qualquer um dos dois se reverter com evidência, esta página volta à mesa.
