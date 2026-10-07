# ADR-0053 — A fonte é a Atkinson Hyperlegible Next, e os ícones são o Phosphor Regular

- **Data:** 01/10/2026
- **Estado:** aceita · **executada na `0.13.0`** (01/10/2026, "pode" do Victor: *"pode, faça
  tudo"*), ainda não publicada. ~~A troca ainda não foi feita~~.
- **Autoria:** decisão do Victor, olhando lado a lado seis fontes e sete coleções de ícones com
  as cores, as cápsulas e os cartões da Aurea. Nas palavras dele: *"vamos usar Phosphor Regular e
  Atkinson Hyperlegible Next"*.
- **Muda:** a seção 5 do `CLAUDE.md` (identidade), que dizia *IBM Plex Sans / Serif / Mono;
  Carbon Icons*.

## A regra

> **A letra da Aurea é a Atkinson Hyperlegible Next. Os ícones são o Phosphor, no peso Regular.**

## Por que mudou

Duas queixas do Victor no mesmo dia:

1. **Faltaram ícones.** O app precisou de uma coroa (R-17) e o Carbon não tem, em versão
   nenhuma. Também não tem moto.
2. **A fonte incomodava.** A Aurea é arredondada como a referência (cápsulas, cartões de 22), e a
   IBM Plex tem cantos firmes e letra estreita.

## O que foi medido antes de decidir

Tudo nos arquivos publicados, baixados com `npm pack` em 01/10/2026.

**Ícones:**

| coleção | nomes | desenho | coroa | moto | licença |
|---|---|---|---|---|---|
| Carbon 11.89.0 (a Aurea estava na 11.84.0) | 2.766 | forma cheia, cantos retos, grade 32 | não | não | Apache-2.0 |
| **Phosphor 2.1.1** | **1.512, em 6 pesos** | **traço redondo, grade 256** | **sim** | **sim** | **MIT** |
| coleção de traço A | 2.121 | traço 2, grade 24 | sim | sim | ISC |
| coleção de traço B | 5.166 de contorno + 1.054 cheios | traço 2, grade 24 | sim | sim | MIT |
| a coleção que a documentação da referência usa | 799 | forma cheia, cantos redondos, grade 16 | só com diamante | não | MIT |

- **Juntar duas coleções foi descartado:** o Carbon é forma cheia de canto reto, e as de traço
  têm ponta redonda. Lado a lado, destoam. O Victor apontou isso antes da medição.
- **O Phosphor desenha os seis pesos como forma preenchida** (`fill="currentColor"`), como o
  Carbon. O gerador de ícones do nativo (`packages/native/build-icons-native.mjs`) já trabalha
  com forma preenchida.
- 275 dos 2.766 nomes do Carbon eram de produto da IBM, logotipo ou nuvem.

**Fontes:**

| fonte | números de largura igual | par de código | licença |
|---|---|---|---|
| IBM Plex Sans (a atual) | — | IBM Plex Mono | OFL |
| **Atkinson Hyperlegible Next** | **sim** | **Atkinson Hyperlegible Mono** | **OFL** |
| fonte A | sim | a irmã de código dela | OFL |
| fonte B | sim | a irmã mono dela | OFL |
| fonte C | sim | nenhum | OFL |
| fonte D | não | nenhum | OFL |

- A Atkinson Hyperlegible leva o nome do fundador do Braille Institute e foi feita *"para
  aumentar a legibilidade para leitores com baixa visão"* (README do repositório
  `googlefonts/atkinson-hyperlegible-next`). Letras parecidas (`I l 1`, `O 0`) têm desenhos
  diferentes. O Victor tem baixa visão.
- A fonte A era a outra finalista, por ter um controle de arredondamento. Perdeu para a
  legibilidade.
- A referência não decide nenhuma das duas coisas: o pacote web dela usa a fonte do sistema, e a
  documentação dela usa outra coleção de ícones, que tem só 799.

## O que a troca obriga (o lote)

1. **Ícones:**
   - trocar `@carbon/icons` por `@phosphor-icons/core` (MIT) no `packages/icons` e no gerador do
     nativo;
   - **todo nome de ícone muda.** Desde a A-04 o nome é conferido pelo TypeScript, então todo
     app que usa ícone para de compilar até trocar os nomes. Precisa de uma tabela de nomes
     antigos para novos, e de um aviso grande no `CHANGELOG.md`;
   - o sprite da web e os arquivos `icons/*` do nativo são regerados;
   - o `NOTICE` e o `docs/REFERENCES.md` trocam o crédito.
