// A METADE SEM ESTADO do internal.tsx — Parte A do PLANO-1.0 (06/08/2026).
//
// Existe por uma razão só, e ela é a mesma da Parte A vista uma camada abaixo: o `internal.tsx`
// precisa de `"use client"` (ele chama `createContext`), e num empacotador de RSC TODO export de
// um módulo com a diretiva vira REFERÊNCIA de cliente. O `cx` continuaria importável de um
// componente de servidor e quebraria ao ser CHAMADO — no consumidor, não aqui.
//
// Então o que não tem estado mora neste arquivo, SEM diretiva. O `internal.tsx` reexporta para os
// módulos de cliente não precisarem saber da diferença; o barril (`index.tsx`, que também é de
// servidor) importa DAQUI.
//
// Mesmo desenho da referência: no shadcn/ui o `cn` mora em `lib/utils.ts` sem diretiva, enquanto
// 43 dos 57 componentes de `registry/bases/aria/ui` a declaram — medido em 06/08/2026.
//
// `.tsx` sem JSX de propósito: os checks 11, 19 e 26 varrem `packages/react/src/*.tsx`, e um
// `.ts` aqui seria um arquivo que gate nenhum enxerga.
import {cloneElement, createElement, type ReactElement} from "react";
export const cx=(...v:Array<string|false|null|undefined>)=>v.filter(Boolean).join(" ");

// ── `render`: a superfície é da Aurea, o ELEMENTO é de quem consome ───────────────────────────
//
// Nasceu do `G-A11Y-11`. O `Card` oferecia `variant="interactive"` — ponteiro de mão, elevação
// no hover, e a descrição do próprio pattern dizendo *"carries the hover and the focus ring"* —
// sobre uma `<div>` que não recebe foco nenhum. Falha de WCAG 2.1.1, e a mesma forma do
// `G-A11Y-10`: a intenção estava escrita e a implementação a contradizia.
//
// A saída NÃO é `tabIndex={0}` na `<div>`. Uma superfície clicável pode prometer duas coisas
// diferentes, e elas exigem elementos diferentes:
//
//   AÇÃO       clicar faz algo aqui              → <button>
//   NAVEGAÇÃO  clicar leva a outro lugar         → <a href>
//
// O componente não pode adivinhar qual: escolher `<button>` sempre quebraria abrir-em-nova-aba
// num cartão-link, e `tabIndex` numa `<div>` daria foco sem papel, sem tecla e sem nome
// acessível — verde no gate e inútil para quem usa leitor de tela.
//
// Então quem sabe decide. `render` recebe o ELEMENTO e a Aurea funde a pele nele. É o idioma que
// o `DropdownMenu`, o `Popover` e o `Combobox` já usam com a Base UI (`render={<Button/>}`), e é
// a primeira parcela do `G-API-02` — o padrão "o motor entrega e a Aurea não passa adiante".
export function fundirRender(
  render: ReactElement | undefined, props: {className?: string} & Record<string, unknown>, padrao = "div",
): ReactElement {
  if (!render) return createElement(padrao, props);
  // As props do elemento de quem chama vêm DEPOIS das nossas, para que ele possa sobrescrever
  // qualquer uma — e a classe é concatenada em vez de substituída, na mesma ordem do `cx` em
  // todo componente da casa: a pele primeiro, o ajuste de quem usa depois.
  const dele = (render.props ?? {}) as {className?: string};
  return cloneElement(render as ReactElement<Record<string, unknown>>, {
    ...props, ...dele, className: cx(props.className, dele.className),
  });
}

