// @aurea-uds/native — o alvo React Native da Aurea.
//
// A arquitetura, decidida em 18/07/2026 e não reaberta: pacote IRMÃO do `@aurea-uds/react`,
// sobre `View`/`Text`/`Pressable`, consumindo `@aurea-uds/tokens`. Só os tokens atravessam.
//
// **Lote 0** entregou o chão — o provider de tema × densidade e os 2571 ícones gerados.
// **Lote 1** (03/09/2026) entrega os primeiros componentes, e eles só puderam nascer porque o
// Lote 0 foi provado num Android: as quatro perguntas do `NATIVE.md` §7 passaram. Os DEZ estão
// aqui — o `Screen` chegou por último, depois de o Victor autorizar o peer que ele exigia.
//
// **Lote 2** (08/09/2026) entrega o painel de leitura: os seis de feedback e os quatro de
// exibição. Nenhum deles tem motor — são medida, cor e texto —, e é por isso que ele é o lote de
// menor risco depois do chão.
//
// **Lote 3** (08/09/2026) entrega a MOLDURA — e a primeira coisa a dizer sobre ela é o que ela
// não é: **a Aurea não entrega roteamento**. `expo-router`/`react-navigation` é escolha do app;
// o que sai daqui é a pele que se pluga nele.
//
// **Lote 4** (08/09/2026) entrega os FORMULÁRIOS. O `NATIVE.md` o chamava de "o lote caro" por
// causa do Base UI; **medido, são dois de dez, não sete de treze** — e o que o torna caro é
// outra coisa: a ligação rótulo↔controle da web não existe no RN. Ver o `Field`.
//
// Os ícones NÃO saem por este barril, de propósito: eles moram em `@aurea-uds/native/icons/<nome>`
// e o caminho profundo é a forma documentada (ADR-0038, cláusula 1) — importar daqui traria os
// 2571 ao grafo do bundler.
export { AureaProvider, useAureaTheme, useAureaTokens } from "./theme.js";
// A barra de abas que flutua precisa contar a própria altura para a tela reservar o fim da
// rolagem. Ver `barranav.tsx` — e o `BottomNav`, que é quem mede.
export { BottomNavProvider, useBottomNavSpace } from "./barranav.js";
export { resolverTokens } from "./tokens.js";
// A fábrica de folhas memoizada por (tema, densidade). Pública porque o consumidor tem o mesmo
// problema que os componentes daqui — e a medição em aparelho mostrou que ele é real.
export { criarFolha, comOpacidade } from "./estilos.js";
export { Text } from "./text.js";
export { Icon, IconRegistryProvider, criarRegistroDeIcones, criarGlifo } from "./icon.js";
// A ÚNICA peça do Lote 1 com dependência de terceiro — `react-native-safe-area-context`,
// autorizada pelo Victor em 03/09/2026 depois de o lote parar por ela (`BUILDING.md` §3).
export { Screen } from "./screen.js";
export { Stack, Cluster, Grid, Card, Separator } from "./layout.js";
export { Button, IconButton } from "./actions.js";
// ── Lote 2 — o painel, que é só leitura ────────────────────────────────────────────────────
export { Spinner, Skeleton, Progress, Alert, EmptyState, DataState, ICONE_DA_VARIANTE } from "./feedback.js";
export { Badge, Status, Avatar, KPI, formatarContagem } from "./display.js";
// As frases visíveis, e o hook que as lê. A tabela é do tamanho do que o alvo nativo desenha —
// ver o cabeçalho de `strings.ts`, que escreve por que ela NÃO é a da web.
export { useAureaStrings } from "./theme.js";
export { defaultStrings, ptBR, gravidadeDoEstado, AUREA_UNIVERSAL_STATES } from "./strings.js";
// A pergunta "a pessoa pediu menos movimento?", pública porque o consumidor anima também — e
// porque no RN não existe a regra global de `prefers-reduced-motion` que a web tem de graça.
export { useReduceMotion } from "./movimento.js";
// ── Lote 3 — a moldura de navegação ────────────────────────────────────────────────────────
// ⚠ A Aurea **não entrega roteamento**. Estes componentes recebem `items` e `current` e avisam
// por `onPress`; quem troca de tela é o app.
// ⚠ **O `Tabs` entrou em 17/09/2026, e é a única peça daqui que NÃO saiu de um lote** — ele
// veio do consumidor, que precisava trocar de painel dentro de uma tela e só tinha o
// `SegmentedControl`, que anuncia "rádio". A fronteira com o `BottomNav` está no JSDoc dele.
export { BottomNav, Topbar, NavList, Stepper, Tabs } from "./navigation.js";
// ── Lote 4 — os formulários ────────────────────────────────────────────────────────────────
// ⚠ O `Field` NÃO nomeia o controle por referência, como o `<label for>` da web: ele empurra o
// nome, a dica e o estado de inválido para o controle por CONTEXTO. É a tradução que decidiu o
// lote — o RN não tem `id` nem `htmlFor`.
export { Field, Label, Input, Textarea, Select, Switch, Checkbox, Radio, SegmentedControl, Form, KeyboardAvoiding, useCampo, } from "./inputs.js";
// ⚠ O GRUPO e o campo de SENHA entraram depois do Lote 4, medidos pelo app na tela de entrar
// (15/09/2026): o campo não tinha onde encaixar glifo, e `secureTextEntry` esconde a senha sem
// dar botão para mostrá-la. **Os dois já existiam na web desde 29/08/2026** — a falta era só
// deste lado, e o desenho daqui é o de lá traduzido, não um desenho novo.
export { InputGroup, InputGroupAddon, PasswordField, useGrupoDeCampo } from "./inputs.js";
// ⚠ `DatePicker` e `PhotoInput` NÃO saem daqui, e é de propósito: eles vivem em
// `@aurea-uds/native/system`, pela mesma razão que os ícones vivem em `./icons/*` (ADR-0038).
// Sair por este barril traria os dois módulos NATIVOS ao grafo de todo app — inclusive de quem
// só quer um `Button`.
// ── Lote 5 — confirmar e avisar ────────────────────────────────────────────────────────────
// ⚠ O achado deste lote é de ACESSIBILIDADE, e ele está por extenso no topo de `overlays.tsx`:
// o RN **aceita** `role="dialog"` e `role="alertdialog"`, compila, atravessa o Fabric — e não
// mapeia nem no Android (`fromRole()` -> `null`) nem no iOS (não há trait). O confinamento vem
// do `Modal`, que é uma JANELA do sistema; a saída vem do `onRequestClose`, que é o botão
// VOLTAR do Android e o par exato do `Escape` da web.
export { Dialog, ConfirmDialog, Drawer, BottomSheet } from "./overlays.js";
// ⚠ A pilha de avisos precisa de um `<ToastHost>` EXPLÍCITO, e isso é decisão, não esquecimento:
// não há portal no React Native, e pôr a pilha dentro do `AureaProvider` acrescentaria um `View`
// ao layout de todo app que já usa a Aurea, em silêncio.
export { ToastHost, Toast, useToast } from "./toast.js";
// ── Lote 6 — o resto do cockpit, e o ÚLTIMO do plano nativo ────────────────────────────────
// ⚠ A `Table` do nativo **não é uma tabela**: cada linha vira um cartão e cada célula leva o nome
// da coluna junto. Não é recuo — é a única forma que tem as duas coisas. O papel `table` NÃO
// mapeia em plataforma nenhuma (mesma armadilha que o Lote 5 mediu no `dialog`), então a grade
// não se anunciaria como tabela de qualquer jeito; e o `min-width: 720px` do CSS num telefone é
// rolagem horizontal de 2×, que a ficha da web já considera insuficiente sem teclado — e no toque
// não há teclado. E a API é OUTRA: `columns` + `rows`, porque não há `<thead>` para escrever.
export { Timeline, DataList, Table } from "./data.js";
// ── O Chart — o único componente cuja GEOMETRIA é nossa ────────────────────────────────────
// ⚠ [ADR-0041]: no nativo não há motor de gráfico. O `Chart` da web é 79 linhas de PELE sobre o
// `recharts`; aqui escala, eixo e caminho são código deste repositório. As quatro bibliotecas de
// RN foram medidas e recusadas — a mais próxima (`react-native-chart-kit`) cai porque é `data`
// entra / gráfico sai, e o `recharts` é MARCA COMPOSTA: adotá-la inverteria a relação em que a
// Aurea segura e o motor desenha com as props dela.
// ⚠ **Com duas ou mais séries a legenda NÃO desliga**: a paleta `--chart-*` é uma rampa de um
// azul só, e duas séries vizinhas nela são indistinguíveis (ΔE 5.9, medido).
export { Chart, ChartLegend } from "./chart.js";
// ── Lote 7 — as três lacunas que o CONSUMIDOR mediu, e não o plano ─────────────────────────
// ⚠ Este é o primeiro lote do alvo nativo que **não sai do `NATIVE.md` §5**: o plano fechou em
// 11/09/2026 com 46 componentes e "não sobrou nada". Sobrou — só que a fila passou a ser a do
// app, não a do documento. As três estão no §8, com a demanda de cada uma.
//
// ⚠ **O `Combobox` DIVERGE da web, e é deliberado:** ele soma `onSearchChange`, `loading` e
// `onEndReached` ao contrato de seleção única, porque busca remota + escolha de UM item não
// existe lá (o `Combobox` da web filtra no cliente; quem tem `onInputChange` é o
// `MultiCombobox`, que é de seleção múltipla). A regra: **`onSearchChange` presente = a Aurea
// não filtra.**
export { Combobox, SearchField } from "./busca.js";
// ⚠ O `NumberField` formata no BLUR, nunca enquanto se digita — a [ADR-0024] atravessa inteira.
// O que muda no nativo é quem chama o `Intl` (não há Base UI) e a VOLTA, que a web não precisou
// escrever: `lerNumero` converte de novo o que a pessoa digitou. Os dois auxiliares são públicos
// porque o app tem o mesmo problema em toda tela de lançamento.
export { NumberField, formatarNumero, lerNumero, separadoresDoLocale } from "./numero.js";
// ⚠ O `Image` NÃO é o `Image` do React Native com outra pele: ele **reserva a caixa** antes dos
// bytes e **cai para um substituto** quando eles não vêm — as duas coisas que a ficha da web
// promete e que o primitivo cru não faz. Foi por não fazê-las que o `Avatar` precisou de
// conserto em 31/07/2026.
export { Image, Gallery } from "./midia.js";
