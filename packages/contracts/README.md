# @aurea-uds/contracts

O contrato do projeto **Aurea UDS**, em JSON legível por máquina.

```bash
pnpm add @aurea-uds/contracts
```

```js
import contract from "@aurea-uds/contracts/contract" with {type: "json"};
```

Ele diz o que o design system promete — identidade, o vocabulário do catálogo, as listas de
valores contra as quais as fichas dos componentes são conferidas — numa forma que uma ferramenta
lê, em vez de um parágrafo que uma pessoa tem de interpretar.

## A superfície da API

```js
import surface from "@aurea-uds/contracts/api-surface" with {type: "json"};
```

Todo componente que o `@aurea-uds/react` exporta, com as props e — quando o tipo é uma união de
textos fixos — os valores que cada prop aceita. Ela é **derivada**, não escrita: o build lê as
declarações que o compilador do TypeScript gera, então herança, `Omit`, `Pick` e apelidos em
cadeia são resolvidos pelo compilador, e não por palpite. Editá-la à mão é justamente o defeito
que ela existe para evitar.

É ela que deixa uma ferramenta responder "que variantes este componente aceita?" sem ler o nosso
código nem confiar na nossa prosa — e é contra ela que o validador confere as fichas de cada
componente, para as duas não divergirem.

## O que não está aqui

As fichas de cada componente moram no repositório, não neste pacote. Elas geram o catálogo e
deixam o validador conferir a biblioteca contra ela mesma; nada fora do build as usa. Se você
precisar delas, abra uma issue pedindo, e elas ganham uma entrada. A superfície da API acima é a
parte dessa resposta de que uma ferramenta precisa, e é por isso que ela vai no pacote.

## Licença

Apache-2.0.
