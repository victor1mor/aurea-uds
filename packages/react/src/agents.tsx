"use client";
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
import React, {type HTMLAttributes, type OlHTMLAttributes, type ReactNode, type RefAttributes} from "react";
import {cx, useAureaStrings} from "./internal.js";
import {Icon, type IconName} from "./system.js";
import {Status, Badge, Progress, Alert} from "./feedback.js";
import {Avatar} from "./identity.js";
import {DataList} from "./data-display.js";
import {SegmentedControl, Switch} from "./inputs.js";
import {Button, IconButton} from "./actions.js";

// Os seis estados são os da referência, medidos — não inventados aqui. O que muda é
// que cada um vira uma VARIANTE do `Status` que já existe, em vez de uma cor solta:
// a referência escreve `text-yellow-500` no componente, e cor em componente é o que a
// identidade da Aurea proíbe.
export type AgentState="idle"|"thinking"|"running"|"paused"|"error"|"completed";
// Só a variante: o `Status` já desenha o ponto, e um ícone ao lado dele seria a mesma
// informação duas vezes. A primeira versão deste mapa tinha um ícone por estado e
// nenhum era renderizado — código morto nascendo junto com o componente.
const ESTADO:Record<AgentState,"neutral"|"info"|"success"|"warning"|"danger">={
  idle:"neutral",thinking:"info",running:"info",paused:"warning",error:"danger",completed:"success",
};

// AgentStatus — o estado, e nada além dele.
// É `Status` com o vocabulário fixo desta família. Não vale um componente novo pela
// aparência; vale por CONTRATO: sem ele cada aplicação escreveria o seu par
// estado→variante, e a mesma condição apareceria de seis jeitos na mesma tela — que é
// exatamente o que a Parte J existe para impedir, um nível acima.
export function AgentStatus({state="idle",label,className,...props}:HTMLAttributes<HTMLSpanElement>&RefAttributes<HTMLSpanElement>&{state?:AgentState;label?:ReactNode}){
  const s=useAureaStrings();
  return <Status variant={ESTADO[state]} className={className} data-state={state} {...props}>{label??s.agentState[state]}</Status>;
}

export interface AgentCapability{name:string;description?:string;icon?:IconName}