// ── tema e densidade ────────────────────────────────────────────────────────
// Os dois eixos de apresentação que o `<html>` carrega. Ficam aqui, sem estado, porque o
// `internal.tsx` (que tem `"use client"`) e o `system.tsx` precisam dos tipos, e um tipo não é
// referência de cliente.
//
// Até 21/08/2026 o pacote React NÃO SABIA que estes eixos existiam. O runtime vanilla
// (`window.Aurea`) expunha `setTheme`, `toggleTheme` e `setDensity` desde sempre; o React não
// expunha nenhum dos três. Consequência medida: quem instalava só `@aurea-uds/react` não tinha
// como trocar tema nem densidade — as duas coisas que o `CLAUDE.md` chama de identidade —, e o
// catálogo e os docs resolviam cada um por conta própria, já divergindo em marcação e em ARIA
// (`G-CAP-24`). A densidade era pior: ninguém tinha notado que faltava.
export type AureaTheme="dark"|"light";
export type AureaDensity="compact"|"comfortable"|"spacious";
// ── J1: os estados universais, nomeados UMA vez ─────────────────────────────
// PLANO-1.0 Parte J. O contrato descreve estes estados em TRÊS listas que não concordam
// entre si — `applicationPatterns.states` (16 nomes), `operationalPatterns.states` (9) e
// `AppShell.states` (5). Aqui eles têm um nome só, e é o DO CONTRATO, snake_case incluído:
// renomear para o gosto do TypeScript criaria o segundo vocabulário que esta parte existe
// para impedir, e o check 30 não teria contra o que comparar.
//
// SÃO SETE, e o plano escrevia seis. `waiting_dependency` está no contrato colado nos outros
// dois "esperando"; nomear dois dos três deixa o terceiro para cada aplicação inventar, que é
// o defeito inteiro. Decisão registrada na ADR-0018.
//
// EIXO PRÓPRIO, não variante — e é a razão de existir uma prop nova em vez de sete nomes na
// que já havia. `variant` de Alert/Banner é GRAVIDADE (info/success/warning/danger); "obsoleto"
// e "parcial" são CONDIÇÃO DO DADO. Fundir os dois põe "obsoleto" ao lado de "perigo" e obriga
// o consumidor a escolher UM: um alerta de perigo sobre dado velho perderia uma das duas
// informações. São eixos porque respondem a perguntas diferentes — quão grave é × o que está
// acontecendo.
//
// E FALAM POR PALAVRA, NUNCA POR COR. Quinta recusa da mesma coisa neste repositório, e a
// medição que a fechou foi a de 09/08 no `CostMeter`: `--warning-400` É `var(--brand-yellow)`
// no tema escuro, então um degrau "de aviso" sai idêntico ao normal. Nenhum token novo nasce
// aqui — quem carrega o sentido é o texto (WCAG 1.4.1), e a cor que sobra é a que já existia.
export type UniversalState="waiting_user"|"waiting_approval"|"waiting_dependency"|"offline"|"stale"|"partial"|"degraded";
export const universalStates:readonly UniversalState[]=["waiting_user","waiting_approval","waiting_dependency","offline","stale","partial","degraded"];
// Nenhum dos sete é FALHA: nos sete a tela AINDA SERVE, e é isso que os separa de `error`. Por
// isso o teto de gravidade é `warning` e `danger` não aparece — quem espera é informado, quem
// perdeu qualidade é avisado. Um `role="alert"` aqui interromperia o leitor de tela por uma
// condição que não pede ação imediata, que é o oposto do que o papel serve.
export const stateSeverity=(state:UniversalState):"info"|"warning"=>state.startsWith("waiting_")?"info":"warning";

