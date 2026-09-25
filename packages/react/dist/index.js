// @aurea-uds/react — a entrada principal.
//
// Fase 9 (achado A5). Antes: UM arquivo de 970 linhas, UM ponto de entrada, e oito dependências
// de runtime — das quais seis serviam o CodeEditor, uma o DataGrid e uma o QRCode. Quem
// instalava a biblioteca para usar um Button baixava um editor de código inteiro.
//
// Agora cada categoria do registry é um módulo, e cada módulo é um subpath. Este arquivo é a
// porta de sempre: `import {Button} from "@aurea-uds/react"` continua funcionando e traz tudo
// que não custa dependência.
//
// SEIS MÓDULOS DE MOTOR OPCIONAL NÃO ENTRAM AQUI:
//   CodeEditor  → "@aurea-uds/react/code-editor"  (CodeMirror, 6 peers opcionais)
//   DataGrid    → "@aurea-uds/react/data-grid"    (@tanstack/react-table)
//   QRCode      → "@aurea-uds/react/qrcode"       (qr)
//   Calendar    → "@aurea-uds/react/calendar"     (react-day-picker)
//   Chart       → "@aurea-uds/react/chart"        (recharts)
//   DependencyGraph → "@aurea-uds/react/graph"    (@xyflow/react)
// Se estivessem neste barril, importar um Button carregaria um peer opcional — e a dependência
// que não estivesse instalada quebraria a importação. O peso é real, então a fronteira é real.
// SEM `"use client"`, e é o ponto da Parte A: este barril é um módulo de SERVIDOR. Reexportar
// componente de um módulo com a diretiva é o caminho suportado — quem importa daqui de um
// componente de servidor recebe uma referência de cliente e a renderiza normalmente.
//
// `cx` e os dicionários vêm do `pure.js`, não do `internal.js`: os dois exportam os mesmos
// nomes, mas o `internal` tem a diretiva, e dali `cx` viraria referência de cliente — chamável
// só no navegador. Um helper de classe tem de funcionar nos dois lados.
// `gridStateToParams`/`gridStateFromParams` saem por AQUI, e não pelo subpath do
// DataGrid, de propósito: quem lê a URL num framework de RSC é o SERVIDOR, e o
// subpath tem a diretiva. Vindo daqui — via `pure.js`, que não tem — a função é
// chamável dos dois lados. É a mesma razão do `cx`, uma camada acima.
export { cx, defaultStrings, ptBR, defaultSpriteUrl, gridStateToParams, gridStateFromParams, screenStateToParams, screenStateFromParams, universalStates, stateSeverity } from "./pure.js";
export { useAureaStrings, useSpriteUrl, useTheme, useDensity } from "./internal.js";
// O EIXO RESPONSIVO (G-AXIS-04/06) — os tipos e a escala saem do `pure.js`, que não tem a
// diretiva, pela mesma razão do `gridStateToParams` logo acima: resolver um valor responsivo é
// computação de string, e o servidor precisa dela para emitir a classe certa no HTML.
export { ESCALA, ESCALA_CONTAINER } from "./pure.js";
// O contêiner Aurea como PRIMITIVE, e o resolvedor genérico. `ContainerScope` é público porque
// quem monta o layout precisa declarar o contêiner; `useValorResponsivo` é público porque o
// eixo comportamental é reutilizável fora dos cinco componentes que o estrearam. Estes DOIS têm
// a diretiva de propósito: observam o documento.
export { ContainerScope, useValorResponsivo } from "./responsivo-runtime.js";
// ── A LINHA DO ITEM O1, e ela é o item inteiro ───────────────────────────────────────────────
// Estes 22 vêm do `markup.js`, que NÃO tem a diretiva, e por isso chegam como componentes de
// SERVIDOR. Vinham dos módulos de categoria abaixo, e de lá chegavam como cliente: `Card` é uma
// <div>, e importá-lo embarcava 9 módulos e 118,5 KB — `node scripts/measure-boundary.mjs`.
//
// ESTA LINHA PRECISA SER EXPLÍCITA, e o que acontece sem ela foi MEDIDO, não deduzido — a
// primeira versão deste comentário dizia outra coisa e a prova contra o defeito a derrubou.
// Tirando um nome daqui: o `tsc` fica VERDE, o componente continua existindo e os testes
// continuam passando, porque o módulo de categoria abaixo o reexporta (é o que mantém o subpath
// inteiro). O que muda é de ONDE ele vem — do módulo com a diretiva —, e aí ele volta a chegar
// como referência de CLIENTE e os 118,5 KB voltam com ele. Não é um erro: é o ganho do item O1
// se desfazendo em silêncio. É isso, exatamente isso, que o check 35 pega.
export { AspectRatio, InputGroup, InputGroupAddon, Label, Card, Stack, Cluster, Grid, KPI, DataList, Timeline, Prose, Text, Heading, Paragraph, Code, Badge, Progress, Skeleton, AvatarGroup, LogStream, MediaPlayerShell, Topbar, Kbd, Textarea, Checkbox, Radio, Switch, Range, formatBadgeCount } from "./markup.js";
export * from "./system.js";
export * from "./actions.js";
export * from "./feedback.js";
export * from "./inputs.js";
export * from "./navigation.js";
export * from "./layout.js";
export * from "./data-display.js";
export * from "./identity.js";
export * from "./disclosure.js";
export * from "./overlays.js";
export * from "./media.js";
export * from "./communication.js";
export * from "./code.js";
// A camada operacional (Parte H). Sem dependência nova, então entra no barril.
export * from "./agents.js";
