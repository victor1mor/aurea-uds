# ADR-0021 — O publicador confiável fica adiado sem data; publicar segue manual com 2FA

- **Data:** 12/08/2026
- **Estado:** aceita
- **Emenda:** a [ADR-0013](0013-mecanica-de-publicacao-npm.md), cuja segunda metade — "configurado o
  trusted publisher, **todo publish seguinte sai da CI**" — fica **suspensa sem data**. A primeira
  metade continua valendo integralmente
- **Autoria:** recomendação do Opus em 12/08/2026, aceita pelo Victor no mesmo dia ("K2 é como você
  disse, não tem peso pra gente")

## Contexto

O item **K2** do [`PLANO-1.0.md`](../docs/PLANO-1.0.md) — configurar o publicador confiável (OIDC) nos
seis pacotes — estava aberto desde 31/07/2026 como "a metade que falta da ADR-0013". Ele nunca foi
questionado; só ficou esperando a CI voltar.

**A evidência nova é de execução, e ela apareceu ao publicar a `0.2.0`:**

| Fato medido | Onde |
|---|---|
| O projeto publicou **duas vezes** à mão, com 2FA | `0.1.0` em 31/07/2026, `0.2.0` em 12/08/2026 |
| Cada publish custou **minutos**, não horas | os seis pacotes numa linha de comando |
| A CI está **parada por cobrança** desde 07/08/2026 e a `0.2.0` saiu sem ela | `04-PROTOCOLO-IA.md` §2 |
| A cadência real de publicação é de **duas versões em doze dias**, e a próxima não tem data | K4 espera consumidor real |

**A ADR-0013 acertou o diagnóstico e considerou uma saída a menos.** Ela rejeitou o token de longa
duração pelas razões certas — segredo que vaza com o ambiente do runner, expira a cada 90 dias — e
concluiu que a saída era **automatizar melhor**, com OIDC. Existe uma segunda saída que ela não
listou: **não automatizar.** Um segredo que não existe não vaza, e uma automação que não existe não
se mantém.

**E o caminho manual é mais seguro, não menos.** Publicar com chave de segurança presente não dá a
nenhuma máquina, workflow ou runner o direito de publicar no nome do Victor. O trusted publishing é
a melhor forma de dar esse direito — mas não dar é melhor que dar bem.

**O prazo do npm não muda isto, e é importante dizer por quê**, porque foi a pergunta do Victor: os
tokens que pulam 2FA perderam gestão de conta e pacote em 31/07/2026 e perdem publicação direta em
≈01/2027 ([changelog do GitHub](https://github.blog/changelog/2026-07-31-restricting-npm-bypass-2fa-granular-access-tokens/)).
Isso ameaça a **alternativa B**, que a ADR-0013 já havia rejeitado. O publish interativo com 2FA não
tem prazo nenhum.

## Alternativas

**A. Configurar o trusted publisher agora.** Rejeitada por duas razões independentes. Depende da CI,
bloqueada por cobrança até ≈01/09/2026 — então "agora" não existe. E resolve um custo que ninguém
está pagando: dois publishes em doze dias, de minutos cada.

**B. Token de longa duração nos segredos do repositório.** Rejeitada, e a rejeição envelheceu bem: a
ADR-0013 a recusou por segurança, e o npm a está desligando por conta própria até ≈01/2027.

**C. Marcar o K2 como feito e seguir.** Rejeitada. No `PLANO-1.0.md` **o checkbox é o estado**, e
marcar o que não foi feito é a mentira que a próxima sessão herda.

**D. Adiar sem data, publicar à mão.** Escolhida.

## Decisão

**O K2 fica aberto e sem data.** Não é dívida a pagar: é item que espera um **motivo**, e o motivo
não é o calendário.

**Publicar segue sendo ato manual do Victor, com 2FA**, pela ADR-0013 §1 — inclusive a forma do
PowerShell, que foi corrigida lá em 12/08/2026 depois de o comando documentado falhar no parser.

**A `1.0` não depende do K2.** Já estava escrito na ADR-0013 ("não bloqueia") e agora está medido
duas vezes: as duas versões publicadas saíram sem publicador confiável.

**O gatilho de revisão é FREQUÊNCIA ou MÃOS, não data.** Automatizar volta a valer quando um destes
acontecer:

1. a cadência passar de aproximadamente **um publish por mês**, quando a repetição começa a custar
   mais que a configuração; ou
2. a Aurea ganhar **mais de um mantenedor** com direito de publicar — a partir daí o caminho manual
   deixa de ser "uma pessoa com uma chave" e passa a ser combinação frágil; ou
3. a CI voltar **e** existir outra razão da lista acima. Só a CI voltar não é razão.

## Consequências

**Boas:**

- **Nada a manter.** Sem workflow de publicação, sem segredo, sem rotação, sem renovação trimestral.
- **Nenhuma máquina publica em nome do Victor.** É a propriedade de segurança mais forte disponível,
  e ela vem de graça de não fazer nada.
- **Imune ao prazo de ≈01/2027**, que atinge token e não pessoa.
- **O item para de parecer bloqueio.** Ele estava no topo da Parte K dando a impressão de que a
  `1.0` esperava por ele.

**Custos, declarados:**

- **Cada publish custa a presença do Victor** e **seis** confirmações de 2FA, uma por pacote.
- **Sem provenance.** Já era verdade por o repositório ser privado (ADR-0013), então esta decisão
  não acrescenta o custo — mas também não abre caminho para removê-lo.
- **Bus factor 1.** Se o Victor estiver indisponível, ninguém publica. É consequência aceita, não
  descuido: hoje ele é o único mantenedor, então automatizar não mudaria o número.
- **A `0.2.0` e as próximas saem sem a garantia de que a CI passou** — que é a razão pela qual a
  ADR-0013 rejeitou o publish manual como *destino*. Mitigado, e não resolvido: os gates rodam na
  máquina antes do publish (foi assim na `0.2.0`, com a árvore limpa e o commit feito antes), e
  desde 12/08 existe o `scripts/check-published.mjs`, que confere o pacote **depois** de publicado
  instalando-o do registro num projeto limpo.

**Revisão:** ao acontecer um dos três gatilhos acima. Não por data.