// ── i18n mínima ─────────────────────────────────────────────────────────────
// Strings visíveis/acessíveis; default em INGLÊS (idioma base do produto —
// AUREA.md §2.9/§4 Balde A). Fora do AureaProvider os componentes usam estes
// defaults. pt-BR segue disponível como locale: <AureaProvider strings={ptBR}>
// (a i18n é mantida; só o baseline virou en).
export interface AureaStrings{passwordShow:string;passwordHide:string;skipToContent:string;close:string;confirmCancel:string;dataError:string;dataEmpty:string;confirmProceed:string;paginationLabel:string;previous:string;next:string;breadcrumbLabel:string;tabsLabel:string;optionsLabel:string;tableLabel:string;commandLabel:string;commandPlaceholder:string;dismissNotification:string;toolbarLabel:string;loading:string;otpDigit:string;stepperLabel:string;increment:string;decrement:string;comboboxEmpty:string;comboboxClear:string;comboboxOpen:string;comboboxRemove:string;comboboxLoading:string;fileDropPrompt:string;fileAdded:string;fileRemoved:string;fileRemove:string;fileTooLarge:string;fileWrongType:string;treeLabel:string;notificationsLabel:string;notificationMarkAll:string;notificationEmpty:string;notificationUnread:string;notificationNew:string;dataGridFilter:string;dataGridEmpty:string;dataGridSelectAll:string;dataGridSelectRow:string;dataGridSelected:string;dataGridClearSelection:string;dataGridBulkLabel:string;dataGridColumns:string;dataGridResize:string;dataGridStale:string;dataGridPartial:string;dataGridError:string;dataGridDetails:string;dataGridDetailPanel:string;dataGridExport:string;dataGridExportRows:string;dataGridExportFiltered:string;dataGridExportSelected:string;mediaPlayer:string;mediaPlay:string;mediaPause:string;mediaMute:string;mediaUnmute:string;mediaSeek:string;mediaVolume:string;mediaCaptionsShow:string;mediaCaptionsHide:string;mediaSkipBack:string;mediaSkipForward:string;mediaFullscreenEnter:string;mediaFullscreenExit:string;mediaEmbedOpen:string;carouselLabel:string;carouselSlide:string;positionOf:string;carouselPrev:string;carouselNext:string;galleryLabel:string;sortableLabel:string;sortableHandle:string;sortableHelp:string;sortableGrabbed:string;sortableDropped:string;sortableMoved:string;sortableCanceled:string;blockEditorLabel:string;blockLabel:string;blockRemove:string;uploadSending:string;uploadCancel:string;uploadRetry:string;uploadError:string;uploadCanceled:string;uploadComplete:string;uploadPause:string;uploadResume:string;uploadPaused:string;uploadPending:string;uploadChecksum:string;uploadChecksumBad:string;fileConflict:string;fileReplace:string;fileKeepBoth:string;fileSkip:string;uploadReceipt:string;uploadReceiptCopy:string;agentInspector:string;invocationLabel:string;invocationInput:string;invocationOutput:string;taskQueueLabel:string;taskState:Record<"queued"|"running"|"completed"|"failed"|"blocked"|"paused",string>;taskPriority:Record<"low"|"medium"|"high",string>;approvalLabel:string;approvalApprove:string;approvalDeny:string;approvalApproved:string;approvalDenied:string;approvalDeadline:string;approvalRisk:Record<"low"|"medium"|"high",string>;permissionLabel:string;permissionAsk:string;permissionAlways:string;permissionNever:string;eventStreamLabel:string;traceLabel:string;healthLabel:string;healthState:Record<"operational"|"degraded"|"down"|"maintenance"|"unknown",string>;modelUsageLabel:string;usageMetric:Record<"tokens"|"cost"|"requests",string>;costMeterLabel:string;costMeterSpent:string;costMeterRemaining:string;costMeterExceeded:string;costMeterNear:string;costMeterOver:string;memoryLabel:string;memoryProvenance:string;memoryOperation:Record<"added"|"updated"|"recalled"|"forgotten",string>;memoryScope:Record<"episodic"|"semantic"|"procedural",string>;agentMessageLabel:string;agentMessageTo:string;agentMessageBroadcast:string;agentMessageReason:string;agentMessageKind:Record<"request"|"response"|"handoff"|"broadcast"|"error",string>;automationWhen:string;automationThen:string;automationEnabled:string;automationLastRun:string;automationResult:Record<"success"|"failure",string>;graphLabel:string;agentState:Record<"idle"|"thinking"|"running"|"paused"|"error"|"completed",string>;codeEditor:string;chatLabel:string;chatMessage:string;chatSend:string;qrCode:string;chartLabel:string;copyCode:string;tocLabel:string;navigationToggle:string;sidebarLabel:string;bottomNavLabel:string;themeToDark:string;themeToLight:string;universalState:Record<UniversalState,string>}
export const defaultStrings:AureaStrings={passwordShow:"Show password",passwordHide:"Hide password",skipToContent:"Skip to content",close:"Close",confirmCancel:"Cancel",dataError:"This could not be loaded.",dataEmpty:"Nothing here yet",confirmProceed:"Continue",paginationLabel:"Pagination",previous:"Previous",next:"Next",breadcrumbLabel:"Breadcrumb",tabsLabel:"Tabs",optionsLabel:"Options",tableLabel:"Table",commandLabel:"Command palette",commandPlaceholder:"Type a command…",dismissNotification:"Dismiss notification",toolbarLabel:"Toolbar",loading:"Loading",otpDigit:"Digit",stepperLabel:"Steps",increment:"Increase",decrement:"Decrease",comboboxEmpty:"No results",comboboxClear:"Clear selection",comboboxOpen:"Open list",comboboxRemove:"Remove",comboboxLoading:"Loading…",fileDropPrompt:"Drag files here or click to select",fileAdded:"File added",fileRemoved:"File removed",fileRemove:"Remove",fileTooLarge:"File exceeds the size limit",fileWrongType:"File type not allowed",treeLabel:"Tree",notificationsLabel:"Notifications",notificationMarkAll:"Mark all as read",notificationEmpty:"No notifications",notificationUnread:"Unread",notificationNew:"new notifications",dataGridFilter:"Filter",dataGridEmpty:"No results",dataGridSelectAll:"Select all rows",dataGridSelectRow:"Select row",dataGridSelected:"selected",dataGridClearSelection:"Clear selection",dataGridBulkLabel:"Bulk actions",dataGridColumns:"Columns",dataGridResize:"Resize column",dataGridStale:"Showing data that may be out of date.",dataGridPartial:"Some rows could not be loaded. What you see is incomplete.",dataGridError:"The rows could not be loaded.",dataGridDetails:"Details",dataGridDetailPanel:"Row detail",dataGridExport:"Export",dataGridExportRows:"rows",dataGridExportFiltered:"filtered rows",dataGridExportSelected:"selected rows",mediaPlayer:"Media player",mediaPlay:"Play",mediaPause:"Pause",mediaMute:"Mute",mediaUnmute:"Unmute",mediaSeek:"Seek",mediaVolume:"Volume",mediaCaptionsShow:"Show captions",mediaCaptionsHide:"Hide captions",mediaSkipBack:"Skip back 10 seconds",mediaSkipForward:"Skip forward 10 seconds",mediaFullscreenEnter:"Enter full screen",mediaFullscreenExit:"Exit full screen",mediaEmbedOpen:"Open the video on its own site",carouselLabel:"Carousel",carouselSlide:"Slide",positionOf:"of",carouselPrev:"Previous slide",carouselNext:"Next slide",galleryLabel:"Gallery",sortableLabel:"Sortable list",sortableHandle:"Reorder",sortableHelp:"Press Space to pick this up, then Arrow Up and Arrow Down to move it. Space drops it, Escape puts it back.",sortableGrabbed:"Picked up",sortableDropped:"Dropped",sortableMoved:"Moved",sortableCanceled:"Put back",blockEditorLabel:"Content blocks",blockLabel:"Block",blockRemove:"Remove block",uploadSending:"Uploading",uploadCancel:"Cancel upload",uploadRetry:"Retry upload",uploadError:"Upload failed",uploadCanceled:"Upload canceled",uploadComplete:"Upload complete",uploadPause:"Pause upload",uploadResume:"Resume upload",uploadPaused:"Paused",uploadPending:"Waiting",uploadChecksum:"Checksum",uploadChecksumBad:"The server received different bytes than the ones sent.",fileConflict:"A file with this name is already in the queue",fileReplace:"Replace",fileKeepBoth:"Keep both",fileSkip:"Skip",uploadReceipt:"Receipt",uploadReceiptCopy:"Copy receipt",agentInspector:"Agent inspector",invocationLabel:"Invocation",invocationInput:"Input",invocationOutput:"Output",taskQueueLabel:"Task queue",taskState:{queued:"Queued",running:"Running",completed:"Completed",failed:"Failed",blocked:"Blocked",paused:"Paused"},taskPriority:{low:"Low",medium:"Medium",high:"High"},approvalLabel:"Approval",approvalApprove:"Approve",approvalDeny:"Deny",approvalApproved:"Approved",approvalDenied:"Denied",approvalDeadline:"Decide by",approvalRisk:{low:"Low risk",medium:"Medium risk",high:"High risk"},permissionLabel:"Tool permissions",permissionAsk:"Ask",permissionAlways:"Always",permissionNever:"Never",eventStreamLabel:"Events",traceLabel:"Trace",healthLabel:"Health",healthState:{operational:"Operational",degraded:"Degraded",down:"Down",maintenance:"Maintenance",unknown:"Unknown"},modelUsageLabel:"Model usage",usageMetric:{tokens:"Tokens",cost:"Cost",requests:"Requests"},costMeterLabel:"Cost",costMeterSpent:"Spent",costMeterRemaining:"left",costMeterExceeded:"Over the limit",costMeterNear:"Spending is past the soft limit.",costMeterOver:"The limit has been reached. Further calls are blocked.",memoryLabel:"Memory ledger",memoryProvenance:"Where this came from",memoryOperation:{added:"Added",updated:"Updated",recalled:"Recalled",forgotten:"Forgotten"},memoryScope:{episodic:"Episodic",semantic:"Semantic",procedural:"Procedural"},agentMessageLabel:"Agent messages",agentMessageTo:"to",agentMessageBroadcast:"all agents",agentMessageReason:"Why it went this way",agentMessageKind:{request:"Request",response:"Response",handoff:"Handoff",broadcast:"Broadcast",error:"Error"},automationWhen:"When",automationThen:"Then",automationEnabled:"Enabled",automationLastRun:"Last run",automationResult:{success:"Succeeded",failure:"Failed"},graphLabel:"Dependency graph",agentState:{idle:"Idle",thinking:"Thinking",running:"Running",paused:"Paused",error:"Error",completed:"Completed"},codeEditor:"Code editor",chatLabel:"Conversation",chatMessage:"Message",chatSend:"Send",qrCode:"QR code",chartLabel:"Chart",copyCode:"Copy code",tocLabel:"On this page",navigationToggle:"Navigation",sidebarLabel:"Sidebar",bottomNavLabel:"Main",themeToDark:"Switch to dark theme",themeToLight:"Switch to light theme",universalState:{waiting_user:"Waiting for someone to act.",waiting_approval:"Waiting for approval.",waiting_dependency:"Waiting for something else to finish.",offline:"No connection. This was loaded earlier.",stale:"This may be out of date.",partial:"Some of this could not be loaded.",degraded:"Working with reduced capability."}};
// pt-BR preservado como locale (mesmos valores que já eram o default): passe
// <AureaProvider strings={ptBR}> para restaurar português.
export const ptBR:AureaStrings={passwordShow:"Mostrar senha",passwordHide:"Ocultar senha",skipToContent:"Pular para o conteúdo",close:"Fechar",confirmCancel:"Cancelar",dataError:"Não foi possível carregar.",dataEmpty:"Ainda não há nada aqui",confirmProceed:"Continuar",paginationLabel:"Paginação",previous:"Anterior",next:"Próxima",breadcrumbLabel:"Breadcrumb",tabsLabel:"Abas",optionsLabel:"Opções",tableLabel:"Tabela",commandLabel:"Paleta de comandos",commandPlaceholder:"Digite um comando…",dismissNotification:"Dispensar notificação",toolbarLabel:"Barra de ferramentas",loading:"Carregando",otpDigit:"Dígito",stepperLabel:"Etapas",increment:"Aumentar",decrement:"Diminuir",comboboxEmpty:"Nenhum resultado",comboboxClear:"Limpar seleção",comboboxOpen:"Abrir lista",comboboxRemove:"Remover",comboboxLoading:"Carregando…",fileDropPrompt:"Arraste arquivos aqui ou clique para selecionar",fileAdded:"Arquivo adicionado",fileRemoved:"Arquivo removido",fileRemove:"Remover",fileTooLarge:"Arquivo maior que o limite",fileWrongType:"Tipo de arquivo não aceito",treeLabel:"Árvore",notificationsLabel:"Notificações",notificationMarkAll:"Marcar todas como lidas",notificationEmpty:"Nenhuma notificação",notificationUnread:"Não lida",notificationNew:"novas notificações",dataGridFilter:"Filtrar",dataGridEmpty:"Nenhum resultado",dataGridSelectAll:"Selecionar todas as linhas",dataGridSelectRow:"Selecionar linha",dataGridSelected:"selecionadas",dataGridClearSelection:"Limpar seleção",dataGridBulkLabel:"Ações em lote",dataGridColumns:"Colunas",dataGridResize:"Redimensionar coluna",dataGridStale:"Mostrando dados que podem estar desatualizados.",dataGridPartial:"Algumas linhas não puderam ser carregadas. O que aparece está incompleto.",dataGridError:"Não foi possível carregar as linhas.",dataGridDetails:"Detalhes",dataGridDetailPanel:"Detalhe da linha",dataGridExport:"Exportar",dataGridExportRows:"linhas",dataGridExportFiltered:"linhas filtradas",dataGridExportSelected:"linhas selecionadas",mediaPlayer:"Reprodutor de mídia",mediaPlay:"Reproduzir",mediaPause:"Pausar",mediaMute:"Silenciar",mediaUnmute:"Ativar som",mediaSeek:"Posição da reprodução",mediaVolume:"Volume",mediaCaptionsShow:"Ativar legendas",mediaCaptionsHide:"Desativar legendas",mediaSkipBack:"Voltar 10 segundos",mediaSkipForward:"Avançar 10 segundos",mediaFullscreenEnter:"Tela cheia",mediaFullscreenExit:"Sair da tela cheia",mediaEmbedOpen:"Abrir o vídeo no site de origem",carouselLabel:"Carrossel",carouselSlide:"Slide",positionOf:"de",carouselPrev:"Slide anterior",carouselNext:"Próximo slide",galleryLabel:"Galeria",sortableLabel:"Lista ordenável",sortableHandle:"Reordenar",sortableHelp:"Aperte Espaço para pegar, e as setas para cima e para baixo para mover. Espaço solta, Esc devolve ao lugar.",sortableGrabbed:"Pego",sortableDropped:"Solto",sortableMoved:"Movido",sortableCanceled:"Devolvido",blockEditorLabel:"Blocos de conteúdo",blockLabel:"Bloco",blockRemove:"Remover bloco",uploadSending:"Enviando",uploadCancel:"Cancelar envio",uploadRetry:"Tentar envio novamente",uploadError:"Falha no envio",uploadCanceled:"Envio cancelado",uploadComplete:"Envio concluído",uploadPause:"Pausar envio",uploadResume:"Retomar envio",uploadPaused:"Pausado",uploadPending:"Aguardando",uploadChecksum:"Soma de verificação",uploadChecksumBad:"O servidor recebeu bytes diferentes dos enviados.",fileConflict:"Já existe um arquivo com este nome na fila",fileReplace:"Substituir",fileKeepBoth:"Manter os dois",fileSkip:"Pular",uploadReceipt:"Recibo",uploadReceiptCopy:"Copiar recibo",agentInspector:"Inspetor do agente",invocationLabel:"Invocação",invocationInput:"Entrada",invocationOutput:"Saída",taskQueueLabel:"Fila de tarefas",taskState:{queued:"Na fila",running:"Executando",completed:"Concluída",failed:"Falhou",blocked:"Bloqueada",paused:"Pausada"},taskPriority:{low:"Baixa",medium:"Média",high:"Alta"},approvalLabel:"Aprovação",approvalApprove:"Aprovar",approvalDeny:"Negar",approvalApproved:"Aprovado",approvalDenied:"Negado",approvalDeadline:"Decidir até",approvalRisk:{low:"Risco baixo",medium:"Risco médio",high:"Risco alto"},permissionLabel:"Permissões de ferramenta",permissionAsk:"Perguntar",permissionAlways:"Sempre",permissionNever:"Nunca",eventStreamLabel:"Eventos",traceLabel:"Rastro",healthLabel:"Saúde",healthState:{operational:"Operando",degraded:"Degradado",down:"Fora do ar",maintenance:"Em manutenção",unknown:"Desconhecido"},modelUsageLabel:"Consumo por modelo",usageMetric:{tokens:"Tokens",cost:"Custo",requests:"Chamadas"},costMeterLabel:"Custo",costMeterSpent:"Gasto",costMeterRemaining:"restantes",costMeterExceeded:"Acima do limite",costMeterNear:"O gasto passou do limite brando.",costMeterOver:"O limite foi atingido. As próximas chamadas estão bloqueadas.",memoryLabel:"Livro-razão de memória",memoryProvenance:"De onde isto veio",memoryOperation:{added:"Guardada",updated:"Atualizada",recalled:"Lembrada",forgotten:"Esquecida"},memoryScope:{episodic:"Episódica",semantic:"Semântica",procedural:"Procedural"},agentMessageLabel:"Recados entre agentes",agentMessageTo:"para",agentMessageBroadcast:"todos os agentes",agentMessageReason:"Por que foi por aqui",agentMessageKind:{request:"Pedido",response:"Resposta",handoff:"Passagem",broadcast:"Difusão",error:"Erro"},automationWhen:"Quando",automationThen:"Então",automationEnabled:"Ativa",automationLastRun:"Última execução",automationResult:{success:"Concluiu",failure:"Falhou"},graphLabel:"Grafo de dependências",agentState:{idle:"Ocioso",thinking:"Pensando",running:"Executando",paused:"Pausado",error:"Erro",completed:"Concluído"},codeEditor:"Editor de código",chatLabel:"Conversa",chatMessage:"Mensagem",chatSend:"Enviar",qrCode:"Código QR",chartLabel:"Gráfico",copyCode:"Copiar código",tocLabel:"Nesta página",navigationToggle:"Navegação",sidebarLabel:"Lateral",bottomNavLabel:"Principal",themeToDark:"Mudar para o tema escuro",themeToLight:"Mudar para o tema claro",universalState:{waiting_user:"Esperando alguém agir.",waiting_approval:"Esperando aprovação.",waiting_dependency:"Esperando outra coisa terminar.",offline:"Sem conexão. Isto foi carregado antes.",stale:"Isto pode estar desatualizado.",partial:"Parte disto não pôde ser carregada.",degraded:"Funcionando com capacidade reduzida."}};
// Sprite de ícones: CONFIGURAÇÃO DE APLICAÇÃO, então entra pelo provider, uma vez.
// Antes o default absoluto "/aurea-icons.svg" vivia no Icon e 15 componentes declaravam
// e repassavam `spriteUrl` à mão — 52 sítios de código. Consequência: aplicação servida
// em subcaminho perdia TODOS os ícones, e para consertar tinha de passar a prop em cada
// componente (auditoria 26/07/2026, achado A4 — causa raiz do A3 daquela auditoria, que
// foi corrigido nos fallbacks do catálogo e não aqui). O default segue o mesmo para quem
// não configura nada; `Icon` aceita a prop como override local.
export const defaultSpriteUrl="/aurea-icons.svg";

