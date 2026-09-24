# ADR-0014 — A primeira versão pública é `0.1.0`

- **Data:** 31/07/2026
- **Estado:** aceita e **publicada em 31/07/2026** — os seis pacotes estão no npm em `0.1.0`
- **Fecha:** a condição 3 da [ADR-0010](0010-distribuicao-npm-publico.md), que dizia
  "publicar exige decidir se o primeiro release público é 1.7.0 ou 0.x — decisão nova, ADR nova"
- **Autoria:** decisão do Victor em 31/07/2026, sobre recomendação do Opus

## Contexto

Os pacotes carregavam `1.7.0` desde sempre. O número é **herdado do kit de origem**: nunca
correspondeu a um release, nunca foi publicado em lugar nenhum, e nunca prometeu nada a
ninguém. Publicar com ele seria estrear com um histórico de seis versões que não existe.

E `1.x`, em semver, é uma promessa concreta: a API pública não quebra sem major. Duas coisas
medidas dizem que a biblioteca ainda não sustenta essa promessa:

- **O achado M8 segue aberto:** `props` publicadas existem numa minoria das fichas. Prometer
  estabilidade de API para componentes cujo contrato de API ainda não está publicado é
  prometer sobre uma coisa que ninguém consegue conferir.
- **A API pública mudou na Fase 9**, semanas atrás — pacote dividido em subpaths, três
  componentes fora do barril, `peerDependencies` de React de `>=18` para `>=19`. Uma superfície
  recém-reorganizada não teve tempo de provar que está certa contra consumo real.

## Alternativas

**A. Manter `1.7.0`.** Rejeitada. Além da promessa que a biblioteca não sustenta, o número
mente sobre a história: sugere seis versões anteriores que ninguém viu.

**B. `1.0.0`.** Rejeitada, e foi a alternativa séria. A favor: tudo é gateado, a API estabilizou
na Fase 9, e `0.x` perpétuo é uma desculpa que muitos projetos usam para nunca se comprometer.
Contra, e decisivo: `1.0.0` promete estabilidade de uma API cujo contrato ainda não está
publicado (M8). A disciplina de semver só vale se a superfície que ela protege for legível.

**C. `0.17.0`, preservando o `.7` do kit.** Rejeitada. Continuidade decorativa com uma
numeração que não significava nada, ao custo de sugerir dezesseis releases anteriores.

**D. `0.1.0`.** Escolhida.

## Decisão

O primeiro release público de **todos os seis pacotes** é `0.1.0`, e eles versionam **juntos**,
como já faziam.

O que `0.x` significa aqui, dito por extenso para não virar desculpa:

- **Pode quebrar em minor**, e quebra vem com nota no changelog — `0.x` não é licença para
  quebrar em silêncio.
- **A saída de `0.x` tem condição escrita:** `1.0.0` quando o M8 fechar (contrato de `props`
  publicado e batendo com o TypeScript) e houver pelo menos um consumidor real instalando do
  npm. Enquanto essas duas não acontecerem, a biblioteca continua em `0.x` — e isso é um
  compromisso, não um adiamento.

## Como isso é obrigado

O número vive nos sete `package.json` e no `aurea.contract.json`, e o `manifest.json` (gerado,
check 20) o repete a partir deles — então divergir entre pacotes reprova. A página de docs
manual também foi corrigida: ela declarava `1.7.0` em dois lugares escritos à mão, que é o
achado **I1** em miniatura.

> **Correção de 13/08/2026 — esta seção afirmava um gate que não existia.** "Divergir entre
> pacotes reprova" era falso quando foi escrito: o check 31 lia apenas
> `packages/react/package.json`, e cinco pacotes podiam ficar atrás com todos os gates verdes.
> O **check 32** passou a cobrar os oito arquivos e só agora a frase acima é verdade. O texto
> original fica como está — a dívida é o registro. É o mesmo defeito do A12 e do AUD-0001
> (comentário passando por código), desta vez dentro de uma ADR.

## Consequências

**Boas:** a versão passa a dizer a verdade sobre a maturidade; quem adotar sabe o que está
adotando; e a promessa de `1.0.0` fica guardada para quando houver o que prometer.

**Custos, declarados:**

- **`0.x` assusta parte de quem avalia biblioteca**, e não há como argumentar contra isso a não
  ser fechando o M8.
- **Em semver, `^0.1.0` só aceita `0.1.x`** — quem depender assim não recebe `0.2.0`
  automaticamente. É o comportamento correto para `0.x` e é bom que seja, mas surpreende.
- **A numeração antiga fica no histórico do git** como `1.7.0`, sem release correspondente.

**Revisão:** ao fechar o M8, com consumidor real instalando do npm.
