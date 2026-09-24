# Atividade 2 — o inventário das seis plataformas, e a cópia em massa

> 🔴 ~~**Documento de ENTRADA para a sessão que vai executar isto. Nada aqui foi começado.**~~
> **ELA JÁ RODOU.** O inventário das seis plataformas está em
> [`audit/activity-2/`](../../audit/activity-2/README.md) — **69 arquivos**, medidos.
>
> **Este cabeçalho ficou falso por semanas**, e a contradição já estava registrada no `CLAUDE.md`
> item 10 desde 31/08/2026: lá diz *"ELA JÁ RODOU"*, aqui dizia *"nada foi começado"*. **Duas
> ordens opostas em dois arquivos** — corrigi o que descobri e não desci até o irmão, que é o
> defeito que o `NATIVE.md` §7 nomeia. Corrigido em 14/09/2026, aplicando a regra escrita no mesmo
> dia: *quem fecha um lote passa o olho no CABEÇALHO dos documentos irmãos.*
>
> **O que este documento vale hoje:** registro do MÉTODO — as travas que ele estabeleceu (licença
> primeiro, aparência sempre a nossa). **Não é fila.** A fila mora no `COMECE AQUI` do
> `CLAUDE.md`, e em nenhum outro lugar.
>
> Ordem do Victor em 20/08/2026, no fim da sessão que publicou a `0.4.0` e a `0.5.0`.

## 1. O que ele pediu, nas palavras dele

> *"segunda atividade e a mais tensa, voce vai sugar tudo dessa plataforma cada milimetro de
> componente variacoes exemplos e da nossa pasta de referencia, vai listar tudo que não temos e
> vamos copiar codigo em massa, vamos fazer mudanças sutis apenas."*

E, quando eu levantei o conflito com a identidade:

> *"Não aparência sempre vai ser a nossa. o que quero são novos componente e variações exemplos"*

**A segunda frase resolve a primeira.** "Mudanças sutis" **não** significa manter a pele deles.
Significa: a estrutura vem pronta, a aparência é sempre a da Aurea. O que ele quer é **cobertura** —
componentes, variações e exemplos que não temos.

## 2. As seis fontes

| Fonte | Site | Código |
|---|---|---|
| Untitled UI | https://www.untitledui.com/ | https://github.com/untitleduico/react |
| HeroUI | https://heroui.com/ | https://github.com/heroui-inc/heroui |
| 21st.dev | https://21st.dev/community/components | (comunidade, sem repositório único) |
| MUI | https://mui.com/ | https://github.com/mui |
| ReUI | https://reui.io/ | — |
| shadcn/ui | https://ui.shadcn.com/docs/components | https://github.com/shadcn-ui/ui |

**Mais a pasta local [`Referencia/`](../../Referencia/)**, que já tem 21 projetos baixados e cujas
licenças estão na tabela do [`BUILDING.md`](../BUILDING.md) §2. Ele disse "e da nossa pasta de
referência" — ela entra no mesmo inventário.

## 3. As travas, e por que nenhuma delas é opinião minha

**LICENÇA, fonte por fonte, ANTES de copiar uma linha.** É a única parte que não é escolha do
Victor: o `CLAUDE.md` diz que a licença manda em cima da ordem dele. Do que já se sabe:

- `agents-kit-main` — **não-comercial**, não entra numa base Apache-2.0.
- `openstatus-main` — **AGPL-3.0**, não entra.
- `heroui-3` — Apache-2.0, entra com aviso de copyright preservado.
- As MIT entram com crédito.
- **As seis de fora ainda NÃO foram conferidas.** Untitled UI, ReUI e 21st.dev são as que mais
  precisam de leitura: a última é submissão de comunidade, então a licença pode variar **por
  componente**. Pesquisar, não supor.

**APARÊNCIA É SEMPRE A DA AUREA.** Raio 22px em card, pílula em controle, amarelo
`oklch(0.795 0.184 86.047)`, IBM Plex, Carbon Icons, sem gradiente. O `CLAUDE.md` proíbe
Material/Fluent/Bootstrap/shadcn **como aparência** — e MUI e shadcn estão na lista de fontes. Copia-se
**anatomia, geometria, estados e teclado**; a pele passa pelos nossos tokens.

**O procedimento continua sendo o do [`BUILDING.md`](../BUILDING.md) §2**, e ele não é burocracia:
medir o nosso primeiro, consultar o componente nas referências, separar o que serve, pesquisar o
que não veio de lugar nenhum, escopo menor que o deles, construir na receita do `MAP.md`,
registrar no `REFERENCES.md` com a licença verificada.

**Componente novo entra com prévia que RODA** — critério 12b do [`QUALITY.md`](../QUALITY.md), ordem
dele: *"quero ver eles dinamicos, nada de coisa estatico pois eu não sei se funciona de verdade e
não confio em sua palavra"*. Prévia estática não conta como prévia.

**Entrega visual sai com print, e pergunta vira imagem A/B.** Ele decide olhando.

## 4. Onde estamos hoje, para o inventário não recontar

Medido em 20/08/2026 e regravado pelo `validate.py` (nunca escrever à mão — ver `STATE.md`):

- **109 componentes** exportados por `@aurea-uds/react`, **106 fichas** de registry.
- **71 patterns**, **15 blocks**, **23 recipes**, **4 hooks** publicados.
- **454 classes** no CSS do core, **381 declarações** de token.
- Publicado no npm: **0.5.0**, os seis pacotes.

A lista canônica de componentes está em `packages/contracts/registry/*.json` e no `manifest.json`
— os dois são gerados/gateados. **O inventário compara contra eles, não contra memória.**

## 5. A primeira ação concreta

1. Conferir a **licença** das seis fontes de fora. Registrar num quadro, no `REFERENCES.md`, antes
   de abrir código de qualquer uma.
2. Levantar a lista de componentes **de cada fonte** (o índice de documentação de cada site serve;
   para as que têm repositório, o diretório de componentes é a fonte melhor).
3. Cruzar com as 106 fichas nossas e produzir **o que não temos**, agrupado por categoria da
   `DIRECTION.md`, com a licença da fonte ao lado de cada item.
4. Levar essa lista ao Victor. **A ordem de construção é escolha dele** — o `PLANO-1.0.md` §5 do
   `BUILDING.md` (a tabela de lotes) está suspenso pela [ADR-0015](../../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md),
   e a autorização hoje é por parte.

## 6. O que NÃO fazer

- Não começar a copiar antes do passo 1. Licença primeiro.
- Não trazer a paleta, a tipografia, o raio ou a pilha de ninguém.
- Não inventar medida quando a fonte não der: **pesquisar o padrão** (Material 3, HIG da Apple,
  APG) e citar. Ordem dele em 20/08: *"vá pesquisar e descubra qual padrão é usado, pesquise não
  invente medidas"*.
- Não declarar componente pronto sem prévia que responde a clique.
