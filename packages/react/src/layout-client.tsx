"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {useEffect, useRef, useState, useSyncExternalStore, type HTMLAttributes, type RefAttributes, type ReactNode} from "react";
import {Separator as BaseSeparator} from "@base-ui/react/separator";
import {useDirection} from "@base-ui/react/direction-provider";
import {cx, useAureaStrings} from "./internal.js";
import {type Orientation, type Responsive} from "./pure.js";
import {useValorResponsivo} from "./responsivo-runtime.js";
import {ESCALA} from "./escala.js";
import {IconButton, type IconButtonProps} from "./actions.js";
import {Tooltip} from "./overlays.js";
import {Icon} from "./system.js";
import {Sidebar, Header, type HeaderVariant, type HeaderTab, type SidebarVariant, type SidebarScrollbar, type SidebarEntry, type SidebarCollapsible, type SidebarIndicator} from "./navigation.js";

// ── Auxiliar de topo: mora ANTES do primeiro export, e a posição é obrigatória ───────────────
// O check 22 mede o corpo de um componente do `export` dele até o PRÓXIMO export — fatia longa
// de propósito, porque a implementação de vários componentes daqui continua num auxiliar não
// exportado logo abaixo (a `Sidebar` é o caso: o `aria-current` dela mora num). Encurtar a fatia
// foi tentado em 09/08/2026 e a prova contra o defeito recusou: a `Sidebar` com `states: []`
// deixava de ser acusada.
// Consequência: auxiliar escrito ENTRE dois exports é lido como parte do componente anterior.
// Esta função tem `button:not([disabled])` num seletor, e o `\bdisabled\b` da regra acusou o
// `Grid` de emitir estado que ele não emite. Escrita aqui em cima, não pertence à fatia de
// ninguém. **Auxiliar de topo em módulo de componente vem antes dos exports.**
//
// O que ela faz e por que existe: o popover nativo não entrega a mesma gestão de foco nos três
// motores, e a tabela medida está no `aurea.js` do core. As mesmas cinco linhas moram lá, e a
// repetição é deliberada porque são DOIS RUNTIMES, não dois desenhos — o do core é delegado e
// serve página estática e consumo vanilla (é o que o catálogo carrega); este serve quem instala
// só o `@aurea-uds/react`, que importa o CSS do core e nunca o JS dele. Rodar os dois é
// inofensivo: focar o mesmo elemento duas vezes não faz nada.
//
// A comparação é com `"closed"` e NÃO com `"open"`, e isso é cicatriz — não simplifique de
// volta. O `ToggleEvent.newState` só tem esses dois valores, então as duas formas são idênticas
// em efeito; a diferença é no GATE. O check 15 trata qualquer string do fonte como possível nome
// de classe (de propósito: a versão estrita não vê `badge-${variant}` e quase fez o D1 apagar
// classes vivas). Com o literal `"open"` aqui, a `.drawer-wrap.open` do core — resto morto da
// página vanilla removida na Parte D — passava a parecer PRODUZIDA pela biblioteca, e a catraca
// queria travar um ganho falso.
function focoDaGaveta(e:{currentTarget:HTMLElement;newState?:string}){
  const gaveta=e.currentTarget;
  // Primeiro focável de DENTRO, não a gaveta: o WebKit não entra no conteúdo do popover pelo
  // Tab nem com o foco no elemento dele — medido no K1.
  if(e.newState!=="closed"){
    const primeiro=gaveta.querySelector<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
    if(primeiro)primeiro.focus(); else {gaveta.tabIndex=-1;gaveta.focus()}
    return;
  }
  // Só devolve o foco se ele ficou órfão; se a pessoa já o moveu, puxá-lo de volta seria roubo.
  if(document.activeElement===document.body||gaveta.contains(document.activeElement))
    (document.querySelector(`[popovertarget="${gaveta.id}"]`) as HTMLElement|null)?.focus();
}


