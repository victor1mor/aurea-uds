import { type ReactElement } from "react";
export declare const cx: (...v: Array<string | false | null | undefined>) => string;
export declare function fundirRender(render: ReactElement | undefined, props: {
    className?: string;
} & Record<string, unknown>, padrao?: string): ReactElement;
export type AureaTheme = "dark" | "light";
export type AureaDensity = "compact" | "comfortable" | "spacious";
export type UniversalState = "waiting_user" | "waiting_approval" | "waiting_dependency" | "offline" | "stale" | "partial" | "degraded";
export declare const universalStates: readonly UniversalState[];
export declare const stateSeverity: (state: UniversalState) => "info" | "warning";
export interface AureaStrings {
    passwordShow: string;
    passwordHide: string;
    skipToContent: string;
    close: string;
    confirmCancel: string;
    dataError: string;
    dataEmpty: string;
    confirmProceed: string;
    paginationLabel: string;
    previous: string;
    next: string;
    breadcrumbLabel: string;
    tabsLabel: string;
    optionsLabel: string;
    tableLabel: string;
    commandLabel: string;
    commandPlaceholder: string;
    dismissNotification: string;
    toolbarLabel: string;
    loading: string;
    otpDigit: string;
    stepperLabel: string;
    increment: string;
    decrement: string;
    comboboxEmpty: string;
    comboboxClear: string;
    comboboxOpen: string;
    comboboxRemove: string;
    comboboxLoading: string;
    fileDropPrompt: string;
    fileAdded: string;
    fileRemoved: string;
    fileRemove: string;
    fileTooLarge: string;
    fileWrongType: string;
    treeLabel: string;
    notificationsLabel: string;
    notificationMarkAll: string;
    notificationEmpty: string;
    notificationUnread: string;
    notificationNew: string;
    dataGridFilter: string;
    dataGridEmpty: string;
    dataGridSelectAll: string;
    dataGridSelectRow: string;
    dataGridSelected: string;
    dataGridClearSelection: string;
    dataGridBulkLabel: string;
    dataGridColumns: string;
    dataGridResize: string;
    dataGridStale: string;
    dataGridPartial: string;
    dataGridError: string;
    dataGridDetails: string;
    dataGridDetailPanel: string;
    dataGridExport: string;
    dataGridExportRows: string;
    dataGridExportFiltered: string;
    dataGridExportSelected: string;
    mediaPlayer: string;
    mediaPlay: string;
    mediaPause: string;
    mediaMute: string;
    mediaUnmute: string;
    mediaSeek: string;
    mediaVolume: string;
    mediaCaptionsShow: string;
    mediaCaptionsHide: string;
    mediaSkipBack: string;
    mediaSkipForward: string;
    mediaFullscreenEnter: string;
    mediaFullscreenExit: string;
    mediaEmbedOpen: string;
    carouselLabel: string;
    carouselSlide: string;
    positionOf: string;
    carouselPrev: string;
    carouselNext: string;
    galleryLabel: string;
    sortableLabel: string;
    sortableHandle: string;
    sortableHelp: string;
    sortableGrabbed: string;
    sortableDropped: string;
    sortableMoved: string;
    sortableCanceled: string;
    blockEditorLabel: string;
    blockLabel: string;
    blockRemove: string;
    uploadSending: string;
    uploadCancel: string;
    uploadRetry: string;
    uploadError: string;
    uploadCanceled: string;
    uploadComplete: string;
    uploadPause: string;
    uploadResume: string;
    uploadPaused: string;
    uploadPending: string;
    uploadChecksum: string;
    uploadChecksumBad: string;
    fileConflict: string;
    fileReplace: string;
    fileKeepBoth: string;
    fileSkip: string;
    uploadReceipt: string;
    uploadReceiptCopy: string;
    agentInspector: string;
    invocationLabel: string;
    invocationInput: string;
    invocationOutput: string;
    taskQueueLabel: string;
    taskState: Record<"queued" | "running" | "completed" | "failed" | "blocked" | "paused", string>;
    taskPriority: Record<"low" | "medium" | "high", string>;
    approvalLabel: string;
    approvalApprove: string;
    approvalDeny: string;
    approvalApproved: string;
    approvalDenied: string;
    approvalDeadline: string;
    approvalRisk: Record<"low" | "medium" | "high", string>;
    permissionLabel: string;
    permissionAsk: string;
    permissionAlways: string;
    permissionNever: string;
    eventStreamLabel: string;
    traceLabel: string;
    healthLabel: string;
    healthState: Record<"operational" | "degraded" | "down" | "maintenance" | "unknown", string>;
    modelUsageLabel: string;
    usageMetric: Record<"tokens" | "cost" | "requests", string>;
    costMeterLabel: string;
    costMeterSpent: string;
    costMeterRemaining: string;
    costMeterExceeded: string;
    costMeterNear: string;
    costMeterOver: string;
    memoryLabel: string;
    memoryProvenance: string;
    memoryOperation: Record<"added" | "updated" | "recalled" | "forgotten", string>;
    memoryScope: Record<"episodic" | "semantic" | "procedural", string>;
    agentMessageLabel: string;
    agentMessageTo: string;
    agentMessageBroadcast: string;
    agentMessageReason: string;
    agentMessageKind: Record<"request" | "response" | "handoff" | "broadcast" | "error", string>;
    automationWhen: string;
    automationThen: string;
    automationEnabled: string;
    automationLastRun: string;
    automationResult: Record<"success" | "failure", string>;
    graphLabel: string;
    agentState: Record<"idle" | "thinking" | "running" | "paused" | "error" | "completed", string>;
    codeEditor: string;
    chatLabel: string;
    chatMessage: string;
    chatSend: string;
    qrCode: string;
    chartLabel: string;
    copyCode: string;
    tocLabel: string;
    navigationToggle: string;
    sidebarLabel: string;
    bottomNavLabel: string;
    themeToDark: string;
    themeToLight: string;
    universalState: Record<UniversalState, string>;
}
export declare const defaultStrings: AureaStrings;
export declare const ptBR: AureaStrings;
export declare const defaultSpriteUrl = "/aurea-icons.svg";
/** Os pontos da escala vêm de `escala.tsx`, que é GERADO da mesma leitura dos tokens que produz
 *  as `@media`/`@container` do core. Até 22/08/2026 eles eram escritos aqui à mão, e isso era
 *  seguro só enquanto ninguém comparava largura em JavaScript. Com o resolvedor de runtime do
 *  `G-AXIS-06` deixou de ser: número repetido em CSS, tipo, `matchMedia` e observer são quatro
 *  lugares para divergir. Agora há um. */
