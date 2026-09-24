# ADR-0009 — Construir tudo na Aurea e travar depois (modelo push)

- **Data:** 26/07/2026 (decisão) · registrada como ADR em 30/07/2026 (Fase 10, achado M19)
- **Estado:** aceita, com uma condição por cumprir
- **Decidiu:** Victor, contra a minha recomendação da época

## Contexto

A `DIRECTION.md` mapeia ~24 macroáreas e mais de mil nomes possíveis. A regra escrita até então
era **pull**: componente nasce quando um consumidor real precisa dele (YAGNI). O Victor decidiu o
contrário para o momento atual do projeto.

## Alternativas

**A. Pull — construir sob demanda real.** Era a regra anterior, e a minha recomendação: evita
construir o que ninguém vai usar, e é o que o `AUREA.md` §4 (Balde C) ainda diz para as
extensões.

**B. Push — construir tudo que os projetos atuais pedem e depois travar.** Escolhida pelo Victor,
e reafirmada. O raciocínio dele: os projetos dele vão consumir a Aurea, e ter a peça pronta
quando a hora chegar vale mais do que a economia de não a construir.

## Decisão

Construir na Aurea tudo o que os projetos atuais pedem, e **depois travar**: a partir da trava,
componente novo nasce na Aurea, não no projeto que precisou dele.

## A condição que ainda não foi cumprida

**A trava precisa de válvula de escape documentada.** Sem um caminho explícito para "preciso disto
hoje, em produção, e a Aurea não tem", a primeira urgência mata a regra — e o componente nasce no
projeto, que é exatamente o que a trava existe para impedir. Escrever essa válvula (quem decide,
em quanto tempo, como volta para a Aurea depois) é tarefa aberta.

## Consequências

**Boas:** o consumidor encontra a peça pronta; a identidade não se fragmenta em cinco projetos.

**Custos, declarados:** constrói-se o que talvez não seja usado, e a peça sem uso real não tem
quem a corrija — é o mesmo mecanismo que produziu os 63 tokens sem uso (achado M2). O
**inventário de demanda real** (o que os projetos do Victor de fato pedem) é a peça crítica que
falta para essa conta fechar, e o próprio Victor colocou-a depois de publicar na ordem.

**Revisão:** quando o inventário existir. Se ele mostrar que a maior parte do que foi construído
por push não é usada, a regra volta para pull sem drama.
