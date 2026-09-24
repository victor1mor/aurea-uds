import {createElement as h} from "react";
import {Card, KPI, Badge, Button, Status, Timeline, DataList, Avatar, Alert, CodeBlock,
  MessageList, InvocationPanel, HumanApproval, Toolbar, ToolbarButton,
  TreeView, Table, Progress, SegmentedControl, Select, EmptyState,
  HealthMatrix, Field, Range, MediaPlayer} from "../../../../packages/react/dist/index.js";
// Subpath próprio e peer OPCIONAL — o `Chart` não sai do barril de propósito (Lote 3), e o
// `DataGrid` também tem o seu (Fase 9, motor `@tanstack/react-table`).
import {Chart} from "../../../../packages/react/dist/chart.js";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
// Subpath próprio e peer OPCIONAL, como o `Chart` e o `DataGrid`: o `@xyflow/react` entrou na
// Parte H (H14) e não sai do barril, para quem não usa grafo não pagar por ele.
import {DependencyGraph} from "../../../../packages/react/dist/graph.js";
import {AreaChart, Area, CartesianGrid, XAxis} from "recharts";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};
const between = {...row, justifyContent: "space-between"};
const stack = {display: "grid", gap: "var(--space-4)"};
const cols = n => ({display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(${n}px,1fr))`, gap: "var(--space-3)"});

// ── I1 · RunSession — a composição do PLANO-1.0 §12 ──────────────────────────
// As SEIS regiões que o contrato declara (`operationalPatterns.patterns.RunSession.regions`
// = session_header · turn_stream · tool_panel · checkpoint · receipt · actions), montadas
// só com o que já existe: nenhum componente novo, nenhum CSS novo, nenhuma string nova.
//
// O que a barra oferece SAI DO CONTRATO, e não de uma lista escrita aqui: são as transições
// que partem do estado atual e cuja ação é de PESSOA (a lista `actions`). Escrever "no
// estado X mostre Y" à mão seria a segunda fonte da verdade que o achado I1 desta auditoria
// pune — e ela envelheceria calada na primeira vez que o contrato mudasse.
// Import de JSON com atributo, e não `readFileSync(new URL(…, import.meta.url))`: sob o
// Vite o `import.meta.url` não é URL de arquivo, e o teste da composição — que importa este
// mesmo módulo — morria com "The URL must be of scheme file". O atributo funciona nos dois.
import contract from "../../../../packages/contracts/aurea.contract.json" with {type: "json"};
const RUN = contract.operationalPatterns.patterns.RunSession;

// `approve`/`reject` ficam FORA da barra: quem os oferece é o `HumanApproval`, e o mesmo
// botão em dois lugares são duas verdades sobre quem decide.
const APROVACAO = ["approve", "reject"];
export const runActions = state => RUN.transitions
  .filter(t => t.from === state && RUN.actions.includes(t.action) && !APROVACAO.includes(t.action))
  .map(t => t.action);

// MEDIDO em 10/08/2026, e fica registrado porque é buraco do CONTRATO e não escolha daqui:
// `fork` e `reject` estão em `actions` e não têm transição nenhuma na tabela. Por isso o
// `fork` não aparece em estado algum — inventar a transição dele dentro de um preview seria
// decidir o contrato num lugar onde ninguém procura decisão.
const ACAO = {start: "Start", resume: "Resume", interrupt: "Interrupt", cancel: "Cancel", retry: "Retry", fork: "Fork"};

// O estado da execução em TEXTO e cor, que é o que o contrato exige em `accessibility`.
// Os três "esperando" são estados UNIVERSAIS (Parte J, ADR-0018): entram pelo eixo `state`
// e trazem a frase que o vocabulário já publica — a composição não inventa texto para eles.
// Os outros seis são condição desta execução e entram pela variante, com rótulo próprio.
const ESTADO = {
  accepted: {variant: "neutral", label: "Accepted"},
  running: {variant: "running", label: "Running"},
  waiting_user: {state: "waiting_user"},
  waiting_approval: {state: "waiting_approval"},
  waiting_dependency: {state: "waiting_dependency"},
  completed: {variant: "success", label: "Completed"},
  failed: {variant: "danger", label: "Failed"},
  cancelled: {variant: "neutral", label: "Cancelled"},
  interrupted: {variant: "warning", label: "Interrupted"},
};

// O RECIBO existe desde o aceite e não some nunca — é assim que "interrupt does not erase
// receipt" e "cancel emits terminal receipt" valem por construção, em vez de valerem por
// promessa. Quem for mexer aqui: apagar o recibo fora dos terminais reprova no teste.
// Regiões sem título de nível fixo: `role="group"` nomeado, pelo mesmo motivo que o
// `InvocationPanel` e o `AgentInspector` não usam `<h3>` — título fixo dentro de uma peça
// vira salto de hierarquia na página que a hospeda.
const regiao = (label, ...filhos) => h("div", {role: "group", "aria-label": label}, ...filhos);

export function runSession(state) {
  const e = ESTADO[state];
  const acoes = runActions(state);
  const encerrada = RUN.terminalStates.includes(state) || state === "interrupted";
  // `--space-2` e não o `stack` de `--space-4` dos outros blocos: são SEIS regiões numa caixa de
  // altura fixa, e o degrau menor é o que faz a barra de ações caber acima da dobra.
  // A medição de 09/08 (496 com `--space-4`, 447 com `--space-3`) usava a régua ERRADA: comparava
  // contra os 457 da caixa do demo, e a caixa gasta 53px com as abas *Preview/Code* mais 48 de
  // `padding` do painel. O vão real é **354**, medido em 10/08 a 1440×761, e com 447 o painel
  // ROLAVA — que é o que a ADR-0002 existe para não acontecer. Daqui saem os 4px por vão.
  return h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(680px,100%)"}},
    regiao("Run", h("div", {style: between},
      h("strong", null, "run_8f21 · tokenise raw radii"),
      h(Status, e.state ? {state: e.state} : {variant: e.variant}, e.label))),
    // UM turno, e não dois. Medido em 10/08/2026, quando o I2 achou que a régua da conferência
    // do I1 estava errada: a caixa do demo tem 457px, mas 53 são as abas *Preview/Code* e 48 são
    // o `padding` do painel — o vão real é 354, não 457. Com dois turnos e dois passos a
    // composição dava 447 e o painel ROLAVA, que é o que a ADR-0002 existe para não acontecer.
    // O turno que ficou é o do agente: o do humano repetia o que o cabeçalho já diz
    // ("tokenise raw radii"), e o do agente é a única frase que não está em nenhum outro lugar.
    h(MessageList, {label: "Turns", messages: [
      {id: "2", author: "Agent", time: "09:13", body: "Two files, four values. Writing the first now.",
        avatar: {fallback: "AG"}}]}),
    // Sem `input`: o primeiro passo já nomeia o arquivo, e a caixa do demo tem altura FIXA
    // (ADR-0002). Medido em 10/08: com ele a composição dava 588px numa caixa de 457 e a
    // barra de ações — que é a região que este item existe para mostrar — ficava abaixo da
    // dobra, dentro do painel rolável. Cortar o repetido é mais barato que rolar para ver.
    h(InvocationPanel, {title: "write_file", running: state === "running",
      steps: [
        {id: "1", label: "read_file", detail: "aurea.css · 86 KB", state: "done"},
        {id: "2", label: "write_file", detail: "4 replacements", state: state === "failed" ? "error" : state === "running" ? "running" : "done"}],
      output: encerrada ? "4 raw radii replaced by --radius-card." : null}),
    state === "waiting_approval" ? h(HumanApproval, {
      title: "Write to the repository", risk: "medium",
      description: "The run wants to change a tracked file.",
      details: [{term: "File", value: "packages/core/src/aurea.css"}, {term: "Replacements", value: "4"}],
      deadline: "09:20"}) : null,
    // Ponto de retomada e recibo LADO A LADO: são duas linhas curtas, e empilhadas elas faziam
    // a composição passar 18px da caixa depois da escala de letra da 0.8.8.
    h("div", {style: {display: "grid", gridTemplateColumns: "3fr 2fr", gap: "var(--space-3)", alignItems: "start"}},
      regiao("Checkpoint", h(DataList, {items: [
        {term: "Resume from", value: "turn 2 · tool call 2 · 09:13:41"}]})),
      regiao("Receipt", h(DataList, {items: [
        {term: "Run", value: "run_8f21"},
        ...(encerrada ? [{term: "Outcome", value: e.label}] : [])]}))),
    acoes.length ? regiao("Actions", h(Toolbar, {label: "Run actions"},
      ...acoes.map(a => h(ToolbarButton, {key: a, variant: a === "cancel" ? "ghost" : "outline"}, ACAO[a] ?? a)))) : null);
}

// ── I2 · ReviewCompare — a composição do PLANO-1.0 §12 ───────────────────────
// As CINCO regiões do contrato (`operationalPatterns.patterns.ReviewCompare.regions`
// = source · comparison · decision · test_result · receipt), montadas com o que já existe:
// nenhum componente novo, nenhum CSS novo, nenhuma string nova.
//
// UMA diferença de desenho em relação ao I1, e ela sai do próprio contrato: o `RunSession`
// tem uma região `actions` separada da aprovação, e o `ReviewCompare` NÃO TEM. Aqui
// `decision` É o lugar onde toda ação de pessoa mora — por isso a derivação abaixo não
// exclui `approve`/`reject`, como a do I1 excluía, e por isso o `HumanApproval` não entra:
// ele oferece aprovar E negar no mesmo portão, e a tabela de transições diz que as duas
// nunca coexistem (`reject` parte de `previewing`, `approve` parte de `testing`). Usá-lo
// aqui seria pôr na tela uma saída que o contrato não permite naquele estado.
const REVIEW = contract.operationalPatterns.patterns.ReviewCompare;

export const reviewActions = state => REVIEW.transitions
  .filter(t => t.from === state && REVIEW.actions.includes(t.action))
  .map(t => t.action);

// MEDIDO em 10/08/2026, e é o mesmo buraco de CONTRATO que o I1 registrou com o `fork`:
// `resolve` está em `actions` e não tem transição nenhuma na tabela, então não aparece em
// estado algum. `change` e `fail` são o contrário — transição sem estar em `actions`, ou
// seja, mudança que o sistema faz e não uma pessoa. O filtro acima separa os dois casos.

// Sufixo `_REVIEW` daqui para baixo porque o módulo passou a hospedar DUAS composições e o I1
// já tinha `ACAO`/`ESTADO`. O prefixo é a informação: a partir da terceira, cada uma traz o
// seu. Um arquivo por composição resolveria também, ao custo de duplicar `regiao` e `between`.
const ACAO_REVIEW = {preview: "Preview", reject: "Reject", test: "Run checks", approve: "Approve",
  apply: "Apply", rollback: "Roll back", resolve: "Resolve"};

// NENHUM dos nove estados é universal (Parte J, ADR-0018) — conferido contra a união do
// `pure.tsx`. Por isso, ao contrário do I1, aqui não há eixo `state`: todos falam pela
// variante, com rótulo próprio. Inventar um universal para "changed" ou "previewing"
// aumentaria a união de sete para nove sem que o contrato tivesse pedido.
const ESTADO_REVIEW = {
  idle: {variant: "neutral", label: "Idle"},
  previewing: {variant: "info", label: "Previewing"},
  changed: {variant: "info", label: "Changed"},
  testing: {variant: "running", label: "Running checks"},
  approved: {variant: "success", label: "Approved"},
  rejected: {variant: "neutral", label: "Rejected"},
  applied: {variant: "success", label: "Applied"},
  rolled_back: {variant: "warning", label: "Rolled back"},
  failed: {variant: "danger", label: "Failed"},
};

// "diff has textual additions and deletions" — contract.accessibility, e é a única cláusula
// em que as DUAS referências reprovam, medido em 10/08/2026. O `DiffViewer` do Langfuse
// pinta a linha inteira (`bg-green-500/30` de um lado, `bg-destructive/60` do outro) e não
// escreve nada; o exemplo de diff do Kibo marca a linha com um comentário `[!code ++]` que o
// Shiki CONSOME e converte em cor. Nos dois, quem não distingue as cores não distingue o que
// entrou do que saiu — WCAG 1.4.1.
// Aqui o marcador é o `+`/`-` da primeira coluna, que é o formato do diff unificado: texto
// por construção, zero linha de CSS, e legível por leitor de tela sem nenhuma pele.
// Lista de linhas e não literal de gabarito: em 10/08 uma crase dentro de um `code` matou o
// parse do módulo inteiro, e aqui o conteúdo é CSS, onde crase não tem por que aparecer.
// DUAS linhas, e o número saiu da régua — não do gosto. A caixa do demo tem altura FIXA
// (ADR-0002) e o painel de prévia dentro dela dá **354px úteis**, medido em 10/08 num viewport
// de 761 (que é onde o `clamp` bate no piso). As outras quatro regiões mais os vãos gastam 238,
// então sobram 116 para a comparação inteira — cerca de duas linhas de código mais o resumo.
// Com oito linhas a composição dava 436 e o RECIBO caía abaixo da dobra, que é metade do que
// este item existe para mostrar.
// Hunk sem linha de contexto: o `source` já diz QUAL arquivo, então repetir o seletor aqui
// gastaria a altura que falta para mostrar o recibo. A ADR-0002 diz que o conserto de demo não
// é mexer na altura — é o conteúdo que cede, e cede pelo que já está dito noutro lugar.
const DIFF = [
  "-  border-radius: 22px;",
  "+  border-radius: var(--radius-card);",
].join("\n");
// O resumo é CONTADO do diff, nunca escrito ao lado dele: número escrito à mão ao lado do
// dado que ele resume é o achado I1 desta auditoria em escala de duas linhas.
const conta = marca => DIFF.split("\n").filter(l => l.startsWith(marca)).length;

// "apply records receipt" e "rollback targets the receipt". Ao contrário do `RunSession` —
// onde o recibo existe desde o aceite — aqui ele NASCE do `apply`: antes disso não houve
// mutação, e recibo de coisa que não aconteceu é registro falso. O `rollback` não o apaga:
// acrescenta a linha que aponta para ele, que é o que "targets" quer dizer.
// Uma linha e não duas — mesmo corte que o I1 fez no checkpoint, pelo mesmo motivo medido: com
// `Change` e `Applied` separados a composição dava 355 num vão de 354, e margem de 1px cede na
// primeira máquina que rasterizar a fonte um grão diferente. Quem, quando e o quê cabem numa
// linha sem perder nenhum dos três.
const recibo = state => !["applied", "rolled_back"].includes(state) ? null
  : [{term: "Change", value: "chg_4b7a · applied 09:41 by Curator"},
     ...(state === "rolled_back" ? [{term: "Rolled back", value: "09:52 · restores chg_4b7a"}] : [])];

// "test result is announced" — quem anuncia é o `Alert`, que já é `role="status"` e vira
// `role="alert"` sozinho quando é `danger`. Não há componente novo para isso.
const teste = state => state === "testing" ? {variant: "info", text: "Running 24 checks…"}
  : state === "failed" ? {variant: "danger", text: "3 of 24 checks failed."}
  : ["approved", "applied", "rolled_back"].includes(state) ? {variant: "success", text: "24 checks passed."}
  : null;

export function reviewCompare(state) {
  const e = ESTADO_REVIEW[state];
  const t = teste(state);
  const r = recibo(state);
  const acoes = reviewActions(state);
  // A ordem no DOM põe `test_result` ANTES de `decision`, e o contrato não impede: `regions`
  // é lista, não sequência. O motivo é de teclado — em `testing` as duas existem juntas, e
  // quem tabula chegaria em "Approve" antes de ler o resultado dos testes. Decidir antes da
  // evidência é exatamente o que "test result is announced" existe para evitar.
  return h("div", {style: {display: "grid", gap: "var(--space-3)", width: "min(680px,100%)"}},
    regiao("Change", h("div", {style: between},
      h("div", null,
        h("strong", null, "aurea.css"),
        // `div` e não `p`: `.hint` não zera margem, e um `p` aqui pediria estilo em linha
        // para desfazer o que o navegador põe. Menos código é não criar o problema.
        h("div", {className: "hint"}, "v12 → working copy · from run_8f21")),
      h(Status, {variant: e.variant}, e.label))),
    regiao("Comparison",
      h(CodeBlock, {language: "diff"}, DIFF),
      h("div", {className: "hint"}, `${conta("+")} added · ${conta("-")} removed`)),
    t ? regiao("Test result", h(Alert, {variant: t.variant}, t.text)) : null,
    acoes.length ? regiao("Decision", h(Toolbar, {label: "Review decision"},
      ...acoes.map(a => h(ToolbarButton, {key: a, variant: a === "reject" ? "ghost" : "outline"}, ACAO_REVIEW[a] ?? a)))) : null,
    r ? regiao("Receipt", h(DataList, {items: r})) : null);
}

// ── I3 · ResourceWorkbench — a composição do PLANO-1.0 §12 ───────────────────
// As SEIS regiões do contrato (`operationalPatterns.patterns.ResourceWorkbench.regions`
// = source · collection · preview · transfer_queue · provenance · actions). Zero componente
// novo, zero CSS novo — e desta vez metade da parte já estava construída: a fila com
// progresso, sinal de conferência e conflito é a **Parte G** inteira.
//
// Duas regiões NÃO viram `role=group`, porque já são marco nomeado por conta própria: `source`
// é o `role=tree` do `TreeView` e `collection` é o `role=table` do `Table` — mesma escolha que
// o I1 fez com o `role=log` do `MessageList`. Marco dentro de marco só acrescenta um nível
// para o leitor de tela atravessar.
const WORK = contract.operationalPatterns.patterns.ResourceWorkbench;

export const workbenchActions = state => WORK.transitions
  .filter(t => t.from === state && WORK.actions.includes(t.action))
  .map(t => t.action);

// TERCEIRO buraco do mesmo tipo, e agora dá para chamar de padrão e não de acidente: `restore`
// está em `actions` e não tem transição nenhuma, então não aparece em estado algum — como o
// `fork` do I1 e o `resolve`... não: o `resolve` daqui TEM transição (`conflict` → `resolve` →
// `transferring`), e o órfão do I2 era outro. Aqui o órfão é só o `restore`, e ele existe no
// contrato por dois outros caminhos: o comportamento "restore keeps provenance" e o evento
// `resource.restored`. Inventar a transição dentro de um preview seria decidir o contrato num
// lugar onde ninguém procura decisão.
const ACAO_WORK = {discover: "Discover", transfer: "Transfer", pause: "Pause", resume: "Resume",
  verify: "Verify", resolve: "Resolve", restore: "Restore"};

// Nenhum dos oito é estado universal (Parte J) — conferido contra a união do `pure.tsx`.
// `paused` é o que mais parece, e não é: os três "esperando" universais são espera por AGENTE
// EXTERNO (pessoa, aprovação, dependência), e aqui quem pausou foi quem está olhando.
const ESTADO_WORK = {
  idle: {variant: "neutral", label: "Idle"},
  discovering: {variant: "running", label: "Discovering"},
  transferring: {variant: "running", label: "Transferring"},
  paused: {variant: "warning", label: "Paused"},
  verifying: {variant: "running", label: "Verifying"},
  conflict: {variant: "warning", label: "Conflict"},
  completed: {variant: "success", label: "Completed"},
  failed: {variant: "danger", label: "Failed"},
};

// A fila em VOO, por estado. O número é um só e serve os dois consumidores da cláusula
// "progress announces percent and phase": o `aria-valuenow` da barra e a frase ao lado dela.
// Escrever "62" na barra e "62%" no texto à mão são duas verdades sobre o mesmo fato — é o
// achado I1 desta auditoria, e aqui ele custaria a acessibilidade junto.
const FILA = {
  idle: null, discovering: null,
  transferring: {pct: 62, fase: "Transferring"},
  paused: {pct: 62, fase: "Paused"},
  verifying: {pct: 100, fase: "Verifying checksum"},
  conflict: {pct: 62, fase: "Waiting on a conflict"},
  completed: {pct: 100, fase: "Completed"},
  failed: {pct: 38, fase: "Failed"},
};

// "restore keeps provenance" — a procedência não depende de estado nenhum: ela existe desde a
// descoberta e sobrevive a tudo, inclusive à restauração. Por isso é lista fixa e não função.
// "resume validates checksum" mora aqui também: a soma é o que o `resume` confere, então ela
// precisa estar na tela ANTES de alguém retomar, não depois.
const PROCEDENCIA = [
  {term: "Origin", value: "Shared workspace · discovered 09:04"},
  {term: "Checksum", value: "sha256 9f2c…4be1"},
];

export function resourceWorkbench(state) {
  const e = ESTADO_WORK[state];
  const fila = FILA[state];
  const acoes = workbenchActions(state);
  // Duas colunas na primeira faixa porque é o que um workbench É — a árvore de onde vem, e a
  // lista do que tem lá dentro, lado a lado. Empilhá-las gastaria ~110px de altura num vão de
  // 354 que precisa acomodar SEIS regiões; o I1 mostrou o que acontece quando não cabe.
  // 880 e não os 680 dos outros blocos, e o número saiu de uma medição, não de gosto: o core
  // declara `.table { min-width:720px }` (linha 460), então uma tabela numa coluna mais estreita
  // que isso TRANSBORDA. Medido em 10/08: com o bloco a 680 e a grade `1fr 2fr`, a coluna da
  // tabela dava 445px e a coluna `State` — que é onde o `Status` de cada recurso mora — ficava
  // FORA da tela, cortada. O painel do demo mede 904 e sobram 856 depois do `padding`, então a
  // coluna da árvore fica em `7rem` (112px): 856 - 112 - 12 de vão = **732**, que é o primeiro
  // valor acima dos 720 exigidos. Com 140px a tabela ainda vazava 16px da própria coluna —
  // invisível nesta largura, e é exatamente o tipo de coisa que quebra na próxima.
  return h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(880px,100%)"}},
    h("div", {style: {display: "grid", gridTemplateColumns: "7rem 1fr", gap: "var(--space-3)", alignItems: "start"}},
      // Rótulos curtos, e é medição e não estilo: `.tree-label` corta com reticências (mesmo
      // desenho do `.sidebar-label`), e num nó filho sobram 48px. "Typography" pede 73 e saía
      // "Typo…". Alargar a coluna não é saída: a tabela já exige 720 dos 856 disponíveis, e os
      // 137 que o rótulo inteiro pediria deixariam a tabela 13px curta. Quem cede é o conteúdo.
      h(TreeView, {label: "Workspace", defaultExpandedIds: ["brand"], items: [
        {id: "brand", label: "Brand", children: [
          {id: "mark", label: "Marks"},
          {id: "type", label: "Type"}]}]}),
      h(Table, {caption: "Resources"},
        h("thead", null, h("tr", null, h("th", null, "Name"), h("th", null, "Size"), h("th", null, "State"))),
        h("tbody", null,
          h("tr", null, h("td", null, "brand-mark.svg"), h("td", null, "12 KB"),
            h("td", null, h(Status, {variant: e.variant}, e.label))),
          h("tr", null, h("td", null, "wordmark.svg"), h("td", null, "9 KB"),
            h("td", null, h(Status, {variant: "success"}, "Verified")))))),
    // "conflict requires preview": é AQUI que o conflito se explica, e é por isso que ele não
    // vira só um recado na fila. Quem vai escolher entre substituir e manter os dois precisa
    // ver o que está prestes a sobrescrever, no mesmo lugar em que vê o que chegou.
    // Prévia e procedência lado a lado, e a razão é medida: empilhadas a composição dava 365
    // num vão de 354 e o painel ROLAVA. As duas falam do MESMO recurso selecionado — o que ele
    // é, e de onde veio —, então a segunda coluna não é economia disfarçada de desenho.
    // Em `conflict` a prévia cresce e passa a mandar na faixa; é o único estado em que isso
    // acontece, e ali a barra de ações tem UM botão só, então sobra altura para ela.
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", alignItems: "start"}},
      regiao("Preview",
        h("strong", null, "brand-mark.svg"),
        h("div", {className: "hint"}, "SVG · 12 KB · 512×512"),
        state === "conflict"
          ? h(Alert, {variant: "warning", title: "Name already taken"}, "Shared/Brand/Marks holds a 9 KB file with this name, changed 11:02.")
          : null),
      regiao("Provenance", h(DataList, {items: PROCEDENCIA}))),
    regiao("Transfer queue", fila
      ? h("div", null,
          // A frase carrega FASE e PORCENTAGEM, e é ela que cumpre a cláusula: barra sozinha
          // não é anúncio, é desenho — quem lê por leitor de tela precisa do texto.
          h("div", {style: between}, h("span", null, "brand-mark.svg"),
            h("span", {className: "hint"}, `${fila.fase} · ${fila.pct}%`)),
          h(Progress, {value: fila.pct, label: `${fila.fase} brand-mark.svg`}))
      : h("div", {className: "hint"}, "Nothing in flight.")),
    acoes.length ? regiao("Actions", h(Toolbar, {label: "Workbench actions"},
      ...acoes.map(a => h(ToolbarButton, {key: a, variant: a === "pause" ? "ghost" : "outline"}, ACAO_WORK[a] ?? a)))) : null);
}

// ── I4 · AnalyticsWorkbench — a composição do PLANO-1.0 §12 ──────────────────
// OITO regiões, o dobro do I2 (`applicationPatterns.patterns.AnalyticsWorkbench.regions`
// = kpis · time_range · filters · segments · visualization · data_table · annotations · export).
// Primeira composição da Parte I que vem de `applicationPatterns` e não de `operationalPatterns`.
//
// E a primeira em que a DERIVAÇÃO quase não tem o que derivar: dos oito nomes em `actions`,
// SETE não têm transição nenhuma (`change_range`, `filter`, `segment`, `compare`, `drilldown`,
// `annotate`, `export`). Não é buraco como o `fork` do I1 — é a natureza do padrão: mudar o
// período não muda o ESTADO da tela, refaz a consulta. As regiões aqui SÃO os controles, e é
// por isso que este contrato é o único dos quatro sem região `actions`.
// Sobra `refresh`, e ele mora com `time_range`: quem é dono da atualidade é quem escolhe o
// período, e é o que "export records scope and freshness" amarra.
const ANALYTICS = contract.applicationPatterns.patterns.AnalyticsWorkbench;

export const analyticsActions = state => ANALYTICS.transitions
  .filter(t => t.from === state && ANALYTICS.actions.includes(t.action))
  .map(t => t.action);

// DOIS dos sete estados são UNIVERSAIS (Parte J, ADR-0018) — `partial` e `stale` estão na união
// do `pure.tsx`. Entram pelo eixo `state` e trazem a frase que o vocabulário já publica, como os
// três "esperando" do I1: a composição não inventa texto para eles. Os outros cinco são condição
// desta tela e trazem rótulo próprio.
const ESTADO_ANALYTICS = {
  loading: {variant: "neutral", label: "Loading"},
  ready: {variant: "success", label: "Up to date"},
  empty: {variant: "neutral", label: "No data"},
  partial: {state: "partial"},
  refreshing: {variant: "running", label: "Refreshing"},
  stale: {state: "stale"},
  error: {variant: "danger", label: "Could not load"},
};

// "updates are announced without stealing focus" — quem anuncia é o `Alert` (`role="status"`, e
// `role="alert"` sozinho quando é `danger`). Anunciar por papel é o oposto de mover o foco: o
// leitor de tela lê no fim da frase corrente, e quem está digitando não é interrompido.
const RECADO = {
  loading: {variant: "info", texto: "Loading the last 30 days…"},
  empty: {variant: "info", texto: "No runs in the selected range."},
  refreshing: {variant: "info", texto: "Refreshing — the numbers below are the previous read."},
  error: {variant: "danger", texto: "The query failed. The numbers below are the last good read."},
};

const SERIE = [{day: "Mon", runs: 128}, {day: "Tue", runs: 142}, {day: "Wed", runs: 119},
  {day: "Thu", runs: 167}, {day: "Fri", runs: 158}, {day: "Sat", runs: 74}, {day: "Sun", runs: 61}];

// "visualization always has a tabular alternative" — a tabela é REGIÃO IRMÃ, não uma aba. Abas
// foram medidas em 10/08 e recusadas por um motivo que não é de gosto: o Base UI **não
// renderiza o painel inativo** no HTML estático, então a tabela sumiria da página gerada e do
// DOM — a alternativa deixaria de existir exatamente para quem depende dela.
//
// UMA série, e é decisão e não economia: "color is not the sole series distinction" só se cumpre
// de verdade quando cada série tem nome em texto. Com uma série não há o que distinguir por cor,
// e o nome dela é o cabeçalho da coluna da tabela — que é o que o teste cobra.
const SERIE_NOME = "Runs";
// Exportado para o teste poder cobrar a cláusula com NÚMERO: a alternativa tabular tem de ter
// tantas linhas quantos pontos o gráfico desenha, e a série tem de aparecer como COLUNA.
export const analyticsSeries = {nome: SERIE_NOME, pontos: SERIE};

export function analyticsWorkbench(state) {
  const e = ESTADO_ANALYTICS[state];
  const r = RECADO[state];
  const acoes = analyticsActions(state);
  const vazio = state === "empty";
  // `--chart-h` em 7rem: o gráfico do core mede 220px por default, e com ele a composição
  // passava do vão do painel antes mesmo da tabela entrar. A válvula existe no core desde este
  // item, no mesmo idioma de `--qr-size` e `--datagrid-max-h`. `7rem` porque é a altura do KPI
  // ao lado — a faixa mede o maior dos dois, então passar disso é altura comprada e não usada.
  return h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(880px,100%)", "--chart-h": "7rem"}},
    // Os quatro controles numa faixa só. Cada um é a sua região do contrato — não é um
    // agrupamento de conveniência, é o que cabe numa caixa de altura fixa (ADR-0002).
    // `--space-2` e sem piso de largura nos dois `Select`: com a escala de letra da 0.8.8 a
    // faixa pedia 866 num vão de 824 e o Export caía para a segunda linha (+32px na caixa). O
    // `Select` da 0.8.10 abraça o próprio texto, então o `9rem` de antes só somava vazio.
    h("div", {style: {...row, gap: "var(--space-2)"}},
      regiao("Time range",
        h("div", {style: row},
          h(SegmentedControl, {label: "Time range", value: "30d", onChange: () => {}, items: [
            {value: "7d", label: "7d"}, {value: "30d", label: "30d"}, {value: "90d", label: "90d"}]}),
          h(Status, e.state ? {state: e.state} : {variant: e.variant}, e.label),
          ...acoes.map(a => h(Button, {key: a, variant: "outline", size: "sm"}, a === "refresh" ? "Refresh" : a)))),
      regiao("Filters", h("div", null,
        h(Select, {defaultValue: "all", "aria-label": "Space"},
          h("option", {value: "all"}, "All spaces"), h("option", {value: "brand"}, "Brand")))),
      regiao("Segments", h("div", null,
        h(Select, {defaultValue: "all", "aria-label": "Segment"},
          h("option", {value: "all"}, "All agents"), h("option", {value: "new"}, "First run")))),
      // "export records scope and freshness" — os dois no RÓTULO, não numa dica ao lado: quem
      // clica precisa saber o que vai sair antes de sair, e um recibo depois chega tarde.
      // Rótulo curto por MEDIÇÃO: com "30 days" a faixa somava 867 numa largura de 856 e o
      // Export caía para uma segunda linha, que custava 39px de altura num vão que não tem.
      // `30d` é o mesmo rótulo que o seletor de período usa três centímetros à esquerda.
      //
      // E "as of" CAIU em 20/08/2026, porque a folga de 10px acima não era folga: quando o
      // ADR-0035 devolveu ao painel flutuante as duas margens que ele perdia, a coluna do
      // conteúdo encolheu 32px, a faixa deixou de caber e o Export foi sozinho para a segunda
      // linha — 43px de altura numa caixa que tinha 23 de sobra. O `catalog-sweep` pegou.
      // Medido em 872px de painel: com "as of" a faixa PEDE 846 num vão de 824; sem, pede 789.
      // A cláusula continua cumprida — o escopo é `30d` e a atualidade é `09:41` —, e o teste
      // que a cobra lê os dois por padrão (`\d+d` e `\d{1,2}:\d{2}`), não pela preposição.
      // A folga passou de 10px para 35px, que é o ponto: 10px é o tamanho de qualquer mudança
      // de layout futura, e foi exatamente uma dessas que quebrou isto aqui.
      regiao("Export", h(Button, {variant: "outline", size: "sm", leadingIcon: "download"},
        "Export · 30d · 09:41"))),
    r ? h(Alert, {variant: r.variant}, r.texto) : null,
    // Os universais falam pela frase do vocabulário: nada de texto inventado aqui.
    e.state ? h(Alert, {state: e.state}) : null,
    h("div", {style: {display: "grid", gridTemplateColumns: "minmax(9rem,1fr) 3fr", gap: "var(--space-3)", alignItems: "start"}},
      regiao("Indicators",
        h(KPI, {label: "Runs", value: "849", trend: "+12%"})),
      // A região `visualization` É o `role="group"` do próprio `Chart` — ele já se nomeia com o
      // `label`. Embrulhar num segundo grupo com o MESMO nome criaria dois marcos homônimos, e
      // `getByRole` acharia os dois. Mesma escolha do `TreeView` no I3.
      vazio
        ? regiao("Runs per day", h(EmptyState, {icon: "chart--line", title: "Nothing to plot", titleAs: "h2"}))
        : h(Chart, {label: "Runs per day"},
            h(AreaChart, {data: SERIE},
              h(CartesianGrid, {vertical: false}),
              h(XAxis, {dataKey: "day", tickLine: false, axisLine: false}),
              h(Area, {dataKey: "runs", name: SERIE_NOME, stroke: "var(--chart-2)",
                fill: "var(--chart-2)", fillOpacity: 0.15})))),
    // `DataGrid` e não `Table`, e a razão é a cláusula, não a estética: "visualization always
    // has a tabular alternative". Uma tabela com 2 das 7 linhas do gráfico é um RESUMO, não uma
    // alternativa — quem não enxerga a curva ficaria com menos dado, que é o defeito inteiro.
    // As sete linhas existem no DOM; quem limita a caixa é `--datagrid-max-h`, a válvula que o
    // F6 criou, com o cabeçalho fixo do mesmo item. Rolar a TABELA é o que a tabela faz; o que
    // a ADR-0002 proíbe é rolar para ver o EXEMPLO, e as oito regiões estão todas visíveis.
    // O nome é distinto do nome do gráfico de propósito: dois marcos homônimos na mesma página
    // são dois destinos iguais para quem navega por marco.
    // `9rem` e não um número redondo qualquer: a célula mede `--row-h` (48px), então
    // 48 de cabeçalho + 2 linhas inteiras = 144 = 9rem. Com 7.5rem a caixa cortava a segunda
    // linha ao meio, e meia linha lê como defeito, não como "há mais abaixo".
    h("div", {style: {"--datagrid-max-h": "9rem"}},
      h(DataGrid, {label: "Runs per day, as numbers", stickyHeader: true,
        data: SERIE.map(d => ({day: d.day, runs: String(d.runs)})),
        columns: [{accessorKey: "day", header: "Day"}, {accessorKey: "runs", header: SERIE_NOME}]})),
    regiao("Annotations", h("div", {className: "hint"},
      "2 annotations · Thu 09:20 model swap · Sat 00:00 weekend")));
}

// ── I5 · TransactionFlow — a composição do PLANO-1.0 §12 ─────────────────────
// As SETE regiões do contrato (`applicationPatterns.patterns.TransactionFlow.regions`
// = items · amounts · payment · review · status · receipt · reversal). Zero componente novo,
// zero CSS novo. Segunda composição vinda de `applicationPatterns`, depois do I4.
//
// E a primeira em que NENHUM estado tem as sete regiões — medido, não escolhido: `review` é o
// que se lê ANTES do commit e `receipt`/`reversal` só existem DEPOIS dele. As duas metades não
// coexistem em nenhum dos nove estados, porque a transação ou ainda não aconteceu ou já
// aconteceu. `settled` é o máximo — SEIS — e é o que a página publica.
const TX = contract.applicationPatterns.patterns.TransactionFlow;

export const transactionActions = state => TX.transitions
  .filter(t => t.from === state && TX.actions.includes(t.action))
  .map(t => t.action);

// MEDIDO em 11/08/2026, e é o mesmo tipo de buraco que o I1 (`fork`), o I2 (`resolve`) e o I3
// (`restore`) registraram — quarta vez, e agora nos DOIS sentidos de uma vez:
//   · `create`, `review` e `reconcile` estão em `actions` e não têm transição nenhuma, então
//     não aparecem em estado algum. Inventar a transição dentro de um preview seria decidir o
//     contrato num lugar onde ninguém procura decisão.
//   · `submit`, `process`, `settle`, `fail` e `dispute` são o contrário: transição sem estar em
//     `actions`. Aqui isso é a VERDADE do domínio e não descuido — quem liquida é o adquirente,
//     quem falha é a rede, e quem contesta é o titular do cartão pelo emissor, nunca esta tela.
// Sobram três ações de pessoa nos nove estados: `cancel`, `authorize` e `refund`.
const ACAO_TX = {create: "Create", review: "Review", authorize: "Authorize", cancel: "Cancel",
  refund: "Refund", reconcile: "Reconcile"};

// UM dos nove é universal (Parte J, ADR-0018), e ele entra pelo nome do CONCEITO e não pelo do
// contrato: `requires_action` é literalmente "espera que alguém aja" — o passo de autenticação
// que o banco emissor devolve —, que é o `waiting_user` do vocabulário. Escrever "Requires
// action" ao lado dele daria dois textos para o mesmo estado, que é o defeito que a Parte J
// existe para impedir. Os outros oito são condição desta transação e trazem rótulo próprio.
const ESTADO_TX = {
  draft: {variant: "neutral", label: "Draft"},
  pending: {variant: "info", label: "Pending"},
  processing: {variant: "running", label: "Processing"},
  requires_action: {state: "waiting_user"},
  settled: {variant: "success", label: "Settled"},
  failed: {variant: "danger", label: "Failed"},
  cancelled: {variant: "neutral", label: "Cancelled"},
  refunded: {variant: "warning", label: "Refunded"},
  disputed: {variant: "warning", label: "Disputed"},
};

// ── o dinheiro ───────────────────────────────────────────────────────────────
// PESQUISADO em 11/08/2026 pelo passo 4 do BUILDING.md, porque aqui não havia anatomia para
// copiar: das dezesseis referências, NENHUMA tem composição de transação (medido — só o
// template `checkout` do MUI, mais um banner de cobrança no Langfuse e ícones de bandeira no
// Untitled UI). O registro completo está no REFERENCES.md; o que decidiu o código é isto:
//
// 1. VALOR É INTEIRO EM UNIDADE MENOR. `Decimal` do TC39 está em stage 1 e `Amount` em stage 2
//    — em 08/2026 não existe decimal nativo em JavaScript, então centavo inteiro segue sendo a
//    representação correta. A soma acontece em INTEIRO e a divisão por 100 só na formatação.
// 2. QUEM FORMATA É `Intl.NumberFormat`, com `currencyDisplay:"code"`. "$" é ambíguo entre
//    quatro moedas, e a cláusula do contrato é "amount CURRENCY fees … appear before commit":
//    com o código a moeda aparece em cada linha, sem uma linha extra dizendo qual é.
// 3. O TOTAL É SOMADO, NUNCA ESCRITO. É o achado I1 desta auditoria com dinheiro em cima — e a
//    referência mostra o custo: o `checkout` do MUI escreve `$134.98`, `$9.99` e `$144.97` como
//    literais no Review, e o total ainda uma quarta vez no Checkout (`activeStep >= 2 ?
//    '$144.97' : '$134.98'`). Os quatro batem hoje; mudar o preço de um item faz o total mentir.
// QUANTIDADE E UNITÁRIO SEPARADOS, e o total da linha é DERIVADO — anatomia do `order-summary`
// do tool-ui (`lineTotal = item.unitPrice * quantity`, com a quantidade na descrição). A primeira
// versão daqui escrevia `{label: "Professional plan · 2 seats", cents: 4800}`: quem lê não sabe
// se 48,00 é o assento ou os dois, e conta de dinheiro ambígua é a que gera contestação. Agora o
// rótulo mostra `2 × USD 24.00` e o valor é o total da linha, então a conta se audita na tela.
const MOEDA = "USD";
const ITENS = [
  {label: "Professional plan", qty: 2, unit: 2400},
  {label: "Onboarding session", qty: 1, unit: 15000},
].map(i => ({...i, cents: i.qty * i.unit}));
const TAXAS = [{label: "Processing fee", cents: 174}];
const soma = xs => xs.reduce((t, x) => t + x.cents, 0);
const SUBTOTAL = soma(ITENS);
const TOTAL = SUBTOTAL + soma(TAXAS);
const dinheiro = new Intl.NumberFormat("en-US", {style: "currency", currency: MOEDA, currencyDisplay: "code"});
const valor = cents => dinheiro.format(cents / 100);
// Exportado para o teste poder cobrar a cláusula com NÚMERO, no precedente do `analyticsSeries`
// do I4: o total no DOM tem de ser a soma dos itens mais as taxas, formatada por esta função.
export const transactionAmounts = {currency: MOEDA, items: ITENS, fees: TAXAS,
  subtotal: SUBTOTAL, total: TOTAL, format: valor};

// "idempotent submission prevents duplicates" — a chave viaja no recibo porque é ela que
// responde à única pergunta que importa depois de um duplo clique: *foi cobrado duas vezes?*
// O cabeçalho `Idempotency-Key` é prática de mercado e está em rascunho IETF
// (draft-ietf-httpapi-idempotency-key-header-07, standards track, ainda NÃO é RFC — pesquisado
// em 11/08/2026). O nome aqui é o dele, para o consumidor não inventar um terceiro.
const CHAVE = "idem_7f3c9a";

// "method by reference": o método é um RÓTULO de algo guardado no provedor, e esta composição
// não tem campo de cartão — nem número, nem CVV, nem validade. Não é preferência de desenho: o
// PCI DSS 4.0.1 (vigente desde 04/2025) tira a página do comerciante do escopo justamente
// quando os campos são do provedor (iframe ou redirecionamento); o template `checkout` do MUI
// pede os quatro campos no próprio formulário, com um "remember credit card details", e é
// exatamente a parte que NÃO entra. A regra já estava escrita em `patterns/commerce_finance.md`
// — o que a pesquisa de 11/08 acrescentou foi a verificação de que ela segue valendo.
const CARTAO = "Visa ending 4242";
// Duas linhas curtas, e o segundo termo é a REGRA dita como dado: quem guarda o cartão é o
// provedor, e o que esta tela tem é o identificador dele. Medido em 11/08 por OLHAR a imagem —
// "Visa ending 4242 · saved with the provider" numa linha só quebrava em duas e desalinhava a
// faixa inteira; e "Reference: pm_3e81" sozinho não dizia de quem era a referência.
const PAGAMENTO = [
  {term: "Method", value: CARTAO},
  {term: "Stored by", value: "Payment provider · pm_3e81"},
];

// O recibo IMUTÁVEL: existe em todo resultado terminal ("immutable receipt follows every
// terminal result") e sobrevive ao estorno e à contestação ("reversal and dispute preserve the
// original transaction"). `disputed` não é terminal no contrato e mesmo assim tem recibo — ele
// parte de `settled`, que já o tinha, e apagá-lo ali seria a prova sumindo justamente quando
// alguém a contesta.
const COM_RECIBO = [...TX.terminalStates, "disputed"];
const RECIBO_TX = [
  {term: "Receipt", value: "rcp_5d81 · 09:41"},
  {term: "Idempotency key", value: CHAVE},
];

// A REVERSÃO não apaga nada: acrescenta a linha que aponta para o recibo original, que é o
// mesmo desenho que o `rollback` do I2. Em `settled` é a consequência do estorno ANTES de
// alguém pedi-lo — a mesma cláusula que rege a revisão, aplicada à saída de dinheiro no outro
// sentido; em `refunded` e `disputed` é o registro do que aconteceu.
// A frase de `settled` nasceu de OLHAR a imagem: sem ela a região era uma barra com um botão e
// nenhuma palavra, e barra sem texto não diz o que vai acontecer ao ser clicada.
const REVERSAO = {
  settled: `A refund returns ${valor(TOTAL)} to ${CARTAO} and keeps rcp_5d81.`,
  refunded: "rfd_2a90 · reverses rcp_5d81",
  disputed: "dsp_11c7 · under review · rcp_5d81 stands",
};

// "status updates use live regions" — e o `Status` NÃO é live region: é um `<span class=status>`
// com ponto e rótulo, medido no fonte. Quem anuncia é o `Alert`, que já é `role="status"` e vira
// `role="alert"` sozinho quando é `danger` — mesma escolha do I4 para "updates are announced
// without stealing focus". Os dois convivem porque respondem a perguntas diferentes: o `Status`
// diz em que estado a transação ESTÁ, o `Alert` diz o que acabou de acontecer.
// `draft` fica de fora, e o critério sai do contrato: é o `initialState`, onde nada aconteceu
// ainda. Anunciar "está em rascunho" seria interromper o leitor de tela para dizer que nada
// mudou.
const ANUNCIO = {
  pending: {variant: "info", texto: "Submitted. Waiting for the provider."},
  processing: {variant: "info", texto: "The charge is being processed."},
  requires_action: {variant: "info", texto: "The bank asked for one more step before it can charge."},
  settled: {variant: "success", texto: `Charged ${valor(TOTAL)}. The receipt below is final.`},
  failed: {variant: "danger", texto: "The charge was declined. Nothing was taken."},
  cancelled: {variant: "info", texto: "Cancelled before any charge."},
  refunded: {variant: "success", texto: `Refunded ${valor(TOTAL)} to the same card.`},
  disputed: {variant: "warning", texto: "The cardholder opened a dispute. The original charge stands."},
};

// As três ações de pessoa moram na REGIÃO QUE ELAS AFETAM, e não numa barra própria: este
// contrato é o segundo (depois do I4) que não tem região `actions`, e a saída do I2 vale aqui —
// `refund` é reversão e mora em `reversal`; `cancel` e `authorize` decidem sobre um valor que
// ainda não foi cobrado, e moram em `review`, ao lado da frase que diz a consequência. O teste
// soma os botões das DUAS barras e compara com a derivação: ação nova no contrato que não caiba
// em nenhuma das duas reprova, em vez de desaparecer da tela em silêncio.
const REVERSOES = ["refund"];
const acoesRevisao = state => transactionActions(state).filter(a => !REVERSOES.includes(a));
const acoesReversao = state => transactionActions(state).filter(a => REVERSOES.includes(a));

const barra = (label, acoes) => h(Toolbar, {label},
  ...acoes.map(a => h(ToolbarButton, {key: a, variant: a === "cancel" ? "ghost" : "outline"}, ACAO_TX[a] ?? a)));

export function transactionFlow(state) {
  const e = ESTADO_TX[state];
  const a = ANUNCIO[state];
  const recibo = COM_RECIBO.includes(state);
  const reversao = REVERSAO[state];
  const revisao = acoesRevisao(state);
  const estorno = acoesReversao(state);
  // A consequência é a cláusula "amount currency fees and consequences appear before commit", e
  // o número dentro dela sai de `valor(TOTAL)` — nunca de uma string ao lado. Ela existe
  // enquanto não há recibo, isto é, enquanto o resultado não aconteceu; depois disso não é
  // revisão, é história, e a história está no recibo.
  const consequencia = state === "processing"
    ? `${CARTAO} is being charged ${valor(TOTAL)}. Retrying with the same key does not charge twice.`
    : `${CARTAO} will be charged ${valor(TOTAL)} once. Retrying with the same key does not charge twice.`;
  // 680 e não os 880 do I3/I4: aqui não há `.table` (`min-width:720px`) nem gráfico. Duas
  // colunas de `.data-list` porque são seis regiões num vão útil de 354px — o I1 mostrou o que
  // acontece quando não cabe.
  //
  // SEM `tabular-nums`, e a ausência é MEDIDA — porque eu o tinha posto aqui antes de medir.
  // O `order-summary` do tool-ui põe `tabular-nums` em cada valor, e eu copiei. Medido no
  // navegador em 11/08/2026, largura dos dez dígitos por fonte:
  //   IBM Plex Sans → 1 largura com e sem a propriedade   (no-op)
  //   Segoe UI, o primeiro fallback → 1 e 1               (no-op)
  //   `sans-serif` genérico → 2 sem, 1 com                (ajudaria, só no TERCEIRO fallback)
  //   IBM Plex Serif → 2 sem, 2 com                       (a fonte não tem o recurso)
  // Ou seja: na pilha que a Aurea carrega a propriedade não muda um pixel, e regra que existe e
  // não faz nada é exatamente o que o `skin.spec` foi feito para reprovar. As cinco declarações
  // que o core já tem (`.chart-tooltip b`, `.calendar td button`, `.file-size`,
  // `.metric-total strong`, `.model-usage-value`) são no-op pelo mesmo motivo — valem como
  // seguro se as duas primeiras fontes falharem, e não como alinhamento que alguém vá ver.
  //
  // E o defeito que eu achei na imagem NUNCA foi este: o degrau de 74px entre os valores era o
  // `max-content` de duas `.data-list` independentes, resolvido pelas duas faixas acima. Levar
  // `font-variant-numeric` da referência era TIPOGRAFIA, que é o que o `BUILDING.md` §1 lista
  // entre as coisas que nunca se extraem. A trava existia; eu passei por cima dela.
  return h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(680px,100%)"}},
    regiao("Status", h("div", {style: between},
      h("strong", null, "tx_9c4e · Invoice #1043"),
      h(Status, e.state ? {state: e.state} : {variant: e.variant}, e.label)),
      a ? h(Alert, {variant: a.variant}, a.texto) : null),
    // DUAS FAIXAS de duas colunas, e não duas colunas de duas listas — a diferença saiu de OLHAR
    // a imagem. Empilhadas, `items` e `amounts` são duas `.data-list` independentes, cada uma com
    // a sua coluna de termo em `max-content`: os valores saíam em x diferentes (74px de degrau
    // entre "USD 150.00" e "USD 198.00") e uma pilha de dinheiro desalinhada lê como defeito.
    // Lado a lado o olho compara na horizontal e não há degrau no caminho da leitura. Custa +1
    // vão de `--space-2` na altura, e a alternativa — coluna compartilhada de verdade — pediria
    // `subgrid` no `.data-list` do core, que é mudança de infraestrutura para todos os DataList.
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", alignItems: "start"}},
      regiao("Items", h(DataList, {items: ITENS.map(i => ({
        term: i.qty > 1 ? `${i.label} · ${i.qty} × ${valor(i.unit)}` : i.label,
        value: valor(i.cents)}))})),
      // Subtotal, taxa e total na MESMA lista, porque é uma conta só: quem lê de cima para baixo
      // precisa ver de onde o total veio sem atravessar uma divisória.
      regiao("Amounts", h(DataList, {items: [
        {term: "Subtotal", value: valor(SUBTOTAL)},
        ...TAXAS.map(t => ({term: t.label, value: valor(t.cents)})),
        {term: "Total", value: h("strong", null, valor(TOTAL))}]}))),
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", alignItems: "start"}},
      regiao("Payment", h(DataList, {items: PAGAMENTO})),
      recibo ? regiao("Receipt", h(DataList, {items: RECIBO_TX})) : null),
    recibo ? null : regiao("Review",
      h("div", {className: "hint"}, consequencia),
      revisao.length ? barra("Review decision", revisao) : null),
    reversao || estorno.length ? regiao("Reversal",
      reversao ? h("div", {className: "hint"}, reversao) : null,
      estorno.length ? barra("Reversal", estorno) : null) : null);
}

