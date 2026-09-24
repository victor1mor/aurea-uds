"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {useRef, type HTMLAttributes, type RefAttributes, type ReactNode, type ReactElement} from "react";
import {Tabs as BaseTabs} from "@base-ui/react/tabs";
import {Autocomplete as BaseAutocomplete} from "@base-ui/react/autocomplete";
import {useValorResponsivo} from "./responsivo-runtime.js";
import {type Responsive} from "./pure.js";
import {cx, useAureaStrings, usePortalContainer} from "./internal.js";
import {Kbd} from "./markup.js";
import {Icon, type IconName} from "./system.js";
import {Button} from "./actions.js";
import {Badge} from "./feedback.js";
import {SearchField} from "./inputs.js";
// `overlays` PASSOU A VIR ANTES de `navigation` no DAG (18/08/2026, MAP.md §DAG). Ele só
// importa `internal`, `system` e `actions` — todos anteriores —, então não há ciclo: o que
// mudou foi a ORDEM documentada, que colocava overlays no "resto" sem motivo medido.
import {Tooltip} from "./overlays.js";

// Stepper (Lote 2 do BUILDING.md). Registro honesto da pesquisa: das QUATRO referências locais,
// NENHUMA tem stepper — nem o Base UI, nem o shadcn, nem o Untitled, nem o Kibo. A única fonte
// é o MUI, e a própria página deles diz que o Material Design parou de documentar o padrão. Ou
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
// na etapa atual, que é o que o MUI também faz.
export type StepState="default"|"active"|"done"|"error";
export interface StepItem{label:ReactNode;state?:StepState;optional?:ReactNode;onClick?:()=>void}
export function Stepper({items,label,className}:{items:StepItem[];label?:string;className?:string}){
const s=useAureaStrings();
return <div role="list" aria-label={label??s.stepperLabel} className={cx("stepper",className)}>
{items.map((it,n)=>{const st=it.state??"default";
const marca=st==="done"?<Icon name="checkmark"/>:st==="error"?<Icon name="error"/>:n+1;
const miolo=<><span className="step-dot">{marca}</span><strong>{it.label}</strong>{it.optional&&<small className="step-optional">{it.optional}</small>}</>;
return <div key={n} role="listitem" className={cx("step",st!=="default"&&`step-${st}`)} aria-current={st==="active"?"step":undefined}>
{it.onClick?<button type="button" className="step-trigger" onClick={it.onClick}>{miolo}</button>:miolo}
</div>})}
</div>}

