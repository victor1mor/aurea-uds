"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
import {peleDoEixo, type Responsive} from "./pure.js";
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type HTMLAttributes, type RefAttributes, type ReactNode} from "react";
import {Popover as BasePopover} from "@base-ui/react/popover";
import {cx, useAureaStrings, usePortalContainer, stateSeverity, type UniversalState} from "./internal.js";
import {Icon, type IconName} from "./system.js";
import {Button, IconButton} from "./actions.js";
// NotificationCenter aceita `side`: o tipo é do módulo que define overlay, não uma cópia.
import {type OverlaySide} from "./overlays.js";

// `oracle` saiu daqui (achado M9, 26/07/2026): estava no tipo e no CSS, e NÃO estava na
// ficha — ou seja, era superfície pública que o contrato não declarava. E é vocabulário do
// app de origem (papel de agente), não do sistema, como as classes de domínio que o achado
// A6 mapeou. As classes `.badge-oracle`/`.btn-oracle` seguem no core porque o
// `apps/docs/index.html` escrito à mão as usa; saem junto com ele, na Fase 4 do plano.
// `.btn-oracle` nunca foi alcançável pelo React — `ButtonVariant` não tem `oracle`.
import {Skeleton, type BadgeVariant} from "./markup.js";
export type StatusVariant="neutral"|"online"|"offline"|"busy"|"away"|"running"|"success"|"warning"|"danger"|"info";
// Status (DIRECTION §3.6): condição OPERACIONAL — ponto + rótulo. Não é Badge: Badge é
// metadado curto num pill; Status diz em que estado a coisa está. Reusa o .status-dot que
// já existia solto. A variante colore só o PONTO (currentColor); o rótulo fica legível em
// --foreground. Cor não é o único sinal — quem diz o estado é o texto (WCAG 1.4.1); o
// ponto é decorativo e sai do leitor de tela. ponytail: rótulo é do consumidor (sem i18n
// nova) — a variante é só a cor.
// `state` (Parte J) é EIXO À PARTE de `variant`, e os dois convivem: a variante é a cor do
// ponto, o estado é a condição universal. Quem passa `state` e não passa `variant` recebe a
// cor derivada — `offline` fica com o ponto vazado que ele já tinha desde sempre, os outros
// seis caem na gravidade. Quem passa os dois manda, porque só o consumidor sabe se aquele
// "esperando" dele é grave. E o rótulo é o do consumidor, como sempre foi: a string universal
// entra só quando não há filho, para o componente não passar a inventar texto.
export function Status({variant,state,children,className,...props}:HTMLAttributes<HTMLSpanElement>&RefAttributes<HTMLSpanElement>&{variant?:StatusVariant;state?:UniversalState}){const s=useAureaStrings();const v=variant??(state?(state==="offline"?"offline":stateSeverity(state)):"neutral");return <span className={cx("status",v!=="neutral"&&`status-${v}`,className)} data-state={state} {...props}><i className="status-dot" aria-hidden="true"/><span className="status-label">{children??(state?s.universalState[state]:null)}</span></span>}

