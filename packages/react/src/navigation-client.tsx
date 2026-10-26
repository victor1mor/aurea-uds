"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {useRef, type HTMLAttributes, type RefAttributes, type ReactNode, type ReactElement} from "react";
import {Tabs as BaseTabs} from "@base-ui/react/tabs";
import {useDirection} from "@base-ui/react/direction-provider";
import {Autocomplete as BaseAutocomplete} from "@base-ui/react/autocomplete";
import {Dialog as BaseDialog} from "@base-ui/react/dialog";
import {Popover as BasePopover} from "@base-ui/react/popover";
import {useValorResponsivo} from "./responsivo-runtime.js";
import {type Responsive} from "./pure.js";
import {cx, fundirRender, useAureaStrings, usePortalContainer} from "./internal.js";
import {Kbd} from "./markup.js";
import {Icon, type IconName} from "./system.js";
import {Button, IconButton, type IconButtonProps} from "./actions.js";
import {Badge, Spinner} from "./feedback.js";
import {SearchField} from "./inputs.js";
// `overlays` PASSOU A VIR ANTES de `navigation` no DAG (18/08/2026, MAP.md §DAG). Ele só
// importa `internal`, `system` e `actions` — todos anteriores —, então não há ciclo: o que
// mudou foi a ORDEM documentada, que colocava overlays no "resto" sem motivo medido.
import {Tooltip} from "./overlays.js";
import {Avatar} from "./identity-client.js";

// Stepper (Lote 2 do BUILDING.md). Registro honesto da pesquisa: das QUATRO referências locais,
// NENHUMA tem stepper — nem o Base UI, nem as outras três. A única fonte é uma quinta
// referência, e a própria página dela diz que o sistema de desenho em que ela se baseia parou de
// documentar o padrão. Ou
// seja: isto é menos padrão de mercado do que parece, e o que existe aqui é CSS órfão herdado
// do kit de origem (`.step`, `.step-dot`) mais a página de docs manual que o usa.
// Construído mesmo assim porque a pele já estava no core sem dono, e componente público sem
// dono é o achado A13 esperando para acontecer de novo.
//
// `items` e não `<Step>` como filho: é o idioma da casa (Timeline, DataList, Breadcrumb,
// SegmentedControl), e resolve de graça a numeração — a posição vem do índice, não de uma prop
// que o consumidor teria de manter em sincronia.
//
// Não existe padrão APG para stepper. A prática adotada é `role="list"` com `aria-current="step"`
// na etapa atual, que é o que aquela quinta referência também faz.
export type StepState="default"|"active"|"done"|"error";
export interface StepItem{label:ReactNode;state?:StepState;optional?:ReactNode;onClick?:()=>void}
export function Stepper({items,label,className}:{items:StepItem[];label?:string;className?:string}){
const s=useAureaStrings();
return <div role="list" aria-label={label??s.stepperLabel} className={cx("stepper",className)}>
{items.map((it,n)=>{const st=it.state??"default";
const marca=st==="done"?<Icon name="check"/>:st==="error"?<Icon name="x-circle"/>:n+1;
const miolo=<><span className="step-dot">{marca}</span><strong>{it.label}</strong>{it.optional&&<small className="step-optional">{it.optional}</small>}</>;
return <div key={n} role="listitem" className={cx("step",st!=="default"&&`step-${st}`)} aria-current={st==="active"?"step":undefined}>
{it.onClick?<button type="button" className="step-trigger" onClick={it.onClick}>{miolo}</button>:miolo}
</div>})}
</div>}

// M-01 (25/09/2026): `render` no item de navegação — o link do roteador do app (`<Link href/>`)
// recebe a pele e o conteúdo do item, pelo `fundirRender` que o `Card` já usa. Com `render`, quem
// traz o destino é o elemento, e o `href` do item fica sem uso. Decisão do Victor: `render` só no
// `Button`, no `IconButton` e nos itens de navegação — onde o app precisa do roteador.
export interface BreadcrumbItem{label:ReactNode;href?:string;render?:ReactElement}
export function Breadcrumb({items,label}:{items:BreadcrumbItem[];label?:string}){const s=useAureaStrings();return <nav className="breadcrumb" aria-label={label??s.breadcrumbLabel}>{items.map((i,n)=><React.Fragment key={n}>{n>0&&<Icon name="caret-right" size="sm"/>} {i.render?fundirRender(i.render,{children:i.label},"a"):i.href?<a href={i.href}>{i.label}</a>:<strong aria-current="page">{i.label}</strong>}</React.Fragment>)}</nav>}
// ── REPORTADO no merge de 28/08/2026 ────────────────────────────────────────────────────────
// `orientation`, `activateOnFocus` e `loopFocus` estavam na outra linhagem e sumiram quando este
// arquivo entrou inteiro da `main` — ele não existia lá e por isso não deu conflito nenhum. A
// perda foi SILENCIOSA: a conferência de "o que ficou para trás" comparou NOMES de componente, e
// `Tabs` existe nos dois lados. O que mudou foi o corpo.
//
// ATIVAÇÃO AUTOMÁTICA × MANUAL: o motor sempre teve `activateOnFocus` e aqui ele estava FIXO em
// `true`. A APG nomeia os dois padrões — automática quando o painel é barato, MANUAL quando
// trocar de aba custa uma ida à rede, senão atravessar cinco abas por teclado dispara cinco
// carregamentos. O default segue `true`: quem não pede nada não vê diferença.
// `loopFocus` vem junto por ser a mesma prop da mesma lista, tapada pelo mesmo motivo.
//
// `orientation` é resolvido em runtime e entregue ao MOTOR, que publica `data-orientation` e
// ajusta as setas — a pele reage ao atributo, e não há CSS decidindo por um lado e JS por outro.
export type TabsOrientation="horizontal"|"vertical";
// `panel` (MNT-05 e C9, 06/10/2026): `card` (padrão) é o painel de sempre, um cartão `inset`;
// `plain` tira a caixa, como o painel da referência (sem borda nem fundo). É o
// caso de `Table` e `DataGrid`, que já têm moldura: dentro de um painel-cartão, caixa dentro de
// caixa. O mesmo nome e os mesmos dois valores no nativo.
export type TabsPanel="card"|"plain";
// `variant` (0.32.0): `primary` é a cápsula de sempre; `secondary` é a aba secundária da referência —
// sem trilho, um fio embaixo da lista, e a escolhida marcada pelo fio da casa (o mesmo do item
// escolhido e do `Tabs variant="secondary"` do nativo, R-12). Era a peça que o nativo tinha e a web não.
export type TabsVariant="primary"|"secondary";
export function Tabs({tabs,value,onChange,label,orientation,activateOnFocus=true,loopFocus,panel="card",variant="primary"}:{tabs:Array<{id:string;label:ReactNode;content:ReactNode}>;value:string;onChange:(id:string)=>void;label?:string;orientation?:Responsive<TabsOrientation>;activateOnFocus?:boolean;loopFocus?:boolean;panel?:TabsPanel;variant?:TabsVariant}){const s=useAureaStrings();const ancora=useRef<HTMLDivElement|null>(null);const resolvida=useValorResponsivo(orientation,"horizontal",ancora);return <BaseTabs.Root ref={ancora} value={value} onValueChange={v=>onChange(String(v))} orientation={resolvida} className="tabs-root"><BaseTabs.List className={cx("tabs",variant==="secondary"&&"tabs-secondary")} aria-label={label??s.tabsLabel} activateOnFocus={activateOnFocus} loopFocus={loopFocus}>{tabs.map(t=><BaseTabs.Tab key={t.id} value={t.id} className="tab">{t.label}</BaseTabs.Tab>)}</BaseTabs.List>{tabs.map(t=><BaseTabs.Panel key={t.id} value={t.id} className={panel==="plain"?"tabs-panel":"card card-inset"} tabIndex={0}>{t.content}</BaseTabs.Panel>)}</BaseTabs.Root>}
// PAGINATION (0.32.0) — a da referência: os NÚMEROS das páginas (32, em cápsula, peso médio), as
// reticências quando são muitas, "anterior" e "próxima" com a seta, e o resumo opcional à esquerda
// ("1 a 5 de 50"). A página atual leva o "clarinho" da Aurea — a receita do selo suave (decisão do
// Victor, 11/10/2026: *"quero o selecionado clarinho como nosso e não cor sólida"*).
//   • `variant="simple"`: só anterior e próxima, o exemplo "Simple" dela (era o pedido WEB-10);
//   • `variant="compact"`: o desenho de até a 0.31.0 ("Anterior · 3 / 12 · Próxima") — fica, porque
//     componente da Aurea não perde variação.
// `href` (GAR-18): com ele, cada página é um LINK de verdade (`<a href>`), que o buscador segue e que
// abre em outra aba; sem ele, botões que chamam `onPageChange`. Os dois podem andar juntos (o app
// intercepta o clique e ainda tem o endereço).
// Quantas páginas aparecem: a primeira, a última, a atual e `siblings` de cada lado dela (1); o
// buraco vira reticências. Até 7 páginas, todas.
export type PaginationVariant="numbers"|"simple"|"compact";
export interface PaginationProps{page:number;total:number;onPageChange?:(p:number)=>void;
  variant?:PaginationVariant;
  /** O resumo à esquerda — "1 a 5 de 50 pedidos". */
  summary?:ReactNode;
  /** O endereço de cada página. Com ele, as páginas são links. */
  href?:(page:number)=>string;
  /** Quantas páginas aparecem de cada lado da atual. Padrão: 1. */
  siblings?:number;
  /** O nome do marco de navegação. Padrão: a frase `paginationLabel`. Com duas paginações na mesma
   *  página, cada uma diz de quê ("Páginas dos pedidos"), senão o leitor de tela ouve dois marcos iguais. */
  label?:string;className?:string}