// ── I6 · DeviceControl — a composição do PLANO-1.0 §12 ───────────────────────
// As SETE regiões do contrato (`applicationPatterns.patterns.DeviceControl.regions`
// = fleet · device_detail · telemetry · commands · calibration · alerts · audit). Zero componente
// novo, zero CSS novo — e a região `fleet` é o `HealthMatrix` que a Parte H construiu.
//
// Este contrato NÃO TEM estado terminal (`terminalStates: []`), e é o primeiro assim: um
// dispositivo não termina, ele fica. Por isso não há recibo aqui como no I5 — o que persiste é a
// região `audit`, que é o registro de quem mexeu.
const DEV = contract.applicationPatterns.patterns.DeviceControl;

export const deviceActions = state => DEV.transitions
  .filter(t => t.from === state && DEV.actions.includes(t.action))
  .map(t => t.action);

// QUATRO órfãos em `actions` sem transição — `select`, `command`, `confirm`, `pause_live` —, e
// aqui eles NÃO são buraco de contrato como o `fork` do I1: são ações que mudam a UI e não o
// dispositivo. Selecionar não liga nada; pausar o fluxo ao vivo não muda o equipamento; e
// `command`/`confirm` são o par que a cláusula "unsafe actions require gated confirmation" exige
// — pedir, e depois confirmar. Cada um mora na sua região, que é a saída que o I5 abriu.
const ACAO_DEV = {select: "Select", command: "Send command", confirm: "Confirm",
  calibrate: "Calibrate", update: "Update firmware", acknowledge: "Acknowledge", pause_live: "Pause live"};