export function Breadcrumb({items,label}:{items:Array<{label:ReactNode;href?:string}>;label?:string}){const s=useAureaStrings();return <nav className="breadcrumb" aria-label={label??s.breadcrumbLabel}>{items.map((i,n)=><React.Fragment key={n}>{n>0&&<Icon name="chevron--right" size="sm"/>} {i.href?<a href={i.href}>{i.label}</a>:<strong aria-current="page">{i.label}</strong>}</React.Fragment>)}</nav>}
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
export function Tabs({tabs,value,onChange,label,orientation,activateOnFocus=true,loopFocus}:{tabs:Array<{id:string;label:ReactNode;content:ReactNode}>;value:string;onChange:(id:string)=>void;label?:string;orientation?:Responsive<TabsOrientation>;activateOnFocus?:boolean;loopFocus?:boolean}){const s=useAureaStrings();const ancora=useRef<HTMLDivElement|null>(null);const resolvida=useValorResponsivo(orientation,"horizontal",ancora);return <BaseTabs.Root ref={ancora} value={value} onValueChange={v=>onChange(String(v))} orientation={resolvida} className="tabs-root"><BaseTabs.List className="tabs" aria-label={label??s.tabsLabel} activateOnFocus={activateOnFocus} loopFocus={loopFocus}>{tabs.map(t=><BaseTabs.Tab key={t.id} value={t.id} className="tab">{t.label}</BaseTabs.Tab>)}</BaseTabs.List>{tabs.map(t=><BaseTabs.Panel key={t.id} value={t.id} className="card card-inset" tabIndex={0}>{t.content}</BaseTabs.Panel>)}</BaseTabs.Root>}
export function Pagination({page,total,onPageChange}:{page:number;total:number;onPageChange:(p:number)=>void}){const s=useAureaStrings();return <nav className="pagination" aria-label={s.paginationLabel}><Button variant="ghost" size="sm" disabled={page<=1} onClick={()=>onPageChange(page-1)}>{s.previous}</Button><Badge variant="primary">{page} / {total}</Badge><Button variant="ghost" size="sm" disabled={page>=total} onClick={()=>onPageChange(page+1)}>{s.next}</Button></nav>}


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
<p className="toc-label">{label??s.tocLabel}</p>
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
export interface TreeNode{id:string;label:ReactNode;icon?:IconName;children?:TreeNode[]}
type FlatNode={node:TreeNode;level:number;parentId?:string};
function flattenVisible(nodes:TreeNode[],expanded:Set<string>,level=1,parentId?:string,acc:FlatNode[]=[]):FlatNode[]{
  for(const node of nodes){
    acc.push({node,level,parentId});
    if(node.children?.length&&expanded.has(node.id))flattenVisible(node.children,expanded,level+1,node.id,acc);
  }
  return acc;
}
export function TreeView({items,defaultExpandedIds,onSelect,label,className}:{items:TreeNode[];defaultExpandedIds?:string[];onSelect?:(node:TreeNode)=>void;label?:string;className?:string}){
  const s=useAureaStrings();
  const baseId=React.useId();
  const [expanded,setExpanded]=React.useState(()=>new Set(defaultExpandedIds));
  const [selected,setSelected]=React.useState<string|undefined>();
  const [active,setActive]=React.useState<string|undefined>(()=>items[0]?.id);
  const rootRef=React.useRef<HTMLUListElement>(null);
  const visible=flattenVisible(items,expanded);
  // Roving tab stop derivado: se o nó ativo saiu do conjunto visível (dados
  // trocados, nó removido), o primeiro visível volta a ser tabulável — senão a
  // árvore inteira fica tabIndex=-1 e some da ordem do Tab (auditoria, MÉDIO 1).
  const effectiveActive=active!==undefined&&visible.some(v=>v.node.id===active)?active:visible[0]?.node.id;
  const focusId=(id:string)=>{setActive(id);(rootRef.current?.querySelector(`[data-tree-id="${CSS.escape(id)}"]`) as HTMLElement|null)?.focus()};
  const toggle=(id:string,open:boolean)=>setExpanded(prev=>{const n=new Set(prev);if(open)n.add(id);else n.delete(id);return n});
  const select=(node:TreeNode)=>{setSelected(node.id);onSelect?.(node)};
  const onKeyDown=(e:React.KeyboardEvent<HTMLUListElement>)=>{
    const idx=visible.findIndex(v=>v.node.id===effectiveActive);
    if(idx<0)return;
    const cur=visible[idx],hasChildren=!!cur.node.children?.length,isOpen=expanded.has(cur.node.id);
    const rtl=getComputedStyle(e.currentTarget).direction==="rtl";
    const expandKey=rtl?"ArrowLeft":"ArrowRight",collapseKey=rtl?"ArrowRight":"ArrowLeft";
    switch(e.key){
      case "ArrowDown":e.preventDefault();if(idx<visible.length-1)focusId(visible[idx+1].node.id);break;
      case "ArrowUp":e.preventDefault();if(idx>0)focusId(visible[idx-1].node.id);break;
      case expandKey:e.preventDefault();if(hasChildren&&!isOpen)toggle(cur.node.id,true);else if(hasChildren&&isOpen)focusId(cur.node.children![0].id);break;
      case collapseKey:e.preventDefault();if(hasChildren&&isOpen)toggle(cur.node.id,false);else if(cur.parentId)focusId(cur.parentId);break;
      case "Home":e.preventDefault();focusId(visible[0].node.id);break;
      case "End":e.preventDefault();focusId(visible[visible.length-1].node.id);break;
      case "Enter":case " ":e.preventDefault();select(cur.node);if(hasChildren)toggle(cur.node.id,!isOpen);break;
    }
  };
  const renderNodes=(nodes:TreeNode[],level:number):ReactElement=>(
    <ul ref={level===1?rootRef:undefined} className={cx(level===1?"tree":"tree-group",level===1&&className)} role={level===1?"tree":"group"} aria-label={level===1?(label??s.treeLabel):undefined} onKeyDown={level===1?onKeyDown:undefined}>
      {nodes.map(node=>{
        const hasChildren=!!node.children?.length,isOpen=expanded.has(node.id),isSelected=selected===node.id,labelId=baseId+node.id;
        return <li key={node.id} className="tree-item" role="treeitem" data-tree-id={node.id} aria-level={level} aria-expanded={hasChildren?isOpen:undefined} aria-selected={isSelected} aria-labelledby={labelId} tabIndex={node.id===effectiveActive?0:-1}>
          <span className="tree-node" data-selected={isSelected||undefined} style={{paddingInlineStart:`calc(var(--space-3) + ${level-1} * var(--space-4))`}}
            onClick={()=>{focusId(node.id);select(node);if(hasChildren)toggle(node.id,!isOpen)}}>
            {hasChildren?<Icon name="chevron--right" size="sm" className="tree-twist"/>:<span className="tree-indent" aria-hidden="true"/>}
            {node.icon&&<Icon name={node.icon} size="sm"/>}
            <span id={labelId} className="tree-label">{node.label}</span>
          </span>
          {hasChildren&&isOpen&&renderNodes(node.children!,level+1)}
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
export interface SidebarItem{id:string;label:ReactNode;href?:string;icon?:IconName;badge?:ReactNode;onClick?:()=>void;items?:SidebarItem[]}
type SidebarCtx={baseId:string;current?:string;collapsed?:boolean};
function sidebarList(items:SidebarItem[],ctx:SidebarCtx,sub?:boolean,labelledBy?:string):ReactElement{
return <ul className={cx("sidebar-list",sub&&"sidebar-sub")} aria-labelledby={labelledBy}>
{items.map(it=>{
const lid=ctx.baseId+it.id;
const filhos=it.items?.length?it.items:undefined;
// Rótulo escondido vira `.sr-only` em vez de sumir do DOM: na lateral recolhida o item
// continua tendo nome para quem usa leitor de tela. Ícone sozinho não nomeia nada.
const oculto=(no:ReactNode)=>ctx.collapsed?<span className="sr-only">{no}</span>:no;
if(filhos&&!it.href&&!it.onClick)return <li key={it.id}>
<p id={lid} className={cx("sidebar-group-label",ctx.collapsed&&"sr-only")}>{it.label}</p>
{sidebarList(filhos,ctx,false,lid)}
</li>;
const ativo=it.id===ctx.current;
const miolo=<>{it.icon&&<Icon name={it.icon}/>}<span className={cx("sidebar-label",ctx.collapsed&&"sr-only")}>{it.label}</span>{it.badge!=null&&oculto(it.badge)}</>;
const alvo=it.href
?<a id={lid} href={it.href} className="sidebar-item" aria-current={ativo?"page":undefined} onClick={it.onClick}>{miolo}</a>
:<button id={lid} type="button" className="sidebar-item" aria-current={ativo?"page":undefined} onClick={it.onClick}>{miolo}</button>;
// NO TRILHO O NOME SÓ EXISTE NO TOOLTIP. Recolhida, a lateral manda o rótulo para `.sr-only`: quem
// usa leitor de tela continua ouvindo, e quem ENXERGA fica com um ícone mudo. A referência resolve
// isso com tooltip no `NavButton`, e é o que falta para um trilho de ícone não virar adivinhação.
// Só quando recolhida: com o rótulo visível ao lado, o tooltip repetiria o que já está na tela.
// `side="right"` porque a lateral encosta na borda esquerda — para cima o balão sairia do trilho.
return <li key={it.id}>
{ctx.collapsed?<Tooltip content={it.label} side="right">{alvo}</Tooltip>:alvo}
{filhos&&sidebarList(filhos,ctx,true,lid)}
</li>;
})}
</ul>;
}
// `variant` entrou em 18/08/2026, e nasceu com o PADRÃO TROCADO: a lateral virou rente para todo
// mundo. O Victor separou as duas coisas em 20/08/2026 — a exceção que ele abriu é para a lateral
// PODER ser rente, não para a Aurea deixar de flutuar: "o nosso vai ser tudo flutuante mas isso
// não impede da gente ter outras variações para as pessoas que nos acharem no npm usarem".
// Então `floating` é o padrão (o desenho da `0.3.0`, que segue publicado sem quebra) e `flush` é a
// variante — a ÚNICA exceção à caixa flutuante desta casa, medida em quatro aplicativos que rodam
// na mão: Cloudflare, Sophos, o app do Claude e o painel do HeroUI. Ver ADR-0034.
export type SidebarVariant="floating"|"flush";
// A GAVETA FECHA AO ESCOLHER (A-06, 23/09/2026). Abaixo de lg a lateral do `AppShell` é popover,
// e a biblioteca a abria e NUNCA a fechava por código: `hidePopover` tinha zero ocorrências. O
// usuário tocava "Relatórios", a página trocava por baixo e a gaveta ficava na frente dela. Material 3,
// Fluent 2 e o guia de gaveta do iOS fecham ao escolher. O fechamento mora NA LATERAL, e não no
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
export function Sidebar({items,current,collapsed,variant="floating",label,children,className,onClick,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{items?:SidebarItem[];current?:string;collapsed?:boolean;variant?:SidebarVariant;label?:string}){
const s=useAureaStrings();
const baseId=React.useId();
return <aside className={cx("sidebar",variant!=="floating"&&`sidebar-${variant}`,collapsed&&"sidebar-collapsed",className)} onClick={e=>{onClick?.(e);fecharGavetaAoEscolher(e)}} {...props}>
{items&&items.length>0&&<nav className="sidebar-nav" aria-label={label??s.sidebarLabel}>{sidebarList(items,{baseId,current,collapsed})}</nav>}
{children}
</aside>}
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
// levam a lugar nenhum. Foi o que a MUI evita por baixo (a dela é `<div>` de botões) e o que
// a KendoReact escreve por cima: o contêiner é landmark `<nav>`, o item é link.
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
export type BottomNavIndicator="none"|"subtle"|"pill"|"circle"|"circle-raised"|"circle-bold"|"circle-outline";
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
export function BottomNav({items,current,variant="floating",indicator="none",width="full",label,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>&{items:SidebarItem[];current?:string;variant?:BottomNavVariantAny;indicator?:BottomNavIndicator;width?:BottomNavWidth;label?:string}){
const s=useAureaStrings();
const [layout,marca0]=variant in LEGADO?LEGADO[variant as BottomNavVariantLegacy]:[variant as BottomNavVariant,indicator];
// O indicador explícito ganha do que o nome legado implica: quem escreveu os dois quis os dois.
const ind=indicator!=="none"?indicator:marca0;
return <nav className={cx("bottom-nav",layout==="edge"&&"bottom-nav-edge",layout!=="edge"&&width==="content"&&"bottom-nav-content",`bottom-nav-ind-${ind}`,className)} aria-label={label??s.bottomNavLabel} {...props}>
{items.map(it=>{
const ativo=it.id===current;
// O CONTADOR PENDURA NO ÍCONE, e é por isso que existe esta caixa. Pendurado no ITEM (a
// primeira versão), `50%` cai no meio do RÓTULO quando o item é linha — o Victor viu o número
// cobrir o nome inteiro em 17/08/2026. A pesquisa (Material 3 e os guias de barra de abas do
// iOS) diz a mesma coisa: canto superior do ÍCONE, encostando na borda dele, nunca sobre o
// texto. A caixa é o que dá ao contador um canto para se ancorar — e nos quatro indicadores
// redondos é ela que VIRA o círculo, com o rótulo embaixo, fora dele.
// `size="lg"` porque a proporção contra o contador foi medida: 24 para 16, razão 0,67.
const marca=<span className="bottom-nav-mark">
{it.icon&&<Icon name={it.icon} size="lg"/>}
{it.badge!=null&&<span className="bottom-nav-badge">{it.badge}</span>}
</span>;
const miolo=<>{marca}<span className="bottom-nav-label">{it.label}</span></>;
return it.href
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
// A SEGUNDA LINHA veio da REFERÊNCIA, não da minha cabeça: o `ListItemText` da MUI tem `primary`
// e `secondary`, e tela de ajustes real usa as duas ("Notifications" / "Push, email"). Das nove
// pastas de `Referencia/`, a MUI é a única com o componente maduro — o `base-ui`, que é o motor
// que já usamos, só tem `useCompositeListItem`, que é navegação de MENU por teclado e não isto.
//
// O QUE NÃO ENTROU da MUI, pelo passo 5 do `BUILDING.md`: `dense`, `disableGutters`,
// `alignItems`, `disableTypography`, `inset`, `autoFocus` e o `component` polimórfico. Os sete
// existem por causa do sistema de estilo e de densidade DELA; aqui a densidade é global e o
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
export interface NavListItem{id:string;label:ReactNode;description?:ReactNode;value?:ReactNode;icon?:IconName;href?:string;onClick?:()=>void;disabled?:boolean}
export function NavList({items,className,...props}:HTMLAttributes<HTMLUListElement>&RefAttributes<HTMLUListElement>&{items:NavListItem[]}){
return <ul className={cx("nav-list",className)} {...props}>
{items.map(it=>{
const miolo=<>
{it.icon&&<Icon name={it.icon}/>}
<span className="nav-list-text">
<span className="nav-list-label">{it.label}</span>
{it.description!=null&&<span className="nav-list-description">{it.description}</span>}
</span>
{it.value!=null&&<span className="nav-list-value">{it.value}</span>}
{it.href&&<Icon name="chevron--right" size="sm" className="nav-list-chevron"/>}
</>;
return <li key={it.id}>{it.href&&!it.disabled
?<a href={it.href} className="nav-list-row" onClick={it.onClick}>{miolo}</a>
:<button type="button" className="nav-list-row" aria-disabled={it.disabled||undefined} onClick={it.disabled?undefined:it.onClick}>{miolo}</button>}</li>;
})}
</ul>}

// A MARCA mora no topo (decisão do Victor, 23/07/2026): o topo atravessa toda a largura
// e a lateral começa abaixo dele. Por isso o Topbar é sempre renderizado pelo AppShell —
// ele carrega a marca, então não é mais opcional; opcional é o CONTEÚDO dele.
import type {TopbarVariant} from "./markup.js";
export interface CommandItem{id:string;label:string;icon?:IconName;kbd?:string;run:()=>void}
export function CommandPalette({open,onClose,items,placeholder,label}:{open:boolean;onClose:()=>void;items:CommandItem[];placeholder?:string;label?:string}){
  const s=useAureaStrings();
  const portal=usePortalContainer();
  if(!open)return null;
  // SEM AGRUPAMENTO na v1, e a medição é que decidiu (13/08/2026). O `Autocomplete.Root` não
  // consome a estrutura agrupada como o `Combobox.Root` consome — e o caminho alternativo, dar a
  // cada `Group` a sua fatia de itens, PASSA POR CIMA do filtro do motor: digitar "the" devolvia
  // os três comandos. Entre agrupar e filtrar, filtrar é o ponto de uma paleta de comandos.
  // Fica registrado como limite, não como esquecimento: quando alguém precisar de grupo aqui, o
  // caminho é o `Combobox.Root`, e isso é troca de motor, não ajuste.
  const executa=(item:CommandItem)=>{onClose();item.run()};
  const linha=(item:CommandItem)=><BaseAutocomplete.Item key={item.id} value={item} className="menu-item command-item" onClick={()=>executa(item)}>
    {item.icon&&<Icon name={item.icon}/>}
    <span className="command-item-label">{item.label}</span>
    {item.kbd&&<Kbd>{item.kbd}</Kbd>}
  </BaseAutocomplete.Item>;
  // Escape fecha, e é o teclado que a pessoa tenta primeiro. O motor não fecha sozinho porque
  // quem é dono do `open` é o consumidor — mesma regra do Dialog e do Drawer daqui.
  return <div className="command-overlay" onKeyDown={e=>{if(e.key==="Escape")onClose()}}>
    <div className="command-palette" role="dialog" aria-label={label??s.commandLabel}>
      {/* O `as` é sobre TIPO, não sobre comportamento: o motor aceita a estrutura agrupada em
          tempo de execução — é o mesmo caminho que o `MultiCombobox` daqui já usa, e o teste de
          grupo prova —, mas o genérico do `Root` fica preso em `CommandItem` por causa do
          `itemToStringValue`. Sem isto, ou se mente no tipo do item, ou se perde o agrupamento. */}
      <BaseAutocomplete.Root items={items} itemToStringValue={(i:CommandItem)=>i.label} mode="list" open>
        {/* Escape no INPUT, e não no contêiner: o foco nasce aqui dentro e o motor trata a tecla
            antes de ela subir. `onOpenChange` não serve — o tipo do Autocomplete o remove. */}
        <BaseAutocomplete.Input autoFocus className="input" onKeyDown={e=>{if(e.key==="Escape")onClose()}} aria-label={placeholder??s.commandPlaceholder} placeholder={placeholder??s.commandPlaceholder}/>
        {/* Portal > Positioner > Popup, e NÃO a lista solta ao lado do input. A primeira versão
            pulava as três peças porque a paleta já é a sua própria caixa — e o gate de axe pegou
            o preço: um `role="combobox"` com `aria-expanded="true"` EXIGE `aria-controls`, e
            quem o liga é a composição do motor. Sem ela saíam duas violações: o input sem o
            atributo obrigatório e a lista sem nome acessível. Medido em 14/08/2026. */}
        <BaseAutocomplete.Portal container={portal}>
          <BaseAutocomplete.Positioner sideOffset={6} className="command-positioner">
            <BaseAutocomplete.Popup className="menu command-list">
              <BaseAutocomplete.Empty className="combobox-empty">{s.comboboxEmpty}</BaseAutocomplete.Empty>
              <BaseAutocomplete.List>
                <BaseAutocomplete.Collection>{linha}</BaseAutocomplete.Collection>
              </BaseAutocomplete.List>
            </BaseAutocomplete.Popup>
          </BaseAutocomplete.Positioner>
        </BaseAutocomplete.Portal>
      </BaseAutocomplete.Root>
    </div>
  </div>;
}
export function CommandPaletteShell({open,query,onQueryChange,children}:{open:boolean;query:string;onQueryChange:(v:string)=>void;children?:ReactNode}){const s=useAureaStrings();if(!open)return null;return <div className="command-overlay"><div className="command-palette" role="dialog" aria-label={s.commandLabel}><SearchField autoFocus aria-label={s.commandPlaceholder} value={query} onChange={e=>onQueryChange(e.target.value)} placeholder={s.commandPlaceholder}/>{children}</div></div>}
