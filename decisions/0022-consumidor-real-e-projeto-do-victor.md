# ADR-0022 — "Consumidor real" é projeto do Victor, desde que instale do npm

- **Data:** 13/08/2026
- **Estado:** aceita e **CUMPRIDA** — o consumo real aconteceu, e ele passou a MANDAR NA FILA.
  Em 11/09/2026 o app nativo mediu **três lacunas** na primeira tela que a pessoa toca, o Victor
  autorizou fechá-las, e o resultado foi o **Lote 7** (`NATIVE.md` §8) — cinco componentes que
  **nenhum documento deste repositório tinha previsto**.
  ⚠ *A linha dizia* **"aguardando o primeiro consumo real"** *até 14/09/2026.* **É a ADR mais
  desatualizada que a varredura achou**, porque o que ela aguardava não só chegou: virou a fonte
  da fila.
- **Emenda:** a condição de saída de `0.x` da [ADR-0014](0014-primeira-versao-publica-0-1-0.md)
- **Destrava:** o item **K4** do [`PLANO-1.0.md`](../docs/PLANO-1.0.md)
- **Autoria:** decisão do Victor em 13/08/2026, sobre recomendação do Opus

## Contexto

A ADR-0014 condicionou a `1.0` a duas coisas: fechar o M8 — feito na Parte E — e ter
**consumidor real instalando do npm**. A segunda ficou aberta, e o K4 registrou por quê: um app
escrito por nós só para satisfazer a condição é "a condição corrigindo a própria prova".

O que faltava não era código. Era saber se **projeto do próprio Victor** conta.

A resposta veio dele em 13/08/2026, e muda a leitura da condição: *"a Aurea foi criada
excepcionalmente para mim mesmo, para meus projetos pessoais"*.

Isso não é detalhe biográfico. É o propósito da biblioteca. A Aurea nunca foi feita para um
mercado anônimo — [ADR-0009](0009-modelo-push-e-travar-depois.md) (modelo push) e
[ADR-0015](0015-cobertura-antes-da-demanda-ate-a-1-0.md) (cobertura antes da demanda) já
descreviam uma biblioteca construída inteira **antes** de alguém pedir, para os projetos dele.

## Alternativas

**A. Exigir consumidor de TERCEIRO.** Rejeitada. Amarraria a `1.0` a um evento que não depende
de nenhum trabalho neste repositório e que pode nunca acontecer. Pior: a biblioteca ficaria
perpetuamente em `0.x` justamente por ter sido bem-sucedida no que se propôs — servir aos
projetos dele. A ADR-0014 escreveu "consumidor real" para barrar prova falsa, não para exigir
estranho.

**B. Aceitar qualquer app nosso, inclusive um escrito para a ocasião.** Rejeitada, e é o medo
literal do K4. Um app-fantoche mede o app, não a biblioteca.

**C. Aceitar projeto do Victor que existiria de qualquer jeito, instalando do npm.** Escolhida.

## Decisão

**Projeto do Victor conta como consumidor real**, e o K4 fecha quando um deles estiver usando
a Aurea em produção. Com duas travas, que é o que separa esta opção da B:

1. **O projeto tem de existir por si.** Precisa ter razão de ser independente da Aurea, e
   precisaria de interface mesmo que a Aurea não existisse. Um projeto criado para marcar este
   checkbox não serve, e reconhecer isso é responsabilidade de quem for fechar o item.

2. **A instalação é do REGISTRO, nunca do disco.** `npm install @aurea-uds/react` e nada de
   `file:`, `link:`, `workspace:`, caminho relativo ou apontar para `C:\dev\aurea-uds`. É esta trava
   que carrega a prova: o que resolve pelo registro público prova que um estranho conseguiria
   usar; o que resolve por caminho local não prova nada. Foi exatamente a classe de defeito que
   deixou a `0.1.0` inutilizável por doze dias
   ([ADR-0020](0020-a-proxima-versao-e-0-2-0-nao-1-0.md)).

Foi o próprio Victor quem pôs a segunda trava, no mesmo dia: *"nenhum dos meus projetos devem
consumir ela diretamente da minha máquina e sim do npm"*.

## Como isso é obrigado

Nesta data, por documento nos consumidores, não por gate neste repositório — e a distinção está
escrita de propósito, porque este repositório já pagou caro por chamar de gate o que era
comentário (ver a nota de correção na ADR-0014).

Em 13/08/2026 a lei entrou nos **cinco projetos do Victor**, em `AGENTS.md` e `CLAUDE.md` de cada
um. Os caminhos não são escritos aqui de propósito: nome de projeto privado dele não entra neste
repositório, e a trava de nomes privados do `scripts/validate.py` reprovou a primeira versão desta
ADR justamente por isso. A lei proíbe consumo por caminho local e manda **parar o projeto** quando
faltar componente, em vez de improvisar substituto.

O que JÁ é gate, e mede outra coisa, é o `scripts/check-published.mjs`: ele instala **do
registro** num projeto limpo fora do repositório e constrói nos dois lados da fronteira. Prova
**instalabilidade**, não consumo real. Os dois juntos cobrem a condição; nenhum sozinho.

## Consequências

**Boas:** a `1.0` volta a depender de trabalho que existe e está planejado, em vez de um evento
externo. E a trava do npm transforma o consumo interno em prova de verdade — o projeto dele
instala como um estranho instalaria.

**Custos, declarados:**

- **Perde-se o sinal de mercado.** Consumidor de terceiro traria uma informação que consumidor
  interno não traz: que alguém de fora achou, entendeu e adotou. A `1.0` não vai carregar esse
  sinal, e isso é aceito.
- **A trava 1 depende de julgamento.** "Existiria de qualquer jeito" não é mecânico. Fica
  registrado que a intenção é barrar app-fantoche, não fazer advocacia.
- **Consumir do npm custa um ciclo de publish.** Componente que falta no consumidor não se
  resolve editando `C:\dev\aurea-uds` e recarregando: constrói na Aurea, publica, atualiza a
  dependência. É lento de propósito — é o que impede o design system de virar pasta compartilhada.

## Condição de revisão

Se aparecer consumidor de terceiro antes da `1.0`, ele passa a valer e esta ADR vira redundante,
não errada. Se o Victor decidir que a `1.0` precisa do sinal de mercado, esta ADR é revogada e a
ADR-0014 volta ao texto original.