function paginasVisiveis(page:number,total:number,siblings:number):Array<number|"..."> {
  if(total<=5+siblings*2)return Array.from({length:total},(_,i)=>i+1);
  const ini=Math.max(2,page-siblings),fim=Math.min(total-1,page+siblings);
  const meio=Array.from({length:fim-ini+1},(_,i)=>ini+i);
  return [1,...(ini>2?["..." as const]:[]),...meio,...(fim<total-1?["..." as const]:[]),total];
}
export function Pagination({page,total,onPageChange,variant="numbers",summary,href,siblings=1,label,className}:PaginationProps){
  const s=useAureaStrings();
  if(variant==="compact")return <nav className={cx("pagination",className)} aria-label={label??s.paginationLabel}><Button variant="ghost" size="sm" disabled={page<=1} onClick={()=>onPageChange?.(page-1)}>{s.previous}</Button><Badge variant="primary">{page} / {total}</Badge><Button variant="ghost" size="sm" disabled={page>=total} onClick={()=>onPageChange?.(page+1)}>{s.next}</Button></nav>;
  // Um item: link (com `href`) ou botão. Desligado (a primeira página no "anterior"), sem endereço.
  const item=(alvo:number,conteudo:ReactNode,{atual=false,nav,rotulo}:{atual?:boolean;nav?:"prev"|"next";rotulo?:string}={})=>{
    const fora=alvo<1||alvo>total;
    const cls=cx("pagination-link",nav&&"pagination-link-nav",atual&&"active");
    const comuns={className:cls,"aria-label":rotulo,"aria-current":atual?("page" as const):undefined};
    if(href)return fora?<a {...comuns} aria-disabled="true">{conteudo}</a>
      :<a {...comuns} href={href(alvo)} onClick={onPageChange?(e:React.MouseEvent)=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&e.button===0){e.preventDefault();onPageChange(alvo)}}:undefined}>{conteudo}</a>;
    return <button type="button" {...comuns} disabled={fora} onClick={()=>onPageChange?.(alvo)}>{conteudo}</button>;
  };
  const anterior=item(page-1,<><Icon name="caret-left" className="pagination-nav-icon"/><span>{s.previous}</span></>,{nav:"prev"});
  const proxima=item(page+1,<><span>{s.next}</span><Icon name="caret-right" className="pagination-nav-icon"/></>,{nav:"next"});
  return <nav className={cx("pagination",className)} aria-label={label??s.paginationLabel}>
    {summary!=null&&<span className="pagination-summary">{summary}</span>}
    <ul className="pagination-content">
      <li>{anterior}</li>
      {variant==="numbers"&&paginasVisiveis(page,total,siblings).map((p,i)=>p==="..."
        ?<li key={`e${i}`}><span className="pagination-ellipsis" aria-hidden="true">…</span></li>
        :<li key={p}>{item(p,p,{atual:p===page,rotulo:`${s.paginationPage} ${p}`})}</li>)}
      <li>{proxima}</li>
    </ul>
  </nav>;
}