// ── EIXO RESPONSIVO — a abstração compartilhada do G-AXIS-04 ───────────────
//
// A Aurea tinha ZERO eixo responsivo e a Radix Themes tem em 47 de 50. A decisão do Victor foi
// ter os DOIS mecanismos, explícitos na API, e construir a abstração ANTES dos componentes — para
// não terminar com uma solução diferente por peça.
//
// Ela mora AQUI, no módulo sem diretiva, e isso não é arrumação: resolver um valor responsivo é
// computação pura de string, então serve componente de servidor sem virar referência de cliente.
// É a mesma razão que o `cx` tem para estar neste arquivo.
//
// **Nada observa largura.** Quem decide é o CSS: as classes emitidas aqui apenas nomeiam regras
// que já existem dentro de `@media`/`@container` no core. Sem listener, sem `matchMedia`, sem
// estado que dependa de hidratação — o HTML que o servidor manda já está certo, e continua certo
// se o JavaScript nunca chegar.

/** Os pontos da escala vêm de `escala.tsx`, que é GERADO da mesma leitura dos tokens que produz
 *  as `@media`/`@container` do core. Até 22/08/2026 eles eram escritos aqui à mão, e isso era
 *  seguro só enquanto ninguém comparava largura em JavaScript. Com o resolvedor de runtime do
 *  `G-AXIS-06` deixou de ser: número repetido em CSS, tipo, `matchMedia` e observer são quatro
 *  lugares para divergir. Agora há um. */