// Nenhum dos oito é estado universal (Parte J) — conferido contra a união do `pure.tsx`.
// `offline` é o que mais parece, e NÃO é: o universal `offline` fala da nossa conexão com o
// servidor ("No connection. This was loaded earlier."); aqui é o DISPOSITIVO que caiu, e quem
// está lendo segue online. Trocar um pelo outro diria ao operador que o problema é dele.
const ESTADO_DEV = {
  unknown: {variant: "neutral", label: "Unknown"},
  online: {variant: "success", label: "Online"},
  degraded: {variant: "warning", label: "Degraded"},
  offline: {variant: "neutral", label: "Offline"},
  updating: {variant: "running", label: "Updating"},
  calibrating: {variant: "running", label: "Calibrating"},
  alert: {variant: "danger", label: "Alert"},
  error: {variant: "danger", label: "Error"},
};

const DISPOSITIVO = [
  {term: "Model", value: "Flow 200 · dev_7c21"},
  {term: "Firmware", value: "2.4.1 · 2.5.0 available"},
];

// A FROTA é o `HealthMatrix` (H.d). Os estados dele são os da saúde de serviço, não os do
// dispositivo — e o mapeamento é explícito de propósito: `alert` e `error` são `down`, porque
// para quem olha a frota a diferença entre "alarmou" e "quebrou" é o detalhe, não a linha.
const SAUDE_DEV = {unknown: "unknown", online: "operational", degraded: "degraded",
  offline: "down", updating: "maintenance", calibrating: "maintenance", alert: "down", error: "down"};

