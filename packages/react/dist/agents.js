"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// A camada operacional — PLANO-1.0, Parte H (09/08/2026).
//
// Um módulo por categoria do registry, como os outros (Fase 9, achado A5). A categoria
// é NOVA: "AI & Agents", da macroárea 18 do `DIRECTION.md`. Ela não estava na lista
// travada dos 13, e a decisão de acrescentá-la está na
// [ADR-0017](../../../decisions/0017-categoria-ai-agents.md) — porque o §2 do
// `DIRECTION.md` se declara "ilustrativo, não-vinculante", então tirar dali uma
// categoria é decisão, não dedução.
//
// PROCEDÊNCIA (BUILDING.md passo 2): estes três saem de `agents-kit-main`
// (`components/agents-ui/agent-card.tsx`, `agent-status-panel.tsx`) e do `DetailsView/`
// do `agent-prism-main`. As sete referências antigas NÃO têm esta família — foi por
// isso que a Parte H ficou bloqueada até 08/08/2026.
//
// Escopo menor que o da referência (passo 5): o `AgentCard` de lá despacha ações por
// STRING (`onAction: (action: string) => void`), o que troca o compilador por um acordo
// verbal. Aqui as ações entram como nó, e quem monta o botão sabe o que ele faz.
import React from "react";
import { cx, useAureaStrings } from "./internal.js";
import { Icon } from "./system.js";
import { Status, Badge, Progress, Alert } from "./feedback.js";
import { Avatar } from "./identity.js";
import { DataList } from "./data-display.js";
import { SegmentedControl, Switch } from "./inputs.js";
import { Button, IconButton } from "./actions.js";
// Só a variante: o `Status` já desenha o ponto, e um ícone ao lado dele seria a mesma
// informação duas vezes. A primeira versão deste mapa tinha um ícone por estado e
// nenhum era renderizado — código morto nascendo junto com o componente.
const ESTADO = {
    idle: "neutral", thinking: "info", running: "info", paused: "warning", error: "danger", completed: "success",
};
// AgentStatus — o estado, e nada além dele.
// É `Status` com o vocabulário fixo desta família. Não vale um componente novo pela
// aparência; vale por CONTRATO: sem ele cada aplicação escreveria o seu par
// estado→variante, e a mesma condição apareceria de seis jeitos na mesma tela — que é
// exatamente o que a Parte J existe para impedir, um nível acima.
export function AgentStatus({ state = "idle", label, className, ...props }) {
    const s = useAureaStrings();
    return _jsx(Status, { variant: ESTADO[state], className: className, "data-state": state, ...props, children: label ?? s.agentState[state] });
}
// AgentCard — a identidade do agente: quem é, em que estado está, o que sabe fazer.
export function AgentCard({ name, description, avatarSrc, model, state, capabilities, actions, className, ...props }) {
    return _jsxs("article", { className: cx("card", "agent-card", className), ...props, children: [_jsxs("header", { className: "agent-card-head", children: [_jsx(Avatar, { src: avatarSrc, alt: name, fallback: name.slice(0, 2), size: "md" }), _jsxs("div", { className: "agent-card-id", children: [_jsx("strong", { children: name }), model && _jsx("span", { className: "hint", children: model })] }), state && _jsx(AgentStatus, { state: state })] }), description && _jsx("p", { className: "agent-card-desc", children: description }), !!capabilities?.length && _jsx("ul", { className: "agent-caps", children: capabilities.map(c => _jsxs("li", { className: "agent-cap", title: c.description, children: [c.icon && _jsx(Icon, { name: c.icon, size: "sm" }), _jsx("span", { children: c.name })] }, c.name)) }), actions && _jsx("footer", { className: "agent-card-actions", children: actions })] });
}
// AgentInspector — o detalhe: configuração, ferramentas, instruções.
// A anatomia é a do `DetailsView/` do `agent-prism`: cabeçalho + seções rotuladas, com
// o valor cru disponível. Aqui as seções são `DataList`, que já existe e já tem pele —
// e o corpo livre entra como filho, para inspecionar o que a ficha não previu.
//
// O rótulo de seção NÃO é `<h3>`, e isso foi corrigido em 09/08/2026 por defeito medido: um
// componente não sabe a que profundidade está na página, e fixar um nível produz salto de
// hierarquia assim que ele entra sob um `<h1>` — foi o que a varredura do catálogo acusou
// (`salto h1 → h3`) no minuto em que a prévia dele passou a renderizar. Cada seção vira um
// `group` NOMEADO pelo próprio rótulo: o leitor de tela continua sabendo onde começa cada
// bloco, e ninguém precisa adivinhar o nível certo.
export function AgentInspector({ title, sections, children, className, ...props }) {
    const s = useAureaStrings();
    const uid = React.useId();
    return _jsxs("section", { className: cx("card", "agent-inspector", className), "aria-label": typeof title === "string" ? title : s.agentInspector, ...props, children: [_jsx("header", { className: "agent-inspector-head", children: _jsx("strong", { children: title }) }), sections?.map((sec, i) => _jsxs("div", { className: "agent-inspector-section", role: "group", "aria-labelledby": `${uid}-${i}`, children: [_jsx("p", { id: `${uid}-${i}`, className: "agent-inspector-label", children: sec.label }), _jsx(DataList, { items: sec.items })] }, sec.label)), children] });
}
// InvocationPanel — UMA execução: o que foi pedido, os passos, o que saiu.
//
// O passo que tem corpo é um `<details>` nativo, o mesmo idioma do `Accordion`: dobrar
// e desdobrar já é comportamento de plataforma, com teclado e ARIA, e a referência
// gasta um `Collapsible` de biblioteca para chegar no mesmo lugar.
//
// `running` marca `aria-busy` na região INTEIRA em vez de animar o texto. A referência
// usa um `TextShimmer` — animação em cima do rótulo — e isso é decoração que um leitor
// de tela não alcança e que `prefers-reduced-motion` teria de desfazer.
//
// Entrada e saída são `group` NOMEADO, e não `<h3>` — mesmo defeito e mesma correção do
// `AgentInspector` (09/08/2026): nível de título fixo dentro de um componente vira salto de
// hierarquia na página que o hospeda.
export function InvocationPanel({ title, input, steps, output, running, className, ...props }) {
    const s = useAureaStrings();
    const uid = React.useId();
    return _jsxs("section", { className: cx("card", "invocation", className), "aria-label": typeof title === "string" ? title : s.invocationLabel, "aria-busy": running || undefined, ...props, children: [title && _jsxs("header", { className: "invocation-head", children: [_jsx("strong", { children: title }), running && _jsx(AgentStatus, { state: "running" })] }), input && _jsxs("div", { className: "invocation-io", role: "group", "aria-labelledby": `${uid}-in`, children: [_jsx("p", { id: `${uid}-in`, className: "invocation-label", children: s.invocationInput }), _jsx("div", { children: input })] }), !!steps?.length && _jsx("ol", { className: "invocation-steps", children: steps.map(st => _jsx("li", { className: "invocation-step", "data-state": st.state ?? "done", children: st.content
                        ? _jsxs("details", { children: [_jsxs("summary", { children: [st.label, st.detail && _jsxs("span", { className: "hint", children: [" \u00B7 ", st.detail] })] }), _jsx("div", { className: "invocation-step-body", children: st.content })] })
                        : _jsxs("span", { children: [st.label, st.detail && _jsxs("span", { className: "hint", children: [" \u00B7 ", st.detail] })] }) }, st.id)) }), output && _jsxs("div", { className: "invocation-io", role: "group", "aria-labelledby": `${uid}-out`, children: [_jsx("p", { id: `${uid}-out`, className: "invocation-label", children: s.invocationOutput }), _jsx("div", { children: output })] })] });
}
// Os seis estados e os três degraus de prioridade são os da referência, medidos.
const TAREFA = {
    queued: "neutral", running: "info", completed: "success", failed: "danger", blocked: "warning", paused: "warning",
};
// TaskQueue — a fila de trabalho.
//
// ESCOPO MENOR QUE O DA REFERÊNCIA, e por fronteira, não por preguiça: o `AgentTask` de
// lá tem 15 campos, e cinco deles pertencem a OUTROS componentes desta mesma parte —
// `metrics.tokens` e `metrics.cost` são o `ModelUsage` (H11) e o `CostMeter` (H12),
// `checkpoints` é o `TraceTimeline` (H9), `assignee` é o `AgentCard` (H1). Absorvê-los
// aqui faria a fila responder por quatro contratos e nenhum deles direito.
export function TaskQueue({ tasks, label, onRetry, className, ...props }) {
    const s = useAureaStrings();
    return _jsx("ol", { className: cx("task-queue", className), "aria-label": label ?? s.taskQueueLabel, ...props, children: tasks.map(t => _jsxs("li", { className: "task-item", "data-state": t.state, children: [_jsxs("div", { className: "task-line", children: [_jsx("span", { className: "task-title", children: t.title }), t.priority && _jsx(Badge, { variant: t.priority === "high" ? "warning" : "neutral", children: s.taskPriority[t.priority] }), _jsx(Status, { variant: TAREFA[t.state], children: s.taskState[t.state] }), t.state === "failed" && onRetry && _jsx(IconButton, { variant: "ghost", size: "sm", icon: "restart", label: `${s.uploadRetry} ${t.title}`, onClick: () => onRetry(t) })] }), t.description && _jsx("p", { className: "task-desc", children: t.description }), t.state === "running" && t.progress != null && _jsx(Progress, { value: Math.round(t.progress * 100), label: t.title })] }, t.id)) });
}
// HumanApproval — o portão: o que vai acontecer, e a decisão de uma pessoa.
export function HumanApproval({ title, description, details, risk, reasoning, deadline, decision, onApprove, onDeny, className, ...props }) {
    const s = useAureaStrings();
    return _jsxs("section", { className: cx("card", "approval", className), "aria-label": typeof title === "string" ? title : s.approvalLabel, ...props, children: [_jsxs("header", { className: "approval-head", children: [_jsx("strong", { children: title }), risk && _jsx(Badge, { variant: risk === "high" ? "danger" : risk === "medium" ? "warning" : "neutral", children: s.approvalRisk[risk] })] }), description && _jsx("p", { className: "approval-desc", children: description }), !!details?.length && _jsx(DataList, { items: details }), reasoning && _jsx("p", { className: "approval-reason", children: reasoning }), deadline && _jsxs("p", { className: "hint", children: [s.approvalDeadline, ": ", deadline] }), decision
                ? _jsx(Alert, { variant: decision === "approved" ? "success" : "warning", children: decision === "approved" ? s.approvalApproved : s.approvalDenied })
                : _jsxs("footer", { className: "approval-actions", children: [_jsx(Button, { variant: "secondary", onClick: onDeny, children: s.approvalDeny }), _jsx(Button, { variant: "primary", onClick: onApprove, children: s.approvalApprove })] })] });
}
// ToolPermission — o que cada ferramenta pode, sem perguntar de novo.
//
// A escolha de três vias é um `SegmentedControl`, que já é `radiogroup` do Base UI
// (ADR-0016): setas que movem E selecionam, `Home`/`End`, roving tabindex. Escrever
// três botões alternáveis aqui repetiria à mão o padrão que aquela ADR rejeitou.
export function ToolPermission({ tools, onChange, label, className, ...props }) {
    const s = useAureaStrings();
    const opcoes = [{ value: "ask", label: s.permissionAsk }, { value: "always", label: s.permissionAlways }, { value: "never", label: s.permissionNever }];
    return _jsx("section", { className: cx("card", "tool-permission", className), "aria-label": label ?? s.permissionLabel, ...props, children: _jsx("ul", { className: "tool-permission-list", children: tools.map(t => _jsxs("li", { className: "tool-permission-item", children: [_jsxs("div", { className: "tool-permission-id", children: [_jsx("strong", { children: t.name }), t.scope && _jsx("code", { className: "tool-permission-scope", children: t.scope }), t.description && _jsx("span", { className: "hint", children: t.description })] }), _jsx(SegmentedControl, { items: opcoes, value: t.permission, label: `${t.name}${t.scope ? " " + t.scope : ""}`, onChange: v => onChange?.(t.id, v) })] }, t.id)) }) });
}
// EventStream — o que aconteceu, em ordem, ao vivo.
//
// NÃO é o `LogStream`, e a diferença é de PAPEL, não de aparência: `role="log"` é para
// saída de texto que se acumula; isto é `role="feed"` do APG — uma lista de artigos que
// a pessoa percorre, cada um com título, hora e gravidade próprios. Um evento tem
// estrutura; uma linha de log é texto.
export function EventStream({ events, label, follow, className, ...props }) {
    const s = useAureaStrings();
    const fim = React.useRef(null);
    // "Seguir o fim" é o comportamento que distingue um fluxo ao vivo de uma lista: sem
    // ele, quem está lendo o topo perde o que chega. Com ele E sem controle, quem está
    // lendo o MEIO é arrastado para baixo — por isso é uma prop, e não o default.
    React.useEffect(() => { if (follow)
        fim.current?.scrollIntoView({ block: "end" }); }, [events.length, follow]);
    const grupos = events.reduce((acc, e) => {
        const ultimo = acc[acc.length - 1];
        if (ultimo && ultimo.nome === e.group)
            ultimo.itens.push(e);
        else
            acc.push({ nome: e.group, itens: [e] });
        return acc;
    }, []);
    // O `feed` fica NO GRUPO, e não por fora, e isso é correção medida de 09/08/2026: `feed` só
    // aceita `article` como filho, e o cabeçalho de grupo — que era um `<h3>` — reprovava em
    // `aria-required-children` E em ordem de título, os dois achados pela varredura assim que a
    // prévia do catálogo parou de sair vazia. Agora cada grupo é um feed com NOME próprio (a data),
    // o rótulo deixou de ser título de nível fixo, e sem agrupamento nenhum o feed único continua
    // se chamando como o componente todo.
    return _jsxs("section", { className: cx("event-stream", className), "aria-label": label ?? s.eventStreamLabel, "aria-busy": follow || undefined, ...props, children: [grupos.map((g, gi) => _jsxs(React.Fragment, { children: [g.nome && _jsx("p", { className: "event-group", children: g.nome }), _jsx("div", { className: "event-group-feed", role: "feed", "aria-label": g.nome ?? label ?? s.eventStreamLabel, children: g.itens.map(e => _jsxs("article", { className: "event-item", "data-severity": e.severity ?? "info", "aria-labelledby": `ev-${e.id}`, children: [_jsx("span", { className: "event-dot", "aria-hidden": "true" }), _jsxs("div", { className: "event-body", children: [_jsx("span", { id: `ev-${e.id}`, children: e.title }), e.detail && _jsx("span", { className: "hint", children: e.detail })] }), e.time && _jsx("time", { className: "event-time", children: e.time })] }, e.id)) })] }, g.nome ?? gi)), _jsx("div", { ref: fim })] });
}
// TraceTimeline — quanto cada passo demorou, em cascata.
//
// NÃO é o `Timeline` que já existe: aquele é uma coluna de momentos (ponto, título,
// hora); este é uma cascata de DURAÇÕES, onde a posição e a largura da barra são o dado.
// A matemática é a da referência: cada barra é (start-min)/(max-min) de deslocamento e
// (end-start)/(max-min) de largura.
//
// O que NÃO entrou: as ONZE cores por categoria de span da referência
// (`llm_call`, `tool_execution`, `retrieval`…). Cor por categoria numa paleta travada é
// o mesmo defeito que o H.a recusou; `kind` entra como TEXTO, que é legível também por
// quem não distingue as cores.
export function TraceTimeline({ spans, label, className, ...props }) {
    const s = useAureaStrings();
    const min = Math.min(...spans.map(x => x.start), 0);
    const max = Math.max(...spans.map(x => x.end), min + 1);
    const janela = max - min || 1;
    return _jsx("ol", { className: cx("trace", className), "aria-label": label ?? s.traceLabel, ...props, children: spans.map(sp => {
            const off = ((sp.start - min) / janela) * 100, larg = Math.max(((sp.end - sp.start) / janela) * 100, 1);
            return _jsxs("li", { className: "trace-span", "data-error": sp.error || undefined, style: { ["--trace-depth"]: String(sp.depth ?? 0) }, children: [_jsxs("span", { className: "trace-label", children: [sp.label, sp.kind && _jsxs("span", { className: "hint", children: [" \u00B7 ", sp.kind] })] }), _jsx("span", { className: "trace-track", role: "meter", "aria-label": typeof sp.label === "string" ? sp.label : s.traceLabel, "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": sp.end - sp.start, "aria-valuetext": `${sp.end - sp.start}`, children: _jsx("span", { className: "trace-bar", style: { insetInlineStart: `${off}%`, inlineSize: `${larg}%` } }) })] }, sp.id);
        }) });
}
const SAUDE = {
    operational: "success", degraded: "warning", down: "danger", maintenance: "info", unknown: "neutral",
};
// HealthMatrix — o que está de pé, numa grade.
export function HealthMatrix({ entries, label, className, ...props }) {
    const s = useAureaStrings();
    return _jsx("ul", { className: cx("health-matrix", className), "aria-label": label ?? s.healthLabel, ...props, children: entries.map(e => _jsxs("li", { className: "health-cell", "data-state": e.state, children: [_jsx("span", { className: "health-name", children: e.name }), _jsx(Status, { variant: SAUDE[e.state], children: s.healthState[e.state] }), e.detail && _jsx("span", { className: "hint", children: e.detail })] }, e.id)) });
}
// ─────────────────────────────────────────────────────────────────────────────
// H.e — custo e memória: quanto se consumiu, contra que teto, e o que ficou guardado.
//
// PROCEDÊNCIA: `langfuse-main/web/src/features/dashboard/components/` — o
// `ModelUsageChart.tsx` (a métrica total no topo e a quebra por modelo), o
// `ModelCostTable.tsx` (as colunas modelo × tokens × custo, com o número à direita), o
// `TotalMetric.tsx` (número grande + descrição, e é UMA linha de arranjo) e o
// `cards/BarListChartArea.tsx` (a lista de barras horizontais com rótulo de valor).
// Mais `agent-prism-main/packages/ui/src/components/{TokensBadge,PriceBadge}.tsx` — o par
// de unidades desta família, contagem e preço — e `agents-kit-main/components/agents-ui/
// agent-status-panel.tsx`, que traz a tarifa por 1k tokens com entrada e saída separadas.
//
// O `MemoryLedger` NÃO TEM REFERÊNCIA, e é o caso declarado no `BUILDING.md` §1: nasce de
// pesquisa registrada no `REFERENCES.md` e de composição. A pesquisa está lá com data.
// Formatação de número: `Intl` é a plataforma, e o locale entra como prop com default
// FIXO. O default fixo é o que mantém a saída determinística no SSR do catálogo e no gate
// de pixel — locale do ambiente mudaria o texto entre a máquina e a CI. A referência faz
// igual: o `costFormatter` do langfuse é `Intl.NumberFormat("en-US")` pregado, medido em
// `web/src/utils/numbers.ts`.
const compacto = (n, locale) => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(n);
// Duas casas fixas é o que o `costFormatter` da referência usa, e aqui isso MENTE: custo de
// modelo cai em fração de centavo o tempo todo, e "$0.00" para um gasto real de US$ 0,004
// apaga o número justamente no componente que existe para vigiá-lo.
const dinheiro = (n, currency, locale) => new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: n !== 0 && Math.abs(n) < 0.01 ? 6 : 2 }).format(n);
// ModelUsage — o consumo repartido POR MODELO.
//
// NÃO é o `CostMeter`, e a diferença é de PAPEL, como a do `EventStream` para o `LogStream`:
// aqui a barra é FATIA DE UMA SOMA — o teto é o próprio total, e a pergunta é "qual modelo
// levou quanto". No `CostMeter` o teto vem de fora, e a pergunta é "quanto ainda cabe".
// Trocar um pelo outro é mostrar orçamento onde não existe orçamento nenhum.
//
// ESCOPO MENOR QUE O DA REFERÊNCIA (passo 5): as quatro abas de lá (`Cost by model`,
// `Cost by type`, `Usage by model`, `Usage by type`) existem porque são quatro CONSULTAS
// diferentes no produto dela. Aqui a dimensão é uma prop e os dados chegam prontos. Também
// ficaram fora o seletor de modelos em popover e a série temporal — a série é o `Chart`,
// que já existe, e embutir um segundo gráfico aqui duplicaria aquele contrato.
export function ModelUsage({ entries, metric = "tokens", label, currency = "USD", locale = "en-US", className, ...props }) {
    const s = useAureaStrings();
    const valor = (e) => (metric === "cost" ? e.cost : metric === "requests" ? e.requests : e.tokens) ?? 0;
    const fmt = (n) => metric === "cost" ? dinheiro(n, currency, locale) : compacto(n, locale);
    const total = entries.reduce((a, e) => a + valor(e), 0);
    // Ordem decrescente pela métrica, como a referência (`orderBy` em `ModelCostTable`): uma
    // lista de barras fora de ordem obriga a varrer tudo para achar o maior, que é a única
    // coisa que ela existe para responder de relance. Cópia, não `sort` no array de quem chamou.
    const linhas = [...entries].sort((a, b) => valor(b) - valor(a));
    return _jsxs("section", { className: cx("card", "model-usage", className), "aria-label": label ?? s.modelUsageLabel, ...props, children: [_jsxs("header", { className: "metric-total", children: [_jsx("strong", { children: fmt(total) }), _jsx("span", { className: "hint", children: s.usageMetric[metric] })] }), _jsx("ul", { className: "model-usage-list", children: linhas.map(e => {
                    const v = valor(e), pct = total > 0 ? (v / total) * 100 : 0;
                    return _jsxs("li", { className: "model-usage-row", children: [_jsxs("span", { className: "model-usage-name", children: [e.model, e.provider && _jsxs("span", { className: "hint", children: [" \u00B7 ", e.provider] })] }), _jsx("span", { className: "model-usage-track", role: "meter", "aria-label": e.model, "aria-valuemin": 0, "aria-valuemax": total || 1, "aria-valuenow": v, "aria-valuetext": fmt(v), children: _jsx("span", { className: "model-usage-bar", style: { inlineSize: `${pct}%` } }) }), _jsx("span", { className: "model-usage-value", children: fmt(v) })] }, e.id);
                }) })] });
}
// CostMeter — o gasto contra um TETO.
//
// Os dois limites são os do LiteLLM, que é o padrão de mercado de controle de custo de LLM
// medido em 09/08/2026 (pesquisa registrada no `REFERENCES.md`): o limite RÍGIDO bloqueia,
// o limite BRANDO só avisa. Nenhuma das nove referências locais tem orçamento — o langfuse
// OSS mostra custo e não teto —, então isto veio pelo passo 4 do `BUILDING.md`, pesquisado
// antes de escrever, e não de memória.
//
// Sem `softLimit` NÃO EXISTE estado de aviso. A tentação era derivar um em 80% do teto;
// 80% é um número inventado, e um alerta que aparece sozinho num limiar que ninguém
// configurou é ruído com aparência de política.
export function CostMeter({ spent, limit, softLimit, currency = "USD", locale = "en-US", period, segments, label, className, ...props }) {
    const s = useAureaStrings();
    const fmt = (n) => dinheiro(n, currency, locale);
    const estado = limit != null && spent >= limit ? "over" : softLimit != null && spent >= softLimit ? "near" : "under";
    const temTeto = limit != null && limit > 0;
    return _jsxs("section", { className: cx("card", "cost-meter", className), "data-state": estado, "aria-label": label ?? s.costMeterLabel, ...props, children: [_jsxs("header", { className: "metric-total", children: [_jsx("strong", { children: fmt(spent) }), _jsx("span", { className: "hint", children: period ?? s.costMeterSpent })] }), temTeto && _jsxs(_Fragment, { children: [_jsx("span", { className: "cost-meter-track", role: "meter", "aria-label": typeof label === "string" ? label : s.costMeterLabel, "aria-valuemin": 0, "aria-valuemax": limit, "aria-valuenow": Math.min(spent, limit), "aria-valuetext": `${fmt(spent)} / ${fmt(limit)}`, children: _jsx("span", { className: "cost-meter-bar", style: { inlineSize: `${Math.min((spent / limit) * 100, 100)}%` } }) }), _jsxs("p", { className: "hint", children: [spent < limit ? `${fmt(limit - spent)} ${s.costMeterRemaining}` : s.costMeterExceeded, " \u00B7 ", fmt(limit)] })] }), !!segments?.length && _jsx(DataList, { items: segments.map(g => ({ term: g.label, value: fmt(g.amount) })) }), estado !== "under" && _jsx(Alert, { variant: estado === "over" ? "danger" : "warning", children: estado === "over" ? s.costMeterOver : s.costMeterNear })] });
}
const LANCAMENTO = {
    added: "success", updated: "info", recalled: "neutral", forgotten: "warning",
};
// MemoryLedger — o que o agente guardou, esqueceu ou lembrou, e DE ONDE veio.
//
// É o único da Parte H sem referência no mundo aberto: o ADE do Letta só abre o servidor, o
// OpenMemory do mem0 está sendo descontinuado e o painel do mem0 é só na nuvem. Medido em
// 08/08/2026 e reconfirmado em 09/08.
//
// Livro-razão é APENDE-SÓ, e é isso que o separa de uma lista de memórias: `forgotten` não
// tira a linha, registra o esquecimento. Uma tela que apaga a linha ao esquecer perde
// exatamente a informação que se procura quando o agente para de saber uma coisa.
//
// NÃO usa o `DataGrid`, e a razão é medida: `data-grid.tsx` mora em subpath próprio porque
// carrega o `@tanstack/react-table` como peer OPCIONAL (check 19), e este módulo sai pelo
// barril leve. Importá-lo aqui faria quem instala a biblioteca pelo Button passar a precisar
// da tabela. O plano previa o contrário; a fronteira do pacote vence o plano. Quem quiser
// ordenar e filtrar o razão compõe as duas coisas na aplicação — o exemplo do catálogo mostra.
export function MemoryLedger({ records, label, className, ...props }) {
    const s = useAureaStrings();
    return _jsx("ol", { className: cx("memory-ledger", className), "aria-label": label ?? s.memoryLabel, ...props, children: records.map(r => _jsxs("li", { className: "memory-entry", "data-operation": r.operation, "data-scope": r.scope, children: [_jsxs("div", { className: "memory-line", children: [_jsx(Badge, { variant: LANCAMENTO[r.operation], children: s.memoryOperation[r.operation] }), _jsx(Badge, { children: s.memoryScope[r.scope] }), _jsx("span", { className: "memory-content", children: r.content }), r.time && _jsx("time", { className: "memory-time", children: r.time })] }), (r.source || r.details?.length) && _jsxs("details", { className: "memory-provenance", children: [_jsx("summary", { children: s.memoryProvenance }), r.source && _jsx("p", { className: "memory-source", children: r.source }), !!r.details?.length && _jsx(DataList, { items: r.details })] })] }, r.id)) });
}
const RECADO = {
    request: "info", response: "success", handoff: "primary", broadcast: "neutral", error: "danger",
};
// InterAgentMessage — o recado de um agente para outro.
//
// NÃO é o `MessageList`, e a diferença é de PAPEL, como todas as desta parte: aquele é uma
// conversa com uma PESSOA — autor, corpo, hora, recibo de leitura. Aqui a DIREÇÃO é o dado:
// tem um remetente e um destinatário, e é a passagem entre os dois que se está lendo. Um
// `MessageList` com dois autores não diz quem entregou o quê a quem.
//
// O que NÃO entrou: as seis cores por intenção do `agent-routing-hub` (`technical` ciano,
// `billing` âmbar, `sales` ardósia…). É a TERCEIRA vez que esta parte recusa a mesma coisa —
// depois das onze de span no H.d e das seis de estado no H.a. Cor por categoria numa paleta
// travada não é legível para quem não separa as cores. A `kind` entra como palavra, num selo.
export function InterAgentMessage({ messages, label, className, ...props }) {
    const s = useAureaStrings();
    return _jsx("ol", { className: cx("agent-messages", className), "aria-label": label ?? s.agentMessageLabel, ...props, children: messages.map(m => {
            const destino = m.to ?? s.agentMessageBroadcast;
            return _jsxs("li", { className: "agent-message", "data-kind": m.kind ?? "handoff", children: [_jsxs("div", { className: "agent-message-line", children: [_jsxs("span", { className: "agent-message-route", role: "group", "aria-label": `${m.from} ${s.agentMessageTo} ${destino}`, children: [_jsx("strong", { children: m.from }), _jsx(Icon, { name: "arrow--right", size: "sm", className: "agent-message-arrow" }), m.to ? _jsx("strong", { children: m.to }) : _jsx("span", { className: "hint", children: destino })] }), _jsx(Badge, { variant: RECADO[m.kind ?? "handoff"], children: s.agentMessageKind[m.kind ?? "handoff"] }), m.time && _jsx("time", { className: "agent-message-time", children: m.time })] }), _jsx("p", { className: "agent-message-body", children: m.body }), (m.reason || m.details?.length) && _jsxs("details", { className: "agent-message-why", children: [_jsx("summary", { children: s.agentMessageReason }), m.reason && _jsx("p", { className: "agent-message-reason", children: m.reason }), !!m.details?.length && _jsx(DataList, { items: m.details })] })] }, m.id);
        }) });
}
// AutomationCard — a regra que roda sozinha: QUANDO isto, ENTÃO aquilo.
//
// A anatomia é a do `AutomationSidebar` do langfuse, medida: nome, gatilho (fonte de evento) e
// ação (tipo), mais o estado ativo/inativo. É isso que separa este cartão do `AgentCard`, que é
// identidade, e da `TaskQueue`, que é trabalho enfileirado: uma automação é uma REGRA, e regra
// é uma condição e uma consequência.
//
// O par QUANDO/ENTÃO entra em `DataList`, que já existe e já é o par termo/valor da casa — a
// mesma escolha do `HumanApproval` para os parâmetros, e pelo mesmo motivo: quem lê precisa
// achar a condição sem varrer um parágrafo.
//
// O que NÃO entrou: o histórico de execuções. Na referência ele é uma aba com tabela dentro do
// mesmo componente; aqui já existem `DataGrid` e `EventStream` para isso, e absorvê-lo faria o
// cartão responder por dois contratos — o erro que o `TaskQueue` recusou no H.b.
export function AutomationCard({ name, description, trigger, action, enabled, onToggle, lastRun, lastResult, details, actions, className, ...props }) {
    const s = useAureaStrings();
    return _jsxs("article", { className: cx("card", "automation", className), "data-enabled": enabled ?? undefined, ...props, children: [_jsxs("header", { className: "automation-head", children: [_jsxs("div", { className: "automation-id", children: [_jsx("strong", { children: name }), description && _jsx("span", { className: "hint", children: description })] }), onToggle && _jsx(Switch, { checked: !!enabled, onChange: e => onToggle(e.target.checked), label: s.automationEnabled })] }), _jsx(DataList, { items: [{ term: s.automationWhen, value: trigger }, { term: s.automationThen, value: action }, ...(details ?? [])] }), (lastRun || lastResult) && _jsxs("footer", { className: "automation-foot", children: [lastResult && _jsx(Status, { variant: lastResult === "success" ? "success" : "danger", children: s.automationResult[lastResult] }), lastRun && _jsxs("span", { className: "hint", children: [s.automationLastRun, ": ", lastRun] }), actions] }), !lastRun && !lastResult && actions && _jsx("footer", { className: "automation-foot", children: actions })] });
}
