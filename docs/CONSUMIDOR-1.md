# O que o primeiro consumidor precisa da Aurea — inventário medido

- **Data:** 16/08/2026 · **generalizado em 31/08/2026** (ver o aviso abaixo).
- **Método:** leitura de um projeto do Victor, **sem tocar em um arquivo** (regra: só a Aurea se
  edita).
- **Fontes:** o app web dele (22 arquivos, 15 telas) e o relatório de requisitos que o acompanha.
- **O que este documento NÃO é:** especificação, autorização, nem fila. É o **inventário da
  demanda** de um consumidor real, para a decisão vir depois com número atrás.

> ⚠ **Este documento foi generalizado em 31/08/2026, por ordem do Victor:** *"Aurea não pode ter
> menção sobre outros projetos — apesar de falar aqui, documentação não pode conter."*
>
> O nome do produto, o nome do repositório, o domínio dele e **todo o vocabulário que identificava
> o ramo** saíram. O que ficou é o que interessa à Aurea: **quantas telas, que peças de UI, quantos
> usos, e quais lacunas** — nada disso precisa do nome para ser verdade.
>
> Onde este documento diz "o consumidor", "o app" ou "o item", havia um substantivo do domínio dele.
> **Não reconstitua.** Se precisar do contexto, pergunte ao Victor; ele não entra no repositório.

---

## 1. Por que ele importa mais que os outros

A [ADR-0022](../decisions/0022-consumidor-real-e-projeto-do-victor.md) define "consumidor real" como
projeto do Victor que instale **do npm** e exista por si — e o **K4** (publicar a `1.0`) espera
exatamente isso. Este é o primeiro candidato concreto: app web hoje, aplicativo nativo depois, com
requisitos escritos.

E ele chega numa hora incomum: a Aurea está em **95 de 97**, com as partes encerradas. É a
diferença entre fechar a `1.0` no escuro e fechá-la sabendo o que o primeiro consumidor pede.

---

## 2. O que o app web usa hoje, medido

**15 telas:** lista de itens · cadastrar · resumo do item · lançamentos de dois tipos (por item e
agregados, quatro telas) · configurações · onboarding · avisos · perfil e quatro subtelas dele.

**Vocabulário de UI, contado nos imports e no JSX:**

| peça do app | usos | o que é |
|---|---:|---|
| cabeçalho de tela | 18 | topo com voltar e título |
| abas por item | 8 | troca de seção dentro de um item |
| barra inferior | — | **navegação inferior fixa** |
| moldura | 1 | o quadro da aplicação |
| busca em catálogo | 1 | pesquisa contra um catálogo externo |
| dois esqueletos | 2 | carregamento |
| erro de seção · vazio agregado | 2 | erro e vazio |
| linha de perfil | 4 | **linha tocável com ícone, rótulo e seta** |
| cartão do item | 1 | o cartão da entidade principal |

**Primitivas instaladas** (shadcn/ui, base `neutral`, ícones lucide): accordion, alert, badge,
button, card, checkbox, dialog, empty-state, input, label, select, **sonner** (toast), switch,
table, tabs, textarea.

---

## 3. O que a Aurea JÁ cobre

Confirmado contra as 103 fichas do registry. A maior parte da demanda **já existe**:

| o que o consumidor precisa | componente da Aurea |
|---|---|
| moldura, cartão, pilha, grade | `AppShell` `Card` `Stack` `Grid` `Cluster` |
| topo com voltar e título | `Topbar` |
| abas por item | `Tabs` · `SegmentedControl` |
| formulários (cadastro e os dois lançamentos) | `Form` `Field` `Input` `Select` `Switch` `Checkbox` `Textarea` `NumberField` |
| **moeda, medida decimal, contador acumulado** | `Input.formatOnBlur` + `NumberField.format` — [ADR-0024](../decisions/0024-mascara-de-campo-e-o-momento-nao-o-formato.md) |
| busca no catálogo | `Combobox` · `SearchField` |
| datas (aquisição, lançamento, vencimento) | `Calendar` |
| anexo, documento, foto | `FileInput` |
| foto principal e galeria | `Image` · `Gallery` · `Carousel` |
| médias, custo por unidade, resumo mensal | `Chart` `ChartLegend` `KPI` |
| histórico do item | `Timeline` · `DataList` · `Table` · `DataGrid` |
| carregando, erro, vazio | `Skeleton` `DataState` `EmptyState` `Spinner` |
| avisos e vencimentos | `NotificationCenter` `Alert` `Banner` `Status` `Badge` |
| excluir item, confirmar | `ConfirmDialog` `Dialog` `Drawer` |
| **limites do plano gratuito** | `AccessGate` — [ADR-0023](../decisions/0023-o-portao-de-permissao-e-componente.md) |
| perfil, avatar | `Avatar` `AvatarGroup` |
| conquistas / gamificação | `Badge` `Progress` `KPI` |
| link temporário para terceiro | `QRCode` |

**Isto é o resultado que importa:** a demanda de um produto inteiro cai quase toda dentro do que já
existe. A cobertura por contrato da [ADR-0015](../decisions/0015-cobertura-antes-da-demanda-ate-a-1-0.md)
funcionou.

---

## 4. As lacunas — eram três, viraram **duas** em 16/08, e sobra **uma** desde 17/08/2026

A 4.2 caiu: o toast já existia em React e eu tinha medido errado (está escrito abaixo, com o
método do erro, porque apagar esconderia a lição). A **4.1 fechou em 17/08/2026** — o `BottomNav`
existe. Sobra a **linha de lista tocável** (4.3).

### 4.1 ~~Navegação inferior — **não existe na Aurea**~~ — **FECHADA em 17/08/2026**

**Existe: `BottomNav`**, autorizado pelo Victor nesta data e construído pelo procedimento do
[`BUILDING.md`](BUILDING.md). O registro da referência está no
[`REFERENCES.md`](REFERENCES.md) — uma das nove pastas tinha o componente (a MUI), e o que a
medição do passo 1 decidiu foi o tipo: ele recebe o **mesmo `SidebarItem`** da lateral, porque
duas listas do mesmo menu divergem.

O texto abaixo é o diagnóstico original, mantido como registro do que se mediu.

Nada em `packages/core` nem no pacote React produz barra inferior. A Aurea tem `Topbar` e
`Sidebar`, que são vocabulário de **desktop**.

O app do consumidor tem uma barra inferior própria, e as quatro referências visuais que o Victor
mandou têm barra inferior — é o padrão de aplicativo móvel, não um detalhe.

**É a lacuna estrutural.** Sem ela, o aplicativo não tem como navegar do jeito que aplicativo
navega.

### 4.2 ~~Toast — existe no core, não existe em React~~ — **ERRADO. Corrigido em 16/08/2026**

**O React TEM toast, e tem desde sempre.** `packages/react/src/system.tsx` publica `useToast()`
(gerente do Base UI) e o `AureaProvider` **já monta o viewport** — nem `<Toaster/>` para posicionar
existe. A pele é a `.toast` do core. Um consumidor faz `toast.add({title, description, type})` e
pronto.

**O que eu medi errado, e como:** li o **registry** e concluí sobre o **código**. Não há ficha
`Toast` entre as 103 — isso é verdade — e daí saiu a frase "nenhum módulo React o produz", que é
falsa. A regra do projeto é *medir, não contar*, e ficha é contagem: a fonte era `grep -rn toast
packages/react/src`, que devolve o hook na primeira linha.

**A lacuna real é de DESCOBERTA, e é maior que o toast:** hook não tem ficha (fichas são de
componente, e as 103 cobrem os 106 exports maiúsculos — os 3 de fora são contextos internos), logo
hook não tem página no catálogo. `useToast`, `useAureaTheme`, `useAureaStrings` e `useSpriteUrl`
são API pública **sem lugar nenhum onde se leia**. Foi exatamente por isso que eu mesmo concluí que
não existia. Documentados por ora no `README` do pacote; **página de catálogo para hook é decisão
do Victor**, não item que eu abro sozinho.