export type {Breakpoint, ContainerBreakpoint} from "./escala.js";
export {ESCALA, ESCALA_CONTAINER} from "./escala.js";
import type {Breakpoint, ContainerBreakpoint} from "./escala.js";

/** O valor, e SÓ o valor.
 *
 *  Todo callback de mudança do Base UI é chamado com DOIS argumentos — `(valor, eventDetails)` —
 *  e a Aurea declara um só. Repassar o callback do consumidor cru ao motor entrega esse segundo
 *  argumento de brinde: um objeto de evento do motor vazando por uma API pública que promete não
 *  tê-lo. Em TypeScript isso é INVISÍVEL, porque argumento a mais nunca é erro de tipo — o que
 *  torna o defeito silencioso e a assinatura, mentirosa.
 *
 *  O custo real é acoplamento: quem escrever `onValueChange={(v, e) => …}` passa a depender do
 *  formato do evento de UMA versão do Base UI, e a Aurea deixa de poder trocar de motor sem
 *  quebrar consumidor. O `G-API-02` já tinha corrigido isso UMA vez, no `onCheckedChange` do item
 *  de menu, sem perguntar quem mais tinha o mesmo problema. Tinham outros SETE — medidos com
 *  `grep -noE "on(Value|Pressed|Checked|Open|InputValue)Change=\{on[A-Za-z]+\}"` e conferidos um
 *  a um contra o `.d.ts` do motor, que declara `eventDetails` nos sete.
 *
 *  Devolve `undefined` quando não há callback, para o motor continuar distinguindo "sem handler"
 *  de "handler que não faz nada". */