// TableOfContents — o "On this page". Recebe os itens prontos (quem sabe quais seções existem é
// a página) e marca a seção EM VISTA com aria-current.
//
// Até 21/08/2026 ele não marcava nada: `current` entrava por prop e o componente não observava.
// A ficha, porém, dizia "marks the section in view" — e o `build-catalog.mjs` nunca passava
// `current` em nenhuma das cinco chamadas. O comportamento existia duas vezes em vanilla (no
// `aurea.js` e, com outro `rootMargin`, no `apps/docs/index.html`) e zero vezes em React: quem
// instalava o pacote sozinho recebia um índice que nunca marcava nada. `G-CAP-25`.
//
// `current` continua existindo e continua VENCENDO — quem controla, controla. O que mudou é o
// que acontece quando ninguém controla: antes era nada, agora é a observação.
//
// Isto voltou em 29/08/2026: o merge das duas linhagens ficou com a versão que não observa, e os
// seis testes do `toc-spy.test.tsx` foram o que pegou.
export interface TocItem{id:string;label:string;sub?:boolean}
export function TableOfContents({items,current,label,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{items:TocItem[];current?:string;label?:string}){
const s=useAureaStrings();
const meu=React.useRef<HTMLElement|null>(null);
const observado=useSecaoEmVista(items,current===undefined,meu);
const atual=current??observado;
// O `ref` do consumidor continua chegando: em React 19 ele é prop comum, então espalhá-lo por
// `...props` depois do nosso o sobrescreveria em silêncio. Os dois são atendidos aqui.
const refDele=(props as {ref?:React.Ref<HTMLElement>}).ref;
const {ref:_ignorado,...resto}=props as {ref?:React.Ref<HTMLElement>}&HTMLAttributes<HTMLElement>;
return <nav ref={n=>{meu.current=n;if(typeof refDele==="function")refDele(n);else if(refDele)(refDele as React.RefObject<HTMLElement|null>).current=n;}}
  className={cx("toc",className)} aria-label={label??s.tocLabel} {...resto}>
<p className="toc-label"><span className="toc-label-icon" aria-hidden="true"/>{label??s.tocLabel}</p>
{items.map(i=><a key={i.id} href={`#${i.id}`} className={cx(i.sub&&"toc-sub")} {...(i.id===atual?{"aria-current":"true" as const}:{})}>{i.label}</a>)}
</nav>
}

/** Qual dos `items` está na faixa de leitura, observando o documento. Devolve `undefined` até o
 *  primeiro cálculo — e em SSR, onde não há documento para observar.
 *
 *  A afinação NÃO é escolha nova: é a mesma do `tocSpy` do `aurea.js`, que já estava provada em
 *  produção. Uma faixa estreita no alto da janela (`-75%` embaixo), e vence o ÚLTIMO que a cruza,
 *  não o primeiro — seção e subseção cruzam juntas, e o específico é o que interessa. Nada
 *  cruzando quer dizer topo da página, e aí o atual é o primeiro item. Reimplementar com outra
 *  régua seria criar a terceira versão divergente do mesmo comportamento, que é o defeito que
 *  este componente existe para encerrar. */
function useSecaoEmVista(items:TocItem[],ligado:boolean,nav:React.RefObject<HTMLElement|null>){
  const [atual,setAtual]=React.useState<string|undefined>(undefined);
  // os ids como string estável: sem isto o efeito re-roda a cada render, porque `items` é um
  // array novo toda vez que o pai renderiza.
  const ids=items.map(i=>i.id).join(" ");
  React.useEffect(()=>{
    if(!ligado)return;
    if(typeof IntersectionObserver==="undefined")return;   // navegador antigo: fica lista de links
    const lista=ids?ids.split(" "):[];
    const alvos=lista.map(id=>document.getElementById(id)).filter((e):e is HTMLElement=>e!==null);
    if(!alvos.length)return;
    // O acordo com o runtime vanilla, e ele mora no EFEITO e não no render por um motivo medido:
    // o catálogo é gerado ESTÁTICO a partir deste mesmo componente. Marcar no render poria o
    // atributo nas páginas todas, onde não há React vivo para observar — e o `tocSpy` do
    // `aurea.js`, que é quem de fato marca lá, se afastaria de um substituto inexistente. Efeito
    // só roda onde há React de verdade, que é exatamente o que a marca precisa afirmar.
    nav.current?.setAttribute("data-toc-spy","react");
    setAtual(alvos[0].id);
    const visivel=new Map<string,boolean>();
    const obs=new IntersectionObserver(entradas=>{
      for(const e of entradas)visivel.set((e.target as HTMLElement).id,e.isIntersecting);
      let achado=alvos[0].id;
      for(const alvo of alvos)if(visivel.get(alvo.id))achado=alvo.id;
      setAtual(achado);
    },{rootMargin:"0px 0px -75% 0px"});
    for(const alvo of alvos)obs.observe(alvo);
    return ()=>obs.disconnect();
  },[ids,ligado]);
  return ligado?atual:undefined;
}


// TreeView (Fase 4): árvore expansível com teclado. Base UI 1.6 não tem tree
// primitive (35 componentes, nenhum é árvore) — então é headless próprio mínimo:
// role=tree/treeitem/group + roving tabindex (só o nó ativo é tabulável). As
// setas horizontais respeitam dir: em RTL, ArrowLeft expande e ArrowRight colapsa.
// O nome acessível de cada nó vem de aria-labelledby (só o rótulo da linha) para
// não engolir os filhos aninhados; o grupo fica DENTRO do treeitem (posse por
// contenção, sem aria-owns).
//
// AN-06 (Lote H, 04/10/2026) — CARGA AO ABRIR E SELEÇÃO CONTROLADA, só acrescentando. Um consumidor
// tem dois casos em que os filhos só se sabem ao abrir o nó (os tópicos de um grupo, as pastas do
// servidor ao escolher um destino). A referência não tem árvore; o motor dela tem um marcador
// para isso — "tem filhos, mesmo que ainda não carregados" — e outra das referências marca o item
// como pasta e pergunta se ele está carregando. Aqui: `hasChildren` diz que o nó abre antes de ter filhos;
// `onExpand` é chamado a cada abertura e, se devolver promessa e o nó ainda não tiver filhos, o nó
// mostra a rodinha no lugar da seta e fica `aria-busy` até ela terminar. Os filhos chegam pelo
// próprio `items` (o dado é do consumidor). Promessa recusada FECHA o nó: abrir de novo tenta de
// novo. `selectedId` controla o escolhido, como no `DependencyGraph`; sem ele, nada muda.
export interface TreeNode{id:string;label:ReactNode;icon?:IconName;children?:TreeNode[];hasChildren?:boolean}
type FlatNode={node:TreeNode;level:number;parentId?:string};
const temFilhos=(node:TreeNode)=>!!node.children?.length||!!node.hasChildren;
function flattenVisible(nodes:TreeNode[],expanded:Set<string>,level=1,parentId?:string,acc:FlatNode[]=[]):FlatNode[]{
  for(const node of nodes){
    acc.push({node,level,parentId});
    if(node.children?.length&&expanded.has(node.id))flattenVisible(node.children,expanded,level+1,node.id,acc);
  }
  return acc;
}
export function TreeView({items,defaultExpandedIds,onSelect,onExpand,selectedId,label,className}:{items:TreeNode[];defaultExpandedIds?:string[];onSelect?:(node:TreeNode)=>void;onExpand?:(node:TreeNode)=>void|Promise<unknown>;selectedId?:string|null;label?:string;className?:string}){
  const s=useAureaStrings();
  const baseId=React.useId();
  const [expanded,setExpanded]=React.useState(()=>new Set(defaultExpandedIds));
  const [selectedInterno,setSelected]=React.useState<string|undefined>();
  const selected=selectedId!==undefined?(selectedId??undefined):selectedInterno;
  const [carregando,setCarregando]=React.useState<ReadonlySet<string>>(()=>new Set());
  const [active,setActive]=React.useState<string|undefined>(()=>items[0]?.id);
  const rootRef=React.useRef<HTMLUListElement>(null);
  const rtl=useDirection()==="rtl";
  const visible=flattenVisible(items,expanded);
  // Roving tab stop derivado: se o nó ativo saiu do conjunto visível (dados
  // trocados, nó removido), o primeiro visível volta a ser tabulável — senão a
  // árvore inteira fica tabIndex=-1 e some da ordem do Tab (auditoria, MÉDIO 1).
  const effectiveActive=active!==undefined&&visible.some(v=>v.node.id===active)?active:visible[0]?.node.id;
  const focusId=(id:string)=>{setActive(id);(rootRef.current?.querySelector(`[data-tree-id="${CSS.escape(id)}"]`) as HTMLElement|null)?.focus()};
  const marcar=(id:string,open:boolean)=>setExpanded(prev=>{const n=new Set(prev);if(open)n.add(id);else n.delete(id);return n});
  const tirarDaCarga=(id:string)=>setCarregando(prev=>{const n=new Set(prev);n.delete(id);return n});
  const toggle=(node:TreeNode,open:boolean)=>{
    marcar(node.id,open);
    if(!open||!onExpand)return;
    const r=onExpand(node);
    if(node.children?.length||!r||typeof (r as Promise<unknown>).then!=="function")return;
    setCarregando(prev=>new Set(prev).add(node.id));
    (r as Promise<unknown>).then(()=>tirarDaCarga(node.id),()=>{tirarDaCarga(node.id);marcar(node.id,false)});
  };
  const select=(node:TreeNode)=>{if(selectedId===undefined)setSelected(node.id);onSelect?.(node)};
  const onKeyDown=(e:React.KeyboardEvent<HTMLUListElement>)=>{
    const idx=visible.findIndex(v=>v.node.id===effectiveActive);
    if(idx<0)return;
    const cur=visible[idx],hasChildren=temFilhos(cur.node),isOpen=expanded.has(cur.node.id);
    const rtlDom=getComputedStyle(e.currentTarget).direction==="rtl";
    const expandKey=rtlDom?"ArrowLeft":"ArrowRight",collapseKey=rtlDom?"ArrowRight":"ArrowLeft";
    switch(e.key){
      case "ArrowDown":e.preventDefault();if(idx<visible.length-1)focusId(visible[idx+1].node.id);break;
      case "ArrowUp":e.preventDefault();if(idx>0)focusId(visible[idx-1].node.id);break;
      case expandKey:e.preventDefault();if(hasChildren&&!isOpen)toggle(cur.node,true);else if(isOpen&&cur.node.children?.length)focusId(cur.node.children[0].id);break;
      case collapseKey:e.preventDefault();if(hasChildren&&isOpen)toggle(cur.node,false);else if(cur.parentId)focusId(cur.parentId);break;
      case "Home":e.preventDefault();focusId(visible[0].node.id);break;
      case "End":e.preventDefault();focusId(visible[visible.length-1].node.id);break;
      case "Enter":case " ":e.preventDefault();select(cur.node);if(hasChildren)toggle(cur.node,!isOpen);break;
    }
  };
  const renderNodes=(nodes:TreeNode[],level:number):ReactElement=>(
    <ul ref={level===1?rootRef:undefined} className={cx(level===1?"tree":"tree-group",level===1&&className)} role={level===1?"tree":"group"} aria-label={level===1?(label??s.treeLabel):undefined} onKeyDown={level===1?onKeyDown:undefined}>
      {nodes.map(node=>{
        const hasChildren=temFilhos(node),isOpen=expanded.has(node.id),isSelected=selected===node.id,isLoading=isOpen&&carregando.has(node.id),labelId=baseId+node.id;
        return <li key={node.id} className="tree-item" role="treeitem" data-tree-id={node.id} aria-level={level} aria-expanded={hasChildren?isOpen:undefined} aria-selected={isSelected} aria-busy={isLoading||undefined} aria-labelledby={labelId} tabIndex={node.id===effectiveActive?0:-1}>
          <span className="tree-node" data-selected={isSelected||undefined} style={{paddingInlineStart:`calc(var(--space-3) + ${level-1} * var(--space-4))`}}
            onClick={()=>{focusId(node.id);select(node);if(hasChildren)toggle(node,!isOpen)}}>
            {/* Carregando, a rodinha ocupa o lugar da seta, do mesmo tamanho (`--icon-sm`): a linha
                não anda quando os filhos chegam. Ela é decorativa — quem anuncia é o `aria-busy`
                do nó, e o leitor de tela já está nele. */}
            {isLoading?<Spinner decorative className="tree-twist"/>:hasChildren?<Icon name="caret-right" size="sm" className={cx("tree-twist",rtl&&"tree-twist-rtl")}/>:<span className="tree-indent" aria-hidden="true"/>}
            {node.icon&&<Icon name={node.icon} size="sm"/>}
            <span id={labelId} className="tree-label">{node.label}</span>
          </span>
          {isOpen&&!!node.children?.length&&renderNodes(node.children,level+1)}
        </li>;
      })}
    </ul>
  );
  return renderNodes(items,1);
}


// Sidebar/Topbar: eram <aside>/<header> soltos DENTRO do AppShell; agora são componentes
// nomeados que o AppShell COMPÕE (dogfooding, AUREA.md §2.4 — "se o catálogo mostra uma
// Sidebar, a sidebar dele É a Sidebar da Aurea"). O landmark vem do elemento nativo
// (<aside>=complementary, <header>=banner); o <nav> de navegação é do consumidor, passado
// como children — por isso não embutimos <nav> aqui (aninharia landmark).
//
// PLANO-1.0 Parte B, item B1 (06/08/2026) — a lateral saiu de `Draft`.
// O defeito que ela tinha era de ESCOPO, não de bug: `<aside>{children}</aside>` obriga todo
// consumidor a reescrever item, grupo, aninhamento e marca de item atual. Quem já tinha esse
// desenho pronto era o CHROME do catálogo (`.doc-nav`), que mora no core como dívida (achado
// A6) e nunca foi API pública. Ou seja: a peça existia e não era da biblioteca.
//
// UM SÓ FORMATO para grupo e para aninhamento, que é onde as referências divergem sem ganho:
//   • item com `items` e SEM `href`/`onClick` → GRUPO (o rótulo é cabeçalho, não é clicável);
//   • item com `href`/`onClick` e `items`     → item PAI com sublista.
// `items` e não `<SidebarItem>` como filho é o idioma da casa (Timeline, DataList, Breadcrumb,
// Stepper, TreeView) e evita três fichas novas para desenhar uma lista.
//
// `children` CONTINUA valendo, e não é retrocompatibilidade decorativa: o catálogo e a página
// manual passam a navegação pronta, e o `<nav>` deles é deles. Com `items` o `<nav>` é nosso,
// porque aí a lista também é.
//
// TECLADO: não há padrão APG para navegação de site — o que existe é link em `<nav>`, ordem de
// Tab nativa e `aria-current="page"` no atual. Roving tabindex aqui seria copiar o TreeView
// para um lugar onde ele atrapalha: numa lateral o usuário ESPERA tabular item a item.
export interface SidebarItem{id:string;label:ReactNode;href?:string;icon?:IconName;badge?:ReactNode;onClick?:()=>void;items?:SidebarEntry[];
  /** O link do roteador do app (M-01): `<Link href="/relatorios" />`. Recebe a pele, o estado de página atual e o conteúdo do item. */
  render?:ReactElement;
  /** A foto ou o logotipo do item (4-E — o time, a pessoa): toma o lugar do `icon`, no mesmo formato da `NavList`. Recolhida, ele
   *  fica na trilha, e não um vão. */
  avatar?:{src?:string;fallback?:ReactNode};
  /** A ação do item ou do grupo (4-D — o "⋯", o "+"): um `IconButton` pequeno. Mora AO LADO do item, nunca dentro do link (botão
   *  dentro de link não é HTML válido, e o leitor de tela perde um dos dois). Recolhida, some, como na referência. */
  action?:ReactNode;
  /** Só no GRUPO (item com `items` e sem destino): o nome vira um botão que dobra a lista (4-D). */
  collapsible?:boolean;
  /** Com `collapsible`: o grupo começa aberto. Padrão: aberto. */
  defaultOpen?:boolean}
/** A lista da lateral: os itens e, entre eles, `"separator"` — a divisória entre seções (4-E). Sem linha (ADR-0072): é um vão.
 *  A lista se parte nela em duas, como os grupos da referência, que se separam fora da lista. */
export type SidebarEntry=SidebarItem|"separator";
type SidebarCtx={baseId:string;current?:string;collapsed?:boolean};
// A DIVISÓRIA PARTE A LISTA (4-E, 25/10/2026). Na referência ela mora ENTRE grupos, fora das listas — então aqui cada trecho
// entre duas divisórias é uma lista própria, e a divisória é um vão entre elas. Um `<li>` vazio de papel apagado no meio da
// lista confundiria a conta de itens do leitor de tela ("3 de 9").
function sidebarList(entradas:SidebarEntry[],ctx:SidebarCtx,sub?:boolean,labelledBy?:string):ReactElement{
const trechos:SidebarItem[][]=[[]];
for(const e of entradas)e==="separator"?trechos.push([]):trechos[trechos.length-1].push(e);
const listas=trechos.filter(t=>t.length>0);
const ul=(itens:SidebarItem[],k:number)=><ul key={k} className={cx("sidebar-list",sub&&"sidebar-sub")} aria-labelledby={labelledBy}>
{itens.map(it=>sidebarEntry(it,ctx))}
</ul>;
return listas.length<2?ul(listas[0]??[],0):<>{listas.map((t,k)=><React.Fragment key={k}>{k>0&&<div className="sidebar-separator" aria-hidden="true"/>}{ul(t,k)}</React.Fragment>)}</>;
}
function sidebarEntry(it:SidebarItem,ctx:SidebarCtx):ReactElement{
const lid=ctx.baseId+it.id;
const filhos=it.items?.length?it.items:undefined;
// Rótulo escondido vira `.sr-only` em vez de sumir do DOM: na lateral recolhida o item
// continua tendo nome para quem usa leitor de tela. Ícone sozinho não nomeia nada.
const oculto=(no:ReactNode)=>ctx.collapsed?<span className="sr-only">{no}</span>:no;
if(filhos&&!it.href&&!it.onClick&&!it.render)return <SidebarGroup key={it.id} item={it} filhos={filhos} lid={lid} ctx={ctx}/>;
const ativo=it.id===ctx.current;
// O item escolhido desenha o ícone CHEIO (ADR-0053). Com `avatar`, a foto toma o lugar do ícone (4-E).
const miolo=<>{it.avatar?<Avatar src={it.avatar.src} fallback={it.avatar.fallback} className="sidebar-avatar"/>:it.icon&&<Icon name={it.icon} weight={ativo?"fill":undefined}/>}<span className={cx("sidebar-label",ctx.collapsed&&"sr-only")}>{it.label}</span>{it.badge!=null&&oculto(it.badge)}</>;
const alvo=it.render
?fundirRender(it.render,{id:lid,className:"sidebar-item","aria-current":ativo?"page":undefined,onClick:it.onClick,children:miolo},"a")
:it.href
?<a id={lid} href={it.href} className="sidebar-item" aria-current={ativo?"page":undefined} onClick={it.onClick}>{miolo}</a>
:<button id={lid} type="button" className="sidebar-item" aria-current={ativo?"page":undefined} onClick={it.onClick}>{miolo}</button>;
// NO TRILHO O NOME SÓ EXISTE NO TOOLTIP. Recolhida, a lateral manda o rótulo para `.sr-only`: quem
// usa leitor de tela continua ouvindo, e quem ENXERGA fica com um ícone mudo. A referência resolve
// isso com tooltip no botão de navegação dela, e é o que falta para um trilho de ícone não virar adivinhação.
// Só quando recolhida: com o rótulo visível ao lado, o tooltip repetiria o que já está na tela.
// `side="right"` porque a lateral encosta na borda esquerda — para cima o balão sairia do trilho.
// A SUBLISTA SOME NA TRILHA (2-A, o achado 13 do item 106): recolhido, o subitem sem ícone virava um botão vazio. A
// referência esconde a sublista quando a lateral recolhe; o item pai continua, com o nome na dica.
const acao=it.action!=null&&!ctx.collapsed;
return <li key={it.id} className={cx(acao&&"sidebar-item-with-action")}>
{ctx.collapsed?<Tooltip content={it.label} side="right">{alvo}</Tooltip>:alvo}
{acao&&<span className="sidebar-item-action">{it.action}</span>}
{filhos&&!ctx.collapsed&&sidebarList(filhos,ctx,true,lid)}
</li>;
}
// O GRUPO QUE DOBRA (4-D, 25/10/2026). O nome do grupo vira o botão de abrir e fechar — o padrão de divulgação (o mesmo
// do `Collapsible`): `aria-expanded` no botão e `aria-controls` na lista, que fica no DOM com `hidden` quando fechada. A
// seta aponta para baixo aberto e para o fim da linha fechado, como a do grupo que dobra da referência principal. A ação do grupo (o "+") fica ao lado do nome. Recolhida, o
// nome vai para o leitor de tela e a lista aparece inteira, como o grupo de sempre: na trilha não há onde dobrar.
function SidebarGroup({item,filhos,lid,ctx}:{item:SidebarItem;filhos:SidebarEntry[];lid:string;ctx:SidebarCtx}){
const [aberto,setAberto]=React.useState(item.defaultOpen??true);
const direita=useDirection()==="rtl";
const dobra=!!item.collapsible&&!ctx.collapsed;
const acao=item.action!=null&&!ctx.collapsed;
const nome=dobra
?<button id={lid} type="button" className="sidebar-group-label sidebar-group-toggle" aria-expanded={aberto} aria-controls={lid+"-lista"} onClick={()=>setAberto(v=>!v)}><span>{item.label}</span><Icon name={aberto?"caret-down":direita?"caret-left":"caret-right"} size="sm" className="sidebar-group-caret"/></button>
:<p id={lid} className={cx("sidebar-group-label",ctx.collapsed&&"sr-only")}>{item.label}</p>;
const lista=sidebarList(filhos,ctx,false,lid);
return <li>
{acao||dobra?<div className="sidebar-group-head">{nome}{acao&&<span className="sidebar-group-action">{item.action}</span>}</div>:nome}
{dobra?<div id={lid+"-lista"} hidden={!aberto}>{lista}</div>:lista}
</li>}
// `variant` entrou em 18/08/2026, e nasceu com o PADRÃO TROCADO: a lateral virou rente para todo
// mundo. O Victor separou as duas coisas em 20/08/2026 — a exceção que ele abriu é para a lateral
// PODER ser rente, não para a Aurea deixar de flutuar: "o nosso vai ser tudo flutuante mas isso
// não impede da gente ter outras variações para as pessoas que nos acharem no npm usarem".
// Então `floating` é o padrão (o desenho da `0.3.0`, que segue publicado sem quebra) e `flush` é a
// variante — a ÚNICA exceção à caixa flutuante desta casa, medida em quatro aplicativos que rodam
// na mão, um deles o painel da própria referência de desenho. Ver ADR-0034.
// `plain` (0.32.0): a lateral SEM CAIXA — sem fundo, sem linha, sem sombra —, com o lugar e a altura da
// flutuante. É a coluna "On this page" da documentação da referência, os itens soltos na página.
export type SidebarVariant="floating"|"flush"|"plain";
// `scrollbar` (0.32.0): `hover`, o padrão, é a barra da documentação da referência — clara, invisível
// parada, e de volta com o ponteiro em cima, com o foco dentro, e sempre em tela de toque (o Victor,
// 13/10/2026: "pode alterar o atual para ser claro e sumir a rolagem"). `visible` é o desenho de
// antes, a barra sempre à vista, para quem precisa dela o tempo todo.
export type SidebarScrollbar="hover"|"visible";
// A GAVETA FECHA AO ESCOLHER (A-06, 23/09/2026). Abaixo de lg a lateral do `AppShell` é popover,
// e a biblioteca a abria e NUNCA a fechava por código: `hidePopover` tinha zero ocorrências. O
// usuário tocava "Relatórios", a página trocava por baixo e a gaveta ficava na frente dela. Duas das
// referências de desenho e o guia de gaveta do iOS fecham ao escolher. O fechamento mora NA LATERAL, e não no
// item, para valer também para a navegação que o consumidor escreve e passa como `children` — o
// catálogo é um desses. Fora do popover (desktop, lateral solta) o teste de `:popover-open` falha e
// nada acontece. O `try` é porque `:popover-open` é seletor desconhecido em motor antigo, e lá o
// `matches` lança em vez de devolver falso.
function fecharGavetaAoEscolher(e:React.MouseEvent<HTMLElement>){
  if(e.defaultPrevented)return;
  const gaveta=e.currentTarget;
  const alvo=(e.target as Element|null)?.closest?.("a[href], .sidebar-item");
  if(!alvo||!gaveta.contains(alvo))return;
  try{if(gaveta.matches(":popover-open"))gaveta.hidePopover()}catch{/* motor sem popover: não há gaveta */}
}
// `placement` (0.32.0, DOC-01): de que lado da tela a lateral mora — `left` (o padrão) ou `right`, o
// nome de uma das referências da fila (a principal não tem moldura de página). Na direita, o fio da
// lateral encostada passa para o outro lado. É a coluna "Nesta página" do `AppShell` (`aside`).
export type SidebarPlacement="left"|"right";
// O TOPO E O PÉ FIXOS (4-C, o item 107 — as quinze laterais aprovadas pelo Victor em 21/10/2026, e o PV-15 de um
// segundo app). `header` e `footer` ficam presos; só o meio (a lista e o que vier em `children`) rola. Sem eles, a
// lateral continua a caixa de sempre — o mesmo HTML. As partes que moram neles (`Sidebar.Brand`, `Sidebar.User`,
// `Sidebar.Nav`, `Sidebar.Show`) sabem se a lateral está recolhida por este contexto, interno: o estado de recolher
// com gancho, para o app, é o 4-B.
const SidebarContext=React.createContext<{collapsed:boolean;current?:string}>({collapsed:false});
// OS JEITOS DE RECOLHER (4-A, as quinze laterais). `icon`, o padrão: a trilha de ícones de sempre. `capsule`: a trilha com o
// canto de cápsula (as 3, 5, 9, 10 e 14 das quinze). `offcanvas`: recolhida, a lateral sai da tela no computador (as 2 e 4) —
// o nome da referência, que tem os mesmos `icon` e `offcanvas`.
export type SidebarCollapsible="icon"|"capsule"|"offcanvas";
// O ITEM ATUAL (4-H, o item 101 — o Victor, 21/10/2026: "Manter 1, e criar tambem 2, 3, 4, 5 como alternativas"). `brand`, o
// padrão de hoje: no claro, o botão primário; no escuro, a cápsula com a letra amarela e o fio. `segment`: a cápsula da aba
// escolhida (`--segment` + `--shadow-sm`, ADR-0059), a letra na cor do texto, sem fio — o item atual da documentação da
// referência. `segment-dot` e `segment-line`: a mesma, com o ponto amarelo antes do nome ou o fio amarelo embaixo. `subtle`:
// só o cinza, sem cor de marca.
export type SidebarIndicator="brand"|"segment"|"segment-dot"|"segment-line"|"subtle";
// O ESTADO DA LATERAL FORA DO `AppShell` (4-B, 25/10/2026). A referência põe o estado num provedor (aberta ou recolhida,
// controlado ou não), com um gancho e o atalho Ctrl+B (Cmd+B no Mac). Aqui é a parte `Sidebar.Provider`, e o `AppShell` a
// usa por dentro: o `Sidebar.Toggle` e o `useSidebar` funcionam nos dois.
export interface SidebarState{
  /** Recolhida agora. */
  collapsed:boolean;
  setCollapsed:(collapsed:boolean)=>void;
  toggle:()=>void;
  /** O jeito de recolher que o provedor passa à lateral. */
  collapsible:SidebarCollapsible;
  /** O `id` da lateral: o botão de recolher aponta para ela (`aria-controls`). */
  id:string}
const SidebarStateContext=React.createContext<SidebarState|null>(null);
/** O estado da lateral: dentro de um `Sidebar.Provider` ou de um `AppShell` com `sidebarCollapsible`. Fora deles, `null`. */
export function useSidebar():SidebarState|null{return React.useContext(SidebarStateContext)}
// O ATALHO, como o da referência: Ctrl+B, e Cmd+B no Mac. A DIVERGÊNCIA, com o motivo: na referência ele vale até dentro de um
// campo, e rouba o negrito de quem escreve num editor; aqui ele não age onde se digita.
const ONDE_SE_DIGITA="input,textarea,select,[contenteditable]:not([contenteditable=false])";
function SidebarProvider({collapsed,defaultCollapsed=false,onCollapsedChange,collapsible="icon",shortcut=true,id,children}:{
  /** Recolhida (controlado). */
  collapsed?:boolean;defaultCollapsed?:boolean;onCollapsedChange?:(collapsed:boolean)=>void;
  /** O jeito de recolher (4-A). Padrão: `icon`, a trilha. */
  collapsible?:SidebarCollapsible;
  /** O atalho Ctrl+B (Cmd+B no Mac). Padrão: ligado, como na referência. */
  shortcut?:boolean;
  /** O `id` da lateral. Sem ele, um gerado. */
  id?:string;children?:ReactNode}){
const [interno,setInterno]=React.useState(defaultCollapsed);
const controlado=collapsed!==undefined;
const valor=controlado?!!collapsed:interno;
const gerado=React.useId();
const aviso=useRef(onCollapsedChange);aviso.current=onCollapsedChange;
const setCollapsed=React.useCallback((v:boolean)=>{if(!controlado)setInterno(v);aviso.current?.(v)},[controlado]);
const toggle=React.useCallback(()=>setCollapsed(!valor),[setCollapsed,valor]);
const alternar=useRef(toggle);alternar.current=toggle;
React.useEffect(()=>{
  if(!shortcut||typeof window==="undefined")return;
  const f=(e:KeyboardEvent)=>{
    if(e.defaultPrevented||e.altKey||e.shiftKey||!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=="b")return;
    if((e.target as Element|null)?.closest?.(ONDE_SE_DIGITA))return;
    e.preventDefault();alternar.current();
  };
  window.addEventListener("keydown",f);
  return()=>window.removeEventListener("keydown",f);
},[shortcut]);
const estado=React.useMemo(()=>({collapsed:valor,setCollapsed,toggle,collapsible,id:id??"aurea-sidebar"+gerado.replace(/:/g,"")}),[valor,setCollapsed,toggle,collapsible,id,gerado]);
return <SidebarStateContext.Provider value={estado}>{children}</SidebarStateContext.Provider>}
// O BOTÃO DE RECOLHER EM QUALQUER LUGAR (4-B). `icon`: o botão de ícone das quinze (o desenho de lateral, sem fundo) — ao lado
// do título (1 e 12) ou dentro da lateral, ao lado da marca (13 a 15). `item`: uma linha da lista, "Recolher o menu", no pé da
// lateral (a 11). Fora de um provedor, não desenha nada.
// O `variant` aqui é o jeito do botão ("icon" ou "item"); a aparência é sempre a do botão fantasma, como o das quinze.
function SidebarToggle({variant="icon",className,onClick,...props}:Omit<IconButtonProps,"icon"|"label"|"variant"|"children">&{variant?:"icon"|"item"}){
const estado=React.useContext(SidebarStateContext);
const {collapsed}=React.useContext(SidebarContext);
const s=useAureaStrings();
if(!estado)return null;
const rotulo=estado.collapsed?s.sidebarExpand:s.sidebarCollapse;
const comum={"aria-expanded":!estado.collapsed,"aria-controls":estado.id,onClick:(e:React.MouseEvent<HTMLButtonElement>)=>{onClick?.(e);if(!e.defaultPrevented)estado.toggle()}};
if(variant==="item"){
  // A linha é um botão do HTML: o que só o `IconButton` entende (tamanho, aparência, ocupado) não passa para ele.
  const {size:_t,appearance:_a,tone:_o,loading:_l,leadingIcon:_li,trailingIcon:_ti,href:_h,fullWidth:_f,quiet:_q,grow:_g,render:_r,target:_tg,rel:_rl,download:_d,pressed:_p,share:_s,kbd:_k,...html}=props;
  const linha=<button type="button" {...html} {...comum} className={cx("sidebar-item","sidebar-toggle-item",className)}><Icon name="sidebar-simple"/><span className={cx("sidebar-label",collapsed&&"sr-only")}>{rotulo}</span></button>;
  return collapsed?<Tooltip content={rotulo} side="right">{linha}</Tooltip>:linha;
}
return <IconButton {...props} {...comum} className={cx("sidebar-collapse-trigger",className)} icon="sidebar-simple" label={rotulo}/>}
// A TRILHA DAS SEÇÕES E O PAINEL (4-F e 4-G, 25/10/2026 — as 6 e 7 das quinze). Com `panel`, os itens do primeiro nível são
// SEÇÕES: a trilha mostra o ícone de cada uma, e a lista da seção mora num painel. `docked` (a 6): o painel fica ao lado da
// trilha, e recolher a lateral esconde só o painel. `overlay` (a 7): o painel abre POR CIMA, ao lado do ícone, numa janelinha
// que segura o foco e fecha com o Esc ou com um clique fora (a janelinha da Aurea, o motor dela). A referência faz a 6 com duas
// laterais lado a lado (a trilha que escolhe e a lista da escolhida); a 7 não tem nela — vem da bancada das quinze.
// A seção da página atual leva `aria-current="true"` (a "atual de um conjunto"), e não `page`: ela não é a página.
const contem=(it:SidebarItem,id?:string):boolean=>!!id&&(it.id===id||!!it.items?.some(f=>f!=="separator"&&contem(f,id)));
function SidebarSectionButton({sec,ctx,aberta,painelId,onEscolher,recolhida}:{sec:SidebarItem;ctx:SidebarCtx;aberta:boolean;painelId:string;onEscolher:()=>void;recolhida:boolean}){
return <Tooltip content={sec.label} side="right"><button type="button" className="sidebar-item" aria-current={contem(sec,ctx.current)?"true":undefined} aria-expanded={!recolhida&&aberta} aria-controls={painelId} onClick={onEscolher}>
{sec.avatar?<Avatar src={sec.avatar.src} fallback={sec.avatar.fallback} className="sidebar-avatar"/>:sec.icon&&<Icon name={sec.icon} weight={contem(sec,ctx.current)?"fill":undefined}/>}<span className="sidebar-label sr-only">{sec.label}</span></button></Tooltip>}
function SidebarSectionFlyout({sec,ctx}:{sec:SidebarItem;ctx:SidebarCtx}){
const portal=usePortalContainer();
const atual=contem(sec,ctx.current);
const tituloId=ctx.baseId+sec.id+"-titulo";
return <BasePopover.Root>
<Tooltip content={sec.label} side="right"><BasePopover.Trigger render={<button type="button" className="sidebar-item" aria-current={atual?"true":undefined}/>}>
{sec.avatar?<Avatar src={sec.avatar.src} fallback={sec.avatar.fallback} className="sidebar-avatar"/>:sec.icon&&<Icon name={sec.icon} weight={atual?"fill":undefined}/>}<span className="sidebar-label sr-only">{sec.label}</span></BasePopover.Trigger></Tooltip>
<BasePopover.Portal container={portal}><BasePopover.Positioner className="positioner" side="right" align="start" sideOffset={8}><BasePopover.Popup className="popover sidebar-flyout" aria-labelledby={tituloId}>
<p id={tituloId} className="sidebar-panel-title">{sec.label}</p>
<nav className="sidebar-nav" aria-labelledby={tituloId}>{sidebarList(sec.items??[],{...ctx,collapsed:false})}</nav>
</BasePopover.Popup></BasePopover.Positioner></BasePopover.Portal>
</BasePopover.Root>}
export function Sidebar({items,current,collapsed,collapsible,indicator="brand",panel,variant="floating",placement="left",scrollbar="hover",label,header,footer,children,className,onClick,id,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{items?:SidebarEntry[];current?:string;collapsed?:boolean;variant?:SidebarVariant;placement?:SidebarPlacement;scrollbar?:SidebarScrollbar;label?:string;
  /** O jeito de recolher (4-A): `icon` (a trilha, o padrão), `capsule` (a trilha em cápsula) ou `offcanvas` (sai da tela).
   *  Dentro de um `Sidebar.Provider`, vem dele. */
  collapsible?:SidebarCollapsible;
  /** O desenho do item atual (4-H): `brand` (o de hoje), `segment`, `segment-dot`, `segment-line` ou `subtle`. */
  indicator?:SidebarIndicator;
  /** A trilha das seções com o painel (4-F e 4-G): os itens do primeiro nível viram seções, e a lista da seção mora num
   *  painel — `docked`, ao lado da trilha (recolher esconde só o painel), ou `overlay`, por cima, ao lado do ícone. */
  panel?:"docked"|"overlay";
  /** O topo fixo (4-C): a marca do app (`Sidebar.Brand`), a busca. Não rola com a lista. */
  header?:ReactNode;
  /** O pé fixo (4-C): a pessoa e o sair (`Sidebar.User`), a lista curta (`Sidebar.Nav`), o cartão de destaque. Não rola com a lista. */
  footer?:ReactNode}){
const s=useAureaStrings();
const baseId=React.useId();
// Dentro de um provedor, a lateral segue o estado dele; a prop escrita ganha (quem escreveu as duas quis a prop).
const estado=React.useContext(SidebarStateContext);
const recolhida=collapsed??estado?.collapsed??false;
const forma=collapsible??estado?.collapsible??"icon";
const lista=items&&items.length>0&&<nav className="sidebar-nav" aria-label={label??s.sidebarLabel}>{sidebarList(items,{baseId,current,collapsed:recolhida})}</nav>;
const partes=header!=null||footer!=null;
const contexto=React.useMemo(()=>({collapsed:recolhida,current}),[recolhida,current]);
const secoes=panel?(items??[]).filter((it):it is SidebarItem=>it!=="separator"):[];
const [escolhida,setEscolhida]=React.useState<string|undefined>(()=>secoes.find(x=>contem(x,current))?.id??secoes[0]?.id);
const naTrilha=React.useMemo(()=>({collapsed:true,current}),[current]);
if(panel){
  const secao=secoes.find(x=>x.id===escolhida)??secoes[0];
  const painelId=baseId.replace(/:/g,"")+"-painel";
  const ctxTrilha={baseId,current,collapsed:true};
  const trilha=<nav className="sidebar-nav" aria-label={label??s.sidebarLabel}><ul className="sidebar-list">{secoes.map(sec=><li key={sec.id}>{panel==="overlay"
    ?<SidebarSectionFlyout sec={sec} ctx={ctxTrilha}/>
    :<SidebarSectionButton sec={sec} ctx={ctxTrilha} aberta={sec.id===secao?.id} painelId={painelId} recolhida={recolhida} onEscolher={()=>{setEscolhida(sec.id);if(recolhida)estado?.setCollapsed(false)}}/>}</li>)}</ul></nav>;
  return <aside id={id??estado?.id} className={cx("sidebar",variant!=="floating"&&`sidebar-${variant}`,`sidebar-panel-${panel}`,recolhida&&"sidebar-collapsed",indicator!=="brand"&&`sidebar-indicator-${indicator}`,placement==="right"&&"sidebar-right",scrollbar==="visible"&&"sidebar-scrollbar-visible",className)} data-placement={placement} onClick={e=>{onClick?.(e);fecharGavetaAoEscolher(e)}} {...props}>
  <div className="sidebar-rail-box"><SidebarContext.Provider value={naTrilha}>{header!=null&&<div className="sidebar-header">{header}</div>}<div className="sidebar-body">{trilha}{children}</div>{footer!=null&&<div className="sidebar-footer">{footer}</div>}</SidebarContext.Provider></div>
  {panel==="docked"&&secao&&<div className="sidebar-panel" id={painelId} hidden={recolhida}><p className="sidebar-panel-title" id={painelId+"-titulo"}>{secao.label}</p><nav className="sidebar-nav" aria-labelledby={painelId+"-titulo"}>{sidebarList(secao.items??[],{baseId,current,collapsed:false})}</nav></div>}
  </aside>;
}
return <aside id={id??estado?.id} className={cx("sidebar",variant!=="floating"&&`sidebar-${variant}`,recolhida&&"sidebar-collapsed",forma!=="icon"&&`sidebar-collapse-${forma}`,indicator!=="brand"&&`sidebar-indicator-${indicator}`,placement==="right"&&"sidebar-right",scrollbar==="visible"&&"sidebar-scrollbar-visible",partes&&"sidebar-with-parts",className)} data-placement={placement} onClick={e=>{onClick?.(e);fecharGavetaAoEscolher(e)}} {...props}>
<SidebarContext.Provider value={contexto}>
{partes
?<>{header!=null&&<div className="sidebar-header">{header}</div>}<div className="sidebar-body">{lista}{children}</div>{footer!=null&&<div className="sidebar-footer">{footer}</div>}</>
:<>{lista}{children}</>}
</SidebarContext.Provider>
</aside>}
// As partes moram LOGO DEPOIS da lateral (as funções sobem no módulo): assim a leitura do check 46 alcança, a partir da
// `Sidebar`, os ícones fixos delas — o `sidebar-simple` do `Sidebar.Toggle` ficava sem ficha que o alcançasse.
Sidebar.Brand=SidebarBrand;
Sidebar.User=SidebarUser;
Sidebar.Nav=SidebarNav;
Sidebar.Show=SidebarShow;
Sidebar.Provider=SidebarProvider;
Sidebar.Toggle=SidebarToggle;
/** A marca do app no topo da lateral: o `logo` (a letra, o desenho, a imagem), o nome e o subtítulo. `variant="tile"` (o
 *  padrão, a 11 das quinze) põe o logo num quadrinho na cor primária; `plain` (da 8 à 10) é o desenho solto e o nome
 *  grande. Recolhida, fica só o logo. */
// `action` (o bloco 2, 0.44.0): o botão de recolher ao lado da marca, dentro da lateral (as 13, 14 e 15 das quinze) — o mesmo
// lugar que a `Sidebar.User` dá ao "sair". Recolhida, ele desce para baixo do logo.
function SidebarBrand({logo,name,description,variant="tile",action,className,...props}:Omit<HTMLAttributes<HTMLDivElement>,"children">&{logo:ReactNode;name:ReactNode;description?:ReactNode;variant?:"tile"|"plain";
  /** Uma ação ao lado da marca: o `Sidebar.Toggle`. Recolhida, ela desce para baixo do logo. */
  action?:ReactNode}){
const {collapsed}=React.useContext(SidebarContext);
return <div className={cx("sidebar-brand",variant==="plain"&&"sidebar-brand-plain",action!=null&&"sidebar-brand-with-action",className)} {...props}>
<span className="sidebar-brand-logo" aria-hidden="true">{logo}</span>
<span className={cx("sidebar-brand-text",collapsed&&"sr-only")}><strong className="sidebar-brand-name">{name}</strong>{description!=null&&<span className="sidebar-brand-description">{description}</span>}</span>
{action}
</div>}
/** A pessoa no pé da lateral, numa caixinha: a foto (`avatar`), o nome, o papel e a ação (o sair). Recolhida, a foto e a ação, empilhadas. */
function SidebarUser({avatar,name,description,action,className,...props}:Omit<HTMLAttributes<HTMLDivElement>,"children">&{avatar:ReactNode;name:ReactNode;description?:ReactNode;action?:ReactNode}){
const {collapsed}=React.useContext(SidebarContext);
return <div className={cx("sidebar-user",className)} {...props}>
{avatar}
<span className={cx("sidebar-user-text",collapsed&&"sr-only")}><strong className="sidebar-user-name">{name}</strong>{description!=null&&<span className="sidebar-user-description">{description}</span>}</span>
{action}
</div>}
/** Uma segunda lista com a pele da lateral (a do pé: Suporte, Ajustes). `label` é obrigatório: duas listas com o mesmo nome confundem o leitor de tela. */
function SidebarNav({items,current,label,className,...props}:Omit<HTMLAttributes<HTMLElement>,"children">&{items:SidebarEntry[];current?:string;label:string}){
const ctx=React.useContext(SidebarContext);
const baseId=React.useId();
return <nav className={cx("sidebar-nav",className)} aria-label={label} {...props}>{sidebarList(items,{baseId,current:current??ctx.current,collapsed:ctx.collapsed})}</nav>}
/** O que só aparece com a lateral aberta (`when="expanded"`: a busca, o cartão de destaque) ou só recolhida (`when="collapsed"`: o botão da lupa). */
function SidebarShow({when,children}:{when:"expanded"|"collapsed";children?:ReactNode}){
const {collapsed}=React.useContext(SidebarContext);
return (when==="collapsed")===collapsed?<>{children}</>:null}
// ── NAVEGAÇÃO INFERIOR ────────────────────────────────────────────────────────────────
// A lacuna ESTRUTURAL medida no `CONSUMIDOR-1.md` §4.1: `Topbar` e `Sidebar` são
// vocabulário de DESKTOP, e aplicativo não navega assim.
//
// `SidebarItem` DE NOVO, e não um tipo novo: a MESMA lista alimenta a lateral no desktop e
// a barra no telefone. Um `BottomNavItem` obrigaria o consumidor a manter duas listas do
// mesmo menu, e listas gêmeas divergem — é o defeito, não a conveniência. Sublista (`items`)
// é IGNORADA aqui: barra inferior é plana, e nível dois dentro de um alvo de toque não
// existe em referência nenhuma.
//
// NÃO É `Tabs`, e a distinção é a decisão: aba troca PAINEL dentro da página, barra inferior
// troca de PÁGINA. Dar `role="tablist"` a um menu faz o leitor de tela prometer setas que não
// levam a lugar nenhum. Foi o que uma das referências evita por baixo (a dela é `<div>` de botões) e o que
// outra escreve por cima: o contêiner é landmark `<nav>`, o item é link.
// TECLADO: o mesmo do `Sidebar`, pela mesma razão — não há padrão APG para navegação de
// site. Link em `<nav>`, ordem de Tab nativa, `aria-current="page"` no atual.
// A GRAMÁTICA, reescrita em 20/08/2026 pela auditoria de UI/UX que o Victor encomendou.
//
// O achado dela é ESTRUTURAL, não estético: `flat`, `surface`, `pill` e `dock` não derivavam de
// uma gramática só. Cada uma dizia "esta é a página atual" com uma linguagem diferente — cor,
// cápsula cinza, bloco amarelo, círculo — e duas escondiam o rótulo. Trocar de variante trocava
// o modelo mental do componente, não a forma dele.
//
// Agora são DOIS EIXOS que se combinam, e cada um responde uma pergunta só:
//   `variant`   — onde a BARRA fica: `floating` (pílula solta) ou `edge` (encostada, fio em cima).
//   `indicator` — que FORMA marca o item atual. A semântica é sempre a mesma: ouro.
//
// Os sete indicadores são as sete telas que o Victor desenhou em 20/08/2026, e a `edge` com
// `indicator="none"` é a que ele marcou como **Recommended**.
//
// O RÓTULO NÃO SOME MAIS EM NENHUM DOS SETE. Era o achado 6/7 da auditoria e é o que as sete
// telas mostram: rótulo em todo item, sempre. `dock` escondia todos e `pill` escondia os
// inativos — ícone sozinho só serve quando o símbolo é inequívoco, e `Garage`/`Fuel`/`Service`
// não são. Quem quiser barra só de ícone hoje passa `label` com `.sr-only` no próprio conteúdo;
// não é o componente que decide apagar o nome do destino.
//
// OS QUATRO NOMES ANTIGOS CONTINUAM ACEITOS e mapeiam para o par novo, como o `pressed` do
// Button na ADR-0032: quebrar assinatura publicada sem aviso é o defeito, não a limpeza.
//   flat -> edge/none · surface -> floating/circle · pill -> floating/pill · dock -> floating/circle
export type BottomNavVariant="floating"|"edge";
// `capsule` e `expand` entraram em 03/10/2026, da bancada do Victor: a cápsula amarela só atrás do
// ícone (o modelo de uma das referências de desenho) e o item escolhido que vira cápsula com o nome ao lado.
export type BottomNavIndicator="none"|"subtle"|"pill"|"circle"|"circle-raised"|"circle-bold"|"circle-outline"|"capsule"|"expand";
// A LARGURA É UM TERCEIRO EIXO, e não um nome de variant — R-08, 24/09/2026 (*"ficou super
// largo"*). `content` põe a pílula do tamanho das abas, no centro. Vale só quando a barra flutua:
// a `edge` encosta na borda e continua da largura da tela.
export type BottomNavWidth="full"|"content";
/** @deprecated Os quatro nomes de 17/08/2026. Use `variant` + `indicator`. */
export type BottomNavVariantLegacy="flat"|"surface"|"pill"|"dock";
// UM nome para a união dos dois, e não é cosmética: o extrator da superfície resolve alias em
// CADEIA e não uma UNIÃO de dois aliases, então `BottomNavVariant|BottomNavVariantLegacy` na prop
// saía como "nenhuma união literal" e o check 14 não tinha o que comparar com a ficha. Com um
// nome só, os seis valores aparecem — e o alias diz, por si, que o conjunto é atual + legado.
export type BottomNavVariantAny=BottomNavVariant|BottomNavVariantLegacy;
const LEGADO:Record<BottomNavVariantLegacy,[BottomNavVariant,BottomNavIndicator]>={
flat:["edge","none"],surface:["floating","circle"],pill:["floating","pill"],dock:["floating","circle"]};
export function BottomNav({items,current,variant="floating",indicator="none",width="full",label,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{items:SidebarEntry[];current?:string;variant?:BottomNavVariantAny;indicator?:BottomNavIndicator;width?:BottomNavWidth;label?:string}){
const s=useAureaStrings();
const [layout,marca0]=variant in LEGADO?LEGADO[variant as BottomNavVariantLegacy]:[variant as BottomNavVariant,indicator];
// O indicador explícito ganha do que o nome legado implica: quem escreveu os dois quis os dois.
const ind=indicator!=="none"?indicator:marca0;
return <nav className={cx("bottom-nav",layout==="edge"&&"bottom-nav-edge",layout!=="edge"&&width==="content"&&"bottom-nav-content",`bottom-nav-ind-${ind}`,className)} aria-label={label??s.bottomNavLabel} {...props}>
{/* A divisória da lateral (4-E) não existe na barra de baixo: a mesma lista serve às duas, e aqui ela é ignorada,
 como a sublista. */}
{items.filter((it):it is SidebarItem=>it!=="separator").map(it=>{
const ativo=it.id===current;
// O CONTADOR PENDURA NO ÍCONE, e é por isso que existe esta caixa. Pendurado no ITEM (a
// primeira versão), `50%` cai no meio do RÓTULO quando o item é linha — o Victor viu o número
// cobrir o nome inteiro em 17/08/2026. A pesquisa (uma das referências de desenho e os guias de
// barra de abas do iOS) diz a mesma coisa: canto superior do ÍCONE, encostando na borda dele, nunca sobre o
// texto. A caixa é o que dá ao contador um canto para se ancorar — e nos quatro indicadores
// redondos é ela que VIRA o círculo, com o rótulo embaixo, fora dele.
// `size="lg"` porque a proporção contra o contador foi medida: 24 para 16, razão 0,67.
// O item escolhido desenha o ícone CHEIO (ADR-0053).
const marca=<span className="bottom-nav-mark">
{it.icon&&<Icon name={it.icon} size="lg" weight={ativo?"fill":undefined}/>}
{it.badge!=null&&<span className="bottom-nav-badge">{it.badge}</span>}
</span>;
// O DISCO DO `circle-bold` é uma caixa DENTRO do item, em todos os itens (03/10/2026): quando o
// disco ERA o item escolhido, ele media 56 e os outros o conteúdo, e trocar de aba mudava a
// largura da barra. Agora o item mede o mesmo escolhido ou não; só a pintura muda.
// No `expand` o nome dos não escolhidos sai da TELA e fica para o leitor de tela: a `.sr-only`.
const corpo=<>{marca}<span className={cx("bottom-nav-label",ind==="expand"&&!ativo&&"sr-only")}>{it.label}</span></>;
const miolo=ind==="circle-bold"?<span className="bottom-nav-disc">{corpo}</span>:corpo;
return it.render
?<React.Fragment key={it.id}>{fundirRender(it.render,{className:"bottom-nav-item","aria-current":ativo?"page":undefined,onClick:it.onClick,children:miolo},"a")}</React.Fragment>
:it.href
?<a key={it.id} href={it.href} className="bottom-nav-item" aria-current={ativo?"page":undefined} onClick={it.onClick}>{miolo}</a>
:<button key={it.id} type="button" className="bottom-nav-item" aria-current={ativo?"page":undefined} onClick={it.onClick}>{miolo}</button>;
})}
</nav>}

// A LINHA DE LISTA TOCÁVEL — o §4.3 do `CONSUMIDOR-1.md`, a última lacuna do consumidor
// real. Ícone, rótulo, segunda linha opcional, valor opcional, e a seta que diz "isto abre".
//
// NÃO É `Sidebar` NEM `BottomNav`, e a distinção decidiu o desenho — sem ela isto seria o
// terceiro padrão paralelo de navegação, que o protocolo proíbe. Aqueles dois são CHROME de
// aplicativo: moram num `<nav>` e marcam a seção corrente com `aria-current="page"`. Este é
// CONTEÚDO dentro da página — a lista de destinos em que se ENTRA (a tela de ajustes). Por isso
// é um `<ul>` e NÃO um landmark: um terceiro `<nav>` na mesma tela só acrescenta ruído para quem
// navega por landmark, e numa lista em que se entra e se volta não há o que "estar corrente".
//
// E não é `DataList` (que é `<dl>`, termo e valor, e não se toca) nem `Table` (grade de dados) —
// a `DIRECTION.md` §3.2 separa os dois pelo comportamento, não pela aparência.
//
// A SEGUNDA LINHA veio da REFERÊNCIA, não da minha cabeça: o texto de item de lista de uma das referências
// tem um texto principal e um secundário, e tela de ajustes real usa as duas ("Notifications" / "Push, email").
// Das nove pastas de `Referencia/`, essa é a única com o componente maduro — o `base-ui`, que é o motor
// que já usamos, só tem `useCompositeListItem`, que é navegação de MENU por teclado e não isto.
//
// O QUE NÃO ENTROU dessa referência, pelo passo 5 do `BUILDING.md`: as props de densidade, de margem
// lateral, de alinhamento, de desligar a tipografia, de recuo, de foco automático e a do elemento
// polimórfico. As sete existem por causa do sistema de estilo e de densidade DELA; aqui a densidade é global e o
// elemento sai do `href`.
//
// A SETA SÓ APARECE EM LINHA QUE TEM DESTINO (`href`), e isto foi achado OLHANDO a página do
// catálogo em 18/08/2026: a linha "Sign out" saiu com seta, e seta promete que a linha ABRE algo —
// sair da conta não abre nada. O §4.3 do `CONSUMIDOR-1.md` pede "a seta que NAVEGA", e a
// única coisa que este componente sabe sobre navegar é o `href`. Linha de ação fica sem seta, que
// é o que tela de ajustes real faz. Sem prop para escolher: quem decide é o dado que já existe.
// Ela é decorativa e não precisa de `aria-hidden` escrito aqui — o `Icon` já emite o atributo no
// `<svg>`. E nunca é o alvo: o alvo é a linha INTEIRA, que é o que 2.5.8 mede.
//
// `disabled` deriva o ELEMENTO, e a forma NÃO é `disabled`: link desabilitado não existe em HTML,
// então linha indisponível é `<button>`. E o `<button>` leva `aria-disabled`, não o atributo —
// porque a medição de 13/08/2026 já está escrita no core (ao lado de `.btn:disabled`): `:disabled`
// TIRA o controle da ordem de foco e quem usa teclado nunca descobre que a linha existe.
// `aria-disabled` mantém focável e inerte, e o manipulador é que não é passado.
//
// AN-04 (03/10/2026): a foto e os sinais. Um consumidor monta com o `NavList` a lista de conversas
// (`description` = a última mensagem, `value` = as não lidas), e faltavam a foto de quem fala e os
// sinais de fixada e silenciada. Só acrescenta: sem `avatar` nem `indicators`, a linha é a de antes.
export interface NavListIndicator{icon:IconName;
  /** O que o sinal quer dizer ("Fixada"). Sai da tela e fica para o leitor de tela. */
  label:string}
export interface NavListItem{id:string;label:ReactNode;description?:ReactNode;value?:ReactNode;icon?:IconName;href?:string;onClick?:()=>void;disabled?:boolean;
  /** O link do roteador do app (M-01). Linha com `render` é linha com destino: leva a seta, como a com `href`. */
  render?:ReactElement;
  /** A foto da linha (AN-04) — o mesmo formato do `ChatMessage.avatar`. Toma o lugar do `icon`. */
  avatar?:{src?:string;fallback?:ReactNode};
  /** Os sinais ao lado do `value` (AN-04): fixada, silenciada. Pequenos e apagados, cada um com nome. */
  indicators?:NavListIndicator[]}
export function NavList({items,className,...props}:HTMLAttributes<HTMLUListElement>&RefAttributes<HTMLUListElement>&{items:NavListItem[]}){
return <ul className={cx("nav-list",className)} {...props}>
{items.map(it=>{
const miolo=<>
{it.avatar?<Avatar src={it.avatar.src} fallback={it.avatar.fallback}/>:it.icon&&<Icon name={it.icon}/>}
<span className="nav-list-text">
<span className="nav-list-label">{it.label}</span>
{it.description!=null&&<span className="nav-list-description">{it.description}</span>}
</span>
{it.indicators&&it.indicators.length>0&&<span className="nav-list-indicators">{it.indicators.map(x=>
  <span key={x.label}><Icon name={x.icon} size="sm"/><span className="sr-only">{x.label}</span></span>)}</span>}
{it.value!=null&&<span className="nav-list-value">{it.value}</span>}
{(it.href||it.render)&&<Icon name="caret-right" size="sm" className="nav-list-chevron"/>}
</>;
return <li key={it.id}>{it.render&&!it.disabled
?fundirRender(it.render,{className:"nav-list-row",onClick:it.onClick,children:miolo},"a")
:it.href&&!it.disabled
?<a href={it.href} className="nav-list-row" onClick={it.onClick}>{miolo}</a>
:<button type="button" className="nav-list-row" aria-disabled={it.disabled||undefined} onClick={it.disabled?undefined:it.onClick}>{miolo}</button>}</li>;
})}
</ul>}

// A MARCA mora no topo (decisão do Victor, 23/07/2026): o topo atravessa toda a largura
// e a lateral começa abaixo dele. Por isso o Topbar é sempre renderizado pelo AppShell —
// ele carrega a marca, então não é mais opcional; opcional é o CONTEÚDO dele.
import type {TopbarVariant} from "./markup.js";
export interface CommandItem{id:string;label:string;icon?:IconName;kbd?:string;run:()=>void;
  /** 0.32.0 (DOC-06): o grupo do item ("Componentes", "Páginas"). Itens com o mesmo grupo saem juntos,
   *  sob o título dele, na ordem em que o grupo aparece primeiro. */
  group?:string}
interface GrupoDeComandos{value:string;items:CommandItem[]}
export function CommandPalette({open,onClose,items,placeholder,label,shortcuts=true}:{open:boolean;onClose:()=>void;items:CommandItem[];placeholder?:string;label?:string;
  /** 0.32.0 (DOC-07): a linha que ensina as teclas, embaixo — ↑ ↓ mover, Enter abrir, Esc fechar. */
  shortcuts?:boolean}){
  const s=useAureaStrings();
  const idAtalhos=React.useId();
  // GRUPOS (0.32.0, DOC-06). Em 13/08/2026 a Aurea ficou SEM grupo, e a medição decidiu: dar a cada
  // `Group` a sua fatia de itens passava POR CIMA do filtro do motor (digitar "the" devolvia os três).
  // O caminho certo é o da documentação do motor (1.6.0, a paleta de exemplo dele): `items` agrupados
  // (`{value, items}`), e a lista recebe os grupos JÁ FILTRADOS. Sem `group` em nenhum item, a lista é
  // a de sempre.
  const grupos=React.useMemo(()=>{
    if(!items.some(i=>i.group))return null;
    const mapa=new Map<string,CommandItem[]>();
    for(const i of items){const g=i.group??"";if(!mapa.has(g))mapa.set(g,[]);mapa.get(g)!.push(i)}
    return [...mapa].map(([value,itens]):GrupoDeComandos=>({value,items:itens}));
  },[items]);
  const portal=usePortalContainer();
  const campo=useRef<HTMLInputElement>(null);
  const executa=(item:CommandItem)=>{onClose();item.run()};
  const linha=(item:CommandItem)=><BaseAutocomplete.Item key={item.id} value={item} className="menu-item command-item" onClick={()=>executa(item)}>
    {item.icon&&<Icon name={item.icon}/>}
    <span className="command-item-label">{item.label}</span>
    {item.kbd&&<Kbd>{item.kbd}</Kbd>}
  </BaseAutocomplete.Item>;
  // A JANELA É A DO MOTOR (14/10/2026), como na paleta de exemplo dele (1.6.0): `Dialog` por fora,
  // `Autocomplete` `inline` por dentro. Até aqui a moldura era uma `div` feita à mão, e o Victor achou no site
  // publicado: o clique no fundo não fechava, e depois dele o foco ia para a página — o Esc, que era escutado
  // dentro da caixa, não chegava mais. A janela do motor fecha pelos dois caminhos, prende o Tab, trava a
  // rolagem de trás e devolve o foco a quem abriu. O `open` continua do consumidor: o motor só AVISA
  // (`onOpenChange`), e quem fecha é o `onClose` — mesma regra do Dialog e do Drawer daqui. Os nomes de classe
  // ficaram: a moldura (`Viewport`) é a `.command-overlay`, a caixa (`Popup`) é a `.command-palette`.
  return <BaseDialog.Root open={open} onOpenChange={o=>{if(!o)onClose()}}>
    <BaseDialog.Portal container={portal}>
    <BaseDialog.Viewport className="command-overlay">
    {/* O campo recebe o foco pelo `initialFocus` da janela, e não por `autoFocus`: o `autoFocus` focava o campo
        ANTES de o motor anotar quem tinha o foco, e ao fechar o foco não voltava ao botão que abriu (medido). */}
    <BaseDialog.Popup className="command-palette" aria-label={label??s.commandLabel} initialFocus={campo}>
      {/* O `as` é sobre TIPO, não sobre comportamento: o motor aceita a estrutura agrupada em
          tempo de execução — é o mesmo caminho que o `MultiCombobox` daqui já usa, e o teste de
          grupo prova —, mas o genérico do `Root` fica preso em `CommandItem` por causa do
          `itemToStringValue`. Sem isto, ou se mente no tipo do item, ou se perde o agrupamento. */}
      {/* 0.32.0: a lista mora DENTRO da caixa da paleta (`inline`), como a paleta de exemplo do motor
          e como a prancha aprovada — e a linha de atalhos vem embaixo dela. Até a 0.31.0 a lista
          era um popup posicionado abaixo do campo (Portal > Positioner > Popup): em 14/08/2026, sem
          essas peças, o axe acusava o `combobox` sem `aria-controls`; no modo `inline` do 1.6.0 é o
          próprio motor que liga o campo à lista. */}
      {/* O `as` é sobre TIPO: o motor aceita os grupos em execução (é o exemplo de paleta dele), mas o
          genérico do `Root` fica preso em `CommandItem` pelo `itemToStringValue`. O teste de grupo
          (`lote-q-navegacao.test.tsx`) prova que filtra DENTRO dos grupos. */}
      <BaseAutocomplete.Root items={(grupos??items) as unknown as CommandItem[]} itemToStringValue={(i:CommandItem)=>i.label} mode="list" open inline autoHighlight="always" keepHighlight>
        {/* `aria-expanded` à mão (0.32.0): no `inline` o motor 1.6.0 publica o papel `combobox` SEM ele, e o
            atributo é obrigatório (o axe acusou `aria-required-attr`). A lista está sempre à vista. O Esc não
            se trata mais aqui: é a janela que fecha, de onde quer que o foco esteja dentro dela. */}
        <BaseAutocomplete.Input ref={campo} className="input" aria-label={placeholder??s.commandPlaceholder} placeholder={placeholder??s.commandPlaceholder}
          aria-expanded={true} aria-describedby={shortcuts?idAtalhos:undefined}/>
        <div className="menu command-list">
          <BaseAutocomplete.Empty className="combobox-empty">{s.comboboxEmpty}</BaseAutocomplete.Empty>
          <BaseAutocomplete.List>
            {grupos
              ?(g:GrupoDeComandos)=><BaseAutocomplete.Group key={g.value} items={g.items} className="command-group">
                  {g.value&&<BaseAutocomplete.GroupLabel className="command-group-label">{g.value}</BaseAutocomplete.GroupLabel>}
                  <BaseAutocomplete.Collection>{linha}</BaseAutocomplete.Collection>
                </BaseAutocomplete.Group>
              :<BaseAutocomplete.Collection>{linha}</BaseAutocomplete.Collection>}
          </BaseAutocomplete.List>
        </div>
      </BaseAutocomplete.Root>
      {shortcuts&&<p className="command-shortcuts" id={idAtalhos}>
        <span><Kbd>↑</Kbd><Kbd>↓</Kbd> {s.commandHintMove}</span>
        <span><Kbd>Enter</Kbd> {s.commandHintSelect}</span>
        <span><Kbd>Esc</Kbd> {s.commandHintClose}</span>
      </p>}
    </BaseDialog.Popup>
    </BaseDialog.Viewport>
    </BaseDialog.Portal>
  </BaseDialog.Root>;
}
// A CASCA (15/10/2026, o Victor: "C sim"): a mesma janela do motor da `CommandPalette` acima. Até aqui era uma `div`
// feita à mão — o mesmo defeito que a busca do site teve: o clique fora e o Esc não fechavam, e o Tab saía da caixa.
// Agora o motor avisa pelos dois caminhos (`onClose`, novo), prende o Tab e devolve o foco a quem abriu. Sem `onClose`,
// a janela fica aberta até o `open` do consumidor mudar — como antes. O campo recebe o foco pelo `initialFocus`.
export function CommandPaletteShell({open,query,onQueryChange,onClose,label,children}:{open:boolean;query:string;onQueryChange:(v:string)=>void;
  /** Quem fecha: a janela avisa pelo Esc e pelo clique fora. */
  onClose?:()=>void;
  /** O nome da janela (o padrão é o da paleta, "Command palette"). */
  label?:string;children?:ReactNode}){
  const s=useAureaStrings();
  const portal=usePortalContainer();
  const campo=useRef<HTMLInputElement>(null);
  return <BaseDialog.Root open={open} onOpenChange={o=>{if(!o)onClose?.()}}>
    <BaseDialog.Portal container={portal}>
    <BaseDialog.Viewport className="command-overlay">
    <BaseDialog.Popup className="command-palette" aria-label={label??s.commandLabel} initialFocus={campo}>
      <SearchField ref={campo} aria-label={s.commandPlaceholder} value={query} onChange={e=>onQueryChange(e.target.value)} placeholder={s.commandPlaceholder}/>
      {children}
    </BaseDialog.Popup>
    </BaseDialog.Viewport>
    </BaseDialog.Portal>
  </BaseDialog.Root>;
}