**E a leitura do código achou um defeito de verdade, que a leitura da ficha nunca acharia:** o
`system.tsx` emite `toast-${t.type}` e as quatro classes **não existiam no core** — o
`AureaToastType` prometia quatro faces e as quatro pintavam igual. Corrigido no mesmo dia, com o
mecanismo do `.alert`/`.banner` reusado, teste de unidade para o lado que emite e asserção de
EFEITO no `skin.spec` (provada contra o defeito: sem as regras, reprova).

### 4.3 Linha de lista tocável — **não existe**

A Aurea tem `DataList` (que é `<dl>`, termo e valor) e `Table`. Não tem a **linha que se toca e
navega**: ícone, rótulo, valor opcional e seta.

É a linha de perfil do app do consumidor (4 usos) e aparece nas três referências visuais — os itens
com seta que abrem uma subtela. É o tijolo de qualquer tela de ajustes.

---

## 5. O que eu conferi e NÃO é lacuna

Registrado para ninguém gastar sessão reabrindo: máscara de moeda (ADR-0024 decidiu que não há
componente, e por quê) · anexo de documento (`FileInput`) · limites de plano (`AccessGate`) ·
estados de erro e vazio (`DataState`) · gráficos (`Chart`) · pesquisa em catálogo (`Combobox`) ·
**toast (`useToast`, e o app pode largar o `sonner`)**.

**A lição que a 4.2 deixou, e ela vale para todo este documento:** ausência na ficha **não** é
ausência no código. Este inventário foi levantado lendo o registry, que é a lista do que está
DOCUMENTADO — e o que não está documentado pode existir e funcionar. Antes de escrever "a Aurea
não tem", o comando é `grep` no `packages/react/src`, não `ls` no registry.

---

## 6. Identidade — nada a mudar, e é para continuar assim

O Victor mandou quatro referências visuais e a instrução: **tudo arredondado, inspiração Apple.**

A Aurea já é isso por contrato, e o `CLAUDE.md` trava: superfícies flutuantes com raio de 22px,
controles em pílula (999px), sem gradientes. As referências **coincidem** com o que já existe.

**Consequência: nenhuma decisão de aparência sai daqui.** E vale a trava do
[`BUILDING.md`](BUILDING.md) §1 — de referência se extrai **anatomia**, nunca aparência. Se o
resultado parecer com as imagens, a referência foi lida errado.

---

## 7. O que este documento não decide

- **Não autoriza construir nada.** Três lacunas medidas não são três itens aprovados.
- **Não decide o nativo.** As lacunas valem para web e para o pacote nativo; o
  [`NATIVE.md`](NATIVE.md) Etapa 4 é que trata do segundo.
- **Sobre o K4, e isto precisa ser escrito de uma vez:** este projeto **é** o consumidor. Não é
  candidato, não é hipótese, não está em avaliação. A
  [ADR-0022](../decisions/0022-consumidor-real-e-projeto-do-victor.md) decidiu isso em 13/08/2026 com
  a frase do próprio Victor — *"a Aurea foi criada excepcionalmente para mim mesmo, para meus
  projetos pessoais"* — e a ADR-0009 e a ADR-0015 já descreviam a mesma biblioteca: construída
  inteira **antes** de alguém pedir, para os projetos dele.

  **O que falta para o K4 fechar não está do lado dele. Está do nosso.** O consumidor vai usar a
  Aurea quando a Aurea estiver pronta — e "pronta" inclui as lacunas do §4, das quais **sobra uma**
  (a 4.1 fechou em 17/08/2026). Enquanto o app dele usa shadcn/ui, isso descreve o **estado atual
  de uma migração que ainda não começou**, não uma dúvida sobre se o projeto conta.

  Escrito assim porque a versão anterior deste parágrafo dizia "candidato, não consumo" — e essa
  foi a **terceira vez** que eu levantei uma dúvida que a ADR-0022 já tinha encerrado. Quem ler
  este documento não precisa passar por isso de novo.
- **Não trata logo nem marca.** É trabalho de identidade visual do produto dele, separado.