// AgentCard — a identidade do agente: quem é, em que estado está, o que sabe fazer.
export function AgentCard({name,description,avatarSrc,model,state,capabilities,actions,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{name:string;description?:ReactNode;avatarSrc?:string;model?:string;state?:AgentState;capabilities?:AgentCapability[];actions?:ReactNode}){
  return <article className={cx("card","agent-card",className)} {...props}>
    <header className="agent-card-head">
      <Avatar src={avatarSrc} alt={name} fallback={name.slice(0,2)} size="md"/>
      <div className="agent-card-id">
        <strong>{name}</strong>
        {model&&<span className="hint">{model}</span>}
      </div>
      {state&&<AgentStatus state={state}/>}
    </header>
    {description&&<p className="agent-card-desc">{description}</p>}
    {!!capabilities?.length&&<ul className="agent-caps">
      {capabilities.map(c=><li key={c.name} className="agent-cap" title={c.description}>
        {c.icon&&<Icon name={c.icon} size="sm"/>}<span>{c.name}</span>
      </li>)}
    </ul>}
    {actions&&<footer className="agent-card-actions">{actions}</footer>}
  </article>;
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
export function AgentInspector({title,sections,children,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{title:ReactNode;sections?:Array<{label:string;items:Array<{term:string;value:ReactNode}>}>}){
  const s=useAureaStrings();
  const uid=React.useId();
  return <section className={cx("card","agent-inspector",className)} aria-label={typeof title==="string"?title:s.agentInspector} {...props}>
    <header className="agent-inspector-head"><strong>{title}</strong></header>
    {sections?.map((sec,i)=><div key={sec.label} className="agent-inspector-section" role="group" aria-labelledby={`${uid}-${i}`}>
      <p id={`${uid}-${i}`} className="agent-inspector-label">{sec.label}</p>
      <DataList items={sec.items}/>
    </div>)}
    {children}
  </section>;
}

// ─────────────────────────────────────────────────────────────────────────────
// H.b — a execução: uma invocação, e a fila de trabalho.
//
// PROCEDÊNCIA: `agent-elements-main/lib/agent-ui/components/tools/tool-row-base.tsx`
// (a linha de passo, dobrável, com rótulo de "rodando" e de "pronto") e
// `agents-kit-main/components/agents-ui/agent-task-queue.tsx` (os seis estados de
// tarefa e a prioridade em três degraus).

export interface InvocationStep{id:string;label:string;detail?:string;state?:"running"|"done"|"error";content?:ReactNode}

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
export function InvocationPanel({title,input,steps,output,running,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{title?:ReactNode;input?:ReactNode;steps?:InvocationStep[];output?:ReactNode;running?:boolean}){
  const s=useAureaStrings();
  const uid=React.useId();
  return <section className={cx("card","invocation",className)} aria-label={typeof title==="string"?title:s.invocationLabel} aria-busy={running||undefined} {...props}>
    {title&&<header className="invocation-head"><strong>{title}</strong>{running&&<AgentStatus state="running"/>}</header>}
    {input&&<div className="invocation-io" role="group" aria-labelledby={`${uid}-in`}><p id={`${uid}-in`} className="invocation-label">{s.invocationInput}</p><div>{input}</div></div>}
    {!!steps?.length&&<ol className="invocation-steps">
      {steps.map(st=><li key={st.id} className="invocation-step" data-state={st.state??"done"}>
        {st.content
          ?<details><summary>{st.label}{st.detail&&<span className="hint"> · {st.detail}</span>}</summary><div className="invocation-step-body">{st.content}</div></details>
          :<span>{st.label}{st.detail&&<span className="hint"> · {st.detail}</span>}</span>}
      </li>)}
    </ol>}
    {output&&<div className="invocation-io" role="group" aria-labelledby={`${uid}-out`}><p id={`${uid}-out`} className="invocation-label">{s.invocationOutput}</p><div>{output}</div></div>}
  </section>;
}

export type TaskState="queued"|"running"|"completed"|"failed"|"blocked"|"paused";
export type TaskPriority="low"|"medium"|"high";
// Os seis estados e os três degraus de prioridade são os da referência, medidos.
const TAREFA:Record<TaskState,"neutral"|"info"|"success"|"warning"|"danger">={
  queued:"neutral",running:"info",completed:"success",failed:"danger",blocked:"warning",paused:"warning",
};
export interface QueueTask{id:string;title:string;description?:string;state:TaskState;priority?:TaskPriority;progress?:number}

// TaskQueue — a fila de trabalho.
//
// ESCOPO MENOR QUE O DA REFERÊNCIA, e por fronteira, não por preguiça: o `AgentTask` de
// lá tem 15 campos, e cinco deles pertencem a OUTROS componentes desta mesma parte —
// `metrics.tokens` e `metrics.cost` são o `ModelUsage` (H11) e o `CostMeter` (H12),
// `checkpoints` é o `TraceTimeline` (H9), `assignee` é o `AgentCard` (H1). Absorvê-los
// aqui faria a fila responder por quatro contratos e nenhum deles direito.
export function TaskQueue({tasks,label,onRetry,className,...props}:OlHTMLAttributes<HTMLOListElement>&RefAttributes<HTMLOListElement>&{tasks:QueueTask[];label?:string;onRetry?:(task:QueueTask)=>void}){
  const s=useAureaStrings();
  return <ol className={cx("task-queue",className)} aria-label={label??s.taskQueueLabel} {...props}>
    {tasks.map(t=><li key={t.id} className="task-item" data-state={t.state}>
      <div className="task-line">
        <span className="task-title">{t.title}</span>
        {t.priority&&<Badge variant={t.priority==="high"?"warning":"neutral"}>{s.taskPriority[t.priority]}</Badge>}
        <Status variant={TAREFA[t.state]}>{s.taskState[t.state]}</Status>
        {t.state==="failed"&&onRetry&&<IconButton variant="ghost" size="sm" icon="restart" label={`${s.uploadRetry} ${t.title}`} onClick={()=>onRetry(t)}/>}
      </div>
      {t.description&&<p className="task-desc">{t.description}</p>}
      {/* a barra só existe RODANDO: barra parada em 0% de uma tarefa na fila diz que
          algo travou, quando o certo é que ela ainda nem começou. */}
      {t.state==="running"&&t.progress!=null&&<Progress value={Math.round(t.progress*100)} label={t.title}/>}
    </li>)}
  </ol>;
}

// ─────────────────────────────────────────────────────────────────────────────
// H.c — a governança da ação: o que precisa de gente, e o que a ferramenta pode.
//
// PROCEDÊNCIA: `agents-kit-main/components/agents-ui/agent-tool-approval.tsx` (o
// pedido com risco, parâmetros e razão; o histórico com decisão e ator) e
// `agent-elements-main/lib/agent-ui/components/tools/tool-approval-footer.tsx` (o par
// aprovar/negar que, depois de decidido, vira o RESULTADO em vez de sumir).
//
// A referência junta as duas coisas num componente só, com um interruptor "always
// allow" dentro do diálogo de aprovação. Aqui são DOIS, porque são duas decisões com
// tempos diferentes: aprovar é sobre ESTA ação, permitir é sobre TODAS as próximas —
// e misturá-las é como se concede permissão permanente sem perceber.

export type RiskLevel="low"|"medium"|"high";

// HumanApproval — o portão: o que vai acontecer, e a decisão de uma pessoa.
export function HumanApproval({title,description,details,risk,reasoning,deadline,decision,onApprove,onDeny,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{title:ReactNode;description?:ReactNode;details?:Array<{term:string;value:ReactNode}>;risk?:RiskLevel;reasoning?:ReactNode;deadline?:ReactNode;decision?:"approved"|"denied";onApprove?:()=>void;onDeny?:()=>void}){
  const s=useAureaStrings();
  return <section className={cx("card","approval",className)} aria-label={typeof title==="string"?title:s.approvalLabel} {...props}>
    <header className="approval-head">
      <strong>{title}</strong>
      {risk&&<Badge variant={risk==="high"?"danger":risk==="medium"?"warning":"neutral"}>{s.approvalRisk[risk]}</Badge>}
    </header>
    {description&&<p className="approval-desc">{description}</p>}
    {/* Os parâmetros vão em DataList e não em prosa: quem aprova precisa ler o que
        exatamente vai rodar, e um parágrafo esconde um caminho de arquivo no meio. */}
    {!!details?.length&&<DataList items={details}/>}
    {reasoning&&<p className="approval-reason">{reasoning}</p>}
    {deadline&&<p className="hint">{s.approvalDeadline}: {deadline}</p>}
    {/* Decidido, o par de botões vira o RESULTADO — não some. Sumir apaga o rastro do
        que a pessoa escolheu, e é a diferença entre um registro e uma tela limpa. */}
    {decision
      ?<Alert variant={decision==="approved"?"success":"warning"}>{decision==="approved"?s.approvalApproved:s.approvalDenied}</Alert>
      :<footer className="approval-actions">
        <Button variant="secondary" onClick={onDeny}>{s.approvalDeny}</Button>
        <Button variant="primary" onClick={onApprove}>{s.approvalApprove}</Button>
      </footer>}
  </section>;
}

export type PermissionLevel="ask"|"always"|"never";
export interface ToolPermissionEntry{id:string;name:string;description?:string;scope?:string;permission:PermissionLevel}

// ToolPermission — o que cada ferramenta pode, sem perguntar de novo.
//
// A escolha de três vias é um `SegmentedControl`, que já é `radiogroup` do Base UI
// (ADR-0016): setas que movem E selecionam, `Home`/`End`, roving tabindex. Escrever
// três botões alternáveis aqui repetiria à mão o padrão que aquela ADR rejeitou.
export function ToolPermission({tools,onChange,label,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{tools:ToolPermissionEntry[];onChange?:(id:string,permission:PermissionLevel)=>void;label?:string}){
  const s=useAureaStrings();
  const opcoes=[{value:"ask",label:s.permissionAsk},{value:"always",label:s.permissionAlways},{value:"never",label:s.permissionNever}];
  return <section className={cx("card","tool-permission",className)} aria-label={label??s.permissionLabel} {...props}>
    <ul className="tool-permission-list">
      {tools.map(t=><li key={t.id} className="tool-permission-item">
        <div className="tool-permission-id">
          <strong>{t.name}</strong>
          {/* O ESCOPO fica ao lado do nome, não escondido: "ler" e "ler /etc" são
              permissões diferentes, e conceder a segunda achando que é a primeira é
              o defeito que este componente existe para evitar. */}
          {t.scope&&<code className="tool-permission-scope">{t.scope}</code>}
          {t.description&&<span className="hint">{t.description}</span>}
        </div>
        <SegmentedControl items={opcoes} value={t.permission} label={`${t.name}${t.scope?" "+t.scope:""}`} onChange={v=>onChange?.(t.id,v as PermissionLevel)}/>
      </li>)}
    </ul>
  </section>;
}

// ─────────────────────────────────────────────────────────────────────────────
// H.d — a observação: o que aconteceu, quanto demorou, e o que está de pé.
//
// PROCEDÊNCIA: `openstatus-main/packages/ui/src/components/blocks/status-feed.tsx` e
// `status-component-group.tsx` (o feed de eventos e a grade de saúde) e
// `agent-prism-main/packages/ui/src/components/SpanCard/SpanCardTimeline.tsx` (a
// barra posicionada dentro de uma janela `minStart`/`maxEnd`).

export type EventSeverity="info"|"success"|"warning"|"danger";
export interface StreamEvent{id:string;title:ReactNode;time?:ReactNode;severity?:EventSeverity;detail?:ReactNode;group?:string}

// EventStream — o que aconteceu, em ordem, ao vivo.
//
// NÃO é o `LogStream`, e a diferença é de PAPEL, não de aparência: `role="log"` é para
// saída de texto que se acumula; isto é `role="feed"` do APG — uma lista de artigos que
// a pessoa percorre, cada um com título, hora e gravidade próprios. Um evento tem
// estrutura; uma linha de log é texto.
export function EventStream({events,label,follow,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{events:StreamEvent[];label?:string;follow?:boolean}){
  const s=useAureaStrings();
  const fim=React.useRef<HTMLDivElement>(null);
  // "Seguir o fim" é o comportamento que distingue um fluxo ao vivo de uma lista: sem
  // ele, quem está lendo o topo perde o que chega. Com ele E sem controle, quem está
  // lendo o MEIO é arrastado para baixo — por isso é uma prop, e não o default.
  React.useEffect(()=>{if(follow)fim.current?.scrollIntoView({block:"end"})},[events.length,follow]);
  const grupos=events.reduce<Array<{nome?:string;itens:StreamEvent[]}>>((acc,e)=>{
    const ultimo=acc[acc.length-1];
    if(ultimo&&ultimo.nome===e.group)ultimo.itens.push(e);else acc.push({nome:e.group,itens:[e]});
    return acc;
  },[]);
  // O `feed` fica NO GRUPO, e não por fora, e isso é correção medida de 09/08/2026: `feed` só
  // aceita `article` como filho, e o cabeçalho de grupo — que era um `<h3>` — reprovava em
  // `aria-required-children` E em ordem de título, os dois achados pela varredura assim que a
  // prévia do catálogo parou de sair vazia. Agora cada grupo é um feed com NOME próprio (a data),
  // o rótulo deixou de ser título de nível fixo, e sem agrupamento nenhum o feed único continua
  // se chamando como o componente todo.
  return <section className={cx("event-stream",className)} aria-label={label??s.eventStreamLabel} aria-busy={follow||undefined} {...props}>
    {grupos.map((g,gi)=><React.Fragment key={g.nome??gi}>
      {g.nome&&<p className="event-group">{g.nome}</p>}
      <div className="event-group-feed" role="feed" aria-label={g.nome??label??s.eventStreamLabel}>
        {g.itens.map(e=><article key={e.id} className="event-item" data-severity={e.severity??"info"} aria-labelledby={`ev-${e.id}`}>
          <span className="event-dot" aria-hidden="true"/>
          <div className="event-body">
            <span id={`ev-${e.id}`}>{e.title}</span>
            {e.detail&&<span className="hint">{e.detail}</span>}
          </div>
          {e.time&&<time className="event-time">{e.time}</time>}
        </article>)}
      </div>
    </React.Fragment>)}
    <div ref={fim}/>
  </section>;
}

export interface TraceSpan{id:string;label:ReactNode;start:number;end:number;kind?:string;depth?:number;error?:boolean}

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
export function TraceTimeline({spans,label,className,...props}:OlHTMLAttributes<HTMLOListElement>&RefAttributes<HTMLOListElement>&{spans:TraceSpan[];label?:string}){
  const s=useAureaStrings();
  const min=Math.min(...spans.map(x=>x.start),0);
  const max=Math.max(...spans.map(x=>x.end),min+1);
  const janela=max-min||1;
  return <ol className={cx("trace",className)} aria-label={label??s.traceLabel} {...props}>
    {spans.map(sp=>{
      const off=((sp.start-min)/janela)*100,larg=Math.max(((sp.end-sp.start)/janela)*100,1);
      return <li key={sp.id} className="trace-span" data-error={sp.error||undefined} style={{["--trace-depth" as string]:String(sp.depth??0)}}>
        <span className="trace-label">{sp.label}{sp.kind&&<span className="hint"> · {sp.kind}</span>}</span>
        {/* A barra é meter: ela representa uma medida dentro de uma faixa conhecida, e
            não o progresso de uma tarefa. `aria-valuetext` diz a duração em número,
            porque a largura sozinha não é lida por ninguém. */}
        <span className="trace-track" role="meter" aria-label={typeof sp.label==="string"?sp.label:s.traceLabel}
              aria-valuemin={min} aria-valuemax={max} aria-valuenow={sp.end-sp.start}
              aria-valuetext={`${sp.end-sp.start}`}>
          <span className="trace-bar" style={{insetInlineStart:`${off}%`,inlineSize:`${larg}%`}}/>
        </span>
      </li>;
    })}
  </ol>;
}

export type HealthState="operational"|"degraded"|"down"|"maintenance"|"unknown";
export interface HealthEntry{id:string;name:ReactNode;state:HealthState;detail?:ReactNode}
const SAUDE:Record<HealthState,"neutral"|"info"|"success"|"warning"|"danger">={
  operational:"success",degraded:"warning",down:"danger",maintenance:"info",unknown:"neutral",
};

// HealthMatrix — o que está de pé, numa grade.
export function HealthMatrix({entries,label,className,...props}:HTMLAttributes<HTMLUListElement>&RefAttributes<HTMLUListElement>&{entries:HealthEntry[];label?:string}){
  const s=useAureaStrings();
  return <ul className={cx("health-matrix",className)} aria-label={label??s.healthLabel} {...props}>
    {entries.map(e=><li key={e.id} className="health-cell" data-state={e.state}>
      <span className="health-name">{e.name}</span>
      <Status variant={SAUDE[e.state]}>{s.healthState[e.state]}</Status>
      {e.detail&&<span className="hint">{e.detail}</span>}
    </li>)}
  </ul>;
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
const compacto=(n:number,locale:string)=>new Intl.NumberFormat(locale,{notation:"compact",maximumFractionDigits:2}).format(n);
// Duas casas fixas é o que o `costFormatter` da referência usa, e aqui isso MENTE: custo de
// modelo cai em fração de centavo o tempo todo, e "$0.00" para um gasto real de US$ 0,004
// apaga o número justamente no componente que existe para vigiá-lo.
const dinheiro=(n:number,currency:string,locale:string)=>new Intl.NumberFormat(locale,{style:"currency",currency,minimumFractionDigits:2,maximumFractionDigits:n!==0&&Math.abs(n)<0.01?6:2}).format(n);

export type UsageMetric="tokens"|"cost"|"requests";
export interface ModelUsageEntry{id:string;model:string;provider?:string;tokens?:number;cost?:number;requests?:number}

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
export function ModelUsage({entries,metric="tokens",label,currency="USD",locale="en-US",className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{entries:ModelUsageEntry[];metric?:UsageMetric;label?:string;currency?:string;locale?:string}){
  const s=useAureaStrings();
  const valor=(e:ModelUsageEntry)=>(metric==="cost"?e.cost:metric==="requests"?e.requests:e.tokens)??0;
  const fmt=(n:number)=>metric==="cost"?dinheiro(n,currency,locale):compacto(n,locale);
  const total=entries.reduce((a,e)=>a+valor(e),0);
  // Ordem decrescente pela métrica, como a referência (`orderBy` em `ModelCostTable`): uma
  // lista de barras fora de ordem obriga a varrer tudo para achar o maior, que é a única
  // coisa que ela existe para responder de relance. Cópia, não `sort` no array de quem chamou.
  const linhas=[...entries].sort((a,b)=>valor(b)-valor(a));
  return <section className={cx("card","model-usage",className)} aria-label={label??s.modelUsageLabel} {...props}>
    <header className="metric-total">
      <strong>{fmt(total)}</strong>
      <span className="hint">{s.usageMetric[metric]}</span>
    </header>
    <ul className="model-usage-list">
      {linhas.map(e=>{
        const v=valor(e),pct=total>0?(v/total)*100:0;
        return <li key={e.id} className="model-usage-row">
          <span className="model-usage-name">{e.model}{e.provider&&<span className="hint"> · {e.provider}</span>}</span>
          {/* `meter` e não `progressbar`: é uma medida dentro de uma faixa conhecida, não uma
              tarefa avançando — mesmo critério do `TraceTimeline`. E `aria-valuetext` carrega
              o número formatado, porque a largura da barra não é lida por ninguém. */}
          <span className="model-usage-track" role="meter" aria-label={e.model}
                aria-valuemin={0} aria-valuemax={total||1} aria-valuenow={v} aria-valuetext={fmt(v)}>
            <span className="model-usage-bar" style={{inlineSize:`${pct}%`}}/>
          </span>
          <span className="model-usage-value">{fmt(v)}</span>
        </li>;
      })}
    </ul>
  </section>;
}

export interface CostSegment{id:string;label:ReactNode;amount:number}
export type CostState="under"|"near"|"over";

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
export function CostMeter({spent,limit,softLimit,currency="USD",locale="en-US",period,segments,label,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{spent:number;limit?:number;softLimit?:number;currency?:string;locale?:string;period?:ReactNode;segments?:CostSegment[];label?:string}){
  const s=useAureaStrings();
  const fmt=(n:number)=>dinheiro(n,currency,locale);
  const estado:CostState=limit!=null&&spent>=limit?"over":softLimit!=null&&spent>=softLimit?"near":"under";
  const temTeto=limit!=null&&limit>0;
  return <section className={cx("card","cost-meter",className)} data-state={estado} aria-label={label??s.costMeterLabel} {...props}>
    <header className="metric-total">
      <strong>{fmt(spent)}</strong>
      <span className="hint">{period??s.costMeterSpent}</span>
    </header>
    {temTeto&&<>
      {/* `aria-valuenow` fica GRAMPEADO no teto porque valor fora da faixa é inválido em
          ARIA; o gasto verdadeiro — que pode ter estourado — vai no `aria-valuetext`, que
          é onde o número honesto cabe sem quebrar o papel. */}
      <span className="cost-meter-track" role="meter" aria-label={typeof label==="string"?label:s.costMeterLabel}
            aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.min(spent,limit)}
            aria-valuetext={`${fmt(spent)} / ${fmt(limit)}`}>
        <span className="cost-meter-bar" style={{inlineSize:`${Math.min((spent/limit)*100,100)}%`}}/>
      </span>
      <p className="hint">{spent<limit?`${fmt(limit-spent)} ${s.costMeterRemaining}`:s.costMeterExceeded} · {fmt(limit)}</p>
    </>}
    {!!segments?.length&&<DataList items={segments.map(g=>({term:g.label,value:fmt(g.amount)}))}/>}
    {estado!=="under"&&<Alert variant={estado==="over"?"danger":"warning"}>{estado==="over"?s.costMeterOver:s.costMeterNear}</Alert>}
  </section>;
}

// As três ESPÉCIES de memória — episódica, semântica, procedural — são o vocabulário que
// virou padrão de mercado em 2026, medido na pesquisa registrada no `REFERENCES.md`. Os
// três níveis do Letta (`core`/`recall`/`archival`) ficaram de fora de propósito: são a
// arquitetura de UM produto, e travá-los aqui amarraria o contrato a um fornecedor.
export type MemoryScope="episodic"|"semantic"|"procedural";
// E as quatro OPERAÇÕES são o que faz disto um livro-razão e não uma lista: o registro é de
// lançamentos, não de estado atual.
export type MemoryOperation="added"|"updated"|"recalled"|"forgotten";
const LANCAMENTO:Record<MemoryOperation,"success"|"info"|"neutral"|"warning">={
  added:"success",updated:"info",recalled:"neutral",forgotten:"warning",
};
export interface MemoryRecord{id:string;content:ReactNode;scope:MemoryScope;operation:MemoryOperation;time?:ReactNode;source?:ReactNode;details?:Array<{term:string;value:ReactNode}>}

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
export function MemoryLedger({records,label,className,...props}:OlHTMLAttributes<HTMLOListElement>&RefAttributes<HTMLOListElement>&{records:MemoryRecord[];label?:string}){
  const s=useAureaStrings();
  return <ol className={cx("memory-ledger",className)} aria-label={label??s.memoryLabel} {...props}>
    {records.map(r=><li key={r.id} className="memory-entry" data-operation={r.operation} data-scope={r.scope}>
      <div className="memory-line">
        <Badge variant={LANCAMENTO[r.operation]}>{s.memoryOperation[r.operation]}</Badge>
        <Badge>{s.memoryScope[r.scope]}</Badge>
        <span className="memory-content">{r.content}</span>
        {r.time&&<time className="memory-time">{r.time}</time>}
      </div>
      {/* A PROCEDÊNCIA é o terceiro pedaço da composição, e a anatomia é a do `DetailsView/`
          do agent-prism: dobrada por padrão, `<details>` nativo como no `InvocationPanel`.
          Uma memória sem origem não é auditável, e origem aberta o tempo todo empurra o
          conteúdo — que é o que se lê primeiro — para fora da tela. */}
      {(r.source||r.details?.length)&&<details className="memory-provenance">
        <summary>{s.memoryProvenance}</summary>
        {r.source&&<p className="memory-source">{r.source}</p>}
        {!!r.details?.length&&<DataList items={r.details}/>}
      </details>}
    </li>)}
  </ol>;
}

// ─────────────────────────────────────────────────────────────────────────────
// H.f — a relação: quem falou com quem, e a regra que dispara sozinha.
//
// PROCEDÊNCIA: `agents-kit-main/components/agents-ui/agent-orchestrator.tsx` (o
// `CommLogEntry` — `{id, timestamp, from, to, message}` — que é o registro de conversa entre
// agentes) e `agent-routing-hub.tsx` (a RAZÃO do encaminhamento: intenção, confiança e o
// texto do porquê). Mais `langfuse-main/web/src/features/automations/` — o `AutomationSidebar`
// e o `AutomationDetails`, de onde sai a anatomia da regra: gatilho com fonte de evento e
// estado, ação com tipo, e o interruptor que liga e desliga.

export type MessageKind="request"|"response"|"handoff"|"broadcast"|"error";
const RECADO:Record<MessageKind,"info"|"success"|"primary"|"neutral"|"danger">={
  request:"info",response:"success",handoff:"primary",broadcast:"neutral",error:"danger",
};
export interface AgentMessage{id:string;from:string;to?:string;body:ReactNode;time?:ReactNode;kind?:MessageKind;reason?:ReactNode;details?:Array<{term:string;value:ReactNode}>}

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
export function InterAgentMessage({messages,label,className,...props}:OlHTMLAttributes<HTMLOListElement>&RefAttributes<HTMLOListElement>&{messages:AgentMessage[];label?:string}){
  const s=useAureaStrings();
  return <ol className={cx("agent-messages",className)} aria-label={label??s.agentMessageLabel} {...props}>
    {messages.map(m=>{
      const destino=m.to??s.agentMessageBroadcast;
      return <li key={m.id} className="agent-message" data-kind={m.kind??"handoff"}>
        <div className="agent-message-line">
          {/* `group` NOMEADO com a relação por extenso: a seta é do `Icon`, que é sempre
              `aria-hidden`, então sem isto o leitor de tela ouviria "Curator Writer" e a
              direção — que é o dado deste componente — se perderia no espaço entre os dois. */}
          <span className="agent-message-route" role="group" aria-label={`${m.from} ${s.agentMessageTo} ${destino}`}>
            <strong>{m.from}</strong>
            <Icon name="arrow--right" size="sm" className="agent-message-arrow"/>
            {m.to?<strong>{m.to}</strong>:<span className="hint">{destino}</span>}
          </span>
          <Badge variant={RECADO[m.kind??"handoff"]}>{s.agentMessageKind[m.kind??"handoff"]}</Badge>
          {m.time&&<time className="agent-message-time">{m.time}</time>}
        </div>
        <p className="agent-message-body">{m.body}</p>
        {(m.reason||m.details?.length)&&<details className="agent-message-why">
          <summary>{s.agentMessageReason}</summary>
          {m.reason&&<p className="agent-message-reason">{m.reason}</p>}
          {!!m.details?.length&&<DataList items={m.details}/>}
        </details>}
      </li>;
    })}
  </ol>;
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
export function AutomationCard({name,description,trigger,action,enabled,onToggle,lastRun,lastResult,details,actions,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{name:ReactNode;description?:ReactNode;trigger:ReactNode;action:ReactNode;enabled?:boolean;onToggle?:(enabled:boolean)=>void;lastRun?:ReactNode;lastResult?:"success"|"failure";details?:Array<{term:string;value:ReactNode}>;actions?:ReactNode}){
  const s=useAureaStrings();
  return <article className={cx("card","automation",className)} data-enabled={enabled??undefined} {...props}>
    <header className="automation-head">
      <div className="automation-id">
        <strong>{name}</strong>
        {description&&<span className="hint">{description}</span>}
      </div>
      {/* O interruptor é o `Switch` que já existe: ligar e desligar uma regra é exatamente o
          que ele significa, e escrever um segundo aqui duplicaria teclado e estado. O rótulo
          dele é VISÍVEL por construção, então fica curto — o nome da regra está ao lado. */}
      {onToggle&&<Switch checked={!!enabled} onChange={e=>onToggle(e.target.checked)} label={s.automationEnabled}/>}
    </header>
    <DataList items={[{term:s.automationWhen,value:trigger},{term:s.automationThen,value:action},...(details??[])]}/>
    {(lastRun||lastResult)&&<footer className="automation-foot">
      {lastResult&&<Status variant={lastResult==="success"?"success":"danger"}>{s.automationResult[lastResult]}</Status>}
      {lastRun&&<span className="hint">{s.automationLastRun}: {lastRun}</span>}
      {actions}
    </footer>}
    {!lastRun&&!lastResult&&actions&&<footer className="automation-foot">{actions}</footer>}
  </article>;
}