// TELEMETRIA — "telemetry timestamp and confidence are visible", e a palavra "confidence" veio do
// contrato sem dizer como se escreve. PESQUISADO em 11/08/2026, porque nenhuma das dezesseis
// referências tem UI de sensor (medido: `telemetry` nelas é analytics de produto ou
// OpenTelemetry de tracing, não leitura de equipamento): o domínio tem vocabulário próprio e é o
// do OPC UA / OPC DA — a qualidade de um valor é **Good · Uncertain · Bad**, e há códigos para o
// caso exato desta tela (`UncertainLastUsableValue`: "o que atualizava isto parou de atualizar").
// Inventar "high confidence" seria criar um terceiro vocabulário num domínio que já tem um.
// Registro e fontes no REFERENCES.md.
const LEITURAS = {
  vivo: [
    {nome: "Flow", valor: "18.4 L/min", hora: "09:41:22", qualidade: "Good"},
    {nome: "Head temperature", valor: "71.8 °C", hora: "09:41:22", qualidade: "Uncertain"},
  ],
  // Pausado ou fora do ar, o valor é o ÚLTIMO utilizável e a hora congela — é o que o timestamp
  // existe para contar. A qualidade cai para `Uncertain` nos dois, e não para `Bad`: o número
  // ainda serve, só não é de agora. Essa distinção é a do padrão, não minha.
  parado: [
    {nome: "Flow", valor: "18.4 L/min", hora: "09:41:22", qualidade: "Uncertain · last usable"},
    {nome: "Head temperature", valor: "71.8 °C", hora: "09:41:22", qualidade: "Uncertain · last usable"},
  ],
};