// API pública intacta: as props seguem brand/navigation/topbar. O que mudou é ONDE a
// marca sai — no topo, não na lateral. `topbarVariant` escolhe a pele do topo; o shell
// precisa saber porque a lateral se encaixa abaixo dele (o `flush` não tem folga em
// cima, então ela sobe um --space-4). `pill` é cabeçalho de site — não é pra shell.
// A lateral RECOLHE em tela estreita: o <aside> é um popover nativo e o botão é o invoker. O
// navegador entrega Escape, clique fora e o `aria-expanded` no disparador. Era o achado A8: em
// 375px o `h1` da página começava 4,6 telas abaixo, depois dos 65 itens da navegação.
// Não-modal de propósito, como o CommandPaletteShell: o foco não fica preso, e por isso não
// declaramos modalidade que não entregamos.
//
// ATÉ 09/08/2026 ESTE COMENTÁRIO DIZIA "sem uma linha de JavaScript" E QUE O NAVEGADOR TAMBÉM
// ENTREGAVA A VOLTA DO FOCO. Entregava — no Chromium, que era o único motor onde a suíte
// rodava. O item K1 pôs Firefox e WebKit no `playwright.config.ts` e a medição derrubou a
// frase: no WebKit o foco vai para o <body> ao abrir, OITO Tabs não entram na gaveta e o
// Escape não devolve nada. Gaveta aberta e inalcançável por teclado é WCAG 2.1.1.
// A gestão de foco agora é NOSSA, igual nos três motores — `focoDaGaveta`, abaixo.
// Id fixo em vez de useId: um documento tem UM AppShell (ele é dono do <main>), então não há
// colisão possível — e o CSS e o gate precisam de um alvo estável.
// `sidebarCollapsed` é CONTROLADO pelo consumidor, como o `open` do CommandPaletteShell: o
// shell não decide quando recolher nem desenha o botão que recolhe — quem sabe se há espaço,
// e se a preferência se guarda, é a aplicação. O shell encolhe o painel para --sidebar-rail e,
// quando ele flutua, preserva as duas margens na coluna (as regras `:has()` no core).
// `sidebarVariant` existe porque SEM ELE a variante da lateral é enfeite. Medido em 20/08/2026: o
// shell chamava `<Sidebar>` sem variante nenhuma, então quem monta por aqui — que é o caminho
// normal, e é como as 106 páginas do catálogo são montadas — recebia o padrão e ponto. A variante
// estava documentada no CHANGELOG como saída para quem instalou a `0.3.0`, e a porta estava
// trancada. É o par do `topbarVariant`, que já existia logo acima. Ver ADR-0034.
// O alvo do link de pular. Mesmo raciocínio do id da navegação: um documento tem UM AppShell,
// então id fixo é estável e não colide. Sem alvo estável não há como o link existir.
const SHELL_MAIN_ID="aurea-shell-main";
const SHELL_NAV_ID="aurea-shell-nav";
// A GAVETA NÃO SOBREVIVE À SUBIDA PARA O DESKTOP (A-07, 23/09/2026). Aberta em tela estreita e
// alargada a janela, ela ficava no top layer — que é estado do DOM, e nenhuma media query tira um
// elemento de lá —, flutuando fora de posição, sem véu, e com o botão que a fecharia escondido pelo
// CSS acima de lg. Girar um tablet ou encaixar a janela de lado no Windows bastava. O número é o
// `ESCALA.lg`, gerado dos tokens pela mesma leitura que escreve o `@media (max-width:1023px)` do
// core: um número só, e o `consumidores-lote1.test` cobra que o do `aurea.js` é o mesmo.
// No `layout="docs"` (lote U, 19/10/2026) a lateral é coluna desde 768 (`ESCALA.md`), como a da documentação da
// referência, e o índice, que abaixo de 1280 é a gaveta da barra do índice, volta a ser coluna em 1280 (`ESCALA.xl`): cada
// gaveta fecha no corte DELA.
const SHELL_TOC_ID="aurea-shell-toc";
function useGavetaFechaNoDesktop(docs=false){
  useEffect(()=>{
    if(typeof window==="undefined"||typeof window.matchMedia!=="function")return;
    const fechar=(id:string)=>(e:{matches:boolean})=>{
      if(!e.matches)return;
      const gaveta=document.getElementById(id);
      try{if(gaveta?.matches(":popover-open"))gaveta.hidePopover()}catch{/* motor sem popover */}
    };
    const pares:[MediaQueryList,(e:{matches:boolean})=>void][]=[[window.matchMedia(`(min-width: ${docs?ESCALA.md:ESCALA.lg}px)`),fechar(SHELL_NAV_ID)]];
    if(docs)pares.push([window.matchMedia(`(min-width: ${ESCALA.xl}px)`),fechar(SHELL_TOC_ID)]);
    for(const [mq,f] of pares)mq.addEventListener?.("change",f);
    return ()=>{for(const [mq,f] of pares)mq.removeEventListener?.("change",f)};
  },[docs]);
}
// A LISTA DA LATERAL ENTRA PELO SHELL (A-03, 24/09/2026). O shell cria o `<Sidebar>` e só
// repassava `children`; quem queria a lista declarativa (`items` + `current`) tinha de passar OUTRO
// `<Sidebar>` como `navigation`, e saíam dois `<aside class="sidebar">` aninhados — duas bordas,
// dois fundos, dois raios de 22px. Com a escala de letras da 0.8.8 a caixa de dentro passou a CORTAR
// texto ("8.174" virava "8.17"), medido num app real a 1400px. `navItems`/`currentNavId` vão para o
// Sidebar que o shell já cria, e a caixa dupla deixa de ser o único caminho. `navigation` continua
// valendo para quem escreve a navegação à mão, e as duas se somam: a lista vem antes.
// B-10 (24/09/2026): `contentVariant="plain"` tira a caixa do `.content`. Ela é um cartão (mesmo
// fundo, borda e raio do `.card`), e todo `Card` lá dentro virava caixa dentro de caixa igual — um
// app gastou 14 `!important` para apagá-la. `surface`, a caixa, continua o padrão.
// B-07: `topbarDivider` repassa a linha de baixo para a barra `flush` que o shell monta.
// AN-01 (03/10/2026): O BOTÃO DE RECOLHER E A TRILHA SOZINHA. Um consumidor viu numa janela de 1508:
// a lateral sempre aberta, sem botão, e diminuir a janela não a recolhia — só virava gaveta abaixo de
// 1024. O modo trilha existia (`sidebarCollapsed`, `.sidebar-collapsed`), mas só controlado e sem
// gatilho. A referência é a lateral de uma das referências, que outra delas usa num dos seus exemplos
// (a referência principal não tem moldura de app): estado aberto/recolhido, controlado e não controlado, um gatilho, e o nome em
// dica na trilha. O lugar do botão é o que o Victor marcou: no alto, na junção do menu com o
// conteúdo. E a trilha sozinha em tela média vem do pedido — a referência não a tem.
//
// Tudo LIGADO por `sidebarCollapsible`: sem ele o shell é o de antes, e quem já usa
// `sidebarCollapsed` com o próprio botão não ganha um segundo.
const MEDIA_MEDIA=`(min-width: ${ESCALA.lg}px) and (max-width: ${ESCALA.xl-1}px)`;
const MEDIA_ESTREITA=`(max-width: ${ESCALA.lg-1}px)`;
// A largura pela API do navegador, e não por `resize`: o `useSyncExternalStore` dá a resposta certa
// já no primeiro desenho do lado do cliente, e no servidor (sem janela) diz "não" — a folha cuida da
// tela estreita sozinha, então o HTML do servidor não mostra nada errado.
function useLargura(query:string){
  return useSyncExternalStore(
    (avisar)=>{
      if(typeof window==="undefined"||typeof window.matchMedia!=="function")return ()=>{};
      const mq=window.matchMedia(query);
      mq.addEventListener?.("change",avisar);
      return ()=>mq.removeEventListener?.("change",avisar);
    },
    ()=>typeof window!=="undefined"&&typeof window.matchMedia==="function"&&window.matchMedia(query).matches,
    ()=>false);
}
// O BOTÃO DE RECOLHER AO LADO DO TÍTULO (MNT-34, 0.42.0) — o desenho das quinze laterais que o Victor aprovou (o botão
// de ícone, sem fundo, com o desenho de lateral, a 12 do título da página; *"quero o botão de recolher conforme eu tinha
// aprovado"*). No `layout="sidebar"` ele substitui a bolinha da junção: com a barra no conteúdo, o shell o põe no começo
// dela; sem barra, o app o põe ao lado do próprio título (`AppShell.SidebarToggle`). Abaixo de 1024 ele some — ali a
// lateral é gaveta, e quem abre é o botão da gaveta.
// Desde o bloco 2 (4-B, 25/10/2026), é o `Sidebar.Toggle`: o shell põe a lateral num `Sidebar.Provider`, e o botão lê o estado
// dele — o mesmo botão serve ao lado do título, dentro da lateral (ao lado da marca) e no pé, como linha.
function ProvedorDaLateral({ligado,children,...p}:{ligado:boolean;collapsed:boolean;onCollapsedChange:(v:boolean)=>void;collapsible?:SidebarCollapsible;shortcut:boolean;children?:ReactNode}){
  return ligado?<Sidebar.Provider id={SHELL_NAV_ID} {...p}>{children}</Sidebar.Provider>:<>{children}</>}