export function soOValor<T>(fn:((v:T)=>void)|undefined):((v:T)=>void)|undefined{
  return fn?(v:T)=>{fn(v)}:undefined;
}

export type Orientation="horizontal"|"vertical";

/** Um valor que pode ser simples, responsivo por VIEWPORT ou adaptativo por CONTAINER.
 *
 *  Os dois últimos são MUTUAMENTE EXCLUSIVOS por tipo (`never` no ramo oposto), e é decisão: um
 *  valor que reage aos dois ao mesmo tempo teria precedência ambígua, e a API deixaria de dizer a
 *  que ele responde — que é exatamente o que não pode acontecer. Quem precisa dos dois tem uma
 *  pergunta de desenho para responder, não um default para herdar. */
export type Responsive<T extends string>=
  |T
  |{base:T;viewport:Partial<Record<Breakpoint,T>>;container?:never}
  |{base:T;container:Partial<Record<ContainerBreakpoint,T>>;viewport?:never};

/** O valor BASE de um responsivo — o que vale antes de qualquer ponto da escala, e o que um
 *  ambiente sem suporte a `@container` continua mostrando. */
export function valorBase<T extends string>(v:Responsive<T>|undefined):T|undefined{
  return v===undefined?undefined:typeof v==="string"?v:v.base;
}