// CALIBRAÇÃO — "calibration retains defaults and rollback": o default fica escrito ao lado do
// valor atual, e o botão de voltar existe sempre. Sem os dois, calibrar é uma via de mão única.
const CALIBRACAO = {atual: "+0.4 °C", padrao: "0.0 °C"};

// O portão de comando inseguro. `HumanApproval` já é o portão desta casa (I1), e ele traz risco,
// descrição e detalhes — que é exatamente "commands show target scope and expected effect" mais
// "unsafe actions require gated confirmation" numa peça só. Anatomia conferida no
// `dialog-confirm.tsx` do OpenStatus, que nomeia o tipo de confirmação e mantém o portão ABERTO
// no erro para a ação poder ser repetida.
const ESCOPO = "Pump A3 only · 1 of 3 devices";
const EFEITO = "Firmware 2.5.0 · the pump stops for ~40 s, then resumes.";

export function deviceControl(state) {
  const e = ESTADO_DEV[state];
  const acoes = deviceActions(state);
  const responde = !["unknown", "offline", "error"].includes(state);
  const parado = ["offline", "updating"].includes(state);
  const leituras = parado ? LEITURAS.parado : LEITURAS.vivo;
  // 880 como no I3 e no I4: a frota são três células de `minmax(12rem,1fr)` e em 680 elas
  // quebrariam em duas linhas, gastando ~76px num vão de 354 que tem sete regiões para acomodar.
  return h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(880px,100%)"}},
    // SEM linha de título, e o corte é medido: com ela a composição dava 429 num vão de 354 e
    // ROLAVA. O nome do dispositivo já aparece na frota, como a célula selecionada, e o `Status`
    // pertence à região que descreve o dispositivo. Repetir "Pump A3" duas vezes gastava 26px
    // para dizer de novo o que já estava dito — o mesmo corte que o I1 fez no turno do humano.
    // `fleet` é o `role=list` do próprio `HealthMatrix`, nomeado pelo `label` — não vira
    // `role=group`, pela mesma razão que o `TreeView` do I3 e o `Chart` do I4 não viraram: marco
    // dentro de marco homônimo só acrescenta um nível para o leitor de tela atravessar.
    // A seleção vai no NOME e não em `detail`: com `detail` a célula selecionada ficava com três
    // linhas e as outras com duas, e a matriz mede a mais alta — 24px por uma palavra.
    h(HealthMatrix, {label: "Fleet", entries: [
      {id: "a3", name: "Pump A3 · selected", state: SAUDE_DEV[state]},
      {id: "b1", name: "Pump B1", state: "operational"},
      {id: "c4", name: "Valve C4", state: "maintenance"}]}),
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", alignItems: "start"}},
      regiao("Device",
        h("div", {style: between}, h("strong", null, "Pump A3 · line 2"),
          h(Status, {variant: e.variant}, e.label)),
        h(DataList, {items: DISPOSITIVO})),
      regiao("Telemetry",
        h(DataList, {items: leituras.map(l => ({term: l.nome, value: `${l.valor} · ${l.hora} · ${l.qualidade}`}))}),
        // "live telemetry can be paused" — o controle existe nos dois sentidos e diz em qual
        // está. Botão que só diz "Pause" não conta que já está pausado.
        h(Button, {variant: "outline", size: "sm"}, parado ? "Resume live" : "Pause live"))),
    // "critical alerts do not rely on sound": o alerta é TEXTO com `role="alert"` — o `Alert`
    // `danger` já assume o papel sozinho. E o `acknowledge` mora aqui, não numa barra de
    // comandos: quem reconhece, reconhece o alarme.
    // O alerta e a sua ação LADO A LADO, e a razão é medida: empilhados, a barra de uma ação só
    // custava 52px num vão que já estourava em 24. O texto vem primeiro no DOM, então quem tabula
    // lê o alarme antes de alcançar o botão — a mesma ordem que o I2 impôs entre resultado de
    // teste e decisão.
    ["alert", "degraded", "error"].includes(state)
      ? regiao("Alerts", h("div", {style: {display: "grid", gridTemplateColumns: "1fr auto",
          gap: "var(--space-3)", alignItems: "center"}},
          h(Alert, {variant: state === "degraded" ? "warning" : "danger",
            title: state === "degraded" ? "Flow below the expected band" : "Head temperature above the safe limit"},
            "Raised 09:41 · threshold 70 °C · reading 71.8 °C."),
          acoes.includes("acknowledge") ? h(Toolbar, {label: "Alert actions"},
            h(ToolbarButton, {variant: "outline"}, ACAO_DEV.acknowledge)) : null))
      : null,
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", alignItems: "start"}},
      // "commands show target scope and expected effect" — os dois em TEXTO, antes de qualquer
      // botão. Um comando cujo alcance só se descobre depois de clicar não tem escopo, tem susto.
      h("div", {style: {display: "grid", gap: "var(--space-2)"}},
      regiao("Commands",
        h("div", {className: "hint"}, `Scope: ${ESCOPO}`),
        h("div", {className: "hint"}, `Effect: ${EFEITO}`),
        acoes.includes("update") ? h(Toolbar, {label: "Device commands"},
          h(ToolbarButton, {variant: "outline"}, ACAO_DEV.update)) : null),
        // `audit` numa linha, e é a mesma escolha que o I4 fez com as anotações: quem fez, o quê
        // e quando cabem numa frase, e a caixa do demo tem altura fixa (ADR-0002). Ela mora
        // DEBAIXO dos comandos, na coluna da esquerda, desde a 0.8.10: a da calibração é mais
        // alta, e numa linha própria no pé a composição passava 23px da caixa com a escala de
        // letra da 0.8.8. É a região IRMÃ dos comandos, não filha — o `role=group` é dela.
        regiao("Audit", h("div", {className: "hint"},
          "09:38 Curator acknowledged an alert · 08:12 Analyst set +0.4 °C"))),
      // "calibration RETAINS defaults" — e a palavra é retém, não mostra quando dá. A primeira
      // versão daqui trocava o painel inteiro por um recado quando o dispositivo não respondia, e
      // com ele ia embora o valor atual e o default. Quem calibrou errado e viu o equipamento cair
      // é exatamente quem precisa ler os dois. O que o estado tira é o CONTROLE, não a informação
      // — e quem achou isso foi a prova contra o defeito, não a leitura.
      regiao("Calibration",
        responde
          ? h(Field, {label: "Head temperature offset (°C)",
              hint: `Now ${CALIBRACAO.atual} · default ${CALIBRACAO.padrao}`},
              h(Range, {min: -2, max: 2, step: 0.1, defaultValue: 0.4, "aria-label": "Head temperature offset in degrees Celsius"}))
          : h("div", null,
              h("div", null, "Head temperature offset (°C)"),
              h("div", {className: "hint"}, `Now ${CALIBRACAO.atual} · default ${CALIBRACAO.padrao}`),
              h("div", {className: "hint"}, "The device has to answer before the offset can be changed.")),
        h("div", {style: row},
          // "calibration retains defaults and rollback" — o rollback é um botão que existe
          // SEMPRE, inclusive quando o dispositivo não responde: quem calibrou errado precisa
          // poder voltar sem esperar o equipamento.
          h(Button, {variant: "ghost", size: "sm"}, "Revert to default"),
          acoes.includes("calibrate") ? h(Toolbar, {label: "Calibration actions"},
            h(ToolbarButton, {variant: "outline"}, ACAO_DEV.calibrate)) : null))),
    // O portão aparece onde o comando inseguro EXISTE — e o inseguro aqui é a atualização de
    // firmware, que derruba o equipamento. É o mesmo desenho do I1: o portão toma o lugar da
    // ação enquanto uma pessoa tem de decidir.
    acoes.includes("update") ? h(HumanApproval, {
      title: ACAO_DEV.update, risk: "high",
      description: EFEITO,
      details: [{term: "Scope", value: ESCOPO}, {term: "Rollback", value: "2.4.1 stays on the device"}]}) : null);
}

// ── I7 · MediaLibrary — a composição do PLANO-1.0 §12 ────────────────────────
// As OITO regiões do contrato (`applicationPatterns.patterns.MediaLibrary.regions`
// = library · item_detail · player · queue · tracks · chapters · history · actions). Empata com o
// I4 no número de regiões e é a única com um COMPONENTE DE MOTOR dentro — o `MediaPlayer`, que
// tem estado próprio.
//
// Essa é a diferença estrutural em relação às cinco anteriores, e ela decidiu duas coisas. O
// `MediaPlayer` já traz o transporte inteiro, com nome e estado em cada controle; a região
// `actions` NÃO o repete, porque o mesmo botão em dois lugares são duas verdades sobre quem
// controla — a lição do I1 com `approve`/`reject`. `actions` fica com o que é de BIBLIOTECA
// (`favorite`, `playlist`), e há teste que reprova quem duplicar o transporte.
const MEDIA = contract.applicationPatterns.patterns.MediaLibrary;

export const mediaActions = state => MEDIA.transitions
  .filter(t => t.from === state && MEDIA.actions.includes(t.action))
  .map(t => t.action);

// SEIS órfãos em `actions` sem transição — `seek`, `queue`, `playlist`, `chapter`, `track`,
// `favorite`. Como no I6, não são buraco de contrato: procurar posição, enfileirar, escolher
// capítulo ou faixa não muda o estado da biblioteca. Cada um mora na sua região.
const ACAO_MEDIA = {play: "Play", pause: "Pause", seek: "Seek", queue: "Add to queue",
  playlist: "Add to playlist", chapter: "Chapter", track: "Track", resume: "Resume", favorite: "Favorite"};

// `offline` AQUI é o universal (Parte J) — e é o oposto do que o I6 decidiu para o mesmo nome.
// Lá o `offline` era o DISPOSITIVO que caiu; aqui é a nossa conexão que caiu, que é exatamente o
// que a frase do vocabulário diz ("No connection. This was loaded earlier."). Mesmo nome, dono
// diferente — e é por isso que a decisão se toma lendo o contrato, não o dicionário.
const ESTADO_MEDIA = {
  loading: {variant: "neutral", label: "Loading"},
  ready: {variant: "success", label: "Ready"},
  empty: {variant: "neutral", label: "Nothing here"},
  playing: {variant: "running", label: "Playing"},
  paused: {variant: "warning", label: "Paused"},
  buffering: {variant: "running", label: "Buffering"},
  offline: {state: "offline"},
  error: {variant: "danger", label: "Could not load"},
};

// "library queue playback and item detail share ONE selection" — então existe UMA constante, e a
// galeria, o detalhe e o player leem dela. Três strings à mão que por acaso combinam hoje é o
// achado I1 desta auditoria esperando a primeira renomeação; o teste compara os três no DOM.
const SELECAO = "ep14";
const BIBLIOTECA = [
  {id: "ep14", titulo: "Episode 14", meta: "38:12 · audio"},
  {id: "ep13", titulo: "Episode 13", meta: "41:05 · audio"},
  {id: "clip2", titulo: "Launch clip", meta: "02:20 · video"},
];
const ITEM = BIBLIOTECA.find(i => i.id === SELECAO);

// "chapters tracks captions quality and devices are OPTIONAL capabilities" — o que existe se
// declara; o que não existe se diz que não existe. Silêncio faz o consumidor procurar.
const CAPITULOS = [
  {term: "00:00", value: "Cold open"},
  {term: "04:30", value: "Measuring instead of counting"},
];
const FAIXAS = [
  {term: "Audio", value: "English · Portuguese"},
  {term: "Captions", value: "English · Portuguese · transcript"},
];
// "resume position and history are EXPLICIT" — a posição em número, não "continue de onde parou".
const RETOMADA = {em: "12:04", quando: "3 days ago"};