2. **Fonte:**
   - o `@aurea-uds/fonts` passa a levar a Atkinson Hyperlegible Next e a Mono, nos arquivos da
     web e nos arquivos fixos por peso do nativo (`files-native/`);
   - os tokens de família (`aurea.tokens.json`) e o `--font-*` do core trocam;
   - **todas as fotos de referência dos testes visuais mudam**;
   - as medidas que dependem da largura da letra se medem de novo.
3. **Uma versão do meio que quebra** (`0.x` com aviso, ADR-0014), antes da `1.0`.

## Respostas do Victor (01/10/2026)

1. **Item escolhido** (aba ativa, item atual do menu, da barra de baixo): **Phosphor Fill**, o
   cheio. O resto fica no Regular.
2. **Fonte de código:** **Atkinson Hyperlegible Mono**, sim.
3. **Fonte editorial:** **remove.** O `--font-editorial` (IBM Plex Serif) estava sem uso (lido
   no `aurea.css`, linha 1624), e a IBM Plex Serif sai do `@aurea-uds/fonts` junto com a troca.
4. **Ícone pequeno:** *"mede"*. Medido abaixo; **a escolha do peso continua aberta**.

## A medida do ícone pequeno (01/10/2026)

**A espessura do traço**, lida no desenho do sinal de menos de cada coleção:

| coleção | traço no desenho | fração do tamanho | a 16 | a 20 | a 24 |
|---|---|---|---|---|---|
| Carbon (hoje), `svg/32/subtract.svg` | 2 numa grade de 32 (`H24V17H8`) | 1/16 | 1 px | 1,25 px | 1,5 px |
| Phosphor Regular, `regular/minus.svg` | 16 numa grade de 256 | 1/16 | 1 px | 1,25 px | 1,5 px |
| Phosphor Bold, `bold/minus-bold.svg` | 24 numa grade de 256 | 3/32 | 1,5 px | 1,875 px | 2,25 px |

- **O Regular tem exatamente o traço do Carbon de hoje**, em todos os tamanhos. Trocar Carbon
  por Regular não afina nada; o ícone pequeno de hoje já tem 1 px de traço.
- O Bold é uma vez e meia mais grosso.
- Foto dos três nos tamanhos da Aurea (`--icon-sm` 16, `--icon-md` 20, `--icon-lg` 24), nos dois
  temas, sem ampliação suave: mostrada ao Victor em 01/10/2026. A Aurea desenha os ícones a partir
  do `svg/32` do Carbon (`packages/icons/build-icons.mjs`, linha 5).

## O que ainda falta decidir

- **O peso do ícone pequeno:** Regular em todos os tamanhos (como o traço de hoje), ou Bold no
  `--icon-sm` (16)? A decisão é do Victor, olhando a foto.

## Como a troca foi feita (0.13.0, 01/10/2026)

- **Nomes:** os do Phosphor, sem tradução. A tabela `packages/icons/carbon-para-phosphor.json`
  (publicada) leva os 260 nomes do Carbon que o repositório usava aos novos. Seis nomes existem nos
  dois com desenhos diferentes (`list`, `notification`, `radio`, `subtract`, `tree`, `video`) e
  compilam sem erro; foram trocados à mão, e o CHANGELOG avisa os apps.
- **Forma cheia:** `weight="fill"` no `Icon`. Na web, o símbolo `i-<nome>-fill` do sprite; no
  nativo, a chave `<nome>-fill` do registro, com volta para a regular se ela faltar. Usada no item
  escolhido (`Sidebar` e `BottomNav`) e onde o Carbon já era cheio (avisos, `ThemeToggle`, envio
  concluído, play), para a aparência aprovada não mudar.
- **Logotipos de marca:** os 79 do Phosphor com `-logo` no nome ficam fora (CLAUDE.md §5). O
  primeiro filtro olhava só o fim do nome e deixou passar `gitlab-logo-simple`; o teste pegou.
- **Fonte editorial:** a IBM Plex Serif saiu. O `--font-editorial` e o papel `editorial` do nativo
  ficaram como **apelido da fonte do texto**, porque removê-los quebraria a API do nativo
  (`AureaFontFamilies.editorial`) e os títulos do catálogo. Saem na `1.0`. Escolha do agente para
  não quebrar; **o Victor pode mandar remover já**.
- **Altura da letra:** a Atkinson ocupa 1,3 em (sobe 0,984, desce 0,316), o mesmo total da Plex
  (1,025 + 0,275). As entrelinhas do E1 continuam cabendo.