export type AlertVariant="info"|"success"|"warning"|"danger";
// O ícone é FUNÇÃO da variante, como o `role` já era. A referência congelada desenha o alerta
// com ele em toda variante, e um sistema que faz o consumidor lembrar qual glifo significa
// "perigo" acaba com quatro respostas diferentes para a mesma pergunta. `icon` sobrepõe quando o
// caso é específico. O Banner NÃO ganha o mesmo padrão de propósito: ele não existe na
// referência e o aviso de largura de página nem sempre quer glifo — a assimetria é decidida,
// não herdada.
const ICONE_DA_VARIANTE:Record<AlertVariant,IconName>={info:"information--filled",
success:"checkmark--filled",warning:"warning--alt--filled",danger:"error--filled"};
// A grade do `.alert` tem TRÊS trilhas (auto 1fr auto): ícone, corpo, ação. Uma versão anterior
// emitia o título solto na trilha 1 — a do ícone — e o corpo como item anônimo. Medido no
// navegador em 21/08/2026: o título ocupava a coluna do ícone e crescia com o próprio texto,
// enquanto a referência dá 300px de trilha ao ícone e 544px ao corpo. Título e corpo vão JUNTOS
// na trilha 2, dentro de um <div>, que é o que a referência faz.
// `<strong>` e não `<h4>`: um alerta aparece em qualquer profundidade da página e um h4 fixo
// quebra a ordem de cabeçalhos onde ele cair (é a razão de o EmptyState ter `titleAs`).
//
// A anatomia das três trilhas voltou em 29/08/2026: o merge das duas linhagens ficou com a
// versão sem ícone, e os oito testes do `grade-do-core.test.tsx` foram o que pegou. `state` é da
// outra linhagem e fica: é EIXO À PARTE de `variant` — a variante é a cor, o estado é a condição
// universal. Quem passa só `state` recebe a cor derivada da gravidade e o rótulo universal
// quando não há filho; quem passa os dois manda, porque só o consumidor sabe se aquele
// "esperando" dele é grave.
export function Alert({variant,state,title,icon,onDismiss,children,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{variant?:AlertVariant;state?:UniversalState;title?:ReactNode;icon?:IconName;onDismiss?:()=>void}){const s=useAureaStrings();const v=variant??(state?stateSeverity(state):"info");return <div className={cx("alert",`alert-${v}`,className)} role={v==="danger"?"alert":"status"} data-state={state} {...props}><Icon name={icon??ICONE_DA_VARIANTE[v]}/><div>{title&&<strong>{title}</strong>}{children??(state?s.universalState[state]:null)}</div>{onDismiss?<IconButton variant="ghost" size="sm" icon="close" label={s.close} onClick={onDismiss}/>:<span/>}</div>}
// Banner: aviso de largura de página, opcionalmente dispensável. Os <span/> vazios
// preservam as 3 colunas do grid quando não há ícone ou botão de dispensar.
export type BannerVariant=AlertVariant;
export function Banner({variant,state,title,icon,onDismiss,children,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{variant?:BannerVariant;state?:UniversalState;title?:ReactNode;icon?:IconName;onDismiss?:()=>void}){const s=useAureaStrings();const v=variant??(state?stateSeverity(state):"info");return <div className={cx("banner",`banner-${v}`,className)} role={v==="danger"?"alert":"status"} data-state={state} {...props}>{icon?<Icon name={icon}/>:<span/>}<div>{title&&<strong>{title}</strong>}{children??(state?s.universalState[state]:null)}</div>{onDismiss?<IconButton variant="ghost" size="sm" icon="close" label={s.close} onClick={onDismiss}/>:<span/>}</div>}
// A barra grampeava 0..100 e o `aria-valuenow` NÃO — medido ao publicar o contrato de API na
// Parte E: com value=150 o desenho parava em 100% e o leitor de tela anunciava "150 de 100".
// A causa é a de sempre: o grampo existia num lugar só. Agora é UMA expressão que serve os dois,
// então não há como divergirem de novo.
// SÓ DETERMINADA, de propósito: não há modo indeterminado nem `.progress` para ele no core. A
// ficha dizia que havia e era falso — corrigido junto, porque contrato que promete o que não
// existe custa mais que ausência.
// O DEGRAU RESPONSIVO volta (merge de 28/08/2026): a ficha declara `responsive.size` e o
// componente tinha perdido a capacidade quando este arquivo entrou da `main`. Mesma perda
// silenciosa do `Input`, do `Tabs` e do `NumberField` — a ficha documentava, o código não fazia.
export function Spinner({size,label,decorative,className,...props}:HTMLAttributes<HTMLSpanElement>&RefAttributes<HTMLSpanElement>&{size?:Responsive<"sm"|"md"|"lg">;label?:string;decorative?:boolean}){const s=useAureaStrings();return <span className={cx("spinner",peleDoEixo("spinner",size,"sm","spinner"),className)} {...(decorative?{"aria-hidden":true}:{role:"status","aria-label":label??s.loading})} {...props}/>}
// titleAs: o nível do título é do DOCUMENTO, não do componente. Fixo em h3, um empty state
// no alto de uma página vira h1→h3 e a hierarquia quebra (axe heading-order). Default h3
// para não mexer em quem já consome; quem sabe o contexto passa o nível certo.
// `state` aqui NÃO deriva cor nenhuma — o vazio já é neutro e um empty state colorido seria
// alarme onde há ausência. O que ele faz é o marcador no DOM e a descrição padrão, para
// "sem conexão" e "resultado parcial" não serem sete frases diferentes em sete telas.
// DataState (M3): a mesma tela tem quatro caras — carregando, deu erro, não veio nada, e veio.
// Ligar isso na mão é o que TODA tela reescreve, e o que se erra é sempre a mesma coisa: sumir
// com o conteúdo quando o dado só está VELHO.
//
// PESQUISADO antes de escrever (13/08/2026), e não só olhado na pasta — as cinco referências
// locais não têm isto porque nenhuma delas é dona do dado. O padrão existe: é o "query handler"
// / casamento de padrão sobre o status do TanStack Query, e o caminho alternativo do
// Suspense + ErrorBoundary, em que carregar é do Suspense e falhar é do boundary. O que se
// extraiu foi a LISTA de casos, não a API deles: quem tem `data` também precisa de `empty`,
// porque "veio vazio" não é "deu erro" nem "está carregando".
//
// O DESENHO segue o que o `DataGrid` já decidiu neste repositório, e não uma invenção nova:
// `stale`, `partial` e `degraded` NÃO escondem o conteúdo — mantêm na tela e rotulam, porque
// mostrar dado velho sem dizer é pior que não mostrar. Por isso o `state` aqui é o mesmo
// vocabulário do `UniversalState` (Parte J) mais os três de ciclo de vida do dado.
//
// ACESSIBILIDADE, e esta parte é onde as fontes de mercado silenciam: enquanto carrega, a
// região vai com `aria-busy="true"` — é o que manda a tecnologia assistiva ESPERAR em vez de
// anunciar meia atualização (MDN/WAI). Sem isso, o esqueleto vira ruído. O `Skeleton` já nasce
// `aria-hidden`, então o que se anuncia é a região, não os retângulos.
export type DataStateValue="loading"|"error"|"empty"|UniversalState;
// `children` como FUNÇÃO é de propósito para o caso `loading`: assim o consumidor não paga o
// render do conteúdo enquanto ele não existe. Aceita nó também, porque a maioria das telas já
// tem o conteúdo pronto e obrigar função seria cerimônia.
export function DataState({state,message,skeleton,emptyTitle,emptyIcon,action,children,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{state?:DataStateValue;message?:ReactNode;skeleton?:ReactNode;emptyTitle?:ReactNode;emptyIcon?:IconName;action?:ReactNode;children:ReactNode|(()=>ReactNode)}){
  const s=useAureaStrings();
  const conteudo=()=>typeof children==="function"?children():children;
  const caixa=(inner:ReactNode,ocupado?:boolean)=>
    <div className={cx("data-state",className)} aria-busy={ocupado||undefined} data-state={state} {...props}>{inner}</div>;
  if(state==="loading")return caixa(skeleton??<Skeleton style={{height:"var(--space-8)"}}/>,true);
  if(state==="error")return caixa(<Alert variant="danger">{message??s.dataError}</Alert>);
  // `titleAs="p"` e não o `h3` padrão do EmptyState: aqui o vazio é estado de uma REGIÃO, não
  // seção do documento. Injetar um h3 no meio do conteúdo do consumidor salta nível de título —
  // o gate de hierarquia pegou (`salto h1 → h3`) e o axe repetiu como `heading-order`.
  if(state==="empty")return caixa(<EmptyState icon={emptyIcon} titleAs="p" title={emptyTitle??s.dataEmpty} description={message} action={action}/>);
  // Os universais NÃO substituem o conteúdo: eles o acompanham. É a regra do DataGrid, e o
  // motivo é o mesmo — a pessoa precisa do dado E do aviso, não de um no lugar do outro.
  if(state)return caixa(<><Alert variant={stateSeverity(state)} state={state}>{message}</Alert>{conteudo()}</>);
  return caixa(conteudo());
}
export function EmptyState({icon="document--blank",title,titleAs:TitleTag="h3",description,action,state}:{icon?:IconName;title:ReactNode;titleAs?:"h2"|"h3"|"h4"|"p";description?:ReactNode;action?:ReactNode;state?:UniversalState}){const s=useAureaStrings();const desc=description??(state?s.universalState[state]:null);return <div className="empty-state" data-state={state}><Icon name={icon} size="xl"/><TitleTag className="empty-title">{title}</TitleTag>{desc&&<p className="muted">{desc}</p>}{action}</div>}



// NotificationCenter (Fase 4): compõe Popover + lista, sem CSS de comportamento
// novo. Presentational — o consumidor é dono do estado lido/não-lido e passa os
// itens já agrupados por tempo (group opcional, agrupado na ordem de 1ª aparição;
// não reordena). O painel NÃO é live region: o padrão de feed manda anunciar a
// CHEGADA num aria-live à parte (fora do popover, sempre montado), não reler o
// painel inteiro — que o usuário revisita no próprio ritmo. A chegada é detectada
// por diff de ids desde a montagem; a montagem inicial não anuncia (senão despeja
// o feed todo de uma vez). O count no gatilho é decorativo (aria-hidden); o nome
// acessível do botão traz o número e cada item não lido é prefixado por sr-only.
export interface NotificationItem{id:string;title:ReactNode;description?:ReactNode;time?:ReactNode;icon?:IconName;read?:boolean;group?:string;onClick?:()=>void}
function groupNotifications(items:NotificationItem[]):Array<{label?:string;items:NotificationItem[]}>{
  const out:Array<{label?:string;items:NotificationItem[]}>=[];
  for(const it of items){
    const last=out[out.length-1];
    if(last&&last.label===it.group)last.items.push(it);else out.push({label:it.group,items:[it]});
  }
  return out;
}
export function NotificationCenter({items,onItemClick,onMarkAllRead,label,icon="notification",side="bottom"}:{items:NotificationItem[];onItemClick?:(item:NotificationItem)=>void;onMarkAllRead?:()=>void;label?:string;icon?:IconName;side?:OverlaySide}){
  const s=useAureaStrings();
  const portal=usePortalContainer();
  const title=label??s.notificationsLabel;
  const unread=items.filter(i=>!i.read).length;
  const groups=groupNotifications(items);
  const baseId=React.useId();
  const seen=React.useRef<Set<string>|undefined>(undefined);
  const [announce,setAnnounce]=React.useState("");
  React.useEffect(()=>{
    const ids=new Set(items.map(i=>i.id));
    if(seen.current===undefined){seen.current=ids;return}
    const fresh=items.filter(i=>!seen.current!.has(i.id)).length;
    seen.current=ids;
    // Texto idêntico duas vezes seguidas não muta o DOM e o leitor silencia a 2ª
    // chegada (auditoria 18/07/2026, MÉDIO 4). Um NBSP alternado no fim força a
    // mutação sem mudar o que se ouve.
    if(fresh)setAnnounce(prev=>{const text=`${fresh} ${s.notificationNew}`;return prev===text?text+" ":text});
  },[items,s.notificationNew]);
  const renderRow=(it:NotificationItem)=>{
    const body=<>
      <span className="notification-dot" aria-hidden="true"/>
      <span className="notification-item-title">{it.icon&&<Icon name={it.icon} size="sm"/>}{!it.read&&<span className="sr-only">{s.notificationUnread} </span>}{it.title}</span>
      {it.time&&<span className="notification-time">{it.time}</span>}
      {it.description&&<span className="notification-item-desc">{it.description}</span>}
    </>;
    return it.onClick||onItemClick
      ?<button type="button" className="notification-item" data-read={it.read||undefined} onClick={()=>{it.onClick?.();onItemClick?.(it)}}>{body}</button>
      :<div className="notification-item" data-read={it.read||undefined}>{body}</div>;
  };
  return <BasePopover.Root>
    <span className="notification-trigger">
      <BasePopover.Trigger render={<IconButton variant="ghost" icon={icon} label={unread?`${title} (${unread})`:title}/>}/>
      {unread>0&&<span className="notification-count" aria-hidden="true">{unread>99?"99+":unread}</span>}
    </span>
    <BasePopover.Portal container={portal}><BasePopover.Positioner side={side} sideOffset={8}>
      <BasePopover.Popup className="popover notification-panel" aria-label={title}>
        <div className="notification-head">
          <BasePopover.Title render={<strong/>}>{title}</BasePopover.Title>
          {unread>0&&onMarkAllRead&&<Button variant="ghost" size="sm" onClick={onMarkAllRead}>{s.notificationMarkAll}</Button>}
        </div>
        {items.length
          ?<div className="notification-list">
            {groups.map((g,gi)=>{const gid=baseId+gi;return <React.Fragment key={gi}>
              {g.label&&<p className="notification-group-label" id={gid}>{g.label}</p>}
              <ul className="notification-sublist" aria-labelledby={g.label?gid:undefined}>
                {g.items.map(it=><li key={it.id}>{renderRow(it)}</li>)}
              </ul>
            </React.Fragment>})}
          </div>
          :<p className="notification-empty">{s.notificationEmpty}</p>}
      </BasePopover.Popup>
    </BasePopover.Positioner></BasePopover.Portal>
    <span className="sr-only" role="status" aria-live="polite">{announce}</span>
  </BasePopover.Root>;
}