export function mediaLibrary(state) {
  const e = ESTADO_MEDIA[state];
  const acoes = mediaActions(state);
  const vazio = state === "empty";
  // `--media-h` e `--media-ar` são a válvula que o Victor autorizou em 11/08/2026 para este item:
  // o default do core (`min-height:360px`, `aspect-ratio:16/9`) dá 464px na largura do painel, e o
  // vão útil é 354. `6rem` é a altura do transporte de áudio mais o título — medido, não escolhido.
  // O `MediaPlayer` não aceita `style` nesta caixa de propósito (as props sobrando vão para o
  // `<video>`), e altura não vira prop (check 23), então a válvula é o caminho que a casa já usa.
  return h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(880px,100%)",
      "--media-h": "6rem", "--media-ar": "auto"}},
    // SEM linha de título, e o corte é medido: com ela a composição dava 385 num vão de 354 e
    // ROLAVA. O título do item já aparece em três lugares — no `title` do player, no crachá da
    // galeria e no detalhe —, então o que a linha trazia de novo era só o `Status`. Ele foi para
    // DENTRO da região `library`, que é de quem o estado é: `loading`, `ready` e `empty` falam da
    // biblioteca, não do item.
    // A GALERIA é de `<button>`, não de `Card`: "gallery selection works by keyboard", e medido em
    // 11/08 o `.card-interactive` do core tem `cursor:pointer` e `:hover` e **nada de foco** — um
    // `<div>` com cursor de mão não recebe Tab. A pele é a que já existe; o elemento é o que o
    // teclado alcança. O selecionado se marca com `aria-current`, como o item ativo da `Sidebar`,
    // e traz a palavra em texto — cor sozinha não diz qual está escolhido.
    regiao("Library", h("div", {style: {...between, gap: "var(--space-3)"}},
      h("div", {style: {...row, gap: "var(--space-3)"}},
        // Título e meta na MESMA linha do crachá, e não empilhados: duas linhas por tile custavam
        // 20px na faixa mais alta, e o meta é curto o bastante para caber ao lado.
        ...BIBLIOTECA.map(i => h("button", {key: i.id, type: "button",
          className: "card card-interactive",
          "aria-current": i.id === SELECAO ? "true" : undefined,
          // `inlineSize:"auto"` desfaz o `inline-size:100%` que o core dá ao `.card-interactive`.
          // Aquela regra existe para o cartão-ALVO, que ocupa a fatia inteira dele; aqui os três
          // ladrilhos são uma FILA, e com ela cada um virava uma linha — a faixa media 141px em
          // vez de 39, e a composição estourava a caixa em 86px. As duas linhagens estavam certas
          // separadas: a regra é da que fez o Card virar alvo, o bloco é da outra, e elas só se
          // encontraram no merge. Medido em 29/08/2026.
          style: {font: "inherit", textAlign: "start", cursor: "pointer", inlineSize: "auto",
            padding: "var(--space-2) var(--space-3)", display: "flex", gap: "var(--space-2)", alignItems: "baseline"}},
          h("strong", null, i.titulo),
          h("span", {className: "hint"}, i.id === SELECAO ? `${i.meta} · selected` : i.meta)))),
      h(Status, e.state ? {state: e.state} : {variant: e.variant}, e.label))),
    vazio
      ? regiao("Player", h(EmptyState, {icon: "media--library", title: "Nothing to play yet", titleAs: "h2"}))
      // O `MediaPlayer` é `role="group"` nomeado pelo próprio `title`, então ele É a região —
      // mesma escolha do `Chart` no I4 e do `HealthMatrix` no I6.
      : h(MediaPlayer, {kind: "audio", title: ITEM.titulo, subtitle: "Measuring instead of counting"}),
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", alignItems: "start"}},
      regiao("Item detail", h(DataList, {items: [
        {term: "Duration", value: ITEM.meta},
        // A retomada é explícita e mora nas DUAS regiões que o contrato separa: o número aqui,
        // porque é propriedade do item, e o histórico abaixo, porque é quando aconteceu.
        {term: "Resume at", value: RETOMADA.em}]})),
      regiao("Chapters", h(DataList, {items: CAPITULOS}))),
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", alignItems: "start"}},
      // "bulk organize never interrupts playback" — a fila tem as suas ações de organização, e
      // NENHUMA delas é de transporte. O teste reprova um `Stop`/`Pause` escondido aqui.
      regiao("Queue",
        h(DataList, {items: [{term: "Next", value: "Episode 13 · 41:05"}]}),
        h(Toolbar, {label: "Queue actions"},
          h(ToolbarButton, {variant: "outline"}, "Move up"),
          h(ToolbarButton, {variant: "ghost"}, "Remove"))),
      regiao("Tracks", h(DataList, {items: FAIXAS}))),
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--space-3)", alignItems: "center"}},
      // "autoplay never surprises" — dito em TEXTO, e no histórico, que é onde quem chega procura
      // o que já aconteceu. Promessa de comportamento que não está escrita na tela é promessa que
      // o consumidor descobre pelo susto.
      regiao("History", h("div", {className: "hint"},
        `Last played ${RETOMADA.quando}, stopped at ${RETOMADA.em} · autoplay is off, the next item waits`)),
      // `actions` é de BIBLIOTECA, nunca de transporte — o transporte é do player, e repetir os
      // dois botões seria duas verdades sobre quem controla. Há teste que reprova a duplicação.
      regiao("Actions", h(Toolbar, {label: "Library actions"},
        h(ToolbarButton, {variant: "outline"}, ACAO_MEDIA.favorite),
        h(ToolbarButton, {variant: "outline"}, ACAO_MEDIA.playlist)))));
}

// ── I8 · VisualBuilder — a composição do PLANO-1.0 §12 ───────────────────────
// As SETE regiões do contrato (`applicationPatterns.patterns.VisualBuilder.regions`
// = palette · canvas · outline · inspector · variables · run_history · actions). O `canvas` é o
// `DependencyGraph` que o H14 construiu, em subpath próprio com peer opcional.
//
// **O prerender NÃO foi necessário, e isso corrige o que o I4 previu.** O registro do I4 diz que
// "o I8 vai precisar do mesmo" — e não precisou: o H14 já tinha resolvido o SSR do grafo
// (`initialWidth`/`initialHeight`/`handles` mais o viewport no provider), e o starter do
// `DependencyGraph` no catálogo sai estático sem `prerender` nenhum. Previsão não é medição.
const BUILDER = contract.applicationPatterns.patterns.VisualBuilder;

export const builderActions = state => BUILDER.transitions
  .filter(t => t.from === state && BUILDER.actions.includes(t.action))
  .map(t => t.action);

// SETE órfãos em `actions` sem transição — `add`, `connect`, `configure`, `move`, `delete`, `undo`,
// `redo` — e aqui eles são o CONTEÚDO das regiões, não buraco: editar a tela não muda o estado da
// máquina, muda o desenho. E há o inverso, que vale registro: `edit` e `resume` são transições e
// **não estão** em `actions`, então nenhum botão os oferece — `edit` acontece ao mexer em algo, e
// `resume` é o `run` de novo. Quarta composição em que a tabela e a lista discordam nos dois
// sentidos, e a quarta em que a derivação é o que decide o que aparece.
const ACAO_BUILDER = {add: "Add", connect: "Connect", configure: "Configure", move: "Move",
  delete: "Delete", undo: "Undo", redo: "Redo", validate: "Validate", run: "Run", pause: "Pause"};

// Nenhum dos oito é universal (Parte J) — conferido contra a união do `pure.tsx`. `paused` parece,
// e não é, pelo mesmo motivo do I3: quem pausou foi quem está olhando, não um agente externo.
const ESTADO_BUILDER = {
  idle: {variant: "neutral", label: "Saved"},
  editing: {variant: "info", label: "Editing"},
  validating: {variant: "running", label: "Validating"},
  invalid: {variant: "danger", label: "Invalid"},
  running: {variant: "running", label: "Running"},
  paused: {variant: "warning", label: "Paused"},
  completed: {variant: "success", label: "Completed"},
  failed: {variant: "danger", label: "Failed"},
};

// O grafo, e o OUTLINE é a mesma lista em ordem — "canvas has an equivalent ordered outline".
// Uma fonte só para os dois: duas listas à mão que combinam hoje discordam na primeira edição, e é
// o achado I1 desta auditoria pela quinta vez. O teste compara os nomes dos dois lados.
const NOS = [
  {id: "in", label: "Webhook", kind: "input", detail: "POST /hooks/order"},
  {id: "map", label: "Map fields", kind: "task", detail: "12 fields"},
  {id: "out", label: "Send e-mail", kind: "output", detail: "template: receipt"},
];
const ARESTAS = [{from: "in", to: "map"}, {from: "map", to: "out"}];
const SELECIONADO = "map";
const NO_SELECIONADO = NOS.find(n => n.id === SELECIONADO);

// "credentials are REFERENCED never exposed" — a mesma regra que o I5 aplicou ao cartão, e aqui ela
// vale para segredo de integração. O que a tela mostra é o NOME da referência e onde ela mora;
// nunca o valor, nem mascarado. Máscara é valor com fita adesiva: continua no DOM.
const VARIAVEIS = [
  {term: "ORDER_WEBHOOK", value: "text · /hooks/order"},
  {term: "SMTP_PASSWORD", value: "secret ref · vault/smtp#current"},
];

// "validation errors link to NODES" — a mensagem nomeia o nó, e o nó nomeado existe no outline e no
// canvas. O teste cobra os três, então erro que aponta para um nó inexistente reprova.
const ERRO = {no: "Send e-mail", texto: "Send e-mail has no recipient: connect a field or set one."};

const HISTORICO = [{term: "Last run", value: "09:41 completed · 12 items · before that 09:12 failed"}];

export function visualBuilder(state) {
  const e = ESTADO_BUILDER[state];
  const acoes = builderActions(state);
  const rodando = ["running", "paused"].includes(state);
  return h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(880px,100%)"}},
    // A PALETA é de botões "Add …", e é a alternativa sem arrastar para acrescentar — "connect and
    // move actions have non-drag alternatives" começa aqui: numa paleta de arrastar, quem não
    // arrasta não constrói nada.
    regiao("Palette", h("div", {style: between},
      h("div", {style: row},
        ...["Input", "Task", "Branch", "Output"].map(t =>
          h(Button, {key: t, variant: "outline", size: "sm", leadingIcon: "add"}, t))),
      h(Status, {variant: e.variant}, e.label))),
    // "validation errors link to nodes" — e o `Alert` `danger` é `role="alert"` sozinho.
    state === "invalid" ? h(Alert, {variant: "danger", title: "1 problem"}, ERRO.texto) : null,
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 15rem", gap: "var(--space-3)", alignItems: "start"}},
      // O canvas é o `role=group` do próprio `DependencyGraph`, nomeado pelo `label`.
      // `height` é PROP do componente (H14) — não precisou de válvula no core, ao contrário do
      // player no I7. `7rem` é MEDIDO: o nó mede 180×56, a fileira única dos três cabe em 56, e com
      // 9rem sobravam 88px de tela vazia num vão de 354 que tem sete regiões para acomodar.
      h(DependencyGraph, {label: "Canvas", height: "7rem", selectedId: SELECIONADO, onSelect: () => {},
        nodes: NOS, edges: ARESTAS}),
      // O OUTLINE é a alternativa ordenada, e é onde MOVER acontece sem arrastar: cada linha tem
      // subir e descer. Um `<ol>` porque a ordem É a informação — `role=list` sem ordem diria
      // menos que o canvas, e a cláusula pede equivalência.
      regiao("Outline", h("ol", {style: {margin: 0, paddingInlineStart: "var(--space-4)", display: "grid", gap: "var(--space-1)"}},
        ...NOS.map((n, i) => h("li", {key: n.id, style: {...row, gap: "var(--space-2)"}},
          h("span", {style: {fontWeight: n.id === SELECIONADO ? "var(--weight-medium)" : undefined}}, n.label),
          i > 0 ? h(Button, {variant: "ghost", size: "sm", "aria-label": `Move ${n.label} up`}, "↑") : null,
          i < NOS.length - 1 ? h(Button, {variant: "ghost", size: "sm", "aria-label": `Move ${n.label} down`}, "↓") : null))))),
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", alignItems: "start"}},
      // O INSPECTOR configura o nó selecionado, e é aqui que CONECTAR sem arrastar mora: um
      // `Select` com os destinos possíveis faz por teclado o que a aresta arrastada faz com mouse.
      regiao("Inspector",
        h(DataList, {items: [
          {term: "Node", value: `${NO_SELECIONADO.label} · ${NO_SELECIONADO.kind}`},
          {term: "Detail", value: NO_SELECIONADO.detail}]}),
        // Rótulo AO LADO do controle, não acima: o `Field` empilha e custava 22px num vão que
        // estourava em 65. O nome acessível continua completo no `aria-label`, que é o que o
        // leitor de tela anuncia — e o texto ao lado diz a mesma coisa para quem vê.
        h("div", {style: {...row, gap: "var(--space-2)"}},
          h("span", {className: "hint"}, "Connect to"),
          h(Select, {defaultValue: "out", "aria-label": `Connect ${NO_SELECIONADO.label} to`},
            ...NOS.filter(n => n.id !== SELECIONADO).map(n => h("option", {key: n.id, value: n.id}, n.label))))),
      // "credentials are referenced never exposed": o valor não está aqui nem mascarado.
      regiao("Variables", h(DataList, {items: VARIAVEIS}))),
    h("div", {style: {display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--space-3)", alignItems: "center"}},
      // Uma linha, sempre — mesmo corte que o `audit` do I6 e as anotações do I4: quando, o quê e
      // o desfecho cabem numa frase. Em voo, a linha é a execução atual e o histórico vira o rabo
      // dela, para o número da vez não empurrar a barra de ações abaixo da dobra.
      regiao("Run history", h(DataList, {items: rodando
        ? [{term: "Now", value: `${state === "paused" ? "Paused" : "Running"} · item 4 of 12 · previous 09:41 completed`}]
        : HISTORICO})),
      // "undo redo and versioning cover STRUCTURAL edits" — desfazer e refazer existem sempre, ao
      // lado das ações que a tabela permite. Eles são órfãos de transição de propósito: desfazer
      // uma edição não muda o estado da máquina, muda o desenho.
      regiao("Actions", h(Toolbar, {label: "Builder actions"},
        h(ToolbarButton, {variant: "ghost"}, ACAO_BUILDER.undo),
        h(ToolbarButton, {variant: "ghost"}, ACAO_BUILDER.redo),
        ...acoes.map(a => h(ToolbarButton, {key: a, variant: "outline"}, ACAO_BUILDER[a] ?? a))))));
}