export type { Breakpoint, ContainerBreakpoint } from "./escala.js";
export { ESCALA, ESCALA_CONTAINER } from "./escala.js";
import type { Breakpoint, ContainerBreakpoint } from "./escala.js";
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
export declare function soOValor<T>(fn: ((v: T) => void) | undefined): ((v: T) => void) | undefined;
export type Orientation = "horizontal" | "vertical";
/** Um valor que pode ser simples, responsivo por VIEWPORT ou adaptativo por CONTAINER.
 *
 *  Os dois últimos são MUTUAMENTE EXCLUSIVOS por tipo (`never` no ramo oposto), e é decisão: um
 *  valor que reage aos dois ao mesmo tempo teria precedência ambígua, e a API deixaria de dizer a
 *  que ele responde — que é exatamente o que não pode acontecer. Quem precisa dos dois tem uma
 *  pergunta de desenho para responder, não um default para herdar. */
export type Responsive<T extends string> = T | {
    base: T;
    viewport: Partial<Record<Breakpoint, T>>;
    container?: never;
} | {
    base: T;
    container: Partial<Record<ContainerBreakpoint, T>>;
    viewport?: never;
};
/** O valor BASE de um responsivo — o que vale antes de qualquer ponto da escala, e o que um
 *  ambiente sem suporte a `@container` continua mostrando. */
export declare function valorBase<T extends string>(v: Responsive<T> | undefined): T | undefined;
/** `true` quando o valor pede a camada genérica (`size-*`) em vez da classe do componente. */
export declare function ehResponsivo<T extends string>(v: Responsive<T> | undefined): boolean;
/** As classes de um valor responsivo, para um eixo da camada compartilhada.
 *
 *  `eixo` é o nome da família de regras no core (hoje só `size`), e não o nome do componente: a
 *  camada é genérica de propósito — a explosão combinatória (passos × pontos) fica lá, uma vez,
 *  em vez de uma vez por peça.
 *
 *  Devolve `""` para valor simples: nesse caso o componente segue emitindo a própria classe
 *  (`btn-sm`), que produz exatamente o mesmo computado. É o que mantém a mudança SOMATIVA — nenhum
 *  consumidor existente muda de classe, e nenhuma baseline de pixel se mexe. */
export declare function classesResponsivas<T extends string>(eixo: string, v: Responsive<T> | undefined): string;
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
export declare function peleDoEixo<T extends string>(base: string, valor: Responsive<T> | undefined, padrao?: string, eixo?: string): string | false;
export interface GridState {
    sorting?: Array<{
        id: string;
        desc: boolean;
    }>;
    globalFilter?: string;
    columnFilters?: Array<{
        id: string;
        value: unknown;
    }>;
    page?: number;
}
export declare function gridStateToParams(state: GridState, into?: URLSearchParams): URLSearchParams;
export declare function gridStateFromParams(params: URLSearchParams, filters?: Array<{
    column: string;
    facet?: boolean;
}>): GridState;
export interface ScreenState extends GridState {
    tab?: string;
    view?: string;
    detail?: string;
}
export declare function screenStateToParams(state: ScreenState, into?: URLSearchParams): URLSearchParams;
export declare function screenStateFromParams(params: URLSearchParams, filters?: Array<{
    column: string;
    facet?: boolean;
}>): ScreenState;