/** `true` quando o valor pede a camada genérica (`size-*`) em vez da classe do componente. */
export function ehResponsivo<T extends string>(v:Responsive<T>|undefined):boolean{
  return typeof v==="object"&&v!==null;
}

/** As classes de um valor responsivo, para um eixo da camada compartilhada.
 *
 *  `eixo` é o nome da família de regras no core (hoje só `size`), e não o nome do componente: a
 *  camada é genérica de propósito — a explosão combinatória (passos × pontos) fica lá, uma vez,
 *  em vez de uma vez por peça.
 *
 *  Devolve `""` para valor simples: nesse caso o componente segue emitindo a própria classe
 *  (`btn-sm`), que produz exatamente o mesmo computado. É o que mantém a mudança SOMATIVA — nenhum
 *  consumidor existente muda de classe, e nenhuma baseline de pixel se mexe. */
export function classesResponsivas<T extends string>(eixo:string,v:Responsive<T>|undefined):string{
  if(v===undefined||typeof v==="string")return "";
  const fora:string[]=[`${eixo}-${v.base}`];
  const mapa=v.viewport??v.container;
  const prefixo=v.viewport?"vp":"ct";
  for(const [ponto,valor] of Object.entries(mapa??{})){
    if(valor)fora.push(`${prefixo}-${ponto}:${eixo}-${valor}`);
  }
  return fora.join(" ");
}

/** A PELE DE UM VALOR DE EIXO, para qualquer família e qualquer eixo.
 *
 *  Chamava-se `peleDeTamanho` até 22/08/2026, quando o eixo `orientation` entrou pela mesma
 *  camada e o nome passou a mentir: a regra sempre foi "valor simples devolve a classe do
 *  componente, valor responsivo devolve a camada genérica", e isso não tem nada de específico
 *  de tamanho. O check 15 do validate.py lê o PRIMEIRO argumento desta função para saber que
 *  classes o core pode legitimamente conter — se ela for renomeada de novo, ele muda junto.
 *
 *  Estava em `inputs.tsx` como função de módulo e servia só à família de campo. Subiu para cá ao
 *  fechar as três famílias restantes do `G-AXIS-04` (marcação, identidade, glifo), porque a regra
 *  é uma só e escrevê-la de novo em cada módulo é o "47 adaptações manuais independentes" que o
 *  Victor proibiu.
 *
 *  `padrao` existe porque o degrau BASE não é `md` em toda família: o do Spinner é `sm`, e o core
 *  reflete isso (`.spinner` já É o `sm`, e quem tem classe própria é o `md`). Presumir `md` como
 *  base universal é o erro que esta atividade já cometeu duas vezes — uma no padding do campo,
 *  outra na escala de glifo. Aqui ele é PARÂMETRO.
 *
 *  Valor simples devolve a classe de sempre (`input-sm`, `icon-lg`), byte por byte; valor
 *  responsivo devolve a camada.
 *
 *  `eixo` é a FAMÍLIA DE CLASSES da camada responsiva, e ela não é sempre a mesma que `base`.
 *  No `size` os degraus são valores compartilhados, então a família é uma só (`size-lg`) e o
 *  default serve. Em `orientation` as regras são de cada componente — um `btn-group` vertical
 *  não se parece com um `field` horizontal —, então a família é a do componente e a chamada
 *  passa `base` de novo.
 *
 *  Consequência aceita: no eixo de orientação a classe do valor BASE (`btn-group-horizontal`)
 *  é emitida sem ter regra no core, porque horizontal é o desenho de partida. Classe sem regra
 *  não custa nada e mantém a forma da camada uniforme; o inverso — regra sem componente — é que
 *  seria defeito, e é o que o check 15 pega. */
export function peleDoEixo<T extends string>(base:string,valor:Responsive<T>|undefined,padrao:string="md",eixo:string="size"):string|false{
  const v=valorBase(valor);
  return ehResponsivo(valor)?classesResponsivas(eixo,valor):(!!v&&v!==padrao&&`${base}-${v}`);
}

// ── F4: o estado da grade, de ida e de volta da URL ──────────────────────────
// Mora AQUI e não no `data-grid.tsx` pela razão do cabeçalho deste arquivo, e ela
// não é teórica: `gridStateFromParams` é chamado ONDE A URL CHEGA, e num framework
// de componentes de servidor isso é o servidor. Exportado de um módulo com
// `"use client"`, ele viraria referência de cliente e quebraria ao ser CHAMADO —
// exatamente o defeito que a Parte A fechou.
//
// **A grade não decide a URL** (PLANO-1.0, F4). Estas duas funções são só o
// FORMATO. Quem escreve no histórico é o consumidor, que é quem sabe se aquela
// mudança é `push` (entra no botão voltar) ou `replace` (não entra) — e errar isso
// enche o histórico de uma entrada por tecla digitada no filtro.
//
// Os tipos são ESTRUTURAIS de propósito: idênticos ao `SortingState` e ao
// `ColumnFiltersState` do motor, e escrevê-los aqui evita que este arquivo — que é
// o módulo SEM diretiva, importado pelo barril — passe a depender do `@tanstack`.
export interface GridState{sorting?:Array<{id:string;desc:boolean}>;globalFilter?:string;columnFilters?:Array<{id:string;value:unknown}>;page?:number}