export default [
  {
    name: "Stats row",
    category: "Metrics",
    description: "Four numbers of equal weight above a dashboard. Trend beside the value, never a chart without a number.",
    uses: ["KPI"],
    code: `<div className="grid">
  <KPI label="Revenue" value="$48.2k" trend="+12%" />
  <KPI label="Active seats" value="312" trend="+18" />
  <KPI label="Churn" value="1.8%" trend="-0.3%" />
  <KPI label="Tickets" value="27" trend="+4" />
</div>`,
    render: () => h("div", {style: {...cols(140), width: "min(720px,100%)"}},
      h(KPI, {label: "Revenue", value: "$48.2k", trend: "+12%"}),
      h(KPI, {label: "Active seats", value: "312", trend: "+18"}),
      h(KPI, {label: "Churn", value: "1.8%", trend: "-0.3%"}),
      h(KPI, {label: "Tickets", value: "27", trend: "+4"})),
  },
  {
    name: "Pricing row",
    category: "Marketing",
    description: "Three plans side by side, the recommended one marked by a Badge — not by a bigger box.",
    uses: ["Card", "Badge", "Button", "DataList"],
    code: `<Card>
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>Pro</strong><Badge variant="primary">Recommended</Badge>
  </div>
  <p><strong>$24</strong> / seat / month</p>
  <DataList items={[{term:"Seats",value:"Up to 50"},{term:"Support",value:"Priority"}]} />
  <Button variant="primary">Choose Pro</Button>
</Card>`,
    render: () => {
      const plan = (name, price, badge, seats, cta) => h(Card, {key: name},
        h("div", {style: stack},
          h("div", {style: between}, h("strong", null, name),
            badge ? h(Badge, {variant: "primary"}, badge) : null),
          h("p", {style: {margin: 0}}, h("strong", {style: {fontSize: "var(--text-xl)"}}, price),
            h("span", {className: "muted"}, " / seat / month")),
          h(DataList, {items: [{term: "Seats", value: seats}, {term: "Support", value: badge ? "Priority" : "Standard"}]}),
          h(Button, {variant: badge ? "primary" : "outline"}, cta)));
      return h("div", {style: {...cols(200), width: "min(760px,100%)"}},
        plan("Free", "$0", null, "Up to 3", "Start free"),
        plan("Pro", "$24", "Recommended", "Up to 50", "Choose Pro"),
        plan("Scale", "$60", null, "Unlimited", "Talk to us"));
    },
  },
  {
    name: "Activity panel",
    category: "Communication",
    description: "Who did what, when — identity line, ordered history and the unread count in one surface.",
    uses: ["Card", "Avatar", "Badge", "Timeline", "Button"],
    code: `<Card>
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>Activity <Badge>3</Badge></strong><Button variant="ghost" size="sm">Mark all read</Button>
  </div>
  <Timeline items={[{title:"Curator published v1.7.0",time:"09:12"},…]} />
</Card>`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(Card, null,
      h("div", {style: stack},
        h("div", {style: between}, h("strong", null, "Activity ", h(Badge, null, "3")),
          h(Button, {variant: "ghost", size: "sm"}, "Mark all read")),
        h("div", {style: row}, h(Avatar, {fallback: "CU", size: "sm"}), h("span", {className: "muted"}, "Curator · owner")),
        h(Timeline, {items: [
          {title: "Published v1.7.0", time: "09:12", description: "64 components"},
          {title: "Invited Analyst", time: "11:40"},
          {title: "Rotated API key", time: "16:05"}]})))),
  },
  {
    name: "Run session panel",
    category: "Operations",
    description: "One run, end to end: what state it is in, the turns, the tool it is calling, where it resumes from, the receipt it already owns, and only the actions the run can take right now. The approval gate takes the place of the actions while a person has to decide.",
    uses: ["Status", "MessageList", "InvocationPanel", "HumanApproval", "DataList", "Toolbar", "ToolbarButton"],
    code: `// Which actions exist is a fact about the RUN, so it comes from the run's own state
// machine — never from a list written next to the buttons, where it drifts unseen.
const actions = allowedFrom(run.state);   // e.g. running -> ["interrupt", "cancel"]

<div className="stack">
  <div role="group" aria-label="Run" className="cluster" style={{justifyContent:"space-between"}}>
    <strong>{run.id}</strong>
    {/* the three "waiting" states are universal (ADR-0018): pass the state and the
        sentence comes from the vocabulary. The other six carry their own label. */}
    {run.state.startsWith("waiting_")
      ? <Status state={run.state} />
      : <Status variant={tone[run.state]}>{label[run.state]}</Status>}
  </div>

  <MessageList label="Turns" messages={run.turns} />
  <InvocationPanel title="write_file" running={run.state === "running"}
    input={run.tool.input} steps={run.tool.steps} output={run.output} />

  {run.state === "waiting_approval" &&
    <HumanApproval title="Write to the repository" risk="medium"
      details={run.approval.details} onApprove={approve} onDeny={reject} />}

  {/* the receipt exists from the moment the run is accepted, and is never erased */}
  <div role="group" aria-label="Checkpoint"><DataList items={run.checkpoint} /></div>
  <div role="group" aria-label="Receipt"><DataList items={run.receipt} /></div>

  {actions.length > 0 &&
    <div role="group" aria-label="Actions">
      <Toolbar label="Run actions">
        {actions.map(a => <ToolbarButton key={a} onClick={() => send(a)}>{label[a]}</ToolbarButton>)}
      </Toolbar>
    </div>}
</div>`,
    render: () => runSession("running"),
  },
  {
    name: "Review compare",
    category: "Operations",
    description: "Nothing changes until someone sees what would change: the difference, the checks that ran on it, the one decision the change can take right now, and the receipt that apply writes and rollback points back to. Additions and deletions are text, so the diff reads the same without colour.",
    uses: ["Status", "CodeBlock", "Alert", "Toolbar", "ToolbarButton", "DataList"],
    code: `// Which actions exist is a fact about the CHANGE, so it comes from its own state
// machine. ReviewCompare has no separate "actions" region — \`decision\` is where every
// human action lives — so nothing is filtered out of the derivation.
const actions = allowedFrom(change.state);   // applied -> ["rollback"]

<div className="stack">
  <div role="group" aria-label="Change" className="cluster" style={{justifyContent:"space-between"}}>
    <div><strong>{change.file}</strong><div className="hint">{change.range}</div></div>
    <Status variant={tone[change.state]}>{label[change.state]}</Status>
  </div>

  {/* additions and deletions are TEXT — the +/- of a unified diff — never colour alone */}
  <div role="group" aria-label="Comparison">
    <CodeBlock language="diff">{change.diff}</CodeBlock>
    <div className="hint">{added} added, {removed} removed</div>
  </div>

  {/* announced: Alert is role="status", and role="alert" on its own when it is a failure */}
  {change.test &&
    <div role="group" aria-label="Test result">
      <Alert variant={change.test.variant}>{change.test.text}</Alert>
    </div>}

  {actions.length > 0 &&
    <div role="group" aria-label="Decision">
      <Toolbar label="Review decision">
        {actions.map(a => <ToolbarButton key={a} onClick={() => send(a)}>{label[a]}</ToolbarButton>)}
      </Toolbar>
    </div>}

  {/* apply writes the receipt; rollback points back at it and never erases it */}
  {change.receipt &&
    <div role="group" aria-label="Receipt"><DataList items={change.receipt} /></div>}
</div>`,
    // `applied` é o ÚNICO dos nove estados em que as cinco regiões coexistem: há recibo
    // (o apply escreveu) e ainda há decisão (o rollback parte daqui). Qualquer outro
    // publicaria a composição com uma região a menos.
    render: () => reviewCompare("applied"),
  },
  {
    name: "Resource workbench",
    category: "Operations",
    description: "Where resources come from, what is in there, what the selected one is, what is in flight right now, where it all came from, and only the actions this phase allows. The transfer says its phase and its percent in words, so the bar is never the only thing carrying the news.",
    uses: ["TreeView", "Table", "Status", "Progress", "Alert", "DataList", "Toolbar", "ToolbarButton"],
    code: `// Which actions exist is a fact about the TRANSFER, so it comes from its own state
// machine — never from a list written next to the buttons, where it drifts unseen.
const actions = allowedFrom(job.state);   // transferring -> ["pause", "verify"]

<div className="stack">
  {/* tree and list side by side: that is what a workbench IS, and stacking them
      costs the height the other four regions need */}
  <div className="grid" style={{gridTemplateColumns:"minmax(140px,1fr) 2fr"}}>
    <TreeView label="Workspace" items={job.tree} defaultExpandedIds={["brand"]} />
    <Table caption="Resources">{...}</Table>
  </div>

  {/* "conflict requires preview": the conflict is explained HERE, next to what arrived,
      because whoever chooses has to see what is about to be overwritten */}
  <div role="group" aria-label="Preview">
    <strong>{job.selected.name}</strong>
    <div className="hint">{job.selected.summary}</div>
    {job.state === "conflict" &&
      <Alert variant="warning" title="Name already taken">{job.conflict.existing}</Alert>}
  </div>

  {/* one number feeds BOTH the bar and the sentence — "progress announces percent
      and phase", and a bar on its own is drawing, not announcing */}
  <div role="group" aria-label="Transfer queue">
    <div className="cluster" style={{justifyContent:"space-between"}}>
      <span>{job.file.name}</span>
      <span className="hint">{job.phase} · {job.percent}%</span>
    </div>
    <Progress value={job.percent} label={job.phase + " " + job.file.name} />
  </div>

  {/* "restore keeps provenance": it exists from discovery and survives everything,
      so it is not conditional on any state */}
  <div role="group" aria-label="Provenance"><DataList items={job.provenance} /></div>

  {actions.length > 0 &&
    <div role="group" aria-label="Actions">
      <Toolbar label="Workbench actions">
        {actions.map(a => <ToolbarButton key={a} onClick={() => send(a)}>{label[a]}</ToolbarButton>)}
      </Toolbar>
    </div>}
</div>`,
    // `transferring` é o estado em que as seis regiões coexistem COM a fila em voo — que é o
    // que a cláusula de anúncio de progresso existe para mostrar.
    render: () => resourceWorkbench("transferring"),
  },
  {
    name: "Analytics workbench",
    category: "Operations",
    description: "The period, the filters, the segments and the export scope on one line; the number, the curve and the same curve as a table below it. The table is not a fallback and not a tab: a chart without its numbers excludes whoever cannot read the chart.",
    uses: ["SegmentedControl", "Status", "Select", "Button", "KPI", "Chart", "Table", "Alert"],
    // O `Chart` monta por EFEITO (Recharts 3), e `renderToStaticMarkup` devolve a <div> vazia.
    // `prerender` passou a valer para BLOCO neste item — antes ele só alcançava starter de
    // componente, e o preview sairia caixa vazia sem nenhum gate reclamar.
    //
    // A prova é `recharts-area` e NÃO o `true` (que vale `<svg`), porque `true` MENTIU aqui —
    // pela terceira vez neste repositório, e pelo mesmo motivo do `DependencyGraph` em 09/08:
    // o botão de exportar tem `leadingIcon`, o ícone é um `<svg>`, e o guarda deu o desenho por
    // pronto ANTES de o motor montar. Medido em 10/08: `graficoDesenhou: false` com o guarda
    // verde. Prova específica é a diferença entre "tem svg" e "o gráfico desenhou".
    prerender: "recharts-area",
    code: `// Which actions exist is a fact about the DATA, so it comes from its own state machine.
// This contract has no "actions" region: seven of its eight actions have no transition,
// because changing the range does not change the STATE — it refetches. The regions ARE
// the controls, and \`refresh\` lives with the range, which is what owns freshness.
const actions = allowedFrom(view.state);   // ready -> ["refresh"]

<div className="stack" style={{"--chart-h":"8rem"}}>
  <div className="cluster">
    <div role="group" aria-label="Time range">
      <SegmentedControl label="Time range" items={RANGES} value={view.range} onChange={setRange} />
      {/* two of the seven states are UNIVERSAL (ADR-0018): pass the state and the
          sentence comes from the vocabulary, so the tela never invents a second wording */}
      {isUniversal(view.state)
        ? <Status state={view.state} />
        : <Status variant={tone[view.state]}>{label[view.state]}</Status>}
      {actions.map(a => <Button key={a} size="sm" onClick={() => send(a)}>{label[a]}</Button>)}
    </div>
    <div role="group" aria-label="Filters"><Select value={view.filter} …/></div>
    <div role="group" aria-label="Segments"><Select value={view.segment} …/></div>
    {/* "export records scope and freshness": both in the LABEL, because whoever clicks
        needs to know what comes out before it comes out. Keep it SHORT — this row holds four
        control groups on one line, and a label that wraps costs the box 43px of height */}
    <div role="group" aria-label="Export">
      <Button leadingIcon="download">Export · {view.rangeLabel} · {view.asOf}</Button>
    </div>
  </div>

  {/* announced by ROLE, never by moving focus — Alert is role="status" on its own */}
  {view.notice && <Alert variant={view.notice.variant}>{view.notice.text}</Alert>}

  <div className="grid" style={{gridTemplateColumns:"minmax(9rem,1fr) 3fr"}}>
    <div role="group" aria-label="Indicators"><KPI label="Runs" value={view.total} trend={view.trend} /></div>
    {/* the Chart names itself with \`label\`, so it IS the visualization region */}
    <Chart label="Runs per day">
      <AreaChart data={view.series}>…</AreaChart>
    </Chart>
  </div>

  {/* "visualization always has a tabular alternative" — a sibling region, not a tab.
      A tab panel that is not rendered is an alternative that does not exist. */}
  <Table caption="Runs per day, as numbers">…</Table>

  <div role="group" aria-label="Annotations"><div className="hint">{view.annotations}</div></div>
</div>`,
    render: () => analyticsWorkbench("ready"),
  },
  {
    name: "Transaction flow",
    category: "Operations",
    description: "What is being bought, what it adds up to, which saved method pays for it, and — before anything is charged — the consequence in one sentence. Every terminal result leaves an immutable receipt with the idempotency key, so a double click has an answer. A refund points back at that receipt instead of erasing it.",
    uses: ["Status", "Alert", "DataList", "Toolbar", "ToolbarButton"],
    code: `// Which actions exist is a fact about the TRANSACTION, so it comes from its own state
// machine. This contract has no "actions" region, so each action lives in the region it
// affects: refund in \`reversal\`, cancel and authorize in \`review\`, next to the sentence
// that says what they will do. Three of the six actions have no transition at all, and
// settle/fail/dispute are transitions without an action — the acquirer settles, the
// network declines, and the cardholder disputes through the issuer. Never this screen.
const actions = allowedFrom(tx.state);   // settled -> ["refund"]

// Money is an INTEGER in minor units: there is still no decimal type in JavaScript
// (TC39 Decimal is stage 1). Sum in integers, divide by 100 only to format.
const total = subtotal + fees.reduce((t, f) => t + f.cents, 0);
const money = new Intl.NumberFormat(locale, {style: "currency", currency, currencyDisplay: "code"});
const show = cents => money.format(cents / 100);

<div className="stack">
  {/* Status says what state it is IN; the Alert announces what just happened —
      Alert is role="status" on its own, and role="alert" when it is a failure */}
  <div role="group" aria-label="Status">
    <div className="cluster" style={{justifyContent:"space-between"}}>
      <strong>{tx.id} · {tx.reference}</strong>
      {/* requires_action IS the universal waiting_user (ADR-0018): pass the state and
          the sentence comes from the vocabulary, so there is no second wording */}
      {tx.state === "requires_action"
        ? <Status state="waiting_user" />
        : <Status variant={tone[tx.state]}>{label[tx.state]}</Status>}
    </div>
    {notice && <Alert variant={notice.variant}>{notice.text}</Alert>}
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <div>
      <div role="group" aria-label="Items">
        <DataList items={tx.items.map(i => ({term: i.label, value: show(i.cents)}))} />
      </div>
      {/* the total is SUMMED, never written beside the numbers it sums */}
      <div role="group" aria-label="Amounts">
        <DataList items={[{term:"Subtotal", value: show(subtotal)},
                          ...fees.map(f => ({term: f.label, value: show(f.cents)})),
                          {term:"Total", value: <strong>{show(total)}</strong>}]} />
      </div>
    </div>
    <div>
      {/* the method is a REFERENCE to something the provider holds. No card number, no
          CVV, no expiry: under PCI DSS 4.0.1 those fields belong to the provider's
          iframe or redirect, never to this page */}
      <div role="group" aria-label="Payment"><DataList items={tx.method} /></div>
      {/* immutable receipt on every terminal result, and it carries the idempotency key —
          the only thing that answers "did the double click charge me twice?" */}
      {tx.receipt &&
        <div role="group" aria-label="Receipt"><DataList items={tx.receipt} /></div>}
    </div>
  </div>

  {/* amount, currency, fees and CONSEQUENCE before the commit — the number inside the
      sentence is the same show(total), so the two can never disagree */}
  {!tx.receipt &&
    <div role="group" aria-label="Review">
      <div className="hint">{card} will be charged {show(total)} once. Retrying with the
        same Idempotency-Key does not charge twice.</div>
      {review.length > 0 && <Toolbar label="Review decision">…</Toolbar>}
    </div>}

  {/* a reversal never erases: it points back at the original receipt */}
  {(tx.reversal || refund.length > 0) &&
    <div role="group" aria-label="Reversal">
      {tx.reversal && <div className="hint">{tx.reversal}</div>}
      {refund.length > 0 && <Toolbar label="Reversal">…</Toolbar>}
    </div>}
</div>`,
    // `settled` é o estado com MAIS regiões — seis das sete —, e é o único terminal em que
    // ainda há ação de pessoa (o estorno parte dali). As sete não coexistem em estado nenhum:
    // `review` é o que se lê antes do commit, `receipt`/`reversal` só existem depois dele.
    render: () => transactionFlow("settled"),
  },
  {
    name: "Device control",
    category: "Operations",
    description: "One device inside its fleet: what it is, what it is reading right now — with the time and the quality of each reading — what a command would reach and what it would do, the calibration with its default and a way back, and who touched it last. Live readings can be paused, and a firmware update asks before it drops the equipment.",
    uses: ["HealthMatrix", "Status", "DataList", "Alert", "Toolbar", "ToolbarButton", "Button", "Field", "Range", "HumanApproval"],
    code: `// Which actions exist is a fact about the DEVICE, so it comes from its own state machine.
// Four of the seven actions have no transition — select, command, confirm, pause_live —
// and that is not a hole in the contract: they change the SCREEN, not the equipment.
// Each one lives in the region it affects.
const actions = allowedFrom(device.state);   // online -> ["update", "calibrate"]

<div className="stack">
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>{device.name}</strong>
    <Status variant={tone[device.state]}>{label[device.state]}</Status>
  </div>

  {/* the fleet is a HealthMatrix: it names itself, so it IS the region */}
  <HealthMatrix label="Fleet" entries={fleet} />

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <div role="group" aria-label="Device"><DataList items={device.facts} /></div>

    {/* "telemetry timestamp and confidence are visible" — the quality vocabulary is the
        domain's own (OPC UA: Good · Uncertain · Bad), not one we invented. Paused or
        offline, the value is the LAST USABLE one and the clock stops: that is what the
        timestamp is for. */}
    <div role="group" aria-label="Telemetry">
      <DataList items={readings.map(r => ({
        term: r.name, value: \`\${r.value} · \${r.at} · \${r.quality}\`}))} />
      {/* "live telemetry can be paused" — and the control says which way it is */}
      <Button onClick={toggleLive}>{paused ? "Resume live" : "Pause live"}</Button>
    </div>
  </div>

  {/* "critical alerts do not rely on sound": Alert danger IS role="alert", and the text
      carries the threshold and the reading. Acknowledge lives here — you acknowledge the
      alarm, not the device. */}
  {device.alert &&
    <div role="group" aria-label="Alerts">
      <Alert variant="danger" title={device.alert.title}>{device.alert.detail}</Alert>
      {actions.includes("acknowledge") && <Toolbar label="Alert actions">…</Toolbar>}
    </div>}

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    {/* "commands show target scope and expected effect" — both as TEXT, before any button */}
    <div role="group" aria-label="Commands">
      <div className="hint">Scope: {command.scope}</div>
      <div className="hint">Effect: {command.effect}</div>
      {actions.includes("update") && <Toolbar label="Device commands">…</Toolbar>}
    </div>

    {/* "calibration retains defaults and rollback": the default is written next to the
        current value, and the way back is a button that exists even when the device does not
        answer — whoever mis-calibrated should not have to wait for the equipment */}
    <div role="group" aria-label="Calibration">
      <Field label="Head temperature offset (°C)"
        hint={\`Now \${cal.current} · default \${cal.default}\`}>
        <Range min={-2} max={2} step={0.1} value={cal.value} onChange={setOffset}
          aria-label="Head temperature offset in degrees Celsius" />
      </Field>
      <Button variant="ghost">Revert to default</Button>
    </div>
  </div>

  {/* "unsafe actions require gated confirmation" — the gate takes the place of the action,
      and it carries the scope and the rollback, not just a yes/no */}
  {actions.includes("update") &&
    <HumanApproval title="Update firmware" risk="high" description={command.effect}
      details={[{term:"Scope",value:command.scope},{term:"Rollback",value:"2.4.1 stays on the device"}]} />}

  <div role="group" aria-label="Audit"><div className="hint">{device.audit}</div></div>
</div>`,
    // `alert` é o único dos oito estados em que as SETE regiões coexistem: é o que traz a região
    // `alerts` sem perder nenhuma outra. O portão de firmware é cobrado no teste em `online`,
    // que é o estado de onde o comando inseguro parte.
    render: () => deviceControl("alert"),
  },
  {
    name: "Media library",
    category: "Operations",
    description: "One selection shared by the gallery, the detail and the player — never three strings that happen to match. The resume position is a number, the optional capabilities say which ones exist, and the queue can be reordered without touching what is playing. The transport lives in the player and nowhere else.",
    uses: ["MediaPlayer", "Status", "DataList", "Toolbar", "ToolbarButton", "EmptyState"],
    code: `// Which actions exist is a fact about PLAYBACK, so it comes from its own state machine.
// Six of the nine actions have no transition — seek, queue, playlist, chapter, track,
// favorite — and that is not a hole: choosing a chapter does not change the library's state.
const actions = allowedFrom(view.state);   // ready -> ["play"]

<div className="stack" style={{"--media-h":"6rem", "--media-ar":"auto"}}>
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>{item.title} · {item.meta}</strong>
    {/* offline here IS the universal state (ADR-0018): it is OUR connection that dropped,
        which is the opposite of what the same word means in DeviceControl */}
    {isUniversal(view.state)
      ? <Status state={view.state} />
      : <Status variant={tone[view.state]}>{label[view.state]}</Status>}
  </div>

  {/* "gallery selection works by keyboard": the tiles are BUTTONS. Measured — the core's
      .card-interactive has cursor:pointer and :hover and no focus at all, because a div
      never takes Tab. The skin is the one that exists; the element is what the keyboard
      reaches. aria-current marks the selected one, and the word is in the text too. */}
  <div role="group" aria-label="Library" className="cluster">
    {library.map(i =>
      <button key={i.id} type="button" className="card card-interactive"
        aria-current={i.id === selection ? "true" : undefined}
        onClick={() => select(i.id)}>
        <strong>{i.title}</strong>
        <div className="hint">{i.id === selection ? i.meta + " · selected" : i.meta}</div>
      </button>)}
  </div>

  {/* ONE selection feeds the gallery, the detail and the player. Three hand-written strings
      that agree today are one rename away from disagreeing. */}
  <MediaPlayer kind="audio" title={item.title} subtitle={item.subtitle} />

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <div role="group" aria-label="Item detail">
      <DataList items={[{term:"Duration",value:item.meta},{term:"Resume at",value:item.resumeAt}]} />
    </div>
    {/* optional capabilities: what exists is declared, so nobody goes looking for it */}
    <div role="group" aria-label="Chapters"><DataList items={item.chapters} /></div>
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    {/* "bulk organize never interrupts playback": none of these is a transport control */}
    <div role="group" aria-label="Queue">
      <DataList items={[{term:"Next",value:queue[0].label}]} />
      <Toolbar label="Queue actions">…</Toolbar>
    </div>
    <div role="group" aria-label="Tracks"><DataList items={item.tracks} /></div>
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr auto"}}>
    {/* "autoplay never surprises" — said in TEXT, where whoever arrives goes looking */}
    <div role="group" aria-label="History">
      <div className="hint">Last played {h.when}, stopped at {h.at} · autoplay is off</div>
    </div>
    {/* library actions, never transport: the transport is the player's, and two buttons for
        the same thing are two truths about who controls it */}
    <div role="group" aria-label="Actions"><Toolbar label="Library actions">…</Toolbar></div>
  </div>
</div>`,
    // `ready` é o estado em que as OITO regiões coexistem: há item, há player e a biblioteca não
    // está vazia. Em `empty` o player vira EmptyState e a galeria não tem o que mostrar.
    render: () => mediaLibrary("ready"),
  },
  {
    name: "Visual builder",
    category: "Operations",
    description: "A canvas with an ordered outline that says the same thing, so building never requires a mouse: add from the palette, move in the outline, connect in the inspector. Credentials appear as references and never as values. Undo and redo sit beside whatever the state machine actually allows right now.",
    uses: ["DependencyGraph", "Status", "Alert", "Button", "DataList", "Field", "Select", "Toolbar", "ToolbarButton"],
    code: `// Which actions exist is a fact about the FLOW, so it comes from its own state machine.
// Seven of the ten actions have no transition — add, connect, configure, move, delete,
// undo, redo — because editing the canvas changes the drawing, not the machine. And the
// reverse happens too: edit and resume are transitions that are NOT in actions, so no
// button offers them.
const actions = allowedFrom(flow.state);   // idle -> ["run"]

<div className="stack">
  {/* the palette adds by BUTTON: in a drag-only palette, whoever cannot drag builds nothing */}
  <div role="group" aria-label="Palette" className="cluster">
    {kinds.map(k => <Button key={k} leadingIcon="add" onClick={() => add(k)}>{k}</Button>)}
    <Status variant={tone[flow.state]}>{label[flow.state]}</Status>
  </div>

  {/* "validation errors link to nodes": the message names the node, and the node exists */}
  {flow.state === "invalid" && <Alert variant="danger" title="1 problem">{error.text}</Alert>}

  <div className="grid" style={{gridTemplateColumns:"1fr 15rem"}}>
    {/* height is a PROP of the graph (Part H), so no core change was needed here */}
    <DependencyGraph label="Canvas" height="9rem" nodes={nodes} edges={edges}
      selectedId={selected} onSelect={setSelected} />

    {/* "canvas has an equivalent ordered outline" — ONE source feeds both, and the outline is
        where moving happens without dragging: every row has up and down */}
    <div role="group" aria-label="Outline">
      <ol>{nodes.map((n, i) =>
        <li key={n.id}>
          <span>{n.label}</span>
          {i > 0 && <Button variant="ghost" aria-label={"Move " + n.label + " up"}>↑</Button>}
          {i < nodes.length - 1 && <Button variant="ghost" aria-label={"Move " + n.label + " down"}>↓</Button>}
        </li>)}</ol>
    </div>
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    {/* the inspector is where CONNECTING happens without dragging: a select of valid targets
        does by keyboard what a dragged edge does by mouse */}
    <div role="group" aria-label="Inspector">
      <DataList items={[{term:"Node",value:node.label},{term:"Detail",value:node.detail}]} />
      <Field label="Connect to">
        <Select value={target} onChange={connect} aria-label={"Connect " + node.label + " to"}>…</Select>
      </Field>
    </div>

    {/* "credentials are referenced never exposed" — the value is not here, not even masked:
        a mask is a value with tape on it, and it is still in the DOM */}
    <div role="group" aria-label="Variables"><DataList items={variables} /></div>
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr auto"}}>
    <div role="group" aria-label="Run history"><DataList items={history} /></div>
    {/* "undo redo and versioning cover structural edits" — they exist always, beside whatever
        the transition table permits right now */}
    <div role="group" aria-label="Actions">
      <Toolbar label="Builder actions">
        <ToolbarButton>Undo</ToolbarButton><ToolbarButton>Redo</ToolbarButton>
        {actions.map(a => <ToolbarButton key={a} onClick={() => send(a)}>{label[a]}</ToolbarButton>)}
      </Toolbar>
    </div>
  </div>
</div>`,
    // `idle` — e a escolha é medida, não estética. As SETE regiões existem em todos os oito
    // estados (o alerta de validação **não é região**: `regions` não tem `alerts`), então `invalid`
    // não publica mais nada — publica as mesmas sete mais 56px de alerta, e com ele a composição
    // dava 387 num vão de 354 e ROLAVA. O erro que aponta para o nó é cobrado no teste, em
    // `invalid`, que é o estado onde ele existe. Em `idle` a ação derivada é `run`, que é o que
    // alguém faz com um fluxo salvo.
    render: () => visualBuilder("idle"),
  },
];