function AppShellSidebarToggle(props:Omit<IconButtonProps,"icon"|"label"|"onClick"|"variant">){return <Sidebar.Toggle {...props}/>}
export function AppShell({brand,navigation,navItems,currentNavId,navLabel,topbar,topbarVariant="floating",topbarDivider,topbarTabs,topbarCurrentTab,topbarTabsLabel,topbarTabsEnd,topbarActions,layout="app",sidebarVariant,sidebarScrollbar,sidebarFooter,sidebarCollapsed,sidebarCollapsible,sidebarToggle="edge",sidebarShortcut=true,sidebarIndicator,sidebarPanel,sidebarContrast,defaultSidebarCollapsed,onSidebarCollapsedChange,contentVariant="surface",aside,asideLabel,asideVariant,children,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{brand:ReactNode;navigation?:ReactNode;navItems?:SidebarEntry[];currentNavId?:string;navLabel?:string;topbar?:ReactNode;topbarVariant?:Exclude<HeaderVariant,"pill">;topbarDivider?:boolean;sidebarVariant?:SidebarVariant;
  /** O arranjo (lote T, 17/10/2026): `"app"` (o padrão, o de sempre) ou `"docs"`, o da documentação da referência — um
   *  bloco CENTRALIZADO de 1400 com a lateral de 220, o texto e o índice de 268 (de 1280 para cima), a barra de cima de 56
   *  com a linha das áreas (`topbarTabs`) embaixo. A lateral fica onde a variante dela mandar (`plain`: sem caixa).
   *  `"sidebar"` (MNT-34, 0.42.0): a lateral até o topo, com a marca (`brand`) no topo dela; a barra de cima só existe se o
   *  app passar `topbar`, e fica só em cima do conteúdo. Com `sidebarVariant` (flutuante ou de canto), as quatro formas da
   *  bancada; sem `layout`, a de sempre. */
  layout?:"app"|"docs"|"sidebar";
  /** O pé fixo da lateral (4-C): a pessoa e o sair (`Sidebar.User`), a lista curta (`Sidebar.Nav`). Só o meio rola. */
  sidebarFooter?:ReactNode;
  /** A segunda linha da barra de cima: as áreas do site, com ícone (o `tabs` do `Header`). */
  topbarTabs?:HeaderTab[];
  /** O `id` da área atual da segunda linha. */
  topbarCurrentTab?:string;
  /** O nome da segunda linha para o leitor de tela. Padrão: `"Sections"`. */
  topbarTabsLabel?:string;
  /** A ponta da linha das áreas (o `tabsEnd` do `Header`): a chave Web | Native da documentação. */
  topbarTabsEnd?:ReactNode;
  /** A PONTA DA BARRA DE CIMA (MNT-37): o que fica na outra ponta, longe da marca e do `topbar` — a chave de tema, a
   *  conta, o sino. É o `actions` do `Header`. No `layout="sidebar"` a barra do conteúdo passa a existir também quando o app
   *  passa só isto; no `"docs"`, o botão da gaveta continua o último, depois delas. */
  topbarActions?:ReactNode;
  /** 0.32.0: a barra de rolagem da lateral da esquerda — o `scrollbar` da `Sidebar`. Padrão `hover` (clara, só com o
   *  ponteiro em cima); `visible` é a barra sempre à vista. */
  sidebarScrollbar?:SidebarScrollbar;
  /** 0.32.0 (DOC-01): a coluna da DIREITA — o "Nesta página" de uma documentação (um `TableOfContents`).
   *  Mora numa `Sidebar placement="right"` do mesmo desenho da da esquerda. De 1280 para cima é a
   *  terceira coluna; abaixo, desce para depois do conteúdo. */
  aside?:ReactNode;
  /** O nome da coluna da direita para o leitor de tela. Padrão: a frase `tocLabel` ("On this page"). */
  asideLabel?:string;
  /** 0.32.0: a variante da coluna da direita. Padrão: a mesma da esquerda (`sidebarVariant`). `plain`
   *  tira a caixa — os itens soltos na página, como no "On this page" da documentação da referência. */
  asideVariant?:SidebarVariant;
  /** A lateral em trilha de ícones. Controlado: quem passa decide (e o `onSidebarCollapsedChange` avisa). */
  sidebarCollapsed?:boolean;
  /** AN-01: o botão de recolher na junção do menu com o conteúdo, e a trilha sozinha entre 1024 e 1279 de largura.
   *  Desde o bloco 2 (4-A), também o JEITO de recolher: `true` ou `"icon"` (a trilha), `"capsule"` (a trilha em cápsula) ou
   *  `"offcanvas"` (a lateral sai da tela). */
  sidebarCollapsible?:boolean|SidebarCollapsible;
  /** 4-B: onde o shell põe o botão de recolher. `"edge"` (o padrão): na junção da lateral com o conteúdo (no
   *  `layout="sidebar"`, no começo da barra do conteúdo). `"none"`: o shell não põe nenhum, e o app põe o `Sidebar.Toggle`
   *  onde quiser — dentro da lateral, ao lado da marca, ou no pé, como linha (`variant="item"`). */
  sidebarToggle?:"edge"|"none";
  /** 4-B: o atalho Ctrl+B (Cmd+B no Mac), que recolhe e abre a lateral (abaixo de 1024, abre e fecha a gaveta). Padrão:
   *  ligado, com `sidebarCollapsible`. Não age quando a pessoa está digitando num campo. */
  sidebarShortcut?:boolean;
  /** 4-H: o desenho do item atual da lateral (o `indicator` da `Sidebar`). */
  sidebarIndicator?:SidebarIndicator;
  /** 4-F e 4-G: a trilha das seções com o painel (o `panel` da `Sidebar`) — os itens do primeiro nível de `navItems` viram
   *  seções. `docked`: o painel ao lado (recolher esconde o painel); `overlay`: o painel abre por cima. */
  sidebarPanel?:"docked"|"overlay";
  /** A lateral de contraste (MNT-36): o `contrast` da `Sidebar` — escura nas duas telas. */
  sidebarContrast?:boolean;
  /** AN-01: começa recolhida, sem controlar. A escolha vale até a janela cruzar 1280. */
  defaultSidebarCollapsed?:boolean;
  /** AN-01: avisa cada troca — pelo botão, ou pela largura cruzando 1280. Guardar a preferência é do app. */
  onSidebarCollapsedChange?:(collapsed:boolean)=>void;
  contentVariant?:"surface"|"plain"}){const s=useAureaStrings();const docs=layout==="docs",lateral=layout==="sidebar";useGavetaFechaNoDesktop(docs);
  const controlado=sidebarCollapsed!==undefined;
  // O jeito de recolher (4-A): `true` é a trilha de sempre.
  const forma:SidebarCollapsible|undefined=sidebarCollapsible===true?"icon":sidebarCollapsible||undefined;
  const recolhe=!!forma;
  // `null` = ninguém escolheu, e vale a largura.
  const [escolha,setEscolha]=useState<boolean|null>(defaultSidebarCollapsed??null);
  const media=useLargura(MEDIA_MEDIA), estreita=useLargura(MEDIA_ESTREITA);
  const recolhida=controlado?!!sidebarCollapsed:(escolha??(recolhe&&media));
  // NA GAVETA A LATERAL NUNCA É TRILHA. Abaixo de 1024 ela abre por cima de tudo, com espaço para o
  // nome; recolhida ali, era uma gaveta de ícones sem nome — também para quem já passava
  // `sidebarCollapsed` (medido em 03/10/2026, na mesma conferência).
  const efetiva=recolhida&&!estreita;
  const aviso=useRef(onSidebarCollapsedChange);aviso.current=onSidebarCollapsedChange;
  // Cruzar 1280 é mudar de contexto: a escolha da pessoa sai e a largura volta a mandar. Pelo
  // evento do navegador, e não comparando desenhos, para a hidratação não contar como cruzamento.
  useEffect(()=>{
    if(!recolhe||typeof window==="undefined"||typeof window.matchMedia!=="function")return;
    const mq=window.matchMedia(MEDIA_MEDIA);
    const aoCruzar=(e:{matches:boolean})=>{if(!controlado)setEscolha(null);aviso.current?.(e.matches)};
    mq.addEventListener?.("change",aoCruzar);
    return ()=>mq.removeEventListener?.("change",aoCruzar);
  },[recolhe,controlado]);
  // QUEM MUDA O ESTADO: o botão da junção, o `Sidebar.Toggle` em qualquer lugar e o Ctrl+B passam todos por aqui (4-B).
  // Abaixo de 1024 a lateral é a gaveta: recolher ali é abrir ou fechar a gaveta, como o "mobile" da referência.
  const definir=(nova:boolean)=>{
    if(estreita){try{document.getElementById(SHELL_NAV_ID)?.togglePopover()}catch{/* motor sem popover */}return}
    if(!controlado)setEscolha(nova);onSidebarCollapsedChange?.(nova)};
  const alternar=()=>definir(!recolhida);
  const rotulo=efetiva?s.sidebarExpand:s.sidebarCollapse;
  // A seta aponta para onde a lateral vai: recolher é para o começo da linha, abrir é para o fim. Na
  // escrita da direita para a esquerda o começo é a direita — pela direção do provedor, e não por
  // `:dir(rtl)` na folha (ver a nota do `.sidebar-toggle` no core).
  // A condição vai escrita no `icon=` do botão, e não numa variável: é ali que o check 46 lê os
  // ícones que o shell desenha.
  const paraOComeco=!efetiva, direita=useDirection()==="rtl";
  // O BOTÃO DA GAVETA. No `layout="docs"` ele vai para o FIM da barra, depois das ações, como o da documentação da
  // referência no celular (o "Open Sidebar" à direita, 19/10/2026): ali ele vem por último também na ordem do Tab, e a
  // gaveta abre pelo mesmo lado (a folha). No shell de sempre, continua antes da marca.
  // No arranjo, o topo é o pequeno (`size="sm"`), e o botão também: com o tamanho de sempre ele ficava 4 maior que os
  // vizinhos e fora da linha deles (medido a 375, sem toque; com toque, todos sobem para 44).
  const botaoDaGaveta=<IconButton className="nav-toggle" icon="list" label={s.navigationToggle} popoverTarget={SHELL_NAV_ID} {...(docs?{size:"sm" as const}:{})}/>;
  return <div className={cx("app-shell",layout==="docs"&&"app-shell-docs",lateral&&"app-shell-lateral",!lateral&&topbarVariant==="flush"&&"app-shell-flush",recolhe&&"app-shell-collapsible",aside!=null&&"app-shell-with-aside",className)} {...props}>{/* O LINK DE PULAR, reportado no merge de 28/08/2026. Ele existia na outra linhagem e sumiu
    quando este arquivo entrou da `main`; quem denunciou foi o gate da fronteira do core, com
    `.skip-link` no CSS sem ninguém a emitir.
    É requisito de acessibilidade, não enfeite (WCAG 2.4.1, "pular blocos"): sem ele, quem navega
    por teclado atravessa a barra e a lateral inteiras antes de chegar ao conteúdo, em TODA página.
    O `<main>` ganha `id` e `tabIndex={-1}` porque um alvo de âncora que não é focável recebe a
    rolagem e não o FOCO — o leitor de tela continuaria lendo de onde estava. */}
<ProvedorDaLateral ligado={recolhe} collapsed={efetiva} onCollapsedChange={definir} collapsible={forma} shortcut={sidebarShortcut}><a className="skip-link" href={`#${SHELL_MAIN_ID}`}>{s.skipToContent}</a>{!lateral&&<Header variant={topbarVariant} divider={topbarDivider} tabs={topbarTabs} currentTab={topbarCurrentTab} tabsLabel={topbarTabsLabel} tabsEnd={topbarTabsEnd} {...(docs?{maxWidth:"docs" as const,size:"sm" as const}:{})} brand={docs?brand:<>{botaoDaGaveta}{brand}</>} actions={topbarActions!=null?<>{topbarActions}{docs&&botaoDaGaveta}</>:undefined}>{topbar}{docs&&topbarActions==null&&botaoDaGaveta}</Header>}{recolhe&&!lateral&&sidebarToggle!=="none"&&<div className="sidebar-toggle-slot"><Tooltip content={rotulo} side="right"><IconButton className="sidebar-toggle" size="xs" icon={paraOComeco===direita?"caret-right":"caret-left"} label={rotulo} aria-expanded={!efetiva} aria-controls={SHELL_NAV_ID} onClick={alternar}/></Tooltip></div>}<Sidebar id={SHELL_NAV_ID} popover="auto" variant={sidebarVariant} scrollbar={sidebarScrollbar} collapsed={efetiva} collapsible={forma} indicator={sidebarIndicator} panel={sidebarPanel} contrast={sidebarContrast} items={navItems} current={currentNavId} label={navLabel} onToggle={focoDaGaveta} header={lateral?brand:undefined} footer={sidebarFooter}>{navigation}</Sidebar>{docs&&aside!=null&&<div className="docs-toc-bar"><button type="button" className="docs-toc-toggle" popoverTarget={SHELL_TOC_ID}><Icon name="list-bullets"/><span className="docs-toc-current" data-toc-current="">{asideLabel??s.tocLabel}</span><Icon name="caret-down"/></button></div>}{lateral
?<div className="app-shell-column">{topbar!=null||topbarActions!=null
  ?<Header variant="flush" size="sm" divider={topbarDivider} brand={<>{botaoDaGaveta}{sidebarToggle!=="none"&&<AppShellSidebarToggle/>}</>} actions={topbarActions}>{topbar}</Header>
  :<div className="app-shell-narrow-bar">{botaoDaGaveta}{brand}</div>}{<main id={SHELL_MAIN_ID} tabIndex={-1} className={cx("content",contentVariant==="plain"&&"content-plain")}>{children}</main>}</div>
:<main id={SHELL_MAIN_ID} tabIndex={-1} className={cx("content",contentVariant==="plain"&&"content-plain")}>{children}</main>}{aside!=null&&<Sidebar placement="right" variant={asideVariant??sidebarVariant} className="app-shell-aside" aria-label={asideLabel??s.tocLabel} {...(docs?{id:SHELL_TOC_ID,popover:"auto" as const,onToggle:focoDaGaveta}:{})}>{aside}</Sidebar>}</ProvedorDaLateral></div>}
AppShell.SidebarToggle=AppShellSidebarToggle;

// ── Separator ────────────────────────────────────────────────────────────────────────────────
// A LINHA DO SISTEMA, e ela é de CLIENTE por necessidade, não por vizinhança.
//
// Ela já foi um <hr> com orientação estática, no `markup.tsx`. O merge das duas linhagens ficou
// com essa versão, e o gate `comportamental.multi-motor.spec.ts` reprovou: a prova das cinco
// capacidades do `G-AXIS-06` — a lista que o Victor especificou — cobra do separador
// `data-orientation` E `aria-orientation` resolvidos pela largura do CONTÊINER, e os dois são
// atributo. Atributo não sai de classe CSS. Eixo comportamental precisa de runtime.
//
// E O ELEMENTO CONTINUA SENDO UM <hr>. As duas exigências pareciam brigar — a suíte de unidade
// cobra `<hr>` sem `role` escrito ("ARIA redundante é pior que ARIA nenhuma", aviso do próprio
// APG), e a prova de contêiner cobra atributo resolvido em runtime. `render` resolve as duas:
// o motor calcula e publica sobre o elemento que a Aurea escolhe.
//
// `role={undefined}` e o `aria-orientation` explícito são o acerto fino, e foram MEDIDOS antes
// de escrever: por padrão o motor escreve `role="separator"` no <hr> (redundante — o <hr> já É
// separator) e escreve `aria-orientation` também no HORIZONTAL, que é o default implícito do
// papel. As duas props passadas aqui vencem as do motor, e sobra exatamente o que se quer:
//   vertical    → <hr data-orientation="vertical" aria-orientation="vertical" class="separator separator-vertical">
//   horizontal  → <hr data-orientation="horizontal" class="separator">
// C-04 (24/09/2026): `spacing` é a folga dos dois lados da linha, nos MESMOS três degraus do `gap`
// dos primitivos (ADR-0051) — um vocabulário só de espaçamento na casa. Padrão `none`: a linha não
// tinha folga nenhuma, e continua sem. Na vertical a folga vai para os lados, não para cima e baixo.
export type SeparatorSpacing="none"|"tight"|"normal"|"loose";
export function Separator({orientation,spacing="none",className,...props}:HTMLAttributes<HTMLHRElement>&RefAttributes<HTMLHRElement>&{orientation?:Responsive<Orientation>;spacing?:SeparatorSpacing}){
const ancora=useRef<HTMLHRElement|null>(null);
const resolvida=useValorResponsivo(orientation,"horizontal",ancora);
// O elenco existe porque o tipo do motor descreve os manipuladores sobre `HTMLDivElement` — ele
// não sabe que o `render` troca o elemento. O tipo PÚBLICO desta função é o certo: quem passar um
// `ref` recebe o <hr> que está de fato no DOM.
return <BaseSeparator ref={ancora} orientation={resolvida} render={<hr/>} role={undefined}
  aria-orientation={resolvida==="vertical"?"vertical":undefined}
  className={cx("separator",resolvida==="vertical"&&"separator-vertical",spacing!=="none"&&`separator-space-${spacing}`,className)}
  {...(props as HTMLAttributes<HTMLDivElement>)}/>}