// Formato: `sort=-nome,execucoes` (o `-` é descendente) · `q=texto` · `page=2` ·
// `f.<coluna>=valor`, repetido quando a coluna é faceta. Só entra o que está
// ativo, então grade sem filtro nenhum deixa a URL limpa.
//
// `into` preserva o que já estava na busca: uma aplicação real tem `tab=`, `ref=`
// e companhia na mesma URL, e serializar a grade não pode apagá-los.
export function gridStateToParams(state:GridState,into?:URLSearchParams):URLSearchParams{
  const p=new URLSearchParams(into);
  for(const k of [...p.keys()])if(k==="sort"||k==="q"||k==="page"||k.startsWith("f."))p.delete(k);
  if(state.sorting?.length)p.set("sort",state.sorting.map(s=>(s.desc?"-":"")+s.id).join(","));
  if(state.globalFilter)p.set("q",state.globalFilter);
  // página 1 não vai para a URL: é o default, e escrevê-lo só suja o link.
  if(state.page&&state.page>1)p.set("page",String(state.page));
  for(const f of state.columnFilters??[]){
    if(Array.isArray(f.value)){for(const v of f.value)p.append("f."+f.id,String(v))}
    else if(f.value!=null&&f.value!=="")p.set("f."+f.id,String(f.value));
  }
  return p;
}

// `filters` é o MESMO array que a grade recebe, e serve para uma coisa só: saber
// se `f.estado=feito` volta como `"feito"` ou como `["feito"]`. Sem ele a decisão
// cai num palpite — repetido é lista, sozinho é texto —, e uma faceta com UM valor
// escolhido volta como texto e para de filtrar. Passe-o sempre que houver faceta.
export function gridStateFromParams(params:URLSearchParams,filters?:Array<{column:string;facet?:boolean}>):GridState{
  const state:GridState={};
  const sort=params.get("sort");
  if(sort)state.sorting=sort.split(",").filter(Boolean).map(t=>t.startsWith("-")?{id:t.slice(1),desc:true}:{id:t,desc:false});
  const q=params.get("q");
  if(q)state.globalFilter=q;
  const page=Number(params.get("page"));
  if(Number.isFinite(page)&&page>1)state.page=Math.floor(page);
  const colunas:Array<{id:string;value:unknown}>=[];
  for(const k of new Set([...params.keys()].filter(k=>k.startsWith("f.")))){
    const id=k.slice(2),vals=params.getAll(k);
    colunas.push({id,value:(filters?filters.some(f=>f.column===id&&f.facet):vals.length>1)?vals:vals[0]});
  }
  if(colunas.length)state.columnFilters=colunas;
  return state;
}

// ── M2 (13/08/2026): o formato deixa de ser só da grade ──────────────────────────────────────
// O `gridState*` acima resolvia UM componente. Uma tela real tem mais coisa que um link precisa
// carregar: qual aba está aberta, qual modo de exibição, qual item está em detalhe. Sem isto o
// consumidor escreve o seu próprio formato para cada uma, e duas telas do mesmo produto passam a
// ter URLs com vocabulário diferente.
//
// PESQUISADO antes de escrever, e o resultado foi de novo NEGATIVO — o mais útil deste item.
// O `nuqs` é o gerenciador de estado em URL do mercado (adaptadores para Next, React Router,
// TanStack Router e SPA puro, parsers tipados, Sentry/Supabase/Vercel/Clerk usando, mais de um
// milhão de downloads por semana). A Aurea NÃO vai escrever um concorrente disso, e nem poderia:
// gerenciar exige mexer no histórico, e a decisão entre `push` e `replace` é do consumidor —
// está registrada desde o F4, e errá-la enche o histórico de uma entrada por tecla digitada.
//
// O que fica aqui é o FORMATO, que é o que o `nuqs` não tem opinião sobre: como o estado dos
// componentes da Aurea vira busca. É por isso que estas funções não importam nada, não tocam em
// `window` e vivem no módulo SEM diretiva — elas são chamadas ONDE A URL CHEGA, e num framework
// de componentes de servidor isso é o servidor.
//
// As três chaves novas são as que uma TELA tem, e não um componente: `tab`, `view`, `detail`.
// Ficaram curtas de propósito, porque aparecem no link que a pessoa copia e manda.
export interface ScreenState extends GridState{tab?:string;view?:string;detail?:string}
const CHAVES_TELA=["tab","view","detail"] as const;

// `into` preserva o que já estava, pelo mesmo motivo do `gridStateToParams`: uma aplicação real
// tem `ref=`, `utm_*` e companhia na mesma URL, e serializar a tela não pode apagá-los. O que se
// apaga é só o que ESTE formato escreve — senão um estado que saiu continuaria na URL.
export function screenStateToParams(state:ScreenState,into?:URLSearchParams):URLSearchParams{
  const p=gridStateToParams(state,into);
  for(const k of CHAVES_TELA)p.delete(k);
  for(const k of CHAVES_TELA){const v=state[k];if(v)p.set(k,v)}
  return p;
}
export function screenStateFromParams(params:URLSearchParams,filters?:Array<{column:string;facet?:boolean}>):ScreenState{
  const state:ScreenState=gridStateFromParams(params,filters);
  for(const k of CHAVES_TELA){const v=params.get(k);if(v)state[k]=v}
  return state;
}
